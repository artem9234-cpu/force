/* ============================================================
   GFX — ручной пиксель-арт, запечённая обводка,
   пре-композиция тело+руки+ствол в готовые кадры.
   Один drawImage на сущность. Не трогает CORE.bind.
   ============================================================ */
const GFX=(()=>{
'use strict';
const P=CORE.P;

/* ---------- палитры бойцов (ключ → цвет) ---------- */
function pal(o){return Object.assign({
  o:'#0d1018', s:'#f0b878', S:'#c07840', h:'#ffd9a8',
  p:'#2a6fb0', P:'#17416e', q:'#4aa8e8', b:'#5a300c', B:'#331a04',
  r:'#c22a22', y:'#c79a00', g:'#63728a', G:'#cdd8e6', k:'#242c3a',
  u:'#478a2c', U:'#2c5e1c', w:'#eef4ff', e:'#ff4a3d', f:'#ffb020'
},o);}

const PALS={
  antony:pal({p:'#2a6fb0',P:'#17416e',q:'#4aa8e8',r:'#c22a22',b:'#5a300c'}),
  artyom:pal({p:'#3d4759',P:'#242c3a',q:'#63728a',r:'#ff4a3d',b:'#1d2536',
              s:'#f0b878',S:'#c07840',h:'#ffd9a8',y:'#ffa32a'}),
  den:   pal({p:'#17416e',P:'#0d2440',q:'#2a6fb0',r:'#35e0ff',b:'#2a3448',
              s:'#ffd9a8',S:'#f0b878',h:'#fff3d8'}),
  dimka: pal({p:'#3d1668',P:'#240b40',q:'#6a2bb0',r:'#a24bff',b:'#1d2536',
              y:'#e0c2ff',g:'#0d5570',G:'#35e0ff'})
};
/* головные уборы поверх базового лица */
const HEADGEAR={
  antony:null,
  artyom:[ '....gggggg......','...gGGGGGGg.....','...gkkkkkkg.....' ],
  den:   [ '....rrrrrr......','...rrrrrrrr.....','...rwwwwwwr.....' ],
  dimka: [ '....gggggg......','...gGGGGGGg.....','...gkGGGGkg.....' ]
};

/* ---------- ТЕЛО БОЙЦА 18×26 (без рук) ---------- */
const TORSO=[
'......rrrrr.......',
'.....rrrrrrr......',
'.....osssso.......',
'.....oshhso.......',
'.....oshoso.......',
'.....osssso.......',
'......osso........',
'.....osssso.......',
'....ohhsshho......',
'...oshhhhhhso.....',
'...osShhhhSso.....',
'...osShhhhSso.....',
'...osSShhSSso.....',
'....oSSSSSSo......',
'....oyyyyyyo......',
'....oppppppo......',
'....opqppqpo......'];
const LEGS={
 idle:[
'....oppo.oppo.....','....oppo.oppo.....','....oPpo.oPpo.....',
'....oPpo.oPpo.....','....obbo.obbo.....','...obbbo.obbbo....',
'...obbbo.obbbo....','..oooooo.oooooo...','..................'],
 run0:[
'....oppooppo......','...oppo..oppo.....','..oppo....oppo....',
'..oPpo....oPpo....','.oPpo......oPpo...','.obbo......obbo...',
'obbbo......obbbo..','ooooo......ooooo..','..................'],
 run1:[
'....oppoppo.......','....oppoppo.......','.....oppppo.......',
'.....oPpoPo.......','.....obboPo.......','....obbo.obo......',
'....oooo.obbo.....','.........oooo.....','..................'],
 run2:[
'....oppooppo......','.....oppo.oppo....','....oppo...oppo...',
'....oPpo...oPpo...','...oPpo.....oPpo..','...obbo.....obbo..',
'..obbbo.....obbbo.','..ooooo.....ooooo.','..................'],
 run3:[
'....oppoppo.......','....oppoppo.......','.....oppppo.......',
'.....oPpoPo.......','.....oPpobo.......','......obo.obbo....',
'.....obbo.oooo....','.....oooo.........','..................'],
 jump:[
'....oppooppo......','...oppo..oppo.....','...oPpo...oPpo....',
'...obbo....obo....','..obbbo...obbo....','..oooo....oooo....',
'..................','..................','..................'],
 fall:[
'....oppo.oppo.....','...oppo...oppo....','...oPpo...oPpo....',
'..oPpo.....oPpo...','..obbo.....obbo...','.obbbo.....obbbo..',
'.ooooo.....ooooo..','..................','..................']
};
/* ---------- ЛЁЖА 30×12 (с руками и стволом) ---------- */
const PRONE=[
'..........rrrr..............',
'.........osssso.............',
'........oshhso..............',
'.....oossssssoo.............',
'...oosShhhhSsssooo..........',
'..osSShhhhSSssgggggggggo....',
'..osSSSSSSSSsoGGGGGGGGGo....',
'..oppppppppoo...............',
'.opqppppppppo...............',
'.obbo..obbo.................',
'obbbo..obbbo................',
'ooooo..ooooo................'];

/* ---------- РУКИ+СТВОЛ по направлениям ---------- */
const ARMS={
 F:{w:18,h:9,dx:-2,dy:-3,tip:[17,1],rows:[
'..................',
'..osssso..........',
'.osShhssoo........',
'.osShhhssgggggggo.',
'..osssssGGGGGGGGGo',
'...oooooggggggggo.',
'........kk........',
'..................',
'..................']},
 DU:{w:15,h:15,dx:-2,dy:-12,tip:[13,-11],rows:[
'...........gggo',
'..........gGGGo',
'.........gggGo.',
'........ogggo..',
'.......ossgo...',
'.....osssso....',
'....osShhso....',
'...osShhso.....',
'...osssso......',
'..osssso.......',
'..osso.........',
'..ooo..........',
'...............',
'...............',
'...............']},
 U:{w:9,h:17,dx:-4,dy:-15,tip:[0,-16],rows:[
'..gggo...',
'..gGGGo..',
'..ggggo..',
'..okko...',
'..osgo...',
'..osgo...',
'.ossso...',
'.osSso...',
'.osSso...',
'.ossso...',
'osssso...',
'osSsso...',
'osssso...',
'.oooo....',
'.........',
'.........',
'.........']},
 DD:{w:15,h:15,dx:-2,dy:-2,tip:[13,11],rows:[
'..ooo..........',
'..osso.........',
'..osssso.......',
'...osssso......',
'...osShhso.....',
'....osShhso....',
'.....osssso....',
'.......ossgo...',
'........ogggo..',
'.........gggGo.',
'..........gGGGo',
'...........gggo',
'...............',
'...............',
'...............']},
 D:{w:9,h:17,dx:-4,dy:-2,tip:[0,16],rows:[
'.........',
'.........',
'.........',
'.oooo....',
'osssso...',
'osSsso...',
'osssso...',
'.ossso...',
'.osSso...',
'.osSso...',
'.ossso...',
'..osgo...',
'..osgo...',
'..okko...',
'..ggggo..',
'..gGGGo..',
'..gggo...']}
};
const AIMKEYS=['F','DU','U','DD','D'];

/* ---------- СОЛДАТ-ВРАГ 16×24 ---------- */
const EBASE=[
'.....oooo.......',
'....orrrro......',
'....orrrro......',
'....osssso......',
'....ososo.......',
'.....osso.......',
'....ouuuuo......',
'...ouuuuuuo.....',
'...ouUUUUuo.....',
'...ouuuuuuo.....',
'...ouuuuuuo.....',
'....obbbbo......',
'....ouuuuo......',
'....ouuuuo......'];
const ELEGS={
 s0:['....ouo.ouo.....','....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....',
     '....obo.obo.....','...obbo.obbo....','...obbo.obbo....','..ooooo.ooooo...',
     '................','................'],
 s1:['....ouoouo......','...ouo..ouo.....','..ouo....ouo....','..oUo....oUo....',
     '.obo......obo...','obbo......obbo..','oooo......oooo..','................',
     '................','................'],
 s2:['....ouoouo......','.....ouo.ouo....','....ouo...ouo...','....oUo...oUo...',
     '...obo.....obo..','..obbo.....obbo.','..oooo.....oooo.','................',
     '................','................']
};
const EGUN={
 rifle:['................','................','................','................',
        '................','................','................',
        '...oggggggggo...','...oGGGGGGGGo...','....kk..........'],
 gunner:['................','................','................','................',
        '................','................','...oggggggggggo.',
        '...oGGGGGGGGGGo.','...okkkkggggggo.','....kk..kk......'],
 flamer:['................','................','................','..offo..........',
        '..offo..........','..okko..........','..okko..........',
        '...oggggggo.....','...oGGGGGGo.....','....kk..ff......'],
 sniper:['................','................','................','................',
        '................','................','.....oGGGo......',
        '..ogggggggggggo.','..oGGGGGGGGGGGo.','....kk..........'],
 gren:['................','................','................','................',
       '................','.....ouuuuo.....','....ouUUUUuo....',
       '...oggggggggo...','...oGGGGGGGGo...','....kk..........']
};
/* ---------- прочие враги ---------- */
const BIRD=[
[ '..........oooo........',
  '.....oooouuuuoo.......',
  '..oouuuuuUUUUuuoo.....',
  '.ouuuUUUUUUUUUUuuo....',
  '.ouuUUUUeeeeUUUUuo....',
  '..ouuuUUUUUUUUuuo.....',
  '...oouuuuuuuuoo.......',
  '.....obbo.obbo........',
  '.....okko.okko........',
  '......oo...oo.........'],
[ '.....ooo..............',
  '..oouuuooooo..........',
  '.ouuuUUUUuuuoo........',
  '.ouuUUUUUUUUuuoo......',
  '..ouuUUeeeeUUUUuo.....',
  '...ouuuUUUUUUuuo......',
  '....oouuuuuuoo........',
  '.....obbo.obbo........',
  '.....okko.okko........',
  '......oo...oo.........']];
const TURRET=[
'.....oooooooooo.....',
'....oGGGGGGGGGGo....',
'...oGkkkkkkkkkkGo...',
'...oGkGGGGGGGGkGo...',
'...oGkGooooooGkGo...',
'...oGkGoeeeeoGkGo...',
'...oGkGoeeeeoGkGo...',
'...oGkGooooooGkGo...',
'...oGkGGGGGGGGkGo...',
'...oGkkkkkkkkkkGo...',
'....oGGGGGGGGGGo....',
'.....oooooooooo.....',
'.......ogggo........',
'.......oGGGo........',
'......ogggggo.......',
'.....oGGGGGGGo......',
'....ogggggggggo.....',
'....ooooooooooo.....'];
const CRAWLER=[
[ '....oooooooo....',
  '..oouuuuuuuuoo..',
  '.ouuUUUUUUUUuuo.',
  '.ouUUeeUUeeUUuo.',
  '.ouuUUUUUUUUuuo.',
  '..oouuuuuuuuoo..',
  '.o.o.o....o.o.o.',
  'o.o.o.o..o.o.o.o',
  '.o...o....o...o.',
  '................'],
[ '....oooooooo....',
  '..oouuuuuuuuoo..',
  '.ouuUUUUUUUUuuo.',
  '.ouUUeeUUeeUUuo.',
  '.ouuUUUUUUUUuuo.',
  '..oouuuuuuuuoo..',
  'o.o.o.o..o.o.o.o',
  '.o.o.o....o.o.o.',
  '..o...o..o...o..',
  '................']];
const JUMPER=[
[ '....oooo....',
  '..oouuuuoo..',
  '.ouuUUUUuuo.',
  '.ouUeeeeUuo.',
  '.ouuUUUUuuo.',
  '..oouuuuoo..',
  '...ouuuuo...',
  '..ouo..ouo..',
  '..oUo..oUo..',
  '..obo..obo..',
  '.obbo..obbo.',
  '.oooo..oooo.'],
[ '....oooo....',
  '..oouuuuoo..',
  '.ouuUUUUuuo.',
  '.ouUeeeeUuo.',
  '.ouuUUUUuuo.',
  '..oouuuuoo..',
  '...ouuuuo...',
  '...ouoouo...',
  '...oUooUo...',
  '....obbo....',
  '...obbbbo...',
  '...oooooo...']];
const POD=[
'....oooooooo....',
'..ooGGGGGGGGoo..',
'.oGwwwwwwwwwwGo.',
'oGwwwwwwwwwwwwGo',
'oGwwwkkkkkkwwwGo',
'oGwwwkGGGGkwwwGo',
'oGwwwkGwwGkwwwGo',
'oGwwwkGGGGkwwwGo',
'oGwwwkkkkkkwwwGo',
'oGwwwwwwwwwwwwGo',
'.oGwwwwwwwwwwGo.',
'..ooGGGGGGGGoo..',
'....oooooooo....',
'................'];
const DRONE=[
[ '.......oooo.......',
  '...oooouuuuoooo...',
  '.oouuuuUUUUuuuuoo.',
  'ouuuUUUUUUUUUUuuuo',
  'ouuUUUeeeeeeUUUuuo',
  '.ouuuUUUUUUUUuuuo.',
  '...oouuuuuuuuoo...',
  '......okkkko......',
  '.......oe eo......'.replace(' ','.'),
  '........oo........'],
[ '...ooo........ooo.',
  '.oouuuoooooouuuoo.',
  'ouuuUUUUUUUUUUuuuo',
  'ouuUUUUUUUUUUUUuuo',
  '.ouuUUeeeeeeUUuuo.',
  '..ouuuUUUUUUuuuo..',
  '...oouuuuuuuuoo...',
  '......okkkko......',
  '.......oe eo......'.replace(' ','.'),
  '........oo........']];

/* ---------- рендер строк в канвас ---------- */
function make(rows,w,h,pl){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d');
  for(let y=0;y<h;y++){
    const row=String(rows[y]||'').padEnd(w,'.');
    for(let X=0;X<w;X++){
      const ch=row[X];if(ch==='.'||ch===' ')continue;
      const col=pl[ch];if(!col)continue;
      x.fillStyle=col;x.fillRect(X,y,1,1);
    }
  }
  return c;
}
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flip(c){const f=blank(c.width,c.height),x=f.getContext('2d');
  x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function over(dst,rows,pl,ox,oy){
  const x=dst.getContext('2d');
  for(let y=0;y<rows.length;y++){
    const row=String(rows[y]||'');
    for(let X=0;X<row.length;X++){
      const ch=row[X];if(ch==='.'||ch===' ')continue;
      const col=pl[ch];if(!col)continue;
      x.fillStyle=col;x.fillRect(ox+X,oy+y,1,1);
    }
  }
}

/* ---------- композиция кадра бойца ---------- */
const CW=38,CH=46,BX=10,BY=20;      // тело внутри кадра; ступни на CH
const SHX=BX+9,SHY=BY+10;           // плечо
function compose(bodyRows,legRows,aim,pl,gear){
  const c=blank(CW,CH);
  over(c,bodyRows,pl,BX,BY);
  over(c,legRows,pl,BX,BY+17);
  if(gear)over(c,gear,pl,BX,BY);
  const a=ARMS[aim];
  over(c,a.rows,pl,SHX+a.dx,SHY+a.dy);
  return c;
}
const A={chars:{},foes:{},CW,CH,SHX,SHY};

function buildChar(id){
  const pl=PALS[id],gear=HEADGEAR[id];
  const bodies={idle:TORSO.concat(LEGS.idle)};
  ['run0','run1','run2','run3','jump','fall'].forEach(k=>bodies[k]=TORSO.concat(LEGS[k]));
  const set={};
  Object.keys(bodies).forEach(bk=>{
    set[bk]={};
    AIMKEYS.forEach(ak=>{
      const r=compose(bodies[bk],[],ak,pl,gear);
      set[bk][ak]={r,l:flip(r)};
    });
  });
  const pr=make(PRONE,30,12,pl);
  const prc=blank(CW,20);over(prc,PRONE,pl,4,8);
  set.prone={r:prc,l:flip(prc)};
  A.chars[id]=set;
}
/* ---------- сборка врагов ---------- */
const EVAR=[
 {u:'#478a2c',U:'#2c5e1c',r:'#2c5e1c',b:'#331a04'},
 {u:'#a86c3a',U:'#75451f',r:'#75451f',b:'#331a04'},
 {u:'#2a6fb0',U:'#17416e',r:'#17416e',b:'#1d2536'}
];
function soldier(type,v,frame){
  const pl=pal(Object.assign({},EVAR[v]));
  if(type==='flamer'){pl.u='#c22a22';pl.U='#7d1610';pl.r='#7d1610';}
  if(type==='sniper'){pl.u='#0d5570';pl.U='#071628';pl.r='#1a93b8';}
  if(type==='grenadier'){pl.u='#8f3c06';pl.U='#5a300c';pl.r='#e06a12';}
  const c=blank(20,26);
  over(c,EBASE,pl,2,0);
  over(c,ELEGS['s'+frame],pl,2,14);
  const gun=EGUN[type==='runner'?'rifle':type==='gunner'?'gunner':type==='flamer'?'flamer':
                 type==='sniper'?'sniper':type==='grenadier'?'gren':'rifle'];
  over(c,gun,pl,2,8);
  return c;
}
function buildFoes(){
  const ground=['runner','gunner','flamer','sniper','grenadier','shooter'];
  ground.forEach(t=>{
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
      if(t==='bird'){pl.u='#6a2bb0';pl.U='#3d1668';}
      if(t==='crawler'){pl.u='#6a2bb0';pl.U='#3d1668';}
      if(t==='flyer'){pl.u='#63728a';pl.U='#3d4759';}
      const fr=simple[t].map(rows=>{
        const w=Math.max(...rows.map(r=>r.length)),h=rows.length;
        const c=make(rows,w,h,pl);return {r:c,l:flip(c)};
      });
      A.foes[t].push(fr);
    }
  });
  const tp=pal({G:'#cdd8e6',g:'#63728a',k:'#242c3a',e:'#ff4a3d',o:'#0d1018'});
  const tc=make(TURRET,20,18,tp);
  A.foes.turret=[[{r:tc,l:flip(tc)}],[{r:tc,l:flip(tc)}],[{r:tc,l:flip(tc)}]];
  const pp=pal({G:'#35e0ff',w:'#d4fbff',k:'#0d5570',o:'#0d1018'});
  const pc=make(POD,16,14,pp);
  A.foes.pod=[[{r:pc,l:flip(pc)}],[{r:pc,l:flip(pc)}],[{r:pc,l:flip(pc)}]];
}
function init(){
  Object.keys(PALS).forEach(buildChar);
  buildFoes();
}
/* ---------- API ---------- */
function aimKey(a){
  const x=a.raw?a.raw.x:a.x, y=a.raw?a.raw.y:a.y;
  if(y<0) return x===0?'U':'DU';
  if(y>0) return x===0?'D':'DD';
  return 'F';
}
function player(id,bodyKey,aim,faceLeft){
  const s=A.chars[id];if(!s)return null;
  if(bodyKey==='prone')return faceLeft?s.prone.l:s.prone.r;
  const b=s[bodyKey]||s.idle;const f=b[aim]||b.F;
  return faceLeft?f.l:f.r;
}
function foe(type,v,frame,faceLeft){
  const set=A.foes[type];if(!set)return null;
  const arr=set[(v||0)%3];if(!arr||!arr.length)return null;
  const f=arr[Math.abs(frame|0)%arr.length];
  return faceLeft?f.l:f.r;
}
function tip(aim,faceLeft,sx,sy){
  const a=ARMS[aim]||ARMS.F;
  const tx=a.tip[0]*(faceLeft?-1:1),ty=a.tip[1];
  return {x:sx+tx,y:sy+ty};
}
return {init,player,foe,aimKey,tip,CW,CH,SHX,SHY,AIMKEYS};
})();
if(typeof window!=='undefined')window.GFX=GFX;
