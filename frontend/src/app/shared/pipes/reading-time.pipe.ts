import { Pipe, PipeTransform } from '@angular/core';

const WORDS_PER_MINUTE = 220;

/**
 * Estimates reading time. Accepts either a word count source string or a
 * precomputed number of minutes (passed through). Returns a label like "5 min".
 */
@Pipe({ name: 'readingTime' })
export class ReadingTimePipe implements PipeTransform {
  transform(value: string | number): string {
    const minutes =
      typeof value === 'number'
        ? value
        : Math.max(1, Math.round(value.trim().split(/\s+/).length / WORDS_PER_MINUTE));
    return `${minutes} min read`;
  }
}
