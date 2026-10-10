'use strict';
// ===== Utils =====
let W=480;const H=270;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const rndi=(a,b)=>Math.floor(rnd(a,b+1));
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const $=id=>document.getElementById(id);
function loadImg(src){const i=new Image();i.src=src;return i;}
const IMG={};for(const k in ASSETS)IMG[k]=loadImg(ASSETS[k]);

// ===== Save / settings =====
const SAVE_KEY='skyfist_save_v1';
const DEFAULT_SAVE={unlocked:1,ranks:{},flowers:{},seenIntro:false,best:{},
  opt:{music:60,sfx:80,vib:1,shake:1,touch:'auto',diff:'normal'}};
let SAVE=JSON.parse(JSON.stringify(DEFAULT_SAVE));
try{const s=localStorage.getItem(SAVE_KEY);if(s){const o=JSON.parse(s);SAVE=Object.assign(SAVE,o);SAVE.opt=Object.assign({},DEFAULT_SAVE.opt,o.opt||{});}}catch(e){}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));}catch(e){}}
function vibrate(p){if(SAVE.opt.vib&&navigator.vibrate){try{navigator.vibrate(p);}catch(e){}}}

// ===== Input =====
const Input={ix:0,down:false,keys:{},held:{jump:false,atk:false,spc:false,dsh:false},
  pressed:{jump:0,atk:0,spc:0,dsh:0,pause:0,ok:0},joyX:0,joyActive:false};
function press(a){Input.pressed[a]=0.14;}
const KEYMAP={ArrowLeft:'L',KeyA:'L',ArrowRight:'R',KeyD:'R',ArrowDown:'D',KeyS:'D',
  Space:'jump',KeyW:'jump',ArrowUp:'jump',KeyZ:'jump',KeyJ:'atk',KeyX:'atk',KeyK:'spc',KeyC:'spc',KeyL:'dsh',ShiftLeft:'dsh',ShiftRight:'dsh'};
addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT')return;
  const k=KEYMAP[e.code];
  if(e.code==='Escape'||e.code==='KeyP'){Input.pressed.pause=0.2;e.preventDefault();return;}
  if(e.code==='Enter'||e.code==='Space'||e.code==='KeyJ')Input.pressed.ok=0.2;
  if(!k)return;
  e.preventDefault();
  if(e.repeat)return;
  Input.keys[k]=true;
  if(Input.held[k]!==undefined){Input.held[k]=true;press(k);}
});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(!k)return;Input.keys[k]=false;if(Input.held[k]!==undefined)Input.held[k]=false;});
addEventListener('blur',()=>{Input.keys={};for(const k in Input.held)Input.held[k]=false;});
function updateInputAxis(){
  let x=0;if(Input.keys.L)x-=1;if(Input.keys.R)x+=1;
  if(Input.joyActive)x=Input.joyX;
  Input.ix=x;Input.down=!!Input.keys.D;
}
function tickInput(dt){for(const k in Input.pressed)Input.pressed[k]=Math.max(0,Input.pressed[k]-dt);}
function consume(a){if(Input.pressed[a]>0){Input.pressed[a]=0;return true;}return false;}

// Touch controls
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
(function setupTouch(){
  const zone=$('joyZone'),joy=$('joy'),knob=$('knob');let jid=null,cx=0,cy=0;const R=48;
  function home(){const r=zone.getBoundingClientRect();joy.style.left=Math.min(110,r.width*0.4)+'px';joy.style.top=(r.height-90)+'px';knob.style.transform='';}
  window._joyHome=home;
  zone.addEventListener('pointerdown',e=>{e.preventDefault();if(jid!==null)return;jid=e.pointerId;zone.setPointerCapture(jid);
    const r=zone.getBoundingClientRect();cx=e.clientX-r.left;cy=e.clientY-r.top;joy.style.left=cx+'px';joy.style.top=cy+'px';Input.joyActive=true;Input.joyX=0;});
  zone.addEventListener('pointermove',e=>{if(e.pointerId!==jid)return;const r=zone.getBoundingClientRect();
    let dx=e.clientX-r.left-cx,dy=e.clientY-r.top-cy;const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d;}
    knob.style.transform=`translate(${dx}px,${dy}px)`;let v=dx/R;if(Math.abs(v)<0.18)v=0;Input.joyX=clamp(v*1.25,-1,1);Input.keys.D=dy/R>0.7;});
  const end=e=>{if(e.pointerId!==jid)return;jid=null;Input.joyActive=false;Input.joyX=0;Input.keys.D=false;home();};
  zone.addEventListener('pointerup',end);zone.addEventListener('pointercancel',end);
  const map={bAtk:'atk',bJmp:'jump',bSpc:'spc',bDsh:'dsh'};
  for(const id in map){const el=$(id),a=map[id];
    el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);el.classList.add('down');Input.held[a]=true;press(a);if(a==='atk'||a==='jump')Input.pressed.ok=0.2;vibrate(8);});
    const up=e=>{el.classList.remove('down');Input.held[a]=false;};
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);}
})();

