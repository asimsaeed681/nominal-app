# Build notes

Decisions made while building, and what each phase did. Newest at the bottom.

## Phase 4: Check-in

- Built Stepper, Segmented (native radios), ToggleTile, InfoSheet (native modal `<dialog>`: side panel from 768 px, bottom sheet below) and ReactionTest (SPEC 7). The CheckIn wizard has 7 deep-linkable steps (`#/checkin/<step>`), Enter = Next, and inline status chips on Measure.
- Save writes today's check-in to `lib/storage.ts` (memory + localStorage, try/catch), goes to Status, and shows the "Changed: X A → B" banner and 2 px `--info` borders on the changed rows for this session. `resetCheckIn()` is exported from `lib/storage.ts`.
- Fixes: MasterStatus uses plurals ("2 WARNINGS"). ISS Distance reads "real time". `<main>` now scrolls to the top on every route change, so the saved banner is visible.

Decisions:
- The 8.2 single-reading ranges (BP, HR, temperature, blood sugar, reaction %) moved into exported helpers in `evaluate.ts`, so the Measure chips and the engine always agree.
- A saved check-in is stored with the real date. One from an earlier date is ignored, because MET day 118 is always "today".
- Measure inputs accept only plausible ranges (for example systolic 60 to 250). Outside them, Next is disabled and a short hint shows. They are typo guards, not clinical limits.
- On the Reaction step, Next is enabled only after a finished test. "Skip test" saves no reaction value and goes to Review.
- The Body (symptoms) step's info link shows Vision. The Review step's link shows Radiation dose and Cabin CO2.
- `src/data/indicators.ts` has short placeholder text, to be replaced.

## Phase 5: Body

- BodyFigure.tsx draws the figure as a 360 x 640 SVG of circles and rounded rectangles, mirrored about x = 180, with a dash-dot centre line. It sits in a 600 x 700 frame that leaves room for side labels. The 9 markers and 10 labels are HTML buttons placed by percentage, and the whole-body label sits at the bottom with a dashed outline.
- Body.tsx shows the detail panel: name and chip, NASA risk (exact names, Brain lists both), what it does, how space affects it, your readings, how to check, and a procedure button when one is triggered. The worst region is selected by default.
- evaluate.ts checks now carry structured readings, and regions expose `readings` and `procedures`. Hazard results are unchanged (evaluate.check.ts still passes and now also checks that every region has readings). The new `useMission(profile)` hook in storage.ts gives every screen the same history and evaluation.

Decisions:
- Under 640 px, the side labels would overlap. There the figure keeps its markers, and the labels become a 2-column button list under it.
- Label heights were set so labels on one side are at least 80 units apart. Brain sits above Inner ear above Airway on the left, so no leader lines cross.
- Readings that need today's check-in show "No check-in yet" with no chip. Congestion and skin irritation have no rule in SPEC 8.2, so their rows show Reported or None with no chip.
- The Body copy (what it does, how space affects it, how to check) is placeholder text in `src/data/regions.ts`.

## Phase 6: Procedures

