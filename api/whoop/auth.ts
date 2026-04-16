import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const CLIENT_ID = process.env.WHOOP_CLIENT_ID!.trim();
const REDIRECT_URI =
  (process.env.WHOOP_REDIRECT_URI ?? 'http://localhost:8080/api/whoop/callback').trim();

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const state = crypto.randomBytes(16).toString('hex');

  res.setHeader('Set-Cookie', `whoop_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`);

  const url = new URL('https://api.prod.whoop.com/oauth/oauth2/auth');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'read:recovery read:cycles read:sleep read:workout offline');
  url.searchParams.set('state', state);

  return res.redirect(302, url.toString());
}
