# NOMINAL: Product and Design Spec

> Read this whole file before writing any code. Every visual and copy decision
> here is intentional. Do not add anything that is not in this spec (no extra
> sections, no decorative elements, no "AI-powered" badges). If something is
> unclear, choose the plainer option.

Team: COMSATS Orbit Crew (Islamabad). Challenge: NASA Space Apps 2026,
"Create Health Monitoring Software for Astronauts on Space Missions":
*build health monitoring software that gathers health indicators and enables
astronauts to evaluate and act on the status of their health.*

---

## 1. The idea in one paragraph

In spaceflight, **"nominal"** means everything is going as planned. NOMINAL is
the app an astronaut opens every morning to keep themselves nominal. It
**gathers** indicators (a 2-minute check-in, a built-in reaction-time test, and
readings from onboard sensors), **evaluates** them against the astronaut's own
start-of-mission baseline and NASA limits, and helps them **act** using
step-by-step onboard procedures, the same format astronauts already use for
every task. It runs fully offline, because on the way to Mars a message to
Earth takes up to 22 minutes each way.

The three verbs from the challenge (gather, evaluate, act) are the three core
screens. That mapping should be obvious to a judge in the first 10 seconds.

The challenge text also asks for these, and each one is covered on purpose:
- Indicators it names (blood pressure, heart rate, blood sugar, body temperature,
  sleep hours, mood): all are measured in the check-in (section 6.2).
- "A human figure where each part of the body is clickable": the Body screen
  (section 6.7).
- "Do not assume astronauts know everything": every indicator has a plain
  `How to measure` and `Why it matters in space` explanation (section 8.3).
- "Prompt astronauts to take measurements as part of the mission routine": the
  `Due today` routine list and check-in streak on Status (section 6.1).
- "Different environments (spacecraft, station, base)": the mission profile
  switch in the top bar: Mars transit, Mars surface base, ISS (section 5).
- Dynamic charts and color coding: Trends (6.4) and status chips (4.5).
- Uses the challenge's own resources: NASA HRP hazards and risks pages and the
  CSA radiation monitoring article (section 8.4).

## 2. Who uses it and where

- One astronaut, on a crew tablet, in a dim cabin, often tired.
- So: dark display, large text, big touch targets (min 44 px), one decision per
  screen in the check-in, no tiny controls, nothing that needs fine mouse work.
- Primary viewport: **tablet landscape 1280 x 800**. Must also work at
  1440 x 900 (laptop, for the demo video) and down to 390 px wide (stacked).

## 3. Tech stack (keep it light: old laptop, slow internet)

- React 18 + Vite + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- `lucide-react` for icons (stroke width 1.75 everywhere)
- Fonts self-hosted through `@fontsource/ibm-plex-sans` (400, 500, 600) and
  `@fontsource/ibm-plex-mono` (400, 500). No Google Fonts CDN: the app must
  work with no internet.
- **No chart library.** Charts are hand-written SVG components (lighter and
  they match the design exactly).
- No router library: simple state + URL hash (`#/status`, `#/checkin`,
  `#/procedures/MED-SLP-01`, `#/trends`, `#/downlink`, `#/about`).
- No backend, no API keys, no AI calls. State lives in memory and
  `localStorage` (wrap every read/write in try/catch).
- Deploy target: Vercel (static build).

## 4. Design system

### 4.1 Direction
A **flight display**, not a marketing dashboard. Think spacecraft systems
page: black glass, crisp white data, color used *only* to mean something.
Calm when things are fine, loud only when they are not.

### 4.2 Color (exact values, define as CSS variables in `src/index.css`)

