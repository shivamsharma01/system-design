import { state, serviceable } from './store.js';
import { screens } from './screens.js';
import { esc, icon, href, go, refresh, toast, modal } from './ui.js';

const roles = {
  Admin:null, Operations:[2,3,4,5,6,7,8,36], Inventory:[2,9,10,11,12,13,14,15,16,17], Support:[3,7,28,29]
};
export const permitted = id => id === 'A-01' || (Object.hasOwn(roles,state.role) && (roles[state.role] === null || roles[state.role].includes(Number(id.slice(2)))));
export const roleHome = () => state.role === 'Support' ? 'A-28' : 'A-02';
const brand = id => `<a class="brand" href="${href(id)}"><span class="brand__mark" aria-hidden="true">L</span><span>LGM Hub</span></a>`;
const navLink = (id,name,params,cls='') => `<a class="${cls}" href="${esc(href(id,params))}">${esc(name)}</a>`;
const activeCategories = () => state.categories.filter(c=>c.active).sort((a,b)=>a.position-b.position);
const categoryLinks = () => activeCategories().map(c=>navLink('C-03',c.name,{category:c.id})).join('');
const accountLinks = () => [['C-11','Profile'],['C-12','Address book'],['C-13','My orders'],['C-18','Wallet']].map(([id,n])=>navLink(id,n)).join('');
export const reviewerBar = () => `<nav class="review-bar" aria-label="Preview switcher"><div class="container review-bar__body"><span>Wireframe preview</span><div>${navLink('index','Screen index')}${navLink('C-01','Shop')}${navLink(roleHome(),'Admin')}</div></div></nav>`;
export function customerShell(content,params) {
  const count=Object.values(state.cart).reduce((a,b)=>a+b,0);
  return `${reviewerBar()}<header class="shop-header"><div class="container shop-header__body">
  <button type="button" class="compact-menu" data-menu aria-label="Open shop navigation" aria-expanded="false" aria-controls="dialog" aria-haspopup="dialog">${icon('menu')}</button>${brand('C-01')}
  <button type="button" class="pin-select" data-pin>${icon('pin')}<span>${esc(state.pin||'Set PIN')}</span></button>
  <form class="site-search" id="site-search"><label for="catalogue-query">Search the shop</label><div><input list="product-suggestions" type="search" name="q" id="catalogue-query" placeholder="Search groceries, household essentials…" value="${esc(params.q||'')}"><datalist id="product-suggestions"></datalist><button aria-label="Search catalogue">${icon('search')}</button></div></form>
  <a class="header-action" href="${href(state.verified?'C-11':'C-10')}" aria-label="My account">${icon('person')}<span>Account</span></a><a class="header-action" aria-label="Cart, ${count} units" href="${href('C-05')}">${icon('basket')}<b>${count}</b></a>
  </div><nav class="container shop-categories" aria-label="Departments">${navLink('C-02','All products')}${categoryLinks()}</nav></header>
  <main tabindex="-1" id="main" class="container page-body">${content}</main>
  <footer class="shop-footer"><div class="container footer-grid"><div class="stack">${brand('C-01')}<p class="muted">Everyday essentials from our online warehouse in Bahadurgarh.</p></div><section><h2>Shop</h2>${categoryLinks()}</section><section><h2>Your account</h2>${accountLinks()}</section><section><h2>Help & information</h2>${navLink('C-19','Contact us')}${Object.keys(state.content).filter(k=>k!=='contact').map(k=>navLink('C-20',k[0].toUpperCase()+k.slice(1),{slug:k})).join('')}</section></div></footer>`;
}
function adminNav(id) {
  const sections=screens.filter(s=>s.id.startsWith('A') && s.id!=='A-01' && permitted(s.id));
  return Object.entries(Object.groupBy(sections,s=>s.group)).map(([group,items])=>`<details class="nav-group" ${items.some(s=>s.id===id)?'open':''}><summary>${esc(group)}</summary>${items.map(s=>`<a ${s.id===id?'aria-current="page"':''} href="${href(s.id)}">${esc(s.name)}</a>`).join('')}</details>`).join('');
}
export function adminShell(id,content) {
  return `${reviewerBar()}<div class="admin-frame"><aside class="admin-side">${brand('A-02')}<p class="eyebrow">Operations workspace</p><nav aria-label="Admin sections">${adminNav(id)}</nav></aside><div>
  <header class="admin-top"><button class="compact-menu" data-menu aria-label="Open admin navigation" aria-expanded="false" aria-controls="dialog" aria-haspopup="dialog">${icon('menu')}</button><span>Online warehouse <b>/</b> ${esc(screens.find(s=>s.id===id)?.group||'Workspace')}</span><a class="button" href="${href('A-01')}" aria-label="Change demo staff role">${icon('person')}${esc(state.role || 'Sign in')}</a></header>
  <main tabindex="-1" class="page-body admin-main" id="main">${content}</main></div></div>`;
}
export function login() {
  return `<section class="panel stack sign-in"><p class="eyebrow">Bahadurgarh · Staff portal</p><h1>Enter the demo workspace</h1><p>Use a sample role to explore its permissions. No real credentials are used.</p><form class="stack" id="staff-login"><label>Demo access code<input name="code" required autocomplete="off" aria-describedby="access-hint"></label><small class="muted" id="access-hint">Use STAFF for this preview.</small><label>Preview role<select name="role">${Object.keys(roles).map(r=>`<option ${r===state.role?'selected':''}>${r}</option>`).join('')}</select></label><p role="alert" class="field-error"></p><button class="button--primary">Enter workspace</button></form></section>`;
}
export const denied = () => `<section class="panel stack"><p class="eyebrow">Role preview · Proposed</p><h1>Access restricted</h1><p>This workspace is not available to the selected staff role.</p><div class="actions">${navLink(roleHome(),'My workspace',{},'button')}${navLink('A-01','Switch role',{},'button')}</div></section>`;
export function openMenu(id) {
  const admin=id.startsWith('A');
  const trigger=document.activeElement;
  const el=modal(admin?'Workspace navigation':'Shop navigation',`<nav aria-label="Drawer navigation" class="drawer-nav">${admin?adminNav(id):`${navLink('C-01','Shop home')}${categoryLinks()}${accountLinks()}${navLink('C-05','Cart')}`}</nav>`,true);
  trigger?.setAttribute('aria-expanded','true');
  el.addEventListener('close',()=>trigger?.setAttribute('aria-expanded','false'),{once:true});
  el.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>el.close()));
}
export function bindShell(id) {
  document.querySelector('[data-menu]')?.addEventListener('click',()=>openMenu(id));
  document.querySelector('[data-pin]')?.addEventListener('click',()=>{
    const el=modal('Delivery area',`<form class="stack" id="pin-check"><p>Check availability for your six-digit PIN. Try ${esc(state.settings.pins[0])} or ${state.settings.pins.includes('110001')?'000000':'110001'}.</p><label>Delivery PIN code<input name="pin" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" value="${esc(state.pin)}"></label><button class="button--primary">Check serviceability</button><p role="status"></p></form>`);
    el.querySelector('form').onsubmit=e=>{
      e.preventDefault(); const pin=e.target.elements.pin.value;
      if (!serviceable(pin)) {el.querySelector('[role=status]').textContent='Not serviceable in this demo. Try another PIN.';return;}
      state.pin=pin; el.close(); refresh(); toast(`Delivery available to ${pin}`);
    };
  });
  const search=document.querySelector('#site-search');
  if(search) {
    search.onsubmit=e=>{e.preventDefault();go('C-02',{q:search.elements.q.value.trim()});};
    search.oninput=()=>{
      const q=search.elements.q.value.trim().toLowerCase();
      search.querySelector('datalist').innerHTML=q.length<3?'':state.products.filter(p=>p.active && activeCategories().some(c=>c.id===p.category) && `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q)).slice(0,6).map(p=>`<option value="${esc(p.name)}"></option>`).join('');
    };
  }
  const form=document.querySelector('#staff-login');
  if(form) form.onsubmit=e=>{e.preventDefault();if(form.elements.code.value.trim()!=='STAFF'){form.querySelector('[role=alert]').textContent='Access denied. Use the demo code STAFF.';return;}state.role=form.elements.role.value;go(roleHome());toast(`Previewing the ${state.role} role`);};
}
