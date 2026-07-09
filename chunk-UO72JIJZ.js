import{a as e}from"./chunk-GOV54S7R.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Chaos Engineering** is the practice of running **controlled experiments** that inject failures into a system to learn whether it meets resilience hypotheses. You break things on purpose \u2014 carefully \u2014 so production surprises become rare."},{type:"callout",variant:"info",title:"Scientific method",body:"State a hypothesis (\u201Cif Redis dies, checkout still works via cache/DB\u201D), inject fault, measure, improve. Chaos without hypotheses and blast-radius limits is just vandalism."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"Fire drills and earthquake drills: you practice failure when stakes are controlled so the real emergency is not the first time people discover the exits are locked."},{type:"mermaid",caption:"Hypothesis \u2192 inject \u2192 observe \u2192 improve.",definition:`flowchart LR
  H[Hypothesis] --> I[Inject fault]
  I --> O[Observe SLOs]
  O --> F{Holds?}
  F -->|yes| C[Increase confidence]
  F -->|no| Fix[Fix gaps] --> H`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Netflix heritage","Chaos Monkey terminating instances"],["Kubernetes","Chaos Mesh, LitmusChaos experiments"],["SaaS platforms","Gremlin, AWS FIS fault injection"],["Game days","Team exercises with scripted failure scenarios"],["CI / staging","Automated pod-kill and network latency tests"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Start small: kill one non-critical pod in staging, then graduate to production with strict abort conditions."},{type:"code",language:"yaml",filename:"pod-kill.experiment.yaml",code:`# Conceptual Chaos Mesh style experiment
kind: PodChaos
metadata:
  name: checkout-pod-kill
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces:
      - payments
    labelSelectors:
      app: checkout
  duration: "30s"
# Abort if checkout error rate > 1% during the window`},{type:"bestPractices",practices:["Define **blast radius** (one AZ, one service, % of traffic).","Require **observability** and a kill switch before production chaos.","Run during business-ready hours with on-call aware.","Track learnings as reliability backlog items, not theater."]},{type:"prosCons",title:"Trade-offs",pros:["Surfaces hidden single points of failure.","Validates timeouts, retries, and degradation for real.","Builds operational muscle memory."],cons:["Risk of customer impact if poorly controlled.","Needs mature monitoring and culture.","Easy to cargo-cult without fixing findings."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is chaos engineering?",answer:"Running **controlled failure experiments** to verify that a system behaves as expected under adverse conditions, guided by hypotheses and limited blast radius."},{question:"Is randomly killing pods enough?",answer:"Killing pods is one experiment. Mature chaos also injects **latency, packet loss, disk full, dependency errors**, and verifies business SLOs \u2014 not just \u201Cdid the pod restart.\u201D"},{question:"How does it relate to resilience patterns?",answer:"Chaos **tests** whether timeouts, circuit breakers, bulkheads, and graceful degradation actually work under failure \u2014 it does not replace those patterns."},{question:"When should you start chaos in production?",answer:"After staging success, with strong metrics, abort criteria, and stakeholder buy-in. Many teams begin with game days and non-critical services."},{question:"Famous example?",answer:"Netflix **Chaos Monkey** (and the Simian Army) popularized continuously terminating instances to enforce instance-level resilience."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Chaos = **hypothesis-driven fault injection**.
2. Limit blast radius; abort on SLO burn.
3. Real uses: **Chaos Monkey, Chaos Mesh, game days**.
4. Use findings to harden resilience patterns.`}]}]},s=t;export{s as default};
