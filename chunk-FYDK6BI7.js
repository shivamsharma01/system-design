import{a as e}from"./chunk-2CM5VB2R.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Scatter-Gather** pattern sends one inbound request to **many downstream services in parallel** (scatter), then **merges** their responses into a single reply (gather). Product pages, search result enrichment, and checkout summaries often need data from inventory, pricing, reviews, and personalization \u2014 scatter-gather avoids serial latency that would blow past SLOs."},{type:"callout",variant:"info",title:"Scatter vs gather",body:"**Scatter**: fan-out parallel calls to N services. **Gather**: wait (with timeout), collect successes and failures, merge into one response \u2014 often with **partial results** when some shards miss the deadline."},{type:"table",caption:"Core concerns.",headers:["Concern","Typical approach"],rows:[["Latency","Parallel calls; bounded by slowest successful shard + timeout"],["Partial failure","Return what arrived; mark missing sections degraded"],["Timeouts","Per-shard deadline shorter than client deadline"],["Aggregation","Merge maps, sum counts, or rank blended results"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **newsroom editor** assigning the same breaking story to reporters in sports, finance, and weather **at once** (scatter). The front page goes to print when enough copy arrives or the deadline hits \u2014 missing sections show \u201Cupdate pending\u201D (gather with partial results)."},{type:"mermaid",caption:"Orchestrator fans out, gathers with timeout, returns merged view.",definition:`sequenceDiagram
  participant Client
  participant Orchestrator
  participant Inventory
  participant Pricing
  participant Reviews

  Client->>Orchestrator: GET /product/{id}
  par Scatter
    Orchestrator->>Inventory: stock
    Orchestrator->>Pricing: price
    Orchestrator->>Reviews: rating
  end
  Note over Orchestrator: wait max 200ms per shard
  Inventory-->>Orchestrator: in stock
  Pricing-->>Orchestrator: $49
  Reviews--xOrchestrator: timeout
  Orchestrator->>Orchestrator: gather + defaults
  Orchestrator-->>Client: partial product page`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce search","Scatter query to catalog, inventory, and sponsored-ads services; gather ranked results with stock badges"],["Product detail API","Parallel fetch price, reviews, recommendations, and CDN image metadata for one PDP response"],["Food delivery","Gather restaurant menu, ETA from maps, promotions, and rider availability for checkout screen"],["Travel aggregators","Fan-out to airline/hotel providers; merge cheapest options within SLA"],["GraphQL / BFF","Resolver layer naturally scatter-gathers field requests to microservices"],["CDN origin shield","Edge asks origin aggregator that scatter-gathers shard APIs before caching"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Use **async parallel calls** (`CompletableFuture`, reactive `Mono.zip`, or virtual threads). Set a **global deadline** slightly below the client timeout and **per-shard timeouts** inside it. Define **fallback values** for missing shards. Avoid unbounded thread pools \u2014 cap concurrency when fanning out to hundreds of IDs (batch scatter)."},{type:"code",language:"java",filename:"ProductPageAggregator.java",code:`public class ProductPageAggregator {
  private final InventoryClient inventory;
  private final PricingClient pricing;
  private final ReviewsClient reviews;
  private static final Duration SHARD_TIMEOUT = Duration.ofMillis(200);

  public ProductPage getProductPage(String productId) {
    CompletableFuture<Stock> stockF = CompletableFuture
        .supplyAsync(() -> inventory.getStock(productId))
        .orTimeout(SHARD_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS)
        .exceptionally(ex -> Stock.unknown());

    CompletableFuture<Price> priceF = CompletableFuture
        .supplyAsync(() -> pricing.getPrice(productId))
        .orTimeout(SHARD_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS)
        .exceptionally(ex -> Price.unavailable());

    CompletableFuture<Rating> ratingF = CompletableFuture
        .supplyAsync(() -> reviews.getRating(productId))
        .orTimeout(SHARD_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS)
        .exceptionally(ex -> Rating.empty());

    CompletableFuture.allOf(stockF, priceF, ratingF).join();

    return ProductPage.builder()
        .id(productId)
        .stock(stockF.join())
        .price(priceF.join())
        .rating(ratingF.join())
        .partial(stockF.isCompletedExceptionally()
            || priceF.isCompletedExceptionally()
            || ratingF.isCompletedExceptionally())
        .build();
  }
}`},{type:"callout",variant:"warning",title:"Partial results need UX honesty",body:"Returning a page without reviews is fine if labeled **\u201Cratings temporarily unavailable.\u201D** Silent omission erodes trust \u2014 expose `partial: true` in API contracts and metrics on shard miss rates."},{type:"prosCons",title:"Trade-offs",pros:["Latency scales with the slowest shard, not the sum of all calls.","Natural fit for BFF and GraphQL resolver trees.","Partial results keep the core path available during incidents."],cons:["Aggregation logic grows complex with ranking and deduplication.","Thundering herd if every miss triggers synchronous scatter.","Debugging requires distributed tracing across fan-out spans."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is scatter-gather?",answer:"**Scatter** sends one request to many services in parallel. **Gather** collects responses (within timeouts) and merges them into a single reply \u2014 often tolerating **partial results** when some shards fail."},{question:"How do you handle one slow dependency?",answer:"Per-shard **timeout** with fallback/default. Do not let one slow service block the entire page \u2014 return partial data and track miss metrics. Optionally **cache** slow shard responses separately."},{question:"Scatter-gather vs sequential calls?",answer:"Sequential latency is **sum** of all calls. Scatter-gather is roughly **max** of parallel calls \u2014 critical when a product page needs five microservices under 300ms total."},{question:"Scatter-gather vs aggregator pattern?",answer:"They overlap. **Scatter-gather** emphasizes parallel fan-out/fan-in. **Aggregator** (messaging) often buffers events over time. In HTTP BFFs, scatter-gather is the common name."},{question:"Design search with 50 index shards.",answer:"Scatter query to all shards in parallel with **timeout**; gather top-K from each; **merge-sort** globally. Missing shards reduce recall \u2014 optionally retry once or serve degraded results with a banner."},{question:"How does this relate to the Backend-for-Frontend pattern?",answer:"A **BFF** is the natural home for scatter-gather \u2014 it shapes one client-friendly response from many backend calls, hiding microservice granularity from mobile or web apps."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Scatter-gather = **parallel fan-out** + **merge** for composite responses.
2. Use **timeouts and fallbacks** \u2014 design for partial results, not all-or-nothing.
3. Real uses: **e-commerce PDP/search**, food delivery checkout, GraphQL BFFs.
4. Latency \u2248 **slowest successful shard**, not the sum of every dependency.`}]}]},a=t;export{a as default};
