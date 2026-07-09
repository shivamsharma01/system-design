import { DesignContent } from '../../../shared/models';
import { CHAOS_ENGINEERING_META } from './chaos-engineering.meta';

const content: DesignContent = {
  meta: CHAOS_ENGINEERING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Chaos Engineering** is the practice of running **controlled experiments** that inject failures into a system to learn whether it meets resilience hypotheses. You break things on purpose — carefully — so production surprises become rare.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Scientific method',
          body: 'State a hypothesis (“if Redis dies, checkout still works via cache/DB”), inject fault, measure, improve. Chaos without hypotheses and blast-radius limits is just vandalism.',
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
          body: 'Fire drills and earthquake drills: you practice failure when stakes are controlled so the real emergency is not the first time people discover the exits are locked.',
        },
        {
          type: 'mermaid',
          caption: 'Hypothesis → inject → observe → improve.',
          definition: `flowchart LR
  H[Hypothesis] --> I[Inject fault]
  I --> O[Observe SLOs]
  O --> F{Holds?}
  F -->|yes| C[Increase confidence]
  F -->|no| Fix[Fix gaps] --> H`,
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
            ['Netflix heritage', 'Chaos Monkey terminating instances'],
            ['Kubernetes', 'Chaos Mesh, LitmusChaos experiments'],
            ['SaaS platforms', 'Gremlin, AWS FIS fault injection'],
            ['Game days', 'Team exercises with scripted failure scenarios'],
            ['CI / staging', 'Automated pod-kill and network latency tests'],
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
          value: 'Start small: kill one non-critical pod in staging, then graduate to production with strict abort conditions.',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'pod-kill.experiment.yaml',
          code: `# Conceptual Chaos Mesh style experiment
kind: PodChaos
metadata:
  name: checkout-pod-kill
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces:
      - payments
    labelSelectors:
      app: checkout
  duration: "30s"
# Abort if checkout error rate > 1% during the window`,
        },
        {
          type: 'bestPractices',
          practices: [
            'Define **blast radius** (one AZ, one service, % of traffic).',
            'Require **observability** and a kill switch before production chaos.',
            'Run during business-ready hours with on-call aware.',
            'Track learnings as reliability backlog items, not theater.',
          ],
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Surfaces hidden single points of failure.',
            'Validates timeouts, retries, and degradation for real.',
            'Builds operational muscle memory.',
          ],
          cons: [
            'Risk of customer impact if poorly controlled.',
            'Needs mature monitoring and culture.',
            'Easy to cargo-cult without fixing findings.',
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
              question: 'What is chaos engineering?',
              answer:
                'Running **controlled failure experiments** to verify that a system behaves as expected under adverse conditions, guided by hypotheses and limited blast radius.',
            },
            {
              question: 'Is randomly killing pods enough?',
              answer:
                'Killing pods is one experiment. Mature chaos also injects **latency, packet loss, disk full, dependency errors**, and verifies business SLOs — not just “did the pod restart.”',
            },
            {
              question: 'How does it relate to resilience patterns?',
              answer:
                'Chaos **tests** whether timeouts, circuit breakers, bulkheads, and graceful degradation actually work under failure — it does not replace those patterns.',
            },
            {
              question: 'When should you start chaos in production?',
              answer:
                'After staging success, with strong metrics, abort criteria, and stakeholder buy-in. Many teams begin with game days and non-critical services.',
            },
            {
              question: 'Famous example?',
              answer:
                'Netflix **Chaos Monkey** (and the Simian Army) popularized continuously terminating instances to enforce instance-level resilience.',
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
          body: '1. Chaos = **hypothesis-driven fault injection**.\n2. Limit blast radius; abort on SLO burn.\n3. Real uses: **Chaos Monkey, Chaos Mesh, game days**.\n4. Use findings to harden resilience patterns.',
        },
      ],
    },
  ],
};

export default content;
