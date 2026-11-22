import {esc, money, go, refresh, toast, confirmAction, link, badge, pageHead, empty} from './ui.js';
import {state, setQty, placeOrder, requestReturn, transitionOrder, subtotal, delivery, serviceable} from './store.js';

// All checkout drafts and simulated credentials are tab memory only.
let challenge, shipping, timer;
const e = value => esc(String(value ?? ''));
const find = (rows, id) => rows.find(row => String(row.id) === String(id));
const resolve = (rows, id) => id == null ? rows[0] : find(rows, id);
const sorted = rows => [...rows].sort((a,b) => a.position - b.position);
const categories = () => sorted(state.categories.filter(c => c.active));
const categoryOf = p => state.categories.find(c => c.id === p.category || c.name === p.category);
const visible = p => p?.active && categoryOf(p)?.active;
const products = () => state.products.filter(visible);
const panel = (heading, body) => `<section class="panel stack"><h2>${e(heading)}</h2>${body}</section>`;
const actions = (...items) => `<div class="actions">${items.join('')}</div>`;
const button = (name, label, value='', disabled=false) => `<button type="button" class="button" data-act="${name}" data-value="${e(value)}"${disabled?' disabled':''}>${e(label)}</button>`;
const submit = label => `<button class="button button--primary" type="submit">${e(label)}</button>`;
const form = (name, body) => `<form class="stack" data-form="${name}" autocomplete="off">${body}<p class="cu-error" role="alert"></p></form>`;
const option = (value,label,selected) => `<option value="${e(value)}"${String(selected)===String(value)?' selected':''}>${e(label)}</option>`;
const field = (name,label,value='',attrs='required') => `<label>${e(label)}<input name="${name}" value="${e(value)}" ${attrs}></label>`;
const select = (name,label,choices,selected) => `<label>${e(label)}<select name="${name}">${choices.map(([v,l])=>option(v,l,selected)).join('')}</select></label>`;
const note = text => `<p class="cu-note">${e(text)}</p>`;
const formattedDate = value => {
  const d = new Date(value);
  return Number.isNaN(+d) ? String(value ?? 'Date pending') : d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Kolkata'});
};
const timeline = history => history?.length ? `<ol class="cu-timeline">${history.map(h=>`<li><strong>${e(h.status)}</strong><small>${e(formattedDate(h.date))}</small></li>`).join('')}</ol>` : note('No events recorded yet.');
const browse = () => link('C-02','Browse products');
const missing = (title, back) => empty(title,'Choose another record to continue.') + back;
const avatar = (image,label,kind='product') => {
  // Only packaged local assets; text tokens from the mock catalogue are placeholders.
  const local = /^(?:\.\/)?(?:[\w-]+\/)*[\w.-]+\.(?:svg|png|webp|jpe?g)$/i.test(image || '');
  return `<div class="cu-art cu-art--${kind}">${local?`<img src="${e(image)}" alt="${e(label)}">`:`<span>${e(label)}</span>`}</div>`;
};
const price = p => `<div class="cu-price"><strong>${money(p.price)}</strong>${p.mrp>p.price?` <s aria-label="MRP">${money(p.mrp)}</s> <small>Save ${money(p.mrp-p.price)}</small>`:''}</div>`;
const limit = p => visible(p) ? Math.min(10,p.stock) : 0;
const quantity = id => Number(state.cart[id] || 0);
function stepper(p) {
  const n = quantity(p.id);
  if (!n) return button('more',p.stock>0?'Add to cart':'Out of stock',p.id,!limit(p));
  return `<div class="cu-step" role="group" aria-label="Quantity of ${e(p.name)}">${button('less','−',p.id)}<output>${e(n)}</output>${button('more','+',p.id,n>=limit(p))}</div>`;
}
function grid(rows) {
  if (!rows.length) return empty('No products found','Try another category, clear a filter, or search for a different product.')+browse();
  return `<div class="cu-grid">${rows.map(p=>`<article class="cu-card">${avatar(p.image,`${p.name} · ${p.pack}`)}<div class="cu-card__body"><h3>${link('C-04',p.name,{id:p.id})}</h3><small>${e(p.pack)}</small>${price(p)}${stepper(p)}</div></article>`).join('')}</div>`;
}
const categoryLinks = () => categories().map(c=>link('C-03',c.name,{category:c.id})).join('');
function scheduled(b) {
  const at = (value,end) => {
    if (!value) return end?Infinity:-Infinity;
    let s=String(value);
    if (/^\d{4}-\d\d-\d\d$/.test(s)) s+=end?'T23:59:59':'T00:00:00';
    if (/T/.test(s) && !/(Z|[+-]\d\d:\d\d)$/i.test(s)) s+='+05:30';
    return Date.parse(s);
  };
  return b.active && at(b.start,false)<=Date.now() && at(b.end,true)>=Date.now();
}
function featured(cats) {
  const rows=products(), groups=cats.map(c=>rows.filter(p=>categoryOf(p)===c).sort((a,b)=>(b.stock>0)-(a.stock>0)));
  const picks=[];
  for(let i=0;picks.length<8 && groups.some(g=>g[i]);i++) {
    for(const group of groups) if(group[i] && picks.length<8) picks.push(group[i]);
  }
  return picks;
}
const currentPromos=(rows,cats)=>rows.filter(b=>scheduled(b)&&(!b.category||find(cats,b.category)));
function offerCards(cats) {
  const offers=currentPromos(state.offers??[],cats);
  return offers.length?offers.map(o=>{
    const c=find(cats,o.category);
    return `<article class="cu-row"><div>${badge('Demo offer')}<h3>${e(o.title)}</h3></div>${c?link('C-03',`Shop ${c.name}`,{category:c.id}):browse()}</article>`;
  }).join(''):note('There are no current offers.');
}
const bannerSubjects = {
  'assets/images/banners/fruit-counter.jpg':'sliced citrus and red apples',
  'assets/images/banners/tea-break.jpg':'loose tea leaves and peppermint tea',
  'assets/images/banners/pantry-shelf.jpg':'bowls of rice, lentils and oats'
};
function home() {
  const cats=categories(), banners=sorted(currentPromos(state.banners,cats));
  return pageHead('Shop LGM Hub','Explore the online catalogue from our Bahadurgarh warehouse.') +
    (banners.length?`<section class="cu-banner stack" aria-label="Featured banners">${banners.map((b,i)=>`<article data-slide="${i}"${i?' hidden':''}>${avatar(b.image,[b.title,bannerSubjects[b.image]].filter(Boolean).join(': '),'banner')}<div class="cu-banner__copy"><small>${['Regular offer','Current scheme'].includes(b.slot)?'Demo offer':'In focus'} · ${i+1} / ${banners.length}</small><h2>${e(b.title)}</h2><p>${e(b.description)}</p>${b.category?link('C-03','Explore category',{category:b.category}):browse()}</div></article>`).join('')}${banners.length>1?actions(button('slide','Previous',-1),button('slide','Next',1)):''}</section>`:'')+
    panel('Shop by category',`<nav class="cu-strip">${cats.map(c=>`<div>${avatar(c.image,`${c.name} selection`,'mini')}${link('C-03',c.name,{category:c.id})}</div>`).join('')||'No categories yet.'}</nav>`)+
    panel('Featured products',grid(featured(cats))+browse())+
    panel('Offers',offerCards(cats));
}
function listing(id,p) {
  const isCategory=id==='C-03', cats=categories();
  const c=cats.find(c=>String(c.id)===p.category || c.name===p.category) || (!p.category && isCategory?cats[0]:null);
  const q=String(p.q || '').trim(), stock=p.stock==='1';
  const matches=products().filter(item=>[item.name,item.sku,categoryOf(item)?.name,item.category].join(' ').toLowerCase().includes(q.toLowerCase()));
  let rows=matches.filter(item=>(!(p.category||c) || (c && categoryOf(item)===c)) && (!stock || item.stock>0));
  if(p.sort==='low'||p.sort==='high') rows.sort((a,b)=>(a.price-b.price)*(p.sort==='low'?1:-1));
  if(p.sort==='new') rows.reverse(); // Catalogue insertion order is the proposed recency signal.
  const filters=form('filters',`<div class="form-grid">${!isCategory?field('q','Search products',q,'type="search" maxlength="100"'):''}${select('category','Category',[['','All categories'],...cats.map(c=>[c.id,c.name])],c?.id)}${select('sort','Sort by',[['','Relevance'],['low','Price: low to high'],['high','Price: high to low'],['new','Newest']],p.sort)}<label class="cu-check"><input type="checkbox" name="stock" value="1"${stock?' checked':''}>In stock only</label></div>${submit('Apply filters')}`);
  return pageHead(isCategory?(c?.name || 'Category unavailable'):'Search results',isCategory?'Shop this category by pack and price.':q?`Results for “${q}”`:'Explore all products.')+
    `<div class="${isCategory?'cu-listing':'stack'}">${isCategory?`<nav class="cu-rail" aria-label="Categories">${categoryLinks()}</nav>`:''}<div class="stack">${isCategory&&c?avatar(c.image,c.name,'banner'):''}<details class="panel" ${!isCategory?'open':''}><summary>Filter and sort</summary>${filters}</details>${!isCategory&&q.length>=3&&matches.length?panel('Suggestions',actions(...matches.slice(0,4).map(p=>link('C-04',p.name,{id:p.id})))):''}<p>${rows.length} products</p>${grid(rows)}</div></div>`;
}
function detail(params) {
  const p=resolve(products(),params.id);
  if(!p) return missing('Product unavailable',browse());
  const room=limit(p)-quantity(p.id);
  const gallery=`<section class="panel stack" aria-label="Product gallery"><div data-gallery>${avatar(p.image,`${p.name} · ${p.pack}`)}</div>${actions(button('view','Pack front'),button('view','Pack back'),button('view','Label detail'))}</section>`;
  return `<div class="cu-columns">${gallery}<div class="stack">${pageHead(p.name,p.pack)}${price(p)}${badge(p.stock>0?'In stock':'Out of stock')}<p>${e(p.description)}</p>${panel('Product information',`<p>SKU: ${e(p.sku)} · Category: ${e(categoryOf(p)?.name||p.category)}</p><p>Pack: ${e(p.pack)} · MRP: ${money(p.mrp)}</p>`)}${form('add',field('qty','Quantity',room>0?1:0,`type="number" required min="1" max="${Math.max(0,room)}"${room<=0?' disabled':''}`)+`<button class="button button--primary"${room<=0?' disabled':''}>${room>0?'Add to cart':p.stock?'Cart limit reached':'Out of stock'}</button>`)}${actions(link('C-05','View cart'),link('C-20','Return policy',{slug:'returns'}))}</div></div>`;
}
const cartEntries=()=>Object.entries(state.cart).filter(([,n])=>n!==0);
function cartError() {
  if(!cartEntries().length) return 'Your cart is empty.';
  for(const [id,n] of cartEntries()) {
    const p=find(state.products,id);
    if(!visible(p) || !Number.isInteger(n) || n<1 || n>limit(p)) return `Update or remove ${p?.name||'the unavailable item'} before checkout.`;
  }
  return '';
}
const totals=(sub,fee,total)=>`<dl class="cu-totals"><dt>Subtotal</dt><dd>${money(sub)}</dd><dt>Delivery charge</dt><dd>${money(fee)}</dd><dt>Total payable</dt><dd><strong>${money(total)}</strong></dd></dl>`;
const cartTotals=()=>totals(subtotal(),delivery(),subtotal()+delivery());
function cart() {
  const err=cartError();
  return pageHead('Your cart','Review quantities before checkout.')+(!cartEntries().length?empty('Your cart is empty','Add a product to start an order.')+browse():`<div class="cu-columns">${panel('Cart items',cartEntries().map(([id,n])=>{
    const p=find(state.products,id);
    return `<article class="cu-row"><div><strong>${visible(p)?link('C-04',p.name,{id}):e(p?.name||'Unavailable item')}</strong><p>${e(p?.pack)} · ${p?money(p.price):'Price unavailable'} × ${e(n)}</p></div>${p?stepper(p):''}${button('remove','Remove',id)}</article>`;
  }).join('')+browse())}${panel('Estimated total',err?note(err):cartTotals()+note('Sample delivery pricing; confirm your delivery PIN at checkout.')+link(state.verified?'C-07':'C-06','Continue to checkout'))}</div>`);
}

