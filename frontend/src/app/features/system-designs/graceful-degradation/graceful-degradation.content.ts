import { DesignContent } from '../../../shared/models';
import { GRACEFUL_DEGRADATION_META } from './graceful-degradation.meta';

const content: DesignContent = {
  meta: GRACEFUL_DEGRADATION_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Graceful Degradation** keeps the **core user journey** working when non-critical dependencies fail or when the system is overloaded. You shed optional features, serve stale cache, or switch to simpler modes instead of returning a hard outage.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Cross-refs',
          body: 'Often combined with **timeouts**, **circuit breakers**, **bulkheads**, and **feature toggles** (kill switches) to decide what to disable under stress.',
        },
      ],
    },
    {
      id: 'concept',
      title: 'Concept and analogy',
      blocks: [
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'An elevator with a broken music speaker still moves between floors. A mall with a broken fountain still lets you shop. Degrade the nice-to-haves; protect the mission.',
        },
        {
          type: 'mermaid',
          caption: 'Core path vs optional path.',
          definition: `flowchart TD
  R[Product page] --> Core[Price + Add to cart]
  R --> Rec[Recommendations service]
  Rec -->|down| Cache[Show cached / hide rail]
  Core --> OK[Page still usable]`,
        },
      ],
    },
    {
      id: 'where-used',
      title: 'Where it is used',
      blocks: [
        {
          type: 'table',
          headers: ['Domain', 'Example'],
          rows: [
            ['E-commerce', 'Hide recommendations; keep search + checkout'],
            ['Streaming', 'Lower bitrate / disable previews when CDN strained'],
            ['Social feeds', 'Serve chronological fallback if ranking ML is down'],
            ['Maps / ride-hail', 'Coarser ETAs if traffic API fails'],
            ['SaaS dashboards', 'Cached metrics with “stale” banner'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'ProductPageAssembler.java',
          code: `public class ProductPageAssembler {
  private final CatalogPort catalog;
  private final RecommendationsPort recs;
  private final Cache<String, List<ProductSummary>> recCache;

  public ProductPage load(String productId) {
    Product product = catalog.getRequired(productId); // core — must succeed

    List<ProductSummary> recommendations;
    try {
      recommendations = recs.forProduct(productId, Duration.ofMillis(150));
      recCache.put(productId, recommendations);
    } catch (Exception ex) {
      // degrade: stale cache or empty rail — page still works
      recommendations = recCache.getOrDefault(productId, List.of());
    }

    return new ProductPage(product, recommendations);
  }
}`,
        },
        {
          type: 'bestPractices',
          practices: [
            'Define **critical vs optional** dependencies explicitly in design docs.',
            'Show honest UX (“recommendations unavailable”) when degrading.',
            'Prefer **stale-while-error** caches with TTLs over blank failures.',
            'Use feature flags to shed load (disable heavy features) during incidents.',
          ],
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Higher perceived availability during partial outages.',
            'Protects revenue-critical paths.',
            'Buys time for operators to recover dependencies.',
          ],
          cons: [
            'More branching and fallback code to maintain.',
            'Stale data can confuse users if not labeled.',
            'Must avoid degrading so far that correctness breaks (e.g. wrong prices).',
          ],
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
              question: 'What is graceful degradation?',
              answer:
                'Continuing to serve a **reduced but useful** experience when parts of the system fail, instead of failing the entire request or product.',
            },
            {
              question: 'Graceful degradation vs fail fast?',
              answer:
                'Fail fast aborts a hopeless operation quickly. Graceful degradation **substitutes a fallback** so the overall user goal can still succeed.',
            },
            {
              question: 'Give a system design example.',
              answer:
                'Netflix-style: if personalization is down, show a popular/trending row. Checkout must still work; recommendations are optional.',
            },
            {
              question: 'How do you decide what to degrade?',
              answer:
                'Rank features by **business criticality** and blast radius. Never degrade authoritative money/inventory correctness without a safe mode.',
            },
            {
              question: 'What patterns support degradation?',
              answer:
                'Timeouts, circuit breakers with fallbacks, caches, bulkheads, and feature toggles as kill switches.',
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
          body: '1. Protect the **core journey**; shed optional features.\n2. Use **fallbacks and stale cache** deliberately.\n3. Real uses: **feeds, recs, media quality, dashboards**.\n4. Combine with circuit breakers and feature flags.',
        },
      ],
    },
  ],
};

export default content;
