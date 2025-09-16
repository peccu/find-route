import type { Route, RouteGroup } from '../types'

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

export function loadRouteGroups(): RouteGroup[] {
  const raw = localStorage.getItem(LS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Route[] | RouteFileV2
    if (Array.isArray(parsed)) {
      const group: RouteGroup = {
        id: 'routegroup-000',
        name: 'Default ',
        routes: parsed.routes,
      }
      return [group]
    } else if (parsed.version === 2) {
      return parsed.groups
    }
    return []
  } catch {
    return []
  }
}

export function saveRouteGroups(groups: RouteGroup[]) {
  const file: RouteFileV2 = {
    version: 2,
    groups,
  }
  localStorage.setItem(LS_KEY, JSON.stringify(file))
}

export function clearRoutes() {
  localStorage.removeItem(LS_KEY)
}
