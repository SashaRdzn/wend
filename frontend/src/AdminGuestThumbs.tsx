import { useEffect, useState } from 'react'
import { apiUrl } from './apiUrl'

const LABEL: Record<'self' | 'plusOne' | 'together', string> = {
  self: 'Вы',
  plusOne: 'Спутник',
  together: 'Вместе',
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
      const r = await fetch(
        apiUrl(`/api/admin/guest-photo/${encodeURIComponent(inviteToken)}/${kind}`),
        { headers: { Authorization: authHeader } },
      )
      if (!r.ok || cancelled) return
      const b = await r.blob()
      blobUrl = URL.createObjectURL(b)
      if (!cancelled) setSrc(blobUrl)
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
  photos: { self: boolean; plusOne: boolean; together: boolean }
}) {
  const { authHeader, inviteToken, photos } = props
  if (!photos.self && !photos.plusOne && !photos.together) {
    return <span className="text-ink/35">—</span>
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {photos.self ? (
        <AdminGuestPhotoBlob authHeader={authHeader} inviteToken={inviteToken} kind="self" />
      ) : null}
      {photos.plusOne ? (
        <AdminGuestPhotoBlob authHeader={authHeader} inviteToken={inviteToken} kind="plusOne" />
      ) : null}
      {photos.together ? (
        <AdminGuestPhotoBlob authHeader={authHeader} inviteToken={inviteToken} kind="together" />
      ) : null}
    </div>
  )
}
