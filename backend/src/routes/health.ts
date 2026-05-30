import { Router } from 'express';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/', (_req, res) => {
  sendSuccess(res, {
    service: 'CreatorSync Backend',
    status: 'ok',
    uptime: process.uptime(),
  });
});

export default router;
