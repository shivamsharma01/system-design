import{a as e}from"./chunk-YZNFUC2L.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Wire Tap** intercepts messages on the **primary channel** and **copies** them to a secondary channel (monitoring, audit, analytics) **without altering** the main flow. The original message continues to its intended consumer at full speed \u2014 the tap is a side observation path."},{type:"callout",variant:"info",title:"Core idea",body:"Non-invasive **copy**, not redirect. Main processing is unchanged; the tap may drop or lag without affecting production delivery (within retention limits)."},{type:"table",caption:"Tap vs related patterns.",headers:["Pattern","Effect on main flow"],rows:[["Wire Tap","Copy only \u2014 main unchanged"],["Message Router","Redirects to chosen destination(s)"],["Message Filter","May drop from main path"],["Claim Check","Replaces payload with reference on main path"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **bank CCTV camera** watching the teller line: customers are still served normally; security gets a duplicate view for audit and fraud review \u2014 the camera does not slow withdrawals."},{type:"mermaid",caption:"Copy to audit channel; primary flow continues.",definition:`flowchart LR
  P[Producer] --> M[Main Channel]
  M --> C[Primary Consumer]
  M -.->|wire tap copy| A[Audit / Metrics Channel]
  A --> M2[Monitoring Consumer]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Compliance","Copy all payment messages to immutable audit log topic"],["Debugging","Tap prod traffic to shadow consumer in staging (careful with PII)"],["Analytics","Mirror order events to data lake without touching OLTP consumers"],["Security","Tap auth events to SIEM pipeline"],["Apache Camel",'`.wireTap("audit:queue")` in route definition'],["Kafka","MirrorMaker or dual-write connector for observability cluster"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Implement tap **asynchronously** so slow audit consumers never block primary ack. Use fire-and-forget with error logging on the tap path, or broker-native fan-out (Kafka compacted audit topic). Redact PII on the tap branch if analysts do not need it."},{type:"code",language:"java",filename:"WireTapInterceptor.java",code:`@Component
public class WireTapInterceptor {
  private final MessageChannel auditChannel;
  private final ExecutorService tapExecutor = Executors.newFixedThreadPool(2);

  /** Wrap primary handler \u2014 tap runs async, errors isolated. */
  public void deliver(MessageEnvelope msg, Consumer<MessageEnvelope> primary) {
    tapExecutor.submit(() -> {
      try {
        auditChannel.send(msg.copy()); // shallow copy of envelope
      } catch (Exception e) {
        log.warn("Wire tap failed \u2014 main flow unaffected", e);
      }
    });
    primary.accept(msg);
  }
}

// Apache Camel equivalent:
// from("kafka:orders")
//   .wireTap("kafka:orders-audit")
//   .to("bean:orderProcessor");`},{type:"callout",variant:"warning",title:"PII and prod taps",body:"Tapping production to staging risks **data leaks**. Mask fields, use synthetic sampling, or tap only non-prod. Audit taps often need **encryption and retention policies**."},{type:"prosCons",title:"Trade-offs",pros:["Zero impact on primary latency when async.","Adds observability without changing consumers.","Easy to enable/disable audit path."],cons:["Doubles storage/throughput on tapped volume.","Tap failures can hide gaps in audit trail if not monitored.","Copy semantics \u2014 not a substitute for transactional audit."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Wire Tap vs logging in the consumer?",answer:"Consumer logging couples audit to one service. **Wire Tap** is **infrastructure-level** \u2014 captures all messages on the channel, including those from multiple producers."},{question:"Can the tap block the main flow?",answer:"It should not \u2014 use **async tap** or broker fan-out. Sync tap to a slow sink is an anti-pattern unless the tap is best-effort and extremely fast."},{question:"Wire Tap vs CDC (Change Data Capture)?",answer:"CDC taps **database** changes. Wire Tap taps **message bus** traffic. Both feed analytics; different source of truth."},{question:"How to tap Kafka without dual writes from producers?",answer:"**Kafka Connect** mirror, **tiered storage** replay, or intercept in a **stream processor** that reads topic and writes to audit topic \u2014 producers stay unchanged."},{question:"Does tap guarantee audit completeness?",answer:"Only if tap path is **durable and monitored**. Fire-and-forget can lose copies \u2014 match compliance SLAs with persisted audit topics."},{question:"Wire Tap and Message Filter together?",answer:"Common: tap **all** to cold storage, filter **subset** to real-time alerts \u2014 tap is copy; filter on branch is independent."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. **Copy** messages to a side channel without changing the main path.
2. Real uses: **audit logs, SIEM, shadow analytics**.
3. Run taps **async**; monitor tap health separately.
4. Handle **PII, retention, and compliance** on the copy path.`}]}]},o=t;export{o as default};
