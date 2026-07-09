import{a as e}from"./chunk-FKTE3KWB.js";import"./chunk-IFGU66OU.js";var r={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Producer-Consumer** decouples threads (or services) that **create work** from those that **process work** using a shared **buffer or queue**. Producers put items in; consumers take them out. A **bounded** buffer adds natural **backpressure** when consumers fall behind."},{type:"callout",variant:"info",title:"Core idea",body:"Producers and consumers never talk directly. The queue is the contract: rate differences, retries, and parallelism become queue-sizing and consumer-count problems."},{type:"table",caption:"Roles.",headers:["Role","Responsibility"],rows:[["Producer","Creates items and enqueues them"],["Buffer / Queue","Holds pending work (often bounded)"],["Consumer","Dequeues and processes items"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **kitchen ticket rail**: waiters (producers) clip orders; cooks (consumers) pull tickets. If the rail is full, waiters must wait \u2014 that is backpressure protecting the kitchen."},{type:"mermaid",caption:"Bounded buffer between producers and consumers.",definition:`flowchart LR
  P1[Producer] --> Q[(Bounded Queue)]
  P2[Producer] --> Q
  Q --> C1[Consumer]
  Q --> C2[Consumer]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Order pipelines","API accepts orders \u2192 workers charge / ship"],["Logging","App threads enqueue logs; shipper writes to disk/Kafka"],["Image / video","Upload service enqueues; transcoder workers consume"],["Messaging","Kafka / RabbitMQ as the distributed buffer"],["Web servers","Accept thread enqueues requests; worker pool processes"],["ETL","Extractors produce records; transformers consume batches"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Java `BlockingQueue` is the standard in-process tool. `put` blocks when full; `take` blocks when empty."},{type:"code",language:"java",filename:"OrderPipeline.java",code:`import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class OrderPipeline {
  private final BlockingQueue<Order> queue = new ArrayBlockingQueue<>(100);

  public void startConsumers(int n) {
    for (int i = 0; i < n; i++) {
      Thread t = new Thread(this::consumeLoop, "order-worker-" + i);
      t.setDaemon(true);
      t.start();
    }
  }

  /** Producer: API / checkout thread. */
  public void submit(Order order) throws InterruptedException {
    queue.put(order); // blocks if full \u2192 backpressure
  }

  private void consumeLoop() {
    try {
      while (true) {
        Order order = queue.take(); // blocks if empty
        process(order);
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  private void process(Order order) {
    // charge, reserve inventory, emit events...
  }
}`},{type:"callout",variant:"warning",title:"Unbounded queues",body:"An unbounded queue can grow until the JVM OOMs under a traffic spike. Prefer **bounded** queues and an explicit policy: block, reject, or shed load."},{type:"prosCons",title:"Trade-offs",pros:["Decouples produce rate from consume rate.","Easy to scale consumers independently.","Bounded queues give clear backpressure."],cons:["Extra latency vs inline processing.","Ordering and exactly-once need extra design.","Poison messages can stall a consumer if not handled."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain Producer-Consumer in one minute.",answer:"Producers enqueue work into a shared buffer; consumers dequeue and process it. The buffer absorbs rate differences. A **bounded** buffer applies **backpressure** when full."},{question:"Why bound the queue?",answer:"To prevent memory blow-ups and to force producers to slow down or fail fast when consumers cannot keep up \u2014 essential under load."},{question:"How does this relate to Kafka?",answer:"Kafka is a **distributed** producer-consumer system: producers write to partitions; consumer groups read. Retention and consumer lag replace an in-memory `BlockingQueue`."},{question:"How do you handle a slow consumer?",answer:"Add more consumers (if work is parallelizable), increase partition/worker count, optimize processing, or shed/reject at the producer when the queue is full."},{question:"Producer-Consumer vs Thread Pool?",answer:"Thread pools often **implement** consumer-side execution. Producer-Consumer is the **decoupling pattern**; a pool is one way to run the consumers."},{question:"LLD example?",answer:"Food-delivery: checkout thread `put`s orders; kitchen/assignment workers `take` and match drivers. Or a logger: app threads enqueue; one I/O thread drains the queue."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Decouple producers and consumers with a **queue**.
2. Prefer **bounded** buffers for backpressure.
3. Real uses: **pipelines, logs, Kafka, upload/transcode**.
4. Discuss lag, poison messages, and scaling consumers in interviews.`}]}]},s=r;export{s as default};
