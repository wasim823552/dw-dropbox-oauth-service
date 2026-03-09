# DW Dropbox OAuth Service

Dropbox OAuth Service for DW Backup Migrate WordPress Plugin.

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/dw-dropbox-oauth-service)

## Environment Variables

Set these in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `DROPBOX_CLIENT_ID` | Dropbox App Key | `s465sffh9vcjdkt` |
| `DROPBOX_CLIENT_SECRET` | Dropbox App Secret | `039cjjge3fgy7h1` |
| `DROPBOX_REDIRECT_URI` | OAuth Callback URL | `https://your-project.vercel.app/api/oauth/callback` |

## Dropbox Developer Setup

1. Go to https://www.dropbox.com/developers/apps
2. Create a new app with "Scoped access" and "Full Dropbox"
3. Add these permissions:
   - `files.content.write`
   - `files.content.read`
   - `files.metadata.read`
   - `files.metadata.write`
4. Copy App Key and App Secret
5. Add Redirect URI: `https://your-project.vercel.app/api/oauth/callback`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/oauth/connect` | GET | Start Dropbox OAuth flow |
| `/api/oauth/callback` | GET | Handle Dropbox OAuth callback |
| `/api/oauth/refresh` | GET | Refresh access token |
| `/api/oauth/status` | GET | Check service status |

## WordPress Plugin Integration

Update your WordPress plugin to use this OAuth service:

```php
// Dropbox OAuth Service URL
private function get_dropbox_oauth_service_url() {
    return 'https://your-project.vercel.app';
}

// Start OAuth flow
$oauth_url = add_query_arg(array(
    'site_url' => urlencode($site_url),
    'state' => $state,
), $this->get_dropbox_oauth_service_url() . '/api/oauth/connect');
```

## License

MIT License - Wasim Akram
