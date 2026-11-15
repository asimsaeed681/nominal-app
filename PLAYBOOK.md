# NOMINAL: Build Playbook (every step, every prompt)

Owner: Asim (COMSATS Orbit Crew, Islamabad). Deadline: **Sunday Nov 15, 2026,
11:59 PM Pakistan time.** Our own deadline: **submitted by 9:00 PM.**

How to use this file: do the steps in order. Each step says WHERE (which
app), WHICH MODEL, the exact PROMPT to paste, and a CHECK you do with your
eyes before moving on. After every build step, send a screenshot to Claude
chat for review.

---

## 0. Rules we must follow (from the Space Apps emails and official guides)

| Rule | Source | What we do |
|---|---|---|
| Submit before 11:59 PM local time, final, no edits after | Project Submission Guide | Submit by 9 PM |
| Demo = video **max 30 seconds** OR **max 7 slides**, hosted outside (YouTube, Drive) | Submission Guide | 30 s video on YouTube (unlisted is fine, it's public by link) |
| Video needs **English subtitles** | Submission Guide | Burn subtitles in with Clipchamp |
| Video timing: team 0:00, challenge 0:02, project name 0:05, idea 0:10, future 0:20 to 0:30 | Submission Guide | Script in step 13 follows this exactly |
| Disclose AI use. AI images/video need a visible watermark. AI code must say so in text and metadata | Submission Guide | No AI images at all. README + About + file headers say "written with AI assistance" |
| No NASA logos, flags, mission identifiers in AI content | Submission Guide | No NASA logo anywhere |
| List ALL external resources (code, text, images, fonts) in References | Judging Guide | References list in step 14 |
| NASA data required for Global Awards | Submission Guide | NASA HRP hazards and risks, NASA radiation limits, Curiosity RAD |
| No personal info (phone, address) on the project | Submission Guide | Only team name on the project page |
| PRC review | Judging Guide | No Chinese mission data used (removed Chang'e-4) |
| Solo team is fine for a Local Event (min 1 person) | Challenge Statements email | Done, team created |
| Judged on: Influence, Creativity, Validity, Relevance, Presentation (Presentation counts as much as the others) | Judging Guide | Demo and project page get real time on Sunday evening |
| Local judging times may differ, check with the Local Lead | Submission Guide | Step 15: check the Islamabad event page |

---

## 1. Tools and models (who does what, and why)

| Job | Tool | Model | Why |
|---|---|---|---|
| Write the code | Antigravity, Claude Code panel | **Opus 5.5** for phases 2, 4, 5 (logic, reaction test, body figure). **Sonnet 5.5** for phases 1, 3, 6, 7, 8, 9 | Opus for the hard reasoning parts; Sonnet is faster and saves battery on screen-building |
| Research and fact checks | gemini.google.com | **Gemini Pro with Deep Research** (or Search on) | Search grounded, cites sources |
| Judge-style review | gemini.google.com | Gemini Pro (normal chat) | A second, independent opinion |
| Plan, spec, review every screenshot, write submission text | Claude chat (here) | | Keeps everything consistent with SPEC.md |
| Images | **None from AI.** Real screenshots of our app only | | Avoids the AI watermark rule and the "AI slop" look |

How to switch model in the Antigravity Claude panel: type `/model` and press
Enter, then pick the model.

**Before every phase in Antigravity:** start a fresh chat (`/clear`) so old
context doesn't waste tokens, then paste the prompt.

**After every phase (protects your work if the power goes):** in the
Antigravity terminal run:
```
git add -A
git commit -m "phase N done"
```

---

## 2. Battery and internet plan

- Do npm installs only once (phase 1). After that everything works offline
  except talking to Claude/Gemini.
- Keep only Antigravity + one browser tab open. Close other apps.
- Screen brightness down. Laptop in "Best battery life" mode.
- Run `npm run dev` only when checking a screen, stop it with `Ctrl + C`
  after.
- If power drops mid-phase: reopen Antigravity, `/clear`, paste
  `Continue the current phase from SPEC.md. Check what already exists in the
  code first, then finish only what is missing.`

---

## STEP 1: Phase 1, frame (tonight)
**Where:** Antigravity, folder `C:\Users\aasim\Projects\nominal`. **Model:** Sonnet 5.5
```
Read SPEC.md fully, and look at design/status-mock.png. Do ONLY Phase 1 from section 13:
scaffold a Vite + React + TypeScript project in this folder (do not delete SPEC.md,
PLAYBOOK.md or design/), install tailwindcss v4 with @tailwindcss/vite, lucide-react,
@fontsource/ibm-plex-sans and @fontsource/ibm-plex-mono. Set up the color tokens from
section 4.2 as CSS variables, the fonts and type scale from 4.3, then build the app frame
from section 5 (top bar with live MET clock and the mission profile switch, nav rail with
all 7 items, bottom bar on small screens) and empty placeholder screens with hash routing.
Follow section 11b (AI disclosure line at the top of each file). Remove all Vite starter
files and logos. Run git init. Run npm run build to check there are no errors. Then stop
and give me a short list of what you made. Do not start Phase 2.
```
**CHECK:** `npm run dev`, open the link. Black screen, `NOMINAL` top left, clock
ticking, 7 nav items on the left, cyan bar on the selected item, no purple,
no rounded pills. Send a screenshot to Claude chat.

## STEP 2: Gemini research (same time as step 1)
**Where:** gemini.google.com, Deep Research. Prompt is in Claude chat
(the "Gemini" prompt with PART 1, 2, 3). Add this line at the end:
`Also confirm: Curiosity RAD dose rate on the Mars surface in mSv per day (Hassler et al. 2014).`
Paste the full answer to Claude chat. Claude turns it into
`src/data/indicators.ts` and `src/data/procedures.ts` content.

## STEP 3: Phase 2, data and logic
**Model:** Opus 5.5
```
/clear first. Read SPEC.md sections 8 and 9 and look at ../astropulse/core/engine.py and
../astropulse/core/simulate.py for the logic to port. Do ONLY Phase 2: build
src/lib/random.ts (mulberry32), src/data/history.ts (seeded history for FE-2, days 1 to
117 plus today's prefill, all events in 8.1, all three mission profiles), and
src/lib/evaluate.ts (all rules in 8.2 including blood sugar and temperature, each finding
a plain sentence with real numbers, overall counts of warnings and cautions, and the
procedure ID linked to each finding). Export clean TypeScript types. Add a tiny dev-only
check (src/lib/evaluate.check.ts) that logs the result for day 118 for each mission profile,
and run it. Show me that output. Do not build any screens yet.
```
**CHECK:** the logged output for Mars transit day 118 should show Isolation =
warning, Environment = caution or warning, Distance = warning. Paste the
output into Claude chat.

## STEP 4: Phase 3, Status screen
**Model:** Sonnet 5.5
```
/clear first. Read SPEC.md sections 4, 5 and 6.1 and look at design/status-mock.png. Do
ONLY Phase 3: build StatusChip, MasterStatus, HazardTable (with expandable rows and a small
sparkline using a simple SVG component) and the Status screen, including Next actions,
Due today and Routine panels, wired to src/lib/evaluate.ts. Match the mock's layout and
spacing; fix its wrapping problems as section 6.1 says. Nothing uppercase except what 4.3
allows. Run npm run build. Stop and summarize.
```
**CHECK:** compare with `design/status-mock.png`. Buttons don't wrap onto two
lines. Switching mission in the top bar changes the Distance row. Screenshot
to Claude chat.

## STEP 5: Phase 4, Check-in and reaction test
**Model:** Opus 5.5
```
/clear first. Read SPEC.md sections 6.2, 7 and 8.3. Do ONLY Phase 4: build Stepper,
Segmented, ToggleTile, InfoSheet, ReactionTest and the 7-step CheckIn screen with the save
flow back to Status (changed rows highlighted, the saved banner). Use the indicator texts
from src/data/indicators.ts (create the file with placeholder text if it does not exist
yet; I will replace the text). Keyboard: Enter = Next, Space = reaction tap. Persist the
check-in to localStorage with try/catch. Run npm run build. Stop and summarize.
```
**CHECK:** do a full check-in. In the reaction test, tapping early shows
`False start`. Tick `Vision change` and save: Environment becomes WARNING and
Status shows the change banner. Screenshot of the reaction test and the
saved banner to Claude chat.

## STEP 6: Phase 5, Body screen
**Model:** Opus 5.5
```
/clear first. Read SPEC.md section 6.7 carefully. Do ONLY Phase 5: build BodyFigure.tsx as
a hand-built SVG schematic (viewBox 0 0 360 640, simple shapes only, 1.5px stroke, no fill,
technical drawing feel, NOT a cartoon) with the 9 hotspot markers, leader lines to side
labels, and the dashed whole-body outline for radiation. Markers and labels are real
buttons. Build the Body screen with the detail panel exactly as specified, defaulting to
the worst region. Use the exact NASA HRP risk names from the table. Run npm run build.
Stop and summarize.
```
**CHECK:** the figure looks neat and symmetric, labels don't overlap, clicking
the eyes shows the SANS risk name. Screenshot to Claude chat (this screen
gets the most review).

## STEP 7: Phase 6, Procedures
**Model:** Sonnet 5.5
```
/clear first. Read SPEC.md sections 6.3 and 9. Do ONLY Phase 6: build the Procedures list
and ProcedureView detail with CAUTION/WARNING blocks, numbered checkable steps, and Mark
complete that logs into the downlink report state. Use the procedure text in
src/data/procedures.ts (create it with the 7 IDs and placeholder steps if it does not exist
yet; I will replace the text). Run npm run build. Stop and summarize.
```

## STEP 8: Phase 7, Trends
**Model:** Sonnet 5.5
```
/clear first. Read SPEC.md section 6.4. Do ONLY Phase 7: build TrendPanel with a
hand-written SVG line chart (baseline band = mean plus or minus 1 SD of days 1 to 14, event
markers, the dashed 600 mSv limit line on the dose panel), and the Trends screen with the
8 panels and the 30 days / whole mission toggle. No chart library. Run npm run build.
Stop and summarize.
```

## STEP 9: Phase 8, Downlink, About, page basics
**Model:** Sonnet 5.5
```
/clear first. Read SPEC.md sections 6.5, 6.6, 8.4, 11 and 11b. Do ONLY Phase 8: Downlink
screen with the telemetry-style report, note field, Queue for downlink with a live OWLT
countdown, and Download .txt. About screen with all sections, sources and References
(React, Vite, Tailwind CSS, Lucide, IBM Plex under SIL OFL, NASA and CSA pages). Page
basics: title, meta description, Open Graph tags, favicon.svg, lang="en". Run npm run
build. Stop and summarize.
```

## STEP 10: Put in the reviewed content
Claude chat gives you final `indicators.ts` and `procedures.ts` text after
checking Gemini's research. **Model:** Sonnet 5.5
```
/clear first. Replace the contents of src/data/indicators.ts and src/data/procedures.ts
with the text I paste below, keeping the existing types. Do not change the wording.
Run npm run build.
[paste from Claude chat]
```

## STEP 11: Phase 9, polish and checks
**Model:** Opus 5.5
```
/clear first. Do Phase 9. Go through SPEC.md sections 4.6, 10, 11 and 11b as a checklist
and fix every violation you find in the code: em dashes in copy, any uppercase text not
allowed, any color not from the tokens, any rounded-full shapes, missing focus states,
contrast issues, more than one h1 per screen, console errors, layout at 1280x800,
1440x900 and 390px wide. Then run npm run build and report each item as fixed or
already fine.
```
Then Gemini judge review: paste screenshots of all 7 screens into Gemini with
the prompt in Claude chat, send its answer to Claude chat, fix top 3.

## STEP 12: Deploy (needs internet, about 10 min)
1. github.com > New repository > name `nominal` > Public > Create.
2. In the Antigravity terminal:
```
git add -A
git commit -m "release"
git branch -M main
git remote add origin https://github.com/asimsaeed681/nominal.git
git push -u origin main
```
3. vercel.com > Add New > Project > import `nominal` > Framework: Vite >
   Deploy. Copy the `https://nominal-....vercel.app` link. Open it on your
   phone too and check it loads.

## STEP 13: Demo video (30 seconds max, English subtitles)
Record with Windows Game Bar (`Win + Alt + R` to start and stop) at
1440 x 900 browser size, then trim and add captions in **Clipchamp** (built
into Windows: Start menu > Clipchamp > Create a new video > drag the
recording in > Captions > Turn on auto captions > fix any wrong words >
Export 1080p). Upload to YouTube as **Unlisted**, test the link in a private
window.

| Time | Screen | Say (your own voice) |
|---|---|---|
| 0:00 | Status | "Hi, I'm Asim from COMSATS Orbit Crew in Islamabad." |
| 0:02 | Status | "Our challenge: health monitoring software for astronauts." |
| 0:05 | Status | "This is NOMINAL." |
| 0:10 | Check-in, reaction test, then Body | "Every morning the astronaut gathers sleep, mood, vitals and a reaction test. NOMINAL compares them with their own baseline and NASA limits, and shows each body system's risk." |
| 0:20 | Procedure, then Downlink | "Then it guides them to act with onboard procedures, fully offline, because Mars is 12 minutes away. Next: real wearable sensors and flight surgeon review." |

## STEP 14: Submission form (Claude chat writes every field with you on Sunday)
Fields: Project Name, High-Level Project Summary, Link to Project Demo (the
YouTube link), Link to Final Project (the Vercel link; put the GitHub link in
the description), Detailed Project Description, NASA Data, Space Agency
Partner & Other Data (CSA pages + References list), Use of Artificial
Intelligence, then the two checkboxes and **Submit for Judging**. Add 2 to 3
real screenshots of the app to the project page (PNG, under 10 MB).

## STEP 15: Local event check (Sunday morning, 2 minutes)
Open the Islamabad local event page and Space Apps Connect, and look for any
local judging or presentation time. Tell Claude chat if there is one.

---

## Timeline (Pakistan time)

| Time | Steps |
|---|---|
| Sat 9:45 to 11:30 PM | 1, 2 (and 3 if battery allows) |
| Sun 9:00 AM to 1:00 PM | 3, 4, 5 |
| Sun 1:00 to 4:00 PM | 6, 7, 8, 9, 10 |
| Sun 4:00 to 6:00 PM | 11 + Gemini review fixes |
| Sun 6:00 to 7:30 PM | 12, 13 |
| Sun 7:30 to 9:00 PM | 14, 15, **Submit** |
| Sun 9:00 to 11:59 PM | Buffer only. Do not start new features. |
