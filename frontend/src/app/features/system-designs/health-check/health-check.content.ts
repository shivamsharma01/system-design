import { DesignContent } from '../../../shared/models';
import { HEALTH_CHECK_META } from './health-check.meta';

const content: DesignContent = {
  meta: HEALTH_CHECK_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Health Check** pattern exposes endpoints (or signals) that report whether an instance is **alive** and **ready** to receive traffic. Orchestrators and load balancers use these signals to restart unhealthy pods and to stop routing to instances that are still starting or overloaded.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Liveness vs readiness',
          body: '**Liveness**: “Should this process be restarted?” (deadlock, stuck). **Readiness**: “Should this instance get traffic?” (warm-up, dependency down). Confusing them causes restart storms or black-holing traffic.',
        },
        {
          type: 'table',
          caption: 'Common probe types.',
          headers: ['Probe', 'Question it answers'],
          rows: [
            ['Liveness', 'Is the process healthy enough to keep running?'],
            ['Readiness', 'Can it safely handle user requests right now?'],
            ['Startup', 'Has a slow-starting app finished initializing?'],
          ],
        },
      ],
    },
    {
      id: 'concept',
      title: 'Concept and analogy',
      blocks: [
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A **restaurant open/closed sign** (readiness) vs calling an ambulance when the chef collapses (liveness). Guests should not be seated if the kitchen is not ready — but you do not demolish the building for a temporary ingredient shortage.',
        },
        {
          type: 'mermaid',
          caption: 'Orchestrator uses probes to manage traffic and restarts.',
          definition: `sequenceDiagram
  participant LB as Load Balancer / kube-proxy
  participant P as Pod
  LB->>P: readinessProbe
  alt ready
    LB->>P: send traffic
  else not ready
    LB-->>LB: remove from endpoints
  end
  Note over P: liveness fail → restart pod`,
        },
      ],
    },
    {
      id: 'where-used',
      title: 'Where it is used',
      blocks: [
        {
          type: 'table',
          headers: ['Domain', 'Example'],
          rows: [
            ['Kubernetes', 'livenessProbe / readinessProbe / startupProbe'],
            ['Spring Boot', 'Actuator `/actuator/health`, `/health/liveness`, `/health/readiness`'],
            ['Cloud LBs', 'AWS ALB / GCP health checks on target groups'],
            ['Service mesh', 'Outlier detection + active health checks'],
            ['Serverless warm-up', 'Custom ready gates before accepting events'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Keep liveness **cheap and local**. Put dependency checks on **readiness** (or a separate deep health) so a down database does not restart every pod in a loop.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'HealthEndpoints.java',
          code: `@RestController
public class HealthEndpoints {
  private final AtomicBoolean ready = new AtomicBoolean(false);
  private final DataSource dataSource;

  public HealthEndpoints(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @PostConstruct
  void warmUp() {
    // load caches, migrate, etc.
    ready.set(true);
  }

  /** Liveness: process is up. Do NOT check the database here. */
  @GetMapping("/health/live")
  public ResponseEntity<String> live() {
    return ResponseEntity.ok("OK");
  }

  /** Readiness: safe to receive traffic. */
  @GetMapping("/health/ready")
  public ResponseEntity<String> ready() {
    if (!ready.get()) {
      return ResponseEntity.status(503).body("STARTING");
    }
    try (Connection c = dataSource.getConnection()) {
      c.isValid(1);
      return ResponseEntity.ok("READY");
    } catch (SQLException e) {
      return ResponseEntity.status(503).body("DB_DOWN");
    }
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Anti-pattern',
          body: 'A liveness probe that calls Redis, Kafka, and three downstream APIs. When any dependency blips, Kubernetes kills and restarts pods — amplifying the outage.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Automates removal of bad instances from rotation.',
            'Enables zero-downtime deploys (drain via readiness).',
            'Gives operators a standard “is it OK?” signal.',
          ],
          cons: [
            'Misconfigured probes cause flapping or restart storms.',
            'Deep checks on liveness couple process life to dependencies.',
            'Shared health endpoints can become hot paths under large clusters.',
          ],
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      blocks: [
        {
          type: 'interviewQa',
          items: [
            {
              question: 'Liveness vs readiness — what is the difference?',
              answer:
                '**Liveness** decides whether to **restart** the process. **Readiness** decides whether to **send traffic**. A pod can be alive but not ready (still warming caches).',
            },
            {
              question: 'Should readiness fail if a non-critical dependency is down?',
              answer:
                'Often **no** — prefer graceful degradation and keep serving core traffic. Fail readiness for dependencies that make the instance useless or dangerous (e.g. cannot accept writes).',
            },
            {
              question: 'What is a startup probe for?',
              answer:
                'Slow-starting apps: give them longer to initialize without killing them via liveness. Once started, normal liveness/readiness take over.',
            },
            {
              question: 'How do health checks help rolling deploys?',
              answer:
                'New pods only receive traffic when ready; old pods go not-ready (connection draining) before termination — reducing dropped requests.',
            },
            {
              question: 'Health check vs circuit breaker?',
              answer:
                'Health checks are mostly **platform routing / restart**. Circuit breakers are **in-process** protection when calling a dependency. Both improve resilience at different layers.',
            },
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'callout',
          variant: 'summary',
          title: 'Key takeaways',
          body: '1. Expose **liveness** and **readiness** separately.\n2. Keep liveness local; put dependency checks on readiness carefully.\n3. Real uses: **Kubernetes, Actuator, cloud LBs**.\n4. Bad probes can worsen outages — design them deliberately.',
        },
      ],
    },
  ],
};

export default content;
