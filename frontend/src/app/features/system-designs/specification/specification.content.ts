import { DesignContent } from '../../../shared/models';
import { SPECIFICATION_META } from './specification.meta';

const content: DesignContent = {
  meta: SPECIFICATION_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Specification** encapsulates a business rule as an object with `isSatisfiedBy(candidate)`. Specifications compose with **and / or / not**, stay independently testable, and keep filtering/validation logic out of fat services.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'DDD favorite',
          body: 'Eric Evans popularized specifications for expressing domain rules in ubiquitous language — e.g. `PremiumCustomerSpec`, `InStockSpec`.',
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
          body: 'A **job posting checklist**: “5+ years AND Java OR Kotlin AND willing to relocate.” Each clause is a rule; HR combines them. Candidates either satisfy the composite spec or not.',
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
            ['Catalog search', 'Filter products by price, brand, rating specs'],
            ['Validation', 'Order can be placed only if specs pass'],
            ['Pricing eligibility', 'Promo applies if customer + cart specs match'],
            ['Repositories', 'Find entities matching a specification'],
            ['Access control', 'Composable permission predicates'],
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
          filename: 'ProductSpecs.java',
          code: `public interface Specification<T> {
  boolean isSatisfiedBy(T candidate);

  default Specification<T> and(Specification<T> other) {
    return c -> this.isSatisfiedBy(c) && other.isSatisfiedBy(c);
  }

  default Specification<T> or(Specification<T> other) {
    return c -> this.isSatisfiedBy(c) || other.isSatisfiedBy(c);
  }

  default Specification<T> not() {
    return c -> !this.isSatisfiedBy(c);
  }
}

public class MinRatingSpec implements Specification<Product> {
  private final double min;
  public MinRatingSpec(double min) { this.min = min; }
  public boolean isSatisfiedBy(Product p) { return p.rating() >= min; }
}

public class MaxPriceSpec implements Specification<Product> {
  private final Money max;
  public MaxPriceSpec(Money max) { this.max = max; }
  public boolean isSatisfiedBy(Product p) { return p.price().cents() <= max.cents(); }
}

// "rating >= 4 AND price <= 2000"
Specification<Product> deal =
    new MinRatingSpec(4.0).and(new MaxPriceSpec(Money.of("INR", 2000_00)));

List<Product> results = catalog.stream()
    .filter(deal::isSatisfiedBy)
    .toList();`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Rules are named, reusable, and unit-testable.',
            'Composition expresses complex policies clearly.',
            'Keeps services thin; speaks domain language.',
          ],
          cons: [
            'Mapping specs to efficient SQL can be non-trivial.',
            'Too many tiny specs without names becomes noise.',
            'Need care to keep specs pure (no hidden I/O).',
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
              question: 'What is the Specification pattern?',
              answer:
                'A predicate object that evaluates whether a candidate **satisfies a business rule**, often composable with and/or/not.',
            },
            {
              question: 'Specification vs Strategy?',
              answer:
                'Strategy encapsulates an **algorithm** that produces a result. Specification encapsulates a **boolean business rule**. They can combine (strategy selects pricing; spec decides eligibility).',
            },
            {
              question: 'How do repositories use specifications?',
              answer:
                '`repo.findAll(spec)` — the repository translates the spec to a query, or filters in memory for small sets. In JPA, specs often become Criteria predicates.',
            },
            {
              question: 'Why not just lambdas?',
              answer:
                'Lambdas work, but named specification types document ubiquitous language, compose explicitly, and can carry metadata (e.g. failure reasons).',
            },
            {
              question: 'LLD example?',
              answer:
                'Loan eligibility: credit score spec AND income spec AND not blacklisted; or e-commerce “free shipping if cart total and region specs pass.”',
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
          body: '1. Business rules as **composable predicates**.\n2. Real uses: **filters, validation, eligibility, queries**.\n3. Strong fit with DDD language.\n4. Keep specs pure and testable.',
        },
      ],
    },
  ],
};

export default content;
