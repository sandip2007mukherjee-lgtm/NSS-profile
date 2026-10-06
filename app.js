const $ = id => document.getElementById(id);
const state = { members: [], photos: {}, heroPhoto: "", leaderPhoto: "" };

function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function readImage(file, cb){ if(!file)return; const r=new FileReader(); r.onload=()=>cb(r.result); r.readAsDataURL(file); }

function makeMember(i){
  return {name:`MEMBER NAME ${i}`, mobile:`98765432${String(10+i).padStart(2,"0")}`, semester:"5TH SEM", subject:"YOUR SUBJECT", photo:"", zoom:1,x:0,y:0};
}
function ensureMembers(n){
  while(state.members.length<n) state.members.push(makeMember(state.members.length+1));
  state.members.length=n;
  renderForms(); renderMembers();
}
function renderForms(){
  const box=$("memberForms"); box.innerHTML="";
  state.members.forEach((m,i)=>{
    const wrap=document.createElement("div");wrap.className="member-form";
    wrap.innerHTML=`
      <h3>Member ${i+1}</h3>
      <label>Name<input data-k="name" data-i="${i}" value="${esc(m.name)}"></label>
      <div class="grid2">
        <label>Mobile<input data-k="mobile" data-i="${i}" value="${esc(m.mobile)}"></label>
        <label>Semester<input data-k="semester" data-i="${i}" value="${esc(m.semester)}"></label>
      </div>
      <label>Subject<input data-k="subject" data-i="${i}" value="${esc(m.subject)}"></label>
      <label>Photo<input data-photo="${i}" type="file" accept="image/*"></label>
      <div class="grid2">
        <label>Zoom<input data-zoom="${i}" type="range" min=".65" max="2.3" step=".01" value="${m.zoom}"></label>
        <label>X<input data-x="${i}" type="range" min="-100" max="100" value="${m.x}"></label>
      </div>
      <label>Y<input data-y="${i}" type="range" min="-100" max="100" value="${m.y}"></label>`;
    box.appendChild(wrap);
  });
  box.querySelectorAll("[data-k]").forEach(el=>el.addEventListener("input",e=>{const i=+e.target.dataset.i,k=e.target.dataset.k;state.members[i][k]=e.target.value;renderMembers()}));
  box.querySelectorAll("[data-photo]").forEach(el=>el.addEventListener("change",e=>readImage(e.target.files[0],src=>{state.members[+e.target.dataset.photo].photo=src;renderMembers()})));
  box.querySelectorAll("[data-zoom]").forEach(el=>el.addEventListener("input",e=>{state.members[+e.target.dataset.zoom].zoom=+e.target.value;renderMembers()}));
  box.querySelectorAll("[data-x]").forEach(el=>el.addEventListener("input",e=>{state.members[+e.target.dataset.x].x=+e.target.value;renderMembers()}));
  box.querySelectorAll("[data-y]").forEach(el=>el.addEventListener("input",e=>{state.members[+e.target.dataset.y].y=+e.target.value;renderMembers()}));
}
function renderMembers(){
  const grid=$("membersGrid");grid.innerHTML="";
  state.members.forEach((m,i)=>{
    const c=document.createElement("div");c.className="member-card";
    c.innerHTML=`<div class="member-photo"><img alt=""><div class="member-placeholder">PHOTO</div></div>
      <div class="member-name">${esc(m.name)}</div>
      <div class="member-detail"><b>MOBILE</b><span>:</span><span>${esc(m.mobile)}</span></div>
      <div class="member-detail"><b>SEMESTER</b><span>:</span><span>${esc(m.semester)}</span></div>
      <div class="member-detail"><b>SUBJECT</b><span>:</span><span>${esc(m.subject)}</span></div>`;
    const img=c.querySelector("img"),ph=c.querySelector(".member-placeholder");
    if(m.photo){img.src=m.photo;img.style.display="block";ph.style.display="none";img.style.objectPosition=`calc(50% + ${m.x/4}px) calc(50% + ${m.y/4}px)`;img.style.transform=`scale(${m.zoom})`}
    grid.appendChild(c);
  });
}
function bindText(id,view,transform=v=>v){$(id).addEventListener("input",e=>{$(view).innerHTML=transform(e.target.value);})}
bindText("groupName","groupView"); bindText("mainTitle","titleView"); bindText("quote","quoteView",v=>esc(v).replace(/\n/g,"<br>")); bindText("quoteAuthor","quoteAuthorView"); bindText("footerText","footerView");
bindText("leaderName","leaderNameView");bindText("leaderMobile","leaderMobileView");bindText("leaderSemester","leaderSemesterView");bindText("leaderSubject","leaderSubjectView");

