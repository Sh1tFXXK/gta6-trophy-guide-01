// Filtering and the spoiler rule: which trophies a view shows, and what a
// spoiler-hidden trophy looks like until it is earned.

// A trophy matches the kind filter when its kind list holds the kind, or
// when the missable filter is on and the trophy is flagged missable. The
// platinum has no kind of its own; it shows under All and under Activities.
export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return trophy.kind === 'online';
  return Array.isArray(trophy.kinds) && trophy.kinds.includes(kind);
}

export function matchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function matchesEarned(trophy, earned, mode) {
  if (mode === 'earned') return earned.has(trophy.id);
  if (mode === 'todo') return !earned.has(trophy.id);
  return true;
}

// Search across the name, the official description and the guide text, so a
// search for a mission, a place or an activity finds the trophy behind it.
export function matchesSearch(trophy, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.note || '']
    .join(' ')
    .toLowerCase();
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

// Apply every active filter at once and return the visible trophies in
// list order.
export function applyFilters(trophies, earned, filters) {
  return trophies.filter(
    (trophy) =>
      matchesKind(trophy, filters.kind) &&
      matchesGrade(trophy, filters.grade) &&
      matchesEarned(trophy, earned, filters.earnedMode) &&
      matchesSearch(trophy, filters.query),
  );
}

// Spoiler rule: when spoilers are on, a story trophy that is not earned yet
// shows a placeholder name and description instead of the real ones. The
// platinum and the gold for the final mission are story-adjacent too, so
// they hide the same way. Everything else is always shown.
const SPOILER_KINDS = ['story'];

export function isSpoilerHidden(trophy, spoilersOn, earned) {
  if (!spoilersOn) return false;
  if (earned.has(trophy.id)) return false;
  return (
    Array.isArray(trophy.kinds) &&
    trophy.kinds.some((kind) => SPOILER_KINDS.includes(kind))
  );
}

// What a hidden trophy displays in the list and the detail pane.
export function spoilerMask(trophy) {
  return {
    name: 'Hidden story trophy',
    description: 'Earn this trophy to reveal its name and description.',
  };
}

// Count how many trophies of each kind the list holds, for the filter
// buttons' context. Missable counts the flagged ones; online counts none.
export function countByKind(trophies) {
  const counts = { story: 0, missable: 0, collectibles: 0, activities: 0, online: 0 };
  for (const trophy of trophies) {
    if (trophy.missable) counts.missable += 1;
    if (Array.isArray(trophy.kinds)) {
      for (const kind of trophy.kinds) {
        if (kind in counts) counts[kind] += 1;
      }
    }
  }
  return counts;
}
