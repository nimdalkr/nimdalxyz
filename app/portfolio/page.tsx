import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SavePortfolioPdfButton } from "@/app/portfolio/SavePortfolioPdfButton";

const capabilityGroups = [
  {
    title: "Planning",
    items: [
      "Market and competitor research",
      "Keyword and channel strategy",
      "Campaign goals and KPI definition",
      "Content direction design"
    ]
  },
  {
    title: "Execution",
    items: [
      "Naver Blog and search operation",
      "Smartplace and homepage acquisition design",
      "Influencer and KOL campaigns",
      "SNS and community content distribution"
    ]
  },
  {
    title: "Communication & Reporting",
    items: [
      "Client request structuring",
      "Partner and team task breakdown",
      "Output QA and schedule control",
      "Campaign reporting and next-action proposals"
    ]
  }
] as const;

const careerProjects = [
  {
    index: "01",
    title: "Swiss J Functional Shoes Campaign",
    period: "2019.09 - 2022.12",
    context: "Functional footwear brand",
    channels: "Naver Blog / Naver Search / Instagram",
    objective: "Rebuild the shopping-mall sales and online/offline promotion structure.",
    role: "Marketing direction, market and competitor research, content planning, client communication, reporting.",
    kpi: "Sales, ad efficiency, search/content inflow, content response, promotion execution.",
    result: "Reached roughly 2,000% ad-spend-to-sales performance within about three months.",
    constraint: "Performance had to be explained through search/content operations, not only ad spend.",
    system: "Competitor scan, keyword-led content direction, promotion reporting, and client feedback loop.",
    proof: "metric-claimed",
    evidence: "Portfolio claim; should be paired with anonymized report screenshots before award submission.",
    image: "/media/career/joya-logo.jpg",
    imageAlt: "Joya logo.",
    imageLabel: "Joya industry"
  },
  {
    index: "02",
    title: "Busan H Animal Hospital Local Marketing",
    period: "2020.03 - 2023.10",
    context: "New local animal hospital",
    channels: "Naver Blog / Naver Smartplace",
    objective: "Create stable local acquisition after opening through Naver Search and Smartplace.",
    role: "Local marketing direction, competitor hospital research, blog operation, Smartplace operation, client communication, reporting.",
    kpi: "Local keyword exposure, content publishing, Smartplace response, inquiries, visits, operating duration.",
    result: "Maintained a stable local marketing operation across the full engagement period.",
    constraint: "Local search intent and trust-building mattered more than broad campaign reach.",
    system: "Naver Blog cadence, Smartplace maintenance, local competitor tracking, and reporting rhythm.",
    proof: "internal-operation",
    evidence: "Long engagement proof; add local keyword screenshots and Smartplace before/after where shareable.",
    image: "/media/career/h-animal-logo.jpg",
    imageAlt: "H Animal Medical Center logo.",
    imageLabel: "H Animal Medical Center"
  },
  {
    index: "03",
    title: "Leica Online Acquisition & Sales Growth",
    period: "2022.07 - 2024.09",
    context: "Premium brand / retail",
    channels: "Naver Blog / Homepage",
    objective: "Build a content and homepage acquisition structure for online inquiries and sales growth.",
    role: "Marketing direction, target research, content production, homepage acquisition structure design, client communication, reporting.",
    kpi: "Homepage inflow, content publishing, inquiry and purchase response, monthly sales, reporting cadence.",
    result: "Moved from roughly KRW 1-2M monthly sales before marketing to KRW 100M monthly sales in 2024.09.",
    constraint: "Premium retail messaging needed to increase acquisition without weakening brand perception.",
    system: "Search content, homepage inflow structure, inquiry handling signals, and reporting cadence.",
    proof: "metric-claimed",
    evidence: "High-value metric claim; needs anonymized sales/report proof before being treated as externally verified.",
    image: "/media/career/leica-logo.jpg",
    imageAlt: "Leica logo.",
    imageLabel: "Leica"
  },
  {
    index: "04",
    title: "MKR Agency Operating System",
    period: "2018.06.29 - 2024.09",
    context: "100+ clients / 6+ years",
    channels: "Blog / Influencer / Design / Development / Agency partners",
    objective: "Systemize the operating flow for a high-volume ad agency environment.",
    role: "Campaign Ops Lead: request structuring, task breakdown, schedule control, output QA, reporting, improvement proposals.",
    kpi: "Completion quality, renewal readiness, schedule adherence, report consistency.",
    result: "Built an execution base for client reporting, partner management, and repeatable campaign operation.",
    constraint: "High-volume agency work required consistent quality across many partners and deliverables.",
    system: "Request intake, task breakdown, partner communication, QA, reporting, and renewal-readiness loops.",
    proof: "operator-system",
    evidence: "Operational proof; strongest with screenshots of templates, report formats, and workflow boards.",
    image: "/media/career/mkr-logo.jpg",
    imageAlt: "MKR esports platform and online marketing logo.",
    imageLabel: "MKR"
  },
  {
    index: "05",
    title: "Community / KOL Content Campaigns",
    period: "2025.01 - 2025.09",
    context: "071Labs / Alpha Duo",
    channels: "X / Telegram / Discord / Medium / Blog",
    objective: "Localize Web3 project messaging for Korean users and support community/KOL communication.",
    role: "Korean content writing, X/Blog/Telegram operation, KOL collaboration, AMA/event planning, client communication.",
    kpi: "Content views, reposts, comments, Telegram participation, KOL posts, AMA participation.",
    result: "Built Korean-market communication experience across UXLINK, SaharaAI, edgeX, Theoriq, BLESS, Dolomite, and MVL.",
    constraint: "Web3 localization had to balance attention, compliance risk, and community interpretation.",
    system: "Korean content adaptation, KOL coordination, AMA/event planning, and community response monitoring.",
    proof: "public-surface",
    evidence: "Public campaign surfaces may exist, but project-by-project proof links should be curated.",
    image: "/media/career/bitcoin-logo.jpg",
    imageAlt: "Bitcoin logo.",
    imageLabel: "Bitcoin"
  },
  {
    index: "06",
    title: "Global Client Marketing Lead - NEVADA Korea",
    period: "2026.04 - 2026.06",
    context: "1six.tech Inc. / NEVADA, US-based perpDEX",
    channels: "SEO / SNS / KOL / Blog / GA4",
    objective: "Design the Korean marketing execution system for a US-based perpDEX client.",
    role: "Marketing Lead: Korean GTM, website SEO setup, risk coordination, Korean messaging from English materials, agency communication.",
    kpi: "SEO setup, KOL pool, content publishing plan, GA4/UTM dashboard, agency execution schedule.",
    result: "Completed the Korean marketing direction and execution panel structure.",
    constraint: "A US perpDEX needed Korean-market messaging while keeping risk, compliance, SEO, and agency execution aligned.",
    system: "SEO setup, UTM/GA4 dashboard logic, KOL pool, Korean messaging, and execution panel.",
    proof: "live-link",
    evidence: "Live product surface plus internal GTM system; add dashboard/report screenshots where allowed.",
    image: "/media/career/nevada.jpg",
    imageAlt: "Screenshot of the trade.nevada.app markets dashboard.",
    imageLabel: "trade.nevada.app"
  }
] as const;

