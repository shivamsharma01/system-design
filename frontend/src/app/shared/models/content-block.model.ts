/**
 * The rich-content block model.
 *
 * Every System Design is authored as data: an ordered list of sections, each
 * holding an ordered list of `ContentBlock`s. The `ContentRendererComponent`
 * maps each block `type` to a reusable presentation component. To add a new
 * kind of content, add a variant here and a matching case in the renderer.
 */

export type CalloutVariant = 'note' | 'info' | 'tip' | 'warning' | 'danger' | 'summary';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  auth?: boolean;
}

export interface TimelineItem {
  title: string;
  description: string;
  meta?: string;
}

export interface MetricItem {
  label: string;
  value: string;
  hint?: string;
}

export interface ComparisonRow {
  feature: string;
  /** One cell per column, aligned with `columns`. */
  values: (string | boolean)[];
}

export interface ReferenceItem {
  label: string;
  url: string;
  source?: string;
}

/** Discriminated union of every supported content block. */
export type ContentBlock =
  | MarkdownBlock
  | HeadingBlock
  | CodeBlock
  | MermaidBlock
  | CalloutBlock
  | ProsConsBlock
  | TableBlock
  | ApiTableBlock
  | MetricsBlock
  | ArchitectureCardBlock
  | InterviewQaBlock
  | BestPracticesBlock
  | ImageBlock
  | VideoBlock
  | YouTubeBlock
  | EmbedBlock
  | TimelineBlock
  | FeatureComparisonBlock
  | MathBlock
  | ExpandableBlock
  | ReferencesBlock;

export interface MarkdownBlock {
  type: 'markdown';
  value: string;
}

export interface HeadingBlock {
  type: 'heading';
  level: 3 | 4;
  text: string;
}

export interface CodeBlock {
  type: 'code';
  language: string;
  code: string;
  filename?: string;
  /** 1-based line numbers to emphasize. */
  highlightLines?: number[];
  showLineNumbers?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
  wrap?: boolean;
}

export interface MermaidBlock {
  type: 'mermaid';
  definition: string;
  caption?: string;
}

export interface CalloutBlock {
  type: 'callout';
  variant: CalloutVariant;
  title?: string;
  /** Markdown-enabled body. */
  body: string;
}

export interface ProsConsBlock {
  type: 'prosCons';
  title?: string;
  pros: string[];
  cons: string[];
}

export interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ApiTableBlock {
  type: 'apiTable';
  title?: string;
  endpoints: ApiEndpoint[];
}

export interface MetricsBlock {
  type: 'metrics';
  items: MetricItem[];
}

export interface ArchitectureCardBlock {
  type: 'architectureCard';
  title: string;
  description: string;
  icon?: string;
  tags?: string[];
}

export interface QaItem {
  question: string;
  /** Markdown-enabled answer. */
  answer: string;
}

export interface InterviewQaBlock {
  type: 'interviewQa';
  title?: string;
  items: QaItem[];
}

export interface BestPracticesBlock {
  type: 'bestPractices';
  title?: string;
  /** Markdown-enabled bullet points. */
  practices: string[];
}

export interface ImageBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface VideoBlock {
  type: 'video';
  src: string;
  poster?: string;
  caption?: string;
}

export interface YouTubeBlock {
  type: 'youtube';
  videoId: string;
  title?: string;
}

export interface EmbedBlock {
  type: 'embed';
  url: string;
  title?: string;
  /** Aspect ratio, e.g. '16 / 9'. */
  ratio?: string;
}

export interface TimelineBlock {
  type: 'timeline';
  items: TimelineItem[];
}

export interface FeatureComparisonBlock {
  type: 'featureComparison';
  columns: string[];
  rows: ComparisonRow[];
  caption?: string;
}

export interface MathBlock {
  type: 'math';
  tex: string;
  display?: boolean;
  caption?: string;
}

export interface ExpandableBlock {
  type: 'expandable';
  title: string;
  open?: boolean;
  blocks: ContentBlock[];
}

export interface ReferencesBlock {
  type: 'references';
  items: ReferenceItem[];
}
