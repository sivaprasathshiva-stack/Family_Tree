# My Family Tree

A clean, fast family tree app — React + React Flow frontend, Vercel serverless API, Vercel Postgres (Neon) database.

## Local Development (no database needed)

```bash
npm install
npm run dev
```

Uses **localStorage** automatically in local dev — no API keys or DB required.

---

## Deploy to Vercel + Postgres

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "initial"
gh repo create family-tree --public --push
```

### 2. Import to Vercel

- Go to vercel.com/new → import your repo
- Framework preset: **Vite** (auto-detected)
- Click **Deploy**

### 3. Add Vercel Postgres

1. Vercel project dashboard → **Storage** tab
2. **Create Database** → **Postgres** (Neon)
3. Name it `family-tree-db` → **Create & Connect**
   - This auto-injects all `POSTGRES_*` env vars into your project

### 4. Add env var

Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_USE_API` | `true` | Production |

### 5. Redeploy

Trigger a redeploy from the dashboard (or `vercel --prod`).  
Tables are created automatically on the first request.

---

## Architecture

```
src/
  api.ts              API client (fetch + localStorage fallback)
  types.ts            Types & relationship inverse logic
  treeLayout.ts       Graph layout
  App.tsx             Main component
  components/         PersonNode, PersonForm, PersonPanel, etc.

api/
  _db.js              DB init + row mappers
  people.js           GET/POST /api/people
  people/[id].js      PUT/DELETE /api/people/:id
  relationships.js    GET/POST /api/relationships
  relationships/[id].js  DELETE /api/relationships/:id
  export.js           GET /api/export
  import.js           POST /api/import
```

## Data model

```sql
CREATE TABLE people (id, name, gender, date_of_birth, date_of_death,
  photo, phone, email, notes, created_at, updated_at);

CREATE TABLE relationships (id, person_id → people, related_person_id → people,
  relationship_type, created_at,
  UNIQUE(person_id, related_person_id, relationship_type));
```
