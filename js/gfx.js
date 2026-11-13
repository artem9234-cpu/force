/* ============================================================
   GFX v17 — пиксельные карты из прямоугольников.
   Человек 16×28: голова/торс/длинные ноги/оружие в руках.
   Кадры запекаются в canvas. Никаких простыней символов.
   ============================================================ */
const GFX=(()=>{
'use strict';
const {bind,px}=CORE;
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flipC(c){const f=blank(c.width,c.height),x=f.getContext('2d');
 x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function make(w,h,fn){const c=blank(w,h);const ctx=c.getContext('2d');bind(ctx);fn(ctx);return c;}
const PALS={
 antony:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',p:'#2a6fb0',P:'#17416e',q:'#5aa8e0',b:'#5a300c',B:'#331a04',r:'#c22a22',y:'#c79a00',g:'#5b6a80',G:'#cdd8e6',v:'#8a5a28',V:'#c08848',a:'#ffd400'},
 artyom:{o:'#0b0e15',s:'#e0a870',S:'#a87038',h:'#f8c890',p:'#3d4759',P:'#242c3a',q:'#63728a',b:'#1d2536',B:'#0d1220',r:'#ff4a3d',y:'#ffa32a',g:'#4a5568',G:'#93a3ba',v:'#8a2a20',V:'#c24838',a:'#ffa32a'},
 den:{o:'#0b0e15',s:'#ffd9a8',S:'#d8a068',h:'#fff3d8',p:'#17416e',P:'#0d2440',q:'#2a6fb0',b:'#2a3448',B:'#141c2c',r:'#35e0ff',y:'#35e0ff',g:'#3d4759',G:'#93a3ba',v:'#1a6a78',V:'#35a0b0',a:'#35e0ff'},
 dimka:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',p:'#3d1668',P:'#240b40',q:'#6a2bb0',b:'#1d2536',B:'#0d1220',r:'#a24bff',y:'#e0c2ff',g:'#0d5570',G:'#35e0ff',v:'#4a4a5e',V:'#7a7a92',a:'#a24bff'}};
const GEAR={antony:{head:'bandana',chest:'bare',back:0},artyom:{head:'helmet',chest:'plate',back:1},
 den:{head:'hood',chest:'light',back:0},dimka:{head:'goggles',chest:'exo',back:2}};
function R(x,list,c){for(const r of list)px(x,r[0],r[1],r[2],r[3],c);}
function head(x,pal,g){
 if(g.head==='bandana'){R(x,[[4,0,8,2],[3,1,2,3],[2,3,2,2]],pal.r);R(x,[[4,2,8,4]],pal.s);
  R(x,[[5,2,3,2]],pal.h);px(x,9,3,1,1,pal.o);R(x,[[6,5,4,1]],pal.S);}
 else if(g.head==='helmet'){R(x,[[3,0,10,3]],pal.v);R(x,[[4,1,8,1]],pal.V);
  R(x,[[5,3,7,2]],pal.g);R(x,[[6,3,4,1]],pal.G);R(x,[[5,5,6,1]],pal.s);}
 else if(g.head==='hood'){R(x,[[3,0,10,6]],pal.v);R(x,[[4,1,8,4]],pal.V);
  R(x,[[6,2,5,4]],pal.s);px(x,9,3,1,1,pal.o);}
 else{R(x,[[4,0,8,2]],pal.p);R(x,[[3,2,10,2]],pal.g);R(x,[[4,2,4,1],[9,2,3,1]],pal.a);
  R(x,[[5,4,6,2]],pal.s);px(x,9,4,1,1,pal.o);}
}
function torso(x,pal,g){
 const base=g.chest==='bare'?pal.s:(g.chest==='plate'?pal.v:pal.p);
 const hi=g.chest==='bare'?pal.h:(g.chest==='plate'?pal.V:pal.q);
 const lo=g.chest==='bare'?pal.S:(g.chest==='plate'?pal.v:pal.P);
 R(x,[[3,6,10,2],[4,8,8,4]],base);R(x,[[5,8,3,2]],hi);R(x,[[4,11,8,1]],lo);
 if(g.chest==='bare'){R(x,[[5,9,6,1],[7,10,1,2]],pal.S);}
 if(g.chest==='plate'){R(x,[[5,8,6,1]],pal.V);R(x,[[7,9,2,3]],pal.a);}
 if(g.chest==='light'){R(x,[[7,6,1,6]],pal.P);R(x,[[4,10,8,1]],pal.a);}
 if(g.chest==='exo'){R(x,[[4,8,8,1],[4,11,8,1]],pal.P);R(x,[[6,9,4,2]],pal.a);}
 if(g.back===1){R(x,[[1,7,2,6]],pal.P);R(x,[[1,8,1,4]],pal.q);}
 if(g.back===2){R(x,[[1,7,2,6]],pal.P);R(x,[[1,8,1,2],[1,11,1,2]],pal.a);}
 R(x,[[4,12,8,2]],pal.y);R(x,[[7,12,2,2]],pal.G);
}
const LEGS={
 idle:{L:[[4,14,3,8],[4,22,3,4]],LB:[3,26,5,2],R:[[9,14,3,8],[9,22,3,4]],RB:[8,26,5,2]},
 run0:{L:[[3,14,3,6],[2,20,3,6]],LB:[1,26,5,2],R:[[9,14,3,6],[10,20,3,6]],RB:[9,26,5,2]},
 run1:{L:[[5,14,3,8],[5,22,3,4]],LB:[4,26,5,2],R:[[8,14,3,8],[8,22,3,4]],RB:[7,26,5,2]},
 run2:{L:[[9,14,3,6],[10,20,3,6]],LB:[9,26,5,2],R:[[3,14,3,6],[2,20,3,6]],RB:[1,26,5,2]},
 run3:{L:[[4,14,3,5],[3,19,3,4]],LB:[2,23,5,2],R:[[9,14,3,8],[9,22,3,4]],RB:[8,26,5,2]},
 jump:{L:[[3,14,3,5],[2,19,3,4]],LB:[1,23,5,2],R:[[9,14,3,5],[10,19,3,4]],RB:[9,23,5,2]},
 fall:{L:[[3,14,3,7],[2,21,3,5]],LB:[1,26,5,2],R:[[10,14,3,7],[11,21,3,5]],RB:[10,26,5,2]}};
function legs(x,pal,key){
 const f=LEGS[key]||LEGS.idle;
 R(x,f.L,pal.p);R(x,[f.L[1]],pal.P);R(x,[f.LB],pal.b);R(x,[[f.LB[0],f.LB[1],f.LB[2],1]],pal.B);
 R(x,f.R,pal.p);R(x,[f.R[1]],pal.P);R(x,[f.RB],pal.b);R(x,[[f.RB[0],f.RB[1],f.RB[2],1]],pal.B);
}
const ARMS={
 F:{a:[[8,8,6,3]],g:[[12,9,4,2]],gh:[[12,9,4,1]],gr:[[11,11,2,2]],tip:[16,10]},
 U:{a:[[8,4,3,5]],g:[[9,0,2,5]],gh:[[9,0,1,5]],gr:[[8,9,2,2]],tip:[10,0]},
 DU:{a:[[8,6,5,3]],g:[[11,4,2,2],[13,2,2,2]],gh:[[11,4,2,1]],gr:[[10,9,2,2]],tip:[15,2]},
 DD:{a:[[8,10,5,3]],g:[[11,12,2,2],[13,14,2,2]],gh:[[11,12,2,1]],gr:[[10,11,2,2]],tip:[15,16]},
 D:{a:[[8,10,3,5]],g:[[9,15,2,5]],gh:[[9,15,1,5]],gr:[[8,10,2,2]],tip:[10,20]}};
function arm(x,pal,aim){
 const a=ARMS[aim]||ARMS.F;
 R(x,a.a,pal.s);R(x,a.g,pal.g);R(x,a.gh,pal.G);R(x,a.gr,pal.o);
 return a.tip;
}
const TIPS={};
function soldier(x,pal,g,pose){
 if(pose==='prone'){
  R(x,[[2,4,12,4]],pal.p);R(x,[[2,4,12,1]],pal.q);R(x,[[0,6,4,3]],pal.b);
  R(x,[[14,2,6,5]],pal.s);
  if(g.head==='bandana')R(x,[[14,1,6,2]],pal.r);
  if(g.head==='helmet')R(x,[[14,1,6,2]],pal.v);
  if(g.head==='hood')R(x,[[13,1,7,5]],pal.v);
  if(g.head==='goggles'){R(x,[[14,1,6,2]],pal.p);R(x,[[15,3,5,2]],pal.g);}
  R(x,[[18,4,6,2]],pal.g);R(x,[[18,4,6,1]],pal.G);
  TIPS.prone=[24,5];return;
 }
 const legKey=(pose==='idle'||pose==='aimU'||pose==='aimDU'||pose==='aimDD')?'idle':pose;
 legs(x,pal,legKey);
 torso(x,pal,g);
 head(x,pal,g);
 const aim=(pose==='aimU')?'U':(pose==='aimDU')?'DU':(pose==='aimDD')?'DD':'F';
 TIPS[pose]=arm(x,pal,aim);
}
const POSES=['idle','run0','run1','run2','run3','jump','fall','prone','aimU','aimDU','aimDD'];
const A={chars:{},foes:{}};
function buildChar(id){
 const pal=PALS[id],g=GEAR[id],set={};
 POSES.forEach(ps=>{
  const w=(ps==='prone')?24:16,h=(ps==='prone')?10:28;
  const c=make(w,h,x=>soldier(x,pal,g,ps));
  set[ps]={r:c,l:flipC(c)};
 });
 A.chars[id]=set;
}
const EV=[{u:'#478a2c',U:'#2c5e1c',r:'#2c5e1c',b:'#331a04',s:'#c98a4e'},
 {u:'#8a5a28',U:'#5a3818',r:'#5a3818',b:'#331a04',s:'#c98a4e'},
 {u:'#20485a',U:'#0f2838',r:'#0f2838',b:'#1d2536',s:'#c98a4e'}];
function enemy(x,type,v,fr){
 const p=Object.assign({o:'#0b0e15',g:'#5b6a80',G:'#cdd8e6',y:'#c79a00',f:'#ffb020',e:'#ff4a3d'},EV[v%3]);
 if(type==='flamer'){p.u='#8a2a20';p.U='#4a120c';p.r='#4a120c';}
 if(type==='sniper'){p.u='#0d5570';p.U='#071628';p.r='#1a93b8';}
 if(type==='gunner'){p.u='#4a4a5e';p.U='#2a2a3a';p.r='#2a2a3a';}
 if(type==='grenadier'){p.u='#5a3818';p.U='#3a2410';p.r='#3a2410';}
 if(type==='bird'||type==='flyer'){
  const w=fr%2?3:-2;
  R(x,[[4,4,12,5]],p.u);R(x,[[5,5,8,2]],p.U);
  R(x,[[1,3+w,4,3],[15,3-w,4,3]],p.U);
  R(x,[[7,5,4,2]],p.e);R(x,[[7,9,2,3],[11,9,2,3]],p.f);return;
 }
 if(type==='turret'||type==='bunker'){
  R(x,[[2,8,16,10]],p.g);R(x,[[3,9,14,2]],p.G);
  R(x,[[5,4,10,5]],p.g);R(x,[[6,5,6,2]],p.G);
  R(x,[[12,6,8,3]],p.g);R(x,[[7,5,4,2]],p.e);
  if(type==='bunker')for(let k=0;k<4;k++){R(x,[[2+k*4,16,4,3]],'#7a6a48');R(x,[[2+k*4,16,4,1]],'#9a8a68');}
  return;
 }
 if(type==='crawler'){
  R(x,[[2,4,14,5]],p.u);R(x,[[3,5,10,2]],p.U);
  for(let i=0;i<5;i++){const s=(fr%2?1:-1)*(i%2?1:-1);R(x,[[3+i*3,9,2,3+s]],p.U);}
  R(x,[[12,5,3,2]],p.e);return;
 }
 if(type==='jumper'){
  R(x,[[3,2,10,9]],p.u);R(x,[[4,3,6,3]],p.U);
  R(x,[[5,4,2,2],[9,4,2,2]],p.y);
  R(x,[[4,11,3,5],[9,11,3,5]],p.U);R(x,[[3,16,4,2],[9,16,4,2]],p.b);return;
 }
 if(type==='pod'){
  R(x,[[2,2,12,12]],p.G);R(x,[[3,3,10,8]],'#d4fbff');R(x,[[5,5,6,4]],p.U);R(x,[[6,6,3,2]],'#d4fbff');return;
 }
 const sw=fr%2?1:0;
 R(x,[[4+sw,12,3,7],[9-sw,12,3,7]],p.u);R(x,[[4+sw,17,3,3],[9-sw,17,3,3]],p.U);
 R(x,[[3+sw,19,4,2],[9-sw,19,4,2]],p.b);
 R(x,[[4,5,8,7]],p.u);R(x,[[5,6,6,3]],p.U);
 R(x,[[4,0,8,3]],p.r);R(x,[[5,3,6,3]],p.s);px(x,9,4,1,1,p.o);
 if(type==='gunner'){R(x,[[8,7,8,3]],p.g);R(x,[[10,5,4,2]],p.o);}
 else if(type==='flamer'){R(x,[[1,5,3,7]],p.f);R(x,[[8,7,7,2]],p.g);R(x,[[14,6,2,3]],p.f);}
 else if(type==='sniper'){R(x,[[8,7,12,2]],p.g);R(x,[[10,5,4,2]],p.G);}
 else if(type==='grenadier'){R(x,[[8,6,5,2]],p.g);R(x,[[12,3,3,3]],p.u);}
 else{R(x,[[8,7,8,2]],p.g);}
}
function buildFoes(){
 ['runner','shooter','gunner','flamer','sniper','grenadier','rappeller','jumper','crawler','bird','flyer','turret','bunker','pod']
 .forEach(t=>{A.foes[t]=[];
  for(let v=0;v<3;v++){
   const frames=[0,1,2].map(fr=>{const c=make(24,22,x=>enemy(x,t==='rappeller'?'gunner':t,v,fr));
    return {r:c,l:flipC(c)};});
   A.foes[t].push(frames);}});
}
let ready=false;
function init(){if(ready)return;Object.keys(PALS).forEach(buildChar);buildFoes();ready=true;}
function poseOf(p){
 if(p.prone)return 'prone';
 if(!p.onGround)return p.vy<0?'jump':'fall';
 if(p.moving)return 'run'+((p.anim|0)%4);
 const ak=p.aimKey||'F';
 if(ak==='U')return 'aimU';if(ak==='DU')return 'aimDU';if(ak==='DD')return 'aimDD';
 return 'idle';
}
function player(id,pose,left){const s=A.chars[id];if(!s)return null;const f=s[pose]||s.idle;return left?f.l:f.r;}
function bodySprite(id,body,fr,left){let pose=body;if(body==='run'||body==='run0')pose='run'+(((fr|0)%4+4)%4);return player(id,pose,left);}
function char(id){const s=A.chars[id];if(!s)return null;
 return {fr:{idle:[s.idle.r],run:[s.run0.r,s.run1.r,s.run2.r,s.run3.r],jump:[s.jump.r],fall:[s.fall.r],prone:s.prone.r},ar:[]};}
function foe(type,v,frame,left){const set=A.foes[type];if(!set)return null;
 if(v===undefined)return set;const arr=set[(v|0)%3];if(!arr||!arr.length)return null;
 if(frame===undefined)return arr;const f=arr[((frame|0)%arr.length+arr.length)%arr.length];
 return f?(left?f.l:f.r):null;}
function tip(pose,left,sx,sy){const t=TIPS[pose]||TIPS.idle||[16,10];
 return {x:sx+(left?-(t[0]-8):(t[0]-8)),y:sy+(t[1]-14)};}
function aimKey(a){if(!a)return 'F';const x=a.raw?a.raw.x:a.x,y=a.raw?a.raw.y:a.y;
 if(y<0)return x===0?'U':'DU';if(y>0)return x===0?'D':'DD';return 'F';}
function armDraw(x,sx,sy){return {x:sx+8,y:sy+2};}
function dirIndex(){return 0;}
return {init,player,bodySprite,char,armDraw,foe,tip,aimKey,poseOf,dirIndex,POSES,TIPS,CW:16,CH:28,BUILD:18,get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
/* EOF-GFX-17 */
