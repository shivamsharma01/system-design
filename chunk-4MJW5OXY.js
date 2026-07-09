import{a as e}from"./chunk-AC3CONW5.js";import"./chunk-IFGU66OU.js";var a={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Message Translator** converts messages between **different formats, schemas, or protocols** so systems with incompatible interfaces can communicate. It sits between producer and consumer \u2014 mapping fields, wrapping envelopes, or transforming XML to JSON \u2014 like an adapter at the messaging layer."},{type:"callout",variant:"info",title:"Core idea",body:"Each system speaks its own dialect. The translator is the **bilingual middleware** \u2014 consumers see messages in their expected shape without changing legacy publishers."},{type:"table",caption:"Translation types.",headers:["Type","Example"],rows:[["Format","SOAP XML \u2192 JSON REST event"],["Schema","Legacy `cust_id` \u2192 canonical `customerId` UUID"],["Protocol","IBM MQ message \u2192 Kafka record"],["Envelope","Wrap payload with metadata headers and schema version"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"An **airport interpreter** for international transfers: your domestic bank sends instructions in one form; the foreign bank needs SWIFT format. The translator rewrites the message \u2014 the money movement logic stays the same, only the language changes."},{type:"mermaid",caption:"Translator between incompatible systems.",definition:`flowchart LR
  L[Legacy ERP XML] --> T[Message Translator]
  T --> K[Modern Kafka JSON]
  K --> M[Microservice Consumer]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Banking integration","Mainframe COBOL copybook \u2192 ISO 20022 JSON"],["E-commerce","Shopify webhook \u2192 internal OrderPlaced domain event"],["Healthcare","HL7 v2 pipe message \u2192 FHIR resource"],["SAP / Oracle","IDoc or ERP export \u2192 cloud event schema"],["Kafka Connect","SMT (Single Message Transform) for field renames"],["API gateways","External partner format \u2194 internal canonical model"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Define a **canonical model** internally; translators map in and out. Use MapStruct, XSLT, or JSONata for declarative mapping. Version translations (`schemaVersion: 2`) and test golden fixtures \u2014 mapping bugs corrupt data silently."},{type:"code",language:"java",filename:"OrderTranslator.java",code:`@Component
public class OrderTranslator {
  public CanonicalOrderEvent toCanonical(LegacyOrderXml legacy) {
    return new CanonicalOrderEvent(
        UUID.fromString(legacy.getCustId()),
        legacy.getOrderNo(),
        legacy.getLines().stream().map(this::toLine).toList(),
        Instant.parse(legacy.getCreatedAt())
    );
  }

  public PartnerWebhookPayload toPartner(CanonicalOrderEvent event) {
    return PartnerWebhookPayload.builder()
        .externalId(event.orderId().toString())
        .customerRef(event.customerId().toString())
        .totalCents(event.totalCents())
        .build();
  }
}

// Kafka Connect SMT example conceptually:
// transforms=RenameField$Value, InsertField$Value
// transforms.RenameField.type=org.apache.kafka.connect.transforms.RenameField$Value
// transforms.RenameField.renames=cust_id:customerId`},{type:"callout",variant:"warning",title:"Lossy translation",body:"Not every legacy field maps cleanly. Document **defaults, nulls, and dropped fields**. Invalid translations should go to **DLQ**, not publish corrupt canonical events."},{type:"prosCons",title:"Trade-offs",pros:["Integrates legacy without big-bang rewrites.","Centralizes mapping rules away from business logic.","Enables gradual migration to canonical schemas."],cons:["Translator becomes maintenance burden on schema changes.","Hard to debug subtle field mapping errors.","Extra hop adds latency and failure point."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Message Translator vs Adapter pattern?",answer:"**Adapter** (GoF) wraps an object interface. **Message Translator** is the integration pattern for **async message** format conversion \u2014 same spirit, messaging context."},{question:"Where should translation happen?",answer:"At the **boundary** \u2014 anti-corruption layer in DDD. Legacy adapter publishes canonical events inward; outward translators for partners."},{question:"Canonical model \u2014 why bother?",answer:"Avoid **N\xD7M mappings** (every pair of systems). Each system maps to one hub format \u2014 N+M translators instead of N\xD7M."},{question:"How do you test translators?",answer:"Golden file tests: input fixture \u2192 expected output. Regression on every schema bump; property tests for round-trip when bidirectional."},{question:"Kafka Connect vs custom translator service?",answer:"Connect + SMT for simple field ops at scale. Custom service when logic is complex (enrichment, branching, calls to reference data)."},{question:"Envelope wrapper pattern?",answer:"Wrap payload: `{ type, version, traceId, payload }`. Translator unwraps legacy, re-wraps in standard envelope for downstream consumers."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Convert **message format/schema** between incompatible systems.
2. Use a **canonical model** at the hub; map at boundaries.
3. Real uses: **legacy ERP, webhooks, HL7, Kafka Connect SMT**.
4. Test mappings rigorously; route bad transforms to **DLQ**.`}]}]},n=a;export{n as default};
