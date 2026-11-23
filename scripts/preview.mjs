// Serves the local preview and opens it. No dependencies.

import { createServer } from 'node:http';
import { access, readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT } from './lib/data.mjs';

const PORT = Number(process.env.PORT || 4173);

try {
  await access(join(ROOT, 'preview.html'));
} catch {
  console.error('preview.html is missing. Run `npm run build` first.');
  process.exit(1);
}
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.md': 'text/markdown; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    if (path === '/') path = '/preview.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT + sep)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other preview or run with PORT=4174.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}/`;
  console.log(`preview  ${url}`);
  console.log('ctrl+c to stop');
  if (process.argv.includes('--no-open') || process.env.NO_OPEN === '1') return;
  try {
    const cmd =
      process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
  } catch {
    /* open manually */
  }
});
