import{a as e}from"./chunk-ON7T6YZK.js";import"./chunk-IFGU66OU.js";var s={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Consistent hashing** places both **keys** and **servers** on a circular **hash ring** (0 to 2\xB3\xB2\u22121). A key is assigned to the **first server clockwise** from its hash position. When a node joins or leaves, only keys between that node and its predecessor **move** \u2014 unlike naive `hash(key) % N`, which remaps almost every key when N changes."},{type:"callout",variant:"info",title:"Virtual nodes (vnodes)",body:"Each physical server is mapped to **many points** on the ring (e.g. 100\u2013256 vnodes). This **smooths load** when node counts are small and prevents one heavy server from owning a large arc. Redis Cluster, Cassandra, and Dynamo variants all rely on vnode tuning."},{type:"table",caption:"Modulo hash vs consistent hashing.",headers:["Approach","Add 1 server (N\u2192N+1)","Load balance"],rows:[["hash(key) % N","~100% keys remapped","Even if hash uniform"],["Consistent hashing","~1/N keys remapped","Uneven arcs without vnodes"],["Consistent hashing + vnodes","~1/N keys remapped","Tight distribution across servers"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **clock face with delivery drivers stationed at hours**: each package address hashes to a minute on the dial; the **next driver clockwise** handles it. Hire a new driver at 3 o\u2019clock \u2014 only packages between 2 and 3 o\u2019clock change hands. Everyone else keeps their assigned driver."},{type:"mermaid",caption:"Keys map to the first vnode clockwise on the ring.",definition:`flowchart LR
  subgraph ring["Hash Ring"]
    K1[key: user:42]
    N1[vnode A1]
    N2[vnode B1]
    N3[vnode C1]
    K1 -->|clockwise| N2
  end
  N2 --> S2[Server B]
  N1 --> S1[Server A]
  N3 --> S3[Server C]
  Note1[Add Server D \u2192 only keys between D and predecessor move]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Redis Cluster","16,384 hash slots mapped to nodes via CRC16 \u2014 cluster slot migration"],["Apache Cassandra","Murmur3 partitioner ring; vnodes per node; token-aware routing"],["Memcached clients","Ketama consistent hash in client library for server selection"],["CDN edge routing","Akamai maps content keys to edge servers with minimal remap on deploy"],["Distributed caches","Dynamo-style consistent hashing for key\u2192node assignment"],["Load balancers","Maglev and ring variants for connection stickiness with minimal disruption"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Build a **sorted map** of ring position \u2192 physical node. On lookup, hash the key, binary-search the **ceiling entry** (wrap to first if past end). Add **virtual nodes** by hashing `physicalId + i` for i in 0..vnodeCount\u22121. When a node departs, **replicate** its vnode ranges to successors before removal. Pair with **gossip** or **coordination service** for membership updates."},{type:"code",language:"java",filename:"ConsistentHashRing.java",code:`public class ConsistentHashRing {
  private final SortedMap<Long, String> ring = new TreeMap<>();
  private final int virtualNodesPerServer;

  public ConsistentHashRing(int virtualNodesPerServer) {
    this.virtualNodesPerServer = virtualNodesPerServer;
  }

  public void addServer(String serverId) {
    for (int i = 0; i < virtualNodesPerServer; i++) {
      long hash = hash(serverId + "#" + i);
      ring.put(hash, serverId);
    }
  }

  public String getServer(String key) {
    if (ring.isEmpty()) throw new IllegalStateException("no servers");
    long keyHash = hash(key);
    SortedMap<Long, String> tail = ring.tailMap(keyHash);
    long vnode = tail.isEmpty() ? ring.firstKey() : tail.firstKey();
    return ring.get(vnode);
  }

  private long hash(String input) {
    return Hashing.murmur3_128().hashString(input, StandardCharsets.UTF_8).asLong();
  }
}`},{type:"callout",variant:"warning",title:"Node failure and replication",body:"Consistent hashing assigns **ownership** \u2014 it does not replicate data. Production systems set **replication factor** (successor nodes on ring hold copies). On failure, **hinted handoff** or **read repair** maintains durability \u2014 see **Quorum Pattern**."},{type:"prosCons",title:"Trade-offs",pros:["Minimal key movement when cluster size changes \u2014 critical for live resharding.","Decentralized routing \u2014 clients or gateways can compute node locally.","Foundation for **Sharding Pattern** routing at scale."],cons:["Without vnodes, load skew across heterogeneous servers.","Ring metadata must stay consistent \u2014 membership changes need care.","Does not solve cross-key transactions or hot-key overload alone."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain consistent hashing.",answer:"Keys and servers sit on a **hash ring**. Key maps to **first server clockwise**. Adding/removing a server only remaps keys in that server\u2019s arc (~**1/N**), not the entire keyspace."},{question:"Why virtual nodes?",answer:"Each physical server gets **multiple ring positions** (vnodes). Spreads keys more evenly, especially with few servers, and avoids one node owning a disproportionate arc."},{question:"Consistent hashing vs modulo sharding?",answer:"**Modulo** (`hash % N`) remaps ~all keys when N changes. **Consistent hashing** remaps ~**1/N** \u2014 essential for rolling cluster expansion without cache stampedes."},{question:"How does Redis Cluster use it?",answer:"**16,384 hash slots** on a ring; each master owns slot ranges. `CRC16(key) mod 16384` picks slot. Adding node **migrates slots** incrementally \u2014 same minimal-movement principle."},{question:"What happens when a node crashes?",answer:"Keys owned by failed node should be served by **replicas** (successors on ring). Cluster gossip updates membership. **Hinted handoff** and **quorum reads** maintain availability during transition."},{question:"Design a distributed cache with 10 servers.",answer:"Client-side Ketama ring with **150 vnodes/server**. `get(key)` hashes to owning server. On add: migrate only affected key ranges in background. Replication factor 2 to clockwise successors. Monitor per-node key count."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Consistent hashing uses a **hash ring** for **minimal remapping** when nodes change.
2. **Virtual nodes** balance load across physical servers.
3. Powers **Redis Cluster**, **Cassandra**, CDNs, and **Sharding Pattern** routers.
4. Pair with **replication**, **quorum**, and **gossip** for production durability.`}]}]},a=s;export{a as default};
