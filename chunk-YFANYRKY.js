import{a as e}from"./chunk-N7N4NP4L.js";import"./chunk-IFGU66OU.js";var a={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:`**Database sharding** is horizontal scaling: split a large database into smaller independent **shards** distributed across servers. Each shard owns a subset of rows (e.g. Instagram-style userId ranges or hash buckets).

Routing often uses [Consistent Hashing](/designs/consistent-hashing) to minimize remapping when shards are added.`},{type:"image",src:"assets/article-images/sharding-pattern/01-instagram-split.png",alt:"Splitting a large user base into groups stored on separate servers",caption:"Divide users into groups (e.g. by userId ranges) across servers. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"image",src:"assets/article-images/sharding-pattern/02-what-is-sharding.png",alt:"Large database split into shards distributed across multiple nodes",caption:"Shards are independent pieces of the dataset. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"callout",variant:"info",title:"Shard key selection",body:"Choose a key with **high cardinality** and **even distribution** \u2014 avoid monotonic IDs alone (hot last shard). **Tenant ID** or **hashed user ID** are common."},{type:"table",caption:"Sharding trade-offs at a glance.",headers:["Concern","Mitigation"],rows:[["Hot shard","Re-shard hot tenant; salting keys; rate limits"],["Cross-shard JOIN","Denormalize, scatter-gather, or materialized views"],["Resharding","Dual-write migration, consistent hashing, Vitess workflows"],["Global uniqueness","UUIDs or shard-prefixed IDs"]]}]},{id:"benefits",title:"Benefits",blocks:[{type:"bestPractices",title:"Why shard",practices:["**Performance** \u2014 less data and load per node \u2192 faster queries.","**Scalability** \u2014 add shards as volume grows (horizontal scale).","**High availability** \u2014 one shard failure does not take down all data.","**Geographical distribution** \u2014 place shards near users.","**Cost** \u2014 scale with commodity hardware instead of one giant machine."]}]},{id:"how-it-works",title:"How Sharding Works",blocks:[{type:"image",src:"assets/article-images/sharding-pattern/03-how-sharding-works.png",alt:"Shard key, partitioning, mapping, manager, and query routing components",caption:"Shard key \u2192 partition \u2192 map \u2192 manage \u2192 route. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:"1. **Shard key** \u2014 field that decides ownership (`user_id`, `tenant_id`).\n2. **Data partitioning** \u2014 split rows by strategy (hash, range, geo, directory).\n3. **Shard mapping** \u2014 key \u2192 shard location lookup.\n4. **Shard management** \u2014 rebalance, health, schema rollout.\n5. **Query routing** \u2014 router/proxy sends each query to the right shard(s)."}]},{id:"strategies",title:"Sharding Strategies",blocks:[{type:"image",src:"assets/article-images/sharding-pattern/04-hash-based.png",alt:"Hash-based sharding mapping keys to shards with a hash function",caption:"Hash-based: `hash(user_id) % N`. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"image",src:"assets/article-images/sharding-pattern/05-range-geo-directory.png",alt:"Range-based, geo-based, and directory-based sharding strategies",caption:"Range, geo, and directory strategies. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`| Strategy | Idea | Watch-out |
|---|---|---|
| **Hash-based** | \`hash(key) % N\` | Remaps many keys when N changes \u2014 prefer consistent hashing |
| **Range-based** | ID/date ranges per shard | Hot ranges (newest IDs) |
| **Geo-based** | Region \u2192 shard | Cross-region queries |
| **Directory-based** | Lookup table key\u2192shard | Directory is a critical dependency |
`}]},{id:"challenges",title:"Challenges",blocks:[{type:"prosCons",title:"Operational reality",pros:["Horizontal write and storage scale","Blast-radius isolation per shard","Aligns with shared-nothing growth"],cons:["Operational complexity (routing, schema, monitoring)","Cross-shard consistency and joins are hard","Rebalancing / resharding is a major migration"]}]},{id:"best-practices",title:"Best Practices",blocks:[{type:"markdown",value:`- Choose a shard key with even distribution and query affinity.
- Use **consistent hashing** (or slot migration) to minimize data movement.
- Monitor per-shard QPS, disk, and lag; rebalance early.
- Keep hot-path queries **single-shard**; denormalize or warehouse for analytics.`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Social platforms","User timelines sharded by `user_id`"],["E-commerce","Catalog / orders by customer or order hash"],["SaaS","Tenant shards (Citus) or dedicated large tenants"],["Gaming","Region + hash for player state"],["Managed DBs","DynamoDB / MongoDB auto-splitting"]]}]},{id:"implementation",title:"Java Implementation",blocks:[{type:"markdown",value:"App-level routing maps shard key \u2192 `DataSource`. Proxies like **Vitess** / **Citus** can hide routing from the app. Prefer consistent hashing when shard count will grow."},{type:"code",language:"java",filename:"HashShardRouter.java",showLineNumbers:!0,code:`public final class HashShardRouter {
  private final List<DataSource> shards;

  public HashShardRouter(List<DataSource> shards) {
    this.shards = List.copyOf(shards);
  }

  public DataSource route(long shardKey) {
    int i = Math.floorMod(Long.hashCode(shardKey), shards.size());
    return shards.get(i);
  }

  public List<Order> findOrdersByUser(long userId) throws SQLException {
    try (Connection c = route(userId).getConnection();
         PreparedStatement ps = c.prepareStatement(
             "SELECT id, total FROM orders WHERE user_id = ?")) {
      ps.setLong(1, userId);
      ResultSet rs = ps.executeQuery();
      List<Order> out = new ArrayList<>();
      while (rs.next()) {
        out.add(new Order(rs.getLong(1), rs.getBigDecimal(2)));
      }
      return out;
    }
  }
}

// Spring: AbstractRoutingDataSource + ThreadLocal shard key works similarly.
// For growing clusters, swap floorMod for ConsistentHashRing.getServer(key).`},{type:"callout",variant:"warning",title:"Hot shard symptoms",body:"One shard at 90% CPU while others idle \u2014 celebrity tenant, monotonic clustering, or poor key. Fix with salting, dedicated shard, or vnode-based consistent hashing."}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is database sharding?",answer:"**Horizontal partitioning** of rows across DB nodes by a **shard key**. The router sends queries to the owning shard."},{question:"How do you pick a shard key?",answer:"High cardinality, even distribution, aligned with query patterns \u2014 often `hash(user_id)`. Avoid keys that concentrate traffic."},{question:"Sharding vs consistent hashing?",answer:"**Sharding** is the partitioning strategy. **Consistent hashing** is a routing algorithm that remaps ~1/N keys when nodes change \u2014 commonly used under the hood."},{question:"How do you reshard without downtime?",answer:"Dual-write, backfill, verify, cut over reads; Vitess-style workflows. Consistent hashing / slot migration limits movement."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Sharding **partitions by shard key** for horizontal scale.
2. Strategies: hash, range, geo, directory \u2014 each with hot-spot risks.
3. **Consistent hashing** reduces remapping on growth.
4. Keep hot-path queries single-shard; plan resharding deliberately.`},{type:"callout",variant:"note",title:"Source",body:"Strategy diagrams and practice notes summarized from Ashish Pratap Singh\u2019s AlgoMaster article \u201CWhat is Database Sharding?,\u201D with Java routing notes for this platform."}]}]},s=a;export{s as default};
