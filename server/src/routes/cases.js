import { Router } from 'express';
import {
  handleCreateCase,
  handleGetCases,
  handleGetCase,
  handleDiscoverClue,
  handleRequestHint,
  handleAccuse,
  handleGetResult,
  handleDeleteCase,
} from '../controllers/caseController.js';

const router = Router();

router.post('/', handleCreateCase);
router.get('/', handleGetCases);
router.get('/:id', handleGetCase);
router.post('/:id/clues/:clueId/discover', handleDiscoverClue);
router.post('/:id/hints', handleRequestHint);
router.post('/:id/accuse', handleAccuse);
router.get('/:id/result', handleGetResult);
router.delete('/:id', handleDeleteCase);

export default router;
