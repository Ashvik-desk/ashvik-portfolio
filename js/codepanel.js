/* Code panel — the bio, but it type-checks.
   Two tabs, hand-rolled syntax highlighting, typed out on first view. */
(function () {
  const body = document.getElementById("code-body");
  const panel = document.getElementById("code-panel");
  if (!body || !panel) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SOURCES = {
    ts: [
      '// ashvik.ts — the developer, as a data structure',
      'type Dream = "startup" | "impact" | "independence";',
      '',
      'const ashvik = {',
      '  name: "Ashvik",',
      '  age: 15,',
      '  grade: "Class X",',
      '  base: "India",',
      '',
      '  stack: ["TypeScript", "Python", "React", "Next.js", "SQL"],',
      '  training: ["AI/ML", "Cloud", "Data Engineering", "DSA"],',
      '  certifications: 5, // IBM ×3 · University of Helsinki ×2',
      '',
      '  dreams: ["startup", "impact", "independence"] as Dream[],',
      '',
      '  ship(idea: string): string {',
      '    return `${idea} → build → break → learn → ship`;',
      '  },',
      '};',
      '',
      '// no exit condition. intentional.',
      'while (ashvik.age < 100) {',
      '  ashvik.ship("something that thinks");',
      '}'
    ].join("\n"),
    py: [
      '# train.py — how i level up, daily',
      'from life import curiosity, chai',
      '',
      'model = Student(name="Ashvik", epoch=15)',
      '',
      'for day in journey(start="class_10"):',
      '    model.practice(["leetcode", "projects", "docs"])',
      '    if model.blocked:',
      '        model.ask() or model.read() or model.retry()',
      '    model.sleep(hours=6.5)  # hyperparameter, non-negotiable',
      '',
      '# target loss: a startup that matters',
      'model.compile(optimizer="consistency", loss="fear_of_boring")',
      'model.fit(data=everything, epochs=10_000)'
    ].join("\n")
  };

  const KEYWORDS = {
    ts: ["type", "const", "return", "while", "as", "string", "number"],
    py: ["from", "import", "for", "in", "if", "or", "return", "def", "class"]
  };

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlight(src, lang) {
    const commentRe = lang === "py" ? /(#.*)$/ : /(\/\/.*)$/;
    return src.split("\n").map(function (line) {
      let esc = escapeHtml(line);
      let comment = "";
      const cm = esc.match(commentRe);
      if (cm) {
        comment = '<span class="tk-com">' + cm[1] + "</span>";
        esc = esc.slice(0, cm.index);
      }
      // strings (double, backtick)
      esc = esc.replace(/(&quot;|"|`)((?:(?!\1).)*)\1/g, function (m) {
        return '<span class="tk-str">' + m + "</span>";
      });
      // numbers
      esc = esc.replace(/\b(\d[\d_.]*)\b/g, '<span class="tk-num">$1</span>');
      // keywords
      KEYWORDS[lang].forEach(function (kw) {
        esc = esc.replace(new RegExp("\\b" + kw + "\\b(?![^<]*>)", "g"), '<span class="tk-kw">' + kw + "</span>");
      });
      // function calls
      esc = esc.replace(/(\w+)(\()/g, '<span class="tk-fn">$1</span>$2');
      // types (Capitalized identifiers)
      esc = esc.replace(/\b([A-Z]\w+)\b(?![^<]*>)/g, '<span class="tk-type">$1</span>');
      return esc + comment;
    }).join("\n");
  }

  const typedOnce = {};
  let currentTab = "ts";
  let typingToken = 0;

  function renderInstant(lang) {
    body.innerHTML = highlight(SOURCES[lang], lang);
  }

  function typeOut(lang) {
    const token = ++typingToken;
    const src = SOURCES[lang];
    let i = 0;
    function step() {
      if (token !== typingToken) return; // a tab switch cancelled this run
      i = Math.min(i + 3, src.length);
      // highlight the finished part; keep it simple by re-highlighting each frame chunk
      body.innerHTML = highlight(src.slice(0, i), lang) + '<span class="code-caret"></span>';
      if (i < src.length) {
        requestAnimationFrame(step);
      } else {
        typedOnce[lang] = true;
        body.innerHTML = highlight(src, lang);
      }
    }
    step();
  }

  function show(lang) {
    currentTab = lang;
    document.querySelectorAll(".code-tab").forEach(function (t) {
      t.setAttribute("aria-selected", t.dataset.tab === lang ? "true" : "false");
    });
    if (reduceMotion || typedOnce[lang]) {
      ++typingToken; // cancel any in-flight typing
      renderInstant(lang);
    } else {
      typeOut(lang);
    }
  }

  document.querySelectorAll(".code-tab").forEach(function (tab) {
    tab.addEventListener("click", function () { show(tab.dataset.tab); });
  });

  // type the first tab when the panel scrolls into view
  let started = false;
  const io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !started) {
      started = true;
      show(currentTab);
      io.disconnect();
    }
  }, { threshold: 0.35 });
  io.observe(panel);
})();
