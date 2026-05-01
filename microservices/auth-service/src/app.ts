import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { cryptoMiddleware } from './middlewares/crypto.middleware';
import setupRoutes from './routes/setup.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cryptoMiddleware);

app.use('/api/v1/setup', setupRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

export default app;
