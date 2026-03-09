import type { VercelRequest, VercelResponse } from '@vercel/node';

// Dropbox OAuth Configuration
const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID || '';
const DROPBOX_REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || '';

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
    const { site_url, state } = req.query;

    if (!site_url) {
      return res.status(400).json({ error: 'Missing site_url parameter' });
    }

    if (!state) {
      return res.status(400).json({ error: 'Missing state parameter' });
    }

    // Store site_url and state in the state parameter
    const encodedState = Buffer.from(JSON.stringify({
      site_url: site_url as string,
      state: state as string
    })).toString('base64');

    // Build Dropbox OAuth URL
    const dropboxAuthUrl = new URL('https://www.dropbox.com/oauth2/authorize');

    dropboxAuthUrl.searchParams.set('client_id', DROPBOX_CLIENT_ID);
    dropboxAuthUrl.searchParams.set('redirect_uri', DROPBOX_REDIRECT_URI);
    dropboxAuthUrl.searchParams.set('response_type', 'code');
    dropboxAuthUrl.searchParams.set('token_access_type', 'offline');
    dropboxAuthUrl.searchParams.set('state', encodedState);

    console.log('Dropbox OAuth: Redirecting to Dropbox for authorization');

    // Redirect to Dropbox
    return res.redirect(302, dropboxAuthUrl.toString());

  } catch (error) {
    console.error('Dropbox OAuth initiation error:', error);
    return res.status(500).json({ error: 'Failed to initiate Dropbox OAuth' });
  }
}
