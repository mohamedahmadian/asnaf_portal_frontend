import { Check, ChevronDown, Plus, Search } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { fieldClassName, fieldErrorClassName } from './Form'

export type SearchSelectOption<T extends string = string> = {
  value: T
  label: string
  disabled?: boolean
}

type MenuPos = {
  top?: number
  bottom?: number
  left: number
  width: number
  maxHeight: number
}

type SheetPos = {
  left: number
  width: number
  bottom: number
  maxHeight: number
}

const MENU_GAP = 4
const VIEW_MARGIN = 8
const MENU_MAX = 280
const SHEET_MAX = 420

function isTouchPicker() {
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  )
}

function placeMenu(trigger: DOMRect): MenuPos {
  const vv = window.visualViewport
  const viewTop = vv?.offsetTop ?? 0
  const viewLeft = vv?.offsetLeft ?? 0
  const viewWidth = vv?.width ?? window.innerWidth
  const viewHeight = vv?.height ?? window.innerHeight
  const viewBottom = viewTop + viewHeight
  const viewRight = viewLeft + viewWidth
  const width = Math.min(trigger.width, viewWidth - VIEW_MARGIN * 2)
  const spaceBelow = viewBottom - trigger.bottom - VIEW_MARGIN
  const spaceAbove = trigger.top - viewTop - VIEW_MARGIN
  const showAbove = spaceBelow < 160 && spaceAbove > spaceBelow
  const available = (showAbove ? spaceAbove : spaceBelow) - MENU_GAP
  const maxHeight = Math.max(120, Math.min(MENU_MAX, available))
  let left = trigger.left
  if (left + width > viewRight - VIEW_MARGIN) {
    left = viewRight - width - VIEW_MARGIN
  }
  left = Math.max(viewLeft + VIEW_MARGIN, left)
  if (showAbove) {
    return {
      bottom: window.innerHeight - trigger.top + MENU_GAP,
      left,
      width,
      maxHeight,
    }
  }
  return {
    top: trigger.bottom + MENU_GAP,
    left,
    width,
    maxHeight,
  }
}

function placeSheet(): SheetPos {
  const vv = window.visualViewport
  const layoutH = window.innerHeight
  const layoutW = window.innerWidth
  if (!vv) {
    return {
      left: 0,
      width: layoutW,
      bottom: 0,
      maxHeight: Math.min(SHEET_MAX, layoutH * 0.7),
    }
  }
  return {
    left: vv.offsetLeft,
    width: vv.width,
    bottom: Math.max(0, layoutH - (vv.offsetTop + vv.height)),
    maxHeight: Math.max(180, Math.min(SHEET_MAX, vv.height * 0.72)),
  }
}

function samePos(a: MenuPos | null, b: MenuPos) {
  return (
    a != null &&
    a.top === b.top &&
    a.bottom === b.bottom &&
    a.left === b.left &&
    a.width === b.width &&
    a.maxHeight === b.maxHeight
  )
}

function sameSheet(a: SheetPos | null, b: SheetPos) {
  return (
    a != null &&
    a.left === b.left &&
    a.width === b.width &&
    a.bottom === b.bottom &&
    a.maxHeight === b.maxHeight
  )
}

const CREATE_VALUE = '__search_select_create__'

function labelsMatch(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase()
}

