interface TrafficCondition {
  congestionLevel: 'free' | 'slow' | 'congested' | 'stopped'
  avgSpeed: number
}

interface ETAInput {
  distance: number // en km
  baseSpeed: number // velocidad base en km/h
  trafficConditions: TrafficCondition[]
  timeOfDay: Date
  dayOfWeek: number
}

export class ETACalculator {
  private trafficFactors = {
    free: 1.0,
    slow: 1.3,
    congested: 1.6,
    stopped: 2.0,
  }

  private timeFactors = {
    morning_rush: 1.4, // 7-9 AM
    evening_rush: 1.5, // 5-7 PM
    night: 0.8, // 10 PM - 6 AM
    midday: 1.0, // 10 AM - 4 PM
  }

  private dayFactors = {
    weekday: 1.0,
    weekend: 0.7,
  }

  private getTimeOfDayFactor(date: Date): number {
    const hour = date.getHours()

    if (hour >= 7 && hour < 9) return this.timeFactors.morning_rush
    if (hour >= 17 && hour < 19) return this.timeFactors.evening_rush
    if (hour >= 22 || hour < 6) return this.timeFactors.night
    return this.timeFactors.midday
  }

  private getDayFactor(dayOfWeek: number): number {
    return dayOfWeek === 0 || dayOfWeek === 6
      ? this.dayFactors.weekend
      : this.dayFactors.weekday
  }

  private getAverageTrafficFactor(conditions: TrafficCondition[]): number {
    if (conditions.length === 0) return 1.0

    const totalFactor = conditions.reduce((sum, condition) => {
      return sum + this.trafficFactors[condition.congestionLevel]
    }, 0)

    return totalFactor / conditions.length
  }

  calculateETA(input: ETAInput): {
    eta: number // en minutos
    confidence: number // 0-1
    breakdown: any
  } {
    // Calcular tiempo base
    const baseTime = (input.distance / input.baseSpeed) * 60 // en minutos

    // Aplicar factores
    const trafficFactor = this.getAverageTrafficFactor(input.trafficConditions)
    const timeFactor = this.getTimeOfDayFactor(input.timeOfDay)
    const dayFactor = this.getDayFactor(input.timeOfDay.getDay())

    // ETA final
    const eta = baseTime * trafficFactor * timeFactor * dayFactor

    // Calcular confianza
    const confidence = Math.min(1, 0.7 + input.trafficConditions.length * 0.05)

    return {
      eta: Math.round(eta),
      confidence,
      breakdown: {
        baseTime: Math.round(baseTime),
        trafficFactor,
        timeFactor,
        dayFactor,
      },
    }
  }

  calculateETARange(input: ETAInput): {
    min: number
    max: number
    estimated: number
  } {
    const { eta, confidence } = this.calculateETA(input)

    // Rango basado en confianza
    const margin = eta * (1 - confidence) * 0.5

    return {
      min: Math.max(0, Math.round(eta - margin)),
      max: Math.round(eta + margin),
      estimated: eta,
    }
  }

  recalculateETAWithProgress(
    originalETA: number,
    elapsedTime: number,
    remainingDistance: number,
    currentSpeed: number
  ): number {
    // Recalcular ETA basado en progreso actual
    const remainingTime = (remainingDistance / currentSpeed) * 60

    // Ajustar si estamos adelantados o atrasados
    const originalRemaining = originalETA - elapsedTime
    const adjustment = remainingTime - originalRemaining

    return Math.round(elapsedTime + remainingTime)
  }
}

export const createETACalculator = () => new ETACalculator()
