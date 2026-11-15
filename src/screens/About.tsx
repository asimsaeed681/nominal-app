// Written with AI assistance (Claude) and reviewed by the team.
// For judges (SPEC 6.6, 8.4, 11b).
import { useState, type ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { references, sources, type Link } from '../data/sources'
import { resetCheckIn } from '../lib/storage'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t border-line pt-6">
      <h2 className="type-h2">{title}</h2>
      {children}
    </section>
  )
}

function LinkList({ links }: { links: Link[] }) {
  return (
    <ul className="flex flex-col">
      {links.map((l) => (
        <li key={l.url} className="py-1">
          <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-info hover:underline">
            {l.title}
            <ExternalLink size={14} strokeWidth={1.75} aria-hidden className="shrink-0" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          {l.note && <span className="block type-small-mono text-fg-3">{l.note}</span>}
        </li>
      ))}
    </ul>
  )
}

export default function About() {
  const [reset, setReset] = useState(false)

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="type-h1">About NOMINAL</h1>

      <Section title="What it does">
        <p>
          NOMINAL is a daily health self-check for astronauts on long missions. It gathers a 2-minute check-in, a built-in
          reaction-time test and onboard sensor readings, and evaluates them against your own baseline and NASA limits. When
          something is off, it points you to a step-by-step onboard procedure, so you can act without waiting for Earth.
        </p>
      </Section>

      <Section title="How it evaluates">
        <p>
          Your baseline is the average of mission days 1 to 14. Each morning the app compares your last 7 days with that baseline
          and with fixed limits, such as the NASA career radiation limit of 600 mSv, and gives each of the 5 NASA hazards a
          status: NOMINAL, CAUTION or WARNING. Everything runs on the tablet with no internet, because a message to Earth can
          take up to 22 minutes each way.
        </p>
      </Section>

      <Section title="NASA sources">
        <LinkList links={sources} />
      </Section>

      <Section title="About the data">
        <p>
          The astronaut and sensor history are simulated. Rates and limits come from the sources above. Thresholds not set by
          NASA are app settings a flight surgeon would tune.
        </p>
      </Section>

      <Section title="Privacy">
        <p>
          NOMINAL has no accounts, cookies or analytics, and it never sends your data anywhere (Queue for downlink is a
          simulation). Today's check-in and completed procedures stay in this browser's local storage, so a reload keeps
          them. Reset demo data below deletes them.
        </p>
      </Section>

      <Section title="How we used AI">
        <p>
          We used Claude (Anthropic) to help write the code and Gemini (Google) to help research and fact-check the health
          content. We designed the app, chose every indicator and threshold, checked each NASA number against its source, and
          tested every screen. The app uses no AI-generated images.
        </p>
      </Section>

      <Section title="Team">
        <p>COMSATS Orbit Crew, Islamabad.</p>
      </Section>

      <Section title="References">
        <LinkList links={[...references, ...sources]} />
      </Section>

      <Section title="Demo">
        <div className="flex flex-wrap items-center gap-x-4">
          <button
            type="button"
            onClick={() => {
              resetCheckIn()
              setReset(true)
            }}
            className="min-h-11 w-fit cursor-pointer text-info hover:underline"
          >
            Reset demo data
          </button>
          <p role="status" className="text-fg-2">
            {reset && "Done. Today's check-in and completed procedures are cleared."}
          </p>
        </div>
      </Section>
    </div>
  )
}
