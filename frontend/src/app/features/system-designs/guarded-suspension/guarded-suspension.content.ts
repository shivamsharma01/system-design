import { DesignContent } from '../../../shared/models';
import { GUARDED_SUSPENSION_META } from './guarded-suspension.meta';

const content: DesignContent = {
  meta: GUARDED_SUSPENSION_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Guarded Suspension** suspends a thread until a **precondition (guard)** is true, then proceeds. In Java this is typically `wait`/`notify` or `Condition.await`/`signal` inside a monitor — the foundation of bounded buffers and “wait until ready” APIs.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Always wait in a loop',
          body: 'Guards must be re-checked after wakeups (spurious wakeups and multiple waiters). Pattern: `while (!ready) wait();`',
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
          body: 'A **drive-through window**: you wait until the attendant signals your order is ready. You do not leave (balk) and you do not spin the car in circles checking every millisecond — you suspend until notified.',
        },
        {
          type: 'mermaid',
          caption: 'Wait until guard is satisfied.',
          definition: `sequenceDiagram
  participant C as Consumer
  participant B as Buffer
  participant P as Producer
  C->>B: take()
  Note over C,B: buffer empty → wait
  P->>B: put(item)
  B-->>C: notify
  C->>B: take item`,
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
            ['Bounded buffers', '`BlockingQueue.take` / `put` internals'],
            ['Thread pools', 'Workers wait for tasks; submitters wait if saturated (policy-dependent)'],
            ['Connection pools', 'Borrow waits until a connection is free'],
            ['Barriers', 'Wait until N peers arrive'],
            ['Init gates', 'Requests wait until warm-up / leader election completes'],
            ['Hand-offs', 'Exchanger / synchronous queues'],
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
          value: 'Classic bounded buffer — both put and take use guarded suspension:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'GuardedBuffer.java',
          code: `public class GuardedBuffer<T> {
  private final Object[] items;
  private int count;
  private int putIdx;
  private int takeIdx;

  public GuardedBuffer(int capacity) {
    this.items = new Object[capacity];
  }

  public synchronized void put(T item) throws InterruptedException {
    while (count == items.length) { // guard: not full
      wait();
    }
    items[putIdx] = item;
    putIdx = (putIdx + 1) % items.length;
    count++;
    notifyAll(); // wake takers
  }

  @SuppressWarnings("unchecked")
  public synchronized T take() throws InterruptedException {
    while (count == 0) { // guard: not empty
      wait();
    }
    T item = (T) items[takeIdx];
    items[takeIdx] = null;
    takeIdx = (takeIdx + 1) % items.length;
    count--;
    notifyAll(); // wake putters
    return item;
  }
}`,
        },
        {
          type: 'markdown',
          value: 'Prefer `ReentrantLock` + `Condition` when you need separate “notEmpty” / “notFull” wait sets:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ConditionHint.java',
          code: `// sketch
lock.lock();
try {
  while (!ready) {
    condition.await();
  }
  // proceed
} finally {
  lock.unlock();
}
// signalling side:
lock.lock();
try {
  ready = true;
  condition.signalAll();
} finally {
  lock.unlock();
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Correct way to wait for state without busy-spinning.',
            'Foundation of queues, pools, and hand-offs.',
            'Clear guard predicates document invariants.',
          ],
          cons: [
            'Easy to misuse (`if` instead of `while`, missed notify).',
            '`notifyAll` can cause thundering herd; prefer Conditions.',
            'Holding locks while waiting for external I/O is a deadlock risk — wait only on monitor state.',
          ],
        },
      ],
    },
    {
      id: 'vs-related',
      title: 'Guarded Suspension vs Balking vs BlockingQueue',
      blocks: [
        {
          type: 'featureComparison',
          columns: ['Guarded Suspension', 'Balking', 'BlockingQueue'],
          rows: [
            {
              feature: 'If not ready',
              values: ['Wait', 'Return now', 'Wait (put/take)'],
            },
            {
              feature: 'Typical API',
              values: ['wait/notify, Condition', 'boolean / no-op', 'put / take / offer'],
            },
            {
              feature: 'Use when',
              values: ['Caller must proceed eventually', 'Duplicate call is useless', 'Standard producer-consumer'],
            },
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
              question: 'Explain Guarded Suspension.',
              answer:
                'A thread checks a **guard condition**; if false, it **waits** on a monitor/condition variable until another thread changes state and signals. Then it re-checks the guard and proceeds.',
            },
            {
              question: 'Why while (!ready) wait() instead of if?',
              answer:
                '**Spurious wakeups** and multiple waiters mean you may wake when the condition is still false. The loop re-validates the invariant before continuing.',
            },
            {
              question: 'Guarded Suspension vs Balking?',
              answer:
                'Guarded Suspension **waits** for the right state. Balking **gives up immediately**. Same guard idea; different policy when the guard fails.',
            },
            {
              question: 'How does BlockingQueue use this?',
              answer:
                '`take` waits while empty; `put` waits while full. That is guarded suspension packaged as a queue — the usual Producer-Consumer building block.',
            },
            {
              question: 'notify vs notifyAll / signal vs signalAll?',
              answer:
                '`notify` wakes one waiter (can be wrong waiter → deadlock/starvation risks). `notifyAll` is safer but can stampede. Separate `Condition`s for notEmpty/notFull are cleaner.',
            },
            {
              question: 'LLD example?',
              answer:
                'Connection pool `borrow()` waits until a connection is free; or a prep station waits until ingredients arrive before cooking — same guard/wait/signal structure as a bounded buffer.',
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
          body: '1. Wait until a **guard** is true, then act.\n2. Always **`while (!guard) wait()`**.\n3. Real uses: **queues, pools, barriers, hand-offs**.\n4. Contrast with Balking; relate to `BlockingQueue` in interviews.',
        },
      ],
    },
  ],
};

export default content;
