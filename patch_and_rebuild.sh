#!/bin/bash
set -e

echo "🔧 Parcheando instrumentation.ts en todos los servicios..."

for service_dir in ./microservices/*/; do
  if [ -f "${service_dir}package.json" ]; then
    service=$(basename "$service_dir")
    echo "--------------------------------------------------"
    echo "📦 Procesando: $service"
    cd "$service_dir"

    # 1. Instalar paquetes necesarios (si no están)
    npm install --save @opentelemetry/api @opentelemetry/instrumentation-express \
      @opentelemetry/instrumentation-http @opentelemetry/sdk-node \
      @opentelemetry/exporter-trace-otlp-http

    # 2. Reemplazar instrumentation.ts por versión simplificada (sin Resource)
    cat > src/instrumentation.ts << 'EOF'
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const sdk = new NodeSDK({
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

    # 3. Verificar que el archivo server.ts importe instrumentation (ya debería)
    if [ -f src/server.ts ]; then
      if ! grep -q "import './instrumentation'" src/server.ts; then
        sed -i '1i import "./instrumentation";' src/server.ts
      fi
    fi

    # 4. Asegurar que el Dockerfile sea multi-stage (copiado del paso anterior)
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


echo "✅ Todos los servicios parcheados y reconstruidos."
echo "🔄 Desplegando stack actualizado..."

echo "🎉 Proceso completado. Verifica con: docker stack ps ecrt"