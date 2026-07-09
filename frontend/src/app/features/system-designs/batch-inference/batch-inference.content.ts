import { DesignContent } from '../../../shared/models';
import { BATCH_INFERENCE_META } from './batch-inference.meta';

const content: DesignContent = {
  meta: BATCH_INFERENCE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Batch Inference** pattern runs **offline scoring jobs** over large datasets — millions of users, transactions, or catalog items — without blocking online traffic. Frameworks like **Apache Spark** or **Apache Beam** load a trained model (or call a batch-optimized endpoint), apply it in parallel partitions, and write scores to a warehouse or cache for downstream apps to read.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: 'Compute predictions **ahead of time** when latency is flexible. A nightly job precomputes “top 50 recommendations per user” so the home feed API only reads pre-scored rows — milliseconds instead of scoring 10k items live.',
        },
        {
          type: 'table',
          caption: 'Typical batch inference outputs.',
          headers: ['Output', 'Consumer'],
          rows: [
            ['User → ranked item IDs + scores', 'Recommendation API / Redis cache'],
            ['Transaction fraud scores (backfill)', 'Risk analytics + model monitoring'],
            ['Product embeddings', 'Similar-item search index'],
            ['Churn probability per account', 'CRM campaigns via Airflow downstream'],
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
          body: 'A **newspaper printing press** vs a **live TV broadcast**. Recommendations for tomorrow’s “For You” page are printed overnight (batch) and delivered ready-to-read. Live events still need online serving — but most pages reuse pre-printed editions.',
        },
        {
          type: 'mermaid',
          caption: 'Nightly batch inference pipeline for recommendation precompute.',
          definition: `flowchart LR
  A[Airflow DAG 02:00 UTC] --> B[Spark read users + catalog]
  B --> C[Join features from warehouse]
  C --> D[Score with rec_model v7]
  D --> E[Write to rec_scores table]
  E --> F[Publish to Redis]
  F --> G[Home API reads cache]`,
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
            ['Recommendations', 'Netflix/Spotify — nightly precompute candidate rankings'],
            ['Marketing', 'Lead scoring batch for email segments'],
            ['Fraud', 'Re-score last 90 days after model retrain for audit'],
            ['Search', 'Offline compute LTR features for training sets'],
            ['Healthcare', 'Population risk stratification reports'],
            ['Credit', 'Periodic portfolio-wide default probability refresh'],
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
            'Orchestrate with **Airflow** or **Prefect**. Partition input data (by user shard or date), score idempotently, and write with **overwrite or merge** semantics keyed by `(entity_id, model_version, as_of_date)`. Alert on row-count drift vs prior run.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'spark_batch_inference.py',
          code: `from pyspark.sql import SparkSession
from pyspark.sql import functions as F
import mlflow.pyfunc

spark = SparkSession.builder.appName("rec-batch-infer").getOrCreate()
model = mlflow.pyfunc.load_model("models:/rec_model/Production")

users = spark.table("dw.dim_users").filter("is_active = true")
catalog = spark.table("dw.dim_items").filter("is_available = true")
features = spark.table("features.user_item_cross").join(users, "user_id")

# Broadcast small catalog side for candidate generation
candidates = features.crossJoin(F.broadcast(catalog.select("item_id")))

@F.pandas_udf("double")
def score_batch(pdf):
    return model.predict(pdf)

scored = (
    candidates
    .withColumn("score", score_batch(F.struct(*feature_cols)))
    .withColumn("model_version", F.lit("rec_model_v7"))
    .withColumn("scored_at", F.current_timestamp())
)

(
    scored
    .write
    .mode("overwrite")
    .partitionBy("scored_date")
    .saveAsTable("ml.rec_scores_daily")
)`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Anti-pattern',
          body: 'Running batch inference **without** `model_version` and `as_of_date` columns. Downstream cannot tell stale scores from fresh ones, and A/B tests between batch models become impossible.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Cost-efficient throughput on cheap batch compute (Spot instances).',
            'No user-facing latency — heavy models and wide joins are OK.',
            'Natural fit for nightly recommendation and CRM use cases.',
          ],
          cons: [
            'Scores are **stale** until the next run — bad for real-time fraud.',
            'Operational complexity: DAG failures, partition skew, data drift.',
            'Storage for large score matrices (users × items) can be expensive.',
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
              question: 'When batch inference instead of online serving?',
              answer:
                'When **latency tolerance** is hours and **volume** is huge — e.g. precompute recommendations, marketing scores, or backfills. Use online when the decision must happen at request time.',
            },
            {
              question: 'How do you score billions of rows in Spark?',
              answer:
                'Partition data, use **pandas UDF** or **mapInPandas** with a loaded model per executor, avoid collecting to driver, tune partition size, and consider **approximate** candidate generation before full scoring.',
            },
            {
              question: 'How do batch scores reach the online API?',
              answer:
                'Write to a **warehouse table** then **publish** top-K per entity to Redis/DynamoDB via a follow-up job. API reads cache; fallback to a simpler online model if cache miss.',
            },
            {
              question: 'How do you handle model updates in batch jobs?',
              answer:
                'Version output columns, run **parallel backfill** for comparison, use feature flags to switch which table/cache key the API reads, and monitor score distribution shift.',
            },
            {
              question: 'Batch inference vs model training job?',
              answer:
                'Training **updates weights** from labeled data. Batch inference **applies fixed weights** to unlabeled entities for prediction. Often separate pipelines sharing feature code.',
            },
            {
              question: 'What can go wrong operationally?',
              answer:
                'DAG timeout, **partition skew** (one hot user), OOM on executors, writing partial partitions, and silent schema drift between features and model signature.',
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
          body: '1. Batch inference **precomputes scores** at scale when real-time is unnecessary.\n2. Real uses: **nightly recommendations**, CRM scores, fraud backfills.\n3. Orchestrate with **Airflow + Spark/Beam**; version and partition outputs.\n4. Pair with **online serving** for hybrid freshness + cost efficiency.',
        },
      ],
    },
  ],
};

export default content;
