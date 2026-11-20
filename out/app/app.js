// Boot and wiring for the Leonida Trophy Ledger.
//
// Loads app/data/trophies.json, renders the checklist, the detail pane, the
// roadmap and the missables page, and wires every control: search, kind and
// grade filters, the spoiler setting, export, import and reset. Progress
// lives in localStorage through store.js and never leaves the browser.
//
// Preview parameters, for screenshots and for sharing a view: ?view=roadmap
// | missables | about | tracker, ?open=<trophy id> to open a trophy's guide,
// ?spoilers=on to start with story spoilers hidden, and ?seed=<n> to preview
// the tracker with the first n trophies marked earned (preview only — the
// seed is not saved).

import { loadEarned, saveEarned, toggleEarned, exportEarned, importEarnedFile, resetEarned, countByGrade } from './store.js';
import { applyFilters, isSpoilerHidden } from './filters.js';
import { trophyRowHtml, detailHtml, roadmapHtml, missablesHtml, sourceListHtml, progressText } from './views.js';

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPane');
const listMetaEl = document.getElementById('listMeta');
const emptyNoteEl = document.getElementById('emptyNote');
const searchEl = document.getElementById('searchInput');
const gradeEl = document.getElementById('gradeFilter');
const earnedEl = document.getElementById('earnedFilter');
const kindWrapEl = document.getElementById('kindFilters');
const spoilerEl = document.getElementById('spoilerToggle');

let trophies = [];
let earned = loadEarned();
let selectedId = null;
let spoilersOn = false;
const filters = { kind: 'all', grade: 'all', earnedMode: 'all', query: '' };

async function boot() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  trophies = Array.isArray(data) ? data : data.trophies;

  readPreviewParams();
  renderRoadmap();
  renderMissables();
  renderSources();
  renderAll();
  wireEvents();
}

// The preview parameters from the address bar. ?seed marks the first n
// trophies earned for this view only and is never written to storage.
function readPreviewParams() {
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view) showView(view);
  if (params.get('spoilers') === 'on') {
    spoilersOn = true;
    spoilerEl.checked = true;
  }
  const openId = Number.parseInt(params.get('open') || '', 10);
  if (Number.isInteger(openId) && trophies.some((t) => t.id === openId)) {
    selectedId = openId;
  }
  const seed = Number.parseInt(params.get('seed') || '', 10);
  if (Number.isInteger(seed) && seed > 0) {
    for (const trophy of trophies.slice(0, seed)) earned.add(trophy.id);
  }
  if (!selectedId && trophies.length > 0) selectedId = trophies[0].id;
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
}

function renderProgress() {
  const counts = countByGrade(trophies, earned);
  const { done, total, pct, parts } = progressText(trophies, earned, counts);
  document.getElementById('earnedCount').textContent = String(done);
  document.getElementById('earnedPct').textContent = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('gradeBreakdown').textContent =
    `${parts} — ${total} trophies: 1 platinum, 2 gold, 6 silver, 46 bronze.`;
}

function renderList() {
  const visible = applyFilters(trophies, earned, filters);
  listEl.innerHTML = visible
    .map((trophy) => trophyRowHtml(trophy, earned, spoilersOn, selectedId))
    .join('');
  const shown = visible.length;
  const total = trophies.length;
  listMetaEl.textContent =
    shown === total
      ? `Showing all ${total} trophies.`
      : `Showing ${shown} of ${total} trophies.`;
  emptyNoteEl.hidden = shown !== 0;
}

function renderDetail() {
  const trophy = trophies.find((item) => item.id === selectedId) || null;
  detailEl.innerHTML = detailHtml(trophy, earned, spoilersOn);
}

function renderRoadmap() {
  document.getElementById('roadmapSteps').innerHTML = roadmapHtml();
}

function renderMissables() {
  document.getElementById('missableList').innerHTML = missablesHtml(trophies);
}

function renderSources() {
  document.getElementById('sourceList').innerHTML = sourceListHtml();
}

function showView(name) {
  const known = ['tracker', 'roadmap', 'missables', 'about'];
  const view = known.includes(name) ? name : 'tracker';
  for (const item of known) {
    document.getElementById(`view${cap(item)}`).classList.toggle('is-visible', item === view);
    document.getElementById(`tab${cap(item)}`).classList.toggle('is-active', item === view);
  }
}

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function wireEvents() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  });

  searchEl.addEventListener('input', () => {
    filters.query = searchEl.value;
    renderList();
  });
  gradeEl.addEventListener('change', () => {
    filters.grade = gradeEl.value;
    renderList();
  });
  earnedEl.addEventListener('change', () => {
    filters.earnedMode = earnedEl.value;
    renderList();
  });
  kindWrapEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-kind]');
    if (!button) return;
    filters.kind = button.dataset.kind;
    kindWrapEl.querySelectorAll('.kind').forEach((item) => {
      item.classList.toggle('is-active', item === button);
    });
    renderList();
  });

  spoilerEl.addEventListener('change', () => {
    spoilersOn = spoilerEl.checked;
    renderList();
    renderDetail();
  });

  // Clicking a row selects it; clicking its checkbox toggles earned. The
  // checkbox stop is what keeps one click from doing both.
  listEl.addEventListener('click', (event) => {
    const row = event.target.closest('.trophy-row');
    if (!row) return;
    const id = Number.parseInt(row.dataset.id, 10);
    if (event.target.classList.contains('trophy-check')) {
      toggleEarned(earned, id);
      renderAll();
      return;
    }
    selectedId = id;
    renderList();
    renderDetail();
  });
  listEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const row = event.target.closest('.trophy-row');
    if (!row) return;
    event.preventDefault();
    selectedId = Number.parseInt(row.dataset.id, 10);
    renderList();
    renderDetail();
  });

  detailEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-earn]');
    if (!button) return;
    const id = Number.parseInt(button.dataset.earn, 10);
    toggleEarned(earned, id);
    renderAll();
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    exportEarned(earned, trophies.length);
  });

  document.getElementById('importInput').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const imported = await importEarnedFile(file);
      if (!imported) {
        alert('That file does not look like a trophy progress export.');
        return;
      }
      earned = new Set([...imported].filter((id) => trophies.some((t) => t.id === id)));
      saveEarned(earned);
      renderAll();
    } catch {
      alert('Could not read that file. It needs to be a JSON progress export from this guide.');
    }
    event.target.value = '';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies? This cannot be undone. Export first if you want a backup.')) return;
    earned = resetEarned();
    renderAll();
  });
}

boot();
