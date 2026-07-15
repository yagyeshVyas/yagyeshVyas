// Generates self-hosted, aurora-themed GitHub stat cards from the GraphQL API.
// Replaces github-readme-stats.vercel.app (deployment paused / dead).
// Outputs: assets/stats.svg, assets/langs.svg, assets/repo-{0..3}.svg
// Env: GITHUB_TOKEN (repo-read is enough; Actions' default token works).

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const USER = 'yagyeshVyas';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) { console.error('GITHUB_TOKEN missing'); process.exit(1); }

const C = {
  bg: '#0b0f1e', border: '#1b2340', panel: '#0b1224',
  cyan: '#22d3ee', violet: '#a78bfa', pink: '#f472b6',
  amber: '#fbbf24', green: '#34d399',
  text: '#e2e8f0', sub: '#94a3b8', muted: '#64748b', faint: '#475569',
};
// Single quotes only — these land inside double-quoted XML attributes.
const MONO = "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";
const SANS = "'Segoe UI', Inter, ui-sans-serif, system-ui, sans-serif";

const query = `query($login: String!) {
  user(login: $login) {
    name
    followers { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
      totalCount
      nodes {
        stargazerCount
        forkCount
        languages(first: 8, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
      }
    }
    pinnedItems(first: 4, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name description stargazerCount forkCount
          primaryLanguage { name color }
          repositoryTopics(first: 3) { nodes { topic { name } } }
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionCount date } }
      }
    }
  }
}`;

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { login: USER } }),
});
if (!res.ok) { console.error('GraphQL HTTP', res.status, await res.text()); process.exit(1); }
const { data, errors } = await res.json();
if (errors) { console.error('GraphQL errors:', JSON.stringify(errors)); process.exit(1); }
const u = data.user;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n));

const reducedMotion = `@media (prefers-reduced-motion: reduce) {
  animate, animateTransform { display: none !important; }
  * { opacity: 1 !important; }
}`;

const stars = u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0);
const forks = u.repositories.nodes.reduce((a, r) => a + r.forkCount, 0);
const cc = u.contributionsCollection;

