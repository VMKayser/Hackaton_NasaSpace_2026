import type { Dimension, Value } from '../data/schema'

type Measurements = Record<string, Value>

export function radarMeasurements(
  dimensions: Dimension[],
  catalog: { values: Measurements }[],
  earthValues: Measurements,
  targetValues: Measurements,
) {
  return dimensions.flatMap((dimension) => {
    const earth = earthValues[dimension.id]
    const target = targetValues[dimension.id]
    if (typeof earth?.value !== 'number' || typeof target?.value !== 'number' || earth.unit !== target.unit) return []

    let min = Math.min(earth.value, target.value)
    let max = Math.max(earth.value, target.value)
    for (const { values } of catalog) {
      const sample = values[dimension.id]
      if (typeof sample?.value === 'number' && sample.unit === earth.unit) {
        min = Math.min(min, sample.value)
        max = Math.max(max, sample.value)
      }
    }
    const position = (value: number) => min === max ? 50 : ((value - min) / (max - min)) * 100

    return [{
      id: dimension.id,
      dimension,
      earth,
      target,
      earthPosition: position(earth.value),
      targetPosition: position(target.value),
    }]
  })
}
