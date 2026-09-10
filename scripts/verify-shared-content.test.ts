import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  ACTIVE_MARKER,
  createTargetDatabaseName,
  redactSensitiveText,
  runDisposableVerification,
  validateAdminDatabaseUrl,
  type DatabaseController,
  type VerificationSignal,
} from './verify-shared-content'

const root = path.resolve(import.meta.dir, '..')

const createHarness = (options: {
  commandExit?: number
  commandError?: Error
  currentDatabase?: string
  cleanupError?: Error
} = {}) => {
  const events: string[] = []
  let signalHandler: ((signal: VerificationSignal) => void) | null = null
  const database: DatabaseController = {
    createTarget: async (name) => { events.push(`create:${name}`) },
    waitUntilReady: async (url) => { events.push(`ready:${new URL(url).pathname.slice(1)}`) },
    readCurrentDatabase: async () => options.currentDatabase ?? events[0]!.slice('create:'.length),
    terminateTarget: async (name) => { events.push(`terminate:${name}`) },
    dropTarget: async (name) => {
      events.push(`drop:${name}`)
      if (options.cleanupError) throw options.cleanupError
    },
    close: async () => { events.push('close') },
  }

  return {
    database,
    events,
    emit(signal: VerificationSignal) {
      signalHandler?.(signal)
    },
    options: {
      adminUrl: 'postgresql://postgres:test-secret@127.0.0.1:5432/postgres',
      command: 'verify:shared-content:inner',
      databaseFactory: () => database,
      generateTargetName: () => 'attentiveid_test_exact_target',
      logger: (message: string) => events.push(`log:${message}`),
      runInner: async (targetUrl: string) => {
        events.push(`run:${new URL(targetUrl).pathname.slice(1)}`)
        if (options.commandError) throw options.commandError
        return options.commandExit ?? 0
      },
      signals: {
        subscribe(handler: (signal: VerificationSignal) => void) {
          signalHandler = handler
          return () => { signalHandler = null }
        },
      },
    },
  }
}

describe('disposable shared-content database verification', () => {
  test('creates, identity-checks, uses, terminates, and drops exactly one generated target', async () => {
    const harness = createHarness()

    await expect(runDisposableVerification(harness.options)).resolves.toBe(0)
    expect(harness.events).toEqual([
      'create:attentiveid_test_exact_target',
      'ready:attentiveid_test_exact_target',
      'run:attentiveid_test_exact_target',
      'terminate:attentiveid_test_exact_target',
      'drop:attentiveid_test_exact_target',
      'close',
    ])
  })

  test('preserves a failing child status while still cleaning exactly once', async () => {
    const harness = createHarness({ commandExit: 23 })

    await expect(runDisposableVerification(harness.options)).resolves.toBe(23)
    expect(harness.events.filter((event) => event.startsWith('drop:'))).toEqual(['drop:attentiveid_test_exact_target'])
  })

  test('cleans after exceptions and redacts credentials from diagnostics', async () => {
    const harness = createHarness({ commandError: new Error('postgresql://postgres:test-secret@127.0.0.1:5432/postgres failed') })

    await expect(runDisposableVerification(harness.options)).resolves.toBe(1)
    expect(harness.events).toContain('drop:attentiveid_test_exact_target')
    expect(harness.events.join('\n')).not.toContain('test-secret')
  })

  test('cleans on SIGINT and SIGTERM while preserving signal outcomes', async () => {
    for (const [signal, expectedExit] of [['SIGINT', 130], ['SIGTERM', 143]] as const) {
      let releaseInner: (() => void) | null = null
      const harness = createHarness()
      harness.options.runInner = async () => new Promise<number>((resolve) => { releaseInner = () => resolve(0) })
      const running = runDisposableVerification(harness.options)
      await Promise.resolve()
      harness.emit(signal)
      await expect(running).resolves.toBe(expectedExit)
      releaseInner?.()
      expect(harness.events.filter((event) => event.startsWith('drop:'))).toHaveLength(1)
    }
  })

  test('fails closed on identity mismatch before running the child command', async () => {
    const harness = createHarness({ currentDatabase: 'postgres' })

    await expect(runDisposableVerification(harness.options)).resolves.toBe(1)
    expect(harness.events.some((event) => event.startsWith('run:'))).toBe(false)
    expect(harness.events).toContain('drop:attentiveid_test_exact_target')
  })

  test('rejects re-entry, nested commands, malformed targets, and non-admin databases before creation', async () => {
    const cases = [
      { marker: '1' },
      { command: 'verify' },
      { command: 'verify:shared-content' },
      { generateTargetName: () => 'production' },
      { adminUrl: 'postgresql://postgres:secret@127.0.0.1:5432/attentiveid' },
      { adminUrl: 'https://postgres:secret@127.0.0.1/postgres' },
    ]

    for (const overrides of cases) {
      const harness = createHarness()
      await expect(runDisposableVerification({ ...harness.options, ...overrides })).resolves.toBe(1)
      expect(harness.events.some((event) => event.startsWith('create:'))).toBe(false)
    }
  })

  test('generates collision-resistant PostgreSQL-safe target identifiers', () => {
    const names = new Set(Array.from({ length: 100 }, () => createTargetDatabaseName()))

    expect(names.size).toBe(100)
    for (const name of names) {
      expect(name).toMatch(/^attentiveid_test_[a-z0-9_]+$/)
      expect(name.length).toBeLessThanOrEqual(63)
    }
  })

  test('validates the admin endpoint and redacts URL credentials', () => {
    expect(validateAdminDatabaseUrl('postgresql://postgres:secret@db:5432/postgres').pathname).toBe('/postgres')
    expect(() => validateAdminDatabaseUrl('postgresql://postgres:secret@db:5432/template1')).toThrow()
    expect(redactSensitiveText('connect postgresql://postgres:secret@db:5432/postgres now')).toBe(
      'connect postgresql://[REDACTED]@db:5432/postgres now',
    )
  })
})

