import { DesignContent } from '../../../shared/models';
import { WHATSAPP_META } from './whatsapp.meta';

/**
 * Flagship-depth example (peer of the Netflix design). Walks the full messaging
 * stack: persistent connections, routing, store-and-forward, ordering, groups,
 * presence, end-to-end encryption, multi-device, and the failure modes that make
 * a chat system hard at billions of connections.
 */
const content: DesignContent = {
  meta: WHATSAPP_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'WhatsApp is a real-time messaging platform delivering **100B+ messages/day** to **~2B users** with end-to-end encryption, delivery/read receipts, presence ("online" / "last seen"), group chats, voice/video calls, and media sharing. Famously, it scaled to hundreds of millions of users with a tiny engineering team by leaning on **Erlang/OTP** for massive connection concurrency and a relentless bias toward simplicity.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The big idea',
          body: 'A chat system is fundamentally a **routing problem over long-lived connections**. The hard parts are not "store a message" — they are holding **hundreds of millions of persistent sockets**, knowing *which server* holds each online user, and guaranteeing **delivery + ordering** whether the recipient is online, offline, or spread across multiple devices.',
        },
        {
          type: 'image',
          src: 'assets/diagrams/whatsapp-architecture.svg',
          alt: 'WhatsApp message path: sender connects via WebSocket to a connection server, the router looks up the session registry, persists to the message store, pushes to offline devices, and delivers to the recipient.',
          caption:
            'High-level message path. Connection servers hold the sockets; the router decides whether to deliver in-memory, store-and-forward, or wake the device via push.',
        },
      ],
    },
    {
      id: 'functional-requirements',
      title: 'Functional Requirements',
      blocks: [
        {
          type: 'markdown',
          value:
            'We scope the interview to the messaging core. Calls and Status/Stories are mentioned but not designed in depth.',
        },
        {
          type: 'bestPractices',
          title: 'In scope',
          practices: [
            '**1:1 messaging** with delivery + read receipts (✓ sent, ✓✓ delivered, blue ✓✓ read).',
            '**Group messaging** (fan-out to all members, up to a cap).',
            '**Offline delivery** via store-and-forward + push notifications.',
            '**Presence**: online / last-seen, and typing indicators.',
            '**Media** (images, video, voice notes, documents) sharing.',
            '**End-to-end encryption** for all message content.',
            '**Multi-device**: same account active on phone + linked desktops.',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Out of scope (state this explicitly)',
          body: 'Voice/video call media (WebRTC/SFU), spam/abuse ML, payments, and the contact-discovery privacy pipeline. Naming what you are *not* designing keeps the 45-minute discussion focused on the messaging fabric.',
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
            'Low end-to-end latency: sub-second delivery when both peers are online.',
            'High availability of the send/receive path (target 99.99%).',
            'Durability: never lose a message the server has acknowledged.',
            'Ordering within a single conversation.',
            'Massive connection concurrency (hundreds of millions of live sockets).',
          ],
          cons: [
            'Global total ordering across conversations is unnecessary.',
            'Presence can be best-effort / eventually consistent.',
            'Exact "last seen" to the millisecond is not critical.',
            'Read-your-own-writes across devices is "soon", not instant.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'CAP framing',
          body: 'For the **message store**, durability and availability dominate; per-conversation ordering is provided by client-supplied IDs rather than a globally consistent clock. **Presence** is deliberately **AP** (stale "last seen" is fine). The one place you want stronger guarantees is the **acknowledgement protocol** — a message marked ✓✓ must really be on the recipient device.',
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
            'Back-of-the-envelope numbers anchor every later decision. Assume **2B** users, **100B** messages/day, and an average **text** message of ~100 bytes plus envelope.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Daily active connections', value: '~2B', hint: 'one+ device each' },
            { label: 'Messages / day', value: '100B+', hint: 'text + media metadata' },
            { label: 'Messages / sec (avg)', value: '~1.2M', hint: '100B / 86400' },
            { label: 'Peak msgs / sec', value: '~5–8M', hint: 'evening / events spike' },
            { label: 'Conns / server', value: '~1M+', hint: 'tuned Erlang node' },
            { label: 'Write volume', value: '~100 TB/day', hint: '100B × ~1KB env, text only' },
          ],
        },
        {
          type: 'markdown',
          value:
            'The number that drives the architecture is **concurrent connections**, not messages/sec. To size the connection tier:',
        },
        {
          type: 'math',
          display: true,
          tex: 'N_{servers} = \\frac{C_{concurrent}}{C_{per\\_server}} = \\frac{1\\times10^{9}}{1\\times10^{6}} = 1000\\ \\text{(× headroom for failover \\& skew)}',
          caption:
            'With ~1B concurrent sockets at ~1M per tuned node you need on the order of a few thousand connection servers including failover headroom.',
        },
        {
          type: 'markdown',
          value:
            'Media is stored separately and dominates *bytes* but not *message count*: a single 5 MB video is one "message" in the control path but bypasses it entirely for the payload (uploaded to blob storage; only a pointer + key flows through the chat fabric).',
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
            'Clients hold a **persistent connection** to a stateful **connection server**. A **message router** consults a **session registry** (which server holds the recipient) and either delivers in-memory, persists to the recipient inbox (store-and-forward), or triggers a **push** to wake an offline device. Media never travels this path — it goes to blob storage with a CDN.',
        },
        {
          type: 'mermaid',
          caption: 'Connection tier, routing, store-and-forward, and the media side-channel.',
          definition: `flowchart TD
  A["Client A"] <-->|WebSocket| GW1["Connection Server 1"]
  B["Client B"] <-->|WebSocket| GW2["Connection Server 2"]
  GW1 --> Router["Message Router"]
  GW2 --> Router
  Router --> Session[("Session Registry: user → server")]
  Router --> Store[("Message Store + Inbox: Cassandra")]
  Router --> MQ[("Kafka: receipts, fan-out, analytics")]
  Router --> Push["Push (APNs / FCM) if offline"]
  A -.->|upload encrypted blob| Blob[("Media Store: S3 + CDN")]
  B -.->|download by key| Blob`,
        },
        {
          type: 'architectureCard',
          title: 'Connection Server (gateway)',
          description:
            'Holds the long-lived WebSocket/MQTT socket for each online client, parses frames, enforces backpressure, and emits presence. Stateful: it owns the mapping of its connected users and registers them in the session registry. Built for ~1M concurrent connections per node (Erlang lightweight processes).',
          icon: 'server',
          tags: ['websocket', 'stateful', 'presence', 'erlang'],
        },
        {
          type: 'architectureCard',
          title: 'Message Router',
          description:
            'Stateless service that, per message, looks up the recipient(s) in the session registry, persists the message, and dispatches: direct deliver if online, inbox + push if offline, and fan-out for groups. Emits receipts and telemetry to Kafka.',
          icon: 'network',
          tags: ['routing', 'fan-out', 'stateless'],
        },
        {
          type: 'architectureCard',
          title: 'Session Registry',
          description:
            'A fast, sharded key-value map of user → { connection_server, device_ids, last_seen }. Updated on every connect/disconnect. Backed by an in-memory store (Redis) with the connection servers as the source of truth.',
          icon: 'database',
          tags: ['redis', 'discovery', 'presence'],
        },
      ],
    },
    {
      id: 'api-design',
      title: 'API & Protocol',
      blocks: [
        {
          type: 'markdown',
          value:
            'Messaging uses a **persistent, bidirectional protocol** (WebSocket carrying a compact binary/Protobuf frame, historically a customized **XMPP/MQTT**-style protocol) rather than request/response REST. Plain REST is reserved for things that are not on the hot messaging path: registration, key upload, contact sync, and obtaining media upload URLs.',
        },
        {
          type: 'apiTable',
          title: 'REST endpoints (control plane)',
          endpoints: [
            {
              method: 'POST',
              path: '/v1/auth/register',
              description: 'Register device, verify phone, upload identity + prekeys',
            },
            {
              method: 'GET',
              path: '/v1/keys/{userId}',
              description: "Fetch a recipient's public prekey bundle (to start a session)",
              auth: true,
            },
            {
              method: 'GET',
              path: '/v1/media/upload-url',
              description: 'Pre-signed URL for direct encrypted media upload',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/contacts/sync',
              description: 'Discover which hashed contacts use the app',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/devices/link',
              description: 'Link a companion device (desktop/web)',
              auth: true,
            },
          ],
        },
        {
          type: 'markdown',
          value:
            'On the socket, everything is a typed **frame**. The client generates the message ID so receipts can be correlated and sends are idempotent across retries:',
        },
        {
          type: 'code',
          language: 'json',
          filename: 'ws-message-frame.json',
          highlightLines: [3, 6, 7],
          code: `{
  "type": "MESSAGE",
  "id": "msg_01H8X...",        // client-generated ULID: idempotency + receipt key
  "to": "user_456",
  "convId": "conv_123",
  "senderDeviceId": "dev_a1",
  "ciphertext": "base64...",    // E2E-encrypted; server never sees plaintext
  "mediaRef": null,             // or { key, sha256, size, blobUrl }
  "timestamp": 1735689600000
}`,
        },
        {
          type: 'expandable',
          title: 'Frame types on the socket',
          blocks: [
            {
              type: 'table',
              headers: ['Frame', 'Direction', 'Purpose'],
              rows: [
                ['MESSAGE', 'both', 'A chat message (ciphertext payload)'],
                ['ACK', 'both', 'Server-accepted / delivered / read receipts'],
                ['PRESENCE', 'both', 'online / offline / last-seen updates'],
                ['TYPING', 'both', 'Ephemeral typing indicator (not persisted)'],
                ['SYNC', 'S→C', 'Backlog of messages missed while offline'],
                ['PING / PONG', 'both', 'Heartbeat to detect dead connections'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'database-design',
      title: 'Data Model',
      blocks: [
        {
          type: 'markdown',
          value:
            'The workload is **write-heavy, append-only, and partition-friendly** — a near-perfect fit for **Cassandra**. Two core tables: the durable per-conversation log, and a per-user **inbox** of not-yet-delivered messages used by store-and-forward.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'messages.cql',
          highlightLines: [6, 7],
          code: `-- Per-conversation, time-ordered log. Partition by conversation so a
-- chat's history is a single contiguous read, newest-first.
CREATE TABLE messages (
  conv_id    uuid,
  msg_id     timeuuid,     -- time-based: gives ordering + uniqueness
  sender_id  uuid,
  ciphertext blob,
  media_ref  text,
  PRIMARY KEY ((conv_id), msg_id)
) WITH CLUSTERING ORDER BY (msg_id DESC);

-- Per-user inbox: pointers to messages awaiting delivery to this user's
-- devices. Rows are deleted once every device has acked.
CREATE TABLE inbox (
  user_id   uuid,
  msg_id    timeuuid,
  conv_id   uuid,
  device_id text,
  PRIMARY KEY ((user_id), msg_id, device_id)
) WITH CLUSTERING ORDER BY (msg_id ASC);`,
        },
        {
          type: 'table',
          caption: 'Data store chosen per workload (polyglot persistence).',
          headers: ['Data', 'Store', 'Why'],
          rows: [
            ['Message log + inbox', 'Cassandra', 'Append-heavy, partition by conv/user, AP'],
            ['Session registry / presence', 'Redis', 'Volatile, microsecond lookups, TTL'],
            ['User / device / keys', 'MySQL or Cassandra', 'Identity + prekey bundles'],
            ['Group membership', 'Cassandra / MySQL', 'Read on every group send'],
            ['Media blobs', 'S3 + CDN', 'Large, immutable, cacheable'],
            ['Events / receipts', 'Kafka', 'Decouple fan-out + analytics'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Ordering via timeuuid',
          body: 'A time-based UUID (`timeuuid`) as the clustering key yields per-conversation ordering *and* uniqueness with no global sequence service. The client also stamps a monotonically increasing per-conversation counter so the UI can resolve ties deterministically.',
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
            'The hottest "cache" is the **session registry** itself — an in-memory map every single message read hits. Beyond that, recent conversation tails, group membership, and recipient **prekey bundles** are cached to avoid round-trips on the send path.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Session registry as the hot path',
          body: 'Every routed message does at least one registry lookup (`user → server`). Keep it in RAM (Redis), shard by user id, and replicate so a single shard failure does not blind the router. The connection servers are the source of truth and re-register on reconnect.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'MessageRouter.java',
          highlightLines: [8, 9, 10, 11, 12],
          code: `@Service
public class MessageRouter {

  private final SessionRegistry sessions;  // Redis-backed, cache-aside
  private final MessageStore store;        // Cassandra
  private final PushService push;

  public void route(Message m) {
    store.persist(m);                       // durability first: never lose an accepted msg
    Session s = sessions.lookup(m.to());    // hot path: in-memory user → server
    if (s != null && s.isOnline()) {
      s.connectionServer().deliver(m);      // direct in-memory hand-off
    } else {
      store.enqueueInbox(m.to(), m.id());   // store-and-forward
      push.wake(m.to());                     // APNs / FCM
    }
  }
}`,
        },
        {
          type: 'bestPractices',
          title: 'Caching best practices applied here',
          practices: [
            'Keep the **session registry in memory**; treat connection servers as source of truth.',
            'Cache **group membership** — it is read on every group send (fan-out).',
            'Cache recipient **prekey bundles** briefly so starting a session is one round-trip.',
            'Add **TTL + jitter** to presence keys so dead sessions self-expire.',
            'Cache the **recent tail** of each open conversation on the device, not the server.',
          ],
        },
      ],
    },
    {
      id: 'load-balancing',
      title: 'Load Balancing',
      blocks: [
        {
          type: 'markdown',
          value:
            'Long-lived connections change the load-balancing game: you balance **connections**, not requests. A new client resolves Geo-DNS to the nearest PoP, an **L4 load balancer** (connection-aware, not L7 per-request) assigns it to a connection server, and that assignment is **sticky for the life of the socket**.',
        },
        {
          type: 'mermaid',
          caption: 'Connection establishment and assignment.',
          definition: `flowchart LR
  C["Client"] --> DNS["Geo DNS"]
  DNS --> LB["L4 LB (connection-aware)"]
  LB --> G1["Conn Server 1 (820k conns)"]
  LB --> G2["Conn Server 2 (610k conns)"]
  LB --> G3["Conn Server 3 (430k conns)"]
  G3 --> Reg[("Session Registry: register user → G3")]`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Rebalancing is the hard part',
          body: 'Because connections are sticky and long-lived, a freshly added server starts empty and a draining server must migrate millions of sockets. Balance on **new connections** (route new sockets to under-loaded nodes) and only force-migrate during maintenance — abruptly dropping sockets causes a reconnect thundering herd.',
        },
      ],
    },
    {
      id: 'storage',
      title: 'Media Storage',
      blocks: [
        {
          type: 'markdown',
          value:
            'Media bypasses the messaging fabric entirely. The sender **encrypts the blob on-device**, uploads it directly to object storage via a pre-signed URL, and then sends a tiny chat message containing the blob key, size, and decryption material. Recipients download by key and decrypt locally — the server stores only opaque ciphertext.',
        },
        {
          type: 'timeline',
          items: [
            {
              title: 'Encrypt on device',
              description: 'Sender generates a random media key and encrypts the file locally.',
              meta: 'client',
            },
            {
              title: 'Get upload URL',
              description: 'REST call returns a pre-signed, short-lived PUT URL.',
              meta: 'control plane',
            },
            {
              title: 'Direct upload',
              description:
                'Encrypted blob is PUT straight to object storage (never via chat servers).',
              meta: 'S3',
            },
            {
              title: 'Send pointer',
              description:
                'A normal MESSAGE frame carries { blobKey, sha256, mediaKey } as ciphertext.',
              meta: 'chat fabric',
            },
            {
              title: 'Download + decrypt',
              description: 'Recipient fetches by key (cached at CDN edge) and decrypts on-device.',
              meta: 'CDN',
            },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Dedup + TTL',
          body: 'Forwarded media can be deduplicated by content hash so a viral video is stored once and referenced many times. Undelivered media is garbage-collected after a TTL (e.g. 30 days) to bound storage.',
        },
      ],
    },
    {
      id: 'message-queues',
      title: 'Message Queues',
      blocks: [
        {
          type: 'markdown',
          value:
            'A durable log (**Kafka**) decouples the latency-sensitive send path from slower work: receipt propagation, group fan-out, multi-device sync, push dispatch, and analytics. The router writes an event once; many consumers act on it independently.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'fanout_consumer.py',
          code: `from kafka import KafkaConsumer

consumer = KafkaConsumer(
    "chat.group.sent",
    bootstrap_servers=["broker:9092"],
    group_id="group-fanout",
    enable_auto_commit=False,
)

for msg in consumer:
    event = decode(msg.value)
    # Idempotent fan-out: deliver/queue per member; safe to reprocess
    # because delivery is keyed on (member_id, msg_id).
    for member_id in group_members(event.group_id):
        deliver_or_enqueue(member_id, event.msg_id)
    consumer.commit()`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Make consumers idempotent',
          body: 'At-least-once delivery means duplicates happen (a consumer crashes after delivering but before committing its offset). Key all side effects on `(recipient_id, msg_id)` so reprocessing is a no-op and the user never sees a double message.',
        },
      ],
    },
    {
      id: 'communication-flow',
      title: 'Message Delivery Flow',
      blocks: [
        {
          type: 'markdown',
          value: 'The full lifecycle of a 1:1 message when the recipient is online:',
        },
        {
          type: 'mermaid',
          caption: 'Sending a 1:1 message (recipient online) with the three ticks.',
          definition: `sequenceDiagram
  participant A as Sender
  participant GA as Conn Server A
  participant R as Router
  participant DB as Store
  participant GB as Conn Server B
  participant B as Recipient
  A->>GA: MESSAGE (ciphertext, client msgId)
  GA->>R: route(to=B)
  R->>DB: persist (durability)
  R-->>GA: ACK ✓ (server accepted)
  GA->>A: render single tick ✓
  R->>GB: deliver
  GB->>B: MESSAGE
  B-->>GB: delivered receipt
  GB->>R: receipt → A
  R->>GA: ACK ✓✓ delivered
  B->>GB: read receipt (user opened chat)
  GB->>R: receipt → A
  R->>GA: ACK blue ✓✓ read`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Offline recipients (store-and-forward)',
          body: 'If the recipient has no live session, the message is written to their **inbox** and a **push notification** (APNs/FCM) wakes the device. On reconnect the client sends a SYNC request, pulls undelivered messages in order, acks them, and the server deletes the inbox rows. Receipts flow back to the sender the moment delivery and read happen.',
        },
      ],
    },
    {
      id: 'scaling-strategy',
      title: 'Scaling: Groups & Presence',
      blocks: [
        {
          type: 'markdown',
          value:
            'Two features dominate scaling cost: **group fan-out** and **presence**. Both are O(members) or worse if done naively, so each gets deliberate limits and laziness.',
        },
        {
          type: 'bestPractices',
          title: 'Group fan-out',
          practices: [
            '**Persist once, fan out on delivery**: store the message a single time, then deliver to each online member and enqueue for offline ones.',
            '**Cap group size** (e.g. ~1024) because fan-out cost and E2E re-encryption grow linearly with members.',
            '**Sender Keys** for E2E groups: encrypt the payload once with a shared sender key instead of N pairwise encryptions.',
            "**Async via Kafka** so a 1000-member fan-out never blocks the sender's ACK.",
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Presence is quadratic if you let it',
          body: 'Broadcasting every presence change to every contact is O(N²) chatter at platform scale. WhatsApp limits presence visibility, **subscribes lazily** (only to chats currently on screen), and updates **last-seen** opportunistically rather than streaming continuous online pings.',
        },
        {
          type: 'featureComparison',
          caption: 'Fan-out strategy by conversation type.',
          columns: ['1:1', 'Small group', 'Large group / broadcast'],
          rows: [
            { feature: 'Persist once', values: [true, true, true] },
            { feature: 'Synchronous deliver', values: [true, false, false] },
            { feature: 'Async fan-out (Kafka)', values: [false, true, true] },
            { feature: 'Sender-key encryption', values: [false, true, true] },
            { feature: 'Delivery receipts aggregated', values: [false, true, true] },
          ],
        },
      ],
    },
    {
      id: 'consistency',
      title: 'Ordering & Consistency',
      blocks: [
        {
          type: 'markdown',
          value:
            "WhatsApp provides **per-conversation ordering**, not global ordering. Order is derived from the message store's `timeuuid` plus a client-side per-conversation counter, so two messages in the *same* chat always render in a stable order even if they arrive out of order on the wire.",
        },
        {
          type: 'featureComparison',
          caption: 'Consistency expectations by data type.',
          columns: ['Strong', 'Eventual'],
          rows: [
            { feature: 'Message durability (accepted msg)', values: [true, false] },
            { feature: 'Per-conversation ordering', values: [true, false] },
            { feature: 'Presence / last-seen', values: [false, true] },
            { feature: 'Read receipts', values: [false, true] },
            { feature: 'Multi-device sync', values: [false, true] },
            { feature: 'Group membership view', values: [false, true] },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Exactly-once *feel* from at-least-once delivery',
          body: 'The transport is at-least-once; the **client-generated message ID** gives the recipient a dedup key, so the user *experiences* exactly-once. This is a recurring distributed-systems pattern: idempotency keys turn cheap at-least-once delivery into effectively-once behavior.',
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
            'The send/receive path must survive single-node, single-AZ, and ideally single-region failures. Connection servers are disposable: when one dies, its clients **reconnect** (with backoff + jitter) and re-register; durable state lives in Cassandra/Kafka, not in the gateway.',
        },
        {
          type: 'bestPractices',
          title: 'Keeping the path up',
          practices: [
            '**Stateless routers** behind health checks; restart freely.',
            '**Durable-first**: persist before ACK so a crash never loses an accepted message.',
            '**Reconnect storms**: clients back off with jitter; servers shed load gracefully.',
            '**Heartbeats** (ping/pong) detect half-open sockets so presence stays honest.',
            '**Push fallback** guarantees delivery even when the socket is gone.',
          ],
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Graceful degradation',
          body: 'If presence or read-receipts lag, messaging still works. If a connection server dies, clients reconnect within seconds. The one invariant that must never break: a message the server ACKed is durably stored and will eventually be delivered.',
        },
        {
          type: 'youtube',
          videoId: 'vvhC64hQZMk',
          title: 'Messaging system design deep dive (illustrative embed)',
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
            "The message log is partitioned by `conv_id` so an entire conversation lives on one partition (a single fast read for history). The inbox is partitioned by `user_id` so a device's pending messages are one lookup on reconnect. The session registry shards by `user_id` so routing is a single-shard hit.",
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Avoid hot partitions',
          body: 'A celebrity broadcast group or a huge community could create a hot `conv_id` partition. Mitigate by **capping group size**, treating broadcasts as fan-out-on-write to many normal conversations, and sharding very large groups into sub-partitions (`conv_id:bucket`).',
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
            'Cassandra shards transparently via consistent hashing over a token ring, so adding nodes rebalances data automatically with no application change. The **connection tier** is "sharded" by which physical server holds a socket; the session registry is the index that makes that mapping discoverable.',
        },
        {
          type: 'mermaid',
          caption:
            'Consistent hashing for the message store; session registry indexes live sockets.',
          definition: `flowchart LR
  K1["conv A"] --> N1["Node 1 (tokens 0-85)"]
  K2["conv B"] --> N2["Node 2 (tokens 86-170)"]
  K3["conv C"] --> N3["Node 3 (tokens 171-255)"]
  U["user 456"] --> SR[("Session Registry shard")] --> CS["→ Conn Server 7"]`,
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
            'Cassandra replicates each partition to **RF=3**, typically one replica per availability zone, with tunable quorum on writes (e.g. `LOCAL_QUORUM`) so a single AZ loss never loses an accepted message. For lower latency and disaster resilience, data is replicated across regions, with users served from their nearest region.',
        },
        {
          type: 'prosCons',
          title: 'Multi-region replication',
          pros: [
            'Survives an entire region outage.',
            'Lower latency by serving users from the nearest region.',
            'Inbox + message log durable across geographies.',
          ],
          cons: [
            'Cross-region replication lag → brief delivery delays on failover.',
            'Operationally complex (traffic + data steering).',
            'Cost of running active replicas everywhere.',
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
            '**Persist before ACK** so no accepted message is ever lost on crash.',
            '**At-least-once + idempotency keys** make retries safe end to end.',
            '**Reconnect with backoff + jitter** to avoid thundering herds after a gateway dies.',
            '**Timeouts, retries, circuit breakers** on every inter-service call.',
            '**Push fallback** delivers even when the live socket is unavailable.',
            '**Heartbeats** reap dead sockets so the registry and presence stay accurate.',
          ],
        },
        {
          type: 'expandable',
          title: 'Example: idempotent inbox drain on reconnect',
          blocks: [
            {
              type: 'code',
              language: 'java',
              filename: 'InboxSync.java',
              code: `public void onReconnect(User user, Device device) {
  List<Message> pending = inbox.fetch(user.id(), device.id());
  for (Message m : pending) {
    boolean acked = device.deliver(m);     // push frame over the socket
    if (acked) {
      // Safe to delete: keyed on (user, msg, device).
      inbox.remove(user.id(), m.id(), device.id());
    }
    // If not acked, leave it; next reconnect retries. No message lost,
    // no duplicate shown (client dedups on client-generated msg id).
  }
}`,
            },
          ],
        },
      ],
    },
    {
      id: 'multi-device',
      title: 'Multi-Device & Encryption',
      blocks: [
        {
          type: 'markdown',
          value:
            'WhatsApp uses the **Signal Protocol** for end-to-end encryption: the server only ever relays **ciphertext**. Keys are negotiated with the **X3DH** handshake and ratcheted forward with the **Double Ratchet**, giving forward secrecy and post-compromise security. The architecture is unchanged by E2E — the server still just routes opaque blobs.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Multi-device = per-device sessions',
          body: 'Each linked device has its **own identity key and session**. A message to a user is encrypted separately for each of their devices (and each recipient device in a group), then fanned out. The phone is no longer required to be online — companion devices hold independent encrypted sessions synced via the server.',
        },
        {
          type: 'expandable',
          title: 'What does the server actually see?',
          blocks: [
            {
              type: 'markdown',
              value:
                'Only **metadata** (who messaged whom, when, sizes, device count) and **ciphertext** — never plaintext content or media. This is why E2E encryption changes the *trust model* but not the *routing architecture*: encryption and decryption are entirely client-side, and the server cannot offer content search or server-side previews.',
            },
          ],
        },
        {
          type: 'mermaid',
          caption: 'Fan-out to a user with multiple linked devices.',
          definition: `flowchart TD
  S["Sender device"] -->|encrypt per device| R["Router"]
  R --> D1["Recipient phone"]
  R --> D2["Recipient desktop"]
  R --> D3["Recipient web"]`,
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
              'Persistent connections',
              'Real-time, low latency push',
              'Stateful servers, hard rebalancing',
            ],
            [
              'Store-and-forward',
              'Reliable offline delivery',
              'Inbox storage + delivery bookkeeping',
            ],
            ['Fan-out on delivery', 'Simple, always fresh', 'Linear cost; caps on group size'],
            ['Per-conversation ordering only', 'Cheap, scalable', 'No global ordering guarantee'],
            [
              'E2E encryption',
              'Privacy by default',
              'No server-side search/preview/dedup of content',
            ],
            [
              'Erlang/OTP connection tier',
              'Millions of conns/node, resilient',
              'Niche skill set, fewer libraries',
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
          type: 'markdown',
          value: 'A representative slice of the stack and the role each component plays:',
        },
        {
          type: 'table',
          headers: ['Concern', 'Technology'],
          rows: [
            ['Connection tier', 'Erlang/OTP (FreeBSD historically)'],
            ['Wire protocol', 'WebSocket + Protobuf (XMPP/MQTT-derived)'],
            ['Message + inbox store', 'Apache Cassandra'],
            ['Session registry / presence', 'Redis'],
            ['Eventing / fan-out', 'Apache Kafka'],
            ['Media storage', 'Object store (S3-like) + CDN'],
            ['Push delivery', 'APNs (iOS) / FCM (Android)'],
            ['Encryption', 'Signal Protocol (X3DH + Double Ratchet)'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Why Erlang?',
          body: 'Erlang/OTP was built for telecom switches: lightweight processes (millions per node), preemptive scheduling, supervision trees for self-healing, and hot code reloads. That maps almost perfectly onto "hold millions of sockets and route messages with five-nines uptime".',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'connection-tier.deploy.yaml',
          code: `service: connection-server
strategy: rolling           # drain sockets gracefully, never mass-disconnect
regions: [us-east-1, eu-west-1, ap-south-1]
autoscaling:
  metric: active_connections
  target: 900000            # leave headroom under the ~1M ceiling
  min: 50
  max: 4000
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
              question: 'How do you deliver a message to an offline user?',
              answer:
                "Store-and-forward: persist the message to the recipient's **inbox** and send a **push notification** (APNs/FCM) to wake the device. On reconnect the client issues a SYNC, pulls undelivered messages in order, acks each, and the server removes the inbox rows. Nothing is lost because persistence happens *before* the sender gets a ✓.",
            },
            {
              question: 'How does the router know which server holds a recipient?',
              answer:
                'A **session registry** (Redis) maps `user_id → { connection_server, device_ids }`. Connection servers update it on every connect/disconnect; the router looks it up per message. If the lookup misses or the session is stale, it falls back to store-and-forward + push.',
            },
            {
              question: 'How are the ticks (sent / delivered / read) implemented?',
              answer:
                'Three acknowledgements at different stages: **✓** when the server durably accepts the message, **✓✓** when it is delivered to a recipient device, and **blue ✓✓** when the recipient reads it. The client-generated message ID ties every receipt back to the original message.',
            },
            {
              question: 'How do you guarantee message ordering?',
              answer:
                'Only **per-conversation** ordering is needed. The store uses a `timeuuid` clustering key and the client adds a per-conversation counter, so messages in one chat render in a stable order. Global ordering across all conversations is unnecessary and would be far more expensive.',
            },
            {
              question: 'How does end-to-end encryption affect the design?',
              answer:
                'It changes the **trust model**, not the **routing**. The server relays ciphertext and metadata only; encryption/decryption are client-side via the Signal Protocol. For groups, **sender keys** avoid N pairwise encryptions; for multi-device, each device has its own session and the message is encrypted per device.',
            },
            {
              question: 'How would you handle a connection server crashing with 1M live sockets?',
              answer:
                'Those clients detect the dead socket (missed heartbeats) and **reconnect with backoff + jitter** to a new server, which re-registers them in the session registry. Durable state was never on the gateway, so no messages are lost; any in-flight messages are redelivered from the inbox.',
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
              label: 'WhatsApp Encryption Overview (Technical Whitepaper)',
              url: 'https://www.whatsapp.com/security/',
              source: 'WhatsApp',
            },
            {
              label: 'Signal Protocol Documentation',
              url: 'https://signal.org/docs/',
              source: 'Signal',
            },
            {
              label: 'The WhatsApp Architecture Facebook Bought For $19B',
              url: 'http://highscalability.com/blog/2014/2/26/the-whatsapp-architecture-facebook-bought-for-19-billion.html',
              source: 'HighScalability',
            },
            {
              label: 'Scaling to Millions of Simultaneous Connections (Erlang)',
              url: 'https://www.erlang-factory.com/upload/presentations/558/efsf2012-whatsapp-scaling.pdf',
              source: 'Erlang Factory',
            },
            {
              label: 'WhatsApp Multi-Device Architecture',
              url: 'https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/',
              source: 'Meta Engineering',
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
          body: '1. **A chat system is a routing problem over persistent connections** — the connection tier and session registry are the heart of the design.\n2. **Persist before you ACK** and use **store-and-forward + push** so no accepted message is ever lost, online or offline.\n3. **Order per conversation** with time-based IDs; **client-generated message IDs** turn at-least-once delivery into an exactly-once experience.\n4. **Fan out groups on delivery**, cap group size, and keep **presence lazy** to avoid quadratic cost.\n5. **End-to-end encryption (Signal Protocol)** changes the trust model, not the routing — the server only ever sees ciphertext and metadata.',
        },
      ],
    },
  ],
};

export default content;
