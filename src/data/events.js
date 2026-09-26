// The event pool — the heart of the game. Every 8-15 seconds the event
// engine picks a weighted, eligible event from this pool and shows it as a
// modal with 3-4 choices. Each choice carries an `effects` object of stat
// deltas applied directly to GameState.
//
// Fields:
//   id            unique string
//   type          one of: crisis | investor | employee | personal | health |
//                 viral | legal | competitor | relationship | opportunity
//   title         short headline shown in the modal
//   description   1-3 sentence flavor text
//   weight        relative spawn probability (higher = more common)
//   stages        array of company stage ids this event can appear in
//   requirements  optional thresholds that must ALL be true for the event
//                 to be eligible: { minHealth, maxHealth, minHappiness,
//                 maxHappiness, minRelationships, minCash, minValuation,
//                 minUsers, minAge, maxAge, minMorale, minQuality }
//   choices       array of 3-4 { text, outcome, effects }
//     text     button label
//     outcome  short log line describing what happened
//     effects  stat deltas: cash, mrr, users, quality, morale, health,
//              happiness, relationships, reputation, age; plus the special
//              boolean flag `buyoutOffer: true` which, if the state's cash
//              effect is accepted, ends the run via the Acquisition ending.

export const EVENTS = [
  // ============================================================
  // GARAGE STAGE — early company + personal grind
  // ============================================================
  {
    id: 'first-cofounder-fight',
    type: 'employee',
    title: 'Co-Founder Disagreement',
    description:
      'Your co-founder wants to pivot the product entirely. You think the current direction just needs more time. The tension in the garage is thick.',
    weight: 10,
    stages: ['garage', 'startup'],
    choices: [
      {
        text: 'Hear them out and compromise',
        outcome: 'You found a middle path. Morale steadies.',
        effects: { morale: 8, happiness: 2, relationships: 2 },
      },
      {
        text: 'Stand your ground',
        outcome: 'You held the line. Progress continues, but it cost some goodwill.',
        effects: { morale: -6, quality: 4 },
      },
      {
        text: 'Pull an all-nighter to prototype both ideas',
        outcome: 'Exhausting, but you settled the debate with data.',
        effects: { health: -10, quality: 8, morale: 5 },
      },
    ],
  },
  {
    id: 'ramen-profitable',
    type: 'opportunity',
    title: 'Ramen Profitable',
    description:
      'For the first time, your MRR covers your personal living expenses. It is not much, but it is real.',
    weight: 6,
    stages: ['garage'],
    requirements: { minValuation: 5000 },
    choices: [
      {
        text: 'Celebrate quietly',
        outcome: 'A small win, savored.',
        effects: { happiness: 6, health: 2 },
      },
      {
        text: 'Reinvest everything immediately',
        outcome: 'No celebration — straight back to building.',
        effects: { quality: 4, happiness: -2 },
      },
    ],
  },
  {
    id: 'garage-landlord',
    type: 'crisis',
    title: 'The Landlord Wants You Out',
    description:
      "Your landlord says the garage you've been operating out of needs to go back to housing a car. You need a new place to work, fast.",
    weight: 7,
    stages: ['garage'],
    choices: [
      {
        text: 'Rent a cheap co-working desk',
        outcome: 'A little pricier, but stable and surprisingly motivating.',
        effects: { cash: -800, morale: 5, quality: 2 },
      },
      {
        text: 'Move into your apartment',
        outcome: 'Your living room is now the office. Your roommate is thrilled.',
        effects: { happiness: -8, relationships: -5 },
      },
      {
        text: 'Beg for two more weeks',
        outcome: 'The landlord relents, grumbling. You are living on borrowed time.',
        effects: { happiness: -2 },
      },
    ],
  },
  {
    id: 'first-hundred-users',
    type: 'viral',
    title: 'First 100 Users',
    description:
      'A post on a niche forum sent a small wave of curious users your way. The signups are trickling in.',
    weight: 8,
    stages: ['garage'],
    choices: [
      {
        text: 'Personally onboard every one of them',
        outcome: 'They loved the personal touch. A few became loud advocates.',
        effects: { users: 40, quality: 3, health: -4 },
      },
      {
        text: 'Let the product speak for itself',
        outcome: 'Some churned, but the ones who stayed really meant it.',
        effects: { users: 20, happiness: 3 },
      },
    ],
  },
  {
    id: 'sleep-deprivation',
    type: 'health',
    title: 'Running on Fumes',
    description:
      "You've been averaging four hours of sleep for two weeks straight. Your hands are shaking slightly as you type.",
    weight: 9,
    stages: ['garage', 'startup'],
    requirements: { maxHealth: 70 },
    choices: [
      {
        text: 'Take a full day off to sleep',
        outcome: 'You slept for fourteen hours. It felt illegal.',
        effects: { health: 18, happiness: 6, mrr: -2 },
      },
      {
        text: 'Push through with coffee',
        outcome: 'You survive the week. Barely.',
        effects: { health: -12, quality: 3 },
      },
      {
        text: 'Hire a part-time contractor to cover the gap',
        outcome: 'Costly, but it bought you rest.',
        effects: { cash: -600, health: 10 },
      },
    ],
  },
  {
    id: 'angel-investor-garage',
    type: 'investor',
    title: 'An Angel Reaches Out',
    description:
      'A local angel investor found your product on Twitter and wants to write a small check to get you off the ground.',
    weight: 6,
    stages: ['garage'],
    choices: [
      {
        text: 'Take the $25K at a fair valuation',
        outcome: 'Runway extended. You can breathe a little.',
        effects: { cash: 25000, happiness: 4 },
      },
      {
        text: 'Negotiate for more, risk losing the deal',
        outcome: 'You pushed and they walked. Ouch.',
        effects: { happiness: -6, reputation: -2 },
      },
      {
        text: 'Politely decline — you want full control',
        outcome: 'You stay scrappy and independent.',
        effects: { morale: 3, reputation: 2 },
      },
    ],
  },
  {
    id: 'family-dinner-missed',
    type: 'relationship',
    title: 'Missed Family Dinner — Again',
    description:
      'Your family planned a dinner around your schedule. A "quick" bug turned into six hours. The group chat has gone quiet.',
    weight: 9,
    stages: ['garage', 'startup', 'scaleup'],
    choices: [
      {
        text: 'Drop everything and go apologize in person',
        outcome: 'It meant a lot that you showed up.',
        effects: { relationships: 10, happiness: 5, quality: -2 },
      },
      {
        text: 'Send flowers and a long text',
        outcome: 'Appreciated, but it is not quite the same as being there.',
        effects: { relationships: 3, cash: -80 },
      },
      {
        text: 'Stay heads-down on the bug',
        outcome: 'The bug is fixed. The silence in the group chat is not.',
        effects: { relationships: -10, quality: 4 },
      },
    ],
  },
  {
    id: 'competitor-launch-garage',
    type: 'competitor',
    title: 'A Competitor Just Launched',
    description:
      'A well-funded startup announced a suspiciously similar product this morning. The tech press is already covering it.',
    weight: 7,
    stages: ['garage', 'startup'],
    choices: [
      {
        text: 'Double down on your unique angle',
        outcome: 'You sharpen your positioning instead of panicking.',
        effects: { quality: 6, morale: 3 },
      },
      {
        text: 'Rush a feature to compete head-on',
        outcome: 'Shipped fast, but the corners you cut are showing.',
        effects: { users: 15, quality: -6, health: -6 },
      },
      {
        text: 'Ignore it and stay the course',
        outcome: 'You trust your roadmap. Time will tell.',
        effects: { morale: 2 },
      },
    ],
  },

  // ============================================================
  // STARTUP STAGE
  // ============================================================
  {
    id: 'seed-round-offer',
    type: 'investor',
    title: 'A Real Seed Round',
    description:
      'A respected seed fund wants to lead a $500K round. The term sheet looks clean, but it comes with a board seat.',
    weight: 8,
    stages: ['startup'],
    choices: [
      {
        text: 'Take the round',
        outcome: 'Runway for eighteen months, and a new voice at the table.',
        effects: { cash: 500000, morale: 4, reputation: 5 },
      },
      {
        text: 'Counter for a higher valuation',
        outcome: 'They agreed, impressed by your conviction.',
        effects: { cash: 500000, reputation: 8, happiness: 4 },
      },
      {
        text: 'Bootstrap a bit longer instead',
        outcome: 'You keep full ownership, but growth will be slower.',
        effects: { morale: 6, quality: 3 },
      },
    ],
  },
  {
    id: 'key-employee-quits',
    type: 'employee',
    title: 'Your Best Engineer Resigns',
    description:
      'Your first hire, the one who has been there since day one, just gave two weeks notice. A larger company made an offer she could not ignore.',
    weight: 9,
    stages: ['startup', 'scaleup'],
    choices: [
      {
        text: 'Counter-offer aggressively',
        outcome: 'She stays, but it strained the budget.',
        effects: { cash: -20000, morale: 6 },
      },
      {
        text: 'Wish her well and start hiring',
        outcome: 'A gracious goodbye. The search for a replacement begins.',
        effects: { quality: -8, morale: -4 },
      },
      {
        text: 'Ask her to help train her replacement first',
        outcome: 'A smooth handoff, though it delays her exit awkwardly.',
        effects: { quality: -3, morale: -2, relationships: 2 },
      },
    ],
  },
  {
    id: 'viral-tweet',
    type: 'viral',
    title: 'A Tweet Goes Viral',
    description:
      'A user posted a glowing thread about your product and it exploded overnight. Your signup page is getting hammered.',
    weight: 6,
    stages: ['startup', 'scaleup'],
    choices: [
      {
        text: 'Scale servers immediately',
        outcome: 'The site holds. Growth capitalized on.',
        effects: { cash: -3000, users: 800, mrr: 500 },
      },
      {
        text: 'Ride it out on existing infrastructure',
        outcome: 'The site crawls under load. Some users bounce, frustrated.',
        effects: { users: 300, quality: -5 },
      },
      {
        text: 'Jump on the thread personally to thank everyone',
        outcome: 'Your authentic reply became part of the story.',
        effects: { users: 500, reputation: 6, health: -3 },
      },
    ],
  },
  {
    id: 'lawsuit-threat',
    type: 'legal',
    title: 'Cease and Desist Letter',
    description:
      'A larger company claims your logo infringes on their trademark. Their lawyers want a response within five business days.',
    weight: 6,
    stages: ['startup', 'scaleup'],
    choices: [
      {
        text: 'Rebrand immediately to avoid the fight',
        outcome: 'Costly and disruptive, but the threat disappears.',
        effects: { cash: -15000, morale: -3, reputation: 2 },
      },
      {
        text: 'Hire a lawyer to push back',
        outcome: 'They backed down once they saw you would fight.',
        effects: { cash: -8000, reputation: 4, health: -5 },
      },
      {
        text: 'Ignore it and hope it goes away',
        outcome: 'It escalated. This will cost more later.',
        effects: { reputation: -8, happiness: -6 },
      },
    ],
  },
  {
    id: 'burnout-warning-startup',
    type: 'health',
    title: 'Your Doctor Sits You Down',
    description:
      "Routine bloodwork came back with warning signs. Your doctor is blunt: 'Whatever you're doing, it isn't sustainable.'",
    weight: 8,
    stages: ['startup', 'scaleup'],
    requirements: { maxHealth: 55 },
    choices: [
      {
        text: 'Actually take the advice — rest and see a specialist',
        outcome: 'Uncomfortable, but necessary. You feel steadier already.',
        effects: { health: 20, cash: -2000, happiness: 5 },
      },
      {
        text: 'Nod, then get back to the roadmap',
        outcome: 'Old habits. The warning fades into the noise.',
        effects: { health: -8 },
      },
    ],
  },
  {
    id: 'press-feature',
    type: 'opportunity',
    title: 'Featured in a Major Publication',
    description:
      'A widely-read tech outlet wants to profile your startup. It is a huge opportunity, but they need a comment by tomorrow morning.',
    weight: 6,
    stages: ['startup', 'scaleup'],
    choices: [
      {
        text: 'Stay up polishing the perfect quote',
        outcome: 'The article reads beautifully. Traffic spikes.',
        effects: { users: 300, reputation: 10, health: -6 },
      },
      {
        text: 'Send a quick, honest quote and go to bed',
        outcome: 'Simple and human. It resonated more than you expected.',
        effects: { users: 150, reputation: 6, health: 3 },
      },
    ],
  },
  {
    id: 'office-space-decision',
    type: 'opportunity',
    title: 'Time for a Real Office?',
    description:
      'The team has outgrown the co-working space. A small office downtown is available, but it is not cheap.',
    weight: 5,
    stages: ['startup'],
    choices: [
      {
        text: 'Sign the lease',
        outcome: 'The team finally has a real home base. Morale climbs.',
        effects: { cash: -12000, morale: 10, quality: 3 },
      },
      {
        text: 'Stay remote and save the cash',
        outcome: 'Flexible and frugal, though some miss the energy of a room.',
        effects: { cash: 2000, morale: -2 },
      },
    ],
  },
  {
    id: 'partner-feels-neglected',
    type: 'relationship',
    title: 'Your Partner Wants to Talk',
    description:
      '"We need to talk about how much you\'re working," they say, gently but firmly, over a dinner you almost cancelled.',
    weight: 8,
    stages: ['startup', 'scaleup'],
    requirements: { maxRelationships: 60 },
    choices: [
      {
        text: 'Commit to real, protected evenings together',
        outcome: 'You mean it this time, and it shows.',
        effects: { relationships: 14, happiness: 8, quality: -3 },
      },
      {
        text: 'Promise things will calm down "after this next milestone"',
        outcome: 'A familiar promise. They have heard it before.',
        effects: { relationships: -4, morale: 2 },
      },
      {
        text: 'Suggest couples counseling to make time work',
        outcome: "It's a start, and they appreciate the effort.",
        effects: { relationships: 8, cash: -300, happiness: 3 },
      },
    ],
  },
  {
    id: 'sabotage-rumor',
    type: 'crisis',
    title: 'A Bad Review Campaign',
    description:
      'A wave of suspiciously similar one-star reviews hit your app store listing overnight. Something feels coordinated.',
    weight: 6,
    stages: ['startup', 'scaleup'],
    choices: [
      {
        text: 'Respond publicly and transparently',
        outcome: 'Your calm, factual response won people over.',
        effects: { reputation: 6, quality: 2 },
      },
      {
        text: 'Report the reviews and stay quiet',
        outcome: 'Some were removed. The damage lingers a bit.',
        effects: { reputation: -2, happiness: -3 },
      },
      {
        text: 'Investigate whether a competitor is behind it',
        outcome: 'You found evidence, but chasing it cost time and sleep.',
        effects: { health: -6, reputation: 3 },
      },
    ],
  },

  // ============================================================
  // SCALE-UP STAGE
  // ============================================================
  {
    id: 'series-a-term-sheet',
    type: 'investor',
    title: 'Series A Term Sheet',
    description:
      'A top-tier VC firm wants to lead your Series A at a valuation that would have seemed absurd a year ago.',
    weight: 8,
    stages: ['scaleup'],
    choices: [
      {
        text: 'Sign immediately',
        outcome: 'The round closes. Growth capital secured.',
        effects: { cash: 4000000, reputation: 8, morale: 4 },
      },
      {
        text: 'Run a competitive process for better terms',
        outcome: 'Two firms bid each other up. You win better terms.',
        effects: { cash: 5500000, reputation: 10, health: -8 },
      },
      {
        text: 'Delay the round to hit better metrics first',
        outcome: 'A calculated gamble. The wait paid off, mostly.',
        effects: { morale: 6, quality: 5, cash: -50000 },
      },
    ],
  },
  {
    id: 'middle-management-crisis',
    type: 'employee',
    title: 'The Org Chart Is Cracking',
    description:
      'With eighty employees, communication is breaking down. Two department heads are openly feuding in Slack.',
    weight: 8,
    stages: ['scaleup'],
    choices: [
      {
        text: 'Hire an experienced VP of Ops',
        outcome: 'Structure returns to the chaos, at a price.',
        effects: { cash: -180000, morale: 12, quality: 4 },
      },
      {
        text: 'Mediate the conflict yourself',
        outcome: 'You resolved it, but it ate your entire week.',
        effects: { morale: 6, health: -10 },
      },
      {
        text: 'Let the department heads sort it out',
        outcome: 'It festered. A few good people quietly started job hunting.',
        effects: { morale: -10 },
      },
    ],
  },
  {
    id: 'data-breach',
    type: 'crisis',
    title: 'Security Incident',
    description:
      'Your security team detected unauthorized access to a database containing user emails. No passwords were exposed, but disclosure laws are clear.',
    weight: 7,
    stages: ['scaleup', 'unicorn'],
    choices: [
      {
        text: 'Disclose immediately and transparently',
        outcome: 'Painful headlines, but users respected the honesty.',
        effects: { reputation: -5, users: -200, quality: 5 },
      },
      {
        text: 'Quietly patch it and hope it stays private',
        outcome: 'It leaked anyway. The cover-up made it worse.',
        effects: { reputation: -20, cash: -100000 },
      },
      {
        text: 'Bring in an outside security firm to lead the response',
        outcome: 'A costly, professional response that limited the damage.',
        effects: { cash: -250000, reputation: -2, quality: 8 },
      },
    ],
  },
  {
    id: 'competitor-acquired',
    type: 'competitor',
    title: 'Your Biggest Rival Got Acquired',
    description:
      'A tech giant just bought your closest competitor for nine figures. The industry is buzzing about what it means for the space.',
    weight: 6,
    stages: ['scaleup', 'unicorn'],
    choices: [
      {
        text: 'Absorb their orphaned customers with a migration offer',
        outcome: 'A clever land grab. Thousands switch over.',
        effects: { users: 5000, cash: -100000, mrr: 8000 },
      },
      {
        text: 'Use it as leverage in your own fundraising narrative',
        outcome: 'Investors take notice of the consolidating market.',
        effects: { reputation: 8 },
      },
      {
        text: 'Worry it signals you should sell too',
        outcome: 'The thought lingers, unresolved, in the back of your mind.',
        effects: { happiness: -4 },
      },
    ],
  },
  {
    id: 'acquisition-offer-scaleup',
    type: 'investor',
    title: 'An Acquisition Offer Arrives',
    description:
      'A strategic buyer has offered to acquire the company outright. The number is life-changing. The decision is entirely yours.',
    weight: 4,
    stages: ['scaleup', 'unicorn'],
    requirements: { minValuation: 2000000 },
    choices: [
      {
        text: 'Accept the offer',
        outcome: 'You sign the papers. It is really happening.',
        effects: { buyoutOffer: true },
      },
      {
        text: 'Turn it down — you are not done building',
        outcome: 'You believe there is more upside ahead. The buyer walks away respectfully.',
        effects: { morale: 4, reputation: 3 },
      },
    ],
  },
  {
    id: 'health-scare-scaleup',
    type: 'health',
    title: 'A Frightening Chest Pain',
    description:
      'In the middle of a board meeting, a sharp pain in your chest sends you to the emergency room. The tests take hours.',
    weight: 6,
    stages: ['scaleup', 'unicorn'],
    requirements: { maxHealth: 45 },
    choices: [
      {
        text: 'Take the full recovery time the doctors recommend',
        outcome: 'It was stress-induced, not cardiac — but it was a wake-up call you needed.',
        effects: { health: 25, happiness: 6, quality: -4 },
      },
      {
        text: 'Check out of the hospital early to catch up on work',
        outcome: 'Against medical advice, you are back at your desk within a day.',
        effects: { health: -15, quality: 3 },
      },
    ],
  },
  {
    id: 'child-recital',
    type: 'relationship',
    title: 'Your Kid\'s School Recital',
    description:
      'Your child has a small role in the school play tonight. A critical investor call is scheduled for the exact same time.',
    weight: 8,
    stages: ['scaleup', 'unicorn', 'ipo'],
    requirements: { minAge: 32 },
    choices: [
      {
        text: 'Go to the recital, reschedule the call',
        outcome: 'You caught every second of it. The investor understood.',
        effects: { relationships: 12, happiness: 8 },
      },
      {
        text: 'Take the call, watch the recording later',
        outcome: 'The deal moved forward. The recording is not the same as being there.',
        effects: { relationships: -8, cash: 200000 },
      },
    ],
  },
  {
    id: 'burnout-team-wide',
    type: 'employee',
    title: 'The Whole Team Is Exhausted',
    description:
      'An anonymous engagement survey comes back grim: half the company reports feeling burned out. Something has to change.',
    weight: 7,
    stages: ['scaleup', 'unicorn'],
    requirements: { maxMorale: 55 },
    choices: [
      {
        text: 'Mandate a company-wide week off',
        outcome: 'Expensive in lost velocity, priceless in goodwill.',
        effects: { cash: -300000, morale: 20, happiness: 3 },
      },
      {
        text: 'Roll out a wellness stipend program',
        outcome: 'A meaningful, ongoing gesture.',
        effects: { cash: -50000, morale: 10 },
      },
      {
        text: 'Push through the current sprint first',
        outcome: 'The deadline was met. The exhaustion was not addressed.',
        effects: { morale: -12, quality: 3 },
      },
    ],
  },

  // ============================================================
  // UNICORN STAGE
  // ============================================================
  {
    id: 'regulatory-inquiry',
    type: 'legal',
    title: 'Regulators Come Calling',
    description:
      "A government agency has opened an inquiry into your data practices. It's routine for companies at your scale, but it is not fun.",
    weight: 7,
    stages: ['unicorn', 'ipo'],
    choices: [
      {
        text: 'Cooperate fully and proactively',
        outcome: 'The transparency earned goodwill, even under scrutiny.',
        effects: { reputation: 4, cash: -400000 },
      },
      {
        text: 'Lawyer up and contest every request',
        outcome: 'A drawn-out fight that strained the legal budget.',
        effects: { cash: -1200000, reputation: -6, health: -8 },
      },
      {
        text: 'Settle quickly to make it go away',
        outcome: 'Expensive, but it ends quickly and quietly.',
        effects: { cash: -2000000, reputation: 2 },
      },
    ],
  },
  {
    id: 'unicorn-poaching-war',
    type: 'competitor',
    title: 'A Rival Is Poaching Your Executives',
    description:
      'Three of your VPs have received eye-watering offers from a well-funded competitor this month alone.',
    weight: 7,
    stages: ['unicorn', 'ipo'],
    choices: [
      {
        text: 'Launch an aggressive retention package',
        outcome: 'Expensive, but the exodus stops.',
        effects: { cash: -2000000, morale: 15 },
      },
      {
        text: 'Let the market sort it out',
        outcome: 'You lose two of the three. Rebuilding begins.',
        effects: { quality: -8, morale: -6 },
      },
    ],
  },
  {
    id: 'board-pressure',
    type: 'investor',
    title: 'The Board Wants Faster Growth',
    description:
      'At the quarterly board meeting, two directors push hard for a more aggressive growth strategy, whatever the cost to margins.',
    weight: 7,
    stages: ['unicorn', 'ipo'],
    choices: [
      {
        text: 'Push back and defend a sustainable pace',
        outcome: 'A tense meeting, but you held your ground.',
        effects: { happiness: 3, health: -4, morale: 4 },
      },
      {
        text: 'Give the board what they want',
        outcome: 'Growth accelerates, but so does the pressure on the team.',
        effects: { mrr: 15000, morale: -10, health: -6 },
      },
    ],
  },
  {
    id: 'documentary-feature',
    type: 'opportunity',
    title: 'A Documentary Wants to Feature You',
    description:
      'A well-known filmmaker wants to follow you for a documentary about founders who built something from nothing.',
    weight: 5,
    stages: ['unicorn', 'ipo'],
    choices: [
      {
        text: 'Say yes and open up your life to the cameras',
        outcome: 'Vulnerable, but the film resonates deeply with audiences.',
        effects: { reputation: 15, happiness: -4, relationships: -4 },
      },
      {
        text: 'Decline — you prefer to stay private',
        outcome: 'You keep your life to yourself. No regrets.',
        effects: { happiness: 3 },
      },
    ],
  },
  {
    id: 'health-collapse-warning',
    type: 'health',
    title: 'Your Assistant Finds You Passed Out at Your Desk',
    description:
      'You blacked out briefly from exhaustion. Your assistant found you and called for help immediately. This is serious now.',
    weight: 8,
    stages: ['unicorn', 'ipo'],
    requirements: { maxHealth: 35 },
    choices: [
      {
        text: 'Take a real medical leave',
        outcome: 'A hard decision that may have saved your life.',
        effects: { health: 30, happiness: 5, quality: -6, morale: -3 },
      },
      {
        text: 'Rest for a day, then return to the grind',
        outcome: 'A brief pause before diving right back in.',
        effects: { health: 8 },
      },
    ],
  },
  {
    id: 'anniversary-forgotten',
    type: 'relationship',
    title: 'You Forgot Your Anniversary',
    description:
      'A calendar reminder buried under board decks meant your anniversary came and went unnoticed — until now.',
    weight: 7,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Plan an elaborate, heartfelt make-up trip',
        outcome: 'It took real effort, and it showed.',
        effects: { relationships: 12, cash: -8000, happiness: 4 },
      },
      {
        text: 'Apologize and promise to do better',
        outcome: 'Words help, but they have heard this before.',
        effects: { relationships: 2 },
      },
      {
        text: "Explain that you've just been slammed with work",
        outcome: 'That explanation did not land the way you hoped.',
        effects: { relationships: -10, happiness: -3 },
      },
    ],
  },
  {
    id: 'philanthropy-request',
    type: 'opportunity',
    title: 'A Foundation Wants a Donation',
    description:
      "A respected foundation has asked your company to fund a scholarship program in your industry's name.",
    weight: 5,
    stages: ['unicorn', 'ipo'],
    choices: [
      {
        text: 'Fund it generously',
        outcome: 'The goodwill — and the tax benefit — are both real.',
        effects: { cash: -3000000, reputation: 12, happiness: 6 },
      },
      {
        text: 'Offer a modest contribution',
        outcome: 'A fair middle ground.',
        effects: { cash: -300000, reputation: 4 },
      },
      {
        text: 'Decline for now',
        outcome: 'Maybe next year, once things settle down.',
        effects: {},
      },
    ],
  },

  // ============================================================
  // IPO-READY STAGE
  // ============================================================
  {
    id: 'ipo-roadshow',
    type: 'investor',
    title: 'The IPO Roadshow Begins',
    description:
      'Bankers have booked a whirlwind tour of institutional investors across three continents in two weeks.',
    weight: 8,
    stages: ['ipo'],
    choices: [
      {
        text: 'Give it everything you have',
        outcome: 'A grueling tour, but demand for the offering is strong.',
        effects: { cash: 20000000, health: -12, reputation: 10 },
      },
      {
        text: 'Delegate half the meetings to your CFO',
        outcome: 'A sane pace. The raise is slightly smaller but still strong.',
        effects: { cash: 12000000, health: -4, reputation: 6 },
      },
    ],
  },
  {
    id: 'activist-investor',
    type: 'investor',
    title: 'An Activist Investor Takes a Stake',
    description:
      'A well-known activist fund has quietly built a position and is now demanding changes to the board.',
    weight: 6,
    stages: ['ipo'],
    choices: [
      {
        text: 'Negotiate a settlement',
        outcome: 'A compromise reached before it turned into a public fight.',
        effects: { cash: -5000000, reputation: 3, morale: 2 },
      },
      {
        text: 'Fight the proxy battle publicly',
        outcome: 'A bruising, headline-grabbing fight — you narrowly win.',
        effects: { reputation: -5, health: -10, morale: -6 },
      },
    ],
  },
  {
    id: 'legacy-question',
    type: 'personal',
    title: 'What Do You Want This to Mean?',
    description:
      'Late one night, staring at a cap table worth more than you can process, a simple question will not leave you alone: what was this all for?',
    weight: 6,
    stages: ['unicorn', 'ipo'],
    choices: [
      {
        text: 'Write down what actually matters to you',
        outcome: 'A moment of real clarity, rare and grounding.',
        effects: { happiness: 10, health: 4 },
      },
      {
        text: 'Push the thought aside — there is work to do',
        outcome: 'The question waits. It always does.',
        effects: { happiness: -4 },
      },
    ],
  },
  {
    id: 'succession-planning',
    type: 'employee',
    title: 'The Board Raises Succession Planning',
    description:
      'For the first time, the board formally asks: what is the plan if something happens to you?',
    weight: 5,
    stages: ['ipo'],
    choices: [
      {
        text: 'Groom an internal successor',
        outcome: 'A thoughtful, gradual transfer of institutional knowledge begins.',
        effects: { morale: 6, reputation: 4 },
      },
      {
        text: 'Deflect — you are not going anywhere',
        outcome: 'The board nods, unconvinced, and moves on.',
        effects: { reputation: -2 },
      },
    ],
  },
  {
    id: 'ipo-day',
    type: 'opportunity',
    title: 'The Opening Bell',
    description:
      'Your company is finally listed. The ticker flashes on the screen behind you as photographers wait for the ceremonial bell.',
    weight: 4,
    stages: ['ipo'],
    requirements: { minValuation: 900000000 },
    choices: [
      {
        text: 'Ring the bell',
        outcome: 'A surreal, singular moment. You did this.',
        effects: { reputation: 20, happiness: 15, health: -3 },
      },
    ],
  },

  // ============================================================
  // CROSS-STAGE / ANY-STAGE EVENTS
  // ============================================================
  {
    id: 'old-friend-reconnects',
    type: 'relationship',
    title: 'An Old Friend Reaches Out',
    description:
      "Someone you haven't spoken to in years messages you out of the blue, just to catch up. No agenda, just an old friend.",
    weight: 10,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Make time for a real conversation',
        outcome: 'It was good for the soul in a way spreadsheets never are.',
        effects: { happiness: 8, relationships: 6 },
      },
      {
        text: 'Send a quick "so busy, let\'s catch up soon!"',
        outcome: 'A familiar, slightly hollow reply.',
        effects: { relationships: -2 },
      },
    ],
  },
  {
    id: 'gym-habit',
    type: 'personal',
    title: 'A New Fitness Routine',
    description:
      'A friend convinces you to try a 6am workout class. To your surprise, you actually look forward to it.',
    weight: 9,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Commit to it three times a week',
        outcome: 'The routine sticks, and you feel sharper for it.',
        effects: { health: 12, happiness: 4, quality: -1 },
      },
      {
        text: 'Go once, then let work take over again',
        outcome: 'A nice idea, buried under the calendar within a week.',
        effects: { happiness: -1 },
      },
    ],
  },
  {
    id: 'product-hunt-launch',
    type: 'viral',
    title: 'Product Hunt Launch Day',
    description:
      'Today is the day — your team has been prepping this Product Hunt launch for weeks. The comments are starting to roll in.',
    weight: 7,
    stages: ['garage', 'startup', 'scaleup'],
    choices: [
      {
        text: 'Spend the whole day engaging every comment',
        outcome: 'You hit #1 Product of the Day. Worth every reply.',
        effects: { users: 600, reputation: 8, health: -5 },
      },
      {
        text: 'Let the team handle it and check in periodically',
        outcome: 'A solid, sustainable showing. #3 Product of the Day.',
        effects: { users: 300, reputation: 4 },
      },
    ],
  },
  {
    id: 'server-outage',
    type: 'crisis',
    title: 'Total Outage',
    description:
      'Your entire platform has been down for twenty minutes. Customers are furious on social media. The on-call engineer cannot find the root cause.',
    weight: 9,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Jump in and debug alongside the team',
        outcome: 'You found it together. Painful, but resolved in an hour.',
        effects: { quality: 4, health: -8, users: -50 },
      },
      {
        text: 'Trust the on-call team to handle it',
        outcome: 'They fixed it without you, a bit slower, but they grew from it.',
        effects: { morale: 4, users: -100 },
      },
      {
        text: 'Bring in emergency infrastructure consultants',
        outcome: 'Costly, but the fix — and the prevention plan — came fast.',
        effects: { cash: -40000, quality: 6, users: -30 },
      },
    ],
  },
  {
    id: 'copycat-app-store',
    type: 'competitor',
    title: 'A Blatant Clone Appears',
    description:
      'Someone has copied your UI pixel-for-pixel and listed it in the app store under a different name.',
    weight: 6,
    stages: ['startup', 'scaleup', 'unicorn'],
    choices: [
      {
        text: 'File a takedown request',
        outcome: 'The clone was removed within days.',
        effects: { cash: -3000, reputation: 2 },
      },
      {
        text: 'Ignore it — imitation is a compliment',
        outcome: 'You stayed focused on your own roadmap instead.',
        effects: { morale: 2 },
      },
    ],
  },
  {
    id: 'anonymous-blog-post',
    type: 'crisis',
    title: 'An Anonymous Blog Post Goes Around',
    description:
      'A post titled "What It\'s Really Like Working at [Your Company]" is circulating, alleging a toxic culture under pressure.',
    weight: 6,
    stages: ['scaleup', 'unicorn', 'ipo'],
    requirements: { maxMorale: 60 },
    choices: [
      {
        text: 'Address it openly in an all-hands meeting',
        outcome: "Uncomfortable, but the team respected the directness.",
        effects: { morale: 6, reputation: -2 },
      },
      {
        text: 'Have PR issue a denial',
        outcome: 'The denial fooled no one internally. Trust erodes further.',
        effects: { morale: -8, reputation: -6 },
      },
      {
        text: 'Commission an independent culture review',
        outcome: 'A serious response that surfaced real, fixable problems.',
        effects: { cash: -60000, morale: 10, reputation: 2 },
      },
    ],
  },
  {
    id: 'mentor-checkin',
    type: 'personal',
    title: 'Your Old Mentor Checks In',
    description:
      'The person who gave you your first real career advice calls, just to ask how you are really doing — not the pitch-deck version.',
    weight: 8,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Be honest about the struggle',
        outcome: 'The honesty was a relief, and the advice was worth more than any board meeting.',
        effects: { happiness: 10, health: 3 },
      },
      {
        text: 'Give the polished, everything-is-great answer',
        outcome: 'A pleasant call, though it left something unsaid.',
        effects: { happiness: -1 },
      },
    ],
  },
  {
    id: 'conference-keynote',
    type: 'opportunity',
    title: 'Invited to Keynote a Conference',
    description:
      'A major industry conference wants you to deliver the closing keynote. It is a huge platform, and the deadline for slides is tight.',
    weight: 6,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Accept and pour effort into a great talk',
        outcome: 'A standing ovation, and a wave of inbound interest.',
        effects: { reputation: 10, users: 200, health: -5 },
      },
      {
        text: 'Send a senior team member instead',
        outcome: 'A good showing, and a growth moment for your team.',
        effects: { reputation: 4, morale: 4 },
      },
    ],
  },
  {
    id: 'personal-injury',
    type: 'health',
    title: 'A Bad Fall',
    description:
      'A slip on a wet sidewalk on the way to a meeting leaves you with a sprained wrist and a nasty bruise.',
    weight: 7,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Actually rest and let it heal',
        outcome: 'A minor injury handled properly, with no lasting issue.',
        effects: { health: 5, quality: -2 },
      },
      {
        text: 'Push through meetings one-handed',
        outcome: 'It healed slower than it should have.',
        effects: { health: -8 },
      },
    ],
  },
  {
    id: 'customer-love-letter',
    type: 'opportunity',
    title: 'A Customer Writes You a Letter',
    description:
      'A long-time user mails a handwritten letter explaining how your product genuinely changed their small business.',
    weight: 8,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Frame it and share it with the whole team',
        outcome: 'A genuine morale boost that reminded everyone why this matters.',
        effects: { morale: 8, happiness: 6 },
      },
      {
        text: 'Reply personally with a thank-you',
        outcome: 'A small, meaningful exchange between two humans.',
        effects: { happiness: 4, reputation: 2 },
      },
    ],
  },
  {
    id: 'salary-question',
    type: 'personal',
    title: "You Haven't Paid Yourself Properly in Months",
    description:
      'Your personal savings are thinning. Meanwhile, the company account looks healthier than ever. Something has to give.',
    weight: 7,
    stages: ['startup', 'scaleup'],
    requirements: { minValuation: 20000 },
    choices: [
      {
        text: 'Set yourself a fair, modest salary',
        outcome: 'A weight lifts. You can breathe again.',
        effects: { cash: -3000, happiness: 8, health: 3 },
      },
      {
        text: 'Keep deferring your own pay for the mission',
        outcome: 'Noble, and quietly exhausting.',
        effects: { happiness: -6, cash: 3000 },
      },
    ],
  },
  {
    id: 'parents-visit',
    type: 'relationship',
    title: 'Your Parents Come to Visit',
    description:
      'Your parents are in town and keep gently asking when you will "finally take a real vacation."',
    weight: 8,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Take three full days off to spend with them',
        outcome: 'It reminded you what all of this is supposed to be for.',
        effects: { relationships: 10, happiness: 8, quality: -3 },
      },
      {
        text: 'Squeeze in a dinner between meetings',
        outcome: 'Brief and a little rushed, but appreciated nonetheless.',
        effects: { relationships: 2 },
      },
    ],
  },
  {
    id: 'competitor-underhanded-hire',
    type: 'competitor',
    title: 'A Rival Hires Your Old Co-Founder',
    description:
      'The co-founder who left two years ago just joined your biggest competitor as Head of Product.',
    weight: 5,
    stages: ['scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Send a gracious, professional message',
        outcome: 'It kept the door open, and it felt like the right thing to do.',
        effects: { happiness: 3, reputation: 2 },
      },
      {
        text: 'Take it personally and say nothing',
        outcome: 'The silence between you both grows heavier.',
        effects: { happiness: -4 },
      },
    ],
  },
  {
    id: 'therapy-decision',
    type: 'personal',
    title: 'Considering Therapy',
    description:
      "A close friend suggests that talking to a professional might help you process the pressure you're under.",
    weight: 7,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    requirements: { maxHappiness: 55 },
    choices: [
      {
        text: 'Start seeing a therapist regularly',
        outcome: 'It becomes one of the steadiest parts of your week.',
        effects: { happiness: 12, health: 6, cash: -400 },
      },
      {
        text: "Decide you're fine and don't need it",
        outcome: 'The pressure stays exactly where it was.',
        effects: {},
      },
    ],
  },
  {
    id: 'employee-milestone-anniversary',
    type: 'employee',
    title: 'A Founding Employee\'s 5-Year Anniversary',
    description:
      'One of your very first hires just hit five years with the company. The team is quietly waiting to see if it will be acknowledged.',
    weight: 6,
    stages: ['scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Throw a genuine celebration and give equity refresh',
        outcome: 'A visible, generous gesture that the whole team noticed.',
        effects: { cash: -50000, morale: 14 },
      },
      {
        text: 'Send a nice note',
        outcome: 'Appreciated, if a little understated for the occasion.',
        effects: { morale: 3 },
      },
    ],
  },
];
