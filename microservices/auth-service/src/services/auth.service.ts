import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import jwt from 'jsonwebtoken';
import { adClient } from '../config/ad-client';
import { redisClient } from '../config/data-source';

const userRepo = AppDataSource.getRepository(User);
const toLower = (str?: string): string | undefined => str?.toLowerCase();

export const signUp = async (data: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  organization_id?: string;
}) => {
  let { firstName, lastName, phone, email, password, organization_id } = data;
  if (!organization_id) {
    throw new Error('Organization ID is required for sign up');
  }
  email = toLower(email) || email;

  const adResponse = await adClient.signUp({ firstName, lastName, phone, email, password });
  const adUser = adResponse.data;
  const adEmail = toLower(adUser.email) || email;

  let user = await userRepo.findOneBy({ email: adEmail });
  if (!user) {
    user = new User();
    user.email = adEmail;
    user.role = UserRole.ORG_USER;
    user.organization_id = organization_id;
    user.status = adUser.isActive ? 'ACTIVE' : 'INACTIVE';
    await userRepo.save(user);
  } else {
    user.organization_id = organization_id;
    await userRepo.save(user);
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
  };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
  return {
    access_token: accessToken,
    user: { id: user.id, email: user.email, role: user.role, organization_id: user.organization_id },
  };
};

export const signIn = async (email: string, password: string) => {
  const normalizedEmail = toLower(email);
  const credentials: { email?: string; password: string } = { password };
  if (normalizedEmail) credentials.email = normalizedEmail;

  let adResponse;
  try {
    adResponse = await adClient.signIn(credentials);
  } catch (error: any) {
    throw new Error('Authentication failed: ' + (error.message || 'Invalid credentials'));
  }

  const adUserData = adResponse.data;
  const resolvedEmail = toLower(adUserData.email);
  if (!resolvedEmail) {
    throw new Error('Email not provided by AD response');
  }
  const user = await userRepo.findOneBy({ email: resolvedEmail });
  if (!user) {
    throw new Error('User not registered in system. Please sign up first.');
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
    status: user.status
  };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
    expiresIn: '24h',
  });
  return {
    access_token: accessToken,
    user: { id: user.id, email: user.email, role: user.role, organization_id: user.organization_id },
  };
};

export const forgetPassword = async (email: string | undefined, phone: string | undefined) => {
  const contact: { email?: string; phone?: string } = {};
  if (email) contact.email = toLower(email);
  if (phone) contact.phone = phone;
  const adResponse = await adClient.forgetPassword(contact);
  return adResponse.data;
};

export const changePassword = async (userId: number, currentPassword: string, newPassword: string) => {
  await adClient.changePassword(userId, { currentPassword, password: newPassword });
};

export const loginDevice = async (serial_number: string, password: string) => {
  const deviceResponse = await fetch(`${process.env.DEVICE_SERVICE_URL}${process.env.DEVICE_VALIDATE_PATH}`, {
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
    status: terminalData.status
  };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
  return { access_token: accessToken, terminal: tokenPayload };
};

// Blacklist functions usando ioredis (API correcta)
export const blacklistToken = async (token: string, expiresIn: number) => {
  await redisClient.setex(`bl_${token}`, expiresIn, 'true');
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const exists = await redisClient.exists(`bl_${token}`);
  return exists === 1;
};
