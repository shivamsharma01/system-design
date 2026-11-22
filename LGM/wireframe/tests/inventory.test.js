import test from 'node:test';
import assert from 'node:assert/strict';
import { readInventory } from '../tools/inventory.js';

test('every review route maps to the brief and its requirement references', () => {
  const screens = readInventory();
  for (const [prefix, count] of [['C', 20], ['A', 36], ['S', 8]]) {
    for (let i = 1; i <= count; i++) {
      const matches = screens.filter(s => s.id === `${prefix}-${String(i).padStart(2, '0')}`);
      assert.equal(matches.length, 1);
      assert.ok(matches[0].refs.every(ref => /^[A-Z]+-\d{3}$/.test(ref)));
    }
  }
});
