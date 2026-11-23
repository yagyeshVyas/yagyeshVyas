// Builds every profile asset from live GitHub data.
//
//   npm run build            cached data (6h), generates assets + README + preview
//   npm run build -- --refresh   force a network read
//
// No dependencies. Node 20+.

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadData, ROOT } from './lib/data.mjs';
import { USER, FLAGSHIPS, LINKS, PORTFOLIO, CONSTELLATION_URL } from './lib/content.mjs';
import { esc, fmt } from './lib/theme.mjs';
import * as P from './lib/panels.mjs';
import { interactivePage } from './lib/interactive.mjs';

const refresh = process.argv.includes('--refresh');
const data = await loadData({ refresh });

const now = new Date();
const yyyy = now.getUTCFullYear();
const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
const dd = String(now.getUTCDate()).padStart(2, '0');
const hh = String(now.getUTCHours()).padStart(2, '0');
const mi = String(now.getUTCMinutes()).padStart(2, '0');
const build = {
  stamp: `${yyyy}.${mm}.${dd}`,
  version: `${yyyy}${mm}${dd}${hh}${mi}`,
  synced: `${yyyy}-${mm}-${dd} ${hh}:${mi} UTC`,
};

const flagships = FLAGSHIPS.map((name) => data.repos.find((r) => r.name === name)).filter(Boolean);
if (!flagships.length) throw new Error('No flagship repositories found.');

const files = {
  'hero.svg': P.hero(data, build),
  'ticker.svg': P.ticker(),
  'identity.svg': P.identity(),
  'telemetry.svg': P.telemetry(data, build),
  'constellation.svg': P.constellation(data),
  'toolbox.svg': P.toolbox(),
  'signal.svg': P.signal(data),
  'connect.svg': P.connectHeader(),
  'footer.svg': P.footer(build),
};
flagships.forEach((repo, i) => {
  files[`flagship-${repo.name.toLowerCase()}.svg`] = P.flagship(repo, i, flagships.length);
});
LINKS.forEach((link, i) => {
  files[`btn-${link.id}.svg`] = P.connectButton(link, i);
});

// A second, motion-free copy of every panel. GitHub picks it through
// <picture><source media="(prefers-reduced-motion: reduce)">, because a media
// query inside an SVG loaded as <img> is not evaluated in Chrome.
const staticCss = '<style>.mo{display:none!important}*{animation:none!important}</style>';
const statics = {};
for (const [name, svg] of Object.entries(files)) {
  if (!svg.includes('</title>')) throw new Error(`${name}: missing <title> for static variant`);
  statics[name.replace(/\.svg$/, '.static.svg')] = svg.replace('</title>', `</title>${staticCss}`);
}

await mkdir(join(ROOT, 'assets'), { recursive: true });
for (const [name, svg] of Object.entries({ ...files, ...statics })) {
  await writeFile(join(ROOT, 'assets', name), svg);
}

// GitHub Pages serves /docs. The page is self-contained: no external fonts,
// scripts or images, so it works offline and loads in one request.
await mkdir(join(ROOT, 'docs'), { recursive: true });
await writeFile(join(ROOT, 'docs', 'index.html'), interactivePage(data, build));
await writeFile(join(ROOT, 'docs', '.nojekyll'), '');

const v = build.version;
const asset = (name) => `./assets/${name}?v=${v}`;
const staticName = (name) => name.replace(/\.svg$/, '.static.svg');
const center = (html) => `<p align="center">${html}</p>`;

const pic = (name, alt, width = '100%') =>
  `<picture><source media="(prefers-reduced-motion: reduce)" srcset="${asset(staticName(name))}" type="image/svg+xml"><img src="${asset(name)}" width="${width}" alt="${esc(alt)}"></picture>`;
const deadPic = (name, alt, width = '100%') => `<a href="#_">${pic(name, alt, width)}</a>`;
const livePic = (href, name, alt, width = '100%') => `<a href="${href}">${pic(name, alt, width)}</a>`;

const repoLinks = data.repos.map((r) => `<a href="${r.url}">${esc(r.name)}</a> ★${fmt(r.stars)}`);
const repoMid = Math.ceil(repoLinks.length / 2);
const repoIndex = center(
  `<sub>${repoLinks.slice(0, repoMid).join(' · ')}<br>${repoLinks.slice(repoMid).join(' · ')}<br><a href="https://github.com/${USER}?tab=repositories">all repos ↗</a> · <a href="${PORTFOLIO}">portfolio ↗</a></sub>`,
);

const blocks = [
  center(
    deadPic('hero.svg', 'Yagyesh Vyas — AI/ML engineer. Fine-tuning LLMs that run offline, shipping AI-security tools.'),
  ),
  center(deadPic('ticker.svg', 'Focus: LLM fine-tuning, RAG, LoRA, GGUF, local inference, AI security, MCP.')),
  center(deadPic('identity.svg', 'Identity: local intelligence, security as a feature, shipping the whole product.')),
  center(
    deadPic(
      'telemetry.svg',
      `GitHub telemetry: ${data.stats.stars} stars, ${data.stats.contributions} contributions, ${data.stats.repos} public repositories, ${data.stats.followers} followers.`,
    ),
  ),
  center(
    livePic(
      '__PAGE_HREF__',
      'constellation.svg',
      `Interactive constellation of all ${data.stats.repos} public repositories, sized by stars.`,
    ),
  ),
  center(
    `<sub><a href="__PAGE_HREF__">↗ open the interactive constellation</a> — hover, focus or tap a node</sub>`,
  ),
  repoIndex,
  `<p align="center">${flagships
    .map((repo) =>
      livePic(
        repo.url,
        `flagship-${repo.name.toLowerCase()}.svg`,
        `${repo.name} — ${repo.description || ''}`,
        '49%',
      ),
    )
    .join(' ')}</p>`,
  center(deadPic('toolbox.svg', 'Toolbox: AI/ML, engineering, security and mobile/web tools.')),
  center(deadPic('signal.svg', 'Recently pushed public repositories.')),
  center(deadPic('connect.svg', 'Connect.')),
  `<p align="center">${LINKS.map((link) =>
    livePic(link.href, `btn-${link.id}.svg`, `${link.label}: ${link.handle}`, '31%'),
  ).join(' ')}</p>`,
  center(deadPic('footer.svg', 'Yagyesh Vyas — profile built by hand, generated from live GitHub data.')),
];

