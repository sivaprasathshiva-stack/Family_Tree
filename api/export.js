import { sql } from '@vercel/postgres';
import { initDb, rowToPerson, rowToRelationship } from './_db.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  await initDb();
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const [peopleResult, relsResult] = await Promise.all([
      sql`SELECT * FROM people ORDER BY created_at ASC`,
      sql`SELECT * FROM relationships ORDER BY created_at ASC`,
    ]);

    return res.json({
      people: peopleResult.rows.map(rowToPerson),
      relationships: relsResult.rows.map(rowToRelationship),
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
