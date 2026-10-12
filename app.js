(function () {
  "use strict";
  var M = window.MISAO;
  var P = M.produits;
  var byId = {}; P.forEach(function (p) { byId[p.id] = p; });

  /* ---------- Clé Web3Forms pour le formulaire de contact ---------- */
  var WEB3FORMS_KEY = "VOTRE_CLE_WEB3FORMS";

  var euro = new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" });
  function fmt(n) { return euro.format(n); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function minPrix(p) { return Math.min.apply(null, p.variantes.map(function (v) { return v.prix; })); }
  function multi(p) { return p.variantes.length > 1; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Sachet dessiné (remplacé par la photo si img est renseigné) ---------- */
  var VAR_COL = { "Noir": "#2a2320", "Blanc": "#e6dbc2", "Rouge": "#8e2a1f", "Roux": "#8e2a1f" };
  function seeded(seed) { var s = 0; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function c(x) { return Math.max(0, Math.min(255, Math.round(f < 0 ? x * (1 + f) : x + (255 - x) * f))); }
    return "rgb(" + c(r) + "," + c(g) + "," + c(b) + ")";
  }
  var UID = 0;
  function pouch(p, col) {
    col = col || p.couleur; var u = p.id + "-" + (++UID);
    if (p.type === "atelier" || p.type === "cadeau") return ticket(p);
    var rnd = seeded(p.id + col), grains = "";
    for (var i = 0; i < 46; i++) {
      var x = 62 + rnd() * 76, y = 150 + rnd() * 40, r = 4.2 + rnd() * 2.6;
      grains += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + shade(col, (rnd() - 0.5) * 0.5) + '"/>' +
        '<circle cx="' + (x - r * 0.35).toFixed(1) + '" cy="' + (y - r * 0.35).toFixed(1) + '" r="' + (r * 0.3).toFixed(1) + '" fill="rgba(255,255,255,.22)"/>';
    }
    var cat = p.cat === "melanges" ? "#e3a82b" : p.cat === "monde" ? "#b4361f" : "#173326";
    var nm = p.nom.replace(/^(Poivre sauvage|Poivre blanc|Poivre noir|Poivre|Mélange d'épices|Mélange de poivres|Mélange|Mix|Thé épicé)\s*(de |du |d'|des |pour )?/i, "");
    nm = nm.charAt(0).toUpperCase() + nm.slice(1);
    var fs = nm.length <= 9 ? 14 : nm.length <= 13 ? 11.5 : 9.5;
    if (nm.length > 17) nm = nm.slice(0, 16) + "…";
    var o = p.origine || "", sub = /RD Congo/.test(o) ? "RD CONGO" : o ? o.split("·")[0].trim().toUpperCase() : "ÉPICES FINES";
    return '<svg class="pouch" viewBox="0 0 200 240" role="img" aria-label="' + esc(p.nom) + '">' +
      '<defs><linearGradient id="k' + u + '" x1="0" x2="1"><stop offset="0" stop-color="#b8925f"/><stop offset=".45" stop-color="#d4b183"/><stop offset="1" stop-color="#a98251"/></linearGradient>' +
      '<clipPath id="w' + u + '"><rect x="62" y="142" width="76" height="52" rx="26"/></clipPath></defs>' +
      '<ellipse cx="100" cy="226" rx="66" ry="7" fill="rgba(22,32,27,.16)"/>' +
      '<path d="M44 34 L156 34 L162 214 Q100 224 38 214 Z" fill="url(#k' + u + ')"/>' +
      '<path d="M44 34 L156 34 L157 48 L43 48 Z" fill="rgba(0,0,0,.12)"/>' +
      '<path d="M50 34 v14 M62 34 v14 M74 34 v14 M86 34 v14 M98 34 v14 M110 34 v14 M122 34 v14 M134 34 v14 M146 34 v14" stroke="rgba(0,0,0,.12)" stroke-width="1"/>' +
      '<rect x="56" y="64" width="88" height="66" fill="#f8f6f0"/>' +
      '<rect x="56" y="64" width="88" height="14" fill="' + cat + '"/>' +
      '<text x="100" y="74.5" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="8" letter-spacing="2.4" fill="#f8f6f0">MISAO</text>' +
      '<text x="100" y="99" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="' + fs + '" fill="#16201b">' + esc(nm) + '</text>' +
      '<text x="100" y="117" text-anchor="middle" font-family="Instrument Sans, sans-serif" font-size="6.6" letter-spacing="1.4" fill="#5d6660">' + esc(sub) + '</text>' +
      '<rect x="62" y="142" width="76" height="52" rx="26" fill="rgba(255,255,255,.35)"/>' +
      '<g clip-path="url(#w' + u + ')">' + grains + '</g>' +
      '<rect x="62" y="142" width="76" height="52" rx="26" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/>' +
      '<path d="M54 54 Q60 120 52 206" stroke="rgba(255,255,255,.18)" stroke-width="6" fill="none"/>' +
      '</svg>';
  }
  function ticket(p) {
    var u = p.id + "-" + (++UID), k = p.art || "cadeau";
    var o = '<svg class="pouch art" viewBox="0 0 200 240" role="img" aria-label="' + esc(p.nom) + '"><ellipse cx="100" cy="216" rx="64" ry="7" fill="rgba(22,32,27,.14)"/>';
    function grain(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"/><circle cx="' + (x - r * .35) + '" cy="' + (y - r * .35) + '" r="' + (r * .3) + '" fill="rgba(255,255,255,.3)"/>'; }
    if (k === "monde") {
      o += '<defs><radialGradient id="g' + u + '" cx=".35" cy=".3"><stop offset="0" stop-color="#2f6a52"/><stop offset="1" stop-color="#132a20"/></radialGradient><clipPath id="c' + u + '"><circle cx="100" cy="122" r="62"/></clipPath></defs>' +
        '<circle cx="100" cy="122" r="62" fill="url(#g' + u + ')"/>' +
        '<g clip-path="url(#c' + u + ')" fill="none" stroke="rgba(238,241,234,.2)" stroke-width="1"><ellipse cx="100" cy="122" rx="24" ry="62"/><ellipse cx="100" cy="122" rx="48" ry="62"/><path d="M38 102h124M38 122h124M38 142h124M44 82h112M44 162h112"/></g>' +
        '<path d="M86 96c8-4 18 0 20 8s-2 14 2 22-4 18-10 16-8-12-12-18-10-10-8-18 4-8 8-10z" fill="rgba(227,168,43,.55)"/>' +
        '<ellipse cx="100" cy="122" rx="92" ry="24" fill="none" stroke="#e3a82b" stroke-width="1.6" stroke-dasharray="2 5" transform="rotate(-14 100 122)"/>' +
        grain(14, 140, 8, "#231c19") + grain(178, 96, 7, "#8e2a1f") + grain(158, 152, 6, "#e6dbc2") + grain(42, 98, 5.5, "#6b3f24") +
        '<circle cx="96" cy="112" r="4" fill="#f8f6f0"/><circle cx="96" cy="112" r="7" fill="none" stroke="#f8f6f0" stroke-opacity=".5"/>';
    } else if (k === "cardamome") {
      var pod = function (x, y, rot, s) {
        return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + s + ')"><path d="M-40 0C-24-22 24-22 40 0 24 22-24 22-40 0z" fill="url(#p' + u + ')"/>' +
          '<path d="M-34 0C-18-8 18-8 34 0M-34 0C-18 8 18 8 34 0" fill="none" stroke="rgba(30,50,20,.35)" stroke-width="1.2"/><path d="M40 0l9-3" stroke="#6f8a45" stroke-width="2.4" stroke-linecap="round"/></g>';
      };
      o += '<defs><linearGradient id="p' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b4c97a"/><stop offset="1" stop-color="#5d7a3a"/></linearGradient></defs>' +
        pod(84, 92, -24, 1) + pod(122, 128, 18, 1.08) + pod(78, 158, -8, .92) +
        grain(130, 186, 4, "#2a2320") + grain(140, 192, 3.6, "#2a2320") + grain(122, 194, 3.4, "#3a2e28") + grain(148, 182, 3.2, "#2a2320") + grain(134, 200, 3, "#3a2e28");
    } else if (k === "infusion") {
      o += '<path d="M76 70c-8-10 8-16 0-28M100 64c-8-10 8-16 0-28M124 70c-8-10 8-16 0-28" fill="none" stroke="rgba(22,32,27,.32)" stroke-width="2.4" stroke-linecap="round"/>' +
        '<ellipse cx="100" cy="186" rx="74" ry="14" fill="#f8f6f0" stroke="rgba(22,32,27,.15)"/><ellipse cx="100" cy="183" rx="44" ry="6" fill="rgba(22,32,27,.08)"/>' +
        '<path d="M148 112c22 0 22 34-2 34" fill="none" stroke="#8b1e3f" stroke-width="7"/>' +
        '<path d="M50 96h100c0 54-18 84-50 84s-50-30-50-84z" fill="#8b1e3f"/><path d="M56 104c2 30 10 52 24 64" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="100" cy="96" rx="50" ry="10" fill="#a8452c"/><ellipse cx="100" cy="96" rx="50" ry="10" fill="none" stroke="#6e1631" stroke-width="2"/>' +
        '<g transform="translate(36 196) rotate(-12)"><rect x="-26" y="-5" width="52" height="10" rx="5" fill="#8a4a22"/><path d="M-22 0h44" stroke="rgba(0,0,0,.2)"/></g>' +
        '<g transform="translate(168 200)" fill="#5b3420"><path d="M0-12L3-3 12 0 3 3 0 12-3 3-12 0-3-3z"/><path d="M0-12L3-3 12 0 3 3 0 12-3 3-12 0-3-3z" transform="rotate(45)"/><circle r="3" fill="#8a5a36"/></g>';
    } else if (k === "melange") {
      o += '<g transform="rotate(28 128 70)"><rect x="118" y="20" width="20" height="104" rx="10" fill="#cfd3ca"/><rect x="118" y="20" width="8" height="104" rx="4" fill="rgba(255,255,255,.35)"/></g>' +
        '<path d="M42 112h116c-2 52-26 76-58 76s-56-24-58-76z" fill="#7d837b"/><path d="M50 122c4 30 16 50 34 58" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="6" stroke-linecap="round"/>' +
        '<ellipse cx="100" cy="112" rx="58" ry="12" fill="#a3a8a0"/><ellipse cx="100" cy="114" rx="48" ry="8" fill="#3a2e28"/>' +
        '<circle cx="84" cy="113" r="4" fill="#e3a82b"/><circle cx="104" cy="111" r="3.5" fill="#b4361f"/><circle cx="116" cy="115" r="3" fill="#e6dbc2"/><circle cx="94" cy="116" r="3" fill="#8a4a22"/>' +
        '<path d="M22 212c0-14 10-22 20-22s20 8 20 22z" fill="#e3a82b"/><path d="M80 214c0-12 9-19 18-19s18 7 18 19z" fill="#b4361f"/><path d="M136 212c0-14 10-22 20-22s20 8 20 22z" fill="#2a2320"/>';
    } else if (k === "vin") {
      o += '<path d="M30 214V100c0-14 8-22 8-36V40h20v24c0 14 8 22 8 36v114z" fill="#3b1a22"/><rect x="38" y="120" width="28" height="36" fill="#efe0e3" opacity=".85"/><text x="52" y="142" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="9" fill="#3b1a22">Vin</text>' +
        '<path d="M92 56h64c4 58-10 84-32 88-22-4-36-30-32-88z" fill="rgba(255,255,255,.6)" stroke="rgba(22,32,27,.25)"/>' +
        '<path d="M95 96h58c-2 30-12 44-29 48-17-4-27-18-29-48z" fill="#7a1a2e"/><ellipse cx="124" cy="96" rx="29" ry="4" fill="#9a2a40"/>' +
        '<rect x="122.5" y="144" width="3" height="50" fill="rgba(22,32,27,.35)"/><ellipse cx="124" cy="196" rx="24" ry="5" fill="rgba(255,255,255,.7)" stroke="rgba(22,32,27,.25)"/>' +
        grain(160, 206, 5, "#231c19") + grain(172, 200, 4.4, "#8e2a1f") + grain(150, 210, 4, "#231c19") + grain(178, 210, 3.8, "#3a2e28");
    } else if (k === "cadeau") {
      o += '<rect x="48" y="112" width="104" height="92" rx="4" fill="#173326"/><rect x="42" y="94" width="116" height="26" rx="4" fill="#21473a"/>' +
        '<rect x="94" y="94" width="12" height="110" fill="#e3a82b"/><rect x="42" y="102" width="116" height="9" fill="#e3a82b" opacity=".0"/>' +
        '<path d="M100 94c-20-30-48-22-36-6 6 8 24 8 36 6zM100 94c20-30 48-22 36-6-6 8-24 8-36 6z" fill="#e3a82b"/><circle cx="100" cy="92" r="6" fill="#c58b16"/>' +
        '<path d="M150 120l20 24" stroke="#16201b" stroke-width="1.2"/><g transform="rotate(14 172 160)"><rect x="156" y="140" width="34" height="44" rx="4" fill="#f8f6f0"/><circle cx="173" cy="148" r="2.5" fill="#16201b"/><text x="173" y="168" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="6" letter-spacing="1.2" fill="#16201b">MISAO</text></g>';
    } else {
      o += '<g transform="rotate(-8 100 130)"><rect x="26" y="74" width="148" height="100" rx="8" fill="#e3a82b"/><rect x="34" y="82" width="132" height="84" rx="4" fill="none" stroke="rgba(22,32,27,.35)" stroke-dasharray="3 4"/>' +
        '<text x="100" y="108" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="9" letter-spacing="3" fill="#16201b">MISAO</text>' +
        '<text x="100" y="134" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="20" fill="#16201b">Bon cadeau</text>' +
        '<text x="100" y="153" text-anchor="middle" font-family="Instrument Sans, sans-serif" font-size="6.6" letter-spacing="1.6" fill="rgba(22,32,27,.7)">LA MAISON DES POIVRES</text></g>' +
        '<g transform="translate(160 70) rotate(12)"><circle r="22" fill="#173326"/><circle r="17" fill="none" stroke="#e3a82b" stroke-dasharray="2 3"/>' + grain(0, 0, 7, "#2a2320").replace(/cx="0"/g, 'cx="0"') + '</g>';
    }
    return o + "</svg>";
  }
  /* photos produits : un fichier par produit (et par variété pour les poivres sauvages) */
  var SHOTS = ["poivre-kivu", "poivre-equateur", "cannelle-congo", "citronnelle-congo", "curry-vadouvan", "melange-raclette", "melange-chai",
    "the-delicatesse", "melange-berbere", "vin-chaud-hibiscus", "poivre-penja", "voatsiperifery", "kampot-blanc", "baies-passion",
    "poivre-long-java", "sarawak-noir", "sao-tome"];
  function slug(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function shotFile(p, variety) {
    if (p.shot) return "img/produits/" + p.shot + ".jpg";
    if (SHOTS.indexOf(p.id) < 0) return "";
    var v = p.options && p.options["Variété"] ? (variety || p.options["Variété"][0]) : "";
    return "img/produits/" + p.id + (v ? "-" + slug(v) : "") + ".jpg";
  }
  function media(p, col, variety, tall) {
    if (p.photo) return '<img class="photo" src="' + esc(p.photo) + '" data-alt="' + esc(p.photoUrl || "") + '" data-fb="' + p.id + '" alt="' + esc(p.nom) + '" loading="lazy">';
    var f = !p.img && shotFile(p, variety);
    if (f) return '<img class="photo prod" src="' + f + '" data-fb="' + p.id + '" alt="' + esc(p.nom) + '" loading="lazy" decoding="async" width="960" height="1200">';
    return p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.nom) + '" loading="lazy">' : pouch(p, col);
  }
  function piments(n) {
    if (n == null) return "";
    var s = '<span class="heat" aria-label="Piquant ' + n + ' sur 5">';
    for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? "on" : "") + '"></i>';
    return s + "</span>";
  }

  function badge(p) { return p.badge ? '<span class="pbadge' + (p.nouveau ? " new" : "") + '">' + (p.nouveau ? '<i class="nb-dot" aria-hidden="true"></i>' : "") + esc(p.badge) + "</span>" : ""; }

  /* ---------- Cartes produit ---------- */
  function card(p) {
    var add = p.epuise ? '<button class="quick" disabled>Épuisé</button>'
      : p.type === "atelier" ? '<button class="quick" data-open="' + p.id + '">Découvrir</button>'
      : p.precommande === true ? '<button class="quick pre" data-open="' + p.id + '">Précommander</button>'
      : multi(p) ? '<button class="quick" data-open="' + p.id + '">Choisir</button>'
      : '<button class="quick" data-add="' + p.id + '">Ajouter</button>';
    return '<article class="pcard' + (p.epuise ? " out" : "") + (p.nouveau ? " is-new" : "") + '" style="--tint:' + p.teinte + '">' +
      '<button class="pmedia" data-open="' + p.id + '" aria-label="Voir ' + esc(p.nom) + '">' + media(p) +
      badge(p) +
      (p.epuise ? '<span class="pbadge sold">Épuisé</span>' : "") + "</button>" +
      '<div class="pinfo">' +
      '<p class="porig">' + esc(p.origine || (p.type === "atelier" ? "Atelier · " + (p.duree || "Bruxelles") : p.type === "cadeau" ? "Bon cadeau" : "Mélange maison")) + "</p>" +
      '<h3 class="pname"><button data-open="' + p.id + '">' + esc(p.nom) + "</button></h3>" +
      '<p class="pshort">' + esc(p.court) + "</p>" +
      '<div class="prow"><span class="pprice">' + (multi(p) && p.variantes.some(function (v) { return v.prix !== p.variantes[0].prix; }) ? '<small>dès</small> ' : "") + fmt(minPrix(p)) + (p.format ? ' <small>· ' + p.format + "</small>" : "") + "</span>" + add + "</div>" +
      "</div></article>";
  }

  function renderGrids() {
    $$("[data-grid]").forEach(function (el) {
      var k = el.getAttribute("data-grid"), list;
      if (k === "vedettes") list = P.filter(function (p) { return p.vedette; });
      else if (k === "ateliers") list = P.filter(function (p) { return p.type === "atelier"; });
      else if (k === "cadeaux") list = P.filter(function (p) { return p.type === "cadeau"; });
      else if (M.categories.some(function (c) { return c.id === k; })) list = P.filter(function (p) { return p.cat === k && !p.epuise; });
      else return;
      el.innerHTML = list.map(card).join("");
    });
  }

  /* ---------- Boutique : une page par catégorie, avec tri et recherche ---------- */
  function boutique() {
    var grid = $("#shop-grid"); if (!grid) return;
    var cat = grid.getAttribute("data-cat") || "tous";
    var state = { sort: "reco", q: "" };
    function base() { return P.filter(function (p) { return cat === "nouveautes" ? p.nouveau || p.precommande === true : cat === "tous" ? p.type !== "atelier" && p.type !== "cadeau" : p.cat === cat; }); }
    function draw() {
      var list = base();
      if (state.q) { var q = state.q.toLowerCase(); list = list.filter(function (p) { return (p.nom + " " + (p.origine || "") + " " + (p.notes || []).join(" ") + " " + p.court).toLowerCase().indexOf(q) > -1; }); }
      list = list.slice();
      if (state.sort === "prix-asc") list.sort(function (a, b) { return minPrix(a) - minPrix(b); });
      if (state.sort === "prix-desc") list.sort(function (a, b) { return minPrix(b) - minPrix(a); });
      if (state.sort === "nom") list.sort(function (a, b) { return a.nom.localeCompare(b.nom, "fr"); });
      if (state.sort === "reco") list.sort(function (a, b) { return (b.nouveau ? 1 : 0) - (a.nouveau ? 1 : 0); });
      list.sort(function (a, b) { return (a.epuise ? 1 : 0) - (b.epuise ? 1 : 0); });
      grid.innerHTML = list.length ? list.map(card).join("") : '<p class="empty">Aucun produit ne correspond à « ' + esc(state.q) + ' » ici. <a class="link" href="boutique.html">Chercher dans toute la boutique</a></p>';
      $("#shop-count").textContent = list.length + (list.length > 1 ? " produits" : " produit");
    }
    $("#shop-sort").addEventListener("change", function () { state.sort = this.value; draw(); });
    $("#shop-search").addEventListener("input", function () { state.q = this.value.trim(); draw(); });
    try { var pq = sessionStorage.getItem("misao-q"); if (pq) { sessionStorage.removeItem("misao-q"); state.q = pq; $("#shop-search").value = pq; } } catch (e) {}
    draw();
  }

  /* ---------- Panier ---------- */
  var KEY = "misao-panier", cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { cart = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function lineKey(id, o) { return id + "|" + o.join("|"); }
  function variant(p, o) { return p.variantes.filter(function (v) { return v.o.join("|") === o.join("|"); })[0]; }
  function isPre(p, o) {
    if (!p.precommande) return false;
    if (p.precommande === true) return true;
    var names = Object.keys(p.options);
    return names.some(function (n, i) { return p.precommande[n] && p.precommande[n].indexOf(o[i]) > -1; });
  }
  function add(id, o, qty) {
    var p = byId[id]; o = o || p.variantes[0].o; qty = qty || 1;
    var k = lineKey(id, o), line = cart.filter(function (l) { return l.k === k; })[0];
    if (line) line.q += qty; else cart.push({ k: k, id: id, o: o, q: qty });
    save(); drawCart(); bump();
    toast(p.nom + (o.length ? " · " + o.join(", ") : ""));
  }
  function count() { return cart.reduce(function (s, l) { return s + l.q; }, 0); }
  function total() { return cart.reduce(function (s, l) { var p = byId[l.id], v = p && variant(p, l.o); return s + (v ? v.prix * l.q : 0); }, 0); }
  function bump() { $$(".cart-count").forEach(function (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }); }
  function drawCart() {
    cart = cart.filter(function (l) { return byId[l.id] && variant(byId[l.id], l.o); });
    var n = count();
    $$(".cart-count").forEach(function (b) { b.textContent = n; b.hidden = n === 0; });
    cartPage();
  }
  function lineHTML(l) {
    var p = byId[l.id], v = variant(p, l.o);
    return '<article class="pl" style="--tint:' + p.teinte + '">' +
      '<button class="pl-media" data-open="' + p.id + '" aria-label="Voir ' + esc(p.nom) + '">' + media(p, l.o[0] && VAR_COL[l.o[0]], l.o[0]) + "</button>" +
      '<div class="pl-meta"><p class="porig">' + esc(p.origine || (p.type === "atelier" ? "Atelier · La Maison des Poivres" : p.type === "cadeau" ? "Bon cadeau" : "Mélange maison")) + "</p>" +
      '<h3><button data-open="' + p.id + '">' + esc(p.nom) + "</button></h3>" +
      (l.o.length ? '<p class="co">' + esc(l.o.join(" · ")) + "</p>" : "") +
      (isPre(p, l.o) ? '<p class="cpre">Précommande · expédié après la récolte</p>' : "") +
      '<p class="pl-unit">' + fmt(v.prix) + (p.type === "atelier" ? " par personne" : " l'unité") + "</p></div>" +
      '<div class="pl-qty"><div class="stepper"><button data-dec="' + esc(l.k) + '" aria-label="Retirer un">−</button><span>' + l.q + '</span><button data-inc="' + esc(l.k) + '" aria-label="Ajouter un">+</button></div>' +
      '<button class="crm" data-rm="' + esc(l.k) + '">Retirer</button></div>' +
      '<p class="pl-total">' + fmt(v.prix * l.q) + "</p></article>";
  }
  function cartPage() {
    var root = $("#cart-page"); if (!root) return;
    var lines = $("#cp-lines"), sum = $("#cp-summary"), sug = $("#cp-suggest"), head = $("#cp-count");
    var n = count();
    if (head) head.textContent = n ? n + (n > 1 ? " articles" : " article") : "";
    root.classList.toggle("empty", !cart.length);
    if (!cart.length) {
      lines.innerHTML = '<div class="cp-empty"><p class="t">Votre panier est vide</p><p>Commencez par notre poivre sauvage du Kivu, cueilli à la main.</p><div class="hero-cta"><a class="btn" href="boutique.html">Voir la boutique' + ARROW + '</a><button class="btn ghost" data-open="poivre-kivu">Découvrir le Kivu</button></div></div>';
    } else {
      lines.innerHTML = cart.map(lineHTML).join("");
    }
    var tot = total();
    $("#cp-sub").textContent = fmt(tot);
    $("#cp-total").textContent = fmt(tot);
    sum.hidden = !cart.length;
    var co = $("#checkout"); if (co) { co.disabled = false; co.innerHTML = '<span class="co-lock">' + LOCK + "</span>Commander via Shopify"; }
    var pn = $("#cp-pre"); if (pn) pn.hidden = !hasPre();
    var inCart = {}; cart.forEach(function (l) { inCart[l.id] = 1; });
    var picks = P.filter(function (p) { return !inCart[p.id] && !p.epuise && p.type !== "atelier"; });
    picks.sort(function (a, b) { return (b.vedette ? 1 : 0) - (a.vedette ? 1 : 0); });
    sug.innerHTML = picks.slice(0, 4).map(card).join("");
  }
  function shopifyReady() {
    var store = M.SHOPIFY_STORE || "";
    return store && store.indexOf("VOTRE") !== 0 && cart.length && !cart.some(function (l) { return !variant(byId[l.id], l.o).vid; });
  }
  function hasPre() { return cart.some(function (l) { return isPre(byId[l.id], l.o); }); }
  function checkout() {
    var msg = $("#cart-msg");
    if (!cart.length) return;
    if (shopifyReady()) {
      var items = cart.map(function (l) { return variant(byId[l.id], l.o).vid + ":" + l.q; }).join(",");
      var code = ($("#cp-code") && $("#cp-code").value || "").trim();
      var co = $("#checkout"); if (co) { co.disabled = true; co.innerHTML = "Ouverture du paiement Shopify…"; }
      window.location.href = "https://" + M.SHOPIFY_STORE + "/cart/" + items + (code ? "?discount=" + encodeURIComponent(code) : "");
      return;
    }
    /* aperçu : la boutique Shopify n'est pas encore reliée (SHOPIFY_STORE + vid dans catalogue.js) */
    if (msg) { msg.hidden = false; msg.className = "form-status info"; msg.textContent = "Aperçu : ce bouton ouvrira le paiement Shopify dès que la boutique sera reliée."; }
  }

  function cartUI() {
    var html =
      '<div class="scrim" id="scrim" hidden></div>' +
      '<div class="modal" id="pmodal" role="dialog" aria-modal="true" aria-labelledby="pm-name" hidden><div class="mbox" id="pm-box"></div></div>' +
      '<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>';
    document.body.insertAdjacentHTML("beforeend", html);
    var co = $("#checkout"); if (co) co.addEventListener("click", checkout);
    $("#scrim").addEventListener("click", closeAll);
  }
  var lastFocus = null;
  function openCart() { window.location.href = "panier.html"; }

  /* ---------- Fiche produit (fenêtre) ---------- */
  var cur = null;
  function openModal(id) {
    var p = byId[id]; if (!p) return;
    lastFocus = document.activeElement;
    var names = Object.keys(p.options);
    cur = { p: p, o: p.variantes.filter(function (v) { return true; })[0].o.slice(), q: 1 };
    var opts = names.map(function (n, i) {
      return '<fieldset class="opt"><legend>' + esc(n) + ' <span data-optval="' + i + '"></span></legend><div class="pills">' +
        p.options[n].map(function (v) {
          var sw = n === "Variété" ? '<i class="sw" style="background:' + (VAR_COL[v] || "#999") + '"></i>' : "";
          return '<button type="button" class="pill" data-oi="' + i + '" data-ov="' + esc(v) + '">' + sw + esc(v) + "</button>";
        }).join("") + "</div></fieldset>";
    }).join("");
    var info = "", isAt = p.type === "atelier", isGift = p.type === "cadeau";
    if (isAt && p.programme) info += '<div class="pm-block wide"><p class="lbl">Au programme</p><ul class="prog">' + p.programme.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>";
    var facts = isAt ? '<dl class="at-facts"><div><dt>Durée</dt><dd>' + esc(p.duree || "—") + '</dd></div><div><dt>Groupe</dt><dd>' + esc(p.groupe || "—") + '</dd></div><div><dt>Lieu</dt><dd>La Maison des Poivres</dd></div><div><dt>Dates</dt><dd>' + (p.options.Date ? p.options.Date.length + (p.options.Date.length > 1 ? " dates" : " date") + " au choix" : p.options["Créneau"] ? "Mer. soir ou sam. matin" : "Sur demande") + '</dd></div></dl>' : "";
    var reass = (isAt || isGift)
      ? "<li>" + PIN + "La Maison des Poivres, Place de la Vieille Halle aux Blés 46</li><li>" + LOCK + "Paiement sécurisé Shopify</li><li>" + CAL + "Prochaines dates auprès de Sandrine : +32 478 11 45 69</li>"
      : "<li>" + LEAF + "Cueilli et trié à la main</li><li>" + LOCK + "Paiement sécurisé Shopify</li><li>" + PIN + "Boutique à Bruxelles, près de la Grand-Place</li>";
    if (p.notes) info += '<div class="pm-block"><p class="lbl">Notes</p><div class="tags">' + p.notes.map(function (n) { return "<span>" + esc(n) + "</span>"; }).join("") + "</div></div>";
    if (p.piquant != null) info += '<div class="pm-block"><p class="lbl">Piquant</p>' + piments(p.piquant) + "</div>";
    if (p.accords) info += '<div class="pm-block wide"><p class="lbl">Accords</p><p class="acc">' + p.accords.map(esc).join(" · ") + "</p></div>";
    $("#pm-box").innerHTML =
      '<button class="x" data-close aria-label="Fermer">' + X + "</button>" +
      '<div class="pm-media" id="pm-media" style="--tint:' + p.teinte + '">' + media(p, null, null, true) + badge(p) + "</div>" +
      '<div class="pm-info">' +
      '<p class="porig">' + esc(p.origine || (p.type === "atelier" ? "Atelier · La Maison des Poivres" : p.type === "cadeau" ? "Bon cadeau" : "Mélange maison MISAO")) + "</p>" +
      '<h2 id="pm-name">' + esc(p.nom) + "</h2>" +
      '<p class="pm-price" id="pm-price"></p>' +
      '<p class="pm-desc">' + esc(p.description) + "</p>" + facts + opts +
      '<p class="pre-note" id="pm-pre" hidden>Variété rare : en précommande, expédiée dès la fin de la récolte.</p>' +
      '<div class="pm-buy"><div class="stepper"><button type="button" id="pm-dec" aria-label="Moins">−</button><span id="pm-q">1</span><button type="button" id="pm-inc" aria-label="Plus">+</button></div>' +
      (p.epuise ? '<button class="btn wide" disabled>Épuisé</button>' : '<button class="btn wide" id="pm-add">Ajouter au panier</button>') + "</div>" +
      (isAt ? '<a class="btn ghost wide" href="contact.html">Demander les prochaines dates</a>' : "") +
      (info ? '<div class="pm-grid">' + info + "</div>" : "") +
      '<ul class="reassure">' + reass + "</ul>" +
      "</div>";
    sync();
    $("#pmodal").hidden = false; $("#scrim").hidden = false; document.body.classList.add("locked");
    requestAnimationFrame(function () { $("#pmodal").classList.add("open"); });
    setTimeout(function () { var x = $("#pm-box .x"); if (x) x.focus(); }, 60);
    try { history.replaceState(null, "", "#p-" + id); } catch (e) {}
  }
  function sync() {
    var p = cur.p, v = variant(p, cur.o);
    $$(".pill", $("#pm-box")).forEach(function (b) {
      var on = cur.o[+b.getAttribute("data-oi")] === b.getAttribute("data-ov");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $$("[data-optval]", $("#pm-box")).forEach(function (s) { s.textContent = "· " + cur.o[+s.getAttribute("data-optval")]; });
    $("#pm-price").innerHTML = fmt(v.prix * cur.q) + (cur.q > 1 ? ' <small>(' + fmt(v.prix) + (p.type === "atelier" ? " par personne" : " pièce") + ")</small>" : (p.type === "atelier" ? " <small>par personne</small>" : "")) + (p.format ? " <small>· " + p.format + "</small>" : "");
    $("#pm-q").textContent = cur.q;
    $("#pm-pre").hidden = !isPre(p, cur.o);
    var add = $("#pm-add"); if (add) add.textContent = isPre(p, cur.o) ? "Précommander" : p.type === "atelier" ? (cur.q > 1 ? "Réserver " + cur.q + " places" : "Réserver ma place") : p.type === "cadeau" ? "Offrir ce bon" : "Ajouter au panier";
    if (p.options["Variété"]) $("#pm-media").innerHTML = media(p, VAR_COL[cur.o[0]], cur.o[0], true) + badge(p);
  }
  function closeModal() {
    var m = $("#pmodal"); if (!m || m.hidden) return;
    m.classList.remove("open"); m.hidden = true;
    $("#scrim").hidden = true; document.body.classList.remove("locked");
    try { if (location.hash.indexOf("#p-") === 0) history.replaceState(null, "", location.pathname); } catch (e) {}
    if (lastFocus) lastFocus.focus();
  }
  function closeAll() { closeModal(); }

  var toastT;
  function toast(t) {
    var el = $("#toast");
    el.innerHTML = CHECK + '<span><strong>Ajouté au panier</strong><br>' + esc(t) + '</span><a href="panier.html">Voir le panier</a>';
    el.hidden = false; el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("show"); setTimeout(function () { el.hidden = true; }, 300); }, 2800);
  }

  /* ---------- Clics globaux ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-open],[data-add],[data-cart],[data-close],[data-inc],[data-dec],[data-rm],.pill,#pm-inc,#pm-dec,#pm-add");
    if (!t) return;
    if (t.hasAttribute("data-open")) { e.preventDefault(); openModal(t.getAttribute("data-open")); }
    else if (t.hasAttribute("data-add")) add(t.getAttribute("data-add"));
    else if (t.hasAttribute("data-cart")) { e.preventDefault(); openCart(); }
    else if (t.hasAttribute("data-close")) closeAll();
    else if (t.classList.contains("pill")) { cur.o[+t.getAttribute("data-oi")] = t.getAttribute("data-ov"); sync(); }
    else if (t.id === "pm-inc") { cur.q = Math.min(99, cur.q + 1); sync(); }
    else if (t.id === "pm-dec") { cur.q = Math.max(1, cur.q - 1); sync(); }
    else if (t.id === "pm-add") { add(cur.p.id, cur.o.slice(), cur.q); closeModal(); }
    else {
      var k = t.getAttribute("data-inc") || t.getAttribute("data-dec") || t.getAttribute("data-rm");
      cart = cart.map(function (l) {
        if (l.k !== k) return l;
        if (t.hasAttribute("data-inc")) l.q++;
        else if (t.hasAttribute("data-dec")) l.q--;
        else l.q = 0;
        return l;
      }).filter(function (l) { return l.q > 0; });
      save(); drawCart();
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeAll(); closeNav(); } });

  /* ---------- Menu mobile plein écran ---------- */
  var burger = $("#burger"), nav = $("#nav");
  function closeNav() { if (!nav) return; nav.classList.remove("open"); document.body.classList.remove("nav-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Ouvrir le menu"); }
  if (burger) {
    burger.addEventListener("click", function () {
      var o = nav.classList.toggle("open");
      document.body.classList.toggle("nav-open", o);
      burger.setAttribute("aria-expanded", o ? "true" : "false");
      burger.setAttribute("aria-label", o ? "Fermer le menu" : "Ouvrir le menu");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", closeNav); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1020) closeNav(); });
  }
  var hdr = $(".site-header");
  window.addEventListener("scroll", function () { if (hdr) hdr.classList.toggle("scrolled", window.scrollY > 8); }, { passive: true });

  /* ---------- Visuel d'accueil : grains de poivre ---------- */
  function hero() {
    var cv = $("#peppers"); if (!cv) return;
    var ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1), W, H, grains = [];
    var cols = [["#231c19", "#3a2e28"], ["#231c19", "#3a2e28"], ["#231c19", "#4a3a30"], ["#8e2a1f", "#b4452f"], ["#e6dbc2", "#f6efdf"], ["#6b3f24", "#8a5a36"]];
    var rnd = seeded("kivu");
    function build() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grains = []; rnd = seeded("kivu");
      var n = Math.round(W * H / 2300);
      for (var i = 0; i < n; i++) {
        var c = cols[Math.floor(rnd() * cols.length)];
        grains.push({ x: rnd() * W, y: rnd() * H, r: 5 + rnd() * 9, c: c, ph: rnd() * 6.28, d: 0.3 + rnd() * 0.9 });
      }
      grains.sort(function (a, b) { return a.r - b.r; });
    }
    var mx = 0, my = 0, t0 = performance.now();
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var k = (t - t0) / 1000;
      grains.forEach(function (g) {
        var ox = still ? 0 : Math.sin(k * 0.6 + g.ph) * 2 * g.d + mx * g.d * 10;
        var oy = still ? 0 : Math.cos(k * 0.5 + g.ph) * 2 * g.d + my * g.d * 10;
        var x = g.x + ox, y = g.y + oy;
        var gr = ctx.createRadialGradient(x - g.r * 0.35, y - g.r * 0.4, g.r * 0.1, x, y, g.r);
        gr.addColorStop(0, g.c[1]); gr.addColorStop(1, g.c[0]);
        ctx.beginPath(); ctx.arc(x, y, g.r, 0, 6.2832); ctx.fillStyle = gr; ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,.18)"; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(x + g.r * 0.1, y + g.r * 0.05, g.r * 0.55, 0.4 + g.ph, 1.9 + g.ph); ctx.stroke();
        ctx.beginPath(); ctx.arc(x - g.r * 0.32, y - g.r * 0.36, g.r * 0.22, 0, 6.2832); ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fill();
      });
      if (!still) requestAnimationFrame(draw);
    }
    build(); requestAnimationFrame(draw);
    window.addEventListener("resize", build);
    cv.parentNode.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; });
  }

  /* ---------- Formulaire de contact (Web3Forms) ---------- */
  function contactForm() {
    var f = $("#form-contact"); if (!f) return;
    var st = $(".form-status", f), btn = $("button[type=submit]", f);
    function show(m, ok) { st.hidden = false; st.className = "form-status " + (ok ? "ok" : "err"); st.textContent = m; }
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { show("Merci de remplir votre nom, un e-mail valide et votre message.", false); var b = $(":invalid", f); if (b) b.focus(); return; }
      if (WEB3FORMS_KEY.indexOf("VOTRE") === 0) { show("Le formulaire n'est pas encore relié à une boîte mail. Écrivez à sandrine@misao.be.", false); return; }
      var d = Object.fromEntries(new FormData(f).entries()); d.access_key = WEB3FORMS_KEY;
      var lab = btn.textContent; btn.disabled = true; btn.textContent = "Envoi…";
      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { return r.json(); })
        .then(function (r) { if (r && r.success) { show("Merci, votre message est envoyé. Sandrine vous répond rapidement.", true); f.reset(); } else show("L'envoi n'a pas abouti. Réessayez ou écrivez à sandrine@misao.be.", false); })
        .catch(function () { show("Connexion impossible. Réessayez ou écrivez à sandrine@misao.be.", false); })
        .finally(function () { btn.disabled = false; btn.textContent = lab; });
    });
  }

  /* ---------- Icônes ---------- */
  var X = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var CLOCK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var I_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var LEAF = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19l7-7"/></svg>';
  var PIN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>';
  var CAL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>';

  /* ---------- Photos : fichier local → photo d'origine → illustration ---------- */
  window.addEventListener("error", function (e) {
    var t = e.target; if (!t || t.tagName !== "IMG" || !t.hasAttribute("data-fb")) return;
    var alt = t.getAttribute("data-alt");
    if (alt && t.getAttribute("src") !== alt && !t.hasAttribute("data-tried")) { t.setAttribute("data-tried", "1"); t.src = alt; return; }
    var p = byId[t.getAttribute("data-fb")]; if (!p) return;
    var w = document.createElement("span"); w.innerHTML = pouch(p); t.replaceWith(w.firstChild);
  }, true);

  /* ---------- Logo dans l'onglet ---------- */
  (function () {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#173326"/><path d="M33 13c6-4 13-3 16 1-5 4-11 5-16-1z" fill="#8fc278"/><circle cx="31" cy="36" r="17" fill="#e3a82b"/><circle cx="31" cy="36" r="17" fill="url(#g)"/><path d="M19 32c5-3 8 3 13 0s8-3 12 1M18 40c5-3 9 3 14 0s8-2 12 1" stroke="#7a4f12" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".55"/><circle cx="25" cy="29" r="4" fill="#fff" opacity=".45"/><defs><radialGradient id="g" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#5a3a08" stop-opacity=".45"/></radialGradient></defs></svg>';
    var href = "data:image/svg+xml," + encodeURIComponent(svg);
    var l = document.querySelector('link[rel="icon"]');
    if (!l) { l = document.createElement("link"); l.rel = "icon"; l.type = "image/svg+xml"; document.head.appendChild(l); }
    l.href = href;
  })();

  /* ---------- Recherche dans le header ---------- */
  function norm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function searchList(q) {
    var words = norm(q).split(/\s+/).filter(Boolean); if (!words.length) return [];
    return P.map(function (p) {
      var cat = (M.categories.filter(function (c) { return c.id === p.cat; })[0] || {}).nom || "";
      var hay = norm([p.nom, p.origine, p.court, (p.notes || []).join(" "), (p.accords || []).join(" "), cat, p.type === "atelier" ? "atelier masterclass" : "", p.type === "cadeau" ? "bon cadeau" : ""].join(" "));
      var score = 0, nm = norm(p.nom);
      for (var i = 0; i < words.length; i++) { if (hay.indexOf(words[i]) < 0) return null; score += nm.indexOf(words[i]) > -1 ? 3 : 1; if (nm.indexOf(words[i]) === 0) score += 2; }
      return { p: p, s: score - (p.epuise ? 2 : 0) };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).map(function (r) { return r.p; });
  }
  function varFor(p, q) {
    var vs = p.options && p.options["Variété"]; if (!vs) return null;
    var w = norm(q);
    for (var i = 0; i < vs.length; i++) if (w.indexOf(norm(vs[i])) > -1) return vs[i];
    return null;
  }
  function hl(text, q) {
    var words = norm(q).split(/\s+/).filter(Boolean), chars = Array.from(String(text));
    var nt = chars.map(function (c) { return norm(c); });
    if (!words.length || nt.some(function (c) { return c.length !== 1; })) return esc(text);
    nt = nt.join(""); var on = chars.map(function () { return false; });
    words.forEach(function (w) { var i = nt.indexOf(w); while (i > -1) { for (var k = i; k < i + w.length; k++) on[k] = true; i = nt.indexOf(w, i + w.length); } });
    var out = "", open = false;
    chars.forEach(function (c, i) { if (on[i] && !open) { out += "<mark>"; open = true; } if (!on[i] && open) { out += "</mark>"; open = false; } out += esc(c); });
    return out + (open ? "</mark>" : "");
  }
  function catOf(p) { return p.type === "atelier" ? "Atelier" : p.type === "cadeau" ? "Bon cadeau" : ((M.categories.filter(function (c) { return c.id === p.cat; })[0] || {}).court || ""); }
  function priceTxt(p) { var mn = minPrix(p), many = p.variantes.some(function (v) { return v.prix !== mn; }); return (many ? "dès " : "") + fmt(mn); }
  var SEARCH_ICO = { trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>' };
  function headerSearch() {
    var openB = $("#hs-open"), box = $("#hsearch"), inp = $("#hs-input"), res = $("#hs-results"), clr = $("#hs-clear"); if (!openB || !box) return;
    var scrim = document.createElement("div"); scrim.className = "hs-scrim"; scrim.hidden = true; document.body.appendChild(scrim);
    var sel = -1, items = [];
    var SUG = ["Poivre du Kivu", "Poivre blanc", "Cannelle", "Curry", "Chaï", "Masterclass", "Bon cadeau"];
    var BROWSE = [
      { h: "nouveautes.html", t: "Nouveautés", s: "Précommande", c: "c-nouveautes" },
      { h: "epices-misao.html", t: "Épices MISAO", s: "RD Congo", c: "c-misao" },
      { h: "melanges.html", t: "Mélanges", s: "Faits maison", c: "c-melanges" },
      { h: "poivres-du-monde.html", t: "Poivres du monde", s: "Grands crus", c: "c-monde" },
      { h: "masterclass.html", t: "Masterclass", s: "À Bruxelles", c: "c-ateliers" }
    ];
    function row(p, i, q) {
      var tags = (p.precommande === true ? '<span class="hs-tag pre">Précommande</span>' : p.nouveau ? '<span class="hs-tag pre">Nouveau</span>' : "") + (p.epuise ? '<span class="hs-tag out">Épuisé</span>' : "");
      return '<button type="button" class="hs-item' + (i === sel ? " on" : "") + '" role="option" id="hs-o' + i + '" aria-selected="' + (i === sel) + '" data-hs="' + p.id + '" style="--tint:' + p.teinte + '">' +
        '<span class="hs-thumb">' + media(p, null, q ? varFor(p, q) : null) + "</span>" +
        '<span class="hs-txt"><b>' + (q ? hl(p.nom, q) : esc(p.nom)) + "</b>" +
        '<small>' + (tags || '<span class="hs-cat">' + esc(catOf(p)) + "</span>") + '<span class="hs-or">' + esc(p.origine || p.court || "") + "</span></small></span>" +
        '<span class="hs-price">' + priceTxt(p) + '<i class="hs-go" aria-hidden="true">' + ARROW + "</i></span></button>";
    }
    function render() {
      var q = inp.value.trim(); clr.hidden = !q;
      if (!q) {
        var news = P.filter(function (p) { return p.nouveau; }); items = news; sel = -1;
        inp.setAttribute("aria-expanded", "false"); inp.removeAttribute("aria-activedescendant");
        res.innerHTML = '<div class="hs-home">' +
          '<div class="hs-col"><p class="hs-lbl">Recherches populaires</p><div class="hs-sugs">' + SUG.map(function (t) { return '<button type="button" class="hs-sug" data-q="' + esc(t) + '">' + SEARCH_ICO.trend + esc(t) + "</button>"; }).join("") + "</div>" +
          '<p class="hs-lbl">Parcourir</p><div class="hs-browse">' + BROWSE.map(function (b) { return '<a href="' + b.h + '" class="hs-cat-link"><span class="cdot ' + b.c + '" aria-hidden="true"></span><span><b>' + b.t + "</b><small>" + b.s + "</small></span></a>"; }).join("") + "</div></div>" +
          (news.length ? '<div class="hs-col hs-new"><p class="hs-lbl"><span class="live-dot" aria-hidden="true"></span>Nouveau · en précommande</p><div class="hs-list">' + news.map(function (p, i) { return row(p, i, ""); }).join("") + '</div><a class="hs-all" href="nouveautes.html">Toutes les nouveautés' + ARROW + "</a></div>" : "") +
          "</div>";
        return;
      }
      var list = searchList(q); items = list.slice(0, 7); sel = items.length ? 0 : -1;
      inp.setAttribute("aria-expanded", items.length ? "true" : "false");
      if (sel > -1) inp.setAttribute("aria-activedescendant", "hs-o0"); else inp.removeAttribute("aria-activedescendant");
      var nq = norm(q), cats = BROWSE.filter(function (b) { return norm(b.t + " " + b.s).indexOf(nq) > -1; });
      if (!list.length && !cats.length) {
        res.innerHTML = '<div class="hs-none"><span class="hs-none-ico">' + I_SEARCH + '</span><p class="t">Rien trouvé pour « ' + esc(q) + ' »</p><p>Vérifiez l\'orthographe ou essayez :</p><div class="hs-sugs">' + ["Poivre", "Cannelle", "Mélange", "Atelier"].map(function (t) { return '<button type="button" class="hs-sug" data-q="' + t + '">' + t + "</button>"; }).join("") + "</div></div>";
        return;
      }
      res.innerHTML = (cats.length ? '<div class="hs-catrow">' + cats.map(function (b) { return '<a href="' + b.h + '" class="hs-chip"><span class="cdot ' + b.c + '" aria-hidden="true"></span><span>' + hl(b.t, q) + "</span></a>"; }).join("") + "</div>" : "") +
        (list.length ? '<div class="hs-rhead"><p class="hs-lbl">' + list.length + (list.length > 1 ? " produits" : " produit") + '</p><a class="hs-all sm" href="boutique.html" data-all="1">Tout voir dans la boutique' + ARROW + "</a></div>" +
        '<div class="hs-list">' + items.map(function (p, i) { return row(p, i, q); }).join("") + "</div>" : "");
    }
    function mark() {
      $$(".hs-item", res).forEach(function (b, i) { b.classList.toggle("on", i === sel); b.setAttribute("aria-selected", i === sel); });
      var cur = $("#hs-o" + sel); if (cur) { inp.setAttribute("aria-activedescendant", cur.id); cur.scrollIntoView({ block: "nearest" }); }
    }
    function open() {
      box.hidden = false; scrim.hidden = false;
      requestAnimationFrame(function () { box.classList.add("open"); scrim.classList.add("open"); });
      openB.setAttribute("aria-expanded", "true"); render(); setTimeout(function () { inp.focus(); }, 40); document.body.classList.add("hs-on");
    }
    function close() {
      box.classList.remove("open"); scrim.classList.remove("open"); openB.setAttribute("aria-expanded", "false"); document.body.classList.remove("hs-on");
      setTimeout(function () { box.hidden = true; scrim.hidden = true; }, 220);
    }
    function goAll() { try { sessionStorage.setItem("misao-q", inp.value.trim()); } catch (e) {} if ($("#shop-search") && $("#shop-grid").getAttribute("data-cat") === "tous") { $("#shop-search").value = inp.value.trim(); $("#shop-search").dispatchEvent(new Event("input")); close(); window.scrollTo({ top: $("#shop-grid").getBoundingClientRect().top + scrollY - 260, behavior: "smooth" }); } else location.href = "boutique.html"; }
    openB.addEventListener("click", function () { box.hidden ? open() : close(); });
    $("#hs-close").addEventListener("click", close);
    scrim.addEventListener("click", close);
    clr.addEventListener("click", function () { inp.value = ""; render(); inp.focus(); });
    inp.addEventListener("input", render);
    inp.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" && items.length) { sel = (sel + 1) % items.length; mark(); e.preventDefault(); }
      else if (e.key === "ArrowUp" && items.length) { sel = (sel - 1 + items.length) % items.length; mark(); e.preventDefault(); }
      else if (e.key === "Enter") { e.preventDefault(); if (sel > -1 && items[sel]) { close(); openModal(items[sel].id); } else if (inp.value.trim()) goAll(); }
      else if (e.key === "Escape") { e.stopPropagation(); close(); openB.focus(); }
    });
    res.addEventListener("click", function (e) {
      var sg = e.target.closest("[data-q]"); if (sg) { inp.value = sg.getAttribute("data-q"); render(); inp.focus(); return; }
      var it = e.target.closest("[data-hs]"); if (it) { e.preventDefault(); close(); openModal(it.getAttribute("data-hs")); return; }
      var al = e.target.closest("[data-all]"); if (al) { e.preventDefault(); goAll(); }
    });
    document.addEventListener("keydown", function (e) {
      var t = e.target, typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (box.hidden && !typing && (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) { e.preventDefault(); open(); }
    });
  }

  /* ---------- Nouveautés en précommande (accueil) ---------- */
  function preorderShow() {
    $$("[data-preorder]").forEach(function (el) {
      el.innerHTML = P.filter(function (p) { return p.nouveau; }).map(function (p) {
        return '<article class="pre-card" style="--tint:' + p.teinte + ';--accent:' + p.couleur + '">' +
          '<button class="pre-media" data-open="' + p.id + '" aria-label="Voir ' + esc(p.nom) + '">' + media(p) + '<span class="pbadge new"><i class="nb-dot" aria-hidden="true"></i>Nouveau</span></button>' +
          '<div class="pre-body"><p class="pre-orig">' + esc(p.origine) + '</p><h3><button data-open="' + p.id + '">' + esc(p.nom) + "</button></h3>" +
          '<p class="pre-txt">' + esc(p.court) + "</p>" +
          '<div class="pre-foot"><span class="pre-price"><small>dès</small> ' + fmt(minPrix(p)) + '</span><button class="btn gold" data-open="' + p.id + '">Précommander' + ARROW + "</button></div>" +
          '<p class="pre-ship">' + CLOCK + "Expédié dès la fin de la récolte</p></div></article>";
      }).join("");
    });
  }

  /* ---------- Démarrage ---------- */
  renderGrids(); boutique(); cartUI(); drawCart(); hero(); contactForm(); headerSearch(); preorderShow();
  $$("[data-spotlight]").forEach(function (el) { var p = byId[el.getAttribute("data-spotlight")]; if (p) el.innerHTML = media(p); });
  if (location.hash.indexOf("#p-") === 0) { var pid = location.hash.slice(3); if (byId[pid]) setTimeout(function () { openModal(pid); }, 150); }
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
