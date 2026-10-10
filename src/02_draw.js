// ===== Drawing primitives =====
const cv=$('cv');const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
let G=ctx;
let FLASH=false; // when true all figure colors render white
function R(x,y,w,h,c){G.fillStyle=FLASH?'#fff':c;G.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function seg(x1,y1,x2,y2,w,c){
  G.fillStyle=FLASH?'#fff':c;const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1),1)|0;const h=w/2;
  for(let i=0;i<=n;i++){const t=i/n;G.fillRect(Math.round(x1+(x2-x1)*t-h),Math.round(y1+(y2-y1)*t-h),w,w);}
}
function segO(a,b,w,c,o){seg(a.x,a.y,b.x,b.y,w+2,o);seg(a.x,a.y,b.x,b.y,w,c);}
const _shade={};
function shade(hex,f){const k=hex+f;if(_shade[k])return _shade[k];
  let n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
  r=clamp(Math.round(r*f),0,255);g=clamp(Math.round(g*f),0,255);b=clamp(Math.round(b*f),0,255);
  return _shade[k]='#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
function mixHex(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);
  const r=Math.round(lerp(A>>16,B>>16,t)),g=Math.round(lerp(A>>8&255,B>>8&255,t)),bl=Math.round(lerp(A&255,B&255,t));
  return '#'+((1<<24)|(r<<16)|(g<<8)|bl).toString(16).slice(1);}

// ===== Character definitions =====
const BASE={s:1,th:7,sh:7,to:10,ua:5,fa:5,legW:4,armW:3,torW:7,hk:1,hr:4.5,fist:3,ol:'#0B0F24'};
const mk=o=>Object.assign({},BASE,o);
const DEF={
  kai:mk({head:'kai',skin:'#F2B48A',top:'#2F63E0',pants:'#2A55C8',shoe:'#3A2A22',hand:'#F4E2C8',belt:'#F2F2F2',sleeve:null,vest:true,hair:'#16161f'}),
  lina:mk({head:'lina',skin:'#F6C49E',top:'#46A85A',pants:'#F6C49E',shoe:'#7A4B2A',hand:'#F6C49E',skirt:['#F4F6EE','#46A85A'],legW:3,armW:2,torW:6,fist:2,sleeve:'#F4F6EE'}),
  ren:mk({head:'ren',skin:'#F0C2A0',top:'#3B2556',pants:'#2C1C44',shoe:'#141018',hand:'#E6E0F0',belt:'#8A4FD0',sleeve:'#3B2556'}),
  gorrak:mk({head:'gorrak',s:2,th:6,sh:6,to:11,ua:7,fa:7,legW:10,armW:9,torW:24,hk:2,hr:6,fist:8,skin:'#4A3670',top:'#3A2A5C',pants:'#33254f',shoe:'#241838',hand:'#5E4789',armor:'#5B3C8C',trim:'#F2B33D',sleeve:'#4A3670',ol:'#0A0614'}),
  bruno:mk({head:'bear',s:1.35,legW:6,armW:5,torW:11,hr:5,fist:4,skin:'#8A5A30',top:'#8A5A30',pants:'#2F5FC0',shoe:'#5a3a1a',hand:'#6E4522',sleeve:'#8A5A30',belt:'#F2B33D',champ:true}),
  gale:mk({head:'ninja',wrap:'#1E9C8E',skin:'#F0C29A',top:'#1E9C8E',pants:'#14665D',shoe:'#0e2f2b',hand:'#E9F2EE',sleeve:'#1E9C8E',belt:'#F2F2F2',scarf:'#7FE3D2'}),
  blaze:mk({head:'monk',s:1.05,skin:'#E8A877',top:'#F07A1E',pants:'#C9481A',shoe:'#3a1a10',hand:'#E8A877',sleeve:null,skirt:['#F07A1E','#B8341A'],belt:'#FFD23A',flamefeet:true}),
  coral:mk({head:'coral',s:1.05,skin:'#E8C4A0',top:'#2BB5C8',pants:'#1D7F9A',shoe:'#0f3d4a',hand:'#BFF3F7',sleeve:'#2BB5C8',belt:'#F5E6A8',armor:'#7FE3EF'}),
  rocco:mk({head:'golem',s:1.5,legW:7,armW:6,torW:13,hr:5,fist:6,skin:'#8C8578',top:'#7d7568',pants:'#6a6357',shoe:'#4d473f',hand:'#9a9386',sleeve:'#8C8578',moss:'#5E9E3A',ol:'#1a1714'}),
  goblin:mk({head:'goblin',s:0.75,legW:3,armW:3,torW:6,skin:'#6BB84A',top:'#7a5230',pants:'#5a3c22',shoe:'#3a2716',hand:'#6BB84A',sleeve:null}),
  skeleton:mk({head:'skull',skin:'#EEE9DA',top:'#EEE9DA',pants:'#d8d2c0',shoe:'#bdb6a2',hand:'#EEE9DA',sleeve:null,legW:2,armW:2,torW:4,bones:true}),
  orc:mk({head:'orc',s:1.2,legW:5,armW:4,torW:9,fist:4,skin:'#7C9A5C',top:'#5a4632',pants:'#3f3226',shoe:'#2a2018',hand:'#7C9A5C',sleeve:null,belt:'#a0a0a0'}),
  ninja:mk({head:'ninja',wrap:'#1d1d2b',skin:'#E6B48C',top:'#23233a',pants:'#1a1a2b',shoe:'#0a0a12',hand:'#30304a',sleeve:'#23233a',scarf:'#C23B3B'}),
  ogre:mk({head:'ogre',s:1.55,legW:7,armW:6,torW:14,hr:5,fist:6,skin:'#C98A4A',top:'#6b4a2a',pants:'#5a3d22',shoe:'#3a2716',hand:'#C98A4A',sleeve:null,belt:'#8a6a3a'}),
  golemE:mk({head:'golem',s:1.25,legW:6,armW:5,torW:11,hr:5,fist:5,skin:'#8a7e6c',top:'#7a6e5c',pants:'#665b4a',shoe:'#4a4136',hand:'#9a8e7c',sleeve:'#8a7e6c',moss:'#6E9E3A',ol:'#1a1714'}),
};
function shadowTint(d){const o=Object.assign({},d);for(const k of['top','pants','sleeve','skin','hand'])if(o[k])o[k]=mixHex(o[k],'#4a1f7a',0.45);return o;}

