import { name, words } from './copy.mjs?v=9';
import { boardPresentation, createBoard } from './board.mjs';
import { installCroppedArt } from './archive-ui/cropped-art.mjs';
import { applyLocalMove, createLocalRun, decodeLocalRun, encodeLocalRun, exportLocalRun, observedStep, runKey, sessionView } from './session.mjs?v=9';
import { InvalidAction, NOTE_LIMIT } from './engine.mjs';
import { loadRun as loadPractice } from './practice/game.mjs';
import { exportRecord as exportPractice, loadRecord as loadPracticeRecord } from './practice/record.mjs';
import './world-scenes.js';
import './world-actors.js';
import './archive-ui/classic-art.js';
import './archive-ui/world-themes.js';
import './archive-ui/game-view.js';

const app = document.querySelector('#app');
const announcer = document.querySelector('#announce');
const fromStorage = (key, fallback = null) => { try { return localStorage.getItem(key); } catch { return fallback; } };
function putStorage(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return true;
  } catch { return false; }
}
const basePath = new URL('./', import.meta.url).pathname;
const assetUrl = path => `${basePath}${path}?v=9`;
const pageUrl = destination => `${basePath}${destination === '/play' ? '#play' : ''}`;
installCroppedArt(assetUrl);
const board = createBoard(app);
const drafts = new Map();
let rawDraft = '';
let lang = (fromStorage('agii:language') ?? fromStorage('transverse.practice.language')) === 'zh' ? 'zh' : 'en';
let t = words[lang];
let alert = null;
let storedRun = fromStorage(runKey);
let run = null;
try { run = decodeLocalRun(storedRun); } catch { alert = 'unreadableRun'; }
let session = sessionView(run);
let entries = run ? exportLocalRun(run).actions : [];
let saved = true;
const route = () => location.hash === '#play' && session ? '/play' : '/';
let page = route();
let modal = null;
let checked = false;
let setupOpen = page === '/' || session?.game.phase === 'complete';
const draftKey = game => `agii:draft:${session.id}:${game.life}:${game.stage}:${game.noteKind}`;

function previousPractice() {
  const raw = fromStorage('transverse.practice.run.1');
  if (!raw) return null;
  const state = loadPractice(raw);
  const record = loadPracticeRecord(state.playRecord, state);
  return record.actions.length || record.startedMidRun ? { record, state } : null;
}
const oldPractice = previousPractice();

function dialog() {
  if (!modal) return '';
  const cancel = `<button class="key" type="button" data-ui="close">${t.cancel}</button>`;
  const inner = modal === 'consent' ? `<h2 id="dialog-title">${t.consentTitle}</h2><p>${t.consentBody}</p><p>${t.consentVoluntary}</p>
    ${session?.game.phase === 'complete' ? `<p>${t.replaceRun}</p>` : ''}
    <form id="consent-form"><label class="check"><input type="checkbox" name="consent" ${checked ? 'checked' : ''} required><span>${t.consentCheck}</span></label>
    <div class="setup-footer">${cancel}<button class="key primary" type="submit" ${checked ? '' : 'disabled'}>${t.consentAccept}</button></div></form>`
    : `<h2 id="dialog-title">${t.withdrawTitle}</h2><p>${t.withdrawBody}</p><div class="setup-footer">${cancel}<button class="key primary" type="button" data-ui="withdraw">${t.withdraw}</button></div>`;
  return `<dialog class="web-modal bevel" id="modal" aria-labelledby="dialog-title">${inner}${alert ? `<p role="status">${t[alert]}</p>` : ''}</dialog>`;
}

function render() {
  t = words[lang];
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = name;
  const playing = page === '/play' && !!session;
  const key = playing && session.game.phase === 'note' ? draftKey(session.game) : null;
  const draft = key ? drafts.get(key) ?? fromStorage(key) ?? '' : '';
  const message = alert && !modal ? t[alert] : !saved && session ? t.saveUnavailable : '';
  board.render({ session, playing, setupOpen, message, entries, oldPractice, draft, raw: rawDraft, lang, t });
  app.querySelector('#dialog-root').innerHTML = dialog();
  const shown = app.querySelector('#modal');
  if (shown) {
    if (typeof shown.showModal === 'function') shown.showModal();
    else shown.setAttribute('open', '');
    shown.addEventListener('cancel', event => { event.preventDefault(); modal = null; alert = null; render(); });
  }
}

function go(destination, push = true, message = null) {
  if (push && destination !== page) history.pushState(null, '', pageUrl(destination));
  page = destination;
  alert = message;
  modal = null;
  setupOpen = page === '/' || session?.game.phase === 'complete';
  rawDraft = '';
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function refreshLocalRun() {
  const current = fromStorage(runKey, storedRun);
  if (current === storedRun) return false;
  storedRun = current;
  try {
    run = decodeLocalRun(current);
    session = sessionView(run);
    entries = run ? exportLocalRun(run).actions : [];
    rawDraft = '';
    saved = true;
    alert = 'outOfSync';
    modal = null;
    if (!run && page === '/play') {
      history.replaceState(null, '', pageUrl('/'));
      page = '/';
      setupOpen = true;
    }
  } catch { alert = 'unreadableRun'; }
  render();
  return true;
}

function saveRun(next) {
  const raw = encodeLocalRun(next);
  saved = putStorage(runKey, raw);
  if (saved) storedRun = raw;
  run = next;
  session = sessionView(run);
}

function clearDrafts(id) {
  const prefix = `agii:draft:${id}:`;
  for (const key of drafts.keys()) if (key.startsWith(prefix)) drafts.delete(key);
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) putStorage(key, null);
  } catch { /* storage unavailable */ }
}

