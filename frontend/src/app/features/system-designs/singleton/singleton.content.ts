import { DesignContent } from '../../../shared/models';
import { SINGLETON_META } from './singleton.meta';

/**
 * Singleton — creational GoF pattern with real-world usage and interview Q&A.
 */
const content: DesignContent = {
  meta: SINGLETON_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Singleton** pattern ensures a class has **exactly one instance** and provides a **global access point** to it. Use it when one shared object must coordinate access to a resource — not as a dumping ground for global state.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'When it fits',
          body: 'Configuration loaders, application-wide loggers, metric registries, and connection managers are classic candidates. Prefer **dependency injection** (e.g. Spring `@Singleton` / default bean scope) over hand-rolled static singletons in modern apps.',
        },
        {
          type: 'table',
          caption: 'Singleton at a glance.',
          headers: ['Piece', 'Role'],
          rows: [
            ['Private constructor', 'Blocks `new Singleton()` from outside'],
            ['Static instance', 'Holds the one shared object'],
            ['getInstance()', 'Lazy or eager access to that object'],
          ],
        },
      ],
    },
    {
      id: 'concept',
      title: 'Concept and analogy',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Idea:** Many callers need the *same* coordinator. Creating multiple instances would waste memory, fight over the same resource, or diverge in state.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A company has **one official printer queue**. Everyone sends jobs to that queue — not to a personal printer object per employee. One queue keeps order and avoids conflicting settings.',
        },
        {
          type: 'mermaid',
          caption: 'Clients share one instance.',
          definition: `flowchart LR
  C1[Service A] --> S[(Singleton)]
  C2[Service B] --> S
  C3[Service C] --> S`,
        },
      ],
    },
    {
      id: 'where-used',
      title: 'Where it is used',
      blocks: [
        {
          type: 'markdown',
          value: 'You will see Singleton (or “one shared instance”) in:',
        },
        {
          type: 'table',
          headers: ['Domain', 'Example'],
          rows: [
            ['Logging', '`Logger.getInstance()` / SLF4J root logger wiring'],
            ['Config', 'App settings loaded once from env / `application.yml`'],
            ['Databases', 'One `DataSource` / connection-pool manager per app'],
            ['DI containers', 'Spring default bean scope is effectively singleton'],
            ['Caches', 'In-process cache manager or metrics registry'],
            ['Hardware / drivers', 'Single device handle for a serial port or GPU context'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Interview trap',
          body: 'Saying “I always use Singleton for everything shared” is a red flag. Interviewers expect you to mention **testability**, **hidden dependencies**, and **thread safety**.',
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value: '**Eager** (simple, thread-safe by class loading):',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'AppConfig.java',
          code: `public final class AppConfig {
  private static final AppConfig INSTANCE = new AppConfig();
  private final String dbUrl;

  private AppConfig() {
    this.dbUrl = System.getenv().getOrDefault("DB_URL", "jdbc:h2:mem:app");
  }

  public static AppConfig getInstance() {
    return INSTANCE;
  }

  public String dbUrl() {
    return dbUrl;
  }
}`,
        },
        {
          type: 'markdown',
          value:
            '**Enum singleton** (preferred in Java interviews — serialization- and reflection-safe):',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'AppLogger.java',
          code: `public enum AppLogger {
  INSTANCE;

  public void info(String message) {
    System.out.println("[INFO] " + message);
  }
}

// usage
AppLogger.INSTANCE.info("Order placed");`,
        },
        {
          type: 'markdown',
          value:
            '**Lazy + thread-safe** with initialization-on-demand holder (cleaner than double-checked locking for most cases):',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'MetricsRegistry.java',
          code: `public final class MetricsRegistry {
  private MetricsRegistry() {}

  private static class Holder {
    private static final MetricsRegistry INSTANCE = new MetricsRegistry();
  }

  public static MetricsRegistry getInstance() {
    return Holder.INSTANCE;
  }

  public void increment(String name) { /* ... */ }
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Guarantees a single shared coordinator for a resource.',
            'Lazy variants avoid paying construction cost until first use.',
            'Familiar pattern; easy to explain in LLD rounds.',
          ],
          cons: [
            'Global access hides dependencies and hurts unit tests.',
            'Hard to swap implementations or run parallel test suites.',
            'Easy to overuse as a “god object” holding unrelated state.',
          ],
        },
      ],
    },
    {
      id: 'best-practices',
      title: 'Best practices',
      blocks: [
        {
          type: 'bestPractices',
          practices: [
            'Prefer **DI container singletons** over static `getInstance()` when you have Spring/Guice.',
            'Keep the singleton **small** — one responsibility (config *or* logging, not both).',
            'Make the class **final** and the constructor **private**.',
            'In Java, mention **enum** or **holder idiom** for thread safety in interviews.',
            'Avoid mutable global state inside the singleton; prefer immutable config snapshots.',
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
              question: 'What problem does Singleton solve?',
              answer:
                'It ensures **one instance** of a class and a **controlled access point**, so shared resources (config, logger, registry) stay consistent and are not duplicated.',
            },
            {
              question: 'How do you make a Singleton thread-safe in Java?',
              answer:
                'Eager static initialization, the **initialization-on-demand holder**, **enum singleton**, or carefully written **double-checked locking** with `volatile`. Enum is often the cleanest answer in interviews.',
            },
            {
              question: 'What are the downsides of Singleton?',
              answer:
                '**Hidden global state**, harder mocking in tests, tighter coupling, and risk of becoming a god object. Prefer injecting a single shared bean via DI so tests can substitute fakes.',
            },
            {
              question: 'Is a Spring `@Component` a Singleton?',
              answer:
                'By default, Spring beans are **singleton-scoped**: one instance per container. That is the DI-friendly form of the pattern — not the same as a static `getInstance()` utility.',
            },
            {
              question: 'Where would you use Singleton in a food-delivery LLD?',
              answer:
                'A shared **AppConfig**, **metrics registry**, or **feature-flag client** loaded once. Do **not** make `OrderService` a Singleton just because “there is one service” — services should be injectable and testable.',
            },
            {
              question: 'How can reflection or serialization break a classic Singleton?',
              answer:
                'Reflection can invoke a private constructor; deserialization can create a new instance. **Enum singletons** resist both; otherwise implement `readResolve()` and guard the constructor.',
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
          body: '1. Singleton = **one instance** + global/controlled access.\n2. Real uses: **config, logging, registries, DI bean scope**.\n3. Prefer **enum / holder / DI** over naive lazy `if (instance == null)`.\n4. In interviews, always discuss **thread safety** and **testability** trade-offs.',
        },
      ],
    },
  ],
};

export default content;
