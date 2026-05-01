import { metricsMiddleware, loggerMiddleware, metricsEndpoint } from "./middlewares/observability.middleware";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { cryptoMiddleware } from './middlewares/crypto.middleware';
import terminalRoutes from './routes/terminal.routes';
import groupRoutes from './routes/group.routes';
import telemetryRoutes from './routes/telemetry.routes';
import internalRoutes from './routes/internal.routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
  app.use(metricsMiddleware);
  app.use(loggerMiddleware);
app.use(cryptoMiddleware);

app.use('/api/v1/terminals', terminalRoutes);
app.use('/api/v1/terminal-groups', groupRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/internal', internalRoutes);

app.get("/metrics", metricsEndpoint);
export default app;
