# Project Style References

This file records the external style briefs and code references used to translate individual projects into the `projects/` shelf cards on this site.

## Bollywoodle

### Status
- Shelf card implemented on [`projects/index.html`](/Users/prasanniyer/notprsn.github.io/projects/index.html)
- Shared implementation styles live in [`css/style.css`](/Users/prasanniyer/notprsn.github.io/css/style.css)

### Design read
- Low-light, warm-metallic, filmic
- Textured charcoal surfaces with a single gold accent
- Wordmark-led branding
- Gold outline language over dark surfaces
- Gameplay cues matter: dots, chips, compact meta

### Key tokens used
- Accent: `#DFA168`
- Accent light: `#F1C89B`
- Hover accent: `#D9A6A0`
- Text: `#F7F5F2`
- Muted: `#7B7068`
- Success: `#8FAE5C`
- Surface: `#0F0F0F`
- Background: `#1A1A1A`

### External source references
- Core palette, spacing, radii, font: `/Users/prasanniyer/BWDL/bollywoodle/docs/styles/tokens.css`
- Shared surfaces and buttons: `/Users/prasanniyer/BWDL/bollywoodle/docs/styles/components.css`
- Home layout and wordmark behavior: `/Users/prasanniyer/BWDL/bollywoodle/docs/styles/home.css`
- Ticker motion: `/Users/prasanniyer/BWDL/bollywoodle/docs/styles/ticker.css`
- Bottom nav: `/Users/prasanniyer/BWDL/bollywoodle/docs/styles/bottom-nav.css`
- Heardle panel: `/Users/prasanniyer/BWDL/bollywoodle/docs/styles/heardle.css`
- Musicle clues: `/Users/prasanniyer/BWDL/bollywoodle/docs/styles/musicle.css`
- Compact tile markup: `/Users/prasanniyer/BWDL/bollywoodle/docs/shared/games-grid.js`

## CloudScript

### Status
- Shelf card implemented on [`projects/index.html`](/Users/prasanniyer/notprsn.github.io/projects/index.html)
- Shared implementation styles live in [`css/style.css`](/Users/prasanniyer/notprsn.github.io/css/style.css)
- Future story hook wired via `data-writing-slot="projects-cloudscript"`

### Design read
- Soft, playful, mobile-first art-tool feel
- Pale sky surfaces, frosted white cards, cool blue cloud outlines
- The product output is the ornament: cloud-word silhouettes act as branding
- Tight, bold system-sans wordmark paired with airy spacing
- Rounded glass panels, aurora blobs, and light borders define the chrome

### Key tokens used
- Page background: `#F6F8FC`
- Outer shell: `#0B0F1A`
- Main app wash: `linear-gradient(180deg, #FFFFFFE0 0%, #F1F7FFEB 55%, #EBF4FFFA 100%)`
- Canvas wash: `linear-gradient(145deg, #FFFFFFB3 0%, #E2F1FFE6 100%)`
- Base surface: `#FFFFFF`
- Frosted surface: `rgba(255,255,255,0.86)`
- Secondary surface: `rgba(255,255,255,0.92)`
- Primary ink: `#0F172A`
- Secondary ink: `#475569`
- Muted/meta: `#94A3B8`
- Default cloud stroke/fill token: `#0EA5E9` / `#BAE6FD`
- Live active preview stroke/fill: `#3B82F6` / `#E7F0FE`
- UI border: `rgba(15,23,42,0.08)`
- Secondary border: `rgba(148,163,184,0.25)`
- Accent glow: `rgba(14,165,233,0.25)`

### Typography
- Family: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Brand wordmark:
  - desktop `32.8px`
  - mobile `25.6px`
  - weight `700`
  - tracking `-0.04em`
- Micro labels:
  - around `9.6px` to `9.92px`
  - uppercase
  - weight `600`
  - tracking `0.12em`

### Motion cues
- Aurora rotation: `40s linear infinite` and `60s linear infinite reverse`
- Small UI transitions: `0.15s` to `0.2s ease`
- Preview overlay: `220ms ease`
- Mobile control overlays: `180ms cubic-bezier(0.2, 0.7, 0.2, 1)`
- Dropdowns: `150ms ease-out`
- Cloud stroke animation: `640ms cubic-bezier(0.22, 1, 0.36, 1)`
- Fill reveal: `120ms ease-out`
- Curtain exit: long theatrical multi-second fade and drift

