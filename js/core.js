/* CORE v19 — база: палитра, рисование, шрифт, звук, ввод */
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
 fur1:'#d09050',fur2:'#a06028',fur3:'#703c14',fur4:'#482408',
 cat1:'#8888a8',cat2:'#5c5c78',cat3:'#38384c',cat4:'#20202e'};
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
/* ---------- ШРИФТ ---------- */
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
     const x0
