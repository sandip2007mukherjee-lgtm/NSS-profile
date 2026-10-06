const W=1087,H=1536, canvas=document.getElementById('poster'), ctx=canvas.getContext('2d');
canvas.width=W; canvas.height=H;
const $=id=>document.getElementById(id);
let assets={apj:'apj-default.jpg',leftLogo:'nss-logo-default.jpg',rightLogo:'nss-logo-default.jpg',leader:null};
const imgCache={};

function loadImg(src){
  return new Promise(resolve=>{
    if(!src) return resolve(null);
    if(imgCache[src]) return resolve(imgCache[src]);
    const i=new Image();
    i.onload=()=>{imgCache[src]=i;resolve(i)};
    i.onerror=()=>resolve(null);
    i.src=src;
  });
}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function fitCover(im,x,y,w,h,circle=false){
  if(!im) return;
  const s=Math.max(w/im.width,h/im.height),nw=im.width*s,nh=im.height*s;
  ctx.save();
  if(circle){ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2,0,Math.PI*2);ctx.clip();}
  ctx.drawImage(im,x+(w-nw)/2,y+(h-nh)/2,nw,nh);
  ctx.restore();
}
function fitContain(im,x,y,w,h,pad=0.04){
  if(!im) return;
  const maxW=w*(1-pad*2), maxH=h*(1-pad*2);
  const s=Math.min(maxW/im.width,maxH/im.height),nw=im.width*s,nh=im.height*s;
  ctx.drawImage(im,x+(w-nw)/2,y+(h-nh)/2,nw,nh);
}
function roundRect(x,y,w,h,r,fill,stroke='#8ac2df',lw=2){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}}
function txt(t,x,y,size,weight='400',align='left',color='#173f6c',family='Arial'){
  ctx.font=`${weight} ${size}px ${family}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(t||'',x,y);
}
function fitFontSize(text,maxWidth,startSize,minSize,weight='700',family='Arial'){
  let s=startSize;
  while(s>minSize){ctx.font=`${weight} ${s}px ${family}`;if(ctx.measureText(text||'').width<=maxWidth)return s;s-=1}
  return minSize;
}
function wrapLines(text,maxWidth,size,weight='400',family='Arial'){
  ctx.font=`${weight} ${size}px ${family}`;
  const words=(text||'').trim().split(/\s+/).filter(Boolean),lines=[];
  let line='';
  for(const word of words){
    const test=line?`${line} ${word}`:word;
    if(ctx.measureText(test).width<=maxWidth || !line) line=test;
    else {lines.push(line);line=word;}
  }
  if(line) lines.push(line);
  return lines;
}
function drawWrapped(text,x,y,maxWidth,lineH,size,weight='400',align='left',color='#173f6c',family='Arial',maxLines=5){
  let lines=wrapLines(text,maxWidth,size,weight,family);
  if(lines.length>maxLines){
    size=Math.max(9,size-1);
    lines=wrapLines(text,maxWidth,size,weight,family);
  }
  lines=lines.slice(0,maxLines);
  const total=(lines.length-1)*lineH;
  lines.forEach((line,i)=>txt(line,x,y-total/2+i*lineH,size,weight,align,color,family));
  return {lines,size,height:Math.max(1,lines.length)*lineH};
}
function val(id){return $(id)?.value||''}
function esc(s){return String(s||'').trim()}

function setupCount(){
  const s=$('memberCount');
  for(let i=1;i<=10;i++){const o=document.createElement('option');o.value=i;o.textContent=i;s.appendChild(o)}
  s.value=8;s.addEventListener('change',buildMembers);buildMembers();
}
function currentMemberIndexes(){
  return [...document.querySelectorAll('.member-card')].map(c=>+c.dataset.index);
}
function memberData(i){
  const q=k=>document.querySelector(`[data-m="${k}"][data-i="${i}"]`);
  return {name:q('name')?.value||`MEMBER ${i}`,mobile:q('mobile')?.value||'',semester:q('semester')?.value||'5TH SEM',subject:q('subject')?.value||'GENERAL'};
}
function buildMembers(){
  const n=+val('memberCount'), box=$('memberFields');box.innerHTML='';
  for(let i=1;i<=n;i++){
    const d=document.createElement('div');d.className='member-card';d.dataset.index=i;
    d.innerHTML=`<h3>Member ${i}</h3>
      <label>Name<input data-m="name" data-i="${i}" value="MEMBER ${i}"></label>
      <div class="two"><label>Mobile<input data-m="mobile" data-i="${i}" value=""></label><label>Semester<input data-m="semester" data-i="${i}" value="5TH SEM"></label></div>
      <label>Subject<input data-m="subject" data-i="${i}" value="GENERAL"></label>
      <label>Photo<input type="file" accept="image/png,image/jpeg,image/webp" data-photo="${i}"></label>`;
    box.appendChild(d);
  }
  box.querySelectorAll('input').forEach(el=>{
    el.addEventListener('input',render);
    if(el.type==='file')el.addEventListener('change',e=>readFile(e,`member${e.target.dataset.photo}`));
  });
  render();
}
function readFile(e,key){
  const f=e.target.files?.[0];if(!f)return;
  const r=new FileReader();r.onload=()=>{assets[key]=r.result;render()};r.readAsDataURL(f);
}
function bindFile(id,key){$(id).addEventListener('change',e=>readFile(e,key));}

function rowPlan(n){
  const plans={1:[1],2:[2],3:[3],4:[4],5:[3,2],6:[3,3],7:[4,3],8:[4,4],9:[3,3,3],10:[4,3,3]};
  return plans[n]||[4];
}
function globalOffset(id){return +(val(id)||0)}

async function render(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#1d507f';ctx.lineWidth=4;ctx.strokeRect(18,18,W-36,H-36);
  ctx.globalAlpha=.12;ctx.fillStyle='#e6a84d';ctx.beginPath();ctx.ellipse(530,130,300,85,-.08,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#55a77a';ctx.beginPath();ctx.ellipse(690,255,330,90,-.12,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;

  const [apj,left,right,leader]=await Promise.all([loadImg(assets.apj),loadImg(assets.leftLogo),loadImg(assets.rightLogo),loadImg(assets.leader)]);
  fitContain(left,55,35,185,185,.08);fitContain(right,847,35,185,185,.08);
  // Transparent PNG/JPG header images fit inside this zone without a background rectangle.
  fitContain(apj,255,20,555,380,.02);

  const qOff=globalOffset('quoteY'), titleOff=globalOffset('titleY'), subOff=globalOffset('subtitleY'), leaderOff=globalOffset('leaderY'), memberOff=globalOffset('memberTextY');
  const quoteText='“'+esc(val('quote'))+'”';
  let qSize=25;while(qSize>15 && wrapLines(quoteText,255,qSize,'600','Georgia').length>5)qSize--;
  drawWrapped(quoteText,760,205+qOff,260,29,qSize,'600','left','#153b65','Georgia',5);
  txt('– '+esc(val('quoteAuthor')),770,350+qOff,16,'700','left','#153b65');

  const title=esc(val('mainTitle'));const titleSize=fitFontSize(title,780,56,32,'800');
  txt(title,544,430+titleOff,titleSize,'800','center','#123d6b');
  const sub=esc(val('subtitle'));const subSize=fitFontSize(sub,760,34,20,'700');
  txt(sub,544,475+subOff,subSize,'700','center','#173f6c');

  roundRect(195,510,697,190,18,'#eefaff','#75c1de',2);
  ctx.strokeStyle='#2c72a8';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(425,540);ctx.lineTo(425,670);ctx.stroke();
  ctx.beginPath();ctx.arc(290,605,78,0,Math.PI*2);ctx.strokeStyle='#173f6c';ctx.lineWidth=5;ctx.stroke();
  if(leader)fitCover(leader,216,531,148,148,true);else{ctx.fillStyle='#dce9f2';ctx.beginPath();ctx.arc(290,605,74,0,Math.PI*2);ctx.fill();txt('LEADER',290,598,14,'700','center','#607d96');txt('PHOTO',290,620,14,'700','center','#607d96')}
  const leaderX=450;
  const leaderName=esc(val('leaderName'))||'YOUR NAME';
  txt(leaderName,leaderX,552+leaderOff,fitFontSize(leaderName,405,32,21,'800'),'800','left','#123d6b');
  txt('MOBILE NO   :  '+esc(val('leaderMobile')),leaderX,590+leaderOff,18,'700','left','#244a6b');
  txt('SEMESTER    :  '+esc(val('leaderSemester')),leaderX,622+leaderOff,18,'700','left','#244a6b');
  const ls=esc(val('leaderSubject'));const lsSize=fitFontSize('SUBJECT     :  '+ls,430,18,12,'700');txt('SUBJECT     :  '+ls,leaderX,654+leaderOff,lsSize,'700','left','#244a6b');

  ctx.strokeStyle='#163f6a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(55,755);ctx.lineTo(330,755);ctx.moveTo(757,755);ctx.lineTo(1032,755);ctx.stroke();
  roundRect(345,726,397,62,31,'#194b7c','#173f6c',2);txt('GROUP MEMBERS',544,757,30,'800','center','#fff');

  const n=+val('memberCount');const rows=rowPlan(n);const areaTop=810,areaBottom=1390,rowGap=34;
  const rowH=rows.length===1?230:(rows.length===2?215:160);
  let y=areaTop;
  let globalIndex=1;
  for(const count of rows){
    const gap=13;const totalW=W-80;const cardW=(totalW-gap*(count-1))/count;const startX=(W-(count*cardW+gap*(count-1)))/2;
    for(let col=0;col<count;col++){
      await drawMember(globalIndex,startX+col*(cardW+gap),y,cardW,rowH,memberOff);
      globalIndex++;
    }
    y+=rowH+rowGap;
  }

  // Footer kept clear of the final member row.
  ctx.fillStyle='#1b5a91';ctx.beginPath();ctx.moveTo(0,1437);ctx.quadraticCurveTo(300,1493,560,1450);ctx.quadraticCurveTo(800,1412,1087,1470);ctx.lineTo(1087,1536);ctx.lineTo(0,1536);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1b5a91';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,1418);ctx.quadraticCurveTo(300,1479,560,1438);ctx.quadraticCurveTo(800,1400,1087,1457);ctx.stroke();
  txt('✦   '+esc(val('footer'))+'   ✦',544,1441,22,'800','center','#173f6c');
}

async function drawMember(i,x,y,w,h,textOffset){
  roundRect(x,y,w,h,12,'#f0faff','#79bfdc',2);
  const r=clamp(Math.min(w*.23,57),34,57),cx=x+w/2,cy=y+r+2;
  ctx.beginPath();ctx.arc(cx,cy,r+6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#173f6c';ctx.lineWidth=4;ctx.stroke();
  const im=await loadImg(assets['member'+i]);
  if(im)fitCover(im,cx-r,cy-r,2*r,2*r,true);else{ctx.fillStyle='#d9e6ef';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();txt('PHOTO',cx,cy,11,'700','center','#627b90')}
  const d=memberData(i);const name=esc(d.name).toUpperCase();
  const base=cy+r+30+textOffset;
  const nameSize=fitFontSize(name,w-18,18,10,'800');txt(name,cx,base,nameSize,'800','center','#173f6c');
  const detailSize=fitFontSize(`MOBILE NO : ${d.mobile}`,w-12,13,8,'700');
  txt('MOBILE NO  :  '+esc(d.mobile),cx,base+24,detailSize,'700','center','#244a6b');
  txt('SEMESTER   :  '+esc(d.semester),cx,base+45,detailSize,'700','center','#244a6b');
  const subject='SUBJECT    :  '+esc(d.subject);
  const subSize=fitFontSize(subject,w-12,13,8,'700');
  const lines=wrapLines(subject,w-14,subSize,'700','Arial').slice(0,2);
  lines.forEach((line,k)=>txt(line,cx,base+66+k*16,subSize,'700','center','#244a6b'));
}

function allFields(){return [...document.querySelectorAll('input,textarea,select')].filter(e=>e.type!=='file')}
function saveDraft(){
  const data={};allFields().forEach(e=>data[e.id||`${e.dataset.m}-${e.dataset.i}`]=e.value);data.assets=assets;data.memberCount=val('memberCount');localStorage.setItem('nssPosterDraft',JSON.stringify(data));alert('Draft saved on this device.');
}
function loadDraft(){
  const raw=localStorage.getItem('nssPosterDraft');if(!raw)return alert('No saved draft found.');
  const d=JSON.parse(raw);$('memberCount').value=d.memberCount||8;buildMembers();allFields().forEach(e=>{const k=e.id||`${e.dataset.m}-${e.dataset.i}`;if(d[k]!=null)e.value=d[k]});assets=d.assets||assets;render();alert('Draft loaded.');
}
function clearMemberData(){document.querySelectorAll('#memberFields input').forEach(e=>{if(e.type!=='file')e.value=''});render()}
function resetAll(){if(confirm('Reset all poster data?')){localStorage.removeItem('nssPosterDraft');location.reload()}}
async function exportCanvas(){
  const scale=+val('quality')||2;const c=document.createElement('canvas');c.width=W*scale;c.height=H*scale;const c2=c.getContext('2d');c2.drawImage(canvas,0,0,c.width,c.height);return c;
}
async function downloadPoster(type){const c=await exportCanvas();const a=document.createElement('a');a.download=`NSS-${esc(val('groupName')).replace(/\s+/g,'-')||'Poster'}.${type}`;a.href=c.toDataURL(type==='jpg'?'image/jpeg':'image/png',.95);a.click()}
async function downloadPDF(){const c=await exportCanvas();const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});pdf.addImage(c.toDataURL('image/jpeg',.95),'JPEG',0,0,210,297);pdf.save(`NSS-${esc(val('groupName')).replace(/\s+/g,'-')||'Poster'}.pdf`)}

setupCount();
['groupName','mainTitle','subtitle','quote','quoteAuthor','footer','leaderName','leaderMobile','leaderSemester','leaderSubject','quality','titleY','subtitleY','quoteY','leaderY','memberTextY'].forEach(id=>$(id)?.addEventListener('input',render));
bindFile('apjPhoto','apj');bindFile('leftLogo','leftLogo');bindFile('rightLogo','rightLogo');bindFile('leaderPhoto','leader');
render();
