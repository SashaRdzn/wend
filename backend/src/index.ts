import express from 'express'
import cors, { type CorsOptions } from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { logger } from './logger'
import { requestLogMiddleware } from './httpLog'
import { config as loadEnv } from 'dotenv'
import { openSqliteDatabase, type SqliteAsync } from './sqliteDb'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.join(__dirname, '../.env') })

const SQLITE_FILE = process.env.SQLITE_PATH
  ? path.resolve(process.env.SQLITE_PATH)
  : path.join(__dirname, '..', 'wedding.sqlite')

const app = express()
/** На Render за прокси — корректный req.ip / X-Forwarded-For */
app.set('trust proxy', 1)

const PORT = Number(process.env.PORT) || 4000
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_na_vaibe'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

const sessions = new Map<string, { expiresAt: number }>()

const ALCOHOL_KEYS = ['beer', 'liquor', 'wine', 'champagne', 'vodka'] as const
type AlcoholKey = (typeof ALCOHOL_KEYS)[number]

function normalizeAlcoholPreferences(input: unknown): string | null {
  if (input === undefined || input === null) return null
  if (!Array.isArray(input)) return null
  const allowed = new Set<string>(ALCOHOL_KEYS)
  const cleaned = [
    ...new Set(
      input.filter((x): x is string => typeof x === 'string' && allowed.has(x)),
    ),
  ].sort() as AlcoholKey[]
  return JSON.stringify(cleaned)
}

function parseAlcoholJson(raw: string | null | undefined): string[] {
  if (raw == null || raw === '') return []
  try {
    const v = JSON.parse(raw) as unknown
    if (!Array.isArray(v)) return []
    const allowed = new Set<string>(ALCOHOL_KEYS)
    return v.filter((x): x is string => typeof x === 'string' && allowed.has(x))
  } catch {
    return []
  }
}

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
  const session = token ? sessions.get(token) : null
  if (!session || Date.now() > session.expiresAt) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

/** Vercel и др.: браузер шлёт Origin — либо список из CORS_ORIGIN, либо «отразить» Origin (true). */
const corsOptions: CorsOptions = {
  origin: (() => {
    const raw = process.env.CORS_ORIGIN?.trim()
    if (!raw) return true
    if (raw === '*') return true
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  })(),
}
app.use(cors(corsOptions))
app.use(express.json({ limit: '512kb' }))
app.use(requestLogMiddleware)

let dbSingleton: SqliteAsync | null = null
let dbMigrated = false

