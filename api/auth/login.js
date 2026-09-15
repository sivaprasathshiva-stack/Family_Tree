import crypto from 'node:crypto';
import { setCookie } from '../_auth.js';

export default async function handler(req, res) {
  const state = crypto.randomBytes(16).toString('hex');
  setCookie(res, 'ft_oauth_state', state, { maxAge: 300 });

  const appUrl = process.env.APP_URL;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${appUrl}/api/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  res.writeHead(302, { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  res.end();
}
