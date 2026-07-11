import { DesignContent } from '../../../shared/models';
import { INSTAGRAM_META } from './instagram.meta';

/**
 * Flagship-depth example (peer of the Netflix, WhatsApp, Twitter, and Uber
 * designs). Centers on the two defining problems of a photo/video social app:
 * durable, fast media storage + delivery (upload → process → CDN), and feed
 * construction (hybrid fan-out) plus Stories.
 */
const content: DesignContent = {
  meta: INSTAGRAM_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            "Instagram is a **photo and short-video sharing** social network: users upload media, follow others, and scroll a ranked **feed**, plus ephemeral **Stories**, **Reels**, **Explore**, and **Direct** messages. It serves **2B+ monthly users**, stores **hundreds of billions of media objects**, and is overwhelmingly **read-heavy**. The two defining challenges are (1) storing and delivering **media** durably and fast worldwide, and (2) constructing each user's **feed** at scale.",
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The big idea',
          body: 'Split the problem into **two planes**. The **media plane** moves large immutable blobs: upload to object storage, process into multiple sizes/formats asynchronously, and serve from a global **CDN**. The **metadata + feed plane** moves tiny records: who posted what, the social graph, counts, and per-user feeds of **post IDs** — never the bytes themselves.',
        },
        {
          type: 'image',
          src: 'assets/diagrams/instagram-architecture.svg',
          alt: 'Instagram architecture: uploader posts media to the upload service which stores the blob in S3 and triggers transcoding; the feed service fans out post IDs to Redis; viewers fetch the feed and load media from the CDN.',
          caption:
            'Two planes: media (upload → blob store → transcode → CDN) and metadata/feed (fan-out of post IDs, hydrate, rank).',
        },
      ],
    },
    {
      id: 'clarifying-questions',
      title: 'Clarifying Questions',
      blocks: [
        {
          type: 'markdown',
          value:
            'Instagram bundles two genuinely different problems — media storage/delivery and feed construction. Spend the first few minutes separating them and scoping out Stories/DMs/Explore, or the design will sprawl before you reach either core problem in depth.',
        },
        {
          type: 'table',
          caption: 'Questions to ask, and reasonable assumptions if the interviewer says "you decide".',
          headers: ['Question', 'Why it matters / sample assumption'],
          rows: [
            [
              'Are we designing photos only, video only, or both?',
              'Assume both photos and short videos (Reels-style); note that video adds transcoding complexity similar to the YouTube design, and focus depth on photos unless told otherwise.',
            ],
            [
              'Is Direct Messaging, Explore/recommendations, or Stories in scope?',
              'Scope to upload + feed + basic engagement; treat DMs as "see the WhatsApp/chat design", Explore/recs as a brief follow-up, and Stories as a smaller stated feature (TTL data).',
            ],
            [
              'What is the follower distribution — flat, or with celebrity accounts?',
              'Assume a skewed power-law graph like Twitter — most users have few followers, a small number have tens of millions — this is what forces a hybrid fan-out for the feed.',
            ],
            [
              'How many resolutions/formats must each upload be available in?',
              'Assume a handful of responsive sizes (thumbnail, feed, full) in 1-2 modern formats (WebP/AVIF) — enough to discuss the processing pipeline without over-specifying codecs.',
            ],
            [
              'Must the feed be perfectly chronological or can it be ranked?',
              'Assume ranked by default, same as the Twitter/YouTube designs, with a chronological fallback for ranking-service outages.',
            ],
            [
              'How fresh must the feed be after upload, and how fast must upload-to-visible be?',
              'Assume seconds-to-low-minutes end-to-end (uploading → processed → fanned out) is acceptable, since transcoding is inherently asynchronous.',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'State assumptions out loud',
          body: 'Say explicitly: "I will treat this as two planes — media storage/delivery and feed construction — and scope out DMs and the full recommendation model." Naming the two-plane split up front signals you have already spotted the two hardest sub-problems, which is exactly what the interviewer wants to hear.',
        },
      ],
    },
    {
      id: 'functional-requirements',
      title: 'Functional Requirements',
      blocks: [
        {
          type: 'markdown',
          value: 'We scope the interview to the media-sharing + feed core.',
        },
        {
          type: 'bestPractices',
          title: 'In scope',
          practices: [
            '**Upload** photos/videos with captions, tags, and location.',
            '**Follow / unfollow** users (the social graph).',
            '**Home feed**: ranked posts from followed accounts.',
            "**Profile**: a grid of a user's own posts.",
            '**Engagement**: like, comment, save, share.',
            '**Stories**: ephemeral media that expires after 24h.',
            '**Media delivery**: fast, global, multiple resolutions.',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Out of scope (state this explicitly)',
          body: 'Direct messaging (see the WhatsApp design), the full Reels/Explore recommendation model, ads, and live video. Naming the boundary keeps the focus on media storage/delivery and feed construction.',
        },
      ],
    },
    {
      id: 'non-functional-requirements',
      title: 'Non-Functional Requirements',
      blocks: [
        {
          type: 'prosCons',
          title: 'Prioritizing the qualities',
          pros: [
            'Low feed + media load latency (feed < 200ms; images from a nearby edge).',
            'High availability for reads (target 99.99%).',
            'Extreme durability for media — an uploaded photo must never be lost.',
            'Read-heavy horizontal scalability (reads ≫ writes).',
            'Global low latency via CDN edge delivery.',
          ],
          cons: [
            'Strong global consistency is NOT required for feeds (eventual is fine).',
            'A few seconds of feed staleness is acceptable.',
            'Exact like/view counts are not critical (approximate ok).',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'CAP framing',
          body: 'Overwhelmingly **AP** for the read path: a feed briefly missing the newest post is fine; an unavailable feed is not. Media objects are immutable, so once stored and on the CDN they are trivially cacheable and consistent. Counts are eventually-consistent approximations.',
        },
      ],
    },
    {
      id: 'capacity-estimation',
      title: 'Capacity Estimation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Assume **500M** daily active users, **100M** photos uploaded/day at **~2 MB** each (after processing, multiple sizes stored), and a read:write ratio around **100:1**.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Daily active users', value: '~500M', hint: 'DAU' },
            { label: 'Uploads / day', value: '~100M', hint: '~1,160/sec avg' },
            { label: 'Avg original size', value: '~2 MB', hint: 'photo; video far larger' },
            { label: 'Feed reads / sec', value: '~1M+', hint: 'read-heavy' },
            { label: 'New media / day', value: '~600 TB', hint: 'originals + variants (≈3×)' },
            { label: 'CDN hit ratio', value: '~95%+', hint: 'hot media at edge' },
          ],
        },
        {
          type: 'markdown',
          value:
            'The dominant cost is **media storage growth**, which is effectively permanent and append-only:',
        },
        {
          type: 'math',
          display: true,
          tex: 'S_{year} = U_{day} \\times Size_{avg} \\times V \\times 365 = 1\\times10^{8} \\times 2\\,\\text{MB} \\times 3 \\times 365 \\approx 219\\ \\text{PB/yr}',
          caption:
            'Yearly media storage (≈3× for thumbnails + resized variants). Photos only — video pushes this much higher. This is why tiered/cold storage and aggressive CDN caching matter.',
        },
        {
          type: 'markdown',
          value:
            'Metadata, by contrast, is small: a post record is a few hundred bytes. The feed cache (per-user lists of post IDs) and the social graph dominate the *metadata* footprint, but are tiny next to the blobs.',
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
            "On upload, the client gets a **pre-signed URL** and uploads the blob directly to object storage, then writes a small post record. A **processing pipeline** (triggered via Kafka) generates resized variants and pushes them to the CDN. The **Feed Service** fans out the post ID to followers' feeds. On read, the Feed Service returns post IDs, hydrates metadata, and the client loads media straight from the CDN.",
        },
        {
          type: 'mermaid',
          caption: 'Media plane (upload → process → CDN) and metadata/feed plane.',
          definition: `flowchart TD
  Up["Uploader"] -->|pre-signed PUT| Blob[("Object Store: S3")]
  Up -->|post metadata| PostSvc["Post Service"]
  PostSvc --> Meta[("Metadata: Cassandra")]
  PostSvc --> Kafka[("Kafka")]
  Kafka --> Proc["Processing: resize/transcode"]
  Proc --> Blob
  Blob --> CDN["CDN (edge cache)"]
  Kafka --> Fanout["Feed Fan-out"]
  Graph[("Social Graph")] --> Fanout
  Fanout --> Feed[("Feed Cache: Redis (post IDs)")]
  Viewer["Viewer"] -->|GET /feed| FeedSvc["Feed Service"]
  Feed --> FeedSvc
  Meta --> FeedSvc
  Viewer -->|GET media| CDN`,
        },
        {
          type: 'architectureCard',
          title: 'Upload & Processing',
          description:
            'Issues pre-signed URLs so blobs go straight to object storage (never through app servers). A Kafka-triggered pipeline generates multiple resolutions, formats (WebP/AVIF, HLS for video), and thumbnails, then warms the CDN.',
          icon: 'upload',
          tags: ['blob', 'transcode', 'async'],
        },
        {
          type: 'architectureCard',
          title: 'Feed Service',
          description:
            'Builds the home feed: reads precomputed post IDs from Redis, hydrates post metadata + author + counts in a batched multi-get, merges in posts from very-high-follower accounts (pull path), ranks, and returns a page.',
          icon: 'layers',
          tags: ['feed', 'hydrate', 'rank'],
        },
        {
          type: 'architectureCard',
          title: 'CDN',
          description:
            'Globally distributed edge caches serve the vast majority of media bytes. Immutable, versioned object URLs make caching trivial and long-lived; origin (S3) is only hit on a cache miss.',
          icon: 'globe',
          tags: ['cdn', 'edge', 'cache'],
        },
      ],
    },
    {
      id: 'media-storage',
      title: 'Media Storage & Delivery',
      blocks: [
        {
          type: 'markdown',
          value:
            'Media is the defining workload. Originals are stored immutably in object storage; a pipeline derives the variants the apps actually request, and the CDN serves them from the edge. App servers never proxy bytes.',
        },
        {
          type: 'timeline',
          items: [
            {
              title: 'Request upload URL',
              description: 'Client asks the upload service for a short-lived pre-signed PUT URL.',
              meta: 'control plane',
            },
            {
              title: 'Direct upload',
              description: 'Client PUTs the original blob straight to object storage.',
              meta: 'S3',
            },
            {
              title: 'Commit post',
              description:
                'Client writes the post record (caption, blob key, author) — status PROCESSING.',
              meta: 'metadata',
            },
            {
              title: 'Process async',
              description:
                'Kafka triggers resize/transcode into multiple sizes & formats (WebP/AVIF, HLS).',
              meta: 'pipeline',
            },
            {
              title: 'Publish + warm CDN',
              description:
                'Mark post READY, fan out the ID, optionally pre-warm CDN for popular authors.',
              meta: 'CDN',
            },
          ],
        },
        {
          type: 'bestPractices',
          title: 'Media best practices',
          practices: [
            '**Store originals immutably**; derive variants — never mutate in place.',
            '**Version object URLs** (content hash) so the CDN can cache forever.',
            '**Generate responsive sizes** (thumb, feed, full) + modern formats (WebP/AVIF).',
            '**Tier storage**: hot in standard, cold/archival for old, rarely-viewed media.',
            '**Deduplicate** identical re-uploads by content hash.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Why direct-to-storage upload',
          body: 'Routing multi-megabyte uploads through application servers wastes bandwidth and ties up request threads. Pre-signed URLs let the client talk directly to object storage, so app servers only handle the tiny metadata write.',
        },
      ],
    },
    {
      id: 'api-design',
      title: 'API Design',
      blocks: [
        {
          type: 'apiTable',
          title: 'Core endpoints',
          endpoints: [
            {
              method: 'POST',
              path: '/v1/media/upload-url',
              description: 'Get a pre-signed URL for direct blob upload',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/posts',
              description: 'Create a post (after upload)',
              auth: true,
            },
            {
              method: 'GET',
              path: '/v1/posts/{id}',
              description: 'Fetch a single post',
              auth: false,
            },
            {
              method: 'GET',
              path: '/v1/feed',
              description: 'Ranked home feed (cursor-paginated)',
              auth: true,
            },
            {
              method: 'GET',
              path: '/v1/users/{id}/posts',
              description: "Profile grid (a user's posts)",
              auth: false,
            },
            {
              method: 'POST',
              path: '/v1/users/{id}/follow',
              description: 'Follow a user',
              auth: true,
            },
            { method: 'POST', path: '/v1/posts/{id}/like', description: 'Like a post', auth: true },
            {
              method: 'GET',
              path: '/v1/stories',
              description: 'Active stories from followed users',
              auth: true,
            },
          ],
        },
        {
          type: 'markdown',
          value:
            'Feeds use **cursor-based pagination** keyed on a time-sortable ID so paging stays stable as new posts arrive. A post returns the *set of media variant URLs* so the client picks the right size for the device and network.',
        },
        {
          type: 'code',
          language: 'json',
          filename: 'feed-response.json',
          highlightLines: [2, 11, 12, 13],
          code: `{
  "cursor": { "next": "1745928374650000032" },
  "items": [
    {
      "id": "1745928374650000001",
      "author": { "id": "u_42", "handle": "ada", "verified": true },
      "caption": "golden hour 🌅",
      "createdAt": 1735689600000,
      "metrics": { "likes": 4820, "comments": 132 },
      "media": {
        "thumb": "https://cdn.ig.com/p/abc_150.webp",
        "feed":  "https://cdn.ig.com/p/abc_1080.webp",
        "full":  "https://cdn.ig.com/p/abc_full.avif"
      }
    }
  ]
}`,
        },
      ],
    },
    {
      id: 'database-design',
      title: 'Database Design',
      blocks: [
        {
          type: 'markdown',
          value:
            'Polyglot persistence: posts in a wide-column store, the feed as Redis lists of IDs, the graph + users in sharded SQL, counts in dedicated counters, and blobs in object storage referenced by key.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'posts.cql',
          highlightLines: [3, 9],
          code: `-- Posts: partition by author for fast profile reads; id is time-sortable.
CREATE TABLE posts (
  author_id  bigint,
  post_id    bigint,        -- Snowflake: time-ordered, globally unique
  caption    text,
  media_keys list<text>,    -- blob keys for each variant / carousel item
  status     text,          -- PROCESSING | READY
  PRIMARY KEY ((author_id), post_id)
) WITH CLUSTERING ORDER BY (post_id DESC);

-- Bidirectional follow edges.
CREATE TABLE followers (user_id bigint, follower_id bigint,
  PRIMARY KEY ((user_id), follower_id));     -- who follows me
CREATE TABLE following (user_id bigint, followee_id bigint,
  PRIMARY KEY ((user_id), followee_id));     -- who I follow`,
        },
        {
          type: 'table',
          caption: 'Data store chosen per workload.',
          headers: ['Data', 'Store', 'Why'],
          rows: [
            ['Media blobs', 'Object store (S3) + CDN', 'Large, immutable, globally served'],
            ['Post metadata', 'Cassandra', 'Write-heavy, partition by author, AP'],
            ['Home feeds', 'Redis (lists of post IDs)', 'Precomputed, fast reads, capped'],
            ['Users + social graph', 'Sharded SQL (PostgreSQL)', 'Relational, transactional'],
            [
              'Counts (likes/comments)',
              'Sharded counters / Redis',
              'High write rate, approximate ok',
            ],
            ['Stories', 'Redis / Cassandra with TTL', 'Ephemeral, auto-expire in 24h'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Stories = TTL data',
          body: 'Stories expire after 24 hours, which maps perfectly onto a store with native **TTL** (Redis, or Cassandra with per-row TTL). No cleanup job needed — the data evicts itself.',
        },
      ],
    },
    {
      id: 'feed-generation',
      title: 'Feed Generation',
      blocks: [
        {
          type: 'markdown',
          value:
            "Like other social feeds, Instagram uses a **hybrid fan-out**. For most users, push the new post ID into each follower's Redis feed on write (fan-out-on-write). For accounts with huge follower counts, skip the push and **pull-and-merge** their recent posts at read time. The feed stores **post IDs**, not media — bytes come from the CDN.",
        },
        {
          type: 'featureComparison',
          caption: 'Fan-out-on-write vs fan-out-on-read.',
          columns: ['On write (push)', 'On read (pull)'],
          rows: [
            { feature: 'Read latency', values: ['Fast (precomputed)', 'Slower (merge at read)'] },
            { feature: 'Write cost', values: ['High (N writes/post)', 'Low (1 write/post)'] },
            { feature: 'Best for', values: ['Normal users', 'Celebrities / inactive users'] },
            { feature: 'Storage', values: ['Large per-user lists', 'Minimal'] },
            { feature: 'Celebrity-safe', values: [false, true] },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Store IDs, hydrate on read',
          body: 'A viral post lives once in metadata + once per variant in the CDN, and is referenced from millions of feeds as just an ID. On read, batch-hydrate IDs into post metadata, then the client fetches media directly from the edge.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Skip inactive users on write',
          body: 'Pushing into feeds of users who have not opened the app in weeks is wasted work. Skip them and rebuild their feed on-demand when they return — a big reduction in fan-out volume.',
        },
      ],
    },
    {
      id: 'communication-flow',
      title: 'Communication Flow',
      blocks: [
        {
          type: 'markdown',
          value: 'The full lifecycle of posting a photo and a follower viewing it:',
        },
        {
          type: 'mermaid',
          caption: 'Upload → process → fan-out → feed read → media from CDN.',
          definition: `sequenceDiagram
  participant A as Author
  participant U as Upload Svc
  participant S as Object Store
  participant K as Kafka
  participant P as Processor
  participant F as Feed Fan-out
  participant V as Viewer
  participant C as CDN
  A->>U: request upload URL
  U-->>A: pre-signed URL
  A->>S: PUT original blob
  A->>U: create post (key) [PROCESSING]
  U->>K: post.created
  K->>P: resize/transcode → variants
  P->>S: store variants; mark READY
  K->>F: fan-out post id to followers
  V->>F: GET /feed
  F-->>V: post IDs + metadata (hydrated)
  V->>C: GET media variant
  C-->>V: image bytes (edge cache)`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Optimistic upload UX',
          body: 'The app shows the post as "uploading/processing" immediately using the local copy, while the blob uploads and variants are generated in the background. The post becomes visible to followers once it is `READY`.',
        },
      ],
    },
    {
      id: 'caching-strategy',
      title: 'Caching Strategy',
      blocks: [
        {
          type: 'markdown',
          value:
            'Caching happens at multiple layers: the **CDN** for media bytes (the biggest win), **Redis** for feeds and hot post/profile metadata, and counters cached for likes/comments. The 95%+ CDN hit ratio is what makes global media delivery affordable.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'FeedService.java',
          highlightLines: [7, 8, 9, 10],
          code: `@Service
public class FeedService {

  private final RedisFeed feeds;       // per-user list of post IDs
  private final PostCache posts;       // id -> hydrated post metadata

  public List<Post> feed(long userId, Cursor cursor) {
    List<Long> ids = feeds.range(userId, cursor, 30);   // precomputed
    List<Post> base = posts.multiGet(ids);              // batch hydrate
    List<Post> merged = celebrities.mergeInto(base, userId);
    return ranker.rank(merged, userId);                 // media URLs already in metadata
  }
}`,
        },
        {
          type: 'bestPractices',
          title: 'Caching best practices applied here',
          practices: [
            '**Immutable, versioned media URLs** → cache at the CDN effectively forever.',
            '**Cap feed length** (~hundreds of IDs); older posts reconstructed on demand.',
            '**Batch hydrate** post metadata with multi-get to cut round-trips.',
            '**Cache hot profiles + posts** so viral content is one entry.',
            '**TTL + jitter** to avoid synchronized expiry stampedes.',
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
            '**Offload media bytes to the CDN** so origin + app servers handle requests, not gigabytes.',
            '**Hybrid fan-out**: push for normal users, pull-and-merge for celebrities; skip inactive users.',
            '**Direct-to-storage uploads** via pre-signed URLs keep app servers thin.',
            '**Async processing** (resize/transcode) via Kafka so uploads return instantly.',
            '**Shard by user id**: feeds, posts, graph, counters.',
            '**Approximate counts** with sharded counters; exactness is unnecessary.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Read-optimize the common path',
          body: 'Reads dwarf writes. Pay the cost on the rare write (fan-out, transcoding, CDN warming) so the frequent read is a single feed lookup + CDN hit. This read-optimization is the throughline of the whole design.',
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
            "Feeds are **eventually consistent** — a post appears in followers' feeds within seconds. Media is **immutable**, so once stored and on the CDN there is nothing to reconcile. Counts are eventually-consistent approximations from sharded counters.",
        },
        {
          type: 'featureComparison',
          caption: 'Consistency expectations by data type.',
          columns: ['Strong', 'Eventual'],
          rows: [
            { feature: 'Media durability (uploaded blob)', values: [true, false] },
            { feature: 'Feed freshness', values: [false, true] },
            { feature: 'Like / comment counts', values: [false, true] },
            { feature: 'Follow graph view', values: [false, true] },
            { feature: 'User profile / handle', values: [true, false] },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Read-your-own-writes',
          body: "A user must see their own post immediately. Inject the just-created post into the author's own feed/profile synchronously, even before async fan-out reaches everyone else.",
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
            'The read path stays up even when sub-systems degrade. If ranking is down, serve a chronological feed; if a feed cache shard is lost, rebuild from the graph; if counts are unavailable, hide the number rather than error. Media is served from many edge locations, so a single origin region issue is invisible to most users.',
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Graceful degradation',
          body: 'A degraded feed (chronological, approximate counts, slightly delayed new posts) beats an error page. Never let ranking, counts, or processing failures take down the core feed or media delivery.',
        },
        {
          type: 'youtube',
          videoId: 'QmX2NPkJTKg',
          title: 'Designing Instagram / photo feed (illustrative embed)',
        },
      ],
    },
    {
      id: 'partitioning',
      title: 'Partitioning',
      blocks: [
        {
          type: 'markdown',
          value:
            'Posts partition by `author_id` (profile = one fast read). Feeds partition by the owning user id. The graph partitions by user id with both follower/following lists. Object storage partitions blobs by key prefix (often a hash) to spread load evenly.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Avoid hot partitions',
          body: "A celebrity's follower list (read on every post) and a viral post's counters are hot spots. Mitigate by caching follower lists, routing celebrity posts to the read-time merge path, and **sharding counters** (e.g. `post_id:bucket`) then aggregating.",
        },
      ],
    },
    {
      id: 'sharding',
      title: 'Sharding',
      blocks: [
        {
          type: 'markdown',
          value:
            'Cassandra and Redis shard by a hash of the key via consistent hashing, so adding nodes rebalances automatically. The relational graph/users tier shards by user id. Instagram famously scaled PostgreSQL by sharding into thousands of logical shards mapped onto a smaller set of physical machines.',
        },
        {
          type: 'mermaid',
          caption: 'Logical shards mapped onto physical nodes.',
          definition: `flowchart LR
  ID["hash(user_id) → logical shard"] --> L1["logical shard 0..N"]
  L1 --> P1["Physical node A"]
  L1 --> P2["Physical node B"]
  L1 --> P3["Physical node C"]`,
        },
      ],
    },
    {
      id: 'replication',
      title: 'Replication',
      blocks: [
        {
          type: 'markdown',
          value:
            'Object storage replicates blobs across devices/zones (and often regions) for **11 nines** of durability. Cassandra replicates each partition RF=3, one per AZ, with quorum writes. SQL uses primary + replicas. Media is additionally "replicated" implicitly across CDN edge caches worldwide.',
        },
        {
          type: 'prosCons',
          title: 'Multi-region media + metadata',
          pros: [
            'Survives a region outage; media served from nearest edge.',
            'Low global latency for both feed and media.',
            'Very high media durability via cross-zone replication.',
          ],
          cons: [
            'Cross-region metadata lag → brief feed divergence.',
            'Storage + egress cost of wide replication.',
            'Operational complexity of multi-region writes.',
          ],
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
            '**Commit metadata before publishing** so a post is never half-created.',
            '**Idempotent processing + fan-out** keyed on `post_id` so retries are safe.',
            '**Retry transcoding** on failure; the original is safely stored.',
            '**Circuit breakers + fallbacks** on ranking, counts, and processing.',
            '**Rebuild feeds lazily** from the graph if a cache shard is lost.',
            '**CDN absorbs origin failures** for already-cached media.',
          ],
        },
        {
          type: 'expandable',
          title: 'Example: idempotent post processing',
          blocks: [
            {
              type: 'code',
              language: 'java',
              filename: 'ProcessPost.java',
              code: `@KafkaListener(topics = "post.created", groupId = "media-processing")
public void process(PostEvent e) {
  // Idempotent: if variants already exist for this post, skip re-work.
  if (blobStore.hasVariants(e.postId())) { publish(e.postId()); return; }
  for (Size s : SIZES) {
    byte[] out = transcode(blobStore.original(e.postId()), s);
    blobStore.putVariant(e.postId(), s, out);   // deterministic key
  }
  metadata.markReady(e.postId());
  publish(e.postId());                          // triggers fan-out
}`,
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
              'Separate media + metadata planes',
              'Each scales independently',
              'Two systems to coordinate (post status)',
            ],
            [
              'Direct-to-storage upload',
              'Thin app servers, fast',
              'Pre-signed URL + status bookkeeping',
            ],
            ['Async transcoding', 'Instant upload UX', 'Eventual visibility; PROCESSING state'],
            ['Hybrid fan-out', 'Fast reads, bounded writes', 'Two feed code paths'],
            [
              'CDN-first delivery',
              'Cheap global low latency',
              'Cache invalidation / versioning care',
            ],
            ['Eventual consistency', 'Availability + scale', 'Brief staleness, approximate counts'],
          ],
        },
      ],
    },
    {
      id: 'technology-choices',
      title: 'Technology Choices',
      blocks: [
        {
          type: 'markdown',
          value: 'A representative slice of the stack and the role each plays:',
        },
        {
          type: 'table',
          headers: ['Concern', 'Technology'],
          rows: [
            ['Media storage', 'Object store (S3-like) + CDN'],
            ['Post metadata', 'Apache Cassandra'],
            ['Users + graph', 'Sharded PostgreSQL'],
            ['Feed cache', 'Redis / Memcached'],
            ['Eventing / processing', 'Apache Kafka'],
            ['Media processing', 'FFmpeg / image pipelines'],
            ['ID generation', 'Snowflake-style'],
            ['Search / Explore', 'Elasticsearch + ML ranking'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Pragmatic origins',
          body: 'Instagram famously ran a huge service on a small team by keeping the stack simple: Django, PostgreSQL (heavily sharded), Redis, and Cassandra, leaning on managed object storage + CDN for the heavy media lifting. "Do the simplest thing that scales" is a recurring lesson.',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'processing-worker.deploy.yaml',
          code: `service: media-processor
strategy: rolling
regions: [us-east-1, eu-west-1, ap-south-1]
autoscaling:
  metric: kafka_consumer_lag
  target: 5000
  min: 20
  max: 800
healthCheck:
  path: /health
  unhealthyThreshold: 3`,
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
              question: 'How do you store and serve media at scale?',
              answer:
                'Upload originals directly to object storage via **pre-signed URLs** (bypassing app servers), generate resized/transcoded variants asynchronously, and serve everything from a global **CDN** with immutable versioned URLs. App servers only handle small metadata records; bytes never flow through them.',
            },
            {
              question: 'How is the home feed built?',
              answer:
                "A **hybrid fan-out**: push post IDs into followers' Redis feeds on write for normal users, and pull-and-merge at read time for very-high-follower accounts. Feeds store IDs; on read you batch-hydrate metadata and the client loads media from the CDN.",
            },
            {
              question: 'Why store post IDs in the feed instead of full posts/media?',
              answer:
                'Deduplication and size. A viral post is stored once (metadata + CDN variants) and referenced by millions of feeds as an ID. It keeps feeds tiny and means an edit/delete updates one place.',
            },
            {
              question: 'How do Stories work?',
              answer:
                'Stories are ephemeral media with a 24h lifetime, stored in a TTL-capable store (Redis or Cassandra with per-row TTL) so they auto-expire with no cleanup job. The viewer fetches active stories from followed users, ordered by recency.',
            },
            {
              question: 'How do you handle the upload → visible delay?',
              answer:
                'Return immediately after the metadata commit with status `PROCESSING`, show the local copy optimistically, and run resize/transcode asynchronously via Kafka. Once variants exist, mark the post `READY` and fan it out to followers.',
            },
            {
              question: 'How do you keep media delivery cheap and fast globally?',
              answer:
                'Aggressive **CDN caching** with immutable, content-hashed URLs (95%+ hit ratio), responsive sizes + modern formats (WebP/AVIF), and tiered storage that moves cold media to cheaper classes. Origin is only touched on a cache miss.',
            },
            {
              question: 'Why separate the media plane from the metadata/feed plane instead of one unified service?',
              answer:
                'They have opposite scaling profiles: media is huge, immutable, write-once/read-many bytes best served by object storage + CDN; metadata/feed is tiny, mutable, relational-ish records best served by databases and caches. Coupling them would force one system to compromise — e.g. a database trying to stream gigabytes, or a CDN trying to do transactional writes. Separating lets each scale on its own axis.',
            },
            {
              question: 'How do you prevent duplicate uploads of the same photo from wasting storage?',
              answer:
                "Hash the uploaded blob's content and check a content-hash index before storing a new copy; if a match exists, reference the existing blob (dedup by content, not by user intent). This is an optimization, not a requirement — call it out as a nice-to-have if storage cost is raised as a concern.",
            },
            {
              question: 'What happens if a follow happens right as someone is fanning out a new post?',
              answer:
                'Fan-out uses a **snapshot** of the follower list taken when the event is processed; a follow that lands a moment later is not retroactively applied to that one post. This is an accepted, brief inconsistency — the next post correctly reflects the updated graph. Perfect correctness here is not worth the coordination cost.',
            },
            {
              question: 'How would you extend this design to support Reels (short video) alongside photos?',
              answer:
                'Route video uploads through a transcoding pipeline analogous to the YouTube design (chunk, encode into an ABR ladder, package for adaptive streaming) instead of simple image resizing. The feed/metadata plane is largely unchanged — a post just carries a `mediaType` and points at either an image variant set or a video manifest.',
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
              label: 'Instagram Engineering Blog',
              url: 'https://instagram-engineering.com/',
              source: 'Instagram',
            },
            {
              label: 'Sharding & IDs at Instagram',
              url: 'https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c',
              source: 'Instagram',
            },
            {
              label: 'What Powers Instagram: Hundreds of Instances, Dozens of Technologies',
              url: 'https://instagram-engineering.com/what-powers-instagram-hundreds-of-instances-dozens-of-technologies-adf2e22da2ad',
              source: 'Instagram',
            },
            {
              label: 'Scaling Instagram Infrastructure (talk)',
              url: 'https://www.youtube.com/watch?v=hnpzNAPiC0E',
              source: 'InfoQ',
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
          body: '1. **Separate the media plane from the metadata/feed plane** — move large immutable blobs through object storage + CDN, and tiny records through the app.\n2. **Upload direct to storage** via pre-signed URLs and **process asynchronously** into responsive variants.\n3. **Build feeds with a hybrid fan-out**, storing **post IDs** and hydrating on read; skip celebrities and inactive users on write.\n4. **Serve media from a CDN** with immutable, versioned URLs for a 95%+ hit ratio and cheap global delivery.\n5. **Embrace eventual consistency** for feeds and counts; rely on object-storage replication for media durability.',
        },
      ],
    },
  ],
};

export default content;
