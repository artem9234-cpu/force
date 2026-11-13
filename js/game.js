(()=>{
'use strict';
const C=CORE;
const {W,H,TS,P,clamp,rnd,ri,sgn,lerp,bind,px,box,ell,ellO,line,limb,tri,dith,vgrad,txt,txtC,tw,txtSh,txtCSh,SND,IN}=C;
const {CHARS,WEAPONS,WORDER,ENEMIES,BOSSES,LEVELS,THEMES}=DATA;
const col=(c,f)=>(typeof c==='string'&&c)?c:f;
const cv=document.getElementById('cv'),vis=cv.getContext('2d',{alpha:false});
const buf=document.createElement('canvas');buf.width=W;buf.height=H;
const g=buf.getContext('2d',{alpha:false});
g.imageSmoothingEnabled=false;vis.imageSmoothingEnabled=false;bind(g);
const GY=13*TS,SH=28,PH=10,BW=12,PW=22,ARENA=30;
const GRAV=.48,JMAX=11,ACC=1.15,FRIC=.62,STEP=1/60;
function fit(){const s=document.getElementById('screen');
 const sc=Math.max(.5,Math.min((innerWidth-8)/W,(innerHeight-8)/H));
 const w=Math.floor(W*sc),h=Math.floor(H*sc);
 s.style.width=w+'px';s.style.height=h+'px';cv.style.width=w+'px';cv.style.height=h+'px';}
addEventListener('resize',fit,{passive:true});
addEventListener('orientationchange',()=>setTimeout(fit,140));
const K=IN.st,KE={},PREV={};
function pollInput(){for(const k in K){const v=K[k]?1:0;if(v&&!PREV[k])KE[k]=true;PREV[k]=v;}}
function eat(k){if(KE[k]){KE[k]=false;return true;}return false;}
function peek(k){return !!KE[k];}
function clearEdges(){for(const k in KE)KE[k]=false;}
let state='title',sel=0,tick=0,paused=false,err=null,hitstop=0,gfxOk=false;
let lvl=null,th=null,tileCv=null,farCv=null,midCv=null,skyCv=null,rainCv=null,foreCv=null;
let cam={x:0,px:0,y:0,py:0,lock:false,shake:0,shakeX:0,shakeY:0,look:0};
let pl=null,foes=[],boss=null;
let si=0,lives=3,score=0,hi=Number(localStorage.getItem('bf_hi')||0);
let clearT=0,deadT=0,introT=0,flash=0,bIntro=0,kills=0,combo=0,comboT=0,pressure=0;
const T=(x,y)=>{if(x<0||y<0||x>=lvl.w||y>=lvl.h)return y>=lvl.h?'.':'#';const r=lvl.rows[y];return r?(r[x]||'.'):'.';};
const sol=(x,y)=>T(x,y)==='#';
const plt=(x,y)=>T(x,y)==='=';
const hz=(x,y)=>{const c=T(x,y);return c==='^'||c==='~';};
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const dmgEl=document.getElementById('dmg');let dmgT=0;
function hurtFlash(){dmgT=8;if(dmgEl)dmgEl.classList.add('on');}
const layers=new Map();
function layer(key,w,h,fn){let c=layers.get(key);if(c)return c;
 c=document.createElement('canvas');c.width=w;c.height=h;const old=g;
 try{bind(c.getContext('2d'));fn();}finally{bind(old);}layers.set(key,c);return c;}
const glows=new Map();
function glowSpr(c,r){const k=c+'|'+r;let s=glows.get(k);if(s)return s;
 const d=r*2,cn=document.createElement('canvas');cn.width=d;cn.height=d;const x=cn.getContext('2d');
 const gr=x.createRadialGradient(r,r,0,r,r,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');
 x.fillStyle=gr;x.beginPath();x.arc(r,r,r,0,6.2832);x.fill();glows.set(k,cn);return cn;}
function glow(x,y,r,c,a){const s=glowSpr(c,Math.max(2,r|0));g.globalAlpha=a==null?.5:a;g.drawImage(s,(x-r)|0,(y-r)|0);g.globalAlpha=1;}
function beam(x0,y0,x1,y1,c,w){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy);
 if(L<.5){g.fillStyle=c;g.fillRect(x0|0,y0|0,w,w);return;}
 g.save();g.translate(x0,y0);g.rotate(Math.atan2(dy,dx));g.fillStyle=c;g.fillRect(0,-w/2,L,w);g.restore();}
function dot(x,y,s,c){g.fillStyle=c;g.fillRect(x|0,y|0,s,s);}
function Pool(make){const free=[],live=[];return {live,
 get(){const o=free.pop()||make();o.dead=false;live.push(o);return o;},
 sweep(){for(let i=live.length-1;i>=0;i--)if(live[i].dead){free.push(live[i]);live.splice(i,1);}},
 clear(){while(live.length)free.push(live.pop());},get count(){return live.length;}};}
const pBul=Pool(()=>({})),pEbul=Pool(()=>({})),pPart=Pool(()=>({})),pTxt=Pool(()=>({})),
 pFlame=Pool(()=>({})),pItem=Pool(()=>({})),pMover=Pool(()=>({})),pWarn=Pool(()=>({}));
const MAXPART=220,CELL=40,grid=new Map();
function gridBuild(list){grid.clear();
 for(let i=0;i<list.length;i++){const f=list[i];if(f.dead)continue;
  const x0=Math.floor(f.x/CELL),x1=Math.floor((f.x+f.w)/CELL),y0=Math.floor(f.y/CELL),y1=Math.floor((f.y+f.h)/CELL);
  for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){const k=cx*8192+cy;let a=grid.get(k);if(!a){a=[];grid.set(k,a);}a.push(f);}}}
function gridAt(x,y){return grid.get(Math.floor(x/CELL)*8192+Math.floor(y/CELL))||null;}
function spark(x,y,n,c,p){for(let i=0;i<n;i++){if(pPart.count>=MAXPART)return;
 const a=rnd(0,6.283),s=rnd(.6,p||3.2),o=pPart.get();
 o.x=x;o.y=y;o.vx=Math.cos(a)*s;o.vy=Math.sin(a)*s-.5;o.life=o.max=rnd(12,30)|0;o.c=col(c,P.yl1);o.g=.12;o.s=1;o.kind=0;}}
function shell(x,y,dir){if(pPart.count>=MAXPART)return;const o=pPart.get();
 o.x=x;o.y=y;o.vx=-dir*rnd(.8,1.8);o.vy=-rnd(1.2,2.2);o.life=o.max=26;o.c=P.yl3;o.g=.22;o.s=1;o.kind=0;}
function boom(x,y,r,c){for(let i=0;i<r;i++){if(pPart.count>=MAXPART)break;
 const a=rnd(0,6.283),s=rnd(.8,4.8),o=pPart.get();
 o.x=x;o.y=y;o.vx=Math.cos(a)*s;o.vy=Math.sin(a)*s-1;o.life=o.max=rnd(16,40)|0;
 o.c=[P.fl1,P.fl2,P.fl3,P.rd2,P.mt2][ri(5)];o.g=.1;o.s=ri(2)+1;o.kind=0;}
 if(pPart.count<MAXPART){const o=pPart.get();o.x=x;o.y=y;o.r=2;o.rr=r;o.life=o.max=14;o.c=col(c,P.fl1);o.kind=1;}
 cam.shake=Math.max(cam.shake,Math.min(14,r*.4));}
function pop(x,y,s,c){const o=pTxt.get();o.x=x;o.y=y;o.s=String(s);o.c=col(c,P.yl2);o.life=48;}
function addHitstop(n){hitstop=Math.max(hitstop,n);}

// === УЛУЧШЕННЫЕ ТАЙЛЫ (Как на скриншотах) ===
function paintTile(x,y){
 const c=T(x,y),X=x*TS,Y=y*TS;
 const RO=col(th.rockOut,P.br5),RK=col(th.rock,P.br2),RH=col(th.rockHi,P.br1),RL=col(th.rockLo,P.br3),RC=col(th.rockCrack,P.br4),
 GR=col(th.grass,P.cg2),GH=col(th.grassHi,P.cg1),GL=col(th.grassLo,P.cg3),GT=col(th.grassTuft,P.cg4),
 MT=col(th.metal,P.mt3),MH=col(th.metalHi,P.mt1),ML=col(th.metalLo,P.mt5),
 WA=col(th.water,P.cw3),W2=col(th.water2,P.cw2),W3=col(th.water3,P.cw1),FM=col(th.foam,P.w),
 TR=col(th.tree,P.gr4),TRH=col(th.treeHi,P.gr2),TRL=col(th.treeLo,P.gr5),TK=col(th.trunk,P.br4),TKH=col(th.trunkHi,P.br2),
 HL=col(th.hill,P.gr3),HLH=col(th.hillHi,P.gr2),HLL=col(th.hillLo,P.gr4);
 if(c==='#'){
  // Темный фон скалы
  px(X,Y,TS,TS,RO);
  // Массивные валуны с контуром и затенением
  for(let i=0;i<3;i++){
   const h1=CORE.hash(x*3+i,y*7),h2=CORE.hash(x*5+i,y*11);
   const bx=X+3+h1*10,by=Y+3+h2*10,r=5+h1*2;
   ell(bx,by,r+1,r*.8+1,'#000'); // Контур
   ell(bx,by,r,r*.8,RK);
   ell(bx-r*.3,by-r*.3,r*.5,r*.3,RH); // Блик
   ell(bx+r*.3,by+r*.3,r*.4,r*.2,RL); // Тень
   beam(bx-r*.4,by-r*.1,bx+r*.2,by+r*.4,RC,1); // Трещина
  }
  // Мох/трава сверху
  if(!sol(x,y-1)&&T(x,y-1)!=='^'){
   px(X,Y,TS,5,GL);px(X,Y,TS,3,GR);px(X,Y,TS,1,GH);
   // Рваный край травы
   for(let i=0;i<6;i++){
    const gx=X+i*3+((x%2)?1:0),gh=2+((CORE.hash(x,i)*3)|0);
    px(gx,Y-gh,1,gh+2,GR);px(gx+1,Y-gh-1,1,gh+3,GH);px(gx+2,Y-1,1,2,GT);
   }
   px(X,Y+5,TS,1,GL);for(let i=0;i<3;i++)dot(X+2+i*5,Y+6,1,GT);
   beam(X,Y+6,X+TS,Y+7,RL,1);
  }
  if(sol(x,y-1)){px(X,Y,TS,2,RL);for(let i=0;i<3;i++)dot(X+CORE.hash(x,i)*14,Y+2+CORE.hash(y,i)*4,1,RC);}
 } else if(c==='='){
  px(X,Y,TS,7,MT);px(X,Y,TS,2,MH);px(X,Y+6,TS,1,ML);px(X,Y+7,TS,1,P.n);
  for(let i=0;i<4;i++){px(X+i*5,Y+3,2,2,ML);px(X+i*5,Y+3,1,1,MH);}
  px(X+1,Y+1,3,1,P.yl2);px(X+4,Y+1,3,1,P.n);px(X+9,Y+1,3,1,P.yl2);px(X+12,Y+1,3,1,P.n);
  px(X+2,Y+8,2,4,ML);px(X+12,Y+8,2,4,ML);
 } else if(c==='^'){
  px(X,Y+12,TS,4,RO);
  for(let i=0;i<4;i++){tri(X+i*4,Y+2,4,12,P.mt3,1);tri(X+i*4+1,Y+4,2,10,P.mt1,1);px(X+i*4+1,Y+2,1,2,P.w);}
 } else if(c==='~'){
  px(X,Y,TS,TS,WA);
  for(let j=0;j<TS;j+=3){const off=Math.round(Math.sin((x*TS+j)*.35)*2);
   px(X,Y+j,TS,1,W2);px(X+((j*3+off+12)%12),Y+j,4,1,W3);}
  if(!hz(x,y-1)){px(X,Y,TS,1,FM);for(let i=0;i<4;i++)dot(X+i*4+((x+i)%2),Y-1,2,FM);}
 } else if(c==='B'){
  box(X+1,Y+1,14,14,P.br2,P.br5);px(X+2,Y+2,12,2,P.br1);px(X+3,Y+7,10,1,P.br4);px(X+7,Y+2,2,12,P.br4);
  px(X+4,Y+9,8,4,P.yl4);txt('?',X+6,Y+8,P.yl1,1);px(X+2,Y+13,12,1,P.br5);
 } else if(c==='d'){
  px(X+7,Y+6,3,10,TK);px(X+7,Y+6,1,10,TKH);
  ell(X+8,Y+4,6,4,TR);ell(X+6,Y+2,5,3,TR);ell(X+10,Y+2,5,3,TR);
  ell(X+8,Y+1,4,3,TRH);ell(X+5,Y+4,3,2,TRL);ell(X+11,Y+4,3,2,TRL);
  px(X+4,Y+14,2,2,GT);px(X+11,Y+14,2,2,GT);
 } else if(c==='h'){
  ell(X+8,Y+12,8,5,HL);ell(X+6,Y+10,5,3,HLH);ell(X+11,Y+11,4,3,HLL);
  px(X+3,Y+8,2,3,GT);px(X+8,Y+7,2,4,GT);px(X+12,Y+8,2,3,GT);
 } else if(c==='%'){
  px(X,Y,TS,TS,ML);for(let i=0;i<4;i++){px(X,Y+i*4,TS,2,MT);px(X,Y+i*4+2,TS,1,RO);}
  px(X,Y,TS,1,MH);for(let i=0;i<3;i++)dot(X+3+i*5,Y+3,2,ML);}}

function buildTiles(){tileCv=document.createElement('canvas');
 tileCv.width=Math.max(1,lvl.w*TS);tileCv.height=H;const old=g;
 try{bind(tileCv.getContext('2d'));for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++)paintTile(x,y);}finally{bind(old);}}