const accountNav=()=>`<nav aria-label="Demo account" class="cu-strip">${[['C-11','Profile'],['C-12','Addresses'],['C-13','Orders'],['C-18','Wallet']].map(([id,l])=>link(id,l)).join('')}</nav>`;
const privateMessage=(id,p={})=>note('Preview only. Sign in to use your demo account. Use fictional details only.')+
  link('C-10','Sign in with demo OTP',{next:id,...(p.id?{record:p.id}:{})});
const mobileField=(value='')=>field('phone','Mobile number (10 digits)',value,'type="tel" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" required');
function nextRoute(id,p) {
  if(id==='C-06') return ['C-07',{}];
  return [/^C-(07|08|09|1[1-8])$/.test(p.next)?p.next:'C-11',p.record?{id:p.record}:{}];
}
function otp(id,p) {
  const [next,params]=nextRoute(id,p);
  return pageHead(id==='C-06'?'Checkout · Verify mobile':'Sign in to your demo account','Simulated verification. No SMS is sent. Browsing does not require sign-in.')+
    panel(state.verified?'Mobile verified':challenge?'Enter your demo code':'Verify a mobile number',state.verified?
      link(next,'Continue',params):challenge?form('verify',note(`Demo code: 123456 · Mobile ending ${challenge.phone.slice(-4)}`)+
        field('otp','Six-digit demo code','','inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required')+
        '<small data-clock></small>'+submit('Verify code')+actions(button('resend','Resend code'),button('reset-phone','Change number'))):
      form('phone',mobileField()+note('Use a fictional 10-digit number, such as 9000000000.')+submit('Get demo code')));
}
const addressKeys=['name','phone','building','street','city','state','pin','landmark'];
const addressText=a=>a?`<address><strong>${e(a.name)}</strong><br>${e([a.building,a.street,a.landmark].filter(Boolean).join(', '))}<br>${e(a.city)}, ${e(a.state)} ${e(a.pin)}<br>${e(a.phone)}</address>`:note('No address selected.');
function addressError(a) {
  if(!a || !addressKeys.filter(k=>k!=='landmark').every(k=>String(a[k]??'').trim())) return 'Complete all required address fields.';
  if(!/^\d{10}$/.test(a.phone)) return 'Enter a 10-digit mobile number.';
  if(!/^\d{6}$/.test(a.pin) || !serviceable(a.pin)) return 'Enter a serviceable six-digit delivery PIN.';
  return '';
}
function addressForm(a={},checkout=false) {
  const labels={name:'Full name',building:'Building / house',street:'Street / area',city:'City',state:'State',landmark:'Landmark (optional)'};
  return form(checkout?'shipping':'address',`<div class="form-grid">${addressKeys.map(k=>k==='phone'?mobileField(a.phone):k==='pin'?
    field('pin','Delivery PIN (6 digits)',a.pin,'required inputmode="numeric" pattern="[0-9]{6}" maxlength="6"')+`<small data-pin aria-live="polite"></small>`:
    field(k,labels[k],a[k],`${k==='landmark'?'':'required'} maxlength="120"`)).join('')}</div>`+
    (checkout?'<label class="cu-check"><input type="checkbox" name="save"> Save to my address book</label>':'<label class="cu-check"><input type="checkbox" name="default"'+(a.default?' checked':'')+'> Default address</label>')+
    submit(checkout?'Continue to review':'Save address'));
}
const newAddress=()=>state.verified?{name:state.profile.name,phone:state.profile.phone,pin:state.pin}:{};
function checkoutAddress() {
  return pageHead('Checkout · Delivery address','Choose where your demo order should be delivered.')+
    (!state.verified?privateMessage('C-07'):'')+
    (cartError()?note(cartError())+link('C-05','Review cart'):'')+
    (state.verified&&state.addresses.length?panel('Saved addresses',state.addresses.map(a=>`<div class="cu-row">${addressText(a)}${button('use-address',a.default?'Use default address':'Use this address',a.id)}</div>`).join('')):'')+
    panel('Enter a shipping address',addressForm(state.verified&&shipping?shipping:newAddress(),true));
}
const lineItems=lines=>`<ul class="cu-lines">${lines.map(l=>`<li><span><strong>${e(l.name)}</strong><small>${money(l.price)} × ${e(l.qty)}</small></span><b>${money(l.price*l.qty)}</b></li>`).join('')}</ul>`;
function review() {
  const issue=cartError(), addr=state.verified?shipping:null;
  return pageHead('Checkout · Review and pay','This is a dummy payment. No card, bank details or money are involved.')+
    (!state.verified?privateMessage('C-08'):'')+`<div class="cu-columns"><div class="stack">${panel('Delivery address',addressText(addr)+link('C-07','Choose or change address'))}${panel('Order items',lineItems(cartEntries().map(([id,qty])=>({...find(state.products,id),qty})).filter(p=>p.name))+link('C-05','Edit cart'))}</div>`+
    panel('Dummy payment',(issue?note(issue):'')+(!issue?cartTotals():'')+(addressError(addr)?note('Choose a complete, serviceable shipping address before submitting.'):'')+
      form('payment',select('outcome','Simulated result',[['success','Successful payment'],['fail','Failed payment (test retry)']],'success')+
        `<button class="button button--primary"${issue||!state.verified||addressError(addr)?' disabled':''}>Submit demo order</button>`))+'</div>';
}
function profile() {
  return pageHead('My profile','Manage the contact details used in this demo.')+accountNav()+(!state.verified?privateMessage('C-11'):'')+
    panel('Contact details',form('profile',field('name','Full name',state.verified?state.profile.name:'','required maxlength="120"')+mobileField(state.verified?state.profile.phone:'')+submit('Save profile')))+(state.verified?actions(button('sign-out','Sign out')):'');
}
function addresses(p) {
  const rows=state.verified?state.addresses:[], a=p.edit?find(rows,p.edit):null;
  return pageHead('My addresses','Keep demo delivery locations in this session.')+accountNav()+(!state.verified?privateMessage('C-12'):'')+
    panel('Address book',rows.length?rows.map(a=>`<article class="cu-row">${addressText(a)}${a.default?badge('Default'):button('default','Make default',a.id)}${actions(link('C-12','Edit',{edit:a.id}),button('delete-address','Delete',a.id))}</article>`).join(''):empty('No saved addresses','Add a delivery address below.'))+
    panel(a?'Edit address':'Add address',addressForm(a||newAddress())+(a?link('C-12','Cancel edit'):''));
}

