import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const ADMIN_TOKEN_KEY = 'wedding-admin-token'

type Guest = {
  id: number
  name: string
  token: string
  status: 'pending' | 'accepted' | 'declined'
  plusOne: boolean
  comment: string | null
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export function AdminPage() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY))
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(!!token)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await res.json()) as { token?: string; error?: string }
      if (!res.ok) {
        setLoginError(data.error || 'Ошибка входа')
        return
      }
      if (data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
        setToken(data.token)
      }
    } catch (err) {
      setLoginError('Нет связи с сервером')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (t) {
      fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${t}` } }).catch(() => {})
    }
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken(null)
  }

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const res = await fetch('/api/guests', { headers: getAuthHeaders() })
        if (res.status === 401) {
          localStorage.removeItem(ADMIN_TOKEN_KEY)
          setToken(null)
          return
        }
        if (!res.ok) throw new Error('Failed')
        const data = (await res.json()) as Guest[]
        setGuests(data)
      } catch {
        /* сеть / сервер недоступны */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !token) return
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    })
    if (res.status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      setToken(null)
      return
    }
    if (!res.ok) return
    const created = (await res.json()) as Guest
    setGuests((prev) => [...prev, created])
    setName('')
  }

  const accepted = guests.filter((g) => g.status === 'accepted').length
  const declined = guests.filter((g) => g.status === 'declined').length

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-3 text-ink sm:p-4">
        <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <h1 className="font-display mb-1 text-xl text-champagne">Вход в админку</h1>
          <p className="mb-6 text-xs text-ink/55">Введите пароль для доступа к списку гостей.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink/45">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-ink/12 bg-cream px-3 py-2.5 text-sm text-ink placeholder-ink/35 outline-none transition focus:border-sage focus:bg-white"
                placeholder="••••••••"
                autoFocus
                autoComplete="current-password"
              />
            </div>
            {loginError && (
              <p className="text-xs text-red-700/90">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-full bg-gradient-to-r from-sage via-[#95a882] to-sand py-2.5 text-sm font-semibold text-moss shadow-md shadow-ink/10 disabled:opacity-60"
            >
              {loginLoading ? 'Вход…' : 'Войти'}
            </button>
          </form>
          <Link to="/" className="mt-4 block text-center text-xs text-ink/50 hover:text-ink/75">
            ← На главную
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8 sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-xl text-champagne sm:text-2xl">Админка гостей</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[44px] rounded-full border border-ink/12 px-4 py-2 text-xs text-ink/65 hover:bg-sand/40 active:scale-[0.98] sm:py-1.5"
            >
              Выйти
            </button>
            <Link
              to="/"
              className="min-h-[44px] rounded-full border border-ink/12 px-4 py-2 text-xs text-ink/75 hover:bg-sand/40 active:scale-[0.98] sm:py-1.5"
            >
              ← К открытому приглашению
            </Link>
          </div>
        </header>

        <section className="mb-4 grid gap-3 rounded-2xl border border-ink/10 bg-white/65 p-3 text-[11px] text-ink/75 sm:mb-6 sm:grid-cols-3 sm:gap-4 sm:rounded-3xl sm:p-4 sm:text-xs">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-ink/45">
              Всего гостей
            </div>
            <div className="mt-1 text-lg font-semibold text-champagne">
              {guests.length}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-ink/45">
              Придут
            </div>
            <div className="mt-1 text-lg font-semibold text-emerald-800/90">
              {accepted}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-ink/45">
              Не придут
            </div>
            <div className="mt-1 text-lg font-semibold text-red-800/80">
              {declined}
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-ink/10 bg-white/65 p-3 sm:mb-8 sm:rounded-3xl sm:p-4">
          <h2 className="mb-2 text-xs font-semibold text-champagne sm:mb-3 sm:text-sm">
            Добавить гостя
          </h2>
          <form
            className="flex flex-col gap-3 text-[11px] text-ink/75 sm:flex-row sm:text-xs"
            onSubmit={handleCreate}
          >
            <input
              className="min-h-[44px] flex-1 rounded-xl border border-ink/12 bg-cream px-3 py-2.5 text-sm text-ink outline-none ring-0 transition focus:border-sage focus:bg-white sm:py-2"
              placeholder="Имя гостя"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="submit"
              className="min-h-[44px] rounded-full bg-gradient-to-r from-sage via-[#95a882] to-sand px-4 py-2.5 text-xs font-semibold text-moss shadow-md shadow-ink/10 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] sm:py-2"
            >
              Создать приглашение
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white/65 p-3 text-[11px] text-ink/75 sm:rounded-3xl sm:p-4 sm:text-xs">
          <h2 className="mb-2 text-xs font-semibold text-champagne sm:mb-3 sm:text-sm">
            Список гостей
          </h2>
          {loading ? (
            <p className="text-ink/50">Загрузка…</p>
          ) : guests.length === 0 ? (
            <p className="text-ink/50">Гостей пока нет.</p>
          ) : (
            <>
              <div className="space-y-2 sm:hidden">
                {guests.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-ink/8 bg-cream/80 p-3"
                  >
                    <div className="font-medium text-champagne">{g.name}</div>
                    <div className="mt-1 text-ink/55">
                      {g.status === 'accepted' ? 'Придёт' : g.status === 'declined' ? 'Не придёт' : 'Не ответил'}
                      {g.plusOne && ' · +1'}
                    </div>
                    <a
                      href={`/invite/${g.token}`}
                      className="mt-2 block break-all text-sage underline underline-offset-2"
                      target="_blank"
                      rel="noreferrer"
                    >
                      /invite/{g.token}
                    </a>
                    {g.comment && (
                      <p className="mt-2 border-t border-ink/10 pt-2 text-ink/65">
                        {g.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="hidden overflow-x-auto sm:block">
                <table className="min-w-[600px] border-separate border-spacing-y-1 text-left">
                  <thead className="text-[11px] uppercase tracking-[0.16em] text-ink/45">
                    <tr>
                      <th className="px-3 py-1">Имя</th>
                      <th className="px-3 py-1">Статус</th>
                      <th className="px-3 py-1">+1</th>
                      <th className="px-3 py-1">Ссылка</th>
                      <th className="px-3 py-1">Комментарий</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((g) => (
                      <tr
                        key={g.id}
                        className="rounded-2xl border border-ink/8 bg-cream/80"
                      >
                        <td className="px-3 py-2 text-sm text-champagne">{g.name}</td>
                        <td className="px-3 py-2">
                          {g.status === 'accepted'
                            ? 'Придёт'
                            : g.status === 'declined'
                              ? 'Не придёт'
                              : 'Не ответил'}
                        </td>
                        <td className="px-3 py-2">
                          {g.plusOne ? 'Да' : 'Нет'}
                        </td>
                        <td className="px-3 py-2">
                          <a
                            href={`/invite/${g.token}`}
                            className="break-all text-sage underline underline-offset-2"
                            target="_blank"
                            rel="noreferrer"
                          >
                            /invite/{g.token}
                          </a>
                        </td>
                        <td className="px-3 py-2 max-w-xs">
                          {g.comment ?? <span className="text-ink/35">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

