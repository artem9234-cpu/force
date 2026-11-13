/* ============================================================
   BALBES FORCE — физика, детализированные бойцы, ИИ, боссы
   ============================================================ */
(() => {
'use strict';
const {W,H,TS,P,clamp,rnd,ri,sgn,lerp,bind,px,box,ell,ellO,line,limb,tri,dith,vgrad,glow,
       txt,txtC,tw,txtSh,txtCSh,SND,IN} = CORE;
const {CHARS,WEAPONS,WORDER,ENEMIES,BOSSES,LEVELS,THEMES} = DATA;

const cv=document.getElementById('cv'), vis=cv.getContext('2d');
const buf=document.createElement('canvas'); buf.width=W; buf.height=H;
const g=buf.getContext('2d'); g.imageSmoothingEnabled=false; vis.imageSmoothingEnabled=false;
bind(g);

const GROUND_Y = 13*TS;
const STAND_H = 46, PRONE_H = 20, BODY_W = 22;

function fit(){
  const s=document.getElementById('screen'), b=s.parentElement.getBoundingClientRect();
  const sc=Math.max(1,Math.min(b.width/W,b.height/H));
  const w=Math.floor(W*sc), h=Math.floor(H*sc);
  s.style.width=w+'px'; s.style.height=h+'px';
  cv.style.width=w+'px'; cv.style.height=h+'px';
}
window.addEventListener('resize',fit); window.addEventListener('orientationchange',fit);

let state='title', sel=0, tick=0, paused=false;
let lvl=null, theme=null, tileCv=null, farCv=null, midCv=null;
let cam={x:0,lock:false,shake:0};
let player=null, bullets=[], ebullets=[], foes=[], items=[], parts=[], texts=[], boss=null;
let stageIdx=0, lives=3, score=0, hi=Number(localStorage.getItem('bf_hi')||0);
let stageClearT=0, deadT=0, introT=0, flash=0, bossIntro=0;
let kills=0, comboN=0, comboT=0;

const T=(cx,cy)=>(cx<0||cy<0||cx>=lvl.w||cy>=lvl.h)?(cy>=lvl.h?'#':'.'):lvl.rows[cy][cx];
const solid=(cx,cy)=>T(cx,cy)==='#';
const plat =(cx,cy)=>T(cx,cy)==='=';
const hazard=(cx,cy)=>{const c=T(cx,cy);return c==='^'||c==='~';};
const aabb=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

/* ---------- тайлы ---------- */
function buildTiles(){
  tileCv=document.createElement('canvas'); tileCv.width=lvl.w*TS; tileCv.height=H;
  const t=tileCv.getContext('2d'); const old=g; bind(t);
  for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++){
    const c=T(x,y), X=x*TS, Y=y*TS;
    if(c==='#'){
      const top=!solid(x,y-1);
      px(X,Y,TS,TS,theme.ground);
      dith(X,Y+5,TS,TS-5,theme.ground,theme.ground2,0);
      for(let i=0;i<4;i++){const rx=X+((x*7+i*5)%13),ry=Y+6+((y*11+i*3)%8);
        px(rx,ry,2,1,theme.ground2);}
      if(top){
        px(X,Y,TS,5,theme.groundTop);
        dith(X,Y+3,TS,2,theme.groundTop,theme.groundTop2,0);
        px(X,Y,TS,1,P.w);
        for(let i=0;i<4;i++){const gx=X+1+i*4;px(gx,Y-2,1,3,theme.groundTop2);px(gx+1,Y-3,1,4,theme.groundTop);}
      }
      px(X,Y,1,TS,theme.ground2); px(X+TS-1,Y,1,TS,P.n);
    } else if(c==='='){
      px(X,Y,TS,6,theme.plat); px(X,Y,TS,2,theme.platTop); px(X,Y,TS,1,P.w);
      px(X,Y+6,TS,1,P.n);
      px(X+2,Y+7,2,4,theme.plat); px(X+12,Y+7,2,4,theme.plat);
      px(X+4,Y+2,3,1,theme.platTop);
    } else if(c==='^'){
      for(let i=0;i<4;i++){tri(X+i*4,Y+4,4,12,P.mt3,1);tri(X+i*4+1,Y+6,2,10,P.mt1,1);}
      px(X,Y+15,TS,1,P.d2);
    } else if(c==='~'){
      px(X,Y,TS,TS,theme.water); dith(X,Y,TS,5,theme.water,theme.water2,0);
    } else if(c==='B'){
      box(X+1,Y+1,14,14,P.br2,P.br5); px(X+2,Y+2,12,2,P.br1);
      px(X+3,Y+7,10,1,P.br4); px(X+7,Y+2,2,12,P.br4);
      px(X+4,Y+9,8,4,P.yl4); txt('?',X+6,Y+8,P.yl1,1);
    }
  }
  bind(old);
}
function buildParallax(){
  farCv=document.createElement('canvas'); farCv.width=896; farCv.height=H;
  midCv=document.createElement('canvas'); midCv.width=896; midCv.height=H;
  const old=g;
  bind(farCv.getContext('2d'));
  for(let i=0;i<40;i++){
    const x=i*24+((i*37)%12), h=64+((i*53)%70);
    if(lvl.theme==='jungle'){
      tri(x,178-h,44,h,theme.far,1); tri(x+7,178-h+12,30,h-12,theme.far2,1);
      px(x+20,178-10,4,12,theme.far);
    } else if(lvl.theme==='cliff'){
      tri(x-10,190-h,58,h,theme.far,1); tri(x+2,190-h+18,38,h-18,theme.far2,1);
      tri(x+12,190-h+22,16,12,P.mt1,1);
    } else {
      tri(x,196-h,38,h,theme.far,1);
      for(let k=0;k<5;k++)ell(x+18,196-h+16+k*13,11-k,4,theme.far2);
    }
  }
  bind(midCv.getContext('2d'));
  for(let i=0;i<48;i++){
    const x=i*19+((i*29)%11), h=44+((i*41)%50);
    if(lvl.theme==='jungle'){
      px(x+9,214-h,5,h,theme.mid);
      ell(x+11,214-h,15,10,theme.mid); ell(x+8,214-h-4,9,6,theme.mid2);
      ell(x+15,214-h+3,7,4,theme.mid2);
    } else if(lvl.theme==='cliff'){
      tri(x-5,220-h,34,h,theme.mid,1); tri(x+2,220-h+10,20,h-10,theme.mid2,1);
    } else {
      px(x+8,220-h,6,h,theme.mid);
      ell(x+10,220-h,11,8,theme.mid2);
      for(let k=0;k<3;k++)line(x+10,220-h+k*9,x+10+(k%2?11:-11),220-h+k*9+8,theme.mid,1);
    }
  }
  bind(old);
}

/* ---------- эффекты ---------- */
function spark(x,y,n,col,pw){
  for(let i=0;i<n;i++){const a=rnd(0,6.283),s=rnd(.6,pw||3.2);
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.5,life:rnd(12,30),max:30,c:col,g:.12,s:1});}
}
function boom(x,y,r,col){
  for(let i=0;i<r;i++){const a=rnd(0,6.283),s=rnd(.8,4.6);
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:rnd(16,40),max:40,
      c:[P.fl1,P.fl2,P.fl3,P.rd2,P.mt2][ri(5)],g:.1,s:ri(2)+1});}
  parts.push({x,y,ring:true,r:2,rr:r,life:14,max:14,c:col||P.fl1});
  cam.shake=Math.max(cam.shake,Math.min(10,r*.32));
}
function pop(x,y,s,c){texts.push({x,y,s:String(s),c:c||P.yl2,life:48});}

/* ============================================================
   ФИЗИКА — устойчивая, без дрожания
   ============================================================ */
function moveX(e,dx){
  if(!dx)return;
  e.x+=dx;
  const y0=Math.floor((e.y+2)/TS), y1=Math.floor((e.y+e.h-2)/TS);
  if(dx>0){
    const cx=Math.floor((e.x+e.w)/TS);
    for(let y=y0;y<=y1;y++)if(solid(cx,y)){e.x=cx*TS-e.w;e.vx=0;break;}
  } else {
    const cx=Math.floor(e.x/TS);
    for(let y=y0;y<=y1;y++)if(solid(cx,y)){e.x=(cx+1)*TS;e.vx=0;break;}
  }
}
function moveY(e,dy){
  const prevBottom=e.y+e.h;
  e.y+=dy;
  const x0=Math.floor((e.x+3)/TS), x1=Math.floor((e.x+e.w-3)/TS);
  if(dy>0){
    const cy=Math.floor((e.y+e.h)/TS);
    for(let x=x0;x<=x1;x++){
      const isPlat=plat(x,cy)&&prevBottom<=cy*TS+1&&!e.dropping;
      if(solid(x,cy)||isPlat){e.y=cy*TS-e.h;e.vy=0;break;}
    }
  } else if(dy<0){
    const cy=Math.floor(e.y/TS);
    for(let x=x0;x<=x1;x++)if(solid(x,cy)){e.y=(cy+1)*TS;e.vy=0;break;}
  }
}
function probeGround(e){
  const cy=Math.floor((e.y+e.h+1)/TS);
  const x0=Math.floor((e.x+3)/TS), x1=Math.floor((e.x+e.w-3)/TS);
  for(let x=x0;x<=x1;x++)if(solid(x,cy)||plat(x,cy))return true;
  return false;
}
function headBlocked(x,y,w,h){
  const cy=Math.floor(y/TS);
  const x0=Math.floor((x+3)/TS), x1=Math.floor((x+w-3)/TS);
  for(let cx=x0;cx<=x1;cx++)if(solid(cx,cy))return true;
  return false;
}

/* ============================================================
   ИГРОК
   ============================================================ */
