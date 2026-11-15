// Written with AI assistance (Claude) and reviewed by the team.
const W = 240
const H = 48
const PAD = 4 // keeps the end dot inside the box

/** Small line of one indicator. Null values (missed days, skipped tests) leave a gap in x, not a drop to 0. */
export default function Sparkline({ values, label }: { values: (number | null)[]; label: string }) {
  const nums = values.filter((v): v is number => v != null)
  if (nums.length < 2) return null
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  const pts = values.flatMap((v, i) =>
    v == null
      ? []
      : [[PAD + (i / (values.length - 1)) * (W - 2 * PAD), H - PAD - ((v - min) / (max - min || 1)) * (H - 2 * PAD)]],
  )
  const [lx, ly] = pts[pts.length - 1]
  const fmt = (x: number) => Math.round(x).toLocaleString('en-US')

  return (
    <figure className="flex items-center gap-3">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: from ${fmt(min)} to ${fmt(max)}`}>
        <polyline points={pts.join(' ')} fill="none" stroke="var(--text)" strokeWidth={1.5} strokeLinejoin="round" />
        <circle cx={lx} cy={ly} r={3} fill="var(--text)" />
      </svg>
      <figcaption className="flex flex-col type-small-mono text-fg-3" aria-hidden>
        <span className="whitespace-nowrap">{fmt(max)}</span>
        <span className="whitespace-nowrap">{fmt(min)}</span>
      </figcaption>
    </figure>
  )
}
