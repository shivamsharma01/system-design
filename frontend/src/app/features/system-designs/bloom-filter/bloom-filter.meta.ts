import { DesignMeta } from '../../../shared/models';

export const BLOOM_FILTER_META: DesignMeta = {
  slug: 'bloom-filter',
  title: 'Bloom Filters',
  tagline:
    'Space-efficient probabilistic set membership — definitely absent or probably present, with false positives but no false negatives.',
  section: 'fundamentals',
  category: 'Data Structures',
  tags: ['bloom-filter', 'probabilistic', 'set-membership', 'caching', 'databases', 'interview'],
  technologies: ['Java BitSet', 'Cassandra', 'HBase', 'Redis', 'Guava'],
  difficulty: 'intermediate',
  readingTimeMin: 14,
  status: 'published',
  keywords: [
    'Bloom filter',
    'false positive',
    'bit array',
    'hash functions',
    'Counting Bloom Filter',
    'cache penetration',
    'mightContain',
  ],
  dateAdded: '2026-07-25',
  popularity: 92,
  icon: 'BF',
  heroGradient: 'linear-gradient(135deg, #8b5cf6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
