// Written with AI assistance (Claude) and reviewed by the team.
// 30-second version of the psychomotor vigilance test (SPEC 7).
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import StatusChip from './StatusChip'
import { reactionStatus } from '../lib/evaluate'

export interface ReactionResult {
  meanMs: number
  lapses: number // RT over 500 ms
  falseStarts: number
}

interface Props {
  baselineMs: number
  result: ReactionResult | null
  onResult: (r: ReactionResult | null) => void
}

type Phase = 'idle' | 'wait' | 'go' | 'shown' | 'falseStart'

const TEST_MS = 30_000
const SHOW_MS = 1000
const LAPSE_MS = 500

const tone = { nominal: 'text-nominal', caution: 'text-caution', warning: 'text-warning' }

export default function ReactionTest({ baselineMs, result, onResult }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [empty, setEmpty] = useState(false) // last run had no valid trials
  const panel = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null) // the running ms number, written directly (see the layout effect)
  // timing lives in a ref: timers and key handlers must see the current values, not a render's copy
  const t = useRef({ phase: 'idle' as Phase, start: 0, go: 0, rts: [] as number[], falseStarts: 0, timer: 0, raf: 0 })

  const to = (p: Phase) => {
    t.current.phase = p
    setPhase(p)
  }
  const stopTimers = () => {
    clearTimeout(t.current.timer)
    cancelAnimationFrame(t.current.raf)
  }
  useEffect(() => stopTimers, [])

  const wait = () => {
    to('wait')
    t.current.timer = window.setTimeout(go, 2000 + Math.random() * 4000)
  }
  // timing starts in the layout effect below, once the counter is on screen
  const go = () => {
    t.current.go = 0
    to('go')
  }

  // The counter is painted in the first frame after React commits it. Timing starts at the frame
  // after that, from its requestAnimationFrame timestamp (the same clock as event.timeStamp). The
  // number is then written straight to the DOM, so no React render runs while the astronaut reacts.
  useLayoutEffect(() => {
    if (phase !== 'go') return
    const el = counter.current!
    el.textContent = '0'
    const tick = (now: number) => {
      el.textContent = String(Math.round(now - t.current.go))
      t.current.raf = requestAnimationFrame(tick)
    }
    t.current.raf = requestAnimationFrame(() => {
      t.current.raf = requestAnimationFrame((now) => {
        t.current.go = now
        tick(now)
      })
    })
    return () => cancelAnimationFrame(t.current.raf)
  }, [phase])
  // after each trial: next one, or stop once 30 s have passed
  const next = () => {
    if (performance.now() - t.current.start < TEST_MS) return wait()
    const { rts, falseStarts } = t.current
    to('idle')
    setEmpty(!rts.length)
    onResult(
      rts.length
        ? { meanMs: Math.round(rts.reduce((a, b) => a + b, 0) / rts.length), lapses: rts.filter((r) => r > LAPSE_MS).length, falseStarts }
        : null,
    )
  }

  const falseStart = () => {
    clearTimeout(t.current.timer)
    cancelAnimationFrame(t.current.raf)
    t.current.falseStarts++
    to('falseStart')
    t.current.timer = window.setTimeout(next, SHOW_MS)
  }

  // at = the input event's timeStamp: when the tap or key press happened, not when this code runs
  const respond = (at: number) => {
    switch (t.current.phase) {
      case 'idle':
        Object.assign(t.current, { start: at, rts: [], falseStarts: 0 })
        onResult(null)
        return wait()
      case 'wait': // tapped before the counter appeared
        return falseStart()
      case 'go': {
        const { go } = t.current
        // the counter has not been on screen for a whole frame yet: an anticipation, not a reaction
        if (!go || at < go) return falseStart()
        cancelAnimationFrame(t.current.raf)
        const rt = at - go
        t.current.rts.push(rt)
        counter.current!.textContent = String(Math.round(rt))
        to('shown')
        t.current.timer = window.setTimeout(next, SHOW_MS)
        return
      }
      // 'shown' and 'falseStart': ignore taps while the message is up
    }
  }

  // Space anywhere on the page while running; when idle only from the panel or a non-control,
  // so Space still works on the page's own buttons
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || result) return
      const el = e.target as HTMLElement
      if (el.closest('dialog')) return
      if (t.current.phase === 'idle' && el !== panel.current && el.closest('button, a, input, textarea, select')) return
      e.preventDefault()
      respond(e.timeStamp)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (result) {
    const pct = Math.round(((result.meanMs - baselineMs) / baselineMs) * 100)
    const status = reactionStatus(pct)
    return (
      <div className="flex flex-col gap-6">
        <dl className="grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col-reverse justify-end">
            <dt className="type-label">Mean reaction time</dt>
            <dd className="whitespace-nowrap">
              <span className="type-display">{result.meanMs}</span> <span className="type-data text-fg-2">ms</span>
            </dd>
          </div>
          <div className="flex flex-col-reverse justify-end">
            <dt className="type-label">Lapses (over 500 ms)</dt>
            <dd className="type-display">{result.lapses}</dd>
          </div>
          <div className="flex flex-col-reverse justify-end">
            <dt className="type-label">False starts</dt>
            <dd className="type-display">{result.falseStarts}</dd>
          </div>
        </dl>
        <p className={`flex flex-wrap items-center gap-3 font-medium ${tone[status]}`}>
          <StatusChip status={status} />
          {pct === 0 ? 'Same as your baseline' : `${Math.abs(pct)}% ${pct > 0 ? 'slower' : 'faster'} than your baseline`}
          <span className="type-small-mono text-fg-2">
            ({result.meanMs} ms vs {baselineMs} ms)
          </span>
        </p>
        {/* starts a new run, nothing is timed here, so a plain click (keyboard Enter works too) */}
        <button
          type="button"
          onClick={(e) => respond(e.timeStamp)}
          className="h-12 w-fit cursor-pointer rounded border border-line px-5 hover:bg-panel-2"
        >
          Run the test again
        </button>
      </div>
    )
  }

  return (
    <div
      ref={panel}
      role="button"
      tabIndex={0}
      aria-label="Reaction test panel"
      onPointerDown={(e) => e.button === 0 && respond(e.timeStamp)}
      className="flex h-70 w-full cursor-pointer touch-manipulation flex-col items-center justify-center gap-2 rounded border border-line bg-panel-2 text-center select-none"
    >
      {phase === 'idle' && (
        <>
          <p className="type-h2">Get ready</p>
          <p className="text-fg-2">{empty ? 'No reactions were recorded. ' : ''}Tap here or press Space to start.</p>
        </>
      )}
      {phase === 'wait' && <p className="type-h2">Wait...</p>}
      {(phase === 'go' || phase === 'shown') && (
        <p className={`whitespace-nowrap ${phase === 'go' ? 'text-info' : ''}`}>
          <span ref={counter} className="type-display" /> <span className="type-data">ms</span>
        </p>
      )}
      {phase === 'falseStart' && <p className="type-h2 text-caution">False start</p>}
    </div>
  )
}
