import type { Route } from '../types'

const LS_KEY = 'route_simulator_routes_v1'

export function loadRoutes(): Route[] {
  const raw = localStorage.getItem(LS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Route[]
    return parsed
  } catch {
    return []
  }
}

export function saveRoutes(routes: Route[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(routes))
}

export function clearRoutes() {
  localStorage.removeItem(LS_KEY)
}
