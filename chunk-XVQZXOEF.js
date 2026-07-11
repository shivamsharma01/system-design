import{a as e}from"./chunk-4MY6KLY6.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"Design an **ATM (Automated Teller Machine)** that lets a customer insert a card, authenticate with a PIN, and perform **withdraw**, **deposit**, **balance inquiry**, and **fund transfer** operations. The machine talks to a bank over a network, holds physical cash in denominations, and must reliably dispense the *exact* requested amount (or fail cleanly) while staying consistent with the bank ledger."},{type:"callout",variant:"info",title:"What interviewers are really testing",body:"This is an **object modelling + state machine** exercise, not a distributed-systems one. Expect to be graded on: clean class boundaries (Card vs Account vs Bank), a **state machine** for the ATM/session lifecycle, the **cash dispensing algorithm**, and how you decouple the ATM from a concrete bank via an interface (Dependency Inversion)."},{type:"table",caption:"ATM at a glance.",headers:["Piece","Role"],rows:[["`Card`","Card number, expiry, linked account id \u2014 inserted to start a session"],["`Account`","Balance + account type, owned by a `Customer`, held by the `Bank`"],["`BankService`","Interface the ATM depends on: authenticate, debit, credit, transfer"],["`CashDispenser`","Physical cash inventory; runs the denomination algorithm"],["`ATM` (context)","Holds current `ATMState` and delegates all requests to it"],["`Transaction`","Withdraw / Deposit / BalanceInquiry / Transfer \u2014 logged for the receipt"]]}]},{id:"clarifying-questions",title:"Clarifying Questions",blocks:[{type:"markdown",value:"Always spend the first few minutes narrowing scope. For an ATM, the right questions signal you understand both the **hardware** side (cash, card reader, printer) and the **banking** side (accounts, ledgers, consistency)."},{type:"interviewQa",title:"Questions to ask the interviewer",items:[{question:"Is this a single ATM (one machine, in-process) or a fleet of ATMs talking to a central bank server?",answer:"Assume **one physical ATM** as the focus of the class design, communicating with an abstract `BankService`. We will not model the bank's internal distributed ledger \u2014 that is out of scope for this LLD."},{question:"Does the ATM support multiple banks (interoperable network) or only its own bank's cards?",answer:"Support **both** conceptually: `BankService` is an interface, so a `CardIssuerRouter` could pick the right bank implementation from the card's issuer/BIN. We will keep a single `BankService` for simplicity but call this extension out explicitly."},{question:"What operations must be supported?",answer:"Withdraw cash, deposit cash/cheque, check balance, and transfer funds to another account. PIN change is a stretch goal."},{question:"How is cash physically stored, and which denominations are available?",answer:"Assume standard denominations (e.g. 2000, 500, 200, 100) loaded in separate cassettes, each with a finite count that decreases as cash is dispensed."},{question:"What happens if the machine runs out of a denomination needed to make exact change?",answer:"The withdrawal must **fail atomically** before any debit is committed \u2014 either the exact amount can be dispensed with available notes, or the transaction is rejected up front."},{question:"How many PIN attempts are allowed before the card is retained/blocked?",answer:"Three attempts, consistent with real-world ATMs; the card is retained (or the account temporarily locked) on the third failure."},{question:"Is concurrency a concern (e.g. same card used at two ATMs simultaneously)?",answer:"Worth mentioning that the debit must be atomic at the bank/ledger level (e.g. a DB transaction or optimistic lock on `Account.balance`), but the ATM itself processes one session at a time."}]}]},{id:"requirements",title:"Requirements",blocks:[{type:"markdown",value:"### Functional requirements"},{type:"table",headers:["#","Requirement"],rows:[["1","Authenticate the customer via card + PIN (max 3 attempts)."],["2","Allow **cash withdrawal** in multiples of the smallest denomination, up to the account balance and a daily limit."],["3","Allow **cash/cheque deposit**, credited to the account after confirmation."],["4","**Balance inquiry** without any funds movement."],["5","**Fund transfer** between two accounts at the same bank."],["6","Print/display a **receipt** for every completed transaction."],["7","Eject the card at the end of the session, or retain it after repeated failed PIN attempts."],["8","Support cancel at any step before a debit is committed."]]},{type:"markdown",value:"### Non-functional requirements"},{type:"table",headers:["#","Requirement"],rows:[["1","**Consistency over availability**: never dispense cash without a confirmed debit, and never debit without confirmed dispensing."],["2","**Extensibility**: adding a new transaction type or a new bank integration should not require touching existing classes (OCP)."],["3","**Testability**: the ATM must be unit-testable without real hardware \u2014 `CashDispenser` and `BankService` are abstractions/mockable."],["4","**Auditability**: every state transition and transaction is logged."]]},{type:"callout",variant:"warning",title:"The core correctness trap",body:"Withdrawal is a **two-phase operation**: (1) verify funds and reserve/debit at the bank, (2) physically dispense cash. If dispensing fails after the debit succeeds (e.g. denomination shortfall or jam), you must **reverse the debit**. Interviewers love probing this failure path \u2014 have an answer ready."}]},{id:"entities",title:"Core Entities",blocks:[{type:"markdown",value:"Identify the nouns first, then decide which behaviors belong to them. Keep the **bank-side** concepts (`Account`, `BankService`) separate from the **machine-side** concepts (`ATM`, `CashDispenser`, `CardReader`)."},{type:"table",caption:"Entities and their responsibilities.",headers:["Entity","Responsibility"],rows:[["`Card`","Card number, expiry date, linked account id, card status (active/blocked)"],["`Customer`","Name, customer id, list of linked accounts"],["`Account`","Account id, balance, account type (SAVINGS/CURRENT), daily withdrawal limit"],["`Bank`","Owns accounts and cards; implements `BankService`"],["`ATM`","The context object; current cash inventory reference, current `ATMState`, current `Session`"],["`Session`","Transient per-visit state: inserted card, authenticated flag, PIN attempt count"],["`CashDispenser`","Map of denomination \u2192 count; dispenses notes via a pluggable strategy"],["`Transaction`","Abstract base for `WithdrawTransaction`, `DepositTransaction`, `BalanceInquiryTransaction`, `TransferTransaction`"],["`Receipt`","Printable summary: transaction type, amount, timestamp, resulting balance"],["`ATMState`","Interface for the state machine: `IdleState`, `CardInsertedState`, `AuthenticatedState`, `TransactionSelectionState`, `DispensingCashState`"]]},{type:"mermaid",caption:"Enum-like transaction types and their attributes (kept as a sketch, not full UML).",definition:`classDiagram
  class TransactionType {
    <<enumeration>>
    WITHDRAW
    DEPOSIT
    BALANCE_INQUIRY
    TRANSFER
  }
  class AccountType {
    <<enumeration>>
    SAVINGS
    CURRENT
  }
  class CardStatus {
    <<enumeration>>
    ACTIVE
    BLOCKED
    RETAINED
  }`}]},{id:"class-design",title:"Class Design",blocks:[{type:"markdown",value:"The `ATM` is the **context** of a State pattern: it holds a reference to the current `ATMState` and delegates `insertCard`, `enterPin`, `selectTransaction`, and `cancel` to it. The ATM depends on `BankService` (an interface) rather than a concrete `Bank` \u2014 classic **Dependency Inversion** so the machine can be tested with a fake bank and can support multiple real banks later."},{type:"mermaid",caption:"Static structure: ATM, its state machine, banking interface, and cash dispenser.",definition:`classDiagram
  class ATM {
    -id: String
    -state: ATMState
    -session: Session
    -dispenser: CashDispenser
    -bank: BankService
    +insertCard(card) void
    +enterPin(pin) void
    +selectTransaction(type) void
    +cancel() void
    +setState(state) void
  }

  class ATMState {
    <<interface>>
    +insertCard(atm, card) void
    +enterPin(atm, pin) void
    +selectTransaction(atm, type) void
    +cancel(atm) void
  }
  class IdleState
  class CardInsertedState
  class AuthenticatedState
  class DispensingCashState

  ATM --> ATMState
  ATMState <|.. IdleState
  ATMState <|.. CardInsertedState
  ATMState <|.. AuthenticatedState
  ATMState <|.. DispensingCashState

  class Session {
    -card: Card
    -pinAttempts: int
    -authenticated: bool
  }
  ATM --> Session

  class BankService {
    <<interface>>
    +authenticate(cardNo, pin) AuthResult
    +getBalance(accountId) Money
    +debit(accountId, amount) void
    +credit(accountId, amount) void
    +transfer(fromId, toId, amount) void
  }
  class Bank {
    -accounts: Map~String, Account~
    -cards: Map~String, Card~
    +authenticate(cardNo, pin) AuthResult
    +debit(accountId, amount) void
    +credit(accountId, amount) void
  }
  ATM --> BankService
  BankService <|.. Bank

  class Card {
    -cardNumber: String
    -expiry: Date
    -accountId: String
    -pinHash: String
    -status: CardStatus
  }
  class Account {
    -accountId: String
    -balance: Money
    -dailyLimit: Money
    -withdrawnToday: Money
    +debit(amount) void
    +credit(amount) void
  }
  Bank --> "many" Account
  Bank --> "many" Card
  Card --> "1" Account : linked to

  class CashDispenser {
    -inventory: Map~int, int~
    -strategy: DenominationStrategy
    +canDispense(amount) bool
    +dispense(amount) Map~int, int~
  }
  class DenominationStrategy {
    <<interface>>
    +computeNotes(amount, inventory) Map~int, int~
  }
  class GreedyDenominationStrategy
  CashDispenser --> DenominationStrategy
  DenominationStrategy <|.. GreedyDenominationStrategy
  ATM --> CashDispenser

  class Transaction {
    <<abstract>>
    -id: String
    -account: Account
    -timestamp: DateTime
    +execute() TransactionResult
  }
  class WithdrawTransaction
  class DepositTransaction
  class BalanceInquiryTransaction
  class TransferTransaction
  Transaction <|-- WithdrawTransaction
  Transaction <|-- DepositTransaction
  Transaction <|-- BalanceInquiryTransaction
  Transaction <|-- TransferTransaction
  ATM ..> Transaction : creates`},{type:"callout",variant:"tip",title:"Why BankService is an interface",body:"It lets `ATM` be constructed with any bank implementation (real, mock, or multi-bank router) without changing `ATM` code \u2014 the essence of the **Dependency Inversion Principle** and what makes the class unit-testable."},{type:"mermaid",caption:"Chain of Responsibility for the authentication pipeline.",definition:`classDiagram
  class AuthStep {
    <<abstract>>
    -next: AuthStep
    +setNext(step) AuthStep
    +handle(context) void
    #process(context) bool
  }
  class CardStatusCheckStep
  class ExpiryCheckStep
  class PinVerificationStep
  class AttemptLimitStep
  AuthStep <|-- CardStatusCheckStep
  AuthStep <|-- ExpiryCheckStep
  AuthStep <|-- PinVerificationStep
  AuthStep <|-- AttemptLimitStep
  CardStatusCheckStep --> ExpiryCheckStep : next
  ExpiryCheckStep --> PinVerificationStep : next
  PinVerificationStep --> AttemptLimitStep : next`}]},{id:"flows",title:"Key Flows",blocks:[{type:"markdown",value:"### 1. Authenticate (card insert \u2192 PIN entry)"},{type:"mermaid",caption:"Card insertion drives the authentication chain and a state transition.",definition:`sequenceDiagram
  participant U as User
  participant ATM as ATM (context)
  participant S as IdleState
  participant Chain as AuthStep chain
  participant Bank as BankService

  U->>ATM: insertCard(card)
  ATM->>S: insertCard(atm, card)
  S->>ATM: setState(CardInsertedState)
  U->>ATM: enterPin(pin)
  ATM->>Chain: handle(session with pin)
  Chain->>Chain: CardStatusCheckStep.process()
  Chain->>Chain: ExpiryCheckStep.process()
  Chain->>Bank: PinVerificationStep -> authenticate(cardNo, pin)
  Bank-->>Chain: AuthResult(success)
  Chain-->>ATM: authentication OK
  ATM->>ATM: setState(AuthenticatedState)
  ATM-->>U: show transaction menu`},{type:"markdown",value:"### 2. Withdraw cash (the two-phase commit against the bank)"},{type:"mermaid",caption:"Debit is confirmed BEFORE cash leaves the dispenser; a dispensing failure triggers reversal.",definition:`sequenceDiagram
  participant U as User
  participant ATM as ATM
  participant WT as WithdrawTransaction
  participant Bank as BankService
  participant CD as CashDispenser

  U->>ATM: selectTransaction(WITHDRAW, amount)
  ATM->>WT: execute()
  WT->>Bank: getBalance(accountId)
  Bank-->>WT: balance
  WT->>CD: canDispense(amount)
  CD-->>WT: true
  WT->>Bank: debit(accountId, amount)
  Bank-->>WT: ok
  WT->>CD: dispense(amount)
  alt dispensing succeeds
    CD-->>WT: notesDispensed
    WT-->>ATM: TransactionResult(SUCCESS)
    ATM->>U: cash + receipt
  else dispenser jam / mismatch
    CD-->>WT: DispenseException
    WT->>Bank: credit(accountId, amount)  note right of Bank: reversal
    WT-->>ATM: TransactionResult(FAILED)
    ATM->>U: "Unable to dispense cash, no funds deducted"
  end
  ATM->>ATM: setState(IdleState)`},{type:"markdown",value:"### 3. Fund transfer"},{type:"mermaid",caption:"Transfer delegates the atomic move to the bank \u2014 the ATM never juggles two debits itself.",definition:`sequenceDiagram
  participant U as User
  participant ATM as ATM
  participant TT as TransferTransaction
  participant Bank as BankService

  U->>ATM: selectTransaction(TRANSFER, toAccountId, amount)
  ATM->>TT: execute()
  TT->>Bank: transfer(fromAccountId, toAccountId, amount)
  Bank-->>TT: ok / InsufficientFundsException
  TT-->>ATM: TransactionResult
  ATM->>U: receipt / error`}]},{id:"patterns",title:"Design Patterns Used",blocks:[{type:"table",caption:"Where each pattern earns its place.",headers:["Pattern","Applied to","Why"],rows:[["State","`ATM` + `ATMState` hierarchy","The ATM behaves differently at each step (idle, card-inserted, authenticated, dispensing); each state encapsulates its own valid transitions instead of one giant `if/switch`."],["Strategy","`CashDispenser` + `DenominationStrategy`","The note-selection algorithm (greedy, or a smarter DP variant for exotic denominations) is swappable without touching `CashDispenser`."],["Chain of Responsibility","Authentication pipeline (`AuthStep`)","Card status \u2192 expiry \u2192 PIN \u2192 attempt-limit checks are independent, ordered, and each can short-circuit \u2014 new checks (e.g. fraud score) slot in without touching existing steps."],["Dependency Inversion","`ATM` depends on `BankService` interface","Decouples the machine from a specific bank's ledger implementation; enables mocking in tests and multi-bank support."],["Factory Method","`TransactionFactory.create(type, ...)`","Centralizes construction of the right `Transaction` subclass from a `TransactionType`, keeping `ATM` free of a big switch statement."],["Command (optional)","`Transaction.execute()`","Each transaction is a self-contained, executable, loggable unit \u2014 useful if you want an undo/audit trail."]]},{type:"callout",variant:"tip",title:"State vs Strategy \u2014 a common interview mix-up",body:"The `ATM` **state** changes itself based on internal events (card inserted \u2192 PIN entered \u2192 authenticated). The dispensing **strategy** is chosen once (or configured) and does not change itself based on internal events \u2014 the client picks which algorithm to run. Be ready to articulate this distinction."}]},{id:"implementation",title:"Implementation Sketch",blocks:[{type:"markdown",value:"### State machine \u2014 context and one concrete state"},{type:"code",language:"java",filename:"ATMState.java",code:`public interface ATMState {
  default void insertCard(ATM atm, Card card) { throw new IllegalStateException("Cannot insert card now"); }
  default void enterPin(ATM atm, String pin) { throw new IllegalStateException("Cannot enter PIN now"); }
  default void selectTransaction(ATM atm, TransactionType type, Money amount, String toAccountId) {
    throw new IllegalStateException("Cannot select transaction now");
  }
  default void cancel(ATM atm) { throw new IllegalStateException("Nothing to cancel"); }
}`},{type:"code",language:"java",filename:"ATM.java",code:`public class ATM {
  private final String id;
  private final CashDispenser dispenser;
  private final BankService bank;
  private final AuthStep authChain;

  private ATMState state;
  private Session session;

  public ATM(String id, CashDispenser dispenser, BankService bank, AuthStep authChain) {
    this.id = id;
    this.dispenser = dispenser;
    this.bank = bank;
    this.authChain = authChain;
    this.state = new IdleState();
  }

  public void insertCard(Card card) { state.insertCard(this, card); }
  public void enterPin(String pin) { state.enterPin(this, pin); }
  public void selectTransaction(TransactionType type, Money amount, String toAccountId) {
    state.selectTransaction(this, type, amount, toAccountId);
  }
  public void cancel() { state.cancel(this); }

  void setState(ATMState state) { this.state = state; }
  ATMState getState() { return state; }
  Session getSession() { return session; }
  void setSession(Session session) { this.session = session; }
  CashDispenser getDispenser() { return dispenser; }
  BankService getBank() { return bank; }
  AuthStep getAuthChain() { return authChain; }
}`},{type:"code",language:"java",filename:"IdleState.java",code:`public class IdleState implements ATMState {
  @Override
  public void insertCard(ATM atm, Card card) {
    if (card.getStatus() != CardStatus.ACTIVE) {
      throw new CardBlockedException(card.getCardNumber());
    }
    atm.setSession(new Session(card));
    atm.setState(new CardInsertedState());
  }
}`},{type:"code",language:"java",filename:"CardInsertedState.java",code:`public class CardInsertedState implements ATMState {
  @Override
  public void enterPin(ATM atm, String pin) {
    Session session = atm.getSession();
    AuthContext ctx = new AuthContext(session.getCard(), pin, session);

    boolean ok = atm.getAuthChain().handle(ctx, atm.getBank());
    if (!ok) {
      session.incrementFailedAttempts();
      if (session.getFailedAttempts() >= 3) {
        atm.getBank().blockCard(session.getCard().getCardNumber());
        atm.setState(new IdleState());
        throw new CardRetainedException("Too many wrong attempts; card retained.");
      }
      throw new InvalidPinException("Incorrect PIN, " + (3 - session.getFailedAttempts()) + " attempt(s) left");
    }
    session.setAuthenticated(true);
    atm.setState(new AuthenticatedState());
  }

  @Override
  public void cancel(ATM atm) { atm.setState(new IdleState()); }
}`},{type:"markdown",value:"### Chain of Responsibility \u2014 authentication pipeline"},{type:"code",language:"java",filename:"AuthStep.java",code:`public abstract class AuthStep {
  private AuthStep next;

  public AuthStep setNext(AuthStep next) {
    this.next = next;
    return next;
  }

  /** Returns true if authentication should continue; false to short-circuit as a failure. */
  public final boolean handle(AuthContext ctx, BankService bank) {
    if (!process(ctx, bank)) {
      return false;
    }
    return next == null || next.handle(ctx, bank);
  }

  protected abstract boolean process(AuthContext ctx, BankService bank);
}

