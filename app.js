const W=1087,H=1536, canvas=document.getElementById("poster"), ctx=canvas.getContext("2d");
canvas.width=W;canvas.height=H;
const $=id=>document.getElementById(id);
let assets={apj:"apj-default.jpg",leftLogo:"nss-logo-default.jpg",rightLogo:"nss-logo-default.jpg",leader:null};
let memberPhotos={};
const imgCache={};
function loadImg(src){return new Promise((res,rej)=>{if(!src)return res(null);if(imgCache[src])return res(imgCache[src]);let i=new Image();i.onload=()=>{imgCache[src]=i;res(i)};i.onerror=()=>res(null);i.src=src})}
function fitImage(im,x,y,w,h,circle=false){
  if(!im)return;
  const s=Math.max(w/im.width,h/im.height), nw=im.width*s, nh=im.height*s;
  ctx.save(); if(circle){ctx.beginPath();ctx.arc(x+w/2,y+h/2,w/2,0,Math.PI*2);ctx.clip()}
  ctx.drawImage(im,x+(w-nw)/2,y+(h-nh)/2,nw,nh);ctx.restore();
}
function roundRect(x,y,w,h,r,fill,stroke="#8ac2df",lw=2){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}}
function txt(t,x,y,size,weight="400",align="left",color="#173f6c",family="Arial"){ctx.font=`${weight} ${size}px ${family}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline="middle";ctx.fillText(t||"",x,y)}
function wrapText(text,x,y,maxWidth,lineH,size,weight="400",align="left",color="#173f6c"){ctx.font=`${weight} ${size}px Arial`;ctx.fillStyle=color;ctx.textAlign=align;let words=(text||"").split(/\s+/),line="";for(const w of words){let test=line?line+" "+w:w;if(ctx.measureText(test).width>maxWidth&&line){txt(line,x,y,size,weight,align,color);y+=lineH;line=w}else line=test}if(line)txt(line,x,y,size,weight,align,color);return y}
function val(id){return $(id).value}
function esc(s){return (s||"").trim()}
function setupCount(){let s=$("memberCount");for(let i=1;i<=10;i++){let o=document.createElement("option");o.value=i;o.textContent=i;s.appendChild(o)}s.value=8;s.onchange=buildMembers;buildMembers()}
function buildMembers(){
  const n=+val("memberCount"), box=$("memberFields");box.innerHTML="";
  for(let i=1;i<=n;i++){
    const d=document.createElement("div");d.className="member-card";
    d.innerHTML=`<h3>Member ${i}</h3>
      <label>Name<input data-m="name" data-i="${i}" value="MEMBER ${i}"></label>
      <div class="two"><label>Mobile<input data-m="mobile" data-i="${i}" value=""></label><label>Semester<input data-m="semester" data-i="${i}" value="5TH SEM"></label></div>
      <label>Subject<input data-m="subject" data-i="${i}" value="GENERAL"></label>
      <label>Photo<input type="file" accept="image/*" data-photo="${i}"></label>`;
    box.appendChild(d);
  }
  box.querySelectorAll("input").forEach(el=>{el.addEventListener("input",render);if(el.type==="file")el.addEventListener("change",e=>readFile(e,`member${e.target.dataset.photo}`))});
  render();
}
function readFile(e,key){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{assets[key]=r.result;render()};r.readAsDataURL(f)}
function bindFile(id,key){$(id).addEventListener("change",e=>readFile(e,key))}
function memberData(i){
 const q=s=>document.querySelector(`[data-m="${s}"][data-i="${i}"]`);
 return {name:q("name")?.value||"",mobile:q("mobile")?.value||"",semester:q("semester")?.value||"",subject:q("subject")?.value||""}
}
async function render(){
 ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
 // Border and subtle watercolor shapes
 ctx.strokeStyle="#1d507f";ctx.lineWidth=4;ctx.strokeRect(18,18,W-36,H-36);
 ctx.globalAlpha=.12;ctx.fillStyle="#e6a84d";ctx.beginPath();ctx.ellipse(530,130,300,85, -.08,0,7);ctx.fill();
 ctx.fillStyle="#55a77a";ctx.beginPath();ctx.ellipse(690,255,330,90,-.12,0,7);ctx.fill();ctx.globalAlpha=1;
 const [apj,left,right,leader]=await Promise.all([loadImg(assets.apj),loadImg(assets.leftLogo),loadImg(assets.rightLogo),loadImg(assets.leader)]);
 fitImage(left,55,35,185,185,false);fitImage(right,847,35,185,185,false);
 fitImage(apj,260,25,535,390,false);
 // Quote
 ctx.font="italic 26px Georgia";ctx.fillStyle="#153b65";ctx.textAlign="left";
 wrapText("“"+esc(val("quote"))+"”",760,205,260,32,25,"600","left","#153b65","Georgia");
 txt("– "+esc(val("quoteAuthor")),770,350,16,"700","left","#153b65");
 txt(esc(val("mainTitle")),544,430,55,"800","center","#123d6b");
 txt(esc(val("subtitle")),544,475,34,"700","center","#173f6c");
 // Leader card
 roundRect(195,510,697,190,18,"#eefaff","#75c1de",2);
 ctx.strokeStyle="#2c72a8";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(425,540);ctx.lineTo(425,670);ctx.stroke();
 ctx.beginPath();ctx.arc(290,605,78,0,7);ctx.strokeStyle="#173f6c";ctx.lineWidth=5;ctx.stroke();
 if(leader)fitImage(leader,212,527,156,156,true);else {ctx.fillStyle="#dce9f2";ctx.beginPath();ctx.arc(290,605,74,0,7);ctx.fill();txt("LEADER",290,598,14,"700","center","#607d96");txt("PHOTO",290,620,14,"700","center","#607d96")}
 txt(esc(val("leaderName"))||"YOUR NAME",450,552,32,"800","left","#123d6b");
 txt("MOBILE NO   :  "+esc(val("leaderMobile")),450,590,18,"700","left","#244a6b");
 txt("SEMESTER    :  "+esc(val("leaderSemester")),450,622,18,"700","left","#244a6b");
 txt("SUBJECT     :  "+esc(val("leaderSubject")),450,654,18,"700","left","#244a6b");
 // Section title
 ctx.strokeStyle="#163f6a";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(55,755);ctx.lineTo(330,755);ctx.moveTo(757,755);ctx.lineTo(1032,755);ctx.stroke();
 roundRect(345,726,397,62,31,"#194b7c","#173f6c",2);txt("GROUP MEMBERS",544,757,30,"800","center","#fff");
 // Adaptive member grid
 const n=+val("memberCount"); const cols=n<=4?n:4; const rows=Math.ceil(n/cols);
 const areaTop=810, areaBottom=1395, gapX=14, gapY=70;
 const cardW=(W-80-gapX*(cols-1))/cols; const rowH=Math.min(225,(areaBottom-areaTop-gapY*(rows-1))/rows);
 for(let i=1;i<=n;i++){
   const idx=i-1,row=Math.floor(idx/cols),col=idx%cols;
   const rowCount=Math.min(cols,n-row*cols);
   const actualW=(W-80-gapX*(rowCount-1))/rowCount;
   const startX=(W-rowCount*actualW-gapX*(rowCount-1))/2;
   const x=startX+col*(actualW+gapX), y=areaTop+row*(rowH+gapY);
   drawMember(i,x,y,actualW,rowH);
 }
 // Footer curve
 ctx.fillStyle="#1b5a91";ctx.beginPath();ctx.moveTo(0,1440);ctx.quadraticCurveTo(300,1500,560,1450);ctx.quadraticCurveTo(800,1410,1087,1470);ctx.lineTo(1087,1536);ctx.lineTo(0,1536);ctx.closePath();ctx.fill();
 ctx.strokeStyle="#1b5a91";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,1420);ctx.quadraticCurveTo(300,1480,560,1435);ctx.quadraticCurveTo(800,1400,1087,1455);ctx.stroke();
 txt("✦   "+esc(val("footer"))+"   ✦",544,1442,22,"800","center","#173f6c");
}
async function drawMember(i,x,y,w,h){
 roundRect(x,y,w,h,12,"#f0faff","#79bfdc",2);
 const r=Math.min(72,w*.23), cx=x+w/2, cy=y+10+r;
 ctx.beginPath();ctx.arc(cx,cy,r+5,0,7);ctx.fillStyle="#fff";ctx.fill();ctx.strokeStyle="#173f6c";ctx.lineWidth=4;ctx.stroke();
 const im=await loadImg(assets["member"+i]); if(im)fitImage(im,cx-r,cy-r,2*r,2*r,true); else {ctx.fillStyle="#d9e6ef";ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();txt("PHOTO",cx,cy,13,"700","center","#627b90")}
 const d=memberData(i); txt(d.name.toUpperCase(),cx,y+2*r+48,Math.min(18,260/w*18),"800","center","#173f6c");
 txt("MOBILE NO   : "+d.mobile,cx,y+2*r+78,Math.min(13,260/w*13),"700","center","#244a6b");
 txt("SEMESTER    : "+d.semester,cx,y+2*r+101,Math.min(13,260/w*13),"700","center","#244a6b");
 wrapText("SUBJECT     : "+d.subject,cx,y+2*r+124,w-24,17,Math.min(12,260/w*12),"700","center","#244a6b");
}
function allFields(){return [...document.querySelectorAll("input,textarea,select")].filter(e=>e.type!=="file")}
function saveDraft(){
 const data={};allFields().forEach(e=>data[e.id||`${e.dataset.m}-${e.dataset.i}`]=e.value);
 data.assets=assets;data.memberCount=val("memberCount");
 localStorage.setItem("nssPosterDraft",JSON.stringify(data));alert("Draft saved on this device.");
}
function loadDraft(){
 const raw=localStorage.getItem("nssPosterDraft");if(!raw)return alert("No saved draft found.");
 const d=JSON.parse(raw);$("memberCount").value=d.memberCount||8;buildMembers();
 allFields().forEach(e=>{const k=e.id||`${e.dataset.m}-${e.dataset.i}`;if(d[k]!=null)e.value=d[k]});assets=d.assets||assets;render();alert("Draft loaded.");
}
function clearMemberData(){document.querySelectorAll("#memberFields input").forEach(e=>{if(e.type!=="file")e.value=""});render()}
function resetAll(){if(confirm("Reset all poster data?")){localStorage.removeItem("nssPosterDraft");location.reload()}}
async function exportCanvas(){
 const q=+val("quality"), scale=q;
 const tmp=document.createElement("canvas");tmp.width=W*scale;tmp.height=H*scale;const tc=tmp.getContext("2d");tc.drawImage(canvas,0,0,tmp.width,tmp.height);return tmp;
}
async function downloadPoster(type){
 const c=await exportCanvas(), a=document.createElement("a");a.download=`NSS-${esc(val("groupName")).replace(/\s+/g,"-")||"Poster"}.${type}`;
 a.href=c.toDataURL(type==="jpg"?"image/jpeg":"image/png",.95);a.click();
}
async function downloadPDF(){
 const c=await exportCanvas();const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});pdf.addImage(c.toDataURL("image/jpeg",.95),"JPEG",0,0,210,297);pdf.save(`NSS-${esc(val("groupName")).replace(/\s+/g,"-")||"Poster"}.pdf`);
}
document.querySelectorAll("input:not([type=file]),textarea,select").forEach(e=>e.addEventListener("input",render));
bindFile("apjPhoto","apj");bindFile("leftLogo","leftLogo");bindFile("rightLogo","rightLogo");bindFile("leaderPhoto","leader");
$("groupName").addEventListener("input",render);
setupCount();render();