- `src/data/procedures.ts` now holds all 7 procedures: title, linked hazard, an optional CAUTION or WARNING block, and 5 to 6 placeholder steps (some with lettered sub-steps). Each one ends with a CMO or downlink step. `procedureTitles` is derived from it.
- The list (`#/procedures`) shows ID, title, why it is recommended now (the engine's own finding sentence) or "Not triggered", and the linked hazard's chip. Triggered procedures come first, warnings before cautions. ProcedureView (`#/procedures/<id>`) has the header, "Why this is open", the status block, 24 px step checkboxes and Mark complete.
- Mark complete logs `{ id, time }` in `lib/storage.ts` (memory + localStorage, today only) and shows "MED-SLP-01 completed MET 118 07:32". `evaluate()` now returns `triggers` (the reasons each procedure is open), which feed both views.

Decisions:
- Only numbered steps have checkboxes. Lettered sub-steps are plain text under their step.
- A completed procedure shows its steps checked and locked. `resetCheckIn()` also clears today's completions, so "Reset demo data" on About resets everything.
- An unknown ID in `#/procedures/<id>` shows the list with a one-line note, not an error page.
- The localStorage format is now `{ date, value }` for every key, so a check-in saved by the phase 4 build is ignored once.

## Phase 7: Trends

- TrendPanel.tsx is a hand-written SVG small multiple, 100% wide and 120 px tall, measured with a ResizeObserver so it draws in real pixels (the dot stays round and text never stretches). It has the baseline band (mean ± 1 SD of days 1 to 14, `--text` at 6%), a 2 px `--text` line with gaps for missed days, a 6 px end dot in the indicator's status color, dashed SPE (day 97) and CO2 (day 110) markers, and 3 short ticks with Mono values.
- Trends.tsx shows the 8 panels in SPEC order: 2 columns from 768 px, 4 from 1400 px. The Segmented toggle switches between "Last 30 days" and "Whole mission". The career dose panel has the dashed `--warning` 600 mSv "NASA career limit" line.
- Evaluate readings now carry a `TrendId`, so each chart's dot and delta color come from the engine's status for that indicator, not a second set of thresholds.

Decisions:
- Career dose is a running total, so it has no baseline band and no % delta. It shows "% of limit" instead.
- The delta is colored only when the latest value is outside the band, and only with a CAUTION or WARNING color. Outside the band while NOMINAL stays plain text, so green is never used just for decoration.
- "3 faint horizontal ticks" are short 6 px tick marks at the left with values, not full-width gridlines.

## Phase 8: Downlink, About, page basics

- Downlink builds one plain-text, telemetry-style report from the live evaluation: header, each hazard with findings and procedures, procedures completed today, and the crew note. The same text is previewed, downloaded as `nominal-report-met-118.txt`, and queued. Queuing starts a live mm:ss countdown of the profile's OWLT that ends at "Received at MCC" (straight away on ISS).
- About has every SPEC 6.6 section, the NASA and CSA sources (`src/data/sources.ts`), a References list (React, Vite, TypeScript, Tailwind CSS, Lucide, IBM Plex under the SIL OFL, Fontsource, and the NASA and CSA pages), and a "Reset demo data" text button that calls `resetCheckIn()`.
- Page basics: `public/favicon.svg` (32 px, 4 px radius `--nominal` square with a black check), theme-color, Open Graph and Twitter tags, and a README with the AI disclosure. `hazardNames` now lives once in `evaluate.ts`.

Decisions:
- The report keeps SPEC 6.5's telemetry style: uppercase field names (CREW, MET, STATUS) and singular counts ("2 WARNING"). That matches the spec's example, not MasterStatus.
- "Next contact window: in 41 min" is fixed simulated text. On ISS it reads "open now".
- The queued report and its countdown live in memory for the session only. `resetCheckIn()` clears them too.
- `og:image` points to `/og.png`, which does not exist yet. SPEC 11 says to make it later from a real screenshot. Add it before deploying.
- The Hassler et al. 2014 Mars-surface DOI (10.1126/science.1244797) and its 0.64 mSv a day need the Gemini verify step (SPEC 8.4).
- "How we used AI" says the explanations and procedure steps were drafted with AI help and checked by the team. Edit it if the final text comes from the Gemini research step.

## Self-check (SPEC 4.6, 10, 11b)

- Scanned all of `src/`, index.html, README and the favicon. No em or en dashes, no exclamation marks, no banned words ("AI-powered", "smart", "seamless", lorem). No gradients, shadows, blur or animations. Every source file starts with the AI-assistance comment. Each screen renders exactly one H1.
- Fixed: the InfoSheet backdrop used Tailwind's `black`, which is not a token. It now uses `--bg` at 80%. No other hex or palette color is used outside `index.css` (the favicon's `#3DD68C` is the `--nominal` value, as SPEC 11 asks).
- Kept: `rounded-full` only on the Body markers (SPEC 6.7: 14 px circles) and the 8 px "Sensors live" dot (SPEC 5). Neither is a pill. Uppercase appears only on status words (chips, master bar, Body labels, the saved banner, procedure blocks) and the wordmark. The Downlink report's telemetry labels are the exception, as SPEC 6.5's example shows.

