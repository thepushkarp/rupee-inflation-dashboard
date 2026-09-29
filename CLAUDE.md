# Project guidance

Read [README.md](README.md) for commands, data semantics, architecture, and asset attribution.

Keep the page plot-first and light-only. Use the existing React, Vite, SWR, ApexCharts, and CSS Modules stack.
Keep one purchasing-power calculation based on raw CPI ratios; do not round intermediate values.
Derive the banknote mask from the rendered area path and verify it after range changes and resizing.
Event descriptions require primary-source links and must distinguish observed inflation from causal claims.

Run `bun --bun run css:types` after editing CSS Module class names and `bun --bun run check` before handoff.
Verify the live chart, event interactions, and mobile layout in the browser.
Keep documentation aligned with implementation and remove replaced code instead of leaving unused components.
