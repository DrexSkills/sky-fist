// ===== Player =====
const MOVES={
 p1:{dur:0.24,a0:0.04,a1:0.11,box:[5,-32,19,12],dmg:1,kb:90,up:-30,pose:'punch1',lunge:70,next:'p2',sfx:'punch'},
 p2:{dur:0.26,a0:0.05,a1:0.12,box:[5,-32,21,12],dmg:1,kb:100,up:-40,pose:'punch2',lunge:90,next:'k3',sfx:'punch'},
 k3:{dur:0.42,wind:0.07,a0:0.09,a1:0.2,box:[3,-32,27,18],dmg:2,kb:250,up:-170,pose:'kick',lunge:120,sfx:'kick',big:true},
 air:{dur:0.4,a0:0.04,a1:0.32,box:[1,-22,22,15],dmg:2,kb:170,up:-80,pose:'airkick',sfx:'kick',air:true},
};
function diffMult(){return SAVE.opt.diff==='easy'?0.5:SAVE.opt.diff==='hard'?1.5:1;}
function makePlayer(x,y){const maxHp=10+Math.min(SAVE.unlocked-1,6)*2;
  return{kind:'player',x,y,vx:0,vy:0,w:12,h:35,sq:1,f:1,onGround:false,hp:maxHp,maxHp,mana:1,state:'normal',st:0,move:null,hitSet:null,inv:0,coy:0,jumps:0,airDash:true,dashCd:0,power:0,
    t:0,ph:0,pose:Object.assign({},POSES.idle(0)),queued:false,spin:0,rising:false,safe:{x,y},dead:false,auto:null,def:DEF.kai,poseName:'idle'};}
function pSetState(p,s){p.state=s;p.st=0;}
function startMove(p,m){const M=MOVES[m];p.move=m;p.swooshed=false;p.hitSet=new Set();p.queued=false;pSetState(p,'attack');
  if(Input.ix&&!M.air)p.f=Input.ix>0?1:-1;if(M.lunge)p.vx=p.f*M.lunge;if(M.air&&p.vy>0)p.vy*=0.4;SND.play('whiff');}
function swoosh(p,M){const big=M.big||M.air;const cy=p.y-(M.air?18:27);
  part('swoosh',p.x+p.f*4,cy,{life:0.16,max:0.16,f:p.f,r:big?17:13,a0:big?-1.5:-0.8,a1:big?1.0:0.45,col:big?'255,226,120':'255,255,255'});}
