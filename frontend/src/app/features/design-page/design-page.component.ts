import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ContentSource } from '../../core/services/content-source';
import { DesignRegistryService } from '../../core/services/design-registry.service';
import { SeoService } from '../../core/services/seo.service';
import { TocService } from '../../core/services/toc.service';
import { DesignContent } from '../../shared/models';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { ContentRendererComponent } from '../../shared/components/content-renderer/content-renderer.component';
import { PrevNextNavComponent } from '../../shared/components/prev-next-nav/prev-next-nav.component';
import { ReadingProgressComponent } from '../../shared/components/reading-progress/reading-progress.component';
import { ScrollSpyDirective } from '../../shared/directives/scroll-spy.directive';

/** Generic viewer that renders any design from its lazily-loaded content. */
@Component({
  selector: 'app-design-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroBannerComponent,
    BreadcrumbComponent,
    SectionHeaderComponent,
    ContentRendererComponent,
    PrevNextNavComponent,
    ReadingProgressComponent,
    ScrollSpyDirective,
  ],
  templateUrl: './design-page.component.html',
  styleUrl: './design-page.component.scss',
})
export class DesignPageComponent {
  private readonly contentSource = inject(ContentSource);
  private readonly registry = inject(DesignRegistryService);
  private readonly toc = inject(TocService);
  private readonly seo = inject(SeoService);

  /** Bound from the `:slug` route parameter (withComponentInputBinding). */
  readonly slug = input.required<string>();

  protected readonly content = signal<DesignContent | null>(null);
  protected readonly loading = signal(true);

  protected readonly crumbs = computed(() => {
    const meta = this.content()?.meta;
    const section = meta ? this.registry.getSection(meta.section) : undefined;
    return [
      { label: 'Home', link: '/' },
      ...(section ? [{ label: section.title }] : []),
      { label: meta?.title ?? '…' },
    ];
  });

  protected readonly neighbors = computed(() => {
    const section = this.content()?.meta.section;
    const slugs = this.registry.getOrderedSlugs(section);
    const index = slugs.indexOf(this.slug());
    return {
      previous: index > 0 ? this.registry.getMeta(slugs[index - 1]) : undefined,
      next:
        index >= 0 && index < slugs.length - 1
          ? this.registry.getMeta(slugs[index + 1])
          : undefined,
    };
  });

  constructor() {
    effect(() => {
      const slug = this.slug();
      void this.load(slug);
    });
  }

  private async load(slug: string): Promise<void> {
    this.loading.set(true);
    this.content.set(null);
    this.toc.clear();

    const content = await this.contentSource.getContent(slug);
    this.content.set(content ?? null);
    this.loading.set(false);

    if (content) {
      this.seo.setForDesign(content.meta);
      this.toc.setEntries(content.sections.map((s) => ({ id: s.id, title: s.title })));
    }
  }
}
