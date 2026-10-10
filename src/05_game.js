// ===== Game state =====
const Game={mode:'start',n:1,world:null,player:null,boss:null,npcs:[],projs:[],camX:0,shake:0,hitstop:0,flash:0,fade:0,fadeDir:0,fadeCb:null,
  cut:false,fight:false,paused:false,dark:0,darkT:0,slowT:0,lives:3,combo:0,comboT:0,deadT:0,stats:{time:0,kills:0,coins:0,dmg:0,score:0},
  total:{score:0,coins:0},script:null,wx:[],t:0,prevScreen:null,linaEvent:false,
  targets(){const a=this.world?this.world.ents.filter(e=>!e.dead):[];if(this.boss&&!this.boss.dead)a.push(this.boss);return a;},
  addHit(){this.combo++;this.comboT=1.6;const el=$('combo');$('comboN').textContent=this.combo;if(this.combo>=2){el.classList.add('on');el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}this.addScore(10*Math.min(this.combo,20));},
  addScore(v){this.stats.score+=v;},
  onPlayerDead(){this.deadT=1.7;},
  onBossHurt(b){
    const r=b.hp/b.maxHp;
    if(b.phase===1&&r<0.6){b.phase=2;if(b.key==='gorrak'){showBanner('Gorrak is angry!','Watch out for his guards',1.6);SND.play('roar');}}
    if(b.key==='gorrak'&&!this.linaEvent&&r<0.3&&b.hp>0){this.linaEvent=true;runScript(linaEvent(b));}
    else if(b.key!=='gorrak'&&b.phase<3&&r<0.3)b.phase=3;
  },
  onBossDead(b){this.slowT=1.3;this.flash=0.35;showBanner('K.O.!','',1.4);SND.play('boom');vibrate([80,40,160]);this.stats.score+=2000;
    for(const e of this.world.ents)if(!e.dead)killEnemy(e,1);this.projs=this.projs.filter(q=>q.owner==='p');runScript(bossOutro(this.n));},
};

// ===== NPCs (cutscene actors) =====
function npc(key,x,y){const d=DEF[key];return{kind:'npc',key,def:d,x,y,vx:0,vy:0,w:12,h:28,f:1,pn:'stand',pose:Object.assign({},POSES.stand(0)),t:0,auto:null,noPhys:false,onGround:false,alpha:1};}
function updNPC(n,dt){n.t+=dt;if(n.auto){n.f=n.auto.ix>0?1:-1;n.vx=n.auto.ix*(n.auto.spd||100);}else if(n.onGround)n.vx*=Math.pow(0.01,dt);
  if(n.carry){const c=n.carry;n.x=c.x+c.f*20;n.y=c.y-34;n.f=-c.f;}
  else if(n.fly){n.x+=n.vx*dt;n.y+=n.vy*dt;}
  else if(!n.noPhys)moveBody(n,dt);
  let pn=n.pn;const sp=Math.abs(n.vx);if(pn==='stand'&&n.onGround&&sp>15){n.ph=(n.ph||0)+sp*dt*0.16;blendPose(n.pose,POSES[sp>100?'run':'walk'](n.t,n.ph),Math.min(1,dt*20));return;}
  if(pn==='stand'&&!n.onGround&&!n.noPhys&&!n.carry&&!n.fly)pn='fall';
  blendPose(n.pose,POSES[pn](n.t,0),Math.min(1,dt*16));}
function drawNPC(n){G.globalAlpha=n.alpha;drawFig(n.def,n.pose,Math.round(n.x),Math.round(n.y),n.f,{t:n.t,vx:n.vx});G.globalAlpha=1;}

// ===== Scripts (generator coroutines) =====
const say=(who,text)=>({say:true,who,text});
const until=fn=>({until:fn});
function runScript(gen){Game.script={gen,wait:null};stepScript();}
function stepScript(){const s=Game.script;if(!s)return;
  while(true){const r=s.gen.next();if(r.done){if(Game.script===s)Game.script=null;return;}
    const w=r.value;if(typeof w==='number'){s.wait={t:w};return;}
    if(w&&w.say){showDialog(w.who,w.text);s.wait={dlg:true};return;}
    if(w&&w.until){s.wait={until:w.until};return;}}}
function updScript(dt){const s=Game.script;if(!s||!s.wait)return;const w=s.wait;
  if(w.t!==undefined){w.t-=dt;if(w.t<=0){s.wait=null;stepScript();}}
  else if(w.dlg){if(!Dlg.on){s.wait=null;stepScript();}}
  else if(w.until){if(w.until()){s.wait=null;stepScript();}}}

// ===== Dialogue =====
const SPEAKERS={kai:{n:'Kai',img:'pKai'},lina:{n:'Lina',img:'pLina'},gorrak:{n:'King Gorrak',img:'pGorrak',right:1},ren:{n:'Ren',img:'pRen',right:1},
  bruno:{n:'Bruno',right:1},gale:{n:'Gale',right:1},blaze:{n:'Blaze',right:1},coral:{n:'Coral',right:1},rocco:{n:'Rocco',right:1}};
const PORTRAITS={};
function makePortraits(){const prev=G;for(const k of['bruno','gale','blaze','coral','rocco']){
  const tmp=document.createElement('canvas');tmp.width=90;tmp.height=90;G=tmp.getContext('2d');const d=DEF[k];const S=drawFig(d,POSES.stand(0),45,86,1,{t:0});
  const c=document.createElement('canvas');c.width=20;c.height=20;const cx=c.getContext('2d');const g=cx.createLinearGradient(0,0,0,20);g.addColorStop(0,'#2a3f80');g.addColorStop(1,'#0a1430');cx.fillStyle=g;cx.fillRect(0,0,20,20);
  cx.drawImage(tmp,Math.round(S.head.x-9),Math.round(S.head.y-11),20,20,0,0,20,20);PORTRAITS[k]=c.toDataURL();}G=prev;}
const Dlg={on:false,full:'',shown:0,tap:false,lastBlip:0};
function showDialog(who,text){const S=SPEAKERS[who]||{n:who};const el=$('dialog');
  $('dWho').textContent=S.n;$('dTxt').textContent='';const port=S.img?ASSETS[S.img]:PORTRAITS[who];$('dPort').style.backgroundImage=port?`url(${port})`:'none';
  el.classList.toggle('right',!!S.right);el.classList.add('on');Dlg.on=true;Dlg.full=text;Dlg.shown=0;Dlg.tap=false;Input.pressed.ok=0;}
