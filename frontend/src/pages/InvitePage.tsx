import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ALCOHOL_KEYS,
  ALCOHOL_LABELS,
  type AlcoholKey,
  parseAlcoholPreferences,
} from '../alcoholOptions'
import { apiUrl } from '../apiUrl'
import {
  RsvpPhotoFields,
  appendRsvpFiles,
  emptyRsvpPhotos,
  validateRsvpPhotos,
  type RsvpPhotosFormState,
  type RsvpSavedPhotos,
} from '../RsvpPhotoFields'
import { WeddingLanding } from '../WeddingLanding'

const emptySavedPhotos: RsvpSavedPhotos = { self: false, plusOne: false, together: false }

type Guest = {
  id: number
  name: string
  token: string
  status?: 'accepted' | 'declined' | 'pending'
  plusOne?: boolean
  comment?: string | null
  alcoholPreferences?: AlcoholKey[]
  hasResponded?: boolean
  photos?: RsvpSavedPhotos
}

const inviteStorageKey = (t: string) => `wend-invite-guest:${t}`

function readInviteGuest(t: string): Guest | null {
  try {
    const raw = sessionStorage.getItem(inviteStorageKey(t))
    if (!raw) return null
    return JSON.parse(raw) as Guest
  } catch {
    return null
  }
}

function writeInviteGuest(t: string, g: Guest) {
  try {
    sessionStorage.setItem(inviteStorageKey(t), JSON.stringify(g))
  } catch {
  }
}

function formDefaultsFromGuest(g: Guest | null) {
  const st = g?.status
  const status: 'accepted' | 'declined' | 'pending' =
    st === 'accepted' || st === 'declined' || st === 'pending' ? st : 'accepted'
  return {
    status,
    plusOne: !!g?.plusOne,
    comment: typeof g?.comment === 'string' ? g.comment : '',
    alcohol: new Set(parseAlcoholPreferences(g?.alcoholPreferences)),
  }
}