function makePlayer(ch){
  return {ch,x:40,y:GROUND_Y-STAND_H,vx:0,vy:0,w:BODY_W,h:STAND_H,face:1,onGround:true,
    hp:ch.hp,maxhp:ch.hp,inv:90,prone:false,aim:{x:1,y:0,raw:{x:1,y:0}},
    jumps:0,coyote:0,buffer:0,dropping:0,
    dashT:0,dashCD:0,hover:false,moving:false,
    weapon:ch.weapon,cd:0,spec:0,specT:0,drone:null,
    anim:0,breath:0,recoil:0,muzzle:0,dead:false,webT:0,pushT:0};
}
function aimVec(p){
  const s=IN.st;
  let ax=p.face, ay=0;
  if(s.up&&!s.down){ if(s.left||s.right){ax=(s.right?1:-1);ay=-1;} else {ax=0;ay=-1;} }
  else if(s.down){
    if(!p.onGround){ if(s.left||s.right){ax=(s.right?1:-1);ay=1;} else {ax=0;ay=1;} }
    else {ax=p.face;ay=0;}
  }
  const L=Math.hypot(ax,ay)||1;
  return {x:ax/L,y:ay/L,raw:{x:ax,y:ay}};
}
function shoot(p){
  const w=WEAPONS[p.weapon], a=p.aim;
  const rate = p.specT>0&&p.ch.spec==='burst' ? w.cd/3 : w.cd/p.ch.rate;
  if(p.cd>0)return; p.cd=Math.max(3,rate);
  const py = p.prone ? p.y+p.h-9 : p.y+18;
  const ox = (a.raw.x===0&&a.raw.y!==0) ? p.face*3 : a.x*15;
  const oy = a.y*13;
  const bx=p.x+p.w/2+ox, by=py+oy;
  const dmg=w.dmg*p.ch.dmg;
  const mk=(vx,vy,extra)=>bullets.push(Object.assign({x:bx,y:by,vx,vy,dmg,kind:w.kind,col:w.col,
    len:w.len,life:120,pierce:w.kind==='laser',t:0},extra||{}));
  if(w.kind==='spread'){
    for(let i=-2;i<=2;i++){const ang=Math.atan2(a.y,a.x)+i*.20;
      mk(Math.cos(ang)*w.spd,Math.sin(ang)*w.spd);}
    SND.play('spread');
  } else if(w.kind==='fire'){ mk(a.x*w.spd,a.y*w.spd,{spin:rnd(0,6.28)}); SND.play('fire');
  } else if(w.kind==='laser'){ mk(a.x*w.spd,a.y*w.spd); SND.play('laser');
  } else if(w.kind==='homing'){ mk(a.x*w.spd,a.y*w.spd); mk(a.x*w.spd*.8,a.y*w.spd*.8-1); SND.play('homing');
  } else { mk(a.x*w.spd,a.y*w.spd); SND.play(p.weapon==='machine'?'mg':'shot'); }
  p.muzzle=5; p.recoil=4;
  spark(bx,by,2,w.col,1.6);
}
function hurtPlayer(n){
  const p=player; if(!p||p.inv>0||p.dead||p.dashT>0)return;
  p.hp-=n; p.inv=100; cam.shake=8; flash=6; SND.play('hurt');
  spark(p.x+p.w/2,p.y+p.h/2,16,P.rd2,3.6); comboN=0;
  if(p.hp<=0){p.dead=true;deadT=0;lives--;boom(p.x+p.w/2,p.y+p.h/2,28,P.rd2);SND.play('boom');}
}
function updatePlayer(){
  const p=player; if(!p)return;
  if(p.dead){deadT++;return;}
  const s=IN.st,e=IN.edge,c=p.ch;
  if(p.inv>0)p.inv--;
  if(p.cd>0)p.cd--;
  if(p.dashCD>0)p.dashCD--;
  if(p.muzzle>0)p.muzzle--;
  if(p.recoil>0)p.recoil--;
  if(p.webT>0)p.webT--;
  if(p.pushT>0)p.pushT--;
  if(p.dropping>0)p.dropping--;
  if(p.specT>0){p.specT--;if(p.specT===0)p.drone=null;}
  p.breath+=.045;

  if(s.left&&!s.right)p.face=-1; else if(s.right&&!s.left)p.face=1;
  p.aim=aimVec(p);

  /* --- ЛЁЖА: залипающая, с якорем по ступням --- */
  const feet=p.y+p.h;
  const wantProne = s.down && !s.up && (p.onGround||p.prone) && p.dashT<=0;
  if(wantProne&&!p.prone){ p.prone=true; p.h=PRONE_H; p.y=feet-p.h; }
  else if(!wantProne&&p.prone){
    const ny=feet-STAND_H;
    if(!headBlocked(p.x,ny,p.w,STAND_H)){ p.prone=false; p.h=STAND_H; p.y=ny; }
  }

  /* --- рывок --- */
  if(p.dashT>0){
    p.dashT--; p.vx=p.face*(c.id==='den'?8.4:7.0); p.vy=0;
    if(p.dashT%2===0)parts.push({x:p.x+p.w/2,y:p.y+p.h/2,vx:0,vy:0,life:12,max:12,c:c.pal.acc,g:0,s:2});
    foes.forEach(f=>{if(!f.dead&&Math.abs(f.x+f.w/2-(p.x+p.w/2))<26&&Math.abs(f.y+f.h/2-(p.y+p.h/2))<30)damageFoe(f,3.4);});
    if(boss&&boss.hp>0&&Math.abs(boss.x-(p.x+p.w/2))<boss.w*.6&&Math.abs(boss.y-boss.h/2-(p.y+p.h/2))<boss.h)damageBoss(2.6);
  } else if(p.pushT>0){
    p.vx*=.86;
  } else {
    const spd=c.speed*(p.webT>0?.42:1)*(p.prone?0:1);
    if(s.left&&!s.right)p.vx=lerp(p.vx,-spd,.42);
    else if(s.right&&!s.left)p.vx=lerp(p.vx,spd,.42);
    else { p.vx*=p.onGround?.55:.92; if(Math.abs(p.vx)<.08)p.vx=0; }
  }

  /* --- прыжок --- */
  if(e.jump)p.buffer=8;
  if(p.buffer>0)p.buffer--;
  if(p.coyote>0)p.coyote--;
  const onPlat=plat(Math.floor((p.x+p.w/2)/TS),Math.floor((p.y+p.h+1)/TS))&&!solid(Math.floor((p.x+p.w/2)/TS),Math.floor((p.y+p.h+1)/TS));
  if(p.buffer>0&&p.onGround&&s.down&&onPlat){
    p.dropping=10; p.y+=2; p.onGround=false; p.vy=1.4; p.buffer=0;
    if(p.prone){p.prone=false;p.h=STAND_H;p.y-=STAND_H-PRONE_H;}
    SND.play('jump');
  } else if(p.buffer>0){
    if(p.onGround||p.coyote>0){
      if(p.prone){p.prone=false;const ft=p.y+p.h;p.h=STAND_H;p.y=ft-p.h;}
      p.vy=-c.jump; p.onGround=false; p.jumps=1; p.buffer=0; p.coyote=0; SND.play('jump');
      spark(p.x+p.w/2,p.y+p.h,6,P.g4,1.8);
    } else if(c.dbl&&p.jumps<2){
      p.vy=-c.jump*.9; p.jumps=2; p.buffer=0; SND.play('djump');
      for(let i=0;i<10;i++)parts.push({x:p.x+p.w/2,y:p.y+p.h,vx:rnd(-2.2,2.2),vy:rnd(0,2.2),life:16,max:16,c:c.pal.acc,g:.05,s:1});
    } else if(c.dash&&c.id==='den'&&p.dashCD<=0){
      p.dashT=12; p.dashCD=44; p.buffer=0; SND.play('dash');
    }
  }
  if(p.vy<0&&!s.jump)p.vy*=.86;

  p.hover = c.hover && !p.onGround && s.jump && p.vy>0;
  let grav=.38;
  if(p.hover){grav=.06;p.vy=Math.min(p.vy,1.1);
    if(tick%3===0)parts.push({x:p.x+p.w/2+rnd(-6,6),y:p.y+p.h,vx:rnd(-.4,.4),vy:rnd(.4,1.2),life:14,max:14,c:P.pu1,g:0,s:1});}
  if(p.dashT<=0)p.vy=Math.min(p.vy+grav,10);

  if(c.dash&&c.id==='artyom'&&s.spec&&p.dashCD<=0&&p.onGround&&p.spec<100&&p.specT<=0){
    p.dashT=14;p.dashCD=56;SND.play('dash');
  }

  /* --- спецприём --- */
  if(e.spec&&p.spec>=100&&p.specT<=0){
    p.spec=0; SND.play('spec'); flash=5; cam.shake=7;
    if(c.spec==='burst'){p.specT=480;pop(p.x+p.w/2,p.y-14,'ШКВАЛ!',P.yl2);}
    if(c.spec==='drone'){p.specT=600;p.drone={a:0,cd:0};pop(p.x+p.w/2,p.y-14,'ДРОН!',P.cy2);}
    if(c.spec==='blink'){p.dashT=16;p.dashCD=22;pop(p.x+p.w/2,p.y-14,'БЛИНК!',P.cy2);
      spark(p.x+p.w/2,p.y+p.h/2,22,P.cy2,4.2);}
    if(c.spec==='quake'){
      pop(p.x+p.w/2,p.y-14,'УДАР ЗЕМЛИ!',P.or2); boom(p.x+p.w/2,p.y+p.h,32,P.or2);
      foes.forEach(f=>{if(!f.dead&&Math.abs(f.x-p.x)<150&&f.y+f.h>p.y)damageFoe(f,9);});
      if(boss&&boss.hp>0&&Math.abs(boss.x-p.x)<180)damageBoss(15);
      for(let i=0;i<26;i++)parts.push({x:p.x+p.w/2+rnd(-140,140),y:p.y+p.h,vx:rnd(-1,1),vy:rnd(-4.5,-1),life:28,max:28,c:P.br1,g:.2,s:2});
    }
  }

  moveX(p,p.vx); moveY(p,p.vy);
  const wasAir=!p.onGround;
  p.onGround=probeGround(p)&&p.vy>=0;
  if(p.onGround){
    if(wasAir&&p.jumps>0){SND.play('land');spark(p.x+p.w/2,p.y+p.h,4,theme.groundTop2,1.4);}
    p.jumps=0;p.coyote=7;
  }

  /* --- АНИМАЦИЯ НОГ: только при реальном беге --- */
  p.moving = (s.left||s.right) && p.onGround && !p.prone && p.dashT<=0 && Math.abs(p.vx)>.25;
  if(p.moving) p.anim += .20 + Math.abs(p.vx)*.055;
  else if(p.onGround) p.anim = 0;

  const fx=Math.floor((p.x+p.w/2)/TS), fy=Math.floor((p.y+p.h-2)/TS);
  if(hazard(fx,fy)&&p.inv<=0){ if(T(fx,fy)==='~'){hurtPlayer(2);p.vy=-5;} else hurtPlayer(1); }
  if(p.y>H+50)hurtPlayer(99);

  if(s.fire)shoot(p);

  if(p.drone){
    p.drone.a+=.07; if(p.drone.cd>0)p.drone.cd--;
    const dx=p.x+p.w/2+Math.cos(p.drone.a)*28, dy=p.y+12+Math.sin(p.drone.a)*16;
    p.drone.x=dx;p.drone.y=dy;
    if(p.drone.cd<=0){
      const tg=nearestFoe(dx,dy);
      if(tg){const a=Math.atan2(tg.y+tg.h/2-dy,tg.x+tg.w/2-dx);
        bullets.push({x:dx,y:dy,vx:Math.cos(a)*7,vy:Math.sin(a)*7,dmg:1.1,kind:'bullet',col:P.cy2,len:6,life:90,t:0});
        p.drone.cd=16;SND.play('mg');}
    }
  }
  if(p.moving&&tick%8===0)
    parts.push({x:p.x+p.w/2,y:p.y+p.h,vx:-p.vx*.2,vy:-rnd(.2,.8),life:12,max:12,c:theme.groundTop2,g:.06,s:1});
}
function nearestFoe(x,y){
  let best=null,bd=1e9;
  foes.forEach(f=>{if(f.dead)return;const d=(f.x-x)**2+(f.y-y)**2;if(d<bd&&d<250*250){bd=d;best=f;}});
  if(boss&&boss.hp>0){const d=(boss.x-x)**2+(boss.y-boss.h/2-y)**2;
    if(d<bd)best={x:boss.x-boss.w/2,y:boss.y-boss.h,w:boss.w,h:boss.h};}
  return best;
}

/* ============================================================
   ВРАГИ — с расталкиванием, без «склеивания»
   ============================================================ */