function trySpecial(p){
  if(p.mana>=2.999){pSetState(p,'super');p.vx=0;SND.play('superb');Game.flash=0.25;showBanner('Sky Fist!','',0.9);vibrate([30,30,60]);return;}
  if(p.mana>=1){pSetState(p,'special');p.vx*=0.3;return;}
  popup(p.x,p.y-36,'0','#7fb0ff');SND.play('blip');
}
function updPlayer(p,dt){
  p.t+=dt;p.inv=Math.max(0,p.inv-dt);p.dashCd-=dt;p.power=Math.max(0,p.power-dt);p.st+=dt;p.spin=Math.max(0,p.spin-dt);
  const ctl=!Game.cut&&p.state!=='dead';
  let ix=ctl?Input.ix:0;if(p.auto)ix=p.auto.ix||0;
  if(p.onGround){p.coy=0.1;p.jumps=0;p.airDash=true;}else p.coy-=dt;
  const wasGround=p.onGround,vyb=p.vy;
  switch(p.state){
  case'normal':{
    if(ix)p.f=ix>0?1:-1;
    const tgt=ix*138,acc=p.onGround?1500:950;p.vx=p.vx<tgt?Math.min(tgt,p.vx+acc*dt):Math.max(tgt,p.vx-acc*dt);
    if(ctl&&Input.pressed.jump>0){
      if(p.coy>0){Input.pressed.jump=0;p.sq=1.22;p.vy=-345;p.coy=0;p.jumps=1;p.rising=true;SND.play('jump');dust(p.x,p.y,5);}
      else if(p.jumps<2){Input.pressed.jump=0;p.vy=-315;p.jumps=2;p.rising=true;p.spin=0.32;SND.play('djump');part('ring',p.x,p.y,{life:0.2,max:0.2,size:3,col:'#bfe0ff'});}
    }
    if(ctl&&consume('atk'))startMove(p,p.onGround?'p1':'air');
    else if(ctl&&consume('spc'))trySpecial(p);
    else if(ctl&&Input.pressed.dsh>0&&p.dashCd<=0&&(p.onGround||p.airDash)){consume('dsh');pSetState(p,'dash');if(ix)p.f=ix>0?1:-1;if(!p.onGround)p.airDash=false;p.dashCd=0.45;SND.play('dash');dust(p.x,p.y,4,-p.f);}
    break;}
  case'attack':{const M=MOVES[p.move];
    if(p.onGround)p.vx*=Math.pow(0.002,dt);else{const tgt=ix*110;p.vx+= (tgt-p.vx)*Math.min(1,dt*4);}
    if(ctl&&Input.pressed.atk>0&&p.st>M.a0){consume('atk');p.queued=true;}
    if(ctl&&Input.pressed.spc>0&&p.st>M.a1){consume('spc');trySpecial(p);break;}
    if(ctl&&Input.pressed.dsh>0&&p.st>M.a1&&p.dashCd<=0){consume('dsh');pSetState(p,'dash');if(ix)p.f=ix>0?1:-1;p.dashCd=0.45;SND.play('dash');break;}
    if(p.st>=M.a0&&!p.swooshed){p.swooshed=true;swoosh(p,M);}
    if(p.st>=M.a0&&p.st<=M.a1)attackHits(p,M);
    if(p.queued&&M.next&&p.st>=M.a1+0.02){startMove(p,M.next);break;}
    if(p.queued&&!M.next&&!M.air&&p.st>=M.dur-0.04){startMove(p,'p1');break;}
    if(M.air&&p.onGround&&p.st>0.08){pSetState(p,'normal');break;}
    if(p.st>=M.dur)pSetState(p,'normal');
    break;}
  case'special':{p.vx*=Math.pow(0.01,dt);if(!p.onGround)p.vy=Math.min(p.vy,40);
    if(p.st>=0.15&&!p.fired){p.fired=true;p.mana-=1;SND.play('blast');
      Game.projs.push({x:p.x+p.f*17,y:p.y-27,vx:p.f*300,vy:0,r:6,dmg:3,owner:'p',type:'blast',life:1.6,f:p.f,hit:new Set()});
      p.vx=-p.f*60;Game.shake=Math.max(Game.shake,2);}
    if(p.st>=0.42){p.fired=false;pSetState(p,'normal');}
    break;}
  case'super':{p.vx=0;p.vy=Math.min(p.vy,0);p.noGrav=true;
    if(p.st<0.35&&Math.random()<0.7)part('glow',p.x+rnd(-18,18),p.y-rnd(0,40),{vx:0,vy:-30,life:0.4,max:0.4,size:3,col:'#F5B83D'});
    if(p.st>=0.35&&!p.fired){p.fired=true;p.mana=0;SND.play('boom');Game.shake=6;
      Game.projs.push({x:p.x+p.f*22,y:p.y-30,vx:p.f*270,vy:0,r:16,dmg:10,owner:'p',type:'fist',life:2.2,f:p.f,hit:new Set(),pierce:true});}
    if(p.st>=0.7){p.fired=false;p.noGrav=false;pSetState(p,'normal');}
    break;}
  case'dash':{p.vx=p.f*340;p.vy=0;p.noGrav=true;p.inv=Math.max(p.inv,0.05);
    if(Math.random()<0.6)part('after',p.x,p.y,{life:0.18,max:0.18,fig:{d:p.def,p:Object.assign({},p.pose),f:p.f}});
    if(p.st>=0.2){p.noGrav=false;p.vx*=0.45;pSetState(p,'normal');}
    break;}
  case'hurt':p.vx*=Math.pow(0.05,dt);if(p.st>=0.32)pSetState(p,'normal');break;
  case'dead':p.vx*=Math.pow(0.02,dt);break;
  case'cut':{if(p.auto&&p.auto.ix){p.f=p.auto.ix>0?1:-1;p.vx=p.auto.ix*(p.auto.spd||138);}else if(p.onGround&&p.vy>=0)p.vx*=Math.pow(0.001,dt);break;}
  }
  if(p.rising&&(p.vy>=0||!Input.held.jump)){if(p.vy<-150&&!Input.held.jump&&!Game.cut)p.vy=-150;p.rising=false;}
  moveBody(p,dt);
  if(!wasGround&&p.onGround&&vyb>180){SND.play('land');dust(p.x,p.y,6);p.sq=0.78;}
  p.sq+=(1-p.sq)*Math.min(1,dt*12);
  if(p.onGround&&p.ground&&!world.arena){const s=p.ground;if(p.x>s.x+16&&p.x<s.x+s.w-16)p.safe={x:p.x,y:s.y};}
  // pose
  let tgt,rate=20;const sp=Math.abs(p.vx);
  if(p.state==='attack'){const M=MOVES[p.move];tgt=POSES[(M.wind&&p.st<M.wind)?'wind':M.pose](p.t);rate=45;}
  else if(p.state==='special')tgt=POSES[p.st<0.15?'charge':'release'](p.t),rate=40;
  else if(p.state==='super')tgt=POSES[p.st<0.35?'charge':'release'](p.t),rate=30;
  else if(p.state==='dash')tgt=POSES.dash(p.t),rate=40;
  else if(p.state==='hurt')tgt=POSES.hurt(p.t),rate=30;
  else if(p.state==='dead')tgt=POSES.ko(p.t),rate=10;
  else if(p.poseOverride)tgt=POSES[p.poseOverride](p.t),rate=p.poseRate||14;
  else if(!p.onGround)tgt=POSES[p.vy<0?'jump':'fall'](p.t),rate=14;
  else if(sp>100){p.ph+=sp*dt*0.12;tgt=POSES.run(p.t,p.ph);rate=25;}
  else if(sp>12){p.ph+=sp*dt*0.16;tgt=POSES.walk(p.t,p.ph);}
  else tgt=POSES[Game.cut&&!Game.fight?'stand':'idle'](p.t);
  if(p.spin>0)tgt.rot=(1-p.spin/0.32)*PI*2*-1,tgt.air=1;
  blendPose(p.pose,tgt,Math.min(1,dt*rate));
  if(p.spin<=0&&Math.abs(p.pose.rot||0)>0.01&&p.state!=='dead'){p.pose.rot=0;}
  if(!world.arena&&p.y>H+50&&p.state!=='dead'){fallOut(p);}
}
function fallOut(p){p.x=p.safe.x;p.y=p.safe.y-2;p.vx=0;p.vy=0;p.inv=1.2;SND.play('hurt');damageNoKB(p,2);}
function damageNoKB(p,d){p.hp-=d*diffMult();Game.stats.dmg+=d;popup(p.x,p.y-34,String(Math.ceil(d*diffMult())),'#ff6a6a');if(p.hp<=0)killPlayer(p);}
function attackHits(p,M){
  const hb=boxOf(p,M.box);
  const mult=p.power>0?2:1;
  for(const e of Game.targets()){if(e.dead||p.hitSet.has(e)||e.intang)continue;
    if(ov(hb,bodyBox(e))){p.hitSet.add(e);hitEnemy(e,M.dmg*mult,p.f,M.kb,M.up,hb.x+hb.w/2*(p.f>0?1.4:0.6),hb.y+hb.h/2,M.big);}}
}
function hurtPlayer(p,dmg,dir,kb){
  if(p.inv>0||p.state==='dash'||p.state==='dead'||Game.cut||p.state==='super')return false;
  const d=dmg*diffMult();p.hp-=d;Game.stats.dmg+=dmg;pSetState(p,'hurt');p.vx=dir*(kb||170);p.vy=-150;p.onGround=false;p.inv=1.0;p.rising=false;
  SND.play('hurt');vibrate(45);Game.shake=Math.max(Game.shake,4);Game.hitstop=0.07;Game.combo=0;sparks(p.x,p.y-18,'#ff6a6a',8);popup(p.x,p.y-34,String(Math.ceil(d)),'#ff6a6a');
  if(p.hp<=0)killPlayer(p);return true;}
