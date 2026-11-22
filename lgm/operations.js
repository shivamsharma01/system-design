import { esc, money, go, refresh, toast, confirmAction, link, table, badge, pageHead, empty } from './ui.js';
import { state, transitionOrder, transitionReturn, stockIn, log } from './store.js';

const pages = {
  'A-02': ['Operations dashboard', 'Work queues for the Bahadurgarh online warehouse.'],
  'A-03': ['Orders', 'Find an order and review its next step.'],
  'A-04': ['Order details', 'Review the order before releasing stock for packing.'],
  'A-05': ['Packing & dispatch', 'Customer-wise fulfilment queue for the online warehouse.'],
  'A-06': ['Shipments & exceptions', 'Update simulated delivery events; no live courier connection.'],
  'A-07': ['Return requests', 'Review eligibility against the indicative seven-day, unopened-pack policy.'],
  'A-08': ['Return details', 'Review the request, arrange a simulated pickup and track demo credit.'],
  'A-09': ['Product catalogue', 'Find products by name, SKU or barcode.'],
  'A-10': ['Product setup', 'Edit the information customers see. Receive stock separately through Stock IN.'],
  'A-11': ['Categories', 'Organise the storefront by category, visibility and display order.'],
  'A-12': ['Product import', 'Preview spreadsheet rows locally before applying catalogue changes.'],
  'A-13': ['Inventory overview', 'Review available sellable units in the online warehouse.'],
  'A-14': ['Stock IN', 'Find a product, check the units received and confirm the stock movement.'],
  'A-15': ['Stock movements', 'Trace incoming and outgoing units to a reference and operator.'],
  'A-16': ['Barcode management', 'Capture a manufacturer code or generate an internal label.'],
  'A-17': ['Low stock & expiry', 'Check reorder points and indicative best-before dates.'],
  'A-18': ['Pricing', 'Review catalogue prices. Purchase cost is restricted to administrators.'],
  'A-19': ['Offers & schemes', 'Schedule category promotions and review their performance.'],
  'A-20': ['Banner management', 'Arrange homepage placements, assets and category destinations.']
};
const orderFlow = {
  'Pending LGM Review': ['Accepted', 'Rejected'], Accepted: ['Packing'], Packing: ['Dispatched'],
  Dispatched: ['Delivered', 'Delivery Failed'], 'Delivery Failed': ['Dispatched', 'RTO'],
  Delivered: [], Rejected: [], RTO: []
};
const returnFlow = { 'Pending review': ['Approved', 'Rejected'], Approved: ['Pickup arranged'], 'Pickup arranged': ['Credited'], Rejected: [], Credited: [] };
const actionLabels = { Accepted: 'Accept & deduct stock', Rejected: 'Reject', Packing: 'Start packing', Dispatched: 'Mark dispatched', Delivered: 'Mark delivered', 'Delivery Failed': 'Record failed delivery', RTO: 'Return to origin', Approved: 'Approve', 'Pickup arranged': 'Arrange pickup', Credited: 'Issue demo wallet credit' };
const admin = () => state.role === 'Admin';
const warehouse = () => admin() || state.role === 'Inventory';
const fulfil = () => admin() || state.role === 'Operations';
const canView = id => admin() || (id === 'A-02' && (warehouse() || fulfil())) ||
  (id >= 'A-03' && id <= 'A-08' && fulfil()) || (state.role === 'Support' && ['A-03','A-07'].includes(id)) ||
  (id >= 'A-09' && id <= 'A-17' && warehouse());
