/**
 * Splits highlight.js output into per-line HTML fragments while keeping token
 * `<span>`s balanced across line breaks. This lets the CodeBlock render each
 * line as its own row (for line numbers + line highlighting) without corrupting
 * multi-line tokens such as block comments or template strings.
 */
export function splitHighlightedLines(html: string): string[] {
  const tokenRegex = /(<[^>]+>)|([^<]+)/g;
  const openTags: string[] = [];
  const lines: string[] = [];
  let current = '';

  const reopen = () => openTags.join('');
  const closeAll = () => openTags.map(() => '</span>').join('');

  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(html)) !== null) {
    const tag = match[1];
    const text = match[2];

    if (tag) {
      if (tag.startsWith('</')) {
        openTags.pop();
      } else if (!tag.endsWith('/>')) {
        openTags.push(tag);
      }
      current += tag;
      continue;
    }

    // Plain text run: may contain newlines that delimit lines.
    const segments = text.split('\n');
    for (let i = 0; i < segments.length; i++) {
      current += segments[i];
      if (i < segments.length - 1) {
        lines.push(current + closeAll());
        current = reopen();
      }
    }
  }

  lines.push(current);
  return lines;
}
