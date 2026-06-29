import { DesignContent } from '../../../shared/models';
import { RATE_LIMITER_META } from './rate-limiter.meta';

/**
 * Flagship-depth example (peer of the Netflix, Amazon, etc. designs). An
 * infrastructure / algorithms design: a distributed rate limiter that protects
 * APIs from abuse and overload — the classic algorithms (token bucket, leaky
 * bucket, fixed/sliding window), where to enforce, and how to make counters
 * correct and fast across many nodes with Redis + Lua.
 */
const content: DesignContent = {
  meta: RATE_LIMITER_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **rate limiter** controls how many requests a client may make in a window of time, rejecting or delaying the excess. It is the front-line defense that keeps a single abusive client — or a buggy retry loop, or a DDoS — from overwhelming a service, and it enforces fair usage and paid quotas. Almost every public API (Stripe, GitHub, Twitter) sits behind one.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The big idea',
          body: 'Conceptually trivial ("count requests, reject over the limit"), a rate limiter is hard for three reasons: (1) choosing an **algorithm** with the right burst/smoothness behavior; (2) making the counter **correct under concurrency** (atomic read-modify-write); and (3) making it **fast and consistent across many gateway nodes** without adding latency to every request.',
        },
        {
          type: 'image',
          src: 'assets/diagrams/rate-limiter-architecture.svg',
          alt: 'Clients hit the API gateway; rate-limit middleware identifies the caller, checks an atomic counter in Redis via a Lua script, then allows (200, forward upstream) or rejects (429). A per-node local token cache reduces Redis round-trips.',
          caption:
            'Rate-limit middleware at the gateway checks an atomic Redis counter per identity+window, then allows (forward) or rejects (429).',
        },
      ],
    },
    {
      id: 'functional-requirements',
      title: 'Functional Requirements',
      blocks: [
        {
          type: 'bestPractices',
          title: 'In scope',
          practices: [
            '**Limit requests** per client to N per time window (e.g. 100 req/min).',
            '**Multiple scopes**: per API key, per user, per IP, per endpoint — and combinations.',
            '**Tiered limits**: different quotas for free vs paid plans.',
            '**Clear rejection**: return HTTP 429 with `Retry-After` and rate-limit headers.',
            '**Distributed correctness**: a global limit honored across many gateway nodes.',
            '**Low overhead**: add minimal latency to every allowed request.',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Out of scope (state explicitly)',
          body: 'Full DDoS/WAF protection, bot detection, and billing/metering of usage. A rate limiter is one layer of defense; we focus on the counting algorithms and the distributed enforcement, not L3/L4 volumetric attack mitigation.',
        },
      ],
    },
    {
      id: 'non-functional-requirements',
      title: 'Non-Functional Requirements',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Prioritizing the qualities',
          practices: [
            '**Low latency**: the check sits in the hot path of every request — sub-millisecond is the target.',
            '**High availability**: the limiter must not become a single point of failure for the whole API.',
            '**Accuracy**: enforce limits closely (some slack is acceptable; large over-admission is not).',
            '**Scalability**: handle the full request volume of the API it fronts.',
            '**Configurability**: rules change without redeploying services.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The central tension: accuracy vs latency',
          body: 'A perfectly accurate global counter requires a synchronous, strongly-consistent read-modify-write on every request — expensive. Most production limiters trade a little accuracy (allow slightly more than the limit at the edges) for big latency/availability wins via local caching and eventual sync. Know which way your use case leans.',
        },
      ],
    },
    {
      id: 'where-to-enforce',
      title: 'Where to Enforce',
      blocks: [
        {
          type: 'markdown',
          value:
            'Rate limiting can live at several layers. The most common and effective place is the **API gateway / reverse proxy** — it sees all traffic, is centralized, and keeps the limiting logic out of every microservice.',
        },
        {
          type: 'featureComparison',
          caption: 'Where to put the rate limiter.',
          columns: ['Client-side', 'API gateway', 'Per-service middleware', 'Dedicated service'],
          rows: [
            { feature: 'Trustworthy (cannot be bypassed)', values: [false, true, true, true] },
            { feature: 'Centralized config', values: [false, true, false, true] },
            { feature: 'Protects every service', values: [false, true, false, true] },
            { feature: 'No extra network hop', values: [true, true, true, false] },
            { feature: 'Common choice', values: [false, true, false, false] },
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Defense in depth',
          body: 'Client-side limiting improves UX (avoid wasted calls) but is **never** trusted for protection — clients lie. The gateway is the enforcement point; a separate rate-limiter service (e.g. Envoy + a global rate-limit service) is used when many gateways/proxies must share one global counter.',
        },
      ],
    },
    {
      id: 'algorithms',
      title: 'Core Algorithms',
      blocks: [
        {
          type: 'markdown',
          value:
            'Four algorithms dominate. They differ in how they treat **bursts** and how much **memory/precision** they need. This is the heart of the design — interviewers want the trade-offs.',
        },
        {
          type: 'featureComparison',
          caption: 'Rate-limiting algorithms compared.',
          columns: [
            'Token Bucket',
            'Leaky Bucket',
            'Fixed Window',
            'Sliding Window Log',
            'Sliding Window Counter',
          ],
          rows: [
            { feature: 'Allows bursts', values: [true, false, true, false, 'Partial'] },
            { feature: 'Smooths output rate', values: [false, true, false, false, false] },
            { feature: 'Boundary spike problem', values: [false, false, true, false, false] },
            { feature: 'Memory per client', values: ['O(1)', 'O(1)', 'O(1)', 'O(n)', 'O(1)'] },
            { feature: 'Perfectly accurate', values: [true, true, false, true, 'Approx'] },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The usual answer: token bucket (or sliding window counter)',
          body: "**Token bucket** is the most popular default — it is O(1), allows controlled bursts, and is intuitive. The **sliding window counter** is the go-to when you want fixed-window's cheapness without its boundary spike. Leaky bucket is for **shaping** a smooth output rate (e.g. protecting a downstream that needs steady flow).",
        },
      ],
    },
    {
      id: 'token-bucket',
      title: 'Token Bucket',
      blocks: [
        {
          type: 'markdown',
          value:
            'A bucket holds up to **B** tokens and refills at **r** tokens/second. Each request removes one token; if the bucket is empty, the request is rejected. The bucket capacity **B** sets the maximum burst; the refill rate **r** sets the steady-state throughput. Only two numbers per client need storing — the token count and the last refill timestamp.',
        },
        {
          type: 'math',
          display: true,
          tex: 'tokens = \\min\\!\\big(B,\\; tokens + r \\cdot (now - last)\\big);\\quad \\text{allow if } tokens \\ge 1 \\Rightarrow tokens \\mathrel{-}= 1',
          caption:
            'Lazily refill based on elapsed time, cap at burst capacity B, then admit only if at least one token remains.',
        },
        {
          type: 'code',
          language: 'lua',
          filename: 'token_bucket.lua',
          highlightLines: [8, 9, 10, 14, 15],
          code: `-- Atomic token bucket in Redis. KEYS[1]=bucket key
-- ARGV: rate, burst, now(ms), requested
local rate   = tonumber(ARGV[1])
local burst  = tonumber(ARGV[2])
local now    = tonumber(ARGV[3])
local need   = tonumber(ARGV[4])

local b = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(b[1]) or burst
local ts     = tonumber(b[2]) or now

-- Lazily refill based on elapsed time, capped at burst.
tokens = math.min(burst, tokens + (now - ts) / 1000 * rate)

local allowed = tokens >= need
if allowed then tokens = tokens - need end

redis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', KEYS[1], math.ceil(burst / rate * 1000))
return allowed and 1 or 0`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Why a Lua script (atomicity)',
          body: 'A naive GET-then-SET has a **race**: two nodes read the same token count, both think a token is free, both admit. Redis runs a **Lua script atomically** (single-threaded), so the read-refill-decrement-write is one indivisible operation. This is the single most important implementation detail for correctness.',
        },
      ],
    },
    {
      id: 'window-algorithms',
      title: 'Window Algorithms',
      blocks: [
        {
          type: 'markdown',
          value:
            'Window-based counters are the other major family. They are simple but have a famous flaw — the **boundary spike** — which the sliding variants fix.',
        },
        {
          type: 'mermaid',
          caption:
            'Fixed-window boundary spike: 100 allowed near the end of window 1 and 100 at the start of window 2 = 200 in ~1s.',
          definition: `flowchart LR
  subgraph W1["Window 1 (00:00-00:59)"]
    A["59.5s: 100 requests ✅"]
  end
  subgraph W2["Window 2 (01:00-01:59)"]
    B["00.5s: 100 requests ✅"]
  end
  A -->|"~1 second apart"| B
  B --> Spike["⚠️ 200 requests in ~1s\\n(limit was 100/min)"]`,
        },
        {
          type: 'bestPractices',
          title: 'The window family',
          practices: [
            '**Fixed window**: one counter per window (e.g. `key:minute`), `INCR` with TTL. Cheap, O(1) — but allows up to 2× at boundaries.',
            '**Sliding window log**: store a timestamp per request, count those within the last window. Exact, but O(n) memory per client.',
            '**Sliding window counter**: blend the current and previous fixed windows by weight — near-exact, O(1). The pragmatic favorite.',
          ],
        },
        {
          type: 'math',
          display: true,
          tex: 'count \\approx c_{cur} + c_{prev} \\cdot \\frac{(window - elapsed_{cur})}{window}',
          caption:
            'Sliding window counter: weight the previous window by the fraction of it still inside the rolling window — smoothing the boundary spike with O(1) state.',
        },
      ],
    },
    {
      id: 'high-level-architecture',
      title: 'High-Level Architecture',
      blocks: [
        {
          type: 'markdown',
          value:
            'Rate-limit middleware runs in each gateway node. On each request it **identifies** the caller (API key / user / IP), looks up the matching **rule**, and runs the algorithm against a **shared counter store** (Redis) using an atomic Lua script. A per-node **local cache** of tokens can absorb most checks to avoid a Redis round-trip on every request.',
        },
        {
          type: 'mermaid',
          caption: 'Request path through the limiter.',
          definition: `flowchart TD
  Req["Incoming request"] --> Id["Identify caller\\n(API key / user / IP)"]
  Id --> Rule["Resolve rule\\n(limit, window, tier)"]
  Rule --> Local{Local token\\ncache hit?}
  Local -- yes, tokens left --> Allow["Allow → forward upstream"]
  Local -- no / empty --> Redis["Atomic check in Redis (Lua)"]
  Redis -- allowed --> Allow
  Redis -- over limit --> Reject["Reject: 429 + Retry-After"]
  Config[("Rules config")] -.-> Rule`,
        },
        {
          type: 'architectureCard',
          title: 'Rate-Limit Middleware',
          description:
            'Embedded in the gateway. Extracts the client identity, resolves the applicable rule, executes the algorithm against the counter store, sets rate-limit response headers, and forwards or rejects.',
          icon: 'shield',
          tags: ['gateway', 'hot-path', 'headers'],
        },
        {
          type: 'architectureCard',
          title: 'Counter Store (Redis)',
          description:
            'Centralized, fast, in-memory counters keyed by identity+window. Runs the algorithm as an atomic Lua script so concurrent gateway nodes share one consistent view. Keys carry TTLs so memory self-cleans.',
          icon: 'database',
          tags: ['redis', 'atomic', 'ttl'],
        },
        {
          type: 'architectureCard',
          title: 'Rules Engine',
          description:
            'Hot-reloadable configuration mapping scopes (key/user/IP/endpoint) and tiers (free/paid) to limits and windows. Lets product change quotas without redeploying gateways.',
          icon: 'settings',
          tags: ['config', 'tiers', 'dynamic'],
        },
      ],
    },
    {
      id: 'distributed',
      title: 'The Distributed Problem',
      blocks: [
        {
          type: 'markdown',
          value:
            'With many gateway nodes, a per-node in-memory counter does not enforce a **global** limit — N nodes each allowing the limit means up to N× over-admission. The options trade accuracy against latency and the load they put on the shared store.',
        },
        {
          type: 'prosCons',
          title: 'Centralized Redis vs local-with-sync',
          pros: [
            'Centralized counter: globally accurate; one source of truth for all nodes.',
            'Local counter + async sync: lowest latency; survives Redis blips; far less load on Redis.',
            'Local with periodic sync can divide the quota across nodes for approximate global limits.',
          ],
          cons: [
            'Centralized: a Redis round-trip on every request adds latency and a dependency.',
            'Centralized: Redis is a hotspot/SPOF — must be replicated and sharded.',
            'Local: temporarily over-admits (eventual consistency) until the next sync.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Common production pattern',
          body: 'Use **centralized Redis** for correctness, but cushion it: a small **per-node local cache** answers the common "obviously under limit" case without a round-trip, and only consults Redis when near the boundary. This keeps p99 latency low while keeping global enforcement approximately correct.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Shard the counter store',
          body: "At high QPS a single Redis becomes the bottleneck. **Shard by client key** (consistent hashing) so each client's counter lives on one node — preserving atomicity per key while spreading load. Replicate each shard for availability.",
        },
      ],
    },
    {
      id: 'api-design',
      title: 'API & Response Contract',
      blocks: [
        {
          type: 'markdown',
          value:
            'Rate limiting is mostly transparent, but the **rejection contract** matters: clients need to know they were limited and when to retry. Standard headers communicate the quota state on every response.',
        },
        {
          type: 'table',
          caption: 'Standard rate-limit response headers.',
          headers: ['Header', 'Meaning'],
          rows: [
            ['HTTP 429 Too Many Requests', 'Status returned when the limit is exceeded'],
            ['Retry-After', 'Seconds to wait before retrying'],
            ['X-RateLimit-Limit', 'Max requests allowed in the window'],
            ['X-RateLimit-Remaining', 'Requests left in the current window'],
            ['X-RateLimit-Reset', 'When the window resets (epoch seconds)'],
          ],
        },
        {
          type: 'apiTable',
          title: 'Rule management API (admin)',
          endpoints: [
            {
              method: 'GET',
              path: '/admin/limits/{scope}',
              description: 'Get the rule for a scope',
              auth: true,
            },
            {
              method: 'PUT',
              path: '/admin/limits/{scope}',
              description: 'Create/update a limit rule',
              auth: true,
            },
            {
              method: 'DELETE',
              path: '/admin/limits/{scope}',
              description: 'Remove a rule',
              auth: true,
            },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Reject cheaply, fail open',
          body: 'A 429 should be returned **before** doing any expensive work. And decide your failure mode: if the counter store is unreachable, do you **fail open** (allow traffic, prioritize availability) or **fail closed** (reject, prioritize protection)? Most APIs **fail open** so a Redis outage does not take down the whole API — but a payment endpoint might fail closed.',
        },
      ],
    },
    {
      id: 'scaling-strategy',
      title: 'Scaling Strategy',
      blocks: [
        {
          type: 'bestPractices',
          practices: [
            '**Stateless gateways** scale horizontally; the shared counter holds the state.',
            '**Shard Redis by client key** (consistent hashing) to spread counter load.',
            '**Local token cache** per node to cut the common-case round-trip.',
            '**Pipeline / batch** Redis ops where possible to amortize network cost.',
            '**TTL on every key** so expired windows self-evict and memory stays bounded.',
            '**Tiered + per-endpoint rules** so expensive endpoints get tighter limits.',
          ],
        },
        {
          type: 'math',
          display: true,
          tex: 'Mem \\approx ActiveClients \\times KeysPerClient \\times BytesPerKey',
          caption:
            'Memory is driven by the number of distinct active client keys, not total request volume — TTLs keep only active windows resident.',
        },
      ],
    },
    {
      id: 'availability',
      title: 'Availability',
      blocks: [
        {
          type: 'markdown',
          value:
            "The limiter is in the path of every request, so its availability is the API's availability. The store must be replicated, and the gateway must have a clear, safe behavior when the store is degraded.",
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Fail open by default',
          body: 'If Redis is unreachable, defaulting to **allow** (fail open) keeps the API serving traffic — a brief loss of rate limiting is usually better than a full outage. Combine with a **local fallback limiter** (approximate, per-node) so you are not completely unprotected during a store outage.',
        },
        {
          type: 'youtube',
          videoId: 'mNwL2vNvUYM',
          title: 'Designing a rate limiter (illustrative embed)',
        },
      ],
    },
    {
      id: 'consistency',
      title: 'Consistency',
      blocks: [
        {
          type: 'markdown',
          value:
            'Rate limiting is one of the cleaner examples of choosing **availability and latency over strict accuracy**. A globally perfect count is rarely worth the cost; admitting a handful of extra requests at a window edge is harmless, while adding 5ms to every request or risking an outage is not.',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'How much slack is acceptable?',
          body: 'Define the tolerance explicitly. For abuse prevention, "100/min ± a few" is fine — use local caches and async sync. For hard quotas with billing implications, tighten toward a centralized atomic counter. The algorithm and topology follow from this number.',
        },
      ],
    },
    {
      id: 'fault-tolerance',
      title: 'Fault Tolerance',
      blocks: [
        {
          type: 'bestPractices',
          practices: [
            '**Replicate the counter store** (Redis primary + replicas) so a node loss does not disable limiting.',
            '**Shard** so one hot client cannot overwhelm the whole store.',
            '**Fail open** (or a local fallback limiter) when the store is unreachable.',
            '**Atomic Lua scripts** to eliminate read-modify-write races under concurrency.',
            '**TTLs everywhere** so crashes never leak stale counters.',
            '**Circuit-break the Redis call** with a tight timeout so a slow store does not stall requests.',
          ],
        },
        {
          type: 'expandable',
          title: 'Example: fail-open wrapper around the check',
          blocks: [
            {
              type: 'code',
              language: 'python',
              filename: 'check_with_failopen.py',
              code: `def allow(identity, rule):
    try:
        # Tight timeout: the limiter must never add real latency.
        return redis_lua_check(identity, rule, timeout_ms=5)
    except (RedisTimeout, RedisDown):
        # Store degraded → fail open (allow), optionally fall back to
        # an approximate per-node local limiter.
        metrics.incr("ratelimit.failopen")
        return local_fallback.allow(identity, rule)`,
            },
          ],
        },
      ],
    },
    {
      id: 'trade-offs',
      title: 'Trade-offs',
      blocks: [
        {
          type: 'table',
          caption: 'Key decisions and what they cost.',
          headers: ['Decision', 'Gain', 'Cost'],
          rows: [
            [
              'Token bucket',
              'O(1), allows bursts, intuitive',
              'Burst can briefly exceed steady rate',
            ],
            ['Sliding window counter', 'No boundary spike, O(1)', 'Slight approximation'],
            ['Sliding window log', 'Exact', 'O(n) memory per client'],
            ['Centralized Redis', 'Globally accurate', 'Per-request latency + SPOF risk'],
            ['Local cache + sync', 'Low latency, resilient', 'Temporary over-admission'],
            ['Fail open', 'API stays up if store dies', 'Unprotected during outage'],
          ],
        },
      ],
    },
    {
      id: 'technology-choices',
      title: 'Technology Choices',
      blocks: [
        {
          type: 'table',
          headers: ['Concern', 'Real-world example'],
          rows: [
            ['Counter store', 'Redis (in-memory, atomic Lua)'],
            ['Atomicity', 'Redis Lua scripts / INCR+EXPIRE'],
            ['Gateway enforcement', 'Envoy, NGINX, Kong, AWS API Gateway'],
            ['Global rate-limit service', 'Envoy + ratelimit (Lyft) gRPC service'],
            ['Sharding', 'Redis Cluster / consistent hashing'],
            ['Config', 'Dynamic rules (hot-reload)'],
            ['Algorithm', 'Token bucket / sliding window counter'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'You usually do not build this from scratch',
          body: "Envoy's global rate-limit service, Kong/NGINX plugins, and cloud API gateways implement these algorithms for you. The value of this design is understanding *what they do* so you can configure them correctly and reason about their accuracy/latency trade-offs.",
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      blocks: [
        {
          type: 'interviewQa',
          items: [
            {
              question: 'Compare token bucket and leaky bucket.',
              answer:
                'Both are O(1). **Token bucket** allows **bursts** up to the bucket capacity, then limits to the refill rate — good for APIs that should tolerate short spikes. **Leaky bucket** processes requests at a fixed rate (a queue draining at constant speed), **smoothing** output and disallowing bursts — good for shaping a steady load onto a fragile downstream.',
            },
            {
              question: 'What is the fixed-window boundary problem and how do you fix it?',
              answer:
                'A fixed window resets its counter abruptly, so a client can send the full limit at the end of one window and again at the start of the next — up to **2× the limit in a short span**. Fix it with a **sliding window log** (exact, O(n) memory) or, more practically, a **sliding window counter** that weights the previous window (near-exact, O(1)).',
            },
            {
              question: 'How do you make a rate limiter work across many servers?',
              answer:
                'Keep counters in a **shared, fast store (Redis)** and update them with an **atomic Lua script** so all gateway nodes share one consistent count. Shard by client key for scale, replicate for availability, and add a per-node **local cache** + async sync to cut latency, accepting slight over-admission.',
            },
            {
              question: 'Why is atomicity critical, and how do you achieve it?',
              answer:
                'A non-atomic read-then-write lets two concurrent requests both read "1 token left" and both proceed — over-admitting. Redis executes a **Lua script as a single atomic operation** (Redis is single-threaded), making read-refill-decrement-write indivisible. Alternatively `INCR` returns the post-increment value atomically for window counters.',
            },
            {
              question: 'What happens if the counter store goes down?',
              answer:
                'Decide the failure mode up front. **Fail open** (allow traffic) keeps the API available at the cost of temporarily losing limiting — the usual choice. **Fail closed** (reject) prioritizes protection — for sensitive endpoints. A per-node **local fallback limiter** gives approximate protection during the outage. Use a tight timeout so a slow store never stalls requests.',
            },
            {
              question: 'How do you support tiered limits (free vs paid)?',
              answer:
                "Resolve the client's **tier** from the API key during identification, then look up the matching rule (limit/window) from a **hot-reloadable rules config**. The same algorithm runs with different parameters per tier/scope/endpoint, so quotas change without redeploying the gateway.",
            },
          ],
        },
      ],
    },
    {
      id: 'references',
      title: 'References',
      blocks: [
        {
          type: 'references',
          items: [
            {
              label: 'Stripe: Scaling your API with rate limiters',
              url: 'https://stripe.com/blog/rate-limiters',
              source: 'Stripe',
            },
            {
              label: 'Envoy global rate limiting',
              url: 'https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting',
              source: 'Envoy',
            },
            {
              label: 'Cloudflare: How we built rate limiting',
              url: 'https://blog.cloudflare.com/counting-things-a-lot-of-different-things/',
              source: 'Cloudflare',
            },
            {
              label: 'Redis rate limiting patterns (INCR)',
              url: 'https://redis.io/docs/latest/develop/use/patterns/distributed-locks/',
              source: 'Redis',
            },
            {
              label: 'System Design Interview — Rate Limiter (Alex Xu)',
              url: 'https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter',
              source: 'ByteByteGo',
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
          body: '1. **Enforce at the gateway** — it is centralized, trustworthy, and keeps limiting out of every service.\n2. **Pick the algorithm for the burst behavior you want**: token bucket (bursty, O(1)) or sliding window counter (smooth, O(1), no boundary spike); leaky bucket to shape a steady output.\n3. **Atomicity is the core correctness detail**: an atomic Redis Lua script (or `INCR`) eliminates read-modify-write races across nodes.\n4. **Distribution is a trade-off**: centralized Redis for accuracy, local caches + async sync for latency — choose based on how much over-admission you can tolerate.\n5. **Plan for failure**: replicate and shard the store, set tight timeouts, and decide fail-open vs fail-closed so the limiter never becomes the outage.',
        },
      ],
    },
  ],
};

export default content;
