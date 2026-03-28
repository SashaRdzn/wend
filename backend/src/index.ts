import express from 'express'
import cors, { type CorsOptions } from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { logger } from './logger'
import { requestLogMiddleware } from './httpLog'
import { config as loadEnv } from 'dotenv'
import { connectMongo, getGuestsCollection, getNextGuestId } from './mongoDb'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.join(__dirname, '../.env') })

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

app.get('/api/guests', authMiddleware, async (_req, res) => {
  try {
    const col = getGuestsCollection()
    const guests = await col.find({}).sort({ id: 1 }).toArray()
    res.json(
      guests.map((g) => ({
        id: g.id,
        name: g.name,
        token: g.token,
        status: g.status,
        plusOne: !!g.plusOne,
        comment: g.comment,
        alcoholPreferences: parseAlcoholJson(g.alcoholPreferences),
      })),
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
    const col = getGuestsCollection()
    const id = await getNextGuestId()
    const token = generateToken()
    const now = new Date().toISOString()
    const doc = {
      id,
      name: name.trim(),
      token,
      status: 'pending',
      plusOne: 0,
      comment: null as string | null,
      alcoholPreferences: null as string | null,
      rsvpAt: null as string | null,
      createdAt: now,
      updatedAt: now,
    }
    await col.insertOne(doc)
    res.status(201).json({
      id: doc.id,
      name: doc.name,
      token: doc.token,
      status: doc.status,
      plusOne: false,
      comment: doc.comment,
      alcoholPreferences: parseAlcoholJson(doc.alcoholPreferences),
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
    const col = getGuestsCollection()
    const result = await col.deleteOne({ id })
    if (result.deletedCount === 0) {
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

app.get('/api/guests/by-token/:token', async (req, res) => {
  try {
    const col = getGuestsCollection()
    const guest = await col.findOne({ token: req.params.token })
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    const rsvpAt = guest.rsvpAt
    res.json({
      id: guest.id,
      name: guest.name,
      token: guest.token,
      status: guest.status,
      plusOne: !!guest.plusOne,
      comment: guest.comment,
      alcoholPreferences: parseAlcoholJson(guest.alcoholPreferences),
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
    const col = getGuestsCollection()
    const existing = await col.findOne({ token: req.params.token }, { projection: { _id: 1 } })
    if (!existing) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    const now = new Date().toISOString()
    const result = await col.updateOne(
      { token: req.params.token },
      {
        $set: {
          status,
          plusOne: plusOne ? 1 : 0,
          comment: comment ?? null,
          alcoholPreferences: alcoholJson,
          rsvpAt: now,
          updatedAt: now,
        },
      },
    )
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Guest not found' })
    }
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
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    logger.error('missing_env', { key: 'MONGODB_URI' })
    process.exit(1)
  }
  await connectMongo(uri)

  app.listen(PORT, HOST, () => {
    logger.info('server_ready', {
      listen: `${HOST}:${PORT}`,
      port: PORT,
      host: HOST,
      node: process.version,
      env: process.env.NODE_ENV ?? 'development',
      db: process.env.MONGODB_DB_NAME || 'wend',
      mongo: true,
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
