import{a as e}from"./chunk-JXJ2BPLX.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Model Gateway** pattern provides a **unified inference entry point** for all ML models in an organization. Clients call one API; the gateway **routes by model id and version**, enforces **authentication**, **rate limits**, and **timeouts**, and observability tags every request. It decouples product teams from the layout of dozens of TensorFlow Serving, TorchServe, and custom FastAPI backends."},{type:"callout",variant:"info",title:"Core idea",body:"Like an **API gateway** for microservices, but ML-aware: route `fraud_detector:v5` vs `search_ltr:v12`, normalize request/response schemas, and centralize SLO enforcement."},{type:"table",caption:"Gateway responsibilities.",headers:["Concern","Gateway handles"],rows:[["Routing","model_id + version \u2192 backend cluster"],["Security","OAuth2/API keys, mTLS to backends"],["Resilience","Timeouts, retries (idempotent), circuit breakers"],["Observability","Per-model latency, QPS, error dashboards"],["Policy","Rate limits per tenant; payload size caps"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **hotel concierge desk**: guests (product APIs) ask once at the front desk for \u201Cfraud check,\u201D \u201Csearch rank,\u201D or \u201Cad bid.\u201D The concierge routes to the right specialist (model backend), enforces visiting hours (timeouts), and logs every request \u2014 guests never wander the building finding the right office."},{type:"mermaid",caption:"Single gateway routes to multiple model backends.",definition:`flowchart LR
  C1[Checkout API] --> GW[Model Gateway]
  C2[Search API] --> GW
  C3[Ads bidder] --> GW
  GW -->|fraud:v5| F[Fraud TF Serving]
  GW -->|ltr:v12| S[Search TorchServe]
  GW -->|ctr:v9| A[Ads FastAPI]
  GW --> OBS[Metrics / Auth / Rate limit]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Multi-model platforms","Uber Michelangelo-style unified predict API"],["Fraud + payments","One gateway for card fraud, ACH risk, and KYC models"],["Search + ads","Route query ranking and ad CTR models from shared search stack"],["Internal MLOps","Data scientists deploy backends; gateway is stable client contract"],["Edge + cloud","Gateway at region edge with backend federation"],["Vendor abstraction","Swap SageMaker vs self-hosted without client code changes"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Expose `POST /v1/models/{model_id}/versions/{version}:predict` (or header-based routing). Maintain a **routing table** (ConfigMap / service discovery) mapping to backend URLs. Apply **global timeout** (e.g. 100 ms fraud, 500 ms search). Emit metrics with labels `model_id`, `version`, `tenant`."},{type:"code",language:"yaml",filename:"model-gateway-routes.yaml",code:`# Envoy / Kong-style route config (illustrative)
routes:
  - match:
      model_id: fraud_detector
      version: v5
    backend: http://fraud-tfserving.ml.svc:8501
    timeout_ms: 80
    auth: required
    rate_limit_rpm: 60000

  - match:
      model_id: search_ltr
      version: v12
    backend: http://search-torchserve.ml.svc:8080
    timeout_ms: 200
    auth: required

  - match:
      model_id: ads_ctr
      version: v9
    backend: http://ads-inference.ml.svc:8000
    timeout_ms: 50
    auth: required

defaults:
  retry_policy: none          # inference is not idempotent by default
  circuit_breaker:
    consecutive_errors: 10
    open_duration_sec: 30
  request_max_bytes: 65536

observability:
  metrics_prefix: ml_gateway_
  trace_header_propagate: true`},{type:"callout",variant:"warning",title:"Anti-pattern",body:"Gateway that **retries POST predict** on timeout \u2014 doubles load during incidents and may return inconsistent scores. Prefer **fail fast**, fallback model, or async queue \u2014 not blind retries."},{type:"prosCons",title:"Trade-offs",pros:["Single client SDK and auth story across all models.","Central SLO, rate limit, and routing for canary/shadow.","Hides backend churn from product engineering teams."],cons:["Additional hop adds latency \u2014 keep gateway lean (avoid heavy transforms).","Becomes critical path \u2014 requires HA and careful capacity planning.","Feature transformation belongs in feature store, not bloated gateway."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Model gateway vs calling TensorFlow Serving directly?",answer:"Direct calls work for one team/one model. **Gateway** scales when many clients need many models with unified **auth, routing, limits, and metrics**."},{question:"How does routing by model version support canary?",answer:"Route `v12` 95% to stable backend, `v13` 5% to canary \u2014 or header override for internal tests. Clients still call same gateway URL."},{question:"Where do feature lookups happen?",answer:"Usually **before** gateway (app + feature store) or in a **sidecar BFF** \u2014 gateway focuses on **inference routing**, not heavy ETL."},{question:"What timeouts per model type?",answer:"**Fraud/payment**: 50\u2013100 ms hard cap. **Search LTR**: 100\u2013300 ms. **Batch-like enrichments**: async. Set per-route in gateway config."},{question:"Gateway vs service mesh?",answer:"**Mesh** (Istio) handles L4/L7 between services. **Model gateway** adds ML semantics \u2014 model id/version schema, per-model SLO dashboards. Often **both**: mesh mTLS, gateway ML API."},{question:"How to handle model not found?",answer:"Return **404 with clear error** (unknown model_id/version), alert registry drift, and never route to a default model silently for high-risk domains like fraud."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. **One front door** for all inference \u2014 route by model id/version.
2. Centralize **auth, timeouts, rate limits, metrics**.
3. Enables **canary/shadow** without client redeploys.
4. Keep gateway thin; features live in **feature store**, not gateway.`}]}]},r=t;export{r as default};
