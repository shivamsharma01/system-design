import{a as e}from"./chunk-TY5OJYNC.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Online Model Serving** pattern exposes trained models through a **low-latency inference API** so applications can score requests in real time \u2014 fraud checks at checkout, search re-ranking, or ad bid adjustments. Serving runtimes like **TensorFlow Serving**, **TorchServe**, or a thin **FastAPI** wrapper load model artifacts, manage versions, and optimize throughput with **dynamic batching** while meeting **p99 latency** SLOs."},{type:"callout",variant:"info",title:"Core idea",body:"Separate **training** (batch, heavy) from **serving** (online, fast). The serving layer is a production microservice: load models, batch requests, enforce timeouts, and expose health and metrics."},{type:"table",caption:"Online vs batch inference.",headers:["Dimension","Online serving","Batch inference"],rows:[["Latency","Milliseconds to low seconds (p99 SLO)","Minutes to hours"],["Trigger","Per user request / event","Scheduled job or backfill"],["Example","Real-time fraud score at payment","Nightly recommendation precompute"],["Scaling","Horizontal pods + GPU/CPU autoscale","Spark/Beam cluster size"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **fraud analyst at a checkout counter**: every card swipe must get a yes/no in under 200 ms \u2014 you cannot send the transaction to a warehouse overnight. The analyst (model server) keeps the rulebook loaded, handles a queue of customers (batching), and escalates only when the line would miss SLA (timeouts)."},{type:"mermaid",caption:"Request path through an online model server with optional dynamic batching.",definition:`sequenceDiagram
  participant App as Checkout API
  participant GW as Model Gateway
  participant S as TensorFlow Serving
  participant GPU as GPU / CPU workers
  App->>GW: POST /predict {features}
  GW->>S: gRPC Predict (model v3)
  Note over S: dynamic batch window ~5ms
  S->>GPU: batched forward pass
  GPU-->>S: scores
  S-->>GW: probabilities
  GW-->>App: {fraud_score: 0.02, p99_ok}`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Fraud detection","Stripe/Risk \u2014 score payment in <100 ms before auth"],["Search ranking","Google/Bing \u2014 re-rank top-100 candidates per query"],["Recommendations","Netflix home row \u2014 blend online + cached batch scores"],["Ads CTR","Real-time bid adjustment using click propensity model"],["Computer vision","Moderation API \u2014 classify uploaded image synchronously"],["NLP","Support ticket routing \u2014 classify intent on ticket create"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Deploy model artifacts (SavedModel, TorchScript, ONNX) behind a **versioned endpoint**. Use **dynamic batching** to improve GPU utilization without blocking single low-latency requests. Track **p50/p99 latency**, **queue depth**, and **error rate**; set hard **timeouts** so slow inference never blocks checkout."},{type:"code",language:"python",filename:"fastapi_serving.py",code:`from fastapi import FastAPI, HTTPException
import httpx, time, os

app = FastAPI()
TF_SERVING = os.environ["TF_SERVING_URL"]  # e.g. tensorflow-serving:8501
MODEL_NAME = "fraud_detector"
TIMEOUT_MS = 80

@app.post("/v1/predict")
async def predict(payload: dict):
    start = time.perf_counter()
    features = payload["features"]  # same schema as training
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_MS / 1000) as client:
            resp = await client.post(
                f"{TF_SERVING}/v1/models/{MODEL_NAME}:predict",
                json={"instances": [features]},
            )
            resp.raise_for_status()
    except httpx.TimeoutException:
        # fail open or closed per risk policy
        return {"score": None, "decision": "REVIEW", "reason": "TIMEOUT"}
    score = resp.json()["predictions"][0]["fraud_prob"]
    elapsed_ms = (time.perf_counter() - start) * 1000
    return {
        "score": score,
        "decision": "BLOCK" if score > 0.85 else "ALLOW",
        "latency_ms": elapsed_ms,
    }`},{type:"callout",variant:"warning",title:"Anti-pattern",body:"Loading the full training pipeline (Spark joins, Python UDFs) inside the request path. Online serving must use **precomputed features** from a cache or feature store \u2014 not rebuild features from raw logs per request."},{type:"prosCons",title:"Trade-offs",pros:["Enables real-time decisions (fraud, ranking, personalization).","Dedicated runtimes optimize inference (batching, GPU, graph fusion).","Versioned endpoints support safe rollouts and rollbacks."],cons:["Strict latency budgets limit model complexity and feature richness.","GPU capacity is expensive \u2014 batching tuning is operational work.","Cold starts and model reloads can spike p99 during deploys."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"How do you meet a 100 ms p99 inference SLO?",answer:"Precompute features (Redis/feature store), use a **warm model server**, enable **dynamic batching** with small max delay (~2\u201310 ms), set **timeouts**, scale horizontally, and keep the model small or distilled for the hot path."},{question:"What is dynamic batching?",answer:"The server **waits briefly** to group concurrent single requests into one GPU forward pass, improving throughput. Trade-off: adds a few ms latency vs higher utilization."},{question:"TensorFlow Serving vs custom FastAPI wrapper?",answer:"TF Serving / TorchServe give **version management**, batching, and gRPC out of the box. FastAPI is fine for thin orchestration, feature lookup, and business rules \u2014 often both layers exist."},{question:"Online serving vs batch inference \u2014 when each?",answer:"**Online** when the decision must happen now (fraud at checkout). **Batch** when latency is flexible and volume is huge (nightly \u201Cusers who may churn\u201D list). Many systems combine both."},{question:"How do you deploy a new model version safely?",answer:"Blue/green or canary on the serving endpoint, **shadow traffic** first, compare latency and prediction drift, then shift traffic. Keep previous version loaded for instant rollback."},{question:"What metrics do you monitor?",answer:"**p50/p99 latency**, QPS, error rate, GPU utilization, batch size, prediction distribution drift, and business outcomes (fraud catch rate, false positive rate)."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Online serving is a **production API** with latency SLOs, not a notebook export.
2. Use **TF Serving / TorchServe** + precomputed features; avoid heavy ETL on the request path.
3. **Dynamic batching** balances throughput and p99.
4. Real uses: **fraud scoring, search ranking, ads CTR** at request time.`}]}]},i=t;export{i as default};
