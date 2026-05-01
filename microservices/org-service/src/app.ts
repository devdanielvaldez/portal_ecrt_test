import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { cryptoMiddleware } from './middlewares/crypto.middleware';
import orgRoutes from './routes/org.routes';
import agencyRoutes from './routes/agency.routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cryptoMiddleware);

app.use('/api/v1/organizations', orgRoutes);
app.use('/api/v1/agencies', agencyRoutes);

export default app;
