/* Original decorative stages, inspired by the visual language of classic games.
 * This module receives cosmetic data only. Its geometry never represents rooms,
 * routes, exits, encounter properties, or other hidden game information.
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  function makeScene(doc, theme, variant) {
    const id = Math.max(0, Math.min(29, Number(theme && theme.id) || 0));
    let state = ((Number(variant) >>> 0) ^ Math.imul(id + 1, 0x9e3779b1)) >>> 0;
    const rand = () => {
      state += 0x6d2b79f5;
      let n = Math.imul(state ^ (state >>> 15), 1 | state);
      n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
      return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
    };
    const int = (a, b) => Math.floor(a + rand() * (b - a + 1));
    const choose = a => a[int(0, a.length - 1)];
    const root = doc.createElementNS(NS, 'svg');
    for (const [k, v] of Object.entries({ viewBox: '0 0 640 400', 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'xMidYMid slice', 'data-world-scene': id })) root.setAttribute(k, v);
    let active = root;
    const s = (tag, attrs = {}, parent = active) => {
      const node = doc.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
      parent.appendChild(node); return node;
    };
    const R = (x, y, width, height, fill, more = {}) => s('rect', { x, y, width, height, fill, ...more });
    const P = (d, fill, stroke = 'none', w = 1, more = {}) => s('path', { d, fill, stroke, 'stroke-width': w, ...more });
    const L = (x1, y1, x2, y2, stroke, w = 1, more = {}) => s('line', { x1, y1, x2, y2, stroke, 'stroke-width': w, ...more });
    const C = (cx, cy, r, fill, more = {}) => s('circle', { cx, cy, r, fill, ...more });
    const E = (cx, cy, rx, ry, fill, more = {}) => s('ellipse', { cx, cy, rx, ry, fill, ...more });
    const G = (attrs, draw) => { const before = active; active = s('g', attrs); draw(); active = before; };
    const defs = s('defs');
    let serial = 0;
    const gradient = (colors, radial = false) => {
      const uid = 'world-' + id + '-' + (Number(variant) >>> 0) + '-' + serial++;
      const node = s(radial ? 'radialGradient' : 'linearGradient', { id: uid, ...(radial ? {} : { x1: 0, x2: 0, y1: 0, y2: 1 }) }, defs);
      colors.forEach((c, i) => s('stop', { offset: i / (colors.length - 1), 'stop-color': c }, node));
      return 'url(#' + uid + ')';
    };
    const base = (sky, floor, horizon = 280) => { R(0, 0, 640, 400, sky); R(0, horizon, 640, 400 - horizon, floor); };
    const speckles = (n, bounds, colors, size = 2, opacity = 1) => {
      G({ opacity }, () => {
        for (let i = 0; i < n; i++) R(int(bounds[0], bounds[2]), int(bounds[1], bounds[3]), int(1, size), int(1, size), choose(colors));
      });
    };
    const starfield = (n, color, maxY = 220) => { for (let i = 0; i < n; i++) C(int(0, 640), int(0, maxY), rand() * 1.3 + .4, color, { opacity: .3 + rand() * .6 }); };
    const floorLines = (color, horizon = 275, spacing = 38) => {
      for (let y = horizon + 20; y < 400; y += spacing) L(0, y, 640, y, color, 2);
      for (let x = -300; x < 1000; x += 120) L(320 + (x - 320) * .16, horizon, x, 400, color, 2);
    };
    const cloud = (x, y, scale, fill) => G({ transform: `translate(${x} ${y}) scale(${scale})` }, () => { P('M0 15Q7 0 22 8Q25 -10 44 -3Q58 -8 64 7Q81 2 86 15Z', fill); });
    const bolt = (x, y, color, shade) => { C(x, y, 4, shade); L(x - 2, y - 2, x + 2, y + 2, color, 1.5); };
    const gear = (x, y, radius, fill, hub) => G({ transform: `translate(${x} ${y})` }, () => {
      for (let a = 0; a < 12; a++) R(-radius * .16, -radius * 1.12, radius * .32, radius * .38, fill, { transform: `rotate(${a * 30})` });
      C(0, 0, radius, fill); C(0, 0, radius * .68, hub); C(0, 0, radius * .25, fill);
      for (let a = 0; a < 6; a++) R(-radius * .07, -radius * .76, radius * .14, radius * .72, fill, { transform: `rotate(${a * 60})` });
    });

    switch (id) {
      case 0: { // Coarse, chipped EGA-style rocks; every mark uses a 4px grid.
        root.setAttribute('shape-rendering', 'crispEdges');
        base('#25226c', '#725024', 274);
        R(0, 0, 640, 276, '#080e3c');
        for (let row = 0; row < 6; row++) {
          let x = row % 2 ? -44 : -8;
          while (x < 640) {
            const w = int(16, 28) * 4, y = 16 + row * 44 + int(-1, 1) * 4;
            const h = int(10, 12) * 4, notch = int(4, 8) * 4;
            P(`M${x+12} ${y}H${x+notch}V${y+4}H${x+w-16}V${y+8}H${x+w-8}V${y+16}H${x+w}V${y+h-16}H${x+w-8}V${y+h-8}H${x+w-24}V${y+h}H${x+20}V${y+h-4}H${x+8}V${y+h-12}H${x}V${y+16}H${x+4}V${y+8}H${x+12}Z`, choose(['#4249ab','#4840a0','#34428b','#5554b5']), '#10133d', 4);
            P(`M${x+12} ${y+8}H${x+notch-4}V${y+12}H${x+w-20}V${y+16}H${x+w-12}V${y+20}H${x+w-24}V${y+16}H${x+24}V${y+20}H${x+8}V${y+16}H${x+12}Z`, '#737ac4');
            P(`M${x+8} ${y+24}H${x+20}V${y+32}H${x+28}V${y+h-8}H${x+16}V${y+h-12}H${x+8}Z`, '#6269b5');
            P(`M${x+w-24} ${y+24}H${x+w-8}V${y+h-16}H${x+w-16}V${y+h-8}H${x+28}V${y+h-12}H${x+w-32}V${y+h-20}H${x+w-24}Z`, '#252668');
            // Unsmoothed clusters produce chips and mottled stone at thumbnail size.
            for (let chip = 0; chip < 18; chip++) {
              const xx = x + int(3, w/4-5)*4, yy = y + int(4, h/4-3)*4;
              R(xx, yy, int(1, 3)*4, 4, choose(['#20236a','#32327e','#6d6fbc','#8888ce','#3a418d']));
              if (chip % 6 === 0) R(xx+4, yy+4, 4, 4, '#252668');
            }
            if (rand() > .48) P(`M${x+notch} ${y+4}v8h4v8h8v8`, 'none', '#171c51', 4);
            x += w;
          }
        }
        P('M0 272H48V268H100V276H176V272H232V276H324V268H408V276H496V272H572V268H640V284H0Z','#111339');
        P('M0 288H108V284H180V292H328V284H456V288H540V284H640','none','#aa7434',4);
        for (let chip = 0; chip < 280; chip++) {
          const x = int(0,159)*4, y = int(73,99)*4;
          R(x, y, int(1,3)*4, 4, choose(['#9c6d2c','#573c29','#bf8840','#493326','#86602c']));
          if (chip % 9 === 0) R(x+4,y-4,4,4,'#bd8948');
        }
        for (const x of [28, 584]) {
          R(x,56,24,176,'#141c51'); R(x+4,60,8,168,'#5961ae');
          P(`M${x-8} 52h12v-4h16v4h16v12h-44Z`,'#6c6bbe');
          P(`M${x-4} 236h12v-4h12v4h16v16h-40Z`,'#323e8b');
          for(let i=0;i<14;i++)R(x+int(1,4)*4,int(17,55)*4,4,int(1,2)*4,choose(['#8182c9','#303578','#424791']));
        }
        break;
      }
      case 1: { // Deep, heavily jointed stone, with solid recessed relief panels.
        base('#151713', '#3a382b', 272);
        for (let r = 0; r < 7; r++) for (let x = -50 + (r%2)*58; x < 640; x += 115) {
          R(x+2,r*40+2,111,36,choose(['#41463e','#484b40','#363d37']),{stroke:'#181e1b','stroke-width':3});
          L(x+5,r*40+5,x+108,r*40+5,'#687062',2);
          L(x+107,r*40+8,x+107,r*40+33,'#252b24',3);
        }
        for (const x of [48,512]) {
          R(x,40,80,209,'#202923',{stroke:'#767766','stroke-width':4}); R(x+9,52,62,182,'#303b32');
          P(`M${x+19} 80L${x+40} 64L${x+60} 80L${x+40} 122Z`,'#5b6557','#151e18',3);
          P(`M${x+20} 143L${x+40} 128L${x+59} 143V208H${x+20}Z`,'#4a5849');
        }
        for (const x of [0,152,454,606]) { R(x,0,32,275,'#53574c',{stroke:'#242b25','stroke-width':5});R(x+5,0,7,272,'#757465');for(let y=0;y<270;y+=49)L(x,y,x+32,y,'#272d28',4);R(x-7,0,46,17,'#6d6e5d');R(x-5,254,44,24,'#757061'); }
        floorLines('#22271e',274,35); speckles(130,[0,280,640,400],['#555746','#272d23'],3);
        P('M294 46l12 21-5 29 18 14-5 32','none','#171f1a',3);
        break;
      }
      case 2: { // Rust industrial slab and ducts, broad military silhouettes.
        base('#221713','#4a3026',286);
        R(45,30,550,224,'#493c31');
        for(let x=45;x<600;x+=70){R(x+3,34,64,211,choose(['#5b4635','#514338','#443b31']),{stroke:'#1d1b16','stroke-width':4});L(x+9,42,x+59,42,'#937153',3);for(const y of [45,239])bolt(x+13,y,'#a48b65','#231e18');}
        for(const x of [90, 494]){R(x,75,54,119,'#171b16',{stroke:'#877457','stroke-width':7});for(let y=84;y<193;y+=13)L(x+5,y,x+49,y,'#58604b',5);}
        for(const x of [3,584]){R(x,0,53,310,'#612b24',{stroke:'#191511','stroke-width':6});R(x+9,0,12,310,'#9a4532');for(let y=23;y<298;y+=52){R(x-4,y,62,17,'#342721');L(x,y+3,x+54,y+3,'#886649',3);}}
        R(0,0,640,33,'#231c17');for(let x=0;x<640;x+=48)P(`M${x} 5h23l-18 23h-23Z`,'#9c7035');
        R(0,252,640,22,'#1e201b');R(0,276,640,10,'#ab4831');floorLines('#271e18',292,38);
        for(let i=0;i<35;i++){const x=int(65,560),y=int(50,240);L(x,y,x+int(3,20),y-int(1,7),'#ac643f',2);}
        for(const x of [170,457]){R(x,46,11,35,'#311614');R(x+2,49,7,22,'#ec6b35');}
        break;
      }
      case 3: { // Cool green technology: no readable indicators or screens.
        base(gradient(['#061c20','#0e3638','#092323']),'#081b21',290);
        for(let x=0;x<640;x+=80){R(x+3,24,74,249,'#183f43',{stroke:'#06171e','stroke-width':3});L(x+13,35,x+13,256,'#285858',1);}
        for(const x of [43,498]){R(x,56,99,188,'#061e26',{rx:12,stroke:'#476d66','stroke-width':5});R(x+12,72,75,149,gradient(['#1a635b','#297f68','#124348']),{rx:32});E(x+49,76,38,11,'#78c48d',{opacity:.55});for(let j=0;j<18;j++)C(x+int(20,78),int(87,212),rand()*2+.6,'#9becb0',{opacity:.4});R(x+4,53,91,19,'#59706b');R(x+4,222,91,23,'#365450');}
        for(let x=156;x<492;x+=64){L(x,0,x,39,'#315351',10);L(x,0,x,37,'#a2b591',2);}
        R(151,92,340,92,'#102d31',{stroke:'#486460','stroke-width':3});
        for(let i=0;i<9;i++){R(169+i*35,109,21,58,'#183d3c');for(let j=0;j<5;j++)R(174+i*35,116+j*10,11,2,choose(['#447b63','#538e6f','#234e48']));}
        R(0,279,640,8,'#83c899');floorLines('#28534d',290,36);
        P('M0 12H203L220 32H420L437 12H640','none','#95c19e',5);
        for(const x of [9,622]){R(x,40,8,224,'#1a4c40');R(x+2,47,4,198,'#a9f9ba');}
        break;
      }
      case 4: { // Soft cream panels, bolted ribs, restrained retrofuturism.
        base('#697975','#9b9b85',290);
        P('M0 0H640V210L563 274H77L0 210Z','#c7c5a5','#263d39',8);
        for(const x of [15,93,531,607])P(`M${x} 0V192L${x<320?x+50:x-50} 271`,'none','#56635b',18);
        for(const x of [19,97,527,603])P(`M${x} 0V188L${x<320?x+50:x-50} 263`,'none','#eee4bf',5);
        R(178,34,284,117,'#e4dbb8',{rx:22,stroke:'#4b5d57','stroke-width':8});
        R(190,47,260,91,'#102e37',{rx:14});
        C(374,68,45,'#295766');C(386,63,37,'#527572');C(403,57,26,'#99a7a0');
        for(let i=0;i<21;i++)C(int(206,346),int(59,123),rand()+.5,'#a5cac5');
        for(const x of [167,413]){R(x,178,63,52,'#929c83',{rx:4,stroke:'#475d51','stroke-width':3});for(let y=185;y<225;y+=8)L(x+8,y,x+55,y,'#516957',2);}
        P('M245 182H395V235H245Z','#b8bfa2','#6e7f6c',3);L(262,192,378,192,'#eceacb',4);
        R(0,278,640,14,'#354c44');floorLines('#727d69',293,30);
        for(const x of [70,560]){R(x,301,10,83,'#455b4c');R(x+3,303,4,77,'#d8ca8f');}
        for(const x of [179,461])for(const y of [164,249])bolt(x,y,'#e8e1bc','#4c6257');
        break;
      }
      case 5: { // Prismatic ruins and sparse, hard-edged pixel silhouettes.
        root.setAttribute('shape-rendering','crispEdges');
        base('#352e6b','#3c3658',282);
        R(0,91,640,123,'#776196');P('M0 157L70 128H110V150L185 116H225L258 147L345 107H400L452 146H509L570 102H640V255H0Z','#58477f');
        for(let i=0;i<15;i++){const x=int(0,640),y=int(18,112);R(x,y,4,4,'#d994ba');}
        for(const x of [15,475]){
          P(`M${x} 260V149H${x+18}V112H${x+70}V140H${x+97}V204H${x+125}V279Z`,'#232d48');
          R(x+20,133,14,125,'#487d86');R(x+36,114,32,14,'#669fac');R(x+76,154,14,94,'#315b6a');
          R(x+18,195,79,8,'#9282a7');R(x+24,205,24,6,'#d9a7b3');
        }
        const shardX=int(284,349);
        P(`M${shardX} 23L${shardX+25} 87L${shardX} 137L${shardX-18} 91Z`,'#85e1df');P(`M${shardX} 23V137L${shardX-18} 91Z`,'#3fa2b2');
        P('M0 288L69 271H160L199 292H449L484 277H579L640 289V400H0Z','#484468');
        for(let i=0;i<33;i++){const x=int(0,620),y=int(306,390);R(x,y,int(7,30),3,choose(['#715d84','#a17696','#304454']));}
        for(const x of [60,546]){P(`M${x} 282L${x+17} 235L${x+35} 273L${x+26} 299Z`,'#9ce9db');P(`M${x+17} 235V294L${x+35} 273Z`,'#40748c');}
        break;
      }
      case 6: { // Underwater Art Deco fanwork; the ocean is inaccessible scenery.
        base('#0c2935','#1b3c3b',294);
        P('M87 259V78Q320 -56 553 78V259Z',gradient(['#2d7980','#205966','#102b46']),'#ad8752',8);
        for(let i=0;i<18;i++){const x=int(111,530),h=int(18,90);R(x,253-h,int(8,28),h,'#103d4c',{opacity:.5});}
        for(let i=0;i<20;i++)C(int(107,532),int(50,245),rand()*3+1,'#abd1bc',{opacity:.2});
        for(let a=-65;a<=65;a+=13){const rad=a*Math.PI/180;L(320,258,320+Math.sin(rad)*242,258-Math.cos(rad)*245,'#b5955d',3);}
        P('M105 255V91Q320 -25 535 91V255','none','#ebcc86',2);
        for(const x of [8,559]){R(x,0,72,290,'#203b3b',{stroke:'#080e18','stroke-width':5});for(let d=0;d<6;d++)R(x+8+d*9,18,3,260,'#a2824d');P(`M${x-7} 44L${x+36} 18L${x+79} 44V67H${x-7}Z`,'#b68d54');R(x-7,262,86,25,'#bc9657');}
        R(0,287,640,9,'#070e16');R(0,297,640,4,'#c5a264');
        for(let x=-10;x<660;x+=48)P(`M${x} 397l24 -24 24 24-24 24Z`,'#547069');
        P('M0 338H640M0 344H640','none','#426158',2);
        break;
      }
      case 7: { // Woven desert atmosphere and layered, wind-shaped dunes.
        base(gradient(['#a85f4c','#e4a77b','#f4d8a1']),'#bd744b',269);
        C(int(410,517),75,int(34,46),'#ffe5ac');
        P('M0 221Q116 127 265 226Q464 100 640 198V400H0Z','#d59b65');
        P('M0 258Q141 185 298 260Q464 180 640 227V400H0Z','#e9b77c');
        P('M0 294Q139 250 271 288Q451 223 640 280V400H0Z','#d1935e');
        P('M0 340Q157 289 343 324Q492 282 640 300V400H0Z','#bb744c');
        for(let i=0;i<32;i++){const y=int(291,398),x=int(0,640);P(`M${x} ${y}q${int(8,25)} -4 ${int(30,88)} -3`,'none',choose(['#d99762','#a96348']),1.3,{opacity:.55});}
        for(const [x,h] of [[76,148],[545,175]]){P(`M${x} 276L${x+13} ${h}L${x+40} ${h-9}L${x+48} 276Z`,'#965b46');P(`M${x+13} ${h}L${x+22} ${h+6}L${x+24} 276H${x}Z`,'#be8459');P(`M${x+18} ${h+20}q50 -21 78 6q-45 -5 -62 23Z`,'#ad4239');}
        G({opacity:.11},()=>{for(let y=0;y<400;y+=5)L(0,y,640,y,'#633f34',1);for(let x=0;x<640;x+=7)L(x,0,x,400,'#f9d5a4',.7);});
        break;
      }
      case 8: { // Ink wash: dry brush silhouettes, paper, cinnabar blossom.
        base('#e6dfc0','#cbc9ae',302);
        P('M0 246Q56 229 102 140Q136 100 178 212L248 244L321 134Q369 158 403 233L488 176L564 105L640 182V313H0Z','#b3bab0');
        P('M0 269L53 221L104 251L182 178Q194 167 211 205L245 265L299 248L370 224L398 272L514 242L579 177L640 237V320H0Z','#798f86');
        P('M110 231l46 -63-21 70m192 -4 24 -65 16 35m170 34 30 -63 31 49','none','#e2dcc2',7);
        P('M0 281Q153 260 326 279T640 276V303Q443 290 302 304T0 308Z','#eee8cd');
        P('M594 362Q581 277 586 191Q574 141 527 90L536 82Q592 109 606 165L640 225V400Z','#293b35');
        P('M592 203Q554 141 482 151Q522 136 561 161M584 170Q567 104 477 95Q540 67 584 135M578 127Q572 79 606 37M530 94Q500 84 490 50','none','#293b35',9,{'stroke-linecap':'round'});
        for(let i=0;i<52;i++){const x=int(455,622),y=int(45,157);C(x,y,rand()*4+2,choose(['#bf5e4f','#a7433f','#d08065']),{opacity:.72});}
        for(let i=0;i<14;i++){const x=int(0,136),y=int(320,395);P(`M${x} ${y}q-4 -${int(15,35)} -15 -${int(22,49)}m15 34q5 -23 17 -30`,'none','#4b6456',2);}
        speckles(110,[0,0,640,400],['#a0987d','#f8f1d8'],2,.18);
        break;
      }
      case 9: { // Blue-black cavern filigree and a distant cathedral of stone.
        base(gradient(['#071525','#172f48','#375364']),'#111e31',307);
        for(let x=0;x<640;x+=65){const h=int(90,160);P(`M${x} 286V${h+40}Q${x+29} ${h-28} ${x+58} ${h+40}V286Z`,'#162b42');P(`M${x+12} 270V${h+43}Q${x+29} ${h-2} ${x+46} ${h+43}V270`,'none','#314760',2);}
        for(const x of [12,579]){P(`M${x} 347Q${x+35} 260 ${x+16} 164Q${x-8} 98 ${x+15} 0H${x+62}Q${x+21} 103 ${x+46} 191Q${x+65} 278 ${x+62} 352Z`,'#080f21');}
        P('M0 0H640V42Q600 68 552 30L519 62L486 18L428 39L388 7L337 49L296 14L247 57L211 24L141 43L92 20L44 68L0 48Z','#090f23');
        for(const x of [86,111,542,563]){P(`M${x} 328q-15 -36 -4 -57`,'none','#314158',5);E(x-4,267,22,9,'#617890');P(`M${x-26} 270q22 -31 44 0Z`,'#8297ab');}
        for(let i=0;i<25;i++)C(int(68,571),int(71,280),rand()*1.5+.6,'#93b4c7',{opacity:.2+rand()*.4});
        P('M0 340Q130 299 276 329T640 335V400H0Z','#0c1728');
        P('M0 357Q160 329 293 351T640 357','none','#26394a',3);
        break;
      }
      case 10: { // Monochrome fog and severe forest silhouettes.
        base(gradient(['#a4aba3','#666e68','#c1c5b8']),'#252b29',321);
        C(int(380,473),92,36,'#d5d7cc',{opacity:.58});
        for(let i=0;i<15;i++){const x=int(-10,650),w=int(8,19);P(`M${x} 327L${x+8} 0H${x+w}L${x+w+14} 327Z`,'#5d6661',{opacity:.5});}
        for(const [x,flip] of [[51,1],[586,-1]])G({transform:`translate(${x} 0) scale(${flip} 1)`},()=>{
          P('M-39 400Q-4 330 -12 214Q2 131 -9 0H25Q12 167 32 278Q28 363 69 400Z','#101918');
          P('M4 135L-63 66L-76 16M15 211L73 155L101 73M54 172L33 131M-42 87L-101 79','none','#101918',11);
        });
        P('M0 338Q132 286 287 327Q465 298 640 334V400H0Z','#131c1a');
        for(let i=0;i<35;i++){const x=int(0,640),y=int(352,398);P(`M${x} ${y}l-3 -${int(8,18)} 7 9 4 -15`,'none','#060e0d',2);}
        for(let i=0;i<14;i++){const x=int(80,550),y=int(57,279);E(x,y,1.4,.7,'#dce0d5',{opacity:.55});}
        break;
      }
      case 11: { // Luminous layered woodland with botanical curves.
        base(gradient(['#06334b','#0c6374','#174b56']),'#123f44',304);
        E(324,170,222,198,gradient(['#4ea995','#144b67','#0b354e'],true),{opacity:.58});
        for(let i=0;i<9;i++){const x=int(0,640);P(`M${x} 317Q${x+50} 173 ${x+8} -30`,'none','#124958',int(10,25));}
        for(const [x,flip] of [[40,1],[600,-1]])G({transform:`translate(${x} 0) scale(${flip} 1)`},()=>{
          P('M-57 400Q5 319 -7 188Q23 115 -7 0H36Q70 115 40 200Q48 317 107 400Z','#092f42');
          P('M17 192Q64 126 127 105Q63 133 41 227M18 110Q-12 62 -66 52','none','#092f42',14);
          P('M32 23Q68 93 39 177','none','#327b77',3);
          P('M70 132Q126 159 103 215Q89 238 70 221Q53 203 83 195','none','#4dc7ab',3);
        });
        P('M0 325Q113 288 238 319T640 309V400H0Z','#174847');
        for(const x of [70,113,525,570]){P(`M${x} 347q9 -22 2 -44`,'none','#9ee6c5',3);P(`M${x-22} 308q21 -34 48 0Z`,'#47bba8');E(x+2,308,23,4,'#c3f6c5');}
        for(let i=0;i<50;i++){const x=int(0,640),y=int(320,400);P(`M${x} ${y}q-1 -${int(9,22)} ${int(-12,12)} -${int(14,27)}`,'none',choose(['#36776a','#26645f','#429779']),2);}
        for(let i=0;i<32;i++)C(int(54,586),int(72,312),rand()*1.8+.6,'#bcffd7',{opacity:.4+rand()*.5});
        break;
      }
      case 12: { // Rain-soaked concrete and overgrown obsolete machinery.
        base('#485f66','#29383d',301);
        for(let x=0;x<640;x+=84){R(x+3,0,79,286,choose(['#3a5158','#50666a','#354c55']),{stroke:'#23343c','stroke-width':3});for(let j=0;j<4;j++){const xx=x+int(4,65);R(xx,int(0,160),int(2,6),int(60,140),'#273d45',{opacity:.6});}}
        for(const x of [33, 542]){R(x,0,54,287,'#253c42',{rx:18,stroke:'#172a31','stroke-width':4});R(x+11,0,8,286,'#687971');for(let y=30;y<280;y+=58){R(x-5,y,65,12,'#647773');R(x-3,y+7,62,5,'#233a40');}}
        P('M114 0V117H258V55H378V118H526V0','none','#84918a',13);P('M114 0V117H258V55H378V118H526V0','none','#344e54',7);
        R(148,153,341,105,'#273e46',{stroke:'#627575','stroke-width':4});
        for(let x=154;x<489;x+=17)L(x,157,x,254,'#566c6c',1);for(let y=158;y<254;y+=16)L(151,y,485,y,'#455e64',1);
        for(const x of [13,96,515,580]){P(`M${x} 332q8 -38 18 -53`,'none','#678a76',4);E(x+17,278,24,8,'#a7b395');E(x+21,295,16,6,'#718e77');}
        E(305,352,146,13,'#44656b');E(498,321,54,6,'#5c787a');
        for(let i=0;i<74;i++){const x=int(0,640),y=int(0,400);L(x,y,x-4,y+int(9,22),'#a3b6ac',.6,{opacity:.26});}
        break;
      }
      case 13: { // Scraped paint, tilted coastal roofs, large expressionist masses.
        base('#b7b5a0','#6b6960',293);
        P('M0 167L83 150L177 186L264 154L385 171L477 147L640 155V293H0Z','#7b9490');
        for(const [x,w,h,c] of [[-10,110,194,'#536365'],[82,91,155,'#c2af87'],[158,59,117,'#897d6c'],[433,90,153,'#7a6d61'],[514,134,207,'#aaa586']]){
          P(`M${x} 294L${x+3} ${h}L${x+w-5} ${h-7}L${x+w} 294Z`,c);
          P(`M${x-8} ${h+2}L${x+w*.48} ${h-31}L${x+w+9} ${h-6}Z`,'#6e6259');
          for(let yy=h+17;yy<260;yy+=35)for(let xx=x+16;xx<x+w-10;xx+=24)P(`M${xx} ${yy}l11 -1-1 19-10 2Z`,'#465557');
        }
        P('M270 225L290 126L310 119L319 215M288 139L401 95L410 107L304 153','none','#5c6c68',8);
        P('M0 299L103 288L248 305L418 284L640 294V400H0Z','#747269');
        for(let i=0;i<126;i++){const x=int(-10,630),y=int(0,400);P(`M${x} ${y}l${int(5,28)} ${int(-5,2)}`,'none',choose(['#e6d2aa','#64817b','#304e57','#b28167','#8d9d92']),int(1,5),{opacity:.15+rand()*.18});}
        P('M38 400L86 305L69 286M567 400L533 303L557 281','none','#494f4a',4);
        break;
      }
      case 14: { // Tarnished gold tracery and austere carved stone reliefs.
        base('#3a252c','#614637',291);
        for(let x=-26;x<650;x+=90){P(`M${x} 267V93Q${x+45} 2 ${x+90} 93V267Z`,'#4e333a','#a3804f',5);P(`M${x+11} 266V98Q${x+45} 25 ${x+79} 98V266Z`,'#251e2a','#6d5144',3);}
        for(const x of [22, 557]){R(x,20,60,276,'#8d7654',{stroke:'#34252b','stroke-width':6});for(let z=0;z<4;z++)R(x+9+z*12,30,4,255,'#c1a16a');R(x-9,18,78,20,'#c7a367');R(x-12,276,85,19,'#aa854e');}
        C(320,94,44,'#63412f',{stroke:'#bb8e42','stroke-width':3});
        for(let a=0;a<12;a++){const t=a*Math.PI/6;L(320+Math.cos(t)*50,94+Math.sin(t)*50,320+Math.cos(t)*64,94+Math.sin(t)*64,'#987441',3);}
        P('M300 93L320 63L340 93L320 125Z','#a78046');P('M311 88L320 76L329 88L320 112Z','#d5b474');
        R(0,287,640,15,'#9b784d');R(0,304,640,5,'#30222a');
        for(let x=0;x<650;x+=54)P(`M${x} 312l27 14 27 -14`,'none','#ba9661',2);
        speckles(180,[0,0,640,400],['#d6b67c','#221b25'],2,.3);
        break;
      }
      case 15: { // Flattened ceramic red, black, and gilded Greek ornament.
        base('#201e2b','#392431',293);
        P('M85 245V75L320 14L555 75V245Z','#662d35','#b87546',4);
        P('M104 239V90L320 35L536 90V239Z','#24202d');
        for(const x of [34,529]){P(`M${x} 274L${x+11} 62H${x+59}L${x+70} 274Z`,'#b45443','#191b2b',5);for(let d=0;d<5;d++)L(x+18+d*8,70,x+12+d*11,263,'#e29866',2);R(x-11,50,92,17,'#d7a26b');P(`M${x-18} 48q18 -28 35 0h37q18 -28 35 0`,'none','#e6b577',5);R(x-8,273,86,15,'#cf8759');}
        P('M248 105L320 74L392 105L320 177Z','#8b3c3f');P('M263 108L320 91L377 108L320 156Z','#bd724b');P('M280 108L320 103L360 108L320 134Z','#282330');
        for(const y of [12,306])for(let x=0;x<650;x+=43)P(`M${x} ${y}h33v20h-23v-11h14`,'none','#b78054',3);
        P('M0 359L160 329L320 359L480 329L640 359V400H0Z','#5d333a');
        for(let i=0;i<24;i++){const x=int(0,640),y=int(325,400);L(x,y,x+int(9,40),y,'#956044',1.5);}
        break;
      }
      case 16: { // Scratchy ink and angular deadwood on old paper.
        base('#c0b08b','#9b906e',297);
        P('M0 285Q148 229 275 275Q441 237 640 282V400H0Z','#aaa17f');
        for(const [x,flip] of [[44,1],[586,-1],[151,1],[475,-1]])G({transform:`translate(${x} 0) scale(${flip} 1)`},()=>{
          P('M-30 336L1 258L-7 178L7 110L1 32L18 81L14 152L28 217L21 290L58 340Z','#4c4a3e','#272e29',3);
          P('M13 191L-32 135L-46 88L-42 125L-73 108M16 148L57 115L71 57L67 101L102 82M6 104L-25 58L-22 18','none','#30392f',5);
          P('M4 282L10 228L1 173M14 147L11 114','none','#b3a478',2);
        });
        for(let i=0;i<35;i++){const x=int(0,640),y=int(315,400);P(`M${x} ${y}l-8 -${int(8,24)} 8 9 3 -17 5 15 10 -8`,'none','#4d5941',2);}
        for(let i=0;i<100;i++){const x=int(0,640),y=int(0,400);L(x,y,x+int(2,9),y-int(2,8),'#554f3d',.7,{opacity:.15});}
        for(let i=0;i<4;i++){const x=int(222,392),y=int(49,144);P(`M${x} ${y}l9 -4 8 4m-8 -4l-4 -6`,'none','#756f54',1);}
        break;
      }
      case 17: { // Old-animation cel contours over a softly washed landscape.
        base(gradient(['#d3dfc5','#e8dcaa']),'#afbb75',301);
        for(let i=0;i<5;i++)cloud(int(-50,590),int(25,94),.6+rand()*.65,'#f0e7c7');
        P('M0 258Q74 141 159 247Q256 153 349 249Q451 146 531 247Q591 193 640 227V400H0Z','#8daa84','#73866c',2);
        P('M0 304Q136 221 288 290Q450 223 640 291V400H0Z','#b7be7a','#6a815c',2);
        for(const [x,flip] of [[49,1],[591,-1]])G({transform:`translate(${x} 0) scale(${flip} 1)`},()=>{
          P('M-28 335Q8 258 0 184L18 183Q17 267 53 338Z','#a07e58','#3f4c3c',3);
          P('M-51 189Q-64 161 -37 149Q-61 118 -26 104Q-13 75 12 93Q41 71 54 106Q86 101 82 135Q109 159 73 177Q67 207 42 194Q18 213 1 193Q-23 215 -51 189Z','#6e9463','#3f4c3c',3);
          P('M-27 146q18 -15 27 0m15 -24q23 -19 39 0m-9 49q14 -12 27 0','none','#b1bf83',3);
        });
        for(const x of [114,529]){P(`M${x} 372q10 -35 3 -65`,'none','#5e7951',4);for(let a=0;a<6;a++){const t=a*Math.PI/3;E(x+4+Math.cos(t)*11,307+Math.sin(t)*11,8,7,'#e2b478',{stroke:'#5f7350','stroke-width':1.5});}C(x+4,307,7,'#b98c5d');}
        speckles(230,[0,0,640,400],['#7d9368','#fff2c6'],2,.12);
        break;
      }
      case 18: { // Clearly folded paper silhouettes and offset cutout shadows.
        base('#a9d0c1','#94b290',300);
        C(int(390,458),70,39,'#f4dfa7');
        for(let i=0;i<4;i++)cloud(int(-40,580),int(28,117),.7+rand()*.5,'#eaf1db');
        P('M-10 274L123 118L239 269L371 153L517 277L611 193L659 284V400H0Z','#719da0');
        P('M-10 267L118 111L235 262L366 146L512 270L606 186L654 277V400H0Z','#9bb6ac');
        P('M118 111L123 254L-10 267Z','#b0c7b4');P('M366 146L360 261L235 262Z','#b4cab2');
        P('M0 319Q97 251 219 306Q399 253 640 304V400H0Z','#597f78');
        P('M0 310Q97 242 219 297Q399 244 640 295V400H0Z','#96b68d');
        for(const x of [54,565]){
          R(x+5,186,14,148,'#536958');R(x,182,14,148,'#8e9870');
          for(const [dy,w] of [[0,51],[39,65],[80,74]]){P(`M${x+10} ${127+dy}l${w} 66h-${w*2}Z`,'#557d78');P(`M${x+5} ${121+dy}l${w} 66h-${w*2}Z`,'#76a98b');P(`M${x+5} ${121+dy}v66h-${w}Z`,'#a2c29b');}
        }
        for(let i=0;i<12;i++){const x=int(10,630),y=int(345,395);P(`M${x} ${y}l-9 -16 10 7 9 -11-3 20Z`,'#6c9c78');}
        break;
      }
      case 19: { // Restricted two-tone engraving in a closed timber hold.
        base('#c2c6a9','#4e5850',290);
        for(let y=35;y<286;y+=27){R(0,y,640,23,'#b1b79d',{stroke:'#263831','stroke-width':2});for(let i=0;i<14;i++){const x=int(0,640);L(x,y+int(5,19),x+int(8,31),y+int(5,19),'#5e6d5d',1);}}
        for(const x of [29,554]){P(`M${x} 0H${x+49}V288L${x+37} 319H${x-8}Z`,'#33493d');for(let d=0;d<5;d++)P(`M${x+8+d*7} 6l-2 72 4 84-6 94`,'none','#a5b394',1);}
        for(const y of [19,267]){R(0,y,640,23,'#304437');for(let x=0;x<640;x+=17)L(x,y+2,x+11,y+20,'#b8c3a0',1);}
        C(322,133,71,'#344d41',{stroke:'#bfc6a5','stroke-width':7});C(322,133,56,'#97aa90',{stroke:'#243d31','stroke-width':4});
        for(let k=-50;k<=50;k+=8){const half=Math.sqrt(2500-k*k);L(322-half,133+k,322+half,133+k,'#536f5c',1.5);}
        P('M0 0Q115 67 149 0M456 0Q495 127 549 12','none','#253f32',9);P('M0 0Q115 67 149 0M456 0Q495 127 549 12','none','#d3d4b5',3,{'stroke-dasharray':'3 5'});
        for(let x=-80;x<700;x+=51){L(x,400,320+(x-320)*.48,291,'#d0d1af',2);L(x+4,400,324+(x-320)*.48,291,'#233c2d',1);}
        for(let i=0;i<75;i++){const x=int(0,640),y=int(310,400);L(x,y,x+int(2,15),y-2,'#abb899',1);}
        break;
      }
      case 20: { // Four-value handheld pixels, with a tile-ground silhouette.
        root.setAttribute('shape-rendering','crispEdges');
        const a='#d4dfac',b='#96ad75',c='#4b6b4b',d='#203c35';base(a,b,284);
        for(let i=0;i<5;i++){const x=int(0,140)*4,y=int(3,20)*4;P(`M${x} ${y+12}h12v-8h16v-4h20v8h16v12h-64Z`,b);}
        for(let x=-24;x<660;x+=80){P(`M${x} 264v-52h8v-32h16v-20h32v12h16v32h8v60Z`,c);P(`M${x+12} 254v-40h8v-28h12v-16h16v20h12v40h8v24Z`,b);R(x+32,178,8,28,a);}
        for(const x of [36,548]){R(x+12,184,20,120,d);P(`M${x-24} 222v-24h8v-28h16v-36h12v-28h20v28h16v36h16v28h8v24Z`,d);P(`M${x-12} 210v-24h16v-36h12v-24h8v24h12v36h16v24Z`,c);R(x+4,171,8,12,b);R(x-4,196,12,8,b);R(x+24,194,12,8,b);}
        R(0,279,640,9,d);R(0,290,640,4,a);
        for(let x=0;x<640;x+=24)for(let y=311;y<400;y+=28){if(rand()>.22){R(x+4,y,4,4,c);R(x+12,y+4,4,4,a);}}
        for(const x of [86,522]){R(x+12,309,8,20,d);P(`M${x} 313v-12h8v-8h16v8h8v12Z`,a,d,4);R(x+8,302,4,4,c);}
        break;
      }
      case 21: { // Warm 16-bit clouds and suspended antique stone masses.
        root.setAttribute('shape-rendering','crispEdges');
        base('#6296ae','#506975',308);R(0,113,640,72,'#8bb9c2');R(0,185,640,89,'#c0d3c3');
        for(let i=0;i<9;i++)cloud(int(-60,600),int(23,220),.7+rand()*1.2,choose(['#d8e2c4','#abc8c3','#eef0ce']));
        for(const [x,y,scale] of [[102,164,1],[461,115,.8],[321,73,.42]])G({transform:`translate(${x} ${y}) scale(${scale})`},()=>{
          P('M-72 0H62L48 21L24 33L5 72L-15 50L-34 27L-57 21Z','#4b6875');P('M-72 0L-15 11L5 72L-15 50L-34 27L-57 21Z','#6e8990');R(-65,-9,121,10,'#98ab8d');
          for(const xx of [-42,28]){R(xx,-82,12,76,'#d1c5a2');R(xx+8,-78,7,72,'#879789');R(xx-4,-87,23,8,'#ded1aa');R(xx-4,-13,23,9,'#617f79');}R(-46,-87,93,7,'#bdb692');
        });
        P('M0 323V271H41V256H91V275H122V302H182V320H464V307H537V271H582V281H640V400H0Z','#557986');
        R(0,326,640,9,'#c3ba97');R(0,335,640,65,'#737e7a');
        for(let x=0;x<640;x+=64){R(x+2,346,58,14,'#91978b');R(x+5,362,52,4,'#516d72');}
        speckles(60,[0,338,640,400],['#b5af92','#4c686c'],3);
        break;
      }
      case 22: { // Wet neon skyline: signs are abstract lights, never words.
        base(gradient(['#171b35','#252543','#513a52']),'#202b43',295);
        for(let x=-10;x<650;){const w=int(35,75),h=int(64,199);R(x,295-h,w,h,choose(['#232740','#1c263f','#2f324c']));for(let yy=302-h;yy<278;yy+=14)for(let xx=x+7;xx<x+w-5;xx+=12)if(rand()>.3)R(xx,yy,4,6,choose(['#596684','#775578','#435c79']));x+=w+5;}
        for(const x of [31,539]){R(x,45,59,220,'#101f37',{stroke:'#43394e','stroke-width':4});R(x+11,70,37,126,'#331f42',{stroke:x<300?'#ed5e99':'#5ecece','stroke-width':4});for(let y=87;y<182;y+=22)R(x+20,y,18,5,x<300?'#b84b80':'#398b9e');}
        P('M0 258H118L157 235H471L511 259H640','none','#141f35',16);
        P('M0 258H118L157 235H471L511 259H640','none','#627295',2);
        R(0,300,640,5,'#b45e88');
        for(let i=0;i<52;i++){const x=int(0,640),y=int(312,398);L(x,y,x+int(3,50),y,choose(['#725375','#35748a','#47465f']),int(1,3),{opacity:.65});}
        for(let i=0;i<110;i++){const x=int(0,650),y=int(0,400);L(x,y,x-7,y+int(8,23),'#9ca7c1',.6,{opacity:.26});}
        break;
      }
      case 23: { // Unfamiliar planetary skies and organically implausible plants.
        base(gradient(['#75659c','#bc849f','#e7b999']),'#9b746d',286);
        const planetX=int(320,416);C(planetX,76,71,'#d7ccaf');C(planetX-18,62,68,'#baa8a4');
        E(planetX,78,127,16,'none',{stroke:'#e8d7bc','stroke-width':5,transform:`rotate(-21 ${planetX} 78)`});
        C(int(92,166),58,18,'#edb88d');
        P('M0 265L48 233L96 163L132 248L211 222L264 267L391 236L446 153L472 131L499 242L551 227L640 259V400H0Z','#79627f');
        P('M0 305Q127 254 271 290Q450 240 640 290V400H0Z','#aa7f75');
        for(const x of [54,113,544,586]){const h=int(83,132);P(`M${x} 325q-17 -56 1 -${h}`,'none','#43666b',8);E(x+2,326-h,27,19,'#dc9a99',{stroke:'#795e78','stroke-width':3});P(`M${x-19} ${324-h}q23 -14 43 0`,'none','#f6c1aa',4);C(x+4,317-h,5,'#f0c4a4');}
        for(let i=0;i<35;i++){const x=int(0,640),y=int(321,400);P(`M${x} ${y}l${int(-9,9)} -${int(9,22)}`,'none',choose(['#dba895','#6f6970','#dfb195']),2);}
        break;
      }
      case 24: { // Frost-softened heavy steel, cable and cold exhaust.
        base(gradient(['#546c7d','#9cabb3','#d1d7d5']),'#a3b1b2',303);
        for(let x=0;x<640;x+=52){const h=int(70,160);R(x,291-h,40,h,'#74848b');P(`M${x-4} ${291-h}l24 -16 24 16Z`,'#c3cccc');}
        for(const x of [39,522]){R(x,69,78,240,'#4a636f',{stroke:'#304854','stroke-width':5});R(x+13,71,8,228,'#8c9fa6');for(let y=91;y<290;y+=48){R(x-8,y,95,15,'#617783');P(`M${x-10} ${y}h100v6l-18 -1-5 11-6 -11-29 2-15 -3-8 7-5 -8Z`,'#dce3df');}P(`M${x+5} 67q-8 -26 6 -48q14 -20 37 -12q43 13 18 60Z`,'#cbd5d4',{opacity:.52});}
        P('M0 25Q320 160 640 25M0 47Q320 180 640 47','none','#3e5865',2);
        R(174,207,293,54,'#536d79',{stroke:'#b7c4c8','stroke-width':3});for(let x=184;x<460;x+=23)L(x,213,x,255,'#365463',8);
        P('M0 309Q129 286 255 306Q453 287 640 309V400H0Z','#d6dfda');
        for(let i=0;i<80;i++){const x=int(0,640),y=int(0,400);L(x,y,x-2,y+3,'#eef3ea',1.6,{opacity:.7});}
        for(let i=0;i<25;i++){const x=int(0,640),y=int(329,400);L(x,y,x+int(10,35),y-1,'#aebdbb',1);}
        break;
      }
      case 25: { // Curved junkyard craft: brass, rivets, tubes, offset circles.
        base('#777a66','#9b967b',293);
        for(let x=-20;x<640;x+=94){R(x,0,90,284,choose(['#7e826b','#8d8d72','#686f60']),{stroke:'#4a594c','stroke-width':3});for(const yy of [12,264])for(const xx of [x+12,x+75])bolt(xx,yy,'#c0b08a','#4b5849');}
        for(const [x,y,r] of [[111,90,48],[531,103,62],[589,189,31],[48,214,36]])gear(x,y,r,'#6d7158','#434f42');
        P('M158 0V75Q158 100 184 100H425Q452 100 452 129V270','none','#4a594d',20);P('M158 0V75Q158 100 184 100H425Q452 100 452 129V270','none','#b29c72',13);P('M155 0V75Q155 104 182 104H425','none','#d1bd8c',3);
        for(const x of [18,562]){P(`M${x} 293V224Q${x+30} 196 ${x+59} 224V293Z`,'#ac9367','#4f5a45',4);E(x+30,224,30,9,'#c3af7f',{stroke:'#596148','stroke-width':3});for(let y=238;y<285;y+=16)L(x+5,y,x+54,y,'#7f7956',2);}
        R(223,146,196,73,'#636e5c',{rx:13,stroke:'#b19f75','stroke-width':5});for(let x=241;x<406;x+=17)L(x,159,x,204,'#3f5144',5);
        P('M0 298H640','none','#4b5946',8);
        for(let i=0;i<32;i++){const x=int(0,640),y=int(315,400);P(`M${x} ${y}l${int(5,22)} ${int(-3,3)}`,'none',choose(['#bdb08a','#71775c']),1.5);}
        speckles(100,[0,0,640,400],['#c7b38c','#435345'],2,.25);
        break;
      }
      case 26: { // Bleached architectural remains, softened by sparse ivy.
        base('#d9dcd0','#b1b9ab',305);
        for(let x=-10;x<650;){const w=int(41,82),top=int(39,141);R(x,top,w,166,'#b4bfb7');for(let yy=top+8;yy<211;yy+=21)for(let xx=x+7;xx<x+w-9;xx+=18)R(xx,yy,9,13,'#96a69f');x+=w+9;}
        for(const [x,w,flip] of [[13,98,1],[520,115,-1]]){
          P(`M${x} 304V27H${x+w-27}L${x+w-23} 77L${x+w} 99V304Z`,'#858f83');
          P(`M${x+9} 301V38H${x+w-39}V89L${x+w-13} 106V300Z`,'#c7cab8');
          for(let yy=56;yy<258;yy+=48)for(let xx=x+19;xx<x+w-21;xx+=32){R(xx,yy,18,27,'#798b80');L(xx,yy+10,xx+18,yy+10,'#a8b5a6',2);}
          P(`M${x+w*.7} 97l-15 16 6 22-19 30 8 35`,'none','#6f8374',3);
          for(let k=0;k<14;k++){const xx=x+int(3,w-8),yy=int(225,300);E(xx,yy,5,2,'#6d8870',{transform:`rotate(${flip*35} ${xx} ${yy})`});}
        }
        P('M0 314Q165 289 321 310T640 306V400H0Z','#c2c7b6');
        for(let i=0;i<50;i++){const x=int(0,640),y=int(322,400);P(`M${x} ${y}l-4 -${int(5,17)} 5 6 4 -9`,'none',choose(['#8da286','#a2b194']),1.5);}
        for(let i=0;i<22;i++)C(int(0,640),int(20,300),rand()*1.4+.6,'#f0f0dc',{opacity:.65});
        break;
      }
      case 27: { // Dusty amber, sun-bleached salvage and long dry-grass strokes.
        base(gradient(['#c4b378','#d7c391','#e5d9ac']),'#a08c60',304);
        C(int(355,441),70,33,'#f1e3b4',{opacity:.74});
        P('M0 253L61 219L147 247L215 212L296 256L390 225L490 246L551 220L640 251V400H0Z','#b4a178');
        for(const [x,flip] of [[40,1],[600,-1]])G({transform:`translate(${x} 0) scale(${flip} 1)`},()=>{
          P('M-33 320L-19 189L3 131L73 105L104 128L110 238L88 315Z','#7b7660');
          P('M-22 312L-9 194L13 145L71 121L90 137L94 237L75 309Z','#ad9870');
          for(let k=0;k<6;k++)P(`M${-16+k*18} 311l12 -${int(65,125)}`,'none','#7c785f',5);
          P('M-16 191L90 138M-25 225L98 181','none','#c3af80',3);
        });
        P('M0 320Q147 279 284 314Q457 289 640 316V400H0Z','#b6a16e');
        for(let i=0;i<54;i++){const x=int(0,640),y=int(327,400);P(`M${x} ${y}l-7 -${int(12,27)} 8 13 4 -23 4 21 8 -9`,'none',choose(['#7e8159','#929368','#cec08c']),1.3);}
        for(let i=0;i<26;i++){const x=int(0,640),y=int(0,400);L(x,y,x+int(8,22),y-1,'#f1dbaa',1,{opacity:.3});}
        break;
      }
      case 28: { // Open ocean layers, fan coral, sea grass and filtered sunlight.
        base(gradient(['#2caaaa','#166f93','#123b65']),'#296e77',303);
        for(const [x,w] of [[125,56],[246,31],[392,64],[505,30]])P(`M${x} 0h${w}l90 332h-${w+170}Z`,'#95d6bd','none',1,{opacity:.09});
        P('M0 235Q110 179 216 239Q373 158 640 228V400H0Z','#1c5873');
        P('M0 304Q132 242 278 296Q453 254 640 285V400H0Z','#398789');
        for(const [x,flip,color] of [[60,1,'#de927a'],[573,-1,'#bd7993']])G({transform:`translate(${x} 315) scale(${flip} 1)`},()=>{
          P('M0 0Q6 -65 1 -137M2 -24Q-29 -42 -40 -82M3 -39Q36 -62 50 -114M2 -70Q-26 -85 -37 -122M2 -89Q28 -111 28 -149','none',color,5,{'stroke-linecap':'round'});
          for(let j=0;j<9;j++){const y=-28-j*12;P(`M2 ${y}q${j%2?29:-27} -14 ${j%2?34:-39} -40`,'none',color,2);}
        });
        for(const x of [12,96,134,513,596,624]){P(`M${x} 372q-18 -48 -7 -91q8 -20 2 -39M${x+10} 377q18 -54 8 -102`,'none','#63a69a',5);}
        for(let i=0;i<36;i++){const x=int(0,640),y=int(28,302);C(x,y,rand()*2+.7,'none',{stroke:'#b5e7ce','stroke-width':.8,opacity:.26});}
        E(330,365,144,13,'#4d938d',{opacity:.5});
        break;
      }
      case 29: { // Muted watercolour geometry, fine lines and airy gradients.
        base(gradient(['#e7d9d8','#efe4d8','#d5ddd2']),'#9eafb5',312);
        C(int(386,452),76,39,'#cdafbb');
        P('M0 297L137 113L256 297L381 156L513 297L592 199L640 269V400H0Z','#bcc4c5');
        P('M137 113L138 297H0Z','#d1d0cb');P('M381 156L397 297H256Z','#d8d5cb');
        P('M0 334L95 222L221 333L338 256L491 331L566 212L640 325V400H0Z','#91a6b1');
        P('M95 222L99 334H0Z','#b0bbc0');P('M566 212L561 331H491Z','#c6c7c4');
        for(const [x,flip] of [[41,1],[597,-1]])G({transform:`translate(${x} 0) scale(${flip} 1)`},()=>{
          P('M0 364L12 149M10 188L-25 151M7 229L51 194M4 280L-28 246','none','#748fa1',1.5);
          P('M12 149L-13 170L9 194L34 174Z','#b899ac');P('M-25 151L-41 172L-10 175Z','#d2b5be');P('M51 194L24 210L46 237L69 214Z','#d9c0c6');P('M-28 246L-45 268L-14 268Z','#b398b0');
        });
        P('M0 356Q136 325 286 345Q461 313 640 347V400H0Z','#a9b8bc');
        for(let i=0;i<17;i++){const x=int(79,560),y=int(49,285);L(x,y,x+int(12,39),y,'#e7e6da',1,{opacity:.7});}
        for(let i=0;i<9;i++){const x=int(100,530),y=int(32,149);C(x,y,rand()*1+.6,'#b494a8',{opacity:.5});}
        break;
      }
    }
    return root;
  }
  window.AGIIWorldScenes = Object.freeze({ makeScene });
})();
