import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import client from 'prom-client';
import { trace, context } from '@opentelemetry/api';

// Métricas
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Logger con trace-id
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    bindings: (bindings) => ({ pid: bindings.pid, host: bindings.hostname }),
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalRoute = req.route?.path || req.path;
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = { method: req.method, route: originalRoute, status: res.statusCode };
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, duration);
  });
  next();
};

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const span = trace.getSpan(context.active());
  const traceId = span?.spanContext().traceId;
  const childLogger = traceId ? logger.child({ trace_id: traceId }) : logger;
  (req as any).logger = childLogger;
  childLogger.info({ req: { method: req.method, url: req.url, query: req.query, body: req.body } }, 'Incoming request');
  next();
};

export const metricsEndpoint = async (req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};
