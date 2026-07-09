import { DesignContent } from '../../../shared/models';
import { ACTOR_MODEL_META } from './actor-model.meta';

const content: DesignContent = {
  meta: ACTOR_MODEL_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Actor Model** structures concurrency as many lightweight **actors**. Each actor owns private state, processes **one message at a time** from its mailbox, and talks to others only by **sending messages** — never by sharing mutable memory.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Why it exists',
          body: 'Shared-memory locks do not scale well for complex concurrent domains. Actors turn concurrency into **message passing + isolation**, which maps cleanly to distributed systems too.',
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
          body: 'A **restaurant kitchen station**: each chef (actor) has their own mise en place (state). Orders arrive as tickets (messages). Chefs do not reach into each other’s pans — they pass plates or call out requests.',
        },
        {
          type: 'mermaid',
          caption: 'Actors communicate via mailboxes.',
          definition: `flowchart LR
  A[OrderActor] -->|PlaceOrder| B[InventoryActor]
  A -->|Charge| C[PaymentActor]
  B -->|Reserved| A
  C -->|Paid| A`,
        },
        {
          type: 'table',
          headers: ['Piece', 'Role'],
          rows: [
            ['Actor', 'Identity + behavior + private state'],
            ['Mailbox', 'Inbound message queue'],
            ['Message', 'Immutable (ideally) unit of communication'],
            ['Dispatcher', 'Schedules which actor runs on which thread'],
          ],
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
            ['Telecom / chat', 'Erlang/OTP powering WhatsApp-style messaging'],
            ['JVM systems', 'Akka / Pekko for event-driven backends'],
            ['Games', 'Per-entity actors for NPCs or sessions'],
            ['IoT', 'Device actors handling telemetry streams'],
            ['Finance', 'Per-account actors serializing balance updates'],
            ['UI / desktop', 'Actor-like message loops (e.g. historical Smalltalk, modern variants)'],
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
            'Minimal sketch: one actor processes messages sequentially. Production systems use Akka, Erlang, or Orleans — this shows the idea.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SimpleActor.java',
          code: `import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.function.Consumer;

public final class SimpleActor<M> {
  private final BlockingQueue<M> mailbox = new LinkedBlockingQueue<>();
  private final Thread thread;

  public SimpleActor(Consumer<M> behavior) {
    this.thread = new Thread(() -> {
      try {
        while (true) {
          M msg = mailbox.take(); // one at a time
          behavior.accept(msg);
        }
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      }
    }, "actor");
    this.thread.setDaemon(true);
    this.thread.start();
  }

  public void tell(M message) {
    mailbox.offer(message);
  }
}

// per-user cart actor — no shared mutable cart map across threads
record AddItem(String sku, int qty) {}
record Checkout(String userId) {}

SimpleActor<Object> cartActor = new SimpleActor<>(msg -> {
  if (msg instanceof AddItem add) {
    // mutate private cart state only here
  } else if (msg instanceof Checkout checkout) {
    // serialize checkout for this cart
  }
});

cartActor.tell(new AddItem("sku-1", 2));`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Supervision',
          body: 'Frameworks add **supervisors** that restart failed child actors. That “let it crash” culture (Erlang) is a major reason actors shine in long-running systems.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'No shared mutable state → fewer lock bugs.',
            'Natural fit for distribution (location transparency).',
            'Per-entity serialization without global locks.',
          ],
          cons: [
            'Debugging async message flows is harder.',
            'Overhead vs simple synchronized code for tiny problems.',
            'Need care with mailbox growth and backpressure.',
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
              question: 'What is the Actor Model?',
              answer:
                'Concurrency via isolated actors that **own state**, process **one message at a time**, and communicate only by **async messages** — not shared memory.',
            },
            {
              question: 'How does an actor avoid race conditions on its state?',
              answer:
                'Only the actor’s single-threaded message loop mutates its state. External threads never touch that memory; they only `tell` messages.',
            },
            {
              question: 'Actor vs thread pool + shared queue?',
              answer:
                'A pool runs tasks that may still share data structures. Actors **encapsulate state** per identity (user, order, device). You can implement actors *on top of* a dispatcher/thread pool.',
            },
            {
              question: 'Where have you seen actors in industry?',
              answer:
                '**Erlang/OTP** (telecom, WhatsApp), **Akka/Pekko** on the JVM, **Orleans** (.NET virtual actors), and many game/session servers modeled as per-connection actors.',
            },
            {
              question: 'What is location transparency?',
              answer:
                'Code sends a message to an actor reference without caring whether the actor is local or remote. The runtime routes it — key for scaling out.',
            },
            {
              question: 'LLD angle for e-commerce?',
              answer:
                'One **OrderActor** or **InventorySkuActor** per aggregate so concurrent updates to the same SKU are serialized via the mailbox, avoiding lost updates without a global lock.',
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
          body: '1. Actors = **isolated state + mailbox + messages**.\n2. Real uses: **Erlang/WhatsApp, Akka, per-entity servers**.\n3. Great for avoiding shared-memory races at scale.\n4. Discuss supervision, backpressure, and vs thread pools in interviews.',
        },
      ],
    },
  ],
};

export default content;
