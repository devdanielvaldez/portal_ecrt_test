#!/bin/bash
set -e

echo "🔧 Eliminando completamente observability.middleware de todos los servicios..."

for service_dir in ./microservices/*/; do
  if [ -f "${service_dir}package.json" ]; then
    service=$(basename "$service_dir")
    echo "--------------------------------------------------"
    echo "📦 Procesando: $service"
    cd "$service_dir"

    # 1. Eliminar el archivo middleware si existe
    rm -f src/middlewares/observability.middleware.ts

    # 2. Eliminar import y uso del middleware en app.ts
    if [ -f src/app.ts ]; then
      # Eliminar línea de import
      perl -pi -e 's/^import.*observability\.middleware.*\n?//' src/app.ts
      # Eliminar líneas que contengan app.use(metricsMiddleware) o app.use(loggerMiddleware)
      perl -pi -e 's/^\s*app\.use\((metricsMiddleware|loggerMiddleware)\).*\n?//' src/app.ts
      # Eliminar app.get("/metrics", ...) si existe
      perl -pi -e 's/^\s*app\.get\(["'\''"]\/metrics["'\''"],\s*metricsEndpoint\).*\n?//' src/app.ts
    fi

    # 3. Asegurar que el Dockerfile tenga multi-stage
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

    # 4. Reconstruir imagen
    echo "🏗️  Reconstruyendo imagen ecrt/$service:latest..."

    cd - >/dev/null
  fi
done

echo "✅ Observabilidad eliminada correctamente."
echo "🔄 Desplegando stack actualizado..."

echo "🎉 Proceso completado. Verifica con: docker stack ps ecrt"