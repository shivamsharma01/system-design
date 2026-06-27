import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  ApiTableBlock,
  ArchitectureCardBlock,
  BestPracticesBlock,
  CalloutBlock,
  CodeBlock,
  ContentBlock,
  EmbedBlock,
  ExpandableBlock,
  FeatureComparisonBlock,
  HeadingBlock,
  ImageBlock,
  InterviewQaBlock,
  MarkdownBlock,
  MathBlock,
  MermaidBlock,
  MetricsBlock,
  ProsConsBlock,
  ReferencesBlock,
  TableBlock,
  TimelineBlock,
  VideoBlock,
  YouTubeBlock,
} from '../../models';

import { MarkdownComponent } from '../markdown/markdown.component';
import { CodeBlockComponent } from '../code-block/code-block.component';
import { DiagramViewerComponent } from '../diagram-viewer/diagram-viewer.component';
import { CalloutComponent } from '../callout/callout.component';
import { ProsConsComponent } from '../pros-cons/pros-cons.component';
import { DataTableComponent } from '../data-table/data-table.component';
import { ApiTableComponent } from '../api-table/api-table.component';
import { MetricCardComponent } from '../metric-card/metric-card.component';
import { ArchitectureCardComponent } from '../architecture-card/architecture-card.component';
import { InterviewTipsComponent } from '../interview-tips/interview-tips.component';
import { BestPracticesComponent } from '../best-practices/best-practices.component';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { VideoEmbedComponent } from '../video-embed/video-embed.component';
import { YoutubeEmbedComponent } from '../youtube-embed/youtube-embed.component';
import { TimelineComponent } from '../timeline/timeline.component';
import { FeatureComparisonComponent } from '../feature-comparison/feature-comparison.component';
import { MathBlockComponent } from '../math-block/math-block.component';
import { ExpandablePanelComponent } from '../expandable-panel/expandable-panel.component';
import { ReferenceListComponent } from '../reference-list/reference-list.component';

/**
 * The data-driven rendering engine: maps each `ContentBlock` to its reusable
 * presentation component. Heavy/optional renderers (Mermaid, KaTeX, media) are
 * wrapped in `@defer` so they load only when they scroll into view. The
 * component references itself to render nested blocks inside expandables.
 */
@Component({
  selector: 'app-content-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MarkdownComponent,
    CodeBlockComponent,
    DiagramViewerComponent,
    CalloutComponent,
    ProsConsComponent,
    DataTableComponent,
    ApiTableComponent,
    MetricCardComponent,
    ArchitectureCardComponent,
    InterviewTipsComponent,
    BestPracticesComponent,
    ImageViewerComponent,
    VideoEmbedComponent,
    YoutubeEmbedComponent,
    TimelineComponent,
    FeatureComparisonComponent,
    MathBlockComponent,
    ExpandablePanelComponent,
    ReferenceListComponent,
    // Self-reference: lets expandable blocks render nested content blocks.
    ContentRendererComponent,
  ],
  templateUrl: './content-renderer.component.html',
  styles: [
    `
      .content-heading {
        margin: var(--space-6) 0 var(--space-3);
        scroll-margin-top: calc(var(--header-height) + var(--space-4));
      }
      .defer-placeholder {
        margin: var(--space-6) 0;
        padding: var(--space-8);
        text-align: center;
        color: var(--color-text-subtle);
        font-size: var(--text-sm);
        background: var(--color-surface-sunken);
        border: 1px dashed var(--color-border);
        border-radius: var(--radius-md);
      }
    `,
  ],
})
export class ContentRendererComponent {
  readonly blocks = input.required<ContentBlock[]>();

  // Typed narrowing helpers so the template stays strictly typed regardless of
  // template control-flow narrowing support.
  protected asMarkdown = (b: ContentBlock): MarkdownBlock => b as MarkdownBlock;
  protected asHeading = (b: ContentBlock): HeadingBlock => b as HeadingBlock;
  protected asCode = (b: ContentBlock): CodeBlock => b as CodeBlock;
  protected asMermaid = (b: ContentBlock): MermaidBlock => b as MermaidBlock;
  protected asCallout = (b: ContentBlock): CalloutBlock => b as CalloutBlock;
  protected asProsCons = (b: ContentBlock): ProsConsBlock => b as ProsConsBlock;
  protected asTable = (b: ContentBlock): TableBlock => b as TableBlock;
  protected asApiTable = (b: ContentBlock): ApiTableBlock => b as ApiTableBlock;
  protected asMetrics = (b: ContentBlock): MetricsBlock => b as MetricsBlock;
  protected asArchitecture = (b: ContentBlock): ArchitectureCardBlock => b as ArchitectureCardBlock;
  protected asInterviewQa = (b: ContentBlock): InterviewQaBlock => b as InterviewQaBlock;
  protected asBestPractices = (b: ContentBlock): BestPracticesBlock => b as BestPracticesBlock;
  protected asImage = (b: ContentBlock): ImageBlock => b as ImageBlock;
  protected asVideo = (b: ContentBlock): VideoBlock => b as VideoBlock;
  protected asYouTube = (b: ContentBlock): YouTubeBlock => b as YouTubeBlock;
  protected asEmbed = (b: ContentBlock): EmbedBlock => b as EmbedBlock;
  protected asTimeline = (b: ContentBlock): TimelineBlock => b as TimelineBlock;
  protected asComparison = (b: ContentBlock): FeatureComparisonBlock => b as FeatureComparisonBlock;
  protected asMath = (b: ContentBlock): MathBlock => b as MathBlock;
  protected asExpandable = (b: ContentBlock): ExpandableBlock => b as ExpandableBlock;
  protected asReferences = (b: ContentBlock): ReferencesBlock => b as ReferencesBlock;
}