| Token | Hex | Used for | Why |
|---|---|---|---|
| `--bg` | `#0A0C0F` | page background | near-black reduces glare in a dim cabin |
| `--panel` | `#12151A` | panels, rows | one step up from bg, no shadows needed |
| `--panel-2` | `#181C22` | hover, selected row, inputs | |
| `--line` | `#252A31` | 1 px borders and dividers | hairlines instead of shadows |
| `--text` | `#E8ECF1` | primary text and data | |
| `--text-2` | `#9AA3AE` | labels, secondary text | passes AA on `--panel` |
| `--text-3` | `#6B7480` | units, timestamps only (never body copy) | |
| `--nominal` | `#3DD68C` | nominal status | spacecraft caution and warning convention |
| `--caution` | `#FFB020` | caution status ("Watch") | amber = caution |
| `--warning` | `#FF5A4E` | warning status ("Act now") | red = warning |
| `--info` | `#5CC8FF` | interactive accent: links, focus ring, primary button, selected tab | cyan = advisory/info, never a status |
| `--info-ink` | `#06212E` | text on `--info` buttons | |

Rules:
- Status colors appear ONLY on status chips, the master status bar, and
  procedure caution/warning blocks. Never decorative.
- No gradients anywhere. No purple anywhere. No glow, no blur, no glass.
- Status is never color alone: always color + icon + word.

### 4.3 Typography

- **IBM Plex Sans** for all UI text. Designed for technical interfaces, very
  readable at small sizes.
- **IBM Plex Mono** for every number, unit, ID, timestamp and procedure ID.
  Use `font-variant-numeric: tabular-nums` so numbers don't jump.
- Scale (px / line-height / weight):
  - Display number: 44 / 48 / Mono 500
  - H1 page title: 28 / 34 / Sans 600 (exactly one H1 per screen)
  - H2 section: 18 / 24 / Sans 600
  - Body: 16 / 24 / Sans 400
  - Label: 13 / 18 / Sans 500, `--text-2`, sentence case (NOT all caps)
  - Data: 20 / 26 / Mono 500
  - Small mono (units, IDs, times): 13 / 18 / Mono 400
- The ONLY uppercase text in the app: the wordmark `NOMINAL`, status chip words
  (`NOMINAL`, `CAUTION`, `WARNING`) and the words `CAUTION` / `WARNING` inside
  procedures. Letter-spacing on those: `0.06em`. Nothing else is uppercase.

### 4.4 Shape, spacing, motion

- Spacing on an 8 px grid (4 px allowed inside small components).
- Corner radius: **4 px** on everything (panels, buttons, inputs, chips).
  No pill shapes, no fully rounded buttons.
- Borders: 1 px `--line`. No box-shadows.
- Buttons: height 48 px. Primary = `--info` fill with `--info-ink` text.
  Secondary = transparent, 1 px `--line` border, `--text`. Destructive does
  not exist.
- Focus: 2 px `--info` outline, 2 px offset, on every interactive element.
- Motion: only 150 ms ease-out on color/opacity changes. No scroll animations,
  no entrance animations, no parallax, no cursor effects. Respect
  `prefers-reduced-motion`.

### 4.5 Status chips (one component, used everywhere)

| State | Word | Icon (lucide) | Style |
|---|---|---|---|
| nominal | `NOMINAL` | `CircleCheck` | `--nominal` text + 1 px `--nominal` border, transparent bg |
| caution | `CAUTION` | `TriangleAlert` | `--caution` bg, `#1A1200` text |
| warning | `WARNING` | `OctagonAlert` | `--warning` bg, `#1F0605` text |

Height 28 px, Mono 500 13 px, radius 4 px, icon 16 px.

### 4.6 Things that must NOT appear (from our "AI-generated look" checklist)
Purple or any gradient, glassmorphism, pill buttons, emoji anywhere, fake
stats or testimonials, AI-generated images, "Made with AI" badges, em dashes
in any copy, scroll or cursor animations, lorem ipsum, Vite/React logos,
generic hero sections, decorative blobs, tooltips that hide key info.

## 5. App frame (every screen)

