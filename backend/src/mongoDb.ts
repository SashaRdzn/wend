import dns from 'node:dns'
import { MongoClient, type Collection, type Db } from 'mongodb'

/** Atlas + Node на части хостингов (Render и др.) ломают TLS при приоритете IPv6 — см. MongoDB-7556. */
dns.setDefaultResultOrder('ipv4first')

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/** Нестабильный TLS к Atlas при холодном старте на Render — несколько попыток с бэкоффом. */
const CONNECT_RETRIES = 8
const CONNECT_BACKOFF_MS = 700

export type GuestDoc = {
  id: number
  name: string
  token: string
  status: string
  plusOne: number
  comment: string | null
  alcoholPreferences: string | null
  rsvpAt: string | null
  createdAt: string
  updatedAt: string
}

let client: MongoClient | null = null
let db: Db | null = null

function mongoClientOptions() {
  return {
    serverSelectionTimeoutMS: 35_000,
    connectTimeoutMS: 25_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
    retryWrites: true,
    /** Без family/serverApi: иначе с mongodb+srv на части хостингов ловят TLS alert 80. */
  }
}

export async function connectMongo(uri: string): Promise<Db> {
  if (db) return db

  let lastErr: unknown
  for (let attempt = 1; attempt <= CONNECT_RETRIES; attempt++) {
    try {
      if (client) {
        await client.close().catch(() => {})
        client = null
      }
      client = new MongoClient(uri, mongoClientOptions())
      await client.connect()
      const name = process.env.MONGODB_DB_NAME || 'wend'
      db = client.db(name)

      const guests = db.collection<GuestDoc>('guests')
      await guests.createIndex({ id: 1 }, { unique: true })
      await guests.createIndex({ token: 1 }, { unique: true })

      return db
    } catch (e) {
      lastErr = e
      db = null
      if (client) {
        await client.close().catch(() => {})
        client = null
      }
      if (attempt < CONNECT_RETRIES) {
        const wait = Math.min(CONNECT_BACKOFF_MS * 2 ** (attempt - 1), 12_000)
        console.warn(
          `[mongo] connect attempt ${attempt}/${CONNECT_RETRIES} failed, retry in ${wait}ms:`,
          e instanceof Error ? e.message : e,
        )
        await sleep(wait)
      }
    }
  }

  throw lastErr
}

export async function getNextGuestId(): Promise<number> {
  if (!db) throw new Error('MongoDB not connected')
  const counters = db.collection<{ _id: string; seq: number }>('counters')
  const updated = await counters.findOneAndUpdate(
    { _id: 'guests' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  )
  if (!updated || typeof updated.seq !== 'number') {
    throw new Error('Failed to allocate guest id')
  }
  return updated.seq
}

export function getGuestsCollection(): Collection<GuestDoc> {
  if (!db) throw new Error('MongoDB not connected')
  return db.collection<GuestDoc>('guests')
}

export async function closeMongo(): Promise<void> {
  await client?.close()
  client = null
  db = null
}