const h = value => esc(String(value ?? ''));
const find = (rows, id) => rows.find(row => String(row.id) === String(id));
const uid = prefix => `${prefix}-${crypto.randomUUID()}`;
const catName = key => find(state.categories, key)?.name ?? key;
const cats = () => state.categories.map(c => [c.id, c.name]);
const ordered = rows => [...rows].sort((a,b) => a.position - b.position);
const metric = (label,value) => `<div class="panel ops-metric"><span>${h(label)}</span><strong>${h(value)}</strong></div>`;
const panel = (title,body) => `<section class="panel stack"><h2>${h(title)}</h2>${body}</section>`;
const actions = (...items) => `<div class="actions">${items.join('')}</div>`;
const none = () => empty('No matching records', 'Try different filters or clear the search.');
const missing = (id,label) => empty('Record not found', 'This record is no longer available.') + link(id,label);
const grid = (headers,rows) => rows.length ? table(headers,rows) : none();
const field = (label,name,value='',type='text',attrs='') => `<label>${h(label)}<input name="${name}" type="${type}" value="${h(value)}" ${attrs}></label>`;
const number = (label,name,value,min=0,step=1) => field(label,name,value,'number',`required min="${min}" step="${step}"`);
const select = (label,name,value,options,attrs='') => `<label>${h(label)}<select name="${name}" ${attrs}>${options.map(option => {
  const [key,text] = Array.isArray(option) ? option : [option,option];
  return `<option value="${h(key)}"${String(value) === String(key) ? ' selected' : ''}>${h(text)}</option>`;
}).join('')}</select></label>`;
const active = value => select('Visibility','active',String(value ?? true),[['true','Active'],['false','Inactive']]);
const form = (kind,fields,submit) => `<form data-form="${kind}" class="stack"><div class="form-grid">${fields}</div><p class="ops-error" role="alert"></p>${actions(`<button class="button button--primary" type="submit">${h(submit)}</button>`)}</form>`;
const search = (p,label) => field(label,'q',p.q,'search');
const dates = p => field('From date (IST)','from',p.from,'date') + field('Through date (IST)','to',p.to,'date');
const filters = (id,fields) => `<section class="panel ops-filters" aria-label="Filters">${form('filter',fields,'Apply filters')}${link(id,'Clear filters')}</section>`;
const all = (label,name,value,options) => select(label,name,value,[['','All'],...options]);
const matches = (q,...values) => !q || values.some(v => String(v ?? '').toLowerCase().includes(q.trim().toLowerCase()));
const day = value => {
  if (!value) return '';
  if (/^\d{4}-\d\d-\d\d$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(+date) ? '' : new Date(+date + 19800000).toISOString().slice(0,10);
};
const inRange = (value,p) => (!p.from || day(value) >= p.from) && (!p.to || day(value) <= p.to);
const dateText = value => {
  const date = new Date(value);
  return value && Number.isFinite(+date) ? date.toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}) : '—';
};
const customer = o => o?.address?.name || o?.customer?.name || o?.customer || '—';
const history = rows => rows?.length ? `<ol class="ops-history">${rows.map(r => `<li><strong>${h(r.status)}</strong> · ${h(dateText(r.date))} IST</li>`).join('')}</ol>` : '<p>No events yet.</p>';

