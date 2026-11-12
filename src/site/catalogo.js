// Catálogo de componentes (docs/componentes/): chave para ativar/inativar o
// GOV.BR DS e inicialização dos plugins Bootstrap que exigem opt-in.
//
// Carregado de forma síncrona no <head>, logo após o <link id="catalogo-tema">,
// para trocar o CSS antes da primeira pintura (sem "piscar" o tema errado).
//
// Preferência: ?tema=dsgovbr|bootstrap na URL > localStorage > dsgovbr.
// Ao alternar, a escolha é gravada no localStorage e refletida na URL, para
// que um link copiado abra no mesmo modo.
(function () {
  "use strict";

  var CHAVE = "dsgovbr-bootstrapped:tema";
  var TEMAS = ["dsgovbr", "bootstrap"];

  function lerArmazenado() {
    try {
      return window.localStorage.getItem(CHAVE);
    } catch (e) {
      return null; // modo privado ou armazenamento bloqueado
    }
  }

  function gravar(tema) {
    try {
      window.localStorage.setItem(CHAVE, tema);
    } catch (e) {
      // sem armazenamento: a escolha vale só para esta página
    }
  }

  function preferencia() {
    var daUrl = new URLSearchParams(window.location.search).get("tema");
    if (TEMAS.indexOf(daUrl) !== -1) {
      gravar(daUrl);
      return daUrl;
    }
    var armazenado = lerArmazenado();
    return TEMAS.indexOf(armazenado) !== -1 ? armazenado : "dsgovbr";
  }

  function aplicar(tema) {
    var css = document.getElementById("catalogo-tema");
    var fonte = document.getElementById("catalogo-fonte");
    if (css) {
      var alvo = css.getAttribute("data-" + tema);
      if (alvo && css.getAttribute("href") !== alvo) {
        css.setAttribute("href", alvo);
      }
    }
    if (fonte) {
      // a Rawline é parte do GOV.BR DS; no Bootstrap puro fica desligada
      fonte.disabled = tema !== "dsgovbr";
    }
    document.documentElement.setAttribute("data-catalogo-tema", tema);
  }

  function refletirNaUrl(tema) {
    var url = new URL(window.location.href);
    url.searchParams.set("tema", tema);
    window.history.replaceState(null, "", url);
  }

  function iniciarPlugins() {
    var bs = window.bootstrap;
    if (!bs) {
      return;
    }
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
      bs.Tooltip.getOrCreateInstance(el);
    });
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
      bs.Popover.getOrCreateInstance(el);
    });
    // botões que exibem um toast: data-catalogo-toast="#id-do-toast"
    document.querySelectorAll("[data-catalogo-toast]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        var alvo = document.querySelector(botao.getAttribute("data-catalogo-toast"));
        if (alvo) {
          bs.Toast.getOrCreateInstance(alvo).show();
        }
      });
    });
  }

  var tema = preferencia();
  aplicar(tema);

  document.addEventListener("DOMContentLoaded", function () {
    var chave = document.getElementById("catalogo-alternar-tema");
    if (chave) {
      chave.checked = tema === "dsgovbr";
      chave.addEventListener("change", function () {
        tema = chave.checked ? "dsgovbr" : "bootstrap";
        aplicar(tema);
        gravar(tema);
        refletirNaUrl(tema);
      });
    }
    iniciarPlugins();
  });
})();
