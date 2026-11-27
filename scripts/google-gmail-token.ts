/**
 * One-time helper: gets the read-only Gmail token the site needs to show replies in Email > Conversations.
 *
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... bun scripts/google-gmail-token.ts
 *
 * Open the printed address, sign in as the mailbox that sends the e-mails (contact@attentiveid.com) and allow
 * "View your email messages and settings" (scope gmail.readonly). The script prints GMAIL_READ_REFRESH_TOKEN=...;
 * add it as a secret of the GitHub "staging" environment and deploy again. Nothing is saved on this computer.
 *
 * In Google Cloud Console first: enable the Gmail API. The OAuth consent screen should be "Internal" (Google Workspace);
 * an external app in testing gets a token that expires after 7 days.
 */
const PORT = 8765
const REDIRECT = `http://127.0.0.1:${PORT}/callback`
const SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'

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
    console.log(`\nGMAIL_READ_REFRESH_TOKEN=${json.refresh_token}\n`)
    setTimeout(() => process.exit(0), 200)
    return new Response('Done. You can close this tab and go back to the terminal.')
  },
})

console.log(`Open this address and sign in:\n\n${authUrl}\n\nWaiting on ${server.url} ...`)
