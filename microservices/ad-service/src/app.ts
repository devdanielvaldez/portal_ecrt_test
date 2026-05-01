import { metricsMiddleware, loggerMiddleware, metricsEndpoint } from "./middlewares/observability.middleware";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { cryptoMiddleware } from './middlewares/crypto.middleware';
import advertiserRoutes from './routes/advertiser.routes';
import adRoutes from './routes/ad.routes';
import impressionRoutes from './routes/impression.routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
  app.use(metricsMiddleware);
  app.use(loggerMiddleware);
app.use(cryptoMiddleware);

app.use('/api/v1/advertisers', advertiserRoutes);
app.use('/api/v1/ads', adRoutes);
app.use('/api/v1/impressions', impressionRoutes);

app.get("/metrics", metricsEndpoint);
export default app;
