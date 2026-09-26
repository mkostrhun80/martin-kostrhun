# Martin Kostrhun — implementation and Purple Lens

## Source availability
The workspace contained only AGENTS.md and an empty sources directory. No original application, legal documents, logos, photographs or working form backend was supplied. The original website could not be located in a focused public search. No existing files in sources were changed.

## Stack and running
React 19 + TypeScript, Vinext/Vite starter. `npm run dev` (port 5173), `npm run build`, `npx tsc --noEmit`, `npm run lint`.

## Content and integrations
- Edit `lib/site-config.ts`: all photographs, social URLs, appointment URL, original legal texts and regulatory footer.
- All current photographs show an AI-generated fictional model, NOT Martin. Captions and alt text disclose this. Replace the five central asset references and set isPlaceholder to false after providing real portraits; remove placeholder captions at that point.
- `lib/content.ts` contains service copy and document links. Institutions are textual names from the user's brief, not newly invented partnerships or recreated logos.
- The LinkedIn profile found via public search matches Martin Kostrhun, eDO finance and Hradec Králové. Instagram and Facebook remain null and are not shown.
- `contactEndpoint` is null. The form validates and constructs a mailto draft, with explicit notice that nothing has been sent. The user must send in their email app.
- For delivery, add a real same-origin POST endpoint accepting `{name, contact, topic, message}` and returning `{ok:true}` only after confirmed delivery. Configure recipient server-side, validate/limit input server-side, implement rate limits and delivery errors, and provide the actual privacy information before enabling.
- No invented licensing or regulatory claims. Legal pages clearly identify missing source text. The original regulatory footer remains null until supplied.
- No analytics, external font requests or social feed embeds. Hero interaction has no persistent storage. Hosting authentication may use platform cookies.

## Purple Lens hero
- The existing homepage concept is preserved. Two aligned hero scenes reveal a purple duotone portrait and outlined typography through a CSS ellipse mask.
- `components/site/Hero.tsx` provides the composition; `app/hero-lens.css` its responsive layers; `lib/purple-lens-controller.ts` manages events and animation; `lib/lens-physics.ts` contains the time-based spring.
- Pointer inertia, a small velocity-based deformation and capped photo parallax run only while needed. Animation stops at rest, offscreen and in background tabs. No WebGL or additional animation library is loaded.
- Click or first native scroll starts an 800 ms expansion and then settles the hero. Scrolling is never cancelled or locked. Keyboard activation transfers focus to the hero CTA when the lens control disappears.
- Touch dragging tracks the active pointer, preserves vertical scrolling and suppresses accidental activation after a drag. Small screens omit optical displacement and deformation.
- Reduced motion uses a static lens composition and reacts to changes in the OS preference.
- Replace `assets.heroPortrait`, `assets.heroPortraitSmall` and `assets.heroLensPortrait` in `lib/site-config.ts` to update the two scenes.

## Verified sources (2026-09-25)
- User brief: name, contact, address, IČO, data box, service copy, named institutions.
- https://cz.linkedin.com/in/martin-kostrhun-61059936b
- https://www.edofinance.cz/cz/ke-stazeni
- https://www.edofinance.cz/cz/gdpr
- Complaint procedure: https://www.edofinance.cz/dt/92ff051749.pdf
- Whistleblowing: https://www.edofinance.cz/dt/b225d73b99.pdf
- https://www.cnb.cz/cnb/jerrs
- https://financniarbitr.cz/cs/informace-pro-verejnost/caste-otazky.html
- https://coi.gov.cz/informace-o-adr/

## Before replacing an existing public website
Bring in original legal and regulatory texts and validate identity-specific content. Replace fictional photographs and text-only institution names with supplied approved assets. Connect the existing form/backend if available. This deliverable is a private first version, not a claim of production legal completeness.

## Checks completed
- TypeScript and ESLint: passed.
- Production build: passed.
- Browser widths 320, 390, 768 and 1440 px: no document horizontal overflow.
- Fullscreen menu open/close and Escape; service keyboard expansion; all three legal routes.
- Form invalid contact rejected; valid input creates a mailto draft without sending; subsequent edits invalidate the old draft.
- Placeholder portrait optimized to WebP (34 KB large, 11 KB small), hero srcset, lazy secondary images, local fonts.
- Local hot reload briefly required a full page refresh after new dependencies were first loaded; fresh navigation worked.
- External eDO PDF links were discovered on the official documents page. A separate direct HTTP check was blocked by approval-service quota and was not completed.
- Final menu visual check found a Tailwind translate property persisting on the fullscreen dialog; explicitly reset `translate:none` so the overlay fills the viewport.
- Purple Lens: all 8 controller/physics tests pass (`node --import tsx --test tests/purple-lens.test.ts`), including pointer inertia, idle frame shutdown, touch drag, scroll, keyboard focus, reduced motion and cleanup. TypeScript, ESLint and the production build pass.
- Browser checks: desktop pointer inertia and labels; native scroll; keyboard/click expansion; mobile layouts at 320 and 390 px without horizontal overflow. Touch and reduced-motion behavior were checked through simulated browser-event tests, not on a physical phone. Device frame rate has not been measured.
- Hosting check on 2026-09-26 found an independently published version 1 with different source and an abstract hero. Its source was retrieved into `../website-publish` for inspection. The current local portrait/Purple Lens version has not replaced it; approval to resolve the conflicting versions is pending. Reuse the project_id in .openai/hosting.json.
