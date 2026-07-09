import { DesignContent } from '../../../shared/models';
import { ACTIVE_RECORD_META } from './active-record.meta';

const content: DesignContent = {
  meta: ACTIVE_RECORD_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Active Record** wraps a database row in an object that includes **both data and persistence behavior** (`save`, `delete`, finders). The domain object *is* the record — popularized by Ruby on Rails models.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Contrast',
          body: '**Repository + domain model** keeps persistence outside the entity. Active Record puts `user.save()` on the model itself — faster to build, tighter coupling to the DB.',
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
          body: 'A **paper form that is also the filing action**: fill in the fields, stamp “FILE,” and drop it in the cabinet yourself. The form carries both content and the “how to store me” instructions.',
        },
        {
          type: 'mermaid',
          caption: 'Object knows how to persist itself.',
          definition: `flowchart LR
  U[User ActiveRecord] -->|save| DB[(Database)]
  U -->|find| DB`,
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
            ['Ruby on Rails', 'ActiveRecord::Base models'],
            ['Laravel Eloquent', 'PHP Active Record style ORM'],
            ['Simple CRUD apps', 'Admin panels, prototypes, internal tools'],
            ['Scripting / glue', 'Small services where speed of delivery wins'],
            ['Legacy Java', 'Some older ORMs / patterns resembling AR'],
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
          value: 'Illustrative Java-style Active Record (Rails is the real-world reference):',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'UserActiveRecord.java',
          code: `public class User {
  private Long id;
  private String email;
  private String name;

  public static User find(Long id) {
    return Db.queryOne("SELECT * FROM users WHERE id = ?", id)
        .map(User::fromRow)
        .orElse(null);
  }

  public void save() {
    if (id == null) {
      id = Db.insert("INSERT INTO users(email, name) VALUES (?, ?)", email, name);
    } else {
      Db.update("UPDATE users SET email=?, name=? WHERE id=?", email, name, id);
    }
  }

  public void delete() {
    Db.execute("DELETE FROM users WHERE id = ?", id);
  }

  public boolean isValid() {
    return email != null && email.contains("@");
  }
}

// usage
User u = new User();
u.setEmail("a@shop.com");
u.setName("Ada");
u.save();`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Very fast to build CRUD features.',
            'Intuitive API for simple domain models.',
            'Convention-over-configuration in Rails/Eloquent.',
          ],
          cons: [
            'Mixes persistence with domain — harder to test in isolation.',
            'Temptation toward fat models and anemic “god” tables.',
            'Awkward for rich DDD aggregates and multiple persistence stores.',
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
              question: 'What is Active Record?',
              answer:
                'An object that represents a **database row** and includes **persistence methods** (`save`, `delete`, finders) alongside attributes and simple domain logic.',
            },
            {
              question: 'Active Record vs Repository?',
              answer:
                'Active Record: entity persists itself. Repository: a separate object loads/saves domain entities. Repository keeps the domain persistence-ignorant.',
            },
            {
              question: 'When is Active Record a good choice?',
              answer:
                'CRUD-heavy apps, prototypes, and frameworks (Rails) where productivity matters more than strict domain isolation.',
            },
            {
              question: 'When would you avoid it?',
              answer:
                'Complex invariants, multiple databases, hexagonal/clean architecture, or when you need to unit-test domain rules without a DB.',
            },
            {
              question: 'Is JPA `@Entity` Active Record?',
              answer:
                'Not by itself — JPA entities are usually **passive**. Active Record implies persistence methods on the model. Spring Data repositories are closer to the Repository pattern.',
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
          body: '1. Active Record = **row + behavior + persistence**.\n2. Real uses: **Rails, Eloquent, simple CRUD**.\n3. Great for speed; weaker for rich domains.\n4. Contrast with Repository in every interview answer.',
        },
      ],
    },
  ],
};

export default content;