function breakTile(cx,cy){if(!lvl.rows[cy])return;
 lvl.rows[cy]=lvl.rows[cy].substring(0,cx)+'.'+lvl.rows[cy].substring(cx+1);
 const old=g,tc=tileCv.getContext('2d');
 try{bind(tc);tc.clearRect(cx*TS,cy*TS,TS,TS);paintTile(cx,cy);
  if(cy>0)paintTile(cx,cy-1);if(cy<lvl.h-1)paintTile(cx,cy+1);}finally{bind(old);}}
function buildPar(){
 const F1=col(th.far,P.gr6),F2=col(th.far2,P.gr5),M1=col(th.mid,P.gr4),M2=col(th.mid2,P.gr3);
 farCv=layer('far_'+lvl.theme,896,H,()=>{
  for(let i=0;i<44;i++){const x=i*21+((i*37)%12),h=64+((i*53)%70);
   if(lvl.theme==='jungle'){tri(x,178-h,44,h,F1,1);tri(x+7,178-h+12,30,h-12,F2,1);
    for(let k=0;k<4;k++)px(x+10+k*6,178-h+16+k*8,2,2,F2);}
   else if(lvl.theme==='cliff'){tri(x-10,190-h,58,h,F1,1);tri(x+2,190-h+18,38,h-18,F2,1);tri(x+12,190-h+22,16,12,P.mt1,1);}
   else{tri(x,196-h,38,h,F1,1);for(let k=0;k<5;k++)ell(x+18,196-h+16+k*13,11-k,4,F2);}}});
 midCv=layer('mid_'+lvl.theme,896,H,()=>{
  for(let i=0;i<52;i++){const x=i*17+((i*29)%11),h=44+((i*41)%50);
   if(lvl.theme==='jungle'){px(x+9,214-h,5,h,M1);ell(x+11,214-h,15,10,M1);ell(x+8,214-h-4,9,6,M2);ell(x+15,214-h+3,7,4,M2);}
   else if(lvl.theme==='cliff'){tri(x-5,220-h,34,h,M1,1);tri(x+2,220-h+10,20,h-10,M2,1);}
   else{px(x+8,220-h,6,h,M1);ell(x+10,220-h,11,8,M2);
    for(let k=0;k<3;k++)beam(x+10,220-h+k*9,x+10+(k%2?11:-11),220-h+k*9+8,M1,1);}}});
 skyCv=layer('sky_'+lvl.theme,W,H,()=>{
  vgrad(0,0,W,H,col(th.sky[0],P.bl4),col(th.sky[1],P.bl2));
  if(lvl.theme==='lair'){for(let i=0;i<70;i++)px((i*61)%W,(i*37)%150,1,1,i%4?P.pu3:P.pu2);}
  else{ell(372,38,17,17,P.yl1);g.drawImage(glowSpr('rgba(255,240,170,.30)',40),332,-2);}});
 rainCv=layer('rain_'+lvl.theme,224,256,()=>{
  if(th.weather==='rain'){for(let i=0;i<46;i++){const x=(i*37)%224,y=(i*53)%256;beam(x,y,x-2,y+9,'rgba(180,220,255,.30)',1);}}
  else if(th.weather==='ember'){for(let i=0;i<30;i++)px((i*71)%224,(i*43)%256,1,1,i%3?P.or2:P.yl2);}});
 foreCv=layer('fore_'+lvl.theme,W,H,()=>{
  const c1=lvl.theme==='lair'?P.pu4:P.gr4, c2=lvl.theme==='lair'?P.pu2:P.gr2;
  for(let i=0;i<12;i++){
   const x=40+i*40, y=190+(i%3)*8;
   ell(x,y,14,6,c1);ell(x-4,y-3,8,3,c2);
   px(x-1,y+3,2,8,c1);}}
 );}
function boxFree(x,y,w,h){const x0=Math.floor((x+1)/TS),x1=Math.floor((x+w-2)/TS),y0=Math.floor((y+1)/TS),y1=Math.floor((y+h-2)/TS);
 for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)if(sol(cx,cy))return false;return true;}
function resolveX(e,d){const y0=Math.floor((e.y+2)/TS),y1=Math.floor((e.y+e.h-3)/TS);
 if(d>0){const cx=Math.floor((e.x+e.w-1)/TS);for(let cy=y0;cy<=y1;cy++)if(sol(cx,cy)){e.x=cx*TS-e.w;e.vx=0;return true;}}
 else if(d<0){const cx=Math.floor(e.x/TS);for(let cy=y0;cy<=y1;cy++)if(sol(cx,cy)){e.x=(cx+1)*TS;e.vx=0;return true;}}
 return false;}
function moverTopAt(e){const mv=pMover.live;
 for(let i=0;i<mv.length;i++){const m=mv[i];if(m.dead)continue;
  if(e.x+e.w-3>m.x&&e.x+3<m.x+m.w&&e.y+e.h>=m.y-1&&e.y+e.h<=m.y+8&&e.vy>=0)return m;}
 return null;}
function resolveY(e,d,pf){const x0=Math.floor((e.x+2)/TS),x1=Math.floor((e.x+e.w-3)/TS);
 if(d>0){const cy=Math.floor((e.y+e.h-1)/TS);
  for(let cx=x0;cx<=x1;cx++){const top=cy*TS;
   if(sol(cx,cy)||(plt(cx,cy)&&pf<=top+1&&!e.drop)){e.y=top-e.h;e.vy=0;e.groundMover=null;return true;}}
  const m=moverTopAt(e);if(m){e.y=m.y-e.h;e.vy=0;e.groundMover=m;return true;}}
 else if(d<0){const cy=Math.floor(e.y/TS);for(let cx=x0;cx<=x1;cx++)if(sol(cx,cy)){e.y=(cy+1)*TS;e.vy=0;return true;}}
 return false;}
function move(e,dx,dy){const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/5));
 const sx=dx/n,sy=dy/n;
 for(let i=0;i<n;i++){if(sx){e.x+=sx;resolveX(e,sx);}if(sy){const pf=e.y+e.h;e.y+=sy;resolveY(e,sy,pf);}}}
function onFloor(e){if(e.vy<0)return false;
 const cy=Math.floor((e.y+e.h+1)/TS),x0=Math.floor((e.x+2)/TS),x1=Math.floor((e.x+e.w-3)/TS);
 for(let cx=x0;cx<=x1;cx++)if(sol(cx,cy)||plt(cx,cy))return true;
 return !!moverTopAt({x:e.x,y:e.y,w:e.w,h:e.h,vy:0});}
function ahead(e,d){const nx=e.x+(d>0?e.w+4:-4),cy=Math.floor((e.y+e.h+3)/TS);
 return sol(Math.floor(nx/TS),cy)||plt(Math.floor(nx/TS),cy);}
function wallAhead(e,d){const cx=Math.floor((e.x+(d>0?e.w+2:-2))/TS);
 return sol(cx,Math.floor((e.y+e.h-8)/TS))||sol(cx,Math.floor((e.y+6)/TS));}
function gapSize(e,d){let n=0;const c0=Math.floor((e.x+e.w/2)/TS);
 for(let i=1;i<=7;i++){const cx=c0+d*i,cy=Math.floor((e.y+e.h+3)/TS);if(sol(cx,cy)||plt(cx,cy))break;n++;}return n;}
function mkPlayer(ch){return {ch,x:40,y:GY-SH,px:40,py:GY-SH,vx:0,vy:0,w:BW,h:SH,face:1,onGround:true,
 hp:ch.hp,maxhp:ch.hp,inv:80,prone:false,aim:{x:1,y:0,raw:{x:1,y:0}},aimKey:'F',
 jumps:0,coyote:0,buf:0,drop:0,dashT:0,dashCD:0,hover:false,moving:false,jcut:false,
 weapon:ch.weapon,cd:0,spec:0,specT:0,drone:null,anim:0,breath:0,recoil:0,muzzle:0,
 dead:false,webT:0,pushT:0,body:'idle',landT:0,groundMover:null,fr:0};}
function aimOf(p){let ax=p.face,ay=0;
 if(K.up&&!K.down){if(K.left||K.right){ax=K.right?1:-1;ay=-1;}else{ax=0;ay=-1;}}
 else if(K.down&&!p.onGround){if(K.left||K.right){ax=K.right?1:-1;ay=1;}else{ax=0;ay=1;}}
 const L=Math.hypot(ax,ay)||1;return {x:ax/L,y:ay/L,raw:{x:ax,y:ay}};}
function addBullet(x,y,vx,vy,w,dmg,extra){const b=pBul.get();
 b.x=x;b.y=y;b.px=x;b.py=y;b.vx=vx;b.vy=vy;b.dmg=dmg;b.kind=w.kind;b.col=w.col;
 b.len=w.len;b.life=110;b.pierce=!!w.pierce;b.t=0;b.spin=0;b.dot=w.dot||0;b.hitSet=null;
 if(extra)Object.assign(b,extra);return b;}
function shoot(p){if(p.cd>0)return;
 const w=WEAPONS[p.weapon]||WEAPONS.rifle,a=p.aim;
 const rate=p.specT>0&&p.ch.spec==='burst'?w.cd/3:w.cd/p.ch.rate;
 p.cd=Math.max(3,Math.round(rate));
 const pose=GFX.poseOf(p);
 const t=GFX.tip(pose,p.face<0,p.x+p.w/2,p.y+(p.prone?5:14));
 const tx=t.x,ty=t.y,dm=w.dmg*p.ch.dmg;
 if(w.kind==='spread'){for(let i=-2;i<=2;i++){const an=Math.atan2(a.y,a.x)+i*.2;
  addBullet(tx,ty,Math.cos(an)*w.spd,Math.sin(an)*w.spd,w,dm*(w.close||1));}SND.play('spread');}
 else if(w.kind==='fire'){addBullet(tx,ty,a.x*w.spd,a.y*w.spd,w,dm,{spin:rnd(0,6.28)});SND.play('fire');}
 else if(w.kind==='laser'){addBullet(tx,ty,a.x*w.spd,a.y*w.spd,w,dm,{hitSet:new Set()});SND.play('laser');}
 else if(w.kind==='homing'){addBullet(tx,ty,a.x*w.spd,a.y*w.spd,w,dm);
  addBullet(tx,ty,a.x*w.spd*.85,a.y*w.spd*.85-1,w,dm);SND.play('homing');}
 else{addBullet(tx,ty,a.x*w.spd,a.y*w.spd,w,dm);SND.play(p.weapon==='machine'?'mg':'shot');}
 p.muzzle=4;p.recoil=2;shell(p.x+p.w/2,p.y+12,p.face);spark(tx,ty,2,w.col,1.6);}
function hurt(n){const p=pl;if(!p||p.inv>0||p.dead||p.dashT>0)return;
 p.hp-=n;p.inv=88;cam.shake=9;flash=6;hurtFlash();SND.play('hurt');
 spark(p.x+p.w/2,p.y+p.h/2,16,P.rd2,3.6);combo=0;pressure=Math.max(0,pressure-2);
 if(p.hp<=0){p.dead=true;deadT=0;lives--;boom(p.x+p.w/2,p.y+p.h/2,28,P.rd2);SND.play('boom');}}
function setProne(p,want){
 if(want&&!p.prone){const cx=p.x+p.w/2,feet=p.y+p.h,nx=cx-PW/2,ny=feet-PH;
  if(boxFree(nx,ny,PW,PH)){p.prone=true;p.w=PW;p.h=PH;p.x=nx;p.y=ny;}}
 else if(!want&&p.prone){const cx=p.x+p.w/2,feet=p.y+p.h,nx=cx-BW/2,ny=feet-SH;
  if(boxFree(nx,ny,BW,SH)){p.prone=false;p.w=BW;p.h=SH;p.x=nx;p.y=ny;}}}
