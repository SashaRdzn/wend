/** Запасной URL, если на Vercel не задан VITE_API_URL (лучше задать в панели Vercel). */
const PROD_API_ORIGIN_FALLBACK = 'https://wend-pias.onrender.com'

/**
 * Dev: относительные `/api` (прокси Vite → localhost:4000).
 * Prod (Vercel): задайте VITE_API_URL = URL вашего API на Render (без `/` в конце).
 */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const fromEnv = import.meta.env.VITE_API_URL?.trim()
  if (fromEnv) {
    return `${fromEnv.replace(/\/$/, '')}${p}`
  }
  if (import.meta.env.DEV) {
    return p
  }
  return `${PROD_API_ORIGIN_FALLBACK}${p}`
}
