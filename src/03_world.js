// ===== Island + champion data =====
const ISLANDS=[
 {name:'Grass Island',desc:'Peaceful village. Where Kai and Lina live.',sky:['#4FA6EE','#9CD6FF','#E6F6FF'],top:'#5BC236',topHi:'#A6EA62',dirt:'#7A4E2D',dirt2:'#5E3A20',enemies:['slime','goblin'],boss:'bruno',props:['tree','bush','flower','rock','tree','flower'],weather:'petal',song:'i1',haze:'#dff1ff'},
 {name:'Wind Island',desc:'Strong winds and floating platforms.',sky:['#3561CC','#86ADEE','#DCE9FF'],top:'#7ED957',topHi:'#C1F59A',dirt:'#8A6A4A',dirt2:'#6a4e34',enemies:['bird','wolf','goblin'],boss:'gale',props:['windmill','bush','banner','rock','flower'],weather:'wind',song:'i2',haze:'#d8e6ff',moving:true},
 {name:'Fire Island',desc:'Volcano, lava and fire enemies.',sky:['#1E070C','#7A1A10','#E8582A'],top:'#4A3030',topHi:'#FF8A2A',dirt:'#3B2522',dirt2:'#2a1816',enemies:['fireel','bat','skeleton'],boss:'blaze',props:['lavarock','torch','deadtree','lavarock'],weather:'ember',song:'i3',haze:'#ff9a5a',lava:true},
 {name:'Water Island',desc:'Waterfalls and ancient ruins.',sky:['#2270C6','#74BFEF','#CDEFFF'],top:'#4CC28B',topHi:'#9BF0C2',dirt:'#5D6B7A',dirt2:'#46525e',enemies:['turtle','bird','skeleton'],boss:'coral',props:['column','bush','column','fall','tree'],weather:'mist',song:'i4',haze:'#d4f2ff',moving:true},
 {name:'Earth Island',desc:'Rocky cliffs and earth guardians.',sky:['#5E93C0','#AFCDBD','#E8DCB2'],top:'#6E9E3A',topHi:'#A9D063',dirt:'#8B6A44',dirt2:'#6c5032',enemies:['golemE','orc','wolf'],boss:'rocco',props:['crystal','rock','pillar','tree','rock'],weather:'leaf',song:'i5',haze:'#efe6c6'},
 {name:'Shadow Island',desc:'Dark and mysterious, with shadow beasts.',sky:['#0A0418','#25103F','#4E1C6E'],top:'#4A2C6E',topHi:'#B067F0',dirt:'#24163A',dirt2:'#170d27',enemies:['ninja','bat','wolf'],boss:'ren',props:['deadtree','mushroom','mushroom','rock'],weather:'wisp',song:'i6',haze:'#7a3fb0',shadow:true},
 {name:'Sky Castle',desc:"Home of King Gorrak. The final battle.",sky:['#5AA4FF','#BFE0FF','#FFF1D2'],top:'#DCD6C8',topHi:'#FFFFFF',dirt:'#9F98A8',dirt2:'#837c8e',enemies:['ogre','orc','skeleton','ninja'],boss:'gorrak',props:['statue','banner','column','banner'],weather:'spark',song:'i7',haze:'#fff4dc',moving:true},
];
const CHAMPS={
 bruno:{name:'Bruno',def:'bruno',hp:30,spd:75,think:0.75,moves:{jab:3,charge:2,leap:2},proj:null,col:'#8A5A30',
   pre:"Gorrak pays me in honey to stop you, little man!",post:"Oof... you hit hard. Gorrak flew up to Wind Island. Go!"},
 gale:{name:'Gale',def:'gale',hp:34,spd:120,think:0.7,moves:{jab:2,charge:2,shoot:3},proj:'wind',col:'#1E9C8E',
   pre:"Nobody gets past the wind. Nobody!",post:"You're faster than the wind... Lina was brave when they passed. Hurry."},
 blaze:{name:'Blaze',def:'blaze',hp:38,spd:95,think:0.65,moves:{jab:2,leap:2,shoot:3},proj:'fire',col:'#F07A1E',
   pre:"Your fire is weak. Let me show you real fire!",post:"Your spirit burns bright. Gorrak is still climbing. Keep going."},
 coral:{name:'Coral',def:'coral',hp:42,spd:95,think:0.62,moves:{jab:2,shoot:3,leap:2},proj:'wave',col:'#2BB5C8',
   pre:"The tide says turn back, fighter.",post:"The tide is with you now. Lina sang as she passed. She believes in you."},
 rocco:{name:'Rocco',def:'rocco',hp:50,spd:60,think:0.7,moves:{jab:2,leap:3,shoot:2},proj:'rock',col:'#8C8578',
   pre:"ROCCO... SMASH... YOU.",post:"Rocco... sorry. Gorrak is mean. Go save her."},
 ren:{name:'Ren',def:'ren',hp:52,spd:130,think:0.5,moves:{jab:3,teleport:2,shoot:2,charge:1},proj:'shadow',col:'#8A4FD0',
   pre:"I'm the one who'll beat Gorrak. Not you! Out of my way!",post:"I'm not your enemy... Gorrak took my home too. Go. Win this for both of us."},
 gorrak:{name:'King Gorrak',def:'gorrak',hp:90,spd:85,think:0.6,moves:{jab:3,charge:2,leap:2,shoot:2,summon:1},proj:'quake',col:'#5B3C8C',
   pre:"So you made it, little fighter. Hahaha! Let's see what you've got!",post:"No... NOOO! Beaten by a little fighter..."},
};
const ETYPES={
 slime:{w:14,h:11,hp:3,draw:drawSlime,ai:'hopper',dmg:1},
 goblin:{w:11,h:26,hp:4,def:'goblin',ai:'brawler',spd:55,dmg:1,reach:16,wind:0.4},
 wolf:{w:22,h:13,hp:4,draw:drawWolf,ai:'lunger',spd:55,dmg:1},
 bird:{w:14,h:10,hp:2,draw:drawBird,ai:'flyer',dmg:1,fly:true},
 bat:{w:12,h:9,hp:2,draw:drawBat,ai:'flyer',dmg:1,fly:true,erratic:true},
 skeleton:{w:11,h:32,hp:4,def:'skeleton',ai:'thrower',spd:38,dmg:1,proj:'bone'},
 orc:{w:15,h:39,hp:7,def:'orc',ai:'brawler',spd:45,dmg:2,reach:20,wind:0.55,heavy:true},
 ninja:{w:11,h:34,hp:4,def:'ninja',ai:'ninja',spd:80,dmg:1,reach:14,wind:0.3,proj:'shuriken'},
 turtle:{w:20,h:12,hp:5,draw:drawTurtle,ai:'spinner',spd:22,dmg:1},
 golemE:{w:19,h:44,hp:10,def:'golemE',ai:'slammer',spd:30,dmg:2,heavy:true},
 fireel:{w:14,h:22,hp:4,draw:drawFireEl,ai:'caster',dmg:1,fly:true,proj:'fire'},
 ogre:{w:21,h:52,hp:12,def:'ogre',ai:'slammer',spd:34,dmg:2,heavy:true},
};

