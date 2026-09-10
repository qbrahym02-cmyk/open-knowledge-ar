/* المعرفة المفتوحة — site interactivity */
(function () {
  "use strict";

  /* ---------- catalog: search + domain filter ---------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-domain]"));
  if (cards.length) {
    var search = document.querySelector(".search-wrap input");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".chips .chip"));
    var empty = document.querySelector(".empty");
    var q = "", dom = "all";

    function apply() {
      var visible = 0;
      cards.forEach(function (c) {
        var hay = (c.getAttribute("data-search") || "") + " " + c.textContent;
        var okDom = dom === "all" || c.getAttribute("data-domain") === dom;
        var okQ = !q || hay.indexOf(q) !== -1;
        var show = okDom && okQ;
        c.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (empty) empty.style.display = visible ? "none" : "block";
    }

    if (search) {
      search.addEventListener("input", function () { q = search.value.trim(); apply(); });
    }
    chips.forEach(function (ch) {
      ch.addEventListener("click", function () {
        chips.forEach(function (x) { x.classList.remove("active"); });
        ch.classList.add("active");
        dom = ch.getAttribute("data-domain") || "all";
        apply();
      });
    });
  }

  /* ---------- reader ---------- */
  var article = document.querySelector("article.book-text");
  if (!article) return;

  /* progress bar */
  var bar = document.querySelector(".progress-bar");
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0;
    if (bar) bar.style.width = pct.toFixed(1) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* font size */
  var root = document.documentElement;
  function getSize() { return parseInt(root.style.getPropertyValue("--reader-size") || "20", 10); }
  function setSize(px) {
    px = Math.max(16, Math.min(28, px));
    root.style.setProperty("--reader-size", px + "px");
    try { localStorage.setItem("ok-font", String(px)); } catch (e) {}
  }
  try { var saved = localStorage.getItem("ok-font"); if (saved) setSize(parseInt(saved, 10)); } catch (e) {}

  var dec = document.querySelector(".js-font-dec");
  var inc = document.querySelector(".js-font-inc");
  if (dec) dec.addEventListener("click", function () { setSize(getSize() - 1); });
  if (inc) inc.addEventListener("click", function () { setSize(getSize() + 1); });

  /* theme */
  var themes = ["light", "sepia", "night"];
  var themeBtn = document.querySelector(".js-theme");
  function applyTheme(t) {
    if (t === "light") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", t);
    try { localStorage.setItem("ok-theme", t); } catch (e) {}
  }
  try { var st = localStorage.getItem("ok-theme"); if (st && themes.indexOf(st) > 0) applyTheme(st); } catch (e) {}
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme") || "light";
      var next = themes[(themes.indexOf(cur) + 1) % themes.length];
      applyTheme(next);
      var lbl = { light: "فاتح", sepia: "ورقي", night: "ليلي" }[next];
      themeBtn.setAttribute("aria-label", "المظهر: " + lbl);
      themeBtn.textContent = themeBtn.getAttribute("data-icon") || "◐";
    });
  }

  /* TOC built from headings (desktop sidebar + mobile toggle) */
  var heads = Array.prototype.slice.call(article.querySelectorAll("h2, h3"));
  var count = 0;
  heads.forEach(function (h) {
    if (!h.id) h.id = "sec-" + (++count);
  });
  var items = heads.map(function (h) {
    var cls = h.tagName === "H3" ? "lvl3" : "lvl2";
    return '<li><a class="' + cls + '" href="#' + h.id + '">' + h.textContent + "</a></li>";
  });
  var html = items.length ? "<ul>" + items.join("") + "</ul>" : "";
  var side = document.querySelector(".toc-panel .toc-body");
  var mob = document.querySelector(".toc-toggle .toc-body");
  if (side) side.innerHTML = html;
  if (mob) mob.innerHTML = html;
  if (side && !items.length) document.querySelector(".toc-panel").style.display = "none";
})();
