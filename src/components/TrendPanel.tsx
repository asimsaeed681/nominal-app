// Written with AI assistance (Claude) and reviewed by the team.
// One small-multiple trend chart (SPEC 6.4). Hand-written SVG drawn in real pixels,
// so the end dot stays round and the text never stretches.
import { useLayoutEffect, useRef, useState } from 'react'
import type { Status } from '../lib/evaluate'

export interface Series {
  label: string
  unit: string
  format: (v: number) => string
  days: number[] // MET day of each value
  values: (number | null)[] // null = no data that day (gap in the line)
  band?: { lo: number; hi: number } // baseline mean ± 1 SD
  baseline?: number // for the delta
  limit?: { value: number; label: string }
  status: Status
  note?: string // replaces the delta (career dose shows % of limit)
}

const H = 120
const TOP = 16 // room for the event labels
const BOTTOM = 6
const GUTTER = 44 // tick labels
const RIGHT = 6 // keeps the end dot inside
const BAND_MIN = 8 // px, so a flat baseline (Stress barely moves in days 1 to 14) still shows a band
const EVENTS = [
  { day: 97, label: 'SPE' },
  { day: 110, label: 'CO2' },
]
const dotFill = { nominal: 'var(--nominal)', caution: 'var(--caution)', warning: 'var(--warning)' }
const deltaColor = { nominal: '', caution: 'text-caution', warning: 'text-warning' }

export default function TrendPanel({ s }: { s: Series }) {
  const box = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const nums = s.values.filter((v): v is number => v != null)
  const latest = nums.at(-1)!
  const outside = s.band && (latest < s.band.lo || latest > s.band.hi)
  const delta = s.baseline ? Math.round(((latest - s.baseline) / s.baseline) * 100) : null

  // y range covers the data, the band and the limit line, plus 10% air
  const all = [...nums, ...(s.band ? [s.band.lo, s.band.hi] : []), ...(s.limit ? [s.limit.value] : [])]
  let min = Math.min(...all)
  let max = Math.max(...all)
  const pad = (max - min || 1) * 0.1
  min -= pad
  max += pad

  const d0 = s.days[0]
  const d1 = s.days.at(-1)!
  const x = (day: number) => GUTTER + ((day - d0) / (d1 - d0 || 1)) * (w - GUTTER - RIGHT)
  const y = (v: number) => TOP + (1 - (v - min) / (max - min)) * (H - TOP - BOTTOM)

  // one path, broken where a day has no value
  let path = ''
  s.values.forEach((v, i) => {
    if (v == null) return
    path += `${i === 0 || s.values[i - 1] == null ? 'M' : 'L'}${x(s.days[i]).toFixed(1)},${y(v).toFixed(1)}`
  })
  let lastI = s.values.length - 1
  while (lastI >= 0 && s.values[lastI] == null) lastI--
  const ticks = [min + pad, (min + max) / 2, max - pad]
  // band grown to BAND_MIN around its own centre when it is thinner than that
  const band = s.band && { mid: (y(s.band.lo) + y(s.band.hi)) / 2, h: Math.max(BAND_MIN, y(s.band.lo) - y(s.band.hi)) }

  return (
    <section className="flex flex-col gap-3 rounded border border-line bg-panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="type-label">{s.label}</h2>
        <p className="whitespace-nowrap">
          <span className="type-data">{s.format(latest)}</span> <span className="type-small-mono text-fg-3">{s.unit}</span>
          <span className={`ml-2 type-small-mono ${outside ? deltaColor[s.status] : 'text-fg-2'}`}>
            {s.note ?? (delta != null && `${delta > 0 ? '+' : ''}${delta}%`)}
          </span>
        </p>
      </div>
      <div ref={box} className="h-[120px] w-full">
        {w > 0 && (
          <svg
            width={w}
            height={H}
            role="img"
            aria-label={`${s.label}, day ${d0} to ${d1}: from ${s.format(Math.min(...nums))} to ${s.format(Math.max(...nums))} ${s.unit}, latest ${s.format(latest)} ${s.unit}.`}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={GUTTER - 6} x2={GUTTER} y1={y(t)} y2={y(t)} stroke="var(--line)" />
                <text x={GUTTER - 10} y={y(t)} dy="0.35em" textAnchor="end" className="fill-fg-3 font-mono text-[11px]">
                  {s.format(t)}
                </text>
              </g>
            ))}
            {band && <rect x={GUTTER} width={w - GUTTER - RIGHT} y={band.mid - band.h / 2} height={band.h} fill="var(--text)" fillOpacity={0.06} />}
            {EVENTS.filter((e) => e.day >= d0 && e.day <= d1).map((e) => (
              <g key={e.label}>
                <line x1={x(e.day)} x2={x(e.day)} y1={TOP - 2} y2={H - BOTTOM} stroke="var(--text-3)" strokeDasharray="3 3" />
                <text x={x(e.day)} y={10} textAnchor="middle" className="fill-fg-3 font-mono text-[11px]">
                  {e.label}
                </text>
              </g>
            ))}
            {s.limit && (
              <g>
                <line x1={GUTTER} x2={w - RIGHT} y1={y(s.limit.value)} y2={y(s.limit.value)} stroke="var(--warning)" strokeDasharray="6 4" />
                <text x={GUTTER + 4} y={y(s.limit.value) + 14} className="fill-fg-2 font-mono text-[11px]">
                  {s.limit.label}
                </text>
              </g>
            )}
            <path d={path} fill="none" stroke="var(--text)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {lastI >= 0 && <circle cx={x(s.days[lastI])} cy={y(s.values[lastI]!)} r={3} fill={dotFill[s.status]} />}
          </svg>
        )}
      </div>
    </section>
  )
}
