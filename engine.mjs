export const PROTOCOL = 'agii-web-pilot/1';
export const LIVES = 3;
export const CAMP_TURNS = 10;
export const NOTE_LIMIT = 800;
const CAMP_STEPS = 240;
const TYPES = ['attack', 'block', 'dodge', 'heal', 'double'];
const COST = { attack: 1, block: 1, dodge: 2, heal: 1, double: 1 };
const PAIRS = [
  ['charge', 'pierce'], ['guard', 'counter'], ['charge', 'ward'],
  ['guard', 'mark'], ['charge', 'poison'],
];
const WORLDS = [
  {
    names: ['vrikkai', 'hunzou', 'kaekra', 'tiajia', 'saintil'],
    attack: 7, cap: 203, block: 11, heal: 16, rest: .35, repair: .17, poison: 3,
    me: { hp: 'a3', cap: 'a2', attack: 'a4', energy: 'a1', block: 'A4', dodge: 'A2', double: 'A1', poison: 'A3', offence: 'A7' },
    them: { hp: 'b1', attack: 'b3', charge: 'B1', guard: 'B2', mark: 'B3', ward: 'B5' },
  },
  {
    names: ['eskaro', 'syvran', 'mozzek', 'luthai', 'dorven'],
    attack: 9, cap: 306, block: 15, heal: 18, rest: .30, repair: .13, poison: 4,
    me: { hp: 'a1', cap: 'a2', attack: 'a3', energy: 'a4', block: 'A2', dodge: 'A5', double: 'A4', poison: 'A7', offence: 'A1' },
    them: { hp: 'b2', attack: 'b1', charge: 'B4', guard: 'B3', mark: 'B1', ward: 'B5' },
  },
];
const OPPONENTS = ['Eilvor', 'Nivrax', 'Moravel', 'Veskir', 'Ulvane', 'Soryth', 'Ivrann', 'Oryss', 'Relkath', 'Thavik', 'Nemael', 'Kaivren'];

export class InvalidAction extends Error {}
function requireAction(allowed) {
  if (!allowed) throw new InvalidAction('invalid_action');
}

