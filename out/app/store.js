// Progress store: one earned-set, kept in localStorage, exportable to a file
// and importable back. Nothing leaves the browser; there is no account and
// no network call anywhere in this module.

export const STORAGE_KEY = 'leonida-trophy-ledger-v1';

// Read the saved earned ids. A damaged or foreign value is treated as empty
// rather than crashing the page.
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

// Persist the earned ids as a sorted JSON array.
export function saveEarned(earned) {
  const ids = [...earned].filter((id) => Number.isInteger(id)).sort((a, b) => a - b);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

// Flip one trophy and persist. Returns the new earned state of that trophy.
export function toggleEarned(earned, id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveEarned(earned);
  return earned.has(id);
}

// Download the progress as a JSON file the reader can keep or move to
// another browser. The filename carries the date so several exports do not
// overwrite each other silently.
export function exportEarned(earned, total) {
  const payload = {
    app: 'Leonida Trophy Ledger',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    total,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `gta6-trophies-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Read an exported file back into an earned set. Only ids that are integers
// are kept; anything else in the file is ignored. Returns null when the file
// is not a progress export we recognise.
export async function importEarnedFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) return null;
  return new Set(ids.filter((id) => Number.isInteger(id)));
}

// Wipe all saved progress after a confirm in the caller.
export function resetEarned() {
  localStorage.removeItem(STORAGE_KEY);
  return new Set();
}

// Count earned trophies per grade, for the header breakdown line.
export function countByGrade(trophies, earned) {
  const counts = {};
  for (const trophy of trophies) {
    const grade = trophy.grade;
    counts[grade] = counts[grade] || { earned: 0, total: 0 };
    counts[grade].total += 1;
    if (earned.has(trophy.id)) counts[grade].earned += 1;
  }
  return counts;
}
