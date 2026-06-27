import { DesignMeta } from './design.model';

export interface SearchResult {
  meta: DesignMeta;
  /** Section titles that matched, if any. */
  matchedSections: string[];
  /** Fuse.js relevance score (lower is better); undefined when not scored. */
  score?: number;
}
