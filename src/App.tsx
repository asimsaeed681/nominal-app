// Written with AI assistance (Claude) and reviewed by the team.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import TopBar from './components/TopBar'
import NavRail, { navItems } from './components/NavRail'
import Status from './screens/Status'
import Body from './screens/Body'
import CheckIn from './screens/CheckIn'
import Procedures from './screens/Procedures'
import Trends from './screens/Trends'
import Downlink from './screens/Downlink'
import About from './screens/About'
import { profiles, type Profile, type ProfileId } from './data/profiles'

// "#/procedures/MED-SLP-01" -> { screen: 'procedures', id: 'MED-SLP-01' }
function parseHash() {
  const [, screen = '', id] = window.location.hash.split('/')
  return { screen: Object.hasOwn(screens, screen) ? screen : 'status', id }
}

// Status keeps the title from index.html; every other screen gets its own tab title
const homeTitle = document.title

const screens: Record<string, (p: { id?: string; profile: Profile }) => ReactNode> = {
  status: Status,
  checkin: CheckIn,
  body: Body,
  procedures: Procedures,
  trends: Trends,
  downlink: Downlink,
  about: About,
}

export default function App() {
  const [route, setRoute] = useState(parseHash)
  const [profileId, setProfileId] = useState<ProfileId>('mars-transit')
  const profile = profiles.find((p) => p.id === profileId)!

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // <main> is the scroller, so every new screen or check-in step starts at the top
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    main.current?.scrollTo(0, 0)
  }, [route.screen, route.id])

  useEffect(() => {
    document.title = route.screen === 'status' ? homeTitle : `${navItems.find((i) => i.id === route.screen)!.label} · NOMINAL`
  }, [route.screen])

  const Screen = screens[route.screen]
  return (
    <div className="flex h-dvh flex-col">
      <TopBar profile={profile} onProfileChange={setProfileId} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <NavRail current={route.screen} />
        <main ref={main} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <Screen id={route.id} profile={profile} />
        </main>
      </div>
    </div>
  )
}
