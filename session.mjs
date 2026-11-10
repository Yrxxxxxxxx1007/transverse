import { PROTOCOL, act, createGame, publicView } from './engine.mjs';
import { consentVersion } from './copy.mjs?v=9';
import { appearance } from './worlds.mjs';

export const runKey = 'transverse:expedition:1';
const isLanguage = value => value === 'en' || value === 'zh';

export function createLocalRun(lang) {
  const id = crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  return {
    protocol: PROTOCOL,
    consentVersion,
    id,
    seed,
    startLanguage: lang,
    startedAt: Date.now(),
    actions: [],
    state: createGame(seed),
  };
}

// The engine is deterministic. Keep the seed and actions in one save so an
// interrupted write cannot separate progress from its research record.
export function encodeLocalRun(run) {
  if (!run) return null;
  const { state, ...saved } = run;
  return JSON.stringify(saved);
}

export function decodeLocalRun(raw) {
  if (raw === null) return null;
  const saved = JSON.parse(raw);
  if (saved?.protocol !== PROTOCOL || typeof saved.id !== 'string' || !/^[a-f0-9-]{32,36}$/.test(saved.id)
    || !Number.isInteger(saved.seed) || saved.seed !== (saved.seed >>> 0)
    || !Number.isSafeInteger(saved.startedAt) || !isLanguage(saved.startLanguage)
    || !Array.isArray(saved.actions)) throw new Error('invalid_save');
  const state = createGame(saved.seed);
  let elapsedMs = 0;
  for (const action of saved.actions) {
    if (!action?.input || !isLanguage(action.language) || !Number.isSafeInteger(action.elapsedMs)
      || action.elapsedMs < elapsedMs) throw new Error('invalid_save');
    act(state, action.input);
    elapsedMs = action.elapsedMs;
  }
  return { ...saved, state };
}

export function sessionView(run) {
  return run ? { id: run.id, version: run.actions.length, game: publicView(run.state) } : null;
}

export function applyLocalMove(run, input, language, presentation) {
  const state = JSON.parse(JSON.stringify(run.state));
  act(state, input);
  const last = run.actions[run.actions.length - 1];
  const elapsedMs = Math.max(last?.elapsedMs ?? 0, Date.now() - run.startedAt);
  const entry = { input, language, elapsedMs, ...(presentation ? { presentation } : {}) };
  return { ...run, state, actions: [...run.actions, entry] };
}

function observation({ log, carried, lives, ...shown }) {
  return shown;
}

export function observedStep(input, before, after, logSeq = before.log[before.log.length - 1]?.id ?? 0) {
  return {
    input,
    observedBefore: observation(before),
    observedAfter: observation(after),
    log: after.log.filter(row => row.id > logSeq),
  };
}

export function exportLocalRun(run) {
  const state = createGame(run.seed);
  const actions = run.actions.map((entry, index) => {
    const before = publicView(state);
    const seq = state.logSeq;
    const { result } = act(state, entry.input);
    const after = publicView(state);
    const look = entry.presentation ? null : appearance(run.id, before);
    return {
      step: index + 1,
      ...entry,
      ...(result ? { result } : {}),
      ...observedStep(entry.input, before, after, seq),
      presentation: entry.presentation ?? { world: look.theme.id, ...(before.phase === 'combat' ? { portrait: [look.actor, look.form] } : {}) },
    };
  });
  return {
    format: 'transverse-expedition-record',
    version: 1,
    protocol: PROTOCOL,
    runId: run.id,
    seed: run.seed,
    startLanguage: run.startLanguage,
    consentVersion: run.consentVersion,
    timing: 'Milliseconds since this run began, including time away from the page.',
    summary: {
      status: state.phase === 'complete' ? 'complete' : 'in_progress',
      expedition: state.life + 1,
      expeditionsFinished: state.lives.length,
      expeditionsCleared: state.lives.filter(life => life.cleared).length,
      actionsRecorded: actions.length,
    },
    expeditions: state.lives,
    notes: state.notes,
    finalState: observation(publicView(state)),
    actions,
  };
}
