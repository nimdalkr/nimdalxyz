# Design QA — Nimdal personal portfolio

## Source and implementation

- Selected reference: `/Users/nimdal/.codex/generated_images/019f78ec-95fd-7bc0-8fd7-2d219b35bacb/exec-1dacad9e-5348-4f28-b080-319409921452.png`
- Reference/implementation board: `/Users/nimdal/.codex/visualizations/2026/07/20/nimdal-personal-home-qa/reference-vs-personal-home.png`
- Desktop captures: `/Users/nimdal/.codex/visualizations/2026/07/20/nimdal-personal-qa/home-intro-1440.png`, `home-about-1440.png`, `home-work-1440.png`, `home-career-1440.png`
- Editor captures: `/Users/nimdal/.codex/visualizations/2026/07/20/nimdal-personal-qa/blog-editor-home.png`, `blog-editor-list.png`, `blog-editor-item.png`
- Primary viewport: 1440 px. Responsive checks include 390 px, reduced motion, keyboard navigation, and 200% text zoom.

## Fidelity result

- Information architecture: the home is a personal portfolio, ordered as `Intro → About → Selected Work → Career → BLOG → Contact`; it is not a project-only showcase.
- Intro: the real pixel-octopus PFP and oversized `NIMDAL` lockup open the page before any project content.
- Selected Work: AlphaDuo, HyperAlphaDuo, and myLoL use repository proof/QA captures and are labeled `NFT / RESEARCH / GAME`.
- Career: `1six.tech Inc. / NEVADA`, `071Labs / AlphaDuo`, and `MKR` appear as the primary organization/engagement timeline. Leica, H Animal Medical Center, and Joya / Swiss J are separated as client/brand work.
- BLOG: all user-facing `NIMDALOG` labels are replaced with `BLOG`. The existing three bilingual posts are editable from `/keystatic`.
- Motion: desktop uses a native-scroll title sequence and crossfading sticky project reel. Mobile, coarse-pointer, short-viewport, and reduced-motion environments receive a static vertical edit.
- Imagery: the home uses only the repository PFP, real portrait, and actual project captures. No generated decorative image, stock image, or fake product UI is used.

## QA findings resolved

1. P1 — fading the whole About section to 45% opacity reduced text contrast while it waited to enter the viewport. Replaced the opacity reveal with a transform-only entrance so WCAG contrast remains valid in every animation state.
2. P1 — the reduced-motion browser serialized the near-zero Motion duration as `1e-08s`, while the test accepted only three string formats. The assertion now parses the duration and verifies the numeric upper bound.
3. P1 — Keystatic 0.5.x surfaced React 19 `href=""` warnings from its breadcrumb dependency. Upgraded `@keystatic/core` to 0.6.0 (`@keystar/ui` 0.8.0), which omits empty breadcrumb href values.
4. P1 — organizations and customer brands were visually mixed. Added an explicit organization/engagement timeline and a subordinate client/brand rail with relationship labels.
5. P2 — career metrics repeated their units. Values and labels are now separated as `10+ / YEARS`, `100+ / CLIENTS`, `200+ / CAMPAIGNS`, and `3K+ / KOL NETWORK`.
6. P1 — Motion's reduced-motion media-query value differed between server render and first hydration. Replaced the render-time branch with a hydration-safe preference hook and CSS-hidden progress rail; normal, reduced-motion, and editor console checks now report zero warnings or errors.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Next.js 16.2.10 Turbopack production build: passed; 59 static pages generated.
- Content inventory: 9 projects, 6 career cases, 3 KO/EN blog posts; 4 / 4 tests passed.
- Playwright routing, language, BLOG editor, responsive, keyboard, reduced-motion, 200% zoom, links, and 404 behavior: passed.
- Axe WCAG A/AA serious or critical violations on the tested public surfaces: 0.
- Keystatic article editor after the dependency update: HTTP 200, console warnings/errors 0, page errors 0.
- `npm audit --omit=dev`: 0 vulnerabilities.

## Open findings

- Production editing requires the four GitHub App environment variables documented in `docs/blog-editor.md`. Until they are configured, production intentionally returns 404 for `/keystatic` and `/api/keystatic/*`.
- No unresolved P0 or P1 visual/accessibility findings remain.

Final result: passed.
