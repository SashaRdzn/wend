export type RsvpPhotosFormState = {
  self: File | null
  plusOne: File | null
  together: File | null
}

export type RsvpSavedPhotos = {
  self: boolean
  plusOne: boolean
  together: boolean
}

export function emptyRsvpPhotos(): RsvpPhotosFormState {
  return { self: null, plusOne: null, together: null }
}

type RsvpPhotoFieldsProps = {
  status: 'accepted' | 'declined' | 'pending'
  plusOne: boolean
  saved: RsvpSavedPhotos
  value: RsvpPhotosFormState
  onChange: (next: RsvpPhotosFormState) => void
}

function PhotoRow({
  id,
  label,
  hint,
  file,
  onPick,
  hadSaved,
}: {
  id: string
  label: string
  hint?: string
  file: File | null
  onPick: (f: File | null) => void
  hadSaved: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-ink/50">
        {label}
      </label>
      {hint ? <p className="mb-1 text-[10px] text-ink/45 sm:text-[11px]">{hint}</p> : null}
      {hadSaved && !file ? (
        <p className="mb-1.5 text-[11px] text-emerald-800/85">
          Фото уже есть — выберите файл ниже, чтобы заменить.
        </p>
      ) : null}
      <input
        id={id}
        name={id}
        type="file"
        accept="image/*"
        className="block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border file:border-ink/12 file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-moss"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <p className="mt-1 truncate text-[11px] text-ink/55" title={file.name}>
          {file.name}
        </p>
      ) : null}
    </div>
  )
}

export function RsvpPhotoFields({ status, plusOne, saved, value, onChange }: RsvpPhotoFieldsProps) {
  if (status === 'declined') return null

  const set = (key: keyof RsvpPhotosFormState, f: File | null) => onChange({ ...value, [key]: f })

  return (
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-cream/50 p-3 sm:p-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50">Фото для подготовки к празднику</p>
        <p className="mt-1 text-[10px] leading-relaxed text-ink/45 sm:text-[11px]">
          {plusOne
            ? 'Три снимка: вы, ваш спутник и вы вместе (совместное фото).'
            : 'Один снимок — портрет гостя.'}
        </p>
      </div>

      {!plusOne ? (
        <PhotoRow
          id="rsvp-photo-self"
          label="Ваше фото"
          file={value.self}
          onPick={(f) => set('self', f)}
          hadSaved={saved.self}
        />
      ) : (
        <>
          <PhotoRow
            id="rsvp-photo-self"
            label="Ваше фото"
            hint="Портрет присутствующего (как на приглашении)."
            file={value.self}
            onPick={(f) => set('self', f)}
            hadSaved={saved.self}
          />
          <PhotoRow
            id="rsvp-photo-plus"
            label="Фото спутника"
            file={value.plusOne}
            onPick={(f) => set('plusOne', f)}
            hadSaved={saved.plusOne}
          />
          <PhotoRow
            id="rsvp-photo-together"
            label="Совместное фото"
            hint="Вы вместе на одном кадре."
            file={value.together}
            onPick={(f) => set('together', f)}
            hadSaved={saved.together}
          />
        </>
      )}
    </div>
  )
}

export function appendRsvpFiles(
  fd: FormData,
  status: string,
  plusOne: boolean,
  photos: RsvpPhotosFormState,
) {
  if (status === 'declined') return
  if (photos.self) fd.append('photoSelf', photos.self)
  if (plusOne) {
    if (photos.plusOne) fd.append('photoPlusOne', photos.plusOne)
    if (photos.together) fd.append('photoTogether', photos.together)
  }
}

export function validateRsvpPhotos(
  status: 'accepted' | 'declined' | 'pending',
  plusOne: boolean,
  photos: RsvpPhotosFormState,
  saved: RsvpSavedPhotos,
): string | null {
  if (status === 'declined') return null
  const ok = (slot: keyof RsvpPhotosFormState) =>
    Boolean(photos[slot]) || (slot === 'self' ? saved.self : slot === 'plusOne' ? saved.plusOne : saved.together)
  if (!plusOne) {
    if (!ok('self')) return 'Загрузите одно фото'
    return null
  }
  if (!ok('self') || !ok('plusOne') || !ok('together')) {
    return 'Загрузите три фото: вы, спутник и совместное'
  }
  return null
}
