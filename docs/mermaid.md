# Mermaid Diagrams

The `mermaid` block renders [Mermaid](https://mermaid.js.org/) diagrams. Mermaid
is **lazy-loaded** and **theme-aware** (it re-renders on light/dark toggle).

```ts
{
  type: 'mermaid',
  caption: 'Request flow', // optional
  definition: `flowchart LR
  Client --> Gateway
  Gateway --> Service
  Service --> DB[(Database)]`,
}
```

## Diagram types

All standard Mermaid diagrams work:

- **Flowcharts** — `flowchart LR` / `TD`
- **Sequence diagrams** — `sequenceDiagram`
- **ER diagrams** — `erDiagram`
- **Class diagrams** — `classDiagram`
- **State diagrams** — `stateDiagram-v2`
- **Gantt**, **C4**, **block**, and more

### Sequence example

```ts
{
  type: 'mermaid',
  definition: `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: request
  S-->>C: response`,
}
```

## Notes

- Diagrams render with `securityLevel: 'strict'` (no inline scripts/HTML).
- Use Mermaid for architecture/flow diagrams; for hand-drawn assets (Draw.io,
  PlantUML exports) export to **SVG/PNG** and use an [`image`](images.md) block.
- Keep node labels short for readability on mobile.
