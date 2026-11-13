/* ============================================================
   BALBES FORCE — движок, стройные бойцы, умный ИИ, боссы
   ============================================================ */
(() => {
'use strict';
const {W,H,TS,P,clamp,rnd,ri,sgn,lerp,bind,px,box,ell,ellO,line,limb,tri,dith,vgrad,glow,hash,
       txt,txtC,tw,txtSh,txtCSh,SND,IN}=CORE;
const {CHARS,WEAPONS,WORDER,ENEMIES,BOSSES,LEVELS,THEMES}=DATA;

const cv=document.getElementById('cv'),vis=cv.getContext('2d');
const buf=document.createElement('canvas');buf.width=W;buf.height=H;
const g=buf.getContext('2d');g.imageSmoothingEnabled=false;vis.imageSmoothingEnabled=false;
bind(g);

const GY=13*TS, SH=38, PH=16, BW=14, ARENA=30;

function fit(){
  const s=document.getElementById('screen'),b=s.parentElement.getBoundingClientRect();
  const sc=Math.max(1,Math.min(b.width/W,b.height/H));
  s.style.width=Math.floor(W*sc)+'px';s.style.height=Math.floor(H*sc)+'px';
  cv.style.width=Math.floor(W*sc)+'px';cv.style.height=Math.floor(H*sc)+'px';
}
addEventListener('resize',fit);addEventListener('orientationchange',fit);

let state='title',sel=0,tick=0,paused=false;
let lvl=null,th=null,tileCv=null,farCv=null,midCv=null;
let cam={x:0,lock:false,shake:0};
let pl=null,bul=[],ebul=[],foes=[],items=[],parts=[],txs=[],boss=null;
let si=0,lives=3,score=0,hi=Number(localStorage.getItem('bf_hi')||0);
let clearT=0,deadT=0,introT=0,flash=0,bIntro=0,kills=0,combo=0,comboT=0;

const T=(x,y)=>(x<0||y<0||x>=lvl.w||y>=lvl.h)?(y>=lvl.h?'.':'#'):lvl.rows[y][x];
const sol=(x,y)=>T(x,y)==='#';
const plt=(x,y)=>T(x,y)==='=';
const hz=(x,y)=>{const c=T(x,y);return c==='^'||c==='~';};
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

/* ---------- ТАЙЛЫ В СТИЛЕ CONTRA ---------- */
function buildTiles(){
  tileCv=document.createElement('canvas');tileCv.width=lvl.w*TS;tileCv.height=H;
  const old=g;bind(tileCv.getContext('2d'));
  for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++){
    const c=T(x,y),X=x*TS,Y=y*TS;
    if(c==='#'){
      px(X,Y,TS,TS,th.rockOut);
      for(let i=0;i<3;i++){
        const h1=hash(x*3+i,y*7),h2=hash(x*5+i,y*11);
        const bx=X+3+h1*10, by=Y+4+h2*9, r=3.2+h1*2.4;
        ell(bx,by,r+1,r*.85+1,th.rockOut);
        ell(bx,by,r,r*.85,th.rock);
        ell(bx-r*.3,by-r*.3,r*.5,r*.35,th.rockHi);
        ell(bx+r*.3,by+r*.35,r*.45,r*.28,th.rockLo);
      }
      if(!sol(x,y-1)&&T(x,y-1)!=='^'){
        px(X,Y,TS,4,th.grassLo);px(X,Y,TS,3,th.grass);px(X,Y,TS,1,th.grassHi);
        for(let i=0;i<5;i++){const gx=X+i*3+((x%2)?1:0);
          px(gx,Y-2,1,3,th.grass);px(gx+1,Y-3,1,4,th.grassHi);}
      }
    } else if(c==='='){
      px(X,Y,TS,6,th.plat);px(X,Y,TS,2,th.platTop);px(X,Y,TS,1,P.w);
      px(X,Y+6,TS,1,P.n);px(X+2,Y+7,2,4,th.plat);px(X+12,Y+7,2,4,th.plat);
      px(X+5,Y+2,4,1,th.platTop);
    } else if(c==='^'){
      px(X,Y+12,TS,4,th.rockOut);
      for(let i=0;i<4;i++){tri(X+i*4,Y+2,4,12,P.mt3,1);tri(X+i*4+1,Y+4,2,10,P.mt1,1);}
    } else if(c==='~'){
      px(X,Y,TS,TS,th.water);
      for(let j=0;j<TS;j+=3){
        const off=Math.round(Math.sin((x*TS+j)*.35)*2);
        px(X,Y+j,TS,1,th.water2);
        px(X+((j*3+off)%12),Y+j,4,1,th.water3);
      }
    } else if(c==='B'){
      box(X+1,Y+1,14,14,P.br2,P.br5);px(X+2,Y+2,12,2,P.br1);
      px(X+3,Y+7,10,1,P.br4);px(X+7,Y+2,2,12,P.br4);
      px(X+4,Y+9,8,4,P.yl4);txt('?',X+6,Y+8,P.yl1,1);
    }
  }
  bind(old);
}
function buildPar(){
  farCv=document.createElement('canvas');farCv.width=896;farCv.height=H;
  midCv=document.createElement('canvas');midCv.width=896;midCv.height=H;
  const old=g;
  bind(farCv.getContext('2d'));
  for(let i=0;i<40;i++){
    const x=i*24+((i*37)%12),h=64+((i*53)%70);
    if(lvl.theme==='jungle'){tri(x,178-h,44,h,th.far,1);tri(x+7,178-h+12,30,h-12,th.far2,1);}
    else if(lvl.theme==='cliff'){tri(x-10,190-h,58,h,th.far,1);tri(x+2,190-h+18,38,h-18,th.far2,1);tri(x+12,190-h+22,16,12,P.mt1,1);}
    else {tri(x,196-h,38,h,th.far,1);for(let k=0;k<5;k++)ell(x+18,196-h+16+k*13,11-k,4,th.far2);}
  }
  bind(midCv.getContext('2d'));
  for(let i=0;i<48;i++){
    const x=i*19+((i*29)%11),h=44+((i*41)%50);
    if(lvl.theme==='jungle'){px(x+9,214-h,5,h,th.mid);ell(x+11,214-h,15,10,th.mid);ell(x+8,214-h-4,9,6,th.mid2);}
    else if(lvl.theme==='cliff'){tri(x-5,220-h,34,h,th.mid,1);tri(x+2,220-h+10,20,h-10,th.mid2,1);}
    else {px(x+8,220-h,6,h,th.mid);ell(x+10,220-h,11,8,th.mid2);}
  }
  bind(old);
}

/* ---------- эффекты ---------- */
function spark(x,y,n,c,p){for(let i=0;i<n;i++){const a=rnd(0,6.283),s=rnd(.6,p||3.2);
  parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.5,life:rnd(12,30),max:30,c,g:.12,s:1});}}
function boom(x,y,r,c){
  for(let i=0;i<r;i++){const a=rnd(0,6.283),s=rnd(.8,4.6);
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:rnd(16,40),max:40,
      c:[P.fl1,P.fl2,P.fl3,P.rd2,P.mt2][ri(5)],g:.1,s:ri(2)+1});}
  parts.push({x,y,ring:true,r:2,rr:r,life:14,max:14,c:c||P.fl1});
  cam.shake=Math.max(cam.shake,Math.min(10,r*.32));
}
function pop(x,y,s,c){txs.push({x,y,s:String(s),c:c||P.yl2,life:48});}

/* ---------- физика ---------- */
function mx(e,d){
  if(!d)return;e.x+=d;
  const y0=Math.floor((e.y+2)/TS),y1=Math.floor((e.y+e.h-2)/TS);
  if(d>0){const cx=Math.floor((e.x+e.w)/TS);
    for(let y=y0;y<=y1;y++)if(sol(cx,y)){e.x=cx*TS-e.w;e.vx=0;break;}}
  else{const cx=Math.floor(e.x/TS);
    for(let y=y0;y<=y1;y++)if(sol(cx,y)){e.x=(cx+1)*TS;e.vx=0;break;}}
}
function my(e,d){
  const pb=e.y+e.h;e.y+=d;
  const x0=Math.floor((e.x+2)/TS),x1=Math.floor((e.x+e.w-2)/TS);
  if(d>0){const cy=Math.floor((e.y+e.h)/TS);
    for(let x=x0;x<=x1;x++){
      if(sol(x,cy)||(plt(x,cy)&&pb<=cy*TS+1&&!e.drop)){e.y=cy*TS-e.h;e.vy=0;break;}}}
  else if(d<0){const cy=Math.floor(e.y/TS);
    for(let x=x0;x<=x1;x++)if(sol(x,cy)){e.y=(cy+1)*TS;e.vy=0;break;}}
}
function gnd(e){
  const cy=Math.floor((e.y+e.h+1)/TS);
  const x0=Math.floor((e.x+2)/TS),x1=Math.floor((e.x+e.w-2)/TS);
  for(let x=x0;x<=x1;x++)if(sol(x,cy)||plt(x,cy))return true;
  return false;
}
function ceil(x,y,w){const cy=Math.floor(y/TS);
  for(let cx=Math.floor((x+2)/TS);cx<=Math.floor((x+w-2)/TS);cx++)if(sol(cx,cy))return true;return false;}
function ahead(e,d){
  const nx=e.x+(d>0?e.w+4:-4),cx=Math.floor(nx/TS),cy=Math.floor((e.y+e.h+3)/TS);
  return sol(cx,cy)||plt(cx,cy);
}
function wall(e,d){
  const nx=e.x+(d>0?e.w+2:-2),cx=Math.floor(nx/TS);
  return sol(cx,Math.floor((e.y+e.h-8)/TS))||sol(cx,Math.floor((e.y+6)/TS));
}
function gapSize(e,d){
  let n=0;const cx0=Math.floor((e.x+e.w/2)/TS);
  for(let i=1;i<=7;i++){const cx=cx0+d*i,cy=Math.floor((e.y+e.h+3)/TS);
    if(sol(cx,cy)||plt(cx,cy))break;n++;}
  return n;
}

