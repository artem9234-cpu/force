/* ============================================================
   GFX — пре-рендер спрайтов в атлас с обводкой (Sega-look)
   ============================================================ */
const GFX=(()=>{
'use strict';
const {P,px,box,ell,ellO,line,limb,tri,dith,bind}=CORE;
const A={chars:{},foes:{}};
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function outline(src){
  const w=src.width,h=src.height,c=cv(w+2,h+2),x=c.getContext('2d');
  const d=src.getContext('2d').getImageData(0,0,w,h).data;
  const od=x.createImageData(w+2,h+2);
  const op=(a,b)=>a<0||b<0||a>=w||b>=h?false:d[(b*w+a)*4+3]>40;
  for(let y=0;y<h+2;y++)for(let X=0;X<w+2;X++){
    const a=X-1,b=y-1;if(op(a,b))continue;
    if(op(a-1,b)||op(a+1,b)||op(a,b-1)||op(a,b+1)||op(a-1,b-1)||op(a+1,b+1)||op(a-1,b+1)||op(a+1,b-1)){
      const i=(y*(w+2)+X)*4;od.data[i]=6;od.data[i+1]=8;od.data[i+2]=12;od.data[i+3]=255;}}
  x.putImageData(od,0,0);x.drawImage(src,1,1);return c;
}
function paint(fn,w,h){const c=cv(w,h);const old=bindTarget();bind(c.getContext('2d'));fn();bind(old);return outline(c);}
function bindTarget(){return window.__G;}

/* ---------- тело бойца ---------- */
function body(pal,gr,pose){
  return paint(()=>{
    const cx=12,hipY=26+pose.bob,shY=15+pose.bob,hdY=7+pose.bob;
    const f=pose.f||1;
    if(pose.prone){
      limb(cx-9,30,cx+3,30,7,pal.pants,pal.pantsHi,pal.pantsLo,P.n);
      box(cx-13,32,8,5,pal.boot,P.n);px(cx-12,33,6,1,pal.bootHi);
      limb(cx-1,29,cx+8,28,8,gr.chest==='bare'?pal.skin:pal.pants,pal.skinHi,pal.pantsLo,P.n);
      box(cx+4,24,10,7,pal.vest,P.n);px(cx+5,25,8,1,pal.vestHi);
      ellO(cx+13,25,5,5,pal.skin,P.n);ell(cx+12,24,3,3,pal.skinHi);
      ell(cx+13,22,5,3,pal.helm);px(cx+9,23,9,1,pal.helmLo);
      return;
    }
    const la=pose.la,lb=pose.lb;
    const A=chain(cx-1.5,hipY,la[0],7,la[1],7),B=chain(cx+1.5,hipY,lb[0],7,lb[1],7);
    limb(cx+1.5,hipY,B.kx,B.ky,4,pal.pantsLo,pal.pants,pal.pantsLo,P.n);
    limb(B.kx,B.ky,B.fx,B.fy,3,pal.pantsLo,pal.pants,pal.pantsLo,P.n);
    bootAt(B.fx,B.fy+1,pal,gr);
    torsoAt(cx,shY-1,pal,gr,f);
    limb(cx-1.5,hipY,A.kx,A.ky,5,pal.pants,pal.pantsHi,pal.pantsLo,P.n);
    limb(A.kx,A.ky,A.fx,A.fy,4,pal.pants,pal.pantsHi,pal.pantsLo,P.n);
    legGear(A.kx,A.ky,pal,gr);
    bootAt(A.fx,A.fy+1,pal,gr);
    headAt(cx+f*.5,hdY,pal,gr,f);
  },24,42);
}
function chain(ox,oy,a1,l1,a2,l2){
  const kx=ox+Math.sin(a1)*l1,ky=oy+Math.cos(a1)*l1;
  return {kx,ky,fx:kx+Math.sin(a1+a2)*l2,fy:ky+Math.cos(a1+a2)*l2};
}
function bootAt(x,y,pal,gr){
  if(gr.boots==='heavy'){box(x-4,y-5,9,6,pal.boot,P.n);px(x-3,y-4,7,1,pal.bootHi);px(x-5,y-1,11,2,P.mt5);}
  else if(gr.boots==='light'){box(x-3,y-4,7,5,pal.boot,P.n);px(x-2,y-3,5,1,pal.bootHi);px(x-4,y-1,9,2,P.d1);}
  else if(gr.boots==='tech'){box(x-4,y-5,9,6,pal.boot,P.n);px(x-3,y-4,7,1,pal.bootHi);px(x-1,y-3,3,2,pal.acc);}
  else {box(x-3,y-5,8,6,pal.boot,P.n);px(x-2,y-4,6,1,pal.bootHi);
    for(let i=0;i<3;i++)px(x-2,y-3+i*2,5,1,P.br5);px(x-4,y-1,10,2,P.br5);}
}
function legGear(x,y,pal,gr){
  if(gr.legs==='armored')box(x-2,y-2,5,4,pal.vest,P.n);
  else if(gr.legs==='exo'){px(x-1,y-1,3,3,pal.acc);glowless(x,y,pal.acc);}
  else if(gr.legs==='cargo')px(x-3,y-2,3,4,pal.pantsLo);
  else if(gr.legs==='skinny')px(x-2,y-2,4,2,pal.vest);
}
function glowless(x,y,c){px(x,y,1,1,c);}
function torsoAt(cx,y,pal,gr,f){
  const base=gr.chest==='bare'?pal.skin:(gr.chest==='plate'?pal.vest:pal.pants);
  const hi=gr.chest==='bare'?pal.skinHi:(gr.chest==='plate'?pal.vestHi:pal.pantsHi);
  const lo=gr.chest==='bare'?pal.skinLo:(gr.chest==='plate'?pal.vestLo:pal.pantsLo);
  limb(cx,y+1,cx,y+10,9,base,hi,lo,P.n);
  if(gr.chest==='bare'){px(cx-3,y+2,6,1,pal.skinLo);px(cx-1,y+4,2,4,pal.skinLo);px(cx-4,y+3,2,2,pal.skinHi);}
  if(gr.vest==='plate'){box(cx-5,y+1,10,9,pal.vest,P.n);px(cx-4,y+2,8,1,pal.vestHi);
    px(cx-1,y+3,2,6,pal.acc);px(cx-5,y+6,10,1,pal.vestLo);dith(cx-5,y+7,10,3,pal.vest,pal.vestLo,0);}
  else if(gr.vest==='bandolier'){for(let i=0;i<5;i++){px(cx-5+i*2,y+1+i*2,3,2,P.yl3);px(cx-5+i*2,y+1+i*2,3,1,P.yl1);}
    px(cx-4,y+9,8,2,pal.vest);}
  else if(gr.vest==='light'){box(cx-4,y+2,8,7,pal.vest,P.n);px(cx-3,y+3,6,1,pal.vestHi);
    px(cx-1,y+3,1,6,pal.vestLo);px(cx-4,y+8,8,1,pal.acc);}
  else {box(cx-5,y+1,10,9,pal.vest,P.n);px(cx-4,y+2,8,1,pal.vestHi);
    for(let i=0;i<2;i++)px(cx-5,y+4+i*3,10,1,pal.vestLo);px(cx-2,y+4,4,3,pal.acc);
    dith(cx-5,y+8,10,2,pal.vest,pal.vestLo,0);}
  px(cx-5,y+10,10,2,P.br4);px(cx-1,y+10,3,2,P.yl3);px(cx,y+10,1,2,P.yl1);
  if(gr.shoulder==='pauldron'){ellO(cx-f*5,y+2,4,3.5,pal.vest,P.n);ell(cx-f*5,y+1,3,2,pal.vestHi);
    ellO(cx+f*5,y+2,4,3.5,pal.vest,P.n);ell(cx+f*5,y+1,3,2,pal.vestHi);}
  else if(gr.shoulder==='plate'){box(cx-f*7,y+1,4,4,pal.vest,P.n);box(cx+f*3,y+1,4,4,pal.vest,P.n);
    px(cx+f*3,y+2,4,1,pal.vestHi);}
  if(gr.pack==='heavy'){box(cx-f*8,y+2,5,9,P.mt4,P.n);px(cx-f*7,y+3,3,1,P.mt3);px(cx-f*7,y+7,3,2,P.mt5);}
  else if(gr.pack==='tech'){box(cx-f*8,y+2,5,9,P.mt4,P.n);
    for(let i=0;i<3;i++)px(cx-f*7,y+4+i*2,3,1,pal.acc);}
  if(gr.head==='hood'){px(cx-5,y-1,10,2,pal.acc);}
}
function headAt(cx,cy,pal,gr,f){
  if(gr.head==='helmet'){ellO(cx,cy,5.5,5.5,pal.helm,P.n);ell(cx-1,cy-1,4,3.5,pal.helmHi);
    px(cx-6,cy+1,12,1,pal.helmLo);ell(cx+f*2,cy+2,3.5,3,pal.skin);
    px(cx+f*1,cy+1,6,2,P.cy4);px(cx+f*2,cy+1,4,1,P.cy2);px(cx-f*3,cy-3,3,1,pal.helmHi);}
  else if(gr.head==='hood'){ellO(cx,cy,6,6,pal.helm,P.n);ell(cx-1,cy-1,4,4,pal.helmHi);
    ell(cx+f*2,cy+1,3.5,3.5,pal.skin);px(cx+f*3,cy,1,1,P.n);tri(cx-f*5,cy-3,5,8,pal.helmLo,-1);}
  else if(gr.head==='goggles'){ellO(cx,cy,5,5.5,pal.skin,P.n);ell(cx-1,cy-1,3.5,3.5,pal.skinHi);
    ell(cx,cy-3,5.5,3.5,pal.helm);px(cx-6,cy-2,12,1,pal.helmLo);
    box(cx+f-3,cy,7,3,P.mt5,P.n);px(cx+f-2,cy+1,3,1,pal.acc);px(cx+f+2,cy+1,2,1,pal.acc);
    line(cx-f*4,cy-5,cx-f*7,cy-12,P.mt2,1);px(cx-f*8,cy-14,2,2,pal.acc);}
  else {ellO(cx,cy,4.5,5,pal.skin,P.n);ell(cx-1,cy-1,3,3.5,pal.skinHi);
    px(cx+f*3,cy,1,1,P.n);px(cx+f*2,cy+3,3,1,pal.skinLo);
    ell(cx,cy-3,5,3,pal.helm);px(cx-5,cy-2,10,1,pal.helmLo);px(cx-5,cy-4,10,1,pal.helmHi);
    tri(cx-f*5,cy-2,5,7,pal.helm,-1);px(cx-f*7,cy+2,3,2,pal.helmLo);px(cx-f*6,cy+4,2,2,pal.helmLo);}
}
/* ---------- руки+ствол по направлению ---------- */
const DIRS=[[1,0],[.71,.71],[0,1],[-.71,.71],[-1,0],[-.71,-.71],[0,-1],[.71,-.71]];
function arms(pal,gr,d){
  return paint(()=>{
    const c=14,sx=c- d[0]*2, sy=c-2;
    const hx=c+d[0]*13, hy=c-2+d[1]*13;
    const mx=(sx+hx)/2-d[1]*2, my=(sy+hy)/2+d[0]*2;
    const bare=gr.arms==='bare';
    const bs=bare?pal.skin:pal.pants,hi=bare?pal.skinHi:pal.pantsHi,lo=bare?pal.skinLo:pal.pantsLo;
    limb(sx,sy,mx,my,4,bs,hi,lo,P.n);limb(mx,my,hx-d[0]*4,hy-d[1]*4,3,bs,hi,lo,P.n);
    limb(sx-d[0]*3,sy+2,mx-d[0]*5,my-d[1]*5+2,4,lo,bs,lo,P.n);
    if(gr.arms==='gauntlet')box(mx-2,my-2,5,5,pal.vest,P.n);
    if(gr.arms==='tech')px(mx-1,my-1,3,3,pal.acc);
    ell(hx-d[0]*4,hy-d[1]*4,2,2,bare?pal.skinLo:P.d2);
    const gx=hx-d[0]*5,gy=hy-d[1]*5,ex=hx+d[0]*12,ey=hy+d[1]*12;
    line(gx,gy,ex,ey,P.n,5);line(gx,gy,ex,ey,pal.gun,3);
    line(gx,gy-1,ex-d[0]*3,ey-d[1]*3-1,pal.gunHi,1);
    px(gx-d[1]*2-2,gy+d[0]*2-2,4,4,P.mt5);
    px(ex-d[0]*2,ey-d[1]*2,2,2,P.mt4);
  },28,28);
}
const TIP=DIRS.map(d=>({x:14+d[0]*26,y:12+d[1]*26}));

/* ---------- враги ---------- */
function foePaint(type,v,fr){
  const VP=[{a:P.gr3,b:P.gr2,c:P.gr5,d:P.gr4},{a:P.br3,b:P.br2,c:P.br5,d:P.br4},{a:P.bl3,b:P.bl2,c:P.bl5,d:P.bl4}][v%3];
  return paint(()=>{
    const s=Math.sin(fr*1.6),c=14;
    switch(type){
      case 'runner':{
        const A2=chain(c,24,s*.7,6,Math.max(0,-Math.cos(fr*1.6))*.9,6);
        const B2=chain(c,24,-s*.7,6,Math.max(0,Math.cos(fr*1.6))*.9,6);
        limb(c,24,B2.kx,B2.ky,4,VP.c,VP.a,P.n,P.n);limb(B2.kx,B2.ky,B2.fx,B2.fy,3,VP.c,VP.a,P.n,P.n);
        limb(c,10,c,23,8,VP.a,VP.b,VP.c,P.n);
        box(c-4,12,8,6,P.br4,P.n);px(c-3,13,6,1,P.br3);
        ellO(c-1,5,4,4.5,P.sk3,P.n);ell(c-1,2,4.5,2.5,P.rd3);px(c+1,5,2,1,P.rd1);
        line(c,14,c+11,15,P.mt3,2);px(c+9,14,3,2,P.mt1);
        limb(c,24,A2.kx,A2.ky,4,VP.d,VP.b,P.n,P.n);limb(A2.kx,A2.ky,A2.fx,A2.fy,3,VP.d,VP.b,P.n,P.n);
        break;}
      case 'gunner':{
        limb(c-2,24,c-3,34,4,P.d3,P.g2,P.n,P.n);limb(c+2,24,c+3,34,4,P.d3,P.g2,P.n,P.n);
        limb(c,10,c,23,8,VP.a,VP.b,VP.c,P.n);
        box(c-4,12,9,7,P.mt4,P.n);px(c-3,13,7,1,P.mt2);px(c-3,16,7,2,P.mt5);
        ellO(c-1,5,4.5,4.5,P.sk3,P.n);ell(c-1,2,5,2.5,P.mt5);px(c+1,4,3,2,P.cy4);
        line(c+2,15,c+15,15,P.n,4);line(c+2,15,c+15,15,P.mt2,2);
        px(c+8,13,4,3,P.mt5);px(c+13,14,3,2,P.mt4);
        if(fr%2){px(c+16,14,3,2,P.fl1);glowless(c+18,15,P.fl2);}
        break;}
      case 'flamer':{
        limb(c-2,24,c-3,34,4,P.d3,P.g2,P.n,P.n);limb(c+2,24,c+3,34,4,P.d3,P.g2,P.n,P.n);
        limb(c,10,c,23,9,P.rd4,P.rd3,P.rd5,P.n);
        box(c-7,11,6,10,P.mt4,P.n);px(c-6,12,4,2,P.mt2);px(c-6,17,4,2,P.or3);
        ellO(c-1,5,4.5,4.5,P.sk3,P.n);ell(c-1,2,5,2.5,P.rd5);px(c+1,4,3,2,P.or2);
        line(c+2,16,c+13,16,P.n,4);line(c+2,16,c+13,16,P.mt3,2);
        px(c+6,13,4,4,P.or3);
        if(fr%2){for(let i=0;i<4;i++){ell(c+16+i*4,16+Math.sin(i+fr)*2,3-i*.4,3-i*.4,i%2?P.fl2:P.fl3);} }
        break;}
      case 'bird':{
        const w=fr%2?5:-4;
        ellO(c,10,9,5,VP.a,P.n);ell(c-2,8,6,3,VP.b);
        tri(c-16,6+w,12,5,VP.c,-1);tri(c+5,6-w,12,5,VP.c,-1);
        tri(c+8,9,6,4,P.or2,1);px(c+4,8,2,2,P.rd2);
        px(c-2,14,3,4,P.or3);px(c+2,14,3,4,P.or3);
        if(fr%2){ell(c,16,3,3,P.mt5);px(c-1,17,2,2,P.rd2);}
        break;}
      case 'flyer':{
        const w=fr%2?4:-3;
        ellO(c,9,11,6,P.pu3,P.n);ell(c-2,7,7,3,P.pu1);
        tri(c-17,4+w,12,6,P.pu4,-1);tri(c+6,4-w,12,6,P.pu4,-1);
        px(c-3,7,6,2,P.cy2);px(c-1,13,3,3,P.rd2);
        break;}
      case 'turret':{
        box(2,10,24,14,P.mt4,P.n);px(3,11,22,2,P.mt2);px(4,20,20,2,P.mt5);
        ellO(c,10,9,6,P.mt3,P.n);ell(c-2,8,5,3,P.mt2);
        line(c,10,c+15,10,P.n,6);line(c,10,c+15,10,P.mt2,4);
        px(c-2,8,4,3,P.rd2);
        break;}
      case 'jumper':{
        const t=fr%2;
        limb(c-2,16,c-6,26-t*4,4,VP.a,P.or1,P.d2,P.n);
        limb(c+2,16,c+6,26-t*4,4,VP.a,P.or1,P.d2,P.n);
        ellO(c,10,8,8,VP.a,P.n);ell(c-2,8,5,4,P.or1);
        px(c-4,8,3,3,P.yl2);px(c+1,8,3,3,P.yl2);px(c-4,16,8,2,P.rd4);
        break;}
      case 'grenadier':{
        limb(c-2,24,c-3,34,4,P.d3,P.g2,P.n,P.n);limb(c+2,24,c+3,34,4,P.d3,P.g2,P.n,P.n);
        limb(c,10,c,23,8,VP.a,VP.b,VP.c,P.n);
        box(c-4,12,9,7,P.rd4,P.n);px(c-3,13,7,1,P.rd3);
        ellO(c-1,5,4.5,4.5,P.sk3,P.n);ell(c-1,2,5,2.5,P.rd5);
        line(c+2,12,c+8,6,P.n,3);line(c+2,12,c+8,6,P.mt3,2);
        ell(c+9,5,3,3,P.gr2);px(c+9,4,2,1,P.gr1);
        break;}
      case 'crawler':{
        ellO(c,10,11,6,VP.a,P.n);ell(c-2,8,7,3,P.pu1);
        for(let i=-3;i<=3;i++){const q=Math.sin(fr*1.6+i)*3;
          line(c+i*3,12,c+i*4+q,17,P.pu4,2);}
        px(c+6,8,3,2,P.rd2);px(c+3,10,2,2,P.rd1);
        break;}
      case 'sniper':{
        limb(c-2,24,c-3,34,4,P.d3,P.g2,P.n,P.n);limb(c+2,24,c+3,34,4,P.d3,P.g2,P.n,P.n);
        limb(c,10,c,23,8,VP.a,VP.b,VP.c,P.n);
        box(c-4,12,8,7,P.cy4,P.n);px(c-3,13,6,1,P.cy3);
        ellO(c-1,5,4.5,4.5,P.sk3,P.n);ell(c-1,2,5,2.5,P.cy3);
        line(c+2,15,c+19,15,P.n,3);line(c+2,15,c+19,15,P.mt2,2);
        px(c+8,12,4,3,P.cy2);px(c+17,14,3,2,P.mt4);
        break;}
      case 'pod':{
        ellO(c,10,11,8,P.cy4,P.n);px(c-6,6,12,7,P.cy1);px(c-6,6,12,2,P.w);
        px(c-2,8,4,3,P.bl5);
        break;}
    }
  },28, type==='turret'?30: type==='bird'||type==='flyer'?22:38);
}

/* ---------- сборка атласа ---------- */
function runPose(i){
  const ph=i/8*Math.PI*2,s1=Math.sin(ph),s2=Math.sin(ph+Math.PI);
  return {la:[s1*.75,Math.max(0,-Math.cos(ph))*1.0],lb:[s2*.75,Math.max(0,Math.cos(ph))*1.0],
          bob:Math.abs(Math.sin(ph))*1.2|0,f:1};
}
function init(){
  window.__G=null;
  DATA.CHARS.forEach(ch=>{
    const fr={run:[],idle:[],jump:[],fall:[],prone:null};
    for(let i=0;i<8;i++)fr.run.push(body(ch.pal,ch.gear,runPose(i)));
    fr.idle.push(body(ch.pal,ch.gear,{la:[-.12,.05],lb:[.14,.04],bob:0,f:1}));
    fr.idle.push(body(ch.pal,ch.gear,{la:[-.12,.05],lb:[.14,.04],bob:1,f:1}));
    fr.jump.push(body(ch.pal,ch.gear,{la:[-.6,1.1],lb:[.35,.4],bob:0,f:1}));
    fr.fall.push(body(ch.pal,ch.gear,{la:[-.75,1.3],lb:[.3,.5],bob:0,f:1}));
    fr.prone=body(ch.pal,ch.gear,{prone:true,f:1});
    const ar=DIRS.map(d=>arms(ch.pal,ch.gear,d));
    A.chars[ch.id]={fr,ar};
  });
  const types=['runner','gunner','flamer','bird','flyer','turret','jumper','grenadier','crawler','sniper','pod'];
  types.forEach(t=>{
    A.foes[t]=[];
    for(let v=0;v<3;v++){
      const frames=[foePaint(t,v,0),foePaint(t,v,1),foePaint(t,v,2),foePaint(t,v,3)];
      A.foes[t].push(frames);
    }
  });
  A.TIP=TIP;
}
function char(id){return A.chars[id];}
function foe(type,v){return A.foes[type]?A.foes[type][v%3]:null;}
function dirIndex(a){
  let best=0,bd=-2;
  for(let i=0;i<8;i++){const d=DIRS[i],dot=d[0]*a.x+d[1]*a.y;if(dot>bd){bd=dot;best=i;}}
  return best;
}
return {init,char,foe,dirIndex,TIP,DIRS};
})();
if(typeof window!=='undefined')window.GFX=GFX;
