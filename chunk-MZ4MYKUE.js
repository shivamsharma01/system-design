import{a as e}from"./chunk-B6C4AIFI.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Message Filter** removes messages that do not meet criteria before they reach expensive downstream processing. Unlike a router (which picks destinations), a filter **passes or drops** \u2014 reducing noise, cost, and load on consumers that only care about a subset of events."},{type:"callout",variant:"info",title:"Core idea",body:"Apply a **predicate**: if true, forward; if false, discard (or route to archive). Filters are cheap sentinels at the edge of pipelines."},{type:"table",caption:"Filter actions.",headers:["Action","When"],rows:[["Pass","Message matches interest criteria"],["Drop","Irrelevant or duplicate \u2014 safe to ignore"],["Sample","Pass 1% of debug traffic for observability"],["Quarantine","Suspicious but not poison \u2014 separate review queue"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **spam folder for your bank alerts**: you only want transactions above \u20B9500 or international charges. Everything else is filtered out before it pings your phone \u2014 the bank still logs it, but your attention is protected."},{type:"mermaid",caption:"Filter drops non-matching messages early.",definition:`flowchart LR
  IN[All Events] --> F{Message Filter}
  F -->|matches| OUT[Downstream Handler]
  F -->|no match| X[Discarded / Archive]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Logging","Drop DEBUG in prod; keep ERROR and WARN"],["Analytics","Filter bot traffic before clickstream aggregation"],["Alerts","Only `severity >= HIGH` reaches PagerDuty"],["Compliance","Drop PII fields or messages from blocked regions"],["Kafka Streams","`.filter()` before expensive join or window"],["Email marketing","Unsubscribe list filter before send pipeline"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Keep filters **fast** \u2014 they run on every message. Use headers or indexed fields when possible instead of parsing large bodies. Log drop counts (metrics) so silent filters do not hide misconfiguration."},{type:"code",language:"java",filename:"MessageFilter.java",code:`@FunctionalInterface
public interface MessageFilter {
  boolean accept(MessageEnvelope msg);
}

@Component
public class AlertFilter implements MessageFilter {
  @Override
  public boolean accept(MessageEnvelope msg) {
    String severity = msg.headers().getOrDefault("severity", "LOW");
    return Set.of("HIGH", "CRITICAL").contains(severity);
  }
}

public class FilteringConsumer {
  private final MessageFilter filter;
  private final Consumer<MessageEnvelope> downstream;

  public void onMessage(MessageEnvelope msg) {
    if (!filter.accept(msg)) {
      metrics.increment("messages.filtered");
      return;
    }
    downstream.accept(msg);
  }
}

// Kafka Streams
stream.filter((key, event) -> event.amount() >= 500)
      .to("significant-transactions");`},{type:"callout",variant:"warning",title:"Silent data loss",body:"Dropping messages is **lossy**. Confirm drops are intentional, audit filter changes, and never filter financial events without reconciliation elsewhere."},{type:"prosCons",title:"Trade-offs",pros:["Cuts cost and latency for downstream stages.","Simple composable predicates in pipelines.","Reduces alert fatigue and noise."],cons:["Wrong filter rules lose data silently.",'Hard to debug "missing" events without metrics.',"Filtering before archive may violate audit requirements."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Message Filter vs Content-Based Router?",answer:"**Filter**: binary pass/drop on one path. **Router**: chooses **which channel** receives the message. You can combine both in sequence."},{question:"Where should filters sit in a pipeline?",answer:"As **early as possible** after parse \u2014 before joins, DB writes, or external API calls. Cheapest place to shed load."},{question:"Filter vs consumer-side ignore?",answer:"Infrastructure filter saves **network and CPU** across the cluster. Consumer-side ignore still pays delivery cost \u2014 fine for small volume."},{question:"How do you monitor a filter?",answer:"Metrics: `passed`, `dropped`, ratio alerts on sudden drop spikes. Sample dropped messages to a debug topic in non-prod."},{question:"Sampling as a filter?",answer:"Yes \u2014 pass 1/N messages for tracing or load testing. Document that downstream is **statistically incomplete**."},{question:"Filter poison messages?",answer:"No \u2014 poison messages **fail processing** and go to **Dead Letter Channel**. Filters drop **valid but irrelevant** messages."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. **Pass or drop** messages by predicate \u2014 early in the pipeline.
2. Real uses: **log levels, alert thresholds, bot filtering**.
3. Monitor drops; avoid silent loss of important events.
4. Distinct from **routing** (destination choice) and **DLQ** (failures).`}]}]},i=t;export{i as default};
