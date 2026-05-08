import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorLoggerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    user_id: (req as any).user?.id,
    ip: req.ip,
  }, 'Unhandled exception');
  next(err);
};
