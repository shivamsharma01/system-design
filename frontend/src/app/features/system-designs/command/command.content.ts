import { DesignContent } from '../../../shared/models';
import { COMMAND_META } from './command.meta';

const content: DesignContent = {
  meta: COMMAND_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Command** turns a request into a standalone object with all data needed to perform an action. Commands can be queued, logged, delayed, and — with `undo()` — reversed. The invoker does not know the receiver’s concrete API.',
        },
        {
          type: 'table',
          caption: 'Roles.',
          headers: ['Role', 'Responsibility'],
          rows: [
            ['Command', '`execute()` / optional `undo()`'],
            ['Receiver', 'Does the real work'],
            ['Invoker', 'Triggers commands (button, queue worker)'],
            ['Client', 'Creates commands and binds receivers'],
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
          body: 'A **restaurant order ticket**: the waiter writes “table 4 — two dosas” (command). The kitchen (receiver) cooks later. Tickets can be queued, cancelled, or batched — the waiter does not cook.',
        },
        {
          type: 'mermaid',
          caption: 'Invoker runs command objects.',
          definition: `sequenceDiagram
  participant UI as Invoker
  participant C as Command
  participant R as Receiver
  UI->>C: execute()
  C->>R: action()
  UI->>C: undo()
  C->>R: reverse()`,
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
            ['Editors', 'Undo/redo stacks for text and design tools'],
            ['Job queues', 'Serializable tasks for workers'],
            ['Smart home / IoT', 'Macro: “Good night” runs many device commands'],
            ['Transactions', 'Compensating actions in sagas (related idea)'],
            ['UI toolkits', 'Menu items bound to command objects'],
            ['Games', 'Input mapped to command objects for replay'],
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
          filename: 'EditorCommands.java',
          code: `public interface Command {
  void execute();
  void undo();
}

public class TextEditor { // receiver
  private final StringBuilder text = new StringBuilder();
  public void insert(int pos, String s) { text.insert(pos, s); }
  public void delete(int pos, int len) { text.delete(pos, pos + len); }
  public String content() { return text.toString(); }
}

public class InsertCommand implements Command {
  private final TextEditor editor;
  private final int pos;
  private final String chunk;

  public InsertCommand(TextEditor editor, int pos, String chunk) {
    this.editor = editor;
    this.pos = pos;
    this.chunk = chunk;
  }

  public void execute() { editor.insert(pos, chunk); }
  public void undo() { editor.delete(pos, chunk.length()); }
}

public class CommandHistory { // invoker + caretaker
  private final Deque<Command> undoStack = new ArrayDeque<>();

  public void run(Command cmd) {
    cmd.execute();
    undoStack.push(cmd);
  }

  public void undo() {
    if (!undoStack.isEmpty()) undoStack.pop().undo();
  }
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Decouples UI/triggers from business operations.',
            'Enables undo, macros, and async execution.',
            'Commands are easy to log and audit.',
          ],
          cons: [
            'Many small classes for simple actions.',
            'Undo can be hard for irreversible side effects.',
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
              question: 'What problem does Command solve?',
              answer:
                'It packages an action as an object so you can **queue, log, delay, and undo** it without the invoker knowing receiver details.',
            },
            {
              question: 'Command vs Strategy?',
              answer:
                'Strategy swaps **how** an algorithm runs (same goal). Command represents a **concrete action/request** to perform (often with undo and history).',
            },
            {
              question: 'How do you implement undo?',
              answer:
                'Store executed commands on a stack; each command knows how to reverse its effect (`undo`), or store mementos of prior state.',
            },
            {
              question: 'Macro command?',
              answer:
                'A command that holds a list of commands and executes/undoes them as a unit — “Good night” turns off lights, locks doors, sets thermostat.',
            },
            {
              question: 'LLD example?',
              answer:
                'Text editor undo; remote control for smart devices; job queue where each message deserializes to a command.',
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
          body: '1. Command = **action as object**.\n2. Real uses: **undo, queues, macros, UI actions**.\n3. Invoker ↔ command ↔ receiver decoupling.\n4. Pair with Memento when undo needs full snapshots.',
        },
      ],
    },
  ],
};

export default content;
