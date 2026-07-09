import{a as e}from"./chunk-5TZURMBM.js";import"./chunk-IFGU66OU.js";var a={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Cache-Aside** (lazy loading) puts the **application in charge** of cache logic: on read, check **Redis** or local cache first; on **miss**, load from the database and populate the cache. On write, update the database then **invalidate** (or update) cache entries. It is the most common pattern because the cache is a **performance layer**, not the source of truth."},{type:"callout",variant:"info",title:"Compared to other cache patterns",body:"**Read-Through / Write-Through** delegate load and sync write to the cache library \u2014 simpler call sites but less control. **Write-Behind** acks writes to cache and flushes async \u2014 faster writes, weaker durability. Cache-aside gives **explicit invalidation** and fits most e-commerce catalog and session workloads."},{type:"table",caption:"Read and write paths.",headers:["Operation","Steps"],rows:[["Read hit","Return cached value \u2014 no DB round trip"],["Read miss","Query DB \u2192 set cache with TTL \u2192 return"],["Write","Update DB \u2192 delete or update cache key"],["Failure mode","Stale data if invalidation missed \u2014 tune TTL as safety net"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **chef\u2019s prep station**: popular ingredients sit within arm\u2019s reach (cache). If something is missing, someone fetches from the walk-in cooler (database) and restocks the station. After a recipe change (write), you **throw out** the old prepped batch (invalidate) so nobody serves stale food."},{type:"mermaid",caption:"Application orchestrates cache lookup and DB fallback.",definition:`sequenceDiagram
  participant App
  participant Redis
  participant DB

  App->>Redis: GET product:42
  alt cache hit
    Redis-->>App: cached JSON
  else cache miss
    Redis-->>App: null
    App->>DB: SELECT * FROM products WHERE id=42
    DB-->>App: row
    App->>Redis: SET product:42 EX 300
    App-->>App: return row
  end
  Note over App,DB: on UPDATE \u2014 write DB first, then DEL product:42`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce product catalog","Redis cache-aside for PDP data; invalidate on price/inventory update"],["Search facets","Cache category counts; TTL + event-driven invalidation on catalog change"],["CDN origin","API layer cache-aside reduces origin DB hits; CDN caches HTTP responses separately"],["Food delivery menus","Restaurant menu in Redis; invalidate when merchant edits items"],["Session / cart","User cart JSON in Redis with lazy load from DB on miss after failover"],["Public API responses","Cache GET /rates/{currency} with 60s TTL; bust on admin rate change"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Use **cache keys** with version or tenant prefix (`catalog:v3:product:{id}`). Prefer **delete on write** over update-in-place to avoid race conditions. Add **TTL** even with invalidation \u2014 safety against missed events. For hot keys, consider **singleflight** (one loader per miss) to prevent stampede. When you need the cache library to own loads/writes, evaluate **Read-Through / Write-Through**; when write latency dominates, compare **Write-Behind**."},{type:"code",language:"java",filename:"CacheAsideProductRepository.java",code:`public class CacheAsideProductRepository {
  private final RedisTemplate<String, String> redis;
  private final JdbcTemplate db;
  private static final Duration TTL = Duration.ofMinutes(5);

  public Optional<Product> findById(long id) {
    String key = "product:" + id;
    String cached = redis.opsForValue().get(key);
    if (cached != null) {
      return Optional.of(Product.fromJson(cached));
    }
    Optional<Product> fromDb = db.query(
        "SELECT id, name, price FROM products WHERE id = ?",
        rs -> rs.next() ? Optional.of(Product.fromRow(rs)) : Optional.empty(), id);
    fromDb.ifPresent(p -> redis.opsForValue().set(key, p.toJson(), TTL));
    return fromDb;
  }

  public void updatePrice(long id, BigDecimal price) {
    db.update("UPDATE products SET price = ? WHERE id = ?", price, id);
    redis.delete("product:" + id); // invalidate \u2014 next read repopulates
  }
}`},{type:"callout",variant:"warning",title:"Cache stampede on expiry",body:"When a hot key expires, thousands of threads may hit the DB together. Mitigate with **probabilistic early expiry**, **singleflight**, or a short **mutex lock** around reload for that key."},{type:"prosCons",title:"Trade-offs",pros:["Simple mental model \u2014 app controls consistency boundaries.","Cache can be bypassed entirely if Redis is down (degraded, not dead).","Works with any store \u2014 Redis, Memcached, in-process Caffeine."],cons:["Invalidation bugs cause stale reads \u2014 requires discipline.","Two round trips on miss (cache + DB).","Write path must always remember to invalidate related keys."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain cache-aside.",answer:"App checks cache on read; on **miss**, loads DB and fills cache. On write, updates **DB first**, then **invalidates** cache. Application owns orchestration \u2014 cache is not authoritative."},{question:"Cache-aside vs read-through?",answer:"**Cache-aside**: app code does get/set. **Read-through**: cache library calls a **loader** on miss automatically \u2014 less boilerplate, tighter coupling. See **Read-Through / Write-Through Cache** for sync write variants."},{question:"Invalidate vs update cache on write?",answer:"**Invalidate** (delete) is safer \u2014 avoids races where DB write fails but cache updated. **Update** saves a miss but needs careful ordering; often used with versioned objects."},{question:"How do you prevent stale catalog data?",answer:"**Event-driven invalidation** on product change, **TTL** as backup, **version in key** for bulk refreshes. CDN layer may need separate purge API."},{question:"Cache-aside vs write-behind?",answer:"**Cache-aside** writes go to **DB synchronously** \u2014 strong durability. **Write-behind** acks cache first, async DB flush \u2014 faster, risk of loss. Choose write-behind only when latency trumps durability."},{question:"Design product page caching.",answer:"Redis cache-aside per `product:{id}` with 5m TTL. Update path: write Postgres, publish invalidation event, delete Redis key. CDN caches HTML separately. Use singleflight on hot drops."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Cache-aside = app-managed **lazy load** + **invalidate on write**.
2. Most common pattern for **Redis**, e-commerce catalog, API caching.
3. Compare **Read-Through / Write-Through** (library-owned) and **Write-Behind** (async durability).
4. Always pair invalidation with **TTL** and stampede protection on hot keys.`}]}]},i=a;export{i as default};
