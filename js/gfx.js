/* ============================================================
   GFX v10 — РУЧНОЙ пиксель-арт в стиле Contra.
   Рэмбо-база: бандана, голый торс, синие штаны, крупные ботинки.
   Каждый боец = своя палитра + свой головной убор + своя экипировка.
   Сложная анимация: 4 кадра бега с противофазой рук и ног,
   присед, прыжок, падение, лёжа, 3 стойки прицела.
   ============================================================ */
const GFX=(()=>{
'use strict';
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flipC(c){const f=blank(c.width,c.height),x=f.getContext('2d');
 x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function draw(rows,pl,w,h){
 const c=blank(w,h),x=c.getContext('2d');
 for(let y=0;y<h;y++){const row=String(rows[y]||'').padEnd(w,'.');
  for(let X=0;X<w;X++){const ch=row[X];if(ch==='.'||ch===' ')continue;
   const cc=pl[ch];if(!cc)continue;x.fillStyle=cc;x.fillRect(X,y,1,1);}}
 return c;
}
/* оверлей поверх готового кадра (головные уборы, броня) */
function overlay(dst,rows,pl,ox,oy){
 const x=dst.getContext('2d');
 for(let y=0;y<rows.length;y++){const row=String(rows[y]||'');
  for(let X=0;X<row.length;X++){const ch=row[X];if(ch==='.'||ch===' ')continue;
   const cc=pl[ch];if(!cc)continue;x.fillStyle=cc;x.fillRect(ox+X,oy+y,1,1);}}
}

/* ---------- БАЗА: РЭМБО 18×26 ---------- */
const B_IDLE=[
'......rrrr........',
'.....rrrrrr.......',
'.....rrrrrrr......',
'.....ssssss.......',
'.....shskss.......',
'.....ssssss.......',
'......ssss........',
'.......ss.........',
'.....ssssssss.....',
'....sshhhhhhss....',
'....sShhhhhhsS....',
'....sShhhhhhsS....',
'....sSShhhhSSs....',
'.....yhhhhhy......',
'.....yyyyyy.......',
'.....pppppp.......',
'.....pqqppp.......',
'.....ppp.ppp......',
'.....ppp.ppp......',
'.....pPp.pPp......',
'.....pPp.pPp......',
'.....bbb.bbb......',
'....bbbb.bbbb.....',
'....bBbb.bBbb.....',
'...BBBBB.BBBBB....',
'..................'];
const B_RUN=[
[ '......rrrr........','.....rrrrrr.......','.....rrrrrrr......','.....ssssss.......',
  '.....shskss.......','.....ssssss.......','......ssss........','.......ss.........',
  '.....ssssssss.....','....sshhhhhhss....','....sShhhhhhsS....','....sShhhhhhsS....',
  '....sSShhhhSSs....','.....yhhhhhy......','.....yyyyyy.......','.....pppppp.......',
  '....pqqpppp.......','....ppp.pppp......','...ppp...pppp.....','...pPp....pPp.....',
  '..pPp......pPp....','..bbb......bbb....','.bbbb......bbbb...','.bBbb......bBbb...',
  'BBBBB......BBBBB..','..................'],
[ '......rrrr........','.....rrrrrr.......','.....rrrrrrr......','.....ssssss.......',
  '.....shskss.......','.....ssssss.......','......ssss........','.......ss.........',
  '.....ssssssss.....','....sshhhhhhss....','....sShhhhhhsS....','....sShhhhhhsS....',
  '....sSShhhhSSs....','.....yhhhhhy......','.....yyyyyy.......','.....pppppp.......',
  '.....pqqppp.......','.....pppppp.......','.....ppp.ppp......','.....pPp.pPp......',
  '.....bbb.bbb......','....bbbb.bbbb.....','....bBbb.bBbb.....','...BBBBB.BBBBB....',
  '..................','..................'],
[ '......rrrr........','.....rrrrrr.......','.....rrrrrrr......','.....ssssss.......',
  '.....shskss.......','.....ssssss.......','......ssss........','.......ss.........',
  '.....ssssssss.....','....sshhhhhhss....','....sShhhhhhsS....','....sShhhhhhsS....',
  '....sSShhhhSSs....','.....yhhhhhy......','.....yyyyyy.......','.....pppppp.......',
  '......ppqqpp......','....pppp.pppp.....','...pppp...pppp....','...pPp.....pPp....',
  '..pPp.......pPp...','..bbb.......bbb...','.bbbb.......bbbb..','.bBbb.......bBbb..',
  'BBBBB.......BBBBB.','..................'],
[ '......rrrr........','.....rrrrrr.......','.....rrrrrrr......','.....ssssss.......',
  '.....shskss.......','.....ssssss.......','......ssss........','.......ss.........',
  '.....ssssssss.....','....sshhhhhhss....','....sShhhhhhsS....','....sShhhhhhsS....',
  '....sSShhhhSSs....','.....yhhhhhy......','.....yyyyyy.......','.....pppppp.......',
  '.....pqqppp.......','.....pppppp.......','....ppp..ppp......','....pPp..pPp......',
  '....bbb..bbb......','...bbbb..bbbb.....','...bBbb..bBbb.....','..BBBBB..BBBBB....',
  '..................','..................']];
const B_JUMP=[
'......rrrr........','.....rrrrrr.......','.....rrrrrrr......','.....ssssss.......',
'.....shskss.......','.....ssssss.......','......ssss........','.......ss.........',
'.....ssssssss.....','....sshhhhhhss....','....sShhhhhhsS....','....sShhhhhhsS....',
'....sSShhhhSSs....','.....yhhhhhy......','.....yyyyyy.......','.....pppppp.......',
'....pqqpppp.......','....ppp.ppp.......','...pppp.pppp......','...pPp..pPp.......',
'...bbb..bbb.......','..bbbb..bbbb......','..BBBB..BBBB......','..................',
'..................','..................'];
const B_FALL=[
'......rrrr........','.....rrrrrr.......','.....rrrrrrr......','.....ssssss.......',
'.....shskss.......','.....ssssss.......','......ssss........','.......ss.........',
'.....ssssssss.....','....sshhhhhhss....','....sShhhhhhsS....','....sShhhhhhsS....',
'....sSShhhhSSs....','.....yhhhhhy......','.....yyyyyy.......','.....pppppp.......',
'....ppqppppp......','...ppp..pppp......','...pPp...pPp......','..pPp.....pPp.....',
'..bbb......bbb....','.bbbb......bbbb...','.BBBB......BBBB...','..................',
'..................','..................'];
const B_CROUCH=[
'..................','..................','......rrrr........','.....rrrrrr.......',
'.....ssssss.......','.....shskss.......','.....ssssss.......','......ssss........',
'.....ssssssss.....','....sshhhhhhss....','....sShhhhhhsS....','....sSShhhhSSs....',
'.....yhhhhhy......','.....yyyyyy.......','....pppppppp......','...pppqqppppp.....',
'...ppp...pppp.....','..pPp.....pPp.....','..bbb.....bbb.....','.bbbb.....bbbb....',
'.BBBB.....BBBB....','..................','..................','..................',
'..................','..................'];
const B_PRONE=[
'..................','..................','..................','..................',
'..................','..................','..................','..................',
'..................','..................','..................','..................',
'..................','..................','..........rrrr....','.........rrrrrr...',
'.........ssssss...','.........shskss...','..yyyyyyssssssss..','.pppppppyhhhhhy...',
'pppppppppShhhhhss.','pPp.pPp.sSShhSSss.','bbb.bbb...........','BBBB.BBBB.........',
'..................'];
const B_AIMU=[
'......rrrr....g...','.....rrrrrr...g...','.....rrrrrrr..g...','.....ssssss...g...',
'.....shskss...g...','.....ssssss...G...','......ssss....G...','.......ss....gGg..',
'.....ssssssss.gg..','....sshhhhhhssg...','....sShhhhhhsSs...','....sShhhhhhsS....',
'....sSShhhhSSs....','.....yhhhhhy......','.....yyyyyy.......','.....pppppp.......',
'.....pqqppp.......','.....ppp.ppp......','.....ppp.ppp......','.....pPp.pPp......',
'.....pPp.pPp......','.....bbb.bbb......','....bbbb.bbbb.....','....bBbb.bBbb.....',
'...BBBBB.BBBBB....','..................'];
const B_AIMDU=[
'......rrrr........','.....rrrrrr.......','.....rrrrrrr......','.....ssssss.......',
'.....shskss.......','.....ssssss.......','......ssss........','.......ss.....g...',
'.....ssssssss....g','....sshhhhhhss..gG','....sShhhhhhsS.gG.','....sShhhhhhsSgG..',
'....sSShhhhSSsgg..','.....yhhhhhyg.....','.....yyyyyy.......','.....pppppp.......',
'.....pqqppp.......','.....ppp.ppp......','.....ppp.ppp......','.....pPp.pPp......',
'.....pPp.pPp......','.....bbb.bbb......','....bbbb.bbbb.....','....bBbb.bBbb.....',
'...BBBBB.BBBBB....','..................'];
const B_AIMDD=[
'......rrrr........','.....rrrrrr.......','.....rrrrrrr......','.....ssssss.......',
'.....shskss.......','.....ssssss.......','......ssss........','.......ss.........',
'.....ssssssss.....','....sshhhhhhss....','....sShhhhhhsS.gg.','....sShhhhhhsSgG..',
'....sSShhhhSSsgG..','.....yhhhhhy.g....','.....yyyyyy.......','.....pppppp.......',
'.....pqqppp.......','.....ppp.ppp......','.....ppp.ppp......','.....pPp.pPp......',
'.....pPp.pPp......','.....bbb.bbb......','....bbbb.bbbb.....','....bBbb.bBbb.....',
'...BBBBB.BBBBB....','..................'];

/* ---------- ГОЛОВНЫЕ УБОРЫ / БРОНЯ (оверлеи) ---------- */
const HEAD={
 bandana:null,
 helmet:[ '.....gggggg.......','....gGGGGGGg......','....gkkkkkkg......','....gggggggg......'],
 hood:[   '.....vvvvvv.......','....vVVVVVVv......','....vwwwwwwv......','.....vvvvvv.......'],
 goggles:['.....gggggg.......','....gGGGGGGg......','....gkGGGGkg......','.....gggggg.......']};
const CHEST={
 bare:null,
 plate:[  '.....vvvvvv.......','....vVVVVVVv......','....vVaaVVv.......','....vvvvvvv.......','.....vvvvv........'],
 light:[  '.....vvvvvv.......','....vVvvvVv.......','....vvvavvv.......','.....vvvvv........'],
 exo:[    '....vvvvvvvv......','....vVvvvvVv......','....vvaaavv.......','....vvvvvvvv......','....vVvvvvVv......']};
const BACK={
 none:null,
 pack:[   '...pp.............','...pp.............','...pp.............','...pp.............'],
 tech:[   '...pp.............','...pa.............','...pp.............','...pa.............']};

/* ---------- ПАЛИТРЫ БОЙЦОВ ---------- */
const PALS={
 antony:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',k:'#20140c',
  p:'#2a6fb0',P:'#17416e',q:'#5aa8e0',b:'#5a300c',B:'#331a04',
  r:'#c22a22',y:'#c79a00',g:'#5b6a80',G:'#cdd8e6',v:'#8a5a28',V:'#c08848',a:'#ffd400',w:'#eef4ff'},
 artyom:{o:'#0b0e15',s:'#e0a870',S:'#a87038',h:'#f8c890',k:'#20140c',
  p:'#3d4759',P:'#242c3a',q:'#63728a',b:'#1d2536',B:'#0d1220',
  r:'#ff4a3d',y:'#ffa32a',g:'#4a5568',G:'#93a3ba',v:'#8a2a20',V:'#c24838',a:'#ffa32a',w:'#eef4ff'},
 den:{o:'#0b0e15',s:'#ffd9a8',S:'#d8a068',h:'#fff3d8',k:'#20140c',
  p:'#17416e',P:'#0d2440',q:'#2a6fb0',b:'#2a3448',B:'#141c2c',
  r:'#35e0ff',y:'#35e0ff',g:'#3d4759',G:'#93a3ba',v:'#1a6a78',V:'#35a0b0',a:'#35e0ff',w:'#d4fbff'},
 dimka:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',k:'#20140c',
  p:'#3d1668',P:'#240b40',q:'#6a2bb0',b:'#1d2536',B:'#0d1220',
  r:'#a24bff',y:'#e0c2ff',g:'#0d5570',G:'#35e0ff',v:'#4a4a5e',V:'#7a7a92',a:'#a24bff',w:'#e0c2ff'}};
const GEAR={
 antony:{head:'bandana',chest:'bare',back:'none'},
 artyom:{head:'helmet',chest:'plate',back:'pack'},
 den:{head:'hood',chest:'light',back:'none'},
 dimka:{head:'goggles',chest:'exo',back:'tech'}};

/* ---------- ВРАГИ: 5 пехотинцев с разным оружием ---------- */
const E_RIFLE=[
[ '.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososo.......',
  '.....osso.......','....ouuuuo......','...ouuuuuuo.....','...ouUUUUuo.....','...ouuuuuuo.....',
  '...ouuuuuuo.....','....obbbbo......','....ouuuuo......','....ouuuuo......','....ouo.ouo.....',
  '....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....','....obo.obo.....','...obbo.obbo....',
  '...obbo.obbo....','..ooooo.ooooo...','................','................'],
[ '.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......',
  '.....osso.......','....ouuuuo......','...ouuuuuuo.....','...ouUUUUuo.....','...ouuuuuuo.....',
  '...ouuuuuuo.....','....obbbbo......','....ouuuuo......','...ouuuuuo......','...ouo..ouo.....',
  '..ouo....ouo....','..oUo....oUo....','..oUo....oUo....','.obo......obo...','.obbo....obbo...',
  'obbo......obbo..','oooo......oooo..','................','................'],
[ '.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......',
  '.....osso.......','....ouuuuo......','...ouuuuuuo.....','...ouUUUUuo.....','...ouuuuuuo.....',
  '...ouuuuuuo.....','....obbbbo......','....ouuuuo......','....ouuuuo......','....ouo.ouo.....',
  '....ouo..ouo....','...oUo...oUo....','...oUo....oUo...','..obo.....obo...','..obbo....obbo..',
  '.obbo......obbo.','.oooo......oooo.','................','................']];
const E_GUN=[
'.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......',
'.....osso.......','...ouuuuuuo.....','..ouuuuuuuuo....','..ouUUUUUUuo....','..ouuuuuuuuo....',
'..ouuuuuuuuo....','..ogggggggggo...','..oGGGGGGGGGo...','...okkkkggggo...','....ouuuuo......',
'....ouuuuo......','....ouo.ouo.....','....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....',
'....obo.obo.....','...obbo.obbo....','...obbo.obbo....','..ooooo.ooooo...'];
const E_FLAME=[
'.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......',
'.....osso.......','..ffouuuuuo.....','..ffouuuuuuo....','..ffouUUUUuo....','..ffouuuuuuo....',
'..ffouuuuuuo....','..ffogggggggo...','..ooogGGGGGGo...','...okkkkfffo....','....ouuuuo.fo...',
'....ouuuuo......','....ouo.ouo.....','....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....',
'....obo.obo.....','...obbo.obbo....','...obbo.obbo....','..ooooo.ooooo...'];
const E_SNIPER=[
'.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......',
'.....osso.......','....ouuuuo......','...ouuuuuuo.....','...ouUUUUuo.....','...ouuuuuuo.....',
'...ouuuuuuo.....','....obbbbo......','..oGGGo.........','..ogggggggggggo.','..oGGGGGGGGGGGo.',
'....ouuuuo..kk..','....ouo.ouo.....','....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....',
'....obo.obo.....','...obbo.obbo....','...obbo.obbo....','..ooooo.ooooo...'];
const E_OFFICER=[
'.....oooo.......','....okkkko......','....okkkko......','....osssso......','....ososa.......',
'.....osso.......','....owwwwo......','...owwwwwwo.....','...owWWWWwo.....','...owwwwwwo.....',
'...owwwwwwo.....','....oyyyyo......','....owwwwo..g...','....owwwwo..g...','....owo.owo.....',
'....owo.owo.....','....oWo.oWo.....','....oWo.oWo.....','....obo.obo.....','...obbo.obbo....',
'...obbo.obbo....','..ooooo.ooooo...','................','................'];
const E_BIRD=[
['..........oooo........','.....oooouuuuoo.......','..oouuuuuUUUUuuoo.....','.ouuuUUUUUUUUUUuuo....',
 '.ouuUUUUeeeeUUUUuo....','..ouuuUUUUUUUUuuo.....','...oouuuuuuuuoo.......','.....obbo.obbo........',
 '.....okko.okko........','......oo...oo.........','......................','......................'],
['.....ooo..............','..oouuuooooo..........','.ouuuUUUUuuuoo........','.ouuUUUUUUUUuuoo......',
 '..ouuUUeeeeUUUUuo.....','...ouuuUUUUUUuuo......','....oouuuuuuuuoo......','.....obbo.obbo........',
 '.....okko.okko........','......oo...oo.........','......................','......................']];
const E_TURRET=[
'.....oooooooooo.....','....oGGGGGGGGGGo....','...oGkkkkkkkkkkGo...','...oGkGGGGGGGGkGo...',
'...oGkGooooooGkGo...','...oGkGoeeeeoGkGo...','...oGkGoeeeeoGkGo...','...oGkGooooooGkGo...',
'...oGkGGGGGGGGkGo...','...oGkkkkkkkkkkGo...','....oGGGGGGGGGGo....','.....oooooooooo.....',
'.......ogggo........','.......oGGGo........','......ogggggo.......','.....oGGGGGGGo......',
'....ogggggggggo.....','....ooooooooooo.....','....................','....................'];
const E_CRAWLER=[
['....oooooooo....','..oouuuuuuuuoo..','.ouuUUUUUUUUuuo.','.ouUUeeUUeeUUuo.',
 '.ouuUUUUUUUUuuo.','..oouuuuuuuuoo..','.o.o.o....o.o.o.','o.o.o.o..o.o.o.o',
 '.o...o....o...o.','................'],
['....oooooooo....','..oouuuuuuuuoo..','.ouuUUUUUUUUuuo.','.ouUUeeUUeeUUuo.',
 '.ouuUUUUUUUUuuo.','..oouuuuuuuuoo..','o.o.o.o..o.o.o.o','.o.o.o....o.o.o.',
 '..o...o..o...o..','................']];
const E_POD=[
'....oooooooo....','..ooGGGGGGGGoo..','.oGwwwwwwwwwwGo.','oGwwwwwwwwwwwwGo',
'oGwwwkkkkkkwwwGo','oGwwwkGGGGkwwwGo','oGwwwkGwwGkwwwGo','oGwwwkGGGGkwwwGo',
'oGwwwkkkkkkwwwGo','oGwwwwwwwwwwwwGo','.oGwwwwwwwwwwGo.','..ooGGGGGGGGoo..',
'....oooooooo....','................'];
const E_JUMPER=[
['....oooo....','..oouuuuoo..','.ouuUUUUuuo.','.ouUeeeeUuo.','.ouuUUUUuuo.','..oouuuuoo..',
 '...ouuuuo...','..ouo..ouo..','..oUo..oUo..','..obo..obo..','.obbo..obbo.','.oooo..oooo.',
 '............','............'],
['....oooo....','..oouuuuoo..','.ouuUUUUuuo.','.ouUeeeeUuo.','.ouuUUUUuuo.','..oouuuuoo..',
 '...ouuuuo...','...ouoouo...','...oUooUo...','....obbo....','...obbbbo...','...oooooo...',
 '............','............']];

const EVAR=[
 {u:'#478a2c',U:'#2c5e1c',r:'#2c5e1c',b:'#331a04',s:'#c98a4e',o:'#0b0e15',w:'#eef4ff',y:'#c79a00',k:'#242c3a',g:'#5b6a80',G:'#cdd8e6',f:'#ffb020',e:'#ff4a3d'},
 {u:'#8a5a28',U:'#5a3818',r:'#5a3818',b:'#331a04',s:'#c98a4e',o:'#0b0e15',w:'#eef4ff',y:'#c79a00',k:'#242c3a',g:'#5b6a80',G:'#cdd8e6',f:'#ffb020',e:'#ff4a3d'},
 {u:'#20485a',U:'#0f2838',r:'#0f2838',b:'#1d2536',s:'#c98a4e',o:'#0b0e15',w:'#eef4ff',y:'#c79a00',k:'#242c3a',g:'#5b6a80',G:'#cdd8e6',f:'#ffb020',e:'#ff4a3d'}];

const A={chars:{},foes:{},TIPS:{}};
const POSES=['idle','run0','run1','run2','run3','jump','fall','crouch','prone','aimU','aimDU','aimDD'];
const BASE={idle:B_IDLE,run0:B_RUN[0],run1:B_RUN[1],run2:B_RUN[2],run3:B_RUN[3],
 jump:B_JUMP,fall:B_FALL,crouch:B_CROUCH,prone:B_PRONE,aimU:B_AIMU,aimDU:B_AIMDU,aimDD:B_AIMDD};
/* точка дула для каждой позы (локально в кадре 18×26) */
const TIPS={idle:[16,11],run0:[16,11],run1:[16,11],run2:[16,11],run3:[16,11],
 jump:[16,11],fall:[16,11],crouch:[16,12],prone:[17,21],aimU:[13,1],aimDU:[16,7],aimDD:[15,13]};

function buildChar(id){
 const pl=PALS[id],gr=GEAR[id],set={};
 POSES.forEach(ps=>{
  const c=draw(BASE[ps],pl,18,26);
  if(gr.head&&HEAD[gr.head])overlay(c,HEAD[gr.head],{g:pl.g,G:pl.G,k:pl.k,v:pl.v,V:pl.V,w:pl.w},0,0);
  if(gr.chest&&CHEST[gr.chest])overlay(c,CHEST[gr.chest],{v:pl.v,V:pl.V,a:pl.a},0,8);
  if(gr.back&&BACK[gr.back])overlay(c,BACK[gr.back],{p:pl.P,a:pl.a},0,9);
  set[ps]={r:c,l:flipC(c)};
 });
 A.chars[id]=set;
}
function buildFoes(){
 const kinds={runner:E_RIFLE,shooter:E_RIFLE,gunner:E_GUN,flamer:E_FLAME,sniper:E_SNIPER,
  grenadier:E_OFFICER,bunker:E_TURRET,turret:E_TURRET};
 Object.keys(kinds).forEach(t=>{
  A.foes[t]=[];
  for(let v=0;v<3;v++){
   const pl=Object.assign({},EVAR[v]);
   if(t==='flamer'){pl.u='#8a2a20';pl.U='#4a120c';pl.r='#4a120c';}
   if(t==='sniper'){pl.u='#0d5570';pl.U='#071628';pl.r='#1a93b8';}
   if(t==='gunner'){pl.u='#4a4a5e';pl.U='#2a2a3a';pl.r='#2a2a3a';}
   if(t==='grenadier'){pl.u='#5a3818';pl.U:'#3a2410';pl.r='#3a2410';pl.w:'#8a5a28';}
   const frames=kinds[t].map(rows=>{const c=draw(rows,pl,18,24);return {r:c,l:flipC(c)};});
   A.foes[t].push(frames);
  }});
 const simple={bird:E_BIRD,crawler:E_CRAWLER,jumper:E_JUMPER,flyer:E_BIRD,pod:E_POD};
 Object.keys(simple).forEach(t=>{
  A.foes[t]=[];
  for(let v=0;v<3;v++){
   const pl=Object.assign({},EVAR[v]);
   if(t==='bird'||t==='crawler'){pl.u='#5a2a6a';pl.U='#3a1648';}
   if(t==='flyer'){pl.u='#63728a';pl.U='#3d4759';}
   if(t==='pod'){pl.G='#35e0ff';pl.w='#d4fbff';pl.k='#0d5570';}
   A.foes[t].push(simple[t].map(rows=>{
    const w=Math.max.apply(null,rows.map(r=>r.length));
    const c=draw(rows,pl,w,rows.length);return {r:c,l:flipC(c)};}));
  }});
}
let ready=false;
function init(){
 if(ready)return;
 try{Object.keys(PALS).forEach(buildChar);buildFoes();A.TIPS=TIPS;ready=true;}
 catch(e){console.error('GFX',e);}
}
function poseOf(p){
 if(p.prone)return 'prone';
 if(!p.onGround)return p.vy<0?'jump':'fall';
 if(p.crouch)return 'crouch';
 if(p.moving)return 'run'+((p.anim|0)%4);
 const ak=p.aimKey||'F';
 if(ak==='U')return 'aimU';
 if(ak==='DU')return 'aimDU';
 if(ak==='DD')return 'aimDD';
 return (p.breath|0)%2?'idle':'idle';
}
function player(id,pose,left){
 const s=A.chars[id];if(!s)return null;
 const f=s[pose]||s.idle;
 return left?f.l:f.r;
}
function foe(type,v,frame,left){
 const set=A.foes[type];if(!set)return null;
 if(v===undefined)return set;
 const arr=set[(v|0)%3];if(!arr||!arr.length)return null;
 if(frame===undefined)return arr;
 const f=arr[((frame|0)%arr.length+arr.length)%arr.length];
 return f?(left?f.l:f.r):null;
}
function tip(pose,left,sx,sy){
 const t=TIPS[pose]||TIPS.idle;
 return {x:sx+(left?-(t[0]-9):t[0]-9),y:sy+(t[1]-13)};
}
function aimKey(a){
 if(!a)return 'F';
 const x=a.raw?a.raw.x:a.x,y=a.raw?a.raw.y:a.y;
 if(y<0)return x===0?'U':'DU';
 if(y>0)return x===0?'D':'DD';
 return 'F';
}
return {init,player,foe,tip,aimKey,poseOf,POSES,TIPS,get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
