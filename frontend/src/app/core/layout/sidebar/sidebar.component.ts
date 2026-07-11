import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DesignRegistryService } from '../../services/design-registry.service';
import { ContentSectionId, DesignMeta } from '../../../shared/models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

interface CategoryGroup {
  category: string;
  designs: DesignMeta[];
}

interface SectionNav {
  id: ContentSectionId;
  title: string;
  designs: DesignMeta[];
  groups: CategoryGroup[];
}

/** Left navigation: top-level sections with articles nested underneath. */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly registry = inject(DesignRegistryService);

  protected readonly startHereSlug = 'interview-framework';

  /** Sections expanded by default: System Design open, others open if they have content. */
  protected readonly expanded = signal<Record<ContentSectionId, boolean>>({
    'system-design': true,
    'high-level-design': true,
    'low-level-design': true,
    'solid-principles': true,
    'design-patterns': true,
  });

  protected readonly sections: SectionNav[] = this.registry.getSections().map((section) => {
    const designs = this.registry
      .getBySection(section.id)
      .sort((a, b) => a.title.localeCompare(b.title));
    const categories = this.registry.getCategories(section.id);
    const groups: CategoryGroup[] = categories.map((category) => ({
      category,
      designs: this.registry
        .getByCategory(category, section.id)
        .sort((a, b) => a.title.localeCompare(b.title)),
    }));
    return { id: section.id, title: section.title, designs, groups };
  });

  toggleSection(id: ContentSectionId): void {
    this.expanded.update((state) => ({ ...state, [id]: !state[id] }));
  }

  isExpanded(id: ContentSectionId): boolean {
    return this.expanded()[id] ?? true;
  }
}
