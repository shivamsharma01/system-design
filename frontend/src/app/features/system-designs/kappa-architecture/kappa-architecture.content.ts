import { DesignContent } from '../../../shared/models';
import { KAPPA_ARCHITECTURE_META } from './kappa-architecture.meta';

const content: DesignContent = {
  meta: KAPPA_ARCHITECTURE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Kappa Architecture** simplifies Lambda by using a **single stream processing layer** as the sole path for both real-time and historical analytics. When logic changes or backfill is needed, **replay** the immutable event log through the same streaming job. Jay Kreps proposed this as operational simplicity: one codebase, one mental model.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: 'Treat the **event log as source of truth**. Run one streaming application for live traffic; for historical correction, **reset offsets** and reprocess. No separate batch system — replay *is* the batch layer.',
        },
        {
          type: 'table',
          caption: 'Lambda vs Kappa.',
          headers: ['Aspect', 'Lambda', 'Kappa'],
          rows: [
            ['Pipelines', 'Batch + speed (two code paths)', 'Single stream + replay'],
            ['Historical recompute', 'Dedicated batch job', 'Replay event log through stream job'],
            ['Ops complexity', 'Higher — dual maintenance', 'Lower — one pipeline'],
            ['Best when', 'Strict batch correctness, heavy joins', 'Stream-native, replay-friendly workloads'],
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
          body: 'A **DVR for live TV** (streaming analytics): you watch the game live, but if the scoreboard formula changes, you **rewind the recording** and rerun the same highlight algorithm from kickoff. You do not need a separate "archive editing suite" (batch layer) — one player handles live and replay.',
        },
        {
          type: 'mermaid',
          caption: 'Single stream job serves live traffic; replay handles historical recompute.',
          definition: `flowchart TB
  Log[(Immutable event log / Kafka)]
  Log --> Stream[Stream processing job]
  Stream --> Live[Real-time materialized views]
  Stream --> Sink[(Serving store / OLAP)]
  Fix[Logic change or backfill needed] --> Replay[Replay from offset = 0]
  Replay --> Stream
  Sink --> API[Search analytics / dashboards]`,
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
            ['Search analytics', 'Kafka + Flink clickstream aggregates; replay after ranking feature change'],
            ['Recommendation logging', 'Single pipeline for impression/click features with offset replay'],
            ['Fraud sessionization', 'Flink windows on auth events; replay for new velocity rules'],
            ['LinkedIn/Kafka ecosystem', 'Stream-first shops avoiding dual Lambda maintenance'],
            ['Event sourcing', 'Natural fit — log is already canonical state'],
            ['ksqlDB / Materialize', 'SQL stream layers with backfill via replay'],
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
            'Store events in Kafka with **long retention** (or tiered storage to S3). Flink/Kafka Streams job maintains **materialized state** (RocksDB). On deploy with logic change: spin up **v2 job** from `earliest` offset writing to new sink, cut over when caught up, deprecate v1.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'KappaReplayJob.java',
          code: `// Flink: same job handles live + replay — only start offset differs
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

KafkaSource<ClickEvent> source = KafkaSource.<ClickEvent>builder()
    .setBootstrapServers("kafka:9092")
    .setTopics("search-clicks")
    .setGroupId("search-analytics-v2")
    .setStartingOffsets(OffsetsInitializer.earliest()) // replay mode
    .setValueOnlyDeserializer(new ClickDeserializer())
    .build();

DataStream<ClickEvent> clicks = env.fromSource(source, WatermarkStrategy.noWatermarks(), "clicks");

clicks
    .keyBy(ClickEvent::queryId)
    .window(TumblingEventTimeWindows.of(Time.hours(1)))
    .aggregate(new ClickCountAggregator())
    .sinkTo(ElasticSearchSink.sinkFor("query_hourly_stats"));

// Live traffic: same code, setStartingOffsets(OffsetsInitializer.latest())
env.execute("search-analytics-kappa");`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Replay is not free',
          body: 'Full log replay can take **hours** and stress Kafka. Use **versioned sinks**, incremental backfill windows, and retained compacted changelog topics. Very large history may still need a batch helper — pragmatic "Kappa+" hybrids exist.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Single codebase — no batch/speed divergence.',
            'Replay provides auditability and easy logic updates.',
            'Aligns with event-driven and event-sourced systems.',
          ],
          cons: [
            'Full replay costly at petabyte scale.',
            'Complex global aggregations harder in pure stream.',
            'Requires mature stream ops (state, exactly-once, upgrades).',
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
              question: 'What is Kappa Architecture in one sentence?',
              answer:
                'A **single streaming pipeline** processes live events and **replays the log** for historical recompute — eliminating the separate batch layer of Lambda.',
            },
            {
              question: 'How does replay replace the batch layer?',
              answer:
                'Reset consumer to **earliest offset** (or a timestamp) and run the **same stream job** over all retained events. Output rebuilds materialized views from scratch — functionally equivalent to batch recompute.',
            },
            {
              question: 'Kappa vs Lambda — main trade-off?',
              answer:
                'Kappa trades **replay time and stream complexity** for **ops simplicity** (one pipeline). Lambda trades **dual maintenance** for **faster batch snapshots** on massive history.',
            },
            {
              question: 'What retention do you need for Kappa?',
              answer:
                'Kafka retention must cover **replay window** — days to forever depending on compliance. Tiered storage (S3) extends cheap retention; compacted topics for changelog state.',
            },
            {
              question: 'How do you deploy a breaking change in Kappa?',
              answer:
                'Run **v2 job** from earliest → new sink, dual-write or compare, switch reads when v2 catches up, delete v1. Blue-green for stream processors.',
            },
            {
              question: 'Design Kappa for search click analytics.',
              answer:
                'Clicks → Kafka `search-clicks`. Flink aggregates CTR by query/hour to Pinot. Ranking team changes attribution logic → replay last 90 days from offset 0 into `query_stats_v2`, validate, swap dashboard source.',
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
          body: '1. **One streaming layer** + **log replay** replaces Lambda\'s batch path.\n2. Immutable **event log** is the foundation for live and historical views.\n3. Real uses: **search analytics, recommendations, fraud sessionization**.\n4. Simpler ops than Lambda; watch **replay cost** at scale.',
        },
      ],
    },
  ],
};

export default content;
