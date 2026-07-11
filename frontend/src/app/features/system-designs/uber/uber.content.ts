import { DesignContent } from '../../../shared/models';
import { UBER_META } from './uber.meta';

/**
 * Flagship-depth example (peer of the Netflix, WhatsApp, and Twitter designs).
 * Centers on the defining problems of ride-hailing: real-time geospatial
 * indexing of moving drivers, low-latency rider↔driver matching, the trip
 * state machine, ETA, and surge pricing.
 */
const content: DesignContent = {
  meta: UBER_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Uber is a real-time **two-sided marketplace** that matches **riders** with nearby **drivers** and orchestrates the resulting trip end to end. It operates in **10,000+ cities**, handles **tens of millions of trips/day**, and ingests **location pings from millions of moving drivers** every few seconds. The defining challenge is doing low-latency **geospatial matching** over a constantly-changing map of vehicles, then managing each trip through a reliable state machine.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The big idea',
          body: 'Everything hinges on answering **"which drivers are near this rider, right now?"** in milliseconds, while millions of drivers continuously move. That requires a **geospatial index** (S2/geohash cells) kept hot in memory and updated from a firehose of GPS pings — plus a **dispatch** system that turns "nearby" into an actual matched, accepted trip.',
        },
        {
          type: 'image',
          src: 'assets/diagrams/uber-dispatch.svg',
          alt: "Uber dispatch architecture: rider requests via the gateway, the matching service queries the location service's geospatial index (populated by driver GPS pings) and offers the trip, which is tracked in the trip store with Kafka events.",
          caption:
            'High-level dispatch path. Driver pings feed a geospatial index; the matching service queries it to find and offer nearby drivers; the trip is then tracked as a state machine.',
        },
      ],
    },
    {
      id: 'clarifying-questions',
      title: 'Clarifying Questions',
      blocks: [
        {
          type: 'markdown',
          value:
            'A ride-hailing prompt hides several genuinely different sub-problems (geospatial search, dispatch, pricing, payments). Use the first **3-5 minutes** to agree on which ones you are actually designing, then state your assumptions and get to the whiteboard.',
        },
        {
          type: 'table',
          caption: 'Questions to ask, and reasonable assumptions if the interviewer says "you decide".',
          headers: ['Question', 'Why it matters / sample assumption'],
          rows: [
            [
              'What scale — concurrent online drivers, trips/day, how many cities?',
              'Assume ~5M concurrent drivers, ~20M trips/day, global (10,000+ cities) — this is what justifies an in-memory geospatial index over a DB query.',
            ],
            [
              'Should the design cover matching/dispatch, or also pricing and payments end to end?',
              'Focus depth on location indexing + matching + trip state machine; cover pricing (surge) and payments at a design level without full ledger detail.',
            ],
            [
              'How precise/fresh must driver location be — real-time to the second, or a few seconds of staleness acceptable?',
              'A few seconds of staleness is fine (~4s ping interval) — this is what makes an AP, in-memory index acceptable instead of a strongly consistent store.',
            ],
            [
              'Should matching rank by straight-line distance or real ETA over roads?',
              'Rank by ETA over the road network via a maps/routing service — straight-line distance is a naive first pass worth mentioning and then improving on.',
            ],
            [
              'Is surge/dynamic pricing in scope?',
              'Yes, at a level of "compute a per-area multiplier from demand/supply and lock the quote at request time" — not a full pricing ML model.',
            ],
            [
              'What consistency is required for trip assignment — can two drivers ever be offered/accept the same trip?',
              'No — trip assignment and payment must be strongly consistent (CP); location and surge can be eventually consistent (AP).',
            ],
            [
              'Do we need to support scheduled/advance rides, or only on-demand?',
              'On-demand only for the core design; scheduled rides are a reasonable extension to mention but not build out.',
            ],
            [
              'Is this single-region or must it work globally with local failover?',
              'Assume global, but note that ride-hailing is naturally regional — a rider is only ever matched with a driver in the same city, which becomes the sharding key.',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Say your assumptions out loud',
          body: 'Narrate trade-offs as you commit to them: "I will treat location as eventually consistent since a driver a couple seconds stale is fine, but trip assignment and payment need to be strongly consistent — I will design those two halves differently." This shows you understand *why* the system mixes consistency models rather than reciting it.',
        },
      ],
    },
    {
      id: 'functional-requirements',
      title: 'Functional Requirements',
      blocks: [
        {
          type: 'markdown',
          value: 'We scope the interview to the core ride-hailing marketplace.',
        },
        {
          type: 'bestPractices',
          title: 'In scope',
          practices: [
            '**Driver location updates**: ingest GPS pings (~every 4s) from online drivers.',
            '**Request a ride**: rider sets pickup/destination, gets fare estimate + ETA.',
            '**Matching / dispatch**: find nearby drivers and offer the trip.',
            '**Trip lifecycle**: accept → en route → arrived → in-trip → completed.',
            '**Real-time tracking**: rider sees the driver move on the map.',
            '**Pricing**: fare estimation + dynamic **surge** pricing.',
            '**Payments** at trip completion (charge + payout).',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Out of scope (state this explicitly)',
          body: 'Uber Eats, the routing/maps engine internals (we use it as a service), driver onboarding/background checks, fraud ML, and ratings. Naming the boundary keeps the focus on geospatial matching + trip orchestration.',
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
            'Low matching latency: rider gets a driver within seconds.',
            'High availability of request/match/trip path (target 99.99%).',
            'Massive write throughput for location pings (millions/sec).',
            'Geospatial query latency in low milliseconds.',
            'Strong consistency for the trip state machine and payments.',
          ],
          cons: [
            'Exact, globally-consistent driver positions are not required (slightly stale is ok).',
            'Surge price can be computed per-region, eventually consistent.',
            'Analytics on trips can be fully asynchronous.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'CAP framing — it is mixed',
          body: 'The **location/matching** side is **AP**: a driver position a couple seconds stale is fine, and availability matters more than perfect freshness. The **trip + payment** side is **CP**: a trip must not be double-assigned and a rider must be charged exactly once — these need strong consistency and idempotency.',
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
            'Assume **5M concurrent online drivers** at peak, each emitting a GPS ping **every 4 seconds**, and **20M trips/day**.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Concurrent drivers', value: '~5M', hint: 'peak, online' },
            { label: 'Ping interval', value: '~4s', hint: 'per driver' },
            { label: 'Location writes / sec', value: '~1.25M', hint: '5M / 4s' },
            { label: 'Trips / day', value: '~20M', hint: '~230/sec avg' },
            { label: 'Peak trip requests / sec', value: '~5k+', hint: 'rush hour / events' },
            { label: 'Ping size', value: '~100 bytes', hint: 'id, lat, lng, ts, speed' },
          ],
        },
        {
          type: 'markdown',
          value:
            'The dominant load is the **location ping firehose**, not trips. Sizing the ingest write rate:',
        },
        {
          type: 'math',
          display: true,
          tex: 'W_{pings} = \\frac{D_{online}}{T_{interval}} = \\frac{5\\times10^{6}\\ \\text{drivers}}{4\\ \\text{s}} \\approx 1.25\\times10^{6}\\ \\text{location updates/sec}',
          caption:
            'Peak location write rate. This is why driver positions live in an in-memory geospatial index, not a disk-based database written on every ping.',
        },
        {
          type: 'markdown',
          value:
            'Ping bandwidth is modest (~125 MB/s of raw payload), but the **update rate** to the index and the **fan-out** of position to in-trip riders are the real engineering constraints.',
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
            'Drivers stream GPS pings through the gateway to the **Location Service**, which maintains the in-memory **geospatial index**. When a rider requests, the **Matching (DISCO)** service queries nearby cells, ranks candidates by ETA, and offers the trip. Accepted trips are owned by the **Trip Service** (a strongly-consistent state machine) which emits events to Kafka for pricing, payments, and analytics.',
        },
        {
          type: 'mermaid',
          caption: 'Location ingest, matching, and the trip state machine.',
          definition: `flowchart TD
  Driver["Driver App"] -->|GPS ping ~4s| GW["API Gateway (WS)"]
  Rider["Rider App"] -->|request| GW
  GW --> Loc["Location Service"]
  Loc --> GeoIdx[("Geospatial Index: S2 cells in Redis")]
  GW --> Match["Matching / DISCO"]
  GeoIdx --> Match
  Match --> ETA["ETA / Maps Service"]
  Match --> Pricing["Pricing / Surge"]
  Match --> Trip["Trip Service (state machine)"]
  Trip --> TripDB[("Trip Store: strongly consistent")]
  Trip --> Kafka[("Kafka: trip events")]
  Kafka --> Pay["Payments"]
  Kafka --> Analytics["Analytics / ML"]`,
        },
        {
          type: 'architectureCard',
          title: 'Location Service',
          description:
            'Ingests the ping firehose and maintains driver positions in an in-memory geospatial index keyed by S2/geohash cell. Answers "drivers within radius R of (lat,lng)" in milliseconds. Treated as ephemeral, high-throughput, AP state.',
          icon: 'globe',
          tags: ['geospatial', 'in-memory', 'high-write'],
        },
        {
          type: 'architectureCard',
          title: 'Matching (DISCO)',
          description:
            'The dispatch optimizer. Given a request, queries nearby cells, filters by availability/vehicle type, ranks by ETA (not just straight-line distance), and offers the trip to drivers sequentially or in batch.',
          icon: 'shuffle',
          tags: ['dispatch', 'matching', 'eta'],
        },
        {
          type: 'architectureCard',
          title: 'Trip Service',
          description:
            'Owns the authoritative trip state machine. Strongly consistent so a trip is assigned to exactly one driver and transitions are atomic. Emits domain events to Kafka for downstream systems.',
          icon: 'route',
          tags: ['state-machine', 'consistent', 'transactional'],
        },
      ],
    },
    {
      id: 'geospatial-indexing',
      title: 'Geospatial Indexing',
      blocks: [
        {
          type: 'markdown',
          value:
            'The core data-structure decision. To answer "who is nearby?" fast, the surface of the Earth is divided into **cells**, and each driver is bucketed into the cell containing their current position. A proximity query then reads the rider\'s cell plus its neighbors instead of scanning all drivers.',
        },
        {
          type: 'featureComparison',
          caption: 'Common geospatial indexing approaches.',
          columns: ['Geohash', 'S2 (Google)', 'H3 (Uber)'],
          rows: [
            {
              feature: 'Cell shape',
              values: ['Rectangles', 'Squares (cube-projected)', 'Hexagons'],
            },
            { feature: 'Uniform neighbor distance', values: [false, false, true] },
            { feature: 'Hierarchical levels', values: [true, true, true] },
            { feature: 'Prefix = coarser cell', values: [true, true, false] },
            { feature: 'Used by Uber', values: [false, false, true] },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Why hexagons (H3)',
          body: 'Uber built **H3** because hexagonal cells have **uniform distance to all 6 neighbors** (unlike squares, where diagonal neighbors are farther). That makes radius queries, smoothing, and surge-area math cleaner. Geohash/S2 are perfectly valid interview answers too — the key idea is "bucket by cell, query cell + neighbors".',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'nearby.py',
          highlightLines: [6, 7, 8],
          code: `import h3

def index_driver(driver_id, lat, lng, resolution=9):
    cell = h3.latlng_to_cell(lat, lng, resolution)  # ~0.1 km^2 hexagon
    redis.geoadd(f"cell:{cell}", lng, lat, driver_id)  # or per-cell set

def find_nearby(lat, lng, resolution=9, ring=1):
    center = h3.latlng_to_cell(lat, lng, resolution)
    cells = h3.grid_disk(center, ring)              # center + neighbor rings
    return [d for c in cells for d in redis.zrange(f"cell:{c}", 0, -1)]`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Choosing cell resolution is a trade-off',
          body: 'Too coarse → each query returns thousands of drivers to filter. Too fine → a single query must read many neighbor cells. Pick a resolution where a typical cell holds a manageable number of drivers (tens), and widen the search ring only if too few candidates are found.',
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
              method: 'POST',
              path: '/v1/drivers/location',
              description: 'Driver GPS ping (high frequency, over WebSocket)',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/trips/estimate',
              description: 'Fare + ETA estimate for a route',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/trips',
              description: 'Request a ride (creates a trip)',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/trips/{id}/accept',
              description: 'Driver accepts an offered trip',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/trips/{id}/status',
              description: 'Advance trip state (arrived, started, completed)',
              auth: true,
            },
            {
              method: 'GET',
              path: '/v1/trips/{id}/track',
              description: 'Live driver location stream (WebSocket)',
              auth: true,
            },
          ],
        },
        {
          type: 'markdown',
          value:
            'High-frequency pings and live tracking use a **persistent WebSocket**, not REST per ping. The trip request returns immediately with a `trip_id` in `SEARCHING` state; the match arrives asynchronously via the socket.',
        },
        {
          type: 'code',
          language: 'json',
          filename: 'trip-request.json',
          highlightLines: [2, 8],
          code: `{
  "idempotencyKey": "req_01H8X...",   // dedupe double-taps / retries
  "rider": { "id": "r_42" },
  "pickup":  { "lat": 12.9716, "lng": 77.5946 },
  "dropoff": { "lat": 12.9352, "lng": 77.6245 },
  "vehicleType": "UberX",
  "estimate": { "fare": "₹245-₹280", "etaMin": 4 },
  "paymentMethodId": "pm_visa_01"
}`,
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
            'Polyglot persistence, split sharply along the AP/CP line: ephemeral location data in Redis, the authoritative trip in a strongly-consistent store, history append-only, and events in Kafka.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'trips.sql',
          highlightLines: [3, 4],
          code: `-- Authoritative trip record. Strongly consistent; one row per trip.
CREATE TABLE trips (
  trip_id      UUID PRIMARY KEY,
  status       TEXT NOT NULL,        -- SEARCHING|ASSIGNED|ARRIVED|IN_TRIP|COMPLETED|CANCELLED
  rider_id     BIGINT NOT NULL,
  driver_id    BIGINT,               -- NULL until matched
  pickup       GEOGRAPHY(POINT),
  dropoff      GEOGRAPHY(POINT),
  fare_cents   INT,
  surge_mult   NUMERIC(3,2),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);
-- A driver can hold at most one active trip (enforced by app + unique index).
CREATE UNIQUE INDEX one_active_trip_per_driver
  ON trips (driver_id) WHERE status IN ('ASSIGNED','ARRIVED','IN_TRIP');`,
        },
        {
          type: 'table',
          caption: 'Data store chosen per workload.',
          headers: ['Data', 'Store', 'Why'],
          rows: [
            ['Live driver locations', 'Redis (geo index)', 'Ephemeral, millions of writes/sec, AP'],
            [
              'Active + historical trips',
              'Sharded SQL / Spanner-like',
              'Strong consistency, transactions',
            ],
            ['Trip history (cold)', 'Cassandra / warehouse', 'Append-only, analytics'],
            ['Surge by area', 'Redis', 'Per-cell, frequently recomputed'],
            ['Payments / ledger', 'Strongly-consistent SQL', 'Exactly-once, auditable'],
            ['Events', 'Kafka', 'Decouple pricing/payments/analytics'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The partial unique index trick',
          body: 'A unique index on `driver_id` restricted to active statuses guarantees a driver can never be double-assigned, at the database level — a clean safeguard backing the application-level matching logic.',
        },
      ],
    },
    {
      id: 'matching-flow',
      title: 'Matching & Dispatch Flow',
      blocks: [
        {
          type: 'markdown',
          value: 'The end-to-end dispatch sequence from request to accepted trip:',
        },
        {
          type: 'mermaid',
          caption: 'Request → nearby query → offer → accept.',
          definition: `sequenceDiagram
  participant R as Rider
  participant M as Matching (DISCO)
  participant L as Location Svc
  participant E as ETA Svc
  participant D as Driver
  participant T as Trip Svc
  R->>M: request trip (pickup, type)
  M->>L: drivers near cell + neighbors
  L-->>M: candidate drivers
  M->>E: ETA per candidate (road network)
  E-->>M: ranked by real ETA
  M->>D: offer trip (best candidate)
  D-->>M: accept
  M->>T: create/assign trip (atomic)
  T-->>R: matched! driver + live ETA
  T-->>D: navigate to pickup`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Rank by ETA, not distance',
          body: 'A driver 200m away across a river with no bridge is worse than one 1km away on the same road. Matching ranks candidates by **estimated time of arrival** over the road network (from the maps/routing service), not straight-line distance.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Handling rejections & timeouts',
          body: 'If the offered driver rejects or does not respond within a few seconds, DISCO offers the next candidate. To cut latency, some systems offer to a small batch and take the first acceptance — being careful to release the others atomically so no double-assignment occurs.',
        },
      ],
    },
    {
      id: 'trip-state-machine',
      title: 'Trip State Machine',
      blocks: [
        {
          type: 'markdown',
          value:
            'A trip is a **finite state machine**. Modeling it explicitly makes transitions atomic, auditable, and recoverable — and lets each transition emit an event for pricing, notifications, and payments.',
        },
        {
          type: 'mermaid',
          caption: 'Trip lifecycle states.',
          definition: `stateDiagram-v2
  [*] --> SEARCHING
  SEARCHING --> ASSIGNED: driver accepts
  SEARCHING --> CANCELLED: no driver / rider cancels
  ASSIGNED --> ARRIVED: driver reaches pickup
  ASSIGNED --> CANCELLED: cancel before pickup
  ARRIVED --> IN_TRIP: rider boards, trip starts
  IN_TRIP --> COMPLETED: arrive at dropoff
  COMPLETED --> [*]
  CANCELLED --> [*]`,
        },
        {
          type: 'expandable',
          title: 'Why a state machine (and not ad-hoc flags)',
          blocks: [
            {
              type: 'markdown',
              value:
                'Explicit states make illegal transitions impossible (you cannot go from `SEARCHING` to `COMPLETED`), give every transition a clear event to publish, and make crash recovery deterministic: on restart, a trip resumes from its persisted state. This is the backbone of correctness for the CP side of the system.',
            },
          ],
        },
      ],
    },
    {
      id: 'surge-pricing',
      title: 'Surge Pricing',
      blocks: [
        {
          type: 'markdown',
          value:
            'Surge balances supply and demand per area. For each geo cell, compute a multiplier from the ratio of open requests (demand) to available drivers (supply) over a short window. When demand outstrips supply, the multiplier rises, which both rations demand and incentivizes drivers to move toward the hot area.',
        },
        {
          type: 'math',
          display: true,
          tex: 'surge_{cell} = clamp\\left(1.0,\\ M_{max},\\ f\\!\\left(\\frac{demand_{cell}}{supply_{cell} + \\epsilon}\\right)\\right)',
          caption:
            'Surge multiplier per cell as a clamped function of the local demand/supply ratio.',
        },
        {
          type: 'bestPractices',
          title: 'Surge design considerations',
          practices: [
            'Compute per **geo cell** over a sliding time window, refreshed every few seconds.',
            '**Smooth** values across neighboring cells to avoid sharp price cliffs at borders.',
            '**Cap** the maximum multiplier and round to friendly values.',
            '**Lock** the quoted price for the rider for a short window once shown.',
            'Treat surge state as **eventually consistent** — a stale multiplier is acceptable.',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Quote stability',
          body: 'The rider must be charged the price they were shown. Capture the surge multiplier into the trip record at request time (the fare is computed from the locked quote), not recomputed at completion.',
        },
      ],
    },
    {
      id: 'message-queues',
      title: 'Message Queues',
      blocks: [
        {
          type: 'markdown',
          value:
            'Trip state transitions publish events to **Kafka**, decoupling the latency-critical matching path from downstream work: receipts, payments, driver payouts, ETA model training, fraud detection, and the data warehouse.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'TripCompletedConsumer.java',
          highlightLines: [6, 7, 8],
          code: `@KafkaListener(topics = "trip.completed", groupId = "billing")
public void onTripCompleted(TripEvent e) {
  // At-least-once delivery: make the charge idempotent so a retried
  // event never double-charges the rider.
  String key = "charge:" + e.tripId();
  if (ledger.alreadyProcessed(key)) return;
  Money fare = pricing.finalFare(e);           // uses locked surge quote
  payments.charge(e.riderId(), fare, key);     // idempotency key
  ledger.markProcessed(key);
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Payments must be idempotent',
          body: 'Charging money is the least forgiving operation in the system. Always key the charge on `trip_id` so reprocessing a duplicate `trip.completed` event is a safe no-op.',
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
            '**Keep locations in memory** (Redis) sharded by geo cell — never write every ping to disk.',
            '**Shard by geography**: a city/region is mostly self-contained, so partition matching by area.',
            '**Batch and sample pings**: drop redundant updates; interpolate position between pings on the client.',
            '**Async everything downstream** via Kafka so matching latency is unaffected.',
            '**Autoscale by region**: rush hour is local and time-shifted across the globe.',
            '**Cap query fan-out** by tuning cell resolution and search-ring size.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Geography is a natural shard key',
          body: 'Unlike a social graph, ride-hailing is **local**: a rider in Bangalore is only ever matched with drivers in Bangalore. Partitioning the matching and location systems by city/region keeps each shard small, independent, and easy to scale or fail over on its own.',
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
            'The system deliberately mixes consistency models along the AP/CP boundary. Location is best-effort and eventually consistent; trip assignment and payment are strongly consistent and transactional.',
        },
        {
          type: 'featureComparison',
          caption: 'Consistency expectations by data type.',
          columns: ['Strong', 'Eventual'],
          rows: [
            { feature: 'Trip assignment (one driver)', values: [true, false] },
            { feature: 'Payment / charge', values: [true, false] },
            { feature: 'Trip state transitions', values: [true, false] },
            { feature: 'Driver live location', values: [false, true] },
            { feature: 'Surge multiplier', values: [false, true] },
            { feature: 'ETA shown to rider', values: [false, true] },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Idempotency everywhere on the CP side',
          body: 'Network retries are inevitable on mobile. Idempotency keys on trip requests, accepts, and charges turn at-least-once delivery into effectively-once behavior — no duplicate trips, no double charges.',
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
            'Uber pioneered a resilience pattern where each city/region can run semi-independently, and even **drivers and riders can act as a short-lived cache/relay** so an in-progress trip survives a brief datacenter blip. Each dependency degrades gracefully: if surge is down, charge base fare; if ETA is down, fall back to a distance-based estimate.',
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Graceful degradation',
          body: 'An ongoing trip must never be lost. Persist trip state durably, let regions fail over independently, and degrade non-critical features (surge, precise ETA) rather than failing the trip.',
        },
        {
          type: 'youtube',
          videoId: 'umWABit-wbk',
          title: 'Designing Uber / ride-hailing (illustrative embed)',
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
            'The location and matching systems partition by **geo cell / city**, so a query only touches the relevant region. Trips partition by `trip_id` (or by city) for balanced writes. This locality is what makes per-millisecond proximity queries feasible.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Avoid hot partitions (and edges)',
          body: 'A stadium after a concert is a hot cell — huge demand in one area. Mitigate by sub-dividing dense cells at a finer resolution dynamically, and by load-shedding/queuing requests with clear rider feedback. Also handle riders requesting near a **city/shard boundary** by querying neighboring shards.',
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
            'Redis geo data shards by cell prefix; trip databases shard by city or trip id via consistent hashing so adding capacity rebalances automatically. Each city is largely a self-contained unit of scaling and failover.',
        },
        {
          type: 'mermaid',
          caption: 'Geographic sharding of location + matching.',
          definition: `flowchart LR
  R["Router (by region)"] --> C1["Shard: Bangalore (cells + trips)"]
  R --> C2["Shard: London"]
  R --> C3["Shard: NYC"]
  C1 --> Redis1[("Redis geo index")]
  C2 --> Redis2[("Redis geo index")]
  C3 --> Redis3[("Redis geo index")]`,
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
            'Trip and payment stores replicate with quorum/consensus (RF=3, one per AZ) so a single AZ failure never loses or double-commits a trip. Redis location indexes run with replicas so matching survives a node loss; because location is reconstructed from the ongoing ping stream within seconds, a cold replica self-heals quickly.',
        },
        {
          type: 'prosCons',
          title: 'Multi-region with regional ownership',
          pros: [
            'A region outage only affects that geography.',
            'Low latency: matching happens close to the riders/drivers.',
            'Trip + payment durability across AZs.',
          ],
          cons: [
            'Cross-region trips (rare) need special handling.',
            'Operational complexity of many semi-independent regions.',
            'Consensus writes add latency to the CP path.',
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
            '**Persist trip state before responding** so a crash never loses an in-progress trip.',
            '**Idempotency keys** on request/accept/charge make retries safe.',
            '**DB-level guard** (partial unique index) prevents double-assignment.',
            '**Offer timeouts + fallback to next driver** keep matching live under rejections.',
            '**Circuit breakers** on ETA/surge/maps with safe fallbacks.',
            "**Regional isolation** so one city's failure does not cascade globally.",
          ],
        },
        {
          type: 'expandable',
          title: 'Example: atomic driver assignment',
          blocks: [
            {
              type: 'code',
              language: 'sql',
              filename: 'assign.sql',
              code: `-- Assign atomically: only succeeds if the driver currently has no
-- active trip and the trip is still searching. Prevents double-assign.
UPDATE trips
   SET driver_id = :driver, status = 'ASSIGNED', updated_at = now()
 WHERE trip_id = :trip
   AND status = 'SEARCHING'
   AND NOT EXISTS (
     SELECT 1 FROM trips t2
      WHERE t2.driver_id = :driver
        AND t2.status IN ('ASSIGNED','ARRIVED','IN_TRIP')
   );
-- 0 rows updated => someone else won the race; offer the next driver.`,
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
            [
              'In-memory geo index',
              'Millisecond proximity queries',
              'Volatile; must rebuild from pings',
            ],
            [
              'Geographic sharding',
              'Locality, independent scaling',
              'Boundary/cross-region edge cases',
            ],
            [
              'Rank by ETA (road network)',
              'Realistic, better matches',
              'Extra dependency on maps service',
            ],
            [
              'Mixed AP/CP',
              'Right guarantee per concern',
              'Two consistency models to reason about',
            ],
            [
              'Async events (Kafka)',
              'Fast matching, decoupled',
              'Eventual side effects, idempotency needed',
            ],
            [
              'Hexagonal cells (H3)',
              'Uniform neighbors',
              'Custom library vs off-the-shelf geohash',
            ],
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
            ['Geospatial cells', 'H3 (Uber) / S2 / Geohash'],
            ['Location index', 'Redis (geo) / in-memory'],
            ['Real-time transport', 'WebSocket'],
            ['Trip + payments store', 'Sharded SQL / Spanner-like (CP)'],
            ['Eventing', 'Apache Kafka'],
            ['Routing / ETA', 'Maps + routing service (OSRM-like)'],
            ['Trip history / analytics', 'Cassandra / data warehouse'],
            ['Service mesh / RPC', 'gRPC / Thrift'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Build vs buy: H3',
          body: 'Uber open-sourced **H3** because no off-the-shelf index matched their need for uniform hexagonal cells across smoothing, surge, and matching. For most systems, geohash or S2 plus Redis GEO commands is more than enough — reach for a custom index only when the geometry genuinely demands it.',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'matching-service.deploy.yaml',
          code: `service: matching-disco
strategy: rolling
regions: [ap-south-1, eu-west-2, us-east-1]   # owns its cities
autoscaling:
  metric: open_requests_per_region
  target: 500
  min: 10
  max: 500
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
              question: 'How do you find nearby drivers efficiently?',
              answer:
                "Divide the map into cells (geohash / S2 / H3) and bucket each driver into the cell containing their position, kept in an in-memory index (Redis). A proximity query reads the rider's cell plus neighbor rings instead of scanning all drivers, giving millisecond lookups. Rank the candidates by **ETA over the road network**, not straight-line distance.",
            },
            {
              question: 'How do you handle 1M+ location updates per second?',
              answer:
                'Keep positions in memory (never write every ping to disk), shard by geo cell, sample/deduplicate redundant pings, and let clients interpolate between updates. The index is treated as ephemeral AP state that is continuously rebuilt from the ping stream.',
            },
            {
              question: 'How do you prevent a driver from being matched to two trips?',
              answer:
                'Model the trip as a strongly-consistent state machine and assign atomically — e.g. a conditional `UPDATE` that only succeeds if the trip is still `SEARCHING` and the driver has no active trip, backed by a **partial unique index** on `driver_id` for active statuses. Losers of the race get the next candidate.',
            },
            {
              question: 'How does surge pricing work?',
              answer:
                'Per geo cell, compute a multiplier from the demand/supply ratio over a short sliding window, smoothed across neighbors and clamped to a max. It is eventually consistent. Crucially, **lock the quote** into the trip at request time so the rider is charged what they were shown.',
            },
            {
              question: 'What consistency model does Uber use?',
              answer:
                'Mixed. **Location/matching is AP** (slightly stale positions are fine, availability matters). **Trip state and payments are CP** (no double-assignment, exactly-once charging), enforced with transactions and idempotency keys.',
            },
            {
              question: 'How do you keep an in-progress trip alive during failures?',
              answer:
                'Persist trip state durably and make regions fail over independently; degrade non-critical features (surge, precise ETA) rather than dropping the trip. Idempotent transitions mean a retried state update after a blip is safe.',
            },
            {
              question:
                'Why use H3/S2/geohash instead of a spatial index (e.g. R-tree) in a relational database?',
              answer:
                'A cell-based index turns "find nearby drivers" into a **hash lookup plus a small neighbor scan** in an in-memory store — microseconds, at millions of writes/sec from GPS pings. An R-tree in a relational database is a fine data structure for range queries, but the DB round-trip and lock/transaction overhead cannot sustain a firehose of location updates at this write rate. Cell indexing trades some precision for the throughput the workload actually needs.',
            },
            {
              question: 'How do you handle a rider requesting near a shard/city boundary?',
              answer:
                'If matching shards strictly by city, a rider near the boundary might miss drivers who are technically in the neighboring shard. Query a small set of **neighboring shards** in addition to the home shard whenever the request falls within a buffer distance of a boundary, and merge candidate lists before ranking by ETA. This is the same "query cell + neighbors" idea as the geospatial index, one level up.',
            },
            {
              question:
                'How would you extend the design to batch matching (assign multiple trips at once)?',
              answer:
                "Instead of matching each request the instant it arrives, batch requests and available drivers over a short window (e.g. a few seconds) and solve a **bipartite matching / assignment problem** (minimizing total ETA or maximizing throughput) rather than greedily matching one at a time. This trades a small amount of latency for materially better global matching quality, especially in dense areas — it's the natural follow-up once the interviewer sees you understand the greedy version's limitations.",
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
              label: "H3: Uber's Hexagonal Hierarchical Spatial Index",
              url: 'https://www.uber.com/blog/h3/',
              source: 'Uber Engineering',
            },
            {
              label: 'Engineering Real-Time Marketplace (DISCO) ',
              url: 'https://www.uber.com/blog/engineering-routing-engine/',
              source: 'Uber Engineering',
            },
            {
              label: 'How Uber Scales Its Real-Time Market Platform',
              url: 'https://highscalability.com/how-uber-scales-their-real-time-market-platform/',
              source: 'HighScalability',
            },
            {
              label: "Uber's Big Data Platform & Schemaless",
              url: 'https://www.uber.com/blog/schemaless-part-one-mysql-datastore/',
              source: 'Uber Engineering',
            },
            { label: 'H3 open-source library', url: 'https://h3geo.org/', source: 'h3geo.org' },
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
          body: '1. **Geospatial indexing is the core**: bucket drivers into cells (geohash/S2/H3) in an in-memory index and query cell + neighbors for millisecond proximity lookups.\n2. **Rank matches by ETA over the road network**, not straight-line distance, and handle rejections by offering the next candidate.\n3. **Mix consistency models**: AP for location/surge, CP for the trip state machine and payments — with idempotency keys everywhere.\n4. **Geography is a natural shard key**: partition location + matching by city/region for locality and independent failover.\n5. **Lock the surge quote** and make charges idempotent so riders are billed exactly what they were shown, exactly once.',
        },
      ],
    },
  ],
};

export default content;
