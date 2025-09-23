// for timetable, routes and route groups
export type WalkLeg = {
  id: string
  type: 'walk'
  durationMinutes: number
}

export type TrainLeg = {
  id: string
  type: 'train'
  line: string
  from: string
  to: string
  // timetable: minutes since 00:00
  timetable: number[]
  durationMinutes: number
  url?: string
}

export type Leg = WalkLeg | TrainLeg

export type Route = {
  id: string
  name: string
  legs: Leg[]
  notes?: string
}

export type RouteFileV1 = {
  version: 1
  routes: Route[]
}

export type RouteGroup = {
  id: string
  name: string
  description?: string
  routes: Route[]
  lat?: number
  lng?: number
}

export type RouteFileV2 = {
  version: 2
  groups: RouteGroup[]
}

// for found results
export type Event = {
  legId: string
  legType: 'walk' | 'train'
  legLine?: string
  legFrom?: string
  legTo?: string
  departure: number // minutes since 00:00 (can exceed 1440)
  durationMinutes: number
  arrival: number
}

export type RouteResult = {
  routeId: string
  routeName: string
  routeNote?: string
  arrivalTime: number
  events: Event[]
}
