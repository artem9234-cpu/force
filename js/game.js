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
   o.life
