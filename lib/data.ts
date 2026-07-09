export type Locale = "en" | "ko" | "zh" | "ja";

export type Metric = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  detail: string;
  placeholder?: boolean;
};

export type CaseStudy = {
  slug: string;
  client: string;
  category: string;
  href?: string;
  media: {
    src: string;
    alt: string;
    cue: string;
  };
  title: string;
  oneLiner: string;
  context: string;
  strategy: readonly string[];
  metrics?: readonly Metric[];
  stack: readonly string[];
  status: "live" | "prototype" | "in-progress" | "archived";
  proofLevel: "live-link" | "screenshot" | "metric-claimed" | "internal-only" | "prototype" | "concept" | "repository";
  story: {
    problem: string;
    audience: string;
    decision: string;
    system: string;
    outcome: string;
    next: string;
  };
  caseRoom?: {
    verdict: string;
    judgeNote: string;
    checkpoints: readonly {
      label: string;
      value: string;
    }[];
  };
  proofMedia?: readonly {
    label: string;
    kind: "capture" | "workflow" | "log" | "repo" | "redacted";
    src: string;
    alt: string;
    caption: string;
  }[];
  evidence: readonly {
    label: string;
    type: "live" | "metric" | "screenshot" | "repository" | "article" | "testimonial" | "caveat";
    value?: string;
    href?: string;
    caveat?: string;
  }[];
  artifacts?: readonly {
    label: string;
    kind: "site" | "blog" | "demo" | "screenshot" | "deck" | "repo";
    href?: string;
  }[];
  relatedPosts?: readonly {
    title: string;
    href: string;
  }[];
};

export type OperatingStep = {
  step: string;
  title: string;
  body: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  title: string;
};

type NavItem = {
  label: string;
  href: string;
};

export type PortfolioContent = {
  profile: {
    name: string;
    role: string;
    location: string;
    email: string;
    headline: string;
    headlineParts: readonly string[];
    subheadline: string;
    availability: string;
    primaryCta: string;
    secondaryCta: string;
  };
  ui: {
    languageLabel: string;
    availabilityLabel: string;
    proofCue: string;
    signalScanLabel: string;
    signalWords: readonly string[];
    caseStudyCta: string;
    offerScopeLabel: string;
    quoteOpen: string;
    quoteClose: string;
    emailAria: string;
    scheduleAria: string;
    footerProduct: string;
  };
  nav: readonly NavItem[];
  sections: {
    proof: {
      eyebrow: string;
      heading: string;
      note: string;
    };
    work: {
      eyebrow: string;
      heading: string;
    };
    system: {
      eyebrow: string;
      heading: string;
      marquee: string;
    };
    offer: {
      eyebrow: string;
      heading: string;
      body: string;
      cta: string;
    };
    testimonials: {
      eyebrow: string;
      heading: string;
    };
    contact: {
      eyebrow: string;
      heading: string;
      body: string;
      primaryCta: string;
      secondaryCta: string;
    };
  };
  proofMetrics: readonly Metric[];
  caseStudies: readonly CaseStudy[];
  operatingSystem: readonly OperatingStep[];
  offers: readonly string[];
  testimonials: readonly Testimonial[];
  contact: {
    email: string;
    scheduleUrl: string;
  };
};

export const languageOptions: readonly {
  locale: Locale;
  shortLabel: string;
  label: string;
  htmlLang: string;
}[] = [
  { locale: "en", shortLabel: "EN", label: "English", htmlLang: "en" }
];

const sharedContact = {
  email: "0xnimdal@gmail.com",
  scheduleUrl: "mailto:0xnimdal@gmail.com"
};

