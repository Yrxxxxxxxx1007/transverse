import { name } from './copy.mjs?v=9';
import { NOTE_LIMIT } from './engine.mjs';
import { archiveAppearance } from './archive-ui/look.mjs';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function boardPresentation(runId, game) {
  const { look, figure } = archiveAppearance(runId, game);
  const portrait = figure && figure !== -1 ? [figure.actor, figure.kind] : undefined;
  return { version: 'archive-ui-1', world: look.scene, palette: look.palette, frame: look.frame, type: look.type, token: look.token,
    ...(portrait ? { portrait } : {}) };
}

function cardLabel(card) {
  return `${card.name}(${card.cost ?? '?'})`;
}

function slotLines(label, slots) {
  const standing = [];
  const transient = [];
  for (const slot of slots) {
    if (/^[A-Z]/.test(slot.label)) transient.push(`${slot.label}:${slot.value ?? '?'}`);
    else standing.push(`${slot.label}=${slot.value ?? '?'}`);
  }
  return [`${label}:    ${standing.join('  ')}`, ...(transient.length ? [`        ${transient.join('  ')}`] : [])];
}

function screenText(game, t) {
  const turn = `${t?.turn ?? 'Turn'} ${game.turn}`;
  const left = game.camp ? `    ${t ? t.turnsLeft(game.turnsLeft) : `${game.turnsLeft} turns left`}` : '';
  return [turn + left, ...slotLines(t?.you ?? 'You', game.you), ...slotLines(t?.board.them ?? 'Them', game.them)].join('\n');
}

function promptText(game, t) {
  switch (game.phase) {
    case 'route': return game.guardian ? `${t.gateTitle}\n${t.gateText}` : `${t.routeTitle}\n${t.routeText}`;
    case 'rest': return `${t.restTitle}\n${t.restText}`;
    case 'reward': return `${t.rewardTitle}\n${t.rewardText}`;
    case 'note': return `${t.noteTitles[game.noteKind]}\n${t.noteText[game.noteKind]}`;
    default: return '';
  }
}

function actionText(entry, t) {
  const { input, observedBefore: before, log } = entry;
  const label = input.kind === 'play' ? before.hand[input.index]?.name : t.board[input.kind];
  const feedback = log.map(row => {
    const heading = row.kind === 'end' ? t.board.endResult : t.logWords[row.kind]?.(row) ?? row.kind;
    const changes = row.changes?.map(({ label, from, to }) => `${label}: ${from}->${to}`).join(', ');
    return changes ? `${heading}  ->  ${changes}` : heading;
  });
  if (input.kind === 'note' && input.text.trim()) feedback.unshift(input.text.trim());
  const command = label ?? (input.kind === 'note' ? t.board.submit : String(input.index + 1));
  return [`> ${command}`, ...feedback.map(line => `    ${line}`)].join('\n');
}

function snapshotText(game, t) {
  if (game.phase === 'combat') return `${screenText(game, t)}\n${t.board.inHand}:  ${game.hand.map(cardLabel).join('  ')}`;
  return game.phase === 'complete' ? t.completeTitle : promptText(game, t);
}

function carriedText(game, t) {
  return game?.carried.length ? [t.notes, ...game.carried.map(note => note.text)].join('\n') : '';
}

function resultText(session, t) {
  const lives = session.game.lives.map((life, index) => `${t.expedition} ${index + 1}    ${life.cleared ? t.cleared : t.fallen}    ${t.reached(life.reached)}`);
  return [t.completeTitle, t.completeText, '', ...lives, '', `${t.runId} ${session.id}`, `${t.moves}: ${session.version}`].join('\n');
}

function sceneText(session, entries, t) {
  const game = session.game;
  const last = entries[entries.length - 1];
  if (game.phase === 'complete') return resultText(session, t);
  if (game.phase !== 'combat') return [last && actionText(last, t), promptText(game, t)].filter(Boolean).join('\n\n');
  if (last?.observedBefore.life !== game.life) {
    return [game.camp ? t.camp : '', carriedText(game, t)].filter(Boolean).join('\n\n');
  }
  return last ? actionText(last, t) : t.camp;
}

function controlsFor(game, t) {
  const option = (kind, index, label) => ({ kind, index, label, group: 'option' });
  if (game.phase === 'route') return game.guardian ? [option('route', 0, t.gateGo)] : [0, 1].map(i => option('route', i, t.routeOption(i + 1)));
  if (game.phase === 'rest') return [option('rest', 0, t.restore), option('rest', 1, t.repair)];
  if (game.phase === 'reward') return [...game.rewards.map((label, index) => option('reward', index, label)), option('reward', 3, t.noReward)];
  if (game.phase !== 'combat') return [];
  const command = kind => ({ kind, label: t.board[kind], group: 'command' });
  const hand = game.hand.map((card, index) => ({ kind: 'play', index, label: cardLabel(card), raw: card.name, group: 'hand' }));
  return [...hand, command('end'), ...(game.camp ? [command('reset'), command('leave')] : [])];
}

