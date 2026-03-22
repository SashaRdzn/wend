import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ALCOHOL_KEYS,
  ALCOHOL_LABELS,
  type AlcoholKey,
  parseAlcoholPreferences,
} from '../alcoholOptions'
import { apiUrl } from '../apiUrl'
import { WeddingLanding } from '../WeddingLanding'

type Guest = {
  id: number
  name: string
  token: string
  alcoholPreferences?: AlcoholKey[]
}

export function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'accepted' | 'declined' | 'pending'>(
    'accepted',
  )
  const [plusOne, setPlusOne] = useState(false)
  const [comment, setComment] = useState('')
  const [alcohol, setAlcohol] = useState<Set<AlcoholKey>>(() => new Set())
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const res = await fetch(apiUrl(`/api/guests/by-token/${token}`))
        if (!res.ok) throw new Error('Failed')
        const data = (await res.json()) as Guest
        setGuest(data)
        setAlcohol(new Set(parseAlcoholPreferences(data.alcoholPreferences)))
      } catch {
        /* сеть / сервер недоступны */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const toggleAlcohol = (key: AlcoholKey) => {
    setAlcohol((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectAllAlcohol = () => setAlcohol(new Set(ALCOHOL_KEYS))
  const clearAlcohol = () => setAlcohol(new Set())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    const alcoholPreferences = status === 'declined' ? [] : [...alcohol]
    const res = await fetch(apiUrl(`/api/rsvp/${token}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, plusOne, comment, alcoholPreferences }),
    })
    if (!res.ok) return
    setSubmitted(true)
  }

  const alcoholDisabled = status === 'declined'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4 text-ink/60">
        Загружаем ваше приглашение…
      </div>
    )
  }

  if (!guest || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4 text-center">
        <p className="max-w-md text-red-800/85">
          Приглашение не найдено. Пожалуйста, уточните ссылку у организаторов.
        </p>
      </div>
    )
  }

  const rsvpSlot = submitted ? (
    <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-emerald-800/90 backdrop-blur sm:rounded-3xl sm:p-6">
      Спасибо! Мы получили ваш ответ и обязательно всё учтём.
    </div>
  ) : (
    <form
      className="space-y-4 rounded-2xl border border-ink/12 bg-white/70 p-4 text-[11px] text-ink/75 backdrop-blur-lg sm:rounded-3xl sm:p-6 sm:text-xs"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink/50">
          Вы придёте?
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatus('accepted')}
            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
              status === 'accepted'
                ? 'bg-emerald-200/90 text-moss'
                : 'bg-sand/50 text-ink/70'
            }`}
          >
            Да, с радостью
          </button>
          <button
            type="button"
            onClick={() => setStatus('pending')}
            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
              status === 'pending'
                ? 'bg-amber-100 text-moss ring-1 ring-ink/15'
                : 'bg-sand/50 text-ink/70'
            }`}
          >
            Пока не уверены
          </button>
          <button
            type="button"
            onClick={() => setStatus('declined')}
            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
              status === 'declined'
                ? 'bg-red-100 text-red-900/85 ring-1 ring-red-200'
                : 'bg-sand/50 text-ink/70'
            }`}
          >
            К сожалению, нет
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink/50">
          Вы будете со спутником?
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPlusOne(false)}
            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
              !plusOne ? 'bg-sage/35 text-moss ring-1 ring-ink/12' : 'bg-sand/50 text-ink/70'
            }`}
          >
            Приду один(одна)
          </button>
          <button
            type="button"
            onClick={() => setPlusOne(true)}
            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
              plusOne ? 'bg-sage/35 text-moss ring-1 ring-ink/12' : 'bg-sand/50 text-ink/70'
            }`}
          >
            Буду со спутником
          </button>
        </div>
      </div>

      <div
        className={`rounded-2xl border border-ink/10 bg-cream/50 p-3 sm:p-4 ${alcoholDisabled ? 'opacity-45' : ''}`}
      >
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50">
              Что пьём на празднике
            </p>
            <p className="mt-0.5 text-[10px] text-ink/40 sm:text-[11px]">
              Можно выбрать несколько вариантов или всё сразу
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={alcoholDisabled}
              onClick={selectAllAlcohol}
              className="rounded-full border border-sage/40 bg-white/80 px-3 py-1 text-[10px] font-medium text-moss transition hover:bg-sage/20 disabled:pointer-events-none sm:text-[11px]"
            >
              Выбрать всё
            </button>
            <button
              type="button"
              disabled={alcoholDisabled}
              onClick={clearAlcohol}
              className="rounded-full border border-ink/10 bg-white/60 px-3 py-1 text-[10px] text-ink/55 transition hover:bg-white disabled:pointer-events-none sm:text-[11px]"
            >
              Снять всё
            </button>
          </div>
        </div>
        {alcoholDisabled ? (
          <p className="text-[11px] text-ink/45">Не требуется, если вы не приедете.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
            {ALCOHOL_KEYS.map((key) => {
              const on = alcohol.has(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleAlcohol(key)}
                  className={`relative min-h-[48px] rounded-2xl border px-3 py-2.5 text-left text-xs font-medium transition sm:min-h-[52px] sm:text-[13px] ${
                    on
                      ? 'border-sage bg-gradient-to-br from-sage/35 to-sand/40 text-moss shadow-sm shadow-ink/5 ring-1 ring-sage/30'
                      : 'border-ink/10 bg-white/70 text-ink/70 hover:border-ink/18 hover:bg-white'
                  }`}
                >
                  <span
                    className={`mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-md border text-[9px] ${
                      on
                        ? 'border-moss/40 bg-moss/15 text-moss'
                        : 'border-ink/15 bg-cream text-transparent'
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  {ALCOHOL_LABELS[key]}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-ink/50">
          Комментарий
        </label>
        <textarea
          rows={3}
          className="w-full resize-none rounded-xl border border-ink/12 bg-cream px-3 py-2 text-sm text-ink outline-none ring-0 transition focus:border-sage focus:bg-white"
          placeholder="Аллергии, пожелания по меню, особые моменты, которые нам важно учесть"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-sage via-[#95a882] to-sand px-5 py-2.5 text-sm font-semibold text-moss shadow-lg shadow-ink/10 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] sm:px-6"
      >
        Отправить ответ
      </button>
    </form>
  )

  return (
    <WeddingLanding
      guestName={guest.name}
      showOpenInviteLink
      rsvpSlot={rsvpSlot}
    />
  )
}
