/* ==========================================================================
   Logique du générateur — prénom-chien.com
   Utilisée à la fois par index.html et embed.html.
   Vanilla JS, aucune dépendance.
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.DOG_NAMES || { m: {}, f: {} };
  var THEMES = window.DOG_THEMES || [];
  var YEAR = window.DOG_YEAR || new Date().getFullYear();
  var YEAR_LETTER = window.DOG_YEAR_LETTER || "";

  // Lettres proposées (on exclut celles jamais utilisées pour les chiens LOF :
  // K, Q, W, X, Y, Z — mais on les garde disponibles si des prénoms existent).
  var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  var $ = function (id) { return document.getElementById(id); };

  // --- Références DOM (certaines absentes selon la page) --------------------
  var sexMale   = $("sex-male");
  var sexFemale = $("sex-female");
  var themeSel  = $("theme");
  var letterSel = $("letter");
  var genBtn    = $("generate");
  var result    = $("result");
  var actions   = $("actions");
  var againBtn  = $("again");
  var copyBtn   = $("copy");

  if (!genBtn || !result) return; // pas de générateur sur cette page

  var currentSex = null;
  var COUNT = 4; // nombre de prénoms proposés à chaque tirage

  // --- Remplissage du menu des thèmes -------------------------------------
  if (themeSel && themeSel.options.length <= 1) {
    THEMES.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t[0];
      o.textContent = t[1];
      themeSel.appendChild(o);
    });
  }

  // --- Remplissage du menu des lettres (B présélectionnée pour 2026) -------
  if (letterSel && letterSel.options.length <= 1) {
    ALPHABET.forEach(function (L) {
      var o = document.createElement("option");
      o.value = L;
      o.textContent = (L === YEAR_LETTER) ? L + "  (" + YEAR + ")" : L;
      if (L === YEAR_LETTER) o.selected = true;
      letterSel.appendChild(o);
    });
  }

  // --- Sélection du sexe ---------------------------------------------------
  function setSex(sex) {
    currentSex = sex;
    if (sexMale)   sexMale.setAttribute("aria-pressed", sex === "m");
    if (sexFemale) sexFemale.setAttribute("aria-pressed", sex === "f");
  }
  if (sexMale)   sexMale.addEventListener("click", function () { setSex("m"); });
  if (sexFemale) sexFemale.addEventListener("click", function () { setSex("f"); });

  // --- Construction de la liste de prénoms selon les critères --------------
  function buildPool() {
    var byTheme = DATA[currentSex] || {};
    var themeKey = themeSel ? themeSel.value : "";
    var letter = letterSel ? letterSel.value : "";

    var pool = [];
    var keys = themeKey ? [themeKey] : Object.keys(byTheme);
    keys.forEach(function (k) {
      (byTheme[k] || []).forEach(function (n) { pool.push(n); });
    });

    // dédoublonnage (certains prénoms figurent dans plusieurs thèmes)
    pool = pool.filter(function (n, i) { return pool.indexOf(n) === i; });

    if (letter) {
      pool = pool.filter(function (n) {
        return n.charAt(0).toUpperCase() === letter;
      });
    }
    return pool;
  }

  // --- Affichage -----------------------------------------------------------
  function showError(msg) {
    result.className = "result";
    result.innerHTML = '<p class="err">' + msg + "</p>";
    if (actions) actions.className = "actions";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // mélange aléatoire (Fisher-Yates), sans modifier le tableau d'origine
  function shuffle(a) {
    var arr = a.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function showNames(names) {
    var sexLabel = currentSex === "m" ? "Mâle" : "Femelle";
    var html = '<span class="sex-tag">' + sexLabel + '</span><ul class="names">';
    names.forEach(function (n) {
      var safe = escapeHtml(n);
      html +=
        '<li><button type="button" class="name-item" data-name="' + safe + '">' +
        "<span>" + safe + "</span>" +
        '<svg class="copy-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>' +
        "</button></li>";
    });
    html += '</ul><p class="copy-hint">Touche un prénom pour le copier</p>';
    result.className = "result filled";
    result.innerHTML = html;
    if (actions) actions.className = "actions show";
  }

  function generate() {
    if (!currentSex) {
      showError("Choisis d’abord un sexe.");
      return;
    }
    var pool = buildPool();
    if (!pool.length) {
      result.className = "result";
      result.innerHTML =
        '<p class="hint">Aucun prénom pour ces critères. Essaie une autre lettre ou un autre thème.</p>';
      if (actions) actions.className = "actions";
      return;
    }
    // on tire jusqu'à COUNT prénoms distincts au hasard
    var picks = shuffle(pool).slice(0, Math.min(COUNT, pool.length));
    showNames(picks);

    if (typeof gtag === "function") {
      gtag("event", "name_generation", {
        sex: currentSex,
        theme: themeSel ? themeSel.value || "all" : "all",
        letter: letterSel ? letterSel.value || "all" : "all"
      });
    }
  }

  genBtn.addEventListener("click", generate);
  if (againBtn) againBtn.addEventListener("click", generate);

  // --- Copier : clic sur l'un des prénoms proposés -------------------------
  function copyText(text, cb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(cb, function () { fallbackCopy(text, cb); });
    } else {
      fallbackCopy(text, cb);
    }
  }

  result.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest ? e.target.closest(".name-item") : null;
    if (!btn) return;
    var name = btn.getAttribute("data-name");
    if (name) copyText(name, function () { toast("« " + name + " » copié"); });
  });

  function fallbackCopy(text, cb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (e) {}
    document.body.removeChild(ta);
  }

  // --- Petit toast ----------------------------------------------------------
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove("show"); }, 1500);
  }

  // --- Bouton « Intégrer » (page d'accueil uniquement) ---------------------
  var embedToggle = $("embed-toggle");
  var embedBox = $("embed-box");
  var embedCode = $("embed-code");
  if (embedToggle && embedBox && embedCode) {
    var origin = window.location.origin && window.location.origin.indexOf("http") === 0
      ? window.location.origin
      : "https://prenom-chien.com";

    var ePrimary = $("embed-primary");
    var eBg      = $("embed-bg");
    var eText    = $("embed-text");
    var ePreview = $("embed-preview");
    var eReset   = $("embed-reset");

    var DEFAULTS = { primary: "#f97316", bg: "#ffffff", text: "#3f3f46" };

    function buildEmbedUrl() {
      var url = origin + "/embed.html";
      var params = [];
      if (ePrimary && ePrimary.value.toLowerCase() !== DEFAULTS.primary)
        params.push("primary=" + encodeURIComponent(ePrimary.value.replace("#", "")));
      if (eBg && eBg.value.toLowerCase() !== DEFAULTS.bg)
        params.push("bg=" + encodeURIComponent(eBg.value.replace("#", "")));
      if (eText && eText.value.toLowerCase() !== DEFAULTS.text)
        params.push("text=" + encodeURIComponent(eText.value.replace("#", "")));
      if (params.length) url += "?" + params.join("&");
      return url;
    }

    function updateEmbed() {
      var url = buildEmbedUrl();
      embedCode.value =
        '<iframe src="' + url + '" width="100%" height="640" ' +
        'style="border:0;max-width:400px" loading="lazy" ' +
        'title="Générateur de prénoms de chien"></iframe>';
      if (ePreview) ePreview.src = url;
    }

    embedToggle.addEventListener("click", function () {
      var wasHidden = !embedBox.classList.contains("show");
      embedBox.classList.toggle("show");
      if (wasHidden) updateEmbed();
    });
    embedCode.addEventListener("focus", function () { this.select(); });

    var inputs = [ePrimary, eBg, eText];
    inputs.forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", updateEmbed);
      el.addEventListener("change", updateEmbed);
    });

    if (eReset) {
      eReset.addEventListener("click", function () {
        if (ePrimary) ePrimary.value = DEFAULTS.primary;
        if (eBg) eBg.value = DEFAULTS.bg;
        if (eText) eText.value = DEFAULTS.text;
        updateEmbed();
      });
    }
  }
})();
