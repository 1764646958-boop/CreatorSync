import { Router } from 'express';
import healthRouter from './health';
import adaptersRouter from './adapters';
import publishRouter from './publish';

const router = Router();

router.use('/health', healthRouter);
router.use('/adapters', adaptersRouter);
router.use('/api/publish', publishRouter);

export default router;