const workCaseStudies: readonly CaseStudy[] = [
  {
    slug: "ethosalpha",
    client: "ethosalpha",
    category: "Web3 analytics",
    href: "https://github.com/nimdalkr/ethoskaito",
    media: {
      src: "/media/projects/ethosalpha-proof.png",
      alt: "ethosalpha GitHub repository proof screenshot.",
      cue: "Repository proof"
    },
    title: "Ethos social signal dashboard.",
    oneLiner: "An analytics dashboard for reading Web3 trust, reputation, and social response signals in one place.",
    context: "Kept from the previous personal projects area and reframed as a focused research surface for Web3 social and reputation data.",
    strategy: [
      "Combine Ethos data with social metrics for faster Web3 project analysis.",
      "Make project trust and community response easier to compare at a glance.",
      "Turn market and community signals into clearer research decisions."
    ],
    stack: ["web3", "analytics", "social signal"],
    status: "prototype",
    proofLevel: "repository",
    story: {
      problem: "Web3 social trust signals are scattered across reputation surfaces, community response, and project-specific metrics.",
      audience: "Researchers and builders who need to compare reputation signals before spending attention on a project.",
      decision: "Keep the tool narrow: make the reputation surface readable before adding broader market features.",
      system: "A focused dashboard pattern that treats social trust as a comparable research layer.",
      outcome: "A clear personal-project proof of Nimdal's Web3 analytics direction.",
      next: "Add public screenshots, example datasets, and a short methodology note before presenting it as a mature analytics product."
    },
    caseRoom: {
      verdict: "Strong concept, repository-level proof.",
      judgeNote: "The project already supports Nimdal's research identity, but needs a public methodology screen before it can be judged as a finished analytics product.",
      checkpoints: [
        { label: "Visible proof", value: "GitHub repository" },
        { label: "Current gap", value: "No public usage screen" },
        { label: "Next asset", value: "Annotated dashboard capture" }
      ]
    },
    proofMedia: [
      {
        label: "Repository surface",
        kind: "repo",
        src: "/media/projects/ethosalpha-proof.png",
        alt: "ethosalpha public GitHub repository screenshot.",
        caption: "Public repository proof keeps this project honest: it is shown as a prototype until a product screen and methodology note are added."
      }
    ],
    evidence: [
      { label: "Repository", type: "repository", href: "https://github.com/nimdalkr/ethoskaito" },
      { label: "Repository screenshot", type: "screenshot", value: "Public GitHub surface captured for proof." },
      { label: "Proof caveat", type: "caveat", caveat: "Presented as a personal prototype until public usage metrics are available." }
    ],
    artifacts: [
      { label: "GitHub repository", kind: "repo", href: "https://github.com/nimdalkr/ethoskaito" }
    ]
  },
  {
    slug: "hyperalphaduo",
    client: "HyperAlphaDuo",
    category: "Trading research",
    href: "https://hyperalphaduo.vercel.app/",
    media: {
      src: "/media/projects/hyperalphaduo-proof.png",
      alt: "HyperAlphaDuo live trading research tool screenshot.",
      cue: "Live tool proof"
    },
    title: "Hyperliquid market position search.",
    oneLiner: "A research tool for Hyperliquid positions, tokenized equities, and arbitrage signals across Korean exchanges.",
    context: "Built to compare fragmented price, listing, deposit, and withdrawal data across on-chain and exchange markets.",
    strategy: [
      "Filter and search Hyperliquid token positions across coins and equities.",
      "Analyze arbitrage between HIP-3 tokenized equities and their underlying listed stocks.",
      "Monitor arbitrage, listings, and deposit/withdrawal availability for Upbit and Bithumb-listed tokens."
    ],
    stack: ["hyperliquid", "arbitrage", "monitoring"],
    status: "live",
    proofLevel: "live-link",
    story: {
      problem: "Tokenized equity, exchange listing, and deposit/withdrawal signals move across fragmented markets.",
      audience: "Crypto traders and researchers who need faster comparison across Hyperliquid and Korean exchange surfaces.",
      decision: "Frame the product as a research console rather than a generic tracker.",
      system: "Filtered position search, arbitrage views, and exchange availability monitoring.",
      outcome: "A live artifact that best proves Nimdal's market-research tooling direction.",
      next: "Add annotated screenshots, known limitations, and example arbitrage reads for stronger public proof."
    },
    caseRoom: {
      verdict: "Best current proof candidate.",
      judgeNote: "This is the clearest live product in the personal project set because the user can open it, inspect the interface, and understand the market-research use case.",
      checkpoints: [
        { label: "Visible proof", value: "Live Vercel app" },
        { label: "Interaction value", value: "Filtered research console" },
        { label: "Next asset", value: "One annotated arbitrage workflow" }
      ]
    },
    proofMedia: [
      {
        label: "Production interface",
        kind: "capture",
        src: "/media/projects/hyperalphaduo-proof.png",
        alt: "HyperAlphaDuo production interface screenshot.",
        caption: "A live production capture is used instead of a decorative placeholder, so the case room starts from inspectable product proof."
      }
    ],
    evidence: [
      { label: "Live site", type: "live", href: "https://hyperalphaduo.vercel.app/" },
      { label: "Production screenshot", type: "screenshot", value: "Live interface captured from production." },
      { label: "Public proof", type: "caveat", caveat: "Add one annotated workflow before award submission." }
    ],
    artifacts: [
      { label: "Open live tool", kind: "site", href: "https://hyperalphaduo.vercel.app/" }
    ]
  },
  {
    slug: "kol-listing",
    client: "KOL Listing",
    category: "Crypto research",
    href: "https://kollisting.vercel.app/",
    media: {
      src: "/media/projects/kol-listing.png",
      alt: "KOL Listing project visual.",
      cue: "Crypto research"
    },
    title: "KOL activity to KRW listing research.",
    oneLiner: "A crypto research tool that studies how KOL ads and AMA activity may affect KRW exchange listings.",
    context: "Built to connect public KOL campaigns with listing expectations, market attention, and project selection patterns.",
    strategy: [
      "Analyze how major crypto KOL ad and AMA activity correlates with KRW listings.",
      "Map each KOL's advertising behavior and project selection preferences."
    ],
    stack: ["crypto", "KOL", "listing research"],
    status: "live",
    proofLevel: "internal-only",
    story: {
      problem: "Crypto KOL activity is visible, but its listing impact and project-selection bias are hard to inspect.",
      audience: "Researchers who watch Korean exchange listings, KOL campaigns, and project attention cycles.",
      decision: "Turn scattered ads and AMA behavior into a repeatable listing-research surface.",
      system: "KOL activity mapping, campaign tendency reads, and KRW listing-oriented analysis.",
      outcome: "A live research artifact that connects content behavior to market interpretation.",
      next: "Add public sample cases and a source/caveat panel for correlation claims."
    },
    caseRoom: {
      verdict: "Useful but gated.",
      judgeNote: "The idea is strong, but the public portfolio should explicitly mark the password gate and show redacted sample logic before claiming strong proof.",
      checkpoints: [
        { label: "Visible proof", value: "Gated live URL" },
        { label: "Risk", value: "Correlation claims" },
        { label: "Next asset", value: "Redacted sample case" }
      ]
    },
    evidence: [
      { label: "Gated live surface", type: "live", href: "https://kollisting.vercel.app/", caveat: "The public URL currently opens behind a password gate." },
      { label: "Correlation caveat", type: "caveat", caveat: "Listing influence should be framed as research signal, not causal proof." }
    ],
    artifacts: [
      { label: "Open live tool", kind: "site", href: "https://kollisting.vercel.app/" }
    ]
  },
  {
    slug: "tg-finance-search-portal",
    client: "TG Finance Search Portal",
    category: "In progress",
    media: {
      src: "/media/projects/tg-finance-search-portal.png",
      alt: "TG Finance Search Portal project visual.",
      cue: "Search portal"
    },
    title: "Telegram finance content portal.",
    oneLiner: "A portal for searching, organizing, and revisiting finance-sector content from Telegram.",
    context: "Currently in progress, with the goal of turning scattered Telegram finance posts into a searchable research surface.",
    strategy: ["Build a search portal for finance-sector Telegram content."],
    stack: ["telegram", "finance", "portal", "in progress"],
    status: "in-progress",
    proofLevel: "concept",
    story: {
      problem: "Useful finance content in Telegram is difficult to retrieve, compare, and revisit after it disappears in chat flow.",
      audience: "Finance and Web3 readers who treat Telegram as a research source but need archival search.",
      decision: "Start with portal structure and retrieval logic before broad community features.",
      system: "Searchable content portal for sector-specific Telegram posts.",
      outcome: "A directional build that expands Nimdal's research-tool portfolio.",
      next: "Publish a working capture/search demo and define source-policy boundaries."
    },
    evidence: [
      { label: "Build status", type: "caveat", caveat: "In progress; keep expectations lower than live tools." }
    ],
    artifacts: [
      { label: "Concept visual", kind: "screenshot" }
    ]
  },
  {
    slug: "social-poster-one",
    client: "Social Poster-One",
    category: "Automation",
    media: {
      src: "/media/projects/social-poster-one.png",
      alt: "Social Poster-One project visual.",
      cue: "Automation"
    },
    title: "SNS posting automation pipeline.",
    oneLiner: "An API-driven posting automation tool for distributing Telegram content to LinkedIn, Threads, and X.",
    context: "Built to reduce repetitive cross-channel posting and manage content distribution as an API-based workflow.",
    strategy: ["Automate SNS posting from Telegram to LinkedIn, Threads, and X through APIs."],
    stack: ["telegram", "linkedin", "threads", "x", "automation"],
    status: "prototype",
    proofLevel: "prototype",
    story: {
      problem: "Cross-posting the same Telegram-origin content across social channels wastes time and creates formatting drift.",
      audience: "Operators who publish research or campaign updates across X, Threads, LinkedIn, and Telegram.",
      decision: "Treat distribution as an API pipeline rather than a manual publishing checklist.",
      system: "Telegram-to-social posting automation with channel-specific output handling.",
      outcome: "A useful automation concept that fits Nimdal's operator identity.",
      next: "Add one recorded workflow and specify API limitations by platform."
    },
    evidence: [
      { label: "Automation proof", type: "caveat", caveat: "Prototype proof; add workflow capture before presenting as production automation." }
    ],
    artifacts: [
      { label: "Workflow visual", kind: "screenshot" }
    ]
  },
  {
    slug: "mylol",
    client: "myLoL",
    category: "Game",
    href: "https://cafe.naver.com/xavishowtime",
    media: {
      src: "/media/projects/mylol.png",
      alt: "myLoL project visual.",
      cue: "Simulation game"
    },
    title: "LCK team management simulation.",
    oneLiner: "A Football Manager-style LCK team management simulation game using real player data.",
    context: "Built for PC and Android as a sports management experience grounded in real LCK player data.",
    strategy: ["Use real LCK player data to power a Football Manager-style team management simulation for PC and Android."],
    stack: ["game", "LCK", "simulation", "PC", "Android"],
    status: "archived",
    proofLevel: "live-link",
    story: {
      problem: "LCK fandom has rich player data, but few fan-made management simulations turn that data into playable decision loops.",
      audience: "LCK fans who enjoy roster-building, scouting, and FM-style management games.",
      decision: "Use real player data as the simulation backbone instead of fictional teams.",
      system: "PC/Android team-management loop with data-driven player comparison.",
      outcome: "An archived but credible proof of Nimdal's game-system design interest.",
      next: "Add screenshots, playable clips, and a short postmortem for stronger public review."
    },
    evidence: [
      { label: "Reference community", type: "live", href: "https://cafe.naver.com/xavishowtime" },
      { label: "Archive caveat", type: "caveat", caveat: "Archived/reference surface; add direct media assets for award-level proof." }
    ],
    artifacts: [
      { label: "Reference page", kind: "site", href: "https://cafe.naver.com/xavishowtime" }
    ]
  },
  {
    slug: "maple-union",
    client: "maple uNion",
    category: "Game jam",
    media: {
      src: "/media/projects/maple-union.png",
      alt: "maple uNion project visual.",
      cue: "Game jam"
    },
    title: "MapleStoryUniverse AFK game.",
    oneLiner: "An AFK game built with MapleStory resources and submitted to MapleStoryUniverse VibeCamp.",
    context: "Created a compact AFK game loop with MapleStoryUniverse resources inside a short production window.",
    strategy: ["Use MapleStoryUniverse VibeCamp resources to build a lightweight AFK game loop."],
    stack: ["MapleStoryUniverse", "VibeCamp", "AFK game"],
    status: "prototype",
    proofLevel: "screenshot",
    story: {
      problem: "A small game-jam build needs to show a complete loop quickly: enter, fight, collect, progress, and understand the system.",
      audience: "MapleStoryUniverse players, game-jam reviewers, and readers interested in game-system prototyping.",
      decision: "Make the build log and screenshots part of the product proof, not an afterthought.",
      system: "AFK loop, field visuals, character entry, probability guide, and post-build documentation.",
      outcome: "The strongest current bridge between Nimdal's playful identity and public build proof.",
      next: "Connect the project room directly to the build-log article and add before/after media."
    },
    caseRoom: {
      verdict: "Strongest story-to-proof bridge.",
      judgeNote: "The case room works because screenshots, system notes, and the build log support each other. This is the model the other projects should move toward.",
      checkpoints: [
        { label: "Visible proof", value: "Multiple gameplay captures" },
        { label: "Narrative strength", value: "Build log connected" },
        { label: "Next asset", value: "Playable demo or short clip" }
      ]
    },
    proofMedia: [
      {
        label: "Field loop",
        kind: "capture",
        src: "/media/projects/proof/maple-union-field-proof.png",
        alt: "maple uNion field loop screenshot with combat UI and bottom HUD.",
        caption: "The field capture shows the AFK loop, skill feedback, guide layer, and HUD in one frame."
      },
      {
        label: "Stage sheet",
        kind: "workflow",
        src: "/media/projects/proof/maple-union-stage-proof.png",
        alt: "maple uNion stage contact sheet showing multiple map and monster environments.",
        caption: "The stage sheet proves the project is not a single mock screen; it has repeated environment logic."
      },
      {
        label: "Map QA",
        kind: "log",
        src: "/media/projects/proof/maple-union-qa-proof.png",
        alt: "maple uNion map render QA sheet.",
        caption: "The QA sheet makes the craft visible: original map assets had to be adapted to a playable auto-hunting loop."
      }
    ],
    evidence: [
      { label: "Build log", type: "article", href: "https://blog.nimdal.xyz/posts/maple-union-dev-log-2026-07-02/#case-room-proof" },
      { label: "Screenshots", type: "screenshot", caveat: "Blog post contains current screenshot proof; add playable demo if available." }
    ],
    artifacts: [
      { label: "Read build log", kind: "blog", href: "https://blog.nimdal.xyz/posts/maple-union-dev-log-2026-07-02/#case-room-proof" }
    ],
    relatedPosts: [
      { title: "maple uNion build log", href: "https://blog.nimdal.xyz/posts/maple-union-dev-log-2026-07-02/#case-room-proof" }
    ]
  },
  {
    slug: "discord-bulk-leave",
    client: "Discord Bulk Leave Tool",
    category: "Utility",
    media: {
      src: "/media/projects/discord-bulk-leave.png",
      alt: "Discord Bulk Leave Tool project visual.",
      cue: "Utility"
    },
    title: "Discord server bulk leave tool.",
    oneLiner: "A utility for selecting multiple Discord servers and leaving them in bulk through the official API.",
    context: "Built as a personal productivity tool to reduce the repetitive work of reviewing and leaving servers one by one.",
    strategy: [
      "Use the official Discord API to select and leave multiple servers in a single managed flow."
    ],
    stack: ["discord", "official API", "utility", "automation"],
    status: "prototype",
    proofLevel: "prototype",
    story: {
      problem: "Leaving or organizing many Discord servers one by one is repetitive and hard to manage.",
      audience: "Discord users who need a controlled cleanup utility rather than manual server-by-server work.",
      decision: "Use the official API boundary and make bulk selection the core interaction.",
      system: "Selectable server list, confirmation flow, and batch leave operation.",
      outcome: "A compact utility example that supports the automation side of Nimdal's portfolio.",
      next: "Add a safety explanation, permissions caveat, and demo capture."
    },
    evidence: [
      { label: "Safety caveat", type: "caveat", caveat: "Prototype utility; public demo should clearly explain official API and permission boundaries." }
    ],
    artifacts: [
      { label: "Utility visual", kind: "screenshot" }
    ]
  }
];

