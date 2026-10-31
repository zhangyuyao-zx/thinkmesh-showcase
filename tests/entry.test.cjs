const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const script=readFileSync(new URL('../script.js',`file://${__filename}`),'utf8');
function setup(fetch){
  const element=()=>({hidden:true,textContent:'',href:'',listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},removeAttribute(name){delete this[name];}});
  const official=element();official.href='https://thinkmesh.cn/login';official.hidden=false;
  const details=element();details.open=true;
  const status=element(),legacy=element(),copy=element();
  const ids={'entry-link':official,'entry-copy':copy,'legacy-entry':details,'entry-status':status,'legacy-entry-link':legacy};
  vm.runInNewContext(script,{document:{querySelectorAll:()=>[],getElementById:id=>ids[id]},URL,fetch,navigator:{clipboard:{writeText:async()=>{}}}});
  return {official,details,status,legacy,copy};
}
const response=data=>({ok:true,json:async()=>data});
test('official link works before any dynamic lookup',()=>{
  let requests=0;const state=setup(async()=>{requests++;throw Error('offline');});
  assert.equal(requests,0);assert.equal(state.official.href,'https://thinkmesh.cn/login');assert.equal(state.official.hidden,false);
});
test('ready tunnel remains available as a separate backup',async()=>{
  const state=setup(async()=>response({status:'ready',url:'https://354f9e1197bccf.lhr.life/login'}));
  await state.details.listeners.toggle();assert.equal(state.legacy.hidden,false);
  assert.equal(state.legacy.href,'https://354f9e1197bccf.lhr.life/login');
  assert.match(state.status.textContent,/配置标记/);assert.equal(state.official.href,'https://thinkmesh.cn/login');
});
test('API failure falls back to local receipt',async()=>{
  const calls=[];const state=setup(async url=>{calls.push(url);if(calls.length===1)throw Error('offline');return response({status:'ready',url:'https://example.localhost.run/login'});});
  await state.details.listeners.toggle();assert.equal(calls[1],'entry.json');assert.equal(state.legacy.hidden,false);
});
test('network failure keeps official link and does not claim tunnel is dead',async()=>{
  const state=setup(async()=>{throw Error('offline');});await state.details.listeners.toggle();
  assert.equal(state.legacy.hidden,true);assert.equal(state.official.href,'https://thinkmesh.cn/login');assert.match(state.status.textContent,/不表示.*一定失效/);
});
test('reject unready, insecure, credential-bearing and unapproved destinations',async()=>{
  for(const data of [{status:'pending',url:'https://safe.lhr.life/login'},...['http://safe.lhr.life/login','https://user:pass@safe.lhr.life/login','https://safe.lhr.life.evil.example/login','https://evil.example/login','https://safe.lhr.life:8443/login','javascript:alert(1)','not-a-url'].map(url=>({status:'ready',url}))]){
    const state=setup(async()=>response(data));await state.details.listeners.toggle();assert.equal(state.legacy.hidden,true);assert.equal(state.legacy.href,undefined);
  }
});
test('closing details does not fetch and reopening refreshes the receipt',async()=>{
  let calls=0;const state=setup(async()=>{calls++;return response({status:'ready',url:'https://safe.lhr.rocks/login'});});
  state.details.open=false;await state.details.listeners.toggle();assert.equal(calls,0);
  state.details.open=true;await state.details.listeners.toggle();await state.details.listeners.toggle();assert.equal(calls,2);
});
test('primary link is present in HTML without JS',()=>{
  const html=readFileSync(new URL('../experience.html',`file://${__filename}`),'utf8');
  assert.match(html,/<a id="entry-link"[^>]*href="https:\/\/thinkmesh.cn\/login"/);
  assert.doesNotMatch(html,/<a id="entry-link"[^>]*hidden/);
});
