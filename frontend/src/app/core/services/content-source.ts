import { Injectable, inject } from '@angular/core';
import { DesignContent, DesignMeta, SearchResult } from '../../shared/models';
import { DesignRegistryService } from './design-registry.service';
import { SearchService } from './search.service';

/**
 * Abstraction over where content comes from. Today everything is bundled
 * statically (see `StaticContentSource`). When the Spring Boot backend is
 * enabled, provide an `ApiContentSource` instead and the UI stays untouched.
 */
export abstract class ContentSource {
  abstract listMeta(): Promise<DesignMeta[]>;
  abstract getContent(slug: string): Promise<DesignContent | undefined>;
  abstract search(query: string): Promise<SearchResult[]>;
}

@Injectable()
export class StaticContentSource extends ContentSource {
  private readonly registry = inject(DesignRegistryService);
  private readonly searchService = inject(SearchService);

  async listMeta(): Promise<DesignMeta[]> {
    return this.registry.getAllMeta();
  }

  async getContent(slug: string): Promise<DesignContent | undefined> {
    return this.registry.loadContent(slug);
  }

  async search(query: string): Promise<SearchResult[]> {
    return this.searchService.search(query);
  }
}
