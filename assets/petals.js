/* Invite Studio · Petals · V22
   Sparse, cinematic foreground petals after the opening film. */
(() => {
  "use strict";
  if (window.__invitePetals) return;

  const opening = document.getElementById("opening");
  const site = document.getElementById("site");
  const modal = document.getElementById("modal");
  if (!opening || !site) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 820px)");
  const assets = [
    "assets/petals/petal-01.webp",
    "assets/petals/petal-02.webp",
    "assets/petals/petal-03.webp",
    "assets/petals/petal-04.webp",
    "assets/petals/petal-05.webp"
  ];
  const routes = [
    "left-right", "right-left", "top-bottom", "bottom-top",
    "top-left", "top-right", "bottom-left", "bottom-right"
  ];
  const state = {
    revealed: false,
    timer: 0,
    active: new Set(),
    assetDeck: [],
    routeDeck: [],
    layer: null,
    destroyed: false
  };

  const random = (min, max) => min + Math.random() * (max - min);
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const shuffle = values => {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  };
  const nextFromDeck = (key, values) => {
    if (!state[key].length) state[key] = shuffle(values);
    return state[key].pop();
  };

  // The film gives the five images several seconds to decode before the site appears.
  const preloadedAssets = assets.map(src => {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    return image;
  });

  const style = document.createElement("style");
  style.id = "invite-petals-style";
  style.textContent = `
    .invite-petals{position:fixed;inset:0;z-index:1000;overflow:hidden;pointer-events:none;touch-action:auto;contain:strict;visibility:hidden}
    .invite-petals.is-active{visibility:visible}
    .invite-petal{position:absolute;left:0;top:0;display:block;height:auto;max-width:none;will-change:transform,opacity;transform-origin:50% 65%;pointer-events:none;user-select:none;-webkit-user-drag:none;backface-visibility:visible}
    @media(prefers-reduced-motion:reduce){.invite-petals{display:none!important}}
  `;
  document.head.appendChild(style);

  const layer = document.createElement("div");
  layer.id = "invitePetals";
  layer.className = "invite-petals";
  layer.setAttribute("aria-hidden", "true");
  layer.setAttribute("role", "presentation");
  document.body.appendChild(layer);
  state.layer = layer;

  const maxActive = () => mobile.matches ? 1 : 2;
  const available = () => state.revealed && !state.destroyed && !document.hidden &&
    !reducedMotion.matches && !document.body.classList.contains("is-locked") &&
    modal?.hidden !== false;

  function clearTimer() {
    if (state.timer) clearTimeout(state.timer);
    state.timer = 0;
  }

  function removePetal(entry) {
    entry.animation?.cancel();
    entry.element.remove();
    state.active.delete(entry);
  }

  function pause() {
    clearTimer();
    for (const entry of [...state.active]) removePetal(entry);
    layer.classList.remove("is-active");
  }

  function routePoints(route, width, height, margin) {
    const x = () => random(width * .08, width * .92);
    const y = () => random(height * .08, height * .92);
    const edge = {
      left: [-margin, y()], right: [width + margin, y()],
      top: [x(), -margin], bottom: [x(), height + margin],
      topLeft: [-margin, -margin], topRight: [width + margin, -margin],
      bottomLeft: [-margin, height + margin], bottomRight: [width + margin, height + margin]
    };
    const paths = {
      "left-right": [edge.left, edge.right],
      "right-left": [edge.right, edge.left],
      "top-bottom": [edge.top, edge.bottom],
      "bottom-top": [edge.bottom, edge.top],
      "top-left": [edge.topLeft, edge.bottomRight],
      "top-right": [edge.topRight, edge.bottomLeft],
      "bottom-left": [edge.bottomLeft, edge.topRight],
      "bottom-right": [edge.bottomRight, edge.topLeft]
    };
    return paths[route];
  }

  function spawn(delay = 0) {
    if (!available() || state.active.size >= maxActive()) return;

    const width = layer.clientWidth || window.innerWidth;
    const height = layer.clientHeight || window.innerHeight;
    const assetIndex = nextFromDeck("assetDeck", assets.map((_, index) => index));
    const route = nextFromDeck("routeDeck", routes);
    const depth = random(.72, 1.28);
    const size = random(mobile.matches ? 28 : 38, mobile.matches ? 54 : 88) * depth;
    const margin = Math.max(size * 1.8, 84);
    const [start, end] = routePoints(route, width, height, margin);
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.max(1, Math.hypot(dx, dy));
    const bend = random(-.18, .18) * Math.min(width, height);
    const perpendicular = [-dy / length * bend, dx / length * bend];
    const sway = random(10, mobile.matches ? 24 : 38);
    const point = (progress, wave = 0) => [
      lerp(start[0], end[0], progress) + perpendicular[0] * Math.sin(Math.PI * progress) + wave,
      lerp(start[1], end[1], progress) + perpendicular[1] * Math.sin(Math.PI * progress) - wave * .55
    ];

    const element = document.createElement("img");
    element.className = "invite-petal";
    element.src = assets[assetIndex];
    element.alt = "";
    element.draggable = false;
    element.decoding = "async";
    element.dataset.petalVariant = String(assetIndex + 1);
    element.dataset.petalRoute = route;
    element.style.width = `${size}px`;
    element.style.filter = `blur(${depth > 1.12 ? random(.45, 1.05) : random(0, .28)}px) saturate(${random(.92, 1.05)})`;
    layer.appendChild(element);

    const angle = random(-175, 175);
    const spin = random(260, 620) * (Math.random() < .5 ? -1 : 1);
    const tilt = random(-62, 62);
    const p1 = point(.23, sway);
    const p2 = point(.5, -sway * .55);
    const p3 = point(.77, sway * .72);
    const transform = (pointValue, rotation, rotateX, rotateY, scale = 1) =>
      `translate3d(${pointValue[0]}px,${pointValue[1]}px,0) rotate(${rotation}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    const opacity = random(.68, .9);
    const frames = [
      { offset: 0, transform: transform(start, angle, tilt, -60, .82), opacity: 0 },
      { offset: .12, transform: transform(point(.1), angle + spin * .08, -tilt * .4, 28, .94), opacity: opacity * .82 },
      { offset: .28, transform: transform(p1, angle + spin * .25, tilt, 112, 1.02), opacity },
      { offset: .52, transform: transform(p2, angle + spin * .5, -tilt, 205, .96), opacity: opacity * .96 },
      { offset: .76, transform: transform(p3, angle + spin * .76, tilt * .72, 292, 1.01), opacity: opacity * .9 },
      { offset: .9, transform: transform(point(.91), angle + spin * .9, -tilt * .5, 338, .91), opacity: opacity * .64 },
      { offset: 1, transform: transform(end, angle + spin, tilt, 390, .78), opacity: 0 }
    ];

    const entry = { element, animation: null };
    state.active.add(entry);
    const animation = element.animate(frames, {
      duration: random(mobile.matches ? 8500 : 7200, mobile.matches ? 13500 : 12500),
      delay,
      easing: "cubic-bezier(.37,.04,.24,1)",
      fill: "both"
    });
    entry.animation = animation;
    animation.finished.then(() => removePetal(entry)).catch(() => {});
  }

  function schedule(initial = false) {
    clearTimer();
    if (!available()) return;
    const wait = initial
      ? random(mobile.matches ? 2600 : 1500, mobile.matches ? 5200 : 3400)
      : random(mobile.matches ? 12000 : 7600, mobile.matches ? 22000 : 16000);
    state.timer = setTimeout(() => {
      state.timer = 0;
      if (!available()) return;
      spawn();
      if (!mobile.matches && Math.random() < .12) spawn(random(700, 1400));
      schedule();
    }, wait);
  }

  function resume(initial = false) {
    if (!available()) {
      pause();
      return;
    }
    layer.classList.add("is-active");
    if (!state.timer) schedule(initial);
  }

  function markRevealed() {
    if (!opening.hidden || site.getAttribute("aria-hidden") === "true") return;
    state.revealed = true;
    observer.disconnect();
    resume(true);
  }

  function destroy() {
    state.destroyed = true;
    pause();
    observer.disconnect();
    modalObserver?.disconnect();
    layer.remove();
    style.remove();
    window.__invitePetals = null;
  }

  const observer = new MutationObserver(markRevealed);
  observer.observe(opening, { attributes: true, attributeFilter: ["hidden", "class"] });
  observer.observe(site, { attributes: true, attributeFilter: ["aria-hidden"] });
  const modalObserver = modal ? new MutationObserver(() => resume()) : null;
  modalObserver?.observe(modal, { attributes: true, attributeFilter: ["hidden"] });

  document.addEventListener("visibilitychange", () => resume());
  reducedMotion.addEventListener?.("change", () => resume(true));
  mobile.addEventListener?.("change", () => resume());
  window.addEventListener("pagehide", pause);
  window.addEventListener("pageshow", () => resume(true));

  markRevealed();
  window.__invitePetals = { state, assets, preloadedAssets, spawn, pause, resume, destroy };
})();
