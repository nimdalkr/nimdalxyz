export const locales = ["ko", "en"] as const;

export type Locale = (typeof locales)[number];
export type Localized<T> = Readonly<Record<Locale, T>>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export type ProjectMediaRole = "concept" | "proof" | "identity" | "career" | "document";

export type ProjectMedia = {
  role: ProjectMediaRole;
  src: string;
  alt: Localized<string>;
  source: Localized<string>;
  capturedAt: string;
  claim: Localized<string>;
  limitation: Localized<string>;
};

export type LabStatus = "live" | "prototype" | "in-progress" | "archived";
export type MetricProvenance = "repository-count" | "career-record" | "portfolio-claim";

export type ContentMetric = {
  value: string;
  provenance: MetricProvenance;
  copy: Localized<{
    label: string;
    context: string;
    source: string;
    limitation: string;
  }>;
};

export type ProjectDetailCopy = {
  problem: string;
  decision: string;
  system: string;
  proof: string;
  limitation: string;
  next: string;
};

export type ProjectCopy = {
  title: string;
  category: string;
  summary: string;
  tags: readonly string[];
  detail: ProjectDetailCopy;
};

export type Project = {
  slug: string;
  status: LabStatus;
  liveUrl?: string;
  repositoryUrl?: string;
  articleUrl?: string;
  referenceUrl?: string;
  media: readonly ProjectMedia[];
  copy: Localized<ProjectCopy>;
};

export type CareerCaseCopy = {
  title: string;
  context: string;
  channels: readonly string[];
  objective: string;
  role: string;
  result: string;
  constraint: string;
  system: string;
  proof: string;
  limitation: string;
};

export type CareerCase = {
  id: string;
  period: string;
  media: ProjectMedia;
  metrics: readonly ContentMetric[];
  copy: Localized<CareerCaseCopy>;
};

export type BlogPostCopy = {
  title: string;
  description: string;
  category: string;
  tags: readonly string[];
  readingTime: string;
};

export type BlogPost = {
  slug: string;
  publishedAt: string;
  updatedAt: string;
  cover: string;
  sourcePath: string;
  copy: Localized<BlogPostCopy>;
};

export type SiteMetricCopy = {
  value: string;
  label: string;
  context: string;
  source: string;
  limitation: string;
  provenance: MetricProvenance;
};

export type SiteLocaleContent = {
  seo: {
    title: string;
    description: string;
  };
  language: {
    label: string;
    current: string;
    switchTo: string;
  };
  nav: readonly {
    label: string;
    href: string;
  }[];
  home: {
    identity: {
      eyebrow: string;
      name: string;
      legalName: string;
      role: string;
      headline: string;
      description: string;
      location: string;
      availability: string;
      portraitAlt: string;
      avatarAlt: string;
      primaryCta: string;
      secondaryCta: string;
    };
    metrics: readonly SiteMetricCopy[];
    process: {
      eyebrow: string;
      title: string;
      description: string;
      steps: readonly {
        index: string;
        title: string;
        body: string;
        outcome: string;
      }[];
    };
    contact: {
      eyebrow: string;
      title: string;
      description: string;
      emailLabel: string;
      email: string;
      primaryCta: string;
    };
  };
  lab: {
    eyebrow: string;
    title: string;
    description: string;
    openProject: string;
    statusLabel: string;
    status: Record<LabStatus, string>;
    detailLabels: Record<keyof ProjectDetailCopy, string>;
  };
  career: {
    eyebrow: string;
    title: string;
    description: string;
    metricNotice: string;
    proofNotice: string;
    signals: readonly SiteMetricCopy[];
  };
  blog: {
    eyebrow: string;
    title: string;
    description: string;
    readMore: string;
  };
  footer: {
    tagline: string;
  };
};

const email = "0xnimdal@gmail.com";
const undated = "undated";

export const projectSlugs = [
  "alphaduo",
  "hyperalphaduo",
  "mylol",
  "maple-union",
  "ethosalpha",
  "kol-listing",
  "tg-finance-search-portal",
  "social-poster-one",
  "discord-bulk-leave"
] as const;