function random(s) {
  s.rng = (s.rng + 0x6d2b79f5) >>> 0;
  let value = Math.imul(s.rng ^ (s.rng >>> 15), s.rng | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function shuffled(s, items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const world = s => WORLDS[s.life === 2 ? 1 : 0];
const field = s => s.life === 2 ? 'II' : 'I';
const card = (s, type) => world(s).names[TYPES.indexOf(type)];
const initDeck = camp => TYPES.flatMap(type => Array(camp || type !== 'attack' ? 3 : 6).fill(type));
const isCamp = s => s.fight?.role === 'camp';
const campOpen = s => s.phase === 'combat' && isCamp(s);

function log(s, kind, info = {}) {
  const row = { id: ++s.logSeq, kind, ...info };
  s.log.push(row);
  if (s.log.length > 110) s.log.shift();
}

function takeFrom(pool, type) {
  const index = pool.indexOf(type);
  if (index < 0) return false;
  pool.splice(index, 1);
  return true;
}

function ensure(s, type, replace = true, keep = []) {
  const f = s.fight;
  if (f.hand.includes(type)) return;
  if (f.hand.length === 5 && !replace) return;
  if (!takeFrom(f.draw, type) && !takeFrom(f.discard, type)) return;
  if (f.hand.length === 5) {
    let index = f.hand.length - 1;
    while (index >= 0 && keep.includes(f.hand[index])) index--;
    f.draw.unshift(f.hand.splice(index, 1)[0]);
  }
  f.hand.push(type);
}

function deal(s, opening = false) {
  const f = s.fight;
  while (f.hand.length < 5) {
    if (!f.draw.length) {
      if (!f.discard.length) break;
      f.draw = shuffled(s, f.discard);
      f.discard = [];
    }
    f.hand.push(f.draw.pop());
  }
  ensure(s, 'attack');
  if (opening) ensure(s, 'block', true, ['attack']);
  if (opening && f.role === 'guardian') ensure(s, 'dodge', true, ['attack', 'block']);
}

function beginFight(s, role, mechanic = null, route = 0) {
  const w = world(s);
  const camp = role === 'camp';
  const guardian = role === 'guardian';
  const echo = (Math.imul(s.seed ^ (s.life + 1), 0x85ebca6b) ^ Math.imul((s.stage + 3) * 3 + route, 0x9e3779b1)) >>> 0;
  // Cosmetic identity is independent of the mechanic and draw stream.
  const name = OPPONENTS[echo % OPPONENTS.length];
  const hpHits = camp ? 0 : (guardian ? 7 : role === 'teach' ? 3 : 4) + (Math.floor(random(s) * 2) ^ route);
  const attack = camp ? w.block + 2 : Math.max(1, Math.round(w.attack * (.9 + random(s) * .35)));
  if (camp) {
    const cap = Math.max(120, (w.block + 2) * CAMP_TURNS + 1);
    s.player = { hp: cap, cap, attack: w.attack, poison: 0 };
    s.deck = initDeck(true);
  }
  s.fight = {
    role, mechanic, name, echo, route, turn: 1, energy: 2, block: 0, dodge: 0, double: 0, offence: 0,
    hp: camp ? 300 : w.attack * hpHits, attack, baseAttack: attack, damage: 0,
    charge: mechanic === 'charge' && guardian ? 1 : 0, guard: mechanic === 'guard' ? Number(random(s) < .5) : 0,
    mark: 0, codes: mechanic === 'mark' ? s.markCodes : [], counts: [0, 0, 0, 0, 0],
    ward: mechanic === 'ward' ? 1 : 0, opened: 0, pierced: 0, attacks: 0,
    draw: shuffled(s, s.deck), discard: [], hand: [], seen: {}, dodgeOffered: false, blockOffered: false,
  };
  s.phase = 'combat';
  deal(s, true);
  recordOffers(s);
  if (!camp) log(s, 'encounter', { name });
}

function recordOffers(s) {
  const f = s.fight;
  f.dodgeOffered = f.hand.includes('dodge') && f.energy >= COST.dodge;
  f.blockOffered = f.hand.includes('block') && f.energy >= COST.block;
}

function beginLife(s, camp) {
  const [first, second] = shuffled(s, PAIRS[s.cohort]);
  const [testA, testB] = shuffled(s, [first, second]);
  const guardian = [first, second].find(type => ['charge', 'guard'].includes(type));
  s.plan = [
    { role: 'teach', mechanic: first }, { role: 'teach', mechanic: second }, { role: 'rest' },
    { role: 'test', mechanic: testA }, { role: 'test', mechanic: testB }, { role: 'rest' },
    { role: 'guardian', mechanic: guardian },
  ];
  s.stage = 0;
  s.markCodes = s.plan.some(row => row.mechanic === 'mark') ? shuffled(s, TYPES) : [];
  s.campSteps = 0;
  s.costs = [];
  s.seen = {};
  s.probes = {};
  s.log = [];
  log(s, 'arrival', { life: s.life + 1 });
  if (camp) beginFight(s, 'camp');
  else enterMap(s);
}

function enterMap(s) {
  const w = world(s);
  s.deck = initDeck(false);
  s.player = { hp: w.cap, cap: w.cap, attack: w.attack, poison: 0 };
  s.fight = null;
  s.phase = 'route';
  log(s, 'departure');
}

export function createGame(seed) {
  const s = {
    protocol: PROTOCOL, seed, rng: seed, life: 0, stage: 0, cohort: 0, log: [], logSeq: 0,
    lives: [], notes: [], carried: [], phase: '', fight: null,
  };
  s.cohort = Math.floor(random(s) * PAIRS.length);
  beginLife(s, true);
  return s;
}

function values(s) {
  const f = s.fight;
  return {
    me: { ...s.player, energy: f?.energy, block: f?.block, double: f?.double, dodge: f?.dodge, offence: f?.offence },
    them: f ? { hp: f.hp, attack: f.attack, charge: f.charge, guard: f.guard, mark: f.mark, ward: f.ward } : {},
  };
}

function diff(s, before) {
  const after = values(s);
  const w = world(s);
  const changes = [];
  for (const [side, props] of Object.entries(after)) {
    for (const [key, to] of Object.entries(props)) {
      const from = before[side][key];
      if (from === to || from == null || to == null) continue;
      const permanent = side === 'me' && Object.prototype.hasOwnProperty.call(s.player, key);
      (permanent ? s.seen : s.fight.seen)[`${side}.${key}`] = true;
      changes.push({ label: w[side][key], from, to });
    }
  }
  return changes.sort((a, b) => a.label.localeCompare(b.label, 'en'));
}

function slots(s, side, standing, active) {
  const data = values(s)[side];
  return [...standing, ...active.filter(key => data[key] > 0)].map(key => ({
    label: world(s)[side][key],
    value: active.includes(key) || s.seen[`${side}.${key}`] || s.fight?.seen[`${side}.${key}`] ? data[key] : null,
  })).sort((a, b) => a.label.localeCompare(b.label, 'en'));
}

function hurt(s, amount) {
  s.player.hp = Math.max(0, s.player.hp - amount);
}

function punish(s, mechanic, probe, teach, test) {
  if (s.fight.role === 'guardian') return test;
  if (!s.probes[mechanic]) {
    s.probes[mechanic] = true;
    return probe;
  }
  return s.fight.role === 'teach' ? teach : test;
}

function finishLife(s, cleared) {
  s.lives.push({ cleared, reached: s.stage + 1 });
  s.phase = 'note';
  s.noteKind = 'life';
  log(s, cleared ? 'clear' : 'fallen');
}

function finishCamp(s) {
  s.phase = 'note';
  s.noteKind = 'camp';
  log(s, 'campEnd');
}

function finishFight(s) {
  if (isCamp(s)) return finishCamp(s);
  if (!s.player.hp) return finishLife(s, false);
  if (s.fight.role === 'guardian') return finishLife(s, true);
  s.phase = 'note';
  s.noteKind = 'fight';
  log(s, 'encounterEnd');
}

function endTurn(s, committed = false) {
  const f = s.fight;
  const before = values(s);
  const { mechanic, role } = f;
  const teach = role === 'teach';
  const guardian = role === 'guardian';
  const triggers = [];
  let hit = f.attack;
  let bypass = false;
  let lethal = false;

  if (mechanic === 'poison') s.player.poison += world(s).poison;
  if (s.player.poison) {
    hurt(s, s.player.poison);
    const wear = Math.floor(s.player.poison * (teach ? .25 : 1.25));
    s.player.cap = Math.max(Math.round(world(s).cap * .14), s.player.cap - wear);
    s.player.hp = Math.min(s.player.hp, s.player.cap);
    triggers.push('poison_tick');
  }
  if (mechanic === 'charge') {
    if (f.charge === 2) {
      bypass = true;
      lethal = guardian;
      hit *= teach ? 3 : 8;
      f.charge = 0;
      triggers.push(f.dodge ? 'charge_dodged' : 'charge_hit');
    } else f.charge++;
  }
  if (mechanic === 'pierce') {
    if (f.pierced >= 2) hit *= teach ? 2 : 3;
    if (f.block && !f.dodge) {
      hit *= f.pierced === 0 ? 2 : teach ? 4 : 9;
      bypass = true;
      f.pierced++;
      triggers.push('pierce_hit');
    }
  }
  if (mechanic === 'counter' && f.offence >= 2) {
    hit *= punish(s, 'counter', 2, 4, 9);
    bypass = true;
    triggers.push('counter_hit');
  }
  const absorbed = !f.dodge && !bypass && hit > 0 && f.block > 0;
  if (!f.dodge) hurt(s, lethal ? s.player.hp : hit - (bypass ? 0 : Math.min(hit, f.block)));
  if (mechanic === 'guard') f.guard = 1 - f.guard;
  if (mechanic === 'ward') {
    if (!f.ward) {
      if (--f.opened === 0) f.ward = 1;
    } else if (f.attacks) {
      f.ward = Math.min(teach ? 1 : 3, f.ward + 1);
    } else if (absorbed && --f.ward === 0) f.opened = 4;
  }
  if (mechanic === 'mark') {
    const weights = f.codes.map(type => f.counts[TYPES.indexOf(type)]);
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = random(s) * total;
    f.mark = total ? weights.findIndex(weight => (roll -= weight) < 0) + 1 : Math.floor(random(s) * 5) + 1;
  }
  if (!isCamp(s) && !f.damage && !f.dodge) f.attack += Math.max(1, Math.round(world(s).attack * .2));
  f.energy = 2;
  f.block = 0;
  f.dodge = 0;
  f.offence = 0;
  f.attacks = 0;
  f.damage = 0;
  log(s, committed ? 'locked' : 'end', { changes: diff(s, before) });
  if (committed || !s.player.hp) finishFight(s);
  else if (isCamp(s) && f.turn === CAMP_TURNS) finishCamp(s);
  else {
    f.turn++;
    if (f.charge === 2) ensure(s, 'dodge', false);
    if (triggers.includes('pierce_hit')) ensure(s, 'block', false);
    deal(s);
    recordOffers(s);
  }
  return triggers;
}

function playCard(s, index) {
  const f = s.fight;
  requireAction(Number.isInteger(index) && index >= 0 && index < f.hand.length);
  const type = f.hand[index];
  const name = card(s, type);
  if (f.energy < COST[type]) {
    log(s, 'noEffect', { name });
    return { result: 'insufficient_energy', card: type };
  }
  const before = values(s);
  const triggers = [];
  f.energy -= COST[type];
  if (!s.costs.includes(type)) s.costs.push(type);
  f.hand.splice(index, 1);
  if (type === 'heal') takeFrom(s.deck, type);
  else f.discard.push(type);
  f.counts[TYPES.indexOf(type)]++;
  if (type === 'attack' || type === 'double') f.offence++;
  const w = world(s);
  switch (type) {
    case 'heal': s.player.hp = Math.min(s.player.cap, s.player.hp + w.heal); break;
    case 'block': f.block += w.block; break;
    case 'dodge': f.dodge = 1; break;
    case 'double': f.double = 1; break;
    case 'attack': {
      const damage = s.player.attack * (f.double ? 2 : 1);
      f.attacks++;
      f.double = 0;
      if (f.guard) {
        hurt(s, damage * punish(s, 'guard', 1, 2, 4));
        triggers.push('guard_reflect');
      } else if (f.ward) triggers.push('ward_sealed');
      else {
        f.hp = Math.max(0, f.hp - damage);
        f.damage += damage;
      }
      break;
    }
  }
  if (f.mark && f.codes[f.mark - 1] === type) {
    hurt(s, f.attack * punish(s, 'mark', 2, 3, 7));
    triggers.push('mark_hit');
  }
  log(s, 'card', { name, changes: diff(s, before) });
  if (!s.player.hp || !f.hp) {
    if (!f.hp && f.charge === 2 && s.player.hp) triggers.push(...endTurn(s, true));
    else finishFight(s);
  }
  return { result: 'played', card: type, triggers };
}

function advance(s) {
  s.stage++;
  s.fight = null;
  s.phase = s.plan[s.stage].role === 'rest' ? 'rest' : 'route';
}

function submitNote(s, text) {
  requireAction(typeof text === 'string' && text.length <= NOTE_LIMIT);
  const note = { kind: s.noteKind, life: s.life + 1, stage: s.stage + 1, text: text.trim() };
  if (note.text) s.notes.push(note);
  if (s.noteKind === 'camp') enterMap(s);
  else if (s.noteKind === 'fight') s.phase = 'reward';
  else if (s.life + 1 === LIVES) s.phase = 'complete';
  else {
    // Carry only the player's notes. Crossing into field II carries the last conclusion.
    s.carried = s.life === 1 ? (note.text ? [note] : []) : s.notes.filter(row => row.life === 1);
    s.life++;
    beginLife(s, s.life === 2);
  }
  return note;
}

export function act(s, input) {
  if (s.phase === 'combat') {
    const camp = campOpen(s);
    if (camp) s.campSteps++;
    let result;
    switch (input.kind) {
      case 'play': result = playCard(s, input.index); break;
      case 'end': result = { triggers: endTurn(s) }; break;
      case 'leave': requireAction(camp); finishCamp(s); break;
      case 'reset': requireAction(camp); beginFight(s, 'camp'); log(s, 'reset'); break;
      default: throw new InvalidAction('invalid_action');
    }
    if (campOpen(s) && s.campSteps >= CAMP_STEPS) finishCamp(s);
    return result ?? {};
  }
  if (s.phase === 'note') {
    requireAction(input.kind === 'note');
    return { note: submitNote(s, input.text) };
  }
  if (s.phase === 'route') {
    requireAction(input.kind === 'route' && [0, 1].includes(input.index));
    const { role, mechanic } = s.plan[s.stage];
    requireAction(role !== 'guardian' || input.index === 0);
    beginFight(s, role, mechanic, input.index);
    return {};
  }
  if (s.phase === 'reward') {
    requireAction(input.kind === 'reward' && [0, 1, 2, 3].includes(input.index));
    if (input.index < 3) {
      const type = TYPES[input.index];
      s.deck.push(type);
      log(s, 'reward', { name: card(s, type) });
    }
    advance(s);
    return {};
  }
  if (s.phase === 'rest') {
    requireAction(input.kind === 'rest' && [0, 1].includes(input.index));
    const before = values(s);
    const p = s.player;
    const w = world(s);
    if (input.index === 0) p.hp = Math.min(p.cap, p.hp + Math.floor(p.cap * w.rest));
    else {
      p.cap = Math.min(w.cap, p.cap + Math.round(w.cap * w.repair));
      p.poison = 0;
    }
    log(s, 'rest', { changes: diff(s, before) });
    advance(s);
    return {};
  }
  throw new InvalidAction('invalid_action');
}

export function publicView(s) {
  const f = s.fight;
  const combat = s.phase === 'combat';
  const camp = campOpen(s);
  return {
    phase: s.phase, life: s.life + 1, field: field(s), stage: s.stage + 1,
    path: ['fight', 'fight', 'rest', 'fight', 'fight', 'rest', 'gate'],
    camp, turnsLeft: camp ? CAMP_TURNS - f.turn + 1 : null,
    noteKind: s.phase === 'note' ? s.noteKind : null,
    fate: s.lives[s.life]?.cleared ?? null, lives: s.lives,
    guardian: s.phase === 'route' && s.plan[s.stage].role === 'guardian',
    turn: combat ? f.turn : null,
    you: combat ? slots(s, 'me', ['hp', 'cap', 'attack', 'energy'], ['block', 'poison', 'double', 'dodge']) : [],
    them: combat ? slots(s, 'them', ['hp', 'attack'], ['charge']) : [],
    name: combat && !camp ? f.name : null, echo: combat ? f.echo : null,
    hand: combat ? f.hand.map(type => ({ name: card(s, type), cost: s.costs.includes(type) ? COST[type] : null })) : [],
    rewards: s.phase === 'reward' ? TYPES.slice(0, 3).map(type => card(s, type)) : [],
    log: s.log, carried: s.carried,
  };
}