function updDialog(dt){if(!Dlg.on)return;const before=Math.floor(Dlg.shown);Dlg.shown=Math.min(Dlg.full.length,Dlg.shown+dt*48);
  const now=Math.floor(Dlg.shown);if(now!==before){$('dTxt').textContent=Dlg.full.slice(0,now);if(now%3===0)SND.play('blip');}
  if(Dlg.tap||consume('ok')){Dlg.tap=false;if(Dlg.shown<Dlg.full.length){Dlg.shown=Dlg.full.length;$('dTxt').textContent=Dlg.full;}
    else{Dlg.on=false;$('dialog').classList.remove('on');for(const k in Input.pressed)Input.pressed[k]=0;}}}
function closeDialog(){Dlg.on=false;$('dialog').classList.remove('on');}

// ===== Banner =====
let bannerT=0;
function showBanner(big,sub,dur){$('bnBig').textContent=big;$('bnSub').textContent=sub||'';$('banner').classList.add('on');bannerT=dur||1.5;}

// ===== Screens =====
const SCREENS=['s-start','s-title','s-settings','s-help','s-map','s-pause','s-clear','s-over','s-end'];
let curScreen=null;
function show(id){for(const s of SCREENS)$(s).classList.toggle('on',s===id);curScreen=id;
  const inGame=!id&&(Game.mode==='play'||Game.mode==='arena'||Game.mode==='cut');
  $('hud').classList.toggle('on',(Game.mode==='play'||Game.mode==='arena')&&(!id||id==='s-pause'));
  $('pauseBtn').classList.toggle('on',inGame);layout();
  const first=id&&$(id).querySelector('.btn.main,.btn');if(first&&!isTouch)setTimeout(()=>first.focus({preventScroll:true}),250);}
function fadeTo(cb){Game.fadeDir=1;Game.fadeCb=cb;}

function goTitle(){Game.mode='title';Game.script=null;closeDialog();Game.boss=null;show('s-title');SND.music('title');$('skip').classList.remove('on');}
function openMap(){Game.mode='map';Game.script=null;closeDialog();Game.boss=null;$('skip').classList.remove('on');buildMap();show('s-map');SND.music('title');}
let mapSel=1;
function buildMap(){const box=$('isles');box.innerHTML='';let fl=0;
  ISLANDS.forEach((I,i)=>{const n=i+1;const un=n<=SAVE.unlocked;if(SAVE.flowers[n])fl++;
    const b=document.createElement('button');b.className='chip'+(un?'':' locked');b.dataset.n=n;
    b.innerHTML=`<div class="th" style="background-image:url(${ASSETS['isl'+n]})"></div><div class="nm">${I.name}<small>Chapter ${n}${un?' · '+CHAMPS[I.boss].name:''}</small></div><div class="rk">${SAVE.ranks[n]||(un?'':'🔒')}</div>`;
    b.onclick=()=>{if(!un){SND.play('blip');return;}if(mapSel===n&&isTouch===false){}SND.play('blip');selectChapter(n);};
    b.ondblclick=()=>{if(un)playChapter(n);};
    box.appendChild(b);});
  $('mapInfo').textContent=`Lina's flowers ${fl}/7`;
  selectChapter(Math.min(SAVE.unlocked,7));}
function selectChapter(n){mapSel=n;const I=ISLANDS[n-1];
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('sel',+c.dataset.n===n));
  $('pvImg').style.backgroundImage=`url(${ASSETS['isl'+n]})`;$('pvNum').textContent=`Chapter ${n}`;$('pvName').textContent=I.name;$('pvDesc').textContent=I.desc;
  $('pvBoss').textContent=CHAMPS[I.boss].name;$('pvRank').textContent=SAVE.ranks[n]||'None yet';$('pvFlower').textContent=SAVE.flowers[n]?'Found ✿':'Not found';
  $('pvPlay').textContent=SAVE.ranks[n]?'Replay chapter':'Play chapter';}
function playChapter(n){SND.play('select');fadeTo(()=>startIsland(n));}
$('pvPlay').addEventListener('click',()=>{SND.init();playChapter(mapSel);});
addEventListener('keydown',e=>{if(curScreen!=='s-map')return;
  if(e.code==='ArrowDown'||e.code==='KeyS'){if(mapSel<SAVE.unlocked){selectChapter(mapSel+1);SND.play('blip');}e.preventDefault();}
  if(e.code==='ArrowUp'||e.code==='KeyW'){if(mapSel>1){selectChapter(mapSel-1);SND.play('blip');}e.preventDefault();}
  if(e.code==='Enter'&&document.activeElement&&!document.activeElement.closest('.map-bottom')){playChapter(mapSel);e.preventDefault();}});
let chapterT=0;
function showChapter(n){const I=ISLANDS[n-1];$('chImg').style.backgroundImage=`url(${ASSETS['isl'+n]})`;$('chNum').textContent=`Chapter ${n}`;$('chName').textContent=I.name;$('chDesc').textContent=I.desc;
  $('chapter').classList.add('on');chapterT=2.6;}

// ===== Starting scenes =====
function resetRun(){$('chapter').classList.remove('on');chapterT=0;Game.projs=[];Game.npcs=[];Game.boss=null;Game.combo=0;Game.comboT=0;Game.deadT=0;Game.slowT=0;Game.dark=0;Game.darkT=0;Game.linaEvent=false;Game.flash=0;Game.cut=false;closeDialog();Game.wx=[];}
function startIntro(){resetRun();Game.mode='cut';Game.n=1;world=genIntro();Game.world=world;Game.player=makePlayer(70,222);Game.camX=0;show(null);$('skip').classList.add('on');runScript(introScript());}
function startIsland(n,keepStats){resetRun();Game.n=n;Game.mode='play';world=genLevel(n);Game.world=world;Game.player=makePlayer(world.start.x,world.start.y);Game.camX=0;
  if(!keepStats){Game.lives=3;Game.stats={time:0,kills:0,coins:0,dmg:0,score:0};}
  Game.fight=true;show(null);$('skip').classList.remove('on');SND.music(world.isl.song);$('islandName').textContent=world.isl.name;
  $('bossbar').classList.remove('on');runScript(levelStart(n));}
function startArena(n){resetRun();Game.n=n;Game.mode='arena';world=genArena(n);Game.world=world;const keepHp=Game.player?Game.player.hp:null;
  Game.player=makePlayer(-20,228);if(keepHp)Game.player.hp=Math.max(keepHp,Game.player.maxHp*0.6);Game.player.mana=Math.max(1,Game.player.mana);
  if(n===7){world.plats.push({x:404,y:150,w:62,ledge:true});const l=npc('lina',438,150);l.f=-1;l.pn='scared';l.chained=true;Game.npcs.push(l);}
  Game.camX=0;show(null);SND.music(null);$('islandName').textContent=world.isl.name;runScript(bossIntro(n));}

