import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { syncInventory } from './inventory.js';
import './check.js';
syncInventory();
mkdirSync('dist', { recursive: true });
for (const f of readdirSync('.').filter(f => /\.(js|html|css)$/.test(f) || f === 'assets')) {
  cpSync(f, `dist/${f}`, { recursive: true });
}
console.log('Built static preview in wireframe/dist/.');
