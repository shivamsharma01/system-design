import { DesignContent } from '../../../shared/models';
import { AVAILABILITY_META } from './availability.meta';

const content: DesignContent = {
  meta: AVAILABILITY_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Availability** is the proportion of time a system is operational and reachable when users need it — usually expressed as a percentage of uptime.\n\n`Availability = Uptime / (Uptime + Downtime)`\n\nRelated: [Avoiding SPOFs](/designs/single-point-of-failure), [CAP Availability](/designs/cap-pacelc#pillars) (response vs freshness — different meaning), [Load Balancing](/designs/load-balancing-pattern).',
        },
        {
          type: 'image',
          src: 'assets/article-images/availability/01-definition.png',
          alt: 'Availability defined as uptime over uptime plus downtime',
          caption: 'Uptime vs downtime. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'nines',
      title: 'Availability Tiers (Nines)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Availability is often spoken in **“nines.”** Each extra nine is roughly a **10×** reduction in allowed downtime. Plan capacity and failover against the **downtime budget** your SLA implies.',
        },
        {
          type: 'image',
          src: 'assets/article-images/availability/02-nines-table.png',
          alt: 'Table of availability percentages and corresponding yearly downtime',
          caption:
            'Nines and approximate downtime per year. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'table',
          caption: 'Common targets (approx. downtime / year).',
          headers: ['Availability', 'Downtime / year', 'Nickname'],
          rows: [
            ['99% (two nines)', '~3.65 days', 'Basic'],
            ['99.9% (three nines)', '~8.76 hours', 'Common SaaS'],
            ['99.99% (four nines)', '~52.6 minutes', 'High'],
            ['99.999% (five nines)', '~5.26 minutes', 'Carrier-grade'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'SLA vs SLO vs SLI',
          body: '**SLI** — measured signal (e.g. successful requests %). **SLO** — internal target. **SLA** — contractual promise (often with credits). Design to the SLO with headroom under the SLA.',
        },
      ],
    },
    {
      id: 'strategies',
      title: 'Strategies for Improving Availability',
      blocks: [
        {
          type: 'markdown',
          value:
            '### 1. Redundancy\nBackup components take over when primaries fail — servers, DB replicas, geographic copies.',
        },
        {
          type: 'image',
          src: 'assets/article-images/availability/03-redundancy.png',
          alt: 'Redundant servers and databases for failover',
          caption:
            'Server, database, and geographic redundancy. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 2. Load balancing\nSpread traffic so one sick node does not take all load. See [Load Balancing Pattern](/designs/load-balancing-pattern).',
        },
        {
          type: 'image',
          src: 'assets/article-images/availability/04-load-balancing.png',
          alt: 'Load balancer distributing traffic for higher availability',
          caption:
            'LB + health checks keep traffic on healthy nodes. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 3. Failover\nAutomatic or manual promotion of standby (active-passive) or traffic shift (active-active) when health checks fail.',
        },
        {
          type: 'image',
          src: 'assets/article-images/availability/05-failover.png',
          alt: 'Failover switching traffic from a failed primary to a standby',
          caption:
            'Detect failure → promote / reroute. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 4. Data replication\nKeep copies so a node or AZ loss does not lose the dataset. Sync vs async trades consistency for lag — see [CAP](/designs/cap-pacelc).',
        },
        {
          type: 'image',
          src: 'assets/article-images/availability/06-replication.png',
          alt: 'Primary database replicating to secondary replicas',
          caption:
            'Replicas for read scale and failover. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 5. Monitoring and alerts\nYou cannot fix what you do not see — SLOs, paging, runbooks.',
        },
      ],
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      blocks: [
        {
          type: 'bestPractices',
          title: 'High-availability habits',
          practices: [
            '**Design for failure** — assume every component can die.',
            '**Health checks** — LB and orchestrators remove bad instances.',
            '**Multiple AZs / regions** — survive datacenter and regional events.',
            '**Chaos engineering** — inject failures before production does.',
            '**Circuit breakers** — stop cascading dependency failures.',
            '**Caching** — reduce load on critical paths (with stale fallbacks).',
            '**Capacity planning** — headroom for peaks and failover load.',
          ],
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
          filename: 'AvailabilityHooks.java',
          code: `// Readiness so the LB stops sending traffic during shutdown/drain
@Endpoint(id = "readiness")
public class ReadinessEndpoint {
  private volatile boolean ready = true;
  public Map<String, String> readiness() {
    return Map.of("status", ready ? "UP" : "DOWN");
  }
  public void drain() { ready = false; }
}

@CircuitBreaker(name = "dependency", fallbackMethod = "fallback")
public String callDep() { return client.get(); }

String fallback(Throwable t) { return cachedOrDefault(); }`,
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
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “What is Availability?,” with Spring Actuator / Resilience4j notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
