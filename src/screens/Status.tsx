// Written with AI assistance (Claude) and reviewed by the team.
import { CircleCheck, Square, X } from 'lucide-react'
import MasterStatus from '../components/MasterStatus'
import HazardTable from '../components/HazardTable'
import { checkinStreak, type Day } from '../data/history'
import { procedureTitles } from '../data/procedures'
import { hazardNames } from '../lib/evaluate'
import { dismissBanner, useMission } from '../lib/storage'
import type { Profile } from '../data/profiles'

export default function Status({ profile }: { profile: Profile }) {
  const { store, days, evaluation } = useMission(profile)

  const today = days[days.length - 1]
  const c = today.checkIn
  const last = days.filter((d) => d.checkIn).at(-1)!
  const lastWhen = last.day === today.day ? '' : last.day === today.day - 1 ? 'yesterday ' : `day ${last.day} `

  // warnings first, then cautions, each procedure once
  const ranked = (['warning', 'caution'] as const).flatMap((s) => evaluation.hazards.filter((h) => h.status === s))
  const nextActions = [...new Set(ranked.flatMap((h) => h.procedures))].slice(0, 4)

  // weekly items count as done when logged in the last 7 days
  const doneThisWeek = (has: (d: Day) => boolean) => {
    const d = days.filter(has).at(-1)
    return d && d.day > today.day - 7 ? `day ${d.day}` : undefined
  }
  // step = the check-in step that collects it (SPEC 6.2)
  const due = [
    { name: 'Morning check-in', freq: 'daily', done: c?.time, step: '' },
    { name: 'Blood sugar (fasting)', freq: 'daily', done: c?.time, step: '/measure' },
    { name: 'Body mass', freq: 'weekly, Mon', done: doneThisWeek((d) => d.bodyMassKg != null), step: '/measure' },
    { name: 'Vision check', freq: 'weekly, Thu', done: doneThisWeek((d) => d.visionCheck != null), step: '/body' },
  ]
  const weekCheckIns = days.slice(-7).filter((d) => d.checkIn).length

  return (
    <div className="flex flex-col gap-6">
      {store.bannerOpen && (
        <div role="status" className="flex items-center justify-between gap-4 rounded border border-line bg-panel py-2 pr-2 pl-4">
          <p>
            Check-in saved.{' '}
            {store.changes.length
              ? <>Changed: {store.changes.map((ch, n) => (
                  <span key={ch.id}>
                    {n > 0 && ', '}
                    {hazardNames[ch.id]} <span className="caps font-mono text-[13px]">{ch.from} → {ch.to}</span>
                  </span>
                ))}.</>
              : 'No hazard status changed.'}
          </p>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Dismiss"
            className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-panel-2"
          >
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      )}

      <MasterStatus evaluation={evaluation} firstProcedure={nextActions[0]} />

      <div>
        <h1 className="type-h1">Today, MET day {today.day}</h1>
        <p className="mt-1 text-fg-2">
          Last check-in {lastWhen}
          <span className="font-mono">{last.checkIn!.time}</span>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          compared with your baseline from days 1 to 14
        </p>
      </div>

      {!c && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded border border-line bg-panel p-4">
          <p>Today's check-in is not saved yet. It takes about 2 minutes.</p>
          <a
            href="#/checkin"
            className="inline-flex h-12 items-center rounded bg-info px-5 font-medium whitespace-nowrap text-info-ink hover:opacity-90"
          >
            Start check-in
          </a>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <HazardTable hazards={evaluation.hazards} days={days} changed={store.changes.map((ch) => ch.id)} />

        <div className="flex flex-col gap-6">
          <section className="rounded border border-line bg-panel p-5">
            <h2 className="type-h2">Next actions</h2>
            {nextActions.length ? (
              <ol className="mt-3">
                {nextActions.map((id, i) => (
                  <li key={id} className="border-t border-line">
                    <a href={`#/procedures/${id}`} className="flex min-h-12 items-center gap-3 text-info hover:underline">
                      <span className="type-small-mono text-fg-3">{i + 1}</span>
                      {procedureTitles[id]}
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-fg-2">Nothing to act on today.</p>
            )}
          </section>

          <section className="rounded border border-line bg-panel p-5">
            <h2 className="type-h2">Due today</h2>
            <ul className="mt-3 flex flex-col">
              {due.map(({ name, freq, done, step }) => {
                const label = (
                  <span className="flex-1">
                    <span className="block">{name}</span>
                    <span className="block type-small-mono text-fg-3">{freq}</span>
                  </span>
                )
                return (
                  <li key={name} className="border-t border-line">
                    {done ? (
                      <div className="flex min-h-14 items-center gap-3">
                        <CircleCheck size={20} strokeWidth={1.75} className="shrink-0 text-nominal" aria-label="Done" />
                        {label}
                        <span className="type-small-mono whitespace-nowrap text-fg-2">{done}</span>
                      </div>
                    ) : (
                      <a href={`#/checkin${step}`} className="flex min-h-14 items-center gap-3 hover:bg-panel-2">
                        <Square size={20} strokeWidth={1.75} className="shrink-0 text-fg-2" aria-label="Not done" />
                        {label}
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="rounded border border-line bg-panel p-5">
            <h2 className="type-h2">Routine</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4">
              {/* dt before dd for screen readers, numbers on top visually (top-aligned even if a label wraps) */}
              <div className="flex flex-col-reverse justify-end">
                <dt className="type-label">day check-in streak</dt>
                <dd className="type-data">{checkinStreak(days)}</dd>
              </div>
              <div className="flex flex-col-reverse justify-end">
                <dt className="type-label">routine items this week</dt>
                <dd className="type-data whitespace-nowrap">{weekCheckIns} / 7</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}
