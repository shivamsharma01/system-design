import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoadmapProgressService } from '../../../core/services/roadmap-progress.service';
import { RoadmapChecklistGroup } from '../../models';

type ChecklistFilter = 'all' | 'open' | 'done';

/**
 * Interactive roadmap checklist. Completion state is stored in localStorage
 * under `sd-roadmap:<storageKey>` and survives page reloads.
 */
@Component({
  selector: 'app-roadmap-checklist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './roadmap-checklist.component.html',
  styleUrl: './roadmap-checklist.component.scss',
})
export class RoadmapChecklistComponent {
  private readonly progress = inject(RoadmapProgressService);

  readonly storageKey = input.required<string>();
  readonly title = input<string>();
  readonly groups = input.required<RoadmapChecklistGroup[]>();

  private readonly filterSignal = signal<ChecklistFilter>('all');

  constructor() {
    effect(() => {
      this.progress.ensureLoaded(this.storageKey());
    });
  }

  private readonly allItemIds = computed(() =>
    this.groups().flatMap((g) => g.items.map((i) => i.id)),
  );

  protected readonly progressMap = computed(() => this.progress.maps()[this.storageKey()] ?? {});

  protected readonly totalCount = computed(() => this.allItemIds().length);

  protected readonly doneCount = computed(() => {
    const map = this.progressMap();
    return this.allItemIds().reduce((n, id) => n + (map[id] ? 1 : 0), 0);
  });

  protected readonly percent = computed(() => {
    const total = this.totalCount();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.doneCount() / total) * 100);
  });

  protected groupDoneCount(group: RoadmapChecklistGroup): number {
    const map = this.progressMap();
    return group.items.reduce((n, item) => n + (map[item.id] ? 1 : 0), 0);
  }

  protected isDone(itemId: string): boolean {
    return !!this.progressMap()[itemId];
  }

  protected visibleItems(group: RoadmapChecklistGroup) {
    const f = this.filterSignal();
    return group.items.filter((item) => {
      const done = this.isDone(item.id);
      if (f === 'open') {
        return !done;
      }
      if (f === 'done') {
        return done;
      }
      return true;
    });
  }

  protected setFilter(value: ChecklistFilter): void {
    this.filterSignal.set(value);
  }

  protected activeFilter(): ChecklistFilter {
    return this.filterSignal();
  }

  protected onToggle(itemId: string): void {
    this.progress.toggle(this.storageKey(), itemId);
  }

  protected onReset(): void {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Reset all checklist progress for this roadmap?')
    ) {
      this.progress.reset(this.storageKey());
    }
  }

  protected isInternalHref(href: string): boolean {
    return href.startsWith('/');
  }
}