Not checked here (needs a browser, which was off for this run): layout at 1280 x 800, 1440 x 900 and 390 px for Body, Procedures, Trends, Downlink and About, plus Lighthouse accessibility and contrast. Before deploy, also run "Pre-Launch Checklist" and "Performance Optimization Checklist" from the Obsidian playbooks, and add `/og.png`.

## Final content, report plurals, og.png, launch checklists

- Content: `indicators.ts`, `regions.ts` and `procedures.ts` hold the reviewed text from CONTENT.md, word for word, with the types unchanged. A script compared every name, step, block and sentence with CONTENT.md: all match. About has the new "How we used AI" paragraph and the 3 extra sources from CONTENT.md section 5.
- Downlink report: `STATUS    2 WARNINGS  1 CAUTION  2 NOMINAL`. It uses MasterStatus's `plural` (now exported), so the two always agree. Checked in the downloaded .txt.
- `public/og.png`: a real 1200 x 630 screenshot of Status from headless Chrome, with the dev server started and stopped for it.
- Launch checklists: every item is in the tables below.

Decisions:
- CONTENT.md keys mapped to the code IDs: bp = bloodPressure, hr = heartRate, temp = bodyTemp, glucose = bloodSugar, mass = bodyMass, dose = radiation.
- Indicator names follow CONTENT.md, so Sleep is now "Sleep hours" and Exercise "Exercise minutes". They only show as the info sheet title.
- Straight apostrophes stay as CONTENT.md has them (the old placeholders used curly ones). Strings with an apostrophe use double quotes, as `evaluate.ts` already does.
- CONTENT.md changes some block levels: MED-MOD-01 gets a CAUTION block, MED-CO2-01 goes from CAUTION to WARNING, MED-VIS-01 from WARNING to CAUTION. No procedure has lettered sub-steps any more; the `Step` type still allows them.
- The "Trigger:" lines are not stored: the `Procedure` type has no field for them (kept as asked), and the screens already show the live reason from the engine. Checked against `evaluate.ts`: SLP, SPE, VIS and EXR match. MOD and CO2 open on either condition (low mood or high stress; high CO2 or headaches) where CONTENT.md says "and" / "with".
- MED-FTG-01 mismatch, left for you to decide: the engine opens it from 12% slower (CAUTION), but CONTENT.md says its trigger is 22% or more. In the demo it opens at 16% slower and shows its WARNING no-go block. To match CONTENT.md, link `'MED-FTG-01'` in `evaluate.ts` only when `reactionStatus(slow) === 'warning'`. I did not change the engine because this step was text only.
- Content issue, kept word for word: Bones "How to check" says "the estimated bone loss in Trends", but Trends has no bone loss chart. It is on Body and in the Status Gravity row. Fix the sentence or add a chart.
- "How we used AI" is CONTENT.md's 3 sentences (SPEC 6.6 says 2). It no longer says "reviewed by the team" word for word; README, package.json and every file header still do (SPEC 11b).
- Sources: NASA-STD-3001 Volume 1 links to its NASA Technical Standards page, Zeitlin et al. 2013 to DOI 10.1126/science.1235989. The existing Hassler et al. 2014 entry now uses CONTENT.md's wording instead of getting a duplicate. The SwRI cruise page stays. This closes the phase 8 "Gemini verify step" item.
- The report now uses plurals, which replaces the phase 8 decision to keep SPEC 6.5's singular "2 WARNING". `plural` now tests `n === 1`, so a zero reads "0 WARNINGS"; MasterStatus never shows a zero, so it looks the same. NOMINAL stays "2 NOMINAL": it is a status word, and MasterStatus never pluralizes it either.
- og.png: a 1280 x 630 viewport (the top bar and the whole rail fit), clipped to 1200 x 630 from the top left. That cuts the right 80 px: the end of "Sensors live", the master bar's MED-CO2-01 button, "Start check-in" and the edge of Next actions. Any other crop cuts the wordmark and the rail instead. No check-in is saved, so it shows the demo state, 2 WARNINGS and 1 CAUTION. Retaken after the contrast fix below so it shows the shipped colors.
- `--text-3` is now `#7D8692` instead of SPEC 4.2's `#6B7480`, which failed AA for its 13 px text (4.1, 3.9 and 3.6 : 1 on bg, panel and panel-2). Now 5.3, 5.0 and 4.6 : 1, still clearly dimmer than `--text-2`. Every other color pair already passed.
- About gets a short "Privacy" section (not in SPEC 6.6) for the privacy and data disclosure items.
- Each screen sets its own tab title ("Check-in · NOMINAL"). Status keeps "NOMINAL: Astronaut Health Self-Check", the title search engines see for the home page. `navItems` is exported from NavRail for the labels.
- Security headers live in `vercel.json`. The CSP is `default-src 'self'`, so the 404 page uses a CSS file, not inline styles. Tested with a local server that sends the same headers: every screen, a procedure, the check-in measure step and the 404 page load with zero console errors and no CSP reports, and Download .txt still saves the report.
- No canonical tag yet: it needs the production URL, and Vite rejects a relative `href="/"` as an asset path. `og:image` is still the relative `/og.png`, which X and LinkedIn will not show. After deploy, add `<link rel="canonical" href="https://DOMAIN/" />` and `og:url`, and change `og:image` to `https://DOMAIN/og.png`.
- No analytics, on purpose: the app promises to work offline and send nothing, and the Privacy section says so. Vercel Web Analytics can be turned on later if you change that text.