function spawnFoe(type,x,y){
  const d=ENEMIES[type];
  foes.push({type,x,y:y-d.h,vx:0,vy:0,w:d.w,h:d.h,hp:d.hp,maxhp:d.hp,def:d,
    face:-1,t:ri(60),cd:ri(30,90),anim:rnd(0,6),dead:false,onGround:false,hitT:0,
    base:y,pushT:0,dirX:0,moving:false});
}
function damageFoe(f,n){
  f.hp-=n; f.hitT=6; SND.play('hit');
  spark(f.x+f.w/2,f.y+f.h/2,5,P.yl1,2.2);
  if(f.hp<=0&&!f.dead){
    f.dead=true; kills++; comboN++; comboT=110;
    const sc=Math.round(f.def.score*(1+Math.min(comboN,10)*.1));
    score+=sc; pop(f.x+f.w/2,f.y,'+'+sc,P.yl2);
    boom(f.x+f.w/2,f.y+f.h/2,16,f.def.col); SND.play('kill');
    if(player)player.spec=Math.min(100,player.spec+9);
    if(f.def.drop)dropItem(f.x+f.w/2,f.y+f.h/2);
    else if(Math.random()<.11)dropItem(f.x+f.w/2,f.y+f.h/2,true);
  }
}
function dropItem(x,y,small){
  const kind = small ? (Math.random()<.5?'heal':'spec') : WORDER[ri(WORDER.length)];
  items.push({x,y,vy:-2.4,kind,t:0,life:660});
}
function updateFoes(){
  const p=player;
  for(let i=foes.length-1;i>=0;i--){
    const f=foes[i];
    if(f.dead){foes.splice(i,1);continue;}
    if(f.hitT>0)f.hitT--;
    if(f.pushT>0)f.pushT--;
    f.t++;
    if(f.x<cam.x-120||f.x>cam.x+W+180){ if(f.t>700)foes.splice(i,1); continue; }
    const pcx=p?p.x+p.w/2:0, pcy=p?p.y+p.h/2:0;
    const dx=pcx-(f.x+f.w/2), dy=pcy-(f.y+f.h/2);
    const dist=Math.hypot(dx,dy);
    if(f.pushT<=0)f.face=dx<0?-1:1;
    f.moving=false;

    if(f.pushT>0){ f.vx*=.84; }
    else switch(f.type){
      case 'runner': case 'crawler': {
        const stop = f.type==='runner'?24:20;
        if(Math.abs(dx)>stop){ f.vx=f.face*f.def.spd*(dist<220?1.3:1); f.moving=true; }
        else f.vx*=.6;
        if(f.type==='runner'&&f.onGround&&Math.random()<.010)f.vy=-4.8;
        break;
      }
      case 'jumper':
        if(f.onGround){f.vx*=.8;if(f.t%56===0&&dist<260){f.vy=-6.0;f.vx=f.face*2.3;}}
        break;
      case 'shooter':
        f.vx=0;
        if(--f.cd<=0&&dist<250){f.cd=f.def.fire;
          const a=Math.atan2(dy,dx);
          ebullets.push({x:f.x+f.w/2,y:f.y+14,vx:Math.cos(a)*3.1,vy:Math.sin(a)*3.1,r:3,col:P.or2,life:160});
          SND.play('shot');}
        break;
      case 'grenadier':
        f.vx=Math.abs(dx)>140?f.face*f.def.spd:0; f.moving=f.vx!==0;
        if(--f.cd<=0&&dist<270){f.cd=f.def.fire;
          ebullets.push({x:f.x+f.w/2,y:f.y+8,vx:dx/72,vy:-4.0,r:4,col:P.gr1,life:180,grav:.15,bomb:true});
          SND.play('fire');}
        break;
      case 'turret':
        f.vx=0; f.ang=Math.atan2(dy,dx);
        if(--f.cd<=0&&dist<270){f.cd=f.def.fire;
          for(let k=-1;k<=1;k++){const a=f.ang+k*.18;
            ebullets.push({x:f.x+f.w/2,y:f.y+10,vx:Math.cos(a)*3.5,vy:Math.sin(a)*3.5,r:3,col:P.rd2,life:160});}
          SND.play('spread');}
        break;
      case 'flyer':
        if(!f.dirX)f.dirX=f.face;
        f.vx=f.dirX*f.def.spd;
        f.y=f.base-f.h+Math.sin(f.t*.05)*26;
        if(--f.cd<=0&&dist<250){f.cd=f.def.fire;
          ebullets.push({x:f.x+f.w/2,y:f.y+f.h,vx:0,vy:2.8,r:3,col:P.pu1,life:180,grav:.06});}
        break;
      case 'pod':
        if(!f.dirX)f.dirX=1;
        f.vx=f.dirX*f.def.spd; f.y=f.base-f.h+Math.sin(f.t*.07)*20;
        break;
    }
    if(f.moving)f.anim+=.20; else if(f.def.kind==='ground')f.anim=0;

    if(f.def.kind!=='air'){ f.vy=Math.min(f.vy+.38,10); moveX(f,f.vx); moveY(f,f.vy); f.onGround=probeGround(f)&&f.vy>=0; }
    else f.x+=f.vx;
    if(f.y>H+70){foes.splice(i,1);continue;}

    /* контакт: урон + разталкивание, никогда не «склеиваются» */
    if(p&&!p.dead&&aabb(p,f)){
      const dir=sgn((p.x+p.w/2)-(f.x+f.w/2))||1;
      if(p.inv<=0&&p.dashT<=0)hurtPlayer(1);
      const overlap=Math.min(p.x+p.w-f.x, f.x+f.w-p.x);
      const push=Math.max(2,overlap*.6);
      p.x+=dir*push; p.vx=dir*3.4; p.pushT=10;
      if(f.def.kind!=='fixed'){ f.x-=dir*push; f.vx=-dir*2.6; f.pushT=16; }
      moveX(p,0);
      spark((p.x+f.x+f.w)/2,p.y+p.h*.5,6,P.or1,2.4);
    }
  }
  /* враг-враг: не слипаются в кучу */
  for(let i=0;i<foes.length;i++)for(let j=i+1;j<foes.length;j++){
    const a=foes[i],b=foes[j];
    if(a.dead||b.dead||a.def.kind==='air'||b.def.kind==='air')continue;
    if(!aabb(a,b))continue;
    const ov=Math.min(a.x+a.w-b.x,b.x+b.w-a.x);
    if(ov<=0)continue;
    const d=sgn((a.x+a.w/2)-(b.x+b.w/2))||1;
    const s=Math.min(2.2,ov*.35);
    if(a.def.kind!=='fixed')a.x+=d*s;
    if(b.def.kind!=='fixed')b.x-=d*s;
  }
}

/* ---------- пули ---------- */
function updateBullets(){
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i]; b.t++; b.life--;
    if(b.kind==='fire'){b.spin+=.35;b.x+=b.vx;b.y+=b.vy+Math.sin(b.spin)*1.2;}
    else if(b.kind==='homing'){
      const tg=nearestFoe(b.x,b.y);
      if(tg){const a=Math.atan2(tg.y+tg.h/2-b.y,tg.x+tg.w/2-b.x);
        b.vx=lerp(b.vx,Math.cos(a)*6.2,.10);b.vy=lerp(b.vy,Math.sin(a)*6.2,.10);}
      b.x+=b.vx;b.y+=b.vy;
      if(b.t%2===0)parts.push({x:b.x,y:b.y,vx:0,vy:0,life:10,max:10,c:P.pu2,g:0,s:1});
    } else {b.x+=b.vx;b.y+=b.vy;}
    if(b.life<=0||b.x<cam.x-50||b.x>cam.x+W+50||b.y<-40||b.y>H+40){bullets.splice(i,1);continue;}
    const cx=Math.floor(b.x/TS),cy=Math.floor(b.y/TS);
    if(T(cx,cy)==='B'){
      lvl.rows[cy]=lvl.rows[cy].substring(0,cx)+'.'+lvl.rows[cy].substring(cx+1);
      buildTiles(); boom(cx*TS+8,cy*TS+8,14,P.br1); dropItem(cx*TS+8,cy*TS+8);
      bullets.splice(i,1); continue;
    }
    if(solid(cx,cy)){ spark(b.x,b.y,3,P.mt1,1.6); if(!b.pierce){bullets.splice(i,1);continue;} }
    let hit=false;
    for(const f of foes){
      if(f.dead)continue;
      if(b.x>f.x-2&&b.x<f.x+f.w+2&&b.y>f.y-2&&b.y<f.y+f.h+2){
        damageFoe(f,b.dmg);hit=true;if(!b.pierce)break;
      }
    }
    if(!hit&&boss&&boss.hp>0&&bossIntro<=0&&
       b.x>boss.x-boss.w/2&&b.x<boss.x+boss.w/2&&b.y>boss.y-boss.h&&b.y<boss.y){
      damageBoss(b.dmg);hit=true;
    }
    if(hit&&!b.pierce)bullets.splice(i,1);
  }
  for(let i=ebullets.length-1;i>=0;i--){
    const b=ebullets[i]; b.life--;
    if(b.grav)b.vy+=b.grav;
    b.x+=b.vx;b.y+=b.vy;
    if(b.life<=0||b.x<cam.x-70||b.x>cam.x+W+70||b.y>H+50){ebullets.splice(i,1);continue;}
    if(b.bomb&&b.y>GROUND_Y-4){boom(b.x,b.y,14,P.gr1);ebullets.splice(i,1);continue;}
    if(b.puddle&&b.y>=b.floor){parts.push({x:b.x,y:b.floor,puddle:true,life:240,max:240,c:P.gr1,r:12});ebullets.splice(i,1);continue;}
    const p=player;
    if(p&&!p.dead&&p.inv<=0&&b.x>p.x-2&&b.x<p.x+p.w+2&&b.y>p.y-2&&b.y<p.y+p.h+2){
      hurtPlayer(b.dmg||1); if(b.web)p.webT=150; ebullets.splice(i,1);
    }
  }
}
function updateItems(){
  const p=player;
  for(let i=items.length-1;i>=0;i--){
    const it=items[i]; it.t++; it.life--;
    it.vy=Math.min(it.vy+.24,6); it.y+=it.vy;
    const cx=Math.floor(it.x/TS),cy=Math.floor((it.y+8)/TS);
    if(solid(cx,cy)||plat(cx,cy)){it.y=cy*TS-8;it.vy=0;}
    if(it.life<=0||it.y>H+40){items.splice(i,1);continue;}
    if(p&&!p.dead&&Math.abs(it.x-(p.x+p.w/2))<20&&Math.abs(it.y-(p.y+p.h/2))<26){
      SND.play('pick'); score+=200;
      if(it.kind==='heal'){p.hp=Math.min(p.maxhp,p.hp+2);pop(it.x,it.y-10,'+2 HP',P.rd1);}
      else if(it.kind==='spec'){p.spec=Math.min(100,p.spec+50);pop(it.x,it.y-10,'ПРИЁМ +50',P.cy2);}
      else {p.weapon=it.kind;pop(it.x,it.y-10,WEAPONS[it.kind].name,P.yl2);}
      spark(it.x,it.y,12,P.yl1,2.8); items.splice(i,1);
    }
  }
}

/* ============================================================
   БОССЫ
   ============================================================ */