// ---------------------------------------------------------------- stats.svg
{
  const rows = [
    { icon: '★', label: 'Total stars',   value: fmt(stars),                           color: C.amber },
    { icon: '⧉', label: 'Commits (1y)',  value: fmt(cc.totalCommitContributions),      color: C.cyan },
    { icon: '⇄', label: 'Pull requests', value: fmt(cc.totalPullRequestContributions), color: C.violet },
    { icon: '◎', label: 'Issues',        value: fmt(cc.totalIssueContributions),       color: C.pink },
    { icon: '⑂', label: 'Forked',        value: fmt(forks),                            color: C.green },
  ];
  const rowSvg = rows.map((r, i) => `
  <g opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="${(0.2 + i * 0.15).toFixed(2)}s" fill="freeze"/>
    <text x="26" y="${86 + i * 24}" font-family="${MONO}" font-size="13" fill="${r.color}">${r.icon}</text>
    <text x="48" y="${86 + i * 24}" font-family="${SANS}" font-size="13" fill="${C.sub}">${r.label}</text>
    <text x="238" y="${86 + i * 24}" font-family="${MONO}" font-size="13" font-weight="700" fill="${C.text}" text-anchor="end">${r.value}</text>
  </g>`).join('');

  const circ = (2 * Math.PI * 54).toFixed(1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 195" width="440" height="195" role="img" aria-label="GitHub stats">
  <style>${reducedMotion}</style>
  <defs>
    <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.cyan}"/><stop offset="50%" stop-color="${C.violet}"/><stop offset="100%" stop-color="${C.pink}"/>
    </linearGradient>
    <linearGradient id="hgS" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="50%" stop-color="${C.violet}"/><stop offset="100%" stop-color="${C.pink}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="440" height="195" rx="14" fill="${C.bg}"/>
  <rect width="440" height="195" rx="14" fill="none" stroke="${C.border}" stroke-width="1.5"/>
  <text x="26" y="38" font-family="${MONO}" font-size="13" fill="${C.cyan}" font-weight="600" letter-spacing="2">GITHUB STATS</text>
  <rect x="26" y="50" width="388" height="1.5" fill="url(#hgS)" opacity="0.5"/>
  ${rowSvg}
  <g transform="translate(345,124)">
    <circle r="54" fill="none" stroke="${C.border}" stroke-width="7"/>
    <circle r="54" fill="none" stroke="url(#ringG)" stroke-width="7" stroke-linecap="round"
      stroke-dasharray="${circ}" stroke-dashoffset="${circ}" transform="rotate(-90)">
      <animate attributeName="stroke-dashoffset" values="${circ};${(circ * 0.08).toFixed(1)}" dur="1.8s" begin="0.4s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1"/>
    </circle>
    <text y="-2" font-family="${MONO}" font-size="24" font-weight="800" fill="${C.text}" text-anchor="middle" opacity="0">${fmt(cc.contributionCalendar.totalContributions)}<animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.9s" fill="freeze"/></text>
    <text y="18" font-family="${SANS}" font-size="10" fill="${C.muted}" text-anchor="middle" opacity="0">contributions/yr<animate attributeName="opacity" values="0;1" dur="0.6s" begin="1.1s" fill="freeze"/></text>
  </g>
</svg>`;
  writeFileSync(join(OUT, 'stats.svg'), svg);
}

// ---------------------------------------------------------------- langs.svg
{
  const bytes = new Map();
  for (const repo of u.repositories.nodes)
    for (const e of repo.languages.edges) {
      const cur = bytes.get(e.node.name) || { size: 0, color: e.node.color || C.muted };
      cur.size += e.size;
      bytes.set(e.node.name, cur);
    }
  const top = [...bytes.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 6);
  const total = top.reduce((a, [, v]) => a + v.size, 0) || 1;

  const bars = top.map(([name, v], i) => {
    const pct = (v.size / total) * 100;
    const w = Math.max(6, (pct / 100) * 300);
    const y = 70 + i * 21;
    return `
  <g opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.4s" begin="${(0.2 + i * 0.12).toFixed(2)}s" fill="freeze"/>
    <circle cx="32" cy="${y - 4}" r="4" fill="${v.color}"/>
    <text x="44" y="${y}" font-family="${SANS}" font-size="12" fill="${C.text}">${esc(name)}</text>
    <text x="414" y="${y}" font-family="${MONO}" font-size="11" fill="${C.muted}" text-anchor="end">${pct.toFixed(1)}%</text>
    <rect x="152" y="${y - 10}" width="212" height="8" rx="4" fill="${C.panel}"/>
    <rect x="152" y="${y - 10}" width="0" height="8" rx="4" fill="${v.color}">
      <animate attributeName="width" values="0;${((pct / 100) * 212).toFixed(1)}" dur="1s" begin="${(0.3 + i * 0.12).toFixed(2)}s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1"/>
    </rect>
  </g>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 195" width="440" height="195" role="img" aria-label="Most used languages">
  <style>${reducedMotion}</style>
  <defs>
    <linearGradient id="hgL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="50%" stop-color="${C.violet}"/><stop offset="100%" stop-color="${C.pink}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="440" height="195" rx="14" fill="${C.bg}"/>
  <rect width="440" height="195" rx="14" fill="none" stroke="${C.border}" stroke-width="1.5"/>
  <text x="26" y="38" font-family="${MONO}" font-size="13" fill="${C.violet}" font-weight="600" letter-spacing="2">LANGUAGES</text>
  <rect x="26" y="50" width="388" height="1.5" fill="url(#hgL)" opacity="0.5"/>
  ${bars}
</svg>`;
  writeFileSync(join(OUT, 'langs.svg'), svg);
}

// ---------------------------------------------------------------- repo-N.svg
// Pinned items preferred; fall back to featured repos when nothing is pinned.
let featured = u.pinnedItems.nodes;
if (featured.length === 0) {
  const names = ['personalforge', 'VibeGuard', 'AI-Career-Suite', 'linkedin-scraper'];
  const rq = `query { user(login: "${USER}") { ${names.map((n, i) =>
    `r${i}: repository(name: "${n}") { name description stargazerCount forkCount primaryLanguage { name color } repositoryTopics(first: 3) { nodes { topic { name } } } }`
  ).join(' ')} } }`;
  const r2 = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: rq }),
  });
  const j2 = await r2.json();
  featured = Object.values(j2.data?.user || {}).filter(Boolean);
}

featured.forEach((r, i) => {
  const accent = [C.cyan, C.violet, C.pink, C.amber][i % 4];
  const accentDim = [C.cyan, C.violet, C.pink, C.amber][i % 4];
  const fullDesc = esc(r.description || 'No description');
  const lang = r.primaryLanguage;
  const topics = (r.repositoryTopics?.nodes || []).slice(0, 3).map(t => esc(t.topic.name));
  const stars = fmt(r.stargazerCount);
  const forks = fmt(r.forkCount);
  const topicTags = topics.map((t, ti) =>
    `<rect x="${20 + ti * 72}" y="80" width="64" height="17" rx="8" fill="#0b0f1e" stroke="${accent}" stroke-width="0.7" stroke-opacity="0.4"/>`
    + `<text x="${52 + ti * 72}" y="92" class="mono" font-size="8" fill="${accent}" text-anchor="middle">${t}</text>`
  ).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 140" width="440" height="140" role="img" aria-label="${esc(r.name)}">
  <style>${reducedMotion}
    .bd${i} { animation: bp${i} 4s ease-in-out infinite; animation-delay: ${(i * 0.7).toFixed(1)}s; }
    @keyframes bp${i} { 0%,100% { stroke-opacity: .35; } 50% { stroke-opacity: .85; } }
    @media (prefers-reduced-motion: reduce) { .bd${i} { animation: none; } }
  </style>
  <defs>
    <linearGradient id="glow${i}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <rect width="440" height="140" rx="14" fill="${C.bg}"/>
  <rect width="440" height="140" rx="14" fill="none" class="bd${i}" stroke="${accent}" stroke-width="1.5"/>
  <!-- Accent bar -->
  <rect x="0" y="0" width="4" height="140" rx="2" fill="${accent}"/>
  <!-- Top shimmer -->
  <rect x="4" y="0" width="436" height="2" fill="url(#glow${i})"/>
  <!-- Repo icon + name -->
  <text x="20" y="32" font-size="16">📦</text>
  <text x="42" y="32" font-family="${MONO}" font-size="15" font-weight="700" fill="${C.text}">${esc(r.name)}</text>
  <!-- Visibility badge -->
  <rect x="400" y="18" width="22" height="14" rx="3" fill="${C.panel}" stroke="${C.border}" stroke-width="0.6"/>
  <text x="411" y="28" font-family="${MONO}" font-size="7" fill="${C.muted}" text-anchor="middle">pub</text>
  <!-- Description (full, no truncation) -->
  <text x="20" y="56" font-family="${SANS}" font-size="11.5" fill="${C.sub}">${fullDesc.length > 70 ? fullDesc.slice(0, 67) + '…' : fullDesc}</text>
  <!-- Topic tags -->
  ${topicTags}
  <!-- Bottom divider -->
  <line x1="20" y1="108" x2="420" y2="108" stroke="${C.border}" stroke-width="0.8"/>
  <!-- Footer: language + stats -->
  ${lang ? `<circle cx="28" cy="126" r="4" fill="${lang.color || C.muted}"/>
  <text x="38" y="130" font-family="${MONO}" font-size="10" fill="${C.muted}">${esc(lang.name)}</text>` : ''}
  <!-- Stars -->
  <text x="320" y="130" font-size="9">⭐</text>
  <text x="332" y="130" font-family="${MONO}" font-size="11" font-weight="600" fill="${C.amber}">${stars}</text>
  <!-- Forks -->
  <text x="370" y="130" font-size="9">⑂</text>
  <text x="382" y="130" font-family="${MONO}" font-size="11" font-weight="600" fill="${C.violet}">${forks}</text>
</svg>`;
  writeFileSync(join(OUT, `repo-${i}.svg`), svg);
});

