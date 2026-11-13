/* ============================================================
   CORE — палитра, пиксельная графика, шрифт (латиница+кириллица),
   FM-звук, ввод. Логическое поле 448×256.
   ============================================================ */
const CORE = (() => {
'use strict';
const W = 448, H = 256, TS = 16;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=n=>(Math.random()*n)|0;
const sgn=v=>v<0?-1:v>0?1:0;
const lerp=(a,b,t)=>a+(b-a)*t;

const P = {
  k:'#000000', n:'#070a10', d1:'#131a26', d2:'#1d2536', d3:'#2a3448',
  g1:'#3b4a63', g2:'#54648a', g3:'#7386ad', g4:'#9eb0cf', w:'#eef4ff',
  sk1:'#ffe0b4', sk2:'#f0b878', sk3:'#c98a4e', sk4:'#8f5c2c', sk5:'#5e3818',
  br1:'#d69a58', br2:'#a86c3a', br3:'#75451f', br4:'#4a2a10', br5:'#2c1808',
  gr1:'#a8e86a', gr2:'#6fbc44', gr3:'#478a2c', gr4:'#2c5e1c', gr5:'#173a10', gr6:'#0d2408',
  bl1:'#a4e2ff', bl2:'#4aa8e8', bl3:'#2a6fb0', bl4:'#17416e', bl5:'#0d2440', bl6:'#071628',
  rd1:'#ffb0a0', rd2:'#ff4a3d', rd3:'#c22a22', rd4:'#7d1610', rd5:'#4a0c08',
  or1:'#ffd07a', or2:'#ffa32a', or3:'#e06a12', or4:'#8f3c06',
  yl1:'#fff6a8', yl2:'#ffd400', yl3:'#c79a00', yl4:'#7d6000',
  pu1:'#e0c2ff', pu2:'#a24bff', pu3:'#6a2bb0', pu4:'#3d1668', pu5:'#240b40',
  cy1:'#d4fbff', cy2:'#35e0ff', cy3:'#1a93b8', cy4:'#0d5570',
  mt1:'#cdd8e6', mt2:'#93a3ba', mt3:'#63728a', mt4:'#3d4759', mt5:'#242c3a',
  fl1:'#fff0c0', fl2:'#ffb020', fl3:'#ff6a1a', fl4:'#c23a08',
  fur1:'#c98b4b', fur2:'#9c6234', fur3:'#6d3f1d', fur4:'#43240f',
  cat1:'#6e6e88', cat2:'#4a4a5e', cat3:'#2c2c3c', cat4:'#1a1a26'
};

let G=null;
function bind(ctx){ G=ctx; }
function px(x,y,w,h,c){ G.fillStyle=c; G.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0)); }
function box(x,y,w,h,c,o){ if(o)px(x-1,y-1,w+2,h+2,o); px(x,y,w,h,c); }
function ell(cx,cy,rx,ry,c){
  cx=Math.round(cx);cy=Math.round(cy);rx=Math.max(.5,rx);ry=Math.max(.5,ry);G.fillStyle=c;
  const R=Math.round(ry);
  for(let y=-R;y<=R;y++){const k=1-(y*y)/(ry*ry);if(k<0)continue;
    const w=Math.round(rx*Math.sqrt(k));G.fillRect(cx-w,cy+y,w*2+1,1);}
}
function ellO(cx,cy,rx,ry,c,o){ ell(cx,cy,rx+1,ry+1,o); ell(cx,cy,rx,ry,c); }
function line(x0,y0,x1,y1,c,t){
  t=t||1;x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;
  let err=dx-dy;G.fillStyle=c;
  for(let i=0;i<600;i++){G.fillRect(x0-(t>>1),y0-(t>>1),t,t);
    if(x0===x1&&y0===y1)break;const e2=err*2;
    if(e2>-dy){err-=dy;x0+=sx;}if(e2<dx){err+=dx;y0+=sy;}}
}
function limb(x0,y0,x1,y1,w,base,hi,sh,out){
  line(x0,y0,x1,y1,out,w+2);
  line(x0,y0,x1,y1,base,w);
  if(w>=3){ line(x0,y0-1,x1,y1-1,hi,Math.max(1,w-2)); line(x0,y0+1,x1,y1+1,sh,1); }
}
function tri(x,y,w,h,c,dir){
  G.fillStyle=c;
  for(let i=0;i<h;i++){const ww=Math.max(1,Math.round(w*(dir>0?(i+1)/h:1-i/h)));
    G.fillRect(Math.round(x+(w-ww)/2),Math.round(y+i),ww,1);}
}
function dith(x,y,w,h,c1,c2,mode){
  px(x,y,w,h,c1);G.fillStyle=c2;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const on = mode===0 ? ((i+j)&1)===0 : mode===1 ? ((i&1)===0&&(j&1)===0) : ((i+j*2)%4===0);
    if(on)G.fillRect((x+i)|0,(y+j)|0,1,1);
  }
}
function vgrad(x,y,w,h,c1,c2){
  const bands=8;
  for(let i=0;i<bands;i++){
    const t=i/(bands-1), yy=y+Math.round(h*i/bands), hh=Math.ceil(h/bands);
    if(i===0)px(x,yy,w,hh,c1);
    else if(i===bands-1)px(x,yy,w,hh,c2);
    else dith(x,yy,w,hh,c1,c2, t<.35?1:t<.7?0:2);
  }
}
function glow(cx,cy,r,c,a){
  G.save();G.globalAlpha=a==null?.5:a;
  const gr=G.createRadialGradient(cx,cy,0,cx,cy,r);
  gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');
  G.fillStyle=gr;G.beginPath();G.arc(cx,cy,r,0,6.2832);G.fill();G.restore();
}

