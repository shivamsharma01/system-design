import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../../core/services/search.service';
import { IconComponent } from '../icon/icon.component';
import { DifficultyBadgeComponent } from '../difficulty-badge/difficulty-badge.component';

/**
 * Global fuzzy search with a results dropdown and keyboard navigation.
 * Open with Ctrl/Cmd+K, move with arrows, Enter to open, Esc to close.
 */
@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, DifficultyBadgeComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  private readonly search = inject(SearchService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(0);

  protected readonly results = computed(() => this.search.search(this.query()));

  onInput(value: string): void {
    this.query.set(value);
    this.open.set(true);
    this.activeIndex.set(0);
  }

  onFocus(): void {
    if (this.query()) {
      this.open.set(true);
    }
  }

  select(slug: string): void {
    this.close();
    this.query.set('');
    void this.router.navigate(['/designs', slug]);
  }

  close(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Global shortcut to focus search.
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.inputRef()?.nativeElement.focus();
      return;
    }

    if (!this.open()) {
      return;
    }

    const items = this.results();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((i) => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((i) => Math.max(i - 1, 0));
        break;
      case 'Enter': {
        const item = items[this.activeIndex()];
        if (item) {
          event.preventDefault();
          this.select(item.meta.slug);
        }
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
