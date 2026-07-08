import { DesignContent } from '../../../shared/models';
import { PROTOTYPE_META } from './prototype.meta';

/**
 * Prototype — clone existing instances (templates / game entities).
 */
const content: DesignContent = {
  meta: PROTOTYPE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Prototype** pattern creates new objects by **copying** (cloning) an existing instance — the prototype — instead of constructing from scratch with complex setup.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'When cloning wins',
          body: 'Setup is expensive (loaded templates, parsed configs, warmed caches) or you need many similar objects that differ only in a few fields.',
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
          body: 'A **document template** in Google Docs or Word: you duplicate “Invoice template,” then fill customer-specific fields. You do not redesign fonts, headers, and tax tables every time.',
        },
        {
          type: 'markdown',
          value:
            '**Shallow vs deep copy:** shallow copy shares nested references; deep copy duplicates the graph. Interviewers often ask which one you need for mutable nested state.',
        },
        {
          type: 'mermaid',
          caption: 'Clone from a registry of prototypes.',
          definition: `flowchart LR
  R[(Prototype Registry)] --> T[InvoiceTemplate]
  R --> Rpt[ReportTemplate]
  T -->|clone| I1[Invoice #1001]
  T -->|clone| I2[Invoice #1002]`,
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
            ['Documents / CMS', 'Clone page or email templates'],
            ['Games', 'Spawn enemies from a prototype archetype'],
            ['Graphics', 'Duplicate shapes/layers with shared base styles'],
            ['Config', 'Clone environment profiles and tweak overrides'],
            ['ORMs / Java', '`Cloneable`, copy constructors, serialization-based copies'],
            ['ML / data', 'Copy a pipeline config object per experiment run'],
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
          value: 'Email campaign templates: clone a base campaign, then customize subject and audience.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'EmailCampaign.java',
          code: `import java.util.ArrayList;
import java.util.List;

public class EmailCampaign implements Cloneable {
  private String name;
  private String subject;
  private List<String> sections;
  private List<String> audienceTags;

  public EmailCampaign(String name, String subject, List<String> sections) {
    this.name = name;
    this.subject = subject;
    this.sections = new ArrayList<>(sections);
    this.audienceTags = new ArrayList<>();
  }

  public void setSubject(String subject) { this.subject = subject; }
  public void setAudienceTags(List<String> tags) {
    this.audienceTags = new ArrayList<>(tags);
  }

  /** Deep-ish copy: nested lists are duplicated. */
  @Override
  public EmailCampaign clone() {
    try {
      EmailCampaign copy = (EmailCampaign) super.clone();
      copy.sections = new ArrayList<>(this.sections);
      copy.audienceTags = new ArrayList<>(this.audienceTags);
      return copy;
    } catch (CloneNotSupportedException e) {
      throw new AssertionError(e);
    }
  }
}

// usage
EmailCampaign blackFriday = new EmailCampaign(
    "BF base", "Black Friday deals", List.of("hero", "grid", "footer"));

EmailCampaign vip = blackFriday.clone();
vip.setSubject("VIP early access");
vip.setAudienceTags(List.of("vip", "in-app"));`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Java `Cloneable` caveat',
          body: 'Many teams prefer a **copy constructor** or explicit `copy()` method over `Cloneable` — clearer, typed, and easier to control deep vs shallow behavior.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Avoids repeating expensive initialization.',
            'Adds variants without a huge factory hierarchy.',
            'Natural fit for template-based domains.',
          ],
          cons: [
            'Deep cloning circular graphs is hard.',
            '`Cloneable` in Java is awkward; prefer copy constructors.',
            'Shared mutable state bugs if you accidentally shallow-copy.',
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
              question: 'What problem does Prototype solve?',
              answer:
                'Creating objects when **construction is costly** or when you need many **similar instances**. You clone a configured prototype and tweak differences.',
            },
            {
              question: 'Shallow copy vs deep copy?',
              answer:
                'Shallow: copy the object but **reuse nested references**. Deep: recursively copy nested objects. Use deep copy when clones must mutate nested state independently.',
            },
            {
              question: 'Prototype vs Factory?',
              answer:
                'Factory constructs from **class knowledge** / parameters. Prototype constructs from an **existing instance**. Factories choose type; prototypes duplicate state.',
            },
            {
              question: 'Give a real product example.',
              answer:
                'Notion/Docs **duplicate page**, Figma **duplicate frame**, game engines **instantiate prefabs**, marketing tools **clone campaign templates**.',
            },
            {
              question: 'How would you implement Prototype without `Cloneable`?',
              answer:
                'Provide a `copy()` method or copy constructor that explicitly copies fields (and nested structures). Optionally keep a **registry** of named prototypes.',
            },
            {
              question: 'What goes wrong with a careless clone?',
              answer:
                'Two “independent” objects share a mutable list or map → changing one corrupts the other. Always clarify ownership of nested collections in interviews.',
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
          body: '1. **Clone** configured objects instead of rebuilding them.\n2. Real uses: **templates, prefabs, campaign copies, config variants**.\n3. Know **shallow vs deep** copy trade-offs.\n4. Prefer explicit `copy()` over raw `Cloneable` in modern Java.',
        },
      ],
    },
  ],
};

export default content;