function killPlayer(p){p.hp=0;pSetState(p,'dead');p.vy=-180;p.vx=-p.f*80;SND.play('ko');vibrate([60,40,120]);Game.onPlayerDead();}

// ===== Enemies =====
function makeEnemy(tp,x,y){const T=ETYPES[tp];const hp=Math.ceil(T.hp*(SAVE.opt.diff==='hard'?1.3:SAVE.opt.diff==='easy'?0.8:1));
  const e={kind:'enemy',tp,T,x,y,vx:0,vy:0,w:T.w,h:T.h,f:-1,hp,maxHp:hp,t:Math.random()*5,st:0,state:'idle',stun:0,flash:0,cd:rnd(0.5,1.5),home:{x,y},dead:false,onGround:false,anim:0};
  if(T.def){e.def=(world&&world.isl&&world.isl.shadow&&tp!=='ninja')?shadowTint(DEF[T.def]):DEF[T.def];e.pose=Object.assign({},POSES.stand(0));}
  if(T.fly)e.noGrav=true;
  if(tp==='wolf'&&world&&world.isl.shadow)e.col='#4a3a6a',e.eye='#C063FF';
  if(tp==='bat'&&world&&world.n===3)e.col='#8a2a1a';
  if(tp==='bird'&&world&&world.n===4)e.col='#3a9ae8';
  return e;}
function hitEnemy(e,dmg,dir,kb,up,hx,hy,big){
  if(e.kind==='boss'){hitBoss(e,dmg,dir,hx,hy,big);return;}
  e.hp-=dmg;e.flash=0.1;e.stun=e.T.heavy?0.18:0.35;e.state='stun';
  e.vx=dir*kb*(e.T.heavy?0.35:1);if(!e.T.fly)e.vy=up*(e.T.heavy?0.3:1);else e.vy=up*0.5;
  sparks(hx,hy,big?'#FFE04A':'#ffffff',big?12:7);popup(e.x,e.y-e.h-6,String(dmg),big?'#FFE04A':'#fff');
  Game.hitstop=big?0.09:0.05;Game.shake=Math.max(Game.shake,big?4:2);SND.play('hit');vibrate(big?25:12);
  Game.addHit();Game.player.mana=Math.min(3,Game.player.mana+0.13);
  if(e.hp<=0)killEnemy(e,dir);}
function killEnemy(e,dir){e.dead=true;Game.stats.kills++;Game.addScore(100*(e.T.heavy?3:1));
  for(let i=0;i<12;i++)part('bit',e.x,e.y-e.h/2,{vx:rnd(-90,90)+dir*60,vy:rnd(-200,-60),grav:600,life:rnd(0.4,0.8),max:0.8,size:rnd(2,3),col:i%3?'#ffffff':(e.col||'#9be35b')});
  part('ring',e.x,e.y-e.h/2,{life:0.25,max:0.25,size:6,col:'#fff'});
  const n=e.T.heavy?4:rndi(1,2);for(let i=0;i<n;i++){const c=mkPick('coin',e.x+rnd(-8,8),e.y-10);c.vy=rnd(-160,-90);c.vx=rnd(-50,50);c.phys=true;world.pickups.push(c);}
  if(Math.random()<0.18){const c=mkPick(Math.random()<0.5?'heart':'orb',e.x,e.y-10);c.vy=-150;c.phys=true;world.pickups.push(c);}
}
function enemyShoot(e,type,tx,ty){const p=Game.player;const dx=tx-e.x,dy=ty-(e.y-e.h*0.6);const d=Math.hypot(dx,dy)||1;
  if(type==='bone'){Game.projs.push({x:e.x,y:e.y-e.h+4,vx:clamp(dx*1.1,-160,160),vy:-220,grav:500,r:4,dmg:1,owner:'e',type:'bone',life:3,f:e.f});}
  else if(type==='shuriken'){Game.projs.push({x:e.x+e.f*6,y:e.y-18,vx:e.f*210,vy:0,r:3,dmg:1,owner:'e',type:'shuriken',life:2.5,f:e.f});}
  else if(type==='fire'){Game.projs.push({x:e.x,y:e.y-e.h*0.6,vx:dx/d*140,vy:dy/d*140,r:4,dmg:1,owner:'e',type:'fire',life:3,f:e.f});}
  SND.play('shoot');}
