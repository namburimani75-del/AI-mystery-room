import Case from '../models/Case.js';
import { generateMysteryData, DIFFICULTY_CONFIG } from './geminiService.js';

// Build public case representation (safe for active investigation)
const buildPublicCase = (caseDoc) => {
  return {
    _id: caseDoc._id,
    title: caseDoc.title,
    story: caseDoc.story,
    premise: caseDoc.premise,
    difficulty: caseDoc.difficulty,
    status: caseDoc.status,
    currentScore: caseDoc.currentScore,
    suspects: caseDoc.suspects.map(s => ({
      id: s.id,
      name: s.name,
      occupation: s.occupation,
      description: s.description,
      publicMotive: s.publicMotive,
      alibi: s.alibi,
      background: s.background,
      // privateMotive intentionally excluded
    })),
    clues: caseDoc.clues.map(clue => {
      const isDiscovered = caseDoc.discoveredClueIds.includes(clue.id);
      return {
        id: clue.id,
        title: clue.title,
        isDiscovered,
        description: isDiscovered ? clue.description : null, // Only revealed when discovered
        category: clue.category,
      };
    }),
    hints: caseDoc.hints.map(hint => ({
      id: hint.id,
      isUsed: caseDoc.usedHintIds.includes(hint.id),
      text: caseDoc.usedHintIds.includes(hint.id) ? hint.text : null, // Only revealed when used
    })),
    discoveredClueIds: caseDoc.discoveredClueIds,
    usedHintIds: caseDoc.usedHintIds,
    hintsRemaining: caseDoc.hints.length - caseDoc.usedHintIds.length,
    totalClues: caseDoc.clues.length,
    totalHints: caseDoc.hints.length,
    progress: Math.round((caseDoc.discoveredClueIds.length / caseDoc.clues.length) * 100),
    createdAt: caseDoc.createdAt,
    updatedAt: caseDoc.updatedAt,
    // solution and accusation details NOT included in active case view
  };
};

// Build completed case representation (includes solution)
const buildCompletedCase = (caseDoc) => {
  const publicCase = buildPublicCase(caseDoc);
  const culprit = caseDoc.suspects.find(s => s.id === caseDoc.solution.culpritId);
  return {
    ...publicCase,
    accusation: caseDoc.accusation,
    finalScore: caseDoc.finalScore,
    completedAt: caseDoc.completedAt,
    solution: {
      culprit: culprit ? {
        id: culprit.id,
        name: culprit.name,
        occupation: culprit.occupation,
      } : null,
      motive: caseDoc.solution.motive,
      explanation: caseDoc.solution.explanation,
      supportingClueIds: caseDoc.solution.supportingClueIds,
      supportingClues: caseDoc.clues
        .filter(c => caseDoc.solution.supportingClueIds.includes(c.id))
        .map(c => ({ id: c.id, title: c.title, description: c.description })),
    },
  };
};

// Build list item (for case history)
const buildCaseListItem = (caseDoc) => ({
  _id: caseDoc._id,
  title: caseDoc.title,
  difficulty: caseDoc.difficulty,
  status: caseDoc.status,
  currentScore: caseDoc.currentScore,
  finalScore: caseDoc.finalScore,
  progress: Math.round((caseDoc.discoveredClueIds.length / caseDoc.clues.length) * 100),
  createdAt: caseDoc.createdAt,
  completedAt: caseDoc.completedAt,
  accusation: caseDoc.accusation ? { isCorrect: caseDoc.accusation.isCorrect } : null,
});

// Create a new mystery case
const createCase = async (premise, difficulty, playerId) => {
  // Generate mystery via Gemini
  const mysteryData = await generateMysteryData(premise, difficulty);

  // Initialize hints with isUsed flag
  const hints = mysteryData.hints.map(h => ({ ...h, isUsed: false }));
  const clues = mysteryData.clues.map(c => ({ ...c, isDiscovered: false }));

  const newCase = new Case({
    title: mysteryData.title,
    story: mysteryData.story,
    premise,
    difficulty,
    suspects: mysteryData.suspects,
    clues,
    hints,
    solution: mysteryData.solution,
    discoveredClueIds: [],
    usedHintIds: [],
    currentScore: 0,
    status: 'active',
    playerId,
  });

  await newCase.save();
  return buildPublicCase(newCase);
};

// Get all cases for a player
const getCases = async (playerId) => {
  const cases = await Case.find({ playerId }).sort({ createdAt: -1 }).lean();
  return cases.map(buildCaseListItem);
};

// Get single case
const getCaseById = async (caseId, playerId) => {
  const caseDoc = await Case.findOne({ _id: caseId, playerId });
  if (!caseDoc) return null;

  if (caseDoc.status === 'completed') {
    return buildCompletedCase(caseDoc);
  }
  return buildPublicCase(caseDoc);
};

