import { Router } from 'express';
import healthRouter from './health';
import adaptersRouter from './adapters';
import apiRouter from './adapt';

const router = Router();

router.use('/health', healthRouter);
router.use('/adapters', adaptersRouter);
router.use('/api', apiRouter);

export default router;
