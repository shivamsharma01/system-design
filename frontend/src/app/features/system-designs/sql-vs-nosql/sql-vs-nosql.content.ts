import { DesignContent } from '../../../shared/models';
import { SQL_VS_NOSQL_META } from './sql-vs-nosql.meta';

const content: DesignContent = {
  meta: SQL_VS_NOSQL_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Choosing **SQL (relational)** vs **NoSQL** is one of the first data-store decisions in system design. Neither wins universally — trade data model, schema rigidity, scale path, query power, transactions, and access patterns.\n\nRelated: [ACID Transactions](/designs/acid-transactions), [CAP and PACELC](/designs/cap-pacelc), [Database Indexes](/designs/database-indexes), [Sharding Pattern](/designs/sharding-pattern).',
        },
        {
          type: 'image',
          src: 'assets/article-images/sql-vs-nosql/01-overview.png',
          alt: 'Overview comparing relational SQL databases and NoSQL database families',
          caption:
            'SQL vs NoSQL at a glance. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'data-model',
      title: '1. Data Model',
      blocks: [
        {
          type: 'markdown',
          value:
            '**SQL** stores data in **tables** (relations) with rows/columns and foreign keys. Normalization reduces duplication; joins reassemble related data.\n\n**NoSQL** uses flexible models: **key-value**, **document** (JSON), **column-family**, **graph**. Great for nested/variable shapes; fewer joins by design (often embed or denormalize).',
        },
        {
          type: 'image',
          src: 'assets/article-images/sql-vs-nosql/02-data-model-sql.png',
          alt: 'Relational SQL tables with relationships between entities',
          caption:
            'Relational tables and relationships. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/sql-vs-nosql/03-data-model-nosql.png',
          alt: 'NoSQL models: key-value, document, column-family, and graph',
          caption:
            'Common NoSQL data models. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'schema',
      title: '2. Schema',
      blocks: [
        {
          type: 'markdown',
          value:
            '**SQL** — schema-first: define tables/types/constraints before insert. Strong integrity; migrations (`ALTER TABLE`) can be heavy.\n\n**NoSQL** — schema-flexible: documents can vary field-by-field. Faster iteration; application must validate shape and handle version drift.',
        },
        {
          type: 'image',
          src: 'assets/article-images/sql-vs-nosql/04-schema.png',
          alt: 'Fixed SQL schema versus flexible NoSQL document schema',
          caption:
            'Schema enforcement vs flexible documents. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'scalability',
      title: '3. Scalability',
      blocks: [
        {
          type: 'markdown',
          value:
            '**SQL** traditionally **scales vertically** (bigger box) while preserving ACID; horizontal scale needs sharding/proxies (Vitess, Citus) and careful design.\n\n**NoSQL** is built for **horizontal scale-out** — add nodes, partition data, trade some consistency for availability/throughput.',
        },
        {
          type: 'image',
          src: 'assets/article-images/sql-vs-nosql/05-scalability.png',
          alt: 'Vertical scaling for SQL versus horizontal scaling for NoSQL',
          caption: 'Scale-up vs scale-out. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'query-language',
      title: '4. Query Language',
      blocks: [
        {
          type: 'markdown',
          value:
            '**SQL** — one standard language for SELECT/JOIN/aggregations across vendors (with dialects).\n\n**NoSQL** — no universal language: MongoDB query/aggregation DSL, Cassandra CQL, Redis commands, Neo4j Cypher. Powerful within each model; portability is lower.',
        },
      ],
    },
    {
      id: 'transactions',
      title: '5. Transaction Support',
      blocks: [
        {
          type: 'markdown',
          value:
            '**SQL** — strong **ACID** support for multi-row/multi-table transactions (bank transfer debit+credit).\n\n**NoSQL** — often **BASE** (Basically Available, Soft state, Eventually consistent). Some offer limited ACID (Mongo multi-doc, Cassandra LWTs) but not full relational transaction scope by default. See [ACID Transactions](/designs/acid-transactions).',
        },
      ],
    },
    {
      id: 'performance-use-cases',
      title: '6–7. Performance and Use Cases',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Performance:** SQL shines for complex joins/analytics on structured data. NoSQL shines for simple key/document lookups at massive scale and write-heavy workloads.\n\n**Typical SQL use cases:** finance, ERP, inventory, anything needing strict relationships and ACID.\n\n**Typical NoSQL use cases:** social feeds, catalogs with evolving attributes, sessions/cache (Redis), IoT time series, recommendation graphs.',
        },
        {
          type: 'image',
          src: 'assets/article-images/sql-vs-nosql/06-comparison-summary.png',
          alt: 'Summary comparison table of SQL versus NoSQL across key dimensions',
          caption:
            'Seven differences summarized. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'featureComparison',
          caption: 'Quick pick guide.',
          columns: ['SQL', 'NoSQL'],
          rows: [
            { feature: 'Data model', values: ['Tables + relations', 'KV / doc / column / graph'] },
            { feature: 'Schema', values: ['Fixed upfront', 'Flexible'] },
            { feature: 'Scale default', values: ['Vertical (+ shard later)', 'Horizontal'] },
            { feature: 'Transactions', values: ['Full ACID', 'BASE / limited ACID'] },
            { feature: 'Query standard', values: ['SQL', 'Vendor-specific'] },
          ],
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
          filename: 'SqlAndMongo.java',
          code: `// SQL — Spring Data JPA
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
  @Query("select o from Order o join fetch o.items where o.userId = :uid")
  List<Order> findWithItems(long uid);
}

@Transactional
public void transfer(long from, long to, BigDecimal amt) { /* ACID debit+credit */ }

// NoSQL — Spring Data MongoDB
@Document("users")
public class UserDoc {
  @Id String id;
  String name;
  List<Address> addresses; // embedded, schema-flexible
}
MongoTemplate / MongoRepository for CRUD + aggregations.`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Polyglot is normal',
          body: 'Many systems use **Postgres for the ledger** and **Redis/Mongo/Cassandra** for sessions, feeds, or catalogs. Pick per bounded context, not one DB for the whole company.',
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
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “SQL vs NoSQL — 7 Key Differences You Must Know,” with Spring Data notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
