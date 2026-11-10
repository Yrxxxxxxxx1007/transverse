/* 外观合成：引擎只管战斗；外观从「GUI 包」里各部件独立随机抽取，互不绑定。
 * 输入只有公开的字符串：宇宙（包名）、第几世、第几场。不读 seed、salt、机制、数值、牌名。
 * 同一 (宇宙, 世) 永远合成同一套外观，刷新页面不变；换一世、换一个宇宙就全换。 */
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

export function archiveAppearance(runId, game) {
  const life = game?.life ?? 1;
  const look = lifeLook(life === 1 ? screenshotPack : runId, life);
  const figure = game?.phase === 'combat' ? game.camp ? -1 : fightFigure(runId, life, game.stage) : null;
  return { look, figure };
}
