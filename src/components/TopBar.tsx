// Written with AI assistance (Claude) and reviewed by the team.
import { useEffect, useState } from 'react'
import { ChevronDown, Radio } from 'lucide-react'
import { formatMet } from '../lib/time'
import { profiles, type Profile, type ProfileId } from '../data/profiles'

interface Props {
  profile: Profile
  onProfileChange: (id: ProfileId) => void
}

export default function TopBar({ profile, onProfileChange }: Props) {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line bg-panel px-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <span className="caps font-mono text-base font-medium">NOMINAL</span>
        <span className="hidden h-6 w-px bg-line md:block" />
        <div className="hidden min-w-0 items-center gap-3 font-medium text-fg-2 md:flex">
          <span>FE-2</span>
          <span aria-hidden>·</span>
          {/* Invisible native select over the visible text: keyboard and touch work for free,
              and the box is as wide as the current name, so the chevron sits 8 px after it */}
          <label className="relative flex h-11 min-w-0 items-center gap-2 rounded hover:text-fg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-info">
            <span className="truncate" aria-hidden>
              {profile.label}
            </span>
            <ChevronDown size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
            <select
              aria-label="Mission profile"
              value={profile.id}
              onChange={(e) => onProfileChange(e.target.value as ProfileId)}
              className="absolute inset-0 cursor-pointer appearance-none opacity-0"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-panel-2 text-fg">
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="font-mono whitespace-nowrap" aria-label="Mission elapsed time">
        MET {formatMet(now)}
      </div>
      <div className="flex items-center justify-end gap-5 type-small-mono text-fg-2">
        <span className="hidden items-center gap-2 whitespace-nowrap sm:flex">
          <Radio size={16} strokeWidth={1.75} aria-hidden />
          OWLT {profile.owlt}
        </span>
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span className="size-2 rounded-full bg-nominal" aria-hidden />
          <span className="hidden sm:inline">Sensors live</span>
        </span>
      </div>
    </header>
  )
}
