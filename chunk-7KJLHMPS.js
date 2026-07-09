import{a as e}from"./chunk-ZWIYLSTW.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Pipes and Filters** structures data processing as a **chain of independent stages (filters)** connected by **pipes** that pass data between them. Each filter does one job \u2014 validate, transform, enrich \u2014 and pipes carry the output forward. Stages can be recombined, tested in isolation, and scaled independently."},{type:"callout",variant:"info",title:"Core idea",body:"Think Unix `|` for distributed systems: `extract | normalize | dedupe | load`. Filters should be **stateless** when possible; stateful stages (windowed aggregations) are explicit exceptions."},{type:"table",caption:"Pipeline roles.",headers:["Component","Responsibility"],rows:[["Pipe","Transport between filters (queue, stream, in-memory channel)"],["Filter","Single transformation or validation step"],["Pump","Source that pushes data into the pipeline"],["Sink","Terminal filter that writes results"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **sushi conveyor belt**: each chef station (filter) adds one thing \u2014 rice, fish, wrap \u2014 and the belt (pipe) moves plates to the next station. You can add a garnish station without rebuilding the whole kitchen."},{type:"mermaid",caption:"Linear pipeline of filters connected by pipes.",definition:`flowchart LR
  SRC[Order Feed] --> F1[Validate]
  F1 --> F2[Enrich Customer]
  F2 --> F3[Compute Totals]
  F3 --> F4[Load Warehouse]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["ETL / ELT","Extract from DB \u2192 cleanse \u2192 transform \u2192 load to data warehouse"],["Stream processing","Kafka Streams / Flink pipeline: parse \u2192 filter \u2192 aggregate \u2192 sink"],["Log pipelines","Fluent Bit \u2192 parse JSON \u2192 drop debug \u2192 index in Elasticsearch"],["Image processing","Upload \u2192 resize filter \u2192 watermark filter \u2192 CDN upload"],["Payment reconciliation","Ingest files \u2192 normalize \u2192 match \u2192 flag exceptions"],["CI/CD","Build \u2192 test \u2192 scan \u2192 deploy as chained stages"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Each filter implements a narrow interface: accept input, produce output, propagate errors. Pipes can be in-process queues or durable topics between services. For replay, persist intermediate results or make filters **pure** and re-runnable from the source."},{type:"code",language:"java",filename:"OrderPipeline.java",code:`public interface Filter<I, O> {
  O apply(I input);
}

public class OrderPipeline {
  private final List<Filter<Object, Object>> stages = List.of(
      new ValidateOrderFilter(),
      new EnrichCustomerFilter(customerService),
      new ComputeTotalsFilter(),
      new WarehouseLoadFilter(warehouseClient)
  );

  public ProcessedOrder run(RawOrder raw) {
    Object current = raw;
    for (Filter<Object, Object> stage : stages) {
      current = stage.apply(current);
    }
    return (ProcessedOrder) current;
  }
}

// Kafka Streams: each filter is a stream operation
KStream<String, Order> orders = builder.stream("raw-orders");
orders.filter((k, o) -> o.isValid())
      .mapValues(o -> enricher.enrich(o))
      .to("enriched-orders");`},{type:"callout",variant:"warning",title:"Error handling",body:"A failing filter can stall the whole pipeline. Use **dead-letter branches**, skip-and-log for non-critical rows, and idempotent sinks so replays are safe."},{type:"prosCons",title:"Trade-offs",pros:["Modular stages \u2014 easy to test and replace one filter.","Reuse filters across different pipelines.","Scale bottlenecks independently."],cons:["End-to-end latency sums across stages.","Cross-cutting concerns (auth, metrics) need shared wrappers.","Debugging requires distributed tracing across pipes."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Pipes and Filters vs microservices?",answer:"Same **sequential decomposition** idea. In-process filters share a JVM; microservice pipelines use **message topics** as pipes between deployed services."},{question:"When should a filter be stateful?",answer:"When you need **windows**, **joins**, or **deduplication** across messages. Keep state bounded (TTL, RocksDB state stores in Kafka Streams) and document recovery."},{question:"How do you handle a slow filter?",answer:"Scale that stage horizontally (more consumers on its input topic), optimize the filter, or **async offload** heavy work to a side queue while the pipe buffers."},{question:"Parallel filters vs sequential?",answer:"Sequential when output of A feeds B. **Parallel branches** when the same input needs independent processing (fan-out), then optionally an **Aggregator** to merge."},{question:"ETL example in one sentence?",answer:"Nightly job: **extract** orders from OLTP \u2192 **filter** cancelled \u2192 **transform** to star schema \u2192 **load** into Redshift \u2014 each stage is a replaceable filter."},{question:"How does this relate to Chain of Responsibility?",answer:"Chain of Responsibility often picks **one** handler. Pipes and Filters typically runs **every** stage in order \u2014 more like an assembly line than a dispatch chain."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Decompose processing into **filters** linked by **pipes**.
2. Real uses: **ETL, stream processing, log pipelines**.
3. Prefer **stateless** filters; isolate stateful stages.
4. Plan for **errors, replay, and tracing** across stages.`}]}]},a=t;export{a as default};
