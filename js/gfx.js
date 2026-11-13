/* ============================================================
   GFX v16 — компактный скелетный спрайт-движок.
   Пропорции 1:5 (голова:рост), длинные ноги, оружие в руках.
   Кадры запекаются в canvas при init. Файл короткий = не режется.
   ============================================================ */
const GFX=(()=>{
'use strict';
const {bind,px,box,ell,ellO,limb,tri}=CORE;
const CW=34,CH=44;
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flipC(c){const f=blank(c.width,c.height),x=f.getContext('2d');
 x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function make(w,h,fn){const c=blank(w,h);bind(c.getContext('2d'));fn(c.getContext('2d'));return c;}

const PALS={
 antony:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',p:'#2a6fb0',P:'#17416e',q:'#5aa8e0',
   b:'#5a300c',B:'#331a04',r:'#c22a22',y:'#c79a00',g:'#5b6a80',G:'#cdd8e6',v:'#8a5a28',V:'#c08848',a:'#ffd400'},
 artyom:{o:'#0b0e15',s:'#e0a870',S:'#a87038',h:'#f8c890',p:'#3d4759',P:'#242c3a',q:'#63728a',
   b:'#1d2536',B:'#0d1220',r:'#ff4a3d',y:'#ffa32a',g:'#4a5568',G:'#93a3ba',v:'#8a2a20',V:'#c24838',a:'#ffa32a'},
 den:{o:'#0b0e15',s:'#ffd9a8',S:'#d8a068',h:'#fff3d8',p:'#17416e',P:'#0d2440',q:'#2a6fb0',
   b:'#2a3448',B:'#141c2c',r:'#35e0ff',y:'#35e0ff',g:'#3d4759',G:'#93a3ba',v:'#1a6a78',V:'#35a0b0',a:'#35e0ff'},
 dimka:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',p:'#3d1668',P:'#240b40',q:'#6a2bb0',
   b:'#1d2536',B:'#0d1220',r:'#a24bff',y:'#e0c2ff',g:'#0d5570',G:'#35e0ff',v:'#4a4a5e',V:'#7a7a92',a:'#a24bff'}};
const GEAR={
 antony:{head:'bandana',chest:'bare',back:0},
 artyom:{head:'helmet',chest:'plate',back:1},
 den:{head:'hood',chest:'light',back:0},
 dimka:{head:'goggles',chest:'exo',back:2}};

const AIMOFF={F:[9,2],U:[2,-9],DU:[7,-6],DD:[7,7],D:[2,9]};
function leg(x,hx,hy,a,pal,back){
 const kx=hx+Math.sin(a[0])*6,ky=hy+Math.cos(a[0])*6;
 const fx=kx+Math.sin(a[0]+a[1])*6,fy=ky+Math.cos(a[0]+a[1])*6;
 const c=back?pal.P:pal.p,hi=back?pal.p:pal.q;
 limb(x,hx,hy,kx,ky,4,c,hi,pal.P,pal.o);
 limb(x,kx,ky,fx,fy,3,c,hi,pal.P,pal.o);
 px(x,fx-3,fy-1,7,3,pal.b);px(x,fx-3,fy-1,7,1,pal.B);
}
function armGun(x,cx,shY,aim,pal){
 const o=AIMOFF[aim]||AIMOFF.F,hx=cx+o[0],hy=shY+o[1];
 limb(x,cx,shY,hx,hy,3,pal.s,pal.h,pal.S,pal.o);
 const L=Math.hypot(o[0],o[1])||1,ux=o[0]/L,uy=o[1]/L;
 limb(x,hx-ux*2,hy-uy*2,hx+ux*9,hy+uy*9,3,pal.g,pal.G,pal.g,pal.o);
 px(x,hx-ux*3-1,hy-uy*3-1,3,3,pal.o);
 return {x:hx+ux*11,y:hy+uy*11};
}
function head(x,cx,hy,pal,gear){
 ellO(x,cx,hy,3.6,4,pal.s,pal.o);
 ell(x,cx-1,hy-1,2.4,2.6,pal.h);
 px(x,cx+1,hy,1,1,pal.o);
 px(x,cx+1,hy+2,2,1,pal.S);
 if(gear.head==='bandana'){
  ell(x,cx,hy-2,3.8,2.2,pal.r);px(x,cx-3,hy-3,6,1,pal.r);
  px(x,cx-5,hy-1,2,3,pal.r);px(x,cx-6,hy+1,2,2,pal.r);
 }else if(gear.head==='helmet'){
  ell(x,cx,hy-1.5,4.2,3,pal.v);px(x,cx-4,hy-1,8,1,pal.V);
  px(x,cx-1,hy,5,2,pal.g);px(x,cx,hy,3,1,pal.G);
 }else if(gear.head==='hood'){
  ellO(x,cx,hy,4.4,4.6,pal.v,pal.o);ell(x,cx-1,hy-1,3,3,pal.V);
  ell(x,cx+1.5,hy+1,2.4,2.6,pal.s);px(x,cx+2,hy+1,1,1,pal.o);
 }else{
  ell(x,cx,hy-2,4,2.4,pal.p);px(x,cx-4,hy-1,8,1,pal.P);
  px(x,cx-3,hy,7,2,pal.g);px(x,cx-2,hy,3,1,pal.a);px(x,cx+2,hy,2,1,pal.a);
 }
}
function torso(x,cx,shY,hipY,pal,gear){
 const base=gear.chest==='bare'?pal.s:(gear.chest==='plate'?pal.v:pal.p);
 const hi=gear.chest==='bare'?pal.h:(gear.chest==='plate'?pal.V:pal.q);
 const lo=gear.chest==='bare'?pal.S:(gear.chest==='plate'?pal.v:pal.P);
 limb(x,cx,shY,cx,hipY,8,base,hi,lo,pal.o);
 if(gear.chest==='bare'){px(x,cx-3,shY+2,6,1,pal.S);px(x,cx-1,shY+3,1,4,pal.S);}
 if(gear.chest==='plate'){px(x,cx-4,shY+3,8,1,pal.V);px(x,cx-1,shY+1,2,4,pal.a);}
 if(gear.chest==='light'){px(x,cx-1,shY,1,7,pal.P);px(x,cx-4,shY+5,8,1,pal.a);}
 if(gear.chest==='exo'){px(x,cx-4,shY+2,8,1,pal.P);px(x,cx-4,shY+5,8,1,pal.P);px(x,cx-2,shY+3,4,2,pal.a);}
 if(gear.back===1){px(x,cx-7,shY,3,8,pal.P);px(x,cx-6,shY+1,1,6,pal.q);}
 if(gear.back===2){px(x,cx-7,shY,3,8,pal.P);px(x,cx-6,shY+2,1,2,pal.a);px(x,cx-6,shY+5,1,2,pal.a);}
 px(x,cx-4,hipY-1,8,2,pal.y);px(x,cx-1,hipY-1,2,2,pal.G);
}
function soldier(x,pal,gear,pose){
 const cx=9,bob=pose.bob||0,drop=pose.crouch?6:0;
 const hipY=17+bob+drop,shY=9+bob+drop,hdY=4+bob+drop;
 if(pose.prone){
  limb(x,3,20,12,20,6,pal.p,pal.q,pal.P,pal.o);
  px(x,1,20,4,3,pal.b);
  limb(x,10,18,17,18,6,gear.chest==='bare'?pal.s:pal.v,pal.h,pal.S,pal.o);
  ellO(x,19,17,3.4,3.4,pal.s,pal.o);
  if(gear.head==='bandana')ell(x,18,15,3.4,2,pal.r);
  if(gear.head==='helmet')ell(x,18,15,3.6,2.2,pal.v);
  if(gear.head==='hood')ellO(x,18,16,3.8,3.4,pal.v,pal.o);
  if(gear.head==='goggles'){ell(x,18,15,3.4,2.2,pal.p);px(x,17,16,5,2,pal.g);}
  limb(x,14,18,24,18,3,pal.g,pal.G,pal.g,pal.o);
  return {x:26,y:18};
 }
 leg(x,cx+1,hipY,pose.lb,pal,true);
 torso(x,cx,shY,hipY,pal,gear);
 leg(x,cx-1,hipY,pose.la,pal,false);
 head(x,cx,hdY,pal,gear);
 return armGun(x,cx,shY+1,pose.aim||'F',pal);
}
const POSES={
 idle:{la:[-.10,.06],lb:[.12,.05],aim:'F'},
 run0:{la:[.75,0],lb:[-.75,1.1],aim:'F',bob:1},
 run1:{la:[.1,.1],lb:[-.1,.1],aim:'F'},
 run2:{la:[-.75,1.1],lb:[.75,0],aim:'F',bob:1},
 run3:{la:[-.1,.1],lb:[.1,.1],aim:'F'},
 jump:{la:[-.9,1.3],lb:[.4,.5],aim:'F'},
 fall:{la:[-.5,.7],lb:[.5,.6],aim:'F'},
 crouch:{la:[-1.2,2.1],lb:[1.1,2.2],aim:'F',crouch:true},
 prone:{prone:true},
 aimU:{la:[-.10,.06],lb:[.12,.05],aim:'U'},
 aimDU:{la:[-.10,.06],lb:[.12,.05],aim:'DU'},
 aimDD:{la:[-.10,.06],lb:[.12,.05],aim:'DD'}};
const TIPS={};
const A={chars:{},foes:{}};
function buildChar(id){
 const pal=PALS[id],gear=GEAR[id],set={};
 Object.keys(POSES).forEach(ps=>{
  const c=make(24,32,x=>{TIPS[ps]=soldier(x,pal,gear,POSES[ps]);});
  set[ps]={r:c,l:flipC(c)};
 });
 A.chars[id]=set;
}
/* ---------- враги: процедурные силуэты с разным оружием ---------- */
const EV=[
 {u:'#478a2c',U:'#2c5e1c',r:'#2c5e1c',b:'#331a04',s:'#c98a4e'},
 {u:'#8a5a28',U:'#5a3818',r:'#5a3818',b:'#331a04',s:'#c98a4e'},
 {u:'#20485a',U:'#0f2838',r:'#0f2838',b:'#1d2536',s:'#c98a4e'}];
function enemy(x,type,v,fr){
 const p=Object.assign({o:'#0b0e15',g:'#5b6a80',G:'#cdd8e6',y:'#c79a00',f:'#ffb020',e:'#ff4a3d'},EV[v%3]);
 if(type==='flamer'){p.u='#8a2a20';p.U='#4a120c';p.r='#4a120c';}
 if(type==='sniper'){p.u='#0d5570';p.U='#071628';p.r='#1a93b8';}
 if(type==='gunner'){p.u='#4a4a5e';p.U='#2a2a3a';p.r='#2a2a3a';}
 if(type==='grenadier'){p.u='#5a3818';p.U='#3a2410';p.r='#3a2410';}
 const sw=Math.sin(fr*2.1)*.6;
 if(type==='bird'||type==='flyer'){
  const w=fr%2?4:-3;
  ellO(x,12,7,9,4,p.u,p.o);ell(x,10,6,6,2.5,p.U);
  tri(x,2,4+w,9,4,p.U,-1);tri(x,13,4-w,9,4,p.U,-1);
  px(x,10,6,4,2,p.e);px(x,10,11,2,3,p.f);px(x,14,11,2,3,p.f);
  return;
 }
 if(type==='turret'||type==='bunker'){
  box(x,3,8,18,10,p.g,p.o);px(x,4,9,16,2,p.G);
  ellO(x,12,8,7,5,p.g,p.o);ell(x,10,7,4,3,p.G);
  limb(x,12,8,22,8,4,p.g,p.G,p.g,p.o);
  px(x,10,6,4,3,p.e);
  if(type==='bunker'){for(let k=0;k<4;k++){ell(x,4+k*5,18,4,3,'#7a6a48');ell(x,4+k*5,17,3,2,'#9a8a68');}}
  return;
 }
 if(type==='crawler'){
  ellO(x,10,6,8,4,p.u,p.o);ell(x,8,5,5,2.5,p.U);
  for(let i=-2;i<=2;i++){const s=Math.sin(fr*2+i)*2;
   limb(x,10+i*3,8,10+i*4+s,12,2,p.U,p.u,p.U,p.o);}
  px(x,14,5,3,2,p.e);
  return;
 }
 if(type==='jumper'){
  ellO(x,8,6,6,6,p.u,p.o);ell(x,6,4,4,3,p.U);
  px(x,5,5,2,2,p.y);px(x,9,5,2,2,p.y);
  limb(x,6,11,4,16,3,p.U,p.u,p.U,p.o);limb(x,10,11,12,16,3,p.U,p.u,p.U,p.o);
  px(x,2,15,4,2,p.b);px(x,10,15,4,2,p.b);
  return;
 }
 if(type==='pod'){
  ellO(x,8,7,7,6,p.G,p.o);px(x,4,4,8,6,'#d4fbff');
  px(x,6,6,4,3,p.U);px(x,7,7,2,1,'#d4fbff');
  return;
 }
 /* пехота */
 const hipY=16,shY=8,hdY=3;
 leg(x,9,hipY,[sw,.4],p,true);
 limb(x,8,shY,8,hipY,7,p.u,p.u,p.U,p.o);
 px(x,5,shY+2,6,4,p.U);
 leg(x,7,hipY,[-sw,.4],p,false);
 ellO(x,8,hdY,3.4,3.6,p.s,p.o);
 ell(x,8,hdY-1.5,3.6,2.2,p.r);
 px(x,9,hdY,1,1,p.o);
 if(type==='gunner'){limb(x,8,shY+2,17,shY+2,4,p.g,p.G,p.g,p.o);px(x,12,shY,4,3,p.o);}
 else if(type==='flamer'){px(x,2,shY,3,8,p.f);limb(x,8,shY+2,16,shY+2,3,p.g,p.G,p.g,p.o);px(x,15,shY+1,3,3,p.f);}
 else if(type==='sniper'){limb(x,8,shY+2,21,shY+2,2,p.g,p.G,p.g,p.o);px(x,12,shY-1,4,2,p.G);}
 else if(type==='grenadier'){limb(x,8,shY+2,13,shY-3,3,p.g,p.G,p.g,p.o);ell(x,14,shY-4,2.5,2.5,p.u);}
 else {limb(x,8,shY+2,16,shY+2,3,p.g,p.G,p.g,p.o);}
}
function buildFoes(){
 const types=['runner','shooter','gunner','flamer','sniper','grenadier','rappeller','jumper','crawler','bird','flyer','turret','bunker','pod'];
 types.forEach(t=>{
  A.foes[t]=[];
  for(let v=0;v<3;v++){
   const frames=[0,1,2].map(fr=>{
    const c=make(24,24,x=>enemy(x,t==='rappeller'?'gunner':t,v,fr));
    return {r:c,l:flipC(c)};});
   A.foes[t].push(frames);
  }});
}
let ready=false;
function init(){
 if(ready)return;
 Object.keys(PALS).forEach(buildChar);
 buildFoes();
 ready=true;
}
function poseOf(p){
 if(p.prone)return 'prone';
 if(!p.onGround)return p.vy<0?'jump':'fall';
 if(p.crouch)return 'crouch';
 if(p.moving)return 'run'+((p.anim|0)%4);
 const ak=p.aimKey||'F';
 if(ak==='U')return 'aimU';if(ak==='DU')return 'aimDU';if(ak==='DD')return 'aimDD';
 return 'idle';
}
function player(id,pose,left){
 const s=A.chars[id];if(!s)return null;
 const f=s[pose]||s.idle;return left?f.l:f.r;
}
function bodySprite(id,body,fr,left){
 let pose=body;
 if(body==='run'||body==='run0')pose='run'+(((fr|0)%4+4)%4);
 return player(id,pose,left);
}
function char(id){const s=A.chars[id];if(!s)return null;
 return {fr:{idle:[s.idle.r],run:[s.run0.r,s.run1.r,s.run2.r,s.run3.r],jump:[s.jump.r],fall:[s.fall.r],prone:s.prone.r},ar:[]};}
function foe(type,v,frame,left){
 const set=A.foes[type];if(!set)return null;
 if(v===undefined)return set;
 const arr=set[(v|0)%3];if(!arr||!arr.length)return null;
 if(frame===undefined)return arr;
 const f=arr[((frame|0)%arr.length+arr.length)%arr.length];
 return f?(left?f.l:f.r):null;
}
function tip(pose,left,sx,sy){
 const t=TIPS[pose]||TIPS.idle||{x:20,y:11};
 return {x:sx+(left?-(t.x-9):(t.x-9)),y:sy+(t.y-15)};
}
function aimKey(a){
 if(!a)return 'F';
 const x=a.raw?a.raw.x:a.x,y=a.raw?a.raw.y:a.y;
 if(y<0)return x===0?'U':'DU';
 if(y>0)return x===0?'D':'DD';
 return 'F';
}
function armDraw(x,sx,sy,ak,pal){return {x:sx+9,y:sy+2};}
function dirIndex(){return 0;}
return {init,player,bodySprite,char,armDraw,foe,tip,aimKey,poseOf,dirIndex,
 POSES:Object.keys(POSES),TIPS,CW,CH,get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
/* EOF-GFX-16 */
