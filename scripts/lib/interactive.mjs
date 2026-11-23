// Generates the hosted, genuinely interactive constellation at /docs.
// The profile README cannot run pointer events inside an <img>, so every node
// on this page is a real link with hover details, keyboard focus and touch.

import { C, LANG_COLOR, esc, fmt } from './theme.mjs';
import { CONSTELLATION, CONSTELLATION_URL, FLAGSHIPS, REPO_COPY, USER } from './content.mjs';

const STAGE_W = 1000;
const STAGE_H = 620;
const CX = 500;
const CY = 300;

const accentFor = (name) => {
  if (name === FLAGSHIPS[0]) return C.mint;
  if (name === FLAGSHIPS[1]) return C.amber;
  return '#7D97BC';
};

function positionFor(repo, i) {
  const fixed = CONSTELLATION[repo.name];
  if (fixed) return { x: fixed.x, y: fixed.y + 38, side: fixed.side };
  const a = ((i * 137.5 + 40) * Math.PI) / 180;
  const rad = 220 + (i % 3) * 20;
  return {
    x: Math.max(100, Math.min(900, CX + Math.cos(a) * rad * 1.15)),
    y: Math.max(150, Math.min(500, CY + Math.sin(a) * rad * 0.62)),
    side: Math.cos(a) >= 0 ? 'right' : 'left',
  };
}

function labels(repo, pos, r, accent) {
  const y = pos.y + 4;
  const star = `★ ${repo.stars}`;
  if (pos.side === 'right') {
    return `
      <g class="label" aria-hidden="true">
        <text class="name" x="${(pos.x + r + 16).toFixed(1)}" y="${(y - 4).toFixed(1)}">${esc(repo.name)}</text>
        <text class="stars" x="${(pos.x + r + 16).toFixed(1)}" y="${(y + 11).toFixed(1)}">${star}</text>
      </g>`;
  }
  if (pos.side === 'left') {
    return `
      <g class="label" aria-hidden="true">
        <text class="name" x="${(pos.x - r - 16).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="end">${esc(repo.name)}</text>
        <text class="stars" x="${(pos.x - r - 16).toFixed(1)}" y="${(y + 11).toFixed(1)}" text-anchor="end">${star}</text>
      </g>`;
  }
  return `
    <g class="label" aria-hidden="true">
      <text class="name" x="${pos.x.toFixed(1)}" y="${(pos.y + r + 23).toFixed(1)}" text-anchor="middle">${esc(repo.name)}</text>
      <text class="stars" x="${pos.x.toFixed(1)}" y="${(pos.y + r + 37).toFixed(1)}" text-anchor="middle">${star}</text>
    </g>`;
}

