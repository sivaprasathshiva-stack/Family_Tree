import { OAuth2Client } from 'google-auth-library';
import { sql } from '@vercel/postgres';
import { initDb } from '../_db.js';
import { parseCookies, setCookie, generateToken } from '../_auth.js';

const THIRTY_DAYS = 30 * 24 * 60 * 60;

export default async function handler(req, res) {
  await initDb();

  const { code, state } = req.query;
  const cookies = parseCookies(req);
  const appUrl = process.env.APP_URL;

  if (!code || !state || state !== cookies.ft_oauth_state) {
    setCookie(res, 'ft_oauth_state', '', { maxAge: 0 });
    res.status(400).send('Login failed: invalid or expired request. Please try signing in again.');
    return;
  }

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/auth/callback`
    );

    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    await sql`
      INSERT INTO users (id, email, name, picture, last_login_at)
      VALUES (${sub}, ${email}, ${name || null}, ${picture || null}, now())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email, name = EXCLUDED.name, picture = EXCLUDED.picture, last_login_at = now()
    `;

    const token = generateToken();
    const expiresAt = new Date(Date.now() + THIRTY_DAYS * 1000).toISOString();
    await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${sub}, ${expiresAt})`;

    setCookie(res, 'ft_session', token, { maxAge: THIRTY_DAYS });
    setCookie(res, 'ft_oauth_state', '', { maxAge: 0 });
    res.writeHead(302, { Location: appUrl });
    res.end();
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('Login failed. Please try again.');
  }
}
