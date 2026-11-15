// Written with AI assistance (Claude) and reviewed by the team.
import { useState } from 'react'
import Segmented from '../components/Segmented'
import TrendPanel, { type Series } from '../components/TrendPanel'
import { PRIOR_DOSE_MSV, type Day } from '../data/history'
import type { Profile } from '../data/profiles'
import type { TrendId } from '../lib/evaluate'
import { useMission } from '../lib/storage'

const CAREER_LIMIT_MSV = 600
const n0 = (v: number) => Math.round(v).toLocaleString('en-US')
const f1 = (v: number) => v.toFixed(1)
const scale = (v: number) => (Number.isInteger(v) ? String(v) : f1(v)) // "2" for a day, "2.6" for a tick

// SPEC 6.4 order. get returns null for a missed check-in or a skipped test.
const DEFS: { id: TrendId; label: string; unit: string; format: (v: number) => string; get: (d: Day) => number | null }[] = [
  { id: 'sleep', label: 'Sleep', unit: 'h', format: f1, get: (d) => d.checkIn?.sleepH ?? null },
  { id: 'mood', label: 'Mood', unit: '/ 5', format: scale, get: (d) => d.checkIn?.mood ?? null },
  { id: 'stress', label: 'Stress', unit: '/ 5', format: scale, get: (d) => d.checkIn?.stress ?? null },
  { id: 'reaction', label: 'Reaction time', unit: 'ms', format: n0, get: (d) => d.checkIn?.reactionMs ?? null },
  { id: 'exercise', label: 'Exercise', unit: 'min', format: n0, get: (d) => d.checkIn?.exerciseMin ?? null },
  { id: 'restingHr', label: 'Resting heart rate', unit: 'bpm', format: n0, get: (d) => d.checkIn?.restingHr ?? null },
  { id: 'careerDose', label: 'Career radiation dose', unit: 'mSv', format: n0, get: () => null }, // cumulative, filled below
  { id: 'co2', label: 'Cabin CO2', unit: 'ppm', format: n0, get: (d) => d.co2Ppm },
]

/** Mean and sample standard deviation. */
function stats(xs: number[]) {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (xs.length - 1))
  return { mean, sd }
}

export default function Trends({ profile }: { profile: Profile }) {
  const { days, evaluation } = useMission(profile)
  const [range, setRange] = useState(0) // 0 = last 30 days, 1 = whole mission
  const shown = range === 0 ? days.slice(-30) : days

  const status = Object.fromEntries(
    Object.values(evaluation.regions).flatMap((r) => r.readings.filter((x) => x.id).map((x) => [x.id, x.status ?? 'nominal'])),
  ) as Record<TrendId, Series['status']>

  let total = PRIOR_DOSE_MSV
  const career = new Map(days.map((d) => [d.day, (total += d.doseMsv)]))

  const series: Series[] = DEFS.map((def) => {
    const base = days.filter((d) => d.day <= 14).map(def.get).filter((v): v is number => v != null)
    const common = { label: def.label, unit: def.unit, format: def.format, days: shown.map((d) => d.day), status: status[def.id] }
    if (def.id === 'careerDose') {
      // a running total has no meaningful baseline band; show it against the limit instead
      return {
        ...common,
        values: shown.map((d) => career.get(d.day)!),
        limit: { value: CAREER_LIMIT_MSV, label: 'NASA career limit' },
        note: `${Math.round((total / CAREER_LIMIT_MSV) * 100)}% of limit`,
      }
    }
    const { mean, sd } = stats(base)
    return { ...common, values: shown.map(def.get), band: { lo: mean - sd, hi: mean + sd }, baseline: mean }
  })

  return (
    <div className="flex flex-col gap-6">
      {/* title left, toggle right on one row (it fits down to about 340 px, then wraps) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="type-h1">Trends</h1>
        <div className="w-56 sm:w-80">
          <Segmented label="Time range" hideLabel options={['Last 30 days', 'Whole mission']} value={range} onChange={setRange} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 min-[1400px]:grid-cols-4">
        {series.map((s) => (
          <TrendPanel key={s.label} s={s} />
        ))}
      </div>
    </div>
  )
}
