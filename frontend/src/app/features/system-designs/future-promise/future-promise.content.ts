import { DesignContent } from '../../../shared/models';
import { FUTURE_PROMISE_META } from './future-promise.meta';

const content: DesignContent = {
  meta: FUTURE_PROMISE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **Future** (or **Promise**) is a placeholder for a result that will be available **later**. Callers start async work and either **block**, **poll**, or — better — **compose callbacks / continuations** when the value (or error) arrives.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Naming',
          body: 'In Java, `Future` is the read side; `CompletableFuture` is both future and promise (you can complete it). In JS, `Promise` is the common name. Same idea: deferred result.',
        },
      ],
    },
    {
      id: 'concept',
      title: 'Concept and analogy',
      blocks: [
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A **restaurant buzzer**: you place an order (start async work), get a buzzer (future), and continue chatting. When it lights up, the meal is ready (future completes). You did not stand at the kitchen window blocking the whole time.',
        },
        {
          type: 'mermaid',
          caption: 'Compose async steps.',
          definition: `sequenceDiagram
  participant C as Caller
  participant F as CompletableFuture
  participant S as Service
  C->>F: supplyAsync(fetchUser)
  F->>S: run on pool
  S-->>F: User
  F->>F: thenCompose(fetchOrders)
  F-->>C: List of Orders`,
        },
      ],
    },
    {
      id: 'where-used',
      title: 'Where it is used',
      blocks: [
        {
          type: 'table',
          headers: ['Domain', 'Example'],
          rows: [
            ['Java', '`CompletableFuture`, Guava `ListenableFuture`'],
            ['Web clients', 'Async HTTP calls composed into one response'],
            ['Mobile / UI', 'Promises/Futures off the main thread'],
            ['RPC', 'gRPC async stubs returning futures'],
            ['Data pipelines', 'Fan-out/fan-in of parallel stage results'],
            ['JS / TS', '`async`/`await` over Promises'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Compose user profile + orders without blocking the calling thread on each hop:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'OrderDashboard.java',
          code: `import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

public class OrderDashboard {
  private final UserClient users;
  private final OrderClient orders;
  private final Executor pool;

  public OrderDashboard(UserClient users, OrderClient orders, Executor pool) {
    this.users = users;
    this.orders = orders;
    this.pool = pool;
  }

  public CompletableFuture<Dashboard> load(String userId) {
    CompletableFuture<User> userF =
        CompletableFuture.supplyAsync(() -> users.find(userId), pool);

    CompletableFuture<List<Order>> ordersF =
        CompletableFuture.supplyAsync(() -> orders.listFor(userId), pool);

    return userF.thenCombine(ordersF, Dashboard::new)
        .orTimeout(2, java.util.concurrent.TimeUnit.SECONDS)
        .exceptionally(ex -> Dashboard.empty(userId));
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Avoid `.get()` on request threads',
          body: 'Blocking with `future.get()` on a Tomcat/Netty event thread can deadlock or exhaust the pool. Prefer non-blocking composition or dedicated bounded pools for blocking joins.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Express async workflows without deep callback nesting (`thenCompose`).',
            'Natural fan-out/fan-in with `allOf` / `thenCombine`.',
            'Errors can propagate as completed exceptionally.',
          ],
          cons: [
            'Harder stack traces; need careful exception handling.',
            'Easy to block accidentally and stall pools.',
            'Overkill for simple sequential local work.',
          ],
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      blocks: [
        {
          type: 'interviewQa',
          items: [
            {
              question: 'What is a Future / Promise?',
              answer:
                'An object representing a **result that is not ready yet**. Producers complete it with a value or error; consumers wait or register continuations.',
            },
            {
              question: 'Future vs thread?',
              answer:
                'A thread is an execution resource. A Future is a **handle to a result** — often produced by work running on a thread pool, but the concepts are separate.',
            },
            {
              question: 'thenApply vs thenCompose?',
              answer:
                '`thenApply` maps a value → value. `thenCompose` maps a value → **another Future** (flatMap). Use `thenCompose` to chain async calls without nesting futures.',
            },
            {
              question: 'How do you run two calls in parallel and merge?',
              answer:
                'Start both `CompletableFuture`s, then `thenCombine` or `allOf` + join. That is classic fan-out/fan-in.',
            },
            {
              question: 'What goes wrong with blocking get()?',
              answer:
                'You can exhaust the same pool that should complete the future (thread starvation deadlock), or block latency-sensitive request threads.',
            },
            {
              question: 'LLD / system design use?',
              answer:
                'Checkout aggregates inventory, payment, and fraud checks concurrently with futures, applies a timeout, and fails fast if any critical leg fails.',
            },
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'callout',
          variant: 'summary',
          title: 'Key takeaways',
          body: '1. Future/Promise = **deferred result** handle.\n2. Prefer **composition** over blocking `get()`.\n3. Real uses: **async HTTP, RPC, UI offload, fan-in**.\n4. Know `thenApply` vs `thenCompose` and timeout/error handling.',
        },
      ],
    },
  ],
};

export default content;
