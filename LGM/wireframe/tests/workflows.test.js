import { test } from 'node:test';
import assert from 'node:assert/strict';
import { state, setQty, placeOrder, transitionOrder, transitionReturn, requestReturn, stockIn } from '../store.js';

test('submitting an order does not reserve stock; only one manual acceptance posts OUT', () => {
  const product = state.products.find(p => p.stock > 5 && p.active);
  const initial = product.stock;
  state.verified = true;
  setQty(product.id, 2);
  const order = placeOrder(state.addresses[0]);
  assert.equal(order.status, 'Pending LGM Review');
  assert.equal(product.stock, initial);
  assert.deepEqual(Object.keys(state.cart), []);
  transitionOrder(order.id, 'Accepted');
  assert.equal(product.stock, initial - 2);
  assert.throws(() => transitionOrder(order.id, 'Accepted'));
  assert.equal(product.stock, initial - 2);
  stockIn(product.id, 3, 'Test receipt');
  assert.equal(product.stock, initial + 1);
  assert.equal(state.movements[0].qty, 3);
});

test('failed stock checks leave a pending order and balances intact', () => {
  const p = state.products.find(p => p.stock >= 2 && p.active);
  state.verified = true;
  setQty(p.id, 2);
  const order = placeOrder(state.addresses[0]);
  const original = p.stock;
  p.stock = 1;
  assert.throws(() => transitionOrder(order.id, 'Accepted'));
  assert.equal(order.status, 'Pending LGM Review');
  assert.equal(p.stock, 1);
  p.stock = original;
});

test('a delivered order can have only one open return and one simulated credit', () => {
  const order = state.orders.find(o => o.status === 'Delivered' && !state.returns.some(r => r.orderId === o.id));
  const r = requestReturn(order.id, 'Damaged pack', 'Unopened');
  assert.throws(() => requestReturn(order.id, 'Damaged pack', ''));
  transitionReturn(r.id, 'Approved');
  transitionReturn(r.id, 'Pickup arranged');
  transitionReturn(r.id, 'Credited');
  const entry = state.wallet[0];
  assert.equal(entry.amount, r.amount);
  assert.throws(() => transitionReturn(r.id, 'Credited'));
  assert.equal(state.wallet[0], entry);
});
