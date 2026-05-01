import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Ad } from '../entities/Ad';
import { Advertiser } from '../entities/Advertiser';
import { AdImpression } from '../entities/AdImpression';
import { AdAssignment } from '../entities/AdAssignment';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'portal_ecrt',
  synchronize: false,
  logging: false,
  entities: [Ad, Advertiser, AdImpression, AdAssignment],
});
