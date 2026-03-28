import dns from 'node:dns'
import { MongoClient, type Collection, type Db } from 'mongodb'

/** Atlas + Node на части хостингов (Render и др.) ломают TLS при приоритете IPv6 — см. MongoDB-7556. */
dns.setDefaultResultOrder('ipv4first')

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

export async function connectMongo(uri: string): Promise<Db> {
  if (db) return db
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 25_000,
  })
  await client.connect()
  const name = process.env.MONGODB_DB_NAME || 'wend'
  db = client.db(name)

  const guests = db.collection<GuestDoc>('guests')
  await guests.createIndex({ id: 1 }, { unique: true })
  await guests.createIndex({ token: 1 }, { unique: true })

  return db
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
