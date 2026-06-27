import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../config/app-config';
import { IconComponent } from '../../../shared/components/icon/icon.component';

/** Site footer with links and attribution. */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <p class="footer__title">SystemDesign<span>.dev</span></p>
          <p class="footer__tagline">
            An open-source platform for learning system design. Built with Angular.
          </p>
        </div>
        <nav class="footer__links" aria-label="Footer">
          <a routerLink="/">Home</a>
          <a [href]="config.githubRepoUrl" target="_blank" rel="noopener">
            <app-icon name="github" [size]="14" /> GitHub
          </a>
          <a
            [href]="config.githubRepoUrl + '/blob/main/CONTRIBUTING.md'"
            target="_blank"
            rel="noopener"
          >
            Contribute
          </a>
        </nav>
      </div>
      <p class="footer__copy">Content is community-contributed under the MIT License.</p>
    </footer>
  `,
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly config = inject(APP_CONFIG);
}
