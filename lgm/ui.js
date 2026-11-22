export const esc = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const currency = new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR', maximumFractionDigits:2, minimumFractionDigits:0});
export const money = n => currency.format(n);
export function href(id,params={}) {
  const query = new URLSearchParams(Object.entries(params).filter(([,v])=>v !== undefined && v !== null)).toString();
  return `#/${encodeURIComponent(id)}${query?'?'+query:''}`;
}
export const link = (id,label,params={}) => `<a class="button" href="${esc(href(id,params))}">${esc(label)}</a>`;
export const go = (id,params={}) => { const next=href(id,params); if(location.hash === next) refresh(); else location.hash=next; };
export const refresh = () => dispatchEvent(new Event('lgm:refresh'));
export function badge(text) {
  const variant = /pending|low stock|await/i.test(text) ? 'pending' : /approved|active$|accepted|delivered|credited/i.test(text) && !/inactive/i.test(text) ? 'success' : /rejected|failed|denied/i.test(text) ? 'error' : 'neutral';
  return `<span class="badge badge--${variant}">${esc(text)}</span>`;
}
export const pageHead = (title,description='') => `<header class="page-head"><h1>${esc(title)}</h1>${description?`<p>${esc(description)}</p>`:''}</header>`;
export const empty = (title,description) => `<section class="empty-state"><h2>${esc(title)}</h2><p>${esc(description)}</p></section>`;
export const table = (headers,rows) => `<div><p class="table-cue">Scroll the table sideways for all columns.</p><div class="table-shell" tabindex="0" role="region" aria-label="${esc(headers[0])} table"><table class="data-table"><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}">No matching records.</td></tr>`}</tbody></table></div></div>`;
let timer;
export function toast(text) {
  const el=document.querySelector('#toast');
  el.textContent=text;
  clearTimeout(timer); timer=setTimeout(()=>el.textContent='',4500);
}
const paths = {
  menu:'M3 6h18M3 12h18M3 18h18', close:'m6 6 12 12M18 6 6 18', search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  basket:'m3 10 2.5 10h13L21 10ZM7 10l5-7 5 7M9 13v4m6-4v4',
  person:'M4 21a8 8 0 0 1 16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  pin:'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0ZM14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', arrow:'M4 12h15m-6-6 6 6-6 6'
};
export const icon = key => `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[key]}"/></svg>`;
export function modal(title,body,drawer=false) {
  const el=document.querySelector('#dialog');
  if(el.open) el.close();
  el.classList.toggle('modal--drawer',drawer);
  el.innerHTML=`<div class="modal__head"><h2 id="dialog-title">${esc(title)}</h2><button type="button" aria-label="Close dialog" data-close>${icon('close')}</button></div>${body}`;
  el.querySelector('[data-close]').onclick=()=>el.close();
  el.onkeydown=event=>{if(event.key==='Escape'){event.preventDefault();el.close();}};
  el.showModal();
  return el;
}
export function confirmAction(title,text,callback) {
  const el=modal(title,`<div class="stack"><p>${esc(text)}</p><div class="actions"><button type="button" data-cancel>Cancel</button><button class="button--primary" type="button" data-confirm>Confirm</button></div></div>`);
  el.querySelector('[data-cancel]').onclick=()=>el.close();
  el.querySelector('[data-confirm]').onclick=()=>{el.close();try {callback();} catch(error){toast(error.message);}};
}