/* ---------- игрок ---------- */
function mkPlayer(ch){
  return {ch,x:40,y:GY-SH,vx:0,vy:0,w:BW,h:SH,face:1,onGround:true,
    hp:ch.hp,maxhp:ch.hp,inv:90,prone:false,aim:{x:1,y:0,raw:{x:1,y:0}},
    jumps:0,coyote:0,buf:0,drop:0,dashT:0,dashCD:0,hover:false,moving:false,
    weapon:ch.weapon,cd:0,spec:0,specT:0,drone:null,
    anim:0,breath:0,recoil:0,muzzle:0,dead:false,webT:0,pushT:0};
}
function aimOf(p){
  const s=IN.st;let ax=p.face,ay=0;
  if(s.up&&!s.down){if(s.left||s.right){ax=s.right?1:-1;ay=-1;}else{ax=0;ay=-1;}}
  else if(s.down){if(!p.onGround){if(s.left||s.right){ax=s.right?1:-1;ay=1;}else{ax=0;ay=1;}}else{ax=p.face;ay=0;}}
  const L=Math.hypot(ax,ay)||1;return {x:ax/L,y:ay/L,raw:{x:ax,y:ay}};
}
function shoot(p){
  const w=WEAPONS[p.weapon],a=p.aim;
  const rate=p.specT>0&&p.ch.spec==='burst'?w.cd/3:w.cd/p.ch.rate;
  if(p.cd>0)return;p.cd=Math.max(3,rate);
  const py=p.prone?p.y+p.h-7:p.y+15;
  const ox=(a.raw.x===0&&a.raw.y!==0)?p.face*2:a.x*13, oy=a.y*11;
  const bx=p.x+p.w/2+ox,by=py+oy,dm=w.dmg*p.ch.dmg;
  const mk=(vx,vy,ex)=>bul.push(Object.assign({x:bx,y:by,vx,vy,dmg:dm,kind:w.kind,col:w.col,
    len:w.len,life:120,pierce:w.kind==='laser',t:0},ex||{}));
  if(w.kind==='spread'){for(let i=-2;i<=2;i++){const an=Math.atan2(a.y,a.x)+i*.20;
    mk(Math.cos(an)*w.spd,Math.sin(an)*w.spd);}SND.play('spread');}
  else if(w.kind==='fire'){mk(a.x*w.spd,a.y*w.spd,{spin:rnd(0,6.28)});SND.play('fire');}
  else if(w.kind==='laser'){mk(a.x*w.spd,a.y*w.spd);SND.play('laser');}
  else if(w.kind==='homing'){mk(a.x*w.spd,a.y*w.spd);mk(a.x*w.spd*.8,a.y*w.spd*.8-1);SND.play('homing');}
  else {mk(a.x*w.spd,a.y*w.spd);SND.play(p.weapon==='machine'?'mg':'shot');}
  p.muzzle=5;p.recoil=4;spark(bx,by,2,w.col,1.6);
}
function hurt(n){
  const p=pl;if(!p||p.inv>0||p.dead||p.dashT>0)return;
  p.hp-=n;p.inv=100;cam.shake=8;flash=6;SND.play('hurt');
  spark(p.x+p.w/2,p.y+p.h/2,16,P.rd2,3.6);combo=0;
  if(p.hp<=0){p.dead=true;deadT=0;lives--;boom(p.x+p.w/2,p.y+p.h/2,28,P.rd2);SND.play('boom');}
}
function updPlayer(){
  const p=pl;if(!p)return;
  if(p.dead){deadT++;return;}
  const s=IN.st,e=IN.edge,c=p.ch;
  ['inv','cd','dashCD','muzzle','recoil','webT','pushT','drop'].forEach(k=>{if(p[k]>0)p[k]--;});
  if(p.specT>0){p.specT--;if(!p.specT)p.drone=null;}
  p.breath+=.045;
  if(s.left&&!s.right)p.face=-1;else if(s.right&&!s.left)p.face=1;
  p.aim=aimOf(p);

  const feet=p.y+p.h;
  const wp=s.down&&!s.up&&(p.onGround||p.prone)&&p.dashT<=0;
  if(wp&&!p.prone){p.prone=true;p.h=PH;p.y=feet-p.h;}
  else if(!wp&&p.prone){const ny=feet-SH;if(!ceil(p.x,ny,p.w)){p.prone=false;p.h=SH;p.y=ny;}}

  if(p.dashT>0){
    p.dashT--;p.vx=p.face*(c.id==='den'?8.6:7.2);p.vy=0;
    if(p.dashT%2===0)parts.push({x:p.x+p.w/2,y:p.y+p.h/2,vx:0,vy:0,life:12,max:12,c:c.pal.acc,g:0,s:2});
    foes.forEach(f=>{if(!f.dead&&Math.abs(f.x+f.w/2-(p.x+p.w/2))<24&&Math.abs(f.y+f.h/2-(p.y+p.h/2))<28)kill(f,3.4);});
    if(boss&&boss.hp>0&&Math.abs(boss.x-(p.x+p.w/2))<boss.w*.6)damageBoss(2.6);
  } else if(p.pushT>0)p.vx*=.86;
  else {
    const sp=c.speed*(p.webT>0?.42:1)*(p.prone?0:1);
    if(s.left&&!s.right)p.vx=lerp(p.vx,-sp,.42);
    else if(s.right&&!s.left)p.vx=lerp(p.vx,sp,.42);
    else {p.vx*=p.onGround?.55:.92;if(Math.abs(p.vx)<.08)p.vx=0;}
  }

  if(e.jump)p.buf=8;
  if(p.buf>0)p.buf--;
  if(p.coyote>0)p.coyote--;
  const cx=Math.floor((p.x+p.w/2)/TS),cy=Math.floor((p.y+p.h+1)/TS);
  const onP=plt(cx,cy)&&!sol(cx,cy);
  if(p.buf>0&&p.onGround&&s.down&&onP){
    p.drop=10;p.y+=2;p.onGround=false;p.vy=1.4;p.buf=0;
    if(p.prone){p.prone=false;p.h=SH;p.y-=SH-PH;}SND.play('jump');
  } else if(p.buf>0){
    if(p.onGround||p.coyote>0){
      if(p.prone){const ft=p.y+p.h;p.prone=false;p.h=SH;p.y=ft-p.h;}
      p.vy=-c.jump;p.onGround=false;p.jumps=1;p.buf=0;p.coyote=0;SND.play('jump');
      spark(p.x+p.w/2,p.y+p.h,6,P.g4,1.8);
    } else if(c.dbl&&p.jumps<2){
      p.vy=-c.jump*.9;p.jumps=2;p.buf=0;SND.play('djump');
      for(let i=0;i<10;i++)parts.push({x:p.x+p.w/2,y:p.y+p.h,vx:rnd(-2.2,2.2),vy:rnd(0,2.2),life:16,max:16,c:c.pal.acc,g:.05,s:1});
    } else if(c.dash&&c.id==='den'&&p.dashCD<=0){p.dashT=12;p.dashCD=44;p.buf=0;SND.play('dash');}
  }
  if(p.vy<0&&!s.jump)p.vy*=.86;
  p.hover=c.hover&&!p.onGround&&s.jump&&p.vy>0;
  let gv=.38;
  if(p.hover){gv=.06;p.vy=Math.min(p.vy,1.1);
    if(tick%3===0)parts.push({x:p.x+p.w/2+rnd(-6,6),y:p.y+p.h,vx:rnd(-.4,.4),vy:rnd(.4,1.2),life:14,max:14,c:P.pu1,g:0,s:1});}
  if(p.dashT<=0)p.vy=Math.min(p.vy+gv,10);
  if(c.dash&&c.id==='artyom'&&s.spec&&p.dashCD<=0&&p.onGround&&p.spec<100&&p.specT<=0){p.dashT=14;p.dashCD=56;SND.play('dash');}

  if(e.spec&&p.spec>=100&&p.specT<=0){
    p.spec=0;SND.play('spec');flash=5;cam.shake=7;
    if(c.spec==='burst'){p.specT=480;pop(p.x,p.y-14,'ШКВАЛ!',P.yl2);}
    if(c.spec==='drone'){p.specT=600;p.drone={a:0,cd:0};pop(p.x,p.y-14,'ДРОН!',P.cy2);}
    if(c.spec==='blink'){p.dashT=16;p.dashCD=22;pop(p.x,p.y-14,'БЛИНК!',P.cy2);spark(p.x+p.w/2,p.y+p.h/2,22,P.cy2,4.2);}
    if(c.spec==='quake'){
      pop(p.x,p.y-14,'УДАР ЗЕМЛИ!',P.or2);boom(p.x+p.w/2,p.y+p.h,32,P.or2);
      foes.forEach(f=>{if(!f.dead&&Math.abs(f.x-p.x)<150&&f.y+f.h>p.y)kill(f,9);});
      if(boss&&boss.hp>0&&Math.abs(boss.x-p.x)<180)damageBoss(15);
    }
  }
  mx(p,p.vx);my(p,p.vy);
  const wasAir=!p.onGround;
  p.onGround=gnd(p)&&p.vy>=0;
  if(p.onGround){if(wasAir&&p.jumps>0){SND.play('land');spark(p.x+p.w/2,p.y+p.h,4,th.grassLo,1.4);}p.jumps=0;p.coyote=7;}
  p.moving=(s.left||s.right)&&p.onGround&&!p.prone&&p.dashT<=0&&Math.abs(p.vx)>.25;
  if(p.moving)p.anim+=.22+Math.abs(p.vx)*.05;else if(p.onGround)p.anim=0;
  const fx=Math.floor((p.x+p.w/2)/TS),fy=Math.floor((p.y+p.h-2)/TS);
  if(hz(fx,fy)&&p.inv<=0){if(T(fx,fy)==='~'){hurt(2);p.vy=-5;}else hurt(1);}
  if(p.y>H+50)hurt(99);
  if(s.fire)shoot(p);
  if(p.drone){
    p.drone.a+=.07;if(p.drone.cd>0)p.drone.cd--;
    const dx=p.x+p.w/2+Math.cos(p.drone.a)*26,dy=p.y+10+Math.sin(p.drone.a)*15;
    p.drone.x=dx;p.drone.y=dy;
    if(p.drone.cd<=0){const t=near(dx,dy);
      if(t){const a=Math.atan2(t.y+t.h/2-dy,t.x+t.w/2-dx);
        bul.push({x:dx,y:dy,vx:Math.cos(a)*7,vy:Math.sin(a)*7,dmg:1.1,kind:'bullet',col:P.cy2,len:6,life:90,t:0});
        p.drone.cd=16;SND.play('mg');}}
  }
  if(p.moving&&tick%8===0)parts.push({x:p.x+p.w/2,y:p.y+p.h,vx:-p.vx*.2,vy:-rnd(.2,.8),life:12,max:12,c:th.grassLo,g:.06,s:1});
}
function near(x,y){
  let b=null,bd=1e9;
  foes.forEach(f=>{if(f.dead)return;const d=(f.x-x)**2+(f.y-y)**2;if(d<bd&&d<260*260){bd=d;b=f;}});
  if(boss&&boss.hp>0){const d=(boss.x-x)**2+(boss.y-boss.h/2-y)**2;
    if(d<bd)b={x:boss.x-boss.w/2,y:boss.y-boss.h,w:boss.w,h:boss.h};}
  return b;
}

