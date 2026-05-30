import { Router } from 'express';
import {
  exportPublishHistoryAsJson,
  exportPublishHistoryAsMarkdown,
  listPublishHistory,
} from '../history';
import { HttpError } from '../types/http-error';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/', (_req, res) => {
  sendSuccess(res, listPublishHistory());
});

router.get('/export', (req, res, next) => {
  try {
    const format = req.query.format === 'json' ? 'json' : req.query.format === 'markdown' ? 'markdown' : undefined;

    if (!format) {
      throw new HttpError('Export format must be markdown or json.', 400);
    }

    const fileExtension = format === 'json' ? 'json' : 'md';
    const contentType = format === 'json' ? 'application/json; charset=utf-8' : 'text/markdown; charset=utf-8';
    const content = format === 'json' ? exportPublishHistoryAsJson() : exportPublishHistoryAsMarkdown();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="creatorsync-publish-history.${fileExtension}"`);
    res.send(content);
  } catch (error) {
    next(error);
  }
});

export default router;
