import { DesignContent } from '../../../shared/models';
import { ENSEMBLE_ROUTING_META } from './ensemble-routing.meta';

const content: DesignContent = {
  meta: ENSEMBLE_ROUTING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Ensemble Routing** pattern routes inference requests to **multiple models** and **combines their outputs** — via hard/soft voting, stacking (meta-learner), or weighted averaging. Production systems use ensembles to improve accuracy, reduce variance, and specialize models per segment or signal type.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: 'No single model wins every case. Route traffic to a **portfolio** of models and **fuse** predictions at the edge — the serving layer becomes an orchestrator, not a single endpoint.',
        },
        {
          type: 'table',
          caption: 'Common combination strategies.',
          headers: ['Strategy', 'How it works', 'Typical use'],
          rows: [
            ['Hard voting', 'Majority class label wins', 'Fraud classifiers with diverse features'],
            ['Soft voting', 'Average predicted probabilities', 'Risk scoring across gradient-boosted trees'],
            ['Weighted average', 'Fixed or learned weights per model', 'Search ranking blend of LTR + heuristics'],
            ['Stacking', 'Meta-model learns from base outputs', 'Recommendation click-through prediction'],
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
          body: 'A **Netflix recommendation panel**: one algorithm surfaces trending titles, another knows your watch history, a third optimizes diversity. The **router** asks all three and **blends** their ranked lists — like a film festival jury where critics, audience polls, and genre experts each vote, then a curator weights the final slate.',
        },
        {
          type: 'mermaid',
          caption: 'Request flows to multiple models; combiner produces final prediction.',
          definition: `flowchart LR
  R[Inference Request] --> Router[Ensemble Router]
  Router --> M1[Model A: collaborative filtering]
  Router --> M2[Model B: content-based]
  Router --> M3[Model C: popularity baseline]
  M1 --> C[Combiner]
  M2 --> C
  M3 --> C
  C --> P[Final prediction / ranked list]`,
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
            ['Recommendations', 'Netflix/Spotify blend CF, content, and context models'],
            ['Fraud detection', 'Rule engine + GBM + graph model voted at authorization time'],
            ['Search ranking', 'BM25 + neural LTR + personalization weighted by query type'],
            ['Credit risk', 'Stacked ensemble with calibrated probability output'],
            ['Computer vision', 'Multi-architecture voting in medical imaging screening'],
            ['A/B model routing', 'Canary model gets 5% traffic; ensemble shadow mode compares'],
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
            'Expose each base model as an independent **serving endpoint** or sidecar. The router runs models **in parallel** (async fan-out), applies timeouts and fallbacks, then passes outputs to the combiner. Log per-model latency and contribution for debugging.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'ensemble_router.py',
          code: `from dataclasses import dataclass
import asyncio
import numpy as np

@dataclass
class ModelOutput:
    model_id: str
    proba: float
    latency_ms: float

WEIGHTS = {"fraud_rules": 0.2, "gbm_v3": 0.5, "graph_net": 0.3}

async def predict_fraud(transaction: dict) -> ModelOutput:
    # call each model endpoint in parallel
    ...

async def ensemble_predict(transaction: dict) -> dict:
    tasks = [
        predict_rules(transaction),
        predict_gbm(transaction),
        predict_graph(transaction),
    ]
    outputs = await asyncio.gather(*tasks, return_exceptions=True)

    valid = [o for o in outputs if isinstance(o, ModelOutput)]
    if not valid:
        raise RuntimeError("All models failed")

    # weighted soft voting
    score = sum(WEIGHTS[o.model_id] * o.proba for o in valid)
    score /= sum(WEIGHTS[o.model_id] for o in valid)

    return {
        "fraud_score": round(score, 4),
        "decision": "block" if score > 0.85 else "allow",
        "contributors": [o.model_id for o in valid],
    }`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Anti-pattern',
          body: 'Running five slow models **sequentially** on the fraud hot path. Latency becomes the sum of all models. Parallelize, cache stable features, and drop to a **degraded single-model** path under SLA pressure.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Higher accuracy and robustness than any single model.',
            'Specialized models can cover different segments or signals.',
            'Graceful degradation when one model fails.',
          ],
          cons: [
            'Higher inference cost and operational complexity.',
            'Harder to explain predictions to regulators or users.',
            'Weight tuning and stacking require careful offline validation.',
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
              question: 'Voting vs stacking — when do you use each?',
              answer:
                '**Voting** (hard/soft) is simple and fast — good when base models are diverse and similarly calibrated. **Stacking** trains a meta-learner on base outputs — better accuracy but needs hold-out data and adds serving complexity.',
            },
            {
              question: 'How do you set ensemble weights in production?',
              answer:
                'Start with **offline metrics** (AUC, NDCG). Tune weights on a validation set or learn them via stacking. In production, use **shadow mode** and gradual traffic shifts; monitor segment-level performance.',
            },
            {
              question: 'What happens when one model in the ensemble is down?',
              answer:
                'Re-normalize weights over **available** models, fall back to a default model, or return a cached/degraded score. Never block the entire request unless the missing model is safety-critical.',
            },
            {
              question: 'Ensemble routing vs model A/B testing?',
              answer:
                '**A/B** routes 100% of a user to one model for comparison. **Ensemble** combines multiple models on **every** request. You can A/B test the entire ensemble against a champion.',
            },
            {
              question: 'How does Netflix-style recommendation blending work?',
              answer:
                'Multiple rankers produce candidate lists or scores. A **blender** merges with weights that may depend on user cold-start state, device, or time of day. Diversity and business rules act as a final reranker.',
            },
            {
              question: 'Latency budget for fraud ensemble at checkout?',
              answer:
                'Typical SLA: **<50–100 ms** p99. Run fast rule engine first (short-circuit block), parallelize ML calls, cap models at 2–3, and precompute graph features asynchronously where possible.',
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
          body: '1. Route requests to **multiple models** and **fuse** outputs — voting, weighting, or stacking.\n2. Real uses: **recommendations, fraud, search ranking**.\n3. Parallelize inference; handle partial failures gracefully.\n4. Balance accuracy gains against **latency, cost, and explainability**.',
        },
      ],
    },
  ],
};

export default content;
