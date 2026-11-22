import { esc, money, go, refresh, toast, confirmAction, table, link as nav, pageHead, empty } from './ui.js';
import { state, log } from './store.js';
import { officeData } from './office-data.js';

const e = v => esc(String(v ?? ''));
const db = () => officeData(state);
const find = (rows, id) => rows.find(x => String(x.id) === String(id));
const sum = (rows, fn) => rows.reduce((n, x) => n + Number(fn(x) || 0), 0);
const unique = xs => [...new Set(xs.filter(Boolean))];
const matches = (q, ...xs) => xs.some(x => String(x ?? '').toLowerCase().includes(String(q || '').trim().toLowerCase()));
const indiaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
const day = d => {
  const text = String(d || '');
  if (text.includes('T') && /(?:Z|[+-]\d\d:\d\d)$/i.test(text) && Number.isFinite(Date.parse(text))) return indiaDate.format(new Date(text));
  return text.slice(0, 10);
};
const dateLabel = d => {
  const value = new Date(day(d) + 'T12:00:00Z');
  return Number.isNaN(value.getTime()) ? '—' : value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};
const inRange = (d, p) => (!p.from || day(d) >= p.from) && (!p.to || day(d) <= p.to);
const period = p => Object.fromEntries(['from', 'to'].filter(k => p[k]).map(k => [k, p[k]]));
const actions = (...items) => `<div class="actions">${items.join('')}</div>`;
const submit = label => `<button class="button button--primary" type="submit">${e(label)}</button>`;
const cmd = (action, label) => `<button class="button" type="button" data-office-action="${action}">${e(label)}</button>`;
const note = text => `<p class="muted">${e(text)}</p>`;
const panel = (title, html) => `<section class="panel stack"><h2>${e(title)}</h2>${html}</section>`;
const metrics = entries => `<div class="metric-grid office-metrics">${entries.map(([key, value]) => `<div class="panel"><span>${e(key)}</span><strong>${e(value)}</strong></div>`).join('')}</div>`;
const field = (label, name, value = '', type = 'text', attrs = '') =>
  `<label>${e(label)}<input type="${type}" name="${name}" value="${e(value)}" ${attrs}></label>`;
const area = (label, name, value, required = true) => `<label class="office-wide">${e(label)}<textarea name="${name}" rows="4" ${required ? 'required' : ''}>${e(value)}</textarea></label>`;
const select = (label, name, options, value, all = false) => `<label>${e(label)}<select name="${name}" ${all ? '' : 'required'}>${(all ? [['', 'All'], ...options] : options).map(item => {
  const [key, text] = Array.isArray(item) ? item : [item, item];
  return `<option value="${e(key)}"${String(key) === String(value) ? ' selected' : ''}>${e(text)}</option>`;
}).join('')}</select></label>`;
const form = (action, fields, label, extra = '') => `<form data-office-form="${action}" class="form-grid">${fields.join('')}<div class="office-wide actions">${submit(label)}${extra}</div></form>`;
const filter = (id, p, fields = [], dates = true) => `<details class="panel office-filters" open><summary>Filters</summary>${form('filter', [
  ...(dates ? [field('From date', 'from', p.from, 'date'), field('Through date', 'to', p.to, 'date')] : []), ...fields
], 'Apply filters', nav(id, 'Clear filters'))}</details>`;
const search = (p, label) => field(label, 'q', p.q, 'search');
const grid = (title, headers, rows) => panel(`${title} · ${rows.length}`, rows.length
  ? table(headers, rows)
  : empty('No matching records', 'Change the filters or add a record to get started.'));
