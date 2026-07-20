import { DesignContent } from '../../../shared/models';
import { SOLID_PRINCIPLES_META } from './solid-principles.meta';

/**
 * Detailed SOLID principles guide for LLD / OOP interviews: each principle with
 * concept, analogy, bad vs good code, and interview Q&A at the end.
 */
const content: DesignContent = {
  meta: SOLID_PRINCIPLES_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**SOLID** is a set of five **object-oriented design principles** for writing code that is easier to understand, test, extend, and maintain. They are especially important in **low-level design (LLD)** interviews and in large codebases where change is constant.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The five letters',
          body: '**S**ingle Responsibility · **O**pen/Closed · **L**iskov Substitution · **I**nterface Segregation · **D**ependency Inversion. Together they push you toward small, focused types that depend on abstractions and can grow without rewriting everything.',
        },
        {
          type: 'table',
          caption: 'SOLID at a glance.',
          headers: ['Principle', 'One-line idea'],
          rows: [
            ['SRP', 'A class should have one reason to change'],
            ['OCP', 'Open for extension, closed for modification'],
            ['LSP', 'Subtypes must be substitutable for their base types'],
            ['ISP', 'Clients should not depend on unused methods'],
            ['DIP', 'Depend on abstractions, not concretions'],
          ],
        },
        {
          type: 'markdown',
          value:
            'SOLID is not a checklist to apply blindly. Use it to **spot design smells** (god classes, brittle `switch`es, broken inheritance) and to explain **trade-offs** in an interview. Over-abstracting a three-line script is as bad as a 2,000-line god class.',
        },
      ],
    },
    {
      id: 'srp',
      title: 'S — Single Responsibility Principle',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Concept:** A class should have **only one reason to change** — one job or responsibility. If two unrelated reasons force you to edit the same class, split it.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A chef in a restaurant is responsible for **cooking**, not taking orders or serving food. Mixing those roles creates bottlenecks and mistakes — the same happens when one class processes orders, writes to the database, and logs errors.',
        },
        {
          type: 'markdown',
          value: '**Violation:** `OrderProcessor` does processing, persistence, and logging:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'OrderProcessorBad.java',
          highlightLines: [4, 5, 6, 7, 8],
          code: `// Bad: three reasons to change (business rules, DB, logging).
public class OrderProcessor {
  public void process(Order order) {
    // validate and apply discounts...
    Database.save(order);           // persistence concern
    Logger.log("Order " + order.id()); // logging concern
  }
}`,
        },
        {
          type: 'markdown',
          value:
            '**Refactor:** split into focused collaborators so each class has a single responsibility:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'OrderProcessorGood.java',
          highlightLines: [2, 3, 4],
          code: `public class OrderProcessor {
  private final OrderRepository orders;
  private final ErrorLogger logger;

  public OrderProcessor(OrderRepository orders, ErrorLogger logger) {
    this.orders = orders;
    this.logger = logger;
  }

  public void process(Order order) {
    // only order business rules live here
    orders.save(order);
    logger.info("Processed order " + order.id());
  }
}

// OrderRepository — persistence only
// ErrorLogger — logging only`,
        },
        {
          type: 'prosCons',
          title: 'Why SRP helps',
          pros: [
            'Easier to test (mock one collaborator at a time).',
            'Changes to logging do not risk order logic.',
            'Clear ownership in code reviews.',
          ],
          cons: [
            'Too many tiny classes can hurt navigation if overdone.',
            'Need clear boundaries for what counts as "one responsibility".',
          ],
        },
      ],
    },
    {
      id: 'ocp',
      title: 'O — Open/Closed Principle',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Concept:** Software entities (classes, modules, functions) should be **open for extension** but **closed for modification**. You add behavior by writing new code, not by constantly editing existing, tested code.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A graphic design app lets you add new shapes without rewriting the core drawing engine. Plugins and strategies extend behavior; the engine stays stable.',
        },
        {
          type: 'markdown',
          value: '**Violation:** every new payment type requires editing `PaymentProcessor`:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'PaymentProcessorBad.java',
          code: `// Bad: must modify this class for every new payment method.
public class PaymentProcessor {
  public void pay(String type, Money amount) {
    if (type.equals("card")) { /* charge card */ }
    else if (type.equals("paypal")) { /* paypal */ }
    else if (type.equals("upi")) { /* upi */ }  // another edit tomorrow
  }
}`,
        },
        {
          type: 'markdown',
          value: '**Refactor:** depend on a `Payment` abstraction; add new types as new classes:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'PaymentProcessorGood.java',
          highlightLines: [1, 2, 3, 12, 13, 14],
          code: `public interface Payment {
  void pay(Money amount);
}

public class CreditCardPayment implements Payment {
  public void pay(Money amount) { /* charge card */ }
}

public class PayPalPayment implements Payment {
  public void pay(Money amount) { /* PayPal API */ }
}

public class PaymentProcessor {
  public void pay(Payment payment, Money amount) {
    payment.pay(amount); // no modification when UPI is added
  }
}`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'How you extend',
          body: 'Common tools: interfaces, abstract classes, strategy pattern, plugins. The stable core calls abstractions; new behavior arrives as new implementations.',
        },
      ],
    },
    {
      id: 'lsp',
      title: 'L — Liskov Substitution Principle',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Concept:** Objects of a superclass should be **replaceable with objects of subclasses** without breaking correctness. Subtypes must honor the contract of the base type — same expectations for preconditions, postconditions, and invariants.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'If you can drive a vehicle, swapping a car for a truck should still let you drive. If a "vehicle" subtype cannot be driven at all, it is not a valid substitute.',
        },
        {
          type: 'markdown',
          value: '**Violation:** `Bird` assumes all birds can fly; `Penguin` breaks callers:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'BirdBad.java',
          code: `// Bad: Penguin cannot honor fly().
public class Bird {
  public void fly() { /* flap wings */ }
}

public class Penguin extends Bird {
  @Override
  public void fly() {
    throw new UnsupportedOperationException("penguins don't fly");
  }
}

// Caller assumes any Bird can fly — fails for Penguin.
void migrate(Bird bird) { bird.fly(); }`,
        },
        {
          type: 'markdown',
          value:
            '**Refactor:** model the real capability (`move`) so each subtype implements behavior it can support:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'BirdGood.java',
          highlightLines: [2, 3, 8, 13],
          code: `public abstract class Bird {
  public abstract void move();
}

public class Sparrow extends Bird {
  @Override
  public void move() { fly(); }
  private void fly() { /* ... */ }
}

public class Penguin extends Bird {
  @Override
  public void move() { swim(); }
  private void swim() { /* ... */ }
}

// Substituting Sparrow or Penguin is safe.
void migrate(Bird bird) { bird.move(); }`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Classic interview trap: Square extends Rectangle',
          body: 'If `Rectangle.setWidth` and `setHeight` are independent, a `Square` that forces equal sides violates LSP for code that sets width and height separately. Prefer composition or a shared `Shape` with area, not forced inheritance.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SquareRectangleLsp.java',
          highlightLines: [8, 9, 10, 11, 18, 19],
          code: `// Bad: Square breaks callers that assume independent sides.
public class Rectangle {
  protected int w, h;
  public void setWidth(int w) { this.w = w; }
  public void setHeight(int h) { this.h = h; }
  public int area() { return w * h; }
}

public class Square extends Rectangle {
  @Override public void setWidth(int w) { this.w = this.h = w; }
  @Override public void setHeight(int h) { this.w = this.h = h; }
}

void stretch(Rectangle r) {
  r.setWidth(5);
  r.setHeight(4);
  // Expects 20; gets 16 if r is a Square — LSP violation.
  assert r.area() == 20;
}

// Better: no inheritance — Shape with area(), or immutable Square(side).`,
        },
      ],
    },
    {
      id: 'isp',
      title: 'I — Interface Segregation Principle',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Concept:** Clients should **not be forced to depend on interfaces they do not use**. Prefer small, focused interfaces over one fat interface with methods only some implementers need.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A universal remote with dozens of unused buttons is worse than a simple remote with only the buttons you need. Fat interfaces force classes to implement (or stub) irrelevant methods.',
        },
        {
          type: 'markdown',
          value:
            '**Violation:** one `Appliance` interface forces every device to implement everything:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ApplianceBad.java',
          code: `// Bad: Fan must implement setTimer even if it has no timer.
public interface Appliance {
  void turnOn();
  void turnOff();
  void setTimer(int minutes);
}

public class Fan implements Appliance {
  public void turnOn() { /* ... */ }
  public void turnOff() { /* ... */ }
  public void setTimer(int minutes) {
    throw new UnsupportedOperationException();
  }
}`,
        },
        {
          type: 'markdown',
          value: '**Refactor:** segregate into role interfaces:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ApplianceGood.java',
          highlightLines: [1, 2, 3, 4, 5, 6, 7, 8],
          code: `public interface Switchable {
  void turnOn();
  void turnOff();
}

public interface Timer {
  void setTimer(int minutes);
}

public class Fan implements Switchable {
  public void turnOn() { /* ... */ }
  public void turnOff() { /* ... */ }
}

public class Oven implements Switchable, Timer {
  public void turnOn() { /* ... */ }
  public void turnOff() { /* ... */ }
  public void setTimer(int minutes) { /* ... */ }
}`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'ISP vs SRP',
          body: 'SRP is about **classes** having one reason to change. ISP is about **interfaces** not forcing unused dependencies on clients. They often appear together when you split a god interface and a god class.',
        },
      ],
    },
    {
      id: 'dip',
      title: 'D — Dependency Inversion Principle',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Concept:** High-level modules should **not depend on low-level modules**. Both should depend on **abstractions**. Abstractions should not depend on details; details depend on abstractions. In practice: inject dependencies (interfaces) instead of `new`-ing concrete classes inside business logic.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A wall power socket does not care which device you plug in. Devices conform to the socket (the abstraction). High-level policy stays stable; low-level devices vary.',
        },
        {
          type: 'markdown',
          value: '**Violation:** `EmailSender` is glued to SMTP:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'EmailSenderBad.java',
          code: `// Bad: high-level policy depends on a concrete transport.
public class EmailSender {
  private final SmtpClient smtp = new SmtpClient();

  public void send(String to, String body) {
    smtp.send(to, body);
  }
}`,
        },
        {
          type: 'markdown',
          value:
            '**Refactor:** depend on `EmailService`; inject SMTP in production and a mock in tests:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'EmailSenderGood.java',
          highlightLines: [1, 2, 3, 8, 9, 10, 11],
          code: `public interface EmailService {
  void send(String to, String body);
}

public class SmtpService implements EmailService {
  public void send(String to, String body) { /* SMTP */ }
}

public class EmailSender {
  private final EmailService email;

  public EmailSender(EmailService email) {
    this.email = email;
  }

  public void sendWelcome(String to) {
    email.send(to, "Welcome!");
  }
}

// Production: new EmailSender(new SmtpService())
// Tests:     new EmailSender(new MockEmailService())`,
        },
        {
          type: 'code',
          language: 'python',
          filename: 'email_sender.py',
          code: `from typing import Protocol

class EmailService(Protocol):
    def send(self, to: str, body: str) -> None: ...

class EmailSender:
    def __init__(self, email: EmailService) -> None:
        self._email = email

    def send_welcome(self, to: str) -> None:
        self._email.send(to, "Welcome!")`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'DIP enables testing and OCP',
          body: 'Once high-level code depends on interfaces, you can swap implementations (OCP) and inject fakes in unit tests without spinning up real SMTP, databases, or HTTP clients.',
        },
      ],
    },
    {
      id: 'together',
      title: 'How They Work Together',
      blocks: [
        {
          type: 'markdown',
          value:
            'SOLID principles reinforce each other. A well-factored payment flow might look like this:',
        },
        {
          type: 'mermaid',
          caption: 'High-level policy depends on abstractions; details implement them.',
          definition: `flowchart TB
  Checkout["CheckoutService (high-level)"] --> Pay["Payment interface"]
  Checkout --> Notify["Notifier interface"]
  Pay --> Card["CreditCardPayment"]
  Pay --> Upi["UpiPayment"]
  Notify --> Email["EmailNotifier"]
  Notify --> Sms["SmsNotifier"]`,
        },
        {
          type: 'bestPractices',
          title: 'When to apply SOLID in interviews',
          practices: [
            '**LLD / machine coding:** name principles when you split classes or introduce interfaces.',
            '**System design:** SOLID is secondary; mention it only for service boundaries or plugin-style extensibility.',
            '**Start concrete, then abstract:** write a working design, then extract interfaces where variation is real.',
            '**Call out violations:** "This switch on type violates OCP; I would use a strategy interface."',
          ],
        },
        {
          type: 'featureComparison',
          caption: 'Smell → principle that usually fixes it.',
          columns: ['SRP', 'OCP', 'LSP', 'ISP', 'DIP'],
          rows: [
            { feature: 'God class / mixed concerns', values: [true, false, false, false, false] },
            { feature: 'Endless if/switch on type', values: [false, true, false, false, false] },
            {
              feature: 'Subclass throws / no-ops base methods',
              values: [false, false, true, false, false],
            },
            {
              feature: 'Empty method stubs on implementers',
              values: [false, false, false, true, false],
            },
            {
              feature: 'Hard to unit-test (new inside class)',
              values: [false, false, false, false, true],
            },
          ],
        },
      ],
    },
    {
      id: 'production-scenarios',
      title: 'SOLID Production Scenarios',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Senior-Level SOLID Q&A',
          items: [
            {
              question:
                'PaymentService has 15 if-else conditions for payment methods. Which SOLID principle is being violated?',
              answer:
                'Primarily **Open/Closed Principle (OCP)**: every new payment method requires modifying and retesting the central conditional. It may also indicate an **SRP** violation because the service knows every gateway’s rules.\n\nExtract a `PaymentProcessor` strategy with implementations such as card, UPI, and wallet. Inject a registry such as `Map<PaymentMethod, PaymentProcessor>` and dispatch by method. Adding a gateway then means registering a new implementation rather than editing the orchestration logic.\n\nDo not remove all conditionals mechanically. A small stable branch is clearer than a hierarchy; refactor when the variation is expected to grow or already changes frequently.',
            },
            {
              question:
                'A class handles validation, database operations, email notifications, and logging. How would you refactor it using SOLID?',
              answer:
                'Give each business capability one reason to change: a validator enforces input/domain rules, a repository persists data, a notification port sends email, and an application service coordinates the use case. Inject these dependencies through interfaces where alternate implementations or test doubles are useful.\n\nKeep the transaction around database state changes, then publish an outbox/domain event for email so a mail outage does not hold a database connection or roll back valid business state. Treat logging as cross-cutting infrastructure through a logger/AOP/interceptor rather than a new “logging service” called everywhere.\n\nThe goal is cohesive boundaries, not one class per method.',
            },
            {
              question:
                'Can a class with only one method still violate the Single Responsibility Principle?',
              answer:
                'Yes. SRP is about **one reason to change**, not method count. A single `process()` method that validates input, calculates tax, saves an order, calls a payment API, sends email, and formats an HTTP response changes for many independent actors and policies.\n\nConversely, a cohesive class can have many methods and still satisfy SRP. During review, ask which business or technical decisions could force this class to change and whether those decisions change independently.',
            },
            {
              question:
                'How would you add a new payment gateway without modifying existing production code?',
              answer:
                'Define a stable port such as `PaymentGateway.charge(PaymentRequest)`, implement one adapter per provider, and select the implementation through configuration or an injected registry/factory. The checkout/application service depends only on the port.\n\nAdd the new adapter, contract tests against a provider sandbox/fake, configuration, observability, idempotency, timeout/circuit-breaker policy, and a feature flag or routing rule. Existing orchestration remains unchanged, satisfying OCP and DIP. Shared behavior should be composed as decorators rather than copied into every adapter.',
            },
            {
              question: 'When does applying the Open/Closed Principle become over-engineering?',
              answer:
                'When extension points are created for hypothetical variation that has no evidence, producing interfaces with one implementation, factories that only call a constructor, and configuration nobody needs. This increases navigation, testing, and operational complexity without reducing likely change cost.\n\nUse the rule of three and change history: keep simple code direct, then extract an abstraction when two or more real variants share a stable contract or when a high-risk external boundary needs isolation now. OCP means protect stable policy from known variation—not predict every future requirement.',
            },
            {
              question:
                'Why is Rectangle–Square the classic Liskov Substitution Principle violation?',
              answer:
                'If mutable `Rectangle` promises independent `setWidth` and `setHeight`, a `Square` subtype cannot honor that contract because changing one dimension must change the other. Code that sets width and height separately and expects `width × height` gets surprising results when passed a Square.\n\nThe issue is not geometry; it is a strengthened invariant that breaks the base type’s behavioral contract. Better models use immutable shapes with `area()`, separate Rectangle and Square types, or a base abstraction that never promises independent mutation. LSP asks whether every subtype preserves clients’ expectations, not merely whether “is-a” sounds true.',
            },
            {
              question:
                'How do you identify an Interface Segregation Principle violation during code review?',
              answer:
                'Look for implementations with unsupported methods, empty bodies, dummy return values, or `UnsupportedOperationException`; clients that depend on a large interface but use one method; and unrelated teams changing the same interface for independent reasons.\n\nSplit the interface by client capability—for example `ReadableAccount`, `TransferAuthorizer`, and `StatementExporter`—then let implementations combine only what they support. Avoid fragmenting interfaces blindly: cohesive methods commonly required together should remain together.',
            },
            {
              question:
                'What is the difference between Dependency Injection and the Dependency Inversion Principle?',
              answer:
                '**DIP is a design principle:** high-level policy and low-level details should depend on stable abstractions, and the abstraction should be owned around the policy’s needs. **DI is a wiring technique:** dependencies are supplied from outside rather than constructed internally.\n\nConstructor-injecting a concrete `StripeSdkClient` is DI but may still violate DIP because business policy directly depends on a vendor detail. Injecting an application-owned `PaymentGateway` port, implemented by a Stripe adapter and wired by Spring, uses DI to achieve DIP. DI containers are optional; manual constructor wiring works too.',
            },
            {
              question:
                'In a 2,000-line service class, which SOLID violations would you expect first?',
              answer:
                'Start with **SRP**: unrelated validation, persistence, integration, mapping, and workflow rules usually accumulate first. Then look for OCP violations in growing conditionals, DIP violations from direct SDK/repository construction, and ISP violations in oversized collaborator interfaces. LSP issues usually surface in inheritance-heavy sections rather than from line count alone.\n\nUse change history and tests before splitting: cluster methods by the data they use and reasons they change, identify transaction boundaries/invariants, add characterization tests, and extract one cohesive capability at a time. A large class is a smell, not proof by itself.',
            },
            {
              question:
                'Which SOLID principle is hardest to maintain in large enterprise applications, and why?',
              answer:
                'Usually **SRP**, because “responsibility” is contextual and enterprise workflows cross validation, authorization, transactions, integrations, auditing, and notifications. Ownership changes and deadline-driven patches gradually turn orchestration classes into catch-all services.\n\nDIP is also difficult across team boundaries when vendor/framework types leak into domain APIs. Maintain SRP with explicit bounded contexts, clear application/domain/infrastructure layers, code ownership, architecture tests, small change sets, and periodic refactoring based on real change coupling. The best answer may differ by system; explain the observed organizational force rather than treating one principle as universally hardest.',
            },
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
              question: 'What are the SOLID principles?',
              answer:
                'Five OOP guidelines: **Single Responsibility** (one reason to change), **Open/Closed** (extend without modifying), **Liskov Substitution** (subtypes replace base types safely), **Interface Segregation** (no fat unused interfaces), and **Dependency Inversion** (depend on abstractions, inject details).',
            },
            {
              question: 'Give an example of an SRP violation and how you would fix it.',
              answer:
                'A class that validates an order, saves it to the database, and sends email has three reasons to change. Split into an order service, a repository, and a notifier (or email service), and compose them — each class has one responsibility.',
            },
            {
              question: 'How does OCP relate to the Strategy pattern?',
              answer:
                'Strategy encapsulates interchangeable algorithms behind an interface. New strategies are new classes (extension) without editing the context class (closed for modification) — a classic OCP application.',
            },
            {
              question: 'What is a classic LSP violation?',
              answer:
                '`Square extends Rectangle` when setters allow independent width and height, or a subclass that throws `UnsupportedOperationException` for a base method (e.g. `Penguin.fly()`). Callers that rely on the base contract break. Fix by redesigning the hierarchy so subtypes honor the contract.',
            },
            {
              question: 'How is ISP different from SRP?',
              answer:
                'SRP is about **classes** having a single reason to change. ISP is about **interfaces** not forcing clients to depend on methods they do not use. You can violate ISP with a fat interface even if each implementing class is small.',
            },
            {
              question: 'Why does DIP make code more testable?',
              answer:
                'High-level code depends on interfaces. In tests you inject mocks or fakes instead of real databases, SMTP, or HTTP clients, so unit tests stay fast and deterministic without changing production logic.',
            },
            {
              question: 'Should every class have an interface?',
              answer:
                'No. Introduce abstractions where you need **variation**, **testing seams**, or **plugin-style extension**. Premature interfaces for every type add noise. Prefer YAGNI: abstract when a second implementation or a test double is real.',
            },
            {
              question: 'How would you apply SOLID in a parking-lot LLD?',
              answer:
                'SRP: separate parking assignment, payment, and ticket issuance. OCP: new vehicle types or pricing strategies via interfaces. LSP: vehicle subtypes must honor capacity/size contracts. ISP: do not force every gate device to implement payment APIs. DIP: inject repositories and payment gateways into the parking service.',
            },
            {
              question: 'When should you NOT apply SOLID / over-abstraction?',
              answer:
                'Skip heavy abstraction for **throwaway scripts**, tiny CRUD modules with one implementation, or early prototypes where the second variant is speculative. Over-applying SOLID creates interface forests and indirection that slow delivery — prefer YAGNI and extract seams when a real second implementation, test double, or extension point appears.',
            },
          ],
        },
      ],
    },
    {
      id: 'references',
      title: 'References',
      blocks: [
        {
          type: 'references',
          items: [
            {
              label: 'What Are SOLID Design Principles? (Design Gurus)',
              url: 'https://www.designgurus.io/answers/detail/solid-design-principles',
              source: 'Design Gurus',
            },
            {
              label: 'SOLID (object-oriented design)',
              url: 'https://en.wikipedia.org/wiki/SOLID',
              source: 'Wikipedia',
            },
            {
              label: 'Principles of OOD (Uncle Bob)',
              url: 'https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html',
              source: 'Clean Coder Blog',
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
          body: '1. **SRP** — one reason to change per class; split mixed concerns.\n2. **OCP** — extend via new implementations, avoid endless type switches.\n3. **LSP** — subtypes must honor base contracts; no surprise throws or weakened behavior.\n4. **ISP** — small role interfaces beat fat ones with unused methods.\n5. **DIP** — high-level policy depends on abstractions; inject details for flexibility and tests.\n6. In interviews, **name the principle**, show a violation, and sketch the refactor — that scores better than reciting definitions alone.',
        },
      ],
    },
  ],
};

export default content;
