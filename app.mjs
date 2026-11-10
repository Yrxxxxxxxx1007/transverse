import { name, words } from './copy.mjs?v=8';
import { icon, sigil } from './icons.mjs';
import { appearance, styles, worldAsset } from './worlds.mjs';
import { applyLocalMove, createLocalRun, decodeLocalRun, encodeLocalRun, exportLocalRun, runKey, sessionView } from './session.mjs';
import { InvalidAction, NOTE_LIMIT } from './engine.mjs';
import { loadRun as loadPractice } from './practice/game.mjs';
import { exportRecord as exportPractice, loadRecord as loadPracticeRecord } from './practice/record.mjs';
import './world-scenes.js';
import './world-actors.js';

const app = document.querySelector('#app');
const announcer = document.querySelector('#announce');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const fromStorage = (key, fallback = null) => { try { return localStorage.getItem(key); } catch { return fallback; } };
function putStorage(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return true;
  } catch { return false; }
}
const basePath = new URL('./', import.meta.url).pathname;
const assetUrl = path => `${basePath}${path}`;
const pageUrl = destination => `${basePath}${destination === '/play' ? '#play' : ''}`;
const drafts = new Map();
let lang = (fromStorage('agii:language') ?? fromStorage('transverse.practice.language')) === 'zh' ? 'zh' : 'en';
let t = words[lang];
let alert = null;
let storedRun = fromStorage(runKey);
let run = null;
try { run = decodeLocalRun(storedRun); } catch { alert = 'unreadableRun'; }
let session = sessionView(run);
let saved = true;
const route = () => location.hash === '#play' && session ? '/play' : '/';
let page = route();
let modal = null;
let checked = false;
let logTab = 'log';
const universeNumber = id => String(id + 1).padStart(2, '0');

function previousPractice() {
  const raw = fromStorage('transverse.practice.run.1');
  if (!raw) return null;
  const state = loadPractice(raw);
  const record = loadPracticeRecord(state.playRecord, state);
  return record.actions.length || record.startedMidRun ? { record, state } : null;
}
const oldPractice = previousPractice();

const brand = () => `<a class="brand" href="${pageUrl('/')}" data-page="/" aria-label="${name}"><img src="${assetUrl('mark.svg')}" width="42" height="42" alt=""><strong>${name}</strong></a>`;
const downloadButton = (label, action = 'download') => `<button class="button secondary" type="button" data-ui="${action}">${label}${icon('download', 16)}</button>`;

function header() {
  const playMenu = page === '/play' && session;
  return `<header class="site-head"><div class="frame head-inner">${brand()}
    ${page === '/' ? `<nav aria-label="${t.home}"><a href="#expeditions">${t.how}</a><a href="#data">${t.data}</a></nav>` : ''}
    <div class="head-tools">${playMenu ? `<button type="button" class="icon-button" data-ui="menu" aria-label="${t.menu}" title="${t.menu}">${icon('menu', 20)}</button>` : ''}
      <div class="language" role="group" aria-label="${t.language}"><button type="button" data-lang="en" lang="en" aria-pressed="${lang === 'en'}">EN</button><button type="button" data-lang="zh" lang="zh-CN" aria-pressed="${lang === 'zh'}">中文</button></div>
    </div></div></header>`;
}

function footer() {
  return `<footer class="site-foot frame"><span><span class="foot-dot"></span>${name}</span></footer>`;
}

function expeditionSteps() {
  const stages = [
    { universe: 'I', scene: 14, iconName: 'compass' },
    { universe: 'I', scene: 14, iconName: 'note' },
    { universe: 'II', scene: 22, iconName: 'orbit' },
  ];
  return stages.map(({ universe, scene, iconName }, index) => `<article class="phase-tile">
    <div class="phase-scene"><img src="${assetUrl(worldAsset(scene))}" alt="" loading="lazy" decoding="async"><div class="phase-coordinates"><span>${icon('orbit', 13)} ${t.universe} ${universe}</span><span class="phase-number">0${index + 1}</span></div></div>
    <div class="phase-content"><h3>${icon(iconName, 18)} ${t.phases[index][0]}</h3><p>${t.phases[index][1]}</p></div>
  </article>`).join('');
}

