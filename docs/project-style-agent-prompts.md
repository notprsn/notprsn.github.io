# Project Style Agent Prompts

## Bollywoodle

```md
You are helping define the visual language of a completed project called Bollywoodle so it can be represented as a pill/card on a grayscale personal site.

I need you to inspect the running project directly and return a detailed markdown brief that is concrete enough to implement the card styling without guessing.

Please give me all of the following:

1. High-level visual summary
- 4 to 8 bullets on the overall visual identity
- what the project feels like emotionally
- what makes it visually distinct from a generic music/game site

2. Brand and style tokens
- primary, secondary, accent, neutral, and background colors
- exact hex codes for every color you mention
- gradients with exact stop colors and directions
- border colors, shadow colors, and opacity values
- border radius values
- spacing rhythm values if they are consistent

3. Typography
- font families actually used or the closest equivalents
- exact or approximate sizes, weights, letter spacing, and line heights for:
  - hero/title
  - section heading
  - body copy
  - buttons/chips/meta text
- any distinctive text treatments, strokes, outlines, glow, or shadow styles

4. Layout language
- page width behavior
- card/panel structure
- padding and spacing patterns
- how dense or airy the design is
- whether the project prefers centered, grid, list, or stage-like composition

5. Signature UI motifs
- recurring shapes, textures, dividers, chips, badges, frames, or overlays
- any music-specific visual motifs
- any film/Bollywood-specific motifs
- what visual elements would still identify the project even if reduced to one pill on another page

6. Interaction and motion
- hover states
- transitions
- animation durations/easing if visible
- glow/pulse/shine/scroll effects if used

7. Card translation guidance
- if this project had to live as one single full-width pill on another page, what exact elements should be preserved
- what should be omitted
- how much detail is enough before it becomes cluttered

8. Implementation-ready output
- a short CSS variable block with proposed tokens
- a short HTML structure example for the pill
- a short CSS example for the pill
- if useful, include small inline SVG snippets or decorative shapes

9. Assets and code references
- any exact code snippets worth reusing
- any exact classes/components worth referencing
- file paths or component names if identifiable

Format your answer in markdown with clear section headings.
Do not stay abstract. Prefer exact values, code, and concrete style recommendations over general design commentary.
```

## CloudScript

```md
You are helping define the visual language of a completed project called CloudScript so it can be represented as a pill/card on a grayscale personal site.

I need you to inspect the running project directly and return a detailed markdown brief that is concrete enough to implement the card styling without guessing.

Please give me all of the following:

1. High-level visual summary
- 4 to 8 bullets on the overall visual identity
- what the project feels like emotionally
- what makes it visually distinct from a generic tools/app site

2. Brand and style tokens
- primary, secondary, accent, neutral, and background colors
- exact hex codes for every color you mention
- gradients with exact stop colors and directions
- border colors, shadow colors, and opacity values
- border radius values
- spacing rhythm values if they are consistent

3. Typography
- font families actually used or the closest equivalents
- exact or approximate sizes, weights, letter spacing, and line heights for:
  - hero/title
  - section heading
  - body copy
  - buttons/chips/meta text
- any distinctive text treatments

4. Layout language
- page width behavior
- card/panel structure
- padding and spacing patterns
- how dense or airy the design is
- any cloud-like or script-like compositional ideas

5. Signature UI motifs
- recurring shapes, textures, dividers, chips, badges, frames, or overlays
- what visual elements identify the project immediately
- what could be distilled into a single pill on another page

6. Interaction and motion
- hover states
- transitions
- animation durations/easing if visible
- any float/parallax/cloud drift/motion ideas

7. CloudScript-specific vector request
- extract or recreate the SVG path data for the word "Cloud"
- extract or recreate the SVG path data for the word "Script"
- if the live project uses text instead of vector art, generate a visually matching SVG wordmark approximation
- also give me 3 to 5 small static cloud SVG ideas suitable for decorative use inside a pill
- for each cloud, provide copy-pasteable `<svg>` code or at minimum the exact `<path d="...">` data

8. Card translation guidance
- if this project had to live as one single full-width pill on another page, what exact elements should be preserved
- what should be omitted
- how much detail is enough before it becomes cluttered

9. Implementation-ready output
- a short CSS variable block with proposed tokens
- a short HTML structure example for the pill
- a short CSS example for the pill
- include any inline SVG snippets that would help

10. Assets and code references
- any exact code snippets worth reusing
- any exact classes/components worth referencing
- file paths or component names if identifiable

Format your answer in markdown with clear section headings.
Do not stay abstract. Prefer exact values, code, path data, and concrete style recommendations over general design commentary.
```

## Polymarket Quant Desk

```md
You are helping define the visual language of a completed project called Polymarket Quant Desk so it can be represented as a pill/card on a grayscale personal site.

I need you to inspect the running project directly and return a detailed markdown brief that is concrete enough to implement the card styling without guessing.

Please give me all of the following:

1. High-level visual summary
- 4 to 8 bullets on the overall visual identity
- what the project feels like emotionally
- what makes it visually distinct from a generic trading/dashboard UI

2. Brand and style tokens
- primary, secondary, accent, neutral, and background colors
- exact hex codes for every color you mention
- gradients with exact stop colors and directions
- border colors, shadow colors, and opacity values
- border radius values
- spacing rhythm values if they are consistent

3. Typography
- font families actually used or the closest equivalents
- exact or approximate sizes, weights, letter spacing, and line heights for:
  - hero/title
  - section heading
  - body copy
  - buttons/chips/meta text
- any distinctive text treatments

4. Layout language
- page width behavior
- card/panel structure
- padding and spacing patterns
- what parts feel like dashboard, terminal, market tape, chart, or research notebook

5. Signature UI motifs
- recurring shapes, textures, dividers, chips, badges, frames, or overlays
- chart motifs
- market-data motifs
- what visual elements identify the project immediately

6. Interaction and motion
- hover states
- transitions
- animation durations/easing if visible
- blinking ticks, loading, sweep, pulse, or chart-draw effects if any

7. Quant Desk-specific data request
- provide one sample time-series dataset with exactly 100 data points
- output it as copy-pasteable JSON
- include fields that would be useful for a compact sparkline or mini chart, such as `t`, `price`, `probability`, `signal`, or a similarly sensible schema
- make the values realistic and visually interesting enough for a static card plot
- if multiple series are useful, include 2 aligned 100-point arrays and explain what they represent

8. Card translation guidance
- if this project had to live as one single full-width pill on another page, what exact elements should be preserved
- what should be omitted
- how much detail is enough before it becomes cluttered

9. Implementation-ready output
- a short CSS variable block with proposed tokens
- a short HTML structure example for the pill
- a short CSS example for the pill
- if useful, include SVG snippets for mini chart frames, gridlines, markers, or badges

10. Assets and code references
- any exact code snippets worth reusing
- any exact classes/components worth referencing
- file paths or component names if identifiable

Format your answer in markdown with clear section headings.
Do not stay abstract. Prefer exact values, code, JSON data, and concrete style recommendations over general design commentary.
```
