import{a as e}from"./chunk-WLVCFKJN.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Feature Pipeline** pattern transforms **raw events and entities** into **engineered features** consumed by both **offline training** and **online inference**. Pipelines must guarantee **train-serve parity** \u2014 the same transformation logic, point-in-time correctness, and freshness SLAs \u2014 often backed by a **feature store** (Feast, Tecton)."},{type:"callout",variant:"info",title:"Core idea",body:"Features are the contract between data and ML. Centralize computation in **orchestrated pipelines** that write to offline stores (parquet, warehouse) and online stores (Redis, DynamoDB) with shared definitions."},{type:"table",caption:"Feature pipeline stages.",headers:["Stage","Purpose","Output"],rows:[["Ingest","Raw clicks, transactions, profiles","Event stream / lake files"],["Transform","Aggregations, embeddings, joins","Feature values per entity"],["Materialize offline","Training snapshots with point-in-time joins","Parquet / BigQuery tables"],["Materialize online","Low-latency lookup at inference","Redis / Feast online store"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:`A **fraud analyst's cheat sheet**: raw transaction logs are messy police reports. The feature pipeline is the intel desk that distills **"purchases in last 10 minutes"**, **"distance from home"**, and **"merchant risk score"** onto a laminated card the officer (model) reads at checkout. The **same card** must be used in training simulations and live patrols \u2014 or the model learns the wrong cues.`},{type:"mermaid",caption:"Raw data flows through feature jobs to offline and online stores.",definition:`flowchart TB
  Raw[Raw events: clicks, orders, auth]
  Raw --> Batch[Batch feature job: Spark/Airflow]
  Raw --> Stream[Stream feature job: Flink]
  Batch --> Offline[(Offline store: parquet / warehouse)]
  Stream --> Online[(Online store: Redis / DynamoDB)]
  Offline --> Train[Model training]
  Online --> Serve[Real-time inference]
  Def[Feature definitions: Feast / shared lib] --> Batch
  Def --> Stream`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Fraud","`txn_count_1h`, `device_age_days` materialized per card_id"],["Recommendations","User watch-history embeddings refreshed hourly + live click counter"],["Search LTR","Query-document CTR, BM25 features, freshness signals"],["Credit","Point-in-time income and balance features for regulatory training"],["Uber marketplace","Driver/rider supply-demand features with strict freshness"],["Feast / Tecton adopters","Unified definitions across batch and streaming paths"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Define features in a **registry** with entity key, dtype, and TTL. Batch jobs compute historical values with **point-in-time joins** (no future leakage). Streaming jobs update **rolling windows**. Serving layer fetches online features and joins with request context at inference."},{type:"code",language:"python",filename:"feature_pipeline.py",code:`from feast import Entity, FeatureView, Field, FileSource
from feast.types import Float32, Int64
from datetime import timedelta

user = Entity(name="user_id", join_keys=["user_id"])

user_clicks_source = FileSource(
    path="s3://features/user_clicks/",
    timestamp_field="event_timestamp",
)

user_click_features = FeatureView(
    name="user_click_features",
    entities=[user],
    schema=[
        Field(name="clicks_7d", dtype=Int64),
        Field(name="avg_dwell_sec", dtype=Float32),
    ],
    source=user_clicks_source,
    ttl=timedelta(days=7),
)

# Batch job (Spark) writes parquet matching schema above.
# Online materialization pushes latest values to Redis for serving.

def get_features_for_inference(user_id: str) -> dict:
    features = online_store.get_online_features(
        features=["user_click_features:clicks_7d", "user_click_features:avg_dwell_sec"],
        entity_rows=[{"user_id": user_id}],
    ).to_dict()
    return features`},{type:"callout",variant:"warning",title:"Train-serve skew",body:"Different code paths for batch vs online cause **silent accuracy drops**. Share transformation libraries, test with **feature parity checks**, and log served feature values for comparison."},{type:"prosCons",title:"Trade-offs",pros:["Reusable features across models and teams.","Point-in-time correctness reduces leakage in training.","Online store meets inference latency SLAs."],cons:["Dual batch/stream paths increase complexity.","Feature store ops (freshness, backfill) is non-trivial.","Poor governance leads to feature sprawl and duplication."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is train-serve skew?",answer:"Training uses features computed one way (batch SQL); serving computes differently (streaming bug, stale cache). Model learns patterns that **do not exist** at inference \u2014 monitor parity."},{question:"Point-in-time correct features \u2014 why matter?",answer:"Training must use only data **available at prediction time**. Joining future transactions into past rows causes **leakage** and inflated offline metrics."},{question:"Batch vs streaming feature pipelines?",answer:"**Batch**: nightly/hourly aggregates, cheap, high latency. **Streaming**: rolling windows for freshness (fraud velocity). Most systems need **both** for the same entity."},{question:"What does a feature store do?",answer:"Central **registry** of definitions, **offline** store for training, **online** store for low-latency serving, and APIs to fetch consistent feature vectors."},{question:"Design features for recommendation ranking.",answer:"Entities: `user_id`, `item_id`. Features: `user_genre_affinity_30d`, `item_popularity_7d`, `context_hour`. Batch refresh embeddings; stream updates `last_click_category`. Serve merged vector to ranker in <20 ms."},{question:"How do you backfill a new feature?",answer:"Run historical batch job over event log with same logic as stream, write to offline store, backfill online store for active entities, validate distribution vs training sample."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Transform **raw \u2192 engineered features** for train and serve.
2. Orchestrate batch + stream; use a **feature store** for parity.
3. Real uses: **fraud, recommendations, search LTR**.
4. Guard against **train-serve skew** and **label leakage**.`}]}]},i=t;export{i as default};
