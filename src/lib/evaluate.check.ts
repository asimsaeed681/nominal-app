// Written with AI assistance (Claude) and reviewed by the team.
// Dev-only check, not part of the app bundle. Run: node src/lib/evaluate.check.ts
import { profiles } from '../data/profiles.ts'
import { buildHistory, checkinStreak, todayPrefill } from '../data/history.ts'
import { evaluate, type Evaluation } from './evaluate.ts'

function print(title: string, r: Evaluation) {
  console.log(`\n=== ${title}, day ${r.day}: ${r.warnings} warnings, ${r.cautions} cautions`)
  for (const h of r.hazards) {
    console.log(`${h.id.padEnd(12)} ${h.status.toUpperCase().padEnd(8)} ${h.key.value} ${h.key.unit}  |  baseline ${h.baseline}  |  ${h.procedures.join(', ') || 'No action'}`)
    for (const f of h.findings) console.log(`    - ${f}`)
  }
  console.log('Body: ' + Object.entries(r.regions).map(([id, x]) => `${id}=${x.status}`).join('  '))
}

for (const p of profiles) {
  const days = buildHistory(p)
  const before = evaluate(days, p)
  const streak = checkinStreak(days)
  days[days.length - 1].checkIn = todayPrefill
  const after = evaluate(days, p)

  if (p.id === 'mars-transit') {
    console.log(`Check-in streak before today: ${streak} days`)
    print(`${p.label} BEFORE today's check-in`, before)
    print(`${p.label} AFTER today's check-in`, after)
    const iso = (r: Evaluation) => r.hazards.find((h) => h.id === 'isolation')!.status
    if (before.warnings !== 2 || before.cautions !== 1 || iso(before) !== 'caution') throw new Error('before: expected 2 warnings, 1 caution (Isolation)')
    if (after.warnings !== 3 || iso(after) !== 'warning') throw new Error('after: expected 3 warnings (Isolation)')
    // Body screen: every region has readings, before and after the check-in
    for (const r of [before, after]) {
      const empty = Object.entries(r.regions).filter(([, x]) => !x.readings.length).map(([id]) => id)
      if (empty.length) throw new Error(`regions without readings: ${empty.join(', ')}`)
    }
  } else {
    print(`${p.label} AFTER today's check-in`, after)
  }
}
console.log('\nMars transit expectations: OK')
