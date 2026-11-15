# NOMINAL: Final content (reviewed)

This replaces all placeholder text. Use the wording exactly. Keys match the
indicator, region and procedure IDs already in the code; map them if a name
differs slightly. Facts were checked against NASA HRP pages, NASA-STD-3001,
the NASA OCHMO radiation brief, and the Curiosity RAD papers.

---

## 1. Indicators (`src/data/indicators.ts`)

### sleep: Sleep hours
How to measure:
1. Wear the sleep sensor on your wrist for the whole sleep period.
2. When you wake up, check the hours it recorded.
3. Correct the number if you know you were awake for a long time.
Why it matters in space: Light and dark change every 45 minutes in orbit, and cabin noise and CO2 make sleep worse. ISS crews are scheduled 8.5 hours of sleep but often get closer to 6, and short sleep slows thinking and reactions.

### mood: Mood
How to measure:
1. Pick the option that matches how you feel right now.
2. Answer before the morning planning call, at about the same time each day.
Why it matters in space: Months in a small, closed space far from family can slowly lower mood. Catching a slide early means support can start before it affects you or the crew.

### stress: Stress
How to measure:
1. Pick the option that matches your stress level today.
2. Think about the last 24 hours, not just this moment.
Why it matters in space: A heavy workload plus isolation keeps stress high. Long-term stress can weaken the immune system, and NASA has seen dormant viruses reactivate in stressed crews.

### reaction: Reaction time
How to measure:
1. Sit somewhere quiet and look only at the screen.
2. Tap the moment the counter appears. Don't guess early.
3. Do the test at the same time every day so results compare fairly.
Why it matters in space: This is a short version of the psychomotor vigilance test used in NASA's Reaction Self Test on the ISS. Slower reactions and more lapses are an early sign of fatigue, before you feel it yourself.

### bp: Blood pressure
How to measure:
1. Put the cuff on your upper arm and anchor yourself so you stay still.
2. Start the monitor and don't talk or move until it finishes.
3. Read both numbers: top (systolic) and bottom (diastolic).
Why it matters in space: Without gravity, body fluids shift toward the head and the heart and blood vessels adapt. Tracking blood pressure shows how your heart is adapting and helps predict dizziness when you return to gravity.

### hr: Resting heart rate
How to measure:
1. Measure right after waking, before coffee or exercise.
2. Rest quietly for 2 minutes with the chest strap or wrist sensor on.
3. Read the beats per minute.
Why it matters in space: Spaceflight lowers the amount of blood in circulation, so the heart works differently. A resting rate that keeps rising can mean poor sleep, illness, or not enough exercise.

### temp: Body temperature
How to measure:
1. Use the thermometer from the medical kit.
2. Measure before exercise and at least 30 minutes after eating or drinking.
3. Read the value in °C.
Why it matters in space: The immune system works differently in space, and germs spread easily in a closed cabin. A fever is often the first sign of an infection, and catching it early protects the whole crew.

### glucose: Blood sugar (fasting)
How to measure:
1. Measure in the morning before you eat anything.
2. Clean your fingertip, use a fresh test strip, and prick the side of the finger.
3. Put the drop on the strip and read the value in mg/dL.
Why it matters in space: Diet, stress and less physical load can change how the body handles sugar. Regular checks show whether food and exercise are keeping your metabolism stable.

### exercise: Exercise minutes
How to measure:
1. Log in to the exercise device before you start.
2. Do the planned resistance and cardio sessions.
3. Check that the total minutes were saved.
Why it matters in space: Without gravity, weight-bearing bones can lose about 1 to 1.5% of their density each month, and muscles shrink. About 2 hours of daily exercise, including heavy resistance work, is the main protection.

