import axios from 'axios'
import { portalConfig } from '@/config/runtime'
import i18n from '../i18n'
import { getPortalToken } from './auth-token'

export const portalApi = axios.create({
  baseURL: portalConfig.apiBaseUrl,
  headers: {
    'Accept-Language': 'fa',
  },
  timeout: 15_000,
})

portalApi.interceptors.request.use((config) => {
  const token = getPortalToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

portalApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new Event('portal:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function isBadGatewayError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 502
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isBadGatewayError(error)) {
    return i18n.t('app.unavailable')
  }
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const message = error.response?.data?.message
  if (typeof message === 'string' && message.trim()) {
    return message
  }
  if (Array.isArray(message)) {
    const text = message
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .join('، ')
    if (text) {
      return text
    }
  }
  return fallback
}
