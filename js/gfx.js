/* ============================================================
   GFX v9 — параметрический гуманоид: пропорции 1:5 (голова:рост),
   длинные ноги, запечённая обводка, 8-кадровый бег, присед,
   выглядывание, спуск по канату. Атлас тело+позы, руки+ствол в рантайме.
   ============================================================ */
const GFX=(()=>{
'use strict';
const TH=34;               // рост стоя
const CW=34,CH=44,BX=9,BY=9;   // кадр композита, тело 26×36 внутри
const SHX=BX+13,SHY=BY+11;     // плечо в кадре

function pal(o){return Object.assign({
  out:'#0b0e15',skin:'#e8b078',skinHi:'#ffd9a8',skinLo:'#b07840',skinSh:'#8a5828',
  hair:'#3a2410',pants:'#2a6fb0',pantsHi:'#5aa8e0',pantsLo:'#17416e',pantsSh:'#0d2440',
  boot:'#4a2a10',bootHi:'#6a4020',bootLo:'#2c1808',
  vest:'#7a4a20',vestHi:'#a87038',vestLo:'#4a2a10',
  acc:'#c22a22',accHi:'#ff6a5a',gun:'#5b6a80',gunHi:'#9fb0c8',gunLo:'#2c3648',
  belt:'#3a2410',buckle:'#ffd400'},o);}

const PALS={
  antony:pal({pants:'#2a6fb0',pantsHi:'#5aa8e0',pantsLo:'#17416e',vest:'#8a5a28',
    vestHi:'#c08848',vestLo:'#5a3818',acc:'#c22a22',hair:'#3a2410'}),
  artyom:pal({pants:'#3d4759',pantsHi:'#63728a',pantsLo:'#242c3a',vest:'#8a2a20',
    vestHi:'#c24838',vestLo:'#4a120c',acc:'#ffa32a',hair:'#242c3a',skin:'#d8a068',skinHi:'#f0c090',skinLo:'#a06838'}),
  den:pal({pants:'#17416e',pantsHi:'#2a6fb0',pantsLo:'#0d2440',vest:'#1a6a78',
    vestHi:'#35a0b0',vestLo:'#0d3a44',acc:'#35e0ff',hair:'#1a2a3a',skin:'#ffd9a8',skinHi:'#fff3d8',skinLo:'#d8a068'}),
  dimka:pal({pants:'#3d1668',pantsHi:'#6a2bb0',pantsLo:'#240b40',vest:'#4a4a5e',
    vestHi:'#7a7a92',vestLo:'#2a2a3a',acc:'#a24bff',hair:'#2a2a3a'})
};
const GEAR={
  antony:{head:'bandana',chest:'bare',vest:'bandolier',shoulder:0,pack:0,knee:1},
  artyom:{head:'helmet',chest:'armor',vest:'plate',shoulder:1,pack:1,knee:2},
  den:{head:'hood',chest:'suit',vest:'light',shoulder:0,pack:0,knee:1,scarf:1},
  dimka:{head:'goggles',chest:'suit',vest:'exo',shoulder:2,pack:2,knee:2}
};
const EVAR=[
 pal({pants:'#3a5a20',pantsHi:'#5a8030',pantsLo:'#20380f',vest:'#4a6a28',vestHi:'#6a9038',vestLo:'#2a4014',acc:'#2c5e1c',hair:'#20380f'}),
 pal({pants:'#6a4a20',pantsHi:'#9a7038',pantsLo:'#3a280f',vest:'#7a5020',vestHi:'#a87838',vestLo:'#4a2c0f',acc:'#75451f',hair:'#3a280f'}),
 pal({pants:'#20385a',pantsHi:'#385a80',pantsLo:'#0f2038',vest:'#284a6a',vestHi:'#386a90',vestLo:'#142a40',acc:'#17416e',hair:'#0f2038'})
];

/* ---------- позы: [бедроA,коленоA, бедроB,коленоB, наклон, боб, рукаЗад] ---------- */
function runPose(i){
  const ph=i/8*Math.PI*2,s=Math.sin(ph),c=Math.cos(ph);
  return {la:[s*.85,Math.max(0,-c)*1.15],lb:[-s*.85,Math.max(0,c)*1.15],
          lean:.14,bob:Math.abs(c)*1.4,ba:-s*.7};
}
const POSE={
  idle:{la:[-.10,.06],lb:[.12,.05],lean:.02,bob:0,ba:.15},
  idle2:{la:[-.10,.06],lb:[.12,.05],lean:.02,bob:1,ba:.15},
  jump:{la:[-.95,1.35],lb:[.45,.55],lean:.10,bob:0,ba:-1.1},
  fall:{la:[-.55,.75],lb:[.50,.65],lean:.06,bob:0,ba:-.8},
  crouch:{la:[-1.25,2.1],lb:[1.15,2.2],lean:.34,bob:7,ba:.5},
  walk:{la:[.35,.5],lb:[-.35,.5],lean:.06,bob:.6,ba:.3}
};
const RUN=[0,1,2,3,4,5,6,7].map(runPose);

/* ---------- рисование гуманоида ---------- */
function seg(x,ax,ay,bx,by,w,c,hi,lo,out){
  const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  x.strokeStyle=out;x.lineWidth=w+2;x.lineCap='round';
  x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke();
  x.strokeStyle=c;x.lineWidth=w;
  x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke();
  if(w>=3){x.strokeStyle=hi;x.lineWidth=1;
    x.beginPath();x.moveTo(ax+nx*-1,ay+ny*-1);x.lineTo(bx+nx*-1,by+ny*-1);x.stroke();
    x.strokeStyle=lo;x.beginPath();x.moveTo(ax+nx,ay+ny);x.lineTo(bx+nx,by+ny);x.stroke();}
}
function joint(ax,ay,a1,l1,a2,l2){
  const kx=ax+Math.sin(a1)*l1,ky=ay+Math.cos(a1)*l1;
  return {kx,ky,fx:kx+Math.sin(a1+a2)*l2,fy:ky+Math.cos(a1+a2)*l2};
}
function paintBody(x,p,gear,pose,opts){
  opts=opts||{};
  const cx=13, hipY=20+pose.bob, shY=10.5+pose.bob, hdY=4.5+pose.bob;
  const lean=pose.lean||0;
  /* задняя нога */
  const B=joint(cx+1,hipY,pose.lb[0],8,pose.lb[1],8);
  seg(x,cx+1,hipY,B.kx,B.ky,4,p.pantsLo,p.pants,p.pantsSh,p.out);
  seg(x,B.kx,B.ky,B.fx,B.fy,3.4,p.pantsLo,p.pants,p.pantsSh,p.out);
  foot(x,B.fx,B.fy,p,-1);
  /* задняя рука */
  const ba=pose.ba||0;
  const BA=joint(cx-1,shY+1,ba,6,ba*.6+.5,6);
  seg(x,cx-1,shY+1,BA.kx,BA.ky,3,p.skinLo,p.skin,p.skinSh,p.out);
  seg(x,BA.kx,BA.ky,BA.fx,BA.fy,2.6,p.skinLo,p.skin,p.skinSh,p.out);
  /* торс */
  const tx=cx+lean*3;
  x.fillStyle=p.out; x.beginPath();
  x.moveTo(tx-5,shY-1);x.lineTo(tx+5,shY-1);x.lineTo(tx+4,hipY+1);x.lineTo(tx-4,hipY+1);x.closePath();x.fill();
  const grd=x.createLinearGradient(tx-5,shY,tx+5,hipY);
  if(gear.chest==='bare'){grd.addColorStop(0,p.skinHi);grd.addColorStop(.5,p.skin);grd.addColorStop(1,p.skinLo);}
  else {grd.addColorStop(0,p.vestHi);grd.addColorStop(.5,p.vest);grd.addColorStop(1,p.vestLo);}
  x.fillStyle=grd;x.fillRect(tx-4,shY,8,hipY-shY+1);
  if(gear.chest==='bare'){
    x.fillStyle=p.skinLo;x.fillRect(tx-3,shY+3,6,1);x.fillRect(tx-1,shY+4,1,4);
    x.fillStyle=p.skinHi;x.fillRect(tx-3,shY+1,3,1);
  }
  if(gear.vest==='bandolier'){
    x.fillStyle=p.vestLo;
    for(let i=0;i<5;i++)x.fillRect(tx-4+i,shY+1+i*1.6,2,2);
    x.fillStyle=p.buckle;for(let i=0;i<5;i++)x.fillRect(tx-4+i,shY+1+i*1.6,2,1);
  } else if(gear.vest==='plate'){
    x.fillStyle=p.vestLo;x.fillRect(tx-4,shY+4,8,1);
    x.fillStyle=p.acc;x.fillRect(tx-1,shY+2,2,4);
    x.fillStyle=p.vestHi;x.fillRect(tx-4,shY,8,1);
  } else if(gear.vest==='light'){
    x.fillStyle=p.vestLo;x.fillRect(tx-1,shY,1,7);
    x.fillStyle=p.acc;x.fillRect(tx-4,shY+6,8,1);
  } else if(gear.vest==='exo'){
    x.fillStyle=p.vestLo;x.fillRect(tx-4,shY+2,8,1);x.fillRect(tx-4,shY+5,8,1);
    x.fillStyle=p.acc;x.fillRect(tx-2,shY+3,4,2);
  }
  /* пояс */
  x.fillStyle=p.belt;x.fillRect(tx-4,hipY-1,8,2);
  x.fillStyle=p.buckle;x.fillRect(tx-1,hipY-1,2,2);
  /* плечи/наплечники */
  if(gear.shoulder===1){
    x.fillStyle=p.out;x.fillRect(tx-7,shY-1,4,4);x.fillRect(tx+3,shY-1,4,4);
    x.fillStyle=p.vest;x.fillRect(tx-6,shY,3,3);x.fillRect(tx+4,shY,3,3);
    x.fillStyle=p.vestHi;x.fillRect(tx-6,shY,3,1);x.fillRect(tx+4,shY,3,1);
  } else if(gear.shoulder===2){
    x.fillStyle=p.out;x.fillRect(tx-6,shY-1,3,3);x.fillRect(tx+3,shY-1,3,3);
    x.fillStyle=p.acc;x.fillRect(tx-5,shY,1,1);x.fillRect(tx+4,shY,1,1);
  }
  /* ранец */
  if(gear.pack===1){x.fillStyle=p.out;x.fillRect(tx-8,shY,3,8);x.fillStyle=p.gunLo;x.fillRect(tx-7,shY+1,2,6);
    x.fillStyle=p.gunHi;x.fillRect(tx-7,shY+2,2,1);}
  if(gear.pack===2){x.fillStyle=p.out;x.fillRect(tx-8,shY,3,8);x.fillStyle=p.gunLo;x.fillRect(tx-7,shY+1,2,6);
    x.fillStyle=p.acc;x.fillRect(tx-7,shY+2,2,1);x.fillRect(tx-7,shY+4,2,1);}
  /* передняя нога */
  const A=joint(cx-1,hipY,pose.la[0],8,pose.la[1],8);
  seg(x,cx-1,hipY,A.kx,A.ky,4.4,p.pants,p.pantsHi,p.pantsLo,p.out);
  seg(x,A.kx,A.ky,A.fx,A.fy,3.6,p.pants,p.pantsHi,p.pantsLo,p.out);
  if(gear.knee===1){x.fillStyle=p.pantsLo;x.fillRect(A.kx-2,A.ky-1,4,3);}
  if(gear.knee===2){x.fillStyle=p.out;x.fillRect(A.kx-2,A.ky-2,5,4);x.fillStyle=p.gun;x.fillRect(A.kx-1,A.ky-1,3,2);}
  foot(x,A.fx,A.fy,p,1);
  /* голова */
  head(x,tx+lean*2,hdY,p,gear,opts);
  if(gear.scarf){x.fillStyle=p.acc;x.fillRect(tx-4,shY-2,8,2);
    x.fillStyle=p.accHi;x.fillRect(tx-4,shY-2,8,1);}
}
function foot(x,fx,fy,p,dir){
  x.fillStyle=p.out;x.fillRect(fx-3,fy-1,8,4);
  x.fillStyle=p.boot;x.fillRect(fx-2,fy,6,2);
  x.fillStyle=p.bootHi;x.fillRect(fx-2,fy,6,1);
  x.fillStyle=p.bootLo;x.fillRect(fx-3,fy+2,8,1);
}
function head(x,hx,hy,p,gear,opts){
  x.fillStyle=p.out;
  x.beginPath();x.ellipse(hx,hy+1,4.4,4.8,0,0,6.2832);x.fill();
  const grd=x.createLinearGradient(hx-4,hy-3,hx+4,hy+5);
  grd.addColorStop(0,p.skinHi);grd.addColorStop(.55,p.skin);grd.addColorStop(1,p.skinLo);
  x.fillStyle=grd;
  x.beginPath();x.ellipse(hx,hy+1,3.6,4,0,0,6.2832);x.fill();
  x.fillStyle=p.skinSh;x.fillRect(hx+1,hy+3,2,1);
  x.fillStyle=p.out;x.fillRect(hx+2,hy+1,1,1);
  if(gear.head==='bandana'){
    x.fillStyle=p.out;x.beginPath();x.ellipse(hx,hy-1,4.4,3,0,Math.PI,0);x.fill();
    x.fillStyle=p.acc;x.beginPath();x.ellipse(hx,hy-1,3.8,2.5,0,Math.PI,0);x.fill();
    x.fillStyle=p.accHi;x.fillRect(hx-3,hy-2,6,1);
    x.fillStyle=p.acc;x.fillRect(hx-6,hy,3,2);x.fillRect(hx-7,hy+2,2,2);
  } else if(gear.head==='helmet'){
    x.fillStyle=p.out;x.beginPath();x.ellipse(hx,hy-.5,4.8,3.6,0,Math.PI,0);x.fill();
    x.fillStyle=p.vest;x.beginPath();x.ellipse(hx,hy-.5,4.2,3,0,Math.PI,0);x.fill();
    x.fillStyle=p.vestHi;x.fillRect(hx-3,hy-3,5,1);
    x.fillStyle=p.gun;x.fillRect(hx-1,hy,5,2);
    x.fillStyle=p.gunHi;x.fillRect(hx,hy,3,1);
  } else if(gear.head==='hood'){
    x.fillStyle=p.out;x.beginPath();x.ellipse(hx,hy,5,4.6,0,0,6.2832);x.fill();
    x.fillStyle=p.vest;x.beginPath();x.ellipse(hx-.5,hy,4.4,4,0,0,6.2832);x.fill();
    x.fillStyle=p.vestHi;x.beginPath();x.ellipse(hx-1,hy-1,3,2.4,0,0,6.2832);x.fill();
    x.fillStyle=p.skin;x.beginPath();x.ellipse(hx+1.5,hy+1.5,2.4,2.6,0,0,6.2832);x.fill();
    x.fillStyle=p.out;x.fillRect(hx+2,hy+1,1,1);
  } else {
    x.fillStyle=p.out;x.beginPath();x.ellipse(hx,hy-1,4.6,3.2,0,Math.PI,0);x.fill();
    x.fillStyle=p.hair;x.beginPath();x.ellipse(hx,hy-1,4,2.7,0,Math.PI,0);x.fill();
    x.fillStyle=p.gun;x.fillRect(hx-4,hy,8,2);
    x.fillStyle=p.acc;x.fillRect(hx-2,hy,4,1);
    x.fillStyle=p.accHi;x.fillRect(hx-1,hy,2,1);
  }
}
/* ---------- рука+ствол в рантайме (game.js) ---------- */
const AIMOFF={F:[10,0],DU:[8,-8],U:[1,-11],DD:[8,8],D:[1,11]};
function armDraw(x,sx,sy,aim,p,recoil,weapon){
  const o=AIMOFF[aim]||AIMOFF.F;
  const hx=sx+o[0],hy=sy+o[1];
  const mx=sx+o[0]*.45+ (aim==='U'||aim==='D'?2:1), my=sy+o[1]*.45+2;
  seg(x,sx,sy,mx,my,3.2,p.skin,p.skinHi,p.skinLo,p.out);
  seg(x,mx,my,hx,hy,2.8,p.skin,p.skinHi,p.skinLo,p.out);
  x.fillStyle=p.out;x.beginPath();x.arc(hx,hy,2,0,6.2832);x.fill();
  x.fillStyle=p.skinLo;x.beginPath();x.arc(hx,hy,1.3,0,6.2832);x.fill();
  const r=recoil>0?recoil*.6:0;
  const dx=o[0],dy=o[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
  const gx=hx-ux*r,gy=hy-uy*r;
  const len=weapon==='laser'?13:weapon==='machine'?12:weapon==='fire'?10:weapon==='homing'?11:weapon==='spread'?9:11;
  x.strokeStyle=p.out;x.lineWidth=4;x.lineCap='round';
  x.beginPath();x.moveTo(gx-ux*3,gy-uy*3);x.lineTo(gx+ux*len,gy+uy*len);x.stroke();
  x.strokeStyle=p.gun;x.lineWidth=2.4;
  x.beginPath();x.moveTo(gx-ux*3,gy-uy*3);x.lineTo(gx+ux*len,gy+uy*len);x.stroke();
  x.strokeStyle=p.gunHi;x.lineWidth=1;
  x.beginPath();x.moveTo(gx-ux*2,gy-uy*2-1);x.lineTo(gx+ux*(len-2),gy+uy*(len-2)-1);x.stroke();
  x.fillStyle=p.gunLo;x.fillRect(gx-ux*4-1,gy-uy*4-1,3,3);
  if(weapon==='laser'){x.fillStyle=p.acc;x.fillRect(gx+ux*(len-2)-1,gy+uy*(len-2)-1,2,2);}
  if(weapon==='fire'){x.fillStyle='#e06a12';x.fillRect(gx+ux*(len-3)-1,gy+uy*(len-3)-2,3,4);}
  return {x:gx+ux*(len+2),y:gy+uy*(len+2)};
}

/* ---------- сборка кадров тела ---------- */
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flipC(c){const f=blank(c.width,c.height),x=f.getContext('2d');
  x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function bodyFrame(p,gear,pose,opts){
  const c=blank(26,36),x=c.getContext('2d');
  x.imageSmoothingEnabled=false;
  paintBody(x,p,gear,pose,opts);
  return c;
}
const A={chars:{},foes:{},CW,CH,SHX,SHY,AIMOFF};
function buildChar(id){
  const p=PALS[id],gear=GEAR[id],set={};
  const bodies={};
  bodies.idle=[bodyFrame(p,gear,POSE.idle),bodyFrame(p,gear,POSE.idle2)];
  bodies.run=RUN.map(ps=>bodyFrame(p,gear,ps));
  bodies.jump=[bodyFrame(p,gear,POSE.jump)];
  bodies.fall=[bodyFrame(p,gear,POSE.fall)];
  bodies.crouch=[bodyFrame(p,gear,POSE.crouch)];
  set.bodies=bodies;
  /* лёжа */
  const pc=blank(34,14),x=pc.getContext('2d');
  x.imageSmoothingEnabled=false;
  const grd=x.createLinearGradient(0,2,0,12);
  grd.addColorStop(0,p.pantsHi);grd.addColorStop(1,p.pantsLo);
  x.fillStyle=p.out;x.fillRect(1,5,20,8);
  x.fillStyle=grd;x.fillRect(2,6,18,6);
  x.fillStyle=p.out;x.fillRect(20,3,10,8);
  const g2=x.createLinearGradient(20,3,30,11);
  if(gear.chest==='bare'){g2.addColorStop(0,p.skinHi);g2.addColorStop(1,p.skinLo);}
  else{g2.addColorStop(0,p.vestHi);g2.addColorStop(1,p.vestLo);}
  x.fillStyle=g2;x.fillRect(21,4,8,6);
  x.fillStyle=p.out;x.beginPath();x.ellipse(30,6,4,4,0,0,6.2832);x.fill();
  x.fillStyle=p.skin;x.beginPath();x.ellipse(30,6.5,3.2,3.2,0,0,6.2832);x.fill();
  x.fillStyle=p.out;x.fillRect(31,6,1,1);
  if(gear.head==='bandana'){x.fillStyle=p.acc;x.beginPath();x.ellipse(29,4,3.4,2.4,0,Math.PI,0);x.fill();}
  if(gear.head==='helmet'){x.fillStyle=p.vest;x.beginPath();x.ellipse(29,4,3.6,2.6,0,Math.PI,0);x.fill();}
  if(gear.head==='hood'){x.fillStyle=p.vest;x.beginPath();x.ellipse(29,5,3.8,3.4,0,0,6.2832);x.fill();
    x.fillStyle=p.skin;x.beginPath();x.ellipse(31,6,2.2,2.2,0,0,6.2832);x.fill();}
  if(gear.head==='goggles'){x.fillStyle=p.hair;x.beginPath();x.ellipse(29,4,3.4,2.4,0,Math.PI,0);x.fill();
    x.fillStyle=p.gun;x.fillRect(28,5,5,2);}
  x.fillStyle=p.boot;x.fillRect(0,9,5,4);x.fillStyle=p.bootHi;x.fillRect(0,9,5,1);
  set.prone={r:pc,l:flipC(pc)};
  A.chars[id]=set;
}
/* ---------- враги: солдат с позами stand/run/crouch/peek ---------- */
function soldierFrames(type,v){
  const base=EVAR[v%3],p=pal(Object.assign({},base));
  const gear={head:'helmet',chest:'suit',vest:'plate',shoulder:0,pack:type==='grenadier'?1:0,knee:1};
  if(type==='flamer'){p.vest='#8a2a20';p.vestHi='#c24838';p.vestLo='#4a120c';gear.pack=1;}
  if(type==='sniper'){p.vest='#1a5a68';p.vestHi='#35a0b0';p.vestLo='#0d3a44';}
  if(type==='gunner'){p.vest='#4a4a5e';p.vestHi='#7a7a92';p.vestLo='#2a2a3a';}
  const out=[];
  out.push({r:bodyFrame(p,gear,POSE.idle),l:null});
  out.push({r:bodyFrame(p,gear,RUN[0]),l:null});
  out.push({r:bodyFrame(p,gear,RUN[4]),l:null});
  out.push({r:bodyFrame(p,gear,POSE.crouch),l:null});
  out.forEach(f=>f.l=flipC(f.r));
  return out;
}
const BIRD=[
 ['..........oooo........','.....oooouuuuoo.......','..oouuuuuUUUUuuoo.....',
  '.ouuuUUUUUUUUUUuuo....','.ouuUUUUeeeeUUUUuo....','..ouuuUUUUUUUUuuo.....',
  '...oouuuuuuuuoo.......','.....obbo.obbo........','.....okko.okko........','......oo...oo.........'],
 ['.....ooo..............','..oouuuooooo..........','.ouuuUUUUuuuoo........',
  '.ouuUUUUUUUUuuoo......','..ouuUUeeeeUUUUuo.....','...ouuuUUUUUUuuo......',
  '....oouuuuuuuuoo........','.....obbo.obbo........','.....okko.okko........','......oo...oo.........']];
const CRAWLER=[
 ['....oooooooo....','..oouuuuuuuuoo..','.ouuUUUUUUUUuuo.','.ouUUeeUUeeUUuo.',
  '.ouuUUUUUUUUuuo.','..oouuuuuuuuoo..','.o.o.o....o.o.o.','o.o.o.o..o.o.o.o',
  '.o...o....o...o.','................'],
 ['....oooooooo....','..oouuuuuuuuoo..','.ouuUUUUUUUUuuo.','.ouUUeeUUeeUUuo.',
  '.ouuUUUUUUUUuuo.','..oouuuuuuuuoo..','o.o.o.o..o.o.o.o','.o.o.o....o.o.o.',
  '..o...o..o...o..','................']];
const POD=['....oooooooo....','..ooGGGGGGGGoo..','.oGwwwwwwwwwwGo.','oGwwwwwwwwwwwwGo',
 'oGwwwkkkkkkwwwGo','oGwwwkGGGGkwwwGo','oGwwwkGwwGkwwwGo','oGwwwkGGGGkwwwGo',
 'oGwwwkkkkkkwwwGo','oGwwwwwwwwwwwwGo','.oGwwwwwwwwwwGo.','..ooGGGGGGGGoo..',
 '....oooooooo....','................'];
function make(rows,w,h,pl){
  const c=blank(w,h),x=c.getContext('2d');
  for(let y=0;y<h;y++){const row=String(rows[y]||'').padEnd(w,'.');
    for(let X=0;X<w;X++){const ch=row[X];if(ch==='.'||ch===' ')continue;
      const cc=pl[ch];if(!cc)continue;x.fillStyle=cc;x.fillRect(X,y,1,1);}}
  return c;
}
let ready=false;
function init(){
  if(ready)return;
  try{
    Object.keys(PALS).forEach(buildChar);
    A.foes={};
    ['runner','gunner','flamer','sniper','grenadier','shooter'].forEach(t=>{
      A.foes[t]=[];for(let v=0;v<3;v++)A.foes[t].push(soldierFrames(t,v));});
    const simple={bird:BIRD,crawler:CRAWLER};
    Object.keys(simple).forEach(t=>{
      A.foes[t]=[];
      for(let v=0;v<3;v++){
        const pl={o:'#0b0e15',u:['#5a2a6a','#6a4a20','#20485a'][v],U:['#3a1648','#4a2c0f','#0f2838'][v],
          e:'#ff4a3d',b:'#e06a12',k:'#242c3a'};
        A.foes[t].push(simple[t].map(r=>{const w=Math.max.apply(null,r.map(q=>q.length));
          const c=make(r,w,r.length,pl);return {r:c,l:flipC(c)};}));
      }});
    const tp={o:'#0b0e15',G:'#93a3ba',g:'#5b6a80',k:'#242c3a',e:'#ff4a3d'};
    const tc=make(['.....oooooooooo.....','....oGGGGGGGGGGo....','...oGkkkkkkkkkkGo...',
      '...oGkGGGGGGGGkGo...','...oGkGooooooGkGo...','...oGkGoeeeeoGkGo...','...oGkGoeeeeoGkGo...',
      '...oGkGooooooGkGo...','...oGkGGGGGGGGkGo...','...oGkkkkkkkkkkGo...','....oGGGGGGGGGGo....',
      '.....oooooooooo.....','.......ogggo........','.......oGGGo........','......ogggggo.......',
      '.....oGGGGGGGo......','....ogggggggggo.....','....ooooooooooo.....'],20,18,tp);
    A.foes.turret=[[{r:tc,l:flipC(tc)}],[{r:tc,l:flipC(tc)}],[{r:tc,l:flipC(tc)}]];
    const pp={o:'#0b0e15',G:'#35e0ff',w:'#d4fbff',k:'#0d5570'};
    const pc=make(POD,16,14,pp);
    A.foes.pod=[[{r:pc,l:flipC(pc)}],[{r:pc,l:flipC(pc)}],[{r:pc,l:flipC(pc)}]];
    const jp={o:'#0b0e15',u:'#8f3c06',U:'#5a300c',e:'#ffd400',b:'#331a04'};
    A.foes.jumper=[];
    for(let v=0;v<3;v++){
      const c1=bodyFrame(pal(Object.assign({},EVAR[v])),{head:'helmet',chest:'suit',vest:'plate',shoulder:0,pack:0,knee:1},POSE.jump);
      const c2=bodyFrame(pal(Object.assign({},EVAR[v])),{head:'helmet',chest:'suit',vest:'plate',shoulder:0,pack:0,knee:1},POSE.fall);
      A.foes.jumper.push([{r:c1,l:flipC(c1)},{r:c2,l:flipC(c2)},{r:c1,l:flipC(c1)}]);
    }
    A.foes.flyer=A.foes.bird;
    ready=true;
  }catch(e){console.error('GFX',e);}
}
function aimKey(a){
  if(!a)return 'F';
  const x=a.raw?a.raw.x:a.x,y=a.raw?a.raw.y:a.y;
  if(y<0)return x===0?'U':'DU';
  if(y>0)return x===0?'D':'DD';
  return 'F';
}
function player(id,bodyKey,aim,left){
  const s=A.chars[id];if(!s)return null;
  if(bodyKey==='prone')return left?s.prone.l:s.prone.r;
  let arr;
  if(bodyKey==='idle')arr=s.bodies.idle;
  else if(bodyKey&&bodyKey.indexOf('run')===0)arr=s.bodies.run;
  else if(bodyKey==='jump')arr=s.bodies.jump;
  else if(bodyKey==='fall')arr=s.bodies.fall;
  else if(bodyKey==='crouch')arr=s.bodies.crouch;
  else arr=s.bodies.idle;
  return arr;
}
function bodySprite(id,bodyKey,frameIdx,left){
  const s=A.chars[id];if(!s)return null;
  if(bodyKey==='prone')return left?s.prone.l:s.prone.r;
  let arr;
  if(bodyKey==='idle')arr=s.bodies.idle;
  else if(bodyKey&&bodyKey.indexOf('run')===0)arr=s.bodies.run;
  else if(bodyKey==='jump')arr=s.bodies.jump;
  else if(bodyKey==='fall')arr=s.bodies.fall;
  else if(bodyKey==='crouch')arr=s.bodies.crouch;
  else arr=s.bodies.idle;
  const f=arr[((frameIdx|0)%arr.length+arr.length)%arr.length];
  return left?f.l:f.r;
}
function foe(type,v,frame,left){
  const set=A.foes[type];if(!set)return null;
  if(v===undefined)return set;
  const arr=set[(v|0)%3];if(!arr||!arr.length)return null;
  if(frame===undefined)return arr;
  const f=arr[((frame|0)%arr.length+arr.length)%arr.length];
  if(!f)return null;
  return left?f.l:f.r;
}
function char(id){return A.chars[id]?{fr:{run:A.chars[id].bodies.run,idle:A.chars[id].bodies.idle,
  jump:A.chars[id].bodies.jump,fall:A.chars[id].bodies.fall,prone:A.chars[id].prone.r},ar:[]}:null;}
function dirIndex(){return 0;}
function tip(aim,left,sx,sy){
  const o=AIMOFF[aim]||AIMOFF.F;
  return {x:sx+o[0]*(left?-1:1)*1.6,y:sy+o[1]*1.6};
}
return {init,player,bodySprite,foe,char,dirIndex,aimKey,tip,armDraw,CW,CH,SHX,SHY,TH,
        get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
