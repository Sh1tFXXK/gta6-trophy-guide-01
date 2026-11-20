// Views: everything the reader sees — the checklist rows, the detail pane
// with a trophy's guide and its sources, the roadmap steps, the missables
// page and the source directory. All markup is built from the trophy data;
// no HTML is fetched or pasted in from anywhere else.

import { SOURCES, ROADMAP_STAGES, KIND_LABELS } from './sources.js';
import { isSpoilerHidden, spoilerMask } from './filters.js';

// Escape text that came from data before it goes into HTML, so a stray
// character in a trophy name can never break the page.
export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

// One checklist row: checkbox, medal dot, name, official description and
// tags for kind, missable and hidden. A spoiler-hidden trophy shows the
// mask instead of its real name and description.
export function trophyRowHtml(trophy, earned, spoilersOn, selectedId) {
  const hidden = isSpoilerHidden(trophy, spoilersOn, earned);
  const shown = hidden ? spoilerMask(trophy) : trophy;
  const isEarned = earned.has(trophy.id);
  const classes = ['trophy-row'];
  if (isEarned) classes.push('is-earned');
  if (trophy.id === selectedId) classes.push('is-selected');

  const tags = [];
  if (trophy.missable) tags.push('<span class="tag missable">Missable</span>');
  if (Array.isArray(trophy.kinds)) {
    for (const kind of trophy.kinds) {
      const label = KIND_LABELS[kind];
      if (label) tags.push(`<span class="tag ${kind === 'story' ? 'story' : kind === 'collectibles' ? 'collect' : ''}">${escapeHtml(label)}</span>`);
    }
  }
  if (trophy.hidden) tags.push('<span class="tag">Hidden on PSN</span>');

  return `<li class="${classes.join(' ')}" data-id="${trophy.id}" tabindex="0" role="button"
      aria-pressed="${isEarned}" aria-label="${escapeHtml(shown.name)}">
    <input type="checkbox" class="trophy-check" data-id="${trophy.id}"
      ${isEarned ? 'checked' : ''} aria-label="Mark ${escapeHtml(shown.name)} as earned">
    <span class="medal ${escapeHtml(trophy.grade)}" title="${escapeHtml(gradeLabel(trophy.grade))}"></span>
    <span>
      <span class="trophy-name">${escapeHtml(shown.name)}${trophy.hidden ? ' <span class="hidden-mark">(hidden)</span>' : ''}</span>
      <span class="trophy-desc">${escapeHtml(shown.description)}</span>
      <span class="trophy-tags">${tags.join('')}</span>
    </span>
    <span class="grade-label">${escapeHtml(gradeLabel(trophy.grade))}</span>
  </li>`;
}

// The detail pane: official name, description and grade, the guide in our
// own words, what it needs (count, stage, when it can be missed) and the
// sources the guide draws on, each named and linked where we have a link.
export function detailHtml(trophy, earned, spoilersOn) {
  if (!trophy) {
    return `<p class="detail-empty">Pick a trophy from the list to see its guide,
      its sources and when it can be missed. Tick the box to mark it earned.</p>`;
  }
  const hidden = isSpoilerHidden(trophy, spoilersOn, earned);
  const shown = hidden ? spoilerMask(trophy) : trophy;
  const isEarned = earned.has(trophy.id);

  const facts = [];
  if (trophy.count) facts.push(`<dt>Count</dt><dd>${escapeHtml(trophy.count)}</dd>`);
  if (trophy.stage) facts.push(`<dt>Roadmap step</dt><dd>Step ${trophy.stage} — ${escapeHtml(stageName(trophy.stage))}</dd>`);
  if (trophy.missable) {
    facts.push('<dt>Missable?</dt><dd><strong>Yes — possibly.</strong> See the Missables tab before you leave Chapter 1.</dd>');
  } else if (trophy.kinds && trophy.kinds.includes('story')) {
    facts.push('<dt>Missable?</dt><dd>No. Story trophies pop automatically and cannot be missed.</dd>');
  } else {
    facts.push('<dt>Missable?</dt><dd>No. It can still be earned in free roam after the story.</dd>');
  }

  const sourceItems = (trophy.sources || ['exophase', 'psnprofiles'])
    .map((key) => sourceLine(key))
    .join('');

  return `<h2>${escapeHtml(shown.name)}</h2>
    <p class="official"><strong>Official description:</strong> ${escapeHtml(shown.description)}<br>
    <strong>Grade:</strong> ${escapeHtml(gradeLabel(trophy.grade))}${trophy.hidden ? ' &middot; Hidden on PlayStation until earned' : ''}</p>
    <div class="sources-box">
      <h3>Sources for this guide</h3>
      <ul>${sourceItems}</ul>
      <p>Guide text is written in our own words for this guide. Sources are cited, never copied. Official names and descriptions are shown as PlayStation publishes them.</p>
    </div>
    <div class="detail-guide">${guideParagraphs(hidden ? null : trophy.guide)}</div>
    <dl class="detail-meta">${facts.join('')}</dl>
    <button type="button" class="earn-btn${isEarned ? ' earned' : ''}" data-earn="${trophy.id}">
      ${isEarned ? 'Earned — tap to unmark' : 'Mark as earned'}
    </button>`;
}

