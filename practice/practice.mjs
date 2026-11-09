import { icon } from '../icons.mjs';
import { styles, worldAsset } from '../worlds.mjs';
import { cards, hand, worlds, MAX_HEALTH, TURN_ENERGY, canPlay, endTurn, loadRun, newRun, nextWorld, play, retryWorld } from './game.mjs';
import { exportRecord, loadRecord, newRecord, NOTE_LIMIT, recordAction } from './record.mjs';

const text = {
  en: {
    title: 'Transverse · Practice', mode: 'Field practice', world: 'Universe', turn: 'Turn',
    instruction: 'Clear three battles and discover a different rule in each universe. Each card can be used once per turn.',
    local: 'Progress stays in this browser. Practice records are not uploaded.',
    temporary: 'Download your play record before closing this page. This browser cannot keep it or your progress.',
    player: 'Your health', enemy: 'Sentinel', energy: 'Energy', guard: 'Guard', hand: 'Your hand',
    damage: n => `Deal ${n} damage`, shield: n => `Gain ${n} guard`, heal: n => `Recover ${n} health`,
    cost: n => `${n} energy`, played: 'Played', end: 'End turn', restart: 'Restart practice',
    confirm: 'Start over from the first universe? Download this run first if you want to keep its record.',
    log: 'Field notes', empty: 'Play a card to record your first observation.',
    enemyMove: (damage, blocked) => `The sentinel deals ${damage} damage. You block ${blocked}.`,
    cardMove: (name, effects) => `${name} · ${effects.join(' · ')}`,
    dealt: n => `${n} damage`, gained: n => `+${n} guard`, restored: n => `+${n} health`,
    bonus: n => `World effect +${n}`, noChange: 'No change', discovered: 'Rule discovered',
    hints: ['Try two attacks in a row.', 'Observe what happens when you guard after an attack.', 'Look at your guard before using Pulse.'],
    rules: ['Two attacks in a row add 2 damage to the second attack.',
      'Ward gains 3 extra guard immediately after an attack.',
      'Pulse adds 4 damage when you have at least 3 guard.'],
    names: { cut: 'Cut', spark: 'Spark', ward: 'Ward', mend: 'Mend', pulse: 'Pulse' },
    cleared: 'Battle cleared', next: 'Enter next universe', defeated: 'The sentinel held the gate',
    retry: 'Try this battle again', complete: 'All three battles cleared',
    score: n => `${n} of 3 rules discovered`, playAgain: 'Play again', guide: 'Guard blocks damage when you end a turn. Your energy refills each turn.',
    record: 'Play record', download: 'Download play record', note: 'What patterns did you notice? (optional)',
    recordInfo: 'Save your moves, game states and timing as a file. You can send it to the person who invited you.',
    recordPartial: 'This run was already in progress. The file includes your current progress and moves recorded since the update.',
  },
  zh: {
    title: 'Transverse · 练习版', mode: '跨界演练', world: '宇宙', turn: '回合',
    instruction: '闯过三场战斗，观察每个宇宙的不同规律。每张牌每回合可用一次。',
    local: '进度只保存在此浏览器，练习记录不会上传。',
    temporary: '当前浏览器无法保留进度和记录，请在关闭页面前下载试玩记录。',
    player: '生命', enemy: '守卫生命', energy: '能量', guard: '护盾', hand: '手牌',
    damage: n => `造成 ${n} 点伤害`, shield: n => `获得 ${n} 点护盾`, heal: n => `恢复 ${n} 点生命`,
    cost: n => `${n} 能量`, played: '已使用', end: '结束回合', restart: '重新开始',
    confirm: '从第一个宇宙重新开始吗？想保留本局记录，请先下载。',
    log: '观测日志', empty: '出一张牌，记录第一次观测。',
    enemyMove: (damage, blocked) => `守卫造成 ${damage} 点伤害，你挡下 ${blocked} 点。`,
    cardMove: (name, effects) => `${name} · ${effects.join(' · ')}`,
    dealt: n => `伤害 ${n}`, gained: n => `护盾 +${n}`, restored: n => `生命 +${n}`,
    bonus: n => `宇宙效应 +${n}`, noChange: '没有变化', discovered: '已发现规律',
    hints: ['试着连续打出两张攻击牌。', '先攻击，再观察护盾牌的变化。', '使用脉冲前，留意当前护盾。'],
    rules: ['连续出两张攻击牌时，第二张多造成 2 点伤害。', '攻击后紧接着打出护盾牌，可多获得 3 点护盾。',
      '有至少 3 点护盾时，脉冲多造成 4 点伤害。'],
    names: { cut: '切割', spark: '火花', ward: '护盾', mend: '修复', pulse: '脉冲' },
    cleared: '战斗通过', next: '进入下一个宇宙', defeated: '守卫挡住了去路',
    retry: '重试这一场', complete: '已通过全部三场战斗',
    score: n => `发现 ${n} / 3 条规律`, playAgain: '再玩一局', guide: '结束回合时，护盾会挡下伤害。下一回合能量恢复。',
    record: '试玩记录', download: '下载试玩记录', note: '你发现了什么规律？（选填）',
    recordInfo: '可把出牌、战斗状态和用时保存成文件，再发给邀请你的人。',
    recordPartial: '这局在更新前已经开始。文件包含当前进度和更新后记录的操作。',
  },
};

