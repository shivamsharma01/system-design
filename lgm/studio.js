import { screens } from './screens.js';
import { state } from './store.js';
import { esc, href, pageHead, link, empty, toast, confirmAction } from './ui.js';
import { openMenu, denied } from './shell.js';

const groups = {C:'Customer website', A:'Admin portal', S:'Shared states'};
function sample(s) {
  if (['C-15','C-16'].includes(s.id)) return {id:state.orders.find(o=>o.status==='Delivered')?.id};
  if (['C-09','C-14','A-04'].includes(s.id)) return {id:state.orders[0]?.id};
  if (['C-17','A-08'].includes(s.id)) return {id:state.returns[0]?.id};
  if (['C-04','A-10'].includes(s.id)) return {id:state.products[0]?.id};
  return {};
}
function tiles(q,group) {
  const matches=screens.filter(s=>(!group||s.id.startsWith(group))&&`${s.name} ${s.group} ${s.id} ${s.refs.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase()));
  return `<p role="status">${matches.length} screens</p><div class="screen-grid">${matches.map(s=>`<a class="screen-tile panel" href="${esc(href(s.id,sample(s)))}"><span class="eyebrow">${s.id} · ${esc(s.group)}</span><h2>${esc(s.name)}</h2><p class="muted">${esc(s.brief)}</p><span class="badge">${esc(s.status)} · ${esc(s.classification)}</span></a>`).join('')||empty('No matching screens','Try an ID, a requirement reference or a different module.')}</div>`;
}
export function gallery() {
  return `<div class="studio"><header class="studio__intro"><p class="eyebrow">LGM Hub / Design review</p><h1>Wireframe studio</h1><p>Explore the shop and the warehouse that fulfils its orders. Changes are shared across previews in this tab and reset on reload.</p><div class="actions">${link('C-01','Open customer website')}${link('A-02','Open admin portal')}</div></header><div class="panel form-grid"><label>Find a screen or requirement<input type="search" id="studio-query" placeholder="e.g. stock IN, A-04, ORD-005"></label><label>Experience<select id="studio-group"><option value="">All experiences</option>${Object.entries(groups).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label></div><div class="stack" id="studio-results">${tiles('','')}</div></div>`;
}
export function bindGallery() {
  const q=document.querySelector('#studio-query'),g=document.querySelector('#studio-group'),update=()=>document.querySelector('#studio-results').innerHTML=tiles(q.value,g.value);
  q.oninput=update;g.onchange=update;
}
const examples={
  'S-01':`<div class="panel stack" aria-busy="true"><p>Loading the catalogue…</p><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span></div><button data-demo>Complete demo load</button>`,
  'S-02':`${empty('Your cart is empty','Find something for your next grocery shop.')}${link('C-02','Browse the catalogue')}`,
  'S-03':'<form class="panel stack" novalidate><p class="field-error" role="alert">Check the highlighted delivery field.</p><label>Delivery PIN<input name="pin" inputmode="numeric" maxlength="6" aria-invalid="true" aria-describedby="pin-error" required></label><small id="pin-error" class="field-error">Enter a six-digit PIN.</small><button>Validate PIN</button></form>',
  'S-04':'<div class="panel stack"><h2>Shipment events could not be loaded</h2><p>In this example, the provider is temporarily unavailable. Your order has not changed.</p><button data-demo>Retry loading</button></div>',
  'S-05':'<div class="panel stack"><p>Preview the confirmation step before changing a warehouse balance. This example will not post a movement.</p><button data-demo>Preview stock change</button></div>',
  'S-06':denied,
  'S-07':'<div class="panel stack"><p>Action feedback is announced without moving keyboard focus.</p><button data-demo>Show success message</button></div>',
  'S-08':'<div class="panel stack"><p>Open the same drawer used on smaller screens. Press Escape to dismiss and return to this control.</p><button data-demo>Open navigation</button></div>'
};
export function systemScreen(s) {
  const example=examples[s.id];
  return `${pageHead(s.name,'Interactive component preview')}<div class="stack" id="example">${typeof example==='function'?example():example}</div>`;
}
export function bindSystem(id) {
  const el=document.querySelector('#example');
  const result=text=>el.innerHTML=`<div class="panel stack" role="status"><h2>${esc(text)}</h2>${link('index','Return to studio')}</div>`;
  if(id==='S-03') el.querySelector('form').onsubmit=e=>{
    e.preventDefault();if(/^\d{6}$/.test(e.target.elements.pin.value)){result('PIN format is valid');}else{e.target.elements.pin.focus();}
  };
  const button=el.querySelector('[data-demo]');
  if(button) button.onclick=()=>{
    if(id==='S-01')result('Catalogue ready');
    if(id==='S-04')result('Shipment events available');
    if(id==='S-05')confirmAction('Confirm stock change?','This is a component preview; no stock will be changed.',()=>result('Change confirmed'));
    if(id==='S-07')toast('Demo changes saved.');
    if(id==='S-08')openMenu('C-01');
  };
}