// ===== Audio (synth chiptune) =====
const SND=(()=>{
  let ac=null,master,mus,sfx,nbuf;
  function init(){
    if(ac){if(ac.state==='suspended')ac.resume();return;}
    try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    master=ac.createGain();master.connect(ac.destination);
    const comp=ac.createDynamicsCompressor();comp.connect(master);
    mus=ac.createGain();mus.connect(comp);sfx=ac.createGain();sfx.connect(comp);
    nbuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    vol();
  }
  function vol(){if(!ac)return;mus.gain.value=(SAVE.opt.music/100)*0.32;sfx.gain.value=(SAVE.opt.sfx/100)*0.55;}
  function tone(f,dur,type,v,slide,when,dest){
    if(!ac)return;const t=(when||ac.currentTime);const o=ac.createOscillator(),g=ac.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.006);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(dest||sfx);o.start(t);o.stop(t+dur+0.02);
  }
  function noise(dur,v,ff,when,dest,ftype,slide){
    if(!ac)return;const t=(when||ac.currentTime);const s=ac.createBufferSource();s.buffer=nbuf;
    const f=ac.createBiquadFilter();f.type=ftype||'lowpass';f.frequency.setValueAtTime(ff,t);if(slide)f.frequency.exponentialRampToValueAtTime(slide,t+dur);
    const g=ac.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(dest||sfx);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);
  }
  const fx={
    punch(){noise(0.08,0.5,1800);tone(160,0.08,'square',0.25,60);},
    kick(){noise(0.12,0.6,1200);tone(120,0.14,'square',0.3,45);},
    hit(){noise(0.1,0.7,3000,0,0,'bandpass');tone(220,0.08,'sawtooth',0.2,80);},
    whiff(){noise(0.09,0.18,2500,0,0,'highpass',600);},
    jump(){tone(330,0.14,'square',0.15,660);},
    djump(){tone(440,0.16,'square',0.14,990);},
    land(){noise(0.06,0.25,500);},
    coin(){tone(988,0.06,'square',0.13);tone(1319,0.14,'square',0.13,null,ac&&ac.currentTime+0.06);},
    pick(){[523,659,784,1047].forEach((f,i)=>tone(f,0.1,'square',0.12,null,ac&&ac.currentTime+i*0.05));},
    hurt(){tone(300,0.25,'sawtooth',0.25,90);noise(0.15,0.4,900);},
    blast(){tone(200,0.4,'sawtooth',0.22,900);noise(0.35,0.3,3000,0,0,'bandpass',400);},
    superb(){tone(110,0.8,'sawtooth',0.3,880);tone(220,0.8,'square',0.15,1760);noise(0.7,0.4,4000,0,0,'bandpass',300);},
    boom(){noise(0.6,0.8,800,0,0,'lowpass',80);tone(90,0.5,'square',0.3,30);},
    dash(){noise(0.18,0.3,4000,0,0,'highpass',800);},
    select(){tone(660,0.06,'square',0.12);tone(880,0.08,'square',0.12,null,ac&&ac.currentTime+0.05);},
    blip(){tone(520,0.03,'square',0.05);},
    thunder(){noise(1.4,0.9,600,0,0,'lowpass',60);},
    roar(){tone(90,0.9,'sawtooth',0.35,55);noise(0.9,0.5,500,0,0,'bandpass',200);},
    ko(){[392,330,262,196].forEach((f,i)=>tone(f,0.25,'square',0.18,null,ac&&ac.currentTime+i*0.12));},
    win(){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,i==5?0.5:0.13,'square',0.16,null,ac&&ac.currentTime+i*0.11));},
    shoot(){tone(700,0.12,'square',0.1,300);},
    check(){[660,880,1320].forEach((f,i)=>tone(f,0.12,'triangle',0.2,null,ac&&ac.currentTime+i*0.08));},
  };
  function play(n){if(!ac)return;const f=fx[n];if(f)try{f();}catch(e){}}

  // ---- Music sequencer ----
  const SCALES={minor:[0,2,3,5,7,8,10],major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],phryg:[0,1,3,5,7,8,10],mixo:[0,2,4,5,7,9,10]};
  const SONGS={
    title:{bpm:118,root:57,scale:'minor',prog:[0,5,2,6],seed:11,lead:'square',drive:1},
    calm:{bpm:92,root:60,scale:'major',prog:[0,3,4,0],seed:4,lead:'triangle',drive:0},
    i1:{bpm:126,root:60,scale:'major',prog:[0,4,5,3],seed:21,lead:'square',drive:1},
    i2:{bpm:134,root:62,scale:'mixo',prog:[0,6,3,0],seed:32,lead:'square',drive:1},
    i3:{bpm:140,root:52,scale:'phryg',prog:[0,1,0,6],seed:43,lead:'sawtooth',drive:2},
    i4:{bpm:122,root:63,scale:'dorian',prog:[0,3,6,4],seed:54,lead:'triangle',drive:1},
    i5:{bpm:128,root:55,scale:'minor',prog:[0,6,5,4],seed:65,lead:'square',drive:1},
    i6:{bpm:136,root:50,scale:'minor',prog:[0,1,5,4],seed:76,lead:'sawtooth',drive:2},
    i7:{bpm:144,root:58,scale:'major',prog:[0,5,3,4],seed:87,lead:'square',drive:2},
    boss:{bpm:158,root:52,scale:'minor',prog:[0,5,6,4],seed:99,lead:'sawtooth',drive:2},
    final:{bpm:164,root:50,scale:'phryg',prog:[0,1,6,0],seed:111,lead:'sawtooth',drive:2},
    ending:{bpm:84,root:60,scale:'major',prog:[0,5,3,4],seed:7,lead:'triangle',drive:0},
  };
  let cur=null,timer=null,step=0,nextT=0,pat=null;
  function midi(n){return 440*Math.pow(2,(n-69)/12);}
  function build(s){
    const r=mulberry(s.seed),sc=SCALES[s.scale];
    const note=(deg,oct)=>{const o=Math.floor(deg/7);const d=((deg%7)+7)%7;return s.root+sc[d]+12*(o+oct);};
    // two motifs (16 steps each) of scale-degree offsets relative to chord root
    const motif=()=>{const m=[];let last=0;for(let i=0;i<16;i++){
      const strong=i%4===0;const play=strong?r()<0.9:r()<0.45;
      if(!play){m.push(null);continue;}
      let d=strong?[0,2,4][Math.floor(r()*3)]:last+Math.floor(r()*5)-2; d=clamp(d,-2,9); last=d;m.push(d);}return m;};
    const A=motif(),B=motif();
    return {note,form:[A,A,B,A],sc};
  }
  function schedule(){
    if(!ac||!cur)return;const s=SONGS[cur];const sp=60/s.bpm/4;
    while(nextT<ac.currentTime+0.15){
      const bar=Math.floor(step/16)%s.prog.length, i=step%16, ch=s.prog[bar];
      const t=nextT;
      // bass
      const bp=s.drive===2?[1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1]:s.drive===1?[1,0,0,1,1,0,1,0,1,0,0,1,1,0,1,0]:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0];
      if(bp[i]){const oct=(i%8===2||i%8===6)&&s.drive?1:0;tone(midi(pat.note(ch,-2)+12*oct),sp*(s.drive?0.9:3),'triangle',0.5,null,t,mus);}
      // arp
      if(s.drive>0||i%2===0){const ar=[0,2,4,7][(i>>(s.drive?0:1))%4];tone(midi(pat.note(ch+ar,0)),sp*0.8,'square',0.05,null,t,mus);}
      // lead
      const m=pat.form[Math.floor(step/16)%4];const d=m[i];
      if(d!==null&&!(s.drive===0&&i%2)){tone(midi(pat.note(ch+d,1)),sp*(s.drive?1.6:3),s.lead,s.lead==='sawtooth'?0.07:0.11,null,t,mus);}
      // drums
      if(s.drive>0){
        if(i%8===0||(s.drive===2&&i%8===6))tone(150,0.12,'sine',0.7,40,t,mus);
        if(i%8===4)noise(0.12,0.35,2500,t,mus,'bandpass');
        if(i%2===0)noise(0.03,0.08,9000,t,mus,'highpass');
      }else if(i%8===0)noise(0.05,0.05,6000,t,mus,'highpass');
      nextT+=sp;step++;
    }
  }
  function music(name){
    if(!ac)return;if(cur===name)return;cur=name;step=0;nextT=ac.currentTime+0.06;
    if(!name){return;}pat=build(SONGS[name]);
    if(!timer)timer=setInterval(schedule,40);
  }
  return {init,play,music,vol,get ready(){return !!ac;}};
})();