const reportTools = () => actions(cmd('export', 'Simulate export'), cmd('print', 'Simulate print'));
const customerName = o => o.address?.name || o.customer?.name || o.customer || 'Guest';
const counted = o => !/reject|cancel|pending|received|rto/i.test(o.status);
const product = id => find(state.products, id);
const category = value => find(state.categories, value)?.name || value || 'Uncategorised';
const catalog = [
  ['A-22', 'Sales report', 'Order value, delivery fees and status mix.'],
  ['A-23', 'Inventory report', 'Stock reconciliation and units sold by product.'],
  ['A-24', 'Scheme performance', 'Category sales during each scheme period.'],
  ['A-25', 'Price & update report', 'Catalogue, scheme and stock changes.'],
  ['A-26', 'Expenses', 'Recorded direct and indirect operating costs.']
];
function reportsHub(p) {
  const orders = state.orders.filter(o => inRange(o.date, p));
  return filter('A-21', p) + metrics([['Orders in period', orders.length], ['Recorded expenses', money(sum(db().expenses.filter(x => inRange(x.date, p)), x => x.amount))]])
    + panel('Report directory', `<div class="office-directory">${catalog.map(([id, title, detail]) => `<article>${nav(id, title, period(p))}${note(detail)}</article>`).join('')}</div>`);
}
function salesReport(p) {
  const rows = state.orders.filter(o => inRange(o.date, p) && (!p.status || o.status === p.status));
  const booked = rows.filter(counted);
  const groups = unique(rows.map(o => o.status)).map(s => [s, rows.filter(o => o.status === s).length]);
  return filter('A-22', p, [select('Status', 'status', unique(state.orders.map(o => o.status)), p.status, true)])
    + metrics([['Orders', rows.length], ['Booked order value', money(sum(booked, o => o.total))], ['Included delivery fees', money(sum(booked, o => o.fee))]])
    + panel('Order mix', groups.length ? groups.map(([s, n]) => `<div class="office-bar"><span>${e(s)}</span><meter value="${n}" max="${rows.length}">${n}</meter><b>${n}</b></div>`).join('') : note('No orders in this period.'))
    + reportTools() + grid('Order ledger', ['Order', 'Date', 'Customer', 'Status', 'Order total'], rows.map(o => [nav('A-04', o.id, { id: o.id }), dateLabel(o.date), e(customerName(o)), e(o.status), money(o.total)]));
}
function inventoryReport(p) {
  const orders = state.orders.filter(o => counted(o) && inRange(o.date, p));
  const lines = orders.flatMap(o => o.lines);
  const rows = state.products.filter(x => matches(p.q, x.name, x.sku)).map(x => {
    const moves = state.movements.filter(m => String(m.productId) === String(x.id));
    const range = moves.filter(m => inRange(m.date, p));
    const incoming = sum(range, m => Math.max(0, m.qty));
    const outgoing = sum(range, m => Math.max(0, -m.qty));
    const closing = Number(x.stock) - sum(moves.filter(m => p.to && day(m.date) > p.to), m => m.qty);
    const sold = lines.filter(l => String(l.productId) === String(x.id));
    return [e(x.name), e(x.sku), closing - incoming + outgoing, incoming, outgoing, closing, sum(sold, l => l.qty), money(sum(sold, l => l.price * l.qty))];
  });
  return filter('A-23', p, [search(p, 'Product or SKU')])
    + metrics([['Stock IN', sum(rows, r => r[3])], ['Stock OUT', sum(rows, r => r[4])], ['Closing units', sum(rows, r => r[5])]])
    + note('Set both dates to the same day for daily stock analysis. Closing is the current balance rolled back by later movements; opening + IN − OUT = closing.')
    + reportTools() + grid('Stock & product performance', ['Product', 'SKU', 'Opening', 'IN', 'OUT', 'Closing', 'Booked units', 'Item revenue'], rows);
}
function schemesReport(p) {
  const offers = state.offers.filter(s => (!p.scheme || String(s.id) === p.scheme) && (!s.end || !p.from || day(s.end) >= p.from) && (!s.start || !p.to || day(s.start) <= p.to));
  const rows = offers.map(s => {
    const lines = state.orders.filter(o => counted(o) && inRange(o.date, p) && inRange(o.date, { from: day(s.start), to: day(s.end) })).flatMap(o => o.lines)
      .filter(l => !s.category || /^all(?: categories)?$/i.test(s.category) || category(product(l.productId)?.category) === category(s.category));
    return [e(s.title), e(category(s.category || 'All')), s.start || s.end ? `${s.start ? dateLabel(s.start) : 'Open start'} – ${s.end ? dateLabel(s.end) : 'Ongoing'}` : 'No date limits', sum(lines, l => l.qty), money(sum(lines, l => l.price * l.qty)), 'Not supplied'];
  });
  return filter('A-24', p, [select('Scheme', 'scheme', state.offers.map(s => [s.id, s.title]), p.scheme, true)])
    + metrics([['Matching schemes', rows.length], ['Active flags', offers.filter(o => o.active).length]])
    + note('Proposed estimate: booked items in the scheme category and period, not confirmed redemptions. Overlapping schemes may include the same sales. Historical scheme costs are unavailable.')
    + reportTools() + grid('Scheme comparison', ['Scheme', 'Category', 'Period', 'Items sold', 'Item revenue', 'Profit'], rows);
}
function updateType(action) {
  if (/price|pricing|mrp/i.test(action)) return 'Price';
  if (/offer|scheme/i.test(action)) return 'Scheme';
  if (/stock|inventory/i.test(action)) return 'Inventory';
  if (/product|catalog|import|category|barcode/i.test(action)) return 'Product';
  return '';
}
function history(p, updates) {
  const entries = state.activity.map(x => ({ ...x, type: updateType(x.action) }));
  if (updates) entries.push(...state.movements.map(m => ({ date: m.date, operator: m.operator, type: 'Inventory', action: `${product(m.productId)?.name || m.productId}: ${m.qty > 0 ? '+' : ''}${m.qty} units · ${m.reference}` })));
  const rows = entries.filter(x => (!updates || x.type) && inRange(x.date, p) && (!p.kind || x.type === p.kind) && matches(p.q, x.action, x.operator))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return filter(updates ? 'A-25' : 'A-35', p, [search(p, 'Action or operator'), ...(updates ? [select('Change type', 'kind', ['Product', 'Price', 'Scheme', 'Inventory'], p.kind, true)] : [])])
    + (updates ? metrics([['Matching changes', rows.length], ['Operators', unique(rows.map(x => x.operator)).length]]) + reportTools() : '')
    + grid(updates ? 'Update ledger' : 'Activity log', ['When', 'Operator', 'Area', 'Action'], rows.map(x => [e(String(x.date).replace('T', ' ').slice(0, 19)), e(x.operator), e(x.type || 'Operations'), e(x.action)]));
}
const expenseKinds = ['Direct', 'Indirect'];
const frequencies = ['Daily', 'Monthly'];
function expenses(p) {
  const rows = db().expenses.filter(x => inRange(x.date, p) && (!p.kind || x.category === p.kind) && (!p.frequency || x.frequency === p.frequency) && matches(p.q, x.title, x.notes));
  return actions(nav('A-27', 'Add expense')) + filter('A-26', p, [search(p, 'Title or notes'), select('Category', 'kind', expenseKinds, p.kind, true), select('Frequency', 'frequency', frequencies, p.frequency, true)])
    + metrics(['Total', ...expenseKinds].map(k => [`${k} expenses`, money(sum(rows.filter(x => k === 'Total' || k === x.category), x => x.amount))]))
    + reportTools() + grid('Expense register', ['Expense', 'Date', 'Category', 'Frequency', 'Amount', 'Notes', 'Action'], rows.map(x => [e(x.title), dateLabel(x.date), e(x.category), e(x.frequency), money(x.amount), e(x.notes), nav('A-27', 'Edit', { id: x.id })]));
}
function expenseEntry(p) {
  const x = find(db().expenses, p.id) || {};
  if (p.id && !x.id) return missing('A-26');
  return panel(x.id ? 'Edit expense' : 'New expense', form('expense', [
    field('Expense title', 'title', x.title, 'text', 'required maxlength="100"'), field('Recorded date', 'date', x.date || day(new Date().toISOString()), 'date', 'required'),
    select('Category', 'category', expenseKinds, x.category), select('Frequency', 'frequency', frequencies, x.frequency),
    field('Amount (₹)', 'amount', x.amount, 'number', 'required min="0.01" step="0.01"'), area('Notes (optional)', 'notes', x.notes, false)
  ], 'Save expense', nav('A-26', 'Cancel')));
}
const missing = route => empty('Record unavailable', 'The requested record does not exist in this demo.') + nav(route, 'Return to list');
const orderLink = (id, label = id) => state.role === 'Support' ? nav('A-03', label, { q: id }) : nav('A-04', label, { id });

