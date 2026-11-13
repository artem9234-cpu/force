/* ============================================================
   GFX v13 — Рэмбо 18×30: длинные ноги, читаемый скелет,
   оружие в руках во всех позах. Совместимость со старым API.
   ============================================================ */
const GFX=(()=>{
'use strict';
const CW=34,CH=44;
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function flipC(c){const f=blank(c.width,c.height),x=f.getContext('2d');
 x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function draw(rows,pl,w,h){
 const c=blank(w,h),x=c.getContext('2d');
 for(let y=0;y<h;y++){const row=String(rows[y]||'').padEnd(w,'.');
  for(let X=0;X<w;X++){const ch=row[X];if(ch==='.'||ch===' ')continue;
   const cc=pl[ch];if(!cc)continue;x.fillStyle=cc;x.fillRect(X,y,1,1);}}
 return c;}
function overlay(dst,rows,pl,ox,oy){
 const x=dst.getContext('2d');
 for(let y=0;y<rows.length;y++){const row=String(rows[y]||'');
  for(let X=0;X<row.length;X++){const ch=row[X];if(ch==='.'||ch===' ')continue;
   const cc=pl[ch];if(!cc)continue;x.fillStyle=cc;x.fillRect(ox+X,oy+y,1,1);}}
}
const TORSO=[
'......rrrr........','.....rrrrrr.......','.....rrrrrrr......','.....ssssss.......',
'.....shskss.......','.....ssssss.......','......ssss........','.......ss.........',
'.....ssssssss.....','....sshhhhhhss....','....sShhhhhhsS.gg.','....sShhhhhhsSgggG',
'....sSShhhhSSsgg..','.....SShhhhSS.....','.....yhhhhhy......','.....yyyyyy.......'];
const LEG_IDLE=[
'.....pppppp.......','.....pqqppp.......','.....ppp.ppp......','.....ppp.ppp......',
'.....ppp.ppp......','.....pPp.pPp......','.....pPp.pPp......','.....pPp.pPp......',
'.....bbb.bbb......','....bbbb.bbbb.....','....bbbb.bbbb.....','....bBbb.bBbb.....',
'...BBBBB.BBBBB....','...BBBBB.BBBBB....'];
const LEG_RUN=[
['.....pppppp.......','....pqqpppp.......','....ppp.pppp......','...ppp...pppp.....',
 '...pPp....pPp.....','..pPp......pPp....','..pPp......pPp....','..pPp......pPp....',
 '.bbb........bbb...','.bbbb......bbbb...','.bbbb......bbbb...','bBbb........bBbb..',
 'BBBB........BBBB..','..................'],
['.....pppppp.......','.....pqqppp.......','.....pppppp.......','.....ppp.ppp......',
 '.....pPp.pPp......','.....pPp.pPp......','.....bbb.bbb......','....bbbb.bbbb.....',
 '....bbbb.bbbb.....','...bBbb..bBbb.....','...BBBB..BBBB.....','..................',
 '..................','..................'],
['.....pppppp.......','......ppqqp.......','....pppp.ppp......','...pppp...pPp.....',
 '..pPp.....pPp.....','..pPp......pPp....','..pPp......pPp....','.pPp.......pPp....',
 '.bbb........bbb...','.bbbb......bbbb...','.bbbb......bbbb...','.bBbb......bBbb...',
 '.BBBB......BBBB...','..................'],
['.....pppppp.......','.....pqqppp.......','.....pppppp.......','....ppp..ppp......',
 '....pPp..pPp......','...pPp....pPp.....','...pPp....pPp.....','...bbb....bbb.....',
 '..bbbb....bbbb....','..bbbb....bbbb....','..bBbb....bBbb....','..BBBB....BBBB....',
 '..................','..................']];
const LEG_JUMP=[
'....pppppp.......','....pqqpppp.......','....ppp.ppp.......','...ppp..ppp.......',
'...pPp..pPp.......','..pPp....pPp......','..bbb....bbb......','.bbbb....bbbb.....',
'.BBBB....BBBB.....','..................','..................','..................',
'..................','..................'];
const LEG_FALL=[
'.....pppppp.......','....ppqpppp.......','...ppp...ppp......','..pPp.....pPp.....',
'..pPp......pPp....','.pPp.......pPp....','.bbb........bbb...','.bbbb......bbbb...',
'.BBBB......BBBB...','..................','..................','..................',
'..................','..................'];
const LEG_CROUCH=[
'....pppppppp......','...pppqqppppp.....','...ppp...pppp.....','..pPp.....pPp.....',
'..pPp.....pPp.....','..bbb.....bbb.....','.bbbb.....bbbb....','.BBBB.....BBBB....',
'..................','..................','..................','..................',
'..................','..................'];
function frame(legs){return TORSO.concat(legs);}
const B_CROUCH_BODY=[
'..................','..................','..................','..................',
'......rrrr........','.....rrrrrr.......','.....ssssss.......','.....shskss.......',
'.....ssssss.......','......ssss........','.....ssssssss.....','....sshhhhhhss....',
'....sShhhhhhsS.gg.','....sShhhhhhsSgggG','....sSShhhhSSsgg..','.....yhhhhhy......'];
const B_PRONE=[
'..................','..................','..................','..................',
'..................','..................','..................','..................',
'..................','..................','..................','..................',
'..................','..................','..........rrrr....','.........rrrrrr...',
'.........ssssss...','.........shskss...','..yyyyyyssssssss..','.pppppppyhhhhhy.gg',
'pppppppppShhhhhssGG','pPp.pPp.sSShhSSssg.','bbb.bbb...........','BBBB.BBBB.........',
'..................','..................','..................','..................',
'..................','..................'];
const B_AIMU=TORSO.slice(0,8).concat([
'.....ssssssss.g...','....sshhhhhhssg...','....sShhhhhhsSg...','....sShhhhhhsSg...',
'....sSShhhhSSsg...','.....yhhhhhy.g....','.....yyyyyy..g....'],LEG_IDLE.slice(1));
const B_AIMDU=TORSO.slice(0,8).concat([
'.....ssssssss.....','....sshhhhhhss..g.','....sShhhhhhsS.gG.','....sShhhhhhsSgG..',
'....sSShhhhSSsgg..','.....yhhhhhyg.....','.....yyyyyy.......'],LEG_IDLE.slice(1));
const B_AIMDD=TORSO.slice(0,10).concat([
'....sShhhhhhsS....','....sSShhhhSSs.gg.','.....yhhhhhy.gGg..','.....yyyyyy..gg...',
'.....pppppp.......','.....pqqppp.......','.....ppp.ppp......','.....ppp.ppp......',
'.....pPp.pPp......','.....pPp.pPp......','.....bbb.bbb......','....bbbb.bbbb.....',
'....bBbb.bBbb.....','...BBBBB.BBBBB....']);
const HEAD={bandana:null,
 helmet:['.....gggggg.......','....gGGGGGGg......','....gkkkkkkg......','....gggggggg......'],
 hood:['.....vvvvvv.......','....vVVVVVVv......','....vwwwwwwv......','.....vvvvvv.......'],
 goggles:['.....gggggg.......','....gGGGGGGg......','....gkGGGGkg......','.....gggggg.......']};
const CHEST={bare:null,
 plate:['.....vvvvvv.......','....vVVVVVVv......','....vVaaVVv.......','....vvvvvvv.......'],
 light:['.....vvvvvv.......','....vVvvvVv.......','....vvvavvv.......','.....vvvvv........'],
 exo:['....vvvvvvvv......','....vVvvvvVv......','....vvaaavv.......','....vvvvvvvv......']};
const BACK={none:null,
 pack:['...pp.............','...pp.............','...pp.............','...pp.............'],
 tech:['...pp.............','...pa.............','...pp.............','...pa.............']};
const PALS={
 antony:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',k:'#20140c',p:'#2a6fb0',P:'#17416e',q:'#5aa8e0',b:'#5a300c',B:'#331a04',r:'#c22a22',y:'#c79a00',g:'#5b6a80',G:'#cdd8e6',v:'#8a5a28',V:'#c08848',a:'#ffd400',w:'#eef4ff'},
 artyom:{o:'#0b0e15',s:'#e0a870',S:'#a87038',h:'#f8c890',k:'#20140c',p:'#3d4759',P:'#242c3a',q:'#63728a',b:'#1d2536',B:'#0d1220',r:'#ff4a3d',y:'#ffa32a',g:'#4a5568',G:'#93a3ba',v:'#8a2a20',V:'#c24838',a:'#ffa32a',w:'#eef4ff'},
 den:{o:'#0b0e15',s:'#ffd9a8',S:'#d8a068',h:'#fff3d8',k:'#20140c',p:'#17416e',P:'#0d2440',q:'#2a6fb0',b:'#2a3448',B:'#141c2c',r:'#35e0ff',y:'#35e0ff',g:'#3d4759',G:'#93a3ba',v:'#1a6a78',V:'#35a0b0',a:'#35e0ff',w:'#d4fbff'},
 dimka:{o:'#0b0e15',s:'#f0b878',S:'#c07840',h:'#ffd9a8',k:'#20140c',p:'#3d1668',P:'#240b40',q:'#6a2bb0',b:'#1d2536',B:'#0d1220',r:'#a24bff',y:'#e0c2ff',g:'#0d5570',G:'#35e0ff',v:'#4a4a5e',V:'#7a7a92',a:'#a24bff',w:'#e0c2ff'}};
const GEAR={
 antony:{head:'bandana',chest:'bare',back:'none'},
 artyom:{head:'helmet',chest:'plate',back:'pack'},
 den:{head:'hood',chest:'light',back:'none'},
 dimka:{head:'goggles',chest:'exo',back:'tech'}};
const E_RIFLE=[
['.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......',
 '.....osso.......','....ouuuuo......','...ouuuuuuo.....','...ouUUUUuo.....','...ouuuuuuo.....',
 '...ouuuuuuo.....','....obbbbo......','....ouuuuo......','....ouuuuo......','....ouo.ouo.....',
 '....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....','....obo.obo.....','...obbo.obbo....',
 '...obbo.obbo....','..ooooo.ooooo...','................','................'],
['.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......',
 '.....osso.......','....ouuuuo......','...ouuuuuuo.....','...ouUUUUuo.....','...ouuuuuuo.....',
 '...ouuuuuuo.....','....obbbbo......','....ouuuuo......','...ouuuuuo......','...ouo..ouo.....',
 '..ouo....ouo....','..oUo....oUo....','..oUo....oUo....','.obo......obo...','.obbo....obbo...',
 'obbo......obbo..','oooo......oooo..','................','................'],
['.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......',
 '.....osso.......','....ouuuuo......','...ouuuuuuo.....','...ouUUUUuo.....','...ouuuuuuo.....',
 '...ouuuuuuo.....','....obbbbo......','....ouuuuo......','....ouuuuo......','....ouo.ouo.....',
 '....ouo..ouo....','...oUo...oUo....','...oUo....oUo...','..obo.....obo...','..obbo....obbo..',
 '.obbo......obbo.','.oooo......oooo.','................','................']];
const E_GUN=['.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......','.....osso.......','...ouuuuuuo.....','..ouuuuuuuuo....','..ouUUUUUUuo....','..ouuuuuuuuo....','..ouuuuuuuuo....','..ogggggggggo...','..oGGGGGGGGGo...','...okkkkggggo...','....ouuuuo......','....ouuuuo......','....ouo.ouo.....','....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....','....obo.obo.....','...obbo.obbo....','...obbo.obbo....','..ooooo.ooooo...'];
const E_FLAME=['.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......','.....osso.......','..ffouuuuuo.....','..ffouuuuuuo....','..ffouUUUUuo....','..ffouuuuuuo....','..ffouuuuuuo....','..ffogggggggo...','..ooogGGGGGGo...','...okkkkfffo....','....ouuuuo.fo...','....ouuuuo......','....ouo.ouo.....','....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....','....obo.obo.....','...obbo.obbo....','...obbo.obbo....','..ooooo.ooooo...'];
const E_SNIPER=['.....oooo.......','....orrrro......','....orrrro......','....osssso......','....ososa.......','.....osso.......','....ouuuuo......','...ouuuuuuo.....','...ouUUUUuo.....','...ouuuuuuo.....','...ouuuuuuo.....','....obbbbo......','..oGGGo.........','..ogggggggggggo.','..oGGGGGGGGGGGo.','....ouuuuo..kk..','....ouo.ouo.....','....ouo.ouo.....','....oUo.oUo.....','....oUo.oUo.....','....obo.obo.....','...obbo.obbo....','...obbo.obbo....','..ooooo.ooooo...'];
const E_OFFICER=['.....oooo.......','....okkkko......','....okkkko......','....osssso......','....ososa.......','.....osso.......','....owwwwo......','...owwwwwwo.....','...owWWWWwo.....','...owwwwwwo.....','...owwwwwwo.....','....oyyyyo......','....owwwwo..g...','....owwwwo..g...','....owo.owo.....','....owo.owo.....','....oWo.oWo.....','....oWo.oWo.....','....obo.obo.....','...obbo.obbo....','...obbo.obbo....','..ooooo.ooooo...','................','................'];
const E_BIRD=[
['..........oooo........','.....oooouuuuoo.......','..oouuuuuUUUUuuoo.....','.ouuuUUUUUUUUUUuuo....','.ouuUUUUeeeeUUUUuo....','..ouuuUUUUUUUUuuo.....','...oouuuuuuuuoo.......','.....obbo.obbo........','.....okko.okko........','......oo...oo.........'],
['.....ooo..............','..oouuuooooo..........','.ouuuUUUUuuuoo........','.ouuUUUUUUUUuuoo......','..ouuUUeeeeUUUUuo.....','...ouuuUUUUUUuuo......','....oouuuuuuuuoo......','.....obbo.obbo........','.....okko.okko........','......oo...oo.........']];
const E_TURRET=['.....oooooooooo.....','....oGGGGGGGGGGo....','...oGkkkkkkkkkkGo...','...oGkGGGGGGGGkGo...','...oGkGooooooGkGo...','...oGkGoeeeeoGkGo...','...oGkGoeeeeoGkGo...','...oGkGooooooGkGo...','...oGkGGGGGGGGkGo...','...oGkkkkkkkkkkGo...','....oGGGGGGGGGGo....','.....oooooooooo.....','.......ogggo........','.......oGGGo........','......ogggggo.......','.....oGGGGGGGo......','....ogggggggggo.....','....ooooooooooo.....'];
const E_CRAWLER=[
['....oooooooo....','..oouuuuuuuuoo..','.ouuUUUUUUUUuuo.','.ouUUeeUUeeUUuo.','.ouuUUUUUUUUuuo.','..oouuuuuuuuoo..','.o.o.o....o.o.o.','o.o.o.o..o.o.o.o','.o...o....o...o.','................'],
['....oooooooo....','..oouuuuuuuuoo..','.ouuUUUUUUUUuuo.','.ouUUeeUUeeUUuo.','.ouuUUUUUUUUuuo.','..oouuuuuuuuoo..','o.o.o.o..o.o.o.o','.o.o.o....o.o.o.','..o...o..o...o..','................']];
const E_POD=['....oooooooo....','..ooGGGGGGGGoo..','.oGwwwwwwwwwwGo.','oGwwwwwwwwwwwwGo','oGwwwkkkkkkwwwGo','oGwwwkGGGGkwwwGo','oGwwwkGwwGkwwwGo','oGwwwkGGGGkwwwGo','oGwwwkkkkkkwwwGo','oGwwwwwwwwwwwwGo','.oGwwwwwwwwwwGo.','..ooGGGGGGGGoo..','....oooooooo....'];
const E_JUMPER=[
['....oooo....','..oouuuuoo..','.ouuUUUUuuo.','.ouUeeeeUuo.','.ouuUUUUuuo.','..oouuuuoo..','...ouuuuo...','..ouo..ouo..','..oUo..oUo..','..obo..obo..','.obbo..obbo.','.oooo..oooo.'],
['....oooo....','..oouuuuoo..','.ouuUUUUuuo.','.ouUeeeeUuo.','.ouuUUUUuuo.','..oouuuuoo..','...ouuuuo...','...ouoouo...','...oUooUo...','....obbo....','...obbbbo...','...oooooo...']];
const EVAR=[
 {u:'#478a2c',U:'#2c5e1c',r:'#2c5e1c',b:'#331a04',s:'#c98a4e',o:'#0b0e15',w:'#eef4ff',y:'#c79a00',k:'#242c3a',g:'#5b6a80',G:'#cdd8e6',f:'#ffb020',e:'#ff4a3d'},
 {u:'#8a5a28',U:'#5a3818',r:'#5a3818',b:'#331a04',s:'#c98a4e',o:'#0b0e15',w:'#eef4ff',y:'#c79a00',k:'#242c3a',g:'#5b6a80',G:'#cdd8e6',f:'#ffb020',e:'#ff4a3d'},
 {u:'#20485a',U:'#0f2838',r:'#0f2838',b:'#1d2536',s:'#c98a4e',o:'#0b0e15',w:'#eef4ff',y:'#c79a00',k:'#242c3a',g:'#5b6a80',G:'#cdd8e6',f:'#ffb020',e:'#ff4a3d'}];
const A={chars:{},foes:{},TIPS:{}};
const POSES=['idle','run0','run1','run2','run3','jump','fall','crouch','prone','aimU','aimDU','aimDD'];
const BASE={idle:frame(LEG_IDLE),run0:frame(LEG_RUN[0]),run1:frame(LEG_RUN[1]),
 run2:frame(LEG_RUN[2]),run3:frame(LEG_RUN[3]),jump:frame(LEG_JUMP),fall:frame(LEG_FALL),
 crouch:B_CROUCH_BODY.concat(LEG_CROUCH),prone:B_PRONE,aimU:B_AIMU,aimDU:B_AIMDU,aimDD:B_AIMDD};
const TIPS={idle:[17,11],run0:[17,11],run1:[17,11],run2:[17,11],run3:[17,11],
 jump:[17,11],fall:[17,11],crouch:[17,13],prone:[17,20],aimU:[13,0],aimDU:[16,8],aimDD:[15,12]};
function buildChar(id){
 const pl=PALS[id],gr=GEAR[id],set={};
 POSES.forEach(ps=>{
  const c=draw(BASE[ps],pl,18,30);
  if(gr.head&&HEAD[gr.head])overlay(c,HEAD[gr.head],{g:pl.g,G:pl.G,k:pl.k,v:pl.v,V:pl.V,w:pl.w},0,0);
  if(gr.chest&&CHEST[gr.chest])overlay(c,CHEST[gr.chest],{v:pl.v,V:pl.V,a:pl.a},0,8);
  if(gr.back&&BACK[gr.back])overlay(c,BACK[gr.back],{p:pl.P,a:pl.a},0,9);
  set[ps]={r:c,l:flipC(c)};
 });
 A.chars[id]=set;
}
function framesFrom(list,pl,w){
 return list.map(rows=>{const c=draw(rows,pl,w,rows.length);return {r:c,l:flipC(c)};});
}
function buildFoes(){
 const multi={runner:E_RIFLE,shooter:E_RIFLE};
 const single={gunner:E_GUN,flamer:E_FLAME,sniper:E_SNIPER,grenadier:E_OFFICER,turret:E_TURRET,bunker:E_TURRET};
 Object.keys(multi).forEach(t=>{A.foes[t]=[];
  for(let v=0;v<3;v++)A.foes[t].push(framesFrom(multi[t],Object.assign({},EVAR[v]),18));});
 Object.keys(single).forEach(t=>{A.foes[t]=[];
  for(let v=0;v<3;v++){
   const pl=Object.assign({},EVAR[v]);
   if(t==='flamer'){pl.u='#8a2a20';pl.U='#4a120c';pl.r='#4a120c';}
   if(t==='sniper'){pl.u='#0d5570';pl.U='#071628';pl.r:'#1a93b8';}
   if(t==='gunner'){pl.u='#4a4a5e';pl.U='#2a2a3a';pl.r='#2a2a3a';}
   if(t==='grenadier'){pl.u='#5a3818';pl.U='#3a2410';pl.r='#3a2410';pl.w='#8a5a28';}
   A.foes[t].push(framesFrom([single[t]],pl,18));}});
 const simple={bird:E_BIRD,crawler:E_CRAWLER,jumper:E_JUMPER,flyer:E_BIRD,pod:[E_POD]};
 Object.keys(simple).forEach(t=>{A.foes[t]=[];
  for(let v=0;v<3;v++){
   const pl=Object.assign({},EVAR[v]);
   if(t==='bird'||t==='crawler'){pl.u='#5a2a6a';pl.U='#3a1648';}
   if(t==='flyer'){pl.u='#63728a';pl.U='#3d4759';}
   if(t==='pod'){pl.G='#35e0ff';pl.w='#d4fbff';pl.k='#0d5570';}
   A.foes[t].push(framesFrom(simple[t],pl,24));}});
}
let ready=false;
function init(){
 if(ready)return;
 Object.keys(PALS).forEach(buildChar);
 buildFoes();A.TIPS=TIPS;ready=true;
}
function poseOf(p){
 if(p.prone)return 'prone';
 if(!p.onGround)return p.vy<0?'jump':'fall';
 if(p.crouch)return 'crouch';
 if(p.moving)return 'run'+((p.anim|0)%4);
 const ak=p.aimKey||'F';
 if(ak==='U')return 'aimU';if(ak==='DU')return 'aimDU';if(ak==='DD')return 'aimDD';
 return 'idle';
}
function player(id,pose,left){
 const s=A.chars[id];if(!s)return null;
 const f=s[pose]||s.idle;
 return left?f.l:f.r;
}
function bodySprite(id,body,fr,left){
 let pose=body;
 if(body==='run'||body==='run0')pose='run'+(((fr|0)%4+4)%4);
 return player(id,pose,left);
}
function char(id){
 const s=A.chars[id];if(!s)return null;
 return {fr:{idle:[s.idle.r],run:[s.run0.r,s.run1.r,s.run2.r,s.run3.r],
  jump:[s.jump.r],fall:[s.fall.r],prone:s.prone.r},ar:[]};
}
function armDraw(x,sx,sy,ak,pal,recoil,weapon){
 const o={F:[10,0],DU:[8,-8],U:[1,-11],DD:[8,8],D:[1,11]}[ak]||[10,0];
 const hx=sx+o[0],hy=sy+o[1];
 x.strokeStyle=(pal&&pal.out)||'#0b0e15';x.lineWidth=4;x.lineCap='round';
 x.beginPath();x.moveTo(sx,sy);x.lineTo(hx,hy);x.stroke();
 x.strokeStyle=(pal&&pal.skin)||'#f0b878';x.lineWidth=2.5;
 x.beginPath();x.moveTo(sx,sy);x.lineTo(hx,hy);x.stroke();
 const L=Math.hypot(o[0],o[1])||1,ux=o[0]/L,uy=o[1]/L,r=recoil>0?recoil*.6:0;
 const gx=hx-ux*r,gy=hy-uy*r;
 x.strokeStyle=(pal&&pal.out)||'#0b0e15';x.lineWidth=4;
 x.beginPath();x.moveTo(gx-ux*3,gy-uy*3);x.lineTo(gx+ux*12,gy+uy*12);x.stroke();
 x.strokeStyle=(pal&&pal.gun)||'#5b6a80';x.lineWidth=2.4;
 x.beginPath();x.moveTo(gx-ux*3,gy-uy*3);x.lineTo(gx+ux*12,gy+uy*12);x.stroke();
 return {x:gx+ux*14,y:gy+uy*14};
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
 return {x:sx+(left?-(t[0]-9):(t[0]-9)),y:sy+(t[1]-15)};
}
function aimKey(a){
 if(!a)return 'F';
 const x=a.raw?a.raw.x:a.x,y=a.raw?a.raw.y:a.y;
 if(y<0)return x===0?'U':'DU';
 if(y>0)return x===0?'D':'DD';
 return 'F';
}
function dirIndex(){return 0;}
return {init,player,bodySprite,char,armDraw,foe,tip,aimKey,poseOf,dirIndex,
 POSES,TIPS,CW,CH,get ready(){return ready;}};
})();
if(typeof window!=='undefined')window.GFX=GFX;
/* EOF-GFX-13 */
