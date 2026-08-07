const PROJECT_ID = "bb0fb06c-40d5-47d9-98de-da7aded1a7e5";
const WORKSPACE = "kytama";
const API_KEY = "plane_api_93e8288aca3c403d8e47893cbfde481a";

async function run() {
  const res = await fetch(`https://api.plane.so/api/v1/workspaces/${WORKSPACE}/projects/${PROJECT_ID}/modules/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      name: "Test Module"
    })
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
run();