// ===== Poses =====
const PI=Math.PI;
const POSES={
  idle:t=>{const b=Math.sin(t*3.2);return{y:b*0.4,lean:0.1,hd:-0.05,bt:-0.25,bk:0.35+b*0.04,ft:0.32,fk:0.35+b*0.04,bs:0.55,be:2.0+b*0.05,fs:0.95,fe:1.75+b*0.05};},
  stand:t=>{const b=Math.sin(t*2.4);return{lean:0.02,hd:0,bt:-0.06,bk:0.05,ft:0.06,fk:0.05,bs:0.12+b*0.03,be:0.2,fs:-0.08-b*0.03,fe:0.25};},
  walk:(t,ph)=>{const s=Math.sin(ph);return{lean:0.08,hd:0,bt:-s*0.55,bk:0.12+Math.max(0,-Math.cos(ph))*0.9,ft:s*0.55,fk:0.12+Math.max(0,Math.cos(ph))*0.9,bs:s*0.6,be:0.5,fs:-s*0.6,fe:0.5};},
  run:(t,ph)=>{const s=Math.sin(ph),c=Math.cos(ph);return{lean:0.32,hd:-0.15,bt:-s*0.95,bk:0.25+Math.max(0,-c)*1.5,ft:s*0.95,fk:0.25+Math.max(0,c)*1.5,bs:s*1.1,be:1.5,fs:-s*1.1,fe:1.5};},
  jump:()=>({air:1,lean:0.12,hd:-0.1,bt:0.2,bk:1.3,ft:1.0,fk:1.7,bs:-0.5,be:1.0,fs:1.3,fe:1.6}),
  fall:()=>({air:1,lean:0.05,hd:0.05,bt:-0.2,bk:0.4,ft:0.4,fk:0.6,bs:2.2,be:0.6,fs:1.8,fe:0.8}),
  punch1:()=>({lean:0.28,hd:-0.05,bt:-0.55,bk:0.2,ft:0.55,fk:0.45,bs:0.55,be:2.1,fs:PI/2-0.05,fe:0.02}),
  punch2:()=>({lean:0.42,hd:-0.1,bt:-0.7,bk:0.15,ft:0.6,fk:0.5,bs:PI/2+0.05,be:0.0,fs:0.4,fe:2.0}),
  kick:()=>({lean:-0.45,hd:0.2,bt:-0.25,bk:0.15,ft:1.75,fk:0.0,bs:-0.4,be:1.4,fs:0.8,fe:1.9}),
  wind:()=>({lean:-0.15,hd:0.05,bt:-0.3,bk:0.4,ft:0.5,fk:0.6,bs:-0.9,be:1.6,fs:-0.6,fe:1.8}),
  airkick:()=>({air:1,lean:-0.1,hd:0.1,bt:0.5,bk:1.6,ft:1.35,fk:0.0,bs:-0.9,be:1.2,fs:-0.4,fe:1.4}),
  charge:()=>({lean:-0.08,hd:0,bt:-0.45,bk:0.4,ft:0.55,fk:0.55,bs:-0.75,be:1.7,fs:-0.55,fe:1.8}),
  release:()=>({lean:0.32,hd:-0.05,bt:-0.65,bk:0.2,ft:0.6,fk:0.5,bs:PI/2-0.15,be:0.1,fs:PI/2+0.05,fe:0.05}),
  dash:()=>({lean:0.75,hd:-0.3,bt:-1.0,bk:0.6,ft:0.6,fk:1.0,bs:-1.1,be:0.6,fs:-0.8,fe:0.5}),
  hurt:()=>({lean:-0.5,hd:-0.35,bt:-0.1,bk:0.3,ft:0.35,fk:0.4,bs:-1.1,be:0.6,fs:-0.4,fe:0.4}),
  ko:()=>({rot:-1.45,lean:-0.1,hd:0.1,bt:0.1,bk:0.2,ft:0.3,fk:0.4,bs:1.9,be:0.3,fs:2.4,fe:0.2}),
  victory:t=>({lean:0.0,hd:-0.2,bt:-0.3,bk:0.15,ft:0.3,fk:0.15,bs:0.4,be:1.6,fs:PI-0.15+Math.sin(t*6)*0.05,fe:0.15}),
  block:()=>({lean:0.15,hd:0.1,bt:-0.4,bk:0.45,ft:0.4,fk:0.5,bs:1.1,be:2.4,fs:1.25,fe:2.3}),
  slamUp:()=>({lean:-0.2,hd:-0.2,bt:-0.2,bk:0.2,ft:0.2,fk:0.2,bs:PI-0.2,be:0.2,fs:PI-0.1,fe:0.25}),
  slamDown:()=>({lean:0.55,hd:0.1,bt:-0.6,bk:0.9,ft:0.7,fk:1.0,bs:1.0,be:0.2,fs:1.1,fe:0.15}),
  scared:t=>({lean:-0.1,hd:0.2+Math.sin(t*18)*0.04,bt:-0.05,bk:0.1,ft:0.1,fk:0.1,bs:2.2,be:1.9,fs:2.4,fe:1.7}),
  carried:t=>({air:1,lean:-0.3,hd:0.1,bt:0.3+Math.sin(t*8)*0.3,bk:0.6,ft:-0.2-Math.sin(t*8)*0.3,fk:0.5,bs:2.6,be:0.3,fs:2.2+Math.sin(t*9)*0.3,fe:0.3}),
  cheer:t=>({y:-Math.abs(Math.sin(t*7))*3,lean:0,hd:-0.2,bt:-0.15,bk:0.1,ft:0.15,fk:0.1,bs:PI-0.3,be:0.2,fs:PI-0.25,fe:0.2}),
  hug:()=>({lean:0.15,hd:0.1,bt:-0.1,bk:0.1,ft:0.1,fk:0.1,bs:1.4,be:1.2,fs:1.3,fe:1.3}),
  throwp:()=>({lean:0.3,hd:-0.1,bt:-0.5,bk:0.2,ft:0.5,fk:0.5,bs:0.3,be:0.6,fs:2.0,fe:0.2}),
  crouch:()=>({lean:0.45,hd:-0.3,bt:-0.2,bk:1.4,ft:0.9,fk:1.8,bs:0.9,be:1.6,fs:1.2,fe:1.4}),
};
const POSE_KEYS=['y','lean','hd','bt','bk','ft','fk','bs','be','fs','fe','rot'];
function blendPose(cur,tgt,k){for(const key of POSE_KEYS){const a=cur[key]||0,b=tgt[key]||0;cur[key]=a+(b-a)*k;}cur.air=tgt.air;}