describe('verification command graph and environments', () => {
  test('defines one non-recursive three-level package command graph', async () => {
    const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as { scripts: Record<string, string> }

    expect(packageJson.scripts['verify:shared-content:inner']).not.toMatch(/verify(?::shared-content)?(?:\s|$)/)
    expect(packageJson.scripts['verify:shared-content']).toBe('bun scripts/verify-shared-content.ts verify:shared-content:inner')
    expect((packageJson.scripts.verify.match(/verify:shared-content/g) ?? [])).toHaveLength(1)
    expect(packageJson.scripts['verify:shared-content:inner']).toContain('db:migrate')
    expect(packageJson.scripts['verify:shared-content:inner']).toContain('db:seed:psychologists')
    expect(packageJson.scripts['verify:shared-content:inner']).not.toContain('verify:shared-content')
    expect(packageJson.scripts['verify:shared-content:inner']).not.toContain('bun run verify')
  })

  test('runs every root verification workflow against healthy PostgreSQL 16', async () => {
    for (const workflowFile of ['ci.yml', 'build-images.yml']) {
      const workflow = await readFile(path.join(root, '.github/workflows', workflowFile), 'utf8')

      expect(workflow).toContain('postgres:16-alpine')
      expect(workflow).toContain('pg_isready')
      expect(workflow).toContain('DATABASE_ADMIN_URL')
      expect((workflow.match(/run: bun run verify\s*$/gm) ?? [])).toHaveLength(1)
      expect(workflow).not.toContain('run: bun run verify:shared-content')
    }
  })

  test('provides a healthy local Docker verifier that invokes root verification directly', async () => {
    const compose = await readFile(path.join(root, 'docker-compose.test.yml'), 'utf8')

    expect(compose).toContain('postgres:16-alpine')
    expect(compose).toContain('pg_isready')
    expect(compose).toContain('DATABASE_ADMIN_URL')
    expect(compose).toContain('["bun", "run", "verify"]')
    expect(compose).not.toContain('verify:shared-content')
  })

  test('copies the shared workspace into both production image builds', async () => {
    for (const dockerfile of ['apps/api/Dockerfile', 'apps/web/Dockerfile']) {
      const source = await readFile(path.join(root, dockerfile), 'utf8')
      expect(source).toContain('COPY packages/shared/package.json packages/shared/package.json')
      expect(source).toContain('COPY packages/shared packages/shared')
    }

    const webDockerfile = await readFile(path.join(root, 'apps/web/Dockerfile'), 'utf8')
    expect(webDockerfile).toContain('COPY package.json bun.lock tsconfig.json ./')
  })

  test('uses a dedicated re-entry marker name', () => {
    expect(ACTIVE_MARKER).toBe('ATTENTIVE_SHARED_CONTENT_VERIFY_ACTIVE')
  })
})
