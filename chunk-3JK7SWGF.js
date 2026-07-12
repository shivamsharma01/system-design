import{a as e}from"./chunk-I42VUPAZ.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Circuit Breaker** stops calls to a dependency that is **failing or slow** beyond a threshold \u2014 like an electrical breaker tripping to prevent fire. While **open**, calls fail fast (or use fallbacks) so threads are not exhausted waiting on a sick service, preventing **cascade failures** across the mesh."},{type:"callout",variant:"info",title:"Three states",body:"**Closed**: normal traffic. **Open**: failures exceeded threshold \u2014 reject immediately. **Half-open**: allow a probe request; success closes the circuit, failure reopens it."},{type:"table",caption:"State transitions.",headers:["State","Behavior"],rows:[["Closed","All requests pass; failures are counted"],["Open","Calls short-circuit; optional fallback response"],["Half-open","Limited trial calls test if dependency recovered"],["Back to closed","Probe successes exceed success threshold"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **home circuit breaker**: when wiring overheats, the breaker **trips** and cuts power to that branch so the whole house does not burn. After cooling down, you reset and test one appliance (**half-open**) before restoring full load."},{type:"mermaid",caption:"Circuit opens after failures; half-open probes recovery.",definition:`stateDiagram-v2
  [*] --> Closed
  Closed --> Open: failure rate > threshold
  Open --> HalfOpen: wait timeout elapsed
  HalfOpen --> Closed: probe successes
  HalfOpen --> Open: probe fails
  Closed --> Closed: successes`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce checkout","Open circuit on inventory service \u2192 show \u201Climited stock\u201D without blocking payment"],["Food delivery","Breaker on maps API \u2192 cached ETA instead of stalling rider assignment"],["Payments","Circuit open on card processor \u2192 queue for retry + user message instead of thread pile-up"],["Netflix-style microservices","Hystrix/Resilience4j per dependency with fallbacks for recommendations"],["API Gateway","Spring Cloud Gateway CircuitBreaker filter on `/payments/**` routes"],["Service mesh","Envoy/Istio: per-route circuit breakers; outlier detection is host ejection (related, not the same state machine)"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Tune **failure rate threshold**, **sliding window size**, and **wait duration in open state**. Combine with **timeouts** \u2014 slow responses should count as failures. Provide meaningful **fallbacks** (cached data, degraded UX) rather than opaque errors."},{type:"code",language:"java",filename:"Resilience4jCircuitBreaker.java",code:`import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;

public class InventoryClient {
  private final CircuitBreaker breaker;
  private final HttpClient http;

  public InventoryClient() {
    CircuitBreakerConfig config = CircuitBreakerConfig.custom()
        .failureRateThreshold(50)
        .slidingWindowSize(20)
        .waitDurationInOpenState(Duration.ofSeconds(30))
        .permittedNumberOfCallsInHalfOpenState(3)
        .build();
    this.breaker = CircuitBreakerRegistry.of(config)
        .circuitBreaker("inventory-service");
    this.http = HttpClient.newHttpClient();
  }

  public StockLevel getStock(String sku) {
    return breaker.executeSupplier(() -> {
      HttpRequest req = HttpRequest.newBuilder()
          .uri(URI.create("http://inventory/stock/" + sku))
          .timeout(Duration.ofMillis(500))
          .GET().build();
      HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() >= 500) throw new DependencyException("inventory down");
      return StockLevel.parse(res.body());
    });
  }

  public StockLevel getStockWithFallback(String sku) {
    return Try.ofSupplier(CircuitBreaker.decorateSupplier(breaker,
            () -> getStock(sku)))
        .recover(CallNotPermittedException.class,
            e -> StockLevel.unknown("inventory circuit open"))
        .get();
  }
}`},{type:"code",language:"yaml",filename:"resilience4j-config.yaml",code:`resilience4j.circuitbreaker:
  instances:
    payment-service:
      slidingWindowSize: 50
      failureRateThreshold: 40
      waitDurationInOpenState: 45s
      permittedNumberOfCallsInHalfOpenState: 5
      recordExceptions:
        - java.io.IOException
        - org.springframework.web.client.HttpServerErrorException
      ignoreExceptions:
        - com.example.PaymentDeclinedException`},{type:"callout",variant:"warning",title:"Fallback is not free",body:"Stale cache fallbacks can show **wrong inventory** or **outdated balances**. Document degraded behavior and alert when circuits stay open \u2014 the dependency still needs fixing."},{type:"prosCons",title:"Trade-offs",pros:["Prevents thread/connection exhaustion on sick dependencies.","Fails fast \u2014 protects upstream latency SLOs.","Gives dependencies time to recover without retry storms."],cons:["Mis-tuned thresholds cause flapping or premature opens.","Fallbacks add complexity and consistency trade-offs.","Per-dependency configuration sprawl in large systems."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain closed, open, and half-open states.",answer:"**Closed**: normal calls, failures tracked. **Open**: breaker trips \u2014 calls rejected immediately. **Half-open**: after a cooldown, a few **probe** calls test recovery; success \u2192 closed, failure \u2192 open again."},{question:"How does a circuit breaker prevent cascade failure?",answer:"Without it, every service thread blocks on a down dependency, queues grow, and callers upstream also stall. The breaker **stops the bleed** \u2014 fast failures free resources so the rest of the system stays up."},{question:"Circuit breaker vs retry?",answer:"**Retry** helps **transient** blips. **Breaker** stops calling when failure is sustained \u2014 retries against a down service amplify load. Use both: limited retries while closed, then open the circuit."},{question:"What should count as a failure?",answer:"Typically **5xx**, timeouts, connection refused. Usually **not** 4xx business errors (declined card) \u2014 those are successful calls from the breaker\u2019s perspective."},{question:"Hystrix vs Resilience4j?",answer:"**Hystrix** (Netflix, maintenance mode) pioneered the pattern. **Resilience4j** is the modern lightweight JVM library with circuit breaker, retry, bulkhead, rate limiter \u2014 no servlet dependency."},{question:"Design checkout when inventory is down.",answer:"Open circuit on inventory \u2192 **fallback**: allow checkout with \u201Cavailability confirmed at dispatch\u201D or block add-to-cart only. Payment path stays protected; do not block all checkout threads on inventory timeouts."},{question:"How do you implement a distributed circuit breaker?",answer:"Share failure/success counts in a fast store (Redis) or push metrics to a sidecar so **all instances** see the same health signal \u2014 otherwise each pod opens independently and can still stampede the dependency. Keep thresholds, cooldown, and half-open probes consistent; accept slightly stale shared state over purely local breakers at large fan-out."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Circuit breaker = **fail fast** when a dependency is unhealthy.
2. States: **closed \u2192 open \u2192 half-open** with tuned thresholds.
3. Real uses: **Resilience4j, gateway filters, Netflix Hystrix legacy**.
4. Combine with **timeouts, bulkheads, and meaningful fallbacks** to stop cascades.`}]}]},r=t;export{r as default};
