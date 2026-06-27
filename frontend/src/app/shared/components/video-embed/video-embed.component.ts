import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SafeResourceUrlPipe } from '../../pipes/safe-resource-url.pipe';

/**
 * Embeds either a self-hosted video file (`<video>`) or, when `embed` is true,
 * an arbitrary iframe (e.g. CodeSandbox, an architecture demo, another site).
 */
@Component({
  selector: 'app-video-embed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeResourceUrlPipe],
  template: `
    <figure class="video" [style.aspect-ratio]="ratio()">
      @if (embed()) {
        <iframe
          [src]="src() | safeResourceUrl"
          [title]="caption() || 'Embedded content'"
          loading="lazy"
          allowfullscreen
        ></iframe>
      } @else {
        <video controls preload="metadata" [poster]="poster() || null">
          <source [src]="src()" />
          Your browser does not support embedded video.
        </video>
      }
      @if (caption()) {
        <figcaption>{{ caption() }}</figcaption>
      }
    </figure>
  `,
  styleUrl: './video-embed.component.scss',
})
export class VideoEmbedComponent {
  readonly src = input.required<string>();
  readonly poster = input<string>();
  readonly caption = input<string>();
  readonly embed = input(false);
  readonly ratio = input('16 / 9');
}
