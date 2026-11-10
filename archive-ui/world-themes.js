/* Cosmetic worlds. References describe art direction, never rules. Only opaque
 * style/variation data reaches this module; no engine seed, map or card identity.
 * Every part of a look (scene, palette, frame, type, token) is chosen independently
 * by look.js; this module only turns those indices into pictures and CSS. */
(function () {
  'use strict';
  const rows = [
    ['粗砺地牢','Might and Magic II','pixel','retro','080808 090909 eee9d9 b5ae9e b52332 e8cb72 841722 202650 78532e 364f97 18244d','https://zh.wikipedia.org/wiki/魔法门II：异世界之门'],
    ['石殿回声','Dungeon Master','pixel','carved','171713 26261d e8dfbc b8ad8a a5a178 d8b960 6e7158 242a29 53523b 747965 3d473f','https://en.wikipedia.org/wiki/Dungeon_Master_(video_game)'],
    ['赤铁熔炉','DOOM','pixel','riveted','14100f 24201c f2dfbb bba58d ca653a edb640 815142 221e22 573e2d 694834 29292a','https://store.steampowered.com/app/2280/DOOM__DOOM_II/'],
    ['翡翠主机','System Shock','terminal','terminal','050f0d 0a211b c5ffb5 83c7a2 71e993 d4fa70 2b7557 071d22 123937 22524a 0d302a','https://store.steampowered.com/app/482400/System_Shock/'],
    ['远航舱室','Alien: Isolation','sans','orbital','171f20 243031 f1ead1 b2beb2 e7c983 88bcb8 819b8f 8a9b95 565d53 a4b1a4 353e3c','https://store.steampowered.com/app/214490/Alien_Isolation/'],
    ['晶莹遗境','Hyper Light Drifter','pixel','neon','150b2a 231138 f6dbf4 b89ec9 f265bf 63f7d6 833279 271746 453055 5952a1 352b5c','https://www.heartmachine.com/home'],
    ['沉海金宫','BioShock','serif','deco','081a1e 102b30 e8ddbd 96b9b7 c8a466 62c5c8 8d7950 073b48 36463d 397180 1b434d','https://store.2k.com/game/buy-bioshock'],
    ['流沙长歌','Journey','serif','cloth','392d28 514033 f3dfb2 cdb68c deae61 a65742 9b704b cf995e 9c5f3e e9c77d 774739','https://thatgamecompany.com/journey/'],
    ['墨岚山水','Ōkami','serif','ink','e2d9bb f2e9d1 302f29 55543e a7413e 5f8070 8d8061 e7dfc9 c6b895 a0af9d 5e7063','https://www.okami-game.com/'],
    ['苍月空庭','Hollow Knight','serif','gothic','080e1a 101d2c e2eaf6 99adc7 9faece 80c8e1 4a6283 142840 182d43 315572 101e32','https://www.hollowknight.com/'],
    ['无声剪影','LIMBO','sans','silhouette','111111 202020 e1e1dc a4a4a0 bdbdb6 888888 606060 a5a5a0 272929 737675 161918','https://playdead.com/games/limbo/'],
    ['流萤秘林','Ori','sans','organic','071d20 102d2e e5f6dc 9ccbc7 8adeb4 81c4ff 447b70 12354b 164942 377b7c 113c3e','https://www.orithegame.com/'],
    ['雨蚀温室','Rain World','pixel','rust','171d23 222c31 e0e3c8 acb4a3 c3be72 94c3c0 687e78 53696c 3e5550 82948a 293e3b','https://rainworldgame.com/'],
    ['雾港厚涂','Disco Elysium','serif','paint','292d2b 383d36 e9dfc1 b9b5a0 e1986c a5bbaa 81796a a5b5af 807663 b7997d 485957','https://discoelysium.com/'],
    ['赭金圣墟','Blasphemous','pixel','relic','22151b 332025 f0d8af bba497 c2a364 b35f65 896350 413547 6f4035 9e7454 422b32','https://www.team17.com/games/blasphemous'],
    ['黑陶冥殿','Hades','serif','greek','131a19 1c2926 f2e3bd b0b99a e0ba65 d76456 82704b 222d32 28453d 496b5b 1b332f','https://www.supergiantgames.com/games/hades/'],
    ['荒枝墨绘',"Don't Starve",'sketch','sketch','29261f 3a362b e4d6b5 bfb28f c9aa64 9baa79 8c7856 b6ac8f 706b4d 817d61 383c31','https://www.klei.com/games/dont-starve'],
    ['胶片奇谭','Cuphead','serif','toon','dfc797 f1e1b9 403025 624a35 b55338 567f76 876243 d5d59d b8b76e b1b87b 627449','https://cupheadgame.com/'],
    ['折纸群岛','Paper Mario','sans','paper','e3daca f6ecda 3c4a45 4e5d50 c16b52 538f8b 799b91 b5d9d1 96b99c 77a6a0 537e76','https://www.nintendo.com/us/store/products/paper-mario-the-origami-king-switch/'],
    ['黑帆版画','Return of the Obra Dinn','terminal','etch','222d29 303b34 e4e4c8 bdc3a7 dce1bb a4b394 929f85 c5ceb2 435343 8a9a7c 263c30','https://obradinn.com/'],
    ['四阶绿境',"Link’s Awakening (Game Boy)",'pixel','handheld','172d25 294735 d7e5a4 9fbc79 b4d17f 748f55 718d57 b3cc8b 4e7148 839e5e 284b37','https://www.nintendo.com/us/store/products/game-boy-nintendo-switch-online-switch/'],
    ['浮空纪元','Chrono Trigger','pixel','ornate','141e38 202e4a ede6c4 adbacb deba71 86c7d4 827555 536c9e 757e72 a1a78e 4f626b','https://www.square-enix-games.com/en_US/games/chrono-trigger'],
    ['紫电雨巷','Katana ZERO','pixel','neon','0f1020 1b1731 f6dff1 bfa3c9 f272ba 67e5ed 883e8a 151e3b 222847 364b68 21162f','https://store.steampowered.com/app/460950/Katana_ZERO/'],
    ['异星脉冲',"No Man’s Sky",'sans','space','12222b 1b3540 e5f1e9 a2c8cd 7de1d5 e4b07c 4e8390 51949c 7a5d6e c1888b 48556d','https://www.nomanssky.com/'],
    ['冰环余烬','Frostpunk','serif','frost','182633 243b49 e2edf0 a9c5d1 caaa74 98d0df 6d91a0 6d91a2 708c97 b5cbd1 354e5c','https://11bitstudios.com/games/frostpunk/'],
    ['铜锈工坊','Machinarium','sketch','brass','27231c 3b3427 e6d9b5 b5ad8e c7a86a 8fa99c 8b7752 adaa8c 797254 9d8b66 525b49','https://amanita-design.net/games/machinarium.html'],
    ['白垩余城','NieR:Automata','sans','minimal','cbc9b9 e2dfcc 383d36 505647 797c63 947f61 919581 c5c8ba 939e8a b0b7a5 687b70','https://www.platinumgames.com/works/nier-automata'],
    ['琥珀废土','Fallout','terminal','crt','1e2012 2c301c f2e7b3 bfb97e dcbd65 9cbb6d 7d824e a5a578 656649 8d9165 3e4933','https://fallout.bethesda.net/'],
    ['珊瑚梦海','ABZÛ','sans','glass','05232f 0a3945 dcfcf1 99cbcb 6be4ce edbb7c 367f8b 116b89 216776 369bad 124b65','https://abzugame.com/'],
    ['风色诗境','GRIS','serif','watercolor','e1dbe0 f4eef0 594e63 61556b b75d81 659596 b8a4b3 d8b9ca b5b3c9 c3d4d0 8a9fb9','https://nomada.studio/gris-game/']
  ];
  const keys = ['bg','panel','ink','muted','accent','accent2','edge','sky','ground','far','near'];
  const themes = rows.map((row,id) => Object.freeze({id,name:row[0],reference:row[1],type:row[2],frame:row[3],
    palette:Object.freeze(Object.fromEntries(row[4].split(' ').map((value,i)=>[keys[i],'#'+value]))),source:row[5]}));
  const states = new WeakMap();
  // Every type setting stays a game face: the bundled bitmap font or a monospace
  // terminal face, varied in size and spacing. No proportional web fonts.
  const TYPE = {
    pixel:    {font:"'AGIIPixel','Courier New',monospace", size:'20px', line:'1.3', spacing:'0px'},
    terminal: {font:"'Courier New','Consolas','Liberation Mono',monospace", size:'17px', line:'1.45', spacing:'0px'},
    sans:     {font:"'AGIIPixel','Courier New',monospace", size:'18px', line:'1.35', spacing:'1px'},
    serif:    {font:"'AGIIPixel','Courier New',monospace", size:'22px', line:'1.25', spacing:'0px'},
    sketch:   {font:"'Courier New','Consolas','Liberation Mono',monospace", size:'16px', line:'1.5', spacing:'1px'}
  };
  const ROUNDED = ['organic','glass','space','toon','paper','watercolor'];
  const classic = Object.freeze({scene:0, palette:0, frame:0, type:0, token:0, variant:0});
  // look = {scene, palette, frame, type, token, variant}: each index points into the 30 worlds on its own.
  function resolve(value) {
    const ok = value && ['scene','palette','frame','type'].every(k => Number.isInteger(value[k]) && value[k]>=0 && value[k]<themes.length)
      && Number.isInteger(value.token) && value.token>=0 && value.token<3 && Number.isInteger(value.variant) && value.variant>=0;
    const look = ok ? value : classic;
    return {look, sceneTheme:themes[look.scene], palette:themes[look.palette].palette, frame:themes[look.frame].frame,
            type:themes[look.type].type, token:look.token, variant:look.variant>>>0};
  }
  function current(doc) { return states.get(doc) || resolve(null); }
  function same(a, b) { return ['scene','palette','frame','type','token','variant'].every(k => a[k]===b[k]); }
  // Returns true when the page changed, so the caller can redraw the backdrop.
  function apply(value, doc=document) {
    const next=resolve(value), old=states.get(doc);
    if (old && same(old.look, next.look)) return false;
    states.set(doc,next);
    const style=doc.body.style;
    doc.body.dataset.world=String(next.sceneTheme.id);
    doc.body.dataset.frame=next.frame;
    doc.body.dataset.type=next.type;
    for (const [key,color] of Object.entries(next.palette)) style.setProperty('--w-'+key,color);
    const type=TYPE[next.type]||TYPE.pixel;
    style.setProperty('--world-font',type.font);
    style.setProperty('--world-text-size',type.size);
    style.setProperty('--world-line-height',type.line);
    style.setProperty('--world-letter-spacing',type.spacing);
    style.setProperty('--world-radius',ROUNDED.includes(next.frame)?'6px':'0px');
    return true;
  }
  // The scene is drawn by the scene world, coloured by the palette world: independent.
  function sceneFor(doc,state) {
    const id=state.sceneTheme.id;
    if (id===0) { const scene=window.AGIIClassic.makeScene(doc); scene.classList.add('pixel-art'); return scene; }
    if (window.AGIIWorldArt && window.AGIIWorldArt.has(id)) return window.AGIIWorldArt.makeScene(doc,state.sceneTheme,state.variant);
    return window.AGIIWorldScenes.makeScene(doc,{...state.sceneTheme,palette:state.palette},state.variant);
  }
  // Figures: -1 is the camp post; otherwise {actor, kind, variant} drawn in the actor
  // world's own colours, never following the scene.
  function figureFor(doc,figure) {
    if (figure===-1 || figure===null || figure===undefined) { const post=window.AGIIVisual.makeClassicFigure(doc,-1); post.classList.add('pixel-art'); return post; }
    const actor=Math.max(0,Math.min(themes.length-1,Number(figure.actor)||0)), kind=((Number(figure.kind)||0)%4+4)%4, variant=(Number(figure.variant)>>>0);
    if (actor===0) { const sprite=window.AGIIVisual.makeClassicFigure(doc,kind); sprite.classList.add('pixel-art'); return sprite; }
    if (window.AGIIWorldArt && window.AGIIWorldArt.has(actor)) return window.AGIIWorldArt.makeFigure(doc,themes[actor],kind,variant);
    return window.AGIIWorldActors.makeFigure(doc,themes[actor],kind,variant);
  }
  function makeScene(doc) { return sceneFor(doc,current(doc)); }
  function makeFigure(doc,figure) { return figureFor(doc,figure); }
  function makeToken(doc) {
    const state=current(doc), p=state.palette, ns='http://www.w3.org/2000/svg';
    if (state.sceneTheme.id===0 && state.token===0) { const token=window.AGIIVisual.makeClassicToken(doc); token.classList.add('pixel-art'); return token; }
    const svg=doc.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 40 40'); svg.setAttribute('aria-hidden','true'); svg.setAttribute('focusable','false');
    const add=(tag,attrs)=>{const node=doc.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);svg.append(node);};
    // Three unmarked card faces, the same face for every card in hand; chosen by the
    // token dimension alone, unrelated to card names or effects.
    if (state.token===0) {
      add('path',{d:'M7 4H30L35 10V32L29 36H5V9Z',fill:p.panel,stroke:p.edge,'stroke-width':3});
      add('path',{d:'M11 11H28V29H11Z',fill:p.accent,'fill-opacity':'.28',stroke:p.accent,'stroke-width':2});
      add('path',{d:'M15 16H24M15 22H24',stroke:p.accent2,'stroke-width':2});
    } else if (state.token===1) {
      add('path',{d:'M9 3L31 6 34 29 26 36 5 31 7 15Z',fill:p.accent2,stroke:p.edge,'stroke-width':2});
      add('path',{d:'M12 8L26 10 29 28 11 28Z',fill:p.panel,'fill-opacity':'.7'});
      add('path',{d:'M8 31L26 36 24 29Z',fill:p.accent});
    } else {
      add('path',{d:'M20 3L34 12V28L20 37 6 28V12Z',fill:p.panel,stroke:p.edge,'stroke-width':3});
      add('path',{d:'M20 9L28 16V25L20 31 12 25V16Z',fill:p.accent2,'fill-opacity':'.45',stroke:p.accent,'stroke-width':2});
      add('path',{d:'M12 16L20 9 28 16',fill:'none',stroke:p.ink,'stroke-opacity':'.45','stroke-width':2});
    }
    return svg;
  }
  window.AGIIWorld = Object.freeze({themes,resolve,apply,current,makeScene,makeFigure,makeToken,sceneFor,figureFor});
})();
