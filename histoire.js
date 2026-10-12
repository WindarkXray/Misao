/* ======================================================================
   MISAO · Notre histoire — le poivrier qui pousse au défilement
   Rendu canvas 2,5D : feuilles pré-dessinées en haute définition,
   plusieurs plans de profondeur, croissance et maturation liées au scroll.
   ====================================================================== */
(function () {
  "use strict";
  var sec = document.getElementById("scrolly"); if (!sec) return;
  var stage = document.getElementById("stage"), cv = document.getElementById("plant");
  var ctx = cv && cv.getContext ? cv.getContext("2d") : null;
  var chaps = [].slice.call(sec.querySelectorAll(".chap"));
  var rail = [].slice.call(sec.querySelectorAll(".rail li"));
  var bar = sec.querySelector(".rail-bar i");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  sec.classList.add("js");

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function backOut(t) { var c = 1.6; t = t - 1; return t * t * ((c + 1) * t + c) + 1; }
  function progress() {
    var r = sec.getBoundingClientRect(), tot = r.height - stage.offsetHeight, top = parseFloat(getComputedStyle(stage).top) || 0;
    return tot > 0 ? clamp((top - r.top) / tot, 0, 1) : 0;
  }

  /* ---------- Chapitres de texte ---------- */
  var active = -1;
  function chapterUI() {
    var mid = window.innerHeight * 0.55, best = 0, bd = 1e9;
    chaps.forEach(function (c, i) { var r = c.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = i; } });
    if (best !== active) {
      active = best;
      chaps.forEach(function (c, i) { c.classList.toggle("on", i === best); });
      rail.forEach(function (li, i) { li.classList.toggle("done", i < best - 1); li.classList.toggle("cur", i === best - 1); });
    }
    if (bar) bar.style.transform = "scaleX(" + clamp((best - 1) / (rail.length - 1), 0, 1) + ")";
  }
  window.addEventListener("scroll", chapterUI, { passive: true });
  window.addEventListener("resize", chapterUI);
  chapterUI();

  if (!ctx) { sec.classList.add("no-gl"); return; }

  /* ---------- Hasard reproductible ---------- */
  var seed = 1;
  function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function off(w, h) { var c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w * DPR)); c.height = Math.max(1, Math.ceil(h * DPR)); var x = c.getContext("2d"); x.scale(DPR, DPR); return { c: c, x: x, w: w, h: h }; }
  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) { return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))]; }
  function rgb(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a == null ? 1 : a) + ")"; }
  function shade(c, f) { return f < 0 ? mix(c, [0, 0, 0], -f) : mix(c, [255, 255, 255], f); }

  /* ---------- Sprites : feuilles ---------- */
  function leafHalf(v, L, asym) {
    var W = L * 0.31;
    var w = W * Math.pow(Math.sin(Math.PI * Math.pow(clamp(v, 0, 1), 0.78)), 0.82) * (1 - 0.28 * smooth(0.7, 1, v));
    w += W * 0.16 * Math.exp(-v * 16);
    return w * (1 + asym);
  }
  function leafPath(x, L, cxF, asym) {
    var n = 40, i, v;
    x.beginPath();
    for (i = 0; i <= n; i++) { v = i / n; x[i ? "lineTo" : "moveTo"](cxF(v) + leafHalf(v, L, asym), v * L); }
    x.lineTo(cxF(1.04), 1.04 * L);
    for (i = n; i >= 0; i--) { v = i / n; x.lineTo(cxF(v) - leafHalf(v, L, -asym), v * L); }
    x.closePath();
  }
  function makeLeaf(L, o) {
    o = o || {};
    var pad = L * 0.04, Wd = L * 0.31 * 2.3 + pad * 2, Hd = L * 1.08 + pad;
    var s = off(Wd, Hd), x = s.x, ox = Wd / 2, bend = o.bend || 0, asym = o.asym || 0;
    function cxF(v) { return ox + bend * L * v * v; }
    x.save();
    leafPath(x, L, cxF, asym);
    if (o.silhouette) { x.fillStyle = o.silhouette; x.fill(); x.restore(); s.ox = ox; return s; }
    var base = hex(o.color || "#2f7a40");
    var g = x.createLinearGradient(ox - L * 0.36, 0, ox + L * 0.36, 0);
    g.addColorStop(0, rgb(shade(base, 0.18))); g.addColorStop(0.47, rgb(shade(base, 0.06)));
    g.addColorStop(0.53, rgb(shade(base, -0.22))); g.addColorStop(1, rgb(shade(base, -0.42)));
    x.fillStyle = g; x.fill();
    x.clip();
    var g2 = x.createLinearGradient(0, 0, 0, L);
    g2.addColorStop(0, "rgba(170,210,90,.32)"); g2.addColorStop(0.3, "rgba(170,210,90,0)");
    g2.addColorStop(0.75, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(0,15,5,.28)");
    x.fillStyle = g2; x.fillRect(0, 0, Wd, Hd);
    /* reflet brillant (feuille vernissée) */
    x.save(); x.translate(cxF(0.4) - L * 0.12, L * 0.4); x.rotate(-0.12); x.scale(1, 2.6);
    var gl = x.createRadialGradient(0, 0, 0, 0, 0, L * 0.11);
    gl.addColorStop(0, "rgba(235,255,225,.30)"); gl.addColorStop(1, "rgba(235,255,225,0)");
    x.fillStyle = gl; x.beginPath(); x.arc(0, 0, L * 0.11, 0, 6.283); x.fill(); x.restore();
    x.save(); x.translate(cxF(0.62) + L * 0.1, L * 0.62); x.rotate(0.2); x.scale(1, 3);
    var gl2 = x.createRadialGradient(0, 0, 0, 0, 0, L * 0.06);
    gl2.addColorStop(0, "rgba(220,255,220,.10)"); gl2.addColorStop(1, "rgba(220,255,220,0)");
    x.fillStyle = gl2; x.beginPath(); x.arc(0, 0, L * 0.06, 0, 6.283); x.fill(); x.restore();
    /* grain de la feuille */
    for (var i = 0; i < 380; i++) { x.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,.035)" : "rgba(0,20,8,.05)"; x.fillRect(ox + (rnd() - 0.5) * L * 0.62, rnd() * L, 0.6 + rnd() * 1.4, 0.6 + rnd() * 1.4); }
    /* nervures */
    function vein(f, v0, v1, lw, col) {
      x.beginPath();
      for (var k = 0; k <= 30; k++) { var v = lerp(v0, v1, k / 30); var px = cxF(v) + f * leafHalf(v, L, f > 0 ? asym : -asym); x[k ? "lineTo" : "moveTo"](px, v * L); }
      x.lineWidth = lw; x.strokeStyle = col; x.stroke();
    }
    x.lineCap = "round";
    [-0.42, 0.42, -0.74, 0.74].forEach(function (f) { vein(f, 0.03, 0.93, L * 0.0055, "rgba(190,230,150,.30)"); vein(f + (f > 0 ? 0.012 : -0.012), 0.05, 0.9, L * 0.004, "rgba(0,20,8,.16)"); });
    [-0.9, 0.9].forEach(function (f) { vein(f, 0.02, 0.4, L * 0.004, "rgba(190,230,150,.22)"); });
    /* nervures secondaires en réseau */
    for (var vv = 0.08; vv < 0.9; vv += 0.055) {
      [-1, 1].forEach(function (sd) {
        var a = cxF(vv), b = cxF(vv + 0.05);
        x.beginPath(); x.moveTo(a + sd * 2, vv * L);
        x.quadraticCurveTo(a + sd * leafHalf(vv, L, 0) * 0.25, (vv + 0.02) * L, b + sd * 0.42 * leafHalf(vv + 0.05, L, 0), (vv + 0.05) * L);
        x.lineWidth = L * 0.0028; x.strokeStyle = "rgba(190,230,150,.15)"; x.stroke();
        x.beginPath(); x.moveTo(a + sd * 0.42 * leafHalf(vv, L, 0), vv * L);
        x.quadraticCurveTo(a + sd * 0.6 * leafHalf(vv, L, 0), (vv + 0.035) * L, b + sd * 0.74 * leafHalf(vv + 0.05, L, 0), (vv + 0.05) * L);
        x.lineWidth = L * 0.0022; x.strokeStyle = "rgba(190,230,150,.10)"; x.stroke();
      });
    }
    /* nervure centrale effilée */
    for (var p = 0; p < 3; p++) {
      var v0 = p / 3 * 0.95, v1 = (p + 1) / 3 * 0.95;
      x.beginPath(); for (var k2 = 0; k2 <= 12; k2++) { var v = lerp(v0, v1, k2 / 12); x[k2 ? "lineTo" : "moveTo"](cxF(v), v * L); }
      x.lineWidth = L * (0.016 - p * 0.0045); x.strokeStyle = "rgba(205,235,160,.55)"; x.stroke();
    }
    x.beginPath(); for (var k3 = 0; k3 <= 30; k3++) { var v2 = k3 / 30 * 0.95; x[k3 ? "lineTo" : "moveTo"](cxF(v2) + L * 0.007, v2 * L); }
    x.lineWidth = L * 0.004; x.strokeStyle = "rgba(0,25,10,.22)"; x.stroke();
    x.restore();
    /* bord : liseré sombre + lumière de contour côté éclairé */
    leafPath(x, L, cxF, asym);
    x.lineWidth = Math.max(0.8, L * 0.004); x.strokeStyle = "rgba(8,30,16,.55)"; x.stroke();
    x.save(); x.beginPath(); x.rect(0, 0, ox, Hd); x.clip(); leafPath(x, L, cxF, asym);
    x.lineWidth = Math.max(0.6, L * 0.003); x.strokeStyle = "rgba(225,255,205,.22)"; x.stroke(); x.restore();
    if (o.dim) { x.globalCompositeOperation = "source-atop"; x.fillStyle = "rgba(4,22,13," + o.dim + ")"; x.fillRect(0, 0, Wd, Hd); x.globalCompositeOperation = "source-over"; }
    s.ox = ox; return s;
  }
  function blurLeaf(L, col, blur) {
    var src = makeLeaf(L, { silhouette: col, bend: (rnd() - 0.5) * 0.1 });
    var m = blur * 2.2, s = off(src.w + m * 2, src.h + m * 2);
    s.x.shadowColor = col; s.x.shadowBlur = blur * DPR; s.x.shadowOffsetX = 4000 * DPR;
    s.x.drawImage(src.c, m - 4000, m, src.w, src.h);
    s.ox = src.ox + m; s.oy = m; return s;
  }

  /* ---------- Sprites : baies (vert → rouge → noir) ---------- */
  var STEPS = 40;
  var C_G = hex("#86b34a"), C_R = hex("#c4311e"), C_B = hex("#2b1c16");
  function berryColor(t) { return t < 0.5 ? mix(C_G, C_R, t * 2) : mix(C_R, C_B, (t - 0.5) * 2); }
  function makeBerry(r, t, back) {
    var s = off(r * 2 + 4, r * 2 + 4), x = s.x, c = berryColor(t), dry = smooth(0.62, 1, t);
    x.translate(r + 2, r + 2);
    var g = x.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    g.addColorStop(0, rgb(shade(c, 0.38 - dry * 0.25))); g.addColorStop(0.55, rgb(c)); g.addColorStop(1, rgb(shade(c, -0.55)));
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.fill();
    if (dry > 0.05) {
      x.strokeStyle = "rgba(0,0,0," + (0.35 * dry) + ")"; x.lineWidth = Math.max(0.5, r * 0.09);
      for (var i = 0; i < 5; i++) { x.beginPath(); var a = i * 1.3 + 0.4; x.arc(Math.cos(a) * r * 0.25, Math.sin(a) * r * 0.25, r * (0.45 + (i % 2) * 0.2), a, a + 1.4); x.stroke(); }
    }
    var sp = x.createRadialGradient(-r * 0.38, -r * 0.42, 0, -r * 0.38, -r * 0.42, r * 0.42);
    sp.addColorStop(0, "rgba(255,255,255," + (0.85 - dry * 0.6) + ")"); sp.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = sp; x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.fill();
    x.strokeStyle = "rgba(255,255,255,.14)"; x.lineWidth = Math.max(0.5, r * 0.1);
    x.beginPath(); x.arc(0, 0, r * 0.82, 0.2, 1.4); x.stroke();
    if (back) { x.globalCompositeOperation = "source-atop"; x.fillStyle = "rgba(6,20,12,.35)"; x.fillRect(-r - 2, -r - 2, r * 2 + 4, r * 2 + 4); }
    s.r = r; return s;
  }
  function softDot(r, col) {
    var s = off(r * 2, r * 2), g = s.x.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
    s.x.fillStyle = g; s.x.fillRect(0, 0, r * 2, r * 2); return s;
  }

  /* ---------- Monde ---------- */
  var W = 0, H = 0, DPR = 1, K = 1, mobile = false, CX = 0;
  var S = {}, vine = [], nodes = [], spikes = [], far = [], near = [], bokeh = [], motes = [];
  var Y0 = 0, LEN = 0;
  function vx(y) { var u = y / H, A = mobile ? W * 0.17 : Math.min(W * 0.085, H * 0.15); return CX + A * (0.6 * Math.sin(u * 2.1 + 0.4) + 0.28 * Math.sin(u * 5.3 + 1.2) + 0.12 * Math.sin(u * 11.7)); }

  function build() {
    var r = stage.getBoundingClientRect();
    W = Math.max(320, r.width); H = Math.max(420, r.height);
    mobile = W < 760;
    DPR = Math.min(window.devicePixelRatio || 1, mobile ? 2 : 1.75);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    K = H / 800 * (mobile ? 0.82 : 1);
    CX = mobile ? W * 0.5 : W * 0.7;
    Y0 = -0.18 * H; LEN = 4.1 * H;
    seed = 20261011;

    vine = [];
    for (var y = Y0; y <= Y0 + LEN; y += 3) vine.push({ x: vx(y), y: y });

    S.leaves = [], S.leavesBack = [];
    var palette = ["#2f7a40", "#357f3c", "#2a6e3b", "#3b8746", "#2d7444", "#337a37"];
    for (var i = 0; i < 6; i++) {
      var L = 230 * K, o = { color: palette[i], bend: (rnd() - 0.5) * 0.14, asym: (rnd() - 0.5) * 0.12 };
      S.leaves.push(makeLeaf(L, o));
      o.dim = 0.42; S.leavesBack.push(makeLeaf(L, o));
    }
    S.bf = [], S.bb = [];
    var br = 8.8 * K;
    for (var k = 0; k < STEPS; k++) { S.bf.push(makeBerry(br, k / (STEPS - 1), false)); S.bb.push(makeBerry(br, k / (STEPS - 1), true)); }
    S.bokeh = softDot(60, "rgba(246,214,140,.9)");
    S.mote = softDot(6, "rgba(255,240,200,1)");
    S.far = [blurLeaf(300 * K, "rgba(14,44,30,.95)", 10 * K), blurLeaf(260 * K, "rgba(18,52,35,.9)", 14 * K), blurLeaf(340 * K, "rgba(11,36,24,.95)", 8 * K)];
    S.near = [blurLeaf(520 * K, "rgba(5,18,11,.94)", 26 * K), blurLeaf(460 * K, "rgba(7,22,14,.92)", 30 * K)];

    /* noeuds : feuilles et grappes */
    nodes = []; spikes = [];
    var yN = Y0 + 0.16 * H, j = 0;
    while (yN < Y0 + LEN - 0.08 * H) {
      var side = j % 2 ? 1 : -1, up = rnd() < 0.28;
      var n = { y: yN, x: vx(yN), side: side, v: Math.floor(rnd() * 6), front: rnd() < 0.72,
        rot: up ? -side * (2.05 + rnd() * 0.45) : -side * (0.75 + rnd() * 0.55), s: (0.86 + rnd() * 0.3) * (mobile ? 0.92 : 1), ph: rnd() * 6.28, ph2: rnd() * 6.28 };
      nodes.push(n);
      if (rnd() < 0.5) nodes.push({ y: yN + 0.02 * H, x: vx(yN + 0.02 * H), side: side, v: Math.floor(rnd() * 6), front: rnd() < 0.5, rot: n.rot - side * 0.7, s: n.s * 0.62, ph: rnd() * 6.28, ph2: rnd() * 6.28 });
      if (j % 2 === 1 && j > 0) {
        var Ls = (0.14 + rnd() * 0.07) * H * (mobile ? 0.9 : 1), cnt = Math.floor(Ls / (5.6 * K));
        var sp = { y: yN + 0.01 * H, x: vx(yN + 0.01 * H), side: -side, len: Ls, n: cnt, lean: -side * (0.12 + rnd() * 0.2), ph: rnd() * 6.28, b: [] };
        for (var q = 0; q < cnt; q++) sp.b.push({ a: q * 2.39996 + rnd() * 0.3, v: (rnd() - 0.5) * 0.16 });
        spikes.push(sp);
      }
      yN += (0.115 + rnd() * 0.05) * H; j++;
    }

    /* plans de profondeur */
    far = []; near = []; bokeh = []; motes = [];
    for (var f = 0; f < 22; f++) far.push({ x: rnd() * W, y: Y0 + rnd() * (LEN + H), r: rnd() * 6.28, s: 0.7 + rnd() * 0.8, k: Math.floor(rnd() * 3), ph: rnd() * 6.28 });
    for (var nn = 0; nn < 7; nn++) near.push({ x: (nn % 2 ? W * (0.92 + rnd() * 0.1) : -W * 0.05 + rnd() * W * 0.12), y: Y0 + nn * (LEN / 6) + rnd() * H * 0.4, r: rnd() * 6.28, s: 0.9 + rnd() * 0.5, k: nn % 2, ph: rnd() * 6.28 });
    for (var b = 0; b < 46; b++) bokeh.push({ x: rnd() * W, y: Y0 + rnd() * (LEN + H), s: (18 + rnd() * 70) * K, a: 0.04 + rnd() * 0.14, ph: rnd() * 6.28 });
    for (var m = 0; m < 70; m++) motes.push({ x: rnd() * W, y: rnd() * H, s: 0.6 + rnd() * 1.6, sp: 6 + rnd() * 16, ph: rnd() * 6.28 });
  }

  /* ---------- État animé ---------- */
  var st = { g: -1, cam: 0, zoom: 1, mx: 0, my: 0, tmx: 0, tmy: 0 };
  function targets(p) {
    var tipStart = 0.74 * H, tipEnd = Y0 + LEN;
    var grow = smooth(0, 0.88, p) * 0.5 + clamp(p / 0.88, 0, 1) * 0.5;
    var tip = lerp(tipStart, tipEnd, grow);
    var reveal = smooth(0.87, 0.99, p);
    var camFollow = Math.max(0, tip - (mobile ? 0.56 : 0.66) * H);
    var zEnd = (H * 0.9) / (tipEnd - Y0 + 0.05 * H);
    var camEnd = Y0 - 0.04 * H;
    return { tip: tip, reveal: reveal, cam: lerp(camFollow, camEnd, reveal), zoom: lerp(1, zEnd, reveal) };
  }

  /* ---------- Rendu ---------- */
  var T0 = performance.now();
  function draw(now) {
    var t = reduce ? 0 : (now - T0) / 1000, p = progress(), tg = targets(p);
    var e = reduce ? 1 : 0.085;
    if (st.g < 0) { st.g = tg.tip; st.cam = tg.cam; st.zoom = tg.zoom; }
    st.g += (tg.tip - st.g) * e; st.cam += (tg.cam - st.cam) * e; st.zoom += (tg.zoom - st.zoom) * e;
    st.mx += (st.tmx - st.mx) * 0.05; st.my += (st.tmy - st.my) * 0.05;
    var tip = st.g, cam = st.cam, z = st.zoom, rev = tg.reveal;
    var ripe = smooth(0.30, 0.48, p), dry = smooth(0.62, 0.8, p);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);

    /* lumières de fond (bokeh) */
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    bokeh.forEach(function (b) {
      var y = b.y - cam * 0.3 * (1 - rev) + Math.sin(t * 0.3 + b.ph) * 8;
      y = ((y % (H * 1.6)) + H * 1.6) % (H * 1.6) - H * 0.3;
      ctx.globalAlpha = b.a * (0.6 + 0.4 * Math.sin(t * 0.7 + b.ph));
      ctx.drawImage(S.bokeh.c, b.x - b.s + st.mx * -6, y - b.s, b.s * 2, b.s * 2);
    });
    ctx.globalAlpha = 1;

    /* feuillage lointain flou */
    far.forEach(function (f) {
      var y = f.y - cam * 0.55; y = ((y % (LEN * 0.6 + H)) + (LEN * 0.6 + H)) % (LEN * 0.6 + H) - H * 0.4;
      var sp = S.far[f.k];
      ctx.save(); ctx.globalAlpha = 0.85 * (1 - rev * 0.6);
      ctx.translate(f.x + st.mx * -12, y); ctx.rotate(f.r + Math.sin(t * 0.5 + f.ph) * 0.03); ctx.scale(f.s, f.s);
      ctx.drawImage(sp.c, -sp.ox, -sp.oy, sp.w, sp.h); ctx.restore();
    });

    /* le poivrier (avec zoom de fin) */
    var ox = CX - CX * z + st.mx * 10 * (1 - rev);
    ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * ox, DPR * (-cam * z));
    var yMin = cam - H * 0.4, yMax = cam + H / z + H * 0.4;

    function leaf(n, back) {
      if (n.front === back) return;
      if (n.y < yMin - H * 0.4 || n.y > yMax) return;
      var a = smooth(n.y - 0.02 * H, n.y + 0.17 * H, tip); if (a <= 0.001) return;
      var sp = back ? S.leavesBack[n.v] : S.leaves[n.v];
      var wind = Math.sin(t * 1.15 + n.ph) * 0.045 + Math.sin(t * 2.6 + n.ph2) * 0.015;
      var rot = n.rot + (1 - a) * n.side * 0.9 + wind * a;
      var sc = backOut(a) * n.s, sx = Math.pow(a, 0.9);
      var pl = 0.04 * H * a;
      var bx = n.x - Math.sin(rot) * pl, by = n.y + Math.cos(rot) * pl;
      ctx.strokeStyle = "#5b7d38"; ctx.lineWidth = 2.6 * K; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.quadraticCurveTo(n.x + (bx - n.x) * 0.3, by, bx, by); ctx.stroke();
      ctx.save(); ctx.globalAlpha = smooth(0, 0.3, a); ctx.translate(bx, by); ctx.rotate(rot); ctx.scale(sc * sx, sc);
      if (!back && !mobile) { ctx.shadowColor = "rgba(0,12,6,.35)"; ctx.shadowBlur = 14 * K * DPR * z; ctx.shadowOffsetY = 8 * K * DPR * z; ctx.shadowOffsetX = 4 * K * DPR * z; }
      ctx.drawImage(sp.c, -sp.ox, 0, sp.w, sp.h);
      ctx.restore();
    }
    nodes.forEach(function (n) { leaf(n, true); });

    /* tige : ombre, corps, reflet */
    var tipI = clamp(Math.floor((tip - Y0) / 3), 1, vine.length - 1);
    var i0 = clamp(Math.floor((yMin - Y0) / 3), 0, tipI), i1 = clamp(Math.ceil((yMax - Y0) / 3), 0, tipI);
    var CH = 8, ii, k;
    var cYoung = hex("#86b04a"), cOld = hex("#5e4a2c");
    for (var pass = 0; pass < 3; pass++) {
      for (ii = i0; ii < i1; ii += CH) {
        var e2 = Math.min(i1, ii + CH + 1), age = clamp((tip - vine[ii].y) / (1.4 * H), 0, 1);
        var w = lerp(3.4 * K, 12.5 * K, Math.pow(age, 0.7)) * (tip - vine[ii].y < 0.02 * H ? 0.7 : 1);
        ctx.beginPath(); ctx.moveTo(vine[ii].x + (pass === 0 ? w * 0.35 : pass === 2 ? -w * 0.22 : 0), vine[ii].y);
        for (k = ii + 1; k <= e2; k++) ctx.lineTo(vine[k].x + (pass === 0 ? w * 0.35 : pass === 2 ? -w * 0.22 : 0), vine[k].y);
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        if (pass === 0) { ctx.strokeStyle = "rgba(0,10,5,.35)"; ctx.lineWidth = w * 1.1; }
        else if (pass === 1) { ctx.strokeStyle = rgb(mix(cYoung, cOld, Math.pow(age, 0.6))); ctx.lineWidth = w; }
        else { ctx.strokeStyle = "rgba(230,255,200," + (0.28 - age * 0.12) + ")"; ctx.lineWidth = w * 0.28; }
        ctx.stroke();
      }
    }
    /* bourgeon et vrille au bout */
    var tp = vine[tipI];
    if (tp && tip < Y0 + LEN - 2) {
      ctx.save(); ctx.translate(tp.x, tp.y); ctx.rotate(Math.sin(t * 1.6) * 0.15);
      var bg = ctx.createRadialGradient(-2 * K, 2 * K, 0, 0, 6 * K, 12 * K);
      bg.addColorStop(0, "#c9e88a"); bg.addColorStop(1, "#5f8f35");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(0, 6 * K, 5 * K, 11 * K, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = "#9cc45e"; ctx.lineWidth = 1.6 * K; ctx.beginPath(); ctx.moveTo(0, 10 * K);
      ctx.bezierCurveTo(14 * K, 22 * K, 22 * K, 6 * K, 12 * K, 2 * K); ctx.bezierCurveTo(6 * K, 0, 6 * K, 10 * K, 12 * K, 9 * K); ctx.stroke();
      ctx.restore();
    }

    /* grappes de baies */
    spikes.forEach(function (s, si) {
      if (s.y < yMin - H * 0.3 || s.y > yMax) return;
      var a = smooth(s.y + 0.04 * H, s.y + 0.26 * H, tip); if (a <= 0.001) return;
      var sw = Math.sin(t * 1.2 + s.ph) * 0.06 + Math.sin(t * 2.7 + s.ph) * 0.015;
      var ang = s.lean + sw, L = s.len * a;
      var dx = Math.sin(-ang), dy = Math.cos(ang);
      ctx.strokeStyle = "#6a8c3c"; ctx.lineWidth = 2 * K; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.quadraticCurveTo(s.x + s.side * 10 * K, s.y + 8 * K, s.x + dx * L, s.y + dy * L); ctx.stroke();
      var ord = s.b.map(function (b, q) { return q; }).sort(function (q1, q2) { return Math.sin(s.b[q1].a) - Math.sin(s.b[q2].a); });
      ord.forEach(function (q) {
        var b = s.b[q], f = q / s.n, ap = smooth(f * 0.65, f * 0.65 + 0.35, a); if (ap <= 0.01) return;
        var dpt = Math.sin(b.a), along = (0.06 + f * 0.94) * s.len * a;
        var rr = 6.8 * K * (1 - f * 0.25);
        var px = s.x + dx * along + Math.cos(b.a) * rr * (-dy) * 1, py = s.y + dy * along + Math.cos(b.a) * rr * dx;
        var cur = (si * 0.013) + b.v;
        var tt = ripe * 0.5 + dry * 0.5 + cur * (ripe > 0 && dry < 1 ? 1 : 0);
        tt = clamp(tt, 0, 1);
        var spr = (dpt < 0 ? S.bb : S.bf)[Math.round(tt * (STEPS - 1))];
        var sz = spr.r * (0.88 + 0.14 * dpt) * (1 - f * 0.3) * backOut(ap);
        ctx.drawImage(spr.c, px - sz - 2 * sz / spr.r, py - sz - 2 * sz / spr.r, (spr.r * 2 + 4) * sz / spr.r, (spr.r * 2 + 4) * sz / spr.r);
      });
    });

    nodes.forEach(function (n) { leaf(n, false); });

    /* premier plan flou */
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    near.forEach(function (f) {
      var y = f.y - cam * 1.45; if (y < -H * 0.8 || y > H * 1.4) return;
      var sp = S.near[f.k];
      ctx.save(); ctx.globalAlpha = 0.95 * (1 - rev);
      ctx.translate(f.x + st.mx * 26, y); ctx.rotate(f.r + Math.sin(t * 0.4 + f.ph) * 0.04); ctx.scale(f.s, f.s);
      ctx.drawImage(sp.c, -sp.ox, -sp.oy, sp.w, sp.h); ctx.restore();
    });
    /* poussières lumineuses */
    motes.forEach(function (m) {
      var y = ((m.y - t * m.sp - cam * 0.8) % H + H) % H, x = m.x + Math.sin(t * 0.6 + m.ph) * 14;
      ctx.globalAlpha = 0.25 + 0.35 * Math.sin(t * 1.3 + m.ph) * Math.sin(t * 1.3 + m.ph);
      ctx.drawImage(S.mote.c, x - m.s * 3, y - m.s * 3, m.s * 6, m.s * 6);
    });
    ctx.globalAlpha = 1;
  }

  /* ---------- Boucle ---------- */
  var running = false, raf = 0, dirty = true;
  function loop(now) { draw(now); if (running) raf = requestAnimationFrame(loop); }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }
  var rT;
  function resize() { clearTimeout(rT); rT = setTimeout(function () { build(); st.g = -1; draw(performance.now()); }, 120); }
  build(); draw(performance.now());
  window.addEventListener("resize", resize);
  if (reduce) {
    window.addEventListener("scroll", function () { requestAnimationFrame(function (n) { draw(n); }); }, { passive: true });
  } else if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) start(); else stop(); }); }, { rootMargin: "100px" }).observe(sec);
  } else start();
  window.addEventListener("pointermove", function (e) { st.tmx = (e.clientX / window.innerWidth - 0.5); st.tmy = (e.clientY / window.innerHeight - 0.5); }, { passive: true });
})();