const processSteps = [
  {
    index: "01",
    title: "Decode",
    body: "Find the real growth problem inside the brief by reading audience friction, market pressure, search intent, and decision risk before choosing channels.",
    signal: "Problem intelligence",
    outcome: "One problem statement, target logic, and KPI guardrails before production starts.",
    mode: "matrix",
    bars: [74, 42, 62, 88],
    nodes: ["Brief", "Market", "User", "KPI"],
    artifacts: ["Brief matrix", "Competitor / SERP scan", "Audience friction map"]
  },
  {
    index: "02",
    title: "Frame",
    body: "Turn messy inputs into a campaign architecture: channel roles, content angles, owner map, operating cadence, and reporting logic.",
    signal: "System design",
    outcome: "A plan that clients, teams, and partners can execute without interpretation drift.",
    mode: "mix",
    bars: [68, 54, 82, 46],
    nodes: ["Roles", "Angles", "Owners", "Cadence"],
    artifacts: ["Channel map", "KPI tree", "Content / task board"]
  },
  {
    index: "03",
    title: "Ship",
    body: "Coordinate copy, design, KOL/community, search, web, and partner deliverables with QA before the work goes live.",
    signal: "Execution control",
    outcome: "Assets ship on cadence, with clearer channel fit and fewer late-stage reversals.",
    mode: "pipeline",
    bars: [44, 72, 64, 86],
    nodes: ["Copy", "Design", "KOL", "QA"],
    artifacts: ["Production queue", "QA checklist", "Launch notes"]
  },
  {
    index: "04",
    title: "Compound",
    body: "Read response signals, separate noise from useful evidence, report the next move, and convert learning into the next cycle.",
    signal: "Learning loop",
    outcome: "Decisions, renewals, and follow-up campaigns become easier to justify.",
    mode: "loop",
    bars: [52, 76, 48, 90],
    nodes: ["GA4", "UTM", "Report", "Next"],
    artifacts: ["GA4 / UTM view", "Client report", "Next-action backlog"]
  }
] as const;

