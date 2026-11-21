/**
 * Slows down password guessing on the login endpoint.
 *  - per e-mail: a few wrong passwords in a row lock that account's sign-in for a short while (the right person
 *    can still sign in after the wait; a guesser gets nothing);
 *  - per address: many failures from one address block that address, whichever e-mails it tries.
 * Kept in memory (one API instance). It only counts failures, and a good sign-in clears the e-mail's count.
 */

export interface LoginThrottleOptions {
  now?: () => number
  windowMs?: number
  maxFailuresPerEmail?: number
  maxFailuresPerIp?: number
  /** Upper bound on remembered keys, so a flood of made-up e-mails cannot grow memory without limit. */
  maxKeys?: number
}

export type LoginGate = { allowed: true } | { allowed: false; retryAfterSeconds: number }

export interface LoginThrottle {
  check(ip: string, email: string): LoginGate
  recordFailure(ip: string, email: string): void
  recordSuccess(email: string): void
}

export const createLoginThrottle = (options: LoginThrottleOptions = {}): LoginThrottle => {
  const now = options.now ?? Date.now
  const windowMs = options.windowMs ?? 15 * 60 * 1000
  const maxEmail = options.maxFailuresPerEmail ?? 5
  const maxIp = options.maxFailuresPerIp ?? 25
  const maxKeys = options.maxKeys ?? 20_000
  const byEmail = new Map<string, number[]>()
  const byIp = new Map<string, number[]>()

  const recent = (store: Map<string, number[]>, key: string) => {
    const cutoff = now() - windowMs
    const fresh = (store.get(key) ?? []).filter((time) => time > cutoff)
    if (fresh.length === 0) store.delete(key)
    else store.set(key, fresh)
    return fresh
  }

  const retryAfter = (times: number[]) => Math.max(1, Math.ceil((times[0] + windowMs - now()) / 1000))

  const remember = (store: Map<string, number[]>, key: string) => {
    if (!store.has(key) && store.size >= maxKeys) {
      // drop the oldest remembered key
      const oldest = store.keys().next().value
      if (oldest !== undefined) store.delete(oldest)
    }
    const times = recent(store, key)
    times.push(now())
    store.set(key, times)
  }

  return {
    check(ip, email) {
      const emailTimes = recent(byEmail, email)
      if (emailTimes.length >= maxEmail) return { allowed: false, retryAfterSeconds: retryAfter(emailTimes) }
      const ipTimes = recent(byIp, ip)
      if (ipTimes.length >= maxIp) return { allowed: false, retryAfterSeconds: retryAfter(ipTimes) }
      return { allowed: true }
    },
    recordFailure(ip, email) {
      remember(byEmail, email)
      remember(byIp, ip)
    },
    recordSuccess(email) {
      byEmail.delete(email)
    },
  }
}

/** The client address as vouched for by the proxy: the last X-Forwarded-For entry (earlier ones are client-supplied). */
export const clientAddress = (headers: Record<string, string | undefined>): string => {
  const forwarded = headers['x-forwarded-for']
  if (!forwarded) return 'unknown'
  const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean)
  return parts[parts.length - 1] ?? 'unknown'
}