export function SearchSelect<T extends string = string>({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  required,
  invalid,
  disabled,
  onCreate,
  createLabel,
}: {
  id?: string
  name?: string
  value: T
  onChange: (value: T) => void
  options: SearchSelectOption<T>[]
  placeholder?: string
  required?: boolean
  invalid?: boolean
  disabled?: boolean
  onCreate?: (query: string) => void
  createLabel?: (query: string) => string
}) {
  const { t } = useTranslation()
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [searchEnabled, setSearchEnabled] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [pos, setPos] = useState<MenuPos | null>(null)
  const [sheetPos, setSheetPos] = useState<SheetPos | null>(null)

  const selected = options.find((option) => option.value === value)
  const display = selected?.label || placeholder || ''

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.label.toLowerCase().includes(term))
  }, [options, query])

  const createQuery = query.trim()
  const canCreate = Boolean(
    onCreate && createQuery && !options.some((option) => labelsMatch(option.label, createQuery)),
  )

  const listItems = useMemo(() => {
    const items: Array<
      | { kind: 'option'; option: SearchSelectOption<T> }
      | { kind: 'create'; query: string }
    > = filtered.map((option) => ({ kind: 'option' as const, option }))
    if (canCreate) {
      items.unshift({ kind: 'create', query: createQuery })
    }
    return items
  }, [canCreate, createQuery, filtered])

  const updatePlace = useCallback(() => {
    const trigger = triggerRef.current?.getBoundingClientRect()
    if (!trigger) return
    const next = placeMenu(trigger)
    setPos((current) => (samePos(current, next) ? current : next))
  }, [])

  function openMenu() {
    const nextSheet = isTouchPicker()
    setSheet(nextSheet)
    setSearchEnabled(false)
    if (nextSheet) {
      setSheetPos(placeSheet())
      setPos(null)
    } else {
      const trigger = triggerRef.current?.getBoundingClientRect()
      if (trigger) setPos(placeMenu(trigger))
      setSheetPos(null)
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setPos(null)
      setSheetPos(null)
      setSearchEnabled(false)
      return
    }
    setActiveIndex(0)
    if (!sheet) {
      searchRef.current?.focus({ preventScroll: true })
    }
  }, [open, sheet])

  useEffect(() => {
    if (!open || !sheet || !searchEnabled) return
    searchRef.current?.focus({ preventScroll: true })
  }, [open, sheet, searchEnabled])

  useLayoutEffect(() => {
    if (!open || sheet) return
    updatePlace()
  }, [open, sheet, listItems.length, query, updatePlace])

  useEffect(() => {
    if (!open || sheet) return
    const onScrollOrResize = (event: Event) => {
      if (event.type === 'scroll' && menuRef.current?.contains(event.target as Node)) return
      updatePlace()
    }
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    window.visualViewport?.addEventListener('resize', onScrollOrResize)
    window.visualViewport?.addEventListener('scroll', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
      window.visualViewport?.removeEventListener('resize', onScrollOrResize)
      window.visualViewport?.removeEventListener('scroll', onScrollOrResize)
    }
  }, [open, sheet, updatePlace])

  useEffect(() => {
    if (!open || !sheet) return
    const update = () => {
      const next = placeSheet()
      setSheetPos((current) => (sameSheet(current, next) ? current : next))
    }
    update()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [open, sheet])

  function selectOption(option: SearchSelectOption<T>) {
    if (option.disabled) return
    onChange(option.value)
    setOpen(false)
  }

  function createFromQuery() {
    if (!canCreate || !onCreate) return
    onCreate(createQuery)
    setOpen(false)
  }

  function activateItem(item: (typeof listItems)[number]) {
    if (item.kind === 'create') {
      createFromQuery()
      return
    }
    selectOption(item.option)
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const lastIndex = Math.max(listItems.length - 1, 0)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, lastIndex))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (canCreate) {
        createFromQuery()
        return
      }
      const exact = options.find(
        (option) => option.value && labelsMatch(option.label, createQuery),
      )
      if (exact) {
        selectOption(exact)
        return
      }
      const item = listItems[activeIndex]
      if (item) activateItem(item)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus({ preventScroll: true })
    }
  }

  const optionList = (
    <ul role="listbox" className="min-h-0 flex-1 overflow-auto py-1">
      {listItems.length ? (
        listItems.map((item, index) => {
          const isActive = index === activeIndex
          if (item.kind === 'create') {
            return (
              <li key={CREATE_VALUE}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={`flex w-full items-center gap-2 px-3 text-start text-sm transition touch-manipulation ${
                    sheet ? 'min-h-11 py-3' : 'py-2'
                  } ${isActive ? 'bg-teal-50 text-teal-800' : 'text-teal-700'} hover:bg-teal-50`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onPointerDown={(event) => {
                    if (event.pointerType === 'mouse' && event.button !== 0) return
                    event.preventDefault()
                  }}
                  onClick={() => createFromQuery()}
                >
                  <Plus className="size-4 shrink-0" aria-hidden />
                  <span>{createLabel?.(item.query) ?? item.query}</span>
                </button>
              </li>
            )
          }
          const { option } = item
          const isSelected = option.value === value
          return (
            <li key={`${option.value}-${index}`}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                className={`flex w-full items-center justify-between gap-2 px-3 text-start text-sm transition touch-manipulation ${
                  sheet ? 'min-h-11 py-3' : 'py-2'
                } ${isActive ? 'bg-teal-50 text-teal-800' : 'text-ink-800'} ${
                  option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-cream-50'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onPointerDown={(event) => {
                  if (event.pointerType === 'mouse' && event.button !== 0) return
                  event.preventDefault()
                }}
                onClick={() => selectOption(option)}
              >
                <span>{option.label}</span>
                {isSelected ? <Check className="size-4 text-teal-600" aria-hidden /> : null}
              </button>
            </li>
          )
        })
      ) : (
        <li className="px-3 py-3 text-sm text-ink-500">{t('common.noResults')}</li>
      )}
    </ul>
  )

  const searchField = (
    <div className="shrink-0 border-b border-line p-2">
      <label className="flex items-center gap-2 rounded-xl bg-cream-50 px-3 py-2">
        <Search className="size-4 shrink-0 text-teal-600" aria-hidden />
        <input
          ref={searchRef}
          className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          value={query}
          readOnly={sheet && !searchEnabled}
          inputMode={sheet && !searchEnabled ? 'none' : 'search'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          onPointerDown={() => {
            if (sheet && !searchEnabled) setSearchEnabled(true)
          }}
          onChange={(event) => {
            const nextQuery = event.target.value
            setQuery(nextQuery)
            const term = nextQuery.trim()
            const creating = Boolean(
              onCreate && term && !options.some((option) => labelsMatch(option.label, term)),
            )
            const matchCount = term
              ? options.filter((option) => option.label.toLowerCase().includes(term.toLowerCase())).length
              : options.length
            setActiveIndex(creating && matchCount ? 1 : 0)
          }}
          onKeyDown={onSearchKeyDown}
          placeholder={t('common.searchList')}
        />
      </label>
    </div>
  )

  const menuInner: ReactNode = (
    <>
      {searchField}
      {optionList}
    </>
  )

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={invalid || undefined}
        className={`${fieldClassName} flex items-center justify-between gap-2 text-start disabled:cursor-not-allowed disabled:opacity-60 ${invalid ? fieldErrorClassName : ''}`}
        onClick={() => {
          if (open) setOpen(false)
          else openMenu()
        }}
      >
        <span className={selected ? 'text-ink-900' : 'text-ink-400'}>{display}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-teal-600 transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <input
        name={name}
        value={value}
        required={required}
        tabIndex={-1}
        readOnly
        aria-hidden
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        onFocus={() => document.getElementById(fieldId)?.focus()}
      />
      {open
        ? createPortal(
            sheet ? (
              <div className="fixed inset-0 z-[80]" data-enter-ignore>
                <button
                  type="button"
                  className="absolute inset-0 bg-ink-900/30"
                  aria-label={t('common.close')}
                  onClick={() => setOpen(false)}
                />
                <div
                  ref={menuRef}
                  role="dialog"
                  aria-modal="true"
                  style={{
                    left: sheetPos?.left ?? 0,
                    width: sheetPos?.width ?? '100%',
                    bottom: sheetPos?.bottom ?? 0,
                    maxHeight: sheetPos?.maxHeight,
                  }}
                  className="fixed z-10 flex flex-col overflow-hidden rounded-t-3xl border border-line bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-16px_40px_rgba(20,40,40,0.14)]"
                >
                  {menuInner}
                </div>
              </div>
            ) : (
              <div
                ref={menuRef}
                data-enter-ignore
                style={{
                  top: pos?.top ?? 'auto',
                  bottom: pos?.bottom ?? 'auto',
                  left: pos?.left ?? 0,
                  width: pos?.width ?? triggerRef.current?.offsetWidth,
                  maxHeight: pos?.maxHeight,
                  visibility: pos ? 'visible' : 'hidden',
                }}
                className="fixed z-[80] flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_40px_rgba(20,40,40,0.12)]"
              >
                {menuInner}
              </div>
            ),
            document.body,
          )
        : null}
    </div>
  )
}
