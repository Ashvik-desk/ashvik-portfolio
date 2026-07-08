/* Hero 3D object — a pseudo-3D laptop mid-build, orbited by the things
   it's learning. Zdog scene: drag to spin, floats and auto-rotates. */
(function () {
  if (typeof Zdog === "undefined") return;
  const canvas = document.getElementById("zdog-stage");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const C = {
    body: "#3A3129",
    bodyDark: "#2A231D",
    deck: "#241D18",
    screenGlow: "#FFA028",
    codeA: "#F2EAE0",
    codeB: "#E8622C",
    key: "#4A4036",
    orbitRing: "#6F6458",
    cube: "#E8622C",
    dot: "#FFA028"
  };

  let isSpinning = true;

  const illo = new Zdog.Illustration({
    element: canvas,
    zoom: 2.6,
    dragRotate: true,
    onDragStart: function () {
      isSpinning = false;
      const hint = document.getElementById("stage-hint");
      if (hint) hint.style.opacity = "0.35";
    },
    onDragEnd: function () { isSpinning = true; }
  });

  // root anchor so the whole model can bob up and down
  const world = new Zdog.Anchor({ addTo: illo });
  world.rotate.x = -0.42;
  world.rotate.y = 0.55;

  const laptop = new Zdog.Anchor({ addTo: world, translate: { y: 8 } });

  // base
  new Zdog.Box({
    addTo: laptop,
    width: 76, height: 6, depth: 50,
    stroke: 2,
    color: C.body,
    topFace: C.deck,
    bottomFace: C.bodyDark,
    rearFace: C.bodyDark
  });

  // keyboard keys — a quiet grid of dots on the deck
  for (let r = 0; r < 4; r++) {
    for (let k = 0; k < 9; k++) {
      new Zdog.Shape({
        addTo: laptop,
        stroke: 3.4,
        color: C.key,
        translate: { x: -28 + k * 7, y: -4.4, z: -14 + r * 7 }
      });
    }
  }
  // trackpad
  new Zdog.Rect({
    addTo: laptop,
    width: 22, height: 13,
    stroke: 1,
    fill: true,
    color: C.bodyDark,
    rotate: { x: Zdog.TAU / 4 },
    translate: { y: -4.4, z: 19 }
  });

  // screen, hinged at the back edge, tilted open
  const screen = new Zdog.Anchor({
    addTo: laptop,
    translate: { y: -3, z: -25 },
    rotate: { x: Zdog.TAU * 0.285 }
  });
  new Zdog.Box({
    addTo: screen,
    width: 76, height: 4, depth: 52,
    stroke: 2,
    color: C.body,
    topFace: C.bodyDark,
    bottomFace: C.deck
  });
  // glowing display face
  const display = new Zdog.Rect({
    addTo: screen,
    width: 64, height: 42,
    stroke: 2,
    fill: true,
    color: C.screenGlow,
    rotate: { x: Zdog.TAU / 4 },
    translate: { y: 3.2, z: 1 }
  });
  // "code" lines on the display
  const lineSpecs = [
    { x: -8, z: -14, w: 34, c: C.deck },
    { x: -14, z: -7, w: 22, c: C.deck },
    { x: 2, z: 0, w: 40, c: C.codeB },
    { x: -10, z: 7, w: 30, c: C.deck },
    { x: -18, z: 14, w: 14, c: C.codeB }
  ];
  lineSpecs.forEach(function (s) {
    new Zdog.Shape({
      addTo: screen,
      path: [{ x: s.x - s.w / 2, z: s.z }, { x: s.x + s.w / 2, z: s.z }],
      stroke: 3,
      color: s.c,
      rotate: { x: 0 },
      translate: { y: 4.6 }
    });
  });

  // orbit ring — the path the ideas travel
  const ring = new Zdog.Ellipse({
    addTo: world,
    diameter: 176,
    stroke: 1.5,
    color: C.orbitRing,
    rotate: { x: Zdog.TAU / 4 },
    translate: { y: -6 }
  });

  // orbiters: a cube (web), a sphere (AI), a stack (data)
  const orbit1 = new Zdog.Anchor({ addTo: world, translate: { y: -6 } });
  new Zdog.Box({
    addTo: orbit1,
    width: 13, height: 13, depth: 13,
    stroke: 1.5,
    color: C.cube,
    topFace: "#F07A45",
    translate: { x: 88 },
    rotate: { x: 0.5, y: 0.7 }
  });

  const orbit2 = new Zdog.Anchor({ addTo: world, translate: { y: -6 } });
  new Zdog.Shape({
    addTo: orbit2,
    stroke: 15,
    color: C.dot,
    translate: { x: -88 }
  });

  const orbit3 = new Zdog.Anchor({ addTo: world, translate: { y: -6 } });
  const stack = new Zdog.Anchor({ addTo: orbit3, translate: { z: 88 } });
  [-6, 0, 6].forEach(function (y, i) {
    new Zdog.Ellipse({
      addTo: stack,
      diameter: 16,
      stroke: 4,
      color: i === 1 ? C.codeA : C.orbitRing,
      rotate: { x: Zdog.TAU / 4 },
      translate: { y: y }
    });
  });
  orbit2.rotate.y = 2.1;
  orbit3.rotate.y = 4.2;

  // paint once immediately so the laptop is always visible, even before
  // the animation loop (or a backgrounded tab's rAF) kicks in
  illo.updateRenderGraph();

  // frame-rate-independent motion with eased auto-spin resume
  let t = 0;
  let spin = 0.35;          // current angular velocity (deg-ish per 60fps frame)
  const spinTarget = 0.35;  // idle auto-spin speed
  let running = false;
  let visible = true;
  let last = 0;

  function frame(now) {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 16.667, 2.5) : 1; // normalize to 60fps, clamp hitches
    last = now;
    t += 0.016 * dt;

    // ease the spin speed toward its target so drag→release is smooth, not abrupt
    const wanted = isSpinning ? spinTarget : 0;
    spin += (wanted - spin) * Math.min(0.08 * dt, 1);
    world.rotate.y += spin * 0.017 * dt;

    orbit1.rotate.y += 0.011 * dt;
    orbit2.rotate.y += 0.008 * dt;
    orbit3.rotate.y += 0.010 * dt;
    world.translate.y = Math.sin(t * 1.3) * 4;

    illo.updateRenderGraph();
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || !visible) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  if (reduceMotion) {
    // static render; dragging still works
    illo.updateRenderGraph();
    canvas.addEventListener("pointermove", function () { illo.updateRenderGraph(); });
  } else {
    // only animate while the hero canvas is actually on screen
    const io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    }, { threshold: 0.01 });
    io.observe(canvas);
    start();
  }
})();
