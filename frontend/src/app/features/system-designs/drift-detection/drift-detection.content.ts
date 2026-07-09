import { DesignContent } from '../../../shared/models';
import { DRIFT_DETECTION_META } from './drift-detection.meta';

const content: DesignContent = {
  meta: DRIFT_DETECTION_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Drift Detection** pattern continuously compares **production data and predictions** against a training baseline to detect when a model\'s world has changed. **Data drift** shifts input distributions; **prediction drift** shifts output distributions; **concept drift** changes the relationship between inputs and labels. Detected drift triggers **alerts, investigation, and retraining**.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: 'Models decay silently. Monitor **feature distributions** and **prediction scores** on a schedule or stream, compare to baseline with statistical tests, and automate the path to **retrain** when thresholds breach.',
        },
        {
          type: 'table',
          caption: 'Drift types and signals.',
          headers: ['Type', 'What changed', 'Example metric'],
          rows: [
            ['Data drift', 'Input feature distribution', 'PSI on `transaction_amount`'],
            ['Prediction drift', 'Model output distribution', 'KL divergence on fraud scores'],
            ['Concept drift', 'P(label | features) relationship', 'Rising false negatives after policy change'],
            ['Label drift', 'Ground-truth rate over time', 'Chargeback rate spike vs predicted fraud'],
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
          body: 'A **fraud model** trained before contactless payments went mainstream is like a bouncer who memorized last year\'s fake IDs. New card-present patterns look unfamiliar — not because the bouncer is lazy, but because the **crowd changed**. Drift detection is the nightly headcount and ID-spot-check that tells security when to **retrain the playbook**.',
        },
        {
          type: 'mermaid',
          caption: 'Production traffic monitored; drift triggers retrain pipeline.',
          definition: `flowchart LR
  Prod[Production inference] --> Log[Feature + prediction log]
  Log --> Mon[Drift monitor]
  Base[Training baseline] --> Mon
  Mon -->|PSI / KL below threshold| OK[Continue serving]
  Mon -->|threshold breached| Alert[Pager / ticket]
  Alert --> Investigate[Root cause analysis]
  Investigate --> Retrain[Retrain pipeline]
  Retrain --> Registry[Model registry promote]`,
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
            ['Fraud ML', 'PSI on merchant category mix; alert when score distribution shifts'],
            ['Credit scoring', 'Regulatory monitoring of approval rate vs model calibration'],
            ['Recommendations', 'User engagement drift after UI redesign'],
            ['Search ranking', 'Query distribution shift after viral event'],
            ['Healthcare ML', 'Patient demographics drift across hospital sites'],
            ['MLOps platforms', 'Evidently, WhyLabs, Arize embedded in CI/CD gates'],
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
            'Log **inputs, predictions, and (delayed) labels** to a monitoring store. Compute **PSI** (Population Stability Index) for binned features — PSI > 0.25 often warrants investigation. Use **KL divergence** or **KS test** for continuous scores. Run checks on **rolling windows** (daily/weekly) and segment by region or product.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'drift_monitor.py',
          code: `import numpy as np

def population_stability_index(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    """PSI compares binned distributions. <0.1 stable, 0.1-0.25 watch, >0.25 investigate."""
    breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
    breakpoints[0], breakpoints[-1] = -np.inf, np.inf

    exp_pct = np.histogram(expected, bins=breakpoints)[0] / len(expected)
    act_pct = np.histogram(actual, bins=breakpoints)[0] / len(actual)

    # avoid log(0)
    exp_pct = np.clip(exp_pct, 1e-6, None)
    act_pct = np.clip(act_pct, 1e-6, None)

    psi = np.sum((act_pct - exp_pct) * np.log(act_pct / exp_pct))
    return float(psi)

def check_drift(baseline_scores, live_scores, threshold=0.25):
    psi = population_stability_index(baseline_scores, live_scores)
    if psi > threshold:
        trigger_retrain_pipeline(
            reason=f"prediction_drift_psi={psi:.3f}",
            model_id="fraud_gbm_v4",
        )
    return {"psi": psi, "action": "retrain" if psi > threshold else "ok"}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'False alarms',
          body: 'Seasonal spikes (Black Friday) look like drift. Use **seasonal baselines**, segment-level thresholds, and require **performance degradation** (not just distribution shift) before auto-retraining.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Catches model decay before business metrics collapse.',
            'Provides audit trail for regulated ML systems.',
            'Automates the trigger for retraining pipelines.',
          ],
          cons: [
            'Statistical drift does not always mean worse accuracy.',
            'Label delay makes concept drift hard to detect in real time.',
            'Threshold tuning is domain-specific and noisy.',
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
              question: 'Data drift vs concept drift?',
              answer:
                '**Data drift**: P(X) changes — input distribution shifts. **Concept drift**: P(Y|X) changes — same inputs mean different outcomes. A fraud model can see data drift without concept drift if labels are stable.',
            },
            {
              question: 'What is PSI and how do you interpret it?',
              answer:
                '**Population Stability Index** compares binned distributions between baseline and current. Rule of thumb: **<0.1** stable, **0.1–0.25** moderate shift, **>0.25** significant — investigate and consider retrain.',
            },
            {
              question: 'When would you use KL divergence over PSI?',
              answer:
                '**KL divergence** measures difference between two probability distributions — useful for **continuous prediction scores** or softmax outputs. PSI is more common for **binned features** in credit and fraud.',
            },
            {
              question: 'How do you trigger retraining automatically?',
              answer:
                'Drift monitor emits event → workflow (Airflow/SageMaker Pipeline) pulls fresh labels, retrains, evaluates on hold-out, registers model, and promotes via **canary** if metrics beat champion.',
            },
            {
              question: 'Prediction drift without data drift — possible?',
              answer:
                'Yes — upstream **calibration** change, model version swap, or threshold tuning can shift scores while inputs look stable. Always log **model version** alongside features.',
            },
            {
              question: 'How does search ranking monitor drift?',
              answer:
                'Track **query term distribution** (data drift), **click-through rate by position** (performance), and **score distribution** from LTR model. Viral queries shift the mix — rerankers may need fresh training data.',
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
          body: '1. Monitor **data, prediction, and concept drift** against a baseline.\n2. Use **PSI, KL, KS tests** on rolling windows; segment by domain.\n3. Real uses: **fraud, credit, recommendations, search**.\n4. Drift detection **triggers investigation and retrain** — not every alert means auto-deploy.',
        },
      ],
    },
  ],
};

export default content;
