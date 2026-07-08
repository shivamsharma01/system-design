import { DesignContent } from '../../../shared/models';
import { COMPOSITE_META } from './composite.meta';

const content: DesignContent = {
  meta: COMPOSITE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Composite** pattern composes objects into **tree structures** to represent part–whole hierarchies. Clients treat **individual leaves** and **composites** (groups) uniformly through the same interface.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Uniform treatment',
          body: 'Calling `getSize()` on a file or a folder “just works.” Folders sum children; files return their own size. The client does not `instanceof` every node.',
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
          body: 'A **company org chart**: an individual contributor and a department both “report headcount.” A department’s headcount is the sum of its teams; a person counts as 1. Same question, different structure.',
        },
        {
          type: 'mermaid',
          caption: 'File system composite.',
          definition: `flowchart TB
  Root[Folder: project]
  Root --> Src[Folder: src]
  Root --> Readme[File: README.md]
  Src --> App[File: App.java]
  Src --> Util[File: Util.java]`,
        },
        {
          type: 'table',
          headers: ['Role', 'Responsibility'],
          rows: [
            ['Component', 'Common interface (`operation`, optional child ops)'],
            ['Leaf', 'No children — does the real work'],
            ['Composite', 'Holds children; forwards / aggregates operations'],
          ],
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
            ['File systems', 'Files and directories; recursive size / delete'],
            ['UI', 'Panels containing buttons, nested menus, scene graphs'],
            ['Documents', 'Sections containing paragraphs and nested sections'],
            ['Org / permissions', 'Groups containing users and nested groups'],
            ['E-commerce', 'Product bundles containing products and sub-bundles'],
            ['Expressions', 'AST nodes: binary ops containing child expressions'],
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
          filename: 'FileSystemComposite.java',
          code: `import java.util.ArrayList;
import java.util.List;

public interface FileSystemNode {
  String name();
  long sizeBytes();
  void print(String indent);
}

public class FileLeaf implements FileSystemNode {
  private final String name;
  private final long sizeBytes;

  public FileLeaf(String name, long sizeBytes) {
    this.name = name;
    this.sizeBytes = sizeBytes;
  }

  public String name() { return name; }
  public long sizeBytes() { return sizeBytes; }
  public void print(String indent) {
    System.out.println(indent + "- " + name + " (" + sizeBytes + " B)");
  }
}

public class FolderComposite implements FileSystemNode {
  private final String name;
  private final List<FileSystemNode> children = new ArrayList<>();

  public FolderComposite(String name) { this.name = name; }

  public void add(FileSystemNode child) { children.add(child); }

  public String name() { return name; }

  public long sizeBytes() {
    long total = 0;
    for (FileSystemNode child : children) {
      total += child.sizeBytes();
    }
    return total;
  }

  public void print(String indent) {
    System.out.println(indent + "[DIR] " + name + "/");
    for (FileSystemNode child : children) {
      child.print(indent + "  ");
    }
  }
}

// usage
FolderComposite src = new FolderComposite("src");
src.add(new FileLeaf("App.java", 1200));
src.add(new FileLeaf("Util.java", 800));
FolderComposite root = new FolderComposite("project");
root.add(src);
root.add(new FileLeaf("README.md", 400));
System.out.println(root.sizeBytes()); // 2400
root.print("");`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Transparency vs safety',
          body: 'Putting `add`/`remove` on the common interface is transparent but lets clients call `add` on leaves. Safer designs keep child management only on composites (safer, slightly less uniform).',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Clients ignore leaf vs composite differences.',
            'Natural fit for recursive tree operations.',
            'Easy to add new node types that honor the interface.',
          ],
          cons: [
            'Overly general component interface can be awkward.',
            'Type safety: not every operation makes sense on every node.',
            'Deep trees need care for stack depth / performance.',
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
              question: 'What is the Composite pattern?',
              answer:
                'A way to build **tree structures** where leaves and groups share one interface, so clients can recurse over the tree without special-casing node types.',
            },
            {
              question: 'Give a classic example.',
              answer:
                '**File system**: `File` (leaf) and `Directory` (composite) both implement `Node` with `size()` / `delete()`. Directories aggregate children.',
            },
            {
              question: 'Should `addChild` live on the Component interface?',
              answer:
                '**Transparent** design: yes — uniform API, but leaves may throw. **Safe** design: only composites expose child APIs — clearer contracts. Mention both trade-offs in interviews.',
            },
            {
              question: 'Composite vs Decorator?',
              answer:
                'Composite builds **trees of many children** (part–whole). Decorator wraps **one** component to add behavior. Decorator is a chain; Composite is a hierarchy.',
            },
            {
              question: 'Where would you use it in an e-commerce LLD?',
              answer:
                '**Product bundles**: a bundle contains products and nested bundles; `getPrice()` sums children with discounts. Cart line items can also form composites for gift sets.',
            },
            {
              question: 'How do you avoid infinite recursion?',
              answer:
                'Prevent cycles when adding children (detect ancestor links), or document that the structure must remain a DAG/tree. Validate in `add`.',
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
          body: '1. Composite = **uniform tree** of leaves and groups.\n2. Real uses: **files, UI, org charts, bundles, ASTs**.\n3. Decide **transparent vs safe** child APIs deliberately.\n4. Contrast with Decorator (single wrapper chain).',
        },
      ],
    },
  ],
};

export default content;
