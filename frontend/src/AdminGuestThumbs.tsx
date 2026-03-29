import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from './apiUrl'

const LABEL: Record<'self' | 'plusOne' | 'together', string> = {
  self: 'Вы',
  plusOne: 'Спутник',
  together: 'Вместе',
}

const FILE_TAG: Record<'self' | 'plusOne' | 'together', string> = {
  self: 'ya',
  plusOne: 'sputnik',
  together: 'vmeste',
}

function safeFileBase(name: string): string {
  const t = name.trim().replace(/[^\w\u0400-\u04FF\-]+/gu, '_').replace(/_+/g, '_')
  return t.slice(0, 48) || 'gost'
}

function extFromBlob(blob: Blob): string {
  const t = blob.type.toLowerCase()
  if (t.includes('png')) return 'png'
  if (t.includes('webp')) return 'webp'
  if (t.includes('gif')) return 'gif'
  if (t.includes('heic') || t.includes('heif')) return 'heic'
  if (t.includes('jpeg') || t.includes('jpg')) return 'jpg'
  return 'jpg'
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function fetchPhotoBlob(
  authHeader: string,
  inviteToken: string,
  kind: 'self' | 'plusOne' | 'together',
): Promise<Blob> {
  const r = await fetch(
    apiUrl(`/api/admin/guest-photo/${encodeURIComponent(inviteToken)}/${kind}`),
    { headers: { Authorization: authHeader } },
  )
  if (!r.ok) throw new Error('photo fetch failed')
  return r.blob()
}

function AdminGuestPhotoBlob({
  authHeader,
  inviteToken,
  kind,
}: {
  authHeader: string
  inviteToken: string
  kind: 'self' | 'plusOne' | 'together'
}) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let blobUrl: string | null = null
    let cancelled = false
    ;(async () => {
      try {
        const b = await fetchPhotoBlob(authHeader, inviteToken, kind)
        if (cancelled) return
        blobUrl = URL.createObjectURL(b)
        setSrc(blobUrl)
      } catch {
        /* */
      }
    })()
    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [authHeader, inviteToken, kind])

  if (!src) return <span className="inline-block h-11 w-11 animate-pulse rounded-lg bg-sand/60" />

  return (
    <img
      src={src}
      alt=""
      title={LABEL[kind]}
      className="h-11 w-11 rounded-lg object-cover ring-1 ring-ink/10"
    />
  )
}

export function AdminGuestThumbs(props: {
  authHeader: string
  inviteToken: string
  guestName: string
  photos: { self: boolean; plusOne: boolean; together: boolean }
}) {
  const { authHeader, inviteToken, guestName, photos } = props
  const base = safeFileBase(guestName)
  const [downloading, setDownloading] = useState(false)

  const kinds: ('self' | 'plusOne' | 'together')[] = []
  if (photos.self) kinds.push('self')
  if (photos.plusOne) kinds.push('plusOne')
  if (photos.together) kinds.push('together')

  const downloadOne = useCallback(
    async (kind: 'self' | 'plusOne' | 'together') => {
      const blob = await fetchPhotoBlob(authHeader, inviteToken, kind)
      const name = `${base}-${FILE_TAG[kind]}.${extFromBlob(blob)}`
      triggerDownload(blob, name)
    },
    [authHeader, inviteToken, base],
  )

  const downloadAll = async () => {
    if (kinds.length < 2) return
    setDownloading(true)
    try {
      for (let i = 0; i < kinds.length; i++) {
        const k = kinds[i]
        await downloadOne(k)
        if (i < kinds.length - 1) {
          await new Promise((r) => setTimeout(r, 280))
        }
      }
    } catch {
      /* браузер мог заблокировать несколько скачиваний */
    } finally {
      setDownloading(false)
    }
  }

  if (kinds.length === 0) {
    return <span className="text-ink/35">—</span>
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
      <div className="flex flex-wrap items-end gap-2">
        {kinds.map((kind) => (
          <div key={kind} className="flex flex-col items-center gap-0.5">
            <AdminGuestPhotoBlob authHeader={authHeader} inviteToken={inviteToken} kind={kind} />
            <button
              type="button"
              title={`Сохранить: ${LABEL[kind]}`}
              onClick={() => downloadOne(kind)}
              className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-sage underline decoration-sage/40 underline-offset-2 transition hover:text-moss hover:decoration-moss"
            >
              сохранить
            </button>
          </div>
        ))}
      </div>
      {kinds.length > 1 ? (
        <button
          type="button"
          disabled={downloading}
          onClick={() => void downloadAll()}
          className="w-max rounded-lg border border-sage/40 bg-white/90 px-2.5 py-1.5 text-[10px] font-semibold text-moss transition hover:bg-sage/15 disabled:opacity-50 sm:self-center"
        >
          {downloading ? '…' : 'Скачать все'}
        </button>
      ) : null}
    </div>
  )
}
