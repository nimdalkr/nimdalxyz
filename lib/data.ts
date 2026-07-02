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
  scheduleUrl: "https://cal.com/replace-with-real-booking-link/audit"
};

const workCaseStudies: readonly CaseStudy[] = [
  {
    slug: "ethosalpha",
    client: "ethosalpha",
    category: "Web3 analytics",
    href: "https://github.com/nimdalkr/ethoskaito",
    media: {
      src: "/media/projects/ethosalpha.png",
      alt: "ethosalpha project visual.",
      cue: "Web3 analytics"
    },
    title: "Ethos social signal dashboard.",
    oneLiner: "An analytics dashboard for reading Web3 trust, reputation, and social response signals in one place.",
    context: "Kept from the previous personal projects area and reframed as a focused research surface for Web3 social and reputation data.",
    strategy: [
      "Combine Ethos data with social metrics for faster Web3 project analysis.",
      "Make project trust and community response easier to compare at a glance.",
      "Turn market and community signals into clearer research decisions."
    ],
    stack: ["web3", "analytics", "social signal"]
  },
  {
    slug: "hyperalphaduo",
    client: "HyperAlphaDuo",
    category: "Trading research",
    href: "https://hyperalphaduo.vercel.app/",
    media: {
      src: "/media/projects/hyperalphaduo.png",
      alt: "HyperAlphaDuo project visual.",
      cue: "Trading research"
    },
    title: "Hyperliquid market position search.",
    oneLiner: "A research tool for Hyperliquid positions, tokenized equities, and arbitrage signals across Korean exchanges.",
    context: "Built to compare fragmented price, listing, deposit, and withdrawal data across on-chain and exchange markets.",
    strategy: [
      "Filter and search Hyperliquid token positions across coins and equities.",
      "Analyze arbitrage between HIP-3 tokenized equities and their underlying listed stocks.",
      "Monitor arbitrage, listings, and deposit/withdrawal availability for Upbit and Bithumb-listed tokens."
    ],
    stack: ["hyperliquid", "arbitrage", "monitoring"]
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
    stack: ["crypto", "KOL", "listing research"]
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
    stack: ["telegram", "finance", "portal", "in progress"]
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
    stack: ["telegram", "linkedin", "threads", "x", "automation"]
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
    stack: ["game", "LCK", "simulation", "PC", "Android"]
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
    stack: ["MapleStoryUniverse", "VibeCamp", "AFK game"]
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
    stack: ["discord", "official API", "utility", "automation"]
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