**Top bar** (height 56 px, `--panel`, bottom border `--line`):
- Left: wordmark `NOMINAL` (Mono 500, 16 px, 0.06em) then a 1 px divider then
  `FE-2` and a mission profile dropdown (Sans 500, `--text-2`, looks like
  plain text with a `ChevronDown`): `Mars transit` (default), `Mars surface
  base`, `ISS`. Switching it changes OWLT (12 min / 12 min / real time),
  daily dose (1.8 / 0.64 / 0.5 mSv), gravity text (0 g / 3/8 g / 0 g) and
  re-runs the evaluation. Distance hazard text changes with it. All three
  numbers come from NASA or NASA-led instruments (Curiosity RAD in cruise and
  on the Mars surface; NASA OCHMO for ISS). Do NOT use Chinese (CNSA)
  mission data anywhere: Space Apps reviews teams for prohibited bilateral
  activity with the PRC.
- Center: `MET 118 / 06:42:13` live clock (Mono). MET = Mission Elapsed Time:
  day / hh:mm:ss, ticking every second from a fixed mission start.
- Right: `OWLT 12 min` (one-way light time to Earth) with a `Radio` icon, then
  `Sensors live` with a 8 px `--nominal` dot.

**Navigation**: left rail on >= 1024 px (width 88 px, icon 24 px + label 12 px
below, selected item gets `--info` left border 3 px and `--text`), bottom bar
on smaller screens. Items, in this order:
1. `Status` (`Gauge`)
2. `Check-in` (`ClipboardCheck`)
3. `Body` (`PersonStanding`)
4. `Procedures` (`ListChecks`)
5. `Trends` (`ChartLine`)
6. `Downlink` (`Send`)
7. `About` (`Info`), visually separated at the bottom of the rail

## 6. Screens

### 6.1 Status (`#/status`, the home screen)

**Master status bar** (full width, 64 px tall, 4 px radius):
- If any warning: `--warning` bg, `OctagonAlert`, text e.g.
  `2 WARNINGS  ·  1 CAUTION` (Mono 500 18 px) and on the right
  `Open first procedure` button (secondary style, dark text).
- Else if any caution: `--caution` bg, same pattern.
- Else: `--panel` with `--nominal` 1 px border, `CircleCheck`,
  `ALL SYSTEMS NOMINAL`.

Below it, H1 `Today, MET day 118` and a line in `--text-2`:
`Last check-in 07:10  ·  compared with your baseline from days 1 to 14`.
If today's check-in is not done: a full-width info row with button
`Start check-in` (primary).

**Hazard table** (the core of the screen). One row per NASA hazard, in RIDGE
order. Row height 88 px, `--panel`, 1 px gaps. Columns:

| Hazard (icon + name + one-line plain explanation) | Key reading (Mono data) | Your baseline (Mono, `--text-2`) | Status chip | Action |
|---|---|---|---|---|

Hazard names and one-liners (exact copy):
1. `Radiation`: "Dose from space radiation." Icon `Radiation`.
2. `Isolation`: "Sleep, mood and alertness." Icon `Brain`.
3. `Distance`: "How much you must handle without Earth." Icon `Radio`.
4. `Gravity`: "Bone, muscle and heart in weightlessness." Icon `Dumbbell`.
5. `Environment`: "Cabin air and symptoms." Icon `Wind`.

Action column: if caution/warning, a secondary button showing only the
procedure ID plus a `ArrowRight` icon (e.g. `MED-FTG-01 →` as icon, not a
typed arrow), `white-space: nowrap`; for Distance it links to the first
triggered procedure. If nominal, `--text-3` text `No action`.
Key reading: value and unit stay on one line (`white-space: nowrap`).
Visual reference: `design/status-mock.png` (match its layout and feel; it is
a static mock, so fix its wrapping issues as described here).
Clicking a row expands it (accordion, one at a time) to show the 2 to 4
findings as plain sentences plus the small sparkline of the main indicator.

**Right column (>= 1280 px) or below (smaller)**, three stacked panels:
1. `Next actions`: numbered list (max 4) of procedure titles, warnings first,
   each a link.
