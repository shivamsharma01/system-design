import{a as e}from"./chunk-JIFTIXCN.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Sharding** (horizontal partitioning) splits a dataset across **multiple independent database nodes**, each holding a subset of rows keyed by a **shard key** (e.g. `user_id`, `tenant_id`, `order_id`). Writes and storage scale linearly with shard count. The application or proxy layer routes queries to the correct shard \u2014 cross-shard operations are expensive and should be avoided in the hot path."},{type:"callout",variant:"info",title:"Shard key selection",body:"Choose a key with **high cardinality** and **even distribution** \u2014 avoid monotonic IDs alone (hot last shard). **Tenant ID** or **hashed user ID** are common. Range sharding (A\u2013M, N\u2013Z) is simple but prone to hot ranges; **hash-based** sharding spreads load more evenly."},{type:"table",caption:"Sharding trade-offs at a glance.",headers:["Concern","Mitigation"],rows:[["Hot shard","Re-shard hot tenant to dedicated node; salting keys; rate limits"],["Cross-shard JOIN","Denormalize, scatter-gather, or materialized views"],["Resharding","Dual-write migration, consistent hashing ring, Vitess workflows"],["Global uniqueness","UUIDs or shard-prefixed IDs \u2014 no auto-increment across shards"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **library with multiple buildings**: each building holds books whose authors\u2019 last names start with certain letters (shard key). You know which building to visit for \u201CSmith\u201D without searching every shelf in the city. Adding a new building (resharding) means moving some letter ranges \u2014 ideally only a fraction of books move, not the entire collection."},{type:"mermaid",caption:"Router directs requests to the shard owning the key.",definition:`flowchart TB
  APP[Application]
  RT[Shard Router]
  S1[(Shard 1<br/>user_id % 4 = 0)]
  S2[(Shard 2<br/>user_id % 4 = 1)]
  S3[(Shard 3<br/>user_id % 4 = 2)]
  S4[(Shard 4<br/>user_id % 4 = 3)]

  APP -->|GET orders WHERE user_id=42| RT
  RT -->|hash(42) \u2192 shard 2| S2
  S2 -->|rows| RT
  RT --> APP`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Social platforms","User timelines sharded by `user_id` \u2014 Instagram, Twitter/X storage tiers"],["Multi-tenant SaaS","Per-tenant shard in PostgreSQL Citus or dedicated schema per large customer"],["E-commerce orders","Orders partitioned by `customer_id` or `order_id` hash across MySQL shards"],["Food delivery","Driver location history sharded by `city_id` for regional scale"],["Gaming leaderboards","Player stats sharded by `region` + hash for write throughput"],["DynamoDB / MongoDB","Managed hash/range partitioning with automatic shard splitting"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Implement a **ShardRouter** that maps shard key \u2192 physical datasource. Use **consistent hashing** (see **Consistent Hashing Pattern**) for minimal remapping when adding nodes. For resharding, run **dual-write** to old and new shard, backfill historical data, verify counts, then cut over reads. Avoid **scatter-gather** on every request \u2014 reserve for admin/reporting. Monitor **per-shard QPS, disk, replication lag** to detect hot shards early."},{type:"code",language:"java",filename:"HashShardRouter.java",code:`public class HashShardRouter {
  private final List<DataSource> shards;
  private final int shardCount;

  public HashShardRouter(List<DataSource> shards) {
    this.shards = List.copyOf(shards);
    this.shardCount = shards.size();
  }

  public DataSource route(long shardKey) {
    int index = Math.floorMod(Long.hashCode(shardKey), shardCount);
    return shards.get(index);
  }

  public List<Order> findOrdersByUser(long userId) {
    DataSource ds = route(userId);
    try (Connection conn = ds.getConnection();
         PreparedStatement ps = conn.prepareStatement(
             "SELECT id, total FROM orders WHERE user_id = ?")) {
      ps.setLong(1, userId);
      ResultSet rs = ps.executeQuery();
      List<Order> orders = new ArrayList<>();
      while (rs.next()) {
        orders.add(new Order(rs.getLong("id"), rs.getBigDecimal("total")));
      }
      return orders;
    } catch (SQLException e) {
      throw new DataAccessException("shard query failed", e);
    }
  }
}`},{type:"callout",variant:"warning",title:"Hot shard symptoms",body:"One shard at 90% CPU while others idle \u2014 often a **celebrity tenant**, **monotonic ID** clustering, or **poor shard key**. Fix with key salting, dedicated shard for outlier tenant, or migrate to **consistent hashing** with virtual nodes for finer balance."},{type:"prosCons",title:"Trade-offs",pros:["Horizontal scale for writes, storage, and connection pools.","Blast radius isolation \u2014 one shard failure affects a fraction of users.","Aligns with **shared-nothing** architecture for cloud-native growth."],cons:["Cross-shard transactions and JOINs are hard \u2014 often impossible without 2PC.","Resharding is a major operational migration.","Application complexity \u2014 routing, global queries, schema coordination."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is database sharding?",answer:"**Horizontal partitioning** of rows across multiple DB nodes by a **shard key**. Each shard is independent; the router sends queries to the shard that owns the key. Scales writes and storage beyond a single machine."},{question:"How do you pick a shard key?",answer:"High **cardinality**, **even distribution**, aligned with query patterns. `user_id` for user-scoped data. Avoid keys that concentrate traffic (single tenant, time-only). Often **hash(user_id)** for balance."},{question:"What is a hot shard?",answer:"One partition receives disproportionate traffic \u2014 viral user, monotonic IDs landing on last shard, or mega-tenant. Mitigate with **salting**, **dedicated shard**, **rate limits**, or **resharding** that splits the hot range."},{question:"How do you reshard without downtime?",answer:"**Dual-write** to old and new mapping, **backfill** historical rows in background, **verify** row counts, flip read router to new map, stop old writes. Tools like **Vitess** automate this. **Consistent hashing** limits data movement."},{question:"Sharding vs consistent hashing?",answer:"**Sharding** is the data partitioning strategy. **Consistent hashing** is a **routing algorithm** that maps keys to nodes on a ring with minimal remapping when nodes change. Sharded systems often use consistent hashing under the hood."},{question:"Design sharded order storage.",answer:"Shard by `customer_id` hash across 32 MySQL nodes. Router in app layer. Orders for one customer always single-shard. Cross-customer admin reports use **scatter-gather** async or **materialized view** in warehouse. UUID order IDs. Monitor per-shard CPU."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Sharding **partitions by shard key** to scale writes and storage horizontally.
2. Watch **hot shards** \u2014 choose keys with even distribution; use hashing or salting.
3. **Resharding** needs dual-write, backfill, and cutover \u2014 **consistent hashing** reduces data movement.
4. Avoid cross-shard hot-path JOINs \u2014 denormalize, project, or scatter-gather offline.`}]}]},r=t;export{r as default};