### Pre-Launch Checklist

| Item | Status | Why / what changed |
|---|---|---|
| Privacy policy page | Fixed | "Privacy" section on About. The app collects nothing, so a short statement is the whole policy. |
| Terms & conditions page | Not applicable | No accounts, purchases, uploads or user content. |
| Data disclosure | Fixed | Same section: what is stored (today's check-in, completed procedures), where (this browser's local storage) and how to delete it. |
| AI usage disclosure | Already fine | About, README, package.json and every file header. About now names Claude and Gemini. |
| Self-harm response handling | Not applicable | No chat or AI interaction. Low mood already routes to the CMO and the flight psychologist (MED-MOD-01). |
| Secrets off the frontend | Already fine | No API keys, tokens or env vars, and no network calls. |
| Force HTTPS | Already fine | Vercel redirects HTTP to HTTPS; `vercel.json` adds HSTS. |
| Cookie consent banner | Not applicable | No cookies or tracking. |
| Storage buckets private | Not applicable | No storage buckets. |
| Spam protection on forms | Not applicable | Nothing is submitted to a server. |
| No exposed source maps | Already fine | The build emits no `.map` files (checked `dist/`). |
| Unique title per page | Fixed | Per-screen tab titles, checked in Chrome on every screen. |
| Meta titles and descriptions | Already fine | One HTML document with both; the hash screens are not separate pages for crawlers. |
| Open Graph tags | Fixed | `/og.png` exists now, plus `og:image:alt`. Make `og:image` absolute after deploy (see decisions). |
| Favicon and tab title | Already fine | |
| Sitemap.xml and robots.txt | Fixed (robots.txt) | `public/robots.txt` allows every crawler, AI ones included. No sitemap: its URLs must be absolute, the domain is not known yet, and the site is one URL. |
| llms.txt | Fixed | `public/llms.txt`. |
| Structured data | Fixed | schema.org `WebApplication` JSON-LD in `index.html`. |
| One H1 per page | Already fine | Exactly one on every screen and on the 404 page (checked in Chrome). |
| Canonical tag | Not applicable yet | Needs the production URL (see decisions). |
| `lang` on `<html>` | Already fine | |
| Alt text on images | Already fine | No `<img>` in the app; charts are `role="img"` with labels; the body figure is decorative behind labelled buttons. Added `og:image:alt`. |
| Custom domain | Not applicable | A deploy choice outside the repo (PLAYBOOK uses the vercel.app URL). |
| View-source not empty | Fixed (partly) | A `<noscript>` block with the H1 and a summary. No prerendering: the first render reads the clock, the URL hash and local storage, so server HTML would not match. |
| CTA above the fold, sticky mobile CTA | Already fine | Status opens with "Start check-in" or the first procedure; on phones the bottom bar keeps Check-in one tap away. |
| One clear call to action | Already fine | |
| 5 FAQs | Not applicable | A tool, not a marketing page; SPEC allows no extra sections and About answers what judges ask. |
| Thank-you page after submit | Already fine | Saving shows the "Check-in saved. Changed: ..." banner; queuing shows the countdown. |
| Custom 404 page | Fixed | `public/404.html` and `404.css` for unknown paths. Inside the app, unknown routes already open Status. |
| No broken links | Already fine | All 17 external links respond. science.org blocks scripts (403), but both DOIs resolve through doi.org. |
| Form validation | Already fine | Measure inputs only accept plausible ranges; the crew note is free text, shown only as text. |
| Loading states | Not applicable | Nothing loads after the first paint. |
| Response time promise | Not applicable | No support channel or inbox. |
| Real reviews only | Already fine | No reviews or counters; the streak and routine numbers belong to the simulated astronaut, labelled as simulated on About. |
| Compress images | Already fine | The only image is og.png (75 KB, fetched only by link previews) and a 341-byte SVG favicon. |
| Check page load speed | Not done | Sizes measured (see Performance); Lighthouse not run (see Audit). |
| Fix color contrast | Fixed | `--text-3` (see decisions). |
| Mobile-friendly | Already fine | Every screen at 390 px in Chrome: no sideways scroll, the layout stacks. |
| Zero console errors on load | Already fine | Zero errors or warnings on every screen, production build with the CSP on. |
| JS bundle size | Already fine | See Performance. |
| Analytics | Not applicable | On purpose (see decisions). |

