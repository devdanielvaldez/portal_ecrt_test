import { metricsMiddleware, loggerMiddleware, metricsEndpoint } from "./middlewares/observability.middleware";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { cryptoMiddleware } from './middlewares/crypto.middleware';
import biRoutes from './routes/bi.routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
  app.use(metricsMiddleware);
  app.use(loggerMiddleware);
app.use(cryptoMiddleware);

app.use('/api/v1/bi', biRoutes);

app.get("/metrics", metricsEndpoint);
export default app;