function updEnemy(e,dt){
  const p=Game.player,T=e.T;e.t+=dt;e.st+=dt;e.flash=Math.max(0,e.flash-dt);e.cd-=dt;
  const dx=p.x-e.x,adx=Math.abs(dx),dy=p.y-e.y,dir=Math.sign(dx)||1;
  const active=!Game.cut&&p.state!=='dead';
  if(e.state==='stun'){e.stun-=dt;e.vx*=Math.pow(0.03,dt);if(T.fly)e.vy*=Math.pow(0.03,dt);if(e.stun<=0){e.state='idle';e.st=0;}}
  else if(active&&adx<300){
    switch(T.ai){
    case'hopper':if(e.onGround){e.vx*=0.8;e.sq=lerp(e.sq||1,1,dt*10);if(e.cd<=0&&adx<230){e.vy=-230;e.vx=dir*75;e.f=dir;e.cd=rnd(0.8,1.4);e.sq=1.4;}}else e.sq=lerp(e.sq||1,1.2,dt*5);break;
    case'brawler':case'ninja':{
      if(e.state==='idle'||e.state==='walk'){e.f=dir;
        if(T.ai==='ninja'&&e.cd<=0&&adx<200&&Math.abs(dy)<30){e.state='throw';e.st=0;e.cd=rnd(1.6,2.4);}
        else if(T.ai==='ninja'&&e.onGround&&e.cd<0.6&&adx>40&&Math.random()<dt*0.8){e.vy=-280;e.vx=dir*120;}
        else if(adx<T.reach+e.w/2+4&&Math.abs(dy)<24&&e.cd<=0.4){e.state='wind';e.st=0;e.vx=0;}
        else{const step=dir*T.spd;if(e.onGround&&!solidBelow(e.x+dir*(e.w/2+3),e.y))e.vx=0;else e.vx=e.onGround?step:e.vx;e.state='walk';}}
      else if(e.state==='wind'){e.vx*=0.7;if(e.st>T.wind){e.state='swing';e.st=0;e.vx=e.f*60;}}
      else if(e.state==='swing'){e.vx*=0.85;if(e.st<0.15){const hb=boxOf(e,[2,-e.h*0.85,T.reach+4,e.h*0.5]);if(ov(hb,bodyBox(p)))hurtPlayer(p,T.dmg,e.f);}if(e.st>0.25){e.state='rec';e.st=0;}}
      else if(e.state==='throw'){e.vx=0;if(e.st>0.3&&!e.thrown){e.thrown=true;enemyShoot(e,T.proj,p.x,p.y-14);}if(e.st>0.5){e.thrown=false;e.state='idle';}}
      else if(e.state==='rec'){e.vx*=0.8;if(e.st>0.55){e.state='idle';e.cd=rnd(0.6,1.2);}}
      break;}
    case'lunger':
      if(e.state==='crouch'){e.vx=0;e.crouch=true;if(e.st>0.42){e.crouch=false;e.state='lunge';e.st=0;e.vx=e.f*250;e.vy=-160;}}
      else if(e.state==='lunge'){if(e.onGround&&e.st>0.1){e.state='idle';e.cd=rnd(1.2,1.8);}}
      else{e.f=dir;if(e.cd<=0&&adx<170&&Math.abs(dy)<40&&e.onGround){e.state='crouch';e.st=0;}
        else{if(e.onGround&&!solidBelow(e.x+dir*(e.w/2+3),e.y))e.vx=0;else e.vx=dir*T.spd*(adx<60?-0.6:1);}}
      e.anim+=Math.abs(e.vx)*dt*0.25;break;
    case'flyer':{const hx=e.home.x,hy=e.home.y;
      if(e.state==='dive'){if(e.st>0.9||e.y>p.y-4){e.state='rise';e.st=0;}}
      else if(e.state==='rise'){e.vy=-110;e.vx*=0.95;if(e.y<hy){e.state='idle';e.cd=rnd(1.0,1.8);}}
      else{e.f=dir;const tx=p.x-dir*20;e.vx=clamp((tx-e.x)*1.4,-90,90);e.vy=(hy+Math.sin(e.t*3)*10-e.y)*3+(T.erratic?Math.sin(e.t*11)*40:0);
        if(e.cd<=0&&adx<70){e.state='dive';e.st=0;const d=Math.hypot(dx,dy-12)||1;e.vx=dx/d*190;e.vy=(dy-12)/d*190;}}
      break;}
    case'thrower':
      e.f=dir;if(e.state==='throw'){e.vx=0;if(e.st>0.35&&!e.thrown){e.thrown=true;enemyShoot(e,'bone',p.x,p.y);}if(e.st>0.6){e.thrown=false;e.state='idle';}}
      else{if(e.cd<=0&&adx<220){e.state='throw';e.st=0;e.cd=rnd(1.8,2.6);}else{const want=adx>110?dir:adx<70?-dir:0;if(e.onGround&&want&&!solidBelow(e.x+want*(e.w/2+3),e.y))e.vx=0;else e.vx=want*T.spd;e.state='walk';}}
      break;
    case'spinner':
      e.anim+=dt*6;if(e.state==='spin'){e.spin=true;if(e.hitWall)e.vx=-e.vx;if(e.st>1.1){e.spin=false;e.state='idle';e.cd=rnd(1.5,2.5);e.vx=0;}}
      else{e.f=dir;e.vx=dir*T.spd;if(e.onGround&&!solidBelow(e.x+dir*(e.w/2+3),e.y))e.vx=0;if(e.cd<=0&&adx<180){e.state='spin';e.st=0;e.vx=dir*210;}}
      if(e.spin&&e.onGround&&!solidBelow(e.x+Math.sign(e.vx)*(e.w/2+2),e.y))e.vx=-e.vx;
      break;
    case'slammer':
      if(e.state==='wind'){e.vx=0;if(e.st>0.65){e.state='slam';e.st=0;Game.shake=5;SND.play('boom');dust(e.x+e.f*14,e.y,10);
        for(const s of[-1,1])Game.projs.push({x:e.x+s*10,y:e.y-4,vx:s*170,vy:0,r:5,dmg:T.dmg,owner:'e',type:'quake',life:0.9,f:s,ground:true});}}
      else if(e.state==='slam'){if(e.st>0.6){e.state='idle';e.cd=rnd(1.0,1.8);}}
      else{e.f=dir;if(adx<44&&e.cd<=0&&Math.abs(dy)<30){e.state='wind';e.st=0;}else{if(e.onGround&&!solidBelow(e.x+dir*(e.w/2+3),e.y))e.vx=0;else e.vx=dir*T.spd;e.state='walk';}}
      break;
    case'caster':{const hy=e.home.y;e.f=dir;e.vy=(hy+Math.sin(e.t*2)*8-e.y)*3;e.vx=clamp(((p.x-dir*90)-e.x)*0.8,-50,50);
      if(e.cd<=0&&adx<240){e.cd=rnd(1.8,2.6);enemyShoot(e,'fire',p.x,p.y-14);}break;}
    }
  }else if(!e.T.fly){e.vx*=0.8;if(e.state!=='stun')e.state='idle';}
  else{e.vx*=0.9;e.vy=(e.home.y+Math.sin(e.t*2)*6-e.y)*2;}
  moveBody(e,dt);
  if(!T.fly&&e.y>H+60)e.dead=true;
  // contact damage
  if(active&&e.state!=='stun'&&ov(bodyBox(e),bodyBox(p))){const cdmg=(T.ai==='brawler'||T.ai==='thrower')?0:T.dmg;if(cdmg)hurtPlayer(p,cdmg,Math.sign(p.x-e.x)||1);}
  if(e.pose){let tgt;const sp=Math.abs(e.vx);
    if(e.state==='stun')tgt=POSES.hurt(e.t);
    else if(e.state==='wind')tgt=T.ai==='slammer'?POSES.slamUp(e.t):POSES.wind(e.t);
    else if(e.state==='swing')tgt=POSES.punch2(e.t);
    else if(e.state==='slam')tgt=POSES.slamDown(e.t);
    else if(e.state==='throw')tgt=POSES[e.st<0.3?'charge':'throwp'](e.t);
    else if(!e.onGround)tgt=POSES.jump(e.t);
    else if(sp>8){e.anim+=sp*dt*0.16;tgt=POSES.walk(e.t,e.anim);}
    else tgt=POSES.idle(e.t);
    blendPose(e.pose,tgt,Math.min(1,dt*22));}
}
function drawEnemy(e){FLASH=e.flash>0;
  if(e.def)drawFig(e.def,e.pose,Math.round(e.x),Math.round(e.y),e.f,{t:e.t,vx:e.vx});else e.T.draw(e);
  FLASH=false;
  if(e.state==='wind'||e.state==='crouch'){if(Math.floor(e.t*12)%2)drawNum('!',e.x,e.y-e.h-14,'#FFE04A',1);}
  if(e.hp<e.maxHp&&!e.dead){const w=16;R(e.x-w/2-1,e.y-e.h-7,w+2,3,'#000');R(e.x-w/2,e.y-e.h-6,w*e.hp/e.maxHp,1,'#ff5a4a');}
}

