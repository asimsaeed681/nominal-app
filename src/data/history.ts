// Written with AI assistance (Claude) and reviewed by the team.
// Simulated history for FE-2, ported from ../astropulse/core/simulate.py.
// Seeded, so every run (and every mission profile) tells the same story:
// isolation drift from day 88, solar particle event on day 97 (size depends on the profile),
// CO2 fault days 110 to 118.
import { gauss, mulberry32 } from '../lib/random.ts'
import { MISSION_START } from '../lib/time.ts'
import type { Profile } from './profiles.ts'

export const TODAY = 118
export const MISSION_DAYS = 180
export const PRIOR_DOSE_MSV = 40
const DAY_MS = 86_400_000

/** 1 = lowest option, 5 = highest, in the order the check-in shows them. */
export type Scale = 1 | 2 | 3 | 4 | 5

export type Symptom =
  | 'Headache'
  | 'Congestion'
  | 'Vision change'
  | 'Back pain'
  | 'Nausea'
  | 'Dizziness'
  | 'Skin irritation'
  | 'Trouble sleeping'

/** What the astronaut enters in the morning check-in. */
export interface CheckIn {
  time: string // "07:10"
  sleepH: number
  sleepQuality: Scale // Very poor .. Very good
  mood: Scale // Very low .. Very good
  stress: Scale // None .. Very high
  symptoms: Symptom[]
  sysBp: number
  diaBp: number
  restingHr: number
  bodyTempC: number
  bloodSugar: number // fasting, mg/dL
  exerciseMin: number // yesterday
  reactionMs: number | null // null = test skipped
}

export interface Day {
  day: number
  // onboard sensors, every day
  doseMsv: number
  co2Ppm: number
  cabinTempC: number
  // weekly routine
  bodyMassKg: number | null // Mondays
  visionCheck: 'normal' | null // Thursdays
  checkIn: CheckIn | null // null = missed, or not done yet today
}

/** Device and default values the check-in starts from today (day 118). */
export const todayPrefill: CheckIn = {
  time: '07:10',
  sleepH: 5.0,
  sleepQuality: 2,
  mood: 2,
  stress: 4,
  symptoms: ['Headache'],
  sysBp: 126,
  diaBp: 82,
  restingHr: 69,
  bodyTempC: 36.9,
  bloodSugar: 94,
  exerciseMin: 90,
  reactionMs: null, // comes from the real reaction test
}

/** 0 = Sunday. Day 118 falls on today's real date. Noon avoids daylight-saving edges. */
export const weekday = (day: number) => new Date(MISSION_START + (day - 1) * DAY_MS + DAY_MS / 2).getDay()

const ramp = (d: number, start: number, end: number) => Math.min(Math.max((d - start) / (end - start), 0), 1)
const clip = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi)
const round1 = (x: number) => Math.round(x * 10) / 10
const pad = (n: number) => String(n).padStart(2, '0')

/** Days 1 to 118. Day 118 has sensor data, plus `today` once the check-in is saved. */
export function buildHistory(profile: Profile, today: CheckIn | null = null): Day[] {
  const rand = mulberry32(7)
  const g = (sd: number) => gauss(rand, sd)
  const days: Day[] = []
  let mass = 78

  for (let d = 1; d <= TODAY; d++) {
    const k = ramp(d, 88, 120) // isolation story, 0 to 1
    const fault = d >= 110 && d <= 118 ? 1700 + 800 * Math.max(1 - Math.abs(d - 114) / 6, 0) : 0
    const co2Ppm = Math.round(Math.max(2300 + g(180) + fault, 1500))
    const highCo2 = co2Ppm > 3500

    // draw every number every day, so all profiles share one sequence
    const fluidHeadache = rand() < 0.5
    const co2Headache = rand() < 0.75
    const symptoms: Symptom[] = []
    if (d <= 5) symptoms.push('Congestion') // first days of fluid shift
    if ((d <= 5 && fluidHeadache) || (highCo2 && co2Headache)) symptoms.push('Headache')

    const minute = 410 + Math.floor(rand() * 30) // 06:50 to 07:19
    const checkIn: CheckIn = {
      time: `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`,
      // drift tuned so days 112 to 117 sit at CAUTION (sleep ~5.9 h, mood ~3, stress ~3.3, reaction ~16% slower)
      sleepH: round1(clip(7.2 + g(0.35) - 0.9 * k - (highCo2 ? 0.5 : 0), 3, 10)),
      sleepQuality: clip(Math.round(4 + g(0.5) - 2 * k), 1, 5) as Scale,
      mood: clip(Math.round(4 + g(0.35) - 1.2 * k), 1, 5) as Scale,
      stress: clip(Math.round(2 + g(0.35) + 1.4 * k), 1, 5) as Scale,
      symptoms,
      sysBp: Math.round(120 + g(4)),
      diaBp: Math.round(78 + g(3)),
      restingHr: Math.round(62 + g(2) + 6 * k),
      bodyTempC: round1(36.7 + g(0.15)),
      bloodSugar: Math.round(88 + g(3)),
      exerciseMin: Math.round(clip(125 + g(12), 0, 180)),
      reactionMs: Math.round(255 + g(8) + 0.10 * 255 * k + (highCo2 ? 12 : 0)),
    }
    mass += g(0.03)

    days.push({
      day: d,
      doseMsv: Math.round((profile.dailyDoseMsv * (1 + g(0.05)) + (d === 97 ? profile.speExtraMsv : 0)) * 1000) / 1000,
      co2Ppm,
      cabinTempC: round1(22.5 + g(0.6)),
      bodyMassKg: d < TODAY && weekday(d) === 1 ? round1(mass) : null,
      visionCheck: d < TODAY && weekday(d) === 4 ? 'normal' : null,
      checkIn: d === TODAY ? today : d === 94 ? null : checkIn, // day 94 missed, so the streak is 23
    })
  }
  return days
}

/** Days in a row with a check-in, counting back from today (or yesterday if today is not done). */
export function checkinStreak(days: Day[]) {
  let i = days.length - 1
  if (!days[i].checkIn) i--
  let n = 0
  while (i >= 0 && days[i].checkIn) {
    n++
    i--
  }
  return n
}