// ---------------------------------------------------------------- streak.svg
{
  const days = cc.contributionCalendar.weeks.flatMap(w => w.contributionDays);
  days.sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date().toISOString().slice(0, 10);

  let longest = 0, longestStart = '', longestEnd = '', run = 0, runStart = '';
  for (const d of days) {
    if (d.contributionCount > 0) {
      if (run === 0) runStart = d.date;
      run++;
      if (run > longest) { longest = run; longestStart = runStart; longestEnd = d.date; }
    } else if (d.date <= today) {
      run = 0;
    }
  }
  // current streak: walk backwards from today (today may still be 0 — allowed)
  let current = 0, currentStart = '';
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].date > today) continue;
    if (days[i].contributionCount > 0) { current++; currentStart = days[i].date; }
    else if (days[i].date === today) continue; // today empty doesn't break streak yet
    else break;
  }
  const range = (a, b) => a && b ? `${a.slice(5).replace('-', '/')} – ${b.slice(5).replace('-', '/')}` : '—';
  const firstDay = days.find(d => d.contributionCount > 0)?.date || today;

  const circ = (2 * Math.PI * 56).toFixed(1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 195" width="440" height="195" role="img" aria-label="Contribution streak">
  <style>${reducedMotion}</style>
  <defs>
    <linearGradient id="strG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.violet}"/><stop offset="100%" stop-color="${C.pink}"/>
    </linearGradient>
    <linearGradient id="hgK" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="50%" stop-color="${C.violet}"/><stop offset="100%" stop-color="${C.pink}" stop-opacity="0"/>
    </linearGradient>
    <filter id="kglow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="440" height="195" rx="14" fill="${C.bg}"/>
  <rect width="440" height="195" rx="14" fill="none" stroke="${C.border}" stroke-width="1.5"/>
  <text x="26" y="38" font-family="${MONO}" font-size="13" fill="${C.pink}" font-weight="600" letter-spacing="2">STREAK</text>
  <rect x="26" y="50" width="388" height="1.5" fill="url(#hgK)" opacity="0.5"/>

  <!-- left: total -->
  <g text-anchor="middle" opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.3s" fill="freeze"/>
    <text x="82" y="112" font-family="${MONO}" font-size="26" font-weight="800" fill="${C.text}">${fmt(cc.contributionCalendar.totalContributions)}</text>
    <text x="82" y="134" font-family="${SANS}" font-size="11" fill="${C.sub}">Contributions</text>
    <text x="82" y="150" font-family="${MONO}" font-size="9" fill="${C.faint}">since ${firstDay.slice(5).replace('-', '/')}</text>
  </g>

  <!-- center: current streak ring -->
  <g transform="translate(220,118)">
    <circle r="56" fill="none" stroke="${C.border}" stroke-width="6"/>
    <circle r="56" fill="none" stroke="url(#strG)" stroke-width="6" stroke-linecap="round"
      stroke-dasharray="${circ}" stroke-dashoffset="${circ}" transform="rotate(-90)">
      <animate attributeName="stroke-dashoffset" values="${circ};${(circ * 0.06).toFixed(1)}" dur="1.6s" begin="0.2s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1"/>
    </circle>
    <circle r="62" fill="none" stroke="${C.pink}" stroke-width="1" stroke-dasharray="2 10" opacity="0.5">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="16s" repeatCount="indefinite"/>
    </circle>
    <text y="-2" font-family="${MONO}" font-size="34" font-weight="800" fill="${C.text}" text-anchor="middle" opacity="0">${current}
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.8s" fill="freeze"/>
    </text>
    <text y="20" font-family="${SANS}" font-size="11" fill="${C.pink}" text-anchor="middle" font-weight="600" opacity="0">day streak
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="1s" fill="freeze"/>
    </text>
    <text y="38" font-family="${MONO}" font-size="9" fill="${C.faint}" text-anchor="middle" opacity="0">${range(currentStart, today)}
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="1.1s" fill="freeze"/>
    </text>
  </g>

  <!-- right: longest -->
  <g text-anchor="middle" opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.5s" fill="freeze"/>
    <text x="358" y="112" font-family="${MONO}" font-size="26" font-weight="800" fill="${C.text}">${longest}</text>
    <text x="358" y="134" font-family="${SANS}" font-size="11" fill="${C.sub}">Longest streak</text>
    <text x="358" y="150" font-family="${MONO}" font-size="9" fill="${C.faint}">${range(longestStart, longestEnd)}</text>
  </g>
</svg>`;
  writeFileSync(join(OUT, 'streak.svg'), svg);
}

// ---------------------------------------------------------------- section banners
const banners = [
  ['stats',   'OVERVIEW',     C.cyan,   'live metrics, refreshed daily'],
  ['lab',     'ABOUT',        C.violet, 'who I am and what drives me'],
  ['arsenal', 'CAPABILITIES', C.pink,   'what I actually ship'],
  ['builds',  'PROJECTS',     C.amber,  'selected work'],
  ['connect', 'WORK WITH ME', C.green,  'let\u2019s build something'],
];
for (const [slug, label, color, note] of banners) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 56" width="900" height="56" role="img" aria-label="${label}">
  <style>${reducedMotion}</style>
  <defs>
    <linearGradient id="sw" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <text x="18" y="36" font-family="${MONO}" font-size="18" font-weight="700" fill="${color}">&#9656;</text>
  <text x="40" y="36" font-family="${MONO}" font-size="16" font-weight="700" fill="${C.text}" letter-spacing="5">${label}</text>
  <rect x="${46 + label.length * 14}" y="24" width="10" height="15" fill="${color}">
    <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/>
  </rect>
  <text x="882" y="36" font-family="${MONO}" font-size="10" fill="${C.faint}" text-anchor="end">// ${note}</text>
  <line x1="18" y1="48" x2="882" y2="48" stroke="${C.border}" stroke-width="1"/>
  <rect x="18" y="47" width="220" height="2" rx="1" fill="url(#sw)">
    <animateTransform attributeName="transform" type="translate" values="-220,0; 900,0" dur="4.5s" repeatCount="indefinite"/>
  </rect>
</svg>`;
  writeFileSync(join(OUT, `section-${slug}.svg`), svg);
}

