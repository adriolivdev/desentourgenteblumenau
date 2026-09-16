/* =========================================================
   Desentope Urgente — script único (raiz do projeto)
   FONTE ÚNICA do número para os widgets injetados (WhatsApp
   flutuante e barra mobile). Os CTAs do conteúdo já têm o
   link pronto no HTML, então funcionam mesmo sem JS.
   ========================================================= */
(function () {
  "use strict";

  var CONFIG = {
    waNumber: "5547996190909",   // WhatsApp (formato internacional)
    phoneDial: "+5547996190909"  // usado no tel:
  };

  var body = document.body;
  var waContext =
    body.getAttribute("data-wa-context") ||
    "Olá! Vim pelo site da Desentope Urgente e preciso de um desentupimento. Podem me atender?";

  function waHref(msg) {
    return "https://wa.me/" + CONFIG.waNumber + "?text=" + encodeURIComponent(msg || waContext);
  }
  function telHref() { return "tel:" + CONFIG.phoneDial; }

  var SVG = {
    wa: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.56 4.18 1.62 6L4 29l8.14-1.58a12 12 0 0 0 3.9.66h.01C22.7 28.08 28.1 22.68 28.1 16.04 28.1 8.4 22.7 3 16.04 3Zm0 21.9h-.01a10 10 0 0 1-5.09-1.4l-.36-.22-4.83.94.97-4.71-.24-.38a9.9 9.9 0 0 1-1.52-5.29C4.93 9.52 9.9 4.9 16.05 4.9c2.66 0 5.16 1.04 7.04 2.92a9.86 9.86 0 0 1 2.92 7.02c0 6.13-4.98 11.06-11.97 11.06Zm5.47-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .5 1 1V20c0 .6-.5 1-1 1C10.4 21 3 13.6 3 4c0-.6.5-1 1-1h3.6c.6 0 1 .5 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1.1l-2.3 2.2Z"/></svg>'
  };

  /* --- Widget flutuante do WhatsApp --- */
  var fab = document.createElement("a");
  fab.className = "fab-wa";
  fab.href = waHref();
  fab.target = "_blank";
  fab.rel = "noopener";
  fab.setAttribute("aria-label", "Chamar no WhatsApp");
  fab.setAttribute("data-track", "wa-fab");
  fab.innerHTML = '<span class="tip">Fale conosco agora</span>' + SVG.wa;
  body.appendChild(fab);

  /* --- Barra de ação no mobile: Ligar + WhatsApp (só mobile via CSS) --- */
  var bar = document.createElement("div");
  bar.className = "mobile-bar";
  bar.innerHTML =
    '<a class="m-call" href="' + telHref() + '" data-track="call-mobilebar" aria-label="Ligar agora">' + SVG.phone + "Ligar</a>" +
    '<a class="m-wa" href="' + waHref() + '" target="_blank" rel="noopener" data-track="wa-mobilebar" aria-label="WhatsApp">' + SVG.wa + "WhatsApp</a>";
  body.appendChild(bar);

  /* --- Slider de destaque --- */
  function initSlider(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll(".slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".slider-dot"));
    if (slides.length < 2) return;
    var i = slides.findIndex(function (s) { return s.classList.contains("is-active"); });
    if (i < 0) i = 0;
    var timer = null;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
    }
    function next() { show(i + 1); }
    function prev() { show(i - 1); }
    function play() { if (!reduce) timer = setInterval(next, 5500); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); play(); }

    var nx = root.querySelector("[data-next]"), pv = root.querySelector("[data-prev]");
    if (nx) nx.addEventListener("click", function () { next(); restart(); });
    if (pv) pv.addEventListener("click", function () { prev(); restart(); });
    dots.forEach(function (d) {
      d.addEventListener("click", function () { show(parseInt(d.getAttribute("data-go"), 10)); restart(); });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);

    var x0 = null;
    root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { (dx < 0 ? next() : prev()); restart(); }
      x0 = null;
    }, { passive: true });

    show(i); play();
  }
  document.querySelectorAll("[data-slider]").forEach(initSlider);

  /* --- Ano no rodapé --- */
  var y = document.getElementById("ano");
  if (y) y.textContent = new Date().getFullYear();
})();
