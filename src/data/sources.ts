// Written with AI assistance (Claude) and reviewed by the team.
// NASA and CSA sources (SPEC 8.4) and every external resource we used (SPEC 11b), shown on About.
// No CNSA (Chinese) mission data is used anywhere.

export interface Link {
  title: string
  url: string
  note?: string
}

export const sources: Link[] = [
  { title: 'NASA HRP, 5 Hazards of Human Spaceflight', url: 'https://www.nasa.gov/hrp/hazards/' },
  { title: 'NASA HRP, Risks of Human Spaceflight', url: 'https://www.nasa.gov/hrp/risks/' },
  { title: 'NASA HRP, Ongoing HRP Research in Space', url: 'https://www.nasa.gov/hrp/ongoing-hrp-research/' },
  {
    title: 'CSA, Monitoring Radiation for Astronaut Health',
    url: 'https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp',
  },
  {
    title: 'CSA, Why Do We Conduct Science Experiments in Space?',
    url: 'https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp',
  },
  {
    title: 'NASA OCHMO, Radiation Protection technical brief',
    url: 'https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf',
    note: '600 mSv career limit, 250 mSv per solar event, ISS dose',
  },
  {
    title: 'NASA-STD-3001 Volume 1',
    url: 'https://standards.nasa.gov/standard/NASA/NASA-STD-3001_VOL_1',
    note: '600 mSv career limit and 250 mSv per solar event',
  },
  {
    title: 'SwRI, Curiosity RAD radiation during the cruise to Mars',
    url: 'https://www.swri.org/newsroom/press-releases/swri-led-team-calculates-the-radiation-exposure-associated-trip-mars',
    note: '1.8 mSv a day in cruise',
  },
  {
    title: 'Zeitlin et al. 2013, Science: Curiosity RAD cruise dose',
    url: 'https://www.science.org/doi/10.1126/science.1235989',
    note: 'about 1.84 mSv per day',
  },
  {
    title: 'Hassler et al. 2014, Science: Curiosity RAD Mars surface dose',
    url: 'https://www.science.org/doi/10.1126/science.1244797',
    note: 'about 0.64 mSv per day',
  },
]

export const references: Link[] = [
  { title: 'React', url: 'https://react.dev', note: 'MIT License' },
  { title: 'Vite', url: 'https://vite.dev', note: 'MIT License' },
  { title: 'TypeScript', url: 'https://www.typescriptlang.org', note: 'Apache License 2.0' },
  { title: 'Tailwind CSS', url: 'https://tailwindcss.com', note: 'MIT License' },
  { title: 'Lucide icons', url: 'https://lucide.dev', note: 'ISC License' },
  { title: 'IBM Plex Sans and IBM Plex Mono', url: 'https://github.com/IBM/plex', note: 'SIL Open Font License 1.1' },
  { title: 'Fontsource (self-hosted font packages)', url: 'https://fontsource.org', note: 'MIT License' },
]
