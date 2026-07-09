import { DesignContent } from '../../../shared/models';
import { ETL_PIPELINE_META } from './etl-pipeline.meta';

const content: DesignContent = {
  meta: ETL_PIPELINE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **ETL (Extract, Transform, Load)** pattern moves data from source systems through **cleansing and enrichment** into a destination warehouse or lake. **ELT** flips the order: **load raw** data first into Snowflake/BigQuery/Redshift, then **transform in-SQL** with dbt. Modern stacks orchestrate both with **Airflow, Dagster, or Prefect**.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: 'Separate **ingestion**, **transformation**, and **loading** into repeatable, scheduled pipelines. ETL transforms before load (traditional); ELT leverages warehouse compute after load (cloud-native).',
        },
        {
          type: 'table',
          caption: 'ETL vs ELT.',
          headers: ['Approach', 'Transform where?', 'Best for'],
          rows: [
            ['ETL', 'External tool (Spark, Python) before warehouse', 'Legacy DBs, strict PII masking pre-load'],
            ['ELT', 'SQL/dbt inside warehouse after raw load', 'Snowflake, BigQuery — elastic compute'],
            ['Reverse ETL', 'Warehouse → SaaS (Salesforce, ads)', 'Operationalizing analytics back to apps'],
            ['CDC pipelines', 'Debezium → Kafka → warehouse', 'Near-real-time replication'],
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
          body: 'A **restaurant supply chain**: **Extract** — trucks pick up ingredients from farms (source DBs, APIs). **Transform** — prep kitchen washes, chops, and portions (cleansing, joins, dedup). **Load** — plated dishes to the service line (warehouse tables). **ELT** is like delivering bulk crates to a massive central kitchen (warehouse) that does all prep on-site with industrial equipment (SQL compute).',
        },
        {
          type: 'mermaid',
          caption: 'Orchestrated ELT: extract → raw load → dbt transform → marts.',
          definition: `flowchart LR
  S1[(Postgres OLTP)]
  S2[Stripe API]
  S3[S3 logs]
  S1 --> E[Extract / Fivetran / Airbyte]
  S2 --> E
  S3 --> E
  E --> Raw[(Raw layer: Snowflake)]
  Raw --> T[Transform: dbt models]
  T --> Mart[(Analytics marts)]
  Mart --> BI[Looker / ML features]`,
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
            ['E-commerce', 'Nightly orders ETL from shards → Snowflake `fct_orders`'],
            ['SaaS analytics', 'Fivetran extracts Salesforce + Zendesk; dbt builds ARR metrics'],
            ['Fraud ML', 'Transaction CDC → feature tables for training pipelines'],
            ['Marketing', 'Ad platform APIs → attribution warehouse via Airflow'],
            ['Healthcare', 'ETL with HIPAA de-identification before load'],
            ['Startup stack', 'Airbyte + dbt + BigQuery + Metabase — classic modern ELT'],
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
            'Define **layers**: raw (landing), staging (cleaned), marts (business-ready). Use **idempotent** loads with merge/upsert keys. Orchestrate with DAG dependencies; alert on SLA misses. dbt tests enforce **not null, unique, referential** constraints.',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'airflow_elt_dag.yaml',
          code: `# Airflow DAG sketch: daily ELT for orders
dag_id: daily_orders_elt
schedule: "0 2 * * *"

tasks:
  extract_postgres:
    operator: PostgresToS3Operator
    sql: "SELECT * FROM orders WHERE updated_at >= '{{ ds }}'"
    s3_key: "raw/orders/dt={{ ds }}/"

  load_snowflake:
    operator: SnowflakeOperator
    depends_on: [extract_postgres]
    sql: |
      COPY INTO raw.orders
      FROM @stage/orders/dt={{ ds }}/
      FILE_FORMAT = (TYPE = PARQUET);

  dbt_run:
    operator: BashOperator
    depends_on: [load_snowflake]
    bash_command: "dbt run --select staging.orders+ mart.fct_orders"

  dbt_test:
    operator: BashOperator
    depends_on: [dbt_run]
    bash_command: "dbt test --select mart.fct_orders"`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Anti-pattern',
          body: 'Monolithic Python scripts with no tests, no incremental loads, and full-table scans daily. Breaks at scale — adopt **incremental models**, partition pruning, and data contracts.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Centralized analytics truth for BI and ML.',
            'ELT leverages cheap, elastic warehouse compute.',
            'Orchestration gives visibility, retries, and lineage.',
          ],
          cons: [
            'Pipeline failures cause stale dashboards and models.',
            'Schema drift in sources breaks transforms silently.',
            'ETL tooling sprawl (Airflow + dbt + Fivetran) to operate.',
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
              question: 'ETL vs ELT — when choose each?',
              answer:
                '**ETL** when you must transform/mask **before** data hits the warehouse (compliance, small targets). **ELT** when the warehouse is powerful and you want **raw retention** + SQL transforms (dbt) — default for cloud warehouses.',
            },
            {
              question: 'What role does Airflow play?',
              answer:
                '**Orchestrator** — schedules tasks, manages dependencies, retries, alerting. It does not replace dbt or Spark; it coordinates extract, load, transform, and downstream ML jobs.',
            },
            {
              question: 'How does dbt fit in ELT?',
              answer:
                'dbt manages **SQL transformations** as versioned models: staging → intermediate → marts. Provides tests, docs, and lineage inside the warehouse.',
            },
            {
              question: 'Incremental vs full refresh loads?',
              answer:
                '**Incremental** merges new/changed rows by `updated_at` or CDC — cheap at scale. **Full refresh** rebuilds table — simple but costly; use for small dimensions or recovery.',
            },
            {
              question: 'How do ETL pipelines feed ML?',
              answer:
                'Marts like `fct_user_engagement` become **training snapshots**. Feature pipelines read warehouse tables or export to parquet/S3 for Spark training jobs.',
            },
            {
              question: 'Handle upstream schema change?',
              answer:
                '**Data contracts**, source alerts, dbt tests on column presence, and staging layers that absorb changes before marts break. Version API extracts explicitly.',
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
          body: '1. **Extract → Transform → Load** (or ELT: load raw, transform in warehouse).\n2. Orchestrate with **Airflow/Dagster**; transform with **dbt/Spark**.\n3. Real uses: **analytics marts, fraud features, marketing attribution**.\n4. Layer raw/staging/marts; prefer **incremental, tested** pipelines.',
        },
      ],
    },
  ],
};

export default content;
