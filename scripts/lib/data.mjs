// GitHub data with no secrets required.
//
// - REST for profile + repositories (optional GITHUB_TOKEN raises rate limits).
// - The public contributions calendar is parsed from GitHub's own HTML fragment.
// - Results are cached for six hours so repeated local builds are instant.
//
// `node scripts/build.mjs --refresh` forces a network read.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANG_COLOR } from './theme.mjs';
import { USER } from './content.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE_FILE = join(ROOT, '.cache', 'github.json');
const UA = 'yagyesh-profile-builder (+https://github.com/yagyeshVyas)';
const CACHE_MS = 6 * 60 * 60 * 1000;

async function getJson(url) {
  const headers = { 'User-Agent': UA, Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.json();
}

async function getText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.text();
}

function parseContributions(html) {
  const rows = [];
  for (const m of html.matchAll(/<td\b[^>]*>/g)) {
    const tag = m[0];
    if (!/ContributionCalendar-day/.test(tag)) continue;
    const date = tag.match(/data-date="([0-9]{4}-[0-9]{2}-[0-9]{2})"/)?.[1];
    const id = tag.match(/id="([^"]+)"/)?.[1];
    if (date && id) rows.push({ date, id });
  }
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const text = m[2].trim();
    const n = text.match(/^(\d+)\s+contribution/);
    if (n) counts.set(m[1], Number(n[1]));
    else if (/^No contributions/.test(text)) counts.set(m[1], 0);
  }
  const days = rows
    .filter((r) => counts.has(r.id))
    .map((r) => ({ date: r.date, count: counts.get(r.id) }));
  if (days.length < 300) throw new Error(`contribution calendar incomplete (${days.length} days)`);
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

function quantile(sorted, q) {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}

function buildCalendar(rawDays, today) {
  const days = [...rawDays].sort((a, b) => a.date.localeCompare(b.date));
  const first = new Date(days[0].date + 'T00:00:00Z');
  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const byDate = new Map(days.map((d) => [d.date, d]));
  const lastDate = new Date(days[days.length - 1].date + 'T00:00:00Z');
  const cols = Math.ceil(((lastDate - start) / 86400000 + 1) / 7);
  const grid = Array.from({ length: cols }, () => Array(7).fill(null));
  for (const d of days) {
    const dt = new Date(d.date + 'T00:00:00Z');
    const col = Math.floor((dt - start) / 86400000 / 7);
    const row = dt.getUTCDay();
    if (grid[col] && row >= 0) grid[col][row] = d;
  }

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const months = [];
  let lastMonth = -1;
  grid.forEach((colDays, col) => {
    const anchor = colDays.find((d) => d && new Date(d.date + 'T00:00:00Z').getUTCDate() <= 7);
    if (!anchor) return;
    const month = new Date(anchor.date + 'T00:00:00Z').getUTCMonth();
    if (month !== lastMonth) {
      months.push({ col, label: monthNames[month] });
      lastMonth = month;
    }
  });

  const past = days.filter((d) => d.date <= today);
  const active = past.filter((d) => d.count > 0).map((d) => d.count).sort((a, b) => a - b);
  const t1 = quantile(active, 0.25);
  const t2 = quantile(active, 0.5);
  const t3 = quantile(active, 0.75);
  const level = (n) => (n === 0 ? 0 : n <= t1 ? 1 : n <= t2 ? 2 : n <= t3 ? 3 : 4);

  let current = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    if (!past[i].count) {
      if (past[i].date === today) continue;
      break;
    }
    current++;
  }
  let longest = 0;
  let run = 0;
  for (const d of past) {
    if (d.count > 0) {
      run++;
      if (run > longest) longest = run;
    } else run = 0;
  }

  const best = past.reduce((a, b) => (b.count > a.count ? b : a), { date: today, count: 0 });
  return {
    days,
    grid,
    months,
    total: past.reduce((a, d) => a + d.count, 0),
    activeDays: active.length,
    currentStreak: current,
    longestStreak: longest,
    bestDay: best,
    level,
    year: Number(days[0].date.slice(0, 4)),
  };
}

