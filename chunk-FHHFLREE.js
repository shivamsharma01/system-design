import{a as e}from"./chunk-S5P7BNDL.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Feature Store** pattern centralizes **feature definitions**, **materialization**, and **serving** so training and production use the **same features**. Platforms like **Feast** or **Tecton** maintain an **offline store** (warehouse for historical training with **point-in-time correct joins**) and an **online store** (Redis/DynamoDB for low-latency lookup at inference)."},{type:"callout",variant:"info",title:"Core idea",body:"Features are **first-class data products**: defined once, computed on a schedule or stream, and consumed by both the training pipeline and the serving path \u2014 reducing training-serving skew and duplicate SQL across teams."},{type:"table",caption:"Offline vs online store roles.",headers:["Store","Purpose","Latency"],rows:[["Offline (BigQuery, S3)","Historical features + point-in-time joins for training","Minutes to hours"],["Online (Redis, DynamoDB)","Latest feature vector per entity key at inference","Single-digit ms"],["Registry","Schema, owners, freshness SLAs, lineage","Metadata only"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **central spice pantry** in a restaurant chain: recipes (models) list \u201C2 tsp paprika\u201D from the **same labeled jar** whether cooked in the training kitchen (batch) or the service line (online). Without it, each chef grinds their own blend \u2014 flavors (features) drift between locations."},{type:"mermaid",caption:"Feature store feeds both training and online inference.",definition:`flowchart TB
  subgraph ingest [Ingestion]
    E[Events / DB CDC] --> T[Feature transforms]
  end
  T --> OFF[Offline store]
  T --> ON[Online store]
  OFF --> TR[Training pipeline]
  TR --> M[Trained model]
  M --> INF[Inference service]
  ON --> INF
  INF --> APP[Recommendations / Fraud API]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Recommendations","User watch history, category affinities \u2014 shared train/serve"],["Fraud","Rolling 24h spend, device fingerprint counts at payment time"],["Search ranking","Query-document click features materialized hourly"],["Ads CTR","User segment + creative interaction features"],["Credit risk","Point-in-time income/debt features for regulatory training"],["Marketplace","Seller rating aggregates for listing quality model"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Define **FeatureViews** with entity keys (e.g. `user_id`), TTL, and transformation logic. Materialize to offline on schedule; push latest values to online. Training queries use **`as_of_timestamp`** joins so future data never leaks into labels."},{type:"code",language:"python",filename:"feast_feature_view.py",code:`from feast import Entity, FeatureView, Field, FileSource
from feast.types import Float32, Int64
from datetime import timedelta

user = Entity(name="user_id", join_keys=["user_id"])

user_events = FileSource(
    path="data/user_watch_events.parquet",
    timestamp_field="event_timestamp",
)

user_watch_stats = FeatureView(
    name="user_watch_stats",
    entities=[user],
    ttl=timedelta(days=7),
    schema=[
        Field(name="watch_count_7d", dtype=Int64),
        Field(name="avg_rating_7d", dtype=Float32),
    ],
    source=user_events,
    online=True,
)

# Training: point-in-time join
# training_df = store.get_historical_features(
#     entity_df=labels[["user_id", "event_timestamp"]],
#     features=["user_watch_stats:watch_count_7d", "user_watch_stats:avg_rating_7d"],
# )

# Serving: online lookup
# features = store.get_online_features(
#     features=["user_watch_stats:watch_count_7d"],
#     entity_rows=[{"user_id": "u_123"}],
# )`},{type:"callout",variant:"warning",title:"Anti-pattern",body:"Using **latest** warehouse rows for training without point-in-time joins. You leak future watch history into past labels \u2014 offline AUC looks great, production recommendations fail."},{type:"prosCons",title:"Trade-offs",pros:["Single source of truth for features across teams.","Point-in-time joins prevent leakage in training.","Online store enables low-latency consistent inference."],cons:["Platform overhead \u2014 not worth it for one small model.","Freshness SLAs and backfills require operational ownership.","Cross-team schema governance can slow iteration."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What problem does a feature store solve?",answer:"Duplicate feature logic, **training-serving skew**, and slow **point-in-time correct** training data assembly. Centralizes definitions and serving paths."},{question:"What is a point-in-time join?",answer:"For each training label at time **T**, join only feature values that were **known at T** \u2014 not future updates. Prevents label leakage and inflated offline metrics."},{question:"Offline vs online store?",answer:"**Offline**: bulk historical data for training/backtesting. **Online**: low-latency latest values keyed by entity for inference. Same definitions, different materialization."},{question:"Feast vs building Redis yourself?",answer:"Feast adds **registry**, PIT joins, materialization jobs, and consistency contracts. DIY Redis works for one team until schemas and freshness multiply."},{question:"How do streaming features fit?",answer:"Stream processors (Flink) update online store in near real time; compacted snapshots land in offline store for retraining \u2014 with **watermarks** for correctness."},{question:"When is a feature store overkill?",answer:"Single model, few features, one team, batch-only inference \u2014 direct SQL + cache may suffice until reuse and skew pain appear."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Feature stores unify **offline training** and **online serving** feature paths.
2. **Point-in-time joins** are non-negotiable for honest offline metrics.
3. Real uses: **recommendations, fraud, search ranking, ads** feature sharing.
4. Feast/Tecton-style platforms add registry, materialization, and SLAs.`}]}]},i=t;export{i as default};
