"use strict";
const demos={tutoring:{alt:"mino 核对学生的二次不等式步骤",caption:"先核对已做对的部分，再找到真正需要帮助的环节。"},geometry:{alt:"对话中的正方体与中点示意，区分可见棱和遮挡棱",caption:"把空间关系画清楚。示意图的投影长度与角度不自动成为题设条件。"},memory:{alt:"个人偏好、各科学习观察与来源管理页面",caption:"个人讲题偏好与各科学习表现分别保存，认识有来源，也能纠正。"}};
const tabs=Array.from(document.querySelectorAll("[data-demo]"));
function selectDemo(tab){const key=tab.dataset.demo,item=demos[key];if(!item)return;tabs.forEach(t=>{const chosen=t===tab;t.classList.toggle("active",chosen);t.setAttribute("aria-selected",String(chosen));t.tabIndex=chosen?0:-1;});const panel=document.getElementById("demo-panel"),img=document.getElementById("demo-image");panel.setAttribute("aria-labelledby",tab.id);img.src=`assets/${key}.jpg`;img.alt=item.alt;document.getElementById("demo-caption").textContent=item.caption;}
tabs.forEach((tab,i)=>{tab.addEventListener("click",()=>selectDemo(tab));tab.addEventListener("keydown",e=>{let next;if(e.key==="ArrowDown"||e.key==="ArrowRight")next=(i+1)%tabs.length;else if(e.key==="ArrowUp"||e.key==="ArrowLeft")next=(i+tabs.length-1)%tabs.length;else if(e.key==="Home")next=0;else if(e.key==="End")next=tabs.length-1;else return;e.preventDefault();tabs[next].focus();selectDemo(tabs[next]);});});
const status=document.getElementById("entry-status"),entry=document.getElementById("entry-link");
const copy=document.getElementById("entry-copy");
if(copy&&entry)copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(entry.href);copy.textContent="已复制体验链接";}catch{copy.textContent="请长按或右键复制进入链接";}});
async function readEntry(){
  // Query the public repository's current receipt so rotating tunnel addresses
  // do not wait for a Pages rebuild or its static-file cache.
  try{const r=await fetch("https://api.github.com/repos/zhangyuyao-zx/thinkmesh-showcase/contents/entry.json",{cache:"no-store",credentials:"omit",headers:{Accept:"application/vnd.github.raw+json"}});if(!r.ok)throw new Error("Unavailable");return await r.json();}
  catch{const r=await fetch("entry.json",{cache:"no-store"});if(!r.ok)throw new Error("Unavailable");return await r.json();}
}
if(status&&entry){readEntry().then(data=>{if(data.status!=="ready"||typeof data.url!=="string")throw new Error("Pending");const url=new URL(data.url);if(url.protocol!=="https:"||url.username||url.password||!/^[-a-z0-9]+\.(lhr\.life|localhost\.run|lhr\.rocks)$/i.test(url.hostname))throw new Error("Invalid entry");entry.href=url.href;entry.hidden=false;if(copy)copy.hidden=false;status.textContent="临时体验入口已开放。已有账号可直接登录；新用户请先向项目作者取得邀请码。";}).catch(()=>{status.textContent="临时入口当前暂不可用，请稍后刷新此页。功能介绍和截图可以正常浏览。";});}
