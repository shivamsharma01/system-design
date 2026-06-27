import { ChangeDetectionStrategy, Component, HostListener, input, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Responsive figure with a click-to-zoom lightbox overlay. */
@Component({
  selector: 'app-image-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <figure class="img">
      <button type="button" class="img__btn" (click)="open()">
        <img [src]="src()" [alt]="alt()" loading="lazy" decoding="async" />
      </button>
      @if (caption()) {
        <figcaption>{{ caption() }}</figcaption>
      }
    </figure>

    @if (zoomed()) {
      <div class="lightbox" role="dialog" aria-modal="true">
        <button
          type="button"
          class="lightbox__backdrop"
          aria-label="Close image"
          (click)="close()"
        ></button>
        <button type="button" class="lightbox__close" aria-label="Close" (click)="close()">
          <app-icon name="close" [size]="24" />
        </button>
        <img [src]="src()" [alt]="alt()" />
      </div>
    }
  `,
  styleUrl: './image-viewer.component.scss',
})
export class ImageViewerComponent {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly caption = input<string>();

  protected readonly zoomed = signal(false);

  open(): void {
    this.zoomed.set(true);
  }

  close(): void {
    this.zoomed.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.zoomed()) {
      this.close();
    }
  }
}
