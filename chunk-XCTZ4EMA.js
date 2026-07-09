import{a as e}from"./chunk-N52TNKR4.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Aggregator** collects **related messages** (usually sharing a **correlation ID**) and combines them into a **single composite message** once a **completion condition** is met. Classic use: scatter-gather \u2014 send requests to multiple services, aggregate replies before responding to the client."},{type:"callout",variant:"info",title:"Core idea",body:"Track partial results in memory or a store keyed by `correlationId`. When all expected parts arrive (or timeout fires), emit the aggregated result and clean up state."},{type:"table",caption:"Completion strategies.",headers:["Strategy","Complete when"],rows:[["Fixed count","N of N responses received"],["First + timeout","First response or wait up to T for more"],["Predicate","Total amount reconciles, all line items present"],["Timeout only","Best-effort merge after deadline (partial OK)"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"**Group food order on a delivery app**: roommates each submit items separately (correlation = group order ID). The restaurant only starts cooking when **everyone has checked out** or the 15-minute window expires \u2014 that is aggregation with a completion rule."},{type:"mermaid",caption:"Scatter-gather with aggregation.",definition:`sequenceDiagram
  participant C as Client
  participant A as Aggregator
  participant S1 as Inventory
  participant S2 as Pricing
  participant S3 as Shipping
  C->>A: GetQuote(orderId=42)
  A->>S1: CheckStock(42)
  A->>S2: GetPrice(42)
  A->>S3: GetShipping(42)
  S1-->>A: StockOK(42)
  S2-->>A: Price(42)
  S3-->>A: Ship(42)
  A->>C: CombinedQuote(42)`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce checkout","Aggregate inventory, tax, shipping quotes before confirm"],["Travel booking","Combine flight + hotel + car responses for package price"],["Payment split","Wait for all wallet debits before marking order paid"],["Map reduce","Shuffle phase groups by key; reduce aggregates values"],["Microservices gateway","BFF aggregates profile + orders + recommendations"],["Saga orchestration","Collect step outcomes before compensation decision"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Store partial state in Redis or an in-memory `ConcurrentHashMap` with TTL. Include `correlationId` and `expectedCount` in the initial scatter. Handle **late arrivals** (ignore or merge), **duplicates** (idempotent upsert), and **timeouts** (fail or partial response)."},{type:"code",language:"java",filename:"QuoteAggregator.java",code:`public class QuoteAggregator {
  private final ConcurrentHashMap<String, PartialQuote> pending = new ConcurrentHashMap<>();

  public void onPartial(String correlationId, String source, QuotePart part, int expectedParts) {
    PartialQuote state = pending.computeIfAbsent(correlationId,
        id -> new PartialQuote(expectedParts));
    state.add(source, part);
    if (state.isComplete()) {
      pending.remove(correlationId);
      publishCombined(correlationId, state.merge());
    }
  }

  @Scheduled(fixedDelay = 5000)
  void expireStale() {
    pending.entrySet().removeIf(e -> e.getValue().isExpired(Duration.ofSeconds(30)));
  }
}

class PartialQuote {
  private final int expected;
  private final Map<String, QuotePart> parts = new ConcurrentHashMap<>();
  // isComplete() when parts.size() >= expected
  // merge() builds CombinedQuote
}`},{type:"callout",variant:"warning",title:"State and failures",body:"Aggregator state is ** fragile** \u2014 process crash loses in-memory partials. Use durable store for long waits; set **timeouts** and notify clients of partial failure."},{type:"prosCons",title:"Trade-offs",pros:["Enables parallel downstream calls with one client response.","Natural fit for scatter-gather and BFF patterns.","Completion rules express business logic clearly."],cons:["Stateful component \u2014 scaling and HA need design.","Timeouts vs correctness trade-off on slow participants.","Correlation ID discipline required across all producers."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Aggregator vs Database JOIN?",answer:"Aggregator merges **async messages** over time. JOIN is **synchronous** in one query. Use aggregator when sources are separate services with variable latency."},{question:"What is a correlation ID?",answer:"A shared identifier (often UUID) propagated through all messages belonging to one logical operation \u2014 ties partial results together."},{question:"How do you handle one slow service?",answer:'**Timeout** with partial result, **circuit breaker** on the slow callee, or **async** response ("we will email your quote"). Document SLA per participant.'},{question:"Where to store aggregation state?",answer:"Short waits: in-memory with TTL. Long or HA: **Redis/DynamoDB** with expiry. Survives restarts and supports multiple aggregator instances with locking."},{question:"Duplicate partial messages?",answer:"Upsert by `(correlationId, source)` \u2014 last write wins or ignore if slot filled. Idempotent aggregation prevents double counting."},{question:"Aggregator in Kafka?",answer:"Kafka Streams **`KTable` join** or session windows aggregate by key. External store + consumer for arbitrary completion predicates."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Combine **correlated messages** when a **completion condition** is met.
2. Core of **scatter-gather** and BFF aggregation.
3. Manage **state, timeouts, duplicates, and partial failure**.
4. Real uses: **checkout quotes, travel packages, saga outcomes**.`}]}]},r=t;export{r as default};
