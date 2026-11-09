const paths = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>', diagonal: '<path d="M6 18 18 6M7 6h11v11"/>', chevron: '<path d="m9 6 6 6-6 6"/>',
  compass: '<circle cx="12" cy="12" r="8"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2ZM12 2v3m0 14v3M2 12h3m14 0h3"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  shield: '<path d="m12 3 7 3v5c0 4-2.6 7.6-7 10-4.4-2.4-7-6-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
  monitor: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  note: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7m-7 4h7"/>',
  orbit: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)"/>',
  cross: '<path d="M6 6l12 12M6 18 18 6"/>', menu: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  fight: '<path d="m12 3 7 9-7 9-7-9 7-9Z"/><circle cx="12" cy="12" r="2"/>',
  rest: '<path d="M4 16h16M7 12a5 5 0 1 1 10 0m-5-9v2M3 9l2 1m14 0 2-1"/>',
  gate: '<path d="M5 20V9a7 7 0 1 1 14 0v11M9 20V9a3 3 0 1 1 6 0v11M3 20h18"/>',
  check: '<path d="m5 12 4 4 10-10"/>', download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
};
export const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ''}</svg>`;

const sigils = [
  '<path d="M40 9 63 40 40 71 17 40Z M40 20 55 40 40 60 25 40Z"/><circle cx="40" cy="40" r="5"/>',
  '<circle cx="40" cy="40" r="23"/><path d="M40 12v56M12 40h56M40 24l16 16-16 16-16-16z"/><circle cx="40" cy="40" r="3"/>',
  '<path d="M40 12 65 57H15Zm0 14 14 24H26Z M31 65h18"/><circle cx="40" cy="44" r="3"/>',
  '<ellipse cx="40" cy="40" rx="28" ry="13" transform="rotate(-45 40 40)"/><ellipse cx="40" cy="40" rx="28" ry="13" transform="rotate(45 40 40)"/><circle cx="40" cy="40" r="5"/>',
  '<path d="M24 21h32l13 19-13 19H24L11 40ZM40 21v38M11 40h58M24 21l32 38m0-38L24 59"/><circle cx="40" cy="40" r="6"/>',
];
export function sigil(name) {
  const nameOrder = ['vrikkai', 'hunzou', 'kaekra', 'tiajia', 'saintil', 'dorven', 'mozzek', 'eskaro', 'syvran', 'luthai'];
  const index = Math.max(0, nameOrder.indexOf(name)) % sigils.length;
  return `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><circle cx="40" cy="40" r="34" opacity=".28" stroke-dasharray="1 4"/>${sigils[index]}</svg>`;
}