function updPlayer(){const p=pl;if(!p)return;p.px=p.x;p.py=p.y;
 if(p.dead){deadT++;return;}
 const c=p.ch;
 if(p.inv>0)p.inv--;if(p.cd>0)p.cd--;if(p.dashCD>0)p.dashCD--;
 if(p.muzzle>0)p.muzzle--;if(p.recoil>0)p.recoil--;if(p.webT>0)p.webT--;
 if(p.pushT>0)p.pushT--;if(p.drop>0)p.drop--;if(p.landT>0)p.landT--;
 if(p.specT>0){p.specT--;if(!p.specT)p.drone=null;}
 p.breath+=.05;
 if(K.left&&!K.right)p.face=-1;else if(K.right&&!K.left)p.face=1;
 setProne(p,!!(K.down&&!K.up&&p.onGround&&p.dashT<=0));
 p.aim=aimOf(p);p.aimKey=GFX.aimKey(p.aim);
 if(p.groundMover&&!p.groundMover.dead){p.x+=p.groundMover.vx||0;p.y+=p.groundMover.vy||0;}
 else p.groundMover=null;
 if(p.dashT>0){p.dashT--;p.vx=p.face*(c.id==='den'?9.6:7.8);p.vy=0;
  if(p.dashT%2===0&&pPart.count<MAXPART){const o=pPart.get();o.x=p.x+p.w/2;o.y=p.y+p.h/2;o.vx=0;o.vy=0;
   o.life=o.max=12;o.c=c.pal.acc;o.g=0;o.s=2;o.kind=0;}
  const arr=gridAt(p.x+p.w/2,p.y+p.h/2);
  if(arr)for(const f of arr){if(!f.dead&&Math.abs(f.x+f.w/2-(p.x+p.w/2))<24&&Math.abs(f.y+f.h/2-(p.y+p.h/2))<26)kill(f,3.4);}
  if(boss&&boss.hp>0&&Math.abs(boss.x-(p.x+p.w/2))<boss.w*.6)damageBoss(2.6);}
 else if(p.pushT>0)p.vx*=.88;
 else{const top=c.speed*(p.webT>0?.45:1)*(p.prone?0:1);
  if(p.prone)p.vx*=.6;
  else if(K.left&&!K.right)p.vx=Math.max(-top,p.vx-ACC);
  else if(K.right&&!K.left)p.vx=Math.min(top,p.vx+ACC);
  else{p.vx*=p.onGround?FRIC:.94;if(Math.abs(p.vx)<.06)p.vx=0;}}
 if(eat('jump'))p.buf=8;
 if(p.buf>0)p.buf--;
 if(p.coyote>0)p.coyote--;
 const ccx=Math.floor((p.x+p.w/2)/TS),ccy=Math.floor((p.y+p.h+1)/TS);
 const onPlat=plt(ccx,ccy)&&!sol(ccx,ccy);
 if(p.buf>0&&p.onGround&&K.down&&onPlat){p.drop=12;p.y+=2;p.vy=1.6;p.buf=0;p.onGround=false;setProne(p,false);SND.play('jump');}
 else if(p.buf>0){
  if(p.onGround||p.coyote>0){setProne(p,false);
   p.vy=-c.jump*1.12;p.onGround=false;p.jumps=1;p.buf=0;p.coyote=0;p.jcut=true;p.groundMover=null;
   SND.play('jump');spark(p.x+p.w/2,p.y+p.h,6,P.g4,1.8);}
  else if(c.dbl&&p.jumps<2){p.vy=-c.jump*1.02;p.jumps=2;p.buf=0;p.jcut=true;SND.play('djump');
   for(let i=0;i<10&&pPart.count<MAXPART;i++){const o=pPart.get();o.x=p.x+p.w/2;o.y=p.y+p.h;o.vx=rnd(-2.2,2.2);o.vy=rnd(0,2.2);
    o.life=o.max=16;o.c=c.pal.acc;o.g=.05;o.s=1;o.kind=0;}}
  else if(c.dash&&c.id==='den'&&p.dashCD<=0){p.dashT=12;p.dashCD=40;p.buf=0;SND.play('dash');}}
 if(p.vy<0&&!K.jump&&p.jcut){p.vy*=.62;p.jcut=false;}
 p.hover=c.hover&&!p.onGround&&K.jump&&p.vy>0;
 let gv=GRAV;
 if(Math.abs(p.vy)<1.6&&!p.onGround)gv=GRAV*.62;
 if(p.hover){gv=.07;p.vy=Math.min(p.vy,1.2);
  if(tick%3===0&&pPart.count<MAXPART){const o=pPart.get();o.x=p.x+p.w/2+rnd(-6,6);o.y=p.y+p.h;o.vx=rnd(-.4,.4);o.vy=rnd(.4,1.2);
   o.life=o.max=14;o.c=P.pu1;o.g=0;o.s=1;o.kind=0;}}
 if(p.dashT<=0)p.vy=Math.min(p.vy+gv,JMAX);
 if(c.dash&&c.id==='artyom'&&K.spec&&p.dashCD<=0&&p.onGround&&p.spec<100&&p.specT<=0){p.dashT=14;p.dashCD=52;SND.play('dash');}
 if(eat('spec')&&p.spec>=100&&p.specT<=0){p.spec=0;SND.play('spec');flash=5;cam.shake=7;addHitstop(3);
  if(c.spec==='burst'){p.specT=480;pop(p.x,p.y-14,'ШКВАЛ!',P.yl2);}
  if(c.spec==='drone'){p.specT=600;p.drone={a:0,cd:0,x:0,y:0};pop(p.x,p.y-14,'ДРОН!',P.cy2);}
  if(c.spec==='blink'){p.dashT=16;p.dashCD=22;pop(p.x,p.y-14,'БЛИНК!',P.cy2);spark(p.x+p.w/2,p.y+p.h/2,22,P.cy2,4.2);}
  if(c.spec==='quake'){pop(p.x,p.y-14,'УДАР ЗЕМЛИ!',P.or2);boom(p.x+p.w/2,p.y+p.h,32,P.or2);
   for(const f of foes)if(!f.dead&&Math.abs(f.x-p.x)<150&&f.y+f.h>p.y)kill(f,9);
   if(boss&&boss.hp>0&&Math.abs(boss.x-p.x)<180)damageBoss(15);}}
 move(p,p.vx,p.vy);
 const wasAir=!p.onGround;p.onGround=onFloor(p);
 if(p.onGround){if(wasAir&&p.jumps>0){SND.play('land');p.landT=6;spark(p.x+p.w/2,p.y+p.h,5,col(th.grassLo,P.cg3),1.5);}
  p.jumps=0;p.coyote=6;}
 p.moving=(K.left||K.right)&&p.onGround&&!p.prone&&p.dashT<=0&&Math.abs(p.vx)>.3;
 if(p.moving)p.anim+=.25+Math.abs(p.vx)*.12;else if(p.onGround)p.anim=0;
 p.fr=(p.anim|0)%6;
 p.body=p.prone?'prone':(!p.onGround?(p.vy<0?'jump':'fall'):(p.moving?'run':'idle'));
 const fx=Math.floor((p.x+p.w/2)/TS),fy=Math.floor((p.y+p.h-2)/TS);
 if(hz(fx,fy)&&p.inv<=0){if(T(fx,fy)==='~'){hurt(2);p.vy=-6;}else hurt(1);}
 if(p.y>H+50)hurt(99);
 if(K.fire)shoot(p);
 if(p.drone){p.drone.a+=.08;if(p.drone.cd>0)p.drone.cd--;
  const dx=p.x+p.w/2+Math.cos(p.drone.a)*26,dy=p.y+8+Math.sin(p.drone.a)*15;
  p.drone.x=dx;p.drone.y=dy;
  if(p.drone.cd<=0){const t=near(dx,dy);
   if(t){const a=Math.atan2(t.y+t.h/2-dy,t.x+t.w/2-dx);
    addBullet(dx,dy,Math.cos(a)*7.6,Math.sin(a)*7.6,WEAPONS.rifle,1.1);p.drone.cd=14;SND.play('mg');}}}
 if(p.moving&&tick%7===0&&pPart.count<MAXPART){const o=pPart.get();o.x=p.x+p.w/2;o.y=p.y+p.h;o.vx=-p.vx*.2;o.vy=-rnd(.2,.8);
  o.life=o.max=12;o.c=col(th.grassLo,P.cg3);o.g=.06;o.s=1;o.kind=0;}}
function near(x,y){let b=null,bd=1e9;
 for(const f of foes){if(f.dead)continue;const d=(f.x-x)*(f.x-x)+(f.y-y)*(f.y-y);if(d<bd&&d<78400){bd=d;b=f;}}
 if(boss&&boss.hp>0){const d=(boss.x-x)*(boss.x-x)+(boss.y-boss.h/2-y)*(boss.y-boss.h/2-y);
  if(d<bd)b={x:boss.x-boss.w/2,y:boss.y-boss.h,w:boss.w,h:boss.h};}
 return b;}
function spawn(type,x,y,v){const d=ENEMIES[type];if(!d)return;
 foes.push({type,x:x+(16-d.w)/2,y:y-d.h,px:x,py:y-d.h,vx:0,vy:0,w:d.w,h:d.h,
  hp:d.hp,maxhp:d.hp,def:d,face:-1,t:ri(60),cd:ri(8,30),anim:rnd(0,3),fr:0,
  dead:false,onGround:false,hitT:0,base:y,pushT:0,dirX:0,moving:false,stuck:0,
  aimA:0,charge:0,burst:0,flame:0,muzzle:0,v:v==null?ri(3):v,alert:0,
  hide:0,peek:0,rope:type==='rappeller'?1:0,dodge:0,think:ri(20)});}
function kill(f,n){f.hp-=n;f.hitT=5;SND.play('hit');spark(f.x+f.w/2,f.y+f.h/2,4,P.yl1,2.2);addHitstop(1);
 if(f.hp<=0&&!f.dead){f.dead=true;kills++;combo++;comboT=120;pressure=Math.min(20,pressure+1);
  const sc=Math.round(f.def.score*(1+Math.min(combo,12)*.12));
  score+=sc;pop(f.x+f.w/2,f.y,'+'+sc,combo>4?P.or2:P.yl2);
  boom(f.x+f.w/2,f.y+f.h/2,15,P.or2);SND.play('kill');addHitstop(2);
  if(pl)pl.spec=Math.min(100,pl.spec+9);
  if(f.def.drop)dropItem(f.x+f.w/2,f.y+f.h/2);
  else if(Math.random()<.14)dropItem(f.x+f.w/2,f.y+f.h/2,true);}}
function dropItem(x,y,sm){const k=sm?(Math.random()<.5?'heal':'spec'):WORDER[ri(WORDER.length)];
 const o=pItem.get();o.x=x;o.y=y;o.vy=-2.4;o.kind=k;o.t=0;o.life=680;}
function addEbul(x,y,vx,vy,r,c,life,extra){const b=pEbul.get();
 b.x=x;b.y=y;b.px=x;b.py=y;b.vx=vx;b.vy=vy;b.r=r;b.col=c;b.life=life;
 b.grav=0;b.bomb=false;b.web=false;b.fire=false;b.puddle=false;b.floor=0;b.dmg=1;
 if(extra)Object.assign(b,extra);return b;}
function eshoot(f,tx,ty,sp,o){const a=Math.atan2(ty-(f.y+f.h*.4),tx-(f.x+f.w/2));
 addEbul(f.x+f.w/2+f.face*8,f.y+f.h*.4,Math.cos(a)*sp,Math.sin(a)*sp,3,P.or2,180,o);
 f.muzzle=4;SND.play('shot');}
function bulletIncoming(f){const bl=pBul.live;
 for(let i=0;i<bl.length;i++){const b=bl[i];if(b.dead)continue;
  const dx=f.x+f.w/2-b.x,dy=f.y+f.h/2-b.y;
  if(Math.abs(dy)<14&&dx*b.vx>0&&Math.abs(dx)<70)return true;}
 return false;}