### Performance Optimization Checklist

| Item | Status | Why / what changed |
|---|---|---|
| All 7 backend items (API cache, load balancer, indexes, query cache, N+1, pooling, payload compression) | Not applicable | No backend, API or database. |
| Split code into chunks | Not applicable | One 76 KB gzip bundle. Lazy chunks would need the network when a later screen opens, which breaks working offline once the app is loaded. |
| Lazy loading | Not applicable | Same reason, and there are no images in the app. |
| Defer non-critical scripts | Already fine | One module script (deferred by default), no third-party scripts. |
| Minify JS and CSS | Already fine | Vite production build. |
| Avoid unnecessary re-renders | Already fine | The MET clock re-renders only the top bar; the evaluation is memoized per profile and check-in. |
| Debounce input handlers | Not applicable | No handler does network or heavy work. |
| Paginate large lists | Not applicable | The longest list has 13 items. |
| Remove unused dependencies | Already fine | All 5 dependencies and 7 dev dependencies are used. |
| Check/reduce JS bundle size | Already fine | JS 236 KB (76 KB gzip), CSS 25 KB (6 KB gzip), 5 woff2 fonts, 100 KB. Most of the JS is React DOM. |
| Add CDN | Already fine | Vercel serves static files from its CDN. |
| Server-side caching | Fixed | `/assets/*` (hashed file names) get `Cache-Control: public, max-age=31536000, immutable` in `vercel.json`. HTML keeps Vercel's default, so a new deploy shows at once. |
| Compress images | Already fine | See Pre-Launch. |
| Loading skeletons | Not applicable | See Pre-Launch. |
| Run a Lighthouse audit | Not done | The C: drive ran out of space during this session (0 bytes free at one point), so I did not install Lighthouse. Its main checks were done by hand above: contrast, titles, H1s, console errors, mobile layout, sizes. After deploy, run the URL through pagespeed.web.dev (no install needed). |

### AI-Generated Look: Red Flags

