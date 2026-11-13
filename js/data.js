/* ============================================================
   DATA — бойцы, оружие, враги, боссы, карты из сегментов
   Самодостаточная палитра: работает с любой версией core.js
   ============================================================ */
const DATA = (() => {
const P = Object.assign({}, CORE.P, {
  cg1:'#7ce85a', cg2:'#48c024', cg3:'#2a8010', cg4:'#154a08',
  cw1:'#7ce0ff', cw2:'#28a8f0', cw3:'#1064c0', cw4:'#083a80'
});

const CHARS = [
  { id:'antony', name:'ANTONY', role:'КОММАНДОС',
    hp:4, speed:2.0, jump:6.4, rate:1.0, dmg:1.0, weapon:'machine',
    dbl:true, dash:false, hover:false,
    spec:'burst', specName:'ШКВАЛ', specDesc:'8 СЕК ТРОЙНАЯ СКОРОСТРЕЛЬНОСТЬ',
    desc:'БАНДАНА, ГОЛЫЙ ТОРС, ПАТРОНТАШ. ДВОЙНОЙ ПРЫЖОК, РОВНЫЕ ПОКАЗАТЕЛИ.',
    pal:{skin:P.sk2,skinHi:P.sk1,skinLo:P.sk3,pants:P.bl3,pantsHi:P.bl2,pantsLo:P.bl4,
         vest:P.br3,vestHi:P.br2,vestLo:P.br4,helm:P.rd2,helmHi:P.rd1,helmLo:P.rd3,
         boot:P.br4,bootHi:P.br3,gun:P.mt3,gunHi:P.mt1,acc:P.rd2},
    gear:{head:'bandana',chest:'bare',vest:'bandolier',shoulder:'none',pack:'none',
          arms:'bare',legs:'cargo',boots:'combat'} },
  { id:'artyom', name:'ARTYOM', role:'ШТУРМ-ТАНК',
    hp:6, speed:1.5, jump:6.0, rate:.78, dmg:1.5, weapon:'fire',
    dbl:false, dash:true, hover:false,
    spec:'quake', specName:'УДАР ЗЕМЛИ', specDesc:'ВОЛНА ПО ЗЕМЛЕ СНОСИТ ВСЁ РЯДОМ',
    desc:'ШЛЕМ С ЗАБРАЛОМ, НАПЛЕЧНИКИ, ПЛАСТИНА. ТАРАН-РЫВОК ПРОБИВАЕТ ВРАГОВ.',
    pal:{skin:P.sk2,skinHi:P.sk1,skinLo:P.sk3,pants:P.mt4,pantsHi:P.mt3,pantsLo:P.mt5,
         vest:P.rd3,vestHi:P.rd2,vestLo:P.rd4,helm:P.rd3,helmHi:P.rd2,helmLo:P.rd4,
         boot:P.d2,bootHi:P.d3,gun:P.mt2,gunHi:P.mt1,acc:P.or2},
    gear:{head:'helmet',chest:'plate',vest:'plate',shoulder:'pauldron',pack:'heavy',
          arms:'gauntlet',legs:'armored',boots:'heavy'} },
  { id:'den', name:'DEN', role:'РАЗВЕДЧИК',
    hp:3, speed:2.55, jump:6.9, rate:1.4, dmg:.82, weapon:'spread',
    dbl:true, dash:true, hover:false,
    spec:'blink', specName:'БЛИНК', specDesc:'РЫВОК СКВОЗЬ ВРАГОВ С УРОНОМ',
    desc:'КАПЮШОН, ШАРФ, ЛЁГКИЙ ЖИЛЕТ. ДВОЙНОЙ ПРЫЖОК И ВОЗДУШНЫЙ РЫВОК.',
    pal:{skin:P.sk1,skinHi:P.w,skinLo:P.sk2,pants:P.bl4,pantsHi:P.bl3,pantsLo:P.bl5,
         vest:P.cy4,vestHi:P.cy3,vestLo:P.bl5,helm:P.cy3,helmHi:P.cy2,helmLo:P.cy4,
         boot:P.d3,bootHi:P.g1,gun:P.mt1,gunHi:P.w,acc:P.cy2},
    gear:{head:'hood',chest:'suit',vest:'light',shoulder:'none',pack:'none',
          arms:'glove',legs:'skinny',boots:'light'} },
  { id:'dimka', name:'DIMKA', role:'ТЕХНИК',
    hp:4, speed:1.8, jump:6.2, rate:1.12, dmg:1.0, weapon:'laser',
    dbl:false, dash:false, hover:true,
    spec:'drone', specName:'ДРОН', specDesc:'10 СЕК ОРБИТАЛЬНЫЙ ДРОН-ПОМОЩНИК',
    desc:'ВИЗОР, АНТЕННА, ЭКЗО-РАМКА. ПАРИТ НА УДЕРЖАНИИ ПРЫЖКА, ЛАЗЕР ПРОБИВАЕТ.',
    pal:{skin:P.sk2,skinHi:P.sk1,skinLo:P.sk3,pants:P.pu4,pantsHi:P.pu3,pantsLo:P.pu5,
         vest:P.mt3,vestHi:P.mt2,vestLo:P.mt4,helm:P.pu3,helmHi:P.pu2,helmLo:P.pu4,
         boot:P.d2,bootHi:P.d3,gun:P.cy4,gunHi:P.cy2,acc:P.pu1},
    gear:{head:'goggles',chest:'suit',vest:'exo',shoulder:'plate',pack:'tech',
          arms:'tech',legs:'exo',boots:'tech'} }
];

const WEAPONS = {
  rifle:  {key:'R',name:'ВИНТОВКА', cd:14,dmg:1,   spd:7.2,kind:'bullet',col:P.yl2,len:8},
  machine:{key:'M',name:'ПУЛЕМЁТ',  cd:5, dmg:.8,  spd:8.0,kind:'bullet',col:P.or1,len:9},
  spread: {key:'S',name:'ВЕЕР',     cd:16,dmg:1.05,spd:6.6,kind:'spread',col:P.rd2,len:5},
  laser:  {key:'L',name:'ЛАЗЕР',    cd:20,dmg:2.4, spd:10, kind:'laser', col:P.cy2,len:24},
  fire:   {key:'F',name:'ОГНЕМЁТ',  cd:18,dmg:1.5, spd:5.8,kind:'fire',  col:P.fl3,len:6},
  homing: {key:'H',name:'САМОНАВЕД',cd:17,dmg:1.25,spd:6.2,kind:'homing',col:P.pu1,len:6}
};
const WORDER=['machine','spread','laser','fire','homing'];

const ENEMIES = {
  runner:   {hp:2,w:14,h:34,spd:1.6,score:100,col:P.gr3,kind:'ground',ai:'charge'},
  shooter:  {hp:3,w:14,h:34,spd:.9, score:150,col:P.br3,kind:'ground',ai:'shoot',fire:46,range:320},
  turret:   {hp:7,w:26,h:22,spd:0,  score:250,col:P.mt3,kind:'fixed', ai:'shoot',fire:40,range:340},
  flyer:    {hp:2,w:26,h:15,spd:2.0,score:200,col:P.pu2,kind:'air',   ai:'fly',  fire:64,range:300},
  jumper:   {hp:3,w:16,h:26,spd:1.3,score:200,col:P.or3,kind:'ground',ai:'hop'},
  grenadier:{hp:4,w:16,h:34,spd:1.0,score:250,col:P.rd3,kind:'ground',ai:'lob',  fire:70,range:330},
  crawler:  {hp:3,w:22,h:15,spd:2.1,score:220,col:P.pu3,kind:'ground',ai:'charge'},
  sniper:   {hp:3,w:14,h:34,spd:.6, score:300,col:P.cy4,kind:'ground',ai:'snipe',fire:88,range:440},
  pod:      {hp:1,w:22,h:16,spd:2.4,score:50, col:P.cy2,kind:'air',   ai:'fly',drop:true}
};

const BOSSES = [
  {id:'dog',name:'КЕНДРИК',sub:'БУРЫЙ ПЁС - ОГНЕННАЯ ПАСТЬ',hp:170,w:116,h:72,score:5000,
   moves:['fireball','tail','charge','leap']},
  {id:'cat',name:'АФИНА',sub:'КОШКА - ЛАЗЕРНЫЕ ГЛАЗА',hp:215,w:124,h:68,score:8000,
   moves:['claw','eyebeam','pounce','volley']},
  {id:'spider',name:'АРАХНА',sub:'ФИНАЛЬНЫЙ УЖАС',hp:300,w:138,h:86,score:15000,
   moves:['web','legstab','drop','spawn','poison']}
];

const E='....................';
const SEG = {
  start:{a:[E,E,E,E,E,E,E,E,E,E,E,E,'..P.................'],g:'####################'},
  flat: {a:[E,E,E,E,E,E,E,E,E,E,E,E,'.....e........e.....'],g:'####################'},
  duo:  {a:[E,E,E,E,E,E,E,E,'.......=====........',E,E,E,'....s.......e.......'],g:'####################'},
  gap3: {a:[E,E,E,E,E,E,E,E,E,E,E,'..........B.........',E],g:'########...#########'},
  gap5: {a:[E,E,E,E,E,E,E,E,E,'........=====.......',E,E,E],g:'######.....#########'},
  plat: {a:[E,E,'.........o..........',E,E,'.....======.........',E,E,'............=====...',E,E,E,'.......e............'],g:'####################'},
  turret:{a:[E,E,E,E,E,E,E,E,E,'..........=====.....',E,E,'.....t......s.......'],g:'####################'},
  stairs:{a:[E,E,E,E,E,E,'............====....',E,'........====........',E,'...====.............',E,'......e.........j...'],g:'####################'},
  bridge:{a:[E,E,E,E,E,E,E,E,E,E,E,E,'.....e........e.....'],g:'####BBBBBBBBBBBB####'},
  water:{a:[E,E,E,E,E,E,E,E,'.......======.......',E,E,E,'..e.............e...'],g:'#####~~~~~~~~~~#####'},
  spikes:{a:[E,E,E,E,E,E,E,E,E,'.......======.......',E,E,E],g:'######^^^^^^########'},
  flyers:{a:[E,E,E,'....f.........f.....',E,E,E,'...=====.....=====..',E,E,E,E,'........e...........'],g:'####################'},
  dense:{a:[E,E,E,E,E,E,E,E,'......=====.........',E,E,E,'..e..s...j...e..s...'],g:'####################'},
  sniper:{a:[E,E,E,E,E,E,'...........n........','..........=====.....',E,E,E,E,'.....e..............'],g:'####################'},
  climb:{a:[E,E,E,'.........o..........',E,'..............====..',E,'..........====......',E,'......====..........',E,'..====..............','....e...............'],g:'####################'},
  boxes:{a:[E,E,E,E,E,E,E,E,'....B.......B.......',E,E,E,'...e....s.......e...'],g:'####################'},
  gaunt:{a:[E,E,E,E,E,'.....========.......',E,E,'..=====......=====..',E,E,E,'..j....g.....j......'],g:'####################'},
  arena:{a:[E,E,E,E,E,E,E,E,E,E,E,E,E],g:'##############################'}
};

/* сборка с самовыравниванием: любая ошибка в длине сегмента не ломает карту */
function build(list,theme,boss,name,sub){
  const rows=[];for(let i=0;i<16;i++)rows.push('');
  list.forEach(k=>{
    const s=SEG[k];if(!s)return;
    const w=s.g.length;
    for(let r=0;r<13;r++){
      const src=(s.a&&typeof s.a[r]==='string')?s.a[r]:'';
      rows[r]+=(src+'.'.repeat(w)).slice(0,w);
    }
    let g13='',g14='',g15='';
    for(const ch of s.g){
      if(ch==='#'){g13+='#';g14+='#';g15+='#';}
      else if(ch==='~'){g13+='~';g14+='~';g15+='~';}
      else if(ch==='^'){g13+='^';g14+='#';g15+='#';}
      else if(ch==='B'){g13+='=';g14+='~';g15+='~';}
      else {g13+='.';g14+='.';g15+='.';}
    }
    rows[13]+=g13;rows[14]+=g14;rows[15]+=g15;
  });
  const w=rows[0].length;
  for(let r=0;r<16;r++)rows[r]=(rows[r]+'.'.repeat(w)).slice(0,w);
  return {rows,w,h:16,theme,boss,name,sub};
}

const LEVELS=[
  build(['start','flat','duo','gap3','plat','turret','stairs','bridge','boxes','duo',
         'spikes','flyers','gap5','dense','turret','climb','sniper','gaunt','arena'],
        'jungle',0,'ЗОНА 1','ДЖУНГЛИ И БАЗА'),
  build(['start','duo','stairs','gap5','flyers','climb','water','sniper','plat','gaunt',
         'gap3','turret','bridge','dense','spikes','climb','boxes','flyers','arena'],
        'cliff',1,'ЗОНА 2','УТЁСЫ И ВОДОПАД'),
  build(['start','dense','climb','gap3','sniper','gaunt','flyers','water','turret','plat',
         'spikes','duo','gap5','climb','dense','bridge','sniper','gaunt','arena'],
        'lair',2,'ЗОНА 3','ЛОГОВО АРАХНЫ')
];

const THEMES={
  jungle:{sky:[P.bl4,P.bl2],far:P.gr6,far2:P.gr5,mid:P.gr4,mid2:P.gr3,
    rock:P.br2,rockHi:P.br1,rockLo:P.br3,rockOut:P.br5,
    grass:P.cg2,grassHi:P.cg1,grassLo:P.cg3,
    plat:P.br3,platTop:P.cg2,water:P.cw3,water2:P.cw2,water3:P.cw1,
    fog:null,weather:null,music:'s1',accent:P.gr1},
  cliff:{sky:[P.bl5,P.cy3],far:P.mt5,far2:P.mt4,mid:P.mt4,mid2:P.mt3,
    rock:P.mt3,rockHi:P.mt2,rockLo:P.mt4,rockOut:P.mt5,
    grass:P.cg3,grassHi:P.cg2,grassLo:P.cg4,
    plat:P.mt3,platTop:P.mt1,water:P.cw3,water2:P.cw2,water3:P.cw1,
    fog:'rgba(180,215,240,.08)',weather:'rain',music:'s2',accent:P.cy2},
  lair:{sky:[P.pu5,'#0e0518'],far:'#220d36',far2:'#33125a',mid:P.pu5,mid2:P.pu4,
    rock:'#4a2068',rockHi:'#6a2bb0',rockLo:'#2e1244',rockOut:'#180a28',
    grass:P.pu3,grassHi:P.pu2,grassLo:P.pu4,
    plat:P.pu4,platTop:P.pu3,water:'#5a1636',water2:P.rd3,water3:P.rd2,
    fog:'rgba(120,40,180,.10)',weather:'ember',music:'s3',accent:P.pu1}
};

return {CHARS,WEAPONS,WORDER,ENEMIES,BOSSES,LEVELS,THEMES};
})();
