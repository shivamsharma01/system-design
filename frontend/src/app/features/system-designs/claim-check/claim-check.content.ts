import { DesignContent } from '../../../shared/models';
import { CLAIM_CHECK_META } from './claim-check.meta';

const content: DesignContent = {
  meta: CLAIM_CHECK_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Claim Check** pattern stores a **large payload** in external storage (S3, blob store) and sends only a **reference (claim check)** through the messaging system. Consumers retrieve the full data when needed. This keeps messages small, fast, and within broker size limits while still moving big artifacts through async workflows.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Core idea',
          body: 'Like checking a coat at a restaurant: you get a **ticket (claim check)**, not the coat itself. The queue carries the ticket; the blob store holds the heavy item.',
        },
        {
          type: 'table',
          caption: 'Message vs stored payload.',
          headers: ['In message', 'In blob store'],
          rows: [
            ['Claim ID / S3 URI', 'Full PDF, image, video, CSV'],
            ['Metadata (size, checksum, content-type)', 'Multi-MB JSON order export'],
            ['TTL hint', 'Medical imaging DICOM file'],
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
          body: '**E-commerce returns**: instead of mailing the broken TV through the post office message system, you drop it at a hub (S3) and email the warehouse a **tracking number**. The warehouse pulls the item when ready to inspect.',
        },
        {
          type: 'mermaid',
          caption: 'Large object stored externally; queue carries the reference.',
          definition: `sequenceDiagram
  participant P as Producer
  participant S3 as Blob Store
  participant Q as Message Queue
  participant C as Consumer
  P->>S3: PUT large-payload (key=abc123)
  P->>Q: publish ClaimCheck(id=abc123, uri=s3://...)
  Q->>C: deliver claim check
  C->>S3: GET abc123
  C->>C: process full payload`,
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
            ['Document processing', 'Upload PDF to S3; SQS message with key triggers OCR worker'],
            ['Video transcoding', 'Raw file in blob; job queue carries storage URI + preset'],
            ['Bulk exports', 'Nightly report in S3; notification email with signed download link'],
            ['Healthcare', 'Imaging study in object store; HL7 message references study ID'],
            ['Integration', 'SAP IDoc too large for MQ — store payload, send claim check'],
            ['Email attachments', 'Large attachment in blob; MIME message links to it'],
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
            'Generate a unique key, upload with checksum, publish a compact **ClaimCheck** message. Consumers fetch by URI; delete or lifecycle-expire blobs after processing. Use **pre-signed URLs** for time-limited access and enforce IAM least privilege.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ClaimCheckPublisher.java',
          code: `public record ClaimCheck(String id, String bucket, String key, String sha256, long bytes) {}

@Service
public class ClaimCheckPublisher {
  private final S3Client s3;
  private final SqsClient sqs;

  public void publishLarge(byte[] payload, String contentType) {
    String id = UUID.randomUUID().toString();
    String key = "claims/" + id;
    String sha256 = Hashing.sha256().hashBytes(payload).toString();

    s3.putObject(PutObjectRequest.builder()
        .bucket("payloads").key(key).contentType(contentType).build(),
        RequestBody.fromBytes(payload));

    ClaimCheck claim = new ClaimCheck(id, "payloads", key, sha256, payload.length);
    sqs.sendMessage(SendMessageRequest.builder()
        .queueUrl(processQueueUrl)
        .messageBody(objectMapper.writeValueAsString(claim))
        .build());
  }
}

@Component
public class ClaimCheckConsumer {
  public void handle(ClaimCheck claim) {
    byte[] data = s3.getObjectAsBytes(
        GetObjectRequest.builder().bucket(claim.bucket()).key(claim.key()).build()).asByteArray();
    verifySha256(data, claim.sha256());
    processor.run(data);
    s3.deleteObject(b -> b.bucket(claim.bucket()).key(claim.key()));
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Orphan blobs',
          body: 'If the message is lost but the blob remains (or vice versa), you get **orphans**. Use lifecycle policies, outbox for message send, and idempotent claim IDs to reconcile.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Stays within SQS/Kafka message size limits.',
            'Lower broker memory and network cost.',
            'Consumers can re-fetch payload on retry.',
          ],
          cons: [
            'Extra round trip to blob store adds latency.',
            'Must manage blob lifecycle and access control.',
            'Two systems to monitor (queue + storage).',
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
              question: 'When do you need Claim Check?',
              answer:
                'When payloads exceed **broker limits** (SQS 256 KB, Kafka default 1 MB) or when repeatedly shipping megabytes through the bus is wasteful.',
            },
            {
              question: 'Claim Check vs attaching to message?',
              answer:
                'Inline attachment is simpler for small data. Claim Check **decouples size** from the bus — better for video, PDFs, bulk JSON, medical images.',
            },
            {
              question: 'How do you secure blob access?',
              answer:
                'IAM roles per consumer, **pre-signed URLs** with short TTL, encryption at rest (SSE-S3/KMS), and never public buckets for sensitive data.',
            },
            {
              question: 'What if consumer fails after fetch but before delete?',
              answer:
                'Processing should be **idempotent** by claim ID. Retries re-fetch the same blob. Delete only after successful processing; DLQ poison claims separately.',
            },
            {
              question: 'Kafka with large messages — alternatives?',
              answer:
                'Claim Check to S3, or Kafka **message.max.bytes** increase (usually worse). Some teams use Confluent S3 sink with pointer events.',
            },
            {
              question: 'How does this relate to CQRS read models?',
              answer:
                'Both **separate heavy data from pointers**. Claim Check is messaging-specific; read models store denormalized views keyed by ID.',
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
          body: '1. Store **large payloads** in blob storage; messages carry **references**.\n2. Real uses: **S3 + SQS, video jobs, bulk exports**.\n3. Handle **orphans, TTL, checksums, and IAM**.\n4. Keeps queues fast and within size limits.',
        },
      ],
    },
  ],
};

export default content;
