import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { LoginDTO } from '../schemas/auth.schema';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const loginAdmin = async (data: LoginDTO) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email: data.email });
  if (!user || !(await user.checkPassword(data.password))) throw new Error('CREDENTIALS_INVALID');
  if (user.role !== UserRole.ADMIN) throw new Error('UNAUTHORIZED_ROLE');
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
  const tokenPayload = { id: user.id, email: user.email, role: user.role, organization_id: user.organization_id };
  const accessToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '24h' });
  return { access_token: accessToken, user: { id: user.id, email: user.email, role: user.role } };
};

export const loginOrganization = async (data: LoginDTO) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email: data.email });
  if (!user || !(await user.checkPassword(data.password))) throw new Error('CREDENTIALS_INVALID');
  if (user.role !== UserRole.ORG_USER) throw new Error('UNAUTHORIZED_ROLE');
  if (user.status !== 'ACTIVE') throw new Error('USER_INACTIVE');
  const tokenPayload = { id: user.id, email: user.email, role: user.role, organization_id: user.organization_id };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback', { expiresIn: '24h' });
  return { access_token: accessToken, user: { id: user.id, email: user.email, organization_id: user.organization_id } };
};

export const loginDevice = async (serial_number: string, password: string) => {
  const deviceResponse = await fetch('http://device-service:3002/internal/validate-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serial_number, password })
  });
  if (!deviceResponse.ok) {
    const error = await deviceResponse.json();
    throw new Error(error.error || 'DEVICE_INVALID');
  }
  const terminalData = await deviceResponse.json();
  const tokenPayload = {
    id: terminalData.id,
    role: 'DEVICE',
    organization_id: terminalData.organization_id,
    serial_number
  };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback', { expiresIn: '365d' });
  return { access_token: accessToken, terminal: tokenPayload };
};
