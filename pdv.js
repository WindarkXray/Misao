/* ======================================================================
   MISAO · Points de vente — carte animée, filtres et horaires en direct
   ====================================================================== */
(function () {
  "use strict";
  var list = document.getElementById("sv-list"), panel = document.getElementById("map");
  if (!list || !panel) return;
  var cards = [].slice.call(list.querySelectorAll(".sv"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* ---------- Horaires en direct (heure de Bruxelles) ---------- */
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  function nowBxl() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
      return { d: d, m: (+o.hour % 24) * 60 + +o.minute };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function hm(m) { var h = Math.floor(m / 60), mm = m % 60; return h + "h" + (mm < 10 ? "0" : "") + mm; }
  function status(hours) {
    var n = nowBxl(), today = hours[n.d] || [];
    for (var i = 0; i < today.length; i++) if (n.m >= today[i][0] && n.m < today[i][1]) return { open: true, txt: "Ouvert · jusqu'à " + hm(today[i][1]) };
    for (var k = 0; k < 8; k++) {
      var d = (n.d + k) % 7, sl = hours[d] || [];
      for (var j = 0; j < sl.length; j++) {
        if (k === 0 && sl[j][0] <= n.m) continue;
        var when = k === 0 ? "aujourd'hui" : k === 1 ? "demain" : JOURS[d];
        return { open: false, txt: "Fermé · ouvre " + when + " à " + hm(sl[j][0]) };
      }
    }
    return { open: false, txt: "Fermé" };
  }
  function paintStatus() {
    $$("[data-hours]").forEach(function (el) {
      var h; try { h = JSON.parse(el.getAttribute("data-hours")); } catch (e) { return; }
      var s = status(h), b = $(".sv-status", el) || $(".open-now", el);
      if (!b) return;
      b.hidden = false; b.textContent = s.txt; b.classList.toggle("open", s.open);
      var row = $$(".board-row", el); var n = nowBxl();
      row.forEach(function (r) { r.classList.toggle("today", (r.getAttribute("data-days") || "").split(",").indexOf(String(n.d)) > -1); });
    });
  }
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- Filtres par pays ---------- */
  var chips = $$(".pdv-chips button"), countEl = $("#sv-count"), filter = "all";
  function applyFilter(f, fly) {
    filter = f;
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-f") === f ? "true" : "false"); });
    var n = 0;
    cards.forEach(function (c) { var on = f === "all" || c.getAttribute("data-country") === f; c.hidden = !on; if (on) n++; });
    if (countEl) countEl.textContent = n + (n > 1 ? " adresses" : " adresse");
    pins.forEach(function (p) { p.el.classList.toggle("dim", f !== "all" && p.c !== f); });
    if (fly !== false) flyTo(VIEWS[f]);
    setActive(null);
    showReset(f !== "all");
  }
  chips.forEach(function (c) { c.addEventListener("click", function () { applyFilter(c.getAttribute("data-f")); }); });

  /* ---------- Carte ---------- */
  var cv = $("canvas", panel), ctx = cv.getContext("2d"), pinLayer = $(".pins", panel);
  function merc(lat) { return Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI; }
  function world(lon, lat) { return [lon, -merc(lat)]; }
  var VIEWS = {
    all: [-2, -9, 33, 53.5],
    be: [3.9, 50.45, 6.0, 51.05],
    fr: [1.7, 48.55, 3.7, 50.85],
    cd: [13.5, -6.5, 31, 0.8]
  };
  var KIVU = { lon: 28.86, lat: -2.5 }, KIN = { lon: 15.3, lat: -4.31 }, BXL = { lon: 4.352, lat: 50.844 };
  var COUNTRY = [{ t: "BELGIQUE", lon: 4.75, lat: 50.2, min: 40 }, { t: "FRANCE", lon: 2.6, lat: 47.0, min: 40 }, { t: "RD CONGO", lon: 22.5, lat: -3.2, min: 8 }, { t: "PAYS-BAS", lon: 5.6, lat: 52.3, min: 40 }, { t: "ALLEMAGNE", lon: 9.5, lat: 51.0, min: 40 }]

  var pins = cards.filter(function (c) { return c.getAttribute("data-lat"); }).map(function (c) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "pin" + (c.classList.contains("own") ? " own" : "");
    b.setAttribute("aria-label", "Voir " + c.getAttribute("data-name") + " dans la liste");
    b.innerHTML = '<span class="dot"></span><span class="lab">' + c.getAttribute("data-name") + "</span>";
    pinLayer.appendChild(b);
    var p = { el: b, card: c, id: c.getAttribute("data-id"), c: c.getAttribute("data-country"), lon: +c.getAttribute("data-lon"), lat: +c.getAttribute("data-lat") };
    b.addEventListener("click", function () { setActive(p.id, true); c.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }); });
    b.addEventListener("mouseenter", function () { hoverId = p.id; });
    b.addEventListener("mouseleave", function () { hoverId = null; });
    return p;
  });
  var byId = {}; pins.forEach(function (p) { byId[p.id] = p; });

  var W = 0, H = 0, DPR = 1, cam = { x: 0, y: 0, s: 1 }, from = null, to = null, t0 = 0, DUR = 1300;
  function fit(bb) {
    var a = world(bb[0], bb[1]), b = world(bb[2], bb[3]);
    var w = Math.abs(b[0] - a[0]), h = Math.abs(b[1] - a[1]);
    var s = Math.min(W * 0.78 / w, H * 0.78 / h);
    return { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, s: s };
  }
  function flyTo(bb, instant) {
    var target = fit(bb);
    if (instant || reduce) { cam = target; from = to = null; return; }
    from = { x: cam.x, y: cam.y, s: cam.s }; to = target; t0 = performance.now();
  }
  function focus(p) {
    var span = 0.024;
    flyTo([p.lon - span * 1.6, p.lat - span, p.lon + span * 1.6, p.lat + span]);
  }
  function scr(lon, lat) { var w = world(lon, lat); return [(w[0] - cam.x) * cam.s + W / 2, (w[1] - cam.y) * cam.s + H / 2]; }

  var activeId = null, hoverId = null;
  function setActive(id, fly) {
    activeId = id;
    cards.forEach(function (c) { c.classList.toggle("active", c.getAttribute("data-id") === id); });
    pins.forEach(function (p) { p.el.classList.toggle("on", p.id === id); });
    if (id && fly && byId[id]) focus(byId[id]);
    showReset(!!(id && fly));
  }
  function showReset(on) { var r = $(".map-reset", panel); if (r) r.hidden = !on; }
  cards.forEach(function (c) {
    var id = c.getAttribute("data-id");
    c.addEventListener("mouseenter", function () { hoverId = id; });
    c.addEventListener("mouseleave", function () { hoverId = null; });
    var mb = $(".sv-map", c);
    if (mb) mb.addEventListener("click", function () {
      setActive(id, true);
      if (window.innerWidth < 900) panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });
  var reset = $(".map-reset", panel);
  if (reset) reset.addEventListener("click", function () { if (activeId) { setActive(null); flyTo(VIEWS[filter]); showReset(filter !== "all"); } else applyFilter("all"); });

  function resize() {
    var r = panel.getBoundingClientRect(); W = r.width; H = r.height;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    flyTo(activeId && byId[activeId] ? [byId[activeId].lon - 0.038, byId[activeId].lat - 0.024, byId[activeId].lon + 0.038, byId[activeId].lat + 0.024] : VIEWS[filter], true);
  }

  function curve(a, b, bend) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    return [a, [mx - dy * bend, my + dx * bend], b];
  }
  function qpt(c, t) { var u = 1 - t; return [u * u * c[0][0] + 2 * u * t * c[1][0] + t * t * c[2][0], u * u * c[0][1] + 2 * u * t * c[1][1] + t * t * c[2][1]]; }

  function draw(now) {
    if (to) {
      var k = clamp((now - t0) / DUR, 0, 1), e = ease(k);
      var ls = lerp(Math.log(from.s), Math.log(to.s), e);
      var dip = Math.sin(k * Math.PI) * 0.35 * Math.abs(Math.log(to.s / from.s) > 0.3 ? 1 : 0);
      cam = { x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e), s: Math.exp(ls - dip) };
      if (k >= 1) { cam = to; to = null; }
    }
    var t = reduce ? 0 : now / 1000;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    /* ---- fond de carte géographique ---- */
    var GEO = window.MISAO_GEO;
    function trace(pts, close) {
      ctx.beginPath();
      for (var q = 0; q < pts.length; q++) { var s2 = scr(pts[q][0], pts[q][1]); if (q) ctx.lineTo(s2[0], s2[1]); else ctx.moveTo(s2[0], s2[1]); }
      if (close) ctx.closePath();
    }
    if (GEO) {
      /* terres */
      GEO.land.forEach(function (poly) { trace(poly, true); ctx.fillStyle = "#1f4a39"; ctx.fill(); });
      GEO.land.forEach(function (poly) { trace(poly, true); ctx.lineJoin = "round"; ctx.lineWidth = 5; ctx.strokeStyle = "rgba(120,190,150,.07)"; ctx.stroke(); ctx.lineWidth = 1.1; ctx.strokeStyle = "rgba(200,230,210,.35)"; ctx.stroke(); });
      /* pays des points de vente, légèrement éclairés */
      trace(GEO.drc, true); ctx.fillStyle = "rgba(240,194,90,.07)"; ctx.fill();
      trace(GEO.borders[0], true); ctx.fillStyle = "rgba(240,194,90,.10)"; ctx.fill();
      /* eaux intérieures */
      GEO.water.forEach(function (poly) { trace(poly, true); ctx.fillStyle = "#12302a"; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = "rgba(200,230,210,.3)"; ctx.stroke(); });
      /* fleuves */
      var rw = clamp(cam.s / 40, 0.8, 2.4);
      GEO.rivers.forEach(function (r) { trace(r, false); ctx.lineWidth = rw; ctx.lineCap = "round"; ctx.strokeStyle = "rgba(120,180,200,.45)"; ctx.stroke(); });
      /* frontières */
      ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.strokeStyle = "rgba(238,241,234,.32)";
      GEO.borders.forEach(function (bd) { trace(bd, false); ctx.stroke(); });
      trace(GEO.drc, true); ctx.stroke();
      ctx.setLineDash([]);
      /* plans de ville en vue rapprochée */
      [GEO.bxl, GEO.paris].forEach(function (cty) {
        if (cam.s < 900) return;
        var al = clamp((cam.s - 900) / 1200, 0, 1);
        ctx.globalAlpha = al;
        (cty.parks || []).forEach(function (pk) { trace(pk, true); ctx.fillStyle = "rgba(143,194,120,.22)"; ctx.fill(); });
        if (cty.canal) { trace(cty.canal, false); ctx.lineWidth = 3; ctx.strokeStyle = "rgba(120,180,200,.55)"; ctx.stroke(); }
        (cty.roads || []).forEach(function (rd) { trace(rd, false); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(238,241,234,.28)"; ctx.stroke(); });
        trace(cty.ring, true); ctx.lineWidth = 3.2; ctx.strokeStyle = "rgba(238,241,234,.42)"; ctx.stroke();
        ctx.font = "italic 13px Instrument Serif, Georgia, serif"; ctx.fillStyle = "rgba(238,241,234,.62)"; ctx.textAlign = "center";
        cty.labels.forEach(function (lb) { var p = scr(lb[1], lb[2]); ctx.fillText(lb[0], p[0], p[1]); });
        ctx.textAlign = "left"; ctx.globalAlpha = 1;
      });
      /* mers et lacs */
      ctx.font = "italic 14px Instrument Serif, Georgia, serif"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(170,215,195,.5)";
      GEO.seas.forEach(function (sea) {
        var lake = sea[0].indexOf("Lac") === 0;
        if (lake ? cam.s < 28 || cam.s > 400 : cam.s > 120) return;
        var p = scr(sea[1], sea[2]); ctx.fillText(sea[0], p[0], p[1]);
      });
      /* villes */
      if (cam.s < 1200) {
        ctx.textAlign = "left";
        GEO.cities.forEach(function (c) {
          var need = c[3] === 1 ? 5 : c[3] === 2 ? 34 : 110;
          if (cam.s < need) return;
          if (cam.s < 70 && c[1] > -1 && c[1] < 7.5 && c[2] > 47 && c[2] < 53) return;
          var p = scr(c[1], c[2]); if (p[0] < -40 || p[0] > W + 40 || p[1] < -20 || p[1] > H + 20) return;
          ctx.fillStyle = "rgba(238,241,234,.75)"; ctx.beginPath(); ctx.arc(p[0], p[1], 2.2, 0, 6.283); ctx.fill();
          ctx.font = (c[3] === 1 ? "600 11px" : "500 10.5px") + " Instrument Sans, sans-serif"; ctx.fillStyle = "rgba(238,241,234,.62)";
          ctx.fillText(c[0], p[0] + 6, p[1] + 4);
        });
      }
    }
    /* échelle */
    var latC = Math.atan(Math.sinh(-cam.y * Math.PI / 180)) * 180 / Math.PI, kmPx = 111.32 * Math.cos(latC * Math.PI / 180) / cam.s;
    var nice = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000], km = nice[0];
    for (var ni = 0; ni < nice.length; ni++) { km = nice[ni]; if (km / kmPx > 70) break; }
    var bw = km / kmPx, bx = W - bw - 18, by = H - 22;
    ctx.strokeStyle = "rgba(238,241,234,.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by - 5); ctx.lineTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by - 5); ctx.stroke();
    ctx.font = "600 10.5px Instrument Sans, sans-serif"; ctx.fillStyle = "rgba(238,241,234,.8)"; ctx.textAlign = "center";
    ctx.fillText((km < 1 ? Math.round(km * 1000) + " m" : km + " km"), bx + bw / 2, by - 8); ctx.textAlign = "left";

    /* noms de pays */
    ctx.font = "600 11px Instrument Sans, sans-serif"; ctx.textAlign = "center";
    COUNTRY.forEach(function (c) {
      if (cam.s < c.min * 0.5 || cam.s > 200) return;
      var p = scr(c.lon, c.lat); if (p[0] < -60 || p[0] > W + 60 || p[1] < -20 || p[1] > H + 20) return;
      ctx.fillStyle = "rgba(238,241,234,.3)"; ctx.save(); ctx.letterSpacing = "4px"; ctx.fillText(c.t, p[0], p[1]); ctx.restore();
    });
    ctx.textAlign = "left";

    /* la route du poivre : Kivu → Kinshasa → Bruxelles */
    var A = scr(KIVU.lon, KIVU.lat), B = scr(KIN.lon, KIN.lat), C = scr(BXL.lon, BXL.lat);
    var c1 = curve(A, B, 0.28), c2 = curve(B, C, -0.22);
    ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(240,194,90,.55)"; ctx.setLineDash([6, 7]); ctx.lineDashOffset = -t * 18;
    [c1, c2].forEach(function (c) { ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); ctx.quadraticCurveTo(c[1][0], c[1][1], c[2][0], c[2][1]); ctx.stroke(); });
    ctx.setLineDash([]);
    var tt = (t * 0.12) % 2, cc = tt < 1 ? c1 : c2, gp = qpt(cc, tt % 1);
    var gl = ctx.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], 14);
    gl.addColorStop(0, "rgba(255,226,150,.9)"); gl.addColorStop(1, "rgba(255,226,150,0)");
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(gp[0], gp[1], 14, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#2a1f1a"; ctx.beginPath(); ctx.arc(gp[0], gp[1], 3.6, 0, 6.283); ctx.fill();

    /* le Kivu, là où pousse le poivre */
    if (A[0] > -80 && A[0] < W + 80 && A[1] > -80 && A[1] < H + 80) {
      for (var r = 0; r < 3; r++) {
        var ph = ((t * 0.5 + r / 3) % 1);
        ctx.strokeStyle = "rgba(143,194,120," + (0.5 * (1 - ph)) + ")"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(A[0], A[1], 6 + ph * 34, 0, 6.283); ctx.stroke();
      }
      ctx.fillStyle = "#8fc278"; ctx.beginPath(); ctx.arc(A[0], A[1], 6, 0, 6.283); ctx.fill();
      var roomR = A[0] < W - 170, lx = roomR ? A[0] + 14 : clamp(A[0], 80, W - 80), ly = roomR ? A[1] : A[1] - 30;
      ctx.textAlign = roomR ? "left" : "center";
      ctx.font = "600 12px Instrument Sans, sans-serif"; ctx.fillStyle = "#eef1ea"; ctx.fillText("Kivu", lx, ly - 14);
      ctx.font = "italic 13px Instrument Serif, Georgia, serif"; ctx.fillStyle = "rgba(238,241,234,.7)"; ctx.fillText("ici pousse notre poivre", lx, ly + 2);
      ctx.textAlign = "left";
    }

    /* regroupements quand la carte est dézoomée */
    if (cam.s < 70) {
      ctx.font = "600 12px Instrument Sans, sans-serif";
      [{ t: "Belgique · 4 adresses", lon: 4.35, lat: 50.85, c: "be" }, { t: "France · 3 adresses", lon: 2.6, lat: 49.3, c: "fr" }, { t: "Kinshasa · 1 adresse", lon: 15.3, lat: -4.3, c: "cd" }].forEach(function (g) {
        if (filter !== "all" && filter !== g.c) return;
        var p = scr(g.lon, g.lat), w = ctx.measureText(g.t).width + 20;
        var x0 = g.c === "cd" ? p[0] - w / 2 : p[0] + 18, y0 = g.c === "be" ? p[1] - 26 : g.c === "fr" ? p[1] + 4 : p[1] + 16;
        x0 = clamp(x0, 8, W - w - 8);
        ctx.fillStyle = "rgba(244,243,238,.94)"; ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x0, y0, w, 24, 12); else ctx.rect(x0, y0, w, 24);
        ctx.fill(); ctx.fillStyle = "#16201b"; ctx.fillText(g.t, x0 + 10, y0 + 16);
      });
    }
    /* halos des points de vente */
    pins.forEach(function (p) {
      var s = scr(p.lon, p.lat), on = p.id === activeId || p.id === hoverId;
      p.el.style.transform = "translate(" + s[0] + "px," + s[1] + "px)";
      p.el.classList.toggle("hov", p.id === hoverId);
      p.el.classList.toggle("near", cam.s > 900);
      var lw = p.lw || (p.lw = p.el.querySelector(".lab").offsetWidth || 160);
      var fitR = s[0] + 16 + lw < W - 6, fitL = s[0] - 16 - lw > 6;
      p.el.classList.toggle("flip", !fitR && fitL);
      p.el.classList.toggle("above", !fitR && !fitL);
      if (on) {
        var ph2 = (t * 0.8) % 1;
        ctx.strokeStyle = "rgba(240,194,90," + (0.7 * (1 - ph2)) + ")"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s[0], s[1], 10 + ph2 * 26, 0, 6.283); ctx.stroke();
      }
    });
    requestAnimationFrame(draw);
  }

  resize(); window.addEventListener("resize", function () { resize(); });
  applyFilter("all", false);
  requestAnimationFrame(draw);
})();
