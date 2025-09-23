export const mapUrl = (lat: number | null, lng: number | null) => {
  if (!lat || !lng) {
    return ''
  }
  const center = `lonlat:${lng},${lat}`
  const params = {
    style: 'osm-liberty',
    width: 256,
    height: 192,
    zoom: 17,
    scaleFactor: 2,
    // origin limited api key
    // https://myprojects.geoapify.com/
    apiKey: '9d476bd4d6744d56b932a584dea9243f',
  }
  const url = new URL('https://maps.geoapify.com/v1/staticmap')
  const search = new URLSearchParams()
  Object.entries(params).map(([key, value]) =>
    search.append(key, String(value)),
  )
  url.search = search.toString() + `&center=${center}`
  return url.toString()
}