function updFoes(){const p=pl;const aggro=1+Math.min(.5,pressure*.02);
 for(let i=foes.length-1;i>=0;i--){const f=foes[i];
  if(f.dead){foes.splice(i,1);continue;}
  f.px=f.x;f.py=f.y;
  if(f.hitT>0)f.hitT--;if(f.pushT>0)f.pushT--;if(f.muzzle>0)f.muzzle--;
  if(f.dodge>0)f.dodge--;if(f.think>0)f.think--;
  f.t++;
  if(f.x<cam.x-180||f.x>cam.x+W+240){if(f.t>900)foes.splice(i,1);continue;}
  const pcx=p?p.x+p.w/2:0,pcy=p?p.y+p.h/2:0;
  const dx=pcx-(f.x+f.w/2),dy=pcy-(f.y+f.h/2),dist=Math.hypot(dx,dy);
  if(f.pushT<=0&&f.rope<=0)f.face=dx<0?-1:1;
  f.moving=false;
  const D=f.def,inR=dist<(D.range||260)&&p&&!p.dead;
  if(inR)f.alert=Math.min(30,f.alert+2);else f.alert=Math.max(0,f.alert-1);
  if(D.kind==='ground'&&f.rope<=0&&f.y>GY+18){f.stuck++;
   if(f.stuck>16){f.vy=-9;f.vx=sgn(dx||1)*2.6;f.stuck=0;}}else f.stuck=0;
  if(D.kind==='ground'&&f.onGround&&f.dodge<=0&&f.think<=0&&bulletIncoming(f)&&Math.random()<.5){
   f.vy=-6.8;f.dodge=40;f.think=30;f.moving=true;}
  if(f.rope>0){f.rope++;f.y+=1.6;f.vy=0;f.vx=0;f.x+=Math.sin(f.rope*.08)*.3;
   if(inR&&--f.cd<=0){f.cd=D.fire||44;f.burst=2;eshoot(f,pcx,pcy,3.8);}
   if(f.burst>0&&f.t%6===0){f.burst--;eshoot(f,pcx,pcy,3.8);}
   if(f.rope>150||onFloor(f))f.rope=0;
   continue;}
  if(f.pushT>0)f.vx*=.86;
  else switch(D.ai){
   case 'charge':{if(Math.abs(dx)>20){const d=f.face;
     if(f.onGround&&!ahead(f,d)){if(gapSize(f,d)<=4){f.vy=-7.2;f.vx=d*D.spd*1.5;}else{f.face=-d;f.vx=-d*D.spd*.6;}}
     else if(f.onGround&&wallAhead(f,d))f.vy=-6.8;
     else{f.vx=d*D.spd*(dist<230?1.25:1)*aggro;f.moving=true;}}else f.vx*=.6;break;}
   case 'hop':if(f.onGround){f.vx*=.8;
     if(f.t%42===0&&dist<310){const d=f.face;if(!ahead(f,d)&&gapSize(f,d)>4)f.face=-d;
      f.vy=-7.2;f.vx=f.face*2.7;f.moving=true;}}break;
   case 'burst':f.vx=Math.abs(dx)>200?f.face*D.spd:0;f.moving=f.vx!==0;
     if(f.onGround&&f.vx&&!ahead(f,f.face))f.vx=0;
     if(inR){f.aimA=Math.atan2(dy,dx);
      if(--f.cd<=0){f.cd=Math.round(D.fire/aggro);f.burst=3;}
      if(f.burst>0&&f.t%5===0){f.burst--;eshoot(f,pcx,pcy,4.5);}}break;
   case 'flame':f.vx=Math.abs(dx)>90?f.face*D.spd:0;f.moving=f.vx!==0;
     if(f.onGround&&f.vx&&!ahead(f,f.face))f.vx=0;
     if(inR&&dist<175){f.flame++;
      if(f.flame%3===0&&pFlame.count<70){const a=Math.atan2(dy,dx),o=pFlame.get();
       o.x=f.x+f.w/2+f.face*10;o.y=f.y+10;o.vx=Math.cos(a)*3.7;o.vy=Math.sin(a)*3.7-.4;
       o.life=o.max=32;o.r=4;if(f.flame%9===0)SND.play('fire');}}
     else f.flame=0;break;
   case 'shoot':f.vx=0;
     if(inR){f.aimA=Math.atan2(dy,dx);
      if(--f.cd<=0){f.cd=Math.round(D.fire/aggro);f.muzzle=4;
       if(f.type==='turret'||f.type==='bunker'){for(let k=-1;k<=1;k++){const a=f.aimA+k*.17;
         addEbul(f.x+f.w/2,f.y+9,Math.cos(a)*4.1,Math.sin(a)*4.1,3,P.rd2,180);}SND.play('spread');}
       else{f.burst=2;eshoot(f,pcx,pcy,3.9);}}
      if(f.burst>0&&f.t%6===0){f.burst--;eshoot(f,pcx,pcy,3.9);}}break;
   case 'snipe':f.vx=0;
     if(inR){f.aimA=Math.atan2(dy,dx);
      if(--f.cd<=0){f.cd=D.fire;f.charge=32;}
      if(f.charge>0){f.charge--;if(f.charge===0){eshoot(f,pcx,pcy,8.2,{col:P.cy2,r:2});SND.play('laser');}}}
     else f.charge=0;break;
   case 'lob':f.vx=Math.abs(dx)>150?f.face*D.spd:0;f.moving=f.vx!==0;
     if(f.onGround&&f.vx&&!ahead(f,f.face))f.vx=0;
     if(inR&&--f.cd<=0){f.cd=Math.round(D.fire/aggro);f.muzzle=4;
      addEbul(f.x+f.w/2,f.y+4,dx/68,-4.7,4,P.gr1,200,{grav:.16,bomb:true});SND.play('fire');}break;
   case 'bomb':if(!f.dirX)f.dirX=f.face||1;
     f.vx=f.dirX*D.spd;f.y=f.base-f.h+Math.sin(f.t*.06)*20;
     if(f.x<cam.x-70||f.x>cam.x+W+70)f.dirX*=-1;
     if(inR&&--f.cd<=0){f.cd=Math.round(D.fire/aggro);
      addEbul(f.x+f.w/2,f.y+f.h,f.dirX*.6,1.2,4,P.mt2,220,{grav:.17,bomb:true});SND.play('fire');}break;
   case 'fly':if(!f.dirX)f.dirX=f.face||1;
     f.vx=f.dirX*D.spd;f.y=f.base-f.h+Math.sin(f.t*.05)*26;
     if(f.x<cam.x-70||f.x>cam.x+W+70)f.dirX*=-1;
     if(inR&&--f.cd<=0){f.cd=Math.round(D.fire/aggro);f.muzzle=4;
      addEbul(f.x+f.w/2,f.y+f.h,dx/88,3,3,P.pu1,200,{grav:.05});}break;
  }
  if(f.moving||D.kind==='air')f.anim+=D.kind==='air'?.22:.19;
  f.fr=(f.anim|0)%3;
  if(D.kind!=='air'){f.vy=Math.min(f.vy+GRAV,JMAX);move(f,f.vx,f.vy);f.onGround=onFloor(f);}
  else f.x+=f.vx;
  if(f.y>H+80){foes.splice(i,1);continue;}
  if(p&&!p.dead&&overlap(p,f)){const d=sgn((p.x+p.w/2)-(f.x+f.w/2))||1;
   if(p.inv<=0&&p.dashT<=0)hurt(1);
   const ov=Math.min(p.x+p.w-f.x,f.x+f.w-p.x),pu=Math.max(2,ov*.6);
   p.x+=d*pu;p.vx=d*3.4;p.pushT=9;
   if(D.kind!=='fixed'){f.x-=d*pu;f.vx=-d*2.6;f.pushT=14;}
   spark((p.x+f.x+f.w)/2,p.y+p.h*.5,5,P.or1,2.4);}}
 for(let i=0;i<foes.length;i++){const a=foes[i];if(a.dead||a.def.kind==='air')continue;
  for(let j=i+1;j<foes.length;j++){const b=foes[j];if(b.dead||b.def.kind==='air'||!overlap(a,b))continue;
   const ov=Math.min(a.x+a.w-b.x,b.x+b.w-a.x);if(ov<=0)continue;
   const d=sgn((a.x+a.w/2)-(b.x+b.w/2))||1,s=Math.min(2,ov*.35);
   if(a.def.kind!=='fixed')a.x+=d*s;if(b.def.kind!=='fixed')b.x-=d*s;}}
 const fl=pFlame.live;
 for(let i=0;i<fl.length;i++){const o=fl[i];if(o.dead)continue;
  o.life--;o.x+=o.vx;o.y+=o.vy;o.vy+=.05;o.r+=.26;
  if(o.life%4===0&&pPart.count<MAXPART){const q=pPart.get();q.x=o.x;q.y=o.y;q.vx=rnd(-.5,.5);q.vy=rnd(-1.4,-.4);
   q.life=q.max=12;q.c=[P.fl1,P.fl2,P.fl3][ri(3)];q.g=0;q.s=2;q.kind=0;}
  if(p&&!p.dead&&p.inv<=0&&Math.abs(p.x+p.w/2-o.x)<o.r+5&&Math.abs(p.y+p.h/2-o.y)<o.r+8)hurt(1);
  if(o.life<=0)o.dead=true;}
 pFlame.sweep();}
function updWorld(){const mv=pMover.live;
 for(let i=0;i<mv.length;i++){const m=mv[i];if(m.dead)continue;m.t++;
  const ph=Math.sin(m.t*m.sp);
  const nx=m.axis==='h'?m.ox+ph*m.range:m.ox,ny=m.axis==='v'?m.oy+ph*m.range:m.oy;
  m.vx=nx-m.x;m.vy=ny-m.y;m.x=nx;m.y=ny;}
 pMover.sweep();
 const p=pl;
 if(lvl.rappels)for(const r of lvl.rappels){if(r.done)continue;const rx=r.x*TS;
  if(rx>cam.x-40&&rx<cam.x+W+40){r.done=true;spawn('rappeller',rx,-10);
   const f=foes[foes.length-1];if(f){f.rope=1;f.y=-20;f.base=GY-40;}}}
 if(p&&!p.dead&&lvl.zones){for(const z of lvl.zones){
   if(Math.abs(p.x-z.x*TS)<90){z.cd=(z.cd||0)-1;
    if(z.cd<=0){z.cd=170+ri(60);const w=pWarn.get();w.x=p.x+p.w/2+rnd(-30,30);w.y=GY;w.t=70;SND.play('boss');}}}}
 const wl=pWarn.live;
 for(let i=0;i<wl.length;i++){const w=wl[i];if(w.dead)continue;w.t--;
  if(w.t===0){addEbul(w.x,-10,0,6,5,P.mt2,200,{grav:.2,bomb:true});w.dead=true;}}
 pWarn.sweep();}
function updBullets(){const bl=pBul.live;
 for(let i=0;i<bl.length;i++){const b=bl[i];if(b.dead)continue;
  b.px=b.x;b.py=b.y;b.t++;b.life--;
  if(b.kind==='fire'){b.spin+=.35;b.x+=b.vx;b.y+=b.vy+Math.sin(b.spin)*1.2;}
  else if(b.kind==='homing'){const t=near(b.x,b.y);
   if(t){const a=Math.atan2(t.y+t.h/2-b.y,t.x+t.w/2-b.x);
    b.vx=lerp(b.vx,Math.cos(a)*7.2,.13);b.vy=lerp(b.vy,Math.sin(a)*7.2,.13);}
   b.x+=b.vx;b.y+=b.vy;
   if(b.t%2===0&&pPart.count<MAXPART){const o=pPart.get();o.x=b.x;o.y=b.y;o.vx=0;o.vy=0;o.life=o.max=10;o.c=P.pu2;o.g=0;o.s=1;o.kind=0;}}
  else{b.x+=b.vx;b.y+=b.vy;}
  if(b.life<=0||b.x<cam.x-60||b.x>cam.x+W+60||b.y<-50||b.y>H+50){b.dead=true;continue;}
  const cx=Math.floor(b.x/TS),cy=Math.floor(b.y/TS);
  if(T(cx,cy)==='B'){breakTile(cx,cy);boom(cx*TS+8,cy*TS+8,14,P.br1);dropItem(cx*TS+8,cy*TS+8);b.dead=true;continue;}
  if(sol(cx,cy)){spark(b.x,b.y,3,P.mt1,1.6);if(!b.pierce){b.dead=true;continue;}}
  const arr=gridAt(b.x,b.y);
  if(arr){for(let k=0;k<arr.length;k++){const f=arr[k];if(f.dead)continue;
    if(b.hitSet&&b.hitSet.has(f))continue;
    if(b.x>f.x-2&&b.x<f.x+f.w+2&&b.y>f.y-2&&b.y<f.y+f.h+2){kill(f,b.dmg);
     if(b.pierce){if(b.hitSet)b.hitSet.add(f);}else{b.dead=true;break;}}}}
  if(!b.dead&&boss&&boss.hp>0&&bIntro<=0&&b.x>boss.x-boss.w/2&&b.x<boss.x+boss.w/2&&b.y>boss.y-boss.h&&b.y<boss.y){
   damageBoss(b.dmg);if(!b.pierce)b.dead=true;}}
 pBul.sweep();
 const el=pEbul.live,p=pl;
 for(let i=0;i<el.length;i++){const b=el[i];if(b.dead)continue;
  b.px=b.x;b.py=b.y;b.life--;if(b.grav)b.vy+=b.grav;b.x+=b.vx;b.y+=b.vy;
  if(b.life<=0||b.x<cam.x-80||b.x>cam.x+W+80||b.y>H+60){b.dead=true;continue;}
  if(b.bomb&&b.y>GY-4){boom(b.x,b.y,16,P.gr1);b.dead=true;continue;}
  if(b.puddle&&b.y>=b.floor){if(pPart.count<MAXPART){const o=pPart.get();o.x=b.x;o.y=b.floor;o.r=12;o.life=o.max=240;o.c=P.gr1;o.kind=2;}
   b.dead=true;continue;}
  if(p&&!p.dead&&p.inv<=0&&b.x>p.x-2&&b.x<p.x+p.w+2&&b.y>p.y-2&&b.y<p.y+p.h+2){
   hurt(b.dmg||1);if(b.web)p.webT=140;b.dead=true;}}
 pEbul.sweep();
 for(let i=0;i<foes.length;i++){const f=foes[i];
  if(f.burn>0&&f.t%20===0){kill(f,1);spark(f.x+f.w/2,f.y+f.h/2,3,P.fl2,2);}}}
function updItems(){const p=pl,il=pItem.live;
 for(let i=0;i<il.length;i++){const it=il[i];if(it.dead)continue;
  it.t++;it.life--;it.vy=Math.min(it.vy+.24,6);it.y+=it.vy;
  const cx=Math.floor(it.x/TS),cy=Math.floor((it.y+8)/TS);
  if(sol(cx,cy)||plt(cx,cy)){it.y=cy*TS-8;it.vy=0;}
  if(it.life<=0||it.y>H+40){it.dead=true;continue;}
  if(p&&!p.dead&&Math.abs(it.x-(p.x+p.w/2))<20&&Math.abs(it.y-(p.y+p.h/2))<26){
   SND.play('pick');score+=200;
   if(it.kind==='heal'){p.hp=Math.min(p.maxhp,p.hp+2);pop(it.x,it.y-10,'+2 HP',P.rd1);}
   else if(it.kind==='spec'){p.spec=Math.min(100,p.spec+50);pop(it.x,it.y-10,'ПРИЁМ +50',P.cy2);}
   else if(WEAPONS[it.kind]){p.weapon=it.kind;pop(it.x,it.y-10,WEAPONS[it.kind].name,P.yl2);}
   spark(it.x,it.y,12,P.yl1,2.8);it.dead=true;}}
 pItem.sweep();}
function updParts(){const al=pPart.live;
 for(let i=0;i<al.length;i++){const p=al[i];if(p.dead)continue;p.life--;
  if(p.life<=0){p.dead=true;continue;}
  if(p.kind===0){p.vy+=p.g||0;p.x+=p.vx;p.y+=p.vy;}
  else if(p.kind===2&&pl&&pl.inv<=0&&Math.abs(pl.x+6-p.x)<p.r&&pl.y+pl.h>p.y-5)hurt(1);}
 pPart.sweep();
 const tl=pTxt.live;
 for(let i=0;i<tl.length;i++){const t=tl[i];if(t.dead)continue;t.life--;t.y-=.42;if(t.life<=0)t.dead=true;}
 pTxt.sweep();}
function spawnBoss(i){const d=BOSSES[i],ax=(lvl.w-ARENA)*TS;
 boss={def:d,idx:i,x:ax+340,y:GY,hp:d.hp,maxhp:d.hp,w:d.w,h:d.h,
  st:'idle',t:0,cd:110,face:-1,phase:1,anim:0,gait:0,hitT:0,legs:[],tail:[],
  eyeGlow:0,clawT:0,ceil:false,vy:0,vx:0,dead:false,deathT:0,tele:0,atk:null,ax,
  swing:0,beamT:0,beamA:0,stabI:0,stabT:0,dropT:0,chX:-1,jaw:0,ranged:0,pose:0};
 for(let k=0;k<8;k++)boss.legs.push({ext:0,ph:k*.7});
 for(let k=0;k<8;k++)boss.tail.push({x:0,y:0});
 bIntro=150;SND.play('boss');SND.music('boss');}
function damageBoss(n){if(!boss||boss.hp<=0||bIntro>0)return;
 boss.hp-=n;boss.hitT=5;SND.play('hit');spark(boss.x+rnd(-26,26),boss.y-rnd(12,boss.h),4,P.yl1,2.6);
 if(pl)pl.spec=Math.min(100,pl.spec+1.2);
 const r=boss.hp/boss.maxhp,np=r<.3?3:r<.6?2:1;
 if(np>boss.phase){boss.phase=np;flash=6;cam.shake=9;SND.play('boss');pop(boss.x,boss.y-boss.h-12,'ФАЗА '+np,P.rd2);}
 if(boss.hp<=0){boss.hp=0;boss.dead=true;boss.deathT=0;score+=boss.def.score;cam.shake=13;}}
