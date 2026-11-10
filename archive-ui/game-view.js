/* Visual arrangement of the public terminal strings only. No game state, meanings,
 * magnitudes or card identities are consulted here: the status bar shows the
 * screen's own tokens, the figure comes from the look composer, the backdrop from
 * the world modules. */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function element(doc, tag, className, text) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svgElement(doc, tag, attributes, children) {
    const node = doc.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attributes || {})) {
      node.setAttribute(name, String(value));
    }
    for (const child of children || []) node.append(child);
    return node;
  }

  // Cosmetic variants only: -1 is the camp post; 0–3 are adventure portraits.
  // The caller chooses the picture independently of enemy identity and values.
  function makeFigure(doc, variant = 0) {
    const s = (tag, attributes, children) => svgElement(doc, tag, attributes, children);
    const rect = (x, y, width, height, fill) => s('rect', { x, y, width, height, fill });
    const portrait = children => s('svg', {
      viewBox: '0 0 40 56', 'aria-hidden': 'true', focusable: 'false',
      'shape-rendering': 'crispEdges'
    }, children);
    if (variant === -1) return portrait([
      s('path', { d: 'M15 10H24V11H27V13H28V43H26V46H30V49H32V51H8V49H10V46H13V44H11V14H12V12H15Z', fill: '#211b18' }),
      s('path', { d: 'M13 16H26V43H24V46H15V43H13Z', fill: '#a56a35' }),
      rect(13, 16, 3, 25, '#ce914d'),
      rect(24, 16, 2, 27, '#68432b'),
      s('path', { d: 'M15 12H24V13H26V16H24V18H15V17H13V14H15Z', fill: '#e1b970' }),
      rect(16, 14, 7, 1, '#b47f44'),
      rect(15, 15, 2, 1, '#b47f44'),
      rect(17, 16, 6, 1, '#b47f44'),
      rect(17, 19, 1, 10, '#68432b'),
      rect(18, 28, 1, 8, '#68432b'),
      rect(17, 35, 1, 7, '#68432b'),
      rect(21, 21, 1, 6, '#ce914d'),
      rect(22, 27, 1, 13, '#ce914d'),
      rect(14, 26, 1, 8, '#e1b970'),
      rect(20, 38, 1, 5, '#68432b'),
      rect(15, 43, 9, 2, '#68432b'),
      rect(12, 47, 16, 2, '#a56a35'),
      rect(10, 49, 20, 1, '#68432b'),
      rect(12, 47, 6, 1, '#ce914d')
    ]);
    if (variant === 1) return portrait([
      s('path', { d: 'M15 22H23V24H28V27H31V31H34V35H36V40H38V46H36V49H31V51H23V50H18V52H9V50H4V47H2V41H4V36H6V31H9V27H12V24H15Z', fill: '#111d18' }),
      s('path', { d: 'M15 24H23V26H27V29H30V33H32V37H34V41H36V46H32V48H24V47H18V50H10V48H5V45H4V41H6V37H8V32H11V28H15Z', fill: '#477247' }),
      s('path', { d: 'M15 25H21V27H16V29H13V33H10V38H8V43H6V42H7V36H9V31H12V28H15Z', fill: '#91ad5c' }),
      s('path', { d: 'M24 28H27V32H30V36H32V41H34V46H30V48H24V47H18V49H10V47H8V44H14V45H20V43H24V40H26V35H24Z', fill: '#285038' }),
      s('path', { d: 'M13 30H19V32H22V36H20V39H14V41H10V38H11V33H13Z', fill: '#6c9350' }),
      rect(14, 32, 4, 3, '#192e22'),
      rect(24, 34, 4, 3, '#192e22'),
      rect(15, 32, 2, 1, '#c5c081'),
      rect(25, 34, 2, 1, '#c5c081'),
      rect(17, 41, 7, 2, '#192e22'),
      rect(19, 43, 3, 1, '#6c9350'),
      rect(16, 25, 2, 2, '#b6a459'),
      rect(13, 28, 2, 1, '#91ad5c'),
      rect(20, 28, 2, 2, '#91ad5c'),
      rect(11, 35, 2, 1, '#b6a459'),
      rect(8, 40, 2, 2, '#91ad5c'),
      rect(13, 44, 3, 1, '#6c9350'),
      rect(28, 39, 2, 2, '#6c9350'),
      rect(31, 43, 2, 1, '#477247'),
      rect(10, 48, 3, 1, '#477247'),
      rect(25, 46, 3, 1, '#477247')
    ]);
    if (variant === 2) return portrait([
      s('path', { d: 'M2 14H5V17H8V21H12V24H15V18H17V12H19V17H22V12H24V18H26V24H29V21H32V17H35V14H38V32H35V35H32V32H29V37H26V41H24V46H27V49H23V48H21V45H19V48H15V49H13V47H16V42H14V38H11V33H8V36H5V33H2Z', fill: '#171526' }),
      s('path', { d: 'M4 19H6V22H9V25H13V28H16V34H13V32H10V29H8V32H6V30H4Z', fill: '#69518d' }),
      s('path', { d: 'M36 19H34V22H31V25H28V28H24V35H27V32H30V29H32V32H34V30H36Z', fill: '#69518d' }),
      s('path', { d: 'M4 20H6V24H9V26H12V29H15V31H15V34H13V31H10V28H7V26H5V24H4Z', fill: '#ac82aa' }),
      s('path', { d: 'M36 20H34V24H31V26H28V29H25V31H25V34H27V31H30V28H33V26H35V24H36Z', fill: '#8a669f' }),
      s('path', { d: 'M18 17H19V20H22V17H23V22H25V31H24V39H22V43H19V41H17V35H16V26H18Z', fill: '#8a669f' }),
      s('path', { d: 'M20 22H23V27H24V35H22V40H20V37H19V29H20Z', fill: '#69518d' }),
      rect(18, 23, 2, 2, '#171526'),
      rect(22, 23, 2, 2, '#171526'),
      rect(18, 23, 1, 1, '#c7ad96'),
      rect(23, 23, 1, 1, '#c7ad96'),
      rect(20, 28, 2, 1, '#362940'),
      rect(17, 27, 1, 4, '#ac82aa'),
      rect(18, 33, 1, 3, '#ac82aa'),
      rect(19, 37, 1, 2, '#ac82aa'),
      rect(22, 31, 1, 3, '#362940'),
      rect(6, 27, 1, 3, '#362940'),
      rect(10, 28, 1, 2, '#c7ad96'),
      rect(33, 26, 1, 3, '#362940'),
      rect(29, 28, 1, 2, '#c7ad96'),
      rect(17, 43, 1, 3, '#69518d'),
      rect(23, 43, 1, 3, '#69518d')
    ]);
    if (variant === 3) return portrait([
      s('path', { d: 'M11 9H14V13H17V11H24V13H27V9H30V19H28V23H30V26H33V29H35V39H32V41H29V38H28V44H31V48H32V52H23V50H21V43H19V50H17V52H8V49H10V45H12V38H10V41H7V38H5V30H8V26H11V23H10V18H11Z', fill: '#211d1c' }),
      s('path', { d: 'M13 14H16V16H18V13H23V15H26V17H28V14H29V18H26V23H23V26H17V24H13V20H12V17H13Z', fill: '#9a7950' }),
      s('path', { d: 'M13 26H17V28H24V26H28V29H31V31H33V37H31V35H28V33H26V41H23V47H23V49H29V50H24V49H22V41H18V45H16V49H10V50H16V48H15V41H14V33H11V36H9V38H7V31H10V28H13Z', fill: '#796346' }),
      s('path', { d: 'M13 27H16V32H18V37H24V35H26V41H23V44H18V42H15V38H14V32H11V33H10V36H8V32H11V29H13Z', fill: '#b49464' }),
      s('path', { d: 'M25 17H27V21H24V25H21V27H18V25H22V23H24V20H25Z', fill: '#554d3c' }),
      s('path', { d: 'M26 28H28V30H30V33H31V37H29V33H27V38H25V41H23V46H22V41H24V37H25Z', fill: '#554d3c' }),
      rect(14, 18, 4, 2, '#352d26'),
      rect(22, 18, 4, 2, '#352d26'),
      rect(15, 18, 2, 1, '#d0b47b'),
      rect(23, 18, 2, 1, '#d0b47b'),
      rect(18, 22, 4, 1, '#352d26'),
      rect(18, 14, 3, 1, '#d0b47b'),
      rect(13, 16, 1, 2, '#d0b47b'),
      rect(15, 22, 2, 1, '#b49464'),
      rect(15, 28, 2, 2, '#d0b47b'),
      rect(19, 29, 4, 2, '#9a7950'),
      rect(18, 32, 2, 3, '#554d3c'),
      rect(20, 34, 3, 1, '#554d3c'),
      rect(11, 30, 2, 1, '#d0b47b'),
      rect(9, 33, 1, 2, '#9a7950'),
      rect(30, 32, 1, 2, '#9a7950'),
      rect(16, 39, 2, 3, '#9a7950'),
      rect(14, 45, 2, 3, '#b49464'),
      rect(10, 49, 5, 1, '#9a7950'),
      rect(24, 48, 5, 1, '#9a7950')
    ]);
    return s('svg', {
      viewBox: '0 0 40 56', 'aria-hidden': 'true', focusable: 'false',
      'shape-rendering': 'crispEdges'
    }, [
      s('path', { d: 'M17 1H25V3H29V7H31V16H33V19H35V25H36V32H38V46H36V52H31V54H24V52H16V54H8V52H4V48H5V40H6V29H8V22H11V18H12V8H14V4H17Z', fill: '#080b16' }),
      s('path', { d: 'M17 3H25V5H28V9H29V17H31V21H33V28H34V36H36V46H34V50H28V51H23V49H17V51H10V50H6V46H7V37H8V29H10V23H13V18H14V9H16V5H17Z', fill: '#245499' }),
      s('path', { d: 'M25 5H28V9H29V18H31V24H33V34H35V45H33V49H28V51H24V49H26V42H25V35H23V29H22V23H25V18H27V12H25Z', fill: '#142c53' }),
      s('path', { d: 'M17 4H23V6H18V9H16V14H15V19H12V23H10V29H9V36H8V43H7V46H7V37H8V29H10V23H13V18H14V9H16V5H17Z', fill: '#66998b' }),
      s('path', { d: 'M18 7H24V9H26V12H27V18H25V22H23V25H19V23H16V20H15V15H16V10H18Z', fill: '#337e9d' }),
      s('path', { d: 'M19 9H23V11H25V15H26V18H24V22H21V23H18V20H17V16H17V12H19Z', fill: '#080b16' }),
      s('path', { d: 'M13 23H16V27H18V30H17V36H15V41H14V47H12V49H9V47H10V39H11V32H12V26H13Z', fill: '#337e9d' }),
      s('path', { d: 'M16 26H19V29H20V35H21V40H23V46H23V49H19V47H18V41H17V36H17V30H16Z', fill: '#66998b' }),
      s('path', { d: 'M13 31H15V36H14V41H12V46H10V48H9V45H11V38H12V33H13Z', fill: '#142c53' }),
      s('path', { d: 'M25 27H28V31H29V36H31V41H32V47H29V46H28V40H26V35H25Z', fill: '#337e9d' }),
      s('path', { d: 'M29 20H31V26H32V31H33V37H34V43H33V45H31V39H30V33H29Z', fill: '#443a2b' }),
      s('path', { d: 'M8 46H12V48H17V47H20V49H24V47H26V50H30V49H34V48H34V50H28V51H23V49H17V51H10V50H8Z', fill: '#443a2b' }),
      rect(17, 4, 3, 1, '#b1ac78'),
      rect(15, 7, 2, 2, '#766641'),
      rect(14, 11, 1, 3, '#b1ac78'),
      rect(16, 8, 1, 2, '#66998b'),
      rect(24, 6, 2, 1, '#337e9d'),
      rect(26, 8, 1, 2, '#66998b'),
      rect(27, 11, 1, 3, '#337e9d'),
      rect(13, 17, 2, 2, '#766641'),
      rect(12, 20, 2, 2, '#b1ac78'),
      rect(14, 23, 2, 1, '#66998b'),
      rect(11, 25, 1, 2, '#766641'),
      rect(10, 29, 2, 1, '#66998b'),
      rect(9, 33, 1, 3, '#766641'),
      rect(13, 27, 1, 2, '#66998b'),
      rect(16, 30, 1, 2, '#b1ac78'),
      rect(18, 33, 1, 3, '#b1ac78'),
      rect(17, 37, 2, 1, '#337e9d'),
      rect(19, 40, 1, 2, '#b1ac78'),
      rect(20, 44, 2, 1, '#b1ac78'),
      rect(12, 40, 1, 2, '#66998b'),
      rect(11, 44, 2, 1, '#337e9d'),
      rect(8, 47, 2, 1, '#766641'),
      rect(12, 48, 3, 1, '#766641'),
      rect(17, 48, 2, 1, '#766641'),
      rect(25, 25, 2, 1, '#337e9d'),
      rect(28, 28, 1, 2, '#766641'),
      rect(27, 32, 2, 1, '#66998b'),
      rect(28, 36, 1, 2, '#66998b'),
      rect(31, 39, 1, 2, '#766641'),
      rect(30, 44, 1, 2, '#66998b'),
      rect(32, 48, 2, 1, '#766641'),
      rect(10, 51, 5, 1, '#142c53'),
      rect(27, 51, 4, 1, '#142c53')
    ]);
  }

  // The same small chipped inventory token is used for every hand option.
  // Its unmarked surface carries no card identity, resource or effect hint.
  function makeCardArt(doc) {
    const s = (tag, attributes, children) => svgElement(doc, tag, attributes, children);
    const rect = (x, y, width, height, fill) => s('rect', { x, y, width, height, fill });
    return s('svg', {
      viewBox: '0 0 16 16', 'aria-hidden': 'true', focusable: 'false',
      'shape-rendering': 'crispEdges'
    }, [
      s('path', { d: 'M5 1H11V2H14V5H15V11H13V14H10V15H4V13H2V10H1V5H3V2H5Z', fill: '#10120f' }),
      s('path', { d: 'M5 3H11V4H13V10H11V13H5V11H3V5H5Z', fill: '#585848' }),
      rect(5, 3, 5, 2, '#aa9057'),
      rect(3, 5, 2, 5, '#79715a'),
      rect(11, 5, 2, 5, '#242924'),
      rect(5, 11, 6, 2, '#242924'),
      rect(5, 5, 3, 4, '#79715a'),
      rect(8, 5, 2, 2, '#3b4036'),
      rect(7, 7, 2, 3, '#242924'),
      rect(9, 9, 2, 1, '#242924'),
      rect(5, 10, 2, 1, '#585848')
    ]);
  }

  function parseRow(text, separator) {
    if (!text.trim()) return [];
    const parts = text.trim().split(/[ \t]+/);
    const token = separator === '='
      ? /^[A-Za-z][A-Za-z0-9]*(?:=(?:\?|-?\d+(?:\.\d+)?))?$/
      : /^[A-Za-z][A-Za-z0-9]*(?::(?:\?|-?\d+(?:\.\d+)?))?$/;
    return parts.every(part => token.test(part)) ? parts : null;
  }

  // The screen arrives in English (printed so since 2026-10-19; older text is put into
  // English by public-text.js): a turn line ("1 turn left" is singular), then a
  // standing row and an optional transient row for each side.
  function parseScreen(screen) {
    if (typeof screen !== 'string') return null;
    const lines = screen.split(/\r?\n/);
    const head = /^Turn (\d+)(?:[ \t]+(-?\d+) turns? left)?$/.exec(lines[0] || '');
    if (!head) return null;
    let index = 1;
    const entities = [];
    for (const name of ['You', 'Them']) {
      const match = (lines[index] || '').match(/^(You|Them):[ \t]*(.*)$/);
      if (!match || match[1] !== name) return null;
      const standing = parseRow(match[2], '=');
      if (!standing) return null;
      index++;
      let transient = [];
      if (index < lines.length && /^[ \t]+/.test(lines[index])) {
        transient = parseRow(lines[index], ':');
        if (!transient) return null;
        index++;
      }
      entities.push({ name: match[1], standing, transient });
    }
    if (index !== lines.length) return null;
    return { turn: head[1], left: head[2] === undefined ? null : head[2], entities };
  }

  // The scene behind everything: one SVG per (universe, life) look, replaced whole.
  function setBackdrop(viewport) {
    const doc = viewport.ownerDocument;
    const scene = window.AGIIWorld.makeScene(doc);
    scene.classList.add('world-backdrop');
    const old = viewport.querySelector(':scope > .world-backdrop');
    if (old) old.replaceWith(scene); else viewport.prepend(scene);
  }

  // -1 is the camp post; otherwise {actor, kind, variant} from the look composer.
  function setFigure(host, figure) {
    const doc = host.ownerDocument;
    host.classList.toggle('training-post', figure === -1);
    host.replaceChildren(window.AGIIWorld ? window.AGIIWorld.makeFigure(doc, figure) : makeFigure(doc, figure === -1 ? -1 : 0));
  }

  // The status bar: your tokens | turn | their tokens. Tokens are printed as they
  // are; a screen that does not parse is shown verbatim instead.
  // `foe` is the opponent's printed name (a random word with no meaning); shown
  // under THEM. The camp post has none.
  function renderHud(screen, host, foe = '', labels = {}) {
    const doc = host.ownerDocument;
    const parsed = parseScreen(screen);
    host.replaceChildren();
    host.classList.toggle('hud-raw', !parsed);
    if (!parsed) {
      host.append(element(doc, 'pre', 'screen-original', typeof screen === 'string' ? screen : ''));
      return false;
    }
    const sides = parsed.entities.map((data, index) => {
      const side = element(doc, 'section', 'hud-side ' + (index === 0 ? 'hud-you' : 'hud-them'));
      side.append(element(doc, 'div', 'hud-tag', (index === 0 ? labels.you : labels.them) ?? data.name.toUpperCase()));
      if (index === 1 && foe) side.append(element(doc, 'div', 'hud-name', foe));
      for (const [tokens, className] of [[data.standing, 'slots standing'], [data.transient, 'slots transient']]) {
        const row = element(doc, 'div', className);
        for (const token of tokens) row.append(element(doc, 'span', 'slot', token));
        side.append(row);
      }
      return side;
    });
    const turn = element(doc, 'div', 'hud-turn');
    turn.append(element(doc, 'div', 'hud-tag', labels.turn ?? 'TURN'));
    turn.append(element(doc, 'div', 'hud-turn-n', parsed.turn));
    if (parsed.left !== null) turn.append(element(doc, 'div', 'hud-turn-left', labels.left ? labels.left(parsed.left) : parsed.left + ' LEFT'));
    host.append(sides[0], turn, sides[1]);
    return true;
  }

  function decorateChoice(button, choice) {
    const label = typeof choice.label === 'string' ? choice.label : '';
    button.replaceChildren();
    button.classList.toggle('hand-card', choice.group === 'hand');
    button.setAttribute('aria-label', label);
    button.title = label;
    if (choice.group !== 'hand') {
      button.textContent = label;
      return;
    }
    const doc = button.ownerDocument;
    const match = label.match(/^([^()]+)(\([^()]*\))$/);
    const art = element(doc, 'span', 'card-art');
    art.setAttribute('aria-hidden', 'true');
    art.append(window.AGIIWorld ? window.AGIIWorld.makeToken(doc) : makeCardArt(doc));
    const caption = element(doc, 'span', 'card-label');
    caption.append(element(doc, 'span', 'card-name', match ? match[1] : label));
    if (match) caption.append(element(doc, 'span', 'card-mark', match[2]));
    button.append(art, caption);
  }

  // Only the public command table and the printed opening marker are read. Each
  // fight's figure is decided by (universe, life, fight ordinal): independent of the
  // enemy's identity, numbers, mechanics and random numbers; replaying the events
  // after a refresh gives the same figure.
  function createPortraitSelector(getContext) {
    let inFight = false;
    let current = -1;
    let fights = 0;
    let lifeKey = '';
    const begins = /^\s{3}\[(?:layer \d+|boss \d+)\] (?:fight )?begins\s*$/m;
    return function portraitFor(event) {
      const ctx = (typeof getContext === 'function' && getContext()) || {};
      const key = String(ctx.universe || '') + ':' + String(ctx.life || 0);
      if (key !== lifeKey) { lifeKey = key; fights = 0; inFight = false; current = -1; }
      const camp = (event.choices || []).some(choice => choice.group === 'command' && choice.value === 'reset');
      if (event.kind !== 'act' || camp) { inFight = false; current = -1; return current; }
      if (!inFight || begins.test(event.text || '')) {
        fights += 1;
        current = window.AGIILook ? window.AGIILook.fightFigure(ctx.universe || '', ctx.life || 0, fights) : { actor: 0, kind: 0, variant: 0 };
      }
      inFight = true;
      return current;
    };
  }

  // These exact original silhouettes also serve the preserved dungeon world.
  window.AGIIClassic = Object.freeze({
    ...window.AGIIClassic, makeFigure, makeToken: makeCardArt
  });
  window.AGIIVisual = Object.freeze({ parseScreen, setBackdrop, setFigure, renderHud, decorateChoice, makeClassicFigure: makeFigure, makeClassicToken: makeCardArt });
})();
