import{a as e}from"./chunk-43NQFFIC.js";import"./chunk-IFGU66OU.js";var a={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Model Registry** pattern is a central catalog for **ML model artifacts** \u2014 weights, metadata, metrics, and **lifecycle stages** (development \u2192 staging \u2192 production \u2192 archived). Tools like **MLflow Model Registry** and **SageMaker Model Registry** govern promotion, rollback, lineage, and audit for production ML."},{type:"callout",variant:"info",title:"Core idea",body:"Treat models like **versioned software releases**. Register every train run, attach evaluation evidence, promote through stages with approvals, and trace **which data and code** produced each version."},{type:"table",caption:"Typical lifecycle stages.",headers:["Stage","Purpose","Gate"],rows:[["Development","Experimentation, offline metrics","None \u2014 open to data scientists"],["Staging","Pre-prod validation, shadow traffic","Metric threshold + peer review"],["Production","Live inference traffic","Change advisory, canary deploy"],["Archived","Retired models kept for audit","Superseded by newer version"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **pharmacy drug approval pipeline**: lab formulations (dev) undergo clinical trials (staging) before FDA approval (production). Each batch has a **lot number** (version), **ingredient list** (training data lineage), and **shelf label** (metrics). You never swap patients' prescriptions to an untested compound without passing each gate \u2014 same discipline for fraud and recommendation models."},{type:"mermaid",caption:"Train \u2192 register \u2192 stage gates \u2192 production deploy.",definition:`flowchart LR
  Train[Training pipeline] --> Reg[Model Registry]
  Reg --> Dev[Stage: Development]
  Dev -->|metrics pass| Stg[Stage: Staging]
  Stg -->|canary OK| Prod[Stage: Production]
  Prod --> Serve[Inference endpoint]
  Stg -->|shadow compare| Eval[A/B evaluation]
  Prod -->|rollback| Arch[Archived versions]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["MLflow adopters","Registered models with `Production` alias on champion"],["AWS SageMaker","Model Registry + multi-account promotion pipelines"],["Fraud ML","GBM versions with chargeback AUC gates before prod"],["Recommendations","Ranking model lineage tied to feature set v3.2"],["Regulated credit","Audit trail: who approved model v14 to production"],["Vertex AI / W&B","Enterprise registries with RBAC and artifact storage"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"On each training run: log **parameters, metrics, artifacts** (MLflow), register model version, link **dataset hash and git commit**. Promotion workflow requires **staging evaluation** and optional manual approval. Inference service resolves `models:/fraud_detector/Production` alias."},{type:"code",language:"python",filename:"model_registry_flow.py",code:`import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()
MODEL_NAME = "fraud_gbm"

with mlflow.start_run() as run:
    mlflow.log_params({"max_depth": 6, "n_estimators": 200})
    mlflow.log_metrics({"auc": 0.94, "precision_at_1pct": 0.72})
    mlflow.set_tag("training_data", "s3://data/transactions/v2026-07")
    mlflow.set_tag("git_commit", "a1b2c3d")
    mlflow.sklearn.log_model(model, "model", registered_model_name=MODEL_NAME)

# Promote version 7 to Staging after offline eval
client.transition_model_version_stage(
    name=MODEL_NAME, version=7, stage="Staging", archive_existing_versions=False
)

# After canary passes in staging
client.transition_model_version_stage(
    name=MODEL_NAME, version=7, stage="Production", archive_existing_versions=True
)

# Serving loads Production alias
prod_model = mlflow.pyfunc.load_model(f"models:/{MODEL_NAME}/Production")`},{type:"callout",variant:"warning",title:"Registry without governance",body:"A registry that anyone can push to **Production** is just a folder. Enforce **RBAC**, required metrics, approval tickets, and automated canary analysis before stage transitions."},{type:"prosCons",title:"Trade-offs",pros:["Single source of truth for model versions and lineage.","Safe rollback to previous production version.","Audit compliance for regulated ML deployments."],cons:["Process overhead for small teams and experiments.","Registry metadata can drift from actual deployed endpoint.","Multi-cloud setups need federated or duplicated registries."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What belongs in a model registry entry?",answer:"**Artifact** (pickle/ONNX), **version**, **metrics**, **hyperparameters**, **training data reference**, **code commit**, **feature schema**, **stage**, and **approver** metadata."},{question:"Dev \u2192 staging \u2192 prod gates?",answer:"**Dev**: offline beat baseline. **Staging**: integration tests, shadow traffic, no user impact. **Prod**: canary + approval + monitoring dashboards armed."},{question:"MLflow Model Registry vs experiment tracking?",answer:"**Tracking** logs individual runs. **Registry** adds **named models, versions, stages, aliases** (`@champion`) for production lifecycle on top of those runs."},{question:"How do you rollback a bad production model?",answer:"Transition previous archived version back to **Production** (or swap alias), update inference endpoint config, verify metrics recover \u2014 registry makes this minutes, not days."},{question:"What is model lineage?",answer:"Traceability from **prediction** back to **model version**, **training data snapshot**, **feature pipeline version**, and **training code** \u2014 critical for debugging drift and compliance."},{question:"SageMaker Model Registry integration?",answer:"Pipeline train step registers package group version; approval Lambda promotes; endpoint deploy step pulls approved ARN. IAM separates data-science and prod accounts."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. **Version, stage, and promote** models like software releases.
2. Tools: **MLflow, SageMaker Model Registry** with lineage metadata.
3. Real uses: **fraud, recommendations, regulated credit**.
4. Pair registry with **canary deploy, RBAC, and rollback** runbooks.`}]}]},o=a;export{o as default};
