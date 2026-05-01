#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Despliegue en Docker Swarm Completo  ${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. Inicializar Swarm si no está activo
if ! docker info | grep -q "Swarm: active"; then
  echo -e "${YELLOW}Inicializando Docker Swarm...${NC}"
  docker swarm init --advertise-addr eth0 2>/dev/null || docker swarm init --advertise-addr $(ip route get 1 | awk '{print $NF;exit}')
  echo -e "${GREEN}Swarm inicializado${NC}"
else
  echo -e "${GREEN}Swarm ya está activo${NC}"
fi

# 2. Crear red overlay (si no existe)
if ! docker network ls --filter name=ecrt-net | grep -q ecrt-net; then
  echo -e "${YELLOW}Creando red overlay ecrt-net...${NC}"
  docker network create --driver overlay --attachable ecrt-net
else
  echo -e "${GREEN}Red ecrt-net ya existe${NC}"
fi

# 3. Crear directorios necesarios
mkdir -p secrets prometheus
mkdir -p ./microservices/*/src

# 4. Descargar imágenes públicas (para que estén en caché local)
echo -e "${YELLOW}Descargando imágenes base (públicas)...${NC}"
IMAGES=(
  "postgres:15-alpine"
  "redis:7-alpine"
  "caddy:2-alpine"
  "kong:3.6-ubuntu"
  "jaegertracing/all-in-one:latest"
  "prom/prometheus:latest"
  "grafana/grafana:latest"
  "grafana/loki:latest"
  "grafana/promtail:latest"
)
for img in "${IMAGES[@]}"; do
  echo -e "  Pulling $img..."
  docker pull "$img" || echo -e "${RED}  Error pulling $img${NC}"
done

# 5. Construir imágenes de microservicios
echo -e "${YELLOW}Construyendo imágenes de microservicios...${NC}"
for svc_dir in ./microservices/*/; do
  if [ -f "${svc_dir}Dockerfile" ]; then
    svc_name=$(basename "$svc_dir")
    echo -e "  Construyendo ecrt/$svc_name:latest..."
    docker build -t "ecrt/$svc_name:latest" "$svc_dir"
  else
    echo -e "${RED}  No Dockerfile en $svc_dir, omitiendo${NC}"
  fi
done

# 6. Crear archivos de secrets (si no existen)
mkdir -p secrets
if [ ! -f secrets/jwt_secret.txt ]; then
  echo "super_secret_jwt_key_for_ecrt_2024" > secrets/jwt_secret.txt
fi
if [ ! -f secrets/encryption_key.txt ]; then
  echo "0123456789abcdef0123456789abcdef" > secrets/encryption_key.txt
fi

# 7. Configurar prometheus (si no existe)
if [ ! -f prometheus/prometheus.yml ]; then
  cat > prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: 'kong'
    static_configs:
      - targets: ['kong:8001']
  - job_name: 'microservices'
    static_configs:
      - targets:
        - 'auth-service:3001'
        - 'device-service:3002'
        - 'org-service:3003'
        - 'ad-service:3004'
        - 'finance-service:3005'
        - 'message-service:3006'
        - 'media-service:3007'
        - 'bi-service:3008'
        - 'crypto-service:3009'
EOF
fi

# 8. Configurar promtail (si no existe)
if [ ! -f promtail-config.yaml ]; then
  cat > promtail-config.yaml << 'EOF'
server:
  http_listen_port: 9080
positions:
  filename: /tmp/positions.yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_label_com_docker_compose_service']
        target_label: 'service'
EOF
fi

# 9. Generar archivo docker-stack.yml final
echo -e "${YELLOW}Generando docker-stack.yml...${NC}"
cat > docker-stack.yml << 'EOF'
version: '3.8'

networks:
  ecrt-net:
    external: true

volumes:
  postgres_data:
  redis_data:
  caddy_data:
  media_uploads:
  grafana-storage:

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  encryption_key:
    file: ./secrets/encryption_key.txt

