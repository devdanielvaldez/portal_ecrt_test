import app from './app';
import { logger } from './utils/logger';
import { AppDataSource } from './config/data-source';
import dotenv from 'dotenv';

dotenv.config();

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'uncaughtException');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'unhandledRejection');
  process.exit(1);
});

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected');
    app.listen(PORT, () => logger.info(`Ad service running on port ${PORT}`));
  } catch (error: any) {
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  }
};

startServer();
