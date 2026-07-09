import { DesignContent } from '../../../shared/models';
import { TRAINING_SERVING_SKEW_META } from './training-serving-skew.meta';

const content: DesignContent = {
  meta: TRAINING_SERVING_SKEW_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Training-Serving Skew** occurs when features or preprocessing **differ between offline training and online inference** — different SQL, library versions, missing defaults, or stale caches. The model learns one distribution but sees another in production. The **Training-Serving Skew Prevention** pattern enforces a **single feature code path**, logs features at serve time for replay validation, and monitors **prediction drift** after deploy.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: 'If `train_features(user)` ≠ `serve_features(user)`, offline AUC is misleading. Share transforms (Protobuf schemas, feature store, shared library) and **prove parity** with logged production feature vectors.',
        },
        {
          type: 'table',
          caption: 'Common skew sources.',
          headers: ['Source', 'Example'],
          rows: [
            ['Different code paths', 'Python UDF in training, Java string split in serving'],
            ['Data freshness', 'Training uses T-1 warehouse; serving uses live Redis — OK if intentional, fatal if not'],
            ['Null handling', 'Training imputes median; serving sends null → model default break'],
            ['Encoding', 'Training rare-category bucket; serving unseen category → OOV'],
            ['Bug in one path', 'Search ranking: log-normalized click rate in train, raw count in serve'],
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
          body: '**Search ranking** trained on “clicks in last 7 days” but served with “clicks since account creation” is like coaching a sprinter on a 100 m track and entering them in a marathon — same athlete (model), wrong course (features), poor finish (ranking quality).',
        },
        {
          type: 'mermaid',
          caption: 'Unified feature path vs skewed dual paths.',
          definition: `flowchart TB
  subgraph bad [Skewed — avoid]
    TR1[Training SQL] --> M[Model]
    SR1[Serving Java code] --> M
  end
  subgraph good [Unified — prefer]
    DEF[Shared feature definitions]
    DEF --> TR2[Training pipeline]
    DEF --> SR2[Serving API]
    TR2 --> M2[Model]
    SR2 --> M2
    SR2 --> LOG[Feature log for replay]
  end`,
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
            ['Search ranking', 'Click-through rate features must match between LTR train and query server'],
            ['Fraud', 'Velocity features computed identically in batch retrain and payment API'],
            ['Recommendations', 'Watch-history embeddings from same Feast view train and serve'],
            ['Ads CTR', 'User segment encoding shared via protobuf contract'],
            ['NLP', 'Same tokenizer vocabulary hash in training and inference container'],
            ['Computer vision', 'Identical resize/normalize pipeline in TFX transform and serving'],
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
            'Package transforms in a **shared library** or **feature store**. At serving, **log `(request_id, feature_vector, model_version)`** to Kafka. Nightly job replays logs through training pipeline and asserts **max diff < ε** per feature. Block deploy if parity tests fail.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'FeatureParityCheck.java',
          code: `public class SearchRankingService {
  private final FeatureStoreClient features;
  private final ModelClient model;
  private final FeatureLogPublisher logPublisher;

  public RankResponse rank(RankRequest req) {
    FeatureVector fv = features.getOnlineFeatures(
        "search_doc_features",
        Map.of("query_id", req.queryId(), "doc_id", req.docId())
    );
    // Log for offline replay — same bytes the model sees
    logPublisher.publish(new FeatureLogEntry(
        req.requestId(), fv, "ltr_v12", Instant.now()
    ));
    double score = model.predict(fv);
    return new RankResponse(req.docId(), score);
  }
}

// CI job: replay 10k logged vectors through training transform
// assert abs(train_transform(x) - logged_x) < 1e-6 for all dimensions`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Anti-pattern',
          body: '“We will fix serving to match training after launch.” Production users already saw bad rankings; trust in ML team erodes. **Parity gates in CI** before any traffic shift.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Offline metrics predict online behavior more reliably.',
            'Feature logging enables post-mortems and rapid skew detection.',
            'Shared libraries reduce duplicate data engineering work.',
          ],
          cons: [
            'Shared code couples release cycles of training and serving teams.',
            'Logging every feature vector adds storage and PII governance overhead.',
            'Strict parity can slow experimentation with serve-only shortcuts.',
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
              question: 'What is training-serving skew?',
              answer:
                'Mismatch between **features or preprocessing** used during training vs production inference. Model performance drops despite good offline metrics.',
            },
            {
              question: 'How do you detect skew after deploy?',
              answer:
                'Compare **logged serve features** to offline recomputation, monitor **prediction distribution** and business KPIs, slice errors by feature version or cohort.',
            },
            {
              question: 'Feature store vs shared library for parity?',
              answer:
                '**Feature store** handles materialization + PIT joins + online lookup. **Shared library** embeds transform logic in both pipelines. Often use **both** — store for data, library for last-mile transforms.',
            },
            {
              question: 'Is freshness difference always skew?',
              answer:
                'Not if **designed intentionally** — training may use daily snapshots while serving uses real-time counts, but the **transform definition** must document and simulate that gap in eval.',
            },
            {
              question: 'How does TFX help?',
              answer:
                '**Transform** step serializes preprocessing graph (TensorFlow Transform) reused at serving — same graph, fewer hand-ported rules.',
            },
            {
              question: 'Give a search ranking skew example.',
              answer:
                'Training joins clicks with **7-day window**; serving accidentally uses **30-day window** — model overweighted stale popularity signals, fresh content under-ranked.',
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
          body: '1. **Train ≠ serve** feature paths are a top cause of production ML failure.\n2. Use **one definition** (feature store, shared lib, TFX transform).\n3. **Log features at serve time** and replay in CI for parity.\n4. Real impact: **search ranking, fraud, recommendations** quality.',
        },
      ],
    },
  ],
};

export default content;
