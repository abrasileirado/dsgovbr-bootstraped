"""Configuração do Sphinx para a documentação do dsgovbr-bootstrapped.

As páginas reST usam o tema dsgovbr-sphinx-theme. O catálogo de componentes
(docs/componentes/), os exemplos (docs/exemplos/) e os assets compilados
(docs/assets/) continuam sendo HTML estático — também servem de fixture aos
testes do Playwright — e são copiados sem alteração para a saída do build.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

DOCS = Path(__file__).resolve().parent
RAIZ = DOCS.parent
PACOTE = json.loads((RAIZ / "package.json").read_text(encoding="utf-8"))

project = "dsgovbr-bootstrapped"
author = "Kelson da Costa Medeiros"
copyright = "2026, Abrasileirado"  # noqa: A001
release = PACOTE["version"]
language = "pt_BR"

extensions = [
    "sphinx.ext.autosectionlabel",
    "sphinx.ext.githubpages",
    "dsgovbr_sphinx_theme.componentes",
]
autosectionlabel_prefix_document = True

root_doc = "index"
exclude_patterns = ["_build", "assets", "componentes", "exemplos", "node_modules"]

html_theme = "dsgovbr_sphinx_theme"
html_title = f"{project} {release}"
html_theme_options = {
    "tagline": "Bootstrap 5 com visual GOV.BR DS",
    "github_url": "https://github.com/abrasileirado/dsgovbr-bootstrapped",
}

# Pastas de HTML estático publicadas junto com o site, preservando o caminho.
PASTAS_ESTATICAS = ("assets", "componentes", "exemplos")
CSS_LOCAL = RAIZ / "dist" / "dsgovbr-bootstrapped.min.css"


def _copiar_estaticos(app: Any, exception: Exception | None) -> None:
    if exception is not None or app.builder.format != "html":
        return
    saida = Path(app.outdir)
    for pasta in PASTAS_ESTATICAS:
        origem = DOCS / pasta
        if not origem.is_dir():
            raise FileNotFoundError(
                f"docs/{pasta}/ não encontrado: rode `npm run build` antes do sphinx-build."
            )
        shutil.copytree(origem, saida / pasta, dirs_exist_ok=True)
    # As diretivas br-* usam o CSS empacotado no tema; aqui publicamos o CSS
    # recém-compilado deste repositório, para a documentação refletir o código atual.
    if CSS_LOCAL.is_file():
        destino = saida / "_static" / "vendor" / "dsgovbr-bootstrapped" / CSS_LOCAL.name
        shutil.copy2(CSS_LOCAL, destino)


def setup(app: Any) -> None:
    app.connect("build-finished", _copiar_estaticos)