/* ---------- ШРИФТ 5×7: латиница + кириллица ---------- */
const F={
'A':[14,17,17,31,17,17,17],'B':[30,17,17,30,17,17,30],'C':[14,17,16,16,16,17,14],
'D':[30,17,17,17,17,17,30],'E':[31,16,16,30,16,16,31],'F':[31,16,16,30,16,16,16],
'G':[14,17,16,23,17,17,15],'H':[17,17,17,31,17,17,17],'I':[14,4,4,4,4,4,14],
'J':[7,2,2,2,2,18,12],'K':[17,18,20,24,20,18,17],'L':[16,16,16,16,16,16,31],
'M':[17,27,21,21,17,17,17],'N':[17,25,21,19,17,17,17],'O':[14,17,17,17,17,17,14],
'P':[30,17,17,30,16,16,16],'Q':[14,17,17,17,21,18,13],'R':[30,17,17,30,20,18,17],
'S':[15,16,16,14,1,1,30],'T':[31,4,4,4,4,4,4],'U':[17,17,17,17,17,17,14],
'V':[17,17,17,17,17,10,4],'W':[17,17,17,21,21,27,17],'X':[17,17,10,4,10,17,17],
'Y':[17,17,10,4,4,4,4],'Z':[31,1,2,4,8,16,31],
'А':[14,17,17,31,17,17,17],'Б':[31,16,16,30,17,17,30],'В':[30,17,17,30,17,17,30],
'Г':[31,16,16,16,16,16,16],'Д':[6,10,10,10,10,31,17],'Е':[31,16,16,30,16,16,31],
'Ё':[10,0,31,16,30,16,31],'Ж':[21,21,21,14,21,21,21],'З':[14,17,1,6,1,17,14],
'И':[17,17,19,21,25,17,17],'Й':[10,4,17,19,21,25,17],'К':[17,18,20,24,20,18,17],
'Л':[7,9,9,9,9,9,17],'М':[17,27,21,21,17,17,17],'Н':[17,17,17,31,17,17,17],
'О':[14,17,17,17,17,17,14],'П':[31,17,17,17,17,17,17],'Р':[30,17,17,30,16,16,16],
'С':[14,17,16,16,16,17,14],'Т':[31,4,4,4,4,4,4],'У':[17,17,17,15,1,17,14],
'Ф':[4,14,21,21,21,14,4],'Х':[17,17,10,4,10,17,17],'Ц':[18,18,18,18,18,31,1],
'Ч':[17,17,17,15,1,1,1],'Ш':[21,21,21,21,21,21,31],'Щ':[21,21,21,21,21,31,1],
'Ъ':[24,8,8,14,9,9,14],'Ы':[17,17,17,25,21,21,25],'Ь':[16,16,16,30,17,17,30],
'Э':[14,17,1,7,1,17,14],'Ю':[18,21,21,29,21,21,18],'Я':[15,17,17,15,5,9,17],
'0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,2,4,8,31],
'3':[31,2,4,2,1,17,14],'4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],
'6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],
'9':[14,17,17,15,1,2,12],' ':[0,0,0,0,0,0,0],'-':[0,0,0,31,0,0,0],
'.':[0,0,0,0,0,0,4],':':[0,4,0,0,0,4,0],'!':[4,4,4,4,4,0,4],
'?':[14,17,1,2,4,0,4],'/':[1,1,2,4,8,16,16],'%':[17,2,4,8,16,17,0],
'(':[2,4,8,8,8,4,2],')':[8,4,2,2,2,4,8],'<':[2,4,8,16,8,4,2],'>':[8,4,2,1,2,4,8],
'*':[4,21,14,31,14,21,4],'+':[0,4,4,31,4,4,0],'=':[0,0,31,0,31,0,0],
"'":[4,4,0,0,0,0,0],',':[0,0,0,0,0,4,8],'#':[10,31,10,10,10,31,10],'×':[0,10,4,10,0,0,0]
};
function tw(s,sc){sc=sc||1;return String(s).length*6*sc-sc;}
function txt(s,x,y,c,sc){
  sc=sc||1;s=String(s).toUpperCase();G.fillStyle=c;
  for(let i=0;i<s.length;i++){const gl=F[s[i]]||F['?'];
    for(let r=0;r<7;r++){const b=gl[r];
      for(let q=0;q<5;q++)if(b&(1<<(4-q)))G.fillRect((x+i*6*sc+q*sc)|0,(y+r*sc)|0,sc,sc);}}
}
function txtC(s,cx,y,c,sc){txt(s,Math.round(cx-tw(s,sc)/2),y,c,sc);}
function txtSh(s,x,y,c,sc,sh){txt(s,x+1,y+1,sh||P.k,sc);txt(s,x,y,c,sc);}
function txtCSh(s,cx,y,c,sc,sh){txtC(s,cx+1,y+1,sh||P.k,sc);txtC(s,cx,y,c,sc);}

