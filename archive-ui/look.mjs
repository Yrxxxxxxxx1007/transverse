/* Match the reference interface across expeditions. Scenery and figures use
 * the archive's cosmetic streams, independent of cards and combat rules. */
function fnv(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

function stream(seed) {
  let s = fnv(seed) || 0x9E3779B9;
  return function (n) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return n ? (s % n) : s; };
}

const COUNT = 30;
const screenshotPack = 'p13-6077236d';

function lifeLook(universe, life) {
  const base = `agii-look-v2:${universe}:${life}`;
  const pick = name => stream(`${base}:${name}`);
  return { scene: pick('scene')(COUNT), palette: pick('palette')(COUNT), frame: pick('frame')(COUNT),
    type: pick('type')(COUNT), token: pick('token')(3), variant: pick('variant')() };
}

function fightFigure(universe, life, fight) {
  const base = `agii-look-v2:${universe}:${life}:fight:${fight}`;
  const pick = name => stream(`${base}:${name}`);
  return { actor: pick('actor')(COUNT), kind: pick('kind')(4), variant: pick('variant')() };
}

const referenceLook = Object.freeze(lifeLook(screenshotPack, 1));

export function archiveAppearance(runId, game) {
  const life = game?.life ?? 1;
  let look = referenceLook;
  if (game?.field === 'II') {
    const { scene, variant } = lifeLook(runId, life);
    const nextScene = scene === referenceLook.scene ? (scene + 1 + variant % (COUNT - 1)) % COUNT : scene;
    look = { ...referenceLook, scene: nextScene, variant };
  }
  const figure = game?.phase === 'combat' ? game.camp ? -1 : fightFigure(runId, life, game.stage) : null;
  return { look, figure };
}
