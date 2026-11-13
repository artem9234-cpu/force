/* GFX v19 — подробные пиксель-спрайты 40×32 / 36×14. */
const GFX=(()=>{
'use strict';
const {bind,px,line,ell}=CORE;
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flipC(c){const f=blank(c.width,c.height),x=f.getContext('2d');
 x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function make(w,h,fn){const c=blank(w,h);const ctx=c.getContext('2d');bind(ctx);fn(ctx);return c;}
function R(list,c){for(const r of list)px(r[0],r[1],r[2],r[3],c);}
const PALS={
 antony:{o:'#0a0e15',s:'#f0b878',S:'#b87838',h:'#ffd9a8',
   hair:'#1a0a00',cloth:'#2a6fb0',clothHi:'#5aaee0',clothLo:'#17416e',
   boots:'#3a2010',bootHi:'#5a3820',accent:'#ff4a3d',accHi:'#ff8870'},
 artyom:{o:'#0a0e15',s:'#e8a870',S:'#b07038',h:'#f8c890',
   hair:'#3a1a08',cloth:'#4a5568',clothHi:'#7a8898',clothLo:'#242c3a',
   boots:'#1a1a1a',bootHi:'#3a3a3a',accent:'#ffa32a',accHi:'#ffd070'},
 den:{o:'#0a0e15',s:'#ffd9a8',S:'#c89868',h:'#ffe8c0',
   hair:'#0a1a28',cloth:'#17416e',clothHi:'#35a0b0',clothLo:'#0d2440',
   boots:'#1a1a2a',bootHi:'#3a3a5a',accent:'#35e0ff',accHi:'#a0f0ff'},
 dimka:{o:'#0a0e15',s:'#f0b878',S:'#b87838',h:'#ffd9a8',
   hair:'#3d1668',cloth:'#3d1668',clothHi:'#6a2bb0',clothLo:'#240b40',
   boots:'#2a2a3a',bootHi:'#4a4a6a',accent:'#a24bff',accHi:'#e0c2ff'}};
const GEAR={antony:'bandana',artyom:'helmet',den:'hood',dimka:'goggles'};
const POSES={
 idle:{legs:'stand',arms:'F_low',headDy:0,lean:0},
 run0:{legs:'runA',arms:'F_low',headDy:0,lean:1},
 run1:{legs:'runB',arms:'F_low',headDy:0,lean:1},
 run2:{legs:'runC',arms:'F_low',headDy:0,lean:1},
 run3:{legs:'runD',arms:'F_low',headDy:0,lean:1},
 jump:{legs:'tuck',arms:'F_hi',headDy:-1,lean:1},
 fall:{legs:'spread',arms:'F_hi',headDy:-1,lean:0},
 aimF:{legs:'stand',arms:'F',headDy:0,lean:0},
 aimU:{legs:'stand',arms:'U',headDy:0,lean:0},
 aimD:{legs:'stand',arms:'D',headDy:0,lean:0},
 aimDU:{legs:'stand',arms:'DU',headDy:0,lean:0},
 aimDD:{legs:'stand',arms:'DD',headDy:0,lean:0}};
const LEGS={
 stand:{lh:[16,19],lk:[15,24],lf:[13,29],rh:[24,19],rk:[25,24],rf:[27,29]},
 runA:{lh:[16,19],lk:[11,22],lf:[8,27],rh:[24,19],rk:[28,22],rf:[31,28]},
 runB:{lh:[16,19],lk:[15,23],lf:[14,29],rh:[24,19],rk:[25,23],rf:[25,29]},
 runC:{lh:[16,19],lk:[28,22],lf:[31,27],rh:[24,19],rk:[11,22],rf:[8,28]},
 runD:{lh:[16,19],lk:[18,24],lf:[14,30],rh:[24,19],rk:[25,23],rf:[28,30]},
 tuck:{lh:[16,19],lk:[12,22],lf:[16,26],rh:[24,19],rk:[28,22],rf:[31,26]},
 spread:{lh:[16,19],lk:[11,23],lf:[8,28],rh:[24,19],rk:[29,23],rf:[31,28]}};
const ARMS={
 F_low:{sx:25,sy:14,ex:29,ey:15,hx:32,hy:15,aim:'F'},
 F_hi:{sx:25,sy:13,ex:29,ey:11,hx:32,hy:10,aim:'F'},
 F:{sx:25,sy:14,ex:29,ey:14,hx:32,hy:14,aim:'F'},
 U:{sx:25,sy:13,ex:26,ey:9,hx:25,hy:6,aim:'U'},
 D:{sx:25,sy:14,ex:26,ey:18,hx:25,hy:21,aim:'D'},
 DU:{sx:25,sy:13,ex:29,ey:10,hx:33,hy:8,aim:'DU'},
 DD:{sx:25,sy:14,ex:29,ey:17,hx:33,hy:19,aim:'DD'}};
const TIPS={};
function drawHead(p,gear,pose){
 const dy=POSES[pose].headDy;
 R([[16,3+dy,8,6]],p.s);
 R([[16,3+dy,8,1]],p.h);
 R([[16,8+dy,8,1]],p.S);
 R([[18,6+dy,1,1]],p.o);
 R([[21,6+dy,1,1]],p.o);
 if(gear==='bandana'){
  R([[15,2+dy,10,2]],p.accent);
  R([[15,2+dy,10,1]],p.accHi);
  R([[15,4+dy,1,2]],p.accent);
  R([[16,8+dy,1,1]],p.accent);
 }else if(gear==='helmet'){
  R([[15,2+dy,10,3]],p.clothHi);
  R([[16,2+dy,8,1]],p.accHi);
  R([[15,5+dy,10,1]],p.clothLo);
  R([[15,2+dy,1,4]],p.clothLo);
  R([[24,2+dy,1,4]],p.clothLo);
 }else if(gear==='hood'){
  R([[15,2+dy,10,3]],p.cloth);
  R([[16,3+dy,8,2]],p.clothHi);
  R([[15,2+dy,1,6]],p.clothLo);
  R([[24,2+dy,1,6]],p.clothLo);
  R([[16,9+dy,8,1]],p.clothLo);
 }else if(gear==='goggles'){
  R([[15,3+dy,10,2]],p.cloth);
  R([[16,3+dy,3,2]],p.accHi);
  R([[21,3+dy,3,2]],p.accHi);
  R([[15,3+dy,1,2]],p.clothLo);
  R([[24,3+dy,1,2]],p.clothLo);}}
function drawTorso(p,gear,pose){
 const lean=POSES[pose].lean,ox=lean?1:0;
 R([[14-ox,9,12,9]],p.cloth);
 R([[14-ox,9,12,1]],p.clothHi);
 R([[14-ox,16,12,2]],p.clothLo);
 if(gear==='bandana'||gear==='hood'){
  R([[17-ox,10,6,4]],p.s);
  R([[15-ox,10,2,6]],p.clothLo);
  R([[23-ox,10,2,6]],p.clothLo);
  R([[19-ox,11,2,3]],p.S);
 }else if(gear==='helmet'){
  R([[15-ox,10,10,5]],p.clothHi);
  R([[17-ox,11,6,3]],p.clothLo);
  R([[19-ox,9,2,7]],p.accent);
  R([[19-ox,14,2,2]],p.accHi);
 }else if(gear==='goggles'){
  R([[14-ox,10,1,7]],p.clothHi);
  R([[25-ox,10,1,7]],p.clothHi);
  R([[17-ox,10,6,4]],p.clothLo);
  R([[18-ox,11,4,2]],p.accent);}
 R([[14-ox,17,12,1]],p.boots);
 R([[19-ox,17,2,1]],p.accHi);}
function drawLegs(p,legsKey){
 const L=LEGS[legsKey]||LEGS.stand;
 line(L.lh[0],L.lh[1],L.lk[0],L.lk[1],p.o,5);
 line(L.lk[0],L.lk[1],L.lf[0],L.lf[1],p.o,4);
 line(L.rh[0],L.rh[1],L.rk[0],L.rk[1],p.o,5);
 line(L.rk[0],L.rk[1],L.rf[0],L.rf[1],p.o,4);
 line(L.lh[0],L.lh[1],L.lk[0],L.lk[1],p.clothLo,3);
 line(L.lk[0],L.lk[1],L.lf[0],L.lf[1],p.clothLo,2);
 line(L.rh[0],L.rh[1],L.rk[0],L.rk[1],p.clothLo,3);
 line(L.rk[0],L.rk[1],L.rf[0],L.rf[1],p.clothLo,2);
 line(L.lh[0],L.lh[1]-1,L.lk[0],L.lk[1]-1,p.cloth,1);
 line(L.rh[0],L.rh[1]-1,L.rk[0],L.rk[1]-1,p.cloth,1);
 R([[L.lf[0]-2,L.lf[1]-2,5,3]],p.boots);
 R([[L.rf[0]-2,L.rf[1]-2,5,3]],p.boots);
 R([[L.lf[0]-2,L.lf[1]-2,5,1]],p.bootHi);
 R([[L.rf[0]-2,L.rf[1]-2,5,1]],p.bootHi);}
function drawWeapon(hx,hy,aim){
 let dx=0,dy=0;
 if(aim==='F'){dx=8;dy=0;}
 else if(aim==='U'){dx=0;dy=-6;}
 else if(aim==='D'){dx=0;dy=6;}
 else if(aim==='DU'){dx=5;dy=-5;}
 else if(aim==='DD'){dx=5;dy=5;}
 const tx=hx+dx,ty=hy+dy;
 line(hx,hy,tx,ty,'#0a0a15',4);
 line(hx,hy,tx,ty,'#4a4a5e',3);
 line(hx,hy-1,tx,ty-1,'#8a8a9a',1);
 ell(tx,ty,2,2,'#2a2a3a');
 ell(tx,ty,1,1,'#c0c0d0');
 return [tx,ty];}
function drawArms(p,armKey){
 const A=ARMS[armKey]||ARMS.F;
 line(A.sx,A.sy,A.ex,A.ey,p.o,4);
 line(A.ex,A.ey,A.hx,A.hy,p.o,3);
 line(A.sx,A.sy,A.ex,A.ey,p.s,3);
 line(A.ex,A.ey,A.hx,A.hy,p.s,2);
 line(A.sx,A.sy-1,A.ex,A.ey-1,p.h,1);
 ell(A.hx,A.hy,2,2,p.S);
 return drawWeapon(A.hx,A.hy,A.aim);}
function soldier(p,gear,pose){
 if(pose==='prone'){
  R([[2,6,10,8]],p.clothLo);
  R([[2,6,10,1]],p.cloth);
  line(4,9,10,8,p.o,4);line(4,9,10,8,p.clothLo,3);
  line(4,12,10,11,p.o,4);line(4,12,10,11,p.clothLo,3);
  R([[2,11,3,3]],p.boots);
  R([[12,4,14,10]],p.cloth);
  R([[12,4,14,1]],p.clothHi);
  R([[12,13,14,1]],p.clothLo);
  R([[16,7,4,3]],p.s);
  R([[25,3,9,7]],p.s);
  R([[25,3,9,1]],p.h);
  R([[27,6,1,1]],p.o);
  if(gear==='bandana'){R([[24,1,10,2]],p.accent);R([[24,1,10,1]],p.accHi);}
  else if(gear==='helmet'){R([[24,1,10,3]],p.clothHi);R([[25,1,8,1]],p.accHi);}
  else if(gear==='hood'){R([[24,1,10,3]],p.cloth);R([[25,2,8,2]],p.clothHi);}
  else if(gear==='goggles'){R([[24,2,10,2]],p.cloth);R([[27,2,2,2]],p.accHi);R([[31,2,2,2]],p.accHi);}
  line(22,8,28,8,p.o,4);line(22,8,28,8,p.s,3);
  drawWeapon(28,8,'F');
  TIPS.prone=[36,9];
  return;}
 drawLegs(p,POSES[pose].legs);
 drawTorso(p,gear,pose);
 drawHead(p,gear,pose);
 const tip=drawArms(p,POSES[pose].arms);
 TIPS[pose]=tip;}
const A={chars:{},foes:{}};
const POSES_LIST=['idle','run0','run1','run2','run3','jump','fall','aimF','aimU','aimD','aimDU','aimDD','prone'];
function buildChar(id){
 const p=PALS[id],gear=GEAR[id],set={};
 POSES_LIST.forEach(ps=>{
  const w=ps==='prone'?36:40,h=ps==='prone'?14:32;
  const c=make(w,h,()=>soldier(p,gear,ps));
  set[ps]={r:c,l:flipC(c)};});
 A.chars[id]=set;}
const EF={
 runner:{w:32,h:28,pal:['#5a3818','#2a1a08','#3a2010'],k:'grunt'},
 shooter:{w:32,h:28,pal:['#3a5a3a','#1a2a1a','#2a4a2a'],k:'grunt'},
 gunner:{w:32,h:28,pal:['#4a4a5e','#2a2a3a','#3a3a4e'],k:'grunt'},
 flamer:{w:32,h:28,pal:['#8a2a20','#4a1208','#6a1a10'],k:'grunt'},
 sniper:{w:32,h:28,pal:['#0d5570','#071628','#1a93b8'],k:'grunt'},
 grenadier:{w:32,h:28,pal:['#5a3818','#3a2010','#4a2a10'],k:'grunt'},
 jumper:{w:32,h:24,pal:['#3a5a3a','#1a2a1a','#2a4a2a'],k:'jumper'},
 crawler:{w:32,h:18,pal:['#4a3a2a','#2a1a0a','#3a2a1a'],k:'crawler'},
 bird:{w:32,h:20,pal:['#3a3a4a','#2a2a3a','#ff4a3d'],k:'flyer'},
 flyer:{w:32,h:20,pal:['#3a3a4a','#2a2a3a','#35e0ff'],k:'flyer'},
 turret:{w:32,h:24,pal:['#5a4a3a','#3a2a1a','#7a6a4a'],k:'turret'},
 bunker:{w:32,h:24,pal:['#5a4a3a','#3a2a1a','#7a6a4a'],k:'turret'},
 pod:{w:24,h:20,pal:['#a4e2ff','#2a6fb0','#e8f8ff'],k:'pod'}};
function drawGrunt(ctx,pal,v,fr){
 const o='#0a0e15',main=pal[0],dark=pal[1],hi=pal[2];
 const skin='#e8a870',skinS='#b07038';
 const L=LEGS[fr%2?'runA':'runB'];
 line(L.lh[0],L.lh[1],L.lk[0],L.lk[1],o,5);
 line(L.lk[0],L.lk[1],L.lf[0],L.lf[1],o,4);
 line(L.rh[0],L.rh[1],L.rk[0],L.rk[1],o,5);
 line(L.rk[0],L.rk[1],L.rf[0],L.rf[1],o,4);
 line(L.lh[0],L.lh[1],L.lk[0],L.lk[1],dark,3);
 line(L.lk[0],L.lk[1],L.lf[0],L.lf[1],dark,2);
 line(L.rh[0],L.rh[1],L.rk[0],L.rk[1],dark,3);
 line(L.rk[0],L.rk[1],L.rf[0],L.rf[1],dark,2);
 R([[L.lf[0]-2,L.lf[1]-2,5,3]],'#1a1a1a');
 R([[L.rf[0]-2,L.rf[1]-2,5,3]],'#1a1a1a');
 R([[12,9,12,8]],main);
 R([[12,9,12,1]],hi);
 R([[12,15,12,2]],dark);
 R([[12,17,12,1]],o);
 R([[18,17,2,1]],'#ffd400');
 R([[14,3,8,5]],skin);
 R([[14,3,8,1]],'#ffd9a8');
 R([[16,5,1,1]],o);
 R([[20,5,1,1]],o);
 R([[13,1,10,3]],dark);
 R([[14,1,8,1]],hi);
 R([[13,3,10,1]],'#1a1a1a');
 line(24,12,29,13,o,4);
 line(24,12,29,13,skin,3);
 ell(29,13,2,2,skinS);
 line(28,13,34,13,'#0a0a15',4);
 line(28,13,34,13,'#4a4a5e',3);
 line(28,12,34,12,'#8a8a9a',1);}
function drawJumper(ctx,pal,v,fr){
 const o='#0a0e15',main=pal[0],dark=pal[1],hi=pal[2],skin='#e8a870';
 const dy=fr?-1:0;
 R([[13,14+dy,4,8]],dark);
 R([[19,14+dy,4,8]],dark);
 R([[12,21+dy,5,3]],'#1a1a1a');
 R([[18,21+dy,5,3]],'#1a1a1a');
 R([[12,8+dy,12,7]],main);
 R([[12,8+dy,12,1]],hi);
 R([[14,2+dy,8,6]],skin);
 R([[14,2+dy,8,1]],'#ffd9a8');
 R([[16,4+dy,1,1]],o);
 R([[20,4+dy,1,1]],o);
 R([[13,0+dy,10,3]],dark);
 R([[14,0+dy,8,1]],hi);
 line(23,10+dy,30,10+dy,o,4);
 line(23,10+dy,30,10+dy,'#4a4a5e',3);}
function drawCrawler(ctx,pal,v,fr){
 const o='#0a0e15',main=pal[0],dark=pal[1],hi=pal[2];
 const wig=fr?1:-1;
 R([[2,4,24,8]],o);
 R([[3,5,22,6]],main);
 R([[4,5,20,1]],hi);
 R([[4,9,18,2]],dark);
 for(let i=0;i<6;i++){
  const lx=4+i*3,ly=11,off=(i%2?wig:-wig);
  R([[lx,ly,2,4+off]],dark);
  R([[lx-1,ly+4+off,4,2]],o);}
 R([[16,7,2,2]],'#ff4a3d');
 R([[21,7,2,2]],'#ff4a3d');
 R([[16,7,1,1]],'#ffd0a8');
 R([[21,7,1,1]],'#ffd0a8');}
function drawFlyer(ctx,pal,v,fr){
 const o='#0a0e15',main=pal[0],dark=pal[1],acc=pal[2];
 const wf=fr%2?1:-1;
 R([[8,8,18,8]],o);
 R([[9,9,16,6]],main);
 R([[10,9,14,1]],'#7a8a9a');
 R([[10,13,14,1]],dark);
 R([[2,6+wf*2,8,4]],dark);
 R([[24,6-wf*2,8,4]],dark);
 R([[2,6+wf*2,8,1]],main);
 R([[24,6-wf*2,8,1]],main);
 R([[12,11,3,2]],acc);
 R([[18,11,3,2]],acc);
 R([[13,11,1,1]],'#ffffff');
 R([[19,11,1,1]],'#ffffff');
 R([[13,15,6,2]],acc);
 R([[14,17,4,1]],acc);}
function drawTurret(ctx,pal,v,fr){
 const o='#0a0e15',main=pal[0],dark=pal[1],hi=pal[2];
 R([[4,14,24,8]],o);
 R([[5,15,22,6]],main);
 R([[5,15,22,1]],hi);
 R([[5,19,22,2]],dark);
 ell(16,12,9,7,o);
 ell(16,12,8,6,main);
 ell(15,11,5,3,hi);
 const scan=Math.sin(fr*1.5)*2;
 R([[11+scan,10,3,3]],'#ff4a3d');
 R([[19-scan,10,3,3]],'#ff4a3d');
 R([[12+scan,11,1,1]],'#ffffff');
 R([[20-scan,11,1,1]],'#ffffff');
 R([[14,4,4,10]],o);
 R([[15,5,2,9]],dark);}
function drawPod(ctx,pal,v,fr){
 const o='#0a0e15',main=pal[0],dark=pal[1],hi=pal[2];
 ell(12,10,11,10,dark);
 ell(12,10,9,9,o);
 ell(12,10,8,8,main);
 ell(11,9,5,5,hi);
 ell(12,10,3,3,'#ffd400');
 ell(12,10,2,2,'#ffffff');}
const KDRAW={grunt:drawGrunt,jumper:drawJumper,crawler:drawCrawler,flyer:drawFlyer,turret:drawTurret,pod:drawPod};
function buildFoes(){
 for(const type in EF){
  const spec=EF[type],arr=[];
  for(let v=0;v<3;v++){
   const frames=[];
   for(let fr=0;fr<3;fr++){
    const c=make(spec.w,spec.h,()=>KDRAW[spec.k](null,spec.pal,v,fr));
    frames.push({r:c,l:flipC(c)});}
   arr.push(frames);}
  A.foes[type]=arr;}}
let ready=false;
function init(){if(ready)return;
 for(const id in PALS)buildChar(id);
 buildFoes();ready=true;}
function poseOf(p){
 if(p.prone)return 'prone';
 if(!p.onGround)return p.vy<0?'jump':'fall';
 if(p.moving)return 'run'+(((p.anim|0)%4+4)%4);
 const ak=p.aimKey||'F';
 if(ak==='U')return 'aimU';
 if(ak==='DU')return 'aimDU';
 if(ak==='DD')return 'aimDD';
 if(ak==='D')return 'aimD';
 if(ak==='F')return 'aimF';
 return 'idle';}
function player(id,pose,left){
 const s=A.chars[id];if(!s)return null;
 const f=s[pose]||s.idle;
 return left?f.l:f.r;}
function foe(type,v,frame,left){
 const set=A.foes[type];if(!set)return null;
 if(v===undefined)return set;
 const arr=set[(v|0)%3];if(!arr)return null;
 const f=arr[((frame|0)%arr.length+arr.length)%arr.length];
 return f?(left?f.l:f.r):null;}
function tip(pose,left,sx,sy){
 const t=TIPS[pose]||TIPS.aimF||[33,14];
 const cw=pose==='prone'?36:40;
 const ox=t[0]-cw/2;
 return {x:sx+(left?-ox:ox),y:sy+(t[1]-14)};}
function aimKey(a){
 if(!a)return 'F';
 const x=a.raw?a.raw.x:a.x,y=a.raw?a.raw.y:a.y;
 if(y<0)return x===0?'U':'DU';
 if(y>0)return x===0?'D':'DD';
 return 'F';}
return {init,player,foe,poseOf,tip,aimKey,BUILD:19,
 get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
