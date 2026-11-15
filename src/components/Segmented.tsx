// Written with AI assistance (Claude) and reviewed by the team.
import { useId } from 'react'

interface Props {
  label: string
  options: string[]
  value: number // index into options
  onChange: (index: number) => void
  hideLabel?: boolean // screen readers only, for a control that sits next to the heading it belongs to
}

// Native radios under the hood: arrow keys, focus and screen readers work for free
export default function Segmented({ label, options, value, onChange, hideLabel }: Props) {
  const name = useId()
  return (
    <fieldset>
      <legend className={hideLabel ? 'sr-only' : 'mb-2 type-label'}>{label}</legend>
      <div className="grid auto-cols-[minmax(0,1fr)] grid-flow-col gap-px overflow-hidden rounded border border-line bg-line">
        {options.map((o, i) => (
          <label
            key={o}
            className="flex min-h-12 cursor-pointer items-center justify-center bg-panel px-1 py-1 text-center text-sm leading-5 sm:px-2 sm:text-base hover:bg-panel-2 has-[:checked]:bg-info has-[:checked]:font-medium has-[:checked]:text-info-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4 has-[:focus-visible]:outline-info-ink"
          >
            <input type="radio" name={name} className="sr-only" checked={value === i} onChange={() => onChange(i)} />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
