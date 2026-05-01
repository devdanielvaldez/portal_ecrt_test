import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Organization } from '../entities/Organization';
import { AgencyAssignment } from '../entities/AgencyAssignment';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'org_db',
  synchronize: true,
  logging: false,
  entities: [Organization, AgencyAssignment],
});
