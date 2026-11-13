/* GFX v23 — реалистичные бойцы 24x34, цикл бега, стойки прицела.
   Враги и API без изменений. */
const GFX=(()=>{
'use strict';
const PALS={
 antony:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',sS:'#d89858',p:'#2a6fb0',P:'#17416e',q:'#5aa8e0',b:'#5a300c',B:'#331a04',r:'#c22a22',rL:'#ff6a5a',rD:'#7d1610',y:'#c79a00',g:'#5b6a80',G:'#cdd8e6',gD:'#2c3648',v:'#8a5a28',V:'#c08848',vD:'#5a3818',a:'#ffd400',aL:'#fff6a8'},
 artyom:{o:'#0b0e15',s:'#e0a870',S:'#a87038',h:'#f8c890',sS:'#c88848',p:'#3d4759',P:'#242c3a',q:'#63728a',b:'#1d2536',B:'#0d1220',r:'#ff4a3d',rL:'#ff8870',rD:'#7d1610',y:'#ffa32a',g:'#4a5568',G:'#93a3ba',gD:'#242c3a',v:'#8a2a20',V:'#c24838',vD:'#4a120c',a:'#ffa32a',aL:'#ffd070'},
 den:{o:'#0b0e15',s:'#ffd9a8',S:'#d8a068',h:'#fff3d8',sS:'#e8b878',p:'#17416e',P:'#0d2440',q:'#2a6fb0',b:'#2a3448',B:'#141c2c',r:'#35e0ff',rL:'#a0f0ff',rD:'#0d5570',y:'#35e0ff',g:'#3d4759',G:'#93a3ba',gD:'#242c3a',v:'#1a6a78',V:'#35a0b0',vD:'#0d3a44',a:'#35e0ff',aL:'#d4fbff'},
 dimka:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',sS:'#d89858',p:'#3d1668',P:'#240b40',q:'#6a2bb0',b:'#1d2536',B:'#0d1220',r:'#a24bff',rL:'#e0c2ff',rD:'#3d1668',y:'#e0c2ff',g:'#0d5570',G:'#35e0ff',gD:'#071628',v:'#4a4a5e',V:'#7a7a92',vD:'#2a2a3a',a:'#a24bff',aL:'#e0c2ff'}};
const GEAR={antony:{head:'bandana',chest:'bare',back:0},artyom:{head:'helmet',chest:'plate',back:1},den:{head:'hood',chest:'light',back:0},dimka:{head:'goggles',chest:'exo',back:2}};
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flipC(c){const f=blank(c.width,c.height),x=f.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function paint(w,h,rects,pal){const c=blank(w,h),x=c.getContext('2d');
 for(const r of rects){const col=pal[r[4]]||'#ff00ff';
  x.fillStyle=pal.o||'#0b0e15';x.fillRect(r[0]-1,r[1]-1,r[2]+2,r[3]+2);
  x.fillStyle=col;x.fillRect(r[0],r[1],r[2],r[3]);}
 return c;}
/* ---- голова ---- */
function headR(g,dy){
 const r=[[10,2+dy,7,6,'s'],[10,2+dy,7,1,'h'],[10,7+dy,7,1,'S'],[14,4+dy,1,1,'o'],[13,3+dy,3,1,'S'],[11,7+dy,4,1,'S'],[10,4+dy,1,2,'S']];
 if(g.head==='bandana')r.push([9,1+dy,9,2,'r'],[9,1+dy,9,1,'rL'],[8,2+dy,1,3,'r'],[7,3+dy,2,2,'r'],[6,4+dy,2,2,'rD']);
 else if(g.head==='helmet')r.push([9,0+dy,9,3,'v'],[10,0+dy,7,1,'V'],[9,3+dy,9,1,'vD'],[13,1+dy,3,1,'a'],[10,6+dy,1,2,'vD']);
 else if(g.head==='hood')r.push([9,0+dy,9,7,'v'],[10,1+dy,7,2,'V'],[9,3+dy,1,4,'vD'],[17,3+dy,1,4,'vD'],[12,3+dy,5,4,'s'],[15,4+dy,1,1,'o']);
 else r.push([10,1+dy,7,2,'p'],[9,3+dy,9,2,'g'],[10,3+dy,3,1,'aL'],[14,3+dy,3,1,'aL'],[9,3+dy,1,2,'o'],[17,3+dy,1,2,'o'],[11,5+dy,6,3,'s'],[15,5+dy,1,1,'o']);
 return r;}
/* ---- торс ---- */
function torsoR(g,lean,bob){
 const ch=g.chest==='bare'?'s':(g.chest==='plate'?'v':'p');
 const hi=g.chest==='bare'?'h':(g.chest==='plate'?'V':'q'),lo=g.chest==='bare'?'S':(g.chest==='plate'?'vD':'P');
 const L=lean,b=bob;
 const r=[[8-L,9+b,9,2,ch],[9-L,11+b,7,4,ch],[10-L,11+b,3,2,hi],[13-L,11+b,2,2,hi],[12-L,13+b,1,2,lo],[9-L,11+b,1,4,lo],
  [9-L,17+b,7,2,'y'],[12-L,17+b,2,2,'G'],[9-L,19+b,7,1,'P']];
 if(g.chest==='bare')r.push([10-L,12+b,2,1,'S'],[13-L,12+b,2,1,'S'],[12-L,14+b,1,2,'S']);
 if(g.chest==='plate')r.push([9-L,11+b,7,4,'v'],[10-L,11+b,5,1,'V'],[12-L,12+b,2,3,'a']);
 if(g.chest==='light')r.push([12-L,9+b,1,8,'P'],[9-L,14+b,3,2,'vD'],[14-L,14+b,2,2,'vD']);
 if(g.chest==='exo')r.push([9-L,11+b,7,1,'P'],[9-L,14+b,7,1,'P'],[11-L,12+b,3,2,'a']);
 if(g.back===1)r.push([6-L,10+b,2,6,'P'],[6-L,11+b,1,4,'q']);
 if(g.back===2)r.push([6-L,10+b,2,6,'P'],[6-L,11+b,1,2,'a'],[6-L,14+b,1,2,'a']);
 return r;}
/* ---- ноги ---- */
function legR(tx,ty,sx,sy,bx,by,front){
 const c=front?'p':'P',hi=front?'q':'p';
 return[[tx,ty,3,6,c],[tx,ty,3,1,hi],[sx,sy,3,5,'P'],[sx,sy,3,1,c],[bx,by,5,2,'b'],[bx,by,5,1,'B'],[bx,by+2,5,1,'B'],[tx,ty+5,3,1,'q']];}
const LEGS={
 idle:()=>legR(9,20,9,26,8,31,true).concat(legR(13,20,13,26,12,31,false)),
 run0:()=>legR(8,20,6,25,5,31,true).concat(legR(13,20,15,25,14,31,false)),
 run1:()=>legR(10,20,10,25,9,30,true).concat(legR(13,20,14,24,13,28,false)),
 run2:()=>legR(13,20,15,25,14,31,true).concat(legR(8,20,6,25,5,31,false)),
 run3:()=>legR(13,20,13,25,12,30,true).concat(legR(10,20,9,24,8,28,false)),
 jump:()=>legR(8,20,7,24,6,28,true).concat(legR(13,20,14,24,13,28,false)),
 fall:()=>legR(8,20,6,26,5,31,true).concat(legR(14,20,16,26,15,31,false))};
/* ---- руки+оружие ---- */
function armsR(aim,swing,bob,lean){
 const L=lean,b=bob,r=[];
 if(aim==='U'){
  r.push([11,6+b,3,6,'s'],[11,3+b,2,4,'s'],[11,2+b,2,2,'sS'],[11,0,2,4,'g'],[11,0,1,4,'G'],[10,4+b,1,3,'gD']);
  return{r,tip:[12,0]};}
 if(aim==='DU'){
  r.push([12-L,9+b,4,3,'s'],[15-L,6+b,3,3,'s'],[17-L,5+b,2,2,'sS'],[17-L,4+b,3,2,'g'],[19-L,2+b,2,2,'g'],[17-L,4+b,3,1,'G']);
  return{r,tip:[21,2]};}
 if(aim==='DD'){
  r.push([12-L,13+b,4,3,'s'],[15-L,16+b,3,3,'s'],[17-L,18+b,2,2,'sS'],[17-L,18+b,3,2,'g'],[19-L,20+b,2,2,'g'],[17-L,18+b,3,1,'G']);
  return{r,tip:[21,22]};}
 /* F: задняя рука качается, передняя держит винтовку */
 r.push([9-L,11+b+swing,3,4,'sS'],[9-L,14+b+swing,2,2,'sS']);
 r.push([12-L,11+b,5,3,'s'],[16-L,12+b,3,2,'s'],[18-L,12+b,2,2,'sS']);
 r.push([16-L,12+b,3,2,'gD'],[18-L,11+b,4,2,'g'],[22-L,11+b,2,1,'g'],[19-L,10+b,1,1,'gD'],[19-L,13+b,2,2,'gD'],[18-L,11+b,4,1,'G']);
 return{r,tip:[24,12]};}
const TIPS={};
function soldierRects(g,pose){
 if(pose==='prone'){TIPS.prone=[23,19];
  return[[2,4,12,4,'p'],[2,4,12,1,'q'],[0,6,4,3,'b'],[0,8,4,1,'B'],[14,2,6,5,'s'],[14,2,6,1,'h'],[18,4,6,2,'g'],[18,4,6,1,'G'],[22,4,2,1,'gD']];}
 const isRun=pose.indexOf('run')===0;
 const lean=isRun?1:0,bob=(pose==='run1'||pose==='run3')?1:0;
 const swing=pose==='run0'?1:pose==='run2'?-1:0;
 const lk=LEGS[pose]?pose:'idle';
 const aim=pose==='aimU'?'U':pose==='aimDU'?'DU':pose==='aimDD'?'DD':'F';
 const a=armsR(aim,swing,bob,lean);
 TIPS[pose]=a.tip;
 return headR(g,bob).concat(torsoR(g,lean,bob),LEGS[lk](),a.r);}
const POSES=['idle','run0','run1','run2','run3','jump','fall','prone','aimU','aimDU','aimDD'];
const chars={};
function buildChar(id){const pal=PALS[id],g=GEAR[id],set={};
 POSES.forEach(ps=>{const w=ps==='prone'?26:24,h=ps==='prone'?10:34;
  const c=paint(w,h,soldierRects(g,ps),pal);set[ps]={r:c,l:flipC(c)};});
 chars[id]=set;}
/* ---- враги (без изменений) ---- */
const EV=[{u:'#478a2c',U:'#2c5e1c',r:'#2c5e1c',b:'#331a04',s:'#c98a4e'},{u:'#8a5a28',U:'#5a3818',r:'#5a3818',b:'#331a04',s:'#c98a4e'},{u:'#20485a',U:'#0f2838',r:'#0f2838',b:'#1d2536',s:'#c98a4e'}];
function enemyRects(type,v,fr){const p=Object.assign({o:'#0b0e15',g:'#5b6a80',G:'#cdd8e6',y:'#c79a00',f:'#ffb020',e:'#ff4a3d',w:'#eef4ff'},EV[v%3]);
 if(type==='flamer'){p.u='#8a2a20';p.U='#4a120c';p.r='#4a120c';}
 if(type==='sniper'){p.u='#0d5570';p.U='#071628';p.r='#1a93b8';}
 if(type==='gunner'){p.u='#4a4a5e';p.U='#2a2a3a';p.r='#2a2a3a';}
 if(type==='grenadier'){p.u='#5a3818';p.U='#3a2410';p.r='#3a2410';}
 if(type==='bird'||type==='flyer'){const w=fr%2?3:-2;
  return{p,rects:[[4,4,12,5,'u'],[5,5,8,2,'U'],[1,3+w,4,3,'U'],[15,3-w,4,3,'U'],[7,5,4,2,'e'],[7,9,2,3,'f'],[11,9,2,3,'f']]};}
 if(type==='turret'||type==='bunker'){const r=[[2,8,16,10,'g'],[3,9,14,2,'G'],[5,4,10,5,'g'],[6,5,6,2,'G'],[12,6,8,3,'g'],[7,5,4,2,'e']];
  if(type==='bunker')for(let k=0;k<4;k++)r.push([2+k*4,16,4,3,'y'],[2+k*4,16,4,1,'G']);
  return{p,rects:r};}
 if(type==='crawler'){const r=[[2,4,14,5,'u'],[3,5,10,2,'U'],[12,5,3,2,'e']];
  for(let i=0;i<5;i++){const s=(fr%2?1:-1)*(i%2?1:-1);r.push([3+i*3,9,2,3+s,'U']);}return{p,rects:r};}
 if(type==='jumper')return{p,rects:[[3,2,10,9,'u'],[4,3,6,3,'U'],[5,4,2,2,'y'],[9,4,2,2,'y'],[4,11,3,5,'U'],[9,11,3,5,'U'],[3,16,4,2,'b'],[9,16,4,2,'b']]};
 if(type==='pod')return{p,rects:[[2,2,12,12,'G'],[3,3,10,8,'w'],[5,5,6,4,'U'],[6,6,3,2,'w']]};
 const sw=fr%2?1:0;
 const r=[[4+sw,12,3,7,'u'],[9-sw,12,3,7,'u'],[4+sw,17,3,3,'U'],[9-sw,17,3,3,'U'],[3+sw,19,4,2,'b'],[9-sw,19,4,2,'b'],
  [4,5,8,7,'u'],[5,6,6,3,'U'],[4,0,8,3,'r'],[5,3,6,3,'s'],[9,4,1,1,'o']];
 if(type==='gunner')r.push([8,7,8,3,'g'],[10,5,4,2,'o']);
 else if(type==='flamer')r.push([1,5,3,7,'f'],[8,7,7,2,'g'],[14,6,2,3,'f']);
 else if(type==='sniper')r.push([8,7,12,2,'g'],[10,5,4,2,'G']);
 else if(type==='grenadier')r.push([8,6,5,2,'g'],[12,3,3,3,'u']);
 else r.push([8,7,8,2,'g']);
 return{p,rects:r};}
const foes={};
function buildFoes(){['runner','shooter','gunner','flamer','sniper','grenadier','rappeller','jumper','crawler','bird','flyer','turret','bunker','pod'].forEach(t=>{
 foes[t]=[];for(let v=0;v<3;v++){const frames=[0,1,2].map(fr=>{const e=enemyRects(t==='rappeller'?'gunner':t,v,fr);
  const c=paint(24,22,e.rects,e.p);return{r:c,l:flipC(c)};});foes[t].push(frames);}});}
let ready=false;
function init(){if(ready)return;Object.keys(PALS).forEach(buildChar);buildFoes();ready=true;}
function poseOf(p){if(p.prone)return'prone';if(!p.onGround)return p.vy<0?'jump':'fall';if(p.moving)return'run'+((p.anim|0)%4);
 const ak=p.aimKey||'F';if(ak==='U')return'aimU';if(ak==='DU')return'aimDU';if(ak==='DD')return'aimDD';return'idle';}
function player(id,pose,left){const s=chars[id];if(!s)return null;const f=s[pose]||s.idle;return left?f.l:f.r;}
function foe(type,v,frame,left){const set=foes[type];if(!set)return null;if(v===undefined)return set;
 const arr=set[(v|0)%3];if(!arr||!arr.length)return null;if(frame===undefined)return arr;
 const f=arr[((frame|0)%arr.length+arr.length)%arr.length];return f?(left?f.l:f.r):null;}
function tip(pose,left,sx,sy){const t=TIPS[pose]||TIPS.idle||[24,12];return{x:sx+(left?-(t[0]-12):(t[0]-12)),y:sy+(t[1]-19)};}
function aimKey(a){if(!a)return'F';const x=a.raw?a.raw.x:a.x,y=a.raw?a.raw.y:a.y;
 if(y<0)return x===0?'U':'DU';if(y>0)return x===0?'D':'DD';return'F';}
return {init,player,foe,tip,aimKey,poseOf,BUILD:23,get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
