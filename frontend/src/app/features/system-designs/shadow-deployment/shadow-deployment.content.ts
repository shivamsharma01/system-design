import { DesignContent } from '../../../shared/models';
import { SHADOW_DEPLOYMENT_META } from './shadow-deployment.meta';

const content: DesignContent = {
  meta: SHADOW_DEPLOYMENT_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Shadow Deployment** pattern **mirrors production traffic** to a new model version while the **champion model still serves users**. The shadow model runs predictions in parallel — results are logged and compared — but its outputs **never affect the user experience**. It is the safest way to validate a new fraud detector or ranking model on real data before any traffic shift.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: '**Observe, do not act.** Duplicate requests (or async fan-out) to model B; compare latency, errors, and prediction deltas vs model A. Zero business risk if shadow crashes.',
        },
        {
          type: 'table',
          caption: 'Shadow vs canary vs A/B.',
          headers: ['Pattern', 'User impact', 'Uses shadow output?'],
          rows: [
            ['Shadow', 'None — champion decides', 'No — logging only'],
            ['Canary', 'Small % see new model', 'Yes — for that %'],
            ['A/B test', 'Split sees different models', 'Yes — measure KPIs per arm'],
          ],
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
          body: 'A **fraud team trainee** listens on every live call and writes down what they *would* decide — but the senior agent still handles the customer. After a week, managers compare disagreement rates before letting the trainee take real calls.',
        },
        {
          type: 'mermaid',
          caption: 'Production path unchanged; shadow path runs in parallel.',
          definition: `sequenceDiagram
  participant API as Payment API
  participant CH as Champion fraud v4
  participant SH as Shadow fraud v5
  participant LOG as Comparison log
  API->>CH: predict(features)
  CH-->>API: BLOCK / ALLOW (used)
  par async shadow
    API->>SH: predict(same features)
    SH-->>LOG: score_v5
    CH-->>LOG: score_v4
  end
  Note over API: User sees only v4 decision`,
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
            ['Fraud', 'New gradient-boosted model shadowed on all payments for 2 weeks'],
            ['Search ranking', 'Shadow LTR model scores same query-doc pairs — NDCG offline proxy'],
            ['Recommendations', 'Compare shadow rec model rankings vs production without changing feed'],
            ['Ads CTR', 'Shadow bid model logs predicted CTR vs live model'],
            ['Safety / moderation', 'New classifier shadowed on uploads — measure false negative delta'],
            ['Autonomous systems', 'Shadow planner logs alternative trajectories (simulation-heavy domains)'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Fan out shadow calls **asynchronously** with a **strict timeout** — shadow latency must not block the champion path. Log `(request_id, champion_score, shadow_score, latency_ms)`. Dashboard: disagreement rate, score distribution KS test, and shadow error rate.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ShadowInferenceMiddleware.java',
          code: `@Component
public class ShadowInferenceMiddleware {
  private final ModelClient champion;  // fraud_v4
  private final ModelClient shadow;      // fraud_v5
  private final ExecutorService shadowPool = Executors.newFixedThreadPool(32);
  private final ComparisonLogger logger;

  public FraudDecision score(FraudRequest req) {
    FeatureVector fv = req.features();
    FraudDecision decision = champion.predict(fv);  // user-facing

    shadowPool.submit(() -> {
      try {
        FraudDecision shadowDec = shadow.predictWithTimeout(fv, Duration.ofMillis(50));
        logger.log(new Comparison(
            req.id(), decision.score(), shadowDec.score(),
            decision.label(), shadowDec.label()
        ));
      } catch (Exception e) {
        logger.logShadowError(req.id(), e);
      }
    });
    return decision;
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Anti-pattern',
          body: 'Shadow model on the **critical path** (synchronous, no timeout). Shadow OOM takes down checkout. Always **fire-and-forget** with backpressure and drop shadow under load.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Validates new models on **100% real traffic** with zero user risk.',
            'Surfaces latency, stability, and prediction drift before canary.',
            'Works when labeled outcomes are delayed (fraud chargebacks).',
          ],
          cons: [
            '**2× inference cost** for shadowed requests (compute + logging).',
            'Does not measure business KPI impact — only prediction comparison.',
            'PII duplication in logs requires careful governance.',
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
              question: 'Shadow deployment vs canary?',
              answer:
                '**Shadow**: new model runs but output is **discarded** — zero user impact. **Canary**: small traffic **uses** new model output — measures real KPIs with limited blast radius.',
            },
            {
              question: 'How long should shadow run?',
              answer:
                'Until enough volume for stable comparison — often **days to weeks** for fraud (rare positives). Monitor disagreement rate convergence and shadow stability.',
            },
            {
              question: 'What if shadow and champion disagree a lot?',
              answer:
                'Investigate **feature parity**, label drift, or genuine model improvement. High disagreement alone is not bad — validate against delayed labels before promoting.',
            },
            {
              question: 'How to implement without doubling user latency?',
              answer:
                '**Async fan-out** after champion returns, bounded thread pool, short shadow timeout, sample traffic (e.g. 100% log, 10% shadow) under cost pressure.',
            },
            {
              question: 'Can shadow replace offline eval?',
              answer:
                'Complements it — offline lacks full production feature path. Shadow catches **serve-time** bugs; offline still needed for rapid iteration.',
            },
            {
              question: 'Shadow for batch models?',
              answer:
                'Run parallel batch job writing to shadow table; compare row-level scores before switching API cache source — same idea, different infra.',
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
          body: '1. Shadow = **mirror traffic**, log comparisons, **no user impact**.\n2. Ideal for **fraud and ranking** before canary/A/B.\n3. Async + timeouts — never block the champion path.\n4. Pair with **champion-challenger metrics** to decide promotion.',
        },
      ],
    },
  ],
};

export default content;
