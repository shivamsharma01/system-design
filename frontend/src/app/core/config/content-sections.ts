import { ContentSectionMeta } from '../../shared/models';

/**
 * Ordered top-level catalog sections. System Design is one peer among others,
 * not the root of the app.
 */
export const CONTENT_SECTIONS: ContentSectionMeta[] = [
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Product deep-dives, capacity math, trade-offs, and the interview framework.',
    order: 1,
  },
  {
    id: 'high-level-design',
    title: 'High Level Design',
    description:
      'Top interview HLD problems — requirements, capacity, architecture, and trade-offs.',
    order: 2,
  },
  {
    id: 'low-level-design',
    title: 'Low Level Design',
    description:
      'Top interview LLD problems — class design, patterns, flows, and follow-up questions.',
    order: 3,
  },
  {
    id: 'solid-principles',
    title: 'SOLID Principles',
    description: 'Object-oriented design principles for maintainable, interview-ready LLD.',
    order: 4,
  },
  {
    id: 'design-patterns',
    title: 'Design Patterns',
    description:
      'GoF, concurrency, architectural, distributed, cloud, messaging, and ML patterns.',
    order: 5,
  },
];
