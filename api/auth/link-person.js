import { sql } from '@vercel/postgres';
import { initDb } from '../_db.js';
import { requireAuth } from '../_auth.js';

// Links the signed-in user's account to a node in the tree, so the app knows
// whose family circle to center on by default. A user may only be linked to
// one person, and re-linking simply repoints it (e.g. picked the wrong node).
export default async function handler(req, res) {
  await initDb();
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { personId } = req.body;
  if (!personId) return res.status(400).json({ error: 'personId is required' });

  const { rows: peopleRows } = await sql`SELECT id FROM people WHERE id = ${personId}`;
  if (peopleRows.length === 0) return res.status(404).json({ error: 'Person not found' });

  await sql`UPDATE users SET linked_person_id = ${personId} WHERE id = ${user.id}`;
  res.json({ linkedPersonId: personId });
}