// Discover a clue
const discoverClue = async (caseId, clueId, playerId) => {
  const caseDoc = await Case.findOne({ _id: caseId, playerId });
  if (!caseDoc) {
    return { error: 'Case not found', status: 404 };
  }
  if (caseDoc.status !== 'active') {
    return { error: 'This case is already completed', status: 400 };
  }

  const clue = caseDoc.clues.find(c => c.id === clueId);
  if (!clue) {
    return { error: 'Clue not found in this case', status: 404 };
  }

  // Check if already discovered (prevent duplicate points)
  const alreadyDiscovered = caseDoc.discoveredClueIds.includes(clueId);
  
  let scoreIncrease = 0;
  if (!alreadyDiscovered) {
    scoreIncrease = 5;
    // Use atomic update to prevent concurrent duplicate awards
    await Case.updateOne(
      { _id: caseId, playerId, discoveredClueIds: { $ne: clueId } },
      {
        $addToSet: { discoveredClueIds: clueId },
        $inc: { currentScore: 5 },
        $set: { [`clues.${caseDoc.clues.indexOf(clue)}.isDiscovered`]: true },
      }
    );
  }

  const updatedCase = await Case.findById(caseId);
  return {
    clue: {
      id: clue.id,
      title: clue.title,
      description: clue.description,
      category: clue.category,
      isDiscovered: true,
    },
    scoreIncrease,
    currentScore: updatedCase.currentScore,
    progress: Math.round((updatedCase.discoveredClueIds.length / updatedCase.clues.length) * 100),
    alreadyDiscovered,
  };
};

// Request a hint
const requestHint = async (caseId, playerId) => {
  const caseDoc = await Case.findOne({ _id: caseId, playerId });
  if (!caseDoc) {
    return { error: 'Case not found', status: 404 };
  }
  if (caseDoc.status !== 'active') {
    return { error: 'This case is already completed', status: 400 };
  }

  // Find an unused hint
  const unusedHint = caseDoc.hints.find(h => !caseDoc.usedHintIds.includes(h.id));
  if (!unusedHint) {
    return { error: 'No hints remaining', status: 400 };
  }

  // Atomic update to prevent concurrent duplicate deductions
  const result = await Case.findOneAndUpdate(
    { _id: caseId, playerId, usedHintIds: { $ne: unusedHint.id } },
    {
      $addToSet: { usedHintIds: unusedHint.id },
      $inc: { currentScore: -10 },
    },
    { new: true }
  );

  if (!result) {
    return { error: 'Could not apply hint (possible duplicate request)', status: 409 };
  }

  const newScore = Math.max(0, result.currentScore);
  // Ensure score doesn't go below 0
  if (result.currentScore < 0) {
    await Case.updateOne({ _id: caseId }, { $set: { currentScore: 0 } });
  }

  return {
    hint: { id: unusedHint.id, text: unusedHint.text },
    scoreDeduction: 10,
    currentScore: Math.max(0, result.currentScore),
    hintsRemaining: caseDoc.hints.length - result.usedHintIds.length,
  };
};

// Make an accusation
const makeAccusation = async (caseId, suspectId, playerId) => {
  const caseDoc = await Case.findOne({ _id: caseId, playerId });
  if (!caseDoc) {
    return { error: 'Case not found', status: 404 };
  }
  if (caseDoc.status !== 'active') {
    return { error: 'An accusation has already been made for this case', status: 400 };
  }

  const suspect = caseDoc.suspects.find(s => s.id === suspectId);
  if (!suspect) {
    return { error: 'Suspect not found in this case', status: 404 };
  }

  const isCorrect = suspectId === caseDoc.solution.culpritId;
  const config = DIFFICULTY_CONFIG[caseDoc.difficulty];
  const accusationBonus = isCorrect ? config.bonus : 0;
  const finalScore = Math.max(0, caseDoc.currentScore + accusationBonus);

  const accusation = {
    suspectId,
    suspectName: suspect.name,
    isCorrect,
    madeAt: new Date(),
  };

  await Case.updateOne(
    { _id: caseId, playerId },
    {
      $set: {
        accusation,
        finalScore,
        status: 'completed',
        completedAt: new Date(),
        currentScore: finalScore,
      },
    }
  );

  const updatedCase = await Case.findById(caseId);
  return buildCompletedCase(updatedCase);
};

// Get result of completed case
const getCaseResult = async (caseId, playerId) => {
  const caseDoc = await Case.findOne({ _id: caseId, playerId });
  if (!caseDoc) return null;
  if (caseDoc.status !== 'completed') {
    return { error: 'Case is not yet completed', status: 400 };
  }
  return buildCompletedCase(caseDoc);
};

// Delete a case
const deleteCase = async (caseId, playerId) => {
  const result = await Case.deleteOne({ _id: caseId, playerId });
  return result.deletedCount > 0;
};

export {
  createCase,
  getCases,
  getCaseById,
  discoverClue,
  requestHint,
  makeAccusation,
  getCaseResult,
  deleteCase,
};
