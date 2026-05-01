#!/bin/bash
set -e

echo "🚀 FORZANDO RECONSTRUCCIÓN COMPLETA SIN CACHÉ"

for service_dir in ./microservices/*/; do
  if [ -f "${service_dir}package.json" ]; then
    service=$(basename "$service_dir")
    echo "--------------------------------------------------"
    echo "📦 Procesando: $service"
    cd "$service_dir"

    # 1. Si es message-service, sobreescribir el archivo problemático
    if [ "$service" == "message-service" ]; then
      echo "   Corrigiendo message.service.ts..."
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

    # 2. Eliminar imagen anterior (si existe)
    docker rmi -f "ecrt/$service:latest" 2>/dev/null || true

    # 3. Construir sin caché (--no-cache)
    echo "🏗️  Reconstruyendo sin caché ecrt/$service:latest..."
    docker build --no-cache -t "ecrt/$service:latest" .

    cd - >/dev/null
  fi
done

echo "✅ Todos los servicios reconstruidos frescos."
echo "🔄 Desplegando stack actualizado..."
docker stack rm ecrt 2>/dev/null || true

echo "🎉 Proceso completado. Verifica con: docker stack ps ecrt"