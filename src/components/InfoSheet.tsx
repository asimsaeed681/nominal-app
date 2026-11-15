// Written with AI assistance (Claude) and reviewed by the team.
import { useRef } from 'react'
import { Info, X } from 'lucide-react'
import { indicators, type IndicatorId } from '../data/indicators'

interface Props {
  ids: IndicatorId[]
  label?: string
}

// The link plus its sheet. Native modal <dialog>: focus trap, Esc to close and
// inert background for free. Side panel from 768 px, bottom sheet below.
export default function InfoSheet({ ids, label = 'How to measure and why it matters' }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const title = ids.map((id) => indicators[id].name).join(', ')

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-info hover:underline"
      >
        <Info size={16} strokeWidth={1.75} aria-hidden />
        {label}
      </button>
      <dialog
        ref={ref}
        aria-label={title}
        // click on the backdrop (the dialog element itself, outside the content) closes it
        onClick={(e) => e.target === ref.current && ref.current.close()}
        className="m-0 max-h-none max-w-none bg-panel p-0 text-fg backdrop:bg-bg/80 max-md:inset-x-0 max-md:top-auto max-md:bottom-0 max-md:max-h-[80dvh] max-md:w-full max-md:rounded-t max-md:border-t max-md:border-line md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:w-[400px] md:border-l md:border-line"
      >
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="type-h2 pt-2.5">{title}</h2>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded border border-line hover:bg-panel-2"
            >
              <X size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          {ids.map((id) => {
            const { name, howToMeasure, whyItMatters } = indicators[id]
            return (
              <section key={id} className="flex flex-col gap-3">
                {ids.length > 1 && <h3 className="font-semibold">{name}</h3>}
                <div>
                  <p className="type-label">How to measure</p>
                  <ol className="mt-1 flex list-decimal flex-col gap-1 pl-5 marker:font-mono marker:text-fg-3">
                    {howToMeasure.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="type-label">Why it matters in space</p>
                  <p className="mt-1">{whyItMatters}</p>
                </div>
              </section>
            )
          })}
        </div>
      </dialog>
    </>
  )
}
