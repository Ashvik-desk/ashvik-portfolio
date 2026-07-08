/* Lamp — the signature interaction.
   Pull the cord (drag down past the threshold, or click / press Enter)
   to toggle between the dark studio and the lit room. */
(function () {
  const root = document.documentElement;
  const lamp = document.getElementById("lamp");
  const rope = document.getElementById("lamp-rope");
  const bulb = document.getElementById("lamp-bulb");
  if (!lamp || !rope) return;

  const PULL_THRESHOLD = 34;

  function currentTheme() {
    return root.dataset.theme === "lit" ? "lit" : "dark";
  }

  function applyTheme(theme, announce) {
    root.dataset.theme = theme;
    rope.setAttribute("aria-checked", theme === "lit" ? "true" : "false");
    bulb.setAttribute("fill", theme === "lit" ? "#FFCE73" : "#3A3129");
    try { localStorage.setItem("ashvik-theme", theme); } catch (e) {}
    if (announce !== false) {
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
    }
  }

  function toggle() {
    applyTheme(currentTheme() === "lit" ? "dark" : "lit");
    lamp.classList.remove("swinging");
    // restart the swing animation
    void lamp.offsetWidth;
    lamp.classList.add("swinging");
  }

  // expose for the terminal's `lamp` command
  window.AshvikTheme = { toggle: toggle, get: currentTheme };

  // sync visuals with whatever the head script restored
  applyTheme(currentTheme(), false);

  /* ----- rope drag ----- */
  let dragging = false;
  let startY = 0;
  let pulled = 0;

  function setRopeOffset(px) {
    rope.style.transform = "translateY(" + px + "px)";
  }

  rope.addEventListener("pointerdown", function (e) {
    dragging = true;
    startY = e.clientY;
    pulled = 0;
    rope.setPointerCapture(e.pointerId);
    rope.style.transition = "none";
    e.preventDefault();
  });

  var MAX_PULL = 56;

  rope.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    // elastic resistance: the further you pull, the more the cord resists —
    // feels like a real string instead of a rigid 1:1 drag
    var raw = Math.max(0, e.clientY - startY);
    pulled = MAX_PULL * (1 - Math.exp(-raw / 44));
    setRopeOffset(pulled);
  });

  function release() {
    if (!dragging) return;
    dragging = false;
    // gentle spring back with just a hint of overshoot
    rope.style.transition = "transform 0.66s cubic-bezier(0.34, 1.28, 0.48, 1)";
    setRopeOffset(0);
    if (pulled >= PULL_THRESHOLD || pulled < 4) {
      // a real pull, or a plain click — both toggle
      toggle();
    }
    pulled = 0;
  }

  rope.addEventListener("pointerup", release);
  rope.addEventListener("pointercancel", release);

  rope.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      rope.style.transition = "transform 0.66s cubic-bezier(0.34, 1.28, 0.48, 1)";
      setRopeOffset(24);
      setTimeout(function () { setRopeOffset(0); }, 150);
      toggle();
    }
  });
})();
