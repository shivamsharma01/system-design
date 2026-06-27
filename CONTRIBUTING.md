# Contributing

Thanks for helping build the best open-source system design resource! The whole
project is designed so that **adding a new design takes minutes**.

## Ways to contribute

- ✍️ **Write a new design** (the most valuable contribution).
- 🐛 Fix a bug or improve a shared component.
- 📖 Improve documentation.
- 💡 Suggest a new topic via an issue.

## Add a new System Design

### 1. Scaffold it

From the `frontend/` directory:

```bash
npm run new:design -- google-drive "Design Google Drive"
```

This creates `frontend/src/app/features/system-designs/google-drive/` with a
`*.meta.ts` and `*.content.ts`, and **registers it automatically** in
`core/config/design-registry.ts`. No other files need editing.

### 2. Write the content

Content is **data-driven**. Open `<slug>.content.ts` and fill in `sections`,
each containing an array of typed content blocks. The full list of blocks lives
in [`content-block.model.ts`](frontend/src/app/shared/models/content-block.model.ts).

Use the [Netflix module](frontend/src/app/features/system-designs/netflix/netflix.content.ts)
as the gold-standard reference — it exercises **every** block type.

Recommended sections (use the canonical ids in `STANDARD_SECTIONS`):

> Overview · Functional Requirements · Non-Functional Requirements · Capacity
> Estimation · High-Level Architecture · API Design · Database Design · Caching ·
> Scaling · Consistency · Availability · Trade-offs · Interview Questions ·
> References · Summary

### 3. Preview

```bash
npm start
# open http://localhost:4200 and visit /designs/google-drive
```

### 4. Publish

When ready, set `status: 'published'` in the `*.meta.ts` file (it starts as
`draft`, which shows a "Draft" badge).

## Content block cheatsheet

| Block            | Use for                                  |
| ---------------- | ---------------------------------------- |
| `markdown`       | Prose, lists, links, inline code         |
| `code`           | Syntax-highlighted code (any language)   |
| `mermaid`        | Architecture / sequence / flow diagrams  |
| `callout`        | Note / info / tip / warning / danger     |
| `prosCons`       | Advantages vs. disadvantages             |
| `table`          | Generic tabular data                     |
| `apiTable`       | REST endpoint listings                   |
| `metrics`        | Capacity-estimation numbers              |
| `math`           | KaTeX equations                          |
| `interviewQa`    | Interview question accordion             |
| `bestPractices`  | Checklist of recommendations             |
| `featureComparison` | Comparison matrix (✓/✗ or text)       |
| `timeline`       | Ordered phases / lifecycle               |
| `image`/`video`/`youtube`/`embed` | Rich media                |
| `expandable`     | Collapsible nested blocks                |
| `references`     | External links / further reading         |

See the guides in [`docs/`](docs/) for media, code blocks, YouTube, and Mermaid.

## Code standards

- **Standalone components**, **OnPush** change detection, **signals** for state.
- Keep reusable UI in `shared/`; singletons in `core/`.
- Run before pushing (from `frontend/`):

```bash
npm run lint
npm run format
npm test
npm run build
```

## Commit & PR

- Use clear, conventional-ish commit messages (`feat:`, `fix:`, `docs:`).
- Fill in the pull request template.
- One design per PR keeps reviews fast.

By contributing you agree your work is licensed under the project's MIT License.
