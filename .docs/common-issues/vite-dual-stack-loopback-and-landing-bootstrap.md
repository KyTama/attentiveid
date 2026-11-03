# Vite Dual-Stack Loopback Binding & Landing Aggregate Bootstrap

**Symptoms:**
- Browser requests to `http://localhost:5173/` or `http://127.0.0.1:5173/` fail with `ECONNREFUSED` or hang, even when the Vite dev server process is running.
- After resolving server reachability, the homepage renders the fallback error screen (*"Halaman ini sedang tidak tersedia. Silakan coba lagi sebentar atau hubungi tim kami melalui WhatsApp"*).

**Root Cause:**
1. **IPv6-Only Loopback Binding:** On macOS with Node.js, running Vite without an explicit `server.host: true` defaults to binding exclusively to `::1` (IPv6). If client browsers or networking stacks attempt to connect via IPv4 (`127.0.0.1`), the connection is immediately rejected.
2. **Missing Landing Aggregate Seed:** The public route `/` dynamically loads `/api/content/landing`. If only migrations or entity seeds (e.g. `db:seed:psychologists`) are executed without `db:seed:landing`, `/api/content/landing` returns `{"status":"found","landing":null}`, which transitions `LandingPage.tsx` into the unavailable state.

**Rule:**
1. Configure `server: { host: true, port: 5173 }` in `apps/web/vite.config.ts` so Vite binds to `0.0.0.0`, supporting both IPv4 (`127.0.0.1`) and IPv6 (`::1`) connections seamlessly.
2. When initializing a fresh PostgreSQL instance or running local bootstrap, always execute `bun run db:seed:landing` alongside psychologist and article seeds.
