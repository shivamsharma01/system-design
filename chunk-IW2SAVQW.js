import{a as e}from"./chunk-KLTJ2KLW.js";import"./chunk-IFGU66OU.js";var a={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:`A **Single Point of Failure (SPOF)** is any component whose failure can take down the whole system (or a large slice of it). Minimizing SPOFs is core to reliability and high availability.

Related: [Availability (nines & strategies)](/designs/availability), [Load Balancing](/designs/load-balancing-pattern), [Health Check](/designs/health-check), [Graceful Degradation](/designs/graceful-degradation), [Bulkhead](/designs/bulkhead), [Quorum](/designs/quorum).`},{type:"image",src:"assets/article-images/single-point-of-failure/01-spof-intro.png",alt:"Illustration of a single component whose failure stops the entire system",caption:"One critical component can sink the system. Diagram adapted from Ashish Pratap Singh / AlgoMaster."}]},{id:"understanding",title:"Understanding SPOFs",blocks:[{type:"markdown",value:`SPOFs can be a lone server, load balancer, database primary, network link, DNS provider, or shared cache used as a hard dependency.

In a typical multi-tier design, watch the **LB**, **primary DB**, and any **shared middleware**. App servers behind an LB are usually not SPOFs if N\u22652. A cache is often **not** a true SPOF if the app can fall back to the DB (degraded mode).`},{type:"image",src:"assets/article-images/single-point-of-failure/02-example-architecture.png",alt:"Example architecture highlighting potential single points of failure",caption:"Map each hop and ask what happens if it dies. Diagram adapted from Ashish Pratap Singh / AlgoMaster."}]},{id:"identify",title:"How to Identify SPOFs",blocks:[{type:"bestPractices",title:"Four steps",practices:["**Map the architecture** \u2014 draw clients \u2192 edge \u2192 services \u2192 data stores.","**Dependency analysis** \u2014 if only one instance serves a hop, flag it.","**Failure impact assessment** \u2014 would users stop or severely degrade?","**Chaos testing** \u2014 kill the component in staging/prod-like env and observe."]}]},{id:"strategies",title:"Strategies to Avoid SPOFs",blocks:[{type:"markdown",value:`### 1. Redundancy
Run multiple instances of every critical tier (active-active or active-passive).`},{type:"image",src:"assets/article-images/single-point-of-failure/03-redundancy.png",alt:"Redundant servers replacing a single server SPOF",caption:"Duplicate critical components. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`### 2. Load balancing
Distribute traffic across healthy instances; remove failed nodes from the pool. See [Load Balancing Pattern](/designs/load-balancing-pattern).`},{type:"image",src:"assets/article-images/single-point-of-failure/04-load-balancing.png",alt:"Load balancer distributing traffic across multiple application servers",caption:"LB + health checks avoid pinning to one app box. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`### 3\u20134. Data replication & geographic distribution
Replicate data (sync/async) across AZs/regions; place capacity near users so a regional outage is survivable.`},{type:"image",src:"assets/article-images/single-point-of-failure/05-replication-geo.png",alt:"Data replication and multi-region distribution to survive regional failures",caption:"Replication and multi-region layout. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`### 5. Graceful failure handling
Timeouts, retries with backoff, circuit breakers, fallbacks \u2014 don\u2019t let one dependency cascade. See [Graceful Degradation](/designs/graceful-degradation).

### 6. Monitoring and alerting
Detect failures before users do: health checks, SLOs, on-call. Blind systems still have SPOFs \u2014 you just discover them later.`}]},{id:"java-spring",title:"Java / Spring Notes",blocks:[{type:"code",language:"java",filename:"HealthAndResilience.java",code:`// Expose readiness so the LB removes bad instances
@RestController
class HealthController {
  @GetMapping("/actuator/health")
  public Map<String, String> health() {
    return Map.of("status", "UP");
  }
}

// Resilience4j circuit breaker around a dependency
@CircuitBreaker(name = "payments", fallbackMethod = "payFallback")
public PaymentResult charge(Order o) { return payments.charge(o); }

PaymentResult payFallback(Order o, Throwable t) {
  return PaymentResult.deferred(); // degrade, don't cascade
}`},{type:"callout",variant:"tip",title:"LB is often forgotten",body:"A single load balancer/DNS entry can itself be a SPOF \u2014 use managed multi-AZ LBs, anycast, or DNS failover. Same for a lone Redis used as a hard dependency without DB fallback."}]},{id:"source",title:"Source",blocks:[{type:"callout",variant:"note",title:"Source",body:"Summarized from Ashish Pratap Singh\u2019s AlgoMaster article \u201CSystem Design: How to Avoid Single Point of Failures?,\u201D with Spring health/resilience notes for this platform."}]}]},i=a;export{i as default};