function customers(p) {
  const people = new Map();
  for (const o of state.orders) {
    const name = customerName(o), phone = o.address?.phone || '', key = String(phone || name);
    if (!people.has(key)) people.set(key, { key, name, phone, orders: [] });
    people.get(key).orders.push(o);
  }
  const profile = state.profile;
  if (profile?.phone) {
    const key = String(profile.phone);
    people.set(key, { ...people.get(key), key, name: profile.name, phone: profile.phone, orders: people.get(key)?.orders || [] });
  }
  if (p.id) {
    const c = people.get(p.id);
    if (!c) return missing('A-28');
    return actions(nav('A-28', 'All customers')) + panel(c.name, note(`Demo mobile: ${c.phone}`))
      + metrics([['Orders placed', c.orders.length], ['Booked order value', money(sum(c.orders.filter(counted), o => o.total))]])
      + grid('Order history', ['Order', 'Date', 'Status', 'Total', 'Support'], c.orders.map(o => [
        orderLink(o.id), dateLabel(o.date), e(o.status), money(o.total), permitted('A-29') ? nav('A-29', 'Record issue', { mode: 'new', order: o.id }) : '—'
      ]));
  }
  const rows = [...people.values()].filter(c => matches(p.q, c.name, c.phone, ...c.orders.map(o => o.id)));
  return filter('A-28', p, [search(p, 'Customer, phone or order number')], false)
    + grid('Customer directory', ['Customer', 'Mobile', 'Orders', 'Profile'], rows.map(c => [e(c.name), e(c.phone), c.orders.length, nav('A-28', 'View summary', { id: c.key })]));
}
const priorities = ['Normal', 'High', 'Urgent'];
const ticketStates = ['Open', 'In progress', 'Closed'];
const supportStaff = () => db().staff.filter(s => ['Admin', 'Support'].includes(s.role));
function support(p) {
  if (p.id || p.mode === 'new') {
    const t = find(db().tickets, p.id) || {};
    if (p.id && !t.id) return missing('A-29');
    const order = find(state.orders, t.order || p.order);
    return actions(nav('A-29', 'Support queue'), ...(order ? [orderLink(order.id, 'View linked order')] : []))
      + panel(t.id ? `Issue ${t.id}` : 'Record a customer issue', form('ticket', [
        field('Subject', 'subject', t.subject, 'text', 'required maxlength="120"'),
        select('Related order', 'order', [['none', 'General enquiry'], ...state.orders.map(o => [o.id, `${o.id} · ${customerName(o)}`])], t.order || p.order),
        select('Priority', 'priority', priorities, t.priority), select('Status', 'status', ticketStates, t.status),
        select('Owner', 'owner', [['unassigned', 'Unassigned'], ...supportStaff().map(s => [s.id, s.name])], t.owner),
        area('Issue and resolution notes', 'notes', t.notes)
      ], 'Save record'));
  }
  const rows = db().tickets.filter(t => (!p.status || t.status === p.status) && matches(p.q, t.id, t.subject, t.order, find(db().staff, t.owner)?.name));
  return actions(nav('A-29', 'New support record', { mode: 'new' })) + filter('A-29', p, [search(p, 'Issue, order or owner'), select('Status', 'status', ticketStates, p.status, true)], false)
    + grid('Support queue', ['Record', 'Subject', 'Order', 'Owner', 'Priority', 'Status'], rows.map(t => [nav('A-29', t.id, { id: t.id }), e(t.subject), t.order === 'none' ? '—' : orderLink(t.order), e(find(db().staff, t.owner)?.name || 'Unassigned'), e(t.priority), e(t.status)]));
}
const roles = { Admin: 'Business administration and all work queues', Operations: 'Orders, dispatch and fulfilment documents', Inventory: 'Catalogue and warehouse stock movements', Support: 'Customer summaries, order context and support records' };
function staff(p) {
  if (p.id || p.mode === 'new') {
    const s = find(db().staff, p.id) || {};
    if (p.id && !s.id) return missing('A-30');
    return panel(s.id ? 'Edit staff member' : 'Create sample staff member', form('staff', [
      field('Full name', 'name', s.name, 'text', 'required'), field('Demo email', 'email', s.email, 'email', 'required'),
      select('Assigned role', 'role', Object.keys(roles), s.role || 'Support')
    ], 'Save staff member', nav('A-30', 'Cancel')));
  }
  const rows = db().staff.filter(s => matches(p.q, s.name, s.email) && (!p.role || s.role === p.role));
  return actions(nav('A-30', 'Create staff member', { mode: 'new' })) + filter('A-30', p, [search(p, 'Staff name or email'), select('Role', 'role', Object.keys(roles), p.role, true)], false)
    + grid('Staff directory', ['Name', 'Email', 'Role', 'Action'], rows.map(s => [e(s.name), e(s.email), e(s.role), nav('A-30', 'Edit', { id: s.id })]))
    + grid('Proposed access summary', ['Role', 'Responsibilities'], Object.entries(roles));
}
function business() {
  const s = state.settings;
  return panel('Business and service area', form('business', [
    field('Business name', 'business', s.business, 'text', 'required'), field('Support email', 'email', s.email, 'email', 'required'),
    field('Support phone', 'phone', s.phone, 'tel', 'required'), field('Delivery fee (₹)', 'fee', s.fee, 'number', 'required min="0" step="0.01"'),
    area('Warehouse / return address', 'address', s.address), area('Serviceable PIN codes (comma or space separated)', 'pins', s.pins.join(', '))
  ], 'Save business settings', nav('C-19', 'View Contact Us')));
}
function integrations() {
  return grid('Provider availability', ['Service', 'Mode', 'Connection', 'Purpose'], [
    ['Logistics', 'Generic courier', 'Disconnected', 'Shipment events and return pickup'],
    ['SMS', 'Local simulation', 'Disconnected', 'Demo verification and order notices'],
    ['WhatsApp', 'Placeholder', 'Disconnected', 'Optional shipment notices'],
    ['Payment', 'Dummy checkout only', 'No gateway connected', 'No real payments or credentials']
  ]) + panel('Configuration', note('No provider has been selected. Live connections and credential entry are unavailable in this prototype.') + actions('<button class="button" disabled>Connect provider</button>', nav('A-33', 'Review notification templates')));
}
function templates(p) {
  const rows = db().templates;
  if (p.id) {
    const t = find(rows, p.id);
    if (!t) return missing('A-33');
    return panel(t.title, note(`Channel: ${t.channel}. Tokens are sample placeholders; no message is sent.`) + form('template', [select('Review state', 'status', ['Draft', 'Ready for review'], t.status), area('Message', 'body', t.body)], 'Save template', nav('A-33', 'Cancel')));
  }
  return grid('Message library', ['Event', 'Channel', 'Review state', 'Delivery', 'Action'], rows.map(t => [e(t.title), e(t.channel), e(t.status), 'Disabled', nav('A-33', 'Edit template', { id: t.id })])) + actions(nav('A-32', 'View provider status'));
}
const pages = { about: 'About', terms: 'Terms', privacy: 'Privacy', shipping: 'Shipping', cancellation: 'Cancellation & refund', returns: 'Returns', contact: 'Contact' };
function content(p) {
  const slug = Object.hasOwn(pages, p.slug) ? p.slug : 'about';
  return panel('Storefront pages', actions(...Object.entries(pages).map(([k, v]) => nav('A-34', v, { slug: k }))))
    + panel(pages[slug], form('content', [area('Customer-facing sample copy', 'copy', state.content[slug])], 'Save page', slug === 'contact' ? nav('C-19', 'View Contact Us') : nav('C-20', 'View customer page', { slug })));
}
const shipAddress = a => [a?.building, a?.street, a?.city, a?.state, a?.pin].filter(Boolean).join(', ');
function documents(p) {
  if (!state.orders.length) return empty('No orders available', 'Create a demo order to preview its documents.');
  const o = p.id ? find(state.orders, p.id) : state.orders[0];
  if (!o) return missing('A-36');
  const s = state.settings, label = (p.type || p.doc) === 'label';
  const selector = panel('Preview selection', form('document', [
    select('Order', 'id', state.orders.map(x => [x.id, `${x.id} · ${customerName(x)}`]), o.id),
    select('Document', 'type', [['invoice', 'GST invoice'], ['label', 'Shipping label']], label ? 'label' : 'invoice')
  ], 'Show preview', nav('A-04', 'View order', { id: o.id })));
  const addressBlock = (title, name, address, phone) => `<section><h3>${e(title)}</h3><strong>${e(name)}</strong><p>${e(address)}</p><p>${e(phone)}</p></section>`;
  const heading = label ? 'Shipping label' : 'Sample GST invoice';
  const addresses = `<div class="office-addresses">${addressBlock(label ? 'Ship to' : 'Bill / ship to', customerName(o), shipAddress(o.address), o.address?.phone)}${addressBlock(label ? 'Sender / return to' : 'Issued by', s.business, s.address, s.phone)}</div>`;
  const details = label ? note(`Service PIN: ${o.address?.pin || '—'} · Single warehouse · Tracking reference pending courier assignment.`)
    : grid('Invoice items', ['Item', 'Qty', 'Unit price', 'Line total'], o.lines.map(l => [e(l.name), e(l.qty), money(l.price), money(l.qty * l.price)]))
      + metrics([['Item subtotal', money(sum(o.lines, l => l.qty * l.price))], ['Delivery', money(o.fee)], ['Invoice total', money(o.total)]])
      + note('GSTIN, HSN and tax breakdown: awaiting business inputs. Not a tax invoice. Payment: demo only.');
  return selector + panel(heading, `<p><strong>${e(o.id)}</strong> · ${dateLabel(o.date)} · ${e(o.status)}</p>${addresses}${details}`) + actions(cmd('print', `Simulate print: ${heading}`));
}

