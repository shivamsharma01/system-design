import { readFileSync, writeFileSync } from 'node:fs';

export function readInventory() {
  const source = readFileSync(new URL('../../docs/wireframes/screen-inventory.md', import.meta.url), 'utf8');
  return source.split('\n').filter(line => /^\| [CAS]-\d{2} \|/.test(line)).map(line => {
    const [id, title, brief, refs, priority, status] = line.split('|').slice(1, -1).map(s => s.trim());
    const n = Number(id.slice(2));
    const group = id[0] === 'S' ? 'System states' : id[0] === 'C'
      ? n < 5 ? 'Discovery' : n < 10 ? 'Checkout' : n < 19 ? 'My account' : 'Customer care'
      : n < 3 ? 'Workspace' : n < 9 ? 'Order operations' : n < 13 ? 'Catalogue' : n < 18 ? 'Warehouse' : n < 21 ? 'Merchandising' : n < 28 ? 'Reports & expenses' : 'Administration';
    return { id, name: title.split(' `')[0], group, brief, refs: refs.split(', '), classification: priority === 'Proposed' ? 'Proposed' : 'Recorded', status };
  });
}

export function syncInventory() {
  writeFileSync(new URL('../screens.js', import.meta.url), '// Generated from docs/wireframes/screen-inventory.md by npm run build.\nexport const screens = ' + JSON.stringify(readInventory(), null, 2) + ';\n');
}