/* ---------- ВРАГИ: умный ИИ ---------- */
function spawn(type,x,y){
  const d=ENEMIES[type];
  foes.push({type,x,y:y-d.h,vx:0,vy:0,w:d.w,h:d.h,hp:d.hp,maxhp:d.hp,def:d,
    face:-1,t:ri(60),cd:ri(10,40),anim:rnd(0,6),dead:false,onGround:false,hitT:0,
    base:y,pushT:0,dirX:0,moving:false,stuck:0,aimA:0,charge:0,burst:0});
}
function kill(f,n){
  f.hp-=n;f.hitT=6;SND.play('hit');spark(f.x+f.w/2,f.y+f.h/2,5,P.yl1,2.2);
  if(f.hp<=0&&!f.dead){
    f.dead=true;kills++;combo++;comboT=110;
    const sc=Math.round(f.def.score*(1+Math.min(combo,10)*.1));
    score+=sc;pop(f.x+f.w/2,f.y,'+'+sc,P.yl2);
    boom(f.x+f.w/2,f.y+f.h/2,16,f.def.col);SND.play('kill');
    if(pl)pl.spec=Math.min(100,pl.spec+9);
    if(f.def.drop)drop(f.x+f.w/2,f.y+f.h/2);
    else if(Math.random()<.12)drop(f.x+f.w/2,f.y+f.h/2,true);
  }
}
function drop(x,y,sm){
  const k=sm?(Math.random()<.5?'heal':'spec'):WORDER[ri(WORDER.length)];
  items.push({x,y,vy:-2.4,kind:k,t:0,life:660});
}
function eshoot(f,tx,ty,sp,o){
  const a=Math.atan2(ty-(f.y+f.h*.4),tx-(f.x+f.w/2));
  ebul.push(Object.assign({x:f.x+f.w/2,y:f.y+f.h*.4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:3,col:P.or2,life:190},o||{}));
  SND.play('shot');
}
function updFoes(){
  const p=pl;
  for(let i=foes.length-1;i>=0;i--){
    const f=foes[i];
    if(f.dead){foes.splice(i,1);continue;}
    if(f.hitT>0)f.hitT--;
    if(f.pushT>0)f.pushT--;
    f.t++;
    if(f.x<cam.x-140||f.x>cam.x+W+200){if(f.t>900)foes.splice(i,1);continue;}
    const px_=p?p.x+p.w/2:0,py_=p?p.y+p.h/2:0;
    const dx=px_-(f.x+f.w/2),dy=py_-(f.y+f.h/2),dist=Math.hypot(dx,dy);
    if(f.pushT<=0)f.face=dx<0?-1:1;
    f.moving=false;
    const D=f.def, inRange=dist<(D.range||260)&&p&&!p.dead;

    /* вылезание из ямы */
    if(D.kind!=='air'&&f.y>GY+16){
      f.stuck++;
      if(f.stuck>18){f.vy=-8.5;f.vx=sgn(dx||1)*2.4;f.stuck=0;}
    } else f.stuck=0;

    if(f.pushT>0)f.vx*=.84;
    else switch(D.ai){
      case 'charge':{
        const stop=D.w>18?18:22;
        if(Math.abs(dx)>stop){
          const d=f.face;
          if(f.onGround&&!ahead(f,d)){
            if(gapSize(f,d)<=4){f.vy=-6.6;f.vx=d*D.spd*1.5;}
            else {f.face=-d;f.vx=-d*D.spd*.6;}
          } else if(f.onGround&&wall(f,d)){f.vy=-6.2;}
          else {f.vx=d*D.spd*(dist<230?1.3:1);f.moving=true;}
        } else f.vx*=.6;
        break;
      }
      case 'hop':
        if(f.onGround){f.vx*=.8;
          if(f.t%48===0&&dist<300){
            const d=f.face;
            if(!ahead(f,d)&&gapSize(f,d)>4)f.face=-d;
            f.vy=-6.6;f.vx=f.face*2.5;}}
        break;
      case 'shoot':
        f.vx=0;
        if(inRange){
          f.aimA=Math.atan2(dy,dx);
          if(--f.cd<=0){
            f.cd=D.fire;
            if(f.type==='turret'){for(let k=-1;k<=1;k++){const a=f.aimA+k*.17;
              ebul.push({x:f.x+f.w/2,y:f.y+9,vx:Math.cos(a)*3.8,vy:Math.sin(a)*3.8,r:3,col:P.rd2,life:190});}SND.play('spread');}
            else {f.burst=2;eshoot(f,px_,py_,3.6);}
          }
          if(f.burst>0&&f.t%7===0){f.burst--;eshoot(f,px_,py_,3.6);}
        }
        break;
      case 'snipe':
        f.vx=0;
        if(inRange){
          f.aimA=Math.atan2(dy,dx);
          if(--f.cd<=0){f.cd=D.fire;f.charge=34;}
          if(f.charge>0){f.charge--;
            if(f.charge===0){eshoot(f,px_,py_,7.5,{col:P.cy2,r:2});SND.play('laser');}}
        } else f.charge=0;
        break;
      case 'lob':
        f.vx=Math.abs(dx)>150?f.face*D.spd:0;f.moving=f.vx!==0;
        if(f.onGround&&f.vx&&!ahead(f,f.face))f.vx=0;
        if(inRange&&--f.cd<=0){f.cd=D.fire;
          ebul.push({x:f.x+f.w/2,y:f.y+6,vx:dx/70,vy:-4.4,r:4,col:P.gr1,life:200,grav:.15,bomb:true});SND.play('fire');}
        break;
      case 'fly':
        if(!f.dirX)f.dirX=f.face||1;
        f.vx=f.dirX*D.spd;
        f.y=f.base-f.h+Math.sin(f.t*.05)*26;
        if(f.x<cam.x-60||f.x>cam.x+W+60)f.dirX*=-1;
        if(inRange&&--f.cd<=0){f.cd=D.fire;
          ebul.push({x:f.x+f.w/2,y:f.y+f.h,vx:dx/90,vy:2.9,r:3,col:P.pu1,life:200,grav:.05});}
        break;
    }
    if(f.moving)f.anim+=.22;else if(D.kind==='ground')f.anim=0;
    if(D.kind!=='air'){f.vy=Math.min(f.vy+.38,10);mx(f,f.vx);my(f,f.vy);f.onGround=gnd(f)&&f.vy>=0;}
    else f.x+=f.vx;
    if(f.y>H+80){foes.splice(i,1);continue;}
    if(p&&!p.dead&&hit(p,f)){
      const d=sgn((p.x+p.w/2)-(f.x+f.w/2))||1;
      if(p.inv<=0&&p.dashT<=0)hurt(1);
      const ov=Math.min(p.x+p.w-f.x,f.x+f.w-p.x),pu=Math.max(2,ov*.6);
      p.x+=d*pu;p.vx=d*3.4;p.pushT=10;
      if(D.kind!=='fixed'){f.x-=d*pu;f.vx=-d*2.6;f.pushT=16;}
      spark((p.x+f.x+f.w)/2,p.y+p.h*.5,6,P.or1,2.4);
    }
  }
  for(let i=0;i<foes.length;i++)for(let j=i+1;j<foes.length;j++){
    const a=foes[i],b=foes[j];
    if(a.dead||b.dead||a.def.kind==='air'||b.def.kind==='air'||!hit(a,b))continue;
    const ov=Math.min(a.x+a.w-b.x,b.x+b.w-a.x);if(ov<=0)continue;
    const d=sgn((a.x+a.w/2)-(b.x+b.w/2))||1,s=Math.min(2.2,ov*.35);
    if(a.def.kind!=='fixed')a.x+=d*s;
    if(b.def.kind!=='fixed')b.x-=d*s;
  }
}

/* ---------- пули / предметы ---------- */
function updBullets(){
  for(let i=bul.length-1;i>=0;i--){
    const b=bul[i];b.t++;b.life--;
    if(b.kind==='fire'){b.spin+=.35;b.x+=b.vx;b.y+=b.vy+Math.sin(b.spin)*1.2;}
    else if(b.kind==='homing'){
      const t=near(b.x,b.y);
      if(t){const a=Math.atan2(t.y+t.h/2-b.y,t.x+t.w/2-b.x);
        b.vx=lerp(b.vx,Math.cos(a)*6.4,.1);b.vy=lerp(b.vy,Math.sin(a)*6.4,.1);}
      b.x+=b.vx;b.y+=b.vy;
      if(b.t%2===0)parts.push({x:b.x,y:b.y,vx:0,vy:0,life:10,max:10,c:P.pu2,g:0,s:1});
    } else {b.x+=b.vx;b.y+=b.vy;}
    if(b.life<=0||b.x<cam.x-50||b.x>cam.x+W+50||b.y<-40||b.y>H+40){bul.splice(i,1);continue;}
    const cx=Math.floor(b.x/TS),cy=Math.floor(b.y/TS);
    if(T(cx,cy)==='B'){
      lvl.rows[cy]=lvl.rows[cy].substring(0,cx)+'.'+lvl.rows[cy].substring(cx+1);
      buildTiles();boom(cx*TS+8,cy*TS+8,14,P.br1);drop(cx*TS+8,cy*TS+8);bul.splice(i,1);continue;}
    if(sol(cx,cy)){spark(b.x,b.y,3,P.mt1,1.6);if(!b.pierce){bul.splice(i,1);continue;}}
    let h=false;
    for(const f of foes){if(f.dead)continue;
      if(b.x>f.x-2&&b.x<f.x+f.w+2&&b.y>f.y-2&&b.y<f.y+f.h+2){kill(f,b.dmg);h=true;if(!b.pierce)break;}}
    if(!h&&boss&&boss.hp>0&&bIntro<=0&&b.x>boss.x-boss.w/2&&b.x<boss.x+boss.w/2&&b.y>boss.y-boss.h&&b.y<boss.y){damageBoss(b.dmg);h=true;}
    if(h&&!b.pierce)bul.splice(i,1);
  }
  for(let i=ebul.length-1;i>=0;i--){
    const b=ebul[i];b.life--;if(b.grav)b.vy+=b.grav;
    b.x+=b.vx;b.y+=b.vy;
    if(b.life<=0||b.x<cam.x-70||b.x>cam.x+W+70||b.y>H+50){ebul.splice(i,1);continue;}
    if(b.bomb&&b.y>GY-4){boom(b.x,b.y,14,P.gr1);ebul.splice(i,1);continue;}
    if(b.puddle&&b.y>=b.floor){parts.push({x:b.x,y:b.floor,puddle:true,life:240,max:240,c:P.gr1,r:12});ebul.splice(i,1);continue;}
    const p=pl;
    if(p&&!p.dead&&p.inv<=0&&b.x>p.x-2&&b.x<p.x+p.w+2&&b.y>p.y-2&&b.y<p.y+p.h+2){
      hurt(b.dmg||1);if(b.web)p.webT=150;ebul.splice(i,1);}
  }
}
function updItems(){
  const p=pl;
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];it.t++;it.life--;
    it.vy=Math.min(it.vy+.24,6);it.y+=it.vy;
    const cx=Math.floor(it.x/TS),cy=Math.floor((it.y+8)/TS);
    if(sol(cx,cy)||plt(cx,cy)){it.y=cy*TS-8;it.vy=0;}
    if(it.life<=0||it.y>H+40){items.splice(i,1);continue;}
    if(p&&!p.dead&&Math.abs(it.x-(p.x+p.w/2))<20&&Math.abs(it.y-(p.y+p.h/2))<26){
      SND.play('pick');score+=200;
      if(it.kind==='heal'){p.hp=Math.min(p.maxhp,p.hp+2);pop(it.x,it.y-10,'+2 HP',P.rd1);}
      else if(it.kind==='spec'){p.spec=Math.min(100,p.spec+50);pop(it.x,it.y-10,'ПРИЁМ +50',P.cy2);}
      else {p.weapon=it.kind;pop(it.x,it.y-10,WEAPONS[it.kind].name,P.yl2);}
      spark(it.x,it.y,12,P.yl1,2.8);items.splice(i,1);}
  }
}