function home() {
  return `<main id="main" class="frame home-main">
    <section class="hero" aria-labelledby="hero-title"><div class="hero-image"></div><div class="hero-shade"></div><div class="hero-grid"></div>
      <span class="corner top-left"></span><span class="corner top-right"></span><span class="corner bottom-left"></span><span class="corner bottom-right"></span>
      <div class="hero-content"><div class="eyebrow hero-label"><span class="tag-dot"></span>${t.pilot}</div>
        <h1 id="hero-title">${name}</h1><p class="hero-tagline">${t.heroTagline}</p>
        <p class="hero-desc">${t.intro}</p><div class="hero-actions"><button type="button" class="button primary" data-ui="enter">${session ? session.game.phase === 'complete' ? t.report : t.resume : t.start}${icon('arrow', 20)}</button><a class="button secondary" href="#expeditions">${t.howLink}</a></div>
        <ul class="hero-facts"><li>${icon('layers', 16)}${t.roundsMeta}</li><li>${icon('orbit', 16)}${t.worldMeta}</li><li>${icon('monitor', 16)}${t.deviceMeta}</li></ul>
      </div><p class="hero-plate">${t.heroCaption}<span></span></p>
    </section>
    <section class="home-section" id="expeditions"><div class="section-head"><p class="eyebrow">${t.flowKicker}</p><h2>${t.flowTitle}</h2><p>${t.flowIntro}</p></div>
      <div class="phase-grid">${expeditionSteps()}</div>
    </section>
    <div class="home-info"><section class="info-tile" id="help"><p class="eyebrow">${t.helpKicker}</p><h2>${t.helpTitle}</h2><p>${t.helpText}</p></section><section class="info-tile" id="data"><p class="eyebrow">${t.dataKicker}</p><h2>${t.dataTitle}</h2><p>${t.dataText}</p>${oldPractice ? `<div class="legacy-download">${downloadButton(t.downloadPractice, 'download-practice')}</div>` : ''}</section></div>
  </main>`;
}

function pathBar(g) {
  return `<div class="route-track" aria-label="${t.path}"><span class="eyebrow">${t.path}</span><ol>${g.path.map((step, index) => {
    const active = !g.camp && g.stage === index + 1;
    return `<li class="${g.stage > index + 1 ? 'passed' : ''} ${active ? 'current' : ''}" ${active ? 'aria-current="step"' : ''} title="${index + 1}. ${t.pathNames[step]}">${icon(step, 16)}<span class="sr-only">${index + 1}. ${t.pathNames[step]}</span></li>`;
  }).join('')}</ol></div>`;
}

function expeditionBar(g, theme) {
  return `<div class="run-top"><div class="run-title"><div class="world-name"><span class="eyebrow">${icon('orbit', 14)} ${t.universe} ${g.field}</span><span>${theme[lang]}</span><span class="world-coordinate" aria-hidden="true">U–${universeNumber(theme.id)}</span></div><h1>${t.expedition} <span>${String(g.life).padStart(2, '0')}</span><small> / 03</small></h1></div>
    <div class="run-top-right"><div class="life-dots" aria-label="${t.expedition} ${g.life} / 3">${[1,2,3].map(number => `<span class="${number === g.life ? 'current' : number < g.life ? 'passed' : ''}">${number < g.life ? icon('check', 13) : `0${number}`}</span>`).join('')}</div><div class="save-mark" id="save-mark" data-pending="${!saved}"><span class="status-dot"></span><span>${saved ? t.saved : t.temporary}</span></div></div></div>`;
}

function slots(list) {
  return `<dl class="slots">${list.map(slot => `<div><dt>${escape(slot.label)}</dt><dd class="${slot.value === null ? 'unknown' : ''}">${slot.value ?? '?'}</dd></div>`).join('')}</dl>`;
}

function handCard(card, index) {
  return `<button class="hand-card" type="button" data-action="play" data-index="${index}" aria-label="${index + 1}. ${escape(card.name)}, ${t.cost} ${card.cost ?? '?'}">
    <span class="card-top"><kbd>${index + 1}</kbd><span class="card-cost" title="${t.cost}">${card.cost ?? '?'}</span></span>
    <span class="card-sigil">${sigil(card.name)}</span><strong>${escape(card.name)}</strong><span class="card-rule"></span></button>`;
}

const proceduralTheme = { id: 0, palette: { ...styles[0].palette, sky: '#202650', ground: '#78532e', far: '#364f97', near: '#18244d' } };
const drawings = new Map();
function drawing(key, draw) {
  if (!drawings.has(key)) {
    if (drawings.size >= 16) drawings.delete(drawings.keys().next().value);
    drawings.set(key, draw().outerHTML);
  }
  return drawings.get(key);
}

