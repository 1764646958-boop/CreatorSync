import { Router } from 'express';
import healthRouter from './health';
import adaptersRouter from './adapters';
import historyRouter from './history';

const router = Router();

router.use('/health', healthRouter);
router.use('/adapters', adaptersRouter);
router.use('/history', historyRouter);

export default router;