function updBoss(){if(!boss)return;const b=boss,p=pl;
 b.gait+=.09+(b.st==='act'?.06:0);b.anim+=.1;if(b.hitT>0)b.hitT--;
 if(b.jaw>0&&b.atk!=='fireball')b.jaw-=.06;
 if(b.dead){b.deathT++;
  if(b.deathT<92&&b.deathT%9===0){boom(b.x+rnd(-46,46),b.y-rnd(8,b.h),20,P.fl2);SND.play('boom');}
  if(b.deathT===100){clearT=1;SND.music(si>=LEVELS.length-1?'win':'clear');}
  return;}
 if(bIntro>0){bIntro--;return;}
 if(!p||p.dead)return;
 b.t++;
 const pcx=p.x+p.w/2,pcy=p.y+p.h/2,dx=pcx-b.x,dist=Math.abs(dx);
 if(b.st!=='act')b.face=dx<0?-1:1;
 const sp=1+(b.phase-1)*.35;
 if(b.st==='idle'){b.cd-=sp;
  if(b.def.id==='dog'||b.def.id==='cat'){const want=b.face*(dist>240?1.0:dist<160?-0.9:0.25);
   b.x+=want*sp;b.x=clamp(b.x,b.ax+80,b.ax+400);}
  if(b.cd<=0){
   const ranged=b.def.id==='dog'?['fireball','howl']:b.def.id==='cat'?['eyebeam','volley']:['web','poison','spawn'];
   const melee=b.def.id==='dog'?['tail','charge','leap']:b.def.id==='cat'?['claw','pounce']:['legstab','drop','scurry'];
   let m;
   if((b.ranged||0)<2&&b.phase<2)m=ranged[ri(ranged.length)];
   else if(dist<95&&b.phase>=2)m=melee[ri(melee.length)];
   else m=Math.random()<.55?ranged[ri(ranged.length)]:melee[ri(melee.length)];
   if(ranged.indexOf(m)>=0)b.ranged=(b.ranged||0)+1;
   b.atk=m;b.st='tele';
   b.tele=(m==='tail'||m==='claw')?32:(m==='leap'||m==='pounce')?36:m==='drop'?38:34;
   b.pose=1;}}
 else if(b.st==='tele'){b.tele--;b.pose=1;
  if(b.atk==='fireball'||b.atk==='howl')b.jaw=Math.min(1,b.jaw+.1);
  if(b.tele<=0){b.st='act';b.t=0;b.pose=2;startAtk(b);}}
 else if(b.st==='act'){runAtk(b,pcx,pcy,sp);b.pose=2;}
 else if(b.st==='rest'){b.cd--;b.pose=0;if(b.cd<=0){b.st='idle';b.cd=Math.max(24,72-b.phase*14);}}
 for(let i=0;i<b.tail.length;i++){const t=b.tail[i],
   tx=b.x-b.face*(b.w*.42+i*10),
   ty=b.y-b.h*.5+Math.sin(b.gait*1.6+i*.5)*(5+i)-((b.atk==='tail'&&b.st!=='idle')?12:0);
  t.x=lerp(t.x||tx,tx,.4);t.y=lerp(t.y||ty,ty,.4);}
 if(p.inv<=0&&!p.dead&&b.st!=='act'&&overlap(p,{x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h})){
  const d=sgn(pcx-b.x)||1;hurt(1);p.x+=d*10;p.vx=d*4;p.pushT=12;}}
function startAtk(b){const p=pl;if(!p)return;const pcx=p.x+p.w/2,pcy=p.y+p.h/2;
 switch(b.atk){
  case 'howl':SND.play('boss');cam.shake=6;b.jaw=1;
   for(let i=0;i<2;i++)spawn('runner',b.x+rnd(-60,60),GY);b.st='rest';b.cd=50;break;
  case 'stalk':SND.play('dash');b.stalkX=pcx;b.st='act';b.t=0;break;
  case 'scurry':SND.play('dash');b.scX=(b.x<pcx?1:-1);b.st='act';b.t=0;break;
  case 'fireball':{const n=2+b.phase;b.jaw=1;
   for(let i=0;i<n;i++){const a=Math.atan2(pcy-(b.y-b.h*.66),pcx-b.x)+(i-(n-1)/2)*.2;
    addEbul(b.x+b.face*40,b.y-b.h*.66,Math.cos(a)*4.2,Math.sin(a)*4.2,6,P.fl2,210,{fire:true});}
   SND.play('fire');b.st='rest';b.cd=42;break;}
  case 'tail':b.swing=0;SND.play('dash');break;
  case 'charge':b.chX=b.face;SND.play('dash');break;
  case 'leap':b.vy=-9.8;b.vx=b.face*3.2;SND.play('jump');break;
  case 'claw':b.clawT=0;SND.play('dash');break;
  case 'eyebeam':b.beamT=0;b.beamA=Math.atan2(pcy-(b.y-b.h*.76),pcx-b.x);SND.play('laser');break;
  case 'pounce':b.vy=-9;b.vx=clamp((pcx-b.x)/44,-5,5);SND.play('jump');break;
  case 'volley':{for(let i=0;i<5+b.phase*2;i++){const a=-2.5+i*.22;
    addEbul(b.x,b.y-b.h*.7,Math.cos(a)*3.6,Math.sin(a)*3.6,4,P.pu1,200);}
   SND.play('spread');b.st='rest';b.cd=46;break;}
  case 'web':{for(let i=0;i<3;i++){const a=Math.atan2(pcy-(b.y-b.h*.5),pcx-b.x)+(i-1)*.16;
    addEbul(b.x,b.y-b.h*.5,Math.cos(a)*4.2,Math.sin(a)*4.2,6,P.w,190,{web:true});}
   SND.play('spread');b.st='rest';b.cd=38;break;}
  case 'legstab':b.stabI=0;b.stabT=0;SND.play('dash');break;
  case 'drop':b.ceil=true;b.dropT=0;SND.play('jump');break;
  case 'spawn':{const n=b.phase>=3?2:1;for(let i=0;i<n;i++)spawn('crawler',b.x+rnd(-50,50),GY);
   SND.play('kill');b.st='rest';b.cd=52;break;}
  case 'poison':{for(let i=0;i<4+b.phase;i++){const a=-2.3+i*.26;
    addEbul(b.x,b.y-b.h*.6,Math.cos(a)*3.8,Math.sin(a)*3.8,5,P.gr1,210,{grav:.15,puddle:true,floor:GY-2});}
   SND.play('fire');b.st='rest';b.cd=48;break;}
  default:b.st='rest';b.cd=40;}}
function runAtk(b,pcx,pcy,sp){const p=pl;
 switch(b.atk){
  case 'stalk':{b.x=lerp(b.x,b.stalkX,.06*sp);
   if(b.t>50){b.atk='claw';b.clawT=0;b.t=0;}
   if(b.t>110){b.st='rest';b.cd=40;}break;}
  case 'scurry':{b.x+=b.scX*6*sp;b.x=clamp(b.x,b.ax+80,b.ax+400);
   if(b.t%10===0)spawn('crawler',b.x,GY-b.h);
   if(b.t>70){b.st='rest';b.cd=44;}break;}
  case 'tail':{b.swing+=.14*sp;const sw=Math.sin(b.swing*3.1);
   const hx=b.x-b.face*(b.w*.5+44*Math.abs(sw));
   if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-hx)<30&&p.y+p.h>b.y-26)hurt(2);
   if(b.swing>1.1){b.st='rest';b.cd=38;}break;}
  case 'charge':{b.x+=b.chX*5.4*sp;
   if(tick%3===0)spark(b.x-b.chX*40,b.y-8,3,P.br1,2);
   if(b.x<b.ax+80||b.x>b.ax+400){b.chX*=-1;b.face=b.chX;}
   if(b.t>92){b.st='rest';b.cd=34;}break;}
  case 'leap':case 'pounce':{b.vy+=.48;b.y+=b.vy;b.x+=b.vx;b.x=clamp(b.x,b.ax+80,b.ax+400);
   if(b.y>=GY){b.y=GY;b.vy=0;b.vx=0;boom(b.x,b.y,24,P.br1);SND.play('boom');
    if(p&&p.onGround&&Math.abs(p.x+p.w/2-b.x)<110)hurt(2);
    for(let i=0;i<2;i++)addEbul(b.x,b.y-8,(i?1:-1)*4.2,0,5,P.or2,100);
    b.st='rest';b.cd=40;}break;}
  case 'claw':{b.clawT+=.12*sp;
   const re=Math.sin(Math.min(1,b.clawT)*3.14)*58,hx=b.x+b.face*(b.w*.4+re);
   if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-hx)<26&&Math.abs(p.y+p.h/2-(b.y-b.h*.45))<34)hurt(2);
   if(b.clawT>1.15){b.st='rest';b.cd=36;}break;}
  case 'eyebeam':{b.beamT+=.02*sp;b.eyeGlow=1;
   const a=b.beamA+Math.sin(b.beamT*2.2)*.5;
   for(let d=24;d<440;d+=10){const bx=b.x+Math.cos(a)*d,by=b.y-b.h*.76+Math.sin(a)*d;
    if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-bx)<11&&Math.abs(p.y+p.h/2-by)<14){hurt(2);break;}}
   if(b.beamT>1.5){b.eyeGlow=0;b.st='rest';b.cd=44;}break;}
  case 'legstab':{b.stabT+=.1*sp;
   if(b.stabT>1){b.stabT=0;b.stabI++;SND.play('dash');}
   const i=b.stabI;
   if(i<4){const lx=b.x-80+i*54,ex=Math.sin(Math.min(1,b.stabT)*3.14);
    if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-lx)<18&&p.y+p.h>GY-54*ex)hurt(2);
    b.legs[i*2].ext=ex;b.legs[i*2+1].ext=ex;}
   else{b.legs.forEach(l=>l.ext=0);b.st='rest';b.cd=42;}break;}
  case 'drop':{b.dropT+=.03*sp;
   if(b.dropT<1)b.y=lerp(GY,70,Math.min(1,b.dropT*2));
   else if(b.dropT<1.6)b.x=lerp(b.x,pcx,.06);
   else{b.y+=11;
    if(b.y>=GY){b.y=GY;boom(b.x,GY,30,P.pu2);SND.play('boom');
     if(p&&Math.abs(p.x+p.w/2-b.x)<86)hurt(2);
     for(let i=0;i<6;i++){const a=-2.8+i*.5;addEbul(b.x,GY-6,Math.cos(a)*3.6,Math.sin(a)*3.6,4,P.pu1,120);}
     b.ceil=false;b.st='rest';b.cd=48;}}break;}
  default:b.st='rest';b.cd=40;}}
function drawChar(p,alpha){
 const pose=GFX.poseOf(p);
 const spr=GFX.player(p.ch.id,pose,p.face<0);
 if(!spr)return;
 if(p.inv>0&&(tick>>2)%2)return;
 const ix=lerp(p.px,p.x,alpha),iy=lerp(p.py,p.y,alpha);
 const recoil=p.recoil>0?p.face*-1:0;
 const cx=Math.round(ix-cam.x+p.w/2)+recoil,feet=Math.round(iy+p.h);
 const bob=p.landT>0?1:0;
 g.drawImage(spr,cx-(spr.width>>1),feet-spr.height+bob);
 if(p.muzzle>0){const t=GFX.tip(pose,p.face<0,ix+p.w/2,iy+(p.prone?5:14));
  const mx=t.x-cam.x,my=t.y;
  glow(mx,my,12,'rgba(255,225,140,.95)',.9);
  ell(mx,my,4,4,P.fl1);ell(mx,my,2,2,P.w);}
 if(p.dashT>0)glow(cx,iy+12,20,'rgba(53,224,255,.45)',.6);
 if(p.webT>0)for(let i=0;i<5;i++)beam(cx-8+i*4,iy+2,cx-6+i*4,iy+p.h,'rgba(255,255,255,.45)',1);
 if(p.drone){const ddx=p.drone.x-cam.x,ddy=p.drone.y;
  ellO(ddx,ddy,6,3,P.mt2,P.n);px(ddx-2,ddy-1,4,2,P.cy2);
  px(ddx-8,ddy-3,3,1,P.mt1);px(ddx+5,ddy-3,3,1,P.mt1);glow(ddx,ddy,10,'rgba(53,224,255,.4)',.55);}}
function drawFoe(f,alpha){
 let frame=0;
 if(f.def.kind==='ground'){if(f.hide>0)frame=0;else if(f.moving)frame=1+((f.anim|0)%2);else frame=0;}
 else frame=(f.anim|0)%2;
 const spr=GFX.foe(f.def.spr||f.type,f.v,frame,f.face<0);
 if(!spr)return;
 const ix=lerp(f.px,f.x,alpha),iy=lerp(f.py,f.y,alpha);
 const cx=Math.round(ix-cam.x+f.w/2),feet=Math.round(iy+f.h);
 const dx=cx-(spr.width>>1),dy=feet-spr.height;
 const flashOn=f.hitT>0&&(tick>>1)%2;
 if(flashOn){g.globalCompositeOperation='lighter';g.globalAlpha=.75;}
 g.drawImage(spr,dx,dy);
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
 if(f.rope>0){beam(cx,0,cx,dy+4,'#c8b088',2);for(let k=0;k<3;k++)px(cx-2,dy+8+k*8,4,2,'#8a7050');}
 if(f.type==='sniper'&&f.charge>0){const al=(32-f.charge)/32,a=f.aimA||0;
  beam(cx+Math.cos(a)*10,iy+10+Math.sin(a)*10,cx+Math.cos(a)*440,iy+10+Math.sin(a)*440,'rgba(255,74,61,'+(al*.55).toFixed(2)+')',1);}
 if(f.hp<f.maxhp){px(cx-8,dy-5,16,3,P.n);px(cx-8,dy-5,Math.round(16*f.hp/f.maxhp),3,P.rd2);}
 if(f.hide>0&&(tick>>3)%2){px(cx-1,dy-10,2,5,P.yl2);px(cx-1,dy-4,2,2,P.yl2);}}
