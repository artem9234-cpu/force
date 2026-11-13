(() => {
'use strict';

// Проверка доступности ядра
if (typeof CORE === 'undefined') {
  document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace;">ERROR: core.js not loaded!</div>';
  return;
}

const C = CORE;
const {W,H,TS,P,clamp,rnd,ri,sgn,lerp,bind,px,box,ell,ellO,line,limb,tri,dith,vgrad,txt,txtC,tw,txtSh,txtCSh,SND,IN}=C;
const DATA_REF = typeof DATA !== 'undefined' ? DATA : { CHARS:['antony'], WEAPONS:[{}] , ENEMIES:{}, BOSSES:{}, LEVELS:[{w:50,h:15,name:'START',rows:[]}], THEMES:{jungle:{sky:'#05070d',rock:'#22304a'}} };
const {CHARS,WEAPONS,WORDER,ENEMIES,BOSSES,LEVELS,THEMES}=DATA_REF;

const col=(c,f)=>(typeof c==='string'&&c)?c:f;
const cv=document.getElementById('cv');
if (!cv) return;
const vis=cv.getContext('2d',{alpha:false});
const buf=document.createElement('canvas');buf.width=W;buf.height=H;
const g=buf.getContext('2d',{alpha:false});
g.imageSmoothingEnabled=false;vis.imageSmoothingEnabled=false;bind(g);

const GRAV=.48,JMAX=11,ACC=1.15,FRIC=.62;

function fit(){
  const s=document.getElementById('screen');
  if(!s)return;
  const sc=Math.max(.5,Math.min((innerWidth-8)/W,(innerHeight-8)/H));
  const w=Math.floor(W*sc),h=Math.floor(H*sc);
  s.style.width=w+'px';s.style.height=h+'px';cv.style.width=w+'px';cv.style.height=h+'px';
}
addEventListener('resize',fit,{passive:true});
fit();

const K=IN && IN.st ? IN.st : {};
const KE={},PREV={};
function pollInput(){for(const k in K){const v=K[k]?1:0;if(v&&!PREV[k])KE[k]=true;PREV[k]=v;}}
function eat(k){if(KE[k]){KE[k]=false;return true;}return false;}
function peek(k){return !!KE[k];}

let lvl=null,th=null,tileCv=null;
let cam={x:0,y:0};
let pl=null,foes=[];
let si=0,lives=3,score=0,introT=120,paused=false,hitstop=0;

const T=(x,y)=>{
  if(!lvl || !lvl.rows) return '.';
  if(x<0||y<0||x>=lvl.w||y>=lvl.h)return y>=lvl.h?'.':'#';
  const r=lvl.rows[y];return r?(r[x]||'.'):'.';
};
const sol=(x,y)=>T(x,y)==='#';

const layers=new Map();
function layer(key,w,h,fn){let c=layers.get(key);if(c)return c;
  c=document.createElement('canvas');c.width=w;c.height=h;const old=g;
  try{bind(c.getContext('2d'));fn();}finally{bind(old);}layers.set(key,c);return c;
}

function paintTile(x,y){
  const c=T(x,y),X=x*TS,Y=y*TS;
  if(c==='#'){
    px(X,Y,TS,TS,th?.rockOut||'#22304a');
    box(X+2,Y+2,TS-4,TS-4,th?.rock||'#141c2c','#000');
  }
}

function initLevel(index){
  si=clamp(index,0,(LEVELS?.length||1)-1);
  lvl=LEVELS?.[si] || {w:60,h:15,name:'ZONE 1',rows:Array(15).fill('#'.repeat(60))};
  th=THEMES?.[lvl.theme||'jungle'] || {sky:'#05070d',rock:'#22304a'};
  
  layers.clear();
  tileCv=layer('tile_'+si,lvl.w*TS,lvl.h*TS,()=>{
    for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++)paintTile(x,y);
  });
  
  pl={x:40,y:80,vx:0,vy:0,w:16,h:26,dir:1,onGround:false,hp:5};
  foes.length=0;cam.x=0;introT=120;
}

function update(){
  if(hitstop>0){hitstop--;return;}
  if(introT>0){introT--;return;}
  pollInput();
  if(eat('pause'))paused=!paused;
  if(paused)return;

  let move=0;
  if(peek('left'))move=-1;
  if(peek('right'))move=1;
  if(move!==0) pl.dir=move;

  pl.vx=move!==0?lerp(pl.vx,move*ACC,.2):pl.vx*FRIC;
  if(peek('jump')&&pl.onGround){pl.vy=-JMAX;pl.onGround=false;}

  pl.vy+=GRAV;
  pl.x+=pl.vx;
  
  const tx=Math.floor((pl.x+8)/TS), ty=Math.floor((pl.y+pl.h)/TS);
  if(sol(tx,ty)&&pl.vy>=0){
    pl.y=ty*TS-pl.h;
    pl.vy=0;
    pl.onGround=true;
  }else{
    pl.y+=pl.vy;
    pl.onGround=false;
  }

  cam.x=clamp(pl.x-W/3,0,(lvl.w*TS)-W);
}

function render(){
  g.fillStyle=th?.sky||'#05070d';
  g.fillRect(0,0,W,H);

  if(tileCv){
    g.drawImage(tileCv,cam.x|0,0,W,H,0,0,W,H);
  }

  // Рендер игрока через GFX если доступен, иначе запасной прямоугольник
  if(pl){
    let drawn=false;
    if(typeof GFX!=='undefined'&&GFX.ready&&GFX.player){
      const pose=GFX.poseOf?GFX.poseOf(pl):'idle';
      const spr=GFX.player(CHARS[si%CHARS.length]||'antony',pose,pl.dir<0);
      if(spr){g.drawImage(spr,(pl.x-cam.x)|0,pl.y|0);drawn=true;}
    }
    if(!drawn){
      g.fillStyle='#35e0ff';
      g.fillRect((pl.x-cam.x)|0,pl.y|0,pl.w,pl.h);
    }
  }

  g.fillStyle='#fff';
  g.font='8px monospace';
  g.fillText(`LIVES: ${'♥'.repeat(lives)}  SEGA EDITION OK`,8,12);

  if(introT>0){
    g.fillStyle='rgba(0,0,0,0.8)';
    g.fillRect(0,0,W,H);
    g.fillStyle='#8dff4a';
    g.font='10px monospace';
    g.fillText(`STAGE ${si+1}: ${lvl.name}`,W/2-40,H/2);
  }

  vis.clearRect(0,0,W,H);
  vis.drawImage(buf,0,0);
}

function loop(){
  update();
  render();
  requestAnimationFrame(loop);
}

window.addEventListener('load',()=>{
  if(typeof GFX!=='undefined' && GFX.init) GFX.init();
  initLevel(0);
  requestAnimationFrame(loop);
  window.__GAME_OK=true;
});

})();
