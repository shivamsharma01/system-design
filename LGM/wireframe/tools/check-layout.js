// Run against the local preview with: node tools/check-layout.js http://127.0.0.1:4173
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import assert from 'node:assert/strict';

const origin = new URL(process.argv[2] || 'http://127.0.0.1:4173');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(origin.hostname),'Use a local preview URL.');
const profile = await mkdtemp(join(tmpdir(),'lgm-layout-'));
const configuredBrowser=process.env.CHROME_BIN;
const executable=configuredBrowser && (!configuredBrowser.includes('/') || existsSync(configuredBrowser)) ? configuredBrowser : 'chromium';
const browser = spawn(executable, [
  '--headless','--disable-gpu','--disable-background-networking','--disable-ipc-flooding-protection','--no-first-run',
  `--user-data-dir=${profile}`,'--remote-debugging-pipe','about:blank'
], {stdio:['ignore','ignore','ignore','pipe','pipe']});
const finished=once(browser,'exit');
const pending=new Map(), errors=[];
let sequence=0,buffer='',session;
function call(method,params={},attached=true){
  return new Promise((resolve,reject)=>{
    const id=++sequence;
    const timeout=setTimeout(()=>{pending.delete(id);reject(Error(`Timed out: ${method}`));},20000);
    pending.set(id,msg=>{clearTimeout(timeout);msg.error?reject(Error(msg.error.message)):resolve(msg.result);});
    browser.stdio[3].write(JSON.stringify({id,method,params,sessionId:attached?session:undefined})+'\0');
  });
}
browser.stdio[4].setEncoding('utf8');
browser.stdio[4].on('data',chunk=>{
  buffer+=chunk;
  while(buffer.includes('\0')){
    const b=buffer.indexOf('\0'),msg=JSON.parse(buffer.slice(0,b)); buffer=buffer.slice(b+1);
    if(msg.id){pending.get(msg.id)?.(msg);pending.delete(msg.id);}
    if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.exception?.description||msg.params.exceptionDetails.text);
    if(msg.method==='Log.entryAdded'&&msg.params.entry.level==='error')errors.push(msg.params.entry.text);
  }
});
async function evaluate(expression){
  const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
  return result.result.value;
}
try{
  const {targetId}=await call('Target.createTarget',{url:'about:blank'},false);
  session=(await call('Target.attachToTarget',{targetId,flatten:true},false)).sessionId;
  await call('Page.enable');await call('Runtime.enable');await call('Log.enable');
  await call('Page.navigate',{url:`${origin.origin}/#/index`});
  for(let i=0;i<100 && !await evaluate("Boolean(document.querySelector('.screen-tile'))");i++)await new Promise(r=>setTimeout(r,60));
  const routes=await evaluate("[...document.querySelectorAll('.screen-tile')].map(a=>a.hash)");
  assert.equal(routes.length,64,`Gallery did not render 64 screens. ${errors.join('; ')}`);
  routes.unshift('#/index');
  let checks=0;
  for(const width of [360,390,430,768,834,1024,1280,1440]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:width<768?844:1000,deviceScaleFactor:1,mobile:false});
    const issues=await evaluate(`(async()=>{
      const issues=[];
      for(const hash of ${JSON.stringify(routes)}) {
        if(location.hash!==hash) await new Promise(resolve=>{addEventListener('hashchange',resolve,{once:true});location.hash=hash;});
        const main=document.querySelector('#main');
        const w=document.documentElement.scrollWidth;
        if(w>innerWidth)issues.push(hash+' page width '+w);
        if(!main?.innerText.trim() || (hash!=='#/index'&&!main.querySelector('.screen-meta')?.textContent.includes(hash.slice(2,6))))issues.push(hash+' screen not rendered');
        const images=[...document.images];
        for(const img of images)img.loading='eager';
        await Promise.all(images.map(img=>img.decode().catch(()=>issues.push(hash+' failed image '+img.getAttribute('src')))));
        if(images.some(img=>img.hasAttribute('data-fallback')))issues.push(hash+' unexpected fallback image');
      }
      return issues;
    })()`);
    errors.push(...issues.map(msg=>`${width}px: ${msg}`));
    checks+=routes.length;
    console.log(`${width}px: ${routes.length} routes, ${issues.length} layout/image errors`);
  }
  assert.deepEqual([...new Set(errors)],[]);
  console.log(`${checks} responsive route checks passed in Chromium.`);
}finally{
  await call('Browser.close',{},false).catch(()=>browser.kill());
  await finished;
  await rm(profile,{recursive:true,force:true});
}
