const PROD_API_ORIGIN_FALLBACK = 'https://wend-pias.onrender.com'

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
