# AI home reference redesign QA

## Source of truth

- ChatGPT reference: `C:/Users/Admin/AppData/Local/Temp/codex-clipboard-b2ab1c8d-c3c6-4430-a8d4-819e9ff43dfa.png` (1898 x 855).
- Claude reference: `C:/Users/Admin/AppData/Local/Temp/codex-clipboard-91e35eb0-5b8c-4aef-8d9e-0a97d9f7de2a.png` (1895 x 838).
- Product constraint: retain Nimdal's identity, portfolio navigation, theme switch, grounded answers, and real profile assets. The sources establish interaction density and layout language; the site does not impersonate either product or reproduce unsupported controls.

## Compared state

- Browser: Codex in-app browser.
- Implementation viewport: 1280 x 720 CSS px, density 1.
- Route: `http://127.0.0.1:3002/en`.
- States: empty ChatGPT mode and empty Claude mode.
- The supplied source captures were normalized to 1280px width and placed directly above the corresponding implementation capture for a single visual comparison input.

## Evidence

- ChatGPT comparison: `.next/design-qa/chatgpt-reference-comparison.png`.
- Claude comparison: `.next/design-qa/claude-reference-comparison.png`.
- ChatGPT implementation: `.next/design-qa/chatgpt-implementation.png`.
- Claude implementation: `.next/design-qa/claude-implementation.png`.

## Findings and fixes

1. **[P1] The prior themes differed mostly through color and decorative atmosphere.**
   - Fix: removed the animated canvas and rebuilt each empty state around its source's information density, whitespace, sidebar treatment, and composer geometry.
2. **[P1] The initial Claude greeting wrapped into two lines and competed with the composer.**
   - Fix: added a concise theme-specific greeting so the identity mark and headline remain one horizontal focal point.
3. **[P2] Six recommendation cards made both homes read like a portfolio landing page.**
   - Fix: ChatGPT now exposes two lightweight suggestions by default; Claude hides suggestions until the functional plus control is expanded.
4. **[P2] Both themes previously shared the same composer behavior.**
   - Fix: ChatGPT uses a 760 x 56 single-line pill; Claude uses a 674 x 122 two-row work surface with controls anchored to its lower row.
5. **[P2] Fixed desktop dimensions could have displaced the mobile experience.**
   - Fix: preserved the existing mobile navigation and added theme-specific responsive constraints for headings, composers, prompt expansion, and legal copy.

## Fidelity review

- **ChatGPT:** 250px native-width sidebar, centered segmented switch, sparse white stage, compact greeting, single-line composer, and two low-emphasis suggestion rows match the supplied composition.
- **Claude:** 280px native-width sidebar, serif product mark, white work surface, concise greeting paired with the NFT identity, and a large two-row composer match the supplied composition.
- **Identity:** the UI remains clearly Nimdal's portfolio through the NFT mark, Tak Chanwoo profile, portfolio topics, localized copy, and grounded response system.
- **Interaction:** theme switching persists without resetting a conversation; plus controls expand prompt choices; sidebar topics and the composer still produce in-place answers.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Production build: passed. Existing BLOG editor filesystem-tracing warnings remain unchanged.
- Focused theme and prompt behavior: 2 passed.
- Full regression and accessibility suite: 87 passed.

## Final result

passed