### Extracted cloud vectors

#### Main cloud silhouette
```svg
<svg viewBox="-125 -40 250 80" xmlns="http://www.w3.org/2000/svg" aria-label="Cloud silhouette">
  <path d="M -117.16 32.00 L 117.16 32.00 L 117.16 -0.00 L 69.90 -19.70 L 25.07 -28.61 L -28.26 -28.26 L -72.98 -18.76 L -117.16 -0.00 Z" fill="#E7F0FE" stroke="#3B82F6" stroke-width="2"/>
</svg>
```

#### Alternate cloud silhouette
```svg
<svg viewBox="-150 -45 300 90" xmlns="http://www.w3.org/2000/svg" aria-label="Script silhouette">
  <path d="M -142.73 32.00 L 142.73 32.00 L 142.73 -0.00 L 93.80 -21.23 L 43.99 -33.09 L -1.61 -36.35 L -54.70 -31.30 L -98.86 -19.50 L -142.73 -0.00 Z" fill="#E7F0FE" stroke="#3B82F6" stroke-width="2"/>
</svg>
```

#### Small decorative cloud
```svg
<svg viewBox="0 0 68 24" xmlns="http://www.w3.org/2000/svg" aria-label="Compact cloud">
  <path d="M 4 18 L 64 18 L 64 12 L 54 8 L 44 5 L 31 4 L 20 6 L 10 10 L 4 13 Z" fill="#E7F0FE" stroke="#3B82F6" stroke-width="2"/>
</svg>
```

### Wordmark approximations

#### Cloud
```svg
<svg viewBox="0 0 118 42" xmlns="http://www.w3.org/2000/svg" aria-label="Cloud">
  <text x="0" y="31" font-family='ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' font-size="34" font-weight="700" letter-spacing="-0.04em" fill="#0F172A">Cloud</text>
</svg>
```

#### Script
```svg
<svg viewBox="0 0 116 42" xmlns="http://www.w3.org/2000/svg" aria-label="Script">
  <text x="0" y="31" font-family='ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' font-size="34" font-weight="700" letter-spacing="-0.04em" fill="#0F172A">Script</text>
</svg>
```

### External source references
- Main shell and tokens: `/Users/prasanniyer/cloudscript/src/styles/app.css`
- App shell and live color behavior: `/Users/prasanniyer/cloudscript/src/app/App.tsx`
- Fill tint logic: `/Users/prasanniyer/cloudscript/src/utils/color.ts`
- Curtain behavior: `/Users/prasanniyer/cloudscript/src/render/CloudCurtain.tsx`
- Preview renderer: `/Users/prasanniyer/cloudscript/src/render/CloudCanvasV2.tsx`
- Layout lab canvas: `/Users/prasanniyer/cloudscript/src/render/LayoutLabCanvas.tsx`
- Cloud drift motion: `/Users/prasanniyer/cloudscript/src/motion/lemniscateMotion.ts`
- Custom alphabet glyphs: `/Users/prasanniyer/cloudscript/src/engine/glyphConstants.ts`
- Solid fill conversion: `/Users/prasanniyer/cloudscript/src/engine/glyphSolidifier.ts`

### External classes/components worth mimicking
- `.app-logo__word`
- `.prompt-card`
- `.canvas-area`
- `.canvas-frame`
- `.controls-panel`
- `.download-btn`
- `.ratio-pill`
- `.character-map-btn`
- `.credits-btn`
- `.cloud-curtain`
- `.curtain-center-message`
- `.glyph-path-animate`
- `.glyph-fill-animate`

### Implementation note
- The current CloudScript shelf card intentionally keeps only the compressed essentials:
  - the dark wordmark
  - one pale-blue cloud silhouette system
  - one micro-label
  - a frosted rounded pill surface
- Full app-shell elements like the prompt bar, export bar, ad gate, and control panels are intentionally omitted from the shelf card.

## Polymarket Quant Desk

