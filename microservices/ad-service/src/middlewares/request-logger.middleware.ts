import { Request, Response, NextFunction } from 'express';
import { getRequestLogger } from '../utils/logger';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const log = getRequestLogger(req);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    log[level]({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
      user_id: (req as any).user?.id,
      ip: req.ip,
    }, 'HTTP request completed');
  });

  next();
};
