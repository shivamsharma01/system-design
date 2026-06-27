import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Floating button that appears after scrolling and returns to the top. */
@Component({
  selector: 'app-scroll-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (visible()) {
      <button type="button" class="stt" (click)="scrollTop()" aria-label="Scroll to top">
        <app-icon name="arrow-up" [size]="20" />
      </button>
    }
  `,
  styles: [
    `
      .stt {
        position: fixed;
        right: var(--space-6);
        bottom: var(--space-6);
        z-index: var(--z-overlay);
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text);
        box-shadow: var(--shadow-md);
        cursor: pointer;
        animation: rise var(--transition-base);
      }
      .stt:hover {
        background: var(--color-brand);
        color: #fff;
        border-color: var(--color-brand);
      }
      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ScrollToTopComponent {
  protected readonly visible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > 600);
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
