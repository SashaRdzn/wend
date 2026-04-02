import fs from 'fs/promises'
import path from 'path'
import type { Express } from 'express'
import { resolveRsvpUploadRoot } from './persistPaths'

export type RsvpPhotoSlot = 'self' | 'plusOne' | 'together'

export function rsvpPhotoUploadRoot(): string {
  return resolveRsvpUploadRoot()
}

export function extFromMime(mime: string): string {
  const m = mime.toLowerCase()
  if (m === 'image/jpeg' || m === 'image/jpg') return '.jpg'
  if (m === 'image/png') return '.png'
  if (m === 'image/webp') return '.webp'
  if (m === 'image/gif') return '.gif'
  if (m === 'image/heic' || m === 'image/heif') return '.heic'
  return '.img'
}

export function guestPhotoDir(token: string): string {
  return path.join(rsvpPhotoUploadRoot(), token)
}

export function absolutePhotoPath(token: string, filename: string): string {
  return path.join(guestPhotoDir(token), filename)
}

export async function writeRsvpPhoto(
  token: string,
  slot: RsvpPhotoSlot,
  file: Express.Multer.File,
): Promise<string> {
  const dir = guestPhotoDir(token)
  await fs.mkdir(dir, { recursive: true })
  const ext = extFromMime(file.mimetype)
  const name = `${slot}${ext}`
  await fs.writeFile(path.join(dir, name), file.buffer)
  return name
}

export async function removeGuestPhotoDir(token: string): Promise<void> {
  try {
    await fs.rm(guestPhotoDir(token), { recursive: true, force: true })
  } catch {
  }
}

export async function unlinkIfExists(absPath: string): Promise<void> {
  try {
    await fs.unlink(absPath)
  } catch {
  }
}

export async function removeSlotFile(
  token: string,
  storedName: string | null | undefined,
): Promise<void> {
  if (!storedName) return
  await unlinkIfExists(absolutePhotoPath(token, storedName))
}

export type RsvpPhotoCols = {
  self: string | null
  plusOne: string | null
  together: string | null
}

export type RsvpPhotoFileMap = {
  self?: Express.Multer.File
  plusOne?: Express.Multer.File
  together?: Express.Multer.File
}

export async function resolveRsvpPhotoColumns(
  token: string,
  status: string,
  plusOne: boolean,
  files: RsvpPhotoFileMap,
  existing: RsvpPhotoCols,
): Promise<{ ok: true; cols: RsvpPhotoCols } | { ok: false; message: string }> {
  if (status === 'declined') {
    await removeGuestPhotoDir(token)
    return { ok: true, cols: { self: null, plusOne: null, together: null } }
  }

  if (!plusOne) {
    await removeSlotFile(token, existing.plusOne)
    await removeSlotFile(token, existing.together)
    let next: RsvpPhotoCols = {
      self: existing.self,
      plusOne: null,
      together: null,
    }
    const selfFile = files.self
    if (selfFile) {
      if (next.self) await removeSlotFile(token, next.self)
      next.self = await writeRsvpPhoto(token, 'self', selfFile)
    } else if (!next.self) {
      return { ok: false, message: 'Загрузите одно фото' }
    }
    return { ok: true, cols: next }
  }

  let next: RsvpPhotoCols = {
    self: existing.self,
    plusOne: existing.plusOne,
    together: existing.together,
  }
  for (const slot of ['self', 'plusOne', 'together'] as const) {
    const f = files[slot]
    if (f) {
      const oldName = next[slot]
      if (oldName) await removeSlotFile(token, oldName)
      next[slot] = await writeRsvpPhoto(token, slot, f)
    }
  }
  if (!next.self || !next.plusOne || !next.together) {
    return {
      ok: false,
      message: 'Нужны три фото: вы, спутник и совместное',
    }
  }
  return { ok: true, cols: next }
}