function spawnBoss(idx){
  const d=BOSSES[idx];
  const arenaX=(lvl.w-22)*TS;
  boss={def:d,idx,x:arenaX+180,y:GROUND_Y,hp:d.hp,maxhp:d.hp,w:d.w,h:d.h,
    st:'idle',t:0,cd:100,face:-1,phase:1,anim:0,hitT:0,
    legs:[],tail:[],eyeGlow:0,clawT:0,ceil:false,vy:0,vx:0,dead:false,deathT:0,
    tele:0,atk:null,arenaX,swing:0,beamT:0,beamA:0,stabI:0,stabT:0,dropT:0,chX:-1};
  if(d.id==='spider')for(let i=0;i<8;i++)boss.legs.push({ext:0});
  for(let i=0;i<7;i++)boss.tail.push({x:0,y:0});
  bossIntro=150; SND.play('boss'); SND.music('boss');
}
function damageBoss(n){
  if(!boss||boss.hp<=0||bossIntro>0)return;
  boss.hp-=n; boss.hitT=5; SND.play('hit');
  spark(boss.x+rnd(-26,26),boss.y-rnd(12,boss.h),5,P.yl1,2.6);
  if(player)player.spec=Math.min(100,player.spec+1.2);
  const r=boss.hp/boss.maxhp, np=r<.3?3:r<.6?2:1;
  if(np>boss.phase){boss.phase=np;flash=6;cam.shake=9;SND.play('boss');
    pop(boss.x,boss.y-boss.h-12,'ФАЗА '+np,P.rd2);}
  if(boss.hp<=0){boss.hp=0;boss.dead=true;boss.deathT=0;score+=boss.def.score;SND.play('boom');cam.shake=13;}
}
function updateBoss(){
  if(!boss)return;
  const b=boss,p=player;
  b.anim+=.1; if(b.hitT>0)b.hitT--;
  if(b.dead){
    b.deathT++;
    if(b.deathT%7===0){boom(b.x+rnd(-50,50),b.y-rnd(8,b.h),20,P.fl2);SND.play('boom');}
    if(b.deathT>115){stageClearT=1;SND.play('win');}
    return;
  }
  if(bossIntro>0){bossIntro--;return;}
  if(!p||p.dead)return;
  b.t++;
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2;
  const dx=pcx-b.x, dist=Math.abs(dx);
  if(b.st!=='act')b.face=dx<0?-1:1;
  const spd=1+(b.phase-1)*.35;

  if(b.st==='idle'){
    b.cd-=spd;
    if(b.cd<=0){
      let m;
      if(dist<86&&b.def.id==='dog')m='tail';
      else if(dist<86&&b.def.id==='cat')m='claw';
      else m=b.def.moves[ri(b.def.moves.length)];
      b.atk=m;b.st='tele';b.tele=(m==='tail'||m==='claw')?26:m==='drop'?38:30;
    }
  } else if(b.st==='tele'){ b.tele--; if(b.tele<=0){b.st='act';b.t=0;startAttack(b);} }
  else if(b.st==='act'){ runAttack(b,pcx,pcy,dist,spd); }
  else if(b.st==='rest'){ b.cd--; if(b.cd<=0){b.st='idle';b.cd=Math.max(24,72-b.phase*14);} }

  for(let i=0;i<b.tail.length;i++){
    const t=b.tail[i];
    const tx=b.x-b.face*(b.w*.42+i*11), ty=b.y-b.h*.48+Math.sin(b.anim*1.6+i*.5)*(5+i);
    t.x=lerp(t.x||tx,tx,.4); t.y=lerp(t.y||ty,ty,.4);
  }
  if(p.inv<=0&&!p.dead&&b.st!=='act'){
    const bb={x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h};
    if(aabb(p,bb)){
      const dir=sgn(pcx-b.x)||1;
      hurtPlayer(1); p.x+=dir*10; p.vx=dir*4; p.pushT=12;
    }
  }
}
function startAttack(b){
  const p=player,pcx=p.x+p.w/2,pcy=p.y+p.h/2;
  switch(b.atk){
    case 'fireball':{
      const n=2+b.phase;
      for(let i=0;i<n;i++){
        const a=Math.atan2(pcy-(b.y-b.h*.62),pcx-b.x)+(i-(n-1)/2)*.20;
        ebullets.push({x:b.x+b.face*40,y:b.y-b.h*.62,vx:Math.cos(a)*3.8,vy:Math.sin(a)*3.8,r:6,col:P.fl2,life:210,fire:true});
      }
      SND.play('fire');b.st='rest';b.cd=44;break;
    }
    case 'tail': b.swing=0;SND.play('dash');break;
    case 'charge': b.chX=b.face;SND.play('dash');break;
    case 'leap': b.vy=-9.4;b.vx=b.face*3.0;SND.play('jump');break;
    case 'claw': b.clawT=0;SND.play('dash');break;
    case 'eyebeam': b.beamT=0;b.beamA=Math.atan2(pcy-(b.y-b.h*.74),pcx-b.x);SND.play('laser');break;
    case 'pounce': b.vy=-8.6;b.vx=clamp((pcx-b.x)/44,-4.8,4.8);SND.play('jump');break;
    case 'volley':{
      for(let i=0;i<5+b.phase*2;i++){const a=-2.5+i*.22;
        ebullets.push({x:b.x,y:b.y-b.h*.7,vx:Math.cos(a)*3.3,vy:Math.sin(a)*3.3,r:4,col:P.pu1,life:200});}
      SND.play('spread');b.st='rest';b.cd=48;break;
    }
    case 'web':{
      for(let i=0;i<3;i++){const a=Math.atan2(pcy-(b.y-b.h*.5),pcx-b.x)+(i-1)*.16;
        ebullets.push({x:b.x,y:b.y-b.h*.5,vx:Math.cos(a)*3.9,vy:Math.sin(a)*3.9,r:6,col:P.w,life:190,web:true,dmg:1});}
      SND.play('spread');b.st='rest';b.cd=40;break;
    }
    case 'legstab': b.stabI=0;b.stabT=0;SND.play('dash');break;
    case 'drop': b.ceil=true;b.dropT=0;SND.play('jump');break;
    case 'spawn':{
      const n=b.phase>=3?2:1;
      for(let i=0;i<n;i++)spawnFoe('crawler',b.x+rnd(-50,50),GROUND_Y);
      SND.play('kill');b.st='rest';b.cd=54;break;
    }
    case 'poison':{
      for(let i=0;i<4+b.phase;i++){const a=-2.3+i*.26;
        ebullets.push({x:b.x,y:b.y-b.h*.6,vx:Math.cos(a)*3.5,vy:Math.sin(a)*3.5,r:5,col:P.gr1,life:210,grav:.14,puddle:true,floor:GROUND_Y-2});}
      SND.play('fire');b.st='rest';b.cd=50;break;
    }
    default:b.st='rest';b.cd=40;
  }
}
function runAttack(b,pcx,pcy,dist,spd){
  const p=player;
  switch(b.atk){
    case 'tail':{
      b.swing+=.14*spd;
      const sw=Math.sin(b.swing*3.1);
      const hx=b.x-b.face*(b.w*.5+46*Math.abs(sw)), hy=b.y-10;
      if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-hx)<32&&p.y+p.h>b.y-28)hurtPlayer(2);
      if(b.swing>1.1){b.st='rest';b.cd=40;}
      break;
    }
    case 'charge':{
      b.x+=b.chX*5.0*spd;
      if(tick%3===0)spark(b.x-b.chX*40,b.y-8,3,P.br1,2);
      if(b.x<b.arenaX+70||b.x>b.arenaX+300){b.chX*=-1;b.face=b.chX;}
      if(b.t>92){b.st='rest';b.cd=36;}
      break;
    }
    case 'leap': case 'pounce':{
      b.vy+=.46;b.y+=b.vy;b.x+=b.vx;
      b.x=clamp(b.x,b.arenaX+70,b.arenaX+310);
      if(b.y>=GROUND_Y){
        b.y=GROUND_Y;b.vy=0;b.vx=0;
        boom(b.x,b.y,24,P.br1);SND.play('boom');
        if(p&&p.onGround&&Math.abs(p.x+p.w/2-b.x)<110)hurtPlayer(2);
        for(let i=0;i<2;i++)ebullets.push({x:b.x,y:b.y-8,vx:(i?1:-1)*3.9,vy:0,r:5,col:P.or2,life:100});
        b.st='rest';b.cd=42;
      }
      break;
    }
    case 'claw':{
      b.clawT+=.12*spd;
      const reach=Math.sin(Math.min(1,b.clawT)*3.14)*60;
      const hx=b.x+b.face*(b.w*.4+reach), hy=b.y-b.h*.45;
      if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-hx)<28&&Math.abs(p.y+p.h/2-hy)<36)hurtPlayer(2);
      if(b.clawT>1.15){b.st='rest';b.cd=38;}
      break;
    }
    case 'eyebeam':{
      b.beamT+=.02*spd;b.eyeGlow=1;
      const a=b.beamA+Math.sin(b.beamT*2.2)*.5;
      for(let d=24;d<420;d+=8){
        const bx=b.x+Math.cos(a)*d, by=b.y-b.h*.74+Math.sin(a)*d;
        if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-bx)<11&&Math.abs(p.y+p.h/2-by)<14){hurtPlayer(2);break;}
      }
      if(b.beamT>1.5){b.eyeGlow=0;b.st='rest';b.cd=46;}
      break;
    }
    case 'legstab':{
      b.stabT+=.1*spd;
      if(b.stabT>1){b.stabT=0;b.stabI++;SND.play('dash');}
      const i=b.stabI;
      if(i<4){
        const lx=b.x-84+i*56, ext=Math.sin(Math.min(1,b.stabT)*3.14);
        if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-lx)<18&&p.y+p.h>GROUND_Y-56*ext)hurtPlayer(2);
        b.legs[i*2].ext=ext;b.legs[i*2+1].ext=ext;
      } else {b.legs.forEach(l=>l.ext=0);b.st='rest';b.cd=44;}
      break;
    }
    case 'drop':{
      b.dropT+=.03*spd;
      if(b.dropT<1)b.y=lerp(GROUND_Y,72,Math.min(1,b.dropT*2));
      else if(b.dropT<1.6)b.x=lerp(b.x,pcx,.06);
      else {
        b.y+=11;
        if(b.y>=GROUND_Y){b.y=GROUND_Y;boom(b.x,GROUND_Y,30,P.pu2);SND.play('boom');
          if(p&&Math.abs(p.x+p.w/2-b.x)<86)hurtPlayer(2);
          for(let i=0;i<6;i++){const a=-2.8+i*.5;
            ebullets.push({x:b.x,y:GROUND_Y-6,vx:Math.cos(a)*3.4,vy:Math.sin(a)*3.4,r:4,col:P.pu1,life:120});}
          b.ceil=false;b.st='rest';b.cd=50;}
      }
      break;
    }
    default:b.st='rest';b.cd=40;
  }
}

/* ============================================================
   РЕНДЕР БОЙЦА — детализированная модель с экипировкой
   ============================================================ */
