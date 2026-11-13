const GFX=(()=>{
'use strict';
const {bind,px,line,ell,tri}=CORE;
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flipC(c){const f=blank(c.width,c.height),x=f.getContext('2d');
 x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function make(w,h,fn){const c=blank(w,h);const ctx=c.getContext('2d');bind(ctx);fn(ctx);return c;}

// Палитры (Skin, Cloth, Pants, Accent)
const PALS={
 antony:{s:'#f0b878',sL:'#ffd9a8',sD:'#c07840', c:'#2a6fb0',cL:'#5aaee0',cD:'#17416e', p:'#4a55d0',pL:'#7a88ff',pD:'#2a3080', a:'#ff4a3d',aL:'#ff8870'},
 artyom:{s:'#e8a870',sL:'#f8c890',sD:'#a87038', c:'#4a5568',cL:'#7a8898',cD:'#242c3a', p:'#3a4050',pL:'#5a6070',pD:'#1a1a2a', a:'#ffa32a',aL:'#ffd070'},
 den:{s:'#ffd9a8',sL:'#ffe8c0',sD:'#c89868', c:'#17416e',cL:'#35a0b0',cD:'#0d2440', p:'#1a3a5a',pL:'#2a6a8a',pD:'#0a1a2a', a:'#35e0ff',aL:'#a0f0ff'},
 dimka:{s:'#f0b878',sL:'#ffd9a8',sD:'#c07840', c:'#3d1668',cL:'#6a2bb0',cD:'#240b40', p:'#2a2a3a',pL:'#4a4a6a',pD:'#1a1a2a', a:'#a24bff',aL:'#e0c2ff'}};

const A={chars:{},foes:{}};

// Отрисовка торса с затенением и контуром
function drawTorso(ctx,p,lean){
 const ox=lean?1:0;
 // Задняя рука
 line(20,12,22,18,'#000',4);line(20,12,22,18,p.cD,3);
 // Торс
 CORE.box(13-ox,8,10,8,p.c,'#000');
 px(13-ox,8,10,2,p.cL);
 px(13-ox,14,10,2,p.cD);
 // Грудь (мышцы)
 px(15-ox,10,3,2,p.sD);
 px(18-ox,10,3,2,p.sL);
 // Ремень
 px(13-ox,15,10,2,p.pD);
 px(13-ox,15,10,1,'#000');
 // Передняя рука (зависит от прицела, рисуется в drawArms)
}

function drawHead(ctx,p,gear,dy){
 CORE.box(15,2+dy,6,6,p.s,'#000');
 px(15,2+dy,6,1,p.sL);
 px(15,7+dy,6,1,p.sD);
 // Глаз
 px(18,4+dy,1,1,'#000');
 
 if(gear==='bandana'){
  px(14,1+dy,8,2,p.a);
  px(14,1+dy,8,1,p.aL);
  px(14,3+dy,2,1,p.a);
  px(20,3+dy,2,1,p.a);
  px(13,2+dy,1,2,p.a);
 }else if(gear==='helmet'){
  CORE.box(14,0+dy,8,3,p.cL,'#000');
  px(15,0+dy,6,1,p.aL);
  px(14,3+dy,8,1,p.cD);
  px(18,1+dy,2,1,p.a);
 }else if(gear==='hood'){
  px(14,0+dy,8,3,p.c);
  px(15,1+dy,6,2,p.cL);
  px(14,3+dy,1,4,p.cD);
  px(21,3+dy,1,4,p.cD);
 }else if(gear==='goggles'){
  px(14,2+dy,8,2,p.cD);
  px(15,2+dy,2,2,p.aL);
  px(19,2+dy,2,2,p.aL);
  px(14,2+dy,1,2,'#000');
  px(21,2+dy,1,2,'#000');
 }
}

const GEAR={antony:'bandana',artyom:'helmet',den:'hood',dimka:'goggles'};

function drawWeapon(ctx,armX,armY,aimX,aimY){
 // Ствол
 const dx=aimX-armX, dy=aimY-armY, L=Math.hypot(dx,dy), nx=dx/L, ny=dy/L;
 const gx=armX+nx*4, gy=armY+ny*4;
 line(armX,armY,gx,gy,'#000',6);
 line(armX,armY,gx,gy,'#5a6070',4);
 line(armX,armY-1,gx,gy-1,'#8a90a0',1);
 // Дуло
 CORE.ell(gx,gy,2,2,'#000');
 CORE.ell(gx,gy,1,1,'#c0c0d0');
 // Приклад
 CORE.ell(armX,armY,2,2,'#3a4050');
}

function drawArms(ctx,p,aim){
 // Определяем позиции рук в зависимости от угла
 let hx=24,hy=12; // Дефолт (вперед)
 if(aim==='U'){hx=18;hy=4;}
 else if(aim==='D'){hx=18;hy=20;}
 else if(aim==='DU'){hx=22;hy=6;}
 else if(aim==='DD'){hx=22;hy=18;}
 
 // Задняя рука (держит цевье)
 line(18,10,hx-2,hy,'#000',4);
 line(18,10,hx-2,hy,p.sD,3);

 // Передняя рука (держит пистолетную рукоять)
 line(20,12,hx,hy,'#000',5);
 line(20,12,hx,hy,p.s,3);
 
 // Плечо
 CORE.ell(20,12,2,2,p.sL);
 
 // Оружие
 drawWeapon(ctx,hx,hy,hx+(hx>20?6:-6),hy+(hy>12?6:hy<12?-6:0));
}

const LEGS={
 idle:{lhx:16,lhy:16,lkx:15,lky:22,lfx:14,lfy:28, rhx:19,rhy:16,rkx:20,rky:22,rfx:21,rfy:28},
 run0:{lhx:16,lhy:16,lkx:11,lky:20,lfx:8,lfy:26, rhx:19,rhy:16,rkx:22,rky:20,rfx:25,rfy:26},
 run1:{lhx:16,lhy:16,lkx:14,lky:22,lfx:13,lfy:28, rhx:19,rhy:16,rkx:20,rky:22,rfx:21,rfy:28},
 run2:{lhx:16,lhy:16,lkx:22,lky:20,lfx:25,lfy:26, rhx:19,rhy:16,rkx:11,rky:20,rfx:8,rfy:26},
 run3:{lhx:16,lhy:16,lkx:18,lky:22,lfx:17,lfy:28, rhx:19,rhy:16,rkx:20,rky:22,rfx:21,rfy:28},
 run4:{lhx:16,lhy:16,lkx:11,lky:24,lfx:14,lfy:28, rhx:19,rhy:16,rkx:22,rky:24,rfx:21,rfy:28},
 run5:{lhx:16,lhy:16,lkx:15,lky:20,lfx:13,lfy:26, rhx:19,rhy:16,rkx:20,rky:20,rfx:21,rfy:26},
 jump:{lhx:16,lhy:16,lkx:12,lky:22,lfx:16,lfy:26, rhx:19,rhy:16,rkx:22,rky:22,rfx:21,rfy:26},
 fall:{lhx:16,lhy:16,lkx:12,lky:24,lfx:10,lfy:28, rhx:19,rhy:16,rkx:23,rky:24,rfx:25,rfy:28}};

function drawLegs(ctx,p,pose){
 const L=LEGS[pose]||LEGS.idle;
 // Задняя нога
 CORE.line(L.rhx,L.rhy,L.rkx,L.rky,'#000',5);
 CORE.line(L.rkx,L.rky,L.rfx,L.rfy,'#000',4);
 CORE.line(L.rhx,L.rhy,L.rkx,L.rky,p.pD,3);
 CORE.line(L.rkx,L.rky,L.rfx,L.rfy,p.pD,2);
 // Задний ботинок
 CORE.box(L.rfx-2,L.rfy-2,5,3,'#2a2a3a','#000');
 
 // Передняя нога
 CORE.line(L.lhx,L.lhy,L.lkx,L.lky,'#000',5);
 CORE.line(L.lkx,L.lky,L.lfx,L.lfy,'#000',4);
 CORE.line(L.lhx,L.lhy,L.lkx,L.lky,p.p,3);
 CORE.line(L.lkx,L.lky,L.lfx,L.lfy,p.p,2);
 CORE.line(L.lhx,L.lhy-1,L.lkx,L.lky-1,p.pL,1);
 // Передний ботинок
 CORE.box(L.lfx-2,L.lfy-2,5,3,'#3a3a4a','#000');
 CORE.px(L.lfx-2,L.lfy-2,5,1,'#5a5a6a');
}

function soldier(ctx,p,gear,pose){
 if(pose==='prone'){
  // Лежачая поза
  CORE.box(2,6,12,6,p.c,'#000');
  CORE.px(2,6,12,1,p.cL);
  CORE.line(4,9,10,8,'#000',4); CORE.line(4,9,10,8,p.pD,3);
  CORE.line(4,12,10,11,'#000',4); CORE.line(4,12,10,11,p.pD,3);
  CORE.box(14,4,10,6,p.s,'#000');
  CORE.px(14,4,10,1,p.sL);
  if(gear==='bandana')CORE.px(13,3,12,2,p.a);
  if(gear==='helmet')CORE.px(13,3,12,2,p.cL);
  if(gear==='hood')CORE.px(13,3,12,3,p.c);
  if(gear==='goggles'){CORE.px(13,4,12,1,p.cD);CORE.px(16,4,2,1,p.aL);}
  CORE.line(22,7,28,7,'#000',4);CORE.line(22,7,28,7,p.s,3);
  drawWeapon(ctx,28,7,34,7);
  return;
 }
 
 // Обычная поза
 drawLegs(ctx,p,pose);
 
 const lean = (pose.startsWith('run')||pose==='jump') ? 1 : 0;
 drawTorso(ctx,p,lean);
 
 const dy = pose==='jump' ? -1 : 0;
 drawHead(ctx,p,gear,dy);
 
 let aim='F';
 if(pose==='aimU')aim='U';
 if(pose==='aimD')aim='D';
 if(pose==='aimDU')aim='DU';
 if(pose==='aimDD')aim='DD';
 drawArms(ctx,p,aim);
}

const POSES_LIST=['idle','run0','run1','run2','run3','run4','run5','jump','fall','aimF','aimU','aimD','aimDU','aimDD','prone'];

function buildChar(id){
 const p=PALS[id],gear=GEAR[id],set={};
 POSES_LIST.forEach(ps=>{
  const w=ps==='prone'?36:40,h=ps==='prone'?14:32;
  const c=make(w,h,()=>soldier(p,gear,ps));
  set[ps]={r:c,l:flipC(c)};});
 A.chars[id]=set;}

// --- ВРАГИ ---
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
 const main=pal[0],dark=pal[1],hi=pal[2];
 const L=LEGS[fr%2?'run0':'run2'];
 CORE.line(L.lhx,L.lhy,L.lkx,L.lky,'#000',5);CORE.line(L.lkx,L.lky,L.lfx,L.lfy,'#000',4);
 CORE.line(L.lhx,L.lhy,L.lkx,L.lky,dark,3);CORE.line(L.lkx,L.lky,L.lfx,L.lfy,dark,2);
 CORE.line(L.rhx,L.rhy,L.rkx,L.rky,'#000',5);CORE.line(L.rkx,L.rky,L.rfx,L.rfy,'#000',4);
 CORE.line(L.rhx,L.rhy,L.rkx,L.rky,dark,3);CORE.line(L.rkx,L.rky,L.rfx,L.rfy,dark,2);
 CORE.box(L.lfx-2,L.lfy-2,5,3,'#1a1a1a','#000');CORE.box(L.rfx-2,L.rfy-2,5,3,'#1a1a1a','#000');
 CORE.box(12,8,12,8,main,'#000');
 CORE.px(12,8,12,1,hi);
 CORE.px(12,14,12,2,dark);
 CORE.px(14,10,3,2,CORE.P.sD); CORE.px(19,10,3,2,CORE.P.sL); // броня
 CORE.box(14,2,8,6,CORE.P.s,'#000');
 CORE.px(14,2,8,1,CORE.P.sL);
 CORE.px(16,4,1,1,'#000');CORE.px(19,4,1,1,'#000');
 CORE.box(13,0,10,3,dark,'#000');
 CORE.px(14,0,8,1,hi);
 // рука с оружием
 CORE.line(22,10,28,11,'#000',4);CORE.line(22,10,28,11,CORE.P.s,3);
 drawWeapon(ctx,28,11,34,11);
}
function drawJumper(ctx,pal,v,fr){
 const main=pal[0],dark=pal[1],hi=pal[2],dy=fr?-1:0;
 CORE.box(13,13+dy,4,8,dark,'#000');CORE.box(19,13+dy,4,8,dark,'#000');
 CORE.box(12,21+dy,5,3,'#000','#000');CORE.box(18,21+dy,5,3,'#000','#000');
 CORE.box(12,7+dy,12,7,main,'#000');CORE.px(12,7+dy,12,1,hi);
 CORE.box(14,1+dy,8,6,CORE.P.s,'#000');CORE.px(16,3+dy,1,1,'#000');CORE.px(19,3+dy,1,1,'#000');
 CORE.box(13,0+dy,10,2,dark,'#000');CORE.px(14,0+dy,8,1,hi);
 CORE.line(23,9+dy,30,9+dy,'#000',4);CORE.line(23,9+dy,30,9+dy,'#5a6070',3);
 drawWeapon(ctx,30,9+dy,35,9+dy);
}
function drawCrawler(ctx,pal,v,fr){
 const main=pal[0],dark=pal[1],hi=pal[2],wig=fr?1:-1;
 CORE.box(2,4,24,8,dark,'#000');
 CORE.px(3,5,22,6,main);CORE.px(4,5,20,1,hi);
 for(let i=0;i<6;i++){
  const lx=4+i*3,ly=11,off=(i%2?wig:-wig);
  CORE.line(lx,ly,lx,ly+4+off,'#000',2);
  CORE.box(lx-1,ly+4+off,4,2,dark,'#000');
 }
 CORE.px(16,7,2,2,'#ff4a3d');CORE.px(21,7,2,2,'#ff4a3d');
 CORE.px(16,7,1,1,'#fff');CORE.px(21,7,1,1,'#fff');
}
function drawFlyer(ctx,pal,v,fr){
 const main=pal[0],dark=pal[1],acc=pal[2],wf=fr%2?1:-1;
 CORE.box(9,8,14,6,main,'#000');CORE.px(10,8,12,1,CORE.P.w);
 CORE.box(2,5+wf*2,8,4,dark,'#000');CORE.box(22,5-wf*2,8,4,dark,'#000');
 CORE.px(2,5+wf*2,8,1,main);CORE.px(22,5-wf*2,8,1,main);
 CORE.px(12,10,3,2,acc);CORE.px(18,10,3,2,acc);
 CORE.px(13,10,1,1,'#fff');CORE.px(19,10,1,1,'#fff');
 CORE.box(13,14,6,2,acc,'#000');
}
function drawTurret(ctx,pal,v,fr){
 const main=pal[0],dark=pal[1],hi=pal[2];
 CORE.box(4,14,24,8,main,'#000');CORE.px(5,14,22,1,hi);
 CORE.px(5,20,22,2,dark);
 CORE.ellO(16,12,9,7,main,'#000');CORE.ell(15,10,5,3,hi);
 const scan=Math.sin(fr*1.5)*2;
 CORE.ell(11+scan,10,3,3,'#ff4a3d');CORE.ell(19-scan,10,3,3,'#ff4a3d');
 CORE.px(11+scan,9,1,1,'#fff');CORE.px(19-scan,9,1,1,'#fff');
 CORE.box(14,4,4,10,dark,'#000');CORE.px(15,4,2,10,'#000');
}
function drawPod(ctx,pal,v,fr){
 const main=pal[0],dark=pal[1],hi=pal[2];
 CORE.ell(12,10,11,10,dark);CORE.ell(12,10,9,9,'#000');
 CORE.ell(12,10,8,8,main);CORE.ell(11,9,5,5,hi);
 CORE.ell(12,10,3,3,'#ffd400');CORE.ell(12,10,2,2,'#fff');
}
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
 if(p.moving)return 'run'+(((p.anim|0)%6+6)%6);
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
 let tx=34,ty=14; // Дефолт для F
 if(pose==='aimU'){tx=18;ty=4;}
 if(pose==='aimD'){tx=18;ty=20;}
 if(pose==='aimDU'){tx=24;ty=6;}
 if(pose==='aimDD'){tx=24;ty=18;}
 if(pose==='prone'){tx=34;ty=7;}
 const cw=pose==='prone'?36:40;
 const ox=tx-cw/2;
 return {x:sx+(left?-ox:ox),y:sy+(ty-14)};}
function aimKey(a){
 if(!a)return 'F';
 const x=a.raw?a.raw.x:a.x,y=a.raw?a.raw.y:a.y;
 if(y<0)return x===0?'U':'DU';
 if(y>0)return x===0?'D':'DD';
 return 'F';}
return {init,player,foe,poseOf,tip,aimKey,BUILD:20,
 get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
