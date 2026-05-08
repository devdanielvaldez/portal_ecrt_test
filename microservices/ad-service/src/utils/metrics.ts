import client from 'prom-client';
import express from 'express';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({});

export const metricsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Se pueden agregar métricas personalizadas aquí
  });
  next();
};

export const metricsEndpoint = async (req: express.Request, res: express.Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};