function start() {
  if (!checked || modal !== 'consent' || refreshLocalRun()) return;
  if (session && session.game.phase !== 'complete') { go('/play'); return; }
  const previous = session?.id;
  saveRun(createLocalRun(lang));
  entries = [];
  if (previous && saved) clearDrafts(previous);
  go('/play');
}

function move(kind, fields = {}) {
  if (!session || modal || refreshLocalRun()) return;
  const game = session.game;
  const input = { kind, ...fields };
  alert = null;
  try {
    saveRun(applyLocalMove(run, input, lang, boardPresentation(session.id, game)));
    entries.push(observedStep(input, game, session.game));
    rawDraft = '';
    if (kind === 'note') {
      const key = draftKey(game);
      drafts.delete(key);
      if (saved) putStorage(key, null);
    }
    const log = session.game.log;
    const last = log[log.length - 1];
    if (last) announcer.textContent = t.logWords[last.kind]?.(last) ?? '';
    if (session.game.phase === 'complete') setupOpen = true;
  } catch (error) { alert = error instanceof InvalidAction ? 'invalid' : 'actionFailed'; }
  render();
}

function withdraw() {
  if (!session || refreshLocalRun()) return;
  if (storedRun !== null && !putStorage(runKey, null)) {
    alert = 'deleteFailed';
    render();
    return;
  }
  clearDrafts(session.id);
  storedRun = null;
  run = null;
  session = null;
  entries = [];
  saved = true;
  go('/', true, 'withdrawDone');
}

function downloadRecord(previous = false) {
  try {
    const data = previous ? exportPractice(oldPractice.record, oldPractice.state) : exportLocalRun(run);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `transverse-${data.runId}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  } catch { alert = 'downloadFailed'; render(); }
}

function enterCommand(text) {
  const raw = text.trim().toLowerCase();
  if (!raw || !session || modal) return;
  const choices = [...app.querySelectorAll('#choices [data-action]')];
  const commands = [...app.querySelectorAll('#commands [data-action]')];
  const choice = /^\d+$/.test(raw) ? choices[Number(raw) - 1]
    : [...choices, ...commands].find(button => button.dataset.raw.toLowerCase() === raw || button.title.toLowerCase() === raw);
  if (choice) {
    const { action, index } = choice.dataset;
    move(action, index === undefined ? {} : { index: Number(index) });
  } else {
    alert = 'invalid';
    render();
  }
  app.querySelector('#rawInput')?.focus({ preventScroll: true });
}

app.addEventListener('click', event => {
  const control = event.target.closest('button');
  if (!control || control.disabled) return;
  const d = control.dataset;
  if (d.lang) { lang = d.lang; putStorage('agii:language', lang); render(); }
  else if (d.action === 'skip') move('note', { text: '' });
  else if (d.action) move(d.action, d.index === undefined ? {} : { index: Number(d.index) });
  else if (d.ui === 'download' && run) downloadRecord();
  else if (d.ui === 'download-practice' && oldPractice) downloadRecord(true);
  else if (d.ui === 'withdraw') withdraw();
  else if (d.ui === 'enter' && session) go('/play');
  else if (d.ui === 'quit') go('/');
  else if (d.ui === 'latest') board.latest();
  else if (d.ui) {
    alert = null;
    if (d.ui === 'new' || d.ui === 'enter') { modal = 'consent'; checked = false; }
    else if (d.ui === 'setup') setupOpen = !setupOpen;
    else if (d.ui === 'ask-withdraw') modal = 'withdraw';
    else if (d.ui === 'close') modal = null;
    render();
  }
});

app.addEventListener('change', event => {
  if (event.target.matches('#consent-form input')) {
    checked = event.target.checked;
    app.querySelector('#consent-form button[type="submit"]').disabled = !checked;
  }
});
app.addEventListener('input', event => {
  if (event.target.id === 'rawInput') { rawDraft = event.target.value; return; }
  if (event.target.id !== 'note-input') return;
  const text = event.target.value;
  const key = draftKey(session.game);
  drafts.set(key, text);
  putStorage(key, text);
  document.querySelector('#note-count').textContent = `${text.length} / ${NOTE_LIMIT}`;
});
app.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'consent-form') start();
  if (event.target.id === 'note-form') move('note', { text: new FormData(event.target).get('text') });
  if (event.target.id === 'rawForm') enterCommand(event.target.querySelector('input').value);
});
document.addEventListener('keydown', event => {
  if (page !== '/play' || session?.game.phase !== 'combat' || modal || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('input, textarea, select, button, a, [contenteditable]')) return;
  if (/^[1-5]$/.test(event.key) && Number(event.key) <= session.game.hand.length) {
    event.preventDefault(); move('play', { index: Number(event.key) - 1 });
  } else if (event.code === 'Space') {
    event.preventDefault(); move('end');
  }
});
window.addEventListener('popstate', () => { if (route() !== page) go(route(), false); });
window.addEventListener('storage', event => { if (event.key === runKey || event.key === null) refreshLocalRun(); });

render();
