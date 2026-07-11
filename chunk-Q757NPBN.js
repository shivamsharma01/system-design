import{a as e}from"./chunk-B2COXE6J.js";import"./chunk-IFGU66OU.js";var a={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:'Design a **Library Management System** that lets members search a catalog, **borrow** and **return** physical books, **reserve** a book that is currently checked out, and pay **fines** on overdue returns. Librarians manage the catalog and physical inventory. This is a classic "many copies of one work" modelling exercise: a `Book` (the abstract work) is distinct from a `BookItem` (a physical, barcoded copy that actually gets loaned).'},{type:"callout",variant:"info",title:"What interviewers are really testing",body:"The **Book vs BookItem** split is the single most important modelling decision. Beyond that: a clean **Loan/Reservation** lifecycle, a pluggable **fine calculation** algorithm, and how the system **notifies** a waiting member when their reserved book becomes available without polling."},{type:"table",caption:"System at a glance.",headers:["Piece","Role"],rows:[["`Book`","Catalog metadata: title, authors, ISBN, subject \u2014 one row per distinct work"],["`BookItem`","One physical, barcoded copy of a `Book`; carries loan status and rack location"],["`Member` / `Librarian`","Account holders \u2014 members borrow, librarians manage catalog and check-in/out"],["`Loan`","A record of a `BookItem` borrowed by a `Member`, with due date and return date"],["`Reservation`","A hold placed by a `Member` on a currently-unavailable `Book`"],["`FineCalculator`","Strategy that computes the overdue fine for a `Loan`"],["`Catalog`","Search index over `Book`s by title/author/subject/ISBN"]]}]},{id:"clarifying-questions",title:"Clarifying Questions",blocks:[{type:"interviewQa",title:"Questions to ask the interviewer",items:[{question:"Are we modelling a single branch, or a multi-branch library network with inter-branch transfers?",answer:"Start with a **single branch**. Mention that `BookItem` could carry a `branchId` and a `TransferRequest` entity would extend the design for inter-branch loans \u2014 but keep that out of the core model."},{question:"How many copies of a book can be reserved at once, and how is the queue ordered?",answer:"Any number of members can reserve a `Book`; reservations are served **FIFO** \u2014 first to reserve is first offered the next returned copy."},{question:"What happens if a member does not pick up a reserved book in time?",answer:"The reservation expires after a hold window (e.g. 3 days) and the copy is offered to the next member in the queue."},{question:"Is there a limit on how many books a member can borrow simultaneously?",answer:"Yes \u2014 a per-member-type cap (e.g. 5 for regular members, 10 for faculty) enforced at checkout time."},{question:"How are fines calculated \u2014 flat rate, per day, capped?",answer:"Per-day-overdue with a cap at the item's replacement cost; different member/book types may have different rates, which is why fine calculation should be a swappable strategy."},{question:"Do lost/damaged books need to be modelled?",answer:"Yes at a basic level: a `BookItem` can move to a `LOST` status, which stops it from being loanable and can trigger a replacement-cost charge \u2014 we will note this as a status value, not build a full claims workflow."}]}]},{id:"requirements",title:"Requirements",blocks:[{type:"markdown",value:"### Functional requirements"},{type:"table",headers:["#","Requirement"],rows:[["1","Search the catalog by title, author, subject, or ISBN."],["2","Check out an **available** `BookItem` to a `Member`, creating a `Loan` with a due date."],["3","Return a `BookItem`, closing the `Loan` and computing any overdue fine."],["4","Reserve a `Book` that has no available copies; notify the member when one is returned."],["5","Enforce a max-books-borrowed cap per member type."],["6","Librarians can add/remove `Book`s and `BookItem`s, and mark items lost/damaged."],["7","Members can view their current loans, due dates, and outstanding fines."]]},{type:"markdown",value:"### Non-functional requirements"},{type:"table",headers:["#","Requirement"],rows:[["1","**Extensibility**: new fine policies or member types should not require changing checkout/return code (OCP)."],["2","**Consistency**: a `BookItem` must never be loaned to two members at once."],["3","**Decoupled notifications**: the loan/return flow should not hardcode *how* members are notified (email/SMS/push)."],["4","**Fast search**: catalog lookups by title/author/subject should not require scanning every book linearly in a real implementation (index by key)."]]}]},{id:"entities",title:"Core Entities",blocks:[{type:"markdown",value:'The most important distinction in this domain: a **Book** is the abstract catalog entry ("Clean Code" by Robert Martin); a **BookItem** is one physical copy with a barcode that actually sits on a shelf or in someone\'s bag. A `Loan` always references a `BookItem`, never a `Book` directly.'},{type:"table",caption:"Entities and their responsibilities.",headers:["Entity","Responsibility"],rows:[["`Book`","ISBN, title, authors, subject, publication year \u2014 shared metadata across all copies"],["`BookItem`","Barcode, rack location, `BookItemStatus` (AVAILABLE/LOANED/RESERVED/LOST), reference to its `Book`"],["`Member`","Member id, contact info, `MemberType` (REGULAR/FACULTY), active loans, outstanding fines"],["`Librarian`","Staff account with catalog-management privileges"],["`Loan`","BookItem, Member, checkout date, due date, return date (nullable), fine (nullable)"],["`Reservation`","Book, Member, reservation date, expiry, status (PENDING/FULFILLED/EXPIRED)"],["`FineCalculator`","Strategy interface: computes fine for a returned `Loan`"],["`Catalog`","Indexes `Book`s by title/author/subject/ISBN for search"],["`NotificationService`","Observer subject that publishes book-availability events to interested members"]]},{type:"mermaid",caption:"Status enums driving the lending lifecycle.",definition:`classDiagram
  class BookItemStatus {
    <<enumeration>>
    AVAILABLE
    LOANED
    RESERVED
    LOST
  }
  class MemberType {
    <<enumeration>>
    REGULAR
    FACULTY
  }
  class ReservationStatus {
    <<enumeration>>
    PENDING
    FULFILLED
    EXPIRED
    CANCELLED
  }`}]},{id:"class-design",title:"Class Design",blocks:[{type:"markdown",value:"`LibraryService` (the facade) coordinates `Catalog`, `Loan`/`Reservation` bookkeeping, a pluggable `FineCalculator`, and a `NotificationService` that members subscribe to for availability alerts."},{type:"mermaid",caption:"Static structure: catalog, physical copies, members, and lending records.",definition:`classDiagram
  class Book {
    -isbn: String
    -title: String
    -authors: List~String~
    -subject: String
    -publishedYear: int
  }
  class BookItem {
    -barcode: String
    -rackLocation: String
    -status: BookItemStatus
    -book: Book
    +checkout() void
    +returnItem() void
  }
  Book "1" --> "many" BookItem : has copies

  class Catalog {
    -byTitle: Map~String, List~Book~~
    -byAuthor: Map~String, List~Book~~
    -bySubject: Map~String, List~Book~~
    +searchByTitle(title) List~Book~
    +searchByAuthor(author) List~Book~
    +addBook(book) void
  }
  Catalog --> "many" Book

  class Member {
    -id: String
    -name: String
    -type: MemberType
    -activeLoans: List~Loan~
    -outstandingFines: Money
    +canBorrow() bool
  }
  class Librarian {
    -id: String
    -name: String
    +addBookItem(item) void
    +markLost(item) void
  }

  class Loan {
    -id: String
    -item: BookItem
    -member: Member
    -checkoutDate: Date
    -dueDate: Date
    -returnDate: Date
    -fine: Money
  }
  Loan --> "1" BookItem
  Loan --> "1" Member

  class Reservation {
    -id: String
    -book: Book
    -member: Member
    -status: ReservationStatus
    -reservedAt: Date
    -expiresAt: Date
  }
  Reservation --> "1" Book
  Reservation --> "1" Member

  class FineCalculator {
    <<interface>>
    +calculate(loan) Money
  }
  class DailyRateFineCalculator
  class TieredFineCalculator
  FineCalculator <|.. DailyRateFineCalculator
  FineCalculator <|.. TieredFineCalculator

  class LibraryService {
    -catalog: Catalog
    -fineCalculator: FineCalculator
    -notifier: NotificationService
    +checkout(memberId, barcode) Loan
    +returnBook(barcode) Money
    +reserve(memberId, isbn) Reservation
  }
  LibraryService --> Catalog
  LibraryService --> FineCalculator
  LibraryService ..> Loan : creates
  LibraryService ..> Reservation : creates`},{type:"mermaid",caption:"Observer pattern: members subscribe to availability events for a book they reserved.",definition:`classDiagram
  class NotificationService {
    <<subject>>
    -subscribers: Map~String, List~BookAvailabilityObserver~~
    +subscribe(isbn, observer) void
    +notifyAvailable(isbn) void
  }
  class BookAvailabilityObserver {
    <<interface>>
    +onBookAvailable(book) void
  }
  class EmailNotifier
  class SmsNotifier
  BookAvailabilityObserver <|.. EmailNotifier
  BookAvailabilityObserver <|.. SmsNotifier
  NotificationService --> "many" BookAvailabilityObserver`}]},{id:"flows",title:"Key Flows",blocks:[{type:"markdown",value:"### 1. Checkout"},{type:"mermaid",caption:"Checkout enforces the borrow cap and flips item status atomically.",definition:`sequenceDiagram
  participant L as Librarian/Kiosk
  participant Svc as LibraryService
  participant M as Member
  participant Item as BookItem

  L->>Svc: checkout(memberId, barcode)
  Svc->>M: canBorrow()
  M-->>Svc: true (under cap)
  Svc->>Item: status == AVAILABLE ?
  Item-->>Svc: yes
  Svc->>Item: checkout()  note right of Item: status -> LOANED
  Svc->>Svc: create Loan(item, member, dueDate = today+14)
  Svc-->>L: Loan created`},{type:"markdown",value:"### 2. Return with fine calculation"},{type:"mermaid",caption:"Return closes the loan, computes an overdue fine via the strategy, and triggers reservation fulfillment.",definition:`sequenceDiagram
  participant L as Librarian/Kiosk
  participant Svc as LibraryService
  participant Fine as FineCalculator
  participant Item as BookItem
  participant Notif as NotificationService

  L->>Svc: returnBook(barcode)
  Svc->>Svc: find open Loan for item
  Svc->>Fine: calculate(loan)
  Fine-->>Svc: fineAmount (0 if on time)
  Svc->>Svc: loan.returnDate = today; loan.fine = fineAmount
  Svc->>Item: returnItem()
  alt reservations exist for this Book
    Item->>Item: status -> RESERVED
    Svc->>Notif: notifyAvailable(isbn)
    Notif->>Notif: notify first PENDING reservation's observer
  else no reservations
    Item->>Item: status -> AVAILABLE
  end
  Svc-->>L: fineAmount`},{type:"markdown",value:"### 3. Reserve an unavailable book"},{type:"mermaid",caption:"Reserving subscribes the member as an observer for that ISBN.",definition:`sequenceDiagram
  participant Mem as Member
  participant Svc as LibraryService
  participant Cat as Catalog
  participant Notif as NotificationService

  Mem->>Svc: reserve(memberId, isbn)
  Svc->>Cat: findAvailableItem(isbn)
  Cat-->>Svc: none available
  Svc->>Svc: create Reservation(book, member, status=PENDING)
  Svc->>Notif: subscribe(isbn, memberObserver)
  Svc-->>Mem: Reservation confirmed, position in queue`}]},{id:"patterns",title:"Design Patterns Used",blocks:[{type:"table",caption:"Where each pattern earns its place.",headers:["Pattern","Applied to","Why"],rows:[["Strategy","`FineCalculator`","Fine policy (flat daily rate, tiered rate, member-type discounts) varies independently of the checkout/return flow \u2014 swap the implementation, not the caller."],["Observer","`NotificationService` + `BookAvailabilityObserver`","Members reserving a book should be notified when it becomes available without `LibraryService` knowing *how* (email vs SMS) or *who* is listening."],["Singleton (optional)","`Catalog`","A single in-memory search index is a reasonable Singleton candidate in a simple deployment \u2014 but prefer DI-managed single instance over a static `getInstance()` in real code."],["Facade","`LibraryService`","Presents one simple API (`checkout`, `returnBook`, `reserve`) over `Catalog`, `FineCalculator`, and `NotificationService`, hiding their coordination."],["Factory Method","Creating the right `Loan`/`Reservation` with default due/expiry dates","Centralizes date-policy logic (loan period, hold window) in one place instead of scattering `+14 days` literals."]]},{type:"callout",variant:"tip",title:"Observer avoids polling",body:`Without Observer, the alternative is members' apps **polling** "is this book back yet?" \u2014 wasteful and laggy. Observer pushes the event exactly once, to exactly the subscribers who care about that ISBN.`}]},{id:"implementation",title:"Implementation Sketch",blocks:[{type:"markdown",value:"### Book vs BookItem, and status transitions"},{type:"code",language:"java",filename:"BookItem.java",code:`public class BookItem {
  private final String barcode;
  private final Book book;
  private String rackLocation;
  private BookItemStatus status = BookItemStatus.AVAILABLE;

  public BookItem(String barcode, Book book, String rackLocation) {
    this.barcode = barcode;
    this.book = book;
    this.rackLocation = rackLocation;
  }

  public void checkout() {
    if (status != BookItemStatus.AVAILABLE) {
      throw new IllegalStateException("Item " + barcode + " is not available");
    }
    status = BookItemStatus.LOANED;
  }

  public void markReturned(boolean hasWaitingReservation) {
    status = hasWaitingReservation ? BookItemStatus.RESERVED : BookItemStatus.AVAILABLE;
  }

  public void markLost() { status = BookItemStatus.LOST; }

  public BookItemStatus getStatus() { return status; }
  public Book getBook() { return book; }
  public String getBarcode() { return barcode; }
}`},{type:"markdown",value:"### Strategy \u2014 fine calculation"},{type:"code",language:"java",filename:"FineCalculator.java",code:`public interface FineCalculator {
  Money calculate(Loan loan);
}

public class DailyRateFineCalculator implements FineCalculator {
  private final Money perDayRate;
  private final Money cap;

  public DailyRateFineCalculator(Money perDayRate, Money cap) {
    this.perDayRate = perDayRate;
    this.cap = cap;
  }

  @Override
  public Money calculate(Loan loan) {
    long overdueDays = daysBetween(loan.getDueDate(), loan.getReturnDate());
    if (overdueDays <= 0) return Money.zero();
    Money fine = perDayRate.multiply(overdueDays);
    return fine.min(cap);
  }

  private long daysBetween(LocalDate due, LocalDate returned) {
    return Math.max(0, ChronoUnit.DAYS.between(due, returned));
  }
}

public class TieredFineCalculator implements FineCalculator {
  // e.g. 1-3 days: flat fee; 4+ days: escalating rate. Same interface, different math.
  @Override
  public Money calculate(Loan loan) { /* tiered logic */ return Money.zero(); }
}`},{type:"markdown",value:"### Observer \u2014 availability notifications"},{type:"code",language:"java",filename:"NotificationService.java",code:`public interface BookAvailabilityObserver {
  void onBookAvailable(Book book);
}

public class NotificationService {
  private final Map<String, List<BookAvailabilityObserver>> subscribersByIsbn = new HashMap<>();

  public void subscribe(String isbn, BookAvailabilityObserver observer) {
    subscribersByIsbn.computeIfAbsent(isbn, k -> new ArrayList<>()).add(observer);
  }

  public void notifyAvailable(Book book) {
    List<BookAvailabilityObserver> observers = subscribersByIsbn.getOrDefault(book.getIsbn(), List.of());
    for (BookAvailabilityObserver observer : observers) {
      observer.onBookAvailable(book); // fan-out; first-come-first-served handled by caller
    }
  }
}

public class MemberEmailObserver implements BookAvailabilityObserver {
  private final Member member;
  private final EmailClient emailClient;

  public MemberEmailObserver(Member member, EmailClient emailClient) {
    this.member = member;
    this.emailClient = emailClient;
  }

  @Override
  public void onBookAvailable(Book book) {
    emailClient.send(member.getEmail(), "Your reserved book is available: " + book.getTitle());
  }
}`},{type:"markdown",value:"### Facade \u2014 LibraryService tying it together"},{type:"code",language:"java",filename:"LibraryService.java",code:`public class LibraryService {
  private final Catalog catalog;
  private final FineCalculator fineCalculator;
  private final NotificationService notifier;
  private final Map<String, Loan> activeLoansByBarcode = new HashMap<>();
  private final Map<String, Deque<Reservation>> reservationQueueByIsbn = new HashMap<>();

  public LibraryService(Catalog catalog, FineCalculator fineCalculator, NotificationService notifier) {
    this.catalog = catalog;
    this.fineCalculator = fineCalculator;
    this.notifier = notifier;
  }

  public Loan checkout(Member member, BookItem item) {
    if (!member.canBorrow()) {
      throw new BorrowLimitExceededException(member.getId());
    }
    item.checkout();
    Loan loan = new Loan(item, member, LocalDate.now(), LocalDate.now().plusDays(14));
    activeLoansByBarcode.put(item.getBarcode(), loan);
    member.addLoan(loan);
    return loan;
  }

  public Money returnBook(BookItem item) {
    Loan loan = activeLoansByBarcode.remove(item.getBarcode());
    loan.setReturnDate(LocalDate.now());
    Money fine = fineCalculator.calculate(loan);
    loan.setFine(fine);
    loan.getMember().addFine(fine);
    loan.getMember().removeLoan(loan);

    Deque<Reservation> queue = reservationQueueByIsbn.get(item.getBook().getIsbn());
    boolean hasWaiting = queue != null && !queue.isEmpty();
    item.markReturned(hasWaiting);
    if (hasWaiting) {
      notifier.notifyAvailable(item.getBook());
    }
    return fine;
  }

  public Reservation reserve(Member member, Book book) {
    Reservation reservation = new Reservation(book, member, LocalDate.now(), LocalDate.now().plusDays(3));
    reservationQueueByIsbn
        .computeIfAbsent(book.getIsbn(), k -> new ArrayDeque<>())
        .addLast(reservation);
    notifier.subscribe(book.getIsbn(), new MemberEmailObserver(member, new EmailClient()));
    return reservation;
  }
}`}]},{id:"extensions",title:"Extensions and Follow-ups",blocks:[{type:"table",headers:["Extension","Design change"],rows:[["Multi-branch library",'Add `branchId` on `BookItem`; `Catalog` search becomes branch-aware or global with a "request transfer" flow.'],["E-books / digital copies","Introduce `DigitalBookItem` with concurrent-license count instead of a single physical copy \u2014 same `Loan` model, different availability check."],["Waitlist fairness / expiry","A scheduled job scans `Reservation`s past `expiresAt`, marks them `EXPIRED`, and offers the item to the next member in the FIFO queue."],["Different member tiers","Borrow cap and loan duration become part of a `MembershipPolicy` looked up by `MemberType` \u2014 another Strategy-shaped extension point."],["Self-checkout kiosks / RFID","`BookItem.checkout()`/`returnItem()` stay the same; only the caller (kiosk vs librarian desk) changes, since the domain logic is UI-agnostic."]]},{type:"callout",variant:"warning",title:"Common pitfall to avoid",body:'Don\'t merge `Book` and `BookItem` into one class "to keep it simple" \u2014 you will not be able to represent "3 copies, 1 available" or per-copy rack location and status, which is the crux of the domain.'}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Why separate Book and BookItem?",answer:'`Book` is catalog metadata shared by every copy (title, ISBN, authors). `BookItem` is one **physical, barcoded** copy with its own status and location. A `Loan` always references a specific `BookItem` \u2014 you cannot lend "the concept of Clean Code", only one physical copy of it.'},{question:"How do you prevent double-checkout of the same physical copy?",answer:"`BookItem.checkout()` guards on `status == AVAILABLE` and flips it to `LOANED` atomically (in a real system, under a DB row lock / optimistic version check on the item row) before a `Loan` is created \u2014 the status check-and-set must be a single atomic operation."},{question:"Why is FineCalculator a Strategy instead of a method on Loan?",answer:"Fine policy varies by library, member type, or promotion (e.g. daily flat rate vs tiered vs waived for faculty) and changes independently of the `Loan` entity itself. Strategy lets you swap or A/B test policies without touching `Loan` or the checkout/return flow."},{question:"Walk through what happens when a reserved book is returned.",answer:"On return, `LibraryService` checks the reservation queue for that ISBN. If non-empty, the `BookItem` status becomes `RESERVED` (not `AVAILABLE`) and `NotificationService.notifyAvailable()` pushes an event to the first waiting member's observer \u2014 they get a fixed window to pick it up before it is offered to the next person."},{question:"Why Observer for notifications instead of the return flow calling the member directly?",answer:'`LibraryService` should not know or care whether notification happens via email, SMS, or push. Observer decouples "an event happened" from "who reacts to it and how" \u2014 new notification channels are new `BookAvailabilityObserver` implementations, zero changes to `LibraryService`.'},{question:"How would you make catalog search fast for a large library?",answer:"Maintain inverted indexes (`Map<String, List<Book>>`) by title token, author, and subject rather than scanning every `Book` linearly; in a production system this maps to a search engine (Elasticsearch) or DB indexes rather than in-memory maps."},{question:"What is the difference between a Reservation and a Loan?",answer:"A `Loan` represents an active, physical checkout of a specific `BookItem`. A `Reservation` is a **hold on a Book** (the work, not a specific copy) when no copy is currently available \u2014 it converts into a `Loan` once a copy is offered and picked up."},{question:"How do you enforce a per-member borrow limit cleanly?",answer:"`Member.canBorrow()` checks `activeLoans.size() < policy.maxBooks(memberType)` before `LibraryService.checkout()` proceeds \u2014 a guard clause at the entry point, keeping the cap logic in one place (`MembershipPolicy`) rather than duplicated across call sites."},{question:"How would you extend this design for e-books with limited concurrent licenses?",answer:'Model a `DigitalBookItem` (or a `licenseCount` on `Book`) where "availability" means `activeDigitalLoans < licenseCount` instead of a single physical status flag \u2014 the `Loan`, `Reservation`, and notification flows are reused unchanged; only the availability check differs.'}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:"1. Split **Book** (catalog metadata) from **BookItem** (physical, barcoded copy) \u2014 this is the crux of the domain.\n2. `Loan` and `Reservation` are separate lifecycles: Loan = active checkout of a copy; Reservation = a hold on the work.\n3. **Strategy** for fine calculation, **Observer** for availability notifications \u2014 both keep `LibraryService` stable as policies evolve.\n4. `LibraryService` acts as a **Facade** over catalog search, lending, and notifications."}]}]},o=a;export{o as default};