function dashboard() {
  const cards = [];
  const queue = (id,label,value,params={}) => {
    if (canView(id)) cards.push(`<div class="panel ops-metric"><strong>${h(value)}</strong>${link(id,label,params)}</div>`);
  };
  const count = status => state.orders.filter(o => o.status === status).length;
  queue('A-03','Awaiting acceptance',count('Pending LGM Review'),{status:'Pending LGM Review'});
  queue('A-05','To pack',count('Accepted'),{status:'Accepted'});
  queue('A-06','Failed deliveries',count('Delivery Failed'),{status:'Delivery Failed'});
  queue('A-07','Returns awaiting review',state.returns.filter(r => r.status === 'Pending review').length,{status:'Pending review'});
  queue('A-17','Low-stock items',state.products.filter(p => p.stock <= p.threshold).length,{alert:'Low stock'});
  const today = day(new Date()), current = state.orders.filter(o => day(o.date) === today);
  queue('A-03','Orders received today',current.length,{from:today,to:today});
  if (admin()) cards.push(metric('Delivered sales today',money(state.orders.filter(o => o.status === 'Delivered' && day(o.history?.findLast(e => e.status === 'Delivered')?.date ?? o.date) === today).reduce((sum,o) => sum + o.total,0))));
  const pending = state.orders.filter(o => o.status === 'Pending LGM Review').slice(0,5);
  const low = state.products.filter(x => x.stock <= x.threshold).sort((a,b) => a.stock-b.stock).slice(0,5);
  const queues = [];
  if (fulfil()) queues.push(panel('Next orders to review', pending.length ?
    grid(['Order','Customer','Amount'],pending.map(o => [link('A-04',o.id,{id:o.id}),h(customer(o)),money(o.total)])) : '<p>No orders awaiting acceptance.</p>'));
  if (warehouse()) queues.push(panel('Replenishment queue', low.length ?
    grid(['Product','Available','Action'],low.map(x => [h(x.name),h(x.stock),link('A-14','Receive',{id:x.id})])) : '<p>All items are above threshold.</p>'));
  return `<div class="metric-grid">${cards.join('')}</div><div class="split">${queues.join('')}</div>`;
}
function steps(record,returns=false) {
  if (!fulfil()) return '<p class="muted">Read-only for this role.</p>';
  const next = (returns ? returnFlow : orderFlow)[record.status] ?? [];
  return next.length ? actions(...next.map(s => `<button class="button" type="button" data-step="${h(s)}" data-record="${h(record.id)}">${h(record.status === 'Delivery Failed' && s === 'Dispatched' ? 'Retry delivery' : actionLabels[s])}</button>`)) : '<p class="muted">No further actions.</p>';
}
function orders(id,p) {
  const detail = id === 'A-04', packing = id === 'A-05', shipment = id === 'A-06';
  if (detail) {
    const o = find(state.orders,p.id);
    if (!o) return missing('A-03','Back to orders');
    const a = o.address || {};
    return actions(link('A-03','All orders'),link('A-05','Packing queue'),link('A-06','Shipment queue')) +
      panel(`Order ${o.id}`,badge(o.status) + `<p>${h(dateText(o.date))} IST · Dummy payment</p>` + steps(o)) +
      panel('Delivery address',`<address>${[customer(o),a.phone,a.building,a.street,a.city,a.state,a.pin].filter(Boolean).map(h).join('<br>')}</address>`) +
      panel('Order summary',grid(['Item','Units','Unit price','Line total'],o.lines.map(l => [h(l.name),h(l.qty),money(l.price),money(l.price*l.qty)])) +
        `<p>Items: ${money(o.lines.reduce((n,l) => n+l.qty*l.price,0))} · Delivery: ${money(o.fee)} · <strong>Total: ${money(o.total)}</strong></p>`) + panel('Activity',history(o.history));
  }
  const statuses = packing ? ['Accepted','Packing'] : shipment ? ['Dispatched','Delivery Failed','Delivered','RTO'] : [...new Set([...Object.keys(orderFlow),...state.orders.map(o => o.status)])];
  const rows = state.orders.filter(o => statuses.includes(o.status) && (!p.status || o.status === p.status) && inRange(o.date,p) && matches(p.q,o.id,customer(o),o.address?.phone));
  if (packing) rows.sort((a,b) => String(customer(a)).localeCompare(String(customer(b))));
  return filters(id,search(p,'Order or customer') + all('Status','status',p.status,statuses) + dates(p)) +
    grid(['Order','Customer','Placed (IST)','Status',packing ? 'Pack list' : 'Amount',shipment ? 'Delivery event' : 'Next step'],rows.map(o => [
      fulfil() ? link('A-04',o.id,{id:o.id}) : h(o.id),h(customer(o)),h(dateText(o.date)),badge(o.status),packing ? o.lines.map(l => `${h(l.qty)} × ${h(l.name)}`).join('<br>') : money(o.total),
      packing || shipment ? steps(o) : fulfil() ? link('A-04','Review order',{id:o.id}) : 'Read-only'
    ]));
}
function returns(id,p) {
  if (id === 'A-07') return filters(id,search(p,'Request or order') + all('Return status','status',p.status,Object.keys(returnFlow)) + dates(p)) +
    grid(['Request','Order','Requested (IST)','Reason','Status','Amount'],state.returns.filter(r => matches(p.q,r.id,r.orderId) && inRange(r.date,p) && (!p.status || r.status === p.status)).map(r => [
      fulfil() ? link('A-08',r.id,{id:r.id}) : h(r.id),fulfil() ? link('A-04',r.orderId,{id:r.orderId}) : h(r.orderId),h(dateText(r.date)),h(r.reason),badge(r.status),money(r.amount)
    ]));
  const r = find(state.returns,p.id);
  if (!r) return missing('A-07','Back to requests');
  const o = find(state.orders,r.orderId);
  const delivery = o?.history?.findLast(e => e.status === 'Delivered');
  const age = Date.parse(r.date)-Date.parse(delivery?.date);
  const eligibility = !Number.isFinite(age) ? 'Delivery date unavailable' : age >= 0 && age <= 7*86400000 ? 'Requested within seven days of delivery' : 'Outside the indicative return window';
  return actions(link('A-07','All returns'),link('A-04','View original order',{id:r.orderId})) +
    panel(`Request ${r.id}`,badge(r.status) + `<p>Order ${h(r.orderId)} · ${h(customer(o))} · ${money(r.amount)}</p><p><strong>${h(r.reason)}</strong><br>${h(r.notes || 'No additional notes.')}</p><p>${h(eligibility)}. Check unopened condition before approval.</p><p>Photo evidence: ${h(r.photo || 'No photo supplied (placeholder).')}</p><p class="muted">Pickup and wallet credit are simulations.</p>` + steps(r,true)) + panel('Return history',history(r.history));
}

const priceFields = item => number('MRP (₹)','mrp',item.mrp,0,0.01) + number('Selling price (₹)','price',item.price,0,0.01) +
  (admin() ? number('Purchase cost (₹)','cost',item.cost ?? 0,0,0.01) : '');
const asset = (label,name,value) => field(label,name,value,'text','maxlength="160" placeholder="Local asset name or placeholder label"');
const rowsFor = p => state.products.filter(item => matches(p.q,item.name,item.sku,item.barcode) &&
  (!p.category || item.category === p.category) && (!p.active || String(item.active) === p.active));