function* levelStart(n){const I=ISLANDS[n-1];Game.cut=true;const p=Game.player;p.state='cut';p.x=-20;p.auto={ix:1,spd:120};
  showChapter(n);yield 0.55;p.auto=null;p.state='normal';Game.cut=false;yield 2.3;showBanner('Go!','',0.7);
  if(n===1){yield 1.6;showBanner('Move and jump',isTouch?'Joystick + JUMP (tap twice to double jump)':'Arrows or A/D + Space (twice to double jump)',3);
    yield 4;showBanner('Combo!',isTouch?'Tap PUNCH 3 times':'Press J 3 times',2.6);yield 5;showBanner('Energy blast',isTouch?'BLAST uses a blue bar':'K uses a blue bar',2.6);}}

function* introScript(){
  Game.fight=false;Game.cut=true;const p=Game.player;p.state='cut';p.x=60;p.f=1;
  const lina=npc('lina',40,222);Game.npcs.push(lina);SND.music('calm');
  p.auto={ix:0.5,spd:55};lina.auto={ix:0.5,spd:55};yield 2.3;p.auto=null;lina.auto=null;
  yield say('lina',"Kai, look! The sky is so beautiful today.");
  p.f=-1;yield 0.3;
  yield say('kai',"Not as beautiful as you, Lina.");
  lina.pn='cheer';yield 0.9;lina.pn='stand';
  SND.music(null);Game.darkT=0.6;yield 1.2;SND.play('thunder');Game.flash=0.5;Game.shake=6;vibrate(60);yield 0.9;
  const gor=npc('gorrak',370,-120);gor.f=-1;gor.pn='slamDown';Game.npcs.push(gor);
  yield until(()=>gor.onGround);Game.shake=14;SND.play('boom');vibrate(120);dust(gor.x,gor.y,18);part('shock',gor.x,gor.y,{life:0.5,max:0.5,col:'#fff'});
  lina.pn='scared';p.f=1;SND.music('boss');yield 0.5;gor.pn='slamUp';SND.play('roar');Game.shake=5;yield 0.8;gor.pn='stand';
  yield say('gorrak',"Hahaha! This island is mine now... and so is she!");
  yield say('kai',"Stay behind me, Lina!");
  p.auto={ix:1,spd:180};yield until(()=>p.x>gor.x-110);p.auto=null;p.vy=-300;p.vx=230;p.poseOverride='airkick';p.poseRate=30;SND.play('whiff');
  yield until(()=>p.x>gor.x-40);gor.pn='punch2';SND.play('hit');Game.hitstop=0.12;Game.shake=8;sparks(p.x+8,p.y-20,'#FFE04A',14);vibrate(80);
  p.poseOverride=null;p.state='dead';p.vx=-260;p.vy=-200;yield 1.4;gor.pn='stand';
  gor.auto={ix:-1,spd:110};yield until(()=>gor.x<lina.x+28);gor.auto=null;gor.pn='throwp';yield 0.3;lina.carry=gor;lina.pn='carried';gor.pn='stand';
  yield say('lina',"Kai!!");
  yield say('gorrak',"You're weak... but I'll enjoy this! Find me at the Sky Castle, if you dare!");
  gor.fly=true;gor.pn='jump';gor.vy=-520;gor.vx=120;SND.play('djump');Game.shake=6;dust(gor.x,gor.y,12);
  yield until(()=>gor.y<-150);Game.npcs=Game.npcs.filter(n=>n!==gor&&n!==lina);Game.darkT=0.25;
  yield 0.8;p.state='cut';p.pose=Object.assign(p.pose,POSES.crouch(0));p.poseOverride='crouch';p.poseRate=4;yield 0.7;p.poseOverride=null;
  yield say('lina',"(far away) Kai... be careful. I believe in you.");
  yield say('kai',"I will save you, Lina... no matter what!");
  p.poseOverride='victory';p.poseRate=18;SND.music('title');SND.play('win');showBanner('7 islands. 7 champions.','One goal: save Lina.',2.6);yield 2.8;p.poseOverride=null;
  SAVE.seenIntro=true;persist();$('skip').classList.remove('on');fadeTo(()=>startIsland(1));
}
const KAI_LINES=["Then I'll go through you!","Then I'll be faster than the wind!","My fire burns for Lina!","Nothing will stop me. Not even the sea!","Big or small, I'm going up!","I don't want to fight you... but I will!","Let her go, Gorrak. This ends now!"];
function* bossIntro(n){const I=ISLANDS[n-1],key=I.boss,C=CHAMPS[key];Game.cut=true;Game.fight=false;const p=Game.player;p.state='cut';
  const b=makeBoss(key,372,n===7?-100:228);Game.boss=b;if(n===7)b.noGrav=true;
  $('bossName').textContent=C.name;$('bossbar').classList.add('on');$('hud').classList.add('on');
  p.auto={ix:1,spd:110};yield until(()=>p.x>=108);p.auto=null;p.f=1;
  if(n===7){b.noGrav=false;yield until(()=>b.onGround);Game.shake=12;SND.play('boom');vibrate(100);dust(b.x,b.y,16);part('shock',b.x,b.y,{life:0.5,max:0.5,col:'#fff'});yield 0.4;}
  SND.music(n===7?'final':'boss');showBanner(C.name,`Champion of ${I.name}`,1.7);yield 1.2;
  if(n===7)yield say('lina',"Kai! You came!");
  yield say(key,C.pre);yield say('kai',KAI_LINES[n-1]);
  showBanner('Fight!','',0.8);SND.play('select');vibrate(30);bossSet(b,'idle');b.cd=0.9;p.state='normal';Game.cut=false;Game.fight=true;}
