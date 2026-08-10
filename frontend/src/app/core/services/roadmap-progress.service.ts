import { Injectable, signal } from '@angular/core';

const STORAGE_PREFIX = 'sd-roadmap:';

type ProgressMap = Record<string, boolean>;

/**
 * Persists roadmap checklist completion in localStorage, keyed by storageKey.
 * Each roadmap page uses its own namespace (e.g. `staff-interview-roadmap`).
 */
@Injectable({ providedIn: 'root' })
export class RoadmapProgressService {
  /** All roadmap progress maps; components should read via `snapshot` after `ensureLoaded`. */
  private readonly _maps = signal<Record<string, ProgressMap>>({});

  /** Readonly view of all progress maps (keyed by storageKey). */
  readonly maps = this._maps.asReadonly();

  /** Ensure a storage key is loaded into the signal map (idempotent). */
  ensureLoaded(storageKey: string): void {
    if (this._maps()[storageKey]) {
      return;
    }
    this._maps.update((m) => ({ ...m, [storageKey]: this.readFromStorage(storageKey) }));
  }

  snapshot(storageKey: string): ProgressMap {
    this.ensureLoaded(storageKey);
    return this._maps()[storageKey] ?? {};
  }

  toggle(storageKey: string, itemId: string): void {
    const current = { ...this.snapshot(storageKey) };
    if (current[itemId]) {
      delete current[itemId];
    } else {
      current[itemId] = true;
    }
    this.write(storageKey, current);
  }

  reset(storageKey: string): void {
    this.write(storageKey, {});
  }

  completedCount(storageKey: string, itemIds: string[]): number {
    const map = this.snapshot(storageKey);
    return itemIds.reduce((n, id) => n + (map[id] ? 1 : 0), 0);
  }

  private fullKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  private readFromStorage(storageKey: string): ProgressMap {
    try {
      const raw = localStorage.getItem(this.fullKey(storageKey));
      if (!raw) {
        return {};
      }
      return JSON.parse(raw) as ProgressMap;
    } catch {
      return {};
    }
  }

  private write(storageKey: string, map: ProgressMap): void {
    this._maps.update((m) => ({ ...m, [storageKey]: map }));
    try {
      localStorage.setItem(this.fullKey(storageKey), JSON.stringify(map));
    } catch {
      // Private mode / quota — keep in-memory progress for the session.
    }
  }
}