// ===== Forward kinematics =====
function fk(d,p){
  const s=d.s,th=d.th*s,sh=d.sh*s,to=d.to*s,ua=d.ua*s,fa=d.fa*s;
  const leg=(t,k)=>{const kn={x:Math.sin(t)*th,y:Math.cos(t)*th};const a=t-k;return{kn,ft:{x:kn.x+Math.sin(a)*sh,y:kn.y+Math.cos(a)*sh}};};
  const bl=leg(p.bt,p.bk),fl=leg(p.ft,p.fk);
  const lean=p.lean;
  const neck={x:Math.sin(lean)*to,y:-Math.cos(lean)*to};
  const shd={x:neck.x-Math.sin(lean)*1.5*s,y:neck.y+Math.cos(lean)*1.5*s};
  const arm=(sa,e)=>{const el={x:shd.x+Math.sin(sa)*ua,y:shd.y+Math.cos(sa)*ua};const a=sa+e;return{el,h:{x:el.x+Math.sin(a)*fa,y:el.y+Math.cos(a)*fa}};};
  const ba=arm(p.bs,p.be),fa2=arm(p.fs,p.fe);
  const hr=d.hr*d.hk;
  const head={x:neck.x+Math.sin(lean+p.hd)*hr,y:neck.y-Math.cos(lean+p.hd)*hr};
  const pts={hip:{x:0,y:0},bk:bl.kn,bf:bl.ft,fkn:fl.kn,ff:fl.ft,neck,shd,bel:ba.el,bh:ba.h,fel:fa2.el,fh:fa2.h,head};
  if(p.rot){const c=Math.cos(p.rot),sn=Math.sin(p.rot);for(const k in pts){const q=pts[k];const x=q.x*c-q.y*sn,y=q.x*sn+q.y*c;q.x=x;q.y=y;}}
  return pts;
}

