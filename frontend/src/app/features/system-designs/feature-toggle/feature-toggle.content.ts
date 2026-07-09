import { DesignContent } from '../../../shared/models';
import { FEATURE_TOGGLE_META } from './feature-toggle.meta';

const content: DesignContent = {
  meta: FEATURE_TOGGLE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **Feature Toggle** (feature flag) lets you enable or disable behavior **at runtime** without redeploying. Flags support dark launches, kill switches, A/B tests, and trunk-based development where incomplete features stay off in production.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Types of flags',
          body: '**Release** toggles (ship dark, turn on later), **ops** kill switches, **experiment** flags (A/B), and **permission** flags (per tenant/plan). Treat each type’s lifetime differently.',
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
          body: 'A building’s **circuit breakers / light switches**: the wiring is already installed, but you choose which rooms are powered. You do not rebuild the wall to turn off a chandelier during a storm.',
        },
        {
          type: 'mermaid',
          caption: 'Runtime decision before feature code runs.',
          definition: `flowchart TD
  R[Request] --> F{Flag checkout_v2?}
  F -->|on| N[New checkout]
  F -->|off| O[Legacy checkout]`,
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
            ['Product delivery', 'LaunchDarkly, Unleash, Flagsmith, ConfigCat'],
            ['Incident response', 'Kill switch for a costly recommendation path'],
            ['Experiments', 'A/B test pricing UI for 10% of users'],
            ['Migrations', 'Dual-write then read-new behind a flag'],
            ['Mobile / web', 'Remote config to disable a buggy screen'],
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
          filename: 'CheckoutFlags.java',
          code: `public interface FeatureFlags {
  boolean isEnabled(String key, FlagContext ctx);
}

public class CheckoutService {
  private final FeatureFlags flags;
  private final CheckoutV1 v1;
  private final CheckoutV2 v2;

  public CheckoutService(FeatureFlags flags, CheckoutV1 v1, CheckoutV2 v2) {
    this.flags = flags;
    this.v1 = v1;
    this.v2 = v2;
  }

  public Order place(PlaceOrderCommand cmd, User user) {
    FlagContext ctx = FlagContext.of(user.id(), user.country());
    if (flags.isEnabled("checkout_v2", ctx)) {
      return v2.place(cmd);
    }
    return v1.place(cmd);
  }
}`,
        },
        {
          type: 'bestPractices',
          practices: [
            'Name flags clearly; **remove release toggles** after full rollout.',
            'Default safely (usually **off** for new risky paths).',
            'Log flag decisions for debugging “works on my cohort.”',
            'Avoid flag spaghetti — limit nesting and long-lived flags.',
          ],
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Decouple deploy from release.',
            'Instant kill switch during incidents.',
            'Enables progressive exposure and experiments.',
          ],
          cons: [
            'Flag debt and combinatorial testing complexity.',
            'Misconfigured flags can cause outages.',
            'Needs a reliable flag service/cache (flags must not be a SPOF).',
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
              question: 'What is a feature toggle?',
              answer:
                'A runtime switch that controls whether a code path is active, without requiring a new deployment to change that decision.',
            },
            {
              question: 'Feature flag vs canary deployment?',
              answer:
                'Canary shifts **traffic to a new binary/version**. Flags switch **behavior inside** a version (often by user). They complement each other.',
            },
            {
              question: 'What is a dark launch?',
              answer:
                'Deploying code behind a flag that is **off** for users (or on only for internal traffic) so you can validate in production safely before opening it up.',
            },
            {
              question: 'How do flags help trunk-based development?',
              answer:
                'Incomplete features can merge to main behind flags, reducing long-lived branches while keeping production behavior stable.',
            },
            {
              question: 'Operational risk of flags?',
              answer:
                'Stale flags, unclear ownership, and depending on the flag service for every request. Cache flags locally with short TTL and fail closed/open by policy.',
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
          body: '1. Flags separate **deploy** from **release**.\n2. Use for kill switches, dark launches, experiments.\n3. Real uses: **LaunchDarkly-style platforms, remote config**.\n4. Clean up flags; avoid permanent toggle debt.',
        },
      ],
    },
  ],
};

export default content;
