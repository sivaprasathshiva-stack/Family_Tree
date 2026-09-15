import { sql } from '@vercel/postgres';
import { initDb } from './_db.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  await initDb();
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    const { people = [], relationships = [] } = req.body;

    // Insert all people first
    for (const p of people) {
      await sql`
        INSERT INTO people (id, name, gender, date_of_birth, date_of_death, photo, phone, email, notes, created_at, updated_at)
        VALUES (${p.id}, ${p.name}, ${p.gender}, ${p.dateOfBirth || null}, ${p.dateOfDeath || null}, ${p.photo || null}, ${p.phone || null}, ${p.email || null}, ${p.notes || null}, ${p.createdAt}, ${p.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          gender = EXCLUDED.gender,
          date_of_birth = EXCLUDED.date_of_birth,
          date_of_death = EXCLUDED.date_of_death,
          photo = EXCLUDED.photo,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at
      `;
    }

    // Insert relationships
    for (const r of relationships) {
      await sql`
        INSERT INTO relationships (id, person_id, related_person_id, relationship_type, created_at)
        VALUES (${r.id}, ${r.personId}, ${r.relatedPersonId}, ${r.relationshipType}, ${r.createdAt})
        ON CONFLICT (person_id, related_person_id, relationship_type) DO NOTHING
      `.catch(() => {}); // ignore FK errors for missing people
    }

    return res.json({ ok: true, imported: { people: people.length, relationships: relationships.length } });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
