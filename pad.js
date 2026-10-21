import { EventEmitter } from 'node:events';
import fs from 'node:fs';

export class Pad extends EventEmitter {
  constructor(path) {
    super();
    this.path = path;
    this.state = { slots: [null, null, null], led: { color: '#ffffff', effect: 'solid' }, revision: 0 };
    if (fs.existsSync(path)) {
      const saved = JSON.parse(fs.readFileSync(path, 'utf8'));
      if (Array.isArray(saved.slots) && saved.slots.length === 3 && saved.led) this.state = saved;
    } else fs.writeFileSync(path, JSON.stringify(this.state, null, 2));
  }
  update(fn) {
    fn(this.state);
    this.state.revision += 1;
    fs.writeFileSync(this.path + '.tmp', JSON.stringify(this.state, null, 2));
    fs.renameSync(this.path + '.tmp', this.path);
    this.emit('state', structuredClone(this.state));
    return this.state;
  }
  tag(slot, value) {
    if (!Number.isInteger(slot) || slot < 0 || slot > 2) throw new Error('invalid slot');
    if (value !== null && (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,32}$/.test(value))) throw new Error('invalid tag');
    return this.update(s => { s.slots[slot] = value; });
  }
  led(color, effect) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color) || !['solid', 'pulse', 'off'].includes(effect)) throw new Error('invalid LED setting');
    return this.update(s => { s.led = { color, effect }; });
  }
}