export function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const [guest, setGuest] = useState<Guest | null>(() => (token ? readInviteGuest(token) : null))
  const [loading, setLoading] = useState(() => {
    if (!token) return false
    return readInviteGuest(token) === null
  })
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState<'accepted' | 'declined' | 'pending'>(() =>
    formDefaultsFromGuest(token ? readInviteGuest(token) : null).status,
  )
  const [plusOne, setPlusOne] = useState(() =>
    formDefaultsFromGuest(token ? readInviteGuest(token) : null).plusOne,
  )
  const [comment, setComment] = useState(() =>
    formDefaultsFromGuest(token ? readInviteGuest(token) : null).comment,
  )
  const [alcohol, setAlcohol] = useState<Set<AlcoholKey>>(() =>
    formDefaultsFromGuest(token ? readInviteGuest(token) : null).alcohol,
  )
  const [photos, setPhotos] = useState<RsvpPhotosFormState>(() => emptyRsvpPhotos())
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submitErrorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!submitError) return
    submitErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [submitError])

  useEffect(() => {
    if (!token) return
    setEditing(false)
    let cancelled = false
    const hadCache = readInviteGuest(token) !== null
    if (!hadCache) setLoading(true)
    const load = async () => {
      try {
        const res = await fetch(apiUrl(`/api/guests/by-token/${token}`))
        if (!res.ok) throw new Error('Failed')
        const data = (await res.json()) as Guest
        if (cancelled) return
        setGuest(data)
        writeInviteGuest(token, data)
        if (data.status) setStatus(data.status)
        setPlusOne(!!data.plusOne)
        setComment(typeof data.comment === 'string' ? data.comment : '')
        setAlcohol(new Set(parseAlcoholPreferences(data.alcoholPreferences)))
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!plusOne) setPhotos((p) => ({ ...p, plusOne: null, together: null }))
  }, [plusOne])

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
    setSubmitError('')
    if (!token || submitting) return
    const alcoholPreferences = status === 'declined' ? [] : [...alcohol]
    const savedPhotos = guest?.photos ?? emptySavedPhotos
    const photoErr = validateRsvpPhotos(status, plusOne, photos, savedPhotos)
    if (photoErr) {
      setSubmitError(photoErr)
      return
    }

    const fd = new FormData()
    fd.append('status', status)
    fd.append('plusOne', plusOne ? '1' : '0')
    fd.append('comment', comment)
    fd.append('alcoholPreferences', JSON.stringify(alcoholPreferences))
    appendRsvpFiles(fd, status, plusOne, photos)

    setSubmitting(true)
    try {
      const res = await fetch(apiUrl(`/api/rsvp/${token}`), {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        setSubmitError(err.error || 'Не удалось сохранить')
        return
      }
      try {
        const sync = await fetch(apiUrl(`/api/guests/by-token/${encodeURIComponent(token)}`))
        if (sync.ok) {
          const next = (await sync.json()) as Guest
          setGuest(next)
          writeInviteGuest(token, next)
        } else {
          setGuest((g) => {
            if (!g) return g
            const next = { ...g, hasResponded: true as const }
            writeInviteGuest(token, next)
            return next
          })
        }
      } catch {
        setGuest((g) => {
          if (!g) return g
          const next = { ...g, hasResponded: true as const }
          writeInviteGuest(token, next)
          return next
        })
      }
      setPhotos(emptyRsvpPhotos())
      setEditing(false)
    } catch {
      setSubmitError('Не удалось отправить. Проверьте соединение и попробуйте снова.')
    } finally {
      setSubmitting(false)
    }
  }

  const alcoholDisabled = status === 'declined'
  const hasResponded = guest?.hasResponded === true
  const showForm = !hasResponded || editing

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

  const statusSummary =
    status === 'accepted'
      ? 'Вы отметили, что придёте на праздник.'
      : status === 'declined'
        ? 'Вы отметили, что не сможете прийти.'
        : 'Вы отметили, что пока не уверены.'

  const rsvpSlot = !showForm ? (
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-ink/80 backdrop-blur sm:rounded-3xl sm:p-6">
      <p className="text-emerald-800/90">Спасибо! Ваш ответ сохранён.</p>
      <div className="space-y-1.5 text-[13px] leading-relaxed text-ink/75">
        <p>{statusSummary}</p>
        {status !== 'declined' && (
          <p className="text-ink/65">
            {plusOne ? 'Будете со спутником.' : 'Придёте без спутника.'}
          </p>
        )}
        {status !== 'declined' && alcohol.size > 0 ? (
          <p className="text-ink/65">
            <span className="text-ink/45">Напитки: </span>
            {[...alcohol].map((k) => ALCOHOL_LABELS[k]).join(', ')}
          </p>
        ) : null}
        {comment.trim() ? (
          <p className="border-t border-ink/10 pt-2 text-ink/60">
            <span className="text-ink/45">Комментарий: </span>
            {comment.trim()}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-sage/45 bg-cream/90 px-5 py-2.5 text-sm font-medium text-moss transition hover:bg-sage/15 active:scale-[0.98] sm:w-auto"
      >
        Изменить ответ
      </button>
    </div>
  ) : (
    <form
      className="space-y-4 rounded-2xl border border-ink/12 bg-white/70 p-4 text-[11px] text-ink/75 backdrop-blur-lg sm:rounded-3xl sm:p-6 sm:text-xs"
      noValidate
      aria-busy={submitting}
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

      <RsvpPhotoFields
        status={status}
        plusOne={plusOne}
        saved={guest?.photos ?? emptySavedPhotos}
        value={photos}
        onChange={setPhotos}
      />

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

      {submitError ? (
        <p ref={submitErrorRef} className="text-xs text-red-800/90">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="touch-manipulation inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-sage via-[#95a882] to-sand px-5 py-2.5 text-sm font-semibold text-moss shadow-lg shadow-ink/10 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] enabled:cursor-pointer disabled:opacity-70 sm:px-6"
      >
        {submitting ? 'Отправка…' : 'Отправить ответ'}
      </button>
      <p className="text-center text-[10px] leading-relaxed text-ink/45 sm:text-[11px]">
        После отправки на сайте появится кое-что ещё.
      </p>
    </form>
  )

  return (
    <WeddingLanding
      guestName={guest.name}
      showOpenInviteLink
      rsvpSlot={rsvpSlot}
      inviteToken={token}
      rsvpAnswered={guest.hasResponded === true}
    />
  )
}
