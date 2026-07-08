import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DesignRegistryService } from '../../core/services/design-registry.service';
import { SeoService } from '../../core/services/seo.service';
import { ContentSectionId } from '../../shared/models';
import { DesignCardComponent } from '../../shared/components/design-card/design-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

/** Landing page: catalog filtered by top-level section, then category. */
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

  protected readonly sections = this.registry.getSections();
  protected readonly selectedSection = signal<ContentSectionId>('system-design');
  protected readonly selectedCategory = signal('All');

  protected readonly publishedCount = this.registry.getPublishedMeta().length;
  protected readonly totalCount = this.registry.getAllMeta().length;

  protected readonly categories = computed(() => {
    const section = this.selectedSection();
    return ['All', ...this.registry.getCategories(section)];
  });

  protected readonly activeSectionMeta = computed(() =>
    this.registry.getSection(this.selectedSection()),
  );

  protected readonly filtered = computed(() => {
    const section = this.selectedSection();
    const category = this.selectedCategory();
    let list = this.registry.getBySection(section);
    if (category !== 'All') {
      list = list.filter((m) => m.category === category);
    }
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

  selectSection(section: ContentSectionId): void {
    this.selectedSection.set(section);
    this.selectedCategory.set('All');
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }
}
