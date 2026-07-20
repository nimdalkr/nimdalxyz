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
          ko: "alphaduo.pro 실제 서비스 화면",
          en: "Live alphaduo.pro capture"
        },
        capturedAt: "2026-07-19",
        claim: {
          ko: "AlphaDuo 공개 화면에서 NFT 지갑 프로필, 지갑 연결, Arc Testnet, 양도할 수 없는 SBT 인증 메뉴를 확인할 수 있습니다.",
          en: "The public AlphaDuo surface contains an NFT wallet profile, wallet connection, Arc Testnet, and non-transferable SBT access flow."
        },
        limitation: {
          ko: "지갑을 연결하지 않은 정적 화면이므로, 지갑별 데이터의 정확도나 브리지 완료 여부까지는 확인할 수 없습니다.",
          en: "This is a static capture with no wallet connected; it does not prove wallet-data accuracy or a completed bridge transaction."
        }
      }
    ],
    copy: {
      ko: {
        title: "AlphaDuo",
        category: "NFT 지갑 분석",
        summary: "NFT 멤버십, 지갑 분석, Arc Testnet 브리지를 한곳에서 다루는 공개 웹3 서비스입니다.",
        tags: ["NFT", "지갑 분석", "Arc Testnet", "SBT"],
        detail: {
          problem: "NFT 활동 확인, 지갑 모니터링, 멤버 인증, Arc 정산을 각각 다른 도구에서 처리해야 했습니다.",
          decision: "양도할 수 없는 SBT로 멤버를 확인하고, 지갑 분석은 읽기 전용으로 제한했습니다. 확인할 수 없는 데이터는 표시하지 않았습니다.",
          system: "NFT Wallet Profile에 PnL, 지갑 목록, Bridge to Arc, SBT Access를 한 흐름으로 묶었습니다.",
          proof: "alphaduo.pro와 2026-07-19 실제 서비스 화면에서 Arc Testnet과 양도할 수 없는 SBT 인증 흐름을 확인할 수 있습니다.",
          limitation: "현재는 테스트넷 베타입니다. 캡처에 지갑이 연결되지 않아 실제 정산 결과나 분석 정확도까지는 확인할 수 없습니다.",
          next: "테스트 지갑을 연결한 전체 흐름과 데이터 출처, 거래 영수증, 복구 조건을 함께 공개할 계획입니다."
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
          ko: "HyperAlphaDuo의 실제 시장 조사 화면.",
          en: "HyperAlphaDuo live market-research interface."
        },
        source: {
          ko: "저장소에 보관한 실제 서비스 화면",
          en: "Production capture stored in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "공개 사이트에서 검색과 필터를 갖춘 시장 조사 화면을 확인할 수 있습니다.",
          en: "A searchable and filterable market-research interface exists at a public URL."
        },
        limitation: {
          ko: "정적 화면만으로는 데이터의 정확도와 갱신 주기, 실제 거래 가능 여부까지 확인할 수 없습니다.",
          en: "The capture cannot verify data accuracy, refresh cadence, or whether an arbitrage is executable."
        }
      },
      {
        role: "concept",
        src: "/media/projects/hyperalphaduo.webp",
        alt: {
          ko: "HyperAlphaDuo 프로젝트 소개 이미지.",
          en: "HyperAlphaDuo project introduction visual."
        },
        source: {
          ko: "저장소에 있던 프로젝트 이미지",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "어떤 시장을 조사하는 프로젝트인지 보여주는 소개 이미지입니다.",
          en: "It introduces the project's market-research theme."
        },
        limitation: {
          ko: "소개용 이미지라 제품이 실제로 작동하는지는 확인할 수 없습니다.",
          en: "It is a presentation image, not proof of product behavior."
        }
      }
    ],
    copy: {
      ko: {
        title: "HyperAlphaDuo",
        category: "트레이딩 리서치",
        summary: "Hyperliquid 포지션, 토큰화 주식, 국내 거래소 가격차를 한 화면에서 비교하는 공개 리서치 도구입니다.",
        tags: ["Hyperliquid", "차익거래", "거래소", "모니터링"],
        detail: {
          problem: "토큰화 주식 가격, 국내 거래소 상장 여부, 입출금 상태를 서로 다른 시장과 화면에서 확인해야 했습니다.",
          decision: "범용 시세판보다 Hyperliquid와 국내 거래소를 비교하는 리서치 도구에 집중했습니다.",
          system: "포지션 검색·필터, HIP-3 토큰화 주식 비교, 업비트·빗썸 상장 및 입출금 모니터링으로 구성했습니다.",
          proof: "공개 Vercel 사이트와 저장소에 보관한 실제 화면 캡처를 확인할 수 있습니다.",
          limitation: "현재 저장소에는 데이터 출처, 갱신 주기, 대표 분석 예시에 대한 설명이 없습니다.",
          next: "대표 가격차 사례 한 건에 데이터 출처, 계산 방식, 분석이 성립하지 않는 조건을 함께 정리할 계획입니다."
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
          ko: "팀 선택부터 로스터, 드래프트, 경기, 기록, 이적까지 이어지는 여러 관리 화면을 확인할 수 있습니다.",
          en: "A multi-screen loop connects team selection, roster, draft, matches, records, and transfers."
        },
        limitation: {
          ko: "정적 화면을 모은 자료이며, 직접 실행할 수 있는 파일이나 플레이 영상은 공개하지 않았습니다.",
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
          ko: "챔피언 드래프트를 별도의 팀 운영 화면으로 구현했습니다.",
          en: "Champion drafting is implemented as a distinct management-decision screen."
        },
        limitation: {
          ko: "정적 화면만으로는 상대 AI의 행동과 추천 방식까지 확인할 수 없습니다.",
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
          ko: "선택한 로스터가 방송 화면 형태의 경기 시뮬레이션으로 이어집니다.",
          en: "Selected rosters carry into a broadcast-style match-simulation screen."
        },
        limitation: {
          ko: "경기 결과를 계산하는 방식과 규칙은 이 화면만으로 확인할 수 없습니다.",
          en: "The simulation calculations and result-generation rules are not exposed."
        }
      }
    ],
    copy: {
      ko: {
        title: "myLoL",
        category: "게임 프로토타입",
        summary: "실제 LCK 팀과 선수 데이터로 로스터를 짜고, 드래프트부터 경기·이적·다중 시즌까지 진행하는 Godot 기반 운영 시뮬레이션입니다.",
        tags: ["Godot", "LCK", "시뮬레이션", "Android"],
        detail: {
          problem: "LCK 팬이 실제 선수 데이터로 로스터를 짜고 팀을 운영해 볼 수 있는 팬메이드 게임은 드물었습니다.",
          decision: "가상 팀을 만드는 대신 실제 LCK 팀과 선수 데이터를 시뮬레이션의 중심에 두었습니다.",
          system: "팀 선택, 로스터, 드래프트, 경기, 일정, 순위, 수상, 기록, 전략, 이적을 하나의 시즌 흐름으로 연결했습니다.",
          proof: "2026-07-10 QA 시트와 드래프트·경기 캡처에서 각 화면이 이어지는 관리 흐름을 확인할 수 있습니다.",
          limitation: "현재 공개한 자료는 정적 화면뿐이며, 설치할 수 있는 데모는 없습니다.",
          next: "직접 실행할 수 있는 데모와 시뮬레이션 규칙을 설명하는 짧은 제작 기록을 공개할 계획입니다."
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
          ko: "maple uNion 프로젝트 소개 이미지.",
          en: "maple uNion project introduction visual."
        },
        source: {
          ko: "저장소에 있던 프로젝트 이미지",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "MapleStoryUniverse 리소스로 만든 AFK 게임 프로젝트를 소개하는 이미지입니다.",
          en: "It introduces an AFK game project made with MapleStoryUniverse resources."
        },
        limitation: {
          ko: "소개 이미지만으로는 게임을 직접 실행할 수 있는지 확인할 수 없습니다.",
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
          ko: "실행 화면에서 AFK 전투, 스킬 사용 피드백, 가이드와 HUD를 확인할 수 있습니다.",
          en: "AFK combat, skill feedback, guide layer, and HUD coexist in the running screen."
        },
        limitation: {
          ko: "정적 화면이라 실제 입력 방식과 전투 타이밍은 확인할 수 없습니다.",
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
          ko: "여러 맵과 몬스터 조합을 게임에 적용한 모습을 확인할 수 있습니다.",
          en: "Multiple map and monster combinations were assembled in the build."
        },
        limitation: {
          ko: "여러 화면을 모은 이미지라 실제 이동과 스테이지 전환 과정은 보여주지 않습니다.",
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
          ko: "원본 맵 리소스를 자동 사냥 화면에 맞게 테스트하고 조정한 기록입니다.",
          en: "Source map assets were tested and adapted for the auto-hunting viewport."
        },
        limitation: {
          ko: "화면 품질을 점검한 기록만 있으며 성능 수치는 포함하지 않았습니다.",
          en: "It documents visual QA only and contains no performance measurements."
        }
      }
    ],
    copy: {
      ko: {
        title: "maple uNion",
        category: "게임잼 프로토타입",
        summary: "MapleStoryUniverse VibeCamp 자원으로 짧은 제작 기간 안에 만든 AFK 게임 프로토타입입니다.",
        tags: ["MapleStoryUniverse", "VibeCamp", "AFK", "게임잼"],
        detail: {
          problem: "짧은 게임잼 기간 안에 진입, 전투, 보상, 성장이 이어지는 플레이 흐름을 완성해야 했습니다.",
          decision: "게임이 실제로 어떻게 보이고 작동하는지 남기기 위해 화면과 제작 과정을 함께 기록했습니다.",
          system: "AFK 전투, 여러 필드와 스테이지, 가이드 UI, 맵 렌더링 점검 과정을 하나로 연결했습니다.",
          proof: "2026-07-02에 기록한 필드 화면, 스테이지 시트, 맵 QA 시트와 외부 제작 기록이 있습니다.",
          limitation: "현재 공개한 자료는 화면과 글뿐이며, 저장소에 실행 가능한 빌드는 없습니다.",
          next: "직접 플레이할 수 있는 데모나 짧은 조작 영상을 제작 기록에 연결할 계획입니다."
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
          ko: "ethosalpha의 코드를 공개한 GitHub 저장소가 있습니다.",
          en: "A public code repository exists for the ethosalpha project."
        },
        limitation: {
          ko: "저장소 화면만으로는 실제 사용 과정과 데이터, 분석 방법까지 확인할 수 없습니다.",
          en: "A repository screen does not prove the usage flow, dataset, or analytical method."
        }
      }
    ],
    copy: {
      ko: {
        title: "ethosalpha",
        category: "웹3 소셜 분석",
        summary: "웹3 프로젝트의 신뢰도, 평판, 소셜 반응을 한 화면에서 비교하는 분석 프로토타입입니다.",
        tags: ["웹3", "평판", "소셜 신호", "분석"],
        detail: {
          problem: "웹3 프로젝트의 신뢰도를 살피려면 평판 서비스, 커뮤니티 반응, 프로젝트별 지표를 따로 확인해야 했습니다.",
          decision: "기능을 넓히기 전에 범위를 좁혀, 소셜 평판을 한눈에 비교하는 화면부터 만들기로 했습니다.",
          system: "Ethos 데이터와 소셜 지표를 같은 기준으로 비교하는 대시보드 형태를 구상했습니다.",
          proof: "공개 GitHub 저장소와 저장소 화면을 확인할 수 있습니다.",
          limitation: "현재 저장소에는 실제 제품 화면, 예시 데이터, 분석 방법을 설명한 문서, 사용 지표가 없습니다.",
          next: "설명이 포함된 대시보드 화면과 예시 데이터, 짧은 분석 방법 문서를 공개할 계획입니다."
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
          ko: "KOL Listing 프로젝트 소개 이미지.",
          en: "KOL Listing project introduction visual."
        },
        source: {
          ko: "저장소에 있던 프로젝트 이미지",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "KOL 활동과 원화 거래소 상장을 함께 조사하는 프로젝트임을 보여주는 이미지입니다.",
          en: "It introduces the project's KOL-activity and KRW-listing research theme."
        },
        limitation: {
          ko: "소개 이미지만으로는 실제 제품 화면이나 분석 결과를 확인할 수 없습니다.",
          en: "It is not evidence of a product screen or correlation-analysis result."
        }
      }
    ],
    copy: {
      ko: {
        title: "KOL Listing",
        category: "크립토 리서치",
        summary: "KOL 광고·AMA 활동과 원화 거래소 상장 기대감을 함께 비교하는 리서치 도구로, 이용하려면 비밀번호가 필요합니다.",
        tags: ["크립토", "KOL", "상장 리서치", "상관관계"],
        detail: {
          problem: "KOL 광고와 AMA 활동은 공개되어 있지만, 어떤 프로젝트를 주로 다루는지와 원화 거래소 상장 기대를 함께 비교하기 어려웠습니다.",
          decision: "흩어진 캠페인 활동을 원화 거래소 상장 관점에서 반복해 살펴볼 수 있도록 정리했습니다.",
          system: "KOL별 활동, 광고 성향, 프로젝트 선택 패턴, 상장 관련 분석을 한곳에 모았습니다.",
          proof: "기존 포트폴리오에는 공개 URL이 있지만 비밀번호가 있어야 접근할 수 있다고 적혀 있습니다.",
          limitation: "현재 저장소에는 제품 화면과 예시 사례가 없습니다. 또한 상관관계를 인과관계로 해석해서는 안 됩니다.",
          next: "출처와 주의할 점을 적은 익명 사례를 공개하고, 비밀번호가 필요하다는 점도 분명히 안내할 계획입니다."
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
          ko: "TG Finance Search Portal 프로젝트 소개 이미지.",
          en: "TG Finance Search Portal project introduction visual."
        },
        source: {
          ko: "저장소에 있던 프로젝트 이미지",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "텔레그램 금융 글을 모아 검색하는 포털의 제작 방향을 보여주는 이미지입니다.",
          en: "It shows the direction of a Telegram finance-content search portal."
        },
        limitation: {
          ko: "콘셉트 이미지라 실제 검색이나 수집 기능이 작동하는지는 확인할 수 없습니다.",
          en: "It is a concept image, not proof of a working search or ingestion system."
        }
      }
    ],
    copy: {
      ko: {
        title: "TG Finance Search Portal",
        category: "제작 중인 검색 포털",
        summary: "텔레그램에서 흘러가는 금융 글을 수집·분류해 나중에 검색할 수 있도록 만드는 포털입니다.",
        tags: ["텔레그램", "금융", "검색", "아카이브"],
        detail: {
          problem: "텔레그램의 유용한 금융 글은 채팅에 묻혀 나중에 다시 찾거나 비교하기 어려웠습니다.",
          decision: "커뮤니티 기능을 더하기 전에 어떤 글을 어떻게 모을지 정하고, 검색 기능부터 설계했습니다.",
          system: "금융 분야 텔레그램 글을 수집하고 분류해 검색할 수 있는 포털을 만들고 있습니다.",
          proof: "현재 공개한 자료는 프로젝트 소개 이미지와 제작 중이라는 설명뿐입니다.",
          limitation: "아직 동작하는 데모, 수집 정책, 검색 품질을 확인할 자료는 없습니다.",
          next: "먼저 수집할 채널과 출처 표기 원칙을 정한 뒤, 실제 검색 과정을 공개할 계획입니다."
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
          ko: "Social Poster-One 자동화 프로젝트 소개 이미지.",
          en: "Social Poster-One automation project introduction visual."
        },
        source: {
          ko: "저장소에 있던 프로젝트 이미지",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "텔레그램 글을 여러 소셜 채널에 배포하는 자동화 아이디어를 보여주는 이미지입니다.",
          en: "It introduces an automation concept for distribution from Telegram to multiple social channels."
        },
        limitation: {
          ko: "소개 이미지만으로는 실행 기록, API 응답, 실제 게시 결과를 확인할 수 없습니다.",
          en: "It does not show execution logs, API responses, or published results."
        }
      }
    ],
    copy: {
      ko: {
        title: "Social Poster-One",
        category: "소셜 배포 자동화",
        summary: "텔레그램 콘텐츠를 LinkedIn, Threads, X의 형식에 맞춰 배포하는 API 기반 게시 자동화 프로토타입입니다.",
        tags: ["텔레그램", "LinkedIn", "Threads", "X", "자동화"],
        detail: {
          problem: "같은 텔레그램 글을 여러 소셜 채널에 반복해서 올리면 시간이 오래 걸리고, 채널마다 요구하는 형식이 달라 일관되게 맞추기 어려웠습니다.",
          decision: "수동 체크리스트 대신 채널별 형식을 따로 처리하는 API 자동화로 배포 과정을 묶었습니다.",
          system: "텔레그램 글을 LinkedIn, Threads, X에 맞게 바꾼 뒤 게시하는 흐름입니다.",
          proof: "현재 공개한 자료는 프로젝트 설명과 소개 이미지입니다.",
          limitation: "실행 영상과 게시 기록이 없고, 플랫폼별 API 제약도 아직 정리하지 않았습니다.",
          next: "글 한 건이 모든 채널에 게시되는 전체 과정과 플랫폼별 권한, 형식, 실패 처리 방식을 공개할 계획입니다."
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
          ko: "Discord Bulk Leave Tool 프로젝트 소개 이미지.",
          en: "Discord Bulk Leave Tool project introduction visual."
        },
        source: {
          ko: "저장소에 있던 프로젝트 이미지",
          en: "Project image asset in the current repository"
        },
        capturedAt: undated,
        claim: {
          ko: "여러 디스코드 서버를 골라 한 번에 나가는 도구의 아이디어를 보여주는 이미지입니다.",
          en: "It introduces a utility concept for selecting and leaving multiple Discord servers."
        },
        limitation: {
          ko: "소개 이미지만으로는 실제 API 요청과 확인 절차, 안전장치를 확인할 수 없습니다.",
          en: "It does not show real API requests, confirmation flow, or safety controls."
        }
      }
    ],
    copy: {
      ko: {
        title: "Discord Bulk Leave Tool",
        category: "개인 유틸리티",
        summary: "공식 Discord API로 여러 서버를 골라 한 번에 나갈 수 있게 만든 개인용 정리 도구 프로토타입입니다.",
        tags: ["Discord", "공식 API", "유틸리티", "자동화"],
        detail: {
          problem: "가입한 디스코드 서버가 많아지면 하나씩 확인하고 나가는 데 시간이 오래 걸렸습니다.",
          decision: "공식 API 안에서만 동작하게 하고, 여러 서버를 고른 뒤 마지막에 다시 확인하도록 설계했습니다.",
          system: "서버 목록, 다중 선택, 최종 확인, 일괄 나가기 순서로 구성했습니다.",
          proof: "현재 공개한 자료는 프로젝트 설명과 소개 이미지입니다.",
          limitation: "작동하는 데모와 권한 설명이 없고, 나간 서버는 자동으로 복구되지 않는다는 안내도 아직 공개하지 않았습니다.",
          next: "필요한 권한과 되돌리기 어려운 점을 설명하고, 최종 확인 화면까지 포함한 데모를 공개할 계획입니다."
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
        ko: "기존 커리어 포트폴리오에 사용된 브랜드 이미지",
        en: "Brand image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "어떤 브랜드의 기능성 신발 캠페인인지 보여주는 이미지입니다.",
        en: "It identifies the brand context for the functional-footwear campaign."
      },
      limitation: {
        ko: "로고만으로는 제가 맡은 일이나 캠페인 성과를 확인할 수 없습니다.",
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
            context: "기존 커리어 포트폴리오에는 약 3개월 만에 광고비 대비 매출(ROAS)이 약 2,000%에 도달했다고 적혀 있습니다.",
            source: "기존 커리어 포트폴리오",
            limitation: "광고비와 매출 원자료 또는 익명 리포트가 없어 외부에서 확인할 수 없는 포트폴리오 기재 수치입니다."
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
        objective: "쇼핑몰 매출을 높이고 온·오프라인 프로모션의 방향을 하나로 맞추는 것이 목표였습니다.",
        role: "마케팅 방향을 잡고, 시장·경쟁사 조사, 콘텐츠 기획, 고객 커뮤니케이션, 리포팅을 맡았습니다.",
        result: "기존 포트폴리오에는 약 3개월 만에 광고비 대비 매출(ROAS)이 약 2,000%에 도달했다고 적혀 있습니다.",
        constraint: "광고 집행뿐 아니라 검색과 콘텐츠 운영이 매출에 어떻게 이어졌는지 함께 설명해야 했습니다.",
        system: "경쟁사를 조사하고 키워드별 콘텐츠를 기획한 뒤, 프로모션 결과와 고객 피드백을 정기적으로 리포트했습니다.",
        proof: "현재 공개한 자료는 커리어 포트폴리오의 작업 설명과 브랜드 이미지입니다.",
        limitation: "광고비와 매출 원자료가 없어 외부에서 검증된 성과가 아닌 포트폴리오 기재 수치로 표시했습니다."
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
        ko: "기존 커리어 포트폴리오에 사용된 브랜드 이미지",
        en: "Brand image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "어떤 동물병원의 로컬 마케팅 사례인지 보여주는 이미지입니다.",
        en: "It identifies the brand context for the local animal-hospital marketing case."
      },
      limitation: {
        ko: "로고만으로는 검색 노출이나 문의, 방문 성과를 확인할 수 없습니다.",
        en: "The logo does not prove search exposure, inquiries, or visits."
      }
    },
    metrics: [],
    copy: {
      ko: {
        title: "부산 H 동물병원 로컬 마케팅",
        context: "신규 개원 지역 동물병원",
        channels: ["네이버 블로그", "네이버 스마트플레이스"],
        objective: "개원 후 네이버 검색과 스마트플레이스를 통해 지역 고객이 꾸준히 찾아오는 구조를 만드는 것이 목표였습니다.",
        role: "로컬 마케팅 방향을 잡고, 경쟁 병원 조사, 블로그·스마트플레이스 운영, 고객 커뮤니케이션, 리포팅을 맡았습니다.",
        result: "기존 포트폴리오에는 계약 기간 동안 로컬 마케팅을 안정적으로 운영했다고 적혀 있습니다.",
        constraint: "많이 노출하는 것보다 지역 고객의 검색 의도에 맞추고 신뢰를 쌓는 일이 중요했습니다.",
        system: "네이버 블로그를 꾸준히 발행하고 스마트플레이스를 관리하면서, 지역 경쟁 병원과 성과를 정기적으로 확인했습니다.",
        proof: "기존 커리어 포트폴리오에서 2020.03–2023.10의 작업 기간과 맡은 일을 확인할 수 있습니다.",
        limitation: "현재 저장소에는 키워드 노출 변화, 스마트플레이스 운영 전후, 문의·방문 자료가 없습니다."
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
        ko: "기존 커리어 포트폴리오에 사용된 브랜드 이미지",
        en: "Brand image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "어떤 프리미엄 브랜드의 온라인 유입 사례인지 보여주는 이미지입니다.",
        en: "It identifies the brand context for the premium-retail acquisition case."
      },
      limitation: {
        ko: "로고만으로는 온라인 유입이나 매출 변화를 확인할 수 없습니다.",
        en: "The logo does not prove acquisition or sales change."
      }
    },
    metrics: [
      {
        value: "KRW 1–2M/mo",
        provenance: "portfolio-claim",
        copy: {
          ko: {
            label: "마케팅 시작 전 월 매출",
            context: "기존 커리어 포트폴리오에는 마케팅 전 월 매출이 약 100만~200만 원이었다고 적혀 있습니다.",
            source: "기존 커리어 포트폴리오",
            limitation: "원본 매출 자료가 없어 외부에서 확인할 수 없는 포트폴리오 기재 수치입니다."
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
            context: "기존 커리어 포트폴리오에는 2024년 9월 월 매출이 1억 원이었다고 적혀 있습니다.",
            source: "기존 커리어 포트폴리오",
            limitation: "익명화한 매출 리포트가 없어 외부에서 확인할 수 없는 포트폴리오 기재 수치입니다."
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
        objective: "검색 콘텐츠가 홈페이지 문의와 매출로 이어지는 유입 경로를 만드는 것이 목표였습니다.",
        role: "마케팅 방향을 잡고, 타깃 조사, 콘텐츠 제작, 홈페이지 유입 설계, 고객 커뮤니케이션, 리포팅을 맡았습니다.",
        result: "기존 포트폴리오에는 마케팅 전 월 100만~200만 원이던 매출이 2024년 9월 1억 원까지 늘었다고 적혀 있습니다.",
        constraint: "프리미엄 브랜드의 인상을 해치지 않으면서 온라인 유입을 늘려야 했습니다.",
        system: "검색 콘텐츠에서 홈페이지와 문의로 이어지는 경로를 만들고, 반응과 결과를 정기적으로 리포트했습니다.",
        proof: "기존 커리어 포트폴리오에서 작업 기간, 맡은 일, 마케팅 전후 매출 수치를 확인할 수 있습니다.",
        limitation: "익명화한 매출 리포트가 없어 외부에서 검증된 성과가 아닌 포트폴리오 기재 수치로 표시했습니다."
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
        ko: "기존 커리어 포트폴리오에 사용된 조직 이미지",
        en: "Organization image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "어느 조직에서 에이전시 운영을 맡았는지 보여주는 이미지입니다.",
        en: "It identifies the organization context for the agency operating-system case."
      },
      limitation: {
        ko: "로고만으로는 고객 수와 근무 기간, 운영 품질을 확인할 수 없습니다.",
        en: "The logo does not prove client count, tenure, or operating quality."
      }
    },
    metrics: [
      {
        value: "100+",
        provenance: "portfolio-claim",
        copy: {
          ko: {
            label: "담당 고객사 수",
            context: "기존 커리어 포트폴리오에는 에이전시에서 100곳 이상의 고객사를 담당했다고 적혀 있습니다.",
            source: "기존 커리어 포트폴리오 요약",
            limitation: "고객 명단이나 전체 프로젝트 기록이 없어 외부에서 확인할 수 없는 포트폴리오 기재 수치입니다."
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
            context: "기존 포트폴리오에는 업무 기간이 2018.06.29–2024.09로 적혀 있습니다.",
            source: "기존 커리어 포트폴리오의 작업 기간",
            limitation: "별도의 재직 증명 문서는 공개하지 않았습니다."
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
        title: "MKR 에이전시 운영",
        context: "고객사 100곳 이상 · 에이전시 운영 6년 이상",
        channels: ["블로그", "인플루언서", "디자인", "개발", "대행 파트너"],
        objective: "여러 고객과 파트너가 얽힌 광고 대행 업무를 빠뜨리지 않고 운영할 수 있도록 체계를 잡는 것이 목표였습니다.",
        role: "캠페인 운영을 이끌며 요청 정리, 업무 배분, 일정 관리, 결과물 검수, 리포팅, 개선 제안을 맡았습니다.",
        result: "기존 포트폴리오에는 고객 리포팅과 파트너 관리, 같은 방식으로 캠페인을 반복 운영할 수 있는 체계를 만들었다고 적혀 있습니다.",
        constraint: "여러 파트너와 결과물을 동시에 관리하면서도 일정과 품질을 안정적으로 유지해야 했습니다.",
        system: "요청을 받고 업무를 나눈 뒤 파트너와 일정을 맞추고, 결과물을 검수해 리포트와 다음 제안으로 연결했습니다.",
        proof: "기존 커리어 포트폴리오에서 작업 기간과 맡은 업무 범위를 확인할 수 있습니다.",
        limitation: "고객 수는 포트폴리오 기재 수치이며, 현재 저장소에는 실제 업무 보드와 리포트 양식이 없습니다."
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
        ko: "기존 커리어 포트폴리오에 사용된 웹3 이미지",
        en: "Generic Web3 image asset used by the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "웹3 커뮤니티와 KOL 캠페인 사례임을 보여주는 참고 이미지입니다.",
        en: "It only signals the Web3 community and KOL campaign context."
      },
      limitation: {
        ko: "특정 고객이나 콘텐츠, 캠페인 결과를 확인할 수 있는 자료는 아닙니다.",
        en: "It is not evidence of a specific client, piece of content, or campaign result."
      }
    },
    metrics: [],
    copy: {
      ko: {
        title: "커뮤니티·KOL 콘텐츠 캠페인",
        context: "071Labs / AlphaDuo",
        channels: ["X", "Telegram", "Discord", "Medium", "Blog"],
        objective: "글로벌 웹3 프로젝트의 메시지를 한국 사용자에게 맞게 다듬고, 커뮤니티와 KOL 커뮤니케이션을 지원하는 것이 목표였습니다.",
        role: "한국어 콘텐츠 작성, X·블로그·텔레그램 운영, KOL 협업, AMA·이벤트 기획, 고객 커뮤니케이션을 맡았습니다.",
        result: "기존 포트폴리오에는 UXLINK, SaharaAI, edgeX, Theoriq, BLESS, Dolomite, MVL의 한국 시장 커뮤니케이션을 진행했다고 적혀 있습니다.",
        constraint: "관심을 끌되 리스크를 관리하고 규정을 지키며, 메시지가 한국 커뮤니티에서 의도와 다르게 해석되지 않도록 조율해야 했습니다.",
        system: "영문 자료를 한국어 콘텐츠로 다듬고, KOL 협업과 AMA·이벤트를 조율하면서 커뮤니티 반응을 확인했습니다.",
        proof: "기존 커리어 포트폴리오에서 참여 프로젝트와 맡은 일을 확인할 수 있습니다.",
        limitation: "프로젝트별 공개 콘텐츠 링크, KOL 게시물, AMA 참여 자료는 아직 한곳에 정리하지 않았습니다."
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
        ko: "기존 커리어 포트폴리오에 보관된 제품 화면",
        en: "Product screen stored in the current career portfolio"
      },
      capturedAt: undated,
      claim: {
        ko: "NEVADA 제품에 공개 거래 화면이 있음을 확인할 수 있습니다.",
        en: "A public trading interface exists for the NEVADA product."
      },
      limitation: {
        ko: "제품 화면만으로는 제가 맡은 한국 GTM 업무나 SEO 설정, KOL 목록, 대시보드 작업을 확인할 수 없습니다.",
        en: "The product screen does not prove the Korean GTM role, SEO setup, KOL pool, or dashboard completion."
      }
    },
    metrics: [],
    copy: {
      ko: {
        title: "NEVADA 한국 마케팅 리드",
        context: "1six.tech Inc. / 미국 기반 perpDEX NEVADA",
        channels: ["SEO", "SNS", "KOL", "Blog", "GA4"],
        objective: "미국 기반 perpDEX인 NEVADA가 한국 시장에서 마케팅을 실행할 수 있는 체계를 설계하는 것이 목표였습니다.",
        role: "마케팅 리드로서 한국 GTM, 웹사이트 SEO 설정, 리스크 조율, 영문 자료를 한국어 메시지로 다듬는 일, 대행사 커뮤니케이션을 맡았습니다.",
        result: "기존 포트폴리오에는 한국 마케팅 방향과 실행 패널(업무 관리 화면)의 구조를 완성했다고 적혀 있습니다.",
        constraint: "한국 시장에 맞는 메시지, 리스크 관리와 규정 준수, SEO, 대행사의 실행 업무를 한 방향으로 맞춰야 했습니다.",
        system: "SEO 설정, UTM·GA4 대시보드 구성, KOL 목록, 한국어 메시지, 실행 패널을 함께 설계했습니다.",
        proof: "현재 저장소에서 trade.nevada.app 화면과 제가 맡은 일, 운영 방식에 대한 설명을 확인할 수 있습니다.",
        limitation: "현재 저장소에는 GA4·UTM 대시보드와 SEO 설정, 실행 리포트 화면이 없습니다."
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

export const siteContent = {
  ko: {
    seo: {
      title: "Nimdal / 탁찬우 — 리서치, 자동화, 캠페인 운영",
      description: "웹3 리서치 도구와 자동화, 게임 프로토타입, 마케팅·캠페인 운영 경험을 모은 Nimdal(탁찬우)의 포트폴리오입니다."
    },
    language: {
      label: "언어",
      current: "한국어",
      switchTo: "English"
    },
    nav: [
      { label: "홈", href: "/ko" },
      { label: "프로젝트", href: "/ko/lab" },
      { label: "경력", href: "/ko/portfolio" },
      { label: "블로그", href: "/ko/blog" },
      { label: "연락", href: "/ko#contact" }
    ],
    home: {
      identity: {
        eyebrow: "Nimdal / 탁찬우",
        name: "Nimdal",
        legalName: "탁찬우",
        role: "제품 제작 · 캠페인 운영 · 전략",
        headline: "리서치 도구를 만들고, 캠페인을 기획하고 운영합니다.",
        description: "픽셀 문어 Nimdal이라는 이름으로 웹3 리서치 도구, 자동화, 게임 프로토타입을 직접 만듭니다. SEO와 캠페인은 기획부터 실행, 리포트까지 맡아왔습니다.",
        location: "서울 · 원격 협업",
        availability: "지금은 리서치 도구와 자동화를 만들며, 캠페인과 한국 시장 진출(GTM) 프로젝트를 운영하고 있습니다.",
        portraitAlt: "탁찬우의 인물 사진.",
        avatarAlt: "Nimdal을 나타내는 픽셀 문어 이미지.",
        primaryCta: "프로젝트 보기",
        secondaryCta: "경력 보기"
      },
      metrics: [
        {
          value: "9",
          label: "프로젝트",
          context: "현재 포트폴리오에 등록한 리서치, 자동화, 게임 프로젝트 수입니다.",
          source: "현재 저장소의 프로젝트 데이터",
          limitation: "완성도와 공개 범위는 프로젝트마다 다르며 상태로 구분했습니다.",
          provenance: "repository-count"
        },
        {
          value: "6",
          label: "경력 사례",
          context: "기존 커리어 포트폴리오에서 골라 정리한 대표 사례 수입니다.",
          source: "현재 저장소의 경력 사례 데이터",
          limitation: "사례 수가 검증된 성과 수를 뜻하지는 않습니다. 확인 가능한 범위는 사례마다 따로 적었습니다.",
          provenance: "repository-count"
        },
        {
          value: "3",
          label: "공개 글",
          context: "현재 블로그에 공개한 글의 수입니다.",
          source: "현재 저장소의 블로그 글",
          limitation: "세 글 모두 2026-07-02에 처음 공개했습니다.",
          provenance: "repository-count"
        },
        {
          value: "6+ yrs",
          label: "에이전시 경력",
          context: "기존 커리어 포트폴리오에 적힌 MKR 업무 기간은 2018.06.29–2024.09입니다.",
          source: "현재 저장소의 MKR 경력 사례",
          limitation: "별도의 재직 증명 문서는 공개하지 않았습니다.",
          provenance: "career-record"
        }
      ],
      process: {
        eyebrow: "운영 방식",
        title: "문제를 찾고, 계획을 세우고, 실행한 뒤 다음에 반영합니다.",
        description: "제품을 만들 때도, 캠페인을 운영할 때도 이 네 단계를 따릅니다.",
        steps: [
          {
            index: "01",
            title: "문제 찾기",
            body: "채널부터 정하지 않습니다. 사용자의 불편, 시장 상황, 검색 의도와 리스크를 살펴 핵심 문제를 한 문장으로 정리합니다.",
            outcome: "문제, 타깃, KPI 기준을 정합니다."
          },
          {
            index: "02",
            title: "계획 세우기",
            body: "조사한 내용을 바탕으로 채널별 역할과 콘텐츠 방향, 담당자, 일정, 리포트 기준을 정합니다.",
            outcome: "누가 봐도 바로 실행할 수 있는 계획을 만듭니다."
          },
          {
            index: "03",
            title: "실행하기",
            body: "카피와 디자인, KOL·커뮤니티, 검색, 웹, 파트너 작업을 조율하고 공개 전에 마지막으로 점검합니다.",
            outcome: "일정과 품질을 지키며 결과물을 공개합니다."
          },
          {
            index: "04",
            title: "다음에 반영하기",
            body: "성과와 반응을 살펴 무엇이 효과가 있었는지 정리하고, 다음에 할 일을 리포트와 작업 목록에 남깁니다.",
            outcome: "다음 프로젝트에서 바로 활용할 수 있게 기록합니다."
          }
        ]
      },
      contact: {
        eyebrow: "Contact",
        title: "함께 만들고 싶은 일이 있다면 편하게 연락 주세요.",
        description: "제품이나 시장, 지금 막힌 지점과 원하는 결과를 알려주시면 확인한 뒤 답변드리겠습니다.",
        emailLabel: "이메일",
        email,
        primaryCta: "이메일 보내기"
      }
    },
    lab: {
      eyebrow: "Nimdal Lab",
      title: "직접 만들고 있는 리서치 도구, 자동화, 게임",
      description: "무엇을 만들었고 어디까지 확인할 수 있는지, 아직 부족한 점은 무엇인지 프로젝트별로 정리했습니다.",
      openProject: "프로젝트 보기",
      statusLabel: "상태",
      status: {
        live: "운영 중",
        prototype: "프로토타입",
        "in-progress": "제작 중",
        archived: "보관 중"
      },
      detailLabels: {
        problem: "문제",
        decision: "결정",
        system: "구성",
        proof: "확인 자료",
        limitation: "한계",
        next: "다음"
      }
    },
    career: {
      eyebrow: "경력",
      title: "마케팅을 기획하고, 실행하고, 운영해 온 기록",
      description: "Web2 에이전시와 지역 비즈니스, 프리미엄 브랜드, 웹3 프로젝트에서 기획부터 실행, 커뮤니케이션, 리포트까지 맡은 사례를 정리했습니다.",
      metricNotice: "수치는 출처와 확인할 수 없는 부분을 함께 적었습니다. 원자료가 없으면 포트폴리오에 기록된 수치로만 표시합니다.",
      proofNotice: "브랜드 이미지와 제품 화면은 어떤 작업인지 보여주지만, 제 역할이나 성과를 입증하는 자료는 아닙니다.",
      signals: [
        {
          value: "since 2012",
          label: "마케팅·운영 시작",
          context: "기존 포트폴리오에는 2012년부터 CSR, 콘텐츠, 바이럴, 인플루언서, 디지털 캠페인을 운영했다고 적혀 있습니다.",
          source: "기존 커리어 포트폴리오",
          limitation: "별도 경력 증빙 없이 포트폴리오에 기재된 내용입니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "10+ years",
          label: "실무 경험",
          context: "스타트업 제품 제작, 마케팅 운영, KOL·SEO, AI를 활용한 MVP 제작 경험을 합산한 포트폴리오 요약입니다.",
          source: "현재 저장소의 소개 문서",
          limitation: "분야별로 겹치는 기간을 따로 나눈 경력표는 공개하지 않았습니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "100+ clients",
          label: "고객 운영",
          context: "기존 포트폴리오에는 에이전시에서 100곳 이상의 고객사를 담당했다고 적혀 있습니다.",
          source: "MKR 경력 사례",
          limitation: "고객 명단이나 전체 프로젝트 기록이 없어 외부에서 확인할 수 없는 포트폴리오 기재 수치입니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "200+ campaigns",
          label: "캠페인 운영",
          context: "기존 포트폴리오에는 브랜드, 병원, 커머스, 지역 비즈니스, 웹3 분야에서 200건 이상의 캠페인을 운영했다고 적혀 있습니다.",
          source: "기존 커리어 포트폴리오",
          limitation: "전체 캠페인 목록과 결과 보고서가 없어 외부에서 확인할 수 없는 포트폴리오 기재 수치입니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "6+ agency years",
          label: "에이전시 운영",
          context: "기존 포트폴리오에 적힌 MKR 업무 기간은 2018.06.29–2024.09입니다.",
          source: "MKR 경력 사례 기간",
          limitation: "별도의 재직 증명 문서는 공개하지 않았습니다.",
          provenance: "career-record"
        },
        {
          value: "3K+ KOL network",
          label: "KOL 네트워크",
          context: "기존 포트폴리오에는 인플루언서와 KOL, 커뮤니티 파트너 3,000명 이상의 네트워크를 운영했다고 적혀 있습니다.",
          source: "기존 커리어 포트폴리오",
          limitation: "현재 활동 여부와 중복을 확인할 명단이 없어 외부에서 검증할 수 없는 포트폴리오 기재 수치입니다.",
          provenance: "portfolio-claim"
        },
        {
          value: "8K+ X audience",
          label: "X 계정 독자층",
          context: "기존 포트폴리오에는 X에서 8,000명 이상의 독자층을 확보했다고 적혀 있습니다.",
          source: "기존 커리어 포트폴리오",
          limitation: "날짜가 표시된 분석 화면을 공개하지 않아 외부에서 확인할 수 없는 포트폴리오 기재 수치입니다.",
          provenance: "portfolio-claim"
        }
      ]
    },
    blog: {
      eyebrow: "BLOG",
      title: "만들고 운영하며 남긴 기록",
      description: "포트폴리오에는 결과를, 블로그에는 그 결과를 만들며 고민하고 시도한 과정을 적습니다.",
      readMore: "글 읽기"
    },
    footer: {
      tagline: "Nimdal — 리서치하고, 운영하고, 만듭니다."
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
      { label: "BLOG", href: "/en/blog" },
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
          context: "BLOG posts currently present in the repository.",
          source: "Keystatic content in content/blog/posts",
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
      eyebrow: "BLOG",
      title: "Notes left behind by research, builds, and operations",
      description: "If the portfolio shows outcomes, the BLOG preserves the judgment and production process behind them.",
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
