import express from 'express';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware';
import { errorLoggerMiddleware } from './middlewares/error-logger.middleware';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/openapi.json';
import advertiserRoutes from './routes/advertiser.routes';
import adRoutes from './routes/ad.routes';
import impressionRoutes from './routes/impression.routes';
import { metricsEndpoint } from './utils/metrics';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:3004', credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(requestLoggerMiddleware);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/advertisers', advertiserRoutes);
app.use('/api/v1/ads', adRoutes);
app.use('/api/v1/impressions', impressionRoutes);

app.use(errorLoggerMiddleware);
app.get('/health', (req, res) => { res.status(200).json({ status: 'ok' }); });
app.get('/metrics', metricsEndpoint);

export default app;