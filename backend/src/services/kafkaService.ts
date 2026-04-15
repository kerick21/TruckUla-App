import { KafkaClient, Producer, Consumer } from 'kafka-node'

interface LocationEvent {
  userId: string
  lat: number
  lon: number
  speed: number
  timestamp: number
}

interface TrafficEvent {
  lat: number
  lon: number
  avgSpeed: number
  congestionLevel: string
  timestamp: number
}

export class KafkaService {
  private client: KafkaClient
  private producer: Producer
  private consumer: Consumer

  constructor(brokers: string[]) {
    this.client = new KafkaClient({ kafkaHost: brokers.join(',') })
    this.producer = new Producer(this.client)
    this.consumer = new Consumer(this.client, [], { autoCommit: true })

    this.setupProducer()
  }

  private setupProducer() {
    this.producer.on('ready', () => {
      console.log('Kafka Producer listo')
    })

    this.producer.on('error', (err) => {
      console.error('Error en Kafka Producer:', err)
    })
  }

  async publishLocationEvent(event: LocationEvent) {
    return new Promise((resolve, reject) => {
      const payloads = [
        {
          topic: 'location-events',
          messages: JSON.stringify(event),
        },
      ]

      this.producer.send(payloads, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  async publishTrafficEvent(event: TrafficEvent) {
    return new Promise((resolve, reject) => {
      const payloads = [
        {
          topic: 'traffic-events',
          messages: JSON.stringify(event),
        },
      ]

      this.producer.send(payloads, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  async publishReportEvent(report: any) {
    return new Promise((resolve, reject) => {
      const payloads = [
        {
          topic: 'report-events',
          messages: JSON.stringify(report),
        },
      ]

      this.producer.send(payloads, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  subscribeToLocationEvents(callback: (event: LocationEvent) => void) {
    this.consumer.addTopics(['location-events'], () => {
      this.consumer.on('message', (message) => {
        try {
          const event = JSON.parse(message.value as string)
          callback(event)
        } catch (err) {
          console.error('Error parsing Kafka message:', err)
        }
      })
    })
  }

  subscribeToTrafficEvents(callback: (event: TrafficEvent) => void) {
    this.consumer.addTopics(['traffic-events'], () => {
      this.consumer.on('message', (message) => {
        try {
          const event = JSON.parse(message.value as string)
          callback(event)
        } catch (err) {
          console.error('Error parsing Kafka message:', err)
        }
      })
    })
  }

  close() {
    this.producer.close()
    this.consumer.close()
    this.client.close()
  }
}

export const createKafkaService = (brokers: string[]) => 
  new KafkaService(brokers)
