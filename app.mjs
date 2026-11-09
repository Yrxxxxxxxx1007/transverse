import { consentVersion, name, words } from './copy.mjs?v=7';
import { icon, sigil } from './icons.mjs';
import { appearance, styles, worldAsset } from './worlds.mjs';
import './world-scenes.js';
import './world-actors.js';

const app = document.querySelector('#app');
const announcer = document.querySelector('#announce');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const fromStorage = key => { try { return localStorage.getItem(key); } catch { return null; } };
const putStorage = (key, value) => { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* optional preference */ } };
const backend = document.querySelector('meta[name="agii-api"]')?.content ?? '';
const basePath = new URL('./', import.meta.url).pathname;
const route = () => backend ? location.hash === '#play' ? '/play' : '/' : location.pathname;
const pageUrl = destination => backend ? destination === '/research' ? `${backend}/research` : `${basePath}${destination === '/play' ? '#play' : ''}` : destination;
const playTokenKey = `agii:session:${basePath}`;
const startKeyStorage = `agii:pending-start:${basePath}`;
let playToken = backend ? fromStorage(playTokenKey) : null;
let startKey = fromStorage(startKeyStorage);
let sessionEpoch = 0;
let lang = fromStorage('agii:language') === 'zh' ? 'zh' : 'en';
let t = words[lang];
let page = route();
let session = null;
let busy = false;
let loading = !backend || !!playToken;
let alert = null;
let modal = null;
let checked = false;
let entryError = null;
let logTab = 'log';
let research = null;
let researchError = null;
let listingRuns = false;
let runDetail = null;
let exporting = false;
const universeNumber = id => String(id + 1).padStart(2, '0');

const brand = () => `<a class="brand" href="${pageUrl('/')}" data-page="/" aria-label="${name}"><img src="${basePath}mark.svg" width="42" height="42" alt=""><strong>${name}</strong></a>`;

function header() {
  const playMenu = page === '/play' && session;
  return `<header class="site-head"><div class="frame head-inner">${brand()}
    ${page === '/' ? `<nav aria-label="${t.home}"><a href="#expeditions">${t.how}</a><a href="#data">${t.data}</a></nav>` : page === '/research' ? `<span class="head-location">${t.research}</span>` : ''}
    <div class="head-tools">${playMenu ? `<button type="button" class="icon-button" data-ui="menu" aria-label="${t.menu}" title="${t.menu}">${icon('menu', 20)}</button>` : ''}
      <div class="language" role="group" aria-label="${t.language}"><button type="button" data-lang="en" lang="en" aria-pressed="${lang === 'en'}">EN</button><button type="button" data-lang="zh" lang="zh-CN" aria-pressed="${lang === 'zh'}">中文</button></div>
    </div></div></header>`;
}

function footer() {
  return `<footer class="site-foot frame"><span><span class="foot-dot"></span>${name}</span><a href="${pageUrl('/research')}" ${backend ? '' : 'data-page="/research"'}>${t.research}${icon('diagonal', 14)}</a></footer>`;
}

