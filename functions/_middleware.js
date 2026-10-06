// Blocks visitors whose IP is on the block list (managed from your Admin panel's
// "Blocked" tab, stored in Firestore collection "blockedIps").
// Repo path: functions/_middleware.js

const PROJECT = "vsk-studio";
const API_KEY = "AIzaSyAyA9A_B9ZoXjdjj-CneHZCUxl3iPUQkPc";

// Optional permanent blocks (the Admin panel list is easier to use).
const BLOCKED_IPS = [];
const BLOCKED_COUNTRIES = []; // e.g. "RU"

async function isBlockedInAdminList(ip) {
  if (!ip) return false;
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/blockedIps/${encodeURIComponent(ip)}?key=${API_KEY}`;
  try {
    const r = await fetch(url, {
      cf: { cacheEverything: true, cacheTtlByStatus: { "200-299": 20, "404": 20, "500-599": 0 } },
    });
    return r.status === 200; // document exists = blocked; anything else = allowed
  } catch (e) {
    return false; // if Firestore can't be reached, let visitors in
  }
}

export async function onRequest(context) {
  const request = context.request;
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const country = (request.cf && request.cf.country) || "";

  if (BLOCKED_IPS.includes(ip) || BLOCKED_COUNTRIES.includes(country) || (await isBlockedInAdminList(ip))) {
    return new Response(
      `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Access blocked</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#111;color:#fff;text-align:center">
<div><h1>Access blocked</h1><p>You do not have permission to view this website.</p></div>
</body></html>`,
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }
  return context.next();
}
