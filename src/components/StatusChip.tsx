// Written with AI assistance (Claude) and reviewed by the team.
import { CircleCheck, OctagonAlert, TriangleAlert } from 'lucide-react'
import type { Status } from '../lib/evaluate'

// SPEC 4.5: color + icon + word, never color alone
export const statusIcon = { nominal: CircleCheck, caution: TriangleAlert, warning: OctagonAlert }

const style: Record<Status, string> = {
  nominal: 'border-nominal text-nominal',
  caution: 'border-caution bg-caution text-caution-ink',
  warning: 'border-warning bg-warning text-warning-ink',
}

export default function StatusChip({ status }: { status: Status }) {
  const Icon = statusIcon[status]
  return (
    <span
      className={`caps inline-flex h-7 items-center gap-1.5 rounded border px-2 font-mono text-[13px] font-medium whitespace-nowrap ${style[status]}`}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden />
      {status}
    </span>
  )
}
