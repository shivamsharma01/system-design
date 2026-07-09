import{a as e}from"./chunk-MHKSQYKA.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Strangler Fig Pattern** incrementally replaces a **legacy system** by routing slices of traffic to **new services** while the old system still runs. Named after the fig vine that grows around a host tree until the tree dies, the pattern avoids risky big-bang rewrites \u2014 each feature migrates independently behind a **routing facade**."},{type:"callout",variant:"info",title:"Core mechanism",body:"A **facade** (API gateway, reverse proxy, or routing layer) intercepts requests. Migrated paths go to new microservices; unmigrated paths still hit legacy. Over time the strangler \u201Cgrows\u201D until legacy is decommissioned."},{type:"table",caption:"Migration phases.",headers:["Phase","Traffic"],rows:[["Coexistence","100% legacy; new services handle zero production traffic"],["Parallel run","Shadow or canary \u2014 new path validated, legacy still authoritative"],["Incremental cutover","Route features (e.g., search, checkout) to new stack by path/header"],["Retirement","Legacy powered down; facade routes 100% to new services"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **strangler fig** on a host tree: the vine wraps the trunk branch by branch, eventually supporting the canopy itself. The old tree (legacy) is not chopped down on day one \u2014 the fig grows until it can stand alone."},{type:"mermaid",caption:"Facade routes migrated features to new services; rest stays on legacy.",definition:`flowchart TB
  CLIENT["Clients / mobile apps"]
  FACADE["Strangler facade\\nAPI Gateway / NGINX"]
  NEW1["New catalog service"]
  NEW2["New checkout service"]
  LEG["Legacy monolith"]

  CLIENT --> FACADE
  FACADE -->|"/catalog/** migrated"| NEW1
  FACADE -->|"/checkout/** migrated"| NEW2
  FACADE -->|"all other paths"| LEG`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce checkout","Gateway routes `/v2/checkout` to new payment orchestrator; `/v1/*` still on monolith"],["Food delivery","Strangler routes restaurant search to Elasticsearch service; orders still on legacy dispatch"],["Payments","New fraud service handles `/fraud/score`; settlement remains on mainframe bridge"],["Netflix-style microservices","Edge proxy migrates recommendation API off monolith one endpoint group at a time"],["Legacy modernization","Retail bank strangler moves account inquiry to microservices while wire transfers stay on COBOL"],["Feature flags","LaunchDarkly toggles route target per customer segment during phased cutover"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Start with a **transparent facade** that proxies all traffic to legacy (no behavior change). Extract **vertical slices** \u2014 one bounded capability at a time. Use **dual writes** or **event sync** carefully during transition. Pair with **Anti-Corruption Layer** at legacy boundaries. Measure **parity** before shifting production percentage."},{type:"code",language:"yaml",filename:"spring-gateway-strangler.yaml",code:`spring:
  cloud:
    gateway:
      routes:
        - id: catalog-new
          uri: http://catalog-service
          predicates:
            - Path=/api/catalog/**
            - Header=X-Migration-Wave, catalog-v2
        - id: checkout-new
          uri: http://checkout-service
          predicates:
            - Path=/api/checkout/**
          filters:
            - name: Weight
              args:
                group: checkout-migration
                weight.new: 25
                weight.legacy: 75
        - id: legacy-fallback
          uri: http://legacy-monolith:8080
          predicates:
            - Path=/api/**`},{type:"code",language:"java",filename:"StranglerRoutingFilter.java",code:`@Component
public class StranglerRoutingFilter implements GlobalFilter {
  private final FeatureFlagClient flags;

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getPath().value();

    if (path.startsWith("/api/inventory/") && flags.isEnabled("inventory-v2", exchange)) {
      exchange.getAttributes().put(GATEWAY_REQUEST_URL_ATTR,
          URI.create("http://inventory-v2" + path));
      return chain.filter(exchange);
    }

    if (path.startsWith("/api/orders/") && flags.isEnabled("orders-v2", exchange)) {
      exchange.getAttributes().put(GATEWAY_REQUEST_URL_ATTR,
          URI.create("http://order-service" + path));
      return chain.filter(exchange);
    }

    // Default: legacy monolith (strangler not yet grown here)
    return chain.filter(exchange);
  }
}`},{type:"callout",variant:"warning",title:"Data divergence risk",body:"Running **dual systems** means two sources of truth until cutover completes. Use **CDC**, **outbox events**, or **read-from-new / write-to-both** strategies explicitly \u2014 document which system is authoritative per entity."},{type:"prosCons",title:"Trade-offs",pros:["Avoids big-bang rewrite risk \u2014 deliver value incrementally.","Rollback is routing change, not redeploy of entire system.","Teams can own new services while legacy team maintains remainder."],cons:["Long period of **two-system complexity** and dual maintenance.","Routing rules and data sync become operational burden.","Incomplete migrations can linger for years without discipline."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain the Strangler Fig Pattern.",answer:"Incrementally **replace legacy** by routing traffic through a **facade** that sends migrated features to **new services** and everything else to the **old system** until legacy can be retired."},{question:"Strangler Fig vs Big Bang rewrite?",answer:"**Strangler** delivers **incremental** value with rollback via routing. **Big bang** switches all at once \u2014 high risk, long freeze, hard rollback. Strangler suits production systems that cannot stop."},{question:"What component acts as the strangler vine?",answer:"The **routing facade** \u2014 API gateway, reverse proxy, or BFF \u2014 that decides new vs legacy per path, header, or feature flag."},{question:"How do you handle shared database during strangler migration?",answer:"Prefer **database-per-service** for new stack with **sync** (CDC/events) from legacy. Avoid new services writing directly to monolith schema. ACL translates at the boundary."},{question:"Strangler Fig vs Branch by Abstraction?",answer:"**Branch by Abstraction** hides legacy behind an interface in code. **Strangler** is **infrastructure routing** at deploy time \u2014 often used together: abstraction in code, strangler at gateway."},{question:"Plan strangler migration for a monolith e-commerce site.",answer:"1) Proxy all traffic through gateway to monolith. 2) Extract **catalog** (read-heavy, low risk). 3) **Checkout** with canary weights. 4) **Account** with ACL to legacy DB. 5) Retire monolith when route table has no legacy targets."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Strangler Fig = **incremental legacy replacement** via routing facade.
2. Grow **one feature at a time** \u2014 gateway, flags, weighted routes.
3. Pair with **ACL** and careful **data sync** during coexistence.
4. Real uses: **e-commerce modernization, bank core migrations**.`}]}]},r=t;export{r as default};
