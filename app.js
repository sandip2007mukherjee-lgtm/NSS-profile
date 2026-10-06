const W=1087,H=1536;
const poster=document.getElementById('poster'), ctx=poster.getContext('2d');
poster.width=W;poster.height=H;
const pe=document.getElementById('photoEditor'), pctx=pe.getContext('2d');
const $=id=>document.getElementById(id);
const assets={headerPhoto:{src:'apj-default.jpg',original:'apj-default.jpg'},leftLogo:{src:'nss-logo-default.jpg',original:'nss-logo-default.jpg'},rightLogo:{src:'nss-logo-default.jpg',original:'nss-logo-default.jpg'},leaderPhoto:{src:null,original:null}};
const photoState={};
const memberState={};
const elements={
  headerPhoto:{x:0,y:0},leftLogo:{x:0,y:0},rightLogo:{x:0,y:0},quote:{x:0,y:0},title:{x:0,y:0},subtitle:{x:0,y:0},
  leaderCard:{x:0,y:0},leaderPhoto:{x:0,y:0},leaderText:{x:0,y:0},groupHeader:{x:0,y:0},membersArea:{x:0,y:0},footer:{x:0,y:0}
};
const imgCache={};

function esc(v){return String(v??'').trim()}
function val(id){return $(id)?.value??''}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function loadImg(src){return new Promise(resolve=>{if(!src)return resolve(null);if(imgCache[src])return resolve(imgCache[src]);const im=new Image();im.onload=()=>{imgCache[src]=im;resolve(im)};im.onerror=()=>resolve(null);im.src=src})}
function txt(t,x,y,size,weight='400',align='left',color=val('textColor')||'#173f6c',family='Arial'){
  ctx.font=`${weight} ${size}px ${family}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(t||'',x,y)
}
function rounded(x,y,w,h,r,fill,stroke,lw=2){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function fitFont(text,maxWidth,start,min,weight='700',family='Arial'){
  for(let s=start;s>=min;s--){ctx.font=`${weight} ${s}px ${family}`;if(ctx.measureText(text||'').width<=maxWidth)return s}return min
}
function lines(text,maxWidth,size,weight='400',family='Arial'){
  ctx.font=`${weight} ${size}px ${family}`;const words=esc(text).split(/\s+/).filter(Boolean),out=[];let line='';
  for(const w of words){const t=line?line+' '+w:w;if(!line||ctx.measureText(t).width<=maxWidth)line=t;else{out.push(line);line=w}}
  if(line)out.push(line);return out;
}
function wrap(text,x,y,maxWidth,lineH,size,weight='400',align='left',color=val('textColor')||'#173f6c',family='Arial',maxLines=5){
  let ls=lines(text,maxWidth,size,weight,family);while(ls.length>maxLines&&size>9){size--;ls=lines(text,maxWidth,size,weight,family)}ls=ls.slice(0,maxLines);const total=(ls.length-1)*lineH;ls.forEach((l,i)=>txt(l,x,y-total/2+i*lineH,size,weight,align,color,family));return ls.length*lineH
}
function getPhotoKey(){return $('photoSelect').value}
function ensurePhotoState(key){
  if(!photoState[key])photoState[key]={zoom:100,x:0,y:0,rotate:0,brightness:100,contrast:100,saturation:100,blur:0,opacity:100,gray:false,sepia:false,flipH:false,flipV:false,bgRemoved:false,tolerance:45};
  return photoState[key]
}
function createMemberState(i){if(!memberState[i])memberState[i]={x:0,y:0,cardW:0,cardH:0,photoX:0,photoY:0,photoZoom:100,photoRotate:0};return memberState[i]}
function memberData(i){const q=k=>document.querySelector(`[data-m="${k}"][data-i="${i}"]`);return{name:q('name')?.value||`MEMBER ${i}`,mobile:q('mobile')?.value||'',semester:q('semester')?.value||'5TH SEM',subject:q('subject')?.value||'GENERAL'}}
function rowPlan(n){const p={1:[1],2:[2],3:[3],4:[4],5:[3,2],6:[3,3],7:[4,3],8:[4,4],9:[3,3,3],10:[4,3,3]};return p[n]||[4]}
function elementName(key){const n={headerPhoto:'Header photo',leftLogo:'Left NSS logo',rightLogo:'Right NSS logo',quote:'Quote',title:'Main title',subtitle:'Subtitle',leaderCard:'Leader box',leaderPhoto:'Leader photo',leaderText:'Leader text',groupHeader:'Group Members header',membersArea:'Members area',footer:'Footer'};return n[key]||key}

function setup(){
  const ms=$('memberCount');for(let i=1;i<=10;i++){const o=document.createElement('option');o.value=i;o.textContent=i+' member'+(i>1?'s':'');ms.appendChild(o)}ms.value=8;ms.addEventListener('change',buildMembers);
  $('elementSelect').addEventListener('change',syncElementControls);
  $('photoSelect').addEventListener('change',syncPhotoControls);
  document.querySelectorAll('input,textarea,select').forEach(el=>{if(el.type==='file')return;el.addEventListener('input',()=>{syncOutputs();syncElementControls(false);syncPhotoControls(false);render()})});
  [['apjPhoto','headerPhoto'],['leftLogoFile','leftLogo'],['rightLogoFile','rightLogo'],['leaderPhoto','leaderPhoto']].forEach(([id,key])=>$(id).addEventListener('change',e=>readFile(e,key)));
  populatePhotoSelect();buildMembers();syncElementControls();syncPhotoControls();render();
}
function populatePhotoSelect(){const s=$('photoSelect'),keep=s.value;s.innerHTML='';[['headerPhoto','Header photo'],['leftLogo','Left NSS logo'],['rightLogo','Right NSS logo'],['leaderPhoto','Leader photo']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;s.appendChild(o)});const n=+$('memberCount').value;for(let i=1;i<=n;i++){const o=document.createElement('option');o.value='member'+i;o.textContent='Member '+i+' photo';s.appendChild(o)}if([...s.options].some(o=>o.value===keep))s.value=keep}
function buildMembers(){
  const box=$('memberFields'),n=+$('memberCount').value;box.innerHTML='';
  for(let i=1;i<=n;i++){
    createMemberState(i);
    const d=document.createElement('div');d.className='member-card';d.innerHTML=`<h3>Member ${i}</h3>
      <label>Name<input data-m="name" data-i="${i}" value="${memberState[i].savedName||'MEMBER '+i}"></label>
      <div class="two"><label>Mobile<input data-m="mobile" data-i="${i}" value="${memberState[i].savedMobile||''}"></label><label>Semester<input data-m="semester" data-i="${i}" value="${memberState[i].savedSemester||'5TH SEM'}"></label></div>
      <label>Subject<input data-m="subject" data-i="${i}" value="${memberState[i].savedSubject||'GENERAL'}"></label>
      <label>Photo<input type="file" accept="image/*" data-photo="${i}"></label>
      <div class="mini"><label>Box X<input data-pos="mx" data-i="${i}" type="range" min="-220" max="220" value="${memberState[i].x}"><output data-out="mx" data-i="${i}">${memberState[i].x}</output></label>
      <label>Box Y<input data-pos="my" data-i="${i}" type="range" min="-220" max="220" value="${memberState[i].y}"><output data-out="my" data-i="${i}">${memberState[i].y}</output></label></div>`;box.appendChild(d)
  }
  box.querySelectorAll('input').forEach(el=>{el.addEventListener('input',()=>{const i=+el.dataset.i;if(el.dataset.m){memberState[i]['saved'+el.dataset.m[0].toUpperCase()+el.dataset.m.slice(1)]=el.value}else if(el.dataset.pos){memberState[i][el.dataset.pos==='mx'?'x':'y']=+el.value}render()});if(el.type==='file')el.addEventListener('change',e=>readFile(e,'member'+e.target.dataset.photo))});
  populatePhotoSelect();render()
}
function readFile(e,key){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{assets[key]={src:r.result,original:r.result};const st=ensurePhotoState(key);Object.assign(st,{zoom:100,x:0,y:0,rotate:0,brightness:100,contrast:100,saturation:100,blur:0,opacity:100,gray:false,sepia:false,flipH:false,flipV:false,bgRemoved:false,tolerance:45});populatePhotoSelect();$('photoSelect').value=key;syncPhotoControls();render()};r.readAsDataURL(f)}

function syncOutputs(){
  [['cardRadius','cardRadiusV'],['borderWidth','borderWidthV']].forEach(([a,b])=>$(b)&&( $(b).textContent=$(a).value));
  [['posX','posXV'],['posY','posYV']].forEach(([a,b])=>$(b)&&( $(b).textContent=$(a).value));
  [['photoZoom','photoZoomV'],['photoRotate','photoRotateV'],['photoX','photoXV'],['photoY','photoYV'],['photoBrightness','photoBrightnessV'],['photoContrast','photoContrastV'],['photoSaturation','photoSaturationV'],['photoBlur','photoBlurV'],['photoOpacity','photoOpacityV'],['bgTolerance','bgToleranceV']].forEach(([a,b])=>{if($(b)&&$(a))$(b).textContent=$(a).value+(a.includes('Zoom')?'%':a.includes('Opacity')?'%':a.includes('Rotate')?'°':'')})
}
function syncElementControls(write=true){const k=$('elementSelect').value,st=elements[k]||{x:0,y:0};if(write){$('posX').value=st.x;$('posY').value=st.y}syncOutputs()}
function syncPhotoControls(write=true){const k=getPhotoKey(),st=ensurePhotoState(k);if(write){$('photoZoom').value=st.zoom;$('photoRotate').value=st.rotate;$('photoX').value=st.x;$('photoY').value=st.y;$('photoBrightness').value=st.brightness;$('photoContrast').value=st.contrast;$('photoSaturation').value=st.saturation;$('photoBlur').value=st.blur;$('photoOpacity').value=st.opacity;$('photoGray').checked=st.gray;$('photoSepia').checked=st.sepia;$('flipH').checked=st.flipH;$('flipV').checked=st.flipV;$('bgTolerance').value=st.tolerance}syncOutputs();drawPhotoEditor()}

function nudge(dx,dy){const k=$('elementSelect').value;elements[k].x=clamp(elements[k].x+dx,-500,500);elements[k].y=clamp(elements[k].y+dy,-500,500);syncElementControls();render()}
$('posX').addEventListener('input',()=>{elements[$('elementSelect').value].x=+$('posX').value;syncOutputs();render()});
$('posY').addEventListener('input',()=>{elements[$('elementSelect').value].y=+$('posY').value;syncOutputs();render()});

function drawTransformed(im,x,y,w,h,key,clipCircle=false){
  if(!im)return;const st=ensurePhotoState(key),s=(st.zoom||100)/100;ctx.save();ctx.globalAlpha=(st.opacity||100)/100;
  ctx.filter=`brightness(${st.brightness}%) contrast(${st.contrast}%) saturate(${st.saturation}%) blur(${st.blur}px)${st.gray?' grayscale(100%)':''}${st.sepia?' sepia(100%)':''}`;
  ctx.translate(x+w/2+(st.x||0),y+h/2+(st.y||0));ctx.rotate((st.rotate||0)*Math.PI/180);ctx.scale((st.flipH?-1:1)*s,(st.flipV?-1:1)*s);
  if(clipCircle){ctx.beginPath();ctx.arc(0,0,Math.min(w,h)/2,0,Math.PI*2);ctx.clip()}
  ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();ctx.filter='none';
}
function fitImage(im,x,y,w,h,key,clip=false,contain=false){if(!im)return;const s=contain?Math.min(w/im.width,h/im.height):Math.max(w/im.width,h/im.height),nw=im.width*s,nh=im.height*s;drawTransformed(im,x+(w-nw)/2,y+(h-nh)/2,nw,nh,key,clip)}

async function render(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=val('pageBg')||'#fff';ctx.fillRect(0,0,W,H);
  const textColor=val('textColor')||'#173f6c',accent=val('accentColor')||'#194b7c',cardFill=val('cardFill')||'#eefaff',cardBorder=val('cardBorder')||'#79bfdc',ring=val('photoRing')||'#173f6c',footer=val('footerColor')||'#1b5a91';
  ctx.strokeStyle=accent;ctx.lineWidth=4;ctx.strokeRect(18,18,W-36,H-36);
  ctx.globalAlpha=.12;ctx.fillStyle='#e6a84d';ctx.beginPath();ctx.ellipse(530+elements.headerPhoto.x*.18,130+elements.headerPhoto.y*.18,300,85,-.08,0,Math.PI*2);ctx.fill();ctx.fillStyle='#55a77a';ctx.beginPath();ctx.ellipse(690+elements.headerPhoto.x*.18,255+elements.headerPhoto.y*.18,330,90,-.12,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  const [apj,left,right,leader]=await Promise.all([loadImg(assets.headerPhoto.src),loadImg(assets.leftLogo.src),loadImg(assets.rightLogo.src),loadImg(assets.leaderPhoto.src)]);
  fitImage(left,55+elements.leftLogo.x,35+elements.leftLogo.y,185,185,'leftLogo',false,true);
  fitImage(right,847+elements.rightLogo.x,35+elements.rightLogo.y,185,185,'rightLogo',false,true);
  fitImage(apj,255+elements.headerPhoto.x,20+elements.headerPhoto.y,555,380,'headerPhoto',false,true);

  const qx=760+elements.quote.x,qy=205+elements.quote.y,q='“'+esc(val('quote'))+'”';let qs=25;while(qs>14&&lines(q,260,qs,'600','Georgia').length>5)qs--;wrap(q,qx,qy,260,29,qs,'600','left',textColor,'Georgia',5);txt('– '+esc(val('quoteAuthor')),770+elements.quote.x,350+elements.quote.y,16,'700','left',textColor);
  const t=esc(val('mainTitle')),ts=fitFont(t,800,56,28,'800');txt(t,544+elements.title.x,430+elements.title.y,ts,'800','center',textColor);
  const st=esc(val('subtitle')),ss=fitFont(st,780,34,20,'700');txt(st,544+elements.subtitle.x,475+elements.subtitle.y,ss,'700','center',textColor);

  const lc=elements.leaderCard;rounded(195+lc.x,510+lc.y,697,190,+val('cardRadius')||12,cardFill,cardBorder,+val('borderWidth')||2);
  ctx.strokeStyle=accent;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(425+lc.x,540+lc.y);ctx.lineTo(425+lc.x,670+lc.y);ctx.stroke();
  const lp=elements.leaderPhoto;ctx.beginPath();ctx.arc(290+lc.x+lp.x,605+lc.y+lp.y,83,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=ring;ctx.lineWidth=5;ctx.stroke();
  if(leader)drawTransformed(leader,216+lc.x+lp.x,531+lc.y+lp.y,148,148,'leaderPhoto',true);else{ctx.fillStyle='#dce9f2';ctx.beginPath();ctx.arc(290+lc.x+lp.x,605+lc.y+lp.y,74,0,Math.PI*2);ctx.fill();txt('LEADER',290+lc.x+lp.x,598+lc.y+lp.y,14,'700','center','#607d96');txt('PHOTO',290+lc.x+lp.x,620+lc.y+lp.y,14,'700','center','#607d96')}
  const lt=elements.leaderText,lx=450+lc.x+lt.x,ly=0+lc.y+lt.y,lname=esc(val('leaderName'))||'YOUR NAME';txt(lname,lx,552+ly,fitFont(lname,405,32,19,'800'),'800','left',textColor);txt('MOBILE NO   :  '+esc(val('leaderMobile')),lx,590+ly,18,'700','left',textColor);txt('SEMESTER    :  '+esc(val('leaderSemester')),lx,622+ly,18,'700','left',textColor);const subline='SUBJECT     :  '+esc(val('leaderSubject'));txt(subline,lx,654+ly,fitFont(subline,430,18,11,'700'),'700','left',textColor);

  const gh=elements.groupHeader;ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(55+gh.x,755+gh.y);ctx.lineTo(330+gh.x,755+gh.y);ctx.moveTo(757+gh.x,755+gh.y);ctx.lineTo(1032+gh.x,755+gh.y);ctx.stroke();rounded(345+gh.x,726+gh.y,397,62,31,accent,accent,2);txt('GROUP MEMBERS',544+gh.x,757+gh.y,30,'800','center','#fff');

  const n=+$('memberCount').value,rows=rowPlan(n),ma=elements.membersArea;let y=810+ma.y,rowGap=34;const rowH=rows.length===1?230:(rows.length===2?215:160);let idx=1;
  for(const count of rows){const gap=13,totalW=W-80,cardW=(totalW-gap*(count-1))/count,startX=(W-(count*cardW+gap*(count-1)))/2+ma.x;for(let col=0;col<count;col++){await drawMember(idx,startX+col*(cardW+gap),y,cardW,rowH,ring,textColor,cardFill,cardBorder);idx++}y+=rowH+rowGap}
  const fy=elements.footer.y;ctx.fillStyle=footer;ctx.beginPath();ctx.moveTo(0,1437+fy);ctx.quadraticCurveTo(300,1493+fy,560,1450+fy);ctx.quadraticCurveTo(800,1412+fy,1087,1470+fy);ctx.lineTo(1087,1536+fy);ctx.lineTo(0,1536+fy);ctx.closePath();ctx.fill();ctx.strokeStyle=footer;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,1418+fy);ctx.quadraticCurveTo(300,1479+fy,560,1438+fy);ctx.quadraticCurveTo(800,1400+fy,1087,1457+fy);ctx.stroke();txt('✦   '+esc(val('footer'))+'   ✦',544+elements.footer.x,1441+fy,22,'800','center',textColor);
  drawSelectionHint();
}
async function drawMember(i,x,y,w,h,ring,textColor,cardFill,cardBorder){
  const m=createMemberState(i);x+=m.x;y+=m.y;rounded(x,y,w,h,+val('cardRadius')||12,cardFill,cardBorder,+val('borderWidth')||2);
  const r=clamp(Math.min(w*.23,57),34,57),cx=x+w/2,cy=y+r+2;ctx.beginPath();ctx.arc(cx,cy,r+6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=ring;ctx.lineWidth=4;ctx.stroke();
  const im=await loadImg(assets['member'+i]?.src);if(im){const key='member'+i;const st=ensurePhotoState(key), z=(st.zoom||100)/100* (m.photoZoom||100)/100;ctx.save();ctx.globalAlpha=(st.opacity||100)/100;ctx.filter=`brightness(${st.brightness}%) contrast(${st.contrast}%) saturate(${st.saturation}%) blur(${st.blur}px)${st.gray?' grayscale(100%)':''}${st.sepia?' sepia(100%)':''}`;ctx.translate(cx+(st.x||0)+(m.photoX||0),cy+(st.y||0)+(m.photoY||0));ctx.rotate(((st.rotate||0)+(m.photoRotate||0))*Math.PI/180);ctx.scale((st.flipH?-1:1)*z,(st.flipV?-1:1)*z);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();ctx.drawImage(im,-r,-r,2*r,2*r);ctx.restore();ctx.filter='none'}else{ctx.fillStyle='#d9e6ef';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();txt('PHOTO',cx,cy,11,'700','center','#627b90')}
  const d=memberData(i),base=cy+r+30,name=esc(d.name).toUpperCase();txt(name,cx,base,fitFont(name,w-16,18,9,'800'),'800','center',textColor);const ds=fitFont('MOBILE NO : '+d.mobile,w-12,13,7,'700');txt('MOBILE NO : '+esc(d.mobile),cx,base+21,ds,'700','center',textColor);txt('SEMESTER  : '+esc(d.semester),cx,base+41,ds,'700','center',textColor);wrap('SUBJECT : '+esc(d.subject),cx,base+62,w-12,15,ds,'700','center',textColor,'Arial',2)
}

function drawSelectionHint(){
  // subtle outline when dragging selected element in edit mode
  if(!$('dragHint')||!$('dragHint').checked)return;
  ctx.save();ctx.setLineDash([8,6]);ctx.strokeStyle='#4b90d9';ctx.lineWidth=2;ctx.strokeRect(24,24,W-48,H-48);ctx.restore();
}

async function drawPhotoEditor(){
  const key=getPhotoKey(),im=await loadImg(assets[key]?.src);if(!im){pe.width=360;pe.height=180;pctx.clearRect(0,0,pe.width,pe.height);pctx.fillStyle='#6d8194';pctx.font='700 15px Arial';pctx.textAlign='center';pctx.fillText('No photo uploaded yet',180,90);return}
  const maxW=360,maxH=230,sc=Math.min(maxW/im.width,maxH/im.height,1.4);pe.width=Math.max(240,Math.round(im.width*sc));pe.height=Math.max(160,Math.round(im.height*sc));pctx.clearRect(0,0,pe.width,pe.height);pctx.save();pctx.translate(pe.width/2,pe.height/2);pctx.rotate(ensurePhotoState(key).rotate*Math.PI/180);pctx.scale((ensurePhotoState(key).flipH?-1:1)*ensurePhotoState(key).zoom/100,(ensurePhotoState(key).flipV?-1:1)*ensurePhotoState(key).zoom/100);const st=ensurePhotoState(key);pctx.globalAlpha=st.opacity/100;pctx.filter=`brightness(${st.brightness}%) contrast(${st.contrast}%) saturate(${st.saturation}%) blur(${st.blur}px)${st.gray?' grayscale(100%)':''}${st.sepia?' sepia(100%)':''}`;pctx.drawImage(im,-im.width*sc/2+st.x*sc,-im.height*sc/2+st.y*sc,im.width*sc,im.height*sc);pctx.restore();pctx.filter='none';
}

function bindPhotoInputs(){
  const ids=['photoZoom','photoRotate','photoX','photoY','photoBrightness','photoContrast','photoSaturation','photoBlur','photoOpacity','bgTolerance'];ids.forEach(id=>$(id).addEventListener('input',()=>{const st=ensurePhotoState(getPhotoKey());const map={photoZoom:'zoom',photoRotate:'rotate',photoX:'x',photoY:'y',photoBrightness:'brightness',photoContrast:'contrast',photoSaturation:'saturation',photoBlur:'blur',photoOpacity:'opacity',bgTolerance:'tolerance'};st[map[id]]=+$(id).value;syncOutputs();drawPhotoEditor();render()}));
  ['photoGray','photoSepia','flipH','flipV'].forEach(id=>$(id).addEventListener('change',()=>{const st=ensurePhotoState(getPhotoKey());st[id==='photoGray'?'gray':id==='photoSepia'?'sepia':id]=$(id).checked;drawPhotoEditor();render()}));
}

async function quickRemoveBG(){
  const key=getPhotoKey(),a=assets[key];if(!a?.src)return alert('Upload a photo first.');
  const im=await loadImg(a.src);if(!im)return;
  const c=document.createElement('canvas');c.width=im.naturalWidth||im.width;c.height=im.naturalHeight||im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const data=x.getImageData(0,0,c.width,c.height),p=data.data,t=+val('bgTolerance')||45;
  const samples=[];[[0,0],[c.width-1,0],[0,c.height-1],[c.width-1,c.height-1]].forEach(([sx,sy])=>{const k=(sy*c.width+sx)*4;samples.push([p[k],p[k+1],p[k+2]])});
  const seen=new Uint8Array(c.width*c.height),queue=[];function dist(i,s){const dr=p[i]-s[0],dg=p[i+1]-s[1],db=p[i+2]-s[2];return Math.sqrt(dr*dr+dg*dg+db*db)}function removeAt(px,py){const q=(py*c.width+px)*4;if(seen[py*c.width+px])return;let ok=false;for(const s of samples)if(dist(q,s)<=t)ok=true;if(!ok)return;seen[py*c.width+px]=1;queue.push([px,py]);p[q+3]=0}
  for(const [sx,sy] of [[0,0],[c.width-1,0],[0,c.height-1],[c.width-1,c.height-1]])removeAt(sx,sy);
  let head=0;const dirs=[[1,0],[-1,0],[0,1],[0,-1]];while(head<queue.length){const [xx,yy]=queue[head++];for(const [dx,dy] of dirs){const nx=xx+dx,ny=yy+dy;if(nx>=0&&nx<c.width&&ny>=0&&ny<c.height)removeAt(nx,ny)}}
  x.putImageData(data,0,0);const url=c.toDataURL('image/png');assets[key].src=url;ensurePhotoState(key).bgRemoved=true;imgCache[url]=await loadImg(url);render();drawPhotoEditor();alert('Background removed from similar connected corner areas. You can restore the original anytime.');
}
function restorePhoto(){const key=getPhotoKey(),a=assets[key];if(!a?.original)return;assets[key].src=a.original;ensurePhotoState(key).bgRemoved=false;render();drawPhotoEditor()}

// Drag selected poster element.
let dragging=false,last=null;
poster.addEventListener('pointerdown',e=>{dragging=true;poster.setPointerCapture(e.pointerId);last=e});
poster.addEventListener('pointermove',e=>{if(!dragging)return;const r=poster.getBoundingClientRect(),sx=W/r.width,sy=H/r.height,dx=(e.clientX-last.clientX)*sx,dy=(e.clientY-last.clientY)*sy;const k=$('elementSelect').value;if(elements[k]){elements[k].x=clamp(elements[k].x+dx,-500,500);elements[k].y=clamp(elements[k].y+dy,-500,500);syncElementControls();render()}last=e});
poster.addEventListener('pointerup',()=>{dragging=false});poster.addEventListener('pointercancel',()=>dragging=false);

function allSaved(){const o={};document.querySelectorAll('input,textarea,select').forEach(e=>{if(e.type!=='file'&&e.id)o[e.id]=e.value});return o}
function saveDraft(){const members={};for(const i of currentMemberIndexes()){members[i]={...memberData(i),state:memberState[i]}};localStorage.setItem('nssPosterDraftPro2',JSON.stringify({fields:allSaved(),elements,photoState,assets,members,memberCount:+$('memberCount').value}));alert('Draft saved on this device.')}
function currentMemberIndexes(){return [...document.querySelectorAll('.member-card')].map(d=>+d.querySelector('[data-i]')?.dataset.i).filter(Boolean)}
function loadDraft(){const raw=localStorage.getItem('nssPosterDraftPro2');if(!raw)return alert('No saved draft found.');const d=JSON.parse(raw);Object.assign(elements,d.elements||{});Object.assign(photoState,d.photoState||{});Object.assign(assets,d.assets||{});$('memberCount').value=d.memberCount||8;buildMembers();Object.entries(d.fields||{}).forEach(([id,v])=>{if($(id))$(id).value=v});for(const [i,m] of Object.entries(d.members||{})){memberState[i]={...(m.state||{}),savedName:m.name||'',savedMobile:m.mobile||'',savedSemester:m.semester||'5TH SEM',savedSubject:m.subject||'GENERAL'}}syncElementControls();syncPhotoControls();render();alert('Draft loaded.')}
function resetAll(){if(confirm('Reset all poster data?')){localStorage.removeItem('nssPosterDraftPro2');location.reload()}}
async function exportCanvas(){await render();const scale=+$('quality').value||2,c=document.createElement('canvas');c.width=W*scale;c.height=H*scale;c.getContext('2d').drawImage(poster,0,0,c.width,c.height);return c}
async function downloadPoster(type){const c=await exportCanvas(),a=document.createElement('a'),name='NSS-'+(esc(val('groupName'))||'Poster').replace(/\s+/g,'-');a.download=name+'.'+type;a.href=c.toDataURL(type==='jpg'?'image/jpeg':'image/png',.96);a.click()}
async function downloadPDF(){const c=await exportCanvas(),{jsPDF}=window.jspdf||{};if(!jsPDF)return alert('PDF library could not load. Connect to the internet once and retry.');const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});pdf.addImage(c.toDataURL('image/jpeg',.96),'JPEG',0,0,210,297);pdf.save('NSS-'+(esc(val('groupName'))||'Poster').replace(/\s+/g,'-')+'.pdf')}

setup();bindPhotoInputs();syncOutputs();
