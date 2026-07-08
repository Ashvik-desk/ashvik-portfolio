# Ashvik — Portfolio

A personal portfolio for **Ashvik** — a Class 10 student from India building software that learns.
Warm dark "studio" aesthetic lit by a single pull-cord lamp, with a handful of genuinely
interactive pieces rather than decorative filler.

**Live:** _deploy to Vercel / GitHub Pages and add the link here_

---

## Highlights

- **Pull-cord lamp** — drag the rope (or press it with the keyboard) to switch the whole site
  between the dark studio and a lit, daytime theme. The bulb glows and casts a light cone.
- **3D hero object** — a pseudo-3D laptop (Zdog) mid-build, orbited by the things it's learning.
  Drag to spin.
- **Scroll film** — a "Night Build" sequence rendered live on a `<canvas>` and scrubbed by your
  scroll position, from midnight code session to sunrise ship.
- **Neural playground** — a real forward pass running in the browser (no ML library). Edit the
  inputs, click any wire to retune its weight, stack hidden layers, and watch the verdict flip.
- **Terminal** — the whole portfolio, greppable. Type `help` to explore. There's a hidden
  command for recruiters.
- **Code panel** — the bio, but it type-checks (with a `train.py` tab).
- Smooth scrolling (Lenis), an animated background (Vanta), tilt cards, and scroll reveals —
  all gated for performance and respectful of `prefers-reduced-motion`.

## Built with

Plain **HTML + CSS + vanilla JavaScript** — no build step. Libraries loaded from CDN with
Subresource Integrity:

- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scrolling
- [Zdog](https://zzz.dog/) — pseudo-3D hero illustration
- [Vanta.js](https://www.vantajs.com/) + [three.js](https://threejs.org/) — animated background
- [Vanilla-tilt](https://micku7zu.github.io/vanilla-tilt.js/) — card tilt

Type: **Clash Display** (display) · **Archivo** (body) · **JetBrains Mono** (data).

## Run locally

No build needed — just serve the folder over HTTP:

```bash
python3 -m http.server 4188
# then open http://localhost:4188
```

## Structure

```
index.html          # all page markup
css/style.css       # design tokens + every component
js/
  main.js           # smooth scroll, nav, reveals, Vanta, tilt
  lamp.js           # the pull-cord lamp / theme switch
  scene3d.js        # Zdog hero laptop
  scrollfilm.js     # scroll-scrubbed canvas film
  codepanel.js      # typed, syntax-highlighted code panel
  neural.js         # interactive neural network
  terminal.js       # command-line portfolio
assets/certs/       # certificate scans
```

## Contact

- GitHub: [Ashvik-desk](https://github.com/Ashvik-desk)
- LinkedIn: [ashvik-gangwar](https://www.linkedin.com/in/ashvik-gangwar-55a59940b/)
- Email: ashvik.desk@gmail.com

---

© 2026 Ashvik — designed & built at 15.
