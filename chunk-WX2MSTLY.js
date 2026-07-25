import{a as e}from"./chunk-U4DC3HDE.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:`A **Content Delivery Network (CDN)** is a geographically distributed set of **edge servers (PoPs)** that cache and serve content close to users. Instead of every request traveling to a single origin, DNS steers clients to a nearby edge.

See CDN in the wild: [Netflix](/designs/netflix) (Open Connect) and [YouTube](/designs/youtube).`}]},{id:"problem",title:"The Single-Origin Problem",blocks:[{type:"image",src:"assets/article-images/cdn/01-single-origin-problem.png",alt:"Users worldwide connecting to a single distant origin server with high latency",caption:"One origin means high RTT for distant users and a single capacity bottleneck. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:"Without a CDN, every asset fetch pays **long-haul latency**, and traffic spikes hit one stack. Static and cacheable content is an ideal candidate to push to the edge."}]},{id:"architecture",title:"CDN Architecture",blocks:[{type:"image",src:"assets/article-images/cdn/02-cdn-global-network.png",alt:"Global CDN with edge PoPs around the world and a central origin",caption:"Edges/PoPs + origin + DNS. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`- **Edge / PoP** \u2014 caches content near users.
- **Origin** \u2014 source of truth (S3, Spring Boot, object store).
- **DNS / anycast** \u2014 resolves the CDN hostname to a nearby edge IP.`}]},{id:"request-flow",title:"Request Flow",blocks:[{type:"image",src:"assets/article-images/cdn/03-request-flow.png",alt:"CDN request flow: DNS to edge, cache hit or miss with origin fill and TTL",caption:"User \u2192 DNS \u2192 edge; hit serves locally; miss fills from origin then caches. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`1. **User request** \u2014 browser asks for \`https://cdn.example.com/...\`.
2. **DNS** \u2014 resolves to the **nearest edge**, not the origin.
3. **Cache check** \u2014 **hit**: serve immediately. **Miss**: edge fetches from origin, caches the response, then serves the user.
4. **TTL refresh** \u2014 entries expire and are revalidated or refetched so users see fresh content.

Important: the **user always hits the edge**; the edge talks to origin on miss \u2014 clients do not typically bypass to origin for cacheable assets.`},{type:"callout",variant:"note",title:"Miss path nuance",body:"A common misconception is that misses go \u201Cstraight to origin\u201D from the browser. Correct model: browser \u2192 edge \u2192 (on miss) origin \u2192 edge cache \u2192 browser."}]},{id:"benefits-costs",title:"Benefits and Costs",blocks:[{type:"prosCons",title:"CDN trade-offs",pros:["Lower latency via nearest edge","Origin offload for static/media traffic","Availability via many PoPs","Spike absorption and global reach","Often includes DDoS / WAF features"],cons:["DNS, cache rules, and invalidation add complexity","Bandwidth/request pricing at high volume","Stale content until TTL/purge"]}]},{id:"use-cases",title:"Use Cases & Providers",blocks:[{type:"markdown",value:`**Use cases:** web assets (JS/CSS/images), OTT / ABR video, game patches, media libraries, software updates.

**Providers:** Akamai, Cloudflare, Fastly, AWS CloudFront, Google Cloud CDN, Azure CDN.`}]},{id:"java-spring",title:"Java / Spring Notes",blocks:[{type:"markdown",value:"Put CloudFront or Cloudflare in front of Spring Boot (or S3 for static). Set **Cache-Control** / **ETag** so edges and browsers know what is safe to cache."},{type:"code",language:"java",filename:"CacheHeaders.java",code:`// Fingerprinted assets \u2192 long TTL + immutable
@GetMapping("/assets/{file}")
public ResponseEntity<Resource> asset(@PathVariable String file) {
  Resource body = load(file);
  return ResponseEntity.ok()
      .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
      .eTag(hash(body))
      .body(body);
}

// HTML / API that must stay fresh
@GetMapping("/")
public ResponseEntity<String> home() {
  return ResponseEntity.ok()
      .cacheControl(CacheControl.noCache().mustRevalidate())
      .body(render());
}`},{type:"callout",variant:"tip",title:"Spring static resources",body:"`ResourceHttpRequestHandler` / `spring.web.resources.cache.cachecontrol` can set default max-age for `/static/**`. Prefer content-hashed filenames so you can cache forever and deploy new hashes without purge races."}]},{id:"source",title:"Source",blocks:[{type:"callout",variant:"note",title:"Source",body:"Summarized from Ashish Pratap Singh\u2019s AlgoMaster article \u201CWhat is a Content Delivery Network?,\u201D with Cache-Control / Spring notes for this platform."}]}]},s=t;export{s as default};
