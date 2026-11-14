import { addProtocol } from 'maplibre-gl'
import { IMAGERY, MARS_DETAIL } from './planetaryImagery'

// NASA Trek uses two equirectangular tiles at level zero. Match the column
// widths at each level, then resample the rows to MapLibre's Mercator grid.
addProtocol('planet-trek', async ({ url }, { signal }) => {
  const { hostname, pathname } = new URL(url)
  if (hostname !== 'mars' && hostname !== 'moon' && hostname !== 'mars-ctx') throw new Error('Unknown map imagery')
  const [zoom, x, y] = pathname.slice(1).split('/').map(Number)
  const tileSize = hostname === 'mars-ctx' ? 512 : 256
  const tileUrl = (level: number, row: number, column: number) => hostname === 'mars-ctx'
    ? `${MARS_DETAIL.url}/${level}/${row}/${column}`
    : `https://trek.nasa.gov/tiles/${IMAGERY[hostname].trekLayer}/1.0.0/default/default028mm/${level}/${row}/${column}.jpg`
  const level = Math.max(0, zoom - 1)
  const columnWidth = zoom === 0 ? tileSize / 2 : tileSize
  const columns = zoom === 0 ? [0, 1] : [x]
  const rowsAtLevel = 2 ** level
  const sourceHeight = tileSize * rowsAtLevel
  const sourceRows = Array.from({ length: tileSize }, (_, row) => {
    const mercatorY = (y + (row + 0.5) / tileSize) / (2 ** zoom)
    const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * mercatorY)))
    return Math.max(0, Math.min(sourceHeight - 1, (0.5 - lat / Math.PI) * sourceHeight - 0.5))
  })

  const canvas = new OffscreenCanvas(tileSize, tileSize)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Cannot prepare map tiles')
  const firstRow = Math.floor(sourceRows[0] / tileSize)
  const lastRow = Math.floor(sourceRows[tileSize - 1] / tileSize)

  const jobs = columns.flatMap((column, columnIndex) =>
    Array.from({ length: lastRow - firstRow + 1 }, async (_, index) => {
      const tileRow = index + firstRow
      const response = await fetch(tileUrl(level, tileRow, column), { signal })
      if (!response.ok) throw new Error(`Planetary imagery returned ${response.status}`)
      const bitmap = await createImageBitmap(await response.blob())
      try {
        signal.throwIfAborted()
        sourceRows.forEach((sourceRow, outputRow) => {
          if (Math.floor(sourceRow / tileSize) !== tileRow) return
          context.drawImage(
            bitmap, 0, Math.min(tileSize - 1, sourceRow % tileSize), tileSize, 1,
            columnIndex * columnWidth, outputRow, columnWidth, 1,
          )
        })
      } finally {
        bitmap.close()
      }
    }),
  )
  await Promise.all(jobs)
  return { data: canvas.transferToImageBitmap() }
})
