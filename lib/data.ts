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
  { locale: "en", shortLabel: "EN", label: "English", htmlLang: "en" },
  { locale: "ko", shortLabel: "KR", label: "한국어", htmlLang: "ko" },
  { locale: "zh", shortLabel: "中文", label: "简体中文", htmlLang: "zh-CN" },
  { locale: "ja", shortLabel: "日本語", label: "日本語", htmlLang: "ja" }
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
    oneLiner: "Ethos 데이터와 소셜 지표를 함께 보며 Web3 프로젝트의 신뢰와 반응을 읽는 분석 대시보드.",
    context: "기존 Work 탭에서 유지하는 프로젝트입니다. Web3 소셜 데이터와 평판 시그널을 한 화면에서 판단할 수 있도록 정리했습니다.",
    strategy: [
      "Ethos 데이터와 소셜 지표를 함께 보는 Web3 분석 대시보드.",
      "프로젝트별 신뢰도와 반응을 빠르게 비교할 수 있는 화면 구성.",
      "시장/커뮤니티 반응을 다음 액션으로 연결하기 위한 리서치 도구."
    ],
    stack: ["web3", "analytics", "social signal"]
  },
  {
    slug: "hyperalphaduo",
    client: "HyperAlphaDuo",
    category: "Trading research",
    href: "https://hyperalphaduo.vercel.app/",
    title: "Hyperliquid market position search.",
    oneLiner: "하이퍼리퀴드 토큰과 토큰화주식, 국내 거래소 아비트라지 시그널을 함께 보는 리서치 툴.",
    context: "온체인/거래소 시장에서 흩어진 가격, 상장, 입출금 정보를 빠르게 비교하기 위해 만든 분석 도구입니다.",
    strategy: [
      "하이퍼리퀴드 토큰(코인/주식) 필터별 포지션 검색.",
      "토큰화주식(HIP-3) <-> 실물주식 아비트라지 분석.",
      "업비트 / 빗썸 상장 토큰 아비트라지 및 입출금 가능 여부 모니터링."
    ],
    stack: ["hyperliquid", "arbitrage", "monitoring"]
  },
  {
    slug: "kol-listing",
    client: "KOL Listing",
    category: "Crypto research",
    href: "https://kollisting.vercel.app/",
    title: "KOL activity to KRW listing research.",
    oneLiner: "주요 Crypto KOL의 광고, AMA, 프로젝트 선택 성향이 원화상장에 미치는 영향을 분석하는 리서치 툴.",
    context: "KOL 활동이 단순 노출이 아니라 상장 기대감과 시장 반응에 어떤 영향을 주는지 구조적으로 보기 위해 만들었습니다.",
    strategy: [
      "주요 Crypto KOL들의 광고 및 AMA 활동들이 원화상장에 얼마나 영향을 미치는지 분석.",
      "주요 Crypto KOL들의 광고 성향 및 프로젝트 선택 성향 분석."
    ],
    stack: ["crypto", "KOL", "listing research"]
  },
  {
    slug: "tg-finance-search-portal",
    client: "TG Finance Search portal (제작중)",
    category: "In progress",
    title: "Telegram finance content portal.",
    oneLiner: "텔레그램 금융 섹터 콘텐츠를 탐색하고 정리하기 위한 포털사이트.",
    context: "제작중인 프로젝트입니다. 흩어진 금융 콘텐츠를 더 빠르게 검색하고 재방문할 수 있는 구조로 정리하고 있습니다.",
    strategy: ["텔레그램 금융 섹터 콘텐츠들의 포털사이트."],
    stack: ["telegram", "finance", "portal", "제작중"]
  },
  {
    slug: "social-poster-one",
    client: "Social Poster-One",
    category: "Automation",
    title: "SNS posting automation pipeline.",
    oneLiner: "Telegram 콘텐츠를 LinkedIn, Threads, X로 자동 배포하기 위한 SNS 포스팅 자동화 도구.",
    context: "반복적인 채널별 포스팅을 줄이고, 콘텐츠 배포를 API 기반 워크플로로 관리하기 위해 만들었습니다.",
    strategy: ["API를 활용한 SNS 포스팅 자동화 (TG -> 링크드인/스레드/X)."],
    stack: ["telegram", "linkedin", "threads", "x", "automation"]
  },
  {
    slug: "mylol",
    client: "myLoL",
    category: "Game",
    href: "https://cafe.naver.com/xavishowtime",
    title: "LCK team management simulation.",
    oneLiner: "LCK 선수들의 실제 데이터를 활용한 FM 스타일의 팀 경영 시뮬레이션 게임.",
    context: "PC와 안드로이드에서 플레이할 수 있는 스포츠 매니지먼트형 게임으로, 실제 선수 데이터를 기반으로 팀 운영 경험을 만들었습니다.",
    strategy: ["LCK 선수들의 실제 데이터들을 활용한 FM스타일의 팀 경영 시뮬레이션 게임 (PC/안드로이드)."],
    stack: ["game", "LCK", "simulation", "PC", "Android"]
  },
  {
    slug: "maple-union",
    client: "maple uNion",
    category: "Game jam",
    title: "MapleStoryUniverse AFK game.",
    oneLiner: "MapleStoryUniverse VibeCamp에 출품한 MapleStory 리소스 기반 AFK 게임.",
    context: "MapleStoryUniverse 리소스를 활용해 짧은 제작 기간 안에 출품 가능한 AFK 게임 루프를 구성했습니다.",
    strategy: ["MapleStoryUniverse의 VibeCamp에 출품한 MapleStory Resources 를 활용한 AFK 게임."],
    stack: ["MapleStoryUniverse", "VibeCamp", "AFK game"]
  },
  {
    slug: "discord-bulk-leave",
    client: "디스코드 서버 일괄 탈퇴 프로그램",
    category: "Utility",
    title: "Discord server bulk leave tool.",
    oneLiner: "관리하기 어려운 디스코드 서버들을 선택해 일괄 탈퇴할 수 있도록 만든 공식 API 기반 툴.",
    context: "서버 하나하나를 직접 확인하고 탈퇴하는 반복 작업을 줄이기 위해 만든 개인 생산성 유틸리티입니다.",
    strategy: [
      "디스코드 서버 하나하나 탈퇴 및 유지, 관리하기가 굉장히 어렵기때문에 일괄적으로 서버를 셀렉하여 탈퇴할 수 있도록 공식 API를 활용한 툴."
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

const ko = {
  profile: {
    name: "Nimdal",
    role: "그로스 마케터 / Web3 & Web2 전략가",
    location: "서울 / 원격",
    email: sharedContact.email,
    headline: "흩어진 관심을 복리로 쌓이는 수요로 바꿉니다.",
    headlineParts: ["흩어진 관심을", "복리로 쌓이는", "수요로 바꿉니다."],
    subheadline:
      "론칭, 커뮤니티, 퍼널, 성장 시스템에 필요한 것은 소음이 아니라 증거입니다. 이를 보여주는 시네마틱 마케팅 포트폴리오.",
    availability:
      "선별적인 성장 감사, 론칭 전략, Web3 GTM 시스템 프로젝트를 받고 있습니다.",
    primaryCta: "선택된 작업 보기",
    secondaryCta: "날카로운 감사 요청"
  },
  ui: {
    languageLabel: "언어",
    availabilityLabel: "가능한 협업",
    proofCue: "증거 기반 수요 시스템",
    signalScanLabel: "시그널 스캔",
    signalWords: ["포지셔닝", "론칭", "커뮤니티", "퍼널", "크리에이티브"],
    caseStudyCta: "이 방식의 작업 문의",
    offerScopeLabel: "운영 범위",
    quoteOpen: "\"",
    quoteClose: "\"",
    emailAria: "Nimdal에게 이메일 보내기",
    scheduleAria: "성장 감사 예약하기",
    footerProduct: "Signal Engine"
  },
  nav: [
    { label: "증거", href: "#proof" },
    { label: "작업", href: "#work" },
    { label: "시스템", href: "#system" },
    { label: "연락", href: "#contact" }
  ],
  sections: {
    proof: {
      eyebrow: "믿을 이유",
      heading: "애니메이션은 장식입니다. 믿을 이유는 여기 있습니다.",
      note: "placeholder 증거입니다. 공개 전 모든 지표를 검증된 원천 데이터로 교체하세요."
    },
    work: {
      eyebrow: "워크",
      heading: "직접 만들고 운영한 개인 프로젝트들."
    },
    system: {
      eyebrow: "마케팅 운영 시스템",
      heading: "예쁜 페이지는 수요를 만들지 못합니다. 시스템이 만듭니다.",
      marquee: "시장 이동 / Signal Engine / 수요 루프 / 증거 스택"
    },
    offer: {
      eyebrow: "좁고 선명한 제안",
      heading: "캠페인 연극은 줄이고, 시장의 움직임은 키웁니다.",
      body:
        "제안은 의도적으로 좁습니다. 시장을 진단하고, 약속을 날카롭게 만들고, 획득 시스템을 구축하고, 살아남아야 할 것을 측정합니다.",
      cta: "날카로운 감사 요청"
    },
    testimonials: {
      eyebrow: "placeholder 추천사",
      heading: "박수 대신 실제 증거로 교체하세요."
    },
    contact: {
      eyebrow: "연락",
      heading: "시그널을 만듭시다.",
      body:
        "제품, 시장, 현재 traction, 병목, 그리고 무엇을 성공으로 볼지 담아 brief를 보내주세요. 막연한 바이럴 요청은 막연한 결과를 만듭니다.",
      primaryCta: "Nimdal에게 이메일",
      secondaryCta: "감사 예약"
    }
  },
  proofMetrics: [
    { label: "기여 파이프라인", prefix: "$", value: 12.8, suffix: "M", detail: "placeholder: 검증된 CRM/기여 데이터를 넣으세요.", placeholder: true },
    { label: "론칭 ROAS", value: 4.7, suffix: "x", detail: "placeholder: 실제 광고 계정 데이터를 넣으세요.", placeholder: true },
    { label: "커뮤니티 성장", value: 180, suffix: "K", detail: "placeholder: 검증된 커뮤니티 성장 데이터를 넣으세요.", placeholder: true },
    { label: "CAC 절감", value: 31, suffix: "%", detail: "placeholder: 확인된 획득 비용 데이터를 넣으세요.", placeholder: true }
  ],
  caseStudies: workCaseStudies,
  operatingSystem: [
    { step: "01", title: "불공정한 진실 추출", body: "사용자를 인터뷰하고, sales call을 읽고, objection을 채굴해 시장이 구매 전에 믿어야 하는 단 하나의 믿음을 찾습니다." },
    { step: "02", title: "내러티브 형성", body: "제품의 raw capability를 position, promise, proof stack, 반복 가능한 campaign language로 바꿉니다." },
    { step: "03", title: "수요 루프 구축", body: "Paid, organic, community, lifecycle, referral mechanics를 연결해 각 채널이 다음 채널을 더 강하게 만듭니다." },
    { step: "04", title: "기계 계측", body: "Scale 전에 leading indicator, attribution sanity check, experiment cadence, decision rule을 정의합니다." }
  ],
  offers: [
    "론칭 내러티브와 GTM 아키텍처",
    "랜딩페이지 전략과 전환 critique",
    "Web3 커뮤니티 성장과 activation loop",
    "Paid creative testing system",
    "Lifecycle과 retention messaging",
    "Founder-led content engine"
  ],
  testimonials: [
    { quote: "론칭을 필연처럼 느끼게 만들면서도 spreadsheet를 놓치지 않는 드문 마케터.", name: "실제 클라이언트로 교체", title: "Founder, Web3 Infrastructure" },
    { quote: "포지셔닝 작업이 몇 달간의 내부 소음을 잘라냈습니다. 우리는 무엇을 말해야 하고 왜 중요한지 finally 알게 됐습니다.", name: "실제 클라이언트로 교체", title: "VP Growth, B2B SaaS" }
  ],
  contact: sharedContact
} satisfies PortfolioContent;

const zh = {
  profile: {
    name: "Nimdal",
    role: "增长营销人 / Web3 与 Web2 策略师",
    location: "首尔 / 远程",
    email: sharedContact.email,
    headline: "把分散的注意力转化为复利式需求。",
    headlineParts: ["把分散的注意力", "转化为", "复利式需求。"],
    subheadline:
      "这是一个电影感的营销作品集，服务于需要证据而不是噪音的发布、社区、漏斗与增长系统。",
    availability:
      "开放少量增长审计、发布策略与 Web3 go-to-market 系统合作。",
    primaryCta: "查看精选作品",
    secondaryCta: "申请犀利审计"
  },
  ui: {
    languageLabel: "语言",
    availabilityLabel: "可合作方向",
    proofCue: "由证据支撑的需求系统",
    signalScanLabel: "信号扫描",
    signalWords: ["定位", "发布", "社区", "漏斗", "创意"],
    caseStudyCta: "讨论这类项目",
    offerScopeLabel: "合作范围",
    quoteOpen: "“",
    quoteClose: "”",
    emailAria: "给 Nimdal 发邮件",
    scheduleAria: "预约增长审计",
    footerProduct: "Signal Engine"
  },
  nav: [
    { label: "证据", href: "#proof" },
    { label: "案例", href: "#work" },
    { label: "系统", href: "#system" },
    { label: "联系", href: "#contact" }
  ],
  sections: {
    proof: {
      eyebrow: "可信理由",
      heading: "动画只是装饰。真正要看的是这些可信理由。",
      note: "这里仍是占位证据。发布前请用已验证的数据替换所有指标。"
    },
    work: {
      eyebrow: "精选项目",
      heading: "我亲自构建、测试并运营的项目。"
    },
    system: {
      eyebrow: "营销操作系统",
      heading: "漂亮页面不会制造需求。系统才会。",
      marquee: "市场移动 / Signal Engine / 需求循环 / 证据栈"
    },
    offer: {
      eyebrow: "聚焦的服务",
      heading: "少一点 campaign theater，多一点市场移动。",
      body:
        "服务范围刻意收窄：诊断市场，打磨承诺，搭建获客系统，并衡量哪些东西值得保留下来。",
      cta: "申请犀利审计"
    },
    testimonials: {
      eyebrow: "占位推荐语",
      heading: "把掌声换成真实凭证。"
    },
    contact: {
      eyebrow: "联系",
      heading: "构建信号。",
      body:
        "请带上产品、市场、当前 traction、瓶颈，以及什么才算赢。模糊的 make-it-viral 请求，只会得到模糊的结果。",
      primaryCta: "给 Nimdal 发邮件",
      secondaryCta: "预约审计"
    }
  },
  proofMetrics: [
    { label: "归因 Pipeline", prefix: "$", value: 12.8, suffix: "M", detail: "占位：请替换为已验证的归因数据。", placeholder: true },
    { label: "发布 ROAS", value: 4.7, suffix: "x", detail: "占位：请替换为广告账户真实数据。", placeholder: true },
    { label: "社区增长", value: 180, suffix: "K", detail: "占位：请替换为已验证的社区增长数据。", placeholder: true },
    { label: "CAC 降低", value: 31, suffix: "%", detail: "占位：请替换为确认后的获客成本数据。", placeholder: true }
  ],
  caseStudies: workCaseStudies,
  operatingSystem: [
    { step: "01", title: "提取不公平真相", body: "访谈用户、阅读销售通话、挖掘 objections，找到市场在购买前必须相信的那个核心信念。" },
    { step: "02", title: "塑造叙事", body: "把原始产品能力转化为 position、promise、proof stack 与可重复使用的 campaign language。" },
    { step: "03", title: "建立需求循环", body: "连接 paid、organic、community、lifecycle 与 referral mechanics，让每个渠道增强下一个渠道。" },
    { step: "04", title: "给机器装仪表", body: "在 scale 之前定义 leading indicators、attribution sanity checks、experiment cadence 与 decision rules。" }
  ],
  offers: [
    "发布叙事与 GTM 架构",
    "Landing page 策略与转化 critique",
    "Web3 社区增长与 activation loops",
    "Paid creative testing system",
    "Lifecycle 与 retention messaging",
    "Founder-led content engine"
  ],
  testimonials: [
    { quote: "少见的营销人：能让发布看起来像必然发生，同时还认真看 spreadsheet。", name: "替换为真实客户", title: "Founder, Web3 Infrastructure" },
    { quote: "定位工作切开了几个月的内部噪音。我们终于知道该说什么，以及为什么重要。", name: "替换为真实客户", title: "VP Growth, B2B SaaS" }
  ],
  contact: sharedContact
} satisfies PortfolioContent;

const ja = {
  profile: {
    name: "Nimdal",
    role: "グロースマーケター / Web3・Web2 ストラテジスト",
    location: "ソウル / リモート",
    email: sharedContact.email,
    headline: "散らばった注目を、積み上がる需要へ変える。",
    headlineParts: ["散らばった注目を、", "積み上がる需要へ", "変える。"],
    subheadline:
      "ローンチ、コミュニティ、ファネル、成長システムに必要なのはノイズではなく証拠。そのためのシネマティックなマーケティングポートフォリオ。",
    availability:
      "厳選した成長監査、ローンチ戦略、Web3 go-to-market システムの相談を受け付けています。",
    primaryCta: "選定事例を見る",
    secondaryCta: "鋭い監査を依頼"
  },
  ui: {
    languageLabel: "言語",
    availabilityLabel: "対応可能",
    proofCue: "証拠に基づく需要システム",
    signalScanLabel: "シグナルスキャン",
    signalWords: ["ポジショニング", "ローンチ", "コミュニティ", "ファネル", "クリエイティブ"],
    caseStudyCta: "このタイプの仕事を相談",
    offerScopeLabel: "対応範囲",
    quoteOpen: "「",
    quoteClose: "」",
    emailAria: "Nimdal にメールする",
    scheduleAria: "成長監査を予約する",
    footerProduct: "Signal Engine"
  },
  nav: [
    { label: "証拠", href: "#proof" },
    { label: "事例", href: "#work" },
    { label: "システム", href: "#system" },
    { label: "連絡", href: "#contact" }
  ],
  sections: {
    proof: {
      eyebrow: "信頼する理由",
      heading: "アニメーションは装飾です。見るべきは信頼の理由です。",
      note: "ここは placeholder の証拠です。公開前にすべての指標を検証済みデータへ置き換えてください。"
    },
    work: {
      eyebrow: "選定プロジェクト",
      heading: "自分で作り、試し、運用してきたプロジェクト。"
    },
    system: {
      eyebrow: "マーケティングOS",
      heading: "美しいページは需要を作りません。システムが作ります。",
      marquee: "市場を動かす / Signal Engine / 需要ループ / 証拠スタック"
    },
    offer: {
      eyebrow: "絞り込んだオファー",
      heading: "キャンペーンごっこを減らし、市場の動きを増やす。",
      body:
        "オファーは意図的に狭くしています。市場を診断し、約束を研ぎ澄まし、獲得システムを構築し、生き残るべきものを測定します。",
      cta: "鋭い監査を依頼"
    },
    testimonials: {
      eyebrow: "placeholder 推薦文",
      heading: "称賛ではなく、本物の証拠へ置き換える。"
    },
    contact: {
      eyebrow: "連絡",
      heading: "シグナルを作る。",
      body:
        "製品、市場、現在の traction、ボトルネック、そして何を勝ちとするかを brief に入れて送ってください。曖昧な make-it-viral 依頼は、曖昧な結果を生みます。",
      primaryCta: "Nimdal にメール",
      secondaryCta: "監査を予約"
    }
  },
  proofMetrics: [
    { label: "帰属 Pipeline", prefix: "$", value: 12.8, suffix: "M", detail: "placeholder: 検証済み attribution data に置き換えてください。", placeholder: true },
    { label: "ローンチ ROAS", value: 4.7, suffix: "x", detail: "placeholder: 広告アカウントの実データに置き換えてください。", placeholder: true },
    { label: "コミュニティ成長", value: 180, suffix: "K", detail: "placeholder: 検証済み成長データに置き換えてください。", placeholder: true },
    { label: "CAC 削減", value: 31, suffix: "%", detail: "placeholder: 確認済み獲得コストデータに置き換えてください。", placeholder: true }
  ],
  caseStudies: workCaseStudies,
  operatingSystem: [
    { step: "01", title: "不公平な真実を抽出", body: "ユーザーに聞き、sales calls を読み、objections を掘り、購買前に市場が信じるべき一つの belief を見つけます。" },
    { step: "02", title: "ナラティブを形にする", body: "生の product capability を position、promise、proof stack、再利用できる campaign language に変換します。" },
    { step: "03", title: "需要ループを作る", body: "paid、organic、community、lifecycle、referral mechanics を接続し、各チャネルが次を強くする構造にします。" },
    { step: "04", title: "機械を計測する", body: "scale 前に leading indicators、attribution sanity checks、experiment cadence、decision rules を定義します。" }
  ],
  offers: [
    "ローンチナラティブと GTM architecture",
    "Landing page 戦略と conversion critique",
    "Web3 コミュニティ成長と activation loops",
    "Paid creative testing system",
    "Lifecycle と retention messaging",
    "Founder-led content engine"
  ],
  testimonials: [
    { quote: "ローンチを必然に見せながら、spreadsheet も大事にできる稀なマーケター。", name: "実際のクライアントに置き換え", title: "Founder, Web3 Infrastructure" },
    { quote: "ポジショニング作業が数か月分の内部ノイズを切り開きました。何を言うべきか、なぜ重要かがようやく分かりました。", name: "実際のクライアントに置き換え", title: "VP Growth, B2B SaaS" }
  ],
  contact: sharedContact
} satisfies PortfolioContent;

export const portfolioDataByLocale = {
  en,
  ko,
  zh,
  ja
} satisfies Record<Locale, PortfolioContent>;

export const defaultLocale: Locale = "en";

export const portfolioData = portfolioDataByLocale[defaultLocale];

