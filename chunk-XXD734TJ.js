import{a as e}from"./chunk-43L67VCC.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Three-Phase Commit (3PC)** protocol extends **Two-Phase Commit (2PC)** with an extra **pre-commit** phase so participants can distinguish \u201Ccoordinator decided commit\u201D from \u201Ccoordinator may still be deciding.\u201D If the coordinator fails after pre-commit, **non-faulty nodes** can safely complete the transaction without indefinite blocking \u2014 addressing 2PC\u2019s worst-case **prepared limbo**."},{type:"callout",variant:"info",title:"Theory vs practice",body:"3PC is important for **interviews and textbooks** but **rare in production**. Network assumptions (synchronous bounds, failure detectors) are hard to meet at scale. Teams building microservices choose **Saga**; teams needing single-DB atomicity stay on one database or short 2PC."},{type:"table",caption:"2PC vs 3PC vs Saga.",headers:["Protocol","Phases","Blocking?","Production use"],rows:[["2PC","Prepare \u2192 Commit/Abort","Yes \u2014 prepared wait","XA, legacy distributed DB"],["3PC","CanCommit \u2192 PreCommit \u2192 DoCommit","Reduced for non-faulty nodes","Mostly academic / research"],["Saga","Local TX + compensate","No global lock","E-commerce, banking microservices"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"Booking a **multi-leg flight**: the agent first asks if seats exist (**canCommit**). Then sends \u201Cwe are proceeding \u2014 hold finalized\u201D (**preCommit**). Only then tickets are issued (**doCommit**). If the agent\u2019s phone dies after pre-commit, travelers know the booking **will complete** and are not stuck wondering whether to release seats (**2PC limbo**)."},{type:"mermaid",caption:"3PC adds pre-commit between prepare and final commit.",definition:`sequenceDiagram
  participant TC as Coordinator
  participant P1 as Participant 1
  participant P2 as Participant 2

  TC->>P1: CAN_COMMIT?
  TC->>P2: CAN_COMMIT?
  P1-->>TC: YES
  P2-->>TC: YES
  TC->>P1: PRE_COMMIT
  TC->>P2: PRE_COMMIT
  P1-->>TC: ACK (ready)
  P2-->>TC: ACK (ready)
  TC->>P1: DO_COMMIT
  TC->>P2: DO_COMMIT
  P1-->>TC: DONE
  P2-->>TC: DONE`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Distributed database research","Non-blocking commit protocols in academic replicated stores"],["System design interviews","Contrast with 2PC blocking and Saga compensation"],["Legacy XA variants","Some TP monitors documented 3PC-style extensions (uncommon today)"],["Banking textbooks","Illustrate coordinator failure recovery vs 2PC prepared state"],["Not used: e-commerce sagas","Checkout flows use **Saga** \u2014 not 3PC across payment and inventory"],["Not used: Kafka consumers","At-least-once handling uses **Idempotent Consumer** / **Inbox**, not 3PC"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"A 3PC coordinator tracks participant state machines: **INITIAL \u2192 WAITING \u2192 PREPARED \u2192 COMMITTED**. Timeouts let participants **query peers** after pre-commit if the coordinator disappears. Implementations must guarantee **at-most-one decision** and handle duplicate messages \u2014 complexity that pushed industry toward **Saga** for cross-service workflows and **single-leader replication** for data stores."},{type:"code",language:"java",filename:"ThreePhaseCoordinator.java",code:`public class ThreePhaseCoordinator {
  enum Phase { CAN_COMMIT, PRE_COMMIT, DO_COMMIT, ABORT }

  public void execute(GlobalTxn txn) {
    if (!allCanCommit(txn)) { broadcast(txn, Phase.ABORT); return; }

    broadcast(txn, Phase.PRE_COMMIT);
    if (!allPreCommitted(txn)) { broadcast(txn, Phase.ABORT); return; }

    logDecision(txn.id(), Decision.COMMIT); // durable before DO_COMMIT
    broadcast(txn, Phase.DO_COMMIT);
  }

  // Participant timeout handler (simplified)
  public void onCoordinatorTimeout(ParticipantState self, GlobalTxn txn) {
    if (self.phase() == Phase.PRE_COMMIT) {
      // Safe to commit \u2014 coordinator already reached pre-commit quorum
      self.doCommit(txn);
    } else if (self.phase() == Phase.CAN_COMMIT) {
      self.abort(txn); // coordinator failed before decision
    }
  }
}`},{type:"code",language:"java",filename:"SagaPreferredAlternative.java",code:`// Production alternative: Saga instead of 3PC across services
@Service
public class OrderSagaStep {
  @Transactional
  public void capturePayment(UUID orderId) {
    payments.capture(orderId);
    outbox.publish(new PaymentCapturedEvent(orderId));
    // No global prepare \u2014 compensate with RefundPayment on later failure
  }
}`},{type:"callout",variant:"warning",title:"Why Saga won",body:"**Saga** accepts eventual consistency and explicit **compensation** \u2014 no global coordinator lock, no synchronous failure detector. For **banking transfers** and **e-commerce checkout**, that operational simplicity beats 3PC\u2019s marginal blocking improvement over **2PC**."},{type:"prosCons",title:"Trade-offs",pros:["Reduces indefinite blocking for non-faulty nodes after coordinator crash.","Clearer progress signaling than raw 2PC prepare state.","Useful mental model for comparing commit protocols in interviews."],cons:["Extra round trip increases latency vs 2PC.","Still vulnerable under arbitrary partitions without perfect failure detection.","Rarely implemented in modern frameworks \u2014 Saga and outbox patterns dominate."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What problem does 3PC solve that 2PC does not?",answer:"In **2PC**, if the coordinator dies after participants vote YES, they stay **prepared and blocked**. **3PC** adds **pre-commit** so participants know whether commit is inevitable; non-faulty nodes can **finish without the coordinator** after that point."},{question:"Name the three phases of 3PC.",answer:"**CanCommit** (feasibility vote), **PreCommit** (announce imminent commit), **DoCommit** (final commit). Abort can be sent instead if any phase fails."},{question:"Why is 3PC rare in production?",answer:"It needs **bounded network delay** and reliable failure detection assumptions that real WANs violate. Extra complexity buys little over **Saga** for microservices or **single-DB transactions** for local atomicity."},{question:"3PC vs Saga for e-commerce checkout?",answer:"**Saga**: each service commits locally (order, payment, inventory) and compensates on failure \u2014 scalable, no global lock. **3PC** would block all participants \u2014 impractical across heterogeneous cloud services. Always **Saga** in practice."},{question:"Does 3PC achieve CAP availability during partition?",answer:"**Not fully.** Without accurate failure detection, partitions can still cause inconsistent decisions. 3PC improves on 2PC blocking but does not replace **eventual consistency** designs."},{question:"When would you mention 3PC in an interview?",answer:"When comparing **2PC blocking** to mitigations, then pivot to why industry uses **Saga** (microservices) or **Raft single-leader writes** (distributed DB) instead of multi-phase global commit."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. 3PC = **canCommit \u2192 preCommit \u2192 doCommit** \u2014 less blocking than **2PC** after coordinator failure.
2. Still **rare in practice** \u2014 hard assumptions, extra latency.
3. Contrast with **2PC** (blocking) and **Saga** (compensation, production default).
4. Know it for interviews; implement **Saga** for distributed business transactions.`}]}]},o=t;export{o as default};
