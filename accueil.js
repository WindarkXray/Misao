/* ======================================================================
   MISAO · Accueil — « Entrez dans le grain »
   Grains de poivre réalistes en suspension ; un clic plonge à l'intérieur.
   ====================================================================== */
(function () {
  "use strict";
  var root = document.getElementById("cosmos"); if (!root || !window.MISAO) return;
  var cv = document.getElementById("spheres"), ctx = cv.getContext ? cv.getContext("2d") : null; if (!ctx) return;
  var orbsEl = document.getElementById("orbs"), tip = document.getElementById("orb-tip");
  var byId = {}; window.MISAO.produits.forEach(function (p) { byId[p.id] = p; });
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var euro = new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" });

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function inOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function inExpo(t) { return t <= 0 ? 0 : Math.pow(2, 10 * t - 10); }
  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) { return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))]; }
  function rgb(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a == null ? 1 : a) + ")"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var seed = 7;
  function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }

  /* ---------- Les grains (un par produit) ---------- */
  var DEF = [
    { id: "poivre-kivu", kind: "ridge", base: "#2b201b", hi: "#7a5c48", r: 1, x: 0.5, y: 0.5, mx: 0.5, my: 0.5, d: 1, tag: "Notre signature" },
    { id: "poivre-equateur", kind: "ridge", base: "#4c2519", hi: "#9a5a3c", r: 0.6, x: 0.82, y: 0.2, mx: 0.8, my: 0.17, d: 0.8, tag: "Sauvage · RD Congo" },
    { id: "poivre-penja", kind: "smooth", base: "#cbbd9c", hi: "#f6eedc", r: 0.56, x: 0.8, y: 0.8, mx: 0.8, my: 0.83, d: 0.85, tag: "Poivre blanc · Cameroun" },
    { id: "voatsiperifery", kind: "ridge", tail: true, base: "#33281f", hi: "#6e5644", r: 0.46, x: 0.17, y: 0.24, mx: 0.18, my: 0.2, d: 0.65, tag: "Sauvage · Madagascar" },
    { id: "baies-passion", kind: "glossy", base: "#8a2b1d", hi: "#de6a48", r: 0.44, x: 0.2, y: 0.78, mx: 0.2, my: 0.82, d: 0.7, tag: "Baie rare · Éthiopie" },
    { id: "kampot-blanc", kind: "smooth", base: "#ddd0b0", hi: "#fffaf0", r: 0.36, x: 0.47, y: 0.1, mx: 0.47, my: 0.08, d: 0.55, tag: "Bio · IGP · Cambodge" },
    { id: "sarawak-noir", kind: "ridge", base: "#191513", hi: "#51443a", r: 0.38, x: 0.9, y: 0.5, mx: 0.91, my: 0.5, d: 0.6, tag: "Poivre noir · Malaisie" }
  ];

  /* ---------- Dessin d'un grain : texture (qui tourne) + lumière (fixe) ---------- */
  function off(w, h, dpr) { var c = document.createElement("canvas"); c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr); var x = c.getContext("2d"); x.scale(dpr, dpr); return { c: c, x: x, w: w, h: h }; }
  function outline(x, R, ph) {
    x.beginPath();
    for (var i = 0; i <= 72; i++) {
      var a = i / 72 * Math.PI * 2;
      var rr = R * 0.985;
      x[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
    }
    x.closePath();
  }
  function makeTex(d, R, dpr) {
    var s = off(R * 2 + 8, R * 2 + 8, dpr), x = s.x, base = hex(d.base), hi = hex(d.hi);
    seed = d.id.length * 977 + 13;
    x.translate(R + 4, R + 4);
    outline(x, R, d.id.length);
    x.fillStyle = rgb(mix(base, hi, 0.08)); x.fill();
    x.save(); x.clip();
    /* taches de couleur */
    for (var i = 0; i < 150; i++) {
      var px = (rnd() - 0.5) * 2 * R, py = (rnd() - 0.5) * 2 * R, pr = R * (0.04 + rnd() * 0.13);
      var g = x.createRadialGradient(px, py, 0, px, py, pr);
      var c = rnd() < 0.5 ? mix(base, hi, 0.5 + rnd() * 0.4) : mix(base, [0, 0, 0], rnd() * 0.4);
      g.addColorStop(0, rgb(c, 0.2)); g.addColorStop(1, rgb(c, 0));
      x.fillStyle = g; x.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
    if (d.kind === "ridge") {
      /* réseau de rides du grain séché */
      var N = 14, pts = [], j, k;
      for (j = 0; j <= N; j++) { pts[j] = []; for (k = 0; k <= N; k++) pts[j][k] = [(-1 + 2 * k / N + (rnd() - 0.5) * 0.11) * R * 1.05, (-1 + 2 * j / N + (rnd() - 0.5) * 0.11) * R * 1.05]; }
      function ridge(a, b, w) {
        var mx = (a[0] + b[0]) / 2 + (rnd() - 0.5) * R * 0.16, my = (a[1] + b[1]) / 2 + (rnd() - 0.5) * R * 0.16;
        x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(mx, my, b[0], b[1]);
        x.lineWidth = w; x.strokeStyle = "rgba(0,0,0,.42)"; x.stroke();
        x.beginPath(); x.moveTo(a[0] - R * 0.012, a[1] - R * 0.014); x.quadraticCurveTo(mx - R * 0.012, my - R * 0.014, b[0] - R * 0.012, b[1] - R * 0.014);
        x.lineWidth = w * 0.5; x.strokeStyle = rgb(mix(hi, [255, 240, 220], 0.2), 0.2); x.stroke();
      }
      x.lineCap = "round";
      for (j = 0; j <= N; j++) for (k = 0; k <= N; k++) {
        var w = R * (0.009 + rnd() * 0.014);
        if (k < N && rnd() < 0.72) ridge(pts[j][k], pts[j][k + 1], w);
        if (j < N && rnd() < 0.72) ridge(pts[j][k], pts[j + 1][k], w);
        if (k < N && j < N && rnd() < 0.25) ridge(pts[j][k], pts[j + 1][k + 1], w * 0.8);
      }
      /* micro-rides */
      for (i = 0; i < 40; i++) { var qx = (rnd() - 0.5) * 2 * R, qy = (rnd() - 0.5) * 2 * R, qr = R * (0.03 + rnd() * 0.06); var pg = x.createRadialGradient(qx, qy, 0, qx, qy, qr); pg.addColorStop(0, "rgba(0,0,0,.35)"); pg.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = pg; x.fillRect(qx - qr, qy - qr, qr * 2, qr * 2); }
      for (i = 0; i < 260; i++) {
        var sx = (rnd() - 0.5) * 2 * R, sy = (rnd() - 0.5) * 2 * R, ang = rnd() * 6.28, L = R * (0.04 + rnd() * 0.1);
        x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(ang) * L, sy + Math.sin(ang) * L);
        x.lineWidth = R * 0.008; x.strokeStyle = rnd() < 0.5 ? "rgba(0,0,0,.35)" : rgb(hi, 0.18); x.stroke();
      }
    } else {
      /* grain lisse : fines marbrures */
      for (i = 0; i < 260; i++) {
        x.fillStyle = rnd() < 0.5 ? "rgba(90,70,40,.06)" : (d.kind === "glossy" ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.06)");
        x.beginPath(); x.arc((rnd() - 0.5) * 2 * R, (rnd() - 0.5) * 2 * R, R * (0.01 + rnd() * 0.04), 0, 6.283); x.fill();
      }
      x.strokeStyle = "rgba(120,95,60,.05)"; x.lineWidth = R * 0.01;
      for (i = 0; i < (d.kind === "smooth" ? 5 : 0); i++) { x.beginPath(); x.arc(R * 0.1, R * 0.05, R * (0.2 + i * 0.12), rnd() * 3, rnd() * 3 + 2.4); x.stroke(); }
      if (d.kind === "smooth") { x.fillStyle = "rgba(110,85,55,.5)"; x.beginPath(); x.arc(R * 0.05, -R * 0.02, R * 0.06, 0, 6.283); x.fill(); }
    }
    x.restore();
    if (d.tail) {
      x.strokeStyle = rgb(mix(base, [120, 90, 60], 0.5)); x.lineWidth = R * 0.07; x.lineCap = "round";
      x.beginPath(); x.moveTo(R * 0.55, -R * 0.75); x.quadraticCurveTo(R * 0.95, -R * 1.15, R * 0.95, -R * 1.55 + 0); x.stroke();
    }
    s.R = R; return s;
  }
  function makeLight(d, R, dpr) {
    var s = off(R * 2 + 8, R * 2 + 8, dpr), x = s.x, glossy = d.kind === "glossy" ? 1 : d.kind === "smooth" ? 0.6 : 0.35;
    x.translate(R + 4, R + 4);
    outline(x, R, d.id.length); x.save(); x.clip();
    var g = x.createRadialGradient(-R * 0.32, -R * 0.38, 0, -R * 0.32, -R * 0.38, R * 1.55);
    g.addColorStop(0, "rgba(255,245,225,.18)"); g.addColorStop(0.28, "rgba(0,0,0,0)"); g.addColorStop(0.7, "rgba(0,0,0,.38)"); g.addColorStop(1, "rgba(0,0,0,.72)");
    x.fillStyle = g; x.fillRect(-R - 4, -R - 4, R * 2 + 8, R * 2 + 8);
    var limb = x.createRadialGradient(0, 0, R * 0.62, 0, 0, R * 1.02);
    limb.addColorStop(0, "rgba(0,0,0,0)"); limb.addColorStop(1, "rgba(0,0,0,.4)");
    x.fillStyle = limb; x.fillRect(-R - 4, -R - 4, R * 2 + 8, R * 2 + 8);
    var sp = x.createRadialGradient(-R * 0.36, -R * 0.44, 0, -R * 0.36, -R * 0.44, R * (0.22 + glossy * 0.12));
    sp.addColorStop(0, "rgba(255,255,255," + (0.25 + glossy * 0.6) + ")"); sp.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = sp; x.fillRect(-R, -R, R * 2, R * 2);
    var rim = x.createRadialGradient(-R * 0.3, -R * 0.36, 0, -R * 0.3, -R * 0.36, R * 1.6);
    rim.addColorStop(0, "rgba(246,214,140,0)"); rim.addColorStop(0.82, "rgba(246,214,140,0)"); rim.addColorStop(0.93, "rgba(246,214,140,.22)"); rim.addColorStop(1, "rgba(246,214,140,0)");
    x.fillStyle = rim; x.fillRect(-R - 4, -R - 4, R * 2 + 8, R * 2 + 8);
    x.restore();
    return s;
  }
  function softDot(r, col, dpr) { var s = off(r * 2, r * 2, dpr), g = s.x.createRadialGradient(r, r, 0, r, r, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); s.x.fillStyle = g; s.x.fillRect(0, 0, r * 2, r * 2); return s; }
  /* ---------- État du champ ---------- */
  var W, H, DPR, mobile, R0, G = [], dust = [], bokeh = [], S = {};
  function build() {
    var r = root.getBoundingClientRect();
    W = Math.max(200, r.width); H = Math.max(200, r.height);
    mobile = window.innerWidth < 760;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    R0 = Math.min(W, H) * (mobile ? 0.16 : 0.15);
    var texR = mobile ? 220 : 300;
    G = DEF.map(function (d, i) {
      var tex = makeTex(d, texR, 1.5), light = makeLight(d, texR, 1.5);
      return { d: d, p: byId[d.id], tex: tex, light: light, rot: rnd() * 6.28, spin: (rnd() - 0.5) * 0.12 + (i % 2 ? 0.05 : -0.05), ph: rnd() * 6.28, hov: 0, sx: 0, sy: 0, sr: 0 };
    });
    S.shadow = softDot(120, "rgba(0,8,4,.55)", 1);
    S.bokeh = softDot(60, "rgba(246,214,140,.9)", 1);
    S.dustTex = []; S.dustLight = [];
    [0, 2, 6].forEach(function (k) { S.dustTex.push(makeTex(DEF[k], 60, 1)); S.dustLight.push(makeLight(DEF[k], 60, 1)); });
    seed = 99;
    dust = []; for (var i = 0; i < (mobile ? 18 : 34); i++) dust.push({ x: rnd(), y: rnd(), z: 0.15 + rnd() * 0.85, k: Math.floor(rnd() * 3), rot: rnd() * 6.28, sp: (rnd() - 0.5) * 0.4, ph: rnd() * 6.28 });
    bokeh = []; for (var b = 0; b < 26; b++) bokeh.push({ x: rnd(), y: rnd(), s: 20 + rnd() * 80, a: 0.04 + rnd() * 0.12, ph: rnd() * 6.28 });
    buildButtons();
  }
  function buildButtons() {
    orbsEl.innerHTML = "";
    G.forEach(function (g, i) {
      var b = document.createElement("button");
      b.className = "orb"; b.type = "button";
      b.setAttribute("aria-label", "Entrer dans le grain : " + g.p.nom);
      b.addEventListener("mouseenter", function () { hover = i; });
      b.addEventListener("mouseleave", function () { if (hover === i) hover = -1; });
      b.addEventListener("focus", function () { hover = i; });
      b.addEventListener("blur", function () { if (hover === i) hover = -1; });
      b.addEventListener("click", function () { dive(i); });
      orbsEl.appendChild(b); g.btn = b;
    });
  }

  var hover = -1, mx = 0, my = 0, tmx = 0, tmy = 0, T0 = performance.now(), lastTip = -2;
  function drawCorn(x, g, cx, cy, R, rot, alpha) {
    var tex = g.tex, light = g.light, k = R / tex.R;
    x.globalAlpha = alpha == null ? 1 : alpha;
    x.save(); x.beginPath(); x.arc(cx, cy, R * 0.985, 0, 6.2832); x.clip(); x.translate(cx, cy); x.rotate(rot);
    x.drawImage(tex.c, -tex.w / 2 * k, -tex.h / 2 * k, tex.w * k, tex.h * k);
    x.restore();
    x.drawImage(light.c, cx - light.w / 2 * k, cy - light.h / 2 * k, light.w * k, light.h * k);
    x.globalAlpha = 1;
  }
  function scrollOff() { var r = root.getBoundingClientRect(); return clamp(-r.top / H, 0, 1.2); }

  function frame(now) {
    var t = reduce ? 0 : (now - T0) / 1000, so = scrollOff();
    mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    /* bokeh */
    bokeh.forEach(function (b) {
      ctx.globalAlpha = b.a * (0.6 + 0.4 * Math.sin(t * 0.6 + b.ph));
      var s = b.s; ctx.drawImage(S.bokeh.c, b.x * W - s - mx * 8, b.y * H - s - so * H * 0.2, s * 2, s * 2);
    });
    ctx.globalAlpha = 1;
    /* petits grains en profondeur */
    dust.forEach(function (d) {
      var R = R0 * 0.22 * (0.4 + d.z * 0.7), x = d.x * W - mx * 18 * d.z, y = d.y * H + Math.sin(t * 0.5 + d.ph) * 6 - so * H * (0.06 + d.z * 0.12);
      var a = 0.35 + d.z * 0.5;
      drawCorn(ctx, { tex: S.dustTex[d.k], light: S.dustLight[d.k] }, x, y, R, d.rot + t * d.sp, a * (diving ? 1 - diveT : 1));
    });
    /* grands grains */
    var order = G.map(function (g, i) { return i; }).sort(function (a, b) { return G[a].d.d - G[b].d.d; });
    order.forEach(function (i) {
      var g = G[i], d = g.d;
      g.hov += ((hover === i ? 1 : 0) - g.hov) * 0.12;
      var px = (mobile ? d.mx : d.x) * W, py = (mobile ? d.my : d.y) * H;
      px += -mx * 22 * d.d + Math.sin(t * 0.45 + g.ph) * 5 * d.d;
      py += -my * 16 * d.d + Math.cos(t * 0.38 + g.ph) * 7 * d.d - so * H * (0.04 + d.d * 0.08);
      var R = R0 * d.r * (1 + g.hov * 0.12);
      g.rot += reduce ? 0 : g.spin * 0.016 * (1 + g.hov * 3);
      var alpha = 1;
      if (diving) {
        if (i === diveI) { g.sx = px; g.sy = py; g.sr = R; return; }
        var dx = px - W / 2, dy = py - H / 2, push = inOutCubic(diveT) * 1.6;
        px += dx * push; py += dy * push; R *= 1 + push * 0.5; alpha = 1 - smooth(0.1, 0.7, diveT);
      }
      ctx.globalAlpha = 0.5 * alpha;
      ctx.drawImage(S.shadow.c, px - R * 1.15 + R * 0.25, py - R * 1.15 + R * 0.35, R * 2.3, R * 2.3);
      drawCorn(ctx, g, px, py, R, g.rot, alpha);
      if (g.hov > 0.02) {
        ctx.globalAlpha = g.hov * 0.9 * alpha;
        ctx.strokeStyle = "rgba(246,214,140,.8)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(px, py, R * 1.18 + Math.sin(t * 3) * 2, 0, 6.283); ctx.stroke();
        ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.arc(px, py, R * 1.34, t * 0.5, t * 0.5 + 6.283); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
      g.sx = px; g.sy = py; g.sr = R;
      var b = g.btn; if (b) { b.style.transform = "translate(" + (px - R) + "px," + (py - R) + "px)"; b.style.width = b.style.height = (R * 2) + "px"; }
    });
    /* étiquette du grain survolé */
    if (hover !== lastTip) {
      lastTip = hover;
      if (hover >= 0) { var p = G[hover].p; tip.innerHTML = '<span class="k">' + esc(G[hover].d.tag) + '</span><b>' + esc(p.nom) + '</b><span class="go">Entrer dans le grain →</span>'; tip.hidden = false; }
      else tip.hidden = true;
    }
    if (hover >= 0 && !diving) {
      var gg = G[hover], below = gg.sy + gg.sr * 1.4 + 100 < H;
      var top = below ? gg.sy + gg.sr * 1.4 : gg.sy - gg.sr * 1.4 - 96;
      tip.style.transform = "translate(" + clamp(gg.sx - 125, 8, W - 258) + "px," + clamp(top, 8, H - 100) + "px)";
    }
    if (diving) diveFrame(now);
  }

  /* ---------- Plongée dans le grain ---------- */
  var diving = false, diveI = -1, diveT = 0, diveDir = 1, diveStart = 0, DUR = 1150;
  var dc = document.getElementById("dive"), dx = dc.getContext("2d");
  var inside = document.getElementById("inside"), ic = document.getElementById("inside-cv"), ix = ic.getContext("2d");
  function sizeDive() { var d = Math.min(window.devicePixelRatio || 1, 2); dc.width = innerWidth * d; dc.height = innerHeight * d; dx.setTransform(d, 0, 0, d, 0, 0); }
  function dive(i) {
    if (diving) return;
    diving = true; diveI = i; diveDir = 1; diveT = 0; diveStart = performance.now(); hover = -1; tip.hidden = true;
    document.body.classList.add("locked"); sizeDive(); dc.hidden = false;
    if (reduce) { diveT = 1; finishIn(); }
  }
  function diveFrame(now) {
    var g = G[diveI], el = (now - diveStart) / DUR;
    diveT = clamp(diveDir > 0 ? el : 1 - el, 0, 1);
    var r = cv.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    var sx = r.left + g.sx, sy = r.top + g.sy;
    var e = inOutCubic(smooth(0, 0.55, diveT)), z = inExpo(smooth(0.15, 1, diveT));
    var cx = lerp(sx, vw / 2, e), cy = lerp(sy, vh / 2, e);
    var R = lerp(g.sr * 1.12, Math.hypot(vw, vh) * 1.6, z);
    var base = hex(g.d.base), deep = mix(base, [8, 18, 12], 0.55);
    dx.clearRect(0, 0, vw, vh);
    /* voile qui s'assombrit */
    dx.fillStyle = rgb([8, 20, 13], smooth(0, 0.5, diveT) * 0.75); dx.fillRect(0, 0, vw, vh);
    /* traînées de vitesse */
    var sl = smooth(0.2, 0.8, diveT) * (1 - smooth(0.85, 1, diveT));
    if (sl > 0) {
      dx.save(); dx.translate(cx, cy);
      for (var k = 0; k < 90; k++) {
        var a = k * 2.399 + 0.3, r0 = R * 0.9 + (k * 37 % 120), len = 60 + (k * 53 % 220) * sl * 2;
        dx.strokeStyle = "rgba(246,214,140," + (0.08 + (k % 5) * 0.03) * sl + ")"; dx.lineWidth = 1 + (k % 3);
        dx.beginPath(); dx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); dx.lineTo(Math.cos(a) * (r0 + len), Math.sin(a) * (r0 + len)); dx.stroke();
      }
      dx.restore();
    }
    g.rot += 0.02 + z * 0.06;
    drawCorn(dx, g, cx, cy, R, g.rot, 1);
    /* la couleur du grain envahit l'écran */
    var fl = smooth(0.72, 1, diveT);
    if (fl > 0) { dx.fillStyle = rgb(deep, fl); dx.fillRect(0, 0, vw, vh); }
    if (diveDir > 0 && el >= 1) finishIn();
    if (diveDir < 0 && el >= 1) { diving = false; dc.hidden = true; document.body.classList.remove("locked"); if (G[diveI].btn) G[diveI].btn.focus(); }
  }
  function finishIn() { diving = false; openInside(diveI); dc.hidden = true; }
  function diveOut() {
    closeInside(function () {
      if (reduce) { diving = false; document.body.classList.remove("locked"); return; }
      diveDir = -1; diveStart = performance.now(); dc.hidden = false; diving = true; requestAnimationFrame(loop);
    });
  }

  /* ---------- L'intérieur du grain ---------- */
  var cur = -1, inT0 = 0, inRun = false, words = [], inMotes = [];
  function openInside(i) {
    cur = i; renderInside(); inside.hidden = false;
    requestAnimationFrame(function () { inside.classList.add("show"); });
    inT0 = performance.now(); if (!inRun) { inRun = true; requestAnimationFrame(insideLoop); }
    setTimeout(function () { var c = document.getElementById("in-close"); if (c) c.focus(); }, 80);
  }
  function closeInside(cb) {
    inside.classList.remove("show");
    setTimeout(function () { inside.hidden = true; inRun = false; cb && cb(); }, reduce ? 0 : 420);
  }
  function renderInside() {
    var g = G[cur], p = g.p, base = hex(g.d.base), hi = hex(g.d.hi);
    var deep = mix(mix(hi, [23, 51, 38], 0.5), [0, 0, 0], 0.25), deeper = mix(base, [5, 14, 9], 0.6), acc = mix(hi, [246, 214, 140], 0.45);
    inside.style.setProperty("--ia", rgb(deep)); inside.style.setProperty("--ib", rgb(deeper)); inside.style.setProperty("--acc", rgb(acc));
    var minP = Math.min.apply(null, p.variantes.map(function (v) { return v.prix; })), multi = p.variantes.length > 1;
    var heat = ""; for (var h = 1; h <= 5; h++) heat += '<i class="' + (h <= (p.piquant || 0) ? "on" : "") + '"></i>';
    var formats = p.options && p.options.Format ? p.options.Format.join(" · ") : (p.format || "Sachet");
    var cta = p.epuise ? '<button class="btn" disabled>Épuisé</button>' : multi ? '<button class="btn gold" data-open="' + p.id + '">Choisir mon format</button>' : '<button class="btn gold" data-add="' + p.id + '">Ajouter au panier</button>';
    document.getElementById("in-body").innerHTML =
      '<p class="in-k">' + esc(g.d.tag) + "</p>" +
      '<h2 id="in-title">' + esc(p.nom) + "</h2>" +
      '<p class="in-desc">' + esc(p.description) + "</p>" +
      '<dl class="in-facts">' +
      '<div><dt>Origine</dt><dd>' + esc((p.origine || "").split("·")[0]) + "</dd></div>" +
      '<div><dt>Piquant</dt><dd><span class="heat">' + heat + "</span></dd></div>" +
      '<div><dt>Formats</dt><dd>' + esc(formats) + "</dd></div>" +
      '<div><dt>Prix</dt><dd>' + (multi ? "dès " : "") + euro.format(minP) + "</dd></div>" +
      "</dl>" +
      (p.accords ? '<p class="in-acc"><span>Accords</span>' + p.accords.map(esc).join(" · ") + "</p>" : "") +
      '<div class="in-cta">' + cta + '<a class="btn light" href="boutique.html">Toute la boutique</a></div>';
    document.getElementById("in-count").textContent = (cur + 1) + " / " + G.length;
    /* arômes en orbite */
    var wz = document.getElementById("in-words"); wz.innerHTML = "";
    words = (p.notes || []).concat(p.accords ? p.accords.slice(0, 3) : []).slice(0, 7).map(function (w, k, arr) {
      var s = document.createElement("span"); s.textContent = w; s.className = k < (p.notes || []).length ? "w note" : "w acc"; wz.appendChild(s);
      return { el: s, a: k / arr.length * Math.PI * 2, sp: 0.18 + (k % 3) * 0.05, tilt: 0.32 + (k % 2) * 0.12, rr: 1.45 + (k % 3) * 0.18 };
    });
    seed = cur * 31 + 5;
    inMotes = []; for (var m = 0; m < 40; m++) inMotes.push({ x: rnd(), y: rnd(), z: 0.2 + rnd() * 0.8, ph: rnd() * 6.28, sp: 0.2 + rnd() * 0.6 });
    sizeInside();
  }
  var IW, IH, IDPR;
  function sizeInside() { IDPR = Math.min(window.devicePixelRatio || 1, 2); IW = innerWidth; IH = innerHeight; ic.width = IW * IDPR; ic.height = IH * IDPR; }
  function insideLoop(now) {
    if (!inRun) return;
    var t = reduce ? 0 : (now - inT0) / 1000, g = G[cur], mob = IW < 860;
    var cx = mob ? IW / 2 : IW * 0.3, cy = mob ? IH * 0.26 : IH * 0.52;
    var R = mob ? Math.min(IW * 0.27, IH * 0.15) : Math.min(IW * 0.15, IH * 0.27);
    var intro = 1 - Math.pow(1 - clamp((now - inT0) / 900, 0, 1), 3);
    R *= lerp(2.6, 1, intro);
    ix.setTransform(IDPR, 0, 0, IDPR, 0, 0); ix.clearRect(0, 0, IW, IH);
    /* poussière d'épices */
    inMotes.forEach(function (m) {
      var x = m.x * IW + Math.sin(t * m.sp + m.ph) * 20, y = ((m.y * IH - t * 12 * m.z) % IH + IH) % IH;
      ix.globalAlpha = 0.15 + m.z * 0.35; ix.fillStyle = "rgba(246,214,140,1)";
      ix.beginPath(); ix.arc(x, y, 0.6 + m.z * 1.8, 0, 6.283); ix.fill();
    });
    ix.globalAlpha = 1;
    /* halo */
    var hg = ix.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 2.4);
    hg.addColorStop(0, "rgba(246,214,140,.18)"); hg.addColorStop(1, "rgba(246,214,140,0)");
    ix.fillStyle = hg; ix.fillRect(cx - R * 2.5, cy - R * 2.5, R * 5, R * 5);
    /* orbites */
    ix.strokeStyle = "rgba(246,214,140,.16)"; ix.lineWidth = 1;
    [1.45, 1.63, 1.81].forEach(function (k, n) { ix.beginPath(); ix.ellipse(cx, cy, R * k, R * k * (0.32 + (n % 2) * 0.12), -0.18, 0, 6.283); ix.stroke(); });
    /* arômes derrière le grain */
    var front = [];
    words.forEach(function (w) {
      var a = w.a + t * w.sp, ex = Math.cos(a) * R * w.rr, ey = Math.sin(a) * R * w.rr * w.tilt;
      var rx = ex * Math.cos(-0.18) - ey * Math.sin(-0.18), ry = ex * Math.sin(-0.18) + ey * Math.cos(-0.18);
      var z = Math.sin(a), sc = 0.82 + 0.28 * (z + 1) / 2;
      w.el.style.transform = "translate(" + (cx + rx) + "px," + (cy + ry) + "px) translate(-50%,-50%) scale(" + sc + ")";
      w.el.style.opacity = (0.45 + 0.55 * (z + 1) / 2) * intro;
      w.el.style.zIndex = z > 0 ? 3 : 1;
      w.el.style.filter = z < -0.3 ? "blur(1.5px)" : "none";
    });
    g.rot += reduce ? 0 : 0.004;
    ix.globalAlpha = 0.55; ix.drawImage(S.shadow.c, cx - R * 1.2 + R * 0.3, cy - R * 1.2 + R * 0.45, R * 2.4, R * 2.4); ix.globalAlpha = 1;
    drawCorn(ix, g, cx, cy, R, g.rot, 1);
    requestAnimationFrame(insideLoop);
  }
  function go(step) {
    var n = (cur + step + G.length) % G.length;
    var body = document.getElementById("in-panel");
    body.classList.add("swap");
    setTimeout(function () { cur = n; diveI = n; renderInside(); inT0 = performance.now(); body.classList.remove("swap"); }, reduce ? 0 : 260);
  }
  document.getElementById("in-close").addEventListener("click", diveOut);
  document.getElementById("in-prev").addEventListener("click", function () { go(-1); });
  document.getElementById("in-next").addEventListener("click", function () { go(1); });
  document.addEventListener("keydown", function (e) {
    if (inside.hidden || diving) return;
    if (e.key === "Escape" && document.getElementById("pmodal") && !document.getElementById("pmodal").hidden) return;
    if (e.key === "Escape") diveOut();
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }, true);
  /* swipe sur téléphone */
  var tx0 = null;
  inside.addEventListener("touchstart", function (e) { tx0 = e.touches[0].clientX; }, { passive: true });
  inside.addEventListener("touchend", function (e) { if (tx0 == null) return; var dxs = e.changedTouches[0].clientX - tx0; if (Math.abs(dxs) > 70) go(dxs < 0 ? 1 : -1); tx0 = null; }, { passive: true });

  /* ---------- Boucle ---------- */
  var running = false;
  function loop(now) { if (diving || inside.hidden) frame(now); if (running || diving) requestAnimationFrame(loop); }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function stop() { running = false; }
  build(); frame(performance.now());
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) start(); else stop(); }); }).observe(root);
  else start();
  var rT; window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(function () { build(); if (!inside.hidden) sizeInside(); }, 150); });
  window.addEventListener("pointermove", function (e) { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });
  var origDive = dive; dive = function (i) { origDive(i); if (!running) requestAnimationFrame(loop); };
  root.classList.add("is-running");
})();
