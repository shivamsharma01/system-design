import { DesignContent } from '../../../shared/models';
import { AMAZON_META } from './amazon.meta';

/**
 * Flagship-depth example (peer of the Netflix, WhatsApp, Uber, etc. designs).
 * Centers on the defining problems of a global e-commerce platform: catalog
 * search at scale, the shopping cart, accurate inventory (never oversell), and
 * the multi-step checkout as a distributed transaction (saga) — plus order
 * fulfillment and recommendations.
 */
const content: DesignContent = {
  meta: AMAZON_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Amazon is a global **e-commerce marketplace**: **hundreds of millions of products**, **hundreds of millions of customers**, and order volumes that spike enormously on events like **Prime Day**. The system must let shoppers **search and browse** a vast catalog, manage a **cart**, and **check out** reliably — coordinating **inventory**, **payments**, and **fulfillment** so that an order is never lost, double-charged, or oversold.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The big idea',
          body: 'Split into a **read-heavy discovery path** (catalog + search + product pages, served from caches/CDN) and a **write-critical commerce path** (cart → checkout → inventory → payment → fulfillment). The discovery path optimizes for **availability + latency**; the commerce path is a **distributed transaction** that must stay **correct** across many services — solved with the **saga pattern**, idempotency, and careful inventory reservation.',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'A microservices birthplace',
          body: 'Amazon famously decomposed its monolith into **service-oriented architecture** with the "two-pizza team" model and the rule that all teams expose data only through service interfaces. Many patterns here (DynamoDB, eventual consistency, cells) originated from exactly these problems.',
        },
        {
          type: 'image',
          src: 'assets/diagrams/amazon-architecture.svg',
          alt: 'Amazon architecture: shopper hits the gateway, which routes to catalog/search, cart, and order/checkout services; checkout orchestrates inventory reservation, payment, and fulfillment, with Kafka carrying order events.',
          caption:
            'Discovery path (catalog/search/cart) and the write-critical checkout saga coordinating inventory, payment, and fulfillment.',
        },
      ],
    },
    {
      id: 'functional-requirements',
      title: 'Functional Requirements',
      blocks: [
        {
          type: 'markdown',
          value: 'We scope the interview to the shopping + ordering core.',
        },
        {
          type: 'bestPractices',
          title: 'In scope',
          practices: [
            '**Search & browse** the catalog by keyword, category, filters.',
            '**Product detail page**: description, price, availability, reviews.',
            '**Cart**: add/remove items, persistent across devices.',
            '**Checkout**: address, payment, place order.',
            '**Inventory**: reserve stock so items are never oversold.',
            '**Order management**: status tracking, history, cancellation.',
            '**Recommendations**: "customers also bought", personalization.',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Out of scope (state this explicitly)',
          body: 'Seller/marketplace onboarding, the full logistics/warehouse robotics, AWS infrastructure, returns/refunds workflow internals, ads, and the detailed recommendation model. Naming the boundary keeps the focus on catalog, cart, inventory, and checkout.',
        },
      ],
    },
    {
      id: 'non-functional-requirements',
      title: 'Non-Functional Requirements',
      blocks: [
        {
          type: 'prosCons',
          title: 'Prioritizing the qualities',
          pros: [
            'High availability for browse/cart/checkout (every second of downtime = lost revenue).',
            'Low latency for search + product pages (< 200ms).',
            'Correctness for inventory + payments (never oversell, never double-charge).',
            'Massive read scalability; elastic for peak events (Prime Day).',
            'Durable orders — an accepted order is never lost.',
          ],
          cons: [
            'Strong global consistency NOT required for catalog/reviews/recommendations.',
            'Displayed stock count can be slightly stale (reserve at checkout, not on view).',
            'Recommendations and "frequently bought" can be eventually consistent.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: "CAP framing — Amazon's own lesson",
          body: "Amazon's Dynamo paper made the case that for the shopping experience, **availability beats strong consistency** — the cart should always accept an add, even during partitions, reconciling later. But **inventory decrement** and **payment** are **CP**: they must be correct even at the cost of some latency.",
        },
      ],
    },
    {
      id: 'capacity-estimation',
      title: 'Capacity Estimation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Assume **300M** active customers, **500M** catalog items, **~5M orders/day** normally, and **10–20×** that during peak events. Browse traffic dwarfs orders.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Catalog items', value: '~500M', hint: '+ variants' },
            { label: 'Orders / day', value: '~5M', hint: '~58/sec avg' },
            { label: 'Peak orders / sec', value: '~10k+', hint: 'Prime Day spike' },
            { label: 'Search / page QPS', value: '~1M+', hint: 'browse ≫ buy' },
            { label: 'Read : write', value: '~100:1', hint: 'view vs purchase' },
            { label: 'Cart writes / sec', value: '~100k+', hint: 'add/remove' },
          ],
        },
        {
          type: 'markdown',
          value:
            'The defining trait is **extreme peakiness**: Prime Day / Black Friday can be 10–20× normal load, concentrated on a few hot products. Capacity, autoscaling, and inventory contention must be designed for the spike, not the average:',
        },
        {
          type: 'math',
          display: true,
          tex: 'Orders_{peak} \\approx Orders_{avg} \\times Spike = 58\\,\\tfrac{\\text{ord}}{\\text{s}} \\times 20 \\approx 1160\\,\\tfrac{\\text{ord}}{\\text{s}}\\ \\text{sustained, with hot-item bursts} \\gg 10k\\,\\tfrac{\\text{ord}}{\\text{s}}',
          caption:
            'Peak order rate is many times the average, and worse, concentrated on a few viral SKUs — the inventory hot-key problem.',
        },
        {
          type: 'markdown',
          value:
            'Browse/search traffic is the most read-heavy component and the first to need aggressive caching + CDN; the checkout path is lower-volume but the highest-stakes for correctness.',
        },
      ],
    },
    {
      id: 'high-level-architecture',
      title: 'High-Level Architecture',
      blocks: [
        {
          type: 'markdown',
          value:
            'A shopper hits a **gateway / BFF** that fans out to microservices: **Catalog/Search** for discovery, **Cart** for the basket, and **Order/Checkout** to place an order. Checkout acts as a **saga orchestrator**, coordinating **Inventory** (reserve stock), **Payment** (authorize/capture), and **Fulfillment** (warehouse + ship), with **Kafka** carrying domain events to downstream systems.',
        },
        {
          type: 'mermaid',
          caption: 'Discovery services + the checkout saga across inventory, payment, fulfillment.',
          definition: `flowchart TD
  Shopper["Shopper"] --> GW["Gateway / BFF"]
  GW --> Cat["Catalog / Search"]
  Cat --> ES[("Elasticsearch")]
  Cat --> CatDB[("Catalog: DynamoDB")]
  GW --> Cart["Cart Service"]
  Cart --> CartDB[("Cart: DynamoDB, AP")]
  GW --> Order["Order / Checkout (saga)"]
  Order --> Inv["Inventory Service"]
  Inv --> InvDB[("Stock: strongly consistent")]
  Order --> Pay["Payment Service"]
  Order --> OrderDB[("Orders: SQL, CP")]
  Order --> K[("Kafka: order.events")]
  K --> Fulfill["Fulfillment"]
  K --> Notify["Notifications"]
  K --> Reco["Recommendations / Analytics"]`,
        },
        {
          type: 'architectureCard',
          title: 'Catalog / Search',
          description:
            'Read-heavy discovery: product metadata in a key-value store, full-text + faceted search in Elasticsearch, product pages assembled by a BFF and heavily cached (CDN for images, Redis for hot products).',
          icon: 'search',
          tags: ['catalog', 'search', 'cacheable'],
        },
        {
          type: 'architectureCard',
          title: 'Cart Service',
          description:
            'Always-available basket (the original Dynamo use case). Optimized for write availability so an add-to-cart never fails, even during partitions; conflicts are merged on read.',
          icon: 'cart',
          tags: ['dynamo', 'AP', 'always-writable'],
        },
        {
          type: 'architectureCard',
          title: 'Checkout Orchestrator',
          description:
            'Runs the order as a saga: reserve inventory → authorize payment → confirm order → trigger fulfillment, with compensating actions (release reservation, void auth) if any step fails. Idempotent and durable.',
          icon: 'route',
          tags: ['saga', 'orchestration', 'CP'],
        },
      ],
    },
    {
      id: 'catalog-search',
      title: 'Catalog & Search',
      blocks: [
        {
          type: 'markdown',
          value:
            'The catalog is huge, semi-structured (every category has different attributes), and read-dominated. Product data lives in a flexible key-value/document store; an **Elasticsearch** index powers keyword search, **faceted filtering** (brand, price, rating), typeahead, and relevance ranking blended with business signals (popularity, conversion, sponsored).',
        },
        {
          type: 'code',
          language: 'json',
          filename: 'product-search.json',
          highlightLines: [4, 5, 6, 7, 8, 9],
          code: `POST /products/_search
{
  "query": {
    "bool": {
      "must":   [{ "multi_match": { "query": "noise cancelling headphones", "fields": ["title^3", "brand", "desc"] } }],
      "filter": [
        { "range": { "price": { "lte": 20000 } } },
        { "term": { "inStock": true } },
        { "range": { "rating": { "gte": 4 } } }
      ]
    }
  },
  "aggs": { "brands": { "terms": { "field": "brand" } } },   // facets
  "sort": ["_score", { "popularity": "desc" }]
}`,
        },
        {
          type: 'bestPractices',
          title: 'Catalog & search best practices',
          practices: [
            '**Denormalize for reads**: store a product as a self-contained document to render a page in one fetch.',
            '**Cache hot products + pages** (Redis) and serve images from a **CDN**.',
            '**Index asynchronously**: catalog writes flow to ES via a pipeline (eventually consistent).',
            '**Faceted search via aggregations** for category filters.',
            '**Blend ranking signals** — relevance + popularity + conversion + sponsorship.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Show availability, reserve later',
          body: 'The product page shows an *approximate* "in stock" flag from a cached value. The **authoritative** stock check + reservation happens at **checkout**, not on every page view — otherwise the inventory store becomes a read hot-spot for popular items.',
        },
      ],
    },
    {
      id: 'api-design',
      title: 'API Design',
      blocks: [
        {
          type: 'apiTable',
          title: 'Core endpoints',
          endpoints: [
            {
              method: 'GET',
              path: '/v1/search?q=&filters=',
              description: 'Search + facets',
              auth: false,
            },
            {
              method: 'GET',
              path: '/v1/products/{id}',
              description: 'Product detail page data',
              auth: false,
            },
            { method: 'GET', path: '/v1/cart', description: 'Get the current cart', auth: true },
            {
              method: 'PUT',
              path: '/v1/cart/items',
              description: 'Add / update / remove an item',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/orders',
              description: 'Place an order (idempotent, starts the saga)',
              auth: true,
            },
            {
              method: 'GET',
              path: '/v1/orders/{id}',
              description: 'Order status + tracking',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/orders/{id}/cancel',
              description: 'Cancel (compensating saga)',
              auth: true,
            },
          ],
        },
        {
          type: 'markdown',
          value:
            'Placing an order is **idempotent** — a client-supplied key (often derived from the cart version) ensures a double-submit or retry never creates two orders or double-charges.',
        },
        {
          type: 'code',
          language: 'json',
          filename: 'place-order.json',
          highlightLines: [2, 9],
          code: `{
  "idempotencyKey": "order_01H8X...",   // dedupe double-submit / retry
  "cartId": "cart_42",
  "items": [
    { "sku": "B07X...", "qty": 1, "priceCents": 18999 },
    { "sku": "B09Y...", "qty": 2, "priceCents": 1299 }
  ],
  "shipTo": { "addressId": "a_12" },
  "payment": { "method": "card", "instrumentId": "pm_visa_01" }
}`,
        },
      ],
    },
    {
      id: 'inventory',
      title: 'Inventory: Never Oversell',
      blocks: [
        {
          type: 'markdown',
          value:
            'Inventory is the **CP heart** of the system. The hard case: 10,000 people try to buy the last 100 units of a hot SKU at the same instant. You must sell **exactly 100** — no more (oversell → angry customers, cancellations), ideally no fewer (undersell → lost revenue). This is a high-contention, strongly-consistent decrement.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'reserve.sql',
          highlightLines: [3, 4, 5],
          code: `-- Atomic conditional decrement: only succeeds if enough stock remains.
UPDATE inventory
   SET available = available - :qty,
       reserved  = reserved  + :qty
 WHERE sku = :sku
   AND available >= :qty;       -- guard prevents overselling
-- 0 rows updated => out of stock; fail this checkout fast.`,
        },
        {
          type: 'bestPractices',
          title: 'Inventory at scale',
          practices: [
            "**Reserve, don't just sell**: hold stock for the order, with a TTL so abandoned carts release it.",
            "**Atomic conditional decrement** (DB or Redis) so concurrent buys can't oversell.",
            '**Shard hot SKUs** into sub-counters and aggregate to spread contention.',
            '**Reserve at checkout**, not on page view, to keep the hot path narrow.',
            '**Reconcile** physical vs logical stock asynchronously (warehouse truth).',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'The reservation lifecycle',
          body: 'A reservation is temporary: created at checkout, **confirmed** when payment succeeds, or **released** (compensating action) if payment fails or the cart is abandoned past a TTL. This is exactly why checkout is modeled as a saga — every step needs an undo.',
        },
      ],
    },
    {
      id: 'checkout-saga',
      title: 'Checkout as a Saga',
      blocks: [
        {
          type: 'markdown',
          value:
            'Checkout spans multiple services (inventory, payment, order, fulfillment), each with its own database — so a single ACID transaction is impossible. Instead, use the **saga pattern**: a sequence of local transactions where each step has a **compensating action** to undo it if a later step fails. An **orchestrator** drives the steps and the rollbacks.',
        },
        {
          type: 'mermaid',
          caption: 'Checkout saga with compensations.',
          definition: `sequenceDiagram
  participant O as Checkout Orchestrator
  participant I as Inventory
  participant P as Payment
  participant D as Order DB
  participant F as Fulfillment
  O->>I: reserve stock
  I-->>O: reserved (or out-of-stock → abort)
  O->>P: authorize payment
  alt payment fails
    P-->>O: declined
    O->>I: release reservation (compensate)
    O-->>O: mark order FAILED
  else payment ok
    P-->>O: authorized
    O->>D: persist order CONFIRMED
    O->>I: confirm reservation (decrement for real)
    O->>F: trigger fulfillment
  end`,
        },
        {
          type: 'featureComparison',
          caption: 'Saga orchestration vs choreography.',
          columns: ['Orchestration', 'Choreography'],
          rows: [
            { feature: 'Central coordinator', values: [true, false] },
            { feature: 'Easy to reason about flow', values: [true, false] },
            { feature: 'Services loosely coupled', values: [false, true] },
            { feature: 'Good for complex flows', values: [true, false] },
            { feature: 'Risk of cyclic event chains', values: [false, true] },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Why not 2-phase commit?',
          body: '2PC locks resources across services for the duration and blocks if the coordinator dies — disastrous for availability and throughput at e-commerce scale. Sagas trade atomicity for **availability + eventual correctness via compensation**, which fits the business (a failed payment simply releases the reservation).',
        },
      ],
    },
    {
      id: 'cart',
      title: 'The Shopping Cart',
      blocks: [
        {
          type: 'markdown',
          value:
            'The cart is the canonical **highly-available** store — the original motivation for **Dynamo**. The principle: an **add-to-cart must never fail**, even during a network partition, because a rejected add is lost revenue. Availability is chosen over consistency, and conflicting versions are **merged** on read.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Conflict resolution',
          body: 'If the same cart is written from two devices during a partition, Dynamo keeps **both versions** (tracked by vector clocks) and reconciles on read. For a cart, a safe merge is the **union** of items — better to occasionally resurrect a removed item than to lose an added one.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'CartService.java',
          highlightLines: [6, 7, 8],
          code: `@Service
public class CartService {
  private final DynamoCart store;   // AP, vector-clock versioned

  public Cart addItem(String cartId, Item item) {
    // Always succeeds; never blocks on a quorum failure.
    return store.merge(cartId, c -> c.withItem(item),
                       /* on conflict */ Cart::unionMerge);
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Cart price is not order price',
          body: 'Prices and availability can change between adding to cart and checkout. Re-validate **price and stock at checkout** (and show the user any change) — the cart stores intent, not a binding quote.',
        },
      ],
    },
    {
      id: 'database-design',
      title: 'Database Design',
      blocks: [
        {
          type: 'markdown',
          value:
            'Polyglot persistence split along the AP/CP line: catalog + cart in highly-available key-value stores, search in Elasticsearch, inventory + orders + payments in strongly-consistent stores, and events in Kafka.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'orders.sql',
          highlightLines: [3, 4, 11],
          code: `-- Authoritative order. Strongly consistent; one row per order.
CREATE TABLE orders (
  order_id    UUID PRIMARY KEY,
  status      TEXT NOT NULL,    -- CREATED|RESERVED|PAID|CONFIRMED|SHIPPED|DELIVERED|CANCELLED|FAILED
  customer_id BIGINT NOT NULL,
  items       JSONB NOT NULL,   -- snapshot of sku, qty, price at purchase
  total_cents INT NOT NULL,
  saga_state  JSONB,            -- which steps completed (for recovery)
  created_at  TIMESTAMPTZ DEFAULT now(),
  idem_key    TEXT UNIQUE       -- exactly-once order creation
);`,
        },
        {
          type: 'table',
          caption: 'Data store chosen per workload.',
          headers: ['Data', 'Store', 'Why'],
          rows: [
            ['Product catalog', 'DynamoDB / document store', 'Flexible schema, read-heavy, AP'],
            ['Search index', 'Elasticsearch', 'Full-text + facets + ranking'],
            ['Shopping cart', 'DynamoDB', 'Always-writable, conflict merge'],
            ['Inventory', 'Strongly-consistent SQL / Redis', 'Atomic decrement, no oversell, CP'],
            ['Orders + payments', 'Sharded SQL', 'Transactions, exactly-once, CP'],
            ['Order/inventory events', 'Kafka', 'Decouple fulfillment/notify/analytics'],
            ['Images / assets', 'S3 + CDN', 'Large, static, cacheable'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Snapshot the order',
          body: 'Store the **price and item details at purchase time** in the order row. The catalog price may change later, but the order must reflect what the customer actually agreed to pay.',
        },
      ],
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      blocks: [
        {
          type: 'markdown',
          value:
            'Recommendations drive a large share of revenue. Amazon pioneered **item-to-item collaborative filtering** ("customers who bought X also bought Y") — which scales far better than user-to-user CF because the item-similarity matrix is precomputed offline and looked up in O(1) at serve time.',
        },
        {
          type: 'bestPractices',
          title: 'Recommendation approaches',
          practices: [
            '**Item-to-item CF**: precompute a similar-items matrix from co-purchase/co-view data.',
            '**Session-based**: "frequently bought together", recently viewed, complementary items.',
            '**Personalized ranking**: blend history, trending, and category affinity.',
            '**Precompute offline** (batch over order/clickstream data); serve from a fast cache.',
            '**Contextual placements**: home, product page, cart, post-purchase emails.',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Why item-to-item scales',
          body: 'User-to-user CF must compare a user against millions of others at request time. Item-to-item flips it: similarities between items are stable and precomputable, so a recommendation is just "look up neighbors of the items in your history" — fast and scalable.',
        },
      ],
    },
    {
      id: 'scaling-strategy',
      title: 'Scaling Strategy',
      blocks: [
        {
          type: 'bestPractices',
          practices: [
            '**Cache + CDN the discovery path** (catalog, search, images) — it is the heaviest traffic.',
            '**Keep the cart always-writable** (AP) so revenue is never lost on an add.',
            '**Reserve inventory at checkout only**, sharding hot SKUs to spread contention.',
            "**Model checkout as an async saga** so slow steps don't hold locks across services.",
            '**Autoscale for peak events** and pre-warm capacity + caches before Prime Day.',
            '**Cell-based architecture**: isolate customers into independent cells to limit blast radius.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Designing for Prime Day',
          body: 'Peak events are 10–20× normal and concentrated on hot SKUs. Strategies: pre-scale and load-test ahead of time, shard hot inventory counters, queue/throttle gracefully ("high demand"), and use **cell-based isolation** so one overloaded cell never cascades into a global outage.',
        },
      ],
    },
    {
      id: 'consistency',
      title: 'Consistency',
      blocks: [
        {
          type: 'markdown',
          value:
            'The system is a textbook **mixed-consistency** design. Catalog, search, cart, and recommendations are AP/eventually consistent; inventory, orders, and payments are CP/strongly consistent. Idempotency keys span both worlds to make retries safe.',
        },
        {
          type: 'featureComparison',
          caption: 'Consistency expectations by data type.',
          columns: ['Strong', 'Eventual'],
          rows: [
            { feature: 'Inventory decrement', values: [true, false] },
            { feature: 'Order + payment', values: [true, false] },
            { feature: 'Shopping cart', values: [false, true] },
            { feature: 'Catalog / search', values: [false, true] },
            { feature: 'Recommendations', values: [false, true] },
            { feature: 'Displayed stock count', values: [false, true] },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Idempotency is the glue',
          body: 'Every mutating step (order creation, inventory reservation, payment capture) is keyed so retries are safe. This turns an unreliable, multi-service flow into one that converges to a correct outcome despite failures and redeliveries.',
        },
      ],
    },
    {
      id: 'availability',
      title: 'Availability',
      blocks: [
        {
          type: 'markdown',
          value:
            'Availability is revenue. The discovery path degrades gracefully: if search ranking is down, fall back to basic relevance; if recommendations fail, show best-sellers; if reviews are unavailable, hide them. The checkout path favors correctness but uses retries + sagas so transient failures self-heal rather than dropping orders.',
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Graceful degradation',
          body: 'A degraded store (generic recommendations, cached prices, no reviews) still sells. Never let a non-critical service take down browse, cart, or checkout — and never oversell or double-charge to stay up.',
        },
        {
          type: 'youtube',
          videoId: 'EpASu_1dUdE',
          title: 'Designing an e-commerce / Amazon system (illustrative embed)',
        },
      ],
    },
    {
      id: 'partitioning',
      title: 'Partitioning',
      blocks: [
        {
          type: 'markdown',
          value:
            'Catalog partitions by `product_id`, cart by `customer_id`, orders by `order_id`/customer, inventory by `sku`. Search shards by product. This keeps the common operations — view a product, read my cart, place my order — to a single partition.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Avoid hot partitions',
          body: 'A viral SKU on Prime Day is both a read hot-spot (everyone views it) and a write hot-spot (everyone reserves it). Mitigate reads with **caching/CDN**, and writes by **sharding the inventory counter** (`sku:bucket`) and summing — the same hot-key technique used for view counts and like counters.',
        },
      ],
    },
    {
      id: 'sharding',
      title: 'Sharding',
      blocks: [
        {
          type: 'markdown',
          value:
            'DynamoDB-style stores shard transparently by partition key. Orders shard by customer/order id; the relational order store can use a Vitess-like layer. Crucially, Amazon uses **cell-based architecture**: customers are routed to self-contained "cells" (each a full stack), so failures and hot spots are contained within a cell.',
        },
        {
          type: 'mermaid',
          caption: 'Cell-based isolation: each cell is an independent full stack.',
          definition: `flowchart LR
  Router["Cell Router (by customer)"] --> Cell1["Cell A (catalog+cart+order+inv)"]
  Router --> Cell2["Cell B"]
  Router --> Cell3["Cell C"]`,
        },
      ],
    },
    {
      id: 'replication',
      title: 'Replication',
      blocks: [
        {
          type: 'markdown',
          value:
            "Highly-available stores (catalog, cart) replicate across AZs/regions with tunable quorums (Dynamo's sloppy quorum + hinted handoff keep writes available during failures). Order + payment stores use synchronous quorum/consensus replication so a committed order survives an AZ loss. Images replicate across CDN edges globally.",
        },
        {
          type: 'prosCons',
          title: 'Multi-region + multi-AZ',
          pros: [
            'Survives AZ/region failures with no lost orders.',
            'Low latency: serve customers from the nearest region.',
            'Cart/catalog stay writable during partitions.',
          ],
          cons: [
            'Cross-region consistency for inventory is hard (regional stock pools help).',
            'Operational complexity + cost.',
            'Conflict resolution needed for AP stores.',
          ],
        },
      ],
    },
    {
      id: 'fault-tolerance',
      title: 'Fault Tolerance',
      blocks: [
        {
          type: 'bestPractices',
          practices: [
            '**Saga compensations** undo partial checkouts (release reservation, void auth).',
            '**Idempotency keys** + **unique constraints** prevent duplicate orders/charges.',
            '**Reservation TTLs** auto-release stock from abandoned/failed checkouts.',
            '**Retries with backoff** on transient service failures within the saga.',
            '**Circuit breakers + fallbacks** on search, recommendations, reviews.',
            '**Reconciliation jobs** fix stuck sagas and sync logical vs physical inventory.',
          ],
        },
        {
          type: 'expandable',
          title: 'Example: idempotent order creation',
          blocks: [
            {
              type: 'code',
              language: 'java',
              filename: 'OrderService.java',
              code: `public Order placeOrder(OrderRequest req) {
  // Exactly-once: unique idem_key means a retry returns the existing order
  // instead of creating a duplicate or re-running the saga.
  Optional<Order> existing = orders.findByIdemKey(req.idempotencyKey());
  if (existing.isPresent()) return existing.get();

  Order order = orders.create(req, Status.CREATED);   // unique(idem_key)
  sagaOrchestrator.start(order);                       // reserve → pay → confirm
  return order;
}`,
            },
          ],
        },
      ],
    },
    {
      id: 'trade-offs',
      title: 'Trade-offs',
      blocks: [
        {
          type: 'table',
          caption: 'Key decisions and what they cost.',
          headers: ['Decision', 'Gain', 'Cost'],
          rows: [
            ['AP cart (Dynamo)', 'Never lose an add-to-cart', 'Conflict resolution / merge logic'],
            ['Saga (not 2PC)', 'Availability + scale', 'Eventual correctness; compensation code'],
            ['Reserve at checkout', 'Narrow hot path, no oversell', 'Reservation lifecycle + TTLs'],
            ['Async search indexing', 'Fast catalog writes', 'Search lag behind catalog'],
            [
              'Cell-based architecture',
              'Contained blast radius',
              'Routing + cross-cell complexity',
            ],
            ['Item-to-item CF', 'Scales to huge catalogs', 'Offline precompute pipeline'],
          ],
        },
      ],
    },
    {
      id: 'technology-choices',
      title: 'Technology Choices',
      blocks: [
        {
          type: 'markdown',
          value: 'A representative slice of the stack and the role each plays:',
        },
        {
          type: 'table',
          headers: ['Concern', 'Technology'],
          rows: [
            ['Catalog + cart', 'DynamoDB'],
            ['Search', 'Elasticsearch / OpenSearch'],
            ['Inventory', 'Strongly-consistent SQL / Redis'],
            ['Orders + payments', 'Sharded relational (CP)'],
            ['Eventing', 'Apache Kafka / Kinesis'],
            ['Caching', 'Redis / ElastiCache'],
            ['Images / assets', 'S3 + CloudFront-style CDN'],
            ['Recommendations', 'Offline batch (Spark) + serving cache'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: "Dynamo's legacy",
          body: 'The 2007 **Dynamo paper** (shopping cart driven) introduced consistent hashing, vector clocks, sloppy quorums, and hinted handoff to the mainstream — and inspired Cassandra, Riak, and DynamoDB. The shopping cart is one of the most influential system-design problems in history.',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'checkout-service.deploy.yaml',
          code: `service: checkout-orchestrator
strategy: rolling
regions: [us-east-1, eu-west-1, ap-south-1]
autoscaling:
  metric: orders_in_flight
  target: 200
  min: 20
  max: 2000
  scheduledWarmup: ["prime-day-eve"]   # pre-scale for peak events
healthCheck:
  path: /health
  unhealthyThreshold: 3`,
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      blocks: [
        {
          type: 'interviewQa',
          items: [
            {
              question: 'How do you prevent overselling the last items of a hot product?',
              answer:
                'Make inventory the **CP** component: reserve stock with an **atomic conditional decrement** (`WHERE available >= qty`) so concurrent buyers can never drive it negative. Reserve at **checkout** (not page view), shard hot-SKU counters to spread contention, and release reservations via TTL/compensation if payment fails.',
            },
            {
              question:
                'How do you handle checkout across many services without a distributed transaction?',
              answer:
                'Use the **saga pattern**: a sequence of local transactions (reserve → authorize → confirm → fulfill) where each step has a **compensating action** (release reservation, void auth). An orchestrator drives it, with idempotency so retries are safe. This gives availability and eventual correctness without the blocking locks of 2PC.',
            },
            {
              question: 'Why is the shopping cart designed for availability over consistency?',
              answer:
                'A rejected add-to-cart is lost revenue, so the cart must **always accept writes**, even during partitions — the original Dynamo motivation. Conflicting versions (e.g. edits from two devices) are kept and **merged on read** (union of items), favoring not losing an added item.',
            },
            {
              question: 'How do you make order placement exactly-once?',
              answer:
                'A client-supplied **idempotency key** stored as a `UNIQUE` constraint: a retried submit returns the existing order instead of creating a duplicate or re-running the saga. Payment capture is likewise keyed on the order id.',
            },
            {
              question: 'How do you scale for Prime Day?',
              answer:
                'Pre-scale and load-test ahead of time, cache/CDN the discovery path, shard hot inventory counters, throttle gracefully under extreme load, and use **cell-based architecture** so an overloaded cell is contained and never cascades into a global outage.',
            },
            {
              question: 'How do recommendations scale to a huge catalog?',
              answer:
                "Use **item-to-item collaborative filtering**: precompute an item-similarity matrix offline from co-purchase/co-view data, then a recommendation is just looking up neighbors of items in the user's history — O(1) at serve time, unlike user-to-user CF which compares against millions of users live.",
            },
          ],
        },
      ],
    },
    {
      id: 'references',
      title: 'References',
      blocks: [
        {
          type: 'references',
          items: [
            {
              label: "Dynamo: Amazon's Highly Available Key-value Store (2007)",
              url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf',
              source: 'Amazon',
            },
            {
              label: 'Amazon.com Recommendations: Item-to-Item Collaborative Filtering',
              url: 'https://www.cs.umd.edu/~samir/498/Amazon-Recommendations.pdf',
              source: 'IEEE',
            },
            {
              label: 'Saga Pattern',
              url: 'https://microservices.io/patterns/data/saga.html',
              source: 'microservices.io',
            },
            {
              label: 'Workload Isolation Using Cells (AWS)',
              url: 'https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/',
              source: 'AWS',
            },
            {
              label: "Builders' Library: Avoiding Insurmountable Queue Backlogs",
              url: 'https://aws.amazon.com/builders-library/',
              source: 'AWS',
            },
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'callout',
          variant: 'summary',
          title: 'Key takeaways',
          body: '1. **Split a read-heavy discovery path** (catalog/search/cart, cached + AP) from a **write-critical commerce path** (inventory/payment/order, CP).\n2. **Never oversell**: inventory is strongly consistent with atomic conditional decrements; reserve at checkout and shard hot SKUs.\n3. **Model checkout as a saga** with compensating actions instead of 2PC — availability + eventual correctness.\n4. **The cart is always-writable** (Dynamo): accept every add, merge conflicts on read; re-validate price/stock at checkout.\n5. **Design for peak + blast radius**: idempotency everywhere, cell-based isolation, and item-to-item CF for scalable recommendations.',
        },
      ],
    },
  ],
};

export default content;
