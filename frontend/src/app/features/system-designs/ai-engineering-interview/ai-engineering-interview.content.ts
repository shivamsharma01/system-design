import { DesignContent } from '../../../shared/models';
import { AI_ENGINEERING_INTERVIEW_META } from './ai-engineering-interview.meta';

const content: DesignContent = {
  meta: AI_ENGINEERING_INTERVIEW_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'These questions cover the production concerns behind modern AI systems: grounding models with enterprise data, integrating them into Java services, controlling agent behavior, and operating the resulting system securely at scale.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'A strong interview answer',
          body: 'Explain the **decision and trade-off**, then cover **failure modes, security, and production signals**. An LLM demo is easy; a bounded, observable, and trustworthy AI product is the engineering challenge.',
        },
      ],
    },
    {
      id: 'rag-platform',
      title: 'RAG, Models, and Retrieval',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'RAG and Vector Search Q&A',
          items: [
            {
              question:
                'What is RAG, and why is it better than sending the entire document to an LLM?',
              answer:
                '**Retrieval-Augmented Generation (RAG)** retrieves a small set of relevant passages from an external knowledge source and includes those passages in the model prompt. A typical flow is: ingest documents → chunk them → create embeddings → index them → retrieve candidates → rerank → generate an answer with citations.\n\nSending an entire document wastes tokens, increases latency and cost, may exceed the context window, and can dilute relevant facts among unrelated text. RAG gives the model focused, current, access-controlled context without retraining it. It is not automatically better for every input: a short document may fit comfortably, and retrieval can miss context split across chunks. Measure retrieval recall and answer faithfulness rather than assuming RAG fixes hallucinations.',
            },
            {
              question: 'Which vector database would you choose, and why?',
              answer:
                'There is no universally best vector database. Start from scale, filtering, consistency, operational ownership, latency, tenancy, and existing infrastructure.\n\n- **PostgreSQL with pgvector:** strong default when vectors belong beside relational data, metadata filtering and transactions matter, and the existing Postgres scale is sufficient.\n- **Pinecone:** managed operations and rapid delivery when a specialized hosted service is acceptable.\n- **Qdrant or Weaviate:** purpose-built vector search, rich filtering, and self-hosted or managed options.\n- **Milvus:** very large vector workloads where the team can operate a distributed specialized system.\n- **Elasticsearch/OpenSearch:** useful when hybrid lexical + vector search and an existing search platform are central.\n\nBenchmark with representative embeddings, filters, index sizes, update rates, and recall targets. Evaluate hybrid search, namespace isolation, backups, data residency, cost, and operational complexity—not only nearest-neighbor latency.',
            },
            {
              question: 'How do you reduce hallucinations in production AI applications?',
              answer:
                'Use several controls because no single prompt eliminates hallucinations:\n\n1. **Grounding:** retrieve authoritative, fresh sources and require citations to the supplied evidence.\n2. **Retrieval quality:** improve chunking, metadata filters, hybrid search, query rewriting, and reranking; allow the system to say “insufficient evidence.”\n3. **Constrained output:** use schemas, validators, deterministic calculations/tools, low temperature where appropriate, and explicit scope instructions.\n4. **Verification:** check citations, business rules, and high-risk claims; route sensitive decisions to a human.\n5. **Evaluation:** maintain golden datasets and measure retrieval recall, faithfulness, factuality, refusal quality, and regressions for each model/prompt/index change.\n\nFine-tuning can improve behavior or format, but it is usually not the right mechanism for frequently changing factual knowledge.',
            },
            {
              question: 'What are the key components of an enterprise RAG architecture?',
              answer:
                'An enterprise RAG platform normally has two paths.\n\n**Offline ingestion:** source connectors, parsing/OCR, normalization, classification and PII handling, semantic chunking, metadata and ACL extraction, embedding generation, vector/lexical indexes, versioning, and deletion propagation.\n\n**Online serving:** API gateway and identity, query policy checks, query rewriting, hybrid retrieval, tenant/ACL filtering, reranking, prompt assembly, model gateway, output validation, citations, caching, and response streaming.\n\n**Platform controls:** model and embedding versioning, prompt registry, evaluation datasets, tracing, cost/latency monitoring, audit logs, secrets management, rate limits, feedback, and replay. Preserve document lineage from each generated claim back to source, version, and permission decision.',
            },
          ],
        },
      ],
    },
    {
      id: 'java-agents-mcp',
      title: 'Spring AI, MCP, and Agents',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Java AI Integration Q&A',
          items: [
            {
              question: 'How does Spring AI simplify LLM integration in Java applications?',
              answer:
                'Spring AI provides Spring-style abstractions over model providers so application code is less coupled to one vendor. Its APIs cover chat and embedding models, `ChatClient`, structured output mapping, prompt templates, tool calling, conversation memory, document readers, text splitters, vector stores, and RAG advisors. Spring Boot auto-configuration supplies clients and settings through familiar properties and dependency injection.\n\nThis reduces provider-specific HTTP and JSON plumbing and makes cross-cutting behavior easier to compose. It does not make providers identical: context limits, tool semantics, streaming, safety behavior, and model quality still differ. Keep provider-specific capabilities behind an application-owned interface and test prompts and structured outputs against the models actually deployed.',
            },
            {
              question: 'What is the Model Context Protocol (MCP), and when should you use it?',
              answer:
                '**MCP** is an open protocol for exposing tools, resources, and reusable prompts from an MCP server to an AI host through a standard client-server contract. It separates the agent or chat application from one-off integration code and supports capability discovery and structured tool inputs/results.\n\nUse it when multiple AI clients should reuse the same governed integration, when tools need independent deployment, or when a standard connector boundary is more valuable than a private SDK. A database, ticketing, source-control, or internal knowledge integration can be exposed once and consumed by several hosts.\n\nDo not add MCP merely to wrap one local function. It introduces another trust boundary: authenticate clients, authorize every operation, validate inputs, restrict filesystem/network scope, protect against prompt injection, log calls, apply timeouts, and require confirmation for destructive actions.',
            },
            {
              question: 'How do AI Agents differ from traditional LLM workflows?',
              answer:
                'A traditional workflow has a mostly predetermined control flow: the application decides which step runs next, and the model fills bounded roles such as classify, extract, or summarize. An **agent** is given a goal and chooses actions dynamically, using tools, observing results, updating state, and iterating until a stop condition is reached.\n\nAgents handle open-ended tasks and unexpected intermediate results, but they add nondeterminism, latency, cost, and security risk. Prefer a deterministic workflow when the path is known; use agentic decisions only where runtime judgment creates real value. Bound agents with typed tools, least privilege, step/time/token budgets, idempotency, explicit termination, approval gates for high-impact actions, and a full execution trace. See [AI Agent vs Skill](/designs/ai-agent-skills#agent-vs-skill) for the related agent, skill, and tool distinction.',
            },
          ],
        },
      ],
    },
    {
      id: 'production',
      title: 'Security, Observability, and Scale',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Production AI Q&A',
          items: [
            {
              question: 'How do you secure AI applications handling sensitive enterprise data?',
              answer:
                'Apply normal application security plus AI-specific controls:\n\n- Authenticate users and propagate identity, tenant, purpose, and document ACLs into retrieval; never retrieve broadly and filter only after generation.\n- Minimize and classify data before prompts, redact/tokenize PII and secrets, encrypt in transit/at rest, isolate tenants, and enforce retention and deletion policies across source, index, cache, logs, and traces.\n- Use approved model endpoints with contractual no-training/no-retention terms, regional routing, private connectivity where needed, and strict egress controls.\n- Treat retrieved text and tool output as untrusted. Defend against prompt injection with instruction/data separation, tool allowlists, least privilege, input/output validation, and human approval for consequential writes.\n- Keep immutable audit records of user, sources, model/prompt version, tool calls, and policy decisions without leaking sensitive prompt content into telemetry.\n\nAlso threat-model model extraction, denial-of-wallet, insecure output handling, poisoned documents, and excessive agency.',
            },
            {
              question:
                'What monitoring and observability metrics should every AI application have?',
              answer:
                'Track the full request trace, not only model uptime:\n\n- **Reliability:** request/error/timeout rates, retries, rate-limit responses, fallback use, queue depth, and provider availability.\n- **Latency:** end-to-end and per-stage p50/p95/p99 for retrieval, reranking, first token, generation, and tool calls.\n- **Usage and cost:** input/output tokens, cached tokens, requests and cost by model, tenant, feature, and outcome.\n- **Retrieval quality:** no-result rate, candidate count, filter selectivity, recall/precision on evaluation sets, reranker scores, and stale-index lag.\n- **Answer quality and safety:** groundedness/faithfulness, citation validity, task success, schema-validation failures, refusals, policy violations, user feedback, and human escalation.\n- **Agents:** steps per run, tool success/error rate, repeated loops, budget exhaustion, approvals, and termination reason.\n\nAttach model, prompt, embedding, index, and experiment versions to traces. Use sampled/redacted payloads and controlled replay because raw prompts may contain sensitive data.',
            },
            {
              question: 'How would you design a scalable Java AI system for millions of users?',
              answer:
                'Place stateless Spring Boot APIs behind a gateway for authentication, quotas, and rate limiting. Keep orchestration asynchronous where possible: accept long-running jobs, publish them to a bounded queue, process with independently scalable workers, persist state, and stream progress/results with SSE or WebSockets. Use Spring AI behind an application-owned model gateway that handles provider routing, timeouts, retries with jitter, circuit breakers, concurrency limits, and fallbacks.\n\nSeparate document ingestion from online retrieval. Partition vector and lexical indexes by tenant or domain, apply ACL filters during retrieval, rerank a small candidate set, and cache safe results, embeddings, or retrieved context with version-aware keys. Store durable conversations and job state externally; keep service instances disposable.\n\nScale from measured bottlenecks: token throughput and provider quotas often constrain the system before CPU. Apply per-tenant budgets, backpressure, admission control, bulkheads, and graceful degradation to cheaper models or simpler workflows. Instrument every stage, evaluate model/prompt/index releases, canary them, and protect tool calls with idempotency and approval gates. Capacity planning must include peak requests, average tokens, retrieval QPS, model concurrency, latency targets, and cost per successful task.',
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
          title: 'Production design principles',
          body: 'Retrieve only authorized evidence, keep deterministic code in control where possible, bound every model or agent operation, version and evaluate the full pipeline, and observe quality and cost alongside latency and errors.',
        },
      ],
    },
  ],
};

export default content;