// ===== Bosses =====
function makeBoss(key,x,y){const C=CHAMPS[key];const hp=Math.ceil(C.hp*(SAVE.opt.diff==='hard'?1.25:SAVE.opt.diff==='easy'?0.75:1));const d=DEF[C.def];
  const s=d.s;return{kind:'boss',key,C,def:d,x,y,vx:0,vy:0,w:Math.round(13*s+(key==='gorrak'?10:0)),h:Math.round(34*s+(key==='gorrak'?4:0)),f:-1,hp,maxHp:hp,t:0,st:0,state:'intro',cd:1.2,
    pose:Object.assign({},POSES.stand(0)),flash:0,dead:false,move:null,hits:0,alpha:1,phase:1,s};}
function hitBoss(b,dmg,dir,hx,hy,big){
  if(b.state==='intro'||b.state==='dead'||b.intang)return;
  b.hp-=dmg;b.flash=0.1;sparks(hx,hy,big?'#FFE04A':'#ffffff',big?14:8);popup(b.x,b.y-b.h-8,String(dmg),big?'#FFE04A':'#fff');
  Game.hitstop=big?0.1:0.05;Game.shake=Math.max(Game.shake,big?5:2);SND.play('hit');vibrate(big?30:14);Game.addHit();
  Game.player.mana=Math.min(3,Game.player.mana+0.1);
  if(b.state==='idle'||b.state==='walk'){b.vx=dir*(big?140:60);b.hits++;
    if(b.hits>=4&&b.state!=='stunned'){b.hits=0;bossSet(b,'rec');b.st=-0.15;b.vx=dir*180;}}
  Game.onBossHurt(b);
  if(b.hp<=0){b.hp=0;bossSet(b,'dead');b.vx=dir*120;b.vy=-200;Game.onBossDead(b);}
}
function bossSet(b,s){b.state=s;b.st=0;}
function bossPick(b){const p=Game.player;const adx=Math.abs(p.x-b.x);const m=b.C.moves;const opts=[];
  for(const k in m){let w=m[k];if(k==='jab')w*=adx<60?3:0.2;if(k==='charge')w*=adx>90?1.5:0.4;if(k==='leap')w*=adx>70?1.3:0.6;if(k==='shoot')w*=adx>100?1.6:0.5;
    if(k==='summon')w*=(Game.world.ents.filter(e=>!e.dead).length<2&&b.phase>1)?1:0;if(k==='teleport')w*=1;opts.push([k,w]);}
  let tot=opts.reduce((a,o)=>a+o[1],0),r=Math.random()*tot;for(const[k,w]of opts){r-=w;if(r<=0)return k;}return 'jab';}
