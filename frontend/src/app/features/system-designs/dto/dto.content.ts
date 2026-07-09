import { DesignContent } from '../../../shared/models';
import { DTO_META } from './dto.meta';

const content: DesignContent = {
  meta: DTO_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **Data Transfer Object (DTO)** is a simple object that **carries data** across process or layer boundaries — typically API requests/responses — **without business logic**. It shapes the contract for clients and prevents leaking internal domain entities.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Why not return entities?',
          body: 'Entities may include lazy associations, internal IDs, or fields you must never expose. DTOs give a stable, intentional API surface.',
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
          body: 'A **shipping label / packing slip**: it summarizes what the recipient needs to know. It is not the warehouse inventory system itself — just the transferable summary.',
        },
        {
          type: 'mermaid',
          caption: 'Map domain to DTO at the boundary.',
          definition: `flowchart LR
  E[Order entity] --> M[Mapper]
  M --> D[OrderResponse DTO]
  D --> API[JSON over HTTP]`,
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
            ['REST / GraphQL APIs', 'Request and response payloads'],
            ['Microservices', 'Messages between services'],
            ['Layer boundaries', 'Controller ↔ service contracts'],
            ['UI clients', 'Form models distinct from domain'],
            ['CQRS reads', 'Read models / query DTOs'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'OrderDtos.java',
          code: `// API contract — no behavior
public record PlaceOrderRequest(
    String customerId,
    List<ItemDto> items,
    String promoCode
) {
  public record ItemDto(String sku, int quantity) {}
}

public record OrderResponse(
    String orderId,
    String status,
    long totalCents,
    String currency
) {
  public static OrderResponse from(Order order) {
    return new OrderResponse(
        order.id().value(),
        order.status().name(),
        order.total().cents(),
        order.total().currency()
    );
  }
}

@RestController
class OrderController {
  private final OrderService orders;

  @PostMapping("/orders")
  OrderResponse place(@RequestBody PlaceOrderRequest req) {
    Order order = orders.place(req); // map inside service or mapper
    return OrderResponse.from(order);
  }
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Stable API contracts independent of persistence model.',
            'Avoids accidental exposure of internals.',
            'Easy to version and document (OpenAPI).',
          ],
          cons: [
            'Mapping boilerplate (mitigate with MapStruct / records).',
            'Too many DTOs can feel noisy for tiny apps.',
            'Duplication if blindly copying every entity field.',
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
              question: 'What is a DTO?',
              answer:
                'A plain object used to **transfer data** across a boundary (API, process, layer) without encapsulating business rules.',
            },
            {
              question: 'Why not expose JPA entities in REST?',
              answer:
                'Lazy-loading surprises, over-fetching, tight coupling to the schema, and security leaks. DTOs define exactly what clients may see.',
            },
            {
              question: 'DTO vs Value Object?',
              answer:
                'Value objects are **domain** concepts with invariants (Money, Email). DTOs are **transport** shapes and usually have little/no behavior.',
            },
            {
              question: 'Where do you map entity ↔ DTO?',
              answer:
                'At the **edge**: controller/assembler/mapper layer — not deep inside domain entities.',
            },
            {
              question: 'Are Java records good DTOs?',
              answer:
                'Yes — immutable, concise, ideal for request/response payloads when using Jackson.',
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
          body: '1. DTO = **data carrier** across boundaries.\n2. Keep APIs free of entity leakage.\n3. Real uses: **REST payloads, messaging, CQRS reads**.\n4. Map at the edge; do not put domain logic in DTOs.',
        },
      ],
    },
  ],
};

export default content;