const blocksHtml = blocks.join('\n\n');
const readme = `<!-- Generated by scripts/build.mjs from live GitHub data. -->
<!-- Edit scripts/lib/ for copy and layout, not this file. -->

${blocksHtml.replaceAll('__PAGE_HREF__', CONSTELLATION_URL)}
`;
await writeFile(join(ROOT, 'README.md'), readme);

// ---------------------------------------------------------------- local preview
const preview = `<!doctype html>
<html lang="en" data-theme="dark" data-width="980">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Local preview — yagyeshVyas</title>
<style>
  :root { --content: 980px; }
  * { box-sizing: border-box; }
  html[data-theme="dark"] {
    --bg: #0d1117; --panel: #161b22; --fg: #e6edf3; --muted: #8b949e;
    --line: #30363d; --link: #58a6ff; --pill: #238636;
  }
  html[data-theme="light"] {
    --bg: #ffffff; --panel: #f6f8fa; --fg: #1f2328; --muted: #636c76;
    --line: #d0d7de; --link: #0969da; --pill: #1f883d;
  }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
  header { border-bottom: 1px solid var(--line); background: var(--panel); }
  .bar { max-width: var(--content); margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .crumb { color: var(--link); text-decoration: none; }
  .slash { color: var(--muted); }
  .name { font-weight: 600; }
  .pill { border: 1px solid var(--line); color: var(--muted); border-radius: 999px; padding: 1px 9px; font-size: 11px; }
  .toolbar { margin-left: auto; display: flex; gap: 6px; }
  .toolbar button { background: transparent; color: var(--muted); border: 1px solid var(--line); border-radius: 6px; padding: 4px 9px; font: 11px/1.2 ui-monospace, Consolas, monospace; cursor: pointer; }
  .toolbar button:hover { color: var(--fg); border-color: var(--muted); }
  .note { max-width: var(--content); margin: 18px auto 0; padding: 0 24px; color: var(--muted); font-size: 12px; display: flex; gap: 8px; align-items: center; }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: #3fb950; }
  main { max-width: var(--content); margin: 0 auto; padding: 24px 24px 96px; }
  main p { margin: 0 0 16px; text-align: center; }
  main a { text-decoration: none; }
  main img { max-width: 100%; height: auto; vertical-align: middle; border: 0; }
  main sub { font-size: 12px; color: var(--muted); line-height: 2; }
  main sub a { color: var(--link); }
  img.broken { outline: 2px solid #f85149; outline-offset: 2px; }
  html[data-width="1200"] { --content: 1200px; }
  @media (max-width: 700px) { .toolbar { display: none; } main { padding: 16px 12px 64px; } }
</style>
</head>
<body>
<header>
  <div class="bar">
    <a class="crumb" href="https://github.com/${USER}">${USER}</a>
    <span class="slash">/</span>
    <a class="crumb" href="https://github.com/${USER}/${USER}"><span class="name">${USER}</span></a>
    <span class="pill">Public</span>
    <div class="toolbar">
      <button data-theme="dark">DARK</button>
      <button data-theme="light">LIGHT</button>
      <button data-width="980">980</button>
      <button data-width="1200">1200</button>
    </div>
  </div>
</header>
<div class="note"><span class="dot"></span> Local preview only · generated ${esc(build.synced)} · not committed to the profile</div>
<main id="readme">
${blocksHtml.replaceAll('__PAGE_HREF__', './docs/index.html')}
</main>
<script>
  for (const btn of document.querySelectorAll('.toolbar button[data-theme]')) {
    btn.addEventListener('click', () => { document.documentElement.dataset.theme = btn.dataset.theme; });
  }
  for (const btn of document.querySelectorAll('.toolbar button[data-width]')) {
    btn.addEventListener('click', () => { document.documentElement.dataset.width = btn.dataset.width; });
  }
  for (const img of document.querySelectorAll('img')) {
    img.addEventListener('error', () => img.classList.add('broken'));
  }
</script>
</body>
</html>
`;
await writeFile(join(ROOT, 'preview.html'), preview);

console.log(
  `built ${Object.keys(files).length} animated panels + ${Object.keys(statics).length} static twins + README.md + docs/index.html + preview.html`,
);
console.log(
  `${data.stats.repos} repos · ${data.stats.stars} stars · ${data.stats.contributions} contributions · ${data.stats.languages
    .slice(0, 3)
    .map((l) => `${l.name} ${Math.round(l.pct)}%`)
    .join(' / ')}`,
);
console.log(`data ${data.stale ? 'STALE CACHE' : 'fresh'} · ${data.fetchedAt}`);
