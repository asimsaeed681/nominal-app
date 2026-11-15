// Written with AI assistance (Claude) and reviewed by the team.
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import BodyFigure from '../components/BodyFigure'
import StatusChip from '../components/StatusChip'
import { regions } from '../data/regions'
import type { Profile } from '../data/profiles'
import type { RegionId, RegionResult } from '../lib/evaluate'
import { useMission } from '../lib/storage'

const RANK = { nominal: 0, caution: 1, warning: 2 }

/** Region with the worst status; the first one wins a tie. */
const worstRegion = (results: Record<RegionId, RegionResult>) =>
  (Object.keys(results) as RegionId[]).reduce((a, b) => (RANK[results[b].status] > RANK[results[a].status] ? b : a))

export default function Body({ profile }: { profile: Profile }) {
  const { evaluation } = useMission(profile)
  const [selected, setSelected] = useState(() => worstRegion(evaluation.regions))
  const r = evaluation.regions[selected]
  const copy = regions[selected]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="type-h1">Body</h1>
        <p className="mt-1 text-fg-2">Tap a body system to see what it does, how space affects it, and your readings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[45fr_55fr] lg:items-start">
        <BodyFigure results={evaluation.regions} selected={selected} onSelect={setSelected} />

        <section aria-live="polite" className="flex flex-col gap-5 rounded border border-line bg-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="type-h2">{copy.name}</h2>
            <StatusChip status={r.status} />
          </div>

          <div>
            <p className="type-small-mono text-fg-2">NASA risk</p>
            {copy.risks.map((risk) => (
              <p key={risk} className="mt-1">
                {risk}
              </p>
            ))}
          </div>

          <div>
            <p className="type-label">What it does</p>
            <p className="mt-1">{copy.whatItDoes}</p>
          </div>
          <div>
            <p className="type-label">How space affects it</p>
            <p className="mt-1">{copy.spaceEffect}</p>
          </div>

          <div>
            <p className="type-label">Your readings</p>
            <ul className="mt-2">
              {r.readings.map((x) => (
                <li key={x.indicator} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-t border-line py-3">
                  <span>{x.indicator}</span>
                  <span className="row-span-2">{x.status && <StatusChip status={x.status} />}</span>
                  <span className="flex flex-wrap gap-x-3">
                    <span className="type-data">{x.value}</span>
                    <span className="self-end type-small-mono text-fg-2">baseline {x.baseline}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="type-label">How to check</p>
            <p className="mt-1">{copy.howToCheck}</p>
          </div>

          {r.status !== 'nominal' && r.procedures[0] && (
            <a
              href={`#/procedures/${r.procedures[0]}`}
              aria-label={`Open procedure ${r.procedures[0]}`}
              className="inline-flex h-12 w-fit items-center gap-2 rounded border border-line px-4 font-mono text-[13px] font-medium whitespace-nowrap hover:border-fg-3"
            >
              {r.procedures[0]}
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
            </a>
          )}
        </section>
      </div>
    </div>
  )
}