/* ---------- БОССЫ ---------- */
function spawnBoss(i){
  const d=BOSSES[i],ax=(lvl.w-ARENA)*TS;
  boss={def:d,idx:i,x:ax+250,y:GY,hp:d.hp,maxhp:d.hp,w:d.w,h:d.h,
    st:'idle',t:0,cd:100,face:-1,phase:1,anim:0,hitT:0,legs:[],tail:[],
    eyeGlow:0,clawT:0,ceil:false,vy:0,vx:0,dead:false,deathT:0,tele:0,atk:null,ax,
    swing:0,beamT:0,beamA:0,stabI:0,stabT:0,dropT:0,chX:-1};
  for(let k=0;k<8;k++)boss.legs.push({ext:0});
  for(let k=0;k<7;k++)boss.tail.push({x:0,y:0});
  bIntro=150;SND.play('boss');SND.music('boss');
}
function damageBoss(n){
  if(!boss||boss.hp<=0||bIntro>0)return;
  boss.hp-=n;boss.hitT=5;SND.play('hit');
  spark(boss.x+rnd(-26,26),boss.y-rnd(12,boss.h),5,P.yl1,2.6);
  if(pl)pl.spec=Math.min(100,pl.spec+1.2);
  const r=boss.hp/boss.maxhp,np=r<.3?3:r<.6?2:1;
  if(np>boss.phase){boss.phase=np;flash=6;cam.shake=9;SND.play('boss');pop(boss.x,boss.y-boss.h-12,'ФАЗА '+np,P.rd2);}
  if(boss.hp<=0){boss.hp=0;boss.dead=true;boss.deathT=0;score+=boss.def.score;cam.shake=13;}
}
function updBoss(){
  if(!boss)return;
  const b=boss,p=pl;
  b.anim+=.1;if(b.hitT>0)b.hitT--;
  if(b.dead){
    b.deathT++;
    if(b.deathT<92&&b.deathT%9===0){boom(b.x+rnd(-46,46),b.y-rnd(8,b.h),20,P.fl2);SND.play('boom');}
    if(b.deathT===100){clearT=1;SND.music(si>=LEVELS.length-1?'win':'clear');}
    return;
  }
  if(bIntro>0){bIntro--;return;}
  if(!p||p.dead)return;
  b.t++;
  const pcx=p.x+p.w/2,pcy=p.y+p.h/2,dx=pcx-b.x,dist=Math.abs(dx);
  if(b.st!=='act')b.face=dx<0?-1:1;
  const sp=1+(b.phase-1)*.35;
  if(b.st==='idle'){b.cd-=sp;
    if(b.cd<=0){let m;
      if(dist<84&&b.def.id==='dog')m='tail';
      else if(dist<84&&b.def.id==='cat')m='claw';
      else m=b.def.moves[ri(b.def.moves.length)];
      b.atk=m;b.st='tele';b.tele=(m==='tail'||m==='claw')?26:m==='drop'?38:30;}
  } else if(b.st==='tele'){b.tele--;if(b.tele<=0){b.st='act';b.t=0;startAtk(b);}}
  else if(b.st==='act')runAtk(b,pcx,pcy,sp);
  else if(b.st==='rest'){b.cd--;if(b.cd<=0){b.st='idle';b.cd=Math.max(22,70-b.phase*14);}}
  for(let i=0;i<b.tail.length;i++){
    const t=b.tail[i],tx=b.x-b.face*(b.w*.42+i*10),ty=b.y-b.h*.5+Math.sin(b.anim*1.6+i*.5)*(5+i);
    t.x=lerp(t.x||tx,tx,.4);t.y=lerp(t.y||ty,ty,.4);}
  if(p.inv<=0&&!p.dead&&b.st!=='act'&&hit(p,{x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h})){
    const d=sgn(pcx-b.x)||1;hurt(1);p.x+=d*10;p.vx=d*4;p.pushT=12;}
}
function startAtk(b){
  const p=pl,pcx=p.x+p.w/2,pcy=p.y+p.h/2;
  switch(b.atk){
    case 'fireball':{const n=2+b.phase;
      for(let i=0;i<n;i++){const a=Math.atan2(pcy-(b.y-b.h*.66),pcx-b.x)+(i-(n-1)/2)*.2;
        ebul.push({x:b.x+b.face*40,y:b.y-b.h*.66,vx:Math.cos(a)*4,vy:Math.sin(a)*4,r:6,col:P.fl2,life:210,fire:true});}
      SND.play('fire');b.st='rest';b.cd=42;break;}
    case 'tail':b.swing=0;SND.play('dash');break;
    case 'charge':b.chX=b.face;SND.play('dash');break;
    case 'leap':b.vy=-9.6;b.vx=b.face*3.2;SND.play('jump');break;
    case 'claw':b.clawT=0;SND.play('dash');break;
    case 'eyebeam':b.beamT=0;b.beamA=Math.atan2(pcy-(b.y-b.h*.76),pcx-b.x);SND.play('laser');break;
    case 'pounce':b.vy=-8.8;b.vx=clamp((pcx-b.x)/44,-5,5);SND.play('jump');break;
    case 'volley':{for(let i=0;i<5+b.phase*2;i++){const a=-2.5+i*.22;
      ebul.push({x:b.x,y:b.y-b.h*.7,vx:Math.cos(a)*3.4,vy:Math.sin(a)*3.4,r:4,col:P.pu1,life:200});}
      SND.play('spread');b.st='rest';b.cd=46;break;}
    case 'web':{for(let i=0;i<3;i++){const a=Math.atan2(pcy-(b.y-b.h*.5),pcx-b.x)+(i-1)*.16;
      ebul.push({x:b.x,y:b.y-b.h*.5,vx:Math.cos(a)*4,vy:Math.sin(a)*4,r:6,col:P.w,life:190,web:true,dmg:1});}
      SND.play('spread');b.st='rest';b.cd=38;break;}
    case 'legstab':b.stabI=0;b.stabT=0;SND.play('dash');break;
    case 'drop':b.ceil=true;b.dropT=0;SND.play('jump');break;
    case 'spawn':{const n=b.phase>=3?2:1;for(let i=0;i<n;i++)spawn('crawler',b.x+rnd(-50,50),GY);
      SND.play('kill');b.st='rest';b.cd=52;break;}
    case 'poison':{for(let i=0;i<4+b.phase;i++){const a=-2.3+i*.26;
      ebul.push({x:b.x,y:b.y-b.h*.6,vx:Math.cos(a)*3.6,vy:Math.sin(a)*3.6,r:5,col:P.gr1,life:210,grav:.14,puddle:true,floor:GY-2});}
      SND.play('fire');b.st='rest';b.cd=48;break;}
    default:b.st='rest';b.cd=40;
  }
}
function runAtk(b,pcx,pcy,sp){
  const p=pl;
  switch(b.atk){
    case 'tail':{b.swing+=.14*sp;const sw=Math.sin(b.swing*3.1);
      const hx=b.x-b.face*(b.w*.5+44*Math.abs(sw));
      if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-hx)<30&&p.y+p.h>b.y-26)hurt(2);
      if(b.swing>1.1){b.st='rest';b.cd=38;}break;}
    case 'charge':{b.x+=b.chX*5.2*sp;
      if(tick%3===0)spark(b.x-b.chX*40,b.y-8,3,P.br1,2);
      if(b.x<b.ax+80||b.x>b.ax+400){b.chX*=-1;b.face=b.chX;}
      if(b.t>92){b.st='rest';b.cd=34;}break;}
    case 'leap':case 'pounce':{
      b.vy+=.46;b.y+=b.vy;b.x+=b.vx;b.x=clamp(b.x,b.ax+80,b.ax+400);
      if(b.y>=GY){b.y=GY;b.vy=0;b.vx=0;boom(b.x,b.y,24,P.br1);SND.play('boom');
        if(p&&p.onGround&&Math.abs(p.x+p.w/2-b.x)<110)hurt(2);
        for(let i=0;i<2;i++)ebul.push({x:b.x,y:b.y-8,vx:(i?1:-1)*4,vy:0,r:5,col:P.or2,life:100});
        b.st='rest';b.cd=40;}break;}
    case 'claw':{b.clawT+=.12*sp;
      const re=Math.sin(Math.min(1,b.clawT)*3.14)*58,hx=b.x+b.face*(b.w*.4+re);
      if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-hx)<26&&Math.abs(p.y+p.h/2-(b.y-b.h*.45))<34)hurt(2);
      if(b.clawT>1.15){b.st='rest';b.cd=36;}break;}
    case 'eyebeam':{b.beamT+=.02*sp;b.eyeGlow=1;
      const a=b.beamA+Math.sin(b.beamT*2.2)*.5;
      for(let d=24;d<440;d+=8){const bx=b.x+Math.cos(a)*d,by=b.y-b.h*.76+Math.sin(a)*d;
        if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-bx)<11&&Math.abs(p.y+p.h/2-by)<14){hurt(2);break;}}
      if(b.beamT>1.5){b.eyeGlow=0;b.st='rest';b.cd=44;}break;}
    case 'legstab':{b.stabT+=.1*sp;
      if(b.stabT>1){b.stabT=0;b.stabI++;SND.play('dash');}
      const i=b.stabI;
      if(i<4){const lx=b.x-80+i*54,ex=Math.sin(Math.min(1,b.stabT)*3.14);
        if(p&&p.inv<=0&&Math.abs(p.x+p.w/2-lx)<18&&p.y+p.h>GY-54*ex)hurt(2);
        b.legs[i*2].ext=ex;b.legs[i*2+1].ext=ex;}
      else {b.legs.forEach(l=>l.ext=0);b.st='rest';b.cd=42;}break;}
    case 'drop':{b.dropT+=.03*sp;
      if(b.dropT<1)b.y=lerp(GY,70,Math.min(1,b.dropT*2));
      else if(b.dropT<1.6)b.x=lerp(b.x,pcx,.06);
      else {b.y+=11;
        if(b.y>=GY){b.y=GY;boom(b.x,GY,30,P.pu2);SND.play('boom');
          if(p&&Math.abs(p.x+p.w/2-b.x)<86)hurt(2);
          for(let i=0;i<6;i++){const a=-2.8+i*.5;
            ebul.push({x:b.x,y:GY-6,vx:Math.cos(a)*3.5,vy:Math.sin(a)*3.5,r:4,col:P.pu1,life:120});}
          b.ceil=false;b.st='rest';b.cd=48;}}break;}
    default:b.st='rest';b.cd=40;
  }
}

/* ============================================================
   РЕНДЕР БОЙЦА — стройные пропорции как в Contra
   ============================================================ */
