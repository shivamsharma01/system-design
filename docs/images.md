# Images & Diagrams (static assets)

Use the `image` block for figures, screenshots, and exported architecture
diagrams (Draw.io, PlantUML, Excalidraw → export to **SVG** or **PNG**). Images
get a caption and a click-to-zoom lightbox.

```ts
{
  type: 'image',
  src: 'assets/diagrams/netflix-playback.svg',
  alt: 'Netflix playback path',          // required for accessibility
  caption: 'High-level playback path.',  // optional
}
```

## Where to put files

Place assets under `frontend/public/assets/…`. Anything in `public/` is served
at the site root, so `public/assets/diagrams/foo.svg` is referenced as
`assets/diagrams/foo.svg`.

```
frontend/public/assets/
└── diagrams/
    └── netflix-playback.svg
```

## Recommendations

- **Prefer SVG** for diagrams — crisp at any zoom and tiny.
- Always provide meaningful `alt` text.
- Optimize PNG/JPG (e.g. with `squoosh`) before committing.
- For flow/sequence/architecture diagrams that can be expressed as text, prefer
  [Mermaid](mermaid.md) so they stay editable and theme-aware.
