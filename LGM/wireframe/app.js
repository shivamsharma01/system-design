import { screens } from './screens.js';
import { customer, bindCustomer } from './customer.js';
import { operations, bindOperations } from './operations.js';
import { office, bindOffice } from './office.js';
import { customerShell, adminShell, permitted, reviewerBar, login, denied, bindShell } from './shell.js';
import { gallery, bindGallery, systemScreen, bindSystem } from './studio.js';
import { esc, link, empty } from './ui.js';

const app=document.querySelector('#app');
const studioShell=content=>`${reviewerBar()}<main tabindex="-1" id="main" class="container page-body">${content}</main>`;
const notes = s=>`<details class="screen-meta"><summary>Screen notes · ${s.id} · ${esc(s.name)}</summary><p>${esc(s.group)} · ${esc(s.status)} · ${esc(s.classification)}. References: ${esc(s.refs.join(', '))}.</p><p>Proposed: layouts, sample roles and filters. Placeholder: business copy, illustrative prices, service areas and provider details.</p>${!s.id.startsWith('S')?`<div class="actions">${link(s.id,'Preview loading',{preview:'loading'})}${link(s.id,'Preview retry',{preview:'error'})}</div>`:''}</details>`;
function render(navigate=false) {
  const [route,query='']=location.hash.slice(1).split(/\?(.*)/s);
  const id=route.replace(/^\//,'')||'C-01', params=Object.fromEntries(new URLSearchParams(query));
  const s=screens.find(row=>row.id===id);
  const focus=document.activeElement;
  const key=focus && focus!==document.body && [...focus.attributes].find(a=>['id','aria-label'].includes(a.name)||a.name.startsWith('data-'));
  const dialog=document.querySelector('#dialog');
  if(dialog.open)dialog.close();
  if(id==='index'){
    app.innerHTML=studioShell(gallery());bindGallery();
  }else if(!s){
    app.innerHTML=studioShell(empty('Screen not found','Choose a screen from the review studio.')+link('index','Open screen index'));
  }else if(['loading','error'].includes(params.preview) && !id.startsWith('S') && (!id.startsWith('A') || permitted(id))){
    const loading=params.preview==='loading';
    const body=`<section class="panel stack"><p class="eyebrow">Screen state preview · ${s.id}</p><h1>${esc(s.name)}</h1>${loading?'<p role="status">Loading demo records…</p><span class="skeleton"></span><span class="skeleton"></span>':'<p role="alert">The demo records could not be loaded. Nothing has been changed.</p>'}<div>${link(id,loading?'Finish loading':'Retry')}</div></section>${notes(s)}`;
    app.innerHTML=id.startsWith('A')?adminShell(id,body):customerShell(body,{});
  }else if(id.startsWith('C')){
    app.innerHTML=customerShell(customer(id,params)+notes(s),params);bindCustomer(id,params);
  }else if(id.startsWith('A')){
    const allowed=permitted(id),n=Number(id.slice(2));
    app.innerHTML=adminShell(id,(!allowed?denied():n===1?login():n<=20?operations(id,params):office(id,params))+notes(s));
    if(allowed && n>1)(n<=20?bindOperations:bindOffice)(id,params);
  }else{
    app.innerHTML=studioShell(systemScreen(s)+notes(s));bindSystem(id);
  }
  bindShell(id);
  document.title=`${s?.name || (id==='index'?'Wireframe studio':'Screen not found')} · LGM Hub`;
  if(navigate){window.scrollTo(0,0);document.querySelector('#main').focus({preventScroll:true});}
  else if(key){[...app.querySelectorAll(focus.localName)].find(el=>el.getAttribute(key.name)===key.value)?.focus({preventScroll:true});}
}
document.querySelector('.skip-link').onclick=e=>{e.preventDefault();document.querySelector('#main').focus();};
document.addEventListener('error',e=>{
  const img=e.target;
  if(img instanceof HTMLImageElement && !img.hasAttribute('data-fallback')){
    img.dataset.fallback='';img.src='assets/images/unavailable.svg';img.alt=`${img.alt||'Product'} — image unavailable`;
  }
},true);
addEventListener('hashchange',()=>render(true));
addEventListener('lgm:refresh',()=>render());
render();