function chain(ox,oy,a1,l1,a2,l2){
  const kx=ox+Math.sin(a1)*l1,ky=oy+Math.cos(a1)*l1;
  return {kx,ky,fx:kx+Math.sin(a1+a2)*l2,fy:ky+Math.cos(a1+a2)*l2};
}
function boot(x,y,f,c,gr){
  if(gr.boots==='heavy'){box(x-4,y-5,9,6,c.boot,P.n);px(x-3,y-4,7,1,c.bootHi);px(x-5,y-1,11,2,P.mt5);}
  else if(gr.boots==='light'){box(x-3,y-4,7,5,c.boot,P.n);px(x-2,y-3,5,1,c.bootHi);px(x-4,y-1,9,2,P.d1);}
  else if(gr.boots==='tech'){box(x-4,y-5,9,6,c.boot,P.n);px(x-3,y-4,7,1,c.bootHi);px(x-1,y-3,3,2,c.acc);}
  else {box(x-3,y-5,8,6,c.boot,P.n);px(x-2,y-4,6,1,c.bootHi);px(x-4,y-1,10,2,P.br5);}
}
function head(cx,cy,f,c,gr){
  if(gr.head==='helmet'){
    ellO(cx,cy,5.5,5.5,c.helm,P.n);ell(cx-1,cy-1,4,3.5,c.helmHi);
    px(cx-6,cy+1,12,1,c.helmLo);ell(cx+f*2,cy+2,3.5,3,c.skin);
    px(cx+f*1,cy+1,6,2,P.cy4);px(cx+f*2,cy+1,4,1,P.cy2);
  } else if(gr.head==='hood'){
    ellO(cx,cy,6,6,c.helm,P.n);ell(cx-1,cy-1,4,4,c.helmHi);
    ell(cx+f*2,cy+1,3.5,3.5,c.skin);px(cx+f*3,cy,1,1,P.n);
    tri(cx-f*5,cy-3,5,8,c.helmLo,-1);
  } else if(gr.head==='goggles'){
    ellO(cx,cy,5,5.5,c.skin,P.n);ell(cx-1,cy-1,3.5,3.5,c.skinHi);
    ell(cx,cy-3,5.5,3.5,c.helm);px(cx-6,cy-2,12,1,c.helmLo);
    box(cx+f*1-3,cy,7,3,P.mt5,P.n);px(cx+f*1-2,cy+1,3,1,c.acc);px(cx+f*1+2,cy+1,2,1,c.acc);
    line(cx-f*4,cy-5,cx-f*7,cy-12,P.mt2,1);px(cx-f*8,cy-14,2,2,c.acc);
  } else {
    ellO(cx,cy,4.5,5,c.skin,P.n);ell(cx-1,cy-1,3,3.5,c.skinHi);
    px(cx+f*3,cy,1,1,P.n);px(cx+f*2,cy+3,3,1,c.skinLo);
    ell(cx,cy-3,5,3,c.helm);px(cx-5,cy-2,10,1,c.helmLo);px(cx-5,cy-4,10,1,c.helmHi);
    tri(cx-f*5,cy-2,5,7,c.helm,-1);px(cx-f*7,cy+2,3,2,c.helmLo);
  }
}
function torso(cx,y,f,c,gr){
  const base=gr.chest==='bare'?c.skin:(gr.chest==='plate'?c.vest:c.pants);
  const hi=gr.chest==='bare'?c.skinHi:(gr.chest==='plate'?c.vestHi:c.pantsHi);
  const lo=gr.chest==='bare'?c.skinLo:(gr.chest==='plate'?c.vestLo:c.pantsLo);
  limb(cx,y+1,cx,y+10,9,base,hi,lo,P.n);
  if(gr.chest==='bare'){px(cx-3,y+2,6,1,c.skinLo);px(cx-1,y+4,2,4,c.skinLo);}
  if(gr.vest==='plate'){box(cx-5,y+1,10,9,c.vest,P.n);px(cx-4,y+2,8,1,c.vestHi);
    px(cx-1,y+3,2,6,c.acc);px(cx-5,y+6,10,1,c.vestLo);}
  else if(gr.vest==='bandolier'){
    for(let i=0;i<5;i++){px(cx-5+i*2,y+1+i*2,3,2,P.yl3);px(cx-5+i*2,y+1+i*2,3,1,P.yl1);}
    px(cx-4,y+9,8,2,c.vest);}
  else if(gr.vest==='light'){box(cx-4,y+2,8,7,c.vest,P.n);px(cx-3,y+3,6,1,c.vestHi);
    px(cx-1,y+3,1,6,c.vestLo);px(cx-4,y+8,8,1,c.acc);}
  else {box(cx-5,y+1,10,9,c.vest,P.n);px(cx-4,y+2,8,1,c.vestHi);
    for(let i=0;i<2;i++)px(cx-5,y+4+i*3,10,1,c.vestLo);
    px(cx-2,y+4,4,3,c.acc);}
  px(cx-5,y+10,10,2,P.br4);px(cx-1,y+10,3,2,P.yl3);
  if(gr.shoulder==='pauldron'){ellO(cx-f*5,y+2,4,3.5,c.vest,P.n);ell(cx-f*5,y+1,3,2,c.vestHi);
    ellO(cx+f*5,y+2,4,3.5,c.vest,P.n);ell(cx+f*5,y+1,3,2,c.vestHi);}
  else if(gr.shoulder==='plate'){box(cx-f*7,y+1,4,4,c.vest,P.n);box(cx+f*3,y+1,4,4,c.vest,P.n);}
  if(gr.pack==='heavy'){box(cx-f*8,y+2,5,9,P.mt4,P.n);px(cx-f*7,y+3,3,1,P.mt3);}
  else if(gr.pack==='tech'){box(cx-f*8,y+2,5,9,P.mt4,P.n);
    for(let i=0;i<3;i++)px(cx-f*7,y+4+i*2,3,1,c.acc);}
  if(gr.head==='hood'){px(cx-5,y-1,10,2,c.acc);
    const w=Math.sin(tick*.12)*2;px(cx-f*8,y+2+w,3,7,c.acc);}
}
function arm(sx,sy,ex,ey,f,c,gr,fr){
  const mx_=(sx+ex)/2,my_=(sy+ey)/2,dx=ex-sx,dy=ey-sy,L=Math.hypot(dx,dy)||1,b=fr?-2:2;
  const kx=mx_+(-dy/L)*b,ky=my_+(dx/L)*b;
  const bare=gr.arms==='bare';
  const bs=bare?c.skin:c.pants,hi=bare?c.skinHi:c.pantsHi,lo=bare?c.skinLo:c.pantsLo;
  limb(sx,sy,kx,ky,bare?4:4,bs,hi,lo,P.n);
  limb(kx,ky,ex,ey,3,bs,hi,lo,P.n);
  if(gr.arms==='gauntlet')box(kx-2,ky-2,5,5,c.vest,P.n);
  if(gr.arms==='tech')px(kx-1,ky-1,3,3,c.acc);
  ell(ex,ey,2,2,bare?c.skinLo:P.d2);
}
function gun(hx,hy,a,c,p){
  const r=p.recoil*.7,bx=hx-a.x*r,by=hy-a.y*r,ex=bx+a.x*17,ey=by+a.y*17;
  line(bx-a.x*6,by-a.y*6,ex,ey,P.n,5);
  line(bx-a.x*6,by-a.y*6,ex,ey,c.gun,3);
  line(bx-a.x*5,by-a.y*5-1,ex-a.x*2,ey-a.y*2-1,c.gunHi,1);
  px(bx-a.x*7-a.y*2,by-a.y*7+a.x*2,3,3,P.mt5);
  if(p.weapon==='laser')px(ex-a.x*3,ey-a.y*3,2,2,c.acc);
  if(p.weapon==='fire')px(ex-a.x*3,ey-a.y*3,3,3,P.or3);
  if(p.muzzle>0){const mx_=ex+a.x*4,my_=ey+a.y*4;
    glow(mx_,my_,13,'rgba(255,225,140,.9)',.85);
    ell(mx_,my_,4,4,P.fl1);ell(mx_+a.x*3,my_+a.y*3,2,2,P.w);
    for(let i=0;i<4;i++){const an=Math.atan2(a.y,a.x)+(i-1.5)*.4;
      line(mx_,my_,mx_+Math.cos(an)*8,my_+Math.sin(an)*8,P.fl2,1);}}
}
function drawChar(p,prev){
  const c=p.ch.pal,gr=p.ch.gear,X=Math.round(p.x-cam.x),Y=Math.round(p.y);
  if(!prev&&p.inv>0&&(tick>>2)%2)return;
  const f=p.face,cx=X+p.w/2,run=p.moving,air=!p.onGround&&!prev,ph=p.anim;
  const bob=run?Math.abs(Math.sin(ph))*1.2:Math.sin(p.breath)*.5;
  if(p.prone){
    const by=Y+p.h;
    limb(cx-f*9,by-6,cx+f*3,by-6,7,c.pants,c.pantsHi,c.pantsLo,P.n);
    boot(cx-f*11,by-1,f,c,gr);
    limb(cx-f*1,by-7,cx+f*8,by-8,8,gr.chest==='bare'?c.skin:c.pants,c.skinHi,c.pantsLo,P.n);
    head(cx+f*10,by-9,f,c,gr);
    arm(cx+f*6,by-8,cx+f*13,by-7,f,c,gr,true);
    gun(cx+f*14,by-7,{x:f,y:0},c,p);
    return;
  }
  const hipY=Y+24+bob,shY=Y+13+bob,hdY=Y+6+bob;
  let la,lb;
  if(air){la={a1:-.6*f,a2:1.1};lb={a1:.35*f,a2:.4};if(p.vy<0){la.a1=-.75*f;la.a2=1.3;}}
  else if(run){const s1=Math.sin(ph),s2=Math.sin(ph+Math.PI);
    la={a1:s1*.75*f,a2:Math.max(0,-Math.cos(ph))*1.0};
    lb={a1:s2*.75*f,a2:Math.max(0,Math.cos(ph))*1.0};}
  else {la={a1:-.12*f,a2:.05};lb={a1:.14*f,a2:.04};}
  const A=chain(cx-f*1.5,hipY,la.a1,7,la.a2,7),B=chain(cx+f*1.5,hipY,lb.a1,7,lb.a2,7);
  limb(cx+f*1.5,hipY,B.kx,B.ky,4,c.pantsLo,c.pants,c.pantsLo,P.n);
  limb(B.kx,B.ky,B.fx,B.fy,3,c.pantsLo,c.pants,c.pantsLo,P.n);
  boot(B.fx,B.fy+1,f,c,gr);
  torso(cx,shY-1,f,c,gr);
  limb(cx-f*1.5,hipY,A.kx,A.ky,5,c.pants,c.pantsHi,c.pantsLo,P.n);
  limb(A.kx,A.ky,A.fx,A.fy,4,c.pants,c.pantsHi,c.pantsLo,P.n);
  if(gr.legs==='armored')box(A.kx-2,A.ky-2,5,4,c.vest,P.n);
  if(gr.legs==='exo')px(A.kx-1,A.ky-1,3,3,c.acc);
  if(gr.legs==='cargo')px(A.kx-f*3,A.ky-2,3,4,c.pantsLo);
  boot(A.fx,A.fy+1,f,c,gr);
  head(cx+f*.5,hdY,f,c,gr);
  const a=p.aim,gx=cx+f*.5,gy=shY+2,hx=gx+a.x*14,hy=gy+a.y*14;
  arm(gx-f*3,gy+1,hx-a.x*6,hy-a.y*6,f,c,gr,false);
  arm(gx+f*2,gy,hx-a.x*3,hy-a.y*3,f,c,gr,true);
  gun(hx,hy,a,c,p);
  if(p.dashT>0)glow(cx,Y+20,22,'rgba(53,224,255,.45)',.6);
  if(p.webT>0)for(let i=0;i<5;i++)line(cx-8+i*4,Y+2,cx-6+i*4,Y+p.h,'rgba(255,255,255,.45)',1);
  if(p.drone&&p.drone.x!=null){
    const dx=p.drone.x-cam.x,dy=p.drone.y;
    ellO(dx,dy,6,3,P.mt2,P.n);px(dx-2,dy-1,4,2,P.cy2);
    px(dx-8,dy-3,3,1,P.mt1);px(dx+5,dy-3,3,1,P.mt1);
    glow(dx,dy,10,'rgba(53,224,255,.4)',.55);}
}

