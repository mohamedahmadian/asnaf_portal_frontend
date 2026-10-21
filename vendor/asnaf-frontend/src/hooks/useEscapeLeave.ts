import { useEffect, useRef } from 'react'

const cancelFns = new Set<() => void>()
const backFns = new Set<() => void>()
let attached = false
let pinned = 0

function lastOf<T>(set: Set<T>): T | undefined {
  let value: T | undefined
  for (const item of set) value = item
  return value
}

function isEscapeBlocked() {
  return Boolean(
    document.querySelector(
      [
        '[aria-modal="true"]',
        '[role="listbox"]',
        '[role="menu"]',
        '[data-nested-dialog]',
        '[data-confirm-toast]',
        '.rmdp-wrapper',
        '[data-enter-ignore][aria-expanded="true"]',
      ].join(','),
    ),
  )
}

function enabledCancelButtons() {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-form-cancel]')].filter((button) => {
    if (button.disabled) return false
    return button.getClientRects().length > 0
  })
}

function cancelOwner(button: HTMLButtonElement) {
  if (button.dataset.formCancel) return button.dataset.formCancel
  return button.closest('form')?.id ?? button
}

function pickCancelButton(buttons: HTMLButtonElement[]) {
  const active = document.activeElement
  const form = active instanceof Element ? active.closest('form') : null
  if (form) {
    const inForm = buttons.find((button) => form.contains(button) || button.dataset.formCancel === form.id)
    if (inForm) return inForm
  }
  const owners = new Set(buttons.map(cancelOwner))
  if (owners.size === 1) return buttons[0]
  return null
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.repeat || event.isComposing) return
  if (event.defaultPrevented) return
  if (isEscapeBlocked()) return
  const buttons = enabledCancelButtons()
  if (buttons.length) {
    const button = pickCancelButton(buttons)
    if (!button) return
    event.preventDefault()
    button.click()
    return
  }
  const cancel = lastOf(cancelFns)
  if (cancel) {
    event.preventDefault()
    cancel()
    return
  }
  const back = lastOf(backFns)
  if (back) {
    event.preventDefault()
    back()
  }
}

function attach() {
  if (attached) return
  attached = true
  document.addEventListener('keydown', onKeyDown)
}

function detachIfIdle() {
  if (pinned || cancelFns.size || backFns.size) return
  document.removeEventListener('keydown', onKeyDown)
  attached = false
}

/** شنوندهٔ سراسری Escape تا انصراف فرم حتی بدون ثبت جداگانه هم کار کند */
export function useFormEscapeListener() {
  useEffect(() => {
    pinned += 1
    attach()
    return () => {
      pinned -= 1
      detachIfIdle()
    }
  }, [])
}

function useEscapeAction(bucket: Set<() => void>, enabled: boolean, fn?: () => void) {
  const fnRef = useRef(fn)
  fnRef.current = fn
  useEffect(() => {
    if (!enabled) return
    const run = () => fnRef.current?.()
    attach()
    bucket.add(run)
    return () => {
      bucket.delete(run)
      detachIfIdle()
    }
  }, [bucket, enabled])
}

const DOUBLE_SAVE_MS = 500

function isSaveShortcutKey(key: string) {
  return key === 's' || key === 'S' || key === 'س'
}

function sameSaveKey(previous: string, next: string) {
  if (previous === 'س' || next === 'س') return previous === next
  return previous.toLowerCase() === next.toLowerCase()
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const field = target.closest('input, textarea, [contenteditable="true"]')
  if (!field) return false
  if (field instanceof HTMLInputElement) {
    const type = field.type
    if (
      type === 'button' ||
      type === 'submit' ||
      type === 'checkbox' ||
      type === 'radio' ||
      type === 'file' ||
      type === 'reset' ||
      type === 'range' ||
      type === 'color'
    ) {
      return false
    }
  }
  return true
}

function clickFormSave(formId: string) {
  const form = document.getElementById(formId)
  if (!(form instanceof HTMLFormElement)) return
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]:not([disabled])')
  if (!button) return
  button.click()
}

/** دو بار «س» یا s همان ذخیره را می‌زند؛ داخل فیلد تایپی و پنجرهٔ باز اجرا نمی‌شود */
export function useDoubleSaveShortcut(enabled: boolean, onSave: () => void) {
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  useEffect(() => {
    if (!enabled) return
    let lastKey = ''
    let lastAt = 0
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing || event.defaultPrevented) return
      if (event.ctrlKey || event.altKey || event.metaKey) return
      if (!isSaveShortcutKey(event.key)) {
        lastKey = ''
        lastAt = 0
        return
      }
      if (isEscapeBlocked() || isTypingTarget(event.target)) {
        lastKey = ''
        lastAt = 0
        return
      }
      const now = Date.now()
      const doubled = lastKey !== '' && sameSaveKey(lastKey, event.key) && now - lastAt <= DOUBLE_SAVE_MS
      lastKey = ''
      lastAt = 0
      if (!doubled) {
        lastKey = event.key
        lastAt = now
        return
      }
      event.preventDefault()
      onSaveRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [enabled])
}

/** روی صفحهٔ ویرایش: دو بار «س» یا s دکمهٔ ذخیره را می‌زند */
export function useEditFormDoubleSave(enabled: boolean, formId?: string | null) {
  useEffect(() => {
    if (!enabled || !formId) return
    let lastKey = ''
    let lastAt = 0
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing || event.defaultPrevented) return
      if (event.ctrlKey || event.altKey || event.metaKey) return
      if (!isSaveShortcutKey(event.key)) {
        lastKey = ''
        lastAt = 0
        return
      }
      if (isEscapeBlocked() || isTypingTarget(event.target)) {
        lastKey = ''
        lastAt = 0
        return
      }
      const now = Date.now()
      const doubled = lastKey !== '' && sameSaveKey(lastKey, event.key) && now - lastAt <= DOUBLE_SAVE_MS
      lastKey = ''
      lastAt = 0
      if (!doubled) {
        lastKey = event.key
        lastAt = now
        return
      }
      event.preventDefault()
      clickFormSave(formId)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [enabled, formId])
}

/** انصراف فرم با Escape — اولویت بالاتر از بازگشت */
export function useEscapeCancel(onCancel?: () => void) {
  useEscapeAction(cancelFns, Boolean(onCancel), onCancel)
}

/** بازگشت صفحه جزئیات با Escape اگر انصراف نباشد */
export function useEscapeBack(enabled: boolean, onBack?: () => void) {
  useEscapeAction(backFns, enabled && Boolean(onBack), onBack)
}
