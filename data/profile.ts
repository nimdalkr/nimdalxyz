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
  nameEn: "Jinsoo Heo",
  nameKo: "허진수",
  role: "DevOps Engineer",
  location: "Seoul, Korea",
  terminalTitle: "jinsoo@koriel: ~",
  statusFile: "/etc/notd",
  introCommand: "cat /etc/notd",
  linksCommand: "ls ~/links",
  avatarFallback: "JH",
  links: [
    {
      id: "blog",
      label: "blog",
      href: "https://blog.koriel.kr",
      displayText: "blog.koriel.kr",
      external: true
    },
    {
      id: "github",
      label: "github",
      href: "https://github.com/devkoriel",
      displayText: "devkoriel",
      external: true
    },
    {
      id: "linkedin",
      label: "linkedin",
      href: "https://www.linkedin.com/in/devkoriel/",
      displayText: "in/devkoriel",
      external: true
    },
    {
      id: "x",
      label: "x",
      href: "https://x.com/devkoriel",
      displayText: "@devkoriel",
      external: true
    },
    {
      id: "telegram",
      label: "telegram",
      href: "https://t.me/devkoriel",
      displayText: "@devkoriel",
      external: true
    },
    {
      id: "channel",
      label: "channel",
      href: "https://t.me/whoskoriel",
      displayText: "@whoskoriel",
      external: true
    },
    {
      id: "email",
      label: "email",
      href: "mailto:dev.koriel@gmail.com",
      displayText: "dev.koriel@gmail.com",
      external: false
    }
  ]
};
