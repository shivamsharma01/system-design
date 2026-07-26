import { DesignContent } from '../../../shared/models';
import { DATABASE_INDEXES_META } from './database-indexes.meta';

const content: DesignContent = {
  meta: DATABASE_INDEXES_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **database index** is a lookup structure that maps column values to row locations — like a book’s index pointing to page numbers — so the engine can **seek** instead of scanning every row.\n\nFor query-shape rules that keep indexes usable, see [SQL Interview — sargability](/designs/sql-interview#sargability).',
        },
        {
          type: 'image',
          src: 'assets/article-images/database-indexes/01-book-analogy.png',
          alt: 'Book index analogy for database indexes guiding readers to the right page',
          caption:
            'An index guides you to the right page without flipping every sheet. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'what-are-indexes',
      title: 'What Are Database Indexes?',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/database-indexes/02-what-is-index.png',
          alt: 'Index holding column values with pointers to table rows',
          caption:
            'Indexed values plus pointers to rows. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            "Without an index, finding `WHERE last_name = 'Smith'` may require a **full table scan**. With an index on `last_name`, the engine jumps to matching leaf entries and follows pointers to rows.",
        },
        {
          type: 'image',
          src: 'assets/article-images/database-indexes/03-table-example.png',
          alt: 'Example employees table used to illustrate creating an index',
          caption:
            'Example table before indexing. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/database-indexes/04-create-index.png',
          alt: 'CREATE INDEX statement on last_name column',
          caption:
            '`CREATE INDEX idx_last_name ON employees(last_name)`. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'how-they-work',
      title: 'How Indexes Work',
      blocks: [
        {
          type: 'markdown',
          value:
            '1. **Create** an index on chosen column(s).\n2. **Build** — scan the table, sort keys, store pointers.\n3. **Query** — planner decides whether to use the index.\n4. **Search** the index structure for matching keys.\n5. **Fetch** rows via pointers (or serve from a covering index).',
        },
        {
          type: 'image',
          src: 'assets/article-images/database-indexes/05-how-indexes-work.png',
          alt: 'Steps from index creation through query execution and data retrieval',
          caption:
            'Create → build → query → seek → fetch. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'bestPractices',
          title: 'Benefits',
          practices: [
            '**Faster reads** on selective predicates and joins.',
            '**Sorted access** for ORDER BY / GROUP BY when the index matches.',
            '**Uniqueness** enforcement (unique indexes / primary keys).',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Write cost',
          body: 'Every INSERT/UPDATE/DELETE must maintain indexes. Over-indexing slows writes and bloats storage — index what queries actually use.',
        },
      ],
    },
    {
      id: 'types',
      title: 'Types of Indexes',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/database-indexes/06-index-types.png',
          alt: 'Overview of different database index types',
          caption: 'Common index types. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '- **Clustered** — determines physical row order (one per table in many engines).\n- **Non-clustered / secondary** — separate structure with pointers to rows.\n- **Unique** — enforces uniqueness.\n- **Composite** — multiple columns; **leftmost prefix** matters for matching.\n- **Covering** — includes all columns the query needs (index-only scan).\n- **Bitmap** — great for low-cardinality columns (analytics).\n- **Hash** — fast equality lookups; weak for ranges.\n- **Full-text** — tokenized text search.',
        },
      ],
    },
    {
      id: 'structures',
      title: 'Data Structures',
      blocks: [
        {
          type: 'markdown',
          value:
            'Most OLTP indexes use **B-Trees / B+ Trees**: balanced tree with sorted keys, excellent for equality and ranges. **Hash tables** power hash indexes. **Bitmaps** store bit vectors per value for set operations.',
        },
        {
          type: 'image',
          src: 'assets/article-images/database-indexes/07-b-tree.png',
          alt: 'B-tree structure with root, internal nodes, and leaf keys',
          caption:
            'B-Tree hierarchy of sorted keys. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'smart-usage',
      title: 'How to Use Indexes Smartly',
      blocks: [
        {
          type: 'markdown',
          value:
            '- Index columns in **WHERE**, **JOIN**, and high-selectivity filters.\n- Prefer **composite** indexes matching multi-column predicates (order columns carefully).\n- Avoid functions on indexed columns in predicates (`WHERE LOWER(email) = …` often disables the index) — see sargability.\n- Drop unused indexes; monitor planner with `EXPLAIN` / `EXPLAIN ANALYZE`.',
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
          filename: 'Employee.java',
          code: `@Entity
@Table(
  name = "employees",
  indexes = {
    @Index(name = "idx_last_name", columnList = "last_name"),
    @Index(name = "idx_dept_hire", columnList = "department_id, hire_date")
  }
)
public class Employee {
  @Id Long id;
  String lastName;
  Long departmentId;
  LocalDate hireDate;
}`,
        },
        {
          type: 'markdown',
          value:
            'Prefer **Flyway/Liquibase** `CREATE INDEX` migrations for production control. JPA `@Index` is convenient but easy to drift from live schemas. Always validate with `EXPLAIN` on representative data.',
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
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “A detailed guide on Database Indexes,” with JPA/Flyway notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
