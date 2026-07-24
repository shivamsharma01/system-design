import { DesignContent } from '../../../shared/models';
import { LONG_POLLING_WEBSOCKETS_META } from './long-polling-websockets.meta';

const content: DesignContent = {
  meta: LONG_POLLING_WEBSOCKETS_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Live chat, games, and tickers feel instant because the **server can notify the client** when something changes. Classic HTTP is **request–response**: the client must ask every time, then the connection closes. **Long polling** and **WebSockets** are two common ways to approximate or achieve real-time push.\n\nThis page is about **HTTP client↔server** real-time delivery — not broker **long poll** (SQS `WaitTimeSeconds`). For queue pull loops see [Polling Consumer](/designs/polling-consumer).',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Quick distinction',
          body: '**Short poll** — client asks on a timer, often gets empty answers. **Long poll** — client asks and the server *holds* the HTTP request until data or timeout, then the client immediately asks again. **WebSocket** — one upgraded TCP connection stays open; either side can send anytime (full duplex).',
        },
      ],
    },
    {
      id: 'why-http-falls-short',
      title: 'Why traditional HTTP is not enough',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/long-polling-websockets/01-traditional-http.png',
          alt: 'Sequence diagram of traditional HTTP: request, response, connection closed, then later a new request',
          caption:
            'Stateless HTTP: each exchange opens work, returns a response, and closes. The server cannot push between requests. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            'Limitations for real-time features:\n\n- **No automatic updates** — the server cannot initiate a message; the client must poll.\n- **Stateless connections** — each request stands alone; continuous dialogue needs extra protocol machinery.\n\nChat, collaborative docs, multiplayer state, and financial tickers need a path for the server to talk first.',
        },
      ],
    },
    {
      id: 'long-polling',
      title: 'Long polling',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Long polling** improves short polling. Instead of “ask every second and often get nothing,” the client sends a request and the server **holds it open** until there is new data or a timeout. When the response returns (data or empty), the client **immediately** opens the next long poll.\n\n### Flow\n\n1. Client sends a request expecting updates.\n2. Server holds the request.\n   - New data → respond immediately.\n   - Timeout with no data → respond with empty/minimal payload.\n3. Client receives the response and immediately starts a new long poll.',
        },
        {
          type: 'image',
          src: 'assets/article-images/long-polling-websockets/02-long-polling-flow.png',
          alt: 'Long polling sequence: held HTTP request, wait for data, response, connection closed, then new long poll',
          caption:
            'Long poll lifecycle: hold → respond → close → client reopens. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'Long polling',
          pros: [
            'Simple — uses ordinary HTTP libraries',
            'Works through most firewalls and proxies',
            'Easy fallback when WebSockets are blocked',
          ],
          cons: [
            'Extra latency after each update (must re-open HTTP)',
            'Many concurrent hanging requests stress servers and load balancers',
            'Still request/response — not true full duplex on one connection',
          ],
        },
        {
          type: 'markdown',
          value:
            '**Use cases:** simple chat/comments with near-real-time tolerance; infrequent notifications (e.g. “new email”); legacy environments where WebSockets are hard.\n\n**Product example:** Dropbox-style notify-then-pull often uses long-lived HTTP holds — see [Dropbox communication flow](/designs/dropbox#communication-flow).',
        },
        {
          type: 'image',
          src: 'assets/article-images/long-polling-websockets/03-long-polling-js-code.png',
          alt: 'JavaScript long-polling client that fetches /updates then immediately re-runs, with 5s retry on error',
          caption:
            'Client-side long polling loop. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'javascript',
          filename: 'long-polling.js',
          showLineNumbers: true,
          code: `// Client-side long polling
async function fetchUpdates() {
  try {
    const response = await fetch('/updates');
    const data = await response.json();
    console.log('Update:', data);
    fetchUpdates(); // re-run immediately
  } catch (error) {
    setTimeout(fetchUpdates, 5000); // backoff on failure
  }
}

fetchUpdates();`,
        },
      ],
    },
    {
      id: 'websockets',
      title: 'WebSockets',
      blocks: [
        {
          type: 'markdown',
          value:
            '**WebSockets** provide a **full-duplex, persistent** connection. After an HTTP **Upgrade** handshake, both sides can send frames anytime over the same TCP socket without repeating HTTP headers.\n\n### Flow\n\n1. **Handshake** — client sends HTTP with `Upgrade: websocket`.\n2. **Upgrade** — server accepts → protocol switches to `ws://` / `wss://`; TCP stays open.\n3. **Full duplex** — either side pushes messages until close.',
        },
        {
          type: 'image',
          src: 'assets/article-images/long-polling-websockets/04-websocket-flow.png',
          alt: 'WebSocket sequence: handshake, persistent connection, server and client sending data anytime on the same connection',
          caption:
            'One persistent connection after handshake; bidirectional pushes with no new HTTP request per message. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'WebSockets',
          pros: [
            'Ultra-low latency — no per-message HTTP handshake',
            'Lower overhead for frequent messages on one connection',
            'Natural fit for high-frequency bidirectional apps',
          ],
          cons: [
            'More setup: protocol support, proxies, sticky sessions',
            'Some corporate firewalls still interfere',
            'Reconnect, heartbeats, and backpressure need careful design',
            'Large fan-out of idle connections still costs memory/FDs',
          ],
        },
        {
          type: 'markdown',
          value:
            '**Use cases:** Slack/Google Docs-style collaboration; multiplayer games; live sports/finance dashboards.\n\n**Product examples:** [Discord Gateway](/designs/discord#gateway), [WhatsApp connection layer](/designs/whatsapp#high-level-architecture). Gateway proxying tips: [API Gateway WebSockets Q&A](/designs/api-gateway#interview-questions).',
        },
        {
          type: 'image',
          src: 'assets/article-images/long-polling-websockets/05-websocket-js-code.png',
          alt: 'JavaScript WebSocket client and Node.js ws server echo example',
          caption:
            'Minimal browser client and Node `ws` server. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'javascript',
          filename: 'websockets.js',
          showLineNumbers: true,
          code: `// Client-side
const socket = new WebSocket('wss://yourserver.com/ws');

socket.onopen = () => {
  socket.send('Hello Server!');
};

socket.onmessage = (event) => {
  console.log('Update:', event.data);
};

// Server-side (Node.js + ws)
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    ws.send(\`Server received: \${message}\`);
  });
});`,
        },
      ],
    },
    {
      id: 'choosing',
      title: 'Choosing the right solution',
      blocks: [
        {
          type: 'table',
          caption: 'Decision dimensions.',
          headers: ['Dimension', 'Long polling', 'WebSockets'],
          rows: [
            [
              'Complexity / support',
              'Any HTTP stack; no special proxy features',
              'Needs Upgrade support (Nginx/HAProxy); frameworks help',
            ],
            [
              'Scalability',
              'Many hanging HTTP requests; heavier at large fan-out',
              'One connection per client; better for frequent streams',
            ],
            [
              'Interaction style',
              'Infrequent near-real-time updates',
              'High-frequency or true two-way interaction',
            ],
            [
              'Network constraints',
              'Works on strict/old networks',
              'Usually fine today; still watch proxies and idle timeouts',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Rule of thumb',
          body: 'Prefer **WebSockets** for true real-time bidirectional traffic. Prefer **long polling** (or SSE) when updates are infrequent, simplicity matters, or WebSockets are blocked — and always have a fallback story.',
        },
      ],
    },
    {
      id: 'production',
      title: 'Production concerns',
      blocks: [
        {
          type: 'markdown',
          value:
            'Real-time systems fail in the gaps between demos and load:\n\n- **Heartbeats / ping-pong** — detect half-open sockets; tune LB idle timeouts above your ping interval.\n- **Reconnect with backoff + jitter** — avoid thundering herds after outages.\n- **Resume cursors / last-event-id** — clients reconnect without missing or double-applying events.\n- **Auth refresh** — tokens expire while the socket is open; re-auth or rotate without dropping UX.\n- **Sticky / connection-aware LBs** — WebSockets are stateful to a node unless you fan out via pub/sub (Redis, Kafka, NATS).\n- **Fan-out architecture** — connection tier vs business logic; do not put heavy work on the socket process.\n- **Backpressure** — slow clients; bounded send buffers; drop or disconnect rather than OOM.\n- **Ordering** — define per-channel vs global order; do not assume TCP order across reconnects.\n- **Observability** — connection count, message rate, reconnect rate, handshake failures, proxy 4xx/5xx on Upgrade.',
        },
      ],
    },
    {
      id: 'alternatives',
      title: 'Alternatives worth considering',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Server-Sent Events (SSE).** Server pushes over HTTP one way. Simpler than WebSockets when the client rarely sends. Great for news feeds, notifications, and status streams. Not full duplex.\n\n**MQTT.** Lightweight pub/sub common in IoT; QoS levels and small frames for constrained devices.\n\n**Socket.IO (and similar).** Abstraction over WebSockets with automatic long-poll fallback, rooms, and reconnect helpers — useful for browser compatibility when you accept the library’s protocol.',
        },
        {
          type: 'table',
          headers: ['Option', 'Direction', 'Best when'],
          rows: [
            ['SSE', 'Server → client', 'One-way streams over plain HTTP'],
            ['MQTT', 'Pub/sub', 'IoT / constrained bandwidth'],
            ['Socket.IO', 'Bidirectional + fallback', 'Browsers need WS with long-poll backup'],
            ['gRPC streaming', 'Bidirectional streams', 'Service-to-service, strong contracts'],
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'markdown',
          value:
            'Traditional HTTP cannot push. **Long polling** holds requests to fake push with universal HTTP compatibility. **WebSockets** upgrade once and stream bidirectionally with lower per-message cost. Choose based on update frequency, duplex needs, network constraints, and operational readiness — and design reconnect, auth, and fan-out as first-class requirements.',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Summarized and expanded from Ashish Pratap Singh’s AlgoMaster article “Long Polling vs WebSockets” with diagrams adapted for this platform.',
        },
      ],
    },
  ],
};

export default content;
