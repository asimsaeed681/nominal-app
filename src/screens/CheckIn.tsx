// Written with AI assistance (Claude) and reviewed by the team.
// GATHER: the morning check-in wizard (SPEC 6.2). One question per step, deep-linkable as #/checkin/<step>.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Ban, Bone, Brain, Eye, Hand, Moon, Orbit, Waves, Wind, type LucideIcon } from 'lucide-react'
import Stepper from '../components/Stepper'
import Segmented from '../components/Segmented'
import ToggleTile from '../components/ToggleTile'
import InfoSheet from '../components/InfoSheet'
import StatusChip from '../components/StatusChip'
import ReactionTest, { type ReactionResult } from '../components/ReactionTest'
import { buildHistory, todayPrefill, type CheckIn as CheckInData, type Scale, type Symptom } from '../data/history'
import type { IndicatorId } from '../data/indicators'
import type { Profile } from '../data/profiles'
import { bpStatus, evaluate, hrStatus, sugarStatus, tempStatus, type Status } from '../lib/evaluate'
import { saveCheckIn, useCheckInStore, type Change } from '../lib/storage'

const STEPS = ['sleep', 'mind', 'body', 'measure', 'exercise', 'reaction', 'review'] as const

const QUALITY = ['Very poor', 'Poor', 'Okay', 'Good', 'Very good']
const MOOD = ['Very low', 'Low', 'Okay', 'Good', 'Very good']
const STRESS = ['None', 'Mild', 'Moderate', 'High', 'Very high']

const SYMPTOMS: [Symptom, LucideIcon][] = [
  ['Headache', Brain],
  ['Congestion', Wind],
  ['Vision change', Eye],
  ['Back pain', Bone],
  ['Nausea', Waves],
  ['Dizziness', Orbit],
  ['Skin irritation', Hand],
  ['Trouble sleeping', Moon],
]

// Measure step. Typed values stay strings until saved, so "36." is allowed mid-typing.
type MeasureKey = 'sysBp' | 'diaBp' | 'restingHr' | 'bodyTempC' | 'bloodSugar'
// accepted input range: anything outside is a typo, not a reading
const FIELDS: Record<MeasureKey, { name: string; min: number; max: number; chars: number }> = {
  sysBp: { name: 'Systolic blood pressure', min: 60, max: 250, chars: 3 },
  diaBp: { name: 'Diastolic blood pressure', min: 30, max: 150, chars: 3 },
  restingHr: { name: 'Resting heart rate', min: 25, max: 220, chars: 3 },
  bodyTempC: { name: 'Body temperature', min: 30, max: 43, chars: 4 },
  bloodSugar: { name: 'Blood sugar (fasting)', min: 20, max: 600, chars: 3 },
}
const CARDS: { label: string; keys: MeasureKey[]; unit: string; info: IndicatorId; status: (v: number[]) => Status }[] = [
  { label: 'Blood pressure', keys: ['sysBp', 'diaBp'], unit: 'mmHg', info: 'bloodPressure', status: ([s, d]) => bpStatus(s, d) },
  { label: 'Resting heart rate', keys: ['restingHr'], unit: 'bpm', info: 'heartRate', status: ([v]) => hrStatus(v) },
  { label: 'Body temperature', keys: ['bodyTempC'], unit: '°C', info: 'bodyTemp', status: ([v]) => tempStatus(v) },
  { label: 'Blood sugar (fasting)', keys: ['bloodSugar'], unit: 'mg/dL', info: 'bloodSugar', status: ([v]) => sugarStatus(v) },
]
const MEASURE_KEYS = Object.keys(FIELDS) as MeasureKey[]

function parse(key: MeasureKey, s: string) {
  const v = Number(s.trim().replace(',', '.'))
  return s.trim() && Number.isFinite(v) && v >= FIELDS[key].min && v <= FIELDS[key].max ? v : null
}

interface Draft {
  sleepH: number
  sleepQuality: Scale
  mood: Scale
  stress: Scale
  symptoms: Symptom[]
  exerciseMin: number
  reaction: ReactionResult | null
  m: Record<MeasureKey, string>
}

const initialDraft = (): Draft => ({
  ...todayPrefill,
  reaction: null,
  m: Object.fromEntries(MEASURE_KEYS.map((k) => [k, String(todayPrefill[k])])) as Draft['m'],
})

const btn = 'inline-flex h-12 cursor-pointer items-center rounded px-5 whitespace-nowrap disabled:cursor-default disabled:opacity-40'
const primaryBtn = `${btn} bg-info font-medium text-info-ink enabled:hover:opacity-90`
const secondaryBtn = `${btn} border border-line enabled:hover:bg-panel-2`
const tag = 'rounded border border-fg-3 px-1.5 type-small-mono text-fg-3'

