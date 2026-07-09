import{a as e}from"./chunk-2IS7FJFP.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Message Router** inspects incoming messages and **forwards them to one or more channels** based on rules \u2014 headers, message type, recipient lists, or dynamic lookups. It centralizes routing logic so producers stay simple and destinations can change without republishing code."},{type:"callout",variant:"info",title:"Router variants",body:"**Recipient List** (fixed set), **Content-Based Router** (body/metadata rules), **Dynamic Router** (runtime lookup), **Routing Slip** (itinerary embedded in message). Content-Based Router is the most common specialization."},{type:"table",caption:"Routing styles.",headers:["Style","How destination is chosen"],rows:[["Static","Always route `PaymentFailed` \u2192 billing queue"],["Header-based","`region=EU` \u2192 eu-processing topic"],["Recipient list","Same event \u2192 audit + primary handler"],["Dynamic","Lookup routing table / feature flags at runtime"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **bank branch mail sorter**: incoming letters are not addressed to final desks by the customer. The sorter reads the department code and puts loans, cards, and mortgages into the right trays \u2014 one intake, many outputs."},{type:"mermaid",caption:"Router dispatches messages to multiple channels.",definition:`flowchart TB
  IN[Inbound Queue] --> R{Message Router}
  R -->|type=ORDER| Q1[Order Service Queue]
  R -->|type=REFUND| Q2[Billing Queue]
  R -->|audit=true| Q3[Audit Log Queue]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Enterprise integration","ESB / Camel routes messages to legacy vs modern endpoints"],["Multi-tenant SaaS","Route by `tenantId` header to isolated processing queues"],["Food delivery","Order events routed to city-specific fulfillment topics"],["Payment gateways","Route by card brand or currency to different acquirers"],["AWS EventBridge","Rules match event pattern \u2192 target Lambda, SQS, SNS"],["Observability","Duplicate traffic to primary handler and audit tap"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Implement routing as a **pure function** or rule engine: `(message, headers) \u2192 List<Destination>`. Keep rules in config (YAML, EventBridge rules) when they change often. Log routing decisions for debugging misdelivered messages."},{type:"code",language:"java",filename:"MessageRouter.java",code:`public interface RoutingRule {
  boolean matches(MessageEnvelope msg);
  String destination();
}

@Component
public class MessageRouter {
  private final List<RoutingRule> rules;
  private final Map<String, MessageChannel> channels;

  public void route(MessageEnvelope msg) {
    List<String> destinations = rules.stream()
        .filter(r -> r.matches(msg))
        .map(RoutingRule::destination)
        .distinct()
        .toList();

    if (destinations.isEmpty()) {
      channels.get("default-dlq").send(msg);
      return;
    }
    for (String dest : destinations) {
      channels.get(dest).send(msg);
    }
  }
}

// Example rule: header region
public class RegionRule implements RoutingRule {
  private final String region;
  private final String queue;
  // matches when msg.headers().get("region") equals region
}`},{type:"callout",variant:"warning",title:"Fan-out cost",body:"Recipient-list routing duplicates messages. Ensure downstream idempotency and monitor **multiplied load** when one event hits many queues."},{type:"prosCons",title:"Trade-offs",pros:["Producers publish to one place; routing evolves centrally.","Supports multi-destination and A/B paths.","Rules can be externalized and hot-reloaded."],cons:["Router becomes a critical choke point \u2014 scale and HA matter.","Complex rule sets are hard to test exhaustively.","Misconfigured rules silently drop or misroute traffic."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Message Router vs API Gateway?",answer:'API Gateway routes **HTTP requests** synchronously. Message Router routes **async messages** on a bus \u2014 different transport, similar "traffic cop" role.'},{question:"Recipient List vs Content-Based Router?",answer:"**Recipient List** sends to a **fixed set** of channels. **Content-Based Router** chooses destinations from **message content** \u2014 dynamic per message."},{question:"How do you test routing rules?",answer:"Table-driven tests with sample envelopes, contract tests in CI, and shadow traffic in staging. Alert on **unmatched** messages hitting default/DLQ."},{question:"EventBridge as a message router?",answer:"Yes \u2014 **event patterns** are routing rules; **targets** are channels. Serverless router with pay-per-invocation scaling."},{question:"What if no rule matches?",answer:"Explicit policy: **DLQ**, dead-letter topic, or safe default queue. Never silently drop unless the message is truly ignorable."},{question:"Routing Slip pattern?",answer:"The message carries an **itinerary** list of steps/services. Each handler processes and forwards to the next \u2014 decentralized routing embedded in the payload."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. **Central routing** from one inbound channel to many outbound channels.
2. Variants: recipient list, content-based, dynamic, routing slip.
3. Real uses: **Camel, EventBridge, multi-tenant queues**.
4. Test rules, handle **no-match**, watch fan-out load.`}]}]},s=t;export{s as default};