public class CardStatusCheckStep extends AuthStep {
  protected boolean process(AuthContext ctx, BankService bank) {
    return ctx.getCard().getStatus() == CardStatus.ACTIVE;
  }
}

public class ExpiryCheckStep extends AuthStep {
  protected boolean process(AuthContext ctx, BankService bank) {
    return ctx.getCard().getExpiry().isAfter(LocalDate.now());
  }
}

public class PinVerificationStep extends AuthStep {
  protected boolean process(AuthContext ctx, BankService bank) {
    AuthResult result = bank.authenticate(ctx.getCard().getCardNumber(), ctx.getPin());
    return result.isSuccess();
  }
}

// Wiring the chain once, e.g. in a factory / DI config:
AuthStep chain = new CardStatusCheckStep();
chain.setNext(new ExpiryCheckStep()).setNext(new PinVerificationStep());`},{type:"markdown",value:"### Strategy \u2014 greedy denomination dispensing"},{type:"code",language:"java",filename:"CashDispenser.java",code:`public class CashDispenser {
  private final NavigableMap<Integer, Integer> inventory; // denomination -> count, sorted descending
  private final DenominationStrategy strategy;

  public CashDispenser(Map<Integer, Integer> initial, DenominationStrategy strategy) {
    this.inventory = new TreeMap<>(Comparator.reverseOrder());
    this.inventory.putAll(initial);
    this.strategy = strategy;
  }

  public synchronized boolean canDispense(int amount) {
    return strategy.computeNotes(amount, inventory) != null;
  }

  public synchronized Map<Integer, Integer> dispense(int amount) {
    Map<Integer, Integer> notes = strategy.computeNotes(amount, inventory);
    if (notes == null) {
      throw new InsufficientCashException("Cannot dispense " + amount + " with available denominations");
    }
    notes.forEach((denomination, count) ->
        inventory.merge(denomination, -count, Integer::sum));
    return notes;
  }
}

