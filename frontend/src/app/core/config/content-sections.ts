import { ContentSectionMeta } from '../../shared/models';

/**
 * Ordered top-level catalog sections. System Design is one peer among others,
 * not the root of the app.
 */
export const CONTENT_SECTIONS: ContentSectionMeta[] = [
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Real-world architectures, capacity math, trade-offs, and interview frameworks.',
    order: 1,
  },
  {
    id: 'solid-principles',
    title: 'SOLID Principles',
    description: 'Object-oriented design principles for maintainable, interview-ready LLD.',
    order: 2,
  },
  {
    id: 'design-patterns',
    title: 'Design Patterns',
    description: 'GoF patterns grouped by Creational and Structural — more categories coming soon.',
    order: 3,
  },
];
