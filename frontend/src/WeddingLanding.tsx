import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { FlipDigit } from './FlipDigit'
import { OpeningHero } from './OpeningHero'
import {
  EggFirstModal,
  EggHeartGameSection,
  EggPersistentModal,
  EggWatermelonModal,
  HEART_JUMP_GOAL,
} from './EasterEgg'
import { WeddingCalendar } from './WeddingCalendar'
import {
  TWO_GIS_DIRECTIONS_URL,
  VENUE_ADDRESS_LINES,
  VENUE_LAT,
  VENUE_LON,
  WEDDING_DATE,
  WEDDING_HOST_EUGENE_CONTACT_URL,
  WEDDING_TELEGRAM_CHAT_URL,
} from './weddingConstants'
import jointPhoto1 from './assets/pictures/joint_photo1.jpg'
import jointPhoto2 from './assets/pictures/joint_photo2.jpg'
import jointPhoto3 from './assets/pictures/joint_photo3.jpg'
import jointPhoto4 from './assets/pictures/joint_photo4.jpg'
import jointPhoto5 from './assets/pictures/joint_photo5.jpg'
import jointPhoto6 from './assets/pictures/joint_photo6.jpg'
import jointPhoto7 from './assets/pictures/joint_photo7.jpg'
import jointPhoto8 from './assets/pictures/joint_photo8.jpg'
import jointPhoto9 from './assets/pictures/joint_photo9.jpg'
import jointPhoto10 from './assets/pictures/joint_photo10.jpg'
import jointPhoto11 from './assets/pictures/joint_photo11.jpg'


import dressFabric12 from './assets/pictures/dark.jpg'
import dressFabric13 from './assets/pictures/taip.png'
import dressFabric14 from './assets/pictures/oliva.jpg'
import dressFabric15 from './assets/pictures/mate.jpg'
import dressFabric16 from './assets/pictures/yellow.jpg'



import dressCodeMain from './assets/pictures/dress.JPG'
import dressCode1 from './assets/pictures/dress1.JPG'
import dressCode3 from './assets/pictures/dress3.JPG'
import dressCode4 from './assets/pictures/dress4.JPG'
import dressCode5 from './assets/pictures/dress5.JPG'
import dressCode6 from './assets/pictures/dress6.JPG'
import dressCode7 from './assets/pictures/dress7.JPG'
import dressCode8 from './assets/pictures/dress8.JPG'
import dressCode9 from './assets/pictures/dress9.JPG'
import dressCode10 from './assets/pictures/dress10.JPG'
import dressCode11 from './assets/pictures/dress11.JPG'
import dressCode12 from './assets/pictures/dress12.JPG'
import dressCode13 from './assets/pictures/dress13.JPG'
import dressCode14 from './assets/pictures/dress14.JPG'
import dressCode15 from './assets/pictures/dress15.JPG'
import dressCode16 from './assets/pictures/dress16.JPG'
import dressCode17 from './assets/pictures/dress17.JPG'
import dressCode18 from './assets/pictures/dress18.JPG'
import dressCode19 from './assets/pictures/dress19.JPG'
import dressCode20 from './assets/pictures/dress20.JPG'
import dressCode21 from './assets/pictures/dress21.JPG'
import dressCode22 from './assets/pictures/dress22.JPG'
import dressCode23 from './assets/pictures/dress23.JPG'
import dressCode24 from './assets/pictures/dress24.JPG'
import dressCode25 from './assets/pictures/dress25.JPG'
import dressCode26 from './assets/pictures/dress26.JPG'
import dressCode27 from './assets/pictures/dress27.JPG'
import dressCode28 from './assets/pictures/dress28.JPG'
import dressCode29 from './assets/pictures/dress29.JPG'


const DRESS_CODE_PALETTE: {
  fabric: string
  color: string
  label: string
}[] = [
  { fabric: dressFabric12, color: '#57352C', label: 'Шоколад' },
  { fabric: dressFabric13, color: '#6A5246', label: 'Какао' },
  { fabric: dressFabric15, color: '#6A7452', label: 'Хвойная зелень' }, 
  { fabric: dressFabric14, color: '#A19C1F', label: 'Олива' },
  { fabric: dressFabric16, color: '#EFE69C', label: 'Лимон' },
]