/* ---------- враги ---------- */
function drawFoe(f){
  const X=Math.round(f.x-cam.x),Y=Math.round(f.y),cx=X+f.w/2;
  const h=f.hitT>0&&(tick>>1)%2,base=h?P.w:f.def.col,ph=f.anim;
  switch(f.type){
    case 'runner':{
      const s1=Math.sin(ph),s2=Math.sin(ph+3.14);
      const A=chain(cx,Y+22,s1*.7*f.face,6,Math.max(0,-Math.cos(ph))*.9,6);
      const B=chain(cx,Y+22,s2*.7*f.face,6,Math.max(0,Math.cos(ph))*.9,6);
      limb(cx,Y+22,B.kx,B.ky,4,P.gr5,P.gr4,P.n,P.n);limb(B.kx,B.ky,B.fx,B.fy,3,P.gr5,P.gr4,P.n,P.n);
      limb(cx,Y+10,cx,Y+23,8,base,P.gr2,P.gr5,P.n);
      box(cx-4,Y+12,8,6,P.br4,P.n);
      ellO(cx+f.face,Y+5,4,4.5,P.sk3,P.n);ell(cx+f.face,Y+2,4.5,2.5,P.rd3);
      px(cx+f.face*2,Y+5,2,1,P.rd1);
      line(cx,Y+14,cx+f.face*11,Y+15,P.mt3,2);
      limb(cx,Y+22,A.kx,A.ky,4,P.gr4,P.gr3,P.n,P.n);limb(A.kx,A.ky,A.fx,A.fy,3,P.gr4,P.gr3,P.n,P.n);
      break;}
    case 'crawler':{
      ellO(cx,Y+8,11,6,base,P.n);ell(cx-2,Y+6,7,3,P.pu2);
      for(let i=-3;i<=3;i++){const s=Math.sin(ph*2+i)*3;
        line(cx+i*3,Y+10,cx+i*4+s,Y+15,P.pu4,2);}
      px(cx+f.face*6,Y+6,3,2,P.rd2);glow(cx+f.face*5,Y+7,7,'rgba(255,74,61,.35)',.5);break;}
    case 'shooter':case 'grenadier':case 'sniper':{
      limb(cx-2,Y+22,cx-3,Y+33,4,P.d3,P.g2,P.n,P.n);
      limb(cx+2,Y+22,cx+3,Y+33,4,P.d3,P.g2,P.n,P.n);
      limb(cx,Y+10,cx,Y+23,8,base,P.g3,P.d2,P.n);
      box(cx-4,Y+12,8,7,f.type==='sniper'?P.cy4:P.br4,P.n);
      ellO(cx,Y+5,4.5,4.5,P.sk3,P.n);ell(cx,Y+2,5,2.5,f.type==='sniper'?P.cy3:P.br5);
      const a=f.aimA||0;
      line(cx,Y+14,cx+Math.cos(a)*14,Y+14+Math.sin(a)*14,P.n,4);
      line(cx,Y+14,cx+Math.cos(a)*14,Y+14+Math.sin(a)*14,P.mt3,2);
      if(f.type==='sniper'&&f.charge>0){
        const al=(34-f.charge)/34;
        for(let d=14;d<460;d+=6)px(cx+Math.cos(a)*d,Y+14+Math.sin(a)*d,1,1,'rgba(255,74,61,'+(al*.7)+')');
        glow(cx+Math.cos(a)*14,Y+14+Math.sin(a)*14,8,'rgba(53,224,255,.6)',al);}
      px(cx+f.face*2,Y+5,2,1,P.yl2);break;}
    case 'turret':{
      box(X,Y+7,26,15,P.mt4,P.n);px(X+1,Y+8,24,2,P.mt2);px(X+2,Y+18,22,2,P.mt5);
      ellO(cx,Y+8,9,6,P.mt3,P.n);ell(cx-2,Y+6,5,3,P.mt2);
      const a=f.aimA||0;
      line(cx,Y+8,cx+Math.cos(a)*17,Y+8+Math.sin(a)*17,P.n,6);
      line(cx,Y+8,cx+Math.cos(a)*17,Y+8+Math.sin(a)*17,P.mt2,4);
      px(cx-2,Y+6,4,3,P.rd2);glow(cx,Y+7,9,'rgba(255,74,61,.4)',.55);break;}
    case 'flyer':{
      const w=Math.sin(tick*.3)*5;
      ellO(cx,Y+7,12,6,base,P.n);ell(cx-2,Y+5,7,3,P.pu1);
      tri(cx-18,Y+2+w,12,6,P.pu3,-1);tri(cx+6,Y+2-w,12,6,P.pu3,-1);
      px(cx-3,Y+5,6,2,P.cy2);glow(cx,Y+7,13,'rgba(162,75,255,.35)',.55);break;}
    case 'jumper':{
      const t=f.onGround?0:1;
      limb(cx-2,Y+14,cx-6,Y+25-t*4,4,base,P.or1,P.d2,P.n);
      limb(cx+2,Y+14,cx+6,Y+25-t*4,4,base,P.or1,P.d2,P.n);
      ellO(cx,Y+9,8,8,base,P.n);ell(cx-2,Y+7,5,4,P.or1);
      px(cx-4,Y+7,3,3,P.yl2);px(cx+1,Y+7,3,3,P.yl2);break;}
    case 'pod':{
      ellO(cx,Y+8,11,8,P.cy4,P.n);px(cx-6,Y+4,12,7,P.cy1);px(cx-6,Y+4,12,2,P.w);
      txt('?',cx-2,Y+5,P.bl5,1);glow(cx,Y+8,16,'rgba(53,224,255,.45)',.6);break;}
  }
  if(f.hp<f.maxhp){px(X,Y-5,f.w,3,P.n);px(X,Y-5,Math.round(f.w*f.hp/f.maxhp),3,P.rd2);}
}

/* ---------- БОССЫ: новая графика ---------- */
function furStrokes(x,y,w,h,c,n,seed){
  for(let i=0;i<n;i++){const h1=hash(seed+i,3),h2=hash(seed+i,9);
    const sx=x-w/2+h1*w,sy=y-h/2+h2*h;
    line(sx,sy,sx+2,sy+3,c,1);}
}
function drawBoss(){
  const b=boss;if(!b)return;
  const X=Math.round(b.x-cam.x),Y=Math.round(b.y);
  const h=b.hitT>0&&(tick>>1)%2,tele=b.st==='tele'&&(tick>>2)%2,id=b.def.id;

  if(id==='dog'){
    const B=h?P.w:(tele?P.or1:P.fur2),D=P.fur3,L=P.fur1,O=P.fur4;
    let hx=X-b.face*b.w*.40,hy=Y-b.h*.52;
    for(let i=0;i<b.tail.length;i++){const t=b.tail[i],tx=t.x-cam.x,ty=t.y;
      line(hx,hy,tx,ty,O,7-i);line(hx,hy,tx,ty,B,5-i);hx=tx;hy=ty;}
    if(b.atk==='tail'&&b.st==='act'){const sw=Math.sin(b.swing*3.1);
      const ex=X-b.face*(b.w*.5+44*Math.abs(sw));
      line(X-b.face*b.w*.4,Y-12,ex,Y-8,O,10);line(X-b.face*b.w*.4,Y-12,ex,Y-8,L,6);
      glow(ex,Y-8,18,'rgba(255,163,42,.5)',.6);}
    for(let i=0;i<4;i++){
      const lx=X-38+i*25,s=Math.sin(b.anim*2+i)*3,back=i<2;
      const K=chain(lx,Y-30,Math.sin(b.anim*2+i)*.3,14,back?.4:-.3,14);
      limb(lx,Y-30,K.kx,K.ky,back?6:8,back?D:B,L,O,P.n);
      limb(K.kx,K.ky,K.fx,K.fy,back?5:6,back?D:B,L,O,P.n);
      ell(K.fx,K.fy,5,3,O);for(let k=0;k<3;k++)px(K.fx-3+k*3,K.fy+1,2,2,P.n);}
    ellO(X-b.face*6,Y-b.h*.56,b.w*.40,b.h*.34,B,O);
    ell(X-b.face*10,Y-b.h*.66,b.w*.30,b.h*.20,L);
    ell(X+b.face*16,Y-b.h*.40,b.w*.20,b.h*.20,D);
    ell(X-b.face*2,Y-b.h*.30,b.w*.28,b.h*.12,O);
    furStrokes(X,Y-b.h*.55,b.w*.7,b.h*.5,D,18,b.idx*7);
    const hxx=X+b.face*b.w*.40,hyy=Y-b.h*.76;
    ellO(hxx,hyy,17,14,B,O);ell(hxx-b.face*3,hyy-4,11,8,L);
    ellO(hxx+b.face*15,hyy+6,11,7,L,O);
    ell(hxx+b.face*23,hyy+5,3.5,3,P.n);
    tri(hxx-b.face*12,hyy-19,10,15,D,1);tri(hxx-b.face*10,hyy-15,6,10,P.rd4,1);
    tri(hxx+b.face*3,hyy-20,9,14,D,1);
    const eg=(b.st==='tele'&&b.atk==='fireball')?1:.5;
    ell(hxx+b.face*5,hyy-3,3.5,2.5,P.rd2);px(hxx+b.face*5,hyy-4,2,1,P.yl1);
    glow(hxx+b.face*6,hyy-3,11,'rgba(255,74,61,'+eg+')',.85);
    px(hxx+b.face*1,hyy-8,8,2,D);
    if(b.st==='act'&&b.atk==='fireball'){
      ell(hxx+b.face*19,hyy+9,8,6,P.rd5);ell(hxx+b.face*19,hyy+9,5,3,P.fl3);
      glow(hxx+b.face*23,hyy+9,20,'rgba(255,106,26,.85)',.85);
    } else {
      px(hxx+b.face*11,hyy+11,13,2,P.n);
      for(let i=0;i<4;i++)tri(hxx+b.face*(7+i*3),hyy+11,3,4,P.w,-1);}
  }

  if(id==='cat'){
    const B=h?P.w:(tele?P.pu1:P.cat2),D=P.cat3,L=P.cat1,O=P.cat4;
    let hx=X-b.face*b.w*.44,hy=Y-b.h*.58;
    for(let i=0;i<b.tail.length;i++){const t=b.tail[i],tx=t.x-cam.x,ty=t.y-8;
      line(hx,hy,tx,ty,O,6-i);line(hx,hy,tx,ty,B,4-i);hx=tx;hy=ty;}
    for(let i=0;i<4;i++){
      const lx=X-40+i*26,back=i<2;
      const K=chain(lx,Y-28,Math.sin(b.anim*2.2+i)*.35,13,back?.5:-.4,13);
      limb(lx,Y-28,K.kx,K.ky,back?5:7,back?D:B,L,O,P.n);
      limb(K.kx,K.ky,K.fx,K.fy,back?4:5,back?D:B,L,O,P.n);
      ell(K.fx,K.fy,4,2.5,O);
      if(b.atk==='claw'&&b.st==='act'&&i>=2){
        const re=Math.sin(Math.min(1,b.clawT)*3.14)*58;
        for(let k=-1;k<=1;k++){
          line(X+b.face*(b.w*.4),Y-b.h*.45+k*6,X+b.face*(b.w*.4+re),Y-b.h*.45+k*9,P.n,3);
          line(X+b.face*(b.w*.4),Y-b.h*.45+k*6,X+b.face*(b.w*.4+re),Y-b.h*.45+k*9,P.w,1);}
        glow(X+b.face*(b.w*.4+re),Y-b.h*.45,20,'rgba(255,255,255,.4)',.6);}}
    ellO(X-b.face*4,Y-b.h*.58,b.w*.42,b.h*.30,B,O);
    ell(X-b.face*8,Y-b.h*.68,b.w*.30,b.h*.17,L);
    ell(X+b.face*20,Y-b.h*.44,b.w*.18,b.h*.22,D);
    for(let i=0;i<6;i++)ell(X-34+i*14,Y-b.h*.60,3,2,D);
    furStrokes(X,Y-b.h*.58,b.w*.7,b.h*.45,D,14,31);
    const hxx=X+b.face*b.w*.42,hyy=Y-b.h*.80;
    ellO(hxx,hyy,15,13,B,O);ell(hxx-b.face*2,hyy-3,10,7,L);
    tri(hxx-b.face*12,hyy-19,10,15,D,1);tri(hxx-b.face*10,hyy-15,6,9,P.rd4,1);
    tri(hxx+b.face*4,hyy-20,9,14,D,1);tri(hxx+b.face*6,hyy-16,5,8,P.rd4,1);
    const gl=b.eyeGlow||((b.st==='tele'&&b.atk==='eyebeam')?.9:.4);
    ell(hxx+b.face*3,hyy-2,3.5,2.5,P.cy2);ell(hxx+b.face*10,hyy-2,3,2.5,P.cy2);
    px(hxx+b.face*3,hyy-3,1,1,P.w);
    glow(hxx+b.face*7,hyy,17,'rgba(53,224,255,'+gl+')',.9);
    tri(hxx+b.face*14,hyy+5,4,3,P.rd1,-1);
    for(let i=-1;i<2;i++)line(hxx+b.face*13,hyy+6+i*3,hxx+b.face*28,hyy+3+i*5,P.w,1);
    if(b.atk==='eyebeam'&&b.st==='act'){
      const a=b.beamA+Math.sin(b.beamT*2.2)*.5;
      for(let d=18;d<460;d+=4){const bx=hxx+Math.cos(a)*d,by=hyy+Math.sin(a)*d;
        px(bx-3,by-3,6,6,d%12<6?P.cy1:P.cy2);}
      glow(hxx,hyy,26,'rgba(53,224,255,.7)',.85);}
  }

  if(id==='spider'){
    const B=h?P.w:(tele?P.rd2:'#4a2068'),D='#2a1040',L=P.pu3,O='#160a26';
    for(let i=0;i<8;i++){
      const sd=i<4?-1:1,k=i%4,bx=X+sd*16,by=Y-b.h*.55,ex=b.legs[i].ext||0;
      const kx=bx+sd*(36+k*9),ky=by-30+Math.sin(b.anim*1.6+i)*4;
      const fx=bx+sd*(56+k*13)+(k-1.5)*7,fy=Y+ex*5;
      limb(bx,by,kx,ky,6,D,B,O,P.n);limb(kx,ky,fx,fy,5,D,B,O,P.n);
      line(kx,ky-1,fx,fy-1,L,1);tri(fx-2,fy-3,5,6,P.n,-1);
      if(ex>.3)glow(fx,fy,12,'rgba(255,74,61,.5)',.65);}
    ellO(X-b.face*20,Y-b.h*.62,b.w*.32,b.h*.36,B,O);
    ell(X-b.face*23,Y-b.h*.72,b.w*.22,b.h*.22,L);
    for(let i=0;i<4;i++){ell(X-b.face*(17+i*8),Y-b.h*.62+i*4,5-i,3-i,P.rd3);
      ell(X-b.face*(17+i*8),Y-b.h*.62+i*4,2,1,P.rd4);}
    ellO(X+b.face*16,Y-b.h*.52,b.w*.24,b.h*.26,B,O);
    ell(X+b.face*19,Y-b.h*.60,b.w*.16,b.h*.16,L);
    const eg=b.phase>=3?P.rd2:P.rd1;
    for(let i=0;i<8;i++){const ex=X+b.face*(24+(i%4)*5),ey=Y-b.h*.66+((i/4)|0)*6;
      ell(ex,ey,2,2,eg);px(ex,ey-1,1,1,P.w);}
    glow(X+b.face*30,Y-b.h*.62,22,b.phase>=3?'rgba(255,74,61,.7)':'rgba(255,154,134,.4)',.85);
    tri(X+b.face*30,Y-b.h*.42,5,10,P.w,-1);tri(X+b.face*37,Y-b.h*.42,5,10,P.w,-1);
    if(b.ceil)for(let i=0;i<9;i++)line(X-76+i*19,0,X,Y-b.h,'rgba(255,255,255,.22)',1);
  }

  const bw=280,bx=(W-bw)/2,by=H-18;
  px(bx-3,by-3,bw+6,12,P.n);px(bx-2,by-2,bw+4,10,P.d1);
  const r=clamp(b.hp/b.maxhp,0,1);
  for(let i=0;i<bw*r;i++){px(bx+i,by,1,8,r>.6?P.rd2:r>.3?P.or2:P.yl2);
    if(i%3===0)px(bx+i,by,1,3,P.rd1);}
  txtCSh(b.def.name+'  ·  ФАЗА '+b.phase,W/2,by-12,P.w,1);
  if(bIntro>0){
    g.globalAlpha=Math.min(1,(150-bIntro)/25);
    px(0,96,W,64,'rgba(7,10,16,.86)');px(0,96,W,2,P.rd2);px(0,158,W,2,P.rd2);
    txtCSh('ВНИМАНИЕ',W/2,102,P.rd2,3);txtCSh(b.def.name,W/2,128,P.yl2,2);
    txtCSh(b.def.sub,W/2,146,P.g4,1);g.globalAlpha=1;}
}