const productFilter = (id,p,extra='') => filters(id,search(p,'Name, SKU or barcode') + all('Category','category',p.category,cats()) + extra);
function productSetup(p) {
  const item = find(state.products,p.id);
  if (p.id && !item) return missing('A-09','Back to catalogue');
  const x = item || {};
  return link('A-09','Back to catalogue') + panel(item ? `Edit ${item.name}` : 'New product',
    form('product',field('Product name','name',x.name,'text','required') + field('SKU','sku',x.sku,'text','required') +
      select('Category','category',x.category,cats(),'required') + field('Pack size / unit','pack',x.pack,'text','required') +
      priceFields(x) + field('Barcode (optional)','barcode',x.barcode) + asset('Product image','image',x.image) +
      `<label>Product / food information<textarea name="description">${h(x.description)}</textarea></label>` +
      active(x.active),'Save product'));
}
function categories(p) {
  const c = find(state.categories,p.id);
  if (p.id && !c) return missing('A-11','Back to categories');
  return grid(['Category','Image','Position','Visibility','Action'],ordered(state.categories).map(c => [
    h(c.name),h(c.image || 'Category image'),h(c.position),badge(c.active ? 'Active' : 'Inactive'),link('A-11','Edit category',{id:c.id})
  ])) + panel(c ? `Edit ${c.name}` : 'New category',form('category',field('Category name','name',c?.name,'text','required') +
    asset('Category image','image',c?.image) + number('Display order','position',c?.position ?? state.categories.length+1) + active(c?.active),'Save category') + (c ? link('A-11','Cancel edit') : ''));
}
const stockLabel = x => x.stock <= 0 ? 'Out of stock' : x.stock <= x.threshold ? 'Low stock' : 'In stock';
function alertLabels(x) {
  const labels = x.stock <= x.threshold ? ['Low stock'] : [];
  if (x.expiry && x.expiry <= day(Date.now()+30*86400000)) labels.push(x.expiry < day(Date.now()) ? 'Expired' : 'Expires within 30 days');
  return labels;
}
function productList(id,p) {
  let rows = rowsFor(p), tools = '', headers, cells, editor = '', extra = '';
  const item = find(state.products,p.id);
  if (p.id && !item) return missing(id,'Back to list');
  if (id === 'A-09') {
    tools = actions(link('A-10','Add product'),link('A-11','Categories'),link('A-12','Import products'));
    headers = ['Product','SKU / barcode','Pack','Category','Selling price','Visibility','Action'];
    cells = x => [h(x.name),`${h(x.sku)}<br>${h(x.barcode)}`,h(x.pack),h(catName(x.category)),money(x.price),badge(x.active ? 'Active' : 'Inactive'),link('A-10','Edit product',{id:x.id})];
    extra = all('Visibility','active',p.active,[['true','Active'],['false','Inactive']]);
  } else if (id === 'A-13') {
    tools = actions(link('A-14','Stock IN'),link('A-15','Movement history'),link('A-17','Stock alerts'));
    extra = all('Availability','stock',p.stock,['In stock','Low stock','Out of stock']);
    rows = rows.filter(x => !p.stock || stockLabel(x) === p.stock);
    tools += `<div class="metric-grid">${metric('Matching SKUs',rows.length)}${metric('Available units',rows.reduce((n,x) => n+x.stock,0))}</div>`;
    headers = ['Product','SKU','Opening','Available','Threshold','Status','Action'];
    cells = x => [h(x.name),h(x.sku),h(x.opening),h(x.stock),h(x.threshold),badge(stockLabel(x)),actions(link('A-14','Receive',{id:x.id}),link('A-15','History',{productId:x.id}))];
  } else if (id === 'A-17') {
    extra = all('Alert type','alert',p.alert,['Low stock','Expired','Expires within 30 days','All products']);
    rows = rows.filter(x => p.alert === 'All products' || (p.alert ? alertLabels(x).includes(p.alert) : alertLabels(x).length));
    headers = ['Product','SKU','Available','Threshold','Best before','Alert','Action'];
    cells = x => [h(x.name),h(x.sku),h(x.stock),h(x.threshold),h(x.expiry || 'Not specified'),h(alertLabels(x).join(' · ') || 'None'),link(id,'Configure',{id:x.id})];
    if (item) editor = panel(`Alert settings · ${item.name}`,form('alert',number('Low-stock threshold','threshold',item.threshold) + field('Best before (optional)','expiry',item.expiry,'date'),'Save settings'));
  } else if (id === 'A-16') {
    headers = ['Product','SKU','Current barcode','Action'];
    cells = x => [h(x.name),h(x.sku),h(x.barcode || 'Not assigned'),link(id,'Manage label',{id:x.id})];
    if (item) editor = panel(`Label · ${item.name}`,form('barcode',field('Manufacturer or internal code','barcode',item.barcode,'text','required maxlength="80"') +
      '<button type="button" class="button" data-generate>Generate internal code</button>','Save barcode') +
      (item.barcode ? `<div class="ops-label"><strong>${h(item.name)}</strong><div>${h(item.pack)} · ${h(item.sku)}</div><code>${h(item.barcode)}</code><small>Sample barcode label · not scannable</small></div><button type="button" class="button" data-print>Print label preview</button>` : ''));
  } else {
    headers = ['Product','SKU','MRP','Selling price',...(admin() ? ['Purchase cost','Action'] : [])];
    cells = x => [h(x.name),h(x.sku),money(x.mrp),money(x.price),...(admin() ? [money(x.cost),link(id,'Edit prices',{id:x.id})] : [])];
    if (admin() && item) editor = panel(`Edit prices · ${item.name}`,form('pricing',priceFields(item),'Save prices'));
  }
  return tools + editor + productFilter(id,p,extra) + grid(headers,rows.map(cells));
}
function stockReceipt(p) {
  const item = find(state.products,p.id), rows = rowsFor(p);
  return productFilter('A-14',p) + panel('Simulated scanner',form('scan',field('Enter a barcode from the list below','barcode','','text','required'),'Match barcode')) + (item ? panel(`Receive ${item.name}`,`<p>${h(item.sku)} · ${h(item.pack)} · ${h(item.stock)} units available</p>` +
    form('receive',number('Number of cases or loose units','cases',1,1) + number('Units per case (1 for loose units)','units',1,1) +
    field('Receipt / reference','reference','','text','required'),'Review stock IN')) : '') +
    grid(['Product','SKU','Scan code','Available','Action'],rows.map(x => [h(x.name),h(x.sku),h(x.barcode),h(x.stock),link('A-14','Select product',{id:x.id,q:p.q || ''})]));
}
function movements(p) {
  const rows = state.movements.filter(m => {
    const x = find(state.products,m.productId);
    return (!p.productId || m.productId === p.productId) && inRange(m.date,p) &&
      (!p.direction || (m.qty > 0 ? 'IN' : 'OUT') === p.direction) && matches(p.q,m.reference,m.operator,x?.name,x?.sku);
  });
  return filters('A-15',search(p,'Reference, operator, product or SKU') + all('Product','productId',p.productId,state.products.map(x => [x.id,x.name])) +
    all('Direction','direction',p.direction,['IN','OUT']) + dates(p)) +
    grid(['Date (IST)','Product','Movement','Signed units','Reference','Operator'],rows.map(m => [
      h(dateText(m.date)),h(find(state.products,m.productId)?.name ?? m.productId),badge(m.qty > 0 ? 'IN' : 'OUT'),h(m.qty > 0 ? `+${m.qty}` : m.qty),h(m.reference),h(m.operator)
    ])) + actions(link('A-14','Stock IN'),link('A-13','Inventory overview'));
}

