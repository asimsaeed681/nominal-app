// Written with AI assistance (Claude) and reviewed by the team.
// One procedure, styled like an onboard procedure (SPEC 6.3).
import { useState } from 'react'
import { ArrowLeft, CircleCheck } from 'lucide-react'
import StatusChip from './StatusChip'
import type { Procedure } from '../data/procedures'
import type { Evaluation } from '../lib/evaluate'
import { completeProcedure, type Completion } from '../lib/storage'
import { formatMetShort } from '../lib/time'

const blockStyle = { caution: 'border-caution text-caution', warning: 'border-warning text-warning' }

interface Props {
  procedure: Procedure
  evaluation: Evaluation
  completed?: Completion
}

export default function ProcedureView({ procedure: p, evaluation, completed }: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => p.steps.map(() => !!completed))
  const hazard = evaluation.hazards.find((h) => h.id === p.hazard)!
  const reasons = evaluation.triggers[p.id]?.reasons.slice(0, 2)
  const allChecked = checked.every(Boolean)

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <a href="#/procedures" className="inline-flex min-h-11 w-fit items-center gap-2 text-info hover:underline">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
        All procedures
      </a>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="type-data">{p.id}</span>
        <h1 className="type-h1">{p.title}</h1>
        <StatusChip status={hazard.status} />
      </div>

      <section>
        <h2 className="type-h2">Why this is open</h2>
        {reasons ? (
          reasons.map((r) => (
            <p key={r} className="mt-2">
              {r}
            </p>
          ))
        ) : (
          <p className="mt-2 text-fg-2">Not triggered today. Your readings do not call for this procedure right now.</p>
        )}
      </section>

      {p.block && (
        <div className={`rounded border-l-4 bg-panel p-4 ${blockStyle[p.block.level]}`}>
          <p className="caps font-mono font-medium">{p.block.level}</p>
          <p className="mt-1 text-fg">{p.block.text}</p>
        </div>
      )}

      <ol className="flex flex-col">
        {p.steps.map((step, i) => {
          const text = typeof step === 'string' ? step : step.text
          return (
            <li key={text} className="border-t border-line py-3">
              <label className="flex min-h-11 cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked[i]}
                  disabled={!!completed}
                  onChange={() => setChecked((c) => c.map((v, n) => (n === i ? !v : v)))}
                  className="size-6 shrink-0 cursor-pointer accent-info"
                />
                <span className="w-6 shrink-0 font-mono text-fg-2">{i + 1}.</span>
                <span>{text}</span>
              </label>
              {typeof step !== 'string' && (
                <ol className="mt-1 flex flex-col gap-1 pl-[84px]">
                  {step.sub.map((s, j) => (
                    <li key={s} className="flex gap-3">
                      <span className="w-6 shrink-0 font-mono text-fg-2">{String.fromCharCode(97 + j)}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              )}
            </li>
          )
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-end gap-4 border-t border-line pt-6">
        {completed ? (
          <p role="status" className="flex items-center gap-2">
            <CircleCheck size={20} strokeWidth={1.75} aria-hidden className="text-nominal" />
            <span>
              <span className="font-mono">
                {p.id} completed MET {formatMetShort(completed.at, ' ')}
              </span>
              . Added to the downlink report.
            </span>
          </p>
        ) : (
          <>
            {!allChecked && <p className="text-sm text-fg-2">Check every step to finish.</p>}
            <button
              type="button"
              disabled={!allChecked}
              onClick={() => completeProcedure(p.id)}
              className="inline-flex h-12 cursor-pointer items-center rounded bg-info px-5 font-medium text-info-ink enabled:hover:opacity-90 disabled:cursor-default disabled:opacity-40"
            >
              Mark complete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