/* ---------- фон / прочее ---------- */
function drawSky(){
  vgrad(0,0,W,H,th.sky[0],th.sky[1]);
  if(lvl.theme==='lair'){for(let i=0;i<40;i++)px((i*61+((tick*.2)|0))%W,(i*37)%150,1,1,i%4?P.pu3:P.pu2);}
  else {ell(372,38,17,17,P.yl1);glow(372,38,40,'rgba(255,240,170,.28)',.45);
    for(let i=0;i<6;i++){const x=((i*113-tick*.1)%560+560)%560-50;ell(x,30+i*11,24,6,'rgba(255,255,255,.13)');}}
}
function drawPar(){
  const f=-(cam.x*.18)%896,m=-(cam.x*.42)%896;
  g.drawImage(farCv,f,0);g.drawImage(farCv,f+896,0);
  g.drawImage(midCv,m,0);g.drawImage(midCv,m+896,0);
}
function drawTiles(){
  const sx=clamp(cam.x|0,0,lvl.w*TS-W);
  g.drawImage(tileCv,sx,0,W,H,0,0,W,H);
  for(let x=Math.floor(sx/TS);x<Math.floor(sx/TS)+30;x++)
    for(let y=13;y<16;y++)if(T(x,y)==='~'){
      const X=x*TS-sx,Y=y*TS,o=(tick>>3)%4;
      px(X,Y+o,TS,1,th.water3);px(X+((x*5+o*3)%12),Y+o+4,5,1,th.water2);}
}
function drawBul(){
  bul.forEach(b=>{const X=b.x-cam.x,Y=b.y;
    if(b.kind==='laser'){const a=Math.atan2(b.vy,b.vx);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,P.cy4,6);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,P.cy2,4);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,P.cy1,2);
      glow(X,Y,10,'rgba(53,224,255,.6)',.65);}
    else if(b.kind==='fire'){ell(X,Y,6,6,P.fl4);ell(X,Y,4.5,4.5,P.fl3);ell(X,Y,3,3,P.fl2);ell(X,Y,1.5,1.5,P.fl1);
      glow(X,Y,14,'rgba(255,106,26,.55)',.65);}
    else if(b.kind==='homing'){ell(X,Y,4,3,P.pu2);ell(X,Y,2,2,P.pu1);glow(X,Y,9,'rgba(217,179,255,.5)',.55);}
    else {const a=Math.atan2(b.vy,b.vx);
      line(X-Math.cos(a)*b.len,Y-Math.sin(a)*b.len,X,Y,b.col,3);
      line(X-Math.cos(a)*b.len*.6,Y-Math.sin(a)*b.len*.6,X,Y,P.w,1);}});
  ebul.forEach(b=>{const X=b.x-cam.x,Y=b.y;
    if(b.fire){ell(X,Y,b.r+2,b.r+2,P.fl4);ell(X,Y,b.r,b.r,P.fl3);ell(X,Y,b.r-2,b.r-2,P.fl2);ell(X,Y,2,2,P.w);
      glow(X,Y,b.r*3.4,'rgba(255,106,26,.5)',.65);}
    else if(b.web){for(let i=0;i<6;i++)line(X-b.r,Y-b.r+i*2,X+b.r,Y-b.r+i*2,'rgba(255,255,255,.8)',1);
      line(X-b.r,Y-b.r,X+b.r,Y+b.r,'rgba(255,255,255,.8)',1);}
    else {ellO(X,Y,b.r+1,b.r+1,b.col,P.n);ell(X,Y,b.r-1,b.r-1,P.w);
      glow(X,Y,b.r*2.6,'rgba(255,163,42,.35)',.45);}});
}
function drawItems(){
  items.forEach(it=>{const X=it.x-cam.x,Y=it.y+Math.sin(it.t*.12)*2;
    if(it.life<120&&(tick>>2)%2)return;
    if(it.kind==='heal'){ellO(X,Y,9,9,P.rd3,P.n);px(X-2,Y-5,4,10,P.w);px(X-5,Y-2,10,4,P.w);}
    else if(it.kind==='spec'){ellO(X,Y,9,9,P.cy4,P.n);txt('S',X-2,Y-3,P.cy1,1);}
    else {box(X-10,Y-9,20,18,P.d2,P.n);px(X-9,Y-8,18,3,P.g2);txt(WEAPONS[it.kind].key,X-2,Y-3,WEAPONS[it.kind].col,1);}
    glow(X,Y,17,'rgba(255,212,0,.28)',.55);});
}
function drawParts(){
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.life--;
    if(p.life<=0){parts.splice(i,1);continue;}
    const a=p.life/p.max;
    if(p.ring){g.globalAlpha=a;g.strokeStyle=p.c;g.lineWidth=2;
      g.beginPath();g.arc(p.x-cam.x,p.y,p.r+(1-a)*p.rr,0,6.283);g.stroke();g.globalAlpha=1;continue;}
    if(p.puddle){g.globalAlpha=Math.min(.6,a);ell(p.x-cam.x,p.y,p.r,4,p.c);g.globalAlpha=1;
      if(pl&&pl.inv<=0&&Math.abs(pl.x+7-p.x)<p.r&&pl.y+pl.h>p.y-5)hurt(1);continue;}
    p.vy+=p.g||0;p.x+=p.vx;p.y+=p.vy;
    g.globalAlpha=Math.min(1,a*1.4);px(p.x-cam.x,p.y,p.s||1,p.s||1,p.c);g.globalAlpha=1;}
  for(let i=txs.length-1;i>=0;i--){const t=txs[i];t.life--;t.y-=.42;
    if(t.life<=0){txs.splice(i,1);continue;}
    g.globalAlpha=Math.min(1,t.life/24);txtCSh(t.s,t.x-cam.x,t.y,t.c,1);g.globalAlpha=1;}
}
function drawWeather(){
  if(!th.weather)return;
  if(th.weather==='rain'){for(let i=0;i<90;i++){const x=(i*53+tick*8)%560-50,y=(i*37+tick*13)%290-20;
    line(x,y,x-2,y+9,'rgba(180,220,255,.32)',1);}}
  else {for(let i=0;i<44;i++)px((i*71+Math.sin(tick*.02+i)*16)%470-10,H-((tick*1.2+i*29)%300),1,1,i%3?P.or2:P.yl2);}
  if(th.fog){g.fillStyle=th.fog;g.fillRect(0,0,W,H);}
}
function drawHUD(){
  const p=pl;
  px(0,0,W,20,'rgba(7,10,16,.76)');px(0,20,W,1,P.d3);
  txtSh('СЧЁТ',5,2,P.g3,1);txtSh(String(score).padStart(7,'0'),5,11,P.w,1);
  txtSh('РЕКОРД',72,2,P.g3,1);txtSh(String(Math.max(hi,score)).padStart(7,'0'),72,11,P.yl2,1);
  if(p){txtSh(p.ch.name,160,2,P.cy2,1);
    for(let i=0;i<p.maxhp;i++){px(160+i*9,11,7,6,P.n);px(161+i*9,12,5,4,i<p.hp?P.rd2:P.d3);}
    const w=WEAPONS[p.weapon];
    box(258,2,17,16,P.d2,P.n);px(259,3,15,2,P.g2);txt(w.key,263,7,w.col,1);
    txtSh(w.name,280,2,P.g4,1);
    px(280,12,80,5,P.n);px(281,13,Math.round(78*p.spec/100),3,p.spec>=100?P.cy2:P.g2);
    if(p.spec>=100&&(tick>>3)%2)txtSh('ПРИЁМ ГОТОВ',280,11,P.cy2,1);}
  txtSh('ЖИЗНИ ×'+lives,384,2,P.w,1);txtSh('ЗОНА '+(si+1),384,11,P.g3,1);
  if(combo>1&&comboT>0)txtCSh('КОМБО ×'+combo,W/2,24,P.or2,1);
}
function wrap(s,x,y,mw,c,sc,lh){
  const ws=String(s).split(' ');let ln='',yy=y;
  ws.forEach(w=>{const t=ln?ln+' '+w:w;if(tw(t,sc)>mw){txt(ln,x,yy,c,sc);ln=w;yy+=lh;}else ln=t;});
  if(ln)txt(ln,x,yy,c,sc);
}
function drawTitle(){
  vgrad(0,0,W,H,'#101a30','#050710');
  for(let i=0;i<70;i++)px((i*67+tick*.4)%W,(i*41)%H,1,1,i%5?P.d3:P.g2);
  const t=Math.sin(tick*.04)*3;
  txtCSh('BALBES',W/2,30+t,P.rd2,6);txtCSh('FORCE',W/2,80+t,P.yl2,6);
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
  const cw=100,gap=8,sx=(W-(CHARS.length*cw+(CHARS.length-1)*gap))/2;
  CHARS.forEach((c,i)=>{
    const X=sx+i*(cw+gap),Y=24,on=i===sel;
    box(X,Y,cw,80,on?P.d3:P.d1,on?P.cy2:P.n);
    if(on){px(X,Y,cw,2,P.cy2);glow(X+cw/2,Y+42,48,'rgba(53,224,255,.2)',.6);}
    drawChar({ch:c,x:X+cw/2-BW/2+cam.x,y:Y+24,w:BW,h:SH,face:1,onGround:true,vx:0,
      anim:0,breath:tick*.05,prone:false,moving:false,aim:{x:1,y:0,raw:{x:1,y:0}},
      inv:0,muzzle:0,recoil:0,dashT:0,webT:0,drone:null,weapon:c.weapon},true);
    txtCSh(c.name,X+cw/2,Y+66,on?P.yl2:P.g3,1);});
  const c=CHARS[sel];
  box(10,112,W-20,66,P.d1,P.n);px(10,112,W-20,1,c.pal.acc);
  txtSh(c.name+' — '+c.role,16,117,c.pal.acc,1);
  [['БРОНЯ',c.hp/6],['СКОРОСТЬ',c.speed/2.55],['ПРЫЖОК',c.jump/6.9],['ТЕМП',c.rate/1.4],['УРОН',c.dmg/1.5]]
    .forEach((b,i)=>{const X=16+(i%3)*142,Y=130+((i/3)|0)*14;
      txt(b[0],X,Y,P.g3,1);px(X+58,Y+1,60,6,P.n);px(X+59,Y+2,Math.round(58*clamp(b[1],0,1)),4,c.pal.acc);});
  txtSh('ПРИЁМ: '+c.specName+' — '+c.specDesc,16,160,P.cy2,1);
  txtSh([c.dbl?'ДВОЙНОЙ ПРЫЖОК':null,c.dash?'РЫВОК':null,c.hover?'ПАРЕНИЕ':null].filter(Boolean).join(' · ')||'БАЗОВЫЙ НАБОР',16,171,P.yl3,1);
  wrap(c.desc,16,186,W-32,P.g4,1,10);
  if((tick>>4)%2)txtCSh('ОГОНЬ — В БОЙ',W/2,222,P.w,1);
  txtCSh('СТРЕЛКИ ВЛЕВО / ВПРАВО — ВЫБОР',W/2,238,P.g2,1);
}
function drawIntro(){
  px(0,0,W,H,P.n);g.globalAlpha=Math.min(1,introT/20);
  txtCSh(lvl.name,W/2,92,P.yl2,4);txtCSh(lvl.sub,W/2,128,P.w,1);
  txtCSh(CHARS[sel].name+' — '+CHARS[sel].role,W/2,152,P.cy2,1);
  txtCSh('ЦЕЛЬ: '+BOSSES[lvl.boss].name,W/2,172,P.rd2,1);g.globalAlpha=1;
}
function drawOver(){
  px(0,0,W,H,'rgba(8,4,4,.88)');
  txtCSh('ИГРА ОКОНЧЕНА',W/2,84,P.rd2,3);
  txtCSh('СЧЁТ '+score,W/2,124,P.w,1);txtCSh('РЕКОРД '+Math.max(hi,score),W/2,140,P.yl2,1);
  if((tick>>4)%2)txtCSh('ОГОНЬ — ЗАНОВО',W/2,176,P.g4,1);
}
function drawWin(){
  vgrad(0,0,W,H,'#1a1030','#050710');
  for(let i=0;i<80;i++)px((i*53+tick*1.4)%W,(i*37+tick*.7)%H,2,2,[P.yl2,P.cy2,P.rd2,P.gr1][i%4]);
  txtCSh('АРАХНА ПОВЕРЖЕНА',W/2,54,P.yl2,2);txtCSh('ДВОР СПАСЁН',W/2,82,P.w,2);
  txtCSh('ИТОГОВЫЙ СЧЁТ',W/2,116,P.g3,1);txtCSh(String(score).padStart(7,'0'),W/2,132,P.cy2,3);
  txtCSh('УНИЧТОЖЕНО ВРАГОВ: '+kills,W/2,172,P.g4,1);
  txtCSh('БОЕЦ: '+CHARS[sel].name,W/2,188,P.g4,1);
  if((tick>>4)%2)txtCSh('ОГОНЬ — В МЕНЮ',W/2,214,P.w,1);
}
function drawPause(){
  px(0,0,W,H,'rgba(6,9,16,.8)');
  txtCSh('ПАУЗА',W/2,96,P.cy2,3);txtCSh('СТАРТ — ПРОДОЛЖИТЬ',W/2,134,P.g4,1);
  txtCSh('Z ОГОНЬ · X ПРЫЖОК · C ПРИЁМ',W/2,154,P.g2,1);
  txtCSh('ВНИЗ — ЛЁЖА · ВНИЗ+X — СПРЫГНУТЬ',W/2,168,P.g2,1);
}