export const projects = [
  {
    slug: "alphaduo",
    status: "live",
    liveUrl: "https://alphaduo.pro",
    media: [
      {
        role: "proof",
        src: "/media/projects/alphaduo-proof.png",
        alt: {
          ko: "PnL, 지갑, Arc 브리지, SBT 접근 메뉴가 보이는 AlphaDuo NFT Wallet Profile 화면.",
          en: "AlphaDuo NFT Wallet Profile showing PnL, wallets, Bridge to Arc, and SBT Access navigation."
        },
        source: {
          ko: "alphaduo.pro 실서비스 캡처",
          en: "Live alphaduo.pro capture"
        },
        capturedAt: "2026-07-19",
        claim: {
          ko: "공개 AlphaDuo 화면에 NFT 지갑 프로필, 지갑 연결, Arc Testnet, 양도 불가 SBT 접근 흐름이 있다.",
          en: "The public AlphaDuo surface contains an NFT wallet profile, wallet connection, Arc Testnet, and non-transferable SBT access flow."
        },
        limitation: {
          ko: "연결되지 않은 지갑의 정적 캡처이며 지갑별 데이터 정확도나 브리지 완료를 증명하지 않는다.",
          en: "This is a static capture with no wallet connected; it does not prove wallet-data accuracy or a completed bridge transaction."
        }
      }
    ],
    copy: {
      ko: {
        title: "AlphaDuo",
        category: "NFT 지갑 인텔리전스",
        summary: "NFT 멤버십, 지갑 분석, Arc Testnet 브리지를 한 흐름으로 묶은 공개 웹3 제품.",
        tags: ["NFT", "지갑 분석", "Arc Testnet", "SBT"],
        detail: {
          problem: "NFT 활동, 지갑 모니터링, 멤버 접근, Arc 정산 흐름이 서로 다른 도구에 흩어져 있다.",
          decision: "양도 불가 SBT를 접근 기준으로 두고 지갑 분석은 읽기 전용으로 유지하며 확인할 수 없는 데이터는 만들지 않는다.",
          system: "NFT Wallet Profile 안에 PnL, 지갑 목록, Bridge to Arc, SBT Access를 연결한다.",
          proof: "alphaduo.pro 공개 URL과 2026-07-19 실서비스 캡처가 있으며 화면은 Arc Testnet과 양도 불가 SBT를 명시한다.",
          limitation: "테스트넷 베타다. 캡처에는 지갑이 연결되지 않았고 실제 가치 정산이나 분석 정확도를 검증하지 않는다.",
          next: "연결된 테스트 지갑의 대표 흐름에 데이터 출처, 거래 영수증, 복구 조건을 함께 공개한다."
        }
      },
      en: {
        title: "AlphaDuo",
        category: "NFT wallet intelligence",
        summary: "A public Web3 product connecting NFT membership, wallet analytics, and an Arc Testnet bridge in one flow.",
        tags: ["NFT", "Wallet analytics", "Arc Testnet", "SBT"],
        detail: {
          problem: "NFT activity, wallet monitoring, member access, and Arc settlement flows are fragmented across separate tools.",
          decision: "Use a non-transferable SBT as the access boundary, keep wallet analytics read-only, and avoid inventing unavailable data.",
          system: "The NFT Wallet Profile connects PnL, wallet lists, Bridge to Arc, and SBT Access.",
          proof: "A public alphaduo.pro URL and a production capture dated 2026-07-19 are available; the screen explicitly identifies Arc Testnet and a non-transferable SBT.",
          limitation: "This is a testnet beta. No wallet is connected in the capture, and it does not verify real-value settlement or analytical accuracy.",
          next: "Publish a representative connected-wallet flow with data sources, transaction receipts, and recovery conditions."
        }
      }
    }
  },
  {
    slug: "hyperalphaduo",
    status: "live",
    liveUrl: "https://hyperalphaduo.vercel.app/",
    media: [
      {
        role: "proof",
        src: "/media/projects/hyperalphaduo-proof.png",
        alt: {
          ko: "HyperAlphaDuo 실서비스 시장 조사 인터페이스 화면.",
          en: "HyperAlphaDuo live market-research interface."
        },
        source: {
          ko: "현재 저장소의 실서비스 캡처",
          en: "Production capture stored in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "검색과 필터를 갖춘 시장 조사 인터페이스가 공개 URL에 존재한다.",
          en: "A searchable and filterable market-research interface exists at a public URL."
        },
        limitation: {
          ko: "캡처만으로 데이터 정확도, 갱신 주기, 차익거래 가능성을 검증할 수 없다.",
          en: "The capture cannot verify data accuracy, refresh cadence, or whether an arbitrage is executable."
        }
      },
      {
        role: "concept",
        src: "/media/projects/hyperalphaduo.webp",
        alt: {
          ko: "HyperAlphaDuo 프로젝트 소개 비주얼.",
          en: "HyperAlphaDuo project introduction visual."
        },
        source: {
          ko: "현재 저장소의 프로젝트 이미지 자산",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "프로젝트의 시장 조사 주제를 소개한다.",
          en: "It introduces the project's market-research theme."
        },
        limitation: {
          ko: "장식용 소개 이미지이며 제품 동작의 증거는 아니다.",
          en: "It is a presentation image, not proof of product behavior."
        }
      }
    ],
    copy: {
      ko: {
        title: "HyperAlphaDuo",
        category: "트레이딩 리서치",
        summary: "Hyperliquid 포지션, 토큰화 주식, 국내 거래소 차익 신호를 비교하는 공개 리서치 도구.",
        tags: ["Hyperliquid", "차익거래", "거래소", "모니터링"],
        detail: {
          problem: "토큰화 주식 가격, 국내 거래소 상장, 입출금 상태는 서로 다른 시장과 화면에 흩어져 있다.",
          decision: "범용 시세판 대신 Hyperliquid와 국내 거래소를 비교하는 리서치 콘솔로 범위를 좁혔다.",
          system: "포지션 검색·필터, HIP-3 토큰화 주식 비교, 업비트·빗썸 상장 및 입출금 모니터링으로 구성했다.",
          proof: "공개 Vercel URL과 저장소의 실서비스 화면 캡처가 있다.",
          limitation: "저장소에는 데이터 출처 설명, 갱신 주기, 주석이 있는 대표 분석 흐름이 없다.",
          next: "대표 차익 분석 한 건에 출처, 계산 과정, 무효화 조건을 주석으로 연결한다."
        }
      },
      en: {
        title: "HyperAlphaDuo",
        category: "Trading research",
        summary: "A public research tool for comparing Hyperliquid positions, tokenized equities, and Korean-exchange arbitrage signals.",
        tags: ["Hyperliquid", "Arbitrage", "Exchanges", "Monitoring"],
        detail: {
          problem: "Tokenized-equity prices, Korean-exchange listings, and deposit or withdrawal status are fragmented across markets and screens.",
          decision: "Narrow the scope from a general tracker to a research console comparing Hyperliquid with Korean exchanges.",
          system: "Position search and filters, HIP-3 tokenized-equity comparison, and Upbit and Bithumb listing and transfer monitoring.",
          proof: "A public Vercel URL and a production-interface capture are present in the repository.",
          limitation: "The repository does not document data sources, refresh cadence, or an annotated representative workflow.",
          next: "Annotate one representative arbitrage read with its sources, calculation, and invalidation conditions."
        }
      }
    }
  },
  {
    slug: "mylol",
    status: "prototype",
    referenceUrl: "https://cafe.naver.com/xavishowtime",
    media: [
      {
        role: "proof",
        src: "/media/projects/mylol.webp",
        alt: {
          ko: "열세 개 관리 화면을 모은 myLoL QA 시트.",
          en: "myLoL QA sheet containing thirteen management screens."
        },
        source: {
          ko: "Godot QA 캡처",
          en: "Godot QA capture"
        },
        capturedAt: "2026-07-10",
        claim: {
          ko: "팀 선택부터 로스터, 드래프트, 경기, 기록, 이적까지 연결된 다중 화면 루프가 있다.",
          en: "A multi-screen loop connects team selection, roster, draft, matches, records, and transfers."
        },
        limitation: {
          ko: "정적 시트이며 공개 실행 파일이나 조작 영상을 제공하지 않는다.",
          en: "It is a static sheet and does not provide a public build or interaction recording."
        }
      },
      {
        role: "proof",
        src: "/media/projects/proof/mylol-draft.webp",
        alt: {
          ko: "선수 초상, 챔피언 목록, 역할 필터, 밴과 타이머가 있는 myLoL 드래프트 화면.",
          en: "myLoL draft screen with player portraits, champion list, role filters, bans, and timer."
        },
        source: {
          ko: "Godot QA 캡처",
          en: "Godot QA capture"
        },
        capturedAt: "2026-07-10",
        claim: {
          ko: "챔피언 드래프트가 별도의 관리 의사결정 화면으로 구현되어 있다.",
          en: "Champion drafting is implemented as a distinct management-decision screen."
        },
        limitation: {
          ko: "상대 AI 행동과 추천 로직은 정적 화면만으로 확인할 수 없다.",
          en: "Opponent AI behavior and recommendation logic cannot be verified from a static screen."
        }
      },
      {
        role: "proof",
        src: "/media/projects/proof/mylol-match.webp",
        alt: {
          ko: "양 팀 로스터, 점수, 타이머, 재생 속도를 보여주는 myLoL 경기 화면.",
          en: "myLoL match screen showing both rosters, score, timer, and playback speed."
        },
        source: {
          ko: "Godot QA 캡처",
          en: "Godot QA capture"
        },
        capturedAt: "2026-07-10",
        claim: {
          ko: "선택한 로스터가 방송형 경기 시뮬레이션 화면으로 이어진다.",
          en: "Selected rosters carry into a broadcast-style match-simulation screen."
        },
        limitation: {
          ko: "시뮬레이션 계산과 결과 생성 규칙은 화면에 공개되지 않는다.",
          en: "The simulation calculations and result-generation rules are not exposed."
        }
      }
    ],
    copy: {
      ko: {
        title: "myLoL",
        category: "게임 프로토타입",
        summary: "팀 선택, 로스터, 챔피언 드래프트, 경기, 수상, 이적과 다중 시즌 기록을 잇는 Godot 기반 LCK 운영 시뮬레이션.",
        tags: ["Godot", "LCK", "시뮬레이션", "Android"],
        detail: {
          problem: "LCK 팬이 실제 선수 데이터를 로스터 구성과 운영 판단으로 체험할 수 있는 팬메이드 매니지먼트 게임은 드물다.",
          decision: "가상 팀 대신 실제 LCK 팀과 선수 데이터를 시뮬레이션의 중심에 두었다.",
          system: "팀 선택, 로스터, 드래프트, 경기, 일정, 순위, 수상, 기록, 전략, 이적을 하나의 시즌 루프로 연결했다.",
          proof: "2026-07-10 QA 시트와 드래프트·경기 캡처가 연결된 관리 루프를 보여준다.",
          limitation: "현재 공개 증거는 정적 화면이며 설치 가능한 데모는 저장소에 없다.",
          next: "공개 데모 패키지와 시뮬레이션 규칙을 설명하는 짧은 빌드 회고를 제공한다."
        }
      },
      en: {
        title: "myLoL",
        category: "Game prototype",
        summary: "A Godot-based LCK management simulation connecting team selection, rosters, champion draft, matches, awards, transfers, and multi-season records.",
        tags: ["Godot", "LCK", "Simulation", "Android"],
        detail: {
          problem: "Few fan-made management games let LCK fans turn real player data into roster and operating decisions.",
          decision: "Place real LCK teams and player data at the center of the simulation instead of fictional clubs.",
          system: "Team selection, roster, draft, match, schedule, rankings, awards, records, strategy, and transfers form one season loop.",
          proof: "The 2026-07-10 QA sheet and focused draft and match captures show the connected management loop.",
          limitation: "Current public evidence is static imagery; the repository does not include an installable demo.",
          next: "Provide a public demo package and a short postmortem explaining the simulation rules."
        }
      }
    }
  },
  {
    slug: "maple-union",
    status: "prototype",
    articleUrl: "https://blog.nimdal.xyz/posts/maple-union-dev-log-2026-07-02/#case-room-proof",
    media: [
      {
        role: "concept",
        src: "/media/projects/maple-union.webp",
        alt: {
          ko: "maple uNion 프로젝트 소개 비주얼.",
          en: "maple uNion project introduction visual."
        },
        source: {
          ko: "현재 저장소의 프로젝트 이미지 자산",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "MapleStoryUniverse 자원을 사용한 AFK 게임 프로젝트를 소개한다.",
          en: "It introduces an AFK game project made with MapleStoryUniverse resources."
        },
        limitation: {
          ko: "소개 이미지 자체는 실행 가능한 게임의 증거가 아니다.",
          en: "The presentation image itself is not proof of a playable game."
        }
      },
      {
        role: "proof",
        src: "/media/projects/proof/maple-union-field-proof.webp",
        alt: {
          ko: "전투 UI와 HUD가 보이는 maple uNion 필드 루프 화면.",
          en: "maple uNion field loop with combat UI and HUD."
        },
        source: {
          ko: "게임 플레이 캡처",
          en: "Gameplay capture"
        },
        capturedAt: "2026-07-02",
        claim: {
          ko: "AFK 전투, 스킬 피드백, 가이드, HUD가 실행 화면에 함께 존재한다.",
          en: "AFK combat, skill feedback, guide layer, and HUD coexist in the running screen."
        },
        limitation: {
          ko: "정적 캡처라 입력과 전투 타이밍을 확인할 수 없다.",
          en: "The static capture cannot show input or combat timing."
        }
      },
      {
        role: "proof",
        src: "/media/projects/proof/maple-union-stage-proof.webp",
        alt: {
          ko: "여러 맵과 몬스터 환경을 모은 maple uNion 스테이지 시트.",
          en: "maple uNion stage sheet with multiple map and monster environments."
        },
        source: {
          ko: "스테이지 콘택트 시트",
          en: "Stage contact sheet"
        },
        capturedAt: "2026-07-02",
        claim: {
          ko: "여러 맵과 몬스터 조합이 빌드에 구성되어 있다.",
          en: "Multiple map and monster combinations were assembled in the build."
        },
        limitation: {
          ko: "콘택트 시트라 실제 이동과 스테이지 전환은 보여주지 않는다.",
          en: "The contact sheet does not show live traversal or stage transitions."
        }
      },
      {
        role: "document",
        src: "/media/projects/proof/maple-union-qa-proof.webp",
        alt: {
          ko: "maple uNion 맵 렌더링 QA 시트.",
          en: "maple uNion map-render QA sheet."
        },
        source: {
          ko: "맵 렌더링 QA 시트",
          en: "Map-render QA sheet"
        },
        capturedAt: "2026-07-02",
        claim: {
          ko: "원본 맵 자산을 자동 사냥 화면에 맞게 시험하고 조정했다.",
          en: "Source map assets were tested and adapted for the auto-hunting viewport."
        },
        limitation: {
          ko: "시각 QA만 담고 있으며 성능 수치는 포함하지 않는다.",
          en: "It documents visual QA only and contains no performance measurements."
        }
      }
    ],
    copy: {
      ko: {
        title: "maple uNion",
        category: "게임잼 프로토타입",
        summary: "MapleStoryUniverse VibeCamp 자원으로 짧은 제작 기간에 완성한 AFK 게임 루프.",
        tags: ["MapleStoryUniverse", "VibeCamp", "AFK", "게임잼"],
        detail: {
          problem: "짧은 게임잼 빌드는 입장, 전투, 보상, 성장의 완결된 루프를 빠르게 보여줘야 한다.",
          decision: "스크린샷과 제작 기록을 사후 장식이 아니라 제품 증거의 일부로 다뤘다.",
          system: "AFK 전투 루프, 필드·스테이지 변형, 가이드 UI, 맵 렌더링 QA를 연결했다.",
          proof: "2026-07-02 필드 캡처, 스테이지 시트, 맵 QA 시트와 외부 빌드 로그가 있다.",
          limitation: "공개 증거는 화면과 글이며 저장소 안에 플레이 가능한 빌드가 없다.",
          next: "플레이 가능한 데모나 짧은 조작 영상을 빌드 로그와 직접 연결한다."
        }
      },
      en: {
        title: "maple uNion",
        category: "Game-jam prototype",
        summary: "An AFK game loop made in a short production window with MapleStoryUniverse VibeCamp resources.",
        tags: ["MapleStoryUniverse", "VibeCamp", "AFK", "Game jam"],
        detail: {
          problem: "A short game-jam build has to show a complete enter, fight, reward, and progress loop quickly.",
          decision: "Treat screenshots and the build log as part of the product evidence, not post-launch decoration.",
          system: "An AFK combat loop, field and stage variations, guide UI, and map-render QA work together.",
          proof: "The repository contains field, stage, and map-QA captures dated 2026-07-02, plus an external build log.",
          limitation: "Public evidence consists of screens and writing; no playable build is stored in the repository.",
          next: "Connect a playable demo or short interaction recording directly to the build log."
        }
      }
    }
  },
  {
    slug: "ethosalpha",
    status: "prototype",
    repositoryUrl: "https://github.com/nimdalkr/ethoskaito",
    media: [
      {
        role: "proof",
        src: "/media/projects/ethosalpha-proof.png",
        alt: {
          ko: "ethosalpha 공개 GitHub 저장소 화면.",
          en: "ethosalpha public GitHub repository screen."
        },
        source: {
          ko: "공개 GitHub 저장소 캡처",
          en: "Public GitHub repository capture"
        },
        capturedAt: undated,
        claim: {
          ko: "ethosalpha 프로젝트의 공개 코드 저장소가 존재한다.",
          en: "A public code repository exists for the ethosalpha project."
        },
        limitation: {
          ko: "저장소 화면은 실제 사용 흐름, 데이터셋, 분석 방법을 증명하지 않는다.",
          en: "A repository screen does not prove the usage flow, dataset, or analytical method."
        }
      }
    ],
    copy: {
      ko: {
        title: "ethosalpha",
        category: "웹3 소셜 분석",
        summary: "웹3 신뢰, 평판, 소셜 반응 신호를 한 화면에서 읽기 위한 분석 프로토타입.",
        tags: ["웹3", "평판", "소셜 신호", "분석"],
        detail: {
          problem: "웹3의 신뢰 신호는 평판 서비스, 커뮤니티 반응, 프로젝트별 지표에 흩어져 있다.",
          decision: "시장 기능을 넓히기 전에 소셜 평판을 읽기 쉽게 만드는 좁은 분석 표면부터 만든다.",
          system: "Ethos 데이터와 소셜 지표를 비교 가능한 리서치 레이어로 구성하는 대시보드 패턴이다.",
          proof: "공개 GitHub 저장소와 그 화면 캡처가 있다.",
          limitation: "공개 제품 화면, 예시 데이터셋, 방법론 문서, 사용 지표는 저장소에 없다.",
          next: "주석이 있는 대시보드 캡처, 예시 데이터, 짧은 방법론 문서를 공개한다."
        }
      },
      en: {
        title: "ethosalpha",
        category: "Web3 social analytics",
        summary: "An analytics prototype for reading Web3 trust, reputation, and social-response signals in one place.",
        tags: ["Web3", "Reputation", "Social signals", "Analytics"],
        detail: {
          problem: "Web3 trust signals are fragmented across reputation services, community response, and project-specific metrics.",
          decision: "Start with a narrow, readable social-reputation surface before expanding market features.",
          system: "A dashboard pattern that combines Ethos data and social metrics as a comparable research layer.",
          proof: "A public GitHub repository and a capture of that repository are available.",
          limitation: "The repository does not provide a public product screen, sample dataset, methodology note, or usage metrics.",
          next: "Publish an annotated dashboard capture, sample data, and a short methodology note."
        }
      }
    }
  },
  {
    slug: "kol-listing",
    status: "live",
    liveUrl: "https://kollisting.vercel.app/",
    media: [
      {
        role: "concept",
        src: "/media/projects/kol-listing.webp",
        alt: {
          ko: "KOL Listing 프로젝트 소개 비주얼.",
          en: "KOL Listing project introduction visual."
        },
        source: {
          ko: "현재 저장소의 프로젝트 이미지 자산",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "KOL 활동과 원화 거래소 상장 연구라는 프로젝트 주제를 소개한다.",
          en: "It introduces the project's KOL-activity and KRW-listing research theme."
        },
        limitation: {
          ko: "제품 화면이나 상관관계 분석 결과를 보여주는 증거가 아니다.",
          en: "It is not evidence of a product screen or correlation-analysis result."
        }
      }
    ],
    copy: {
      ko: {
        title: "KOL Listing",
        category: "크립토 리서치",
        summary: "KOL 광고·AMA 활동과 원화 거래소 상장 기대의 관계를 탐색하는 비공개 접근형 리서치 도구.",
        tags: ["크립토", "KOL", "상장 리서치", "상관관계"],
        detail: {
          problem: "KOL 광고와 AMA 활동은 공개되어도 상장 기대와 프로젝트 선택 편향을 함께 비교하기 어렵다.",
          decision: "흩어진 캠페인 활동을 원화 상장 관점의 반복 가능한 조사 표면으로 정리한다.",
          system: "KOL 활동 매핑, 광고 성향, 프로젝트 선택 패턴, 상장 지향 분석으로 구성한다.",
          proof: "공개 URL은 존재하지만 현재 포트폴리오 기록상 비밀번호로 접근이 제한된다.",
          limitation: "저장소에는 제품 캡처와 표본 사례가 없으며 상관관계를 인과관계로 해석해서는 안 된다.",
          next: "출처와 한계를 포함한 익명화 표본 사례를 공개하고 접근 제한을 명시한다."
        }
      },
      en: {
        title: "KOL Listing",
        category: "Crypto research",
        summary: "A gated research tool exploring the relationship between KOL advertising or AMA activity and expectations of KRW-exchange listings.",
        tags: ["Crypto", "KOL", "Listing research", "Correlation"],
        detail: {
          problem: "KOL ads and AMA activity are public, but listing expectations and project-selection bias are difficult to compare together.",
          decision: "Organize scattered campaign activity into a repeatable KRW-listing research surface.",
          system: "KOL activity mapping, advertising tendencies, project-selection patterns, and listing-oriented analysis.",
          proof: "A public URL exists, but the current portfolio record says access is password-gated.",
          limitation: "The repository has no product capture or sample case, and correlation must not be presented as causation.",
          next: "Publish a redacted sample case with sources and caveats, and state the access restriction."
        }
      }
    }
  },
  {
    slug: "tg-finance-search-portal",
    status: "in-progress",
    media: [
      {
        role: "concept",
        src: "/media/projects/tg-finance-search-portal.webp",
        alt: {
          ko: "TG Finance Search Portal 프로젝트 소개 비주얼.",
          en: "TG Finance Search Portal project introduction visual."
        },
        source: {
          ko: "현재 저장소의 프로젝트 이미지 자산",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "텔레그램 금융 콘텐츠 검색 포털이라는 제작 방향을 보여준다.",
          en: "It shows the direction of a Telegram finance-content search portal."
        },
        limitation: {
          ko: "개념 이미지이며 작동하는 검색이나 수집 시스템의 증거가 아니다.",
          en: "It is a concept image, not proof of a working search or ingestion system."
        }
      }
    ],
    copy: {
      ko: {
        title: "TG Finance Search Portal",
        category: "제작 중인 검색 포털",
        summary: "흐르는 텔레그램 금융 콘텐츠를 검색하고 정리해 다시 찾기 위한 포털 구상.",
        tags: ["텔레그램", "금융", "검색", "아카이브"],
        detail: {
          problem: "텔레그램의 유용한 금융 글은 채팅 흐름 속에서 다시 찾고 비교하기 어렵다.",
          decision: "커뮤니티 기능보다 콘텐츠 수집 정책과 검색·회수 구조를 먼저 설계한다.",
          system: "금융 분야 텔레그램 글을 수집, 정리, 검색하는 포털 구조를 목표로 한다.",
          proof: "저장소에는 프로젝트 소개 이미지와 제작 중이라는 상태 설명만 있다.",
          limitation: "작동하는 데모, 수집 정책, 검색 품질 자료는 아직 공개되어 있지 않다.",
          next: "대표 채널 범위와 출처 정책을 정하고 실제 검색 흐름을 캡처한다."
        }
      },
      en: {
        title: "TG Finance Search Portal",
        category: "Search portal in progress",
        summary: "A portal concept for searching, organizing, and retrieving finance content that otherwise disappears in Telegram feeds.",
        tags: ["Telegram", "Finance", "Search", "Archive"],
        detail: {
          problem: "Useful finance posts in Telegram are difficult to retrieve and compare once they move out of the chat stream.",
          decision: "Design source policy and search and retrieval structure before broader community features.",
          system: "A planned portal for ingesting, organizing, and searching finance-sector Telegram posts.",
          proof: "The repository contains a project introduction image and an in-progress status description.",
          limitation: "No working demo, source policy, or search-quality evidence is public yet.",
          next: "Define representative channel scope and source policy, then capture a working search flow."
        }
      }
    }
  },
  {
    slug: "social-poster-one",
    status: "prototype",
    media: [
      {
        role: "concept",
        src: "/media/projects/social-poster-one.webp",
        alt: {
          ko: "Social Poster-One 자동화 프로젝트 소개 비주얼.",
          en: "Social Poster-One automation project introduction visual."
        },
        source: {
          ko: "현재 저장소의 프로젝트 이미지 자산",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "텔레그램에서 여러 소셜 채널로 배포하는 자동화 개념을 소개한다.",
          en: "It introduces an automation concept for distribution from Telegram to multiple social channels."
        },
        limitation: {
          ko: "실행 로그, API 응답, 게시 결과를 보여주는 증거가 아니다.",
          en: "It does not show execution logs, API responses, or published results."
        }
      }
    ],
    copy: {
      ko: {
        title: "Social Poster-One",
        category: "소셜 배포 자동화",
        summary: "텔레그램 콘텐츠를 LinkedIn, Threads, X로 보내는 API 기반 게시 자동화 프로토타입.",
        tags: ["텔레그램", "LinkedIn", "Threads", "X", "자동화"],
        detail: {
          problem: "같은 텔레그램 원문을 여러 소셜 채널에 반복 게시하면 시간이 들고 포맷이 쉽게 어긋난다.",
          decision: "수동 체크리스트 대신 채널별 출력 처리를 가진 API 파이프라인으로 배포를 다룬다.",
          system: "텔레그램 입력을 LinkedIn, Threads, X용 출력으로 변환하고 게시하는 흐름이다.",
          proof: "저장소에는 프로젝트 설명과 소개 이미지가 있다.",
          limitation: "실행 영상, 게시 로그, 플랫폼별 API 제약을 검증할 자료가 없다.",
          next: "한 건의 전체 실행 기록과 플랫폼별 권한·포맷·실패 처리 한계를 공개한다."
        }
      },
      en: {
        title: "Social Poster-One",
        category: "Social distribution automation",
        summary: "An API-based posting prototype that distributes Telegram content to LinkedIn, Threads, and X.",
        tags: ["Telegram", "LinkedIn", "Threads", "X", "Automation"],
        detail: {
          problem: "Reposting the same Telegram source across social channels takes time and easily creates formatting drift.",
          decision: "Treat distribution as an API pipeline with channel-specific output handling instead of a manual checklist.",
          system: "A flow that transforms Telegram input into LinkedIn, Threads, and X outputs and publishes them.",
          proof: "The repository contains a project description and introduction image.",
          limitation: "There is no workflow recording, publication log, or evidence documenting each platform's API constraints.",
          next: "Publish one end-to-end run and the permission, formatting, and failure-handling limits for each platform."
        }
      }
    }
  },
  {
    slug: "discord-bulk-leave",
    status: "prototype",
    media: [
      {
        role: "concept",
        src: "/media/projects/discord-bulk-leave.webp",
        alt: {
          ko: "Discord Bulk Leave Tool 프로젝트 소개 비주얼.",
          en: "Discord Bulk Leave Tool project introduction visual."
        },
        source: {
          ko: "현재 저장소의 프로젝트 이미지 자산",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "여러 디스코드 서버를 선택해 나가는 유틸리티 개념을 소개한다.",
          en: "It introduces a utility concept for selecting and leaving multiple Discord servers."
        },
        limitation: {
          ko: "실제 API 요청, 확인 절차, 안전장치를 보여주는 증거가 아니다.",
          en: "It does not show real API requests, confirmation flow, or safety controls."
        }
      }
    ],
    copy: {
      ko: {
        title: "Discord Bulk Leave Tool",
        category: "개인 유틸리티",
        summary: "공식 Discord API로 여러 서버를 선택하고 한 번에 나가기 위한 개인 생산성 프로토타입.",
        tags: ["Discord", "공식 API", "유틸리티", "자동화"],
        detail: {
          problem: "많은 디스코드 서버를 하나씩 검토하고 나가는 과정은 반복적이고 관리하기 어렵다.",
          decision: "공식 API 범위 안에서 다중 선택과 명시적 확인을 핵심 상호작용으로 둔다.",
          system: "서버 목록, 선택 상태, 확인 단계, 일괄 나가기 작업으로 구성한 유틸리티다.",
          proof: "저장소에는 프로젝트 설명과 소개 이미지가 있다.",
          limitation: "작동 데모, 권한 설명, 복구 불가능성에 대한 안전 안내가 공개되어 있지 않다.",
          next: "권한과 되돌릴 수 없는 동작을 설명하고 확인 화면을 포함한 데모를 제공한다."
        }
      },
      en: {
        title: "Discord Bulk Leave Tool",
        category: "Personal utility",
        summary: "A personal-productivity prototype for selecting and leaving multiple servers through the official Discord API.",
        tags: ["Discord", "Official API", "Utility", "Automation"],
        detail: {
          problem: "Reviewing and leaving many Discord servers one by one is repetitive and difficult to manage.",
          decision: "Keep the utility inside the official API boundary, with multi-select and explicit confirmation as the core interaction.",
          system: "A server list, selection state, confirmation step, and batch-leave operation form the utility.",
          proof: "The repository contains a project description and introduction image.",
          limitation: "No working demo, permission explanation, or safety guidance for the irreversible action is public.",
          next: "Explain permissions and irreversibility, then provide a demo that includes the confirmation screen."
        }
      }
    }
  }
] as const satisfies readonly Project[];