async function fetchFresh(today) {
  const [user, repos] = await Promise.all([
    getJson(`https://api.github.com/users/${USER}`),
    getJson(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`),
  ]);

  const publicRepos = repos
    .filter((r) => !r.fork && !r.archived && !r.private && r.visibility !== 'private')
    .map((r) => ({
      name: r.name,
      description: r.description || '',
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      topics: r.topics || [],
      license: r.license?.spdx_id && r.license.spdx_id !== 'NOASSERTION' ? r.license.spdx_id : '',
      createdAt: r.created_at,
      pushedAt: r.pushed_at,
      url: r.html_url,
      homepage: r.homepage || '',
    }))
    .sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));

  const languages = [];
  for (const repo of publicRepos) {
    try {
      const bytes = await getJson(`https://api.github.com/repos/${USER}/${repo.name}/languages`);
      languages.push({ name: repo.name, bytes });
    } catch {
      languages.push({ name: repo.name, bytes: {} });
    }
  }

  let rawDays = null;
  let contribError = null;
  try {
    const html = await getText(`https://github.com/users/${USER}/contributions`);
    rawDays = parseContributions(html);
  } catch (err) {
    contribError = String(err.message || err);
  }

  return {
    fetchedAt: new Date().toISOString(),
    user: {
      login: user.login,
      name: user.name,
      bio: user.bio,
      location: user.location,
      blog: user.blog,
      followers: user.followers,
      createdAt: user.created_at,
    },
    repos: publicRepos,
    languages,
    contributions: { rawDays, error: contribError },
    year: Number(today.slice(0, 4)),
  };
}

export async function loadData({ refresh = false } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  let cached = null;
  try {
    cached = JSON.parse(await readFile(CACHE_FILE, 'utf8'));
  } catch {
    /* first run */
  }

  const fresh = cached && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_MS;
  let raw = cached;
  let stale = false;
  if (refresh || !fresh) {
    try {
      raw = await fetchFresh(today);
      await mkdir(dirname(CACHE_FILE), { recursive: true });
      await writeFile(CACHE_FILE, JSON.stringify(raw, null, 2) + '\n');
    } catch (err) {
      if (!cached) {
        throw new Error(
          `Could not reach GitHub and no cache exists.\n${err.message}\nRun again with network access.`,
        );
      }
      console.warn(`! live fetch failed, using cached data: ${err.message}`);
      raw = cached;
      stale = true;
    }
  }

  if (!raw.contributions.rawDays) {
    throw new Error(
      `Contribution calendar unavailable${raw.contributions.error ? `: ${raw.contributions.error}` : ''}.`,
    );
  }
  if (stale) console.warn('! data may be stale');

  const calendar = buildCalendar(raw.contributions.rawDays, today);
  const stars = raw.repos.reduce((a, r) => a + r.stars, 0);
  const forks = raw.repos.reduce((a, r) => a + r.forks, 0);

  const bytes = new Map();
  for (const { bytes: b } of raw.languages)
    for (const [name, size] of Object.entries(b)) bytes.set(name, (bytes.get(name) || 0) + size);
  const langTotal = [...bytes.values()].reduce((a, b) => a + b, 0) || 1;
  const languages = [...bytes.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, size]) => ({
      name,
      bytes: size,
      pct: (size / langTotal) * 100,
      color: LANG_COLOR[name] || '#6C7C93',
    }));

  return {
    ...raw,
    stale,
    today,
    calendar,
    stats: {
      stars,
      forks,
      repos: raw.repos.length,
      followers: raw.user.followers,
      contributions: calendar.total,
      activeDays: calendar.activeDays,
      currentStreak: calendar.currentStreak,
      longestStreak: calendar.longestStreak,
      bestDay: calendar.bestDay,
      languages,
    },
  };
}
