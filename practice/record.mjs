import { canPlay, hand, worlds } from './game.mjs';

const MAX_ACTIONS = 1000;
export const NOTE_LIMIT = 600;

export function newRecord(startedMidRun = false) {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return {
    version: 1,
    id: Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(''),
    startedAt: Date.now(),
    startedMidRun,
    omittedActions: 0,
    actions: [],
    note: '',
  };
}

export function loadRecord(stored, run) {
  if (stored?.version === 1 && typeof stored.id === 'string' && /^[0-9a-f]{24}$/.test(stored.id)
    && Number.isSafeInteger(stored.startedAt) && typeof stored.startedMidRun === 'boolean'
    && Number.isSafeInteger(stored.omittedActions) && stored.omittedActions >= 0
    && typeof stored.note === 'string' && stored.note.length <= NOTE_LIMIT
    && Array.isArray(stored.actions) && stored.actions.length <= MAX_ACTIONS
    && stored.actions.every(action => Number.isSafeInteger(action?.elapsedMs) && action.elapsedMs >= 0)) {
    return stored;
  }
  const startedMidRun = run.world > 0 || run.turn > 1 || run.phase !== 'battle'
    || run.log.length > 0 || run.found.some(Boolean);
  return newRecord(startedMidRun);
}

function visibleState(run) {
  return {
    universe: run.world + 1,
    styleId: worlds[run.world].art,
    turn: run.turn,
    phase: run.phase,
    health: run.health,
    sentinelHealth: run.enemy,
    energy: run.energy,
    guard: run.guard,
    playedCards: [...run.played],
    availableCards: hand.filter(key => canPlay(run, key)),
    discoveredUniverses: run.found.flatMap((found, index) => found ? [index + 1] : []),
  };
}

export function recordAction(record, action, before, after, language) {
  const last = record.actions[record.actions.length - 1];
  const entry = {
    step: record.omittedActions + record.actions.length + 1,
    elapsedMs: Math.max(last?.elapsedMs ?? 0, Date.now() - record.startedAt),
    language,
    action,
    before: visibleState(before),
    after: visibleState(after),
  };
  if (action === 'play_card' || action === 'end_turn') {
    entry.effect = after.log[after.log.length - 1];
  }
  if (record.actions.length === MAX_ACTIONS) {
    record.actions.shift();
    record.omittedActions += 1;
  }
  record.actions.push(entry);
}

export function exportRecord(record, run) {
  const finalState = visibleState(run);
  return {
    format: 'transverse-practice-record',
    version: 1,
    runId: record.id,
    timing: 'Milliseconds since local recording began, including time away from the page.',
    coverage: {
      startedMidRun: record.startedMidRun,
      omittedActions: record.omittedActions,
    },
    summary: {
      status: run.phase,
      universesCleared: run.world + Number(run.phase === 'cleared' || run.phase === 'complete'),
      rulesDiscovered: finalState.discoveredUniverses.length,
      actionsRecorded: record.actions.length,
    },
    finalState,
    playerNote: record.note.trim(),
    actions: record.actions,
  };
}
