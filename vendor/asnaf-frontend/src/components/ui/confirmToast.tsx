import { Check, CircleAlert, CircleCheck, StickyNote, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button, FormField, fieldClassName } from './Form'

export function confirmToast({
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  confirmVariant = 'primary',
  prompt,
}: {
  title: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: (value?: string) => void | Promise<void>
  /** `primary` (فیروزه‌ای) برای بله/تأیید؛ فقط حذف و انصراف/رد مخرب `danger` */
  confirmVariant?: 'primary' | 'danger'
  prompt?: {
    label: string
    placeholder?: string
    hint?: string
    required?: boolean
    minLength?: number
    requiredMessage?: string
  }
}) {
  const isDanger = confirmVariant === 'danger'
  toast.custom(
    (id) => (
      <ConfirmToastCard
        id={id}
        title={title}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        confirmVariant={confirmVariant}
        isDanger={isDanger}
        prompt={prompt}
        onConfirm={onConfirm}
      />
    ),
    { duration: Infinity, closeButton: false, unstyled: true },
  )
}

function ConfirmToastCard({
  id,
  title,
  confirmLabel,
  cancelLabel,
  confirmVariant,
  isDanger,
  prompt,
  onConfirm,
}: {
  id: string | number
  title: string
  confirmLabel: string
  cancelLabel: string
  confirmVariant: 'primary' | 'danger'
  isDanger: boolean
  prompt?: {
    label: string
    placeholder?: string
    hint?: string
    required?: boolean
    minLength?: number
    requiredMessage?: string
  }
  onConfirm: (value?: string) => void | Promise<void>
}) {
  const [value, setValue] = useState('')
  const inputId = `confirm-toast-${id}`

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.repeat || event.isComposing) return
      event.preventDefault()
      toast.dismiss(id)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [id])

  function submit() {
    const trimmed = value.trim()
    const minLength = prompt?.minLength ?? 1
    if (prompt?.required && trimmed.length < minLength) {
      toast.error(prompt.requiredMessage ?? prompt.label)
      return
    }
    toast.dismiss(id)
    void onConfirm(prompt ? trimmed : undefined)
  }

  return (
    <div
      data-confirm-toast=""
      className="w-max max-w-[calc(100vw-2rem)] overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_14px_36px_rgba(44,42,38,0.12)]"
    >
      <div
        className={`h-1 ${
          isDanger
            ? 'bg-[linear-gradient(to_inline-end,#fb7185,#e11d48)]'
            : 'bg-[linear-gradient(to_inline-end,var(--color-teal-500),var(--color-mint-500))]'
        }`}
      />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-[15px] text-white ${
              isDanger
                ? 'bg-[linear-gradient(160deg,#fb7185,#e11d48)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_16px_rgba(225,29,72,0.22)]'
                : 'bg-[linear-gradient(160deg,var(--color-teal-500),var(--color-mint-500))] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_16px_rgba(46,189,182,0.28)]'
            }`}
          >
            {isDanger ? (
              <CircleAlert className="size-[22px]" strokeWidth={2.35} aria-hidden />
            ) : (
              <CircleCheck className="size-[22px]" strokeWidth={2.35} aria-hidden />
            )}
          </div>
          <p className="pt-2 text-[15px] font-medium leading-7 text-ink-900">{title}</p>
        </div>
        {prompt ? (
          <div className="mt-3">
            <FormField icon={StickyNote} label={prompt.label} htmlFor={inputId}>
              <textarea
                id={inputId}
                className={fieldClassName}
                rows={2}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={prompt.placeholder}
              />
            </FormField>
            {prompt.hint ? <p className="mt-1.5 text-xs text-ink-500">{prompt.hint}</p> : null}
          </div>
        ) : null}
        <div className="mt-4 flex w-full flex-row items-center justify-between gap-2" dir="ltr">
          <Button type="button" variant={confirmVariant} onClick={submit}>
            <Check className="size-3.5" aria-hidden />
            {confirmLabel}
          </Button>
          <Button type="button" variant="ghost" onClick={() => toast.dismiss(id)}>
            <X className="size-3.5" aria-hidden />
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