function sceneArt(look) {
  if (look.theme.id !== 0) return `<img src="${assetUrl(worldAsset(look.theme.id))}" alt="" decoding="async" draggable="false">`;
  return drawing(`scene:${look.sceneSeed}`, () => window.AGIIWorldScenes.makeScene(document, proceduralTheme, look.sceneSeed));
}

function portraitArt(look) {
  if (look.actor !== 0) return `<img src="${assetUrl(worldAsset(look.actor, look.form))}" alt="" decoding="async" draggable="false">`;
  return drawing(`actor:${look.figureSeed}:${look.form}`, () => window.AGIIWorldActors.makeFigure(document, proceduralTheme, look.form, look.figureSeed));
}

function combat(g, look) {
  let lastMove;
  for (let i = g.log.length - 1; i >= 0; i--) {
    const row = g.log[i];
    if (row.changes || row.kind === 'noEffect') { lastMove = row; break; }
  }
  return `<section class="combat-block"><div class="arena">
      <div class="arena-visual" aria-hidden="true">${sceneArt(look)}</div><div class="arena-shade"></div>
      <div class="arena-top"><span class="eyebrow"><span class="tag-dot"></span>${g.camp ? t.camp : `${t.pathNames.fight} ${String(g.stage).padStart(2, '0')}`}</span>${g.field === 'II' && g.camp && g.turn === 1 ? `<span class="arrival">${icon('orbit', 14)}${t.arrived}</span>` : ''}<span class="arena-turn">${t.turn} <strong>${String(g.turn).padStart(2, '0')}</strong></span></div>
      <div class="arena-figure" aria-hidden="true">${portraitArt(look)}</div>
      <div class="arena-readouts"><div class="readout"><h2>${t.you}</h2>${slots(g.you)}</div><div class="readout"><h2>${t.subject}${g.name ? ` <span>${escape(g.name)}</span>` : ''}</h2>${slots(g.them)}</div></div>
    </div>
    ${g.camp ? `<div class="camp-line"><span class="camp-count">${t.turnsLeft(g.turnsLeft)}</span><p>${t.campHint}</p></div>` : ''}
    ${lastMove ? `<div class="quick-observation"><ol class="log-list">${logLine(lastMove)}</ol></div>` : ''}
    <div class="hand"><div class="hand-title"><h2>${t.hand}</h2><span>${g.hand.length} / 5</span></div><div class="cards">${g.hand.length ? g.hand.map(handCard).join('') : `<p class="empty-hand">${t.emptyHand}</p>`}</div></div>
    <div class="turn-actions">${g.camp ? `<div class="camp-actions"><button class="button plain" type="button" data-action="reset">${t.reset}</button><button class="button secondary" type="button" data-action="leave">${t.leave}${icon('chevron', 15)}</button></div>` : '<span></span>'}<button class="button primary" type="button" data-action="end">${t.end}${icon('arrow', 18)}</button></div>
  </section>`;
}

function option(kind, index, title, marker) {
  return `<button type="button" class="option" data-action="${kind}" data-index="${index}"><span class="option-icon">${marker}</span><span>${title}</span>${icon('chevron')}</button>`;
}

function stepPanel(look, label, symbol, title, copy, actions) {
  return `<section class="step-panel"><div class="step-art"><div class="step-scene" aria-hidden="true">${sceneArt(look)}</div><span>${icon(symbol, 40)}</span></div><div class="step-content"><div class="eyebrow">${label}</div><h2>${title}</h2><p>${copy}</p>${actions}</div></section>`;
}

