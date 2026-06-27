# Adding a System Design

This is the most common contribution. It takes minutes.

## 1. Scaffold

From `frontend/`:

```bash
npm run new:design -- payment-gateway "Design a Payment Gateway"
```

The slug must be kebab-case. This creates:

```
frontend/src/app/features/system-designs/payment-gateway/
├── payment-gateway.meta.ts      # lightweight metadata (cards + search)
└── payment-gateway.content.ts   # the full content (lazy-loaded)
```

…and adds an entry to `core/config/design-registry.ts` automatically.

## 2. Fill in the metadata

Edit `*.meta.ts`:

```ts
export const PAYMENT_GATEWAY_META: DesignMeta = {
  slug: 'payment-gateway',
  title: 'Design a Payment Gateway',
  tagline: 'Securely process payments with idempotency and reconciliation.',
  category: 'Web Services',
  tags: ['payments', 'idempotency', 'transactions'],
  technologies: ['PostgreSQL', 'Kafka', 'Stripe'],
  difficulty: 'advanced',
  readingTimeMin: 18,
  status: 'draft', // change to 'published' when ready
  dateAdded: '2026-06-28',
  popularity: 70,
  icon: 'PG',
  heroGradient: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
};
```

## 3. Write the content

Edit `*.content.ts`. Content is an array of **sections**, each with **blocks**.
Use canonical section ids (`overview`, `high-level-architecture`, …) so the
table of contents stays consistent.

```ts
const content: DesignContent = {
  meta: PAYMENT_GATEWAY_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        { type: 'markdown', value: 'A payment gateway…' },
        { type: 'callout', variant: 'info', title: 'Key idea', body: 'Idempotency keys prevent double charges.' },
      ],
    },
    // …more sections
  ],
};
export default content;
```

The [Netflix module](../frontend/src/app/features/system-designs/netflix/netflix.content.ts)
demonstrates **every** block type — copy from it liberally.

## 4. Preview & publish

```bash
npm start   # visit http://localhost:4200/designs/payment-gateway
```

When happy, set `status: 'published'` and open a PR.

## Available content blocks

See [content-block.model.ts](../frontend/src/app/shared/models/content-block.model.ts)
for the authoritative list and the table in [CONTRIBUTING.md](../CONTRIBUTING.md).