function expeditionSteps() {
  const stages = [
    { universe: 'I', scene: 14, iconName: 'compass' },
    { universe: 'I', scene: 14, iconName: 'note' },
    { universe: 'II', scene: 22, iconName: 'orbit' },
  ];
  return stages.map(({ universe, scene, iconName }, index) => `<article class="phase-tile">
    <div class="phase-scene"><img src="${basePath}${worldAsset(scene)}" alt="" loading="lazy" decoding="async"><div class="phase-coordinates"><span>${icon('orbit', 13)} ${t.universe} ${universe}</span><span class="phase-number">0${index + 1}</span></div></div>
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
    <div class="home-info"><section class="info-tile" id="help"><p class="eyebrow">${t.helpKicker}</p><h2>${t.helpTitle}</h2><p>${t.helpText}</p></section><section class="info-tile" id="data"><p class="eyebrow">${t.dataKicker}</p><h2>${t.dataTitle}</h2><p>${t.dataText}</p></section></div>
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
    <div class="run-top-right"><div class="life-dots" aria-label="${t.expedition} ${g.life} / 3">${[1,2,3].map(number => `<span class="${number === g.life ? 'current' : number < g.life ? 'passed' : ''}">${number < g.life ? icon('check', 13) : `0${number}`}</span>`).join('')}</div><div class="save-mark" id="save-mark"><span class="status-dot"></span><span>${busy ? t.saving : t.saved}</span></div></div></div>`;
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
  if (look.theme.id !== 0) return `<img src="${basePath}${worldAsset(look.theme.id)}" alt="" decoding="async" draggable="false">`;
  return drawing(`scene:${look.sceneSeed}`, () => window.AGIIWorldScenes.makeScene(document, proceduralTheme, look.sceneSeed));
}

function portraitArt(look) {
  if (look.actor !== 0) return `<img src="${basePath}${worldAsset(look.actor, look.form)}" alt="" decoding="async" draggable="false">`;
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
  const draft = fromStorage(draftKey(g)) ?? '';
  return stepPanel(look, label, 'note', t.noteTitles[g.noteKind], t.noteText[g.noteKind], `<form id="note-form"><label class="sr-only" for="note-input">${t.placeholder}</label>
    <textarea id="note-input" name="text" rows="4" maxlength="800" placeholder="${t.placeholder}">${escape(draft)}</textarea>
    <div class="note-actions"><span id="note-count">${draft.length} / 800</span><button type="button" class="button plain" data-action="skip">${t.skip}</button><button type="submit" class="button primary">${t.noteSave}${icon('arrow', 17)}</button></div></form>`);
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
    <div class="run-id">${t.runId} <code>${escape(session.id)}</code><span>·</span>${t.moves} <strong>${session.version}</strong></div><div class="complete-actions"><a class="button secondary" href="${pageUrl('/')}" data-page="/">${t.back}</a><button type="button" class="button primary" data-ui="new">${t.replay}${icon('arrow', 18)}</button></div></section>`;
}

function playPage() {
  const g = session?.game;
  if (!g) return loading ? `<main class="frame loading" role="status">${t.loading}</main>` : home();
  const look = appearance(session.id, g);
  const { theme } = look;
  return `<div class="world-shell" data-world="${theme.id}" data-family="${theme.family}" data-layout="${theme.layout}" data-type="${theme.type}"><main id="main" class="frame game-main">${g.phase === 'complete' ? completion(g) : `${expeditionBar(g, theme)}${pathBar(g)}<div class="game-grid">${g.phase === 'combat' ? combat(g, look) : choices(g, look)}${notebook(g)}</div>`}</main></div>`;
}

function dateText(value, precise = false) {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', { dateStyle: 'medium', timeStyle: precise ? 'medium' : 'short' }).format(new Date(value));
}

function researchEvent(event) {
  const { input, outcome, before, observedBefore, log } = event.payload;
  const label = t.researchOps[event.action] ?? event.action;
  const place = [`${t.expedition} ${before.life}`, before.role === 'camp' ? t.camp : `${t.stop} ${before.stage}`];
  if (before.turn != null) place.push(`${t.turn} ${before.turn}`);
  let choice = '';
  if (event.action === 'play') choice = observedBefore?.hand?.[input.index]?.name ?? '';
  if (event.action === 'route') choice = t.routeOption(input.index + 1);
  if (event.action === 'rest') choice = input.index === 0 ? t.restore : t.repair;
  if (event.action === 'reward') choice = observedBefore?.rewards?.[input.index] ?? t.noReward;
  const note = outcome?.note?.text;
  return `<details class="event-row"><summary><code>#${event.seq}</code><strong>${escape(label)}${choice ? ` · ${escape(choice)}` : ''}</strong><span>${escape(place.join(' / '))}</span><time datetime="${escape(event.at)}">${dateText(event.at, true)}</time></summary>
    <div class="event-content"><p class="event-meta">${event.lang === 'zh' ? '中文' : 'EN'}${before.mechanic ? ` · ${t.encounterRule} <code>${escape(before.mechanic)}</code>` : ''}</p>
    ${note ? `<h4>${t.noteRecorded}</h4><p class="event-note">${escape(note)}</p>` : ''}
    ${log?.length ? `<h4>${t.observedChanges}</h4><ol class="log-list">${log.map(logLine).join('')}</ol>` : ''}
    <details class="event-raw"><summary>${t.rawData}</summary><pre>${escape(JSON.stringify(event.payload, null, 2))}</pre></details></div></details>`;
}

function detailPanel() {
  if (!runDetail) return '';
  const { id, session: selected, events, next, loading, error } = runDetail;
  return `<section id="run-detail" class="research-table run-detail" tabindex="-1"><div class="run-detail-head"><div><h2>${t.runDetails}</h2><code>${escape(id)}</code></div><div><button class="button plain" type="button" data-ui="refresh-run" ${loading ? 'disabled' : ''}>${t.refresh}</button><button class="button secondary" type="button" data-ui="close-run">${t.close}</button></div></div>
    ${error ? `<p role="status">${t[error]}</p>` : ''}
    ${selected ? `<p class="event-meta">${t.startedAt} ${dateText(selected.created_at)} · ${t.moves} ${selected.actions} · ${selected.completed_at ? t.finished : t.active}</p>
      ${events.length ? `<div class="event-list">${events.map(researchEvent).join('')}</div>` : `<p>${t.noActions}</p>`}
      ${next !== null ? `<button class="button secondary more-records" type="button" data-ui="more-actions" ${loading ? 'disabled' : ''}>${t.moreActions}</button>` : ''}` : ''}
    ${loading ? `<p role="status">${t.loading}</p>` : ''}</section>`;
}

function researchPage() {
  const stats = research?.summary;
  return `<main id="main" class="frame research-main"><div class="section-head"><p class="eyebrow">${t.researchTag}</p><h1>${t.researchTitle}</h1><p>${t.researchBody}</p></div>
    ${researchError === 'sign_in' ? `<div class="info-tile"><p>${t.signInText}</p><a class="button primary" href="/signin-with-chatgpt?return_to=%2Fresearch" target="_top">${t.signIn}${icon('diagonal')}</a></div>` : researchError === 'owner_only' ? `<div class="info-tile">${t.ownerOnly}</div>` : ''}
    ${stats ? `<div class="stat-grid">${[[t.totalSessions, stats.started], [t.totalComplete, stats.completed], [t.totalMoves, stats.actions], [t.languageSplit, `中文 ${stats.zh} / EN ${stats.en}`]].map(([label, value]) => `<div class="stat-tile"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>
      <div class="research-actions"><button class="button primary" type="button" data-export="sessions">${icon('download', 17)}${t.csv}</button><button class="button secondary" type="button" data-export="events">${icon('download', 17)}${t.jsonl}</button><button class="button plain" type="button" data-ui="refresh">${t.refresh}</button></div>
      <section class="research-table"><h2>${t.recent}</h2>${research.recent.length ? `<div class="table-scroll"><table><thead><tr>${[t.session, t.status, t.expedition, t.moves, t.language, t.updated, t.viewDetails].map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${research.recent.map(row => `<tr><td><code title="${escape(row.id)}">${escape(row.id.slice(0, 8))}</code></td><td>${row.completed_at ? t.finished : t.active}</td><td>${row.life} / 3</td><td>${row.actions}</td><td>${row.start_lang === 'zh' ? '中文' : 'EN'}</td><td>${dateText(row.updated_at)}</td><td><button type="button" class="run-link" data-run="${escape(row.id)}" aria-expanded="${runDetail?.id === row.id}">${t.viewDetails}${icon('chevron', 14)}</button></td></tr>`).join('')}</tbody></table></div>` : `<p>${t.noRecords}</p>`}
        ${research.next != null ? `<button class="button secondary more-records" type="button" data-ui="earlier-runs" ${listingRuns ? 'disabled' : ''}>${t.olderRuns}</button>` : ''}</section>${detailPanel()}` : !researchError ? `<p class="loading" role="status">${t.loading}</p>` : ''}</main>`;
}

function dialog() {
  if (!modal) return '';
  let inner;
  if (modal === 'consent') inner = `<p class="eyebrow">${t.consentTag}</p><h2 id="dialog-title">${t.consentTitle}</h2><p>${t.consentBody}</p><p>${t.consentVoluntary}</p>
    <form id="consent-form" aria-busy="${busy}"><label class="check-label"><input type="checkbox" name="consent" ${checked ? 'checked' : ''} required><span>${t.consentCheck}</span></label><div class="dialog-actions"><button type="button" class="button secondary" data-ui="close">${t.cancel}</button>
    ${entryError === 'consentChanged' ? `<button class="button primary" type="button" data-ui="reload">${t.reload}</button>` : `<button class="button primary" type="submit" ${checked && !busy ? '' : 'disabled'}>${busy ? t.entryOpening : entryError ? t.entryRetry : t.consentAccept}${icon('arrow')}</button>`}</div></form>
    ${entryError ? `<div class="dialog-alert" role="status"><p>${t[entryError]}</p></div>` : ''}`;
  if (modal === 'menu') inner = `<p class="eyebrow">${name}</p><h2 id="dialog-title">${t.menu}</h2><div class="menu-options"><a class="button secondary" href="${pageUrl('/')}" data-page="/">${t.pause}${icon('arrow')}</a><button class="button plain danger-text" type="button" data-ui="ask-withdraw">${t.withdraw}</button></div>`;
  if (modal === 'withdraw') inner = `<p class="eyebrow">${t.data}</p><h2 id="dialog-title">${t.withdrawTitle}</h2><p>${t.withdrawBody}</p><div class="dialog-actions"><button class="button secondary" type="button" data-ui="close">${t.cancel}</button><button class="button danger" type="button" data-ui="withdraw">${t.withdraw}</button></div>`;
  return `<dialog id="modal" aria-labelledby="dialog-title"><button class="icon-button dialog-close" type="button" data-ui="close" aria-label="${t.close}">${icon('cross')}</button>${inner}${alert && modal !== 'consent' ? `<p class="dialog-alert" role="status">${t[alert] ?? t.error}</p>` : ''}</dialog>`;
}

function render() {
  t = words[lang];
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = page === '/research' ? `${t.research} · ${name}` : name;
  const oldScroll = document.querySelector('#log-scroll');
  const scrollTop = oldScroll?.scrollTop ?? 0;
  const nearBottom = !oldScroll || oldScroll.scrollHeight - oldScroll.clientHeight - scrollTop < 35;
  const content = page === '/research' ? researchPage() : page === '/play' ? playPage() : home();
  app.innerHTML = `${header()}${alert && !modal ? `<div class="frame flash" role="status">${t[alert] ?? t.error}${alert === 'error' ? `<button type="button" data-ui="refresh">${t.retry}</button>` : ''}</div>` : ''}${content}${footer()}${dialog()}`;
  const current = document.querySelector('#log-scroll');
  if (current && logTab === 'log') current.scrollTop = nearBottom ? current.scrollHeight : scrollTop;
  const shown = document.querySelector('#modal');
  if (shown) {
    shown.showModal();
    shown.addEventListener('cancel', event => { event.preventDefault(); if (!busy) { modal = null; alert = null; render(); } });
  }
  updateBusy();
}

function updateBusy() {
  for (const control of app.querySelectorAll('[data-action], #note-form button, [data-ui="withdraw"], [data-export], #consent-form button[type="submit"]')) {
    control.disabled = busy || exporting && control.hasAttribute('data-export') || !!control.closest('#consent-form') && !checked;
  }
  for (const control of app.querySelectorAll('#modal [data-ui="close"], #consent-form input')) control.disabled = busy;
  const marker = document.querySelector('#save-mark span:last-child');
  if (marker) {
    marker.parentElement.dataset.pending = String(busy || alert === 'error');
    marker.textContent = busy ? t.saving : alert === 'error' ? t.syncPending : t.saved;
  }
}

function go(destination, push = true) {
  if (busy) return;
  if (push && destination !== page) history.pushState(null, '', pageUrl(destination));
  if (page === '/research' && destination !== page) {
    research = null;
    runDetail = null;
  }
  page = destination;
  alert = null;
  modal = null;
  logTab = 'log';
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (page === '/research') refreshResearch();
}

async function requestJson(url, options, timeout) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Request timed out'));
      controller?.abort();
    }, timeout);
  });
  try {
    return await Promise.race([deadline, (async () => {
      const response = await fetch(url, controller ? { ...options, signal: controller.signal } : options);
      return { ...await response.json(), status: response.status };
    })()]);
  } finally { clearTimeout(timer); }
}

