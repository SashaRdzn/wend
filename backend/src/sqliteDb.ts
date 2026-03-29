import fs from 'fs'
import path from 'path'
import { DatabaseSync } from 'node:sqlite'

export type SqliteAsync = {
  exec: (sql: string) => Promise<void>
  all: <T>(sql: string, ...params: unknown[]) => Promise<T[]>
  get: <T>(sql: string, ...params: unknown[]) => Promise<T | undefined>
  run: (sql: string, ...params: unknown[]) => Promise<{ lastID: number; changes: number }>
}

let raw: DatabaseSync | null = null

function wrap(db: DatabaseSync): SqliteAsync {
  return {
    exec: async (sql) => {
      db.exec(sql)
    },
    all: async <T>(sql: string, ...params: unknown[]) => {
      const stmt = db.prepare(sql)
      return stmt.all(...params) as T[]
    },
    get: async <T>(sql: string, ...params: unknown[]) => {
      const stmt = db.prepare(sql)
      return stmt.get(...params) as T | undefined
    },
    run: async (sql: string, ...params: unknown[]) => {
      const stmt = db.prepare(sql)
      const r = stmt.run(...params)
      return {
        lastID: Number(r.lastInsertRowid),
        changes: Number(r.changes),
      }
    },
  }
}

export function openSqliteDatabase(filePath: string): SqliteAsync {
  if (raw) {
    return wrap(raw)
  }
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  raw = new DatabaseSync(filePath)
  return wrap(raw)
}
