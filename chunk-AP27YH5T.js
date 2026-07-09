import{a as e}from"./chunk-5BIPKJGW.js";import"./chunk-IFGU66OU.js";var a={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Lambda Architecture**, coined by Nathan Marz, splits analytics into three layers: a **batch layer** for complete, accurate historical views; a **speed layer** for low-latency incremental updates; and a **serving layer** that **merges** both for queries. It solves the tension between **correctness** (batch) and **freshness** (stream) in large-scale data systems."},{type:"callout",variant:"info",title:"Core idea",body:"Run **two parallel computation paths** on the same immutable event log. Batch recomputes everything periodically; speed layer patches recent data. Serving layer answers queries by combining precomputed batch views with real-time speed views."},{type:"table",caption:"Lambda layers.",headers:["Layer","Role","Typical tech"],rows:[["Batch","Full recompute on all historical data","Spark, Hadoop MapReduce"],["Speed","Incremental updates on recent events","Storm, Flink, Kafka Streams"],["Serving","Merge batch + speed for query answers","Cassandra, HBase, Druid, Pinot"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"**Streaming analytics for a sports league**: the **nightly stats desk** (batch) recalculates season standings from every game ever played \u2014 authoritative but slow. The **live scoreboard** (speed) updates each basket in seconds. Fans query the **serving layer** that shows season totals **plus** tonight's live points \u2014 like ESPN merging historical tables with the live feed."},{type:"mermaid",caption:"Immutable log feeds both batch and speed paths into serving.",definition:`flowchart TB
  Log[(Immutable event log)]
  Log --> Batch[Batch layer: full recompute]
  Log --> Speed[Speed layer: incremental]
  Batch --> BatchView[(Batch views)]
  Speed --> SpeedView[(Real-time views)]
  BatchView --> Serving[Serving layer: merge on query]
  SpeedView --> Serving
  Serving --> Q[Dashboard / API / ML features]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Ad analytics","Daily batch revenue reports + real-time impression counters"],["Fraud streaming","Batch train on history; speed layer flags anomalous sessions live"],["Recommendation features","Nightly user embedding refresh + real-time click updates"],["IoT dashboards","Spark batch aggregates + Flink windowed alerts"],["LinkedIn-era analytics","Classic Lambda for view counts and activity feeds"],["Data warehouses","ELT batch + streaming ingest to serving OLAP (hybrid Lambda)"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Append all events to an **immutable log** (Kafka, S3 data lake). Batch jobs run on a schedule (hourly/daily) and write **versioned snapshots** to the serving store. Speed layer consumers update **complementary tables** keyed the same way so merge logic is a simple **union or additive merge** at query time."},{type:"code",language:"yaml",filename:"lambda-pipeline.yaml",code:`# Simplified Airflow DAG: batch + speed coordination
dag:
  id: user_engagement_lambda
  schedule: "@hourly"

  tasks:
    - id: ingest_events
      operator: KafkaConsumer
      topic: user_clicks
      sink: s3://datalake/events/dt={{ ds }}

    - id: batch_layer
      operator: SparkSubmit
      depends_on: [ingest_events]
      script: jobs/batch_engagement.py
      output: cassandra.batch_engagement

    - id: speed_layer
      operator: FlinkJob
      depends_on: [ingest_events]
      script: jobs/speed_engagement.py
      output: cassandra.speed_engagement

    - id: serving_merge_view
      operator: SqlExecute
      depends_on: [batch_layer, speed_layer]
      query: |
        -- Serving layer merges on read
        SELECT user_id,
               batch_views + speed_views AS total_views
        FROM batch_engagement b
        FULL OUTER JOIN speed_engagement s USING (user_id)`},{type:"callout",variant:"warning",title:"Operational cost",body:"Maintaining **two code paths** (batch + speed) that must produce **semantically identical** results is the main Lambda pain point. Divergent logic causes subtle bugs \u2014 invest in shared libraries and reconciliation tests."},{type:"prosCons",title:"Trade-offs",pros:["Accurate historical views from batch recompute.","Low-latency updates from speed layer.","Immutable log enables replay and audit."],cons:["Dual pipelines double development and ops burden.","Merge logic at serving layer adds query complexity.","Largely superseded by Kappa + modern OLAP for many greenfield builds."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What are the three layers of Lambda Architecture?",answer:"**Batch layer** (full recompute), **speed layer** (incremental real-time), **serving layer** (merges both for queries). All fed by an immutable master dataset."},{question:"Why not just use streaming for everything?",answer:"Streaming approximations can miss **late-arriving data** or complex global aggregations. Batch recompute on the full history gives **correctness** and simpler logic for heavy joins \u2014 at the cost of latency."},{question:"How does the serving layer merge batch and speed views?",answer:"Typically **additive merge**: `total = batch_count + speed_count` for counters, or **overwrite with speed** for recent windows. Keys must align; reconciliation jobs detect drift between layers."},{question:"Lambda vs Kappa \u2014 when prefer Lambda?",answer:"Lambda when you need **provably correct batch snapshots** for compliance/reporting and can afford dual pipelines. Kappa when replay on a stream is enough and ops simplicity wins."},{question:"What is the immutable log in Lambda?",answer:"Append-only store of all raw events (Kafka, S3). Batch and speed both consume it. Enables **reprocessing** if logic changes without re-ingesting from sources."},{question:"Design Lambda for real-time fraud analytics.",answer:"Events \u2192 Kafka. **Speed**: Flink windows compute velocity features for scoring. **Batch**: nightly Spark job rebuilds merchant profiles and historical fraud rates. **Serving**: Cassandra keyed by `card_id`; inference service reads merged features at authorization time."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. **Batch + speed + serving** layers merge accuracy and freshness.
2. Immutable **event log** feeds both paths \u2014 Nathan Marz foundation.
3. Real uses: **ad analytics, fraud features, IoT dashboards**.
4. Trade-off: **correctness vs dual-pipeline complexity**; compare with Kappa.`}]}]},s=a;export{s as default};