export const careerCases = [
  {
    id: "swiss-j-functional-shoes",
    period: "2019.09–2022.12",
    media: {
      role: "career",
      src: "/media/career/joya-logo.jpg",
      alt: {
        ko: "Joya 로고.",
        en: "Joya logo."
      },
      source: {
        ko: "현재 커리어 포트폴리오의 브랜드 이미지 자산",
        en: "Brand image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "기능성 신발 캠페인의 브랜드 맥락을 식별한다.",
        en: "It identifies the brand context for the functional-footwear campaign."
      },
      limitation: {
        ko: "로고는 캠페인 역할이나 성과를 증명하지 않는다.",
        en: "A logo does not prove the campaign role or result."
      }
    },
    metrics: [
      {
        value: "~2,000%",
        provenance: "portfolio-claim",
        copy: {
          ko: {
            label: "광고비 대비 매출 수준",
            context: "커리어 포트폴리오는 약 3개월 안에 광고비 대비 매출 약 2,000% 수준에 도달했다고 기록한다.",
            source: "현재 저장소의 커리어 포트폴리오 문구",
            limitation: "익명화 리포트나 광고·매출 원자료가 없어 외부 검증된 성과로 표현하지 않는다."
          },
          en: {
            label: "Ad-spend-to-sales level",
            context: "The career portfolio states that the campaign reached roughly 2,000% ad-spend-to-sales performance in about three months.",
            source: "Current repository career-portfolio copy",
            limitation: "No anonymized report or underlying ad and sales data is present, so this is not presented as externally verified."
          }
        }
      }
    ],
    copy: {
      ko: {
        title: "스위스 J 기능성 신발 캠페인",
        context: "기능성 신발 브랜드",
        channels: ["네이버 블로그", "네이버 검색", "Instagram"],
        objective: "쇼핑몰 매출과 온·오프라인 프로모션 구조를 다시 설계한다.",
        role: "마케팅 방향, 시장·경쟁사 조사, 콘텐츠 기획, 고객 커뮤니케이션, 리포팅.",
        result: "포트폴리오는 약 3개월 안에 광고비 대비 매출 약 2,000% 수준에 도달했다고 기록한다.",
        constraint: "광고비만이 아니라 검색과 콘텐츠 운영이 성과에 어떻게 기여했는지 설명해야 했다.",
        system: "경쟁사 조사, 키워드 중심 콘텐츠 방향, 프로모션 리포팅, 고객 피드백 루프.",
        proof: "현재 공개 증거는 커리어 포트폴리오의 서술과 브랜드 이미지다.",
        limitation: "정량 성과는 포트폴리오 주장으로 분류하며 원자료 없이 검증 수치로 취급하지 않는다."
      },
      en: {
        title: "Swiss J Functional Shoes Campaign",
        context: "Functional-footwear brand",
        channels: ["Naver Blog", "Naver Search", "Instagram"],
        objective: "Rebuild the shopping-mall sales and online and offline promotion structure.",
        role: "Marketing direction, market and competitor research, content planning, client communication, and reporting.",
        result: "The portfolio states that the work reached roughly 2,000% ad-spend-to-sales performance in about three months.",
        constraint: "Performance had to be explained through search and content operations, not ad spend alone.",
        system: "Competitor scan, keyword-led content direction, promotion reporting, and a client-feedback loop.",
        proof: "Current public evidence consists of the career-portfolio narrative and a brand image.",
        limitation: "The quantitative result is classified as a portfolio claim and is not treated as verified without source data."
      }
    }
  },
  {
    id: "busan-h-animal-hospital",
    period: "2020.03–2023.10",
    media: {
      role: "career",
      src: "/media/career/h-animal-logo.jpg",
      alt: {
        ko: "H 동물의료센터 로고.",
        en: "H Animal Medical Center logo."
      },
      source: {
        ko: "현재 커리어 포트폴리오의 브랜드 이미지 자산",
        en: "Brand image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "지역 동물병원 마케팅 사례의 브랜드 맥락을 식별한다.",
        en: "It identifies the brand context for the local animal-hospital marketing case."
      },
      limitation: {
        ko: "로고는 검색 노출, 문의, 방문 성과를 증명하지 않는다.",
        en: "The logo does not prove search exposure, inquiries, or visits."
      }
    },
    metrics: [],
    copy: {
      ko: {
        title: "부산 H 동물병원 로컬 마케팅",
        context: "신규 개원 지역 동물병원",
        channels: ["네이버 블로그", "네이버 스마트플레이스"],
        objective: "개원 후 네이버 검색과 스마트플레이스를 통해 안정적인 지역 유입 구조를 만든다.",
        role: "로컬 마케팅 방향, 경쟁 병원 조사, 블로그·스마트플레이스 운영, 고객 커뮤니케이션, 리포팅.",
        result: "포트폴리오는 계약 기간 전체에 걸쳐 안정적인 로컬 마케팅 운영을 유지했다고 기록한다.",
        constraint: "넓은 도달보다 지역 검색 의도와 신뢰 형성이 중요했다.",
        system: "네이버 블로그 발행 리듬, 스마트플레이스 관리, 지역 경쟁사 추적, 정기 리포팅.",
        proof: "2020.03–2023.10 기간과 운영 역할이 현재 커리어 포트폴리오에 기록되어 있다.",
        limitation: "공유 가능한 키워드 노출, 스마트플레이스 전후, 문의·방문 자료는 저장소에 없다."
      },
      en: {
        title: "Busan H Animal Hospital Local Marketing",
        context: "New local animal hospital",
        channels: ["Naver Blog", "Naver Smartplace"],
        objective: "Create stable local acquisition after opening through Naver Search and Smartplace.",
        role: "Local marketing direction, competitor-hospital research, blog and Smartplace operations, client communication, and reporting.",
        result: "The portfolio records a stable local-marketing operation across the full engagement period.",
        constraint: "Local search intent and trust-building mattered more than broad campaign reach.",
        system: "Naver Blog cadence, Smartplace maintenance, local competitor tracking, and a reporting rhythm.",
        proof: "The 2020.03–2023.10 period and operating role are recorded in the current career portfolio.",
        limitation: "The repository has no shareable keyword exposure, Smartplace before-and-after, inquiry, or visit evidence."
      }
    }
  },
  {
    id: "leica-online-acquisition",
    period: "2022.07–2024.09",
    media: {
      role: "career",
      src: "/media/career/leica-logo.jpg",
      alt: {
        ko: "Leica 로고.",
        en: "Leica logo."
      },
      source: {
        ko: "현재 커리어 포트폴리오의 브랜드 이미지 자산",
        en: "Brand image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "프리미엄 리테일 온라인 유입 사례의 브랜드 맥락을 식별한다.",
        en: "It identifies the brand context for the premium-retail acquisition case."
      },
      limitation: {
        ko: "로고는 유입이나 매출 변화를 증명하지 않는다.",
        en: "The logo does not prove acquisition or sales change."
      }
    },
    metrics: [
      {
        value: "KRW 1–2M/mo",
        provenance: "portfolio-claim",
        copy: {
          ko: {
            label: "마케팅 전 월 매출 기준선",
            context: "커리어 포트폴리오는 마케팅 전 월 매출을 약 100만~200만 원으로 기록한다.",
            source: "현재 저장소의 커리어 포트폴리오 문구",
            limitation: "원매출 자료가 없어 포트폴리오 주장으로만 표시한다."
          },
          en: {
            label: "Pre-marketing monthly sales baseline",
            context: "The career portfolio records roughly KRW 1–2M in monthly sales before marketing.",
            source: "Current repository career-portfolio copy",
            limitation: "No underlying sales records are present, so this is shown only as a portfolio claim."
          }
        }
      },
      {
        value: "KRW 100M/mo",
        provenance: "portfolio-claim",
        copy: {
          ko: {
            label: "2024년 9월 월 매출",
            context: "커리어 포트폴리오는 2024년 9월 월 매출을 1억 원으로 기록한다.",
            source: "현재 저장소의 커리어 포트폴리오 문구",
            limitation: "익명화 매출 리포트가 없어 외부 검증된 수치로 표현하지 않는다."
          },
          en: {
            label: "Monthly sales in September 2024",
            context: "The career portfolio records KRW 100M in monthly sales in September 2024.",
            source: "Current repository career-portfolio copy",
            limitation: "No anonymized sales report is present, so this is not presented as externally verified."
          }
        }
      }
    ],
    copy: {
      ko: {
        title: "Leica 온라인 유입 및 매출 성장",
        context: "프리미엄 브랜드·리테일",
        channels: ["네이버 블로그", "홈페이지"],
        objective: "온라인 문의와 매출 성장을 위한 콘텐츠·홈페이지 유입 구조를 만든다.",
        role: "마케팅 방향, 타깃 조사, 콘텐츠 제작, 홈페이지 유입 구조, 고객 커뮤니케이션, 리포팅.",
        result: "포트폴리오는 마케팅 전 월 100만~200만 원에서 2024년 9월 월 1억 원으로 이동했다고 기록한다.",
        constraint: "프리미엄 브랜드 인식을 해치지 않으면서 온라인 유입을 늘려야 했다.",
        system: "검색 콘텐츠, 홈페이지 유입 구조, 문의 반응 신호, 정기 리포팅.",
        proof: "기간, 역할, 기준선과 결과 수치가 현재 커리어 포트폴리오에 기록되어 있다.",
        limitation: "매출 수치는 포트폴리오 주장이며 익명화 리포트 없이 검증 성과로 취급하지 않는다."
      },
      en: {
        title: "Leica Online Acquisition and Sales Growth",
        context: "Premium brand and retail",
        channels: ["Naver Blog", "Homepage"],
        objective: "Build a content and homepage acquisition structure for online inquiries and sales growth.",
        role: "Marketing direction, target research, content production, homepage acquisition design, client communication, and reporting.",
        result: "The portfolio records a move from roughly KRW 1–2M in monthly sales before marketing to KRW 100M in September 2024.",
        constraint: "Online acquisition had to grow without weakening premium-brand perception.",
        system: "Search content, homepage acquisition structure, inquiry-response signals, and a reporting cadence.",
        proof: "The current career portfolio records the period, role, baseline, and outcome figures.",
        limitation: "The sales figures are portfolio claims and are not treated as verified results without an anonymized report."
      }
    }
  },
  {
    id: "mkr-agency-operating-system",
    period: "2018.06.29–2024.09",
    media: {
      role: "career",
      src: "/media/career/mkr-logo.jpg",
      alt: {
        ko: "MKR 로고.",
        en: "MKR logo."
      },
      source: {
        ko: "현재 커리어 포트폴리오의 조직 이미지 자산",
        en: "Organization image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "에이전시 운영 시스템 사례의 조직 맥락을 식별한다.",
        en: "It identifies the organization context for the agency operating-system case."
      },
      limitation: {
        ko: "로고는 고객 수, 근무 기간, 운영 품질을 증명하지 않는다.",
        en: "The logo does not prove client count, tenure, or operating quality."
      }
    },
    metrics: [
      {
        value: "100+",
        provenance: "portfolio-claim",
        copy: {
          ko: {
            label: "운영 고객 수",
            context: "커리어 포트폴리오는 에이전시 업무에서 100곳 이상의 고객 운영을 다뤘다고 기록한다.",
            source: "현재 저장소의 커리어 포트폴리오 요약",
            limitation: "고객 명단이나 프로젝트 원장이 없어 포트폴리오 주장으로만 표시한다."
          },
          en: {
            label: "Client operations handled",
            context: "The career portfolio records more than 100 client operations through agency work.",
            source: "Current repository career-portfolio summary",
            limitation: "No client list or project ledger is present, so this remains a portfolio claim."
          }
        }
      },
      {
        value: "6+ yrs",
        provenance: "career-record",
        copy: {
          ko: {
            label: "에이전시 운영 기간",
            context: "현재 포트폴리오는 2018.06.29–2024.09의 업무 기간을 기록한다.",
            source: "현재 저장소의 커리어 사례 기간",
            limitation: "저장소 안에 독립적인 재직 증명 문서는 없다."
          },
          en: {
            label: "Agency operating period",
            context: "The current portfolio records the work period as 2018.06.29–2024.09.",
            source: "Career-case period in the current repository",
            limitation: "The repository contains no independent employment-verification document."
          }
        }
      }
    ],
    copy: {
      ko: {
        title: "MKR 에이전시 운영 시스템",
        context: "100곳 이상 고객·6년 이상 운영 기록",
        channels: ["블로그", "인플루언서", "디자인", "개발", "대행 파트너"],
        objective: "다수 고객과 파트너가 얽힌 광고 대행 환경의 운영 흐름을 체계화한다.",
        role: "캠페인 운영 리드: 요청 구조화, 업무 분해, 일정 관리, 결과물 QA, 리포팅, 개선 제안.",
        result: "포트폴리오는 고객 리포팅, 파트너 관리, 반복 가능한 캠페인 운영의 실행 기반을 만들었다고 기록한다.",
        constraint: "많은 파트너와 결과물 사이에서 일정과 품질을 일관되게 유지해야 했다.",
        system: "요청 접수, 업무 분해, 파트너 커뮤니케이션, QA, 리포팅, 재계약 준비 루프.",
        proof: "업무 기간과 운영 범위가 커리어 포트폴리오에 기록되어 있다.",
        limitation: "고객 수는 포트폴리오 주장이고 워크플로 보드·리포트 템플릿 화면은 저장소에 없다."
      },
      en: {
        title: "MKR Agency Operating System",
        context: "100+ clients and a 6+ year operating record",
        channels: ["Blog", "Influencer", "Design", "Development", "Agency partners"],
        objective: "Systemize the operating flow for an agency environment with many clients and partners.",
        role: "Campaign Ops Lead: request structuring, task breakdown, schedule control, output QA, reporting, and improvement proposals.",
        result: "The portfolio records an execution base for client reporting, partner management, and repeatable campaign operations.",
        constraint: "Schedule and quality had to remain consistent across many partners and deliverables.",
        system: "Request intake, task breakdown, partner communication, QA, reporting, and renewal-readiness loops.",
        proof: "The career portfolio records the work period and operating scope.",
        limitation: "The client count is a portfolio claim, and no workflow-board or report-template screens are stored in the repository."
      }
    }
  },
  {
    id: "community-kol-campaigns",
    period: "2025.01–2025.09",
    media: {
      role: "career",
      src: "/media/career/bitcoin-logo.jpg",
      alt: {
        ko: "웹3 커리어 사례에 사용된 비트코인 심볼 이미지.",
        en: "Bitcoin symbol image used for the Web3 career case."
      },
      source: {
        ko: "현재 커리어 포트폴리오의 일반 웹3 이미지 자산",
        en: "Generic Web3 image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "웹3 커뮤니티·KOL 캠페인이라는 분야 맥락만 보여준다.",
        en: "It only signals the Web3 community and KOL campaign context."
      },
      limitation: {
        ko: "특정 고객, 콘텐츠, 캠페인 결과의 증거가 아니다.",
        en: "It is not evidence of a specific client, piece of content, or campaign result."
      }
    },
    metrics: [],
    copy: {
      ko: {
        title: "커뮤니티·KOL 콘텐츠 캠페인",
        context: "071Labs / AlphaDuo",
        channels: ["X", "Telegram", "Discord", "Medium", "Blog"],
        objective: "글로벌 웹3 메시지를 한국 사용자에 맞게 현지화하고 커뮤니티·KOL 커뮤니케이션을 지원한다.",
        role: "한국어 콘텐츠 작성, X·블로그·텔레그램 운영, KOL 협업, AMA·이벤트 기획, 고객 커뮤니케이션.",
        result: "포트폴리오는 UXLINK, SaharaAI, edgeX, Theoriq, BLESS, Dolomite, MVL 관련 한국 시장 커뮤니케이션 경험을 기록한다.",
        constraint: "관심 유도, 리스크, 규정 준수, 커뮤니티 해석 사이의 균형이 필요했다.",
        system: "한국어 콘텐츠 각색, KOL 조율, AMA·이벤트 기획, 커뮤니티 반응 모니터링.",
        proof: "프로젝트와 역할 목록은 현재 커리어 포트폴리오에 기록되어 있다.",
        limitation: "프로젝트별 공개 콘텐츠 링크, KOL 게시물, AMA 참여 자료는 저장소에 정리되어 있지 않다."
      },
      en: {
        title: "Community and KOL Content Campaigns",
        context: "071Labs / AlphaDuo",
        channels: ["X", "Telegram", "Discord", "Medium", "Blog"],
        objective: "Localize global Web3 messaging for Korean users and support community and KOL communication.",
        role: "Korean content writing, X, blog, and Telegram operations, KOL collaboration, AMA and event planning, and client communication.",
        result: "The portfolio records Korean-market communication experience involving UXLINK, SaharaAI, edgeX, Theoriq, BLESS, Dolomite, and MVL.",
        constraint: "Attention, risk, compliance, and community interpretation had to remain in balance.",
        system: "Korean content adaptation, KOL coordination, AMA and event planning, and community-response monitoring.",
        proof: "The project and role list is recorded in the current career portfolio.",
        limitation: "The repository does not curate project-level public content links, KOL posts, or AMA-participation evidence."
      }
    }
  },
  {
    id: "nevada-korea-marketing-lead",
    period: "2026.04–2026.06",
    media: {
      role: "proof",
      src: "/media/career/nevada.jpg",
      alt: {
        ko: "trade.nevada.app 시장 대시보드 화면.",
        en: "trade.nevada.app markets dashboard."
      },
      source: {
        ko: "현재 커리어 포트폴리오에 저장된 제품 화면",
        en: "Product screen stored in the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "NEVADA 제품의 공개 거래 인터페이스가 존재한다.",
        en: "A public trading interface exists for the NEVADA product."
      },
      limitation: {
        ko: "제품 화면은 한국 GTM 역할, SEO 설정, KOL 풀, 대시보드 완성을 증명하지 않는다.",
        en: "The product screen does not prove the Korean GTM role, SEO setup, KOL pool, or dashboard completion."
      }
    },
    metrics: [],
    copy: {
      ko: {
        title: "글로벌 클라이언트 마케팅 리드 — NEVADA Korea",
        context: "1six.tech Inc. / 미국 기반 perpDEX NEVADA",
        channels: ["SEO", "SNS", "KOL", "Blog", "GA4"],
        objective: "미국 기반 perpDEX 고객을 위한 한국 마케팅 실행 시스템을 설계한다.",
        role: "마케팅 리드: 한국 GTM, 웹사이트 SEO 설정, 리스크 조율, 영문 자료의 한국어 메시지화, 대행사 커뮤니케이션.",
        result: "포트폴리오는 한국 마케팅 방향과 실행 패널 구조를 완성했다고 기록한다.",
        constraint: "한국 시장 메시지, 리스크·규정 준수, SEO, 대행사 실행을 함께 정렬해야 했다.",
        system: "SEO 설정, UTM·GA4 대시보드 논리, KOL 풀, 한국어 메시지, 실행 패널.",
        proof: "현재 저장소에는 trade.nevada.app 화면과 역할·시스템 설명이 있다.",
        limitation: "GA4·UTM 대시보드, SEO 설정, 실행 리포트의 공유 가능한 화면은 저장소에 없다."
      },
      en: {
        title: "Global Client Marketing Lead — NEVADA Korea",
        context: "1six.tech Inc. / NEVADA, a US-based perpDEX",
        channels: ["SEO", "SNS", "KOL", "Blog", "GA4"],
        objective: "Design the Korean marketing-execution system for a US-based perpDEX client.",
        role: "Marketing Lead: Korean GTM, website SEO setup, risk coordination, Korean messaging from English materials, and agency communication.",
        result: "The portfolio records completion of the Korean marketing direction and execution-panel structure.",
        constraint: "Korean-market messaging, risk and compliance, SEO, and agency execution had to stay aligned.",
        system: "SEO setup, UTM and GA4 dashboard logic, KOL pool, Korean messaging, and an execution panel.",
        proof: "The current repository contains a trade.nevada.app screen and a description of the role and system.",
        limitation: "The repository contains no shareable GA4 or UTM dashboard, SEO setup, or execution-report screens."
      }
    }
  }
] as const satisfies readonly CareerCase[];

