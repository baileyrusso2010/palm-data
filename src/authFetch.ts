import { fetchAuthSession } from 'aws-amplify/auth'

/**
 * Wrapper for calling protected backend endpoints with Cognito tokens.
 * Uses the access token (recommended for API authorization) by default.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  // In development, don't require login/session. Perform a plain fetch.
  if (import.meta.env.DEV) {
    const headers = new Headers(init.headers || {})
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    return fetch(input, { ...init, headers })
  }

  const session = await fetchAuthSession()
  const accessToken = session.tokens?.accessToken?.toString()
  if (!accessToken) {
    throw new Error('No access token available')
  }
  const headers = new Headers(init.headers || {})
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const resp = await fetch(input, { ...init, headers })
  if (resp.status === 401) {
    // Optionally trigger a re-auth flow or refresh here.
    throw new Error('Unauthorized (401)')
  }
  return resp
}