function* linaEvent(b){Game.cut=true;Game.projs=[];bossSet(b,'intro');b.vx=0;const p=Game.player;if(p.state!=='dead')pSetState(p,'normal');
  const lina=Game.npcs.find(n=>n.key==='lina');yield 0.4;
  yield say('lina',"Kai! Catch this!");
  if(lina){lina.chained=false;lina.pn='throwp';sparks(lina.x,lina.y-20,'#ffffff',12);SND.play('hit');yield 0.25;
    Game.projs.push({x:lina.x-8,y:lina.y-22,vx:(p.x-lina.x)/0.7,vy:-260,grav:GRAV*0.75,r:4,dmg:0,owner:'n',type:'flowerT',life:0.9,f:-1});}
  yield 0.75;p.hp=p.maxHp;p.mana=3;SND.play('pick');for(let i=0;i<16;i++)part('glow',p.x+rnd(-14,14),p.y-rnd(0,34),{vy:-50,life:0.6,max:0.6,size:3,col:i%2?'#F5B83D':'#ffffff'});popup(p.x,p.y-40,'+','#7cff9a');
  yield say('kai',"Thanks, Lina! Now... it's time for the Sky Fist!");
  yield say('gorrak',"GRRRAAAH! I'll crush you both!");
  if(lina)lina.pn='cheer';b.phase=3;bossSet(b,'idle');b.cd=1.0;Game.cut=false;SND.play('roar');Game.shake=6;
  showBanner('Use Sky Fist!',isTouch?'Press BLAST with 3 full bars':'Press K with 3 full bars',2.2);}
function* bossOutro(n){const p=Game.player;const key=ISLANDS[n-1].boss;yield 1.6;Game.cut=true;Game.fight=false;
  if(p.state!=='dead'){pSetState(p,'cut');p.poseOverride='victory';}SND.music(null);SND.play('win');yield 1.0;
  yield say(key,CHAMPS[key].post);
  if(n===6)yield say('kai',"Thank you, Ren. Watch me. I'll finish this.");
  if(n===7){const lina=Game.npcs.find(x=>x.key==='lina');p.poseOverride=null;
    if(lina){lina.chained=false;lina.pn='stand';lina.noPhys=false;lina.auto={ix:-1,spd:120};yield until(()=>lina.x<p.x+22||lina.x<40);lina.auto=null;lina.f=-1;p.f=1;lina.pn='hug';p.poseOverride='hug';}
    SND.music('ending');yield 0.6;
    yield say('lina',"Kai! You really did it!");
    yield say('kai',"I told you, Lina. No matter what.");
    yield say('lina',"Let's go home.");
    finishIsland(n,true);fadeTo(()=>{Game.mode='end';show('s-end');$('hud').classList.remove('on');Game.endT=0;});return;}
  p.poseOverride='victory';finishIsland(n,false);}
function rankFor(st){let pts=100-st.dmg*4-Math.max(0,st.time-150)*0.12+Math.min(15,st.coins/4);return pts>=88?'S':pts>=72?'A':pts>=55?'B':'C';}
function finishIsland(n,last){const st=Game.stats;st.score+=Math.max(0,Math.round(3000-st.time*8));const rk=rankFor(st);
  const order='CBAS';if(!SAVE.ranks[n]||order.indexOf(rk)>order.indexOf(SAVE.ranks[n]))SAVE.ranks[n]=rk;
  if(n<7&&SAVE.unlocked<n+1)SAVE.unlocked=n+1;persist();Game.total.score+=st.score;
  const m=Math.floor(st.time/60),s=Math.floor(st.time%60);
  $('clearStats').innerHTML=`<span>Island</span><span>${ISLANDS[n-1].name}</span><span>Time</span><span>${m}:${String(s).padStart(2,'0')}</span><span>Enemies</span><span>${st.kills}</span><span>Coins</span><span>${st.coins}</span><span>Damage taken</span><span>${st.dmg}</span><span>Score</span><span>${st.score}</span>`;
  $('clearRank').textContent=rk;$('nextBtn').style.display=n<7?'':'none';
  if(!last){setTimeout(()=>{if(Game.mode==='arena'){Game.mode='clear';show('s-clear');SND.play('win');}},400);}}

// ===== Pickups & triggers =====
function updPickups(dt){const p=Game.player;for(const k of world.pickups){if(k.dead)continue;k.t+=dt;
    if(k.phys){k.vy+=GRAV*0.8*dt;k.x+=(k.vx||0)*dt;let ny=k.y+k.vy*dt;if(k.vy>0&&solidBelow(k.x,ny-2)){const s=world.ground.concat(world.plats).find(s=>k.x>s.x&&k.x<s.x+s.w&&Math.abs(s.y-ny)<8);if(s){ny=s.y-6;k.vy=0;k.vx=0;k.phys=false;k.baseY=ny;}}k.y=ny;if(k.y>H+40)k.dead=true;}
    const dx=p.x-k.x,dy=(p.y-14)-k.y,d=Math.hypot(dx,dy);
    if(k.type==='coin'&&d<34&&p.state!=='dead'&&!k.phys){k.x+=dx*dt*8;k.y+=dy*dt*8;}
    if(d<13&&p.state!=='dead'&&!Game.cut)collect(k,p);}
  world.pickups=world.pickups.filter(k=>!k.dead);}
function collect(k,p){k.dead=true;
  switch(k.type){
  case'coin':Game.stats.coins++;Game.addScore(10);SND.play('coin');break;
  case'heart':p.hp=Math.min(p.maxHp,p.hp+3);popup(p.x,p.y-36,'+3','#7cff9a');SND.play('pick');break;
  case'orb':p.mana=Math.min(3,p.mana+1);SND.play('pick');popup(p.x,p.y-36,'+','#7fb0ff');break;
  case'star':p.power=8;SND.play('pick');showBanner('Power up!','Double damage for 8 seconds',1.4);vibrate(30);break;
  case'gem':Game.addScore(500);popup(p.x,p.y-36,'500','#9fc3ff');SND.play('pick');break;
  case'flower':SAVE.flowers[Game.n]=true;persist();SND.play('check');showBanner("Lina's flower!",'She passed this way. Keep going!',2);vibrate([20,30,20]);break;}
  sparks(k.x,k.y,k.type==='coin'?'#F5B83D':'#ffffff',4);}
function updTriggers(dt){const p=Game.player;if(world.arena)return;
  for(const f of world.flags){if(!f.on&&p.x>f.x&&p.state!=='dead'){f.on=true;p.safe={x:f.x,y:f.y};Game.checkpoint={x:f.x,y:f.y};SND.play('check');showBanner('Checkpoint','',0.9);}if(f.on)f.raise=Math.min(1,f.raise+dt*2);}
  const z=world.zone;
  if(z&&!z.started&&p.x>z.x+130){z.started=true;z.wave=0;world.wallL=z.x+4;world.wallR=z.x+z.w-4;showBanner('Battle!','Beat them all',1.2);SND.play('roar');spawnWave(z);}
  if(z&&z.started&&!z.done){const alive=world.ents.filter(e=>e.zone&&!e.dead).length;
    if(alive===0){z.next=(z.next||0)+dt;if(z.next>0.8){z.next=0;if(z.wave<2)spawnWave(z);else{z.done=true;world.wallL=-1e9;world.wallR=1e9;showBanner('Go!','Keep moving',1.2);SND.play('check');}}}}
  if(world.gate&&!Game.cut&&p.x>world.gate.x-6&&p.state!=='dead'){Game.cut=true;pSetState(p,'cut');p.auto={ix:1,spd:110};SND.play('superb');fadeTo(()=>startArena(Game.n));}}
