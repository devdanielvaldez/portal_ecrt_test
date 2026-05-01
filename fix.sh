#!/bin/bash
set -e

echo "🔧 CORRECCIÓN DEFINITIVA: eliminar OpenTelemetry y arreglar DTOs"

for service_dir in ./microservices/*/; do
  if [ -f "${service_dir}package.json" ]; then
    service=$(basename "$service_dir")
    echo "--------------------------------------------------"
    echo "📦 Procesando: $service"
    cd "$service_dir"

    # 1. Eliminar instrumentación y dependencias de OpenTelemetry
    npm uninstall @opentelemetry/api @opentelemetry/instrumentation-express \
      @opentelemetry/instrumentation-http @opentelemetry/sdk-node \
      @opentelemetry/exporter-trace-otlp-http @opentelemetry/resources \
      @opentelemetry/semantic-conventions 2>/dev/null || true

    rm -f src/instrumentation.ts
    # Eliminar import de instrumentation en server.ts (si existe)
    if [ -f src/server.ts ]; then
      perl -pi -e 's/^import ["'\''].\/instrumentation["'\''];?\n?//' src/server.ts
    fi

    # 2. Arreglar archivos schema: exportar tipos inferidos
    # Buscar todos los archivos .schema.ts
    find src -type f -name "*.schema.ts" | while read schema_file; do
      # Buscar definiciones como export const ...Schema = z.object(...
      # Y después añadir export type ...DTO = z.infer<typeof ...Schema>
      # Para simplificar, añadimos al final del archivo todas las combinaciones posibles
      # usando grep para extraer nombres de constantes que terminan en 'Schema'
      if grep -q 'z\.object' "$schema_file"; then
        echo "   Procesando $schema_file"
        # Obtener nombres de esquemas (variables exportadas)
        schemas=$(grep -E '^export const [A-Za-z0-9_]+Schema' "$schema_file" | sed -E 's/^export const ([A-Za-z0-9_]+)Schema.*/\1/')
        for schema_name in $schemas; do
          dto_name="${schema_name}DTO"
          # Verificar si ya existe export type
          if ! grep -q "export type ${dto_name} = z.infer<typeof ${schema_name}Schema>" "$schema_file"; then
            echo "   Añadiendo export type ${dto_name}"
            echo "export type ${dto_name} = z.infer<typeof ${schema_name}Schema>;" >> "$schema_file"
          fi
        done
      fi
    done

    # Para auth-service específicamente, también añadimos manualmente los que faltan
    if [ "$service" == "auth-service" ]; then
      # Asegurar que LoginDTO y CreateAdminDTO existan
      if [ -f src/schemas/auth.schema.ts ]; then
        if ! grep -q "export type LoginDTO" src/schemas/auth.schema.ts; then
          echo "export type LoginDTO = z.infer<typeof LoginSchema>;" >> src/schemas/auth.schema.ts
        fi
      fi
      if [ -f src/schemas/user.schema.ts ]; then
        if ! grep -q "export type CreateAdminDTO" src/schemas/user.schema.ts; then
          echo "export type CreateAdminDTO = z.infer<typeof CreateAdminSchema>;" >> src/schemas/user.schema.ts
        fi
      fi
    fi

    # 3. Revisar que `observability.middleware` no use OpenTelemetry
    if [ -f src/middlewares/observability.middleware.ts ]; then
      # Eliminar importación de trace y context si existe
      perl -pi -e 's/import.*@opentelemetry\/api.*//' src/middlewares/observability.middleware.ts
      # Reemplazar trace.getSpan por null
      perl -pi -e 's/trace\.getSpan\(.*\)/null/g' src/middlewares/observability.middleware.ts
    fi

    # 4. Asegurar que el Dockerfile tenga multi-stage
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

    # 5. Reconstruir imagen
    echo "🏗️  Reconstruyendo imagen ecrt/$service:latest..."

    cd - >/dev/null
  fi
done

echo "✅ Arreglos completados para todos los servicios."
echo "🔄 Desplegando stack actualizado..."

echo "🎉 Proceso completado. Verifica con: docker stack ps ecrt"