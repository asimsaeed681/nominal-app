// Written with AI assistance (Claude) and reviewed by the team.
const DAY_MS = 86_400_000

// Mission start = local midnight 117 days ago, so today is always MET day 118
// (the simulated history ends on day 118) and MET time matches the cabin clock.
const midnight = new Date()
midnight.setHours(0, 0, 0, 0)
export const MISSION_START = midnight.getTime() - 117 * DAY_MS

const pad = (n: number) => String(n).padStart(2, '0')

/** "118 / 06:42:13" */
export function formatMet(now: number) {
  const t = Math.floor((now - MISSION_START) / 1000)
  const day = Math.floor(t / 86_400) + 1
  return `${day} / ${pad(Math.floor(t / 3600) % 24)}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`
}

/** "118 / 06:42" (or "118 06:42" with sep " ") */
export const formatMetShort = (now: number, sep = ' / ') => formatMet(now).slice(0, -3).replace(' / ', sep)
