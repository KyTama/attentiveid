const { spawn } = require('child_process');

const issues = [
  { name: "Phase 1.1: Project Scaffolding & PostgreSQL Integration", description: "Initialize monorepo. Scaffold apps/api (Elysia) and apps/web (React/Vite)." },
  { name: "Phase 1.2: Vex Page Sections Porting & Tailwind v4 Customization", description: "Re-create Vex landing page layout using React + Tailwind v4 CSS." },
  { name: "Phase 1.3: Internationalization (i18n) Logic", description: "Integrate react-i18next with language switching (English & Bahasa Indonesia)." },
  { name: "Phase 1.4: Staging Deployment on Tencent VPS", description: "Spin up basic docker-compose on Tencent VPS with SSL enabled on a staging subdomain." },
  { name: "Phase 1.5: Dynamic Intake Survey / Screening UI", description: "Build responsive dynamic intake screening form UI in React." },
  { name: "Phase 1.6: Survey API & PostgreSQL Storage", description: "Elysia POST endpoint for screening submission." },
  { name: "Phase 1.7: DNS Repointing to Tencent VPS & SSL Activation", description: "Update A/AAAA DNS records for attentiveid.com on the domain registrar." },
  { name: "Phase 1.8: HTTP 301 Permanent Redirect from GitHub Pages", description: "Setup permanent HTTP 301 redirects in Caddy." },
  { name: "Phase 2.1: JWT Authentication & User/Psychologist Roles", description: "Implement email & password signup/signin backend in Elysia." },
  { name: "Phase 2.2: Psychologist Slots Planner UI", description: "Create interactive calendar board in React for psychologists." },
  { name: "Phase 2.3: Patient Reservation Scheduling Calendar", description: "Patient portal view displaying available psychologist profiles." },
  { name: "Phase 2.4: Booking Reservation Transaction Engine", description: "Elysia booking reservation API." },
  { name: "Phase 3.1: Admin Console (Dashboard)", description: "Dashboard for platform administrator." },
  { name: "Phase 3.2: E2E Verification & Handover", description: "Run final E2E scenario validation." }
];

async function run() {
  const proc = spawn('npx', ['-y', '@makeplane/plane-mcp-server'], {
    env: {
      ...process.env,
      PLANE_API_KEY: 'plane_api_93e8288aca3c403d8e47893cbfde481a',
      PLANE_HOST: 'https://api.plane.so',
      PLANE_API_URL: 'https://api.plane.so',
      PLANE_WORKSPACE_SLUG: 'kytama'
    }
  });

  proc.stderr.on('data', data => console.error(`STDERR: ${data}`));
  proc.stdout.on('data', data => console.log(`STDOUT: ${data}`));
  
  let idCounter = 1;
  const PROJECT_ID = "bb0fb06c-40d5-47d9-98de-da7aded1a7e5";
  
  for (const issue of issues) {
    const req = {
      jsonrpc: "2.0",
      id: idCounter++,
      method: "tools/call",
      params: {
        name: "create_issue",
        arguments: {
          project_id: PROJECT_ID,
          issue_data: {
            name: issue.name,
            description_html: `<p>${issue.description}</p>`
          }
        }
      }
    };
    proc.stdin.write(JSON.stringify(req) + '\n');
    await new Promise(r => setTimeout(r, 1000));
  }
  
  setTimeout(() => proc.kill(), 2000);
  console.log("Synced 14 issues to Plane successfully!");
}

run();
