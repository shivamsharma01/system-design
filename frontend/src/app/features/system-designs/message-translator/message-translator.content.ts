import { DesignContent } from '../../../shared/models';
import { MESSAGE_TRANSLATOR_META } from './message-translator.meta';

const content: DesignContent = {
  meta: MESSAGE_TRANSLATOR_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Message Translator** converts messages between **different formats, schemas, or protocols** so systems with incompatible interfaces can communicate. It sits between producer and consumer — mapping fields, wrapping envelopes, or transforming XML to JSON — like an adapter at the messaging layer.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: 'Each system speaks its own dialect. The translator is the **bilingual middleware** — consumers see messages in their expected shape without changing legacy publishers.',
        },
        {
          type: 'table',
          caption: 'Translation types.',
          headers: ['Type', 'Example'],
          rows: [
            ['Format', 'SOAP XML → JSON REST event'],
            ['Schema', 'Legacy `cust_id` → canonical `customerId` UUID'],
            ['Protocol', 'IBM MQ message → Kafka record'],
            ['Envelope', 'Wrap payload with metadata headers and schema version'],
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
          body: 'An **airport interpreter** for international transfers: your domestic bank sends instructions in one form; the foreign bank needs SWIFT format. The translator rewrites the message — the money movement logic stays the same, only the language changes.',
        },
        {
          type: 'mermaid',
          caption: 'Translator between incompatible systems.',
          definition: `flowchart LR
  L[Legacy ERP XML] --> T[Message Translator]
  T --> K[Modern Kafka JSON]
  K --> M[Microservice Consumer]`,
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
            ['Banking integration', 'Mainframe COBOL copybook → ISO 20022 JSON'],
            ['E-commerce', 'Shopify webhook → internal OrderPlaced domain event'],
            ['Healthcare', 'HL7 v2 pipe message → FHIR resource'],
            ['SAP / Oracle', 'IDoc or ERP export → cloud event schema'],
            ['Kafka Connect', 'SMT (Single Message Transform) for field renames'],
            ['API gateways', 'External partner format ↔ internal canonical model'],
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
            'Define a **canonical model** internally; translators map in and out. Use MapStruct, XSLT, or JSONata for declarative mapping. Version translations (`schemaVersion: 2`) and test golden fixtures — mapping bugs corrupt data silently.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'OrderTranslator.java',
          code: `@Component
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
// transforms.RenameField.renames=cust_id:customerId`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Lossy translation',
          body: 'Not every legacy field maps cleanly. Document **defaults, nulls, and dropped fields**. Invalid translations should go to **DLQ**, not publish corrupt canonical events.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Integrates legacy without big-bang rewrites.',
            'Centralizes mapping rules away from business logic.',
            'Enables gradual migration to canonical schemas.',
          ],
          cons: [
            'Translator becomes maintenance burden on schema changes.',
            'Hard to debug subtle field mapping errors.',
            'Extra hop adds latency and failure point.',
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
              question: 'Message Translator vs Adapter pattern?',
              answer:
                '**Adapter** (GoF) wraps an object interface. **Message Translator** is the integration pattern for **async message** format conversion — same spirit, messaging context.',
            },
            {
              question: 'Where should translation happen?',
              answer:
                'At the **boundary** — anti-corruption layer in DDD. Legacy adapter publishes canonical events inward; outward translators for partners.',
            },
            {
              question: 'Canonical model — why bother?',
              answer:
                'Avoid **N×M mappings** (every pair of systems). Each system maps to one hub format — N+M translators instead of N×M.',
            },
            {
              question: 'How do you test translators?',
              answer:
                'Golden file tests: input fixture → expected output. Regression on every schema bump; property tests for round-trip when bidirectional.',
            },
            {
              question: 'Kafka Connect vs custom translator service?',
              answer:
                'Connect + SMT for simple field ops at scale. Custom service when logic is complex (enrichment, branching, calls to reference data).',
            },
            {
              question: 'Envelope wrapper pattern?',
              answer:
                'Wrap payload: `{ type, version, traceId, payload }`. Translator unwraps legacy, re-wraps in standard envelope for downstream consumers.',
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
          body: '1. Convert **message format/schema** between incompatible systems.\n2. Use a **canonical model** at the hub; map at boundaries.\n3. Real uses: **legacy ERP, webhooks, HL7, Kafka Connect SMT**.\n4. Test mappings rigorously; route bad transforms to **DLQ**.',
        },
      ],
    },
  ],
};

export default content;
