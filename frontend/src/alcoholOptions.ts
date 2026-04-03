export const ALCOHOL_KEYS = [
  'beer',
  'liquor',
  'wine',
  'champagne',
  'vodka',
  'whiskey',
  'cocktails',
] as const

export type AlcoholKey = (typeof ALCOHOL_KEYS)[number]

export const ALCOHOL_LABELS: Record<AlcoholKey, string> = {
  beer: 'Пиво',
  liquor: 'Ликёр',
  wine: 'Вино',
  champagne: 'Шампанское',
  vodka: 'Водка',
  whiskey: 'Виски',
  cocktails: 'Коктейли',
}

export function parseAlcoholPreferences(raw: unknown): AlcoholKey[] {
  if (!Array.isArray(raw)) return []
  const set = new Set(ALCOHOL_KEYS)
  return raw.filter((x): x is AlcoholKey => typeof x === 'string' && set.has(x as AlcoholKey))
}
