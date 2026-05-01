#!/bin/bash
set -e

echo "🗑️  Eliminando OpenTelemetry de todos los servicios..."

for service_dir in ./microservices/*/; do
  if [ -f "${service_dir}package.json" ]; then
    service=$(basename "$service_dir")
    echo "--------------------------------------------------"
    echo "📦 Procesando: $service"
    cd "$service_dir"

    # 1. Eliminar dependencias de OpenTelemetry del package.json
    npm uninstall @opentelemetry/api @opentelemetry/instrumentation-express \
      @opentelemetry/instrumentation-http @opentelemetry/sdk-node \
      @opentelemetry/exporter-trace-otlp-http @opentelemetry/resources \
      @opentelemetry/semantic-conventions 2>/dev/null || true

    # 2. Eliminar archivo instrumentation.ts si existe
    rm -f src/instrumentation.ts

    # 3. Eliminar import de instrumentation en server.ts (si existe)
    if [ -f src/server.ts ]; then
      perl -pi -e 's/^import ["']\.\/instrumentation["'];?\n?//' src/server.ts
    fi

    # 4. Eliminar middlewares de observabilidad que dependen de OpenTelemetry (opcional, pero seguro)
    # No eliminamos metricsMiddleware ni loggerMiddleware porque usan prom-client y pino y podrían seguir funcionando.
    # Sin embargo, si el loggerMiddleware usa trace.getSpan, fallará. Por eso lo modificamos para que no use trace.
    if [ -f src/middlewares/observability.middleware.ts ]; then
      cat > src/middlewares/observability.middleware.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import client from 'prom-client';

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const logger = pino({ level: process.env.LOG_LEVEL || 'info', timestamp: pino.stdTimeFunctions.isoTime });

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const route = req.route?.path || req.path;
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode });
    httpRequestDurationSeconds.observe({ method: req.method, route, status: res.statusCode }, duration);
  });
  next();
};

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const childLogger = logger.child({});
  (req as any).logger = childLogger;
  childLogger.info({ req: { method: req.method, url: req.url } }, 'Incoming request');
  next();
};

export const metricsEndpoint = async (req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};
EOF
    fi

    # 5. Asegurar que el Dockerfile sea multi-stage correcto
    cat > Dockerfile << 'EOF'
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
EOF

    # 6. Reconstruir la imagen
    echo "🏗️  Reconstruyendo imagen ecrt/$service:latest..."

    cd - >/dev/null
  fi
done

echo "✅ Todos los servicios limpios de OpenTelemetry y reconstruidos."
echo "🔄 Desplegando stack actualizado..."