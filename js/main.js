/* ============================================================
   朱智繁 · Portfolio — 交互逻辑
   ============================================================ */
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function showNative(on){ localStorage.setItem('jh-cursor', on?'native':'custom'); document.body.classList.toggle('native-cursor',on); }

  /* ---------- 平滑滚动：锚点 ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href');
      if(id.length<2) return;
      const el = document.querySelector(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:prefersReduced?'auto':'smooth'}); }
      const nav = document.getElementById('nav');
      nav.classList.remove('show-menu');
      document.getElementById('burger').classList.remove('open');
    });
  });

  /* ---------- 自定义光标 ---------- */
  const dot=document.getElementById('cursorDot');
  const ring=document.getElementById('cursorRing');
  const label=document.getElementById('cursorLabel');
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches && !prefersReduced){
    showNative(false);                                    // 隐藏原生光标，避免与定制光标"错位叠影"
    let mx=innerWidth/2,my=innerHeight/2;
    window.addEventListener('mousemove',e=>{
      mx=e.clientX; my=e.clientY;
      // 圆点 + 圆环 + 星云头部全部精确贴合鼠标 —— 不再滞后错位
      dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
      ring.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
      label.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%) scale(1)`;
    });
    window.addEventListener('mousedown',()=>ring.classList.add('down'));
    window.addEventListener('mouseup',()=>ring.classList.remove('down'));
    const hoverSel='a,button,.work,.entry,.trait,.contact__item,[data-magnetic]';
    const showLabel=e=>{
      if(e.target.closest('[data-cursor]')){label.textContent='GO';return true;}
      if(e.target.closest('a.work')){label.textContent='PLAY';return true;}
      if(e.target.closest('.entry[data-soon]')){label.textContent='敬请期待';return true;}
      return false;
    };
    document.addEventListener('mouseover',e=>{
      if(e.target.closest(hoverSel)) ring.classList.add('hover');
      if(showLabel(e)) label.classList.add('show');
    });
    document.addEventListener('mouseout',e=>{
      if(e.target.closest(hoverSel)) ring.classList.remove('hover');
      if(showLabel(e)) label.classList.remove('show');
    });
    window.addEventListener('mousemove',e=>{
      label.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%) scale(1)`;
    });
  }

  /* ---------- 磁性按钮 ---------- */
  document.querySelectorAll('[data-magnetic]').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
      el.style.transform=`translate(${dx*.3}px,${dy*.3}px)`;
    });
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });

  /* ---------- 英雄区光晕视差 ---------- */
  const hero=document.getElementById('home');
  const orbs=document.querySelectorAll('.orb');
  if(hero && orbs.length && !prefersReduced){
    hero.addEventListener('mousemove',e=>{
      const r=hero.getBoundingClientRect();
      const nx=(e.clientX-r.left)/r.width-.5, ny=(e.clientY-r.top)/r.height-.5;
      orbs.forEach((o,i)=>{ o.style.translate=`${nx*-(30+i*12)}px ${ny*-(22+i*9)}px`; });
    });
    hero.addEventListener('mouseleave',()=>orbs.forEach(o=>o.style.translate=''));
  }

  /* ---------- 开场(照做 ricardochance)：打字机句子 → 左右两半帘向两侧拉开 ---------- */
  const startIntro=()=>{
    document.body.style.overflow='auto';
    document.body.classList.add('ready');
    (window.__pendingReveals||[]).forEach(el=>window.__revealIO&&window.__revealIO.observe(el));
    window.__pendingReveals=null;
    // 强制重新触发数字滚动(开场时已在视口内的元素不会自动再回调)
    document.querySelectorAll('[data-count]').forEach(el=>{cio.unobserve(el);cio.observe(el);});
  };
  const intro=document.getElementById('intro');
  if(prefersReduced){
    intro&&intro.remove(); startIntro();
  }else{
    document.body.style.overflow='hidden';
    // 帘开后的首屏逐字淡入：英文眉题→中文名→英文名→箴言，从上往下、从左往右(提速版)
    let cursor=0.15, lastEnd=0;
    [['.hero__meta .eyebrow',.014],
     ['.hero__title .line--zh',.026],
     ['.hero__title .line--en',.01],
     ['.hero__tag',.02]].forEach(([sel,step])=>{
      const el=document.querySelector(sel); if(!el)return;
      cursor+=0.07; // 段间小停顿
      const txt=el.textContent; el.textContent='';
      [...txt].forEach(ch=>{
        const s=document.createElement('span'); s.className='h-ch';
        s.style.transitionDelay=cursor.toFixed(2)+'s';
        s.innerHTML=ch===' '?'&nbsp;':ch;
        el.appendChild(s); cursor+=step;
      });
      lastEnd=cursor;
    });
    // 三段逐字完成后，简介等整体淡入
    document.documentElement.style.setProperty('--rest-delay',(lastEnd+0.2).toFixed(2)+'s');
    // 打字机：两半帘内的句子逐字符拆分，从左往右依次瞬时显现(两份同步)
    let totalChars=0;
    document.querySelectorAll('.intro__text').forEach(el=>{
      if(el.dataset.typed)return; el.dataset.typed=true;
      const nodes=[...el.childNodes]; el.textContent='';
      let idx=0;
      const push=(ch,em)=>{
        const s=document.createElement('span'); s.textContent=ch; s.className='ty'+(em?' ty--em':'');
        s.style.animationDelay=(0.35+idx*0.05)+'s'; el.appendChild(s); idx++;
      };
      nodes.forEach(n=>{
        if(n.nodeType===1){ [...n.textContent].forEach(ch=>push(ch,true)); }
        else{ [...n.textContent].forEach(ch=>push(ch,false)); }
      });
      totalChars=idx;
    });
    const typeDone=Math.max(350+totalChars*50+250,1500); // 打字完成留定格
    // 第一步：打完字 → 中间先裂开一道缝；第二步：再完全拉开
    setTimeout(()=>{intro&&intro.classList.add('crack');},typeDone);
    setTimeout(()=>{
      intro&&intro.classList.add('done');   // 两半帘完全拉开
      startIntro();                          // 同时首屏开始依次淡入
      setTimeout(()=>{intro&&intro.remove();},1300);
    },typeDone+600);
  }

  /* ---------- 出场动效：错落·多方向 ---------- */
  // 1) 网格类容器：按列分配 左/中上/右 方向的弹入 + 渐进延时
  const staggerSel='.traits,.works__grid,.space__grid,.contact__row,.stats__grid,.certs__list';
  if(!prefersReduced){
    document.querySelectorAll(staggerSel).forEach(g=>{
      [...g.children].forEach((el,i)=>{
        el.classList.remove('reveal');
        el.classList.add('rev');
        const kind= g.classList.contains('vstack') ? 'rev-up'
          : (i%3===0?'rev-fromL':i%3===2?'rev-fromR':(i%6===2?'rev-scale':'rev-up'));
        el.classList.add(kind);
        el.style.setProperty('--d',(g.classList.contains('vstack')?i*170:i*140)+'ms');
      });
    });
  }
  // 证书图片加载成功后隐藏占位文字
  document.querySelectorAll('.rack img').forEach(img=>{
    img.addEventListener('load',()=>img.classList.add('ok'));
    if(img.complete) img.classList.add('ok');
  });
  // 2) 标题字符逐个蒙版揭示（切分保留强调字符）
  document.querySelectorAll('.sec-head__title,.contact__title').forEach(el=>{
    if(el.dataset.split)return;
    el.dataset.split=true; el.classList.add('split');
    const units=[]; let idx=0;
    Array.from(el.childNodes).forEach(node=>{
      if(node.nodeType===3){ for(const ch of node.textContent) units.push(ch); }
      else if(node.tagName && node.tagName.toLowerCase()==='br') units.push(node);
      else { for(const l of node.textContent) units.push(l); if(node.children.length&&node.textContent.length===0) units.push(node); }
    });
    el.textContent='';
    units.forEach(u=>{
      if(u instanceof Node && u.tagName && u.tagName.toLowerCase()==='br'){ el.appendChild(u); return; }
      const mask=document.createElement('span'); mask.className='chw';
      const ch=document.createElement('span'); ch.className='ch';
      if(u instanceof Node) ch.appendChild(u); else ch.textContent=u;
      ch.style.transitionDelay=(idx++*42)+'ms';
      mask.appendChild(ch); el.appendChild(mask);
    });
  });
  // 3) 统一观察器：进入/离开都触发 —— 回到该区域时重新播放动画
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      en.target.classList.toggle('in-view',en.isIntersecting);
      // 进入区块时标题等元素触发一次"文字闪动"
      if(en.isIntersecting && en.target.classList.contains('split')){
        en.target.classList.remove('flick'); void en.target.offsetWidth; en.target.classList.add('flick');
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -12% 0px'});
  window.__revealIO=io;
  // 首屏元素等开场动画结束后才开始观察，避免动效在遮罩后面白白播完
  if(document.body.classList.contains('ready')){
    document.querySelectorAll('.reveal,.rev,.split,.big-outline').forEach(el=>io.observe(el));
  }else{
    window.__pendingReveals=[...document.querySelectorAll('.reveal,.rev,.split,.big-outline')];
  }

  /* ---------- 英雄标题：整块柔和淡入(参考 ricardochance，不再逐字) ---------- */

  /* ---------- 数字滚动：等开场结束后，每次进入区域都从0滚到目标，离开归零 ---------- */
  const cio=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(!document.body.classList.contains('ready'))return; // 开场帘子期间不播
      const el=en.target;
      if(!en.isIntersecting){ el.textContent='0'; el.dataset.playing=''; return; }
      if(el.dataset.playing)return;
      el.dataset.playing='1';
      const target=+el.dataset.count,start=performance.now(),dur=1300;
      function step(now){ const p=Math.min((now-start)/dur,1);
        el.textContent=Math.floor((prefersReduced?1:p)*target);
        if(p<1)requestAnimationFrame(step); else delete el.dataset.playing; }
      requestAnimationFrame(step);
    });
  },{threshold:.3,rootMargin:'0px 0px 6% 0px'});
  document.querySelectorAll('[data-count]').forEach(c=>cio.observe(c));

  /* ---------- 图片滚动视差 ---------- */
  function setupParallax(){
    const els=[...document.querySelectorAll('.entry__media')];
    if(!els.length)return;
    const vh=innerHeight;
    const update=()=>{
      els.forEach(m=>{
        const r=m.getBoundingClientRect();
        const img=m.querySelector('img'); if(!img)return;
        const c=(r.top+r.bottom)/2 - vh/2;
        img.style.setProperty('--py',(-c*.09).toFixed(1)+'px');
      });
    };
    let t=null;
    window.addEventListener('scroll',()=>{ if(!t) t=requestAnimationFrame(()=>{t=null;update();}); },{passive:true});
    update();
  }
  if(!prefersReduced) setupParallax();

  /* ---------- 导航滚动状态 / 高亮 + 侧边进度导航 ---------- */
  const nav=document.getElementById('nav');
  const navLinks=[...document.querySelectorAll('[data-nav]')];
  // 用与背景同步的 6 个锚点构建侧边导航
  const SN=[
    ['home','首页','HOME'],['about','特质','ABOUT'],['works','作品','WORKS'],
    ['certs','证书','CERTS'],['space','空间','SPACE'],['contact','联系','CONTACT']
  ];
  const sideNav=document.getElementById('sideNav');
  if(sideNav){
    sideNav.innerHTML=SN.map(([id,cn,en])=>
      `<a href="#${id}" data-sn="${id}" aria-label="${cn}"><span class="sn-num">${en}</span>
       <span class="sn-name">${cn}</span><span class="sn-dot"></span></a>`).join('');
  }
  sideNav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',e=>{
      const el=document.querySelector(a.getAttribute('href'));
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:prefersReduced?'auto':'smooth'}); }
    });
  });
  const sections=[...document.querySelectorAll('#home,#about,#works,#certs,#space,#contact')];
  let prevCur='';
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled',scrollY>50);
    let cur='',idx=0;
    sections.forEach((s,i)=>{ if(scrollY>=s.offsetTop-150){cur=s.id;idx=i;} });
    navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
    sideNav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.dataset.sn===cur));
    sections.forEach((s,i)=>s.classList.toggle('side-on',s.id===cur));
    if(cur!==prevCur){
      prevCur=cur;
      document.body.classList.add('bg-pop');
      setTimeout(()=>document.body.classList.remove('bg-pop'),900);
    }
  },{passive:true});

  /* ---------- 移动端菜单 ---------- */
  const burger=document.getElementById('burger');
  burger.addEventListener('click',()=>{
    const open=nav.classList.toggle('show-menu');
    burger.classList.toggle('open',open);
  });

  /* ---------- 占位入口提示 ---------- */
  document.querySelectorAll('[data-soon]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));

  /* ---------- 作品卡片 3D 呼应倾转 ---------- */
  if(!prefersReduced){
    document.querySelectorAll('.entry,.trait').forEach(card=>{
      card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        card.style.transition='transform .06s linear';
        card.style.transform=`translateY(-10px) rotateX(${(py-.5)*-4}deg) rotateY(${(px-.5)*4}deg)`;
        card.style.transformStyle='preserve-3d';
      });
      card.addEventListener('mouseleave',()=>{ card.style.transition=''; card.style.transform=''; });
    });
  }

  /* ---------- 横向画卷引擎 (纵向滚动 → 横向右移) ---------- */
  const hp=document.querySelector('[data-pin]');
  if(hp){
    const track=document.getElementById('worksTrack');
    const cards=[...track.querySelectorAll('.work')];
    const reduce=prefersReduced;
    function update(){
      const travel=Math.max(0,track.scrollWidth-innerWidth);
      hp.style.height=(innerHeight+travel)+'px';           // 用滚动距离撑出纵向高度
      const total=hp.offsetHeight-innerHeight;
      const rect=hp.getBoundingClientRect();
      const scrolled=Math.min(Math.max(-rect.top,0),total);
      const p= total>0? scrolled/total : 0;
      track.style.transform=`translate3d(${(-p*travel).toFixed(1)}px,0,0)`; // 右→左 平移
      if(reduce) return;
      // 卡片随画卷推进而逐张浮现(已还原为上浮+缩放)
      cards.forEach((c,i)=>{
        const v=Math.min(Math.max(p*cards.length-i,0),1);
        c.style.opacity=v;
        c.style.transform=`scale(${(0.72+v*.28).toFixed(3)}) translateY(${((1-v)*46).toFixed(1)}px)`;
      });
    }
    let ticking=false;
    window.addEventListener('scroll',()=>{ if(!ticking){ requestAnimationFrame(()=>{ticking=false;update();}); ticking=true; } },{passive:true});
    window.addEventListener('resize',update);
    update();
  }

  /* ---------- 抽屉叠放引擎 (界面不动·图片从下往上堆叠) ---------- */
  const sk=document.querySelector('[data-stack]');
  if(sk){
    const racks=[...sk.querySelectorAll('.rack')];
    const n=racks.length;
    const reduce=prefersReduced;
    function update(){
      const travel=innerHeight*n*0.62;                 // 滚动距离 → 逐张顶出
      sk.style.height=(innerHeight+travel)+'px';
      const total=sk.offsetHeight-innerHeight;
      const rect=sk.getBoundingClientRect();
      const sc=Math.min(Math.max(-rect.top,0),total);
      const p= total>0? sc/total : 1;
      // 标题随证书全程淡出：第一张证书一出现即开始变淡，到最后一张(第n张)到位时彻底消失 —— 全程线性插帧
      const title=sk.querySelector('.pstack__title');
      if(title) title.style.opacity=Math.max(0,Math.min(1,1-p)).toFixed(3);
      racks.forEach((r,i)=>{
        const t= Math.min(Math.max(p*n-i,0),1);        // 依次从下往上弹出
        const e= reduce?1: (1-Math.pow(1-t,3));        // 缓出
        const restY=i*-70;                             // 落定后竖直叠放(向上升) —— 非斜排
        const dy=restY+(1-e)*innerHeight*0.85;         // 起始在画面下方,再升起
        r.style.transform=`translate3d(0px,${dy.toFixed(1)}px,0) scale(${(0.8+0.2*e).toFixed(3)})`;
        r.style.opacity=e;
        r.style.zIndex=i;                              // 最新弹出的证书在最上层(每张都有被完整看见的机会)
        r.style.pointerEvents=i===n-1?'auto':'none';
      });
    }
    let t2=false;
    window.addEventListener('scroll',()=>{ if(!t2){ requestAnimationFrame(()=>{t2=false;update();}); t2=true; } },{passive:true});
    window.addEventListener('resize',update);
    update();
  }

  /* ---------- 鼠标跟随星云拖尾(已移除：星尘驱散特效已删除，仅保留自定义小白点光标) ---------- */

  /* ---------- 动态环境背景 (流彩·随区块变色·星尘) ---------- */
  const bgfx=document.getElementById('bgfx');
  if(bgfx && !prefersReduced){
    const ctx=bgfx.getContext('2d');
    let W=0,H=0,DPR=1;
    const fit=()=>{ DPR=Math.min(devicePixelRatio||1,1.5);
      W=innerWidth; H=innerHeight;
      bgfx.width=W*DPR; bgfx.height=H*DPR;
      ctx.setTransform(DPR,0,0,DPR,0,0); };
    fit(); addEventListener('resize',fit);

    // 各区块专属色板 (随滚动平滑过渡) —— atlasmotion 式"颜色跟故事走"
    const PALETTES=[
      [[168,140,255],[255,120,200],[80,210,255]],    // 首页 · 鲜紫粉青
      [[255,170,90],[190,130,255],[255,110,160]],    // 关于 · 蜜桃洋红
      [[70,150,255],[80,235,200],[190,120,255]],     // 作品 · 宝蓝青紫
      [[255,140,60],[255,80,150],[130,220,90]],      // 证书 · 落日橘红
      [[60,140,255],[170,120,255],[80,230,220]],     // 空间 · 深海蓝
      [[90,230,120],[255,180,80],[110,160,255]]      // 联系 · 生机绿橙
    ];
    const anchors=['home','about','works','certs','space','contact']
      .map(id=>document.getElementById(id)).filter(Boolean);
    let stops=[];
    const buildStops=()=>{ stops=anchors.map((el,i)=>({y:el.offsetTop,c:PALETTES[Math.min(i,PALETTES.length-1)]})); };
    buildStops(); addEventListener('resize',buildStops);
    setTimeout(buildStops,1200);                    // 吸顶区块撑高后再校准一次

    const lerp=(a,b,t)=>a+(b-a)*t;
    function paletteAt(sy){
      if(!stops.length) return PALETTES[0];
      // 每个导航区块一个明确主色；区块间交给帧级 lerp 平滑过渡，进度感更明显
      let idx=0;
      for(let i=0;i<stops.length;i++) if(sy>=stops[i].y-80) idx=i;
      return stops[idx].c;
    }

    // 移动端渲染能力有限：降低粒子密度保流畅，效果不变(星尘分层/流星/色团仍在)
    const MOBILE=innerWidth<768;
    // 游动色团 —— 更大、更快、更张扬
    const blobs=Array.from({length:MOBILE?6:9},(_,i)=>({
      bx:.5+.46*Math.cos(i*1.9+1.3), by:.42+.4*Math.sin(i*1.55+.7),
      r:i%2? .72:.6, sp:.00034+i*.00012, ph:i*1.71, px:.06+i*.014
    }));
    // 星尘粒子 —— 三层纵深 + 亮星 + 流星
    const mkDust=(n,mn,mx,vn,vx)=>{
      return Array.from({length:n},()=>({
        x:Math.random(), y:Math.random(), s:Math.random()*(mx-mn)+mn,
        v:Math.random()*(vx-vn)+vn, a:Math.random()*0.4+0.1
      }));
    };
    const dustFar=mkDust(MOBILE?40:80,.6,1.4,.00010,.0002);   // 远景 · 小而慢
    const dustMid=mkDust(MOBILE?35:70,1.2,2.4,.0002,.0004);   // 中景
    const dustNear=mkDust(MOBILE?26:55,2.0,3.8,.0004,.0008);  // 近景 · 大而快
    // 亮星 —— 带淡蓝辉光
    const bright=Array.from({length:MOBILE?8:16},()=>({
      x:Math.random(), y:Math.random(), s:Math.random()*2+1.5,
      v:.00012+Math.random()*.00012, ph:Math.random()*6.28, tw:Math.random()*.0015+.0008
    }));
    // 流星
    let shooters=[];
    function spawnShooter(){
      shooters.push({
        x:Math.random()*W, y:Math.random()*H*.5,
        vx:(Math.random()*.22+.14)*(Math.random()<.5?-1:1), vy:Math.random()*.22+.26, life:0,
        max:90+Math.random()*60, len:120+Math.random()*90
      });
    }
    let nextShoot=Date.now()+1200;

    let cur=null, lastSy=-1;
    window.__bgTick=0;                              // 调试探针：每帧 +1
      (function frame(now){
      if(!document.hidden){
        window.__bgTick++;
        const sy=scrollY;
        const tgt=sy!==lastSy?paletteAt(sy):(cur||PALETTES[0]);
        if(!cur) cur=tgt.map(c=>[...c]); else cur.forEach((c,i)=>c.forEach((v,j)=>cur[i][j]=lerp(v,tgt[i][j],.12)));
        lastSy=sy;

        ctx.clearRect(0,0,W,H);
        const base=getComputedStyle(document.body).backgroundColor||'#f4f5fb';
        ctx.fillStyle=base; ctx.fillRect(0,0,W,H);

        const R=Math.max(W,H);
        blobs.forEach((b,i)=>{
          const c=cur[i%cur.length];
          const ox=W*b.bx + Math.cos(now*b.sp+b.ph)*W*.18;
          const oy=(H*b.by + Math.sin(now*b.sp*1.3+b.ph)*H*.22 - sy*b.px*.14);
          const wrap=H+R;                                  // 循环回收，长页不断供
          const yy=((oy%wrap)+wrap)%wrap - R*.4;
          const rr=R*b.r*(1+.14*Math.sin(now*b.sp*2.4+b.ph));
          const g=ctx.createRadialGradient(ox,yy,0,ox,yy,rr);
          g.addColorStop(0,`rgba(${c.map(Math.round).join(',')},.55)`);
          g.addColorStop(.6,`rgba(${c.map(Math.round).join(',')},.22)`);
          g.addColorStop(1,'rgba(255,255,255,0)');
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(ox,yy,rr,0,7); ctx.fill();
        });

        // 三层星尘 —— 越近越大越快，制造纵深
        const drawDust=layer=>{
          layer.forEach(d=>{
            d.y-=d.v; if(d.y<-.02){d.y=1.02;d.x=Math.random();}
            ctx.globalAlpha=d.a;
            ctx.beginPath(); ctx.arc(W*d.x + Math.sin(now*.0005+d.y*9)*14, H*d.y, d.s,0,7); ctx.fill();
          });
        };
        ctx.fillStyle='#ffffff'; drawDust(dustFar);
        ctx.fillStyle='#ffffff'; drawDust(dustMid);
        ctx.fillStyle='#ffffff'; drawDust(dustNear);
        // 亮星（淡蓝辉光）
        bright.forEach(b=>{
          b.y-=b.v; if(b.y<-.02){b.y=1.02;b.x=Math.random();}
          const flick=.5+.5*Math.sin(now*b.tw+b.ph);
          const bx=W*b.x+Math.sin(now*.0003+b.y*7)*8, by=H*b.y;
          const g=ctx.createRadialGradient(bx,by,0,bx,by,b.s*6);
          g.addColorStop(0,`rgba(255,255,255,${.85*flick})`);
          g.addColorStop(.3,`rgba(200,225,255,${.5*flick})`);
          g.addColorStop(1,'rgba(255,255,255,0)');
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(bx,by,b.s*6,0,7); ctx.fill();
          ctx.fillStyle=`rgba(255,255,255,${flick})`;
          ctx.beginPath(); ctx.arc(bx,by,b.s,0,7); ctx.fill();
        });
        // 流星 —— 拖着尾迹划过
        if(Date.now()>nextShoot){ spawnShooter(); nextShoot=Date.now()+2600+Math.random()*2400; }
        shooters=shooters.filter(s=>s.life<s.max);
        shooters.forEach(s=>{
          s.life++; s.x+=s.vx; s.y+=s.vy;
          const head=W*s.x;
          const tailX=head-s.vx*s.len*(s.life/s.max)*.8;
          const tailY=H*s.y-s.vy*s.len*(s.life/s.max)*.8;
          const sg=ctx.createLinearGradient(tailX,tailY,head,H*s.y);
          const fade=Math.sin((s.life/s.max)*Math.PI);
          sg.addColorStop(0,'rgba(255,255,255,0)');
          sg.addColorStop(.5,`rgba(200,230,255,${.5*fade})`);
          sg.addColorStop(1,`rgba(255,255,255,${.9*fade})`);
          ctx.strokeStyle=sg; ctx.lineWidth=1.6; ctx.lineCap='round';
          ctx.beginPath(); ctx.moveTo(tailX,tailY); ctx.lineTo(head,H*s.y); ctx.stroke();
        });
        ctx.globalAlpha=1;
      }
      requestAnimationFrame(frame);
    })(performance.now());
  }

  /* ---------- 旅行足迹 · 本页沉浸体验(开关进入 + hugeinc旋转木马逐张懒加载) ---------- */
  (function(){
    const travel=document.getElementById('travel');
    const entry=document.getElementById('travelEntry');
    if(!travel||!entry)return;
    const N=23;
    const IMGS=[...Array(N)].map((_,i)=>'travel/travel-'+String(i+1).padStart(2,'0')+'.jpg');
    const gal=travel.querySelector('.travel__gal');
    const frame=travel.querySelector('.tg__frame');
    const img=travel.querySelector('.tg__img');
    const count=travel.querySelector('.tg__count');
    const dotsBox=travel.querySelector('.tg__dots');
    let cur=-1, cache={};
    IMGS.forEach((_,i)=>{const d=document.createElement('i');d.addEventListener('click',()=>goTo(i));dotsBox.appendChild(d);});
    const dots=[...dotsBox.children];
    // 画廊总高按视口校准(每张75vh)
    function sizeGal(){ gal.style.height=(N*75)+'vh'; }
    sizeGal(); window.addEventListener('resize',sizeGal);

    function render(i,dir){ // 每看一张，渲染一张；dir: 1下一张/-1上一张
      if(!cache[i]){const pre=new Image();pre.src=IMGS[i];cache[i]=pre;}
      img.src=IMGS[i];
      // 画框比例随图片自适应(完整显示主体，极端比例才轻微裁切)
      if(cache[i].naturalWidth){
        frame.style.setProperty('--ar',Math.min(2.35,Math.max(.75,cache[i].naturalWidth/cache[i].naturalHeight)).toFixed(3));
      }else cache[i].addEventListener('load',()=>frame.style.setProperty('--ar',
        Math.min(2.35,Math.max(.75,cache[i].naturalWidth/cache[i].naturalHeight)).toFixed(3)),{once:true});
      // 方向性切换过渡：新图从左/右滑入消散
      img.className='tg__img';
      if(dir){void img.offsetWidth; img.classList.add(dir>0?'swap-r':'swap-l');}
      frame.classList.remove('cur'); void frame.offsetWidth; frame.classList.add('cur');
      count.textContent=String(i+1).padStart(2,'0')+' / '+N;
      dots.forEach((d,k)=>d.classList.toggle('cur',k===i));
      cur=i;
    }
    const heroEl=travel.querySelector('.travel__hero');
    const bgword=travel.querySelector('.tg__bgword');
    function update(){
      const heroH=travel.querySelector('.travel__hero').offsetHeight;
      const st=travel.scrollTop;
      // 幕间过渡：英雄区随下滚视差淡出上移，TRAVEL大字幕从右侧滑入
      const p=Math.min(1,Math.max(0,(st-heroH*.15)/(heroH*.85)));
      heroEl.style.opacity=String(1-p*.92);
      heroEl.style.transform=`translateY(${(-p*13).toFixed(2)}vh) scale(${(1-p*.06).toFixed(4)})`;
      heroEl.classList.toggle('will-exit',p>0&&p<1);
      const q=Math.min(1,Math.max(0,(st-heroH*.7)/(heroH*.55)));
      bgword.style.setProperty('--bwx',((1-q)*24).toFixed(2)+'vw');
      bgword.style.setProperty('--bwo',(.2+q*.8).toFixed(3));
      if(st<heroH*.55){ if(cur!==-1){img.removeAttribute('src');cur=-1;} return; } // 未进入画廊不渲染
      const per=gal.offsetHeight/N;
      const idx=Math.max(0,Math.min(N-1,Math.floor((st-heroH)/per)));
      if(idx!==cur)render(idx,idx>cur?1:-1);
    }
    travel.addEventListener('scroll',update,{passive:true});
    function goTo(i){
      const heroH=travel.querySelector('.travel__hero').offsetHeight;
      const per=gal.offsetHeight/N;
      travel.scrollTo({top:heroH+i*per+per*.35,behavior:'auto'}); // 瞬时定位，画面切换交给画框过渡
    }
    travel.querySelector('.tg__arrow--l').addEventListener('click',()=>goTo(Math.max(0,(cur===-1?0:cur)-1)));
    travel.querySelector('.tg__arrow--r').addEventListener('click',()=>goTo(Math.min(N-1,(cur===-1?-1:cur)+1)));

    // 开/关(本页活动，不跳转)
    let closeTimer=null;
    // 标题逐字母拆分(参考 internationalorange 的逐字符模糊弹入)
    travel.querySelectorAll('.tt-l').forEach(el=>{
      if(el.dataset.split)return; el.dataset.split='1';
      const txt=el.textContent; el.textContent='';
      [...txt].forEach((ch,k)=>{
        const s=document.createElement('span'); s.className='tch'; s.textContent=ch;
        s.style.setProperty('--td',(0.62+k*0.05)+'s'); el.appendChild(s);
      });
    });
    function open(){
      clearTimeout(closeTimer);
      travel.hidden=false; travel.scrollTop=0; cur=-1;
      heroEl.style.opacity=''; heroEl.style.transform=''; // 清掉上次滚动残留的幕间过渡
      document.body.style.overflow='hidden';
      document.body.classList.add('travel-open'); // 隐藏顶部/侧边导航，避免遮挡箭头与关闭钮
      requestAnimationFrame(()=>travel.classList.add('on')); // 触发逐字弹入+字距收紧+图片落位
    }
    function close(){
      travel.classList.remove('on');
      document.body.classList.remove('travel-open');
      document.body.style.overflow='';
      closeTimer=setTimeout(()=>{travel.hidden=true;img.removeAttribute('src');cur=-1;},480);
    }
    entry.addEventListener('click',e=>{e.preventDefault();open();});
    travel.querySelector('.travel__close').addEventListener('click',close);
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!travel.hidden)close(); });
  })();

  /* ---------- 联系方式一键复制 ---------- */
  document.querySelectorAll('.contact__copy').forEach(btn=>{
    btn.addEventListener('click',async e=>{
      e.preventDefault(); e.stopPropagation();
      const text=btn.dataset.copy;
      try{ await navigator.clipboard.writeText(text); }
      catch(_){ const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); ta.remove(); }
      btn.textContent='已复制 ✓'; btn.classList.add('done');
      clearTimeout(btn.__t);
      btn.__t=setTimeout(()=>{btn.textContent='复制';btn.classList.remove('done');},1600);
    });
  });

  /* ---------- 背景音乐 ---------- */
  (function(){
    const btn=document.getElementById('bgmBtn'), au=document.getElementById('bgm');
    if(!btn||!au)return;
    function setUI(on){
      btn.classList.toggle('playing',on);
      btn.setAttribute('aria-label',on?'关闭背景音乐':'播放背景音乐');
      btn.querySelector('.bgm__label').textContent=on?'MUSIC ON':'MUSIC';
    }
    async function tryPlay(){ try{ await au.play(); }catch(_){/* 需用户交互后再试 */} }
    btn.addEventListener('click',()=>{ au.paused?tryPlay():au.pause(); });
    au.addEventListener('play',()=>setUI(true));
    au.addEventListener('playing',()=>setUI(true));
    au.addEventListener('pause',()=>setUI(false));
    setUI(true); // 音乐设定为打开即自动播放，按钮初始就是跳动动画形态
    au.volume=0.8; // 音量 80%
    tryPlay(); // 页面打开即尝试自动播放；若被浏览器策略拦截，则在用户首次点击页面任意处时再试
    document.addEventListener('pointerdown',e=>{
      if(e.target.closest&&e.target.closest('#bgmBtn'))return; // 按钮自身由click处理，避免刚播又停
      if(au.paused)tryPlay();
    },{once:true});
  })();

})();