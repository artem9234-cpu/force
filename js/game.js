/* ============================================================
   BALBES FORCE — движок, физика, ИИ, боссы, рендер, состояния
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

/* ---------- масштаб ---------- */
function fit(){
  const s=document.getElementById('screen'), b=s.parentElement.getBoundingClientRect();
  const sc=Math.max(1,Math.min(b.width/W,(b.height)/H));
  const w=Math.floor(W*sc), h=Math.floor(H*sc);
  s.style.width=w+'px'; s.style.height=h+'px';
  cv.style.width=w+'px'; cv.style.height=h+'px';
}
window.addEventListener('resize',fit); window.addEventListener('orientationchange',fit);

/* ---------- состояние игры ---------- */
let state='title', sel=0, tick=0, paused=false;
let lvl=null, theme=null, tiles=null, tileCv=null, farCv=null, midCv=null;
let cam={x:0,y:0,lock:false,shake:0}, hitstop=0;
let player=null, bullets=[], ebullets=[], foes=[], items=[], parts=[], texts=[], boss=null;
let stageIdx=0, lives=3, score=0, hi=Number(localStorage.getItem('bf_hi')||0);
let stageClearT=0, deadT=0, winT=0, introT=0, flash=0, bossIntro=0;
let weather=[], kills=0, comboN=0, comboT=0;

/* ---------- утилиты мира ---------- */
const T=(cx,cy)=>(cx<0||cy<0||cx>=lvl.w||cy>=lvl.h)?'#':lvl.rows[cy][cx];
const solid=(cx,cy)=>T(cx,cy)==='#';
const plat =(cx,cy)=>T(cx,cy)==='=';
const hazard=(cx,cy)=>{const c=T(cx,cy);return c==='^'||c==='~';};

function buildTiles(){
  tileCv=document.createElement('canvas'); tileCv.width=lvl.w*TS; tileCv.height=H;
  const t=tileCv.getContext('2d'); const old=g; bind(t);
  for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++){
    const c=T(x,y), X=x*TS, Y=y*TS;
    if(c==='#'){
      const top=!solid(x,y-1);
      px(X,Y,TS,TS,theme.ground);
      dith(X,Y+4,TS,TS-4,theme.ground,theme.ground2,0);
      if(top){ px(X,Y,TS,4,theme.groundTop); dith(X,Y+2,TS,2,theme.groundTop,theme.groundTop2,0);
        px(X,Y,TS,1,P.w); for(let i=0;i<3;i++)px(X+2+i*5,Y-2,2,3,theme.groundTop2); }
      px(X,Y,1,TS,theme.ground2); px(X+TS-1,Y,1,TS,P.n);
      if((x*7+y*13)%5===0)px(X+4,Y+8,3,2,theme.ground2);
    } else if(c==='='){
      px(X,Y,TS,5,theme.plat); px(X,Y,TS,2,theme.platTop); px(X,Y,TS,1,P.w);
      px(X,Y+5,TS,1,P.n); px(X+2,Y+6,2,3,theme.plat); px(X+12,Y+6,2,3,theme.plat);
    } else if(c==='^'){
      for(let i=0;i<4;i++){tri(X+i*4,Y+6,4,10,P.mt2,1);tri(X+i*4+1,Y+8,2,8,P.mt1,1);}
      px(X,Y+15,TS,1,P.d2);
    } else if(c==='~'){
      px(X,Y,TS,TS,theme.water); dith(X,Y,TS,4,theme.water,theme.water2,0);
      px(X,Y+((tick>>3)%2?0:1),TS,1,P.cy1);
    } else if(c==='B'){
      box(X+1,Y+1,14,14,P.br2,P.br4); px(X+2,Y+2,12,2,P.br1);
      px(X+3,Y+6,10,1,P.br4); px(X+7,Y+2,2,12,P.br4);
      px(X+5,Y+8,6,4,P.yl3); txt('?',X+6,Y+7,P.yl1,1);
    }
  }
  bind(old);
}
function buildParallax(){
  farCv=document.createElement('canvas'); farCv.width=640; farCv.height=H;
  midCv=document.createElement('canvas'); midCv.width=640; midCv.height=H;
  let old=g;
  bind(farCv.getContext('2d'));
  for(let i=0;i<26;i++){
    const x=i*26+((i*37)%14), h=48+((i*53)%56);
    if(lvl.theme==='jungle'){
      tri(x,150-h,40,h,theme.far,1); tri(x+6,150-h+8,28,h-8,theme.far2,1);
      px(x+18,150-8,4,10,theme.far);
    } else if(lvl.theme==='cliff'){
      tri(x-8,160-h,54,h,theme.far,1); tri(x+2,160-h+14,34,h-14,theme.far2,1);
      tri(x+10,160-h+18,14,10,P.w,1);
    } else {
      tri(x,164-h,34,h,theme.far,1);
      for(let k=0;k<4;k++)ell(x+16,164-h+14+k*12,10-k,4,theme.far2);
    }
  }
  bind(midCv.getContext('2d'));
  for(let i=0;i<34;i++){
    const x=i*20+((i*29)%12), h=34+((i*41)%40);
    if(lvl.theme==='jungle'){
      px(x+8,184-h,4,h,theme.mid);
      ell(x+10,184-h,13,9,theme.mid); ell(x+7,184-h-3,8,5,theme.mid2);
    } else if(lvl.theme==='cliff'){
      tri(x-4,190-h,30,h,theme.mid,1); tri(x+2,190-h+8,18,h-8,theme.mid2,1);
    } else {
      px(x+7,190-h,5,h,theme.mid);
      ell(x+9,190-h,10,7,theme.mid2);
      for(let k=0;k<3;k++)line(x+9,190-h+k*8,x+9+(k%2?9:-9),190-h+k*8+7,theme.mid,1);
    }
  }
  bind(old);
}

/* ---------- частицы / текст ---------- */
function spark(x,y,n,col,pw){
  for(let i=0;i<n;i++){const a=rnd(0,6.283),s=rnd(.6,pw||3.2);
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.5,life:rnd(12,30),max:30,c:col,g:.12,s:1});}
}
function boom(x,y,r,col){
  for(let i=0;i<r;i++){const a=rnd(0,6.283),s=rnd(.8,4.4);
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:rnd(16,40),max:40,
      c:[P.fl1,P.fl2,P.fl3,P.rd2,P.mt2][ri(5)],g:.1,s:ri(2)+1});}
  parts.push({x,y,ring:true,r:2,rr:r*.9,life:14,max:14,c:col||P.fl1});
  cam.shake=Math.max(cam.shake,Math.min(9,r*.35));
}
function pop(x,y,s,c){texts.push({x,y,s:String(s),c:c||P.yl2,life:44});}

