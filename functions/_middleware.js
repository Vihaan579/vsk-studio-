// Blocks listed IP addresses from seeing ANY page of the site.

// 1) Add the IPs you want to block (one per line, in quotes, with a comma).
const BLOCKED_IPS = [
  "121.74.216.93",
  "2407:7000:ae40:8800:c488:de68:ddd4:8f5e",
];

// 2) Optional: block whole countries by 2-letter code, e.g. "RU".
const BLOCKED_COUNTRIES = [
  // "XX",
];

export async function onRequest(context) {
  const request = context.request;
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const country = (request.cf && request.cf.country) || "";

  if (BLOCKED_IPS.includes(ip) || BLOCKED_COUNTRIES.includes(country)) {
    return new Response(
      `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Access blocked</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#111;color:#fff;text-align:center">
<div><h1>Access blocked</h1><p>You do not have permission to view this website.</p></div>
</body></html>`,
      {
        status: 403,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      }
    );
  }

  return context.next();
}