export const postSlugs = [
  "nimdal-logbook",
  "research-tools-should-make-markets-readable",
  "campaign-operations-to-product-systems"
] as const;

export const blogPosts = [
  {
    slug: "nimdal-logbook",
    publishedAt: "2026-07-02",
    updatedAt: "2026-07-02",
    cover: "/media/identity-octopus.jpg",
    sourcePath: "content/blog/nimdal-logbook.mdx",
    copy: {
      ko: {
        title: "Nimdal에게 nimdalog가 필요한 이유",
        description: "리서치, 빌드, 캠페인 사고, 개인 실험을 한곳에 오래 남기기 위해 블로그를 시작한 이유.",
        category: "빌드 로그",
        tags: ["Nimdal", "빌드 로그", "포트폴리오"],
        readingTime: "3분"
      },
      en: {
        title: "Why Nimdal Needs nimdalog",
        description: "A first note on keeping research, builds, campaign thinking, and personal experiments in one durable place.",
        category: "Build Log",
        tags: ["Nimdal", "Build Log", "Portfolio"],
        readingTime: "3 min read"
      }
    }
  },
  {
    slug: "research-tools-should-make-markets-readable",
    publishedAt: "2026-07-02",
    updatedAt: "2026-07-02",
    cover: "/media/projects/hyperalphaduo.webp",
    sourcePath: "content/blog/research-tools-should-make-markets-readable.mdx",
    copy: {
      ko: {
        title: "리서치 도구는 시장을 더 읽기 쉽게 만들어야 한다",
        description: "웹3 리서치 도구, 시장 소음, 의사결정 마찰을 줄이는 인터페이스에 관한 짧은 운영 노트.",
        category: "리서치",
        tags: ["웹3", "리서치", "제품 시스템"],
        readingTime: "4분"
      },
      en: {
        title: "Research Tools Should Make Markets Easier to Read",
        description: "A short operating note on Web3 research tools, market noise, and interfaces that reduce decision friction.",
        category: "Research",
        tags: ["Web3", "Research", "Product Systems"],
        readingTime: "4 min read"
      }
    }
  },
  {
    slug: "campaign-operations-to-product-systems",
    publishedAt: "2026-07-02",
    updatedAt: "2026-07-02",
    cover: "/media/career/mkr-logo.jpg",
    sourcePath: "content/blog/campaign-operations-to-product-systems.mdx",
    copy: {
      ko: {
        title: "캠페인 운영에서 제품 시스템으로",
        description: "캠페인 기획, SEO, 리포팅, 파트너 조율이 제품 사고의 기반이 되는 방식.",
        category: "커리어 노트",
        tags: ["커리어", "마케팅", "운영"],
        readingTime: "4분"
      },
      en: {
        title: "From Campaign Operations to Product Systems",
        description: "How campaign planning, SEO, reporting, and partner coordination can form a useful foundation for product thinking.",
        category: "Career Notes",
        tags: ["Career", "Marketing", "Operations"],
        readingTime: "4 min read"
      }
    }
  }
] as const satisfies readonly BlogPost[];

