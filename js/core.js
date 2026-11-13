const CORE=(()=>{
'use strict';
const W=448,H=256,TS=16;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=n=>(Math.random()*n)|0;
const sgn=v=>v<0?-1:v>0?1:0;
const lerp=(a,b,t)=>a+(b-a)*t;
const P={
 k:'#000000',n:'#070a10',d1:'#131a26',d2:'#1d2536',d3:'#2a3448',
 g1:'#3b4a63',g2:'#54648a',g3:'#7386ad',g4:'#9eb0cf',w:'#eef4ff',
 sk1:'#ffe0b4',sk2:'#f0b878',sk3:'#c98a4e',sk4:'#8f5c2c',sk5:'#5e3818',
 br1:'#e8a55c',br2:'#c07830',br3:'#8a4f18',br4:'#5a300c',br5:'#331a04',
 gr1:'#a8e86a',gr2:'#6fbc44',gr3:'#478a2c',gr4:'#2c5e1c',gr5:'#173a10',gr6:'#0d2408',
 cg1:'#7ce85a',cg2:'#48c024',cg3:'#2a8010',cg4:'#154a08',
 bl1:'#a4e2ff',bl2:'#4aa8e8',bl3:'#2a6fb0',bl4:'#17416e',bl5:'#0d2440',bl6:'#071628',
 cw1:'#7ce0ff',cw2:'#28a8f0',cw3:'#1064c0',cw4:'#083a80',
 rd1:'#ffb0a0',rd2:'#ff4a3d',rd3:'#c22a22',rd4:'#7d1610',rd5:'#4a0c08',
 or1:'#ffd07a',or2:'#ffa32a',or3:'#e06a12',or4:'#8f3c06',
 yl1:'#fff6a8',yl2:'#ffd400',yl3:'#c79a00',yl4:'#7d6000',
 pu1:'#e0c2ff',pu2:'#a24bff',pu3:'#6a2bb0',pu4:'#3d1668',pu5:'#240b40',
 cy1:'#d4fbff',cy2:'#35e0ff',cy3:'#1a93b8',cy4:'#0d5570',
 mt1:'#cdd8e6',mt2:'#93a3ba',mt3:'#63728a',mt4:'#3d4759',mt5:'#242c3a',
 fl1:'#fff0c0',fl2:'#ffb020',fl3:'#ff6a1a',fl4:'#c23a08',
 // Новые цвета для скелетной анимации и детализированных тайлов
 skinL:'#ffd9a8', skinM:'#f0b878', skinD:'#c98a4e',
 clothL:'#5aaee0', clothM:'#2a6fb0', clothD:'#17416e',
 pantsL:'#7a88ff', pantsM:'#4a55d0', pantsD:'#2a3080',
 grassL:'#7ce85a', grassM:'#48c024', grassD:'#2a8010',
 rockL:'#6a5a4a', rockM:'#3a2a1a', rockD:'#1a0a00'};
let G=null;
function bind(c){G=c;}
function px(x,y,w,h,c){G.fillStyle=c;G.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));}
function box(x,y,w,h,c,o){if(o)px(x-1,y-1,w+2,h+2,o);px(x,y,w,h,c);}
function ell(cx,cy,rx,ry,c){
 cx=Math.round(cx);cy=Math.round(cy);rx=Math.max(.5,rx);ry=Math.max(.5,ry);G.fillStyle=c;
 const R=Math.round(ry);
 for(let y=-R;y<=R;y++){const k=1-(y*y)/(ry*ry);if(k<0)continue;
  const w=Math.round(rx*Math.sqrt(k));G.fillRect(cx-w,cy+y,w*2+1,1);}}
function ellO(cx,cy,rx,ry,c,o){ell(cx,cy,rx+1,ry+1,o);ell(cx,cy,rx,ry,c);}
function line(x0,y0,x1,y1,c,t){
 t=t||1;x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
 const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;
 let err=dx-dy;G.fillStyle=c;
 for(let i=0;i<700;i++){G.fillRect(x0-(t>>1),y0-(t>>1),t,t);
  if(x0===x1&&y0===y1)break;const e2=err*2;
  if(e2>-dy){err-=dy;x0+=sx;}if(e2<dx){err+=dx;y0+=sy;}}}
