type LatLng = {
  lat?: number
  lng?: number
}

/**
 * 2地点間の距離をメートル単位で計算 (haversine formula)
 */
function haversineDistance(a: LatLng, b: LatLng): number {
  if (!a.lat || !a.lng || !b.lat || !b.lng) {
    return 10e1000
  }
  const R = 6371e3 // 地球の半径 (m)
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const φ1 = toRad(a.lat)
  const φ2 = toRad(b.lat)
  const Δφ = toRad(b.lat - a.lat)
  const Δλ = toRad(b.lng - a.lng)

  const x =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

/**
 * 配列から指定位置に最も近い要素を返す
 */
export function findNearest<T extends LatLng>(
  locations: T[],
  target: LatLng,
): T | null {
  if (locations.length === 0) return null

  return locations.reduce((nearest, current) => {
    const nearestDist = haversineDistance(nearest, target)
    const currentDist = haversineDistance(current, target)
    return currentDist < nearestDist ? current : nearest
  })
}
