import { useEffect, useRef, useState } from 'react'
import { apiUrl } from './apiUrl'

type EggFirstModalProps = {
  open: boolean
  onClose: () => void
}

export function EggFirstModal({ open, onClose }: EggFirstModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal
      aria-labelledby="egg-first-title"
    >
      <div className="max-h-[min(90vh,540px)] w-full max-w-md overflow-y-auto rounded-2xl border border-ink/10 bg-cream p-5 shadow-2xl sm:p-6">
        <p id="egg-first-title" className="text-center text-sm font-medium leading-snug text-ink sm:text-base">
          Упс, похоже, вы попали на первую пасхалку
        </p>
        <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-ink/10">
          <img
            src="/egg-fry-meme.png"
            alt=""
            className="w-full object-cover object-top"
            loading="eager"
          />
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-ink/70 sm:text-sm">
          Загляните в самый низ страницы — там тоже есть что найти.
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-full border border-ink/10 bg-white/70 py-3 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.99]"
          onClick={onClose}
        >
          Понятно
        </button>
      </div>
    </div>
  )
}

type EggWatermelonModalProps = {
  open: boolean
  onClose: () => void
}

/** Вторая пасхалка — `public/egg-watermelon.png`. */
export function EggWatermelonModal({ open, onClose }: EggWatermelonModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal
      aria-labelledby="egg-melon-title"
    >
      <div className="max-h-[min(92vh,560px)] w-full max-w-md overflow-y-auto rounded-2xl border border-ink/10 bg-cream p-5 shadow-2xl sm:p-6">
        <p id="egg-melon-title" className="text-center text-base font-medium text-ink sm:text-lg">
          а чего вы ожидали)))
        </p>
        <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-ink/10">
          <img
            src="/egg-watermelon.png"
            alt=""
            className="w-full object-cover object-center"
            loading="eager"
          />
        </div>
        <p className="mt-3 text-center text-[10px] leading-relaxed text-ink/55 sm:text-[11px]">
          Может, стоит посмотреть наверх?
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-full border border-ink/10 bg-white/70 py-3 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.99]"
          onClick={onClose}
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}

type EggThirdPlaceholderModalProps = {
  open: boolean
  onClose: () => void
}

/** Третья пасхалка — пока заглушка. */
export function EggThirdPlaceholderModal({ open, onClose }: EggThirdPlaceholderModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-cream p-6 shadow-2xl sm:p-8">
        <p className="text-center text-sm text-ink/70">Здесь скоро будет сюрприз — мы ещё думаем.</p>
        <button
          type="button"
          className="mt-6 w-full rounded-full border border-ink/10 bg-white/70 py-3 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.99]"
          onClick={onClose}
        >
          Ок
        </button>
      </div>
    </div>
  )
}

const HEART_GOAL = 8

type EggHeartGameSectionProps = {
  inviteToken?: string | null
}

export function EggHeartGameSection({ inviteToken }: EggHeartGameSectionProps) {
  const [score, setScore] = useState(0)
  const [pos, setPos] = useState(() => ({
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 60,
  }))
  const [phrase, setPhrase] = useState<string | null>(null)
  const [phraseError, setPhraseError] = useState<'no-token' | 'fetch' | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState(false)
  const prizeFetched = useRef(false)

  const won = score >= HEART_GOAL

  useEffect(() => {
    if (won) return
    setPos({ x: 12 + Math.random() * 76, y: 12 + Math.random() * 76 })
  }, [score, won])

  useEffect(() => {
    if (!won || prizeFetched.current) return
    prizeFetched.current = true
    if (!inviteToken?.trim()) {
      setPhraseError('no-token')
      return
    }
    setLoadingPhrase(true)
    fetch(apiUrl(`/api/egg/prize/${encodeURIComponent(inviteToken.trim())}`))
      .then(async (r) => {
        if (!r.ok) throw new Error('bad')
        const j = (await r.json()) as { phrase?: string }
        if (j.phrase) setPhrase(j.phrase)
        else throw new Error('bad')
      })
      .catch(() => {
        setPhraseError('fetch')
      })
      .finally(() => {
        setLoadingPhrase(false)
      })
  }, [won, inviteToken])

  const hit = () => {
    if (won) return
    setScore((s) => Math.min(s + 1, HEART_GOAL))
  }

  return (
    <section
      id="egg-game"
      className="mt-12 scroll-mt-[max(5.5rem,env(safe-area-inset-top))] border-t border-ink/10 pt-10 sm:mt-16 sm:pt-12"
    >
      <div className="mx-auto max-w-md text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-ink/45 sm:text-xs sm:tracking-[0.32em]">
          Мини-игра
        </p>
        <h2 className="mt-3 font-display text-xl text-champagne sm:text-2xl">
          Охота на сердца
        </h2>
        <p className="mt-3 text-sm text-ink/75">
          Успейте нажать на сердечко, пока оно не прыгнуло. Нужно поймать{' '}
          <span className="font-medium text-ink">{HEART_GOAL}</span> раз.
        </p>
      </div>

      <div className="relative mx-auto mt-6 h-[min(55vh,420px)] w-full max-w-md overflow-hidden rounded-2xl border border-ink/10 bg-sand/30 shadow-inner">
        {!won ? (
          <button
            type="button"
            className="calendar-heart absolute z-10 h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation transition-transform hover:scale-110 active:scale-95"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={hit}
            aria-label="Поймать сердце"
          >
            <svg className="h-full w-full drop-shadow-md" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                fill="#e891a8"
                d="M12 21s-7-4.35-9.5-9.5C.5 8.5 3 5 7 5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 4 0 6.5 3.5 4.5 6.5C19 16.65 12 21 12 21z"
              />
            </svg>
          </button>
        ) : null}
        <div className="pointer-events-none absolute left-3 top-3 z-[1] rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-ink/80 shadow-sm">
          {won ? 'Готово!' : `${score} / ${HEART_GOAL}`}
        </div>
      </div>

      {won ? (
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-sage/30 bg-white/70 p-5 text-center backdrop-blur-sm">
          {loadingPhrase ? (
            <p className="text-sm text-ink/65">Загружаем ваш персональный код…</p>
          ) : phrase ? (
            <>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink/45">
                Ваш секретный код
              </p>
              <p className="mt-3 break-all font-mono text-lg font-semibold tracking-tight text-moss sm:text-xl">
                {phrase}
              </p>
              <p className="mt-3 text-xs text-ink/60">
                Сохраните его — по этому коду мы сможем выдать приз именно вам.
              </p>
            </>
          ) : phraseError === 'no-token' ? (
            <p className="text-sm text-ink/75">
              Персональный код доступен, если открыть сайт по вашей пригласительной ссылке.
            </p>
          ) : (
            <p className="text-sm text-ink/75">
              Не удалось загрузить код. Попробуйте обновить страницу позже.
            </p>
          )}
        </div>
      ) : null}
    </section>
  )
}