function stageName(stage) {
  return (
    {
      1: 'Story and optional missions',
      2: '100% Completion checklist',
      3: 'Strangers & Freaks and cleanup',
    }[stage] || 'Cleanup'
  );
}

// Split the guide text into paragraphs on blank lines; a hidden trophy's
// guide stays hidden with it.
function guideParagraphs(guide) {
  if (!guide) {
    return '<p>This story trophy is hidden until you earn it. Turn the spoiler setting off to read its guide.</p>';
  }
  return guide
    .split(/\n\s*\n/)
    .map((para) => `<p>${escapeHtml(para.trim())}</p>`)
    .join('');
}

// One source line: a link when we have a verified URL, plain text when we
// only have the name. Never invent a link.
function sourceLine(key) {
  const source = SOURCES[key];
  if (!source) return '';
  if (source.url) {
    return `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a></li>`;
  }
  return `<li>${escapeHtml(source.name)}</li>`;
}

// The roadmap view: the three steps with their points and the trophies
// each step clears.
export function roadmapHtml() {
  return ROADMAP_STAGES.map(
    (stage) => `<li>
      <h3>${escapeHtml(stage.title)}</h3>
      <p class="step-time">${escapeHtml(stage.time)}</p>
      <ul>${stage.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
      <p class="step-trophies"><strong>Clears:</strong> ${escapeHtml(stage.trophies)}</p>
    </li>`,
  ).join('');
}

// The missables view: the one possibly-missable trophy in full, with its
// warning, plus a note that nothing else is known to be missable.
export function missablesHtml(trophies) {
  const flagged = trophies.filter((trophy) => trophy.missable);
  if (flagged.length === 0) {
    return '<p>No trophy in this list is flagged missable.</p>';
  }
  return flagged
    .map(
      (trophy) => `<article class="missable-card">
        <h3>${escapeHtml(trophy.name)} — possibly missable</h3>
        <p class="official"><strong>Official description:</strong> ${escapeHtml(trophy.description)}</p>
        <div class="detail-guide">${guideParagraphs(trophy.guide)}</div>
        <p class="cite-line">Sources: ${trophy.sources.map((key) => escapeHtml(SOURCES[key]?.name || key)).join('; ')}.</p>
      </article>
      <p>Every other trophy can still be earned in free roam after the story, according to PowerPyx and Sixshore — no other missable is known at the time of writing.</p>`,
    )
    .join('');
}

// The source directory on the About tab: every source once, with its link
// where we have one.
export function sourceListHtml() {
  return Object.values(SOURCES)
    .map((source) =>
      source.url
        ? `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a></li>`
        : `<li>${escapeHtml(source.name)}</li>`,
    )
    .join('');
}

// Header progress: earned count, percentage and the per-grade breakdown.
export function progressText(trophies, earned, counts) {
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const parts = ['platinum', 'gold', 'silver', 'bronze']
    .filter((grade) => counts[grade])
    .map((grade) => `${counts[grade].earned}/${counts[grade].total} ${grade}`)
    .join(' · ');
  return { done, total, pct, parts };
}
