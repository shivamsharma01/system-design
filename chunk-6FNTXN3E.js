import{a as e}from"./chunk-GVW2DRPU.js";import"./chunk-IFGU66OU.js";var s={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"A **Gossip Protocol** (epidemic dissemination) spreads cluster metadata by having each node periodically **exchange state with a few random peers**. Information propagates like a rumor \u2014 eventually every node learns membership, health, and config without a central coordinator. Cassandra, Consul, and Akka Cluster use gossip for **membership lists**, **failure detection**, and **metadata sync**."},{type:"callout",variant:"info",title:"Gossip variants",body:"**Anti-entropy gossip** \u2014 periodic full state merge to fix drift. **Dissemination gossip** \u2014 push or pull deltas for events (new node, failure). **SWIM** \u2014 scalable weakly-consistent membership with **ping/ack** failure detection and indirect probes. Most systems combine gossip with a **seed node** list for bootstrap only."},{type:"table",caption:"Gossip properties.",headers:["Property","Implication"],rows:[["Eventually consistent","Cluster view converges in O(log N) rounds typically"],["Fault tolerant","No single point of failure for membership propagation"],["Bandwidth efficient","O(1) peers per round per node \u2014 scales to thousands"],["Staleness window","Brief periods where nodes disagree on who is alive"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"**Office rumors**: one person hears \u201Cthe printer on floor 3 is broken\u201D and tells two colleagues at lunch. They each tell two others. Within an afternoon, everyone knows \u2014 no central PA announcement needed. Occasionally someone still thinks it works until they hear the latest version."},{type:"mermaid",caption:"Each round, nodes merge membership with random peers.",definition:`flowchart TB
  A[Node A<br/>membership: A,B,C]
  B[Node B<br/>membership: A,B,D]
  C[Node C<br/>membership: B,C,E]
  D[Node D<br/>membership: A,D,E]

  A <-->|exchange state| B
  B <-->|exchange state| C
  C <-->|exchange state| D
  Note[After several rounds all nodes converge on shared view]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Apache Cassandra","GossipStage propagates endpoint states, versions, and schema across ring"],["HashiCorp Consul / Serf","SWIM-based membership and failure detection for service mesh agents"],["Akka Cluster","Cluster gossip spreads member reachability and roles for sharded actors"],["Amazon Dynamo","Membership and failure detection via gossip between storage nodes"],["CockroachDB","Gossip network for node descriptors, store capacity, and topology hints"],["Redis Cluster","PING/PONG with slot maps \u2014 lightweight gossip for cluster bus health"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Each node maintains a **membership map** (nodeId \u2192 heartbeat version, status, metadata). Every **T seconds**, pick **k random peers** (often 1\u20133), send local state, merge remote state (higher version wins). Use **phi accrual failure detector** or **SWIM ping/ack** to mark suspects before removal. On node join, contact **seed nodes** once, then rely on gossip. Cap message size \u2014 send **digests** or **incremental deltas** for large clusters."},{type:"code",language:"java",filename:"MembershipGossipService.java",code:`public class MembershipGossipService {
  private final ConcurrentMap<String, MemberState> membership = new ConcurrentHashMap<>();
  private final List<String> peers;
  private final Duration gossipInterval = Duration.ofSeconds(1);

  @Scheduled(fixedDelay = 1)
  public void gossipRound() {
    String peer = pickRandomPeer();
    if (peer == null) return;

    GossipMessage outbound = new GossipMessage(membership);
    GossipMessage inbound = transport.exchange(peer, outbound);

    merge(inbound.states());
    membership.compute(localNodeId(), (_, state) -> state.bumpHeartbeat());
  }

  private void merge(Map<String, MemberState> remote) {
    remote.forEach((id, remoteState) ->
        membership.merge(id, remoteState, (local, r) ->
            r.version() > local.version() ? r : local));
  }

  public boolean isAlive(String nodeId) {
    MemberState state = membership.get(nodeId);
    return state != null && state.failureDetector().isAvailable();
  }
}`},{type:"callout",variant:"warning",title:"Split-brain and seed nodes",body:"Partitioned clusters may form **disjoint gossip components**. Mitigate with **minimum seed list**, **quorum gates** for membership changes, and **fencing** for writers. Seeds bootstrap only \u2014 they are not a runtime coordinator."},{type:"prosCons",title:"Trade-offs",pros:["Decentralized \u2014 no single registry bottleneck or SPOF.","Scales to large clusters with constant per-node fan-out.","Self-healing membership view propagates joins and failures automatically."],cons:["Eventually consistent \u2014 temporary disagreement on cluster state.","Harder to reason about than centralized service discovery.","Malicious or buggy nodes can spread bad state \u2014 needs version checks."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is a gossip protocol?",answer:"Nodes periodically **exchange state with random peers**; information spreads epidemic-style until the cluster converges. Used for **membership**, health, and metadata without a central server."},{question:"How does SWIM improve failure detection?",answer:"**SWIM** uses direct **ping/ack** and **indirect probes** through third parties. Separates **failure detection** from **dissemination** \u2014 fewer false positives and O(log N) propagation vs classic heartbeat floods."},{question:"Gossip vs centralized service discovery?",answer:"**Gossip** is decentralized, AP-friendly, no registry SPOF \u2014 but **eventually consistent**. **ZooKeeper/etcd/Eureka** offer stronger consistency and simpler queries at cost of coordinator availability and scale limits."},{question:"How fast does gossip converge?",answer:"Typically **O(log N)** rounds with random peer selection \u2014 a few seconds for hundreds of nodes. Convergence depends on **fan-out**, **interval**, and network latency."},{question:"What role do seed nodes play?",answer:"**Bootstrap only** \u2014 new nodes contact seeds to learn initial peers, then participate in gossip. Not a runtime leader; avoids cold-start isolation."},{question:"Design cluster membership for 500 cache nodes.",answer:"SWIM-style ping every 1s, gossip 2 random peers per round, **phi accrual** failure detector. 3 seed nodes for join. Membership map includes **hash ring position** for routing. Quorum-required ops use **versioned membership** snapshot."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Gossip spreads cluster state via **random peer exchange** \u2014 epidemic, decentralized.
2. Powers **Cassandra**, **Consul/SWIM**, and **Akka Cluster** membership.
3. **Eventually consistent** views \u2014 pair with **quorum** for critical decisions.
4. Use **seeds** for bootstrap, **versioned merges**, and **failure detectors** for production safety.`}]}]},o=s;export{o as default};
