# Code Blocks

The `code` block renders syntax-highlighted code with a copy button, optional
line numbers, line highlighting, a filename header, word-wrap toggle, and an
optional collapse toggle.

```ts
{
  type: 'code',
  language: 'java',
  filename: 'CacheService.java',  // optional header
  highlightLines: [3, 4],         // optional emphasized lines (1-based)
  showLineNumbers: true,          // default true
  collapsible: false,             // default false
  collapsed: false,               // default false
  wrap: false,                    // default false
  code: `public Title getTitle(long id) {
  String key = "title:" + id;
  Title cached = cache.get(key);
  if (cached != null) return cached;
  return repo.findById(id);
}`,
}
```

## Supported languages

Java, Kotlin, Python, Go, JavaScript, TypeScript, SQL, Bash/Shell, YAML, JSON,
Dockerfile, XML/HTML, CSS, SCSS, and plaintext. Common aliases (`js`, `ts`,
`sh`, `yml`, `k8s`, `docker`) are normalized automatically. Unknown languages
fall back to auto-detection.

> To add a language, register it in
> [`highlight.service.ts`](../frontend/src/app/shared/services/highlight.service.ts).

## Tips

- Use `filename` to give context (it also picks a nice header).
- Use `highlightLines` to draw attention to the important lines.
- Set `collapsible: true` for long, supplementary snippets.
- Theming is automatic — colors follow the active light/dark theme.
