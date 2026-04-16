/**
 * One-time WHOOP OAuth setup script.
 * Run: WHOOP_CLIENT_ID=xxx WHOOP_CLIENT_SECRET=xxx node scripts/whoop-auth.mjs
 *
 * After success, add these to Vercel env vars:
 *   WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET, WHOOP_REFRESH_TOKEN
 *
 * Then create a Vercel KV store and link it to your project for automatic
 * token rotation (env vars KV_REST_API_URL + KV_REST_API_TOKEN auto-populate).
 * Seed it with: vercel kv set whoop_refresh_token "<token from this script>"
 */

import http from 'http';
import { URL } from 'url';
import crypto from 'crypto';

const CLIENT_ID = process.env.WHOOP_CLIENT_ID;
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET must be set.');
  console.error('Usage: WHOOP_CLIENT_ID=xxx WHOOP_CLIENT_SECRET=xxx node scripts/whoop-auth.mjs');
  process.exit(1);
}

const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = 'read:recovery read:cycles read:sleep read:workout offline';
const STATE = crypto.randomBytes(16).toString('hex');

const authUrl = new URL('https://api.prod.whoop.com/oauth/oauth2/auth');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', SCOPES);
authUrl.searchParams.set('state', STATE);

console.log('\n--- WHOOP One-Time Auth ---\n');
console.log('Open this URL in your browser:\n');
console.log(authUrl.toString());
console.log('\nWaiting for callback on http://localhost:3000...\n');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');
  if (url.pathname !== '/callback') {
    res.writeHead(404);
    res.end();
    return;
  }

  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');

  if (returnedState !== STATE) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<h2>State mismatch — possible CSRF. Try again.</h2>');
    server.close();
    return;
  }

  try {
    const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
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

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h2>Auth successful! Check your terminal.</h2>');

    console.log('\n✅ Auth successful!\n');
    console.log('Add to Vercel environment variables:');
    console.log(`  WHOOP_CLIENT_ID=${CLIENT_ID}`);
    console.log(`  WHOOP_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`  WHOOP_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\nThen seed Vercel KV:');
    console.log(`  vercel kv set whoop_refresh_token "${tokens.refresh_token}"`);
    console.log(`  vercel kv set whoop_access_token "${tokens.access_token}"`);
    console.log(`  vercel kv set whoop_token_expiry ${Date.now() + tokens.expires_in * 1000}`);
    console.log('\nAccess token expires in:', tokens.expires_in, 'seconds');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h2>Error: ${err.message}</h2>`);
  }

  server.close();
});

server.listen(3000);