/* ---------- ИГРОК ---------- */
function makePlayer(ch){
  return {ch,x:40,y:150,vx:0,vy:0,w:12,h:28,face:1,onGround:false,
    hp:ch.hp,maxhp:ch.hp,inv:90,prone:false,aim:{x:1,y:0},
    jumps:0,coyote:0,buffer:0,jumpHeld:false,
    dashT:0,dashCD:0,hover:false,
    weapon:ch.weapon,cd:0,spec:0,specT:0,drone:null,
    anim:0,recoil:0,muzzle:0,dead:false,webT:0,blinkT:0};
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
  const py = p.prone ? p.y+p.h-6 : p.y+10;
  const ox = a.raw.x===0&&a.raw.y!==0 ? 0 : a.x*9;
  const oy = a.y*8;
  const bx=p.x+p.w/2+ox, by=py+oy;
  const dmg=w.dmg*p.ch.dmg;
  const mk=(vx,vy,extra)=>bullets.push(Object.assign({x:bx,y:by,vx,vy,dmg,kind:w.kind,col:w.col,
    len:w.len,life:110,pierce:w.kind==='laser',t:0,ox:bx,oy:by},extra||{}));
  if(w.kind==='spread'){
    for(let i=-2;i<=2;i++){
      const ang=Math.atan2(a.y,a.x)+i*.20;
      mk(Math.cos(ang)*w.spd,Math.sin(ang)*w.spd);
    }
    SND.play('spread');
  } else if(w.kind==='fire'){
    mk(a.x*w.spd,a.y*w.spd,{spin:rnd(0,6.28)}); SND.play('fire');
  } else if(w.kind==='laser'){
    mk(a.x*w.spd,a.y*w.spd); SND.play('laser');
  } else if(w.kind==='homing'){
    mk(a.x*w.spd,a.y*w.spd); mk(a.x*w.spd*.8,a.y*w.spd*.8-1); SND.play('homing');
  } else {
    mk(a.x*w.spd,a.y*w.spd); SND.play(p.weapon==='machine'?'mg':'shot');
  }
  p.muzzle=5; p.recoil=3;
  spark(bx,by,2,w.col,1.6);
}
function hurtPlayer(n){
  const p=player; if(!p||p.inv>0||p.dead||p.dashT>0)return;
  p.hp-=n; p.inv=100; cam.shake=7; flash=6; SND.play('hurt');
  spark(p.x+p.w/2,p.y+p.h/2,14,P.rd2,3.4);
  comboN=0;
  if(p.hp<=0){
    p.dead=true; deadT=0; lives--; boom(p.x+p.w/2,p.y+p.h/2,26,P.rd2); SND.play('boom');
  }
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
  if(p.blinkT>0)p.blinkT--;
  if(p.specT>0){p.specT--; if(p.specT===0)p.drone=null;}

  /* прицел и поза */
  p.aim=aimVec(p);
  p.prone = p.onGround && s.down && !s.up;
  if(s.left&&!s.right)p.face=-1; else if(s.right&&!s.left)p.face=1;

  /* рывок */
  if(p.dashT>0){
    p.dashT--; p.vx=p.face*(c.id==='den'?7.2:6.0); p.vy=0;
    if(p.dashT%2===0)parts.push({x:p.x+p.w/2,y:p.y+p.h/2,vx:0,vy:0,life:12,max:12,c:c.pal.acc,g:0,s:2});
    foes.forEach(f=>{if(!f.dead&&Math.abs(f.x+f.w/2-(p.x+p.w/2))<20&&Math.abs(f.y+f.h/2-(p.y+p.h/2))<24)damageFoe(f,3.2);});
    if(boss&&boss.hp>0&&Math.abs(boss.x-p.x)<boss.w*.6&&Math.abs(boss.y-p.y)<boss.h)damageBoss(2.4);
  } else {
    const spd=c.speed*(p.webT>0?.42:1)*(p.prone?0:1);
    if(s.left&&!s.right)p.vx=lerp(p.vx,-spd,.4);
    else if(s.right&&!s.left)p.vx=lerp(p.vx,spd,.4);
    else p.vx*=p.onGround?.62:.9;
  }

  /* прыжок */
  if(e.jump)p.buffer=8;
  if(p.buffer>0)p.buffer--;
  if(p.coyote>0)p.coyote--;
  const canDrop = p.onGround && s.down && e.jump && plat(Math.floor((p.x+p.w/2)/TS),Math.floor((p.y+p.h+2)/TS));
  if(canDrop){ p.y+=4; p.onGround=false; p.vy=1.2; p.buffer=0; SND.play('jump'); }
  else if(p.buffer>0){
    if(p.onGround||p.coyote>0){
      p.vy=-c.jump; p.onGround=false; p.jumps=1; p.buffer=0; p.coyote=0; SND.play('jump');
      spark(p.x+p.w/2,p.y+p.h,5,P.g4,1.6);
    } else if(c.dbl&&p.jumps<2){
      p.vy=-c.jump*.9; p.jumps=2; p.buffer=0; SND.play('djump');
      for(let i=0;i<8;i++)parts.push({x:p.x+p.w/2,y:p.y+p.h,vx:rnd(-2,2),vy:rnd(0,2),life:16,max:16,c:c.pal.acc,g:.05,s:1});
    } else if(c.dash&&c.id==='den'&&p.dashCD<=0){
      p.dashT=12; p.dashCD=42; p.buffer=0; SND.play('dash');
    }
  }
  if(!s.jump)p.jumpHeld=false;
  if(p.vy<0&&!s.jump)p.vy*=.86;

  /* парение */
  p.hover = c.hover && !p.onGround && s.jump && p.vy>0;
  let grav=.34;
  if(p.hover){grav=.055; p.vy=Math.min(p.vy,1.0);
    if(tick%3===0)parts.push({x:p.x+p.w/2+rnd(-5,5),y:p.y+p.h,vx:rnd(-.4,.4),vy:rnd(.4,1.2),life:14,max:14,c:P.pu1,g:0,s:1});}
  if(p.dashT<=0)p.vy=Math.min(p.vy+grav,9);

  /* наземный рывок Артыома */
  if(c.dash&&c.id==='artyom'&&e.spec&&p.spec>=100){/* handled below */}
  if(c.dash&&c.id==='artyom'&&IN.st.spec&&p.dashCD<=0&&p.onGround&&p.specT<=0&&p.spec<100){
    p.dashT=14;p.dashCD=54;SND.play('dash');
  }

  /* спецприём */
  if(e.spec&&p.spec>=100&&p.specT<=0){
    p.spec=0; SND.play('spec'); flash=5; cam.shake=6;
    if(c.spec==='burst'){p.specT=480;pop(p.x,p.y-14,'ШКВАЛ!',P.yl2);}
    if(c.spec==='drone'){p.specT=600;p.drone={a:0,cd:0};pop(p.x,p.y-14,'ДРОН!',P.cy2);}
    if(c.spec==='blink'){p.blinkT=20;p.dashT=16;p.dashCD=20;pop(p.x,p.y-14,'БЛИНК!',P.cy2);
      spark(p.x+p.w/2,p.y+p.h/2,20,P.cy2,4);}
    if(c.spec==='quake'){
      pop(p.x,p.y-14,'УДАР ЗЕМЛИ!',P.or2); boom(p.x+p.w/2,p.y+p.h,30,P.or2);
      foes.forEach(f=>{if(!f.dead&&Math.abs(f.x-p.x)<130&&f.y+f.h>p.y)damageFoe(f,9);});
      if(boss&&boss.hp>0&&Math.abs(boss.x-p.x)<160)damageBoss(14);
      for(let i=0;i<24;i++)parts.push({x:p.x+p.w/2+rnd(-120,120),y:p.y+p.h,vx:rnd(-1,1),vy:rnd(-4,-1),life:26,max:26,c:P.br1,g:.2,s:2});
    }
  }

  /* движение + коллизия */
  const oldH=p.h; p.h=p.prone?14:28;
  if(oldH!==p.h)p.y+=oldH-p.h;
  moveAxis(p,p.vx,0); moveAxis(p,0,p.vy);

  /* вода/шипы */
  const fx=Math.floor((p.x+p.w/2)/TS), fy=Math.floor((p.y+p.h-2)/TS);
  if(hazard(fx,fy)&&p.inv<=0){ if(T(fx,fy)==='~'){hurtPlayer(2);p.vy=-4;} else hurtPlayer(1); }
  if(p.y>H+40){hurtPlayer(99);}

  /* стрельба */
  if(s.fire&&!p.prone)shoot(p);
  else if(s.fire&&p.prone)shoot(p);

  /* дрон */
  if(p.drone){
    p.drone.a+=.07; if(p.drone.cd>0)p.drone.cd--;
    const dx=p.x+p.w/2+Math.cos(p.drone.a)*24, dy=p.y+8+Math.sin(p.drone.a)*14;
    p.drone.x=dx;p.drone.y=dy;
    if(p.drone.cd<=0){
      const tg=nearestFoe(dx,dy);
      if(tg){const a=Math.atan2(tg.y+tg.h/2-dy,tg.x+tg.w/2-dx);
        bullets.push({x:dx,y:dy,vx:Math.cos(a)*6,vy:Math.sin(a)*6,dmg:1.1,kind:'bullet',col:P.cy2,len:5,life:80,t:0});
        p.drone.cd=16;SND.play('mg');}
    }
  }
  p.anim+=Math.abs(p.vx)*.16+(p.onGround?0:.04);
  if(p.onGround&&Math.abs(p.vx)>.4&&tick%9===0)
    parts.push({x:p.x+p.w/2,y:p.y+p.h,vx:-p.vx*.2,vy:-rnd(.2,.7),life:12,max:12,c:theme.groundTop2,g:.06,s:1});
}
function moveAxis(e,dx,dy){
  if(dx){
    e.x+=dx;
    const y0=Math.floor(e.y/TS), y1=Math.floor((e.y+e.h-1)/TS);
    if(dx>0){const cx=Math.floor((e.x+e.w-1)/TS);
      for(let y=y0;y<=y1;y++)if(solid(cx,y)){e.x=cx*TS-e.w;e.vx=0;break;}}
    else{const cx=Math.floor(e.x/TS);
      for(let y=y0;y<=y1;y++)if(solid(cx,y)){e.x=(cx+1)*TS;e.vx=0;break;}}
  }
  if(dy){
    const wasBottom=e.y+e.h;
    e.y+=dy;
    const x0=Math.floor((e.x+1)/TS), x1=Math.floor((e.x+e.w-2)/TS);
    e.onGround=false;
    if(dy>0){
      const cy=Math.floor((e.y+e.h-1)/TS);
      for(let x=x0;x<=x1;x++){
        if(solid(x,cy)||(plat(x,cy)&&wasBottom<=cy*TS+2&&!(e===player&&IN.st.down&&IN.edge.jump))){
          e.y=cy*TS-e.h;e.vy=0;e.onGround=true;
          if(e===player){if(e.jumps>0&&e.vy===0){}e.jumps=0;e.coyote=7;}
          break;
        }
      }
    } else if(dy<0){
      const cy=Math.floor(e.y/TS);
      for(let x=x0;x<=x1;x++)if(solid(x,cy)){e.y=(cy+1)*TS;e.vy=0;break;}
    }
    if(!e.onGround&&e===player&&e.coyote<=0&&e.jumps===0)e.jumps=1;
  }
}
function nearestFoe(x,y){
  let best=null,bd=1e9;
  foes.forEach(f=>{if(f.dead)return;const d=(f.x-x)**2+(f.y-y)**2;if(d<bd&&d<200*200){bd=d;best=f;}});
  if(boss&&boss.hp>0){const d=(boss.x-x)**2+(boss.y-y)**2;if(d<bd){best={x:boss.x-boss.w/2,y:boss.y-boss.h,w:boss.w,h:boss.h};}}
  return best;
}