export function interactivePage(data, build) {
  const profile = data.repos.find((r) => r.name === USER) || {
    name: USER,
    url: `https://github.com/${USER}/${USER}`,
    stars: 0,
    forks: 0,
    language: '',
    license: '',
    description: '',
  };
  const satellites = data.repos.filter((r) => r.name !== USER);
  const totalStars = data.stats.stars;
  const totalForks = data.stats.forks;

  const payload = {};
  data.repos.forEach((r, i) => {
    const copy = REPO_COPY[r.name] || {};
    const lang = r.language || '';
    payload[r.name] = {
      name: r.name,
      url: r.url,
      stars: r.stars,
      forks: r.forks,
      language: lang,
      langColor: LANG_COLOR[lang] || C.muted,
      license: r.license || 'OPEN SOURCE',
      blurb: copy.blurb || r.description || 'No description.',
      short: copy.short || r.description || 'No description.',
      order: i + 1,
      accent: accentFor(r.name),
    };
  });

  const json = JSON.stringify(payload).replace(/</g, '\\u003c');

  const nodes = satellites
    .map((repo, i) => {
      const pos = positionFor(repo, i);
      const r = Math.min(34, 7 + Math.sqrt(repo.stars) * 2.5);
      const hit = Math.max(46, r + 20);
      const accent = accentFor(repo.name);
      const hot = FLAGSHIPS.includes(repo.name);
      return `
      <a class="node" href="${esc(repo.url)}" target="_blank" rel="noopener" data-repo="${esc(repo.name)}"
         aria-label="${esc(repo.name)}, ${repo.stars} stars${repo.language ? `, ${esc(repo.language)}` : ''}. Open repository."
         style="color:${accent}">
        <circle class="hit" cx="${pos.x}" cy="${pos.y}" r="${hit}" fill="transparent" pointer-events="all"/>
        <circle class="halo" cx="${pos.x}" cy="${pos.y}" r="${r + 16}" fill="currentColor" opacity="0.06"/>
        ${hot ? `<circle class="pulse" cx="${pos.x}" cy="${pos.y}" r="${r}" fill="none" stroke="currentColor" stroke-width="1" style="animation-delay:${(i * 0.7).toFixed(1)}s"/>` : ''}
        <circle class="ring" cx="${pos.x}" cy="${pos.y}" r="${r}" fill="#081019" stroke="currentColor" stroke-width="${hot ? 1.6 : 1.1}"/>
        <circle cx="${pos.x}" cy="${pos.y}" r="${Math.max(2, r * 0.18)}" fill="currentColor"/>
        ${labels(repo, pos, r, accent)}
      </a>`;
    })
    .join('');

  let seed = 20261123;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let stars = '';
  for (let i = 0; i < 96; i++) {
    const x = 30 + rnd() * 940;
    const y = 24 + rnd() * 572;
    const r = (0.5 + rnd() * 1).toFixed(1);
    const twinkle = i % 11 === 0;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#CFE0FF" opacity="${(0.08 + rnd() * 0.24).toFixed(2)}"${twinkle ? ` class="twinkle" style="animation-delay:${(rnd() * 5).toFixed(1)}s"` : ''}/>`;
  }

  const edges = satellites
    .map((repo, i) => {
      const pos = positionFor(repo, i);
      const mx = (CX + pos.x) / 2;
      const my = (CY + pos.y) / 2 - (i % 2 ? 20 : -16);
      const hot = FLAGSHIPS.includes(repo.name) || repo.name === USER;
      return `<path class="edge${hot ? ' hot' : ''}" d="M ${CX} ${CY} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${pos.x} ${pos.y}" fill="none" stroke="${hot ? accentFor(repo.name) : C.line2}" stroke-width="${hot ? 1.1 : 0.8}" stroke-dasharray="2 7" opacity="${hot ? 0.6 : 0.5}"/>`;
    })
    .join('');

  const cards = data.repos
    .map((r, i) => {
      const copy = REPO_COPY[r.name] || {};
      const lang = r.language || '';
      const color = LANG_COLOR[lang] || C.muted;
      return `
      <a class="card" href="${esc(r.url)}" target="_blank" rel="noopener" data-repo="${esc(r.name)}" style="--a:${accentFor(r.name)}"
         aria-label="${esc(r.name)}, ${r.stars} stars. Open repository.">
        <div class="card-top">
          <span class="card-index">${String(i + 1).padStart(2, '0')}</span>
          <span class="card-name">${esc(r.name)}</span>
          <span class="card-stars">★ ${fmt(r.stars)}</span>
        </div>
        <p>${esc(copy.short || r.description || 'No description.')}</p>
        <div class="card-foot">
          ${lang ? `<span class="lang"><i style="background:${color}"></i>${esc(lang)}</span>` : ''}
          <span>${fmt(r.forks)} FORKS</span>
          <span class="card-open">OPEN ↗</span>
        </div>
      </a>`;
    })
    .join('');

  const location = data.user.location || 'Richmond, VA';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Repository Constellation — Yagyesh Vyas</title>
<meta name="description" content="An interactive constellation of Yagyesh Vyas's public GitHub repositories. Hover to inspect, click or tap to open.">
<meta name="theme-color" content="#05080D">
<meta property="og:title" content="Repository Constellation — Yagyesh Vyas">
<meta property="og:description" content="Hover to inspect, click or tap to open every public repository.">
<meta property="og:type" content="website">
<meta property="og:url" content="${CONSTELLATION_URL}">
<link rel="canonical" href="${CONSTELLATION_URL}">
<style>
  :root {
    color-scheme: dark;
    --bg: #05080d;
    --panel: #0a1019;
    --line: #182232;
    --line2: #28374d;
    --text: #e9eff8;
    --sub: #9ba9be;
    --muted: #6c7c93;
    --faint: #435268;
    --mint: #4ef0c0;
    --amber: #f5c778;
    --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    --sans: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    min-height: 100vh;
    background:
      radial-gradient(ellipse at 18% -8%, rgba(78, 240, 192, 0.08), transparent 44%),
      radial-gradient(ellipse at 92% 6%, rgba(245, 199, 120, 0.05), transparent 38%),
      var(--bg);
    color: var(--text);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; }
  .skip {
    position: absolute; left: -9999px; top: 0; z-index: 20;
    padding: 10px 14px; background: var(--mint); color: #04110d; font: 600 12px var(--mono);
  }
  .skip:focus { left: 12px; top: 12px; }
  .wrap { width: min(1240px, 100%); margin: 0 auto; padding: 0 28px 56px; }
  .top {
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
    padding: 20px 0; border-bottom: 1px solid var(--line);
    font: 10px var(--mono); letter-spacing: 1.7px; text-transform: uppercase;
    color: var(--muted);
  }
  .top .brand { color: var(--text); text-decoration: none; }
  .top .brand:hover { color: var(--mint); }
  .top .pill {
    border: 1px solid var(--line2); border-radius: 999px;
    padding: 4px 9px; color: var(--mint);
  }
  .top .right { margin-left: auto; }
  .hero { padding: 62px 0 36px; }
  .eyebrow {
    margin: 0 0 18px; color: var(--mint);
    font: 10.5px var(--mono); letter-spacing: 3.4px;
  }
  h1 {
    margin: 0 0 20px; font-size: clamp(42px, 6.2vw, 76px);
    font-weight: 800; line-height: 0.97; letter-spacing: -3.6px;
  }
  h1 span { color: var(--mint); }
  .lede {
    margin: 0; max-width: 640px; color: var(--sub);
    font-size: 16px; line-height: 1.65;
  }
  .lede b { color: var(--text); font-weight: 600; }
  .console {
    display: grid; grid-template-columns: minmax(0, 1fr) 306px;
    gap: 16px; align-items: start;
  }
  .stage-shell {
    border: 1px solid var(--line); border-radius: 20px; overflow: hidden;
    background: var(--panel); min-width: 0;
  }
  .stage-head {
    display: flex; justify-content: space-between; gap: 12px;
    padding: 13px 18px; border-bottom: 1px solid var(--line);
    font: 9px var(--mono); letter-spacing: 1.7px; color: var(--muted);
  }
  .stage-head .live { color: var(--mint); }
  .stage-wrap {
    position: relative; aspect-ratio: ${STAGE_W} / ${STAGE_H};
    background:
      radial-gradient(ellipse at 50% 42%, rgba(78, 240, 192, 0.055), transparent 58%),
      #060a10;
    overflow: hidden;
    touch-action: manipulation;
  }
  .stage-wrap::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background-image: radial-gradient(circle, #1b283a 1px, transparent 1px);
    background-size: 22px 22px; opacity: 0.52;
  }
  svg.stage { display: block; position: relative; z-index: 2; width: 100%; height: 100%; }
  .stage-hint {
    position: absolute; left: 18px; bottom: 14px; z-index: 3;
    font: 8.5px var(--mono); letter-spacing: 1.5px; color: var(--faint);
    pointer-events: none;
  }
  .node { cursor: pointer; outline: none; }
  .node .ring, .node .halo { transition: stroke-width 180ms ease, filter 180ms ease, opacity 180ms ease; }
  .node .halo { opacity: 0.06; }
  .node .label .name { fill: var(--text); font: 12px var(--mono); }
  .node .label .stars { fill: var(--amber); font: 9.5px var(--mono); letter-spacing: 0.4px; }
  .node:hover .ring, .node:focus-visible .ring {
    stroke-width: 2.8; filter: drop-shadow(0 0 8px currentColor);
  }
  .node:hover .halo, .node:focus-visible .halo { opacity: 0.17; }
  .node:hover .label .name, .node:focus-visible .label .name { fill: #ffffff; }
  .node:focus-visible .hit { stroke: var(--mint); stroke-width: 1; stroke-dasharray: 3 4; }
  .node .label { pointer-events: none; }
  .core .label .name { font-size: 11px; }
  .core .label .stars { font-size: 8.5px; }
  .core-yv { font-family: var(--mono); }
  .edge { animation: dash 9s linear infinite; }
  @keyframes dash { to { stroke-dashoffset: -72; } }
  .pulse {
    opacity: 0; transform-box: fill-box; transform-origin: center;
    animation: pulse 5.6s ease-out infinite;
  }
  @keyframes pulse {
    0% { opacity: 0.38; transform: scale(1); }
    75%, 100% { opacity: 0; transform: scale(1.72); }
  }
  .twinkle { animation: twinkle 4.5s ease-in-out infinite alternate; }
  @keyframes twinkle { from { opacity: 0.08; } to { opacity: 0.55; } }
  .cursor-ring {
    position: absolute; left: 0; top: 0; z-index: 4;
    width: 24px; height: 24px; margin: 0; border-radius: 50%;
    border: 1px solid rgba(78, 240, 192, 0.55);
    transform: translate(-50%, -50%);
    opacity: 0; pointer-events: none;
    transition: width 160ms ease, height 160ms ease, opacity 160ms ease, border-color 160ms ease;
  }
  .cursor-ring.visible { opacity: 1; }
  .cursor-ring.hot { width: 40px; height: 40px; border-color: rgba(245, 199, 120, 0.85); }
  .detail {
    border: 1px solid var(--line); border-radius: 20px;
    background: linear-gradient(180deg, #0b121d, #080d15);
    padding: 20px; position: sticky; top: 16px; min-height: 352px;
    display: flex; flex-direction: column;
  }
  .detail-head {
    display: flex; justify-content: space-between; gap: 10px;
    padding-bottom: 13px; border-bottom: 1px solid var(--line);
    font: 8.5px var(--mono); letter-spacing: 1.6px; color: var(--faint);
  }
  .detail h2 {
    margin: 18px 0 8px; font-size: 24px; line-height: 1.1;
    letter-spacing: -0.7px; font-weight: 700; word-break: break-word;
  }
  .detail p { margin: 0 0 18px; color: var(--sub); font-size: 12.5px; line-height: 1.6; }
  .d-stats {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    margin: auto 0 16px; padding-top: 14px; border-top: 1px solid var(--line);
  }
  .d-stats b { display: block; font: 700 19px var(--mono); letter-spacing: -0.5px; }
  .d-stats small { display: block; margin-top: 3px; font: 8px var(--mono); letter-spacing: 1.4px; color: var(--faint); }
  .d-lang {
    display: flex; align-items: center; gap: 8px;
    font: 9.5px var(--mono); color: var(--muted); letter-spacing: 0.5px;
    margin-bottom: 14px;
  }
  .d-lang i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex: none; }
  .open {
    display: none; align-items: center; justify-content: space-between;
    padding: 11px 13px; border: 1px solid var(--line2); border-radius: 10px;
    color: var(--mint); font: 9.5px var(--mono); letter-spacing: 1.2px;
    text-decoration: none;
  }
  .detail.selected .open { display: flex; border-color: rgba(78, 240, 192, 0.35); }
  .detail.selected .open:hover { background: rgba(78, 240, 192, 0.07); }
  .section-head {
    display: flex; justify-content: space-between; gap: 14px; align-items: baseline;
    margin: 52px 0 16px; padding-bottom: 12px; border-bottom: 1px solid var(--line);
    font: 10px var(--mono); letter-spacing: 2.2px; color: var(--muted);
  }
  .section-head h2 { margin: 0; font: 600 11px var(--mono); letter-spacing: 2.2px; color: var(--text); }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card {
    position: relative; display: flex; flex-direction: column; gap: 10px;
    padding: 17px 18px 15px; border: 1px solid var(--line); border-radius: 14px;
    background: #080d15; text-decoration: none;
    transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
  }
  .card::before {
    content: ''; position: absolute; left: 0; top: 16px; bottom: 16px;
    width: 2px; border-radius: 2px; background: var(--a); opacity: 0.65;
  }
  .card:hover, .card:focus-visible {
    border-color: var(--a); background: #0a111b; transform: translateY(-1px);
    outline: none;
  }
  .card-top { display: flex; align-items: baseline; gap: 10px; }
  .card-index { font: 8.5px var(--mono); color: var(--faint); }
  .card-name { font: 600 15px var(--mono); letter-spacing: -0.2px; }
  .card-stars { margin-left: auto; font: 10px var(--mono); color: var(--amber); }
  .card p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.5; }
  .card-foot {
    display: flex; align-items: center; gap: 14px; margin-top: auto;
    font: 8.5px var(--mono); letter-spacing: 0.8px; color: var(--faint);
  }
  .card .lang { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); }
  .card .lang i { width: 6px; height: 6px; border-radius: 50%; }
  .card-open { margin-left: auto; color: var(--a); }
  footer {
    display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
    margin-top: 42px; padding-top: 18px; border-top: 1px solid var(--line);
    font: 8.5px var(--mono); letter-spacing: 1.3px; color: var(--faint);
  }
  footer a { color: var(--muted); text-decoration: none; }
  footer a:hover { color: var(--mint); }
  :focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; }
  @media (max-width: 980px) {
    .console { grid-template-columns: 1fr; }
    .detail { position: static; min-height: 0; }
    .d-stats { margin-top: 12px; }
  }
  @media (max-width: 760px) {
    .wrap { padding: 0 16px 40px; }
    .hero { padding: 40px 0 26px; }
    h1 { letter-spacing: -2px; }
    .top .right { display: none; }
    .node .label { display: none; }
    .stage-hint { display: none; }
    .cards { grid-template-columns: 1fr; }
    .stage-wrap { aspect-ratio: ${STAGE_W} / ${STAGE_H}; }
    .detail { padding: 16px; }
  }
  @media (hover: none) {
    .cursor-ring { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .motion, .pulse, .twinkle { display: none !important; }
    .edge { animation: none; }
    .node .ring, .node .halo, .card, .cursor-ring { transition: none; }
    html { scroll-behavior: auto; }
  }
</style>
</head>
<body>
<a class="skip" href="#all">Skip to all repositories</a>
<div class="wrap">
  <header class="top">
    <a class="brand" href="https://github.com/${USER}">← ${USER}</a>
    <span class="pill">${data.stats.repos} PUBLIC REPOS</span>
    <span class="right">${esc(location)} · ★ ${fmt(totalStars)} · ${data.stats.contributions} CONTRIBUTIONS</span>
  </header>

  <section class="hero">
    <p class="eyebrow">REPOSITORY CONSTELLATION / INTERACTIVE</p>
    <h1>Every public repo,<br><span>one sky.</span></h1>
    <p class="lede">Hover a star to inspect it. <b>Click, tap or press Enter</b> to open the repository. The list below is keyboard and touch friendly too.</p>
  </section>

  <div class="console">
    <div class="stage-shell">
      <div class="stage-head">
        <span class="live">● LIVE MAP</span>
        <span>NODE AREA ∝ STARS · ${data.stats.repos} NODES</span>
      </div>
      <div class="stage-wrap" id="stage-wrap">
        <svg class="stage" viewBox="0 0 ${STAGE_W} ${STAGE_H}" role="group" aria-label="Interactive constellation of ${data.stats.repos} public repositories. Every node is a link.">
          <defs>
            <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="${C.mint}" stop-opacity="0.18"/>
              <stop offset="100%" stop-color="${C.mint}" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="core-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="${C.mint}"/>
              <stop offset="100%" stop-color="${C.amber}" stop-opacity="0.7"/>
            </linearGradient>
          </defs>
          <g aria-hidden="true">${stars}</g>
          <g transform="rotate(-8 ${CX} ${CY})" aria-hidden="true">
            <ellipse cx="${CX}" cy="${CY}" rx="342" ry="150" fill="none" stroke="${C.line2}" stroke-width="0.8" stroke-dasharray="2 9" opacity="0.6"/>
          </g>
          <g transform="rotate(6 ${CX} ${CY})" aria-hidden="true">
            <ellipse cx="${CX}" cy="${CY}" rx="220" ry="96" fill="none" stroke="${C.line2}" stroke-width="0.7" stroke-dasharray="1 7" opacity="0.5"/>
          </g>
          <g aria-hidden="true">${edges}</g>
          <g aria-hidden="true">
            <circle class="pulse" cx="${CX}" cy="${CY}" r="32" fill="none" stroke="${C.mint}" stroke-width="1" style="animation-delay:0.9s"/>
            <circle class="motion" cx="${CX}" cy="${CY}" r="36" fill="none" stroke="${C.mint}" stroke-width="0.9" stroke-dasharray="2 6" opacity="0.5">
              <animateTransform attributeName="transform" type="rotate" from="0 ${CX} ${CY}" to="360 ${CX} ${CY}" dur="32s" repeatCount="indefinite"/>
            </circle>
            <circle cx="${CX}" cy="${CY}" r="74" fill="url(#core-glow)"/>
          </g>
          <a class="node core" href="${esc(profile.url)}" target="_blank" rel="noopener" data-repo="${esc(profile.name)}"
             aria-label="yagyeshVyas profile repository. Open repository." style="color:${C.mint}">
            <circle class="hit" cx="${CX}" cy="${CY}" r="48" fill="transparent" pointer-events="all"/>
            <circle class="halo" cx="${CX}" cy="${CY}" r="48" fill="currentColor" opacity="0.06"/>
            <circle class="pulse" cx="${CX}" cy="${CY}" r="30" fill="none" stroke="currentColor" stroke-width="1" style="animation-delay:0.9s"/>
            <circle class="ring" cx="${CX}" cy="${CY}" r="30" fill="#081019" stroke="url(#core-ring)" stroke-width="1.6"/>
            <text class="core-yv" x="${CX}" y="${CY + 4}" fill="${C.mint}" font-size="10.5" font-weight="700" letter-spacing="1" text-anchor="middle">YV</text>
            <g class="label" aria-hidden="true">
              <text class="name" x="${CX}" y="${CY + 52}" text-anchor="middle">${esc(profile.name)}</text>
              <text class="stars" x="${CX}" y="${CY + 67}" text-anchor="middle">PROFILE · ★ ${profile.stars}</text>
            </g>
          </a>
          <g class="motion" opacity="0.9" aria-hidden="true">
            <circle r="8" fill="${C.mint}" opacity="0.12"/><circle r="2" fill="#E7FFF9"/>
            <animateMotion dur="28s" repeatCount="indefinite" path="M ${CX} ${CY - 150} A 342 150 0 1 1 ${CX - 0.1} ${CY - 150} A 342 150 0 1 1 ${CX} ${CY - 150}"/>
          </g>
          ${nodes}
        </svg>
        <span class="stage-hint">HOVER / TAP A STAR → OPEN THE REPO</span>
        <span class="cursor-ring" id="cursor-ring" aria-hidden="true"></span>
      </div>
    </div>

    <aside class="detail" id="detail" aria-live="polite">
      <div class="detail-head"><span>SELECTED NODE</span><span id="d-count">${String(data.stats.repos).padStart(2, '0')} REPOS</span></div>
      <h2 id="d-name">Pick a star.</h2>
      <p id="d-desc">Hover or focus a node for details. On touch, tap a node or use the list below.</p>
      <div class="d-stats">
        <span><b id="d-stars">★ ${fmt(totalStars)}</b><small>TOTAL STARS</small></span>
        <span><b id="d-forks">${fmt(totalForks)}</b><small>TOTAL FORKS</small></span>
      </div>
      <div class="d-lang"><i id="d-dot" style="background:${C.mint}"></i><span id="d-lang">${data.stats.repos} PUBLIC REPOSITORIES</span></div>
      <a class="open" id="d-open" href="#" target="_blank" rel="noopener" aria-hidden="true" tabindex="-1">OPEN REPOSITORY <span>↗</span></a>
    </aside>
  </div>

  <section id="all">
    <div class="section-head"><h2>ALL REPOSITORIES</h2><span>${String(data.stats.repos).padStart(2, '0')} PUBLIC · SORTED BY STARS</span></div>
    <div class="cards">${cards}</div>
  </section>

  <footer>
    <span>BUILT BY HAND · GENERATED ${esc(build.stamp)} · DATA FROM GITHUB</span>
    <span><a href="${CONSTELLATION_URL}">constellation ↗</a> &nbsp; <a href="https://github.com/${USER}">profile ↗</a></span>
  </footer>
</div>
<script>
(() => {
  const REPOS = ${json};
  const detail = document.getElementById('detail');
  const dName = document.getElementById('d-name');
  const dDesc = document.getElementById('d-desc');
  const dStars = document.getElementById('d-stars');
  const dForks = document.getElementById('d-forks');
  const dLang = document.getElementById('d-lang');
  const dDot = document.getElementById('d-dot');
  const dOpen = document.getElementById('d-open');
  const dCount = document.getElementById('d-count');
  const total = Object.keys(REPOS).length;

  function show(name) {
    const repo = REPOS[name];
    if (!repo) return;
    dName.textContent = repo.name;
    dDesc.textContent = repo.blurb;
    dStars.textContent = '★ ' + repo.stars;
    dForks.textContent = String(repo.forks);
    dLang.textContent = repo.language ? repo.language + ' · ' + repo.license : repo.license;
    dDot.style.background = repo.langColor;
    dOpen.href = repo.url;
    dOpen.setAttribute('aria-hidden', 'false');
    dOpen.setAttribute('tabindex', '0');
    dCount.textContent = 'NODE ' + String(repo.order).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    detail.classList.add('selected');
  }

  document.querySelectorAll('.node, .card').forEach((el) => {
    const name = el.getAttribute('data-repo');
    el.addEventListener('pointerenter', () => show(name));
    el.addEventListener('focus', () => show(name));
  });

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wrap = document.getElementById('stage-wrap');
  const ring = document.getElementById('cursor-ring');
  if (fine) {
    wrap.addEventListener('pointermove', (e) => {
      const box = wrap.getBoundingClientRect();
      ring.style.left = (e.clientX - box.left) + 'px';
      ring.style.top = (e.clientY - box.top) + 'px';
      ring.classList.add('visible');
    });
    wrap.addEventListener('pointerleave', () => ring.classList.remove('visible'));
    document.querySelectorAll('.node').forEach((node) => {
      node.addEventListener('pointerenter', () => ring.classList.add('hot'));
      node.addEventListener('pointerleave', () => ring.classList.remove('hot'));
    });
  }
})();
</script>
</body>
</html>
`;
}
