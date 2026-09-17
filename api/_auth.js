import { sql } from '@vercel/postgres';
import crypto from 'node:crypto';

const SESSION_COOKIE = 'ft_session';
const isHttps = (process.env.APP_URL || '').startsWith('https://');

export function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    cookies[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return cookies;
}

export function setCookie(res, name, value, { maxAge } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (isHttps) parts.push('Secure');
  parts.push(`Max-Age=${maxAge ?? 0}`);
  const cookieStr = parts.join('; ');
  const existing = res.getHeader('Set-Cookie');
  if (existing) {
    res.setHeader('Set-Cookie', Array.isArray(existing) ? [...existing, cookieStr] : [existing, cookieStr]);
  } else {
    res.setHeader('Set-Cookie', cookieStr);
  }
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function getSessionUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const { rows } = await sql`
    SELECT u.id, u.email, u.name, u.picture, u.linked_person_id
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > now()
  `;
  if (!rows[0]) return null;
  const row = rows[0];
  return { id: row.id, email: row.email, name: row.name, picture: row.picture, linkedPersonId: row.linked_person_id || null };
}

export async function requireAuth(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
