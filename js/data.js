/* ============================================================
   DATA v17 — бойцы, оружие, 14 врагов, боссы, карты
   ============================================================ */
const DATA=(()=>{
const P=Object.assign({},CORE.P,{});
const CHARS=[
 {id:'antony',name:'ANTONY',role:'КОММАНДОС',hp:4,speed:2.25,jump:7.4,rate:1.0,dmg:1.0,weapon:'machine',
  dbl:true,dash:false,hover:false,spec:'burst',specName:'ШКВАЛ',specDesc:'8 СЕК ТРОЙНАЯ СКОРОСТРЕЛЬНОСТЬ',
  desc:'БАНДАНА, ГОЛЫЙ ТОРС, ПАТРОНТАШ. ДВОЙНОЙ ПРЫЖОК, РОВНЫЕ ПОКАЗАТЕЛИ.',pal:{acc:P.rd2}},
 {id:'artyom',name:'ARTYOM',role:'ШТУРМ-ТАНК',hp:6,speed:1.7,jump:7.0,rate:.82,dmg:1.5,weapon:'fire',
  dbl:false,dash:true,hover:false,spec:'quake',specName:'УДАР ЗЕМЛИ',specDesc:'ВОЛНА ПО ЗЕМЛЕ СНОСИТ ВСЁ РЯДОМ',
  desc:'КРАСНЫЙ ШЛЕМ, ГРУДНАЯ ПЛАСТИНА, РАНЕЦ. ТАРАН-РЫВОК ПРОБИВАЕТ ВРАГОВ.',pal:{acc:P.or2}},
 {id:'den',name:'DEN',role:'РАЗВЕДЧИК',hp:3,speed:2.8,jump:7.9,rate:1.45,dmg:.85,weapon:'spread',
  dbl:true,dash:true,hover:false,spec:'blink',specName:'БЛИНК',specDesc:'РЫВОК СКВОЗЬ ВРАГОВ С УРОНОМ',
  desc:'БИРЮЗОВЫЙ КАПЮШОН, ЛЁГКИЙ ЖИЛЕТ. ДВОЙНОЙ ПРЫЖОК И ВОЗДУШНЫЙ РЫВОК.',pal:{acc:P.cy2}},
 {id:'dimka',name:'DIMKA',role:'ТЕХНИК',hp:4,speed:1.95,jump:7.2,rate:1.15,dmg:1.0,weapon:'laser',
  dbl:false,dash:false,hover:true,spec:'drone',specName:'ДРОН',specDesc:'10 СЕК ОРБИТАЛЬНЫЙ ДРОН-ПОМОЩНИК',
  desc:'ФИОЛЕТОВЫЙ ВИЗОР, ЭКЗО-РАМКА, РАНЕЦ С ЯЧЕЙКАМИ. ПАРИТ НА ПРЫЖКЕ.',pal:{acc:P.pu1}}];
const WEAPONS={
 rifle:{key:'R',name:'ВИНТОВКА',cd:9,dmg:1.2,spd:8.6,kind:'bullet',col:P.yl2,len:10,pierce:false},
 machine:{key:'M',name:'ПУЛЕМЁТ',cd:4,dmg:.75,spd:9.2,kind:'bullet',col:P.or1,len:11,pierce:false},
 spread:{key:'S',name:'ВЕЕР',cd:13,dmg:.95,spd:7.4,kind:'spread',col:P.rd2,len:6,pierce:false,close:1.7},
 laser:{key:'L',name:'ЛАЗЕР',cd:17,dmg:3.2,spd:12,kind:'laser',col:P.cy2,len:28,pierce:true},
 fire:{key:'F',name:'ОГНЕМЁТ',cd:6,dmg:.55,spd:6.2,kind:'fire',col:P.fl3,len:7,pierce:false,dot:3},
 homing:{key:'H',name:'САМОНАВЕД',cd:14,dmg:1.1,spd:7,kind:'homing',col:P.pu1,len:7,pierce:false}};
const WORDER=['machine','spread','laser','fire','homing'];
const ENEMIES={
 runner:{hp:2,w:12,h:22,spd:1.7,score:100,kind:'ground',ai:'charge',spr:'runner'},
 shooter:{hp:3,w:12,h:22,spd:.8,score:150,kind:'ground',ai:'shoot',fire:52,range:300,spr:'shooter'},
 gunner:{hp:5,w:13,h:22,spd:.7,score:260,kind:'ground',ai:'burst',fire:56,range:340,spr:'gunner'},
 flamer:{hp:5,w:13,h:22,spd:.9,score:300,kind:'ground',ai:'flame',fire:80,range:160,spr:'flamer'},
 sniper:{hp:3,w:12,h:22,spd:.5,score:320,kind:'ground',ai:'snipe',fire:86,range:440,spr:'sniper'},
 grenadier:{hp:4,w:12,h:22,spd:.9,score:260,kind:'ground',ai:'lob',fire:66,range:320,spr:'grenadier'},
 rappeller:{hp:3,w:12,h:22,spd:1.0,score:350,kind:'ground',ai:'burst',fire:44,range:320,spr:'gunner'},
 jumper:{hp:3,w:12,h:18,spd:1.4,score:200,kind:'ground',ai:'hop',spr:'jumper'},
 crawler:{hp:3,w:16,h:12,spd:2.2,score:220,kind:'ground',ai:'charge',spr:'crawler'},
 bird:{hp:2,w:20,h:12,spd:2.2,score:200,kind:'air',ai:'bomb',fire:56,range:340,spr:'bird'},
 flyer:{hp:2,w:20,h:12,spd:2.0,score:200,kind:'air',ai:'fly',fire:64,range:300,spr:'flyer'},
 turret:{hp:7,w:20,h:18,spd:0,score:250,kind:'fixed',ai:'shoot',fire:40,range:340,spr:'turret'},
 bunker:{hp:12,w:20,h:18,spd:0,score:500,kind:'fixed',ai:'shoot',fire:34,range:380,spr:'bunker'},
 pod:{hp:1,w:16,h:14,spd:2.4,score:50,kind:'air',ai:'fly',drop:true,spr:'pod'}};
const BOSSES=[
 {id:'dog',name:'КЕНДРИК',sub:'ТЁМНЫЙ ПЁС - ОГНЕННАЯ ПАСТЬ',hp:190,w:120,h:78,score:5000,moves:['fireball','tail','charge','leap','howl']},
 {id:'cat',name:'АФИНА',sub:'ЧЁРНАЯ ПАНТЕРА - ЛАЗЕРНЫЕ ГЛАЗА',hp:230,w:128,h:72,score:8000,moves:['claw','eyebeam','pounce','volley','stalk']},
 {id:'spider',name:'АРАХНА',sub:'ФИНАЛЬНЫЙ УЖАС',hp:320,w:142,h:92,score:15000,moves:['web','legstab','drop','spawn','poison','scurry']}];
const E='....................';
const SEG={
 start:{a:[E,E,E,E,E,E,E,'..d.............d.',E,E,E,E,'..P.................'],g:'####################'},
 clearing:{a:[E,E,E,E,E,'..d.........d.....','....h.......h.....',E,E,E,E,E,'.....e..............'],g:'####################'},
 outpost:{a:[E,E,E,E,'..B.............H.','.....========.....','...u............m.',E,'......d........d..',E,E,E,'..e....s..........'],g:'####################'},
 hillfort:{a:[E,E,'.......T..........','......%%%.........','..d.............d.',E,'....h.........h...',E,E,E,E,'.....e.......s....'],g:'####################'},
 tower:{a:[E,'....H...............','.....======.........','........B...........','.........======.....','....u.............n.',E,'..d...........d...','.....m..............',E,E,E,'..e.......s.........'],g:'####################'},
 rope:{a:[E,E,'....R...............',E,E,E,'.......=====........',E,'...u................',E,E,E,'..e....s............'],g:'####################'},
 mortar:{a:[E,E,E,E,E,E,E,E,E,E,'....Z...............',E,E,'..e.................'],g:'####################'},
 gap3:{a:[E,E,E,E,E,E,E,E,E,E,E,'..........B.........',E],g:'########...#########'},
 gap5:{a:[E,E,E,E,E,E,E,E,E,'........=====.......',E,'....d...........d...',E],g:'######.....#########'},
 ferry:{a:[E,E,E,E,E,E,E,E,E,E,E,'....M...............',E],g:'######......########'},
 grove:{a:[E,E,'..d...d...d...d.....','..d...d...d...d.....','...h...h...h...h....',E,'.......=====........',E,'....B.............H.',E,E,E,'..e........s........'],g:'####################'},
 plat:{a:[E,E,'....o..........H..o.',E,'.....======.........',E,E,'............=====...','...u....B...m.......',E,E,E,'..e....s............'],g:'####################'},
 bunkerLine:{a:[E,E,'..K...............K.','.%%%.............%%.',E,E,'.....d.......d......',E,'...u.....t.....u....',E,E,E,'.e....s.....e.......'],g:'####%%%%%%%%%%%%%###'},
 stairs:{a:[E,E,E,E,E,E,'............====....','..m.....H...........','........====........',E,'...====.............',E,'..e...u....j........'],g:'####################'},
 bridge:{a:[E,E,E,E,E,E,'...d............d...','........=====.......',E,E,E,'..e...u.....e.......'],g:'####BBBBBBBBBBBB####'},
 water:{a:[E,E,E,E,E,E,E,'.......======.......','..d......H......d...',E,E,E,'..e....u............'],g:'#####~~~~~~~~~~#####'},
 spikes:{a:[E,E,E,E,E,E,E,E,E,'.......======.......','....m....H..........',E,E],g:'######^^^^^^########'},
 flyers:{a:[E,E,'....f...............',E,E,E,'...=====.....=====..','.......d....H.......',E,E,E,'..e.....u...........'],g:'####################'},
 dense:{a:[E,E,E,E,'..d.....m.....d.....',E,'......=====.........','...u....H....u......',E,E,E,'..e..s..j..e........'],g:'####################'},
 sniperNest:{a:[E,E,E,E,E,'...........n........','..........=====.....','....d..........H....',E,E,E,'..e...u.............'],g:'####################'},
 climb:{a:[E,E,E,'....o........H....o.',E,'..............====..',E,'..........====......','...f.........B......',E,'......====..........','..====..............','..e..u....s.........'],g:'####################'},
 boxes:{a:[E,E,E,E,E,E,E,E,'....B.......B.......','..d.....H.....d.....',E,E,'..e..u..s.....e.....'],g:'####################'},
 gaunt:{a:[E,E,E,E,E,'.....========.......','..m.....d.....m.....',E,'..=====......=====..',E,E,E,'.j..u..g...j........'],g:'####################'},
 patrol:{a:[E,E,E,E,'.....d.......d......','.......=====........','..u.....H.....m.....',E,'.........f..........',E,E,E,'.e..s..e..u.........'],g:'####################'},
 arena:{a:[E,E,E,E,E,E,E,E,E,E,E,E,E],g:'##############################'}
};
function build(list,theme,boss,name,sub){
 const rows=[];for(let i=0;i<16;i++)rows.push('');
 const marks=[];
 list.forEach(k=>{const s=SEG[k];if(!s)return;const w=s.g.length,ox=rows[0].length;
  for(let r=0;r<13;r++){const src=(s.a&&typeof s.a[r]==='string')?s.a[r]:'';
   rows[r]+=(src+'.'.repeat(w)).slice(0,w);
   for(let c=0;c<w;c++){const ch=src[c]||'.';
    if(ch==='M'||ch==='N'||ch==='R'||ch==='Z')marks.push({ch,x:ox+c,y:r});}}
  let a='',b='',c='';
  for(const ch of s.g){
   if(ch==='#'){a+='#';b+='#';c+='#';}
   else if(ch==='~'){a+='~';b+='~';c+='~';}
   else if(ch==='^'){a+='^';b+='#';c+='#';}
   else if(ch==='B'){a+='=';b+='~';c+='~';}
   else if(ch==='%'){a+='#';b+='#';c+='#';}
   else{a+='.';b+='.';c+='.';}}
  rows[13]+=a;rows[14]+=b;rows[15]+=c;});
 const w=rows[0].length;
 for(let r=0;r<16;r++)rows[r]=(rows[r]+'.'.repeat(w)).slice(0,w);
 return {rows,w,h:16,theme,boss,name,sub,marks};
}
const LEVELS=[
 build(['start','clearing','outpost','gap3','hillfort','grove','tower','rope','stairs','ferry','bridge','outpost','spikes','flyers','gap5','dense','mortar','hillfort','climb','sniperNest','grove','bunkerLine','gaunt','clearing','arena'],'jungle',0,'ЗОНА 1','ДЖУНГЛИ И БАЗА'),
 build(['start','hillfort','stairs','gap5','flyers','climb','water','sniperNest','plat','gaunt','rope','ferry','hillfort','bridge','dense','mortar','spikes','climb','boxes','flyers','grove','tower','arena'],'cliff',1,'ЗОНА 2','УТЁСЫ И ВОДОПАД'),
 build(['start','dense','climb','gap3','sniperNest','gaunt','flyers','water','hillfort','plat','rope','mortar','spikes','tower','gap5','climb','dense','bridge','sniperNest','gaunt','flyers','bunkerLine','arena'],'lair',2,'ЗОНА 3','ЛОГОВО АРАХНЫ')];
const THEMES={
 jungle:{sky:[P.bl4,P.bl2],far:P.gr6,far2:P.gr5,mid:P.gr4,mid2:P.gr3,rock:P.br2,rockHi:P.br1,rockLo:P.br3,rockOut:P.br5,rockCrack:P.br4,grass:P.cg2,grassHi:P.cg1,grassLo:P.cg3,grassTuft:P.cg4,plat:P.br3,platTop:P.cg2,platEdge:P.br5,metal:P.mt3,metalHi:P.mt1,metalLo:P.mt5,water:P.cw3,water2:P.cw2,water3:P.cw1,foam:P.w,tree:P.gr4,treeHi:P.gr2,treeLo:P.gr5,trunk:P.br4,trunkHi:P.br2,hill:P.gr3,hillHi:P.gr2,hillLo:P.gr4,fog:null,weather:null,music:'s1',accent:P.gr1},
 cliff:{sky:[P.bl5,P.cy3],far:P.mt5,far2:P.mt4,mid:P.mt4,mid2:P.mt3,rock:P.mt3,rockHi:P.mt2,rockLo:P.mt4,rockOut:P.mt5,rockCrack:P.mt4,grass:P.cg3,grassHi:P.cg2,grassLo:P.cg4,grassTuft:P.cg4,plat:P.mt3,platTop:P.mt1,platEdge:P.mt5,metal:P.mt2,metalHi:P.mt1,metalLo:P.mt4,water:P.cw3,water2:P.cw2,water3:P.cw1,foam:P.w,tree:P.mt4,treeHi:P.mt3,treeLo:P.mt5,trunk:P.mt5,trunkHi:P.mt4,hill:P.mt4,hillHi:P.mt3,hillLo:P.mt5,fog:'rgba(180,215,240,.07)',weather:'rain',music:'s2',accent:P.cy2},
 lair:{sky:[P.pu5,'#0e0518'],far:'#220d36',far2:'#33125a',mid:P.pu5,mid2:P.pu4,rock:'#4a2068',rockHi:'#6a2bb0',rockLo:'#2e1244',rockOut:'#180a28',rockCrack:'#2e1244',grass:P.pu3,grassHi:P.pu2,grassLo:P.pu4,grassTuft:P.pu4,plat:P.pu4,platTop:P.pu3,platEdge:P.pu5,metal:P.pu3,metalHi:P.pu2,metalLo:P.pu5,water:'#5a1636',water2:P.rd3,water3:P.rd2,foam:P.rd1,tree:'#3d1668',treeHi:'#6a2bb0',treeLo:'#240b40',trunk:'#240b40',trunkHi:'#3d1668',hill:'#3d1668',hillHi:'#6a2bb0',hillLo:'#240b40',fog:'rgba(120,40,180,.09)',weather:'ember',music:'s3',accent:P.pu1}};
return {CHARS,WEAPONS,WORDER,ENEMIES,BOSSES,LEVELS,THEMES};
})();
/* EOF-DATA-17 */
