# Videos & Embeds

## Self-hosted / external video files

Use the `video` block for an MP4/WebM file or any direct video URL.

```ts
{
  type: 'video',
  src: 'assets/videos/cache-demo.mp4',
  poster: 'assets/videos/cache-demo.jpg', // optional thumbnail
  caption: 'Cache invalidation in action', // optional
}
```

## Generic iframe embeds

Use the `embed` block for CodeSandbox, an interactive demo, or another site.

```ts
{
  type: 'embed',
  url: 'https://codesandbox.io/embed/abc123',
  title: 'Interactive demo',
  ratio: '16 / 9', // optional aspect ratio
}
```

Embeds are **deferred** until scrolled into view to keep pages fast.

> For YouTube specifically, use the dedicated [`youtube`](youtube.md) block — it
> is privacy-friendly and faster.
