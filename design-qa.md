# BLOG redesign — design QA

## Source of truth

- Selected direction: option 3, black fixed identity rail with a foam editorial archive surface.
- Reference image: `/Users/nimdal/.codex/generated_images/019f78ec-95fd-7bc0-8fd7-2d219b35bacb/exec-97ef49bc-0d50-458f-968c-835884ab2062.png`
- Content constraint: only repository PFP and the three real post covers were used. Invented reference titles, dates, and images were not copied.

## Compared state

- Browser: Codex in-app browser
- Desktop viewport: 1440 × 1024
- Mobile viewport: 390 × 844
- Public route: `http://blog.localhost:3000/ko`
- Detail route: `http://blog.localhost:3000/ko/posts/nimdal-logbook`
- Auth route: `http://localhost:3000/write`

## Evidence

- Final desktop implementation: `audits/2026-07-20-blog-redesign/implementation-1440x1024-final.png`
- Same-size source/implementation comparison: `audits/2026-07-20-blog-redesign/comparison-1440x1024-final.png`
- Mobile implementation: `audits/2026-07-20-blog-redesign/implementation-390x844.png`
- Post detail: `audits/2026-07-20-blog-redesign/post-detail-1440x1024.png`
- Writer login: `audits/2026-07-20-blog-redesign/write-login-1440x1024-final.png`

The full-view comparison exposed the relevant rail, type scale, gutters, image crop, archive rhythm, and color relationships at once. A separate focused crop was not required because no target region was obscured or too small to judge at original resolution.

## QA history

1. Initial comparison found the page title, featured title, and archive titles visually heavier than the selected reference (P2).
2. The three title scales were reduced and the desktop state was recaptured at the same effective viewport.
3. The final side-by-side comparison matched the selected rail width, editorial hierarchy, cyan/coral accents, image proportions, and archive rhythm. Remaining title, date, and thumbnail differences are intentional because the implementation uses the repository's real content only.
4. Mobile reflow, category active state, KO/EN same-slug links, article layout, and the fail-closed writer login state were checked in the in-app browser.
5. A local cross-origin development warning prevented client hydration in automated tests (P1). `allowedDevOrigins` was added for the documented local hosts; the complete suite then passed.
6. The last browser pass found a duplicate-cover LCP warning (P2). The matching archive thumbnail now loads eagerly with the featured cover; a fresh tab confirmed no warning or implementation error.
7. Korean titles now keep whole words together, BLOG metadata no longer repeats the brand in the document title, and the remaining abstract Korean closing metaphor was replaced with direct copy.
8. Writer validation now names the exact field, opens the matching language panel, focuses the invalid control, and bypasses hidden native-required controls. Development persistence is locked to local files even when production GitHub variables exist.
9. The final automated suite passed 39 checks, including writer allowlist policy, unverified Google accounts, local-only development persistence, structured-data escaping, media/tag validation, host routing, SEO routes, 404s, touch targets, and axe.
10. The article body document root now renders as a neutral `div`, removing the nested article landmark; the post metadata test covers the final DOM structure.

## Findings

- P0: none
- P1: none remaining
- P2: none remaining
- Browser console: no implementation error or warning in the fresh final tab.
- Accessibility: automated axe serious/critical violations: 0.
- Interaction: category filtering, localized routes, canonical redirects, 404s, reduced motion, keyboard focus, and 44px touch targets passed automated checks.

## Final result

passed