/* ---------- FM-ЗВУК ---------- */
const SND=(()=>{
  let ctx=null,mst=null,on=true,musicOn=true,mgain=null,seq=null,step=0,nextT=0,cur=null;
  function ensure(){
    if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    try{ctx=new AC();mst=ctx.createGain();mst.gain.value=.16;mst.connect(ctx.destination);
      mgain=ctx.createGain();mgain.gain.value=.5;mgain.connect(mst);}catch(e){ctx=null;}
  }
  function fm(f,dur,o){
    if(!on||!ctx||!f)return;o=o||{};
    const t0=ctx.currentTime+(o.at||0), dest=o.music?mgain:mst;
    const car=ctx.createOscillator(),mod=ctx.createOscillator();
    const cg=ctx.createGain(),mgn=ctx.createGain();
    car.type=o.type||'sine';mod.type='sine';
    car.frequency.setValueAtTime(f,t0);
    if(o.slide)car.frequency.exponentialRampToValueAtTime(Math.max(20,o.slide),t0+dur);
    mod.frequency.setValueAtTime(f*(o.ratio||2),t0);
    const idx=(o.index==null?2.2:o.index)*f;
    mgn.gain.setValueAtTime(idx,t0);
    mgn.gain.exponentialRampToValueAtTime(Math.max(1,idx*(o.decay==null?.15:o.decay)),t0+dur*.7);
    mod.connect(mgn);mgn.connect(car.frequency);
    const v=(o.vol==null?.5:o.vol);
    cg.gain.setValueAtTime(.0001,t0);
    cg.gain.exponentialRampToValueAtTime(v,t0+(o.atk||.006));
    cg.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    car.connect(cg);cg.connect(dest);
    car.start(t0);mod.start(t0);car.stop(t0+dur+.03);mod.stop(t0+dur+.03);
  }
  function nz(dur,vol,freq,at,music){
    if(!on||!ctx)return;
    const n=Math.max(1,(ctx.sampleRate*dur)|0),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    const s=ctx.createBufferSource();s.buffer=b;
    const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||1400;f.Q.value=.7;
    const g=ctx.createGain();g.gain.value=vol==null?.4:vol;
    s.connect(f);f.connect(g);g.connect(music?mgain:mst);s.start(ctx.currentTime+(at||0));
  }
  const N={C2:65.4,D2:73.4,E2:82.4,F2:87.3,G2:98,A2:110,B2:123.5,
    C3:130.8,D3:146.8,E3:164.8,F3:174.6,G3:196,A3:220,B3:246.9,
    C4:261.6,D4:293.7,E4:329.6,F4:349.2,G4:392,A4:440,B4:493.9,
    C5:523.3,D5:587.3,E5:659.3,F5:698.5,G5:784,A5:880,B5:987.8,C6:1046.5,E6:1318.5,G6:1568};
  const SFX={
    shot:()=>fm(880,.05,{ratio:3,index:4,vol:.2,slide:300,decay:.05}),
    mg:()=>fm(1100,.035,{ratio:3,index:3,vol:.15,slide:500,decay:.05}),
    spread:()=>{fm(700,.07,{ratio:2,index:5,vol:.22,slide:260});nz(.05,.13,2200);},
    laser:()=>fm(1500,.16,{ratio:1.5,index:6,vol:.22,slide:420,type:'sawtooth'}),
    fire:()=>{fm(320,.16,{ratio:1,index:5,vol:.24,slide:140});nz(.12,.16,900);},
    homing:()=>fm(520,.14,{ratio:4,index:3,vol:.18,slide:900}),
    jump:()=>fm(340,.11,{ratio:2,index:2,vol:.22,slide:760}),
    djump:()=>fm(520,.12,{ratio:3,index:3,vol:.22,slide:1100}),
    dash:()=>{nz(.14,.24,2600);fm(200,.14,{ratio:1,index:4,vol:.18,slide:640});},
    land:()=>nz(.05,.12,600),
    hit:()=>{nz(.09,.28,2400);fm(420,.08,{ratio:3,index:4,vol:.18,slide:150});},
    kill:()=>{nz(.22,.4,1100);fm(260,.2,{ratio:1.5,index:5,vol:.26,slide:70});},
    boom:()=>{nz(.5,.55,520);fm(150,.45,{ratio:1,index:6,vol:.34,slide:40});},
    hurt:()=>{fm(300,.3,{ratio:1.4,index:6,vol:.36,slide:70});nz(.24,.28,700);},
    pick:()=>{[N.E5,N.A5,N.C6].forEach((f,i)=>fm(f,.1,{ratio:2,index:2,vol:.28,at:i*.06}));},
    spec:()=>{[N.C4,N.G4,N.C5,N.E5,N.G5].forEach((f,i)=>fm(f,.16,{ratio:3,index:4,vol:.28,at:i*.05}));nz(.3,.22,1800);},
    ui:()=>fm(1200,.04,{ratio:2,index:1,vol:.18}),
    ok:()=>{fm(N.A5,.07,{ratio:2,index:2,vol:.24});fm(N.E6,.12,{ratio:2,index:2,vol:.24,at:.07});},
    boss:()=>{[N.C3,N.C3,N.G3,N.C3,N.E2].forEach((f,i)=>fm(f,.3,{ratio:1,index:7,vol:.36,at:i*.22,type:'sawtooth'}));},
    win:()=>{[N.C5,N.E5,N.G5,N.C6,N.G5,N.C6,N.E6].forEach((f,i)=>fm(f,.18,{ratio:2,index:3,vol:.3,at:i*.13}));},
    dead:()=>{[N.A4,N.G4,N.F4,N.E4,N.D4,N.C4,N.C3].forEach((f,i)=>fm(f,.34,{ratio:1.5,index:4,vol:.32,at:i*.2}));}
  };
  const TRACKS={
    menu:{bpm:112,bass:[N.C3,0,N.G2,0,N.A2,0,N.E2,0],lead:[N.C5,0,N.E5,N.G5,0,N.E5,N.D5,0],drum:[1,0,0,0,1,0,0,0]},
    s1:{bpm:150,bass:[N.A2,N.A2,N.E2,N.A2,N.G2,N.G2,N.D2,N.G2],lead:[N.A4,N.C5,N.E5,N.C5,N.D5,N.B4,N.G4,N.B4],drum:[1,0,1,0,1,0,1,1]},
    s2:{bpm:158,bass:[N.D3,N.D3,N.A2,N.D3,N.C3,N.C3,N.G2,N.C3],lead:[N.D5,N.F5,N.A5,N.F5,N.E5,N.C5,N.G5,N.E5],drum:[1,0,1,1,1,0,1,0]},
    s3:{bpm:164,bass:[N.E2,N.E2,N.B2,N.E2,N.F2,N.F2,N.C3,N.F2],lead:[N.E5,N.G5,N.B5,N.G5,N.F5,N.A5,N.C6,N.A5],drum:[1,1,0,1,1,0,1,1]},
    boss:{bpm:176,bass:[N.C2,N.C2,N.C2,N.G2,N.C2,N.C2,N.E2,N.F2],lead:[N.C5,N.C5,N.G5,N.E5,N.F5,N.E5,N.D5,N.C5],drum:[1,1,1,0,1,1,1,1]}
  };
  function music(name){ ensure();if(!ctx)return; if(cur===name)return;cur=name;seq=TRACKS[name]||null;step=0;nextT=ctx.currentTime+.05; }
  function tickMusic(){
    if(!ctx||!seq||!on||!musicOn)return;
    const spb=60/seq.bpm/2;
    while(nextT<ctx.currentTime+.18){
      const i=step%8, at=Math.max(0,nextT-ctx.currentTime);
      const b=seq.bass[i];if(b)fm(b,spb*.92,{ratio:1,index:5,vol:.3,at,type:'sawtooth',music:true,decay:.3});
      const l=seq.lead[i];if(l)fm(l,spb*.7,{ratio:2,index:2.2,vol:.14,at,music:true,decay:.2});
      if(seq.drum[i])nz(.07,.14,180,at,true);
      if(i%4===2)nz(.04,.07,5200,at,true);
      nextT+=spb;step++;
    }
  }
  return {
    unlock(){ensure();if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});},
    play(n){try{if(SFX[n])SFX[n]();}catch(e){}},
    music,tickMusic,
    set(v){on=!!v;if(ctx&&mst)mst.gain.value=on?.16:0;},
    get(){return on;},
    suspend(){if(ctx&&ctx.state==='running')ctx.suspend().catch(()=>{});},
    resume(){if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});}
  };
})();

