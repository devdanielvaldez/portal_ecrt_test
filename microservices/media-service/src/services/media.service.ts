import path from 'path';
import { saveFile, getPublicUrl } from './storage.service';

export const processAndUpload = async (file: Express.Multer.File, organizationId: string) => {
  const baseName = `${Date.now()}-${Math.round(Math.random() * 1000)}`;
  const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
  const relativePath = `orgs/${organizationId}/${baseName}/${safeOriginalName}`;
  const savedPath = await saveFile(file, relativePath);
  let mediaType: 'IMAGE' | 'VIDEO';
  if (file.mimetype.startsWith('image/')) mediaType = 'IMAGE';
  else if (file.mimetype.startsWith('video/')) mediaType = 'VIDEO';
  else throw new Error('UNSUPPORTED_TYPE');
  return { type: mediaType, path: savedPath };
};

export const getSecurePlaybackUrl = async (filePath: string) => {
  return await getPublicUrl(filePath, 3600);
};
