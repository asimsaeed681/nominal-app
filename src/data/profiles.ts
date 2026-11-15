// Written with AI assistance (Claude) and reviewed by the team.
export type ProfileId = 'mars-transit' | 'mars-surface' | 'iss'

export interface Profile {
  id: ProfileId
  label: string
  owlt: string
  owltMin: number
  dailyDoseMsv: number
  speExtraMsv: number // simulated solar particle event on day 97
  gravity: string
}

export const profiles: Profile[] = [
  { id: 'mars-transit', label: 'Mars transit', owlt: '12 min', owltMin: 12, dailyDoseMsv: 1.8, speExtraMsv: 30, gravity: '0 g' },
  { id: 'mars-surface', label: 'Mars surface base', owlt: '12 min', owltMin: 12, dailyDoseMsv: 0.64, speExtraMsv: 10, gravity: '3/8 g' },
  { id: 'iss', label: 'ISS', owlt: 'real time', owltMin: 0, dailyDoseMsv: 0.5, speExtraMsv: 1, gravity: '0 g' },
]
