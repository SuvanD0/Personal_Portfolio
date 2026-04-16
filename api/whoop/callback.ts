import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_ID = process.env.WHOOP_CLIENT_ID!.trim();
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET!.trim();
const REDIRECT_URI =
  (process.env.WHOOP_REDIRECT_URI ?? 'http://localhost:8080/api/whoop/callback').trim();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).send(page('WHOOP Auth Error', `<p style="color:#f43f5e">Error: ${error}</p>`));
  }

  // Validate state cookie
  const cookies = Object.fromEntries(
    (req.headers.cookie ?? '').split(';').map((c) => c.trim().split('='))
  );
  if (!state || state !== cookies['whoop_state']) {
    return res.status(400).send(page('State Mismatch', '<p style="color:#f43f5e">State mismatch — possible CSRF. Try again.</p>'));
  }

  try {
    const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token exchange failed (${tokenRes.status}): ${err}`);
    }

    const tokens = await tokenRes.json();

    // Store refresh token in Upstash Redis for self-maintaining rotation
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      try {
        await fetch(`${redisUrl}/set/whoop_refresh_token/${encodeURIComponent(tokens.refresh_token)}`, {
          headers: { Authorization: `Bearer ${redisToken}` },
        });
      } catch {
        // Non-fatal
      }
    }

    res.setHeader('Set-Cookie', 'whoop_state=; HttpOnly; Path=/; Max-Age=0');
    return res.status(200).send(
      page(
        'Connected!',
        `
        <p style="color:#22c55e;font-size:1.1rem;margin-bottom:1.5rem;">✓ WHOOP connected successfully</p>
        <p style="margin-bottom:0.75rem;color:#aaa;">Add this to <code style="background:#2a2a2a;padding:2px 6px;border-radius:4px;">.env.local</code> then restart <code style="background:#2a2a2a;padding:2px 6px;border-radius:4px;">vercel dev</code>:</p>
        <pre style="background:#111;border:1px solid #333;border-radius:8px;padding:1rem;overflow-x:auto;font-size:0.85rem;line-height:1.6;">WHOOP_REFRESH_TOKEN=${tokens.refresh_token}</pre>
        <p style="color:#aaa;margin-top:1rem;font-size:0.85rem;">Access token expires in ${Math.round(tokens.expires_in / 60)} minutes.</p>
        <a href="/whoop" style="display:inline-block;margin-top:1.5rem;padding:0.5rem 1.25rem;background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:8px;text-decoration:none;font-size:0.9rem;">View Health Dashboard →</a>
        `
      )
    );
  } catch (err) {
    return res
      .status(500)
      .send(page('Error', `<p style="color:#f43f5e">${(err as Error).message}</p>`));
  }
}

function page(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>WHOOP Auth — ${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;background:#1a1a1a;color:#eee;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
    .card{background:#242424;border:1px solid #333;border-radius:16px;padding:2rem;max-width:560px;width:100%}
    h1{font-size:1.25rem;margin-bottom:1.25rem;font-weight:600}
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    ${body}
  </div>
</body>
</html>`;
}
