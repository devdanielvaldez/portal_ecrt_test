import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import jwt from 'jsonwebtoken';
import { adClient } from '../config/ad-client';

const userRepo = AppDataSource.getRepository(User);

export const signUp = async (data: any) => {
  const { firstName, lastName, phone, email, password, organization_id } = data;

  const adResponse = await adClient.signUp({ firstName, lastName, phone, email, password });
  const adUser = adResponse.data;

  let user = await userRepo.findOneBy({ email });
  if (!user) {
    user = new User();
    user.email = adUser.email ?? email;
    user.role = UserRole.ORG_USER;
    user.organization_id = organization_id || null;
    user.status = adUser.isActive ? 'ACTIVE' : 'INACTIVE';
    await userRepo.save(user);
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
  };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '24h',
  });

  return {
    access_token: accessToken,
    user: { id: user.id, email: user.email, role: user.role, organization_id: user.organization_id },
  };
};

export const signIn = async (email: string | undefined, phone: string | undefined, password: string) => {
  const credentials: { email?: string; phone?: string; password: string } = { password };
  if (email) credentials.email = email;
  if (phone) credentials.phone = phone;

  const adResponse = await adClient.signIn(credentials);
  const adUser = adResponse.data;

  const resolvedEmail = adUser.email;
  let user = await userRepo.findOneBy({ email: resolvedEmail });
  if (!user) {
    user = new User();
    user.email = resolvedEmail;
    user.role = UserRole.ORG_USER;
    user.organization_id = null;
    user.status = adUser.isActive ? 'ACTIVE' : 'INACTIVE';
    await userRepo.save(user);
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
  };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '24h',
  });

  return {
    access_token: accessToken,
    user: { id: user.id, email: user.email, role: user.role, organization_id: user.organization_id },
  };
};

export const forgetPassword = async (email: string | undefined, phone: string | undefined) => {
  const contact: { email?: string; phone?: string } = {};
  if (email) contact.email = email;
  if (phone) contact.phone = phone;

  const adResponse = await adClient.forgetPassword(contact);
  return adResponse.data;
};

export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  await adClient.changePassword(userId, { currentPassword, password: newPassword });
};

export const loginDevice = async (serial_number: string, password: string) => {
  const deviceResponse = await fetch('http://device-service:3002/internal/validate-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serial_number, password }),
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
    serial_number,
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback', {
    expiresIn: '365d',
  });

  return { access_token: accessToken, terminal: tokenPayload };
};