const draftKey = g => `agii:draft:${session.id}:${g.life}:${g.stage}:${g.noteKind}`;
function choices(g, look) {
  if (g.phase === 'route') {
    return stepPanel(look, g.guardian ? t.pathNames.gate : t.pathNames.fight, g.guardian ? 'gate' : 'compass', g.guardian ? t.gateTitle : t.routeTitle, g.guardian ? t.gateText : t.routeText,
      `<div class="options">${g.guardian ? option('route', 0, t.gateGo, icon('gate')) : [0, 1].map(i => option('route', i, t.routeOption(i + 1), `0${i + 1}`)).join('')}</div>`);
  }
  if (g.phase === 'rest') return stepPanel(look, t.pathNames.rest, 'rest', t.restTitle, t.restText, `<div class="options">${option('rest', 0, t.restore, icon('rest'))}${option('rest', 1, t.repair, icon('layers'))}</div>`);
  if (g.phase === 'reward') return stepPanel(look, t.hand, 'layers', t.rewardTitle, t.rewardText, `<div class="options">${g.rewards.map((name, index) => option('reward', index, escape(name), sigil(name))).join('')}</div><button class="button plain skip-reward" type="button" data-action="reward" data-index="3">${t.noReward}${icon('chevron', 15)}</button>`);
  const label = g.noteKind === 'life' ? (g.fate ? t.cleared : t.fallen) : g.noteKind === 'camp' ? t.camp : t.pathNames.fight;
  const key = draftKey(g);
  const draft = drafts.get(key) ?? fromStorage(key) ?? '';
  return stepPanel(look, label, 'note', t.noteTitles[g.noteKind], t.noteText[g.noteKind], `<form id="note-form"><label class="sr-only" for="note-input">${t.placeholder}</label>
    <textarea id="note-input" name="text" rows="4" maxlength="${NOTE_LIMIT}" placeholder="${t.placeholder}">${escape(draft)}</textarea>
    <div class="note-actions"><span id="note-count">${draft.length} / ${NOTE_LIMIT}</span><button type="button" class="button plain" data-action="skip">${t.skip}</button><button type="submit" class="button primary">${t.noteSave}${icon('arrow', 17)}</button></div></form>`);
}

function logLine(row) {
  const changes = row.changes?.map(({ label, from, to }) => `<span class="delta"><b>${escape(label)}</b> ${from} <span>→</span> ${to}</span>`).join('');
  const heading = t.logWords[row.kind]?.(row) ?? row.kind;
  return `<li><div class="log-line-title"><span class="log-seq">${String(row.id).padStart(3, '0')}</span><strong>${escape(heading)}</strong></div>${changes ? `<div class="deltas">${changes}</div>` : row.changes ? `<p>${t.noChange}</p>` : ''}</li>`;
}

function notebook(g) {
  const showNotes = logTab === 'notes';
  return `<aside class="notebook" aria-label="${t.log}"><div class="log-tabs"><button type="button" data-tab="log" aria-pressed="${!showNotes}">${icon('layers', 17)}${t.log}</button><button type="button" data-tab="notes" aria-pressed="${showNotes}">${icon('note', 17)}${t.notes}${g.carried.length ? `<sup>${g.carried.length}</sup>` : ''}</button></div>
    <div class="log-scroll" id="log-scroll" tabindex="0" aria-label="${showNotes ? t.notes : t.log}">${showNotes ? `<div class="carried-notes">${g.carried.length ? g.carried.map(note => `<article><span class="eyebrow">${t.expedition} ${note.life} / ${t.noteTitles[note.kind]}</span><p>${escape(note.text)}</p></article>`).join('') : `<p>${t.noNotes}</p>`}</div>` : `<ol class="log-list">${g.log.map(logLine).join('')}</ol>`}</div>
  </aside>`;
}

function completion(g) {
  return `<section class="complete-panel"><div class="complete-sigil">${icon('compass', 55)}</div><p class="eyebrow">${t.completeTag}</p><h1>${t.completeTitle}</h1><p>${t.completeText}</p><div class="result-grid">${g.lives.map((life, index) => `<article><span class="eyebrow">${t.expedition} 0${index + 1}</span><strong>${life.cleared ? t.cleared : t.fallen}</strong><small>${t.reached(life.reached)}</small></article>`).join('')}</div>
    <div class="run-id">${t.runId} <code>${escape(session.id)}</code><span>·</span>${t.moves} <strong>${session.version}</strong></div><div class="complete-actions"><a class="button secondary" href="${pageUrl('/')}" data-page="/">${t.back}</a>${downloadButton(t.downloadRecord)}<button type="button" class="button primary" data-ui="new">${t.replay}${icon('arrow', 18)}</button></div></section>`;
}

function playPage() {
  const g = session?.game;
  if (!g) return home();
  const look = appearance(session.id, g);
  const { theme } = look;
  return `<div class="world-shell" data-world="${theme.id}" data-family="${theme.family}" data-layout="${theme.layout}" data-type="${theme.type}"><main id="main" class="frame game-main">${g.phase === 'complete' ? completion(g) : `${expeditionBar(g, theme)}${pathBar(g)}<div class="game-grid">${g.phase === 'combat' ? combat(g, look) : choices(g, look)}${notebook(g)}</div>`}</main></div>`;
}

