import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = Number(process.env.PORT) || 4000
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

const sessions = new Map<string, { expiresAt: number }>()

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

app.use(cors())
app.use(express.json())

let dbPromise: ReturnType<typeof open<sqlite3.Database, sqlite3.Statement>>

async function initDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: './wedding.sqlite',
      driver: sqlite3.Database,
    })
    const db = await dbPromise
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
  }
  return dbPromise
}

function generateToken() {
  return crypto.randomBytes(8).toString('hex')
}

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body as { password?: string }
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Неверный пароль' })
    return
  }
  const token = crypto.randomBytes(24).toString('hex')
  sessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS })
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
    const db = await initDb()
    const guests = await db.all(
      'SELECT id, name, token, status, plusOne, comment FROM guests ORDER BY createdAt ASC',
    )
    res.json(
      guests.map((g) => ({
        ...g,
        plusOne: !!g.plusOne,
      })),
    )
  } catch (e) {
    console.error(e)
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
      'INSERT INTO guests (name, token, status, plusOne, comment, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      name.trim(),
      token,
      'pending',
      0,
      null,
      now,
      now,
    )
    const created = await db.get(
      'SELECT id, name, token, status, plusOne, comment FROM guests WHERE id = ?',
      result.lastID,
    )
    res.status(201).json({
      ...created,
      plusOne: !!created.plusOne,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to create guest' })
  }
})

app.get('/api/guests/by-token/:token', async (req, res) => {
  try {
    const db = await initDb()
    const guest = await db.get(
      'SELECT id, name, token FROM guests WHERE token = ?',
      req.params.token,
    )
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    res.json(guest)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to load guest' })
  }
})

app.post('/api/rsvp/:token', async (req, res) => {
  const { status, plusOne, comment } = req.body as {
    status?: string
    plusOne?: boolean
    comment?: string
  }
  if (!status || !['accepted', 'declined', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  try {
    const db = await initDb()
    const existing = await db.get(
      'SELECT id FROM guests WHERE token = ?',
      req.params.token,
    )
    if (!existing) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    const now = new Date().toISOString()
    await db.run(
      'UPDATE guests SET status = ?, plusOne = ?, comment = ?, updatedAt = ? WHERE token = ?',
      status,
      plusOne ? 1 : 0,
      comment ?? null,
      now,
      req.params.token,
    )
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to save RSVP' })
  }
})

const isProd = process.env.NODE_ENV === 'production'
const frontendDist = path.join(__dirname, '../../frontend/dist')
if (isProd && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.listen(PORT, HOST, () => {
  const hostLabel = HOST === '0.0.0.0' ? '0.0.0.0' : HOST
  console.log(`Backend http://${hostLabel}:${PORT}`)
})