function limb(x0,y0,x1,y1,w,base,hi,sh,out){
 line(x0,y0,x1,y1,out,w+2);line(x0,y0,x1,y1,base,w);
 if(w>=3){line(x0,y0-1,x1,y1-1,hi,Math.max(1,w-2));line(x0,y0+1,x1,y1+1,sh,1);}}
function tri(x,y,w,h,c,dir){
 G.fillStyle=c;
 for(let i=0;i<h;i++){const ww=Math.max(1,Math.round(w*(dir>0?(i+1)/h:1-i/h)));
  G.fillRect(Math.round(x+(w-ww)/2),Math.round(y+i),ww,1);}}
function dith(x,y,w,h,c1,c2,mode){
 px(x,y,w,h,c1);G.fillStyle=c2;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){
  const on=mode===0?((i+j)&1)===0:mode===1?((i&1)===0&&(j&1)===0):((i+j*2)%4===0);
  if(on)G.fillRect((x+i)|0,(y+j)|0,1,1);}}
function vgrad(x,y,w,h,c1,c2){
 const bands=8;
 for(let i=0;i<bands;i++){
  const t=i/(bands-1),yy=y+Math.round(h*i/bands),hh=Math.ceil(h/bands);
  if(i===0)px(x,yy,w,hh,c1);
  else if(i===bands-1)px(x,yy,w,hh,c2);
  else dith(x,yy,w,hh,c1,c2,t<.35?1:t<.7?0:2);}}
function glow(cx,cy,r,c,a){
 G.save();G.globalAlpha=a==null?.5:a;
 const gr=G.createRadialGradient(cx,cy,0,cx,cy,r);
 gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');
 G.fillStyle=gr;G.beginPath();G.arc(cx,cy,r,0,6.2832);G.fill();G.restore();}
function hash(x,y){let h=(x*374761393+y*668265263)|0;h=((h^(h>>>13))*1274126177)|0;
 return ((h^(h>>>16))>>>0)/4294967296;}
const F={' ':[0,0,0,0,0,0,0]};
(function buildFont(){
 const CH='ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'+
          '0123456789.,:;!?’\'"/?\\%()<>[]{}*+-=¬_¬|#@&$^~`№§°±×÷';
 let t=null,x=null;
 try{t=document.createElement('canvas');x=t.getContext('2d',{willReadFrequently:true});}catch(e){return;}
 const FS=44,FNT='900 '+FS+'px "Arial Black",Arial,monospace,sans-serif';
 for(const ch of CH){
  try{
   x.font=FNT;
   const w=Math.max(6,Math.ceil(x.measureText(ch).width)+2);
   const h=Math.ceil(FS*1.25);
   t.width=w;t.height=h;
   x.font=FNT;x.textBaseline='alphabetic';x.fillStyle='#fff';
   x.fillText(ch,1,FS*0.92);
   const d=x.getImageData(0,0,w,h).data;
   const rows=[];
   for(let r=0;r<7;r++){
    let bits=0;
    for(let c=0;c<5;c++){
     const x0=Math.floor(c*w/5),x1=Math.max(x0+1,Math.floor((c+1)*w/5));
     const y0=Math.floor(r*h/7),y1=Math.max(y0+1,Math.floor((r+1)*h/7));
     let acc=0,cnt=0;
     for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){acc+=d[(yy*w+xx)*4+3];cnt++;}
     if(cnt&&(acc/cnt)>62)bits|=(1<<(4-c));
    }
    rows.push(bits);
   }
   if(rows.some(b=>b))F[ch]=rows;
  }catch(e){}
 }
})();
function tw(s,sc){sc=sc||1;return String(s).length*6*sc-sc;}
function txt(s,x,y,c,sc){
 sc=sc||1;s=String(s).toUpperCase();G.fillStyle=c;
 for(let i=0;i<s.length;i++){const gl=F[s[i]]||F['?']||F[' '];
  for(let r=0;r<7;r++){const b=gl[r]||0;
   for(let q=0;q<5;q++)if(b&(1<<(4-q)))G.fillRect((x+i*6*sc+q*sc)|0,(y+r*sc)|0,sc,sc);}}}
function txtC(s,cx,y,c,sc){txt(s,Math.round(cx-tw(s,sc)/2),y,c,sc);}
function txtSh(s,x,y,c,sc,sh){txt(s,x+1,y+1,sh||P.k,sc);txt(s,x,y,c,sc);}
function txtCSh(s,cx,y,c,sc,sh){txtC(s,cx+1,y+1,sh||P.k,sc);txtC(s,cx,y,c,sc);}