function addChoice(choice, choices, commands) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = choice.group === 'command' ? 'key command' : 'choice';
  button.dataset.action = choice.kind;
  if (choice.index !== undefined) button.dataset.index = choice.index;
  button.dataset.raw = choice.raw ?? (choice.group === 'command' ? choice.kind : '');
  window.AGIIVisual.decorateChoice(button, choice);
  (choice.group === 'command' ? commands : choices).append(button);
}

const button = (label, action, extra = '') => `<button class="key ${extra}" type="button" data-ui="${action}">${label}</button>`;

export function createBoard(app) {
  app.innerHTML = `<div class="shell">
    <header class="topbar bevel" id="topbar"></header>
    <div class="notice bevel" id="notice" role="status" hidden></div>
    <section class="setup bevel" id="setup" aria-labelledby="setupSummary"></section>
    <main class="workspace">
      <section class="stage bevel" id="stage" aria-label="Game">
        <div class="viewport" id="viewport">
          <div class="idol" id="idol" aria-hidden="true" hidden></div>
          <div class="title-card" id="empty"></div>
          <pre class="dialogue" id="context" hidden></pre>
        </div>
        <div class="hud" id="hud" hidden></div>
        <div class="tray" id="inputArea" hidden></div>
      </section>
      <aside class="journal bevel" aria-labelledby="transcriptTitle">
        <div class="plate" id="recordPlate"></div>
        <div class="transcript" id="transcript" tabindex="0"></div>
      </aside>
    </main>
  </div><div id="dialog-root"></div>`;
  const byId = id => app.querySelector(`#${id}`);
  const topbar = byId('topbar'), setup = byId('setup'), notice = byId('notice'), viewport = byId('viewport');
  const empty = byId('empty'), context = byId('context'), hud = byId('hud'), idol = byId('idol'), tray = byId('inputArea');
  const transcript = byId('transcript'), recordPlate = byId('recordPlate');
  let shownEntries;
  let shownCount = 0;
  let shownLanguage;
  let figureKey;

  function latest() {
    transcript.scrollTop = transcript.scrollHeight;
  }

  function updateRecord(entries, session, lang, t) {
    const changed = entries !== shownEntries || lang !== shownLanguage;
    const following = transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 70;
    if (changed) {
      transcript.replaceChildren();
      const first = entries[0]?.observedBefore ?? session?.game;
      if (first) appendEntry(`${t.expedition} ${first.life}  (${t.universe} ${first.field})`, snapshotText(first, t));
      else transcript.innerHTML = `<p class="transcript-empty">${t.board.empty}</p>`;
      shownEntries = entries;
      shownLanguage = lang;
      shownCount = 0;
    }
    for (const entry of entries.slice(shownCount)) appendEntry(actionText(entry, t), snapshotText(entry.observedAfter, t));
    shownCount = entries.length;
    if (following || changed) latest();
  }

  function appendEntry(action, snapshot) {
    const item = document.createElement('div');
    item.className = 'transcript-item';
    const pre = document.createElement('pre');
    pre.textContent = action;
    item.append(pre);
    if (snapshot) {
      const next = document.createElement('pre');
      next.textContent = snapshot;
      item.append(document.createElement('hr'), next);
    }
    transcript.append(item);
  }

  function render({ session, playing, setupOpen, message, entries, oldPractice, draft, raw, lang, t }) {
    const game = playing ? session.game : null;
    const b = t.board;
    const phase = game ? game.phase === 'combat' ? 'act' : game.phase === 'note' ? 'note' : game.phase === 'complete' ? 'done' : 'pick' : 'idle';
    const status = { idle: b.ready, act: b.move, pick: b.choose, note: b.write, done: b.done }[phase];
    const { look, figure } = archiveAppearance(session?.id, session?.game);
    document.body.dataset.setupOpen = String(setupOpen);
    document.body.dataset.phase = phase;
    byId('stage').setAttribute('aria-label', t.expedition);
    if (window.AGIIWorld.apply(look) || !viewport.querySelector('.world-backdrop')) window.AGIIVisual.setBackdrop(viewport);
    topbar.innerHTML = `<div class="brand"><span class="brand-emblem" aria-hidden="true"></span><span class="wordmark">${name}</span></div>
      <div class="lamp" id="connection" role="status"><span class="lamp-dot" aria-hidden="true"></span><span id="statusText">${status}</span></div>
      <div class="topbar-actions"><button id="export" class="key" type="button" data-ui="download"${session ? '' : ' disabled'}>${b.export}</button><button id="stop" class="key" type="button" data-ui="quit"${game ? '' : ' disabled'}>${b.quit}</button></div>`;
    notice.textContent = message;
    notice.hidden = !message;
    const summary = session ? `${t.universe} ${session.game.field} · ${escape(session.id.slice(0, 8))} · ${b.lives}` : b.newGame;
    const start = session ? session.game.phase === 'complete' ? t.report : t.resume : b.start;
    const carried = carriedText(session?.game, t);
    setup.innerHTML = `<div class="plate"><span class="plate-text" id="setupSummary">${summary}</span><button class="key small" id="toggleSetup" data-ui="setup" type="button" aria-expanded="${setupOpen}" aria-controls="setupBody">${setupOpen ? b.hide : b.show}</button></div>
      <div class="setup-body web-setup" id="setupBody" ${setupOpen ? '' : 'hidden'}>
        <div class="setup-line"><span>${t.roundsMeta} · ${t.worldMeta}</span><div class="language-keys" role="group" aria-label="${t.language}"><button type="button" class="key small" data-lang="en" aria-pressed="${lang === 'en'}">EN</button><button type="button" class="key small" data-lang="zh" aria-pressed="${lang === 'zh'}">中文</button></div></div>
        ${carried ? `<details><summary>${t.notes}</summary><pre>${escape(carried)}</pre></details>` : ''}
        <details><summary>${t.how}</summary><p>${t.helpText}</p></details>
        <details><summary>${t.data}</summary><p>${t.dataText}</p>${oldPractice ? button(t.downloadPractice, 'download-practice', 'small') : ''}</details>
        <div class="setup-footer">${session ? button(t.withdraw, 'ask-withdraw', 'small') : ''}${session?.game.phase === 'complete' ? button(t.replay, 'new') : ''}${!game ? button(start, 'enter', 'primary') : ''}</div>
      </div>`;
    empty.hidden = Boolean(game);
    if (!game) empty.innerHTML = `<h1 class="title-word">${name}</h1><p>${session ? start : b.titlePrompt}</p>`;
    const text = game ? sceneText(session, entries, t) : '';
    if (context.textContent !== text) { context.textContent = text; context.scrollTop = 0; }
    context.hidden = !text;
    hud.hidden = idol.hidden = phase !== 'act';
    if (phase === 'act') {
      window.AGIIVisual.renderHud(screenText(game), hud, game.name ?? '', { you: t.you, them: b.them, turn: t.turn, left: b.left });
      const key = JSON.stringify(figure);
      if (figureKey !== key) { window.AGIIVisual.setFigure(idol, figure); figureKey = key; }
    }
    tray.hidden = phase === 'idle' || phase === 'done';
    if (phase === 'note') {
      tray.innerHTML = `<form class="note-form" id="note-form"><textarea class="note-input" id="note-input" name="text" aria-label="${t.placeholder}" placeholder="${t.placeholder}" spellcheck="false" rows="4" maxlength="${NOTE_LIMIT}"></textarea><div class="note-actions setup-footer"><span id="note-count">${draft.length} / ${NOTE_LIMIT}</span><button class="key small" type="button" data-action="skip">${t.skip}</button><button class="key primary" type="submit">${b.submit}</button></div></form>`;
      tray.querySelector('textarea').value = draft;
    } else if (phase === 'act' || phase === 'pick') {
      tray.innerHTML = `<div id="actionInput"><div class="hand ${phase === 'pick' ? 'options' : ''}" id="choices"></div><div class="console"><div class="commands" id="commands"></div><form class="raw-form" id="rawForm"><input id="rawInput" type="text" aria-label="${b.rawLabel}" autocomplete="off" spellcheck="false"><button class="key small" id="rawSubmit" type="submit">${b.enter}</button></form></div></div>`;
      const choices = byId('choices'), commands = byId('commands');
      for (const choice of controlsFor(game, t)) addChoice(choice, choices, commands);
      if (phase === 'act' && !game.hand.length) choices.innerHTML = `<p class="empty-hand-text">${t.emptyHand}</p>`;
      byId('rawInput').value = raw;
    } else tray.replaceChildren();
    recordPlate.innerHTML = `<span class="plate-text" id="transcriptTitle">${b.record}</span><button class="key small" id="scrollLatest" data-ui="latest" type="button" aria-label="${b.latestLabel}">${b.latest}</button>`;
    updateRecord(entries, session, lang, t);
  }

  return { render, latest };
}
