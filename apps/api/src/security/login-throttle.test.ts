import { describe, expect, it } from 'bun:test'
import { clientAddress, createLoginThrottle } from './login-throttle'

describe('login throttle', () => {
  it('locks one e-mail after a few failures, and lets it back in after the wait', () => {
    let clock = 1_000_000
    const throttle = createLoginThrottle({ now: () => clock, maxFailuresPerEmail: 3, windowMs: 60_000 })
    for (let i = 0; i < 3; i += 1) {
      expect(throttle.check('1.1.1.1', 'a@x.com')).toEqual({ allowed: true })
      throttle.recordFailure('1.1.1.1', 'a@x.com')
    }
    const blocked = throttle.check('9.9.9.9', 'a@x.com')
    expect(blocked.allowed).toBe(false)
    if (!blocked.allowed) expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    // another e-mail from the same address is not locked by this
    expect(throttle.check('1.1.1.1', 'b@x.com')).toEqual({ allowed: true })
    clock += 61_000
    expect(throttle.check('1.1.1.1', 'a@x.com')).toEqual({ allowed: true })
  })

  it('blocks one address that tries many e-mails', () => {
    const throttle = createLoginThrottle({ maxFailuresPerIp: 4, maxFailuresPerEmail: 100 })
    for (let i = 0; i < 4; i += 1) throttle.recordFailure('2.2.2.2', `user${i}@x.com`)
    expect(throttle.check('2.2.2.2', 'fresh@x.com').allowed).toBe(false)
    expect(throttle.check('3.3.3.3', 'fresh@x.com').allowed).toBe(true)
  })

  it('a good sign-in clears that e-mail, and memory stays bounded', () => {
    const throttle = createLoginThrottle({ maxFailuresPerEmail: 2, maxKeys: 5 })
    throttle.recordFailure('1.1.1.1', 'a@x.com')
    throttle.recordSuccess('a@x.com')
    throttle.recordFailure('1.1.1.1', 'a@x.com')
    expect(throttle.check('1.1.1.1', 'a@x.com').allowed).toBe(true)
    for (let i = 0; i < 50; i += 1) throttle.recordFailure(`10.0.0.${i}`, `flood${i}@x.com`)
    expect(throttle.check('10.0.0.1', 'flood49@x.com').allowed).toBe(true)
  })

  it('uses the address the proxy vouches for', () => {
    expect(clientAddress({ 'x-forwarded-for': 'spoofed, 203.0.113.9' })).toBe('203.0.113.9')
    expect(clientAddress({})).toBe('unknown')
  })
})
