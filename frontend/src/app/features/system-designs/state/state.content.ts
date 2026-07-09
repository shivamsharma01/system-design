import { DesignContent } from '../../../shared/models';
import { STATE_META } from './state.meta';

const content: DesignContent = {
  meta: STATE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**State** lets an object alter its behavior when its internal state changes — as if the object changed class. Each state is a class implementing a shared interface; transitions replace the current state object instead of growing a giant `switch`.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'FSM in OOP clothing',
          body: 'Think finite-state machine: valid events depend on the current state. Illegal transitions throw or no-op instead of corrupting data.',
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
          body: 'An **order package**: Created → Paid → Shipped → Delivered. “Cancel” is allowed early but not after delivery. The package’s status changes what actions make sense.',
        },
        {
          type: 'mermaid',
          caption: 'Order state transitions.',
          definition: `stateDiagram-v2
  [*] --> Created
  Created --> Paid: pay
  Created --> Cancelled: cancel
  Paid --> Shipped: ship
  Paid --> Cancelled: cancel
  Shipped --> Delivered: deliver
  Cancelled --> [*]
  Delivered --> [*]`,
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
            ['E-commerce', 'Order / payment / refund lifecycles'],
            ['Tickets', 'Support ticket open → pending → resolved'],
            ['Devices', 'Vending machine idle / selecting / dispensing'],
            ['Media players', 'Play / pause / stop states'],
            ['Workflow engines', 'Approval steps as states'],
            ['TCP / protocols', 'Connection state machines'],
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
          filename: 'OrderState.java',
          code: `public interface OrderState {
  void pay(OrderContext ctx);
  void ship(OrderContext ctx);
  void cancel(OrderContext ctx);
}

public class OrderContext {
  private OrderState state = new CreatedState();
  void changeState(OrderState state) { this.state = state; }
  public void pay() { state.pay(this); }
  public void ship() { state.ship(this); }
  public void cancel() { state.cancel(this); }
}

public class CreatedState implements OrderState {
  public void pay(OrderContext ctx) { ctx.changeState(new PaidState()); }
  public void ship(OrderContext ctx) {
    throw new IllegalStateException("pay first");
  }
  public void cancel(OrderContext ctx) { ctx.changeState(new CancelledState()); }
}

public class PaidState implements OrderState {
  public void pay(OrderContext ctx) {
    throw new IllegalStateException("already paid");
  }
  public void ship(OrderContext ctx) { ctx.changeState(new ShippedState()); }
  public void cancel(OrderContext ctx) { ctx.changeState(new CancelledState()); }
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Localizes transition rules per state.',
            'Removes sprawling switch statements.',
            'Easy to add a new state class.',
          ],
          cons: [
            'Many classes for small machines.',
            'Transition overview can be harder without a diagram.',
            'Overkill when there are only two trivial states.',
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
              question: 'State vs Strategy?',
              answer:
                'Both use composition of behavior objects. **State** transitions are usually driven by the object itself as part of a lifecycle. **Strategy** is chosen externally and typically does not transition.',
            },
            {
              question: 'When do you use State in LLD?',
              answer:
                'Order/booking/ticket workflows, vending machines, media players — anywhere behavior and allowed operations depend on status.',
            },
            {
              question: 'How do you prevent illegal transitions?',
              answer:
                'Implement no-ops or throw in states that disallow an event. Document the FSM; add tests for every edge.',
            },
            {
              question: 'Enum + switch vs State pattern?',
              answer:
                'Enums work for tiny machines. State pattern scales when each status has substantial behavior and you want OCP for new statuses.',
            },
            {
              question: 'Where is state stored in DDD?',
              answer:
                'Often as a value on the aggregate (`OrderStatus`) with methods enforcing transitions — same idea, sometimes without a class-per-state.',
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
          body: '1. Behavior depends on **current state object**.\n2. Real uses: **orders, tickets, devices, workflows**.\n3. Encode legal transitions explicitly.\n4. Distinguish from Strategy in interviews.',
        },
      ],
    },
  ],
};

export default content;