public interface DenominationStrategy {
  /** Returns denomination -> count needed, or null if the amount cannot be made exactly. */
  Map<Integer, Integer> computeNotes(int amount, NavigableMap<Integer, Integer> inventory);
}

public class GreedyDenominationStrategy implements DenominationStrategy {
  @Override
  public Map<Integer, Integer> computeNotes(int amount, NavigableMap<Integer, Integer> inventory) {
    Map<Integer, Integer> result = new LinkedHashMap<>();
    int remaining = amount;

    for (Map.Entry<Integer, Integer> entry : inventory.entrySet()) {
      int denomination = entry.getKey();
      int available = entry.getValue();
      int notesNeeded = Math.min(remaining / denomination, available);
      if (notesNeeded > 0) {
        result.put(denomination, notesNeeded);
        remaining -= notesNeeded * denomination;
      }
    }
    return remaining == 0 ? result : null; // greedy fails to cover -> caller can fall back to DP strategy
  }
}`},{type:"callout",variant:"note",title:"Greedy is not always optimal",body:'Greedy works for canonical denomination sets (like 2000/500/200/100/50). For arbitrary sets it can fail to find a valid combination even when one exists. Mention a **DP-based "coin change" strategy** (`DpDenominationStrategy`) as a drop-in alternative \u2014 this is exactly why it is a `Strategy`.'},{type:"markdown",value:"### Transaction hierarchy and the bank interface"},{type:"code",language:"java",filename:"Transaction.java",code:`public abstract class Transaction {
  protected final String id = UUID.randomUUID().toString();
  protected final Account account;
  protected final Instant timestamp = Instant.now();

  protected Transaction(Account account) { this.account = account; }

  public abstract TransactionResult execute();
}

