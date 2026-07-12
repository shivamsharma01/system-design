import{a as e}from"./chunk-EARVWDWP.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Back-of-envelope estimation** turns vague scale (\u201Cmillions of users\u201D) into **QPS, storage, and bandwidth** numbers you can design against. Interviewers care less about perfect accuracy and more that you **state assumptions**, use **powers of two**, round to **nice numbers**, and apply a **peak = 2\u20135\xD7 average** multiplier. These estimates drive sharding, caching, and whether a single database is even plausible."},{type:"callout",variant:"tip",title:"Interview rhythm",body:"1) Clarify DAU / write vs read ratio. 2) Convert to **avg QPS**, then **peak**. 3) Estimate **storage** growth per year. 4) Check **bandwidth** for media. 5) Say what the numbers imply (\u201C~5K QPS \u2192 one Redis shard is fine; 500K QPS \u2192 fan-out design\u201D)."},{type:"table",caption:"Powers of 2 every engineer should know.",headers:["Power","Approx value","Handy for"],rows:[["2\xB9\u2070","\u2248 10\xB3 (1 thousand)","Quick \u201Cthousand\u201D swaps"],["2\xB2\u2070","\u2248 10\u2076 (1 million)","1 MiB \u2248 10\u2076 bytes"],["2\xB3\u2070","\u2248 10\u2079 (1 billion)","1 GiB"],["2\u2074\u2070","\u2248 10\xB9\xB2 (1 trillion)","1 TiB"],["Day seconds","\u2248 10\u2075 (86400)","QPS = daily ops / 10\u2075"]]}]},{id:"latency-numbers",title:"Latency numbers to know",blocks:[{type:"table",caption:"Order-of-magnitude latencies (approximate).",headers:["Operation","Latency","Implication"],rows:[["L1 cache reference","~1 ns","CPU-local"],["L2 cache reference","~4 ns","Still in-core"],["Mutex lock/unlock","~25 ns",""],["Main memory reference","~100 ns","RAM is ~100\xD7 L1"],["Compress 1 KB with Zippy","~2 \xB5s",""],["Send 2 KB over 1 Gbps network","~20 \xB5s",""],["SSD random read","~16\u2013150 \xB5s","Orders faster than disk"],["Round trip same datacenter","~0.5 ms","Intra-DC RTT"],["Disk seek (HDD)","~10 ms","Avoid random HDD I/O"],["Round trip CA \u2192 Netherlands","~150 ms","WAN dominates"]]},{type:"callout",variant:"info",title:"Use latencies as intuition, not trivia",body:"If each request does **10 sequential disk seeks**, you are already at ~100 ms before business logic. Prefer **batching**, **sequential I/O**, **SSD**, or **cache**. Cross-region sync will never feel like a local Redis `GET`."}]},{id:"formulas",title:"Core formulas",blocks:[{type:"markdown",value:`**QPS from DAU**

- Daily actions \u2248 \`DAU \xD7 actions_per_user_per_day\`
- Average QPS \u2248 \`daily_actions / 86_400\` \u2248 \`daily_actions / 10\u2075\`
- Peak QPS \u2248 \`avg \xD7 2..5\` (sometimes higher for flash sales)

**Storage**

- \`rows \xD7 bytes_per_row \xD7 replication_factor\` (+ indexes \u2248 +20\u201350%)
- Growth: multiply by years retained or daily write rate \xD7 retention

**Bandwidth**

- \`concurrent_users \xD7 bitrate\` (video/audio)
- Or \`QPS \xD7 response_size\` for APIs

**Connections (chat)**

- Concurrent \u2248 \`DAU \xD7 fraction_online\` \u2014 drives gateway fan-out and sticky sessions.`},{type:"mermaid",caption:"Estimation flow in an interview.",definition:`flowchart LR
  A[DAU / RPS ask] --> B[Avg QPS]
  B --> C[Peak QPS]
  C --> D[Shards / caches]
  A --> E[Bytes per write]
  E --> F[Storage / year]
  A --> G[Payload size]
  G --> H[Bandwidth]`}]},{id:"worked-examples",title:"Worked mini examples",blocks:[{type:"markdown",value:`**1) URL shortener \u2014 write QPS**

Assume **100M DAU**, each creates **0.1** short links/day \u2192 **10M writes/day**.

Avg write QPS \u2248 \`10\u2077 / 10\u2075\` = **100 QPS**. Peak \u2248 **300\u2013500 QPS**. Reads often **10\u2013100\xD7** writes \u2192 design for **1K\u201310K read QPS** with caching.

Storage: 10M new rows/day \xD7 ~100 B \u2248 **1 GB/day** raw \u2248 **~365 GB/year** before indexes/replicas.

**2) Chat \u2014 concurrent connections**

**50M DAU**, **10%** online at peak \u2192 **5M** concurrent WebSockets. If each gateway holds **500K** connections \u2192 **\u2265 10** gateway machines (plus headroom). Message fan-out for group chat dominates CPU/bandwidth more than raw connection count.

**3) Video bitrate**

**1M** concurrent HD streams at **5 Mbps** \u2192 \`10\u2076 \xD7 5\xD710\u2076\` = **5 Tbps** egress \u2014 CDN is mandatory, origin alone cannot serve it.`},{type:"table",caption:"Quick sanity checks.",headers:["If you get\u2026","Ask yourself\u2026"],rows:[["Avg QPS > 100K from modest DAU","Did you forget /86400?"],["Storage < 1 GB/year at huge write rate","Bytes per row too small?"],["Single DB handles 50K write QPS","Unrealistic without sharding/batching"],["Peak = avg","Forgot traffic spikes?"]]}]},{id:"tips",title:"Estimation tips",blocks:[{type:"callout",variant:"warning",title:"Common pitfalls",body:"Silent assumptions (\u201Ceveryone online 24/7\u201D), mixing **MB vs MiB**, ignoring **replication** and **indexes**, and optimizing microservices before proving **one Postgres** cannot hold the write rate."},{type:"markdown",value:`- **State assumptions out loud** (\u201Cassuming 5 reads per write\u201D).
- **Round aggressively**: 86,400 \u2192 10\u2075; 2.7K QPS \u2192 ~3K.
- **Peak = 2\u20135\xD7 avg** unless the prompt gives a spike profile.
- Separate **read QPS** and **write QPS** \u2014 caches change reads, not durable writes.
- Translate numbers into **architecture decisions**, not just arithmetic.`}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"How do you convert DAU to QPS?",answer:"Estimate actions per user per day, multiply by DAU for daily volume, divide by **~86,400** (\u224810\u2075) for average QPS, then multiply by **2\u20135\xD7** for peak."},{question:"Why memorize latency numbers?",answer:"They tell you what is **impossible** in a request path (e.g. many HDD seeks, cross-Atlantic sync) and justify caches, batching, and async design."},{question:"Estimate storage for a Twitter-like timeline.",answer:"Tweets/day \xD7 average size \xD7 retention \xD7 replicas. Example: 500M tweets/day \xD7 300 B \u2248 150 GB/day \u2248 **~55 TB/year** raw; indexes and media metadata add more; media blobs dominate separately."},{question:"What is a \u201Cnice number\u201D strategy?",answer:"Prefer **10, 100, 1K, 1M** scales so mental math stays accurate. Interviewers expect order-of-magnitude correctness, not three decimal places."},{question:"How many machines for 100K QPS?",answer:"Depends on work per request. If one app instance does **2K QPS**, need **~50** instances at avg, **100\u2013250** at peak, plus DB/cache tiers sized on their own QPS and connections."},{question:"Bandwidth vs QPS?",answer:"QPS counts requests; bandwidth is `QPS \xD7 payload` or `users \xD7 bitrate`. A low-QPS video product can still need **Tbps** egress."},{question:"Give URL shortener read/write estimate.",answer:"Writes often hundreds of QPS; reads **orders of magnitude higher**. Cache hot redirects in CDN/edge so origin read QPS collapses."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Know **powers of 2** and rough **latency** orders.
2. **QPS \u2248 daily_ops / 10\u2075**; **peak \u2248 2\u20135\xD7 avg**.
3. Storage = **rows \xD7 size \xD7 RF**; bandwidth = **users \xD7 bitrate** or **QPS \xD7 size**.
4. Work examples: URL shortener QPS, chat connections, video egress.
5. State assumptions, round nicely, turn numbers into design choices.`}]}]},n=t;export{n as default};