function jointChain(ox,oy,a1,l1,a2,l2){
  const kx=ox+Math.sin(a1)*l1, ky=oy+Math.cos(a1)*l1;
  const fx=kx+Math.sin(a1+a2)*l2, fy=ky+Math.cos(a1+a2)*l2;
  return {kx,ky,fx,fy};
}
function drawBoot(x,y,f,c,gr){
  if(gr.boots==='heavy'){
    box(x-6,y-7,13,8,c.boot,P.n); px(x-5,y-6,11,2,c.bootHi);
    px(x-7,y-1,15,3,P.mt5); px(x-6,y,13,1,P.mt4);
    px(x+f*3,y-5,3,2,c.acc);
  } else if(gr.boots==='light'){
    box(x-4,y-6,10,7,c.boot,P.n); px(x-3,y-5,8,2,c.bootHi);
    px(x-5,y-1,12,2,P.d1); px(x+f*2,y-4,2,1,c.acc);
  } else if(gr.boots==='tech'){
    box(x-5,y-7,12,8,c.boot,P.n); px(x-4,y-6,10,2,c.bootHi);
    px(x-6,y-1,14,3,P.mt5); px(x-2,y-5,4,2,c.acc);
    glow(x,y-4,7,'rgba(162,75,255,.35)',.5);
  } else {
    box(x-5,y-8,11,9,c.boot,P.n); px(x-4,y-7,9,2,c.bootHi);
    for(let i=0;i<3;i++)px(x-3,y-6+i*2,7,1,P.br5);
    px(x-6,y-1,13,3,P.br5); px(x-5,y,11,1,P.mt5);
  }
}
function drawHead(cx,cy,f,c,gr,t){
  if(gr.head==='helmet'){
    ellO(cx,cy,8,8,c.helm,P.n);
    ell(cx-1,cy-2,6,5,c.helmHi);
    px(cx-8,cy+1,17,2,c.helmLo);
    ell(cx+f*3,cy+3,5,4,c.skin);
    px(cx+f*1,cy+1,8,3,P.cy4); px(cx+f*2,cy+2,6,1,P.cy2);
    px(cx-8,cy-4,16,2,c.helmLo);
    px(cx+f*7,cy-2,2,5,c.acc);
    px(cx-2,cy-9,4,2,c.helmHi);
  } else if(gr.head==='hood'){
    ellO(cx,cy,8.5,8.5,c.helm,P.n);
    ell(cx-1,cy-2,6,5.5,c.helmHi);
    ell(cx+f*3,cy+2,5,4.5,c.skin);
    px(cx+f*4,cy+1,2,1,P.n);
    px(cx+f*2,cy+4,4,1,c.skinLo);
    px(cx-8,cy+4,16,3,c.helmLo);
    tri(cx-f*7,cy-4,6,10,c.helmLo,-1);
  } else if(gr.head==='goggles'){
    ellO(cx,cy,7.5,7.5,c.skin,P.n);
    ell(cx-1,cy-2,5.5,5,c.skinHi);
    ell(cx,cy-4,8,5,c.helm);
    px(cx-8,cy-3,16,3,c.helmLo);
    box(cx+f*1-4,cy,10,4,P.mt5,P.n);
    px(cx+f*1-3,cy+1,4,2,c.acc); px(cx+f*1+2,cy+1,3,2,c.acc);
    glow(cx+f*2,cy+2,9,'rgba(224,194,255,.4)',.5);
    px(cx+f*3,cy+5,3,1,c.skinLo);
    line(cx-f*5,cy-7,cx-f*9,cy-16,P.mt2,1);
    px(cx-f*10,cy-18,2,2,c.acc);
    if((t>>3)%2)glow(cx-f*9,cy-17,6,'rgba(224,194,255,.6)',.6);
  } else {
    ellO(cx,cy,7,7.5,c.skin,P.n);
    ell(cx-1,cy-2,5,5,c.skinHi);
    px(cx+f*3,cy+1,2,1,P.n);
    px(cx+f*2,cy+4,4,1,c.skinLo);
    px(cx+f*5,cy+2,2,2,c.skinLo);
    ell(cx,cy-4,7.5,4.5,c.helm);
    px(cx-8,cy-3,16,2,c.helmLo);
    px(cx-8,cy-5,16,1,c.helmHi);
    tri(cx-f*8,cy-3,7,9,c.helm,-1);
    px(cx-f*10,cy+1,4,2,c.helmLo);
    px(cx-f*11,cy+4,3,2,c.helmLo);
  }
}
function drawTorso(cx,topY,f,c,gr,bob){
  const y=topY+bob;
  limb(cx,y+2,cx,y+15,13,c.cloth,c.clothHi,c.clothLo,P.n);
  if(gr.vest==='plate'){
    box(cx-7,y+2,14,12,c.vest,P.n);
    px(cx-6,y+3,12,2,c.vestHi); px(cx-6,y+11,12,2,c.vestLo);
    px(cx-2,y+4,4,8,c.vestLo); px(cx-1,y+5,2,6,c.acc);
    px(cx-7,y+7,14,1,c.vestLo);
  } else if(gr.vest==='bandolier'){
    box(cx-6,y+3,12,10,c.vest,P.n);
    px(cx-5,y+4,10,1,c.vestHi);
    for(let i=0;i<5;i++){const bx=cx-6+i*3, by=y+3+i*2;
      px(bx,by,3,3,P.yl3); px(bx,by,3,1,P.yl1);}
    px(cx-6,y+12,12,2,c.vestLo);
    px(cx+f*2,y+6,2,2,P.mt1); px(cx+f*2,y+9,2,1,P.mt2);
  } else if(gr.vest==='light'){
    box(cx-6,y+3,12,9,c.vest,P.n);
    px(cx-5,y+4,10,1,c.vestHi);
    px(cx-1,y+4,2,8,c.vestLo);
    px(cx-6,y+6,4,3,c.vestLo); px(cx+2,y+6,4,3,c.vestLo);
    px(cx-5,y+10,10,1,c.acc);
  } else {
    box(cx-7,y+2,14,12,c.vest,P.n);
    px(cx-6,y+3,12,1,c.vestHi);
    for(let i=0;i<3;i++)px(cx-6,y+5+i*3,14,1,c.vestLo);
    px(cx-8,y+4,2,8,P.mt2); px(cx+6,y+4,2,8,P.mt2);
    px(cx-3,y+6,6,4,c.acc); px(cx-2,y+7,4,2,P.w);
    glow(cx,y+8,8,'rgba(162,75,255,.3)',.4);
  }
  /* пояс */
  px(cx-7,y+14,14,3,P.br4); px(cx-7,y+14,14,1,P.br3);
  px(cx-2,y+14,4,3,P.yl3); px(cx-1,y+15,2,1,P.yl1);
  if(gr.extra==='dogtag'){line(cx-2,y+2,cx+1,y+7,P.mt1,1);px(cx+1,y+7,2,3,P.mt1);}
  if(gr.extra==='scarf'){
    px(cx-7,y,14,3,c.acc); px(cx-7,y+1,14,1,P.cy1);
    const w=Math.sin(tick*.12)*3;
    tri(cx-f*8,y+1,7,12,c.acc,-1);
    px(cx-f*11,y+4+w,4,8,c.acc); px(cx-f*11,y+4+w,4,2,P.cy1);
  }
}
function drawShoulders(cx,y,f,c,gr){
  if(gr.shoulder==='pauldron'){
    ellO(cx-f*7,y+3,6,5,c.vest,P.n); ell(cx-f*7,y+2,4.5,3.5,c.vestHi);
    ellO(cx+f*7,y+3,6,5,c.vest,P.n); ell(cx+f*7,y+2,4.5,3.5,c.vestHi);
    px(cx+f*5,y+1,5,1,c.acc);
  } else if(gr.shoulder==='plate'){
    box(cx-f*9,y+2,6,5,c.vest,P.n); px(cx-f*8,y+3,4,1,c.vestHi);
    box(cx+f*4,y+2,6,5,c.vest,P.n); px(cx+f*5,y+3,4,1,c.vestHi);
    px(cx+f*5,y+4,4,1,c.acc);
  }
}
function drawPack(cx,y,f,c,gr){
  if(gr.pack==='heavy'){
    box(cx-f*11,y+2,7,12,P.mt4,P.n);
    px(cx-f*10,y+3,5,2,P.mt3); px(cx-f*10,y+8,5,2,P.mt5);
    px(cx-f*9,y+12,3,3,P.or3);
  } else if(gr.pack==='tech'){
    box(cx-f*11,y+2,7,13,P.mt4,P.n);
    px(cx-f*10,y+3,5,2,P.mt3);
    for(let i=0;i<3;i++){px(cx-f*10,y+6+i*3,5,2,c.acc);
      glow(cx-f*8,y+7+i*3,5,'rgba(224,194,255,.4)',.5);}
  }
}
function drawArm(sx,sy,ex,ey,f,c,gr,front){
  const mx=(sx+ex)/2, my=(sy+ey)/2;
  const dx=ex-sx, dy=ey-sy, L=Math.hypot(dx,dy)||1;
  const bend=front?-3:3;
  const kx=mx+(-dy/L)*bend, ky=my+(dx/L)*bend;
  const base=gr.arms==='bare'?c.skin:c.cloth;
  const hi=gr.arms==='bare'?c.skinHi:c.clothHi;
  const lo=gr.arms==='bare'?c.skinLo:c.clothLo;
  limb(sx,sy,kx,ky,gr.arms==='bare'?6:5,base,hi,lo,P.n);
  limb(kx,ky,ex,ey,gr.arms==='bare'?5:4,base,hi,lo,P.n);
  if(gr.arms==='gauntlet'){ box(kx-3,ky-3,7,7,c.vest,P.n); px(kx-2,ky-2,5,2,c.vestHi); }
  if(gr.arms==='tech'){ px(kx-2,ky-2,5,4,P.mt3); px(kx-1,ky-1,3,2,c.acc); }
  if(gr.arms==='glove'){ ell(ex,ey,3,3,P.d2); px(ex-1,ey-1,2,1,c.acc); }
  else ell(ex,ey,2.5,2.5,gr.arms==='bare'?c.skinLo:P.d2);
}
function drawGun(hx,hy,a,c,p){
  const rec=p.recoil*.7;
  const bx=hx-a.x*rec, by=hy-a.y*rec;
  const ex=bx+a.x*20, ey=by+a.y*20;
  const px_= -a.y, py_= a.x;
  line(bx-a.x*7,by-a.y*7,ex,ey,P.n,7);
  line(bx-a.x*7,by-a.y*7,ex,ey,c.gun,5);
  line(bx-a.x*6,by-a.y*6-1,ex-a.x*2,ey-a.y*2-1,c.gunHi,2);
  px(bx-a.x*8+px_*2,by-a.y*8+py_*2,4,4,P.mt5);
  line(bx+a.x*4,by+a.y*4,bx+a.x*4+px_*6,by+a.y*4+py_*6,P.mt4,3);
  px(bx+a.x*9,by+a.y*9,3,3,P.mt5);
  if(p.weapon==='laser'){px(ex-a.x*4,ey-a.y*4,3,3,c.acc);}
  if(p.weapon==='fire'){px(ex-a.x*3,ey-a.y*3,4,4,P.or3);}
  if(p.muzzle>0){
    const mx=ex+a.x*4,my=ey+a.y*4;
    glow(mx,my,15,'rgba(255,225,140,.9)',.85);
    ell(mx,my,5,5,P.fl1); ell(mx+a.x*3,my+a.y*3,3,3,P.w);
    for(let i=0;i<4;i++){const ang=Math.atan2(a.y,a.x)+(i-1.5)*.4;
      line(mx,my,mx+Math.cos(ang)*9,my+Math.sin(ang)*9,P.fl2,1);}
  }
  return {ex,ey};
}
function drawSoldier(p,preview){
  const c=p.ch.pal, gr=p.ch.gear;
  const X=Math.round(p.x-cam.x), Y=Math.round(p.y);
  if(!preview&&p.inv>0&&(tick>>2)%2)return;
  const f=p.face, cx=X+p.w/2;
  const run=p.moving, air=!p.onGround&&!preview;
  const ph=p.anim;
  const bob = run ? Math.abs(Math.sin(ph))*1.6 : (preview||!run?Math.sin(p.breath)*.6:0);

  if(p.prone){
    const by=Y+p.h;
    limb(cx-f*12,by-8,cx+f*4,by-8,10,c.pants,c.pantsHi,c.pantsLo,P.n);
    drawBoot(cx-f*15,by-2,f,c,gr);
    limb(cx-f*2,by-9,cx+f*10,by-10,11,c.cloth,c.clothHi,c.clothLo,P.n);
    box(cx+f*2,by-14,10,7,c.vest,P.n); px(cx+f*3,by-13,8,1,c.vestHi);
    drawHead(cx+f*13,by-12,f,c,gr,tick);
    const a=p.aim;
    drawArm(cx+f*8,by-11,cx+f*17,by-10,f,c,gr,true);
    drawGun(cx+f*18,by-10,{x:f,y:0},c,p);
    if(p.webT>0)for(let i=0;i<6;i++)line(cx-14+i*6,by-16,cx-12+i*6,by,'rgba(255,255,255,.45)',1);
    return;
  }

  const hipY=Y+30+bob, shY=Y+16+bob, headY=Y+8+bob;
  const thigh=9, shin=9;
  let legA,legB;
  if(air){
    legA={a1:-0.55*p.face===0?0:-0.55*f, a2:1.05};
    legB={a1:0.42*f, a2:0.35};
    if(p.vy<0){legA={a1:-0.7*f,a2:1.25};legB={a1:0.3*f,a2:0.5};}
  } else if(run){
    const s1=Math.sin(ph), s2=Math.sin(ph+Math.PI);
    legA={a1:s1*0.72*f, a2:Math.max(0,-Math.cos(ph))*1.05};
    legB={a1:s2*0.72*f, a2:Math.max(0, Math.cos(ph))*1.05};
  } else {
    legA={a1:-0.14*f,a2:0.06}; legB={a1:0.16*f,a2:0.04};
  }
  const A=jointChain(cx-f*2,hipY,legA.a1,thigh,legA.a2,shin);
  const B=jointChain(cx+f*2,hipY,legB.a1,thigh,legB.a2,shin);

  /* задняя нога */
  limb(cx+f*2,hipY,B.kx,B.ky,6,c.pantsLo,c.pants,c.pantsLo,P.n);
  limb(B.kx,B.ky,B.fx,B.fy,5,c.pantsLo,c.pants,c.pantsLo,P.n);
  if(gr.legs==='armored'){px(B.kx-3,B.ky-2,6,4,c.vest);}
  if(gr.legs==='exo'){px(B.kx-2,B.ky-2,4,4,P.mt3);px(B.kx-1,B.ky-1,2,2,c.acc);}
  drawBoot(B.fx,B.fy+1,f,c,gr);

  drawPack(cx,shY,f,c,gr);

  /* торс */
  drawTorso(cx,shY-2,f,c,gr,0);
  drawShoulders(cx,shY-2,f,c,gr);

  /* передняя нога */
  limb(cx-f*2,hipY,A.kx,A.ky,7,c.pants,c.pantsHi,c.pantsLo,P.n);
  limb(A.kx,A.ky,A.fx,A.fy,6,c.pants,c.pantsHi,c.pantsLo,P.n);
  if(gr.legs==='cargo'){px(A.kx-f*4,A.ky-3,4,5,c.pantsLo);px(A.kx-f*4,A.ky-3,4,1,c.pants);}
  if(gr.legs==='armored'){box(A.kx-3,A.ky-3,7,5,c.vest,P.n);px(A.kx-2,A.ky-2,5,1,c.vestHi);}
  if(gr.legs==='exo'){px(A.kx-2,A.ky-2,5,5,P.mt3);px(A.kx-1,A.ky-1,3,2,c.acc);}
  if(gr.legs==='skinny'){px(A.kx-3,A.ky-2,6,3,c.vest);}
  drawBoot(A.fx,A.fy+1,f,c,gr);

  drawHead(cx+f*1,headY,f,c,gr,tick);

  /* руки и ствол */
  const a=p.aim;
  const gx=cx+f*1, gy=shY+3;
  const reach=17;
  const hx=gx+a.x*reach, hy=gy+a.y*reach;
  drawArm(gx-f*4,gy+1,hx-a.x*7,hy-a.y*7,f,c,gr,false);
  drawArm(gx+f*3,gy,hx-a.x*4,hy-a.y*4,f,c,gr,true);
  drawGun(hx,hy,a,c,p);

  if(p.dashT>0)glow(cx,Y+24,26,'rgba(53,224,255,.45)',.6);
  if(p.webT>0)for(let i=0;i<6;i++)line(cx-11+i*5,Y+3,cx-9+i*5,Y+p.h,'rgba(255,255,255,.45)',1);
  if(p.drone&&p.drone.x!=null){
    const dx=p.drone.x-cam.x,dy=p.drone.y;
    ellO(dx,dy,7,4,P.mt2,P.n); px(dx-3,dy-1,6,2,P.cy2);
    px(dx-9,dy-4,4,1,P.mt1); px(dx+5,dy-4,4,1,P.mt1);
    glow(dx,dy,11,'rgba(53,224,255,.4)',.55);
  }
}

