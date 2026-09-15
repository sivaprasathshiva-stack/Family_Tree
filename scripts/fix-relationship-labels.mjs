// One-off data correction for the relationship-inverse gender bug (see src/api.ts
// addRelationship). Re-derives the correct gendered relationshipType for every
// relationship row from the RELATED person's actual current gender, and fixes any
// row that doesn't match.
//
// Usage:
//   node --env-file=.env.local scripts/fix-relationship-labels.mjs            (dry run, default)
//   node --env-file=.env.local scripts/fix-relationship-labels.mjs --apply    (writes changes)
//
// .env.local must contain POSTGRES_URL (run `npx vercel env pull .env.local` first).

import { sql } from '@vercel/postgres';

const FAMILY = {
  father: 'parent', mother: 'parent', parent: 'parent',
  son: 'child', daughter: 'child', child: 'child',
  husband: 'spouse', wife: 'spouse', spouse: 'spouse',
  brother: 'sibling', sister: 'sibling', sibling: 'sibling',
  grandfather: 'grandparent', grandmother: 'grandparent', grandparent: 'grandparent',
  grandson: 'grandchild', granddaughter: 'grandchild', grandchild: 'grandchild',
  uncle: 'auntUncle', aunt: 'auntUncle', auntUncle: 'auntUncle',
  nephew: 'nieceNephew', niece: 'nieceNephew', nieceNephew: 'nieceNephew',
  cousin: 'cousin',
};

const GENDERED = {
  parent: { male: 'father', female: 'mother', other: 'parent' },
  child: { male: 'son', female: 'daughter', other: 'child' },
  spouse: { male: 'husband', female: 'wife', other: 'spouse' },
  sibling: { male: 'brother', female: 'sister', other: 'sibling' },
  grandparent: { male: 'grandfather', female: 'grandmother', other: 'grandparent' },
  grandchild: { male: 'grandson', female: 'granddaughter', other: 'grandchild' },
  auntUncle: { male: 'uncle', female: 'aunt', other: 'auntUncle' },
  nieceNephew: { male: 'nephew', female: 'niece', other: 'nieceNephew' },
  cousin: { male: 'cousin', female: 'cousin', other: 'cousin' },
};

const apply = process.argv.includes('--apply');

const { rows: people } = await sql`SELECT id, name, gender FROM people`;
const peopleById = new Map(people.map(p => [p.id, p]));

const { rows: relationships } = await sql`SELECT id, person_id, related_person_id, relationship_type FROM relationships`;

let proposed = 0;
for (const rel of relationships) {
  const related = peopleById.get(rel.related_person_id);
  if (!related) continue;

  const family = FAMILY[rel.relationship_type];
  if (!family) {
    console.warn(`SKIP ${rel.id}: unknown relationship_type "${rel.relationship_type}"`);
    continue;
  }

  const g = related.gender === 'unknown' ? 'other' : (related.gender ?? 'other');
  const expected = GENDERED[family][g] ?? GENDERED[family].other;

  if (expected !== rel.relationship_type) {
    proposed++;
    console.log(`${rel.id}: ${rel.relationship_type} -> ${expected} (related person = ${related.name}, gender = ${related.gender})`);
    if (apply) {
      await sql`UPDATE relationships SET relationship_type = ${expected} WHERE id = ${rel.id}`;
    }
  }
}

console.log(`\n${proposed} row(s) ${apply ? 'updated' : 'would be updated'} out of ${relationships.length} total.`);
if (!apply && proposed > 0) {
  console.log('Re-run with --apply to write these changes.');
}