// Signed-out gallery previews use illustrative records, never personal account data.
const sampleOrder={id:'Example order',customer:'Sample customer',status:'Delivered',date:'2026-11-20',fee:35,total:155,
  lines:[{name:'Sample pantry pack',qty:1,price:120}],history:[{status:'Pending LGM Review',date:'2026-11-18'},{status:'Dispatched',date:'2026-11-19'},{status:'Delivered',date:'2026-11-20'}]};
const sampleReturn={id:'Example return',orderId:'Example order',status:'Pending review',date:'2026-11-21',reason:'Damaged packaging',amount:120,history:[{status:'Pending review',date:'2026-11-21'}]};
const orderLink=(id,label,o)=>link(id,label,!state.verified?{}:{id:o.id});
function orders(p) {
  const all=state.verified?state.orders:[sampleOrder], rows=all.filter(o=>!p.status||p.status===o.status);
  return pageHead('My orders','Review recent orders and their progress.')+accountNav()+(!state.verified?privateMessage('C-13'):'')+
    form('orders',select('status','Filter by status',[['','All statuses'],...Array.from(new Set(all.map(o=>o.status)),s=>[s,s])],p.status)+submit('Apply filter'))+
    (rows.length?rows.map(o=>panel(o.id,`${badge(o.status)}<p>${e(formattedDate(o.date))} · ${o.lines.length} line items · ${money(o.total)}</p>${orderLink('C-14','View order',o)}`)).join(''):empty('No matching orders','Choose another status or start shopping.')+browse());
}
const existingReturn=o=>state.returns.find(r=>r.orderId===o.id);
function returnIssue(o) {
  if(!o || o.status!=='Delivered') return 'Returns can be requested only after delivery.';
  if(existingReturn(o)) return 'A return request already exists for this order.';
  const stamp=Date.parse(o.history.filter(h=>h.status==='Delivered').at(-1)?.date);
  if(!Number.isFinite(stamp)||Date.now()-stamp>7*86400000) return 'The indicative seven-day return window is closed.';
  return '';
}
function orderFor(id,p) {
  if(!state.verified) return id==='C-09'?{...sampleOrder,status:'Pending LGM Review'}:sampleOrder;
  if(p.id!=null) return find(state.orders,p.id);
  if(id==='C-16') return state.orders.find(o=>!returnIssue(o))||state.orders[0];
  if(id==='C-15') return state.orders.find(o=>['Dispatched','Delivered','Delivery Failed','RTO'].includes(o.status))||state.orders[0];
  return state.orders[0];
}
function orderPage(id,p) {
  const o=orderFor(id,p);
  if(!o) return missing('Order not found',link('C-13','My orders'));
  const preview=!state.verified?privateMessage(id,p):'', header=(title,description)=>pageHead(title,description)+preview;
  const summary=panel('Order summary',lineItems(o.lines)+totals(o.total-o.fee,o.fee,o.total));
  if(id==='C-09') return header('Order received',`${o.id} · ${formattedDate(o.date)}`)+panel('What happens next?',note('Submission is not acceptance. LGM staff manually review each incoming order.')+badge(o.status)+actions(orderLink('C-14','View order details',o),browse()))+summary;
  if(id==='C-15') return header('Shipment details',o.id)+panel('Shipment progress',badge(o.status)+timeline(o.history))+
    panel('Courier information',note('Logistics partner and tracking reference: placeholders. Only status events are shown; live GPS tracking is not available.')+orderLink('C-14','Back to order',o));
  const ret=state.verified?existingReturn(o):null;
  if(id==='C-16') {
    const issue=state.verified?returnIssue(o):'';
    return header('Request a return',o.id)+panel('Eligibility',note('Indicative window: seven days after delivery. Items should be unused, unopened and packed. Product exceptions may apply.')+badge(o.status)+link('C-20','Read return policy',{slug:'returns'}))+
      (issue?panel('Request unavailable',note(issue)+(ret?link('C-17','View return status',{id:ret.id}):orderLink('C-14','Back to order',o))):
        panel('Return details',form('return',`<label>Reason<select name="reason" required>${[['','Choose a reason'],['Damaged packaging','Damaged packaging'],['Incorrect item','Incorrect item'],['Quality issue','Quality issue'],['Other','Other']].map(([v,l])=>option(v,l,'')).join('')}</select></label><label>Notes (optional)<textarea name="notes" maxlength="1000"></textarea></label><label>Photo (optional, simulated)<input type="file" name="photo" accept="image/*"></label><small>Selection only. Nothing is uploaded or stored.</small><label class="cu-check"><input type="checkbox" required name="condition"> Items are unused, unopened and packed.</label>`+submit('Submit return request'))));
  }
  const cancel=o.status==='Pending LGM Review';
  return header(`Order ${o.id}`,formattedDate(o.date))+accountNav()+summary+
    panel('Delivery and payment',addressText(o.address)+note('Demo payment only.')+orderLink('C-15','Shipment details',o))+
    panel('Order status',badge(o.status)+timeline(o.history)+actions(button('cancel-order','Cancel order',o.id,!cancel||!state.verified),ret?link('C-17','View return status',{id:ret.id}):orderLink('C-16','Return eligibility',o))+
      note(cancel?'You may cancel while the order awaits review.':'Cancellation is unavailable after review. Check return eligibility after delivery.'));
}
function returnStatus(p) {
  const r=state.verified?resolve(state.returns,p.id):sampleReturn;
  if(!r) return missing('No return request found',link('C-13','View orders'));
  return pageHead('Return status',`${r.id} · ${r.orderId}`)+(!state.verified?privateMessage('C-17',p):'')+
    panel('Request details',badge(r.status)+`<p>${e(r.reason)}</p><p>${e(r.notes)}</p><p>Indicative refund: ${money(r.amount)}</p>`+timeline(r.history))+
    panel('Pickup and refund',note('LGM reviews the request first. If approved, pickup and demo wallet credit appear as recorded events.')+actions(link('C-18','View LGM Wallet'),link('C-14','View order',state.verified?{id:r.orderId}:{})));
}
function wallet() {
  const rows=state.verified?state.wallet:[];
  return pageHead('LGM Wallet','Illustrative ledger only. No real funds are held or transferred.')+accountNav()+(!state.verified?privateMessage('C-18'):'')+
    panel('Demo balance',`<strong>${money(rows.reduce((s,r)=>s+Number(r.amount),0))}</strong>`)+
    panel('Transactions',rows.length?`<ul class="cu-lines">${rows.map(r=>`<li><span>${e(r.description)}<small>${e(formattedDate(r.date))}</small></span><b>${money(r.amount)}</b></li>`).join('')}</ul>`:empty('No transactions','Demo refund credits appear here when processed.'))+
    note('Proposed: promotional credit and redemption rules are not final.');
}
const policies={about:'About LGM Hub',terms:'Terms of sale',privacy:'Privacy',shipping:'Shipping',cancellation:'Cancellation and refunds',returns:'Return policy'};
function content(id,p) {
  if(id==='C-19') return pageHead('Contact us','Support contacts are placeholders for the wireframe.')+
    panel('Customer support',`<p>${e(state.content.contact)}</p><dl class="cu-totals"><dt>Phone</dt><dd>${e(state.settings?.phone||'Not configured')}</dd><dt>Email</dt><dd>${e(state.settings?.email||'Not configured')}</dd><dt>Address</dt><dd>${e(state.settings?.address||'Bahadurgarh warehouse (placeholder)')}</dd></dl>`+link('C-13','Find my order number'));
  const key=p.slug||p.page||'about';
  return pageHead('Policies and information','Placeholder wording for the prototype; not a final policy.')+
    `<nav class="cu-strip">${Object.entries(policies).map(([slug,title])=>link('C-20',title,{slug})).join('')}</nav>`+
    (Object.hasOwn(policies,key)?panel(policies[key],`<p class="cu-copy">${e(state.content[key])}</p>`):empty('Page not found','Choose a policy above.'))+link('C-19','Contact support');
}
const screens={
  'C-01':home,'C-02':listing,'C-03':listing,'C-04':(_,p)=>detail(p),'C-05':cart,
  'C-06':otp,'C-07':checkoutAddress,'C-08':review,'C-09':orderPage,'C-10':otp,
  'C-11':profile,'C-12':(_,p)=>addresses(p),'C-13':(_,p)=>orders(p),'C-14':orderPage,
  'C-15':orderPage,'C-16':orderPage,'C-17':(_,p)=>returnStatus(p),'C-18':wallet,
  'C-19':content,'C-20':content
};
export function customer(id,params={}) {
  return `<div class="customer-view stack" data-customer="${e(id)}">${screens[id]?.(id,params)??empty('Unknown screen','Return to the catalogue.')}</div>`;
}