async function api(path, data) {
  const headers = {};
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  if (backend && playToken) headers.Authorization = `Bearer ${playToken}`;
  const options = {
    ...(data === undefined ? {} : { method: 'POST', body: JSON.stringify(data) }), headers,
    credentials: backend ? 'omit' : 'same-origin', cache: 'no-store',
  };
  // Reads and version-checked actions can be retried without applying a move twice.
  const attempts = data === undefined || path === '/api/action' && Number.isSafeInteger(data.version) ? 2 : 1;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await requestJson(`${backend}${path}`, options, attempts === 2 ? 12000 : 18000);
      if (attempt === attempts || result.status < 500) return result;
    } catch (error) {
      if (attempt === attempts) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, 350));
  }
}

function savePlayToken(token) {
  if (!backend) return;
  playToken = token;
  putStorage(playTokenKey, token);
}

function pendingStartKey() {
  if (!/^[a-f0-9]{64}$/.test(startKey ?? '')) {
    try {
      startKey = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
      putStorage(startKeyStorage, startKey);
    } catch { return undefined; }
  }
  return startKey;
}

function clearStartKey() {
  startKey = null;
  putStorage(startKeyStorage, null);
}

async function sync() {
  if (busy) return;
  const epoch = ++sessionEpoch;
  try {
    const data = backend && !playToken ? { status: 200, session: null } : await api('/api/session');
    if (epoch !== sessionEpoch) return;
    if (data.status !== 200) throw new Error(data.error);
    session = data.session;
    if (!session) savePlayToken(null);
    if (session && session.game.phase !== 'complete') clearStartKey();
    alert = null;
  } catch { if (epoch === sessionEpoch) alert = 'error'; }
  finally {
    if (epoch === sessionEpoch) { loading = false; if (modal !== 'consent') render(); }
  }
}

