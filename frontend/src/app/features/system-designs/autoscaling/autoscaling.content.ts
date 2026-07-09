import { DesignContent } from '../../../shared/models';
import { AUTOSCALING_META } from './autoscaling.meta';

const content: DesignContent = {
  meta: AUTOSCALING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Autoscaling** automatically adds or removes capacity based on metrics — CPU, memory, RPS, queue depth, or custom business signals. The goal is to meet demand without permanent over-provisioning, while respecting cool-downs and dependency limits.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Horizontal vs vertical',
          body: '**Horizontal** (more instances) is the cloud default. **Vertical** (bigger machines) is limited and often requires restarts. Interviews usually mean horizontal pod/VM autoscaling.',
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
          body: 'A supermarket opening **more checkout counters** when queues grow, and closing them when idle — with a delay so you do not hire and fire cashiers every minute (cool-down).',
        },
        {
          type: 'mermaid',
          caption: 'Metric → controller → more/fewer replicas.',
          definition: `flowchart LR
  M[Metrics: CPU / queue depth] --> C[Autoscaler]
  C -->|scale out| P[More pods]
  C -->|scale in| Q[Fewer pods]`,
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
            ['Kubernetes', 'HPA, KEDA (event-driven), Cluster Autoscaler'],
            ['AWS', 'Auto Scaling Groups, Application Auto Scaling'],
            ['Consumers', 'Scale workers on Kafka lag / SQS depth'],
            ['Serverless', 'Lambda concurrency scaling (managed)'],
            ['Batch', 'Spin up workers for nightly jobs, scale to zero after'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'code',
          language: 'yaml',
          filename: 'hpa.example.yaml',
          code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: checkout
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: checkout
  minReplicas: 3
  maxReplicas: 30
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    # Prefer queue-depth / RPS for I/O-bound services when available`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Scaling is not free',
          body: 'More app pods can overwhelm a **database** or third-party API. Pair autoscaling with **connection pool limits**, bulkheads, and sometimes admission control.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Matches capacity to demand; improves cost efficiency.',
            'Absorbs traffic spikes when warm-up is fast enough.',
            'Event-driven scaling fits queue-based workloads well.',
          ],
          cons: [
            'Cold start / warm-up lag can miss short spikes.',
            'Flapping without cool-downs and stabilization windows.',
            'Can amplify downstream overload if unbounded.',
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
              question: 'How does autoscaling work at a high level?',
              answer:
                'A controller compares **current metrics** to targets and adjusts desired replica count within min/max, often with cool-downs to prevent thrashing.',
            },
            {
              question: 'CPU-based HPA vs queue-depth scaling?',
              answer:
                'CPU works for CPU-bound services but lags for I/O-bound ones. **Queue lag / depth** better represents backlog for consumers and async workers.',
            },
            {
              question: 'What is a cool-down / stabilization window?',
              answer:
                'A delay before scaling again so noisy metrics do not constantly add/remove instances (flapping).',
            },
            {
              question: 'Why can autoscaling make an outage worse?',
              answer:
                'Scale-out increases concurrent calls to a sick dependency (DB, payment API), exhausting it further. Use limits, bulkheads, and load shedding.',
            },
            {
              question: 'Scale to zero — when is it OK?',
              answer:
                'For bursty, latency-tolerant workloads (batch, some serverless). Not for always-on low-latency APIs unless you accept cold starts or keep a minimum warm set.',
            },
            {
              question: 'HLD tip for e-commerce?',
              answer:
                'Autoscale checkout/API on RPS or CPU; autoscale workers on order-queue depth; keep DB capacity and pool sizes as hard constraints in the design.',
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
          body: '1. Autoscale from the **right metric** (not only CPU).\n2. Use min/max, cool-downs, and downstream limits.\n3. Real uses: **HPA, ASG, KEDA, serverless**.\n4. Scaling out can hurt sick dependencies — design for that.',
        },
      ],
    },
  ],
};

export default content;