const screens = {
  'A-21': ['Reports hub', 'Set a reporting period, then open a ledger to inspect its source records.', reportsHub],
  'A-22': ['Sales report', 'Booked value excludes pending, cancelled, rejected and RTO orders.', salesReport],
  'A-23': ['Inventory report', 'Warehouse balances and product sales over the selected period.', inventoryReport],
  'A-24': ['Scheme performance', 'Compare eligible product sales within each offer window.', schemesReport],
  'A-25': ['Price & update report', 'Inspect logged changes and signed warehouse movements.', p => history(p, true)],
  'A-26': ['Expenses', 'Track recorded costs. Frequency is a classification, not an automatic payment schedule.', expenses],
  'A-27': ['Expense entry', 'Record one operating expense at a time.', expenseEntry],
  'A-28': ['Customers', 'Demo profiles and order summaries grouped by customer mobile number.', customers],
  'A-29': ['Support records', 'Proposed internal queue for enquiries, ownership and resolution.', support],
  'A-30': ['Staff & roles', 'Illustrative assignments only. No invitation is sent and no credentials are created.', staff],
  'A-31': ['Business settings', 'Changes apply to storefront contact details, serviceability and new checkout estimates.', business],
  'A-32': ['Integration settings', 'Placeholder providers for the standalone online warehouse.', integrations],
  'A-33': ['Notifications & templates', 'Prepare sample notices for review. Delivery is disabled.', templates],
  'A-34': ['Policy & content', 'Placeholder wording for the customer website; not approved business or legal policy.', content],
  'A-35': ['Activity history', 'Read-only record of changes made in this demo session.', p => history(p, false)],
  'A-36': ['Invoice & label preview', 'Illustrative documents generated from a selected order and current sender settings.', documents]
};
const permitted = id => state.role === 'Admin' || (state.role === 'Operations' && id === 'A-36') || (state.role === 'Support' && ['A-28', 'A-29'].includes(id));
export function office(id, params = {}) {
  if (!Object.hasOwn(screens, id)) return '';
  const [title, description, render] = screens[id];
  const html = permitted(id) ? pageHead(title, description) + render(params)
    : empty('Access restricted', 'This role does not have access to this workspace.') + nav('A-02', 'Return to dashboard');
  return `<div class="office stack" data-office="${id}">${html}</div>`;
}

