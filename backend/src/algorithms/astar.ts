import PriorityQueue from 'priorityqueuejs'

interface Node {
  id: string
  lat: number
  lon: number
  neighbors: Edge[]
}

interface Edge {
  to: string
  weight: number
}

interface AStarResult {
  path: string[]
  distance: number
  cost: number
}

export class AStarAlgorithm {
  private nodes: Map<string, Node> = new Map()

  addNode(id: string, lat: number, lon: number) {
    this.nodes.set(id, { id, lat, lon, neighbors: [] })
  }

  addEdge(from: string, to: string, weight: number) {
    const fromNode = this.nodes.get(from)
    if (fromNode) {
      fromNode.neighbors.push({ to, weight })
    }
  }

  private heuristic(from: Node, to: Node): number {
    // Distancia Haversine
    const R = 6371 // Radio de la Tierra en km
    const dLat = ((to.lat - from.lat) * Math.PI) / 180
    const dLon = ((to.lon - from.lon) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  findPath(startId: string, endId: string): AStarResult | null {
    const startNode = this.nodes.get(startId)
    const endNode = this.nodes.get(endId)

    if (!startNode || !endNode) return null

    const openSet = new PriorityQueue<{ id: string; fScore: number }>(
      (a, b) => b.fScore - a.fScore
    )

    const cameFrom = new Map<string, string>()
    const gScore = new Map<string, number>()
    const fScore = new Map<string, number>()

    gScore.set(startId, 0)
    fScore.set(startId, this.heuristic(startNode, endNode))

    openSet.enq({ id: startId, fScore: fScore.get(startId)! })

    while (!openSet.isEmpty()) {
      const current = openSet.deq()

      if (current.id === endId) {
        // Reconstruir camino
        const path: string[] = [endId]
        let current_id = endId

        while (cameFrom.has(current_id)) {
          current_id = cameFrom.get(current_id)!
          path.unshift(current_id)
        }

        return {
          path,
          distance: gScore.get(endId) || 0,
          cost: fScore.get(endId) || 0,
        }
      }

      const currentNode = this.nodes.get(current.id)
      if (!currentNode) continue

      for (const edge of currentNode.neighbors) {
        const tentativeGScore = (gScore.get(current.id) || 0) + edge.weight

        if (!gScore.has(edge.to) || tentativeGScore < gScore.get(edge.to)!) {
          cameFrom.set(edge.to, current.id)
          gScore.set(edge.to, tentativeGScore)

          const neighbor = this.nodes.get(edge.to)
          if (neighbor) {
            const newFScore =
              tentativeGScore + this.heuristic(neighbor, endNode)
            fScore.set(edge.to, newFScore)
            openSet.enq({ id: edge.to, fScore: newFScore })
          }
        }
      }
    }

    return null
  }
}

export const createAStarAlgorithm = () => new AStarAlgorithm()
