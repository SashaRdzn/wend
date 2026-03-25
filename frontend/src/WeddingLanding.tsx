import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FlipDigit } from './FlipDigit'
import { OpeningHero } from './OpeningHero'
import { WeddingCalendar } from './WeddingCalendar'
import {
  VENUE_ADDRESS_LINES,
  VENUE_LAT,
  VENUE_LON,
  WEDDING_DATE,
} from './weddingConstants'

const YANDEX_MAPS_ROUTE = `https://yandex.ru/maps/?pt=${VENUE_LON},${VENUE_LAT}&z=16&l=map`
const YANDEX_EMBED_SRC = `https://yandex.ru/map-widget/v1/?ll=${VENUE_LON}%2C${VENUE_LAT}&z=16&l=map&pt=${VENUE_LON}%2C${VENUE_LAT}%2Cpm2rdm`

function useCountdown(to: Date) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, to.getTime() - now)
      if (diff <= 0) {
        setLeft({ d: 0, h: 0, m: 0, s: 0 })
        return
      }
      const s = Math.floor((diff / 1000) % 60)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      setLeft({ d, h, m, s })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [to])
  return left
}

const NAV_LINKS = [
  { href: '#calendar', label: 'Дата' },
  { href: '#map', label: 'Место' },
  { href: '#intro', label: 'Приглашение' },
  { href: '#story', label: 'История' },
  { href: '#schedule', label: 'Программа' },
  { href: '#rsvp', label: 'RSVP' },
]

type DayProgramItem = {
  time: string
  title: string
  text: string
}

// Выбрали самые важные моменты из общего плана.
const DAY_PROGRAM: DayProgramItem[] = [
  {
    time: '14:00-15:00',
    title: 'Фото сессия',
    text: 'Фото с фотографом.',
  },
  {
    time: '15:00-15:30',
    title: 'Встреча гостей',
    text: 'Фуршет и фото-зона.',
  },
  {
    time: '15:40-16:00',
    title: 'Выход пары',
    text: 'Выход и регистрация.',
  },
  {
    time: '16:00',
    title: 'Начало церемонии',
    text: 'Церемония начинается.',
  },
  {
    time: '17:50-18:00',
    title: 'Слайд-шоу и первый танец',
    text: 'Слайд-шоу и первый танец.',
  },
  {
    time: '20:00-20:20',
    title: 'Танец с отцом и торт',
    text: 'Танец и торт родителям.',
  },
  {
    time: '20:50-21:30',
    title: 'Танцевальный марафон',
    text: 'Дискотека и марафон.',
  },
]

type TimelinePoint = { x: number; y: number }

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export type WeddingLandingProps = {
  guestName?: string | null
  showOpenInviteLink?: boolean
  rsvpSlot?: ReactNode
}

