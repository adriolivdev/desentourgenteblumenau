/* =========================================================
   Desentope Urgente — CONTADOR DE VISITANTES E ACESSOS (rodapé)
   Arquivo independente, carregado em todas as 16 páginas.
   Números REAIS:
   - Visitantes únicos: 1x por navegador (localStorage)
   - Acessos no site:   1x por visita (sessionStorage)
   - Acessos nesta página: 1x por visita em cada página
   Fonte 1: /api/contador (Upstash na Vercel). Fonte 2 (plano B, sem configurar
   nada): serviço público Abacus. Se nenhuma responder, o contador fica oculto.
   MIN_PARA_EXIBIR: só mostra quando os visitantes chegarem a esse valor.
   ========================================================= */
(function () {
  "use strict";
  var MIN_PARA_EXIBIR = 0;
  var el = document.getElementById("contador");
  if (!el) {
    var box = document.querySelector(".site-footer .container");
    if (!box) return;
    el = document.createElement("div"); el.id = "contador"; el.className = "site-counter"; box.appendChild(el);
  }
  function esconder() { el.hidden = true; }
  // estilo embutido: funciona mesmo se o style.css do site no ar estiver antigo
  el.style.cssText = "display:block;text-align:center;font-size:.9rem;opacity:.9;padding:.9rem 64px .6rem;margin-top:1rem;border-top:1px solid rgba(255,255,255,.12);width:100%;clear:both";
  function ft(url) {
    var c = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (c) c.abort(); }, 5000);
    return fetch(url, { cache: "no-store", signal: c ? c.signal : undefined }).then(function (r) { clearTimeout(t); return r; }, function (e) { clearTimeout(t); throw e; });
  }
  if (!window.fetch) return esconder();
  var bot = /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent) || navigator.webdriver;
  var caminho = location.pathname.replace(/^\/+|\/+$/g, "");
  var pg = caminho === "" ? "home" : caminho.replace(/^desentupimento-em-/, "");
  var q = ["pg=" + encodeURIComponent(pg)];
  try {
    if (!bot) {
      if (!localStorage.getItem("du_visitante")) { q.push("v=1"); localStorage.setItem("du_visitante", "1"); }
      if (!sessionStorage.getItem("du_acesso")) { q.push("a=1"); sessionStorage.setItem("du_acesso", "1"); }
      if (!sessionStorage.getItem("du_pg_" + pg)) { q.push("ap=1"); sessionStorage.setItem("du_pg_" + pg, "1"); }
    }
  } catch (e) { /* storage bloqueado: apenas lê */ }

  function mostrar(d) {
    if (!d || typeof d.visitantes !== "number" || d.visitantes < MIN_PARA_EXIBIR) return esconder();
    var n = function (x) { return (x || 0).toLocaleString("pt-BR"); };
    el.hidden = false;
    el.innerHTML = "Visitantes únicos: <b>" + n(d.visitantes) + "</b> <span aria-hidden=\"true\">•</span> Acessos no site: <b>" + n(d.acessos) + "</b>" +
      (typeof d.pagina === "number" ? " <span aria-hidden=\"true\">•</span> Acessos nesta página: <b>" + n(d.pagina) + "</b>" : "");
  }

  var NS = "desentopeurgente-com-br";
  function abacus(key, soma) {
    return ft("https://abacus.jasoncameron.dev/" + (soma ? "hit" : "get") + "/" + NS + "/" + key)
      .then(function (r) { if (r.status === 404) return 0; if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { return typeof j === "number" ? j : (+j.value || 0); });
  }
  function planoB() {
    var tem = function (k) { return q.indexOf(k) > -1; };
    return Promise.all([abacus("visitantes", tem("v=1")), abacus("acessos", tem("a=1")), abacus("pg-" + pg, tem("ap=1"))])
      .then(function (v) { mostrar({ visitantes: v[0], acessos: v[1], pagina: v[2] }); });
  }

  ft("/api/contador?" + q.join("&"))
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (d) { if (typeof d.visitantes !== "number") throw 0; mostrar(d); })
    .catch(function () { planoB().catch(function () { if (window.console) console.warn("[contador] indisponível"); esconder(); }); });
})();
