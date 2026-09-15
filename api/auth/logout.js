import { sql } from '@vercel/postgres';
import { parseCookies, setCookie } from '../_auth.js';

export default async function handler(req, res) {
  const token = parseCookies(req).ft_session;
  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`;
  }
  setCookie(res, 'ft_session', '', { maxAge: 0 });
  res.status(204).end();
}
