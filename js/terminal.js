/* Terminal — the whole portfolio, greppable.
   All user input is HTML-escaped before rendering. */
(function () {
  const out = document.getElementById("term-out");
  const input = document.getElementById("term-input");
  const panel = document.getElementById("terminal-panel");
  if (!out || !input || !panel) return;

  const esc = function (s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  const LINKS = {
    github: "https://github.com/Ashvik-desk",
    linkedin: "https://www.linkedin.com/in/ashvik-gangwar-55a59940b/",
    vercel: "https://vercel.com/ashvik-desks-projects",
    mail: "mailto:ashvik.desk@gmail.com"
  };

  const FILES = {
    "about.md": [
      "# About",
      "Ashvik — 15, Class 10, India.",
      "Builds web things, trains models, collects certificates,",
      "and is quietly plotting a startup. This site is exhibit A."
    ].join("\n"),
    "goals.md": [
      "# Now → next 2 years",
      "- master full-stack development",
      "- build projects worth copying",
      "- go deep on AI/ML · contribute to open source · learn cloud",
      "",
      "# The long game",
      "- AI products → a startup that survives → real impact"
    ].join("\n"),
    "skills.json": JSON.stringify({
      languages: ["TypeScript", "Python", "JavaScript", "SQL", "C++", "Java", "Go", "Rust", "HTML", "CSS"],
      web: ["React", "Next.js", "Tailwind", "Node.js", "PostgreSQL", "Firebase", "Supabase"],
      ai_ml: ["TensorFlow", "PyTorch", "Scikit-Learn", "LangChain", "LLM apps", "AI agents"],
      loading_next: ["AWS", "Azure", "GCP", "Docker", "GitHub Actions"]
    }, null, 2)
  };

  function print(html, cls) {
    const div = document.createElement("div");
    if (cls) div.className = cls;
    div.innerHTML = html;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  }

  function printPre(text, cls) {
    const pre = document.createElement("pre");
    if (cls) pre.className = cls;
    pre.textContent = text;
    out.appendChild(pre);
    out.scrollTop = out.scrollHeight;
  }

  function echoCommand(cmd) {
    print('<span class="t-p">ashvik@portfolio:~$</span> <span class="t-cmd">' + esc(cmd) + "</span>");
  }

  const COMMANDS = {
    help: function () {
      printPre(
        "portfolio.sh — available commands\n" +
        "  about        who is this kid\n" +
        "  whoami       short version\n" +
        "  skills       the toolbox (also: cat skills.json)\n" +
        "  projects     things shipped\n" +
        "  certs        the certificate shelf\n" +
        "  goals        the roadmap\n" +
        "  contact      ways to reach me\n" +
        "  socials      links, linkified\n" +
        "  open <x>     github | linkedin | vercel | mail\n" +
        "  ls / cat     poke around the fake filesystem\n" +
        "  neofetch     system info, sort of\n" +
        "  lamp         pull the lamp cord from here\n" +
        "  date, echo, history, clear\n" +
        "  ...and one command recruiters should try with sudo", "t-dim");
    },
    about: function () { printPre(FILES["about.md"]); },
    whoami: function () { print('<span class="t-ok">ashvik</span> <span class="t-dim">— student · software engineer · AI/ML engineer (age 15, uptime 100%)</span>'); },
    skills: function () { printPre(FILES["skills.json"]); },
    projects: function () {
      print('<span class="t-ok">P-01 cafe-wink</span> <span class="t-dim">— café site, first full ship</span> → <a href="' + LINKS.github + '/cafe-wink" target="_blank" rel="noopener">repo</a>');
      print('<span class="t-ok">P-02 ai-code-review-agent</span> <span class="t-dim">— an AI that reviews code</span> → <a href="' + LINKS.github + '/ai-code-review-agent" target="_blank" rel="noopener">repo</a>');
    },
    certs: function () {
      printPre(
        "[1] Machine Learning with Python .......... IBM / Coursera\n" +
        "[2] Deep Learning with Keras & TensorFlow .. IBM / Coursera\n" +
        "[3] IBM AI Badge ........................... IBM\n" +
        "[4] Elements of AI ......................... Uni. of Helsinki\n" +
        "[5] Building AI (with honors) .............. Uni. of Helsinki", "t-ok");
      print('<span class="t-dim">full scans in the AI Lab section above ↑</span>');
    },
    goals: function () { printPre(FILES["goals.md"]); },
    contact: function () {
      print('email → <a href="' + LINKS.mail + '">ashvik.desk@gmail.com</a> <span class="t-dim">· location → India · response time → faster than my build times</span>');
    },
    socials: function () {
      print('github   → <a href="' + LINKS.github + '" target="_blank" rel="noopener">github.com/Ashvik-desk</a>');
      print('linkedin → <a href="' + LINKS.linkedin + '" target="_blank" rel="noopener">linkedin.com/in/ashvik-gangwar</a>');
      print('vercel   → <a href="' + LINKS.vercel + '" target="_blank" rel="noopener">vercel.com/ashvik-desks-projects</a>');
    },
    ls: function () { print('<span class="t-ok">about.md&nbsp;&nbsp;goals.md&nbsp;&nbsp;skills.json&nbsp;&nbsp;projects/&nbsp;&nbsp;certs/</span>'); },
    neofetch: function () {
      printPre(
        "        /\\         ashvik@portfolio\n" +
        "       /  \\        -----------------\n" +
        "      / /\\ \\       OS:       Debian + macOS (dual-wield)\n" +
        "     / ____ \\      Shell:    bash · Editor: VS Code\n" +
        "    /_/    \\_\\     Uptime:   15 years\n" +
        "                   Langs:    10 · Certs: 5 · Projects: shipping\n" +
        "                   Mission:  build AI products that matter", "t-ok");
    },
    date: function () { print('<span class="t-dim">' + esc(new Date().toString()) + "</span>"); },
    history: function () {
      history.forEach(function (h, i) { print('<span class="t-dim">' + (i + 1) + "&nbsp;&nbsp;" + esc(h) + "</span>"); });
    },
    lamp: function () {
      if (window.AshvikTheme) {
        window.AshvikTheme.toggle();
        print('<span class="t-warn">*click*</span> — lights ' + (window.AshvikTheme.get() === "lit" ? "on. welcome to the day shift." : "off. night mode engaged."));
      }
    },
    clear: function () { out.innerHTML = ""; },
    pwd: function () { print("/home/ashvik/portfolio"); },
    exit: function () { print('<span class="t-dim">nice try. this terminal is load-bearing.</span>'); }
  };
  COMMANDS.theme = COMMANDS.lamp;

  function run(raw) {
    const cmd = raw.trim();
    echoCommand(cmd);
    if (!cmd) return;
    history.push(cmd);
    histIdx = history.length;

    const parts = cmd.split(/\s+/);
    const name = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    if (name === "sudo") {
      if (arg.toLowerCase() === "hire-ashvik") {
        printPre(
          "[sudo] password for recruiter: ********\n" +
          "Permission granted.\n" +
          "  ✓ enthusiasm ......... found\n" +
          "  ✓ certificates ....... 5/5 verified\n" +
          "  ✓ ego ................ not found (good)\n" +
          "Next step → ", "t-ok");
        print('<a href="' + LINKS.mail + '">ashvik.desk@gmail.com</a> <span class="t-dim">(offer letters welcome)</span>');
      } else {
        print('<span class="t-warn">ashvik is not in the sudoers file. this incident will be reported.</span>');
      }
      return;
    }
    if (name === "echo") { print(esc(arg)); return; }
    if (name === "open") {
      const key = arg.toLowerCase();
      if (LINKS[key]) {
        print('<span class="t-dim">opening ' + esc(key) + "…</span>");
        window.open(LINKS[key], "_blank", "noopener");
      } else {
        print('<span class="t-warn">open: unknown target "' + esc(arg) + '" — try github | linkedin | vercel | mail</span>');
      }
      return;
    }
    if (name === "cat") {
      if (FILES[arg]) printPre(FILES[arg]);
      else print('<span class="t-warn">cat: ' + esc(arg || "<file>") + ": no such file</span> <span class=\"t-dim\">(try ls)</span>");
      return;
    }
    if (name === "hello" || name === "hi") { print("hey! type <span class='t-ok'>help</span> to look around."); return; }
    if (COMMANDS[name]) { COMMANDS[name](); return; }
    print('<span class="t-warn">bash: ' + esc(name) + ': command not found</span> <span class="t-dim">— try help</span>');
  }

  /* history */
  const history = [];
  let histIdx = 0;

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx] || ""; }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < history.length) { histIdx++; input.value = history[histIdx] || ""; }
    }
  });

  panel.addEventListener("click", function (e) {
    if (window.getSelection().toString()) return; // don't steal text selections
    if (e.target.closest("a")) return;
    input.focus({ preventScroll: true });
  });

  document.querySelectorAll(".term-suggest [data-cmd]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      run(btn.dataset.cmd);
      input.focus({ preventScroll: true });
    });
  });

  /* boot message on first view */
  let booted = false;
  const io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !booted) {
      booted = true;
      print('<span class="t-dim">portfolio.sh v2.0 — last login: from a physics class, probably</span>');
      print('<span class="t-dim">type</span> <span class="t-ok">help</span> <span class="t-dim">to explore, or click a chip above.</span>');
      io.disconnect();
    }
  }, { threshold: 0.3 });
  io.observe(panel);
})();
