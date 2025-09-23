import type { Event, Route, RouteResult } from '../types'

export function simulateRoute(
  route: Route,
  startTime: number,
): RouteResult | null {
  let currentTime = startTime
  const events: Event[] = []

  for (const leg of route.legs) {
    if (leg.type === 'walk') {
      const departure = currentTime
      const arrival = currentTime + leg.durationMinutes
      events.push({
        legId: leg.id,
        legType: 'walk',
        departure,
        durationMinutes: leg.durationMinutes,
        arrival,
      })
      currentTime = arrival
    } else {
      // find first timetable departure >= currentTime
      const t = leg.timetable.find((t) => t >= currentTime % (24 * 60))
      if (t === undefined) {
        // approach: also allow next-day trains by taking first entry + 24h
        if (leg.timetable.length === 0) return null
        const next = leg.timetable[0] + 24 * 60
        const departure = next + Math.floor(currentTime / (24 * 60)) * 24 * 60
        const arrival = departure + leg.durationMinutes
        events.push({
          legId: leg.id,
          legType: 'train',
          legLine: leg.line,
          legFrom: leg.from,
          legTo: leg.to,
          departure,
          durationMinutes: leg.durationMinutes,
          arrival,
        })
        currentTime = arrival
      } else {
        // t is in same-day minutes; but if currentTime already past midnight offset, align days
        const baseDayOffset = Math.floor(currentTime / (24 * 60)) * 24 * 60
        let departure = baseDayOffset + t
        if (departure < currentTime) departure += 24 * 60
        const arrival = departure + leg.durationMinutes
        events.push({
          legId: leg.id,
          legType: 'train',
          legLine: leg.line,
          legFrom: leg.from,
          legTo: leg.to,
          departure,
          durationMinutes: leg.durationMinutes,
          arrival,
        })
        currentTime = arrival
      }
    }
  }

  return {
    routeId: route.id,
    routeName: route.name,
    routeNote: route.notes,
    arrivalTime: currentTime,
    events,
  }
}
