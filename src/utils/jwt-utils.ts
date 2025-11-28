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

export function getPayload(token: string | null | undefined): CustomJwtPayload | void {
  if (token) {
    try {
      return jwtDecode<CustomJwtPayload>(token)
    } catch (e) {
      console.error(e)
    }
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

export function getCurrentPayload(kind: TokenKind = 'access'): CustomJwtPayload | void {
  const token = getToken(kind)
  return getPayload(token)
}

/**
 * Retorna o 'id' armazenado no localStorage, ou null se não for ambiente de navegador.
 */
export function getSub(): string | number | null {
  if (typeof window !== 'undefined') {
    const id = localStorage.getItem('id');
    // Tenta converter para número se for uma string numérica
    return id ? (isNaN(Number(id)) ? id : Number(id)) : null;
  }
  return null;
}

/**
 * Retorna o 'role' armazenado no localStorage, ou null se não for ambiente de navegador.
 */
export function getRole(): string | string[] | null {
  if (typeof window !== 'undefined') {
    // Nota: O valor do localStorage é sempre string, mas a assinatura da função mantém
    // compatibilidade com o tipo CustomJwtPayload
    return localStorage.getItem('role');
  }
  return null;
}

export function attachAuthHeader(init: RequestInit = {}): RequestInit {
  const token = getToken('access')
  const headers = new Headers(init.headers ?? {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return { ...init, headers }
}

export function logout() {
  deleteTokenCookies()
  // Adiciona a remoção do localStorage para garantir a limpeza total
  if (typeof window !== 'undefined') {
    localStorage.removeItem('id')
    localStorage.removeItem('role')
  }
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