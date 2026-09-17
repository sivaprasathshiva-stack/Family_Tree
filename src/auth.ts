export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  linkedPersonId?: string | null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  const { user } = await res.json();
  return user;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function linkPerson(personId: string): Promise<string> {
  const res = await fetch('/api/auth/link-person', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personId }),
  });
  if (!res.ok) throw new Error('Failed to link person');
  const { linkedPersonId } = await res.json();
  return linkedPersonId;
}

export async function getFamilyName(): Promise<string> {
  const res = await fetch('/api/settings');
  if (!res.ok) return 'My Family Tree';
  const { familyName } = await res.json();
  return familyName;
}

export async function updateFamilyName(name: string): Promise<string> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ familyName: name }),
  });
  if (!res.ok) throw new Error('Failed to update family name');
  const { familyName } = await res.json();
  return familyName;
}
