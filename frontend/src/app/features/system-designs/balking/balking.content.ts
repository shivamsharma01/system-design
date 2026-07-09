import { DesignContent } from '../../../shared/models';
import { BALKING_META } from './balking.meta';

const content: DesignContent = {
  meta: BALKING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Balking** means: if an object is **not in the right state** to run an operation, the call **returns immediately** (balks) instead of waiting or forcing the work. It is a concurrency / state pattern for **fail-fast, idempotent** “start only if idle” behavior.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Contrast',
          body: '**Guarded Suspension** waits until the state is ready. **Balking** refuses and returns now. Choose based on whether the caller can usefully wait.',
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
          body: 'An **elevator “close door” button** while the door is already closed: the request is ignored. Or a washing machine “start” while a cycle is running — it balks rather than queueing a second start.',
        },
        {
          type: 'mermaid',
          caption: 'Check state; act or return.',
          definition: `flowchart TD
  Call[startJob] --> Check{jobRunning?}
  Check -->|yes| Balk[Return immediately]
  Check -->|no| Run[Set running and execute]`,
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
            ['Autosave', 'Skip save if a save is already in progress'],
            ['Job runners', 'Cron trigger ignored if previous run still active'],
            ['Devices', 'Ignore “start” while motor already spinning'],
            ['UI', 'Disable / no-op double-submit on checkout button'],
            ['Connections', 'connect() returns if already connected'],
            ['Feature flags', 'Refresh skipped if refresh already underway'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'AutoSaveService.java',
          code: `public class AutoSaveService {
  private boolean saving;

  /** Balk if a save is already running. */
  public synchronized boolean saveIfIdle(Document doc) {
    if (saving) {
      return false; // balk
    }
    saving = true;
    try {
      persist(doc);
      return true;
    } finally {
      saving = false;
      notifyAll(); // in case waiters use guarded suspension elsewhere
    }
  }

  private void persist(Document doc) {
    // write to disk / S3
  }
}`,
        },
        {
          type: 'markdown',
          value:
            'Modern variant with `AtomicBoolean` for a single flag without holding a monitor during I/O:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'JobGuard.java',
          code: `import java.util.concurrent.atomic.AtomicBoolean;

public class JobGuard {
  private final AtomicBoolean running = new AtomicBoolean(false);

  public boolean runExclusive(Runnable job) {
    if (!running.compareAndSet(false, true)) {
      return false; // balk — already running
    }
    try {
      job.run();
      return true;
    } finally {
      running.set(false);
    }
  }
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Simple, fail-fast, avoids duplicate work.',
            'Natural for idempotent “start” operations.',
            'Prevents unbounded wait queues for unneeded calls.',
          ],
          cons: [
            'Callers must handle the “did nothing” outcome.',
            'Can drop work if you actually needed it queued.',
            'Easy to confuse with “silent failure” if return value is ignored.',
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
              question: 'What is the Balking pattern?',
              answer:
                'Execute an action only if the object is in an appropriate state; otherwise **return immediately** without waiting or performing the action.',
            },
            {
              question: 'Balking vs Guarded Suspension?',
              answer:
                'Balking: **don’t wait** — return now. Guarded Suspension: **wait** until the guard condition becomes true, then proceed.',
            },
            {
              question: 'When would you choose Balking?',
              answer:
                'When duplicate or out-of-state calls are useless or harmful (double start, redundant autosave) and the caller can tolerate a no-op.',
            },
            {
              question: 'How do you signal that work was skipped?',
              answer:
                'Return a `boolean`, optional result, or specific status code. Silent void methods hide balks and confuse callers.',
            },
            {
              question: 'Is compareAndSet a form of Balking?',
              answer:
                'Yes — `compareAndSet(false, true)` is a lock-free balk: if another thread already set the flag, you skip. Common for single-flight jobs.',
            },
            {
              question: 'LLD example?',
              answer:
                'Document editor autosave; or a payment “capture” that balks if capture already completed — pairs well with idempotency keys.',
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
          body: '1. Balk = **act only if state allows**, else return now.\n2. Opposite of waiting (Guarded Suspension).\n3. Real uses: **autosave, single-flight jobs, device start**.\n4. Always surface the balked outcome to callers.',
        },
      ],
    },
  ],
};

export default content;
