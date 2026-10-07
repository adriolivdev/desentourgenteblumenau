/* =========================================================
   Desentope Urgente — TAGUEAMENTO (arquivo único, todas as páginas)
   1) Coloque os IDs reais em CONFIG abaixo. ID vazio/placeholder = não carrega.
   2) Tudo vai para window.dataLayer (padrão GTM/GA4). Mesmo sem GTM, os
      eventos ficam no dataLayer e GA4/Pixel/Ads diretos também disparam.
   Eventos enviados:
     page_context        -> ao carregar (page_type, cidade, regiao)
     click_whatsapp      -> qualquer link wa.me (posicao, servico, cidade)
     click_telefone      -> qualquer link tel:
     generate_lead       -> junto de WhatsApp/telefone (conversão principal)
     click_cidade        -> clique para página de cidade/região
     faq_open            -> abertura de pergunta do FAQ
     scroll_depth        -> 25 / 50 / 75 / 90 %
   Posição = valor do atributo data-track do elemento (ex.: wa-hero, call-header).
   ========================================================= */
(function () {
  "use strict";
  var CONFIG = {
    GTM_ID: "GTM-XXXXXXX",      // ex.: GTM-ABC1234 (recomendado: configure GA4/Ads/Pixel dentro do GTM)
    GA4_ID: "",                  // ex.: G-XXXXXXXXXX  (use SÓ se não for configurar GA4 no GTM)
    GADS_ID: "",                 // ex.: AW-1234567890 (Google Ads)
    GADS_LEAD_LABEL: "",         // ex.: AW-1234567890/AbCdEfGhIjK (rótulo da conversão de lead)
    META_PIXEL_ID: ""            // ex.: 123456789012345
  };
  var ok = function (v, ph) { return v && v !== ph; };
  var w = window, d = document;
  w.dataLayer = w.dataLayer || [];
  function push(o) { w.dataLayer.push(o); }
  function gtag() { w.dataLayer.push(arguments); }

  /* --- contexto da página --- */
  var path = location.pathname.replace(/\/+$/, "");
  var slug = path.indexOf("/desentupimento-em-") === 0 ? path.split("desentupimento-em-")[1] : "";
  var REG = { "santa-catarina": 1, "vale-do-itajai": 1, "litoral-de-santa-catarina": 1 };
  var pageType = !slug ? (path === "" ? "home" : "outra") : (REG[slug] ? "regiao" : "cidade");
  var cidade = d.body && d.body.getAttribute("data-page-label") || slug.replace(/-/g, " ");
  push({ event: "page_context", page_type: pageType, cidade: slug ? cidade : "", slug: slug });

  /* --- GTM --- */
  if (ok(CONFIG.GTM_ID, "GTM-XXXXXXX") && CONFIG.GTM_ID.indexOf("GTM-") === 0) {
    push({ "gtm.start": Date.now(), event: "gtm.js" });
    var s = d.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + CONFIG.GTM_ID;
    d.head.appendChild(s);
  }
  /* --- GA4 / Google Ads diretos (opcional) --- */
  var gId = ok(CONFIG.GA4_ID, "") ? CONFIG.GA4_ID : (ok(CONFIG.GADS_ID, "") ? CONFIG.GADS_ID : "");
  if (gId) {
    var g = d.createElement("script"); g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + gId; d.head.appendChild(g);
    gtag("js", new Date());
    if (CONFIG.GA4_ID) gtag("config", CONFIG.GA4_ID, { page_title: d.title });
    if (CONFIG.GADS_ID) gtag("config", CONFIG.GADS_ID);
  }
  /* --- Meta Pixel (opcional) --- */
  if (CONFIG.META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(w, d, "script", "https://connect.facebook.net/en_US/fbevents.js");
    w.fbq("init", CONFIG.META_PIXEL_ID); w.fbq("track", "PageView");
  }

  function lead(kind, pos, servico) {
    var p = { method: kind, posicao: pos, servico: servico || "", cidade: cidade, page_type: pageType };
    push({ event: "generate_lead", lead_method: kind, posicao: pos, servico: p.servico, cidade: cidade, page_type: pageType });
    if (CONFIG.GA4_ID) gtag("event", "generate_lead", p);
    if (ok(CONFIG.GADS_LEAD_LABEL, "")) gtag("event", "conversion", { send_to: CONFIG.GADS_LEAD_LABEL });
    if (w.fbq) w.fbq("track", "Lead", { content_category: kind });
  }

  /* --- cliques (delegação: pega links injetados por main.js também) --- */
  d.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var href = a.getAttribute("href") || "", pos = a.getAttribute("data-track") || "sem-posicao";
    if (href.indexOf("wa.me/") > -1) {
      var m = pos.match(/^wa-(?:servico|mini)-(.+)$/);
      push({ event: "click_whatsapp", posicao: pos, servico: m ? m[1] : "", cidade: cidade, page_type: pageType, link_url: href });
      if (CONFIG.GA4_ID) gtag("event", "click_whatsapp", { posicao: pos, cidade: cidade });
      lead("whatsapp", pos, m ? m[1] : "");
    } else if (href.indexOf("tel:") === 0) {
      push({ event: "click_telefone", posicao: pos, cidade: cidade, page_type: pageType });
      if (CONFIG.GA4_ID) gtag("event", "click_telefone", { posicao: pos, cidade: cidade });
      lead("telefone", pos);
    } else if (href.indexOf("/desentupimento-em-") === 0) {
      push({ event: "click_cidade", destino: href, origem: pos, cidade: cidade, page_type: pageType });
    }
  }, true);

  /* --- FAQ --- */
  d.addEventListener("toggle", function (e) {
    var t = e.target; if (t.tagName === "DETAILS" && t.open && t.closest(".faq")) {
      var q = t.querySelector("summary"); push({ event: "faq_open", pergunta: q ? q.textContent.replace(/\+$/, "").trim() : "", cidade: cidade });
    }
  }, true);

  /* --- profundidade de rolagem --- */
  var marks = [25, 50, 75, 90], sent = {}, ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var h = d.documentElement.scrollHeight - w.innerHeight; if (h <= 0) return;
      var pct = (w.scrollY / h) * 100;
      marks.forEach(function (m) { if (pct >= m && !sent[m]) { sent[m] = 1; push({ event: "scroll_depth", percent: m, cidade: cidade, page_type: pageType }); } });
    });
  }
  w.addEventListener("scroll", onScroll, { passive: true });
})();
