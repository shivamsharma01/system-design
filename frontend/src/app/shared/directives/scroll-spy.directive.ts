import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';
import { TocService } from '../../core/services/toc.service';

/**
 * Tracks which section is currently in view and reports it to `TocService` so
 * the right-sidebar TOC can highlight the active entry. Apply to the container
 * holding sections marked with `[data-toc-section]` (whose `id` is the anchor).
 */
@Directive({
  selector: '[appScrollSpy]',
})
export class ScrollSpyDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toc = inject(TocService);

  /** Bumping this input re-scans for sections (e.g. after content loads). */
  readonly appScrollSpy = input<unknown>();

  private observer?: IntersectionObserver;
  private visible = new Set<string>();

  ngAfterViewInit(): void {
    queueMicrotask(() => this.observe());
  }

  private observe(): void {
    this.observer?.disconnect();
    this.visible.clear();

    const sections = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('[data-toc-section]'),
    );
    if (!sections.length) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            this.visible.add(id);
          } else {
            this.visible.delete(id);
          }
        }
        // Highlight the first section (in document order) currently visible.
        const firstVisible = sections.find((s) => this.visible.has(s.id));
        if (firstVisible) {
          this.toc.setActive(firstVisible.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    sections.forEach((section) => this.observer?.observe(section));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