/* ---------- загрузка ---------- */
function loadStage(i){
  si=i;lvl={...LEVELS[i],rows:LEVELS[i].rows.slice()};th=THEMES[lvl.theme];
  buildTiles();buildPar();
  bul=[];ebul=[];foes=[];items=[];parts=[];txs=[];boss=null;
  cam={x:0,lock:false,shake:0};bIntro=0;clearT=0;combo=0;comboT=0;
  const ch=CHARS[sel],ks=pl?pl.spec:0,kw=pl?pl.weapon:ch.weapon;
  pl=mkPlayer(ch);pl.spec=ks;pl.weapon=kw;
  const MAP={e:'runner',s:'shooter',t:'turret',f:'flyer',j:'jumper',g:'grenadier',c:'crawler',n:'sniper',o:'pod'};
  for(let y=0;y<lvl.h;y++)for(let x=0;x<lvl.w;x++){
    const c=T(x,y),X=x*TS,Y=(y+1)*TS;
    if(c==='P'){pl.x=X;pl.y=GY-SH;}
    else if(MAP[c])spawn(MAP[c],X,Y);
  }
  foes.forEach(f=>{if(f.def.kind==='air')f.base=f.y+f.h;});
  introT=0;state='intro';SND.music(th.music);
}
function startGame(){lives=3;score=0;kills=0;pl=null;loadStage(0);}

/* ---------- цикл ---------- */
function update(){
  tick++;IN.poll();SND.tickMusic();
  if(comboT>0){comboT--;if(!comboT)combo=0;}
  if(flash>0)flash--;
  if(cam.shake>0)cam.shake*=.86;
  if(state==='title'){if(IN.edge.fire||IN.edge.start){SND.play('ok');state='select';SND.music('menu');}return;}
  if(state==='select'){
    if(IN.edge.left){sel=(sel+3)%4;SND.play('ui');}
    if(IN.edge.right){sel=(sel+1)%4;SND.play('ui');}
    if(IN.edge.fire||IN.edge.start){SND.play('ok');startGame();}return;}
  if(state==='intro'){introT++;if(introT>120||IN.edge.fire){state='play';SND.music(th.music);}return;}
  if(state==='gameover'){if(IN.edge.fire||IN.edge.start){SND.play('ok');state='select';SND.music('menu');}return;}
  if(state==='victory'){if(IN.edge.fire||IN.edge.start){SND.play('ok');state='title';SND.music('menu');}return;}
  if(state!=='play')return;
  if(IN.edge.start){paused=!paused;SND.play('ui');}
  if(paused)return;
  updPlayer();updFoes();updBullets();updItems();updBoss();
  const p=pl;
  if(p){
    const ax=(lvl.w-ARENA)*TS;
    if(!cam.lock&&p.x>ax&&!boss){spawnBoss(lvl.boss);cam.lock=true;}
    const tg=cam.lock?(lvl.w*TS-W):clamp(p.x-W*.38,0,lvl.w*TS-W);
    cam.x=clamp(lerp(cam.x,tg,cam.lock?.06:.14),0,lvl.w*TS-W);
    if(cam.lock)p.x=clamp(p.x,ax+4,lvl.w*TS-BW-4);
  }
  if(p&&p.dead&&deadT>72){
    if(lives<=0){state='gameover';SND.play('dead');SND.music('menu');
      if(score>hi){hi=score;localStorage.setItem('bf_hi',String(hi));}}
    else {const kw=p.weapon,ks=p.spec;pl=mkPlayer(CHARS[sel]);pl.weapon=kw;pl.spec=ks;
      pl.x=clamp(cam.x+50,20,lvl.w*TS-50);pl.y=90;pl.inv=115;deadT=0;}
  }
  if(clearT>0){
    clearT++;
    if(clearT>170){
      if(si>=LEVELS.length-1){state='victory';SND.music('win');
        if(score>hi){hi=score;localStorage.setItem('bf_hi',String(hi));}}
      else loadStage(si+1);
    }
  }
}
function render(){
  g.setTransform(1,0,0,1,0,0);
  const s=cam.shake>.4?cam.shake:0;
  g.save();if(s)g.translate(Math.round(rnd(-s,s)),Math.round(rnd(-s,s)));
  if(state==='title')drawTitle();
  else if(state==='select')drawSelect();
  else if(state==='intro')drawIntro();
  else if(state==='gameover'){drawSky();drawPar();drawTiles();drawOver();}
  else if(state==='victory')drawWin();
  else {
    drawSky();drawPar();drawTiles();drawItems();
    foes.forEach(drawFoe);
    if(boss)drawBoss();
    if(pl&&!pl.dead)drawChar(pl,false);
    drawBul();drawParts();drawWeather();drawHUD();
    if(clearT>0){
      px(0,100,W,50,'rgba(7,10,16,.84)');px(0,100,W,2,P.yl2);px(0,148,W,2,P.yl2);
      txtCSh('ЗОНА ЗАЧИЩЕНА',W/2,108,P.yl2,2);
      txtCSh('БОНУС '+BOSSES[lvl.boss].score,W/2,132,P.cy2,1);}
    if(paused)drawPause();
  }
  g.restore();
  if(flash>0){g.fillStyle='rgba(255,255,255,'+(flash/12)+')';g.fillRect(0,0,W,H);}
  vis.clearRect(0,0,W,H);vis.drawImage(buf,0,0,W,H);
}
let last=0,acc=0;
function loop(now){
  requestAnimationFrame(loop);
  if(!last)last=now;
  let dt=(now-last)/1000;last=now;if(dt>.25)dt=.25;
  acc+=dt;let gd=0;
  while(acc>=1/60&&gd<4){update();acc-=1/60;gd++;}
  render();
}
document.getElementById('bSound').addEventListener('click',e=>{
  SND.unlock();SND.set(!SND.get());e.currentTarget.classList.toggle('off',!SND.get());
  e.currentTarget.textContent=SND.get()?'🔊':'🔇';});
document.getElementById('bPause').addEventListener('click',()=>{if(state==='play'){paused=!paused;SND.play('ui');}});
document.getElementById('bFull').addEventListener('click',()=>{
  const el=document.documentElement;
  if(!document.fullscreenElement)(el.requestFullscreen||el.webkitRequestFullscreen||(()=>{})).call(el);
  else document.exitFullscreen();
  setTimeout(fit,220);});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){SND.suspend();if(state==='play')paused=true;}else SND.resume();});
IN.bindDom(document.getElementById('pad'));
SND.music('menu');fit();setTimeout(fit,120);
requestAnimationFrame(loop);
})();