// Draw a humanoid. X,Y = ground point (feet). Returns head screen pos.
function drawFig(d,p,X,Y,f,o){
  o=o||{};const P=fk(d,p);const s=d.s;
  let oy;
  if(p.air){oy=-(d.th+d.sh)*s-1;}
  else{let m=Math.max(P.bf.y,P.ff.y)+1;if(p.rot){m=Math.max(m,P.head.y+d.hr*d.hk,P.fh.y,P.bh.y,P.neck.y+2);}oy=-m;}
  oy+=(p.y||0);
  const T=q=>({x:X+f*q.x,y:Y+oy+q.y});
  const S={};for(const k in P)S[k]=T(P[k]);
  const ol=d.ol,dk=0.72;
  const skin=d.skin,skin2=shade(skin,dk),top=d.top,top2=shade(top,dk),pants=d.pants,pants2=shade(pants,dk);
  const sleeve=d.sleeve,sleeve2=sleeve?shade(sleeve,dk):null;
  const fs=d.fist;const fsz=Math.max(2,Math.round(fs));
  const fistAt=(h,c)=>{R(h.x-fsz/2-1,h.y-fsz/2-1,fsz+2,fsz+2,ol);R(h.x-fsz/2,h.y-fsz/2,fsz,fsz,c);};
  const footL=Math.round(4*s),footH=Math.max(2,Math.round(2*s));
  const footAt=(q,c)=>{const x=f>0?q.x-1:q.x-footL+1;R(x-1,q.y-footH/2-1,footL+2,footH+2,ol);R(x,q.y-footH/2,footL,footH,c);};
  const armW=d.armW,legW=d.legW;
  const drawArm=(sh,el,h,back)=>{
    const up=sleeve?(back?sleeve2:sleeve):(back?skin2:skin);
    segO(sh,el,armW,up,ol);segO(el,h,Math.max(2,armW-1),back?skin2:skin,ol);fistAt(h,back?shade(d.hand,0.85):d.hand);
    if(d.armor&&!back&&d.head==='gorrak'){}
  };
  const drawLeg=(kn,ft,back)=>{
    segO(S.hip,kn,legW,back?pants2:pants,ol);segO(kn,ft,Math.max(2,legW-1),back?pants2:pants,ol);footAt(ft,back?shade(d.shoe,0.8):d.shoe);
  };
  HEAD(d,'back',S.head,f,o,S);
  drawArm(S.shd,S.bel,S.bh,true);
  drawLeg(S.bk,S.bf,true);
  // torso
  if(d.bones){segO(S.hip,S.neck,d.torW,'#EEE9DA',ol);const n=4;for(let i=1;i<n;i++){const a={x:lerp(S.hip.x,S.neck.x,i/n),y:lerp(S.hip.y,S.neck.y,i/n)};R(a.x-3,a.y,6,1,'#8d8676');}}
  else segO(S.hip,S.neck,d.torW,top,ol);
  const dirx=S.neck.x-S.hip.x,diry=S.neck.y-S.hip.y,len=Math.hypot(dirx,diry)||1,ux=dirx/len,uy=diry/len;
  const px=-uy*f,py=ux*f; // perpendicular (forward side)
  if(d.vest){const ox=f*(d.torW/2-1.5);seg(S.neck.x+ox,S.neck.y+1,S.neck.x+ox-ux*5,S.neck.y+1-uy*5,2,skin);
    R(S.neck.x-d.torW/2,S.neck.y-1,d.torW,2,shade(top,1.2));}
  if(d.armor){const c={x:lerp(S.hip.x,S.neck.x,0.6),y:lerp(S.hip.y,S.neck.y,0.6)};R(c.x-d.torW/2+1,c.y-4,d.torW-2,8,d.armor);R(c.x-d.torW/2+1,c.y+3,d.torW-2,1,d.trim||'#fff');
    if(d.head==='gorrak'){R(S.neck.x-10,S.neck.y-1,20,7,ol);R(S.neck.x-9,S.neck.y,18,5,d.armor);R(S.neck.x-9,S.neck.y+4,18,1,d.trim);
      for(let i=0;i<3;i++)R(S.neck.x-8+i*7,S.neck.y-3,2,3,'#cfc6dd');}}
  if(d.moss){R(S.neck.x-d.torW/2,S.neck.y-1,d.torW,3,d.moss);}
  if(d.belt){const b={x:lerp(S.hip.x,S.neck.x,0.12),y:lerp(S.hip.y,S.neck.y,0.12)};R(b.x-d.torW/2-0.5,b.y-1,d.torW+1,d.champ?4:2,d.belt);
    if(d.champ)R(b.x-2,b.y-1,4,4,'#fff3b0');
    else{const tx=b.x-f*(d.torW/2+1),wv=Math.sin((o.t||0)*9)*1.5;seg(tx,b.y,tx-f*3,b.y+3+wv*0.3,1.5,d.belt);}}
  drawLeg(S.fkn,S.ff,false);
  if(d.skirt){const top=lerp(S.hip.y,S.neck.y,0.08),kx=(S.fkn.x+S.bk.x)/2,ky=Math.max(S.fkn.y,S.bk.y)-1;const n=Math.max(3,Math.round(ky-top));
    for(let i=0;i<=n;i++){const t=i/n;const w=d.torW+t*7;const cx=lerp(S.hip.x,kx,t);R(cx-w/2-1,top+i,w+2,1,ol);}
    for(let i=0;i<n;i++){const t=i/n;const w=d.torW+t*7;const cx=lerp(S.hip.x,kx,t);R(cx-w/2,top+i,w,1,i>n-3?d.skirt[1]:d.skirt[0]);}}
  if(d.flamefeet&&o.t!==undefined){for(const q of[S.ff,S.bf]){const fl=(Math.sin(o.t*20+q.x)+1)*1.5;R(q.x-1,q.y-2-fl,3,2+fl,'#FFB13A');R(q.x,q.y-1-fl*0.5,1,1+fl*0.5,'#FFF0A0');}}
  HEAD(d,'front',S.head,f,o,S);
  drawArm(S.shd,S.fel,S.fh,false);
  if(d.head==='gorrak'){R(S.shd.x-7,S.shd.y-3,14,8,ol);R(S.shd.x-6,S.shd.y-2,12,6,d.armor);R(S.shd.x-6,S.shd.y+3,12,1,d.trim);R(S.shd.x-2,S.shd.y-5,3,3,'#cfc6dd');}
  return S;
}

