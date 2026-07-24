import { DesignContent } from '../../../shared/models';
import { GEOHASHING_META } from './geohashing.meta';

const content: DesignContent = {
  meta: GEOHASHING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**GeoHashing** encodes a `(latitude, longitude)` point into a short alphanumeric string so that **nearby locations usually share a common prefix**. Invented by Gustavo Niemeyer in 2008, it turns a hard 2D proximity problem into a 1D string that ordinary B-tree / trie indexes can search efficiently.\n\nSystems like Uber, Google Maps, and restaurant finders use this idea (or relatives such as S2/H3) to find “what is near me?” without scanning millions of rows.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Two magical properties',
          body: '**Spatial locality** — longer shared prefixes imply closer regions. **Indexable 1D key** — store a `VARCHAR`/`TEXT` geohash and prefix-search it like any other string.',
        },
      ],
    },
    {
      id: 'the-problem',
      title: 'The problem: nearby queries at scale',
      blocks: [
        {
          type: 'markdown',
          value:
            'A user at `(34.0523, -118.2438)` wants restaurants within ~1 km. A naive bounding-box SQL looks simple:',
        },
        {
          type: 'image',
          src: 'assets/article-images/geohashing/01-bounding-box-query-problem.png',
          alt: 'SQL bounding-box query filtering restaurants by latitude and longitude BETWEEN ranges',
          caption:
            'Naive lat/lon range filter. Works for demos; struggles at scale with ordinary B-tree indexes. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            'B-trees excel at **one-dimensional** ranges. The planner may use an index on latitude, then filter longitude (or the reverse). A composite `(latitude, longitude)` index helps but still does not encode true spatial locality. GeoHashing’s job is to represent 2D proximity as a searchable 1D prefix.',
        },
      ],
    },
    {
      id: 'what-is-geohash',
      title: 'What is a GeoHash?',
      blocks: [
        {
          type: 'markdown',
          value:
            'Downtown San Francisco `(37.7749, -122.4194)` encodes roughly as `9q8yyk` (precision depends on length). Examples of prefix locality:\n\n- `9q8yyf` and `9q9pvu` share `9q` / `9q8…` vs `9q9…` → same broad region, not necessarily adjacent cells.\n- `9q8yyf` and `9q5ctr` share only `9q` → farther apart.\n- `a2sed7` → completely different prefix → distant region.\n\nEach extra character **zooms in** on a smaller rectangular cell — hierarchical like a quadtree linearized onto a Z-order (Morton) curve.',
        },
        {
          type: 'image',
          src: 'assets/article-images/geohashing/02-spatial-locality-prefixes.png',
          alt: 'Map overlaid with a GeoHash grid of cells labeled with Base32 characters showing hierarchical spatial partitioning',
          caption:
            'GeoHash cells tile the map; nearby cells share longer prefixes. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'how-it-works',
      title: 'How GeoHashing works',
      blocks: [
        {
          type: 'markdown',
          value:
            '### Step 1 — Global bounds\n\n- Latitude: `[-90°, +90°]`\n- Longitude: `[-180°, +180°]`\n\n### Step 2 — Recursive bisection → binary\n\nRepeatedly split each range at the midpoint:\n\n- Value in the **lower** half → append bit `0`\n- Value in the **upper** half → append bit `1`\n\nLike binary search, but you **record every decision** as a bit.\n\n### Step 3 — Interleave longitude and latitude bits\n\nBits alternate: **lon, lat, lon, lat, …** (first bit is longitude). The interleaved bit string follows a **Morton / Z-order** curve that preserves much of the 2D locality in 1D order.\n\n**Example** for `(37.7749° N, -122.4194° W)` — first steps:\n\nLongitude bits (first 5): `00101`  \nLatitude bits (first 5): `10110`  \nInterleaved: `0 1 0 0 1 1 1 0 1 0` → `0100111010`\n\nContinue until you have enough bits (e.g. 30 bits → 6-character hash, 35 bits → 7 characters).\n\n### Step 4 — Base32 encode\n\nSplit the bit string into **5-bit** chunks. Map each chunk to the GeoHash alphabet:\n\n```\n0123456789bcdefghjkmnpqrstuvwxyz\n```\n\nLetters `a`, `i`, `l`, and `o` are omitted to avoid confusion with digits. Example chunking `01001 11010 10011 00101` → `9ur5`.',
        },
        {
          type: 'image',
          src: 'assets/article-images/geohashing/03-precision-vs-length.png',
          alt: 'Table relating GeoHash string length to approximate cell size and precision',
          caption:
            'Precision vs length: each extra character shrinks the cell. Choose length from your radius (e.g. ~7 chars for ~150 m). Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Why databases like this',
          body: "A geohash string indexes like any other string. Prefix queries (`WHERE geohash LIKE '9q8yy%'`) become efficient B-tree range scans. You can also **shard** by prefix so nearby data lands on the same partition.",
        },
      ],
    },
    {
      id: 'applications',
      title: 'Why use it and where it shines',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Benefits:** efficient proximity search via prefixes; hierarchical zoom for map UIs; horizontal sharding by region; works with any DB that indexes strings (PostgreSQL, MySQL, MongoDB, Cassandra, Elasticsearch `geohash_grid`).\n\n**Ridesharing (Uber/Lyft).** Bucket drivers and riders into GeoHash cells (6–7 chars). Match within the same cell and neighbors instead of scanning all active drivers.\n\n**Food delivery (Swiggy/Zomato).** Convert the user coordinate to a geohash; query restaurants whose stored hashes match that prefix or neighbors.\n\n**Geospatial stores.** Elasticsearch aggregations and MongoDB 2D indexes often use geohash-style bucketing under the hood.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Related on this site',
          body: 'Deeper product designs: [Uber geospatial indexing](/designs/uber#geospatial-indexing) (Geohash vs S2 vs H3) and [Zomato geospatial indexing](/designs/zomato#geospatial-indexing).',
        },
      ],
    },
    {
      id: 'system-design',
      title: 'System design: nearby restaurants',
      blocks: [
        {
          type: 'markdown',
          value:
            '### 1. Index the data\n\nAdd a `geohash` column. On create/update of a restaurant location, compute a fixed-precision hash (e.g. 7 characters) and store it. Index the column with a B-tree for lexicographic prefix scans.',
        },
        {
          type: 'image',
          src: 'assets/article-images/geohashing/04-restaurants-schema.png',
          alt: 'Restaurants table schema including id, name, latitude, longitude, and geohash columns',
          caption:
            'Schema with a denormalized geohash column ready for prefix search. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            "### 2. Naive query (has a blind spot)\n\nUser at geohash `dr5ruj6`:\n\n```sql\nSELECT * FROM restaurants WHERE geohash LIKE 'dr5ruj6%';\n```\n\nThis misses restaurants just across a cell boundary — even 20 meters away.",
        },
        {
          type: 'image',
          src: 'assets/article-images/geohashing/05-edge-case-neighbor-miss.png',
          alt: 'Illustration of a user on a GeoHash cell edge missing a nearby restaurant in the neighboring cell',
          caption:
            'Edge-case problem: the closest point can sit in a neighboring cell. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 3. Query the center cell + 8 neighbors\n\n1. Capture user lat/lon.\n2. Compute base geohash at chosen precision.\n3. Compute the **8 surrounding** geohashes (library helper).\n4. Query all **9** prefixes.\n5. **Post-filter** with Haversine (or Vincenty) distance; drop candidates outside the radius; sort by distance.\n\nHaversine runs on hundreds of candidates, not millions — that is the win.',
        },
        {
          type: 'image',
          src: 'assets/article-images/geohashing/06-nine-cell-neighbor-query.png',
          alt: 'SQL querying nine GeoHash prefixes with LIKE OR for center cell and eight neighbors',
          caption:
            'Nine-cell prefix query covering the user’s cell and its neighbors. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'nearby_restaurants.sql',
          showLineNumbers: true,
          code: `-- Candidate pull (then filter/sort by exact distance in app or SQL)
SELECT id, name, latitude, longitude, geohash
FROM restaurants
WHERE geohash LIKE 'dr5ruj6%'
   OR geohash LIKE 'dr5ruj7%'
   OR geohash LIKE 'dr5ruj3%'
   OR geohash LIKE 'dr5ruj2%'
   OR geohash LIKE 'dr5ruj4%'
   OR geohash LIKE 'dr5ruj5%'
   OR geohash LIKE 'dr5ruj0%'
   OR geohash LIKE 'dr5ruj1%'
   OR geohash LIKE 'dr5ruj8%';`,
        },
      ],
    },
    {
      id: 'tradeoffs',
      title: 'Limitations, trade-offs, and alternatives',
      blocks: [
        {
          type: 'prosCons',
          title: 'GeoHashing trade-offs',
          pros: [
            'Maps 2D proximity to fast 1D prefix search',
            'Hierarchical zoom by shortening/lengthening the string',
            'Easy horizontal sharding by prefix',
            'Database-agnostic — any string index works',
          ],
          cons: [
            'Must query neighbor cells to avoid edge misses',
            'Rectangular cells distort away from the equator',
            'Same-cell points can be farther apart than cross-boundary neighbors',
            'Not true k-NN alone — need exact distance post-filter',
            'Hot city prefixes can create hot partitions',
          ],
        },
        {
          type: 'markdown',
          value:
            '**Alternatives**\n\n- **Quadtrees / k-d trees** — recursive spatial partitions; GeoHash is roughly a linearized quadtree along a Z-order curve.\n- **R-trees** — minimum bounding rectangles; common in PostGIS, Oracle Spatial, SpatiaLite; stronger for true containment / k-NN.\n- **S2 / H3** — spherical cells (Google / Uber) with more uniform area and better neighbor semantics; preferred in many modern rideshare designs.\n\nChoose GeoHash when you want simplicity and portable string indexes; choose S2/H3/R-tree when cell uniformity and k-NN quality matter more.',
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'markdown',
          value:
            'GeoHashing bisects the globe, interleaves lon/lat bits, and Base32-encodes them into hierarchical strings. Store and index those strings, query **9 cells** for nearby search, then refine with exact distance. Remember edge cases, distortion, and hot prefixes — and escalate to S2/H3/R-trees when the abstraction’s limits show up in production.',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Summarized and expanded from Ashish Pratap Singh’s AlgoMaster article “What is GeoHashing?” with diagrams adapted for this platform.',
        },
      ],
    },
  ],
};

export default content;
