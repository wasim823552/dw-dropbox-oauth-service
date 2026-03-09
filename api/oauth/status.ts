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
    service: 'DW Backup Migrate - Dropbox OAuth Service',
    version: '1.0.0',
    provider: 'dropbox',
    configured,
    timestamp: new Date().toISOString(),
  });
}
