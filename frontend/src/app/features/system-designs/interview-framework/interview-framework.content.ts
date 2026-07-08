import { DesignContent } from '../../../shared/models';
import { INTERVIEW_FRAMEWORK_META } from './interview-framework.meta';

/**
 * General interview-prep guide: the RESHADED framework, time budgets, practical
 * tips, and how system design differs from HLD, LLD, and machine coding.
 */
const content: DesignContent = {
  meta: INTERVIEW_FRAMEWORK_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'System design interviews are **open-ended**: there is rarely one correct answer. What interviewers evaluate is whether you can **navigate ambiguity**, **structure your thinking**, and **justify trade-offs** under time pressure. A repeatable framework keeps you from jumping straight to boxes-and-arrows or drowning in low-level details.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'What interviewers actually score',
          body: 'Communication, requirement gathering, estimation sanity, architectural choices, depth where it matters, awareness of failure modes, and trade-off reasoning. Perfect diagrams with no math and no scope boundaries usually score worse than a clear, structured walkthrough.',
        },
        {
          type: 'markdown',
          value:
            'This guide introduces **RESHADED** — an eight-step checklist for structuring a 45–60 minute design discussion — plus tips for decoding whether the interviewer wants **system design**, **HLD**, **LLD**, or **machine coding**.',
        },
      ],
    },
    {
      id: 'reshaded-framework',
      title: 'The RESHADED Strategy',
      blocks: [
        {
          type: 'markdown',
          value:
            '**RESHADED** is a mnemonic for walking through a design from problem to evaluation. You will not always spend equal time on every letter — skip or compress steps the interviewer directs you away from — but having the full map prevents you from forgetting requirements, scale, or trade-offs.',
        },
        {
          type: 'mermaid',
          caption: 'RESHADED flow for a typical 45–60 minute session.',
          definition: `flowchart LR
  R["Requirements"] --> E["Estimation"]
  E --> S["Storage schema"]
  S --> H["High-level design"]
  H --> A["APIs"]
  A --> D["Detailed design"]
  D --> Ev["Evaluation"]
  Ev --> Dist["Distinctive feature"]`,
        },
        {
          type: 'timeline',
          items: [
            {
              title: 'R — Requirements',
              description:
                'Functional: what users can do (3–5 core flows). Non-functional: scale, latency, availability, consistency, durability. Explicitly state **out of scope** (auth internals, ML training, billing) to save time.',
              meta: '~8–10 min',
            },
            {
              title: 'E — Estimation',
              description:
                'Back-of-the-envelope: DAU → QPS, storage growth, bandwidth. Round aggressively; order-of-magnitude is enough. Numbers drive cache size, sharding, and technology choices.',
              meta: '~5 min',
            },
            {
              title: 'S — Storage schema',
              description:
                'Entities, access patterns, SQL vs NoSQL, partition/shard keys, indexes. Optional in some interviews but almost always helpful before drawing architecture.',
              meta: '~5 min',
            },
            {
              title: 'H — High-level design',
              description:
                'Main components and data flow: clients, gateway, services, databases, caches, queues, CDN. One diagram understandable in 30 seconds. No deep dives yet.',
              meta: '~8–10 min',
            },
            {
              title: 'A — APIs',
              description:
                'Map requirements to 3–7 critical endpoints (method, path, request/response sketch). Clarifies service boundaries and what the client actually calls.',
              meta: '~3–5 min',
            },
            {
              title: 'D — Detailed design',
              description:
                'Go deep on **2–3** components the interviewer cares about: fan-out strategy, idempotency, hot keys, consistency model, caching, sharding. Follow their lead.',
              meta: '~15–20 min',
            },
            {
              title: 'E — Evaluation',
              description:
                'Compare design to NFRs. Name trade-offs, bottlenecks, single points of failure, and what you would add with more time (multi-region, monitoring, cost).',
              meta: '~3–5 min',
            },
            {
              title: 'D — Distinctive component',
              description:
                'The feature unique to *this* problem: Snowflake IDs for Twitter, hybrid fan-out for feeds, content-defined chunking for Dropbox. Can appear at any step when the problem demands it.',
              meta: 'as needed',
            },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Drive the interview proactively',
          body: 'Say what you are doing next: "Let me clarify requirements before I draw anything" or "I will estimate scale so my sharding choice is grounded." Interviewers reward candidates who **manage the clock** and invite feedback at natural checkpoints.',
        },
      ],
    },
    {
      id: 'requirements-deep-dive',
      title: 'R — Requirements (Deep Dive)',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Questions to ask upfront',
          practices: [
            '**Who are the users?** Mobile, web, internal admins, other services?',
            '**What are the core actions?** Read-heavy vs write-heavy? Real-time vs batch?',
            '**Scale assumptions?** Users, requests/day, data retention, geographic scope?',
            '**Latency & availability targets?** p99 latency, SLA (99.9 vs 99.99)?',
            '**Consistency expectations?** Strong for money/inventory; eventual for feeds/counts?',
            '**What is explicitly out of scope?** Say it aloud and get a nod.',
          ],
        },
        {
          type: 'featureComparison',
          caption: 'Prioritize non-functional requirements by system type.',
          columns: ['Social feed', 'Payments', 'File sync'],
          rows: [
            { feature: 'Availability over consistency', values: [true, false, false] },
            { feature: 'Sub-second read latency', values: [true, false, true] },
            { feature: 'Exactly-once / idempotency', values: [false, true, true] },
            { feature: 'Durability (never lose data)', values: [false, true, true] },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Do not design in a vacuum',
          body: 'Starting with "We need a load balancer and Kafka" before requirements signals inexperience. Spend the first 8–10 minutes aligning on scope — it is not wasted time; it is the interview.',
        },
      ],
    },
    {
      id: 'estimation-deep-dive',
      title: 'E — Estimation (Deep Dive)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Estimation proves your design fits reality. State assumptions clearly, round to one significant figure, and use the results in later steps ("At ~50k QPS we need a cache in front of the DB").',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Avg QPS', value: 'DAU × actions/day ÷ 86,400', hint: 'daily average' },
            { label: 'Peak QPS', value: 'Avg × 2–5×', hint: 'events, evenings' },
            {
              label: 'Storage / year',
              value: 'writes/day × size × retention',
              hint: 'include replicas',
            },
            { label: 'Bandwidth', value: 'QPS × payload size', hint: 'egress dominates video' },
            { label: 'Cache size', value: '~20% of hot data', hint: '80/20 rule of thumb' },
          ],
        },
        {
          type: 'math',
          display: true,
          tex: 'QPS_{avg} = \\frac{DAU \\times actions_{day}}{86400}, \\quad QPS_{peak} \\approx k \\times QPS_{avg}\\ (k \\approx 2\\text{–}5)',
          caption:
            'Typical traffic estimation. Always mention peak — averages hide lunch rushes and viral spikes.',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Sanity-check your numbers',
          body: 'If you compute 10 billion QPS for a niche app, re-check assumptions. Interviewers care that you catch absurd results, not that you memorize exact constants.',
        },
      ],
    },
    {
      id: 'high-level-and-detailed',
      title: 'H, A, D — Architecture & Depth',
      blocks: [
        {
          type: 'markdown',
          value:
            '**High-level design** names the building blocks and how data moves. **APIs** nail down service contracts. **Detailed design** is where senior candidates differentiate — pick the hard parts and go deep.',
        },
        {
          type: 'bestPractices',
          title: 'Common deep-dive topics (pick 2–3)',
          practices: [
            '**Fan-out**: push vs pull vs hybrid (Twitter, Instagram).',
            '**Hot keys**: sharded counters, celebrity problem, CDN absorption.',
            '**Idempotency**: client keys, dedupe stores, at-least-once → effectively-once.',
            '**Consistency**: CAP framing, quorum, saga vs 2PC for checkout.',
            '**Caching**: cache-aside, TTL + jitter, stampede mitigation.',
            '**Partitioning**: shard key choice, rebalancing, cross-shard queries.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Follow the interviewer’s curiosity',
          body: 'When they ask "What happens if this service dies?" or "How do you handle 100M followers?", that is your cue to zoom into **D — Detailed design**. Do not keep adding boxes to the high-level diagram unless asked.',
        },
      ],
    },
    {
      id: 'time-budget',
      title: '45–60 Minute Time Budget',
      blocks: [
        {
          type: 'table',
          caption: 'Suggested time split for a one-hour system design round.',
          headers: ['Phase', 'Minutes', 'Output'],
          rows: [
            ['Requirements + scope', '8–10', 'Written FR/NFR list, out-of-scope'],
            ['Estimation', '5', 'QPS, storage, bandwidth on board'],
            ['Storage schema', '5', 'Entities, PK, partition key'],
            ['High-level design', '8–10', 'One end-to-end diagram'],
            ['APIs', '3–5', '3–7 critical endpoints'],
            ['Detailed design', '15–20', '2–3 deep dives with trade-offs'],
            ['Evaluation + Q&A', '5–8', 'Bottlenecks, improvements, recap'],
          ],
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Golden rule',
          body: 'Never spend more than half the interview drawing before you have **requirements + estimates**. Depth on one hard problem beats a shallow tour of twelve microservices.',
        },
      ],
    },
    {
      id: 'interview-types',
      title: 'System Design vs HLD vs LLD vs Machine Coding',
      blocks: [
        {
          type: 'markdown',
          value:
            'Companies use these terms inconsistently. The **same job loop** may include different rounds. Learn to read **signals in the prompt** and confirm with the interviewer when unsure.',
        },
        {
          type: 'featureComparison',
          caption: 'How the four interview types differ.',
          columns: ['System design', 'HLD', 'LLD', 'Machine coding'],
          rows: [
            {
              feature: 'Primary focus',
              values: [
                'End-to-end distributed system',
                'Component architecture',
                'Classes, modules, code structure',
                'Working code in IDE',
              ],
            },
            {
              feature: 'Typical duration',
              values: ['45–60 min', '45–60 min', '45–60 min', '60–90 min'],
            },
            {
              feature: 'Deliverable',
              values: [
                'Diagrams + trade-offs',
                'Service diagram + data flow',
                'UML / class design + APIs',
                'Compilable project',
              ],
            },
            {
              feature: 'Depth expected',
              values: [
                'Scale, CAP, bottlenecks',
                'Service boundaries, queues, DB choice',
                'SOLID, patterns, concurrency',
                'Correctness, tests, edge cases',
              ],
            },
            {
              feature: 'Code written?',
              values: [false, false, 'Pseudocode / snippets', true],
            },
          ],
        },
        {
          type: 'markdown',
          value:
            '**System design** (often used interchangeably with **HLD** at product companies) asks you to design a **distributed system** at scale: "Design Twitter", "Design a rate limiter", "Design Dropbox". Expect RESHADED-style coverage — requirements through evaluation — with emphasis on scalability, reliability, and trade-offs.',
        },
        {
          type: 'markdown',
          value:
            '**HLD (High-Level Design)** sometimes means the same as system design, but in **multi-round loops** it can mean a **narrower slice**: architecture of one feature or one service group without full capacity math. Signals: "Design the notification pipeline" or "Architecture for the search subsystem." Still diagrams and components, less breadth than "Design Amazon."',
        },
        {
          type: 'markdown',
          value:
            '**LLD (Low-Level Design)** zooms into **one service or module** with **class-level** detail: entities, interfaces, design patterns, database schema, method signatures. Signals: "Design the parking lot system" (often LLD despite sounding big), "Design an in-memory cache with LRU eviction", "Class diagram for a chess game." Expect OOP, SOLID, and possibly multithreading — rarely sharding across data centers.',
        },
        {
          type: 'markdown',
          value:
            '**Machine coding** (also **PS + code**, **pair programming**) requires **runnable code** in a fixed time: build a working subset (e.g. snake game, expense splitter, rate limiter library, URL shortener API). Signals: shared IDE, "implement", "write code", unit tests mentioned. Prioritize **correct core behavior**, clean structure, and handling obvious edge cases over premature optimization.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Overlap is normal',
          body: 'A "system design" round may end with "now drill into the timeline service." A machine coding round for a cache still needs a brief API sketch before coding. Treat labels as **center of gravity**, not rigid boxes.',
        },
      ],
    },
    {
      id: 'decoding-the-interviewer',
      title: 'How to Read What They Want',
      blocks: [
        {
          type: 'table',
          caption: 'Prompt signals and what they usually mean.',
          headers: ['You hear / see', 'Likely round type', 'What to do first'],
          rows: [
            [
              '"Design X at scale for 100M users"',
              'System design / HLD',
              'Requirements → estimation → architecture',
            ],
            [
              '"Whiteboard only, no code"',
              'System design / HLD',
              'RESHADED; avoid class diagrams unless asked',
            ],
            [
              '"Open your IDE"',
              'Machine coding',
              'Clarify MVP scope; scaffold; implement happy path',
            ],
            [
              '"Class diagram / interfaces / methods"',
              'LLD',
              'Entities, relationships, key methods; patterns',
            ],
            [
              '"How would you implement LRU / thread pool?"',
              'LLD or machine coding',
              'Ask: diagram only or live code?',
            ],
            [
              '"Focus on the API and data model"',
              'LLD or narrow HLD',
              'Schema + endpoints before boxes',
            ],
            [
              '"How does this work in production at Meta/Google?"',
              'System design depth',
              'Real-world constraints, failure modes, trade-offs',
            ],
          ],
        },
        {
          type: 'bestPractices',
          title: 'Clarifying questions that always help',
          practices: [
            '"Should I optimize for a **45-minute breadth-first** pass or go deep on one component?"',
            '"Is this **back-of-envelope scale** expected, or is the focus on **code structure**?"',
            '"Do you want **REST APIs** sketched, or is the data model the priority?"',
            '"Are we designing the **whole product** or **one team\'s service**?"',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Misclassification is costly',
          body: 'Treating an LLD prompt ("design a deck of cards") like system design (sharding, Kafka, multi-region) wastes time and confuses the interviewer. Treating system design like LLD (only classes, no scale) looks shallow. When in doubt, **ask in the first two minutes**.',
        },
      ],
    },
    {
      id: 'practical-tips',
      title: 'Practical Tips',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Do',
          practices: [
            '**Think out loud** — silence reads as stuck; narrate trade-offs.',
            '**State assumptions** and write them on the board.',
            '**Name patterns** you recognize (fan-out-on-write, saga, cache-aside) and explain why they fit.',
            '**Acknowledge weaknesses** in your design and how you would mitigate them.',
            '**Leave 5 minutes** for summary and interviewer questions.',
            '**Connect to designs you know** — "Similar to the hybrid timeline in the Twitter design…"',
          ],
        },
        {
          type: 'prosCons',
          title: 'Common anti-patterns vs good habits',
          pros: [
            'Ask clarifying questions before drawing.',
            'Pick a default design and justify it.',
            'Match depth to the prompt (scale vs classes vs code).',
          ],
          cons: [
            'Jumping to microservices before clarifying scale.',
            'Ignoring failure cases (single DB, no retries, no idempotency).',
            'Over-engineering (Kubernetes + 12 services for a toy problem).',
            'Under-engineering (single MySQL for billions of writes with no plan).',
            'Spending 25 minutes on authentication unless that is the prompt.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'When you have not seen the problem before',
          body: 'Decompose into familiar pieces: storage + API + async pipeline + cache + search. A payment system is correctness + ledger + idempotency; a feed is fan-out + ranking; file sync is metadata + blob store + delta sync. You do not need to have designed Stripe to design *a* payment flow.',
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Pre-Submit Checklist',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Before you say "we are done"',
          practices: [
            '**R**: Functional + non-functional requirements captured; out-of-scope stated.',
            '**E**: Order-of-magnitude QPS, storage, or bandwidth computed.',
            '**S**: Main entities and partition/shard key identified.',
            '**H**: End-to-end diagram with named components.',
            '**A**: Critical APIs listed.',
            '**D**: At least one bottleneck addressed (hot key, fan-out, consistency).',
            '**E**: Trade-offs articulated; one improvement named for v2.',
            '**Failure**: What happens when DB/cache/queue/region fails?',
          ],
        },
        {
          type: 'interviewQa',
          items: [
            {
              question: 'What is RESHADED?',
              answer:
                'An eight-step framework: **Requirements**, **Estimation**, **Storage schema**, **High-level design**, **APIs**, **Detailed design**, **Evaluation**, and **Distinctive component**. It structures a full system design interview from scope through trade-offs.',
            },
            {
              question: 'How is system design different from LLD?',
              answer:
                "System design focuses on **distributed systems at scale** — components, data flow, CAP, sharding, queues, and trade-offs across services. LLD focuses on **one module's internal structure** — classes, interfaces, patterns, and method-level APIs, usually without cross-datacenter scaling.",
            },
            {
              question: 'How is machine coding different from system design?',
              answer:
                'Machine coding produces **working code** in an IDE within a time box. System design produces **architecture and reasoning** on a whiteboard with little or no code. Machine coding is judged on correctness, structure, and edge cases; system design on requirements, scale, and trade-offs.',
            },
            {
              question: 'How much time should I spend on requirements?',
              answer:
                'Roughly **8–10 minutes** in a 45–60 minute round. Aligning on scope prevents wasted depth on the wrong problem and demonstrates senior communication habits.',
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
          body: '1. Use **RESHADED** to structure every system design round: requirements and estimates before architecture; depth on 2–3 hard parts; explicit trade-offs at the end.\n2. **System design / HLD** = distributed system, scale, and failure modes; **LLD** = classes and modules; **machine coding** = runnable code — read the prompt signals and ask if unclear.\n3. **Drive the interview**: state assumptions, manage time, and invite feedback at checkpoints.\n4. Recognize **patterns** from real systems (feeds, payments, sync, streaming) rather than inventing from scratch.\n5. Finish with a **checklist**: requirements, math, diagram, APIs, deep dive, failures, and v2 improvements.',
        },
      ],
    },
  ],
};

export default content;