| Item | Status | Why |
|---|---|---|
| Purple gradient backgrounds | Already fine | No gradients or purple anywhere. |
| Vague hero text | Already fine | No hero; Status opens with live data. |
| Fake counters, reviews, metrics | Already fine | None; simulated data is labelled as simulated. |
| Pill-shaped buttons | Already fine | 4 px radius everywhere; `rounded-full` only on the 14 px body markers and the 8 px sensor dot. |
| Overused emoji as icons | Already fine | No emoji; Lucide icons. |
| Excessive scroll animations | Already fine | Only 150 ms color fades, off with reduced motion. |
| Cursor-follow animations | Already fine | None. |
| AI-generated stock images | Already fine | None; og.png is a real screenshot. |
| Em dashes in copy | Already fine | See the step 5 search below. |
| "Made with AI" badge | Already fine | None; the disclosure is plain text, as the Space Apps rules ask. |
| Copy that reads as AI-written | Already fine | The copy is the team's reviewed CONTENT.md text; the new bits (Privacy, 404 page, noscript, llms.txt) use the same plain style. |

### Security Checklist: Pre-Launch

The 7 "start here" items are the same as rows 1, 3, 4, 7, 11, 12 and 14.

| Item | Status | Why / what changed |
|---|---|---|
| 1. Keys and secrets on the server | Already fine | There are none; the app calls no API. |
| 2. Secrets out of Git history | Already fine | Checked every commit: no `.env`, key or token file was ever committed. Added `.env` to `.gitignore` as a guard. |
| 3. Public database key only | Not applicable | No database. |
| 4. Row-level security | Not applicable | No database. |
| 5. Encrypt sensitive data | Not applicable | No server storage. The check-in stays in the user's own browser; encrypting it with a key shipped in the same page would add nothing. |
| 6. Auth enforced on the server | Not applicable | No server, no accounts. |
| 7. Record ownership checks | Not applicable | No server-side records. |
| 8. Only accept allowed fields | Not applicable | No endpoints. Saved data is shape-checked when read back from local storage. |
| 9. Session tokens in secure cookies | Not applicable | No sessions or tokens. |
| 10. Hash passwords | Not applicable | No login. |
| 11. Rate-limit the API | Not applicable | No API. |
| 12. Billing caps and alerts | Not applicable | No paid services. If the Vercel project is on a paid plan, turn on spend alerts there. |
| 13. Bot protection on forms | Not applicable | Nothing is submitted. |
| 14. Parameterized queries | Not applicable | No database. |
| 15. Validate and sanitize input | Already fine | No server. Measure inputs are range-checked; stored data is shape-checked on load. |
| 16. Escape user content | Already fine | React escapes all text; no `dangerouslySetInnerHTML` or `innerHTML`. The crew note and an unknown procedure ID in the URL show as plain text. |
| 17. File uploads | Not applicable | None. |
| 18. Excess data in responses | Not applicable | No API. |
| 19 and 20. Payments | Not applicable | No payments. |
| 21 and 22. AI features | Not applicable | No AI calls. |
| 23. Force HTTPS | Already fine | Vercel redirects to HTTPS; HSTS added in `vercel.json`. |
| 24. Security headers | Fixed | `vercel.json`: Content-Security-Policy, X-Frame-Options DENY, X-Content-Type-Options nosniff, Strict-Transport-Security. Tested locally with the same headers (see decisions). |
| 25. Debug mode, source maps, `.git` | Already fine | Production build, no source maps, and only `dist/` is deployed, so `.git` is never served. |
| 26. Secrets in error messages | Not applicable | No server, no secrets; the app does not log. |
| 27. Dependencies updated | Already fine | `npm audit`: 0 vulnerabilities. React 19 is out, but SPEC pins React 18, so it stays. |
| 28. Logging and monitoring | Not applicable | No server. Vercel keeps request logs. |
| 29. Backups | Not done | No database, but the repo has no remote yet and lives only on this laptop. Push it to GitHub (PLAYBOOK step 12). |
| 30. Two-factor on your accounts | Not applicable (not code) | Turn on 2FA for GitHub, Vercel and the email account behind them. |
| Prompt 1: secret leak pass | Already fine | No secrets anywhere (rows 1 and 2). |
| Prompt 2: personal data flow | Already fine | Collected: the check-in values typed in. Stored: this browser's local storage, today only. Sent: nowhere; no third-party SDKs, no logs. Deleted: Reset demo data on About. |
| Prompt 3: pre-deploy audit | Fixed | Headers added. No env vars, no debug code (the only `console.log` calls are in the dev-only `evaluate.check.ts`), no auth, CORS or database. |
| Prompt 4: deep audit | Not applicable | No auth, payments or SQL; XSS is row 16. |
| Prompt 5: attacker's view | Already fine | No server IDs to change, no admin pages, no `.env` or `.git` served. If Directory Listing is on in the Vercel project settings, `/assets/` lists the built files (all public anyway); switch it off if you prefer. |
| Mobile app items | Not applicable | A web app. |

