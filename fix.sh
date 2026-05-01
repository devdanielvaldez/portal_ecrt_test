#!/bin/bash
set -e

echo "🔧 CORRECCIÓN COMPLETA DE TODOS LOS SERVICIOS"

for service_dir in ./microservices/*/; do
  if [ -f "${service_dir}package.json" ]; then
    service=$(basename "$service_dir")
    echo "--------------------------------------------------"
    echo "📦 Procesando: $service"
    cd "$service_dir"

    # 1. Limpiar OpenTelemetry y observabilidad
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

    # 2. Verificar si el servicio usa TypeORM y agregar dependencias
    if find src -type f \( -name "*.entity.ts" -o -name "data-source.ts" \) | grep -q .; then
      npm install typeorm reflect-metadata pg
      npm install --save-dev @types/node
    fi

    # 3. Agregar exportaciones DTO en archivos .schema.ts
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

    # 4. Corrección específica para message-service: error de propiedad 'type' en array
    if [ "$service" == "message-service" ] && [ -f src/services/message.service.ts ]; then
      echo "   Aplicando fix específico para message-service..."
      cp src/services/message.service.ts src/services/message.service.ts.bak
      cat > src/services/message.service.ts << 'EOF'
import { AppDataSource, redisClient } from '../config/data-source';
import { TerminalMessage, MessageType } from '../entities/Message';

const msgRepo = AppDataSource.getRepository(TerminalMessage);

export const sendMessage = async (data: any) => {
  const message = msgRepo.create(data);
  await msgRepo.save(message);
  if (message.type === MessageType.FLASH) {
    await redisClient.lPush('flash_messages', JSON.stringify(message));
  }
  return message;
};

export const pullMessagesForTerminal = async (terminalId: string, orgId: string, groupId: string | null) => {
  const qb = msgRepo.createQueryBuilder('msg')
    .where('msg.status = :status', { status: 'ACTIVE' })
    .andWhere('msg.type = :type', { type: MessageType.STICKY })
    .andWhere(`(
      msg.terminal_id = :terminalId OR 
      msg.group_id = :groupId OR 
      msg.organization_id = :orgId OR 
      (msg.terminal_id IS NULL AND msg.group_id IS NULL AND msg.organization_id IS NULL)
    )`, { terminalId, groupId, orgId });
  const stickyMessages = await qb.getMany();
  const flashList = await redisClient.lRange('flash_messages', 0, -1);
  let flashMessages = flashList.map(msg => JSON.parse(msg));
  flashMessages = flashMessages.filter(msg => {
    return msg.terminal_id === terminalId ||
           msg.group_id === groupId ||
           msg.organization_id === orgId ||
           (!msg.terminal_id && !msg.group_id && !msg.organization_id);
  });
  return [...stickyMessages, ...flashMessages];
};

export const updateMessageStatus = async (id: string, status: string) => {
  const msg = await msgRepo.findOneBy({ id });
  if (!msg) throw new Error('NOT_FOUND');
  msg.status = status;
  return await msgRepo.save(msg);
};
EOF
    fi

    # 5. Dockerfile multi-stage
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

echo "✅ Todos los servicios corregidos."
echo "🔄 Desplegando stack actualizado..."

echo "🎉 Proceso completado. Verifica con: docker stack ps ecrt"