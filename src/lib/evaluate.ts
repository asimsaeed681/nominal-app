// Written with AI assistance (Claude) and reviewed by the team.
// Turns the history into a status for each NASA hazard and each body region.
// Ported from ../astropulse/core/engine.py. Runs fully offline.
import { MISSION_DAYS, PRIOR_DOSE_MSV, type CheckIn, type Day, type Symptom } from '../data/history.ts'
import type { Profile } from '../data/profiles.ts'

export type Status = 'nominal' | 'caution' | 'warning'
export type HazardId = 'radiation' | 'isolation' | 'distance' | 'gravity' | 'environment'
export const hazardNames: Record<HazardId, string> = {
  radiation: 'Radiation',
  isolation: 'Isolation',
  distance: 'Distance',
  gravity: 'Gravity',
  environment: 'Environment',
}
export type RegionId =
  | 'brain'
  | 'eyes'
  | 'innerEar'
  | 'heart'
  | 'airway'
  | 'metabolism'
  | 'bones'
  | 'muscles'
  | 'immune'
  | 'wholeBody'
export type ProcedureId =
  | 'MED-SLP-01'
  | 'MED-FTG-01'
  | 'MED-MOD-01'
  | 'MED-CO2-01'
  | 'MED-SPE-01'
  | 'MED-VIS-01'
  | 'MED-EXR-01'

export interface HazardResult {
  id: HazardId
  status: Status
  key: { value: string; unit: string } // "47%" "of limit": a % sits on its number, every other unit after a space
  baseline: string
  findings: string[]
  procedures: ProcedureId[] // warnings first
}

export type TrendId = 'sleep' | 'mood' | 'stress' | 'reaction' | 'exercise' | 'restingHr' | 'careerDose' | 'co2'

/** One row of the Body screen's "Your readings" table. status null = no data yet, no chip. */
export interface Reading {
  id?: TrendId // set on the readings the Trends screen charts
  indicator: string
  value: string
  baseline: string
  status: Status | null
}

export interface RegionResult {
  status: Status
  findings: string[]
  readings: Reading[]
  procedures: ProcedureId[] // warnings first
}

export interface Evaluation {
  day: number
  hazards: HazardResult[] // RIDGE order
  regions: Record<RegionId, RegionResult>
  // why each procedure is open now: worst status first; absent = not triggered
  triggers: Partial<Record<ProcedureId, { status: Status; reasons: string[] }>>
  warnings: number
  cautions: number
}

// NASA-STD-3001 limits
const CAREER_LIMIT_MSV = 600
const SPE_EVENT_LIMIT_MSV = 250
// app settings (our thresholds, tune with a flight surgeon)
const EXERCISE_TARGET_MIN = 120
const MONTHLY_BONE_LOSS_NO_EXERCISE = 1.5

const RANK: Record<Status, number> = { nominal: 0, caution: 1, warning: 2 }
const REGIONS: RegionId[] = ['brain', 'eyes', 'innerEar', 'heart', 'airway', 'metabolism', 'bones', 'muscles', 'immune', 'wholeBody']

const level = (warning: boolean, caution: boolean): Status => (warning ? 'warning' : caution ? 'caution' : 'nominal')
const worst = (s: Status[]) => s.reduce<Status>((a, b) => (RANK[b] > RANK[a] ? b : a), 'nominal')
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const round1 = (x: number) => Math.round(x * 10) / 10
const n0 = (x: number) => Math.round(x).toLocaleString('en-US')
const f1 = (x: number) => x.toFixed(1)
const uniq = <T,>(xs: T[]) => [...new Set(xs)]
const cap = (s: string) => s[0].toUpperCase() + s.slice(1) // reading values start with a capital: "Normal"
const dayCount = (n: number) => `${n} day${n === 1 ? '' : 's'}`

// Single-reading ranges (SPEC 8.2), shared with the check-in's inline chips
export const bpStatus = (sys: number, dia: number) => level(false, sys >= 140 || dia >= 90)
export const hrStatus = (hr: number) => level(false, hr >= 100)
export const tempStatus = (t: number) => level(t >= 38, t > 37.2 || t < 35.5)
export const sugarStatus = (g: number) => level(g >= 126 || g < 54, g >= 100 || g < 70)
/** pct = how much slower than baseline, in % */
export const reactionStatus = (pct: number) => level(pct >= 22, pct >= 12)

/** Average of one check-in field over some days, skipping missed check-ins and skipped tests. */
function avg(days: Day[], f: (c: CheckIn) => number | null) {
  return mean(days.flatMap((d) => (d.checkIn && f(d.checkIn) != null ? [f(d.checkIn)!] : [])))
}

