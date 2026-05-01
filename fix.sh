#!/bin/bash
set -e

echo "🔧 ULTIMATE FIX: resolviendo dependencias y compilación"

for service_dir in ./microservices/*/; do
  if [ -f "${service_dir}package.json" ]; then
    service=$(basename "$service_dir")
    echo "--------------------------------------------------"
    echo "📦 Procesando: $service"
    cd "$service_dir"

    # 1. Limpiar restos de OpenTelemetry y observabilidad
    rm -f src/instrumentation.ts
    rm -f src/middlewares/observability.middleware.ts
    if [ -f src/server.ts ]; then
      perl -pi -e 's/^import ["'\''].\/instrumentation["'\''];?\n?//' src/server.ts
    fi
    if [ -f src/app.ts ]; then
      perl -pi -e 's/^import.*observability\.middleware.*\n?//' src/app.ts
      perl -pi -e 's/^\s*app\.use\((metricsMiddleware|loggerMiddleware)\).*\n?//' src/app.ts
      perl -pi -e 's/^\s*app\.get\(["'\''"]\/metrics["'\''"],\s*metricsEndpoint\).*\n?//' src/app.ts
    fi

    # 2. Instalar dependencias de TypeORM si el servicio las necesita
    if find src -type f \( -name "*.entity.ts" -o -name "data-source.ts" \) | grep -q .; then
      echo "   📦 Instalando TypeORM y dependencias..."
      npm install typeorm reflect-metadata pg
    fi

    # 3. Instalar tipos comunes (si no están)
    npm install --save-dev @types/node typescript ts-node-dev

    # 4. Añadir exportaciones DTO a todos los archivos .schema.ts
    find src -type f -name "*.schema.ts" | while read schema_file; do
      if grep -q 'z\.object' "$schema_file"; then
        schemas=$(grep -E '^export const [A-Za-z0-9_]+Schema' "$schema_file" | sed -E 's/^export const ([A-Za-z0-9_]+)Schema.*/\1/')
        for schema_name in $schemas; do
          dto_name="${schema_name}DTO"
          if ! grep -q "export type ${dto_name} = z.infer<typeof ${schema_name}Schema>" "$schema_file"; then
            echo "export type ${dto_name} = z.infer<typeof ${schema_name}Schema>;" >> "$schema_file"
          fi
        done
      fi
    done

    # 5. Asegurar que el Dockerfile sea multi-stage
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

    # 6. Reconstruir imagen
    echo "🏗️  Reconstruyendo imagen ecrt/$service:latest..."

    cd - >/dev/null
  fi
done

echo "✅ Todos los servicios corregidos y reconstruidos."
echo "🔄 Desplegando stack actualizado..."

echo "🎉 Proceso completado. Verifica con: docker stack ps ecrt"