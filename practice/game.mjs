export const MAX_HEALTH = 14;
export const TURN_ENERGY = 3;

export const cards = {
  cut: { cost: 1, damage: 3, guard: 0, heal: 0 },
  spark: { cost: 1, damage: 2, guard: 0, heal: 0 },
  ward: { cost: 1, damage: 0, guard: 3, heal: 0 },
  mend: { cost: 1, damage: 0, guard: 0, heal: 3 },
  pulse: { cost: 2, damage: 5, guard: 0, heal: 0 },
};
export const hand = Object.keys(cards);
const hasCard = key => Object.prototype.hasOwnProperty.call(cards, key);
export const worlds = [
  { art: 23, health: 10, attack: 3 },
  { art: 12, health: 12, attack: 4 },
  { art: 26, health: 14, attack: 5 },
];

function battle(world, found) {
  return {
    version: 1,
    world,
    found: [...found],
    phase: 'battle',
    turn: 1,
    health: MAX_HEALTH,
    enemy: worlds[world].health,
    guard: 0,
    energy: TURN_ENERGY,
    played: [],
    log: [],
  };
}

export function newRun() {
  return battle(0, worlds.map(() => false));
}

export function canPlay(run, key) {
  return run.phase === 'battle' && hasCard(key)
    && !run.played.includes(key) && run.energy >= cards[key].cost;
}

function record(run, event) {
  run.log = [...run.log.slice(-15), event];
  return run;
}

export function play(run, key) {
  if (!canPlay(run, key)) return run;
  const card = cards[key];
  const previous = cards[run.played[run.played.length - 1]];
  let damage = card.damage;
  let guard = card.guard;
  let bonus = 0;

  if (run.world === 0 && damage > 0 && previous?.damage > 0) {
    bonus = 2;
    damage += bonus;
  } else if (run.world === 1 && key === 'ward' && previous?.damage > 0) {
    bonus = 3;
    guard += bonus;
  } else if (run.world === 2 && key === 'pulse' && run.guard >= 3) {
    bonus = 4;
    damage += bonus;
  }

  const found = [...run.found];
  if (bonus > 0) found[run.world] = true;
  const enemy = Math.max(0, run.enemy - damage);
  const health = Math.min(MAX_HEALTH, run.health + card.heal);
  const phase = enemy > 0 ? 'battle' : run.world === worlds.length - 1 ? 'complete' : 'cleared';
  return record({
    ...run, found, enemy, health, phase, guard: run.guard + guard,
    energy: run.energy - card.cost, played: [...run.played, key],
  }, { type: 'card', key, damage: run.enemy - enemy, guard, heal: health - run.health, bonus });
}

export function endTurn(run) {
  if (run.phase !== 'battle') return run;
  const attack = worlds[run.world].attack;
  const blocked = Math.min(run.guard, attack);
  const health = Math.max(0, run.health - (attack - blocked));
  return record({
    ...run, health, phase: health > 0 ? 'battle' : 'defeated',
    turn: run.turn + 1, guard: 0, energy: TURN_ENERGY, played: [],
  }, { type: 'enemy', damage: run.health - health, blocked });
}

export function nextWorld(run) {
  return run.phase === 'cleared' ? battle(run.world + 1, run.found) : run;
}

export function retryWorld(run) {
  return run.phase === 'defeated' ? battle(run.world, run.found) : run;
}

const whole = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;

export function loadRun(raw) {
  try {
    const run = JSON.parse(raw);
    if (!run || run.version !== 1 || !whole(run.world, 0, worlds.length - 1)
      || !['battle', 'cleared', 'complete', 'defeated'].includes(run.phase)
      || !whole(run.turn, 1, Number.MAX_SAFE_INTEGER - 1) || !whole(run.health, 0, MAX_HEALTH)
      || !whole(run.enemy, 0, worlds[run.world].health) || !whole(run.guard, 0, 6)
      || !whole(run.energy, 0, TURN_ENERGY) || !Array.isArray(run.played)
      || !run.played.every(hasCard) || new Set(run.played).size !== run.played.length
      || !Array.isArray(run.found) || run.found.length !== worlds.length
      || !run.found.every(item => typeof item === 'boolean') || !Array.isArray(run.log) || run.log.length > 16) {
      return newRun();
    }
    const validLog = run.log.every(event => event && whole(event.damage, 0, 14) && (
      event.type === 'enemy' ? whole(event.blocked, 0, 5) :
        event.type === 'card' && hasCard(event.key) && whole(event.guard, 0, 6)
        && whole(event.heal, 0, 3) && whole(event.bonus, 0, 4)
    ));
    if (!validLog || (run.phase === 'cleared' && run.world === worlds.length - 1)
      || (run.phase === 'complete' && run.world !== worlds.length - 1)
      || (run.phase === 'battle' && (run.health === 0 || run.enemy === 0))) return newRun();
    return run;
  } catch {
    return newRun();
  }
}
