# SystemDesign.dev — Open-Source System Design Learning Platform

A polished, contributor-friendly platform for learning how real-world systems
(Netflix, WhatsApp, Uber, …) are designed to scale. Think of it as an
open-source mix of **ByteByteGo + System Design Primer + a beautiful docs site**.

- ✅ **Angular 21** (standalone, signals, zoneless, OnPush, lazy-loaded)
- ✅ **Data-driven content** — add a design with one command, no boilerplate
- ✅ Rich blocks: Mermaid diagrams, syntax-highlighted code, KaTeX math,
  callouts, API tables, pros/cons, timelines, YouTube embeds, and more
- ✅ Global fuzzy search, dark/light themes, auto table-of-contents
- ✅ **Static SPA** — all content ships with the frontend; **Docker** + **CI/CD**

> ⚙️ This repo targets **Angular 21**. See [Known deviations](#known-deviations).

## Quick start

```bash
cd frontend
npm install
npm start
# open http://localhost:4200
```

## Add a new design in 60 seconds

```bash
cd frontend
npm run new:design -- google-drive "Design Google Drive"
```

This scaffolds the module **and registers it automatically**. Edit the generated
`*.content.ts`, then set `status: 'published'`. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Project structure

```
system-design/
├── frontend/                  # Angular app (the platform)
│   └── src/app/
│       ├── core/              # services, guards, interceptors, layout, config
│       ├── shared/            # reusable components, directives, pipes, models
│       └── features/
│           ├── home/
│           ├── design-page/
│           └── system-designs/<slug>/   # *.meta.ts + *.content.ts per design
├── docs/                      # Authoring & deployment guides
├── scripts/new-design.mjs     # Scaffolder
└── docker-compose.yml
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design.

## How it works (the core idea)

A System Design is **data**, not code. Authors write a typed `DesignContent`
object — an ordered list of sections, each an array of typed content blocks. A
generic `ContentRenderer` maps each block to a reusable component, deferring
heavy ones (Mermaid, KaTeX) until they scroll into view.

```mermaid
flowchart LR
  Registry["DESIGN_REGISTRY (meta)"] --> Home["Home (cards)"]
  Registry --> Search["Search (Fuse.js)"]
  Route["/designs/:slug"] -->|lazy import| Content["slug.content.ts"]
  Content --> Renderer["ContentRenderer"]
  Renderer --> Blocks["Reusable block components"]
```

## Authoring guides

| Guide | What it covers |
| ----- | -------------- |
| [Adding a design](docs/adding-a-design.md) | Full walkthrough |
| [Code blocks](docs/code-blocks.md) | Syntax highlighting, line highlights, filenames |
| [Mermaid diagrams](docs/mermaid.md) | Flowcharts, sequence, ER diagrams |
| [Images](docs/images.md) | Figures, SVG architecture diagrams, lightbox |
| [Media embeds](docs/media-embeds.md) | Self-hosted video, iframes, privacy-friendly YouTube |
| [Deployment](docs/deployment.md) | Docker and static hosting |
| [System Design catalog](docs/system-design-catalog.md) | Flagship deep-dives backlog |
| [HLD catalog](docs/hld-catalog.md) | High-level design problems backlog |
| [LLD catalog](docs/lld-catalog.md) | Low-level design problems backlog |
| [Design patterns catalog](docs/design-patterns-catalog.md) | Patterns backlog |
| [Fundamentals catalog](docs/fundamentals-catalog.md) | CAP, delivery semantics, estimation, IDs |

## Commands (run inside `frontend/`)

```bash
npm start            # dev server
npm run build        # production build
npm test             # unit tests (Vitest)
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check)
npm run new:design   # scaffold a new design
```

## Run with Docker

```bash
docker compose up --build
# frontend → http://localhost:8081
```

## Tech stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | Angular 21, TypeScript (strict), SCSS, Angular Material (selective) |
| Content | marked + DOMPurify, highlight.js, mermaid, KaTeX, Fuse.js |
| Tooling | ESLint, Prettier, Vitest, Playwright (scaffold), GitHub Actions, Docker |

## Roadmap

Authentication · bookmarks · comments · progress tracking · quizzes · i18n ·
PWA · AI-assisted explanations · admin/CMS. The architecture is built to absorb
these without restructuring (see ARCHITECTURE.md).

## Known deviations

- App lives in `frontend/` (not repo-root `src/`) so tooling and docs can
  coexist at the repository root.
- Targets **Angular 21** (latest tooling that runs on common local
  environments); trivial to bump.

## License

[MIT](LICENSE). Content is community-contributed.
