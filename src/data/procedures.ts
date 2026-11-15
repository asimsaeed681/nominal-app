// Written with AI assistance (Claude) and reviewed by the team.
// Onboard procedures (SPEC 6.3 and 9). Final reviewed text from CONTENT.md, word for word.
// Every procedure ends with a step that involves the Crew Medical Officer (CMO) or the downlink.
import type { HazardId, ProcedureId } from '../lib/evaluate'

export type Step = string | { text: string; sub: string[] }

export interface Procedure {
  id: ProcedureId
  title: string
  hazard: HazardId // the hazard row this procedure belongs to
  block?: { level: 'caution' | 'warning'; text: string }
  steps: Step[]
}

export const procedures: Procedure[] = [
  {
    id: 'MED-SLP-01',
    title: 'Sleep recovery',
    hazard: 'isolation',
    block: { level: 'caution', text: 'Short sleep for several days slows reactions and raises the chance of mistakes.' },
    steps: [
      'Check your sleep data for the last 7 days.',
      'Dim the cabin lights and stop screen use 1 hour before your sleep period.',
      'Move any non-urgent work out of the hour before sleep.',
      'Use earplugs and an eye mask in your sleep station.',
      'Use sleep medication only if the Crew Medical Officer has approved it.',
      'Tell the Crew Medical Officer about the sleep loss and your recovery plan.',
    ],
  },
  {
    id: 'MED-FTG-01',
    title: 'Fatigue: no-go for critical tasks',
    hazard: 'isolation',
    block: {
      level: 'warning',
      text: 'Do not do a spacewalk, docking, robotic arm work or any other critical task until your reaction time recovers.',
    },
    steps: [
      'Stop your current task and save your work.',
      'Drink water and eat a small snack.',
      'Rest somewhere dark and quiet for at least 30 minutes.',
      'Repeat the reaction test.',
      'If it is still 22% or more slower, stay off critical tasks for today.',
      "Tell the Crew Medical Officer and add the result to today's downlink.",
    ],
  },
  {
    id: 'MED-MOD-01',
    title: 'Low mood support',
    hazard: 'isolation',
    block: { level: 'caution', text: 'Low mood that lasts can affect your safety and the whole crew.' },
    steps: [
      'Take 30 minutes of private time away from work today.',
      'Write down what has been bothering you in your personal log.',
      'Do something that helps you reset: music, a film, a window view, or a hobby.',
      'Plan a call with family or friends at the next contact window.',
      'Talk to the Crew Medical Officer, who can set up a private call with the flight psychologist.',
    ],
  },
  {
    id: 'MED-CO2-01',
    title: 'CO2 symptom response',
    hazard: 'environment',
    block: { level: 'warning', text: 'High CO2 can cause confusion. Avoid critical tasks until the level is back to normal.' },
    steps: [
      'Stop hard exercise for now, since it adds CO2.',
      'Move to an area with good airflow, away from corners and closed spaces.',
      'Point a portable fan at your work area and your sleep station.',
      'Check the life support panel for CO2 scrubber alerts and tell the flight engineer.',
      'Use pain relief from the medical kit for the headache if needed.',
      'Ask the Crew Medical Officer to report the symptoms to Mission Control.',
    ],
  },
  {
    id: 'MED-SPE-01',
    title: 'Solar particle event: shelter',
    hazard: 'radiation',
    block: { level: 'warning', text: 'A strong solar storm can give a dangerous dose within hours. Shelter right away.' },
    steps: [
      'Acknowledge the radiation alarm.',
      'Make sure your dosimeter is on you.',
      'Go to the storm shelter, the most shielded part of the spacecraft.',
      'Build a wall around yourself with water bags and stowage bags.',
      'Stay in the shelter until the alarm clears.',
      'Confirm your shelter status to the Crew Medical Officer and Mission Control.',
    ],
  },
  {
    id: 'MED-VIS-01',
    title: 'Vision change check (SANS)',
    hazard: 'environment',
    block: { level: 'caution', text: 'Report every vision change. Early checks help prevent lasting eye damage.' },
    steps: [
      'Cover your left eye and read the vision chart at the marked distance.',
      'Cover your right eye and repeat.',
      'Write down what changed: blur, shadow, or bent lines.',
      'If reading is blurry, put on the extra-strength glasses from the kit.',
      'Do the eye scan if you are trained, and save the images.',
      'Tell the Crew Medical Officer today so Mission Control can review the images.',
    ],
  },
  {
    id: 'MED-EXR-01',
    title: 'Exercise catch-up',
    hazard: 'gravity',
    block: { level: 'caution', text: 'Missed exercise speeds up bone and muscle loss.' },
    steps: [
      'Find what caused the missed sessions in your schedule.',
      'Ask the commander to move a low-priority task so you have time.',
      'Do 30 minutes of cardio on the bike or treadmill.',
      'Do 45 minutes of heavy resistance exercise.',
      'Check that the minutes were saved.',
      'Tell the Crew Medical Officer your catch-up plan.',
    ],
  },
]

export const procedureTitles = Object.fromEntries(procedures.map((p) => [p.id, p.title])) as Record<ProcedureId, string>