function dialog() {
  if (!modal) return '';
  let inner;
  if (modal === 'consent') inner = `<p class="eyebrow">${t.consentTag}</p><h2 id="dialog-title">${t.consentTitle}</h2><p>${t.consentBody}</p><p>${t.consentVoluntary}</p>
    ${session?.game.phase === 'complete' ? `<p>${t.replaceRun}</p>` : ''}
    <form id="consent-form"><label class="check-label"><input type="checkbox" name="consent" ${checked ? 'checked' : ''} required><span>${t.consentCheck}</span></label><div class="dialog-actions"><button type="button" class="button secondary" data-ui="close">${t.cancel}</button>
    <button class="button primary" type="submit" ${checked ? '' : 'disabled'}>${t.consentAccept}${icon('arrow')}</button></div></form>`;
  if (modal === 'menu') inner = `<p class="eyebrow">${name}</p><h2 id="dialog-title">${t.menu}</h2><div class="menu-options"><a class="button secondary" href="${pageUrl('/')}" data-page="/">${t.pause}${icon('arrow')}</a>${downloadButton(t.downloadRecord)}<button class="button plain danger-text" type="button" data-ui="ask-withdraw">${t.withdraw}</button></div>`;
  if (modal === 'withdraw') inner = `<p class="eyebrow">${t.data}</p><h2 id="dialog-title">${t.withdrawTitle}</h2><p>${t.withdrawBody}</p><div class="dialog-actions"><button class="button secondary" type="button" data-ui="close">${t.cancel}</button><button class="button danger" type="button" data-ui="withdraw">${t.withdraw}</button></div>`;
  return `<dialog id="modal" aria-labelledby="dialog-title"><button class="icon-button dialog-close" type="button" data-ui="close" aria-label="${t.close}">${icon('cross')}</button>${inner}${alert ? `<p class="dialog-alert" role="status">${t[alert]}</p>` : ''}</dialog>`;
}

function render() {
  t = words[lang];
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = name;
  const oldScroll = document.querySelector('#log-scroll');
  const scrollTop = oldScroll?.scrollTop ?? 0;
  const nearBottom = !oldScroll || oldScroll.scrollHeight - oldScroll.clientHeight - scrollTop < 35;
  const content = page === '/play' ? playPage() : home();
  const message = alert && !modal ? t[alert] : !saved && session ? t.saveUnavailable : '';
  app.innerHTML = `${header()}${message ? `<div class="frame flash" role="status">${message}</div>` : ''}${content}${footer()}${dialog()}`;
  const current = document.querySelector('#log-scroll');
  if (current && logTab === 'log') current.scrollTop = nearBottom ? current.scrollHeight : scrollTop;
  const shown = document.querySelector('#modal');
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
  logTab = 'log';
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
    saved = true;
    alert = 'outOfSync';
    modal = null;
    if (!run && page === '/play') {
      history.replaceState(null, '', pageUrl('/'));
      page = '/';
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
  if (previous && saved) clearDrafts(previous);
  go('/play');
}

function move(kind, fields = {}) {
  if (!session || modal || refreshLocalRun()) return;
  const game = session.game;
  alert = null;
  try {
    saveRun(applyLocalMove(run, { kind, ...fields }, lang));
    if (kind === 'note') {
      const key = draftKey(game);
      drafts.delete(key);
      if (saved) putStorage(key, null);
    }
    const log = session.game.log;
    const last = log[log.length - 1];
    if (last) announcer.textContent = t.logWords[last.kind]?.(last) ?? '';
    if (game.life !== session.game.life) logTab = session.game.carried.length ? 'notes' : 'log';
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

app.addEventListener('click', event => {
  const control = event.target.closest('button, a');
  if (!control || control.disabled) return;
  const d = control.dataset;
  if (d.lang) { lang = d.lang; putStorage('agii:language', lang); render(); }
  else if (d.page && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); go(d.page); }
  else if (d.tab) { logTab = d.tab; render(); }
  else if (d.action === 'skip') move('note', { text: '' });
  else if (d.action) move(d.action, d.index === undefined ? {} : { index: Number(d.index) });
  else if (d.ui === 'download' && run) downloadRecord();
  else if (d.ui === 'download-practice' && oldPractice) downloadRecord(true);
  else if (d.ui === 'withdraw') withdraw();
  else if (d.ui === 'enter' && session) go('/play');
  else if (d.ui) {
    alert = null;
    if (d.ui === 'new' || d.ui === 'enter') { modal = 'consent'; checked = false; }
    else if (d.ui === 'menu') modal = 'menu';
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
