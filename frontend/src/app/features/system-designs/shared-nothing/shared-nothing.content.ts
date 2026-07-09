import { DesignContent } from '../../../shared/models';
import { SHARED_NOTHING_META } from './shared-nothing.meta';

const content: DesignContent = {
  meta: SHARED_NOTHING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Shared Nothing** is an architecture where each node is **fully independent** — no shared memory, disk, or single point of contention. Scale by **adding nodes**; work is **partitioned** so nodes communicate only via **network messages**. Contrast with **shared-disk** clusters where all nodes fight over the same storage subsystem.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Scale-out mantra',
          body: '“Share nothing, scale horizontally.” Each node owns its CPU, RAM, and local or partitioned storage. Failure of one node affects only its partition — others continue.',
        },
        {
          type: 'table',
          caption: 'Architecture comparison.',
          headers: ['Model', 'Scaling', 'Bottleneck'],
          rows: [
            ['Shared Nothing', 'Add nodes; partition data/work', 'Cross-partition queries, rebalancing'],
            ['Shared Disk', 'Add nodes reading same SAN/NAS', 'Disk I/O and lock contention'],
            ['Shared Memory', 'Add CPUs to symmetric multiprocessor', 'Memory bus, cache coherence'],
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
          body: 'A **fleet of food trucks** (shared nothing) vs a **single kitchen with one serving window** (shared resource). Each truck has its own ingredients and grill — add trucks to serve more neighborhoods. A shared kitchen scales only until the stove and cashier become the bottleneck.',
        },
        {
          type: 'mermaid',
          caption: 'Independent nodes with partitioned data — no shared storage.',
          definition: `flowchart TB
  LB["Load balancer / coordinator"]
  N1["Node 1\\npartition A\\nlocal SSD"]
  N2["Node 2\\npartition B\\nlocal SSD"]
  N3["Node 3\\npartition C\\nlocal SSD"]

  LB --> N1
  LB --> N2
  LB --> N3
  N1 -.->|"async replication only"| N2
  N2 -.->|"gossip / quorum"| N3

  subgraph noShared["No shared disk or RAM"]
    N1
    N2
    N3
  end`,
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
            ['E-commerce checkout', 'Cassandra order store — each node owns token ranges; scale catalog traffic by adding nodes'],
            ['Food delivery', 'Dispatch shards riders by geohash partition; each region node is self-contained'],
            ['Payments', 'DynamoDB-style ledger partitions by merchant_id — no shared RDBMS lock on hot accounts'],
            ['Netflix-style microservices', 'Thousands of stateless API instances + Cassandra clusters — classic shared-nothing tiers'],
            ['Legacy modernization', 'Replace shared Oracle RAC with sharded Postgres/Cockroach — eliminate shared-disk contention'],
            ['Stream processing', 'Kafka partitions spread across brokers; consumers in independent consumer groups'],
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
            'Choose a **partition key** that spreads load evenly. Design for **node failure** — replication factor ≥ 3, quorum reads/writes. Avoid **cross-partition transactions** where possible. **Rebalance** when adding nodes (consistent hashing eases this). Stateless app tiers are trivially shared-nothing; stateful tiers need explicit sharding.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SharedNothingPartitionRouter.java',
          code: `public class OrderPartitionRouter {
  private final List<NodeEndpoint> nodes;
  private final int partitionCount = 256;

  public NodeEndpoint route(OrderId orderId) {
    int partition = Math.floorMod(orderId.hashCode(), partitionCount);
    int nodeIndex = partition / (partitionCount / nodes.size());
    return nodes.get(nodeIndex);
  }

  public void writeOrder(Order order) {
    NodeEndpoint primary = route(order.id());
    // Write only to owning node — no shared DB
    primary.execute("INSERT INTO orders ...", order);
    // Async replication to RF-1 replicas on other nodes
    replicateAsync(order, replicationTargets(primary));
  }
}`,
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'cassandra-shared-nothing.yaml',
          code: `# Cassandra — canonical shared-nothing datastore
cluster_name: payments_cluster
num_tokens: 256
endpoint_snitch: GossipingPropertyFileSnitch

# Each node owns token ranges — no shared disk
nodes:
  - rack: dc1-rack1
    seeds: false
    data_dirs:
      - /mnt/local-ssd/cassandra   # local disk per node
  - rack: dc1-rack2
  - rack: dc1-rack3

keyspace:
  name: payment_ledger
  replication:
    class: NetworkTopologyStrategy
    dc1: 3`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Cross-partition queries are expensive',
          body: 'A query without partition key may hit **every node** (scatter-gather). Design access patterns around **single-partition reads**; use **secondary indexes** or **search tier** sparingly.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Near-linear horizontal scale when partition key is well chosen.',
            'No single disk or memory bus bottleneck.',
            'Fault isolation — one node down loses only its partitions.',
          ],
          cons: [
            'Partition key design is hard to change later.',
            'Cross-partition consistency and joins require application logic.',
            'Rebalancing and ops complexity vs a single shared-database server.',
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
              question: 'What is Shared Nothing architecture?',
              answer:
                'Each node has **its own memory and storage** — no shared resources. Scale by **adding independent nodes** with **partitioned data** and network communication.',
            },
            {
              question: 'Shared Nothing vs Shared Disk?',
              answer:
                '**Shared Nothing**: nodes own partitions (Cassandra, sharded MySQL). **Shared Disk**: all nodes read/write same SAN — simpler consistency but **I/O and locking** cap scale.',
            },
            {
              question: 'Why do Dynamo and Cassandra use shared nothing?',
              answer:
                'To achieve **linear scale-out** and **partition tolerance**. Commodity hardware + local disks + replication beats expensive shared storage appliances.',
            },
            {
              question: 'What is the hardest part of shared nothing?',
              answer:
                'Choosing the **partition key** and handling **cross-partition** operations — global secondary indexes, scatter-gather queries, and rebalancing on cluster growth.',
            },
            {
              question: 'Are stateless microservices shared nothing?',
              answer:
                'The **compute tier** is shared nothing (any instance handles any request). If they share one database, the **data tier** is not — full shared-nothing needs **sharded or per-service stores**.',
            },
            {
              question: 'Design a shared-nothing order store for 1M orders/sec.',
              answer:
                'Partition by **order_id** or **customer_id** depending on access pattern. **Cassandra/DynamoDB** with RF=3, **quorum writes**. Stateless order API tier behind LB. **Avoid cross-partition TX**; use **Saga** for multi-entity updates.',
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
          body: '1. Shared Nothing = **independent nodes**, no shared memory/disk.\n2. Scale by **partitioning** and adding nodes — Cassandra, Kafka, DynamoDB.\n3. vs **Shared Disk**: better scale-out, harder cross-partition queries.\n4. Real uses: **high-scale e-commerce, Netflix data tier, payment ledgers**.',
        },
      ],
    },
  ],
};

export default content;