/* ---------- ВРАГИ ---------- */
function spawnFoe(type,x,y){
  const d=ENEMIES[type];
  foes.push({type,x,y:y-d.h,vx:0,vy:0,w:d.w,h:d.h,hp:d.hp,maxhp:d.hp,def:d,
    face:-1,t:ri(60),cd:ri(30,90),anim:rnd(0,6),dead:false,onGround:false,hitT:0,base:y});
}
function damageFoe(f,n){
  f.hp-=n; f.hitT=6; SND.play('hit');
  spark(f.x+f.w/2,f.y+f.h/2,4,P.yl1,2);
  if(f.hp<=0&&!f.dead){
    f.dead=true; kills++; comboN++; comboT=110;
    const sc=Math.round(f.def.score*(1+Math.min(comboN,10)*.1));
    score+=sc; pop(f.x+f.w/2,f.y,'+'+sc,P.yl2);
    boom(f.x+f.w/2,f.y+f.h/2,14,f.def.col); SND.play('kill');
    if(player)player.spec=Math.min(100,player.spec+9);
    if(f.def.drop)dropItem(f.x+f.w/2,f.y+f.h/2);
    else if(Math.random()<.10)dropItem(f.x+f.w/2,f.y+f.h/2,true);
  }
}
function dropItem(x,y,small){
  const kind = small ? (Math.random()<.5?'heal':'spec') : WORDER[ri(WORDER.length)];
  items.push({x,y,vy:-2.2,kind,t:0,life:640});
}
function updateFoes(){
  const p=player;
  for(let i=foes.length-1;i>=0;i--){
    const f=foes[i];
    if(f.dead){foes.splice(i,1);continue;}
    if(f.hitT>0)f.hitT--;
    f.t++; f.anim+=.14;
    if(f.x<cam.x-90||f.x>cam.x+W+140){ if(f.t>600)foes.splice(i,1); continue; }
    const px_=p?p.x+p.w/2:0, py_=p?p.y+p.h/2:0;
    const dx=px_-(f.x+f.w/2), dy=py_-(f.y+f.h/2);
    const dist=Math.hypot(dx,dy);
    f.face=dx<0?-1:1;

    switch(f.type){
      case 'runner':
        f.vx=f.face*f.def.spd*(dist<200?1.35:1);
        if(f.onGround&&Math.random()<.012)f.vy=-4.2;
        break;
      case 'crawler':
        f.vx=f.face*f.def.spd; break;
      case 'jumper':
        if(f.onGround){f.vx*=.8; if(f.t%54===0){f.vy=-5.4;f.vx=f.face*2.1;}}
        break;
      case 'shooter':
        f.vx=0;
        if(--f.cd<=0&&dist<210){f.cd=f.def.fire;
          const a=Math.atan2(dy,dx);
          ebullets.push({x:f.x+f.w/2,y:f.y+10,vx:Math.cos(a)*2.7,vy:Math.sin(a)*2.7,r:3,col:P.or2,life:150});
          SND.play('shot');}
        break;
      case 'grenadier':
        f.vx=f.face*f.def.spd*(dist>110?1:0);
        if(--f.cd<=0&&dist<230){f.cd=f.def.fire;
          ebullets.push({x:f.x+f.w/2,y:f.y+6,vx:dx/70,vy:-3.6,r:4,col:P.gr1,life:170,grav:.14,bomb:true});
          SND.play('fire');}
        break;
      case 'turret':
        f.vx=0; f.ang=Math.atan2(dy,dx);
        if(--f.cd<=0&&dist<230){f.cd=f.def.fire;
          for(let k=-1;k<=1;k++){const a=f.ang+k*.18;
            ebullets.push({x:f.x+f.w/2,y:f.y+8,vx:Math.cos(a)*3.1,vy:Math.sin(a)*3.1,r:3,col:P.rd2,life:150});}
          SND.play('spread');}
        break;
      case 'flyer':
        f.vx=-f.def.spd*(f.face<0?1:-1)*0+f.dirX||0;
        if(f.dirX===undefined)f.dirX=f.face;
        f.vx=f.dirX*f.def.spd;
        f.y=f.base-f.def.h+Math.sin(f.t*.05)*22;
        if(--f.cd<=0&&dist<220){f.cd=f.def.fire;
          ebullets.push({x:f.x+f.w/2,y:f.y+f.h,vx:0,vy:2.4,r:3,col:P.pu1,life:170,grav:.06});}
        break;
      case 'pod':
        if(f.dirX===undefined)f.dirX=1;
        f.vx=f.dirX*f.def.spd; f.y=f.base-f.def.h+Math.sin(f.t*.07)*16;
        break;
    }
    if(f.def.kind!=='air'){ f.vy=Math.min(f.vy+.34,9); moveAxis(f,f.vx,0); moveAxis(f,0,f.vy); }
    else { f.x+=f.vx; }
    if(f.y>H+60){foes.splice(i,1);continue;}
    if(p&&!p.dead&&p.inv<=0&&aabb(p,f))hurtPlayer(1);
  }
}
const aabb=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

/* ---------- ПУЛИ ---------- */
function updateBullets(){
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i]; b.t++; b.life--;
    if(b.kind==='fire'){ b.spin+=.35; b.x+=b.vx; b.y+=b.vy+Math.sin(b.spin)*1.1; }
    else if(b.kind==='homing'){
      const tg=nearestFoe(b.x,b.y);
      if(tg){const a=Math.atan2(tg.y+tg.h/2-b.y,tg.x+tg.w/2-b.x);
        b.vx=lerp(b.vx,Math.cos(a)*5.2,.10); b.vy=lerp(b.vy,Math.sin(a)*5.2,.10);}
      b.x+=b.vx;b.y+=b.vy;
      if(b.t%2===0)parts.push({x:b.x,y:b.y,vx:0,vy:0,life:10,max:10,c:P.pu2,g:0,s:1});
    } else { b.x+=b.vx; b.y+=b.vy; }
    if(b.life<=0||b.x<cam.x-40||b.x>cam.x+W+40||b.y<-30||b.y>H+30){bullets.splice(i,1);continue;}
    const cx=Math.floor(b.x/TS),cy=Math.floor(b.y/TS);
    if(solid(cx,cy)){
      if(T(cx,cy)==='B'){ /* ящики не тайлы-препятствия */ }
      spark(b.x,b.y,3,P.mt1,1.6);
      if(!b.pierce){bullets.splice(i,1);continue;}
    }
    let hit=false;
    for(const f of foes){
      if(f.dead)continue;
      if(b.x>f.x-2&&b.x<f.x+f.w+2&&b.y>f.y-2&&b.y<f.y+f.h+2){
        damageFoe(f,b.dmg); hit=true; if(!b.pierce)break;
      }
    }
    if(!hit&&boss&&boss.hp>0&&bossIntro<=0){
      if(b.x>boss.x-boss.w/2&&b.x<boss.x+boss.w/2&&b.y>boss.y-boss.h&&b.y<boss.y){
        damageBoss(b.dmg); hit=true;
      }
    }
    if(hit&&!b.pierce)bullets.splice(i,1);
  }
  for(let i=ebullets.length-1;i>=0;i--){
    const b=ebullets[i]; b.life--;
    if(b.grav)b.vy+=b.grav;
    b.x+=b.vx; b.y+=b.vy;
    if(b.life<=0||b.x<cam.x-60||b.x>cam.x+W+60||b.y>H+40){ebullets.splice(i,1);continue;}
    if(b.bomb&&b.y>H-40){boom(b.x,b.y,12,P.gr1);ebullets.splice(i,1);continue;}
    const p=player;
    if(p&&!p.dead&&p.inv<=0&&b.x>p.x-2&&b.x<p.x+p.w+2&&b.y>p.y-2&&b.y<p.y+p.h+2){
      hurtPlayer(b.dmg||1); ebullets.splice(i,1);
      if(b.web)p.webT=140;
      continue;
    }
    if(b.puddle&&b.y>=b.floor){
      parts.push({x:b.x,y:b.floor,puddle:true,life:220,max:220,c:P.gr1,r:10});
      ebullets.splice(i,1);
    }
  }
}

/* ---------- ПРЕДМЕТЫ ---------- */
function updateItems(){
  const p=player;
  for(let i=items.length-1;i>=0;i--){
    const it=items[i]; it.t++; it.life--;
    it.vy=Math.min(it.vy+.22,5); it.y+=it.vy;
    const cx=Math.floor(it.x/TS),cy=Math.floor((it.y+7)/TS);
    if(solid(cx,cy)||plat(cx,cy)){it.y=cy*TS-7;it.vy=0;}
    if(it.life<=0||it.y>H+30){items.splice(i,1);continue;}
    if(p&&!p.dead&&Math.abs(it.x-(p.x+p.w/2))<16&&Math.abs(it.y-(p.y+p.h/2))<22){
      SND.play('pick'); score+=200;
      if(it.kind==='heal'){p.hp=Math.min(p.maxhp,p.hp+2);pop(it.x,it.y-10,'+2 HP',P.rd1);}
      else if(it.kind==='spec'){p.spec=Math.min(100,p.spec+50);pop(it.x,it.y-10,'ПРИЁМ +50',P.cy2);}
      else {p.weapon=it.kind;pop(it.x,it.y-10,WEAPONS[it.kind].name,P.yl2);}
      spark(it.x,it.y,10,P.yl1,2.6);
      items.splice(i,1);
    }
  }
}

/* ============================================================
   БОССЫ
   ============================================================ */