const DRESS_CODE_GALLERY_FIRST = [
  dressCodeMain,
  dressCode1,
  dressCode4,
  dressCode15,
  dressCode11,
  dressCode28,
  dressCode16,
  dressCode17,
] as const

const DRESS_CODE_GALLERY_REST = [
  dressCode3,
  dressCode5,
  dressCode6,
  dressCode7,
  dressCode8,
  dressCode9,
  dressCode10,
  dressCode12,
  dressCode13,
  dressCode14,
  dressCode18,
  dressCode19,
  dressCode20,
  dressCode21,
  dressCode22,
  dressCode23,
  dressCode24,
  dressCode25,
  dressCode26,
  dressCode27,
  dressCode29,
] as const

const GALLERY_STRIP_IMAGES = [
  jointPhoto11,
  jointPhoto10,
  jointPhoto9,
] as const

const YANDEX_MAP_ZOOM = 16
const YANDEX_MAP_EMBED_SRC = `https://yandex.ru/map-widget/v1/?ll=${VENUE_LON}%2C${VENUE_LAT}&z=${YANDEX_MAP_ZOOM}&pt=${VENUE_LON}%2C${VENUE_LAT},pm2rdm`

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

type DayProgramItem = {
  time: string
  title: string
  text: string
}

const DAY_PROGRAM: DayProgramItem[] = [
  {
    time: '14:00-15:00',
    title: 'Bride & Groom fotomoments,',
    text: 'живые эмоции и первые кадры нашего дня.',
  },
  {
    time: '15:00-15:20',
    title: 'Сбор гостей | Welcome Drinks',
    text: 'Champagne • Фуршет • Photo Moments',
  },
  {
    time: '15:40-16:00',
    title: 'Выход пары. Жених и невеста',
    text: 'Фотосессия с парой',
  },
  {
    time: '16:00-16:30',
    title: 'Церемония',
    text: 'Торжественная часть.',
  },
  {
    time: '16:30-18:00',
    title: 'Интерактив',
    text: 'Первый танец',
  },
  {
    time: '20:00-20:20',
    title: 'Торт',
    text: 'Букет невесты',
  },
  {
    time: '20:50-21:30',
    title: 'Танцевальный вечер',
    text: 'Дискотека',
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
  inviteToken?: string | null
  rsvpAnswered?: boolean
}

export function WeddingLanding({
  guestName,
  rsvpSlot,
  inviteToken,
  rsvpAnswered,
}: WeddingLandingProps) {
  const countdown = useCountdown(WEDDING_DATE)
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

  const dressCodeSectionRef = useRef<HTMLElement | null>(null)
  const [dressCodeInView, setDressCodeInView] = useState(false)
  const [dressGalleryExpanded, setDressGalleryExpanded] = useState(false)
  const [eggFirstOpen, setEggFirstOpen] = useState(false)
  const [eggFirstDone, setEggFirstDone] = useState(false)
  const [eggWatermelonOpen, setEggWatermelonOpen] = useState(false)
  const [eggWatermelonDone, setEggWatermelonDone] = useState(false)
  const [eggThirdOpen, setEggThirdOpen] = useState(false)
  const [eggThirdDone, setEggThirdDone] = useState(false)

  const [heartGameScore, setHeartGameScore] = useState(0)

  const [openSiteRsvpDone, setOpenSiteRsvpDone] = useState(() => {
    try {
      return !!sessionStorage.getItem('wend-open-rsvp-token')
    } catch {
      return false
    }
  })

  const rsvpQuestUnlocked =
    rsvpAnswered !== undefined ? rsvpAnswered : openSiteRsvpDone

  const [openSiteInviteToken, setOpenSiteInviteToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('wend-open-rsvp-token')
    } catch {
      return null
    }
  })

  useEffect(() => {
    const sync = () => {
      try {
        const t = sessionStorage.getItem('wend-open-rsvp-token')
        setOpenSiteInviteToken(t)
        setOpenSiteRsvpDone(!!t)
      } catch {
        setOpenSiteInviteToken(null)
        setOpenSiteRsvpDone(false)
      }
    }
    window.addEventListener('wend-open-rsvp-saved', sync)
    return () => window.removeEventListener('wend-open-rsvp-saved', sync)
  }, [])

  const eggInviteToken = inviteToken ?? openSiteInviteToken ?? null

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDressCodeInView(true)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = dressCodeSectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setDressCodeInView(true)
        io.disconnect()
      },
      { rootMargin: '80px 0px 80px 0px', threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

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

      const padY = Math.min(48, Math.max(24, h * 0.035))
      const innerH = Math.max(1, h - padY * 2)

      const N = DAY_PROGRAM.length
      const stopTs = Array.from({ length: N }, (_, i) => (N <= 1 ? 0 : i / (N - 1)))
      const leftX = w * 0.36
      const rightX = w * 0.64
      const stopPoints = stopTs.map((t, i) => ({
        x: i % 2 === 0 ? leftX : rightX,
        y: padY + innerH * t,
      }))

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

  return (
    <>
      <OpeningHero
        showTopEggLine={rsvpQuestUnlocked && eggWatermelonDone}
        onTopEggLineClick={() => setEggThirdOpen(true)}
      />
      <div id="main" className="relative bg-cream text-ink">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(163,177,138,0.22),transparent_58%),radial-gradient(circle_at_bottom,_rgba(227,213,202,0.4),transparent_55%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col px-3 pb-16 pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:pt-14">
          <header className="flex flex-wrap items-center gap-3">
          </header>

          <main className="mt-6 flex flex-col gap-10 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] sm:mt-8 sm:gap-16 lg:mt-10">
            <section
              id="intro"
              className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start"
            >
              <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
                <div className="max-w-xl space-y-6 sm:space-y-8">
                  <p className="text-xs uppercase tracking-[0.28em] text-sage sm:text-sm sm:tracking-[0.32em]">
                    приглашение на свадьбу
                  </p>
                  <p className="text-sm text-ink/75 sm:text-base">
                    {guestName ? (
                      <>
                        <span className="font-display text-sage text-2xl">Дорогой(ая) {guestName} </span><br></br><br />
                        Мы рады пригласить вас на наше главное событие —
                        уютную камерную свадьбу в кругу самых близких. На этом сайте вы найдёте все
                        детали дня, помощь с дорогой и сможете ответить на приглашение в блоке ниже, на сайте размещены пасхалки — скрытые элементы/задания. Найдите их и заберите свой приз на празднике!
                      </>
                    ) : (
                      <>
                        Мы рады пригласить вас на наше главное событие — уютную свадьбу в
                        кругу самых близких. На этом сайте вы найдёте все детали дня, помощь с дорогой
                        и сможете ответить на приглашение в блоке ниже, на сайте размещены пасхалки — скрытые элементы/задания. Найдите их и заберите свой приз на празднике!
                      </>
                    )}
                  </p>
                </div>

                <div className="w-full min-w-0">
                  <div className="countdown-block w-full rounded-2xl border border-ink/10 bg-white/55 px-3 py-4 backdrop-blur sm:px-5 sm:py-5">
                    <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-ink/50 sm:text-[11px]">
                      До праздника
                    </p>
                    <div className="countdown-row grid w-full grid-cols-4 gap-1.5 sm:gap-3">
                      <div className="countdown-cell flex min-w-0 flex-col items-center rounded-lg bg-sand/50 px-1 py-2.5 sm:rounded-xl sm:px-2 sm:py-4 md:px-3">
                        <div className="flex gap-px sm:gap-0.5">
                          <FlipDigit value={Math.floor(countdown.d / 100)} />
                          <FlipDigit value={Math.floor(countdown.d / 10) % 10} />
                          <FlipDigit value={countdown.d % 10} />
                        </div>
                        <span className="countdown-cell-label mt-1 whitespace-nowrap text-[8px] uppercase tracking-wide text-ink/45 sm:mt-1.5 sm:text-[10px] sm:tracking-wider md:text-xs">
                          дней
                        </span>
                      </div>
                      <div className="countdown-cell flex min-w-0 flex-col items-center rounded-lg bg-sand/50 px-1 py-2.5 sm:rounded-xl sm:px-2 sm:py-4 md:px-3">
                        <div className="flex gap-px sm:gap-0.5">
                          <FlipDigit value={Math.floor(countdown.h / 10)} />
                          <FlipDigit value={countdown.h % 10} />
                        </div>
                        <span className="countdown-cell-label mt-1 whitespace-nowrap text-[8px] uppercase tracking-wide text-ink/45 sm:mt-1.5 sm:text-[10px] sm:tracking-wider md:text-xs">
                          часов
                        </span>
                      </div>
                      <div className="countdown-cell flex min-w-0 flex-col items-center rounded-lg bg-sand/50 px-1 py-2.5 sm:rounded-xl sm:px-2 sm:py-4 md:px-3">
                        <div className="flex gap-px sm:gap-0.5">
                          <FlipDigit value={Math.floor(countdown.m / 10)} />
                          <FlipDigit value={countdown.m % 10} />
                        </div>
                        <span className="countdown-cell-label mt-1 whitespace-nowrap text-[8px] uppercase tracking-wide text-ink/45 sm:mt-1.5 sm:text-[10px] sm:tracking-wider md:text-xs">
                          минут
                        </span>
                      </div>
                      <div className="countdown-cell flex min-w-0 flex-col items-center rounded-lg bg-sand/50 px-1 py-2.5 sm:rounded-xl sm:px-2 sm:py-4 md:px-3">
                        <div className="flex gap-px sm:gap-0.5">
                          <FlipDigit value={Math.floor(countdown.s / 10)} />
                          <FlipDigit value={countdown.s % 10} />
                        </div>
                        <span className="countdown-cell-label mt-1 whitespace-nowrap text-[8px] uppercase tracking-wide text-ink/45 sm:mt-1.5 sm:text-[10px] sm:tracking-wider md:text-xs">
                          секунд
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative min-w-0 space-y-3 sm:space-y-4">
                <div className="grid min-h-[220px] grid-cols-4 grid-rows-4 gap-1.5 sm:min-h-[360px] sm:gap-3">
                  <img src={jointPhoto1} alt="" className="intro-collage-img col-span-2 row-span-2 h-32 w-full rounded-2xl object-cover shadow-lg sm:h-44" style={{ transform: 'rotate(-2deg)' }} loading="lazy" decoding="async" />
                  <img src={jointPhoto2} alt="" className="intro-collage-img col-span-2 row-span-1 h-20 w-full rounded-2xl object-cover shadow-lg sm:h-28" style={{ transform: 'rotate(3deg)' }} loading="lazy" decoding="async" />
                  <img src={jointPhoto3} alt="" className="intro-collage-img col-span-1 row-span-1 h-16 w-full rounded-xl object-cover shadow-lg sm:h-20" style={{ transform: 'rotate(-1deg)' }} loading="lazy" decoding="async" />
                  <img src={jointPhoto4} alt="" className="intro-collage-img col-span-1 row-span-2 h-28 w-full rounded-xl object-cover shadow-lg sm:h-36" style={{ transform: 'rotate(2deg)' }} loading="lazy" decoding="async" />
                  <img src={jointPhoto5} alt="" className="intro-collage-img col-span-2 row-span-1 h-20 w-full rounded-2xl object-cover shadow-lg sm:h-24" style={{ transform: 'rotate(-3deg)' }} loading="lazy" decoding="async" />
                  <img src={jointPhoto6} alt="" className="intro-collage-img col-span-2 row-span-1 h-20 w-full rounded-2xl object-cover shadow-lg sm:h-24" style={{ transform: 'rotate(1deg)' }} loading="lazy" decoding="async" />
                  <img src={jointPhoto7} alt="" className="intro-collage-img col-span-1 row-span-1 h-16 w-full rounded-xl object-cover shadow-lg sm:h-20" style={{ transform: 'rotate(2deg)' }} loading="lazy" decoding="async" />
                  <img src={jointPhoto8} alt="" className="intro-collage-img col-span-1 row-span-1 h-16 w-full rounded-xl object-cover shadow-lg sm:h-20" style={{ transform: 'rotate(-2deg)' }} loading="lazy" decoding="async" />
                </div>
                <div className="-mx-1 overflow-hidden rounded-xl sm:mx-0 sm:rounded-2xl">
                  <div className="gallery-live flex w-max gap-2 sm:gap-3">
                    {[...GALLERY_STRIP_IMAGES, ...GALLERY_STRIP_IMAGES].map((src, i) => (
                      <img
                        key={`gallery-strip-${i}`}
                        src={src}
                        alt=""
                        className="gallery-strip-img h-20 w-28 flex-none rounded-lg object-cover shadow-md sm:h-28 sm:w-44 sm:rounded-xl"
                        loading="lazy"
                        decoding="async"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>

          <section
            id="story"
            className="mt-10 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] border-t border-ink/10 pt-10 sm:mt-12 sm:pt-12 lg:mt-14"
          >
            <div className="mx-auto max-w-2xl space-y-4 text-xs text-ink/65">
              <div className="rounded-3xl border border-ink/10 bg-white/50 p-4 backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.24em] text-ink/45">
                  Таймлайн
                </p>
                <ul className="mt-3 space-y-3">
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sage shadow-[0_0_8px_rgba(163,177,138,0.65)]" />
                    <div>
                      <p className="text-xs font-medium text-moss">
                        2023 · Первая встреча
                      </p>
                      <p> История, с которой всё началось в Инстаграмме.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sage/70" />
                    <div>
                      <p className="text-xs font-medium text-moss">
                        2024 · Любовь без границ
                      </p>
                      <p>Первое совместное путешествие  в Тайланде
                          Знакомство с родителями жениха.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sage/70" />
                    <div>
                      <p className="text-xs font-medium text-moss">
                        2025 · Расширяя круг любви
                      </p>
                      <p>Знакомство с родителями невесты.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sage/70" />
                    <div>
                      <p className="text-xs font-medium text-moss">
                        2026 ·  Там, где сказали «да»
                      </p>
                      <p> Предложение на острове в Таиланде.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section
            id="calendar"
            className="mt-10 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] border-t border-ink/10 pt-10 sm:mt-12 sm:pt-12 lg:mt-14"
          >
            <div className="mx-auto max-w-3xl px-1 text-center sm:px-4">
              <WeddingCalendar
                weddingHeartInteractive={
                  rsvpQuestUnlocked && heartGameScore >= HEART_JUMP_GOAL
                }
                onWeddingDayHeartClick={() => setEggFirstOpen(true)}
              />
            </div>
          </section>

          <section
            id="map"
            className="mt-10 space-y-5 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] border-t border-ink/10 pt-10 sm:mt-12 sm:space-y-6 sm:pt-12"
          >
            <div className="text-center sm:text-left">
              <h2 className="font-display text-[25px] text-xl text-champagne sm:text-2xl lg:text-3xl">
                Место проведения
              </h2>
              <p className="mt-2 text-sm font-medium text-ink/70 sm:text-[10px] sm:leading-snug">
                Ориентир на карте и адрес ниже.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-sand/25 shadow-sm">
              <iframe
                title="Карта места проведения"
                src={YANDEX_MAP_EMBED_SRC}
                className="h-64 w-full border-0 sm:h-80 lg:h-[22rem]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/60 px-4 py-4 sm:rounded-3xl sm:px-6 sm:py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/55 sm:text-[12px]">
                Адрес
              </p>
              <address className="mt-3 not-italic text-[13px] font-medium leading-relaxed text-ink/80 sm:text-[16px]">
                {VENUE_ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <a
              href={TWO_GIS_DIRECTIONS_URL}
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

          <section
            id="schedule"
            className="mt-12 space-y-6 border-t border-ink/10 pt-10 sm:mt-16 sm:space-y-8 sm:pt-12"
          >
            <h2 className="font-display text-[25px] text-xl text-champagne sm:text-2xl lg:text-3xl">
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
                      className="calendar-heart pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
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
                              const placeOnLeft = !pointIsLeft

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
            ref={dressCodeSectionRef}
            id="dress-code"
            className={`dress-code mt-12 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] border-t border-ink/10 pt-10 sm:mt-16 sm:pt-12${dressCodeInView ? ' dress-code--visible' : ''}`}
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[15px] font-semibold uppercase tracking-[0.28em] text-ink/55 sm:text-xs sm:tracking-[0.32em]">
                Дресс-код
              </p>
              <h2 className="mt-3 text-[20px] font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
                Как одеться
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/75 sm:text-[16px] sm:leading-relaxed">
                Мы хотим создать особенную атмосферу на нашем торжестве, поэтому просим учесть дресс-код при выборе наряда. <br />
                Для дам предпочтительнее : длинные и коктейльные платья. <br />
                Для джентльменов допускается к дресс коду: белый цвет рубашки/поло и классические брюки в черном цвете
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-xl">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/55 sm:text-[12px]">
                Цвет и ткань
              </p>
              <div className="mt-6 grid grid-cols-5 gap-2 sm:mt-8 sm:gap-4">
                {DRESS_CODE_PALETTE.map((item, step) => (
                  <div
                    key={item.label}
                    className="dress-code-reveal-target flex flex-col items-center gap-2 sm:gap-2.5"
                    style={{ '--reveal-step': step } as CSSProperties}
                  >
                    <div className="dress-code-swatch ring-1 ring-ink/10">
                      <img
                        src={item.fabric}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div
                      className="dress-code-swatch ring-1 ring-ink/10"
                      style={{ backgroundColor: item.color }}
                      aria-hidden
                    />
                    <span className="max-w-[5rem] text-center text-[11px] font-medium leading-snug text-ink/65 sm:max-w-none sm:text-[12px]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mx-auto mt-10 max-w-3xl sm:mt-12">
              <p
                className="dress-code-reveal-target text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/55 sm:text-[12px]"
                style={{ '--reveal-step': DRESS_CODE_PALETTE.length } as CSSProperties}
              >
                Вдохновение
              </p>
              <div className="dress-code-gallery mt-4">
                {DRESS_CODE_GALLERY_FIRST.map((src, i) => (
                  <div
                    key={`dress-gallery-first-${i}`}
                    className="dress-code-gallery-cell dress-code-reveal-target overflow-hidden rounded-xl shadow-md shadow-ink/5 sm:rounded-2xl"
                    style={{ '--reveal-step': DRESS_CODE_PALETTE.length + i } as CSSProperties}
                  >
                    <img
                      src={src}
                      alt=""
                      className="dress-code-gallery-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
              {DRESS_CODE_GALLERY_REST.length > 0 ? (
                <>
                  {dressGalleryExpanded ? (
                    <>
                      <div className="dress-code-gallery mt-4">
                        {DRESS_CODE_GALLERY_REST.map((src, i) => (
                          <div
                            key={`dress-gallery-rest-${i}`}
                            className="dress-code-gallery-cell dress-code-reveal-target overflow-hidden rounded-xl shadow-md shadow-ink/5 sm:rounded-2xl"
                            style={
                              {
                                '--reveal-step':
                                  DRESS_CODE_PALETTE.length + DRESS_CODE_GALLERY_FIRST.length + i,
                              } as CSSProperties
                            }
                          >
                            <img
                              src={src}
                              alt=""
                              className="dress-code-gallery-img"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/10 bg-white/60 px-6 py-2.5 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.98]"
                          onClick={() => setDressGalleryExpanded(false)}
                        >
                          Скрыть
                        </button>
                      </div>
                    </>
                  ) : null}
                  {!dressGalleryExpanded ? (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/10 bg-white/60 px-6 py-2.5 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.98]"
                        onClick={() => setDressGalleryExpanded(true)}
                      >
                        Ещё
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </section>

          <section
            id="wedding-chat"
            className="mt-12 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] border-t border-ink/10 pt-10 sm:mt-16 sm:pt-12"
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-ink/45 sm:text-xs sm:tracking-[0.32em]">
                Телеграм
              </p>
              <h2 className="mt-3 font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
                Свадебный чат
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink/75 sm:text-base">
                Дорогие, мы создали телеграм-чат, в котором можно навалить лютого кринжа))
              </p>
              <a
                href={WEDDING_TELEGRAM_CHAT_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-ink/10 bg-white/60 px-5 py-2.5 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.98] sm:mt-8 sm:px-6"
              >
                Вступить в чат
              </a>
            </div>
          </section>

          <section
            id="host-contact"
            className="mt-12 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] border-t border-ink/10 pt-10 sm:mt-16 sm:pt-12"
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-ink/45 sm:text-xs sm:tracking-[0.32em]">
                Ведущий
              </p>
              <h2 className="mt-3 font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
                Владимир
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink/75 sm:text-base">
                Если у вас есть вопросы или идея для сюрприза, напишите нашему ведущему-организатору Владимиру, он с радостью поможет и поддержит любую инициативу, которая сделает наш день ещё ярче!
              </p>
              <a
                href={WEDDING_HOST_EUGENE_CONTACT_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-ink/10 bg-white/60 px-5 py-2.5 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.98] sm:mt-8 sm:px-6"
              >
                Написать Владимиру
              </a>
            </div>
          </section>

          <section
            id="rsvp"
            className="mt-12 space-y-6 border-t border-ink/10 pt-10 sm:mt-16 sm:space-y-8 sm:pt-12"
          >
            <h2 className="font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
              Подтвердите участие
            </h2>
                <p className=' text-xs'> Пожалуйста запоните анкету ниже и подтвердите свое присутствие до 01.05.2026 чтобы мы могли спланировать наше торжество наилучшим образом</p>
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
                    Отправить
                  </button>
                </div>
              </form>
            )}
          </section>

          {rsvpQuestUnlocked && !eggFirstOpen && !eggFirstDone ? (
            <EggHeartGameSection onHeartScoreChange={setHeartGameScore} />
          ) : null}

          <footer className="mt-14 border-t border-ink/10 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 text-center sm:mt-16 sm:pt-10">
            {rsvpQuestUnlocked && eggFirstDone && !eggWatermelonDone ? (
              <button
                type="button"
                onClick={() => setEggWatermelonOpen(true)}
                className="relative z-10 border-0 bg-transparent p-2 text-[9px] text-ink/45 underline decoration-ink/25 decoration-dotted underline-offset-4 transition hover:text-ink/70 sm:text-[10px]"
              >
                арбуз
              </button>
            ) : rsvpQuestUnlocked && eggThirdDone ? (
              <p className="text-[9px] text-ink/35 sm:text-[10px]">С любовью</p>
            ) : null}
          </footer>
        </div>
      </div>
    </div>
      <EggFirstModal
        open={eggFirstOpen}
        onClose={() => {
          setEggFirstOpen(false)
          setEggFirstDone(true)
        }}
      />
      <EggWatermelonModal
        open={eggWatermelonOpen}
        onClose={() => {
          setEggWatermelonOpen(false)
          setEggWatermelonDone(true)
        }}
      />
      <EggPersistentModal
        open={eggThirdOpen}
        onClose={() => {
          setEggThirdOpen(false)
          setEggThirdDone(true)
        }}
        inviteToken={eggInviteToken}
        prizeEligible={heartGameScore >= HEART_JUMP_GOAL && eggFirstDone}
      />
    </>
  )
}
