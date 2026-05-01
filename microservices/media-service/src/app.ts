import { metricsMiddleware, loggerMiddleware, metricsEndpoint } from "./middlewares/observability.middleware";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mediaRoutes from './routes/media.routes';
import { cryptoMiddleware } from './middlewares/crypto.middleware';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
  app.use(metricsMiddleware);
  app.use(loggerMiddleware);

app.use((req, res, next) => {
  if (req.path.includes('/upload') || req.path.includes('/private')) return next();
  return cryptoMiddleware(req, res, next);
});

app.use('/api/v1/media', mediaRoutes);

app.get("/metrics", metricsEndpoint);
export default app;
