import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Pad } from './pad.js';

const root = fileURLToPath(new URL('.', import.meta.url));
export const pad = new Pad(process.env.PAD_STATE || root + 'state.json');

export function createServer(state = pad) {
  return http.createServer(async (req, res) => {
    const send = (code, data) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(root + 'index.html'));
    }
    if (req.method === 'GET' && url.pathname === '/api/state') return send(200, state.state);
    if (req.method === 'GET' && url.pathname === '/api/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write('data: ' + JSON.stringify(state.state) + '\n\n');
      const listener = current => res.write('data: ' + JSON.stringify(current) + '\n\n');
      state.on('state', listener);
      req.on('close', () => state.off('state', listener));
      return;
    }
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 4096) throw new Error('body too large');
      }
      const data = JSON.parse(body);
      const slot = /^\/api\/slots\/([0-2])$/.exec(url.pathname);
      if (req.method === 'POST' && slot) return send(200, state.tag(Number(slot[1]), data.tag));
      if (req.method === 'PUT' && url.pathname === '/api/led') return send(200, state.led(data.color, data.effect));
      return send(404, { error: 'not found' });
    } catch (error) { return send(400, { error: error.message }); }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT || 8080);
  createServer().listen(port, '127.0.0.1', () => console.log('Toy pad at http://127.0.0.1:' + port));
}

