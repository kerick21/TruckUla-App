import { Server as SocketServer } from 'socket.io'
import { Server } from 'http'

interface LocationUpdate {
  userId: string
  lat: number
  lon: number
  speed: number
  heading: number
  timestamp: number
}

interface Report {
  id: string
  type: string
  lat: number
  lon: number
  description: string
  userId: string
  createdAt: Date
}

export class RealtimeService {
  private io: SocketServer
  private activeUsers = new Map<string, LocationUpdate>()
  private reports = new Map<string, Report>()

  constructor(httpServer: Server) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        methods: ['GET', 'POST'],
      },
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Usuario conectado: ${socket.id}`)

      // Enviar usuarios activos al nuevo usuario
      socket.emit('active-users', Array.from(this.activeUsers.values()))
      socket.emit('reports', Array.from(this.reports.values()))

      // Escuchar actualizaciones de ubicación
      socket.on('location-update', (data: LocationUpdate) => {
        this.activeUsers.set(socket.id, {
          ...data,
          userId: socket.id,
          timestamp: Date.now(),
        })

        // Broadcast a todos los usuarios
        this.io.emit('location-update', {
          userId: socket.id,
          ...data,
        })
      })

      // Escuchar nuevos reportes
      socket.on('report', (data: Omit<Report, 'id' | 'userId' | 'createdAt'>) => {
        const report: Report = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          userId: socket.id,
          createdAt: new Date(),
        }

        this.reports.set(report.id, report)

        // Broadcast a todos
        this.io.emit('new-report', report)
      })

      // Escuchar votos en reportes
      socket.on('report-vote', (reportId: string) => {
        const report = this.reports.get(reportId)
        if (report) {
          this.io.emit('report-voted', { reportId, userId: socket.id })
        }
      })

      // Escuchar desconexión
      socket.on('disconnect', () => {
        this.activeUsers.delete(socket.id)
        this.io.emit('user-disconnected', socket.id)
        console.log(`Usuario desconectado: ${socket.id}`)
      })
    })
  }

  broadcastLocationUpdate(update: LocationUpdate) {
    this.io.emit('location-update', update)
  }

  broadcastReport(report: Report) {
    this.io.emit('new-report', report)
  }

  broadcastTrafficUpdate(lat: number, lon: number, congestionLevel: string) {
    this.io.emit('traffic-update', { lat, lon, congestionLevel })
  }

  getActiveUsers() {
    return Array.from(this.activeUsers.values())
  }

  getReports() {
    return Array.from(this.reports.values())
  }
}

export const createRealtimeService = (httpServer: Server) => 
  new RealtimeService(httpServer)