### Status
- Shelf card implemented on [`projects/index.html`](/Users/prasanniyer/notprsn.github.io/projects/index.html)
- Shared implementation styles live in [`css/style.css`](/Users/prasanniyer/notprsn.github.io/css/style.css)
- Future story hook wired via `data-writing-slot="projects-polymarket-quant-desk"`
- Live-derived sample data preserved in [`docs/project-data/polymarket-quant-desk-sample.json`](/Users/prasanniyer/notprsn.github.io/docs/project-data/polymarket-quant-desk-sample.json)

### Design read
- Dark, monospaced, instrument-like shell
- Research/data pages lean cool and flat with blue emphasis
- Strategy pages lean warmer and more cinematic with amber plus pale-blue bloom
- Feels like a quant lab desk rather than a retail trading app
- Diagnostics and microstructure matter more than glossy chart theatrics

### Key tokens used
- Research/data background: `#0F1117`
- Research/data panel: `#1A1D2E`
- Research/data border: `#2A2D3E`
- Research/data body text: `#E0E0E0`
- Research/data dim text: `#8888AA`
- Research/data accent: `#4A6CF7`
- Strategy background: `#0F1726`
- Strategy panel: `#151D2B`
- Strategy secondary panel: `#1B2435`
- Strategy border: `#2C3750`
- Strategy body text: `#EBF1FB`
- Strategy dim text: `#95A2BB`
- Warm accent: `#F59E0B`
- Cold accent: `#60A5FA`
- Signal line: `#F8FAFC`
- Profit/up: `#22C55E`
- Loss/down: `#EF4444`
- BTC: `#F7931A`
- ETH: `#627EEA`
- SOL: `#00FFA3`

### Typography
- Families:
  - `SF Mono, Fira Code, Consolas, monospace`
  - `IBM Plex Mono, SF Mono, Fira Code, monospace`
- Dashboard title:
  - `14px`
  - `700`
  - uppercase
  - `1.4px` to `1.5px` tracking
- Asset/window title:
  - `18px`
  - `700`
  - uppercase
  - `1px` tracking
- Section heading:
  - `11px` to `12px`
  - `600` to `700`
  - uppercase
  - `0.8px` to `1px` tracking
- Metrics:
  - `15px` to `18px`
  - `700`

### Layout and motif notes
- Full-viewport shell with fixed rail plus scrollable main pane
- Compact panel language: `1px` borders, `8px` to `10px` radii, dense-but-breathable spacing
- Repeating motifs:
  - `999px` pills
  - resolution badges
  - source chips
  - window rows with small right-edge badges
  - paired YES/NO line logic
  - trade markers over line charts
- Distinctive atmospheric layer:
  - subtle top-right cool bloom
  - faint warm wash
  - almost no shadows

### Interaction notes
- Hover behavior is minimal
- Window rows use `background 0.15s`
- Nav links only underline on hover
- Selects mostly change border color on focus
- Plotly interaction is the dominant motion layer

### Card translation notes used for the shelf card
- Preserve:
  - mono uppercase kicker
  - pill badges
  - one warm/cold accent pairing
  - one dual-line mini chart
  - compact stat stack
  - thin border on dark panel
- Omit:
  - sidebars
  - dropdowns
  - tables
  - long window lists
  - full legends
  - multi-panel dashboard density

### External source references
- Research shell, token block, badges, chips, summary bar:
  - `/Users/prasanniyer/quant/research/dashboard/static/index.html`
- Strategy shell, run pill, metric grid, asset-colored headings:
  - `/Users/prasanniyer/quant/research/dashboard/static/strategy.html`
- Strategy window plot language:
  - `/Users/prasanniyer/quant/research/dashboard/static/strategy_window.html`
- Feature biasing mini-card system:
  - `/Users/prasanniyer/quant/research/dashboard/static/features.html`
- Data-health dashboard sibling:
  - `/Users/prasanniyer/quant/scripts/data_overview/static/index.html`
- Live route/data loaders:
  - `/Users/prasanniyer/quant/research/dashboard/app.py`

### Implementation note
- The current shelf card intentionally compresses the desk into:
  - a mono uppercase identity
  - two compact pill badges
  - one mini research plot
  - three stat blocks
  - asset-tinted labels
- It uses the strategy-page dark surface language rather than the flatter research dashboard chrome because that compresses better into a single shelf pill.
