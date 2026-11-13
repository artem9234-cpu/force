/* ============================================================
   DATA — хитбоксы под новые спрайты, плотные карты
   ============================================================ */
const DATA=(()=>{
const P=Object.assign({},CORE.P,{
  cg1:'#7ce85a',cg2:'#48c024',cg3:'#2a8010',cg4:'#154a08',
  cw1:'#7ce0ff',cw2:'#28a8f0',cw3:'#1064c0',cw4:'#083a80'});

const CHARS=[
 {id:'antony',name:'ANTONY',role:'КОММАНДОС',hp:4,speed:2.15,jump:7.3,rate:1.0,dmg:1.0,weapon:'machine',
  dbl:true,dash:false,hover:false,spec:'burst',specName:'ШКВАЛ',specDesc:'8 СЕК ТРОЙНАЯ СКОРОСТРЕЛЬНОСТЬ',
  desc:'БАНДАНА, ГОЛЫЙ ТОРС, ПАТРОНТАШ. ДВОЙНОЙ ПРЫЖОК, РОВНЫЕ ПОКАЗАТЕЛИ.',
  pal:{acc:P.rd2}},
 {id:'artyom',name:'ARTYOM',role:'ШТУРМ-ТАНК',hp:6,speed:1.62,jump:6.9,rate:.8,dmg:1.5,weapon:'fire',
  dbl:false,dash:true,hover:false,spec:'quake',specName:'УДАР ЗЕМЛИ',specDesc:'ВОЛНА ПО ЗЕМЛЕ СНОСИТ ВСЁ РЯДОМ',
  desc:'ШЛЕМ С ЗАБРАЛОМ, БРОНЯ, ПЛАСТИНА. ТАРАН-РЫВОК ПРОБИВАЕТ ВРАГОВ.',
  pal:{acc:P.or2}},
 {id:'den',name:'DEN',role:'РАЗВЕДЧИК',hp:3,speed:2.7,jump:7.8,rate:1.45,dmg:.85,weapon:'spread',
  dbl:true,dash:true,hover:false,spec:'blink',specName:'БЛИНК',specDesc:'РЫВОК СКВОЗЬ ВРАГОВ С УРОНОМ',
  desc:'КАПЮШОН, ЛЁГКИЙ ЖИЛЕТ. ДВОЙНОЙ ПРЫЖОК И ВОЗДУШНЫЙ РЫВОК.',
  pal:{acc:P.cy2}},
 {id:'dimka',name:'DIMKA',role:'ТЕХНИК',hp:4,speed:1.9,jump:7.1,rate:1.15,dmg:1.0,weapon:'laser',
  dbl:false,dash:false,hover:true,spec:'drone',specName:'ДРОН',specDesc:'10 СЕК ОРБИТАЛЬНЫЙ ДРОН-ПОМОЩНИК',
  desc:'ВИЗОР, ЭКЗО-РАМКА. ПАРИТ НА УДЕРЖАНИИ ПРЫЖКА, ЛАЗЕР ПРОБИВАЕТ.',
  pal:{acc:P.pu1}}
];

const WEAPONS={
 rifle:{key:'R',name:'ВИНТОВКА',cd:9,dmg:1,spd:8.0,kind:'bullet',col:P.yl2,len:9},
 machine:{key:'M',name:'ПУЛЕМЁТ',cd:4,dmg:.8,spd:8.6,kind:'bullet',col:P.or1,len:10},
 spread:{key:'S',name:'ВЕЕР',cd:12,dmg:1.05,spd:7.2,kind:'spread',col:P.rd2,len:6},
 laser:{key:'L',name:'ЛАЗЕР',cd:15,dmg:2.4,spd:11,kind:'laser',col:P.cy2,len:26},
 fire:{key:'F',name:'ОГНЕМЁТ',cd:13,dmg:1.5,spd:6.4,kind:'fire',col:P.fl3,len:7},
 homing:{key:'H',name:'САМОНАВЕД',cd:13,dmg:1.25,spd:6.8,kind:'homing',col:P.pu1,len:7}};
const WORDER=['machine','spread','laser','fire','homing'];

/* хитбоксы точно под спрайты */
const ENEMIES={
 runner:{hp:2,w:12,h:24,spd:1.8,score:100,kind:'ground',ai:'charge',spr:'runner'},
 gunner:{hp:4,w:12,h:24,spd:.8,score:220,kind:'ground',ai:'burst',fire:52,range:340,spr:'gunner'},
 flamer:{hp:5,w:12,h:24,spd:1.0,score:300,kind:'ground',ai:'flame',fire:80,range:170,spr:'flamer'},
 sniper:{hp:3,w:12,h:24,spd:.6,score:300,kind:'ground',ai:'snipe',fire:80,range:440,spr:'sniper'},
 grenadier:{hp:4,w:12,h:24,spd:1.0,score:250,kind:'ground',ai:'lob',fire:64,range:330,spr:'grenadier'},
 shooter:{hp:3,w:12,h:24,spd:.9,score:150,kind:'ground',ai:'shoot',fire:44,range:320,spr:'shooter'},
 jumper:{hp:3,w:12,h:12,spd:1.4,score:200,kind:'ground',ai:'hop',spr:'jumper'},
 crawler:{hp:3,w:16,h:10,spd:2.3,score:220,kind:'ground',ai:'charge',spr:'crawler'},
 bird:{hp:2,w:20,h:10,spd:2.3,score:200,kind:'air',ai:'bomb',fire:50,range:340,spr:'bird'},
 flyer:{hp:2,w:18,h:10,spd:2.1,score:200,kind:'air',ai:'fly',fire:60,range:300,spr:'flyer'},
 turret:{hp:7,w:20,h:18,spd:0,score:250,kind:'fixed',ai:'shoot',fire:38,range:340,spr:'turret'},
 pod:{hp:1,w:16,h:14,spd:2.5,score:50,kind:'air',ai:'fly',drop:true,spr:'pod'}};

const BOSSES=[
 {id:'dog',name:'КЕНДРИК',sub:'БУРЫЙ ПЁС - ОГНЕННАЯ ПАСТЬ',hp:170,w:116,h:72,score:5000,
  moves:['fireball','tail','charge','leap']},
 {id:'cat',name:'АФИНА',sub:'КОШКА - ЛАЗЕРНЫЕ ГЛАЗА',hp:215,w:124,h:68,score:8000,
  moves:['claw','eyebeam','pounce','volley']},
 {id:'spider',name:'АРАХНА',sub:'ФИНАЛЬНЫЙ УЖАС',hp:300,w:138,h:86,score:15000,
  moves:['web','legstab','drop','spawn','poison']}];

const E='....................';
const SEG={
 start:{a:[E,E,E,E,E,E,E,E,E,E,E,E,'..P.................'],g:'####################'},
 flat:{a:[E,E,E,E,E,E,E,'....b...........b...','.......=====........',E,E,E,'..e....u......e.....'],g:'####################'},
 duo:{a:[E,E,E,E,E,'.........m..........','.......=====........',E,'....b..........b....',E,E,E,'..s..e......u...e...'],g:'####################'},
 gap3:{a:[E,E,E,E,E,E,E,E,E,E,E,'..........B.........',E],g:'########...#########'},
 gap5:{a:[E,E,E,E,E,E,E,E,E,'........=====.......',E,'....b...........b...',E],g:'######.....#########'},
 plat:{a:[E,E,'....o.............o.',E,'.....======.........',E,E,'............=====...','...u........m.......',E,E,E,'..e....s........e...'],g:'####################'},
 turret:{a:[E,E,E,E,E,E,'.....b..........b...','..........=====.....',E,E,'..u.....t......s....',E,E],g:'####################'},
 stairs:{a:[E,E,E,E,E,E,'............====....','..m.........b.......','........====........',E,'...====.............',E,'..e...u....j....s...'],g:'####################'},
 bridge:{a:[E,E,E,E,E,E,'...b............b...','........=====.......',E,E,E,'..e...u.....e...s...'],g:'####BBBBBBBBBBBB####'},
 water:{a:[E,E,E,E,E,E,E,'.......======.......','..b.............b...',E,E,E,'..e....u........e...'],g:'#####~~~~~~~~~~#####'},
 spikes:{a:[E,E,E,E,E,E,E,E,E,'.......======.......','....m..........u....',E,E],g:'######^^^^^^########'},
 flyers:{a:[E,E,'....f.........f.....',E,E,E,'...=====.....=====..','.......b............',E,E,E,'..e.....u.......s...'],g:'####################'},
 dense:{a:[E,E,E,E,'..b.....m.....b.....',E,'......=====.........','...u.........u......',E,E,E,'..e..s..j..e..s..j..'],g:'####################'},
 sniper:{a:[E,E,E,E,E,E,'...........n........','..........=====.....','....b...............',E,E,E,'..e...u.......m.....'],g:'####################'},
 climb:{a:[E,E,E,'....o.............o.',E,'..............====..',E,'..........====......','...f................',E,'......====..........','..====..............','..e..u....s....j....'],g:'####################'},
 boxes:{a:[E,E,E,E,E,E,E,E,'....B.......B.......','..b...........b.....',E,E,'..e..u..s.....e..m..'],g:'####################'},
 gaunt:{a:[E,E,E,E,E,'.....========.......','..m.....b.....m.....',E,'..=====......=====..',E,E,E,'.j..u..g...j...u....'],g:'####################'},
 patrol:{a:[E,E,E,E,'.....b.......b......','.......=====........','..u...........m.....',E,'.........f..........',E,E,E,'.e..s..e..u..s..e...'],g:'####################'},
 arena:{a:[E,E,E,E,E,E,E,E,E,E,E,E,E],g:'##############################'}
};
function build(list,theme,boss,name,sub){
  const rows=[];for(let i=0;i<16;i++)rows.push('');
  list.forEach(k=>{const s=SEG[k];if(!s)return;const w=s.g.length;
    for(let r=0;r<13;r++){const src=(s.a&&typeof s.a[r]==='string')?s.a[r]:'';
      rows[r]+=(src+'.'.repeat(w)).slice(0,w);}
    let a='',b='',c='';
    for(const ch of s.g){
      if(ch==='#'){a+='#';b+='#';c+='#';}
      else if(ch==='~'){a+='~';b+='~';c+='~';}
      else if(ch==='^'){a+='^';b+='#';c+='#';}
      else if(ch==='B'){a+='=';b+='~';c+='~';}
      else {a+='.';b+='.';c+='.';}}
    rows[13]+=a;rows[14]+=b;rows[15]+=c;});
  const w=rows[0].length;
  for(let r=0;r<16;r++)rows[r]=(rows[r]+'.'.repeat(w)).slice(0,w);
  return {rows,w,h:16,theme,boss,name,sub};
}
const LEVELS=[
 build(['start','flat','duo','gap3','patrol','plat','turret','stairs','bridge','boxes','duo',
        'spikes','flyers','gap5','dense','turret','climb','sniper','patrol','gaunt','flat','arena'],
       'jungle',0,'ЗОНА 1','ДЖУНГЛИ И БАЗА'),
 build(['start','duo','stairs','gap5','flyers','climb','water','sniper','plat','gaunt','patrol',
        'gap3','turret','bridge','dense','spikes','climb','boxes','flyers','duo','arena'],
       'cliff',1,'ЗОНА 2','УТЁСЫ И ВОДОПАД'),
 build(['start','dense','climb','gap3','sniper','gaunt','flyers','water','turret','plat','patrol',
        'spikes','duo','gap5','climb','dense','bridge','sniper','gaunt','flyers','arena'],
       'lair',2,'ЗОНА 3','ЛОГОВО АРАХНЫ')
];
const THEMES={
 jungle:{sky:[P.bl4,P.bl2],far:P.gr6,far2:P.gr5,mid:P.gr4,mid2:P.gr3,
   rock:P.br2,rockHi:P.br1,rockLo:P.br3,rockOut:P.br5,
   grass:P.cg2,grassHi:P.cg1,grassLo:P.cg3,plat:P.br3,platTop:P.cg2,
   water:P.cw3,water2:P.cw2,water3:P.cw1,fog:null,weather:null,music:'s1',accent:P.gr1},
 cliff:{sky:[P.bl5,P.cy3],far:P.mt5,far2:P.mt4,mid:P.mt4,mid2:P.mt3,
   rock:P.mt3,rockHi:P.mt2,rockLo:P.mt4,rockOut:P.mt5,
   grass:P.cg3,grassHi:P.cg2,grassLo:P.cg4,plat:P.mt3,platTop:P.mt1,
   water:P.cw3,water2:P.cw2,water3:P.cw1,fog:'rgba(180,215,240,.08)',weather:'rain',music:'s2',accent:P.cy2},
 lair:{sky:[P.pu5,'#0e0518'],far:'#220d36',far2:'#33125a',mid:P.pu5,mid2:P.pu4,
   rock:'#4a2068',rockHi:'#6a2bb0',rockLo:'#2e1244',rockOut:'#180a28',
   grass:P.pu3,grassHi:P.pu2,grassLo:P.pu4,plat:P.pu4,platTop:P.pu3,
   water:'#5a1636',water2:P.rd3,water3:P.rd2,fog:'rgba(120,40,180,.10)',weather:'ember',music:'s3',accent:P.pu1}
};
return {CHARS,WEAPONS,WORDER,ENEMIES,BOSSES,LEVELS,THEMES};
})();
