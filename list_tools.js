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

let out = "";
proc.stdout.on('data', data => {
  out += data.toString();
  if (out.includes('\n')) {
      console.log(out);
      process.exit(0);
  }
});

const req = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list",
  params: {}
};

proc.stdin.write(JSON.stringify(req) + '\n');