// ===== World =====
let world=null;
const GRAV=950;
function newWorld(n,arena){return{n,isl:ISLANDS[n-1],ground:[],plats:[],ents:[],projs:[],parts:[],pickups:[],props:[],flags:[],len:480,arena:!!arena,wallL:-1e9,wallR:1e9,zone:null,gate:null,bg:getBG(n),t:0};}

// ===== Backgrounds =====
const BGCACHE={};
function circ(cx,cy,r,c){for(let y=-r;y<=r;y++){const w=Math.round(Math.sqrt(r*r-y*y)*2);R(Math.round(cx-w/2),Math.round(cy+y),w,1,c);}}
function puff(x,y,w,base,lo,hi,r){const n=Math.max(3,Math.round(w/14));const pts=[];
  for(let i=0;i<n;i++){const t=i/(n-1);pts.push([x+t*w,y-Math.sin(t*PI)*w*0.16-r()*4,w*0.13+Math.sin(t*PI)*w*0.12+r()*3]);}
  for(const[px,py,pr]of pts)circ(px,py+3,pr,lo);for(const[px,py,pr]of pts)circ(px,py,pr,base);for(const[px,py,pr]of pts)circ(px-pr*0.25,py-pr*0.35,pr*0.55,hi);
  R(x-2,y,w+4,w*0.12,base);}