function spawnBoss(idx){
  const d=BOSSES[idx];
  const arenaX=(lvl.w-11)*TS;
  boss={def:d,idx,x:arenaX+120,y:192,hp:d.hp,maxhp:d.hp,w:d.w,h:d.h,
    st:'idle',t:0,cd:90,face:-1,phase:1,anim:0,hitT:0,
    legs:[],tail:[],eyeGlow:0,clawT:0,webT:0,ceil:false,vy:0,dead:false,deathT:0,
    tele:0,teleKind:'',atk:null,arenaX};
  if(d.id==='spider')for(let i=0;i<8;i++)boss.legs.push({a:i,ph:i*.7,ext:0});
  for(let i=0;i<6;i++)boss.tail.push({x:0,y:0});
  bossIntro=140; SND.play('boss'); SND.music('boss');
}
function damageBoss(n){
  if(!boss||boss.hp<=0||bossIntro>0)return;
  boss.hp-=n; boss.hitT=5; SND.play('hit');
  spark(boss.x+rnd(-20,20),boss.y-rnd(10,boss.h),4,P.yl1,2.4);
  if(player)player.spec=Math.min(100,player.spec+1.2);
  const r=boss.hp/boss.maxhp;
  const np = r<.3?3 : r<.6?2 : 1;
  if(np>boss.phase){boss.phase=np;flash=6;cam.shake=8;SND.play('boss');
    pop(boss.x,boss.y-boss.h-10,'ФАЗА '+np,P.rd2);}
  if(boss.hp<=0){
    boss.hp=0;boss.dead=true;boss.deathT=0;score+=boss.def.score;
    SND.play('boom');cam.shake=12;
  }
}
function bossShoot(x,y,tx,ty,spd,o){
  const a=Math.atan2(ty-y,tx-x);
  ebullets.push(Object.assign({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:4,col:P.fl2,life:200},o||{}));
}
function updateBoss(){
  if(!boss)return;
  const b=boss,p=player;
  b.anim+=.1; if(b.hitT>0)b.hitT--;
  if(b.dead){
    b.deathT++;
    if(b.deathT%7===0){boom(b.x+rnd(-40,40),b.y-rnd(6,b.h),18,P.fl2);SND.play('boom');}
    if(b.deathT>110){ stageClearT=1; SND.play('win'); }
    return;
  }
  if(bossIntro>0){bossIntro--;return;}
  if(!p||p.dead)return;
  b.t++;
  const px_=p.x+p.w/2, py_=p.y+p.h/2;
  const dx=px_-b.x, dist=Math.abs(dx);
  b.face=dx<0?-1:1;
  const spd = 1 + (b.phase-1)*.35;

  /* общая логика выбора атаки */
  if(b.st==='idle'){
    b.cd-=spd;
    if(b.cd<=0){
      const moves=b.def.moves;
      let m;
      if(dist<70 && (b.def.id==='dog'||b.def.id==='cat')) m = b.def.id==='dog'?'tail':'claw';
      else m = moves[ri(moves.length)];
      b.atk=m; b.st='tele'; b.tele = m==='tail'||m==='claw'?26 : m==='drop'?36 : 30;
      b.teleKind=m;
    }
  } else if(b.st==='tele'){
    b.tele--;
    if(b.tele<=0){b.st='act';b.t=0;startAttack(b);}
  } else if(b.st==='act'){
    runAttack(b,px_,py_,dist,spd);
  } else if(b.st==='rest'){
    b.cd--; if(b.cd<=0){b.st='idle';b.cd=Math.max(24,70-b.phase*14);}
  }

  /* хвост/лапы физика */
  for(let i=0;i<b.tail.length;i++){
    const t=b.tail[i];
    const tx=b.x-b.face*(b.w*.42+i*9), ty=b.y-b.h*.45+Math.sin(b.anim*1.6+i*.5)*(4+i);
    t.x=lerp(t.x||tx,tx,.4); t.y=lerp(t.y||ty,ty,.4);
  }
  /* контакт */
  if(p.inv<=0&&!p.dead){
    const bb={x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h};
    if(aabb(p,bb))hurtPlayer(1);
  }
}
function startAttack(b){
  const p=player,px_=p.x+p.w/2,py_=p.y+p.h/2;
  switch(b.atk){
    case 'fireball':{
      const n=2+b.phase;
      for(let i=0;i<n;i++){
        const a=Math.atan2(py_-(b.y-b.h*.62),px_-b.x)+(i-(n-1)/2)*.20;
        ebullets.push({x:b.x+b.face*30,y:b.y-b.h*.62,vx:Math.cos(a)*3.3,vy:Math.sin(a)*3.3,
          r:5,col:P.fl2,life:200,fire:true});
      }
      SND.play('fire'); b.st='rest'; b.cd=44; break;
    }
    case 'tail': b.swing=0; SND.play('dash'); break;
    case 'charge': b.chX=b.face; SND.play('dash'); break;
    case 'leap': b.vy=-8.4; b.vx=b.face*2.6; SND.play('jump'); break;
    case 'claw': b.clawT=0; SND.play('dash'); break;
    case 'eyebeam': b.beamT=0; b.beamA=Math.atan2(py_-(b.y-b.h*.72),px_-b.x); SND.play('laser'); break;
    case 'pounce': b.vy=-7.6; b.vx=clamp((px_-b.x)/44,-4.2,4.2); SND.play('jump'); break;
    case 'volley':{
      for(let i=0;i<5+b.phase*2;i++){
        const a=-2.5+i*.22;
        ebullets.push({x:b.x,y:b.y-b.h*.7,vx:Math.cos(a)*2.9,vy:Math.sin(a)*2.9,r:3,col:P.pu1,life:190});
      }
      SND.play('spread'); b.st='rest'; b.cd=48; break;
    }
    case 'web':{
      for(let i=0;i<3;i++){
        const a=Math.atan2(py_-(b.y-b.h*.5),px_-b.x)+(i-1)*.16;
        ebullets.push({x:b.x,y:b.y-b.h*.5,vx:Math.cos(a)*3.4,vy:Math.sin(a)*3.4,r:5,col:P.w,life:180,web:true,dmg:1});
      }
      SND.play('spread'); b.st='rest'; b.cd=40; break;
    }
    case 'legstab': b.stabI=0; b.stabT=0; SND.play('dash'); break;
    case 'drop': b.ceil=true; b.dropT=0; SND.play('jump'); break;
    case 'spawn':{
      const n=b.phase>=3?2:1;
      for(let i=0;i<n;i++)spawnFoe('crawler',b.x+rnd(-40,40),192);
      SND.play('kill'); b.st='rest'; b.cd=54; break;
    }
    case 'poison':{
      for(let i=0;i<4+b.phase;i++){
        const a=-2.3+i*.26;
        ebullets.push({x:b.x,y:b.y-b.h*.6,vx:Math.cos(a)*3.1,vy:Math.sin(a)*3.1,r:4,
          col:P.gr1,life:200,grav:.13,puddle:true,floor:190});
      }
      SND.play('fire'); b.st='rest'; b.cd=50; break;
    }
    default: b.st='rest'; b.cd=40;
  }
}
function runAttack(b,px_,py_,dist,spd){
  const p=player;
  switch(b.atk){
    case 'tail':{
      b.swing+=.14*spd;
      const sw=Math.sin(b.swing*3.1);
      const hx=b.x-b.face*(b.w*.5+34*Math.abs(sw)), hy=b.y-8;
      if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-hx)<26&&p.y+p.h>b.y-22)hurtPlayer(2);
      if(b.swing>1.1){b.st='rest';b.cd=40;}
      break;
    }
    case 'charge':{
      b.x+=b.chX*4.4*spd;
      if(tick%3===0)spark(b.x-b.chX*30,b.y-6,3,P.br1,2);
      if(b.x<b.arenaX+50||b.x>b.arenaX+230){b.chX*=-1;b.face=b.chX;}
      if(b.t>90){b.st='rest';b.cd=36;}
      break;
    }
    case 'leap': case 'pounce':{
      b.vy+=.42; b.y+=b.vy; b.x+=b.vx;
      b.x=clamp(b.x,b.arenaX+50,b.arenaX+240);
      if(b.y>=192){
        b.y=192;b.vy=0;b.vx=0;
        boom(b.x,b.y,20,P.br1);SND.play('boom');
        if(p&&p.onGround&&Math.abs(p.x+p.w/2-b.x)<90)hurtPlayer(2);
        for(let i=0;i<2;i++)ebullets.push({x:b.x,y:b.y-6,vx:(i?1:-1)*3.4,vy:0,r:4,col:P.or2,life:90});
        b.st='rest';b.cd=42;
      }
      break;
    }
    case 'claw':{
      b.clawT+=.12*spd;
      const reach=Math.sin(Math.min(1,b.clawT)*3.14)*46;
      const hx=b.x+b.face*(b.w*.4+reach), hy=b.y-b.h*.45;
      if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-hx)<24&&Math.abs(p.y+p.h/2-hy)<30)hurtPlayer(2);
      if(b.clawT>1.15){b.st='rest';b.cd=38;}
      break;
    }
    case 'eyebeam':{
      b.beamT+=.02*spd; b.eyeGlow=1;
      const sweep=Math.sin(b.beamT*2.2)*.5;
      const a=b.beamA+sweep;
      for(let d=20;d<300;d+=8){
        const bx=b.x+Math.cos(a)*d, by=b.y-b.h*.72+Math.sin(a)*d;
        if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-bx)<9&&Math.abs(p.y+p.h/2-by)<12){hurtPlayer(2);break;}
      }
      if(b.beamT>1.5){b.eyeGlow=0;b.st='rest';b.cd=46;}
      break;
    }
    case 'legstab':{
      b.stabT+=.1*spd;
      if(b.stabT>1){b.stabT=0;b.stabI++;SND.play('dash');}
      const i=b.stabI;
      if(i<4){
        const lx=b.x-60+i*40, ext=Math.sin(Math.min(1,b.stabT)*3.14);
        if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-lx)<14&&p.y+p.h>192-40*ext)hurtPlayer(2);
        b.legs[i*2].ext=ext; b.legs[i*2+1].ext=ext;
      } else { b.legs.forEach(l=>l.ext=0); b.st='rest'; b.cd=44; }
      break;
    }
    case 'drop':{
      b.dropT+=.03*spd;
      if(b.dropT<1){ b.y=lerp(192,60,Math.min(1,b.dropT*2)); }
      else if(b.dropT<1.6){ b.x=lerp(b.x,px_,.06); }
      else {
        b.y+=9;
        if(b.y>=192){b.y=192;boom(b.x,192,26,P.pu2);SND.play('boom');
          if(p&&Math.abs(p.x+p.w/2-b.x)<70)hurtPlayer(2);
          for(let i=0;i<6;i++){const a=-2.8+i*.5;
            ebullets.push({x:b.x,y:188,vx:Math.cos(a)*3,vy:Math.sin(a)*3,r:3,col:P.pu1,life:110});}
          b.st='rest';b.cd=50;}
      }
      break;
    }
    default: b.st='rest'; b.cd=40;
  }
}

/* ============================================================
   РЕНДЕР
   ============================================================ */
