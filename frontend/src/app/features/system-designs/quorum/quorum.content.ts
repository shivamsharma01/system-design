import { DesignContent } from '../../../shared/models';
import { QUORUM_META } from './quorum.meta';

const content: DesignContent = {
  meta: QUORUM_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'In a replicated distributed store with **N replicas**, the **Quorum Pattern** requires **W nodes** to acknowledge a write and **R nodes** to respond to a read. When **R + W > N**, read and write sets **overlap** — a reader always sees at least one node with the latest written value (under single-writer assumptions). Dynamo, Cassandra, and Riak expose **tunable consistency** via these knobs.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Common configurations',
          body: '**N=3, W=2, R=2** — balanced durability and consistency. **W=1, R=1** — fast, weak consistency (eventual). **W=3, R=1** — strong writes, cheap reads. **R=3** — read-your-writes from all replicas. **Sloppy quorum** writes to any W live nodes plus **hinted handoff** when preferred nodes are down — trades strict quorum for availability.',
        },
        {
          type: 'table',
          caption: 'Consistency vs availability with N=3.',
          headers: ['W', 'R', 'R+W>N?', 'Behavior'],
          rows: [
            ['2', '2', 'Yes', 'Strong overlap — typical production default'],
            ['1', '1', 'No', 'Fastest; stale reads possible'],
            ['3', '1', 'Yes', 'All replicas written before ack; reads may lag one replica'],
            ['1', '3', 'Yes', 'Read from majority; writes may not have reached all'],
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
          body: 'A **committee of three judges** scoring a dive: **N=3** total. A score counts only if **W=2** judges agree on the write. To report the official score, you poll **R=2** judges — because 2+2>3, at least one judge saw the latest marks. Fewer judges (lower W or R) speeds things up but risks outdated scores.',
        },
        {
          type: 'mermaid',
          caption: 'Write quorum and read quorum must overlap when R + W > N.',
          definition: `sequenceDiagram
  participant Client
  participant R1 as Replica 1
  participant R2 as Replica 2
  participant R3 as Replica 3

  Client->>R1: WRITE v=7
  Client->>R2: WRITE v=7
  Note over R1,R2: W=2 acks → write success
  R3-->>R3: replication in flight

  Client->>R2: READ
  Client->>R3: READ
  Note over Client,R3: R=2 responses; overlap guarantees fresh replica in set`,
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
            ['Amazon Dynamo / DynamoDB', 'N=3 default; `W` and `R` tunable per request via consistency params'],
            ['Apache Cassandra', '`ONE`, `QUORUM`, `ALL` consistency levels map to R/W semantics'],
            ['Riak', 'PR/W values per bucket; sloppy quorum with hinted handoff on node failure'],
            ['CockroachDB', 'Raft quorum for consensus — related overlap principle for linearizability'],
            ['Distributed config (etcd)', 'Majority quorum for linearizable writes and leader election'],
            ['Multi-region replication', 'LOCAL_QUORUM in Cassandra — quorum within DC for latency'],
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
            'On write, hash the key to **N preferred replicas** (via **consistent hashing**). Send write to all N; return success after **W acks**. On read, query N nodes in parallel; return latest timestamp (**last-write-wins**) after **R responses**. Use **vector clocks** or **version stamps** when concurrent writes need conflict detection. Expose consistency as a **request parameter** so callers trade latency vs correctness.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'QuorumCoordinator.java',
          code: `public class QuorumCoordinator {
  private final int N = 3;
  private final int W = 2;
  private final int R = 2;
  private final ReplicaRouter router;

  public void write(String key, String value) {
    List<Replica> replicas = router.preferredReplicas(key, N);
    List<CompletableFuture<Ack>> acks = replicas.stream()
        .map(r -> r.writeAsync(key, value, Instant.now()))
        .toList();
    long success = acks.stream()
        .map(CompletableFuture::join)
        .filter(Ack::ok)
        .count();
    if (success < W) {
      throw new QuorumWriteException("only " + success + " of " + W + " acks");
    }
  }

  public String read(String key) {
    List<Replica> replicas = router.preferredReplicas(key, N);
    List<CompletableFuture<VersionedValue>> reads = replicas.stream()
        .map(r -> r.readAsync(key))
        .toList();
    return reads.stream()
        .map(CompletableFuture::join)
        .sorted(Comparator.comparing(VersionedValue::timestamp).reversed())
        .limit(R)
        .map(VersionedValue::value)
        .findFirst()
        .orElseThrow();
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Sloppy quorum risks',
          body: 'When fewer than W preferred nodes are up, **sloppy quorum** writes to substitute nodes with **hints** to forward later. Improves **availability** but temporarily breaks strict **R+W>N** overlap — design read repair and anti-entropy to heal.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Tunable consistency per request — latency vs correctness knob.',
            'Survives node failures when W or R ≤ available replicas.',
            'Foundational to Dynamo-family **AP** systems with eventual consistency.',
          ],
          cons: [
            'R+W>N does not guarantee linearizability under concurrent writers.',
            'Higher W or R increases latency and failure sensitivity.',
            'Sloppy quorum and hinted handoff add healing complexity.',
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
              question: 'What is the quorum formula R + W > N?',
              answer:
                'With **N replicas**, requiring **W write acks** and **R read responses** where **R+W>N** ensures read and write replica sets **overlap**, so reads see a node that participated in the latest successful write.',
            },
            {
              question: 'Consistency vs availability trade-off?',
              answer:
                'Higher **W** and **R** → stronger consistency, more latency, more failures on node loss. Lower values → higher **availability** and speed, risk of **stale reads**. CAP: partition tolerance forces this choice.',
            },
            {
              question: 'What is sloppy quorum?',
              answer:
                'When preferred W nodes are unavailable, write to **any W live nodes** with **hints** to deliver to correct owners later. Maintains writes during partitions at cost of temporary consistency guarantees.',
            },
            {
              question: 'Quorum vs Raft consensus?',
              answer:
                '**Raft** uses majority quorum for **strong consistency** and leader serialization. **Dynamo quorum** is **per-key**, tunable, and allows **eventual consistency** — different design point on CAP spectrum.',
            },
            {
              question: 'How does Cassandra map consistency levels?',
              answer:
                '**ONE** = R or W of 1. **QUORUM** = majority of replicas. **ALL** = N. **LOCAL_QUORUM** = quorum in local datacenter. Per-query override on read and write.',
            },
            {
              question: 'Design replicated user session store.',
              answer:
                'N=3, W=2, R=1 for fast reads with acceptable staleness on session flags. **Consistent hashing** picks replicas. Sloppy quorum + hinted handoff on node failure. Background **read repair** fixes drift. Client passes consistency override for security-sensitive reads.',
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
          body: '1. **R + W > N** guarantees overlapping read/write replica sets in Dynamo-style stores.\n2. Tune **W and R** per request to balance **consistency vs availability**.\n3. **Sloppy quorum** and **hinted handoff** extend availability at consistency cost.\n4. Combine with **consistent hashing** for replica placement and **gossip** for membership.',
        },
      ],
    },
  ],
};

export default content;