// ===== Heads =====
function HEAD(d,layer,c,f,o,S){
  const k=d.hk,hx=Math.round(c.x),hy=Math.round(c.y);
  const H=(dx,dy,w,h,col)=>{const x=f>0?hx+dx*k:hx-(dx+w)*k;R(x,hy+dy*k,w*k,h*k,col);};
  const ol=d.ol,t=o.t||0,vx=o.vx||0;
  const tails=(col,len)=>{const sx=hx-f*5*k,sy=hy-2*k;const sp=clamp(Math.abs(vx)/120,0,1);
    const w1=Math.sin(t*10)*1.5,w2=Math.sin(t*10+1.3)*1.5;
    seg(sx,sy,sx-f*(len*0.5+sp*3),sy+2+w1*0.5-sp*1,2,ol);
    seg(sx,sy,sx-f*(len+sp*4),sy+3+w1-sp*2,1.5,col);seg(sx,sy+1,sx-f*(len-1+sp*3),sy+5+w2-sp*2,1.5,col);};
  switch(d.head){
  case'kai':
    if(layer==='back'){tails('#E0362C',7);return;}
    H(-5,-5,10,10,ol);H(-4,-4,8,8,d.skin);H(3,-1,1,3,shade(d.skin,0.85));
    H(-5,-7,9,4,d.hair);H(-5,-4,3,6,d.hair);H(-6,-8,2,3,d.hair);H(-3,-9,2,3,d.hair);H(0,-9,2,3,d.hair);H(2,-7,2,2,d.hair);H(2,-5,3,2,d.hair);H(-7,-5,2,2,d.hair);
    H(-4,-3,8,2,'#E0362C');H(-6,-3,2,2,'#B82820');
    H(1,-1,1,2,'#1a1a2e');H(1,-2,2,1,d.hair);H(2,2,1,1,'#b0705a');H(-1,0,1,2,shade(d.skin,0.8));break;
  case'lina':
    if(layer==='back'){H(-6,-4,4,13,'#6A3A1C');H(-5,-4,3,12,'#7A4320');H(-6,8,3,3,'#6A3A1C');return;}
    H(-5,-5,10,10,ol);H(-4,-4,8,8,d.skin);
    H(-5,-7,10,4,'#7A4320');H(-5,-4,3,8,'#7A4320');H(1,-5,3,2,'#7A4320');H(3,-4,1,2,'#7A4320');
    H(-3,-8,3,3,'#ffffff');H(-2,-7,1,1,'#F5B83D');
    H(1,-1,1,2,'#2a1a10');H(1,-2,2,1,'#2a1a10');H(2,1,1,1,'#f08a8a');break;
  case'ren':
    if(layer==='back')return;
    H(-5,-5,10,10,ol);H(-4,-4,8,8,d.skin);
    H(-6,-7,11,4,'#E8ECF5');H(-8,-9,3,3,'#E8ECF5');H(-5,-10,3,4,'#E8ECF5');H(-2,-11,3,4,'#E8ECF5');H(1,-9,3,3,'#E8ECF5');H(3,-7,3,2,'#E8ECF5');
    H(-6,-4,3,7,'#D4DAE8');H(1,-4,3,3,'#C9D0E0');H(-8,-3,2,2,'#E8ECF5');
    H(2,0,1,1,'#8a4fd0');H(1,-1,2,1,'#6a4a8a');H(-1,1,2,1,'#c08070');H(-4,4,9,2,d.top);break;
  case'gorrak':
    if(layer==='back')return;
    H(-6,-6,12,12,ol);H(-5,-5,10,10,'#3E2C62');H(-5,-5,3,10,'#33254f');
    H(0,0,6,5,'#8C7AA8');H(4,1,1,1,'#1a1028');H(1,3,5,1,'#1a1028');H(2,3,1,1,'#fff');H(4,3,1,1,'#fff');
    H(-1,-3,7,2,'#2A1D45');H(2,-1,2,1,(o.rage?'#FFE14A':'#FF3B3B'));
    H(-4,-8,9,3,'#F2B33D');H(-4,-10,1,2,'#F2B33D');H(-1,-10,1,2,'#F2B33D');H(2,-10,1,2,'#F2B33D');H(4,-10,1,2,'#F2B33D');H(0,-7,1,1,'#E0362C');break;
  case'bear':
    if(layer==='back')return;
    H(-6,-6,12,11,ol);H(-5,-5,10,9,'#8A5A30');H(-6,-8,4,4,ol);H(1,-8,4,4,ol);H(-5,-7,2,2,'#8A5A30');H(2,-7,2,2,'#8A5A30');H(-4,-6,1,1,'#E8A0A0');H(3,-6,1,1,'#E8A0A0');
    H(1,-1,5,4,'#D9B48A');H(5,-1,2,2,'#1a1010');H(1,-3,1,1,'#000');H(2,2,3,1,'#5a3a1a');break;
  case'ninja':
    if(layer==='back'){tails(d.scarf,8);return;}
    H(-5,-5,10,10,ol);H(-4,-4,8,8,d.wrap);H(0,-2,4,2,d.skin);H(2,-2,1,1,'#000');H(-4,-4,8,1,shade(d.wrap,1.3));break;
  case'monk':
    if(layer==='back')return;
    H(-5,-5,10,10,ol);H(-4,-4,8,8,d.skin);H(-2,-4,3,1,'#FFD9B8');H(2,-3,1,1,'#E0362C');H(1,-1,1,1,'#2a1a10');H(1,-2,2,1,'#5a3a1a');H(0,2,4,2,'#8a5a3a');H(-4,-1,1,2,shade(d.skin,0.8));break;
  case'coral':
    if(layer==='back')return;
    H(-5,-7,10,12,ol);H(-4,-6,8,5,'#2BB5C8');H(-3,-9,5,3,'#7FE3EF');H(-2,-10,3,1,'#7FE3EF');H(-4,-1,8,5,d.skin);H(-4,-1,2,5,'#2BB5C8');H(2,0,1,1,'#0d3b4a');H(1,-1,2,1,'#0d3b4a');break;
  case'golem':
    if(layer==='back')return;
    H(-6,-6,12,11,ol);H(-5,-5,10,9,d.skin);H(-5,-5,10,2,d.moss||'#5E9E3A');H(-2,-2,1,3,shade(d.skin,0.65));H(1,-1,2,1,'#FFD84A');H(4,-1,1,1,'#FFD84A');H(0,2,5,1,shade(d.skin,0.6));break;
  case'goblin':
    if(layer==='back')return;
    H(-5,-5,10,9,ol);H(-4,-4,8,7,d.skin);H(-8,-4,4,2,ol);H(-7,-4,3,1,d.skin);H(1,-1,2,1,'#FFE04A');H(2,-1,1,1,'#000');H(1,2,3,1,'#2a3a1a');H(2,2,1,1,'#fff');break;
  case'skull':
    if(layer==='back')return;
    H(-5,-5,10,10,ol);H(-4,-4,8,7,'#EEE9DA');H(0,-1,2,2,'#111');H(3,-1,1,2,'#111');H(-1,3,5,2,'#cfc8b4');H(0,3,1,1,'#555');H(2,3,1,1,'#555');break;
  case'orc':
    if(layer==='back')return;
    H(-5,-5,10,10,ol);H(-4,-4,8,8,d.skin);H(-5,-6,6,3,'#2a2018');H(1,-1,2,1,'#E0362C');H(1,-2,3,1,shade(d.skin,0.6));H(1,2,4,1,'#2a2a18');H(3,1,1,2,'#fff');break;
  case'ogre':
    if(layer==='back')return;
    H(-5,-5,10,10,ol);H(-4,-4,8,8,d.skin);H(-1,-8,2,4,ol);H(-1,-7,1,3,'#efe6cc');H(1,-1,2,1,'#fff');H(2,-1,1,1,'#000');H(1,-2,3,1,shade(d.skin,0.6));H(1,2,4,1,'#3a1a10');H(1,1,1,2,'#fff');H(4,1,1,2,'#fff');break;
  }
}