type ProcessStep = (typeof processSteps)[number];

function processStyle(value: number): CSSProperties {
  return { "--value": `${value}%` } as CSSProperties;
}

function renderProcessVisual(step: ProcessStep) {
  return (
    <div className={`career-process-visual is-${step.mode}`} aria-hidden="true">
      <div className="career-process-chart">
        {step.bars.map((value, index) => (
          <i key={`${step.index}-${value}-${index}`} style={processStyle(value)} />
        ))}
      </div>
      <div className="career-process-nodegrid">
        {step.nodes.map((node, index) => (
          <b key={node} className={index === 0 ? "is-primary" : undefined}>
            {node}
          </b>
        ))}
      </div>
    </div>
  );
}

const toolStacks = [
  {
    title: "Docs & Business Planning",
    items: [
      "Google Workspace (Docs / Sheets / Slides)",
      "Notion",
      "PowerPoint / Excel",
      "Business plans",
      "Government support programs"
    ]
  },
  {
    title: "Creative Production",
    items: [
      "Photoshop",
      "Premiere Pro",
      "After Effects",
      "Content production",
      "Campaign asset editing"
    ]
  },
  {
    title: "AI & Development",
    items: [
      "Codex",
      "Claude Code",
      "Antigravity",
      "MCP",
      "Web development",
      "Application development",
      "Game development"
    ]
  },
  {
    title: "Marketing & Distribution",
    items: [
      "SEO",
      "Naver Blog / Search / Smartplace",
      "GA4 / UTM Dashboard",
      "Google Play / App Store publishing",
      "SNS / Community channels"
    ]
  }
] as const;

export const metadata: Metadata = {
  title: "Career Portfolio | Tak Chanwoo / Nimdal",
  description:
    "Career portfolio for Tak Chanwoo / Nimdal, focused on campaign planning, marketing operation, client communication, SEO, influencer, and Web3 localization work."
};