function drawSky(){
  vgrad(0,0,W,H,theme.sky[0],theme.sky[1]);
  if(lvl.theme==='lair'){
    for(let i=0;i<26;i++){const x=(i*61+((tick*.2)|0))%W,y=(i*37)%120;
      px(x,y,1,1,i%4?P.pu2:P.pu1);}
  } else if(lvl.theme==='cliff'){
    ell(250,36,16,16,P.yl1); glow(250,36,34,'rgba(255,246,168,.35)',.5);
    for(let i=0;i<5;i++){const x=((i*79-tick*.15)%400+400)%400-40;
      ell(x,30+i*9,20,6,'rgba(255,255,255,.18)');}
  } else {
    ell(258,32,13,13,P.yl1); glow(258,32,30,'rgba(255,240,170,.3)',.45);
  }
}
function drawParallax(){
  const f=-(cam.x*.18)%640, m=-(cam.x*.42)%640;
  g.drawImage(farCv,f,0); g.drawImage(farCv,f+640,0);
  g.drawImage(midCv,m,0); g.drawImage(midCv,m+640,0);
}
function drawTiles(){
  const sx=clamp(cam.x|0,0,lvl.w*TS-W);
  g.drawImage(tileCv,sx,0,W,H,0,0,W,H);
  /* анимированная вода поверх */
  for(let x=Math.floor(sx/TS);x<Math.floor(sx/TS)+21;x++)
    for(let y=12;y<14;y++)if(T(x,y)==='~'){
      const X=x*TS-sx,Y=y*TS;
      px(X,Y+((tick>>3)%2),TS,1,P.cy1);
      if((x+((tick>>4)|0))%3===0)px(X+4,Y+3,5,1,P.cy2);
    }
}
function drawSoldier(p){
  const c=p.ch.pal, X=Math.round(p.x-cam.x), Y=Math.round(p.y);
  if(p.inv>0&&(tick>>2)%2)return;
  const f=p.face, run=p.onGround&&Math.abs(p.vx)>.4;
  const ph=p.anim, air=!p.onGround;
  const cx=X+p.w/2;
  if(p.prone){
    const by=Y+p.h;
    limb(cx-f*8,by-5,cx+f*10,by-5,6,c.cloth,c.cloth2,c.cloth3,P.n);
    ell(cx+f*11,by-7,5,4,c.helm); ell(cx+f*12,by-6,3,3,c.skin);
    px(cx+f*13,by-6,2,1,P.n);
    limb(cx+f*6,by-8,cx+f*18,by-8,3,c.gun,P.mt1,P.d2,P.n);
    if(p.muzzle>0){glow(cx+f*22,by-8,9,'rgba(255,220,120,.85)',.8);tri(cx+f*20,by-11,6,6,P.fl1,f>0?1:1);}
    return;
  }
  const hipY=Y+18, shY=Y+9, headY=Y+5;
  let l1,l2;
  if(air){ l1={kx:cx-f*3,ky:hipY+5,fx:cx-f*6,fy:hipY+9}; l2={kx:cx+f*4,ky:hipY+4,fx:cx+f*7,fy:hipY+8}; }
  else if(run){
    const s1=Math.sin(ph),s2=Math.sin(ph+3.14);
    l1={kx:cx+s1*4,ky:hipY+5,fx:cx+s1*8,fy:Y+p.h-Math.max(0,s1)*3};
    l2={kx:cx+s2*4,ky:hipY+5,fx:cx+s2*8,fy:Y+p.h-Math.max(0,s2)*3};
  } else { l1={kx:cx-3,ky:hipY+5,fx:cx-4,fy:Y+p.h}; l2={kx:cx+3,ky:hipY+5,fx:cx+4,fy:Y+p.h}; }
  limb(cx-2,hipY,l1.kx,l1.ky,4,c.cloth2,c.cloth,c.cloth3,P.n);
  limb(l1.kx,l1.ky,l1.fx,l1.fy,3,c.cloth2,c.cloth,c.cloth3,P.n);
  px(l1.fx-3,l1.fy-2,6,3,c.boot);
  /* торс */
  const lean=run?f*1:0;
  limb(cx,hipY,cx+lean,shY,8,c.cloth,c.cloth2,c.cloth3,P.n);
  box(cx+lean-4,shY-1,8,7,c.vest,P.n);
  px(cx+lean-3,shY,6,1,P.mt1); px(cx+lean-1,shY+2,2,3,c.acc);
  /* голова */
  ell(cx+lean+f*1,headY,4.5,4.5,c.skin);
  ell(cx+lean+f*1,headY-1.5,5,3.4,c.helm);
  px(cx+lean+f*1-5,headY-1,10,1,P.n);
  px(cx+lean+f*3,headY+1,2,1,P.n);
  px(cx+lean+f*1-1,headY+3,3,1,c.skin2);
  /* руки + ствол */
  const a=p.aim, gx=cx+lean, gy=shY+2;
  const gl=13+p.recoil*-2;
  const ex=gx+a.x*gl, ey=gy+a.y*gl;
  limb(gx,gy,gx+a.x*6,gy+a.y*6,4,c.cloth,c.cloth2,c.cloth3,P.n);
  limb(gx+a.x*6,gy+a.y*6,ex-a.x*3,ey-a.y*3,3,c.skin,c.sk1||P.sk1,c.skin2,P.n);
  line(ex-a.x*4,ey-a.y*4,ex+a.x*5,ey+a.y*5,P.n,4);
  line(ex-a.x*4,ey-a.y*4,ex+a.x*5,ey+a.y*5,c.gun,2);
  if(p.muzzle>0){
    glow(ex+a.x*7,ey+a.y*7,10,'rgba(255,225,140,.9)',.85);
    ell(ex+a.x*7,ey+a.y*7,3,3,P.fl1); ell(ex+a.x*9,ey+a.y*9,2,2,P.w);
  }
  /* задняя рука */
  limb(cx,hipY,l2.kx,l2.ky,4,c.cloth2,c.cloth,c.cloth3,P.n);
  limb(l2.kx,l2.ky,l2.fx,l2.fy,3,c.cloth2,c.cloth,c.cloth3,P.n);
  px(l2.fx-3,l2.fy-2,6,3,c.boot);
  if(p.dashT>0){glow(cx,Y+14,20,'rgba(53,224,255,.5)',.6);}
  if(p.webT>0){for(let i=0;i<5;i++)line(cx-8+i*4,Y+2,cx-6+i*4,Y+p.h,'rgba(255,255,255,.5)',1);}
  if(p.drone&&p.drone.x!=null){
    const dx=p.drone.x-cam.x,dy=p.drone.y;
    ellO(dx,dy,5,3,P.mt2,P.n); px(dx-2,dy-1,4,1,P.cy2);
    px(dx-6,dy-3,3,1,P.mt1); px(dx+3,dy-3,3,1,P.mt1);
    glow(dx,dy,8,'rgba(53,224,255,.4)',.5);
  }
}
function drawFoe(f){
  const X=Math.round(f.x-cam.x),Y=Math.round(f.y),cx=X+f.w/2;
  const hit=f.hitT>0&&(tick>>1)%2;
  const base=hit?P.w:f.def.col;
  switch(f.type){
    case 'runner': case 'crawler': {
      const s=Math.sin(f.anim*2);
      if(f.type==='crawler'){
        ellO(cx,Y+8,9,6,base,P.n);
        for(let i=-2;i<=2;i++)line(cx+i*4,Y+10,cx+i*5+s*2,Y+14,P.n,1);
        px(cx+f.face*5,Y+6,2,2,P.rd2);
      } else {
        limb(cx,Y+10,cx+s*4,Y+22,4,base,P.g4,P.d2,P.n);
        limb(cx,Y+10,cx-s*4,Y+22,4,base,P.g4,P.d2,P.n);
        limb(cx,Y+8,cx,Y+18,7,base,P.g3,P.d2,P.n);
        ell(cx,Y+4,4,4,P.sk3); ell(cx,Y+2,4.5,3,P.rd3);
        line(cx,Y+12,cx+f.face*10,Y+13,P.mt2,2);
        px(cx+f.face*2,Y+4,2,1,P.rd1);
      }
      break;
    }
    case 'shooter': case 'grenadier': {
      limb(cx-3,Y+16,cx-4,Y+26,4,P.d3,P.g2,P.n,P.n);
      limb(cx+3,Y+16,cx+4,Y+26,4,P.d3,P.g2,P.n,P.n);
      limb(cx,Y+8,cx,Y+18,8,base,P.g3,P.d2,P.n);
      ell(cx,Y+4,4.5,4.5,P.sk3); ell(cx,Y+2,5,3.2,f.type==='shooter'?P.br4:P.rd4);
      const a=player?Math.atan2(player.y+10-(Y+10),player.x+6-cx):0;
      line(cx,Y+11,cx+Math.cos(a)*12,Y+11+Math.sin(a)*12,P.mt2,3);
      px(cx+f.face*2,Y+4,2,1,P.yl2);
      break;
    }
    case 'turret': {
      box(X,Y+6,20,12,P.mt3,P.n); px(X+1,Y+7,18,2,P.mt1);
      ell(cx,Y+7,7,5,P.mt2); 
      const a=f.ang||0;
      line(cx,Y+7,cx+Math.cos(a)*14,Y+7+Math.sin(a)*14,P.n,5);
      line(cx,Y+7,cx+Math.cos(a)*14,Y+7+Math.sin(a)*14,P.mt1,3);
      px(cx-1,Y+5,3,3,P.rd2); glow(cx,Y+6,7,'rgba(255,74,61,.4)',.5);
      break;
    }
    case 'flyer': {
      const w=Math.sin(f.anim*4)*4;
      ellO(cx,Y+6,9,5,base,P.n);
      tri(cx-14,Y+2+w,10,5,P.pu3,-1); tri(cx+4,Y+2-w,10,5,P.pu3,-1);
      px(cx-2,Y+4,4,2,P.cy2); glow(cx,Y+6,10,'rgba(162,75,255,.35)',.5);
      break;
    }
    case 'jumper': {
      const t=f.onGround?0:1;
      limb(cx,Y+12,cx-5,Y+22-t*4,4,base,P.or1,P.d2,P.n);
      limb(cx,Y+12,cx+5,Y+22-t*4,4,base,P.or1,P.d2,P.n);
      ellO(cx,Y+8,7,7,base,P.n);
      px(cx-3,Y+6,2,2,P.yl2); px(cx+1,Y+6,2,2,P.yl2);
      break;
    }
    case 'pod': {
      ellO(cx,Y+7,9,7,P.cy3,P.n);
      px(cx-5,Y+4,10,6,P.cy1); txt('?',cx-2,Y+4,P.bl5,1);
      glow(cx,Y+7,13,'rgba(53,224,255,.45)',.6);
      break;
    }
  }
  if(f.hp<f.maxhp){px(X,Y-4,f.w,2,P.n);px(X,Y-4,Math.round(f.w*f.hp/f.maxhp),2,P.rd2);}
}
function drawBoss(){
  const b=boss; if(!b)return;
  const X=Math.round(b.x-cam.x), Y=Math.round(b.y);
  const hit=b.hitT>0&&(tick>>1)%2;
  const tele=b.st==='tele'&&(tick>>2)%2;
  const id=b.def.id;

  if(id==='dog'){
    const body=hit?P.w:(tele?P.or1:P.br2), dark=P.br3, lite=P.br1;
    /* хвост */
    let hx=X-b.face*b.w*.42, hy=Y-b.h*.5;
    for(let i=0;i<b.tail.length;i++){
      const t=b.tail[i]; const tx=t.x-cam.x, ty=t.y;
      line(hx,hy,tx,ty,dark,7-i); line(hx,hy,tx,ty,body,5-i);
      hx=tx;hy=ty;
    }
    if(b.atk==='tail'&&b.st==='act'){
      const sw=Math.sin(b.swing*3.1);
      const ex=X-b.face*(b.w*.5+34*Math.abs(sw));
      line(X-b.face*b.w*.4,Y-10,ex,Y-8,P.n,9);
      line(X-b.face*b.w*.4,Y-10,ex,Y-8,lite,6);
      glow(ex,Y-8,14,'rgba(255,163,42,.5)',.6);
    }
    /* лапы */
    for(let i=0;i<4;i++){
      const lx=X-30+i*20, s=Math.sin(b.anim*2+i)*3;
      limb(lx,Y-24,lx+s,Y-4,7,dark,body,P.br4,P.n);
      px(lx+s-5,Y-4,10,4,P.br4);
    }
    /* тело */
    ellO(X,Y-b.h*.52,b.w*.44,b.h*.34,body,P.n);
    ell(X-6,Y-b.h*.60,b.w*.34,b.h*.22,lite);
    dith(X-30,Y-b.h*.42,60,14,body,dark,0);
    /* голова */
    const hxx=X+b.face*b.w*.40, hyy=Y-b.h*.72;
    ellO(hxx,hyy,17,14,body,P.n);
    ell(hxx+b.face*12,hyy+5,9,6,lite);
    px(hxx+b.face*18,hyy+4,4,3,P.n);
    tri(hxx-10,hyy-16,8,12,dark,1); tri(hxx+3,hyy-16,8,12,dark,1);
    const eg=b.st==='tele'&&b.atk==='fireball'?1:.5;
    px(hxx+b.face*4,hyy-3,4,3,P.rd2); glow(hxx+b.face*6,hyy-2,9,'rgba(255,74,61,'+eg+')',.8);
    /* пасть */
    if(b.st==='act'&&b.atk==='fireball'){
      ell(hxx+b.face*15,hyy+7,7,5,P.rd4); glow(hxx+b.face*18,hyy+7,14,'rgba(255,106,26,.8)',.8);
    } else { px(hxx+b.face*10,hyy+8,10,2,P.n);
      for(let i=0;i<4;i++)tri(hxx+b.face*(6+i*3),hyy+8,2,3,P.w,-1); }
  }

  if(id==='cat'){
    const body=hit?P.w:(tele?P.pu1:'#4a4a5e'), dark='#2c2c3c', lite='#6e6e88';
    let hx=X-b.face*b.w*.44, hy=Y-b.h*.55;
    for(let i=0;i<b.tail.length;i++){
      const t=b.tail[i];const tx=t.x-cam.x,ty=t.y-6;
      line(hx,hy,tx,ty,dark,6-i);line(hx,hy,tx,ty,body,4-i);hx=tx;hy=ty;
    }
    for(let i=0;i<4;i++){
      const lx=X-32+i*21,s=Math.sin(b.anim*2.2+i)*3;
      limb(lx,Y-22,lx+s,Y-3,6,dark,body,'#1a1a26',P.n);
      px(lx+s-4,Y-3,9,3,'#1a1a26');
      if(b.atk==='claw'&&b.st==='act'&&i>=2){
        const reach=Math.sin(Math.min(1,b.clawT)*3.14)*46;
        for(let k=-1;k<=1;k++)line(X+b.face*(b.w*.4),Y-b.h*.45+k*5,
          X+b.face*(b.w*.4+reach),Y-b.h*.45+k*8,P.w,2);
        glow(X+b.face*(b.w*.4+reach),Y-b.h*.45,16,'rgba(255,255,255,.4)',.6);
      }
    }
    ellO(X,Y-b.h*.55,b.w*.46,b.h*.30,body,P.n);
    ell(X-4,Y-b.h*.64,b.w*.34,b.h*.18,lite);
    const hxx=X+b.face*b.w*.42,hyy=Y-b.h*.78;
    ellO(hxx,hyy,15,13,body,P.n);
    tri(hxx-11,hyy-16,9,13,dark,1); tri(hxx+3,hyy-16,9,13,dark,1);
    tri(hxx-9,hyy-13,5,8,P.rd3,1); tri(hxx+5,hyy-13,5,8,P.rd3,1);
    const gl=b.eyeGlow||((b.st==='tele'&&b.atk==='eyebeam')?.9:.4);
    px(hxx+b.face*2,hyy-2,5,3,P.cy2); px(hxx+b.face*9,hyy-2,4,3,P.cy2);
    glow(hxx+b.face*6,hyy,14,'rgba(53,224,255,'+gl+')',.9);
    px(hxx+b.face*13,hyy+5,3,2,P.rd1);
    for(let i=-1;i<2;i++)line(hxx+b.face*12,hyy+6+i*2,hxx+b.face*24,hyy+4+i*4,P.w,1);
    if(b.atk==='eyebeam'&&b.st==='act'){
      const a=b.beamA+Math.sin(b.beamT*2.2)*.5;
      for(let d=16;d<320;d+=4){
        const bx=hxx+Math.cos(a)*d,by=hyy+Math.sin(a)*d;
        px(bx-2,by-2,4,4,d%12<6?P.cy1:P.cy2);
      }
      glow(hxx,hyy,22,'rgba(53,224,255,.7)',.8);
    }
  }

  if(id==='spider'){
    const body=hit?P.w:(tele?P.rd2:'#3a1a52'), dark='#22103a', lite=P.pu3;
    /* 8 лап */
    for(let i=0;i<8;i++){
      const side=i<4?-1:1, k=i%4;
      const bx=X+side*14, by=Y-b.h*.55;
      const spread=(k-1.5)*.42;
      const ext=b.legs[i].ext||0;
      const kneeX=bx+side*(30+k*7), kneeY=by-24+Math.sin(b.anim*1.6+i)*4;
      const footX=bx+side*(46+k*11)+spread*10, footY=Y+ext*4;
      limb(bx,by,kneeX,kneeY,5,dark,body,'#160a26',P.n);
      limb(kneeX,kneeY,footX,footY,4,dark,body,'#160a26',P.n);
      px(footX-2,footY-2,4,3,P.n);
      if(ext>.3)glow(footX,footY,10,'rgba(255,74,61,.5)',.6);
    }
    /* брюшко */
    ellO(X-b.face*16,Y-b.h*.62,b.w*.32,b.h*.36,body,P.n);
    ell(X-b.face*18,Y-b.h*.70,b.w*.22,b.h*.22,lite);
    for(let i=0;i<3;i++)ell(X-b.face*(14+i*7),Y-b.h*.62+i*4,4-i,3-i,P.rd3);
    /* головогрудь */
    ellO(X+b.face*14,Y-b.h*.52,b.w*.24,b.h*.26,body,P.n);
    ell(X+b.face*16,Y-b.h*.58,b.w*.16,b.h*.16,lite);
    /* 8 глаз */
    const eg=b.phase>=3?P.rd2:P.rd1;
    for(let i=0;i<8;i++){
      const ex=X+b.face*(20+(i%4)*4), ey=Y-b.h*.62+((i/4)|0)*5;
      px(ex,ey,2,2,eg);
    }
    glow(X+b.face*24,Y-b.h*.60,18,b.phase>=3?'rgba(255,74,61,.7)':'rgba(255,154,134,.4)',.8);
    /* клыки */
    tri(X+b.face*26,Y-b.h*.42,4,8,P.w,-1); tri(X+b.face*31,Y-b.h*.42,4,8,P.w,-1);
    if(b.st==='act'&&b.atk==='poison')glow(X+b.face*30,Y-b.h*.40,14,'rgba(141,255,74,.6)',.7);
    /* паутина на потолке */
    if(b.ceil){for(let i=0;i<7;i++)line(X-60+i*20,0,X,Y-b.h,'rgba(255,255,255,.25)',1);}
  }

  /* полоса HP */
  const bw=200,bx=(W-bw)/2,by=H-16;
  px(bx-2,by-2,bw+4,10,P.n); px(bx-1,by-1,bw+2,8,P.d1);
  const r=clamp(b.hp/b.maxhp,0,1);
  for(let i=0;i<bw*r;i++){
    const c = r>.6?P.rd2 : r>.3?P.or2 : P.yl2;
    px(bx+i,by,1,6,c); if(i%3===0)px(bx+i,by,1,2,P.rd1);
  }
  txtCSh(b.def.name,W/2,by-11,P.w,1);
  if(bossIntro>0){
    const a=Math.min(1,(140-bossIntro)/25);
    g.globalAlpha=a;
    px(0,84,W,54,'rgba(8,11,18,.82)');
    txtCSh('WARNING',W/2,90,P.rd2,3);
    txtCSh(b.def.name,W/2,116,P.yl2,2);
    txtCSh(b.def.sub,W/2,132,P.g4,1);
    g.globalAlpha=1;
  }
}
function drawBullets(){
  bullets.forEach(b=>{
    const X=b.x-cam.x,Y=b.y;
    if(b.kind==='laser'){
      const a=Math.atan2(b.vy,b.vx);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,P.cy3,4);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,P.cy1,2);
      glow(X,Y,7,'rgba(53,224,255,.6)',.6);
    } else if(b.kind==='fire'){
      ell(X,Y,4,4,P.fl3); ell(X,Y,2.5,2.5,P.fl2); ell(X,Y,1,1,P.fl1);
      glow(X,Y,9,'rgba(255,106,26,.55)',.6);
    } else if(b.kind==='homing'){
      ell(X,Y,3,2,P.pu1); px(X-1,Y-1,2,2,P.w);
      glow(X,Y,7,'rgba(217,179,255,.5)',.5);
    } else {
      const a=Math.atan2(b.vy,b.vx);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,b.col,2);
      px(X-1,Y-1,2,2,P.w);
    }
  });
  ebullets.forEach(b=>{
    const X=b.x-cam.x,Y=b.y;
    if(b.fire){ell(X,Y,b.r,b.r,P.fl3);ell(X,Y,b.r-2,b.r-2,P.fl2);ell(X,Y,1,1,P.w);
      glow(X,Y,b.r*3,'rgba(255,106,26,.5)',.6);}
    else if(b.web){for(let i=0;i<5;i++)line(X-b.r,Y-b.r+i*2,X+b.r,Y-b.r+i*2,'rgba(255,255,255,.8)',1);
      line(X-b.r,Y-b.r,X+b.r,Y+b.r,'rgba(255,255,255,.8)',1);}
    else {ellO(X,Y,b.r,b.r,b.col,P.n);px(X-1,Y-1,2,2,P.w);
      glow(X,Y,b.r*2.4,'rgba(255,163,42,.35)',.4);}
  });
}
function drawItems(){
  items.forEach(it=>{
    const X=it.x-cam.x,Y=it.y+Math.sin(it.t*.12)*2;
    const blink=it.life<120&&(tick>>2)%2;
    if(blink)return;
    if(it.kind==='heal'){ellO(X,Y,7,7,P.rd3,P.n);px(X-1,Y-4,2,8,P.w);px(X-4,Y-1,8,2,P.w);}
    else if(it.kind==='spec'){ellO(X,Y,7,7,P.cy3,P.n);txt('S',X-2,Y-3,P.cy1,1);}
    else {box(X-8,Y-7,16,14,P.d2,P.n);px(X-7,Y-6,14,2,P.g2);
      txt(WEAPONS[it.kind].key,X-2,Y-3,WEAPONS[it.kind].col,1);}
    glow(X,Y,13,'rgba(255,212,0,.28)',.5);
  });
}
function drawParts(){
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.life--;
    if(p.life<=0){parts.splice(i,1);continue;}
    const a=p.life/p.max;
    if(p.ring){g.globalAlpha=a;const r=p.r+(1-a)*p.rr;
      g.strokeStyle=p.c;g.lineWidth=2;g.beginPath();g.arc(p.x-cam.x,p.y,r,0,6.283);g.stroke();g.globalAlpha=1;continue;}
    if(p.puddle){g.globalAlpha=Math.min(.6,a);ell(p.x-cam.x,p.y,p.r,3,p.c);g.globalAlpha=1;
      if(player&&player.inv<=0&&Math.abs(player.x+6-p.x)<p.r&&player.y+player.h>p.y-4)hurtPlayer(1);
      continue;}
    p.vy+=p.g||0;p.x+=p.vx;p.y+=p.vy;
    g.globalAlpha=Math.min(1,a*1.4);px(p.x-cam.x,p.y,p.s||1,p.s||1,p.c);g.globalAlpha=1;
  }
  for(let i=texts.length-1;i>=0;i--){
    const t=texts[i];t.life--;t.y-=.42;
    if(t.life<=0){texts.splice(i,1);continue;}
    g.globalAlpha=Math.min(1,t.life/22);
    txtCSh(t.s,t.x-cam.x,t.y,t.c,1);g.globalAlpha=1;
  }
}
function drawWeather(){
  if(!theme.weather)return;
  if(theme.weather==='rain'){
    for(let i=0;i<70;i++){
      const x=(i*53+tick*7)%400-40, y=(i*37+tick*11)%250-20;
      line(x,y,x-2,y+7,'rgba(180,220,255,.35)',1);
    }
  } else {
    for(let i=0;i<34;i++){
      const x=(i*71+Math.sin(tick*.02+i)*14)%340-10, y=(H-((tick*1.1+i*29)%260));
      px(x,y,1,1,i%3?P.or2:P.yl2);
    }
  }
  if(theme.fog){g.fillStyle=theme.fog;g.fillRect(0,0,W,H);}
}
function drawHUD(){
  const p=player;
  px(0,0,W,17,'rgba(8,11,18,.72)');
  txtSh('SCORE',4,2,P.g3,1); txtSh(String(score).padStart(7,'0'),4,10,P.w,1);
  txtSh('HI',80,2,P.g3,1); txtSh(String(Math.max(hi,score)).padStart(7,'0'),80,10,P.yl2,1);
  if(p){
    txtSh(p.ch.name,158,2,P.cy2,1);
    for(let i=0;i<p.maxhp;i++){
      const c=i<p.hp?P.rd2:P.d3;
      px(158+i*7,11,5,5,P.n);px(158+i*7+1,12,3,3,c);
    }
    const w=WEAPONS[p.weapon];
    box(232,2,16,14,P.d2,P.n);txt(w.key,237,6,w.col,1);
    txtSh(w.name,252,2,P.g4,1);
    px(252,11,60,4,P.n);px(253,12,Math.round(58*p.spec/100),2,p.spec>=100?P.cy2:P.g2);
    if(p.spec>=100&&(tick>>3)%2)txtSh('READY',252,10,P.cy2,1);
  }
  txtSh('×'+lives,300,2,P.w,1);
  if(comboN>1&&comboT>0){txtCSh('COMBO x'+comboN,W/2,20,P.or2,1);}
}

