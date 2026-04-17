export type ThemeMode = "light" | "dark" | "system";

export type ProfileLink = {
  id: string;
  label: string;
  href: string;
  displayText: string;
  external: boolean;
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
  links: ProfileLink[];
};

export const profileContent: ProfileContent = {
  nameEn: "Nimdal",
  nameKo: "탁찬우",
  role: "Growth Marketer / GTM / Community Builder",
  location: "Seoul, Korea",
  terminalTitle: "nimdal@portfolio: ~",
  statusFile: "/etc/nimdal",
  introCommand: "cat /etc/nimdal",
  linksCommand: "ls ~/links",
  avatarFallback: "NM",
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
      displayText: "chanwoo-tak-132b281a4",
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
  ]
};
