import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import { generateSignedUrl as generateLocalSignedUrl } from './signature.service';

const USE_S3 = process.env.USE_S3 === 'true';
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

let s3: AWS.S3 | null = null;
if (USE_S3) {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
}

const ensureLocalDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

export const saveFile = async (file: Express.Multer.File, relativePath: string): Promise<string> => {
  if (USE_S3 && s3) {
    const fileContent = fs.readFileSync(file.path);
    const s3Key = relativePath;
    await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Body: fileContent,
      ContentType: file.mimetype,
    }).promise();
    fs.unlinkSync(file.path);
    return s3Key;
  } else {
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    ensureLocalDir(path.dirname(fullPath));
    fs.renameSync(file.path, fullPath);
    return relativePath;
  }
};

export const getPublicUrl = async (savedPath: string, expiresInSeconds: number = 3600): Promise<string> => {
  if (USE_S3 && s3) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: savedPath,
      Expires: expiresInSeconds,
    };
    return s3.getSignedUrlPromise('getObject', params);
  } else {
    return generateLocalSignedUrl(savedPath, expiresInSeconds / 60);
  }
};

export const deleteFile = async (savedPath: string): Promise<void> => {
  if (USE_S3 && s3) {
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: savedPath,
    }).promise();
  } else {
    const fullPath = path.join(UPLOAD_DIR, savedPath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
};