async function refreshResearch() {
  researchError = null;
  try {
    const data = await api('/api/research/overview');
    if (page !== '/research') return;
    if (data.status === 403) { research = null; runDetail = null; researchError = data.error; }
    else if (data.status === 200) { research = data; alert = null; }
    else throw new Error(data.error);
  } catch { alert = 'error'; researchError = 'error'; }
  if (page === '/research') render();
}

async function earlierRuns() {
  if (listingRuns || research?.next == null) return;
  const current = research;
  listingRuns = true;
  alert = null;
  render();
  try {
    const data = await api(`/api/research/sessions?before=${current.next}`);
    if (research !== current) return;
    if (data.status !== 200) throw new Error(data.error);
    current.recent.push(...data.rows);
    current.next = data.next;
  } catch { if (research === current) alert = 'error'; }
  finally { listingRuns = false; if (page === '/research') render(); }
}

async function loadRun(id, append = false) {
  const detail = append ? runDetail : { id, session: null, events: [], next: null, loading: false, error: null };
  if (!detail || detail.loading || (append && detail.next === null)) return;
  runDetail = detail;
  detail.loading = true;
  detail.error = null;
  render();
  if (!append) document.querySelector('#run-detail')?.scrollIntoView({ block: 'start' });
  try {
    const data = await api(`/api/research/session?id=${encodeURIComponent(id)}&after=${append ? detail.next : 0}`);
    if (runDetail !== detail) return;
    if (data.status === 403) {
      research = null;
      runDetail = null;
      researchError = data.error;
    } else if (data.status === 404) {
      detail.session = null;
      detail.events = [];
      detail.error = 'runMissing';
    } else if (data.status === 200) {
      detail.session = data.session;
      detail.events.push(...data.events);
      detail.next = data.next;
    } else throw new Error(data.error);
  } catch { if (runDetail === detail) detail.error = 'error'; }
  finally { detail.loading = false; if (page === '/research') render(); }
}