const storageKey = 'transverse.practice.run.1';
const languageKey = 'transverse.practice.language';
const app = document.getElementById('practice');
const projectRoot = new URL('../', import.meta.url);

function read(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

const { playRecord: storedRecord, ...storedRun } = loadRun(read(storageKey));
let run = storedRun;
let playRecord = loadRecord(storedRecord, run);
let lang = read(languageKey) === 'zh' ? 'zh' : 'en';
let saved = save();
const cardIcons = { cut: 'fight', spark: 'compass', ward: 'shield', mend: 'rest', pulse: 'orbit' };

function save() {
  return write(storageKey, JSON.stringify({ ...run, playRecord }));
}

function logLine(event, t) {
  if (event.type === 'enemy') return t.enemyMove(event.damage, event.blocked);
  const effects = [];
  if (event.damage) effects.push(t.dealt(event.damage));
  if (event.guard) effects.push(t.gained(event.guard));
  if (event.heal) effects.push(t.restored(event.heal));
  if (event.bonus) effects.push(t.bonus(event.bonus));
  return t.cardMove(t.names[event.key], effects.length ? effects : [t.noChange]);
}

function cardMarkup(key, t) {
  const { damage, guard, heal, cost } = cards[key];
  const description = damage ? t.damage(damage) : guard ? t.shield(guard) : t.heal(heal);
  return `<button class="practice-card" type="button" data-card="${key}"${canPlay(run, key) ? '' : ' disabled'}>
    <span class="practice-card-cost">${run.played.includes(key) ? t.played : t.cost(cost)}</span>
    <span class="practice-card-icon">${icon(cardIcons[key], 29)}</span>
    <strong>${t.names[key]}</strong><span>${description}</span>
  </button>`;
}

function controls(t) {
  if (run.phase === 'complete') return [t.complete, 'restart', t.playAgain];
  if (run.phase === 'cleared') return [t.cleared, 'next', t.next];
  if (run.phase === 'defeated') return [t.defeated, 'retry', t.retry];
  return ['', 'end', t.end];
}

function recordMarkup(t) {
  const hasRecord = playRecord.actions.length > 0 || playRecord.startedMidRun;
  const canLeaveNote = run.phase === 'complete' || run.phase === 'defeated' || playRecord.note !== '';
  return `<section class="practice-record" aria-labelledby="practice-record-title">
    <h3 id="practice-record-title">${t.record}</h3>
    <p>${t.recordInfo}</p>
    ${playRecord.startedMidRun ? `<p>${t.recordPartial}</p>` : ''}
    ${canLeaveNote ? `<label for="practice-note">${t.note}</label>
      <textarea id="practice-note" rows="2" maxlength="${NOTE_LIMIT}"></textarea>` : ''}
    ${hasRecord ? `<button class="button ${run.phase === 'complete' ? 'primary' : 'practice-quiet'}" type="button" data-action="download">${t.download} ${icon('download', 16)}</button>` : ''}
  </section>`;
}

function render(restoreFocus = false) {
  const active = document.activeElement?.dataset;
  const t = text[lang];
  const world = worlds[run.world];
  const name = styles[world.art][lang];
  const [result, action, label] = controls(t);
  const records = run.log.slice(-6).reverse().map(event => `<li>${logLine(event, t)}</li>`).join('');
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t.title;
  app.innerHTML = `<header class="site-head"><div class="frame head-inner">
    <a class="brand" href="${projectRoot.href}"><img src="${new URL('mark.svg', projectRoot).href}" width="34" height="34" alt=""><strong>Transverse</strong></a>
    <div class="language" aria-label="Language / 语言">
      <button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button>
      <button type="button" data-lang="zh" aria-pressed="${lang === 'zh'}">中文</button>
    </div>
  </div></header>
  <main class="frame practice-wrap" data-world="${run.world}">
    <section class="practice-hero" aria-labelledby="practice-title">
      <img class="practice-scene" src="${new URL(worldAsset(world.art), projectRoot).href}" alt="">
      <div class="practice-intro">
        <p class="eyebrow">${t.mode} · ${t.world} 0${run.world + 1} / 03</p>
        <h1 id="practice-title">${name}</h1>
        <p>${t.instruction}</p>
      </div>
      <div class="practice-metrics" aria-label="${t.turn} ${run.turn}">
        <div><span>${t.player}</span><strong data-stat="health">${run.health}<small>/${MAX_HEALTH}</small></strong></div>
        <div><span>${t.enemy}</span><strong data-stat="enemy">${run.enemy}<small>/${world.health}</small></strong></div>
        <div><span>${t.energy}</span><strong data-stat="energy">${run.energy}<small>/${TURN_ENERGY}</small></strong></div>
        <div><span>${t.guard}</span><strong data-stat="guard">${run.guard}</strong></div>
      </div>
    </section>
    <div class="practice-grid">
      <section class="practice-play" aria-labelledby="practice-hand">
        <div class="practice-heading"><h2 id="practice-hand">${t.hand}</h2><span class="eyebrow">${t.turn} ${run.turn}</span></div>
        <div class="practice-hand">${hand.map(key => cardMarkup(key, t)).join('')}</div>
        <p class="practice-guide">${t.guide}</p>
        <div class="practice-actions">
          <button class="button ${action === 'restart' ? 'practice-quiet' : 'primary'}" type="button" data-action="${action}">${label} ${icon('arrow')}</button>
          ${action === 'restart' ? '' : `<button class="button practice-quiet" type="button" data-action="restart">${t.restart}</button>`}
        </div>
        <p class="practice-result" role="status">${result ? `<strong>${result}</strong> · ${t.score(run.found.filter(Boolean).length)}` : ''}</p>
        ${recordMarkup(t)}
      </section>
      <aside class="practice-notes" aria-labelledby="practice-log">
        <h2 id="practice-log">${t.log}</h2>
        <p class="practice-clue">${run.found[run.world] ? `<strong>${t.discovered}</strong> · ${t.rules[run.world]}` : t.hints[run.world]}</p>
        <ol aria-live="polite">${records || `<li>${t.empty}</li>`}</ol>
      </aside>
    </div>
    <p class="practice-local">${icon('monitor', 16)} <span>${saved ? t.local : t.temporary}</span></p>
  </main>`;
  const note = app.querySelector('#practice-note');
  if (note) note.value = playRecord.note;
  if (!restoreFocus) return;
  const current = active?.lang ? app.querySelector(`[data-lang="${active.lang}"]`)
    : active?.card ? app.querySelector(`[data-card="${active.card}"]:not(:disabled)`) : null;
  const focusTarget = current ?? app.querySelector('button.primary') ?? app.querySelector('[data-action="restart"]');
  focusTarget.focus({ preventScroll: run.phase !== 'complete' || current !== null });
}

function update(next, action) {
  if (next === run) return;
  if (action === 'restart') playRecord = newRecord();
  else recordAction(playRecord, action, run, next, lang);
  run = next;
  saved = save();
  render(true);
}

function downloadPlayRecord() {
  const contents = JSON.stringify(exportRecord(playRecord, run), null, 2);
  const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `transverse-${playRecord.id}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

app.addEventListener('input', event => {
  if (event.target.id !== 'practice-note') return;
  playRecord.note = event.target.value.slice(0, NOTE_LIMIT);
  saved = save();
  app.querySelector('.practice-local span').textContent = saved ? text[lang].local : text[lang].temporary;
});

app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  const { lang: selected, card, action } = button.dataset;
  if (selected) {
    lang = selected;
    write(languageKey, lang);
    render(true);
  } else if (card) {
    update(play(run, card), 'play_card');
  } else if (action === 'end') {
    update(endTurn(run), 'end_turn');
  } else if (action === 'next') {
    update(nextWorld(run), 'enter_universe');
  } else if (action === 'retry') {
    update(retryWorld(run), 'retry_battle');
  } else if (action === 'download') {
    downloadPlayRecord();
  } else if (action === 'restart' && window.confirm(text[lang].confirm)) {
    update(newRun(), 'restart');
  }
});

render();