function saveRow(rows, id, prefix, values) {
  if (id) {
    const current = find(rows, id);
    if (!current) throw Error('This record is no longer available.');
    Object.assign(current, values);
    return current;
  }
  let n = rows.length + 101;
  while (find(rows, `${prefix}-${n}`)) n++;
  const row = { ...values, id: `${prefix}-${n}` };
  rows.unshift(row);
  return row;
}
function saved(message, route, params) {
  log(message);
  toast(message);
  if (route) go(route, params); else refresh();
}
function invalid(input, message) {
  input.setCustomValidity(message);
  input.reportValidity();
}
function submitOffice(formEl, id, p) {
  const v = Object.fromEntries(Array.from(new FormData(formEl), ([k, value]) => [k, String(value).trim()]));
  const controls = formEl.elements;
  for (const input of controls) {
    if (input.required && !v[input.name]) return invalid(input, 'Enter a value before saving.');
  }
  const data = db();
  switch (formEl.dataset.officeForm) {
    case 'filter':
      if (v.from && v.to && v.from > v.to) return invalid(controls.to, 'Choose an end date on or after the start date.');
      return go(id, Object.fromEntries(Object.entries(v).filter(([, value]) => value)));
    case 'document': return go(id, v);
    case 'expense': {
      const row = saveRow(data.expenses, p.id, 'EX', { ...v, amount: Number(v.amount) });
      return saved(`Saved expense ${row.id}`, 'A-26');
    }
    case 'ticket': {
      const save = () => {
        const row = saveRow(data.tickets, p.id, 'SR', v);
        saved(`Support record ${row.id} · ${row.status}`, 'A-29');
      };
      if (v.status === 'Closed' && find(data.tickets, p.id)?.status !== 'Closed')
        return confirmAction('Close support record?', 'Save these resolution notes and mark the issue closed.', save);
      return save();
    }
    case 'staff': {
      if (data.staff.some(s => s.id !== p.id && s.email.toLowerCase() === v.email.toLowerCase()))
        return invalid(controls.email, 'A staff member already uses this email.');
      const previous = find(data.staff, p.id);
      if (previous?.role === 'Admin' && v.role !== 'Admin' && !data.staff.some(s => s !== previous && s.role === 'Admin'))
        return invalid(controls.role, 'Keep at least one demo administrator.');
      return confirmAction('Save staff assignment?', `Assign the proposed ${v.role} role to ${v.name}. No invite will be sent.`, () => {
        const row = saveRow(data.staff, p.id, 'ST', v);
        // Return open work to the queue if its owner moves out of support.
        if (!supportStaff().includes(row)) for (const t of data.tickets) {
          if (t.owner === row.id && t.status !== 'Closed') t.owner = 'unassigned';
        }
        saved(`Saved staff assignment ${row.id} · ${v.role}`, 'A-30');
      });
    }
    case 'business': {
      const pins = unique(v.pins.split(/[\s,]+/));
      if (!pins.length || pins.some(pin => !/^\d{6}$/.test(pin)))
        return invalid(controls.pins, 'Enter six-digit PIN codes separated by commas or spaces.');
      return confirmAction('Apply business settings?', 'Contact information, serviceable PIN codes and the fee for new orders will update in this demo.', () => {
        Object.assign(state.settings, v, { fee: Number(v.fee), pins });
        saved('Updated business and delivery settings');
      });
    }
    case 'template': {
      const row = saveRow(data.templates, p.id, 'TM', v);
      return saved(`Saved ${row.channel} template: ${row.title}`, 'A-33');
    }
    case 'content': {
      const slug = Object.hasOwn(pages, p.slug) ? p.slug : 'about';
      return confirmAction('Update customer page?', `Replace the sample ${pages[slug]} copy in the storefront.`, () => {
        state.content[slug] = v.copy;
        saved(`Updated storefront content: ${pages[slug]}`);
      });
    }
  }
}
export function bindOffice(id, params = {}) {
  if (!Object.hasOwn(screens, id) || !permitted(id)) return;
  const root = document.querySelector(`[data-office="${id}"]`);
  if (!root) return;
  const filters = root.querySelector('.office-filters');
  if (filters && window.matchMedia('(max-width: 47.99rem)').matches) filters.open = false;
  root.oninput = event => {
    if (event.target.form) for (const input of event.target.form.elements) input.setCustomValidity?.('');
  };
  root.onsubmit = event => {
    event.preventDefault();
    if (!permitted(id) || !event.target.dataset.officeForm || !event.target.reportValidity()) return;
    try { submitOffice(event.target, id, params); } catch (error) { toast(error.message); }
  };
  root.onclick = event => {
    const action = event.target.closest('[data-office-action]')?.dataset.officeAction;
    if (!action || !permitted(id)) return;
    toast(action === 'export' ? 'Export simulated for the displayed report. No file was downloaded.' : 'Print simulated for the displayed preview. Nothing was sent to a printer.');
  };
}
