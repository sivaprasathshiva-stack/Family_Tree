import { sql } from '@vercel/postgres';
import { initDb, rowToPerson } from '../_db.js';

export default async function handler(req, res) {
  await initDb();
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, gender, dateOfBirth, dateOfDeath, photo, phone, email, notes, updatedAt } = req.body;
    const { rows } = await sql`
      UPDATE people SET
        name = ${name},
        gender = ${gender},
        date_of_birth = ${dateOfBirth || null},
        date_of_death = ${dateOfDeath || null},
        photo = ${photo || null},
        phone = ${phone || null},
        email = ${email || null},
        notes = ${notes || null},
        updated_at = ${updatedAt}
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json(rowToPerson(rows[0]));
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM people WHERE id = ${id}`;
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