export function WeddingLanding({
  guestName,
  showOpenInviteLink,
  rsvpSlot,
}: WeddingLandingProps) {
  const countdown = useCountdown(WEDDING_DATE)
  const [menuOpen, setMenuOpen] = useState(false)

  const scheduleWrapRef = useRef<HTMLDivElement | null>(null)
  const scheduleHeartRef = useRef<HTMLSpanElement | null>(null)
  const scheduleGeomRef = useRef<{
    w: number
    h: number
    padY: number
    innerH: number
    stopPoints: TimelinePoint[]
    stopTs: number[]
    curvePathD: string
  } | null>(null)

  const [scheduleGeom, setScheduleGeom] = useState<{
    w: number
    h: number
    padY: number
    innerH: number
    stopPoints: TimelinePoint[]
    stopTs: number[]
    curvePathD: string
  } | null>(null)

  useEffect(() => {
    let raf = 0

    const pointAtT = (tRaw: number, geom: NonNullable<typeof scheduleGeomRef.current>) => {
      const t = clamp(tRaw, 0, 1)
      const N = geom.stopTs.length
      const segCount = Math.max(1, N - 1)
      const segF = t * segCount
      const segIdx = clamp(Math.floor(segF), 0, segCount - 1)
      const t0 = geom.stopTs[segIdx]
      const t1 = geom.stopTs[segIdx + 1] ?? 1
      const denom = Math.max(1e-6, t1 - t0)
      const u = clamp((t - t0) / denom, 0, 1)
      const ease = (1 - Math.cos(Math.PI * u)) / 2
      const x = lerp(geom.stopPoints[segIdx].x, geom.stopPoints[segIdx + 1]?.x ?? geom.stopPoints[segIdx].x, ease)
      return { x, y: geom.padY + geom.innerH * t }
    }

    const recalc = () => {
      const wrap = scheduleWrapRef.current
      if (!wrap) return

      const rect = wrap.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      if (w <= 0 || h <= 0) return

      // Безопасные отступы сверху/снизу, чтобы сердечко и подписи не обрезались
      // (особенно заметно при overflow-hidden).
      const padY = Math.min(48, Math.max(24, h * 0.035))
      const innerH = Math.max(1, h - padY * 2)

      const N = DAY_PROGRAM.length
      const stopTs = Array.from({ length: N }, (_, i) => (N <= 1 ? 0 : i / (N - 1)))
      // Центрируем "змейку" по ширине блока.
      const leftX = w * 0.36
      const rightX = w * 0.64
      const stopPoints = stopTs.map((t, i) => ({
        x: i % 2 === 0 ? leftX : rightX,
        y: padY + innerH * t,
      }))

      // Long enough sampling for a smooth line.
      const samples = Math.max(180, 30 * (N - 1))
      const curvePoints: TimelinePoint[] = []
      for (let s = 0; s < samples; s++) {
        const t = samples <= 1 ? 0 : s / (samples - 1)
        curvePoints.push(pointAtT(t, { w, h, padY, innerH, stopPoints, stopTs, curvePathD: '' }))
      }

      const curvePathD = curvePoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ')

      const geom = { w, h, padY, innerH, stopPoints, stopTs, curvePathD }
      scheduleGeomRef.current = geom
      setScheduleGeom(geom)

      if (scheduleHeartRef.current) {
        scheduleHeartRef.current.style.left = `${stopPoints[0]?.x ?? 0}px`
        scheduleHeartRef.current.style.top = `${stopPoints[0]?.y ?? 0}px`
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        const geom = scheduleGeomRef.current
        const wrap = scheduleWrapRef.current
        const heartEl = scheduleHeartRef.current
        if (!geom || !wrap || !heartEl) return

        const rect = wrap.getBoundingClientRect()
        if (geom.innerH <= 0) return

        const viewportCenterY = window.innerHeight / 2
        const tRaw = (viewportCenterY - rect.top - geom.padY) / geom.innerH
        const tClamped = clamp(tRaw, 0, 1)

        // Snap to the nearest stop when close.
        let best = geom.stopTs[0]
        let bestDist = Math.abs(tClamped - best)
        for (let i = 1; i < geom.stopTs.length; i++) {
          const d = Math.abs(tClamped - geom.stopTs[i])
          if (d < bestDist) {
            bestDist = d
            best = geom.stopTs[i]
          }
        }
        const SNAP_EPS = 0.02
        const t = bestDist <= SNAP_EPS ? best : tClamped

        const p = pointAtT(t, geom)
        heartEl.style.left = `${p.x}px`
        heartEl.style.top = `${p.y}px`
      })
    }

    // Initial.
    recalc()
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', recalc)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', recalc)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  const openLinkClass =
    'whitespace-nowrap text-xs font-medium text-ink/55 transition-colors hover:text-ink'

  return (
    <>
      <OpeningHero />
      <div id="main" className="relative bg-cream text-ink">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(163,177,138,0.22),transparent_58%),radial-gradient(circle_at_bottom,_rgba(227,213,202,0.4),transparent_55%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col px-3 pb-16 pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:pt-14">
          <header className="flex items-center justify-between gap-3">
            <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-ink/10 bg-white/55 px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase text-ink/65 backdrop-blur sm:px-4 sm:py-1 sm:text-xs sm:tracking-[0.18em]">
              {/* <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage shadow-[0_0_12px_rgba(163,177,138,0.75)]" /> */}
              <span className="truncate">
            
                {guestName ? (
                  <span className="text-ink/75"> · {guestName}</span>
                ) : null}
              </span>
            </div>

            <nav className="hidden items-center gap-6 sm:flex">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-xs font-medium text-ink/55 transition-colors whitespace-nowrap hover:text-ink"
                >
                  {label}
                </a>
              ))}
              {showOpenInviteLink ? (
                <Link to="/" className={openLinkClass}>
                  Открытое приглашение
                </Link>
              ) : null}
            </nav>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/12 bg-white/60 text-ink/70 sm:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {menuOpen ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </header>

          {menuOpen && (
            <nav
              className="fixed inset-0 top-[max(4rem,calc(2.5rem+env(safe-area-inset-top)))] z-50 flex flex-col gap-1 bg-cream/98 px-4 py-4 backdrop-blur-lg sm:hidden"
              aria-label="Мобильное меню"
            >
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-xl py-3 px-4 text-sm font-medium text-ink/85 hover:bg-sand/45 active:bg-sand/55"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              {showOpenInviteLink ? (
                <Link
                  to="/"
                  className="rounded-xl py-3 px-4 text-sm font-medium text-ink/85 hover:bg-sand/45 active:bg-sand/55"
                  onClick={() => setMenuOpen(false)}
                >
                  Открытое приглашение
                </Link>
              ) : null}
            </nav>
          )}

          <section
            id="calendar"
            className="mt-6 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] sm:mt-8 lg:mt-10"
          >
            <div className="mx-auto max-w-3xl px-1 text-center sm:px-4">
              <WeddingCalendar />
            </div>
          </section>

          <section
            id="map"
            className="mt-10 space-y-5 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] border-t border-ink/10 pt-10 sm:mt-12 sm:space-y-6 sm:pt-12 lg:mt-14"
          >
            <div className="text-center sm:text-left">
              <h2 className="font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
                Место проведения
              </h2>
              <p className="mt-2 text-xs text-ink/60 sm:text-sm">
                Соберёмся за городом — ориентир на карте и адрес ниже.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-sand/25 shadow-sm">
              <iframe
                title="Карта места проведения"
                src={YANDEX_EMBED_SRC}
                className="h-64 w-full border-0 sm:h-80 lg:h-[22rem]"
                allowFullScreen
              />
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/60 px-4 py-4 text-sm text-ink/80 sm:rounded-3xl sm:px-6 sm:py-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink/45">
                Адрес
              </p>
              <address className="mt-3 not-italic leading-relaxed">
                {VENUE_ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <a
              href={YANDEX_MAPS_ROUTE}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-ink/10 bg-white/60 px-4 py-2.5 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.98] sm:px-5"
            >
              <span>Построить маршрут</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </section>

          <main className="mt-12 flex flex-col gap-10 border-t border-ink/10 pt-10 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] sm:mt-16 sm:gap-16 sm:pt-12 lg:mt-20 lg:pt-12">
            <section
              id="intro"
              className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start"
            >
              <div className="min-w-0 max-w-xl space-y-6 sm:space-y-8">
                <p className="text-xs uppercase tracking-[0.28em] text-sage sm:text-sm sm:tracking-[0.32em]">
                  приглашение на свадьбу
                </p>
                <h1 className="font-display text-3xl leading-tight text-champagne sm:text-5xl lg:text-6xl">
                  Елизавета <span className="text-sage">&</span> Владимир
                </h1>
                <p className="text-sm text-ink/75 sm:text-base">
                  {guestName ? (
                    <>
                      Уважаемый(ая) {guestName}, мы рады пригласить вас на наше главное событие —
                      уютную камерную свадьбу в кругу самых близких. На этом сайте вы найдёте все
                      детали дня, помощь с дорогой и сможете ответить на приглашение в блоке RSVP ниже.
                    </>
                  ) : (
                    <>
                      Мы рады пригласить вас на наше главное событие — уютную камерную свадьбу в
                      кругу самых близких. На этом сайте вы найдёте все детали дня, помощь с дорогой
                      и сможете ответить на приглашение в блоке RSVP ниже.
                    </>
                  )}
                </p>
                {guestName ? (
                  <p className="text-xs text-ink/60">
                    Эта персональная ссылка помогает нам учесть ваш ответ при подготовке праздника.
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="countdown-block rounded-2xl border border-ink/10 bg-white/55 px-4 py-4 backdrop-blur sm:px-5 sm:py-5">
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink/50">
                      До праздника
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 sm:justify-start">
                      <div className="countdown-cell flex flex-col items-center rounded-xl bg-sand/50 px-2 py-2.5 sm:px-3 sm:py-4">
                        <div className="flex gap-0.5">
                          <FlipDigit value={Math.floor(countdown.d / 100)} />
                          <FlipDigit value={Math.floor(countdown.d / 10) % 10} />
                          <FlipDigit value={countdown.d % 10} />
                        </div>
                        <span className="mt-1.5 text-[10px] uppercase tracking-wider text-ink/45 sm:text-xs">дней</span>
                      </div>
                      <div className="countdown-cell flex flex-col items-center rounded-xl bg-sand/50 px-2 py-3 sm:px-3 sm:py-4">
                        <div className="flex gap-0.5">
                          <FlipDigit value={Math.floor(countdown.h / 10)} />
                          <FlipDigit value={countdown.h % 10} />
                        </div>
                        <span className="mt-1.5 text-[10px] uppercase tracking-wider text-ink/45 sm:text-xs">часов</span>
                      </div>
                      <div className="countdown-cell flex flex-col items-center rounded-xl bg-sand/50 px-2 py-3 sm:px-3 sm:py-4">
                        <div className="flex gap-0.5">
                          <FlipDigit value={Math.floor(countdown.m / 10)} />
                          <FlipDigit value={countdown.m % 10} />
                        </div>
                        <span className="mt-1.5 text-[10px] uppercase tracking-wider text-ink/45 sm:text-xs">минут</span>
                      </div>
                      <div className="countdown-cell flex flex-col items-center rounded-xl bg-sand/50 px-2 py-3 sm:px-3 sm:py-4">
                        <div className="flex gap-0.5">
                          <FlipDigit value={Math.floor(countdown.s / 10)} />
                          <FlipDigit value={countdown.s % 10} />
                        </div>
                        <span className="mt-1.5 text-[10px] uppercase tracking-wider text-ink/45 sm:text-xs">секунд</span>
                      </div>
                    </div>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-ink/10 bg-white/50 p-3 text-[11px] text-ink/75 backdrop-blur sm:mt-8 sm:gap-4 sm:rounded-3xl sm:p-4 sm:text-xs">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.24em] text-ink/45">
                      Дата
                    </dt>
                    <dd className="mt-1 font-medium">6 июня 2026</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.24em] text-ink/45">
                      Дресс‑код
                    </dt>
                    <dd className="mt-1 font-medium">
                      светлый smart casual, акцент&nbsp;— оттенки шалфея и бежа
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="relative min-w-0 space-y-3 sm:space-y-4">
                <div className="grid min-h-[220px] grid-cols-4 grid-rows-4 gap-1.5 sm:min-h-[360px] sm:gap-3">
                  <img src="https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="col-span-2 row-span-2 h-32 w-full rounded-2xl object-cover shadow-lg sm:h-44" style={{ transform: 'rotate(-2deg)' }} />
                  <img src="https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="col-span-2 row-span-1 h-20 w-full rounded-2xl object-cover shadow-lg sm:h-28" style={{ transform: 'rotate(3deg)' }} />
                  <img src="https://images.pexels.com/photos/265705/pexels-photo-265705.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="col-span-1 row-span-1 h-16 w-full rounded-xl object-cover shadow-lg sm:h-20" style={{ transform: 'rotate(-1deg)' }} />
                  <img src="https://images.pexels.com/photos/3014858/pexels-photo-3014858.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="col-span-1 row-span-2 h-28 w-full rounded-xl object-cover shadow-lg sm:h-36" style={{ transform: 'rotate(2deg)' }} />
                  <img src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="col-span-2 row-span-1 h-20 w-full rounded-2xl object-cover shadow-lg sm:h-24" style={{ transform: 'rotate(-3deg)' }} />
                  <img src="https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="col-span-2 row-span-1 h-20 w-full rounded-2xl object-cover shadow-lg sm:h-24" style={{ transform: 'rotate(1deg)' }} />
                  <img src="https://images.pexels.com/photos/5732275/pexels-photo-5732275.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="col-span-1 row-span-1 h-16 w-full rounded-xl object-cover shadow-lg sm:h-20" style={{ transform: 'rotate(2deg)' }} />
                  <img src="https://images.pexels.com/photos/3767235/pexels-photo-3767235.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="col-span-1 row-span-1 h-16 w-full rounded-xl object-cover shadow-lg sm:h-20" style={{ transform: 'rotate(-2deg)' }} />
                  <img src="https://images.pexels.com/photos/1779491/pexels-photo-1779491.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="col-span-2 row-span-1 h-20 w-full rounded-2xl object-cover shadow-lg sm:h-24" style={{ transform: 'rotate(1deg)' }} />
                </div>
                <div className="-mx-1 overflow-hidden rounded-xl sm:mx-0 sm:rounded-2xl">
                  <div className="gallery-live flex w-max gap-2 sm:gap-3">
                    {[
                      'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/5732275/pexels-photo-5732275.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/3951628/pexels-photo-3951628.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/2604692/pexels-photo-2604692.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/3014858/pexels-photo-3014858.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/265705/pexels-photo-265705.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/3767235/pexels-photo-3767235.jpeg?auto=compress&cs=tinysrgb&w=400',
                    ].flatMap((src) => [src, src]).map((src, i) => (
                      <img key={`live-${i}-${src.slice(-20)}`} src={src} alt="" className="h-20 w-28 flex-none rounded-lg object-cover shadow-md sm:h-28 sm:w-44 sm:rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>

          <section
            id="story"
            className="mt-12 grid gap-8 border-t border-ink/10 pt-10 sm:mt-16 sm:pt-12 lg:mt-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10 lg:pt-12"
          >
            <div className="min-w-0 space-y-4 sm:space-y-6">
              <h2 className="font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
                Наша история
              </h2>
              <p className="text-sm text-ink/75">
                Мы познакомились в уютной кофейне в 2019 году. Сначала были совместные проекты, редкие
                сообщения и случайные встречи, а потом — бесконечные прогулки по ночной Москве,
                путешествия и планы на будущее.
              </p>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                <img src="https://images.pexels.com/photos/3767235/pexels-photo-3767235.jpeg?auto=compress&cs=tinysrgb&w=400" alt="" className="col-span-2 row-span-1 h-20 w-full rounded-lg object-cover sm:h-28 sm:rounded-xl" style={{ transform: 'rotate(-1deg)' }} />
                <img src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400" alt="" className="col-span-2 row-span-1 h-20 w-full rounded-lg object-cover sm:h-28 sm:rounded-xl" style={{ transform: 'rotate(2deg)' }} />
                <img src="https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=400" alt="" className="col-span-1 row-span-1 h-16 w-full rounded-lg object-cover sm:h-24 sm:rounded-xl" style={{ transform: 'rotate(1deg)' }} />
                <img src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400" alt="" className="col-span-2 row-span-1 h-16 w-full rounded-lg object-cover sm:h-24 sm:rounded-xl" style={{ transform: 'rotate(-2deg)' }} />
                <img src="https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=400" alt="" className="col-span-1 row-span-1 h-16 w-full rounded-lg object-cover sm:h-24 sm:rounded-xl" style={{ transform: 'rotate(1deg)' }} />
                <img src="https://images.pexels.com/photos/2604692/pexels-photo-2604692.jpeg?auto=compress&cs=tinysrgb&w=400" alt="" className="col-span-1 row-span-1 h-16 w-full rounded-lg object-cover sm:h-24 sm:rounded-xl" style={{ transform: 'rotate(-1deg)' }} />
                <img src="https://images.pexels.com/photos/3951628/pexels-photo-3951628.jpeg?auto=compress&cs=tinysrgb&w=400" alt="" className="col-span-2 row-span-1 h-16 w-full rounded-lg object-cover sm:h-24 sm:rounded-xl" style={{ transform: 'rotate(2deg)' }} />
                <img src="https://images.pexels.com/photos/3014858/pexels-photo-3014858.jpeg?auto=compress&cs=tinysrgb&w=400" alt="" className="col-span-1 row-span-1 h-16 w-full rounded-lg object-cover sm:h-24 sm:rounded-xl" style={{ transform: 'rotate(-2deg)' }} />
              </div>
              <p className="text-sm text-ink/65">
                В этот день нам особенно хочется разделить радость с теми, кто искренне рад за нас.
                Спасибо, что вы рядом.
              </p>
            </div>

            <div className="space-y-4 text-xs text-ink/65">
              <div className="rounded-3xl border border-ink/10 bg-white/50 p-4 backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.24em] text-ink/45">
                  Таймлайн
                </p>
                <ul className="mt-3 space-y-3">
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sage shadow-[0_0_8px_rgba(163,177,138,0.65)]" />
                    <div>
                      <p className="text-xs font-medium text-moss">
                        2019 · Первая встреча
                      </p>
                      <p>Кофейня, случайный плейлист и разговор до закрытия.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sage/70" />
                    <div>
                      <p className="text-xs font-medium text-moss">
                        2021 · Путешествия
                      </p>
                      <p>Горы, море и понимание, что мы — команда.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sage/70" />
                    <div>
                      <p className="text-xs font-medium text-moss">
                        2025 · Предложение
                      </p>
                      <p>Балкон, огни города и &quot;да&quot;.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section
            id="schedule"
            className="mt-12 space-y-6 border-t border-ink/10 pt-10 sm:mt-16 sm:space-y-8 sm:pt-12"
          >
            <h2 className="font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
              Как пройдёт день
            </h2>

            <div className="mx-auto w-full max-w-3xl">
              <div
                ref={scheduleWrapRef}
                className="relative overflow-hidden h-[980px] sm:h-[1080px] lg:h-[1240px]"
              >
                {scheduleGeom ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 z-0">
                      <svg
                        className="h-full w-full"
                        viewBox={`0 0 ${Math.max(1, scheduleGeom.w)} ${Math.max(1, scheduleGeom.h)}`}
                        preserveAspectRatio="none"
                        aria-hidden
                      >
                        <path
                          d={scheduleGeom.curvePathD}
                          fill="none"
                          stroke="rgba(107, 112, 92, 0.22)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <span
                      ref={scheduleHeartRef}
                      className="calendar-heart absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: scheduleGeom.stopPoints[0]?.x ?? 0,
                        top: scheduleGeom.stopPoints[0]?.y ?? 0,
                        width: 46,
                        height: 46,
                      }}
                      aria-hidden
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
                        <path
                          fill="#f5c6d6"
                          d="M12 21s-7-4.35-9.5-9.5C.5 8.5 3 5 7 5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 4 0 6.5 3.5 4.5 6.5C19 16.65 12 21 12 21z"
                        />
                      </svg>
                    </span>

                    <div className="absolute inset-0 z-10">
                      {/*
                        Блоки времени стоят по “змейке”, но их нужно ограничить внутри
                        границ экрана/контейнера, иначе на узких ширинах они могут
                        торчать за края или цеплять выпуклости SVG-линии.
                      */}
                      {(() => {
                        const safeMargin = Math.max(10, scheduleGeom.w * 0.04)
                        const availableW = Math.max(0, scheduleGeom.w - safeMargin * 2)
                        const blockW = Math.min(210, availableW)
                        const inset = Math.min(22, Math.max(14, scheduleGeom.w * 0.035))

                        return (
                          <>
                            {DAY_PROGRAM.map((item, i) => {
                              const p = scheduleGeom.stopPoints[i]
                              const pointIsLeft = i % 2 === 0
                              // Ставим текст по "внутренней" стороне змейки:
                              // для левой точки — справа, для правой — слева.
                              const placeOnLeft = !pointIsLeft

                              // Якорим блок на стороне линии и затем зажимаем,
                              // чтобы весь блок гарантированно помещался в контейнер.
                              const anchorX = (p?.x ?? 0) + (placeOnLeft ? -inset : inset)
                              const left = placeOnLeft
                                ? clamp(anchorX, safeMargin + blockW, scheduleGeom.w - safeMargin)
                                : clamp(anchorX, safeMargin, scheduleGeom.w - safeMargin - blockW)

                              return (
                                <div
                                  key={`${item.time}-${i}`}
                                  className="absolute text-center"
                                  style={{
                                    left,
                                    top: p?.y ?? 0,
                                    width: blockW,
                                    transform: placeOnLeft ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
                                  }}
                                >
                                  <div className="text-[15px] sm:text-[16px] font-display font-semibold text-champagne/85">
                                    {item.time}
                                  </div>
                                  <div className="mt-1 text-[11px] sm:text-[12px] font-medium leading-snug text-ink/65">
                                    {item.title} · {item.text}
                                  </div>
                                </div>
                              )
                            })}
                          </>
                        )
                      })()}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </section>

          <section
            id="rsvp"
            className="mt-12 space-y-6 border-t border-ink/10 pt-10 sm:mt-16 sm:space-y-8 sm:pt-12"
          >
            <h2 className="font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
              Подтвердите участие
            </h2>

            {rsvpSlot ?? (
              <form
                className="grid gap-3 rounded-2xl border border-ink/12 bg-white/70 p-4 text-[11px] text-ink/75 backdrop-blur-lg sm:grid-cols-2 sm:gap-4 sm:rounded-3xl sm:p-6 sm:text-xs"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-ink/50">
                    Ваше имя
                  </label>
                  <input
                    className="min-h-[44px] w-full rounded-xl border border-ink/12 bg-cream px-3 py-2.5 text-sm text-ink outline-none ring-0 transition focus:border-sage focus:bg-white"
                    placeholder="Как к вам обращаться?"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-ink/50">
                    Статус
                  </label>
                  <select className="min-h-[44px] w-full rounded-xl border border-ink/12 bg-cream px-3 py-2.5 text-sm text-ink outline-none ring-0 transition focus:border-sage focus:bg-white">
                    <option>Я с радостью приду</option>
                    <option>Пока под вопросом</option>
                    <option>К сожалению, не смогу</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-ink/50">
                    Спутник
                  </label>
                  <select className="min-h-[44px] w-full rounded-xl border border-ink/12 bg-cream px-3 py-2.5 text-sm text-ink outline-none ring-0 transition focus:border-sage focus:bg-white">
                    <option>Я буду один(на)</option>
                    <option>Буду со спутником</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-ink/50">
                    Комментарий
                  </label>
                  <textarea
                    rows={3}
                    className="w-full resize-none rounded-xl border border-ink/12 bg-cream px-3 py-2 text-sm text-ink outline-none ring-0 transition focus:border-sage focus:bg-white"
                    placeholder="Аллергии, особенности по меню или пожелания для нас"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-sage via-[#95a882] to-sand px-5 py-2.5 text-sm font-semibold text-moss shadow-lg shadow-ink/10 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] sm:px-6"
                  >
                    Отправить RSVP
                  </button>
                  <p className="text-[11px] text-ink/50">
                    Позже здесь появится ваш персональный пригласительный с уникальной ссылкой и
                    QR‑кодом.
                  </p>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
    </>
  )
}
