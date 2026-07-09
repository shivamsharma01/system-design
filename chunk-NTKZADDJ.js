import{a as e}from"./chunk-5VU6ATP7.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:'The **Content-Based Router** is a specialized **Message Router** that chooses the destination by **inspecting message content** \u2014 JSON fields, XML elements, headers, or metadata. When `order.type == "GROCERY"` go to the grocery fulfillment topic; when `priority == "VIP"` use the express queue.'},{type:"callout",variant:"info",title:"Core idea",body:"Routing logic lives in **predicates over the payload**, not in the producer. Producers emit canonical events; the router interprets them \u2014 enabling new routes without redeploying every publisher."},{type:"table",caption:"Common inspection points.",headers:["Inspect","Example route"],rows:[["JSON field","`$.paymentMethod` \u2192 wallet vs card handlers"],["Header","`X-Tenant-Id` \u2192 tenant-specific topic"],["Message type","`InventoryReserved` vs `InventoryFailed`"],["Size / MIME","Large PDF \u2192 async OCR queue"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:'**Food-delivery sorting**: every bag looks similar at intake, but the scanner reads the sticker \u2014 "hot meal", "grocery", "pharmacy" \u2014 and sends each to a different prep line without the restaurant knowing the warehouse layout.'},{type:"mermaid",caption:"Router evaluates message body to pick destination.",definition:`flowchart LR
  M[Incoming Event] --> R{Content Router}
  R -->|category=FOOD| T1[Restaurant Partners]
  R -->|category=GROCERY| T2[Dark Store]
  R -->|category=PHARMA| T3[Licensed Pharmacy]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce","Route returns by product category to different warehouse systems"],["Banking","Route transactions by amount threshold to standard vs enhanced fraud review"],["Log ingestion","Parse `level=ERROR` to PagerDuty path; DEBUG dropped or sampled"],["IoT","Device type in payload \u2192 HVAC vs security processing pipelines"],["Global apps","Country code in order \u2192 region-specific tax and shipping services"],["Kafka Streams","`branch()` on predicates to multiple output topics"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Define **predicates** as testable units. Prefer structured envelopes (`type`, `version`, `payload`) over scraping ambiguous JSON. Order rules from **most specific to catch-all**; document overlap behavior."},{type:"code",language:"java",filename:"ContentBasedRouter.java",code:`@FunctionalInterface
public interface RoutePredicate {
  boolean test(JsonNode body, Map<String, String> headers);
}

@Component
public class ContentBasedRouter {
  private final List<Map.Entry<RoutePredicate, String>> routes = List.of(
      Map.entry((b, h) -> "GROCERY".equals(b.path("category").asText()), "grocery-orders"),
      Map.entry((b, h) -> "VIP".equals(h.get("customer-tier")), "vip-orders"),
      Map.entry((b, h) -> b.path("amount").asDouble() > 10_000, "high-value-review"),
      Map.entry((b, h) -> true, "standard-orders") // default
  );

  public String resolveDestination(JsonNode body, Map<String, String> headers) {
    return routes.stream()
        .filter(e -> e.getKey().test(body, headers))
        .map(Map.Entry::getValue)
        .findFirst()
        .orElseThrow();
  }
}

// Kafka Streams branch
KStream<String, OrderEvent> stream = builder.stream("orders");
Map<String, KStream<String, OrderEvent>> branches = stream.split()
    .branch((k, v) -> v.isGrocery(), (k, v) -> v.isPharmacy());
branches.get("branch-0").to("grocery-topic");
branches.get("branch-1").to("pharmacy-topic");`},{type:"callout",variant:"warning",title:"Fragile parsing",body:"Routing on deep JSON paths breaks when schemas evolve. Use **versioned event types** and stable top-level fields. Content-Based Router couples routing to payload shape \u2014 govern schema changes."},{type:"prosCons",title:"Trade-offs",pros:["Producers stay dumb; routing policy evolves centrally.","Enables multi-line-of-business from one inbound stream.","Rules map naturally to business language."],cons:["Tight coupling between payload schema and infrastructure.","Complex predicates are hard to reason about and test.","Performance cost of parsing large bodies per message."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Content-Based Router vs Message Filter?",answer:"**Router** forwards to **different destinations**. **Filter** passes or **drops** on the same path \u2014 no destination choice."},{question:"Header vs body routing?",answer:"**Headers** are cheap and broker-friendly (Kafka headers, SQS attributes). **Body** routing needs parse but carries rich domain fields. Often combine both."},{question:"How do you avoid routing bugs on schema change?",answer:"Stable `eventType`, schema registry, contract tests, and **default route** to DLQ when required fields missing."},{question:"Design a router for multi-region orders.",answer:"Predicate on `shipTo.country` \u2192 `orders-eu`, `orders-us`, `orders-apac`. Include fallback and metrics per route volume."},{question:"Can one message go to multiple destinations?",answer:"Yes \u2014 that is **Recipient List** routing (a router variant). Content-Based Router often picks **one** primary destination unless audit fan-out is configured."},{question:"EventBridge content-based routing example?",answer:"`detail-type: OrderPlaced` AND `detail.category: GROCERY` \u2192 Lambda in grocery account. Rules are declarative content predicates."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Route by **inspecting message content or headers**.
2. Specialized form of **Message Router** \u2014 common in integration and streams.
3. Prefer **stable event types** over fragile JSON paths.
4. Real uses: **multi-category orders, fraud tiers, regional routing**.`}]}]},r=t;export{r as default};
