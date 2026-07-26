import { DesignContent } from '../../../shared/models';
import { SINGLE_POINT_OF_FAILURE_META } from './single-point-of-failure.meta';

const content: DesignContent = {
  meta: SINGLE_POINT_OF_FAILURE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **Single Point of Failure (SPOF)** is any component whose failure can take down the whole system (or a large slice of it). Minimizing SPOFs is core to reliability and high availability.\n\nRelated: [Availability (nines & strategies)](/designs/availability), [Load Balancing](/designs/load-balancing-pattern), [Health Check](/designs/health-check), [Graceful Degradation](/designs/graceful-degradation), [Bulkhead](/designs/bulkhead), [Quorum](/designs/quorum).',
        },
        {
          type: 'image',
          src: 'assets/article-images/single-point-of-failure/01-spof-intro.png',
          alt: 'Illustration of a single component whose failure stops the entire system',
          caption:
            'One critical component can sink the system. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'understanding',
      title: 'Understanding SPOFs',
      blocks: [
        {
          type: 'markdown',
          value:
            'SPOFs can be a lone server, load balancer, database primary, network link, DNS provider, or shared cache used as a hard dependency.\n\nIn a typical multi-tier design, watch the **LB**, **primary DB**, and any **shared middleware**. App servers behind an LB are usually not SPOFs if N≥2. A cache is often **not** a true SPOF if the app can fall back to the DB (degraded mode).',
        },
        {
          type: 'image',
          src: 'assets/article-images/single-point-of-failure/02-example-architecture.png',
          alt: 'Example architecture highlighting potential single points of failure',
          caption:
            'Map each hop and ask what happens if it dies. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'identify',
      title: 'How to Identify SPOFs',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Four steps',
          practices: [
            '**Map the architecture** — draw clients → edge → services → data stores.',
            '**Dependency analysis** — if only one instance serves a hop, flag it.',
            '**Failure impact assessment** — would users stop or severely degrade?',
            '**Chaos testing** — kill the component in staging/prod-like env and observe.',
          ],
        },
      ],
    },
    {
      id: 'strategies',
      title: 'Strategies to Avoid SPOFs',
      blocks: [
        {
          type: 'markdown',
          value:
            '### 1. Redundancy\nRun multiple instances of every critical tier (active-active or active-passive).',
        },
        {
          type: 'image',
          src: 'assets/article-images/single-point-of-failure/03-redundancy.png',
          alt: 'Redundant servers replacing a single server SPOF',
          caption:
            'Duplicate critical components. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 2. Load balancing\nDistribute traffic across healthy instances; remove failed nodes from the pool. See [Load Balancing Pattern](/designs/load-balancing-pattern).',
        },
        {
          type: 'image',
          src: 'assets/article-images/single-point-of-failure/04-load-balancing.png',
          alt: 'Load balancer distributing traffic across multiple application servers',
          caption:
            'LB + health checks avoid pinning to one app box. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 3–4. Data replication & geographic distribution\nReplicate data (sync/async) across AZs/regions; place capacity near users so a regional outage is survivable.',
        },
        {
          type: 'image',
          src: 'assets/article-images/single-point-of-failure/05-replication-geo.png',
          alt: 'Data replication and multi-region distribution to survive regional failures',
          caption:
            'Replication and multi-region layout. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 5. Graceful failure handling\nTimeouts, retries with backoff, circuit breakers, fallbacks — don’t let one dependency cascade. See [Graceful Degradation](/designs/graceful-degradation).\n\n### 6. Monitoring and alerting\nDetect failures before users do: health checks, SLOs, on-call. Blind systems still have SPOFs — you just discover them later.',
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
          filename: 'HealthAndResilience.java',
          code: `// Expose readiness so the LB removes bad instances
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
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'LB is often forgotten',
          body: 'A single load balancer/DNS entry can itself be a SPOF — use managed multi-AZ LBs, anycast, or DNS failover. Same for a lone Redis used as a hard dependency without DB fallback.',
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
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “System Design: How to Avoid Single Point of Failures?,” with Spring health/resilience notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
