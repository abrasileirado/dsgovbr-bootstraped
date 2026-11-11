/*!
 * dsgovbr-bootstraped — web components de header, menu, footer e breadcrumb (opcional)
 * Licensed under MIT (https://github.com/abrasileirado/dsgovbr-bootstraped/blob/main/LICENSE)
 */
// Custom elements em light DOM (sem Shadow DOM): geram as mesmas classes
// Bootstrap das composições documentadas, então o CSS do tema vale sem ajuste e
// o seu CSS também. Não dependem de nada além do CSS do tema; o JS do Bootstrap
// (bootstrap.bundle) é quem abre o menu, os dropdowns e a busca (data-bs-*).
//
//   <script src="dsgovbr-bootstraped-componentes.js" defer></script>
//
// Elementos: <dsgovbr-breadcrumb>, <dsgovbr-menu>, <dsgovbr-footer> e
// <dsgovbr-header>. Cada um lê os filhos e atributos UMA vez, ao conectar, e
// troca o conteúdo pelo HTML final (o conteúdo original é só a declaração).
// Mudar um atributo depois remonta o componente. O modo claro/escuro continua
// no JS à parte (dsgovbr-bootstraped-modo.js); o header só renderiza o botão.
//
// Convenção de filhos: `slot="nome"` agrupa filhos por função (não é Shadow DOM,
// só um marcador); `icone="fas fa-home"` são as classes do ícone.
(function () {
  "use strict";

  if (!window.customElements) {
    return; // navegador sem custom elements: a página fica sem os componentes
  }

  var contador = 0;

  function proximoId(prefixo) {
    contador += 1;
    return "dsgovbr-" + prefixo + "-" + contador;
  }

  // Monta um elemento só com a API de DOM: valores de atributo e texto nunca viram HTML.
  function h(tag, atributos, filhos) {
    var el = document.createElement(tag);
    Object.keys(atributos || {}).forEach(function (nome) {
      var valor = atributos[nome];
      if (valor !== null && valor !== undefined && valor !== false) {
        el.setAttribute(nome, valor === true ? "" : valor);
      }
    });
    [].concat(filhos === undefined ? [] : filhos).forEach(function (filho) {
      if (filho !== null && filho !== undefined && filho !== false) {
        el.append(filho);
      }
    });
    return el;
  }

  function icone(classes, extra) {
    return classes ? h("i", { class: classes + (extra ? " " + extra : ""), "aria-hidden": "true" }) : null;
  }

  function texto(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  // Filhos diretos com `slot="nome"`.
  function doSlot(raiz, nome) {
    return Array.prototype.filter.call(raiz.children, function (el) {
      return el.getAttribute("slot") === nome;
    });
  }

  // Link declarado: <a href icone atual>Texto</a> -> dados simples.
  function lerLink(a) {
    return {
      href: a.getAttribute("href") || "#",
      texto: texto(a),
      icone: a.getAttribute("icone"),
      atual: a.hasAttribute("atual"),
    };
  }

  function modoEscuro() {
    return document.documentElement.getAttribute("data-bs-theme") === "dark";
  }

  // Base: lê uma vez, monta ao conectar e remonta se um atributo mudar.
  // Se o script rodar antes do parser terminar, espera o DOMContentLoaded: sem
  // isso o connectedCallback chegaria antes dos filhos existirem.
  class Base extends HTMLElement {
    connectedCallback() {
      var self = this;
      function iniciar() {
        if (!self.isConnected || self._montado) {
          return;
        }
        self._modelo = self.ler();
        self._montado = true;
        self.montar();
        self.setAttribute("data-dsgovbr-montado", "");
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
      } else {
        iniciar();
      }
    }

    attributeChangedCallback(nome, antigo, novo) {
      if (this._montado && antigo !== novo) {
        this.montar();
      }
    }

    attr(nome, padrao) {
      return this.hasAttribute(nome) ? this.getAttribute(nome) : padrao;
    }
  }

  // ---------------------------------------------------------------- breadcrumb
  // <dsgovbr-breadcrumb rotulo="Trilha de navegação" compacto>
  //   <a href="/">Início</a> <a href="/x">Cadastros</a> <span>Usuários</span>
  // </dsgovbr-breadcrumb>
  // O último item é a página atual (aria-current="page"), mesmo sendo um link.
  class Breadcrumb extends Base {
    static get observedAttributes() {
      return ["rotulo", "compacto"];
    }

    ler() {
      return Array.prototype.map.call(this.children, function (el) {
        return { href: el.tagName === "A" ? el.getAttribute("href") : null, texto: texto(el) };
      });
    }

    montar() {
      var itens = this._modelo;
      var ultimo = itens.length - 1;
      var lista = h(
        "ol",
        { class: "breadcrumb" + (this.hasAttribute("compacto") ? " mb-1" : "") },
        itens.map(function (item, i) {
          if (i === ultimo) {
            return h("li", { class: "breadcrumb-item active", "aria-current": "page" }, item.texto);
          }
          return h("li", { class: "breadcrumb-item" }, item.href ? h("a", { href: item.href }, item.texto) : item.texto);
        })
      );
      this.replaceChildren(h("nav", { "aria-label": this.attr("rotulo", "Trilha de navegação") }, lista));
    }
  }

  // ---------------------------------------------------------------------- menu
  // O próprio elemento é o offcanvas (.offcanvas.offcanvas-start): o `id` dele é
  // o alvo do botão de abrir (<dsgovbr-header menu="id">).
  //
  // <dsgovbr-menu id="menu-principal" titulo="Sistema" logo="logo.svg">
  //   <a href="/" icone="fas fa-home">Início</a>
  //   <details open icone="fas fa-users" id="menu-cadastros">
  //     <summary>Cadastros</summary>
  //     <a href="/usuarios" icone="fas fa-user" atual>Usuários</a>
  //   </details>
  //   <div slot="rodape"> HTML livre: logos, links, redes sociais, licença </div>
  // </dsgovbr-menu>
  class Menu extends Base {
    static get observedAttributes() {
      return ["titulo", "logo", "rotulo", "rotulo-fechar"];
    }

    ler() {
      var itens = [];
      Array.prototype.forEach.call(this.children, function (el) {
        if (el.getAttribute("slot") === "rodape") {
          return;
        }
        if (el.tagName === "A") {
          itens.push({ tipo: "link", link: lerLink(el) });
        } else if (el.tagName === "DETAILS") {
          var resumo = el.querySelector(":scope > summary");
          itens.push({
            tipo: "pasta",
            id: el.id || null,
            rotulo: resumo ? texto(resumo) : "",
            icone: el.getAttribute("icone"),
            aberta: el.hasAttribute("open"),
            links: Array.prototype.filter.call(el.children, function (f) { return f.tagName === "A"; }).map(lerLink),
          });
        }
      });
      var rodape = doSlot(this, "rodape");
      return { itens: itens, rodapeNos: rodape.length ? Array.prototype.slice.call(rodape[0].childNodes) : [] };
    }

    montar() {
      var id = this.id || (this.id = proximoId("menu"));
      var idTitulo = id + "-titulo";
      var titulo = this.attr("titulo", "");
      var logo = this.attr("logo", "");
      this.classList.add("offcanvas", "offcanvas-start");
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-labelledby", idTitulo);

      function link(l) {
        return h(
          "a",
          { class: "list-group-item list-group-item-action" + (l.atual ? " active" : ""), href: l.href, "aria-current": l.atual ? "page" : false },
          [icone(l.icone), l.texto]
        );
      }

      var lista = h("div", { class: "list-group list-group-flush" });
      this._modelo.itens.forEach(function (item, i) {
        if (item.tipo === "link") {
          lista.append(link(item.link));
          return;
        }
        var alvo = item.id || id + "-pasta-" + (i + 1);
        lista.append(
          h(
            "button",
            { class: "list-group-item list-group-item-action", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#" + alvo, "aria-expanded": String(item.aberta), "aria-controls": alvo },
            [icone(item.icone), item.rotulo]
          ),
          h("div", { class: "collapse" + (item.aberta ? " show" : ""), id: alvo }, h("div", { class: "list-group list-group-flush" }, item.links.map(link)))
        );
      });

      var cabecalho = h("div", { class: "offcanvas-header" }, [
        h("div", { class: "d-flex align-items-center gap-2 me-auto" }, [
          logo ? h("img", { src: logo, height: "40", alt: "" }) : null,
          h("span", { id: idTitulo }, titulo),
        ]),
        h("button", { type: "button", class: "btn btn-link rounded-circle", "data-bs-dismiss": "offcanvas", "aria-label": this.attr("rotulo-fechar", "Fechar o menu") }, icone("fas fa-times")),
      ]);

      var corpo = h("div", { class: "offcanvas-body d-flex flex-column p-0" }, h("nav", { "aria-label": this.attr("rotulo", "Menu principal") }, lista));
      if (this._modelo.rodapeNos.length) {
        corpo.append(h("div", { class: "mt-auto" }, this._modelo.rodapeNos));
      }
      this.replaceChildren(cabecalho, corpo);
    }
  }

  // -------------------------------------------------------------------- footer
  // <dsgovbr-footer logo="logo-negativo.svg" logo-alt="Logo do sistema"
  //                 assinatura="assinatura.svg" assinatura-alt="Assinatura do órgão">
  //   <nav slot="coluna" titulo="Sistema"><a href="/sobre">Sobre</a>…</nav>
  //   <a slot="rede" href="…" icone="fab fa-facebook-f">Facebook</a>
  //   <p slot="aviso">Texto legal (aceita HTML)</p>
  // </dsgovbr-footer>
  // Fica sempre no modo escuro (data-bs-theme="dark"), como no GOV.BR DS.
  class Footer extends Base {
    static get observedAttributes() {
      return ["logo", "logo-alt", "assinatura", "assinatura-alt", "rotulo-redes"];
    }

    ler() {
      var aviso = doSlot(this, "aviso");
      return {
        colunas: doSlot(this, "coluna").map(function (col) {
          return {
            titulo: col.getAttribute("titulo") || "",
            links: Array.prototype.filter.call(col.children, function (f) { return f.tagName === "A"; }).map(lerLink),
          };
        }),
        redes: doSlot(this, "rede").map(lerLink),
        avisoNos: aviso.length ? Array.prototype.slice.call(aviso[0].childNodes) : [],
      };
    }

    montar() {
      var m = this._modelo;
      var logo = this.attr("logo", "");
      var assinatura = this.attr("assinatura", "");
      var partes = [];
      if (logo) {
        partes.push(h("img", { class: "d-block mb-5", src: logo, height: "48", alt: this.attr("logo-alt", "") }));
      }
      if (m.colunas.length) {
        partes.push(
          h(
            "div",
            { class: "row g-0 pb-5" },
            m.colunas.map(function (col) {
              return h("div", { class: "col-6 col-md-3 col-lg-2" }, [
                h("h2", {}, col.titulo),
                h(
                  "nav",
                  { class: "nav flex-column", "aria-label": col.titulo },
                  col.links.map(function (l) { return h("a", { class: "nav-link", href: l.href }, l.texto); })
                ),
              ]);
            })
          )
        );
      }
      if (m.redes.length || assinatura) {
        partes.push(
          h("div", { class: "row align-items-end justify-content-between pb-5 d-none d-sm-flex" }, [
            h(
              "div",
              { class: "col" },
              m.redes.length
                ? [
                    h("p", { class: "fs-6 fw-bolder text-uppercase mb-4" }, this.attr("rotulo-redes", "Redes sociais")),
                    h(
                      "div",
                      { class: "d-flex gap-3" },
                      m.redes.map(function (r) {
                        return h("a", { class: "btn btn-link rounded-circle", href: r.href, "aria-label": r.texto }, icone(r.icone));
                      })
                    ),
                  ]
                : []
            ),
            h("div", { class: "col text-end" }, assinatura ? h("img", { src: assinatura, height: "46", alt: this.attr("assinatura-alt", "") }) : null),
          ])
        );
      }
      var filhos = [h("div", { class: "container-lg" }, partes)];
      if (m.avisoNos.length) {
        filhos.push(
          h("hr", { class: "my-3" }),
          h("div", { class: "container-lg" }, h("p", { class: "small fw-medium text-center pb-3 m-0" }, m.avisoNos))
        );
      }
      this.replaceChildren(h("footer", { class: "bg-body", "data-bs-theme": "dark" }, filhos));
    }
  }

  // -------------------------------------------------------------------- header
  // <dsgovbr-header logo="logo.svg" logo-alt="Página inicial" href="/"
  //                 assinatura="Ministério Exemplo"
  //                 titulo="Sistema" subtitulo="Gestão de usuários"
  //                 menu="menu-principal" busca modo usuario="Maria Silva"
  //                 pagina="Usuários">
  //   <a slot="acesso-rapido" href="/docs">Documentação</a>
  //   <a slot="funcionalidade" href="#" icone="fas fa-headset">Suporte</a>
  //   <a slot="usuario" href="/perfil">Meu perfil</a> <hr slot="usuario">
  //   <dsgovbr-breadcrumb slot="breadcrumb">…</dsgovbr-breadcrumb>
  //   <button slot="acoes" class="btn btn-primary">Adicionar</button>
  // </dsgovbr-header>
  // O <header> traz logo, ações, título do sistema e busca. O breadcrumb, o título
  // da página e as ações ficam numa barra logo abaixo dele, fora do <header>, e
  // as duas grudam juntas no topo (.sticky-top); `estatico` desliga a fixação.
  // O host usa `display: contents` (ver o CSS do tema), então o wrapper gerado é
  // que gruda no topo, relativo ao <body>.
  class Header extends Base {
    static get observedAttributes() {
      return ["logo", "logo-alt", "href", "assinatura", "titulo", "subtitulo", "menu", "busca", "modo", "usuario", "pagina", "estatico"];
    }

    ler() {
      return {
        acessoRapido: doSlot(this, "acesso-rapido").map(lerLink),
        funcionalidades: doSlot(this, "funcionalidade").map(lerLink),
        // qualquer elemento que não seja <a> (ex.: <hr>) vira divisor
        usuario: doSlot(this, "usuario").map(function (el) {
          return el.tagName === "A" ? lerLink(el) : null;
        }),
        breadcrumb: doSlot(this, "breadcrumb"),
        acoes: doSlot(this, "acoes"),
      };
    }

    montar() {
      var m = this._modelo;
      var id = this._uid || (this._uid = proximoId("header"));
      var href = this.attr("href", "#");
      var logo = this.attr("logo", "");
      var assinatura = this.attr("assinatura", "");
      var titulo = this.attr("titulo", "");
      var subtitulo = this.attr("subtitulo", "");
      var menu = this.attr("menu", "");
      var busca = this.hasAttribute("busca");
      var modo = this.hasAttribute("modo");
      var usuario = this.attr("usuario", "");
      var pagina = this.attr("pagina", "");
      var idBusca = id + "-busca";
      var botaoRedondo = "btn btn-link btn-sm rounded-circle";

      function botaoModo(classe, extra) {
        return h(
          "button",
          Object.assign({ class: classe, type: "button", "data-dsgovbr-modo": true, "aria-pressed": String(modoEscuro()) }, extra),
          null
        );
      }

      // dropdown do celular: botão + menu
      function dropdown(rotuloBotao, iconeBotao, cabecalho, itens, classe) {
        return h("div", { class: "dropdown " + classe }, [
          h("button", { class: botaoRedondo, type: "button", "data-bs-toggle": "dropdown", "aria-expanded": "false", "aria-label": rotuloBotao }, icone(iconeBotao)),
          h("ul", { class: "dropdown-menu dropdown-menu-end" }, [h("li", {}, h("h2", { class: "dropdown-header" }, cabecalho))].concat(itens)),
        ]);
      }

      var cima = h("div", { class: "d-flex align-items-center gap-3" }, [
        logo ? h("a", { href: href }, h("img", { src: logo, height: "40", alt: this.attr("logo-alt", "") })) : null,
        assinatura ? h("div", { class: "vr d-none d-sm-block" }) : null,
        assinatura ? h("span", { class: "navbar-text p-0 fw-medium d-none d-sm-block" }, assinatura) : null,
      ]);

      var acoesTopo = h("div", { class: "d-flex align-items-center gap-1 ms-auto" });

      if (m.acessoRapido.length) {
        acoesTopo.append(
          h(
            "ul",
            { class: "navbar-nav flex-row d-none d-xl-flex", "aria-label": "Acesso rápido" },
            m.acessoRapido.map(function (l) { return h("li", { class: "nav-item" }, h("a", { class: "nav-link px-2", href: l.href }, l.texto)); })
          ),
          dropdown(
            "Abrir acesso rápido",
            "fas fa-ellipsis-v",
            "Acesso rápido",
            m.acessoRapido.map(function (l) { return h("li", {}, h("a", { class: "dropdown-item", href: l.href }, l.texto)); }),
            "d-xl-none"
          )
        );
      }

      if (m.funcionalidades.length || modo) {
        if (m.acessoRapido.length) {
          acoesTopo.append(h("div", { class: "vr mx-1" }));
        }
        var desktop = h("div", { class: "d-none d-xl-flex" }, m.funcionalidades.map(function (l) {
          return h("a", { class: botaoRedondo, href: l.href, "aria-label": l.texto }, icone(l.icone));
        }));
        var itensCelular = m.funcionalidades.map(function (l) {
          return h("li", {}, h("a", { class: "dropdown-item", href: l.href }, [icone(l.icone, "me-2"), l.texto]));
        });
        if (modo) {
          var rotuloModo = "Modo escuro";
          var bd = botaoModo(botaoRedondo, { "aria-label": rotuloModo, title: rotuloModo });
          bd.append(icone("fas fa-adjust"));
          desktop.append(bd);
          var bc = botaoModo("dropdown-item");
          bc.append(icone("fas fa-adjust", "me-2"), rotuloModo);
          itensCelular.push(h("li", {}, bc));
        }
        acoesTopo.append(desktop, dropdown("Abrir funcionalidades do sistema", "fas fa-th", "Funcionalidades do sistema", itensCelular, "d-xl-none"));
      }

      if (busca) {
        acoesTopo.append(
          h(
            "button",
            { class: "btn btn-link rounded-circle d-lg-none", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#" + idBusca, "aria-expanded": "false", "aria-controls": idBusca, "aria-label": "Abrir busca" },
            icone("fas fa-search")
          )
        );
      }

      if (usuario) {
        acoesTopo.append(
          h("div", { class: "dropdown ms-1" }, [
            h("button", { class: "btn btn-light btn-sm dropdown-toggle", type: "button", "data-bs-toggle": "dropdown", "aria-expanded": "false" }, [
              icone("fas fa-user"),
              h("span", { class: "d-none d-sm-inline" }, usuario),
              h("span", { class: "visually-hidden d-sm-none" }, usuario),
            ]),
            h(
              "ul",
              { class: "dropdown-menu dropdown-menu-end" },
              m.usuario.map(function (l) {
                return h("li", {}, l ? h("a", { class: "dropdown-item", href: l.href }, l.texto) : h("hr", { class: "dropdown-divider" }));
              })
            ),
          ])
        );
      }
      cima.append(acoesTopo);

      var linhas = [cima];
      var barraPagina = null; // breadcrumb, título e ações: fora do <header>

      if (menu || titulo || subtitulo || busca) {
        var meio = h("div", { class: "d-flex flex-wrap align-items-start gap-3 mt-2" });
        if (menu) {
          meio.append(
            h(
              "button",
              { class: botaoRedondo + " mt-1", type: "button", "data-bs-toggle": "offcanvas", "data-bs-target": "#" + menu, "aria-controls": menu, "aria-label": "Abrir menu" },
              icone("fas fa-bars")
            )
          );
        }
        meio.append(
          h("div", { class: "me-auto" }, [
            titulo ? h("a", { class: "navbar-brand p-0 m-0", href: href }, titulo) : null,
            subtitulo ? h("span", { class: "navbar-text" }, subtitulo) : null,
          ])
        );
        if (busca) {
          meio.append(
            h("form", { class: "collapse d-lg-block col-12 col-lg-5 col-xl-4", id: idBusca, role: "search" }, [
              h("label", { class: "visually-hidden", for: idBusca + "-campo" }, "Texto da pesquisa"),
              h("input", { class: "form-control", id: idBusca + "-campo", type: "search", placeholder: "O que você procura?" }),
              h("button", { class: botaoRedondo, type: "submit", "aria-label": "Pesquisar" }, icone("fas fa-search")),
            ])
          );
        }
        linhas.push(meio);
      }

      if (pagina || m.breadcrumb.length || m.acoes.length) {
        m.breadcrumb.forEach(function (el) {
          el.setAttribute("compacto", "");
        });
        barraPagina = h("div", { class: "bg-body border-bottom" }, h("div", { class: "container-lg py-2" }, [].concat(
          m.breadcrumb,
          h("div", { class: "d-flex flex-wrap gap-3 align-items-center justify-content-between" }, [
            pagina ? h("h1", { class: "h3 m-0" }, pagina) : null,
          ].concat(m.acoes))
        )));
      }

      // O <header> (com a sombra do GOV.BR DS) termina depois da busca; a barra da
      // página vem logo abaixo e as duas grudam juntas no topo (.sticky-top). A
      // sombra do header fica por cima da barra (z-1).
      this.replaceChildren(
        h("div", { class: this.hasAttribute("estatico") ? "" : "sticky-top" }, [
          h("header", { class: "navbar bg-body position-relative z-1" }, h("div", { class: "container-lg d-block" }, linhas)),
          barraPagina,
        ])
      );
    }
  }

  // Ordem importa só por clareza: o breadcrumb também funciona se for definido
  // depois do header (ele é movido e continua idempotente).
  [
    ["dsgovbr-breadcrumb", Breadcrumb],
    ["dsgovbr-menu", Menu],
    ["dsgovbr-footer", Footer],
    ["dsgovbr-header", Header],
  ].forEach(function (par) {
    if (!window.customElements.get(par[0])) {
      window.customElements.define(par[0], par[1]);
    }
  });
})();
