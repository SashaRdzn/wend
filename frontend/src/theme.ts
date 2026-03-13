export const THEMES = [
  {
    id: 'purple',
    name: 'Фиолетовая',
    colors: {
      '--theme-ink': '#1b1230',
      '--theme-champagne': '#fdf4e3',
      '--theme-blush-50': '#fff7f8',
      '--theme-blush-100': '#ffe9ee',
      '--theme-blush-200': '#ffd0db',
      '--theme-blush-400': '#f78ca2',
      '--theme-blush-500': '#f26c88',
    },
  },
  {
    id: 'beige',
    name: 'Бежевая',
    colors: {
      '--theme-ink': '#2c2416',
      '--theme-champagne': '#f5ebe0',
      '--theme-blush-50': '#faf6f2',
      '--theme-blush-100': '#f0e6dc',
      '--theme-blush-200': '#e8d4c4',
      '--theme-blush-400': '#c4a574',
      '--theme-blush-500': '#a67c52',
    },
  },
  {
    id: 'sage',
    name: 'Шалфей',
    colors: {
      '--theme-ink': '#1a2421',
      '--theme-champagne': '#e8f0ec',
      '--theme-blush-50': '#f2f7f4',
      '--theme-blush-100': '#ddeae2',
      '--theme-blush-200': '#b8d4c4',
      '--theme-blush-400': '#6ba67d',
      '--theme-blush-500': '#4a8f5e',
    },
  },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

const STORAGE_KEY = 'wedding-theme'

export function getStoredTheme(): ThemeId {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (THEMES.some((t) => t.id === stored)) return stored as ThemeId
  return 'purple'
}

export function applyTheme(themeId: ThemeId): void {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0]
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(key, value)
  }
  localStorage.setItem(STORAGE_KEY, themeId)
}
