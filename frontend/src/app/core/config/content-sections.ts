import { ContentSectionMeta } from '../../shared/models';

/**
 * Ordered top-level catalog sections. System Design is one peer among others,
 * not the root of the app.
 */
export const CONTENT_SECTIONS: ContentSectionMeta[] = [
  {
    id: 'interview-questions',
    title: 'Interview Questions',
    description: 'Backend interview prep — Java, Spring Boot, Kafka, and Kubernetes.',
    order: 0,
  },
  {
    id: 'fundamentals',
    title: 'Fundamentals',
    description:
      'CAP/PACELC, delivery semantics, back-of-envelope math, ID generation, and other building blocks.',
    order: 1,
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Product deep-dives, capacity math, trade-offs, and the interview framework.',
    order: 2,
  },
  {
    id: 'high-level-design',
    title: 'High Level Design',
    description:
      'Top interview HLD problems — requirements, capacity, architecture, and trade-offs.',
    order: 3,
  },
  {
    id: 'low-level-design',
    title: 'Low Level Design',
    description:
      'Top interview LLD problems — class design, patterns, flows, and follow-up questions.',
    order: 4,
  },
  {
    id: 'design-patterns',
    title: 'Design Patterns',
    description: 'GoF, concurrency, architectural, distributed, cloud, messaging, and ML patterns.',
    order: 5,
  },
  {
    id: 'miscellaneous',
    title: 'Miscellaneous',
    description:
      'SOLID, OWASP Top 10, Java version sketchnotes, and other cross-cutting reference material.',
    order: 6,
  },
];
