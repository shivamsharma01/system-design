import { DesignContent } from '../../../shared/models';
import { CAP_PACELC_META } from './cap-pacelc.meta';

const content: DesignContent = {
  meta: CAP_PACELC_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **CAP theorem** (Brewer, formalized by Gilbert & Lynch) says that a distributed data store cannot simultaneously provide **Consistency**, **Availability**, and **Partition tolerance** during a network partition. On real networks, **partitions happen**, so systems choose between **CP** (refuse some requests to stay consistent) and **AP** (keep serving, risk stale or divergent reads). **PACELC** extends this: if there is a Partition, choose A or C; **Else** (normal operation) choose **Latency** or **Consistency**.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Interview myth: “pick 2 of 3”',
          body: 'Saying “CAP means pick any two of C, A, P” is **wrong**. You cannot turn off network partitions in a distributed system. The real choice under partition is **C or A**. Outside partitions, CAP is silent — that is why **PACELC** matters for day-to-day latency vs consistency trade-offs.',
        },
        {
          type: 'table',
          caption: 'CAP letters in one line.',
          headers: ['Letter', 'Meaning', 'Failure mode if sacrificed'],
          rows: [
            ['C', 'Linearizability / single up-to-date value for a key', 'Clients may see stale or conflicting values'],
            ['A', 'Every non-failing node answers in finite time', 'Some requests error or block until partition heals'],
            ['P', 'System continues despite message loss between nodes', 'Not optional on WAN / multi-AZ designs'],
          ],
        },
      ],
    },
    {
      id: 'concept',
      title: 'Concept and PACELC',
      blocks: [
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'Two bank branches lose the phone line (**partition**). **CP**: tell customers “system unavailable” until the line is back so balances stay correct. **AP**: both branches keep cashing checks and reconcile later — available, but temporarily inconsistent. On a normal day (**no partition**), do you wait for a quorum write (**EC**, prefer consistency) or acknowledge locally for speed (**EL**, prefer latency)?',
        },
        {
          type: 'mermaid',
          caption: 'PACELC decision tree.',
          definition: `flowchart TD
  Start[Distributed store] --> P{Partition?}
  P -->|Yes| PAC{Prefer?}
  PAC -->|Availability| AP[AP: serve possibly stale]
  PAC -->|Consistency| CP[CP: reject or block]
  P -->|No| ELC{Prefer?}
  ELC -->|Latency| EL[EL: fast local ack]
  ELC -->|Consistency| EC[EC: sync / quorum / consensus]`,
        },
        {
          type: 'markdown',
          value:
            '**PACELC labels** you will hear in interviews:\n\n- **AP + EL** — Dynamo, Cassandra, Riak: available under partition; otherwise favor low latency (eventual / tunable consistency).\n- **CP + EC** — classic single-primary Postgres (or Raft leader): refuse writes on minority side; otherwise prioritize strong consistency over latency.\n- **CP with TrueTime** — Spanner: external consistency via synchronized clocks; still CP under partition, but designed so the “Else Consistency” path stays practical at global scale.',
        },
      ],
    },
    {
      id: 'examples',
      title: 'Systems in practice',
      blocks: [
        {
          type: 'table',
          caption: 'Where popular stores land (simplified).',
          headers: ['System', 'Under partition', 'Else (normal)', 'Notes'],
          rows: [
            ['Dynamo / Cassandra', 'AP', 'EL (tunable)', 'Quorum R+W can look “CP-ish” but not linearizable by default'],
            ['PostgreSQL primary', 'CP (minority refuses writes)', 'EC', 'Single writer; replicas may lag for reads'],
            ['etcd / ZooKeeper', 'CP', 'EC', 'Raft/Zab; minority is unavailable for writes'],
            ['Cloud Spanner', 'CP', 'EC (+ TrueTime)', 'External consistency; partitions still force unavailability'],
            ['MongoDB (default)', 'CP-leaning', 'EC-leaning', 'Primary election; stale secondary reads are opt-in'],
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Tunable consistency is not a CAP escape hatch',
          body: 'Cassandra’s `ONE` / `QUORUM` / `ALL` change **how often** you observe inconsistency and **latency**, not the theorem. Under a hard partition, a minority that still accepts writes with low consistency is making an **AP** choice.',
        },
      ],
    },
    {
      id: 'consistency-models',
      title: 'Consistency models (brief)',
      blocks: [
        {
          type: 'table',
          caption: 'Models interviewers expect you to name.',
          headers: ['Model', 'Guarantee', 'Typical use'],
          rows: [
            ['Strong / linearizable', 'Ops appear atomic in real-time order', 'Money transfer, inventory decrement'],
            ['Sequential', 'All see same order of ops (not necessarily real-time)', 'Some consensus / primary systems'],
            ['Causal', 'If A caused B, everyone sees A before B', 'Social feeds, collaborative edits'],
            ['Read-your-writes', 'You always see your own updates', 'User profile after save'],
            ['Eventual', 'Replicas converge if updates stop', 'Caches, DNS, Dynamo-style stores'],
          ],
        },
        {
          type: 'markdown',
          value:
            'CAP “Consistency” usually means **linearizability** of a single register. Product language (“consistent enough”) is weaker — always ask **which model** and **for which operations** (read path vs write path).',
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
              question: 'State the CAP theorem correctly.',
              answer:
                'In a distributed system that must tolerate **network partitions**, you cannot provide both **linearizable consistency** and **availability** at the same time. You choose **CP** or **AP** when P occurs. You do not “drop P” on real networks.',
            },
            {
              question: 'Why is “pick 2 of 3” a bad CAP answer?',
              answer:
                'It implies **P is optional**. Partitions are a property of networks. The meaningful trade-off under failure is **C vs A**. CAP also says nothing about the happy path — use **PACELC** for latency vs consistency when healthy.',
            },
            {
              question: 'What does PACELC add?',
              answer:
                '**If Partition → A or C; Else → Latency or Consistency.** Explains why Cassandra is often **AP/EL** and Spanner/Postgres-style systems **CP/EC**, even when both “care about consistency.”',
            },
            {
              question: 'Is Cassandra always AP?',
              answer:
                'Default posture is **AP + eventual**, but **quorum** settings raise the bar. Under partition, a minority that cannot reach quorum will fail those ops — looking more CP for that request. Still not a full linearizable store by default.',
            },
            {
              question: 'How is Spanner CP yet globally available in practice?',
              answer:
                'Spanner uses **Paxos/TrueTime** for external consistency. During partitions, **minority replicas cannot serve** conflicting writes (CP). “Always available” marketing means careful placement and fast failover, not violating CAP.',
            },
            {
              question: 'Eventual vs causal consistency?',
              answer:
                '**Eventual**: replicas converge eventually; no ordering promises while converging. **Causal**: if B depends on A, no one sees B without A. Causal is stronger and often enough for social/collaboration without full linearizability.',
            },
            {
              question: 'Design choice: shopping cart vs payment ledger?',
              answer:
                'Cart can be **AP/EL** (merge concurrent updates). Ledger / capture must be **CP/EC** (or a single source of truth with careful reconciliation) — wrong availability here means double-spend risk.',
            },
            {
              question: 'What is read-your-writes and how do you get it?',
              answer:
                'After a client writes, subsequent reads from that client see the write. Techniques: sticky sessions to primary, **session tokens** / version vectors, read-your-writes from the same replica set, or monotically increasing timestamps.',
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
          body: '1. Under partition, choose **C or A** — P is not optional.\n2. **PACELC** covers the healthy path: **L vs C**.\n3. Dynamo/Cassandra ≈ **AP+EL**; Postgres/Raft ≈ **CP+EC**; Spanner ≈ **CP** with TrueTime.\n4. Name **consistency models** precisely — strong, causal, read-your-writes, eventual.\n5. Reject the “pick 2 of 3” slogan in interviews.',
        },
      ],
    },
  ],
};

export default content;
