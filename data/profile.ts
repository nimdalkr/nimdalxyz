export type ThemeMode = "light" | "dark" | "system";

export type ProfileLink = {
  id: string;
  label: string;
  href: string;
  displayText: string;
  external: boolean;
};

export type ProjectEntry = {
  name: string;
  type: string;
  modified: string;
  description: string;
  href?: string;
};

export type ResumeSection = {
  title: string;
  lines: string[];
};

export type ProfileContent = {
  nameEn: string;
  nameKo: string;
  role: string;
  location: string;
  terminalTitle: string;
  statusFile: string;
  introCommand: string;
  linksCommand: string;
  avatarFallback: string;
  avatarSrc?: string;
  links: ProfileLink[];
  projects: ProjectEntry[];
  aboutParagraphs: string[];
  resumeSections: ResumeSection[];
};

export const profileContent: ProfileContent = {
  nameEn: "Nimdal",
  nameKo: "\uD0C1\uCC2C\uC6B0",
  role: "growth_marketer",
  location: "Seoul, Korea",
  terminalTitle: "nimdal@portfolio: ~",
  statusFile: "/etc/nimdal",
  introCommand: "cat /etc/nimdal",
  linksCommand: "ls ~/links",
  avatarFallback: "NM",
  avatarSrc: "/profile.jpg",
  links: [
    {
      id: "portfolio",
      label: "portfolio",
      href: "https://portfolio.nimdal.xyz/",
      displayText: "portfolio.nimdal.xyz",
      external: true
    },
    {
      id: "blog",
      label: "blog",
      href: "https://blog.nimdal.xyz",
      displayText: "blog.nimdal.xyz",
      external: true
    },
    {
      id: "linkedin",
      label: "linkedin",
      href: "https://www.linkedin.com/in/chanwoo-tak-132b281a4/",
      displayText: "chanwoo-tak",
      external: true
    },
    {
      id: "x",
      label: "x",
      href: "https://x.com/0xnimdal",
      displayText: "@0xnimdal",
      external: true
    },
    {
      id: "telegram",
      label: "telegram",
      href: "https://t.me/nimdal",
      displayText: "@nimdal",
      external: true
    },
    {
      id: "channel",
      label: "channel",
      href: "https://t.me/alpha_duo",
      displayText: "@alpha_duo",
      external: true
    },
    {
      id: "github",
      label: "github",
      href: "https://github.com/nimdalkr",
      displayText: "nimdalkr",
      external: true
    },
    {
      id: "email",
      label: "email",
      href: "mailto:0xnimdal@gmail.com",
      displayText: "0xnimdal@gmail.com",
      external: false
    }
  ],
  projects: [
    {
      name: "nimdalcraft",
      type: "web2",
      modified: "2026-03",
      description: "AI product system for turning vague ideas into buildable SaaS starter packages.",
      href: "https://github.com/nimdalkr/nimdalcraft"
    },
    {
      name: "myLoL",
      type: "web2",
      modified: "2026-03",
      description: "LCK simulation game and AI-assisted solo build workflow pushed to a public release.",
      href: "https://play.google.com/store/apps/details?id=com.nimdal.mylol"
    },
    {
      name: "daltacks",
      type: "web3",
      modified: "2026-02",
      description: "Stacks monorepo connecting contracts, frontend, API, and deployment in one flow.",
      href: "https://daltacks.vercel.app/"
    },
    {
      name: "ethosalpha",
      type: "web3",
      modified: "2026-02",
      description: "Tier-aware analytics dashboard combining Ethos data, social signals, and validation metrics.",
      href: "https://github.com/nimdalkr/ethoskaito"
    },
    {
      name: "nomorenaver",
      type: "web2",
      modified: "2026-04",
      description: "A keyword analysis platform for Naver targeting marketers focused on the Korean market.",
      href: "https://nomorenaver.vercel.app/"
    }
  ],
  aboutParagraphs: [
    "# about",
    "",
    "i started in web2 marketing.",
    "not ads — systems.",
    "",
    "campaigns, influencer networks, distribution loops.",
    "learned one thing early:",
    "",
    "attention without structure = waste",
    "",
    "now i'm operating in web3.",
    "",
    "same fundamentals, different rails:",
    "- tokens instead of points",
    "- communities instead of audiences",
    "- liquidity instead of impressions",
    "",
    "currently focused on:",
    "- GTM strategy for early-stage products",
    "- AI-driven workflow automation",
    "- building tools that reduce manual ops to zero",
    "",
    "i care about:",
    "execution speed",
    "clear signal over noise",
    "systems that scale without people",
    "",
    "if you're building something real,",
    "we'll probably get along."
  ],
  resumeSections: [
    {
      title: "EXPERIENCE",
      lines: [
        "2025 -- PRESENT // GTM and community execution around on-chain data, product signals, and participation growth.",
        "2024 -- PRESENT // Personal branding on X and Telegram while operating Web3 communities in parallel.",
        "2018 -- 2024 // Ran a company closer to growth-structure design than ad agency work."
      ]
    },
    {
      title: "WORK STYLE",
      lines: [
        "Read friction before scaling spend.",
        "Treat community as both distribution and early-warning system.",
        "Move from strategy into MVP structure when execution needs it."
      ]
    },
    {
      title: "STACK",
      lines: [
        "Growth / GTM / Localization / KOL / Community Ops",
        "Next.js / TypeScript / Node.js / PostgreSQL",
        "Codex / Claude Code / Cursor / Gemini / GA4 / Notion"
      ]
    }
  ]
};