// ===== Non-humanoid monsters =====
function Q(ox,oy,f){return(dx,dy,w,h,c)=>{const x=f>0?ox+dx:ox-dx-w;R(x,oy+dy,w,h,c);};}
function drawSlime(e){const sq=e.sq||1;const w=Math.round(16*(2-sq)*0.5+8*sq*0),hh=Math.round(11*sq);const ww=Math.round(16/Math.sqrt(sq));
  const q=Q(e.x,e.y,e.f),ol='#10301a',c=e.col||'#5BD46A';
  q(-ww/2-1,-hh-1,ww+2,hh+1,ol);q(-ww/2,-hh,ww,hh,c);q(-ww/2+1,-hh-2,ww-2,2,ol);q(-ww/2+1,-hh-1,ww-2,1,c);
  q(-ww/2+2,-hh+1,3,2,'#c9f7cf');q(ww/2-6,-hh+3,2,3,'#10301a');q(ww/2-3,-hh+3,2,3,'#10301a');q(-ww/2,-2,ww,2,shade(c,0.7));}
function drawWolf(e){const q=Q(e.x,e.y,e.f),ol='#14141c',c=e.col||'#7E8796',c2=shade(c,0.7);const run=e.anim||0;const l=Math.sin(run)*3,l2=Math.cos(run)*3;const cr=e.crouch?3:0;
  q(-12,-13+cr,24,9,ol);q(-11,-12+cr,22,7,c);q(-11,-7+cr,22,2,c2);q(8,-17+cr,9,9,ol);q(9,-16+cr,7,7,c);q(15,-13+cr,4,4,ol);q(15,-12+cr,3,2,c);q(18,-12+cr,1,1,'#000');
  q(9,-19+cr,3,3,ol);q(10,-18+cr,1,2,c);q(13,-14+cr,1,1,e.eye||'#FFE04A');
  q(-16,-14+cr+Math.sin(run*0.5)*1,5,3,ol);q(-15,-13+cr,4,1,c);
  for(const[lx,o]of[[-9,l],[-5,-l],[4,l2],[8,-l2]]){q(lx+o*0.5-1,-6+cr,4,6-cr,ol);q(lx+o*0.5,-5+cr,2,5-cr,c2);}}
