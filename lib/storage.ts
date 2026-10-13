const KEY = 'diverge:userId';
const FACTION_KEY = 'diverge:faction';

export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function getFaction(): 'A' | 'B' | null {
  if (typeof window === 'undefined') return null;
  const f = localStorage.getItem(FACTION_KEY);
  return f === 'A' || f === 'B' ? f : null;
}

export function setFaction(faction: 'A' | 'B'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FACTION_KEY, faction);
}
