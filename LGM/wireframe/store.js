import { products, categories, banners } from './catalogue.js';

const now = () => new Date().toISOString();
const ago = days => new Date(Date.now() - days * 86400000).toISOString();
const address = { id:'home', name:'Kiran Demo', phone:'9000000000', building:'14, Sample Court', street:'Model Lane', city:'Bahadurgarh', state:'Haryana', pin:'124507', landmark:'', default:true };
const settings = { pins:['124507','124508'], fee:35, business:'LGM Hub', address:'Demo online warehouse, Bahadurgarh, Haryana', email:'care@example.invalid', phone:'1800-000-000 (placeholder)' };
export const state = {
  products, categories, banners, settings, role:'Admin', verified:false, pin:'',
  profile:{name:address.name, phone:address.phone}, addresses:[address],
  cart:{}, orders:[], returns:[], wallet:[], movements:[], activity:[],
  offers:[{id:'pantry-edit',title:'The pantry edit',category:'pantry',active:true,start:'',end:''}],
  content:{
    about:'A standalone online shop for grocery and household essentials.',
    shipping:'Orders are reviewed by LGM staff before packing at the Bahadurgarh online warehouse. Delivery estimates are illustrative.',
    cancellation:'An order awaiting review may be cancelled in this demo. After dispatch, see return options instead.',
    returns:'The sample return window is seven days from delivery. Keep items unused, unopened and packed; exceptions are placeholders.',
    terms:'Terms of sale and final legal wording will be provided by LGM.',
    privacy:'This prototype uses temporary browser memory. Do not enter real personal information.',
    contact:'For help with a demo order, include the order number and a short description.'
  }
};
let sequence = 1040;
const item = id => {
  const p = products.find(p => p.id === id);
  if (!p) throw Error('Product not found. Return to the catalogue.');
  return p;
};
const allowedQty = (p, qty) => Number.isSafeInteger(qty) && qty > 0 && qty <= Math.min(p.stock, 10) && p.active && categories.some(c => c.id === p.category && c.active);
export const serviceable = pin => settings.pins.includes(String(pin).trim());
export const delivery = () => Object.keys(state.cart).length ? settings.fee : 0;
export const subtotal = () => Object.entries(state.cart).reduce((sum,[id,q]) => sum + item(id).price * q, 0);
export function log(action) { state.activity.unshift({date:now(), action, operator:state.role}); }
export function setQty(id, qty) {
  const p = item(id);
  if (qty === 0) { delete state.cart[id]; return; }
  if (!allowedQty(p, qty)) throw Error('Choose up to 10 available units of a listed product.');
  state.cart[id] = qty;
}
export function placeOrder(a) {
  if (!state.verified) throw Error('Verify your demo mobile number first.');
  if (!a || !serviceable(a.pin) || !/^\d{10}$/.test(a.phone) || !['name','building','street','city','state'].every(k => String(a[k] ?? '').trim())) throw Error('Choose a complete address in a serviceable PIN code.');
  const lines = Object.entries(state.cart).map(([id, qty]) => {
    const p = item(id);
    if (!allowedQty(p, qty)) throw Error(`Review the available quantity for ${p.name}.`);
    return {productId:id, name:p.name, qty, price:p.price};
  });
  if (!lines.length) throw Error('Your basket is empty. Add an item before checkout.');
  const date = now(), status = 'Pending LGM Review', fee = delivery();
  const order = {id:`LGM-${++sequence}`, date, customer:a.name, address:{...a}, lines, fee, total:subtotal()+fee, status, history:[{status,date}]};
  state.orders.unshift(order);
  state.cart = {};
  state.activity.unshift({date, operator:'Customer', action:`Submitted ${order.id} for review`});
  return order;
}
function movement(p, qty, reference) {
  p.stock += qty;
  state.movements.unshift({date:now(), productId:p.id, qty, reference, operator:state.role});
}
export function stockIn(id, qty, reference) {
  if (!Number.isSafeInteger(qty) || qty < 1) throw Error('Enter a positive whole quantity.');
  movement(item(id), qty, reference || 'Manual receipt');
  log(`Stock IN · ${item(id).sku} · ${qty} units`);
}
const orderSteps = {
  'Pending LGM Review':['Accepted','Rejected','Cancelled'], Accepted:['Packing'], Packing:['Dispatched'],
  Dispatched:['Delivered','Delivery Failed'], 'Delivery Failed':['Dispatched','RTO']
};
export function transitionOrder(id, status) {
  const order = state.orders.find(o => o.id === id);
  if (!order || !orderSteps[order.status]?.includes(status)) throw Error('This action is no longer available for the order.');
  if (status === 'Accepted') {
    for (const line of order.lines) {
      if (item(line.productId).stock < line.qty) throw Error(`Insufficient stock for ${line.name}. Record stock IN or reject the order.`);
    }
    for (const line of order.lines) movement(item(line.productId), -line.qty, order.id);
  }
  order.status = status;
  order.history.push({status,date:now()});
  log(`${id} · ${status}`);
  return order;
}
export function requestReturn(orderId, reason, notes) {
  const o = state.orders.find(o => o.id === orderId);
  const delivered = o?.history.findLast(h => h.status === 'Delivered');
  if (o?.status !== 'Delivered' || !delivered || Date.now()-Date.parse(delivered.date) > 7*86400000) throw Error('This demo accepts requests within seven days of delivery.');
  if (state.returns.some(r => r.orderId === orderId)) throw Error('A return request already exists for this order.');
  if (!reason?.trim()) throw Error('Choose a return reason.');
  const status='Pending review', date=now();
  const r = {id:`RET-${++sequence}`, orderId, date, reason, notes, status, amount:o.total-o.fee, history:[{status,date}]};
  state.returns.unshift(r);
  state.activity.unshift({date,operator:'Customer',action:`Requested return ${r.id}`});
  return r;
}
const returnSteps = {'Pending review':['Approved','Rejected'],Approved:['Pickup arranged'],'Pickup arranged':['Credited']};
export function transitionReturn(id,status) {
  const r = state.returns.find(row => row.id === id);
  if (!r || !returnSteps[r.status]?.includes(status)) throw Error('This return action is no longer available.');
  r.status = status;
  r.history.push({status,date:now()});
  if (status === 'Credited') state.wallet.unshift({date:now(),description:`Demo refund · ${id}`,amount:r.amount});
  log(`${id} · ${status}`);
  return r;
}

// Seed transactions are balanced against the warehouse opening quantities.
const path = ['Pending LGM Review','Accepted','Packing','Dispatched','Delivered'];
for (const [i,status] of ['Pending LGM Review','Packing','Delivery Failed','Delivered','Delivered'].entries()) {
  const p = products.filter(p => p.active && p.stock >= 3)[i % products.filter(p => p.active && p.stock >= 3).length];
  const id = `LGM-${1039-i}`, date = ago(i ? i/2 : 0);
  const events = status === 'Delivery Failed' ? [...path.slice(0,4),status] : path.slice(0,path.indexOf(status)+1);
  const history = events.map((s,n) => ({status:s,date:new Date(Date.parse(date) - (events.length-1-n)*60000).toISOString()}));
  state.orders.push({id,date:history[0].date,status,history,customer:address.name,address:{...address},lines:[{productId:p.id,name:p.name,qty:1,price:p.price}],total:p.price+settings.fee,fee:settings.fee});
  if (status !== path[0]) {
    p.opening++;
    state.movements.push({date:history[1].date,productId:p.id,qty:-1,operator:'Operations',reference:id});
  }
}
requestReturn(state.orders.at(-1).id,'Damaged packaging','Unopened sample pack.');
