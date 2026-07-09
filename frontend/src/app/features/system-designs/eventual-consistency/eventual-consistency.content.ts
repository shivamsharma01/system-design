import { DesignContent } from '../../../shared/models';
import { EVENTUAL_CONSISTENCY_META } from './eventual-consistency.meta';

const content: DesignContent = {
  meta: EVENTUAL_CONSISTENCY_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Eventual Consistency** means that if no new updates occur, all **replicas** of data will **converge to the same state** over time — but reads immediately after a write may see **stale** values. It is the consistency side of the **CAP theorem** trade-off: under network partitions, systems often choose **availability** and accept temporary inconsistency.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Not "maybe wrong forever"',
          body: 'Eventual does not mean random — it means **temporary skew** between replicas until replication/async propagation completes. Strong consistency waits; eventual proceeds.',
        },
        {
          type: 'table',
          caption: 'Consistency spectrum.',
          headers: ['Model', 'Read behavior'],
          rows: [
            ['Strong / linearizable', 'Always see latest write'],
            ['Eventual', 'May read stale; converges later'],
            ['Read-your-writes', 'You see your own updates; others may lag'],
            ['Monotonic reads', 'Never go backward in time on one client'],
          ],
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
          body: '**Bank balance across ATM networks**: you deposit cash at Branch A; Branch B\'s ATM may show the old balance for a minute until the core ledger replicates — your money is not lost, the views **eventually** match. Mobile apps often show "pending" until sync completes.',
        },
        {
          type: 'mermaid',
          caption: 'Write on primary; replicas lag then converge.',
          definition: `sequenceDiagram
  participant W as Writer
  participant P as Primary
  participant R1 as Replica 1
  participant R2 as Replica 2
  participant Reader as Reader
  W->>P: UPDATE balance = 1000
  P-->>R1: replicate (async)
  P-->>R2: replicate (async)
  Reader->>R2: GET balance
  R2-->>Reader: 900 (stale)
  Note over R1,R2: seconds later → both return 1000`,
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
            ['DynamoDB / Cassandra', 'Quorum writes; reads may be stale without strongly consistent read flag'],
            ['DNS', 'TTL propagation — old IP until caches expire globally'],
            ['CDN', 'Cache invalidation — edge may serve stale asset briefly'],
            ['Social feeds', 'New post visible to author before all followers'],
            ['Shopping cart', 'Cross-device cart merge with short lag'],
            ['Search indexes', 'Product catalog lags OLTP DB until indexer catches up'],
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
            'Document **consistency guarantees per read path**. Use **version vectors / timestamps** for conflict detection, **read-your-writes** via sticky sessions or routing reads to primary after write, and UX patterns ("Processing…", optimistic UI with rollback). In EDA, projections are **eventually consistent** with the event log by design.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'EventualConsistencyReads.java',
          code: `@Service
public class AccountService {
  private final AccountRepository primary;   // writer DB
  private final AccountReadRepository replica; // async replica

  /** After transfer, user expects to see new balance — read-your-writes. */
  public AccountView getAfterWrite(UUID accountId, UUID sessionId) {
    if (stickySession.wroteRecently(sessionId, accountId)) {
      return primary.findView(accountId); // strong for this user
    }
    return replica.findView(accountId);   // may lag — OK for dashboards
  }

  @Transactional
  public void transfer(UUID from, UUID to, BigDecimal amount) {
    primary.debit(from, amount);
    primary.credit(to, amount);
    stickySession.recordWrite(sessionId, from);
    stickySession.recordWrite(sessionId, to);
    eventBus.publish(new TransferCompleted(from, to, amount, Instant.now()));
  }
}

// Cassandra: consistency level QUORUM write, ONE read → eventual by default`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Read-your-writes caveats',
          body: 'Sticky routing breaks if user switches device/region. **Session tokens** with write version, or client-side "last known version" checks, help — but true global RYW needs coordination cost.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Higher availability and lower write latency at scale.',
            'Geo-distributed reads from local replicas.',
            'Natural fit for async EDA and CQRS projections.',
          ],
          cons: [
            'Stale reads confuse users without careful UX.',
            'Conflict resolution needed on concurrent writes.',
            'Harder reasoning and testing than strong consistency.',
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
              question: 'CAP theorem — pick two?',
              answer:
                'Under **partition**, choose **CP** (consistent, may reject writes) or **AP** (available, eventual consistency). CA only when no partition — not realistic in distributed systems.',
            },
            {
              question: 'Eventual vs strong consistency — when which?',
              answer:
                '**Strong** for money inventory, uniqueness constraints. **Eventual** for feeds, analytics, search indexes, metrics — where stale reads are tolerable briefly.',
            },
            {
              question: 'What is read-your-writes?',
              answer:
                'After you write, **your** next read sees the update — even if other replicas lag. Others may still see old data. Implemented via primary read-after-write or session stickiness.',
            },
            {
              question: 'How do replicas converge?',
              answer:
                'Async replication log, gossip protocols, anti-entropy repair (Cassandra), or CRDT merge rules — all paths lead to same state if updates stop.',
            },
            {
              question: 'Eventual consistency in microservices?',
              answer:
                'Service A emits event; Service B updates its DB seconds later. Cross-service reads are stale until propagation — sagas and UI must reflect **in-progress** states.',
            },
            {
              question: 'How to detect stale reads in UX?',
              answer:
                'Show **timestamps**, "syncing" badges, ETags, refresh buttons, and optimistic updates with server reconciliation on conflict.',
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
          body: '1. Replicas **converge over time** — reads may be temporarily stale.\n2. CAP: often choose **availability + eventual** under partition.\n3. Offer **read-your-writes** where users expect their own updates.\n4. Real uses: **Cassandra, DynamoDB, CDNs, EDA projections, search indexes**.',
        },
      ],
    },
  ],
};

export default content;