/* ---------- враги ---------- */
function drawFoe(f){
  const X=Math.round(f.x-cam.x),Y=Math.round(f.y),cx=X+f.w/2;
  const hit=f.hitT>0&&(tick>>1)%2;
  const base=hit?P.w:f.def.col;
  const ph=f.anim;
  switch(f.type){
    case 'runner':{
      const s1=Math.sin(ph),s2=Math.sin(ph+3.14);
      const A=jointChain(cx,f.y-f.y+Y+24,s1*.6*f.face,7,Math.max(0,-Math.cos(ph))*.9,7);
      const B=jointChain(cx,Y+24,s2*.6*f.face,7,Math.max(0,Math.cos(ph))*.9,7);
      limb(cx,Y+24,B.kx,B.ky,5,P.gr5,P.gr4,P.n,P.n);
      limb(B.kx,B.ky,B.fx,B.fy,4,P.gr5,P.gr4,P.n,P.n);
      px(B.fx-3,B.fy,7,3,P.br5);
      limb(cx,Y+10,cx,Y+25,10,base,P.gr2,P.gr5,P.n);
      box(cx-5,Y+12,10,8,P.br4,P.n); px(cx-4,Y+13,8,1,P.br3);
      ellO(cx+f.face,Y+5,5.5,6,P.sk3,P.n);
      ell(cx+f.face,Y+2,6,3.5,P.rd3);
      px(cx+f.face*3,Y+5,2,1,P.rd1);
      line(cx,Y+15,cx+f.face*13,Y+16,P.mt3,3);
      limb(cx,Y+24,A.kx,A.ky,6,P.gr4,P.gr3,P.n,P.n);
      limb(A.kx,A.ky,A.fx,A.fy,5,P.gr4,P.gr3,P.n,P.n);
      px(A.fx-3,A.fy,7,3,P.br5);
      break;
    }
    case 'crawler':{
      ellO(cx,Y+10,13,8,base,P.n);
      ell(cx-2,Y+7,8,4,P.pu2);
      for(let i=-3;i<=3;i++){
        const s=Math.sin(ph*2+i)*3;
        line(cx+i*4,Y+12,cx+i*5+s,Y+18,P.n,2);
        line(cx+i*4,Y+12,cx+i*5+s,Y+17,P.pu4,1);
      }
      px(cx+f.face*7,Y+7,3,2,P.rd2); px(cx+f.face*4,Y+9,2,2,P.rd1);
      glow(cx+f.face*6,Y+8,8,'rgba(255,74,61,.35)',.5);
      break;
    }
    case 'shooter': case 'grenadier':{
      limb(cx-3,Y+24,cx-4,Y+37,5,P.d3,P.g2,P.n,P.n);
      limb(cx+3,Y+24,cx+4,Y+37,5,P.d3,P.g2,P.n,P.n);
      px(cx-7,Y+36,7,3,P.n); px(cx+1,Y+36,7,3,P.n);
      limb(cx,Y+10,cx,Y+25,11,base,P.g3,P.d2,P.n);
      box(cx-6,Y+12,12,9,f.type==='shooter'?P.br4:P.rd4,P.n);
      px(cx-5,Y+13,10,1,P.br3);
      ellO(cx,Y+5,6,6,P.sk3,P.n);
      ell(cx,Y+2,6.5,3.5,f.type==='shooter'?P.br5:P.rd5);
      const a=player?Math.atan2(player.y+16-(Y+15),player.x+11-cx):0;
      line(cx,Y+15,cx+Math.cos(a)*16,Y+15+Math.sin(a)*16,P.n,5);
      line(cx,Y+15,cx+Math.cos(a)*16,Y+15+Math.sin(a)*16,P.mt3,3);
      px(cx+f.face*3,Y+5,2,1,P.yl2);
      break;
    }
    case 'turret':{
      box(X,Y+8,28,16,P.mt4,P.n); px(X+1,Y+9,26,3,P.mt2);
      px(X+2,Y+20,24,2,P.mt5);
      ellO(cx,Y+9,10,7,P.mt3,P.n); ell(cx-2,Y+7,6,4,P.mt2);
      const a=f.ang||0;
      line(cx,Y+9,cx+Math.cos(a)*19,Y+9+Math.sin(a)*19,P.n,7);
      line(cx,Y+9,cx+Math.cos(a)*19,Y+9+Math.sin(a)*19,P.mt2,5);
      line(cx,Y+8,cx+Math.cos(a)*17,Y+8+Math.sin(a)*17,P.mt1,2);
      px(cx-2,Y+7,4,3,P.rd2); glow(cx,Y+8,10,'rgba(255,74,61,.4)',.55);
      break;
    }
    case 'flyer':{
      const w=Math.sin(tick*.3)*5;
      ellO(cx,Y+8,13,7,base,P.n); ell(cx-2,Y+6,8,4,P.pu1);
      tri(cx-20,Y+3+w,14,7,P.pu3,-1); tri(cx+7,Y+3-w,14,7,P.pu3,-1);
      px(cx-3,Y+6,6,3,P.cy2); glow(cx,Y+8,15,'rgba(162,75,255,.35)',.55);
      px(cx-1,Y+13,3,3,P.rd2);
      break;
    }
    case 'jumper':{
      const t=f.onGround?0:1;
      limb(cx-3,Y+16,cx-7,Y+29-t*5,5,base,P.or1,P.d2,P.n);
      limb(cx+3,Y+16,cx+7,Y+29-t*5,5,base,P.or1,P.d2,P.n);
      ellO(cx,Y+11,10,10,base,P.n); ell(cx-2,Y+8,6,5,P.or1);
      px(cx-5,Y+8,3,3,P.yl2); px(cx+2,Y+8,3,3,P.yl2);
      px(cx-4,Y+16,8,2,P.rd4);
      break;
    }
    case 'pod':{
      ellO(cx,Y+9,12,9,P.cy4,P.n);
      px(cx-7,Y+5,14,8,P.cy1); px(cx-7,Y+5,14,2,P.w);
      txt('?',cx-2,Y+6,P.bl5,1);
      glow(cx,Y+9,18,'rgba(53,224,255,.45)',.6);
      break;
    }
  }
  if(f.hp<f.maxhp){px(X,Y-5,f.w,3,P.n);px(X,Y-5,Math.round(f.w*f.hp/f.maxhp),3,P.rd2);}
}

/* ---------- боссы ---------- */
function drawBoss(){
  const b=boss; if(!b)return;
  const X=Math.round(b.x-cam.x), Y=Math.round(b.y);
  const hit=b.hitT>0&&(tick>>1)%2;
  const tele=b.st==='tele'&&(tick>>2)%2;
  const id=b.def.id;

  if(id==='dog'){
    const body=hit?P.w:(tele?P.or1:P.fur2), dark=P.fur3, lite=P.fur1, deep=P.fur4;
    let hx=X-b.face*b.w*.42, hy=Y-b.h*.5;
    for(let i=0;i<b.tail.length;i++){
      const t=b.tail[i],tx=t.x-cam.x,ty=t.y;
      line(hx,hy,tx,ty,deep,9-i); line(hx,hy,tx,ty,body,7-i);
      line(hx,hy-1,tx,ty-1,lite,Math.max(1,4-i)); hx=tx;hy=ty;
    }
    if(b.atk==='tail'&&b.st==='act'){
      const sw=Math.sin(b.swing*3.1);
      const ex=X-b.face*(b.w*.5+46*Math.abs(sw));
      line(X-b.face*b.w*.4,Y-14,ex,Y-10,deep,12);
      line(X-b.face*b.w*.4,Y-14,ex,Y-10,lite,8);
      glow(ex,Y-10,20,'rgba(255,163,42,.5)',.6);
    }
    for(let i=0;i<4;i++){
      const lx=X-44+i*29, s=Math.sin(b.anim*2+i)*4;
      const back=i<2;
      limb(lx,Y-34,lx+s,Y-6,back?8:10,back?dark:body,lite,deep,P.n);
      px(lx+s-7,Y-6,15,6,deep); px(lx+s-6,Y-5,13,2,dark);
      for(let k=0;k<3;k++)px(lx+s-5+k*4,Y-1,2,2,P.n);
    }
    ellO(X,Y-b.h*.52,b.w*.45,b.h*.36,body,P.n);
    ell(X-8,Y-b.h*.62,b.w*.35,b.h*.24,lite);
    dith(X-46,Y-b.h*.44,92,20,body,dark,0);
    for(let i=0;i<7;i++){const rx=X-40+i*13;
      line(rx,Y-b.h*.72,rx+4,Y-b.h*.5,dark,1);}
    ell(X,Y-b.h*.30,b.w*.34,b.h*.14,deep);
    const hxx=X+b.face*b.w*.40, hyy=Y-b.h*.74;
    ellO(hxx,hyy,23,19,body,P.n);
    ell(hxx-b.face*4,hyy-5,15,11,lite);
    ellO(hxx+b.face*17,hyy+7,13,9,lite,P.n);
    px(hxx+b.face*26,hyy+5,6,5,P.n);
    ell(hxx+b.face*27,hyy+6,3,2,P.mt5);
    tri(hxx-b.face*14,hyy-24,12,18,dark,1);
    tri(hxx-b.face*12,hyy-20,7,12,P.rd4,1);
    tri(hxx+b.face*4,hyy-25,11,17,dark,1);
    const eg=(b.st==='tele'&&b.atk==='fireball')?1:.5;
    px(hxx+b.face*5,hyy-4,6,4,P.rd2); px(hxx+b.face*6,hyy-3,3,2,P.yl1);
    glow(hxx+b.face*8,hyy-2,13,'rgba(255,74,61,'+eg+')',.85);
    px(hxx+b.face*2,hyy-9,9,2,dark);
    if(b.st==='act'&&b.atk==='fireball'){
      ell(hxx+b.face*22,hyy+10,10,7,P.rd5);
      ell(hxx+b.face*22,hyy+10,6,4,P.fl3);
      glow(hxx+b.face*26,hyy+10,22,'rgba(255,106,26,.85)',.85);
    } else {
      px(hxx+b.face*13,hyy+12,15,3,P.n);
      for(let i=0;i<5;i++)tri(hxx+b.face*(8+i*3),hyy+12,3,5,P.w,-1);
      for(let i=0;i<3;i++)tri(hxx+b.face*(11+i*4),hyy+8,3,4,P.w,1);
    }
    for(let i=0;i<4;i++)line(hxx+b.face*20,hyy+2+i*2,hxx+b.face*32,hyy-2+i*3,P.n,1);
  }

  if(id==='cat'){
    const body=hit?P.w:(tele?P.pu1:P.cat2), dark=P.cat3, lite=P.cat1, deep=P.cat4;
    let hx=X-b.face*b.w*.44, hy=Y-b.h*.55;
    for(let i=0;i<b.tail.length;i++){
      const t=b.tail[i],tx=t.x-cam.x,ty=t.y-8;
      line(hx,hy,tx,ty,deep,8-i); line(hx,hy,tx,ty,body,6-i);
      line(hx,hy-1,tx,ty-1,lite,Math.max(1,3-i)); hx=tx;hy=ty;
    }
    for(let i=0;i<4;i++){
      const lx=X-46+i*30,s=Math.sin(b.anim*2.2+i)*4,back=i<2;
      limb(lx,Y-30,lx+s,Y-4,back?7:9,back?dark:body,lite,deep,P.n);
      px(lx+s-6,Y-4,13,5,deep);
      if(b.atk==='claw'&&b.st==='act'&&i>=2){
        const reach=Math.sin(Math.min(1,b.clawT)*3.14)*60;
        for(let k=-1;k<=1;k++){
          line(X+b.face*(b.w*.4),Y-b.h*.45+k*7,X+b.face*(b.w*.4+reach),Y-b.h*.45+k*11,P.n,3);
          line(X+b.face*(b.w*.4),Y-b.h*.45+k*7,X+b.face*(b.w*.4+reach),Y-b.h*.45+k*11,P.w,2);
        }
        glow(X+b.face*(b.w*.4+reach),Y-b.h*.45,22,'rgba(255,255,255,.4)',.6);
      }
    }
    ellO(X,Y-b.h*.55,b.w*.47,b.h*.32,body,P.n);
    ell(X-6,Y-b.h*.66,b.w*.36,b.h*.20,lite);
    dith(X-50,Y-b.h*.44,100,18,body,dark,0);
    for(let i=0;i<6;i++)ell(X-38+i*16,Y-b.h*.58,4,3,dark);
    const hxx=X+b.face*b.w*.42,hyy=Y-b.h*.80;
    ellO(hxx,hyy,20,17,body,P.n);
    ell(hxx-b.face*3,hyy-4,13,10,lite);
    tri(hxx-b.face*15,hyy-24,13,19,dark,1);
    tri(hxx-b.face*13,hyy-19,7,12,P.rd4,1);
    tri(hxx+b.face*5,hyy-25,12,18,dark,1);
    tri(hxx+b.face*7,hyy-20,6,11,P.rd4,1);
    const gl=b.eyeGlow||((b.st==='tele'&&b.atk==='eyebeam')?.9:.4);
    ell(hxx+b.face*3,hyy-2,4,3,P.cy2); ell(hxx+b.face*12,hyy-2,4,3,P.cy2);
    px(hxx+b.face*3,hyy-3,2,2,P.w); px(hxx+b.face*12,hyy-3,2,2,P.w);
    glow(hxx+b.face*8,hyy,20,'rgba(53,224,255,'+gl+')',.9);
    tri(hxx+b.face*17,hyy+6,5,4,P.rd1,-1);
    px(hxx+b.face*14,hyy+9,8,2,P.n);
    for(let i=-1;i<2;i++){
      line(hxx+b.face*16,hyy+7+i*3,hxx+b.face*34,hyy+4+i*6,P.w,1);
      line(hxx-b.face*10,hyy+7+i*3,hxx-b.face*24,hyy+5+i*5,P.mt1,1);
    }
    if(b.atk==='eyebeam'&&b.st==='act'){
      const a=b.beamA+Math.sin(b.beamT*2.2)*.5;
      for(let d=20;d<440;d+=4){
        const bx=hxx+Math.cos(a)*d,by=hyy+Math.sin(a)*d;
        px(bx-3,by-3,6,6,d%12<6?P.cy1:P.cy2);
      }
      glow(hxx,hyy,30,'rgba(53,224,255,.7)',.85);
    }
  }

  if(id==='spider'){
    const body=hit?P.w:(tele?P.rd2:'#3a1a52'), dark='#22103a', lite=P.pu3, deep='#160a26';
    for(let i=0;i<8;i++){
      const side=i<4?-1:1,k=i%4;
      const bx=X+side*20, by=Y-b.h*.55;
      const ext=b.legs[i].ext||0;
      const kneeX=bx+side*(42+k*10), kneeY=by-34+Math.sin(b.anim*1.6+i)*5;
      const footX=bx+side*(64+k*15)+(k-1.5)*8, footY=Y+ext*6;
      limb(bx,by,kneeX,kneeY,7,dark,body,deep,P.n);
      limb(kneeX,kneeY,footX,footY,6,dark,body,deep,P.n);
      line(kneeX,kneeY-1,footX,footY-1,lite,2);
      tri(footX-3,footY-4,6,7,P.n,-1);
      if(ext>.3)glow(footX,footY,14,'rgba(255,74,61,.5)',.65);
    }
    ellO(X-b.face*24,Y-b.h*.62,b.w*.34,b.h*.38,body,P.n);
    ell(X-b.face*27,Y-b.h*.72,b.w*.24,b.h*.24,lite);
    for(let i=0;i<4;i++){
      ell(X-b.face*(20+i*9),Y-b.h*.62+i*5,6-i,4-i,P.rd3);
      ell(X-b.face*(20+i*9),Y-b.h*.62+i*5,3,2,P.rd4);
    }
    dith(X-b.face*46,Y-b.h*.5,60,20,body,dark,0);
    ellO(X+b.face*20,Y-b.h*.52,b.w*.26,b.h*.28,body,P.n);
    ell(X+b.face*23,Y-b.h*.60,b.w*.18,b.h*.18,lite);
    const eg=b.phase>=3?P.rd2:P.rd1;
    for(let i=0;i<8;i++){
      const ex=X+b.face*(28+(i%4)*6), ey=Y-b.h*.66+((i/4)|0)*7;
      ell(ex,ey,2,2,eg); px(ex,ey-1,1,1,P.w);
    }
    glow(X+b.face*34,Y-b.h*.62,26,b.phase>=3?'rgba(255,74,61,.7)':'rgba(255,154,134,.4)',.85);
    tri(X+b.face*36,Y-b.h*.42,6,12,P.w,-1);
    tri(X+b.face*44,Y-b.h*.42,6,12,P.w,-1);
    tri(X+b.face*36,Y-b.h*.42,3,8,P.mt1,-1);
    if(b.st==='act'&&b.atk==='poison')glow(X+b.face*42,Y-b.h*.40,20,'rgba(141,255,74,.6)',.75);
    if(b.ceil)for(let i=0;i<9;i++)line(X-84+i*21,0,X,Y-b.h,'rgba(255,255,255,.22)',1);
  }

  const bw=280,bx=(W-bw)/2,by=H-18;
  px(bx-3,by-3,bw+6,12,P.n); px(bx-2,by-2,bw+4,10,P.d1);
  const r=clamp(b.hp/b.maxhp,0,1);
  for(let i=0;i<bw*r;i++){
    const c=r>.6?P.rd2:r>.3?P.or2:P.yl2;
    px(bx+i,by,1,8,c); if(i%3===0)px(bx+i,by,1,3,P.rd1);
  }
  txtCSh(b.def.name+'  ·  ФАЗА '+b.phase,W/2,by-12,P.w,1);
  if(bossIntro>0){
    const a=Math.min(1,(150-bossIntro)/25);
    g.globalAlpha=a;
    px(0,96,W,64,'rgba(7,10,16,.86)');
    px(0,96,W,2,P.rd2); px(0,158,W,2,P.rd2);
    txtCSh('ВНИМАНИЕ',W/2,102,P.rd2,3);
    txtCSh(b.def.name,W/2,128,P.yl2,2);
    txtCSh(b.def.sub,W/2,146,P.g4,1);
    g.globalAlpha=1;
  }
}