function drawBird(e){const q=Q(e.x,e.y,e.f),ol='#2a0e0e',c=e.col||'#E8453C';const fl=Math.sin(e.t*16);
  q(-7,-6,14,8,ol);q(-6,-5,12,6,c);q(-6,0,12,1,shade(c,0.7));q(5,-8,6,6,ol);q(6,-7,4,4,c);q(10,-6,3,2,'#F5B83D');q(8,-6,1,1,'#000');
  q(-10,-4,4,3,ol);q(-9,-3,3,1,shade(c,0.8));
  const wy=Math.round(fl*5);q(-3,-6+Math.min(0,wy)-1,7,Math.abs(wy)+3,ol);q(-2,-6+Math.min(0,wy),5,Math.abs(wy)+1,'#FF8A5A');}
function drawBat(e){const q=Q(e.x,e.y,e.f),ol='#120818',c=e.col||'#6B3BC0';const fl=Math.sin(e.t*22);const wy=Math.round(fl*4);
  q(-4,-6,8,8,ol);q(-3,-5,6,6,c);q(-3,-7,2,2,ol);q(1,-7,2,2,ol);q(1,-3,1,1,'#FF4A4A');q(-2,-3,1,1,'#FF4A4A');
  for(const s of[-1,1]){for(let i=0;i<4;i++){const x=s<0?-5-i*2:3+i*2;q(x,-5+wy*(i/3)-1,2,4-i*0.5,ol);q(x,-4+wy*(i/3)-1,2,2,shade(c,0.8));}}}