export default function CheckIn({ id, profile }: { id?: string; profile: Profile }) {
  const i = Math.max(0, STEPS.indexOf(id as (typeof STEPS)[number]))
  const step = STEPS[i]
  const [draft, setDraft] = useState(initialDraft)
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const store = useCheckInStore()
  const h1 = useRef<HTMLHeadingElement>(null)

  const { sensors, reactionBaseline } = useMemo(() => {
    const days = buildHistory(profile)
    const base = days.slice(0, 14).map((d) => d.checkIn!.reactionMs!)
    return { sensors: days[days.length - 1], reactionBaseline: Math.round(base.reduce((a, b) => a + b, 0) / base.length) }
  }, [profile])

  const values = Object.fromEntries(MEASURE_KEYS.map((k) => [k, parse(k, draft.m[k])])) as Record<MeasureKey, number | null>
  const measuresValid = MEASURE_KEYS.every((k) => values[k] != null)
  const canNext = step === 'measure' ? measuresValid : step === 'reaction' ? !!draft.reaction : true

  const goTo = (n: number) => {
    window.location.hash = `#/checkin/${STEPS[n]}`
  }

  function save() {
    if (!measuresValid) return
    const v = values as Record<MeasureKey, number>
    const checkIn: CheckInData = {
      time: new Date().toTimeString().slice(0, 5),
      sleepH: draft.sleepH,
      sleepQuality: draft.sleepQuality,
      mood: draft.mood,
      stress: draft.stress,
      symptoms: draft.symptoms,
      sysBp: Math.round(v.sysBp),
      diaBp: Math.round(v.diaBp),
      restingHr: Math.round(v.restingHr),
      bodyTempC: Math.round(v.bodyTempC * 10) / 10,
      bloodSugar: Math.round(v.bloodSugar),
      exerciseMin: draft.exerciseMin,
      reactionMs: draft.reaction?.meanMs ?? null,
    }
    const before = evaluate(buildHistory(profile, store.checkIn), profile).hazards
    const after = evaluate(buildHistory(profile, checkIn), profile).hazards
    const changes: Change[] = after.flatMap((h, n) => (h.status === before[n].status ? [] : [{ id: h.id, from: before[n].status, to: h.status }]))
    saveCheckIn(checkIn, changes)
    window.location.hash = '#/status'
  }

  const primary = () => (step === 'review' ? save() : canNext && goTo(i + 1))

  // move focus to the new question, so screen readers read it and Enter works right away
  useEffect(() => {
    h1.current?.focus()
  }, [i])

  // Enter = Next, except where Enter already means something (buttons, links, the info sheet)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return
      if ((e.target as HTMLElement).closest('button, a, [role=button], dialog, textarea, select')) return
      e.preventDefault()
      primary()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const content: Record<(typeof STEPS)[number], { title: string; info?: IndicatorId[]; body: ReactNode }> = {
    sleep: {
      title: 'How long did you sleep?',
      info: ['sleep'],
      body: (
        <>
          <Stepper label="Sleep" value={draft.sleepH} step={0.5} min={0} max={12} unit="h" format={(v) => v.toFixed(1)} onChange={(sleepH) => set({ sleepH })} />
          <Segmented label="Sleep quality" options={QUALITY} value={draft.sleepQuality - 1} onChange={(n) => set({ sleepQuality: (n + 1) as Scale })} />
        </>
      ),
    },
    mind: {
      title: 'How do you feel today?',
      info: ['mood', 'stress'],
      body: (
        <>
          <Segmented label="Mood" options={MOOD} value={draft.mood - 1} onChange={(n) => set({ mood: (n + 1) as Scale })} />
          <Segmented label="Stress" options={STRESS} value={draft.stress - 1} onChange={(n) => set({ stress: (n + 1) as Scale })} />
        </>
      ),
    },
    body: {
      title: 'Any symptoms since yesterday?',
      info: ['vision'],
      body: (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2" role="group" aria-label="Symptoms">
          {SYMPTOMS.map(([s, Icon]) => {
            const on = draft.symptoms.includes(s)
            return (
              <ToggleTile
                key={s}
                label={s}
                Icon={Icon}
                pressed={on}
                onToggle={() => set({ symptoms: on ? draft.symptoms.filter((x) => x !== s) : [...draft.symptoms, s] })}
              />
            )
          })}
          <ToggleTile label="None" Icon={Ban} pressed={!draft.symptoms.length} onToggle={() => set({ symptoms: [] })} />
        </div>
      ),
    },
    measure: {
      title: 'Take your measurements',
      body: (
        <div className="grid gap-4 md:grid-cols-2">
          {CARDS.map((card) => {
            const nums = card.keys.map((k) => values[k])
            const ok = nums.every((n) => n != null)
            const status = ok ? card.status(nums as number[]) : 'nominal'
            const fromDevice = card.keys.every((k) => draft.m[k] === String(todayPrefill[k]))
            const bad = card.keys.find((k) => values[k] == null)
            return (
              <div key={card.label} className="flex flex-col gap-3 rounded border border-line bg-panel p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{card.label}</p>
                  {fromDevice && <span className={tag}>From device</span>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    {card.keys.map((k, n) => (
                      <span key={k} className="contents">
                        {n > 0 && <span className="type-data text-fg-3" aria-hidden>/</span>}
                        <input
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          aria-label={FIELDS[k].name}
                          aria-invalid={values[k] == null}
                          value={draft.m[k]}
                          onChange={(e) => set({ m: { ...draft.m, [k]: e.target.value } })}
                          style={{ width: `calc(${FIELDS[k].chars}ch + 18px)` }}
                          className="type-display h-16 rounded border border-line bg-panel-2 px-2 aria-[invalid=true]:border-caution"
                        />
                      </span>
                    ))}
                    <span className="type-small-mono text-fg-2">{card.unit}</span>
                  </div>
                  {status !== 'nominal' && <StatusChip status={status} />}
                </div>
                {bad && (
                  <p className="text-sm text-caution" role="alert">
                    Enter {FIELDS[bad].name.toLowerCase()} from {FIELDS[bad].min} to {FIELDS[bad].max}.
                  </p>
                )}
                <div>
                  <InfoSheet ids={[card.info]} label="How to measure" />
                </div>
              </div>
            )
          })}
        </div>
      ),
    },
    exercise: {
      title: 'How much did you exercise yesterday?',
      info: ['exercise'],
      body: (
        <>
          <Stepper label="Exercise" value={draft.exerciseMin} step={15} min={0} max={180} unit="min" onChange={(exerciseMin) => set({ exerciseMin })} />
          <p className="text-fg-2">Target: about 120 min a day, with resistance work.</p>
        </>
      ),
    },
    reaction: {
      title: 'Reaction test',
      info: ['reaction'],
      body: (
        <>
          <p>Tap the panel or press Space as soon as the counter appears. 30 seconds.</p>
          <ReactionTest baselineMs={reactionBaseline} result={draft.reaction} onResult={(reaction) => set({ reaction })} />
          <button
            type="button"
            onClick={() => {
              set({ reaction: null })
              goTo(STEPS.indexOf('review'))
            }}
            className="min-h-11 w-fit cursor-pointer text-info hover:underline"
          >
            Skip test
          </button>
        </>
      ),
    },
    review: {
      title: 'Review and save',
      info: ['radiation', 'co2'],
      body: (
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <ReviewPanel
            title="You entered"
            rows={[
              ['Sleep', `${draft.sleepH.toFixed(1)} h`],
              ['Sleep quality', QUALITY[draft.sleepQuality - 1]],
              ['Mood', MOOD[draft.mood - 1]],
              ['Stress', STRESS[draft.stress - 1]],
              ['Symptoms', draft.symptoms.join(', ') || 'None'],
              ['Blood pressure', `${values.sysBp ?? draft.m.sysBp}/${values.diaBp ?? draft.m.diaBp} mmHg`],
              ['Resting heart rate', `${values.restingHr ?? draft.m.restingHr} bpm`],
              ['Body temperature', `${values.bodyTempC ?? draft.m.bodyTempC} °C`],
              ['Blood sugar (fasting)', `${values.bloodSugar ?? draft.m.bloodSugar} mg/dL`],
              ['Exercise yesterday', `${draft.exerciseMin} min`],
              ['Reaction time', draft.reaction ? `${draft.reaction.meanMs} ms` : 'Skipped'],
            ]}
          />
          <ReviewPanel
            title="From onboard sensors"
            tag={<span className={tag}>Simulated</span>}
            rows={[
              ['Radiation dose today (personal dosimeter)', `${sensors.doseMsv.toFixed(2)} mSv`],
              ['Cabin CO2', `${sensors.co2Ppm.toLocaleString('en-US')} ppm`],
              ['Cabin temperature', `${sensors.cabinTempC.toFixed(1)} °C`],
            ]}
          />
        </div>
      ),
    },
  }
  const { title, info, body } = content[step]

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="type-small-mono text-fg-2">
          Step {i + 1} of {STEPS.length}
        </p>
        <div className="flex gap-1" aria-hidden>
          {STEPS.map((s, n) => (
            <span key={s} className={`h-1.5 flex-1 rounded ${n <= i ? 'bg-info' : 'bg-line'}`} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h1 ref={h1} tabIndex={-1} className="type-h1 outline-none">
          {title}
        </h1>
        {info && (
          <div>
            <InfoSheet ids={info} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">{body}</div>

      <div className="flex justify-end gap-3 border-t border-line pt-6">
        <button type="button" className={secondaryBtn} disabled={i === 0} onClick={() => goTo(i - 1)}>
          Back
        </button>
        {step === 'review' ? (
          <button type="button" className={primaryBtn} disabled={!measuresValid} onClick={save}>
            Save check-in
          </button>
        ) : (
          <button type="button" className={primaryBtn} disabled={!canNext} onClick={() => goTo(i + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  )
}

function ReviewPanel({ title, tag, rows }: { title: string; tag?: ReactNode; rows: [string, string][] }) {
  return (
    <section className="rounded border border-line bg-panel p-5">
      <div className="flex items-center gap-3">
        <h2 className="type-h2">{title}</h2>
        {tag}
      </div>
      <dl className="mt-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-t border-line py-2">
            <dt className="text-fg-2">{k}</dt>
            <dd className="text-right font-mono">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
