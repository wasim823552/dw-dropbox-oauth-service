import type { VercelRequest, VercelResponse } from '@vercel/node';

// Dropbox OAuth Configuration
const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID || '';
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refresh_token } = req.query;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Missing refresh_token parameter' });
    }

    // Exchange refresh token for new access token
    const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refresh_token as string,
        grant_type: 'refresh_token',
        client_id: DROPBOX_CLIENT_ID,
        client_secret: DROPBOX_CLIENT_SECRET,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Dropbox token refresh failed:', errorText);
      return res.status(400).json({ error: 'Token refresh failed', details: errorText });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in } = tokenData;

    return res.status(200).json({
      access_token,
      expires_in: expires_in || 14400,
    });

  } catch (error) {
    console.error('Dropbox token refresh error:', error);
    return res.status(500).json({ error: 'Token refresh failed' });
  }
}
