# Videos & Media Embeds

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

## YouTube embeds

The `youtube` block is a **privacy-friendly, fast** YouTube embed. It shows a
lightweight thumbnail "facade" and only loads the player (from
`youtube-nocookie.com`) when the user clicks play — no cookies or heavy iframe
until then.

```ts
{
  type: 'youtube',
  videoId: 'CZ3wIuvmHeM',   // the part after watch?v=
  title: 'System design deep dive', // optional, shown on the facade
}
```

### Finding the video ID

From a URL like `https://www.youtube.com/watch?v=CZ3wIuvmHeM`, the id is
`CZ3wIuvmHeM`. For `https://youtu.be/CZ3wIuvmHeM`, it is the path segment.

### Why a facade?

- No third-party requests until the user opts in (better privacy).
- Much faster initial page load (no embedded player upfront).
- Cleaner Lighthouse / performance scores.
