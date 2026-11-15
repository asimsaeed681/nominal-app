// Written with AI assistance (Claude) and reviewed by the team.
// Today's check-in: kept in memory for the screens and in localStorage so a reload keeps it.
// Every storage call is wrapped in try/catch (private mode, blocked storage, bad JSON).
import { useMemo, useSyncExternalStore } from 'react'
import { buildHistory, type CheckIn } from '../data/history'
import type { Profile } from '../data/profiles'
import { evaluate, type HazardId, type ProcedureId, type Status } from './evaluate'

export interface Change {
  id: HazardId
  from: Status
  to: Status
}

interface State {
  checkIn: CheckIn | null
  // what the last save changed; memory only, so it lasts for this session
  changes: Change[]
  bannerOpen: boolean
  completed: Completion[] // procedures marked complete today, for the downlink report
  queued: { at: number; owltMin: number } | null // last report queued for downlink, this session
}

export interface Completion {
  id: ProcedureId
  at: number // ms timestamp
}

const KEY = 'nominal.checkin'
const DONE_KEY = 'nominal.completed'
// MET day 118 is always the real today (lib/time.ts), so anything saved on another date is stale
const today = () => new Date().toDateString()

function loadToday<T>(key: string, valid: (v: unknown) => boolean): T | null {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null')
    const v = saved?.date === today() ? saved.value : null
    return v != null && valid(v) ? v : null
  } catch {
    return null
  }
}

function saveToday(key: string, value: unknown) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify({ date: today(), value }))
  } catch {
    // storage unavailable: the data still counts for this session
  }
}

let state: State = {
  checkIn: loadToday<CheckIn>(KEY, (c: any) => typeof c.sleepH === 'number' && Array.isArray(c.symptoms)),
  changes: [],
  bannerOpen: false,
  completed: loadToday<Completion[]>(DONE_KEY, Array.isArray) ?? [],
  queued: null,
}
const listeners = new Set<() => void>()
const set = (next: Partial<State>) => {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export function useCheckInStore() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

/** History with today's saved check-in, and its evaluation. Every screen reads from here. */
export function useMission(profile: Profile) {
  const store = useCheckInStore()
  const { days, evaluation } = useMemo(() => {
    const days = buildHistory(profile, store.checkIn)
    return { days, evaluation: evaluate(days, profile) }
  }, [profile, store.checkIn])
  return { store, days, evaluation }
}

export function saveCheckIn(checkIn: CheckIn, changes: Change[]) {
  saveToday(KEY, checkIn)
  set({ checkIn, changes, bannerOpen: true })
}

export function completeProcedure(id: ProcedureId) {
  const completed = [...state.completed.filter((c) => c.id !== id), { id, at: Date.now() }]
  saveToday(DONE_KEY, completed)
  set({ completed })
}

export const dismissBanner = () => set({ bannerOpen: false })

export const queueDownlink = (owltMin: number) => set({ queued: { at: Date.now(), owltMin } })

/** Clears today's check-in (and the rest of today's demo data) from memory and localStorage. */
export function resetCheckIn() {
  saveToday(KEY, null)
  saveToday(DONE_KEY, null)
  set({ checkIn: null, changes: [], bannerOpen: false, completed: [], queued: null })
}
