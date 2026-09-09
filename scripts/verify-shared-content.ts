import { randomBytes } from 'node:crypto'
import postgres from 'postgres'

export const ACTIVE_MARKER = 'ATTENTIVE_SHARED_CONTENT_VERIFY_ACTIVE'
const expectedCommand = 'verify:shared-content:inner'
const targetPattern = /^attentiveid_test_[a-z0-9_]{8,45}$/

export type VerificationSignal = 'SIGINT' | 'SIGTERM'

export interface DatabaseController {
  createTarget(name: string): Promise<void>
  waitUntilReady(targetUrl: string): Promise<void>
  readCurrentDatabase(targetUrl: string): Promise<string>
  terminateTarget(name: string): Promise<void>
  dropTarget(name: string): Promise<void>
  close(): Promise<void>
}

interface SignalSource {
  subscribe(handler: (signal: VerificationSignal) => void): () => void
}

interface DisposableVerificationOptions {
  adminUrl: string
  command: string
  marker?: string
  databaseFactory: (adminUrl: string) => DatabaseController
  generateTargetName?: () => string
  logger?: (message: string) => void
  runInner: (targetUrl: string, marker: string) => Promise<number>
  cancelInner?: (signal: VerificationSignal) => void
  signals: SignalSource
}

export const createTargetDatabaseName = () => {
  const time = Date.now().toString(36)
  const entropy = randomBytes(10).toString('hex')
  return `attentiveid_test_${time}_${entropy}`
}

export const validateAdminDatabaseUrl = (value: string) => {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('DATABASE_ADMIN_URL must be a valid PostgreSQL URL.')
  }

  if ((url.protocol !== 'postgres:' && url.protocol !== 'postgresql:')
    || !url.hostname
    || url.pathname !== '/postgres'
    || url.hash !== '') {
    throw new Error('DATABASE_ADMIN_URL must target the postgres admin database.')
  }

  return url
}

const validateTargetName = (name: string) => {
  if (!targetPattern.test(name) || name.length > 63) {
    throw new Error('Generated database target was refused.')
  }
  return name
}

const targetUrlFrom = (adminUrl: URL, targetName: string) => {
  const targetUrl = new URL(adminUrl.toString())
  targetUrl.pathname = `/${targetName}`
  if (targetUrl.hostname !== adminUrl.hostname
    || targetUrl.port !== adminUrl.port
    || targetUrl.protocol !== adminUrl.protocol) {
    throw new Error('Generated database endpoint drifted from the admin endpoint.')
  }
  return targetUrl.toString()
}

export const redactSensitiveText = (value: string) => value.replace(
  /\b(postgres(?:ql)?:\/\/)[^\s/@]+(?::[^\s/@]*)?@/gi,
  '$1[REDACTED]@',
)

const errorText = (error: unknown) => redactSensitiveText(error instanceof Error ? error.message : String(error))

