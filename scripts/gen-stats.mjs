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
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar { totalContributions }
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
    `r${i}: repository(name: "${n}") { name description stargazerCount forkCount primaryLanguage { name color } }`
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
  const desc = esc((r.description || '').length > 62 ? r.description.slice(0, 59) + '…' : r.description || '');
  const lang = r.primaryLanguage;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 110" width="440" height="110" role="img" aria-label="${esc(r.name)}">
  <style>${reducedMotion}
    .bd { animation: bp 4s ease-in-out infinite; animation-delay: ${(i * 0.7).toFixed(1)}s; }
    @keyframes bp { 0%,100% { stroke-opacity: .4; } 50% { stroke-opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .bd { animation: none; } }
  </style>
  <rect width="440" height="110" rx="14" fill="${C.bg}"/>
  <rect width="440" height="110" rx="14" fill="none" class="bd" stroke="${accent}" stroke-width="1.5"/>
  <rect x="0" y="0" width="4" height="110" rx="2" fill="${accent}"/>
  <text x="26" y="34" font-family="${MONO}" font-size="15" font-weight="700" fill="${C.text}">${esc(r.name)}</text>
  <text x="26" y="58" font-family="${SANS}" font-size="12" fill="${C.sub}">${desc}</text>
  ${lang ? `<circle cx="32" cy="84" r="5" fill="${lang.color || C.muted}"/>
  <text x="44" y="88" font-family="${MONO}" font-size="11" fill="${C.muted}">${esc(lang.name)}</text>` : ''}
  <text x="330" y="88" font-family="${MONO}" font-size="11" fill="${C.amber}">★ ${fmt(r.stargazerCount)}</text>
  <text x="384" y="88" font-family="${MONO}" font-size="11" fill="${C.violet}">⑂ ${fmt(r.forkCount)}</text>
</svg>`;
  writeFileSync(join(OUT, `repo-${i}.svg`), svg);
});

console.log(`Generated: stats.svg, langs.svg, ${featured.length} repo cards`);
