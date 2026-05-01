import { metricsMiddleware, loggerMiddleware, metricsEndpoint } from "./middlewares/observability.middleware";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cryptoRoutes from './routes/crypto.routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
  app.use(metricsMiddleware);
  app.use(loggerMiddleware);
app.use('/api/v1/crypto', cryptoRoutes);

app.get("/metrics", metricsEndpoint);
export default app;
