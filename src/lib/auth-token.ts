import { portalConfig } from '@/config/runtime'

export function getPortalToken(): string | null {
  return window.localStorage.getItem(portalConfig.tokenStorageKey)
}

export function setPortalToken(token: string): void {
  window.localStorage.setItem(portalConfig.tokenStorageKey, token)
}

export function clearPortalToken(): void {
  window.localStorage.removeItem(portalConfig.tokenStorageKey)
}
