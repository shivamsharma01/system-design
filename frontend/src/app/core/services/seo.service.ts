import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DesignMeta } from '../../shared/models';

const SITE_NAME = 'SystemDesign.dev';

/**
 * Centralizes document title and meta tags. Keeping this here means future SSR
 * / prerendering can produce correct social cards without UI changes.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  setDefault(): void {
    this.apply(
      SITE_NAME,
      'An open-source platform for learning the system design of real-world applications.',
    );
  }

  setForDesign(design: DesignMeta): void {
    this.apply(`${design.title} · ${SITE_NAME}`, design.tagline, design.keywords ?? design.tags);
  }

  private apply(title: string, description: string, keywords: string[] = []): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    if (keywords.length) {
      this.meta.updateTag({ name: 'keywords', content: keywords.join(', ') });
    }
  }
}
