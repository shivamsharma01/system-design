import { DesignContent } from '../../../shared/models';
import { VENDING_MACHINE_META } from './vending-machine.meta';

/**
 * Vending Machine — classic LLD focusing on the State pattern,
 * inventory, payment/change-making, and extensibility.
 */
const content: DesignContent = {
  meta: VENDING_MACHINE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Design a **vending machine** that accepts coins, lets the user select a product, dispenses an item, and returns change. Interviewers love this problem because the natural solution is the **State pattern**: behavior changes dramatically as money is inserted, stock runs out, or a sale completes.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Why this problem',
          body: 'It tests **finite-state modeling**, encapsulation of transitions, inventory invariants, and a small algorithms digression (**change-making**). A strong answer names states out loud before writing classes.',
        },
        {
          type: 'table',
          caption: 'Skills demonstrated.',
          headers: ['Skill', 'What to show'],
          rows: [
            ['State pattern', 'Idle / HasMoney / Dispensing / OutOfStock as objects or enum-driven handlers'],
            ['Invariants', 'Never dispense without payment; never go negative on stock or cash'],
            ['Algorithms', 'Greedy change when denominations allow; mention DP otherwise'],
            ['Extensibility', 'Card payment and multi-item cart as follow-ups without rewriting the core'],
          ],
        },
      ],
    },
    {
      id: 'clarifying-questions',
      title: 'Clarifying Questions',
      blocks: [
        {
          type: 'table',
          caption: 'Ask first; assume if told to decide.',
          headers: ['Question', 'Reasonable assumption'],
          rows: [
            ['Coin-only or also cards?', 'Coins for core design; card as extension'],
            ['Which denominations?', '1, 5, 10, 25 (cents) — classic US-style'],
            ['One item per transaction or a cart?', 'Single selection for core; cart as extension'],
            ['Exact change only?', 'Machine makes change from a cash box; fail gracefully if cannot'],
            ['How is inventory restocked?', 'Admin `restock` API; OutOfStock until restocked'],
            ['Cancel / refund mid-flow?', 'Yes — return inserted coins from HasMoney'],
          ],
        },
      ],
    },
    {
      id: 'requirements',
      title: 'Requirements',
      blocks: [
        {
          type: 'markdown',
          value: '### Functional',
        },
        {
          type: 'table',
          headers: ['#', 'Requirement'],
          rows: [
            ['F1', 'Display available products with prices and remaining stock'],
            ['F2', 'Accept coins and track current balance'],
            ['F3', 'Select a product; reject if insufficient funds or out of stock'],
            ['F4', 'Dispense product, deduct stock, collect payment into cash box'],
            ['F5', 'Return change using available denominations'],
            ['F6', 'Cancel and refund inserted coins'],
            ['F7', 'Admin restock products and refill change float'],
          ],
        },
        {
          type: 'markdown',
          value: '### Non-functional',
        },
        {
          type: 'table',
          headers: ['#', 'Requirement'],
          rows: [
            ['N1', 'Clear state transitions — illegal operations throw or no-op with a message'],
            ['N2', 'Thread safety if multiple panels share one machine (optional advanced)'],
            ['N3', 'Open/Closed — new payment method should not rewrite state machine'],
          ],
        },
      ],
    },
    {
      id: 'states',
      title: 'State Machine',
      blocks: [
        {
          type: 'markdown',
          value:
            'Core states: **Idle** (waiting), **HasMoney** (balance > 0), **Dispensing** (transient success path), **OutOfStock** (selected item or whole machine empty — model per-product or global; interviews usually use a global OutOfStock when *no* products remain, and reject selection when a SKU is empty while staying Idle/HasMoney).',
        },
        {
          type: 'mermaid',
          caption: 'Idle → HasMoney → Dispensing → Idle (or OutOfStock).',
          definition: `stateDiagram-v2
  [*] --> Idle
  Idle --> HasMoney: insertCoin
  HasMoney --> HasMoney: insertCoin
  HasMoney --> Idle: cancel / refund
  HasMoney --> Dispensing: selectProduct (ok)
  HasMoney --> HasMoney: selectProduct (insufficient / empty SKU)
  Dispensing --> Idle: dispense + change
  Dispensing --> OutOfStock: last item sold (optional)
  OutOfStock --> Idle: restock
  Idle --> OutOfStock: all empty`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'State pattern shape',
          body: 'Define a `VendingState` interface with `insertCoin`, `selectProduct`, `cancel`, `restock`. Each concrete state implements legal transitions and delegates illegal ones to error messages. The `VendingMachine` context holds current state, balance, inventory, and cash box.',
        },
      ],
    },
    {
      id: 'entities',
      title: 'Core Entities',
      blocks: [
        {
          type: 'mermaid',
          caption: 'Class diagram (simplified).',
          definition: `classDiagram
  class VendingMachine {
    -VendingState state
    -int balance
    -Inventory inventory
    -CashBox cashBox
    +insertCoin(Coin)
    +selectProduct(code)
    +cancel()
    +restock(Product, qty)
  }
  class VendingState {
    <<interface>>
    +insertCoin(m, coin)
    +selectProduct(m, code)
    +cancel(m)
  }
  class IdleState
  class HasMoneyState
  class DispensingState
  class OutOfStockState
  class Product {
    String code
    String name
    int priceCents
  }
  class Inventory {
    +get(code) ProductStock
    +deduct(code)
    +add(code, qty)
  }
  class Coin {
    <<enumeration>>
    PENNY FIVE DIME QUARTER
  }
  class CashBox {
    +add(Coin)
    +makeChange(amount) List~Coin~
  }
  VendingMachine --> VendingState
  VendingMachine --> Inventory
  VendingMachine --> CashBox
  VendingState <|.. IdleState
  VendingState <|.. HasMoneyState
  VendingState <|.. DispensingState
  VendingState <|.. OutOfStockState
  Inventory --> Product`,
        },
        {
          type: 'table',
          headers: ['Entity', 'Responsibility'],
          rows: [
            ['Product', 'Immutable catalog entry: code, name, price'],
            ['Inventory', 'Map code → remaining quantity'],
            ['Coin / Payment', 'Denomination values; optional PaymentStrategy later'],
            ['CashBox', 'Coins held for change; makeChange algorithm'],
            ['VendingMachine', 'Context: balance, state, orchestration'],
          ],
        },
      ],
    },
    {
      id: 'change-making',
      title: 'Change-Making',
      blocks: [
        {
          type: 'markdown',
          value:
            'With **canonical** denominations (1, 5, 10, 25), **greedy** change is optimal: repeatedly take the largest coin that fits. If denominations were arbitrary (e.g. 1, 3, 4), greedy can fail — then use **DP** (unbounded knapsack / coin change) to minimize coin count or decide impossibility given limited float.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'CashBox.java',
          code: `import java.util.*;

public class CashBox {
  private final NavigableMap<Integer, Integer> counts = new TreeMap<>();

  public void add(int denomination, int n) {
    counts.merge(denomination, n, Integer::sum);
  }

  /** Greedy change for canonical coin systems. Returns empty if impossible. */
  public Optional<List<Integer>> makeChange(int amount) {
    List<Integer> result = new ArrayList<>();
    int remaining = amount;
    for (int coin : counts.descendingKeySet()) {
      int available = counts.get(coin);
      int need = Math.min(available, remaining / coin);
      for (int i = 0; i < need; i++) {
        result.add(coin);
        remaining -= coin;
      }
    }
    if (remaining != 0) return Optional.empty();
    // commit: decrement counts
    for (int coin : result) {
      counts.merge(coin, -1, Integer::sum);
    }
    return Optional.of(result);
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Cannot make change',
          body: 'If `makeChange` fails, **do not dispense**. Refund or ask for exact change. Real machines track a **float**; empty nickels are a classic production bug.',
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Java State Machine Sample',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'VendingState.java',
          code: `public interface VendingState {
  void insertCoin(VendingMachine m, int cents);
  void selectProduct(VendingMachine m, String code);
  void cancel(VendingMachine m);
}

public class IdleState implements VendingState {
  public void insertCoin(VendingMachine m, int cents) {
    m.addBalance(cents);
    m.setState(new HasMoneyState());
  }
  public void selectProduct(VendingMachine m, String code) {
    m.message("Insert coins first");
  }
  public void cancel(VendingMachine m) {
    m.message("Nothing to cancel");
  }
}

public class HasMoneyState implements VendingState {
  public void insertCoin(VendingMachine m, int cents) {
    m.addBalance(cents);
  }
  public void selectProduct(VendingMachine m, String code) {
    var stock = m.inventory().get(code);
    if (stock == null || stock.qty() == 0) {
      m.message("Sold out: " + code);
      return;
    }
    if (m.balance() < stock.product().priceCents()) {
      m.message("Insufficient funds");
      return;
    }
    m.setState(new DispensingState());
    m.completeSale(stock.product());
  }
  public void cancel(VendingMachine m) {
    m.refundBalance();
    m.setState(new IdleState());
  }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'VendingMachine.java',
          code: `public class VendingMachine {
  private VendingState state = new IdleState();
  private int balance;
  private final Inventory inventory;
  private final CashBox cashBox;

  public VendingMachine(Inventory inventory, CashBox cashBox) {
    this.inventory = inventory;
    this.cashBox = cashBox;
  }

  void completeSale(Product p) {
    int changeDue = balance - p.priceCents();
    var change = cashBox.makeChange(changeDue);
    if (change.isEmpty() && changeDue > 0) {
      message("Exact change required");
      setState(new HasMoneyState());
      return;
    }
    inventory.deduct(p.code());
    cashBox.addPayment(balance - changeDue);
    balance = 0;
    dispense(p);
    change.ifPresent(this::returnCoins);
    setState(inventory.anyInStock() ? new IdleState() : new OutOfStockState());
  }

  public void insertCoin(int cents) { state.insertCoin(this, cents); }
  public void selectProduct(String code) { state.selectProduct(this, code); }
  public void cancel() { state.cancel(this); }

  // package helpers used by states
  void addBalance(int c) { balance += c; }
  int balance() { return balance; }
  void setState(VendingState s) { state = s; }
  Inventory inventory() { return inventory; }
  void refundBalance() { returnCoins(List.of(balance)); balance = 0; }
  void message(String m) { System.out.println(m); }
  void dispense(Product p) { System.out.println("Dispensed " + p.name()); }
  void returnCoins(List<Integer> coins) { System.out.println("Change: " + coins); }
}`,
        },
      ],
    },
    {
      id: 'extensions',
      title: 'Extensions',
      blocks: [
        {
          type: 'markdown',
          value:
            '- **Card payment**: introduce `PaymentMethod` (Cash vs Card). Card auth happens before Dispensing; no change-making. States stay similar; payment is Strategy.\n- **Multi-item cart**: accumulate selected lines under HasMoney; `checkout` triggers one dispense loop and one change calculation.\n- **Admin mode**: PIN-gated restock and cash collection — separate state or role check.\n- **Sensors**: hardware failures → Fault state that rejects sales.',
        },
        {
          type: 'prosCons',
          title: 'State objects vs enum switch',
          pros: [
            'State objects: OCP-friendly, each transition local and testable.',
            'Enum + switch: fewer classes; fine for tiny machines in a timed interview.',
          ],
          cons: [
            'State objects: more boilerplate for a 45-minute whiteboard.',
            'Enum switch: grows into a god method as features accumulate.',
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
              question: 'Which design pattern fits a vending machine and why?',
              answer:
                'The **State pattern**: inserting coins, selecting items, and canceling mean different things depending on current state. Encapsulating states avoids sprawling `if (state == …)` blocks.',
            },
            {
              question: 'Walk through Idle → sale → Idle.',
              answer:
                'Idle + coin → HasMoney; more coins increase balance; valid select → Dispensing (deduct stock, take payment, return change) → Idle. Cancel from HasMoney refunds and returns to Idle.',
            },
            {
              question: 'How do you handle sold-out products?',
              answer:
                'Per-SKU: reject selection with a message while staying in HasMoney/Idle. Global OutOfStock when inventory is entirely empty — only restock leaves that state.',
            },
            {
              question: 'Greedy vs DP for change?',
              answer:
                'Greedy is optimal for canonical coin systems (US coins). For arbitrary denominations or limited coin counts, use DP / search to find a feasible combination or prove impossibility.',
            },
            {
              question: 'What if the machine cannot make change?',
              answer:
                'Abort the sale: do not dispense, keep or refund balance per policy, and show “exact change.” Never go negative on the cash box.',
            },
            {
              question: 'How would you add card payments?',
              answer:
                'Strategy/Payment interface. Card path authorizes for the price, skips coin balance, then reuses Dispensing. Keep cash float logic only on the cash strategy.',
            },
            {
              question: 'Is Dispensing a real state or a method?',
              answer:
                'Either works. A transient Dispensing state documents the lifecycle; many implementations fold it into a `completeSale` method called from HasMoney. Say which you pick and why (clarity vs fewer classes).',
            },
            {
              question: 'How do you test the state machine?',
              answer:
                'Table-driven tests: given state + event → expected state, balance, stock, and messages. Cover insufficient funds, sold out, cancel, exact change failure, and restock.',
            },
            {
              question: 'Multi-threaded kiosk — any issues?',
              answer:
                'Synchronize on the machine or use a single event queue so two selects cannot deduct the same last item. Inventory and cash box updates must be atomic with state transitions.',
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
          body: '1. Model **Idle → HasMoney → Dispensing → OutOfStock** with the State pattern.\n2. Separate **Inventory**, **Product**, and **CashBox** concerns.\n3. **Greedy change** for canonical coins; mention **DP** for general coin systems.\n4. Extensions: **card payment**, **multi-item cart**, admin restock — without breaking the state core.',
        },
      ],
    },
  ],
};

export default content;
