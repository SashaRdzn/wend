import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { applyTheme, getStoredTheme, THEMES, type ThemeId } from '../theme'

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
  const [themeId, setThemeId] = useState<ThemeId>(getStoredTheme())
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const handleThemeChange = (id: ThemeId) => {
    applyTheme(id)
    setThemeId(id)
  }

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
      } catch (e) {
        console.error(e)
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
      <div className="min-h-screen bg-ink text-white flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-4 sm:rounded-3xl sm:p-6">
          <h1 className="font-display text-xl text-champagne mb-1">Вход в админку</h1>
          <p className="text-xs text-white/60 mb-6">Введите пароль для доступа к списку гостей.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-rose-200 focus:bg-white/10"
                placeholder="••••••••"
                autoFocus
                autoComplete="current-password"
              />
            </div>
            {loginError && (
              <p className="text-xs text-rose-300">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-full bg-gradient-to-r from-rose-300 via-rose-400 to-amber-200 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-rose-900/40 disabled:opacity-60"
            >
              {loginLoading ? 'Вход…' : 'Войти'}
            </button>
          </form>
          <Link to="/" className="mt-4 block text-center text-xs text-white/60 hover:text-white/80">
            ← На главную
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8 sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-xl text-champagne sm:text-2xl">Админка гостей</h1>
            <p className="text-[11px] text-white/70 sm:text-xs">
              Управление списком гостей, ссылками и статусами RSVP.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[44px] rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:bg-white/10 active:scale-[0.98] sm:py-1.5"
            >
              Выйти
            </button>
            <Link
              to="/"
              className="min-h-[44px] rounded-full border border-white/15 px-4 py-2 text-xs text-white/80 hover:bg-white/10 active:scale-[0.98] sm:py-1.5"
            >
              ← К приглашению
            </Link>
          </div>
        </header>

        <section className="mb-4 rounded-2xl border border-white/10 bg-black/40 p-3 sm:mb-6 sm:rounded-3xl sm:p-4">
          <h2 className="mb-2 text-xs font-semibold text-champagne sm:mb-3 sm:text-sm">
            Тема оформления
          </h2>
          <p className="mb-2 text-[11px] text-white/60 sm:mb-3 sm:text-xs">
            Выбранная тема применяется к главной странице и приглашениям.
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeChange(theme.id)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-white/30 ${
                  themeId === theme.id
                    ? 'bg-champagne text-ink ring-2 ring-champagne/50'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4 grid gap-3 rounded-2xl border border-white/10 bg-black/40 p-3 text-[11px] text-white/80 sm:mb-6 sm:grid-cols-3 sm:gap-4 sm:rounded-3xl sm:p-4 sm:text-xs">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
              Всего гостей
            </div>
            <div className="mt-1 text-lg font-semibold text-champagne">
              {guests.length}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
              Придут
            </div>
            <div className="mt-1 text-lg font-semibold text-emerald-300">
              {accepted}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
              Не придут
            </div>
            <div className="mt-1 text-lg font-semibold text-rose-300">
              {declined}
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-white/10 bg-black/40 p-3 sm:mb-8 sm:rounded-3xl sm:p-4">
          <h2 className="mb-2 text-xs font-semibold text-champagne sm:mb-3 sm:text-sm">
            Добавить гостя
          </h2>
          <form
            className="flex flex-col gap-3 text-[11px] text-white/80 sm:flex-row sm:text-xs"
            onSubmit={handleCreate}
          >
            <input
              className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none ring-0 transition focus:border-rose-200 focus:bg-white/10 sm:py-2"
              placeholder="Имя гостя"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="submit"
              className="min-h-[44px] rounded-full bg-gradient-to-r from-rose-300 via-rose-400 to-amber-200 px-4 py-2.5 text-xs font-semibold text-ink shadow-lg shadow-rose-900/40 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] sm:py-2"
            >
              Создать приглашение
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/40 p-3 text-[11px] text-white/80 sm:rounded-3xl sm:p-4 sm:text-xs">
          <h2 className="mb-2 text-xs font-semibold text-champagne sm:mb-3 sm:text-sm">
            Список гостей
          </h2>
          {loading ? (
            <p className="text-white/60">Загрузка…</p>
          ) : guests.length === 0 ? (
            <p className="text-white/60">Гостей пока нет.</p>
          ) : (
            <>
              <div className="space-y-2 sm:hidden">
                {guests.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-white/5 bg-white/5 p-3"
                  >
                    <div className="font-medium text-champagne">{g.name}</div>
                    <div className="mt-1 text-white/60">
                      {g.status === 'accepted' ? 'Придёт' : g.status === 'declined' ? 'Не придёт' : 'Не ответил'}
                      {g.plusOne && ' · +1'}
                    </div>
                    <a
                      href={`/invite/${g.token}`}
                      className="mt-2 block break-all text-rose-200 underline underline-offset-2"
                      target="_blank"
                      rel="noreferrer"
                    >
                      /invite/{g.token}
                    </a>
                    {g.comment && (
                      <p className="mt-2 border-t border-white/10 pt-2 text-white/70">
                        {g.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="hidden overflow-x-auto sm:block">
                <table className="min-w-[600px] border-separate border-spacing-y-1 text-left">
                  <thead className="text-[11px] uppercase tracking-[0.16em] text-white/50">
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
                        className="rounded-2xl border border-white/5 bg-white/5"
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
                            className="break-all text-rose-200 underline underline-offset-2"
                            target="_blank"
                            rel="noreferrer"
                          >
                            /invite/{g.token}
                          </a>
                        </td>
                        <td className="px-3 py-2 max-w-xs">
                          {g.comment ?? <span className="text-white/40">—</span>}
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

