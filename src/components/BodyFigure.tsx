// Written with AI assistance (Claude) and reviewed by the team.
// Clickable schematic of the body (SPEC 6.7). The figure is its own 360 x 640 SVG, drawn from
// simple shapes and mirrored about x = 180. It sits in a 600 x 700 frame that leaves room for the
// side labels. Markers and labels are HTML buttons placed by percentage on the same frame.
import type { ReactElement } from 'react'
import { regions } from '../data/regions'
import type { RegionId, RegionResult, Status } from '../lib/evaluate'

const FRAME_W = 600
const FRAME_H = 700
const FIG_X = 120 // figure's left edge in the frame
const pctX = (x: number) => `${((FIG_X + x) / FRAME_W) * 100}%`
const pctY = (y: number) => `${(y / FRAME_H) * 100}%`

// Leaders end at figure x 80 (left) or 280 (right); labels start 4 units further out.
// Label y values are spread so labels on one side never overlap.
const LEFT_END = 80
const RIGHT_END = 280
const LABEL_EDGE = `${((FRAME_W - (FIG_X + LEFT_END - 4)) / FRAME_W) * 100}%`

// A marker (18 px) is bigger than an eye or an ear on screen, so markers sit beside small features,
// not on them: Eyes between the two eyes, Inner ear on the top of the left ear (the ear shows below it).
// The Eyes leader climbs steeply so it passes above the right eye and the right ear.
const markers: { id: Exclude<RegionId, 'wholeBody'>; x: number; y: number; side: 'left' | 'right'; labelY: number }[] = [
  { id: 'brain', x: 180, y: 42, side: 'left', labelY: 30 },
  { id: 'innerEar', x: 146, y: 60, side: 'left', labelY: 110 },
  { id: 'airway', x: 180, y: 108, side: 'left', labelY: 190 },
  { id: 'immune', x: 120, y: 280, side: 'left', labelY: 280 },
  { id: 'bones', x: 160, y: 400, side: 'left', labelY: 400 },
  { id: 'eyes', x: 180, y: 72, side: 'right', labelY: 26 },
  { id: 'heart', x: 194, y: 160, side: 'right', labelY: 160 },
  { id: 'metabolism', x: 180, y: 280, side: 'right', labelY: 280 },
  { id: 'muscles', x: 200, y: 410, side: 'right', labelY: 410 },
]

// [region the shape belongs to, shape]; mirrored pairs share x about 180
const parts: [RegionId | null, ReactElement][] = [
  ['wholeBody', <rect x={92} y={24} width={176} height={600} rx={8} strokeDasharray="6 6" />],
  ['brain', <circle cx={180} cy={70} r={30} />],
  ['innerEar', <rect x={142} y={60} width={8} height={22} rx={4} />],
  ['innerEar', <rect x={210} y={60} width={8} height={22} rx={4} />],
  ['eyes', <circle cx={162} cy={72} r={4} />],
  ['eyes', <circle cx={198} cy={72} r={4} />],
  ['airway', <rect x={170} y={100} width={20} height={16} />],
  [null, <rect x={136} y={118} width={88} height={110} rx={14} />],
  ['heart', <circle cx={194} cy={160} r={16} />],
  ['metabolism', <rect x={140} y={232} width={80} height={98} rx={14} />],
  [null, <rect x={110} y={122} width={20} height={104} rx={10} />],
  ['muscles', <rect x={230} y={122} width={20} height={104} rx={10} />],
  ['immune', <rect x={110} y={230} width={20} height={96} rx={10} />],
  [null, <rect x={230} y={230} width={20} height={96} rx={10} />],
  ['immune', <circle cx={120} cy={338} r={9} />],
  [null, <circle cx={240} cy={338} r={9} />],
  ['bones', <rect x={143} y={336} width={34} height={136} rx={16} />],
  ['muscles', <rect x={183} y={336} width={34} height={136} rx={16} />],
  ['bones', <rect x={147} y={476} width={26} height={116} rx={13} />],
  [null, <rect x={187} y={476} width={26} height={116} rx={13} />],
  [null, <rect x={141} y={596} width={34} height={12} rx={4} />],
  [null, <rect x={185} y={596} width={34} height={12} rx={4} />],
]

