import app from './app';
import { AppDataSource } from './config/data-source';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Ad service running on port ${PORT}`));
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

startServer();