/* ---------- фон, пули, предметы, частицы ---------- */
function drawSky(){
  vgrad(0,0,W,H,theme.sky[0],theme.sky[1]);
  if(lvl.theme==='lair'){
    for(let i=0;i<40;i++){const x=(i*61+((tick*.2)|0))%W,y=(i*37)%150;
      px(x,y,1,1,i%4?P.pu3:P.pu2);}
  } else if(lvl.theme==='cliff'){
    ell(360,42,20,20,P.yl1); glow(360,42,44,'rgba(255,246,168,.32)',.5);
    for(let i=0;i<7;i++){const x=((i*97-tick*.15)%560+560)%560-50;
      ell(x,34+i*10,26,7,'rgba(255,255,255,.16)');}
  } else {
    ell(372,38,17,17,P.yl1); glow(372,38,40,'rgba(255,240,170,.28)',.45);
    for(let i=0;i<5;i++){const x=((i*113-tick*.1)%560+560)%560-50;
      ell(x,30+i*12,24,6,'rgba(255,255,255,.13)');}
  }
}
function drawParallax(){
  const f=-(cam.x*.18)%896, m=-(cam.x*.42)%896;
  g.drawImage(farCv,f,0); g.drawImage(farCv,f+896,0);
  g.drawImage(midCv,m,0); g.drawImage(midCv,m+896,0);
}
function drawTiles(){
  const sx=clamp(cam.x|0,0,lvl.w*TS-W);
  g.drawImage(tileCv,sx,0,W,H,0,0,W,H);
  for(let x=Math.floor(sx/TS);x<Math.floor(sx/TS)+30;x++)
    for(let y=13;y<16;y++)if(T(x,y)==='~'){
      const X=x*TS-sx,Y=y*TS;
      px(X,Y+((tick>>3)%2),TS,1,P.cy1);
      if((x+((tick>>4)|0))%3===0)px(X+4,Y+4,6,1,P.cy2);
    }
}
function drawBullets(){
  bullets.forEach(b=>{
    const X=b.x-cam.x,Y=b.y;
    if(b.kind==='laser'){
      const a=Math.atan2(b.vy,b.vx);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,P.cy4,6);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,P.cy2,4);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,P.cy1,2);
      glow(X,Y,10,'rgba(53,224,255,.6)',.65);
    } else if(b.kind==='fire'){
      ell(X,Y,6,6,P.fl4); ell(X,Y,4.5,4.5,P.fl3); ell(X,Y,3,3,P.fl2); ell(X,Y,1.5,1.5,P.fl1);
      glow(X,Y,14,'rgba(255,106,26,.55)',.65);
    } else if(b.kind==='homing'){
      ell(X,Y,4,3,P.pu2); ell(X,Y,2,2,P.pu1); px(X-1,Y-1,2,2,P.w);
      glow(X,Y,9,'rgba(217,179,255,.5)',.55);
    } else {
      const a=Math.atan2(b.vy,b.vx);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,b.col,3);
      line(X-Math.cos(a)*b.len*.6,Y-Math.sin(a)*b.len*.6,X,Y,P.w,1);
    }
  });
  ebullets.forEach(b=>{
    const X=b.x-cam.x,Y=b.y;
    if(b.fire){ell(X,Y,b.r+2,b.r+2,P.fl4);ell(X,Y,b.r,b.r,P.fl3);ell(X,Y,b.r-2,b.r-2,P.fl2);ell(X,Y,2,2,P.w);
      glow(X,Y,b.r*3.4,'rgba(255,106,26,.5)',.65);}
    else if(b.web){for(let i=0;i<6;i++)line(X-b.r,Y-b.r+i*2,X+b.r,Y-b.r+i*2,'rgba(255,255,255,.8)',1);
      line(X-b.r,Y-b.r,X+b.r,Y+b.r,'rgba(255,255,255,.8)',1);
      line(X+b.r,Y-b.r,X-b.r,Y+b.r,'rgba(255,255,255,.8)',1);}
    else {ellO(X,Y,b.r+1,b.r+1,b.col,P.n);ell(X,Y,b.r-1,b.r-1,P.w);
      glow(X,Y,b.r*2.6,'rgba(255,163,42,.35)',.45);}
  });
}
function drawItems(){
  items.forEach(it=>{
    const X=it.x-cam.x,Y=it.y+Math.sin(it.t*.12)*2;
    if(it.life<120&&(tick>>2)%2)return;
    if(it.kind==='heal'){ellO(X,Y,9,9,P.rd3,P.n);px(X-2,Y-5,4,10,P.w);px(X-5,Y-2,10,4,P.w);}
    else if(it.kind==='spec'){ellO(X,Y,9,9,P.cy4,P.n);txt('S',X-2,Y-3,P.cy1,1);}
    else {box(X-10,Y-9,20,18,P.d2,P.n);px(X-9,Y-8,18,3,P.g2);
      txt(WEAPONS[it.kind].key,X-2,Y-3,WEAPONS[it.kind].col,1);}
    glow(X,Y,17,'rgba(255,212,0,.28)',.55);
  });
}
function drawParts(){
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.life--;
    if(p.life<=0){parts.splice(i,1);continue;}
    const a=p.life/p.max;
    if(p.ring){g.globalAlpha=a;const r=p.r+(1-a)*p.rr;
      g.strokeStyle=p.c;g.lineWidth=2;g.beginPath();g.arc(p.x-cam.x,p.y,r,0,6.283);g.stroke();g.globalAlpha=1;continue;}
    if(p.puddle){g.globalAlpha=Math.min(.6,a);ell(p.x-cam.x,p.y,p.r,4,p.c);g.globalAlpha=1;
      if(player&&player.inv<=0&&Math.abs(player.x+11-p.x)<p.r&&player.y+player.h>p.y-5)hurtPlayer(1);
      continue;}
    p.vy+=p.g||0;p.x+=p.vx;p.y+=p.vy;
    g.globalAlpha=Math.min(1,a*1.4);px(p.x-cam.x,p.y,p.s||1,p.s||1,p.c);g.globalAlpha=1;
  }
  for(let i=texts.length-1;i>=0;i--){
    const t=texts[i];t.life--;t.y-=.42;
    if(t.life<=0){texts.splice(i,1);continue;}
    g.globalAlpha=Math.min(1,t.life/24);txtCSh(t.s,t.x-cam.x,t.y,t.c,1);g.globalAlpha=1;
  }
}
function drawWeather(){
  if(!theme.weather)return;
  if(theme.weather==='rain'){
    for(let i=0;i<90;i++){const x=(i*53+tick*8)%560-50,y=(i*37+tick*13)%290-20;
      line(x,y,x-2,y+9,'rgba(180,220,255,.32)',1);}
  } else {
    for(let i=0;i<44;i++){const x=(i*71+Math.sin(tick*.02+i)*16)%470-10,y=(H-((tick*1.2+i*29)%300));
      px(x,y,1,1,i%3?P.or2:P.yl2);}
  }
  if(theme.fog){g.fillStyle=theme.fog;g.fillRect(0,0,W,H);}
}
function drawHUD(){
  const p=player;
  px(0,0,W,20,'rgba(7,10,16,.76)'); px(0,20,W,1,P.d3);
  txtSh('СЧЁТ',5,2,P.g3,1); txtSh(String(score).padStart(7,'0'),5,11,P.w,1);
  txtSh('РЕКОРД',72,2,P.g3,1); txtSh(String(Math.max(hi,score)).padStart(7,'0'),72,11,P.yl2,1);
  if(p){
    txtSh(p.ch.name,160,2,P.cy2,1);
    for(let i=0;i<p.maxhp;i++){px(160+i*9,11,7,6,P.n);px(160+i*9+1,12,5,4,i<p.hp?P.rd2:P.d3);}
    const w=WEAPONS[p.weapon];
    box(258,2,17,16,P.d2,P.n);px(259,3,15,2,P.g2);txt(w.key,263,7,w.col,1);
    txtSh(w.name,280,2,P.g4,1);
    px(280,12,80,5,P.n);px(281,13,Math.round(78*p.spec/100),3,p.spec>=100?P.cy2:P.g2);
    if(p.spec>=100&&(tick>>3)%2)txtSh('ПРИЁМ ГОТОВ',280,11,P.cy2,1);
  }
  txtSh('ЖИЗНИ ×'+lives,384,2,P.w,1);
  txtSh('ЗОНА '+(stageIdx+1),384,11,P.g3,1);
  if(comboN>1&&comboT>0)txtCSh('КОМБО ×'+comboN,W/2,24,P.or2,1);
}

