import{a as e}from"./chunk-XKWLJ2DL.js";import"./chunk-IFGU66OU.js";var o={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Champion-Challenger** pattern keeps a **production champion model** serving users while one or more **challenger models** run in shadow or on a held-out slice. Teams compare **offline and online metrics** \u2014 for ads, CTR and revenue per mille, not just AUC \u2014 and **promote** the challenger to champion only when it wins on pre-defined gates."},{type:"callout",variant:"info",title:"Core idea",body:"Always know **who is in prod** (champion) and **who is being evaluated** (challenger). Promotion is a **governed decision** with metric thresholds, not \u201Cnew model shipped Friday.\u201D"},{type:"table",caption:"Champion vs challenger roles.",headers:["Role","Traffic","Purpose"],rows:[["Champion","100% production decisions (or A/B control)","Current best known model"],["Challenger","Shadow or small canary slice","Candidate for promotion"],["Retired","None \u2014 artifact archived","Rollback reference"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"**Ads CTR optimization** like a boxing title fight: the **champion** defends the belt (serves impressions). The **challenger** trains in public undercard bouts (shadow/canary). Judges score on **revenue and CTR**, not gym stats (offline AUC alone) \u2014 belt changes only on a clear win."},{type:"mermaid",caption:"Champion serves users; challenger accumulates comparison metrics.",definition:`flowchart LR
  REQ[Ad impression request] --> CH[Champion CTR v9]
  CH --> SERVE[Bid + render ad]
  REQ --> CL[Challenger CTR v10 shadow]
  CL --> MET[Metrics store]
  CH --> MET
  MET --> DASH[Promotion dashboard]
  DASH -->|v10 wins on CTR + RPM| PROMOTE[Promote v10 to champion]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Ads CTR","Champion logistic regression vs challenger deep CTR \u2014 promote on RPM"],["Credit scoring","Regulatory champion; challenger must beat Gini + fairness bounds"],["Fraud","Champion on block/allow; challenger compared on precision at fixed recall"],["Recommendations","Champion matrix factorization vs challenger two-tower on watch-through"],["Insurance pricing","Champion GLM vs challenger GBM with actuarial sign-off"],["Search ranking","Champion LambdaMART vs challenger on interleaving metrics"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Register models in a **model registry** with stage labels (`Champion`, `Challenger`). Shadow or canary the challenger; aggregate metrics in **Prometheus/Snowflake** with `model_id` dimension. Promotion workflow: automated gate check + human approval for high-risk domains."},{type:"code",language:"yaml",filename:"promotion-policy.yaml",code:`# Champion-challenger promotion gates \u2014 ads CTR example
champion:
  model_id: ctr_model_v9
  since: 2026-05-01

challenger:
  model_id: ctr_model_v10
  mode: shadow  # or canary_percent: 5

evaluation_window_days: 14
minimum_impressions: 5_000_000

promotion_criteria:
  - metric: ctr_lift_vs_champion
    operator: '>='
    threshold: 0.005        # +0.5% relative CTR
  - metric: rpm_lift_vs_champion
    operator: '>='
    threshold: 0.01           # +1% revenue per mille
  - metric: p99_latency_ms
    operator: '<='
    threshold: 25
  - metric: shadow_error_rate
    operator: '<='
    threshold: 0.001

on_promote:
  - set_registry_stage: Production
  - demote_previous_to: Archived
  - alert_slack: ml-ads-oncall`},{type:"callout",variant:"warning",title:"Anti-pattern",body:"Promoting challenger because **offline AUC +0.002** without online RPM/CTR validation. Ads models often trade calibration for AUC \u2014 business metrics decide."},{type:"prosCons",title:"Trade-offs",pros:["Structured, auditable model lifecycle (finance/regulated industries).","Clear rollback \u2014 previous champion artifact retained.","Combines well with shadow and canary patterns."],cons:["Governance overhead slows iteration for low-risk models.","Multiple challengers multiply infra and comparison complexity.","Metric gaming if promotion KPIs are too narrow."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Champion-challenger vs A/B testing?",answer:"**Champion-challenger** is the **operating model** (roles + promotion). **A/B** is often the **experiment method** to compare challenger vs champion on live KPIs. Shadow is another evaluation mode."},{question:"What metrics for ads CTR promotion?",answer:"**CTR, RPM, CPA**, latency, error rate \u2014 not AUC alone. Check slice stability (geo, device) and calibration for billing."},{question:"How many challengers at once?",answer:"Usually **one primary challenger** per champion to simplify causality. Multiple challengers need more traffic or shadow-only eval."},{question:"How do you demote a bad champion after promotion?",answer:"Keep **previous champion** artifact hot-swappable; registry stage flip + gateway route rollback in minutes; post-mortem on metric regression."},{question:"Champion-challenger without user traffic?",answer:"Use **shadow on 100% traffic** or **replay logs** through challenger \u2014 slower KPI feedback but still valid for fraud/ranking comparison."},{question:"Who approves promotion?",answer:"Automated gates for low-risk; **ML + product + compliance** sign-off for credit, health, or high-revenue ads surfaces."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. **Champion** serves prod; **challenger** proves it can win.
2. Promote on **business KPIs** (ads CTR/RPM), not offline AUC alone.
3. Use registry stages, metric gates, and retained rollback artifacts.
4. Pairs with **shadow deployment** and **canary** for safe eval.`}]}]},r=o;export{r as default};
