// Written with AI assistance (Claude) and reviewed by the team.
import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  Icon: LucideIcon
  pressed: boolean
  onToggle: () => void
}

export default function ToggleTile({ label, Icon, pressed, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={`flex min-h-16 min-w-30 cursor-pointer items-center gap-3 rounded border px-4 text-left ${
        pressed ? 'border-info bg-info font-medium text-info-ink' : 'border-line bg-panel hover:bg-panel-2'
      }`}
    >
      <Icon size={24} strokeWidth={1.75} aria-hidden className="shrink-0" />
      {label}
    </button>
  )
}