$("memberCount").addEventListener("change",e=>ensureMembers(+e.target.value));
$("accent").addEventListener("input",e=>document.documentElement.style.setProperty("--accent",e.target.value));
$("wash").addEventListener("input",e=>document.querySelectorAll(".wash").forEach(x=>x.style.opacity=(+e.target.value/100)*.55));
$("quality").addEventListener("change",updateSize);

$("leaderPhoto").addEventListener("change",e=>readImage(e.target.files[0],src=>{state.leaderPhoto=src;showLeader()}));
["leaderZoom","leaderX","leaderY"].forEach(id=>$(id).addEventListener("input",showLeader));
function showLeader(){
  const img=$("leaderImg"), ph=document.querySelector(".portrait-placeholder");
  if(state.leaderPhoto){img.src=state.leaderPhoto;img.style.display="block";ph.style.display="none";img.style.transform=`translate(${+$("leaderX").value/5}px,${+$("leaderY").value/5}px) scale(${$("leaderZoom").value})`;}
}
$("heroPhoto").addEventListener("change",e=>readImage(e.target.files[0],src=>{state.heroPhoto=src;showHero()}));
$("showHero").addEventListener("change",showHero);
function showHero(){const img=$("heroImg"),ph=$(".hero-placeholder");if(state.heroPhoto&&$("showHero").checked){img.src=state.heroPhoto;img.style.display="block";ph.style.display="none"}else{img.style.display="none";ph.style.display="flex"}}

function updateSize(){const q=+$("quality").value;$("sizeLabel").textContent=`${Math.round(1240*q)} × ${Math.round(1754*q)} px @ ${q}×`}
async function capture(type){
  const q=+$("quality").value, poster=$("poster");
  const canvas=await html2canvas(poster,{scale:q,backgroundColor:"#fff",useCORS:true,logging:false});
  const ext=type==="jpeg"?"jpg":"png";
  const a=document.createElement("a");a.download=`nss-poster-${Date.now()}.${ext}`;a.href=canvas.toDataURL(type==="jpeg"?"image/jpeg":"image/png",.96);a.click();toast("Download ready");
}
$("downloadPng").onclick=()=>capture("png");$("downloadJpg").onclick=()=>capture("jpeg");
$("downloadPdf").onclick=async()=>{
  const q=+$("quality").value, canvas=await html2canvas($("poster"),{scale:q,backgroundColor:"#fff",useCORS:true});
  const {jsPDF}=window.jspdf; const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  pdf.addImage(canvas.toDataURL("image/jpeg",.96),"JPEG",0,0,210,297,undefined,"FAST");pdf.save(`nss-poster-${Date.now()}.pdf`);toast("PDF ready");
};

function projectData(){return {version:1,fields:{groupName:$("groupName").value,mainTitle:$("mainTitle").value,quote:$("quote").value,quoteAuthor:$("quoteAuthor").value,footerText:$("footerText").value,leaderName:$("leaderName").value,leaderMobile:$("leaderMobile").value,leaderSemester:$("leaderSemester").value,leaderSubject:$("leaderSubject").value,memberCount:$("memberCount").value,accent:$("accent").value,wash:$("wash").value,quality:$("quality").value},members:state.members,leaderPhoto:state.leaderPhoto,heroPhoto:state.heroPhoto}}
$("saveProject").onclick=()=>{const a=document.createElement("a");a.download="nss-poster-project.json";a.href=URL.createObjectURL(new Blob([JSON.stringify(projectData())],{type:"application/json"}));a.click();toast("Project saved")};
$("loadProject").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const p=JSON.parse(r.result);Object.entries(p.fields||{}).forEach(([k,v])=>{if($(k))$(k).value=v});state.members=p.members||[];state.leaderPhoto=p.leaderPhoto||"";state.heroPhoto=p.heroPhoto||"";ensureMembers(+($("memberCount").value));document.querySelectorAll("input,textarea,select").forEach(x=>x.dispatchEvent(new Event("input")));showLeader();showHero();updateSize();toast("Project loaded")};r.readAsText(f)});

ensureMembers(8);updateSize();showHero();showLeader();
