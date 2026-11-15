// Written with AI assistance (Claude) and reviewed by the team.
import { ArrowRight } from 'lucide-react'
import { statusIcon } from './StatusChip'
import type { Evaluation, ProcedureId } from '../lib/evaluate'

interface Props {
  evaluation: Evaluation
  firstProcedure?: ProcedureId
}

// "2 WARNINGS", "1 CAUTION". The Downlink report uses it too, so both read the same.
export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 'S'}`

// Uppercase only for the status words themselves (SPEC 4.3)
export default function MasterStatus({ evaluation: { warnings, cautions }, firstProcedure }: Props) {
  const status = warnings ? 'warning' : cautions ? 'caution' : 'nominal'
  const Icon = statusIcon[status]
  const counts = [warnings && plural(warnings, 'WARNING'), cautions && plural(cautions, 'CAUTION')].filter(Boolean)

  return (
    <div
      role="status"
      className={[
        'flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded px-4 py-2 sm:px-6',
        status === 'warning' && 'bg-warning text-warning-ink',
        status === 'caution' && 'bg-caution text-caution-ink',
        status === 'nominal' && 'border border-nominal bg-panel',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="flex items-center gap-3 font-mono text-lg font-medium whitespace-nowrap">
        <Icon size={24} strokeWidth={1.75} aria-hidden className={status === 'nominal' ? 'text-nominal' : ''} />
        {status === 'nominal' ? (
          <span>
            All systems <span className="caps text-nominal">NOMINAL</span>
          </span>
        ) : (
          <span className="caps">{counts.join('  ·  ')}</span>
        )}
      </p>
      {status !== 'nominal' && firstProcedure && (
        <a
          href={`#/procedures/${firstProcedure}`}
          aria-label={`Open first procedure, ${firstProcedure}`}
          className="inline-flex h-12 items-center gap-2 rounded border border-current px-4 font-mono text-[13px] font-medium whitespace-nowrap hover:bg-bg/10"
        >
          {firstProcedure}
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
        </a>
      )}
    </div>
  )
}