async function initDb(): Promise<SqliteAsync> {
  if (!dbSingleton) {
    dbSingleton = openSqliteDatabase(SQLITE_FILE)
  }
  const db = dbSingleton
  if (!dbMigrated) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'pending',
        plusOne INTEGER NOT NULL DEFAULT 0,
        comment TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `)
    const cols = await db.all<{ name: string }>('PRAGMA table_info(guests)')
    if (!cols.some((c) => c.name === 'alcoholPreferences')) {
      await db.exec('ALTER TABLE guests ADD COLUMN alcoholPreferences TEXT')
    }
    if (!cols.some((c) => c.name === 'rsvpAt')) {
      await db.exec('ALTER TABLE guests ADD COLUMN rsvpAt TEXT')
      await db.run(
        `UPDATE guests SET rsvpAt = updatedAt WHERE rsvpAt IS NULL AND updatedAt != createdAt`,
      )
    }
    if (!cols.some((c) => c.name === 'rsvpSource')) {
      await db.exec('ALTER TABLE guests ADD COLUMN rsvpSource TEXT')
    }
    dbMigrated = true
  }
  return db
}

function generateToken() {
  return crypto.randomBytes(8).toString('hex')
}

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body as { password?: string }
  if (password !== ADMIN_PASSWORD) {
    logger.warn('auth_login_rejected', { ip: req.ip, path: '/api/auth/login' })
    res.status(401).json({ error: 'Неверный пароль' })
    return
  }
  const token = crypto.randomBytes(24).toString('hex')
  sessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS })
  logger.info('auth_login_ok', { ip: req.ip })
  res.json({ token })
})

app.post('/api/auth/logout', (req, res) => {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
  if (token) sessions.delete(token)
  res.json({ ok: true })
})

/** См. GET /api/egg/prize/:token — та же формула, для сверки в админке. */
function eggPrizePhraseForToken(token: string): string {
  const secret = process.env.EGG_PRIZE_SECRET || 'wend-egg-dev-secret-change-in-prod'
  const h = crypto.createHmac('sha256', secret).update(token).digest()
  const a = h.readUInt32BE(0)
  const b = h.readUInt32BE(4)
  const c = h.readUInt32BE(8)
  const words = [
    'лунный',
    'тихий',
    'садовый',
    'утренний',
    'звёздный',
    'медовый',
    'лесной',
    'ночной',
    'солнечный',
    'нежный',
    'смелый',
    'добрый',
  ]
  const nouns = [
    'кролик',
    'лось',
    'светлячок',
    'компас',
    'зонтик',
    'тортик',
    'маршрут',
    'секрет',
    'код',
    'приз',
    'ключик',
    'сердце',
  ]
  const w1 = words[a % words.length]
  const w2 = nouns[b % nouns.length]
  const num = 1000 + (c % 9000)
  return `${w1}-${w2}-${num}`
}

app.get('/api/guests', authMiddleware, async (_req, res) => {
  try {
    const db = await initDb()
    const guests = await db.all(
      'SELECT id, name, token, status, plusOne, comment, alcoholPreferences, rsvpSource FROM guests ORDER BY createdAt ASC',
    )
    res.json(
      guests.map((g) => {
        const token = String((g as { token: string }).token)
        return {
          ...g,
          plusOne: !!g.plusOne,
          alcoholPreferences: parseAlcoholJson(g.alcoholPreferences as string | null),
          rsvpSource: (g as { rsvpSource?: string | null }).rsvpSource ?? null,
          eggPhrase: eggPrizePhraseForToken(token),
        }
      }),
    )
  } catch (e) {
    logger.error('api_guests_list_failed', {
      err: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    })
    res.status(500).json({ error: 'Failed to load guests' })
  }
})

app.post('/api/guests', authMiddleware, async (req, res) => {
  const { name } = req.body as { name?: string }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' })
  }
  try {
    const db = await initDb()
    const token = generateToken()
    const now = new Date().toISOString()
    const result = await db.run(
      'INSERT INTO guests (name, token, status, plusOne, comment, alcoholPreferences, rsvpAt, createdAt, updatedAt, rsvpSource) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      name.trim(),
      token,
      'pending',
      0,
      null,
      null,
      null,
      now,
      now,
      'invite',
    )
    const created = await db.get<{
      id: number
      name: string
      token: string
      status: string
      plusOne: number
      comment: string | null
      alcoholPreferences: string | null
    }>(
      'SELECT id, name, token, status, plusOne, comment, alcoholPreferences FROM guests WHERE id = ?',
      result.lastID,
    )
    if (!created) {
      return res.status(500).json({ error: 'Failed to read created guest' })
    }
    res.status(201).json({
      ...created,
      plusOne: !!created.plusOne,
      alcoholPreferences: parseAlcoholJson(created.alcoholPreferences),
    })
  } catch (e) {
    logger.error('api_guests_create_failed', {
      err: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    })
    res.status(500).json({ error: 'Failed to create guest' })
  }
})

app.delete('/api/guests/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid id' })
  }
  try {
    const db = await initDb()
    const result = await db.run('DELETE FROM guests WHERE id = ?', id)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    res.json({ ok: true })
  } catch (e) {
    logger.error('api_guests_delete_failed', {
      err: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      id,
    })
    res.status(500).json({ error: 'Failed to delete guest' })
  }
})

app.get('/api/egg/prize/:token', async (req, res) => {
  try {
    const db = await initDb()
    const row = await db.get<{ id: number }>('SELECT id FROM guests WHERE token = ?', req.params.token)
    if (!row) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    const phrase = eggPrizePhraseForToken(req.params.token)
    res.json({ phrase })
  } catch (e) {
    logger.error('api_egg_prize_failed', {
      err: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    })
    res.status(500).json({ error: 'Failed to load prize' })
  }
})

app.get('/api/guests/by-token/:token', async (req, res) => {
  try {
    const db = await initDb()
    const guest = await db.get(
      'SELECT id, name, token, status, plusOne, comment, alcoholPreferences, rsvpAt FROM guests WHERE token = ?',
      req.params.token,
    )
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    const rsvpAt = guest.rsvpAt as string | null | undefined
    res.json({
      id: guest.id,
      name: guest.name,
      token: guest.token,
      status: guest.status,
      plusOne: !!(guest.plusOne as number),
      comment: guest.comment as string | null,
      alcoholPreferences: parseAlcoholJson(guest.alcoholPreferences as string | null),
      hasResponded: rsvpAt != null && rsvpAt !== '',
    })
  } catch (e) {
    logger.error('api_guest_by_token_failed', {
      err: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    })
    res.status(500).json({ error: 'Failed to load guest' })
  }
})

/** Публичная анкета с главной страницы (без персональной ссылки). */
app.post('/api/rsvp/open', async (req, res) => {
  const { name, status, plusOne, comment, alcoholPreferences } = req.body as {
    name?: string
    status?: string
    plusOne?: boolean
    comment?: string
    alcoholPreferences?: unknown
  }
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Укажите имя' })
  }
  if (!status || !['accepted', 'declined', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const alcoholJson = normalizeAlcoholPreferences(alcoholPreferences)
  try {
    const db = await initDb()
    const token = generateToken()
    const now = new Date().toISOString()
    const result = await db.run(
      'INSERT INTO guests (name, token, status, plusOne, comment, alcoholPreferences, rsvpAt, createdAt, updatedAt, rsvpSource) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      name.trim(),
      token,
      status,
      plusOne ? 1 : 0,
      comment ?? null,
      alcoholJson,
      now,
      now,
      now,
      'open',
    )
    const created = await db.get<{
      id: number
      name: string
      token: string
      status: string
      plusOne: number
      comment: string | null
      alcoholPreferences: string | null
    }>(
      'SELECT id, name, token, status, plusOne, comment, alcoholPreferences FROM guests WHERE id = ?',
      result.lastID,
    )
    if (!created) {
      return res.status(500).json({ error: 'Failed to read guest' })
    }
    res.status(201).json({
      ok: true,
      token: created.token,
      guest: {
        id: created.id,
        name: created.name,
        token: created.token,
        status: created.status,
        plusOne: !!created.plusOne,
        comment: created.comment,
        alcoholPreferences: parseAlcoholJson(created.alcoholPreferences),
        hasResponded: true,
      },
    })
  } catch (e) {
    logger.error('api_rsvp_open_failed', {
      err: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    })
    res.status(500).json({ error: 'Failed to save RSVP' })
  }
})

app.post('/api/rsvp/:token', async (req, res) => {
  const { status, plusOne, comment, alcoholPreferences } = req.body as {
    status?: string
    plusOne?: boolean
    comment?: string
    alcoholPreferences?: unknown
  }
  if (!status || !['accepted', 'declined', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const alcoholJson = normalizeAlcoholPreferences(alcoholPreferences)
  try {
    const db = await initDb()
    const existing = await db.get('SELECT id FROM guests WHERE token = ?', req.params.token)
    if (!existing) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    const now = new Date().toISOString()
    await db.run(
      'UPDATE guests SET status = ?, plusOne = ?, comment = ?, alcoholPreferences = ?, rsvpAt = ?, updatedAt = ? WHERE token = ?',
      status,
      plusOne ? 1 : 0,
      comment ?? null,
      alcoholJson,
      now,
      now,
      req.params.token,
    )
    res.json({ ok: true })
  } catch (e) {
    logger.error('api_rsvp_save_failed', {
      err: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      tokenSuffix: req.params.token?.slice(-8),
    })
    res.status(500).json({ error: 'Failed to save RSVP' })
  }
})

/** Фронт на Vercel — на Render только API. SPA с этого же процесса: SERVE_SPA=1 и собранный frontend/dist. */
const frontendDist = path.join(__dirname, '../../frontend/dist')
const serveSpa =
  (process.env.SERVE_SPA === '1' || process.env.SERVE_SPA === 'true') &&
  fs.existsSync(frontendDist)
if (serveSpa) {
  app.use(express.static(frontendDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('express_sync_error', {
    err: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    method: req.method,
    path: req.originalUrl,
  })
  if (res.headersSent) {
    next(err)
    return
  }
  res.status(500).json({ error: 'Internal server error' })
})

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('unhandled_rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  })
})

process.on('uncaughtException', (err: Error) => {
  logger.error('uncaught_exception', { message: err.message, stack: err.stack })
  process.exit(1)
})

async function main() {
  await initDb()

  app.listen(PORT, HOST, () => {
    logger.info('server_ready', {
      listen: `${HOST}:${PORT}`,
      port: PORT,
      host: HOST,
      node: process.version,
      env: process.env.NODE_ENV ?? 'development',
      sqlite: path.basename(SQLITE_FILE),
      spa: serveSpa,
    })
  })
}

main().catch((err) => {
  logger.error('server_boot_failed', {
    err: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  })
  process.exit(1)
})
