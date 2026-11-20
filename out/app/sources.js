// Sources and roadmap: the facts this guide draws on, and the three-step
// plan to the platinum. Every trophy's guide names its sources by key; the
// detail pane expands the keys to names and links. Links open only when the
// reader follows them — the app itself fetches nothing.

// Keyed source directory. Keep the keys short: trophies.json stores them.
export const SOURCES = {
  powerpyx: {
    name: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/',
  },
  powerpyx100: {
    name: 'PowerPyx — GTA 6 100% Completion Checklist & Guide',
    url: 'https://www.powerpyx.com/gta-6-100-completion-checklist-guide/',
  },
  sixshore: {
    name: 'Sixshore — GTA 6 Trophy and Achievement List',
    url: 'https://sixshore.com/gta-6/guides/trophies-and-achievements/',
  },
  gamemapa: {
    name: 'GameMapa — All 55 GTA 6 Trophies: Full List and Roadmap',
    url: 'https://gamemapa.com/en/gta-6/guides/gta-6-trophy-achievement-list/',
  },
  exophase: {
    name: 'Exophase — Grand Theft Auto VI trophy list',
    url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
  },
  psnprofiles: {
    name: 'PSNProfiles — Grand Theft Auto VI trophies',
    url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
  },
  pushsquare: {
    name: 'Push Square — GTA 6 Trophy Guide (work in progress)',
    url: null,
  },
};

// The platinum roadmap, in three steps, after PowerPyx. Times are the
// guides' estimates, not promises: the 100% checklist is where the hours go.
export const ROADMAP_STAGES = [
  {
    title: 'Finish the story and pick up optional missions',
    time: 'about 60–80 hours',
    points: [
      'Play through all five chapters. Story trophies pop on their own; the chapter trophies land a mission or two into the next chapter, which is normal.',
      'Do the Chapter 1 meditation the morning after the mission Down to Earth: Lucia mentions meditating in the kitchen at Jason’s house and walks to the balcony. Follow her and accept. It is the one thing that may not come back — see the Missables tab.',
      'Take optional missions as they appear (purple icons, and black icons with pink letters). The 100% checklist needs any 100 of them, out of several hundred.',
      'Scan every new vehicle with the WAiNK phone app and study new animals through the binoculars. The checklist needs 200 of 277 base vehicle models and 100 of 255 animals; studying is enough, hunting is not required.',
      'Keep a manual save at the start and end of every chapter. There is no mission replay.',
    ],
    trophies: 'Story trophies (12), Positive Mental Attitude if you do the balcony meditation, plus early progress on Whip It Good, One Last Thing and the stranger strands.',
  },
  {
    title: 'The 100% Completion checklist and the Challenges',
    time: 'about 100 hours',
    points: [
      'After the ending, open Progress, then Stats, then 100% Completion. Progress made during the story already counts.',
      'The checklist is lenient — closer to 60% true completion — but a few rows need everything: all 39 gang operations, all 22 bank jobs, all 7 payday loan jobs, all 8 bank vaults, all 33 underwater discoveries, all 42 shooting range gold medals, all 42 drone time trials and all 15 of Bret’s target decks.',
      'Most collectibles need only part of the set: 15 of 18 card sets, 15 of 18 meditation spots, 100 of 125 Cocaine Flamingos, 30 of 34 magazines, books and comics, 100 WAiNK locations.',
      'Stunts: 300 of 397 (130 stunt jumps, 202 flights under bridges, 40 knife flights, 25 base jumps). Races: 30 of 40 unique races won and 10 of 13 race challenge gold medals.',
      'Challenges: 70 of 80, so the hardest ten can be skipped. That also clears One Last Thing (50) on the way.',
    ],
    trophies: 'A Long Road (gold), Cunning Stunts, The Shootist, Top Fun, Don’t Touch My Deck, You WAiNKer!, Maximum Withdrawal, Pest Control, A Classic Blitz Play, Dime on the Dollar, The Goodtime State.',
  },
  {
    title: 'Strangers & Freaks and whatever is left',
    time: 'about 10 hours',
    points: [
      'The stranger strands are not part of the 100% checklist, so they are usually what is left: finish eight qualifying strands across Leonida.',
      'Sweep up the side strands one by one — Andy, Kenton, Billy, Randy and Tyrone — and any open-world trophies that did not pop on the way, such as the bank vaults, the armored truck and the jewelry store.',
      'Check the tracker for anything still unticked. The platinum pops the moment the last of the other 54 is earned.',
    ],
    trophies: 'Strangers & Freaks (silver), Road to Rehabilitation, This Was No Boat Accident, The Lone Rider, Supply & Demand, Spin On This!, Fair Game, then Vice Got a Price! (platinum).',
  },
];

// Human-readable kind labels for the filter buttons and tags.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

// The five filter kinds the rules ask for. Online is genuinely empty: every
// one of the 55 trophies is single-player, so the filter shows that plainly
// instead of pretending otherwise.
export const FILTER_KINDS = ['story', 'missable', 'collectibles', 'activities', 'online'];
