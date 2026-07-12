import{a as e}from"./chunk-AGFSQZX6.js";import"./chunk-IFGU66OU.js";var o={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Two-Phase Commit (2PC)** protocol coordinates an **atomic commit or abort** across multiple resource managers (databases, message brokers, ledger systems). A **transaction coordinator** runs **Phase 1 (Prepare)**: ask every participant to vote. If all vote **YES**, **Phase 2 (Commit)** makes the decision durable; if any votes **NO** or times out, all are told to **abort**."},{type:"callout",variant:"info",title:"Strong consistency, harsh trade-offs",body:"2PC delivers **ACID across nodes** when it succeeds, but it is **blocking** (participants hold locks while waiting for the coordinator) and **not partition-tolerant** \u2014 a coordinator crash can leave participants stuck in **prepared** state until recovery."},{type:"table",caption:"2PC phases.",headers:["Phase","Coordinator action","Participant state"],rows:[["Prepare","Send PREPARE to all","Vote YES (write to WAL, hold locks) or NO"],["Commit","If all YES \u2192 COMMIT; else ABORT","Apply commit or release locks on abort"],["Failure","Coordinator logs decision before replying","Prepared nodes block until coordinator recovers"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **group dinner bill split** across three bank apps: the organizer asks \u201CCan everyone pay $40?\u201D (**prepare**). Everyone locks the amount. Only if **all** confirm does the organizer say \u201C**Charge now**\u201D (**commit**). If one person\u2019s card fails, **everyone** releases the hold (**abort**) \u2014 no half-paid table."},{type:"mermaid",caption:"Successful 2PC: prepare votes, then global commit.",definition:`sequenceDiagram
  participant TC as Transaction Coordinator
  participant A as Account DB
  participant B as Ledger DB
  participant C as Audit DB

  TC->>A: PREPARE (txn-99)
  TC->>B: PREPARE (txn-99)
  TC->>C: PREPARE (txn-99)
  A-->>TC: VOTE YES (prepared)
  B-->>TC: VOTE YES (prepared)
  C-->>TC: VOTE YES (prepared)
  TC->>TC: Log COMMIT decision
  TC->>A: COMMIT
  TC->>B: COMMIT
  TC->>C: COMMIT
  A-->>TC: ACK
  B-->>TC: ACK
  C-->>TC: ACK`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["XA transactions","Java EE / Spring JTA spanning two JDBC datasources in one JVM"],["Distributed databases","Shard coordinators commit multi-shard writes (where supported)"],["Banking core systems","Legacy mainframe TP monitors coordinating ledger + settlement stores"],["E-commerce (legacy)","Monolith 2PC across order DB and inventory DB before microservice split"],["Research / teaching","Baseline protocol contrasted with Saga and 3PC in system design courses"],["When NOT to use","Cross-service microservice flows \u2014 prefer **Saga** with compensation instead"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"**XA** is the standard 2PC interface (`XAResource.prepare / commit / rollback`). Modern microservices rarely span 2PC because heterogeneous services, long-running work, and partition tolerance conflict with blocking locks. If you must use 2PC, keep transactions **short**, participants **homogeneous**, and coordinator **highly available** with durable decision logs."},{type:"code",language:"java",filename:"JtaTwoPhaseCommit.java",code:`@Service
public class TransferService {
  private final UserTransaction userTx; // JTA

  @Transactional
  public void transfer(String fromAcct, String toAcct, BigDecimal amount) throws Exception {
    userTx.begin();
    try {
      // Both DataSource beans enlist as XAResource participants
      orderDb.insertOrder(order);       // XA RM 1 \u2014 separate DataSource
      inventoryDb.reserve(sku, qty);    // XA RM 2 \u2014 second XAResource (same JVM \u2260 one RM)
      userTx.commit();                  // coordinator: PREPARE all \u2192 COMMIT all
    } catch (Exception ex) {
      userTx.rollback();                // coordinator: ABORT all
      throw ex;
    }
  }
}`},{type:"code",language:"sql",filename:"prepared_transaction.sql",code:`-- PostgreSQL: view prepared (blocked) transactions after coordinator crash
SELECT gid, prepared, owner, database
FROM pg_prepared_xacts;

-- DBA must COMMIT PREPARED or ROLLBACK PREPARED after coordinator recovery
COMMIT PREPARED 'txn-99';`},{type:"callout",variant:"warning",title:"When NOT to use 2PC",body:"Do **not** use 2PC for **order \u2192 payment \u2192 inventory** across microservices. Locks span networks, outages block participants, and mixed databases break XA. Use the **Saga pattern** with local commits and compensating transactions instead. **Three-Phase Commit** reduces some blocking but is still rare in production."},{type:"prosCons",title:"Trade-offs",pros:["Atomic all-or-nothing semantics across participants.","Well-understood protocol; XA support in mature RDBMS.","Strong consistency for short, same-data-center transactions."],cons:["Blocking \u2014 prepared participants hold resources until coordinator decides.","Coordinator is a single point of failure without careful HA.","Poor fit for microservices, long transactions, and network partitions."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain the two phases of 2PC.",answer:"**Phase 1 (Prepare)**: coordinator asks participants to vote; they persist intent and hold locks. **Phase 2 (Commit/Abort)**: if unanimous YES, coordinator sends COMMIT; otherwise ABORT. Decision must be **logged** before participants are told."},{question:"Why is 2PC blocking?",answer:"After voting YES, a participant is **prepared** and **cannot unilaterally commit or abort** \u2014 it waits for the coordinator. If the coordinator crashes before sending COMMIT/ABORT, resources stay locked until manual or automated recovery."},{question:"Is 2PC partition-tolerant?",answer:"**No.** Under network partition, coordinators and participants may disagree; prepared nodes block. The CAP trade-off pushes most microservice architectures toward **Saga** (availability + eventual consistency) instead."},{question:"2PC vs Saga \u2014 when do you pick each?",answer:"**2PC**: short, same-technology, same-data-center, strong ACID across known RDBMS participants. **Saga**: long-running business flows across microservices \u2014 local commits, compensations, no global locks. E-commerce checkout almost always chooses **Saga**."},{question:"What is XA?",answer:"The **X/Open XA** standard defining how transaction managers call `prepare`, `commit`, and `rollback` on resource managers. Java **JTA** wraps XA for multiple JDBC connections in one global transaction."},{question:"How does 3PC relate to 2PC?",answer:"**Three-Phase Commit** adds a **pre-commit** phase so non-faulty nodes can learn the outcome after coordinator failure, reducing blocking. It is mostly academic \u2014 production systems prefer **Saga** or single-database transactions over 3PC."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. 2PC = **prepare + commit** for atomic distributed transactions.
2. **Blocking, not partition-tolerant** \u2014 coordinator failure stalls prepared nodes.
3. Real uses: **XA/JTA, legacy banking**, not modern microservice sagas.
4. Prefer **Saga** for cross-service flows; study **3PC** as a 2PC improvement that remains rare in practice.`}]}]},t=o;export{t as default};