function requireValue(test,message) { if(!test) throw Error(message); }
const requireSignIn=()=>requireValue(state.verified,'Sign in with the demo OTP first.');
const guardCart=()=>{const issue=cartError(); requireValue(!issue,issue);};
function saveAddress(data,edit) {
  requireSignIn();
  const old=edit?find(state.addresses,edit):null;
  requireValue(!edit||old,'This address is no longer available.');
  const row={...data,id:old?.id||`address-${crypto.randomUUID()}`,default:!state.addresses.length||Boolean(data.default)||Boolean(old?.default)};
  if(row.default) state.addresses.forEach(a=>{a.default=false;});
  if(old) Object.assign(old,row); else state.addresses.push(row);
  if(shipping?.id===row.id) shipping=null;
  return row;
}
function chooseShipping(a) {
  requireSignIn(); guardCart();
  const issue=addressError(a); requireValue(!issue,issue);
  shipping={...a}; state.pin=a.pin; go('C-08');
}
function startChallenge(phone) {
  requireValue(/^\d{10}$/.test(phone),'Enter a 10-digit mobile number.');
  challenge={phone,expires:Date.now()+300000,resend:Date.now()+30000};
  refresh();
}
function bindClock(root) {
  clearInterval(timer);
  const clock=root.querySelector('[data-clock]');
  if(!clock||!challenge) return;
  const tick=()=>{
    if(!root.isConnected||!challenge){clearInterval(timer);return;}
    const seconds=Math.max(0,Math.ceil((challenge.expires-Date.now())/1000));
    const wait=Math.max(0,Math.ceil((challenge.resend-Date.now())/1000));
    clock.textContent=seconds?`Code expires in ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:'Code expired. Request another code.';
    const resend=root.querySelector('[data-act="resend"]');
    resend.disabled=wait>0; resend.textContent=wait?`Resend in ${wait}s`:'Resend code';
  };
  tick();timer=setInterval(tick,1000);
}
function onAction(act,value,ctx,el) {
  const {root}=ctx;
  switch(act) {
    case 'slide': {
      const slides=[...root.querySelectorAll('[data-slide]')], current=slides.findIndex(s=>!s.hidden);
      slides[current].hidden=true; slides[(current+Number(value)+slides.length)%slides.length].hidden=false;break;
    }
    case 'view': {
      const label=el.textContent, p=resolve(products(),ctx.params.id);
      root.querySelector('[data-gallery]').innerHTML=avatar(label==='Pack front'?p?.image:null,`${p.name} · ${label}`);
      root.querySelectorAll('[data-act="view"]').forEach(b=>b.setAttribute('aria-pressed',String(el===b)));break;
    }
    case 'more': case 'less':
      setQty(value,quantity(value)+(act==='more'?1:-1));refresh();toast('Cart updated.');break;
    case 'remove':
      confirmAction('Remove cart item?','This item will be removed from the cart.',()=>{
        if(find(state.products,value)) setQty(value,0);
        else delete state.cart[value]; // A stale cart entry no longer has a catalogue record.
        refresh();toast('Item removed.');
      });break;
    case 'resend':
      requireValue(challenge&&Date.now()>=challenge.resend,'Wait for the resend timer.');startChallenge(challenge.phone);toast('New demo code ready.');break;
    case 'reset-phone':challenge=null;refresh();break;
    case 'sign-out':
      confirmAction('Sign out?','Your guest cart will remain available.',()=>{
        state.verified=false;challenge=null;shipping=null;go('C-01');toast('Signed out.');
      });break;
    case 'default': {
      requireSignIn();const a=find(state.addresses,value);requireValue(a,'Address no longer available.');
      state.addresses.forEach(row=>{row.default=row===a;});refresh();toast('Default address updated.');break;
    }
    case 'delete-address':
      confirmAction('Delete saved address?','Orders already placed will retain their delivery address.',()=>{
        requireSignIn();const index=state.addresses.findIndex(a=>String(a.id)===value);
        requireValue(index>=0,'Address no longer available.');
        const [removed]=state.addresses.splice(index,1);
        if(removed.default&&state.addresses.length) state.addresses[0].default=true;
        if(shipping?.id===removed.id) shipping=null;
        go('C-12');toast('Address deleted.');
      });break;
    case 'use-address':chooseShipping(find(state.addresses,value));break;
    case 'cancel-order':
      confirmAction('Cancel order?','This is available only while the order awaits LGM review.',()=>{
        requireSignIn();requireValue(find(state.orders,value)?.status==='Pending LGM Review','Cancellation is unavailable.');
        transitionOrder(value,'Cancelled');refresh();toast('Order cancelled.');
      });break;
  }
}
function onSubmit(kind,f,ctx) {
  const {id,params}=ctx;
  const data=new FormData(f),get=k=>String(data.get(k)??'').trim();
  switch(kind) {
    case 'filters': {
      const next=Object.fromEntries([...data].filter(([,v])=>v!==''));
      go(id==='C-03'&&!next.category?'C-02':id,next);break;
    }
    case 'orders':go(id,get('status')?{status:get('status')}:{});break;
    case 'add':{
      const p=resolve(products(),params.id), n=Number(get('qty'));
      requireValue(p&&Number.isSafeInteger(n)&&n>0,'Choose a positive whole quantity.');
      setQty(p.id,quantity(p.id)+n);refresh();toast('Added to cart.');break;
    }
    case 'phone':startChallenge(get('phone'));break;
    case 'verify': {
      requireValue(challenge&&challenge.expires>Date.now(),'The demo code expired. Select resend.');
      requireValue(get('otp')==='123456','Incorrect demo code. Try 123456.');
      state.profile.phone=challenge.phone;state.verified=true;challenge=null;
      go(...nextRoute(id,params));toast('Demo mobile verified.');break;
    }
    case 'profile':
      requireSignIn();requireValue(get('name')&&/^\d{10}$/.test(get('phone')),'Enter a name and a 10-digit mobile number.');
      Object.assign(state.profile,{name:get('name'),phone:get('phone')});refresh();toast('Profile saved.');break;
    case 'address':case 'shipping':{
      requireSignIn();
      const a=Object.fromEntries(addressKeys.map(k=>[k,get(k)]));
      const issue=addressError(a);requireValue(!issue,issue);
      if(kind==='address') {
        saveAddress({...a,default:data.has('default')},params.edit);go('C-12');toast('Address saved.');
      } else {
        guardCart();chooseShipping(data.has('save')?saveAddress(a):a);
      }
      break;
    }
    case 'payment': {
      requireSignIn();guardCart();const issue=addressError(shipping);requireValue(!issue,issue);
      requireValue(get('outcome')==='success','Dummy payment failed. Select a successful result and retry. No order was placed.');
      const order=placeOrder(shipping);shipping=null;go('C-09',{id:order.id});toast('Order received for review.');break;
    }
    case 'return': {
      requireSignIn();const o=find(state.orders,ctx.orderId);
      const issue=returnIssue(o);requireValue(!issue,issue);
      requireValue(get('reason')&&data.has('condition'),'Choose a reason and confirm the item condition.');
      const photo=data.get('photo');
      requireValue(!photo?.size||photo.type.startsWith('image/'),'Select an image for the simulated photo.');
      const r=requestReturn(o.id,get('reason'),get('notes'));go('C-17',{id:r.id});toast('Return requested.');break;
    }
  }
}
export function bindCustomer(id,params={}) {
  const root=document.querySelector('.customer-view[data-customer]');
  if(!root||root.dataset.customer!==id) return;
  const ctx={id,params,root,orderId:id==='C-16'?orderFor(id,params)?.id:null};
  bindClock(root);
  root.onclick=event=>{
    const b=event.target.closest('[data-act]');if(!b||b.disabled) return;
    try {onAction(b.dataset.act,b.dataset.value,ctx,b);} catch(err){toast(err.message);}
  };
  root.onsubmit=event=>{
    const f=event.target.closest('form[data-form]');if(!f) return;
    event.preventDefault();
    if(!f.reportValidity()||!root.isConnected) return;
    const error=f.querySelector('[role="alert"]');
    try {error.textContent='';onSubmit(f.dataset.form,f,ctx);} catch(err){error.textContent=err.message;toast(err.message);}
  };
  const pin=root.querySelector('input[name="pin"]'),hint=root.querySelector('[data-pin]');
  if(pin&&hint) {
    const feedback=()=>{hint.textContent=pin.value.length===6?(serviceable(pin.value)?'Delivery available.':'This PIN is not serviceable.'):'Enter a six-digit PIN to check delivery.';};
    pin.oninput=feedback;feedback();
  }
}
