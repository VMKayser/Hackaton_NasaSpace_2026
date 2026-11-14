import { useI18n } from '../i18n'
import { IMAGERY, LUNAR_SOUTH_POLE } from './planetaryImagery'
import type { Planet } from './planetaryImagery'

export function PlanetFallback({ body, polar = false }: { body: Planet; polar?: boolean }) {
  const { t } = useI18n()
  const image = polar ? LUNAR_SOUTH_POLE : IMAGERY[body].fallback
  return (
    <figure className="absolute inset-0 flex flex-col items-center bg-black">
      <img
        src={`${import.meta.env.BASE_URL}imagery/${image.file}`}
        alt={polar ? t('map.lunarPole') : t(`body.${body}`)}
        className="min-h-0 w-full flex-1 object-contain"
      />
      <figcaption className="flex w-full flex-wrap items-center gap-x-2 bg-space px-2 py-1 text-[10px] text-white">
        {polar ? t('map.lunarPole') : t('map.static')}
        <a className="underline underline-offset-2" href={image.url} target="_blank" rel="noopener noreferrer">{image.credit}</a>
      </figcaption>
    </figure>
  )
}
