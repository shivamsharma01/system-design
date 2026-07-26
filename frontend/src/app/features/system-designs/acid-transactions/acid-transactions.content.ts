import { DesignContent } from '../../../shared/models';
import { ACID_TRANSACTIONS_META } from './acid-transactions.meta';

const content: DesignContent = {
  meta: ACID_TRANSACTIONS_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**ACID** defines the contract for a reliable database transaction: **Atomicity**, **Consistency**, **Isolation**, and **Durability**. Classic example: a bank transfer must debit and credit together or not at all.\n\nAcross services, full ACID is hard — see [Two-Phase Commit](/designs/two-phase-commit) and [Saga](/designs/saga).',
        },
        {
          type: 'image',
          src: 'assets/article-images/acid-transactions/01-bank-transfer.png',
          alt: 'Bank transfer requiring debit and credit as one atomic unit',
          caption:
            'Multi-step money movement needs transactional guarantees. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'atomicity',
      title: '1. Atomicity',
      blocks: [
        {
          type: 'markdown',
          value:
            'A transaction is **all-or-nothing**. If any step fails, the DB rolls back to the prior state.\n\n**Implementation:** write-ahead logs (WAL) record intended changes; on crash recovery, incomplete transactions are undone. Commit/rollback protocols mark the transaction durable or aborted.',
        },
        {
          type: 'image',
          src: 'assets/article-images/acid-transactions/02-atomicity.png',
          alt: 'Atomicity illustrated with commit versus rollback of a multi-step transaction',
          caption:
            'Commit succeeds entirely, or rollback undoes everything. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'consistency',
      title: '2. Consistency',
      blocks: [
        {
          type: 'markdown',
          value:
            'A committed transaction leaves the database in a **valid state** per defined rules (constraints, invariants). Example: order quantity cannot exceed `stock_quantity`.\n\nEnforced via schema constraints (PK/FK/CHECK), triggers/procedures, and application checks.',
        },
        {
          type: 'image',
          src: 'assets/article-images/acid-transactions/03-consistency.png',
          alt: 'Consistency keeping stock and order quantities valid after a transaction',
          caption:
            'Invariants must hold after commit. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'isolation',
      title: '3. Isolation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Concurrent transactions should not **interfere** incorrectly. Classic anomalies:\n\n- **Dirty read** — read uncommitted data that may roll back\n- **Non-repeatable read** — same row returns different values in one txn\n- **Phantom read** — new rows appear matching a prior query predicate',
        },
        {
          type: 'image',
          src: 'assets/article-images/acid-transactions/04-isolation.png',
          alt: 'Isolation preventing concurrent transactions from interfering',
          caption:
            'Isolation bounds concurrent interference. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/acid-transactions/05-dirty-read.png',
          alt: 'Dirty read anomaly where one transaction reads uncommitted data',
          caption: 'Dirty read. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/acid-transactions/06-non-repeatable-read.png',
          alt: 'Non-repeatable read anomaly where a row changes between reads',
          caption: 'Non-repeatable read. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/acid-transactions/07-phantom-read.png',
          alt: 'Phantom read anomaly where new matching rows appear',
          caption: 'Phantom read. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '**Isolation levels** (weakest → strongest): Read Uncommitted → Read Committed → Repeatable Read → Serializable.\n\nEnforcement: **locking**, **MVCC** (multi-version concurrency control), **snapshot isolation**. Note: Snapshot Isolation prevents dirty/non-repeatable reads but can still allow **write skew** — Serializable (or explicit locking) closes that gap.',
        },
        {
          type: 'image',
          src: 'assets/article-images/acid-transactions/08-isolation-levels.png',
          alt: 'Table of isolation levels and which anomalies each prevents',
          caption:
            'Isolation levels vs anomalies. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'durability',
      title: '4. Durability',
      blocks: [
        {
          type: 'markdown',
          value:
            'Once committed, changes **survive crashes**. Typical path: write intent to **WAL** and flush to durable storage → mark commit → later flush pages to main data files. Strengthened by **replication** and **backups**.',
        },
      ],
    },
    {
      id: 'java-spring',
      title: 'Java / Spring Notes',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'TransferService.java',
          code: `@Service
public class TransferService {
  @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
  public void transfer(long fromId, long toId, BigDecimal amount) {
    Account from = accounts.lockById(fromId); // SELECT … FOR UPDATE if needed
    Account to = accounts.lockById(toId);
    if (from.getBalance().compareTo(amount) < 0) {
      throw new InsufficientFundsException();
    }
    from.debit(amount);
    to.credit(amount);
    // commit on method success; rollback on unchecked/rollbackFor exceptions
  }
}`,
        },
        {
          type: 'markdown',
          value:
            '- Default Spring isolation is usually **READ_COMMITTED** (DB-dependent).\n- Raise to `REPEATABLE_READ` / `SERIALIZABLE` only where anomalies matter — higher contention.\n- Prefer short transactions; don’t call remote HTTP inside `@Transactional`.\n- JDBC/`EntityManager` share the same Spring transaction when configured.',
        },
      ],
    },
    {
      id: 'source',
      title: 'Source',
      blocks: [
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “What are ACID Transactions in Databases?,” with Spring `@Transactional` notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
