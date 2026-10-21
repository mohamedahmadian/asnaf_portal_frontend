import { Camera, FolderOpen, ImagePlus, Trash2 } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from './Form'
import { LoadingSpinner } from './LoadingState'

const defaultMaxBytes = 8 * 1024 * 1024

function fileMatchesAccept(file: File, accept: string) {
  const tokens = accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  if (!tokens.length) return true
  const mime = (file.type || '').toLowerCase()
  const name = file.name.toLowerCase()
  const ext = name.includes('.') ? `.${name.split('.').pop()}` : ''
  return tokens.some((token) => {
    if (token.endsWith('/*')) return mime.startsWith(token.slice(0, -1))
    if (token.startsWith('.')) return ext === token
    return mime === token
  })
}

export function FileDropField({
  id,
  accept = 'image/*',
  capture = 'user',
  allowCamera,
  previewUrl,
  uploading,
  previewClassName = 'mx-auto mb-4 h-28 w-28 rounded-2xl object-cover',
  maxBytes = defaultMaxBytes,
  hideLocalPreview,
  onFile,
  onClear,
}: {
  id?: string
  accept?: string
  capture?: 'user' | 'environment'
  allowCamera?: boolean
  previewUrl?: string
  uploading?: boolean
  previewClassName?: string
  maxBytes?: number
  hideLocalPreview?: boolean
  onFile: (file: File) => void
  onClear?: () => void
}) {
  const { t } = useTranslation()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const cameraId = `${inputId}-camera`
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const dragCount = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [localPreview, setLocalPreview] = useState<string>()
  const [selectedName, setSelectedName] = useState<string>()
  const cameraEnabled = allowCamera ?? accept.includes('image')

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  function takeFile(file: File | undefined) {
    if (!file) return
    if (file.size > maxBytes) {
      toast.error(t('common.fileTooLarge'))
      return
    }
    if (!fileMatchesAccept(file, accept)) {
      toast.error(t('common.fileInvalidType'))
      return
    }
    if (!hideLocalPreview && file.type.startsWith('image/')) {
      if (localPreview) URL.revokeObjectURL(localPreview)
      setLocalPreview(URL.createObjectURL(file))
    } else if (localPreview) {
      URL.revokeObjectURL(localPreview)
      setLocalPreview(undefined)
    }
    setSelectedName(file.name)
    onFile(file)
  }

  function fromInput(event: ChangeEvent<HTMLInputElement>) {
    takeFile(event.target.files?.[0])
    event.target.value = ''
  }

  function onDragEnter(event: DragEvent) {
    event.preventDefault()
    dragCount.current += 1
    setDragging(true)
  }

  function onDragLeave(event: DragEvent) {
    event.preventDefault()
    dragCount.current -= 1
    if (dragCount.current <= 0) {
      dragCount.current = 0
      setDragging(false)
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    dragCount.current = 0
    setDragging(false)
    takeFile(event.dataTransfer.files?.[0])
  }

  const preview = hideLocalPreview ? previewUrl : localPreview || previewUrl
  const hasFile = Boolean(preview || selectedName)

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${
        dragging
          ? 'border-teal-500 bg-teal-50'
          : 'border-line bg-cream-50'
      }`}
    >
      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={fromInput}
      />
      {cameraEnabled ? (
        <input
          ref={cameraRef}
          id={cameraId}
          type="file"
          accept="image/*"
          capture={capture}
          className="sr-only lg:hidden"
          onChange={fromInput}
        />
      ) : null}

      {preview ? (
        <img
          src={preview}
          alt=""
          className={previewClassName}
        />
      ) : (
        <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm">
          <ImagePlus className="size-6" aria-hidden />
        </span>
      )}

      {selectedName && !preview ? (
        <p className="mb-2 text-sm font-medium text-ink-800">{selectedName}</p>
      ) : null}

      <p className="text-sm text-ink-700">{t('common.dropFileHint')}</p>
      <p className="mt-1 text-xs text-ink-400">{t('common.orSelect')}</p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <FolderOpen className="size-4" aria-hidden />
          {t('common.selectFile')}
        </Button>
        {cameraEnabled ? (
          <Button
            type="button"
            variant="ghost"
            className="lg:hidden"
            disabled={uploading}
            onClick={() => cameraRef.current?.click()}
          >
            <Camera className="size-4" aria-hidden />
            {t('common.takePhoto')}
          </Button>
        ) : null}
        {hasFile && onClear ? (
          <Button
            type="button"
            variant="ghost"
            disabled={uploading}
            onClick={() => {
              if (localPreview) URL.revokeObjectURL(localPreview)
              setLocalPreview(undefined)
              setSelectedName(undefined)
              onClear()
            }}
          >
            <Trash2 className="size-4" aria-hidden />
            {t('common.removeFile')}
          </Button>
        ) : null}
      </div>

      {uploading ? (
        <div className="mt-3 flex flex-col items-center gap-2">
          <LoadingSpinner size="sm" />
          <p className="mt-1 text-xs text-teal-700">{t('common.uploading')}</p>
        </div>
      ) : null}
    </div>
  )
}
