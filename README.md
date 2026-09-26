# Founder: A Startup Life Sim

A BitLife-style narrative business simulator with Cookie Clicker-style idle
income. Build a company from a garage to a global empire while juggling two
parallel timelines — **Company** and **Personal** — that constantly pull
against each other.

Built with Next.js 14 (App Router) and Tailwind CSS. No backend, no
database — everything runs client-side and saves to your browser's
LocalStorage.

## Features

- **Two-timeline system** — Cash, MRR, Users, Valuation, Product Quality,
  and Employee Morale on the company side; Health, Happiness,
  Relationships, Reputation, and Age on the personal side. Let Health or
  Happiness drop below 30 and your company's growth rate is cut in half.
- **77 handwritten events** — crises, investor offers, employee issues,
  personal-life moments, health scares, viral moments, legal trouble,
  competitor moves, and relationship events, spawning every 8-15 seconds
  and filtered by your current company stage, age, and stats.
- **Idle income layer** — users generate revenue passively; spend cash on
  22 servers/marketing/product/office upgrades, or hire from 14 managers
  who automate parts of the business for you.
- **Five company stages** — Garage → Startup → Scale-up → Unicorn →
  IPO-ready, each unlocking new events, upgrades, and managers.
- **Six business types** — SaaS Startup, Mobile App Studio, E-Commerce
  Brand, Creator Platform, Fintech, and Biotech, chosen on the Start
  Screen. Each tunes its own growth speed, valuation ceiling, and decay
  rate — some (Mobile Apps, E-Commerce) are easier and faster to run,
  others (Fintech, Biotech) are harder but pay off bigger.
- **Six endings** — Legendary Founder (IPO), Burned Out, Bankruptcy,
  Rich but Done (Acquisition), Rich but Alone, and Balanced Founder.
- **New venture flow** — every ending offers three paths: start a fresh
  business (pick a new type), **merge** your finished company into your
  next venture (a cash-and-reputation seed-capital bonus carried forward),
  or sell &amp; prestige for a permanent growth multiplier. Every completed
  run is recorded in your Career &amp; Portfolio history (briefcase icon in
  the top bar).
- **Prestige system** — sell the company to reset your run with a
  permanent growth multiplier based on your final valuation.
- **19 cross-run achievements** — permanent unlocks (viewable from the
  trophy icon in the top bar) tracking lifetime stats: events resolved,
  upgrades bought, managers hired, endings seen, and more. These persist
  across resets and prestige runs.
- **Three difficulty modes** — Easy, Normal, and Hard, chosen on the Start
  Screen, tuning starting cash and how fast personal/company stats decay.
- **Settings menu** — mute toggle, current difficulty, and a reset-save
  option, from the gear icon in the top bar.
- **Fully procedural audio** — every sound effect (event blips, revenue
  chimes, crisis buzzers, cash registers, fanfares, achievement stings) is
  synthesized live with the Web Audio API. No audio files anywhere in the
  repo.
- **Auto-save** — your run is saved to LocalStorage every 10 seconds and
  restored automatically when you come back.

## Getting Started Locally

Requires [Node.js](https://nodejs.org/) 18.18 or newer.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). No further setup
is needed — the game is immediately playable.

To build and run a production bundle locally:

```bash
npm run build
npm run start
```

## Project Structure

```
founder-startup-life/
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── src/
│   ├── app/
│   │   ├── layout.js       # Root layout + metadata
│   │   ├── page.js         # Top-level state machine (reducer), layout, wiring
│   │   ├── globals.css     # Tailwind + custom animations/utility classes
│   │   └── icon.svg        # Favicon
│   ├── components/
│   │   ├── TopBar.jsx           # Cash / MRR / Users / Valuation / Age / Stage
│   │   ├── EventModal.jsx       # The event card with 3-4 choices
│   │   ├── UpgradePanel.jsx     # Buyable servers/marketing/product/office upgrades
│   │   ├── ManagerPanel.jsx     # Hireable, permanent passive-bonus managers
│   │   ├── StatsPanel.jsx       # Health/Happiness/Relationships + Quality/Morale bars
│   │   ├── EventLog.jsx         # Scrolling history of resolved events
│   │   ├── Toast.jsx            # Milestone notifications
│   │   ├── GameOverScreen.jsx   # Ending screen: prestige / merge / fresh start
│   │   ├── StartScreen.jsx      # Business type + difficulty select, new/continue
│   │   ├── AchievementsPanel.jsx # Cross-run achievement list
│   │   ├── PortfolioPanel.jsx   # Career stats + past-venture history
│   │   └── SettingsModal.jsx    # Mute, difficulty display, reset save
│   ├── hooks/
│   │   ├── useGameLoop.js       # Idle income, decay, aging, ending checks (pure tick fn)
│   │   ├── useEventEngine.js    # Randomized event spawning + choice resolution
│   │   └── usePersistence.js    # LocalStorage load/autosave/clear
│   ├── data/
│   │   ├── events.js         # 77 fully-written events
│   │   ├── upgrades.js       # 22 repeatable upgrades across 4 categories
│   │   ├── managers.js       # 14 one-time-hire passive managers
│   │   ├── achievements.js   # 19 permanent, cross-run achievement definitions
│   │   └── businessTypes.js  # 6 business types (growth/valuation/decay multipliers)
│   └── utils/
│       ├── audio.js        # Web Audio synth sound effects
│       ├── math.js         # Formatting, scaling, valuation, stage helpers
│       └── endings.js      # Ending condition checks + copy
```

## Deploying to Vercel

The fastest path is directly from the GitHub repository:

1. Push this repository to GitHub (already done if you're reading this
   from the repo).
2. Go to [vercel.com/new](https://vercel.com/new) and import the
   repository.
3. Vercel auto-detects the Next.js framework — no configuration needed.
   Leave the build command (`next build`) and output settings on their
   defaults.
4. Click **Deploy**. Your game will be live at `https://<project-name>.vercel.app`
   within a minute or two.

Alternatively, from the CLI:

```bash
npm install -g vercel
vercel login
vercel        # deploys a preview
vercel --prod # deploys to production
```

No environment variables, database, or backend services are required —
this is a fully static-friendly client-side app.

## Notes on Tuning

Game-balance constants (income rates, decay rates, cost curves, aging
speed, prestige formula) are grouped near the top of
`src/hooks/useGameLoop.js`, `src/data/upgrades.js`, and
`src/data/managers.js` if you want to make the game faster/slower or
easier/harder.