/* ============================================================
   ЭКРАНЫ
   ============================================================ */
function drawTitle(){
  vgrad(0,0,W,H,'#101a30','#050710');
  for(let i=0;i<50;i++){const x=(i*67+tick*.4)%W,y=(i*41)%H;px(x,y,1,1,i%5?P.d3:P.g2);}
  const t=Math.sin(tick*.04)*3;
  txtCSh('BALBES',W/2,34+t,P.rd2,5);
  txtCSh('FORCE',W/2,74+t,P.yl2,5);
  txtCSh('RUN & GUN · 16-BIT',W/2,116,P.cy2,1);
  if((tick>>4)%2)txtCSh('НАЖМИ ОГОНЬ',W/2,146,P.w,2);
  txtCSh('ANTONY · ARTYOM · DEN · DIMKA',W/2,176,P.g3,1);
  txtCSh('HI SCORE '+String(hi).padStart(7,'0'),W/2,192,P.yl3,1);
  txtCSh('Z ОГОНЬ   X ПРЫЖОК   C ПРИЁМ',W/2,208,P.d3,1);
}
function drawSelect(){
  vgrad(0,0,W,H,'#141d33','#070a14');
  txtCSh('ВЫБЕРИ БОЙЦА',W/2,8,P.w,2);
  const cw=70,gap=6,total=CHARS.length*cw+(CHARS.length-1)*gap;
  const sx=(W-total)/2;
  CHARS.forEach((c,i)=>{
    const X=sx+i*(cw+gap),Y=28,on=i===sel;
    box(X,Y,cw,72,on?P.d3:P.d1,on?P.cy2:P.n);
    if(on){px(X,Y,cw,2,P.cy2);glow(X+cw/2,Y+36,40,'rgba(53,224,255,.22)',.6);}
    const fake={ch:c,x:X+cw/2-6+cam.x,y:Y+22,w:12,h:28,face:1,onGround:true,vx:0,
      anim:tick*.09,prone:false,aim:{x:1,y:0,raw:{x:1,y:0}},inv:0,muzzle:0,recoil:0,dashT:0,webT:0,drone:null};
    drawSoldier(fake);
    txtCSh(c.name,X+cw/2,Y+56,on?P.yl2:P.g3,1);
    txtCSh(c.role,X+cw/2,Y+65,P.d3,1);
  });
  const c=CHARS[sel];
  box(10,108,W-20,54,P.d1,P.n);
  txtSh(c.name+' — '+c.role,16,113,c.pal.acc,1);
  const bars=[['БРОНЯ',c.hp/6],['СКОРОСТЬ',c.speed/2.2],['ПРЫЖОК',c.jump/6],['ТЕМП',c.rate/1.4],['УРОН',c.dmg/1.5]];
  bars.forEach((b,i)=>{
    const X=16+(i%3)*100, Y=126+((i/3)|0)*13;
    txt(b[0],X,Y,P.g3,1);
    px(X+52,Y+1,40,5,P.n);px(X+53,Y+2,Math.round(38*clamp(b[1],0,1)),3,c.pal.acc);
  });
  txtSh('ПРИЁМ: '+c.specName+' — '+c.specDesc,16,152,P.cy2,1);
  const abil=[c.dbl?'ДВОЙНОЙ ПРЫЖОК':null,c.dash?'РЫВОК':null,c.hover?'ПАРЕНИЕ':null].filter(Boolean).join(' · ');
  txtSh(abil||'БАЗОВЫЙ НАБОР',16,166,P.yl3,1);
  wrapText(c.desc,16,180,W-32,P.g4,1,9);
  if((tick>>4)%2)txtCSh('ОГОНЬ — В БОЙ',W/2,208,P.w,1);
  txtCSh('< >  ВЫБОР',W/2,216,P.d3,1);
}
function wrapText(s,x,y,maxw,col,sc,lh){
  const words=String(s).split(' ');let line='',yy=y;
  words.forEach(w=>{
    const test=line?line+' '+w:w;
    if(tw(test,sc)>maxw){txt(line,x,yy,col,sc);line=w;yy+=lh;}
    else line=test;
  });
  if(line)txt(line,x,yy,col,sc);
}
function drawIntro(){
  px(0,0,W,H,P.n);
  const a=Math.min(1,introT/20);
  g.globalAlpha=a;
  txtCSh(lvl.name,W/2,86,P.yl2,3);
  txtCSh(lvl.sub,W/2,116,P.w,1);
  txtCSh(CHARS[sel].name+' — '+CHARS[sel].role,W/2,140,P.cy2,1);
  txtCSh('ЦЕЛЬ: '+BOSSES[lvl.boss].name,W/2,158,P.rd2,1);
  g.globalAlpha=1;
}
function drawGameOver(){
  px(0,0,W,H,'rgba(8,4,4,.86)');
  txtCSh('GAME OVER',W/2,80,P.rd2,3);
  txtCSh('СЧЁТ '+score,W/2,116,P.w,1);
  txtCSh('РЕКОРД '+Math.max(hi,score),W/2,130,P.yl2,1);
  if((tick>>4)%2)txtCSh('ОГОНЬ — ЗАНОВО',W/2,164,P.g4,1);
}
function drawVictory(){
  vgrad(0,0,W,H,'#1a1030','#050710');
  for(let i=0;i<60;i++){const x=(i*53+tick*1.4)%W,y=(i*37+tick*.7)%H;
    px(x,y,2,2,[P.yl2,P.cy2,P.rd2,P.gr1][i%4]);}
  txtCSh('АРАХНА ПОВЕРЖЕНА',W/2,52,P.yl2,2);
  txtCSh('ДВОР СПАСЁН',W/2,78,P.w,2);
  txtCSh('ИТОГОВЫЙ СЧЁТ',W/2,110,P.g3,1);
  txtCSh(String(score).padStart(7,'0'),W/2,124,P.cy2,3);
  txtCSh('УНИЧТОЖЕНО ВРАГОВ: '+kills,W/2,158,P.g4,1);
  txtCSh('БОЕЦ: '+CHARS[sel].name,W/2,172,P.g4,1);
  if((tick>>4)%2)txtCSh('ОГОНЬ — В МЕНЮ',W/2,196,P.w,1);
}
function drawPause(){
  px(0,0,W,H,'rgba(6,9,16,.78)');
  txtCSh('ПАУЗА',W/2,90,P.cy2,3);
  txtCSh('СТАРТ — ПРОДОЛЖИТЬ',W/2,126,P.g4,1);
  txtCSh('Z ОГОНЬ · X ПРЫЖОК · C ПРИЁМ',W/2,146,P.d3,1);
  txtCSh('↓ ЛЁЖА · ↓+X СПРЫГНУТЬ',W/2,158,P.d3,1);
}

