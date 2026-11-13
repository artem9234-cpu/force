/* GFX v22 — спрайты-прямоугольники с обводкой и запасным цветом */
const GFX=(()=>{
'use strict';
const PALS={
 antony:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',p:'#2a6fb0',P:'#17416e',q:'#5aa8e0',b:'#5a300c',B:'#331a04',r:'#c22a22',y:'#c79a00',g:'#5b6a80',G:'#cdd8e6',v:'#8a5a28',V:'#c08848',a:'#ffd400'},
 artyom:{o:'#0b0e15',s:'#e0a870',S:'#a87038',h:'#f8c890',p:'#3d4759',P:'#242c3a',q:'#63728a',b:'#1d2536',B:'#0d1220',r:'#ff4a3d',y:'#ffa32a',g:'#4a5568',G:'#93a3ba',v:'#8a2a20',V:'#c24838',a:'#ffa32a'},
 den:{o:'#0b0e15',s:'#ffd9a8',S:'#d8a068',h:'#fff3d8',p:'#17416e',P:'#0d2440',q:'#2a6fb0',b:'#2a3448',B:'#141c2c',r:'#35e0ff',y:'#35e0ff',g:'#3d4759',G:'#93a3ba',v:'#1a6a78',V:'#35a0b0',a:'#35e0ff'},
 dimka:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',p:'#3d1668',P:'#240b40',q:'#6a2bb0',b:'#1d2536',B:'#0d1220',r:'#a24bff',y:'#e0c2ff',g:'#0d5570',G:'#35e0ff',v:'#4a4a5e',V:'#7a7a92',a:'#a24bff'}};
const GEAR={antony:{head:'bandana',chest:'bare',back:0},artyom:{head:'helmet',chest:'plate',back:1},den:{head:'hood',chest:'light',back:0},dimka:{head:'goggles',chest:'exo',back:2}};
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flipC(c){const f=blank(c.width,c.height),x=f.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function paint(w,h,rects,pal){const c=blank(w,h),x=c.getContext('2d');
 for(const r of rects){const col=pal[r[4]]||'#ff00ff';
  x.fillStyle=pal.o||'#0b0e15';x.fillRect(r[0]-1,r[1]-1,r[2]+2,r[3]+2);
  x.fillStyle=col;x.fillRect(r[0],r[1],r[2],r[3]);}
 return c;}
function headR(g){if(g.head==='bandana')return[[6,0,8,2,'r'],[5,1,2,3,'r'],[4,3,2,2,'r'],[6,2,8,4,'s'],[7,2,3,2,'h'],[11,3,1,1,'o'],[8,5,4,1,'S']];
 if(g.head==='helmet')return[[5,0,10,3,'v'],[6,1,8,1,'V'],[7,3,7,2,'g'],[8,3,4,1,'G'],[7,5,6,1,'s']];
 if(g.head==='hood')return[[5,0,10,6,'v'],[6,1,8,4,'V'],[8,2,5,4,'s'],[11,3,1,1,'o']];
 return[[6,0,8,2,'p'],[5,2,10,2,'g'],[6,2,4,1,'a'],[11,2,3,1,'a'],[7,4,6,2,'s'],[11,4,1,1,'o']];}
function torsoR(g){const ch=g.chest==='bare'?'s':(g.chest==='plate'?'v':'p');
 const hi=g.chest==='bare'?'h':(g.chest==='plate'?'V':'q'),lo=g.chest==='bare'?'S':(g.chest==='plate'?'v':'P');
 const r=[[5,6,10,2,ch],[6,8,8,4,ch],[7,8,3,2,hi],[6,11,8,1,lo]];
 if(g.chest==='bare')r.push([7,9,6,1,'S'],[9,10,1,2,'S']);
 if(g.chest==='plate')r.push([7,8,6,1,'V'],[9,9,2,3,'a']);
 if(g.chest==='light')r.push([9,6,1,6,'P'],[6,10,8,1,'a']);
 if(g.chest==='exo')r.push([6,8,8,1,'P'],[6,11,8,1,'P'],[8,9,4,2,'a']);
 if(g.back===1)r.push([3,7,2,6,'P'],[3,8,1,4,'q']);
 if(g.back===2)r.push([3,7,2,6,'P'],[3,8,1,2,'a'],[3,11,1,2,'a']);
 r.push([6,14,8,2,'y'],[9,14,2,2,'G']);return r;}
const LEGS={
 idle:[[6,16,3,8,'p'],[6,24,3,4,'P'],[5,28,5,2,'b'],[5,28,5,1,'B'],[11,16,3,8,'p'],[11,24,3,4,'P'],[10,28,5,2,'b'],[10,28,5,1,'B']],
 run0:[[5,16,3,6,'p'],[4,22,3,6,'P'],[3,28,5,2,'b'],[11,16,3,6,'p'],[12,22,3,6,'P'],[11,28,5,2,'b']],
 run1:[[7,16,3,8,'p'],[7,24,3,4,'P'],[6,28,5,2,'b'],[10,16,3,8,'p'],[10,24,3,4,'P'],[9,28,5,2,'b']],
 run2:[[11,16,3,6,'p'],[12,22,3,6,'P'],[11,28,5,2,'b'],[5,16,3,6,'p'],[4,22,3,6,'P'],[3,28,5,2,'b']],
 run3:[[6,16,3,5,'p'],[5,21,3,4,'P'],[4,25,5,2,'b'],[11,16,3,8,'p'],[11,24,3,4,'P'],[10,28,5,2,'b']],
 jump:[[5,16,3,5,'p'],[4,21,3,4,'P'],[3,25,5,2,'b'],[11,16,3,5,'p'],[12,21,3,4,'P'],[11,25,5,2,'b']],
 fall:[[5,16,3,7,'p'],[4,23,3,5,'P'],[3,28,5,2,'b'],[12,16,3,7,'p'],[13,23,3,5,'P'],[12,28,5,2,'b']]};
const ARMS={
 F:{r:[[10,8,6,3,'s'],[15,9,5,2,'g'],[15,9,5,1,'G'],[14,11,2,2,'o']],tip:[20,10]},
 U:{r:[[10,4,3,5,'s'],[11,0,2,5,'g'],[11,0,1,5,'G'],[10,9,2,2,'o']],tip:[12,0]},
 DU:{r:[[10,6,5,3,'s'],[13,4,2,2,'g'],[15,2,2,2,'g'],[13,4,2,1,'G'],[12,9,2,2,'o']],tip:[17,2]},
 DD:{r:[[10,10,5,3,'s'],[13,12,2,2,'g'],[15,14,2,2,'g'],[13,12,2,1,'G'],[12,11,2,2,'o']],tip:[17,16]},
 D:{r:[[10,10,3,5,'s'],[11,15,2,5,'g'],[11,15,1,5,'G'],[10,10,2,2,'o']],tip:[12,20]}};
const TIPS={};
function soldierRects(g,pose){
 if(pose==='prone'){TIPS.prone=[24,5];
  return[[2,4,12,4,'p'],[2,4,12,1,'q'],[0,6,4,3,'b'],[14,2,6,5,'s'],[18,4,6,2,'g'],[18,4,6,1,'G']];}
 const lk=(pose==='idle'||pose==='aimU'||pose==='aimDU'||pose==='aimDD')?'idle':pose;
 const aim=pose==='aimU'?'U':pose==='aimDU'?'DU':pose==='aimDD'?'DD':'F';
 TIPS[pose]=ARMS[aim].tip;
 return headR(g).concat(torsoR(g),LEGS[lk]||LEGS.idle,ARMS[aim].r);}
const POSES=['idle','run0','run1','run2','run3','jump','fall','prone','aimU','aimDU','aimDD'];
const chars={};
function buildChar(id){const pal=PALS[id],g=GEAR[id],set={};
 POSES.forEach(ps=>{const w=ps==='prone'?24:20,h=ps==='prone'?10:30;
  const c=paint(w,h,soldierRects(g,ps),pal);set[ps]={r:c,l:flipC(c)};});
 chars[id]=set;}
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
function tip(pose,left,sx,sy){const t=TIPS[pose]||TIPS.idle||[20,10];return{x:sx+(left?-(t[0]-10):(t[0]-10)),y:sy+(t[1]-15)};}
function aimKey(a){if(!a)return'F';const x=a.raw?a.raw.x:a.x,y=a.raw?a.raw.y:a.y;
 if(y<0)return x===0?'U':'DU';if(y>0)return x===0?'D':'DD';return'F';}
return {init,player,foe,tip,aimKey,poseOf,BUILD:22,get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
