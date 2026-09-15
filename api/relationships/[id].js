import { sql } from '@vercel/postgres';
import { initDb } from '../_db.js';
import { requireAuth } from '../_auth.js';

export default async function handler(req, res) {
  await initDb();
  const user = await requireAuth(req, res);
  if (!user) return;
  const { id } = req.query;

  if (req.method === 'DELETE') {
    await sql`DELETE FROM relationships WHERE id = ${id}`;
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
