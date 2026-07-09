import { DesignContent } from '../../../shared/models';
import { MEMENTO_META } from './memento.meta';

const content: DesignContent = {
  meta: MEMENTO_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Memento** captures and externalizes an object’s internal state so it can be restored later — without violating encapsulation. A **caretaker** stores mementos; the **originator** alone knows how to create and apply them.',
        },
        {
          type: 'table',
          headers: ['Role', 'Responsibility'],
          rows: [
            ['Originator', 'Creates/restores mementos of its state'],
            ['Memento', 'Opaque snapshot (often immutable)'],
            ['Caretaker', 'Holds history; never peeks inside'],
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
          body: 'A **video game save point**: you store progress, explore, die, then reload. The save file is the memento; the game engine is the originator; the save slots UI is the caretaker.',
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
            ['Editors', 'Document undo beyond single commands'],
            ['Forms / wizards', 'Draft snapshots before submit'],
            ['Games', 'Save/load checkpoints'],
            ['Transactions', 'Rollback to pre-operation state in memory'],
            ['Config UIs', 'Revert settings to last applied snapshot'],
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
          filename: 'EditorMemento.java',
          code: `public class Editor {
  private String text = "";

  public void type(String chunk) { text += chunk; }
  public String text() { return text; }

  public Memento save() { return new Memento(text); }

  public void restore(Memento m) { this.text = m.state(); }

  public static final class Memento {
    private final String state;
    private Memento(String state) { this.state = state; }
    private String state() { return state; }
  }
}

public class History {
  private final Deque<Editor.Memento> stack = new ArrayDeque<>();

  public void push(Editor.Memento m) { stack.push(m); }
  public Editor.Memento pop() { return stack.pop(); }
}

// usage
Editor ed = new Editor();
History history = new History();
ed.type("Hello");
history.push(ed.save());
ed.type(" World");
ed.restore(history.pop()); // back to "Hello"`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Preserves encapsulation of originator state.',
            'Simple undo/restore model.',
            'Caretaker stays ignorant of internals.',
          ],
          cons: [
            'Snapshots can be memory-heavy for large state.',
            'Need policies for history size and deep copies.',
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
              question: 'Memento vs Command undo?',
              answer:
                'Command undo reverses an **operation**. Memento restores a **full prior state**. Editors often combine both (commands for ops, mementos for coarse checkpoints).',
            },
            {
              question: 'Who can read the memento?',
              answer:
                'Ideally only the originator. Caretakers store opaque tokens. In Java, nested classes or package-private fields enforce this.',
            },
            {
              question: 'Memory concerns?',
              answer:
                'Limit stack depth, store diffs, or snapshot only when needed. Deep-copy mutable nested structures.',
            },
            {
              question: 'LLD example?',
              answer:
                'Text editor undo; form “discard changes”; game save slots.',
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
          body: '1. Snapshot state **without breaking encapsulation**.\n2. Originator ↔ memento ↔ caretaker roles.\n3. Real uses: **undo, drafts, game saves**.\n4. Watch memory; compare with Command undo.',
        },
      ],
    },
  ],
};

export default content;
