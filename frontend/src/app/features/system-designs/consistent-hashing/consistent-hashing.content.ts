import { DesignContent } from '../../../shared/models';
import { CONSISTENT_HASHING_META } from './consistent-hashing.meta';

const content: DesignContent = {
  meta: CONSISTENT_HASHING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Consistent hashing** places both **keys** and **servers** on a circular **hash ring**. A key is assigned to the **first server clockwise** from its hash. When a node joins or leaves, only keys in that node’s arc **move** (~1/N) — unlike naive `hash(key) % N`, which remaps almost every key when N changes.\n\nPopularized by Amazon’s Dynamo paper; foundational in DynamoDB, Cassandra, ScyllaDB, and many caches. Also see [Distributed Cache — consistent hashing](/designs/distributed-cache#consistent-hashing) and [Sharding Pattern](/designs/sharding-pattern).',
        },
        {
          type: 'table',
          caption: 'Modulo hash vs consistent hashing.',
          headers: ['Approach', 'Add 1 server (N→N+1)', 'Load balance'],
          rows: [
            ['hash(key) % N', '~100% keys remapped', 'Even if hash uniform'],
            ['Consistent hashing', '~1/N keys remapped', 'Uneven arcs without vnodes'],
            [
              'Consistent hashing + vnodes',
              '~1/N keys remapped',
              'Tight distribution across servers',
            ],
          ],
        },
      ],
    },
    {
      id: 'traditional-problem',
      title: 'The Problem with Traditional Hashing',
      blocks: [
        {
          type: 'markdown',
          value:
            'A common load-balancer approach: hash the request key (IP, session ID) and assign with `hash % N`. With five backends (S0–S4), each user sticks to one server — until N changes.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/01-traditional-hashing.png',
          alt: 'Traditional hash-based load balancing across five backend servers',
          caption:
            'Hash the key and take mod N to pick a server. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/02-mod-n-example.png',
          alt: 'Example of mapping user IPs to servers with hash modulo 5',
          caption:
            'Example mappings with mod 5. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '**Add S5** → switch to `mod 6`: most users remapped. **Remove S4** → `mod 4`: again most users remapped. Result: cache stampedes, session loss, and heavy data movement.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/03-add-server-remap.png',
          alt: 'Adding a sixth server forces remapping of most keys under modulo hashing',
          caption:
            'Adding a server remaps almost all keys under modulo hashing. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/04-remove-server-remap.png',
          alt: 'Removing a server forces remapping of most keys under modulo hashing',
          caption:
            'Removing a server has the same remapping problem. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'how-it-works',
      title: 'How Consistent Hashing Works',
      blocks: [
        {
          type: 'markdown',
          value:
            'Map the hash space onto a **ring** (e.g. 0 … 2³²−1). Hash each server onto the ring. Hash each key; walk **clockwise** to the first server — that server owns the key.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/05-hash-ring.png',
          alt: 'Consistent hashing ring with hash space arranged in a circle',
          caption:
            'Constructing the hash ring. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/06-place-servers.png',
          alt: 'Servers placed on the hash ring with keys assigned to the next server clockwise',
          caption:
            'Place servers on the ring; keys go to the next server clockwise. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A **clock face with delivery drivers** at certain hours: each package address hashes to a minute; the **next driver clockwise** takes it. Hire a driver at 3 o’clock — only packages between 2 and 3 change hands.',
        },
      ],
    },
    {
      id: 'add-remove',
      title: 'Adding and Removing Nodes',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Add a server** at its hash position: it takes keys that previously belonged to its clockwise successor but now fall in its new arc — only that slice moves.\n\n**Remove a server**: its keys move to the next clockwise neighbor. Everyone else is untouched.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/07-add-node.png',
          alt: 'Adding a node to the hash ring moves only keys in the affected arc',
          caption:
            'Adding a node remaps ~1/N of keys. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/08-remove-node.png',
          alt: 'Removing a node from the hash ring reassigns its keys to the next server',
          caption:
            'Removing a node reassigns only its arc. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'virtual-nodes',
      title: 'Virtual Nodes',
      blocks: [
        {
          type: 'markdown',
          value:
            'With few physical servers, arcs can be uneven. **Virtual nodes (vnodes)** place each physical server at many ring positions (e.g. hash `serverId#0` … `serverId#N`). Load spreads more evenly; when a node fails, its keys fan out across many successors instead of one neighbor.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/09-virtual-nodes.png',
          alt: 'Virtual nodes placing multiple points per physical server on the ring',
          caption:
            'Each physical server maps to many vnodes. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/10-vnodes-load.png',
          alt: 'Virtual nodes improving load distribution across physical servers',
          caption:
            'Vnodes smooth load when cluster size is small. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Production note',
          body: 'Cassandra/Dynamo-style systems tune vnode count. Redis Cluster uses **16,384 fixed hash slots** instead — same minimal-movement idea, different mechanism.',
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
            ['Redis Cluster', '16,384 hash slots via CRC16 — slot migration on scale'],
            ['Apache Cassandra', 'Murmur3 partitioner ring; vnodes; token-aware routing'],
            ['Memcached clients', 'Ketama consistent hash in the client library'],
            ['CDN / caches', 'Edge or cache key→node with minimal remap on deploy'],
            ['Load balancers', 'Maglev and ring variants for sticky routing'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Java Implementation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Use a **`NavigableMap` / `TreeMap`** of ring position → physical server. Lookup: hash the key, take `ceilingEntry` (or wrap to `firstEntry`). Add vnodes by hashing `serverId + "#" + i`.',
        },
        {
          type: 'image',
          src: 'assets/article-images/consistent-hashing/11-implementation.png',
          alt: 'Structure of a consistent hashing implementation with ring and virtual nodes',
          caption: 'Ring + vnode structure. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ConsistentHashRing.java',
          showLineNumbers: true,
          code: `public final class ConsistentHashRing {
  private final NavigableMap<Long, String> ring = new TreeMap<>();
  private final int vnodes;

  public ConsistentHashRing(int vnodesPerServer) {
    this.vnodes = vnodesPerServer;
  }

  public void addServer(String serverId) {
    for (int i = 0; i < vnodes; i++) {
      ring.put(hash(serverId + "#" + i), serverId);
    }
  }

  public void removeServer(String serverId) {
    for (int i = 0; i < vnodes; i++) {
      ring.remove(hash(serverId + "#" + i));
    }
  }

  public String getServer(String key) {
    if (ring.isEmpty()) throw new IllegalStateException("no servers");
    Long h = hash(key);
    Map.Entry<Long, String> e = ring.ceilingEntry(h);
    return (e != null ? e : ring.firstEntry()).getValue();
  }

  private static long hash(String s) {
    // Guava Murmur3 (or MessageDigest MD5 for demos)
    return Hashing.murmur3_128().hashString(s, StandardCharsets.UTF_8).asLong();
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Ownership ≠ replication',
          body: 'The ring assigns **who owns a key**. Production systems still set a **replication factor** (clockwise successors hold copies), plus gossip/membership for live topology.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Minimal key movement when cluster size changes',
            'Clients can compute the owner locally',
            'Foundation for sharding routers at scale',
          ],
          cons: [
            'Load skew without vnodes',
            'Membership metadata must stay consistent',
            'Does not fix hot keys or cross-key transactions alone',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Diagrams and walkthrough summarized from Ashish Pratap Singh’s AlgoMaster article “Consistent Hashing Explained,” with a Java `TreeMap` ring sketch for this platform.',
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
              question: 'Explain consistent hashing.',
              answer:
                'Keys and servers sit on a **hash ring**. Key maps to **first server clockwise**. Adding/removing a server only remaps keys in that server’s arc (~**1/N**), not the entire keyspace.',
            },
            {
              question: 'Why virtual nodes?',
              answer:
                'Each physical server gets **multiple ring positions**. Spreads keys evenly with few servers and fans failed keys across many successors.',
            },
            {
              question: 'Consistent hashing vs modulo sharding?',
              answer:
                '**Modulo** remaps ~all keys when N changes. **Consistent hashing** remaps ~**1/N** — essential for live expansion without cache stampedes.',
            },
            {
              question: 'How does Redis Cluster use it?',
              answer:
                '**16,384 fixed hash slots**; `CRC16(key) mod 16384`. Adding a node **migrates slots** — same minimal-movement idea, different mechanism.',
            },
            {
              question: 'What is Rendezvous (HRW) hashing?',
              answer:
                'Score every node with `hash(key + node)` and pick the highest — no ring. Remaps ~1/N on membership change; simpler for weighted nodes.',
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
          body: '1. Consistent hashing uses a **hash ring** for **minimal remapping** when nodes change.\n2. **Virtual nodes** balance load across physical servers.\n3. Powers **Redis Cluster**, **Cassandra**, CDNs, and **Sharding Pattern** routers.\n4. Pair with **replication** and membership gossip for production durability.',
        },
      ],
    },
  ],
};

export default content;
