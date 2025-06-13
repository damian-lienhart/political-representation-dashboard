export const mockGeoData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { NAME: 'Zürich' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    },
    {
      type: 'Feature',
      properties: { NAME: 'Bern' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]
      }
    }
  ]
}