function spawnWave(z){z.wave++;const I=world.isl;const n=Game.n;const cnt=2+(z.wave===2?1:0)+(n>3?1:0);
  for(let i=0;i<cnt;i++){const tp=I.enemies[(i+z.wave)%I.enemies.length];const T=ETYPES[tp];const x=z.x+60+(i/(cnt-1||1))*(z.w-120);
    const e=makeEnemy(tp,x,T.fly?110:-30-i*20);e.zone=true;if(T.fly)e.home.y=120;e.cd=1+i*0.3;world.ents.push(e);part('ring',x,T.fly?110:z.y-20,{life:0.3,max:0.3,size:6,col:'#fff'});}}

// ===== Weather =====
function updWeather(dt,kind){const A=Game.wx;const rate={petal:6,wind:14,ember:16,mist:5,leaf:5,wisp:6,spark:6}[kind]||0;
  if(Math.random()<rate*dt)A.push(newWx(kind));
  for(const w of A){w.t+=dt;w.x+=w.vx*dt;w.y+=w.vy*dt+Math.sin(w.t*3+w.ph)*w.sw*dt;}
  Game.wx=A.filter(w=>w.t<w.life&&w.x>-30&&w.x<W+30&&w.y>-30&&w.y<H+30);}
function newWx(k){const w={k,t:0,ph:Math.random()*6,sw:0,life:8};
  switch(k){case'petal':Object.assign(w,{x:rnd(0,W+60),y:-6,vx:rnd(-40,-15),vy:rnd(18,32),sw:20,col:Math.random()<0.5?'#ffb3c8':'#ffffff'});break;
  case'wind':Object.assign(w,{x:W+20,y:rnd(10,H-30),vx:rnd(-420,-280),vy:0,len:rnd(10,26),life:2});break;
  case'ember':Object.assign(w,{x:rnd(0,W),y:H+4,vx:rnd(-10,10),vy:rnd(-50,-25),sw:15,col:Math.random()<0.5?'#FF7A1A':'#FFD23A'});break;
  case'mist':Object.assign(w,{x:rnd(0,W),y:rnd(0,H),vx:rnd(-8,-3),vy:rnd(-4,4),col:'rgba(255,255,255,.35)',life:5,sz:rnd(2,4)});break;
  case'leaf':Object.assign(w,{x:rnd(0,W+60),y:-6,vx:rnd(-30,-10),vy:rnd(20,35),sw:25,col:Math.random()<0.5?'#8ab84a':'#b08a4a'});break;
  case'wisp':Object.assign(w,{x:rnd(0,W),y:H+4,vx:rnd(-6,6),vy:rnd(-25,-12),sw:20,col:'#C063FF'});break;
  case'spark':Object.assign(w,{x:rnd(0,W),y:rnd(0,H*0.7),vx:0,vy:rnd(-4,4),col:'#fff6c0',life:1.6});break;}return w;}
function drawWeather(){for(const w of Game.wx){const a=Math.min(1,(w.life-w.t)/0.6,w.t/0.3);G.globalAlpha=a;
  switch(w.k){case'wind':R(w.x,w.y,w.len,1,'rgba(255,255,255,.7)');break;
  case'mist':R(w.x,w.y,w.sz,w.sz,w.col);break;
  case'wisp':G.globalAlpha=a*0.5;R(w.x-2,w.y-2,5,5,w.col);G.globalAlpha=a;R(w.x,w.y,1,1,'#fff');break;
  case'spark':{const s=Math.sin(w.t*4)>0?1:0;R(w.x,w.y,1,1,w.col);if(s){R(w.x-1,w.y,3,1,w.col);R(w.x,w.y-1,1,3,w.col);}break;}
  default:R(w.x,w.y,2,1+(Math.sin(w.t*6)>0?1:0),w.col);}}G.globalAlpha=1;}

// ===== Rendering =====
function hsh(x){x=Math.sin(x*127.1)*43758.5453;return x-Math.floor(x);}
function drawGround(s,I){const x=Math.round(s.x),y=Math.round(s.y),w=Math.round(s.w);const D=26;
  const rock=I.dirt,rk2=shade(I.dirt,0.72),ol=shade(I.dirt2,0.6);
  // underside taper
  const T=Math.min(70,Math.max(24,w*0.32));
  for(let i=0;i<T;i+=2){const t=i/T;const ins=(w/2)*Math.pow(t,1.5)+(hsh(x+i)*4-2);const rw=w-ins*2;if(rw<2)break;
    R(x+ins,y+D+i,rw,2,shade(rock,0.92-t*0.35));R(x+ins,y+D+i,Math.max(1,rw*0.12),2,shade(rock,1.1-t*0.3));R(x+w-ins-rw*0.2,y+D+i,rw*0.2,2,shade(rock,0.7-t*0.25));}
  for(let sx=x+10;sx<x+w-10;sx+=17){const hv=hsh(sx);if(hv<0.45)continue;const t=Math.abs((sx-x)/w-0.5)*2;const base=y+D+(T*Math.pow(t,0.67))*0.5;const L=6+hv*14*(1-t);
    for(let k=0;k<L;k++)R(sx-(1-k/L)*2,base+k,Math.max(1,(1-k/L)*4),1,shade(rock,0.62));}
  // soil body
  G.fillStyle=world.bg.pat;G.fillRect(x,y,w,D);
  R(x,y+D-3,w,3,rk2);R(x,y+D-1,w,1,ol);
  R(x,y,2,D,shade(rock,1.2));R(x+w-3,y,3,D,rk2);
  // grass cap + drips + blades
  R(x-1,y-1,w+2,6,I.top);R(x-1,y-1,w+2,1,I.topHi);R(x-1,y+5,w+2,1,shade(I.top,0.72));
  for(let i=0;i<w;i+=3){const h=hsh(x+i*1.7);if(h>0.35)R(x+i,y+5,2,1+Math.floor(h*3),I.top);if(h>0.55)R(x+i,y-2-(h>0.8?1:0),1,2+(h>0.8?1:0),I.topHi);}
  if(!I.lava)for(let i=8;i<w-6;i+=13){const h=hsh(x*3+i);if(h<0.78)continue;const L=6+Math.floor(h*16);const vc=shade(I.top,0.68);for(let k=0;k<L;k++)R(x+i+Math.round(Math.sin(k*0.5)*0.8),y+6+k,1,1,vc);R(x+i-1,y+6+L,3,2,I.top);}
  if(I.lava){for(let i=0;i<w;i+=7){const h=hsh(x+i);if(h>0.6)R(x+i,y,3,1,'#ffd27a');}const gl=0.5+Math.sin(world.t*3+x)*0.2;G.globalAlpha=gl;R(x-1,y-1,w+2,1,'#ff9a3a');G.globalAlpha=1;}
  if(I.shadow){for(let i=0;i<w;i+=9)if(hsh(x+i)>0.7)R(x+i,y+1,1,1,'#e6c8ff');}
}
function drawPlat(p,I){const x=Math.round(p.x),y=Math.round(p.y),w=p.w;
  if(p.ledge){R(x,y,w,6,'#cfc8ba');R(x,y,w,1,'#fff');for(let i=0;i<4;i++)R(x+3+i*3,y+6+i*3,w-6-i*6,3,'#9f98a8');return;}
  const H2=Math.max(8,Math.round(w*0.32));
  for(let i=0;i<H2;i++){const t=i/H2;const ins=(w/2)*Math.pow(t,1.3);R(x+ins,y+4+i,w-ins*2,1,shade(I.dirt,1-t*0.35));R(x+ins,y+4+i,Math.max(1,(w-ins*2)*0.2),1,shade(I.dirt,1.15-t*0.3));}
  R(x-1,y-1,w+2,5,I.top);R(x-1,y-1,w+2,1,I.topHi);R(x-1,y+4,w+2,1,shade(I.top,0.72));
  for(let i=1;i<w;i+=4){if(hsh(x+i)>0.5)R(x+i,y+5,2,1+(hsh(i+x)>0.8?1:0),I.top);}
  if(p.mov){const gl=0.6+Math.sin(world.t*6)*0.4;G.globalAlpha=gl;R(x+w/2-3,y+H2+5,6,2,'#9fd8ff');G.globalAlpha=1;}}
