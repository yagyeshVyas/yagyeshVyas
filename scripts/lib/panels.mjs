// Every panel is a standalone SVG: GitHub serves each one through camo, so no
// cross-file state and no external fonts/images. All motion is opacity or
// transform based, loops forever, and is disabled under reduced motion.

import {
  C,
  F,
  LANG_COLOR,
  esc,
  fmt,
  textWidth,
  wrap,
  panel,
  chip,
  dot,
  reducedMotion,
} from './theme.mjs';
import { CONSTELLATION, FLAGSHIPS, LINKS, REPO_COPY, TICKER, TOOLBOX } from './content.mjs';

const ACCENTS = {
  personalforge: C.mint,
  VibeGuard: C.amber,
  default: '#7D97BC',
};

const accentFor = (name) => ACCENTS[name] || ACCENTS.default;

const starsLabel = (n) => `★ ${fmt(n)}`;

function relDays(iso, today) {
  const a = new Date(iso.slice(0, 10) + 'T00:00:00Z');
  const b = new Date(today + 'T00:00:00Z');
  const d = Math.round((b - a) / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return '1d ago';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

// ---------------------------------------------------------------- 00 hero
export function hero(data, build) {
  const p = 'hero';
  const w = 1000;
  const h = 470;
  const s = data.stats;
  const name = 'Yagyesh Vyas';
  const nameSize = 74;
  const nameW = textWidth(name, nameSize);
  const cx = 794;
  const cy = 228;

  let chips = '';
  let chipX = 56;
  for (const label of ['LLM FINE-TUNING', 'RAG', 'AI SECURITY', 'OFFLINE-FIRST']) {
    const c = chip({ p, x: chipX, y: 310, text: label });
    chips += c.svg;
    chipX += c.width + 8;
  }

  let ticks = '';
  for (let i = 0; i < 48; i++) {
    const a = (i * 7.5 * Math.PI) / 180;
    const long = i % 4 === 0;
    const r1 = long ? 149 : 153;
    const x1 = (cx + Math.cos(a) * r1).toFixed(1);
    const y1 = (cy + Math.sin(a) * r1).toFixed(1);
    const x2 = (cx + Math.cos(a) * 159).toFixed(1);
    const y2 = (cy + Math.sin(a) * 159).toFixed(1);
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.line2}" stroke-width="1" opacity="${long ? 0.9 : 0.45}"/>`;
  }

  const orbit = (r, dur, reverse, color, delay) => `
    <g class="mo">
      <animateTransform attributeName="transform" type="rotate" from="${reverse ? 360 : 0} ${cx} ${cy}" to="${reverse ? 0 : 360} ${cx} ${cy}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <circle cx="${cx + r}" cy="${cy}" r="2.2" fill="${color}" opacity="0.85"/>
      <circle cx="${cx + r}" cy="${cy}" r="6" fill="${color}" opacity="0.10"/>
    </g>`;

  const defs = `
    <linearGradient id="hero-name" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="62%" stop-color="#E6FFF7"/><stop offset="100%" stop-color="#8FF3D6"/>
    </linearGradient>
    <linearGradient id="hero-rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.mint}" stop-opacity="0.9"/><stop offset="100%" stop-color="${C.mint}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="hero-core" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.mint}"/><stop offset="55%" stop-color="#5AC8FF"/><stop offset="100%" stop-color="${C.amber}"/>
    </linearGradient>
    <radialGradient id="hero-core-fill" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="${C.mint}" stop-opacity="0.22"/><stop offset="100%" stop-color="${C.bg}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.mint}" stop-opacity="0.16"/><stop offset="100%" stop-color="${C.mint}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hero-glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.amber}" stop-opacity="0.10"/><stop offset="100%" stop-color="${C.amber}" stop-opacity="0"/>
    </radialGradient>
    <style>
      @keyframes hero-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
      .hero-cursor { animation: hero-blink 1.15s steps(1, end) infinite; }
    </style>`;

  const children = `
    <rect width="${w}" height="${h}" fill="url(#hero-glow2)" transform="translate(880,430)" opacity="0.9"/>
    <circle cx="${cx}" cy="${cy}" r="280" fill="url(#hero-glow)"/>
    <g>
      <circle cx="${cx}" cy="${cy}" r="158" fill="none" stroke="${C.line2}" stroke-width="1" opacity="0.7"/>
      ${ticks}
      <g class="mo">
        <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="48s" repeatCount="indefinite"/>
        <circle cx="${cx}" cy="${cy}" r="126" fill="none" stroke="${C.mint}" stroke-width="1" stroke-dasharray="2 10" opacity="0.5"/>
      </g>
      <g class="mo">
        <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="18s" repeatCount="indefinite"/>
        <circle cx="${cx}" cy="${cy}" r="158" fill="none" stroke="${C.mint}" stroke-width="2" stroke-linecap="round" stroke-dasharray="94 899" opacity="0.9"/>
      </g>
      <g class="mo">
        <animateTransform attributeName="transform" type="rotate" from="360 ${cx} ${cy}" to="0 ${cx} ${cy}" dur="26s" repeatCount="indefinite"/>
        <circle cx="${cx}" cy="${cy}" r="94" fill="none" stroke="${C.amber}" stroke-width="1.4" stroke-dasharray="30 561" opacity="0.55"/>
      </g>
      ${orbit(126, 30, false, C.mint, 0)}
      ${orbit(158, 44, true, C.amber, -12)}
      ${orbit(94, 22, false, '#A9FFF0', -6)}
      <circle class="mo" cx="${cx}" cy="${cy}" r="52" fill="none" stroke="${C.mint}" stroke-width="1" opacity="0">
        <animate attributeName="r" values="52;176" dur="6s" begin="0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.42;0" dur="6s" begin="0s" repeatCount="indefinite"/>
      </circle>
      <circle class="mo" cx="${cx}" cy="${cy}" r="52" fill="none" stroke="${C.mint}" stroke-width="1" opacity="0">
        <animate attributeName="r" values="52;176" dur="6s" begin="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.42;0" dur="6s" begin="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${cx}" cy="${cy}" r="53" fill="#081019"/>
      <circle cx="${cx}" cy="${cy}" r="52" fill="url(#hero-core-fill)"/>
      <circle cx="${cx}" cy="${cy}" r="52" fill="none" stroke="url(#hero-core)" stroke-width="1.5"/>
      <g class="mo">
        <animateTransform attributeName="transform" type="rotate" from="360 ${cx} ${cy}" to="0 ${cx} ${cy}" dur="24s" repeatCount="indefinite"/>
        <circle cx="${cx}" cy="${cy}" r="39" fill="none" stroke="${C.mint}" stroke-width="0.9" stroke-dasharray="1 6" opacity="0.5"/>
      </g>
      <text x="${cx}" y="${cy + 5}" class="m${p}" font-size="16" font-weight="700" letter-spacing="2" fill="${C.mint}" text-anchor="middle">YV</text>
      <g class="mo" opacity="0">
        <circle r="9" fill="${C.mint}" opacity="0.16"/><circle r="2.4" fill="#E7FFF9"/>
        <animateMotion dur="26s" repeatCount="indefinite" path="M ${cx} ${cy - 158} A 158 158 0 1 1 ${cx - 0.1} ${cy - 158} A 158 158 0 1 1 ${cx} ${cy - 158}"/>
      </g>
    </g>

    <text x="56" y="64" class="m${p}" font-size="10.5" letter-spacing="3.6" fill="${C.mint}">// AI / ML ENGINEER</text>
    <text x="56" y="150" class="s${p}" font-size="${nameSize}" font-weight="800" letter-spacing="-3.2" fill="url(#hero-name)">${esc(name)}</text>
    <rect class="hero-cursor" x="${(56 + nameW + 8).toFixed(0)}" y="102" width="6" height="52" rx="1" fill="${C.mint}"/>
    <line x1="56" y1="172" x2="${(56 + nameW).toFixed(0)}" y2="172" stroke="url(#hero-rule)" stroke-width="1.5"/>
    <text x="56" y="204" class="s${p}" font-size="16" fill="${C.sub}">Fine-tuning LLMs that run entirely offline.</text>
    <text x="56" y="228" class="s${p}" font-size="16" fill="${C.sub}">Shipping AI-security tools for AI-written code.</text>

    <g>
      <rect x="56" y="256" width="222" height="28" rx="14" fill="${C.mint}" fill-opacity="0.06" stroke="${C.mint}" stroke-opacity="0.32" stroke-width="1"/>
      ${dot({ cx: 74, cy: 270, r: 2.6, color: C.mint })}
      <text x="88" y="274" class="m${p}" font-size="9.5" letter-spacing="1.7" fill="${C.mint}">BUILDING IN PUBLIC</text>
    </g>
    <text x="294" y="274" class="m${p}" font-size="9.5" letter-spacing="0.8" fill="${C.muted}">RICHMOND, VA · M.S. CS 2026</text>
    ${chips}

    <line x1="56" y1="404" x2="944" y2="404" stroke="${C.line}" stroke-width="1"/>
    <text x="56" y="430" class="m${p}" font-size="8.5" letter-spacing="1.4" fill="${C.faint}">BUILD ${esc(build.stamp)}</text>
    <text x="500" y="430" class="m${p}" font-size="8.5" letter-spacing="1.4" fill="${C.muted}" text-anchor="middle">${s.repos} REPOS · ★ ${fmt(s.stars)} · ${fmt(s.contributions)} CONTRIBUTIONS</text>
    <text x="944" y="430" class="m${p}" font-size="8.5" letter-spacing="1.4" fill="${C.muted}" text-anchor="end">SYS.NOMINAL</text>
    ${dot({ cx: 866, cy: 427, r: 2.2, color: C.mint, period: 2.4 })}`;

  return panel({
    p,
    w,
    h,
    aria: `Yagyesh Vyas — AI/ML engineer. ${s.repos} public repositories, ${s.stars} stars, ${s.contributions} contributions.`,
    defs,
    children,
    body: false,
    glow: false,
  });
}

// ---------------------------------------------------------------- ticker
export function ticker() {
  const p = 'ticker';
  const w = 1000;
  const h = 54;
  const size = 10;
  const items = [];
  let x = 0;
  for (const t of TICKER) {
    const tw = textWidth(t, size, true) + t.length * 2.1;
    items.push(`<text x="${x.toFixed(1)}" y="32" class="m${p}" font-size="${size}" letter-spacing="2.1" fill="${C.sub}">${esc(t)}</text>`);
    x += tw + 16;
    items.push(`<text x="${x.toFixed(1)}" y="32" class="m${p}" font-size="8" fill="${C.mint}" opacity="0.8">✦</text>`);
    x += 32;
  }
  const unit = x;
  const run = items.join('');
  const defs = `
    <linearGradient id="ticker-fadeL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.bgLift}"/><stop offset="100%" stop-color="${C.bgLift}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="ticker-fadeR" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="${C.bgLift}"/><stop offset="100%" stop-color="${C.bgLift}" stop-opacity="0"/>
    </linearGradient>`;
  const children = `
    <style>
      @keyframes ticker-run { from { transform: translateX(0) } to { transform: translateX(-${unit}px) } }
      .ticker-run { animation: ticker-run 52s linear infinite; }
    </style>
    <g class="ticker-run">
      <g>${run}</g><g transform="translate(${unit} 0)">${run}</g>
    </g>
    <rect x="0" y="1" width="110" height="${h - 2}" fill="url(#ticker-fadeL)"/>
    <rect x="${w - 110}" y="1" width="110" height="${h - 2}" fill="url(#ticker-fadeR)"/>`;
  return panel({
    p,
    w,
    h,
    aria: 'Stack ticker: LLM fine-tuning, RAG, LoRA, GGUF, local inference, AI security, MCP, Swift, Flutter, Playwright.',
    defs,
    children,
    body: false,
    glow: false,
  });
}

// ---------------------------------------------------------------- 01 identity
export function identity() {
  const p = 'identity';
  const w = 1000;
  const h = 330;
  const principles = [
    {
      n: '01',
      title: 'Make intelligence local.',
      body: 'LoRA, RAG and GGUF — your data never leaves the machine.',
    },
    {
      n: '02',
      title: 'Security is a feature.',
      body: 'Scanners, sandboxes and signed approvals, built in.',
    },
    {
      n: '03',
      title: 'Ship the whole thing.',
      body: 'UI, docs, CI and installers — not just a repository.',
    },
  ];

  let rows = '';
  const facts = [
    ['FOCUS', 'Local LLMs · RAG · AI security'],
    ['STACK', 'Python · JavaScript · Swift · Flutter'],
    ['NOW', 'Building glance-ai + chromex'],
  ];
  facts.forEach(([k, v], i) => {
    const y = 202 + i * 40;
    rows += `
      <line x1="56" y1="${y - 18}" x2="440" y2="${y - 18}" stroke="${C.line}" stroke-width="1"/>
      <text x="56" y="${y}" class="m${p}" font-size="8.5" letter-spacing="2" fill="${C.faint}">${k}</text>
      <text x="160" y="${y}" class="s${p}" font-size="12.5" fill="${C.sub}">${esc(v)}</text>`;
  });

  let list = '';
  principles.forEach((pr, i) => {
    const y = 108 + i * 78;
    const lines = wrap(pr.body, 350, 12);
    list += `
      ${i ? `<line x1="528" y1="${y - 26}" x2="944" y2="${y - 26}" stroke="${C.line}" stroke-width="1"/>` : ''}
      <text x="528" y="${y}" class="m${p}" font-size="9" letter-spacing="1.6" fill="${C.mint}">${pr.n}</text>
      <text x="562" y="${y}" class="s${p}" font-size="15.5" font-weight="600" fill="${C.text}">${esc(pr.title)}</text>
      ${lines.map((l, li) => `<text x="562" y="${y + 22 + li * 16}" class="s${p}" font-size="12" fill="${C.muted}">${esc(l)}</text>`).join('')}`;
  });

  const children = `
    <rect x="56" y="96" width="86" height="86" rx="18" fill="#091019" stroke="url(#identity-ring)" stroke-width="1.3"/>
    <rect class="mo" x="56" y="96" width="86" height="86" rx="18" fill="none" stroke="${C.mint}" stroke-width="1" stroke-dasharray="1 7" opacity="0.45">
      <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="9s" repeatCount="indefinite"/>
    </rect>
    <text x="99" y="149" class="m${p}" font-size="26" font-weight="700" letter-spacing="2" fill="${C.text}" text-anchor="middle">YV</text>
    <text x="166" y="124" class="s${p}" font-size="25" font-weight="700" letter-spacing="-0.6" fill="${C.text}">Yagyesh Vyas</text>
    <text x="166" y="150" class="m${p}" font-size="9.5" letter-spacing="2.6" fill="${C.mint}">AI / ML ENGINEER</text>
    ${rows}
    <line x1="488" y1="92" x2="488" y2="300" stroke="${C.line}" stroke-width="1"/>
    <circle class="mo" cx="488" cy="120" r="2" fill="${C.mint}">
      <animate attributeName="cy" values="100;292;100" dur="12s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="12s" repeatCount="indefinite"/>
    </circle>
    ${list}
    <text x="936" y="306" class="m${p}" font-size="8" letter-spacing="1.6" fill="${C.faint}" text-anchor="end">[ YV / 2026 ]</text>`;

  const defs = `<linearGradient id="identity-ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.mint}"/><stop offset="100%" stop-color="${C.amber}" stop-opacity="0.5"/>
    </linearGradient>`;

  return panel({
    p,
    w,
    h,
    index: '01',
    label: 'IDENTITY',
    meta: 'RICHMOND, VA · UTC−5',
    aria: 'About Yagyesh Vyas: AI/ML engineer focused on local LLMs, RAG and AI security.',
    defs,
    children,
  });
}

// ---------------------------------------------------------------- 02 telemetry
export function telemetry(data, build) {
  const p = 'telemetry';
  const w = 1000;
  const h = 320;
  const s = data.stats;
  const cal = data.calendar;
  const cell = 7;
  const gap = 3;
  const pitch = cell + gap;
  const hx = 424;
  const hy = 112;
  const hw = cal.grid.length * pitch - gap;
  const hh = 7 * pitch - gap;

  const metrics = [
    { x: 56, y: 132, value: fmt(s.stars), label: 'STARS', glyph: '★', color: C.amber },
    { x: 232, y: 132, value: fmt(s.contributions), label: 'CONTRIBUTIONS', glyph: '∿', color: C.mint },
    { x: 56, y: 232, value: String(s.repos), label: 'PUBLIC REPOS', glyph: '◫', color: C.blue },
    { x: 232, y: 232, value: String(s.followers), label: 'FOLLOWERS', glyph: '◎', color: C.sub },
  ];
  const metricSvg = metrics
    .map(
      (m) => `
      <text x="${m.x}" y="${m.y - 36}" class="m${p}" font-size="8.5" letter-spacing="1.8" fill="${C.faint}">${m.glyph} ${m.label}</text>
      <text x="${m.x}" y="${m.y}" class="m${p}" font-size="34" font-weight="700" letter-spacing="-1" fill="${C.text}">${m.value}</text>
      <line x1="${m.x}" y1="${m.y + 10}" x2="${m.x + 78}" y2="${m.y + 10}" stroke="${m.color}" stroke-width="1" opacity="0.35"/>`,
    )
    .join('');

  let cells = '';
  cal.grid.forEach((colDays, col) => {
    colDays.forEach((d, row) => {
      if (!d) return;
      const lv = cal.level(d.count);
      const isToday = d.date === data.today;
      cells += `<rect x="${hx + col * pitch}" y="${hy + row * pitch}" width="${cell}" height="${cell}" rx="1.5" fill="${C.heat[lv]}"${isToday ? ` stroke="${C.mint}" stroke-width="0.8"` : ''}/>`;
    });
  });

  const months = cal.months
    .map(
      (m) =>
        `<text x="${hx + m.col * pitch}" y="${hy - 10}" class="m${p}" font-size="7.5" letter-spacing="0.8" fill="${C.faint}">${m.label}</text>`,
    )
    .join('');

  let legend = '';
  const legendX = 812;
  legend += `<text x="${legendX}" y="${hy + hh + 18}" class="m${p}" font-size="7.5" letter-spacing="1" fill="${C.faint}">LESS</text>`;
  for (let i = 0; i < 5; i++)
    legend += `<rect x="${legendX + 32 + i * 12}" y="${hy + hh + 11}" width="8" height="8" rx="1.5" fill="${C.heat[i]}"/>`;
  legend += `<text x="${legendX + 32 + 60 + 8}" y="${hy + hh + 18}" class="m${p}" font-size="7.5" letter-spacing="1" fill="${C.faint}">MORE</text>`;

  let barX = 56;
  let bar = '';
  const langs = s.languages.slice(0, 6);
  for (const lang of langs) {
    const seg = Math.max(3, (lang.pct / 100) * 888 - 2);
    bar += `<rect x="${barX.toFixed(1)}" y="270" width="${seg.toFixed(1)}" height="8" rx="2" fill="${lang.color}"/>`;
    barX += (lang.pct / 100) * 888;
  }
  if (944 - barX > 1) bar += `<rect x="${barX.toFixed(1)}" y="270" width="${(944 - barX).toFixed(1)}" height="8" rx="2" fill="${C.line2}"/>`;

  const langLabels = langs
    .map(
      (lang, i) => `
      <circle cx="${56 + i * 148 + 3}" cy="295" r="3" fill="${lang.color}"/>
      <text x="${56 + i * 148 + 12}" y="298" class="s${p}" font-size="9.5" fill="${C.sub}">${esc(lang.name)}</text>
      <text x="${56 + i * 148 + 116}" y="298" class="m${p}" font-size="8" fill="${C.faint}" text-anchor="end">${Math.round(lang.pct)}%</text>`,
    )
    .join('');

  const defs = `
    <clipPath id="telemetry-heat"><rect x="${hx}" y="${hy}" width="${hw}" height="${hh}"/></clipPath>
    <linearGradient id="telemetry-scan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.mint}" stop-opacity="0"/><stop offset="50%" stop-color="${C.mint}" stop-opacity="0.22"/><stop offset="100%" stop-color="${C.mint}" stop-opacity="0"/>
    </linearGradient>`;

  const children = `
    ${metricSvg}
    <line x1="400" y1="92" x2="400" y2="252" stroke="${C.line}" stroke-width="1"/>
    ${months}
    ${cells}
    <g clip-path="url(#telemetry-heat)" opacity="0.9">
      <rect class="mo" x="-120" y="${hy}" width="120" height="${hh}" fill="url(#telemetry-scan)">
        <animate attributeName="x" values="-120;${hx + hw + 20}" dur="9s" begin="1.5s" repeatCount="indefinite"/>
      </rect>
    </g>
    ${legend}
    <text x="${hx}" y="${hy + hh + 40}" class="m${p}" font-size="9" letter-spacing="0.8" fill="${C.sub}">${fmt(s.contributions)} CONTRIBUTIONS · ${s.activeDays} ACTIVE DAYS · ${s.longestStreak}D STREAK · 12 MONTHS</text>
    <line x1="56" y1="258" x2="944" y2="258" stroke="${C.line}" stroke-width="1"/>
    ${bar}
    ${langLabels}`;

  return panel({
    p,
    w,
    h,
    index: '02',
    label: 'TELEMETRY',
    meta: `PUBLIC DATA · SYNCED ${build.synced}`,
    aria: `GitHub telemetry: ${s.stars} stars, ${s.contributions} contributions, ${s.repos} public repositories, ${s.followers} followers.`,
    defs,
    children,
  });
}

// ---------------------------------------------------------------- 03 constellation
export function constellation(data) {
  const p = 'constellation';
  const w = 1000;
  const h = 500;
  const cx = 500;
  const cy = 262;
  const profile = data.repos.find((r) => r.name === data.user.login);
  const sat = data.repos.filter((r) => r.name !== data.user.login);

  const pos = (repo, i) => {
    const fixed = CONSTELLATION[repo.name];
    if (fixed) return fixed;
    const a = ((i * 137.5 + 40) * Math.PI) / 180;
    const rad = 205 + (i % 3) * 18;
    return {
      x: Math.max(96, Math.min(904, cx + Math.cos(a) * rad * 1.15)),
      y: Math.max(120, Math.min(400, cy + Math.sin(a) * rad * 0.62)),
      side: Math.cos(a) >= 0 ? 'right' : 'left',
    };
  };

  const nodes = sat.map((repo, i) => {
    const q = pos(repo, i);
    return { repo, ...q, r: Math.min(31, 6 + Math.sqrt(repo.stars) * 2.45) };
  });

  let seed = 20261122;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let stars = '';
  for (let i = 0; i < 84; i++) {
    const x = 40 + rnd() * 920;
    const y = 82 + rnd() * 356;
    const r = 0.5 + rnd() * 0.9;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#CFE0FF" opacity="${(0.08 + rnd() * 0.22).toFixed(2)}"/>`;
  }

  let edges = '';
  nodes.forEach((n, i) => {
    const mx = (cx + n.x) / 2;
    const my = (cy + n.y) / 2 - (i % 2 ? 18 : -14);
    const accent = accentFor(n.repo.name);
    const hot = FLAGSHIPS.includes(n.repo.name);
    edges += `<path class="${hot ? 'constel-edge' : ''}" d="M ${cx} ${cy} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${n.x} ${n.y}" fill="none" stroke="${hot ? accent : C.line2}" stroke-width="${hot ? 1.1 : 0.8}" stroke-dasharray="2 6" opacity="${hot ? 0.55 : 0.6}">
    </path>`;
  });

  let nodeSvg = '';
  nodes.forEach((n, i) => {
    const { repo } = n;
    const accent = accentFor(repo.name);
    const hot = FLAGSHIPS.includes(repo.name);
    let label = '';
    const nameY = n.y + 4;
    if (n.side === 'right') {
      label = `
        <text x="${n.x + n.r + 14}" y="${nameY - 4}" class="m${p}" font-size="10.5" fill="${C.text}">${esc(repo.name)}</text>
        <text x="${n.x + n.r + 14}" y="${nameY + 10}" class="m${p}" font-size="8.5" letter-spacing="0.6" fill="${C.amber}">${starsLabel(repo.stars)}</text>`;
    } else if (n.side === 'left') {
      label = `
        <text x="${n.x - n.r - 14}" y="${nameY - 4}" class="m${p}" font-size="10.5" fill="${C.text}" text-anchor="end">${esc(repo.name)}</text>
        <text x="${n.x - n.r - 14}" y="${nameY + 10}" class="m${p}" font-size="8.5" letter-spacing="0.6" fill="${C.amber}" text-anchor="end">${starsLabel(repo.stars)}</text>`;
    } else {
      label = `
        <text x="${n.x}" y="${n.y + n.r + 22}" class="m${p}" font-size="10.5" fill="${C.text}" text-anchor="middle">${esc(repo.name)}</text>
        <text x="${n.x}" y="${n.y + n.r + 35}" class="m${p}" font-size="8.5" fill="${C.amber}" text-anchor="middle">${starsLabel(repo.stars)}</text>`;
    }
    nodeSvg += `
      <g>
        <circle cx="${n.x}" cy="${n.y}" r="${n.r + 14}" fill="${accent}" opacity="0.05"/>
        ${hot ? `<circle class="mo" cx="${n.x}" cy="${n.y}" r="${n.r}" fill="none" stroke="${accent}" stroke-width="1" opacity="0">
          <animate attributeName="r" values="${n.r};${n.r + 26}" dur="6s" begin="${i * 0.8}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.35;0" dur="6s" begin="${i * 0.8}s" repeatCount="indefinite"/>
        </circle>` : ''}
        <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="#081019" stroke="${accent}" stroke-width="${hot ? 1.5 : 1}" opacity="0.98"/>
        <circle cx="${n.x}" cy="${n.y}" r="${Math.max(1.8, n.r * 0.18)}" fill="${accent}"/>
        ${label}
      </g>`;
  });

  const coreLabel = profile?.name || data.user.login;
  const children = `
    <style>
      @keyframes constel-edge { to { stroke-dashoffset: -64 } }
      .constel-edge { animation: constel-edge 7s linear infinite; }
    </style>
    <g opacity="0.9">${stars}</g>
    <g transform="rotate(-8 ${cx} ${cy})">
      <ellipse cx="${cx}" cy="${cy}" rx="332" ry="132" fill="none" stroke="${C.line2}" stroke-width="0.8" stroke-dasharray="2 9" opacity="0.6"/>
    </g>
    <g transform="rotate(6 ${cx} ${cy})">
      <ellipse cx="${cx}" cy="${cy}" rx="214" ry="86" fill="none" stroke="${C.line2}" stroke-width="0.7" stroke-dasharray="1 7" opacity="0.5"/>
    </g>
    ${edges}
    ${nodeSvg}
    <g>
      <circle class="mo" cx="${cx}" cy="${cy}" r="46" fill="none" stroke="${C.mint}" stroke-width="1" opacity="0">
        <animate attributeName="r" values="30;104" dur="5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.35;0" dur="5s" repeatCount="indefinite"/>
      </circle>
      <circle class="mo" cx="${cx}" cy="${cy}" r="35" fill="none" stroke="${C.mint}" stroke-width="0.9" stroke-dasharray="2 6" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="32s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${cx}" cy="${cy}" r="24" fill="#081019" stroke="${C.mint}" stroke-width="1.2"/>
      <text x="${cx}" y="${cy + 4}" class="m${p}" font-size="9.5" font-weight="700" letter-spacing="1" fill="${C.mint}" text-anchor="middle">YV</text>
      <text x="${cx}" y="${cy + 56}" class="m${p}" font-size="10.5" fill="${C.text}" text-anchor="middle">${esc(coreLabel)}</text>
      <text x="${cx}" y="${cy + 70}" class="m${p}" font-size="7.5" letter-spacing="1.2" fill="${C.faint}" text-anchor="middle">PROFILE · ${starsLabel(profile?.stars ?? 1)}</text>
    </g>
    <g class="mo" opacity="0">
      <circle r="7" fill="${C.mint}" opacity="0.14"/><circle r="2" fill="#E7FFF9"/>
      <animateMotion dur="30s" repeatCount="indefinite" path="M ${cx} ${cy - 132} A 332 132 0 1 1 ${cx - 0.1} ${cy - 132} A 332 132 0 1 1 ${cx} ${cy - 132}" transform="rotate(-8 ${cx} ${cy})"/>
    </g>
    <line x1="56" y1="452" x2="944" y2="452" stroke="${C.line}" stroke-width="1"/>
    <text x="56" y="474" class="m${p}" font-size="8" letter-spacing="1.5" fill="${C.faint}">NODE AREA ∝ STARS</text>
    <text x="500" y="474" class="m${p}" font-size="8" letter-spacing="1.5" fill="${C.faint}" text-anchor="middle">HAND-PLACED · UPDATED DAILY</text>
    <text x="944" y="474" class="m${p}" font-size="8" letter-spacing="1.5" fill="${C.muted}" text-anchor="end">★ ${fmt(data.stats.stars)} ACROSS ${data.stats.repos} REPOS</text>`;

  return panel({
    p,
    w,
    h,
    index: '03',
    label: 'CONSTELLATION',
    meta: `${data.stats.repos} PUBLIC REPOS · SORTED BY STARS`,
    aria: `Repository constellation: ${data.repos.map((r) => `${r.name} with ${r.stars} stars`).join(', ')}.`,
    children,
  });
}

// ---------------------------------------------------------------- flagship cards
export function flagship(repo, index, total) {
  const p = `flag${index}`;
  const w = 490;
  const h = 296;
  const accent = accentFor(repo.name);
  const copy = REPO_COPY[repo.name] || { blurb: repo.description || '', chips: repo.topics.slice(0, 3) };
  const lines = wrap(copy.blurb, 310, 11.5, false, 3);
  let chips = '';
  let chipX = 32;
  for (const label of copy.chips.slice(0, 3)) {
    const c = chip({ p, x: chipX, y: 198, text: label, color: accent, size: 8.5, h: 22 });
    chips += c.svg;
    chipX += c.width + 7;
  }

  const defs = `
    <radialGradient id="flag${index}-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.16"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="flag${index}-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.9"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>`;

  const children = `
    <style>
      @keyframes flag-arrow { 0%, 100% { transform: translate(0, 0) } 50% { transform: translate(2px, -2px) } }
      .flag-arrow { animation: flag-arrow 4s ease-in-out infinite; }
    </style>
    <circle cx="430" cy="96" r="150" fill="url(#flag${index}-glow)"/>
    <text x="32" y="112" class="s${p}" font-size="23" font-weight="700" letter-spacing="-0.4" fill="${C.text}">${esc(repo.name)}</text>
    <text x="458" y="118" class="m${p}" font-size="46" font-weight="700" letter-spacing="-2" fill="${C.text}" text-anchor="end">${fmt(repo.stars)}</text>
    <text x="458" y="140" class="m${p}" font-size="8.5" letter-spacing="1.8" fill="${C.amber}" text-anchor="end">★ STARS</text>
    ${lines.map((l, i) => `<text x="32" y="${152 + i * 16}" class="s${p}" font-size="11.5" fill="${C.sub}">${esc(l)}</text>`).join('')}
    ${chips}
    <line x1="32" y1="244" x2="458" y2="244" stroke="${C.line}" stroke-width="1"/>
    ${repo.language ? `<circle cx="38" cy="268" r="3.5" fill="${LANG_COLOR[repo.language] || C.muted}"/>
      <text x="49" y="271" class="m${p}" font-size="9" fill="${C.muted}">${esc(repo.language)}</text>` : ''}
    <text x="180" y="271" class="m${p}" font-size="9" fill="${C.muted}">${fmt(repo.forks)} FORKS</text>
    <text x="248" y="271" class="m${p}" font-size="9" fill="${C.muted}">${repo.license ? esc(repo.license) : 'OPEN SOURCE'}</text>
    <g>
      <circle cx="452" cy="262" r="14" fill="none" stroke="${accent}" stroke-opacity="0.45" stroke-width="1"/>
      <g class="flag-arrow">
        <text x="452" y="267" class="m${p}" font-size="12" fill="${accent}" text-anchor="middle">↗</text>
      </g>
    </g>
    <line x1="30" y1="63" x2="180" y2="63" stroke="url(#flag${index}-line)" stroke-width="1.5"/>
    <text x="458" y="46" class="m${p}" font-size="8" letter-spacing="1.5" fill="${C.faint}" text-anchor="end">0${index + 1} / 0${total}</text>`;

  return panel({
    p,
    w,
    h,
    index: `04.${index + 1}`,
    label: 'FLAGSHIP',
    meta: '',
    aria: `${repo.name}: ${repo.stars} stars. ${repo.description}`,
    defs,
    children,
  });
}

// ---------------------------------------------------------------- 05 toolbox
export function toolbox() {
  const p = 'toolbox';
  const w = 1000;
  const h = 318;
  const colW = 222;
  let cols = '';
  TOOLBOX.forEach((group, i) => {
    const x = 56 + i * 240;
    if (i) cols += `<line x1="${x - 24}" y1="92" x2="${x - 24}" y2="282" stroke="${C.line}" stroke-width="1"/>`;
    cols += `
      <text x="${x}" y="106" class="m${p}" font-size="9" letter-spacing="2.2" fill="${C.mint}">${esc(group.title)}</text>
      <line x1="${x}" y1="118" x2="${x + 150}" y2="118" stroke="${C.line2}" stroke-width="1"/>
      <rect class="mo" x="${x}" y="117.2" width="46" height="1.6" fill="${C.mint}" opacity="0.5">
        <animate attributeName="x" values="${x};${x + 104};${x}" dur="8s" repeatCount="indefinite"/>
      </rect>`;
    group.items.forEach((item, j) => {
      const y = 148 + j * 26;
      if (j) cols += `<line x1="${x}" y1="${y - 15}" x2="${x + 196}" y2="${y - 15}" stroke="${C.line}" stroke-width="0.7"/>`;
      cols += `
        <rect x="${x}" y="${y - 4}" width="2.5" height="2.5" rx="0.5" fill="${C.line2}"/>
        <text x="${x + 12}" y="${y}" class="s${p}" font-size="12" fill="${C.sub}">${esc(item)}</text>`;
    });
  });
  return panel({
    p,
    w,
    h,
    index: '05',
    label: 'TOOLBOX',
    meta: 'EVIDENCED BY PUBLIC CODE',
    aria: 'Toolbox: Python, PyTorch, Hugging Face, LoRA, RAG, GGUF, JavaScript, Electron, Playwright, SAST, MCP, Swift, Flutter.',
    children: cols,
  });
}

// ---------------------------------------------------------------- 06 signal
export function signal(data) {
  const p = 'signal';
  const w = 1000;
  const h = 260;
  const recent = [...data.repos]
    .filter((r) => r.name !== data.user.login)
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
    .slice(0, 3);
  const newest = recent.reduce((a, r) => (r.pushedAt > a ? r.pushedAt : a), '');

  let cols = '';
  recent.forEach((repo, i) => {
    const x = 56 + i * 312;
    const accent = accentFor(repo.name);
    const lines = wrap(REPO_COPY[repo.name]?.short || repo.description || '', 262, 10.5, false, 2);
    if (i) cols += `<line x1="${x - 40}" y1="96" x2="${x - 40}" y2="226" stroke="${C.line}" stroke-width="1"/>`;
    cols += `
      <rect x="${x}" y="96" width="2" height="130" rx="1" fill="${accent}" opacity="0.55"/>
      <text x="${x + 14}" y="110" class="m${p}" font-size="8" letter-spacing="1.5" fill="${C.faint}">0${i + 1}</text>
      <text x="${x + 14}" y="140" class="m${p}" font-size="14.5" font-weight="700" fill="${C.text}">${esc(repo.name)}</text>
      ${lines.map((l, li) => `<text x="${x + 14}" y="${162 + li * 15}" class="s${p}" font-size="10.5" fill="${C.muted}">${esc(l)}</text>`).join('')}
      ${repo.language ? `<circle cx="${x + 18}" cy="${216}" r="3" fill="${LANG_COLOR[repo.language] || C.muted}"/>
        <text x="${x + 28}" y="${219}" class="m${p}" font-size="8.5" fill="${C.muted}">${esc(repo.language)}</text>` : ''}
      <text x="${x + 290}" y="219" class="m${p}" font-size="8.5" fill="${C.muted}" text-anchor="end">★ ${fmt(repo.stars)} · ${fmt(repo.forks)} FORKS</text>
      <text x="${x + 14}" y="240" class="m${p}" font-size="8" letter-spacing="1.2" fill="${C.faint}">PUSHED ${relDays(repo.pushedAt, data.today).toUpperCase()}</text>`;
  });

  return panel({
    p,
    w,
    h,
    index: '06',
    label: 'RECENT SIGNAL',
    meta: `LAST PUSH ${relDays(newest, data.today).toUpperCase()}`,
    aria: `Recently pushed repositories: ${recent.map((r) => r.name).join(', ')}.`,
    children: `
      ${cols}
      <line x1="56" y1="248" x2="944" y2="248" stroke="${C.line}" stroke-width="1"/>
      <rect class="mo" x="-140" y="247.4" width="140" height="1.4" fill="url(#signal-run)">
        <animate attributeName="x" values="-140;944" dur="6s" repeatCount="indefinite"/>
      </rect>`,
    defs: `<linearGradient id="signal-run" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.mint}" stop-opacity="0"/><stop offset="50%" stop-color="${C.mint}" stop-opacity="0.8"/><stop offset="100%" stop-color="${C.mint}" stop-opacity="0"/>
    </linearGradient>`,
  });
}

// ---------------------------------------------------------------- 07 connect
export function connectHeader() {
  return panel({
    p: 'connect',
    w: 1000,
    h: 76,
    index: '07',
    label: 'CONNECT',
    meta: 'OSS · AI SECURITY · LOCAL AI',
    aria: 'Connect: GitHub, LinkedIn and npm. Portfolio at yagyesh-portfolio.vercel.app.',
    children: `<text x="500" y="45" class="mconnect" font-size="9" letter-spacing="1.2" fill="${C.muted}" text-anchor="middle">yagyesh-portfolio.vercel.app</text>`,
  });
}

export function connectButton(link, i) {
  const p = `btn${i}`;
  const w = 300;
  const h = 104;
  const defs = `
    <linearGradient id="${p}-shell" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0B111C"/><stop offset="100%" stop-color="#070B12"/>
    </linearGradient>
    <linearGradient id="${p}-top" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${link.accent}" stop-opacity="0.7"/><stop offset="70%" stop-color="${link.accent}" stop-opacity="0"/>
    </linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(link.label)}: ${esc(link.handle)}">
  <title>${esc(link.label)} — ${esc(link.handle)}</title>
  <style>.m${p}{font-family:${F.mono}}.s${p}{font-family:${F.sans}}${reducedMotion}
    @keyframes ${p}-arrow { 0%, 100% { transform: translate(0, 0) } 50% { transform: translate(2.5px, -2.5px) } }
    .${p}-arrow { animation: ${p}-arrow 4.2s ease-in-out infinite; animation-delay: ${i * 0.6}s; }
  </style>
  <defs>${defs}</defs>
  <rect width="${w}" height="${h}" rx="16" fill="url(#${p}-shell)"/>
  <rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" rx="15.25" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  <rect x="18" y="0.8" width="150" height="1.6" fill="url(#${p}-top)"/>
  <rect x="20" y="20" width="36" height="36" rx="10" fill="#0B131D" stroke="${link.accent}" stroke-opacity="0.35" stroke-width="1"/>
  <text x="38" y="43" class="m${p}" font-size="10.5" font-weight="700" fill="${link.accent}" text-anchor="middle">${esc(link.mark)}</text>
  <text x="68" y="36" class="s${p}" font-size="14" font-weight="600" fill="${C.text}">${esc(link.label)}</text>
  <text x="68" y="54" class="m${p}" font-size="9" letter-spacing="0.4" fill="${C.muted}">${esc(link.handle)}</text>
  <g class="${p}-arrow">
    <text x="266" y="42" class="m${p}" font-size="14" fill="${link.accent}" text-anchor="middle">↗</text>
  </g>
  <g opacity="0.7">
    <circle cx="${w - 22}" cy="${h - 18}" r="26" fill="${link.accent}" opacity="0.05"/>
  </g>
  <line x1="20" y1="76" x2="280" y2="76" stroke="${C.line}" stroke-width="1"/>
  <text x="20" y="91" class="m${p}" font-size="7.5" letter-spacing="0.9" fill="${C.faint}">${esc(link.href.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</text>
</svg>`;
}

export function footer(build) {
  const p = 'footer';
  const w = 1000;
  const h = 120;
  const heartbeat =
    'M 372 62 H 424 l 8 -17 l 10 34 l 8 -28 l 8 11 H 628';
  return panel({
    p,
    w,
    h,
    aria: `Yagyesh Vyas, AI/ML engineer. Profile build ${build.stamp}.`,
    body: false,
    glow: false,
    children: `
      <text x="56" y="58" class="r${p}" font-size="27" font-style="italic" fill="${C.text}">Yagyesh Vyas</text>
      <text x="57" y="82" class="m${p}" font-size="8" letter-spacing="1.8" fill="${C.faint}">AI / ML ENGINEER · RICHMOND, VA</text>
      <path d="${heartbeat}" fill="none" stroke="${C.line2}" stroke-width="1"/>
      <path class="mo" d="${heartbeat}" fill="none" stroke="${C.mint}" stroke-width="1.2" stroke-opacity="0.55" stroke-dasharray="4 8">
        <animate attributeName="stroke-dashoffset" from="0" to="-96" dur="4s" repeatCount="indefinite"/>
      </path>
      <g class="mo" opacity="0">
        <circle r="5" fill="${C.mint}" opacity="0.15"/><circle r="1.7" fill="#E7FFF9"/>
        <animateMotion dur="6s" repeatCount="indefinite" path="${heartbeat}"/>
      </g>
      <text x="944" y="52" class="m${p}" font-size="8" letter-spacing="1.6" fill="${C.muted}" text-anchor="end">PROFILE v${esc(build.version.slice(0, 6))}</text>
      <text x="944" y="70" class="m${p}" font-size="8" letter-spacing="1.6" fill="${C.faint}" text-anchor="end">NO TEMPLATES · EVERY PIXEL SVG</text>
      <text x="944" y="88" class="m${p}" font-size="8" letter-spacing="1.6" fill="${C.faint}" text-anchor="end">GENERATED ${esc(build.stamp)}</text>`,
  });
}