export const siteContent = {
  ko: {
    seo: {
      title: "Nimdal / 탁찬우 — 리서치, 자동화, 캠페인 운영",
      description: "Nimdal과 탁찬우의 프로젝트 Lab, 커리어 사례, 리서치와 빌드 기록을 한국어와 영어로 정리한 포트폴리오."
    },
    language: {
      label: "언어",
      current: "한국어",
      switchTo: "English"
    },
    nav: [
      { label: "홈", href: "/ko" },
      { label: "Lab", href: "/ko/lab" },
      { label: "커리어", href: "/ko/portfolio" },
      { label: "글", href: "/ko/blog" },
      { label: "연락", href: "/ko#contact" }
    ],
    home: {
      identity: {
        eyebrow: "Nimdal / 탁찬우",
        name: "Nimdal",
        legalName: "탁찬우",
        role: "빌더 · 캠페인 운영자 · 전략가",
        headline: "복잡한 시장과 운영 문제를 읽고, 작동하는 시스템으로 바꿉니다.",
        description: "웹3 리서치 도구, 자동화, 게임형 실험, SEO와 캠페인 운영을 하나의 포트폴리오에 연결합니다. 픽셀 문어는 공개 정체성이고, 실제 작업은 조사·구조화·실행·리포팅입니다.",
        location: "서울 · 원격 협업",
        availability: "리서치 도구, 자동화 시스템, 캠페인·GTM 운영을 만들고 있습니다.",
        portraitAlt: "탁찬우의 인물 사진.",
        avatarAlt: "Nimdal의 픽셀 문어 정체성 이미지.",
        primaryCta: "Lab 보기",
        secondaryCta: "커리어 보기"
      },
      metrics: [
        {
          value: "9",
          label: "Lab 프로젝트",
          context: "이 콘텐츠 모델에 정의된 리서치, 자동화, 게임 프로젝트 수.",
          source: "현재 저장소의 projects 배열",
          limitation: "완성도와 공개 증거 수준은 프로젝트마다 다르며 상태 라벨로 구분한다.",
          provenance: "repository-count"
        },
        {
          value: "6",
          label: "커리어 사례",
          context: "현재 커리어 포트폴리오에서 구조화한 대표 사례 수.",
          source: "현재 저장소의 careerCases 배열",
          limitation: "사례 수는 성과 검증 수가 아니며 각 사례의 증거 한계를 별도로 읽어야 한다.",
          provenance: "repository-count"
        },
        {
          value: "3",
          label: "공개 글",
          context: "현재 저장소에 있는 nimdalog MDX 글 수.",
          source: "content/blog의 MDX 파일",
          limitation: "세 글 모두 2026-07-02에 발행된 초기 기록이다.",
          provenance: "repository-count"
        },
        {
          value: "6+ yrs",
          label: "에이전시 운영 기록",
          context: "커리어 포트폴리오에 기록된 MKR 업무 기간은 2018.06.29–2024.09다.",
          source: "현재 저장소의 MKR 커리어 사례",
          limitation: "저장소 안에 독립적인 재직 증명 문서는 없다.",
          provenance: "career-record"
        }
      ],
      process: {
        eyebrow: "운영 방식",
        title: "문제를 읽고, 구조를 만들고, 실행하고, 학습을 남깁니다.",
        description: "캠페인과 제품에 공통으로 적용하는 네 단계 작업 흐름입니다.",
        steps: [
          {
            index: "01",
            title: "Decode",
            body: "채널을 고르기 전에 고객 마찰, 시장 압력, 검색 의도, 의사결정 리스크에서 실제 문제를 찾습니다.",
            outcome: "하나의 문제 정의, 타깃 논리, KPI 경계."
          },
          {
            index: "02",
            title: "Frame",
            body: "흩어진 입력을 채널 역할, 콘텐츠 각도, 담당자, 운영 리듬, 리포팅 논리로 바꿉니다.",
            outcome: "해석 차이 없이 실행할 수 있는 계획."
          },
          {
            index: "03",
            title: "Ship",
            body: "카피, 디자인, KOL·커뮤니티, 검색, 웹, 파트너 결과물을 조율하고 공개 전 QA합니다.",
            outcome: "일정에 맞춰 나가고 되돌림이 줄어든 결과물."
          },
          {
            index: "04",
            title: "Compound",
            body: "반응 신호에서 소음과 증거를 나누고 다음 행동을 리포트와 백로그에 남깁니다.",
            outcome: "다음 의사결정과 반복 작업에 재사용되는 학습."
          }
        ]
      },
      contact: {
        eyebrow: "Contact",
        title: "문제와 만들고 싶은 결과를 보내주세요.",
        description: "제품, 시장, 병목, 원하는 결과를 이메일로 알려주시면 맥락을 확인한 뒤 답합니다.",
        emailLabel: "이메일",
        email,
        primaryCta: "Nimdal에게 이메일 보내기"
      }
    },
    lab: {
      eyebrow: "Nimdal Lab",
      title: "리서치, 자동화, 게임형 제품 실험",
      description: "각 프로젝트를 문제에서 다음 단계까지 읽고, 공개 증거와 한계를 같은 무게로 표시합니다.",
      openProject: "프로젝트 열기",
      statusLabel: "상태",
      status: {
        live: "공개 운영",
        prototype: "프로토타입",
        "in-progress": "제작 중",
        archived: "보관"
      },
      detailLabels: {
        problem: "문제",
        decision: "결정",
        system: "시스템",
        proof: "증거",
        limitation: "한계",
        next: "다음"
      }
    },
    career: {
      eyebrow: "Career Portfolio",
      title: "브리프를 검색 가능하고 리포트 가능한 운영 시스템으로",
      description: "Web2 에이전시, 지역 비즈니스, 프리미엄 리테일, 웹3 한국 시장에서 기획·실행·커뮤니케이션·리포팅을 연결한 사례입니다.",
      metricNotice: "정량 수치는 출처와 한계를 함께 표시합니다. 원자료가 없는 수치는 포트폴리오 주장입니다.",
      proofNotice: "브랜드 이미지와 제품 화면은 맥락을 보여줄 뿐 역할이나 성과를 단독으로 증명하지 않습니다.",
      signals: [
        {
          value: "since 2012",
          label: "마케팅·운영 시작",
          context: "기존 포트폴리오는 2012년부터 CSR, 콘텐츠, 바이럴, 인플루언서와 디지털 캠페인을 운영했다고 기록합니다.",
          source: "기존 저장소의 Operator Dossier",
          limitation: "독립적인 경력 증빙이 첨부되지 않은 포트폴리오 주장입니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "10+ years",
          label: "실무 경험",
          context: "스타트업 빌드, 마케팅 운영, KOL·SEO, AI 기반 MVP 워크플로를 아우르는 포트폴리오 요약입니다.",
          source: "현재 저장소의 introduction 문서",
          limitation: "영역별 중복 기간을 분리한 독립 경력표는 없습니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "100+ clients",
          label: "고객 운영",
          context: "에이전시 업무에서 100곳 이상의 고객 운영을 다뤘다는 기록입니다.",
          source: "MKR 커리어 사례",
          limitation: "고객 명단이나 프로젝트 원장이 없는 포트폴리오 주장입니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "200+ campaigns",
          label: "캠페인 운영",
          context: "브랜드, 병원, 커머스, 로컬 비즈니스, 웹3에 걸친 디지털 캠페인 기록입니다.",
          source: "기존 저장소의 Operator Dossier",
          limitation: "캠페인 원장이나 전체 결과 보고서가 없는 포트폴리오 주장입니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "6+ agency years",
          label: "에이전시 운영",
          context: "현재 포트폴리오는 MKR 업무 기간을 2018.06.29–2024.09로 기록합니다.",
          source: "MKR 커리어 사례 기간",
          limitation: "저장소 안에 독립적인 재직 증명 문서는 없습니다.",
          provenance: "career-record"
        },
        {
          value: "3K+ KOL network",
          label: "파트너 네트워크",
          context: "인플루언서, KOL, 커뮤니티, 파트너 커뮤니케이션 루프를 운영했다는 기록입니다.",
          source: "기존 저장소의 Operator Dossier",
          limitation: "현재 활성 인원이나 중복 계정을 검증할 명단이 없는 포트폴리오 주장입니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "8K+ X audience",
          label: "X 공개 오디언스",
          context: "X, Telegram, Naver Blog, Threads와 커뮤니티 채널을 통한 웹3 접점 기록입니다.",
          source: "기존 저장소의 Operator Dossier",
          limitation: "캡처일과 분석 화면이 첨부되지 않은 포트폴리오 주장입니다.",
          provenance: "portfolio-claim"
        }
      ]
    },
    blog: {
      eyebrow: "nimdalog",
      title: "리서치, 빌드, 운영 뒤에 남은 노트",
      description: "포트폴리오가 결과를 보여준다면 nimdalog는 판단과 제작 과정을 기록합니다.",
      readMore: "글 읽기"
    },
    footer: {
      tagline: "Nimdal — 리서치, 운영, 제품 시스템."
    }
  },
  en: {
    seo: {
      title: "Nimdal / Tak Chanwoo — Research, Automation, Campaign Operations",
      description: "A bilingual portfolio of Nimdal and Tak Chanwoo's project Lab, career cases, research notes, and build logs."
    },
    language: {
      label: "Language",
      current: "English",
      switchTo: "한국어"
    },
    nav: [
      { label: "Home", href: "/en" },
      { label: "Lab", href: "/en/lab" },
      { label: "Career", href: "/en/portfolio" },
      { label: "Notes", href: "/en/blog" },
      { label: "Contact", href: "/en#contact" }
    ],
    home: {
      identity: {
        eyebrow: "Nimdal / Tak Chanwoo",
        name: "Nimdal",
        legalName: "Tak Chanwoo",
        role: "Builder · Campaign operator · Strategist",
        headline: "I read complex markets and operating problems, then turn them into working systems.",
        description: "This portfolio connects Web3 research tools, automation, game-like experiments, SEO, and campaign operations. The pixel octopus is the public identity; the working mode is research, structure, execution, and reporting.",
        location: "Seoul · Remote",
        availability: "Currently building research tools, automation systems, and campaign and GTM operations.",
        portraitAlt: "Portrait of Tak Chanwoo.",
        avatarAlt: "Nimdal pixel-octopus identity.",
        primaryCta: "View Lab",
        secondaryCta: "View career"
      },
      metrics: [
        {
          value: "9",
          label: "Lab projects",
          context: "Research, automation, and game projects defined in this content model.",
          source: "The projects array in the current repository",
          limitation: "Maturity and public-proof levels vary and are separated by status labels.",
          provenance: "repository-count"
        },
        {
          value: "6",
          label: "Career cases",
          context: "Representative cases structured from the current career portfolio.",
          source: "The careerCases array in the current repository",
          limitation: "Case count is not verified-outcome count; each case has its own evidence boundary.",
          provenance: "repository-count"
        },
        {
          value: "3",
          label: "Published notes",
          context: "nimdalog MDX posts currently present in the repository.",
          source: "MDX files in content/blog",
          limitation: "All three are initial notes published on 2026-07-02.",
          provenance: "repository-count"
        },
        {
          value: "6+ yrs",
          label: "Agency operating record",
          context: "The career portfolio records the MKR work period as 2018.06.29–2024.09.",
          source: "The MKR career case in the current repository",
          limitation: "The repository contains no independent employment-verification document.",
          provenance: "career-record"
        }
      ],
      process: {
        eyebrow: "Operating system",
        title: "Read the problem, build the frame, ship the work, preserve the learning.",
        description: "A four-step working loop shared by campaign and product work.",
        steps: [
          {
            index: "01",
            title: "Decode",
            body: "Find the real problem in audience friction, market pressure, search intent, and decision risk before choosing channels.",
            outcome: "One problem statement, target logic, and KPI guardrails."
          },
          {
            index: "02",
            title: "Frame",
            body: "Turn scattered inputs into channel roles, content angles, owners, operating cadence, and reporting logic.",
            outcome: "A plan people can execute without interpretation drift."
          },
          {
            index: "03",
            title: "Ship",
            body: "Coordinate copy, design, KOL and community, search, web, and partner deliverables, then QA before launch.",
            outcome: "Work that ships on cadence with fewer late reversals."
          },
          {
            index: "04",
            title: "Compound",
            body: "Separate noise from evidence in the response signals and preserve the next action in reports and backlogs.",
            outcome: "Learning that can be reused in the next decision and cycle."
          }
        ]
      },
      contact: {
        eyebrow: "Contact",
        title: "Send the problem and the outcome you want to build.",
        description: "Email the product, market, bottleneck, and desired result. I will reply after the context is clear.",
        emailLabel: "Email",
        email,
        primaryCta: "Email Nimdal"
      }
    },
    lab: {
      eyebrow: "Nimdal Lab",
      title: "Research, automation, and game-like product experiments",
      description: "Read each project from problem to next step, with public evidence and limitations given equal weight.",
      openProject: "Open project",
      statusLabel: "Status",
      status: {
        live: "Live",
        prototype: "Prototype",
        "in-progress": "In progress",
        archived: "Archived"
      },
      detailLabels: {
        problem: "Problem",
        decision: "Decision",
        system: "System",
        proof: "Proof",
        limitation: "Limitation",
        next: "Next"
      }
    },
    career: {
      eyebrow: "Career Portfolio",
      title: "From brief to searchable, reportable operating system",
      description: "Cases connecting planning, execution, communication, and reporting across Web2 agencies, local businesses, premium retail, and Web3 Korean-market work.",
      metricNotice: "Every quantitative figure carries source and limitation context. Figures without source data are portfolio claims.",
      proofNotice: "Brand images and product screens provide context; they do not independently prove a role or result.",
      signals: [
        {
          value: "since 2012",
          label: "Marketing and operations",
          context: "The existing portfolio records work across CSR, content, viral, influencer, and digital campaign operations since 2012.",
          source: "Operator Dossier in the existing repository",
          limitation: "This is a portfolio claim without attached independent career verification.",
          provenance: "portfolio-claim"
        },
        {
          value: "10+ years",
          label: "Operating experience",
          context: "A portfolio summary spanning startup building, marketing operations, KOL and SEO work, and AI-assisted MVP workflows.",
          source: "Introduction document in the current repository",
          limitation: "No independent timeline separates overlapping periods by discipline.",
          provenance: "portfolio-claim"
        },
        {
          value: "100+ clients",
          label: "Client operations",
          context: "The agency record states that more than 100 client operations were handled.",
          source: "MKR career case",
          limitation: "This is a portfolio claim without a client list or project ledger.",
          provenance: "portfolio-claim"
        },
        {
          value: "200+ campaigns",
          label: "Campaign operations",
          context: "A recorded campaign history across brands, clinics, commerce, local businesses, and Web3.",
          source: "Operator Dossier in the existing repository",
          limitation: "This is a portfolio claim without a campaign ledger or complete reporting archive.",
          provenance: "portfolio-claim"
        },
        {
          value: "6+ agency years",
          label: "Agency operations",
          context: "The current portfolio records the MKR work period as 2018.06.29–2024.09.",
          source: "MKR career-case period",
          limitation: "The repository contains no independent employment-verification document.",
          provenance: "career-record"
        },
        {
          value: "3K+ KOL network",
          label: "Partner network",
          context: "A recorded operating network across influencers, KOLs, communities, and campaign partners.",
          source: "Operator Dossier in the existing repository",
          limitation: "This is a portfolio claim without a current, deduplicated network ledger.",
          provenance: "portfolio-claim"
        },
        {
          value: "8K+ X audience",
          label: "Public X audience",
          context: "A recorded Web3 audience touchpoint across X, Telegram, Naver Blog, Threads, and communities.",
          source: "Operator Dossier in the existing repository",
          limitation: "This is a portfolio claim without a dated analytics capture.",
          provenance: "portfolio-claim"
        }
      ]
    },
    blog: {
      eyebrow: "nimdalog",
      title: "Notes left behind by research, builds, and operations",
      description: "If the portfolio shows outcomes, nimdalog preserves the judgment and production process behind them.",
      readMore: "Read note"
    },
    footer: {
      tagline: "Nimdal — research, operations, and product systems."
    }
  }
} as const satisfies Record<Locale, SiteLocaleContent>;

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAlternateLocalePath(pathname: string, locale: Locale): string {
  const trimmed = pathname.trim() || "/";
  const suffixIndex = [trimmed.indexOf("?"), trimmed.indexOf("#")]
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  const pathOnly = suffixIndex === undefined ? trimmed : trimmed.slice(0, suffixIndex);
  const suffix = suffixIndex === undefined ? "" : trimmed.slice(suffixIndex);
  const normalized = `/${pathOnly}`.replace(/\/{2,}/g, "/");
  const segments = normalized.split("/").filter(Boolean);

  if (isLocale(segments[0])) {
    segments.shift();
  }

  const rest = segments.length > 0 ? `/${segments.join("/")}` : "";
  return `/${locale}${rest}${suffix}`;
}