// ---------------------------------------------------------------- snake.svg
// Custom contribution snake: serpentine path over the real contribution grid,
// cells are "eaten" exactly as the head passes, everything regrows each loop.
{
  const weeks = cc.contributionCalendar.weeks.slice(-52);
  const counts = weeks.map(w => {
    const days = w.contributionDays.map(d => d.contributionCount);
    while (days.length < 7) days.push(0);
    return days;
  });
  const maxC = Math.max(1, ...counts.flat());
  const lvl = (n) => n === 0 ? 0 : Math.min(4, Math.ceil((n / maxC) * 4));
  const LEVELS = ['#101830', '#164e63', '#0e7490', '#22d3ee', '#a78bfa'];

  const pitch = 16, cell = 13, x0 = 34, y0 = 56;
  const cx = (w) => x0 + w * pitch + cell / 2;
  const cyd = (d) => y0 + d * pitch + cell / 2;

  // Serpentine path through cell centers + exact eat-time per cell
  const DUR = 26; // seconds per lap
  let d3 = `M${cx(0)},${cyd(0)}`;
  let len = 0;
  const eatAt = Array.from({ length: 52 }, () => new Array(7).fill(0));
  for (let w = 0; w < 52; w++) {
    const down = w % 2 === 0;
    for (let i = 0; i < 7; i++) {
      const row = down ? i : 6 - i;
      if (!(w === 0 && i === 0)) {
        if (i === 0) { d3 += ` L${cx(w)},${cyd(row)}`; len += pitch; }        // horizontal hop
        else { d3 += ` L${cx(w)},${cyd(row)}`; len += pitch; }                // vertical step
      }
      eatAt[w][row] = len;
    }
  }
  const totalLen = len;

  let grid = '';
  for (let w = 0; w < 52; w++)
    for (let d = 0; d < 7; d++) {
      const te = Math.min(0.9, eatAt[w][d] / totalLen);
      const t2 = Math.min(0.905, te + 0.005);
      grid += `<rect x="${x0 + w * pitch}" y="${y0 + d * pitch}" width="${cell}" height="${cell}" rx="3.5" fill="${LEVELS[lvl(counts[w][d])]}">`
        + `<animate attributeName="opacity" values="1;1;0.08;0.08;1" keyTimes="0;${te.toFixed(4)};${t2.toFixed(4)};0.94;1" dur="${DUR}s" repeatCount="indefinite"/>`
        + `</rect>\n`;
    }

  // Snake body: head + trailing segments (positive begin = lag behind head)
  const segs = [
    { r: 7.5, fill: '#f472b6', lag: 0,    glow: true },
    { r: 6.5, fill: '#e879ba', lag: 0.28, glow: false },
    { r: 5.5, fill: '#c084fc', lag: 0.56, glow: false },
    { r: 4.5, fill: '#a78bfa', lag: 0.84, glow: false },
    { r: 3.5, fill: '#818cf8', lag: 1.12, glow: false },
    { r: 2.5, fill: '#22d3ee', lag: 1.40, glow: false },
  ];
  // Negative begin = animation "started in the past": segment is on the path
  // from frame one, phase-shifted to trail the head by `lag` seconds.
  const body = segs.map(s =>
    `<circle r="${s.r}" fill="${s.fill}"${s.glow ? ' filter="url(#sg)"' : ''}>`
    + `<animateMotion dur="${DUR}s" begin="${(-(DUR - s.lag)).toFixed(2)}s" repeatCount="indefinite" path="${d3}"/>`
    + `</circle>`
  ).join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 200" width="900" height="200" role="img" aria-label="Contribution snake — eats a year of commits">
  <style>${reducedMotion}</style>
  <defs>
    <filter id="sg" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="shl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="50%" stop-color="${C.violet}"/><stop offset="100%" stop-color="${C.pink}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="900" height="200" rx="14" fill="${C.bg}"/>
  <rect width="900" height="200" rx="14" fill="none" stroke="${C.border}" stroke-width="1.5"/>
  <text x="24" y="32" font-family="${MONO}" font-size="12" fill="${C.pink}" font-weight="600" letter-spacing="3">CONTRIBUTIONS</text>
  <text x="160" y="32" font-family="${MONO}" font-size="10" fill="${C.faint}">last 12 months · ${fmt(cc.contributionCalendar.totalContributions)} total</text>
  <text x="746" y="32" font-family="${MONO}" font-size="9" fill="${C.faint}">less
    <tspan dx="5" fill="#101830">■</tspan><tspan dx="1" fill="#164e63">■</tspan><tspan dx="1" fill="#0e7490">■</tspan><tspan dx="1" fill="#22d3ee">■</tspan><tspan dx="1" fill="#a78bfa">■</tspan>
    <tspan dx="5">more</tspan>
  </text>
  <rect x="24" y="42" width="852" height="1.5" fill="url(#shl)" opacity="0.5"/>
${grid}
  ${body}
</svg>`;
  writeFileSync(join(OUT, 'snake.svg'), svg);
}

console.log(`Generated: stats.svg, langs.svg, ${featured.length} repo cards, ${banners.length} banners, daily.svg, snake.svg`);
