/**
 * One-time helper: gets the Google refresh token the site needs to save released reports to Drive.
 *
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... bun scripts/google-drive-token.ts
 *
 * 1. Run it on your own computer. It prints a Google sign-in address and waits.
 * 2. Open the address, sign in with the Google account whose Drive should hold the reports (e.g. contact@attentiveid.com),
 *    and allow "See, edit, create and delete only the specific Drive files you use with this app" (scope drive.file).
 * 3. The page then shows "Done" and this script prints GOOGLE_DRIVE_REFRESH_TOKEN=... Add it as a GitHub secret (see below) or put that line into the server's secret file
 *    (the one that already holds GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) and restart the API. Nothing is saved on this computer.
 *
 * GitHub way (no server login needed): repository Settings > Environments > production (and staging) > Add secret, name
 * GOOGLE_DRIVE_REFRESH_TOKEN, value = the token. The next deploy writes it into the server's settings. Optional variable
 * GOOGLE_DRIVE_ROOT_FOLDER_NAME (default: Reports).
 *
 * Needs http://127.0.0.1:8765/callback as an allowed redirect address of the OAuth client (a "Desktop app" client allows it by
 * default; a "Web application" client needs it added in Google Cloud Console > APIs & Services > Credentials).
 * Also make sure the Google Drive API is enabled for the project.
 */
const PORT = 8765
const REDIRECT = `http://127.0.0.1:${PORT}/callback`
const SCOPE = 'https://www.googleapis.com/auth/drive.file'

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.')
  process.exit(1)
}

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: clientId,
  redirect_uri: REDIRECT,
  response_type: 'code',
  scope: SCOPE,
  access_type: 'offline',
  prompt: 'consent',
})}`

const server = Bun.serve({
  hostname: '127.0.0.1',
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname !== '/callback') return new Response('Not found', { status: 404 })
    const code = url.searchParams.get('code')
    if (!code) return new Response(`Google said: ${url.searchParams.get('error') ?? 'no code'}`, { status: 400 })
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
    })
    const json = (await response.json()) as { refresh_token?: string; error_description?: string }
    if (!json.refresh_token) {
      console.error('No refresh token received:', json.error_description ?? JSON.stringify(json))
      setTimeout(() => process.exit(1), 200)
      return new Response('No refresh token. See the terminal.', { status: 500 })
    }
    console.log(`\nGOOGLE_DRIVE_REFRESH_TOKEN=${json.refresh_token}\n`)
    setTimeout(() => process.exit(0), 200)
    return new Response('Done. You can close this tab and go back to the terminal.')
  },
})

console.log(`Open this address and sign in:\n\n${authUrl}\n\nWaiting on ${server.url} ...`)
