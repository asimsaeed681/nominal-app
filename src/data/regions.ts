// Written with AI assistance (Claude) and reviewed by the team.
// Body screen copy (SPEC 6.7). Risk names are the exact NASA HRP names from the spec table.
// Final reviewed explanations from CONTENT.md, word for word.
import type { RegionId } from '../lib/evaluate'

export interface Region {
  name: string
  risks: string[]
  whatItDoes: string
  spaceEffect: string
  howToCheck: string
}

export const regions: Record<RegionId, Region> = {
  brain: {
    name: 'Brain',
    risks: ['Risk of Behavioral Changes and Psychiatric Disorders', 'Risk of Inadequate Sleep and Irregular Schedules'],
    whatItDoes: 'Controls thinking, sleep, mood and reactions.',
    spaceEffect:
      'Isolation, distance from home and broken sleep can lower mood and slow thinking. NASA tracks this as the risk of behavioral changes and the risk of inadequate sleep.',
    howToCheck: 'Daily mood, stress and sleep entries, plus the reaction test.',
  },
  eyes: {
    name: 'Eyes',
    risks: ['Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS)'],
    whatItDoes: 'Vision, needed for almost every task on board.',
    spaceEffect: 'Fluids shift toward the head and can change the back of the eye and the optic nerve (SANS).',
    howToCheck: 'Vision chart in each eye, report any blur, and the weekly eye scan.',
  },
  innerEar: {
    name: 'Inner ear',
    risks: ['Risk of Altered Sensorimotor and Vestibular Function'],
    whatItDoes: 'Senses balance and movement.',
    spaceEffect:
      'Without gravity the balance system gets mixed signals, which can cause motion sickness and dizziness, especially in the first days and after landing.',
    howToCheck: 'Log any dizziness or nausea in the check-in.',
  },
  heart: {
    name: 'Heart and vessels',
    risks: ['Risk of Cardiovascular Adaptations'],
    whatItDoes: 'Pumps blood and oxygen through the body.',
    spaceEffect: 'Fluids move toward the head, blood volume drops and the heart adapts. This can cause dizziness when gravity returns.',
    howToCheck: 'Resting heart rate and blood pressure each morning.',
  },
  airway: {
    name: 'Airway',
    risks: ['Hostile closed environment: cabin air'],
    whatItDoes: 'Brings in oxygen and removes CO2.',
    spaceEffect: 'In a closed cabin, CO2 can build up near your face. Congestion is also common from the fluid shift.',
    howToCheck: 'Cabin CO2 reading, and log headaches or congestion.',
  },
  metabolism: {
    name: 'Metabolism',
    risks: ['Risk of Inadequate Food and Nutrition'],
    whatItDoes: 'Turns food into energy.',
    spaceEffect: 'Appetite often drops, and menus get repetitive. Eating too little leads to muscle and bone loss.',
    howToCheck: 'Fasting blood sugar daily and body mass weekly.',
  },
  bones: {
    name: 'Bones',
    risks: ['Risk of Spaceflight-Induced Bone Changes'],
    whatItDoes: 'Supports the body and protects organs.',
    spaceEffect: 'Without load, bones in the hips, spine and legs lose density and become more fragile.',
    howToCheck: 'Daily exercise minutes and the estimated bone loss in Trends.',
  },
  muscles: {
    name: 'Muscles',
    risks: ['Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness'],
    whatItDoes: 'Movement, strength and posture.',
    spaceEffect: "Muscles that fight gravity on Earth weaken quickly when they aren't used. Heart and lung fitness also drop.",
    howToCheck: 'Daily exercise minutes and weekly body mass.',
  },
  immune: {
    name: 'Immune system and skin',
    risks: ['Risk of Altered Immune System Responses'],
    whatItDoes: 'Fights infection and protects the body surface.',
    spaceEffect: 'Stress and the space environment change immune responses, and dormant viruses can wake up and cause rashes or illness.',
    howToCheck: 'Body temperature and any skin irritation in the check-in.',
  },
  wholeBody: {
    name: 'Whole body',
    risks: ['Risk of Radiation-Induced Cancers'],
    whatItDoes: 'Every cell can be affected by radiation.',
    spaceEffect: 'Space radiation passes through the spacecraft and the body, raising long-term cancer risk.',
    howToCheck: "Your career dose against NASA's 600 mSv limit, updated every day from your dosimeter.",
  },
}
