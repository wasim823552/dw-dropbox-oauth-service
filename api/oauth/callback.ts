import type { VercelRequest, VercelResponse } from '@vercel/node';

// Dropbox OAuth Configuration
const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID || '';
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET || '';
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
    const { code, state, error: oauthError } = req.query;

    // Handle OAuth error from Dropbox
    if (oauthError) {
      console.error('Dropbox OAuth error:', oauthError);
      let siteUrl = '';
      try {
        const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        siteUrl = stateData.site_url;
      } catch (e) {
        // Ignore decode error
      }

      if (siteUrl) {
        const redirectUrl = `${siteUrl}/wp-admin/admin.php?page=dw-backup-migrate-cloud&dropbox_error=${encodeURIComponent(oauthError as string)}`;
        return res.redirect(302, redirectUrl);
      }

      return res.status(400).json({ error: oauthError });
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    // Decode state to get site_url
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch (e) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    const { site_url } = stateData;

    if (!site_url) {
      return res.status(400).json({ error: 'Missing site_url in state' });
    }

    console.log('Dropbox OAuth: Exchanging code for tokens...');

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code as string,
        grant_type: 'authorization_code',
        client_id: DROPBOX_CLIENT_ID,
        client_secret: DROPBOX_CLIENT_SECRET,
        redirect_uri: DROPBOX_REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Dropbox token exchange failed:', errorText);

      const redirectUrl = `${site_url}/wp-admin/admin.php?page=dw-backup-migrate-cloud&dropbox_error=${encodeURIComponent('Token exchange failed: ' + errorText)}`;
      return res.redirect(302, redirectUrl);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, account_id } = tokenData;

    console.log('Dropbox OAuth: Got tokens, fetching user info...');

    // Get user info from Dropbox
    let email = '';
    let name = '';
    try {
      const userResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        email = userData.email || '';
        name = userData.name?.display_name || '';
      }
    } catch (e) {
      console.error('Failed to get Dropbox user info:', e);
    }

    console.log('Dropbox OAuth: Success! Email:', email);

    // Build redirect URL back to WordPress
    const redirectUrl = new URL(`${site_url}/wp-admin/admin.php`);
    redirectUrl.searchParams.set('page', 'dw-backup-migrate-cloud');
    redirectUrl.searchParams.set('dwbm_oauth', 'dropbox_callback');
    redirectUrl.searchParams.set('access_token', access_token);

    if (refresh_token) {
      redirectUrl.searchParams.set('refresh_token', refresh_token);
    }

    redirectUrl.searchParams.set('expires_in', String(expires_in || 14400));

    if (email) {
      redirectUrl.searchParams.set('email', email);
    }

    if (name) {
      redirectUrl.searchParams.set('name', name);
    }

    if (account_id) {
      redirectUrl.searchParams.set('account_id', account_id);
    }

    // Redirect back to WordPress
    return res.redirect(302, redirectUrl.toString());

  } catch (error) {
    console.error('Dropbox OAuth callback error:', error);
    return res.status(500).json({ error: 'Dropbox OAuth callback failed' });
  }
}
