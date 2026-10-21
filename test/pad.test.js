import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Pad } from '../pad.js';
import { createServer } from '../server.js';

test('persistence, validation, and API', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pad-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'state.json');
  const pad = new Pad(file);
  assert.throws(() => pad.tag(3, 'bad'));
  pad.tag(0, 'TAG_01');
  pad.led('#ff0000', 'pulse');
  assert.equal(new Pad(file).state.slots[0], 'TAG_01');
  const server = createServer(pad).listen(0, '127.0.0.1');
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const response = await fetch(base + '/api/slots/1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tag: 'ABC' }) });
  assert.equal(response.status, 200);
  assert.equal((await (await fetch(base + '/api/state')).json()).slots[1], 'ABC');
  assert.equal((await fetch(base + '/api/slots/2', { method: 'POST', body: '{"tag":"bad value"}' })).status, 400);
});

