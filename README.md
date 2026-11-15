# NOMINAL: Astronaut Health Self-Check

NASA Space Apps 2026, "Create Health Monitoring Software for Astronauts on Space Missions". Team: COMSATS Orbit Crew, Islamabad.

NOMINAL is the app an astronaut opens every morning to stay nominal. It **gathers** a 2-minute check-in, a built-in reaction-time test and onboard sensor readings. It **evaluates** them against the astronaut's own baseline and NASA limits. It helps them **act** with step-by-step onboard procedures. It runs fully offline.

**AI disclosure:** the code was written with AI assistance (Claude) and reviewed by the team.

The astronaut and sensor history are simulated. Rates and limits come from NASA and CSA sources, listed on the About screen in the app.

## Run it

```
npm install
npm run dev      # local development
npm run build    # type check and production build into dist/
```

`node src/lib/evaluate.check.ts` runs a small self-check of the evaluation rules.

Built with React, Vite, TypeScript, Tailwind CSS, Lucide icons and IBM Plex (SIL Open Font License). Every external resource is listed under References on the About screen.
