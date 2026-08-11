import { QaItem } from '../../../shared/models';

/** Senior / Lead Java concurrency deep-dive Q&A (volatile through backpressure). */
export const SENIOR_LEAD_CONCURRENCY_QA: QaItem[] = [
  {
    question: 'Why is volatile not enough for count++? Explain the atomicity problem.',
    answer:
      'In simple terms: `volatile` makes each *individual read or write* visible and ordered, but `count++` is three steps — read, add one, write — and another thread can interleave between them.\n\nExpansion of `count++`:\n1. Read current value of `count`\n2. Compute `value + 1` in a register\n3. Write the new value back\n\n`volatile` guarantees that step 1 sees the latest published value and that step 3 is immediately visible, but it does **not** make 1→2→3 atomic. Two threads can both read `5`, both compute `6`, and both write `6` — one increment is lost.\n\nFix with `AtomicInteger.incrementAndGet()` (CAS loop), `synchronized` / `ReentrantLock` around the increment, or `LongAdder` for high-contention metrics where an exact instantaneous value is not required. Interview line: **volatile = visibility/ordering; atomics/locks = atomicity of compound actions.**',
  },
  {
    question: 'How does CAS (Compare-And-Swap) work internally?',
    answer:
      'In simple terms: CAS is a single CPU instruction that says “if this memory still holds the value I expect, replace it with a new value; otherwise tell me I lost the race.”\n\nAlgorithmically:\n```text\nboolean compareAndSet(expected, update):\n  atomically {\n    if (location == expected) { location = update; return true; }\n    else return false;\n  }\n```\n\nOn x86 this is typically implemented with `LOCK CMPXCHG` (or equivalents). The `LOCK` prefix makes the read-modify-write indivisible with respect to other cores and also provides the necessary memory-ordering semantics the JVM relies on.\n\nJava exposes CAS through `AtomicInteger`, `AtomicReference`, `VarHandle`, and internals of `ConcurrentHashMap`. Contended CAS can spin/retry (`getAndIncrement` loops until success). That is why hot counters may prefer `LongAdder` (striped cells) over one heavily contended `AtomicLong`.\n\nABA problem: value goes A→B→A; a naive CAS succeeds even though intermediate changes happened. Mitigations: version tags (`AtomicStampedReference`), immutable nodes, or hazard-style designs. Interview line: **CAS is optimistic concurrency — succeed without locking, retry on conflict.**',
  },
  {
    question: 'How does ConcurrentHashMap achieve thread safety without locking the entire map?',
    answer:
      'In simple terms: modern `ConcurrentHashMap` (Java 8+) never takes one giant map-wide lock. It mixes lock-free reads, CAS for empty buckets, and fine-grained locking only on the bin (bucket) being written.\n\nMechanics:\n- **Reads** are mostly lock-free; table/node fields use volatile-style visibility so a reader sees a consistent enough view without blocking writers.\n- **Insert into an empty bin** uses CAS on the bin head — if CAS fails, another thread won; retry.\n- **Update an occupied bin** synchronizes on the first node of that bin (or tree-bin lock), so only writers to the *same* hash bucket contend.\n- **Resize** is cooperative: helper threads transfer bins to the new table instead of one thread doing all the work under a global lock.\n\nContrasts with the old Java 5–7 segment locking design and with `Collections.synchronizedMap`, which locks the whole map for every operation. Interview line: **concurrency = many threads progressing on different bins; not “no synchronization at all.”**',
  },
  {
    question: 'What happens when multiple threads update the same key in a ConcurrentHashMap?',
    answer:
      'In simple terms: updates to the *same key* serialize on that key’s bin, so the map’s internal structure stays correct — but *your* multi-step business logic can still race unless you use atomic map methods.\n\nWhat the map guarantees:\n- Individual `put`/`replace`/`compute*` for one key are atomic with respect to that key.\n- Two threads `put(k, v1)` and `put(k, v2)` — one wins; the other overwrites or loses depending on timing; no corruption.\n\nWhat it does **not** guarantee:\n```java\n// STILL A RACE\nif (!map.containsKey(k)) {\n  map.put(k, expensiveCreate());\n}\n```\nBoth threads can pass the check and both create. Use `computeIfAbsent`, `putIfAbsent`, `merge`, or `compute` instead.\n\nUnder high write contention on one hot key, threads queue on that bin’s monitor — throughput for *that key* becomes lock-bound. Design around hot keys (sharding the key space, local aggregation, `LongAdder` as value for counters). Interview line: **CHM makes single-key ops atomic; compound check-then-act still needs `compute*`.**',
  },
  {
    question:
      'How does ThreadLocal work internally, and what problems can it cause in a thread pool?',
    answer:
      'In simple terms: `ThreadLocal` stores a value *on the current Thread object*, not in a global map keyed by thread id that you manage yourself.\n\nInternals: each `Thread` has a `ThreadLocalMap` (custom open-addressing map). Keys are **weak references** to the `ThreadLocal` instance; values are **strong** references. `get`/`set` hash by `ThreadLocal` identity and probe that thread’s private map.\n\nThread-pool problems:\n1. **Memory leak / retention** — pool workers live forever. If you `set()` and forget `remove()`, the value stays reachable: `pool thread → ThreadLocalMap → value`. Even after the `ThreadLocal` key is GC’d, stale entries with null keys can retain values until expunged.\n2. **Context bleed** — request 2 reuses a worker that still holds request 1’s user/tenant/MDC and silently misbehaves.\n3. **ClassLoader leaks** on redeploy — values can pin an old webapp ClassLoader.\n\nAlways:\n```java\nctx.set(value);\ntry { /* work */ } finally { ctx.remove(); }\n```\nPropagate context explicitly across async boundaries; do not assume ThreadLocal follows `CompletableFuture` callbacks. Interview line: **ThreadLocal is per-thread sticky state — deadly with pooled threads unless you clean up.**',
  },
  {
    question: 'Explain happens-before relationships in the Java Memory Model.',
    answer:
      'In simple terms: **happens-before** is the JMM’s way of saying “if A happens-before B, then every write A did is visible to B, and A’s effects cannot be reordered after B in a way that breaks that guarantee.”\n\nImportant edges (not exhaustive):\n- Program order in a single thread (with caveats for what other threads observe)\n- Unlock of monitor M happens-before subsequent lock of M\n- Write to a `volatile` v happens-before subsequent read of v\n- Actions before starting a thread happen-before that thread’s first action; thread termination happens-before a successful `join`\n- A successful CAS / atomic write establishes visibility similar to volatile for that location\n- Transitivity: if A hb B and B hb C, then A hb C\n\nWithout a happens-before edge, the compiler/CPU may reorder and caches may show stale values — races that pass on your laptop and fail in prod.\n\nInterview distinction: happens-before is about **visibility and ordering**, not “wall-clock time.” Two actions can overlap in real time yet still have a well-defined hb relationship through synchronization.',
  },
  {
    question: 'What is false sharing, and how can it impact performance?',
    answer:
      'In simple terms: false sharing is when two threads update *different* variables that happen to sit on the **same CPU cache line**, so every write invalidates the other core’s cache line even though the variables are logically independent.\n\nModern CPUs move memory in cache lines (~64 bytes). If thread A increments `counters[0]` and thread B increments `counters[1]` in an adjacent `long[]`, both hammer the same line → MESI invalidation traffic → CAS/atomic retries look “mysteriously” slow.\n\nImpact: throughput collapse under multi-core writes; CPU busy with cache coherence, not useful work.\n\nMitigations: padding / `@Contended` (JDK), stripe counters (`LongAdder`/`LongAccumulator`), give each thread a thread-local buffer and aggregate infrequently, align hot fields away from each other. Interview line: **false sharing = coherence cost without true data sharing.**',
  },
  {
    question:
      'What is the difference between lock contention, thread contention, and CPU contention?',
    answer:
      'In simple terms: these are three different bottlenecks that all look like “the system is slow,” but need different fixes.\n\n- **Lock contention** — many threads want the *same monitor/lock*. Threads spend time `BLOCKED` (or parking on `ReentrantLock`). CPU may be modest. Fix: shrink critical sections, stripe locks, use concurrent structures, reduce lock scope, or redesign with queues.\n- **Thread contention** (scheduling / runnable overload) — more *runnable* threads than useful parallelism. Heavy context switching, run-queue delay, cache thrash. Fix: smaller pools for CPU work, avoid unbounded thread creation, separate pools (bulkheads).\n- **CPU contention** — not enough cycles: high CPU utilization, stolen CPU in containers, noisy neighbors, GC threads competing. Fix: more CPU quota, less work per request, better algorithms, reduce allocation/GC, right-size heap.\n\nDebugging cue: thread dump + CPU + lock profiles (JFR). `BLOCKED` stacks → locks; many `RUNNABLE` burning cycles → CPU/algorithm; low CPU + deep queues → I/O or lock wait. Interview line: **name the scarce resource — lock, scheduler, or CPU.**',
  },
  {
    question: 'When would you choose synchronized over ReentrantLock?',
    answer:
      'In simple terms: prefer `synchronized` when you want the simplest correct mutual exclusion and do not need the extras `ReentrantLock` provides.\n\nChoose **`synchronized`** when:\n- Critical section is short and uncontended or lightly contended\n- You do not need timed/interruptible lock acquisition\n- You do not need multiple `Condition` queues\n- You want less boilerplate and intrinsic monitor semantics (`wait`/`notify` only if truly necessary — prefer higher-level tools)\n- JVM lock optimizations (biased/lightweight historically; modern locking still handles uncontended cases well) are “good enough”\n\nChoose **`ReentrantLock`** when you need tryLock, lockInterruptibly, fairness option, multiple conditions, or more flexible structuring (lock in one method, unlock in another with careful try/finally).\n\nInterview line: **default to synchronized for simple exclusion; escalate to ReentrantLock for features, not for fashion.**',
  },
  {
    question: 'How does ReentrantLock provide features that synchronized doesn’t?',
    answer:
      'In simple terms: `ReentrantLock` is an explicit lock API with knobs that the `synchronized` keyword does not expose.\n\nFeatures:\n- **`tryLock()` / `tryLock(timeout)`** — avoid blocking forever; useful for deadlock avoidance and latency SLOs\n- **`lockInterruptibly()`** — respond to interruption while waiting for the lock\n- **Fairness constructor** — optional FIFO acquisition order\n- **Multiple `Condition` objects** — separate wait-sets (vs one wait-set per intrinsic monitor)\n- **Introspection** — `isHeldByCurrentThread`, queue length estimates (diagnostics)\n- **Non-block-structured locking** — can acquire/release across methods (powerful and easy to misuse; always `unlock` in `finally`)\n\nCost: more code, must never forget `unlock`, easier to leak locks on exceptions. Interview line: **ReentrantLock trades ceremony for control.**',
  },
  {
    question: 'What is a fair vs unfair lock? Why isn’t a fair lock always better?',
    answer:
      'In simple terms: a **fair** lock hands the lock to the longest-waiting thread; an **unfair** lock allows barging — a new thread can grab the lock if it is free, even if others are waiting.\n\nFair locks reduce starvation risk and make latencies more predictable for waiters. Unfair locks usually have **higher throughput** because they avoid the expensive park/unpark handoff when the releasing thread’s context can immediately re-enter or a hot thread can barge.\n\n`ReentrantLock` defaults to **unfair** for this reason. Fairness is not “always better”: under high contention, fair locks can destroy throughput and still do not fix application-level priority inversion outside the lock. Prefer unfair + correct design; enable fairness only when you measured starvation or need stricter ordering. Interview line: **fairness is a latency/equity trade-off against throughput.**',
  },
  {
    question: 'How would you identify and troubleshoot a deadlock in production?',
    answer:
      'In simple terms: capture evidence of a wait-for cycle, confirm it persists, then fix lock ordering / design — not just bounce the pod.\n\nPlaybook:\n1. **Detect** — `jcmd <pid> Thread.print -l` or `jstack -l`. HotSpot often prints `Found one Java-level deadlock` with the cycle.\n2. **Confirm** — take 2–3 dumps seconds apart; a true deadlock is stable. Transient `BLOCKED` is contention.\n3. **Map the cycle** — Thread A holds M1 waits M2; Thread B holds M2 waits M1 (or longer chains). Include JDBC locks / external resources in the mental model.\n4. **Mitigate short-term** — kill one participant only if business-safe; prefer draining traffic and restart if the process is wedged.\n5. **Fix** — global lock order, smaller critical sections, `tryLock` with backoff, avoid calling alien code while holding locks, replace nested locks with concurrent structures or single-threaded actors.\n6. **Prevent** — regression test that reproduces the interleaving; JFR lock monitor; code review for lock graphs.\n\nDatabase deadlocks show in DB logs (`deadlock detected`) — different tools, same ordering principle. Interview line: **dump → cycle → order fix → test.**',
  },
  {
    question: 'Can a system have a deadlock even when you don’t explicitly use synchronized?',
    answer:
      'In simple terms: yes. Deadlock is about **circular wait on resources**, not about the `synchronized` keyword specifically.\n\nExamples without your own `synchronized`:\n- Nested `ReentrantLock` / `ReadWriteLock` acquired in opposite orders\n- Fine-grained locks inside libraries (`ConcurrentHashMap` compute that calls user code which locks something else — carefully)\n- Database row locks (`SELECT FOR UPDATE`) forming cycles across transactions\n- Connection pool + application lock: thread holds app lock while waiting for a connection; other threads hold connections waiting for the app lock\n- `join()` / `CompletableFuture.get()` cycles between tasks on a bounded pool (dependency deadlock / thread-pool deadlock)\n- Distributed locks (Redis/ZooKeeper) acquired in inconsistent order across services\n\nInterview line: **any exclusive resource with wait-for edges can deadlock — monitors, DB locks, pools, futures.**',
  },
  {
    question: 'What happens when a thread pool’s queue is full?',
    answer:
      'In simple terms: once core threads are busy, the queue is saturated, and (if configured) max threads are already running, the next `execute`/`submit` hits the **RejectedExecutionHandler**.\n\n`ThreadPoolExecutor` flow: create core threads → offer to work queue → create up to `maximumPoolSize` → reject.\n\nBuilt-in policies:\n- `AbortPolicy` (default) — throws `RejectedExecutionException`\n- `CallerRunsPolicy` — runs on the calling thread (applies backpressure)\n- `DiscardPolicy` / `DiscardOldestPolicy` — drop work (dangerous for correctness)\n\nIf you used an **unbounded** queue, it never becomes “full” — instead memory and latency grow until OOM. Always prefer a bounded queue + explicit rejection/backpressure and metrics on queue depth / rejections. Interview line: **full queue is a feature if you fail fast; unbounded queue hides overload until catastrophe.**',
  },
  {
    question:
      'How do you choose the core pool size and maximum pool size for CPU-bound vs I/O-bound workloads?',
    answer:
      'In simple terms: size for the *bottleneck resource* — CPU cores for compute, downstream concurrency for I/O.\n\n**CPU-bound:** start near effective CPU quota (`N` or `N+1` threads). Extra runnable threads mostly context-switch. In Kubernetes use container CPU limit/request reality, not the host’s core count. Often `core == max` with a small bounded queue or `SynchronousQueue` depending on burst needs.\n\n**I/O-bound:** threads spend time blocked. Little’s Law sketch: `threads ≈ target_concurrency ≈ arrival_rate × latency`, but **cap by downstream limits** (DB pool size, HTTP client max connections). A common starting formula is `N_cores * (1 + wait/compute)`, then verify with load tests.\n\nAlways: named pools, bounded queues, rejection policy, separate bulkheads per dependency, and dashboards for active/queue/reject. Virtual threads change the cost of blocking but **not** the need to bound downstream fan-out. Interview line: **CPU pools hug core count; I/O pools hug dependency capacity.**',
  },
  {
    question: 'What happens when you use an unbounded queue with ThreadPoolExecutor?',
    answer:
      'In simple terms: with an unbounded queue (classic mistake: `new LinkedBlockingQueue<>()` with no capacity), the executor almost never creates threads beyond `corePoolSize`, because new tasks always enqueue successfully.\n\nConsequences:\n- `maximumPoolSize` becomes nearly meaningless — the pool won’t grow to absorb spikes via more threads\n- Queue length → ∞ under overload → latency explosion and eventual heap OOM\n- Failures are delayed and opaque (no early rejection signal)\n\nPrefer `ArrayBlockingQueue(capacity)`, `LinkedBlockingQueue(capacity)`, or `SynchronousQueue` with a sensible max pool and rejection policy. Interview line: **unbounded queue + ThreadPoolExecutor = hidden overload amplifier.**',
  },
  {
    question: 'CompletableFuture: What happens if you don’t provide an executor?',
    answer:
      'In simple terms: many async methods fall back to `ForkJoinPool.commonPool()` (or the completing thread for some `*Async` vs non-async variants) — a shared, sized-for-CPU pool used by the whole JVM.\n\nImplications:\n- Blocking I/O inside default async stages can **starve** unrelated parallel streams / other CF chains\n- You lose isolation/bulkheads between subsystems\n- Thread names/metrics become harder to attribute\n\nNon-`Async` callbacks (`thenApply`) may run on the thread that completes the previous stage — which might be a Netty I/O thread or a request thread — causing accidental blocking on critical threads.\n\nBest practice: pass an explicit, bounded `Executor` (or virtual-thread-per-task executor for blocking I/O with limits elsewhere) for every stage that can block or do heavy work. Interview line: **no executor = you just borrowed the JVM’s shared CPU pool.**',
  },
  {
    question:
      'Difference between thenApply(), thenCompose(), and thenCombine() — and when would you use each?',
    answer:
      'In simple terms: think map vs flatMap vs zip.\n\n- **`thenApply(fn)`** — sync transform of a value: `T → U`. If `fn` itself returns a `CompletableFuture`, you get nesting: `CompletableFuture<CompletableFuture<U>>` (usually wrong).\n- **`thenCompose(fn)`** — dependent async step / flatMap: `T → CompletableFuture<U>`, flattened to one future. Use when the next call is itself async (HTTP client returning CF).\n- **`thenCombine(other, fn)`** — wait for *two* independent futures, then `fn(T,U)→V`. Use when A and B can run in parallel.\n\nAlso know `thenAccept` (side effect), `thenRun` (no arg), `allOf`/`anyOf` for many futures. Always attach error handling (`handle`/`exceptionally`) and timeouts. Interview line: **apply = map, compose = flatMap, combine = zip.**',
  },
  {
    question:
      'How would you prevent a CompletableFuture chain from exhausting the common ForkJoinPool?',
    answer:
      'In simple terms: never put blocking or long work on the common pool; isolate stages on your own executors and bound concurrency.\n\nPractices:\n- Pass dedicated executors to `supplyAsync` / `*Async` methods\n- Keep common pool for short CPU-friendly tasks only (or avoid it entirely in services)\n- Do not `join()`/`get()` from a common-pool worker waiting on more common-pool work (pool deadlock/starvation)\n- Use semaphores / bulkheads around downstream calls\n- Prefer virtual threads *with* structured concurrency limits for blocking I/O, still off the FJP\n- Monitor common-pool active/steals; alert if service code uses it\n\nInterview line: **treat ForkJoinPool.commonPool as a public park — don’t camp there with blocking tents.**',
  },
  {
    question: 'How do you implement timeouts, retries, and fallback with CompletableFuture?',
    answer:
      'In simple terms: build deadlines and recovery into the pipeline; don’t rely on callers blocking forever.\n\nPatterns:\n- **Timeouts:** `orTimeout(duration, unit)` (complete exceptionally) or `completeOnTimeout(default, …)`. Also set timeouts on the underlying HTTP/DB client — CF timeout alone may not cancel the remote call.\n- **Fallback:** `exceptionally(ex → fallback)` or `handle((v,ex) → …)`; use `exceptionallyCompose` when fallback is async.\n- **Retries:** wrap in a recursive/composed function with max attempts, exponential backoff + jitter, and retry only idempotent operations. Prefer a proven library (Failsafe, Resilience4j) for production.\n- **Cancellation reality:** `cancel(true)` does not reliably stop arbitrary work — the operation must check interrupts/deadlines.\n\nSketch:\n```java\nsupplyAsync(this::call, exec)\n  .orTimeout(200, MILLISECONDS)\n  .exceptionally(ex → cachedFallback());\n```\nInterview line: **timeout the dependency, bound retries, fallback explicitly, measure all three.**',
  },
  {
    question: 'What problems can occur when blocking operations are executed inside ForkJoinPool?',
    answer:
      'In simple terms: ForkJoinPool is designed for *short, CPU-style* tasks that split/merge. Blocking occupies a worker that should be computing or stealing work.\n\nProblems:\n- **Worker starvation** — all workers blocked on I/O; queued CPU tasks stall\n- **Latency coupling** — unrelated features sharing the pool slow each other\n- **Compensation surprises** — managed blockers can spawn extra threads, causing oversubscription\n- **Deadlock-like hangs** — task A blocked waiting for task B that needs a worker from the same saturated pool\n- **Common pool pollution** — affects parallel streams JVM-wide\n\nFix: dedicated blocking executors or virtual threads for I/O; reserve FJP for computation. Interview line: **blocking in ForkJoinPool steals parallelism from everyone sharing it.**',
  },
  {
    question: 'How does Semaphore help control concurrency in a high-throughput service?',
    answer:
      'In simple terms: a `Semaphore` is a counter of permits — acquire before using a scarce resource, release after. It caps how many tasks may enter a section at once.\n\nUse cases:\n- Limit concurrent calls to a DB pool / third-party API (even with virtual threads)\n- Protect memory-heavy operations\n- Implement simple bulkheads per dependency\n\n```java\nsemaphore.acquire();\ntry { return callDownstream(); }\nfinally { semaphore.release(); }\n```\n\nPrefer `tryAcquire(timeout)` to fail fast under overload. Fair semaphores reduce barging at a throughput cost. Combine with timeouts, circuit breakers, and metrics on wait time / rejects.\n\nInterview line: **threads (or virtual threads) can be plentiful; permits should match the real bottleneck.**',
  },
  {
    question:
      'Difference between CountDownLatch, CyclicBarrier, and Phaser — when would you use each?',
    answer:
      'In simple terms: all coordinate threads, but the “reset” and “roles” differ.\n\n- **`CountDownLatch(n)`** — one-shot. N events call `countDown()`; waiters block in `await()` until zero. Typical: “start gate” (main awaits workers) or “wait for N services to init.” Cannot reset.\n- **`CyclicBarrier(n)`** — reusable. N parties call `await()`; when all arrive, optional barrier action runs, then they proceed together. Typical: iterative parallel phases in simulations/tests. Broken barrier on interrupt/timeout needs careful recovery.\n- **`Phaser`** — more flexible barrier: dynamic registration of parties, multiple phases, hierarchical phasers. Typical: frameworks and complex multi-stage pipelines.\n\nPrefer higher-level structures (`CompletableFuture.allOf`, workflows) in app code when they fit. Interview line: **latch = one-shot gate; barrier = reusable rendezvous; phaser = dynamic multi-phase.**',
  },
  {
    question:
      'How would you design a thread-safe Singleton and why does double-checked locking require volatile?',
    answer:
      'In simple terms: prefer patterns the JVM already makes safe; if you hand-roll DCL, `volatile` prevents publishing a half-built object.\n\nPreferred options:\n1. **Enum singleton** — simplest hard guarantee\n2. **Initialization-on-demand holder** — lazy + class-init thread safety\n3. **DI container singleton** (Spring) in application code\n\nDouble-checked locking:\n```java\nprivate static volatile Service INSTANCE;\npublic static Service get() {\n  Service local = INSTANCE;\n  if (local == null) {\n    synchronized (Service.class) {\n      local = INSTANCE;\n      if (local == null) INSTANCE = local = new Service();\n    }\n  }\n  return local;\n}\n```\nWithout `volatile`, another thread can see a non-null reference while fields are still default — safe publication fails under JMM reordering. `volatile` write of `INSTANCE` happens-before subsequent volatile reads.\n\nInterview line: **enum/holder first; DCL+volatile only if you must explain it.**',
  },
  {
    question: 'What are Virtual Threads, and why don’t they simply make every application faster?',
    answer:
      'In simple terms: virtual threads are lightweight JVM-scheduled threads that unmount from a carrier when they block on supported I/O, letting few OS threads multiplex many blocking tasks.\n\nThey help **high-concurrency blocking I/O** (thread-per-request style) by removing “one OS thread per request” cost. They do **not**:\n- Add CPU capacity for CPU-bound work\n- Magically speed up a slow database\n- Remove the need for timeouts, bulkheads, and connection pool limits\n- Fix bad algorithms or giant allocations\n\nPooling virtual threads is an anti-pattern — create per task; bound *resources* (DB connections, semaphores) instead. Interview line: **virtual threads cheaply wait; they don’t create free compute or free downstream capacity.**',
  },
  {
    question: 'What happens when a Virtual Thread performs a blocking I/O operation?',
    answer:
      'In simple terms: for supported JDK blocking points (many socket/file APIs), the virtual thread **parks and unmounts** from its carrier; the carrier can run another virtual thread; when I/O completes, the virtual thread remounts and continues.\n\nIf the blocking call is *not* unmount-friendly (certain native/JNI paths historically, or pinning cases), the carrier stays occupied — scalability collapses toward platform-thread behavior for that period.\n\nStill required: timeouts on I/O, bounded concurrency toward dependencies, and sensible memory per task (stacks + ThreadLocals). Interview line: **blocking parks the virtual thread, not necessarily the carrier — unless pinning/native blocks prevent unmount.**',
  },
  {
    question:
      'What is pinning in Virtual Threads, and why can synchronized blocks become important?',
    answer:
      'In simple terms: **pinning** means a virtual thread cannot unmount from its carrier while blocked, so that carrier is stuck even though the virtual thread is waiting.\n\nHistorically, being inside a `synchronized` monitor while performing a blocking operation was a classic pinning case. JDK evolution has improved some synchronized pinning behaviors — **verify on your exact JDK** with JFR event `jdk.VirtualThreadPinned` rather than repeating outdated absolute rules.\n\nWhy it matters: a few pinned carriers under load → effective concurrency cliff, latency spikes that look like thread-pool exhaustion.\n\nMitigations: keep synchronized sections tiny and CPU-only; prefer `ReentrantLock` for sections that might block; avoid long native calls; measure pinning in soak tests. Interview line: **pinning = carrier held hostage during a wait; measure it, don’t mythologize it.**',
  },
  {
    question: 'How would you design a high-throughput, thread-safe in-memory cache?',
    answer:
      'In simple terms: use a battle-tested concurrent map with eviction, not a handmade `HashMap` + big lock.\n\nDesign sketch:\n- **Store:** Caffeine (or similar) / `ConcurrentHashMap` with explicit bounds\n- **Concurrency:** CHM-style per-key compute; `computeIfAbsent` for single-flight loads\n- **Eviction:** size + time (expireAfterWrite/access); optional soft values only with eyes open\n- **Load:** cache-aside; protect stampede with single-flight / refreshAhead\n- **Consistency:** TTL as safety net; on write, invalidate (or version keys); accept staleness where business allows\n- **Metrics:** hit ratio, load latency, eviction count, size\n- **Memory:** estimate entry weight; harden against unbounded keys\n\nAvoid: global `synchronized`, unbounded maps, loading remote I/O while holding coarse locks. For multi-instance: Redis/local+pub-sub invalidation. Interview line: **bounded concurrent map + single-flight + metrics + explicit invalidation policy.**',
  },
  {
    question:
      'How would you debug a production issue where CPU is 100%, thread count is high, but throughput is low?',
    answer:
      'In simple terms: you are burning CPU without completing useful work — usually livelock-ish contention, GC thrash, spin/CAS storms, or pathological algorithms.\n\nPlaybook:\n1. **Confirm** — process CPU vs system, GC CPU vs mutator CPU (GC logs/JFR)\n2. **Thread dump / JFR** — stacks of `RUNNABLE` threads: tight loops, hot CAS, hash collisions, regex, JSON parse, encryption\n3. **GC** — allocation rate, frequent full GCs → CPU in GC, throughput collapse\n4. **Locks** — unfair barging + short hot sections can show high CPU with poor useful progress; check contended monitors\n5. **Pools** — oversized pools → context-switch storm; compare runnable count to cores\n6. **App logic** — retry storms, busy-wait, busy polling without backoff\n\nFixes depend on finding: reduce allocation, fix hot locks/false sharing, shrink pools, break retry amplification, fix algorithmic O(n²). Interview line: **high CPU + low throughput = wasted cycles — profile stacks and GC before scaling out.**',
  },
  {
    question:
      'You have 1,000 concurrent requests but only 20 downstream connections. How would you control concurrency and prevent resource exhaustion?',
    answer:
      'In simple terms: allow 1,000 requests to *exist*, but only 20 to *enter* the downstream section at once — queue or shed the rest with deadlines.\n\nPattern:\n- Set HTTP client / JDBC pool **max connections = 20** (truth source)\n- Add a **Semaphore(20)** (or Resilience4j bulkhead) around the call for explicit app-level limiting\n- Use **bounded queues** + timeout on acquire (`tryAcquire(50, ms)` → 503/fallback)\n- Apply **timeouts** on the downstream call itself\n- Prefer **virtual threads** for waiting request tasks *if* you still bound the 20 permits — unlimited virtual threads without a semaphore will still stampede the pool’s wait queue and memory\n- Metrics: permit wait time, rejects, pool active, downstream p99\n- Optional: queue requests fairly, degrade features, cache, or async the work off the request path\n\nInterview line: **decouple request concurrency from dependency concurrency — bulkhead at 20, never at 1,000.**',
  },
];