function updBoss(b,dt){
  const p=Game.player;b.t+=dt;b.st+=dt;b.flash=Math.max(0,b.flash-dt);
  const rate=1+(1-b.hp/b.maxHp)*0.5+(b.phase>=3?0.35:0);const dir=Math.sign(p.x-b.x)||1;const adx=Math.abs(p.x-b.x);
  const S=b.s;const reach=18*S+6;
  switch(b.state){
  case'intro':b.vx*=0.8;break;
  case'idle':b.vx*=Math.pow(0.02,dt);b.f=dir;if(!Game.cut&&p.state!=='dead'){b.cd-=dt*rate;if(b.cd<=0){b.move=bossPick(b);b.cd=b.C.think*(1.2-Math.random()*0.4);bossSet(b,'walk');}}break;
  case'walk':{b.f=dir;const m=b.move;
    if(m==='jab'&&adx>reach){b.vx=dir*b.C.spd*rate;if(b.st>1.4)bossSet(b,'idle');}
    else{b.vx=0;bossSet(b,'wind');SND.play('blip');}
    break;}
  case'wind':{b.vx*=0.7;const wt=(b.move==='charge'?0.55:b.move==='leap'?0.35:b.move==='summon'?0.7:b.move==='teleport'?0.25:0.38)/Math.min(rate,1.5);
    if(b.move==='teleport'){b.alpha=1-b.st/wt;}
    if(b.st>=wt){bossSet(b,'act');b.fired=0;
      if(b.move==='charge'){b.vx=b.f*(280+rate*30);SND.play('dash');}
      if(b.move==='leap'){b.vy=-430;const tt=2*430/GRAV;b.vx=clamp((p.x-b.x)/tt,-260,260);SND.play('jump');}
      if(b.move==='teleport'){b.x=clamp(p.x-p.f*34,30,450);b.f=Math.sign(p.x-b.x)||1;b.alpha=1;part('ring',b.x,b.y-b.h/2,{life:0.25,max:0.25,size:8,col:'#C063FF'});b.move='jab';b.st=-0.08;}
      if(b.move==='summon'){SND.play('roar');Game.shake=6;for(const sx of[30,450]){const tp=Math.random()<0.5?'orc':'skeleton';const e=makeEnemy(tp,sx,-20);Game.world.ents.push(e);}}
    }break;}
  case'act':{const m=b.move;
    if(m==='jab'){b.vx*=0.85;const hitT=[0.05,0.3];for(let i=0;i<2;i++){if(b.st>=hitT[i]&&b.fired===i){b.fired=i+1;b.vx=b.f*90;SND.play('punch');
        const hb=boxOf(b,[2,-b.h*0.85,reach,b.h*0.45]);if(ov(hb,bodyBox(p)))hurtPlayer(p,b.key==='gorrak'?2:1,b.f,200);}}
      if(b.st>0.55)bossSet(b,'rec');}
    else if(m==='charge'){if(Math.random()<0.5)dust(b.x,b.y,1,-b.f);if(ov(bodyBox(b),bodyBox(p)))hurtPlayer(p,2,b.f,240);
      if(b.hitWall){bossSet(b,'stunned');b.vx=-b.f*80;b.vy=-120;Game.shake=6;SND.play('boom');dust(b.x+b.f*b.w/2,b.y-10,10);}
      else if(b.st>1.3)bossSet(b,'rec');}
    else if(m==='leap'){if(b.onGround&&b.st>0.15){Game.shake=7;SND.play('boom');vibrate(30);dust(b.x,b.y,14);part('shock',b.x,b.y,{life:0.4,max:0.4,col:'#fff'});
        for(const s of[-1,1])Game.projs.push({x:b.x+s*12,y:b.y-4,vx:s*190,vy:0,r:6,dmg:1,owner:'e',type:'quake',life:1.4,f:s,ground:true});bossSet(b,'rec');}
      else if(ov(bodyBox(b),bodyBox(p))&&b.vy>0)hurtPlayer(p,2,dir*-1||1);}
    else if(m==='shoot'){b.vx=0;if(b.st>0.08&&!b.fired){b.fired=1;bossShoot(b);}if(b.st>0.45)bossSet(b,'rec');}
    else if(m==='summon'){if(b.st>0.5)bossSet(b,'rec');}
    break;}
  case'rec':b.vx*=Math.pow(0.03,dt);if(b.st>0.5/Math.min(rate,1.4))bossSet(b,'idle');break;
  case'stunned':b.vx*=Math.pow(0.05,dt);if(b.st>1.1)bossSet(b,'idle');break;
  case'dead':b.vx*=Math.pow(0.2,dt);break;
  }
  moveBody(b,dt);
  // pose
  let tgt,r=18;const sp=Math.abs(b.vx);
  if(b.state==='dead')tgt=POSES.ko(b.t),r=8;
  else if(b.state==='stunned')tgt=POSES.hurt(b.t);
  else if(b.state==='rec'&&b.st<0)tgt=POSES.hurt(b.t);
  else if(b.state==='wind'){tgt=POSES[{charge:'crouch',leap:'crouch',shoot:'charge',summon:'slamUp',teleport:'crouch'}[b.move]||'wind'](b.t);r=14;}
  else if(b.state==='act'){const m=b.move;
    if(m==='jab')tgt=POSES[b.fired===1?'punch1':'punch2'](b.t),r=40;
    else if(m==='charge')tgt=POSES.dash(b.t),r=30;
    else if(m==='leap')tgt=POSES[b.vy<0?'slamUp':'slamDown'](b.t),tgt.air=1;
    else if(m==='shoot')tgt=POSES.release(b.t),r=35;
    else tgt=POSES.slamUp(b.t);}
  else if(!b.onGround)tgt=POSES.jump(b.t);
  else if(sp>20){b.ph=(b.ph||0)+sp*dt*0.1;tgt=POSES[sp>100?'run':'walk'](b.t,b.ph);}
  else tgt=POSES[b.state==='intro'?'stand':'idle'](b.t);
  blendPose(b.pose,tgt,Math.min(1,dt*r));
}
function bossShoot(b){const p=Game.player;const f=b.f;const y=b.y-b.h*0.6;SND.play('shoot');
  switch(b.C.proj){
  case'wind':for(let i=-1;i<=1;i++)Game.projs.push({x:b.x+f*14,y:y+i*10,vx:f*230,vy:i*30,r:5,dmg:1,owner:'e',type:'wind',life:2,f});break;
  case'fire':{const dx=p.x-b.x,dy=(p.y-14)-y,d=Math.hypot(dx,dy)||1;Game.projs.push({x:b.x+f*14,y,vx:dx/d*220,vy:dy/d*220,r:7,dmg:2,owner:'e',type:'bigfire',life:2.5,f});break;}
  case'wave':Game.projs.push({x:b.x+f*14,y:b.y-4,vx:f*200,vy:0,r:7,dmg:2,owner:'e',type:'wave',life:2.4,f,ground:true});break;
  case'rock':{const tt=1.0;Game.projs.push({x:b.x+f*10,y:b.y-b.h,vx:(p.x-b.x)/tt,vy:-GRAV*tt/2+((p.y-(b.y-b.h)))/tt,grav:GRAV,r:8,dmg:2,owner:'e',type:'rock',life:2.5,f});break;}
  case'shadow':for(let i=0;i<2;i++)Game.projs.push({x:b.x+f*12,y:y-i*14,vx:f*(120+i*40),vy:0,r:6,dmg:1,owner:'e',type:'shadow',life:3,f,home:true});break;
  case'quake':for(let i=0;i<3;i++)Game.projs.push({x:b.x+f*(16+i*4),y:b.y-4,vx:f*(150+i*50),vy:0,r:6,dmg:2,owner:'e',type:'quake',life:1.8,f,ground:true});Game.shake=4;break;
  }}
