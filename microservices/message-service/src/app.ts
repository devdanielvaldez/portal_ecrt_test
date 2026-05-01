import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { cryptoMiddleware } from './middlewares/crypto.middleware';
import messageRoutes from './routes/message.routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cryptoMiddleware);

app.use('/api/v1/messages', messageRoutes);

export default app;
