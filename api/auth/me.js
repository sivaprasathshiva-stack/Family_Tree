import { initDb } from '../_db.js';
import { requireAuth } from '../_auth.js';

export default async function handler(req, res) {
  await initDb();
  const user = await requireAuth(req, res);
  if (!user) return;
  res.json({ user });
}
