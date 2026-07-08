/* Site orchestration: smooth scroll (Lenis), Vanta hero background,
   nav state, mobile menu, scroll reveals, skill accordion, tilt cards. */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Lenis smooth scrolling ---------- */
  let lenis = null;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!reduceMotion && typeof Lenis !== "undefined") {
    // lighter, more responsive feel: less smoothing, a touch more travel per wheel step
    lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.8,
      smoothWheel: true
    });
    window.__lenis = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function scrollToTarget(hash) {
    const el = document.querySelector(hash);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: hash === "#top" ? -80 : -60, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      const hash = a.getAttribute("href");
      if (hash.length > 1 && document.querySelector(hash)) {
        e.preventDefault();
        closeMenu();
        scrollToTarget(hash);
      }
    });
  });

  /* ---------- Nav ---------- */
  const nav = document.getElementById("site-nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  function closeMenu() {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
    if (lenis) lenis.start();
  }
  function openMenu() {
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    mobileMenu.classList.add("open");
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
  }
  menuBtn.addEventListener("click", function () {
    menuBtn.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Scroll reveals ---------- */
  const revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { revealIO.observe(el); });

  /* ---------- Skills accordion ---------- */
  document.querySelectorAll(".skill-head").forEach(function (head) {
    head.addEventListener("click", function () {
      const row = head.parentElement;
      const isOpen = row.classList.contains("open");
      row.classList.toggle("open", !isOpen);
      head.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------- Tilt cards (fine pointers only) ---------- */
  if (typeof VanillaTilt !== "undefined" && !reduceMotion &&
      window.matchMedia("(pointer: fine)").matches) {
    VanillaTilt.init(document.querySelectorAll(".tilt"), {
      max: 5,
      speed: 700,
      scale: 1.012,
      glare: true,
      "max-glare": 0.08,
      gyroscope: false
    });
  }

  /* ---------- Vanta hero background ---------- */
  let vantaEffect = null;

  function vantaColors() {
    const lit = document.documentElement.dataset.theme === "lit";
    return lit
      ? { color: 0xc07a3a, backgroundColor: 0xf4ede2 }
      : { color: 0x8a5a20, backgroundColor: 0x14100c };
  }

  const vantaSupported = typeof VANTA !== "undefined" && VANTA.TOPOLOGY &&
    !reduceMotion && window.innerWidth >= 760;

  function initVanta() {
    if (!vantaSupported || vantaEffect) return;
    const opts = vantaColors();
    vantaEffect = VANTA.TOPOLOGY({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: false,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      color: opts.color,
      backgroundColor: opts.backgroundColor
    });
  }
  function killVanta() {
    if (vantaEffect) { vantaEffect.destroy(); vantaEffect = null; }
  }

  // Only run the (p5-backed, CPU-hungry) background while the hero is on screen.
  // This is the main fix for scroll jank further down the page.
  const hero = document.querySelector(".hero");
  if (vantaSupported && hero) {
    let heroVisible = true;
    const vantaIO = new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible) initVanta();
      else killVanta();
    }, { rootMargin: "120px 0px 0px 0px" });
    vantaIO.observe(hero);
    initVanta();
  }

  window.addEventListener("themechange", function () {
    if (vantaEffect) { killVanta(); initVanta(); }
  });

  // pause when the tab is hidden; resume on return if the hero is in view
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) killVanta();
    else if (hero && hero.getBoundingClientRect().bottom > 0) initVanta();
  });

  window.addEventListener("pagehide", killVanta);
})();
