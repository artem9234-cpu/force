/* ============================================================
   GFX v8 — ручной пиксель-арт, запечённая обводка,
   пре-композиция кадров + полная обратная совместимость API
   ============================================================ */
const GFX=(()=>{
'use strict';
function pal(o){return Object.assign({
  o:'#0d1018',s:'#f0b878',S:'#c07840',h:'#ffd9a8',
  p:'#2a6fb0',P:'#17416e',q:'#4aa8e8',b:'#5a300c',B:'#331a04',
  r:'#c22a22',y:'#c79a00',g:'#63728a',G:'#cdd8e6',k:'#242c3a',
  u:'#478a2c',U:'#2c5e1c',w:'#eef4ff',e:'#ff4a3d',f:'#ffb020'},o);}

const PALS={
  antony:pal({p:'#2a6fb0',P:'#17416e',q:'#4aa8e8',r:'#c22a22',b:'#5a300c'}),
  artyom:pal({p:'#3d4759',P:'#242c3a',q:'#63728a',r:'#ff4a3d',b:'#1d2536',y:'#ffa32a'}),
  den:pal({p:'#17416e',P:'#0d2440',q:'#2a6fb0',r:'#35e0ff',b:'#2a3448',s:'#ffd9a8',S:'#f0b878',h:'#fff3d8'}),
  dimka:pal({p:'#3d1668',P:'#240b40',q:'#6a2bb0',r:'#a24bff',b:'#1d2536',y:'#e0c2ff',g:'#0d5570',G:'#35e0ff'})
};
const GEAR={
  antony:null,
  artyom:['....gggggg......','...gGGGGGGg.....','...gkkkkkkg.....'],
  den:['....rrrrrr......','...rrrrrrrr.....','...rwwwwwwr.....'],
  dimka:['....gggggg......','...gGGGGGGg.....','...gkGGGGkg.....']
};
const TORSO=[
'......rrrrr.......','.....rrrrrrr......','.....osssso.......','.....oshhso.......',
'.....oshoso.......','.....osssso.......','......osso........','.....osssso.......',
'....ohhsshho......','...oshhhhhhso.....','...osShhhhSso.....','...osShhhhSso.....',
'...osSShhSSso.....','....oSSSSSSo......','....oyyyyyyo......','....oppppppo......',
'....opqppqpo......'];
const LEGS={
 idle:['....oppo.oppo.....','....oppo.oppo.....','....oPpo.oPpo.....','....oPpo.oPpo.....',
       '....obbo.obbo.....','...obbbo.obbbo....','...obbbo.obbbo....','..oooooo.oooooo...','..................'],
 run0:['....oppooppo......','...oppo..oppo.....','..oppo....oppo....','..oPpo....oPpo....',
       '.oPpo......oPpo...','.obbo......obbo...','obbbo......obbbo..','ooooo......ooooo..','..................'],
 run1:['....oppoppo.......','....oppoppo.......','.....oppppo.......','.....oPpoPo.......',
       '.....obboPo.......','....obbo.obo......','....oooo.obbo.....','.........oooo.....','..................'],
 run2:['....oppooppo......','.....oppo.oppo....','....oppo...oppo...','....oPpo...oPpo...',
       '...oPpo.....oPpo..','...obbo.....obbo..','..obbbo.....obbbo.','..ooooo.....ooooo.','..................'],
 run3:['....oppoppo.......','....oppoppo.......','.....oppppo.......','.....oPpoPo.......',
       '.....oPpobo.......','......obo.obbo....','.....obbo.oooo....','.....oooo.........','..................'],
 jump:['....oppooppo......','...oppo..oppo.....','...oPpo...oPpo....','...obbo....obo....',
       '..obbbo...obbo....','..oooo....oooo....','..................','..................','..................'],
 fall:['....oppo.oppo.....','...oppo...oppo....','...oPpo...oPpo....','..oPpo.....oPpo...',
       '..obbo.....obbo...','.obbbo.....obbbo..','.ooooo.....ooooo..','..................','..................']
};
const PRONE=[
'..........rrrr..............','.........osssso.............','........oshhso..............',
'.....oossssssoo.............','...oosShhhhSsssooo..........','..osSShhhhSSssgggggggggo....',
'..osSSSSSSSSsoGGGGGGGGGo....','..oppppppppoo...............','.opqppppppppo...............',
'.obbo..obbo.................','obbbo..obbbo................','ooooo..ooooo................'];
const ARMS={
 F:{w:18,h:9,dx:-2,dy:-3,tip:[17,1],rows:[
'..................','..osssso..........','.osShhssoo........','.osShhhssgggggggo.',
'..osssssGGGGGGGGGo','...oooooggggggggo.','........kk........','..................','..................']},
 DU:{w:15,h:15,dx:-2,dy:-12,tip:[13,-11],rows:[
'...........gggo','..........gGGGo','.........gggGo.','........ogggo..','.......ossgo...',
'.....osssso....','....osShhso....','...osShhso.....','...osssso......','..osssso.......',
'..osso.........','..ooo..........','...............','...............','...............']},
 U:{w:9,h:17,dx:-4,dy:-15,tip:[0,-16],rows:[
'..gggo...','..gGGGo..','..ggggo..','..okko...','..osgo...','..osgo...','.ossso...',
'.osSso...','.osSso...','.ossso...','osssso...','osSsso...','osssso...','.oooo....',
'.........','.........','.........']},
 DD:{w:15,h:15,dx:-2,dy:-2,tip:[13,11],rows:[
'..ooo..........','..osso.........','..osssso.......','...osssso......','...osShhso.....',
'....osShhso....','.....osssso....','.......ossgo...','........ogggo..','.........gggGo.',
'..........gGGGo','...........gggo','...............','...............','...............']},
 D:{w:9,h:17,dx:-4,dy:-2,tip:[0,16],rows:[
'.........','.........','.........','.oooo....','osssso...','osSsso...','osssso...',
'.ossso...','.osSso...','.osSso...','.ossso...','..osgo...','..osgo...','..okko...',
'..ggggo..','..gGGGo..','..gggo...']}
};
const AIMKEYS=['F','DU','U','DD','D'];
const EBASE=[
'.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososo.......',
'.....osso.......','....ouuuuo......','...ouuuuuuo.....','...ouUUUUuo.....','...ouuuuuuo.....',
'...ouuuuuuo.....','....obbbbo......','....ouuuuo......','....ouuuuo......'];
const ELEGS={
 s0:['....ouo.ouo.....','....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....',
     '....obo.obo.....','...obbo.obbo....','...obbo.obbo....','..ooooo.ooooo...','................','................'],
 s1:['....ouoouo......','...ouo..ouo.....','..ouo....ouo....','..oUo....oUo....',
     '.obo......obo...','obbo......obbo..','oooo......oooo..','................','................','................'],
 s2:['....ouoouo......','.....ouo.ouo....','....ouo...ouo...','....oUo...oUo...',
     '...obo.....obo..','..obbo.....obbo.','..oooo.....oooo.','................','................','................']
};
const EGUN={
 rifle:['................','................','................','................','................',
        '................','................','...oggggggggo...','...oGGGGGGGGo...','....kk..........'],
 gunner:['................','................','................','................','................',
         '................','...oggggggggggo.','...oGGGGGGGGGGo.','...okkkkggggggo.','....kk..kk......'],
 flamer:['................','................','................','..offo..........','..offo..........',
         '..okko..........','..okko..........','...oggggggo.....','...oGGGGGGo.....','....kk..ff......'],
 sniper:['................','................','................','................','................',
         '................','.....oGGGo......','..ogggggggggggo.','..oGGGGGGGGGGGo.','....kk..........'],
 gren:['................','................','................','................','................',
       '.....ouuuuo.....','....ouUUUUuo....','...oggggggggo...','...oGGGGGGGGo...','....kk..........']
};
const BIRD=[
['..........oooo........','.....oooouuuuoo.......','..oouuuuuUUUUuuoo.....','.ouuuUUUUUUUUUUuuo....',
 '.ouuUUUUeeeeUUUUuo....','..ouuuUUUUUUUUuuo.....','...oouuuuuuuuoo.......','.....obbo.obbo........',
 '.....okko.okko........','......oo...oo.........'],
['.....ooo..............','..oouuuooooo..........','.ouuuUUUUuuuoo........','.ouuUUUUUUUUuuoo......',
 '..ouuUUeeeeUUUUuo.....','...ouuuUUUUUUuuo......','....oouuuuuuoo........','.....obbo.obbo........',
 '.....okko.okko........','......oo...oo.........']];
const TURRET=[
'.....oooooooooo.....','....oGGGGGGGGGGo....','...oGkkkkkkkkkkGo...','...oGkGGGGGGGGkGo...',
'...oGkGooooooGkGo...','...oGkGoeeeeoGkGo...','...oGkGoeeeeoGkGo...','...oGkGooooooGkGo...',
'...oGkGGGGGGGGkGo...','...oGkkkkkkkkkkGo...','....oGGGGGGGGGGo....','.....oooooooooo.....',
'.......ogggo........','.......oGGGo........','......ogggggo.......','.....oGGGGGGGo......',
'....ogggggggggo.....','....ooooooooooo.....'];
const CRAWLER=[
['....oooooooo....','..oouuuuuuuuoo..','.ouuUUUUUUUUuuo.','.ouUUeeUUeeUUuo.','.ouuUUUUUUUUuuo.',
 '..oouuuuuuuuoo..','.o.o.o....o.o.o.','o.o.o.o..o.o.o.o','.o...o....o...o.','................'],
['....oooooooo....','..oouuuuuuuuoo..','.ouuUUUUUUUUuuo.','.ouUUeeUUeeUUuo.','.ouuUUUUUUUUuuo.',
 '..oouuuuuuuuoo..','o.o.o.o..o.o.o.o','.o.o.o....o.o.o.','..o...o..o...o..','................']];
const JUMPER=[
['....oooo....','..oouuuuoo..','.ouuUUUUuuo.','.ouUeeeeUuo.','.ouuUUUUuuo.','..oouuuuoo..',
 '...ouuuuo...','..ouo..ouo..','..oUo..oUo..','..obo..obo..','.obbo..obbo.','.oooo..oooo.'],
['....oooo....','..oouuuuoo..','.ouuUUUUuuo.','.ouUeeeeUuo.','.ouuUUUUuuo.','..oouuuuoo..',
 '...ouuuuo...','...ouoouo...','...oUooUo...','....obbo....','...obbbbo...','...oooooo...']];
const POD=[
'....oooooooo....','..ooGGGGGGGGoo..','.oGwwwwwwwwwwGo.','oGwwwwwwwwwwwwGo','oGwwwkkkkkkwwwGo',
'oGwwwkGGGGkwwwGo','oGwwwkGwwGkwwwGo','oGwwwkGGGGkwwwGo','oGwwwkkkkkkwwwGo','oGwwwwwwwwwwwwGo',
'.oGwwwwwwwwwwGo.','..ooGGGGGGGGoo..','....oooooooo....','................'];
const DRONE=[
['.......oooo.......','...oooouuuuoooo...','.oouuuuUUUUuuuuoo.','ouuuUUUUUUUUUUuuuo',
 'ouuUUUeeeeeeUUUuuo','.ouuuUUUUUUUUuuuo.','...oouuuuuuuuoo...','......okkkko......',
 '.......oe.eo......','........oo........'],
['...ooo........ooo.','.oouuuoooooouuuoo.','ouuuUUUUUUUUUUuuuo','ouuUUUUUUUUUUUUuuo',
 '.ouuUUeeeeeeUUuuo.','..ouuuUUUUUUuuuo..','...oouuuuuuuuoo...','......okkkko......',
 '.......oe.eo......','........oo........']];

function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function over(dst,rows,pl,ox,oy){
  const x=dst.getContext('2d');
  for(let y=0;y<rows.length;y++){const row=String(rows[y]||'');
    for(let X=0;X<row.length;X++){const ch=row[X];if(ch==='.'||ch===' ')continue;
      const c=pl[ch];if(!c)continue;x.fillStyle=c;x.fillRect(ox+X,oy+y,1,1);}}
}
function make(rows,w,h,pl){const c=blank(w,h);over(c,rows,pl,0,0);return c;}
function flip(c){const f=blank(c.width,c.height),x=f.getContext('2d');
  x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}

const CW=38,CH=46,BX=10,BY=20,SHX=BX+9,SHY=BY+10;
function compose(body,leg,aim,pl,gear){
  const c=blank(CW,CH);
  over(c,body,pl,BX,BY);over(c,leg,pl,BX,BY+17);
  if(gear)over(c,gear,pl,BX,BY);
  const a=ARMS[aim];over(c,a.rows,pl,SHX+a.dx,SHY+a.dy);
  return c;
}
const A={chars:{},foes:{},legacy:{},CW,CH,SHX,SHY,TIP:[]};
const DIRS=[[1,0],[.71,.71],[0,1],[-.71,.71],[-1,0],[-.71,-.71],[0,-1],[.71,-.71]];

function buildChar(id){
  const pl=PALS[id],gear=GEAR[id],set={},legacy={fr:{run:[],idle:[],jump:[],fall:[],prone:null},ar:[]};
  const keys=['idle','run0','run1','run2','run3','jump','fall'];
  keys.forEach(k=>{
    set[k]={};
    AIMKEYS.forEach(ak=>{
      const r=compose(TORSO,LEGS[k],ak,pl,gear);
      set[k][ak]={r,l:flip(r)};
    });
  });
  const prc=blank(CW,20);over(prc,PRONE,pl,4,8);
  set.prone={r:prc,l:flip(prc)};
  A.chars[id]=set;
  for(let i=0;i<4;i++)legacy.fr.run.push(set['run'+i].F.r);
  legacy.fr.idle.push(set.idle.F.r);legacy.fr.idle.push(set.idle.F.r);
  legacy.fr.jump.push(set.jump.F.r);legacy.fr.fall.push(set.fall.F.r);
  legacy.fr.prone=prc;
  legacy.ar=DIRS.map(d=>{
    const ak=d[1]<0?(d[0]===0?'U':'DU'):d[1]>0?(d[0]===0?'D':'DD'):'F';
    const c=blank(28,28);over(c,ARMS[ak].rows,pl,14+ARMS[ak].dx,12+ARMS[ak].dy);return c;});
  A.legacy[id]=legacy;
}
const EVAR=[{u:'#478a2c',U:'#2c5e1c',r:'#2c5e1c',b:'#331a04'},
            {u:'#a86c3a',U:'#75451f',r:'#75451f',b:'#331a04'},
            {u:'#2a6fb0',U:'#17416e',r:'#17416e',b:'#1d2536'}];
function soldier(type,v,frame){
  const pl=pal(Object.assign({},EVAR[v]));
  if(type==='flamer'){pl.u='#c22a22';pl.U='#7d1610';pl.r='#7d1610';}
  if(type==='sniper'){pl.u='#0d5570';pl.U='#071628';pl.r='#1a93b8';}
  if(type==='grenadier'){pl.u='#8f3c06';pl.U='#5a300c';pl.r='#e06a12';}
  const c=blank(20,26);
  over(c,EBASE,pl,2,0);over(c,ELEGS['s'+frame],pl,2,14);
  const key=type==='gunner'?'gunner':type==='flamer'?'flamer':type==='sniper'?'sniper':
            type==='grenadier'?'gren':'rifle';
  over(c,EGUN[key],pl,2,8);
  return c;
}
function buildFoes(){
  ['runner','gunner','flamer','sniper','grenadier','shooter'].forEach(t=>{
    A.foes[t]=[];
    for(let v=0;v<3;v++){
      const fr=[0,1,2].map(f=>soldier(t,v,f));
      A.foes[t].push(fr.map(c=>({r:c,l:flip(c)})));
    }
  });
  const simple={bird:BIRD,crawler:CRAWLER,jumper:JUMPER,flyer:DRONE};
  Object.keys(simple).forEach(t=>{
    A.foes[t]=[];
    for(let v=0;v<3;v++){
      const pl=pal(Object.assign({},EVAR[v]));
      if(t==='bird'||t==='crawler'){pl.u='#6a2bb0';pl.U='#3d1668';}
      if(t==='flyer'){pl.u='#63728a';pl.U='#3d4759';}
      A.foes[t].push(simple[t].map(rows=>{
        const w=Math.max.apply(null,rows.map(r=>r.length)),h=rows.length;
        const c=make(rows,w,h,pl);return {r:c,l:flip(c)};}));
    }
  });
  const tp=pal({G:'#cdd8e6',g:'#63728a',k:'#242c3a',e:'#ff4a3d'});
  const tc=make(TURRET,20,18,tp),tf=flip(tc);
  A.foes.turret=[[{r:tc,l:tf}],[{r:tc,l:tf}],[{r:tc,l:tf}]];
  const pp=pal({G:'#35e0ff',w:'#d4fbff',k:'#0d5570'});
  const pc=make(POD,16,14,pp),pf=flip(pc);
  A.foes.pod=[[{r:pc,l:pf}],[{r:pc,l:pf}],[{r:pc,l:pf}]];
}
let ready=false;
function init(){
  if(ready)return;
  try{
    Object.keys(PALS).forEach(buildChar);
    buildFoes();
    A.TIP=DIRS.map(d=>({x:14+d[0]*26,y:12+d[1]*26}));
    ready=true;
  }catch(e){console.error('GFX init',e);}
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
  const b=s[bodyKey]||s.idle,f=b[aim]||b.F;
  return left?f.l:f.r;
}
/* полиморфный foe: (type) → варианты, (type,v) → кадры, (type,v,fr,left) → канвас */
function foe(type,v,frame,left){
  const set=A.foes[type];if(!set)return null;
  if(v===undefined)return set;
  const arr=set[(v|0)%3];if(!arr||!arr.length)return null;
  if(frame===undefined)return arr;
  const f=arr[Math.abs(frame|0)%arr.length];
  if(!f)return null;
  return left?f.l:f.r;
}
function char(id){return A.legacy[id]||null;}
function dirIndex(a){
  if(!a)return 0;
  let best=0,bd=-2;
  for(let i=0;i<8;i++){const d=DIRS[i],dot=d[0]*a.x+d[1]*a.y;if(dot>bd){bd=dot;best=i;}}
  return best;
}
function tip(aim,left,sx,sy){
  const a=ARMS[aim]||ARMS.F;
  return {x:sx+a.tip[0]*(left?-1:1),y:sy+a.tip[1]};
}
return {init,player,foe,char,dirIndex,aimKey,tip,CW,CH,SHX,SHY,AIMKEYS,DIRS,
        get TIP(){return A.TIP;},get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
