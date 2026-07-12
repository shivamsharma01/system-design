import{a as e}from"./chunk-TAKMSEP2.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Load balancing** spreads incoming traffic across a pool of healthy backends so no single instance becomes a bottleneck. It is the foundation of horizontal scale: add capacity by adding instances, and let the balancer decide *where* each request goes."},{type:"callout",variant:"info",title:"What interviewers want",body:"Name **L4 vs L7**, pick an **algorithm** with a reason, explain **health checks** and **draining**, and know when **sticky sessions** hurt. Contrast load balancers with **API Gateway** (edge features) and **service mesh** (east-west policy)."},{type:"table",caption:"Where load balancing shows up.",headers:["Layer","Example"],rows:[["DNS / GSLB","Route users to the nearest region"],["Edge / reverse proxy","Nginx, HAProxy, AWS ALB in front of app pods"],["L4 network","AWS NLB, LVS \u2014 TCP/UDP without inspecting HTTP"],["Client-side","gRPC client pickers, Envoy sidecar, Consuls"],["Database / cache","ProxySQL, Redis Cluster hashing"]]}]},{id:"l4-vs-l7",title:"L4 vs L7",blocks:[{type:"markdown",value:"**Layer 4 (transport)** balances on IP/port and TCP/UDP connection state. It is fast, protocol-agnostic, and cannot route on HTTP path or headers. **Layer 7 (application)** terminates (or inspects) HTTP/gRPC and can route by host, path, cookie, or header \u2014 at higher CPU and latency cost."},{type:"table",caption:"L4 vs L7 at a glance.",headers:["Dimension","L4 (NLB, LVS)","L7 (ALB, Nginx http, Envoy)"],rows:[["Sees","IP, port, TCP/UDP","HTTP method, path, headers, cookies"],["Routing","Per connection / 5-tuple","Per request; content-based"],["TLS","Often passthrough (or terminate once)","Usually terminate; can re-encrypt"],["Latency / throughput","Very high throughput, low overhead","More CPU; richer features"],["Use when","Raw TCP, gaming, Kafka, extreme QPS","Microservices HTTP, path routing, WAF"]]},{type:"callout",variant:"tip",title:"AWS shorthand",body:"**NLB** \u2248 L4 (connection-level, static IPs, ultra low latency). **ALB** \u2248 L7 (HTTP/HTTPS, path/host rules, target groups). Many stacks use NLB \u2192 Envoy/ALB for both speed and smart routing."},{type:"mermaid",caption:"Edge L7 balancer in front of a service pool.",definition:`flowchart LR
  Client --> LB["Load Balancer\\n(L4 or L7)"]
  LB --> A[Instance A]
  LB --> B[Instance B]
  LB --> C[Instance C]
  HC[Health checks] -.-> A
  HC -.-> B
  HC -.-> C`}]},{id:"algorithms",title:"Balancing Algorithms",blocks:[{type:"markdown",value:"Pick the algorithm from **traffic shape** and **session affinity** needs \u2014 not from habit. Interview answers should justify the choice."},{type:"table",caption:"Common algorithms and when to use them.",headers:["Algorithm","How it works","Best for","Watch out"],rows:[["Round-robin","Next backend in a cycle","Homogeneous instances, similar request cost","Ignores load; one slow host still gets equal share"],["Weighted RR","RR with weights (e.g. 3:1 for larger VMs)","Mixed instance sizes; canary (send 5% to v2)","Weights must track real capacity"],["Least connections","Pick backend with fewest active connections","Long-lived or uneven request durations","Needs accurate connection counts"],["Consistent hashing","Hash key \u2192 ring; minimal remapping on churn","Caches, sticky sharding, session affinity without sticky IP","Hot keys; use virtual nodes \u2014 see Consistent Hashing"],["IP hash (sticky)","Hash client IP \u2192 fixed backend","Simple session stickiness without cookies","NAT hides many clients behind one IP; uneven load"]]},{type:"code",language:"python",filename:"round_robin.py",code:`from itertools import cycle
from typing import List

class RoundRobin:
    def __init__(self, backends: List[str]):
        self._cycle = cycle(backends)
        self._healthy = set(backends)

    def mark_unhealthy(self, backend: str) -> None:
        self._healthy.discard(backend)

    def next(self) -> str:
        # Skip unhealthy; in production use a filtered pool + health watch.
        for _ in range(len(self._healthy) or 1):
            b = next(self._cycle)
            if b in self._healthy:
                return b
        raise RuntimeError("no healthy backends")`},{type:"code",language:"java",filename:"LeastConnections.java",code:`import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

record Backend(String id, AtomicInteger active) {}

public class LeastConnections {
  private final List<Backend> pool;

  public LeastConnections(List<Backend> pool) {
    this.pool = pool;
  }

  public Backend pick() {
    return pool.stream()
        .min(Comparator.comparingInt(b -> b.active().get()))
        .orElseThrow();
  }

  public void withConnection(Backend b, Runnable work) {
    b.active().incrementAndGet();
    try {
      work.run();
    } finally {
      b.active().decrementAndGet();
    }
  }
}`},{type:"callout",variant:"warning",title:"Sticky sessions trade-offs",body:"Cookie or IP stickiness simplifies in-memory sessions but **hurts scale-out and draining**: one hot user pins load to one pod. Prefer **external session store** (Redis) and **stateless apps** so any instance can serve any request. Use stickiness only when you must (WebSocket affinity, legacy apps)."}]},{id:"health-and-draining",title:"Health Checks and Connection Draining",blocks:[{type:"markdown",value:"A balancer that ignores health is a **random outage distributor**. Health checks remove bad targets; **connection draining** (deregistration delay) finishes in-flight work before the instance dies."},{type:"table",headers:["Mechanism","Purpose"],rows:[["Liveness probe","Process alive? Restart if not (orchestrator)"],["Readiness / target health","Ready for traffic? Balancer stops sending if not"],["Deep health","Can reach DB / dependency? Use carefully \u2014 cascading fails"],["Connection draining","Stop new requests; wait for active ones (e.g. 30\u2013300s)"],["Outlier detection","Eject hosts with high error rate (Envoy) without full redeploy"]]},{type:"mermaid",caption:"Deploy with drain before terminate.",definition:`sequenceDiagram
  participant O as Orchestrator
  participant LB as Load balancer
  participant P as Pod
  O->>LB: Mark draining / deregister
  LB-->>P: No new connections
  P->>P: Finish in-flight requests
  O->>P: SIGTERM / terminate
  O->>LB: Register new healthy pod`},{type:"callout",variant:"tip",title:"Health check design",body:"Keep readiness **cheap and local** (process up, listens on port). Avoid calling downstreams in every probe or a DB blip marks *all* pods unhealthy and you take the whole fleet offline."}]},{id:"hardware-vs-software",title:"Hardware vs Software Balancers",blocks:[{type:"markdown",value:"Classic **hardware appliances** (F5, Citrix) still exist in enterprises. Most cloud-native systems use **software**: reverse proxies and managed LBs."},{type:"table",caption:"Common software / cloud options.",headers:["Product","Typical role"],rows:[["Nginx / HAProxy","L4/L7 reverse proxy; TLS termination; simple RR/least-conn"],["Envoy","L7 proxy; filters; gRPC; mesh data plane; advanced retries"],["AWS ALB","Managed L7; path/host rules; target groups; WAF integration"],["AWS NLB","Managed L4; millions of connections; static IPs; TCP/UDP"],["GCE / Azure LB","Cloud L4/L7 analogues with regional/global options"]]},{type:"prosCons",title:"Software / cloud LB trade-offs",pros:["Elastic capacity; no rack appliances to refresh.","Config-as-code; integrates with K8s Ingress / Gateway API.","Rich L7 features (retries, header routing, observability)."],cons:["You own tuning, timeouts, and certificate lifecycle (unless fully managed).","Misconfigured health checks cause flapping.","Single poorly sized LB tier can itself become the bottleneck."]}]},{id:"vs-gateway-mesh",title:"vs API Gateway and Service Mesh",blocks:[{type:"markdown",value:"These layers overlap on \u201Crouting traffic\u201D but solve different problems. Saying \u201Cjust put a load balancer\u201D when the interviewer means edge auth or mesh mTLS is a common miss."},{type:"table",caption:"Cross-link: Load balancer vs API Gateway vs Service Mesh.",headers:["Concern","Load balancer","API Gateway","Service mesh"],rows:[["Primary job","Distribute load across instances","North-south edge: auth, rate limit, aggregate","East-west policy: mTLS, retries, telemetry"],["Traffic","Any TCP/HTTP pool","External clients \u2192 services","Service \u2194 service inside cluster"],["Awareness","Targets + health","APIs, tenants, quotas","Service identity, mesh config"],["See also","This page","API Gateway","Service Mesh / Sidecar / Ambassador"]]},{type:"callout",variant:"info",title:"Typical composition",body:"Internet \u2192 **CDN** \u2192 **API Gateway / L7 LB** \u2192 services. Inside the cluster, **kube-proxy / NLB / mesh** load-balances pod-to-pod. You often have *both* an edge balancer and internal balancing \u2014 they are not alternatives."}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"L4 vs L7 load balancing \u2014 when do you choose each?",answer:"**L4** for raw TCP/UDP, max throughput, or when you must not terminate TLS at the LB. **L7** when you need path/host routing, header-based canaries, or HTTP retries. Many designs use L4 at the edge VIP and L7 closer to apps."},{question:"Round-robin vs least connections?",answer:"**RR** assumes similar request cost and capacity. **Least connections** adapts when some requests are long-lived (uploads, WebSockets) so busy hosts get fewer new connections."},{question:"How does consistent hashing help load balancing?",answer:"Hashing a key (user id, cache key) onto a ring keeps most mappings stable when nodes join/leave \u2014 ideal for **cache affinity** and **shard stickiness**. Use **virtual nodes** to reduce imbalance."},{question:"What are sticky sessions and why avoid them?",answer:"Affinity pins a client to one backend (cookie/IP hash). They break **even load**, complicate **deploys/draining**, and fail behind **NAT**. Prefer shared session storage and sticky-free apps."},{question:"Explain connection draining.",answer:"Before terminating an instance, **stop sending new traffic** and wait for in-flight requests to finish (or timeout). Prevents 502s during rolling deploys."},{question:"ALB vs NLB on AWS?",answer:"**ALB**: L7 HTTP/HTTPS, path rules, target groups. **NLB**: L4, ultra-low latency, static IPs, TCP/UDP/TLS passthrough \u2014 better for extreme connection counts or non-HTTP protocols."},{question:"How do health checks interact with cascading failure?",answer:"If every readiness probe depends on a shared DB, a DB blip marks all backends unhealthy and the LB has nowhere to send traffic. Keep probes local; use separate **deep checks** for alerting, not traffic removal."},{question:"Load balancer vs API Gateway vs service mesh?",answer:"**LB** spreads load. **API Gateway** adds edge concerns (auth, throttling, BFF aggregation). **Mesh** applies uniform **east-west** security and resilience without app code. They stack; they do not replace each other one-for-one."},{question:"How would you load-balance gRPC?",answer:"Prefer L7 proxies that understand HTTP/2 (Envoy, modern ALB). Client-side load balancing with a resolver is common in gRPC ecosystems. Avoid naive L4 RR that pins all streams of one long-lived connection to one backend forever without careful connection management."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. **L4** = speed and protocols; **L7** = smart HTTP routing.
2. Algorithms: **RR, weighted RR, least connections, consistent hashing, IP hash** \u2014 justify the pick.
3. **Health checks + draining** make deploys safe; sticky sessions are a last resort.
4. Software (Nginx, Envoy, ALB/NLB) dominates; compose with **API Gateway** and **mesh**, do not confuse them.`}]}]},n=t;export{n as default};