const en = {
  profile: {
    name: "Nimdal",
    role: "Personal portfolio / Builder & strategist",
    location: "Seoul / Remote",
    email: sharedContact.email,
    headline: "Nimdal portfolio and project archive.",
    headlineParts: ["Nimdal", "portfolio and", "project archive."],
    subheadline:
      "A personal portfolio for Nimdal's identity, research tools, automation systems, and game-like experiments.",
    availability:
      "Currently building research tools, automation systems, and playful product experiments from Seoul.",
    primaryCta: "View work",
    secondaryCta: "Contact"
  },
  ui: {
    languageLabel: "Language",
    availabilityLabel: "Status",
    proofCue: "Open work",
    signalScanLabel: "Profile guide",
    signalWords: ["Builder", "Research", "Automation", "Games", "Contact"],
    caseStudyCta: "Open project",
    offerScopeLabel: "Project areas",
    quoteOpen: "\"",
    quoteClose: "\"",
    emailAria: "Email Nimdal",
    scheduleAria: "Book a conversation",
    footerProduct: "Nimdal Portfolio"
  },
  nav: [
    { label: "Proof", href: "#proof" },
    { label: "Projects", href: "#work" },
    { label: "System", href: "#system" },
    { label: "Contact", href: "#contact" }
  ],
  sections: {
    proof: {
      eyebrow: "Overview",
      heading: "A portfolio for identity, projects, and contact.",
      note: "Identity, projects, and contact points are arranged as a focused personal homepage."
    },
    work: {
      eyebrow: "Projects",
      heading: "Personal projects and experiments."
    },
    system: {
      eyebrow: "Nimdal",
      heading: "A personal homepage for work, identity, and context.",
      marquee: "Profile / Projects / Identity / Contact"
    },
    offer: {
      eyebrow: "What I build",
      heading: "Small systems with sharp edges and real utility.",
      body:
        "Most of my work lives at the edge of research, automation, Web3 market structure, and playable interfaces. The common thread is simple: turn messy information into something usable.",
      cta: "Start a project"
    },
    testimonials: {
      eyebrow: "Field notes",
      heading: "A few rules behind the interface."
    },
    contact: {
      eyebrow: "Contact",
      heading: "Contact Nimdal.",
      body:
        "Send the product, market, bottleneck, and what you want to build. I will reply when the context is clear.",
      primaryCta: "Email Nimdal",
      secondaryCta: "Book call"
    }
  },
  proofMetrics: [
    {
      label: "Identity sources",
      value: 2,
      detail: "Real operator portrait plus the pixel-octopus NFT identity."
    },
    {
      label: "Project artifacts",
      value: 8,
      detail: "A curated work archive spanning research tools, automation, and games."
    },
    {
      label: "Live links",
      value: 3,
      detail: "Public URLs and reference surfaces attached to selected projects."
    },
    {
      label: "Motion layers",
      value: 5,
      detail: "Scroll, cursor, sonar, media scan, and background current interactions."
    }
  ],
  caseStudies: workCaseStudies,
  operatingSystem: [
    {
      step: "01",
      title: "Decode the surface",
      body:
        "Start with the visible operator: what I build, what I study, and what kind of problems keep pulling me back."
    },
    {
      step: "02",
      title: "Wake the avatar",
      body:
        "Bring the pixel-octopus identity into the interface as a guide, signal marker, and recurring visual language."
    },
    {
      step: "03",
      title: "Map the current",
      body:
        "Treat every project as a current: a moving path through markets, communities, automation, and game systems."
    },
    {
      step: "04",
      title: "Ship the artifact",
      body:
        "Give each project a clear signal: what it does, why it exists, and what kind of world it belongs to."
    }
  ],
  offers: [
    "Web3 and crypto research tools",
    "Market signal dashboards",
    "Telegram and social automation pipelines",
    "Interactive personal sites and portfolio systems",
    "Game-like product experiments",
    "Sharp product strategy for noisy markets"
  ],
  testimonials: [
    {
      quote:
        "An identity system is stronger when it becomes behavior, not decoration.",
      name: "Rule 01",
      title: "Motion should explain the world, not distract from it."
    },
    {
      quote:
        "The best interface for complex work is one that makes the signal feel discoverable.",
      name: "Rule 02",
      title: "Interaction should make the archive feel alive."
    }
  ],
  contact: sharedContact
} satisfies PortfolioContent;

const ko = en;
const zh = en;
const ja = en;

export const portfolioDataByLocale = {
  en,
  ko,
  zh,
  ja
} satisfies Record<Locale, PortfolioContent>;

export const defaultLocale: Locale = "en";

export const portfolioData = portfolioDataByLocale[defaultLocale];

