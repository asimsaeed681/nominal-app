// Written with AI assistance (Claude) and reviewed by the team.
// Daily report to Mission Control (SPEC 6.5). Plain text in a telemetry style, the same text
// that is previewed, queued and downloaded.
import { useEffect, useState } from 'react'
import { CircleCheck, Send } from 'lucide-react'
import { plural } from '../components/MasterStatus'
import type { Profile } from '../data/profiles'
import { hazardNames, type Evaluation } from '../lib/evaluate'
import { queueDownlink, useMission, type Completion } from '../lib/storage'
import { formatMetShort } from '../lib/time'
import type { CheckIn } from '../data/history'

const pad = (s: string, n: number) => s.padEnd(n)
// Number and unit in Mono (SPEC 4.3) with the sentence's own space between them: a Mono space is as
// wide as a digit and reads as a double space in running text
const qty = (n: number, unit: string) => (
  <>
    <span className="font-mono">{n}</span> <span className="font-mono">{unit}</span>
  </>
)
const mmss = (ms: number) => {
  const t = Math.ceil(ms / 1000)
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

function buildReport(profile: Profile, ev: Evaluation, checkIn: CheckIn | null, completed: Completion[], note: string, now: number) {
  const nominal = ev.hazards.length - ev.warnings - ev.cautions
  const lines = [
    'NOMINAL HEALTH REPORT',
    `${pad('CREW', 10)}FE-2`,
    `${pad('MISSION', 10)}${profile.label}`,
    `${pad('MET', 10)}${formatMetShort(now)}`,
    `${pad('CHECK-IN', 10)}${checkIn ? `saved ${checkIn.time}` : 'not done yet'}`,
    `${pad('STATUS', 10)}${plural(ev.warnings, 'WARNING')}  ${plural(ev.cautions, 'CAUTION')}  ${nominal} NOMINAL`,
    '',
  ]
  for (const h of ev.hazards) {
    lines.push(`${pad(hazardNames[h.id], 13)}${pad(h.status.toUpperCase(), 9)}${h.key.value}${h.key.unit ? ` ${h.key.unit}` : ''}`)
    for (const f of h.findings) lines.push(`  ${f}`)
    if (h.status !== 'nominal' && h.procedures.length) lines.push(`  Procedures: ${h.procedures.join(', ')}`)
    lines.push('')
  }
  lines.push('PROCEDURES COMPLETED TODAY')
  if (completed.length) for (const c of completed) lines.push(`  ${c.id} completed MET ${formatMetShort(c.at, ' ')}`)
  else lines.push('  None')
  lines.push('', 'CREW NOTE', `  ${note.trim() || 'None'}`)
  return lines.join('\n')
}

export default function Downlink({ profile }: { profile: Profile }) {
  const { store, evaluation } = useMission(profile)
  const [note, setNote] = useState('')
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const report = buildReport(profile, evaluation, store.checkIn, store.completed, note, now)
  const q = store.queued
  const left = q ? q.at + q.owltMin * 60_000 - now : 0

  function download() {
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `nominal-report-met-${evaluation.day}.txt`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="type-h1">Downlink to Mission Control</h1>
        <p className="mt-1 text-fg-2">
          One-way light time: {profile.owltMin ? qty(profile.owltMin, 'min') : profile.owlt}. Next contact window:{' '}
          {profile.owltMin ? <>in {qty(41, 'min')}</> : 'open now'}.
        </p>
      </div>

      <section aria-labelledby="report-title" className="rounded border border-line bg-panel p-5">
        <h2 id="report-title" className="sr-only">
          Report preview
        </h2>
        <pre className="overflow-x-auto font-mono text-sm leading-6 whitespace-pre-wrap">{report}</pre>
      </section>

      <div className="flex flex-col gap-2">
        <label htmlFor="crew-note" className="type-label">
          Note for the flight surgeon (optional)
        </label>
        <textarea
          id="crew-note"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded border border-line bg-panel-2 p-3 focus:border-fg-3"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={download}
          className="inline-flex h-12 cursor-pointer items-center rounded border border-line px-5 hover:bg-panel-2"
        >
          Download .txt
        </button>
        <button
          type="button"
          onClick={() => queueDownlink(profile.owltMin)}
          className="inline-flex h-12 cursor-pointer items-center gap-2 rounded bg-info px-5 font-medium text-info-ink hover:opacity-90"
        >
          <Send size={16} strokeWidth={1.75} aria-hidden />
          Queue for downlink
        </button>
      </div>

      {q && (
        <p role="status" className="flex items-center gap-3 rounded border border-line bg-panel p-4">
          {left > 0 ? (
            <>
              {/* the ticking clock is hidden from screen readers so it is not read out every second */}
              Queued.
              <span aria-hidden>
                Arrives at Mission Control in <span className="type-data">{mmss(left)}</span>
              </span>
              <span className="sr-only">Arrives at Mission Control in {q.owltMin} minutes.</span>
            </>
          ) : (
            <>
              <CircleCheck size={20} strokeWidth={1.75} aria-hidden className="text-nominal" />
              Received at MCC
            </>
          )}
        </p>
      )}
    </div>
  )
}
