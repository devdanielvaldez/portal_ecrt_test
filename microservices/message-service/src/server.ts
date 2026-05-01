import app from './app';
import { AppDataSource, redisClient } from './config/data-source';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3006;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    await redisClient.connect();
    console.log('Database and Redis connected');
    app.listen(PORT, () => console.log(`Message service running on port ${PORT}`));
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
};

startServer();
