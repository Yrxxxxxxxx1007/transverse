/* Original decorative figures. Their shape depends only on cosmetic choices.
 * No game state, hidden identity, seed, abilities, or card values are read.
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const DEFAULT = { bg:'#101524', panel:'#283344', ink:'#e9dfc6', muted:'#7a8493', accent:'#d4a861', accent2:'#6d95b0', edge:'#11141a', sky:'#497da5', ground:'#55452f', far:'#455665', near:'#242c3c' };

  function makeFigure(doc, theme, portrait, variant) {
    const pal = { ...DEFAULT, ...((theme || {}).palette || {}) };
    const id = Math.max(0, Math.min(29, Number((theme || {}).id) || 0));
    const kind = ((Number(portrait) || 0) % 4 + 4) % 4;
    let random = (Number(variant) >>> 0) || 1977;
    const rnd = n => { random ^= random << 13; random ^= random >>> 17; random ^= random << 5; return (random >>> 0) % n; };
    const node = (tag, attrs, children) => {
      const n = doc.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, String(v));
      for (const child of children || []) n.append(child);
      return n;
    };
    const svg = node('svg', { viewBox:'0 0 160 200', 'aria-hidden':'true', focusable:'false' });
    const pixel = [0,1,2,3,20,21,22].includes(id);
    if (pixel) svg.setAttribute('shape-rendering', 'crispEdges');
    const out = [];
    const p = (d, fill=pal.accent, stroke, width=2, extra={}) => node('path', { d, fill, ...(stroke ? { stroke, 'stroke-width':width, 'stroke-linejoin':'round', 'stroke-linecap':'round' } : {}), ...extra });
    const r = (x,y,w,h,fill,rx=0,stroke) => node('rect',{ x,y,width:w,height:h,fill,rx,...(stroke?{stroke,'stroke-width':2}:{}) });
    const e = (cx,cy,rx,ry,fill,stroke,width=2) => node('ellipse',{cx,cy,rx,ry,fill,...(stroke?{stroke,'stroke-width':width}:{})});
    const c = (cx,cy,rad,fill,stroke,width=2) => node('circle',{cx,cy,r:rad,fill,...(stroke?{stroke,'stroke-width':width}:{})});
    const line = (d,stroke=pal.ink,width=2,extra={}) => p(d,'none',stroke,width,extra);
    const group = (children, transform, extra={}) => node('g',{...(transform?{transform}:{}),...extra},children);
    const add = (...items) => out.push(...items.flat());
    const eyes = (x=80,y=80,gap=13,size=4,col=pal.ink) => add(c(x-gap,y,size,col), c(x+gap,y,size,col));
    const bolts = (coords, fill=pal.ink, rad=2) => coords.map(([x,y])=>c(x,y,rad,fill));
    const toes = (x,y,col) => [r(x-10,y,17,9,col),r(160-x-7,y,17,9,col)];
    const spots = (n, minX, minY, w, h, fill, size=3) => Array.from({length:n},()=>pixel?r(minX+rnd(w),minY+rnd(h),size,size,fill):c(minX+rnd(w),minY+rnd(h),1+rnd(size),fill));
    const a=pal.accent, b=pal.accent2, d=pal.edge, light=pal.ink, m=pal.muted;
    add(e(80,182,43,7,d,undefined,2));

    // The camp figure always has the same plain, faceless post silhouette.
    if (Number(portrait) === -1) {
      const wood = id===10?'#8d9290':id===19?'#a9b6a4':id===20?'#78845a':id===26?'#92948a':'#a07343';
      const cut = id===10?'#d4d8d4':id===19?'#e8ecd8':id===20?'#c4cd8a':id===26?'#d1cdbb':'#d4b777';
      const rough = [8,13,16,19,29].includes(id);
      add(p('M55 58L57 49L68 43L90 43L104 50L106 60L103 156L96 168L112 177L112 182L47 182L47 176L62 166L57 155Z',wood,d,rough?3:2));
      add(p('M55 58L66 65L91 65L106 58L104 50L90 43L68 43L57 49Z',cut,d,2));
      add(p('M96 65L106 58L103 156L96 168L87 171L90 150Z',d,undefined,0,{opacity:.28}));
      add(line('M68 79L66 102L72 121L69 155M87 75L85 108L89 132L85 162',cut,rough?2:3));
      add(line('M58 176L96 176M69 52Q80 47 93 53Q90 59 71 57Q67 55 77 53',wood,2));
      if (pixel) { add(r(61,78,4,44,cut),r(77,122,3,36,d)); }
      else if (id===18) add(line('M58 69L58 157L63 165',light,2));
      else if (rough) for(let i=0;i<12;i++) add(line(`M${60+rnd(36)} ${73+i*7}l${3+rnd(8)} ${-4+rnd(8)}`,d,1,{opacity:.38}));
      else add(e(81,124,5,11,'none',wood,2));
      svg.append(...out); return svg;
    }

    // Four original silhouettes per visual world, with seeded cosmetic detail.
    switch (id) {
      case 0: { // Coarse blue-stone fantasy: robe, ooze, cave wing, horned imp.
        const shapes=[
          'M60 22H96V29H104V42H108V77H117V91H125V117H133V158H126V176H98V180H84V173H61V180H34V172H27V155H33V116H41V88H49V73H52V37H60Z',
          'M59 71H89V77H110V91H122V110H134V130H143V163H130V176H102V172H78V181H51V176H28V166H21V143H29V117H38V95H49V83H59Z',
          'M9 48H19V63H32V79H49V88H61V65H70V41H78V59H87V40H94V63H103V90H118V78H130V61H142V45H150V109H140V120H127V113H115V132H99V155H93V171H102V180H82V165H74V181H56V175H65V154H52V137H41V116H28V123H16V112H9Z',
          'M45 31H54V46H70V38H95V47H108V30H119V69H109V82H121V94H132V136H119V143H111V130H104V157H118V179H86V169H80V147H73V168H65V180H34V170H48V154H52V127H42V143H30V136H28V99H41V85H48V77H41Z'
        ];
        const colors=[b,a,'#9064aa','#9f794c'];
        add(p(shapes[kind],colors[kind],d,5));
        if(kind===0) add(p('M63 37H91V44H99V65H92V81H69V76H60V59Z',d),p('M45 111H56V157H46V169H35V160Z',a),p('M90 93H101V116H117V164H102V155H96Z',pal.near));
        if(kind===1) add(p('M48 98H62V92H82V100H65V113H51V136H39V151H31V134H38V113H48Z',b),p('M101 111H116V128H131V154H118V166H87V160H98Z',pal.near));
        if(kind===2) add(p('M17 68H24V82H43V99H60V113H46V105H30V96H24V108H17Z',light),p('M141 66H135V83H119V98H104V114H115V106H130V96H137V107H141Z',a));
        if(kind===3) add(p('M58 97H73V107H99V135H87V146H65V134H58Z',b),r(58,50,10,16,light));
        add(r(64,kind===1?122:kind===2?85:kind===0?56:65,9,5,light),r(88,kind===1?125:kind===2?85:kind===0?56:65,9,5,light));
        add(...spots(12,54,99,50,58,light,3)); break;
      }
      case 1: { // Stony, muted first-person dungeon figures.
        if(kind===0){add(p('M60 41L80 26L99 40L102 72L119 90L113 121L126 172L97 178L83 158L64 178L36 173L49 127L40 96L58 74Z',m,d,4),p('M54 93L39 104L26 137L40 143L63 110M106 94L124 106L137 139L122 146L98 108',pal.near,d,3),p('M61 52L83 43L99 53L89 80L70 79Z',a,d,2));eyes(80,59,10,3,d);}
        if(kind===1){add(p('M25 142L36 102L62 85L95 78L123 96L142 139L130 164L104 170L75 163L49 175L21 165Z',pal.near,d,4),p('M53 95L60 64L77 49L104 62L119 89L100 117L73 121Z',m,d,4),p('M62 74L57 45L71 55L90 32L95 59L113 49L107 79Z',a,d,3));eyes(85,89,12,3,light);}
        if(kind===2){add(p('M78 35L99 50L109 90L98 121L123 157L115 176L89 169L76 144L58 170L30 176L31 160L54 114L52 73L62 48Z',a,d,4),p('M56 73L34 82L14 106L30 118L59 94M102 72L130 81L146 108L129 121L103 97',m,d,3),p('M66 49L85 44L97 60L84 89L66 81Z',pal.near));eyes(81,66,8,3,light);}
        if(kind===3){add(p('M23 127L32 94L51 67L80 55L105 64L132 98L143 139L126 170L96 178L48 174L21 156Z',m,d,4),p('M43 92L62 80L90 82L116 100L126 145L105 162L75 158L58 141L37 142Z',a,d,3));add(e(64,113,8,9,d),e(104,119,8,9,d),p('M57 144L104 147L91 156L71 155Z',pal.near));}
        for(let i=0;i<18;i++) add(r(43+rnd(75),99+rnd(57),2+rnd(7),3+rnd(4),i%2?d:light)); break;
      }
      case 2: { // Industrial infernal sprites, steel plating and hot seams.
        if(kind===0) add(p('M43 37H56V54H70V43H96V55H110V35H122V74H110V91H126V109H139V145H121V127H107V154H117V180H86V172H77V149H68V178H38V168H50V144H52V123H37V146H20V111H35V91H49V75H41Z',a,d,4));
        if(kind===1) add(p('M54 49H100V60H118V83H131V130H117V150H104V170H59V174H40V158H29V120H33V87H43V65H54Z',m,d,4),p('M21 88H47V128H20V112H9V98H21M117 89H141V98H152V115H140V130H117Z',pal.near,d,3));
        if(kind===2) add(p('M7 41H20V59H37V77H64V48H76V36H87V49H97V79H122V58H141V39H153V102H139V118H116V143H101V158H88V178H73V163H56V145H43V124H22V113H7Z',pal.near,d,4),p('M17 68H32V85H57V110H45V101H22V100H17M145 65H132V87H107V111H118V101H141Z',a));
        if(kind===3) add(p('M48 52H102V61H119V80H131V125H120V136H141V149H148V174H121V163H99V179H65V168H44V180H19V160H32V140H20V118H27V89H39V74H48Z',a,d,4),p('M45 86H112V126H96V140H67V134H45Z',pal.near));
        add(r(60,78,16,6,light),r(86,78,16,6,light),p('M56 100H101V108H90V112H70V108H56Z',d));
        add(...Array.from({length:5},(_,i)=>r(55+i*11,131+(i%2)*6,6,15,b)));
        add(...spots(16,41,90,78,63,m,3)); break;
      }
      case 3: { // Fluorescent cyberspace specimens and autonomous machines.
        if(kind===0){add(p('M67 40H95V52H105V78H94V95H113V126H105V156H121V178H96V166H86V142H74V159H58V180H35V169H56V143H49V115H62V91H55V62H67Z',b,d,3),r(58,65,48,17,pal.near),r(71,68,27,8,a));}
        if(kind===1){add(p('M45 57H115L133 75V110L108 137H52L25 110V79Z',pal.near,d,3),r(11,82,22,35,m),r(127,82,22,35,m),r(44,126,15,29,b),r(105,126,15,29,b),r(64,146,33,13,m),r(46,72,69,37,b),r(61,80,40,17,d),r(72,85,18,7,a));}
        if(kind===2){add(p('M80 33L112 53L126 87L118 118L95 135L99 157L82 184L70 168L75 142L50 129L32 105L38 76L56 53Z',b,d,3),p('M50 108L19 130L11 157L24 164L33 140L64 130M112 104L135 123L151 151L141 161L124 139L104 130',a,d,3),p('M57 70H103V96H94V111H66V103H57Z',pal.near));eyes(81,86,12,4,a);}
        if(kind===3){add(p('M80 39L121 60L141 90L124 130L104 146L108 179H91L80 153L66 179H49L55 145L34 126L19 89L40 59Z',m,d,3),p('M50 72L80 54L110 72L108 107L82 131L51 107Z',pal.near),r(63,76,36,20,a),r(73,81,16,11,light));}
        for(let i=0;i<5;i++) add(line(`M${49+i*13} ${119+rnd(13)}v${13+rnd(19)}h8`,a,2));break;
      }
      case 4: { // Cream-coloured retro-space housings, long organic curves.
        if(kind===0){add(p('M73 29C97 27 107 51 104 73L97 91L112 119L104 158L116 177L94 180L81 154L65 177L41 180L56 155L55 120L65 94C48 67 49 36 73 29Z',light,d,3),p('M62 52Q83 33 99 54L95 77Q76 89 61 72Z',pal.near,d,3),p('M59 108Q31 115 28 145L41 151L64 123M108 109Q131 115 137 142L124 150L102 125',m,d,3));}
        if(kind===1){add(e(80,93,49,39,light,d,3),e(80,101,34,25,pal.near,d,3),e(80,99,20,14,a),p('M40 110Q18 118 25 152M120 110Q142 120 135 151','none',m,10),p('M63 127L57 169L44 177M94 127L104 168L117 176','none',light,12));}
        if(kind===2){add(p('M94 34C118 43 133 65 119 86L91 96L101 121L82 151L94 174L75 181L62 158L66 137L45 113L46 78C48 45 63 23 94 34Z',m,d,3),p('M60 100C27 107 20 134 33 153M95 111Q141 120 130 159','none',light,11),e(81,63,33,18,light,d,3),e(91,64,19,8,pal.near));}
        if(kind===3){add(p('M47 51Q79 25 112 51L122 128L105 147L105 179L84 179L81 150L64 151L57 179L34 179L45 143L32 114Z',light,d,3),r(49,58,63,41,pal.near,13),r(58,69,45,18,b,5),r(54,113,53,22,m,7),line('M39 103L20 119L21 145M121 99L140 119L135 145',m,13));}
        add(...bolts([[54,108],[108,108],[65,143],[95,143]],pal.muted,2),line('M68 114H94M68 119H94',d,2));break;
      }
      case 5: { // Jewel silhouettes and angular drapery.
        if(kind===0)add(p('M81 27L109 48L100 84L133 151L102 172L81 155L56 180L25 157L53 88L48 56Z',b,d,3),p('M63 45L93 44L104 59L91 79L64 72Z',d),p('M48 88L78 101L114 87L98 128L113 164L84 153L52 174L61 124Z',a),p('M47 75L11 98L47 97L28 122L67 97Z',light));
        if(kind===1)add(p('M79 27L106 53L97 78L126 104L110 140L133 172L99 167L80 139L60 169L28 174L50 139L32 111L61 83L54 52Z',a,d,3),p('M80 41L98 56L80 84L64 56Z',light),p('M42 111L80 89L117 110L81 134Z',b),p('M67 111L80 99L94 111L81 122Z',d));
        if(kind===2)add(p('M8 60L55 77L69 42L84 59L98 39L107 78L151 61L126 112L106 120L95 155L77 178L61 150L51 119L27 109Z',b,d,3),p('M19 72L58 89L50 108L34 99M141 72L104 88L112 108L127 96Z',a),p('M71 72L90 72L99 103L81 125L62 101Z',d));
        if(kind===3)add(p('M27 131L43 88L62 88L80 49L100 78L121 86L137 134L122 169L93 178L67 164L35 174Z',b,d,3),p('M41 130L66 89L88 111L111 87L123 137L100 160L74 146L53 162Z',a),p('M71 91L80 69L91 92L84 115Z',light));
        add(p(`M${68+rnd(8)} 86L81 80L94 86L81 92Z`,light),line('M55 139L63 132M111 132L119 142',light,2));break;
      }
      case 6: { // Brass and deep-sea glass, built from curved diving vessels.
        if(kind===0){add(p('M43 85Q30 106 37 142L50 150L51 177L73 177L78 155L87 155L93 177L115 177L112 148L127 136L123 99L112 84Z',a,d,4),e(79,68,35,38,a,d,4),e(79,68,25,26,pal.near,light,3),e(79,69,17,18,b),line('M65 49L65 88M91 49L91 88M56 67H102',a,4),line('M45 105Q13 108 22 145M118 103Q144 118 134 149',m,15));}
        if(kind===1){add(e(80,96,49,43,a,d,4),e(80,96,33,30,b,d,4),c(80,96,16,pal.near,light,3),p('M37 108Q11 127 28 152M122 109Q148 128 132 154M60 132Q44 157 63 181M98 134Q114 158 96 181','none',a,12),p('M62 57L56 37L67 26M98 57L111 40L102 25','none',m,7));}
        if(kind===2){add(p('M42 60Q77 37 111 61L122 127L108 146L109 177L87 177L81 149L63 149L57 177L36 177L43 145L32 121Z',a,d,4),r(46,62,65,37,pal.near,16,light),r(57,71,44,18,b,8),r(53,112,54,29,m,5),p('M35 90Q16 97 21 130L32 140M121 90Q145 99 138 136','none',a,14));}
        if(kind===3){add(p('M78 33C130 31 143 88 119 121L101 134Q112 156 95 179L79 170L66 180Q49 159 62 139C14 121 20 72 40 54Z',m,d,4),e(80,82,36,40,a,d,4),e(80,82,25,29,b,light,3),p('M67 53L93 110M58 84L101 72','none',a,4),p('M45 100Q12 132 35 163M113 109Q146 138 123 167','none',a,10));}
        add(...bolts([[52,65],[107,67],[50,96],[109,97],[63,119],[97,121]],light,3));break;
      }
      case 7: { // Sunlit cloth spirits; no face, gently curved kite forms.
        const cloth=[
          'M80 29Q98 42 100 72L114 94L124 168L82 151L37 175L49 96L61 72Q58 44 80 29Z',
          'M79 44Q128 48 144 96L115 118L98 160L80 178L59 157L46 115L15 98Q36 52 79 44Z',
          'M32 99Q51 55 80 36Q106 65 125 96L147 110L115 137L105 168L80 152L54 178L44 141L13 117Z',
          'M81 24L101 65Q135 89 121 126L107 145L120 177L87 167L77 147L63 176L34 178L49 145Q28 115 39 87L60 65Z'
        ];
        add(p(cloth[kind],a,d,2),p('M62 73Q79 53 100 76L94 91L69 92Z',pal.near),p('M69 89Q38 105 14 79Q29 122 67 111L98 104Q122 111 149 93L128 128L94 121Z',b));
        add(line('M64 110Q73 127 70 151M99 109Q91 131 105 151',light,2),p('M75 75L85 75L80 82Z',light));
        for(let i=0;i<4;i++)add(p(`M${51+i*16} ${140+(i%2)*7}l5 -5l5 5l-5 5Z`,light));break;
      }
      case 8: { // Ink silhouettes with paper-white negative spaces.
        if(kind===0)add(p('M30 149Q40 91 68 87L49 61L67 69L75 34L87 66L109 43L106 82Q137 109 124 162L100 172L85 155L62 174L33 170Z',light,d,5),p('M37 146Q10 114 23 87Q20 125 59 131Z',light,d,4));
        if(kind===1)add(p('M44 131Q27 113 36 88L49 61L60 85L77 35L90 78L115 51L117 94Q139 127 118 153L98 163L90 181L72 164L46 177Z',light,d,5),p('M107 133Q151 109 140 74Q153 136 123 160',light,d,4));
        if(kind===2)add(p('M10 62Q44 74 63 58L73 32L85 60L100 42L101 72Q126 80 149 63L133 105L105 122L100 145L81 173L62 149L53 124L28 109Z',light,d,5),p('M27 86L53 99M107 99L135 86','none',d,5));
        if(kind===3)add(p('M29 145Q42 107 40 83Q42 55 66 45Q89 16 112 47L124 84L116 116L130 161L105 176L77 164L51 175Z',light,d,5),p('M63 59Q83 44 101 59L92 98L68 94Z',d));
        add(line('M55 115Q64 101 70 115M90 113Q97 101 106 112',a,5),line('M55 133Q79 143 106 128',d,3));
        for(let i=0;i<6;i++) add(line(`M${39+rnd(71)} ${123+rnd(39)}l${6+rnd(9)} ${-5+rnd(10)}`,d,1+rnd(3)));
        add(p('M75 96L80 87L86 96L80 104Z',a));break;
      }
      case 9: { // Small pale masks and dark insect shells.
        if(kind===0)add(p('M56 66Q42 39 49 20L65 44Q80 31 94 45L112 19Q118 43 103 66L104 90L123 130L110 158L98 167L104 182L89 182L79 166L68 182L52 182L60 163L43 149L40 126L56 92Z',pal.near,d,3),p('M55 48Q80 32 106 50L99 89Q80 108 57 88Z',light,d,3));
        if(kind===1)add(e(80,122,41,48,pal.near,d,3),p('M44 127L21 148M46 144L27 165M116 128L139 150M111 147L132 166','none',m,5),p('M48 71Q48 43 81 42Q113 45 112 72L98 99L63 98Z',light,d,3),line('M80 99V166',b,3));
        if(kind===2)add(p('M59 82Q23 49 15 76Q16 111 57 126M100 80Q139 49 146 79Q144 113 104 129',b,d,3),p('M67 53L61 24M92 53L103 25','none',m,5),e(81,119,24,47,pal.near,d,3),p('M59 63Q80 42 104 63L100 91L80 105L61 89Z',light,d,3),line('M71 160L58 179M91 160L103 179',m,5));
        if(kind===3)add(p('M33 145Q23 109 43 87L59 65L58 42L73 56L94 40L99 66Q132 89 137 126L122 163L91 175L63 167L35 174Z',pal.near,d,3),p('M52 75Q79 58 106 81L99 108Q76 126 55 102Z',light,d,3),p('M45 120Q80 148 122 125M43 138Q81 162 115 145','none',b,3));
        eyes(80,76,13,6,d);add(line('M65 116Q77 120 94 115',b,2));break;
      }
      case 10: { // Atmospheric monochrome, intentionally near-featureless.
        const black='#080b0d';
        if(kind===0)add(p('M71 37Q97 32 99 59L95 85Q112 99 112 127L98 143L103 180L88 182L80 149L71 181L55 181L61 143L48 127L54 99L66 83Q49 49 71 37Z',black),line('M54 106Q29 107 27 143M108 105Q135 114 131 148',black,11));
        if(kind===1)add(e(80,122,38,34,black),e(81,79,25,29,black),line('M52 111L30 88L14 134M45 127L17 145L10 170M107 110L129 91L149 137M111 130L139 146L149 173',black,6));
        if(kind===2)add(p('M67 41L82 21L100 43L96 76L112 99L104 120L114 161L98 182L78 162L53 182L34 166L46 124L38 104L54 84Z',black),p('M58 73L42 59L35 26L58 49M96 73L119 57L127 26L105 45Z',black));
        if(kind===3)add(p('M21 136Q28 82 66 75Q75 50 91 58L112 75Q142 105 137 148L125 173L100 168L74 180L52 169L26 175Z',black),p('M56 84Q39 37 59 33L76 78M97 83Q114 42 130 52L111 96Z',black));
        eyes(80,kind===1?76:kind===3?114:65,10,3,'#edf2e9');break;
      }
      case 11: { // Soft luminous woodland figures.
        if(kind===0)add(p('M61 72Q30 28 52 20Q76 30 73 62L88 62Q85 25 104 16Q132 28 104 73L108 100L119 122L103 145L111 174L92 181L79 155L63 181L43 172L57 143L40 119L58 96Z',light,b,2),p('M51 124Q16 119 20 87Q2 132 52 145Z',b));
        if(kind===1)add(p('M37 151Q20 119 42 95L53 68L80 56L107 68L119 97Q143 120 121 154L98 172L77 161L58 175Z',b,pal.near,2),p('M47 75Q24 44 40 39Q67 38 66 66M95 67Q100 34 122 36Q137 52 111 81Z',light),p('M57 105Q81 85 105 106L98 133L63 131Z',light));
        if(kind===2)add(p('M61 90Q11 43 17 87Q22 129 59 124M100 91Q147 44 145 87Q139 131 102 125',b,pal.near,2),e(80,117,24,43,light,b,2),p('M61 79Q59 53 80 43Q103 54 101 79L89 101L72 101Z',light,b,2),line('M69 155Q54 172 64 183M92 156Q108 174 95 184',b,6));
        if(kind===3)add(p('M20 149Q28 117 51 104L60 63L79 44L104 71L110 108Q140 122 142 155L128 172L106 162L78 179L54 161L32 173Z',b,pal.near,2),p('M59 95Q49 65 63 36L80 54L101 29Q112 64 102 96Z',light),p('M44 126Q77 110 117 135L104 152L66 159L44 146Z',light));
        eyes(80,kind===1?111:kind===3?79:kind===2?77:83,11,4,pal.near);add(...spots(12,40,101,80,63,light,2));break;
      }
      case 12: { // Damp organisms: long fungal stems, soft ear fins, lichen.
        if(kind===0)add(p('M48 179Q62 158 63 131L56 106L43 100Q34 88 47 77L55 63Q62 42 83 49Q108 40 116 66L123 84Q130 102 110 105L100 133Q98 162 112 180L88 173L78 146L67 177Z',m,d,3),e(81,78,42,24,b,d,3),e(81,83,26,10,pal.near));
        if(kind===1)add(p('M55 48Q55 27 65 25Q74 29 74 54L92 54Q95 29 106 31Q117 39 106 69Q118 81 111 104L102 125L109 158Q114 182 94 178L80 152L68 178L44 176L53 145L48 123Q34 105 43 80Z',light,pal.near,3),p('M49 126Q14 137 27 170Q3 152 15 129L48 108Z',b));
        if(kind===2)add(p('M28 156L38 113L54 99L61 68L77 57L96 71L105 99L125 111L139 151L121 174L104 160L81 178L56 157L37 175Z',m,d,3),p('M45 107Q34 89 44 75Q43 54 62 54Q69 35 84 47Q104 39 113 56Q134 61 123 78Q136 103 107 112Z',b,d,3),line('M60 111L66 151M82 112L82 163M102 112L97 151',pal.near,3));
        if(kind===3)add(p('M24 123Q23 83 48 84L67 61L82 73L104 59L116 89Q140 86 141 119L126 138L112 132L104 164L80 179L58 165L51 135L33 140Z',b,d,3),p('M54 88Q43 52 58 41Q70 35 73 71M92 73Q94 32 112 40Q127 53 107 88Z',m,d,3));
        eyes(80,kind===2?105:kind===0?79:93,12,3,d);add(...spots(20,45,104,70,51,a,2));break;
      }
      case 13: { // Layered oil-paint fragments, four asymmetrical apparitions.
        const silhouettes=[
          'M54 51L75 27L100 41L96 78L117 94L106 130L125 171L93 174L78 141L61 180L31 167L49 124L38 89L61 76Z',
          'M22 111L43 73L77 65L99 41L117 60L113 96L141 124L129 164L96 179L72 162L47 175L19 156Z',
          'M70 25L104 52L97 81L125 70L145 99L111 127L99 175L77 157L48 181L41 125L13 104L32 79L61 90Z',
          'M48 32L82 45L110 27L105 76L127 110L117 145L139 171L103 174L79 152L58 179L23 170L48 139L33 104L51 73Z'
        ];
        add(p(silhouettes[kind],m,d,2),p('M56 55L78 33L93 45L84 74L65 91L57 73Z',light),p('M61 100L91 79L104 108L94 151L69 168L77 128L47 130Z',a),p('M96 57L104 81L88 109L103 147L122 169L95 171L83 126Z',b));
        for(let i=0;i<25;i++){const x=36+rnd(84),y=50+rnd(112);add(p(`M${x} ${y}l${8+rnd(15)} ${-5+rnd(8)}l${-2-rnd(5)} ${5+rnd(6)}l-${10+rnd(12)} 2Z`,[a,b,m,light,pal.near][rnd(5)],undefined,0,{opacity:.42+rnd(30)/100}));}
        add(line('M64 68L76 64M85 63L95 66',d,2));break;
      }
      case 14: { // Ochre ecclesiastical grotesques, no copied character costume.
        if(kind===0)add(p('M60 69L61 47L79 26L98 45L100 71L122 92L115 130L130 176L94 179L80 156L61 179L28 175L45 130L36 99Z',m,d,3),p('M53 83L79 99L109 81L102 135L80 157L59 130Z',a,d,3),p('M65 45L81 35L94 47L92 72L78 86L66 69Z',light,d,3));
        if(kind===1)add(p('M39 145Q16 107 40 82L48 52L69 63L84 32L96 64L122 51L117 84Q147 115 123 145L132 175L108 180L82 159L57 179L28 175Z',m,d,3),p('M48 93L79 69L113 94L100 127L62 126Z',a,d,3));
        if(kind===2)add(p('M80 31L96 56L103 85L125 113L116 157L130 178L97 179L81 153L63 179L29 177L45 155L34 116L57 87L64 54Z',pal.near,d,3),p('M59 91L79 82L104 94L109 132L81 149L51 130Z',a,d,3),p('M13 60L47 81L60 110L45 128L20 103M148 62L115 82L101 110L116 128L140 104Z',m,d,3));
        if(kind===3)add(p('M35 82L61 66L61 41L82 23L102 45L101 70L126 88L141 128L125 165L101 176L77 168L48 177L21 150Z',a,d,3),p('M50 101L111 94L123 133L100 157L67 157L40 139Z',m,d,3));
        add(e(80,69,12,18,light,d,2),line('M74 66H86M77 79H83',d,2));
        for(let i=0;i<7;i++)add(line(`M${44+i*12} ${110+rnd(10)}l${3-rnd(6)} 39`,light,1));
        add(...bolts([[54,110],[66,115],[80,118],[94,115],[108,110]],a,3));break;
      }
      case 15: { // Hard-edged black ceramic with red and gilt shapes.
        if(kind===0)add(p('M61 41L84 29L106 49L97 75L111 95L103 137L122 176L96 178L81 149L66 178L36 176L54 138L43 107L60 78Z',d,light,2),p('M46 97L77 87L110 95L102 113L78 123L49 116Z',a),p('M53 124L77 135L102 121L96 152L107 167L82 156L59 170Z',b));
        if(kind===1)add(p('M24 139L36 99L59 87L70 56L93 53L109 84L131 106L142 147L119 174L97 161L74 177L50 161L27 170Z',d,light,2),p('M40 110L59 98L77 112L98 96L123 116L112 144L80 161L49 139Z',a),p('M61 77L53 49L66 55L80 27L91 52L110 44L104 78Z',b,d,2));
        if(kind===2)add(p('M10 53L42 65L61 91L65 51L81 33L99 56L101 91L120 63L150 49L145 103L116 128L98 144L82 177L63 146L43 131L16 107Z',d,light,2),p('M22 68L50 94L47 116L24 99M137 66L111 95L114 116L138 99Z',a),p('M65 78L82 67L99 80L93 108L79 125L65 107Z',b));
        if(kind===3)add(p('M52 49L80 33L109 51L120 103L108 136L127 170L102 182L78 155L58 180L31 169L48 132L36 103Z',d,light,2),p('M49 67L81 50L108 67L94 103L64 101Z',a),p('M43 116L79 111L115 115L105 139L78 148L53 138Z',b));
        add(p('M64 74L75 77L68 82ZM86 77L99 73L95 82Z',light),line('M58 128L66 135L76 129L87 135L98 128',light,2));break;
      }
      case 16: { // Ragged pen and ink, loose angular cross-hatching.
        const s=[
          'M58 39L81 26L104 45L96 80L112 108L101 146L111 179L88 172L78 145L60 181L40 174L53 140L43 111L61 82Z',
          'M28 142L41 96L56 84L59 52L75 73L98 38L103 76L126 95L140 146L123 176L96 164L73 179L46 166L24 175Z',
          'M13 53L45 74L59 104L62 66L75 31L88 67L106 49L100 103L128 70L151 48L142 110L116 136L96 151L79 177L63 150L40 130L20 116Z',
          'M40 57L79 38L114 61L105 93L128 117L123 156L139 175L104 177L78 155L63 179L26 175L45 153L34 114L53 91Z'
        ];
        add(p(s[kind],light,d,3),p('M53 99L76 91L105 100L98 130L79 150L55 129Z',m,d,3));
        eyes(80,kind===1?105:70,13,6,d);
        add(line('M61 87L84 94L105 85',d,2));
        for(let i=0;i<22;i++){const x=42+rnd(77), y=96+rnd(61);add(line(`M${x} ${y}l${4+rnd(10)} -${4+rnd(11)}`,d,1));}
        add(line('M55 40L79 29L102 46M39 114L53 138L43 171M109 111L103 144L114 174',d,1));break;
      }
      case 17: { // Rounded 1930s rubber-hose oddities, warm paper and ink.
        if(kind===0){add(p('M52 132Q24 130 22 107Q21 93 34 95Q41 97 40 112L59 116M108 132Q138 134 143 111Q145 97 132 97Q124 99 125 114L105 116',a,d,4),e(80,113,34,43,a,d,4),p('M52 69Q45 40 64 33L76 41L91 28Q111 36 108 66L104 90L56 91Z',a,d,4),e(67,70,13,20,light,d,3),e(93,70,13,20,light,d,3),e(72,75,5,9,d),e(88,75,5,9,d));}
        if(kind===1){add(e(80,112,45,41,a,d,4),p('M41 94Q27 58 52 42Q68 34 77 48Q92 25 116 47Q136 70 115 95Z',b,d,4),e(64,90,13,20,light,d,3),e(92,90,13,20,light,d,3),e(67,95,5,9,d),e(87,95,5,9,d),line('M42 115Q16 129 29 147M119 113Q148 129 134 146',a,10));}
        if(kind===2){add(p('M60 93Q23 54 15 76Q12 109 57 127M102 93Q141 54 148 77Q148 109 105 126',a,d,4),e(80,114,28,44,b,d,4),e(80,67,28,29,a,d,4),e(69,64,11,16,light,d,3),e(90,64,11,16,light,d,3),e(73,67,4,7,d),e(86,67,4,7,d));}
        if(kind===3){add(p('M34 94Q33 58 54 45Q79 29 109 47Q137 66 125 98L117 132L101 151L62 151L39 127Z',a,d,4),e(62,78,14,21,light,d,3),e(94,78,14,21,light,d,3),e(67,83,5,9,d),e(89,83,5,9,d),line('M40 105Q16 109 22 137M121 105Q145 112 137 139',b,12));}
        add(p('M56 143Q68 152 60 168M102 144Q91 155 102 169','none',d,8),e(51,174,18,8,light,d,4),e(111,174,18,8,light,d,4),p('M65 113Q80 126 96 111Q88 138 71 129Z',d),p('M73 122Q81 117 89 124L85 129L77 129Z',b));break;
      }
      case 18: { // Layered construction-paper creatures with cut edges.
        const forms=[
          ['M46 91L61 69L58 43L79 31L101 48L101 76L119 99L107 144L121 171L94 176L79 150L62 177L35 170L50 143Z','M54 94L82 81L112 99L103 133L79 148L57 133Z'],
          ['M22 145L42 100L52 72L75 82L96 51L113 83L117 112L140 147L120 173L100 158L79 178L54 159L34 174Z','M39 130L61 106L89 113L110 103L125 139L102 158L74 151L51 163Z'],
          ['M12 64L49 81L60 98L64 58L80 37L99 58L103 98L123 74L149 61L139 116L108 140L95 161L78 178L61 153L44 135L21 116Z','M65 83L81 68L98 86L94 123L79 142L63 122Z'],
          ['M41 60L81 33L118 64L112 99L128 122L114 152L124 175L98 179L78 155L57 178L28 170L45 145L33 115L49 89Z','M53 66L81 47L104 67L98 97L67 98Z']
        ];
        add(p(forms[kind][0],d,light,7),p(forms[kind][0],a,d,2),p(forms[kind][1],b,d,2));
        add(e(66,kind===1?122:76,6,9,d),e(93,kind===1?122:76,6,9,d));
        add(line('M52 121L59 139M105 126L98 142',light,2),p('M72 91L80 98L89 91L80 105Z',light));
        add(p(`M${49+rnd(14)} 142l12 -6l7 14l-13 5Z`,light,d,1));break;
      }
      case 19: { // Restrained one-bit engraving, parallel line cut shading.
        const forms=[
          'M58 43L80 28L99 43L97 78L116 99L108 138L123 178L91 179L80 150L67 179L33 178L50 137L42 99L61 77Z',
          'M28 133L40 93L65 73L80 42L97 73L126 100L140 140L123 175L98 165L77 179L52 163L31 176Z',
          'M9 53L40 72L58 94L61 58L79 33L99 59L101 92L127 72L152 50L140 112L109 137L95 164L80 179L62 150L37 129L17 105Z',
          'M47 45L84 34L116 55L110 87L130 115L122 143L138 174L105 178L81 152L59 180L25 170L43 137L30 113L51 83Z'
        ];
        add(p(forms[kind],light,d,3));
        const clipId=`figure-hatch-${id}-${kind}-${Number(variant)>>>0}`;
        add(node('defs',{},[node('clipPath',{id:clipId},[p(forms[kind],light)])]));
        const hatch=[];
        for(let x=-100;x<170;x+=6) hatch.push(line(`M${x} 30L${x+110} 187`,d,1));
        add(group(hatch,undefined,{'clip-path':`url(#${clipId})`}));
        add(p('M60 56L80 44L101 58L98 82L82 99L62 82Z',light,d,2),e(69,71,4,6,d),e(93,71,4,6,d),line('M63 118L98 116M66 124L96 122M67 130L95 128',d,2));break;
      }
      case 20: { // Four-tone handheld fantasy, deliberately 8-pixel chunks.
        const colors=['#172d2a','#3d5b3e','#87965c','#d1d79b'];
        const shapes=[
          'M56 32H96V40H104V72H96V88H112V112H120V152H128V176H96V168H80V152H72V176H40V168H32V144H40V112H48V88H56V72H48V48H56Z',
          'M56 72H96V80H112V96H128V120H136V152H128V168H104V160H88V176H64V168H40V176H24V160H24V136H32V104H48V88H56Z',
          'M8 56H24V72H40V88H56V64H64V40H80V64H96V40H104V88H120V72H136V48H152V112H136V120H120V136H104V160H88V176H72V160H56V136H40V128H24V112H8Z',
          'M40 48H64V64H96V48H120V80H112V96H128V128H120V144H112V160H128V176H96V168H80V144H72V168H56V176H24V160H40V144H32V112H48V88H40Z'
        ];
        add(p(shapes[kind],colors[1],colors[0],6),p('M56 96H72V112H104V136H96V152H64V144H48V120H56Z',colors[2]),r(56,kind===1?112:72,16,8,colors[3]),r(88,kind===1?112:72,16,8,colors[3]),r(64,kind===1?112:72,8,8,colors[0]),r(88,kind===1?112:72,8,8,colors[0]));
        add(...spots(12,45,112,68,49,colors[3],4));break;
      }
      case 21: { // Luminous 16-bit fantasy sprites with stepped highlights.
        if(kind===0)add(p('M57 38H70V27H94V34H106V51H102V76H113V91H121V117H113V145H125V175H97V166H83V145H73V171H58V180H33V168H48V139H42V111H50V91H62V76H52V56H57Z',b,d,3),p('M57 94H78V100H102V92H111V128H101V149H73V137H58Z',a),p('M58 45H98V51H104V61H94V73H66V64H55Z',light));
        if(kind===1)add(p('M33 127H41V103H57V84H61V64H70V57H88V65H105V88H124V110H139V148H128V168H105V164H88V178H66V168H42V174H23V157H29V140H33Z',a,d,3),p('M53 114H71V100H98V108H113V136H100V153H68V145H48V132Z',b),p('M65 66H79V72H91V87H101V95H67V88H60V73H65Z',light));
        if(kind===2)add(p('M12 57H23V65H42V80H56V88H63V58H71V36H81V61H93V43H102V87H118V73H132V57H148V100H140V117H117V135H99V150H91V172H73V155H57V140H39V123H21V110H12Z',b,d,3),p('M23 77H41V92H58V116H41V108H29V98H23M138 73H125V92H105V116H120V107H133V94H138Z',a),r(68,78,28,30,light));
        if(kind===3)add(p('M50 36H66V49H94V33H111V59H121V82H111V94H127V112H136V143H125V152H114V139H107V159H120V178H96V168H80V147H69V173H54V181H30V170H45V151H52V128H40V146H24V135H30V109H44V91H51V78H43V58H50Z',m,d,3),p('M61 94H90V105H105V132H92V146H72V137H57V117Z',a),p('M54 55H69V49H94V58H104V77H93V86H67V78H54Z',light));
        add(r(66,kind===1?114:73,7,6,d),r(88,kind===1?114:73,7,6,d),...spots(15,51,105,53,51,light,2));break;
      }
      case 22: { // Fluorescent nocturnal silhouettes with hard magenta edges.
        const shapes=[
          'M58 39H74V26H96V42H107V70H100V84H119V112H107V145H120V177H94V170H81V145H69V169H58V180H33V167H49V140H43V106H56V87H60V72H51V54H58Z',
          'M27 120H36V97H53V78H72V67H91V81H115V97H134V120H141V157H128V174H107V163H88V179H64V168H45V177H24V154H27Z',
          'M8 44H22V63H41V79H60V60H72V34H86V62H102V78H124V59H140V42H152V109H133V124H112V140H98V161H86V178H72V156H54V138H35V120H15V103H8Z',
          'M50 37H66V52H93V38H109V62H121V87H113V101H130V126H120V145H113V162H129V179H100V166H82V144H70V170H52V180H29V165H45V143H34V123H44V99H54V80H46V57H50Z'
        ];
        add(p(shapes[kind],pal.near,a,4),p('M56 98H78V112H102V133H91V149H65V133H51V115H56Z',d),r(61,kind===1?109:75,38,5,b),r(65,130,28,4,a),line('M45 147L36 165M109 144L119 165',b,4));
        for(let i=0;i<9;i++)add(r(40+rnd(81),75+rnd(91),8+rnd(14),2,i%2?a:b));break;
      }
      case 23: { // Bright alien fauna, unexpected but gentle biological anatomy.
        if(kind===0)add(p('M32 143Q23 108 46 88L55 54L75 66L89 36L107 76Q136 94 130 129L112 147L104 179L84 179L81 152L66 177L47 177L52 149Z',a,pal.near,2),p('M50 84Q16 77 22 54Q31 44 39 64L65 76M103 79Q144 65 139 44Q152 67 121 100Z',b,pal.near,2));
        if(kind===1)add(e(80,121,46,35,b,pal.near,2),p('M42 107Q32 70 60 67L66 37L81 69Q116 47 124 77L121 110Z',a,pal.near,2),line('M54 147L43 179M75 151L67 178M101 150L117 178',m,12));
        if(kind===2)add(p('M59 78Q22 39 13 68Q8 97 57 120M101 78Q146 38 150 73Q153 104 102 121',b,pal.near,2),e(79,115,24,46,a,pal.near,2),e(80,66,29,28,a,pal.near,2),p('M70 45L59 22M89 44L104 21','none',m,5),line('M65 153L56 177M92 151L108 176',a,10));
        if(kind===3)add(p('M21 148Q19 104 51 102Q48 57 74 42Q103 25 112 60L107 108Q135 103 141 135Q146 161 119 172L101 158L78 179L57 158L31 172Z',a,pal.near,2),e(85,67,21,26,b,pal.near,2),p('M42 128Q23 116 12 125L34 143M118 124Q145 112 151 130L127 145Z',b));
        const ey=kind===1?93:kind===3?65:kind===2?66:100;
        eyes(80,ey,12,6,light);eyes(80,ey,12,2,d);add(...spots(14,48,119,61,28,b,3));break;
      }
      case 24: { // Icy riveted vessels, frost shards and exposed joints.
        if(kind===0)add(p('M49 67L63 42L98 42L113 66L105 93L125 112L114 141L117 177L92 177L83 149L73 178L46 178L50 143L34 119L52 94Z',m,d,3),r(53,57,55,32,pal.near,7,light),r(65,66,29,13,a,2),r(55,110,51,31,b,5),line('M40 106L24 126L32 146M121 106L141 128L132 147',m,12));
        if(kind===1)add(e(80,104,48,48,m,d,3),e(80,105,30,31,pal.near,light,3),c(80,105,18,a),line('M44 134L31 155L35 179M114 135L129 155L124 179',m,13),p('M40 75L34 54L51 65L56 35L68 63L83 33L90 65L113 47L111 80Z',light,b,2));
        if(kind===2)add(p('M51 63L77 43L105 58L113 100L100 129L116 170L99 179L82 146L65 178L44 174L60 131L46 111Z',b,d,3),p('M55 91L26 61L13 76L40 126L58 124M108 91L136 63L150 80L123 130L105 123Z',m,d,3),r(62,64,34,25,pal.near,4,light),r(69,70,19,12,a,2));
        if(kind===3)add(p('M29 126L41 83L61 65L101 64L126 83L141 124L129 155L108 178L85 173L74 157L63 177L37 176L47 151Z',m,d,3),r(49,82,62,39,pal.near,7,light),r(63,93,35,15,a,3),p('M39 85L34 60L53 74L59 47L71 70L95 45L99 69L123 56L117 88Z',light,b,2));
        add(...bolts([[52,107],[108,108],[62,135],[97,135]],light,3),...spots(14,44,98,74,58,light,2));break;
      }
      case 25: { // Wonky copper automata, hand-drawn geometry and rust.
        if(kind===0)add(p('M53 55L63 36L96 34L109 58L102 91L117 105L112 141L100 152L103 179L87 181L77 150L67 177L48 179L56 149L43 137L48 107L62 90Z',a,d,3),r(56,57,48,28,m,8,d),c(67,71,7,light,d),c(92,71,7,light,d),line('M45 111L27 121L21 143M116 109L135 126L133 149',m,8));
        if(kind===1)add(p('M39 71Q83 47 120 73L128 117L108 142L53 143L30 113Z',m,d,3),e(79,76,39,19,a,d,3),e(80,78,17,9,pal.near),line('M52 139L44 161L29 179M104 140L116 159L128 179',a,12),line('M35 94L16 106L20 131M125 93L145 108L140 134',a,8));
        if(kind===2)add(p('M65 38L99 43L111 69L99 96L111 137L97 152L97 178L79 179L78 153L58 178L42 173L63 139L53 107L61 92L47 69Z',a,d,3),e(81,69,22,27,m,d,3),c(74,68,6,light,d),c(92,72,4,light,d),p('M63 109L25 100L15 116L48 138M104 111L142 101L148 119L116 141Z',m,d,3));
        if(kind===3)add(p('M44 71L61 59L60 38L96 32L109 58L117 85L131 103L123 139L104 151L118 177L97 180L80 155L62 177L37 177L52 148L31 131L32 98Z',m,d,3),p('M59 56L104 55L109 84L94 98L61 91Z',a,d,3),e(74,72,10,12,light,d),c(94,74,5,pal.near),r(51,111,53,24,a,3,d));
        add(...bolts([[57,110],[104,112],[65,133],[94,136]],d,3),line('M69 115H90M69 121H90',pal.near,2));
        for(let i=0;i<17;i++)add(c(47+rnd(66),95+rnd(52),1+rnd(2),b));break;
      }
      case 26: { // Pale, weathered ceramic machines with sparse graphic detail.
        if(kind===0)add(p('M58 48Q79 32 102 50L108 82L96 97L114 119L105 147L112 179L91 179L79 151L69 177L47 180L54 148L44 120L60 97L50 76Z',light,m,2),e(79,67,23,21,m,d,2),e(69,67,5,6,d),e(89,67,5,6,d),p('M48 112L23 130L28 148M111 111L136 129L132 149','none',m,10));
        if(kind===1)add(e(80,102,43,46,light,m,2),p('M42 112L20 143L25 164M118 111L140 141L134 163','none',m,9),line('M61 143L54 177M100 143L108 177',m,13),r(57,83,46,24,m,8),c(69,95,5,d),c(90,95,5,d),line('M68 121H92',d,2));
        if(kind===2)add(p('M68 30L93 31L109 56L106 86L91 99L109 116L99 148L111 176L90 180L80 151L65 178L44 175L61 144L49 116L64 97L52 79L54 49Z',light,m,2),p('M56 110L22 75L13 87L37 134L52 137M104 108L138 73L149 86L125 135L108 136Z',m,d,2),r(63,59,34,19,d,6),line('M70 66H90',light,2));
        if(kind===3)add(p('M32 112Q36 72 65 65L74 46L92 48L102 67Q133 81 135 121L122 149L117 177L96 177L79 149L67 179L41 177L50 149Z',light,m,2),e(81,100,34,29,m,d,2),e(68,98,6,8,d),e(94,98,6,8,d),line('M70 116H92',d,2));
        add(line('M60 123L66 132L62 140M101 127L94 138',m,1),...spots(11,49,113,58,41,m,1));break;
      }
      case 27: { // Dusty wasteland fauna with rough hides and amber light.
        if(kind===0)add(p('M51 53L70 37L96 44L108 72L100 94L123 115L114 145L120 178L97 180L80 150L67 179L40 176L50 145L33 124L44 101L60 82Z',m,d,3),p('M45 113L20 128L18 150L33 153L60 127M116 110L143 131L138 153L123 151L102 127Z',a,d,3),p('M60 53L95 55L105 73L94 88L65 89L55 75Z',a,d,3));
        if(kind===1)add(p('M21 137Q26 95 54 82L57 49L74 63L96 45L105 75Q138 95 143 133L130 164L107 172L79 157L55 175L30 169Z',a,d,3),p('M39 119Q73 97 123 123L110 151L85 158L52 146Z',m,d,2),p('M46 91L34 68L55 80M109 88L128 63L121 101Z',b,d,2));
        if(kind===2)add(p('M65 52L83 32L102 54L97 84L112 111L106 143L119 173L96 180L81 151L67 180L42 171L57 142L48 114L62 85Z',m,d,3),p('M61 93L28 57L11 72L24 110L52 129M102 93L136 56L151 74L136 110L106 132Z',a,d,3),p('M65 59L91 56L99 73L90 95L70 88Z',b,d,2));
        if(kind===3)add(p('M35 89L56 66L62 40L81 57L102 34L114 76L132 102L142 134L123 151L130 175L107 180L82 150L62 180L36 175L47 148L20 127Z',a,d,3),p('M46 106L73 92L112 108L118 134L93 150L66 140L39 127Z',m,d,2));
        eyes(80,kind===1?114:kind===3?98:72,13,4,light);add(...spots(23,44,109,77,43,b,2),line('M64 91L81 98L97 92',d,2));break;
      }
      case 28: { // Aquatic curves, flowing fins and coral branching.
        if(kind===0)add(p('M79 38Q116 46 111 85L105 113Q128 134 110 155L92 164L82 181L65 161Q34 147 50 119L48 88Q40 57 79 38Z',b,pal.near,2),p('M51 93Q18 63 14 96Q12 131 53 130M108 92Q145 63 148 96Q145 130 105 130',a),p('M65 151L42 177L73 165M96 151L121 177L89 167Z',a));
        if(kind===1)add(p('M23 118Q46 71 80 70Q113 69 143 114L121 145L100 145L80 169L62 146L42 148Z',b,pal.near,2),p('M53 100L45 56L56 48L61 75L73 71L72 35L84 34L87 72L101 79L109 49L121 54L111 104Z',a),e(81,119,28,20,light),line('M56 146Q39 166 48 183M106 145Q123 165 110 181',b,8));
        if(kind===2)add(p('M60 98Q17 46 10 79Q11 119 56 136M104 98Q147 46 151 79Q150 123 107 137',a,pal.near,2),p('M80 43Q110 68 104 117Q100 147 82 178Q60 156 56 124Q53 73 80 43Z',b,pal.near,2),p('M65 71L79 60L98 75L89 108L69 104Z',light));
        if(kind===3)add(p('M28 143Q21 116 45 95L66 78L71 45Q83 33 95 46L99 80Q131 98 139 134L123 155L105 157L80 181L57 159L37 165Z',b,pal.near,2),p('M61 93Q41 56 49 41L62 55L69 30L80 51L96 26L103 61L117 48Q124 77 100 96Z',a),p('M49 131Q76 106 113 134L96 152L65 154Z',light));
        eyes(80,kind===1?118:kind===0?83:kind===2?82:125,11,3,pal.near);add(...spots(14,50,113,59,33,light,2));break;
      }
      case 29: { // Translucent pastel geometry, fine lines, suspended shapes.
        const forms=[
          'M80 30L101 61L95 92L119 126L111 174L80 157L46 177L40 129L65 91L61 61Z',
          'M21 141L43 100L61 91L80 46L101 88L123 103L140 142L121 171L99 155L79 178L60 155L37 174Z',
          'M11 64L56 84L65 58L81 38L99 60L105 84L151 63L126 118L102 136L81 176L59 138L31 116Z',
          'M51 43L80 30L109 49L101 88L128 126L117 157L131 178L99 174L79 152L59 178L27 171L43 145L35 118L62 84Z'
        ];
        add(p(forms[kind],b,undefined,0,{opacity:.88}),p('M61 69L81 49L100 71L92 96L105 127L80 159L51 134L67 95Z',a,undefined,0,{opacity:.72}),p('M80 51L99 73L87 99L97 127L80 157L80 109L65 87Z',light,undefined,0,{opacity:.52}),line('M63 75L80 80L98 75',pal.near,1));
        for(let i=0;i<6;i++){const x=35+rnd(90),y=85+rnd(80);add(p(`M${x} ${y}l5 -8l6 8l-6 8Z`,light,undefined,0,{opacity:.5}));}
        add(line('M80 44V159M48 132L80 159L113 132',light,1));break;
      }
    }
    // A world's cosmetic token also changes proportions and stance. These
    // bounded differences apply even to deliberately texture-free art styles.
    const width = (94 + rnd(13)) / 100;
    const height = (94 + rnd(7)) / 100;
    const lean = pixel ? 0 : rnd(5) - 2;
    svg.append(out[0], group(out.slice(1), `translate(80 180) scale(${width} ${height}) skewX(${lean}) translate(-80 -180)`));
    return svg;
  }
  window.AGIIWorldActors = Object.freeze({ makeFigure });
})();
