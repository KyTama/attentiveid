const { spawn } = require('child_process');

const PROJECT_ID = "bb0fb06c-40d5-47d9-98de-da7aded1a7e5";

const milestones = [
  {
    name: "Milestone 1: Web, Surveys & Domain Switch",
    target_date: "2026-07-19",
    issues: [
      "8ef92df8-e165-44a8-a0a2-c6956763b874",
      "c2a99a71-3270-40e9-9ce6-5c0e9dd1feee",
      "b144166d-9408-46be-97bc-2a456cb3404b",
      "190c14e4-f031-42b7-9806-57b046b0a537",
      "fed08746-3fc0-4c97-93b8-40ae2b3c24e2",
      "7106ff7d-e751-43b3-9fa2-13b64260bdb0",
      "1b5850b2-1a8a-4670-8e39-c4470f3d8269",
      "1b9318b2-7f37-4647-8a72-4f82c9f85968"
    ]
  },
  {
    name: "Milestone 2: Booking & Auth",
    target_date: "2026-08-16",
    issues: [
      "737e1530-0276-45c2-aa78-fa360396f944",
      "e6cd6b57-4b63-4408-9a14-d1b6ec706f49",
      "30eb18ca-64c8-4f74-8637-2f620eb3e40f",
      "2ae5f731-84b4-4e14-aab8-71e070a611d7"
    ]
  },
  {
    name: "Milestone 3: Launch",
    target_date: "2026-08-31",
    issues: [
      "b216f69a-2549-404e-bb2a-56e28804da51",
      "bad43604-27c1-48e1-acae-703cd0375da4"
    ]
  }
];

const proc = spawn('npx', ['-y', '@makeplane/plane-mcp-server'], {
  env: {
    ...process.env,
    PLANE_API_KEY: 'plane_api_93e8288aca3c403d8e47893cbfde481a',
    PLANE_HOST: 'https://api.plane.so',
    PLANE_API_URL: 'https://api.plane.so',
    PLANE_WORKSPACE_SLUG: 'kytama'
  }
});

let idCounter = 1;
const reqs = [];

milestones.forEach((m, idx) => {
  reqs.push({
    jsonrpc: "2.0",
    id: idCounter++,
    method: "tools/call",
    params: {
      name: "create_module",
      arguments: {
        project_id: PROJECT_ID,
        module_data: {
          name: m.name,
          target_date: m.target_date,
          description: m.name
        }
      }
    }
  });
});

proc.stdout.on('data', data => {
  console.log("STDOUT:", data.toString());
  let str = data.toString();
  // Quick parse for module ID since it's just a one-off script
  let match = str.match(/"id":\s*"([^"]+)"/);
  if (match) {
    let moduleId = match[1];
    // Find which milestone this might be by looking for the name in the JSON
    for (let m of milestones) {
      if (str.includes(m.name)) {
        console.log(`Matched module ${moduleId} for ${m.name}`);
        if (m.issues.length > 0) {
           proc.stdin.write(JSON.stringify({
              jsonrpc: "2.0",
              id: idCounter++,
              method: "tools/call",
              params: {
                 name: "add_module_issues",
                 arguments: {
                    project_id: PROJECT_ID,
                    module_id: moduleId,
                    issues_data: {
                       issues: m.issues
                    }
                 }
              }
           }) + '\n');
        }
      }
    }
  }
});

proc.stderr.on('data', d => console.error("STDERR:", d.toString()));

// Kick off module creation
reqs.forEach(req => {
  console.log("Sending:", JSON.stringify(req));
  proc.stdin.write(JSON.stringify(req) + '\n');
});

setTimeout(() => {
  console.log("Done syncing modules!");
  proc.kill();
}, 6000);
