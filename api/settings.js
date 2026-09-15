import { sql } from '@vercel/postgres';
import { initDb } from './_db.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  await initDb();
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { rows } = await sql`SELECT family_name FROM settings WHERE id = 1`;
    return res.json({ familyName: rows[0]?.family_name ?? 'My Family Tree' });
  }

  if (req.method === 'PUT') {
    const familyName = (req.body?.familyName || '').trim();
    if (!familyName) return res.status(400).json({ error: 'familyName is required' });
    await sql`UPDATE settings SET family_name = ${familyName}, updated_at = now(), updated_by = ${user.id} WHERE id = 1`;
    return res.json({ familyName });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