function isle(x,y,w,h,P,r,o){o=o||{};
  // underside rock
  for(let row=0;row<h;row++){const t=row/h;let ww=w*Math.pow(1-t,1.25);if(ww<1)break;const j=Math.sin(row*0.9+x)*1.2;const x0=x-ww/2+j;
    R(x0,y+row,ww,1,shade(P.rock,1-t*0.3));R(x0,y+row,Math.max(1,ww*0.22),1,shade(P.rock,1.18-t*0.3));R(x0+ww*0.74,y+row,ww*0.26,1,shade(P.rock,0.78-t*0.2));
    if(row%5===0&&row>2)R(x0+ww*0.2,y+row,ww*0.6,1,shade(P.rock,0.86-t*0.2));}
  const sp=Math.max(1,Math.floor(w/26));for(let i=0;i<sp;i++){const sx=x-w*0.3+r()*w*0.6,sl=h*0.25+r()*h*0.35;for(let k=0;k<sl;k++)R(sx-(1-k/sl)*2,y+h*0.45+k,(1-k/sl)*4+1,1,shade(P.rock,0.8));}
  // grass cap
  R(x-w/2-1,y-2,w+2,5,P.top);R(x-w/2,y-3,w,1,P.topHi);
  for(let i=0;i<w;i+=5){const bh=1+((i*7+x)|0)%3;R(x-w/2+i,y-2-bh,4,bh,P.top);R(x-w/2+i,y-2-bh,3,1,P.topHi);}
  for(let i=0;i<w;i+=3)R(x-w/2+i,y+3,2,1+((i*13)|0)%3,P.top);
  if(o.trees){const tn=Math.floor(w/24);for(let i=0;i<tn;i++){const tx=x-w/2+10+i*22+r()*8,th=6+r()*6;R(tx-1,y-th,2,th,shade(P.rock,0.7));circ(tx,y-th-3,4+r()*2,shade(P.top,0.75));circ(tx-1,y-th-4,3,P.top);R(tx-2,y-th-6,2,1,P.topHi);}}
  if(o.house&&w>60){const hx=x-8+r()*16;R(hx-6,y-9,12,8,P.wall);for(let i=0;i<5;i++)R(hx-3-i*1.2,y-15+i,6+i*2.4,1,P.roof);R(hx+1,y-6,2,2,'#ffe9a0');}
  if(o.fall&&r()<0.7){const wx=x-w*0.25+r()*w*0.5;const fl=h*0.8+20;for(let i=0;i<fl;i++){const a=1-i/fl;G.globalAlpha=0.65*a;R(wx,y+2+i,3,1,'#e6f6ff');R(wx+1,y+2+i,1,1,'#ffffff');}G.globalAlpha=1;}
}
function getBG(n){if(BGCACHE[n])return BGCACHE[n];const I=ISLANDS[n-1];const prev=G;const r=mulberry(n*91);
  const hz=I.sky[2],mid=I.sky[1];
  const P=t=>({top:mixHex(I.top,mid,t),topHi:mixHex(I.topHi,mid,t),rock:mixHex(I.dirt,mid,t),wall:mixHex('#d9c7a6',mid,t),roof:mixHex(I.shadow?'#5a2a8a':'#c0392b',mid,t)});
  const mk=()=>{const c=document.createElement('canvas');c.width=960;c.height=H;G=c.getContext('2d');return c;};
  // far: soft range of hills / mountains
  const far=mk();const fc=mixHex(hz,I.sky[0],0.28),fc2=mixHex(hz,I.dirt,0.25);
  for(let x=0;x<960;x++){const h=40+Math.sin(x/960*PI*4)*14+Math.sin(x/960*PI*10+n)*7+Math.sin(x/960*PI*22)*3;R(x,H-80-h,1,h+80,fc);}
  for(let x=0;x<960;x++){const h=24+Math.sin(x/960*PI*6+2)*10+Math.sin(x/960*PI*14+n*2)*5;R(x,H-60-h,1,h+60,fc2);}
  // mid: hazy floating islands
  const midc=mk();const Pm=P(0.55);for(let i=0;i<6;i++){isle(i*160+40+r()*60,70+r()*70,36+r()*44,22+r()*20,Pm,r,{trees:true,fall:n===4||n===2});}
  // near: bigger, clearer islands
  const near=mk();const Pn=P(0.28);for(let i=0;i<3;i++){isle(i*320+80+r()*120,120+r()*60,70+r()*60,40+r()*26,Pn,r,{trees:n!==6&&n!==3,house:n===1||n===4||n===7,fall:n!==3&&n!==6});}
  // clouds (upper sky)
  const cl=mk();const cB=I.shadow?'#3a1f5a':n===3?'#6a2418':'#ffffff',cL=I.shadow?'#26123e':n===3?'#4a160f':mixHex('#ffffff',I.sky[1],0.35),cH=I.shadow?'#5a3a80':n===3?'#a0402a':'#ffffff';
  for(let i=0;i<7;i++)puff(r()*900,30+r()*90,40+r()*60,mixHex(cB,mid,0.15),mixHex(cL,mid,0.2),cH,r);
  // cloud sea along the bottom
  const sea=mk();const sB=I.shadow?'#2c1646':n===3?'#5a1c12':mixHex('#ffffff',hz,0.25),sL=I.shadow?'#1c0d30':n===3?'#3a0f0a':mixHex('#ffffff',I.sky[1],0.5),sH=I.shadow?'#4a2a70':n===3?'#8a3420':'#ffffff';
  for(let i=0;i<16;i++)puff(i*62-20+r()*20,H-22-r()*14,70+r()*30,sB,sL,sH,r);R(0,H-14,960,14,sB);
  // sheet art, softly masked
  let art=null;const img=IMG['isl'+n];
  if(img&&img.complete&&img.naturalWidth){art=document.createElement('canvas');art.width=img.naturalWidth;art.height=img.naturalHeight;const c=art.getContext('2d');
    c.drawImage(img,0,0);c.globalCompositeOperation='destination-in';const gw=art.width,gh=art.height;
    c.save();c.translate(gw/2,gh*0.42);c.scale(1,gh/gw);const gr=c.createRadialGradient(0,0,gw*0.05,0,0,gw*0.5);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(0.55,'rgba(0,0,0,.85)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(-gw,-gw,gw*2,gw*2);c.restore();}
  // ground soil pattern
  const pc=document.createElement('canvas');pc.width=32;pc.height=32;G=pc.getContext('2d');R(0,0,32,32,I.dirt);
  const pr=mulberry(n*7);for(let i=0;i<26;i++){const x=pr()*32|0,y=pr()*32|0;R(x,y,pr()<0.5?2:1,1,I.dirt2);}
  for(let i=0;i<4;i++){const x=pr()*27|0,y=pr()*28|0,w=3+(pr()*3|0);R(x,y,w,3,shade(I.dirt,0.8));R(x,y,w,1,shade(I.dirt,1.2));}
  if(I.lava)for(let i=0;i<4;i++)R(pr()*30|0,pr()*30|0,2,1,'#d0501a');
  if(I.shadow)for(let i=0;i<4;i++)R(pr()*30|0,pr()*30|0,1,1,'#a35ae8');
  G=prev;const pat=ctx.createPattern(pc,'repeat');
  const out={far,mid:midc,near,cl,sea,art,pat};if(art)BGCACHE[n]=out;return out;
}
function drawSky(I,camX,t){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,I.sky[0]);g.addColorStop(0.55,I.sky[1]);g.addColorStop(1,I.sky[2]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const sunC=I.shadow?'rgba(200,140,255,':Game.n===3||I===ISLANDS[2]?'rgba(255,170,90,':'rgba(255,250,220,';
  const sx=360-camX*0.01,sy=I.shadow?60:52;const sg=ctx.createRadialGradient(sx,sy,2,sx,sy,90);sg.addColorStop(0,sunC+'.9)');sg.addColorStop(0.15,sunC+'.5)');sg.addColorStop(1,sunC+'0)');ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
  if(I.shadow){ctx.fillStyle='#efe6ff';ctx.beginPath();ctx.arc(sx,sy,9,0,PI*2);ctx.fill();ctx.fillStyle=I.sky[1];ctx.beginPath();ctx.arc(sx+4,sy-2,8,0,PI*2);ctx.fill();}
  const bg=world.bg;
  const tile=(c,par,drift,yo)=>{const x=-(((camX*par+t*(drift||0))%960)+960)%960;ctx.drawImage(c,Math.round(x),yo||0);ctx.drawImage(c,Math.round(x)+960,yo||0);};
  tile(bg.far,0.04,0);
  if(bg.art){const ax=Math.round((world.arena?360:330+W-480)-camX*0.06);ctx.globalAlpha=0.6;ctx.drawImage(bg.art,ax,0);ctx.globalAlpha=1;}
  tile(bg.cl,0.08,3);tile(bg.mid,0.14,0);tile(bg.near,0.26,0);tile(bg.sea,0.4,6,10);
}

// ===== Props =====
function drawProp(p,I,t){G=ctx;const x=p.x,y=p.y;const ol='#0b0f24';
 switch(p.k){
 case'tree':{const c=I.top,c2=shade(I.top,0.7),c3=shade(I.top,0.55);R(x-2,y-16,4,16,'#5a3a20');R(x-2,y-16,1,16,'#7a5230');R(x-4,y-2,8,2,'#4a2e18');
   circ(x+3,y-22,9,c3);circ(x-4,y-24,9,c2);circ(x+2,y-30,9,c2);circ(x-3,y-27,7,c);circ(x+3,y-32,6,c);circ(x-5,y-30,3,I.topHi);R(x-2,y-36,3,1,I.topHi);break;}
 case'bush':circ(x+4,y-4,5,shade(I.top,0.6));circ(x-3,y-5,6,shade(I.top,0.75));circ(x-2,y-6,4,I.top);R(x-5,y-9,3,1,I.topHi);break;
 case'flower':{const cs=['#FF6B8A','#FFE04A','#ffffff','#9b7bff'];const c=cs[(x|0)%4];R(x,y-6,1,6,'#3a8a2a');R(x-1,y-8,3,3,c);R(x,y-7,1,1,'#F5B83D');break;}
 case'rock':circ(x+1,y-3,5,shade(I.dirt,0.75));circ(x-2,y-4,5,shade(I.dirt,1.05));R(x-5,y-8,4,1,shade(I.dirt,1.45));R(x-7,y-1,15,1,shade(I.dirt,0.6));break;
 case'hut':{R(x-18,y-22,36,22,'#9a6a3a');R(x-18,y-22,36,2,'#7a4a20');R(x-4,y-12,8,12,'#4a2a10');R(x+8,y-16,6,5,'#ffe9a0');
   for(let i=0;i<12;i++){const w=6+i*3.4;R(x-w/2,y-34+i,w,1,i%3===0?'#d94a3a':'#c0392b');}R(x-22,y-23,44,2,'#8a2a1f');break;}
 case'windmill':{R(x-4,y-40,8,40,'#d9cbb0');R(x-4,y-40,8,2,'#a08a6a');R(x-1,y-10,3,10,'#6a4a2a');const a=t*2.5;
   for(let i=0;i<4;i++){const an=a+i*PI/2;seg(x,y-38,x+Math.cos(an)*16,y-38+Math.sin(an)*16,2,'#f4ecd8');}R(x-1,y-39,3,3,'#6a4a2a');break;}
 case'banner':{R(x,y-34,2,34,'#4a3a2a');const w=Math.sin(t*4+x)*2;for(let i=0;i<10;i++)R(x+2,y-33+i,10+Math.sin(t*5+i*0.6)*1.5,1,i<8?(I.shadow?'#7a3fb0':'#E0362C'):'#F5B83D');break;}
 case'torch':{R(x-1,y-16,3,16,'#4a2a1a');const f=Math.sin(t*20+x)*1.5;R(x-2,y-22-f,5,6+f,'#FF7A1A');R(x-1,y-21-f,3,4,'#FFE07A');break;}
 case'lavarock':{R(x-8,y-7,16,7,'#2a1a18');R(x-6,y-10,10,4,'#3a2622');R(x-4,y-5,6,1,'#ff6a1a');R(x+2,y-8,1,3,'#ff9a3a');break;}
 case'deadtree':{const c=I.shadow?'#2a1840':'#2a1a14';R(x-2,y-26,3,26,c);seg(x,y-18,x+8,y-26,2,c);seg(x,y-14,x-7,y-22,2,c);seg(x+6,y-24,x+10,y-23,1,c);break;}
 case'mushroom':{const gl=0.6+Math.sin(t*3+x)*0.4;R(x-1,y-6,3,6,'#d8c8f0');G.globalAlpha=gl*0.35;R(x-8,y-14,16,10,'#C063FF');G.globalAlpha=1;R(x-5,y-10,10,4,'#9b3fe0');R(x-3,y-11,6,1,'#c98aff');R(x-3,y-9,1,1,'#fff');break;}
 case'column':R(x-5,y-40,10,40,'#e8e2d4');R(x-7,y-42,14,3,'#cfc8b8');R(x-7,y-3,14,3,'#cfc8b8');R(x-3,y-38,1,35,'#cfc8b8');R(x+2,y-38,1,35,'#f8f4ea');break;
 case'fall':{for(let i=0;i<5;i++){const yy=((t*60+i*13)%60);R(x-4+i*2,y-60+yy,2,6,'rgba(220,245,255,.7)');}R(x-6,y-60,12,60,'rgba(140,210,255,.35)');R(x-8,y-3,16,3,'rgba(255,255,255,.6)');break;}
 case'crystal':{R(x-3,y-14,6,14,'#7fd0ff');R(x-1,y-18,3,4,'#bfe9ff');R(x+3,y-9,4,9,'#4fa0e0');R(x-2,y-12,1,8,'#e0f6ff');break;}
 case'pillar':R(x-6,y-30,12,30,shade(I.dirt,1.1));R(x-6,y-30,12,2,I.top);R(x-2,y-26,2,20,shade(I.dirt,0.8));break;
 case'statue':{R(x-8,y-6,16,6,'#b9b2a4');R(x-6,y-28,12,22,'#cfc8ba');R(x-5,y-36,10,9,'#cfc8ba');R(x-4,y-40,8,4,'#F2B33D');R(x+1,y-32,2,1,'#6a6050');break;}
 }
}

// ===== Level generation =====
function genLevel(n){
  const w=newWorld(n,false);world=w;const I=w.isl;const r=mulberry(n*1013+7);
  const len=2500+n*260;w.len=len;
  const G0=210;
  w.ground.push({x:-300,w:720,y:G0});
  let x=420,y=G0;let zoneDone=false;const zoneAt=len*0.52;let cps=[len*0.3,len*0.72];
  const gapMax=Math.min(84,58+n*4);
  const enemyAt=(sx,sw,sy,cnt)=>{for(let i=0;i<cnt;i++){const ex=sx+30+r()*(sw-60);const types=I.enemies;const tp=types[Math.floor(r()*types.length)];
      const T=ETYPES[tp];w.ents.push(makeEnemy(tp,ex,T.fly?sy-60-r()*30:sy));}};
  while(x<len-520){
    // zone
    if(!zoneDone&&x>zoneAt){const zw=480;w.ground.push({x,w:zw+40,y});w.zone={x:x,y,w:zw,started:false,done:false,wave:0};
      w.props.push({k:'banner',x:x+10,y},{k:'banner',x:x+zw-10,y});x+=zw+40;zoneDone=true;continue;}
    // gap
    let gap=36+r()*(gapMax-36);
    const useMover=I.moving&&r()<0.35;
    if(useMover)gap=120+r()*40;
    const ny=clamp(y+Math.round((r()-0.5)*60),168,228);
    if(useMover){w.plats.push({x:x+gap/2-22,y:Math.min(y,ny)-6,w:44,cx:x+gap/2,amp:(gap-44)/2-6,sp:0.9+r()*0.5,ph:r()*6,mov:true,dx:0});}
    else if(gap>64){w.plats.push({x:x+gap/2-18,y:Math.min(y,ny)-34,w:36});}
    x+=gap;y=ny;
    const sw=170+r()*230;w.ground.push({x,w:sw,y});
    // props
    for(let px=x+12;px<x+sw-12;px+=18+r()*40){if(r()<0.55)w.props.push({k:I.props[Math.floor(r()*I.props.length)],x:px|0,y});}
    // platforms + coins
    if(r()<0.65){const pw=46+r()*40,px=x+20+r()*(sw-pw-40),py=y-52-r()*22;w.plats.push({x:px,y:py,w:pw});
      for(let c=0;c<Math.floor(pw/14);c++)w.pickups.push(mkPick('coin',px+8+c*14,py-10));
      if(r()<0.25)w.pickups.push(mkPick(r()<0.5?'orb':'gem',px+pw/2,py-24));}
    else{for(let c=0;c<4;c++)w.pickups.push(mkPick('coin',x+sw/2-21+c*14,y-14-Math.sin(c/3*PI)*12));}
    // checkpoint
    if(cps.length&&x>cps[0]){w.flags.push({x:x+sw/2,y,on:false,raise:0});cps.shift();}
    // enemies
    if(x>520){const cnt=sw>300?2:1+(r()<0.3+n*0.05?1:0);enemyAt(x,sw,y,Math.min(cnt+(n>4&&r()<0.4?1:0),3));}
    if(r()<0.18)w.pickups.push(mkPick('heart',x+sw*0.7,y-16));
    if(r()<0.1)w.pickups.push(mkPick('star',x+sw*0.4,y-40));
    x+=sw;
  }
  // final stretch + gate
  x+=50;w.ground.push({x,w:700,y:200});w.props.push({k:'banner',x:x+200,y:200},{k:'banner',x:x+430,y:200});
  w.gate={x:x+380,y:200};w.len=x+600;
  // Lina's flower: on the highest platform in the middle
  let best=null;for(const p of w.plats)if(!p.mov&&p.x>len*0.25&&p.x<len*0.85&&(!best||p.y<best.y))best=p;
  if(best)w.pickups.push(mkPick('flower',best.x+best.w/2,best.y-14));
  // start village bits on island 1
  if(n===1){w.props.push({k:'hut',x:60,y:G0},{k:'tree',x:140,y:G0},{k:'hut',x:230,y:G0});}
  w.start={x:40,y:G0};
  return w;
}
function genArena(n){const w=newWorld(n,true);w.ground.push({x:-300,w:1080,y:228});w.wallL=16;w.wallR=464;w.len=480;
  const I=w.isl;const pr=I.props;w.props.push({k:pr[0],x:40,y:228},{k:pr[1%pr.length],x:440,y:228},{k:'banner',x:6,y:228},{k:'banner',x:470,y:228},{k:pr[2%pr.length],x:-40,y:228},{k:pr[0],x:530,y:228});w.start={x:110,y:228};return w;}
function genIntro(){const w=newWorld(1,true);w.ground.push({x:-300,w:1080,y:222});w.wallL=-150;w.wallR=630;w.len=480;
  w.props.push({k:'hut',x:40,y:222},{k:'tree',x:100,y:222},{k:'flower',x:130,y:222},{k:'flower',x:160,y:222},{k:'bush',x:200,y:222},{k:'hut',x:300,y:222},{k:'tree',x:380,y:222},{k:'flower',x:420,y:222},{k:'bush',x:450,y:222});return w;}

// ===== Pickups =====
function mkPick(type,x,y){return{type,x,y,t:Math.random()*6,dead:false,vy:0,baseY:y};}
function drawPick(p){const y=Math.round(p.y+Math.sin(p.t*4)*2),x=Math.round(p.x);
  switch(p.type){
  case'coin':{const w=Math.abs(Math.cos(p.t*3))*5+1;R(x-w/2-1,y-4,w+2,8,'#6a4500');R(x-w/2,y-3,w,6,'#F5B83D');R(x-w/2,y-3,Math.max(1,w/3),6,'#FFE89A');break;}
  case'heart':R(x-5,y-3,4,3,'#000');R(x+1,y-3,4,3,'#000');R(x-6,y-2,12,4,'#000');R(x-4,y+2,8,2,'#000');R(x-2,y+4,4,2,'#000');
    R(x-4,y-2,3,2,'#ff4a5a');R(x+1,y-2,3,2,'#ff4a5a');R(x-5,y-1,10,3,'#ff4a5a');R(x-3,y+2,6,1,'#ff4a5a');R(x-1,y+3,2,1,'#ff4a5a');R(x-4,y-2,1,1,'#fff');break;
  case'orb':{const g=Math.sin(p.t*6)*1;R(x-5-g,y-5-g,10+g*2,10+g*2,'rgba(61,125,255,.35)');R(x-4,y-4,8,8,'#3d7dff');R(x-3,y-3,4,4,'#bfe0ff');break;}
  case'star':{const c=Math.floor(p.t*8)%2?'#FFE04A':'#ffffff';R(x-1,y-6,3,12,c);R(x-6,y-1,12,3,c);R(x-3,y-3,7,7,c);R(x-1,y-1,3,3,'#F5B83D');break;}
  case'gem':R(x-4,y-3,8,6,'#0b2a6a');R(x-3,y-3,6,5,'#4a8aff');R(x-2,y+2,4,2,'#2a5ad0');R(x-2,y-2,2,2,'#cfe2ff');break;
  case'flower':{const gl=0.5+Math.sin(p.t*3)*0.3;G.globalAlpha=gl;R(x-8,y-8,16,16,'rgba(255,240,180,.5)');G.globalAlpha=1;
    R(x-1,y,2,7,'#3a8a2a');R(x-4,y-5,3,3,'#fff');R(x+1,y-5,3,3,'#fff');R(x-4,y-1,3,3,'#fff');R(x+1,y-1,3,3,'#fff');R(x-1,y-3,2,2,'#F5B83D');break;}
  }}

// ===== Particles =====
function part(type,x,y,o){world.parts.push(Object.assign({type,x,y,vx:0,vy:0,life:0.5,max:0.5,col:'#fff',size:2,grav:0},o||{}));}
function dust(x,y,n,dir){for(let i=0;i<(n||5);i++)part('dust',x+rnd(-4,4),y-1,{vx:rnd(-30,30)+(dir||0)*40,vy:rnd(-25,-5),life:rnd(0.25,0.45),max:0.45,size:rnd(2,4),col:world.isl.shadow?'#8a6aa8':'#e8e0d0'});}
function sparks(x,y,col,n){for(let i=0;i<(n||8);i++){const a=rnd(0,PI*2),s=rnd(60,170);part('spark',x,y,{vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(0.15,0.3),max:0.3,col:col||'#fff'});}
  part('ring',x,y,{life:0.18,max:0.18,size:4,col:col||'#fff'});}
function popup(x,y,txt,col){part('num',x,y,{vy:-50,life:0.7,max:0.7,txt:String(txt),col:col||'#fff'});}
function drawParts(dt){for(const p of world.parts){
  const a=clamp(p.life/p.max,0,1);
  switch(p.type){
  case'dust':G.globalAlpha=a*0.8;R(p.x-p.size/2,p.y-p.size/2,p.size*(1.6-a*0.6),p.size*(1.6-a*0.6),p.col);G.globalAlpha=1;break;
  case'spark':seg(p.x,p.y,p.x-p.vx*0.04,p.y-p.vy*0.04,1,p.col);break;
  case'ring':{const r=p.size+(1-a)*18;G.globalAlpha=a;G.strokeStyle=p.col;G.lineWidth=2;G.beginPath();G.arc(p.x,p.y,r,0,PI*2);G.stroke();G.globalAlpha=1;break;}
  case'num':drawNum(p.txt,p.x,Math.round(p.y),p.col,1);break;
  case'bit':R(p.x,p.y,p.size,p.size,p.col);break;
  case'glow':G.globalAlpha=a*0.6;R(p.x-p.size/2,p.y-p.size/2,p.size,p.size,p.col);G.globalAlpha=1;break;
  case'after':G.globalAlpha=a*0.5;FLASH=true;FLASHCOL='#7fd0ff';if(p.fig){const prev=p.fig;drawFig(prev.d,prev.p,p.x,p.y,prev.f,{t:0});}FLASH=false;FLASHCOL='#fff';G.globalAlpha=1;break;
  case'swoosh':{const pr=1-a;const s0=p.a0+(p.a1-p.a0)*Math.max(0,pr-0.25),s1=p.a0+(p.a1-p.a0)*Math.min(1,pr*1.6+0.2);const A=v=>p.f>0?v:PI-v;
    G.lineCap='round';G.strokeStyle=`rgba(${p.col},${a*0.9})`;G.lineWidth=3;G.beginPath();if(p.f>0)G.arc(p.x,p.y,p.r,s0,s1);else G.arc(p.x,p.y,p.r,A(s1),A(s0));G.stroke();
    G.strokeStyle=`rgba(${p.col},${a*0.4})`;G.lineWidth=1;G.beginPath();if(p.f>0)G.arc(p.x,p.y,p.r+4,s0,s1);else G.arc(p.x,p.y,p.r+4,A(s1),A(s0));G.stroke();break;}
  case'shock':{const w=(1-a)*60+6;G.globalAlpha=a;R(p.x-w,p.y-2,w*2,3,p.col);R(p.x-w*0.6,p.y-5,w*1.2,2,'#fff');G.globalAlpha=1;break;}
  }}}
function updParts(dt){for(const p of world.parts){p.life-=dt;p.vy+=p.grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.type==='dust'){p.vx*=0.9;p.vy*=0.9;}}
  world.parts=world.parts.filter(p=>p.life>0);if(world.parts.length>400)world.parts.splice(0,world.parts.length-400);}

// ===== Physics =====
function moveBody(b,dt){
  if(b.plat&&b.plat.mov)b.x+=b.plat.dx;
  if(!b.noGrav)b.vy=Math.min(b.vy+GRAV*dt,560);
  let nx=b.x+b.vx*dt;b.hitWall=false;
  for(const s of world.ground){if(b.y>s.y+1&&nx+b.w/2>s.x&&nx-b.w/2<s.x+s.w){if(nx>b.x||b.x<s.x)nx=s.x-b.w/2;else nx=s.x+s.w+b.w/2;b.vx=0;b.hitWall=true;}}
  if(nx-b.w/2<world.wallL){nx=world.wallL+b.w/2;b.hitWall=true;}if(nx+b.w/2>world.wallR){nx=world.wallR-b.w/2;b.hitWall=true;}
  if(!world.arena&&nx<8)nx=8;
  b.x=nx;const py=b.y;let ny=b.y+b.vy*dt;b.onGround=false;b.plat=null;
  if(b.vy>=0){
    for(const s of world.ground){if(b.x+b.w/2-2>s.x&&b.x-b.w/2+2<s.x+s.w&&py<=s.y+0.5&&ny>=s.y){ny=s.y;b.vy=0;b.onGround=true;b.ground=s;}}
    if(!(b.dropT>0))for(const p of world.plats){if(b.x+b.w/2-2>p.x&&b.x-b.w/2+2<p.x+p.w&&py<=p.y+0.5&&ny>=p.y){ny=p.y;b.vy=0;b.onGround=true;b.plat=p;}}
  }
  b.y=ny;
}
function solidBelow(x,y){for(const s of world.ground)if(x>s.x&&x<s.x+s.w&&Math.abs(s.y-y)<6)return true;for(const p of world.plats)if(x>p.x&&x<p.x+p.w&&Math.abs(p.y-y)<6)return true;return false;}
const ov=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const bodyBox=e=>({x:e.x-e.w/2,y:e.y-e.h,w:e.w,h:e.h});
function boxOf(e,b,sc){sc=sc||1;const bx=b[0]*sc,bw=b[2]*sc;return{x:e.f>0?e.x+bx:e.x-bx-bw,y:e.y+b[1]*sc,w:bw,h:b[3]*sc};}
