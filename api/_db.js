import { sql } from '@vercel/postgres';

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gender TEXT NOT NULL DEFAULT 'unknown',
      date_of_birth TEXT,
      date_of_death TEXT,
      photo TEXT,
      phone TEXT,
      email TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      related_person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      relationship_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(person_id, related_person_id, relationship_type)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT,
      picture TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_login_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);`;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      family_name TEXT NOT NULL DEFAULT 'My Family Tree',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_by TEXT REFERENCES users(id)
    );
  `;
  await sql`INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;`;
}

export function rowToPerson(row) {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    dateOfBirth: row.date_of_birth || undefined,
    dateOfDeath: row.date_of_death || undefined,
    photo: row.photo || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToRelationship(row) {
  return {
    id: row.id,
    personId: row.person_id,
    relatedPersonId: row.related_person_id,
    relationshipType: row.relationship_type,
    createdAt: row.created_at,
  };
}
