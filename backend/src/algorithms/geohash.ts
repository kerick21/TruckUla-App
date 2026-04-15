export class GeohashAlgorithm {
  private BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

  encode(lat: number, lon: number, precision: number = 11): string {
    let idx = 0
    let bit = 0
    let evenBit = true
    let geohash = ''

    let latMin = -90,
      latMax = 90
    let lonMin = -180,
      lonMax = 180

    while (geohash.length < precision) {
      if (evenBit) {
        const lonMid = (lonMin + lonMax) / 2
        if (lon > lonMid) {
          idx = (idx << 1) + 1
          lonMin = lonMid
        } else {
          idx = idx << 1
          lonMax = lonMid
        }
      } else {
        const latMid = (latMin + latMax) / 2
        if (lat > latMid) {
          idx = (idx << 1) + 1
          latMin = latMid
        } else {
          idx = idx << 1
          latMax = latMid
        }
      }

      evenBit = !evenBit

      if (++bit === 5) {
        geohash += this.BASE32[idx]
        bit = 0
        idx = 0
      }
    }

    return geohash
  }

  decode(geohash: string): { lat: number; lon: number; latErr: number; lonErr: number } {
    let evenBit = true
    let latMin = -90,
      latMax = 90
    let lonMin = -180,
      lonMax = 180

    for (let i = 0; i < geohash.length; i++) {
      const idx = this.BASE32.indexOf(geohash[i])

      for (let mask = 16; mask > 0; mask >>= 1) {
        if (evenBit) {
          const lonMid = (lonMin + lonMax) / 2
          if (idx & mask) {
            lonMin = lonMid
          } else {
            lonMax = lonMid
          }
        } else {
          const latMid = (latMin + latMax) / 2
          if (idx & mask) {
            latMin = latMid
          } else {
            latMax = latMid
          }
        }
        evenBit = !evenBit
      }
    }

    const lat = (latMin + latMax) / 2
    const lon = (lonMin + lonMax) / 2
    const latErr = latMax - lat
    const lonErr = lonMax - lon

    return { lat, lon, latErr, lonErr }
  }

  neighbors(geohash: string): { n: string; s: string; e: string; w: string } {
    const lastChr = geohash[geohash.length - 1]
    const parent = geohash.slice(0, -1)

    const type = geohash.length % 2

    const neighbor = {
      n: { even: 'p0r21436x8zb9dcf5h7kjnmqesgutwvy', odd: 'bc01fg45238967deuvhjyznpkmstqrwx' },
      s: { even: '14365h7k9dcfesgujnmqp0r2twvyx8zb', odd: '238967debc01fg45kmstqrwxuvhjyznp' },
      e: { even: 'bc01fg45238967deuvhjyznpkmstqrwx', odd: 'p0r21436x8zb9dcf5h7kjnmqesgutwvy' },
      w: { even: '238967debc01fg45kmstqrwxuvhjyznp', odd: '14365h7k9dcfesgujnmqp0r2twvyx8zb' },
    }

    const border = {
      n: { even: 'prxz', odd: 'bcfguvyz' },
      s: { even: '028b', odd: '0145hjnp' },
      e: { even: 'bcfguvyz', odd: 'prxz' },
      w: { even: '0145hjnp', odd: '028b' },
    }

    if (border[type as keyof typeof border][lastChr as any]) {
      parent = this.neighbors(parent)[type as keyof typeof neighbor]
    }

    return {
      n: parent + this.BASE32[neighbor.n[type as keyof typeof neighbor.n].indexOf(lastChr)],
      s: parent + this.BASE32[neighbor.s[type as keyof typeof neighbor.s].indexOf(lastChr)],
      e: parent + this.BASE32[neighbor.e[type as keyof typeof neighbor.e].indexOf(lastChr)],
      w: parent + this.BASE32[neighbor.w[type as keyof typeof neighbor.w].indexOf(lastChr)],
    }
  }

  nearby(geohash: string, radius: number = 1): string[] {
    const nearby = [geohash]
    let current = geohash

    for (let i = 0; i < radius; i++) {
      const neighbors = this.neighbors(current)
      nearby.push(neighbors.n, neighbors.s, neighbors.e, neighbors.w)
      current = neighbors.n
    }

    return [...new Set(nearby)]
  }
}

export const createGeohashAlgorithm = () => new GeohashAlgorithm()
