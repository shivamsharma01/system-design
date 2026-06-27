import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { SafeResourceUrlPipe } from '../../pipes/safe-resource-url.pipe';
import { IconComponent } from '../icon/icon.component';

/**
 * Privacy-friendly YouTube embed. Shows a lightweight thumbnail facade first and
 * only loads the iframe (from `youtube-nocookie.com`) on click, keeping the page
 * fast and avoiding cookies until the user opts in.
 */
@Component({
  selector: 'app-youtube-embed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeResourceUrlPipe, IconComponent],
  template: `
    <figure class="yt">
      @if (activated()) {
        <iframe
          [src]="embedUrl() | safeResourceUrl"
          [title]="title() || 'YouTube video'"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      } @else {
        <button type="button" class="yt__facade" (click)="activate()">
          <img
            [src]="thumbnail()"
            [alt]="title() || 'Play video'"
            loading="lazy"
            decoding="async"
          />
          <span class="yt__play"><app-icon name="play" [size]="28" /></span>
          @if (title()) {
            <span class="yt__title">{{ title() }}</span>
          }
        </button>
      }
    </figure>
  `,
  styleUrl: './youtube-embed.component.scss',
})
export class YoutubeEmbedComponent {
  readonly videoId = input.required<string>();
  readonly title = input<string>();

  protected readonly activated = signal(false);

  protected readonly thumbnail = computed(
    () => `https://i.ytimg.com/vi/${this.videoId()}/hqdefault.jpg`,
  );
  protected readonly embedUrl = computed(
    () => `https://www.youtube-nocookie.com/embed/${this.videoId()}?autoplay=1&rel=0`,
  );

  activate(): void {
    this.activated.set(true);
  }
}
