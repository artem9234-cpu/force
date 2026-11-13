/* ============================================================
   DATA v9 — оружие с реальной разницей урона/поведения,
   14 типов врагов, осмысленные карты: каждая платформа ведёт
   к награде, секрету или короткому пути. Движущиеся платформы,
   канаты, миномётные зоны, бункеры, турели на возвышенностях.
   ============================================================ */
const DATA=(()=>{
const P=Object.assign({},CORE.P,{
  cg1:'#7ce85a',cg2:'#48c024',cg3:'#2a8010',cg4:'#154a08',
  cw1:'#7ce0ff',cw2:'#28a8f0',cw3:'#1064c0',cw4:'#083a80'});

const CHARS=[
 {id:'antony',name:'ANTONY',role:'КОММАНДОС',hp:4,speed:2.25,jump:7.4,rate:1.0,dmg:1.0,weapon:'machine',
  dbl:true,dash:false,hover:false,spec:'burst',specName:'ШКВАЛ',specDesc:'8 СЕК ТРОЙНАЯ СКОРОСТРЕЛЬНОСТЬ',
  desc:'БАНДАНА, ГОЛЫЙ ТОРС, ПАТРОНТАШ. ДВОЙНОЙ ПРЫЖОК, РОВНЫЕ ПОКАЗАТЕЛИ.',pal:{acc:P.rd2}},
 {id:'artyom',name:'ARTYOM',role:'ШТУРМ-ТАНК',hp:6,speed:1.7,jump:7.0,rate:.82,dmg:1.5,weapon:'fire',
  dbl:false,dash:true,hover:false,spec:'quake',specName:'УДАР ЗЕМЛИ',specDesc:'ВОЛНА ПО ЗЕМЛЕ СНОСИТ ВСЁ РЯДОМ',
  desc:'ШЛЕМ С ЗАБРАЛОМ, БРОНЯ, ПЛАСТИНА. ТАРАН-РЫВОК ПРОБИВАЕТ ВРАГОВ.',pal:{acc:P.or2}},
 {id:'den',name:'DEN',role:'РАЗВЕДЧИК',hp:3,speed:2.8,jump:7.9,rate:1.45,dmg:.85,weapon:'spread',
  dbl:true,dash:true,hover:false,spec:'blink',specName:'БЛИНК',specDesc:'РЫВОК СКВОЗЬ ВРАГОВ С УРОНОМ',
  desc:'КАПЮШОН, ЛЁГКИЙ ЖИЛЕТ. ДВОЙНОЙ ПРЫЖОК И ВОЗДУШНЫЙ РЫВОК.',pal:{acc:P.cy2}},
 {id:'dimka',name:'DIMKA',role:'ТЕХНИК',hp:4,speed:1.95,jump:7.2,rate:1.15,dmg:1.0,weapon:'laser',
  dbl:false,dash:false,hover:true,spec:'drone',specName:'ДРОН',specDesc:'10 СЕК ОРБИТАЛЬНЫЙ ДРОН-ПОМОЩНИК',
  desc:'ВИЗОР, ЭКЗО-РАМКА. ПАРИТ НА УДЕРЖАНИИ ПРЫЖКА, ЛАЗЕР ПРОБИВАЕТ.',pal:{acc:P.pu1}}
];

/* урон/темп/поведение реально различаются */
const WEAPONS={
 rifle:{key:'R',name:'ВИНТОВКА',cd:9,dmg:1.2,spd:8.6,kind:'bullet',col:P.yl2,len:10,pierce:false},
 machine:{key:'M',name:'ПУЛЕМЁТ',cd:4,dmg:.75,spd:9.2,kind:'bullet',col:P.or1,len:11,pierce:false},
 spread:{key:'S',name:'ВЕЕР',cd:13,dmg:.95,spd:7.4,kind:'spread',col:P.rd2,len:6,pierce:false,close:1.7},
 laser:{key:'L',name:'ЛАЗЕР',cd:17,dmg:3.2,spd:12,kind:'laser',col:P.cy2,len:28,pierce:true},
 fire:{key:'F',name:'ОГНЕМЁТ',cd:6,dmg:.55,spd:6.2,kind:'fire',col:P.fl3,len:7,pierce:false,dot:3},
 homing:{key:'H',name:'САМОНАВЕД',cd:14,dmg:1.1,spd:7,kind:'homing',col:P.pu1,len:7,pierce:false}};
const WORDER=['machine','spread','laser','fire','homing'];

const ENEMIES={
 runner:{hp:2,w:12,h:30,spd:1.9,score:100,kind:'ground',ai:'charge',spr:'runner'},
 gunner:{hp:4,w:12,h:30,spd:.9,score:220,kind:'ground',ai:'cover',fire:46,range:340,spr:'gunner'},
 flamer:{hp:5,w:12,h:30,spd:1.05,score:300,kind:'ground',ai:'flame',fire:74,range:175,spr:'flamer'},
 sniper:{hp:3,w:12,h:30,spd:.6,score:300,kind:'ground',ai:'snipe',fire:74,range:460,spr:'sniper'},
 grenadier:{hp:4,w:12,h:30,spd:1.05,score:250,kind:'ground',ai:'lob',fire:58,range:330,spr:'grenadier'},
 shooter:{hp:3,w:12,h:30,spd:.95,score:150,kind:'ground',ai:'shoot',fire:40,range:320,spr:'shooter'},
 rappeller:{hp:3,w:12,h:30,spd:1.1,score:350,kind:'ground',ai:'rappel',fire:44,range:320,spr:'gunner'},
 jumper:{hp:3,w:12,h:20,spd:1.5,score:200,kind:'ground',ai:'hop',spr:'jumper'},
 crawler:{hp:3,w:16,h:10,spd:2.4,score:220,kind:'ground',ai:'charge',spr:'crawler'},
 bird:{hp:2,w:20,h:10,spd:2.4,score:200,kind:'air',ai:'bomb',fire:46,range:340,spr:'bird'},
 flyer:{hp:2,w:18,h:10,spd:2.2,score:200,kind:'air',ai:'fly',fire:56,range:300,spr:'flyer'},
 turret:{hp:7,w:20,h:18,spd:0,score:250,kind:'fixed',ai:'shoot',fire:34,range:340,spr:'turret'},
 bunker:{hp:12,w:26,h:22,spd:0,score:500,kind:'fixed',ai:'shoot',fire:30,range:380,spr:'turret'},
 pod:{hp:1,w:16,h:14,spd:2.6,score:50,kind:'air',ai:'fly',drop:true,spr:'pod'}};

const BOSSES=[
 {id:'dog',name:'КЕНДРИК',sub:'ТЁМНЫЙ ПЁС - ОГНЕННАЯ ПАСТЬ',hp:190,w:120,h:78,score:5000,
  moves:['fireball','tail','charge','leap','howl']},
 {id:'cat',name:'АФИНА',sub:'ЧЁРНАЯ ПАНТЕРА - ЛАЗЕРНЫЕ ГЛАЗА',hp:230,w:128,h:72,score:8000,
  moves:['claw','eyebeam','pounce','volley','stalk']},
 {id:'spider',name:'АРАХНА',sub:'ФИНАЛЬНЫЙ УЖАС',hp:320,w:142,h:92,score:15000,
  moves:['web','legstab','drop','spawn','poison','scurry']}];

const E='....................';
/* M/N — движущиеся платформы, R — канат, Z — миномётная зона,
   K — бункер, B — ящик с оружием, H — аптечка на платформе */
const SEG={
 start:{a:[E,E,E,E,E,E,E,E,E,E,E,E,'..P.................'],g:'####################'},
 flat:{a:[E,E,E,E,E,E,E,'....b...........b...','.......=====........',E,E,E,'..e....u......e.....'],g:'####################'},
 outpost:{a:[E,E,E,E,'..B.............H...','.....========.......','...u............m...',E,
             '......b..........b..',E,E,E,'..e....s......u..e..'],g:'####################'},
 tower:{a:[E,'....H...............','.....======.........','........B...........',
           '.........======.....','....u.............n.',E,'..............=====.',
           '.....m..............',E,E,E,'..e.......s.....e...'],g:'####################'},
 rope:{a:[E,E,'....R.......R.......',E,E,E,'.......=====........',E,
          '...u............m...',E,E,E,'..e....s........e...'],g:'####################'},
 mortar:{a:[E,E,E,E,E,E,E,E,E,E,'....Z.......Z.......',E,E,
           '..e....u........e...'],g:'####################'},
 gap3:{a:[E,E,E,E,E,E,E,E,E,E,E,'..........B.........',E],g:'########...#########'},
 gap5:{a:[E,E,E,E,E,E,E,E,E,'........=====.......',E,'....b...........b...',E],g:'######.....#########'},
 ferry:{a:[E,E,E,E,E,E,E,E,E,E,E,'....M...............',E],g:'######......########'},
 plat:{a:[E,E,'....o..........H..o.','E','.....======.........',E,E,'............=====...',
          '...u....B...m.......',E,E,E,'..e....s........e...'],g:'####################'},
 turretHill:{a:[E,E,E,E,'.......K............',E,'.....b..........b...','..........=====.....',E,E,
          '..u.....t......s....',E,E],g:'####%%%%%%%%%#######'},
 stairs:{a:[E,E,E,E,E,E,'............====....','..m.....H...b.......','........====........',E,
            '...====.............',E,'..e...u....j....s...'],g:'####################'},
 bridge:{a:[E,E,E,E,E,E,'...b............b...','........=====.......',E,E,E,'..e...u.....e...s...'],g:'####BBBBBBBBBBBB####'},
 water:{a:[E,E,E,E,E,E,E,'.......======.......','..b......H......b...',E,E,E,'..e....u........e...'],g:'#####~~~~~~~~~~#####'},
 spikes:{a:[E,E,E,E,E,E,E,E,E,'.......======.......','....m....H.....u....',E,E],g:'######^^^^^^########'},
 flyers:{a:[E,E,'....f.........f.....',E,E,E,'...=====.....=====..','.......b....H.......',E,E,E,
            '..e.....u.......s...'],g:'####################'},
 dense:{a:[E,E,E,E,'..b.....m.....b.....',E,'......=====.........','...u....H....u......',E,E,E,
           '..e..s..j..e..s..j..'],g:'####################'},
 sniperNest:{a:[E,E,E,E,E,'...........n........','..........=====.....','....b..........H....',E,E,E,
            '..e...u.......m.....'],g:'####################'},
 climb:{a:[E,E,E,'....o........H....o.',E,'..............====..',E,'..........====......',
           '...f.........B......',E,'......====..........','..====..............','..e..u....s....j....'],g:'####################'},
 boxes:{a:[E,E,E,E,E,E,E,E,'....B.......B.......','..b.....H.....b.....',E,E,'..e..u..s.....e..m..'],g:'####################'},
 gaunt:{a:[E,E,E,E,E,'.....========.......','..m.....b.....m.....',E,'..=====......=====..',E,E,E,
           '.j..u..g...j...u....'],g:'####################'},
 patrol:{a:[E,E,E,E,'.....b.......b......','.......=====........','..u.....H.....m.....',E,
            '.........f..........',E,E,E,'.e..s..e..u..s..e...'],g:'####################'},
 bunkerLine:{a:[E,E,E,'..K.............K...',E,E,'.....b.......b......',E,
            '...u.....t.....u....',E,E,E,'.e....s.....e....s..'],g:'####%%%%%%%%%%%%%###'},
 arena:{a:[E,E,E,E,E,E,E,E,E,E,E,E,E],g:'##############################'}
};
function build(list,theme,boss,name,sub){
  const rows=[];for(let i=0;i<16;i++)rows.push('');
  const marks=[];
  list.forEach((k,si)=>{
    const s=SEG[k];if(!s)return;const w=s.g.length,ox=rows[0].length;
    for(let r=0;r<13;r++){const src=(s.a&&typeof s.a[r]==='string')?s.a[r]:'';
      rows[r]+=(src+'.'.repeat(w)).slice(0,w);
      for(let c=0;c<w;c++){const ch=src[c]||'.';
        if(ch==='M'||ch==='N'||ch==='R'||ch==='Z'||ch==='K')
          marks.push({ch,x:ox+c,y:r});}}
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
 build(['start','flat','outpost','gap3','tower','rope','turretHill','stairs','ferry','bridge',
        'outpost','spikes','flyers','gap5','dense','mortar','tower','climb','sniperNest','rope',
        'bunkerLine','gaunt','flat','arena'],
       'jungle',0,'ЗОНА 1','ДЖУНГЛИ И БАЗА'),
 build(['start','tower','stairs','gap5','flyers','climb','water','sniperNest','plat','gaunt',
        'rope','ferry','turretHill','bridge','dense','mortar','spikes','climb','boxes','flyers',
        'outpost','tower','arena'],
       'cliff',1,'ЗОНА 2','УТЁСЫ И ВОДОПАД'),
 build(['start','dense','climb','gap3','sniperNest','gaunt','flyers','water','turretHill','plat',
        'rope','mortar','spikes','tower','gap5','climb','dense','bridge','sniperNest','gaunt',
        'flyers','bunkerLine','arena'],
       'lair',2,'ЗОНА 3','ЛОГОВО АРАХНЫ')
];
const THEMES={
 jungle:{sky:[P.bl4,P.bl2],far:P.gr6,far2:P.gr5,mid:P.gr4,mid2:P.gr3,
   rock:P.br2,rockHi:P.br1,rockLo:P.br3,rockOut:P.br5,rockCrack:P.br4,
   grass:P.cg2,grassHi:P.cg1,grassLo:P.cg3,grassTuft:P.cg4,
   plat:P.br3,platTop:P.cg2,platEdge:P.br5,metal:P.mt3,metalHi:P.mt1,metalLo:P.mt5,
   water:P.cw3,water2:P.cw2,water3:P.cw1,foam:P.w,
   fog:null,weather:null,music:'s1',accent:P.gr1},
 cliff:{sky:[P.bl5,P.cy3],far:P.mt5,far2:P.mt4,mid:P.mt4,mid2:P.mt3,
   rock:P.mt3,rockHi:P.mt2,rockLo:P.mt4,rockOut:P.mt5,rockCrack:P.mt4,
   grass:P.cg3,grassHi:P.cg2,grassLo:P.cg4,grassTuft:P.cg4,
   plat:P.mt3,platTop:P.mt1,platEdge:P.mt5,metal:P.mt2,metalHi:P.mt1,metalLo:P.mt4,
   water:P.cw3,water2:P.cw2,water3:P.cw1,foam:P.w,
   fog:'rgba(180,215,240,.07)',weather:'rain',music:'s2',accent:P.cy2},
 lair:{sky:[P.pu5,'#0e0518'],far:'#220d36',far2:'#33125a',mid:P.pu5,mid2:P.pu4,
   rock:'#4a2068',rockHi:'#6a2bb0',rockLo:'#2e1244',rockOut:'#180a28',rockCrack:'#2e1244',
   grass:P.pu3,grassHi:P.pu2,grassLo:P.pu4,grassTuft:P.pu4,
   plat:P.pu4,platTop:P.pu3,platEdge:P.pu5,metal:P.pu3,metalHi:P.pu2,metalLo:P.pu5,
   water:'#5a1636',water2:P.rd3,water3:P.rd2,foam:P.rd1,
   fog:'rgba(120,40,180,.09)',weather:'ember',music:'s3',accent:P.pu1}};
return {CHARS,WEAPONS,WORDER,ENEMIES,BOSSES,LEVELS,THEMES};
})();