function drawFlames(){const fl=pFlame.live;
 for(let i=0;i<fl.length;i++){const o=fl[i];if(o.dead)continue;
  const a=o.life/o.max,X=o.x-cam.x;g.globalAlpha=Math.min(1,a*1.3);
  ell(X,o.y,o.r,o.r*.8,P.fl3);ell(X,o.y,o.r*.6,o.r*.5,P.fl2);ell(X,o.y,o.r*.3,o.r*.25,P.fl1);
  g.globalAlpha=1;glow(X,o.y,o.r*2.2,'rgba(255,106,26,.4)',.5*a);}}
function drawMovers(){const mv=pMover.live;
 const MT=col(th.metal,P.mt3),MH=col(th.metalHi,P.mt1),ML=col(th.metalLo,P.mt5);
 for(let i=0;i<mv.length;i++){const m=mv[i];if(m.dead)continue;
  const X=Math.round(m.x-cam.x),Y=Math.round(m.y);if(X<-80||X>W+80)continue;
  px(X,Y,m.w,8,MT);px(X,Y,m.w,2,MH);px(X,Y+7,m.w,1,P.n);
  for(let k=0;k<m.w;k+=6){px(X+k,Y+3,3,2,ML);px(X+k+3,Y+3,3,2,P.yl2);}
  px(X,Y+8,m.w,1,ML);
  if(m.axis==='v')beam(X+m.w/2,Y-200,X+m.w/2,Y,ML,2);
  else{px(X-6,Y+2,4,4,ML);px(X+m.w+2,Y+2,4,4,ML);}}}
function drawWarnings(){const wl=pWarn.live;
 for(let i=0;i<wl.length;i++){const w=wl[i];if(w.dead)continue;const X=w.x-cam.x;
  if((tick>>2)%2){ell(X,w.y-2,10,3,P.rd2);txtCSh('!',X,w.y-16,P.rd2,1);}
  beam(X,w.y-220,X,w.y-6,'rgba(255,74,61,.18)',2);}}
function drawBullets(alpha){const bl=pBul.live;
 for(let i=0;i<bl.length;i++){const b=bl[i];if(b.dead)continue;
  const X=lerp(b.px,b.x,alpha)-cam.x,Y=lerp(b.py,b.y,alpha);
  if(b.kind==='laser'){const a=Math.atan2(b.vy,b.vx),tx=X-Math.cos(a)*b.len,ty=Y-Math.sin(a)*b.len;
   beam(tx,ty,X,Y,P.cy4,6);beam(tx,ty,X,Y,P.cy2,4);beam(tx,ty,X,Y,P.cy1,2);glow(X,Y,9,'rgba(53,224,255,.6)',.6);}
  else if(b.kind==='fire'){ell(X,Y,6,6,P.fl4);ell(X,Y,4.5,4.5,P.fl3);ell(X,Y,3,3,P.fl2);ell(X,Y,1.5,1.5,P.fl1);
   glow(X,Y,13,'rgba(255,106,26,.55)',.6);}
  else if(b.kind==='homing'){ell(X,Y,4,3,P.pu2);ell(X,Y,2,2,P.pu1);glow(X,Y,8,'rgba(217,179,255,.5)',.5);}
  else{const a=Math.atan2(b.vy,b.vx);beam(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,b.col,3);dot(X-1,Y-1,2,P.w);}}
 const el=pEbul.live;
 for(let i=0;i<el.length;i++){const b=el[i];if(b.dead)continue;
  const X=lerp(b.px,b.x,alpha)-cam.x,Y=lerp(b.py,b.y,alpha);
  if(b.fire){ell(X,Y,b.r+2,b.r+2,P.fl4);ell(X,Y,b.r,b.r,P.fl3);ell(X,Y,b.r-2,b.r-2,P.fl2);ell(X,Y,2,2,P.w);
   glow(X,Y,b.r*3,'rgba(255,106,26,.5)',.6);}
  else if(b.web){for(let k=0;k<6;k++)beam(X-b.r,Y-b.r+k*2,X+b.r,Y-b.r+k*2,'rgba(255,255,255,.8)',1);
   beam(X-b.r,Y-b.r,X+b.r,Y+b.r,'rgba(255,255,255,.8)',1);}
  else{ellO(X,Y,b.r+1,b.r+1,b.col,P.n);ell(X,Y,b.r-1,b.r-1,P.w);glow(X,Y,b.r*2.4,'rgba(255,163,42,.35)',.4);}}}
function drawItems(){const il=pItem.live;
 for(let i=0;i<il.length;i++){const it=il[i];if(it.dead)continue;
  const X=it.x-cam.x,Y=it.y+Math.sin(it.t*.12)*2;
  if(it.life<120&&(tick>>2)%2)continue;
  if(it.kind==='heal'){ellO(X,Y,9,9,P.rd3,P.n);px(X-2,Y-5,4,10,P.w);px(X-5,Y-2,10,4,P.w);}
  else if(it.kind==='spec'){ellO(X,Y,9,9,P.cy4,P.n);txt('S',X-2,Y-3,P.cy1,1);}
  else if(WEAPONS[it.kind]){box(X-10,Y-9,20,18,P.d2,P.n);px(X-9,Y-8,18,3,P.g2);txt(WEAPONS[it.kind].key,X-2,Y-3,WEAPONS[it.kind].col,1);}
  glow(X,Y,16,'rgba(255,212,0,.28)',.5);}}
function drawParts(){const al=pPart.live;
 for(let i=0;i<al.length;i++){const p=al[i];if(p.dead)continue;const a=p.life/p.max;
  if(p.kind===1){g.globalAlpha=a;g.strokeStyle=p.c;g.lineWidth=2;
   g.beginPath();g.arc(p.x-cam.x,p.y,p.r+(1-a)*p.rr,0,6.283);g.stroke();g.globalAlpha=1;continue;}
  if(p.kind===2){g.globalAlpha=Math.min(.6,a);ell(p.x-cam.x,p.y,p.r,4,p.c);g.globalAlpha=1;continue;}
  g.globalAlpha=Math.min(1,a*1.4);dot(p.x-cam.x,p.y,p.s||1,p.c);g.globalAlpha=1;}
 const tl=pTxt.live;
 for(let i=0;i<tl.length;i++){const t=tl[i];if(t.dead)continue;
  g.globalAlpha=Math.min(1,t.life/24);txtCSh(t.s,t.x-cam.x,t.y,t.c,1);g.globalAlpha=1;}}
function leg4(hx,hy,fx,fy,w,c1,c2,out,ph){
 const kx=hx+(fx-hx)*.4+Math.sin(ph)*3,ky=hy+(fy-hy)*.55-Math.abs(Math.sin(ph))*4;
 limb(hx,hy,kx,ky,w,c1,c2,out,out);limb(kx,ky,fx,fy,w-1,c1,c2,out,out);ell(fx,fy,w*.7,w*.45,out);}
function furStrokes(x,y,w,h,c,n,seed){for(let i=0;i<n;i++){
 const h1=CORE.hash(seed+i,3),h2=CORE.hash(seed+i,9);
 beam(x-w/2+h1*w,y-h/2+h2*h,x-w/2+h1*w+2,y-h/2+h2*h+3,c,1);}}
function drawBoss(){const b=boss;if(!b)return;
 const X=Math.round(b.x-cam.x),Y=Math.round(b.y);
 const h=b.hitT>0&&(tick>>1)%2,wind=b.st==='tele',strike=b.st==='act',id=b.def.id;
 if(id==='dog'){
  const B=h?'#ffffff':(wind?'#6a4020':'#241610'),D='#160d08',L='#4a2c18',O='#0a0604';
  let hx=X-b.face*b.w*.42,hy=Y-b.h*.55;
  for(let i=0;i<b.tail.length;i++){const t=b.tail[i],tx=t.x-cam.x,ty=t.y;
   beam(hx,hy,tx,ty,O,8-i);beam(hx,hy,tx,ty,B,6-i);beam(hx,hy-1,tx,ty-1,L,Math.max(1,3-i));hx=tx;hy=ty;}
  if(b.atk==='tail'&&strike){const sw=Math.sin(b.swing*3.1),ex=X-b.face*(b.w*.5+44*Math.abs(sw));
   beam(X-b.face*b.w*.4,Y-12,ex,Y-8,O,11);beam(X-b.face*b.w*.4,Y-12,ex,Y-8,L,7);glow(ex,Y-8,18,'rgba(255,163,42,.5)',.6);}
  for(let i=0;i<4;i++){const lx=X-40+i*27,back=i<2,ph=b.gait*2+i*1.7;
   leg4(lx,Y-b.h*.42,lx+Math.sin(ph)*(back?6:10),Y-2,back?6:8,back?D:B,L,O,ph);}
  const crouch=(wind||(b.atk==='leap'&&wind))?8:0;
  ellO(X-b.face*4,Y-b.h*.56+crouch,b.w*.42,b.h*.34,B,O);
  ell(X-b.face*10,Y-b.h*.68+crouch,b.w*.30,b.h*.20,L);
  ell(X+b.face*18,Y-b.h*.40+crouch,b.w*.20,b.h*.22,D);
  furStrokes(X,Y-b.h*.55+crouch,b.w*.7,b.h*.5,D,18,b.idx*7);
  const hxx=X+b.face*b.w*.42,hyy=Y-b.h*.78+crouch+(wind?-4:0);
  ellO(hxx,hyy,18,15,B,O);ell(hxx-b.face*3,hyy-4,12,9,L);
  ellO(hxx+b.face*16,hyy+6+(b.jaw*5),12,8,L,O);ell(hxx+b.face*24,hyy+5,4,3,O);
  tri(hxx-b.face*13,hyy-20,11,16,D,1);tri(hxx-b.face*11,hyy-16,7,11,'#3a1608',1);tri(hxx+b.face*3,hyy-21,10,15,D,1);
  const eg=wind?1:.55;
  ell(hxx+b.face*5,hyy-3,4,3,'#ff8a1f');px(hxx+b.face*5,hyy-4,2,1,P.yl1);
  glow(hxx+b.face*6,hyy-3,12,'rgba(255,138,31,'+eg+')',.85);
  if(b.jaw>0||(strike&&b.atk==='fireball')){const j=b.jaw;
   ell(hxx+b.face*20,hyy+9+j*4,9,6+j*3,'#3a0c08');ell(hxx+b.face*20,hyy+9+j*4,6,3+j*2,P.fl3);
   glow(hxx+b.face*24,hyy+10+j*4,20,'rgba(255,106,26,.85)',.85);
   for(let i=0;i<4;i++)tri(hxx+b.face*(12+i*3),hyy+6,3,4,'#e8e0d0',-1);}
  else{px(hxx+b.face*12,hyy+11,14,2,O);for(let i=0;i<4;i++)tri(hxx+b.face*(8+i*3),hyy+11,3,4,'#e8e0d0',-1);}}
 if(id==='cat'){
  const B=h?'#ffffff':(wind?'#3a3a52':'#14141e'),D='#0a0a10',L='#2e2e40',O='#050508';
  let hx=X-b.face*b.w*.46,hy=Y-b.h*.60;
  for(let i=0;i<b.tail.length;i++){const t=b.tail[i],tx=t.x-cam.x,ty=t.y-8;
   beam(hx,hy,tx,ty,O,7-i);beam(hx,hy,tx,ty,B,5-i);beam(hx,hy-1,tx,ty-1,L,Math.max(1,2-i));hx=tx;hy=ty;}
  for(let i=0;i<4;i++){const lx=X-42+i*28,back=i<2,ph=b.gait*2.2+i*1.6;
   leg4(lx,Y-b.h*.40,lx+Math.sin(ph)*(back?5:9),Y-2,back?5:7,back?D:B,L,O,ph);
   if(b.atk==='claw'&&strike&&i>=2){const re=Math.sin(Math.min(1,b.clawT)*3.14)*58;
    for(let k=-1;k<=1;k++){beam(X+b.face*(b.w*.4),Y-b.h*.45+k*6,X+b.face*(b.w*.4+re),Y-b.h*.45+k*9,O,4);
     beam(X+b.face*(b.w*.4),Y-b.h*.45+k*6,X+b.face*(b.w*.4+re),Y-b.h*.45+k*9,'#e8e0d0',2);}
    glow(X+b.face*(b.w*.4+re),Y-b.h*.45,20,'rgba(255,255,255,.4)',.6);}}
  const flex=(wind||(b.atk==='pounce'&&wind))?-8:0;
  ellO(X-b.face*4,Y-b.h*.58+flex,b.w*.44,b.h*.30,B,O);
  ell(X-b.face*8,Y-b.h*.70+flex,b.w*.32,b.h*.17,L);
  for(let i=0;i<7;i++)ell(X-38+i*13,Y-b.h*.60+flex,3,2,D);
  furStrokes(X,Y-b.h*.58+flex,b.w*.7,b.h*.45,D,16,31);
  const hxx=X+b.face*b.w*.44,hyy=Y-b.h*.82+flex+(wind?-3:0);
  ellO(hxx,hyy,16,14,B,O);ell(hxx-b.face*2,hyy-3,11,8,L);
  tri(hxx-b.face*13,hyy-20,11,16,D,1);tri(hxx-b.face*11,hyy-16,7,10,'#3a0c20',1);
  tri(hxx+b.face*4,hyy-21,10,15,D,1);tri(hxx+b.face*6,hyy-17,6,9,'#3a0c20',1);
  const gl=b.eyeGlow||(wind?.95:.45);
  ell(hxx+b.face*3,hyy-2,4,3,'#35e0ff');ell(hxx+b.face*11,hyy-2,3.4,3,'#35e0ff');
  px(hxx+b.face*3,hyy-3,1,1,P.w);px(hxx+b.face*11,hyy-3,1,1,P.w);
  glow(hxx+b.face*7,hyy,18,'rgba(53,224,255,'+gl+')',.9);
  tri(hxx+b.face*15,hyy+5,4,3,'#ff8a9a',-1);
  for(let i=-1;i<2;i++)beam(hxx+b.face*14,hyy+6+i*3,hxx+b.face*30,hyy+3+i*5,'#e8e0d0',1);
  if(b.atk==='eyebeam'&&strike){const a=b.beamA+Math.sin(b.beamT*2.2)*.5;
   beam(hxx,hyy,hxx+Math.cos(a)*440,hyy+Math.sin(a)*440,P.cy4,8);
   beam(hxx,hyy,hxx+Math.cos(a)*440,hyy+Math.sin(a)*440,P.cy2,4);
   beam(hxx,hyy,hxx+Math.cos(a)*440,hyy+Math.sin(a)*440,P.cy1,2);
   glow(hxx,hyy,26,'rgba(53,224,255,.7)',.85);}}
 if(id==='spider'){
  const B=h?'#ffffff':(wind?'#5a2070':'#200a30'),D='#12061c',L='#3d1668',O='#08040e';
  for(let i=0;i<8;i++){const sd=i<4?-1:1,k=i%4,bx=X+sd*16,by=Y-b.h*.55,ex=b.legs[i].ext||0;
   const ph=b.gait*1.6+b.legs[i].ph;
   const kx=bx+sd*(36+k*9),ky=by-30+Math.sin(ph)*5;
   const fx=bx+sd*(56+k*13)+(k-1.5)*7,fy=Y+ex*5-Math.abs(Math.sin(ph))*3;
   limb(bx,by,kx,ky,6,D,B,O,O);limb(kx,ky,fx,fy,5,D,B,O,O);
   beam(kx,ky-1,fx,fy-1,L,1);tri(fx-2,fy-3,5,6,O,-1);
   if(ex>.3)glow(fx,fy,12,'rgba(255,74,61,.5)',.65);}
  const pulse=1+Math.sin(b.gait*2)*.05;
  ellO(X-b.face*20,Y-b.h*.62,b.w*.32*pulse,b.h*.36*pulse,B,O);
  ell(X-b.face*23,Y-b.h*.72,b.w*.22,b.h*.22,L);
  for(let i=0;i<4;i++){ell(X-b.face*(17+i*8),Y-b.h*.62+i*4,5-i,3-i,'#ff4a3d');
   ell(X-b.face*(17+i*8),Y-b.h*.62+i*4,2,1,'#7d1610');}
  ellO(X+b.face*16,Y-b.h*.52,b.w*.24,b.h*.26,B,O);
  ell(X+b.face*19,Y-b.h*.60,b.w*.16,b.h*.16,L);
  const eg=b.phase>=3?'#ff4a3d':'#ff9a86';
  for(let i=0;i<8;i++){const ex=X+b.face*(24+(i%4)*5),ey=Y-b.h*.66+((i/4)|0)*6;
   ell(ex,ey,2,2,eg);px(ex,ey-1,1,1,P.w);}
  glow(X+b.face*30,Y-b.h*.62,22,b.phase>=3?'rgba(255,74,61,.7)':'rgba(255,154,134,.4)',.85);
  tri(X+b.face*30,Y-b.h*.42,5,10+(wind?4:0),'#e8e0d0',-1);
  tri(X+b.face*37,Y-b.h*.42,5,10+(wind?4:0),'#e8e0d0',-1);
  if(b.ceil)for(let i=0;i<9;i++)beam(X-76+i*19,0,X,Y-b.h,'rgba(255,255,255,.22)',1);}
 const bw=280,bx=(W-bw)/2,by=H-18;
 px(bx-3,by-3,bw+6,12,P.n);px(bx-2,by-2,bw+4,10,P.d1);
 const r=clamp(b.hp/b.maxhp,0,1),n=Math.round(bw*r);
 px(bx,by,n,8,r>.6?P.rd2:r>.3?P.or2:P.yl2);px(bx,by,n,2,P.rd1);
 txtCSh(b.def.name+' - ФАЗА '+b.phase,W/2,by-12,P.w,1);
 if(bIntro>0){g.globalAlpha=Math.min(1,(150-bIntro)/25);
  px(0,96,W,64,'rgba(7,10,16,.86)');px(0,96,W,2,P.rd2);px(0,158,W,2,P.rd2);
  txtCSh('ВНИМАНИЕ',W/2,102,P.rd2,3);txtCSh(b.def.name,W/2,128,P.yl2,2);
  txtCSh(b.def.sub,W/2,146,P.g4,1);g.globalAlpha=1;}}