// top to bottom, for the list on narrow screens
const LIST_ORDER: RegionId[] = ['brain', 'eyes', 'innerEar', 'airway', 'heart', 'metabolism', 'immune', 'bones', 'muscles', 'wholeBody']

const fill: Record<Status, string> = { nominal: 'bg-nominal', caution: 'bg-caution', warning: 'bg-warning' }

interface Props {
  results: Record<RegionId, RegionResult>
  selected: RegionId
  onSelect: (id: RegionId) => void
}

export default function BodyFigure({ results, selected, onSelect }: Props) {
  // side = where the label sits: a left label is right-aligned, toward the figure
  const label = (id: RegionId, side: 'left' | 'right' | 'center') => {
    const on = id === selected
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => onSelect(id)}
        className={`flex min-h-11 w-full cursor-pointer flex-col justify-center rounded px-1 hover:text-fg ${on ? 'text-fg' : 'text-fg-2'} ${
          side === 'left' ? 'items-end text-right' : side === 'right' ? 'items-start text-left' : 'items-center text-center'
        }`}
      >
        <span className="text-sm leading-5 font-medium">{regions[id].name}</span>
        <span className="caps font-mono text-xs leading-4">{results[id].status}</span>
      </button>
    )
  }

  return (
    <div>
      <div className="relative mx-auto aspect-[600/700] w-full max-w-[560px]">
        <svg viewBox={`0 0 ${FRAME_W} ${FRAME_H}`} className="absolute inset-0 size-full" fill="none" aria-hidden>
          <g className="hidden sm:inline" stroke="var(--line)" strokeWidth={1} vectorEffect="non-scaling-stroke">
            {markers.map((m) => (
              <line
                key={m.id}
                x1={FIG_X + m.x}
                y1={m.y}
                x2={FIG_X + (m.side === 'left' ? LEFT_END : RIGHT_END)}
                y2={m.labelY}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          <svg x={FIG_X} y={0} width={360} height={640} viewBox="0 0 360 640" className="[&_*]:[vector-effect:non-scaling-stroke]">
            {/* centre line, as on a technical drawing */}
            <line x1={180} y1={8} x2={180} y2={632} stroke="var(--line)" strokeWidth={1} strokeDasharray="12 4 2 4" />
            {/* selected shapes last, so their stroke sits on top */}
            {[...parts]
              .sort(([a], [b]) => Number(a === selected) - Number(b === selected))
              .map(([r, el], i) => (
                <g
                  key={i}
                  stroke={r === selected ? 'var(--info)' : r === 'wholeBody' ? 'var(--text-3)' : 'var(--text-2)'}
                  strokeWidth={r === selected ? 2 : r === 'wholeBody' ? 1 : 1.5}
                >
                  {el}
                </g>
              ))}
          </svg>
        </svg>

        {markers.map((m) => {
          const { status } = results[m.id]
          const on = m.id === selected
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={on}
              aria-label={`${regions[m.id].name}, ${status}`}
              onClick={() => onSelect(m.id)}
              style={{ left: pctX(m.x), top: pctY(m.y) }}
              className="absolute grid size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full"
            >
              <span
                className={`block size-[18px] rounded-full border-2 border-bg ${fill[status]} ${on ? 'outline-2 outline-info' : ''}`}
              />
            </button>
          )
        })}

        {/* side labels from 640 px; below that the list under the figure takes over */}
        {markers.map((m) => (
          <div
            key={m.id}
            className="absolute hidden -translate-y-1/2 sm:block"
            style={m.side === 'left' ? { left: 0, right: LABEL_EDGE, top: pctY(m.labelY) } : { left: LABEL_EDGE, right: 0, top: pctY(m.labelY) }}
          >
            <div className={`flex ${m.side === 'left' ? 'justify-end' : 'justify-start'}`}>{label(m.id, m.side)}</div>
          </div>
        ))}
        <div className="absolute inset-x-0 hidden -translate-y-1/2 justify-center sm:flex" style={{ top: pctY(668) }}>
          {label('wholeBody', 'center')}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 sm:hidden">
        {LIST_ORDER.map((id) => (
          <div key={id} className="border-t border-line">
            {label(id, 'right')}
          </div>
        ))}
      </div>
    </div>
  )
}
