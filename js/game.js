(() => {
'use strict';
const C = CORE;
const {W,H,TS,P,clamp,rnd,ri,sgn,lerp,bind,px,box,ell,ellO,line,limb,tri,dith,vgrad,txt,txtC,tw,txtSh,txtCSh,SND,IN}=C;
const {CHARS,WEAPONS,WORDER,ENEMIES,BOSSES,LEVELS,THEMES}=DATA;
const col=(c,f)=>(typeof c==='string'&&c)?c:f;
const cv=document.getElementById('cv'),vis=cv.getContext('2d',{alpha:false});
const buf=document.createElement('canvas');buf.width=W;buf.height=H;
const g=buf.getContext('2d',{alpha:false});
g.imageSmoothingEnabled=false;vis.imageSmoothingEnabled=false;bind(g);

const GY=13*TS,SH=28,PH=10,BW=12,PW=22,ARENA=30;
const GRAV=.48,JMAX=11,ACC=1.15,FRIC=.62,STEP=1/60;

function fit(){
  const s=document.getElementById('screen');
  const sc=Math.max(.5,Math.min((innerWidth-8)/W,(innerHeight-8)/H));
  const w=Math.floor(W*sc),h=Math.floor(H*sc);
  s.style.width=w+'px';s.style.height=h+'px';cv.style.width=w+'px';cv.style.height=h+'px';
}
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

// --- ОТРИСОВКА ПЕРСОНАЖЕЙ И УРОВНЕЙ В СТИЛЕ SEGA / CONTRA ---
function paintTile(x,y){
  const c=T(x,y),X=x*TS,Y=y*TS;
  const RO=col(th.rockOut,P.br5),RK=col(th.rock,P.br2),RH=col(th.rockHi,P.br1),RL=col(th.rockLo,P.br3);
  const GL=col(th.grassLo,P.cg3),GR=col(th.grass,P.cg2),GH=col(th.grassHi,P.cg1);
  if(c==='#'){
    px(X,Y,TS,TS,RO);
    for(let i=0;i<3;i++){
      const h1=CORE.hash(x*3+i,y*7),h2=CORE.hash(x*5+i,y*11);
      const bx=X+3+h1*10,by=Y+3+h2*10,r=5+h1*2;
      ell(bx,by,r+1,r*.8+1,'#000');
      ell(bx,by,r,r*.8,RK);
      ell(bx-r*.3,by-r*.3,r*.5,r*.3,RH);
      ell(bx+r*.3,by+r*.3,r*.4,r*.2,RL);
    }
    if(!sol(x,y-1)){
      px(X,Y,TS,5,GL);px(X,Y,TS,3,GR);px(X,Y,TS,1,GH);
    }
  } else if(c==='='){
    px(X,Y+4,TS,8,col(th.metal,P.mt3));
    px(X,Y+4,TS,2,col(th.metalHi,P.mt1));
    px(X,Y+10,TS,2,col(th.metalLo,P.mt5));
    dot(X+4,Y+7,2,'#000');dot(X+TS-6,Y+7,2,'#000');
  } else if(c==='^'){
    tri(X,Y+TS,X+TS/2,Y+4,X+TS,Y+TS,col(th.spike,P.mt2));
  }
}

function initLevel(index){
  si=clamp(index,0,LEVELS.length-1);
  lvl=LEVELS[si];th=THEMES[lvl.theme||'jungle'];
  layers.clear();
  tileCv=layer('tile_'+si,lvl.w*TS,lvl.h*TS,()=>{
    for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++)paintTile(x,y);
  });
  pl={x:40,y:80,vx:0,vy:0,w:16,h:26,dir:1,onGround:false,c:0,hp:5,maxHp:5,weapon:WEAPONS[0],ammo:999,inv:0,prone:0,moving:false,anim:0,aimKey:'F'};
  foes.length=0;boss=null;cam.x=0;cam.y=0;cam.lock=false;introT=120;
  
  if(lvl.foes){
    for(const f of lvl.foes) foes.push({type:f.type,x:f.x,y:f.y,w:24,h:26,vx:0,vy:0,hp:f.hp||3,v:f.v||0,dir:-1,frame:0,state:0,dead:false});
  }
  gfxOk=true;
}

// --- ИГРОВОЙ ЦИКЛ И ОБНОВЛЕНИЕ ---
function update(){
  if(hitstop>0){hitstop--;return;}
  if(introT>0){introT--;return;}
  if(paused)return;

  pollInput();
  if(eat('pause')||eat('spec'))paused=!paused;

  // Управление игроком
  let move=0;
  if(peek('left'))move=-1;
  if(peek('right'))move=1;

  pl.moving=move!==0;
  if(move!==0) pl.dir=move;

  if(move!==0){
    pl.vx=lerp(pl.vx,move*ACC,.2);
  } else {
    pl.vx*=FRIC;
  }

  // Прыжок и гравитация
  if(peek('jump')&&pl.onGround){
    pl.vy=-JMAX;
    pl.onGround=false;
    SND.jump?.();
  }

  pl.vy+=GRAV;
  pl.x+=pl.vx;
  
  // Простые коллизии с полом
  const tx=Math.floor((pl.x+8)/TS), ty=Math.floor((pl.y+pl.h)/TS);
  if(sol(tx,ty)&&pl.vy>=0){
    pl.y=ty*TS-pl.h;
    pl.vy=0;
    pl.onGround=true;
  } else {
    pl.y+=pl.vy;
    pl.onGround=false;
  }

  if(pl.y>H){pl.hp=0;} // Упал в пропасть

  // Стрельба
  if(eat('fire')||peek('fire')){
    pBul.get().set = {x:pl.x+(pl.dir>0?16: -4),y:pl.y+8,vx:pl.dir*8,vy:0,w:6,h:4};
    SND.shoot?.();
  }

  // Обновление пуль
  for(let i=pBul.live.length-1;i>=0;i--){
    const b=pBul.live[i];
    b.x+=b.vx;
    if(b.x<cam.x||b.x>cam.x+W)b.dead=true;
  }
  pBul.sweep();

  // Камера следует за игроком
  cam.x=clamp(pl.x-W/3,0,(lvl.w*TS)-W);

  tick++;
}

// --- ОТРИСОВКА КАДРА ---
function render(){
  g.fillStyle=th.sky||'#05070d';
  g.fillRect(0,0,W,H);

  // Отрисовка тайлов уровня с учетом камеры
  if(tileCv){
    g.drawImage(tileCv,cam.x|0,0,W,H,0,0,W,H);
  }

  // Отрисовка игрока (используем движок GFX для анимации в стиле SEGA / Contra)
  if(pl){
    const pose=GFX.poseOf ? GFX.poseOf(pl) : 'idle';
    const spr=GFX.player ? GFX.player(CHARS[si%CHARS.length]||'antony',pose,pl.dir<0) : null;
    if(spr){
      g.drawImage(spr,(pl.x-cam.x)|0,pl.y|0);
    } else {
      g.fillStyle='#35e0ff';
      g.fillRect((pl.x-cam.x)|0,pl.y|0,pl.w,pl.h);
    }
  }

  // Отрисовка пуль
  g.fillStyle='#ffd400';
  for(const b of pBul.live){
    g.fillRect((b.x-cam.x)|0,b.y|0,b.w,b.h);
  }

  // HUD / Интерфейс (Жизни, Очки)
  g.fillStyle='#fff';
  g.font='8px monospace';
  g.fillText(`LIVES: ${'♥'.repeat(lives)}  SCORE: ${score}  SEGA EDITION`,8,12);

  if(introT>0){
    g.fillStyle='rgba(0,0,0,0.7)';
    g.fillRect(0,0,W,H);
    g.fillStyle='#8dff4a';
    g.font='12px monospace';
    g.fillText(`STAGE ${si+1}: ${lvl.name}`,W/2-60,H/2);
  }

  // Перенос на основной холм экрана (Canvas)
  vis.clearRect(0,0,W,H);
  vis.drawImage(buf,0,0);
}

// Главный цикл
function loop(){
  update();
  render();
  requestAnimationFrame(loop);
}

// Старт игры
window.addEventListener('load',()=>{
  GFX.init();
  initLevel(0);
  requestAnimationFrame(loop);
  window.__GAME_OK=true;
});

})();
