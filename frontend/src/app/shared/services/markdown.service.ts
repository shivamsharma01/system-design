import { Injectable } from '@angular/core';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

/**
 * Parses Markdown to sanitized HTML. Used for prose blocks and callout bodies.
 * Code fences / diagrams are handled by dedicated components, so authors should
 * prefer the `code`/`mermaid` block types for those.
 */
@Injectable({ providedIn: 'root' })
export class MarkdownService {
  constructor() {
    marked.setOptions({ gfm: true, breaks: false });
  }

  render(markdown: string): string {
    if (!markdown) {
      return '';
    }
    const rawHtml = marked.parse(markdown, { async: false });
    return DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target', 'rel'],
    });
  }
}
