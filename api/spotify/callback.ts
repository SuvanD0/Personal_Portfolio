import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'https://www.suvandommeti.me/api/spotify/callback';

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      error: 'Missing authorization code',
      instructions: 'Visit the Spotify authorization URL first to get a code',
    });
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({
        error: data.error,
        description: data.error_description,
      });
    }

    // Return the refresh token - you'll need to copy this to your .env.local
    return res.status(200).json({
      success: true,
      message: 'Copy this refresh_token to your SPOTIFY_REFRESH_TOKEN environment variable',
      refresh_token: data.refresh_token,
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({
      error: 'Failed to exchange code for token',
    });
  }
}