Not checked here: Lighthouse (above); the 1440 x 900 layout; the real Vercel responses. The headers and the 404 page were tested against a local server that copies `vercel.json`, so after deploy run `curl -I https://DOMAIN/` and open `https://DOMAIN/nope` once.

Em dashes (step 5): searched all of `src/` for em dashes as characters, as UTF-8 bytes and as `&mdash;` or U+2014 escapes, plus en dashes, `index.html`, `public/`, README, NOTES and the built bundle. None found, so nothing was removed.

## Review fixes

- Reaction test: timing starts at the first animation frame after the counter is painted. React commits the counter, a layout effect waits two frames, and the second frame's requestAnimationFrame timestamp is the start. The reaction time is the input event's own `timeStamp` minus that start, so main-thread delays no longer count. Both are on the `performance.now()` clock that SPEC 7 asks for (checked in Chrome). The running number is written straight to the DOM through a ref, so no React render runs while the astronaut reacts. Input is pointerdown on the panel and keydown for Space (repeats ignored).
- Body: the outline was already mirrored, but an 18 px marker is bigger than an eye or an ear on screen, so the Eyes marker hid the right eye and the Inner ear marker hid the left ear. The eyes moved apart (x 162 and 198) with the Eyes marker between them, and the Inner ear marker sits on the top of the left ear, so the ear shows below it. The Brain marker moved up 4 units so it stays clear of the Eyes marker at 390 px. The Eyes label moved up so its leader passes above the right eye and ear. The weekly vision check reading now says "Normal" (value and baseline).
- Trends: the H1 and the toggle share one row, centred on each other, down to about 340 px wide. The "Time range" legend is screen-reader only there (new `hideLabel` prop on Segmented). Every baseline band is at least 8 px tall, centred on the baseline, so Stress (flat at 2) shows its band.
- Downlink: the subline had no double spaces in the text; a Mono space is as wide as a digit and looked like two in the Sans sentence. Numbers and units stay Mono, and the space between them is now the sentence's own. On ISS, "real time" and "open now" are plain text.
- %: the radiation key is now "47%" plus "of limit", so the hazard table, the Downlink report and the check output all read "47% of limit". It was the only value with a space before a %.

Decisions:
- "Inner ear marker on the left ear" means the ear on the left of the screen, the side its label is on. A marker centred on the ear hides it, so the marker sits on the ear's top end.
- "Fully symmetric": the outline is. The heart stays left of centre, where it is in a body (SPEC 6.7, chest).
- "Run the test again" keeps a click: it only starts a run and times nothing, and a click keeps Enter working on it.
- A press after the counter is shown but before the first frame after its paint counts as a false start: the counter was not on screen yet, so it can only be a guess.
- The Body screen already had the H1 "Body" and the SPEC 6.7 subline at the top (checked in Chrome); no change needed.
- Extra fix: the Headache reading said "1 days"; it now says "1 day".
- Checked against the production build in headless Chrome. A full 30 s reaction run with simulated input (one early press, then Space and taps 250 ms after each counter) ended on time with 1 false start and a 294 ms mean; the counter ticked in frame steps. Body, Trends, Downlink and Status were checked in screenshots at 1280 and 390 px, with zero console errors.
