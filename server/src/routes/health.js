import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'AI Mystery Room API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
