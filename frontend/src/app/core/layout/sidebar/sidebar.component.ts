import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DesignRegistryService } from '../../services/design-registry.service';
import { DesignMeta } from '../../../shared/models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

interface CategoryGroup {
  category: string;
  designs: DesignMeta[];
}

/** Left navigation: popular shortcuts + designs grouped by category. */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly registry = inject(DesignRegistryService);

  protected readonly popular = this.registry.getPopular(5);
  protected readonly recent = this.registry.getRecent(4);
  protected readonly groups: CategoryGroup[] = this.registry.getCategories().map((category) => ({
    category,
    designs: this.registry.getByCategory(category).sort((a, b) => a.title.localeCompare(b.title)),
  }));
}