public class WithdrawTransaction extends Transaction {
  private final Money amount;
  private final BankService bank;
  private final CashDispenser dispenser;

  public WithdrawTransaction(Account account, Money amount, BankService bank, CashDispenser dispenser) {
    super(account);
    this.amount = amount;
    this.bank = bank;
    this.dispenser = dispenser;
  }

  @Override
  public TransactionResult execute() {
    if (amount.isGreaterThan(bank.getBalance(account.getId()))) {
      return TransactionResult.failed("Insufficient funds");
    }
    if (!dispenser.canDispense(amount.toMinorUnits())) {
      return TransactionResult.failed("ATM cannot dispense this amount right now");
    }

    bank.debit(account.getId(), amount);
    try {
      Map<Integer, Integer> notes = dispenser.dispense(amount.toMinorUnits());
      return TransactionResult.success(id, amount, notes);
    } catch (InsufficientCashException e) {
      bank.credit(account.getId(), amount); // reversal: keep bank and dispenser consistent
      return TransactionResult.failed("Dispensing failed, transaction reversed");
    }
  }
}

public interface BankService {
  AuthResult authenticate(String cardNumber, String pin);
  Money getBalance(String accountId);
  void debit(String accountId, Money amount);
  void credit(String accountId, Money amount);
  void transfer(String fromAccountId, String toAccountId, Money amount);
  void blockCard(String cardNumber);
}`}]},{id:"extensions",title:"Extensions and Follow-ups",blocks:[{type:"markdown",value:"Interviewers often push into one of these directions after the base design is solid:"},{type:"table",headers:["Extension","Design change"],rows:[["Multi-bank ATM network","Introduce a `BankRouter` that inspects the card BIN/issuer and picks the right `BankService`; `ATM` still only knows the interface."],["Multi-currency","`Money` becomes a value object with currency; `CashDispenser` becomes per-currency, and `DenominationStrategy` operates per currency."],["Cardless / mobile withdrawal","Add a `WithdrawalCode` entity generated by a mobile app; a new `CodeInsertedState` replaces `CardInsertedState` in that flow \u2014 the rest of the state machine is untouched."],["Fraud detection","Add a `FraudCheckStep` into the `AuthStep` chain (e.g. velocity checks, geo-mismatch) without touching existing steps."],["Offline resilience","Queue debits locally if the bank link drops, replay on reconnect with idempotency keys per transaction id \u2014 call out eventual consistency risk."],["Concurrent access to one account","Bank-side optimistic locking (`version` column) or a per-account mutex/DB row lock so two ATMs cannot both debit past the balance."]]},{type:"callout",variant:"warning",title:"Common pitfall to avoid",body:"Don't let `ATM` know about `Account` internals or SQL \u2014 it should only ever talk to `BankService`. Leaking bank-side details into the machine class is the fastest way to fail an LLD interview on separation of concerns."}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Walk me through your class design for an ATM.",answer:"`ATM` is the context of a **State** machine (`ATMState`), delegating card insertion, PIN entry, and transaction selection to the current state. It depends on a `BankService` interface (not a concrete `Bank`) and a `CashDispenser` that uses a swappable `DenominationStrategy`. Transactions (`WithdrawTransaction`, `DepositTransaction`, ...) extend a common `Transaction` base and each implement `execute()`."},{question:"Why model the ATM as a state machine instead of boolean flags?",answer:"With flags (`cardInserted`, `authenticated`, ...) every method needs nested conditionals to check which combination is valid, and invalid combinations are possible by construction. A `State` object makes only the valid operations available in each phase, and adding a new phase (e.g. `DispensingCashState`) does not touch existing state classes \u2014 Open/Closed in practice."},{question:"How do you guarantee the bank is never debited without cash being dispensed, or vice versa?",answer:"Debit **first**, then dispense. If dispensing throws (jam, denomination shortfall), immediately **credit back** the same amount before returning a failure \u2014 a manual compensating transaction, i.e. a lightweight saga. The alternative \u2014 dispense first, debit after \u2014 risks giving away cash with no way to claw it back, so debit-then-dispense-then-compensate is the safer order."},{question:"Why is CashDispenser a Strategy rather than a hardcoded loop?",answer:'The "which notes to use" decision is an algorithm in its own right. Greedy is fast but not optimal/complete for arbitrary denominations; a DP "coin change" variant is complete but slower. Wrapping this behind `DenominationStrategy` lets you swap algorithms (or unit test each in isolation) without touching `CashDispenser`.'},{question:"Why Chain of Responsibility for authentication instead of one big if/else?",answer:"Card-status, expiry, PIN, and attempt-limit checks are independent, ordered rules that can each short-circuit the pipeline. Chain of Responsibility lets you add, remove, or reorder checks (e.g. insert a fraud-score step) by rewiring the chain, without editing existing step classes."},{question:"How would you support multiple banks from one ATM?",answer:"Keep `BankService` as the interface `ATM` depends on. Add a `BankRouter implements BankService` that inspects the card's issuer/BIN and delegates to the correct concrete bank client. `ATM` code does not change at all \u2014 this is the Dependency Inversion Principle paying off."},{question:"What happens on 3 consecutive wrong PIN attempts?",answer:'The `Session` tracks `failedAttempts`. On the 3rd failure the `CardInsertedState` calls `bank.blockCard(...)` (or retains the card physically), transitions the ATM back to `IdleState`, and surfaces a "card retained" message \u2014 it never lets the user retry a 4th time.'},{question:"How do you unit test the ATM without real hardware?",answer:"Because `ATM` only depends on the `BankService` and `DenominationStrategy` interfaces, tests inject fakes/mocks: a fake `BankService` returning canned balances/auth results, and a fake dispenser inventory. You assert state transitions and `TransactionResult`s without touching any physical device."},{question:"Withdraw vs Transfer \u2014 why do they look structurally different in your design?",answer:"Withdrawal moves money **out of the bank into the physical world** (cash), so the ATM must locally coordinate a debit + a dispense + a possible reversal. Transfer moves money **between two bank accounts only** \u2014 no physical component \u2014 so it can delegate entirely to `bank.transfer(...)` and let the bank guarantee atomicity server-side."},{question:"How would you add a daily withdrawal limit?",answer:"Track `withdrawnToday` on `Account` (or as a counter in the bank's ledger), reset by a scheduled job at midnight. `WithdrawTransaction.execute()` checks `amount + withdrawnToday <= dailyLimit` before debiting \u2014 a simple guard clause, no new pattern needed."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Model the ATM session as a **State machine** (\`Idle \u2192 CardInserted \u2192 Authenticated \u2192 Dispensing\`).
2. Keep the machine decoupled from banking logic via a **BankService interface** (DIP).
3. Use **Chain of Responsibility** for the ordered, short-circuiting authentication checks.
4. Use **Strategy** for the denomination/dispensing algorithm so it can evolve independently.
5. Withdrawal is a **two-phase, compensable** operation: debit \u2192 dispense \u2192 reverse-on-failure.`}]}]},n=t;export{n as default};