/* ---------- ВВОД ---------- */
const IN=(()=>{
  const st={left:0,right:0,up:0,down:0,fire:0,jump:0,spec:0,start:0};
  const edge={};const prev={};
  const KEY={
    arrowleft:'left',a:'left',ф:'left',
    arrowright:'right',d:'right',в:'right',
    arrowup:'up',w:'up',ц:'up',
    arrowdown:'down',s:'down',ы:'down',
    z:'fire',' ':'fire',j:'fire',
    x:'jump',k:'jump',
    c:'spec',l:'spec',shift:'spec',
    enter:'start',escape:'start',p:'start'
  };
  function set(k,v){if(!(k in st))return;st[k]=v?1:0;}
  function kd(e){const k=KEY[e.key.toLowerCase()];if(k){e.preventDefault();SND.unlock();set(k,1);}}
  function ku(e){const k=KEY[e.key.toLowerCase()];if(k){e.preventDefault();set(k,0);}}
  function bindDom(root){
    document.addEventListener('keydown',kd);
    document.addEventListener('keyup',ku);
    root.querySelectorAll('[data-k]').forEach(el=>{
      const k=el.dataset.k;
      const dn=e=>{e.preventDefault();SND.unlock();set(k,1);el.classList.add('on');
        try{el.setPointerCapture(e.pointerId);}catch(_){}};
      const up=()=>{set(k,0);el.classList.remove('on');};
      el.addEventListener('pointerdown',dn);
      ['pointerup','pointercancel','pointerleave'].forEach(ev=>el.addEventListener(ev,up));
    });
    window.addEventListener('blur',()=>{for(const k in st)st[k]=0;});
  }
  function poll(){for(const k in st){edge[k]=st[k]&&!prev[k];prev[k]=st[k];}}
  return {st,edge,poll,bindDom,set};
})();

return {W,H,TS,P,clamp,rnd,ri,sgn,lerp,bind,px,box,ell,ellO,line,limb,tri,dith,vgrad,glow,
        txt,txtC,tw,txtSh,txtCSh,SND,IN};
})();
