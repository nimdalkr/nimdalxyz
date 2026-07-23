# Pixel Pop redesign — design QA

## Source of truth

- User-selected visual target: 1c **Pixel Pop** from the supplied handoff package.
- Source specification: `/Users/nimdal/Downloads/Nimdal 포트폴리오 리디자인 방향.zip` → `design_handoff_pixelpop_redesign/README.md` and `prototypes/Home.dc.html`.
- Source visual: the Pixel Pop desktop screenshot supplied with the request (white 64px navigation, cyan field, pixel octopus portal, hard ink shadows, work cards).
- Implementation constraint: only repository PFP, portrait, project captures, career media, and BLOG covers were used. No generated or stock imagery was added.

## Compared state

- Browser: Codex in-app browser.
- Desktop viewport: 1440 × 1024 CSS px, density 1.
- Mobile viewport: 390 × 844 CSS px, density 1.
- Routes: `http://localhost:3000/ko`, `/ko/about`, `/ko/portfolio`, `/ko/projects/alphaduo`, and `http://blog.localhost:3000/ko`.

## Evidence

- Final desktop implementation: `artifacts/qa-pixelpop/home-1440x1024.png` (1440 × 1024 pixels).
- Final mobile implementation: `artifacts/qa-pixelpop/home-390x844.png` (390 × 844 pixels).
- The source screenshot and the final desktop capture were reviewed together in the same visual comparison context. The source is a user-provided conversation image rather than a file that can be copied into the repository; the packaged HTML above is the durable source path.
- Focused-region review covered the header, hero headline/PFP portal, marquee, first WORK row, mobile menu, and BLOG header/cards. No additional crop was needed because all target-critical regions were readable in the full capture.

## Findings and iteration history

1. **[P2] Mobile menu target was undersized.**
   - Fix: raised the menu control and public BLOG links to a 44px minimum target.
   - Evidence: responsive Playwright check now passes at 390px.
2. **[P1] Pink foreground combinations did not meet WCAG AA.**
   - Fix: retained the pink field while switching small foreground text to ink/deep rose where required; added specific contrast coverage for project and career surfaces.
   - Evidence: axe serious/critical violations are 0 on home, project, career, Lab, and BLOG host.
3. **[P2] Career surface overflowed at 200% text zoom.**
   - Fix: added shrink/wrap safeguards for metric, engagement, and case cells.
   - Evidence: 200% reflow check passes without horizontal overflow.
4. **[P1] Legacy project hash anchors disappeared with the simplified project layout.**
   - Fix: restored `#signal`, `#build`, `#proof`, and `#next` anchors on the Pixel Pop case study.
   - Evidence: legacy redirect/hash tests pass.

## Fidelity surfaces

- **Typography:** NeoDunggeunmo is used for the mark, labels, marquee, status chips, and locale control; Noto Sans KR remains the readable body/display family. Headline weight, white ink shadow, and Korean wrapping match the selected direction.
- **Layout rhythm:** centered 1060px frame, 64px sticky header, cyan hero, 3-column work cards, dark career band, hard 2–3px ink borders, and 4–8px offset shadows match the handoff.
- **Colors:** cyan `#35B5E5`, ink `#101418`, paper `#FFFFFF`, and pink `#F55C7A` remain the visual palette; small-text variants were darkened only to achieve AA contrast.
- **Assets:** the real octopus PFP, operator portrait, project captures, career assets, and post covers are placed in the matching slots with `object-fit` and pixel rendering where appropriate.
- **Copy:** natural Korean presentation copy was used; project, career, and BLOG facts come from the existing localized content model.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Production build: passed. One existing Turbopack filesystem-tracing warning remains in the BLOG editor's local persistence path.
- Content suite: 25 passed.
- E2E suite: 32 passed, including locale routing, blog rewrites, legacy redirects, invalid slugs, writer route, reduced motion, 44px targets, 200% zoom, and axe.

## Final result

passed
