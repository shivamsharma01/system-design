import { RoadmapChecklistGroup } from '../../../shared/models';

/** Granular checklist items for localStorage progress tracking. */
export const STAFF_ROADMAP_CHECKLIST_GROUPS: RoadmapChecklistGroup[] = [
  {
    id: 'phase-1',
    title: 'Phase 1 · Weeks 1–4 · Core depth',
    items: [
      {
        id: 'p1-read-java-interview',
        label: 'Complete Java interview page: JVM, GC, memory model, equals/hashCode',
        href: '/designs/java-interview',
        estimateHours: 8,
      },
      {
        id: 'p1-concurrency-juc',
        label:
          'Drill Java concurrency: threads, locks, ConcurrentHashMap, CompletableFuture, virtual threads overview',
        href: '/designs/java-interview#senior-lead-concurrency',
        estimateHours: 10,
      },
      {
        id: 'p1-spring-boot-core',
        label: 'Finish Spring Boot interview page: IoC, AOP, transactions, actuators',
        href: '/designs/spring-boot-interview',
        estimateHours: 8,
      },
      {
        id: 'p1-spring-production',
        label: 'Study Spring Boot production interview: configs, profiles, failure modes',
        href: '/designs/spring-boot-production-interview',
        estimateHours: 6,
      },
      {
        id: 'p1-hibernate-n1',
        label:
          'Write 1-page notes on Hibernate N+1, Session/ThreadLocal, flush modes (tie to your tenant isolation story)',
        estimateHours: 4,
      },
      {
        id: 'p1-sql-interview',
        label: 'Complete SQL interview drills: indexes, EXPLAIN, isolation levels, deadlocks',
        href: '/designs/sql-interview',
        estimateHours: 8,
      },
      {
        id: 'p1-oracle-postgres-map',
        label:
          'Map Oracle strengths (CTEs, pagination, upgrade lessons) to Postgres talking points',
        estimateHours: 3,
      },
      {
        id: 'p1-dsa-arrays-hash',
        label: 'DSA week cadence: 5 easy + 5 medium (arrays/hashmaps) in Java',
        estimateHours: 8,
      },
      {
        id: 'p1-dsa-trees-graphs',
        label: 'DSA: trees, BFS/DFS, heaps — 10 mediums timed (45 min each)',
        estimateHours: 10,
      },
      {
        id: 'p1-dsa-dp-sliding',
        label: 'DSA: sliding window, two pointers, basic DP patterns — 8 problems',
        estimateHours: 8,
      },
      {
        id: 'p1-mock-coding-1',
        label: 'Mock coding #1 (60 min): 1 medium array/hash + talk through complexity',
        estimateHours: 2,
      },
      {
        id: 'p1-story-tenant-isolation',
        label: 'Draft STAR story: multi-tenant Hibernate/ThreadLocal isolation failure + JDBC fix',
        estimateHours: 2,
      },
      {
        id: 'p1-story-oracle-upgrade',
        label: 'Draft STAR story: Oracle 11g→19c upgrade readiness for ~750 orgs',
        estimateHours: 2,
      },
      {
        id: 'p1-equals-hashcode',
        label: 'Drill equals/hashCode + HashMap pitfalls with 3 broken examples fixed',
        estimateHours: 2,
      },
      {
        id: 'p1-rest-api-design',
        label: 'Write REST API guidelines notes: versioning, idempotency headers, error model',
        estimateHours: 2,
      },
      {
        id: 'p1-done-criteria',
        label:
          'Phase 1 done criteria: explain GC + Spring transactions + index choice without notes',
        estimateHours: 1,
      },
    ],
  },
  {
    id: 'phase-2',
    title: 'Phase 2 · Weeks 5–8 · Distributed systems depth',
    items: [
      {
        id: 'p2-kafka-interview',
        label: 'Complete Kafka interview page end-to-end',
        href: '/designs/kafka-interview',
        estimateHours: 10,
      },
      {
        id: 'p2-kafka-lab',
        label: 'Hands-on: produce/consume with Spring Kafka; demo idempotent consumer + DLQ config',
        estimateHours: 8,
      },
      {
        id: 'p2-outbox',
        label: 'Study transactional outbox pattern and implement a minimal sketch',
        href: '/designs/transactional-outbox',
        estimateHours: 5,
      },
      {
        id: 'p2-redis-interview',
        label: 'Complete Spring Redis cache interview page',
        href: '/designs/spring-redis-cache-interview',
        estimateHours: 6,
      },
      {
        id: 'p2-redis-locks',
        label: 'Master Redis SET NX PX, owner-checked release, fencing tokens vs DB CAS',
        href: '/designs/movie-ticket-booking',
        estimateHours: 5,
      },
      {
        id: 'p2-consistency',
        label: 'Write comparison notes: strong vs eventual, saga vs 2PC, idempotency keys',
        href: '/designs/idempotent-consumer',
        estimateHours: 4,
      },
      {
        id: 'p2-caching-pitfalls',
        label: 'Drill cache stampede, thundering herd, TTL vs write-through, Redis vs local cache',
        estimateHours: 3,
      },
      {
        id: 'p2-rabbitmq-bridge',
        label:
          'Map your RabbitMQ/Camunda experience to Kafka interview vocabulary (offsets, consumer groups)',
        estimateHours: 2,
      },
      {
        id: 'p2-acid',
        label: 'Review ACID/isolation page; be able to draw dirty/non-repeatable/phantom examples',
        href: '/designs/acid-transactions',
        estimateHours: 3,
      },
      {
        id: 'p2-dsa-continue',
        label: 'Continue DSA: 8 timed mediums (graphs + intervals + heaps)',
        estimateHours: 8,
      },
      {
        id: 'p2-mock-design-messaging',
        label: 'Mock system design (45 min): notification service or order pipeline with Kafka',
        estimateHours: 2,
      },
      {
        id: 'p2-story-race-upload',
        label: 'Draft STAR: race condition in concurrent XML media uploads + fix',
        estimateHours: 1,
      },
      {
        id: 'p2-partition-keys',
        label:
          'Design partition key strategy for orders vs user notifications (ordering vs fan-out)',
        estimateHours: 2,
      },
      {
        id: 'p2-rate-limit-redis',
        label: 'Implement/sketch Redis token-bucket or sliding-window rate limiter',
        estimateHours: 3,
      },
      {
        id: 'p2-done-criteria',
        label:
          'Phase 2 done criteria: whiteboard Kafka consumer lag + Redis lock zombie problem from memory',
        estimateHours: 1,
      },
    ],
  },
  {
    id: 'phase-3',
    title: 'Phase 3 · Weeks 9–12 · Cloud, K8s, CI/CD',
    items: [
      {
        id: 'p3-k8s-interview',
        label: 'Complete Kubernetes interview page',
        href: '/designs/kubernetes-interview',
        estimateHours: 8,
      },
      {
        id: 'p3-k8s-lab',
        label: 'Hands-on: deploy a Spring Boot service with Deployment, Service, HPA, probes',
        estimateHours: 6,
      },
      {
        id: 'p3-docker-multi',
        label: 'Write multi-stage Dockerfile + healthcheck notes for Java 17 images',
        estimateHours: 3,
      },
      {
        id: 'p3-aws-map',
        label:
          'Build AWS service map flashcards: ECS vs EKS, SQS/SNS, RDS, S3, IAM, CloudWatch, ALB',
        estimateHours: 5,
      },
      {
        id: 'p3-gcp-transfer',
        label: 'Translate GCP PCA knowledge to AWS interview answers (and vice versa)',
        estimateHours: 3,
      },
      {
        id: 'p3-terraform-starter',
        label:
          'Terraform lab: VPC-ish minimal stack or ECS/RDS modules; explain state + plan/apply',
        estimateHours: 8,
      },
      {
        id: 'p3-cicd',
        label:
          'Document CI/CD interview answers using Jenkins + Azure Pipelines experience; add GitHub Actions sketch',
        estimateHours: 4,
      },
      {
        id: 'p3-observability',
        label:
          'Study metrics/logs/traces: Prometheus, Grafana, Splunk stories; define 3 SLOs for a checkout API',
        estimateHours: 5,
      },
      {
        id: 'p3-elk-nginx',
        label: 'Notes: ELK stack roles + Nginx/ALB load balancing for Principal Backend JDs',
        estimateHours: 2,
      },
      {
        id: 'p3-dsa-hard-lite',
        label: 'DSA: 6 harder mediums / light hards under 50 minutes each',
        estimateHours: 8,
      },
      {
        id: 'p3-mock-design-scale',
        label:
          'Mock design: multi-AZ ticket booking or URL shortener with capacity + failure modes',
        estimateHours: 2,
      },
      {
        id: 'p3-iam-least-privilege',
        label: 'Sketch IAM least-privilege for a service role: S3 read, SQS consume, RDS connect',
        estimateHours: 2,
      },
      {
        id: 'p3-capacity-backofenvelope',
        label: 'Practice 3 back-of-envelope capacity estimates (QPS, storage, bandwidth)',
        estimateHours: 3,
      },
      {
        id: 'p3-done-criteria',
        label: 'Phase 3 done criteria: explain blue/green vs canary + K8s probe failure scenarios',
        estimateHours: 1,
      },
    ],
  },
  {
    id: 'phase-4',
    title: 'Phase 4 · Weeks 13–16 · Staff system design + leadership',
    items: [
      {
        id: 'p4-reshaded',
        label: 'Internalize RESHADED interview framework',
        href: '/designs/interview-framework',
        estimateHours: 3,
      },
      {
        id: 'p4-design-20',
        label:
          'Complete 20 system designs (outline + 1 diagram each): chat, feed, search, payments, inventory…',
        estimateHours: 20,
      },
      {
        id: 'p4-design-20-more',
        label:
          'Complete 20 more designs focusing on multi-region, rate limits, consistency trade-offs',
        estimateHours: 20,
      },
      {
        id: 'p4-movie-ticket',
        label: 'Rehearse last-ticket concurrency design aloud (DB CAS + fencing)',
        href: '/designs/movie-ticket-booking',
        estimateHours: 2,
      },
      {
        id: 'p4-payment-gateway',
        label: 'Study payment gateway + idempotency pages; practice authorize/capture saga',
        href: '/designs/payment-gateway',
        estimateHours: 4,
      },
      {
        id: 'p4-leader-election',
        label: 'Review leader election / fencing tokens for distributed coordination rounds',
        href: '/designs/leader-election',
        estimateHours: 3,
      },
      {
        id: 'p4-adr-template',
        label:
          'Write 2 sample ADRs (monolith extraction boundary + messaging choice Kafka vs RabbitMQ)',
        estimateHours: 4,
      },
      {
        id: 'p4-story-bank',
        label:
          'Finalize 8 STAR stories: upgrade, isolation bug, SQL alias, Java 17, caching, race, mentoring, incident',
        estimateHours: 6,
      },
      {
        id: 'p4-staff-behaviors',
        label:
          'Practice Staff behaviors: influence without authority, technical strategy, saying no with trade-offs',
        estimateHours: 3,
      },
      {
        id: 'p4-design-doc',
        label:
          'Produce one full design doc (problem, constraints, options, decision, rollout, risks)',
        estimateHours: 5,
      },
      {
        id: 'p4-mock-staff',
        label: 'Mock Staff round: architecture deep dive on Blackbaud modernization (45–60 min)',
        estimateHours: 2,
      },
      {
        id: 'p4-rate-limiter-design',
        label: 'Full design rehearsal: distributed rate limiter (token bucket + Redis + edge)',
        estimateHours: 2,
      },
      {
        id: 'p4-chat-design',
        label: 'Full design rehearsal: chat/messaging (presence, fan-out, offline store)',
        estimateHours: 2,
      },
      {
        id: 'p4-feed-design',
        label: 'Full design rehearsal: news feed (push vs pull, ranking, fan-out-on-write)',
        estimateHours: 2,
      },
      {
        id: 'p4-search-design',
        label:
          'Outline design: search autocomplete + indexing pipeline (honest about Solr/Lucene depth)',
        estimateHours: 2,
      },
      {
        id: 'p4-done-criteria',
        label: 'Phase 4 done criteria: run a 45-min design with no prep on a random prompt',
        estimateHours: 1,
      },
    ],
  },
  {
    id: 'phase-5',
    title: 'Phase 5 · Weeks 17–20 · AI fluency + fullstack bridge',
    items: [
      {
        id: 'p5-ai-interview',
        label: 'Complete AI engineering interview page',
        href: '/designs/ai-engineering-interview',
        estimateHours: 6,
      },
      {
        id: 'p5-agentic-workflow',
        label:
          'Document your Cursor/agentic workflow: where AI helps, where you never trust it, review checklist',
        estimateHours: 3,
      },
      {
        id: 'p5-rag-mini',
        label:
          'Build a tiny RAG demo (embeddings + retrieve + answer) over your own notes; record 5-min walkthrough',
        estimateHours: 10,
      },
      {
        id: 'p5-react-literacy',
        label:
          'React literacy sprint: components, hooks, state, data fetching — enough to review PRs',
        estimateHours: 8,
      },
      {
        id: 'p5-angular-story',
        label: 'Prep Angular SPA standards + PostRobot embedding story for fullstack interviews',
        estimateHours: 2,
      },
      {
        id: 'p5-graphql-basics',
        label: 'GraphQL basics: schema, resolvers, N+1, when REST is better (Juniper Square pack)',
        estimateHours: 3,
      },
      {
        id: 'p5-flink-awareness',
        label:
          'Flink/Spark awareness notes (not expertise): stream vs batch, windowing vocabulary for Twilio/Atlassian',
        estimateHours: 4,
      },
      {
        id: 'p5-security-web',
        label: 'Web security flashcards: XSS, CSRF, CORS, CSP, OAuth/OIDC basics',
        estimateHours: 3,
      },
      {
        id: 'p5-mock-ai-hm',
        label: 'Mock HM screen for AI-native role: productivity demos + engineering judgment',
        estimateHours: 1,
      },
      {
        id: 'p5-prompt-injection',
        label: 'Notes: prompt injection, data exfiltration via tools, and app-level guardrails',
        estimateHours: 2,
      },
      {
        id: 'p5-eval-basics',
        label: 'Define 5 eval cases for your RAG demo (faithfulness, refusal, citation)',
        estimateHours: 2,
      },
      {
        id: 'p5-done-criteria',
        label: 'Phase 5 done criteria: 5-min RAG demo + React vs Angular comparison without notes',
        estimateHours: 1,
      },
    ],
  },
  {
    id: 'phase-6',
    title: 'Phase 6 · Weeks 21–24 · Interview machine',
    items: [
      {
        id: 'p6-resume-pass',
        label:
          'Resume pass: map every bullet to Staff keywords (SLO, multi-tenant, modernization, ownership)',
        estimateHours: 4,
      },
      {
        id: 'p6-linkedin-headline',
        label:
          'Update LinkedIn headline/about for Staff Java + distributed systems + modernization',
        estimateHours: 1,
      },
      {
        id: 'p6-apps-cadence',
        label: 'Start weekly cadence: 8–12 tailored applications (70/20/10 mix)',
        estimateHours: 4,
      },
      {
        id: 'p6-mock-coding-3',
        label: 'Complete 3 timed coding mocks with post-mortem notes',
        estimateHours: 6,
      },
      {
        id: 'p6-mock-design-3',
        label: 'Complete 3 timed system design mocks with feedback',
        estimateHours: 6,
      },
      {
        id: 'p6-mock-behavioral-2',
        label: 'Complete 2 Staff behavioral mocks using story bank',
        estimateHours: 3,
      },
      {
        id: 'p6-pack-twilio',
        label: 'Company pack: Twilio Staff/Principal (streaming, multi-region, Java/Go, SLOs)',
        estimateHours: 3,
      },
      {
        id: 'p6-pack-netomi',
        label: 'Company pack: Netomi Architect (Java, MySQL, Redis, AWS, ECS, low latency)',
        estimateHours: 2,
      },
      {
        id: 'p6-pack-supply-kaseya',
        label:
          'Company pack: SupplyHouse / Kaseya Java Lead (Spring, K8s, Jenkins, ELK, mentoring)',
        estimateHours: 2,
      },
      {
        id: 'p6-pack-juniper',
        label: 'Company pack: Juniper Square Tech Lead (FastAPI awareness, React, GraphQL, AWS)',
        estimateHours: 2,
      },
      {
        id: 'p6-pack-kafka-lead',
        label: 'Company pack: Samay/Atlassian-style Kafka + streaming leads',
        estimateHours: 2,
      },
      {
        id: 'p6-pack-generic-staff',
        label: 'Company pack: Jobgether/Oportun generic Staff (leadership, APIs, SQL, mentoring)',
        estimateHours: 2,
      },
      {
        id: 'p6-pack-ai-stretch',
        label: 'Company pack: EPAM/Spydra AI-native stretch (RAG, agents, SDLC automation)',
        estimateHours: 2,
      },
      {
        id: 'p6-offer-prep',
        label:
          'Offer prep notes: level mapping, compensation research, questions for hiring managers',
        estimateHours: 2,
      },
      {
        id: 'p6-negotiated-questions',
        label:
          'Write 10 questions to ask interviewers (scope, on-call, Staff expectations, AI policy)',
        estimateHours: 1,
      },
      {
        id: 'p6-comp-research',
        label: 'Compensation research notes for Staff India remote / hybrid bands you care about',
        estimateHours: 2,
      },
      {
        id: 'p6-done-criteria',
        label:
          'Phase 6 done criteria: can run full loop (coding + design + behavioral) in one day with recovery notes',
        estimateHours: 1,
      },
    ],
  },
  {
    id: 'ongoing',
    title: 'Ongoing weekly habits (entire 24 weeks)',
    items: [
      {
        id: 'hab-dsa-5',
        label: 'Hit 5 coding problems most weeks (track in a simple spreadsheet)',
        estimateHours: 0,
      },
      {
        id: 'hab-design-1',
        label: 'One system design outline per week even during non-design phases',
        estimateHours: 0,
      },
      {
        id: 'hab-story-refine',
        label: 'Refine one STAR story weekly with metrics and decision trade-offs',
        estimateHours: 0,
      },
      {
        id: 'hab-read-postmortem',
        label: 'Read one public incident postmortem / engineering blog weekly',
        estimateHours: 0,
      },
      {
        id: 'hab-ai-daily',
        label: 'Use AI tooling daily on real work; capture one “trust boundary” lesson weekly',
        estimateHours: 0,
      },
      {
        id: 'hab-leetcode-review',
        label: 'Weekly spaced repetition: re-solve 3 previously solved problems blind',
        estimateHours: 0,
      },
      {
        id: 'hab-explain-aloud',
        label: 'Weekly: explain one production story aloud on a timer (3 minutes)',
        estimateHours: 0,
      },
      {
        id: 'hab-network',
        label: 'Biweekly: reach out to 2 peers/recruiters in target companies (warm or cold)',
        estimateHours: 0,
      },
    ],
  },
  {
    id: 'bonus-depth',
    title: 'Bonus depth (optional polish for target companies)',
    items: [
      {
        id: 'bonus-oauth-oidc',
        label: 'OAuth2/OIDC flows: auth code, PKCE, token lifecycle — whiteboard once',
        estimateHours: 3,
      },
      {
        id: 'bonus-mtls-gateway',
        label: 'API gateway patterns: authn/z, rate limit, mTLS awareness notes',
        estimateHours: 2,
      },
      {
        id: 'bonus-postgres-partition',
        label: 'Postgres partitioning + connection pooling talking points (PgBouncer)',
        estimateHours: 2,
      },
      {
        id: 'bonus-chaos',
        label: 'Read and summarize one chaos/resilience testing approach for your services',
        estimateHours: 2,
      },
      {
        id: 'bonus-cost',
        label: 'Add cost dimension to 3 system designs (storage, egress, compute)',
        estimateHours: 2,
      },
      {
        id: 'bonus-hotel-inventory',
        label: 'Cross-read hotel reservation concurrency page for inventory parallels',
        href: '/designs/hotel-reservation',
        estimateHours: 2,
      },
      {
        id: 'bonus-netflix-design',
        label: 'Skim Netflix system design page for CDN/streaming vocabulary',
        href: '/designs/netflix',
        estimateHours: 2,
      },
      {
        id: 'bonus-writing',
        label: 'Publish 1 short tech write-up (ADR, blog, or LinkedIn) on a production lesson',
        estimateHours: 4,
      },
    ],
  },
];
