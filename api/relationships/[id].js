import { sql } from '@vercel/postgres';
import { initDb } from '../_db.js';

export default async function handler(req, res) {
  await initDb();
  const { id } = req.query;

  if (req.method === 'DELETE') {
    await sql`DELETE FROM relationships WHERE id = ${id}`;
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
