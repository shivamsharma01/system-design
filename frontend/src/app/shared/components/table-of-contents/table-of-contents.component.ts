import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TocService } from '../../../core/services/toc.service';
import { IconComponent } from '../icon/icon.component';

/** Right-sidebar table of contents driven by `TocService` + scroll spy. */
@Component({
  selector: 'app-table-of-contents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (toc.entries().length) {
      <nav class="toc" aria-label="Table of contents">
        <p class="toc__title"><app-icon name="list" [size]="15" /> On this page</p>
        <ul>
          @for (entry of toc.entries(); track entry.id) {
            <li>
              <a
                [href]="'#' + entry.id"
                [class.active]="toc.activeId() === entry.id"
                (click)="onClick($event, entry.id)"
              >
                {{ entry.title }}
              </a>
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styleUrl: './table-of-contents.component.scss',
})
export class TableOfContentsComponent {
  protected readonly toc = inject(TocService);

  onClick(event: Event, id: string): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
      this.toc.setActive(id);
    }
  }
}
