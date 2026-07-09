import{a as e}from"./chunk-XX2XMBDJ.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Leader Election** pattern ensures that in a cluster of replicas, **exactly one node** acts as the **coordinator** (leader) at any time while others are **followers**. The leader owns work that must not run concurrently \u2014 shard assignment, scheduled jobs, write serialization, or distributed lock grants. When the leader dies or loses connectivity, followers **vote or observe** a new leader automatically."},{type:"callout",variant:"info",title:"Why one leader?",body:"Many distributed problems need a **single decision maker** to avoid split-brain writes. Leader election provides that without manual failover \u2014 backed by consensus (Raft) or coordination services (ZooKeeper, etcd)."},{type:"table",caption:"Common election backends.",headers:["Technology","Mechanism","Typical use"],rows:[["Raft (etcd, Consul)","Majority vote + term numbers","Config store, service mesh control plane"],["ZooKeeper / Curator","Ephemeral sequential znodes","Kafka controller, Hadoop HA, job schedulers"],["Kubernetes Lease","API server optimistic concurrency","Controller-manager leader, operator reconciliation"],["Database advisory lock","Single-row lease with TTL","Simple cron leader in small teams"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **restaurant shift manager**: only one person approves voids, assigns stations, and closes the till. If the manager steps out, the **senior server** takes the badge. When they return, they do not fight over the till \u2014 the badge (lease) makes authority explicit."},{type:"mermaid",caption:"Leader crash triggers election; one new leader emerges.",definition:`sequenceDiagram
  participant L as Leader (Node A)
  participant F1 as Follower B
  participant F2 as Follower C
  participant Z as ZooKeeper / etcd

  L->>Z: Renew leader lease (heartbeat)
  Note over L: Leader crashes
  Z-->>F1: Lease expired
  Z-->>F2: Lease expired
  F1->>Z: Campaign for leadership
  F2->>Z: Campaign for leadership
  Z-->>F1: Elected leader (seq lowest)
  F1->>F2: Assume coordinator role
  F1->>Z: Begin heartbeats as new leader`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Distributed databases","MongoDB replica set primary, CockroachDB range lease holder"],["Kafka","Cluster controller elected via ZooKeeper/KRaft \u2014 manages partition leadership"],["Kubernetes","kube-controller-manager and scheduler run active/passive via Lease API"],["Banking batch jobs","One instance runs end-of-day interest accrual; followers standby"],["E-commerce search index","Single indexer coordinates full reindex while replicas serve reads"],["etcd / Consul","Core consensus layer for service discovery and distributed configuration"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Use **leases with TTL** and **fencing tokens** so a delayed old leader cannot write after failover. Heartbeat intervals should be shorter than lease duration. For Java services, **Apache Curator** `LeaderSelector` on ZooKeeper is a proven pattern; cloud-native stacks use **etcd elections** or Kubernetes Leases."},{type:"code",language:"java",filename:"CuratorLeaderElection.java",code:`@Service
public class NightlySettlementJob {
  private final CuratorFramework zk;
  private final SettlementService settlement;
  private LeaderSelector leaderSelector;

  @PostConstruct
  public void start() {
    leaderSelector = new LeaderSelector(zk, "/leaders/settlement", new LeaderSelectorListenerAdapter() {
      @Override
      public void takeLeadership(CuratorFramework client) throws Exception {
        log.info("Elected leader \u2014 running settlement");
        try {
          while (leaderSelector.hasLeadership()) {
            settlement.runBatchIfDue();
            Thread.sleep(30_000);
          }
        } finally {
          log.info("Relinquishing leadership");
        }
      }
    });
    leaderSelector.autoRequeue();
    leaderSelector.start();
  }

  @PreDestroy
  public void stop() throws Exception {
    if (leaderSelector != null) leaderSelector.close();
  }
}`},{type:"code",language:"java",filename:"FencedLeaderWrite.java",code:`public class InventoryShardWriter {
  private final EtcdClient etcd;
  private final InventoryRepository repo;

  public void writeWithFencing(String sku, int delta, long fencingToken) {
    // Storage layer rejects writes with stale token
    long current = etcd.getFencingToken("/shards/inventory-leader");
    if (fencingToken < current) {
      throw new StaleLeaderException("Old leader fenced out");
    }
    repo.adjustStock(sku, delta);
  }
}`},{type:"callout",variant:"warning",title:"Split-brain risk",body:"Without fencing or a quorum-backed lease, **two nodes** may both believe they are leader after a network partition \u2014 causing duplicate charges or double inventory deduction. Always pair election with **fencing tokens** or storage that honors the lease."},{type:"prosCons",title:"Trade-offs",pros:["Automatic failover \u2014 no human promotes a standby at 3 a.m.","Clear ownership of singleton coordination tasks.","Mature tooling: Raft, ZooKeeper, etcd, Kubernetes Leases."],cons:["Leader is a bottleneck for write-heavy coordinator work.","Failover delay equals lease TTL + election time.","Incorrect fencing causes rare but severe duplicate-side-effect bugs."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Why do distributed systems need leader election?",answer:"Some operations require **exactly one active coordinator** \u2014 partition assignment, global sequence allocation, or cron-style jobs. Election picks one node and **re-elects** on failure without manual intervention."},{question:"How does Raft leader election work at a high level?",answer:"Nodes start as **followers**. On election timeout a candidate requests votes with an incremented **term**. A majority grants the vote; the winner becomes **leader** and sends heartbeats. Higher terms always supersede stale leaders."},{question:"ZooKeeper vs etcd for leader election?",answer:"Both offer **ephemeral nodes + sequential ordering**. ZooKeeper is legacy in Kafka (pre-KRaft) and Hadoop. **etcd** uses Raft natively and backs Kubernetes. Pick based on your stack \u2014 Curator for ZK, jetcd or Kubernetes Lease for cloud-native."},{question:"What is a fencing token?",answer:"A monotonically increasing number issued with leadership. Shared resources (DB, storage) reject operations with a **stale token**, preventing a delayed old leader from corrupting state after failover."},{question:"Leader election vs distributed lock?",answer:"**Leader election** picks one **long-lived coordinator**. A **distributed lock** guards a **short critical section**. Leaders often hold an implicit lock via lease; locks are finer-grained and per-resource."},{question:"Design leader election for a banking end-of-day job.",answer:"Three app instances; one runs settlement. Use **ZooKeeper/Curator LeaderSelector** or **K8s Lease** with 30s TTL, 10s heartbeat. On leadership: acquire **fencing token**, run idempotent settlement keyed by business date, release on shutdown. Followers stay idle and auto-take over on crash."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Leader election = **one coordinator**, automatic **failover** on crash.
2. Backends: **Raft (etcd), ZooKeeper, Kubernetes Lease**.
3. Real uses: **Kafka controller, K8s controllers, distributed DB primaries**.
4. Always use **leases + fencing** to prevent split-brain writes.`}]}]},r=t;export{r as default};
