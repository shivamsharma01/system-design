import { ContentBlock } from './content-block.model';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type DesignStatus = 'published' | 'draft';

/** Top-level catalog sections (peers: System Design, HLD, LLD, SOLID, Design Patterns). */
export type ContentSectionId =
  | 'system-design'
  | 'high-level-design'
  | 'low-level-design'
  | 'solid-principles'
  | 'design-patterns';

export interface ContentSectionMeta {
  id: ContentSectionId;
  title: string;
  description: string;
  order: number;
}

/**
 * Standard section identifiers. Authors are free to use any of these (or custom
 * ids), but using the canonical set keeps navigation consistent across designs.
 */
export const STANDARD_SECTIONS = [
  'overview',
  'functional-requirements',
  'non-functional-requirements',
  'capacity-estimation',
  'high-level-architecture',
  'api-design',
  'database-design',
  'caching-strategy',
  'load-balancing',
  'storage',
  'message-queues',
  'communication-flow',
  'scaling-strategy',
  'consistency',
  'availability',
  'partitioning',
  'sharding',
  'replication',
  'fault-tolerance',
  'trade-offs',
  'technology-choices',
  'interview-questions',
  'references',
  'summary',
] as const;

/**
 * Lightweight metadata used for home cards, search index, and SEO. Kept small
 * and statically importable so listing the catalog never pulls in full content.
 */
export interface DesignMeta {
  slug: string;
  title: string;
  tagline: string;
  /** Top-level section this article belongs to. */
  section: ContentSectionId;
  category: string;
  tags: string[];
  technologies: string[];
  difficulty: Difficulty;
  readingTimeMin: number;
  status: DesignStatus;
  /** Extra search keywords not already covered by tags/technologies. */
  keywords?: string[];
  /** ISO date string. */
  dateAdded: string;
  /** Higher = more popular; drives the "Popular" list ordering. */
  popularity?: number;
  /** Optional emoji/short label rendered on the hero + cards. */
  icon?: string;
  /** Optional CSS gradient for the hero banner. */
  heroGradient?: string;
  author?: string;
}

export interface DesignSection {
  /** Stable id used for anchors / table of contents. */
  id: string;
  title: string;
  blocks: ContentBlock[];
}

/** The full, lazily-loaded content for a single design. */
export interface DesignContent {
  meta: DesignMeta;
  sections: DesignSection[];
}
