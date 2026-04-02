import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// DATA_DIR: persistent volume root (e.g. Render disk mounted at /var/data).
const DATA_DIR = process.env.DATA_DIR?.trim()

export function resolveSqliteFile(): string {
  if (process.env.SQLITE_PATH?.trim()) {
    return path.resolve(process.env.SQLITE_PATH)
  }
  if (DATA_DIR) {
    return path.join(path.resolve(DATA_DIR), 'wedding.sqlite')
  }
  return path.join(__dirname, '..', 'wedding.sqlite')
}

export function resolveRsvpUploadRoot(): string {
  if (process.env.RSVP_UPLOAD_DIR?.trim()) {
    return path.resolve(process.env.RSVP_UPLOAD_DIR)
  }
  if (DATA_DIR) {
    return path.join(path.resolve(DATA_DIR), 'rsvp-photos')
  }
  return path.join(__dirname, '..', 'data', 'rsvp-photos')
}
