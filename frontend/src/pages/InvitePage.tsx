import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { WeddingLanding } from '../WeddingLanding'

type Guest = {
  id: number
  name: string
  token: string
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
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const res = await fetch(`/api/guests/by-token/${token}`)
        if (!res.ok) throw new Error('Failed')
        const data = (await res.json()) as Guest
        setGuest(data)
      } catch {
        /* сеть / сервер недоступны */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    const res = await fetch(`/api/rsvp/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, plusOne, comment }),
    })
    if (!res.ok) return
    setSubmitted(true)
  }

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
