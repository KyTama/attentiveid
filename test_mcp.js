const { spawn } = require('child_process');

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

const req = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "create_issue",
    arguments: {
      project_id: "bb0fb06c-40d5-47d9-98de-da7aded1a7e5",
      issue_data: {
        name: "Test Issue",
        description_html: "<p>Test</p>"
      }
    }
  }
};

proc.stdin.write(JSON.stringify(req) + '\n');

setTimeout(() => proc.kill(), 3000);
