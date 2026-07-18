import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SketchnoteItem } from '../../models';

/** Notebook-style sketchnote board for visual interview/security summaries. */
@Component({
  selector: 'app-sketchnote-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sketchnote-board.component.html',
  styleUrl: './sketchnote-board.component.scss',
})
export class SketchnoteBoardComponent {
  readonly title = input<string>();
  readonly intro = input<string>();
  readonly items = input.required<SketchnoteItem[]>();

  protected accent(item: SketchnoteItem, index: number): string {
    return item.accent ?? ACCENTS[index % ACCENTS.length];
  }

  protected tilt(index: number): string {
    return `${TILTS[index % TILTS.length]}deg`;
  }
}

const ACCENTS = [
  '#c2410c',
  '#1d4ed8',
  '#047857',
  '#7c3aed',
  '#b45309',
  '#be123c',
  '#0f766e',
  '#4338ca',
  '#a16207',
  '#9f1239',
];

const TILTS = [-1.4, 1.1, -0.8, 1.6, -1.2, 0.9, -1.5, 1.3, -0.7, 1.0];
