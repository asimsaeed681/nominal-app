// Written with AI assistance (Claude) and reviewed by the team.
// How to measure / Why it matters, per indicator (SPEC 8.3).
// Final reviewed text from CONTENT.md, word for word.

export type IndicatorId =
  | 'sleep'
  | 'mood'
  | 'stress'
  | 'reaction'
  | 'bloodPressure'
  | 'heartRate'
  | 'bodyTemp'
  | 'bloodSugar'
  | 'exercise'
  | 'bodyMass'
  | 'radiation'
  | 'co2'
  | 'vision'

export interface Indicator {
  name: string
  howToMeasure: string[]
  whyItMatters: string
}

export const indicators: Record<IndicatorId, Indicator> = {
  sleep: {
    name: 'Sleep hours',
    howToMeasure: [
      'Wear the sleep sensor on your wrist for the whole sleep period.',
      'When you wake up, check the hours it recorded.',
      'Correct the number if you know you were awake for a long time.',
    ],
    whyItMatters:
      'Light and dark change every 45 minutes in orbit, and cabin noise and CO2 make sleep worse. ISS crews are scheduled 8.5 hours of sleep but often get closer to 6, and short sleep slows thinking and reactions.',
  },
  mood: {
    name: 'Mood',
    howToMeasure: [
      'Pick the option that matches how you feel right now.',
      'Answer before the morning planning call, at about the same time each day.',
    ],
    whyItMatters:
      'Months in a small, closed space far from family can slowly lower mood. Catching a slide early means support can start before it affects you or the crew.',
  },
  stress: {
    name: 'Stress',
    howToMeasure: ['Pick the option that matches your stress level today.', 'Think about the last 24 hours, not just this moment.'],
    whyItMatters:
      'A heavy workload plus isolation keeps stress high. Long-term stress can weaken the immune system, and NASA has seen dormant viruses reactivate in stressed crews.',
  },
  reaction: {
    name: 'Reaction time',
    howToMeasure: [
      'Sit somewhere quiet and look only at the screen.',
      "Tap the moment the counter appears. Don't guess early.",
      'Do the test at the same time every day so results compare fairly.',
    ],
    whyItMatters:
      "This is a short version of the psychomotor vigilance test used in NASA's Reaction Self Test on the ISS. Slower reactions and more lapses are an early sign of fatigue, before you feel it yourself.",
  },
  bloodPressure: {
    name: 'Blood pressure',
    howToMeasure: [
      'Put the cuff on your upper arm and anchor yourself so you stay still.',
      "Start the monitor and don't talk or move until it finishes.",
      'Read both numbers: top (systolic) and bottom (diastolic).',
    ],
    whyItMatters:
      'Without gravity, body fluids shift toward the head and the heart and blood vessels adapt. Tracking blood pressure shows how your heart is adapting and helps predict dizziness when you return to gravity.',
  },
  heartRate: {
    name: 'Resting heart rate',
    howToMeasure: [
      'Measure right after waking, before coffee or exercise.',
      'Rest quietly for 2 minutes with the chest strap or wrist sensor on.',
      'Read the beats per minute.',
    ],
    whyItMatters:
      'Spaceflight lowers the amount of blood in circulation, so the heart works differently. A resting rate that keeps rising can mean poor sleep, illness, or not enough exercise.',
  },
  bodyTemp: {
    name: 'Body temperature',
    howToMeasure: [
      'Use the thermometer from the medical kit.',
      'Measure before exercise and at least 30 minutes after eating or drinking.',
      'Read the value in °C.',
    ],
    whyItMatters:
      'The immune system works differently in space, and germs spread easily in a closed cabin. A fever is often the first sign of an infection, and catching it early protects the whole crew.',
  },
  bloodSugar: {
    name: 'Blood sugar (fasting)',
    howToMeasure: [
      'Measure in the morning before you eat anything.',
      'Clean your fingertip, use a fresh test strip, and prick the side of the finger.',
      'Put the drop on the strip and read the value in mg/dL.',
    ],
    whyItMatters:
      'Diet, stress and less physical load can change how the body handles sugar. Regular checks show whether food and exercise are keeping your metabolism stable.',
  },
  exercise: {
    name: 'Exercise minutes',
    howToMeasure: [
      'Log in to the exercise device before you start.',
      'Do the planned resistance and cardio sessions.',
      'Check that the total minutes were saved.',
    ],
    whyItMatters:
      'Without gravity, weight-bearing bones can lose about 1 to 1.5% of their density each month, and muscles shrink. About 2 hours of daily exercise, including heavy resistance work, is the main protection.',
  },
  bodyMass: {
    name: 'Body mass',
    howToMeasure: [
      "Use the mass measurement device (scales don't work without gravity).",
      'Strap in and hold still while it moves you and measures.',
      'Measure weekly, at the same time of day.',
    ],
    whyItMatters:
      "Many astronauts eat less than they burn in space. Losing mass can mean losing muscle and bone, so it's a sign to eat more and check exercise.",
  },
  radiation: {
    name: 'Radiation dose',
    howToMeasure: [
      'Wear your personal dosimeter at all times.',
      'Check the daily reading on this screen. It updates on its own.',
      'Report any alarm at once.',
    ],
    whyItMatters:
      'Cosmic rays and solar storms raise cancer risk over a career, and a strong solar storm can cause radiation sickness. NASA limits each astronaut to 600 mSv over a whole career.',
  },
  co2: {
    name: 'Cabin CO2',
    howToMeasure: ['Read the CO2 value on the cabin environment display.', 'Compare it with the normal level shown in Trends.'],
    whyItMatters:
      "Air doesn't rise or mix by itself in weightlessness, so breathed-out CO2 can collect around your head. Higher CO2 is linked to headaches, tiredness and poor focus.",
  },
  vision: {
    name: 'Vision',
    howToMeasure: [
      'Cover one eye and read the vision chart at the marked distance. Repeat with the other eye.',
      'Note any blur, shadow or distortion.',
      'Do the eye scan weekly if you are trained on it.',
    ],
    whyItMatters:
      'The fluid shift toward the head can change the shape of the eye and the optic nerve. NASA calls this Spaceflight Associated Neuro-ocular Syndrome (SANS). Early checks catch changes before they get worse.',
  },
}
