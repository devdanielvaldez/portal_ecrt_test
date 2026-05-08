import { Request } from 'express';
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      }
    : undefined,
  base: {
    service: process.env.SERVICE_NAME || 'ad-service',
    env: process.env.NODE_ENV || 'development',
  },
});

let requestIdCounter = 0;
export const getRequestLogger = (req: Request) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${++requestIdCounter}`;
  return logger.child({ request_id: requestId });
};
