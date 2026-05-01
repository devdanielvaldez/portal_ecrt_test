#!/bin/bash
set -e

echo "🔧 Parcheando servicios para compilación TypeScript..."

for service_dir in ./microservices/*/; do
  if [ -f "${service_dir}package.json" ]; then
    service=$(basename "$service_dir")
    echo "--------------------------------------------------"
    echo "📦 Procesando: $service"
    cd "$service_dir"

    # 1. Instalar dependencias faltantes (tipo y runtime)
    npm install --save jsonwebtoken @opentelemetry/api @opentelemetry/instrumentation-express \
      @opentelemetry/instrumentation-http @opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-http \
      @opentelemetry/resources @opentelemetry/semantic-conventions prom-client pino pino-http
    npm install --save-dev @types/express @types/cors @types/jsonwebtoken @types/pino

    # 2. Corregir instrumentation.ts (el error de 'Resource')
    if [ -f src/instrumentation.ts ]; then
      cat > src/instrumentation.ts << 'EOF'
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || 'unknown-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://jaeger:4318/v1/traces',
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();
process.on('SIGTERM', () => sdk.shutdown().catch(console.error));
EOF
    fi

    # 3. Corregir el tipado de req.params.id (string | string[] -> string)
    find src/controllers -type f -name "*.ts" -exec sed -i.bak 's/req\.params\.\([a-zA-Z0-9_]*\) as string/req.params.\1 as string/g' {} \;
    find src/controllers -type f -name "*.ts" -exec sed -i.bak 's/req\.params\.id/req.params.id as string/g' {} \;
    find src/controllers -type f -name "*.ts" -exec sed -i.bak 's/req\.params\.adId/req.params.adId as string/g' {} \;
    find src/controllers -type f -name "*.ts" -exec sed -i.bak 's/req\.params\.orgId/req.params.orgId as string/g' {} \;

    # 4. Corregir crypto.middleware.ts (el problema con res.json)
    if [ -f src/middlewares/crypto.middleware.ts ]; then
      cat > src/middlewares/crypto.middleware.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { decryptPayload, encryptPayload } from '../utils/crypto.client';

export const cryptoMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.body && req.body.payload) {
    try {
      req.body = await decryptPayload(req.body.payload);
    } catch (error) {
      res.status(400).json({ error: 'Failed to decrypt payload' });
      return;
    }
  }
  const originalJson = res.json;
  res.json = function (data: any): Response {
    res.json = originalJson;
    encryptPayload(data).then(encrypted => {
      originalJson.call(this, { payload: encrypted });
    }).catch(err => {
      originalJson.call(this, { error: 'Encryption failed' });
    });
    return this;
  };
  next();
};
EOF
    fi

    # 5. Reemplazar Dockerfile por versión multi-stage
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
    cd - >/dev/null
  fi
done

echo "✅ Todos los servicios parcheados y reconstruidos."
echo "🔄 Desplegando stack actualizado..."
docker stack deploy -c docker-stack.yml ecrt --resolve-image always

echo "🎉 Proceso completado. Verifica con: docker stack ps ecrt"