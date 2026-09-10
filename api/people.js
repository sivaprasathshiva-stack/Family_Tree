import { sql } from '@vercel/postgres';
import { initDb, rowToPerson } from './_db.js';

export default async function handler(req, res) {
  await initDb();

  if (req.method === 'GET') {
    const { rows } = await sql`SELECT * FROM people ORDER BY created_at ASC`;
    return res.json(rows.map(rowToPerson));
  }

  if (req.method === 'POST') {
    const { id, name, gender, dateOfBirth, dateOfDeath, photo, phone, email, notes, createdAt, updatedAt } = req.body;
    const { rows } = await sql`
      INSERT INTO people (id, name, gender, date_of_birth, date_of_death, photo, phone, email, notes, created_at, updated_at)
      VALUES (${id}, ${name}, ${gender}, ${dateOfBirth || null}, ${dateOfDeath || null}, ${photo || null}, ${phone || null}, ${email || null}, ${notes || null}, ${createdAt}, ${updatedAt})
      RETURNING *
    `;
    return res.status(201).json(rowToPerson(rows[0]));
  }

  res.status(405).json({ error: 'Method not allowed' });
}