function drawSky(){if(skyCv)g.drawImage(skyCv,0,0);
 if(lvl.theme!=='lair'){for(let i=0;i<5;i++){const x=((i*113-tick*.12)%560+560)%560-50;ell(x,30+i*11,24,6,'rgba(255,255,255,.12)');}}}
function drawPar(cx){const f=-(cx*.18)%896,m=-(cx*.42)%896;
 if(farCv){g.drawImage(farCv,f|0,0);g.drawImage(farCv,(f+896)|0,0);}
 if(midCv){g.drawImage(midCv,m|0,0);g.drawImage(midCv,(m+896)|0,0);}}
function drawTiles(cx){const sx=clamp(cx|0,0,Math.max(0,lvl.w*TS-W));
 if(tileCv)g.drawImage(tileCv,sx,0,W,H,0,0,W,H);
 const W3=col(th.water3,P.cw1),W2=col(th.water2,P.cw2),FM=col(th.foam,P.w),o=(tick>>3)%4;
 const x0=Math.floor(sx/TS);
 for(let x=x0;x<x0+30;x++)for(let y=13;y<16;y++)if(T(x,y)==='~'){
  const X=x*TS-sx,Y=y*TS;px(X,Y+o,TS,1,W3);px(X+((x*5+o*3)%12),Y+o+4,5,1,W2);
  if(y===13){px(X,Y,TS,1,FM);for(let i=0;i<3;i++)dot(X+((x*3+i*5+o)%14),Y-1,2,FM);}}}
function drawFore(cx){if(!foreCv)return;
 const f=-(cx*.62)%W;
 g.globalAlpha=.85;
 g.drawImage(foreCv,f|0,0);
 g.drawImage(foreCv,(f+W)|0,0);
 g.globalAlpha=1;}
function drawWeather(){if(!th.weather||!rainCv)return;
 const sp=th.weather==='rain'?7:1.1,ox=(tick*sp*.4)%224,oy=(tick*sp)%256;
 g.globalAlpha=th.weather==='rain'?.85:.7;
 for(let i=-1;i<3;i++)for(let j=-1;j<2;j++)g.drawImage(rainCv,(i*224-ox)|0,(j*256+oy)|0);
 g.globalAlpha=1;if(th.fog){g.fillStyle=th.fog;g.fillRect(0,0,W,H);}}
function drawHUD(){const p=pl;
 px(0,0,W,20,'rgba(7,10,16,.78)');px(0,20,W,1,P.d3);
 txtSh('СЧЁТ',5,2,P.g3,1);txtSh(String(score).padStart(7,'0'),5,11,P.w,1);
 txtSh('РЕКОРД',72,2,P.g3,1);txtSh(String(Math.max(hi,score)).padStart(7,'0'),72,11,P.yl2,1);
 if(p){txtSh(p.ch.name,160,2,P.cy2,1);
  for(let i=0;i<p.maxhp;i++){px(160+i*9,11,7,6,P.n);px(161+i*9,12,5,4,i<p.hp?P.rd2:P.d3);}
  const w=WEAPONS[p.weapon]||WEAPONS.rifle;
  box(258,2,17,16,P.d2,P.n);px(259,3,15,2,P.g2);txt(w.key,263,7,w.col,1);
  txtSh(w.name,280,2,P.g4,1);
  px(280,12,80,5,P.n);px(281,13,Math.round(78*p.spec/100),3,p.spec>=100?P.cy2:P.g2);
  if(p.spec>=100&&(tick>>3)%2)txtSh('ПРИЁМ ГОТОВ',280,11,P.cy2,1);}
 txtSh('ЖИЗНИ ×'+lives,384,2,P.w,1);txtSh('ЗОНА '+(si+1),384,11,P.g3,1);
 if(combo>1&&comboT>0)txtCSh('КОМБО ×'+combo,W/2,24,combo>6?P.rd2:P.or2,1);}
function bgGrad(key,a,b){return layer(key,W,H,()=>{vgrad(0,0,W,H,a,b);
 for(let i=0;i<70;i++)px((i*67)%W,(i*41)%H,1,1,i%5?P.d3:P.g2);});}
function wrap(s,x,y,mw,c,sc,lh){const ws=String(s).split(' ');let ln='',yy=y;
 ws.forEach(w=>{const t=ln?ln+' '+w:w;if(tw(t,sc)>mw){txt(ln,x,yy,c,sc);ln=w;yy+=lh;}else ln=t;});
 if(ln)txt(ln,x,yy,c,sc);}
function drawTitle(){g.drawImage(bgGrad('t_bg','#101a30','#050710'),0,0);
 const t=Math.sin(tick*.04)*3;
 txtCSh('BALBES',W/2,30+t,P.rd2,6);txtCSh('FORCE',W/2,80+t,P.yl2,6);
 txtCSh('RUN / GUN - 16-BIT',W/2,128,P.cy2,1);
 if((tick>>4)%2)txtCSh('НАЖМИ ОГОНЬ',W/2,158,P.w,2);
 txtCSh('ANTONY - ARTYOM - DEN - DIMKA',W/2,190,P.g3,1);
 txtCSh('РЕКОРД '+String(hi).padStart(7,'0'),W/2,206,P.yl3,1);
 txtCSh('B ОГОНЬ   A ПРЫЖОК   C ПРИЁМ',W/2,226,P.g2,1);
 txtCSh('КЕНДРИК - АФИНА - АРАХНА',W/2,240,P.d3,1);}
function drawSelect(){g.drawImage(bgGrad('s_bg','#141d33','#070a14'),0,0);
 txtCSh('ВЫБЕРИ БОЙЦА',W/2,6,P.w,2);
 const cw=100,gap=8,sx=(W-(CHARS.length*cw+(CHARS.length-1)*gap))/2;
 CHARS.forEach((c,i)=>{const X=sx+i*(cw+gap),Y=24,on=i===sel;
  box(X,Y,cw,80,on?P.d3:P.d1,on?P.cy2:P.n);
  if(on){px(X,Y,cw,2,P.cy2);glow(X+cw/2,Y+42,46,'rgba(53,224,255,.2)',.6);}
  const pose=on?('run'+((tick>>3)%6)):'idle';
  const spr=GFX.player(c.id,pose,false);
  if(spr)g.drawImage(spr,Math.round(X+cw/2-(spr.width>>1)),Y+78-spr.height);
  txtCSh(c.name,X+cw/2,Y+66,on?P.yl2:P.g3,1);});
 const c=CHARS[sel];
 box(10,112,W-20,66,P.d1,P.n);px(10,112,W-20,1,c.pal.acc);
 txtSh(c.name+' - '+c.role,16,117,c.pal.acc,1);
 const bars=[['БРОНЯ',c.hp/6],['СКОРОСТЬ',c.speed/2.9],['ПРЫЖОК',c.jump/8.0],['ТЕМП',c.rate/1.45],['УРОН',c.dmg/1.5]];
 bars.forEach((b,i)=>{const X=16+(i%3)*142,Y=130+((i/3)|0)*14;
  txt(b[0],X,Y,P.g3,1);px(X+58,Y+1,60,6,P.n);px(X+59,Y+2,Math.round(58*clamp(b[1],0,1)),4,c.pal.acc);});
 txtSh('ПРИЁМ: '+c.specName+' - '+c.specDesc,16,160,P.cy2,1);
 txtSh([c.dbl?'ДВОЙНОЙ ПРЫЖОК':null,c.dash?'РЫВОК':null,c.hover?'ПАРЕНИЕ':null].filter(Boolean).join(' - ')||'БАЗОВЫЙ НАБОР',16,171,P.yl3,1);
 wrap(c.desc,16,186,W-32,P.g4,1,10);
 if((tick>>4)%2)txtCSh('ОГОНЬ - В БОЙ',W/2,222,P.w,1);
 txtCSh('СТРЕЛКИ ВЛЕВО / ВПРАВО - ВЫБОР',W/2,238,P.g2,1);}
function drawIntro(){px(0,0,W,H,P.n);g.globalAlpha=Math.min(1,introT/20);
 txtCSh(lvl.name,W/2,92,P.yl2,4);txtCSh(lvl.sub,W/2,128,P.w,1);
 txtCSh(CHARS[sel].name+' - '+CHARS[sel].role,W/2,152,P.cy2,1);
 txtCSh('ЦЕЛЬ: '+BOSSES[lvl.boss].name,W/2,172,P.rd2,1);g.globalAlpha=1;}
function drawOver(){px(0,0,W,H,'rgba(8,4,4,.88)');
 txtCSh('ИГРА ОКОНЧЕНА',W/2,84,P.rd2,3);txtCSh('СЧЁТ '+score,W/2,124,P.w,1);
 txtCSh('РЕКОРД '+Math.max(hi,score),W/2,140,P.yl2,1);txtCSh('УНИЧТОЖЕНО: '+kills,W/2,156,P.g4,1);
 if((tick>>4)%2)txtCSh('ОГОНЬ - ЗАНОВО',W/2,180,P.g4,1);}
