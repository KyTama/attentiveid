import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '../src/features/auth/auth-context'

function Who() {
  const { user } = useAuth()
  return <p>{user ? user.email : 'signed out'}</p>
}

const user = { id: 'u', email: 'a@b.c', name: 'A', role: 'admin', status: 'active' }
const ok = () => new Response(JSON.stringify({ status: 'success', accessToken: 't', user }), { status: 200 })

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe('keeping the portal signed in', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renews before the 15 minute token runs out, survives a network blip, and signs out only when refused', async () => {
    vi.useFakeTimers()
    let reply: () => Response = ok
    const fetchMock = vi.fn(async () => reply())
    vi.stubGlobal('fetch', fetchMock)
    render(<AuthProvider><Who /></AuthProvider>)
    await advance(0)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await advance(9 * 60_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await advance(90_000)
    expect(fetchMock).toHaveBeenCalledTimes(2)

    reply = () => { throw new Error('offline') }
    await advance(11 * 60_000)
    expect(screen.getByText('a@b.c')).toBeTruthy()

    reply = () => new Response('{}', { status: 401 })
    await advance(60_000)
    expect(screen.getByText('signed out')).toBeTruthy()
  })
})
