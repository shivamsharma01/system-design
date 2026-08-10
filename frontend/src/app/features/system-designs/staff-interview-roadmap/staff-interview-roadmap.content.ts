import { DesignContent } from '../../../shared/models';
import { STAFF_ROADMAP_CHECKLIST_GROUPS } from './staff-interview-roadmap.checklist';
import { STAFF_INTERVIEW_ROADMAP_META } from './staff-interview-roadmap.meta';

/**
 * Personalized Staff/Lead/Principal interview roadmap mapped to LinkedIn JD
 * clusters and a Java/Spring/Angular/Oracle multi-tenant resume profile.
 */
const content: DesignContent = {
  meta: STAFF_INTERVIEW_ROADMAP_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'This is a **24-week, no-ambiguity interview roadmap** for clearing Staff / Senior Staff / Lead Backend / hands-on Architect interviews in the Java + distributed systems market. It is calibrated to a resume profile of **8+ years**, Staff title, **Spring Boot + Angular + Oracle/multi-tenant SaaS**, production debugging ownership, monolith modernization, GCP PCA + Generative AI Leader certifications — and to a LinkedIn openings dump spanning Twilio, Netomi, SupplyHouse, Kaseya, Juniper Square, EPAM, Atlassian, Sophos, and similar roles.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Timeline', value: '24 weeks', hint: '~3–6 months wall clock' },
            { label: 'Primary target', value: 'Staff / Lead', hint: 'Java backend + platforms' },
            { label: 'Checklist items', value: '110+', hint: 'Saved in localStorage' },
            { label: 'Application mix', value: '70 / 20 / 10', hint: 'Fit / bridge / stretch' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'How to use this page',
          body: '1. Read **Eligibility** and **Skill gaps** once.\n2. Follow the **24-week plan** week by week — each week has goal, topics, drills, deliverable, and done criteria.\n3. Mark items in the **Progress checklist** as you finish them (persists in this browser).\n4. Use **Interview loops**, **Story bank**, and **Company packs** the week you interview.\n5. Cross-link into existing deep pages (Java, Spring, Kafka, Redis, K8s, SQL, AI) instead of re-learning from scratch.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Experience framing for Principal JDs',
          body: 'Many Principal listings ask **10–12+ years**. With ~8+ years IC Staff experience, prioritize **Staff / Senior Staff / Lead / Architect (hands-on)** as primary applications. For selective Principal applications, lead with **scope** (750 orgs, Oracle upgrade, production escalation ownership, mentoring, standards) rather than title years alone.',
        },
      ],
    },
    {
      id: 'eligibility',
      title: 'Eligibility & Role Fit',
      blocks: [
        {
          type: 'markdown',
          value:
            '### Your stack vs market demand\n\nFrom the LinkedIn openings file, almost every serious backend/Staff role repeats the same core: **Java (or Go/Python), microservices, SQL, cloud, containers, CI/CD, distributed systems judgment, mentoring**. Your resume already covers most of that. Gaps are concentrated in **Kafka depth, Redis interview depth, Staff-bar system design reps, Terraform/AWS fluency, and AI-tooling demos**.',
        },
        {
          type: 'table',
          caption: 'Role-fit matrix from the collected openings.',
          headers: ['Cluster', 'Examples', 'Fit', 'Action'],
          rows: [
            [
              'Java Staff / Lead / Architect',
              'Netomi, SupplyHouse, Kaseya, Jobgether, Oportun, Sophos (fullstack)',
              'Fit now',
              'Apply immediately; polish Redis/MySQL/AWS stories',
            ],
            [
              'Streaming / Kafka-heavy Staff',
              'Twilio L4, Samay Lead Backend, Atlassian Search/Data',
              'Fit after bridge',
              'Weeks 5–8 + streaming awareness in weeks 17–20',
            ],
            [
              'Cloud-native platform Lead',
              'Hired Micro Platforms, Randstad Staff/Principal',
              'Fit after bridge',
              'Weeks 9–12 K8s + Terraform + AWS map',
            ],
            [
              'Fullstack Tech Lead',
              'Juniper Square, Sophos',
              'Fit after bridge',
              'Keep Angular primary; add React literacy + GraphQL basics',
            ],
            [
              'AI-native engineer',
              'EPAM Applied Senior, Spydra Full-Stack AI',
              'Stretch',
              'Months 4–6: RAG mini + agentic workflow portfolio',
            ],
            [
              'OpenShift / Camel / middleware',
              'Nagarro Principal Containerization',
              'Skip',
              'Poor ROI in 3–6 months',
            ],
            ['Compiler / runtime research', 'MTS Coding Research', 'Skip', 'Wrong specialty'],
            [
              'Pure Python/Azure Principal',
              'Insight Global Principal',
              'Skip / low priority',
              'Only if willing to rebrand stack; not this roadmap’s primary path',
            ],
            [
              'FinTech domain-only',
              'Hired FinTech SE',
              'Secondary',
              'Apply only where Java + distributed systems matter more than payments domain',
            ],
          ],
        },
        {
          type: 'featureComparison',
          caption: 'Target titles — what to pursue in the next 6 months.',
          columns: ['Staff SE', 'Lead Backend', 'Architect (hands-on)', 'Principal (selective)'],
          rows: [
            {
              feature: 'Primary application?',
              values: [true, true, true, 'Selective'],
            },
            {
              feature: 'Needs Kafka depth?',
              values: ['Often', 'Often', 'Depends', 'Usually'],
            },
            {
              feature: 'Needs staff leadership stories?',
              values: [true, true, true, true],
            },
            {
              feature: 'Coding rounds?',
              values: ['Yes', 'Yes', 'Sometimes', 'Sometimes'],
            },
            {
              feature: 'System design bar',
              values: ['High', 'High', 'Very high', 'Very high'],
            },
          ],
        },
        {
          type: 'prosCons',
          title: 'Non-goals for this 6-month window',
          pros: [
            'Become interview-ready for Java Staff/Lead roles at scale.',
            'Close Kafka/Redis/cloud gaps that block otherwise-fit JDs.',
            'Build a reusable story bank and design muscle.',
          ],
          cons: [
            'Do not chase OpenShift Service Mesh / Apache Camel specialist tracks.',
            'Do not claim Flink/Solr expertise — awareness only.',
            'Do not pivot primary language to Python/Go unless a dream role requires it.',
          ],
        },
      ],
    },
    {
      id: 'skill-gaps',
      title: 'Skill Gap Map',
      blocks: [
        {
          type: 'markdown',
          value:
            '### Already strong (marketable today)\n\n- **Java + Spring Boot + Hibernate/JPA** with production scars (tenant isolation, Java 17 modules, query engines).\n- **SQL depth on Oracle**, transferable to MySQL/Postgres interview talk.\n- **Multi-tenant SaaS**, monolith decomposition, Angular fullstack delivery.\n- **Docker/K8s/Jenkins/Azure Pipelines**, AWS/GCP exposure, Splunk production debugging.\n- **Technical leadership**: mentoring, interviews, standards, 100+ production reviews.\n- **Certifications**: GCP Professional Cloud Architect, Generative AI Leader.',
        },
        {
          type: 'table',
          caption: 'Must-close gaps (appear across most openings).',
          headers: ['Gap', 'Why JDs care', 'How this roadmap closes it', 'Done when'],
          rows: [
            [
              'Kafka + event-driven design',
              'Twilio, Samay, Atlassian, Randstad, most Staff platforms',
              'Weeks 5–8 + outbox/idempotency labs',
              'Explain consumer groups, lag, exactly-once illusions, DLQ, outbox',
            ],
            [
              'Redis production patterns',
              'Netomi, SupplyHouse, caching/rate-limit interviews',
              'Redis page + lock/fencing drills via ticket booking',
              'Whiteboard cache + distributed lock failure modes',
            ],
            [
              'Staff-bar system design',
              'Every Staff+ loop',
              'Weeks 13–16: 40 designs + RESHADED',
              '45-min random design without prep',
            ],
            [
              'Timed DSA / coding',
              'Most companies still screen with it',
              'Weekly Java DSA cadence phases 1–6',
              'Consistent medium solve in ~35–40 min with tests',
            ],
            [
              'Observability + incident leadership',
              'Principal/Staff ownership language',
              'SLO drills + story bank + Splunk narratives',
              'Define SLOs and lead a mock postmortem',
            ],
            [
              'Terraform + AWS depth',
              'ECS/EKS/SQS/SNS on many JDs',
              'Weeks 9–12 cloud map + Terraform lab',
              'Compare ECS vs EKS; sketch IaC for a service',
            ],
            [
              'AI-assisted engineering fluency',
              'Nearly every 2025–26 JD',
              'Weeks 17–20 workflow docs + RAG mini',
              '5-min demo of agentic workflow + trust boundaries',
            ],
          ],
        },
        {
          type: 'heading',
          level: 3,
          text: 'Quick wins (2–4 weeks each)',
        },
        {
          type: 'bestPractices',
          title: 'Highest leverage early investments',
          practices: [
            '**Redis + Spring Cache** — short study, huge JD coverage.',
            '**Kafka fundamentals → production patterns** — unlocks streaming Staff roles.',
            '**Staff STAR bank** — turns Blackbaud work into interview gold.',
            '**React literacy (read/review level)** — unlocks fullstack Lead screens without abandoning Angular.',
          ],
        },
        {
          type: 'heading',
          level: 3,
          text: 'Secondary (months 4–6 only)',
        },
        {
          type: 'markdown',
          value:
            '- Light **RAG + agents** project for EPAM/Spydra-style roles.\n- **Flink/Spark vocabulary** for Twilio/Atlassian — conceptual, not expertise claim.\n- **GraphQL basics** for Juniper Square.\n- Optional Go/Python syntax familiarity only if a specific pipeline requires it.',
        },
      ],
    },
    {
      id: 'roadmap-24-weeks',
      title: '24-Week Roadmap',
      blocks: [
        {
          type: 'mermaid',
          caption: 'Six phases from core depth to interview machine.',
          definition: `flowchart LR
  P1[Weeks1to4_CoreDepth] --> P2[Weeks5to8_Distributed]
  P2 --> P3[Weeks9to12_CloudOps]
  P3 --> P4[Weeks13to16_StaffBar]
  P4 --> P5[Weeks17to20_AIPlusFullstack]
  P5 --> P6[Weeks21to24_InterviewMachine]`,
        },
        {
          type: 'timeline',
          items: [
            {
              title: 'Phase 1 · Weeks 1–4',
              meta: 'Core depth',
              description:
                'Java concurrency, Spring Boot production, SQL/Oracle→Postgres talk tracks, DSA warm-up, first STAR drafts.',
            },
            {
              title: 'Phase 2 · Weeks 5–8',
              meta: 'Distributed',
              description:
                'Kafka, Redis, outbox, locking/fencing, consistency, messaging mock design.',
            },
            {
              title: 'Phase 3 · Weeks 9–12',
              meta: 'Cloud & ops',
              description:
                'K8s depth, Docker, CI/CD narrative, Terraform starter, AWS service map, SLOs.',
            },
            {
              title: 'Phase 4 · Weeks 13–16',
              meta: 'Staff bar',
              description:
                '40 system designs, ADRs, leadership behaviors, full design doc, Staff mock.',
            },
            {
              title: 'Phase 5 · Weeks 17–20',
              meta: 'AI + fullstack bridge',
              description:
                'AI tooling portfolio, RAG mini, React literacy, GraphQL/Flink awareness.',
            },
            {
              title: 'Phase 6 · Weeks 21–24',
              meta: 'Interview machine',
              description: 'Mocks, company packs, application cadence, offer prep.',
            },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Weekly time budget (suggested)',
          body: '**10–14 focused hours/week** if employed full-time: 4h DSA, 4h deep tech, 2h design/story, 2h lab/mocks. Increase to **20h** in phase 6. If you miss a week, slip the calendar — do not skip Phase 2 Kafka/Redis.',
        },
      ],
    },
    {
      id: 'phase-1',
      title: 'Phase 1 — Weeks 1–4 · Core Depth',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Phase goal:** Become fluent again at the Senior→Staff technical screen: Java concurrency, Spring Boot production behavior, SQL performance, and clean coding under time pressure.',
        },
        {
          type: 'expandable',
          title: 'Week 1 — Java concurrency & JVM',
          open: true,
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Goal:** Explain memory model, GC choice trade-offs, and common concurrency bugs.\n- **Study:** [/designs/java-interview](/designs/java-interview) — JVM, GC, threads, locks, JUC.\n- **Drills:** Implement a thread-safe cache; diagnose a deadlock snippet; compare `synchronized` vs `ReentrantLock` vs `ConcurrentHashMap`.\n- **Deliverable:** 1-page cheat sheet: happens-before, visibility, false sharing (awareness).\n- **Done when:** You can teach ThreadLocal hazards using your tenant-isolation incident.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 2 — Spring Boot production',
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Goal:** Interview-ready Spring: transactions, proxies, configs, actuators, failure modes.\n- **Study:** [/designs/spring-boot-interview](/designs/spring-boot-interview), [/designs/spring-boot-production-interview](/designs/spring-boot-production-interview).\n- **Drills:** Draw `@Transactional` proxy pitfalls; explain dirty checking; list 5 production metrics you would alert on.\n- **Deliverable:** Notes linking Hibernate Session + ThreadLocal to your JDBC fix story.\n- **Done when:** You can walk a broken transaction boundary and propose a fix in <10 minutes.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 3 — SQL depth (Oracle → portable talk)',
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Goal:** Sound equally strong on MySQL/Postgres JDs while owning Oracle expertise.\n- **Study:** [/designs/sql-interview](/designs/sql-interview); revisit CTEs, indexes, isolation.\n- **Drills:** EXPLAIN a slow join; design indexes for a multi-tenant `org_id` filter; narrate Oracle 19c upgrade risks.\n- **Deliverable:** “Oracle lessons → Postgres/MySQL” translation sheet.\n- **Done when:** You pick an isolation level for booking/payments with clear anomalies listed.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 4 — DSA warm-up + first stories',
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Goal:** Rebuild timed problem-solving muscle; draft two flagship STAR stories.\n- **Study:** Arrays, hash maps, two pointers, trees BFS/DFS — Java solutions only.\n- **Drills:** 5 easy + 10 medium timed; mock coding #1.\n- **Deliverable:** STAR drafts for tenant isolation + Oracle upgrade.\n- **Done when:** Medium array/hash problem solved with tests in ~40 minutes.',
            },
          ],
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Phase 1 exit criteria',
          body: 'GC + Spring transactions + index selection explainable without notes; 2 STAR stories drafted; coding mock #1 completed.',
        },
      ],
    },
    {
      id: 'phase-2',
      title: 'Phase 2 — Weeks 5–8 · Distributed Systems',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Phase goal:** Close the highest-frequency market gaps — **Kafka** and **Redis** — and connect them to correctness patterns you already understand from production concurrency work.',
        },
        {
          type: 'expandable',
          title: 'Week 5 — Kafka fundamentals → production',
          open: true,
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Goal:** Speak Kafka like someone who has operated consumer lag, not only read docs.\n- **Study:** [/designs/kafka-interview](/designs/kafka-interview).\n- **Drills:** Partitions vs consumer groups; ordering keys; retry/DLQ; “exactly-once” marketing vs reality.\n- **Lab:** Spring Kafka producer/consumer with idempotent consumer keys.\n- **Done when:** You map RabbitMQ experience to Kafka vocabulary without confusion.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 6 — Outbox, idempotency, sagas',
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Goal:** Dual-write safety and async workflows.\n- **Study:** [/designs/transactional-outbox](/designs/transactional-outbox), [/designs/idempotent-consumer](/designs/idempotent-consumer).\n- **Drills:** Design order→payment→inventory saga; list compensation actions.\n- **Deliverable:** Sequence diagram for outbox relay.\n- **Done when:** You reject “just publish after commit in the app thread” with a better design.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 7 — Redis caching & locks',
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Goal:** Production Redis answers for Netomi/SupplyHouse-style rounds.\n- **Study:** [/designs/spring-redis-cache-interview](/designs/spring-redis-cache-interview), [/designs/movie-ticket-booking](/designs/movie-ticket-booking) (locks + fencing).\n- **Drills:** Cache stampede; SET NX PX; Lua owner delete; fencing tokens vs DB conditional update.\n- **Done when:** You explain why a lease expiry does not stop a zombie writer.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 8 — Consistency synthesis + mock',
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Goal:** Integrate messaging + cache + DB into one design narrative.\n- **Study:** [/designs/acid-transactions](/designs/acid-transactions).\n- **Drills:** Mock design: notification service or ecommerce order pipeline.\n- **Deliverable:** STAR for concurrent upload race.\n- **Done when:** Whiteboard Kafka lag + Redis zombie problem from memory.',
            },
          ],
        },
      ],
    },
    {
      id: 'phase-3',
      title: 'Phase 3 — Weeks 9–12 · Cloud, K8s, CI/CD',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Phase goal:** Turn “I have used Docker/K8s/AWS/GCP” into **interview-precise** platform answers: probes, rollouts, IAM, ECS vs EKS, Terraform state, SLOs.',
        },
        {
          type: 'expandable',
          title: 'Week 9 — Kubernetes depth',
          open: true,
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Study:** [/designs/kubernetes-interview](/designs/kubernetes-interview).\n- **Lab:** Deploy Spring Boot with readiness/liveness, resource requests, HPA.\n- **Done when:** You diagnose CrashLoopBackOff and a failing readiness probe scenario.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 10 — AWS (+ GCP transfer)',
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Build flashcards:** ECS, EKS, Lambda, SQS, SNS, RDS, S3, IAM, ALB, CloudWatch.\n- **Transfer:** Map GCP PCA knowledge (GKE, Pub/Sub, Cloud SQL) to AWS equivalents.\n- **Done when:** You can justify ECS vs EKS for a mid-size Spring estate.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 11 — Terraform + CI/CD',
          blocks: [
            {
              type: 'markdown',
              value:
                '- **Lab:** Minimal Terraform for a container service + datastore (even locally mocked).\n- **Narrative:** Jenkins + Azure Pipelines experience → modern GitHub Actions sketch.\n- **Done when:** Explain state, plan/apply, secrets handling, and pipeline quality gates.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 12 — Observability & SLOs',
          blocks: [
            {
              type: 'markdown',
              value:
                '- Define **3 SLOs** for a checkout/donation API (availability, latency, error budget).\n- Connect Splunk incident stories to metrics/logs/traces.\n- Notes on ELK + load balancers for SupplyHouse-style JDs.\n- **Done when:** Blue/green vs canary + alert-on-symptoms explained cleanly.',
            },
          ],
        },
      ],
    },
    {
      id: 'phase-4',
      title: 'Phase 4 — Weeks 13–16 · Staff System Design & Leadership',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Phase goal:** Hit the Staff bar: structured design under time, multi-region thinking, written architectural judgment, and leadership stories that prove influence.',
        },
        {
          type: 'expandable',
          title: 'Week 13 — Framework + first 10 designs',
          open: true,
          blocks: [
            {
              type: 'markdown',
              value:
                '- Internalize [/designs/interview-framework](/designs/interview-framework) (RESHADED).\n- Outline 10 designs (chat, news feed, URL shortener, rate limiter, ticket booking, etc.).\n- Rehearse [/designs/movie-ticket-booking](/designs/movie-ticket-booking) concurrency aloud.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 14 — Designs 11–25 + payments/consistency',
          blocks: [
            {
              type: 'markdown',
              value:
                '- Continue outlines with capacity estimates and failure modes.\n- Deep dive [/designs/payment-gateway](/designs/payment-gateway), idempotency, outbox.\n- Practice authorize → capture → reconcile.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 15 — Designs 26–40 + coordination',
          blocks: [
            {
              type: 'markdown',
              value:
                '- Multi-region, search, streaming pipelines (conceptual).\n- [/designs/leader-election](/designs/leader-election) for fencing/coordination rounds.\n- Write ADR #1: service extraction boundary from a monolith.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 16 — Leadership + design doc + Staff mock',
          blocks: [
            {
              type: 'markdown',
              value:
                '- Finalize **8 STAR stories** (see Story bank).\n- Write one full design doc + ADR #2 (Kafka vs RabbitMQ).\n- Mock Staff architecture deep dive on Luminate modernization.\n- **Exit:** Random 45-min design with no prep.',
            },
          ],
        },
      ],
    },
    {
      id: 'phase-5',
      title: 'Phase 5 — Weeks 17–20 · AI Fluency + Fullstack Bridge',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Phase goal:** Cover the “AI-native development” checkbox on modern JDs and unlock fullstack Lead screens without pretending to be a React specialist.',
        },
        {
          type: 'expandable',
          title: 'Week 17 — AI tooling as an engineering practice',
          open: true,
          blocks: [
            {
              type: 'markdown',
              value:
                '- Study [/designs/ai-engineering-interview](/designs/ai-engineering-interview).\n- Document Cursor/agentic workflows: prompts, tests-first, when to distrust output.\n- Prepare a 5-minute live demo narrative (refactor + review checklist).',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 18 — Mini RAG project',
          blocks: [
            {
              type: 'markdown',
              value:
                '- Build a small RAG over your interview notes or public docs (embeddings + retrieval + answer).\n- Record a short walkthrough: architecture, failure modes, evaluation.\n- This is **stretch ammo** for EPAM/Spydra — not your primary application story.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 19 — React literacy + Angular stories',
          blocks: [
            {
              type: 'markdown',
              value:
                '- Learn enough React (components, hooks, fetching) to review PRs and discuss trade-offs.\n- Prep Angular SPA standards + PostRobot embedding story.\n- GraphQL basics for Juniper Square.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Week 20 — Streaming awareness + web security',
          blocks: [
            {
              type: 'markdown',
              value:
                '- Flink/Spark **vocabulary only** for Twilio/Atlassian screens.\n- XSS/CSRF/CORS/CSP/OAuth flashcards for Sophos-style fullstack.\n- **Exit:** RAG demo + Angular vs React comparison cold.',
            },
          ],
        },
      ],
    },
    {
      id: 'phase-6',
      title: 'Phase 6 — Weeks 21–24 · Interview Machine',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Phase goal:** Convert preparation into offers: polished artifacts, weekly application volume, and repeated full-loop mocks.',
        },
        {
          type: 'table',
          headers: ['Week', 'Focus', 'Quota'],
          rows: [
            ['21', 'Resume + LinkedIn + story polish; start applications', '8 tailored apps'],
            ['22', 'Coding mocks + Kafka/Redis company packs', '2 coding mocks, 10 apps'],
            ['23', 'System design mocks + Staff behavioral', '2 design + 1 behavioral, 10 apps'],
            ['24', 'Targeted packs + offer prep + recovery notes', 'Full-loop day simulation'],
          ],
        },
        {
          type: 'bestPractices',
          title: 'Application mix (do not improvise)',
          practices: [
            '**70%** strong-fit Java Staff/Lead/Architect (Netomi, Kaseya, SupplyHouse, Sophos, Jobgether, Oportun, Spreetail, Randstad).',
            '**20%** bridge roles needing Kafka/Redis/AWS depth (Twilio Staff, Samay, platform roles).',
            '**10%** stretch AI/fullstack (EPAM, Spydra, Juniper Square).',
            '**0%** OpenShift/Camel specialist and compiler-research roles — skip.',
          ],
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Progress Checklist',
      blocks: [
        {
          type: 'markdown',
          value:
            'Check items as you complete them. Progress is stored in **this browser’s localStorage** under `sd-roadmap:staff-interview-roadmap`. Use filters to focus on open work. Reset clears only this roadmap’s checks.',
        },
        {
          type: 'roadmapChecklist',
          storageKey: 'staff-interview-roadmap',
          title: 'Staff interview roadmap — track completion',
          groups: STAFF_ROADMAP_CHECKLIST_GROUPS,
        },
      ],
    },
    {
      id: 'interview-loops',
      title: 'Interview Loop Playbooks',
      blocks: [
        {
          type: 'mermaid',
          caption: 'Typical Staff+ loop (order varies by company).',
          definition: `flowchart LR
  Recruiter[RecruiterScreen] --> HM[HiringManager]
  HM --> Coding[CodingRound]
  Coding --> Design[SystemDesign]
  Design --> Staff[StaffLeadership]
  Staff --> Offer[OfferAndTeamMatch]`,
        },
        {
          type: 'table',
          caption: 'What each round evaluates at Staff vs Senior.',
          headers: ['Round', 'Senior bar', 'Staff+ bar', 'Your angle'],
          rows: [
            [
              'Recruiter',
              'Skills match',
              'Scope, level signal, domain',
              'Staff ownership of modernization + production escalation',
            ],
            [
              'Hiring manager',
              'Delivery',
              'Strategy, influence, ambiguity',
              'Cross-team standards, mentoring, risk calls (Oracle upgrade)',
            ],
            [
              'Coding',
              'Correct mediums',
              'Clarity, tests, trade-offs, speed',
              'Java idioms; talk complexity; don’t rush mutations',
            ],
            [
              'System design',
              'Working design',
              'Failure modes, SLOs, evolvability, cost',
              'Multi-tenant + concurrency + ops stories',
            ],
            [
              'Leadership / deep dive',
              'Teamwork',
              'Org impact, technical judgment under conflict',
              'Story bank + ADRs + incident leadership',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Recruiter screen script (90 seconds)',
          body: 'Staff Engineer on a multi-tenant Java fundraising platform serving ~750 organizations. I own hard production issues (Hibernate/tenant isolation, Oracle upgrades, query engines), lead incremental monolith decomposition to Spring Boot + Angular, and mentor engineers while setting SPA standards. I’m targeting Staff/Lead roles where backend platforms, correctness under concurrency, and production ownership matter. Recently deepening Kafka/Redis/event-driven design and Staff-level system design reps.',
        },
      ],
    },
    {
      id: 'story-bank',
      title: 'Story Bank (STAR)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Prepare these as **2–3 minute** spoken stories with Situation → Task → Action → Result, plus one **decision trade-off** and one **what you’d do differently**.',
        },
        {
          type: 'table',
          headers: [
            'Story',
            'Situation / Task',
            'Action (highlight)',
            'Result / metric cue',
            'Use in',
          ],
          rows: [
            [
              'Tenant isolation failure',
              'Production-only multi-tenant auth failures',
              'Traced Hibernate Criteria + ThreadLocal + shared connections; shipped JDBC fix',
              'Restored isolation; stopped auth failures',
              'Debugging, Hibernate, multi-tenant design',
            ],
            [
              'Oracle 11g → 19c',
              'Platform readiness across ~750 orgs',
              'Phased env fixes: encryption, JDBC, SQL, pagination features',
              'Unblocked upgrade; faster long queries',
              'Leadership, risk, databases',
            ],
            [
              'Dynamic SQL alias collision',
              'Customer-specific fields broke reporting',
              'Generalized alias strategy in query engine',
              'Reliable reporting across combinations',
              'Abstraction design, SQL',
            ],
            [
              'Java 17 module access',
              'Deployments failing on reflection',
              'Identified `--add-opens` requirements for runtime',
              'Unblocked Java 17 production',
              'JVM, platform upgrades',
            ],
            [
              'Login latency cleanup',
              'Decade of expired sessions/tokens',
              'Automated cleanup jobs',
              'Faster login; less background load',
              'Performance, pragmatism',
            ],
            [
              'Campaign caching + CTEs',
              'Query/page-load pressure on donations',
              'Program-level cache + SQL rewrite',
              'Reduced load (qualitative OK if no exact %)',
              'Caching, SQL optimization',
            ],
            [
              'Concurrent media upload race',
              'Photo/video XML updates racing',
              'Synchronized update paths',
              'Reliable persistence under concurrency',
              'Concurrency, correctness',
            ],
            [
              'Angular standards + mentoring',
              'Inconsistent SPA practices',
              'Standards, interviews, onboarding mentorship',
              '100+ reviews; stronger release confidence',
              'Staff leadership / influence',
            ],
            [
              'Telstra migration (bonus)',
              'Copper→fiber workflow orchestration',
              'Spring services + Camunda + RabbitMQ + Splunk incidents',
              'Migrations without subscription disruption',
              'Messaging, workflows, ops',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Staff upgrade to every story',
          body: 'Add: who else was involved, what alternative you rejected, how you reduced blast radius, and how you prevented recurrence (test, alert, runbook, design rule). Senior stories end at the fix; Staff stories end at the **system improvement**.',
        },
      ],
    },
    {
      id: 'company-packs',
      title: 'Company / JD Cluster Packs',
      blocks: [
        {
          type: 'expandable',
          title: 'Twilio Staff / Principal',
          open: true,
          blocks: [
            {
              type: 'markdown',
              value:
                '**Emphasize:** high-scale messaging mental models, multi-region, SLOs, Java concurrency, Kafka/Kinesis vocabulary, containers, CI/CD, AI tooling.\n**Prep:** Phase 2 Kafka + Phase 3 cloud + Phase 4 multi-region designs.\n**Watch-outs:** Don’t overclaim Flink; be honest about RabbitMQ→Kafka transfer learning.\n**Ask them:** event volume, multi-region active-active vs failover, on-call model for Staff.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Netomi Software Architect',
          blocks: [
            {
              type: 'markdown',
              value:
                '**Emphasize:** Java/Spring, MySQL tuning, Redis caching/rate limits, AWS + ECS, low-latency APIs, mentoring.\n**Prep:** SQL + Redis weeks; ECS vs EKS talking points; latency budgets.\n**Story fit:** caching CTEs, login cleanup, production debugging.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'SupplyHouse Principal Backend / Kaseya Lead',
          blocks: [
            {
              type: 'markdown',
              value:
                '**Emphasize:** Spring microservices, Docker/K8s, Jenkins CI/CD, MySQL, Redis, ELK, Nginx/HA, mentoring, code quality.\n**Prep:** Phase 3 observability + CI/CD narrative; leadership stories.\n**Bonus:** React familiarity if fullstack expectations appear.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Juniper Square Tech Lead (fullstack)',
          blocks: [
            {
              type: 'markdown',
              value:
                '**Emphasize:** architecture leadership across FE/BE, Angular depth, React literacy, AWS, Docker/K8s, async processing (Celery/RabbitMQ analogs).\n**Prep:** Phase 5 React + GraphQL basics; be ready to discuss FastAPI as a learnable peer to Spring.\n**Honesty:** Primary backend is Java/Spring; productive in Python APIs within weeks if required.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Kafka / streaming leads (Samay, Atlassian-style)',
          blocks: [
            {
              type: 'markdown',
              value:
                '**Emphasize:** Kafka expertise, integration architecture, incident leadership, Java stream processing awareness.\n**Prep:** Kafka page + outbox + consumer lag war stories (lab-derived).\n**Atlassian extras:** search/Lucene awareness only if you’ve studied it — otherwise stay on pipelines/K8s/Java APM.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'Generic Staff (Jobgether, Oportun)',
          blocks: [
            {
              type: 'markdown',
              value:
                '**Emphasize:** end-to-end ownership, frameworks that multiply team output, mentoring seniors, cross-team delivery, REST + SQL + cloud.\n**Prep:** Story bank + design doc + influence examples.\n**Coding:** still practice — these loops often keep DSA.',
            },
          ],
        },
        {
          type: 'expandable',
          title: 'AI-native stretch (EPAM, Spydra)',
          blocks: [
            {
              type: 'markdown',
              value:
                '**Emphasize:** GCP Generative AI Leader, daily agentic workflows, RAG mini, judgment about hallucinations, SDLC integration.\n**Prep:** Phase 5 only after Phases 1–4 are solid.\n**Positioning:** Staff engineer who accelerates delivery with AI — not a research ML engineer.',
            },
          ],
        },
      ],
    },
    {
      id: 'application-strategy',
      title: 'Application Strategy & Metrics',
      blocks: [
        {
          type: 'markdown',
          value:
            '### Weekly operating metrics (Phase 6)\n\n- Applications submitted: **8–12** tailored (not spray).\n- Conversations / screens: track conversion; if <15% recruiter reply, rewrite LinkedIn + first resume bullets.\n- Mocks: **≥2** timed technical reps/week.\n- Checklist: finish open Phase 1–3 items before heavy applying if still incomplete.',
        },
        {
          type: 'heading',
          level: 3,
          text: 'Resume bullet templates (Staff language)',
        },
        {
          type: 'code',
          language: 'markdown',
          filename: 'resume-bullet-patterns.md',
          code: `Owned production incident response for multi-tenant Java services (~750 orgs),
diagnosing Hibernate/ThreadLocal isolation failures and shipping a JDBC fix
that restored tenant boundaries and stopped authentication failures.

Led Oracle 11g→19c readiness on a business-critical fundraising platform:
resolved encryption, JDBC, SQL compatibility, and pagination issues across
phased environments; improved long-running query performance with newer SQL features.

Drove incremental monolith decomposition into Spring Boot services and Angular
modules, defining boundaries that reduced coupling without disrupting customer
fundraising workflows.

Established Angular SPA standards and mentored engineers through architecture
reviews and 100+ production-focused code reviews, improving release confidence.`,
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Keyword coverage to weave naturally',
          body: 'microservices, multi-tenant, observability, SLO/error budget, incident postmortem, CI/CD, Docker/Kubernetes, Redis caching, event-driven (as you gain Kafka), idempotency, technical leadership, design reviews, AWS/GCP.',
        },
      ],
    },
    {
      id: 'study-links',
      title: 'Deep Study Links',
      blocks: [
        {
          type: 'markdown',
          value:
            'Use this platform’s existing pages as the curriculum spine. The roadmap tells you **when**; these pages tell you **what**.',
        },
        {
          type: 'table',
          headers: ['Topic', 'Page'],
          rows: [
            ['Interview framework', '[/designs/interview-framework](/designs/interview-framework)'],
            ['Java', '[/designs/java-interview](/designs/java-interview)'],
            ['Spring Boot', '[/designs/spring-boot-interview](/designs/spring-boot-interview)'],
            [
              'Spring production',
              '[/designs/spring-boot-production-interview](/designs/spring-boot-production-interview)',
            ],
            ['SQL', '[/designs/sql-interview](/designs/sql-interview)'],
            ['Kafka', '[/designs/kafka-interview](/designs/kafka-interview)'],
            [
              'Redis / cache',
              '[/designs/spring-redis-cache-interview](/designs/spring-redis-cache-interview)',
            ],
            ['Kubernetes', '[/designs/kubernetes-interview](/designs/kubernetes-interview)'],
            [
              'AI engineering',
              '[/designs/ai-engineering-interview](/designs/ai-engineering-interview)',
            ],
            [
              'Ticket concurrency / fencing',
              '[/designs/movie-ticket-booking](/designs/movie-ticket-booking)',
            ],
            [
              'Transactional outbox',
              '[/designs/transactional-outbox](/designs/transactional-outbox)',
            ],
            [
              'Idempotent consumers',
              '[/designs/idempotent-consumer](/designs/idempotent-consumer)',
            ],
            ['Payment gateway', '[/designs/payment-gateway](/designs/payment-gateway)'],
            ['Leader election', '[/designs/leader-election](/designs/leader-election)'],
            ['ACID / isolation', '[/designs/acid-transactions](/designs/acid-transactions)'],
          ],
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Self-Check Interview Questions',
      blocks: [
        {
          type: 'interviewQa',
          title: 'You are ready when you can answer these cold',
          items: [
            {
              question:
                'Explain a production bug only you could have caught — what changed in the system afterward?',
              answer:
                'Use the tenant isolation or SQL alias story. End with a prevention mechanism (test, invariant, review checklist), not only the patch.',
            },
            {
              question:
                'How would you stop double-selling the last inventory item across two app servers?',
              answer:
                'Atomic DB conditional update + unique constraint as source of truth; Redis lease for coordination; fencing tokens against zombie holders; never charge on a stale read. See movie-ticket-booking.',
            },
            {
              question: 'Kafka consumer is lagging — how do you diagnose and mitigate?',
              answer:
                'Check partition count vs concurrency, processing time, GC, downstream DB, poison messages, rebalance storms; scale consumers carefully; consider parallelization keys and idempotent handlers.',
            },
            {
              question: 'When is Redis the wrong cache?',
              answer:
                'Strongly consistent reads required without invalidation design; huge working set with poor hit rate; need complex queries; or when local Caffeine + DB is simpler and good enough.',
            },
            {
              question: 'ECS or EKS for a Spring microservice estate?',
              answer:
                'ECS: less ops overhead, AWS-native. EKS: portability, richer ecosystem, more complexity. Choose based on team skills, multi-cloud needs, and existing platform investment.',
            },
            {
              question: 'How do you use AI tooling without shipping hallucinations?',
              answer:
                'Constrain tasks, require tests, review diffs like a junior PR, never trust security-sensitive code blindly, keep architecture decisions human-owned. Demo a concrete workflow.',
            },
            {
              question: 'Tell me about a time you influenced engineers without authority.',
              answer:
                'Angular SPA standards, mentoring, design reviews, interview loops — show adoption metrics or qualitative team outcomes.',
            },
            {
              question: 'Design a multi-tenant SaaS data model — which isolation strategy and why?',
              answer:
                'Compare shared schema + tenant_id, schema-per-tenant, DB-per-tenant. Relate to your shared-database schema-isolated Oracle experience and failure modes (cross-tenant leakage).',
            },
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'callout',
          variant: 'summary',
          title: 'Key takeaways',
          body: '1. You are **already eligible** for most Java Staff/Lead/Architect openings — apply while training gaps.\n2. The non-negotiable bridges are **Kafka, Redis, Staff system design reps, DSA cadence, AWS/Terraform fluency, and AI-tooling demos**.\n3. Follow the **24-week phases in order**; do not skip Phase 2.\n4. Use the **checklist** (localStorage) as your source of truth for completion.\n5. Skip low-ROI specialties (OpenShift/Camel/compilers); keep AI roles as **10% stretch**.\n6. Convert Blackbaud scars into **Staff stories** that end in system-level prevention.',
        },
        {
          type: 'references',
          items: [
            {
              label: 'System Design Interview Framework (RESHADED)',
              url: '/designs/interview-framework',
              source: 'This platform',
            },
            {
              label: 'Java Interview',
              url: '/designs/java-interview',
              source: 'This platform',
            },
            {
              label: 'Kafka Interview',
              url: '/designs/kafka-interview',
              source: 'This platform',
            },
            {
              label: 'Movie Ticket Booking — concurrency & fencing',
              url: '/designs/movie-ticket-booking',
              source: 'This platform',
            },
          ],
        },
      ],
    },
  ],
};

export default content;
