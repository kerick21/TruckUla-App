# DevOps - Waze Clone

## Docker

### Build

```bash
# Backend
docker build -t waze-backend:latest ./backend

# Frontend
docker build -t waze-frontend:latest ./frontend/web

# Todos los servicios
docker-compose build
```

### Run

```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

## Kubernetes

### Instalación

```bash
# Crear namespace
kubectl create namespace waze

# Crear secrets
kubectl create secret generic waze-secrets \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=redis-url=$REDIS_URL \
  --from-literal=mongodb-url=$MONGODB_URL \
  -n waze

# Aplicar manifests
kubectl apply -f devops/kubernetes/deployment.yaml
```

### Verificar estado

```bash
# Ver pods
kubectl get pods -n waze

# Ver servicios
kubectl get services -n waze

# Ver logs
kubectl logs -f deployment/waze-backend -n waze
```

### Escalado

```bash
# Manual
kubectl scale deployment waze-backend --replicas=5 -n waze

# Automático (HPA)
kubectl get hpa -n waze
```

## CI/CD con GitHub Actions

### Flujo

1. **Test**: Ejecuta linter y tests
2. **Build**: Construye imágenes Docker
3. **Push**: Sube a Container Registry
4. **Deploy**: Actualiza Kubernetes

### Configuración de secrets

```bash
# KUBE_CONFIG
cat ~/.kube/config | base64 | xclip -selection clipboard

# Pegar en GitHub Secrets
```

## Monitoreo

### Prometheus

```bash
# Acceso
http://localhost:9090

# Queries útiles
rate(http_requests_total[5m])
container_memory_usage_bytes
container_cpu_usage_seconds_total
```

### Grafana

```bash
# Acceso
http://localhost:3002

# Usuario: admin
# Contraseña: admin
```

## Logging

### ELK Stack

```bash
# Elasticsearch
docker run -d -p 9200:9200 docker.elastic.co/elasticsearch/elasticsearch:8.0.0

# Kibana
docker run -d -p 5601:5601 docker.elastic.co/kibana/kibana:8.0.0
```

## Backup

### PostgreSQL

```bash
# Backup
pg_dump waze_db > backup.sql

# Restore
psql waze_db < backup.sql
```

### MongoDB

```bash
# Backup
mongodump --db waze_db --out backup/

# Restore
mongorestore --db waze_db backup/waze_db/
```

## Troubleshooting

### Pod no inicia

```bash
kubectl describe pod <pod-name> -n waze
kubectl logs <pod-name> -n waze
```

### Servicio no accesible

```bash
kubectl port-forward svc/waze-backend 3000:3000 -n waze
```

### Limpiar recursos

```bash
# Eliminar namespace
kubectl delete namespace waze

# Eliminar imágenes
docker rmi $(docker images -q)

# Limpiar volúmenes
docker volume prune
```