async function start() {
  if (busy || !checked || modal !== 'consent' || entryError === 'consentChanged') return;
  ++sessionEpoch;
  loading = false;
  busy = true;
  alert = null;
  entryError = null;
  render();
  try {
    const data = await api('/api/session', { consent: consentVersion, lang, startKey: pendingStartKey() });
    if (data.error === 'consent_required') entryError = 'consentChanged';
    else if ((data.status !== 200 && data.status !== 201) || !data.session) entryError = 'entryFailed';
    else {
      if (typeof data.token === 'string') savePlayToken(data.token);
      clearStartKey();
      session = data.session;
    }
  } catch { entryError = 'entryFailed'; }
  finally {
    busy = false;
    if (!entryError) go('/play');
    else {
      render();
      document.querySelector('#consent-form .primary')?.focus();
    }
  }
}

async function move(kind, fields = {}) {
  if (busy || !session || modal) return;
  ++sessionEpoch;
  busy = true;
  alert = null;
  const game = session.game;
  const draft = kind === 'note' ? draftKey(game) : null;
  updateBusy();
  try {
    const data = await api('/api/action', { kind, ...fields, version: session.version, lang, ui: 'transverse-4' });
    if (data.session) {
      session = data.session;
      if (data.status === 409) alert = 'outOfSync';
      else if (draft) putStorage(draft, null);
      const log = session.game.log;
      const last = log[log.length - 1];
      if (last) announcer.textContent = t.logWords[last.kind]?.(last) ?? '';
      if (game.life !== session.game.life) logTab = session.game.carried.length ? 'notes' : 'log';
    } else if (data.status === 400) alert = 'invalid';
    else if (data.status === 404) { savePlayToken(null); session = null; goAfterMove('/'); }
    else throw new Error(data.error);
  } catch { alert = 'error'; }
  finally { busy = false; render(); }
}

