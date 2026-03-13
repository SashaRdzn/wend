import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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
      } catch (e) {
        console.error(e)
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

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-3 pb-16 pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-6 sm:pt-10 lg:px-8 lg:pt-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),transparent_60%),radial-gradient(circle_at_bottom,_rgba(253,224,171,0.20),transparent_55%)]" />

        <header className="relative mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
          <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase text-white/70 backdrop-blur sm:px-4 sm:py-1 sm:text-[11px] sm:tracking-[0.18em]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300 shadow-[0_0_12px_rgba(253,164,175,0.9)]" />
            <span className="truncate">Приглашение</span>
            {guest && (
              <span className="ml-1 truncate text-white/80 sm:ml-2">
                · {guest.name}
              </span>
            )}
          </div>
          <Link
            to="/"
            className="min-h-[44px] shrink-0 rounded-full border border-white/15 bg-black/30 px-4 py-2.5 text-xs text-white/80 hover:bg-white/10 active:scale-[0.98] sm:py-1.5"
          >
            ← Общая страница
          </Link>
        </header>

        <main className="relative flex-1">
          {loading ? (
            <p className="text-white/70">Загружаем ваше приглашение…</p>
          ) : !guest ? (
            <p className="text-rose-300">
              Приглашение не найдено. Пожалуйста, уточните ссылку у организаторов.
            </p>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              <div className="mt-6 grid gap-10 sm:mt-8 sm:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
                <section className="min-w-0 max-w-xl space-y-4 sm:space-y-6">
                  <h1 className="font-display text-3xl leading-tight text-champagne sm:text-5xl lg:text-6xl">
                    Алиса <span className="text-rose-200">&</span> Михаил
                  </h1>
                  <p className="text-sm text-white/80 sm:text-base">
                    Уважаемый(ая) {guest.name}, мы будем рады видеть вас на нашем
                    главном дне. Ниже вы найдёте историю, детали дня и форму, где
                    можно подтвердить участие.
                  </p>
                  <p className="text-xs text-white/70">
                    Эта страница принадлежит только вам — по вашему ответу мы
                    подготовим рассадку и учтём все важные детали.
                  </p>
                </section>

                <section className="space-y-3">
                  <img
                    src="https://images.pexels.com/photos/3951628/pexels-photo-3951628.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Пара на закате"
                    className="h-40 w-full rounded-2xl object-cover shadow-lg shadow-black/40 sm:h-60 sm:rounded-3xl"
                  />
                  <div className="-mx-1 overflow-hidden rounded-xl sm:mx-0 sm:rounded-2xl">
                    <div className="gallery-live flex gap-2 w-max sm:gap-3">
                      {[
                        'https://images.pexels.com/photos/2604692/pexels-photo-2604692.jpeg?auto=compress&cs=tinysrgb&w=500',
                        'https://images.pexels.com/photos/3951675/pexels-photo-3951675.jpeg?auto=compress&cs=tinysrgb&w=500',
                        'https://images.pexels.com/photos/5732275/pexels-photo-5732275.jpeg?auto=compress&cs=tinysrgb&w=500',
                        'https://images.pexels.com/photos/1779491/pexels-photo-1779491.jpeg?auto=compress&cs=tinysrgb&w=500',
                        'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=500',
                        'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=500',
                        'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=500',
                        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=500',
                        'https://images.pexels.com/photos/3767235/pexels-photo-3767235.jpeg?auto=compress&cs=tinysrgb&w=500',
                        'https://images.pexels.com/photos/3014858/pexels-photo-3014858.jpeg?auto=compress&cs=tinysrgb&w=500',
                      ].flatMap((src) => [src, src]).map((src, i) => (
                        <img
                          key={`invite-live-${i}-${src.slice(-25)}`}
                          src={src}
                          alt="Свадебный момент"
                          className="h-20 w-28 flex-none rounded-xl object-cover shadow-md sm:h-24 sm:w-40 sm:rounded-2xl"
                        />
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <section
                id="story"
                className="mt-12 grid gap-8 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-10 lg:pt-12"
              >
                <div className="min-w-0 space-y-3 sm:space-y-4">
                  <h2 className="font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
                    Наша история
                  </h2>
                  <p className="text-sm text-white/80">
                    Мы познакомились в уютной кофейне в 2019 году, где случайный
                    плейлист и разговор до закрытия всё изменили. Затем были
                    проекты, прогулки по ночной Москве, путешествия и планы, которые
                    шаг за шагом привели нас к этому дню.
                  </p>
                  <p className="text-sm text-white/70">
                    Нам особенно важно, что именно вы рядом с нами в этот момент —
                    поддерживаете, радуетесь и разделяете то, что для нас так
                    ценно.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-white/75">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                      Где и когда
                    </p>
                    <p className="mt-2 text-sm font-semibold text-champagne">
                      15 августа 2026 · Подмосковье
                    </p>
                    <p className="mt-2">
                      Церемония под открытым небом в загородном доме, среди сада и
                      огней гирлянд. Точный адрес и карта будут в общем сообщении,
                      а при необходимости мы с радостью подскажем дорогу лично.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                      Небольшие детали
                    </p>
                    <p className="mt-2">
                      Дресс‑код: светлый smart casual с нежными розовыми акцентами
                      — но самое главное, чтобы вам было комфортно.
                    </p>
                  </div>
                </div>
              </section>

              <section
                id="schedule"
                className="mt-12 space-y-6 border-t border-white/10 pt-10 sm:mt-16 sm:space-y-8 sm:pt-12"
              >
                <h2 className="font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
                  Как пройдёт день
                </h2>
                <div className="grid gap-3 text-[11px] text-white/80 sm:gap-4 sm:text-xs lg:grid-cols-3">
                  {[
                    {
                      time: '15:00',
                      title: 'Welcome-зона',
                      text: 'Сбор гостей, welcome‑drinks и живая музыка в саду.',
                    },
                    {
                      time: '16:00',
                      title: 'Церемония',
                      text: 'Торжественная церемония под открытым небом.',
                    },
                    {
                      time: '17:30',
                      title: 'Ужин и праздник',
                      text: 'Ужин, тосты, танцы и маленькие сюрпризы.',
                    },
                  ].map((item) => (
                    <div
                      key={item.time}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                    >
                      <div className="text-[11px] uppercase tracking-[0.22em] text-rose-100/80">
                        {item.time}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-champagne">
                        {item.title}
                      </div>
                      <p className="mt-2">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="rsvp"
                className="mt-8 space-y-4 border-t border-white/10 pt-8 sm:mt-4 sm:space-y-6 sm:pt-10"
              >
                <h2 className="font-display text-xl text-champagne sm:text-2xl lg:text-3xl">
                  Ответьте на приглашение
                </h2>
                <section className="rounded-2xl border border-white/10 bg-black/40 p-4 text-[11px] text-white/80 backdrop-blur sm:rounded-[32px] sm:p-6 sm:text-xs">
                  {submitted ? (
                    <p className="text-emerald-300">
                      Спасибо! Мы получили ваш ответ и обязательно всё учтём.
                    </p>
                  ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/60">
                          Вы придёте?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setStatus('accepted')}
                            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
                              status === 'accepted'
                                ? 'bg-emerald-300 text-ink'
                                : 'bg-white/5 text-white/80'
                            }`}
                          >
                            Да, с радостью
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus('pending')}
                            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
                              status === 'pending'
                                ? 'bg-amber-200 text-ink'
                                : 'bg-white/5 text-white/80'
                            }`}
                          >
                            Пока не уверены
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus('declined')}
                            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
                              status === 'declined'
                                ? 'bg-rose-300 text-ink'
                                : 'bg-white/5 text-white/80'
                            }`}
                          >
                            К сожалению, нет
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/60">
                          Вы будете со спутником?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setPlusOne(false)}
                            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
                              !plusOne
                                ? 'bg-white/90 text-ink'
                                : 'bg-white/5 text-white/80'
                            }`}
                          >
                            Приду один(одна)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPlusOne(true)}
                            className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs sm:py-2 ${
                              plusOne
                                ? 'bg-white/90 text-ink'
                                : 'bg-white/5 text-white/80'
                            }`}
                          >
                            Буду со спутником
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-white/60">
                          Комментарий
                        </label>
                        <textarea
                          rows={3}
                          className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-rose-200 focus:bg-white/10"
                          placeholder="Аллергии, пожелания по меню, особые моменты, которые нам важно учесть"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-rose-300 via-rose-400 to-amber-200 px-5 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-rose-900/40 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] sm:px-6"
                      >
                        Отправить ответ
                      </button>
                    </form>
                  )}
                </section>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

