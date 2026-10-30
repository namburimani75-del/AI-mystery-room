import {
  createCase,
  getCases,
  getCaseById,
  discoverClue,
  requestHint,
  makeAccusation,
  getCaseResult,
  deleteCase,
} from '../services/caseService.js';
import {
  createCaseSchema,
  discoverClueSchema,
  requestHintSchema,
  accuseSchema,
} from '../validators/schemas.js';

// POST /api/cases
export const handleCreateCase = async (req, res, next) => {
  try {
    const validation = createCaseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { premise, difficulty, playerId } = validation.data;
    const caseData = await createCase(premise, difficulty, playerId);
    return res.status(201).json({ success: true, case: caseData });
  } catch (error) {
    next(error);
  }
};

// GET /api/cases
export const handleGetCases = async (req, res, next) => {
  try {
    const playerId = req.headers['x-player-id'] || req.query.playerId;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }
    const cases = await getCases(playerId);
    return res.status(200).json({ success: true, cases });
  } catch (error) {
    next(error);
  }
};

// GET /api/cases/:id
export const handleGetCase = async (req, res, next) => {
  try {
    const playerId = req.headers['x-player-id'] || req.query.playerId;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }
    const caseData = await getCaseById(req.params.id, playerId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    return res.status(200).json({ success: true, case: caseData });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid case ID format' });
    }
    next(error);
  }
};

// POST /api/cases/:id/clues/:clueId/discover
export const handleDiscoverClue = async (req, res, next) => {
  try {
    const validation = discoverClueSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    const { playerId } = validation.data;
    const { id: caseId, clueId } = req.params;
    const result = await discoverClue(caseId, clueId, playerId);

    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    next(error);
  }
};

// POST /api/cases/:id/hints
export const handleRequestHint = async (req, res, next) => {
  try {
    const validation = requestHintSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    const { playerId } = validation.data;
    const result = await requestHint(req.params.id, playerId);

    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid case ID' });
    }
    next(error);
  }
};

// POST /api/cases/:id/accuse
export const handleAccuse = async (req, res, next) => {
  try {
    const validation = accuseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { suspectId, playerId } = validation.data;
    const result = await makeAccusation(req.params.id, suspectId, playerId);

    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json({ success: true, case: result });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid case ID' });
    }
    next(error);
  }
};

// GET /api/cases/:id/result
export const handleGetResult = async (req, res, next) => {
  try {
    const playerId = req.headers['x-player-id'] || req.query.playerId;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }
    const result = await getCaseResult(req.params.id, playerId);
    if (!result) {
      return res.status(404).json({ error: 'Case not found' });
    }
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json({ success: true, case: result });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid case ID' });
    }
    next(error);
  }
};

// DELETE /api/cases/:id
export const handleDeleteCase = async (req, res, next) => {
  try {
    const playerId = req.headers['x-player-id'] || req.query.playerId;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }
    const deleted = await deleteCase(req.params.id, playerId);
    if (!deleted) {
      return res.status(404).json({ error: 'Case not found or access denied' });
    }
    return res.status(200).json({ success: true, message: 'Case deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid case ID' });
    }
    next(error);
  }
};
