import{a as e}from"./chunk-XY6XL33I.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**A/B Testing for Models** splits users (or requests) between **model variants** and measures **business outcomes** with statistical rigor. Unlike offline benchmarks, A/B answers \u201Cdid variant B improve **food delivery ETA accuracy** or **order completion rate**?\u201D \u2014 not just \u201Cdid AUC go up?\u201D Proper design covers **randomization**, **sample size**, **guardrail metrics**, and **statistical significance** before declaring a winner."},{type:"callout",variant:"info",title:"Core idea",body:"Treat each model version as an **experiment arm**. Same user always sees the same arm (sticky bucketing). Primary metric = business KPI; secondary = model metrics (MAE, AUC). Stop early only with sequential testing discipline."},{type:"table",caption:"Experiment design checklist.",headers:["Element","Example \u2014 ETA model A/B"],rows:[["Unit of randomization","user_id (sticky), not per-request"],["Primary KPI","Mean absolute ETA error (minutes)"],["Guardrails","Cancel rate, support tickets, p99 API latency"],["Duration / N","Power analysis \u2192 ~2 weeks, 500k active users"],["Success rule","p < 0.05 and \u22651 min MAE improvement, guardrails OK"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **food delivery app** testing two ETA algorithms: half of customers see \u201C25 min\u201D from model A, half from model B. After two weeks, compare **actual arrival vs promise** \u2014 the model that lied less wins, even if its internal loss function looked worse in the lab."},{type:"mermaid",caption:"Sticky user split between model A and model B.",definition:`flowchart TB
  U[User opens order tracking] --> HASH[hash user_id mod 100]
  HASH -->|0-49| MA[Model A ETA v3]
  HASH -->|50-99| MB[Model B ETA v4]
  MA --> UI[Show ETA to user]
  MB --> UI
  UI --> EVT[Log predicted + actual delivery time]
  EVT --> ANAL[Analyst: MAE, cancel rate by arm]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Food delivery ETA","Compare LSTM vs gradient boosting on MAE and late-order rate"],["Recommendations","Watch-through rate: collaborative filter vs neural rec"],["Search ranking","Interleaving or side-by-side bucket on click-through"],["Ads CTR","Holdout bucket for new bid model \u2014 RPM primary"],["Fraud","Block rate vs false decline rate \u2014 careful with revenue guardrails"],["Pricing","Elasticity model variants on conversion and margin"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Use **consistent hashing** on `user_id` for sticky assignment. Log `experiment_id`, `arm`, `model_version`, and outcome events to the warehouse. Run **power analysis** before launch; monitor **guardrails** daily; avoid peeking without correction unless using sequential tests."},{type:"code",language:"python",filename:"model_ab_assignment.py",code:`import hashlib
from dataclasses import dataclass

EXPERIMENT_ID = "eta_model_v4_vs_v3"
SALT = "2026-q3-eta"

@dataclass
class ExperimentArm:
    name: str
    model_version: str

ARMS = {
    "control": ExperimentArm("control", "eta_v3"),
    "treatment": ExperimentArm("treatment", "eta_v4"),
}

def assign_arm(user_id: str) -> ExperimentArm:
    bucket = int(hashlib.sha256(f"{SALT}:{user_id}".encode()).hexdigest(), 16) % 100
    return ARMS["treatment"] if bucket >= 50 else ARMS["control"]

def predict_eta(user_id: str, order_features: dict) -> dict:
    arm = assign_arm(user_id)
    eta_minutes = model_registry.predict(arm.model_version, order_features)
    analytics.log({
        "experiment_id": EXPERIMENT_ID,
        "user_id": user_id,
        "arm": arm.name,
        "model_version": arm.model_version,
        "predicted_eta_min": eta_minutes,
    })
    return {"eta_minutes": eta_minutes, "arm": arm.name}

# Offline analysis: Welch t-test on per-user MAE, check guardrail CIs`},{type:"callout",variant:"warning",title:"Anti-pattern",body:"Per-request randomization for ETA \u2014 same user sees 20 min then 35 min on refresh, destroying trust and contaminating metrics. **Sticky bucketing** is mandatory for user-facing models."},{type:"prosCons",title:"Trade-offs",pros:["Measures **real business impact** offline metrics miss.","Enables confident ship/ no-ship decisions with guardrails.","Industry-standard for product and ML alignment."],cons:["Requires **traffic volume** and time \u2014 slow for B2B or rare events.","Bad experiments (Simpson\u2019s paradox, novelty effects) mislead teams.","Running many overlapping tests needs experiment platform discipline."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Why A/B test models instead of trusting offline AUC?",answer:"Offline metrics ignore **production feedback loops**, feature skew, and **business KPIs** (ETA error, revenue). A/B measures what users and the business actually experience."},{question:"User-level vs request-level randomization?",answer:"**User-level (sticky)** for consistent UX and cumulative outcomes (retention). **Request-level** only when each request is independent (e.g. stateless ranking of anonymous catalog browse)."},{question:"What are guardrail metrics?",answer:"Metrics that must **not regress** \u2014 latency, error rate, cancel rate, revenue. Treatment can win primary KPI but fail guardrails \u2192 no launch."},{question:"How long to run a model A/B test?",answer:"Until **precomputed sample size** reached for desired MDE, covering full **weekly seasonality** (often 1\u20134 weeks). Avoid stopping at first significant p-value (peeking bias)."},{question:"A/B vs multi-armed bandit for models?",answer:"**A/B**: fixed split, clean causal read for launch decisions. **Bandit**: adaptive traffic to winner \u2014 better for optimization, worse for rigorous one-time evaluation."},{question:"Example primary KPI for food delivery ETA model?",answer:"**Mean absolute error** between predicted and actual delivery time, plus **% orders late > 5 min** \u2014 not RMSE on training set alone."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Model A/B tests optimize **business KPIs**, not offline AUC alone.
2. **Sticky user bucketing** + power analysis + guardrails.
3. Real uses: **food delivery ETA**, recommendations, ads CTR.
4. Log experiment metadata with every prediction for warehouse analysis.`}]}]},i=t;export{i as default};
