import { Injectable, signal } from '@angular/core';

export interface TocEntry {
  id: string;
  title: string;
}

/**
 * Holds the table-of-contents entries for the current design page and tracks
 * which section is active (driven by the scroll-spy directive). Shared between
 * the design page and the right sidebar TOC.
 */
@Injectable({ providedIn: 'root' })
export class TocService {
  readonly entries = signal<TocEntry[]>([]);
  readonly activeId = signal<string | null>(null);

  setEntries(entries: TocEntry[]): void {
    this.entries.set(entries);
    this.activeId.set(entries[0]?.id ?? null);
  }

  setActive(id: string): void {
    this.activeId.set(id);
  }

  clear(): void {
    this.entries.set([]);
    this.activeId.set(null);
  }
}
