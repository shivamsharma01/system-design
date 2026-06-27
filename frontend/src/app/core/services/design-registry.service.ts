import { Injectable } from '@angular/core';
import { DESIGN_REGISTRY } from '../config/design-registry';
import { DesignRegistryEntry } from '../config/design-registry.model';
import { DesignContent, DesignMeta } from '../../shared/models';

/**
 * Read access to the design catalog. Wraps `DESIGN_REGISTRY` so the rest of the
 * app depends on a service (easy to mock/swap) rather than the raw constant.
 */
@Injectable({ providedIn: 'root' })
export class DesignRegistryService {
  private readonly entries = DESIGN_REGISTRY;
  private readonly bySlug = new Map<string, DesignRegistryEntry>(
    this.entries.map((entry) => [entry.meta.slug, entry]),
  );

  /** All metadata, used for cards and the search index. */
  getAllMeta(): DesignMeta[] {
    return this.entries.map((entry) => entry.meta);
  }

  getPublishedMeta(): DesignMeta[] {
    return this.getAllMeta().filter((m) => m.status === 'published');
  }

  getMeta(slug: string): DesignMeta | undefined {
    return this.bySlug.get(slug)?.meta;
  }

  has(slug: string): boolean {
    return this.bySlug.has(slug);
  }

  getCategories(): string[] {
    return [...new Set(this.getAllMeta().map((m) => m.category))].sort();
  }

  getTags(): string[] {
    return [...new Set(this.getAllMeta().flatMap((m) => m.tags))].sort();
  }

  getByCategory(category: string): DesignMeta[] {
    return this.getAllMeta().filter((m) => m.category === category);
  }

  getPopular(limit = 6): DesignMeta[] {
    return [...this.getAllMeta()]
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, limit);
  }

  getRecent(limit = 6): DesignMeta[] {
    return [...this.getAllMeta()]
      .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))
      .slice(0, limit);
  }

  /** Ordered slugs, used to compute previous/next navigation. */
  getOrderedSlugs(): string[] {
    return this.entries.map((e) => e.meta.slug);
  }

  /** Lazily load the full content chunk for a design. */
  async loadContent(slug: string): Promise<DesignContent | undefined> {
    const entry = this.bySlug.get(slug);
    if (!entry) {
      return undefined;
    }
    const module = await entry.load();
    return module.default;
  }
}
