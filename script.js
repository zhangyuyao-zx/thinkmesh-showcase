"use strict";
const demos={tutoring:{alt:"mino 核对学生的二次不等式步骤",caption:"先核对已做对的部分，再找到真正需要帮助的环节。"},geometry:{alt:"对话中的正方体与中点示意，区分可见棱和遮挡棱",caption:"把空间关系画清楚。示意图的投影长度与角度不自动成为题设条件。"},memory:{alt:"个人偏好、各科学习观察与来源管理页面",caption:"个人讲题偏好与各科学习表现分别保存，认识有来源，也能纠正。"}};
const tabs=Array.from(document.querySelectorAll("[data-demo]"));
function selectDemo(tab){const key=tab.dataset.demo,item=demos[key];if(!item)return;tabs.forEach(t=>{const chosen=t===tab;t.classList.toggle("active",chosen);t.setAttribute("aria-selected",String(chosen));t.tabIndex=chosen?0:-1;});const panel=document.getElementById("demo-panel"),img=document.getElementById("demo-image");panel.setAttribute("aria-labelledby",tab.id);img.src=`assets/${key}.jpg`;img.alt=item.alt;document.getElementById("demo-caption").textContent=item.caption;}
tabs.forEach((tab,i)=>{tab.addEventListener("click",()=>selectDemo(tab));tab.addEventListener("keydown",e=>{let next;if(e.key==="ArrowDown"||e.key==="ArrowRight")next=(i+1)%tabs.length;else if(e.key==="ArrowUp"||e.key==="ArrowLeft")next=(i+tabs.length-1)%tabs.length;else if(e.key==="Home")next=0;else if(e.key==="End")next=tabs.length-1;else return;e.preventDefault();tabs[next].focus();selectDemo(tabs[next]);});});
// The official link is static HTML so it remains available without JavaScript,
// a GitHub API response, or the independently maintained tunnel receipt.
const officialEntry=document.getElementById("entry-link");
const copy=document.getElementById("entry-copy");
if(copy&&officialEntry)copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(officialEntry.href);copy.textContent="已复制正式链接";}catch{copy.textContent="请长按或右键复制正式入口链接";}});
async function readEntry(){
  // Keep the live repository-first lookup for the existing rotating tunnel.
  try{const r=await fetch("https://api.github.com/repos/zhangyuyao-zx/thinkmesh-showcase/contents/entry.json",{cache:"no-store",credentials:"omit",headers:{Accept:"application/vnd.github.raw+json"}});if(!r.ok)throw new Error("Unavailable");return await r.json();}
  catch{const r=await fetch("entry.json",{cache:"no-store"});if(!r.ok)throw new Error("Unavailable");return await r.json();}
}
const legacyDetails=document.getElementById("legacy-entry"),legacyStatus=document.getElementById("entry-status"),legacyEntry=document.getElementById("legacy-entry-link");
let legacyLoading=false;
if(legacyDetails&&legacyStatus&&legacyEntry)legacyDetails.addEventListener("toggle",async()=>{
  if(!legacyDetails.open||legacyLoading)return;
  legacyLoading=true;legacyEntry.hidden=true;legacyEntry.removeAttribute("href");legacyStatus.textContent="正在读取备用入口配置…";
  try{
    const data=await readEntry();
    if(data.status!=="ready"||typeof data.url!=="string")throw new Error("Pending");
    const url=new URL(data.url);
    if(url.protocol!=="https:"||url.username||url.password||url.port||!/^[-a-z0-9]+\.(lhr\.life|localhost\.run|lhr\.rocks)$/i.test(url.hostname))throw new Error("Invalid entry");
    legacyEntry.href=url.href;legacyEntry.hidden=false;
    legacyStatus.textContent="备用配置标记为可用，实际连通性请以打开结果为准。已有账号请按原方式登录；建议优先使用正式网站。";
  }catch{legacyStatus.textContent="暂未取得可用的备用入口配置。请使用上方正式网站；这不表示原临时地址一定失效。";}
  finally{legacyLoading=false;}
});
