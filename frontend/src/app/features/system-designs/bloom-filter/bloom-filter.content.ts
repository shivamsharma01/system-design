import { DesignContent } from '../../../shared/models';
import { BLOOM_FILTER_META } from './bloom-filter.meta';

const content: DesignContent = {
  meta: BLOOM_FILTER_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **Bloom filter** is a **probabilistic** data structure for fast set-membership checks with a tiny memory footprint. Ask “have we seen this key before?” without storing every key. The answer is either **definitely not in the set** or **probably in the set** — never “definitely yes” with mathematical certainty.\n\nThat trade-off powers Netflix-style “already watched,” Amazon purchase filters, web crawlers, database SSTables, and cache-penetration protection when exact sets would consume too much RAM.',
        },
        {
          type: 'image',
          src: 'assets/article-images/bloom-filter/01-intro-use-cases.png',
          alt: 'Bloom filter diagram: two keys hashed into overlapping positions of a bit array of ones and zeros',
          caption:
            'Multiple keys map through hash functions into a shared bit array. Overlapping 1-bits are normal and are why false positives can occur. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The one-line interview answer',
          body: '**Bloom filter = bit array + k hash functions.** Insert sets bits; query returns **no** if any bit is 0, and **maybe** if all bits are 1. False positives yes; false negatives no (for a standard filter that only inserts).',
        },
      ],
    },
    {
      id: 'how-it-works',
      title: 'How a Bloom filter works',
      blocks: [
        {
          type: 'markdown',
          value:
            '### Key components\n\n1. **Bit array** of fixed size `m`, initialized to all zeros.\n2. **`k` independent hash functions**, each mapping an element to an index in `[0, m)`.\n\n### Lifecycle\n\n**Initialization.** Allocate `m` bits; all are 0.\n\n**Insert.** Hash the element with each of the `k` functions → `k` indices → set those bits to 1. Never unset a bit on insert.\n\n**Query (`mightContain`).** Recompute the same `k` indices.\n\n- If **any** bit is `0` → the element was **never inserted** (definite absence).\n- If **all** bits are `1` → the element is **probably** in the set (may be a false positive from other inserts colliding on those bits).',
        },
        {
          type: 'image',
          src: 'assets/article-images/bloom-filter/02-how-bloom-filter-works.png',
          alt: 'Data element hashed by Hash 1, Hash 2, and Hash 3 into three positions of a bit array set to 1',
          caption:
            'One insert: three hash functions set three bits. Later queries recompute the same indices. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Why no false negatives?',
          body: 'Once bits are set for an inserted element, a standard Bloom filter never clears them. Any later query for that element still sees all of its bits as 1 (unless you use a deletion-capable variant incorrectly). Collisions can only invent phantom membership — they cannot erase a real insert’s bits.',
        },
      ],
    },
    {
      id: 'url-walkthrough',
      title: 'Walkthrough: URL crawler',
      blocks: [
        {
          type: 'markdown',
          value:
            'Imagine a crawler that must remember visited URLs. Storing every URL string is expensive. A Bloom filter of size 10 with two hash functions is enough to illustrate the idea.',
        },
        {
          type: 'image',
          src: 'assets/article-images/bloom-filter/03-empty-bit-array.png',
          alt: 'Empty Bloom filter bit array of ten zeros',
          caption:
            'Step 1 — empty filter: bit array of size 10, all zeros. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/bloom-filter/04-insert-example-com.png',
          alt: 'Inserting example.com sets bits at indices 3 and 7',
          caption:
            'Step 2 — insert `example.com`: hash functions map to indices 3 and 7; those bits become 1. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/bloom-filter/05-insert-algomaster-io.png',
          alt: 'Inserting algomaster.io sets bits at indices 1 and 4',
          caption:
            'Step 3 — insert `algomaster.io`: indices 1 and 4 set to 1. The array now has four 1-bits. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/bloom-filter/06-check-example-com.png',
          alt: 'Checking example.com finds bits 3 and 7 both set, so probably present',
          caption:
            'Step 4 — check `example.com`: bits 3 and 7 are both 1 → **probably present**. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/bloom-filter/07-check-nonexistent.png',
          alt: 'Checking nonexistent.com finds bits 2 and 5 still zero, so definitely absent',
          caption:
            'Step 5 — check `nonexistent.com`: hashes land on 2 and 5, both still 0 → **definitely not in the set**. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Java implementation',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/bloom-filter/08-java-implementation.png',
          alt: 'Java BloomFilter class using BitSet, add, and mightContain with multiple hash functions',
          caption:
            'Reference Java sketch using `BitSet` and injectable hash functions. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'BloomFilter.java',
          showLineNumbers: true,
          code: `import java.util.BitSet;
import java.util.function.Function;

public class BloomFilter {
  private final BitSet bitArray;
  private final int size;
  private final Function<String, Integer>[] hashFunctions;

  @SafeVarargs
  public BloomFilter(int size, Function<String, Integer>... hashFunctions) {
    this.size = size;
    this.bitArray = new BitSet(size);
    this.hashFunctions = hashFunctions;
  }

  public void add(String item) {
    for (Function<String, Integer> hash : hashFunctions) {
      int index = Math.floorMod(hash.apply(item), size);
      bitArray.set(index);
    }
  }

  /** true = probably present; false = definitely absent */
  public boolean mightContain(String item) {
    for (Function<String, Integer> hash : hashFunctions) {
      int index = Math.floorMod(hash.apply(item), size);
      if (!bitArray.get(index)) {
        return false; // definitely not in the set
      }
    }
    return true; // probably in the set (possible false positive)
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Production hash quality',
          body: 'Toy hashes are fine for demos. Production filters use well-distributed hashes (Murmur3, xxHash, or Guava/BloomFilter). Prefer `Math.floorMod` over `Math.abs(x % size)` so negative hash codes cannot produce a wrong index. Size `m` and hash count `k` from expected `n` and target false-positive rate `p`.',
        },
        {
          type: 'markdown',
          value:
            '### Sizing rules of thumb\n\nApproximate optimal parameters for expected `n` inserts and false-positive rate `p`:\n\n- Bit array size: `m ≈ -n · ln(p) / (ln 2)²`\n- Hash functions: `k ≈ (m / n) · ln 2` (often ~7–10 in practice)\n\nToo small `m` or too many inserts → bits saturate → almost every query returns “maybe.” Track fill ratio and rebuild/rotate filters when load grows.',
        },
      ],
    },
    {
      id: 'applications',
      title: 'Real-world applications',
      blocks: [
        {
          type: 'table',
          caption: 'Where Bloom filters pay for themselves.',
          headers: ['Domain', 'Problem', 'How the filter helps'],
          rows: [
            [
              'Web caching',
              'Cache lookup for every URL is costly as the cache grows',
              'Check filter first; skip cache on definite miss and go to origin',
            ],
            [
              'Spam filtering',
              'Huge spam-address databases',
              'Store hashes of known spam senders; quick “maybe spam” gate',
            ],
            [
              'Databases (Cassandra, HBase, RocksDB)',
              'Disk seeks for keys that do not exist',
              'SSTable/Bloom filters skip files that definitely lack the key',
            ],
            [
              'Recommendations',
              'Avoid recommending already-consumed content',
              'Per-user filter of watched/interacted IDs before ranking',
            ],
            [
              'Social graphs',
              'Do not recommend existing friends',
              'Filter of current connections before suggestion scoring',
            ],
            [
              'URL shorteners / caches',
              'Cache penetration on random missing keys',
              'Reject definite non-keys before hitting Redis/DB',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Related on this site',
          body: 'See [Distributed Cache](/designs/distributed-cache) for cache penetration vs stampede, and [URL Shortener](/designs/url-shortener) for Bloom filters on the redirect path.',
        },
      ],
    },
    {
      id: 'limitations',
      title: 'Limitations and variants',
      blocks: [
        {
          type: 'markdown',
          value:
            '**1. False positives.** Colliding bit patterns can claim presence for a never-inserted key. That may trigger an unnecessary cache/DB lookup. You can shrink `p` with larger `m` / better `k`, but never eliminate it.\n\n**2. No deletions in a standard filter.** Clearing a bit may erase evidence another element still needs. **Counting Bloom Filters** replace bits with small counters (increment on insert, decrement on delete) at higher memory cost.\n\n**3. Membership only.** The filter does not store the element, support iteration, or answer rich queries. Pair it with the authoritative store.\n\n**4. Not for exact membership.** If you need a definite yes, use a hash set, Cuckoo filter with care, or the database itself.\n\n**5. Hash collisions and saturation.** As load factor rises, more bits stay 1 and usefulness collapses. Plan capacity for peak `n`, or use scalable / rotating filters.',
        },
        {
          type: 'prosCons',
          title: 'When to use a Bloom filter',
          pros: [
            'Tiny memory vs storing full keys',
            'O(k) time inserts and lookups',
            'Never false-negatives on a correctly used standard filter',
            'Excellent as a cheap pre-check before expensive I/O',
          ],
          cons: [
            'False positives require a fallback path',
            'Standard filters cannot delete',
            'Must size for expected cardinality',
            'Cannot list members or recover original keys',
          ],
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
            'Bloom filters trade a small, configurable false-positive rate for dramatic space savings on “have we seen this?” checks. Use them when **definite absence** is valuable, **occasional maybe-yes** is cheap to verify elsewhere, and memory is the scarce resource. Size `m` and `k` from `n` and target `p`, monitor saturation, and keep an authoritative store behind the filter.',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Summarized and expanded from Ashish Pratap Singh’s AlgoMaster article “What are Bloom Filters and Where are they Used?” with diagrams adapted for this platform.',
        },
      ],
    },
  ],
};

export default content;
