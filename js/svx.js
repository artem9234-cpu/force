/* ============================================================
   SVX — декодер IFF/8SVX (Amiga) + WAV, сэмпл-канал поверх FM
   ============================================================ */
const SVX = (() => {
'use strict';
let ctx=null, mst=null, buf=null, meta=null, muted=false;
let mode=0, gain=.30, baseNote=261.63, lastStep=-1;
const MODES=['ВЫКЛ','РИТМ','БАС','ЛИД'];
const NT={};
(function(){const nm=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  for(let o=1;o<=7;o++)for(let i=0;i<12;i++)NT[nm[i]+o]=440*Math.pow(2,(i-9)/12+(o-4));})();
const nf=s=>typeof s==='number'?s:(NT[s]||261.63);

function ensure(){
  if(ctx)return;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  try{ctx=new AC();mst=ctx.createGain();mst.gain.value=gain;mst.connect(ctx.destination);}
  catch(e){ctx=null;}
}
function tag(dv,o){return String.fromCharCode(dv.getUint8(o),dv.getUint8(o+1),dv.getUint8(o+2),dv.getUint8(o+3));}
function str(dv,o,n){let s='';for(let i=0;i<n;i++){const c=dv.getUint8(o+i);if(c)s+=String.fromCharCode(c);}return s;}

/* ---------- разбор IFF FORM/8SVX ---------- */
function parse8svx(ab){
  const dv=new DataView(ab);
  if(ab.byteLength<16) throw new Error('файл слишком короткий');
  if(tag(dv,0)!=='FORM') throw new Error('нет сигнатуры FORM');
  const formSize=dv.getUint32(4);
  const form=tag(dv,8);
  if(form!=='8SVX'&&form!=='16SV') throw new Error('формат '+form+', ожидался 8SVX');
  const wide=(form==='16SV');
  let p=12, vhdr=null, body=null, name='', anno='';
  const end=Math.min(ab.byteLength, formSize+8);
  while(p+8<=end){
    const id=tag(dv,p), sz=dv.getUint32(p+4), d=p+8;
    if(d+sz>ab.byteLength) break;
    if(id==='VHDR'){
      vhdr={
        oneShot:dv.getUint32(d),
        repeat:dv.getUint32(d+4),
        cycle:dv.getUint32(d+8),
        rate:dv.getUint16(d+12)||8000,
        octaves:dv.getUint8(d+14)||1,
        comp:dv.getUint8(d+15),
        volume:dv.getUint32(d+16)/65536
      };
    } else if(id==='BODY'){
      body=wide?new Int16Array(ab,d,sz>>1):new Int8Array(ab,d,sz);
    } else if(id==='NAME'){ name=str(dv,d,sz); }
    else if(id==='ANNO'){ anno=str(dv,d,sz); }
    p=d+sz+(sz&1);
  }
  if(!vhdr) throw new Error('нет чанка VHDR');
  if(!body||!body.length) throw new Error('нет чанка BODY');
  if(vhdr.comp!==0) throw new Error('сжатый 8SVX (compression='+vhdr.comp+') не поддержан');

  const oct=vhdr.oneShot+vhdr.repeat;
  const total=(vhdr.octaves>1&&oct>0)?Math.min(oct,body.length):body.length;
  const norm=wide?32768:128;
  const f=new Float32Array(total);
  for(let i=0;i<total;i++) f[i]=body[i]/norm;

  return {
    data:f, rate:vhdr.rate,
    loop:vhdr.repeat>0?{start:vhdr.oneShot,end:vhdr.oneShot+vhdr.repeat}:null,
    name:name||'8SVX sample', anno,
    volume:Math.max(.2,Math.min(1,vhdr.volume||1)),
    octaves:vhdr.octaves, bits:wide?16:8
  };
}

/* ---------- загрузка ---------- */
async function fromArrayBuffer(ab,label){
  ensure();
  if(!ctx) throw new Error('Web Audio недоступен');
  let parsed=null;
  try{ parsed=parse8svx(ab); }
  catch(e){
    // не IFF — пробуем WAV/MP3/OGG штатным декодером
    const dec=await ctx.decodeAudioData(ab.slice(0));
    buf=dec;
    meta={name:label||dec.name||'audio',rate:dec.sampleRate,ch:dec.numberOfChannels,
          dur:dec.duration,kind:'WAV/сжатый',loop:null,volume:1};
    paint();
    return meta;
  }
  const b=ctx.createBuffer(1,parsed.data.length,parsed.rate);
  b.copyToChannel(parsed.data,0);
  buf=b;
  meta={name:parsed.name,rate:parsed.rate,ch:1,dur:b.duration,
        kind:parsed.bits+'-bit 8SVX',loop:parsed.loop,volume:parsed.volume,anno:parsed.anno};
  paint();
  return meta;
}
async function fromFile(file){
  const ab=await file.arrayBuffer();
  return fromArrayBuffer(ab,file.name);
}
async function fromURL(url){
  const r=await fetch(url);
  if(!r.ok) throw new Error('HTTP '+r.status);
  const ab=await r.arrayBuffer();
  return fromArrayBuffer(ab,url.split('/').pop());
}

/* ---------- воспроизведение ---------- */
function voice(freq,dur,vol,pan){
  if(!ctx||!buf||muted||mode===0)return;
  const t0=ctx.currentTime;
  const s=ctx.createBufferSource();
  s.buffer=buf;
  if(meta.loop&&dur>buf.duration){
    s.loop=true;
    s.loopStart=meta.loop.start/buf.sampleRate;
    s.loopEnd=meta.loop.end/buf.sampleRate;
  }
  s.playbackRate.value=Math.max(.05,Math.min(8,freq/baseNote));
  const g=ctx.createGain();
  const v=(vol==null?1:vol)*(meta.volume||1);
  g.gain.setValueAtTime(.0001,t0);
  g.gain.exponentialRampToValueAtTime(Math.max(.001,v),t0+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t0+Math.max(.05,dur));
  s.connect(g);
  if(pan!==undefined&&ctx.createStereoPanner){
    const pn=ctx.createStereoPanner();pn.pan.value=pan;g.connect(pn);pn.connect(mst);
  } else g.connect(mst);
  s.start(t0);
  s.stop(t0+Math.max(.06,dur)+.05);
}

/* ритмический слой, вызывается из игрового цикла */
function tick(step,bar,bassNote,leadNote){
  if(!buf||muted||mode===0)return;
  const key=bar*16+step;
  if(key===lastStep)return;
  lastStep=key;
  if(mode===1){
    if(step%4===0) voice(baseNote*(step%8===0?1:1.5),.16,step%8===0?.9:.5,step%8===0?-.2:.2);
  } else if(mode===2){
    if(step%2===0&&bassNote) voice(nf(bassNote)*2,.20,.75,0);
  } else if(mode===3){
    if(leadNote) voice(nf(leadNote),.26,.55,.25);
  }
}

/* ---------- управление ---------- */
function setMuted(v){muted=!!v;if(ctx&&mst)mst.gain.value=muted?0:gain;}
function setGain(v){gain=Math.max(0,Math.min(1,v));if(ctx&&mst&&!muted)mst.gain.value=gain;}
function cycleMode(){mode=(mode+1)%MODES.length;paint();return MODES[mode];}
function setBase(f){baseNote=Math.max(40,Math.min(2000,f));}
function unlock(){ensure();if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});}
function suspend(){if(ctx&&ctx.state==='running')ctx.suspend().catch(()=>{});}
function resume(){if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});}

function paint(){
  const el=document.getElementById('svxInfo');
  if(!el)return;
  if(!buf){el.textContent='сэмпл не загружен';el.className='svx-info';return;}
  el.textContent=MODES[mode]+' · '+meta.name.slice(0,18)+' · '+meta.rate+'Гц · '+meta.dur.toFixed(2)+'с';
  el.className='svx-info on';
  el.title=meta.kind+(meta.loop?' · луп '+meta.loop.start+'–'+meta.loop.end:'')+(meta.anno?'\n'+meta.anno:'');
}
function info(){return meta;}
function loaded(){return !!buf;}
function modeName(){return MODES[mode];}

return {fromFile,fromURL,fromArrayBuffer,voice,tick,setMuted,setGain,cycleMode,setBase,
        unlock,suspend,resume,paint,info,loaded,modeName,
        get mode(){return mode;}};
})();
if(typeof window!=='undefined')window.SVX=SVX;