function drawGate(g,I,t){const x=g.x,y=g.y;R(x-24,y-56,8,56,'#8a8478');R(x+16,y-56,8,56,'#8a8478');R(x-28,y-62,56,8,'#a69f92');R(x-28,y-62,56,2,'#d6d0c2');
  for(let i=0;i<46;i++){const yy=y-52+i;const w=Math.sin(i/46*PI)*16;const c=Math.sin(t*6-i*0.3)>0?I.topHi:mixHex(I.top,'#ffffff',0.3);R(x-w,yy,w*2,1,c);}
  G.globalAlpha=0.5+Math.sin(t*4)*0.2;R(x-14,y-48,28,44,'#ffffff');G.globalAlpha=1;
  for(let i=0;i<3;i++){const a=t*3+i*2.1;R(x+Math.cos(a)*12,y-28+Math.sin(a)*18,2,2,'#fff');}
  const ax=x-50+Math.sin(t*5)*3;R(ax,y-30,8,2,'#F5B83D');R(ax+6,y-32,2,6,'#F5B83D');R(ax+8,y-31,1,4,'#F5B83D');}
function drawFlag(f){R(f.x,f.y-30,2,30,'#d9d4c8');const c=f.on?'#E0362C':'#6a6a7a';const fy=f.y-30+(1-f.raise)*18;for(let i=0;i<7;i++)R(f.x+2,fy+i,10-i*1.2,1,c);R(f.x-1,f.y-32,4,3,'#F5B83D');}
function drawTitleBG(t){const img=IMG.title;ctx.fillStyle='#0a1a44';ctx.fillRect(0,0,W,H);
  if(img.complete&&img.naturalWidth){const sc=W/img.naturalWidth*1.06;const h=img.naturalHeight*sc;const off=0.3+(1-Math.cos(t*0.1))/2*0.35;ctx.drawImage(img,-8,-(h-H)*off,img.naturalWidth*sc,h);}
  ctx.fillStyle='rgba(7,13,34,.15)';ctx.fillRect(0,0,W,H);
  if(Game.mode!=='start'){const g=ctx.createLinearGradient(W*0.55,0,W,0);g.addColorStop(0,'rgba(7,13,34,0)');g.addColorStop(1,'rgba(7,13,34,.65)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  updWeather(1/60,'spark');G=ctx;drawWeather();}
function drawEnding(t){const img=IMG.ending;const sc=1.6;const w=img.naturalWidth*sc,h=img.naturalHeight*sc;const top=H-h+4;
  const g=ctx.createLinearGradient(0,0,0,top+2);g.addColorStop(0,'#120e33');g.addColorStop(1,'#4e3474');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let i=0;i<50;i++){const x=(i*97)%W,y=(i*53)%Math.max(20,top-10);if(Math.sin(t*2+i)>0.2)R(x,y,1,1,'#fff');}
  if(img.complete&&img.naturalWidth){const pan=Math.min(1,t/12);ctx.drawImage(img,Math.round(-330-pan*50),Math.round(top),w,h);
    const f=ctx.createLinearGradient(0,top,0,top+34);f.addColorStop(0,'rgba(78,52,116,1)');f.addColorStop(1,'rgba(78,52,116,0)');ctx.fillStyle=f;ctx.fillRect(0,top,W,34);}
  updWeather(1/60,'petal');G=ctx;drawWeather();}
function render(){G=ctx;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;const t=Game.t;
  if(Game.mode==='start'||Game.mode==='title'||Game.mode==='map'){drawTitleBG(t);}
  else if(Game.mode==='end'){drawEnding(Game.endT||0);}
  else if(world){const I=world.isl;
    const sh=SAVE.opt.shake?Game.shake:0;const sx=Math.round(rnd(-sh,sh)),sy=Math.round(rnd(-sh,sh));
    drawSky(I,world.arena?0:Game.camX,world.t);
    if(Game.dark>0.01){ctx.fillStyle=`rgba(20,6,40,${Game.dark})`;ctx.fillRect(0,0,W,H);}
    ctx.save();ctx.translate(-Math.round(Game.camX)+sx,sy);
    const cx0=Game.camX-60,cx1=Game.camX+W+60;
    for(const pr of world.props)if(pr.x>cx0&&pr.x<cx1)drawProp(pr,I,world.t);
    for(const s of world.ground)if(s.x<cx1&&s.x+s.w>cx0)drawGround(s,I);
    for(const p of world.plats)if(p.x<cx1&&p.x+p.w>cx0)drawPlat(p,I);
    if(Game.n===7&&world.arena){const l=Game.npcs.find(n=>n.key==='lina');if(l&&l.chained){seg(470,120,l.x+3,l.y-18,1,'#9a9aa8');seg(470,150,l.x+2,l.y-6,1,'#9a9aa8');}}
    for(const f of world.flags)if(f.x>cx0&&f.x<cx1)drawFlag(f);
    if(world.gate)drawGate(world.gate,I,world.t);
    for(const k of world.pickups)if(k.x>cx0&&k.x<cx1)drawPick(k);
    for(const e of world.ents)if(!e.dead&&e.x>cx0&&e.x<cx1)drawEnemy(e);
    for(const n of Game.npcs)drawNPC(n);
    if(Game.boss)drawBoss(Game.boss);
    const p=Game.player;if(p){if(p.power>0&&Math.random()<0.5)part('glow',p.x+rnd(-8,8),p.y-rnd(0,30),{vy:-40,life:0.35,max:0.35,size:2,col:'#FFE04A'});
      if(!(p.inv>0&&p.state!=='hurt'&&p.state!=='dead'&&Math.floor(Game.t*20)%2))drawFig(p.def,p.pose,Math.round(p.x),Math.round(p.y),p.f,{t:p.t,vx:p.vx});}
    for(const q of Game.projs)drawProj(q);
    drawParts();
    ctx.restore();
    drawWeather();
    if(p&&p.power>0){ctx.strokeStyle=`rgba(255,224,74,${0.25+Math.sin(Game.t*10)*0.1})`;ctx.lineWidth=4;ctx.strokeRect(2,2,W-4,H-4);}
    if(p&&p.hp>0&&p.hp<p.maxHp*0.25&&Game.fight){ctx.strokeStyle=`rgba(226,58,46,${0.25+Math.sin(Game.t*8)*0.15})`;ctx.lineWidth=6;ctx.strokeRect(3,3,W-6,H-6);}
  }
  if(Game.flash>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(1,Game.flash*2)})`;ctx.fillRect(0,0,W,H);}
  if(Game.fade>0){ctx.fillStyle=`rgba(7,13,34,${Game.fade})`;ctx.fillRect(0,0,W,H);}
}

// ===== HUD =====
const hudCache={};
function setW(el,key,v){if(hudCache[key]!==v){hudCache[key]=v;el.style.width=v;}}
function updHUD(){const p=Game.player;if(!p)return;
  const hp=Math.max(0,p.hp/p.maxHp*100).toFixed(1)+'%';setW($('hpBar').children[1],'hp',hp);setW($('hpBar').children[0],'hp2',hp);
  const ms=$('mana').children;for(let i=0;i<3;i++)setW(ms[i].firstChild,'m'+i,clamp(p.mana-i,0,1)*100+'%');
  const full=p.mana>=2.999;$('mana').classList.toggle('full',full);const bs=$('bSpc');bs.classList.toggle('super',full);bs.classList.toggle('ready',!full&&p.mana>=1);
  if(hudCache.bsTxt!==full){hudCache.bsTxt=full;bs.textContent=full?'SKY FIST':'BLAST';}
  const txt='● '+Game.stats.coins;if(hudCache.c!==txt){hudCache.c=txt;$('coins').textContent=txt;}
  const sc=String(Game.stats.score);if(hudCache.s!==sc){hudCache.s=sc;$('score').textContent=sc;}
  const lv='x'+Game.lives;if(hudCache.l!==lv){hudCache.l=lv;$('lives').textContent=lv;}
  if(Game.boss){const b=Game.boss;const v=(b.hp/b.maxHp*100).toFixed(1)+'%';setW($('bossHp').children[1],'bh',v);setW($('bossHp').children[0],'bh2',v);}
}

// ===== Main loop =====
let last=performance.now();
function frame(now){let dt=Math.min(0.05,(now-last)/1000);last=now;Game.t+=dt;
  tickInput(dt);updateInputAxis();
  if(bannerT>0){bannerT-=dt;if(bannerT<=0)$('banner').classList.remove('on');}
  if(chapterT>0){chapterT-=dt;if(chapterT<=0)$('chapter').classList.remove('on');}
  if(Game.fadeDir){Game.fade=clamp(Game.fade+Game.fadeDir*dt*3.2,0,1);if(Game.fadeDir>0&&Game.fade>=1){const cb=Game.fadeCb;Game.fadeCb=null;Game.fadeDir=-1;if(cb)cb();}else if(Game.fadeDir<0&&Game.fade<=0)Game.fadeDir=0;}
  const inWorld=Game.mode==='play'||Game.mode==='arena'||Game.mode==='cut';
  if(inWorld&&consume('pause')&&!Game.fadeDir){togglePause();}
  if(Game.mode==='end')Game.endT=(Game.endT||0)+dt;
  if(inWorld&&!Game.paused){
    updDialog(dt);
    if(Game.hitstop>0){Game.hitstop-=dt;}
    else{
      if(Game.slowT>0)Game.slowT-=dt;const sdt=dt*(Game.slowT>0?0.3:1);
      world.t+=sdt;
      for(const p of world.plats)if(p.mov){const nx=p.cx-p.w/2+Math.sin(world.t*p.sp+p.ph)*p.amp;p.dx=nx-p.x;p.x=nx;}
      const p=Game.player;updPlayer(p,sdt);
      for(const e of world.ents)if(!e.dead&&Math.abs(e.x-p.x)<420)updEnemy(e,sdt);
      world.ents=world.ents.filter(e=>!e.dead||false);
      if(Game.boss)updBoss(Game.boss,sdt);
      for(const n of Game.npcs)updNPC(n,sdt);
      updProjs(sdt);updPickups(sdt);updParts(sdt);updTriggers(sdt);
      if(Game.fight&&!Game.cut&&p.state!=='dead')Game.stats.time+=sdt;
      if(Game.comboT>0){Game.comboT-=sdt;if(Game.comboT<=0){Game.combo=0;$('combo').classList.remove('on');}}
      if(Game.deadT>0){Game.deadT-=dt;if(Game.deadT<=0)afterDeath();}
      // camera
      if(world.arena)Game.camX=0;else{let tx=p.x-200+p.f*30;const z=world.zone;if(z&&z.started&&!z.done)tx=z.x;Game.camX+=(tx-Game.camX)*Math.min(1,dt*5);Game.camX=clamp(Game.camX,0,world.len-W);}
      Game.shake=Math.max(0,Game.shake-dt*30);Game.flash=Math.max(0,Game.flash-dt);
      Game.dark+=(Game.darkT-Game.dark)*Math.min(1,dt*2);
      updScript(dt);
      updWeather(dt,world.isl.weather);
    }
    updHUD();
  }
  render();
  requestAnimationFrame(frame);
}
function afterDeath(){const p=Game.player;
  if(Game.lives>1){Game.lives--;p.hp=p.maxHp;pSetState(p,'normal');p.inv=2;p.pose.rot=0;p.mana=Math.max(p.mana,1);
    if(world.arena){p.x=Game.boss&&Game.boss.x>240?80:400;p.y=200;}else{const c=p.safe;p.x=c.x;p.y=c.y-4;}p.vx=0;p.vy=0;
    showBanner('Get up, Kai!',`${Game.lives} ${Game.lives===1?'life':'lives'} left`,1.3);SND.play('pick');}
  else{Game.mode='over';show('s-over');SND.music(null);}}
function togglePause(){if(Game.mode==='over'||Game.mode==='clear')return;Game.paused=!Game.paused;if(Game.paused){show('s-pause');SND.play('select');}else{show(null);}}

// ===== UI wiring =====
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;SND.init();const a=b.dataset.act;SND.play('select');
  switch(a){
  case'play':if(!SAVE.seenIntro)fadeTo(startIntro);else openMap();break;
  case'settings':Game.prevScreen=curScreen;syncSettings();show('s-settings');break;
  case'help':Game.prevScreen=curScreen;show('s-help');break;
  case'back':show(Game.prevScreen||'s-title');break;
  case'title':goTitle();break;
  case'intro':fadeTo(startIntro);break;
  case'resume':Game.paused=false;show(null);break;
  case'retry':Game.paused=false;show(null);if(Game.mode==='arena'||(Game.mode==='over'&&world&&world.arena)){Game.lives=3;fadeTo(()=>startArena(Game.n));}else{fadeTo(()=>startIsland(Game.n));}break;
  case'quit':Game.paused=false;fadeTo(openMap);break;
  case'next':fadeTo(()=>startIsland(Math.min(7,Game.n+1)));break;
  }});
$('pauseBtn').addEventListener('click',()=>{SND.init();if(!Game.paused)togglePause();});
$('skip').addEventListener('click',()=>{Game.script=null;closeDialog();SAVE.seenIntro=true;persist();$('skip').classList.remove('on');fadeTo(()=>startIsland(1));});
$('stage').addEventListener('pointerdown',e=>{SND.init();if(Dlg.on&&!e.target.closest('button'))Dlg.tap=true;});
$('s-start').addEventListener('pointerdown',()=>{SND.init();SND.play('select');goTitle();});
addEventListener('keydown',e=>{if(Game.mode==='start'&&(e.code==='Enter'||e.code==='Space')){SND.init();SND.play('select');goTitle();}},true);
// settings
function syncSettings(){$('optMusic').value=SAVE.opt.music;$('optSfx').value=SAVE.opt.sfx;$('optMusic').style.setProperty('--p',SAVE.opt.music+'%');$('optSfx').style.setProperty('--p',SAVE.opt.sfx+'%');
  document.querySelectorAll('.seg').forEach(s=>{const k=s.dataset.opt;s.querySelectorAll('button').forEach(b=>b.classList.toggle('on',String(SAVE.opt[k])===b.dataset.v));});}
$('optMusic').addEventListener('input',e=>{SAVE.opt.music=+e.target.value;e.target.style.setProperty('--p',e.target.value+'%');SND.vol();persist();});
$('optSfx').addEventListener('input',e=>{SAVE.opt.sfx=+e.target.value;e.target.style.setProperty('--p',e.target.value+'%');SND.vol();persist();SND.play('coin');});
document.querySelectorAll('.seg').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=s.dataset.opt;let v=b.dataset.v;
  if(k==='vib'||k==='shake')v=+v;SAVE.opt[k]=v;persist();syncSettings();if(k==='vib'&&v)vibrate(60);if(k==='touch')layout();}));
$('resetBtn').addEventListener('click',()=>{if(confirm('Erase all progress and start over?')){const o=SAVE.opt;SAVE=JSON.parse(JSON.stringify(DEFAULT_SAVE));SAVE.opt=o;persist();showBanner('Save erased','',1);}});

// ===== Layout =====
function touchOn(){return SAVE.opt.touch==='on'||(SAVE.opt.touch==='auto'&&isTouch);}
function layout(){const vw=innerWidth,vh=innerHeight;const st=$('stage');const tOn=touchOn();
  const playing=(Game.mode==='play'||Game.mode==='arena'||Game.mode==='cut')&&!curScreen;
  const portrait=vh>vw*1.05;let s,left,top;
  if(portrait&&tOn){s=vw/480;left=0;top=Math.max(12,vh*0.30-270*s/2);}
  else{s=Math.min(vw/480,vh/270);left=(vw-480*s)/2;top=(vh-270*s)/2;}
  st.style.width=480*s+'px';st.style.height=270*s+'px';st.style.left=left+'px';st.style.top=top+'px';st.style.setProperty('--u',s+'px');
  document.documentElement.style.setProperty('--u',s+'px');
  $('touch').classList.toggle('on',tOn&&playing);
  const pb=$('pauseBtn');pb.style.left=(left+480*s-38)+'px';pb.style.top=(top+8)+'px';
  const rot=$('rotate');rot.style.display=portrait&&tOn&&playing?'block':'none';rot.style.top=(top+270*s+10)+'px';
  // button cluster
  const m=Math.min(1.15,Math.max(0.8,Math.min(vw,vh)/400));const sb=portrait?28:16;const r0=portrait?18:22;
  const place=(id,right,bottom,size)=>{const el=$(id);el.style.right=right*m+r0+'px';el.style.bottom=bottom*m+sb+'px';el.style.width=el.style.height=size*m+'px';el.style.fontSize=(size>70?13:11)*m+'px';};
  place('bAtk',70,0,80);place('bJmp',0,62,66);place('bSpc',84,92,58);place('bDsh',160,10,54);
  const jz=$('joyZone');jz.style.height=(portrait?vh-(top+270*s)-10:vh*0.7)+'px';if(window._joyHome)window._joyHome();
}
addEventListener('resize',layout);addEventListener('orientationchange',()=>setTimeout(layout,150));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(Game.mode==='play'||Game.mode==='arena')&&!Game.paused)togglePause();});
document.addEventListener('contextmenu',e=>e.preventDefault());

// ===== Boot =====
$('hudPort').style.backgroundImage=`url(${ASSETS.pKai})`;
makePortraits();show('s-start');layout();requestAnimationFrame(frame);
