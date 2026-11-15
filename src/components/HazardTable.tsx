// Written with AI assistance (Claude) and reviewed by the team.
import { useState } from 'react'
import { ArrowRight, Brain, Dumbbell, Radiation, Radio, Wind, type LucideIcon } from 'lucide-react'
import StatusChip from './StatusChip'
import Sparkline from './Sparkline'
import { PRIOR_DOSE_MSV, type Day } from '../data/history'
import type { HazardId, HazardResult } from '../lib/evaluate'

interface Meta {
  name: string
  line: string
  Icon: LucideIcon
  // key indicator for the sparkline; Distance has none (OWLT is a constant)
  trend?: { label: string; values: (days: Day[]) => (number | null)[] }
}

// Exact copy from SPEC 6.1
const meta: Record<HazardId, Meta> = {
  radiation: {
    name: 'Radiation',
    line: 'Dose from space radiation.',
    Icon: Radiation,
    trend: {
      label: 'Career dose (mSv), last 30 days',
      values: (days) => {
        let total = PRIOR_DOSE_MSV
        return days.map((d) => (total += d.doseMsv))
      },
    },
  },
  isolation: {
    name: 'Isolation',
    line: 'Sleep, mood and alertness.',
    Icon: Brain,
    trend: { label: 'Reaction time (ms), last 30 days', values: (days) => days.map((d) => d.checkIn?.reactionMs ?? null) },
  },
  distance: { name: 'Distance', line: 'How much you must handle without Earth.', Icon: Radio },
  gravity: {
    name: 'Gravity',
    line: 'Bone, muscle and heart in weightlessness.',
    Icon: Dumbbell,
    trend: { label: 'Exercise (min a day), last 30 days', values: (days) => days.map((d) => d.checkIn?.exerciseMin ?? null) },
  },
  environment: {
    name: 'Environment',
    line: 'Cabin air and symptoms.',
    Icon: Wind,
    trend: { label: 'Cabin CO2 (ppm), last 30 days', values: (days) => days.map((d) => d.co2Ppm) },
  },
}

// One grid for header and rows (rows use subgrid), so columns line up and size to their content.
// Below md the rows stack. Rows whose status changed at the last save get a 2 px --info left border.
export default function HazardTable({ hazards, days, changed = [] }: { hazards: HazardResult[]; days: Day[]; changed?: HazardId[] }) {
  const [open, setOpen] = useState<HazardId | null>(null)

  return (
    <div className="flex flex-col gap-px md:grid md:grid-cols-[minmax(0,1fr)_repeat(4,auto)] md:gap-x-4">
      <div aria-hidden className="hidden pb-2 type-label md:col-span-5 md:grid md:grid-cols-subgrid md:px-4">
        <span>Hazard</span>
        <span>Key reading</span>
        <span>Your baseline</span>
        <span>Status</span>
        <span>Action</span>
      </div>

      {hazards.map((h) => {
        const { name, line, Icon, trend } = meta[h.id]
        const isOpen = open === h.id
        const panelId = `hazard-${h.id}`
        return (
          <div
            key={h.id}
            // the border eats 2 px of the left padding, so changed rows stay aligned with the header
            className={`flex flex-col rounded md:col-span-5 md:grid md:grid-cols-subgrid md:px-4 ${isOpen ? 'bg-panel-2' : 'bg-panel hover:bg-panel-2'} ${
              changed.includes(h.id) ? 'border-l-2 border-info md:pl-3.5' : ''
            }`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : h.id)}
              className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left md:col-span-4 md:grid md:min-h-22 md:grid-cols-subgrid md:px-0 md:py-3"
            >
              <span className="flex basis-full items-center gap-3 md:basis-auto">
                <Icon size={24} strokeWidth={1.75} aria-hidden className="shrink-0" />
                <span>
                  <span className="block font-semibold">{name}</span>
                  <span className="block text-sm text-fg-2">{line}</span>
                </span>
              </span>
              <span className="whitespace-nowrap">
                <span className="type-data">{h.key.value}</span>{' '}
                <span className="type-small-mono text-fg-3">{h.key.unit}</span>
              </span>
              <span className="type-small-mono whitespace-nowrap text-fg-2">
                <span className="md:sr-only">Baseline </span>
                {h.baseline}
              </span>
              <span>
                <StatusChip status={h.status} />
              </span>
            </button>

            <div className="flex items-center px-4 pb-4 md:p-0">
              {h.status !== 'nominal' && h.procedures[0] ? (
                <a
                  href={`#/procedures/${h.procedures[0]}`}
                  aria-label={`Open procedure ${h.procedures[0]}`}
                  className="inline-flex h-12 items-center gap-2 rounded border border-line px-3 font-mono text-[13px] font-medium whitespace-nowrap hover:border-fg-3"
                >
                  {h.procedures[0]}
                  <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
                </a>
              ) : (
                <span className="text-[13px] whitespace-nowrap text-fg-3">No action</span>
              )}
            </div>

            {isOpen && (
              <div
                id={panelId}
                className="flex flex-col gap-4 border-t border-line p-4 md:col-span-5 md:flex-row md:items-start md:justify-between md:px-0"
              >
                <ul className="flex max-w-prose flex-col gap-2">
                  {h.findings.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {trend && (
                  <div className="flex shrink-0 flex-col gap-2">
                    <p className="type-label">{trend.label}</p>
                    <Sparkline values={trend.values(days).slice(-30)} label={trend.label} />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
