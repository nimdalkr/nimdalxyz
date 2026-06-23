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
  email: "hello@nimdal.xyz",
  scheduleUrl: "https://cal.com/replace-with-real-booking-link/audit"
};

const workCaseStudies: readonly CaseStudy[] = [
  {
    slug: "ethosalpha",
    client: "ethosalpha",
    category: "Web3 analytics",
    href: "https://github.com/nimdalkr/ethoskaito",
    title: "Ethos social signal dashboard.",
    oneLiner: "An analytics dashboard for reading Web3 trust, reputation, and social response signals in one place.",
    context: "Kept from the previous Work tab and reframed as a focused research surface for Web3 social and reputation data.",
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
    role: "Growth Marketer / Web3 & Web2 Strategist",
    location: "Seoul / Remote",
    email: sharedContact.email,
    headline: "I turn scattered attention into compounding demand.",
    headlineParts: ["I turn", "scattered attention", "into", "compounding demand."],
    subheadline:
      "A cinematic marketing portfolio for launches, communities, funnels, and growth systems that need proof instead of noise.",
    availability:
      "Open for selective growth audits, launch strategy, and Web3 go-to-market systems.",
    primaryCta: "View selected work",
    secondaryCta: "Request sharp audit"
  },
  ui: {
    languageLabel: "Language",
    availabilityLabel: "Availability",
    proofCue: "Proof-backed demand systems",
    signalScanLabel: "Signal scan",
    signalWords: ["Positioning", "Launch", "Community", "Funnel", "Creative"],
    caseStudyCta: "Discuss this style of work",
    offerScopeLabel: "Operating scope",
    quoteOpen: "\"",
    quoteClose: "\"",
    emailAria: "Email Nimdal",
    scheduleAria: "Book a growth audit",
    footerProduct: "Signal Engine"
  },
  nav: [
    { label: "Proof", href: "#proof" },
    { label: "Work", href: "#work" },
    { label: "System", href: "#system" },
    { label: "Contact", href: "#contact" }
  ],
  sections: {
    proof: {
      eyebrow: "Reasons to believe",
      heading: "Animation is decoration. These are the reasons to believe.",
      note: "Placeholder proof. Replace every metric with verified source data before publishing."
    },
    work: {
      eyebrow: "Selected projects",
      heading: "Projects I built, tested, and operated."
    },
    system: {
      eyebrow: "Marketing operating system",
      heading: "Pretty pages do not build demand. Systems do.",
      marquee: "Market movement / Signal engine / Demand loops / Proof stack"
    },
    offer: {
      eyebrow: "Narrow offer",
      heading: "Less campaign theater. More market movement.",
      body:
        "The offer is intentionally narrow: diagnose the market, sharpen the promise, build the acquisition system, and measure what should survive.",
      cta: "Request sharp audit"
    },
    testimonials: {
      eyebrow: "Placeholder testimonials",
      heading: "Replace applause with real receipts."
    },
    contact: {
      eyebrow: "Contact",
      heading: "Build the signal.",
      body:
        "Send a brief with the product, market, current traction, bottleneck, and what will count as a win. Vague make-it-viral requests deserve vague results.",
      primaryCta: "Email Nimdal",
      secondaryCta: "Book audit"
    }
  },
  // IMPORTANT: These proof metrics are placeholders. Replace them with verified CRM,
  // analytics, ad account, or community data before publishing. Fake metrics destroy trust.
  proofMetrics: [
    {
      label: "Attributed pipeline",
      prefix: "$",
      value: 12.8,
      suffix: "M",
      detail: "Placeholder: replace with verified pipeline attribution.",
      placeholder: true
    },
    {
      label: "Launch ROAS",
      value: 4.7,
      suffix: "x",
      detail: "Placeholder: replace with source-of-truth ad data.",
      placeholder: true
    },
    {
      label: "Community growth",
      value: 180,
      suffix: "K",
      detail: "Placeholder: replace with verified audience growth.",
      placeholder: true
    },
    {
      label: "CAC reduction",
      value: 31,
      suffix: "%",
      detail: "Placeholder: replace with confirmed acquisition data.",
      placeholder: true
    }
  ],
  // IMPORTANT: Case-study metrics are demonstration placeholders. Replace each number
  // and supporting detail with verified project data before using this portfolio publicly.
  caseStudies: workCaseStudies,
  operatingSystem: [
    {
      step: "01",
      title: "Extract the unfair truth",
      body:
        "Interview users, read sales calls, mine objections, and find the one belief the market must adopt before it buys."
    },
    {
      step: "02",
      title: "Shape the narrative",
      body:
        "Turn raw product capability into a position, promise, proof stack, and repeatable campaign language."
    },
    {
      step: "03",
      title: "Build demand loops",
      body:
        "Connect paid, organic, community, lifecycle, and referral mechanics so each channel improves the next one."
    },
    {
      step: "04",
      title: "Instrument the machine",
      body:
        "Define leading indicators, attribution sanity checks, experiment cadence, and decision rules before scale."
    }
  ],
  offers: [
    "Launch narrative and GTM architecture",
    "Landing page strategy and conversion critique",
    "Web3 community growth and activation loops",
    "Paid creative testing system",
    "Lifecycle and retention messaging",
    "Founder-led content engine"
  ],
  // Replace these with real testimonials before launch. Names and titles are intentionally
  // obvious placeholders so social proof is not mistaken for verified client evidence.
  testimonials: [
    {
      quote:
        "The rare marketer who can make a launch feel inevitable while still caring about the spreadsheet.",
      name: "Replace with real client",
      title: "Founder, Web3 Infrastructure"
    },
    {
      quote:
        "The positioning work cut through months of internal noise. We finally knew what to say and why it mattered.",
      name: "Replace with real client",
      title: "VP Growth, B2B SaaS"
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

