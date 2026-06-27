import { DesignContent } from '../../../shared/models';
import { WHATSAPP_META } from './whatsapp.meta';

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
            'WhatsApp is a real-time messaging app delivering **100B+ messages/day** with end-to-end encryption, delivery receipts, presence ("online"/"last seen"), and group chats — famously run by a tiny engineering team thanks to Erlang/OTP and aggressive simplicity.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core challenge',
          body: 'Maintain **hundreds of millions of persistent connections** and route messages between online/offline users with low latency, ordering guarantees, and delivery semantics.',
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
            '1:1 messaging with delivery + read receipts (✓, ✓✓, blue ✓✓).',
            'Group messaging (fan-out to members).',
            'Online / last-seen presence.',
            'Offline delivery (store-and-forward).',
            'Media (images, video, voice) sharing.',
            'End-to-end encryption.',
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
            'Low end-to-end latency (sub-second delivery when both online).',
            'High availability of the messaging path.',
            'Message durability — never lose an accepted message.',
            'Ordering within a conversation.',
          ],
          cons: [
            'Global total ordering across conversations is unnecessary.',
            'Presence can be best-effort / eventually consistent.',
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
            { label: 'Daily active users', value: '~2B', hint: 'connections' },
            { label: 'Messages / day', value: '100B+', hint: 'avg' },
            { label: 'Messages / sec (avg)', value: '~1.2M', hint: '100B / 86400' },
            { label: 'Conns / server', value: '~1M+', hint: 'tuned Erlang nodes' },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Connection math',
          body: 'With ~2B devices and ~1M connections per tuned server, you need on the order of a few thousand connection servers — plus headroom for failover and uneven load.',
        },
      ],
    },
    {
      id: 'high-level-architecture',
      title: 'High-Level Architecture',
      blocks: [
        {
          type: 'mermaid',
          caption: 'Persistent connections, message routing, and storage.',
          definition: `flowchart TD
  A["Client A"] <-->|WebSocket| GW1["Connection Server 1"]
  B["Client B"] <-->|WebSocket| GW2["Connection Server 2"]
  GW1 --> Router["Message Router"]
  GW2 --> Router
  Router --> Session[("Session Registry: user→server")]
  Router --> Queue[("Per-user Inbox / Kafka")]
  Router --> Store[("Message Store: Cassandra")]
  Router --> Push["Push (APNs / FCM) if offline"]`,
        },
        {
          type: 'architectureCard',
          title: 'Connection Server (gateway)',
          description:
            'Holds the long-lived WebSocket/MQTT connection for each online client. Maintains a mapping of user → which connection server holds them, so the router knows where to deliver.',
          icon: 'server',
          tags: ['websocket', 'stateful', 'presence'],
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
            'Messaging uses a **persistent bidirectional connection** (WebSocket or a custom MQTT-like protocol) rather than request/response REST. REST is used for auth, contact sync, and media upload URLs.',
        },
        {
          type: 'apiTable',
          endpoints: [
            {
              method: 'POST',
              path: '/v1/auth/register',
              description: 'Register device, exchange keys',
            },
            {
              method: 'GET',
              path: '/v1/media/upload-url',
              description: 'Pre-signed URL for media upload',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/contacts/sync',
              description: 'Find which contacts use the app',
              auth: true,
            },
          ],
        },
        {
          type: 'code',
          language: 'json',
          filename: 'ws-message-frame.json',
          code: `{
  "type": "MESSAGE",
  "id": "msg_01H...",          // client-generated, for idempotency + receipts
  "to": "user_456",
  "convId": "conv_123",
  "ciphertext": "base64...",   // E2E encrypted payload
  "timestamp": 1735689600000
}`,
        },
      ],
    },
    {
      id: 'communication-flow',
      title: 'Message Delivery Flow',
      blocks: [
        {
          type: 'mermaid',
          caption: 'Sending a 1:1 message (recipient online).',
          definition: `sequenceDiagram
  participant A as Sender
  participant GA as Conn Server A
  participant R as Router
  participant GB as Conn Server B
  participant B as Recipient
  A->>GA: MESSAGE (encrypted)
  GA->>R: route(to=B)
  R->>R: persist to store
  R-->>GA: ack (✓ sent)
  R->>GB: deliver
  GB->>B: MESSAGE
  B-->>GB: delivered receipt
  GB->>R: receipt
  R->>GA: ✓✓ delivered
  GA->>A: update ticks`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Offline recipients',
          body: 'If the recipient is offline, the message is stored in their inbox and a **push notification** (APNs/FCM) is sent. On reconnect, the client pulls undelivered messages, then the server deletes them (store-and-forward).',
        },
      ],
    },
    {
      id: 'database-design',
      title: 'Data Model',
      blocks: [
        {
          type: 'code',
          language: 'sql',
          filename: 'messages.cql',
          highlightLines: [4],
          code: `-- Messages clustered by time within a conversation for ordered reads.
CREATE TABLE messages (
  conv_id    uuid,
  msg_id     timeuuid,
  sender_id  uuid,
  ciphertext blob,
  PRIMARY KEY ((conv_id), msg_id)
) WITH CLUSTERING ORDER BY (msg_id DESC);

-- Per-user inbox of yet-to-be-delivered messages.
CREATE TABLE inbox (
  user_id uuid,
  msg_id  timeuuid,
  conv_id uuid,
  PRIMARY KEY ((user_id), msg_id)
);`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Ordering via timeuuid',
          body: 'Using a time-based UUID (`timeuuid`) as the clustering key gives per-conversation ordering and uniqueness without a global sequence.',
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
            "Group messages are **fanned out** to each member: the router looks up each member's connection server (or inbox) and delivers. Very large groups are capped (e.g. ~1024 members) precisely because fan-out cost grows linearly.",
        },
        {
          type: 'bestPractices',
          practices: [
            '**Fan-out on delivery**: persist once, deliver to each online member; queue for offline ones.',
            '**Presence** is propagated as lightweight events; subscribe only to contacts you can see.',
            '**Shard** the session registry and message store by user/conversation id.',
            '**Backpressure**: connection servers shed load gracefully under spikes.',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Presence is expensive',
          body: 'Naively broadcasting every presence change to all contacts is O(N²) chatter. WhatsApp limits presence visibility and updates lazily to keep it cheap.',
        },
      ],
    },
    {
      id: 'consistency',
      title: 'Encryption & Consistency',
      blocks: [
        {
          type: 'markdown',
          value:
            'WhatsApp uses the **Signal Protocol** for end-to-end encryption: the server only ever sees ciphertext. Keys are exchanged via the Double Ratchet algorithm, giving forward secrecy. Servers route and store encrypted blobs but cannot read them.',
        },
        {
          type: 'expandable',
          title: 'What does the server actually see?',
          blocks: [
            {
              type: 'markdown',
              value:
                'Metadata (who messaged whom, when, sizes) and **ciphertext** — never plaintext content. This is why E2E encryption changes the trust model but not the routing architecture.',
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
          headers: ['Decision', 'Gain', 'Cost'],
          rows: [
            [
              'Persistent connections',
              'Real-time, low latency',
              'Stateful servers, connection mgmt',
            ],
            ['Store-and-forward', 'Reliable offline delivery', 'Storage + delivery bookkeeping'],
            ['Fan-out on delivery', 'Simple, fresh', 'Linear cost for large groups'],
            ['E2E encryption', 'Privacy', 'No server-side search/features on content'],
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
              question: 'How do you deliver a message to an offline user?',
              answer:
                "Store-and-forward: persist the message to the recipient's inbox and send a push notification. When they reconnect, the client fetches undelivered messages and acks; the server then marks/deletes them.",
            },
            {
              question: 'How does the router know which server holds a user?',
              answer:
                'A session registry (e.g. Redis/Cassandra) maps `user_id → connection_server`. On connect/disconnect the connection server updates this mapping; the router looks it up to route messages.',
            },
            {
              question: 'How are the ticks (sent / delivered / read) implemented?',
              answer:
                'Each is an acknowledgement at a different stage: server-accepted (✓), delivered to recipient device (✓✓), and read receipt emitted by the recipient (blue ✓✓). Client-generated message IDs tie receipts back to the original message.',
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
              label: 'WhatsApp Encryption Overview',
              url: 'https://www.whatsapp.com/security/',
              source: 'WhatsApp',
            },
            { label: 'Signal Protocol', url: 'https://signal.org/docs/', source: 'Signal' },
            {
              label: 'The WhatsApp Architecture (high scalability)',
              url: 'http://highscalability.com/',
              source: 'HighScalability',
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
          body: 'Hold **persistent connections** on stateful gateways, route via a **session registry**, and use **store-and-forward** for offline delivery. Order messages per-conversation with time-based IDs, fan out group messages on delivery, keep **presence cheap**, and rely on the **Signal Protocol** for end-to-end encryption.',
        },
      ],
    },
  ],
};

export default content;