export default function CareerPortfolioPage() {
  return (
    <div className="career-shell">
      <div className="career-watermark" aria-hidden />

      <header className="career-header">
        <Link className="career-brand" href="/" aria-label="Back to Nimdal home">
          <Image src="/media/identity-octopus.jpg" alt="" width={44} height={44} className="career-brand-avatar" />
          <span>
            <strong>NIMDAL</strong>
            <small>Tak Chanwoo</small>
          </span>
        </Link>
        <nav className="career-nav" aria-label="Career portfolio navigation">
          <a href="#projects">Representative Projects</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
          <Link href="/">Interactive Home</Link>
          <Link href="/blog">nimdalog</Link>
          <SavePortfolioPdfButton />
        </nav>
      </header>

      <main className="career-main">
        <section className="career-hero" aria-labelledby="career-title">
          <div className="career-hero-copy">
            <p className="career-kicker">Career Portfolio</p>
            <h1 id="career-title">Tak Chanwoo / Nimdal</h1>
            <p className="career-lead">
              AE-style campaign operator who turns client briefs into searchable, reportable marketing systems across
              Web2 agencies, local businesses, premium retail, and Web3 Korean-market communication.
            </p>
            <div className="career-tags" aria-label="Portfolio focus">
              <span>Campaign Planning</span>
              <span>SEO / Search</span>
              <span>Influencer / KOL</span>
              <span>Client Communication</span>
            </div>
          </div>

          <div className="career-identity-panel" aria-label="Tak Chanwoo and Nimdal identity">
            <Image
              src="/media/operator-portrait.png"
              alt="Tak Chanwoo portrait."
              width={260}
              height={360}
              priority
              className="career-portrait"
            />
            <div className="career-identity-copy">
              <Image src="/media/identity-octopus.jpg" alt="" width={70} height={70} className="career-octopus" />
              <p>
                The public identity is playful; the working mode is operational: research the market, define the
                channel logic, coordinate people, ship outputs, and report the next move.
              </p>
            </div>
          </div>
        </section>

        <section className="career-summary" aria-label="Career summary">
          <article>
            <span>100+</span>
            <p>client operations handled through agency work</p>
          </article>
          <article>
            <span>6+ yrs</span>
            <p>campaign operations across partners and deliverables</p>
          </article>
          <article>
            <span>2,000%</span>
            <p>ad-spend-to-sales level reached in the Swiss J case</p>
          </article>
          <article>
            <span>KR GTM</span>
            <p>Korean execution structure for global/Web3 clients</p>
          </article>
        </section>

        <section className="career-section career-capabilities" aria-labelledby="capability-title">
          <div className="career-section-heading">
            <p className="career-kicker">Operating Range</p>
            <h2 id="capability-title">From brief to campaign system.</h2>
            <p>
              Career work is organized around planning, execution, and reporting systems: campaign goals, execution
              ownership, KPIs, outcomes, and the operating structure needed to move each project forward.
            </p>
          </div>
          <div className="career-capability-grid">
            {capabilityGroups.map((group) => (
              <article key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="career-section" id="projects" aria-labelledby="projects-title">
          <div className="career-section-heading">
            <p className="career-kicker">Representative Projects</p>
            <h2 id="projects-title">Career projects, distinct from personal builds.</h2>
            <p>
              These cases come from the attached marketing portfolio and use the same Objective - Role - KPI - Result
              structure for fast review.
            </p>
          </div>

          <div className="career-project-grid">
            {careerProjects.map((project) => (
              <article className="career-project-card" key={project.title}>
                <figure className="career-project-media">
                  <Image
                    src={project.image}
                    alt={project.imageAlt}
                    fill
                    sizes="(max-width: 900px) calc(100vw - 72px), 560px"
                    className="career-project-image"
                  />
                  <figcaption>{project.imageLabel}</figcaption>
                </figure>
                <div className="career-project-topline">
                  <span>{project.index}</span>
                  <small>{project.period}</small>
                </div>
                <div className="career-proof-row" aria-label={`${project.title} proof level`}>
                  <span>{project.proof}</span>
                  <span>{project.context}</span>
                </div>
                <h3>{project.title}</h3>
                <p className="career-project-context">{project.context}</p>
                <dl>
                  <div>
                    <dt>Objective</dt>
                    <dd>{project.objective}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{project.role}</dd>
                  </div>
                  <div>
                    <dt>KPI</dt>
                    <dd>{project.kpi}</dd>
                  </div>
                  <div>
                    <dt>Result</dt>
                    <dd>{project.result}</dd>
                  </div>
                </dl>
                <details className="career-dossier">
                  <summary>Case dossier</summary>
                  <dl>
                    <div>
                      <dt>Constraint</dt>
                      <dd>{project.constraint}</dd>
                    </div>
                    <div>
                      <dt>System built</dt>
                      <dd>{project.system}</dd>
                    </div>
                    <div>
                      <dt>Evidence / caveat</dt>
                      <dd>{project.evidence}</dd>
                    </div>
                  </dl>
                </details>
                <footer>{project.channels}</footer>
              </article>
            ))}
          </div>
        </section>

        <section className="career-section career-process" id="process" aria-labelledby="process-title">
          <div className="career-section-heading">
            <p className="career-kicker">Campaign Process</p>
            <h2 id="process-title">How</h2>
            <p>I turn vague growth problems into systems people can understand, trust, and act on.</p>
          </div>
          <div className="career-process-steps">
            {processSteps.map((step) => (
              <article className={`career-process-card is-${step.mode}`} key={step.index}>
                <div className="career-process-card-head">
                  <span>{step.index}</span>
                  <small>{step.signal}</small>
                </div>
                {renderProcessVisual(step)}
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <ul className="career-process-artifacts" aria-label={`${step.title} artifacts`}>
                  {step.artifacts.map((artifact) => (
                    <li key={artifact}>{artifact}</li>
                  ))}
                </ul>
                <div className="career-process-result">
                  <span>Outcome</span>
                  <p>{step.outcome}</p>
                </div>
              </article>
            ))}
          </div>
          <a className="career-process-proof-link" href="#projects">
            View the proof behind the process
          </a>
          <div className="career-tool-grid">
            {toolStacks.map((stack) => (
              <article key={stack.title}>
                <h3>{stack.title}</h3>
                <ul>
                  {stack.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="career-contact" id="contact" aria-label="Contact">
          <div>
            <p className="career-kicker">Contact</p>
            <h2>Let the next brief arrive clean.</h2>
          </div>
          <address>
            <a href="mailto:0xnimdal@gmail.com">0xnimdal@gmail.com</a>
            <a href="https://x.com/0xnimdal" target="_blank" rel="noreferrer">
              X / @0xnimdal
            </a>
            <a href="https://t.me/nimdal" target="_blank" rel="noreferrer">
              Telegram / @nimdal
            </a>
            <a href="https://linkedin.com/in/chanwoo-tak-132b281a4" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </address>
        </section>
      </main>
    </div>
  );
}