export const runDisposableVerification = async (options: DisposableVerificationOptions) => {
  const logger = options.logger ?? (() => undefined)
  let database: DatabaseController | null = null
  let targetCreated = false
  let targetName = ''
  let cleanupPromise: Promise<void> | null = null
  let unsubscribe = () => undefined

  const cleanup = () => {
    if (cleanupPromise) return cleanupPromise
    cleanupPromise = (async () => {
      if (database && targetCreated) {
        await database.terminateTarget(targetName)
        await database.dropTarget(targetName)
      }
    })()
    return cleanupPromise
  }

  try {
    if (options.marker) throw new Error('Nested shared-content verification was refused.')
    if (options.command !== expectedCommand) throw new Error('Unexpected verification child command was refused.')

    const adminUrl = validateAdminDatabaseUrl(options.adminUrl)
    targetName = validateTargetName((options.generateTargetName ?? createTargetDatabaseName)())
    const targetUrl = targetUrlFrom(adminUrl, targetName)
    database = options.databaseFactory(adminUrl.toString())

    let resolveSignal: ((signal: VerificationSignal) => void) | null = null
    const signalPromise = new Promise<VerificationSignal>((resolve) => { resolveSignal = resolve })
    unsubscribe = options.signals.subscribe((signal) => {
      options.cancelInner?.(signal)
      resolveSignal?.(signal)
    })

    await database.createTarget(targetName)
    targetCreated = true
    await database.waitUntilReady(targetUrl)
    const currentDatabase = await database.readCurrentDatabase(targetUrl)
    if (currentDatabase !== targetName) throw new Error('Disposable database identity check failed.')

    const childOutcome = options.runInner(targetUrl, '1')
      .then((exitCode) => ({ type: 'child' as const, exitCode }))
      .catch((error: unknown) => ({ type: 'error' as const, error }))
    const signalOutcome = signalPromise.then((signal) => ({ type: 'signal' as const, signal }))
    const outcome = await Promise.race([childOutcome, signalOutcome])

    if (outcome.type === 'error') {
      logger(`Shared-content verification failed: ${errorText(outcome.error)}`)
      await cleanup()
      return 1
    }

    await cleanup()
    if (outcome.type === 'signal') return outcome.signal === 'SIGINT' ? 130 : 143
    return outcome.exitCode
  } catch (error) {
    logger(`Shared-content verification failed: ${errorText(error)}`)
    try {
      await cleanup()
    } catch (cleanupError) {
      logger(`Disposable database cleanup failed: ${errorText(cleanupError)}`)
    }
    return 1
  } finally {
    unsubscribe()
    if (database) {
      try {
        await database.close()
      } catch (error) {
        logger(`Database connection cleanup failed: ${errorText(error)}`)
      }
    }
  }
}

const quotedIdentifier = (name: string) => `"${validateTargetName(name).replaceAll('"', '""')}"`

export const createPostgresDatabaseController = (adminUrl: string): DatabaseController => {
  const admin = postgres(adminUrl, { max: 1, connect_timeout: 5 })

  return {
    async createTarget(name) {
      await admin.unsafe(`create database ${quotedIdentifier(name)}`)
    },
    async waitUntilReady(targetUrl) {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const target = postgres(targetUrl, { max: 1, connect_timeout: 2 })
        try {
          await target`select 1`
          await target.end()
          return
        } catch {
          await target.end({ timeout: 0 })
          await Bun.sleep(250)
        }
      }
      throw new Error('Disposable database did not become ready.')
    },
    async readCurrentDatabase(targetUrl) {
      const target = postgres(targetUrl, { max: 1, connect_timeout: 5 })
      try {
        const rows = await target<{ name: string }[]>`select current_database() as name`
        if (!rows[0]) throw new Error('Disposable database identity was unavailable.')
        return rows[0].name
      } finally {
        await target.end()
      }
    },
    async terminateTarget(name) {
      await admin`select pg_terminate_backend(pid) from pg_stat_activity where datname = ${name} and pid <> pg_backend_pid()`
    },
    async dropTarget(name) {
      await admin.unsafe(`drop database ${quotedIdentifier(name)}`)
    },
    async close() {
      await admin.end()
    },
  }
}

const processSignals: SignalSource = {
  subscribe(handler) {
    const interrupt = () => handler('SIGINT')
    const terminate = () => handler('SIGTERM')
    process.once('SIGINT', interrupt)
    process.once('SIGTERM', terminate)
    return () => {
      process.off('SIGINT', interrupt)
      process.off('SIGTERM', terminate)
    }
  },
}

if (import.meta.main) {
  let child: ReturnType<typeof Bun.spawn> | null = null
  const exitCode = await runDisposableVerification({
    adminUrl: process.env.DATABASE_ADMIN_URL ?? '',
    command: process.argv[2] ?? '',
    marker: process.env[ACTIVE_MARKER],
    databaseFactory: createPostgresDatabaseController,
    logger: (message) => console.error(message),
    runInner: async (targetUrl, marker) => {
      child = Bun.spawn(['bun', 'run', expectedCommand], {
        cwd: import.meta.dir + '/..',
        env: {
          ...process.env,
          DATABASE_URL: targetUrl,
          [ACTIVE_MARKER]: marker,
        },
        stderr: 'inherit',
        stdin: 'inherit',
        stdout: 'inherit',
      })
      return await child.exited
    },
    cancelInner: (signal) => child?.kill(signal),
    signals: processSignals,
  })
  process.exitCode = exitCode
}
