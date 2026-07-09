import { DesignContent } from '../../../shared/models';
import { TEMPLATE_METHOD_META } from './template-method.meta';

const content: DesignContent = {
  meta: TEMPLATE_METHOD_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Template Method** defines the skeleton of an algorithm in a base class, deferring some steps to subclasses. The base class calls abstract (or hook) methods in a fixed order so the overall flow stays consistent while details vary.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Inheritance-based reuse',
          body: 'Unlike Strategy (composition), Template Method uses inheritance. Prefer Strategy when you need runtime swapping without subclassing.',
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
          body: 'A **cooking recipe card**: “prep → cook → plate → clean.” Every chef follows that order; the prep/cook steps differ for pasta vs biryani.',
        },
        {
          type: 'mermaid',
          caption: 'Fixed steps; variable hooks.',
          definition: `flowchart TD
  T[template: generateReport] --> A[fetchData]
  A --> B[transform]
  B --> C[render]
  C --> D[deliver]`,
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
            ['Frameworks', 'JUnit test lifecycle, servlet `service` hooks'],
            ['ETL / reports', 'Extract → transform → load / render'],
            ['Games', 'Game loop: input → update → render'],
            ['Build tools', 'Compile pipelines with customizable steps'],
            ['Data parsers', 'Read → tokenize → build AST variants'],
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
          filename: 'ReportTemplate.java',
          code: `public abstract class ReportJob {
  /** Template method — final so subclasses cannot break the flow. */
  public final void run() {
    List<Row> data = fetchData();
    List<Row> shaped = transform(data);
    String output = render(shaped);
    deliver(output);
  }

  protected abstract List<Row> fetchData();
  protected abstract List<Row> transform(List<Row> data);
  protected abstract String render(List<Row> data);

  /** Hook with default — subclasses may override. */
  protected void deliver(String output) {
    System.out.println(output);
  }
}

public class DailySalesCsvReport extends ReportJob {
  protected List<Row> fetchData() { /* query DB */ return List.of(); }
  protected List<Row> transform(List<Row> data) { /* aggregate */ return data; }
  protected String render(List<Row> data) { return toCsv(data); }
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Guarantees algorithm structure across variants.',
            'Shares boilerplate in the base class.',
            'Hooks allow optional customization.',
          ],
          cons: [
            'Inheritance coupling; fragile base class risk.',
            'Harder to mix steps from different hierarchies.',
            'Strategy + composition is often clearer in modern code.',
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
              question: 'Template Method vs Strategy?',
              answer:
                'Template Method: **inheritance**, fixed skeleton, override steps. Strategy: **composition**, swap entire algorithm at runtime. Same goal of varying behavior; different mechanism.',
            },
            {
              question: 'What is a hook method?',
              answer:
                'An overridable method in the base class with a default (often empty) implementation that subclasses may customize without being forced to.',
            },
            {
              question: 'Why make the template method final?',
              answer:
                'To prevent subclasses from breaking the required step order while still allowing them to customize individual steps.',
            },
            {
              question: 'LLD example?',
              answer:
                'Data export jobs (CSV/PDF), beverage preparation (tea/coffee classic GoF example), or CI pipeline stages with customizable build/test steps.',
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
          body: '1. Skeleton in base; steps in subclasses.\n2. Real uses: **ETL, reports, frameworks, game loops**.\n3. Prefer Strategy when composition fits better.\n4. Use hooks for optional customization.',
        },
      ],
    },
  ],
};

export default content;
