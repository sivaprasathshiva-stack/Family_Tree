import { sql } from '@vercel/postgres';
import { initDb, rowToRelationship } from './_db.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  await initDb();
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { rows } = await sql`SELECT * FROM relationships ORDER BY created_at ASC`;
    return res.json(rows.map(rowToRelationship));
  }

  if (req.method === 'POST') {
    const { id, personId, relatedPersonId, relationshipType, createdAt } = req.body;
    try {
      const { rows } = await sql`
        INSERT INTO relationships (id, person_id, related_person_id, relationship_type, created_at)
        VALUES (${id}, ${personId}, ${relatedPersonId}, ${relationshipType}, ${createdAt})
        ON CONFLICT (person_id, related_person_id, relationship_type) DO NOTHING
        RETURNING *
      `;
      if (rows.length === 0) {
        // Already exists — return the existing one
        const existing = await sql`
          SELECT * FROM relationships
          WHERE person_id = ${personId} AND related_person_id = ${relatedPersonId} AND relationship_type = ${relationshipType}
        `;
        return res.status(200).json(rowToRelationship(existing.rows[0]));
      }
      return res.status(201).json(rowToRelationship(rows[0]));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
