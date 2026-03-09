import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  const configured = !!(
    process.env.DROPBOX_CLIENT_ID &&
    process.env.DROPBOX_CLIENT_SECRET &&
    process.env.DROPBOX_REDIRECT_URI
  );

  return res.status(200).json({
    status: 'ok',
    service: 'DW Backup Migrate - Dropbox OAuth Service',
    version: '1.0.0',
    configured: configured,
    message: configured ? 'Dropbox OAuth service is configured and ready.' : 'Dropbox OAuth service is not configured. Please add environment variables.',
    endpoints: {
      authorize: '/api/oauth/connect?site_url=YOUR_SITE_URL&state=YOUR_STATE',
      callback: '/api/oauth/callback',
      refresh: '/api/oauth/refresh?refresh_token=YOUR_REFRESH_TOKEN',
      status: '/api/oauth/status'
    }
  });
}