const localStamp = value => {
  if (!value) return '';
  if (/^\d{4}-\d\d-\d\d(T\d\d:\d\d)?$/.test(value)) return value.length === 10 ? `${value}T00:00` : value;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms+19800000).toISOString().slice(0,16) : '';
};
const promoStatus = x => !x.active ? 'Inactive' : x.start && Date.parse(x.start) > Date.now() ? 'Scheduled' : x.end && Date.parse(x.end) < Date.now() ? 'Ended' : 'Active';
function promotions(id,p) {
  const banner = id === 'A-20', rows = banner ? ordered(state.banners) : state.offers;
  const x = find(rows,p.id);
  if (p.id && !x) return missing(id,'Back to list');
  const kind = banner ? 'banner' : 'offer';
  return (banner ? link('C-01','Preview storefront') : link('A-24','Scheme performance')) +
    grid(['Title','Category destination','Schedule (IST)','Status',...(banner ? ['Slot / order'] : []),'Action'],rows.map(x => [
      h(x.title),h(catName(x.category) || 'All categories'),`${h(localStamp(x.start).replace('T',' ') || 'Any time')} → ${h(localStamp(x.end).replace('T',' ') || 'No end')}`,badge(promoStatus(x)),...(banner ? [`${h(x.slot || 'Brand')} · ${h(x.position)}`] : []),link(id,'Edit',{id:x.id})
    ])) + panel(x ? `Edit ${x.title}` : `New ${kind}`,form(kind,field('Title','title',x?.title,'text','required') +
      select('Category destination','category',x?.category,[['','All categories'],...cats()]) +
      (banner ? select('Slot','slot',x?.slot,['Brand','Regular offer','Current scheme']) + field('Description','description',x?.description) +
      asset('Desktop asset','image',x?.image) + asset('Mobile asset (optional)','mobileImage',x?.mobileImage) +
      number('Display order','position',x?.position ?? rows.length+1) : '') + field('Start (IST, optional)','start',localStamp(x?.start),'datetime-local') +
      field('End (IST, optional)','end',localStamp(x?.end),'datetime-local') + active(x?.active),`Save ${kind}`) + (x ? link(id,'Cancel edit') : ''));
}

