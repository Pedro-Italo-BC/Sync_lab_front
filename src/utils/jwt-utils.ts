import Cookies from 'js-cookie'
import { jwtDecode, JwtPayload } from 'jwt-decode'

type TokenKind = 'access' | 'refresh'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

interface CustomJwtPayload extends Omit<JwtPayload, 'sub'> {
  sub?: string | number
  id?: string | number
  role?: string | string[]
  roles?: string[]
  authorities?: string[]
}

export function getToken(kind: TokenKind = 'access'): string | undefined {
  const key = kind === 'access' ? ACCESS_TOKEN_KEY : REFRESH_TOKEN_KEY

  const aa = Cookies.get(key) 
  return aa
}

export function deleteTokenCookies() {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
}

export function getPayload(token: string | null | undefined): CustomJwtPayload | null {
  if (!token) return null
  try {
    return jwtDecode<CustomJwtPayload>(token)
  } catch (e) {
    return null
  }
}

export function isTokenExpired(token: string | null | undefined): boolean {
  const payload = getPayload(token)
  if (!payload || typeof payload.exp !== 'number') return true

  const expirationTimeMs = payload.exp * 1000
  return Date.now() >= expirationTimeMs
}

export function isLoggedIn(): boolean {
  const token = getToken('access')
  return !!token && !isTokenExpired(token)
}

export function getCurrentPayload(kind: TokenKind = 'access'): CustomJwtPayload | null {
  const token = getToken(kind)
  return getPayload(token)
}

export function getSub(): string | number | null {
  const payload = getCurrentPayload('access')
  return payload?.sub ?? payload?.id ?? null
}

export function getRole(): string | string[] | null {
  const payload = getCurrentPayload('access')
  return payload?.role ?? payload?.roles ?? payload?.authorities ?? null
}

export function attachAuthHeader(init: RequestInit = {}): RequestInit {
  const token = getToken('access')
  const headers = new Headers(init.headers ?? {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return { ...init, headers }
}

export function logout() {
  deleteTokenCookies()
}

export default {
  getToken,
  getPayload: getCurrentPayload,
  isTokenExpired,
  isLoggedIn,
  getSub,
  getRole,
  attachAuthHeader,
  logout,
  deleteTokenCookies,
}