### mass: Body mass
How to measure:
1. Use the mass measurement device (scales don't work without gravity).
2. Strap in and hold still while it moves you and measures.
3. Measure weekly, at the same time of day.
Why it matters in space: Many astronauts eat less than they burn in space. Losing mass can mean losing muscle and bone, so it's a sign to eat more and check exercise.

### dose: Radiation dose
How to measure:
1. Wear your personal dosimeter at all times.
2. Check the daily reading on this screen. It updates on its own.
3. Report any alarm at once.
Why it matters in space: Cosmic rays and solar storms raise cancer risk over a career, and a strong solar storm can cause radiation sickness. NASA limits each astronaut to 600 mSv over a whole career.

### co2: Cabin CO2
How to measure:
1. Read the CO2 value on the cabin environment display.
2. Compare it with the normal level shown in Trends.
Why it matters in space: Air doesn't rise or mix by itself in weightlessness, so breathed-out CO2 can collect around your head. Higher CO2 is linked to headaches, tiredness and poor focus.

### vision: Vision
How to measure:
1. Cover one eye and read the vision chart at the marked distance. Repeat with the other eye.
2. Note any blur, shadow or distortion.
3. Do the eye scan weekly if you are trained on it.
Why it matters in space: The fluid shift toward the head can change the shape of the eye and the optic nerve. NASA calls this Spaceflight Associated Neuro-ocular Syndrome (SANS). Early checks catch changes before they get worse.

---

## 2. Body regions (`src/data/regions.ts`)

### brain: Brain
What it does: Controls thinking, sleep, mood and reactions.
How space affects it: Isolation, distance from home and broken sleep can lower mood and slow thinking. NASA tracks this as the risk of behavioral changes and the risk of inadequate sleep.
How to check: Daily mood, stress and sleep entries, plus the reaction test.

### eyes: Eyes
What it does: Vision, needed for almost every task on board.
How space affects it: Fluids shift toward the head and can change the back of the eye and the optic nerve (SANS).
How to check: Vision chart in each eye, report any blur, and the weekly eye scan.

### innerEar: Inner ear
What it does: Senses balance and movement.
How space affects it: Without gravity the balance system gets mixed signals, which can cause motion sickness and dizziness, especially in the first days and after landing.
How to check: Log any dizziness or nausea in the check-in.

### heart: Heart and vessels
What it does: Pumps blood and oxygen through the body.
How space affects it: Fluids move toward the head, blood volume drops and the heart adapts. This can cause dizziness when gravity returns.
How to check: Resting heart rate and blood pressure each morning.

### airway: Airway
What it does: Brings in oxygen and removes CO2.
How space affects it: In a closed cabin, CO2 can build up near your face. Congestion is also common from the fluid shift.
How to check: Cabin CO2 reading, and log headaches or congestion.

### metabolism: Metabolism
What it does: Turns food into energy.
How space affects it: Appetite often drops, and menus get repetitive. Eating too little leads to muscle and bone loss.
How to check: Fasting blood sugar daily and body mass weekly.

### bones: Bones
What it does: Supports the body and protects organs.
How space affects it: Without load, bones in the hips, spine and legs lose density and become more fragile.
How to check: Daily exercise minutes and the estimated bone loss in Trends.

### muscles: Muscles
What it does: Movement, strength and posture.
How space affects it: Muscles that fight gravity on Earth weaken quickly when they aren't used. Heart and lung fitness also drop.
How to check: Daily exercise minutes and weekly body mass.

### immune: Immune system and skin
What it does: Fights infection and protects the body surface.
How space affects it: Stress and the space environment change immune responses, and dormant viruses can wake up and cause rashes or illness.
How to check: Body temperature and any skin irritation in the check-in.

### wholeBody: Whole body
What it does: Every cell can be affected by radiation.
How space affects it: Space radiation passes through the spacecraft and the body, raising long-term cancer risk.
How to check: Your career dose against NASA's 600 mSv limit, updated every day from your dosimeter.

---

## 3. Procedures (`src/data/procedures.ts`)

### MED-SLP-01: Sleep recovery
Trigger: 7-day average sleep under 6.5 h.
CAUTION: Short sleep for several days slows reactions and raises the chance of mistakes.
1. Check your sleep data for the last 7 days.
2. Dim the cabin lights and stop screen use 1 hour before your sleep period.
3. Move any non-urgent work out of the hour before sleep.
4. Use earplugs and an eye mask in your sleep station.
5. Use sleep medication only if the Crew Medical Officer has approved it.
6. Tell the Crew Medical Officer about the sleep loss and your recovery plan.

### MED-FTG-01: Fatigue: no-go for critical tasks
Trigger: Reaction time 22% or more slower than baseline.
WARNING: Do not do a spacewalk, docking, robotic arm work or any other critical task until your reaction time recovers.
1. Stop your current task and save your work.
2. Drink water and eat a small snack.
3. Rest somewhere dark and quiet for at least 30 minutes.
4. Repeat the reaction test.
5. If it is still 22% or more slower, stay off critical tasks for today.
6. Tell the Crew Medical Officer and add the result to today's downlink.

### MED-MOD-01: Low mood support
Trigger: Low mood and high stress for a week.
CAUTION: Low mood that lasts can affect your safety and the whole crew.
1. Take 30 minutes of private time away from work today.
2. Write down what has been bothering you in your personal log.
3. Do something that helps you reset: music, a film, a window view, or a hobby.
4. Plan a call with family or friends at the next contact window.
5. Talk to the Crew Medical Officer, who can set up a private call with the flight psychologist.

### MED-CO2-01: CO2 symptom response
Trigger: High cabin CO2 with headaches.
WARNING: High CO2 can cause confusion. Avoid critical tasks until the level is back to normal.
1. Stop hard exercise for now, since it adds CO2.
2. Move to an area with good airflow, away from corners and closed spaces.
3. Point a portable fan at your work area and your sleep station.
4. Check the life support panel for CO2 scrubber alerts and tell the flight engineer.
5. Use pain relief from the medical kit for the headache if needed.
6. Ask the Crew Medical Officer to report the symptoms to Mission Control.

### MED-SPE-01: Solar particle event: shelter
Trigger: Radiation alarm or a dose spike.
WARNING: A strong solar storm can give a dangerous dose within hours. Shelter right away.
1. Acknowledge the radiation alarm.
2. Make sure your dosimeter is on you.
3. Go to the storm shelter, the most shielded part of the spacecraft.
4. Build a wall around yourself with water bags and stowage bags.
5. Stay in the shelter until the alarm clears.
6. Confirm your shelter status to the Crew Medical Officer and Mission Control.

### MED-VIS-01: Vision change check (SANS)
Trigger: Vision change reported.
CAUTION: Report every vision change. Early checks help prevent lasting eye damage.
1. Cover your left eye and read the vision chart at the marked distance.
2. Cover your right eye and repeat.
3. Write down what changed: blur, shadow, or bent lines.
4. If reading is blurry, put on the extra-strength glasses from the kit.
5. Do the eye scan if you are trained, and save the images.
6. Tell the Crew Medical Officer today so Mission Control can review the images.

### MED-EXR-01: Exercise catch-up
Trigger: Exercise under 90 min a day for a week.
CAUTION: Missed exercise speeds up bone and muscle loss.
1. Find what caused the missed sessions in your schedule.
2. Ask the commander to move a low-priority task so you have time.
3. Do 30 minutes of cardio on the bike or treadmill.
4. Do 45 minutes of heavy resistance exercise.
5. Check that the minutes were saved.
6. Tell the Crew Medical Officer your catch-up plan.

---

## 4. About screen: "How we used AI"

We used Claude (Anthropic) to help write the code and Gemini (Google) to help research and fact-check the health content. We designed the app, chose every indicator and threshold, checked each NASA number against its source, and tested every screen. The app uses no AI-generated images.

## 5. About screen: extra sources to add
- Zeitlin et al. 2013, Science: Curiosity RAD cruise dose, about 1.84 mSv per day
- Hassler et al. 2014, Science: Curiosity RAD Mars surface dose, about 0.64 mSv per day
- NASA-STD-3001 Volume 1: 600 mSv career limit and 250 mSv per solar event
