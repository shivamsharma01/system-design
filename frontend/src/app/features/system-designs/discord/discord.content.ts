import { DesignContent } from '../../../shared/models';
import { DISCORD_META } from './discord.meta';

/**
 * Flagship-depth example (peer of the Netflix, WhatsApp, etc. designs).
 * Discord: real-time community chat organized into servers (guilds) and
 * channels, with a persistent WebSocket gateway, presence at scale, durable
 * message history on Cassandra/ScyllaDB, and low-latency group voice over
 * WebRTC SFUs. Emphasis on the guild fan-out model and the "large server"
 * problem that distinguishes Discord from 1:1 chat (WhatsApp).
 */
const content: DesignContent = {
  meta: DISCORD_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Discord** is a real-time communication platform organized around **servers** (internally "guilds"), each containing **text and voice channels**. Unlike 1:1 messengers, Discord is built for **many-to-many group communication** — a single message in a popular channel may need to reach tens of thousands of connected members instantly, alongside live **presence** ("who is online") and low-latency **group voice**.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The big idea',
          body: 'Discord is a **fan-out-on-read-connection** system. Members hold a persistent **WebSocket** to a gateway; events (messages, presence, typing) are pushed to everyone currently subscribed to a channel. The defining challenges are the **large-guild fan-out** (one event → 100k+ recipients), **presence at scale** (the most expensive feature), and **real-time voice** over a separate media path.',
        },
        {
          type: 'image',
          src: 'assets/diagrams/discord-architecture.svg',
          alt: 'Discord clients hold WebSockets to an Elixir gateway with one process per guild; events flow through a pub/sub bus and fan out to subscribed sessions; messages persist in Cassandra/ScyllaDB; voice media flows directly between clients and SFU media servers over WebRTC.',
          caption:
            'A persistent WebSocket gateway fans out guild events; messages persist in Cassandra; voice media flows client↔SFU directly, bypassing the gateway.',
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
            '**Servers (guilds) & channels**: create servers, text/voice channels, roles/permissions.',
            '**Real-time messaging**: send/edit/delete messages, delivered instantly to channel members.',
            '**Message history**: durable, scrollable, searchable per channel.',
            '**Presence**: online/idle/dnd/offline status and "typing…" indicators.',
            '**Group voice/video**: join a voice channel, low-latency multi-party audio.',
            '**Notifications**: mentions and DMs push to offline users.',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Out of scope (state explicitly)',
          body: 'Video streaming/Go-Live screenshare internals, the bot/API platform, moderation tooling, and Nitro billing. We focus on the core real-time chat + presence + voice architecture and the large-guild scaling problem.',
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
            'Low latency: messages and presence must feel instant (<100ms fan-out within region).',
            'Massive concurrency: millions of simultaneous persistent WebSocket connections.',
            'High availability: a gateway node loss must reconnect clients seamlessly.',
            'Durability for messages: history must never be lost (voice is ephemeral).',
            'Scalable to huge guilds: a single server can have millions of members.',
          ],
          cons: [
            'Strict global ordering across channels is NOT required (per-channel ordering suffices).',
            'Voice durability is NOT required (real-time, dropped packets are tolerable).',
            'Presence can be slightly eventually-consistent (a second of staleness is fine).',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The connection is the scaling unit',
          body: "Discord's cost is dominated by **holding millions of idle-but-live WebSocket connections** and pushing events to them — not by raw message throughput. This is why Discord famously uses **Elixir/Erlang (the BEAM VM)**: cheap lightweight processes (one per connection, one per guild) and battle-tested distribution for exactly this concurrency model.",
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
            'Assume **150M** monthly users, **15M** concurrent connections at peak, **10B** messages/day, and large guilds up to **1M+** members.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Monthly users', value: '~150M', hint: 'active' },
            { label: 'Peak concurrent', value: '~15M', hint: 'live WebSockets' },
            { label: 'Messages/day', value: '~10B', hint: 'all channels' },
            { label: 'Avg send rate', value: '~115k/s', hint: '10B / 86,400s' },
            { label: 'Message size', value: '~200 B', hint: 'text + metadata' },
            { label: 'New storage/day', value: '~2 TB+', hint: 'with replication' },
          ],
        },
        {
          type: 'markdown',
          value:
            'The dramatic number is **fan-out amplification**, not the send rate. One message to a 100k-member channel with 50k online produces up to 50k pushes:',
        },
        {
          type: 'math',
          display: true,
          tex: 'Pushes/s = SendRate \\times AvgOnlineRecipients \\;\\Rightarrow\\; 115{,}000 \\times \\overline{recipients}\\ \\text{can reach tens of millions of egress events/s}',
          caption:
            'Egress (fan-out) dwarfs ingest: the system is sized by how many connections each event must be delivered to, not how many messages are sent.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'The large-guild problem',
          body: 'Most guilds are tiny, but a few are enormous (a popular game or creator community). A naive "push to every member" model collapses for million-member guilds. Handling this skew — by only fanning out to *connected, subscribed* sessions and lazily loading member lists — is the crux of the design.',
        },
      ],
    },
    {
      id: 'gateway',
      title: 'The Real-Time Gateway',
      blocks: [
        {
          type: 'markdown',
          value:
            'Clients open one **persistent WebSocket** to the **gateway** and keep it alive with heartbeats. After connecting, the client receives a `READY` payload (its guilds, channels, initial presence) and then a stream of **events**. The gateway maintains per-connection **session state** and routes events to the right sockets.',
        },
        {
          type: 'mermaid',
          caption: 'Gateway handshake and event stream.',
          definition: `sequenceDiagram
  participant C as Client
  participant G as Gateway (Elixir)
  participant S as Session/Guild process
  C->>G: WS connect + IDENTIFY (token)
  G->>S: register session, subscribe to guilds
  G-->>C: READY (guilds, channels, presence)
  loop heartbeat
    C->>G: heartbeat
    G-->>C: heartbeat ack
  end
  S-->>G: MESSAGE_CREATE event (from pub/sub)
  G-->>C: push MESSAGE_CREATE
  Note over C,G: On disconnect, client RESUMEs with last seq to replay missed events`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'RESUME beats re-sync',
          body: 'Mobile networks drop constantly. Each event carries a **sequence number**; on reconnect the client sends `RESUME` with its last seq and the gateway **replays only missed events** from a short buffer — far cheaper than resending the full `READY` state on every blip.',
        },
        {
          type: 'architectureCard',
          title: 'Gateway (Elixir/BEAM)',
          description:
            "Terminates millions of WebSockets. One lightweight Erlang process per connection and per guild; subscribes sessions to guild/channel topics and fans out events. The BEAM's cheap processes + supervision trees make massive concurrency and fault isolation natural.",
          icon: 'workflow',
          tags: ['websocket', 'elixir', 'fan-out'],
        },
      ],
    },
    {
      id: 'guild-fanout',
      title: 'Guilds & Event Fan-out',
      blocks: [
        {
          type: 'markdown',
          value:
            'Each guild is represented by a **single coordinating process** (an Erlang/Elixir GenServer) that knows which sessions are currently subscribed to which channels. When a message arrives, the guild process pushes it to the connected sessions for that channel — **not** to all members, only those with a live connection and the channel in view/subscription.',
        },
        {
          type: 'mermaid',
          caption: 'Message fan-out via the guild process.',
          definition: `flowchart TD
  Send["Client sends message"] --> MS["Message Service\\n(persist + Snowflake id)"]
  MS --> Bus[("Pub/Sub bus")]
  Bus --> GP["Guild process\\n(subscription registry)"]
  GP --> S1["Session A (online)"]
  GP --> S2["Session B (online)"]
  GP -. skip .- Off["Offline members\\n(fetch on next connect)"]
  MS --> DB[("Cassandra: persist")]`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Why a single process per guild is both genius and a bottleneck',
          body: "A per-guild process gives a clean, consistent place to manage subscriptions and ordering. But for a **million-member guild**, that one process becomes a hotspot. Discord's real solution scales fan-out across multiple nodes and only tracks **connected** sessions; presence and member lists are loaded **lazily** rather than held fully in memory.",
        },
        {
          type: 'expandable',
          title: 'Detail: how Discord scaled the guild process',
          blocks: [
            {
              type: 'markdown',
              value:
                "Discord published how very large guilds overwhelmed a single Elixir process. Fixes included **off-loading fan-out work** to dedicated processes, **manual GC tuning**, and a **`Manifold`/`FastGlobal`-style** approach to spread message delivery across the BEAM cluster. The principle: never let one guild's scale be bounded by one process or one machine.",
            },
          ],
        },
      ],
    },
    {
      id: 'presence',
      title: 'Presence at Scale',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Presence** ("who is online", status, what game they are playing) is famously Discord\'s **most expensive feature**. When you come online, everyone who shares a guild with you may need to see it — an N×M fan-out. Worse, large guilds mean a single presence change could notify hundreds of thousands.',
        },
        {
          type: 'bestPractices',
          title: 'Taming presence',
          practices: [
            '**Only push presence to subscribers viewing the member list / relevant scope**, not all guild members.',
            '**Lazy member lists**: for huge guilds, do not send full presence on `READY`; load ranges as the user scrolls.',
            '**Debounce/batch** presence updates so flapping status changes coalesce.',
            "**Eventual consistency**: a second of staleness in someone's status is acceptable.",
            '**Dedicated presence service** with in-memory state keyed by session, replicated for failover.',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Presence is soft state',
          body: 'Presence lives in memory, not durable storage — it is reconstructed from live connections. If a presence node fails, the truth is re-derived as clients reconnect and re-announce. Treating it as **soft, rebuildable state** (not a database) is what keeps it affordable.',
        },
      ],
    },
    {
      id: 'message-storage',
      title: 'Message Storage',
      blocks: [
        {
          type: 'markdown',
          value:
            'Messages must be durable, ordered per channel, and efficiently paginated ("scroll up"). Discord famously migrated from MongoDB to **Cassandra** and later **ScyllaDB** for this — a write-heavy, append-mostly, time-ordered workload partitioned by channel. Message IDs are **Snowflakes**, which embed a timestamp so IDs sort chronologically and double as cursors.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'messages.cql',
          highlightLines: [3, 4, 5],
          code: `-- Cassandra/Scylla: partition by (channel, time-bucket) so a hot channel's
-- history is spread across bounded partitions, ordered by Snowflake id.
CREATE TABLE messages (
  channel_id   bigint,
  bucket       int,            -- e.g. ~10-day window to cap partition size
  message_id   bigint,         -- Snowflake (time-sortable) = clustering key
  author_id    bigint,
  content      text,
  PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Why bucketing matters',
          body: 'Without a time **bucket** in the partition key, a years-old busy channel becomes a single unbounded partition — a Cassandra anti-pattern that destroys performance. Bucketing by a time window keeps partitions a manageable size while preserving efficient "newest first" reads and cursor pagination by Snowflake id.',
        },
        {
          type: 'code',
          language: 'text',
          filename: 'snowflake.txt',
          code: `Snowflake (64-bit), Discord epoch = 2015-01-01:
| 42 bits: ms since epoch | 5 bits: worker | 5 bits: process | 12 bits: seq |
→ time-sortable, globally unique, no coordination, usable as a pagination cursor.`,
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
            'The platform splits into a **real-time plane** (gateway, guild processes, presence, pub/sub) and a **persistence/API plane** (message service, Cassandra, REST API), plus a separate **voice/media plane**. Real-time events flow over WebSockets; durable reads/writes go through the HTTP API and database.',
        },
        {
          type: 'architectureCard',
          title: 'Message Service',
          description:
            'Validates and persists messages, assigns Snowflake IDs, writes to Cassandra, and publishes a MESSAGE_CREATE event to the pub/sub bus for real-time fan-out. Also serves history reads (cursor pagination).',
          icon: 'send',
          tags: ['persistence', 'snowflake', 'history'],
        },
        {
          type: 'architectureCard',
          title: 'Presence Service',
          description:
            'In-memory, replicated store of session status and subscriptions. Computes who needs to see each presence change and pushes via the gateway, with batching and lazy member-list loading for huge guilds.',
          icon: 'activity',
          tags: ['soft-state', 'in-memory', 'batched'],
        },
        {
          type: 'architectureCard',
          title: 'Pub/Sub Bus',
          description:
            'Routes events from services to the gateway sessions subscribed to a guild/channel. Decouples producers (message/presence services) from the millions of consumer connections on the gateway tier.',
          icon: 'shuffle',
          tags: ['routing', 'decoupling', 'events'],
        },
        {
          type: 'architectureCard',
          title: 'Voice/Media Plane',
          description:
            'Signaling sets up a WebRTC session; media flows over UDP between clients and regional SFU media servers — not through the WebSocket gateway. Optimized for low latency and packet loss tolerance.',
          icon: 'server',
          tags: ['webrtc', 'sfu', 'udp'],
        },
      ],
    },
    {
      id: 'voice',
      title: 'Voice & Video (WebRTC + SFU)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Group voice cannot work peer-to-peer (a mesh of N participants needs N² streams). Discord uses an **SFU (Selective Forwarding Unit)**: each client sends **one** upstream to a regional media server, which **forwards** the relevant streams to the other participants. The gateway only handles **signaling** (who is in the channel, ICE/SDP); media flows separately over UDP.',
        },
        {
          type: 'mermaid',
          caption: 'Voice setup: signaling via gateway, media via SFU.',
          definition: `sequenceDiagram
  participant C as Client
  participant G as Gateway (signaling)
  participant V as Voice Service
  participant M as SFU Media Server
  C->>G: Join voice channel
  G->>V: allocate media server (by region)
  V-->>C: voice server + token (SDP/ICE)
  C->>M: UDP media (Opus audio)
  M-->>C: forwarded streams of other participants
  Note over C,M: SFU = 1 upstream per client, server forwards selectively`,
        },
        {
          type: 'featureComparison',
          caption: 'Why SFU (not mesh or MCU).',
          columns: ['P2P Mesh', 'MCU (mix)', 'SFU (forward)'],
          rows: [
            { feature: 'Client upload streams', values: ['N-1', '1', '1'] },
            { feature: 'Server CPU cost', values: ['None', 'High (mixing)', 'Low (forward)'] },
            { feature: 'Scales to large rooms', values: [false, true, true] },
            { feature: 'Per-stream client control', values: [true, false, true] },
            { feature: "Discord's choice", values: [false, false, true] },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'UDP + Opus, region-pinned',
          body: 'Voice uses **UDP** (drop late packets rather than stall) with the **Opus** codec, and clients connect to the **nearest regional** media server to minimize latency. Media servers are stateless workers — losing one just reconnects participants elsewhere.',
        },
      ],
    },
    {
      id: 'api-design',
      title: 'API & Gateway Events',
      blocks: [
        {
          type: 'apiTable',
          title: 'REST API (durable operations)',
          endpoints: [
            {
              method: 'POST',
              path: '/channels/{id}/messages',
              description: 'Send a message',
              auth: true,
            },
            {
              method: 'GET',
              path: '/channels/{id}/messages?before={id}',
              description: 'Paginated history (cursor)',
              auth: true,
            },
            {
              method: 'PATCH',
              path: '/channels/{id}/messages/{id}',
              description: 'Edit a message',
              auth: true,
            },
            {
              method: 'DELETE',
              path: '/channels/{id}/messages/{id}',
              description: 'Delete a message',
              auth: true,
            },
            { method: 'POST', path: '/guilds', description: 'Create a server (guild)', auth: true },
            {
              method: 'GET',
              path: '/guilds/{id}/members?after={id}',
              description: 'Lazy-load member ranges',
              auth: true,
            },
          ],
        },
        {
          type: 'table',
          caption: 'Gateway (WebSocket) events.',
          headers: ['Event', 'Direction', 'Purpose'],
          rows: [
            ['IDENTIFY / RESUME', 'client → gateway', 'Authenticate / replay missed events'],
            ['READY', 'gateway → client', 'Initial state (guilds, channels, presence)'],
            ['MESSAGE_CREATE', 'gateway → client', 'New message pushed to subscribers'],
            ['PRESENCE_UPDATE', 'gateway → client', 'A member’s status changed'],
            ['TYPING_START', 'gateway → client', 'Typing indicator'],
            ['VOICE_STATE_UPDATE', 'both', 'Join/leave/mute in a voice channel'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Two surfaces, one model',
          body: 'Durable, request/response actions (send, edit, history, server management) use the **REST API**; real-time pushes (new messages, presence, typing) arrive on the **WebSocket gateway**. A send goes REST → persist → pub/sub → gateway fan-out, so the sender and everyone else converge on the same event.',
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
            '**Shard the gateway**: clients connect to a shard by guild id; large bots use sharded connections.',
            '**One process per connection & per guild** (BEAM) for cheap concurrency + isolation.',
            '**Fan out only to connected, subscribed sessions** — never to all members.',
            '**Lazy member lists & presence** for huge guilds (load on scroll).',
            '**Partition messages by (channel, time-bucket)** in Cassandra/Scylla.',
            '**Region-pinned voice SFUs**; stateless media workers scale horizontally.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Most guilds are small; a few are gigantic',
          body: 'The workload is heavily skewed. Optimize the **common case** (small guilds: trivial fan-out) while special-casing the **tail** (mega-guilds: distributed fan-out, lazy loading, dedicated capacity). Designing for the average would break on the giants; designing only for giants would waste resources on the millions of small servers.',
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
            'A gateway node will die with thousands of live connections. Clients **auto-reconnect** (to another node) and `RESUME` from their last sequence number, replaying missed events from a buffer. Because presence is soft state and voice is ephemeral, recovery is mostly about re-establishing connections quickly.',
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Reconnect-and-resume is the availability model',
          body: "Durable truth (messages) lives in replicated Cassandra; everything real-time is rebuildable from live connections. So availability = fast reconnection + event replay. The BEAM's supervision trees restart failed processes automatically, and stateless gateway/voice nodes are trivially replaceable.",
        },
        {
          type: 'youtube',
          videoId: 'xrIRfppvDxg',
          title: 'How Discord scales real-time chat (illustrative embed)',
        },
      ],
    },
    {
      id: 'consistency',
      title: 'Consistency & Ordering',
      blocks: [
        {
          type: 'markdown',
          value:
            'Ordering is **per channel**, not global. Snowflake IDs (time-sortable) give a total order within a channel, so all clients render the same sequence. Across channels or guilds, no ordering guarantee is needed. Presence and typing are best-effort/eventual; message persistence is the only place requiring durability.',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'At-least-once delivery + idempotent render',
          body: 'On `RESUME`, a client may receive an event it already processed. Clients **dedupe by message/event id** so replays are harmless. This makes the fan-out path safely at-least-once rather than requiring expensive exactly-once delivery.',
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
            '**Replicated Cassandra/Scylla** (tunable quorum) so message history survives node loss.',
            '**Stateless gateway & voice nodes** — clients reconnect/RESUME on failure.',
            '**BEAM supervision trees** restart crashed connection/guild processes automatically.',
            '**Event sequence numbers + replay buffer** so reconnects miss nothing.',
            '**Soft-state presence** rebuilt from live connections (no durable dependency).',
            '**Regional isolation** for voice so one region’s outage is contained.',
          ],
        },
        {
          type: 'expandable',
          title: 'Example: client reconnect & resume',
          blocks: [
            {
              type: 'code',
              language: 'javascript',
              filename: 'resume.js',
              code: `socket.on('close', async () => {
  await backoff();                       // exponential backoff + jitter
  const ws = connect(GATEWAY_URL);
  ws.send({ op: 'RESUME', session_id, seq: lastSeq }); // replay from lastSeq
  // Gateway replays buffered events > lastSeq; if too old → full READY re-sync.
  ws.on('event', (e) => {
    if (e.seq <= lastSeq) return;        // idempotent: drop duplicates
    lastSeq = e.seq; apply(e);
  });
});`,
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
              'Elixir/BEAM gateway',
              'Cheap massive concurrency + isolation',
              'Niche stack; per-process hotspots at extreme scale',
            ],
            [
              'One process per guild',
              'Clean subscription/ordering model',
              'Mega-guild bottleneck (needs distribution)',
            ],
            [
              'Fan-out to connected only',
              'Bounded egress cost',
              'Offline users fetch on reconnect',
            ],
            [
              'Cassandra/Scylla, bucketed',
              'Write-scalable durable history',
              'Careful partition design required',
            ],
            ['Soft-state presence', 'Affordable, rebuildable', 'Eventually consistent status'],
            [
              'SFU voice over UDP',
              'Low latency, scales to big rooms',
              'Server forwarding infra; no media durability',
            ],
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
            ['Real-time gateway', 'Elixir / Erlang (BEAM)'],
            ['Message storage', 'Cassandra → ScyllaDB'],
            ['IDs', 'Snowflake (time-sortable)'],
            ['Pub/Sub & distribution', 'BEAM distribution / Manifold'],
            ['Voice media', 'WebRTC SFU (Rust media servers)'],
            ['Voice codec/transport', 'Opus over UDP'],
            ['Presence', 'In-memory replicated soft state'],
            ['API services', 'Python / Rust / Elixir mix'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Why Rust for media + hot paths',
          body: 'Discord moved several performance-critical, GC-sensitive services (including parts of the read-state/voice path) to **Rust** to eliminate GC pauses and get predictable low latency — a good example of choosing the right tool per plane (Elixir for concurrency, Rust for tight latency).',
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
              question: 'How is Discord different from designing WhatsApp?',
              answer:
                'WhatsApp is primarily **1:1 / small-group store-and-forward** with E2E encryption and offline delivery as the core. Discord is **many-to-many real-time broadcast**: persistent connections fan one event out to thousands of *currently connected* members in shared guilds, plus live presence and group voice. The hard part shifts from per-recipient delivery to **large-guild fan-out and presence at scale**.',
            },
            {
              question: 'How do you fan a message out to a 500k-member channel?',
              answer:
                'Do **not** push to all 500k. Push only to **connected, subscribed sessions** for that channel via the guild process / pub/sub, spreading the fan-out work across nodes. Offline members get it on next connect by reading history. Member lists and presence are **lazily loaded**, so the server never materializes the full membership in memory.',
            },
            {
              question: 'Why is presence the most expensive feature?',
              answer:
                'A single status change can require notifying everyone who shares a guild with the user — an N×M fan-out that explodes with large guilds. Discord controls it by pushing presence **only to relevant subscribers (visible member ranges)**, **batching/debouncing** updates, treating presence as **soft, eventually-consistent in-memory state**, and lazily loading member lists.',
            },
            {
              question: 'Why Elixir/Erlang, and where does it struggle?',
              answer:
                'The BEAM gives **millions of cheap concurrent processes**, built-in distribution, and supervision-tree fault tolerance — ideal for holding millions of WebSockets. It struggles when a **single guild process** becomes a hotspot for a mega-guild; Discord fixed this by distributing fan-out, tuning GC, and offloading work, and by moving latency-critical pieces to **Rust**.',
            },
            {
              question: 'How is message history stored and paginated?',
              answer:
                'In **Cassandra/ScyllaDB**, partitioned by **(channel_id, time-bucket)** and clustered by **Snowflake message_id** in descending order. Bucketing bounds partition size for busy channels; Snowflake IDs are time-sortable so they double as **pagination cursors** (`before={id}`) for efficient "scroll up" reads.',
            },
            {
              question: 'How does group voice scale, and why not P2P?',
              answer:
                'P2P mesh needs N² streams and N-1 uploads per client — unfeasible past a few people. Discord uses an **SFU**: each client sends **one** upstream to a regional media server that **selectively forwards** streams to others. Media is **WebRTC/Opus over UDP** (low latency, loss-tolerant); the gateway only does **signaling**, media flows separately.',
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
              label: 'How Discord stores billions of messages (Cassandra)',
              url: 'https://discord.com/blog/how-discord-stores-billions-of-messages',
              source: 'Discord Engineering',
            },
            {
              label: 'How Discord stores trillions of messages (ScyllaDB)',
              url: 'https://discord.com/blog/how-discord-stores-trillions-of-messages',
              source: 'Discord Engineering',
            },
            {
              label: 'Scaling Elixir for 5M concurrent users',
              url: 'https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users',
              source: 'Discord Engineering',
            },
            {
              label: 'Why Discord is switching from Go to Rust',
              url: 'https://discord.com/blog/why-discord-is-switching-from-go-to-rust',
              source: 'Discord Engineering',
            },
            {
              label: 'How Discord handles real-time voice/video',
              url: 'https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc',
              source: 'Discord Engineering',
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
          body: '1. **Discord is real-time broadcast at scale**: persistent WebSockets fan one event out to many connected members — egress, not ingest, dominates.\n2. **The BEAM (Elixir) is the connection engine**: a process per connection and per guild gives cheap concurrency and fault isolation; mega-guilds force distributing the guild fan-out.\n3. **Presence is the hardest, most expensive feature** — tame it with subscriber-scoped pushes, batching, lazy member lists, and soft, eventually-consistent state.\n4. **Durable history on Cassandra/Scylla**, partitioned by (channel, time-bucket) with time-sortable Snowflake IDs that double as cursors.\n5. **Voice is a separate plane**: WebRTC SFUs forward media over UDP/Opus, region-pinned for low latency, while the gateway only does signaling.',
        },
      ],
    },
  ],
};

export default content;
