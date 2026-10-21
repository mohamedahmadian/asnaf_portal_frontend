import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { isPublicSessionPath } from './public-paths'

type HistoryEntry = {
  key: string
  pathname: string
}

const NavigationHistoryContext = createContext<{
  goBack: (fallback?: string) => void
} | null>(null)

function isBlockedBackTarget(pathname: string) {
  return isPublicSessionPath(pathname)
}

function nextStack(
  current: HistoryEntry[],
  entry: HistoryEntry,
  navType: 'POP' | 'PUSH' | 'REPLACE',
) {
  if (navType === 'REPLACE') {
    return current.length > 0 ? [...current.slice(0, -1), entry] : [entry]
  }
  if (navType === 'PUSH') {
    return [...current, entry]
  }
  const index = current.findIndex((item) => item.key === entry.key)
  if (index >= 0) return current.slice(0, index + 1)
  return current.length > 0 ? [...current, entry] : [entry]
}

export function NavigationHistoryProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navType = useNavigationType()
  const navigate = useNavigate()
  const lastKeyRef = useRef<string | null>(null)
  const [stack, setStack] = useState<HistoryEntry[]>([])

  let currentStack = stack
  if (lastKeyRef.current !== location.key) {
    lastKeyRef.current = location.key
    currentStack = nextStack(
      stack,
      { key: location.key, pathname: location.pathname },
      navType,
    )
    setStack(currentStack)
  }

  const value = useMemo(() => {
    const previous = currentStack.length >= 2 ? currentStack[currentStack.length - 2] : undefined
    const canGoBack = Boolean(previous && !isBlockedBackTarget(previous.pathname))

    return {
      goBack(fallback?: string) {
        if (canGoBack) {
          navigate(-1)
          return
        }
        if (fallback) navigate(fallback)
      },
    }
  }, [currentStack, navigate])

  return (
    <NavigationHistoryContext.Provider value={value}>
      {children}
    </NavigationHistoryContext.Provider>
  )
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext)
  if (!context) {
    return {
      goBack(fallback?: string) {
        if (fallback) window.location.assign(fallback)
      },
    }
  }
  return context
}
