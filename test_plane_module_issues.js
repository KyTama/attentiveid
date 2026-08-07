const PROJECT_ID = "bb0fb06c-40d5-47d9-98de-da7aded1a7e5";
const WORKSPACE = "kytama";
const API_KEY = "plane_api_93e8288aca3c403d8e47893cbfde481a";
const MODULE_ID = "de133f31-37cf-412b-8011-3a424529ac89";

async function run() {
  const res = await fetch(`https://api.plane.so/api/v1/workspaces/${WORKSPACE}/projects/${PROJECT_ID}/modules/${MODULE_ID}/issues/`, {
    headers: {
      'x-api-key': API_KEY
    }
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response length:", text.length);
  if(text.length > 0) {
     const data = JSON.parse(text);
     console.log("Issues found:", data.results ? data.results.length : data);
  }
}
run();
