import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const SIGNATURE_SECRET = process.env.JWT_SECRET || 'fallback_signature_secret_key';

export const generateSignedUrl = (filePath: string, expiresInMinutes = 60): string => {
  const expiresAt = Date.now() + (expiresInMinutes * 60 * 1000);
  const dataToSign = `${filePath}|${expiresAt}`;
  const signature = crypto.createHmac('sha256', SIGNATURE_SECRET).update(dataToSign).digest('hex');
  const baseUrl = process.env.BASE_API_URL || 'http://localhost:8000/api/v1/media/private';
  return `${baseUrl}/${filePath}?expires=${expiresAt}&signature=${signature}`;
};

export const verifySignature = (filePath: string, expiresAt: string, providedSignature: string): boolean => {
  if (Date.now() > parseInt(expiresAt)) return false;
  const dataToSign = `${filePath}|${expiresAt}`;
  const expectedSignature = crypto.createHmac('sha256', SIGNATURE_SECRET).update(dataToSign).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature));
};
