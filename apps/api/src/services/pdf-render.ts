/**
 * Prints an HTML page to a PDF with headless Chromium, the same engine as "Print / Save as PDF" in the browser, so a report keeps its
 * exact layout. The browser runs only for the moment it takes to print one report, with its own temporary folder (removed afterwards).
 *
 * The binary is found in CHROMIUM_PATH, or at the usual places (Alpine and Debian: chromium / chromium-browser; Chrome and Edge on a
 * developer machine). Without one this throws a clear error and the caller reports it.
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export type PdfRenderer = (html: string) => Promise<Uint8Array>

const CANDIDATES = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

export const findBrowser = (env: Record<string, string | undefined> = process.env): string | null => {
    const preferred = env.CHROMIUM_PATH?.trim()
    if (preferred && existsSync(preferred)) return preferred
    return CANDIDATES.find((path) => existsSync(path)) ?? null
}

const TIMEOUT_MS = 60_000

/** Chromium prints one page at a time and a few at once would use a lot of memory, so reports are printed one after the other. */
let queue: Promise<unknown> = Promise.resolve()

export const renderPdf: PdfRenderer = (html) => {
    const job = queue.then(() => print(html))
    queue = job.catch(() => undefined)
    return job
}

const print = async (html: string): Promise<Uint8Array> => {
    const browser = findBrowser()
    if (!browser) throw new Error('PDF engine not found (no Chromium on this server; set CHROMIUM_PATH)')
    const dir = await mkdtemp(join(tmpdir(), 'report-pdf-'))
    try {
        const input = join(dir, 'report.html')
        const output = join(dir, 'report.pdf')
        await writeFile(input, html, 'utf8')
        const args = [
            '--headless=new',
            '--no-sandbox', // inside the container; the page is our own, generated from our own data
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--no-first-run',
            '--hide-scrollbars',
            '--no-pdf-header-footer',
            '--virtual-time-budget=8000',
            `--user-data-dir=${join(dir, 'profile')}`,
            `--print-to-pdf=${output}`,
            pathToFileURL(input).href,
        ]
        await new Promise<void>((resolve, reject) => {
            const child = spawn(browser, args, { stdio: ['ignore', 'ignore', 'pipe'], env: { ...process.env, HOME: dir, XDG_CONFIG_HOME: dir, XDG_CACHE_HOME: dir } })
            let stderr = ''
            child.stderr?.on('data', (chunk) => { stderr = (stderr + String(chunk)).slice(-400) })
            const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('PDF engine timed out')) }, TIMEOUT_MS)
            child.on('error', (error) => { clearTimeout(timer); reject(error) })
            child.on('exit', (code) => {
                clearTimeout(timer)
                if (code === 0) resolve()
                else reject(new Error(`PDF engine failed (exit ${code}): ${stderr.trim().slice(-200)}`))
            })
        })
        const pdf = await readFile(output)
        if (pdf.length < 1000 || pdf.subarray(0, 4).toString('latin1') !== '%PDF') throw new Error('PDF engine produced no PDF')
        return new Uint8Array(pdf)
    } finally {
        await rm(dir, { recursive: true, force: true }).catch(() => undefined)
    }
}
