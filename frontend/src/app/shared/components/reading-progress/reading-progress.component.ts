import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';

/** Thin bar showing how far the user has scrolled through the page. */
@Component({
  selector: 'app-reading-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div
    class="progress"
    role="progressbar"
    [attr.aria-valuenow]="progress()"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="progress__bar" [style.width.%]="progress()"></div>
  </div>`,
  styles: [
    `
      .progress {
        position: sticky;
        top: 0;
        height: 3px;
        z-index: var(--z-header);
        background: transparent;
      }
      .progress__bar {
        height: 100%;
        background: var(--color-brand);
        transition: width 80ms linear;
      }
    `,
  ],
})
export class ReadingProgressComponent {
  protected readonly progress = signal(0);

  @HostListener('window:scroll')
  onScroll(): void {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    this.progress.set(scrollable > 0 ? Math.min(100, (doc.scrollTop / scrollable) * 100) : 0);
  }
}
