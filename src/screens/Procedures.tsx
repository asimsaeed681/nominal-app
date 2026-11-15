// Written with AI assistance (Claude) and reviewed by the team.
// ACT: procedure list and detail (SPEC 6.3).
import ProcedureView from '../components/ProcedureView'
import StatusChip from '../components/StatusChip'
import { procedures } from '../data/procedures'
import type { Profile } from '../data/profiles'
import { useMission } from '../lib/storage'

const RANK = { nominal: 0, caution: 1, warning: 2 }
const cols = 'md:grid md:grid-cols-[120px_minmax(0,1fr)_minmax(0,1.4fr)_auto] md:gap-x-4'

export default function Procedures({ id, profile }: { id?: string; profile: Profile }) {
  const { store, evaluation } = useMission(profile)

  if (id) {
    const p = procedures.find((x) => x.id === id)
    if (p) return <ProcedureView key={p.id} procedure={p} evaluation={evaluation} completed={store.completed.find((c) => c.id === p.id)} />
  }

  // triggered first (warnings, then cautions), list order otherwise
  const rank = (pid: keyof typeof evaluation.triggers) => {
    const tr = evaluation.triggers[pid]
    return tr ? RANK[tr.status] + 1 : 0
  }
  const sorted = [...procedures].sort((a, b) => rank(b.id) - rank(a.id))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="type-h1">Procedures</h1>
        {id && <p className="mt-1 text-fg-2">There is no procedure with the ID {id}. Pick one from the list.</p>}
      </div>

      <div className="flex flex-col gap-px">
        <div aria-hidden className={`hidden px-4 pb-2 type-label ${cols}`}>
          <span>ID</span>
          <span>Procedure</span>
          <span>Why it is recommended now</span>
          <span>Hazard</span>
        </div>
        {sorted.map((p) => {
          const reason = evaluation.triggers[p.id]?.reasons[0]
          const done = store.completed.some((c) => c.id === p.id)
          const hazard = evaluation.hazards.find((h) => h.id === p.hazard)!
          return (
            <a
              key={p.id}
              href={`#/procedures/${p.id}`}
              className={`flex flex-col gap-2 rounded bg-panel p-4 hover:bg-panel-2 md:items-center ${cols}`}
            >
              <span className="type-small-mono font-medium text-fg">{p.id}</span>
              <span className="font-semibold">
                {p.title}
                {done && <span className="ml-2 type-small-mono font-normal text-fg-2">completed today</span>}
              </span>
              <span className={reason ? '' : 'text-fg-3'}>{reason ?? 'Not triggered'}</span>
              <span>
                <StatusChip status={hazard.status} />
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