/* ---------- экраны ---------- */
function wrapText(s,x,y,maxw,col,sc,lh){
  const words=String(s).split(' ');let ln='',yy=y;
  words.forEach(w=>{const test=ln?ln+' '+w:w;
    if(tw(test,sc)>maxw){txt(ln,x,yy,col,sc);ln=w;yy+=lh;} else ln=test;});
  if(ln)txt(ln,x,yy,col,sc);
}
function drawTitle(){
  vgrad(0,0,W,H,'#101a30','#050710');
  for(let i=0;i<70;i++){const x=(i*67+tick*.4)%W,y=(i*41)%H;px(x,y,1,1,i%5?P.d3:P.g2);}
  const t=Math.sin(tick*.04)*3;
  txtCSh('BALBES',W/2,30+t,P.rd2,6);
  txtCSh('FORCE',W/2,80+t,P.yl2,6);
  txtCSh('RUN & GUN · 16-BIT',W/2,128,P.cy2,1);
  if((tick>>4)%2)txtCSh('НАЖМИ ОГОНЬ',W/2,158,P.w,2);
  txtCSh('ANTONY · ARTYOM · DEN · DIMKA',W/2,190,P.g3,1);
  txtCSh('РЕКОРД '+String(hi).padStart(7,'0'),W/2,206,P.yl3,1);
  txtCSh('Z ОГОНЬ   X ПРЫЖОК   C ПРИЁМ',W/2,226,P.g2,1);
  txtCSh('КЕНДРИК · АФИНА · АРАХНА',W/2,240,P.d3,1);
}
function drawSelect(){
  vgrad(0,0,W,H,'#141d33','#070a14');
  txtCSh('ВЫБЕРИ БОЙЦА',W/2,6,P.w,2);
  const cw=100,gap=8,total=CHARS.length*cw+(CHARS.length-1)*gap;
  const sx=(W-total)/2;
  CHARS.forEach((c,i)=>{
    const X=sx+i*(cw+gap),Y=24,on=i===sel;
    box(X,Y,cw,84,on?P.d3:P.d1,on?P.cy2:P.n);
    if(on){px(X,Y,cw,2,P.cy2);glow(X+cw/2,Y+44,50,'rgba(53,224,255,.2)',.6);}
    const fake={ch:c,x:X+cw/2-BODY_W/2+cam.x,y:Y+22,w:BODY_W,h:STAND_H,face:1,onGround:true,
      vx:0,anim:0,breath:tick*.05,prone:false,moving:false,
      aim:{x:1,y:0,raw:{x:1,y:0}},inv:0,muzzle:0,recoil:0,dashT:0,webT:0,drone:null,weapon:c.weapon};
    drawSoldier(fake,true);
    txtCSh(c.name,X+cw/2,Y+70,on?P.yl2:P.g3,1);
  });
  const c=CHARS[sel];
  box(10,116,W-20,66,P.d1,P.n);
  px(10,116,W-20,1,c.pal.acc);
  txtSh(c.name+' — '+c.role,16,121,c.pal.acc,1);
  const bars=[['БРОНЯ',c.hp/6],['СКОРОСТЬ',c.speed/2.3],['ПРЫЖОК',c.jump/6.6],['ТЕМП',c.rate/1.4],['УРОН',c.dmg/1.5]];
  bars.forEach((b,i)=>{
    const X=16+(i%3)*142, Y=134+((i/3)|0)*14;
    txt(b[0],X,Y,P.g3,1);
    px(X+58,Y+1,60,6,P.n);px(X+59,Y+2,Math.round(58*clamp(b[1],0,1)),4,c.pal.acc);
  });
  txtSh('ПРИЁМ: '+c.specName+' — '+c.specDesc,16,164,P.cy2,1);
  const abil=[c.dbl?'ДВОЙНОЙ ПРЫЖОК':null,c.dash?'РЫВОК':null,c.hover?'ПАРЕНИЕ':null].filter(Boolean).join(' · ');
  txtSh(abil||'БАЗОВЫЙ НАБОР',16,175,P.yl3,1);
  wrapText(c.desc,16,190,W-32,P.g4,1,10);
  if((tick>>4)%2)txtCSh('ОГОНЬ — В БОЙ',W/2,222,P.w,1);
  txtCSh('СТРЕЛКИ ВЛЕВО / ВПРАВО — ВЫБОР',W/2,238,P.g2,1);
}
function drawIntro(){
  px(0,0,W,H,P.n);
  const a=Math.min(1,introT/20); g.globalAlpha=a;
  txtCSh(lvl.name,W/2,92,P.yl2,4);
  txtCSh(lvl.sub,W/2,128,P.w,1);
  txtCSh(CHARS[sel].name+' — '+CHARS[sel].role,W/2,152,P.cy2,1);
  txtCSh('ЦЕЛЬ: '+BOSSES[lvl.boss].name,W/2,172,P.rd2,1);
  g.globalAlpha=1;
}
function drawGameOver(){
  px(0,0,W,H,'rgba(8,4,4,.88)');
  txtCSh('ИГРА ОКОНЧЕНА',W/2,84,P.rd2,3);
  txtCSh('СЧЁТ '+score,W/2,124,P.w,1);
  txtCSh('РЕКОРД '+Math.max(hi,score),W/2,140,P.yl2,1);
  if((tick>>4)%2)txtCSh('ОГОНЬ — ЗАНОВО',W/2,176,P.g4,1);
}
function drawVictory(){
  vgrad(0,0,W,H,'#1a1030','#050710');
  for(let i=0;i<80;i++){const x=(i*53+tick*1.4)%W,y=(i*37+tick*.7)%H;
    px(x,y,2,2,[P.yl2,P.cy2,P.rd2,P.gr1][i%4]);}
  txtCSh('АРАХНА ПОВЕРЖЕНА',W/2,54,P.yl2,2);
  txtCSh('ДВОР СПАСЁН',W/2,82,P.w,2);
  txtCSh('ИТОГОВЫЙ СЧЁТ',W/2,116,P.g3,1);
  txtCSh(String(score).padStart(7,'0'),W/2,132,P.cy2,3);
  txtCSh('УНИЧТОЖЕНО ВРАГОВ: '+kills,W/2,172,P.g4,1);
  txtCSh('БОЕЦ: '+CHARS[sel].name,W/2,188,P.g4,1);
  if((tick>>4)%2)txtCSh('ОГОНЬ — В МЕНЮ',W/2,214,P.w,1);
}
function drawPause(){
  px(0,0,W,H,'rgba(6,9,16,.8)');
  txtCSh('ПАУЗА',W/2,96,P.cy2,3);
  txtCSh('СТАРТ — ПРОДОЛЖИТЬ',W/2,134,P.g4,1);
  txtCSh('Z ОГОНЬ · X ПРЫЖОК · C ПРИЁМ',W/2,154,P.g2,1);
  txtCSh('ВНИЗ — ЛЁЖА · ВНИЗ+X — СПРЫГНУТЬ',W/2,168,P.g2,1);
}

/* ---------- загрузка зоны ---------- */
function loadStage(i){
  stageIdx=i; lvl={...LEVELS[i],rows:LEVELS[i].rows.slice()}; theme=THEMES[lvl.theme];
  buildTiles(); buildParallax();
  bullets=[];ebullets=[];foes=[];items=[];parts=[];texts=[];boss=null;
  cam={x:0,lock:false,shake:0}; bossIntro=0;stageClearT=0;comboN=0;comboT=0;
  const ch=CHARS[sel];
  const keepSpec=player?player.spec:0, keepW=player?player.weapon:ch.weapon;
  player=makePlayer(ch); player.spec=keepSpec; player.weapon=keepW;
  for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++){
    const c=T(x,y), X=x*TS, Y=(y+1)*TS;
    if(c==='P'){player.x=X;player.y=GROUND_Y-STAND_H;}
    else if(c==='e')spawnFoe('runner',X,Y);
    else if(c==='s')spawnFoe('shooter',X,Y);
    else if(c==='t')spawnFoe('turret',X,Y);
    else if(c==='f')spawnFoe('flyer',X,Y);
    else if(c==='j')spawnFoe('jumper',X,Y);
    else if(c==='g')spawnFoe('grenadier',X,Y);
    else if(c==='c')spawnFoe('crawler',X,Y);
    else if(c==='o')spawnFoe('pod',X,Y);
  }
  foes.forEach(f=>{if(f.type==='flyer'||f.type==='pod')f.base=f.y+f.h;});
  introT=0;state='intro';SND.music(theme.music);
}
function startGame(){lives=3;score=0;kills=0;player=null;loadStage(0);}

/* ---------- цикл ---------- */
function update(){
  tick++; IN.poll(); SND.tickMusic();
  if(comboT>0){comboT--;if(comboT===0)comboN=0;}
  if(flash>0)flash--;
  if(cam.shake>0)cam.shake*=.86;

  if(state==='title'){ if(IN.edge.fire||IN.edge.start){SND.play('ok');state='select';SND.music('menu');} return; }
  if(state==='select'){
    if(IN.edge.left){sel=(sel+CHARS.length-1)%CHARS.length;SND.play('ui');}
    if(IN.edge.right){sel=(sel+1)%CHARS.length;SND.play('ui');}
    if(IN.edge.fire||IN.edge.start){SND.play('ok');startGame();}
    return;
  }
  if(state==='intro'){introT++;if(introT>120||IN.edge.fire){state='play';SND.music(theme.music);}return;}
  if(state==='gameover'){if(IN.edge.fire||IN.edge.start){SND.play('ok');state='select';SND.music('menu');}return;}
  if(state==='victory'){if(IN.edge.fire||IN.edge.start){SND.play('ok');state='title';SND.music('menu');}return;}
  if(state!=='play')return;
  if(IN.edge.start){paused=!paused;SND.play('ui');}
  if(paused)return;

  updatePlayer(); updateFoes(); updateBullets(); updateItems(); updateBoss();

  const p=player;
  if(p){
    const arenaStart=(lvl.w-30)*TS;
    if(!cam.lock&&p.x>arenaStart&&!boss){spawnBoss(lvl.boss);cam.lock=true;}
    const target=cam.lock?(lvl.w*TS-W):clamp(p.x-W*.38,0,lvl.w*TS-W);
    cam.x=lerp(cam.x,target,cam.lock?.06:.14);
    cam.x=clamp(cam.x,0,lvl.w*TS-W);
    if(cam.lock)p.x=clamp(p.x,(lvl.w-30)*TS+4,lvl.w*TS-BODY_W-4);
  }
  if(p&&p.dead&&deadT>72){
    if(lives<=0){state='gameover';SND.play('dead');SND.music('menu');
      if(score>hi){hi=score;localStorage.setItem('bf_hi',String(hi));}}
    else {const kW=p.weapon,kS=p.spec;
      player=makePlayer(CHARS[sel]);player.weapon=kW;player.spec=kS;
      player.x=clamp(cam.x+50,20,lvl.w*TS-50);player.y=90;player.inv=115;deadT=0;}
  }
  if(stageClearT>0){
    stageClearT++;
    if(stageClearT>160){
      if(stageIdx>=LEVELS.length-1){state='victory';SND.play('win');SND.music('menu');
        if(score>hi){hi=score;localStorage.setItem('bf_hi',String(hi));}}
      else loadStage(stageIdx+1);
    }
  }
}
function render(){
  g.setTransform(1,0,0,1,0,0);
  const sh=cam.shake>.4?cam.shake:0;
  g.save(); if(sh)g.translate(Math.round(rnd(-sh,sh)),Math.round(rnd(-sh,sh)));
  if(state==='title')drawTitle();
  else if(state==='select')drawSelect();
  else if(state==='intro')drawIntro();
  else if(state==='gameover'){drawSky();drawParallax();drawTiles();drawGameOver();}
  else if(state==='victory')drawVictory();
  else {
    drawSky();drawParallax();drawTiles();drawItems();
    foes.forEach(drawFoe);
    if(boss)drawBoss();
    if(player&&!player.dead)drawSoldier(player,false);
    drawBullets();drawParts();drawWeather();drawHUD();
    if(stageClearT>0){
      px(0,100,W,50,'rgba(7,10,16,.84)');
      px(0,100,W,2,P.yl2);px(0,148,W,2,P.yl2);
      txtCSh('ЗОНА ЗАЧИЩЕНА',W/2,108,P.yl2,2);
      txtCSh('БОНУС '+BOSSES[lvl.boss].score,W/2,132,P.cy2,1);
    }
    if(paused)drawPause();
  }
  g.restore();
  if(flash>0){g.fillStyle='rgba(255,255,255,'+(flash/12)+')';g.fillRect(0,0,W,H);}
  vis.clearRect(0,0,W,H); vis.drawImage(buf,0,0,W,H);
}
let last=0,acc=0;
function loop(now){
  requestAnimationFrame(loop);
  if(!last)last=now;
  let dt=(now-last)/1000; last=now;
  if(dt>.25)dt=.25;
  acc+=dt;
  let guard=0;
  while(acc>=1/60&&guard<4){update();acc-=1/60;guard++;}
  render();
}

document.getElementById('bSound').addEventListener('click',e=>{
  SND.unlock();SND.set(!SND.get());e.currentTarget.classList.toggle('off',!SND.get());
  e.currentTarget.textContent=SND.get()?'🔊':'🔇';
});
document.getElementById('bPause').addEventListener('click',()=>{
  if(state==='play'){paused=!paused;SND.play('ui');}
});
document.getElementById('bFull').addEventListener('click',()=>{
  const el=document.documentElement;
  if(!document.fullscreenElement){(el.requestFullscreen||el.webkitRequestFullscreen||(()=>{})).call(el);}
  else document.exitFullscreen();
  setTimeout(fit,220);
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){SND.suspend();if(state==='play')paused=true;} else SND.resume();
});

IN.bindDom(document.getElementById('pad'));
SND.music('menu');
fit(); setTimeout(fit,120);
requestAnimationFrame(loop);
})();
