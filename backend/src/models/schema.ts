import { pgTable, text, integer, real, timestamp, boolean, varchar, jsonb, index } from 'drizzle-orm/pg-core'

// Usuarios
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  avatar: text('avatar'),
  points: integer('points').default(0),
  level: integer('level').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Ubicaciones (histórico)
export const locations = pgTable(
  'locations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    lat: real('lat').notNull(),
    lon: real('lon').notNull(),
    speed: real('speed'),
    heading: real('heading'),
    accuracy: real('accuracy'),
    timestamp: timestamp('timestamp').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('locations_user_id_idx').on(table.userId),
    timestampIdx: index('locations_timestamp_idx').on(table.timestamp),
  })
)

// Rutas guardadas
export const savedRoutes = pgTable('saved_routes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  originLat: real('origin_lat').notNull(),
  originLon: real('origin_lon').notNull(),
  destinationLat: real('destination_lat').notNull(),
  destinationLon: real('destination_lon').notNull(),
  distance: real('distance'),
  duration: integer('duration'),
  geometry: jsonb('geometry'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Reportes
export const reports = pgTable(
  'reports',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    type: varchar('type', { length: 50 }).notNull(), // police, accident, hazard, pothole, traffic
    lat: real('lat').notNull(),
    lon: real('lon').notNull(),
    description: text('description'),
    votes: integer('votes').default(1),
    verified: boolean('verified').default(false),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    typeIdx: index('reports_type_idx').on(table.type),
    createdAtIdx: index('reports_created_at_idx').on(table.createdAt),
  })
)

// Datos de tráfico (agregados)
export const trafficData = pgTable(
  'traffic_data',
  {
    id: text('id').primaryKey(),
    lat: real('lat').notNull(),
    lon: real('lon').notNull(),
    avgSpeed: real('avg_speed'),
    maxSpeed: real('max_speed'),
    minSpeed: real('min_speed'),
    congestionLevel: varchar('congestion_level', { length: 20 }), // free, slow, congested, stopped
    sampleCount: integer('sample_count').default(0),
    timestamp: timestamp('timestamp').defaultNow(),
  },
  (table) => ({
    coordIdx: index('traffic_data_coord_idx').on(table.lat, table.lon),
    timestampIdx: index('traffic_data_timestamp_idx').on(table.timestamp),
  })
)

// Calificaciones de usuarios
export const ratings = pgTable('ratings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  ratedUserId: text('rated_user_id').notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Historial de navegación
export const navigationHistory = pgTable(
  'navigation_history',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    originLat: real('origin_lat').notNull(),
    originLon: real('origin_lon').notNull(),
    destinationLat: real('destination_lat').notNull(),
    destinationLon: real('destination_lon').notNull(),
    distance: real('distance'),
    duration: integer('duration'),
    actualDuration: integer('actual_duration'),
    startTime: timestamp('start_time'),
    endTime: timestamp('end_time'),
  },
  (table) => ({
    userIdIdx: index('nav_history_user_id_idx').on(table.userId),
  })
)
