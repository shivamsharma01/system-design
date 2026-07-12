import { DesignContent } from '../../../shared/models';
import { SPLITWISE_META } from './splitwise.meta';

/**
 * Splitwise — expense splitting LLD with pluggable split strategies and a
 * debt-simplification (minimum cash flow) settle-up algorithm.
 */
const content: DesignContent = {
  meta: SPLITWISE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Splitwise** lets a group of people log shared expenses (rent, trips, dinners) and tracks **who owes whom**. The tricky part is not recording an expense — it is (1) supporting multiple **ways to split** a bill (equal, exact amounts, percentages, shares) and (2) computing a **minimal set of settle-up transactions** so friends do not have to make N² payments to clear their debts.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Why this is a top LLD question',
          body: 'It is a clean test of the **Strategy pattern** (split types), basic **graph/greedy algorithm** design (debt simplification), and careful **money handling** (rounding a bill 3 ways without losing or inventing a cent). Very little concurrency is involved, which makes it a good "pure OOP + algorithm" interview compared to booking-style problems.',
        },
        {
          type: 'table',
          caption: 'Splitwise at a glance.',
          headers: ['Capability', 'Design concern'],
          rows: [
            ['Add expense split 3+ ways', 'Strategy pattern per split type + rounding correctness'],
            ['Track balances per user pair', 'BalanceSheet: incremental ledger vs. recomputed net'],
            ['Settle up with fewest transactions', 'Greedy max-creditor/max-debtor matching (min cash flow)'],
            ['Group expenses (trip, flat)', 'Group aggregates members + expenses, not balances directly'],
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
          headers: ['Question', 'Why it matters'],
          rows: [
            [
              'Which split types must be supported — equal, exact amounts, percentages, shares?',
              'Determines how many `SplitStrategy` implementations you need and how validation differs per type.',
            ],
            [
              'How do we handle rounding when an equal split does not divide evenly (e.g. ₹100 / 3)?',
              'Someone must absorb the extra paise/cents — usually the payer or the first N participants get +1 unit.',
            ],
            [
              'Are balances tracked per expense (ledger) or as a single running net per user pair?',
              'A ledger is auditable but requires summing on read; a running net is O(1) to read but harder to audit/undo.',
            ],
            [
              'Should "settle up" minimize the **number of transactions**, or match real-world payment pairs (e.g. only settle within a group)?',
              'Minimum-transaction settling can suggest payments between two people who never directly shared an expense — worth calling out as a UX trade-off.',
            ],
            [
              'Can an expense have more payers than one (e.g. two people fronted the bill)?',
              'Simplifies to one API if you generalize "paid by" into a map of payer → amount instead of a single payer.',
            ],
            [
              'Is multi-currency support required?',
              'Adds a currency-conversion step before balances of different currencies can be netted.',
            ],
            [
              'Can an expense be edited or deleted after other expenses were added?',
              'Requires recomputing/adjusting the balance sheet rather than just appending.',
            ],
          ],
        },
      ],
    },
    {
      id: 'requirements',
      title: 'Requirements',
      blocks: [
        {
          type: 'heading',
          level: 3,
          text: 'Functional requirements',
        },
        {
          type: 'markdown',
          value:
            '- Create **groups** with members (e.g. "Goa Trip", "Flatmates").\n- Add an **expense**: amount, payer, participants, and a **split strategy** (EQUAL / EXACT / PERCENT).\n- View a user\'s **balance** with every other user, and a group\'s overall balances.\n- **Settle up**: compute the minimum set of payments that clears all debts.\n- Record a manual **settlement/payment** between two users (partial or full).',
        },
        {
          type: 'heading',
          level: 3,
          text: 'Non-functional requirements',
        },
        {
          type: 'markdown',
          value:
            '- **Correctness of money math** — splits must sum exactly to the expense total (no leaked or invented cents).\n- **Extensibility** — adding a new split type (e.g. SHARES) must not require touching `Expense` or `BalanceSheet`.\n- **Auditability** — it should be possible to reconstruct how a balance was arrived at (which expenses contributed).\n- **Reasonable settle-up performance** — O(n log n) for n participants is enough; this is not a huge-scale problem.',
        },
      ],
    },
    {
      id: 'entities',
      title: 'Core Entities',
      blocks: [
        {
          type: 'table',
          caption: 'Domain model.',
          headers: ['Entity', 'Key fields', 'Notes'],
          rows: [
            ['User', 'id, name, email', 'A person who can owe or be owed money.'],
            ['Group', 'id, name, members[]', 'Optional container for related expenses (a trip, a flat); not required for a 1:1 expense.'],
            ['Expense', 'id, description, amount, paidBy (map userId→amount), splitType, splits[]', 'One shared cost event and how it was divided.'],
            ['ExpenseSplit', 'userId, amount owed', 'One participant\'s share of a single expense — the output of a `SplitStrategy`.'],
            ['SplitStrategy', 'EQUAL / EXACT / PERCENT / SHARES', 'Encapsulates how `amount` is divided into `ExpenseSplit`s.'],
            ['Balance', 'fromUser, toUser, amount', 'A directed, net amount one user owes another — the ledger unit `BalanceSheet` maintains.'],
            ['BalanceSheet', 'balances: Map<pairKey, amount>', 'Owns all pairwise balances; updated on every expense/settlement.'],
            ['Settlement', 'id, fromUser, toUser, amount, timestamp', 'A recorded real-world payment that reduces a balance.'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Canonicalize the balance key',
          body: 'Store one signed balance per unordered pair (e.g. always key by `min(userA, userB) → max(userA, userB)`, with a signed amount indicating direction) instead of two separate directed entries. It halves the state and avoids the two entries ever silently drifting out of sync.',
        },
      ],
    },
    {
      id: 'class-design',
      title: 'Class Design',
      blocks: [
        {
          type: 'mermaid',
          caption: 'Strategy for splitting; BalanceSheet as the single source of truth for who owes whom.',
          definition: `classDiagram
  class User {
    +String id
    +String name
  }
  class Group {
    +String id
    +String name
    +List members
    +List expenses
    +addExpense(expense) void
  }
  class Expense {
    +String id
    +String description
    +Money amount
    +Map paidBy
    +SplitType splitType
    +List splits
  }
  class SplitType {
    <<enumeration>>
    EQUAL
    EXACT
    PERCENT
    SHARES
  }
  class ExpenseSplit {
    +String userId
    +Money amountOwed
  }
  class SplitStrategy {
    <<interface>>
    +computeSplits(amount, participants, input) List
  }
  class EqualSplitStrategy
  class ExactSplitStrategy
  class PercentSplitStrategy
  class ExpenseFactory {
    +create(type, amount, paidBy, participants, input) Expense
  }
  class BalanceSheet {
    -Map balances
    +recordExpense(expense) void
    +recordSettlement(settlement) void
    +getBalance(userA, userB) Money
    +getBalancesFor(userId) List
  }
  class Settlement {
    +String fromUserId
    +String toUserId
    +Money amount
  }
  class SettleUpService {
    +simplifyDebts(balanceSheet) List
  }

  Group "1" --> "many" User : members
  Group "1" --> "many" Expense
  Expense "1" --> "many" ExpenseSplit
  Expense --> SplitType
  SplitStrategy <|.. EqualSplitStrategy
  SplitStrategy <|.. ExactSplitStrategy
  SplitStrategy <|.. PercentSplitStrategy
  ExpenseFactory --> SplitStrategy : selects
  ExpenseFactory --> Expense : builds
  BalanceSheet ..> Expense : consumes
  BalanceSheet ..> Settlement : consumes
  SettleUpService --> BalanceSheet : reads
  SettleUpService --> Settlement : produces`,
        },
        {
          type: 'markdown',
          value:
            '`ExpenseFactory` picks the right `SplitStrategy` from `SplitType` and builds a fully-formed `Expense` with its `ExpenseSplit`s already computed. `BalanceSheet` never knows about split *types* — it only ever consumes the resulting per-user amounts, keeping it decoupled from how a split was derived.',
        },
      ],
    },
    {
      id: 'flows',
      title: 'Key Flows',
      blocks: [
        {
          type: 'markdown',
          value: '**Add expense** — factory picks a strategy, computes splits, and the balance sheet is updated.',
        },
        {
          type: 'mermaid',
          caption: 'addExpense with a chosen split type.',
          definition: `sequenceDiagram
  participant U as User
  participant EF as ExpenseFactory
  participant SS as SplitStrategy
  participant BS as BalanceSheet
  U->>EF: create(EQUAL, amount=900, paidBy={A:900}, participants=[A,B,C])
  EF->>SS: computeSplits(900, [A,B,C], null)
  SS-->>EF: [A:300, B:300, C:300]
  EF-->>U: Expense(id, splits=[...])
  U->>BS: recordExpense(expense)
  BS->>BS: for each split: balance(payer, split.user) += split.amount
  BS-->>U: updated balances (B owes A 300, C owes A 300)`,
        },
        {
          type: 'markdown',
          value: '**Settle up** — greedy min-cash-flow: repeatedly match the largest creditor with the largest debtor.',
        },
        {
          type: 'mermaid',
          caption: 'simplifyDebts reduces N pairwise balances to a small transaction list.',
          definition: `sequenceDiagram
  participant C as Client
  participant SU as SettleUpService
  participant BS as BalanceSheet
  C->>SU: simplifyDebts(groupId)
  SU->>BS: getNetBalances(groupId)
  BS-->>SU: {A:+600, B:-300, C:-300}
  loop while any nonzero balance
    SU->>SU: pick maxCreditor (A:+600), maxDebtor (B:-300 or C:-300)
    SU->>SU: settle = min(600, 300) = 300
    SU->>SU: record Settlement(debtor -> creditor, 300)
    SU->>SU: update both balances (A:+300, debtor:0)
  end
  SU-->>C: [Settlement(B->A,300), Settlement(C->A,300)]`,
        },
      ],
    },
    {
      id: 'patterns',
      title: 'Design Patterns Applied',
      blocks: [
        {
          type: 'table',
          headers: ['Pattern', 'Where it shows up'],
          rows: [
            [
              'Strategy',
              '`SplitStrategy` (EQUAL/EXACT/PERCENT/SHARES) encapsulates how an amount is divided — new split types plug in without touching `Expense` or `BalanceSheet`.',
            ],
            [
              'Factory',
              '`ExpenseFactory.create(type, ...)` hides strategy selection and split computation behind one call, so callers never `new EqualSplitStrategy()` directly.',
            ],
            [
              'Observer (extension)',
              'Notify group members when a new expense is added or a settlement is recorded, without coupling `BalanceSheet` to notification channels.',
            ],
            [
              'Facade',
              '`SettleUpService` hides the greedy matching algorithm and balance normalization behind a single `simplifyDebts()` call.',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Strategy vs Factory — how they cooperate',
          body: 'Factory answers "**which** strategy to use" (based on `SplitType`); Strategy answers "**how** that chosen algorithm computes splits." Interviewers often ask you to justify using both — the clean answer is that they solve different responsibilities (selection vs. computation) and combining them keeps `Expense` creation a single, testable call.',
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation (Java)',
      blocks: [
        {
          type: 'markdown',
          value: '**Split strategies.** Each strategy validates its own input and must return splits that sum exactly to `amount` — the single most important correctness rule in this LLD.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SplitStrategy.java',
          code: `public interface SplitStrategy {
  /** input carries type-specific data: null for EQUAL, exact amounts for EXACT, percentages for PERCENT. */
  List<ExpenseSplit> computeSplits(long amountPaise, List<String> participantIds, Map<String, Long> input);
}

public class EqualSplitStrategy implements SplitStrategy {
  @Override
  public List<ExpenseSplit> computeSplits(long amountPaise, List<String> participantIds, Map<String, Long> input) {
    int n = participantIds.size();
    long base = amountPaise / n;
    long remainder = amountPaise % n; // paise left over after equal division

    List<ExpenseSplit> splits = new ArrayList<>();
    for (int i = 0; i < n; i++) {
      // First 'remainder' participants absorb one extra paisa each so the total matches exactly.
      long share = base + (i < remainder ? 1 : 0);
      splits.add(new ExpenseSplit(participantIds.get(i), share));
    }
    return splits;
  }
}

public class ExactSplitStrategy implements SplitStrategy {
  @Override
  public List<ExpenseSplit> computeSplits(long amountPaise, List<String> participantIds, Map<String, Long> input) {
    long sum = input.values().stream().mapToLong(Long::longValue).sum();
    if (sum != amountPaise) {
      throw new IllegalArgumentException("Exact splits (" + sum + ") must sum to the total amount (" + amountPaise + ")");
    }
    return participantIds.stream()
        .map(id -> new ExpenseSplit(id, input.get(id)))
        .collect(Collectors.toList());
  }
}

public class PercentSplitStrategy implements SplitStrategy {
  private static final double EPSILON = 0.001;

  @Override
  public List<ExpenseSplit> computeSplits(long amountPaise, List<String> participantIds, Map<String, Long> percentBps) {
    // percentBps values are basis points (10000 = 100.00%) to avoid floating point in the contract.
    long totalBps = percentBps.values().stream().mapToLong(Long::longValue).sum();
    if (Math.abs(totalBps - 10000) > 1) {
      throw new IllegalArgumentException("Percentages must sum to 100%, got " + (totalBps / 100.0) + "%");
    }

    List<ExpenseSplit> splits = new ArrayList<>();
    long allocated = 0;
    for (int i = 0; i < participantIds.size(); i++) {
      String id = participantIds.get(i);
      if (i == participantIds.size() - 1) {
        splits.add(new ExpenseSplit(id, amountPaise - allocated)); // remainder on last
      } else {
        long share = amountPaise * percentBps.get(id) / 10000;
        allocated += share;
        splits.add(new ExpenseSplit(id, share));
      }
    }
    return splits;
  }
}

/** Shares: input maps userId → share weight (e.g. 1, 2, 3). Remainder paise go to the last participant. */
public class SharesSplitStrategy implements SplitStrategy {
  @Override
  public List<ExpenseSplit> computeSplits(long amountPaise, List<String> participantIds, Map<String, Long> shares) {
    long totalShares = participantIds.stream().mapToLong(id -> shares.getOrDefault(id, 0L)).sum();
    if (totalShares <= 0) {
      throw new IllegalArgumentException("Shares must sum to a positive weight");
    }
    List<ExpenseSplit> splits = new ArrayList<>();
    long allocated = 0;
    for (int i = 0; i < participantIds.size(); i++) {
      String id = participantIds.get(i);
      if (i == participantIds.size() - 1) {
        splits.add(new ExpenseSplit(id, amountPaise - allocated));
      } else {
        long share = amountPaise * shares.get(id) / totalShares;
        allocated += share;
        splits.add(new ExpenseSplit(id, share));
      }
    }
    return splits;
  }
}`,
        },
        {
          type: 'markdown',
          value: '**Expense, factory, and the balance sheet.**',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Expense.java',
          code: `public enum SplitType { EQUAL, EXACT, PERCENT, SHARES }

public class ExpenseSplit {
  private final String userId;
  private final long amountOwedPaise;

  public ExpenseSplit(String userId, long amountOwedPaise) {
    this.userId = userId;
    this.amountOwedPaise = amountOwedPaise;
  }

  public String getUserId() { return userId; }
  public long getAmountOwedPaise() { return amountOwedPaise; }
}

public class Expense {
  private final String id;
  private final String description;
  private final long amountPaise;
  private final Map<String, Long> paidBy; // supports multiple payers
  private final SplitType splitType;
  private final List<ExpenseSplit> splits;

  public Expense(String id, String description, long amountPaise, Map<String, Long> paidBy,
                  SplitType splitType, List<ExpenseSplit> splits) {
    this.id = id;
    this.description = description;
    this.amountPaise = amountPaise;
    this.paidBy = paidBy;
    this.splitType = splitType;
    this.splits = splits;
  }

  public Map<String, Long> getPaidBy() { return paidBy; }
  public List<ExpenseSplit> getSplits() { return splits; }
}

public class ExpenseFactory {
  private final Map<SplitType, SplitStrategy> strategies;

  public ExpenseFactory() {
    this.strategies = Map.of(
        SplitType.EQUAL, new EqualSplitStrategy(),
        SplitType.EXACT, new ExactSplitStrategy(),
        SplitType.PERCENT, new PercentSplitStrategy(),
        SplitType.SHARES, new SharesSplitStrategy());
  }

  public Expense create(String description, long amountPaise, Map<String, Long> paidBy,
                         List<String> participantIds, SplitType splitType, Map<String, Long> input) {
    SplitStrategy strategy = strategies.get(splitType);
    List<ExpenseSplit> splits = strategy.computeSplits(amountPaise, participantIds, input);

    long payerTotal = paidBy.values().stream().mapToLong(Long::longValue).sum();
    if (payerTotal != amountPaise) {
      throw new IllegalArgumentException("Payer amounts must sum to the expense total");
    }

    return new Expense(UUID.randomUUID().toString(), description, amountPaise, paidBy, splitType, splits);
  }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'BalanceSheet.java',
          code: `/** Tracks one signed net balance per unordered user pair: positive means userA owes userB. */
public class BalanceSheet {
  // key = "userA|userB" with userA < userB lexicographically; value > 0 means userA owes userB.
  private final Map<String, Long> balances = new HashMap<>();

  private String pairKey(String u1, String u2) {
    return u1.compareTo(u2) < 0 ? u1 + "|" + u2 : u2 + "|" + u1;
  }

  /** amount > 0 means from owes to; amount < 0 means to owes from. */
  private void adjust(String from, String to, long amount) {
    String key = pairKey(from, to);
    long signedAmount = from.compareTo(to) < 0 ? amount : -amount;
    balances.merge(key, signedAmount, Long::sum);
  }

  public void recordExpense(Expense expense) {
    // Every participant owes their split to whichever payer(s) covered the bill,
    // proportional to how much each payer actually paid. Use integer remainder
    // allocation so multi-payer rounding never drifts from the owed total.
    long totalPaid = expense.getPaidBy().values().stream().mapToLong(Long::longValue).sum();
    for (ExpenseSplit split : expense.getSplits()) {
      List<Map.Entry<String, Long>> otherPayers = expense.getPaidBy().entrySet().stream()
          .filter(p -> !p.getKey().equals(split.getUserId()))
          .toList();
      long owed = split.getAmountOwedPaise();
      long allocated = 0;
      for (int i = 0; i < otherPayers.size(); i++) {
        Map.Entry<String, Long> payer = otherPayers.get(i);
        long payerShareOfDebt = (i == otherPayers.size() - 1)
            ? owed - allocated
            : owed * payer.getValue() / totalPaid;
        if (i < otherPayers.size() - 1) {
          allocated += payerShareOfDebt;
        }
        if (payerShareOfDebt != 0) {
          adjust(split.getUserId(), payer.getKey(), payerShareOfDebt);
        }
      }
    }
  }

  public void recordSettlement(String fromUserId, String toUserId, long amountPaise) {
    adjust(toUserId, fromUserId, amountPaise); // a payment reduces what from owed to
  }

  /** Positive => userA owes userB; negative => userB owes userA. */
  public long getBalance(String userA, String userB) {
    long raw = balances.getOrDefault(pairKey(userA, userB), 0L);
    return userA.compareTo(userB) < 0 ? raw : -raw;
  }

  /** Net position per user across all counterparties: positive = is owed money overall. */
  public Map<String, Long> getNetBalances(Set<String> userIds) {
    Map<String, Long> net = new HashMap<>();
    userIds.forEach(u -> net.put(u, 0L));
    for (Map.Entry<String, Long> entry : balances.entrySet()) {
      String[] parts = entry.getKey().split("\\\\|");
      long amount = entry.getValue(); // parts[0] owes parts[1] this amount
      net.merge(parts[0], -amount, Long::sum);
      net.merge(parts[1], amount, Long::sum);
    }
    return net;
  }
}`,
        },
        {
          type: 'markdown',
          value: '**Settle-up: greedy minimum cash flow.** Repeatedly settle the largest creditor against the largest debtor using two max-heaps — a classic greedy algorithm that minimizes the number of transactions.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SettleUpService.java',
          code: `public class SettleUpService {

  public record Settlement(String fromUserId, String toUserId, long amountPaise) {}

  /**
   * Greedy min-cash-flow: at every step, the user owed the most pays (or is paid by)
   * the user owing the most, clearing at least one balance to zero per step.
   * Produces at most (n - 1) transactions for n participants.
   */
  public List<Settlement> simplifyDebts(Map<String, Long> netBalances) {
    // Max-heap of creditors (positive net balance) and debtors (negative), by absolute magnitude.
    PriorityQueue<Map.Entry<String, Long>> creditors =
        new PriorityQueue<>((a, b) -> Long.compare(b.getValue(), a.getValue()));
    PriorityQueue<Map.Entry<String, Long>> debtors =
        new PriorityQueue<>((a, b) -> Long.compare(a.getValue(), b.getValue())); // most negative first

    for (Map.Entry<String, Long> entry : netBalances.entrySet()) {
      if (entry.getValue() > 0) {
        creditors.add(entry);
      } else if (entry.getValue() < 0) {
        debtors.add(entry);
      }
    }

    List<Settlement> settlements = new ArrayList<>();
    while (!creditors.isEmpty() && !debtors.isEmpty()) {
      Map.Entry<String, Long> maxCreditor = creditors.poll();
      Map.Entry<String, Long> maxDebtor = debtors.poll();

      long settledAmount = Math.min(maxCreditor.getValue(), -maxDebtor.getValue());
      settlements.add(new Settlement(maxDebtor.getKey(), maxCreditor.getKey(), settledAmount));

      long creditorRemaining = maxCreditor.getValue() - settledAmount;
      long debtorRemaining = maxDebtor.getValue() + settledAmount;

      if (creditorRemaining > 0) {
        creditors.add(Map.entry(maxCreditor.getKey(), creditorRemaining));
      }
      if (debtorRemaining < 0) {
        debtors.add(Map.entry(maxDebtor.getKey(), debtorRemaining));
      }
    }
    return settlements;
  }
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Complexity of the settle-up algorithm',
          body: 'With n participants, each iteration fully clears at least one person\'s balance, so there are at most **n - 1** settlements. Each iteration is `O(log n)` (heap poll/insert), giving **O(n log n)** total — efficient even though *finding the provably minimum number of transactions* is NP-hard in the general case; this greedy heuristic is the standard, practical answer.',
        },
      ],
    },
    {
      id: 'extensions',
      title: 'Extensions & Follow-ups',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Common follow-up directions',
          practices: [
            '**SHARES split** — e.g. splitting rent by 2:1:1 "shares" instead of percentages; add a `SharesSplitStrategy` with zero changes elsewhere (Strategy pattern payoff).',
            '**Multi-currency** — convert every expense to a base currency using a `CurrencyConverter` before touching `BalanceSheet`, and store the original currency for display.',
            '**Simplify debts scoped to a group vs. globally** — a user may be in multiple groups; decide whether settle-up nets balances within one group or across all of a user\'s relationships.',
            '**Edit/delete an expense** — requires reversing the original `recordExpense` effect (apply the inverse deltas) before applying the edited version, or keep an append-only ledger and recompute balances from scratch.',
            '**Partial settlement** — `recordSettlement` already supports amounts smaller than the full balance; expose it directly for "pay ₹200 of the ₹500 I owe."',
            '**Notifications** — Observer pattern: notify group members when a new expense is added, or when someone is close to settling their whole balance.',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Watch the rounding, always',
          body: 'Splitting ₹100 three ways naively gives ₹33.33 each — ₹99.99 total, one cent short. Always work in the smallest currency unit (paise/cents) as integers, and explicitly allocate the remainder (e.g. first N participants get +1 unit) so splits sum **exactly** to the original amount. This is the detail interviewers watch for most closely.',
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
              question: 'How do you design for multiple ways of splitting an expense without a giant if/else?',
              answer:
                'A `SplitStrategy` interface with `computeSplits(amount, participants, input)`, implemented per type (Equal/Exact/Percent/Shares), selected by an `ExpenseFactory`. Adding a new split type means adding one new class — no changes to `Expense` or `BalanceSheet` (Strategy + Factory working together).',
            },
            {
              question: 'How do you avoid rounding errors when splitting money equally?',
              answer:
                'Work in integer minor units (paise/cents), compute `base = total / n` and `remainder = total % n`, then give one extra unit to the first `remainder` participants. This guarantees the splits sum exactly to the original amount, unlike naive floating-point division.',
            },
            {
              question: 'Should balances be stored as a ledger of every expense, or a single running net per pair?',
              answer:
                'A running net (one signed amount per unordered user pair, updated incrementally) is O(1) to read and is what the design above uses. A full ledger is more auditable (you can show "why" a balance is what it is) but requires summing on every read unless you cache the net alongside it. Many real systems keep both: the ledger for audit/undo, and a materialized net for fast reads.',
            },
            {
              question: 'Walk through the settle-up / simplify-debts algorithm.',
              answer:
                'Compute each user\'s **net balance** (total owed to them minus total they owe). Put positive balances in a max-heap of creditors and negative balances in a max-heap of debtors (by magnitude). Repeatedly pop the largest creditor and largest debtor, settle `min(|credit|, |debt|)` between them, push back whichever side has a remaining balance, and repeat until both heaps are empty.',
            },
            {
              question: 'Why does the greedy min-cash-flow algorithm work, and is it provably minimal?',
              answer:
                'Each step fully zeroes out at least one participant\'s balance, so the algorithm terminates in at most n-1 transactions for n participants and runs in O(n log n). It is a good practical heuristic, but the true "minimum number of transactions to settle a set of balances" problem is NP-hard in general (related to subset-sum/partition) — call this out if asked to prove optimality.',
            },
            {
              question: 'How would you handle an expense that is later edited or deleted?',
              answer:
                'Reverse the original expense\'s effect on `BalanceSheet` by re-applying the same deltas with the sign flipped, then apply the new expense\'s deltas (if edited) or nothing (if deleted). This only works cleanly if `BalanceSheet` updates are simple additive deltas — which is exactly why the design keeps `recordExpense` purely additive.',
            },
            {
              question: 'How do you support an expense paid by more than one person?',
              answer:
                '`paidBy` is a `Map<userId, amountPaid>` instead of a single payer field. When distributing each participant\'s owed split, prorate it across the payers by their share of the total amount paid, as shown in `BalanceSheet.recordExpense`.',
            },
            {
              question: 'Where does Factory add value here beyond just calling `new EqualSplitStrategy()` directly?',
              answer:
                'The factory centralizes the mapping from `SplitType` to concrete strategy and performs shared validation (e.g. payer total must equal expense total) once, regardless of split type. Callers depend only on `SplitType` — an enum — not on concrete strategy classes, which keeps `Expense` creation decoupled from strategy implementations.',
            },
            {
              question: 'How would you scale balance lookups if a group has thousands of members?',
              answer:
                'Avoid storing/maintaining an O(n²) pairwise balance matrix; most real expenses involve a handful of participants, so pairwise balances stay sparse — only store entries that are actually nonzero (as the `HashMap`-based design already does), and compute per-user net balances by aggregating that user\'s sparse entries rather than scanning all pairs.',
            },
            {
              question: 'How would multi-currency change the design?',
              answer:
                'Each `Expense` keeps its original currency and amount for display, but `BalanceSheet` operations first convert to a common base currency via a `CurrencyConverter` (using a rate as of the expense date, ideally recorded on the expense itself so historical balances do not drift as exchange rates change later).',
            },
            {
              question: 'How do you handle expense edit/delete with an audit trail?',
              answer:
                'Never mutate history in place: append **compensating ledger events** (`ExpenseReversed` then optional `ExpenseCreated`) keyed to the original expense id, and update the running net from those deltas. Keep an immutable expense/event log so you can show who changed what and reconstruct balances by replaying the trail.',
            },
            {
              question: 'Group-scoped settle-up only?',
              answer:
                'Run the simplify-debts algorithm on **only the pairwise balances inside that group**, not the user\'s global nets across all groups. Store balances keyed by `(groupId, userA, userB)` (or filter the sparse map by group) so settling Trip A cannot accidentally clear money owed from Roommate B.',
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
          body: '1. **Strategy** for split computation (EQUAL/EXACT/PERCENT/SHARES) + **Factory** for selecting and validating it.\n2. Always work in **integer minor units** and explicitly allocate rounding remainders so splits sum exactly.\n3. `BalanceSheet` stores one **signed net balance per pair** — decoupled from *how* a split was computed.\n4. **Settle-up** = greedy max-creditor/max-debtor matching via two heaps: O(n log n), at most n-1 transactions.\n5. Note the trade-off: minimum-transaction settling is a practical heuristic, not a provably-optimal solution (NP-hard in general).',
        },
      ],
    },
  ],
};

export default content;
