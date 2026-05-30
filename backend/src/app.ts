import cors from 'cors';
import express from 'express';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/logger';

const createCorsOptions = () => {
  const origin = process.env.CORS_ORIGIN || '*';

  if (origin === '*') {
    return { origin: '*' };
  }

  return {
    origin: origin.split(',').map((item) => item.trim()).filter(Boolean),
  };
};

export const createApp = () => {
  const app = express();

  app.use(cors(createCorsOptions()));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.use(routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
