/* AI Lab — an interactive neural network with a real forward pass.
   Editable: input values, weights (click a wire), biases (click a node),
   hidden layer count, neurons per layer, activation function.
   Question it answers: will Ashvik ship this feature tonight? */
(function () {
  const svg = document.getElementById("nn-svg");
  if (!svg) return;

  const INPUT_NAMES = ["chai_level", "open_bugs", "focus"];
  const VB_W = 780, VB_H = 460;
  const PAD_X = 84, PAD_Y = 40;

  const state = {
    seed: 42,
    hiddenLayers: 2,
    neurons: 4,
    activation: "tanh",
    inputs: [0.8, -0.4, 0.6],
    weights: [],  // weights[l][j][i] : from node i in layer l to node j in layer l+1
    biases: [],   // biases[l][j] for layer l+1
    selected: null // {type:'w', l, i, j} | {type:'b', l, j}
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sizes() {
    const s = [3];
    for (let l = 0; l < state.hiddenLayers; l++) s.push(state.neurons);
    s.push(1);
    return s;
  }

  function initWeights() {
    const rnd = mulberry32(state.seed);
    const sz = sizes();
    state.weights = [];
    state.biases = [];
    for (let l = 0; l < sz.length - 1; l++) {
      const W = [], B = [];
      for (let j = 0; j < sz[l + 1]; j++) {
        const row = [];
        for (let i = 0; i < sz[l]; i++) row.push((rnd() * 2 - 1) * 1.2);
        W.push(row);
        B.push((rnd() * 2 - 1) * 0.5);
      }
      state.weights.push(W);
      state.biases.push(B);
    }
    state.selected = null;
  }

  const ACT = {
    tanh: function (x) { return Math.tanh(x); },
    relu: function (x) { return Math.max(0, x); },
    sigmoid: function (x) { return 1 / (1 + Math.exp(-x)); }
  };

  function forward() {
    let a = state.inputs.slice();
    const acts = [a];
    const L = state.weights.length;
    for (let l = 0; l < L; l++) {
      const next = [];
      for (let j = 0; j < state.weights[l].length; j++) {
        let z = state.biases[l][j];
        for (let i = 0; i < a.length; i++) z += state.weights[l][j][i] * a[i];
        // hidden layers use the chosen activation; output stays linear (squashed for display)
        next.push(l === L - 1 ? z : ACT[state.activation](z));
      }
      a = next;
      acts.push(a);
    }
    return acts;
  }

  function nodePositions() {
    const sz = sizes();
    const pos = [];
    for (let l = 0; l < sz.length; l++) {
      const x = PAD_X + (l / (sz.length - 1)) * (VB_W - PAD_X * 2);
      const col = [];
      const gap = Math.min(84, (VB_H - PAD_Y * 2) / Math.max(sz[l] - 1, 1));
      const y0 = VB_H / 2 - ((sz[l] - 1) * gap) / 2;
      for (let n = 0; n < sz[l]; n++) col.push({ x: x, y: y0 + n * gap });
      pos.push(col);
    }
    return pos;
  }

  function fmt(v) { return (v >= 0 ? "+" : "") + v.toFixed(2); }

  function isSel(sel) {
    const s = state.selected;
    if (!s || s.type !== sel.type) return false;
    return s.l === sel.l && s.i === sel.i && s.j === sel.j;
  }

  /* ---------- render ---------- */
  // Coalesce rapid updates (e.g. dragging a slider fires many input events per
  // frame) into a single rebuild per animation frame.
  let renderQueued = false;
  function render() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(function () { renderQueued = false; renderNow(); });
  }

  function renderNow() {
    const pos = nodePositions();
    const acts = forward();
    const out = acts[acts.length - 1][0];
    const prob = ACT.sigmoid(out);
    const parts = [];

    // edges
    for (let l = 0; l < state.weights.length; l++) {
      for (let j = 0; j < state.weights[l].length; j++) {
        for (let i = 0; i < state.weights[l][j].length; i++) {
          const w = state.weights[l][j][i];
          const a = pos[l][i], b = pos[l + 1][j];
          const sel = isSel({ type: "w", l: l, i: i, j: j });
          const width = Math.min(0.8 + Math.abs(w) * 2.2, 5.5);
          const op = (0.25 + Math.min(Math.abs(w) / 2, 1) * 0.6).toFixed(2);
          parts.push(
            '<line class="edge' + (sel ? " selected" : "") + '" ' +
            'data-kind="w" data-l="' + l + '" data-i="' + i + '" data-j="' + j + '" ' +
            'tabindex="0" role="button" aria-label="Weight from layer ' + l + ' node ' + (i + 1) + ' to node ' + (j + 1) + ": " + fmt(w) + '" ' +
            'x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" ' +
            'style="stroke:' + (w >= 0 ? "var(--accent)" : "var(--muted)") + ";stroke-width:" + width + ";opacity:" + op + ";" +
            (w < 0 ? "stroke-dasharray:6 5;" : "") + '"></line>'
          );
        }
      }
    }

    // nodes
    const sz = sizes();
    for (let l = 0; l < sz.length; l++) {
      for (let n = 0; n < sz[l]; n++) {
        const p = pos[l][n];
        const a = acts[l][n];
        const isInput = l === 0;
        const isOutput = l === sz.length - 1;
        const r = isOutput ? 26 : isInput ? 20 : 17;
        const mag = Math.min(Math.abs(isOutput ? prob : a), 1);
        const sel = isSel({ type: "b", l: l - 1, i: -1, j: n });
        const fillOp = (0.12 + mag * 0.88).toFixed(2);
        const interactive = !isInput;
        parts.push(
          '<g' + (interactive ? ' class="edge' + (sel ? " selected" : "") + '" data-kind="b" data-l="' + (l - 1) + '" data-j="' + n +
            '" tabindex="0" role="button" aria-label="Bias of layer ' + l + " node " + (n + 1) + ": " + fmt(state.biases[l - 1][n]) + '"' : "") + ">" +
          '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" style="fill:var(--panel-2);stroke:var(--line);stroke-width:1.5"></circle>' +
          '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (r - 4) + '" style="fill:var(--accent);opacity:' + fillOp + '"></circle>' +
          '<text x="' + p.x + '" y="' + (p.y + 4) + '" text-anchor="middle" style="fill:var(--text);font-size:11px">' +
          (isOutput ? prob.toFixed(2) : a.toFixed(1)) + "</text></g>"
        );
        if (isInput) {
          parts.push('<text x="' + (p.x - 30) + '" y="' + (p.y + 4) + '" text-anchor="end" style="fill:var(--muted);font-size:11px">' + INPUT_NAMES[n] + "</text>");
        }
        if (isOutput) {
          parts.push('<text x="' + (p.x + 40) + '" y="' + (p.y + 4) + '" style="fill:var(--muted);font-size:11px">ship?</text>');
        }
      }
    }

    svg.innerHTML = parts.join("");

    // readout
    const verdict = document.getElementById("nn-verdict");
    verdict.innerHTML = "ŷ = " + prob.toFixed(2) + " → <b>" + (prob >= 0.5 ? "SHIP IT" : "SLEEP ON IT") + "</b>";
    const f = document.getElementById("nn-formula");
    const act = state.activation;
    f.textContent = "ŷ = σ( W · " + act + "( … " + act + "(W₁x + b₁) … ) + b )  ·  " + state.hiddenLayers + " hidden × " + state.neurons;

    updateEditor();
  }

  /* ---------- weight editor ---------- */
  const editor = document.getElementById("wt-editor");
  const wtSlider = document.getElementById("wt-slider");
  const wtLabel = document.getElementById("wt-label");
  const wtValue = document.getElementById("wt-value");

  function selectedValue() {
    const s = state.selected;
    if (!s) return 0;
    return s.type === "w" ? state.weights[s.l][s.j][s.i] : state.biases[s.l][s.j];
  }

  function updateEditor() {
    const s = state.selected;
    if (!s) { editor.classList.remove("active"); return; }
    editor.classList.add("active");
    const v = selectedValue();
    wtLabel.textContent = s.type === "w"
      ? "W" + (s.l + 1) + " [node " + (s.i + 1) + " → " + (s.j + 1) + "]"
      : "b" + (s.l + 1) + " [node " + (s.j + 1) + "]";
    wtSlider.value = v;
    wtValue.textContent = fmt(v);
  }

  wtSlider.addEventListener("input", function () {
    const s = state.selected;
    if (!s) return;
    const v = parseFloat(wtSlider.value);
    if (s.type === "w") state.weights[s.l][s.j][s.i] = v;
    else state.biases[s.l][s.j] = v;
    render();
  });

  svg.addEventListener("click", function (e) {
    const t = e.target.closest("[data-kind]");
    if (!t) return;
    pick(t);
  });
  svg.addEventListener("focusin", function (e) {
    const t = e.target.closest("[data-kind]");
    if (t) pick(t);
  });

  function pick(el) {
    const kind = el.dataset.kind;
    state.selected = kind === "w"
      ? { type: "w", l: +el.dataset.l, i: +el.dataset.i, j: +el.dataset.j }
      : { type: "b", l: +el.dataset.l, i: -1, j: +el.dataset.j };
    render();
  }

  /* ---------- controls ---------- */
  function bindRange(id, outId, idx) {
    const input = document.getElementById(id);
    const out = document.getElementById(outId);
    input.addEventListener("input", function () {
      state.inputs[idx] = parseFloat(input.value);
      out.textContent = input.value;
      render();
    });
  }
  bindRange("in-chai", "out-chai", 0);
  bindRange("in-bugs", "out-bugs", 1);
  bindRange("in-focus", "out-focus", 2);

  function refreshSteppers() {
    document.getElementById("out-layers").textContent = state.hiddenLayers;
    document.getElementById("disp-layers").textContent = state.hiddenLayers;
    document.getElementById("out-neurons").textContent = state.neurons;
    document.getElementById("disp-neurons").textContent = state.neurons;
  }

  function stepper(minusId, plusId, key, min, max) {
    document.getElementById(minusId).addEventListener("click", function () {
      if (state[key] > min) { state[key]--; initWeights(); refreshSteppers(); render(); }
    });
    document.getElementById(plusId).addEventListener("click", function () {
      if (state[key] < max) { state[key]++; initWeights(); refreshSteppers(); render(); }
    });
  }
  stepper("layers-minus", "layers-plus", "hiddenLayers", 1, 3);
  stepper("neurons-minus", "neurons-plus", "neurons", 2, 5);

  document.querySelectorAll(".seg [data-act]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.activation = btn.dataset.act;
      document.querySelectorAll(".seg [data-act]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      render();
    });
  });

  document.getElementById("nn-random").addEventListener("click", function () {
    state.seed = Math.floor(Math.random() * 1e9);
    initWeights();
    render();
  });

  document.getElementById("nn-reset").addEventListener("click", function () {
    state.seed = 42;
    state.hiddenLayers = 2;
    state.neurons = 4;
    state.activation = "tanh";
    state.inputs = [0.8, -0.4, 0.6];
    document.getElementById("in-chai").value = 0.8; document.getElementById("out-chai").textContent = "0.8";
    document.getElementById("in-bugs").value = -0.4; document.getElementById("out-bugs").textContent = "-0.4";
    document.getElementById("in-focus").value = 0.6; document.getElementById("out-focus").textContent = "0.6";
    document.querySelectorAll(".seg [data-act]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.act === "tanh" ? "true" : "false");
    });
    initWeights();
    refreshSteppers();
    render();
  });

  initWeights();
  refreshSteppers();
  render();
})();
