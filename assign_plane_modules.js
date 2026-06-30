const { spawn } = require('child_process');
const PROJECT_ID = "bb0fb06c-40d5-47d9-98de-da7aded1a7e5";

const assignments = [
  {
    moduleId: "de133f31-37cf-412b-8011-3a424529ac89",
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
    moduleId: "bdb780c6-3d5c-4e98-b42a-a5331adef0fd",
    issues: [
      "737e1530-0276-45c2-aa78-fa360396f944",
      "e6cd6b57-4b63-4408-9a14-d1b6ec706f49",
      "30eb18ca-64c8-4f74-8637-2f620eb3e40f",
      "2ae5f731-84b4-4e14-aab8-71e070a611d7"
    ]
  },
  {
    moduleId: "f4d1749d-1b6d-4744-b067-6316e474468c",
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

proc.stderr.on('data', data => console.error(`STDERR: ${data}`));
proc.stdout.on('data', data => console.log(`STDOUT: ${data}`));

let idCounter = 1;

assignments.forEach(assign => {
  const req = {
    jsonrpc: "2.0",
    id: idCounter++,
    method: "tools/call",
    params: {
      name: "add_module_issues",
      arguments: {
        project_id: PROJECT_ID,
        module_id: assign.moduleId,
        issues: assign.issues
      }
    }
  };
  proc.stdin.write(JSON.stringify(req) + '\n');
});

setTimeout(() => {
  console.log("Done assigning issues to modules!");
  proc.kill();
}, 3000);
