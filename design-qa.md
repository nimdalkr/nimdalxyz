# Design QA — Nimdal Option 2

Final result: **passed**

## Comparison setup

- Reference: `/Users/nimdal/.codex/generated_images/019f78ec-95fd-7bc0-8fd7-2d219b35bacb/exec-118a50c5-3c3d-41af-83fe-b32f7d7e82d1.png`
- Desktop implementation: `artifacts/qa-home-release-1440.png`
- Combined comparison input: `artifacts/design-qa-comparison-release.png`
- Full revealed page: `artifacts/qa-home-release-full-1440.png`
- Mobile implementation: `artifacts/qa-home-release-390.png`
- Primary viewport: 1440 × 1024; responsive checks: 360, 390, 768, 1024, 1440 px.

## Pass 1 findings

| Severity | Surface | Finding | Resolution |
| --- | --- | --- | --- |
| P1 | Color fidelity | The implemented cyan was visibly less saturated than the selected mock. | Matched the reference sample with `--cyan: #06a4ee` and re-captured the comparison. |
| P1 | Responsive layout | A long project name forced the 390 px document width to 410 px. | Added zero-min-width grid constraints and safe title wrapping; 360 and 390 px now report no horizontal overflow. |
| P2 | Accessibility | Header and footer wordmarks had visual boxes shorter than the 44 px touch target. | Made wordmarks 44 px minimum-height inline-flex targets. |
| P2 | Runtime quality | Next surfaced an LCP image hint and smooth-scroll route hint. | Added eager loading to above-fold priority images, removed below-fold preloading, and declared `data-scroll-behavior="smooth"`. |

## Release review findings

| Severity | Surface | Finding | Resolution |
| --- | --- | --- | --- |
| P1 | Language semantics | English pages inherited a Korean document language. | Moved the root layout under `[locale]` so emitted documents use the route locale on `<html lang>`. |
| P1 | Canonical separation | The main host exposed a duplicate, self-canonical blog hub. | Main-host blog hubs now 308 to `blog.nimdal.xyz/{locale}` and were removed from the main sitemap. |
| P1 | Legacy links | Room-less `#project-{slug}` links did not enter a project. | Restored the compatibility bridge with `signal` as the default anchor. |
| P1 | Keyboard visibility | A coral-only focus ring disappeared on cyan, coral, and foam surfaces. | Replaced it with a two-tone foam/navy focus treatment that remains visible across every palette surface. |
| P1 | Landmarks | Skip links missed several main regions and the home landmark ended after the hero. | Every page now exposes `#main-content`, and the homepage has one main landmark containing all core sections. |
| P1 | Touch targets | Short navigation and contact labels were narrower than 44 px. | Added 44 px minimum width and height to standalone navigation, language, brand, and contact targets. |
| P1 | Language control contrast | Inactive language labels used low-contrast opacity. | Removed transparency and retained state through the active underline. |
| P2 | Evidence tabs | The proof switcher lacked complete keyboard tab semantics. | Added controlled IDs, tabpanel relationships, roving focus, and Arrow/Home/End navigation. |

## Final comparison

- Typography preserves the mock's oversized white NIMDAL lockup, tight editorial headings, mono evidence labels, and strong hierarchy in both scripts.
- The hero uses the real square pixel-octopus asset, flat cyan surface, hard dividers, and no generated or decorative substitute assets.
- The white claim rail and navy Selected Proof rows preserve the mock's cyan/white/navy sequence while accommodating the required bilingual evidence copy.
- AlphaDuo, HyperAlphaDuo, and myLoL use actual repository/live/QA media with explicit proof roles.
- All controls required for the primary journey work: navigation, locale switching on the same project, mobile menu, Lab filters, project evidence tabs, case links, and contact links.
- 360–1440 px layouts have no document-level horizontal overflow; visible focus uses a two-tone 3 px foam / navy ring; navigation and standalone mobile targets are at least 44 px.
- Reduced-motion rules remove transitions and Motion islands use `useReducedMotion`; native vertical scrolling and the system cursor remain intact.
- No P0, P1, or unresolved P2 findings remain.
