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

  // ============================================================
  // EXPANSION PACK — additional events
  // ============================================================
  {
    id: 'garage-flooding',
    type: 'crisis',
    title: 'The Garage Floods',
    description:
      'A burst pipe next door sends water pouring under the garage door, right toward your only server rack.',
    weight: 6,
    stages: ['garage'],
    choices: [
      {
        text: 'Grab everything and wade in to save it',
        outcome: 'Soaked shoes, dry hardware. Crisis averted.',
        effects: { health: -4, quality: 2 },
      },
      {
        text: 'Call for help and hope for the best',
        outcome: 'A neighbor helped just in time. Close call.',
        effects: { cash: -400, happiness: -3 },
      },
    ],
  },
  {
    id: 'hackathon-win',
    type: 'opportunity',
    title: 'You Win a Local Hackathon',
    description:
      'A weekend hackathon prototype using your product as a base wins first place, and a local news crew wants a quote.',
    weight: 6,
    stages: ['garage', 'startup'],
    choices: [
      {
        text: 'Give the interview',
        outcome: 'A tiny, charming clip that brought in a wave of curious signups.',
        effects: { users: 60, reputation: 4, happiness: 3 },
      },
      {
        text: 'Stay heads-down instead',
        outcome: 'You skipped the spotlight to keep shipping.',
        effects: { quality: 3 },
      },
    ],
  },
  {
    id: 'credit-card-maxed',
    type: 'crisis',
    title: 'Your Personal Credit Card Is Maxed',
    description:
      "You've been quietly funding the company on plastic. The statement arrives, and the number is scarier than you expected.",
    weight: 7,
    stages: ['garage', 'startup'],
    choices: [
      {
        text: 'Pay it down from company revenue',
        outcome: 'Blurring the lines, but it stops the bleeding.',
        effects: { cash: -1500, happiness: 4 },
      },
      {
        text: 'Cut personal spending to the bone instead',
        outcome: 'A grim, disciplined month, but you keep the accounts separate.',
        effects: { happiness: -6, health: -3 },
      },
    ],
  },
  {
    id: 'first-negative-review',
    type: 'opportunity',
    title: 'Your First One-Star Review',
    description:
      'It finally happened: a detailed, articulate, one-star review pointing out real flaws in the product.',
    weight: 7,
    stages: ['garage', 'startup'],
    choices: [
      {
        text: 'Reply and fix the issues they raised',
        outcome: 'They updated the review to four stars. Lesson learned.',
        effects: { quality: 5, reputation: 2 },
      },
      {
        text: 'Let it go — one review will not sink you',
        outcome: 'You moved on, though it stung for a day.',
        effects: { happiness: -2 },
      },
    ],
  },
  {
    id: 'cofounder-equity-talk',
    type: 'employee',
    title: 'The Equity Split Conversation',
    description:
      'It has been quietly avoided for months, but the equity split between you and your co-founder finally needs to be put in writing.',
    weight: 6,
    stages: ['garage', 'startup'],
    choices: [
      {
        text: 'Propose an even split and vesting schedule',
        outcome: 'Fair, clean, and a weight off both your shoulders.',
        effects: { morale: 8, relationships: 3 },
      },
      {
        text: 'Push for a larger share, citing the idea was yours',
        outcome: 'You got the split you wanted. The room felt colder afterward.',
        effects: { morale: -8, cash: 0 },
      },
    ],
  },
  {
    id: 'weekend-hobby-abandoned',
    type: 'personal',
    title: 'You Realize You Have No Hobbies Left',
    description:
      'A friend asks what you do for fun these days. You genuinely cannot think of an answer that is not "work".',
    weight: 8,
    stages: ['garage', 'startup', 'scaleup'],
    requirements: { maxHappiness: 60 },
    choices: [
      {
        text: 'Pick something up again, on purpose',
        outcome: 'Twenty minutes of guitar a night turned out to matter a lot.',
        effects: { happiness: 8, health: 2, quality: -1 },
      },
      {
        text: "Shrug it off — there'll be time later",
        outcome: 'Later keeps getting further away.',
        effects: { happiness: -2 },
      },
    ],
  },
  {
    id: 'customer-support-flood',
    type: 'employee',
    title: 'Support Tickets Are Piling Up',
    description:
      'Growth outpaced your support capacity weeks ago. The backlog is now embarrassingly long.',
    weight: 7,
    stages: ['startup', 'scaleup'],
    choices: [
      {
        text: 'Hire two support reps immediately',
        outcome: 'The backlog clears within a week. Customers notice the responsiveness.',
        effects: { cash: -9000, quality: 3, morale: 2 },
      },
      {
        text: 'Build a self-serve help center instead',
        outcome: 'A slower fix, but a lasting one.',
        effects: { cash: -3000, quality: 5 },
      },
      {
        text: 'Push through with the current team',
        outcome: 'The team is stretched thin, and it shows.',
        effects: { morale: -8, quality: -3 },
      },
    ],
  },
  {
    id: 'wrong-hire-culture-fit',
    type: 'employee',
    title: 'A Bad Culture Fit',
    description:
      'A recent senior hire is technically brilliant but has been quietly making the team miserable.',
    weight: 6,
    stages: ['startup', 'scaleup'],
    choices: [
      {
        text: 'Have a direct conversation and set expectations',
        outcome: 'It landed. Behavior improved, slowly but for real.',
        effects: { morale: 6 },
      },
      {
        text: 'Let them go, despite the skill gap it leaves',
        outcome: 'Painful short-term, but the team visibly exhaled.',
        effects: { morale: 10, quality: -4, cash: -8000 },
      },
      {
        text: 'Hope it resolves itself',
        outcome: 'It did not. Two good people quietly quit this quarter.',
        effects: { morale: -12 },
      },
    ],
  },
  {
    id: 'unexpected-tax-bill',
    type: 'legal',
    title: 'An Unexpected Tax Bill',
    description:
      'Your accountant calls with bad news: a filing error from last year means a much larger bill than planned, due this month.',
    weight: 6,
    stages: ['startup', 'scaleup', 'unicorn'],
    choices: [
      {
        text: 'Pay it in full immediately',
        outcome: 'Painful, but clean. No lingering penalties.',
        effects: { cash: -60000 },
      },
      {
        text: 'Negotiate a payment plan',
        outcome: 'Manageable installments, plus a bit of interest.',
        effects: { cash: -70000, happiness: -2 },
      },
    ],
  },
  {
    id: 'open-source-drama',
    type: 'competitor',
    title: 'An Open-Source Alternative Emerges',
    description:
      'A free, open-source project with similar functionality is gaining traction among your more technical users.',
    weight: 6,
    stages: ['startup', 'scaleup'],
    choices: [
      {
        text: 'Lean into features power users cannot self-host',
        outcome: 'A smart differentiation move that held onto your best customers.',
        effects: { quality: 5, mrr: 200 },
      },
      {
        text: 'Contribute back to the project in good faith',
        outcome: 'An unusual, generous move that earned real community respect.',
        effects: { reputation: 8, cash: -5000 },
      },
    ],
  },
  {
    id: 'sibling-wedding',
    type: 'relationship',
    title: "Your Sibling's Wedding",
    description:
      'Your sibling is getting married out of town, the same week as a critical product launch.',
    weight: 7,
    stages: ['startup', 'scaleup', 'unicorn'],
    choices: [
      {
        text: 'Go, and delegate the launch entirely',
        outcome: 'The team stepped up beautifully, and you did not miss a moment of the wedding.',
        effects: { relationships: 14, happiness: 6, quality: 2 },
      },
      {
        text: 'Fly in for the ceremony only, then fly right back',
        outcome: 'A whirlwind trip. Better than missing it entirely.',
        effects: { relationships: 4, health: -4 },
      },
      {
        text: 'Skip it to run the launch personally',
        outcome: 'The launch went well. The family group chat did not mention it.',
        effects: { relationships: -14, quality: 4 },
      },
    ],
  },
  {
    id: 'investor-demands-layoffs',
    type: 'investor',
    title: 'A Board Member Pushes for Layoffs',
    description:
      'To "extend runway," one board member is pushing hard for a 15% headcount reduction, whether or not it is truly needed.',
    weight: 6,
    stages: ['scaleup', 'unicorn'],
    choices: [
      {
        text: 'Resist and present an alternative efficiency plan',
        outcome: "The board backed off, for now, respecting the pushback.",
        effects: { morale: 5, happiness: -3 },
      },
      {
        text: 'Go along with a smaller, targeted reduction',
        outcome: 'A hard week. Runway improved; trust took a hit.',
        effects: { cash: 400000, morale: -14, reputation: -3 },
      },
    ],
  },
  {
    id: 'competitor-flames-out',
    type: 'competitor',
    title: 'A Rival Suddenly Shuts Down',
    description:
      'Without warning, one of your scrappier competitors announces they are shutting down, effective immediately.',
    weight: 6,
    stages: ['startup', 'scaleup', 'unicorn'],
    choices: [
      {
        text: 'Reach out to their stranded customers directly',
        outcome: 'A wave of grateful new signups, glad to have somewhere to land.',
        effects: { users: 2000, mrr: 3000 },
      },
      {
        text: 'Just note it and move on',
        outcome: 'One less competitor to think about.',
        effects: { happiness: 2 },
      },
    ],
  },
  {
    id: 'sleep-tracking-obsession',
    type: 'health',
    title: 'You Start Obsessively Tracking Your Sleep',
    description:
      'A new wearable has you staring at sleep-quality graphs every morning, sometimes more stressed by the data than the tiredness itself.',
    weight: 6,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Use the data to actually build a consistent routine',
        outcome: 'The graphs turned into real, better habits.',
        effects: { health: 10, happiness: 2 },
      },
      {
        text: 'Let the anxiety about "bad scores" take over',
        outcome: 'Ironically, worrying about sleep made it worse.',
        effects: { health: -5, happiness: -4 },
      },
    ],
  },
  {
    id: 'podcast-appearance',
    type: 'opportunity',
    title: 'Invited on a Popular Podcast',
    description:
      'A well-known business podcast wants you for a full hour-long episode about your journey.',
    weight: 6,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Prepare thoroughly and give it your best',
        outcome: 'A candid, well-told episode that resonated widely.',
        effects: { reputation: 8, users: 250 },
      },
      {
        text: 'Wing it — you know your story',
        outcome: 'A looser conversation. Charming, if a little unfocused.',
        effects: { reputation: 4, users: 100 },
      },
    ],
  },
  {
    id: 'pet-emergency',
    type: 'personal',
    title: 'Your Dog Needs Emergency Surgery',
    description:
      'A late-night call from the vet: your dog needs surgery tonight, or the outlook gets much worse.',
    weight: 7,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Approve it immediately, cost be damned',
        outcome: 'The surgery went well. Worth every cent.',
        effects: { cash: -4000, happiness: 8, relationships: 3 },
      },
      {
        text: 'Ask for the more conservative, cheaper option',
        outcome: 'A harder recovery, but a good outcome in the end.',
        effects: { cash: -1200, happiness: -2 },
      },
    ],
  },
  {
    id: 'ex-employee-lawsuit',
    type: 'legal',
    title: 'A Former Employee Files a Complaint',
    description:
      'Someone let go six months ago has filed a formal wrongful-termination complaint. Your HR file on the case is thin.',
    weight: 6,
    stages: ['scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Settle quietly',
        outcome: 'Costly, but it closes the matter cleanly.',
        effects: { cash: -150000 },
      },
      {
        text: 'Fight it, confident in the original decision',
        outcome: 'A drawn-out process, but you were vindicated.',
        effects: { cash: -80000, reputation: -2, health: -6 },
      },
    ],
  },
  {
    id: 'company-retreat',
    type: 'employee',
    title: 'Planning the Annual Company Retreat',
    description:
      'It is that time of year again — the team is asking whether there will be a retreat, and where.',
    weight: 6,
    stages: ['scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Go big: an international offsite',
        outcome: 'Expensive, unforgettable, and a genuine morale spike.',
        effects: { cash: -200000, morale: 18 },
      },
      {
        text: 'Keep it modest: a local retreat',
        outcome: 'Simple and well-received, without breaking the budget.',
        effects: { cash: -30000, morale: 8 },
      },
      {
        text: 'Skip it this year to save cash',
        outcome: 'A quiet disappointment settles over the team chat.',
        effects: { morale: -6 },
      },
    ],
  },
  {
    id: 'sudden-viral-backlash',
    type: 'crisis',
    title: 'A Feature Sparks Unexpected Backlash',
    description:
      'A feature you were proud of is suddenly the subject of a heated online debate about privacy implications you had not fully considered.',
    weight: 7,
    stages: ['scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Pull the feature and apologize',
        outcome: 'A humbling but well-received response.',
        effects: { reputation: 2, quality: -3, mrr: -500 },
      },
      {
        text: 'Add clearer controls instead of removing it',
        outcome: 'A measured fix that mostly satisfied critics.',
        effects: { cash: -20000, quality: 3, reputation: 1 },
      },
      {
        text: 'Defend the feature as-is',
        outcome: 'The backlash intensified before eventually fading.',
        effects: { reputation: -8, mrr: -1500 },
      },
    ],
  },
  {
    id: 'mid-life-crisis-car',
    type: 'personal',
    title: 'An Impulse Purchase',
    description:
      'Standing in a dealership on a random Tuesday, you find yourself seriously considering a car you absolutely do not need.',
    weight: 6,
    stages: ['unicorn', 'ipo'],
    choices: [
      {
        text: 'Buy it — you have earned a little joy',
        outcome: 'Ridiculous, impractical, and genuinely fun.',
        effects: { cash: -120000, happiness: 8 },
      },
      {
        text: 'Walk away and stay practical',
        outcome: 'A sensible choice you feel only slightly wistful about.',
        effects: { happiness: -1 },
      },
    ],
  },
  {
    id: 'competing-term-sheets',
    type: 'investor',
    title: 'Two Term Sheets, One Decision',
    description:
      'Two firms want to lead your next round. One offers a higher price; the other offers a partner with deep operational experience.',
    weight: 6,
    stages: ['scaleup', 'unicorn'],
    choices: [
      {
        text: 'Take the higher valuation',
        outcome: 'More cash, more dilution avoided. A straightforward win on paper.',
        effects: { cash: 3000000, reputation: 3 },
      },
      {
        text: 'Take the experienced operator instead',
        outcome: 'Slightly less cash, but their guidance proves invaluable.',
        effects: { cash: 2200000, quality: 6, morale: 6 },
      },
    ],
  },
  {
    id: 'reunion-invite',
    type: 'relationship',
    title: 'Your College Reunion',
    description:
      'An invitation to your ten-year college reunion arrives. Half of you wants to go; half of you dreads the small talk about "what you do now."',
    weight: 6,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Go, and actually be present',
        outcome: 'A genuinely nice night, free of pitches and metrics.',
        effects: { happiness: 8, relationships: 6 },
      },
      {
        text: 'Skip it — too much going on right now',
        outcome: 'A quiet weekend at your desk instead.',
        effects: { relationships: -3 },
      },
    ],
  },
  {
    id: 'whistleblower-internal',
    type: 'legal',
    title: 'An Internal Whistleblower Report',
    description:
      'An anonymous internal report alleges a finance team member has been misreporting expenses. It needs to be taken seriously.',
    weight: 5,
    stages: ['unicorn', 'ipo'],
    choices: [
      {
        text: 'Launch a formal, independent investigation',
        outcome: 'The claims were substantiated. Handled by the book, it protected the company.',
        effects: { cash: -100000, reputation: 4, morale: 4 },
      },
      {
        text: 'Handle it quietly, internally',
        outcome: 'It was resolved, but whispers about the handling lingered.',
        effects: { reputation: -6, morale: -4 },
      },
    ],
  },
  {
    id: 'award-nomination',
    type: 'opportunity',
    title: "Nominated for 'Founder of the Year'",
    description:
      'An industry association has nominated you for a well-regarded annual award. The ceremony is black-tie.',
    weight: 5,
    stages: ['scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Attend and lean into the recognition',
        outcome: 'You won. A genuinely proud, if slightly surreal, evening.',
        effects: { reputation: 10, happiness: 6 },
      },
      {
        text: "Send a statement but skip the ceremony — it's not really your scene",
        outcome: 'A gracious note in absentia. The award still came.',
        effects: { reputation: 6 },
      },
    ],
  },
  {
    id: 'quiet-monday',
    type: 'personal',
    title: 'A Surprisingly Quiet Monday',
    description:
      'For once, nothing is on fire. No crises, no urgent Slack messages — just a calm, ordinary Monday morning.',
    weight: 10,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    choices: [
      {
        text: 'Use it to actually think, not just react',
        outcome: 'A rare, valuable hour of real strategic clarity.',
        effects: { quality: 3, happiness: 4 },
      },
      {
        text: 'Enjoy the calm and go for a long walk',
        outcome: 'Sometimes doing nothing is exactly the right move.',
        effects: { health: 5, happiness: 5 },
      },
    ],
  },
];
