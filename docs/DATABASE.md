# Arquitectura de Bases de Datos

## PostgreSQL + PostGIS

### Tablas principales

- **users**: Información de usuarios
- **locations**: Histórico de ubicaciones GPS
- **saved_routes**: Rutas guardadas por usuarios
- **reports**: Reportes de incidentes
- **traffic_data**: Datos agregados de tráfico
- **ratings**: Calificaciones entre usuarios
- **navigation_history**: Historial de navegaciones

### Índices geoespaciales

```sql
-- Crear índice GiST para búsquedas geoespaciales
CREATE INDEX locations_geom_idx ON locations USING GIST (
  ST_MakePoint(lon, lat)
);

-- Búsqueda de puntos cercanos
SELECT * FROM locations 
WHERE ST_DWithin(
  ST_MakePoint(lon, lat)::geography,
  ST_MakePoint(-74.0060, 40.7128)::geography,
  1000 -- 1km en metros
);
```

## MongoDB

### Colecciones

- **reports**: Reportes de usuarios (con geohash)
- **traffic_events**: Eventos de tráfico en tiempo real
- **user_history**: Historial de navegaciones por usuario

### Índices

```javascript
// Reportes
db.reports.createIndex({ lat: 1, lon: 1 })
db.reports.createIndex({ createdAt: -1 })
db.reports.createIndex({ userId: 1 })

// Eventos de tráfico
db.traffic_events.createIndex({ lat: 1, lon: 1 })
db.traffic_events.createIndex({ timestamp: -1 })

// Historial de usuarios
db.user_history.createIndex({ userId: 1 })
db.user_history.createIndex({ timestamp: -1 })
```

## Redis

### Tipos de datos

- **Strings**: Sesiones, cache de rutas
- **Hashes**: Ubicaciones en tiempo real
- **Sorted Sets**: Leaderboards, rankings
- **Pub/Sub**: Broadcast de eventos

### Claves principales

```
session:{sessionId}          # Sesión de usuario
location:{userId}            # Ubicación actual
route:{origin}:{destination} # Ruta cacheada
traffic:{lat}:{lon}          # Datos de tráfico
```

## ClickHouse

### Tablas de analítica

- **location_events**: Eventos de ubicación
- **traffic_events**: Eventos de tráfico
- **report_events**: Eventos de reportes
- **user_events**: Eventos de usuarios

### Consultas típicas

```sql
-- Velocidad promedio por hora
SELECT 
  toStartOfHour(timestamp) as hour,
  avg(speed) as avg_speed
FROM location_events
WHERE date >= today() - 7
GROUP BY hour
ORDER BY hour DESC

-- Reportes por tipo
SELECT 
  type,
  count() as count,
  avg(votes) as avg_votes
FROM report_events
WHERE date >= today() - 30
GROUP BY type
ORDER BY count DESC
```

## Migraciones

```bash
# Generar migración
npm run db:generate

# Aplicar migraciones
npm run db:push

# Ver estado
npm run db:status
```

## Backup y Recovery

```bash
# Backup PostgreSQL
pg_dump waze_db > backup.sql

# Restore PostgreSQL
psql waze_db < backup.sql

# Backup MongoDB
mongodump --db waze_db --out backup/

# Restore MongoDB
mongorestore --db waze_db backup/waze_db/
```