function drawBoss(b){FLASH=b.flash>0;G.globalAlpha=b.alpha;
  if((b.state==='wind')&&Math.floor(b.t*14)%2)FLASH=true;
  drawFig(b.def,b.pose,Math.round(b.x),Math.round(b.y),b.f,{t:b.t,vx:b.vx,rage:b.phase>=3});
  FLASH=false;G.globalAlpha=1;
  if(b.state==='stunned'){for(let i=0;i<3;i++){const a=b.t*5+i*2.1;R(b.x+Math.cos(a)*10,b.y-b.h-8+Math.sin(a)*3,2,2,'#FFE04A');}}
  if(b.phase>=3&&Math.random()<0.4)part('glow',b.x+rnd(-14,14),b.y-rnd(0,b.h),{vy:-40,life:0.4,max:0.4,size:3,col:'#ff4a3a'});
  if(b.C.def==='blaze'&&Math.random()<0.3)part('glow',b.x+rnd(-6,6),b.y-rnd(0,6),{vy:-30,life:0.3,max:0.3,size:2,col:'#FFB13A'});
}

// ===== Projectiles =====
function updProjs(dt){const p=Game.player;
  for(const q of Game.projs){q.life-=dt;if(q.grav)q.vy+=q.grav*dt;
    if(q.home){const dy=(p.y-16)-q.y;q.vy+=clamp(dy,-1,1)*160*dt;q.vy*=0.98;}
    q.x+=q.vx*dt;q.y+=q.vy*dt;q.t=(q.t||0)+dt;
    if(q.ground){if(!solidBelow(q.x,q.y+4)){q.life=0;}if(Math.random()<0.5)dust(q.x,q.y+3,1);}
    if(q.type==='blast'||q.type==='fist'){if(Math.random()<0.8)part('glow',q.x-q.f*q.r,q.y+rnd(-q.r/2,q.r/2),{vx:-q.f*30,life:0.2,max:0.2,size:q.type==='fist'?5:3,col:q.type==='fist'?'#F5B83D':'#7fb0ff'});}
    if(q.type==='bigfire'||q.type==='fire'){if(Math.random()<0.6)part('glow',q.x,q.y,{vy:-20,life:0.25,max:0.25,size:3,col:'#FF7A1A'});}
    if(q.owner==='p'){for(const e of Game.targets()){if(e.dead||q.hit.has(e)||e.intang)continue;
        if(ov({x:q.x-q.r,y:q.y-q.r,w:q.r*2,h:q.r*2},bodyBox(e))){q.hit.add(e);const big=q.type==='fist';hitEnemy(e,q.dmg*(p.power>0?2:1),q.f,big?260:160,big?-200:-90,q.x,q.y,true);if(!q.pierce){q.life=0;sparks(q.x,q.y,'#7fb0ff',10);}}}}
    else if(ov({x:q.x-q.r+1,y:q.y-q.r+1,w:q.r*2-2,h:q.r*2-2},bodyBox(p))){if(hurtPlayer(p,q.dmg,Math.sign(q.vx)||1))q.life=0;}
    if(q.owner==='e'){for(const pq of Game.projs){if(pq.owner==='p'&&pq.life>0&&Math.hypot(pq.x-q.x,pq.y-q.y)<pq.r+q.r){q.life=0;sparks(q.x,q.y,'#fff',6);if(pq.type==='blast')pq.life=0;}}}
    if(q.x<-60+Game.camX||q.x>Game.camX+W+60)q.life=0;
    if(!q.grav&&!q.ground&&!q.home&&q.owner==='e'&&q.y>H)q.life=0;
    if(q.grav&&q.y>H+20)q.life=0;
    if(q.grav&&q.type==='rock'&&solidBelow(q.x,q.y)&&q.vy>0){q.life=0;Game.shake=4;SND.play('boom');dust(q.x,q.y,8);for(const s of[-1,1])Game.projs.push({x:q.x,y:q.y-4,vx:s*140,vy:0,r:4,dmg:1,owner:'e',type:'quake',life:0.5,f:s,ground:true});}
  }
  Game.projs=Game.projs.filter(q=>q.life>0);}