services:
  # INFRAESTRUCTURA
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_DB: portal_ecrt
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ecrt-net
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - ecrt-net
    deploy:
      replicas: 1
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # API GATEWAY
  kong:
    image: kong:3.6-ubuntu
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: "/etc/kong/kong.yml"
      KONG_PROXY_ACCESS_LOG: "/dev/stdout"
      KONG_ADMIN_ACCESS_LOG: "/dev/stdout"
    ports:
      - "8000:8000"
      - "8001:8001"
    volumes:
      - ./api-gateway/kong.yml:/etc/kong/kong.yml:ro
    networks:
      - ecrt-net
    deploy:
      replicas: 1
      resources:
        limits:
          memory: 256M

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    command: caddy reverse-proxy --from localhost --to http://kong:8000
    volumes:
      - caddy_data:/data
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  # MICROSERVICIOS (solo uno de cada para simplificar, puedes escalar después)
  crypto-service:
    image: ecrt/crypto-service:latest
    environment:
      PORT: 3009
      ENCRYPTION_KEY_FILE: /run/secrets/encryption_key
    secrets:
      - encryption_key
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  auth-service:
    image: ecrt/auth-service:latest
    environment:
      PORT: 3001
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASS: ""
      DB_NAME: auth_db
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      SETUP_MASTER_KEY: Prueba01*
      CRYPTO_SERVICE_URL: http://crypto-service:3009
    secrets:
      - jwt_secret
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  device-service:
    image: ecrt/device-service:latest
    environment:
      PORT: 3002
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASS: ""
      DB_NAME: device_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      CRYPTO_SERVICE_URL: http://crypto-service:3009
    secrets:
      - jwt_secret
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  org-service:
    image: ecrt/org-service:latest
    environment:
      PORT: 3003
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASS: ""
      DB_NAME: org_db
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      CRYPTO_SERVICE_URL: http://crypto-service:3009
      AUTH_SERVICE_URL: http://auth-service:3001
    secrets:
      - jwt_secret
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  ad-service:
    image: ecrt/ad-service:latest
    environment:
      PORT: 3004
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASS: ""
      DB_NAME: ad_db
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      CRYPTO_SERVICE_URL: http://crypto-service:3009
      DEVICE_SERVICE_URL: http://device-service:3002
    secrets:
      - jwt_secret
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  finance-service:
    image: ecrt/finance-service:latest
    environment:
      PORT: 3005
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASS: ""
      DB_NAME: finance_db
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      CRYPTO_SERVICE_URL: http://crypto-service:3009
    secrets:
      - jwt_secret
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  message-service:
    image: ecrt/message-service:latest
    environment:
      PORT: 3006
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASS: ""
      DB_NAME: message_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      CRYPTO_SERVICE_URL: http://crypto-service:3009
    secrets:
      - jwt_secret
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  media-service:
    image: ecrt/media-service:latest
    environment:
      PORT: 3007
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      CRYPTO_SERVICE_URL: http://crypto-service:3009
      BASE_API_URL: http://localhost:8000/api/v1/media/private
      USE_S3: "false"
    volumes:
      - media_uploads:/usr/src/app/uploads
    secrets:
      - jwt_secret
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  bi-service:
    image: ecrt/bi-service:latest
    environment:
      PORT: 3008
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASS: ""
      DB_NAME: portal_ecrt
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      CRYPTO_SERVICE_URL: http://crypto-service:3009
    secrets:
      - jwt_secret
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  # OBSERVABILIDAD
  jaeger:
    image: jaegertracing/all-in-one:latest
    environment:
      COLLECTOR_OTLP_ENABLED: "true"
    ports:
      - "16686:16686"
      - "4317:4317"
      - "4318:4318"
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    ports:
      - "9090:9090"
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3000:3000"
    volumes:
      - grafana-storage:/var/lib/grafana
    networks:
      - ecrt-net
    deploy:
      replicas: 1

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    networks:
      - ecrt-net
    deploy:
      replicas: 1
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./promtail-config.yaml:/etc/promtail/config.yaml
    networks:
      - ecrt-net
    deploy:
      replicas: 1
    command: -config.file=/etc/promtail/config.yaml
EOF

# 10. Desplegar stack
echo -e "${YELLOW}Desplegando stack...${NC}"
docker stack deploy -c docker-stack.yml ecrt --resolve-image always

echo -e "\n${GREEN}✅ Despliegue completado.${NC}"
echo -e "${YELLOW}Para ver el estado:${NC} docker stack ps ecrt"
echo -e "${YELLOW}Para escalar:${NC} docker service scale ecrt_auth-service=3"
echo -e "${YELLOW}Para eliminar:${NC} docker stack rm ecrt"