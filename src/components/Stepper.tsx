// Written with AI assistance (Claude) and reviewed by the team.
import { Minus, Plus } from 'lucide-react'

interface Props {
  label: string // for screen readers, e.g. "Sleep"
  value: number
  step: number
  min: number
  max: number
  unit: string
  format?: (v: number) => string
  onChange: (v: number) => void
}

const btn =
  'inline-flex size-16 shrink-0 cursor-pointer items-center justify-center rounded border border-line hover:bg-panel-2 disabled:cursor-default disabled:opacity-40'

export default function Stepper({ label, value, step, min, max, unit, format = String, onChange }: Props) {
  // round so 0.5 h steps never drift to 6.499999
  const go = (d: number) => onChange(Math.round(Math.min(Math.max(value + d, min), max) * 100) / 100)
  return (
    <div role="group" aria-label={label} className="flex items-center gap-6">
      <button type="button" className={btn} onClick={() => go(-step)} disabled={value <= min} aria-label={`Less ${label.toLowerCase()}`}>
        <Minus size={24} strokeWidth={1.75} aria-hidden />
      </button>
      <output aria-live="polite" className="min-w-[5ch] text-center whitespace-nowrap">
        <span className="type-display">{format(value)}</span> <span className="type-data text-fg-2">{unit}</span>
      </output>
      <button type="button" className={btn} onClick={() => go(step)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
        <Plus size={24} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}
