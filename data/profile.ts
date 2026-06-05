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

export type BrandTileColor = "blue" | "yellow" | "cyan" | "orange" | "green" | "purple" | "pink" | "ink";

export type BrandVisualKind =
  | "framework"
  | "growth"
  | "web3"
  | "automation"
  | "community"
  | "work"
  | "resume"
  | "links";

export type BrandChapterId = BrandVisualKind;

export type BrandTile = {
  id: string;
  label: string;
  summary: string;
  color: BrandTileColor;
  chapterId: BrandChapterId;
  visualKind: BrandVisualKind;
};

export type BrandChapter = {
  id: BrandChapterId;
  label: string;
  eyebrow: string;
  title: string;
  body: string[];
  proofLabel: string;
  proof: string[];
};

export type ProfileContent = {
  nameEn: string;
  nameKo: string;
  role: string;
  location: string;
  avatarFallback: string;
  avatarSrc?: string;
  brandIntro: {
    quote: string;
    headline: string;
    thesisKo: string;
    thesisEn: string;
    status: string;
  };
  brandTiles: BrandTile[];
  brandChapters: BrandChapter[];
  links: ProfileLink[];
  projects: ProjectEntry[];
  resumeSections: ResumeSection[];
};

export const profileContent: ProfileContent = {
  nameEn: "Nimdal",
  nameKo: "탁찬우",
  role: "그로스 마케터 / GTM 오퍼레이터",
  location: "서울",
  avatarFallback: "NM",
  avatarSrc: "/profile.jpg",
  brandIntro: {
    quote: "반응은 구조가 있을 때 쌓입니다.",
    headline: "유입을 만들고 전환까지 이어지게 합니다.",
    thesisKo: "콘텐츠, 커뮤니티, 채널 운영을 묶어 실제 사용자가 들어오는 흐름을 만듭니다.",
    thesisEn: "Web2 마케팅에서 익힌 실행력을 Web3, AI 자동화, 초기 제품 GTM에 맞게 다시 쓰고 있습니다.",
    status: "빠르게 실험하고, 되는 흐름을 구조로 남기는 사람."
  },
  brandTiles: [
    {
      id: "tile-framework",
      label: "구조",
      summary: "크게 키우기 전에 먼저 흐름을 잡습니다.",
      color: "blue",
      chapterId: "framework",
      visualKind: "framework"
    },
    {
      id: "tile-growth",
      label: "성장",
      summary: "콘텐츠와 채널을 유입, 전환으로 연결합니다.",
      color: "yellow",
      chapterId: "growth",
      visualKind: "growth"
    },
    {
      id: "tile-web3",
      label: "웹3",
      summary: "커뮤니티, 인센티브, 신뢰가 함께 움직이게 만듭니다.",
      color: "cyan",
      chapterId: "web3",
      visualKind: "web3"
    },
    {
      id: "tile-automation",
      label: "자동화",
      summary: "반복 업무는 사람이 계속 붙잡지 않게 바꿉니다.",
      color: "orange",
      chapterId: "automation",
      visualKind: "automation"
    },
    {
      id: "tile-community",
      label: "커뮤니티",
      summary: "텔레그램, X, 크리에이터 채널을 운영 자산으로 다룹니다.",
      color: "green",
      chapterId: "community",
      visualKind: "community"
    },
    {
      id: "tile-work",
      label: "작업",
      summary: "직접 만든 제품과 운영 경험을 모았습니다.",
      color: "purple",
      chapterId: "work",
      visualKind: "work"
    },
    {
      id: "tile-resume",
      label: "이력",
      summary: "지금의 방식이 만들어진 경로입니다.",
      color: "pink",
      chapterId: "resume",
      visualKind: "resume"
    },
    {
      id: "tile-links",
      label: "연락",
      summary: "글, 코드, 소셜 채널, 연락처를 한곳에 모았습니다.",
      color: "ink",
      chapterId: "links",
      visualKind: "links"
    }
  ],
  brandChapters: [
    {
      id: "framework",
      label: "구조",
      eyebrow: "01 / 일하는 방식",
      title: "먼저 유입 경로를 보고, 그다음 제품과 운영을 맞춥니다.",
      body: [
        "좋은 아이디어도 사람들이 어디서 보고, 왜 눌러 보고, 언제 다시 돌아오는지가 없으면 오래 가지 못합니다.",
        "그래서 먼저 채널과 메시지, 전환 흐름을 확인합니다. 그리고 반복되는 운영은 최대한 단순하게 만들어 팀이 더 빨리 움직이게 합니다."
      ],
      proofLabel: "기준",
      proof: ["노출보다 실제 유입을 봅니다.", "빠른 실행보다 빠른 피드백 회수를 더 중요하게 봅니다.", "설명만 긴 구조보다 매일 굴러가는 구조를 선호합니다."]
    },
    {
      id: "growth",
      label: "성장",
      eyebrow: "02 / 유입과 전환",
      title: "캠페인은 한 번의 성과보다 다시 쓸 수 있는 흐름을 남겨야 합니다.",
      body: [
        "SEO, 인플루언서, 콘텐츠, 퍼포먼스 캠페인을 직접 운영하며 배운 것은 분명합니다. 많이 보이는 것보다 다시 들어오게 만드는 구조가 더 중요합니다.",
        "초기 제품에서는 특히 그렇습니다. 누구에게 먼저 보여줄지, 어떤 메시지가 반응을 만드는지, 첫 행동까지 어떻게 이어지게 할지 빠르게 확인해야 합니다."
      ],
      proofLabel: "경험",
      proof: ["SEO, 인플루언서, 퍼포먼스 캠페인 200건 이상 운영.", "3,000명 이상 규모의 인플루언서 네트워크 구축 및 운영.", "노출 수보다 전환과 재방문을 기준으로 판단."]
    },
    {
      id: "web3",
      label: "웹3",
      eyebrow: "03 / Web3 운영",
      title: "Web3에서도 결국 사람을 모으고, 움직이게 하고, 남게 해야 합니다.",
      body: [
        "Web3에서는 포인트, 토큰, 커뮤니티, 유동성 같은 요소가 함께 움직입니다. 말은 달라져도 핵심은 같습니다.",
        "사람들이 어디서 프로젝트를 알게 되는지, 왜 다시 돌아오는지, 어떤 행동을 하게 되는지, 팀이 그 반응을 어떻게 읽을지에 집중합니다."
      ],
      proofLabel: "다룬 영역",
      proof: ["온체인 제품의 GTM과 성장 실행.", "X, Telegram, 커뮤니티 채널 중심의 배포 운영.", "커뮤니티를 리텐션과 피드백 채널로 운영."]
    },
    {
      id: "automation",
      label: "자동화",
      eyebrow: "04 / 업무 흐름",
      title: "반복되는 일은 계속 사람이 붙잡고 있으면 안 됩니다.",
      body: [
        "AI 자동화는 있어 보이기 위한 장식이 아니라, 운영 시간을 줄이기 위한 도구여야 합니다.",
        "반복되는 리서치, 정리, 배포, 리포팅을 줄이면 팀은 더 많은 실험을 할 수 있습니다. 막연한 아이디어는 실행 가능한 기획으로, 흩어진 반응은 다음 판단으로 바꿉니다."
      ],
      proofLabel: "만드는 방향",
      proof: ["Nimdalcraft로 아이디어를 SaaS 실행안까지 정리하는 흐름 구축.", "수작업이 반복되는 지점을 먼저 찾고 자동화.", "복잡한 툴보다 바로 팀 속도를 올리는 도구를 선호."]
    },
    {
      id: "community",
      label: "커뮤니티",
      eyebrow: "05 / 관계와 재방문",
      title: "커뮤니티는 공지방이 아니라 제품이 계속 살아 있는 공간입니다.",
      body: [
        "커뮤니티는 공지사항을 올리는 곳에서 끝나면 힘이 약합니다. 사람들이 왜 남아 있는지, 어떤 말을 주고받는지, 다음 행동으로 어떻게 이어지는지가 중요합니다.",
        "콘텐츠, 운영, 피드백 확인이 함께 돌아가야 합니다. 반응을 만들고, 필요한 곳으로 보내고, 다음에 할 일을 분명하게 만드는 일을 합니다."
      ],
      proofLabel: "운영 채널",
      proof: ["X와 Telegram 중심의 배포 운영.", "콘텐츠를 기반으로 한 유입 흐름 설계.", "커뮤니티를 활성화와 재방문 채널로 활용."]
    },
    {
      id: "work",
      label: "작업",
      eyebrow: "06 / 만든 것들",
      title: "마케팅, 분석, 자동화, Web3를 직접 만들며 실험했습니다.",
      body: [
        "작업물은 일부러 넓게 가져갔습니다. 키워드 분석, 대시보드, 배포 흐름, AI 기반 기획 도구처럼 실제 운영에 닿아 있는 것들을 만들었습니다.",
        "중요하게 보는 것은 결과물의 크기보다 실행 속도, 문제를 제품으로 정리하는 방식, 그리고 배포와 제작을 함께 보는 관점입니다."
      ],
      proofLabel: "대표 작업",
      proof: ["nomorenaver", "daltacks", "ethosalpha", "nimdalcraft"]
    },
    {
      id: "resume",
      label: "이력",
      eyebrow: "07 / 경력 요약",
      title: "어떤 일을 해왔고, 어떤 방식으로 움직이는지 빠르게 볼 수 있게 정리했습니다.",
      body: [
        "채용 관점에서 필요한 정보만 남겼습니다. 운영 경험, 성장 채널, 제작 도구, 현재 집중하고 있는 Web3 업무를 한 번에 볼 수 있게 압축했습니다.",
        "길게 설명하기보다 어떤 환경에서 무엇을 맡아왔는지, 어떤 기준으로 일하는지 바로 읽히는 것을 목표로 했습니다."
      ],
      proofLabel: "볼 것",
      proof: ["경험", "일하는 방식", "마케팅 채널", "현재 집중하는 일"]
    },
    {
      id: "links",
      label: "연락",
      eyebrow: "08 / 연결",
      title: "필요한 맥락에 맞는 채널로 바로 연결할 수 있습니다.",
      body: [
        "글, 코드, 소셜 채널, 직접 연락 경로를 한 곳에 모았습니다.",
        "그로스, GTM, 커뮤니티, AI 업무 자동화와 관련해 이야기하고 싶다면 가장 편한 채널로 연락해 주세요."
      ],
      proofLabel: "연결 경로",
      proof: ["LinkedIn에서는 경력 맥락을 볼 수 있습니다.", "X와 Telegram에서는 최근 관심사와 활동을 볼 수 있습니다.", "GitHub에는 공개 작업물이 있습니다.", "메일은 직접 연락할 때 가장 좋습니다."]
    }
  ],
  links: [
    {
      id: "portfolio",
      label: "포트폴리오",
      href: "https://portfolio.nimdal.xyz/",
      displayText: "portfolio.nimdal.xyz",
      external: true
    },
    {
      id: "linkedin",
      label: "링크드인",
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
      label: "텔레그램",
      href: "https://t.me/nimdal",
      displayText: "@nimdal",
      external: true
    },
    {
      id: "channel",
      label: "채널",
      href: "https://t.me/alpha_duo",
      displayText: "@alpha_duo",
      external: true
    },
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com/nimdalkr",
      displayText: "nimdalkr",
      external: true
    },
    {
      id: "email",
      label: "이메일",
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
      description: "막연한 아이디어를 바로 시작 가능한 SaaS 기획안으로 정리하는 AI 제품 워크플로.",
      href: "https://github.com/nimdalkr/nimdalcraft"
    },
    {
      name: "myLoL",
      type: "web2",
      modified: "2026-03",
      description: "LCK 시뮬레이션 게임. AI를 활용해 혼자 기획, 개발, 출시 흐름까지 밀어붙인 프로젝트.",
      href: "https://play.google.com/store/apps/details?id=com.nimdal.mylol"
    },
    {
      name: "daltacks",
      type: "web3",
      modified: "2026-02",
      description: "컨트랙트, 프론트엔드, API, 배포 흐름을 하나로 묶은 Stacks 기반 Web3 프로젝트.",
      href: "https://daltacks.vercel.app/"
    },
    {
      name: "ethosalpha",
      type: "web3",
      modified: "2026-02",
      description: "Ethos 데이터와 소셜 지표를 함께 보는 Web3 분석 대시보드.",
      href: "https://github.com/nimdalkr/ethoskaito"
    },
    {
      name: "nomorenaver",
      type: "web2",
      modified: "2026-04",
      description: "국내 마케터를 위한 네이버 키워드 분석 플랫폼.",
      href: "https://nomorenaver.vercel.app/"
    }
  ],
  resumeSections: [
    {
      title: "경험",
      lines: [
        "2025 -- 현재",
        "온체인 제품의 GTM과 성장 실행 담당",
        "사용자 유입, 활성화, 참여 확대에 집중",
        "X, Telegram, 커뮤니티 채널 배포 운영",
        "",
        "2024 -- 현재",
        "X와 Telegram 기반 개인 배포 채널 운영",
        "Web3 생태계에서 콘텐츠 기반 유입 흐름 실험",
        "커뮤니티를 리텐션과 참여 채널로 운영",
        "",
        "2018 -- 2024",
        "MKR 창업 및 운영",
        "SEO, 인플루언서, 퍼포먼스 캠페인 200건 이상 진행",
        "3,000명 이상 규모의 인플루언서 네트워크 구축 및 운영",
        "트래픽 유입과 전환 구조 개선에 집중"
      ]
    },
    {
      title: "일하는 방식",
      lines: [
        "가정이 아니라 배포 경로에서 시작합니다.",
        "",
        "작게 테스트하고, 반응을 보고, 되는 흐름만 키웁니다.",
        "",
        "커뮤니티를 리텐션과 피드백 채널로 봅니다.",
        "",
        "노출보다 전환을 기준으로 판단합니다.",
        "",
        "실행 속도는 중요한 경쟁력입니다.",
        "",
        "사용자를 데려오지 못하면 우선순위를 낮춥니다."
      ]
    },
    {
      title: "마케팅",
      lines: [
        "[채널]",
        "X / Telegram / 네이버 / YouTube / 인플루언서 네트워크",
        "",
        "[유입]",
        "SEO / GEO / AEO / 콘텐츠 마케팅 / KOL",
        "",
        "[전환]",
        "퍼널 설계 / 리텐션 구조 / 커뮤니티 운영"
      ]
    },
    {
      title: "콘텐츠 / 제작",
      lines: [
        "Premiere Pro / After Effects / Photoshop",
        "",
        "숏폼 / 롱폼 / 교육형 콘텐츠 / 스레드형 콘텐츠"
      ]
    },
    {
      title: "도구",
      lines: ["GA4 / Notion / Discord / Telegram"]
    },
    {
      title: "현재 집중하는 일",
      lines: [
        "Web3 제품의 성장 구조:",
        "- 콘텐츠에서 유입까지 이어지는 흐름",
        "- 커뮤니티 기반 리텐션과 활성화",
        "- 반복 가능한 사용자 유입 구조"
      ]
    }
  ]
};
