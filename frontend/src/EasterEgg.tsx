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
        <p className="mt-2 text-center text-[9px] leading-snug text-ink/50 sm:text-[10px]">
          Я думая, стоит посмотреть внизу страницы)
        </p>
        <button
          type="button"
          className="mt-5 w-full rounded-full border border-ink/10 bg-white/70 py-3 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.99]"
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
        <p className="mt-2 text-center text-[9px] leading-snug text-ink/50 sm:text-[10px]">
          Попались? <br/>
          Ну тогда посмотрите что там вверху страницы)
        </p>
        <button
          type="button"
          className="mt-5 w-full rounded-full border border-ink/10 bg-white/70 py-3 text-sm font-medium text-champagne transition hover:bg-sand/50 active:scale-[0.99]"
          onClick={onClose}
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}

export const HEART_JUMP_GOAL = 7
export const HEART_TOTAL = 8

type EggPersistentModalProps = {
  open: boolean
  onClose: () => void
  inviteToken?: string | null
  prizeEligible: boolean
}

export function EggPersistentModal({ open, onClose, inviteToken, prizeEligible }: EggPersistentModalProps) {
  const [phrase, setPhrase] = useState<string | null>(null)
  const [phraseError, setPhraseError] = useState<'no-token' | 'fetch' | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState(false)
  const fetchGen = useRef(0)

  useEffect(() => {
    if (!open) {
      setPhrase(null)
      setPhraseError(null)
      setLoadingPhrase(false)
      return
    }
    if (!prizeEligible) return
    const t = inviteToken?.trim()
    if (!t) {
      setPhraseError('no-token')
      return
    }
    const gen = ++fetchGen.current
    setLoadingPhrase(true)
    setPhrase(null)
    setPhraseError(null)
    fetch(apiUrl(`/api/egg/prize/${encodeURIComponent(t)}`))
      .then(async (r) => {
        if (!r.ok) throw new Error('bad')
        const j = (await r.json()) as { phrase?: string }
        if (j.phrase) return j.phrase
        throw new Error('bad')
      })
      .then((p) => {
        if (fetchGen.current === gen) setPhrase(p)
      })
      .catch(() => {
        if (fetchGen.current === gen) setPhraseError('fetch')
      })
      .finally(() => {
        if (fetchGen.current === gen) setLoadingPhrase(false)
      })
  }, [open, prizeEligible, inviteToken])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal
      aria-labelledby="egg-persistent-title"
    >
      <div className="max-h-[min(92vh,560px)] w-full max-w-md overflow-y-auto rounded-2xl border border-ink/10 bg-cream p-5 shadow-2xl sm:p-6">
        <p
          id="egg-persistent-title"
          className="text-center text-sm font-medium leading-snug text-ink sm:text-base"
        >
          Да вы настойчивый человек
        </p>
        <div className="mt-4 text-center text-sm leading-relaxed text-ink/75">
          {!prizeEligible ? (
            <p>Секретный код ещё не готов — сначала соберите полный набор.</p>
          ) : loadingPhrase ? (
            <p className="text-ink/65">Загружаем ваш персональный код…</p>
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
            <p className="text-ink/75">
              Персональный код доступен, если открыть сайт по вашей пригласительной ссылке или отправить анкету с главной
              страницы.
            </p>
          ) : (
            <p className="text-ink/75">Не удалось загрузить код. Попробуйте обновить страницу позже.</p>
          )}
        </div>
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

type EggHeartGameSectionProps = {
  onHeartScoreChange?: (score: number) => void
}

export function EggHeartGameSection({ onHeartScoreChange }: EggHeartGameSectionProps) {
  const [score, setScore] = useState(0)
  const [pos, setPos] = useState(() => ({
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 60,
  }))

  const won = score >= HEART_JUMP_GOAL

  useEffect(() => {
    onHeartScoreChange?.(score)
  }, [score, onHeartScoreChange])

  useEffect(() => {
    if (won) return
    setPos({ x: 12 + Math.random() * 76, y: 12 + Math.random() * 76 })
  }, [score, won])

  const hit = () => {
    if (won) return
    setScore((s) => Math.min(s + 1, HEART_JUMP_GOAL))
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
        <p className="mt-3 text-sm text-ink/75">Успейте нажать на сердечко, пока оно не прыгнуло.</p>
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
        <div className="pointer-events-none absolute left-3 top-3 z-[1] rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-ink/80 shadow-sm tabular-nums">
          {won ? `${HEART_JUMP_GOAL} / ${HEART_TOTAL}` : `${score} / ${HEART_TOTAL}`}
        </div>
      </div>

    </section>
  )
}
