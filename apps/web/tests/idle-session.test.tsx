import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IdleSessionGuard } from '../src/components/auth/IdleSessionGuard'
import { ACTIVITY_STORAGE_KEY, idleStateAt } from '../src/features/auth/idle-session'
import i18n from '../src/i18n'

const logout = vi.fn().mockResolvedValue(undefined)
let idleTimeoutMinutes: number | undefined = 15

vi.mock('../src/features/auth/auth-context', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Test', idleTimeoutMinutes }, logout }),
}))

const MIN = 60_000

describe('idleStateAt', () => {
  it('is active, then warns during the last minute, then expires at the limit', () => {
    expect(idleStateAt(14 * MIN - 1, 0, 15)).toEqual({ kind: 'active' })
    expect(idleStateAt(14 * MIN + 1000, 0, 15)).toEqual({ kind: 'warning', secondsLeft: 59 })
    expect(idleStateAt(15 * MIN - 1, 0, 15)).toMatchObject({ kind: 'warning', secondsLeft: 1 })
    expect(idleStateAt(15 * MIN, 0, 15)).toEqual({ kind: 'expired' })
    expect(idleStateAt(40 * MIN, 0, 15)).toEqual({ kind: 'expired' })
  })

  it('keeps some plain activity time before the warning even for the shortest limit', () => {
    // 5 minutes: warning in the last 60 s. A 1-minute limit (not offered) would warn in its last third.
    expect(idleStateAt(4 * MIN - 1000, 0, 5)).toEqual({ kind: 'active' })
    expect(idleStateAt(4 * MIN + 1000, 0, 5)).toMatchObject({ kind: 'warning' })
    expect(idleStateAt(45_000, 0, 1)).toMatchObject({ kind: 'warning' })
    expect(idleStateAt(10_000, 0, 1)).toEqual({ kind: 'active' })
  })
})

describe('IdleSessionGuard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-21T10:00:00Z'))
    window.localStorage.removeItem(ACTIVITY_STORAGE_KEY)
    logout.mockClear()
    idleTimeoutMinutes = 15
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const mount = () =>
    render(
      <MemoryRouter>
        <IdleSessionGuard />
      </MemoryRouter>,
    )

  it('asks "Are you still there?" a minute before the limit, and Yes keeps the session', async () => {
    mount()
    expect(screen.queryByRole('alertdialog')).toBeNull()
    await act(async () => { vi.advanceTimersByTime(14 * MIN + 5000) })
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    expect(screen.getByText('Are you still there?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /yes, i'm still here/i }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    // the clock restarted: still signed in well past the original limit
    await act(async () => { vi.advanceTimersByTime(10 * MIN) })
    expect(logout).not.toHaveBeenCalled()
  })

  it('signs out when nobody answers', async () => {
    mount()
    await act(async () => { vi.advanceTimersByTime(15 * MIN + 2000) })
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('treats typing, scrolling and clicking as activity (no warning while the person keeps working)', async () => {
    mount()
    for (let i = 0; i < 4; i += 1) {
      await act(async () => { vi.advanceTimersByTime(10 * MIN) })
      fireEvent.keyDown(window, { key: 'a' })
    }
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(logout).not.toHaveBeenCalled()
    await act(async () => { vi.advanceTimersByTime(8 * MIN) })
    fireEvent.scroll(window)
    await act(async () => { vi.advanceTimersByTime(8 * MIN) })
    fireEvent.pointerDown(window)
    await act(async () => { vi.advanceTimersByTime(8 * MIN) })
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(logout).not.toHaveBeenCalled()
  })

  it('uses the person\'s own limit', async () => {
    idleTimeoutMinutes = 5
    mount()
    await act(async () => { vi.advanceTimersByTime(4 * MIN + 5000) })
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    await act(async () => { vi.advanceTimersByTime(MIN) })
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('does not let a passing mouse move dismiss the question', async () => {
    mount()
    await act(async () => { vi.advanceTimersByTime(14 * MIN + 5000) })
    fireEvent.pointerMove(window)
    await act(async () => { vi.advanceTimersByTime(2000) })
    expect(screen.getByRole('alertdialog')).toBeTruthy()
  })
})
