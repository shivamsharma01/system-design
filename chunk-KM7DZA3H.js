import{a as e}from"./chunk-DS5L7ZHI.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Service Discovery** lets callers find **healthy instances** of a dependency without hard-coded hostnames. As pods scale up and down, a registry (or DNS layer) tracks who is alive so load balancers and clients route to current endpoints \u2014 essential for elastic microservice deployments."},{type:"callout",variant:"info",title:"Client-side vs server-side",body:"**Client-side**: the caller queries the registry and picks an instance (Eureka + Ribbon). **Server-side**: the client hits a stable load balancer; the LB discovers backends (Kubernetes Service + kube-proxy)."},{type:"table",caption:"Discovery styles compared.",headers:["Style","Who picks the instance?"],rows:[["Client-side","Calling service (with cached registry)"],["Server-side","Load balancer / ingress / mesh proxy"],["DNS-based","Resolver returns SRV/A records for current pods"],["Platform-native","Kubernetes Services, AWS Cloud Map, Consul"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **hospital directory board**: doctors check in when they arrive and remove their name when they leave. Patients do not memorize room numbers \u2014 they look at the live board (registry) to find an available specialist."},{type:"mermaid",caption:"Instances register; clients or load balancers resolve healthy targets.",definition:`sequenceDiagram
  participant S1 as payment-pod-1
  participant S2 as payment-pod-2
  participant R as Service Registry
  participant C as Order Service
  S1->>R: register (heartbeat)
  S2->>R: register (heartbeat)
  C->>R: lookup payment-service
  R-->>C: [pod-1, pod-2]
  C->>S2: charge (load balanced)`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce checkout","Order service discovers payment and inventory instances after autoscaling events"],["Food delivery","Dispatch service finds live rider-location and pricing services per city shard"],["Payments","Fraud-scoring microservice registry ensures only warmed instances receive auth traffic"],["Netflix-style microservices","Eureka registry with Ribbon client-side load balancing across AWS zones"],["Kubernetes","Cluster DNS `payment-service.default.svc.cluster.local` \u2192 ready endpoints only"],["Consul / AWS Cloud Map","Multi-cloud service catalog with health checks and DNS interface"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Registrations must include **health state** \u2014 unhealthy instances should drop from rotation quickly. Use **heartbeats** with TTL; stale entries cause black-holing. Cache registry data client-side but refresh on failures to avoid thundering herds."},{type:"code",language:"java",filename:"EurekaRegistration.java",code:`@SpringBootApplication
@EnableDiscoveryClient
public class PaymentServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(PaymentServiceApplication.class, args);
  }
}

// application.yml excerpt \u2014 registers with Eureka, exposes health
// eureka.client.serviceUrl.defaultZone: http://eureka:8761/eureka/
// management.endpoints.web.exposure.include: health,info

@RestController
public class ChargeController {
  private final RestTemplate lbRest; // @LoadBalanced RestTemplate

  public ChargeController(@LoadBalanced RestTemplate lbRest) {
    this.lbRest = lbRest;
  }

  @PostMapping("/charge")
  public Receipt charge(@RequestBody ChargeRequest req) {
    // "http://fraud-service/score" resolved via Eureka + client LB
    RiskScore score = lbRest.postForObject(
        "http://fraud-service/score", req, RiskScore.class);
    return process(req, score);
  }
}`},{type:"code",language:"yaml",filename:"kubernetes-service.yaml",code:`apiVersion: v1
kind: Service
metadata:
  name: payment-service
spec:
  selector:
    app: payment-service
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: payment-service
spec:
  containers:
    - name: payment
      image: payments/charge:1.2.0
      readinessProbe:
        httpGet:
          path: /health/ready
          port: 8080
        periodSeconds: 5`},{type:"callout",variant:"warning",title:"Stale registry entries",body:"If heartbeats lag during GC pauses or network partitions, callers may hit **dead instances**. Tune TTL, use **outlier detection** (Envoy/Istio), and fail fast with retries on connection errors."},{type:"prosCons",title:"Trade-offs",pros:["Enables dynamic scaling without config pushes.","Health-aware routing reduces failed requests.","Foundation for blue-green and canary deploys."],cons:["Registry is another critical component to operate.","Client-side discovery couples callers to registry SDKs.","Cache staleness can cause brief routing errors."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Client-side vs server-side service discovery?",answer:"**Client-side** (Eureka): caller fetches instances and load-balances. **Server-side** (K8s Service): caller hits a virtual IP; kube-proxy/LB picks pods. Server-side simplifies clients; client-side offers richer LB algorithms."},{question:"How does Kubernetes service discovery work?",answer:"**Services** get stable DNS names and cluster IPs. **Endpoints** (or EndpointSlices) list ready pod IPs. kube-proxy programs iptables/IPVS to forward traffic only to healthy pods."},{question:"What is Eureka\u2019s role in Netflix OSS?",answer:"**Service registry**: instances **register** and send **heartbeats**. Clients cache the registry and refresh periodically. Unhealthy instances evicted after missed heartbeats."},{question:"DNS-based discovery vs service registry?",answer:"DNS is simple and universal but often has **TTL caching** delays. Registries (Consul, Eureka) offer faster updates, health metadata, and APIs \u2014 at the cost of operating another system."},{question:"How does discovery interact with autoscaling?",answer:"New pods **register** when ready; terminated pods **deregister**. Discovery must converge faster than scale events to avoid routing to gone instances \u2014 readiness probes gate registration."},{question:"Service discovery vs API gateway?",answer:"Discovery is **internal** (\u201Cwhere is payment-service?\u201D). Gateway is **external** (\u201Chow do mobile clients enter the system?\u201D). Gateway often uses discovery to find upstream instances."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Service Discovery tracks **live instances** for dynamic microservice fleets.
2. **Client-side** (Eureka) vs **server-side** (K8s DNS/LB) \u2014 pick based on who load-balances.
3. Real uses: **checkout mesh, K8s Services, Consul, Netflix Eureka**.
4. Pair with **health checks** and fast deregistration to avoid stale routes.`}]}]},a=t;export{a as default};
