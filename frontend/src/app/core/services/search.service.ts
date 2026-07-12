import { Injectable, computed, inject, signal } from '@angular/core';
import Fuse, { FuseResult, IFuseOptions } from 'fuse.js';
import { DesignMeta, SearchResult } from '../../shared/models';
import { DesignRegistryService } from './design-registry.service';

const FUSE_OPTIONS: IFuseOptions<DesignMeta> = {
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  keys: [
    { name: 'title', weight: 3 },
    { name: 'tagline', weight: 1.5 },
    { name: 'section', weight: 1 },
    { name: 'category', weight: 1 },
    { name: 'tags', weight: 2 },
    { name: 'technologies', weight: 1.5 },
    { name: 'keywords', weight: 1 },
  ],
};

/**
 * Client-side fuzzy search over design metadata. The `ContentSource`
 * seam means this can later be swapped for remote full-text search without
 * touching the search UI.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly registry = inject(DesignRegistryService);
  private readonly fuse = new Fuse(this.registry.getAllMeta(), FUSE_OPTIONS);

  /** The current query, exposed so the UI can stay in sync across components. */
  readonly query = signal('');

  readonly results = computed<SearchResult[]>(() => {
    const q = this.query().trim();
    if (!q) {
      return [];
    }
    return this.fuse.search(q).map((r) => this.toResult(r));
  });

  search(query: string): SearchResult[] {
    const q = query.trim();
    if (!q) {
      return [];
    }
    return this.fuse.search(q).map((r) => this.toResult(r));
  }

  setQuery(query: string): void {
    this.query.set(query);
  }

  clear(): void {
    this.query.set('');
  }

  private toResult(result: FuseResult<DesignMeta>): SearchResult {
    return {
      meta: result.item,
      matchedSections: [],
      score: result.score,
    };
  }
}
