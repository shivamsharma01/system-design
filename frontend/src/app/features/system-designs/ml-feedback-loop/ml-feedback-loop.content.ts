import { DesignContent } from '../../../shared/models';
import { ML_FEEDBACK_LOOP_META } from './ml-feedback-loop.meta';

const content: DesignContent = {
  meta: ML_FEEDBACK_LOOP_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Feedback Loop (Closed-Loop ML)** pattern captures **production outcomes** — clicks, purchases, chargebacks, human labels — and feeds them back into **labeling, retraining, and deployment**. Systems like recommendations, search ranking, and fraud detection improve continuously, but loops must guard against **feedback bias**, **delayed labels**, and **popularity spirals**.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: 'Log every **prediction + context**, collect **outcome signals**, convert to training labels on a schedule, retrain, evaluate, and promote via the model registry — the model learns from how it actually performed in the wild.',
        },
        {
          type: 'table',
          caption: 'Feedback signal types.',
          headers: ['Signal', 'Type', 'Example'],
          rows: [
            ['Click / watch', 'Implicit positive', 'User clicked recommended thumbnail'],
            ['Skip / hide', 'Implicit negative', 'User dismissed search result'],
            ['Purchase', 'Strong positive', 'Checkout completed after fraud allow'],
            ['Chargeback', 'Delayed negative label', 'Fraud model false negative'],
            ['Human review', 'Explicit label', 'Analyst marks transaction fraudulent'],
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
          body: 'A **search engine learning from queries**: every search is a question, every click is a student raising their hand ("this answer helped"). The system **regrades its textbook** nightly from click logs. But if it only promotes pages people already click, it never surfaces new gems — the **rich get richer** (feedback bias). Smart loops add **exploration** and **editorial labels** so learning stays honest.',
        },
        {
          type: 'mermaid',
          caption: 'Predict → log → label → retrain → deploy closes the loop.',
          definition: `flowchart LR
  User[User interaction] --> Serve[Model serves prediction]
  Serve --> Log[Prediction + context log]
  User --> Outcome[Outcome: click / fraud label / purchase]
  Outcome --> Label[Labeling pipeline]
  Log --> Label
  Label --> Store[(Training dataset)]
  Store --> Retrain[Retrain job]
  Retrain --> Registry[Model registry]
  Registry --> Serve`,
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
            ['Recommendations', 'Implicit feedback from watches; retrain ranking weekly'],
            ['Search', 'Click-through labels for LTR; human raters for head queries'],
            ['Fraud', 'Chargebacks arrive 30–90 days later as hard negatives'],
            ['Ads CTR', 'Real-time click feedback with exploration (multi-armed bandit)'],
            ['Content moderation', 'User reports + reviewer labels → classifier refresh'],
            ['Spotify Discover', 'Skip vs full-listen signals shape playlist models'],
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
            'Join **prediction logs** with **outcome events** by request ID. Handle **delayed labels** (chargebacks) with sliding training windows. Inject **exploration** (epsilon-greedy, interleaving) to combat position bias. Monitor **label class balance** and **feedback bias metrics** before each retrain.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'feedback_loop.py',
          code: `from datetime import datetime, timedelta

def build_training_set(prediction_log, outcome_events, window_days=30):
    """Join served rankings with click outcomes for LTR labels."""
    cutoff = datetime.utcnow() - timedelta(days=window_days)
    preds = prediction_log.filter(prediction_log.ts >= cutoff)
    joined = preds.join(outcome_events, on="request_id", how="left")

    # Position-aware labeling: clicked item = relevant (grade 1)
    training_rows = []
    for row in joined.collect():
        for rank, doc_id in enumerate(row.ranked_doc_ids):
            clicked = doc_id in (row.clicked_doc_ids or [])
            training_rows.append({
                "query": row.query,
                "doc_id": doc_id,
                "position": rank,
                "label": 1 if clicked else 0,
                "model_version": row.model_version,
            })
    return training_rows

def schedule_retrain_if_ready(metrics, min_new_labels=50_000):
    if metrics["new_labeled_rows"] >= min_new_labels and metrics["ndcg_gain"] > 0.01:
        trigger_pipeline("search_ltr_retrain", data_snapshot=metrics["snapshot_uri"])`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Feedback bias',
          body: 'Models promote what users already see and click (**position bias**, **popularity bias**). Use **randomized exploration**, **inverse propensity scoring**, and **offline eval** on held-out human judgments — not only live clicks.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Continuous improvement from real user behavior.',
            'Closes gap between offline metrics and production reality.',
            'Enables personalization at scale without manual relabeling.',
          ],
          cons: [
            'Implicit labels are noisy and biased.',
            'Delayed fraud labels slow the loop.',
            'Unchecked loops amplify filter bubbles and fraud blind spots.',
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
              question: 'What is a closed-loop ML system?',
              answer:
                'Production **predictions** are logged, **outcomes** become **labels**, models **retrain** periodically, and new versions **deploy** — feedback continuously improves the system.',
            },
            {
              question: 'Implicit vs explicit feedback?',
              answer:
                '**Implicit**: clicks, dwell time (cheap, noisy). **Explicit**: stars, human review (costly, accurate). Recommendations rely heavily on implicit; fraud needs explicit/delayed chargebacks.',
            },
            {
              question: 'What is feedback bias in recommendations?',
              answer:
                'Model only sees clicks on **exposed** items — popular items get more clicks, reinforcing popularity. Mitigate with **exploration**, **debiased IPS training**, and diverse candidate generation.',
            },
            {
              question: 'How does fraud feedback loop handle label delay?',
              answer:
                'Train on **confirmed fraud** up to T-90 days; use **proxy labels** (analyst review queue) for recent data; keep a **champion model** stable while labels mature.',
            },
            {
              question: 'Search ranking feedback loop design?',
              answer:
                'Log query, ranked docs, model version. Clicks → pairwise LTR labels. Weekly retrain with position debiasing; human eval set for head queries prevents click-only drift.',
            },
            {
              question: 'When should you NOT auto-retrain on feedback?',
              answer:
                'During **data incidents**, **seasonal anomalies**, or when **bias metrics** spike. Pause loop, investigate label quality, require manual approval before registry promotion.',
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
          body: '1. **Log predictions**, capture **outcomes**, label, **retrain**, deploy — close the loop.\n2. Real uses: **recommendations, search, fraud, ads**.\n3. Watch **feedback bias**, **delayed labels**, and **exploration**.\n4. Pair with **model registry** and gated promotion — not blind auto-retrain.',
        },
      ],
    },
  ],
};

export default content;
