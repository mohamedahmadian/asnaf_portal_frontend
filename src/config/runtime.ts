const DEFAULT_API_BASE_URL = '/api/user/v1'
const DEFAULT_TOKEN_STORAGE_KEY = 'asnaf.portal.access-token'

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export const portalConfig = Object.freeze({
  apiBaseUrl: withoutTrailingSlash(
    import.meta.env.VITE_PORTAL_API_URL?.trim() || DEFAULT_API_BASE_URL,
  ),
  tokenStorageKey:
    import.meta.env.VITE_PORTAL_TOKEN_KEY?.trim() || DEFAULT_TOKEN_STORAGE_KEY,
})
