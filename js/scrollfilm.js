/* NIGHT BUILD — a live-rendered "video" scrubbed by scroll.
   The section is 340vh tall; a sticky 16:9 frame stays pinned while
   scroll progress drives the timeline: a wireframe valley flythrough
   from midnight code session to sunrise ship. */
(function () {
  const section = document.getElementById("film");
  const canvas = document.getElementById("film-canvas");
  if (!section || !canvas) return;

  const ctx = canvas.getContext("2d");
  const timecodeEl = document.getElementById("film-timecode");
  const captionEl = document.getElementById("film-caption");
  const scrubFill = document.getElementById("film-scrub-fill");
  const progressLabel = document.getElementById("film-progress-label");

  const CAPTIONS = [
    [0.0, "23:00 — an idea won't let go"],
    [0.22, "00:41 — scaffold up, coffee down"],
    [0.45, "02:58 — one more bug, promise"],
    [0.7, "05:12 — tests finally green"],
    [0.9, "06:30 — shipped. sunrise."]
  ];

  // deterministic pseudo-random for stars & mountains
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(42);
  const isSmall = window.matchMedia("(max-width: 768px)").matches;
  const STARS = Array.from({ length: isSmall ? 70 : 110 }, function () {
    return { x: rand(), y: rand() * 0.55, r: 0.4 + rand() * 1.3, tw: rand() * 6.28 };
  });
  const RIDGE_A = Array.from({ length: 48 }, function () { return rand(); });
  const RIDGE_B = Array.from({ length: 48 }, function () { return rand(); });

  let W = 0, H = 0, dpr = 1;
  let visible = false;
  let dirty = true;
  let lastP = -1;
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1 : 1.5);
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true;
  }
  window.addEventListener("resize", resize);
  resize();

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function smooth(a, b, v) { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); }
  function mixColor(c1, c2, t) {
    return "rgb(" +
      Math.round(lerp(c1[0], c2[0], t)) + "," +
      Math.round(lerp(c1[1], c2[1], t)) + "," +
      Math.round(lerp(c1[2], c2[2], t)) + ")";
  }

  function ridgeY(arr, i, base, amp) {
    const n = arr.length;
    const a = arr[((i % n) + n) % n];
    const b = arr[(((i + 1) % n) + n) % n];
    return base - (a * 0.7 + b * 0.3) * amp;
  }

  function draw(p, time) {
    const sunrise = smooth(0.55, 0.98, p);   // 0 night → 1 dawn
    const horizon = H * 0.62;

    // --- sky ---
    const skyTop = mixColor([8, 6, 5], [38, 22, 12], sunrise);
    const skyMid = mixColor([16, 12, 9], [120, 58, 22], sunrise);
    const skyLow = mixColor([22, 16, 11], [232, 130, 44], sunrise);
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, skyTop);
    sky.addColorStop(0.62, skyMid);
    sky.addColorStop(1, skyLow);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizon);

    // --- stars (fade with sunrise) ---
    const starAlpha = (1 - sunrise) * 0.9;
    if (starAlpha > 0.02) {
      for (let i = 0; i < STARS.length; i++) {
        const s = STARS[i];
        const tw = 0.55 + 0.45 * Math.sin(time * 0.0012 + s.tw);
        ctx.globalAlpha = starAlpha * tw;
        ctx.fillStyle = "#F2EAE0";
        ctx.fillRect(s.x * W, s.y * H, s.r, s.r);
      }
      ctx.globalAlpha = 1;
    }

    // --- sun ---
    const sunX = W * lerp(0.78, 0.5, sunrise);
    const sunY = lerp(horizon + H * 0.3, H * 0.18, sunrise);
    const sunR = lerp(H * 0.05, H * 0.11, sunrise);
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 5);
    glow.addColorStop(0, "rgba(255,160,40," + lerp(0.25, 0.6, sunrise) + ")");
    glow.addColorStop(1, "rgba(255,160,40,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, horizon + 4);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, horizon);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, 6.2832);
    ctx.fillStyle = mixColor([255, 140, 40], [255, 205, 110], sunrise);
    ctx.fill();
    ctx.restore();

    // --- mountain ridges (parallax drift) ---
    const drift = p * 26;
    ctx.fillStyle = mixColor([14, 11, 9], [52, 30, 18], sunrise * 0.8);
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let i = 0; i <= 48; i++) {
      const x = (i / 48) * (W + 60) - 30 - drift * 0.4;
      ctx.lineTo(x, ridgeY(RIDGE_A, i, horizon, H * 0.2));
    }
    ctx.lineTo(W, horizon);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = mixColor([10, 8, 7], [34, 20, 13], sunrise * 0.8);
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let i = 0; i <= 48; i++) {
      const x = (i / 48) * (W + 90) - 45 - drift;
      ctx.lineTo(x, ridgeY(RIDGE_B, i + 7, horizon, H * 0.11));
    }
    ctx.lineTo(W, horizon);
    ctx.closePath();
    ctx.fill();

    // --- ground: perspective wireframe grid, flying forward ---
    ctx.fillStyle = mixColor([9, 7, 6], [26, 16, 11], sunrise);
    ctx.fillRect(0, horizon, W, H - horizon);

    const gridColor = mixColor([120, 78, 34], [255, 160, 40], sunrise);
    const fly = (p * 7) % 1; // forward motion
    ctx.lineWidth = 1;

    // horizontal lines with perspective spacing
    for (let i = 0; i < 22; i++) {
      const depth = i + 1 - fly;
      if (depth <= 0) continue;
      const z = depth / 22;
      const y = horizon + Math.pow(z, 1.7) * (H - horizon);
      ctx.globalAlpha = 0.14 + (1 - z) * 0.05 + z * 0.4;
      ctx.strokeStyle = gridColor;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    // converging verticals
    const vp = W * lerp(0.78, 0.5, sunrise); // vanishing point tracks the sun
    for (let i = -14; i <= 14; i++) {
      const xBottom = W / 2 + (i / 14) * W * 1.15;
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = gridColor;
      ctx.beginPath();
      ctx.moveTo(vp, horizon + 1);
      ctx.lineTo(xBottom, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // --- scanlines + vignette: keep it filmic ---
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = "#000";
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
    ctx.globalAlpha = 1;
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  /* --- HUD --- */
  function updateHud(p) {
    // narrative clock: 23:00 → 06:30 (7.5h across the scroll)
    const totalMin = (23 * 60 + p * 7.5 * 60) % (24 * 60);
    const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
    const mm = String(Math.floor(totalMin % 60)).padStart(2, "0");
    const ss = String(Math.floor((totalMin % 1) * 60)).padStart(2, "0");
    const ff = String(Math.floor((p * 1000) % 24)).padStart(2, "0");
    timecodeEl.textContent = hh + ":" + mm + ":" + ss + ":" + ff;
    scrubFill.style.width = (p * 100).toFixed(1) + "%";
    progressLabel.textContent = Math.round(p * 100) + "%";

    let cap = CAPTIONS[0][1];
    for (let i = 0; i < CAPTIONS.length; i++) {
      if (p >= CAPTIONS[i][0]) cap = CAPTIONS[i][1];
    }
    if (captionEl.textContent !== cap) {
      captionEl.style.opacity = "0";
      setTimeout(function () {
        captionEl.textContent = cap;
        captionEl.style.opacity = "1";
      }, 180);
    }
  }

  /* --- render loop, gated to visibility --- */
  let running = false;
  let lastTwinkle = 0;

  const io = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible) startLoop();
  });
  io.observe(section);

  function progress() {
    const rect = section.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    if (span <= 0) return 0;
    return clamp01(-rect.top / span);
  }

  function startLoop() {
    if (running || !visible) return; // guard against overlapping loops
    running = true;
    requestAnimationFrame(loop);
  }

  function loop(time) {
    if (!visible) { running = false; return; }
    const p = progress();
    const moved = Math.abs(p - lastP) > 0.0004;
    // full frame rate while the scroll is actually moving; when idle, only
    // redraw ~20fps so the stars keep twinkling without burning the CPU
    if (dirty || moved || time - lastTwinkle > 50) {
      draw(p, time);
      updateHud(p);
      lastP = p;
      dirty = false;
      if (!moved) lastTwinkle = time;
    }
    requestAnimationFrame(loop);
  }

  // first paint even before it's scrolled to
  draw(0, 0);
  updateHud(0);
})();
