import { DesignContent } from '../../../shared/models';
import { RATE_LIMITER_PATTERN_META } from './rate-limiter-pattern.meta';

const content: DesignContent = {
  meta: RATE_LIMITER_PATTERN_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Rate Limiter Pattern** enforces **per-client, per-tenant, or per-IP quotas** so shared APIs stay fair and profitable. Implementations use **token bucket** (smooth bursts with sustained rate) or **sliding window** (precise counts over a rolling interval). Deploy at the **CDN/API edge** for cheap rejection or **inside services** when limits depend on business logic.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Not the same as the Rate Limiter system design',
          body: 'This catalog entry covers the **distributed-systems pattern** — algorithms, placement, and HTTP semantics. The platform’s separate **Rate Limiter** system-design article walks through building a **standalone rate-limiting product** (storage, clustering, admin UI). Both are useful; they answer different questions.',
        },
        {
          type: 'table',
          caption: 'Algorithm comparison.',
          headers: ['Algorithm', 'Behavior'],
          rows: [
            ['Token bucket', 'Tokens refill at fixed rate; burst up to bucket size'],
            ['Sliding window log', 'Exact per-request timestamps; higher memory'],
            ['Sliding window counter', 'Approximate; good Redis fit; low memory'],
            ['Fixed window', 'Simple but boundary spikes at window rollover'],
          ],
        },
      ],
    },
    {
      id: 'concept',
      title: 'Concept and analogy',
      blocks: [
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A **theme park ride** with a **FastPass quota**: you get three priority entries per day (sustained allowance) and can use two back-to-back if you saved them (burst). Once depleted, you wait until tomorrow or join the standby line (**429 Too Many Requests**).',
        },
        {
          type: 'mermaid',
          caption: 'Edge rate limiter rejects before origin; service limiter for tenant tiers.',
          definition: `flowchart TB
  Client --> CDN[CDN / API Gateway]
  CDN --> RL{Rate limiter\\nper API key}
  RL -->|under quota| Origin[Origin service]
  RL -->|over quota| Reject[429 + Retry-After]
  Origin --> SRL{Service-level\\ntenant quota}
  SRL --> DB[(Database)]`,
        },
      ],
    },
    {
      id: 'where-used',
      title: 'Where it is used',
      blocks: [
        {
          type: 'table',
          headers: ['Domain', 'Example'],
          rows: [
            ['Public REST APIs', 'Stripe-style 100 req/s per key; 429 with rate-limit headers'],
            ['E-commerce partner APIs', 'Per-merchant catalog sync quota; premium tier doubles bucket'],
            ['CDN edge', 'Cloudflare rate rules block scraping before origin load'],
            ['Food delivery maps API', 'Per-restaurant geocode quota to control Google Maps spend'],
            ['Redis-backed limiter', 'Cluster-wide token bucket in Redis for horizontally scaled APIs'],
            ['AI inference gateway', 'Tokens-per-minute per customer on expensive model routes'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Store counters in **Redis** (`INCR` + TTL or Lua script for atomic token bucket). Return **429** with **X-RateLimit-Limit**, **X-RateLimit-Remaining**, **Retry-After**. Place **coarse limits at the edge** (IP, API key) and **fine limits in service** (tenant tier, endpoint cost). When limits protect **your** capacity under spike, pair with **Throttling** overload shedding — rate limits are fair; throttling is survival.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'RedisTokenBucketLimiter.java',
          code: `public class RedisTokenBucketLimiter {
  private final JedisPool redis;
  private static final String LUA = """
      local key = KEYS[1]
      local rate = tonumber(ARGV[1])
      local burst = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local data = redis.call('HMGET', key, 'tokens', 'ts')
      local tokens = tonumber(data[1]) or burst
      local ts = tonumber(data[2]) or now
      tokens = math.min(burst, tokens + (now - ts) * rate / 1000)
      if tokens < 1 then return {0, tokens} end
      tokens = tokens - 1
      redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
      redis.call('PEXPIRE', key, math.ceil(burst / rate * 2000))
      return {1, tokens}
      """;

  public RateLimitResult tryAcquire(String clientId, double rps, int burst) {
    try (Jedis jedis = redis.getResource()) {
      List<Long> result = (List<Long>) jedis.eval(
          LUA, List.of("rl:" + clientId), List.of(String.valueOf(rps), String.valueOf(burst),
              String.valueOf(System.currentTimeMillis())));
      boolean allowed = result.get(0) == 1L;
      long remaining = result.get(1);
      return new RateLimitResult(allowed, remaining, burst);
    }
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Distributed clock skew',
          body: 'Sliding windows across nodes need a **single source of truth** (Redis) or **sticky routing** to one limiter shard. Local in-memory limiters only work per instance — divide quota by replica count or use centralized store.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Fair multi-tenant usage and predictable cost control.',
            'Edge rejection saves origin CPU and database load.',
            'Token bucket allows natural burst traffic within bounds.',
          ],
          cons: [
            'Redis dependency becomes critical path — design for fallback policy.',
            'Per-endpoint weights add configuration complexity.',
            'Does not replace adaptive **throttling** under global overload.',
          ],
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
              question: 'Token bucket vs sliding window?',
              answer:
                '**Token bucket**: refill rate + burst size — smooth and simple. **Sliding window**: count requests in rolling interval — stricter, no fixed-window cliff spikes. Hybrid **sliding window counter** is popular in Redis.',
            },
            {
              question: 'Where should rate limiting run — edge or service?',
              answer:
                '**Edge** (CDN, API gateway): cheap, blocks abuse early. **Service**: when limits need **tenant tier**, endpoint cost, or auth context. Often **both** — coarse at edge, fine inside.',
            },
            {
              question: 'Rate limiting vs throttling?',
              answer:
                '**Rate limiting** = per-client **quota** (contract). **Throttling** = **overload protection** when the system is saturated. A client under quota can still get 503 if the server is melting — see the **Throttling** pattern.',
            },
            {
              question: 'How do you rate limit in a cluster?',
              answer:
                'Central **Redis** with atomic scripts, or dedicated limiter sidecar. Avoid purely local counters unless quota is per-instance. Use consistent key: `rl:{tenant}:{endpoint}`.',
            },
            {
              question: 'What headers should APIs return?',
              answer:
                '**429 Too Many Requests**, **Retry-After**, **X-RateLimit-Limit**, **X-RateLimit-Remaining**, optional **X-RateLimit-Reset**. Helps SDKs backoff without hammering.',
            },
            {
              question: 'Design rate limits for a search API.',
              answer:
                'Free tier: 10 req/s token bucket; paid: 100 req/s. **Edge** CDN blocks anonymous IPs. **Redis** cluster counter per API key. Expensive queries cost **2 tokens**. Return cached CDN results when possible to stay under quota.',
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
          body: '1. Rate limiter = **per-client quota** via token bucket or sliding window.\n2. Deploy at **edge and service**; store state in **Redis** for clusters.\n3. Pair with **Throttling** for overload — quotas ≠ capacity protection.\n4. Distinct from the platform’s **Rate Limiter system-design** product article.',
        },
      ],
    },
  ],
};

export default content;