const SND=(()=>{
 let ctx=null,mst=null,on=true,mgain=null,seq=null,step=0,nextT=0,cur=null,bar=0;
 const NT={};
 (function(){const nm=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  for(let o=1;o<=7;o++)for(let i=0;i<12;i++)NT[nm[i]+o]=440*Math.pow(2,(i-9)/12+(o-4));})();
 const n=s=>typeof s==='number'?s:(NT[s]||0);
 function ensure(){
  if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{ctx=new AC();mst=ctx.createGain();mst.gain.value=.15;mst.connect(ctx.destination);
   mgain=ctx.createGain();mgain.gain.value=.38;mgain.connect(mst);}catch(e){ctx=null;}}
 function fm(f,dur,o){
  if(!on||!ctx||!f)return;o=o||{};
  const t0=ctx.currentTime+(o.at||0),dest=o.music?mgain:mst;
  const car=ctx.createOscillator(),mod=ctx.createOscillator();
  const cg=ctx.createGain(),mgn=ctx.createGain();
  car.type=o.type||'square';mod.type=o.modType||'sine';
  car.frequency.setValueAtTime(f,t0);
  if(o.slide)car.frequency.exponentialRampToValueAtTime(Math.max(20,o.slide),t0+dur);
  mod.frequency.setValueAtTime(f*(o.ratio||2),t0);
  const idx=(o.index==null?2.4:o.index)*f;
  mgn.gain.setValueAtTime(idx,t0);
  mgn.gain.exponentialRampToValueAtTime(Math.max(1,idx*(o.decay==null?.15:o.decay)),t0+dur*.8);
  mod.connect(mgn);mgn.connect(car.frequency);
  const v=(o.vol==null?.5:o.vol);
  cg.gain.setValueAtTime(.0001,t0);
  cg.gain.exponentialRampToValueAtTime(v,t0+(o.atk||.005));
  cg.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  car.connect(cg);cg.connect(dest);
  car.start(t0);mod.start(t0);car.stop(t0+dur+.04);mod.stop(t0+dur+.04);}
 function nz(dur,vol,freq,at,music,q){
  if(!on||!ctx)return;
  const nn=Math.max(1,(ctx.sampleRate*dur)|0),b=ctx.createBuffer(1,nn,ctx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<nn;i++)d[i]=(Math.random()*2-1)*(1-i/nn);
  const s=ctx.createBufferSource();s.buffer=b;
  const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||1400;f.Q.value=q||.7;
  const g=ctx.createGain();g.gain.value=vol==null?.4:vol;
  s.connect(f);f.connect(g);g.connect(music?mgain:mst);s.start(ctx.currentTime+(at||0));}
 const SFX={
  shot:()=>fm(880,.05,{ratio:3,index:4,vol:.18,slide:300,decay:.05,type:'square'}),
  mg:()=>fm(1100,.032,{ratio:3,index:3,vol:.13,slide:520,decay:.05,type:'square'}),
  spread:()=>{fm(700,.07,{ratio:2,index:5,vol:.2,slide:260,type:'square'});nz(.05,.12,2200);},
  laser:()=>fm(1500,.16,{ratio:1.5,index:6,vol:.2,slide:420,type:'sawtooth'}),
  fire:()=>{fm(320,.16,{ratio:1,index:5,vol:.22,slide:140,type:'sawtooth'});nz(.12,.15,900);},
  homing:()=>fm(520,.14,{ratio:4,index:3,vol:.16,slide:900,type:'sawtooth'}),
  jump:()=>fm(340,.11,{ratio:2,index:2,vol:.2,slide:760,type:'square'}),
  djump:()=>fm(520,.12,{ratio:3,index:3,vol:.2,slide:1100,type:'square'}),
  dash:()=>{nz(.14,.22,2600);fm(200,.14,{ratio:1,index:4,vol:.16,slide:640,type:'sawtooth'});},
  land:()=>nz(.05,.1,600),
  hit:()=>{nz(.08,.24,2400);fm(420,.08,{ratio:3,index:4,vol:.16,slide:150,type:'square'});},
  kill:()=>{nz(.2,.34,1100);fm(260,.2,{ratio:1.5,index:5,vol:.22,slide:70,type:'sawtooth'});},
  boom:()=>{nz(.45,.5,520);fm(150,.42,{ratio:1,index:6,vol:.3,slide:40,type:'sawtooth'});},
  hurt:()=>{fm(300,.3,{ratio:1.4,index:6,vol:.32,slide:70,type:'sawtooth'});nz(.24,.24,700);},
  pick:()=>{['E5','A5','C6'].forEach((f,i)=>fm(n(f),.1,{ratio:2,index:2,vol:.24,at:i*.06,type:'square'}));},
  spec:()=>{['C4','G4','C5','E5','G5'].forEach((f,i)=>fm(n(f),.16,{ratio:3,index:4,vol:.24,at:i*.05,type:'square'}));nz(.3,.2,1800);},
  ui:()=>fm(1200,.04,{ratio:2,index:1,vol:.16,type:'square'}),
  ok:()=>{fm(n('A5'),.07,{ratio:2,index:2,vol:.22,type:'square'});fm(n('E6'),.12,{ratio:2,index:2,vol:.22,at:.07,type:'square'});},
  boss:()=>{['C3','C3','G3','C3','D#3'].forEach((f,i)=>fm(n(f),.3,{ratio:1,index:7,vol:.32,at:i*.22,type:'sawtooth'}));},
  dead:()=>{['A4','G4','F4','E4','D4','C4','C3'].forEach((f,i)=>fm(n(f),.34,{ratio:1.5,index:4,vol:.28,at:i*.2,type:'sawtooth'}));},
  win:()=>{['C5','E5','G5','C6','G5','C6','E6'].forEach((f,i)=>fm(n(f),.18,{ratio:2,index:3,vol:.3,at:i*.13,type:'square'}));}};
 const _=0;
 const SONGS={
  menu:{bpm:104,order:[0,1],
   bass:[['C3',_,_,_,'G2',_,_,_,'A2',_,_,_,'E2',_,_,_],['F2',_,_,_,'C3',_,_,_,'G2',_,_,_,'G2',_,'B2',_]],
   lead:[['C5',_,'E5',_,'G5',_,'E5',_,'D5',_,'C5',_,_,_,_,_],['A4',_,'C5',_,'F5',_,'E5',_,'D5',_,'B4',_,'G4',_,_,_]],
   arp:[['C4','E4','G4'],['C4','E4','G4'],['A3','C4','E4'],['A3','C4','E4'],['F3','A3','C4'],['F3','A3','C4'],['G3','B3','D4'],['G3','B3','D4']],
   drum:[[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],[1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0]]},
  s1:{bpm:158,order:[0,1,0,2],
   bass:[['A2','A2',_,'A2','E2',_,'A2',_,'G2','G2',_,'G2','D2',_,'G2',_],
         ['F2','F2',_,'F2','C3',_,'F2',_,'E2','E2',_,'E2','B2',_,'E2',_],
         ['A2','A2','A2','A2','G2','G2','G2','G2','F2','F2','F2','F2','E2','E2','E2','E2']],
   lead:[['A4',_,'C5','E5',_,'D5','C5',_,'B4',_,'D5','G5',_,'F5','E5',_],
         ['F4',_,'A4','C5',_,'B4','A4',_,'G4',_,'B4','E5',_,'D5','C5',_],
         ['E5','D5','C5','B4','A4','B4','C5','D5','E5','F5','E5','D5','C5','B4','A4',_]],
   arp:[['A3','C4','E4'],['A3','C4','E4'],['G3','B3','D4'],['G3','B3','D4'],['F3','A3','C4'],['F3','A3','C4'],['E3','G#3','B3'],['E3','G#3','B3']],
   drum:[[1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0],[1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1],[1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1]]},
  s2:{bpm:164,order:[0,1,2,1],
   bass:[['D3','D3',_,'D3','A2',_,'D3',_,'C3','C3',_,'C3','G2',_,'C3',_],
         ['A#2','A#2',_,'A#2','F3',_,'A#2',_,'A2','A2',_,'A2','E3',_,'A2',_],
         ['D3','A2','D3','A2','C3','G2','C3','G2','A#2','F2','A#2','F2','A2','E2','A2','E2']],
   lead:[['D5',_,'F5','A5',_,'G5','F5',_,'E5',_,'G5','C6',_,'A#5','A5',_],
         ['A#5',_,'A5','F5',_,'D5','F5',_,'A5',_,'G5','E5',_,'C#5','E5',_],
         ['A5','G5','F5','E5','D5','E5','F5','G5','A5','A#5','A5','G5','F5','E5','D5',_]],
   arp:[['D4','F4','A4'],['D4','F4','A4'],['C4','E4','G4'],['C4','E4','G4'],['A#3','D4','F4'],['A#3','D4','F4'],['A3','C#4','E4'],['A3','C#4','E4']],
   drum:[[1,0,1,0,0,1,1,0,1,0,1,0,0,1,1,0],[1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1],[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1]]},
  s3:{bpm:172,order:[0,1,0,2],
   bass:[['E2','E2','E2',_,'B2',_,'E2',_,'F2','F2','F2',_,'C3',_,'F2',_],
         ['C2','C2','C2',_,'G2',_,'C2',_,'D2','D2','D2',_,'A2',_,'D2',_],
         ['E2','E2','F2','F2','G2','G2','G#2','G#2','A2','A2','A#2','A#2','B2','B2','B2','B2']],
   lead:[['E5',_,'G5','B5',_,'A5','G5',_,'F5',_,'A5','C6',_,'B5','A5',_],
         ['C5',_,'D#5','G5',_,'F5','D#5',_,'D5',_,'F5','A5',_,'G5','F5',_],
         ['B5','A#5','A5','G#5','G5','F#5','F5','E5','D#5','D5','C#5','C5','B4','A#4','A4',_]],
   arp:[['E3','G3','B3'],['E3','G3','B3'],['F3','A3','C4'],['F3','A3','C4'],['C3','D#3','G3'],['C3','D#3','G3'],['D3','F3','A3'],['D3','F3','A3']],
   drum:[[1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1],[1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]},
  boss:{bpm:184,order:[0,1,0,2],
   bass:[['C2','C2','C2','C2','C2','C2','G2','G2','C2','C2','C2','C2','D#2','D#2','F2','F2'],
         ['G#1','G#1','G#1','G#1','G#1','G#1','D#2','D#2','G1','G1','G1','G1','A#1','A#1','B1','B1'],
         ['C2','G2','C2','G2','C2','G2','C2','G2','D#2','A#2','D#2','A#2','F2','C3','F2','C3']],
   lead:[['C5','C5',_,'G5','D#5',_,'C5',_,'D#5','F5',_,'G5','G#5',_,'G5','F5'],
         ['G#5','G#5',_,'D#6','C6',_,'G#5',_,'A#5','C6',_,'D6','D#6',_,'D6','C6'],
         ['C6','B5','A#5','A5','G#5','G5','F#5','F5','E5','D#5','D5','C#5','C5','B4','A#4','A4']],
   arp:[['C3','D#3','G3'],['C3','D#3','G3'],['C3','D#3','G3'],['C3','D#3','G3'],['G#2','C3','D#3'],['G#2','C3','D#3'],['G2','B2','D3'],['G2','B2','D3']],
   drum:[[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]},
  clear:{bpm:150,order:[0],once:true,
   bass:[['C3',_,'C3',_,'G2',_,'G2',_,'A2',_,'A2',_,'F2',_,'G2',_]],
   lead:[['C5','E5','G5','C6',_,'B5','G5',_,'A5','C6','E6',_,'D6','B5','G5',_]],
   arp:[['C4','E4','G4'],['C4','E4','G4'],['G3','B3','D4'],['G3','B3','D4'],['A3','C4','E4'],['A3','C4','E4'],['F3','A3','C4'],['G3','B3','D4']],
   drum:[[1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1]]},
  win:{bpm:132,order:[0,1],
   bass:[['C3',_,'G2',_,'A2',_,'E2',_,'F2',_,'C3',_,'G2',_,'G2',_],['C3',_,'C3',_,'F2',_,'F2',_,'G2',_,'G2',_,'C3',_,_,_]],
   lead:[['C5','E5','G5','C6','E6','C6','G5','E5','F5','A5','C6','F6','E6','C6','G5',_],['G5','C6','E6','G6','F6','E6','D6','C6','B5','D6','G6','B6','C6',_,_,_]],
   arp:[['C4','E4','G4'],['C4','E4','G4'],['A3','C4','E4'],['A3','C4','E4'],['F3','A3','C4'],['F3','A3','C4'],['G3','B3','D4'],['G3','B3','D4']],
   drum:[[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],[1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,1]]}};
 function music(name){ensure();if(!ctx)return;if(cur===name)return;
  cur=name;seq=SONGS[name]||null;step=0;bar=0;nextT=ctx.currentTime+.06;}
 function tickMusic(){
  if(!ctx||!seq||!on)return;
  const spb=60/seq.bpm/4;let guard=0;
  while(nextT<ctx.currentTime+.2&&guard++<40){
   const pi=seq.order[bar%seq.order.length],at=Math.max(0,nextT-ctx.currentTime);
   const bs=seq.bass[pi%seq.bass.length],ld=seq.lead[pi%seq.lead.length],
         dr=seq.drum[pi%seq.drum.length],ap=seq.arp[(bar*2+((step/8)|0))%seq.arp.length];
   const b=bs[step];if(b)fm(n(b),spb*1.9,{ratio:1,index:4.5,vol:.28,at,type:'sawtooth',music:true,decay:.35});
   const l=ld[step];if(l)fm(n(l),spb*2.6,{ratio:2,index:1.8,vol:.13,at,music:true,decay:.25,type:'square'});
   if(step%2===0&&ap){const an=ap[(step/2)%ap.length];
    fm(n(an)*2,spb*.85,{ratio:3,index:1.2,vol:.05,at,music:true,decay:.1,type:'square'});}
   if(dr[step]){
    if(step%8===0){nz(.09,.2,150,at,true,.5);fm(70,.11,{ratio:1,index:1,vol:.2,at,music:true,slide:40,type:'sawtooth'});}
    else if(step%8===4)nz(.11,.17,1900,at,true,.6);
    else nz(.035,.07,7000,at,true,1.2);}
   nextT+=spb;step++;
   if(step>=16){step=0;bar++;
    if(seq.once&&bar>=seq.order.length){seq=null;cur=null;return;}}}}
 return {unlock(){ensure();if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});},
  play(k){try{if(SFX[k])SFX[k]();}catch(e){}},music,tickMusic,
  set(v){on=!!v;if(ctx&&mst)mst.gain.value=on?.15:0;},get(){return on;},
  suspend(){if(ctx&&ctx.state==='running')ctx.suspend().catch(()=>{});},
  resume(){if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});}};
})();
const IN=(()=>{
 const st={left:0,right:0,up:0,down:0,fire:0,jump:0,spec:0,start:0};
 const KEY={arrowleft:'left',a:'left',f:'left',arrowright:'right',d:'right',v:'right',
  arrowup:'up',w:'up',arrowdown:'down',s:'down',
  z:'fire',' ':'fire',j:'fire',x:'jump',k:'jump',c:'spec',l:'spec',shift:'spec',
  enter:'start',escape:'start',p:'start'};
 function set(k,v){if(!(k in st))return;st[k]=v?1:0;}
 addEventListener('keydown',e=>{let k=KEY[e.key.toLowerCase()];
  if(k){e.preventDefault();SND.unlock();set(k,1);}},{passive:false});
 addEventListener('keyup',e=>{let k=KEY[e.key.toLowerCase()];
  if(k){e.preventDefault();set(k,0);}},{passive:false});
 function bindDom(root){
  if(!root)return;
  root.querySelectorAll('[data-k]').forEach(el=>{
   const k=el.dataset.k;
   el.addEventListener('pointerdown',e=>{e.preventDefault();SND.unlock();set(k,1);el.classList.add('on');},{passive:false});
   ['pointerup','pointercancel','pointerleave'].forEach(ev=>
    el.addEventListener(ev,()=>{set(k,0);el.classList.remove('on');},{passive:false}));
   el.addEventListener('contextmenu',e=>e.preventDefault());});
  addEventListener('blur',()=>{for(const k in st)st[k]=0;});}
 return {st,bindDom,set};
})();
return {W,H,TS,P,clamp,rnd,ri,sgn,lerp,bind,px,box,ell,ellO,line,limb,tri,dith,vgrad,glow,hash,
 txt,txtC,tw,txtSh,txtCSh,SND,IN};
})();
