import { DesignContent } from '../../../shared/models';
import { SPRING_BOOT_PRODUCTION_INTERVIEW_META } from './spring-boot-production-interview.meta';

const content: DesignContent = {
  meta: SPRING_BOOT_PRODUCTION_INTERVIEW_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'callout',
          variant: 'info',
          title: 'How to answer advanced production questions',
          body: 'Start with the **failure or correctness guarantee**, explain the mechanism in plain words, then cover observability, recovery, and trade-offs. Avoid claiming “exactly once,” “zero downtime,” or “strong consistency” unless the whole boundary truly guarantees it.',
        },
      ],
    },
    {
      id: 'diagnostics-runtime',
      title: 'Runtime Diagnostics and Cloud Delivery',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Production Diagnostics Q&A',
          items: [
            {
              question:
                '1. How do you diagnose a thread pool that is silently exhausted in a Spring Boot application?',
              answer:
                'First identify **which pool** is exhausted. Common candidates are Tomcat/Jetty request threads, a `ThreadPoolTaskExecutor` used by `@Async`, a scheduled executor, an HTTP-client connection pool, or Hikari database connections. They have similar symptoms—requests wait and latency rises—but different fixes.\n\nCheck Actuator/Micrometer metrics for active threads, maximum threads, queue depth, completed tasks, rejected tasks, HTTP requests in flight, and Hikari active/pending connections. A pool is suspicious when active workers stay at the maximum while its queue or waiter count grows. Low CPU does not prove spare capacity: every worker may be blocked on a database, lock, socket, or downstream service.\n\nCapture several thread dumps a few seconds apart with `jcmd <pid> Thread.print` or a secured `/actuator/threaddump`. Group stacks by state and repeated frame. Look for workers waiting on the same remote call, connection pool, monitor, future, or unbounded task queue. Correlate this with downstream latency, pool timeouts, request p99, and rejection metrics.\n\nFix the cause before increasing the pool. Add dependency timeouts, bound queues, cancellation, bulkheads, and rejection behavior; remove blocking work from the wrong executor; and size pools from measured service time and downstream capacity. A larger pool often moves exhaustion to the database or another service.',
            },
            {
              question:
                '8. How do you reduce Spring Boot container image size and cold-start time for cloud deployments?',
              answer:
                'Build a layered, reproducible image. Use a multi-stage build so Maven/Gradle and source files stay out of the runtime image. Run on a small supported JRE, distroless image, or a `jlink` runtime containing only required Java modules. Use Spring Boot layered jars so stable dependencies form reusable container layers; keep frequently changing application classes in a small top layer.\n\nReduce startup work: remove unused starters and classpath scanning, avoid eager network calls and heavy initialization, tune logging, and measure with `/actuator/startup` or Java Flight Recorder. Class Data Sharing/AppCDS and Spring AOT can improve JVM startup. GraalVM native images start very quickly and use less memory, but increase build complexity, require reachability metadata, and may reduce peak throughput or limit dynamic behavior.\n\nImage pull time and JVM startup are different. Keep images small for pull time, set realistic CPU requests so startup is not throttled, and use a `startupProbe` so Kubernetes does not kill a slow but healthy startup. Do not use lazy initialization blindly—it makes the first real request pay the cost and may hide configuration errors until runtime.',
            },
            {
              question:
                '9. How would you diagnose a slow GC pause pattern affecting p99 latency in production?',
              answer:
                'Prove correlation first. Put HTTP p99, GC pause duration/count, allocation rate, heap occupancy, CPU throttling, safepoint time, and request concurrency on the same timeline. Enable unified GC and safepoint logs, for example `-Xlog:gc*,safepoint`, and capture a JFR recording during the problem. Separate young pauses, mixed collections, Full GC, humongous allocations, metadata pressure, and non-GC safepoints.\n\nInspect the live-set trend after each major collection. A continuously rising live set suggests a leak or an unbounded cache/queue. A stable heap with very frequent young GC suggests excessive allocation. Long concurrent-GC cycles can also happen when a container is CPU-throttled. Use allocation profiles and heap histograms/dumps to find dominant types and retention paths.\n\nFix evidence, not flags: bound caches and queues, stream large results, remove temporary object churn, right-size heap relative to the container limit, and give the collector enough CPU. Tune G1 only after understanding pause causes; consider ZGC for very large heaps and strict tail-latency goals. Validate with a production-like load test because reducing pauses can trade for CPU or throughput.',
            },
            {
              question:
                '19. How do you capture a thread dump and heap dump from a live production pod without downtime?',
              answer:
                'Find the pod and JVM PID, then use `kubectl exec` if diagnostic tools exist:\n\n```bash\nkubectl exec <pod> -- jcmd <pid> Thread.print > thread-dump.txt\nkubectl exec <pod> -- jcmd <pid> GC.heap_dump /tmp/app.hprof\nkubectl cp <namespace>/<pod>:/tmp/app.hprof ./app.hprof\n```\n\nA secured Actuator `/actuator/threaddump` is another low-impact option. If the runtime image is distroless, use `kubectl debug --target=<container>` with an approved JDK diagnostic image and the required process-namespace permissions, or attach a pre-approved diagnostic sidecar. Store large dumps on an `emptyDir`/mounted volume with enough free space.\n\nThis avoids restarting the pod, but it is not zero-impact. Thread dumps briefly pause threads; a heap dump can cause a longer stop-the-world pause and heavy disk I/O. Prefer an off-peak replica, keep other replicas serving traffic, use `jcmd ... GC.heap_dump` without forcing an extra Full GC when appropriate, encrypt the dump, restrict RBAC, and delete it after analysis because heap dumps contain credentials and user data.',
            },
          ],
        },
      ],
    },
    {
      id: 'spring-transactions-data',
      title: 'Transactions, JPA, Batch, and Multi-Tenancy',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Spring Data and Batch Q&A',
          items: [
            {
              question:
                '2. Why does @Transactional sometimes not work when calling a method from within the same class?',
              answer:
                'Spring normally applies `@Transactional` through an AOP proxy around the bean. A call from another bean goes through the proxy, which opens the transaction before invoking the target method. A call such as `this.saveOrder()` stays inside the object and bypasses the proxy, so the interceptor never runs and no new transaction behavior is applied.\n\nThe clean fix is to move the transactional operation into another Spring bean and call that bean. Alternatives are calling through an injected proxy or using `TransactionTemplate`; AspectJ weaving can intercept self-invocation but adds complexity. Also remember that a private method cannot be usefully proxied in the usual proxy setup, and rollback defaults to unchecked exceptions—catching an exception or throwing only a checked exception may also explain an unexpected commit.',
            },
            {
              question:
                '13. How do you handle the lost update problem in Spring Data JPA when two users edit the same entity concurrently?',
              answer:
                'Use **optimistic locking** for the common case. Add a `@Version` field to the entity. Each update includes the version in its `WHERE` clause; the first update increments it, and the second update affects zero rows and causes `OptimisticLockException`. Return `409 Conflict` or `412 Precondition Failed`, show the latest state, and let the user merge or retry intentionally.\n\nFor REST, expose an ETag/version and require `If-Match` so stale clients are rejected before silently overwriting data. Retry automatically only when the business operation can be safely recomputed; never blindly retry a human edit using stale values.\n\nUse a pessimistic write lock (`PESSIMISTIC_WRITE` / `SELECT ... FOR UPDATE`) for short, highly contended operations where waiting is preferable, but keep transactions short because locks reduce concurrency and can deadlock. Atomic SQL such as `UPDATE account SET balance = balance + ?` is often better for counters.',
            },
            {
              question:
                '14. Why does Hibernate first-level cache cause stale data issues in long-running batch jobs, and how do you avoid it?',
              answer:
                'The first-level cache is the JPA persistence context attached to an `EntityManager`. Once an entity is loaded, repeated `find` calls return the same managed object. A long transaction can therefore keep thousands of entities and old snapshots in memory. Dirty checking gets slower, heap usage grows, and bulk SQL or updates made by another transaction are not automatically reflected in already managed entities.\n\nProcess in chunks. After each batch, call `flush()` to send pending changes and `clear()` to detach managed entities. Configure `hibernate.jdbc.batch_size`, use ordered inserts/updates, and avoid identity ID generation when it prevents insert batching. For read-only work use projections, streaming with fetch size, read-only transactions, or Hibernate `StatelessSession` when entity lifecycle features are unnecessary.\n\nKeep transaction boundaries aligned with restartable chunks. If code performs JPQL/native bulk updates, clear the persistence context afterward because those updates bypass managed objects.',
            },
            {
              question:
                '15. How do you design a checkpoint-and-restart mechanism for a Spring Batch job processing terabytes of data?',
              answer:
                'Use a durable `JobRepository` and chunk-oriented processing. The reader stores a restart position—such as input file plus byte/record offset, database keyset, or Kafka partition offset—in the step `ExecutionContext`. Spring Batch commits output and checkpoint metadata at each chunk boundary. After failure, restart the same `JobInstance`; the reader opens from the last committed checkpoint, so only the incomplete chunk is replayed.\n\nThe reader must have a stable order and restartable state. Prefer keyset ranges over database `OFFSET` for huge tables. Make the writer idempotent with a natural key, upsert, or processed-record table because a crash can make an external side effect ambiguous. Do not checkpoint only in memory or mark a chunk complete before its output is durable.\n\nPartition terabyte work into immutable ranges/files and run partitions in parallel or with remote workers. Store partition status centrally, limit retries, send poison records to a skip/review path, and record input version/checksum so a changed source cannot be silently resumed. Test failure after read, during write, and immediately before/after checkpoint commit.',
            },
            {
              question:
                '16. How do you isolate tenant data at the database connection pool level in a multi-tenant Spring Boot app?',
              answer:
                'For strong pool-level isolation, use **database-per-tenant or pool-per-tenant** routing. Resolve the authenticated tenant before database access, then route through `AbstractRoutingDataSource` or Hibernate `MultiTenantConnectionProvider` to that tenant’s `HikariDataSource`. Each pool can have separate credentials, limits, metrics, and circuit breaking, preventing one tenant from using another tenant’s connection.\n\nDo not create unlimited pools. Maintain a controlled pool registry, cap total connections, lazily create pools, evict idle pools, rotate credentials safely, and apply per-tenant quotas. Clear tenant context in a `finally` block—especially with thread pools—to prevent identity leakage. Reject requests when the requested tenant does not match the authenticated principal.\n\nSchema-per-tenant can share a pool by setting the schema when borrowing a connection, but the schema must always be reset before return; one missed reset can leak data across tenants. A discriminator column with one pool is cheaper but is logical row-level isolation, not pool-level isolation. Add database permissions and tests so an application bug is not the only boundary.',
            },
          ],
        },
      ],
    },
    {
      id: 'events-idempotency',
      title: 'Events, Idempotency, and Auditability',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Reliable State Change Q&A',
          items: [
            {
              question:
                '3. How would you implement event sourcing alongside a traditional Spring Boot CRUD service?',
              answer:
                'Introduce it incrementally and declare one source of truth for each aggregate. Do not write a CRUD table and an event store independently because one write can succeed while the other fails.\n\nA safe migration starts with the existing CRUD transaction plus a **transactional outbox** record. An outbox publisher emits versioned domain events. Build an idempotent event consumer that creates a shadow projection, then compare it with the CRUD data. Once confidence is high, route selected commands for suitable aggregates to an event store: append events with an expected aggregate version, then rebuild/read from projections. Keep ordinary CRUD for domains that do not benefit from full history.\n\nStore aggregate ID, sequence/version, event type, schema version, time, actor, and payload. Enforce uniqueness on `(aggregate_id, version)` for optimistic concurrency. Use snapshots only to speed replay, never as the history. Version event schemas, make projectors replayable, and plan deletion/redaction for regulated personal data because immutable events complicate erasure.',
            },
            {
              question:
                '4. How do you design an API to be safely retryable without causing duplicate side effects?',
              answer:
                'For a side-effecting request such as payment creation, require an **idempotency key** generated by the client. Store `(caller, operation, key)` with a hash of the normalized request, processing status, and final response. Put a unique database constraint on that identity.\n\nThe first request atomically reserves the key and performs the state change in the same transaction where possible. A retry with the same payload returns the stored response. The same key with a different payload returns a conflict. A concurrent duplicate either waits briefly or receives “still processing”; it must not run the operation again. Keep records at least as long as clients may retry.\n\nMake downstream calls idempotent too, propagate a stable operation ID, and use an outbox for messages. Distinguish safe retry errors (timeouts, temporary 5xx) from validation failures. If a timeout leaves the result unknown, provide a status lookup instead of asking clients to create a new key.',
            },
            {
              question:
                '17. How would you build a tamper-evident audit trail that survives a compromised application server?',
              answer:
                'Send audit events immediately to a separately administered collector or durable log that the application can **append to but cannot update or delete**. The collector assigns a trusted sequence and timestamp, stores events in WORM/object-lock storage, and applies strict retention and independent access control.\n\nHash-chain records: each record includes the previous record hash, canonical event bytes, sequence, and metadata. Periodically build a Merkle root or chain checkpoint and sign it with a key held in an HSM/KMS that the application server cannot export. Anchor signed checkpoints in another security account or external timestamp service. A verifier regularly recomputes hashes, checks signatures and sequence gaps, and alerts outside the compromised environment.\n\nInclude actor, action, target, result, request/trace ID, source, and policy decision, while minimizing secrets and personal data. A compromised application can still lie about a new event before submission; tamper evidence proves that accepted history was changed or deleted, not that every original statement was truthful. Independent identity, database, and infrastructure logs improve that assurance.',
            },
            {
              question:
                '20. How do you design a notification system that guarantees at-least-once delivery without spamming users on retries?',
              answer:
                'Create one stable `notificationId` or deduplication key for the business event, channel, recipient, and template version. Save the notification plus an outbox event in the business transaction. The broker may deliver more than once, so the consumer inserts the ID into an inbox/deduplication table with a unique constraint.\n\nUse a state machine such as `PENDING → SENDING → SENT/FAILED`. Claim work with compare-and-set plus a lease so only one worker sends at a time. Pass the same idempotency key to providers that support it. If the worker times out after sending, the result is ambiguous: reconcile through the provider’s message ID/status API before retrying where possible.\n\nRetry temporary failures with exponential backoff and jitter; dead-letter permanent failures. Keep dedupe records beyond the maximum retry/redelivery period. Apply user preferences, quiet hours, and frequency caps so different valid events do not create spam. The transport remains at-least-once, while dedupe and reconciliation make the user-visible effect effectively once.',
            },
          ],
        },
      ],
    },
    {
      id: 'kafka-observability',
      title: 'Kafka Delivery and Asynchronous Observability',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Kafka Production Q&A',
          items: [
            {
              question:
                '5. What happens if a Kafka consumer commits its offset but the downstream processing later fails?',
              answer:
                'Kafka considers the record finished. After a restart or rebalance, the consumer starts after the committed offset, so Kafka will not redeliver it. If the database update, HTTP call, or asynchronous work fails afterward, that side effect is lost. This is **at-most-once behavior** for that processing path.\n\nCommit only after the required processing succeeds. In Spring Kafka, choose an appropriate listener acknowledgment mode and do not acknowledge before handing work to an untracked asynchronous executor. For database work, make processing idempotent and record the message ID in the same database transaction as the business update, then commit the Kafka offset. For outgoing events, use an outbox. Configure bounded retries and a dead-letter topic for poison messages.\n\nA Kafka transaction can atomically commit consumed offsets and produced Kafka records, but it cannot atomically include an ordinary external database or HTTP service.',
            },
            {
              question:
                '7. How do you guarantee exactly-once processing semantics in a Kafka-based Spring Boot pipeline?',
              answer:
                'First define the boundary. For **Kafka read → transform → Kafka write**, enable producer idempotence and transactions, give each producer instance a unique transactional ID, consume with `isolation.level=read_committed`, and use Spring Kafka’s transaction-aware listener/container. The produced records and consumed offsets commit in one Kafka transaction; on abort, neither becomes visible.\n\nFor a database or external API, Kafka cannot provide one atomic transaction across both systems. Achieve an effectively-once business result with an inbox/processed-message table and the business update in one database transaction, enforced by a unique event ID. Use a transactional outbox to publish resulting events. Consumers and external side effects must be idempotent.\n\nRetries, rebalances, and crashes still happen; the guarantee comes from atomic Kafka transactions inside Kafka and deduplication outside it. State the honest answer: global exactly-once is usually replaced by at-least-once delivery plus idempotent effects.',
            },
            {
              question:
                '10. How do you correlate logs across microservices when using asynchronous messaging instead of REST?',
              answer:
                'Put distributed trace context in message headers—normally W3C `traceparent`/`tracestate` plus baggage only for safe, bounded metadata. The producer creates a send span and injects context; the consumer extracts it and creates a receive/process span. Micrometer Tracing with OpenTelemetry/Brave and Spring Kafka instrumentation can do this automatically when observation is enabled.\n\nWhile processing, place `traceId` and `spanId` in MDC so structured logs join the trace. Always scope and clear MDC/context in pooled threads. If work moves to another executor, use framework context propagation or a `TaskDecorator`; a raw `ThreadLocal` will be lost or leak between tasks.\n\nAlso carry a stable business correlation ID such as `orderId` or `eventId`, because retries and fan-out can create several traces/spans for one business operation. Preserve original event ID and trace-link information through retry and dead-letter topics rather than pretending a delayed retry is one continuous synchronous call.',
            },
          ],
        },
      ],
    },
    {
      id: 'resilience-coordination',
      title: 'Resilience and Distributed Coordination',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Resilience Patterns Q&A',
          items: [
            {
              question:
                '6. How do you implement the Circuit Breaker pattern with Resilience4j in Spring Boot?',
              answer:
                'Add the Resilience4j Spring Boot starter and Actuator/AOP support. Configure a breaker by dependency, then wrap only the remote call:\n\n```java\n@CircuitBreaker(name = "inventory", fallbackMethod = "inventoryFallback")\n+public Stock stock(String sku) {\n+    return inventoryClient.getStock(sku);\n+}\n+\n+private Stock inventoryFallback(String sku, Throwable error) {\n+    return Stock.unknown(sku);\n+}\n```\n\nConfigure a minimum number of calls, sliding-window size, failure-rate and slow-call thresholds, wait time in OPEN, and a small number of HALF_OPEN test calls. Record timeouts, connection failures, and selected 5xx errors; ignore expected business exceptions such as 404 when appropriate. The fallback must have the same arguments plus the exception and should return a safe degraded result—not silently hide data corruption.\n\nSet a timeout because a breaker does not stop one slow call. Combine carefully with retry and bulkhead: usually timeout → limited retry → circuit breaker, with bounded concurrency. Avoid self-invocation because annotations use AOP proxies. Monitor breaker state, rejected calls, slow/failure rates, and fallback volume through Actuator/Micrometer.',
            },
            {
              question:
                '11. How do you implement a leader election mechanism in a clustered Spring Boot deployment?',
              answer:
                'On Kubernetes, prefer the native **Lease** API. Each instance tries to acquire or renew one Lease object; only the holder runs leader-only work. Spring Cloud Kubernetes or the Kubernetes Java client can manage this. If renewal stops, the lease expires and another healthy instance takes over. Use RBAC limited to that Lease.\n\nOutside Kubernetes, use a proven coordinator such as ZooKeeper/Curator or etcd. For a simple scheduled database job, a database advisory lock or ShedLock may be enough. Avoid a home-grown Redis lock unless lease expiry, ownership-safe release, clock behavior, and failover are fully understood.\n\nA previous leader can pause and resume after losing its lease, so use a monotonically increasing **fencing token** and make the protected resource reject work from older leaders. Leader tasks must be idempotent and checkpointed. Election gives one active coordinator under stated assumptions; it does not make every external side effect exactly once.',
            },
            {
              question:
                '12. How would you design a sliding-window rate limiter that works across multiple application instances?',
              answer:
                'Keep shared state in Redis and execute the decision atomically with Lua. For an exact sliding-window log, use a sorted set per identity/route: remove timestamps older than `now - window`, count remaining members, add a unique request member if below the limit, and set key expiry—all in one script. Every application instance calls the same script, so two instances cannot both pass based on a stale count.\n\nReturn allowed/denied, remaining quota, and retry-after. Use server time or a trusted common time source, include tenant/user/API dimensions in bounded keys, and add TTL so inactive keys disappear. The exact log costs O(number of requests) memory and roughly O(log n) per update.\n\nAt high scale, use a sliding-window counter with current/previous buckets or a token bucket, which uses constant memory with a small approximation. Cluster keys carefully, protect Redis with timeouts, and choose fail-open or fail-closed per endpoint. Apply local coarse limits too, so a Redis outage or attack cannot create unlimited load.',
            },
            {
              question:
                '18. How do you implement mutual TLS (mTLS) between Spring Boot microservices?',
              answer:
                'Give every service an identity certificate from a trusted internal CA. The server presents its certificate and requires a client certificate; the client verifies the server chain and hostname/SAN, while the server verifies the client chain and maps its identity to authorization rules.\n\nFor an inbound Spring Boot server, configure a key/certificate, truststore, HTTPS, and `server.ssl.client-auth=need`—preferably through Spring Boot SSL bundles. For outbound `RestClient` or `WebClient`, configure the client key material and trusted CA in its HTTP client/SSL bundle. Do not use one shared certificate for all services.\n\nAutomate short-lived certificate issuance and rotation through cert-manager/SPIFFE or a service mesh. Protect private keys, restrict trust roots, test rotation overlap, and monitor expiry and handshake failures. A service mesh can terminate workload mTLS transparently, but application authorization must still decide whether the authenticated service may perform the requested action.',
            },
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Interview Summary',
      blocks: [
        {
          type: 'callout',
          variant: 'summary',
          title: 'The production mindset',
          body: 'Use bounded resources, explicit transaction boundaries, durable checkpoints, idempotent side effects, and observable failure handling. Treat “exactly once” as a scoped protocol property, not a slogan. Always explain what happens during timeout, crash, retry, failover, and recovery.',
        },
      ],
    },
  ],
};

export default content;
