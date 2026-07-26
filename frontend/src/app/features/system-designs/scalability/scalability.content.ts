import { DesignContent } from '../../../shared/models';
import { SCALABILITY_META } from './scalability.meta';

const content: DesignContent = {
  meta: SCALABILITY_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Scalability** is the ability to handle growing load by adding resources — more CPU/RAM on one box, or more machines — without a full redesign.\n\nRelated: [Load Balancing](/designs/load-balancing-pattern), [Caching Strategies](/designs/caching-strategies), [CDN](/designs/cdn), [Sharding](/designs/sharding-pattern), [Autoscaling](/designs/autoscaling), [Message Queues](/designs/message-queues).',
        },
        {
          type: 'image',
          src: 'assets/article-images/scalability/01-what-is-scalability.png',
          alt: 'System handling increased load by adding capacity',
          caption:
            'Grow capacity as demand grows. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'why-scale',
      title: 'Why Systems Need to Scale',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/scalability/02-growth-drivers.png',
          alt: 'Growth in users, features, and data volume driving scale needs',
          caption: 'Users, features, data. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/scalability/03-growth-continued.png',
          alt: 'Growth in complexity and geographic reach',
          caption:
            'Complexity and geographic reach. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '1. **User base** — more concurrent sessions and QPS.\n2. **Features** — heavier compute per request.\n3. **Data volume** — larger stores, indexes, backups.\n4. **Complexity** — more services and dependencies.\n5. **Geographic reach** — latency and regional capacity.',
        },
      ],
    },
    {
      id: 'vertical-horizontal',
      title: 'Vertical vs Horizontal Scaling',
      blocks: [
        {
          type: 'markdown',
          value:
            '### Vertical (scale up)\nBigger machine: more CPU, RAM, disk. Simple; limited by hardware ceiling and becomes a SPOF risk.',
        },
        {
          type: 'image',
          src: 'assets/article-images/scalability/04-vertical-scaling.png',
          alt: 'Vertical scaling upgrading a single server to a more powerful machine',
          caption: 'Scale up one node. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### Horizontal (scale out)\nAdd more machines behind a balancer. Near-linear capacity if the app is **stateless** and data is partitionable.',
        },
        {
          type: 'image',
          src: 'assets/article-images/scalability/05-horizontal-scaling.png',
          alt: 'Horizontal scaling adding more servers behind a load balancer',
          caption: 'Scale out many nodes. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'featureComparison',
          caption: 'Scale up vs scale out.',
          columns: ['Vertical', 'Horizontal'],
          rows: [
            { feature: 'How', values: ['Bigger box', 'More boxes'] },
            { feature: 'Complexity', values: ['Low', 'Higher (LB, state, data)'] },
            { feature: 'Limit', values: ['Hardware ceiling', 'Coordination / data plane'] },
            { feature: 'Failure domain', values: ['One machine', 'Spread across nodes'] },
          ],
        },
      ],
    },
    {
      id: 'techniques',
      title: 'Techniques That Enable Scale',
      blocks: [
        {
          type: 'markdown',
          value: '### Load balancing\nDistribute requests across instances.',
        },
        {
          type: 'image',
          src: 'assets/article-images/scalability/06-load-balancing.png',
          alt: 'Load balancing as a scalability technique',
          caption: 'LB spreads load. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### Caching\nServe hot data from memory/Redis to cut DB load — [Caching Strategies](/designs/caching-strategies).',
        },
        {
          type: 'image',
          src: 'assets/article-images/scalability/07-caching.png',
          alt: 'Caching layer reducing load on the primary database',
          caption:
            'Cache in front of expensive stores. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### CDN & sharding\nPush static/media to the edge ([CDN](/designs/cdn)); split data across shards ([Sharding](/designs/sharding-pattern)).',
        },
        {
          type: 'image',
          src: 'assets/article-images/scalability/08-cdn-sharding.png',
          alt: 'CDN edge delivery and database sharding for scale',
          caption:
            'Edge delivery and data partitioning. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### Async, microservices, auto-scaling, multi-region\nQueues absorb spikes; services scale independently; autoscalers add/remove pods; multi-region cuts latency and improves disaster resilience.',
        },
        {
          type: 'image',
          src: 'assets/article-images/scalability/09-async-microservices.png',
          alt: 'Async messaging and microservices enabling independent scale',
          caption:
            'Async + services + autoscaling. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'java-spring',
      title: 'Java / Spring Notes',
      blocks: [
        {
          type: 'markdown',
          value:
            '- Keep apps **stateless**; sessions in Redis so any pod can serve any request.\n- Horizontal: Kubernetes HPA / Cloud autoscaling on CPU or custom QPS metrics.\n- Vertical: raise JVM heap carefully (`-Xmx`) and container limits together.\n- Offload work with `@Async`, Kafka/`@KafkaListener`, or Spring AMQP — don’t grow request threads unbounded.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'StatelessHint.java',
          code: `// Bad for scale-out: HttpSession with large in-memory state
// Better: Spring Session + Redis, or JWT + server-side cache for hot data

@Cacheable("products")
public Product getProduct(long id) { return repo.findById(id).orElseThrow(); }`,
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
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “System Design: What is Scalability?,” with Spring/K8s notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
