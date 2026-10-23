"use strict";

// Deriva de tokens (RF-02 / DP-09): cada valor de src/scss/_tokens.scss é uma
// cópia de um valor do submodule vendor/govbr-ds-core. Este teste confere cada
// cópia contra a origem e exige que todo $govbr-* tenha origem registrada aqui.
// Ao subir a tag do GOV.BR DS, um valor que mudou faz este teste falhar.

const test = require("node:test");
const assert = require("node:assert/strict");
const { read, scssVar, cssProp, normalize } = require("./helpers");

const G = "vendor/govbr-ds-core/src/partial/scss/configs/";
const COLORS = `${G}colors/`;
const BUTTON = "vendor/govbr-ds-core/src/components/button/_mixins.scss";

const src = (rel, name) => scssVar(read(rel), name);

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

// $shadow-sm do GOV.BR DS é uma cadeia de var(--surface-*); resolvemos cada peça.
function shadowSm() {
  const elevation = read(`${G}_elevation.scss`);
  const chain = scssVar(elevation, "shadow-sm");
  assert.equal(
    chain,
    "var(--surface-offset-none) var(--surface-offset-sm) var(--surface-blur-lg) rgba(var(--surface-shadow-color), var(--surface-opacity-xs))",
    "estrutura de $shadow-sm mudou no GOV.BR DS: reconferir $govbr-shadow-sm"
  );
  assert.equal(scssVar(elevation, "shadow-color"), "var(--rgb-secondary-09)");
  const black = scssVar(read(`${G}_colors.scss`), "color-secondary-09");
  const [r, g, b] = hexToRgb(black);
  const x = scssVar(elevation, "offset-none");
  const y = scssVar(elevation, "offset-sm");
  const blur = scssVar(elevation, "blur-lg");
  const alpha = scssVar(elevation, "opacity-xs");
  return normalize(`${x} ${y} ${blur} rgba(${r}, ${g}, ${b}, ${alpha})`);
}

// token (sem o prefixo $govbr-) -> valor esperado, lido da origem.
const ORIGEM = {
  interactive: () => src(`${COLORS}_blue-warm-vivid.scss`, "blue-warm-vivid-70"),
  active: () => src(`${COLORS}_blue-warm-vivid.scss`, "blue-warm-vivid-80"),
  "hover-opacity": () => {
    assert.equal(src(`${G}_states.scss`, "hover"), "var(--surface-opacity-xs)");
    return src(`${G}_elevation.scss`, "opacity-xs");
  },
  info: () => src(`${COLORS}_blue-warm-vivid.scss`, "blue-warm-vivid-60"),
  success: () => src(`${COLORS}_green-cool-vivid.scss`, "green-cool-vivid-50"),
  warning: () => src(`${COLORS}_yellow-vivid.scss`, "yellow-vivid-20"),
  danger: () => src(`${COLORS}_red-vivid.scss`, "red-vivid-50"),
  "warning-text": () => src(`${COLORS}_yellow-vivid.scss`, "yellow-vivid-60"),
  "tag-background": () => src(`${COLORS}_blue-warm-vivid.scss`, "blue-warm-vivid-90"),
  "gray-90": () => src(`${COLORS}_gray.scss`, "gray-90"),
  "gray-80": () => src(`${COLORS}_gray.scss`, "gray-80"),
  "gray-40": () => src(`${COLORS}_gray.scss`, "gray-40"),
  "gray-20": () => src(`${COLORS}_gray.scss`, "gray-20"),
  "gray-5": () => src(`${COLORS}_gray.scss`, "gray-5"),
  background: () => src(`${COLORS}_pure.scss`, "pure-0"),
  "font-family": () => src(`${G}_typography.scss`, "font-family-base"),
  "font-size-base": () => src(`${G}_typography.scss`, "font-size-scale-base"),
  "font-weight-medium": () => src(`${G}_typography.scss`, "font-weight-medium"),
  "font-weight-semibold": () => src(`${G}_typography.scss`, "font-weight-semi-bold"),
  focus: () => src(`${COLORS}_gold-vivid.scss`, "gold-vivid-40"),
  "focus-width": () => src(`${G}_surface.scss`, "width-lg"),
  "focus-ring-width": () => src(`${G}_surface.scss`, "width-md"),
  "focus-offset": () => `${parseInt(src(`${G}_spacing.scss`, "spacer"), 10) / 2}px`,
  "radius-sm": () => src(`${G}_surface.scss`, "rounder-sm"),
  "shadow-sm": shadowSm,
  spacer: () => src(`${G}_spacing.scss`, "spacer"),
  "button-radius": () => cssProp(read(BUTTON), "--button-radius"),
  "button-height-small": () => cssProp(read(BUTTON), "--button-small"),
  "button-height-medium": () => cssProp(read(BUTTON), "--button-medium"),
  "button-height-large": () => cssProp(read(BUTTON), "--button-large"),
  // padding: 0 var(--spacing-scale-3x) = 3 x $spacer
  "button-padding-x": () => {
    assert.match(read(BUTTON), /padding:\s*0 var\(--spacing-scale-3x\)/, "padding do botão mudou");
    return `${3 * parseInt(src(`${G}_spacing.scss`, "spacer"), 10)}px`;
  },
};

const tokens = read("src/scss/_tokens.scss");
const nossos = [...tokens.matchAll(/^\$govbr-([a-z0-9-]+):/gm)].map((m) => m[1]);

test("todo token tem origem registrada e vice-versa", () => {
  assert.deepEqual([...nossos].sort(), Object.keys(ORIGEM).sort());
});

for (const nome of nossos) {
  test(`$govbr-${nome} bate com o GOV.BR DS`, () => {
    const esperado = ORIGEM[nome]();
    assert.ok(esperado, `origem de ${nome} não encontrada no submodule`);
    assert.equal(scssVar(tokens, `govbr-${nome}`), normalize(esperado));
  });
}