2. `Due today` (the mission routine): rows with a 20 px checkbox-style icon,
   name and frequency in Mono `--text-3`: `Morning check-in  daily`,
   `Blood sugar (fasting)  daily`, `Body mass  weekly, Mon`,
   `Vision check  weekly, Thu`. Done items show `CircleCheck` in `--nominal`
   and the time. Clicking an undone item opens the check-in at that step.
3. `Routine`: two Mono stats side by side, `23` `day check-in streak` and
   `6 / 7` `routine items this week`. Plain numbers, no badges, no confetti.

### 6.2 Check-in (`#/checkin`): GATHER

A focused wizard. One question per step. Big controls. Progress `Step 2 of 7`
(Mono) plus a 7-segment progress bar (segments, not a smooth bar). Every step
has a `How to measure` / `Why it matters` link (`Info` icon, `--info` text)
that opens a side panel (desktop) or bottom sheet (mobile) with the text from
`src/data/indicators.ts`. `Back`
(secondary) and `Next` (primary) at the bottom right, 48 px tall. Keyboard:
Enter = Next.

1. **Sleep**: H1 `How long did you sleep?` Stepper with `-` / `+` (0.5 h
   steps, 0 to 12), value shown as Display number `6.5 h`. Below: segmented
   control `Sleep quality` with 5 options `Very poor, Poor, Okay, Good, Very good`.
2. **Mind**: H1 `How do you feel today?` Two segmented controls:
   `Mood` (`Very low, Low, Okay, Good, Very good`) and
   `Stress` (`None, Mild, Moderate, High, Very high`).
3. **Body**: H1 `Any symptoms since yesterday?` A grid of toggle tiles
   (min 120 x 64 px, icon + word), multi-select: `Headache`, `Congestion`,
   `Vision change`, `Back pain`, `Nausea`, `Dizziness`, `Skin irritation`,
   `Trouble sleeping`. Plus one tile `None` that clears the others.
4. **Measure**: H1 `Take your measurements`. Four input cards in a 2 x 2
   grid, each with label, number input (large Mono), unit, and its own
   `How to measure` link:
   - `Blood pressure` two inputs `120` / `78` `mmHg`
   - `Resting heart rate` `62` `bpm`
   - `Body temperature` `36.8` `°C`
   - `Blood sugar (fasting)` `92` `mg/dL`
   Values pre-filled from simulated devices (small `From device` tag), editable.
   Inline status chip appears next to any value out of range as you type.
5. **Exercise**: H1 `How much did you exercise yesterday?` Stepper in 15 min
   steps (0 to 180), Display number `90 min`, helper text
   `Target: about 120 min a day, with resistance work.`
6. **Reaction test**: H1 `Reaction test`, body text
   `Tap the panel or press Space as soon as the counter appears. 30 seconds.`
   See section 7 for the exact mechanics. Shows result: mean reaction time
   (Display, ms), `Lapses (over 500 ms)` count, and a comparison line
   `18% slower than your baseline` colored by status.
7. **Review**: H1 `Review and save`. Two panels side by side:
   `You entered` (sleep, quality, mood, stress, symptoms, measurements,
   exercise, reaction) and `From onboard sensors` with a small `Simulated` tag
   (Mono 13, `--text-3` border): radiation dose today (personal dosimeter),
   cabin CO2, cabin temperature. Primary button `Save check-in`.

After saving: navigate to Status, and show a dismissible row at the top:
`Check-in saved. Changed: Isolation  CAUTION → WARNING.` (use the → arrow
character, never an em dash). Rows that changed get a 2 px `--info` left
border for this session.

### 6.3 Procedures (`#/procedures` and `#/procedures/:id`): ACT

