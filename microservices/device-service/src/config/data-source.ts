import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Terminal } from '../entities/Terminal';
import { TerminalGroup } from '../entities/TerminalGroup';
import dotenv from 'dotenv';
import { createClient } from 'redis';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'device_db',
  synchronize: true,
  logging: false,
  entities: [Terminal, TerminalGroup],
});

export const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