/* ============================================================
   ЗАГРУЗКА УРОВНЯ
   ============================================================ */
function loadStage(i){
  stageIdx=i; lvl=LEVELS[i]; theme=THEMES[lvl.theme];
  buildTiles(); buildParallax();
  bullets=[];ebullets=[];foes=[];items=[];parts=[];texts=[];boss=null;
  cam={x:0,y:0,lock:false,shake:0}; bossIntro=0; stageClearT=0; comboN=0; comboT=0;
  const ch=CHARS[sel];
  const keepSpec = player?player.spec:0, keepW = player?player.weapon:ch.weapon;
  player=makePlayer(ch); player.spec=keepSpec; player.weapon=keepW;
  for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++){
    const c=T(x,y), X=x*TS, Y=(y+1)*TS;
    if(c==='P'){player.x=X;player.y=Y-28;}
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
  introT=0; state='intro'; SND.music(theme.music);
}
function startGame(){
  lives=3;score=0;kills=0;player=null;
  loadStage(0);
}

/* ============================================================
   ГЛАВНЫЙ ЦИКЛ
   ============================================================ */
function update(){
  tick++;
  IN.poll();
  SND.tickMusic();
  if(comboT>0){comboT--;if(comboT===0)comboN=0;}
  if(flash>0)flash--;
  if(cam.shake>0)cam.shake*=.86;

  if(state==='title'){
    if(IN.edge.fire||IN.edge.start){SND.play('ok');state='select';SND.music('menu');}
    return;
  }
  if(state==='select'){
    if(IN.edge.left){sel=(sel+CHARS.length-1)%CHARS.length;SND.play('ui');}
    if(IN.edge.right){sel=(sel+1)%CHARS.length;SND.play('ui');}
    if(IN.edge.fire||IN.edge.start){SND.play('ok');startGame();}
    return;
  }
  if(state==='intro'){ introT++; if(introT>110||IN.edge.fire){state='play';SND.music(theme.music);} return; }
  if(state==='gameover'){ if(IN.edge.fire||IN.edge.start){SND.play('ok');state='select';SND.music('menu');} return; }
  if(state==='victory'){ if(IN.edge.fire||IN.edge.start){SND.play('ok');state='title';SND.music('menu');} return; }
  if(state!=='play')return;

  if(IN.edge.start){paused=!paused;SND.play('ui');}
  if(paused)return;
  if(hitstop>0){hitstop--;return;}

  updatePlayer();
  updateFoes();
  updateBullets();
  updateItems();
  updateBoss();

  /* камера */
  const p=player;
  if(p){
    const arenaStart=(lvl.w-22)*TS;
    if(!cam.lock&&p.x>arenaStart&&!boss){ spawnBoss(lvl.boss); cam.lock=true; }
    const target = cam.lock ? (lvl.w*TS-W) : clamp(p.x-W*.38,0,lvl.w*TS-W);
    cam.x=lerp(cam.x,target,cam.lock?.06:.14);
    cam.x=clamp(cam.x,0,lvl.w*TS-W);
    if(cam.lock)p.x=clamp(p.x,(lvl.w-22)*TS+4,lvl.w*TS-16);
  }

  /* смерть */
  if(p&&p.dead&&deadT>70){
    if(lives<=0){
      state='gameover'; SND.play('dead'); SND.music('menu');
      if(score>hi){hi=score;localStorage.setItem('bf_hi',String(hi));}
    } else {
      const keepW=p.weapon, keepS=p.spec;
      player=makePlayer(CHARS[sel]); player.weapon=keepW; player.spec=keepS;
      player.x=clamp(cam.x+40,20,lvl.w*TS-40); player.y=100; player.inv=110;
      deadT=0;
    }
  }
  /* конец зоны */
  if(stageClearT>0){
    stageClearT++;
    if(stageClearT>150){
      if(stageIdx>=LEVELS.length-1){
        state='victory';SND.play('win');SND.music('menu');
        if(score>hi){hi=score;localStorage.setItem('bf_hi',String(hi));}
      } else loadStage(stageIdx+1);
    }
  }
}
function render(){
  g.setTransform(1,0,0,1,0,0);
  const sh=cam.shake>.4?cam.shake:0;
  g.save();
  if(sh)g.translate(Math.round(rnd(-sh,sh)),Math.round(rnd(-sh,sh)));

  if(state==='title')drawTitle();
  else if(state==='select')drawSelect();
  else if(state==='intro')drawIntro();
  else if(state==='gameover'){drawSky();drawParallax();drawTiles();drawGameOver();}
  else if(state==='victory')drawVictory();
  else {
    drawSky(); drawParallax(); drawTiles();
    drawItems();
    foes.forEach(drawFoe);
    if(boss)drawBoss();
    if(player&&!player.dead)drawSoldier(player);
    drawBullets(); drawParts(); drawWeather(); drawHUD();
    if(stageClearT>0){
      px(0,88,W,44,'rgba(8,11,18,.8)');
      txtCSh('ЗОНА ЗАЧИЩЕНА',W/2,96,P.yl2,2);
      txtCSh('БОНУС '+BOSSES[lvl.boss].score,W/2,118,P.cy2,1);
    }
    if(paused)drawPause();
  }
  g.restore();
  if(flash>0){g.fillStyle='rgba(255,255,255,'+(flash/12)+')';g.fillRect(0,0,W,H);}

  vis.clearRect(0,0,W,H);
  vis.drawImage(buf,0,0,W,H);
}
let raf=0,last=0,acc=0;
function loop(now){
  raf=requestAnimationFrame(loop);
  if(!last)last=now;
  let dt=(now-last)/1000; last=now;
  if(dt>.25)dt=.25;
  acc+=dt;
  const STEP=1/60;
  let guard=0;
  while(acc>=STEP&&guard<4){update();acc-=STEP;guard++;}
  render();
}

/* ---------- кнопки интерфейса ---------- */
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
  if(document.hidden){SND.suspend();if(state==='play')paused=true;}
  else SND.resume();
});

/* ---------- старт ---------- */
IN.bindDom(document.getElementById('pad'));
SND.music('menu');
fit(); setTimeout(fit,120);
raf=requestAnimationFrame(loop);
})();
