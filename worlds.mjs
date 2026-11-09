// Cosmetic catalogue from the bundled AGII GUI. Fields and monsters are
// assigned from independent hashes of the anonymous run ID and visible steps.
const rows = [
  ['粗砺地牢', 'Roughstone Dungeon', 'retro', 'pixel', '080808 090909 eee9d9 b5ae9e b52332 e8cb72 841722'],
  ['石殿回声', 'Echoes in Stone', 'relic', 'pixel', '171713 26261d e8dfbc b8ad8a a5a178 d8b960 6e7158'],
  ['赤铁熔炉', 'Red-Iron Furnace', 'retro', 'pixel', '14100f 24201c f2dfbb bba58d ca653a edb640 815142'],
  ['翡翠主机', 'Jade Mainframe', 'terminal', 'terminal', '050f0d 0a211b c5ffb5 83c7a2 71e993 d4fa70 2b7557'],
  ['远航舱室', 'Longhaul Deck', 'orbital', 'sans', '171f20 243031 f1ead1 b2beb2 e7c983 88bcb8 819b8f'],
  ['晶莹遗境', 'Crystal Vestiges', 'terminal', 'pixel', '150b2a 231138 f6dbf4 b89ec9 f265bf 63f7d6 833279'],
  ['沉海金宫', 'Sunken Gilded Hall', 'relic', 'serif', '081a1e 102b30 e8ddbd 96b9b7 c8a466 62c5c8 8d7950'],
  ['流沙长歌', 'Song of Shifting Sand', 'paper', 'serif', '392d28 514033 f3dfb2 cdb68c deae61 a65742 9b704b'],
  ['墨岚山水', 'Ink-Mist Mountains', 'paper', 'serif', 'e2d9bb f2e9d1 302f29 55543e a7413e 5f8070 8d8061'],
  ['苍月空庭', 'Pale Moon Court', 'relic', 'serif', '080e1a 101d2c e2eaf6 99adc7 9faece 80c8e1 4a6283'],
  ['无声剪影', 'Silent Silhouettes', 'retro', 'sans', '111111 202020 e1e1dc a4a4a0 bdbdb6 888888 606060'],
  ['流萤秘林', 'Firefly Thicket', 'organic', 'sans', '071d20 102d2e e5f6dc 9ccbc7 8adeb4 81c4ff 447b70'],
  ['雨蚀温室', 'Rainworn Greenhouse', 'retro', 'pixel', '171d23 222c31 e0e3c8 acb4a3 c3be72 94c3c0 687e78'],
  ['雾港厚涂', 'Fogpaint Harbor', 'paper', 'serif', '292d2b 383d36 e9dfc1 b9b5a0 e1986c a5bbaa 81796a'],
  ['赭金圣墟', 'Ochre Sanctum', 'relic', 'pixel', '22151b 332025 f0d8af bba497 c2a364 b35f65 896350'],
  ['黑陶冥殿', 'Black Ceramic Hall', 'relic', 'serif', '131a19 1c2926 f2e3bd b0b99a e0ba65 d76456 82704b'],
  ['荒枝墨绘', 'Bramble Etching', 'paper', 'serif', '29261f 3a362b e4d6b5 bfb28f c9aa64 9baa79 8c7856'],
  ['胶片奇谭', 'Tales on Film', 'paper', 'serif', 'dfc797 f1e1b9 403025 624a35 b55338 567f76 876243'],
  ['折纸群岛', 'Folded Archipelago', 'paper', 'sans', 'e3daca f6ecda 3c4a45 4e5d50 c16b52 538f8b 799b91'],
  ['黑帆版画', 'Black-Sail Print', 'retro', 'terminal', '222d29 303b34 e4e4c8 bdc3a7 dce1bb a4b394 929f85'],
  ['四阶绿境', 'Four-Tone Green', 'retro', 'pixel', '172d25 294735 d7e5a4 9fbc79 b4d17f 748f55 718d57'],
  ['浮空纪元', 'Floating Epoch', 'relic', 'pixel', '141e38 202e4a ede6c4 adbacb deba71 86c7d4 827555'],
  ['紫电雨巷', 'Violet Rain District', 'terminal', 'pixel', '0f1020 1b1731 f6dff1 bfa3c9 f272ba 67e5ed 883e8a'],
  ['异星脉冲', 'Alien Pulse', 'orbital', 'sans', '12222b 1b3540 e5f1e9 a2c8cd 7de1d5 e4b07c 4e8390'],
  ['冰环余烬', 'Embers of the Ice Ring', 'orbital', 'serif', '182633 243b49 e2edf0 a9c5d1 caaa74 98d0df 6d91a0'],
  ['铜锈工坊', 'Verdigris Workshop', 'relic', 'serif', '27231c 3b3427 e6d9b5 b5ad8e c7a86a 8fa99c 8b7752'],
  ['白垩余城', 'Chalk Remnant', 'orbital', 'sans', 'cbc9b9 e2dfcc 383d36 505647 797c63 947f61 919581'],
  ['琥珀废土', 'Amber Wasteland', 'terminal', 'terminal', '1e2012 2c301c f2e7b3 bfb97e dcbd65 9cbb6d 7d824e'],
  ['珊瑚梦海', 'Coral Dream Sea', 'organic', 'sans', '05232f 0a3945 dcfcf1 99cbcb 6be4ce edbb7c 367f8b'],
  ['风色诗境', 'Watercolor Reach', 'organic', 'serif', 'e1dbe0 f4eef0 594e63 61556b b75d81 659596 b8a4b3'],
];

const layouts = { retro: 'stack', relic: 'stack', paper: 'folio', organic: 'folio', terminal: 'flanks', orbital: 'flanks' };
export const styles = rows.map(([zh, en, family, type, colors], id) => {
  const [bg, panel, ink, muted, accent, accent2, edge] = colors.split(' ').map(color => `#${color}`);
  return { id, zh, en, family, type, layout: layouts[family], palette: { bg, panel, ink, muted, accent, accent2, edge } };
});

function lookHash(value) {
  let h = 2166136261;
  for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

export function appearance(run, game) {
  const first = styles[lookHash(`${run}|world-first`) % styles.length];
  const alternatives = styles.filter(theme => theme.layout !== first.layout);
  const other = alternatives[lookHash(`${run}|world-second`) % alternatives.length];
  const encounter = `${run}|${game.life}|${game.camp ? 'camp' : game.stage}`;
  return {
    theme: game.field === 'II' ? other : first,
    actor: lookHash(`${encounter}|actor`) % styles.length,
    form: lookHash(`${encounter}|portrait`) % 4,
    sceneSeed: lookHash(`${run}|${game.field}|scene`),
    figureSeed: lookHash(`${encounter}|details`),
  };
}

export const worldAsset = (id, form) => `worlds/world-${String(id).padStart(2, '0')}${form == null ? '' : `-${form}`}.webp`;