const importKeys = ['sku','name','category','pack','mrp','price','stockIn'];
const csvCell = v => `"${String(v).replaceAll('"','""')}"`;
const sampleRow = () => ['DEMO-101','Sample rice',state.categories[0]?.id || 'pantry','1 kg',100,90,0];
function excelSampleRows() {
  const fresh = sampleRow();
  let suffix = 1;
  while (state.products.some(x => keyOf(x.sku) === keyOf(fresh[0]))) fresh[0] = `DEMO-XLSX-${suffix++}`;
  const rows = [fresh];
  state.products.slice(0,2).forEach((x,i) => rows.push([x.sku,x.name,x.category,x.pack,x.mrp,x.price,i === 0 ? 1 : 0]));
  rows.push(['DEMO-INVALID','Sample invalid row',fresh[2],'1 pack',10,12,0]);
  return rows;
}
function readCsv(text) {
  const input = text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const rows = [];
  let row = [], value = '', quoted = false, closed = false;
  for (let i=0; i<input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c !== '"') value += c;
      else if (input[i+1] === '"') { value += '"'; i++; }
      else { quoted = false; closed = true; }
    } else if (c === ',' || c === '\n') {
      row.push(value.trim()); value = ''; closed = false;
      if (c === '\n') { if (row.some(Boolean)) rows.push(row); row = []; }
    } else if (c === '"' && !value && !closed) quoted = true;
    else if (closed || c === '"') throw Error('Invalid CSV quoting. Use the downloadable template.');
    else value += c;
  }
  if (quoted) throw Error('An imported field has an unclosed quote.');
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.shift()?.join(',') !== importKeys.join(',')) throw Error('Use the template headers in their original order.');
  if (!rows.length || rows.length > 1000) throw Error('Choose a file containing 1–1,000 data rows.');
  return rows;
}
const requireThat = (ok,message) => { if (!ok) throw Error(message); };
const keyOf = v => String(v ?? '').trim().toLowerCase();
function prices(d) {
  const mrp = Number(d.mrp), price = Number(d.price);
  requireThat(d.mrp !== '' && d.price !== '' && Number.isFinite(price) && Number.isFinite(mrp) && price >= 0 && mrp >= price,'Enter non-negative prices; selling price cannot exceed MRP.');
  return {price,mrp};
}
function previewRows(rows) {
  const seen = new Set();
  return rows.map((values,i) => {
    const [sku,name,categoryKey,pack,mrp,price,qty] = values;
    try {
      requireThat(values.length === importKeys.length,'Wrong number of columns.');
      requireThat(sku && name && pack,'SKU, name and pack are required.');
      requireThat(!seen.has(keyOf(sku)),'Duplicate SKU in this file.');
      seen.add(keyOf(sku));
      const category = state.categories.find(c => [c.id,c.name].some(k => keyOf(k) === keyOf(categoryKey)));
      requireThat(category,'Unknown category.');
      const receipt = Number(qty);
      requireThat(Number.isSafeInteger(receipt) && receipt >= 0,'Stock IN must be a non-negative whole number.');
      const data = {sku,name,pack,category:category.id,...prices({mrp,price})};
      const existing = state.products.find(x => keyOf(x.sku) === keyOf(sku));
      requireThat(Number.isSafeInteger((existing?.stock || 0)+receipt),'Resulting stock is too large.');
      const status = !existing ? 'Insert' : receipt || Object.entries(data).some(([k,v]) => existing[k] !== v) ? 'Update' : 'Skip';
      return {row:i+2,sku,name,status,data,existing,receipt,note:status === 'Skip' ? 'Unchanged' : `${receipt} units IN`};
    } catch (e) { return {row:i+2,sku,name,status:'Error',note:e.message}; }
  });
}
function importPage() {
  const template = [importKeys.join(','),sampleRow().map(csvCell).join(',')].join('\r\n');
  return panel('1. Prepare a spreadsheet',`<p>Use an Excel-compatible UTF-8 CSV. Match existing products by SKU and categories by ID or name. Stock IN adds units; use 0 for catalogue-only rows.</p>
    <a class="button" download="lgm-products.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent(template)}">Download CSV template</a>`) +
    panel('2. Validate rows',form('preview','<label>Product spreadsheet (.csv or .xlsx)<input type="file" name="sheet" accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" aria-describedby="ops-sheet-help" required></label><p id="ops-sheet-help">CSV: previews your file’s rows (up to 1 MB). Excel (.xlsx): previews sample rows only. The selected workbook is never read or uploaded.</p>','Preview file') +
    '<button type="button" class="button" data-sample>Preview sample rows instead</button>') +
    '<section class="panel stack" data-preview aria-label="Import preview"><h2>3. Import preview</h2><p>Select a file or try the sample to see row-level results.</p></section>';
}
const importSummary = rows => ['Insert','Update','Skip','Error'].map(k => `${k}: ${rows.filter(r => r.status === k).length}`).join(' · ');
function showPreview(box,rows,source) {
  box.innerHTML = `<h2>3. ${h(source)} preview</h2><p>${h(importSummary(rows))}</p>` + grid(['Row','SKU','Name','Result','Details'],rows.map(r => [h(r.row),h(r.sku),h(r.name),badge(r.status),h(r.note)])) +
    '<p>Only valid new or changed rows will be applied.</p>' + `<button class="button button--primary" type="button" data-import ${rows.some(r => ['Insert','Update'].includes(r.status)) ? '' : 'disabled'}>Apply valid rows</button>`;
}
const newProduct = () => ({id:uid('product'),active:true,stock:0,opening:0,cost:0,threshold:5,barcode:'',image:'',description:''});
const renderers = {
  'A-02': dashboard, 'A-03': orders, 'A-04': orders, 'A-05': orders, 'A-06': orders,
  'A-07': returns, 'A-08': returns, 'A-09': productList, 'A-10': (_,p) => productSetup(p),
  'A-11': (_,p) => categories(p), 'A-12': importPage, 'A-13': productList, 'A-14': (_,p) => stockReceipt(p),
  'A-15': (_,p) => movements(p), 'A-16': productList, 'A-17': productList, 'A-18': productList,
  'A-19': promotions, 'A-20': promotions
};
export function operations(id,params={}) {
  if (!Object.hasOwn(renderers,id)) return empty('Unknown screen','Choose a screen from the navigation.');
  if (!canView(id)) return empty('Access restricted','This screen is not available to your demo role.') + link('A-01','Change demo role');
  return `<div class="ops stack" data-operations="${id}">${pageHead(...pages[id])}${renderers[id](id,params)}</div>`;
}
export function bindOperations(id,p={}) {
      if (!Object.hasOwn(renderers,id) || !canView(id)) return;
      const root = document.querySelector(`[data-operations="${id}"]`);
      if (!root) return;
      const box = root.querySelector('[data-preview]');
      let preview = null, version = 0, source = '';
      const ensureRole = () => requireThat(root.isConnected && canView(id),'Reopen this screen with a permitted role.');
      const confirm = (title,text,commit) => {
        let used = false;
        confirmAction(title,text,() => {
          if (used) return;
          used = true;
          ensureRole();
          commit();
        });
      };
      const resetPreview = () => {
        version++;
        preview = null;
        box.textContent = 'Select Preview file to validate the selected spreadsheet.';
      };
      root.onchange = event => { if (box && event.target.name === 'sheet') resetPreview(); };
      root.onsubmit = async event => {
        const f = event.target;
        if (!f.dataset.form) return;
        event.preventDefault();
        const error = f.querySelector('.ops-error');
        error.textContent = '';
        try {
          ensureRole();
          const data = new FormData(f);
          const d = Object.fromEntries([...data].map(([k,v]) => [k,typeof v === 'string' ? v.trim() : v]));
          switch (f.dataset.form) {
            case 'filter':
              requireThat(!d.from || !d.to || d.from <= d.to,'Through date must be on or after the from date.');
              go(id,Object.fromEntries(Object.entries(d).filter(([,v]) => v !== '')));
              break;
            case 'scan': {
              const item = state.products.find(x => x.barcode && keyOf(x.barcode) === keyOf(d.barcode));
              requireThat(item,'No matching barcode. Search by name or SKU instead.');
              go(id,{id:item.id,q:item.barcode}); break;
            }
            case 'receive': {
              const item = find(state.products,p.id), qty = Number(d.units)*Number(d.cases);
              requireThat(item && d.reference && [Number(d.units),Number(d.cases),qty].every(n => Number.isSafeInteger(n) && n > 0),'Choose a product, enter positive whole units and a receipt reference.');
              confirm('Confirm stock IN',`${item.name}: add ${qty} units (${d.cases} × ${d.units}). Balance: ${item.stock} → ${item.stock+qty}. Reference: ${d.reference}.`,() => {
                requireThat(Number.isSafeInteger(item.stock+qty),'The resulting balance is too large.');
                stockIn(item.id,qty,d.reference); toast(`Received ${qty} units of ${item.name}.`); go('A-15',{productId:item.id});
              });
              break;
            }
            case 'preview': {
              resetPreview();
              const at = version;
              if (/\.xlsx$/i.test(d.sheet?.name)) {
                source = 'Simulated Excel (sample rows only)';
                preview = previewRows(excelSampleRows());
                showPreview(box,preview,source); break;
              }
              requireThat(d.sheet?.size && d.sheet.size <= 1000000 && /\.csv$/i.test(d.sheet.name),'Select an .xlsx workbook for simulation or a non-empty CSV file up to 1 MB.');
              const text = await d.sheet.text();
              if (at !== version || !root.isConnected) return;
              source = 'CSV';
              preview = previewRows(readCsv(text)); showPreview(box,preview,source); break;
            }
            default: saveEditor(f.dataset.form,id,p,d);
          }
        } catch (e) { error.textContent = e.message; }
      };
      root.onclick = event => {
        const b = event.target.closest('button[type="button"]');
        if (!b) return;
        try {
          ensureRole();
          if (b.hasAttribute('data-step')) {
            const isReturn = id === 'A-08', status = b.dataset.step;
            const row = find(isReturn ? state.returns : state.orders,b.dataset.record);
            requireThat(fulfil() && row,'This action is not available.');
            const note = status === 'Accepted' ? 'Acceptance posts stock OUT for each order line.' : status === 'Credited' ? `This records a simulated ${money(row.amount)} wallet credit.` : 'This records a new history event.';
            confirm(actionLabels[status],`${row.id}: ${row.status} → ${status}. ${note}`,() => {
              (isReturn ? transitionReturn : transitionOrder)(row.id,status);
              toast(`${row.id} · ${status}`); refresh();
            });
          } else if (b.hasAttribute('data-generate')) {
            const input = b.form.elements.namedItem('barcode');
            input.value = uid('LGM').toUpperCase(); input.focus();
          } else if (b.hasAttribute('data-print')) window.print();
          else if (b.hasAttribute('data-sample')) {
            version++;
            const x = state.products[0];
            const sample = [sampleRow()];
            if (x) sample.push([x.sku,x.name,x.category,x.pack,x.mrp,x.price,0].map(String));
            sample.push(['INVALID','Sample invalid row','','1 pack','10','12','0']);
            source = 'Sample';
            preview = previewRows(sample); showPreview(box,preview,source);
          } else if (b.hasAttribute('data-import') && preview) {
            const rows = preview;
            const valid = rows.filter(r => r.status === 'Update' || r.status === 'Insert');
            const units = valid.reduce((n,r) => n+r.receipt,0);
            confirm('Apply product import',`${source}: ${importSummary(rows)}. Add ${units} units to warehouse stock. Rows marked Skip or Error will not change.`,() => {
              requireThat(rows === preview,'Preview the current file before importing.');
              preview = null;
              for (const r of valid) {
                const x = r.existing || newProduct();
                Object.assign(x,r.data);
                if (!r.existing) state.products.push(x);
                if (r.receipt) stockIn(x.id,r.receipt,`${source} import · ${r.sku}`);
              }
              const summary = importSummary(rows);
              log(`Product import · ${source} · ${summary}`); toast('Product import completed.');
              box.innerHTML = `<h2>Import complete</h2><p>${h(source)} · ${h(summary)}</p>` + actions(link('A-09','View catalogue'),link('A-15','Movement history'));
            });
          }
        } catch (e) { toast(e.message); }
      };
}

