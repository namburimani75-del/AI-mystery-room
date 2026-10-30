import { z } from 'zod';

// Request validation schemas
export const createCaseSchema = z.object({
  premise: z.string().min(20, 'Premise must be at least 20 characters').max(1000, 'Premise too long'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  playerId: z.string().min(1, 'Player ID required').max(100),
});

export const discoverClueSchema = z.object({
  playerId: z.string().min(1),
});

export const requestHintSchema = z.object({
  playerId: z.string().min(1),
});

export const accuseSchema = z.object({
  suspectId: z.string().min(1, 'Suspect ID required'),
  playerId: z.string().min(1),
});

// AI response validation schemas
const suspectAISchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  occupation: z.string().min(1),
  description: z.string().min(10),
  publicMotive: z.string().min(5),
  privateMotive: z.string().min(5),
  alibi: z.string().min(5),
  background: z.string().min(10),
});

const clueAISchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(10),
  category: z.string().optional(),
});

const hintAISchema = z.object({
  id: z.string().min(1),
  text: z.string().min(10),
});

const solutionAISchema = z.object({
  culpritId: z.string().min(1),
  motive: z.string().min(10),
  explanation: z.string().min(30),
  supportingClueIds: z.array(z.string()).min(1),
});

export const createMysteryAIResponseSchema = (difficulty) => {
  const counts = {
    Easy: { suspects: 3, clues: 5, hints: 2 },
    Medium: { suspects: 4, clues: 7, hints: 3 },
    Hard: { suspects: 5, clues: 9, hints: 3 },
  };
  const { suspects: suspectCount, clues: clueCount, hints: hintCount } = counts[difficulty];

  return z.object({
    title: z.string().min(5, 'Title too short'),
    story: z.string().min(100, 'Story too short'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    suspects: z.array(suspectAISchema)
      .length(suspectCount, `Must have exactly ${suspectCount} suspects for ${difficulty}`),
    clues: z.array(clueAISchema)
      .length(clueCount, `Must have exactly ${clueCount} clues for ${difficulty}`),
    hints: z.array(hintAISchema)
      .length(hintCount, `Must have exactly ${hintCount} hints for ${difficulty}`),
    solution: solutionAISchema,
  }).superRefine((data, ctx) => {
    // Validate unique suspect IDs
    const suspectIds = data.suspects.map(s => s.id);
    if (new Set(suspectIds).size !== suspectIds.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Suspect IDs must be unique' });
    }

    // Validate unique clue IDs
    const clueIds = data.clues.map(c => c.id);
    if (new Set(clueIds).size !== clueIds.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Clue IDs must be unique' });
    }

    // Validate unique hint IDs
    const hintIds = data.hints.map(h => h.id);
    if (new Set(hintIds).size !== hintIds.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Hint IDs must be unique' });
    }

    // Validate culprit exists in suspects
    if (!suspectIds.includes(data.solution.culpritId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Culprit ID must match a suspect ID' });
    }

    // Validate supporting clues exist
    for (const clueId of data.solution.supportingClueIds) {
      if (!clueIds.includes(clueId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Supporting clue ID "${clueId}" not found in clues` });
      }
    }

    // Validate difficulty matches
    if (data.difficulty !== difficulty) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Difficulty mismatch: expected ${difficulty}` });
    }
  });
};
