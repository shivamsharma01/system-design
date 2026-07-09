import { Injectable } from '@angular/core';
import { CONTENT_SECTIONS } from '../config/content-sections';
import { DESIGN_REGISTRY } from '../config/design-registry';
import { DesignRegistryEntry } from '../config/design-registry.model';
import {
  ContentSectionId,
  ContentSectionMeta,
  DesignContent,
  DesignMeta,
} from '../../shared/models';

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

  /** Ordered top-level sections (System Design, SOLID, Design Patterns). */
  getSections(): ContentSectionMeta[] {
    return [...CONTENT_SECTIONS].sort((a, b) => a.order - b.order);
  }

  getSection(id: ContentSectionId): ContentSectionMeta | undefined {
    return CONTENT_SECTIONS.find((s) => s.id === id);
  }

  getBySection(section: ContentSectionId): DesignMeta[] {
    return this.getAllMeta().filter((m) => m.section === section);
  }

  /** Preferred order for Design Patterns GoF categories. */
  private static readonly PATTERN_CATEGORY_ORDER = [
    'Creational',
    'Structural',
    'Behavioral',
    'Concurrency',
    'Architectural',
    'Cloud & Resilience',
  ];

  /** Categories within a section (or all categories if section omitted). */
  getCategories(section?: ContentSectionId): string[] {
    const list = section ? this.getBySection(section) : this.getAllMeta();
    const categories = [...new Set(list.map((m) => m.category))];
    if (section === 'design-patterns') {
      return categories.sort((a, b) => {
        const ai = DesignRegistryService.PATTERN_CATEGORY_ORDER.indexOf(a);
        const bi = DesignRegistryService.PATTERN_CATEGORY_ORDER.indexOf(b);
        const ao = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
        const bo = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
        return ao !== bo ? ao - bo : a.localeCompare(b);
      });
    }
    return categories.sort();
  }

  getTags(): string[] {
    return [...new Set(this.getAllMeta().flatMap((m) => m.tags))].sort();
  }

  getByCategory(category: string, section?: ContentSectionId): DesignMeta[] {
    return (section ? this.getBySection(section) : this.getAllMeta()).filter(
      (m) => m.category === category,
    );
  }

  getPopular(limit = 6, section?: ContentSectionId): DesignMeta[] {
    const list = section ? this.getBySection(section) : this.getAllMeta();
    return [...list].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, limit);
  }

  getRecent(limit = 6, section?: ContentSectionId): DesignMeta[] {
    const list = section ? this.getBySection(section) : this.getAllMeta();
    return [...list].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, limit);
  }

  /**
   * Ordered slugs for prev/next navigation, scoped to the same section when
   * possible so readers stay within System Design or SOLID.
   */
  getOrderedSlugs(section?: ContentSectionId): string[] {
    if (section) {
      return this.entries.filter((e) => e.meta.section === section).map((e) => e.meta.slug);
    }
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