function saveEditor(kind,id,p,d) {
  const item = find(state.products,p.id);
  let dest = id, message;
  const uniqueProductKey = k => requireThat(!d[k] || !state.products.some(x => x !== item && keyOf(x[k]) === keyOf(d[k])),`This ${k} already belongs to another product.`);
  if (kind === 'product' || kind === 'pricing') {
    requireThat(kind === 'pricing' ? admin() && item : warehouse(),'You cannot edit this product.');
    const changes = prices(d);
    if (admin()) {
      requireThat(Number.isFinite(+d.cost) && +d.cost >= 0,'Enter a valid purchase cost.');
      changes.cost = +d.cost;
    }
    if (kind === 'product') {
      requireThat(d.name && d.sku && d.pack && find(state.categories,d.category),'Provide a name, SKU, pack and valid category.');
      uniqueProductKey('sku'); uniqueProductKey('barcode');
      for (const k of ['name','sku','pack','category','description','barcode','image']) changes[k] = d[k];
      changes.active = d.active === 'true';
      dest = 'A-09';
    }
    const target = item || newProduct();
    Object.assign(target,changes);
    if (!item) state.products.push(target);
    message = `${kind === 'pricing' ? 'Pricing' : 'Product'} saved · ${target.sku}`;
  } else if (kind === 'alert' || kind === 'barcode') {
    requireThat(item && warehouse(),'Select a product first.');
    if (kind === 'barcode') {
      requireThat(d.barcode,'Enter a barcode.');
      uniqueProductKey('barcode'); item.barcode = d.barcode;
    } else {
      requireThat(Number.isSafeInteger(+d.threshold) && +d.threshold >= 0,'Enter a valid threshold.');
      Object.assign(item,{threshold:+d.threshold,expiry:d.expiry});
    }
    message = `Saved ${kind} settings · ${item.sku}`;
  } else {
    const isCategory = kind === 'category', isBanner = kind === 'banner';
    requireThat(isCategory ? warehouse() : admin(),'Your role cannot change this record.');
    const rows = isCategory ? state.categories : isBanner ? state.banners : state.offers;
    const target = find(rows,p.id), changes = {active:d.active === 'true'};
    if (isCategory || isBanner) {
      requireThat(Number.isSafeInteger(+d.position) && +d.position >= 0,'Enter a valid display order.');
      Object.assign(changes,{image:d.image,position:+d.position});
    }
    if (isCategory) {
      requireThat(d.name && !rows.some(c => c !== target && keyOf(c.name) === keyOf(d.name)),'Enter a unique category name.');
      changes.name = d.name;
    } else {
      requireThat(d.title && (!d.category || find(state.categories,d.category)),'Enter a title and a valid destination.');
      requireThat(!d.start || !d.end || d.start <= d.end,'End must be on or after start.');
      Object.assign(changes,{title:d.title,category:d.category,start:d.start ? `${d.start}+05:30` : '',end:d.end ? `${d.end}+05:30` : ''});
      if (isBanner) Object.assign(changes,{description:d.description,mobileImage:d.mobileImage,slot:d.slot});
    }
    if (target) Object.assign(target,changes); else rows.push({id:uid(kind),...changes});
    message = `Saved ${kind} · ${changes.name || changes.title}`;
  }
  log(message); toast(message); go(dest,kind === 'barcode' ? {id:p.id} : {});
}
