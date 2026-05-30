import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cssFile = resolve(__dirname, "../styles/index.css");
const htmlFile = resolve(__dirname, "../../index.html");

// ──────────────────────────────────────────────
// Phase 1.5: HTML — Google Fonts
// ──────────────────────────────────────────────
describe("Redesign Base — HTML: Google Fonts", () => {
  const html = readFileSync(htmlFile, "utf-8");

  it("preconnects to fonts.googleapis.com", () => {
    expect(html).toContain("fonts.googleapis.com");
  });

  it("preconnects to fonts.gstatic.com", () => {
    expect(html).toContain("fonts.gstatic.com");
  });

  it("loads Inter (400, 500, 600)", () => {
    expect(html).toContain("Inter");
  });

  it("loads JetBrains Mono (400, 500)", () => {
    expect(html).toContain("JetBrains+Mono");
  });

  it("loads Bebas Neue", () => {
    expect(html).toContain("Bebas+Neue");
  });
});

// ──────────────────────────────────────────────
// Phase 1.1–1.4, 1.6: CSS Design Tokens
// ──────────────────────────────────────────────
describe("Redesign Base — CSS: Design Tokens & Typography", () => {
  const css = readFileSync(cssFile, "utf-8");

  it("1.1: sets --md-sys-color-primary to #00d4ff", () => {
    expect(css).toMatch(/--md-sys-color-primary:\s*#00d4ff/);
  });

  it("1.1: sets --md-sys-color-surface-dim to #0a0a0a", () => {
    expect(css).toMatch(/--md-sys-color-surface-dim:\s*#0a0a0a/);
  });

  it("1.1: sets --md-sys-color-on-surface to #ffffff", () => {
    expect(css).toMatch(/--md-sys-color-on-surface:\s*#ffffff/);
  });

  it("1.1: sets --md-sys-color-outline to #333333", () => {
    expect(css).toMatch(/--md-sys-color-outline:\s*#333333/);
  });

  it("1.1: sets --md-sys-color-on-surface-variant to #a0a0a0", () => {
    expect(css).toMatch(/--md-sys-color-on-surface-variant:\s*#a0a0a0/);
  });

  it("1.1: sets --bg alias to surface-dim", () => {
    expect(css).toMatch(/--bg:\s*var\(--md-sys-color-surface-dim\)/);
  });

  it("1.1: sets --line to outline", () => {
    expect(css).toMatch(/--line:\s*var\(--md-sys-color-outline\)/);
  });

  it("1.2: repurposes --accent-green to primary (blue)", () => {
    expect(css).toMatch(/--accent-green:\s*var\(--md-sys-color-primary\)/);
  });

  it("1.2: sets --accent-pink, --accent-orange, --accent-lavender to transparent", () => {
    expect(css).toMatch(/--accent-pink:\s*transparent/);
    expect(css).toMatch(/--accent-orange:\s*transparent/);
    expect(css).toMatch(/--accent-lavender:\s*transparent/);
  });

  it("1.3: sets shape tokens to sharp values (2px / 4px)", () => {
    expect(css).toMatch(/--md-sys-shape-corner-small:\s*2px/);
    expect(css).toMatch(/--md-sys-shape-corner-medium:\s*2px/);
    expect(css).toMatch(/--md-sys-shape-corner-large:\s*2px/);
    expect(css).toMatch(/--md-sys-shape-corner-extra-large:\s*4px/);
  });

  it("1.3: adds elevation tokens", () => {
    expect(css).toContain("--elevation-1:");
    expect(css).toContain("--elevation-2:");
  });

  it("1.3: adds glow-blue token", () => {
    expect(css).toContain("--glow-blue:");
  });

  it("1.4: adds font-family tokens (Bebas Neue, Inter, JetBrains Mono)", () => {
    expect(css).toMatch(/--font-heading:\s*'Bebas Neue'/);
    expect(css).toMatch(/--font-body:\s*'Inter'/);
    expect(css).toMatch(/--font-mono:\s*'JetBrains Mono'/);
  });

  it("1.4: adds type scale tokens", () => {
    expect(css).toMatch(/--text-heading-xl:\s*48px/);
    expect(css).toMatch(/--text-heading-lg:\s*36px/);
    expect(css).toMatch(/--text-heading-md:\s*28px/);
    expect(css).toMatch(/--text-heading-sm:\s*22px/);
    expect(css).toMatch(/--text-body-lg:\s*16px/);
    expect(css).toMatch(/--text-body:\s*14px/);
    expect(css).toMatch(/--text-body-sm:\s*13px/);
  });

  it("1.4: adds letter-spacing tokens", () => {
    expect(css).toMatch(/--letter-spacing-heading:\s*0\.03em/);
    expect(css).toMatch(/--letter-spacing-mono:\s*-0\.02em/);
  });

  it("1.6: body uses Inter via var(--font-body)", () => {
    expect(css).toMatch(/body\s*\{[^}]*font-family:\s*var\(--font-body\)/s);
  });
});

// ──────────────────────────────────────────────
// Phase 2: Base CSS Additions
// ──────────────────────────────────────────────
describe("Redesign Base — CSS: Base Additions", () => {
  const css = readFileSync(cssFile, "utf-8");

  it("2.1: adds webkit-scrollbar styles (thin, dark)", () => {
    expect(css).toContain("::-webkit-scrollbar");
    expect(css).toMatch(/::-webkit-scrollbar\s*\{[^}]*width:\s*6px/s);
    expect(css).toMatch(/::-webkit-scrollbar-thumb\s*\{[^}]*background:\s*var\(--line\)/s);
  });

  it("2.2: adds ::selection with electric blue (rgba(0,212,255,...))", () => {
    expect(css).toContain("::selection");
    expect(css).toContain("rgba(0, 212, 255,");
  });

  it("2.3: adds :focus-visible with 2px solid var(--accent)", () => {
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px\s+solid\s+var\(--accent\)/s);
  });

  it("2.4: adds body::after noise overlay with inline SVG", () => {
    expect(css).toContain("body::after");
    expect(css).toContain("data:image/svg+xml");
    expect(css).toContain("feTurbulence");
    expect(css).toContain("mix-blend-mode: overlay");
  });
});

// ──────────────────────────────────────────────
// Phase 3: Layout Shell Updates
// ──────────────────────────────────────────────
describe("Redesign Base — CSS: Layout Shell", () => {
  const css = readFileSync(cssFile, "utf-8");

  it("3.1: .app-shell has no border-radius and proper border", () => {
    const match = css.match(/\.app-shell\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    const block = match![1];
    expect(block).toMatch(/border-radius:\s*(0|none)/);
  });

  it("3.3: .panel has industrial subtle border and small radius", () => {
    const match = css.match(/^\.panel\s*\{([^}]*)\}/m);
    expect(match).not.toBeNull();
    expect(match![1]).toMatch(/border-radius:\s*(0|2px)/);
    // Uses CSS variable or transparent white border
    expect(match![1]).toMatch(/border:\s*1px\s+solid\s+(var\(--border-glass\)|rgb)/i);
  });

  it("3.4: .section-title uses heading font (Bebas Neue) and uppercase", () => {
    expect(css).toMatch(/\.section-title[^}]*var\(--font-heading\)/s);
    expect(css).toMatch(/\.section-title[^}]*text-transform:\s*uppercase/s);
  });

  it("adds .workspace-title using heading font and uppercase", () => {
    expect(css).toMatch(/\.workspace-title\s*\{[^}]*var\(--font-heading\)/s);
  });

  it("adds .workspace-copy using text-secondary", () => {
    expect(css).toMatch(/\.workspace-copy\s*\{[^}]*color:\s*var\(--text-secondary\)/s);
  });
});

// ──────────────────────────────────────────────
// Phase 4.1: Light Theme
// ──────────────────────────────────────────────
describe("Redesign Base — CSS: Light Theme", () => {
  const css = readFileSync(cssFile, "utf-8");

  it("4.1: light theme has industrial gray surfaces (dim: #e0e0e0)", () => {
    expect(css).toMatch(/\[data-theme="light"\]\s*\{[^}]*--md-sys-color-surface-dim:\s*#e0e0e0/s);
  });

  it("4.1: light theme on-surface is #111111", () => {
    expect(css).toMatch(/\[data-theme="light"\]\s*\{[^}]*--md-sys-color-on-surface:\s*#111111/s);
  });
});