function goAfterMove(destination) {
  busy = false;
  go(destination);
}

async function withdraw() {
  if (busy) return;
  ++sessionEpoch;
  busy = true;
  updateBusy();
  try {
    const data = await api('/api/withdraw', { confirm: true });
    if (data.status !== 200) throw new Error(data.error);
    try {
      const prefix = `agii:draft:${session.id}:`;
      for (const key of Object.keys(localStorage).filter(key => key.startsWith(prefix))) putStorage(key, null);
    } catch { /* storage unavailable */ }
    savePlayToken(null);
    clearStartKey();
    session = null;
    goAfterMove('/');
    alert = 'withdrawDone';
  } catch { alert = 'error'; }
  finally { busy = false; render(); }
}

const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
async function download(kind) {
  if (exporting) return;
  exporting = true;
  updateBusy();
  announcer.textContent = t.exporting;
  const csv = kind === 'sessions';
  const cols = ['id', 'protocol', 'consent_version', 'start_lang', 'cohort', 'seed', 'created_at', 'updated_at', 'completed_at', 'life', 'cleared', 'actions'];
  const parts = csv ? ['\ufeff', cols.join(','), '\r\n'] : [];
  let after = 0;
  try {
    do {
      const data = await api(`/api/research/export?kind=${kind}&after=${after}`);
      if (!Array.isArray(data.rows)) throw new Error(data.error);
      for (const row of data.rows) parts.push(csv ? `${cols.map(key => csvCell(row[key])).join(',')}\r\n` : `${JSON.stringify({ ...row, payload: JSON.parse(row.payload) })}\n`);
      after = data.next;
    } while (after !== null);
    const url = URL.createObjectURL(new Blob(parts, { type: csv ? 'text/csv;charset=utf-8' : 'application/x-ndjson;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = csv ? 'transverse-sessions.csv' : 'transverse-actions.jsonl';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch { alert = 'error'; }
  finally { exporting = false; render(); }
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
  else if (d.export) download(d.export);
  else if (d.run) loadRun(d.run);
  else if (d.ui === 'earlier-runs') earlierRuns();
  else if (d.ui === 'more-actions') loadRun(runDetail.id, true);
  else if (d.ui === 'refresh-run') loadRun(runDetail.id);
  else if (d.ui === 'close-run') { runDetail = null; render(); }
  else if (d.ui === 'refresh') page === '/research' ? refreshResearch() : sync();
  else if (d.ui === 'reload') location.reload();
  else if (d.ui === 'withdraw') withdraw();
  else if (d.ui === 'enter' && session) go('/play');
  else if (d.ui) {
    alert = null;
    if (d.ui === 'new' || d.ui === 'enter') { modal = 'consent'; checked = false; entryError = null; }
    else if (d.ui === 'menu') modal = 'menu';
    else if (d.ui === 'ask-withdraw') modal = 'withdraw';
    else if (d.ui === 'close') modal = null;
    render();
  }
});

app.addEventListener('change', event => {
  if (event.target.matches('#consent-form input')) { checked = event.target.checked; updateBusy(); }
});
app.addEventListener('input', event => {
  if (event.target.id !== 'note-input') return;
  const text = event.target.value;
  putStorage(draftKey(session.game), text);
  document.querySelector('#note-count').textContent = `${text.length} / 800`;
});
app.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'consent-form') start();
  if (event.target.id === 'note-form') move('note', { text: new FormData(event.target).get('text') });
});
document.addEventListener('keydown', event => {
  if (page !== '/play' || session?.game.phase !== 'combat' || busy || modal || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, button, a, [contenteditable]')) return;
  if (/^[1-5]$/.test(event.key) && Number(event.key) <= session.game.hand.length) {
    event.preventDefault(); move('play', { index: Number(event.key) - 1 });
  } else if (event.code === 'Space') {
    event.preventDefault(); move('end');
  }
});
window.addEventListener('popstate', () => { if (route() !== page) go(route(), false); });

render();
if (page === '/research') refreshResearch();
else if (loading) sync();
