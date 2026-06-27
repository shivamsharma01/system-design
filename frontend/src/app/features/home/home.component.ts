import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DesignRegistryService } from '../../core/services/design-registry.service';
import { SeoService } from '../../core/services/seo.service';
import { DesignCardComponent } from '../../shared/components/design-card/design-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

/** Landing page: catalog of all designs with category filtering. */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DesignCardComponent, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly registry = inject(DesignRegistryService);
  private readonly seo = inject(SeoService);

  protected readonly all = this.registry.getAllMeta();
  protected readonly categories = ['All', ...this.registry.getCategories()];
  protected readonly selectedCategory = signal('All');

  protected readonly publishedCount = this.registry.getPublishedMeta().length;
  protected readonly totalCount = this.all.length;

  protected readonly filtered = computed(() => {
    const category = this.selectedCategory();
    const list = category === 'All' ? this.all : this.all.filter((m) => m.category === category);
    // Published first, then by popularity.
    return [...list].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'published' ? -1 : 1;
      }
      return (b.popularity ?? 0) - (a.popularity ?? 0);
    });
  });

  constructor() {
    this.seo.setDefault();
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }
}
