// Written with AI assistance (Claude) and reviewed by the team.
import { ChartLine, ClipboardCheck, Gauge, Info, ListChecks, PersonStanding, Send } from 'lucide-react'

export const navItems = [
  { id: 'status', label: 'Status', Icon: Gauge },
  { id: 'checkin', label: 'Check-in', Icon: ClipboardCheck },
  { id: 'body', label: 'Body', Icon: PersonStanding },
  { id: 'procedures', label: 'Procedures', Icon: ListChecks },
  { id: 'trends', label: 'Trends', Icon: ChartLine },
  { id: 'downlink', label: 'Downlink', Icon: Send },
  { id: 'about', label: 'About', Icon: Info },
]

// Left rail on >= 1024 px, bottom bar below that.
export default function NavRail({ current }: { current: string }) {
  return (
    <nav
      aria-label="Main"
      className="order-last flex shrink-0 border-t border-line bg-panel lg:order-first lg:w-[88px] lg:flex-col lg:border-t-0 lg:border-r lg:pt-2"
    >
      {navItems.map(({ id, label, Icon }) => {
        const active = id === current
        return (
          <a
            key={id}
            href={`#/${id}`}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            className={[
              'flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 border-t-3 text-xs font-medium lg:h-18 lg:flex-none lg:border-t-0 lg:border-l-3',
              active ? 'border-info text-fg' : 'border-transparent text-fg-2 hover:bg-panel-2 hover:text-fg',
              id === 'about' && 'lg:mt-auto lg:border-t lg:border-t-line',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Icon size={24} strokeWidth={1.75} aria-hidden />
            {/* Under 480 px only the selected item shows its label */}
            <span className={`max-w-full truncate px-0.5 ${active ? '' : 'hidden min-[480px]:block'}`}>{label}</span>
          </a>
        )
      })}
    </nav>
  )
}
