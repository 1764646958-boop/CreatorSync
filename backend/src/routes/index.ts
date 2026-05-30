import { Router } from 'express';
import healthRouter from './health';
import adaptersRouter from './adapters';

const router = Router();

router.use('/health', healthRouter);
router.use('/adapters', adaptersRouter);
router.use('/api/adapt', adaptersRouter);

export default router;