List view: H1 `Procedures`, a table of procedures: ID (Mono), title, trigger
(why it's recommended now, or `Not triggered`), status chip of the linked
hazard. Triggered ones first.

Detail view, styled like a real onboard procedure:
- Header row: ID `MED-SLP-01` (Mono), title (H1), linked hazard chip.
- `Why this is open`: 1 to 2 sentences generated from the data
  (e.g. "Your average sleep over 7 days is 5.1 h. Your baseline is 7.2 h.").
- `CAUTION` or `WARNING` block where the procedure has one: full-width,
  4 px left border in the status color, word in the status color (Mono 500),
  text in `--text`.
- Numbered steps (`1.`, `2.`, ... Mono for the numbers), each with a 24 px
  checkbox. Sub-steps lettered `a.`, `b.`.
- Footer: `Mark complete` (primary, enabled when all steps are checked) which
  logs `MED-SLP-01 completed MET 118 07:32` into the Downlink report.

The procedure texts are in `src/data/procedures.ts` (section 9). Keep them
short. Every procedure ends with a step to inform the Crew Medical Officer
(CMO) or add a note to the downlink.

### 6.4 Trends (`#/trends`)

H1 `Trends`. Toggle (segmented) `Last 30 days` / `Whole mission`.
A grid of 8 small-multiple panels (2 columns on tablet, 4 on wide), one per
indicator: sleep, mood, stress, reaction time, exercise, resting heart rate,
career radiation dose, cabin CO2. Each panel:
- Label + latest value (Data, Mono) + delta vs baseline (`+18%`, colored only
  if outside the band).
- SVG line chart 100% x 120 px: baseline band = mean ± 1 SD of days 1 to 14,
  filled `--text` at 6% opacity; line 2 px `--text`; last point a 6 px dot in
  the indicator's status color; event markers as thin vertical dashed lines
  in `--text-3` with tiny Mono labels (`SPE` on day 97, `CO2` on day 110).
- Career dose panel also has a dashed `--warning` line at 600 mSv labelled
  `NASA career limit`.
- No gridlines except 3 faint horizontal ticks. No legends needed.

### 6.5 Downlink (`#/downlink`)

H1 `Downlink to Mission Control`. Line: `One-way light time: 12 min. Next
contact window: in 41 min.` A report preview in a `--panel` box, Mono 14 px,
plain text in a telemetry style:

```
NOMINAL HEALTH REPORT
CREW      FE-2
MISSION   Mars transit
MET       118 / 07:31
STATUS    2 WARNING  1 CAUTION  2 NOMINAL
...
```
followed by each hazard, findings, procedures completed today, and the crew
note. A textarea `Note for the flight surgeon (optional)`. Buttons:
`Queue for downlink` (primary) and `Download .txt` (secondary). After queuing:
a row `Queued. Arrives at Mission Control in 12:00` with a live countdown
(Mono) that ticks down to `Received at MCC`.

### 6.6 About (`#/about`), for judges

H1 `About NOMINAL`. Short sections: `What it does` (3 sentences), `How it
evaluates` (baseline + limits, offline), `NASA sources` (list with links),
`About the data` ("The astronaut and sensor history are simulated. Rates and
limits come from the sources above. Thresholds not set by NASA are app
settings a flight surgeon would tune."), `How we used AI` (honest 2 sentences),
`Team` (COMSATS Orbit Crew, Islamabad).

### 6.7 Body (`#/body`), the clickable human figure

H1 `Body`. Line: `Tap a body system to see what it does, how space affects
it, and your readings.`

Layout: left 45% the figure, right 55% a detail panel.

**The figure** is a hand-built SVG schematic (viewBox 0 0 360 640), front
view, NOT an illustration or image. Built only from simple shapes: circle
head, rounded-rect torso, capsule arms and legs, 1.5 px `--text-2` stroke, no
fill. It should look like a technical drawing, not a cartoon. On top: 9
hotspot markers (14 px circles filled with the region's status color, 2 px
`--bg` ring), each connected by a thin 1 px `--line` leader line to a label
on the left or right side (`Region name` Sans 500 14 + status word Mono 12).
Markers and labels are real `<button>`s (keyboard + screen reader). Selected
region: marker gets a 2 px `--info` ring, label turns `--text`, and the
matching body shape gets a 2 px `--info` stroke.

Regions, their exact NASA HRP risk name, and indicators:

| Region (marker position) | NASA HRP risk | Indicators |
|---|---|---|
| Brain (head) | Risk of Behavioral Changes and Psychiatric Disorders; Risk of Inadequate Sleep and Irregular Schedules | sleep, mood, stress, reaction time |
| Eyes | Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS) | vision change, weekly vision check |
| Inner ear (side of head) | Risk of Altered Sensorimotor and Vestibular Function | dizziness, nausea |
| Heart and vessels (chest) | Risk of Cardiovascular Adaptations | heart rate, blood pressure |
| Airway (throat/upper chest) | Hostile closed environment: cabin air | cabin CO2, headache, congestion |
| Metabolism (abdomen) | Risk of Inadequate Food and Nutrition | blood sugar, body mass |
| Bones (hip and leg) | Risk of Spaceflight-Induced Bone Changes | exercise, estimated bone loss |
| Muscles (thigh/arm) | Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness | exercise, body mass |
| Immune system and skin (forearm) | Risk of Altered Immune System Responses | body temperature, skin irritation |
| Whole body (label at bottom, no marker on figure, a dashed outline around the whole figure) | Risk of Radiation-Induced Cancers | career radiation dose |

**Detail panel** for the selected region: region name (H2) + status chip;
`NASA risk` (Mono label, risk name); `What it does` (1 sentence);
`How space affects it` (1 to 2 sentences); `Your readings` (rows: indicator,
value Mono, baseline `--text-2`, small chip); `How to check` (1 to 2
sentences); if a procedure is triggered, secondary button with its ID. Default
selection on open: the region with the worst status.

## 7. Reaction test (built-in, real)

Modeled on the psychomotor vigilance test (PVT) that NASA uses for crew
fatigue research (a short self-test; ours is a 30-second demo version).
- A 100% x 280 px panel, `--panel-2`, text `Get ready` then `Wait...`.
- After a random delay of 2 to 6 s, show a millisecond counter (Display Mono)
  counting up from 0 in `--info`.
- User taps the panel / presses Space: record RT, show it for 1 s, then next
  trial. Tapping before the counter appears = `False start` (shown in
  `--caution`), counts against them, trial restarts.
- Run until 30 s have passed (about 6 to 8 trials). Use
  `performance.now()`. Ignore key repeat.
- Result: mean RT (ms), lapses (RT > 500 ms), false starts. Store as today's
  `reactionMs`.
- `Skip test` link (uses no reaction value for today).

## 8. Data and evaluation logic

### 8.1 Simulated history (`src/data/history.ts`)
A seeded generator (mulberry32, seed 7) for ONE astronaut, FE-2, days 1 to
117, plus a "today" (day 118) that the check-in fills. Port the logic from
`../astropulse/core/simulate.py` (Leo Mensah's story) with these events:
- Baselines: sleep 7.2 h, mood 4, stress 2, exercise 125 min, reaction 255 ms,
  resting HR 62, BP 120/78, mass 78 kg, body temperature 36.7 °C,
  fasting blood sugar 88 mg/dL (± 6), cabin temperature 22.5 °C.
- From day 88 to 120, sleep, mood and stress drift worse and reaction time
  slows up to +32% (isolation story).
- Day 97: solar particle event, +30 mSv that day.
- Days 110 to 118: cabin CO2 fault, CO2 up to ~4,800 ppm, headaches likely,
  sleep -0.5 h.
- Daily dose 1.8 mSv ± 5%. Prior career dose 40 mSv.
- Today's pre-filled values for the check-in: sleep 5.0, quality Poor, mood
  Low, stress High, symptoms Headache, BP 126/82, HR 69, temperature 36.9 °C,
  blood sugar 94 mg/dL, exercise 90.
- Routine: check-in streak 23 days; body mass logged every Monday; vision
  check every Thursday (all normal so far).

### 8.2 Rules (`src/lib/evaluate.ts`), port from `../astropulse/core/engine.py`
Baseline = days 1 to 14. Recent = last 7 days including today.
- **Radiation**: career % of 600 mSv. >= 50% caution, >= 80% warning.
  Projected dose at mission end (day 180) >= 80% caution, >= 100% warning.
  Single-day dose > 10 mSv within last 3 days = warning (`MED-SPE-01`).
- **Isolation**: 7-day sleep < 6.5 h caution, < 5.5 h warning. Mood avg
  <= 3.2 or stress >= 3.2 caution; <= 2.5 / >= 4 warning. Reaction slower
  than baseline by >= 12% caution, >= 22% warning (`MED-FTG-01` no-go for
  critical tasks). Today's sleep < 5 h = at least caution.
- **Gravity**: 7-day exercise < 90 min caution, < 60 warning. Estimated bone
  loss (1.5% per month with no exercise, half that at full 120 min) >= 4%
  caution, >= 6% warning. HR up >= 8 bpm vs baseline caution. Today's BP
  >= 140/90 or HR >= 100 caution.
- **Metabolism and immune** (shown on the Body screen, and folded into the
  Gravity row for body mass and the Environment row for temperature on the
  Status table): fasting blood sugar 70 to 99 mg/dL nominal; 100 to 125 or
  54 to 69 caution; >= 126 or < 54 warning (general clinical ranges, labelled
  as such). Body temperature 36.1 to 37.2 °C nominal; 37.3 to 37.9 caution;
  >= 38.0 warning (fever) or < 35.5 caution.
- **Environment**: CO2 >= 3,000 ppm caution, >= 4,000 warning. Headache on
  >= 3 of last 7 days caution. `Vision change` today = warning
  (`MED-VIS-01`). Dizziness or nausea today = caution.
- **Distance**: OWLT >= 5 min and any warning = warning ("Act on warnings
  now using onboard procedures. Earth can't help in real time."). OWLT >= 5
  min and no warning = nominal with text "Autonomy mode. Daily report keeps
  Mission Control informed."

Every finding is a plain sentence with the real numbers, for example
`Reaction time is 31% slower than your baseline (334 ms vs 255 ms).`

### 8.3 Indicator explanations (`src/data/indicators.ts`)
For each indicator (sleep, mood, stress, reaction time, blood pressure, heart
rate, body temperature, blood sugar, exercise, body mass, radiation dose,
cabin CO2, vision): `howToMeasure` (2 to 3 short steps, what device, when,
e.g. "Measure blood sugar before breakfast with the glucometer: clean the
fingertip, use a fresh test strip, read the value in mg/dL") and
`whyItMatters` (1 to 2 sentences about what spaceflight does to it). Text
comes from the Gemini research step and is reviewed before use.

### 8.4 Sources (`src/data/sources.ts`), shown on About
- NASA HRP, 5 Hazards of Human Spaceflight: https://www.nasa.gov/hrp/hazards/
- NASA HRP, Risks of Human Spaceflight: https://www.nasa.gov/hrp/risks/
- NASA HRP, Ongoing HRP Research in Space: https://www.nasa.gov/hrp/ongoing-hrp-research/
- CSA, Monitoring Radiation for Astronaut Health: https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- CSA, Why Do We Conduct Science Experiments in Space?: https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp
- NASA OCHMO Radiation Protection technical brief (600 mSv career limit)
- Curiosity RAD cruise dose (1.8 mSv/day)
- Curiosity RAD on the Mars surface (Hassler et al. 2014, Science): about
  0.64 mSv/day [verify in the Gemini research step]
(Exact URLs for the OCHMO brief and RAD cruise are in
`../astropulse/core/missions.py`. Do not use the Chang'e-4 source from that file.)

## 9. Procedures (`src/data/procedures.ts`)

IDs, titles and triggers. Step text to be written in plain imperative
sentences, 4 to 7 steps each, last step always involves the CMO or downlink.
**These must be checked by the Gemini fact-check step before final.**
- `MED-SLP-01` Sleep recovery: triggered by isolation sleep finding.
- `MED-FTG-01` Fatigue: no-go for critical tasks: triggered by reaction time.
- `MED-MOD-01` Low mood support: triggered by mood/stress.
- `MED-CO2-01` CO2 symptom response: triggered by CO2/headache.
- `MED-SPE-01` Solar particle event: shelter: triggered by dose spike.
- `MED-VIS-01` Vision change check (SANS): triggered by vision change.
- `MED-EXR-01` Exercise catch-up: triggered by low exercise.

## 10. Copy rules
- Plain words, short sentences, second person ("Your sleep is down").
- No em dashes. No exclamation marks. No emoji. No "AI-powered", "smart",
  "revolutionary", "seamless".
- Numbers always with units: `5.1 h`, `334 ms`, `4,650 ppm`, `47%`.

## 11. Page basics (from our pre-launch checklist)
- `<html lang="en">`, title `NOMINAL: Astronaut Health Self-Check`.
- Meta description: "Daily health self-check for astronauts on long
  missions. Gather, evaluate and act, fully offline."
- Open Graph title/description/image (`/og.png`, 1200 x 630, made later from
  a real screenshot, NOT an AI image). Favicon: simple SVG, a 4 px rounded
  square in `--nominal` with a black check, 32 px.
- Zero console errors. Lighthouse accessibility >= 95. Contrast AA.
- Exactly one H1 per screen.

## 11b. Space Apps rules that affect the code
- AI disclosure: the README, the About screen, and a one-line comment at the
  top of each source file must say the code was written with AI assistance
  (Claude) and reviewed by the team. Add `"description"` in package.json that
  says the same. This is required by the Project Submission Guide.
- No NASA logo, meatball, flag, or mission patch anywhere. No AI-generated
  images at all (they would need a visible watermark, and they look cheap).
- No personal data in the app (no real names, birthdays, phone numbers).
  The astronaut is `FE-2`.
- Every external resource (React, Vite, Tailwind, Lucide icons, IBM Plex
  fonts under the SIL Open Font License, NASA and CSA pages) is listed on the
  About screen under `References`.

## 12. File structure
```
nominal/
  index.html
  src/
    main.tsx  App.tsx  index.css
    components/  TopBar.tsx  NavRail.tsx  StatusChip.tsx  MasterStatus.tsx
                 HazardTable.tsx  Sparkline.tsx  TrendPanel.tsx  Stepper.tsx
                 Segmented.tsx  ToggleTile.tsx  ReactionTest.tsx  ProcedureView.tsx
    components/  (also) BodyFigure.tsx  InfoSheet.tsx  MissionSwitch.tsx
    screens/     Status.tsx  CheckIn.tsx  Body.tsx  Procedures.tsx  Trends.tsx  Downlink.tsx  About.tsx
    data/        history.ts  procedures.ts  indicators.ts  sources.ts
    lib/         evaluate.ts  random.ts  time.ts  storage.ts
  public/  favicon.svg
```

## 13. Build phases (do one phase per prompt, stop and report after each)
1. Scaffold, install, design tokens, fonts, app frame (top bar with mission
   switch, nav), empty screens.
2. Data generator + evaluation engine (+ a tiny console check).
3. Status screen + hazard table + status chips + Due today + Routine.
4. Check-in wizard (7 steps) + reaction test + info sheets + save flow.
5. Body screen (figure + detail panel).
6. Procedures list + detail.
7. Trends with SVG charts.
8. Downlink + About + page basics (meta, favicon).
9. Polish pass against sections 4.6 and 11. Build and check.
