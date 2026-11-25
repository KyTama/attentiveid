// Writes the portal's update history from the git log, just before the API image is built.
// Needs the full history (actions/checkout with fetch-depth: 0).
//   bun scripts/ci/write-update-log.ts [output file]
import { join } from 'node:path'

const root = join(import.meta.dir, '..', '..')
const output = process.argv[2] ?? join(root, 'apps/api/src/data/update-log.json')

const git = Bun.spawnSync(['git', 'log', '--first-parent', '--max-count=300', '--date=iso-strict', '--pretty=format:%h%x1f%ad%x1f%an%x1f%s%x1f%b%x1e'], { cwd: root })
if (!git.success) throw new Error(`git log failed: ${git.stderr.toString()}`)

const MAX_DETAIL = 600

/** The first paragraphs of the commit message, without trailers or tool footers. */
const detailOf = (body: string) => {
  const text = body
    .split('\n')
    .filter((line) => !/^(co-authored-by|signed-off-by|claude-session):|generated with \[|^---+$/i.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return text.length > MAX_DETAIL ? `${text.slice(0, MAX_DETAIL).trimEnd()}…` : text
}

const entries = git.stdout
  .toString()
  .split('\x1e')
  .map((record) => record.replace(/^\s+/, ''))
  .filter(Boolean)
  .map((record) => {
    const [id, at, author, title, body = ''] = record.split('\x1f')
    return { id, at, author, title, detail: detailOf(body) }
  })

await Bun.write(output, `${JSON.stringify(entries, null, 1)}\n`)
console.log(`Update log: ${entries.length} entries written to ${output}`)