function drawWin(){g.drawImage(bgGrad('w_bg','#1a1030','#050710'),0,0);
 for(let i=0;i<60;i++)px((i*53+tick*1.4)%W,(i*37+tick*.7)%H,2,2,[P.yl2,P.cy2,P.rd2,P.gr1][i%4]);
 txtCSh('АРАХНА ПОВЕРЖЕНА',W/2,54,P.yl2,2);txtCSh('ДВОР СПАСЁН',W/2,82,P.w,2);
 txtCSh('ИТОГОВЫЙ СЧЁТ',W/2,116,P.g3,1);txtCSh(String(score).padStart(7,'0'),W/2,132,P.cy2,3);
 txtCSh('УНИЧТОЖЕНО ВРАГОВ: '+kills,W/2,172,P.g4,1);txtCSh('БОЕЦ: '+CHARS[sel].name,W/2,188,P.g4,1);
 if((tick>>4)%2)txtCSh('ОГОНЬ - В МЕНЮ',W/2,214,P.w,1);}
function drawPause(){px(0,0,W,H,'rgba(6,9,16,.8)');
 txtCSh('ПАУЗА',W/2,96,P.cy2,3);txtCSh('СТАРТ - ПРОДОЛЖИТЬ',W/2,134,P.g4,1);
 txtCSh('B ОГОНЬ - A ПРЫЖОК - C ПРИЁМ',W/2,154,P.g2,1);
 txtCSh('ВНИЗ - ЛЁЖА - ВНИЗ+A - СПРЫГНУТЬ',W/2,168,P.g2,1);}
function loadStage(i){si=i;const src=LEVELS[i];
 lvl={rows:src.rows.slice(),w:src.w,h:src.h,theme:src.theme,boss:src.boss,name:src.name,sub:src.sub,marks:src.marks||[],zones:[],rappels:[]};
 th=THEMES[lvl.theme]||THEMES.jungle;
 for(let r=0;r<lvl.h;r++)lvl.rows[r]=(lvl.rows[r]+'.'.repeat(lvl.w)).slice(0,lvl.w);
 buildTiles();buildPar();
 pBul.clear();pEbul.clear();pPart.clear();pTxt.clear();pFlame.clear();pItem.clear();pMover.clear();pWarn.clear();
 foes=[];boss=null;grid.clear();
 cam={x:0,px:0,y:0,py:0,lock:false,shake:0,shakeX:0,shakeY:0,look:0};
 bIntro=0;clearT=0;combo=0;comboT=0;pressure=0;hitstop=0;
 const ch=CHARS[sel],ks=pl?pl.spec:0,kw=pl?pl.weapon:ch.weapon;
 pl=mkPlayer(ch);pl.spec=ks;pl.weapon=kw;
 const MAP={e:'runner',u:'gunner',m:'flamer',b:'bird',s:'shooter',t:'turret',f:'flyer',j:'jumper',g:'grenadier',c:'crawler',n:'sniper',o:'pod',r:'rappeller',k:'bunker'};
 for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++){const c=T(x,y),X=x*TS,Y=(y+1)*TS;
  if(c==='P'){pl.x=X;pl.px=X;pl.y=GY-SH;pl.py=GY-SH;}
  else if(c==='H'){dropItem(X+8,Y-6);const it=pItem.live[pItem.live.length-1];if(it)it.kind='heal';}
  else if(MAP[c])spawn(MAP[c],X,Y);}
 lvl.marks.forEach(m=>{const X=m.x*TS,Y=(m.y+1)*TS;
  if(m.ch==='M'){const o=pMover.get();o.x=X;o.y=Y-8;o.ox=X;o.oy=Y-8;o.w=48;o.h=8;o.axis='h';o.range=56;o.sp=.012;o.t=ri(100);o.vx=0;o.vy=0;}
  else if(m.ch==='N'){const o=pMover.get();o.x=X;o.y=Y;o.ox=X;o.oy=Y;o.w=48;o.h=8;o.axis='v';o.range=48;o.sp=.014;o.t=ri(100);o.vx=0;o.vy=0;}
  else if(m.ch==='Z'){lvl.zones.push({x:m.x,cd:120+ri(80)});}
  else if(m.ch==='R'){lvl.rappels.push({x:m.x,done:false});}});
 foes.forEach(f=>{if(f.def.kind==='air')f.base=f.y+f.h;});
 introT=0;state='intro';SND.music(th.music);}
function startGame(){lives=3;score=0;kills=0;pl=null;loadStage(0);}
function update(){tick++;SND.tickMusic();
 if(window.SVX&&SVX.loaded&&SVX.loaded()&&SVX.mode!==0&&!paused&&(state==='play'||state==='select'||state==='title'))
  SVX.tick((tick>>2)&15,(tick>>6)&3,null,null);
 if(comboT>0){comboT--;if(!comboT)combo=0;}
 if(flash>0)flash--;
 if(dmgT>0){dmgT--;if(!dmgT&&dmgEl)dmgEl.classList.remove('on');}
 if(cam.shake>0){cam.shake*=.86;
  cam.shakeX=(Math.random()-.5)*2*cam.shake;
  cam.shakeY=(Math.random()-.5)*2*cam.shake;}
 cam.px=cam.x;cam.py=cam.y;
 if(state==='title'){if(eat('fire')||eat('start')){clearEdges();SND.play('ok');state='select';SND.music('menu');}return;}
 if(state==='select'){
  if(eat('left')){sel=(sel+CHARS.length-1)%CHARS.length;SND.play('ui');}
  if(eat('right')){sel=(sel+1)%CHARS.length;SND.play('ui');}
  if(eat('fire')||eat('start')){clearEdges();SND.play('ok');startGame();}return;}
 if(state==='intro'){introT++;if(introT>110||eat('fire')){clearEdges();state='play';SND.music(th.music);}return;}
 if(state==='gameover'){if(eat('fire')||eat('start')){clearEdges();SND.play('ok');state='select';SND.music('menu');}return;}
 if(state==='victory'){if(eat('fire')||eat('start')){clearEdges();SND.play('ok');state='title';SND.music('menu');}return;}
 if(state!=='play')return;
 if(eat('start')){paused=!paused;SND.play('ui');}
 if(paused)return;
 if(hitstop>0){hitstop--;updParts();return;}
 updWorld();updPlayer();gridBuild(foes);updFoes();updBullets();updItems();updParts();updBoss();
 const p=pl;
 if(p){const ax=(lvl.w-ARENA)*TS;
  if(!cam.lock&&p.x>ax&&!boss){spawnBoss(lvl.boss);cam.lock=true;}
  cam.look=lerp(cam.look,clamp(p.vx*12,-50,50),.08);
  const tg=cam.lock?(lvl.w*TS-W):clamp(p.x-W*.38+cam.look,0,lvl.w*TS-W);
  cam.x=clamp(lerp(cam.x,tg,cam.lock?.07:.17),0,Math.max(0,lvl.w*TS-W));
  if(cam.lock)p.x=clamp(p.x,ax+4,lvl.w*TS-BW-4);}
 if(p&&p.dead&&deadT>66){
  if(lives<=0){state='gameover';SND.play('dead');SND.music('menu');
   if(score>hi){hi=score;try{localStorage.setItem('bf_hi',String(hi));}catch(_){}}}
  else{const kw=p.weapon,ks=p.spec;pl=mkPlayer(CHARS[sel]);pl.weapon=kw;pl.spec=ks;
   pl.x=clamp(cam.x+50,20,lvl.w*TS-50);pl.px=pl.x;pl.y=90;pl.py=90;pl.inv=110;deadT=0;}}
 if(clearT>0){clearT++;
  if(clearT>170){
   if(si>=LEVELS.length-1){state='victory';SND.music('win');
    if(score>hi){hi=score;try{localStorage.setItem('bf_hi',String(hi));}catch(_){}}}
   else loadStage(si+1);}}}
function render(alpha){bind(g);
 g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
 const cx=lerp(cam.px,cam.x,alpha);
 g.save();
 if(cam.shake>0.3)g.translate(Math.round(cam.shakeX),Math.round(cam.shakeY));
 if(state==='title')drawTitle();
 else if(state==='select')drawSelect();
 else if(state==='intro')drawIntro();
 else if(state==='gameover'){if(lvl){drawSky();drawPar(cx);drawTiles(cx);}drawOver();}
 else if(state==='victory')drawWin();
 else if(lvl){
  drawSky();drawPar(cx);drawTiles(cx);
  drawMovers();drawWarnings();drawItems();
  for(let i=0;i<foes.length;i++)drawFoe(foes[i],alpha);
  if(boss)drawBoss();
  if(pl&&!pl.dead)drawChar(pl,alpha);
  drawFlames();drawBullets(alpha);drawParts(alpha);
  drawFore(cx);
  drawWeather();drawHUD();
  if(clearT>0){px(0,100,W,50,'rgba(7,10,16,.84)');px(0,100,W,2,P.yl2);px(0,148,W,2,P.yl2);
   txtCSh('ЗОНА ЗАЧИЩЕНА',W/2,108,P.yl2,2);txtCSh('БОНУС '+BOSSES[lvl.boss].score,W/2,132,P.cy2,1);}
  if(paused)drawPause();}
 else drawTitle();
 g.restore();
 if(flash>0){g.fillStyle='rgba(255,255,255,'+(flash/12).toFixed(2)+')';g.fillRect(0,0,W,H);}
 vis.drawImage(buf,0,0,W,H);}
function drawErr(){bind(g);g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;
 px(0,H-26,W,26,'rgba(40,4,4,.94)');px(0,H-26,W,1,P.rd2);
 txtSh('СБОЙ: '+String(err).slice(0,68),4,H-22,P.rd1,1);
 txtSh('НАЖМИ СТАРТ ДЛЯ СБРОСА',4,H-12,P.g3,1);
 vis.drawImage(buf,0,0,W,H);}
let last=0,acc=0,running=false;
function loop(t){requestAnimationFrame(loop);
 if(!gfxOk){if(typeof GFX!=='undefined'){try{GFX.init();gfxOk=GFX.ready;err=null;}catch(e){}}
  if(!gfxOk)return;}
 if(!last)last=t;
 let dt=(t-last)/1000;last=t;if(dt>.12)dt=.12;
 pollInput();acc+=dt;if(acc>.25)acc=.25;
 let n=0;
 while(acc>=STEP&&n<4){acc-=STEP;n++;
  try{update();}catch(e){if(!err){err='SIM '+(e&&e.message?e.message:e);console.error(e);}}}
 if(err&&peek('start')){KE.start=false;err=null;state='title';paused=false;SND.music('menu');}
 const alpha=clamp(acc/STEP,0,1);
 try{render(alpha);}catch(e){if(!err){err='DRAW '+(e&&e.message?e.message:e);console.error(e);}}
 if(err)drawErr();}
function bindUI(){
 const bs=document.getElementById('bSound');
 if(bs)bs.addEventListener('pointerdown',e=>{e.preventDefault();SND.unlock();if(window.SVX)SVX.unlock();
  const on=!SND.get();SND.set(on);if(window.SVX)SVX.setMuted(!on);
  e.currentTarget.classList.toggle('off',!on);e.currentTarget.textContent=on?'🔊':'🔇';},{passive:false});
 const bp=document.getElementById('bPause');
 if(bp)bp.addEventListener('pointerdown',e=>{e.preventDefault();if(state==='play'){paused=!paused;SND.play('ui');}},{passive:false});
 const bf=document.getElementById('bFull');
 if(bf)bf.addEventListener('pointerdown',e=>{e.preventDefault();
  const el=document.documentElement;
  if(!document.fullscreenElement)(el.requestFullscreen||el.webkitRequestFullscreen||(()=>{})).call(el);
  else document.exitFullscreen();setTimeout(fit,240);},{passive:false});
 const bx=document.getElementById('bSvx');
 if(bx)bx.addEventListener('pointerdown',e=>{e.preventDefault();if(window.SVX)SVX.unlock();
  const f=document.getElementById('svxFile');if(f)f.click();},{passive:false});
 const sf=document.getElementById('svxFile');
 if(sf)sf.addEventListener('change',async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';
  if(!f||!window.SVX)return;
  const el=document.getElementById('svxInfo');
  if(el){el.textContent='читаю '+f.name;el.style.color='#8dff4a';}
  try{SVX.unlock();const m=await SVX.fromFile(f);
   if(SVX.mode===0)SVX.cycleMode();
   const bm=document.getElementById('bSvxMode');if(bm)bm.classList.add('on');
   SVX.voice(261.63,Math.min(1.2,m.dur),1,0);SND.play('pick');
   if(el)el.textContent=m.name+' '+m.rate+'Гц';}
  catch(e2){if(el){el.textContent='ошибка: '+(e2&&e2.message?e2.message:e2);el.style.color='#ff4a3d';}SND.play('hurt');}});
 const bm=document.getElementById('bSvxMode');
 if(bm)bm.addEventListener('pointerdown',e=>{e.preventDefault();if(!window.SVX)return;
  SVX.unlock();SVX.cycleMode();e.currentTarget.classList.toggle('on',SVX.mode!==0);
  if(SVX.loaded()&&SVX.mode!==0)SVX.voice(261.63,.3,.8,0);SND.play('ui');},{passive:false});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){SND.suspend();if(window.SVX)SVX.suspend();if(state==='play')paused=true;
   for(const k in K)K[k]=0;for(const k in PREV)PREV[k]=0;}
  else{SND.resume();if(window.SVX)SVX.resume();last=0;acc=0;}});}
function boot(){if(running)return;running=true;
 IN.bindDom(document.getElementById('touch'));bindUI();SND.music('menu');
 if(window.SVX&&SVX.paint)SVX.paint();
 const pw=document.getElementById('power');
 if(pw){pw.classList.add('on');setTimeout(()=>pw.classList.remove('on'),300);}
 fit();setTimeout(fit,160);setTimeout(fit,600);
 requestAnimationFrame(loop);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();
window.__GAME_OK=true;window.__GAME_BUILD=20;
})();
