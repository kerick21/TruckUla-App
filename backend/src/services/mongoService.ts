import { MongoClient, Db, Collection } from 'mongodb'

export class MongoService {
  private client: MongoClient
  private db: Db | null = null

  constructor(url: string) {
    this.client = new MongoClient(url)
  }

  async connect() {
    await this.client.connect()
    this.db = this.client.db('waze_db')
    console.log('MongoDB conectado')

    // Crear índices
    await this.createIndexes()
  }

  private async createIndexes() {
    if (!this.db) return

    // Índices para reportes
    const reportsCollection = this.db.collection('reports')
    await reportsCollection.createIndex({ lat: 1, lon: 1 })
    await reportsCollection.createIndex({ createdAt: -1 })
    await reportsCollection.createIndex({ userId: 1 })

    // Índices para eventos de tráfico
    const trafficEventsCollection = this.db.collection('traffic_events')
    await trafficEventsCollection.createIndex({ lat: 1, lon: 1 })
    await trafficEventsCollection.createIndex({ timestamp: -1 })

    // Índices para historial de usuarios
    const userHistoryCollection = this.db.collection('user_history')
    await userHistoryCollection.createIndex({ userId: 1 })
    await userHistoryCollection.createIndex({ timestamp: -1 })
  }

  async disconnect() {
    await this.client.close()
  }

  // Reportes
  async addReport(report: any) {
    if (!this.db) throw new Error('MongoDB no conectado')
    const collection = this.db.collection('reports')
    const result = await collection.insertOne(report)
    return result.insertedId
  }

  async getReports(query: any = {}) {
    if (!this.db) throw new Error('MongoDB no conectado')
    const collection = this.db.collection('reports')
    return await collection.find(query).toArray()
  }

  async updateReport(id: string, update: any) {
    if (!this.db) throw new Error('MongoDB no conectado')
    const collection = this.db.collection('reports')
    const { ObjectId } = require('mongodb')
    return await collection.updateOne({ _id: new ObjectId(id) }, { $set: update })
  }

  // Eventos de tráfico
  async addTrafficEvent(event: any) {
    if (!this.db) throw new Error('MongoDB no conectado')
    const collection = this.db.collection('traffic_events')
    return await collection.insertOne(event)
  }

  async getTrafficEvents(query: any = {}) {
    if (!this.db) throw new Error('MongoDB no conectado')
    const collection = this.db.collection('traffic_events')
    return await collection.find(query).toArray()
  }

  // Historial de usuarios
  async addUserHistory(history: any) {
    if (!this.db) throw new Error('MongoDB no conectado')
    const collection = this.db.collection('user_history')
    return await collection.insertOne(history)
  }

  async getUserHistory(userId: string) {
    if (!this.db) throw new Error('MongoDB no conectado')
    const collection = this.db.collection('user_history')
    return await collection.find({ userId }).toArray()
  }

  // Estadísticas
  async getStatistics() {
    if (!this.db) throw new Error('MongoDB no conectado')

    const reportsCount = await this.db.collection('reports').countDocuments()
    const trafficEventsCount = await this.db.collection('traffic_events').countDocuments()
    const userHistoryCount = await this.db.collection('user_history').countDocuments()

    return {
      reportsCount,
      trafficEventsCount,
      userHistoryCount,
    }
  }
}

export const createMongoService = (url: string) => new MongoService(url)
