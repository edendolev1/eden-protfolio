/* Museum index: a side rail on desktop, a slide-in drawer on mobile.
   Every room (the works, About, Contact) lives in index.html; the rail asks it to
   open one through window.__openWork(key).
   Usage: <script src="nav.js" data-page="index" data-wide="1180"></script>
   data-wide: viewport width below which the desktop rail collapses to numbers + dots
   (names slide out on hover).
   Keep WORKS in the same order and colours as DATA in index.html. */
(function () {
  var WORKS = [
    ["BALASH", "#48f542"],
    ["DMX-Shield", "#ec008c"],
    ["Terra Rossa", "#e0242b"],
    ["SAMSON", "#0f22f7"],
    ["Pulsation", "#c7f1f2"],
    ["Selected Light Designs", "#0a0a0a"],
    ["Fire Sneakers", "#ff4d1a"]
  ];
  var PAGES = [["About", "index.html#about", "about"], ["Contact", "index.html#contact", "contact"]];
  var HOME_COLOR = "#0f22f7";

  var me = document.currentScript;
  var page = (me && me.getAttribute("data-page")) || "index";
  var wide = +((me && me.getAttribute("data-wide")) || 1180);

  function slug(name) { return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  var CSS = [
    ".mn, .mn-fab, .mn-scrim { font-family:'Open Sans', sans-serif; -webkit-font-smoothing:antialiased; }",
    ".mn { position:fixed; z-index:50; color:#0a0a0a; }",
    ".mn a { color:inherit; text-decoration:none; }",
    ".mn-head { display:flex; align-items:center; justify-content:space-between; }",
    ".mn-home { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:#8a8a86; transition:color .25s; }",
    ".mn-home:hover { color:#0a0a0a; }",
    ".mn-close { display:none; }",
    ".mn-list { position:relative; list-style:none; margin:0; padding:0; }",
    ".mn-row { opacity:0; transition:opacity .45s ease, transform .7s cubic-bezier(.16,1,.3,1); transition-delay:calc(var(--k) * 45ms); }",
    ".mn-in .mn-row { opacity:1; transform:none; }",
    ".mn-gap { height:var(--gap); }",
    ".mn-link { position:relative; z-index:1; display:flex; align-items:center; gap:10px; white-space:nowrap; cursor:pointer;",
    "  opacity:var(--o, .62); transform:translateX(var(--sx, 0px));",
    "  transition:opacity .5s ease, transform .75s cubic-bezier(.16,1,.3,1); transition-delay:calc(var(--d, 0) * 40ms); }",
    "@media (hover:hover) { .mn-link:hover { opacity:1; transform:translateX(calc(var(--sx, 0px) + 4px)); transition-delay:0ms; } }",
    ".mn-dot { width:5px; height:5px; flex:none; border-radius:50%; background:#cfcfcb; }",
    ".mn-name { display:inline-block; overflow:hidden; letter-spacing:-0.005em; }",
    ".mn-on .mn-dot { opacity:0; transition:opacity .4s ease; }",
    /* the light that glides to the current room */
    ".mn-light { position:absolute; z-index:0; left:0; top:0; width:var(--lw); height:var(--lw); margin:calc(var(--lw) / -2) 0 0 calc(var(--lw) / -2); border-radius:50%; pointer-events:none;",
    "  background-color:var(--lc, #0f22f7); opacity:0;",
    "  -webkit-mask-image:radial-gradient(circle closest-side, #000 72%, rgba(0,0,0,0.9) 86%, rgba(0,0,0,0) 100%);",
    "  mask-image:radial-gradient(circle closest-side, #000 72%, rgba(0,0,0,0.9) 86%, rgba(0,0,0,0) 100%);",
    "  transition:top .8s cubic-bezier(.16,1,.3,1), left .8s cubic-bezier(.16,1,.3,1), background-color .7s ease, opacity .5s ease; }",
    ".mn-has-light .mn-light { opacity:1; animation:mn-breathe 4.5s ease-in-out infinite; }",
    "@keyframes mn-breathe { 0%,100% { transform:scale(1); } 50% { transform:scale(1.14); } }",
    ".mn-fab, .mn-scrim { display:none; }",
    ".mn-instant .mn-row, .mn-instant .mn-link, .mn-instant .mn-light { transition:none !important; }",
    ".mn-flying .mn-name { opacity:0 !important; transition:none !important; }",
    ".mn-flyer { position:fixed; z-index:60; pointer-events:none; white-space:nowrap; font-family:'Open Sans', sans-serif; -webkit-font-smoothing:antialiased; will-change:transform; }",
    ".mn-flyer > div { transform-origin:0 50%; will-change:transform, opacity; }",
    // flyers come in pairs: the dark one is cut away under the homepage light, the white one only shows inside it
    ".mn-fly-layer { position:fixed; inset:0; z-index:60; pointer-events:none; }",
    ".mn-fly-dark { -webkit-mask-image:radial-gradient(circle var(--spot-r, 0px) at var(--spot-x, 0px) var(--spot-y, 0px), transparent 0 calc(var(--spot-r, 0px) * .72), #000 calc(var(--spot-r, 0px) * .86));",
    "  mask-image:radial-gradient(circle var(--spot-r, 0px) at var(--spot-x, 0px) var(--spot-y, 0px), transparent 0 calc(var(--spot-r, 0px) * .72), #000 calc(var(--spot-r, 0px) * .86)); }",
    ".mn-fly-lit { z-index:61; -webkit-mask-image:radial-gradient(circle var(--spot-r, 0px) at var(--spot-x, 0px) var(--spot-y, 0px), #000 0 calc(var(--spot-r, 0px) * .72), transparent calc(var(--spot-r, 0px) * .86));",
    "  mask-image:radial-gradient(circle var(--spot-r, 0px) at var(--spot-x, 0px) var(--spot-y, 0px), #000 0 calc(var(--spot-r, 0px) * .72), transparent calc(var(--spot-r, 0px) * .86)); }",
    ".mn-fly-lit .mn-flyer > div { color:#ffffff !important; }",

    "@media (min-width:721px) {",
    "  .mn { --lw:16px; --gap:14px; left:20px; top:50%; transform:translateY(-50%); padding:16px 18px 16px 12px; border-radius:16px;",
    "    background:rgba(255,255,255,0.86); -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px);",
    "    transition:opacity .45s ease, visibility .45s; }",
    "  .mn.mn-off { opacity:0; visibility:hidden; pointer-events:none; }",
    "  .mn-head { margin:0 0 12px 1px; }",
    "  .mn-row { transform:translateX(-14px); }",
    "  .mn-link { height:29px; font-size:13px; }",
    "  .mn-tight .mn-name { max-width:0; opacity:0; transition:max-width .5s cubic-bezier(.16,1,.3,1), opacity .3s ease; transition-delay:calc(var(--k) * 30ms); }",
    "  .mn-tight:hover .mn-name, .mn-tight:focus-within .mn-name { max-width:240px; opacity:1; }",
    "  .mn-tight .mn-home { display:inline-block; max-width:0; opacity:0; overflow:hidden; white-space:nowrap; transition:max-width .5s cubic-bezier(.16,1,.3,1), opacity .3s ease; }",
    "  .mn-tight:hover .mn-home, .mn-tight:focus-within .mn-home { max-width:160px; opacity:1; }",
    "}",

    "@media (max-width:720px) {",
    /* a rounded box of frost (think Lee diffusion) that opens from the INDEX button; nav.js sets its top */
    "  .mn { --lw:18px; --gap:14px; top:12px; left:-2px; width:max-content; min-width:230px; max-width:100vw;",
    "    overflow:visible; padding:34px 40px 36px 32px; background:none; color:#ffffff;",
    "    opacity:0; visibility:hidden; transform:scale(.94) translateY(-6px); transform-origin:12px 12px;",
    "    transition:opacity .35s ease, transform .5s cubic-bezier(.16,1,.3,1), visibility 0s linear .5s, color .35s ease; }",
    /* the colour is a rounded block blurred like light, so the corners and the
       end of the feather fade smoothly into the page (same reach as before) */
    "  .mn::before { content:''; position:absolute; inset:14px; z-index:-1; border-radius:24px; pointer-events:none;",
    "    background-color:color-mix(in srgb, var(--mc, #0f22f7) 95%, transparent); filter:blur(10px); transition:background-color .35s ease; }",
    /* frost grain, fading out before the edge */
    "  .mn::after { content:''; position:absolute; inset:14px; z-index:-1; pointer-events:none; opacity:.13; mix-blend-mode:multiply;",
    "    background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\");",
    "    -webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%, #000 75%, transparent 100%); mask-image:radial-gradient(ellipse 50% 50% at 50% 50%, #000 75%, transparent 100%); }",
    "  .mn.mn-open { opacity:1; visibility:visible; transform:none; transition:opacity .35s ease, transform .5s cubic-bezier(.16,1,.3,1), visibility 0s, color .35s ease; }",
    "  .mn-head { position:relative; margin-bottom:12px; gap:24px; }",
    "  .mn-home { font-size:11px; }",
    "  .mn-close { display:block; font-size:11px; letter-spacing:0.1em; color:#8a8a86; background:none; border:0; padding:6px 0 6px 12px; cursor:pointer; font-family:inherit; }",
    "  .mn-list { position:relative; }",
    "  .mn-row { transform:translateY(6px); transition-delay:calc(60ms + var(--k) * 35ms); }",
    "  .mn-link { height:34px; font-size:16px; font-weight:400; gap:11px; letter-spacing:-0.005em; }",
    "  .mn-dot { width:5px; height:5px; background:currentColor; opacity:.45; }",
    "  .mn-home, .mn-close { color:inherit; opacity:.75; }",
    "  .mn-light { background-color:#ffffff; }",
    "  .mn-link { opacity:max(var(--o, .62), .66); }",
    "  .mn-fab { display:flex; position:fixed; z-index:49; left:10px; top:62px; border:0; padding:6px 10px; margin:0; border-radius:14px; cursor:pointer;",
    "    background:rgba(255,255,255,0); -webkit-backdrop-filter:blur(0); backdrop-filter:blur(0);",
    "    align-items:center; gap:8px; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:#6e6e6a;",
    "    -webkit-tap-highlight-color:transparent; transition:opacity .4s ease, color .25s ease, top .5s cubic-bezier(.16,1,.3,1), background .4s ease, -webkit-backdrop-filter .4s ease, backdrop-filter .4s ease; }",
    /* once the name has scrolled away, it rides up to the top edge on a soft white backing */
    "  .mn-fab.mn-stuck { top:12px; background:rgba(255,255,255,0.88); -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px); }",
    "  .mn-fab:active { color:#0a0a0a; }",
    "  .mn-fab i { display:block; width:14px; height:1.5px; background:currentColor; box-shadow:0 -4px 0 currentColor; margin-top:4px; }",
    "  .mn-fab.mn-off, .mn-fab[aria-expanded='true'] { opacity:0; pointer-events:none; }",
    "  .mn-scrim { display:block; position:fixed; inset:0; z-index:48; background:rgba(245,245,243,0.25); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px); opacity:0; pointer-events:none; transition:opacity .45s ease; }",
    "  .mn-scrim.mn-open { opacity:1; pointer-events:auto; }",
    "}",
    "@media (prefers-reduced-motion: reduce) {",
    "  .mn *, .mn, .mn-fab { animation:none !important; transition-duration:.01s !important; transition-delay:0s !important; }",
    "}"
  ].join("\n");

  var active = page === "index" ? null : page;   // a work index, "about", "contact" or null
  var nav, list, light, fab, scrim, rows = [];

  function rowOf(key) {
    for (var r = 0; r < rows.length; r++) if (rows[r].key === key) return rows[r];
    return null;
  }

  function build() {
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);

    nav = document.createElement("nav");
    nav.className = "mn";
    nav.setAttribute("aria-label", "Index of works");
    nav.innerHTML =
      '<div class="mn-head mn-row" style="--k:0"><a class="mn-home" href="index.html">Eden Dolev</a>' +
      '<button class="mn-close" type="button" aria-label="Close index">CLOSE ×</button></div>';
    list = document.createElement("ul");
    list.className = "mn-list";
    light = document.createElement("span");
    light.className = "mn-light";
    list.appendChild(light);

    var k = 1;
    WORKS.forEach(function (w, i) {
      rows.push(addRow(i, w[0], w[1], "index.html#" + slug(w[0]), k++));
    });
    var gap = document.createElement("li");
    gap.className = "mn-gap";
    gap.setAttribute("aria-hidden", "true");
    list.appendChild(gap);
    PAGES.forEach(function (p) {
      rows.push(addRow(p[2], p[0], HOME_COLOR, p[1], k++));
    });
    nav.appendChild(list);

    fab = document.createElement("button");
    fab.type = "button";
    fab.className = "mn-fab";
    fab.setAttribute("aria-label", "Open index of works");
    fab.setAttribute("aria-expanded", "false");
    fab.innerHTML = "<i></i>Index";
    scrim = document.createElement("div");
    scrim.className = "mn-scrim";

    document.body.appendChild(scrim);
    document.body.appendChild(nav);
    document.body.appendChild(fab);

    fab.addEventListener("click", function () { setOpen(true); });
    scrim.addEventListener("click", function () { setOpen(false); });
    nav.querySelector(".mn-close").addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    nav.querySelector(".mn-home").addEventListener("click", function (e) {
      if (typeof window.__openWork === "function") { e.preventDefault(); setOpen(false); window.__openWork(null); }
    });
    window.addEventListener("resize", layout);
    var stuck = function () { fab.classList.toggle("mn-stuck", window.scrollY > 48); };
    window.addEventListener("scroll", stuck, { passive: true });
    stuck();
    // coming back with the browser's Back button can restore the page with the drawer still open
    window.addEventListener("pageshow", function (e) { if (e.persisted) setOpen(false); });

    layout();
    render(true);
    // let the first frame paint before the entrance transition starts
    requestAnimationFrame(function () { requestAnimationFrame(function () { render(); }); });
  }

  function addRow(key, name, color, href, k) {
    var li = document.createElement("li");
    li.className = "mn-row";
    li.style.setProperty("--k", k);
    var a = document.createElement("a");
    a.className = "mn-link";
    a.href = href;
    a.innerHTML = '<span class="mn-dot"></span><span class="mn-name">' + name + "</span>";
    a.addEventListener("click", function (e) {
      if (typeof window.__openWork === "function") {
        e.preventDefault();
        var open = nav.classList.contains("mn-open"), same = key === active;
        window.__openWork(key);
        if (open && !same) setTimeout(function () { setOpen(false); }, 450);
        else setOpen(false);
      } else if (key === active) {
        e.preventDefault();
        setOpen(false);
      }
    });
    li.appendChild(a);
    list.appendChild(li);
    return { key: key, li: li, a: a, color: color, order: k - 1 };
  }

  function layout() {
    if (!nav) return;
    nav.classList.toggle("mn-tight", window.innerWidth < wide);
    place();
  }

  function setOpen(v) {
    if (!nav) return;
    var mobile = window.matchMedia("(max-width:720px)").matches;
    if (!mobile) v = false;
    nav.classList.toggle("mn-open", v);
    scrim.classList.toggle("mn-open", v);
    fab.setAttribute("aria-expanded", v ? "true" : "false");
    document.documentElement.style.overflow = v ? "hidden" : "";
    if (mobile && v) nav.style.top = Math.max(0, fab.getBoundingClientRect().top - 22) + "px";
    if (mobile) {
      nav.classList.remove("mn-in");
      if (v) { void nav.offsetWidth; nav.classList.add("mn-in"); place(); }
    }
  }

  // Put the gliding light on the current room.
  function place() {
    var r = rowOf(active);
    nav.classList.toggle("mn-has-light", !!r);
    if (!r) return;
    var dot = r.a.querySelector(".mn-dot");
    var shift = parseFloat(r.a.style.getPropertyValue("--sx")) || 0;
    light.style.left = (dot.offsetLeft + dot.offsetWidth / 2 + shift) + "px";
    light.style.top = (r.li.offsetTop + r.li.offsetHeight / 2) + "px";
    light.style.setProperty("--lc", r.color);
  }

  // Rooms near the current one lean out and brighten; the rest settle back,
  // rippling outward from the current room.
  function render(first) {
    if (!nav) return;
    var mobile = window.matchMedia("(max-width:720px)").matches;
    var cur = rowOf(active);
    var showRail = page !== "index" || active !== null;
    nav.classList.toggle("mn-off", !showRail);
    if (!first && (!mobile || nav.classList.contains("mn-open"))) nav.classList.toggle("mn-in", showRail);
    if (mobile && !nav.classList.contains("mn-open")) nav.classList.remove("mn-in");
    rows.forEach(function (r) {
      var d = cur ? Math.abs(r.order - cur.order) : 3;
      var sx = !cur ? 0 : d === 0 ? 10 : d === 1 ? 4 : 0;
      var o = !cur ? 0.78 : d === 0 ? 1 : d === 1 ? 0.7 : 0.48;
      r.a.style.setProperty("--sx", sx + "px");
      r.a.style.setProperty("--o", o);
      r.a.style.setProperty("--d", d);
      r.li.classList.toggle("mn-on", d === 0 && !!cur);
      if (d === 0 && cur) r.a.setAttribute("aria-current", "page"); else r.a.removeAttribute("aria-current");
    });
    fab.classList.toggle("mn-off", !showRail);
    var c = cur ? cur.color : HOME_COLOR;
    nav.style.setProperty("--mc", c);
    place();
  }

  function canFly() {
    return !!nav && !window.matchMedia("(max-width:720px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // Where a title sits and how it is set, so a stand-in can take its place.
  function snap(el, opacity) {
    if (!el) return null;
    var r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return { left: r.left, top: r.top, h: r.height, text: el.textContent.trim(),
      size: parseFloat(cs.fontSize), weight: cs.fontWeight, ls: parseFloat(cs.letterSpacing) || 0,
      color: cs.color, opacity: r.width < 2 ? 0 : (opacity == null ? 1 : opacity) };
  }

  function nameSnaps() {
    return WORKS.map(function (w, i) {
      var r = rowOf(i);
      return snap(r.a.querySelector(".mn-name"), parseFloat(getComputedStyle(r.a).opacity));
    });
  }

  var flyers = [], flightDone = null, flyLayers = null;
  function flyLayer(k) {
    if (!flyLayers) {
      flyLayers = ["mn-fly-dark", "mn-fly-lit"].map(function (c) {
        var l = document.createElement("div");
        l.className = "mn-fly-layer " + c;
        document.body.appendChild(l);
        return l;
      });
    }
    return flyLayers[k];
  }
  function endFlight() {
    flyers.forEach(function (f) { f.remove(); });
    flyers = [];
    var d = flightDone;
    flightDone = null;
    if (d) d();
  }

  // Each title travels like a moving head: pan and tilt run on different curves,
  // so the path bends, and the pan settles with a slight overshoot.
  function fly(from, to, done) {
    endFlight();
    flightDone = done;
    var jobs = [];
    from.forEach(function (a, k) {
      var b = to[k];
      if (!a || !b) return;
      var s = b.size / a.size;
      var dx = b.left - a.left, dy = (b.top + b.h / 2) - (a.top + a.h / 2);
      var delay = k * 38;
      [0, 1].forEach(function (lit) {
        var outer = document.createElement("div"), inner = document.createElement("div");
        outer.className = "mn-flyer";
        outer.style.left = a.left + "px";
        outer.style.top = a.top + "px";
        inner.style.cssText = "font-size:" + a.size + "px; font-weight:" + b.weight + "; letter-spacing:" + a.ls +
          "px; color:" + a.color + "; line-height:" + a.h + "px;";
        inner.textContent = a.text;
        outer.appendChild(inner);
        flyLayer(lit).appendChild(outer);
        flyers.push(outer);
        jobs.push(outer.animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(" + dx + "px)" }],
          { duration: 760, delay: delay, easing: "cubic-bezier(.62,.02,.22,1.05)", fill: "both" }).finished);
        jobs.push(inner.animate([
          { transform: "translateY(0) scale(1)", opacity: a.opacity, letterSpacing: a.ls + "px" },
          { transform: "translateY(" + dy + "px) scale(" + s + ")", opacity: b.opacity, letterSpacing: (b.ls / s) + "px" }
        ], { duration: 680, delay: delay, easing: "cubic-bezier(.32,0,.16,1)", fill: "both" }).finished);
      });
    });
    var mine = flyers;
    Promise.all(jobs).then(function () { if (flyers === mine) endFlight(); }, function () {});
  }

  window.MuseumNav = {
    slug: slug,
    snap: snap,
    fly: function (from, to, done) { if (canFly()) fly(from, to, done); else if (done) done(); },
    // The rail's titles as they are now, for flying them back to the homepage.
    snapshot: function () { return canFly() && active !== null ? nameSnaps() : null; },
    // from: homepage titles (snap() of each, in WORKS order) to fly into the rail.
    setActive: function (key, from) {
      if (key === active) return;
      var wasHome = page === "index" && active === null;
      active = key;
      if (from && wasHome && key !== null && canFly()) {
        nav.classList.add("mn-instant", "mn-flying");
        render();
        void nav.offsetWidth;
        var to = nameSnaps();
        nav.classList.remove("mn-instant");
        fly(from, to, function () { nav.classList.remove("mn-flying"); });
        return;
      }
      if (page === "index" && key === null && canFly()) nav.classList.add("mn-flying");
      else if (!flyers.length) nav.classList.remove("mn-flying");
      render();
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
