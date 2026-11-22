import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.argv.includes('--dist') ? 'dist' : '.');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(root + sep) || !types[extname(file)]) throw Error('Not found');
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type':types[extname(file)], 'Cache-Control':'no-store' }).end(bytes);
  } catch {
    res.writeHead(404, { 'Content-Type':'text/plain' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`LGM Hub preview: http://127.0.0.1:${port}/`));