function drawProj(q){const x=Math.round(q.x),y=Math.round(q.y),t=q.t||0;
  switch(q.type){
  case'blast':{const r=q.r+Math.sin(t*30);G.globalAlpha=0.4;R(x-r-3,y-r-1,r*2+6,r*2+2,'#3d7dff');G.globalAlpha=1;R(x-r,y-r+1,r*2,r*2-2,'#7fb0ff');R(x-r+2,y-r+3,r*2-4,r*2-6,'#e8f2ff');R(x-q.f*(r+4),y-2,4,4,'#7fb0ff');break;}
  case'fist':{const r=q.r;const f=q.f;G.globalAlpha=0.35;R(x-r-6,y-r-4,r*2+12,r*2+8,'#F5B83D');G.globalAlpha=1;
    R(x-r,y-r+2,r*2,r*2-4,'#7a3a00');R(x-r+2,y-r+3,r*2-4,r*2-6,'#FFD23A');for(let i=0;i<4;i++)R(x+f*(r-5)-(f>0?0:3),y-r+4+i*6,4,4,'#FFF0A0');R(x-f*r-(f>0?8:-2),y-6,8,12,'#E0362C');break;}
  case'bone':{const a=t*14;seg(x-Math.cos(a)*4,y-Math.sin(a)*4,x+Math.cos(a)*4,y+Math.sin(a)*4,2,'#EEE9DA');break;}
  case'shuriken':{const a=t*20;for(let i=0;i<4;i++){const an=a+i*PI/2;seg(x,y,x+Math.cos(an)*4,y+Math.sin(an)*4,1,'#cfd8e8');}R(x-1,y-1,2,2,'#333');break;}
  case'fire':R(x-4,y-4,8,8,'#B8341A');R(x-3,y-3,6,6,'#FF7A1A');R(x-1,y-2,3,3,'#FFF0A0');break;
  case'bigfire':R(x-7,y-7,14,14,'#B8341A');R(x-6,y-6,12,12,'#FF7A1A');R(x-3,y-4,6,6,'#FFE07A');R(x-q.f*10,y-3,5,6,'#FF7A1A');break;
  case'wind':{G.globalAlpha=0.85;for(let i=0;i<3;i++)R(x-6+i*2-q.f*i*3,y-4+i*3,12-i*3,2,i?'#bff7ee':'#ffffff');G.globalAlpha=1;break;}
  case'wave':{const h=12+Math.sin(t*20)*2;R(x-7,y-h+4,14,h,'#1D7F9A');R(x-5,y-h+5,10,h-3,'#2BB5C8');R(x-4,y-h+4,8,2,'#ffffff');break;}
  case'rock':R(x-8,y-8,16,16,'#3a342c');R(x-7,y-7,14,14,'#8C8578');R(x-5,y-6,5,3,'#b0a898');break;
  case'shadow':{const r=6+Math.sin(t*15);G.globalAlpha=0.5;R(x-r-2,y-r-2,r*2+4,r*2+4,'#4a1f7a');G.globalAlpha=1;R(x-r+1,y-r+1,r*2-2,r*2-2,'#8a4fd0');R(x-2,y-2,4,4,'#e8d0ff');break;}
  case'flowerT':R(x-3,y-3,3,3,'#fff');R(x,y-3,3,3,'#fff');R(x-3,y,3,3,'#fff');R(x,y,3,3,'#fff');R(x-1,y-1,2,2,'#F5B83D');break;
  case'quake':{const h=8+Math.sin(t*30)*3;R(x-4,y-h+4,8,h,'#d9c8a8');R(x-2,y-h,4,4,'#fff');R(x-6,y+2,12,2,'#8a7a5a');break;}
  }}

// ===== Ground shadow =====
function groundBelow(x,y){let best=null;for(const s of world.ground)if(x>=s.x&&x<=s.x+s.w&&s.y>=y-1&&(best===null||s.y<best))best=s.y;
  for(const p of world.plats)if(x>=p.x&&x<=p.x+p.w&&p.y>=y-1&&(best===null||p.y<best))best=p.y;return best;}
function drawShadow(e,wid){const gy=groundBelow(e.x,e.y);if(gy===null)return;const d=gy-e.y;if(d>120)return;const k=1-d/140;const w=Math.round((wid||e.w*1.3)*k);if(w<3)return;
  G.globalAlpha=0.28*k;R(e.x-w/2,gy-1,w,2,'#000');R(e.x-w/2+2,gy-2,w-4,1,'#000');G.globalAlpha=1;}