function drawTurtle(e){const q=Q(e.x,e.y,e.f),ol='#0e2014';const sp=e.spin;
  if(!sp){const l=Math.sin(e.anim||0)*2;q(6,-9,6,5,ol);q(7,-8,4,3,'#9CD07A');q(10,-8,1,1,'#000');q(-8+l,-3,4,3,ol);q(4-l,-3,4,3,ol);q(-7+l,-3,2,2,'#9CD07A');q(5-l,-3,2,2,'#9CD07A');}
  q(-10,-12,20,10,ol);q(-9,-11,18,8,'#3E8E4A');q(-7,-12,14,2,ol);q(-6,-11,12,1,'#3E8E4A');
  const off=sp?Math.floor(e.t*30)%6:0;for(let i=0;i<3;i++){q(-7+((i*6+off)%18),-9,4,4,'#2c6a36');}
  q(-9,-4,18,2,'#C9B26A');}
function drawFireEl(e){const t=e.t;const cols=['#B8341A','#F07A1E','#FFB13A','#FFF0A0'];
  for(let i=0;i<4;i++){const s=12-i*3;for(let j=0;j<6;j++){const yy=-4-j*3-i;const w=Math.max(1,s-j*1.6+Math.sin(t*12+j+i)*1.5);R(e.x-w/2+Math.sin(t*9+j*1.7)*1.2,e.y+yy-6,w,3,cols[i]);}}
  R(e.x+e.f*1-2,e.y-17,2,2,'#2a0a00');R(e.x+e.f*4-1,e.y-17,2,2,'#2a0a00');}

// ===== Pixel font for numbers =====
const FONT={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111','+':'000010111010000','!':'010010010000010','x':'000101010101000'};
function drawNum(str,x,y,col,sc){sc=sc||1;const w=str.length*4*sc;let cx=Math.round(x-w/2);
  for(const ch of str){const b=FONT[ch];if(b){for(let pass=0;pass<2;pass++)for(let i=0;i<15;i++)if(b[i]==='1'){const px=cx+(i%3)*sc,py=y+Math.floor(i/3)*sc;
    if(pass===0){G.fillStyle='#000';G.fillRect(px-1,py-1,sc+2,sc+2);}else{G.fillStyle=col;G.fillRect(px,py,sc,sc);}}}cx+=4*sc;}}
