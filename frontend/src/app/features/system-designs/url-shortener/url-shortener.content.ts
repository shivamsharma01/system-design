import { DesignContent } from '../../../shared/models';
import { URL_SHORTENER_META } from './url-shortener.meta';

const content: DesignContent = {
  meta: URL_SHORTENER_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A URL shortener turns a long URL into a short alias (e.g. `https://sho.rt/aZ9kQ`) that redirects to the original. Think TinyURL or Bitly. It is a classic interview problem because it is small enough to design fully yet touches **hashing, unique ID generation, caching, and read-heavy scaling**.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core insight',
          body: 'This is an overwhelmingly **read-heavy** system (redirects far outnumber creations) where the key design choice is *how to generate short, unique, collision-free keys*.',
        },
      ],
    },
    {
      id: 'functional-requirements',
      title: 'Functional Requirements',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Must-haves',
          practices: [
            'Create a short URL from a long URL.',
            'Redirect a short URL to the original (HTTP 301/302).',
            'Optional custom alias (vanity links).',
            'Optional expiration time.',
            'Basic analytics (click counts).',
          ],
        },
      ],
    },
    {
      id: 'non-functional-requirements',
      title: 'Non-Functional Requirements',
      blocks: [
        {
          type: 'prosCons',
          pros: [
            "Very low redirect latency (it is on the critical path of someone's click).",
            'High availability — a dead link service breaks every shared link.',
            'Short, hard-to-guess keys.',
          ],
          cons: [
            'Strong consistency not required for analytics.',
            'Write volume is low relative to reads.',
          ],
        },
      ],
    },
    {
      id: 'capacity-estimation',
      title: 'Capacity Estimation',
      blocks: [
        {
          type: 'metrics',
          items: [
            { label: 'New URLs / month', value: '100M', hint: 'writes' },
            { label: 'Read:Write ratio', value: '100:1', hint: 'redirects dominate' },
            { label: 'Reads / month', value: '10B', hint: 'redirects' },
            { label: 'Storage / 5 yrs', value: '~6 TB', hint: '6B rows × ~1KB' },
          ],
        },
        {
          type: 'markdown',
          value:
            'How long must the key be? With a Base62 alphabet `[A-Za-z0-9]`, an `n`-character key yields:',
        },
        {
          type: 'math',
          display: true,
          tex: '62^{7} \\approx 3.5\\times10^{12} \\quad\\text{and}\\quad 62^{8} \\approx 2.2\\times10^{14}',
          caption: '7 characters already covers trillions of URLs; we use 7.',
        },
      ],
    },
    {
      id: 'high-level-architecture',
      title: 'High-Level Architecture',
      blocks: [
        {
          type: 'mermaid',
          caption: 'Write path (create) and read path (redirect).',
          definition: `flowchart TD
  U["User"] -->|POST /shorten| API["API Service"]
  API --> KGS["Key Generation / Encoder"]
  API --> DB[("Key-Value Store")]
  U2["Browser"] -->|GET /aZ9kQ| API2["Redirect Service"]
  API2 --> Cache[("Redis cache")]
  Cache -->|miss| DB
  API2 -->|301 Location| U2`,
        },
        {
          type: 'architectureCard',
          title: 'Redis cache in front of the store',
          description:
            'Because reads dominate 100:1, an LRU cache of the hottest links absorbs the vast majority of redirects, keeping the database load and latency low.',
          icon: 'database',
          tags: ['cache', 'LRU', 'read-heavy'],
        },
      ],
    },
    {
      id: 'api-design',
      title: 'API Design',
      blocks: [
        {
          type: 'apiTable',
          endpoints: [
            { method: 'POST', path: '/api/v1/urls', description: 'Create a short URL', auth: true },
            { method: 'GET', path: '/{shortCode}', description: 'Redirect to the original URL' },
            {
              method: 'GET',
              path: '/api/v1/urls/{shortCode}/stats',
              description: 'Click analytics',
              auth: true,
            },
            {
              method: 'DELETE',
              path: '/api/v1/urls/{shortCode}',
              description: 'Delete a short URL',
              auth: true,
            },
          ],
        },
        {
          type: 'code',
          language: 'json',
          filename: 'create-request.json',
          code: `{
  "longUrl": "https://example.com/some/very/long/path?with=params",
  "customAlias": null,
  "expiresAt": "2027-01-01T00:00:00Z"
}`,
        },
      ],
    },
    {
      id: 'database-design',
      title: 'Database Design',
      blocks: [
        {
          type: 'code',
          language: 'sql',
          filename: 'schema.sql',
          highlightLines: [2, 3],
          code: `CREATE TABLE urls (
  short_code   VARCHAR(8) PRIMARY KEY,   -- the Base62 key
  long_url     TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  expires_at   TIMESTAMPTZ,
  click_count  BIGINT DEFAULT 0
);
CREATE INDEX idx_urls_expires_at ON urls (expires_at);`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Why a KV store works well',
          body: 'The access pattern is a pure point lookup by primary key. A key-value store (DynamoDB, Cassandra) or even a well-indexed relational table scales this trivially via sharding on `short_code`.',
        },
      ],
    },
    {
      id: 'caching-strategy',
      title: 'Key Generation & Encoding',
      blocks: [
        {
          type: 'markdown',
          value:
            'There are two main approaches. **(A) Hash the URL** (e.g. MD5) and take the first few characters — simple but must handle collisions. **(B) Use a global counter / unique ID** and Base62-encode it — collision-free by construction. Approach B (often with a pre-generated **Key Generation Service** or Snowflake-style IDs) is preferred at scale.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Base62.java',
          highlightLines: [4, 14],
          code: `public final class Base62 {
  private static final String ALPHABET =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  private static final int BASE = ALPHABET.length(); // 62

  public static String encode(long id) {
    StringBuilder sb = new StringBuilder();
    do {
      sb.append(ALPHABET.charAt((int) (id % BASE)));
      id /= BASE;
    } while (id > 0);
    return sb.reverse().toString();
  }

  public static long decode(String code) {
    long id = 0;
    for (char c : code.toCharArray()) {
      id = id * BASE + ALPHABET.indexOf(c);
    }
    return id;
  }
}`,
        },
        {
          type: 'code',
          language: 'python',
          filename: 'base62.py',
          code: `ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode(num: int) -> str:
    if num == 0:
        return ALPHABET[0]
    chars = []
    while num > 0:
        num, rem = divmod(num, 62)
        chars.append(ALPHABET[rem])
    return "".join(reversed(chars))`,
        },
        {
          type: 'prosCons',
          title: 'Hashing vs. counter-based IDs',
          pros: [
            'Counter + Base62: guaranteed unique, no collision checks.',
            'Same long URL can map to the same key if desired.',
          ],
          cons: [
            'Sequential counters are guessable — add randomness or a KGS pool.',
            'A single global counter is a bottleneck → use ranges per server.',
          ],
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
            'Put a **CDN / cache** in front so popular links redirect from the edge.',
            'Shard the datastore by `short_code` hash.',
            'Use a **Key Generation Service** that hands out pre-computed key ranges to avoid counter contention.',
            'Batch analytics: increment click counts asynchronously via a queue, not on the redirect hot path.',
            'Prefer **301 (permanent)** for cacheability, or **302** if you need to count every click.',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: '301 vs 302 trade-off',
          body: 'A 301 lets browsers and CDNs cache the redirect (fast, but you lose per-click analytics). A 302 forces a round-trip every time (accurate analytics, more load). Pick based on whether analytics or latency matters more.',
        },
      ],
    },
    {
      id: 'trade-offs',
      title: 'Trade-offs',
      blocks: [
        {
          type: 'table',
          headers: ['Decision', 'Gain', 'Cost'],
          rows: [
            ['Counter + Base62 keys', 'No collisions', 'Guessable unless randomized'],
            ['Cache-aside Redis', 'Fast redirects', 'Cache invalidation on delete/expiry'],
            ['301 redirects', 'CDN cacheable', 'Inaccurate click counts'],
            ['Async analytics', 'Fast hot path', 'Eventually-consistent counts'],
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
              question: 'How do you guarantee short codes are unique?',
              answer:
                'Use a monotonic unique ID (global counter with per-node ranges, or Snowflake IDs) and Base62-encode it. Uniqueness is guaranteed by construction, so no collision check is needed.',
            },
            {
              question: 'How do you make keys non-sequential / non-guessable?',
              answer:
                "Either pre-generate a shuffled pool of keys in a Key Generation Service, or XOR/scramble the counter with a secret, or include random bits. This prevents enumeration of others' links.",
            },
            {
              question: 'How do you handle the same long URL submitted twice?',
              answer:
                'Optionally store a reverse index (hash of long URL → short code) and return the existing code. This is a product decision; many shorteners intentionally create a fresh code per request for analytics.',
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
              label: 'System Design Primer',
              url: 'https://github.com/donnemartin/system-design-primer',
              source: 'GitHub',
            },
            {
              label: 'Snowflake ID generation',
              url: 'https://en.wikipedia.org/wiki/Snowflake_ID',
              source: 'Wikipedia',
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
          body: 'Generate unique IDs and **Base62-encode** them for short, collision-free keys. Optimize the **read path** with caching/CDN since redirects dominate 100:1. Keep analytics off the hot path with async counting, and choose 301 vs 302 based on caching vs. accuracy.',
        },
      ],
    },
  ],
};

export default content;
