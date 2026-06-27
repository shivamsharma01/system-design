# YouTube Embeds

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

## Finding the video ID

From a URL like `https://www.youtube.com/watch?v=CZ3wIuvmHeM`, the id is
`CZ3wIuvmHeM`. For `https://youtu.be/CZ3wIuvmHeM`, it is the path segment.

## Why a facade?

- No third-party requests until the user opts in (better privacy).
- Much faster initial page load (no embedded player upfront).
- Cleaner Lighthouse / performance scores.
