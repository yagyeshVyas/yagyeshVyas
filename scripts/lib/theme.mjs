// Shared visual language for every generated panel.
// One palette, one grid, one type scale. Nothing here depends on GitHub's CSS.

export const C = {
  bg: '#06090F',
  bgLift: '#0A0F19',
  panel: '#0A101A',
  line: '#17202F',
  line2: '#243349',
  text: '#E9EFF8',
  sub: '#9BA9BE',
  muted: '#6C7C93',
  faint: '#425167',
  mint: '#4EF0C0',
  mintDim: '#1E8E77',
  amber: '#F5C778',
  blue: '#7EA2FF',
  heat: ['#0C141E', '#123A35', '#176B5C', '#22A98C', '#4EF0C0'],
};

export const F = {
  mono: `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`,
  sans: `Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  serif: `Georgia, 'Times New Roman', serif`,
};

export const LANG_COLOR = {
  Python: '#3572A5',
  JavaScript: '#F1E05A',
  TypeScript: '#3178C6',
  Swift: '#F05138',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Dart: '#00B4AB',
  Shell: '#89E051',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Java: '#B07219',
  'C++': '#F34B7D',
  C: '#555555',
  Vue: '#41B883',
  Svelte: '#FF3E00',
};

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const fmt = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

export const pad2 = (n) => String(n).padStart(2, '0');

// Deliberately conservative text measurement. Used only to keep copy from
// spilling out of a fixed-width panel; the visual check is the screenshot.
const NARROW = new Set([...`iIl.,:;'’|![](){} `]);
export function textWidth(s, size, mono = false) {
  let units = 0;
  for (const ch of s) {
    if (NARROW.has(ch)) units += mono ? 0.52 : 0.3;
    else if (/[A-Z0-9]/.test(ch)) units += mono ? 0.62 : 0.63;
    else if (ch === 'm' || ch === 'w' || ch === 'M' || ch === 'W') units += 0.84;
    else units += mono ? 0.6 : 0.55;
  }
  return units * size;
}

export function wrap(s, maxWidth, size, mono = false, maxLines = 2) {
  const words = String(s).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (textWidth(next, size, mono) <= maxWidth) line = next;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.length > 1 && textWidth(last + '…', size, mono) > maxWidth) last = last.slice(0, -1).trimEnd();
  kept[maxLines - 1] = last + '…';
  return kept;
}

export const reducedMotion = `@media (prefers-reduced-motion: reduce) {
  .mo { display: none !important; }
  * { animation: none !important; }
}`;

const sharedStyle = (p) => `<style>
  .m${p}{font-family:${F.mono}}
  .s${p}{font-family:${F.sans}}
  .r${p}{font-family:${F.serif}}
  ${reducedMotion}
</style>`;

/**
 * Full-bleed panel frame: rounded shell, dot grid, corner registration marks,
 * optional section header with a light that travels the rule.
 */
export function panel({
  p,
  w,
  h,
  aria,
  index,
  label,
  meta,
  children = '',
  defs = '',
  body = true,
  accent = C.mint,
  glow = true,
}) {
  const gid = `${p}-frame`;
  const indexWidth = index != null ? textWidth(String(index), 10, true) : 0;
  const labelX = Math.max(58, 30 + indexWidth + 16);
  const header =
    index != null
      ? `
    <text x="30" y="45" class="m${p}" font-size="10" letter-spacing="1.6" fill="${accent}">${esc(index)}</text>
    <text x="${labelX}" y="45" class="m${p}" font-size="10.5" letter-spacing="3.4" fill="${C.sub}">${esc(label)}</text>
    <text x="${w - 30}" y="45" class="m${p}" font-size="9.5" letter-spacing="1.2" fill="${C.muted}" text-anchor="end">${esc(meta || '')}</text>
    <line x1="30" y1="62" x2="${w - 30}" y2="62" stroke="${C.line}" stroke-width="1"/>
    <g clip-path="url(#${p}-rule)">
      <rect class="mo" x="-90" y="61.2" width="90" height="1.6" fill="url(#${p}-ruleG)">
        <animate attributeName="x" values="-90;${w}" dur="7s" begin="1s" repeatCount="indefinite"/>
      </rect>
    </g>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(aria)}">
  <title>${esc(aria)}</title>
  ${sharedStyle(p)}
  <defs>
    <clipPath id="${gid}"><rect width="${w}" height="${h}" rx="18"/></clipPath>
    <linearGradient id="${p}-shell" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.bgLift}"/><stop offset="100%" stop-color="${C.bg}"/>
    </linearGradient>
    <pattern id="${p}-dots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="0.9" fill="${C.line2}" opacity="0.55"/>
    </pattern>
    <linearGradient id="${p}-ruleG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0"/><stop offset="50%" stop-color="${accent}" stop-opacity="0.9"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="${p}-rule"><rect x="30" y="60" width="${w - 60}" height="4"/></clipPath>
    <radialGradient id="${p}-tint" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.07"/><stop offset="70%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    ${defs}
  </defs>
  <g clip-path="url(#${gid})">
    <rect width="${w}" height="${h}" fill="url(#${p}-shell)"/>
    <rect width="${w}" height="${h}" fill="url(#${p}-dots)"/>
    ${glow ? `<rect width="${w}" height="${h}" fill="url(#${p}-tint)"/>` : ''}
    ${header}
    ${body ? '<rect x="1" y="1" width="' + (w - 2) + '" height="1" fill="#FFFFFF" opacity="0.035"/>' : ''}
    ${children}
  </g>
  <rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" rx="17.25" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  ${cornerMarks(w, h)}
</svg>`;
}

function cornerMarks(w, h) {
  const d = 7;
  return `<g stroke="${C.line2}" stroke-width="1" opacity="0.75">
    <path d="M16 ${16 + d}V16h${d}" fill="none"/>
    <path d="M${w - 16 - d} 16h${d}v${d}" fill="none"/>
    <path d="M16 ${h - 16 - d}v${d}h${d}" fill="none"/>
    <path d="M${w - 16 - d} ${h - 16}h${d}v${d}" fill="none"/>
  </g>`;
}

export function chip({ p, x, y, text, h = 23, size = 9.5, color = C.mint, fill = '#0B121C' }) {
  // 20px left inset + measured glyphs + tracking + right pad.
  const tw = textWidth(text, size, true) + text.length * 0.9;
  const width = Math.max(58, Math.round(tw + 32));
  return {
    width,
    svg: `<g>
      <rect x="${x}" y="${y}" width="${width}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${C.line2}" stroke-width="1"/>
      <rect x="${x + 10}" y="${y + h / 2 - 1.5}" width="3" height="3" rx="0.5" fill="${color}"/>
      <text x="${x + 20}" y="${y + h / 2 + 3.3}" class="m${p}" font-size="${size}" letter-spacing="0.9" fill="${C.sub}">${esc(text)}</text>
    </g>`,
  };
}

export function dot({ cx, cy, r = 3, color = C.mint, period = 2.8, delay = 0 }) {
  return `<g>
    <circle class="mo" cx="${cx}" cy="${cy}" r="${r + 5}" fill="${color}" opacity="0.10">
      <animate attributeName="r" values="${r + 2};${r + 8};${r + 2}" dur="${period}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.16;0.04;0.16" dur="${period}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>
  </g>`;
}

export const easeInOut = `calcMode="spline" keySplines="0.3 0 0.2 1"`;
