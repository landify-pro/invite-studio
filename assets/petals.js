/* Invite Studio · Petals · V21
   Decorative, bounded foreground motion after the opening film.
   No external libraries, network requests or input interception. */
(() => {
  'use strict';
  if (window.__invitePetals) return;
  const opening = document.getElementById('opening');
  const site = document.getElementById('site');
  if (!opening || !site) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 820px)');
  const state = { enabled: false, timer: 0, active: new Set(), layer: null };
  const random = (a, b) => a + Math.random() * (b - a);
  const choose = items => items[Math.floor(Math.random() * items.length)];
  const maxActive = () => mobile.matches ? 2 : 3;
  const available = () => state.enabled && !document.hidden && !motion.matches &&
    !!opening.hidden && !document.body.classList.contains('is-locked') &&
    document.getElementById('modal')?.hidden !== false;

  // Four softly shaded, individual petal silhouettes. The design intentionally
  // resembles the ivory/blush petals in the opening rather than confetti.
  const shapes = [
    'M49 5 C75 9 94 38 88 72 C83 98 59 116 39 105 C15 92 8 60 19 33 C27 14 39 6 49 5 Z',
    'M53 5 C82 12 100 46 87 78 C77 103 50 115 29 100 C9 86 7 56 21 30 C30 13 43 5 53 5 Z',
    'M46 6 C69 2 91 24 92 51 C93 82 72 108 48 111 C25 113 9 90 11 63 C13 33 29 10 46 6 Z',
    'M50 5 C78 12 94 34 89 66 C85 94 64 114 43 107 C19 100 8 73 16 45 C22 21 36 8 50 5 Z'
  ];
  const palettes = [
    ['#fffaf5','#f1dce0','#d3aeb5'],
    ['#fffdf8','#eee3d9','#ceb5a8'],
    ['#fff8f6','#f3d9d8','#d9b0b2'],
    ['#fffdf6','#f4e5e2','#d8c0ba']
  ];
  const svgSource = (shape, colors) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" aria-hidden="true"><defs><radialGradient id="g" cx="28%" cy="22%" r="85%"><stop stop-color="${colors[0]}"/><stop offset=".64" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[2]}"/></radialGradient><linearGradient id="v" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#977577" stop-opacity=".16"/></linearGradient></defs><path d="${shape}" fill="url(#g)"/><path d="${shape}" fill="url(#v)"/><path d="M47 104 C34 78 38 47 50 14" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.1" stroke-linecap="round"/></svg>`;
  const artwork = shapes.map((shape, i) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgSource(shape, palettes[i])));

  const style = document.createElement('style');
  style.id = 'invite-petals-style';
  style.textContent = `
    .invite-petals{position:fixed;inset:0;z-index:1000;overflow:hidden;pointer-events:none;touch-action:auto;contain:strict;visibility:hidden}
    .invite-petals.is-active{visibility:visible}
    .invite-petal{position:absolute;left:0;top:0;display:block;object-fit:contain;max-width:none;max-height:none;will-change:transform,opacity;pointer-events:none;user-select:none;-webkit-user-drag:none;backface-visibility:visible}
    @media(prefers-reduced-motion:reduce){.invite-petals{display:none!important}}
  `;
  document.head.appendChild(style);
  const layer = document.createElement('div');
  layer.id = 'invitePetals';
  layer.className = 'invite-petals';
  layer.setAttribute('aria-hidden', 'true');
  layer.setAttribute('role', 'presentation');
  document.body.appendChild(layer);
  state.layer = layer;

  function clearTimer() { if (state.timer) clearTimeout(state.timer); state.timer = 0; }
  function removePetal(entry) {
    entry.animation?.cancel();
    entry.element.remove();
    state.active.delete(entry);
  }
  function pause() {
    clearTimer();
    for (const entry of [...state.active]) removePetal(entry);
    layer.classList.remove('is-active');
  }
  function schedule() {
    clearTimer();
    if (!available()) return;
    state.timer = setTimeout(() => {
      state.timer = 0;
      if (!available()) return;
      const count = Math.random() < .20 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        if (state.active.size < maxActive()) spawn(i * random(220, 600));
      }
      schedule();
    }, random(mobile.matches ? 5500 : 4000, mobile.matches ? 11500 : 10000));
  }
  function start() {
    if (state.enabled || motion.matches) return;
    state.enabled = true;
    layer.classList.add('is-active');
    schedule();
  }
  function resume() {
    if (!available()) { pause(); return; }
    layer.classList.add('is-active');
    if (!state.timer) schedule();
  }

  // All eight directions are possible; every journey crosses the viewport
  // between two independently chosen edges and has its own curved drift.
  function trajectory(width, height, margin) {
    const edge = () => choose(['top','right','bottom','left']);
    const startEdge = edge();
    let endEdge = edge();
    if (Math.random() < .72) {
      endEdge = ({top:'bottom',bottom:'top',left:'right',right:'left'})[startEdge];
    }
    const point = side => {
      if (side === 'top') return [random(-margin,width+margin),-margin];
      if (side === 'bottom') return [random(-margin,width+margin),height+margin];
      if (side === 'left') return [-margin,random(-margin,height+margin)];
      return [width+margin,random(-margin,height+margin)];
    };
    const a = point(startEdge), b = point(endEdge);
    if (startEdge === endEdge) {
      // A gentle arc that enters and leaves the same edge, never a stationary mark.
      const center = [random(width*.15,width*.85),random(height*.15,height*.85)];
      return { a, b, center, curved:true };
    }
    return { a, b, curved:false };
  }

  function spawn(delay = 0) {
    if (!available() || state.active.size >= maxActive()) return;
    const width = layer.clientWidth || window.innerWidth;
    const height = layer.clientHeight || window.innerHeight;
    const size = random(mobile.matches ? 18 : 25, mobile.matches ? 43 : 70);
    const depth = random(.55,1.2);
    const margin = Math.max(size * 2, 90);
    const path = trajectory(width,height,margin);
    const element = document.createElement('img');
    element.className = 'invite-petal';
    element.src = choose(artwork);
    element.alt = '';
    element.draggable = false;
    element.width = Math.round(size);
    element.height = Math.round(size*1.2);
    element.style.width = size+'px';
    element.style.height = size*1.2+'px';
    element.style.filter = depth > 1.02 ? 'blur(1.3px)' : 'none';
    layer.appendChild(element);
    const angle = random(-180,180);
    const spin = random(-470,470);
    const flip = random(-180,180);
    const drift = random(-1,1) * Math.min(width,height) * .17;
    const peak = path.curved ? path.center : [(path.a[0]+path.b[0])/2+drift,(path.a[1]+path.b[1])/2-drift*.65];
    const position = (x,y,r,ry,s) => `translate3d(${x}px,${y}px,0) rotate(${r}deg) rotateY(${ry}deg) scale(${s})`;
    const frames = [
      {offset:0,transform:position(...path.a,angle,flip,depth),opacity:0},
      {offset:.14,transform:position(path.a[0]*.76+peak[0]*.24,path.a[1]*.76+peak[1]*.24,angle+spin*.16,flip+70,depth*.94),opacity:random(.62,.84)},
      {offset:.50,transform:position(...peak,angle+spin*.5,flip+180,depth),opacity:random(.65,.88)},
      {offset:.84,transform:position(path.b[0]*.68+peak[0]*.32,path.b[1]*.68+peak[1]*.32,angle+spin*.84,flip+300,depth*.9),opacity:.7},
      {offset:1,transform:position(...path.b,angle+spin,flip+360,depth*.82),opacity:0}
    ];
    const entry = {element,animation:null};
    state.active.add(entry);
    const animation = element.animate(frames,{duration:random(6500,10500),delay,easing:'ease-in-out',fill:'both'});
    entry.animation = animation;
    animation.finished.then(() => {
      state.active.delete(entry);
      element.remove();
    }).catch(() => {});
  }

  function checkOpening() {
    if (!opening.hidden || site.getAttribute('aria-hidden') === 'true') return;
    observer.disconnect();
    start();
  }
  const observer = new MutationObserver(checkOpening);
  observer.observe(opening,{attributes:true,attributeFilter:['hidden','class']});
  observer.observe(site,{attributes:true,attributeFilter:['aria-hidden']});
  checkOpening();

  document.addEventListener('visibilitychange',resume);
  motion.addEventListener?.('change',event => {
    if (event.matches) pause();
    else if (state.enabled) resume();
    else checkOpening();
  });
  mobile.addEventListener?.('change',resume);
  const modal = document.getElementById('modal');
  if (modal) new MutationObserver(resume).observe(modal,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('pagehide',pause);
  window.addEventListener('pageshow',resume);
  window.__invitePetals = {state, spawn, pause, resume, artwork};
})();