interface Check {
  hazard?: HazardId // undefined = Body screen only
  regions: RegionId[]
  status: Status
  text: string
  procedure?: ProcedureId // linked only when the check is not nominal
  readings: Reading[]
}

// a reading takes its check's status unless it sets its own
type ReadingIn = Omit<Reading, 'status'> & { status?: Status | null }

const byRank = (a: Check, b: Check) => RANK[b.status] - RANK[a.status]

/** Problems first; pad with plain readings up to 3 sentences. Never drops a problem. */
function findings(checks: Check[]) {
  const flagged = checks.filter((c) => c.status !== 'nominal').sort(byRank)
  const plain = checks.filter((c) => c.status === 'nominal' && c.text)
  return [...flagged, ...plain].slice(0, Math.max(3, flagged.length)).map((c) => c.text)
}

/**
 * Evaluates the last day in `days` (today). Baseline = days 1 to 14, recent = last 7 days
 * including today. Rules that need today's check-in are skipped until it is saved.
 * Thresholds compare the rounded numbers the astronaut sees, so text and status always agree.
 */
export function evaluate(days: Day[], profile: Profile): Evaluation {
  const today = days[days.length - 1]
  const t = today.day
  const c = today.checkIn
  const base = days.filter((d) => d.day <= 14)
  const week = days.filter((d) => d.day > t - 7)
  const checks: Check[] = []
  const add = (
    hazard: HazardId | undefined,
    regions: RegionId[],
    status: Status,
    text: string,
    procedure?: ProcedureId,
    readings: ReadingIn[] = [],
  ) => checks.push({ hazard, regions, status, text, procedure, readings: readings.map((r) => ({ ...r, status: r.status === undefined ? status : r.status })) })
  // Body-screen row with no rule behind it: a reading that needs today's check-in, or a symptom with no threshold
  const note = (regions: RegionId[], indicator: string, value: string, baseline: string) =>
    add(undefined, regions, 'nominal', '', undefined, [{ indicator, value, baseline, status: null }])
  const NOT_YET = 'No check-in yet'
  const symptom = (s: Symptom) => (c!.symptoms.includes(s) ? 'Reported' : 'None')

  // ---------- Radiation ----------
  const career = PRIOR_DOSE_MSV + days.reduce((s, d) => s + d.doseMsv, 0)
  const pct = Math.round((career / CAREER_LIMIT_MSV) * 100)
  const rate = mean(week.map((d) => d.doseMsv))
  const proj = career + rate * Math.max(0, MISSION_DAYS - t)
  const projPct = Math.round((proj / CAREER_LIMIT_MSV) * 100)
  const limit = `limit ${CAREER_LIMIT_MSV} mSv`
  add('radiation', ['wholeBody'], level(pct >= 80, pct >= 50),
    `Your career dose is ${n0(career)} mSv, ${pct}% of the ${CAREER_LIMIT_MSV} mSv limit.`, undefined,
    [{ id: 'careerDose', indicator: 'Career radiation dose', value: `${n0(career)} mSv`, baseline: limit }])
  add('radiation', ['wholeBody'], level(projPct >= 100, projPct >= 80),
    `At ${rate.toFixed(2)} mSv a day you will reach about ${n0(proj)} mSv (${projPct}% of the limit) by day ${MISSION_DAYS}.`, undefined,
    [{ indicator: `Projected dose by day ${MISSION_DAYS}`, value: `${n0(proj)} mSv`, baseline: limit }])
  const spike = days.filter((d) => d.doseMsv > 10).at(-1)
  if (spike) {
    const ago = t - spike.day
    if (ago <= 3) {
      const when = ago === 0 ? 'today' : `${ago} day${ago > 1 ? 's' : ''} ago`
      add('radiation', ['wholeBody'], 'warning', `Solar particle event ${when}: ${f1(spike.doseMsv)} mSv in one day.`, 'MED-SPE-01')
    } else {
      add('radiation', ['wholeBody'], 'nominal',
        `Solar particle event on day ${spike.day}: ${f1(spike.doseMsv)} mSv in one day (the per-event limit is ${SPE_EVENT_LIMIT_MSV} mSv).`)
    }
  }

  // ---------- Isolation (reaction first: its procedure is the no-go for critical tasks) ----------
  const rt7 = Math.round(avg(week, (c) => c.reactionMs))
  const rt0 = Math.round(avg(base, (c) => c.reactionMs))
  const slow = Math.round(((rt7 - rt0) / rt0) * 100)
  add('isolation', ['brain'], reactionStatus(slow),
    `Reaction time is ${Math.abs(slow)}% ${slow >= 0 ? 'slower' : 'faster'} than your baseline (${rt7} ms vs ${rt0} ms).`, 'MED-FTG-01',
    [{ id: 'reaction', indicator: 'Reaction time, 7-day average', value: `${rt7} ms`, baseline: `${rt0} ms` }])
  const sleep7 = round1(avg(week, (c) => c.sleepH))
  const sleep0 = round1(avg(base, (c) => c.sleepH))
  add('isolation', ['brain'], level(sleep7 < 5.5, sleep7 < 6.5),
    `You averaged ${f1(sleep7)} h of sleep over the last 7 days (baseline ${f1(sleep0)} h).`, 'MED-SLP-01',
    [{ id: 'sleep', indicator: 'Sleep, 7-day average', value: `${f1(sleep7)} h`, baseline: `${f1(sleep0)} h` }])
  const mood7 = round1(avg(week, (c) => c.mood))
  const stress7 = round1(avg(week, (c) => c.stress))
  const mood0 = f1(avg(base, (c) => c.mood))
  const stress0 = f1(avg(base, (c) => c.stress))
  const moodS = level(mood7 <= 2.5, mood7 <= 3.2)
  const stressS = level(stress7 >= 4, stress7 >= 3.2)
  add('isolation', ['brain'], worst([moodS, stressS]),
    `Mood averaged ${f1(mood7)} / 5 and stress ${f1(stress7)} / 5 over the last 7 days (baseline ${mood0} and ${stress0}).`, 'MED-MOD-01',
    [
      { id: 'mood', indicator: 'Mood, 7-day average', value: `${f1(mood7)} / 5`, baseline: `${mood0} / 5`, status: moodS },
      { id: 'stress', indicator: 'Stress, 7-day average', value: `${f1(stress7)} / 5`, baseline: `${stress0} / 5`, status: stressS },
    ])
  // escalation: a CAUTION trend plus a short night and low mood today means act now
  const trend = worst(checks.filter((k) => k.hazard === 'isolation').map((k) => k.status))
  if (trend === 'caution' && c && c.sleepH <= 5 && c.mood <= 2) {
    add('isolation', ['brain'], 'warning', `Sleep debt is building and last night was short (${f1(c.sleepH)} h).`, 'MED-SLP-01')
  }
  if (c && c.sleepH < 5) add('isolation', ['brain'], 'caution', `You slept only ${f1(c.sleepH)} h last night.`, 'MED-SLP-01')

  // ---------- Gravity (plus body mass) ----------
  const ex7 = Math.round(avg(week, (c) => c.exerciseMin))
  const ex0 = Math.round(avg(base, (c) => c.exerciseMin))
  add('gravity', ['bones', 'muscles'], level(ex7 < 60, ex7 < 90),
    `You exercised ${ex7} min a day on average this week (target ${EXERCISE_TARGET_MIN} min).`, 'MED-EXR-01',
    [{ id: 'exercise', indicator: 'Exercise, 7-day average', value: `${ex7} min`, baseline: `${ex0} min` }])
  // 1.5% a month with no exercise, half that at the full 120 min; missed days count at the average rate
  const dailyLoss = avg(days, (c) => (MONTHLY_BONE_LOSS_NO_EXERCISE / 30) * (1 - 0.5 * Math.min(c.exerciseMin / EXERCISE_TARGET_MIN, 1)))
  const bone = round1(dailyLoss * t)
  add('gravity', ['bones'], level(bone >= 6, bone >= 4), `Estimated bone loss so far this mission is ${f1(bone)}%.`, undefined,
    [{ indicator: 'Estimated bone loss', value: `${f1(bone)}%`, baseline: '0% at launch' }])
  const hr7 = Math.round(avg(week, (c) => c.restingHr))
  const hr0 = Math.round(avg(base, (c) => c.restingHr))
  add('gravity', ['heart'], level(false, hr7 - hr0 >= 8),
    `Resting heart rate averaged ${hr7} bpm this week, ${hr7 >= hr0 ? 'up' : 'down'} ${Math.abs(hr7 - hr0)} bpm from your baseline of ${hr0} bpm.`, undefined,
    [{ id: 'restingHr', indicator: 'Resting heart rate, 7-day average', value: `${hr7} bpm`, baseline: `${hr0} bpm` }])
  const bp0 = `${Math.round(avg(base, (c) => c.sysBp))}/${Math.round(avg(base, (c) => c.diaBp))} mmHg`
  if (c) {
    add('gravity', ['heart'], worst([hrStatus(c.restingHr), bpStatus(c.sysBp, c.diaBp)]),
      `Today's heart rate is ${c.restingHr} bpm and blood pressure ${c.sysBp}/${c.diaBp} mmHg.`, undefined,
      [{ indicator: 'Blood pressure today', value: `${c.sysBp}/${c.diaBp} mmHg`, baseline: bp0, status: bpStatus(c.sysBp, c.diaBp) }])
  } else note(['heart'], 'Blood pressure today', NOT_YET, bp0)
  const weighed = days.filter((d) => d.bodyMassKg != null)
  const mass = weighed.at(-1)
  if (mass) {
    const mass0 = mean(weighed.filter((d) => d.day <= 14).map((d) => d.bodyMassKg!))
    const chg = round1(((mass.bodyMassKg! - mass0) / mass0) * 100)
    add('gravity', ['metabolism', 'muscles'], level(false, chg <= -3),
      `Body mass is ${f1(mass.bodyMassKg!)} kg (day ${mass.day}), ${f1(Math.abs(chg))}% ${chg < 0 ? 'below' : 'above'} your baseline of ${f1(mass0)} kg.`, undefined,
      [{ indicator: `Body mass, day ${mass.day}`, value: `${f1(mass.bodyMassKg!)} kg`, baseline: `${f1(mass0)} kg` }])
  }

  // ---------- Metabolism (Body screen only) ----------
  const sugar0 = `${Math.round(avg(base, (c) => c.bloodSugar))} mg/dL`
  if (c) {
    add(undefined, ['metabolism'], sugarStatus(c.bloodSugar),
      `Fasting blood sugar is ${c.bloodSugar} mg/dL (general clinical range 70 to 99 mg/dL).`, undefined,
      [{ indicator: 'Blood sugar (fasting) today', value: `${c.bloodSugar} mg/dL`, baseline: sugar0 }])
  } else note(['metabolism'], 'Blood sugar (fasting) today', NOT_YET, sugar0)

  // ---------- Environment (plus body temperature and eyes) ----------
  const co2 = today.co2Ppm
  const co20 = mean(base.map((d) => d.co2Ppm))
  add('environment', ['airway'], level(co2 >= 4000, co2 >= 3000), `Cabin CO2 is ${n0(co2)} ppm (baseline ${n0(co20)} ppm).`, 'MED-CO2-01',
    [{ id: 'co2', indicator: 'Cabin CO2', value: `${n0(co2)} ppm`, baseline: `${n0(co20)} ppm` }])
  const headaches = week.filter((d) => d.checkIn?.symptoms.includes('Headache')).length
  // baseline as days per week over days 1 to 14
  const headache0 = Math.round(base.filter((d) => d.checkIn?.symptoms.includes('Headache')).length / 2)
  const headache: ReadingIn = { indicator: 'Headache, last 7 days', value: dayCount(headaches), baseline: dayCount(headache0) }
  if (headaches) {
    add('environment', ['airway'], level(false, headaches >= 3),
      `You had a headache on ${headaches} of the last 7 days${co2 >= 3000 ? ', while cabin CO2 was high' : ''}.`, 'MED-CO2-01', [headache])
  } else add(undefined, ['airway'], 'nominal', '', undefined, [headache])
  if (c) {
    note(['airway'], 'Congestion today', symptom('Congestion'), 'None')
    const vision: ReadingIn = { indicator: 'Vision change today', value: symptom('Vision change'), baseline: 'None' }
    if (c.symptoms.includes('Vision change')) {
      add('environment', ['eyes'], 'warning',
        'You reported a vision change today. This can be a sign of SANS, a known spaceflight eye condition.', 'MED-VIS-01', [vision])
    } else add(undefined, ['eyes'], 'nominal', '', undefined, [vision])
    const inner = c.symptoms.filter((s) => s === 'Dizziness' || s === 'Nausea')
    const innerReadings = (['Dizziness', 'Nausea'] as const).map((s) => ({
      indicator: `${s} today`, value: symptom(s), baseline: 'None', status: c.symptoms.includes(s) ? 'caution' as const : 'nominal' as const,
    }))
    if (inner.length) add('environment', ['innerEar'], 'caution', `You reported ${inner.join(' and ').toLowerCase()} today.`, undefined, innerReadings)
    else add(undefined, ['innerEar'], 'nominal', 'No dizziness or nausea today.', undefined, innerReadings)
    add('environment', ['immune'], tempStatus(c.bodyTempC),
      `Body temperature is ${f1(c.bodyTempC)} °C (normal range 36.1 to 37.2 °C).`, undefined,
      [{ indicator: 'Body temperature today', value: `${f1(c.bodyTempC)} °C`, baseline: `${f1(avg(base, (c) => c.bodyTempC))} °C` }])
    note(['immune'], 'Skin irritation today', symptom('Skin irritation'), 'None')
  } else {
    note(['airway'], 'Congestion today', NOT_YET, 'None')
    note(['eyes'], 'Vision change today', NOT_YET, 'None')
    note(['innerEar'], 'Dizziness today', NOT_YET, 'None')
    note(['innerEar'], 'Nausea today', NOT_YET, 'None')
    note(['immune'], 'Body temperature today', NOT_YET, `${f1(avg(base, (c) => c.bodyTempC))} °C`)
    note(['immune'], 'Skin irritation today', NOT_YET, 'None')
  }
  const vision = days.filter((d) => d.visionCheck).at(-1)
  if (vision) {
    add(undefined, ['eyes'], 'nominal', `Your last weekly vision check (day ${vision.day}) was ${vision.visionCheck}.`, undefined,
      [{ indicator: `Weekly vision check, day ${vision.day}`, value: cap(vision.visionCheck!), baseline: 'Normal' }])
  }
  const cabin = today.cabinTempC
  add('environment', [], level(false, cabin < 18 || cabin > 27), `Cabin temperature is ${f1(cabin)} °C.`)

  // ---------- Build the rows ----------
  const row = (id: HazardId, key: HazardResult['key'], baseline: string): HazardResult => {
    const mine = checks.filter((k) => k.hazard === id)
    return {
      id,
      status: worst(mine.map((k) => k.status)),
      key,
      baseline,
      findings: findings(mine),
      procedures: uniq(mine.filter((k) => k.status !== 'nominal' && k.procedure).sort(byRank).map((k) => k.procedure!)),
    }
  }
  const radiation = row('radiation', { value: `${pct}%`, unit: 'of limit' }, `${n0(career)} / ${CAREER_LIMIT_MSV} mSv`)
  const isolation = row('isolation', { value: String(rt7), unit: 'ms reaction' }, `${rt0} ms`)
  const gravity = row('gravity', { value: String(ex7), unit: 'min exercise' }, `${ex0} min`)
  const environment = row('environment', { value: n0(co2), unit: 'ppm CO2' }, `${n0(co20)} ppm`)

  // ---------- Distance: not a body reading, it sets how much the crew handles alone ----------
  const warned = [radiation, isolation, gravity, environment].filter((h) => h.status === 'warning')
  const delay = `Signals to Earth take ${profile.owlt} each way.`
  let distStatus: Status
  let distText: string
  if (profile.owltMin >= 5) {
    distStatus = warned.length ? 'warning' : 'nominal'
    distText = warned.length
      ? "Act on warnings now using onboard procedures. Earth can't help in real time."
      : 'Autonomy mode. Daily report keeps Mission Control informed.'
  } else {
    distStatus = warned.length ? 'caution' : 'nominal'
    distText = warned.length
      ? 'Mission Control can help in real time. Call them about the warnings.'
      : 'Mission Control is a short call away.'
  }
  const distance: HazardResult = {
    id: 'distance',
    status: distStatus,
    key: profile.owltMin ? { value: String(profile.owltMin), unit: 'min OWLT' } : { value: profile.owlt, unit: '' },
    baseline: 'n/a',
    findings: profile.owltMin >= 5 ? [distText, delay] : [distText],
    procedures: uniq(warned.flatMap((h) => h.procedures)),
  }

  const hazards = [radiation, isolation, distance, gravity, environment]
  const regions = Object.fromEntries(
    REGIONS.map((r) => {
      const mine = checks.filter((k) => k.regions.includes(r))
      return [r, {
        status: worst(mine.map((k) => k.status)),
        findings: findings(mine),
        readings: mine.flatMap((k) => k.readings),
        procedures: uniq(mine.filter((k) => k.status !== 'nominal' && k.procedure).sort(byRank).map((k) => k.procedure!)),
      }]
    }),
  ) as Record<RegionId, RegionResult>

  const triggers: Evaluation['triggers'] = {}
  for (const k of checks.filter((k) => k.status !== 'nominal' && k.procedure).sort(byRank)) {
    const tr = (triggers[k.procedure!] ??= { status: k.status, reasons: [] })
    tr.reasons.push(k.text)
  }

  return {
    day: t,
    hazards,
    regions,
    triggers,
    warnings: hazards.filter((h) => h.status === 'warning').length,
    cautions: hazards.filter((h) => h.status === 'caution').length,
  }
}
