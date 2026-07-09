import { DesignContent } from '../../../shared/models';
import { TIMEOUT_META } from './timeout.meta';

const content: DesignContent = {
  meta: TIMEOUT_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Timeout** pattern bounds how long you wait for a remote operation. Without timeouts, a slow dependency can hold threads, connections, and user requests indefinitely — turning a partial outage into a full one.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Set timeouts everywhere',
          body: 'Connect timeout, read/response timeout, and an overall **deadline** (budget) for the whole request. Nested calls must use **smaller** remaining budgets.',
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
          body: 'Waiting for a **taxi**: you decide “if it is not here in 10 minutes, I cancel and take the metro.” Infinite waiting blocks your whole evening — same as a thread stuck on a hung RPC.',
        },
        {
          type: 'mermaid',
          caption: 'Deadline shrinks as the call chain deepens.',
          definition: `flowchart LR
  C[Client deadline 2s] --> G[API Gateway 1.8s]
  G --> O[Order 1.5s]
  O --> P[Payment 800ms]`,
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
            ['HTTP clients', 'OkHttp / Apache HttpClient connect & read timeouts'],
            ['gRPC', 'Deadlines / `Context` cancellation'],
            ['Databases', 'Statement and connection acquisition timeouts'],
            ['Message consumers', 'Processing time limits before nack/retry'],
            ['Browsers / mobile', 'Client-side request timeouts and UX cancel'],
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
          filename: 'TimedPaymentClient.java',
          code: `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class TimedPaymentClient {
  private final HttpClient http = HttpClient.newBuilder()
      .connectTimeout(Duration.ofMillis(200))
      .build();

  public PaymentResult charge(Money amount) throws Exception {
    HttpRequest req = HttpRequest.newBuilder()
        .uri(URI.create("https://payments.internal/charge"))
        .timeout(Duration.ofMillis(800)) // overall response timeout
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(toJson(amount)))
        .build();

    try {
      HttpResponse<String> res =
          http.send(req, HttpResponse.BodyHandlers.ofString());
      return PaymentResult.parse(res.body());
    } catch (HttpTimeoutException e) {
      throw new PaymentTimeoutException("payment exceeded 800ms", e);
    }
  }
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Timeout + retry',
          body: 'Retries without timeouts multiply load. Timeouts without a policy leave users with opaque failures. Pair with **retry+backoff** for transient errors and **fail fast** for permanent ones.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Bounds resource hold time under dependency slowness.',
            'Makes SLOs enforceable in code.',
            'Enables cancellation and fallback paths.',
          ],
          cons: [
            'Too aggressive → false failures on p99 latency.',
            'Too loose → still exhaust thread pools.',
            'Must propagate deadlines across service hops.',
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
              question: 'Why are timeouts mandatory for remote calls?',
              answer:
                'Without them, a hung dependency can block threads forever, exhaust pools, and cascade latency across the fleet. Timeouts convert “maybe forever” into a controlled error.',
            },
            {
              question: 'Connect timeout vs read timeout?',
              answer:
                '**Connect**: time to establish TCP/TLS. **Read/response**: time waiting for data after the request is sent. You usually need both, plus an overall deadline.',
            },
            {
              question: 'How do you choose a timeout value?',
              answer:
                'Start from dependency **latency SLOs** (e.g. p99) plus margin, and from the caller’s remaining deadline. Measure and tune — do not copy “30 seconds” blindly.',
            },
            {
              question: 'What is deadline propagation?',
              answer:
                'Passing the remaining time budget to downstream services so the whole call graph respects the client’s original deadline instead of stacking full timeouts at each hop.',
            },
            {
              question: 'Timeout vs circuit breaker?',
              answer:
                'Timeout limits **one call**. A circuit breaker stops calling after repeated failures so you fail fast without waiting for each timeout.',
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
          body: '1. Every remote call needs a **timeout / deadline**.\n2. Propagate remaining budget down the chain.\n3. Real uses: **HTTP, gRPC, DB, consumers**.\n4. Tune from latency data; pair with retry and circuit breaking.',
        },
      ],
    },
  ],
};

export default content;
