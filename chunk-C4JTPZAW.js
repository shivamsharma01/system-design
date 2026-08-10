import{a as e}from"./chunk-4ZZLUPXN.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"A **movie ticket booking system** (BookMyShow, Fandango, PVR) lets a user browse cities \u2192 cinemas \u2192 shows, pick seats on a **live seat map**, and pay \u2014 all while guaranteeing that **no two users can buy the same seat for the same show**. The core LLD challenge is not the catalog browsing; it is the **seat-locking / concurrency** problem during checkout."},{type:"callout",variant:"info",title:"Why this is a top LLD question",body:"It combines a rich **domain model** (City \u2192 Cinema \u2192 Screen \u2192 Show \u2192 Seat), a **pricing strategy** that varies by seat type/time/day, and a genuinely hard **concurrency** problem: seats must be temporarily reserved during payment without being sold twice, and released automatically if the user abandons checkout."},{type:"table",caption:"Scope for this LLD.",headers:["In scope","Out of scope"],rows:[["Seat map, show scheduling, seat hold/lock, booking, payment","Search/recommendation ranking, CDN/poster delivery"],["Pricing strategy per seat type","Dynamic/surge pricing algorithms"],["Concurrency-safe seat reservation","Full payment gateway integration internals"]]}]},{id:"clarifying-questions",title:"Clarifying Questions",blocks:[{type:"table",headers:["Question","Why it matters"],rows:[["How long should a seat stay held before payment must complete?","Defines the TTL for the temporary lock (e.g. 5\u201310 minutes) \u2014 too short frustrates users, too long blocks inventory."],["Can a user select seats across two different shows in one session?","Determines whether locks are keyed per-show or globally per-user."],["Is this single-cinema-chain (one process) or multi-tenant, geo-distributed (needs distributed locks)?","A single-JVM lock (in-memory) is not enough once you have multiple app servers \u2014 you need Redis/DB-based locking."],["Do we support partial refunds / cancellations after booking?","Adds a `Booking` state machine (CONFIRMED \u2192 CANCELLED \u2192 REFUNDED)."],["Are seats individually priced by type (Recliner/Premium/Regular), or flat per show?","Drives the pricing `Strategy` and the `SeatType` model."],["What happens if payment fails after seats were held?","Seats must be released back to AVAILABLE \u2014 either immediately on failure or on lock TTL expiry."],["Do we need to support group bookings (e.g. 6 seats must be contiguous)?",'Adds a "find contiguous seats" constraint on top of plain availability.']]}]},{id:"requirements",title:"Requirements",blocks:[{type:"heading",level:3,text:"Functional requirements"},{type:"markdown",value:`- Browse cinemas by city, and shows by cinema/movie/date.
- View a live **seat map** for a show, showing AVAILABLE / LOCKED / BOOKED seats.
- **Temporarily hold** a set of seats for a short window while the user pays.
- **Confirm booking** and process payment; on success, mark seats BOOKED and release the hold.
- **Release the hold** automatically if payment does not complete before the hold expires (or the user cancels).
- Prevent **double booking**: two users must never both successfully book the same seat for the same show.`},{type:"heading",level:3,text:"Non-functional requirements"},{type:"markdown",value:`- **Correctness under concurrency** \u2014 no two confirmed bookings for the same \`(show, seat)\` pair, even with many app servers.
- **Low checkout latency** \u2014 seat lock acquisition should be fast (single atomic operation, not a multi-step transaction with room for races).
- **Availability** \u2014 seat-map reads should be fast and should not be blocked by other users' in-progress checkouts.
- **Resilience** \u2014 abandoned holds must self-expire; the system must not "leak" seats as permanently locked.`}]},{id:"entities",title:"Core Entities",blocks:[{type:"table",caption:"Domain model.",headers:["Entity","Key fields","Notes"],rows:[["City","id, name","Top of the browse hierarchy."],["Cinema","id, name, city, address","A physical multiplex with one or more screens."],["Screen","id, cinema, name, layout (rows x cols)","A single auditorium; owns the physical seat layout."],["Seat","id, screen, row, col, seatType","A physical, reusable seat \u2014 its type/position never changes across shows."],["SeatType","enum: REGULAR, PREMIUM, RECLINER","Drives pricing via the pricing strategy."],["Movie","id, title, durationMin, language, genre","The film being screened."],["Show","id, movie, screen, startTime, endTime","One scheduled screening; the unit shows/seats are booked against."],["ShowSeat","show, seat, status, price, lockedBy, lockExpiresAt","Per-show state of a physical seat \u2014 AVAILABLE / LOCKED / BOOKED. This is what concurrency control operates on."],["User","id, name, email","The booking customer."],["Booking","id, user, show, seats, amount, status, createdAt","A confirmed (or in-progress) reservation of one or more `ShowSeat`s."],["Payment","id, booking, amount, status, method","Payment attempt tied 1:1 (or 1:many for retries) to a booking."]]},{type:"callout",variant:"tip",title:"Seat vs. ShowSeat \u2014 the key modeling decision",body:"A physical **Seat** (row/column/type) is scheduling-independent \u2014 it exists whether or not a show is running. **ShowSeat** is the *per-show* mutable state (status, lock, price) that concurrency control actually touches. Conflating these two is the most common design mistake in this LLD."}]},{id:"class-design",title:"Class Design",blocks:[{type:"mermaid",caption:"City \u2192 Cinema \u2192 Screen \u2192 Show hierarchy, with ShowSeat as the concurrency-sensitive join entity.",definition:`classDiagram
  class City {
    +String id
    +String name
  }
  class Cinema {
    +String id
    +String name
    +String cityId
  }
  class Screen {
    +String id
    +String name
    +List seats
  }
  class Seat {
    +String id
    +int row
    +int col
    +SeatType seatType
  }
  class SeatType {
    <<enumeration>>
    REGULAR
    PREMIUM
    RECLINER
  }
  class Movie {
    +String id
    +String title
    +int durationMin
  }
  class Show {
    +String id
    +Movie movie
    +Screen screen
    +DateTime startTime
    +DateTime endTime
  }
  class ShowSeat {
    +Show show
    +Seat seat
    +SeatStatus status
    +Money price
    +String lockedByUserId
    +Instant lockExpiresAt
  }
  class SeatStatus {
    <<enumeration>>
    AVAILABLE
    LOCKED
    BOOKED
  }
  class Booking {
    +String id
    +User user
    +Show show
    +List showSeats
    +Money amount
    +BookingStatus status
  }
  class BookingStatus {
    <<enumeration>>
    PENDING
    CONFIRMED
    CANCELLED
    EXPIRED
  }
  class Payment {
    +String id
    +Booking booking
    +Money amount
    +PaymentStatus status
  }
  class User {
    +String id
    +String name
  }
  class BookingService {
    -SeatLockManager lockManager
    -PricingStrategy pricingStrategy
    +holdSeats(showId, seatIds, userId) Booking
    +confirmBooking(bookingId, payment) Booking
    +releaseExpiredHolds() void
  }
  class SeatLockManager {
    <<interface>>
    +tryLock(showId, seatId, userId, ttl) boolean
    +release(showId, seatId, userId) void
    +extend(showId, seatId, userId, ttl) boolean
  }
  class PricingStrategy {
    <<interface>>
    +price(show, seat) Money
  }

  City "1" --> "many" Cinema
  Cinema "1" --> "many" Screen
  Screen "1" --> "many" Seat
  Screen "1" --> "many" Show
  Show "1" --> "many" ShowSeat
  Seat "1" --> "many" ShowSeat
  Seat --> SeatType
  ShowSeat --> SeatStatus
  Booking "1" --> "many" ShowSeat
  Booking "1" --> "1" Payment
  Booking --> BookingStatus
  Booking --> User
  BookingService --> SeatLockManager
  BookingService --> PricingStrategy
  BookingService --> Booking`},{type:"markdown",value:"`BookingService` is the single orchestrator: it never touches lock or pricing internals directly, delegating to `SeatLockManager` (concurrency) and `PricingStrategy` (pricing) \u2014 two seams that can be swapped independently of booking logic."}]},{id:"flows",title:"Key Flows",blocks:[{type:"markdown",value:"**Happy path** \u2014 hold seats, pay, confirm."},{type:"mermaid",caption:"Seat hold -> payment -> confirmation.",definition:`sequenceDiagram
  participant U as User
  participant BS as BookingService
  participant LM as SeatLockManager
  participant PG as PaymentGateway
  U->>BS: holdSeats(showId, [A1, A2], userId)
  BS->>LM: tryLock(showId, A1, userId, ttl=8m)
  LM-->>BS: true
  BS->>LM: tryLock(showId, A2, userId, ttl=8m)
  LM-->>BS: true
  BS->>BS: create Booking(status=PENDING)
  BS-->>U: booking (seats held, pay within 8 min)
  U->>PG: pay(amount)
  PG-->>U: PAYMENT_SUCCESS
  U->>BS: confirmBooking(bookingId, paymentResult)
  BS->>BS: mark ShowSeats BOOKED, Booking CONFIRMED
  BS->>LM: release(showId, A1/A2, userId)
  BS-->>U: booking CONFIRMED`},{type:"markdown",value:"**Race condition: two users, same seat, same instant.** Only one `tryLock` may succeed; this is the crux of the interview question."},{type:"mermaid",caption:"Concurrent hold attempts on the same ShowSeat.",definition:`sequenceDiagram
  participant U1 as User A
  participant U2 as User B
  participant LM as SeatLockManager (Redis SETNX / DB row lock)
  par
    U1->>LM: tryLock(show1, seatA1, userA, ttl)
  and
    U2->>LM: tryLock(show1, seatA1, userB, ttl)
  end
  Note over LM: Only ONE atomic operation wins the CAS/SETNX
  LM-->>U1: true (lock acquired)
  LM-->>U2: false (already locked)
  U2->>U2: show "seat just taken, pick another"`},{type:"markdown",value:"**Hold expiry** \u2014 if the user abandons checkout, the lock TTL expires and the seat becomes AVAILABLE again without any explicit action."},{type:"mermaid",caption:"Expired hold releases the seat.",definition:`sequenceDiagram
  participant U as User
  participant BS as BookingService
  participant LM as SeatLockManager
  U->>BS: holdSeats(showId, [B5], userId)
  BS->>LM: tryLock(showId, B5, userId, ttl=8m)
  LM-->>BS: true
  Note over U: user closes tab, never pays
  Note over LM: 8 minutes pass, TTL expires (Redis EXPIRE / scheduled sweep)
  LM->>LM: seat B5 auto-unlocked
  BS->>BS: sweeper marks Booking EXPIRED
  Note over LM: seat B5 is AVAILABLE again for new holds`}]},{id:"patterns",title:"Design Patterns Applied",blocks:[{type:"table",headers:["Pattern","Where it shows up"],rows:[["Strategy","`PricingStrategy` computes seat price by `SeatType` + show time (matinee/prime-time) without `if/else` sprawl in `BookingService`."],["Singleton (optional)","`BookingService` / `SeatLockManager` are natural candidates for a single shared instance per app \u2014 but prefer DI-managed singleton beans over hand-rolled `getInstance()` (see the Singleton pattern page)."],["State","`BookingStatus` (PENDING \u2192 CONFIRMED / CANCELLED / EXPIRED) and `SeatStatus` (AVAILABLE \u2192 LOCKED \u2192 BOOKED) are textbook state machines."],["Observer","On `Booking` confirmation/cancellation, notify listeners for email/SMS confirmation and analytics without coupling `BookingService` to notification code."],["Facade","`BookingService` presents a simple `holdSeats` / `confirmBooking` API over lock manager + pricing + payment gateway coordination."]]}]},{id:"implementation",title:"Implementation (Java)",blocks:[{type:"markdown",value:"**Domain enums and entities.**"},{type:"code",language:"java",filename:"Domain.java",code:`public enum SeatType { REGULAR, PREMIUM, RECLINER }

public enum SeatStatus { AVAILABLE, LOCKED, BOOKED }

public enum BookingStatus { PENDING, CONFIRMED, CANCELLED, EXPIRED }

public class Seat {
  private final String id;
  private final int row;
  private final int col;
  private final SeatType seatType;

  public Seat(String id, int row, int col, SeatType seatType) {
    this.id = id;
    this.row = row;
    this.col = col;
    this.seatType = seatType;
  }

  public String getId() { return id; }
  public SeatType getSeatType() { return seatType; }
}

public class Show {
  private final String id;
  private final String movieId;
  private final String screenId;
  private final Instant startTime;
  private final Instant endTime;

  public Show(String id, String movieId, String screenId, Instant startTime, Instant endTime) {
    this.id = id;
    this.movieId = movieId;
    this.screenId = screenId;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  public String getId() { return id; }
  public Instant getStartTime() { return startTime; }
}

/** Per-show, per-seat mutable state \u2014 the entity concurrency control operates on. */
public class ShowSeat {
  private final String showId;
  private final Seat seat;
  private volatile SeatStatus status = SeatStatus.AVAILABLE;
  private volatile Money price;
  private volatile String lockedByUserId;
  private volatile Instant lockExpiresAt;

  public ShowSeat(String showId, Seat seat, Money price) {
    this.showId = showId;
    this.seat = seat;
    this.price = price;
  }

  public String key() { return showId + ":" + seat.getId(); }
  public Seat getSeat() { return seat; }
  public SeatStatus getStatus() { return status; }
  public Money getPrice() { return price; }

  void markLocked(String userId, Instant expiresAt) {
    this.status = SeatStatus.LOCKED;
    this.lockedByUserId = userId;
    this.lockExpiresAt = expiresAt;
  }

  void markBooked() {
    this.status = SeatStatus.BOOKED;
  }

  void markAvailable() {
    this.status = SeatStatus.AVAILABLE;
    this.lockedByUserId = null;
    this.lockExpiresAt = null;
  }

  boolean isLockExpired(Instant now) {
    return status == SeatStatus.LOCKED && lockExpiresAt != null && now.isAfter(lockExpiresAt);
  }
}`},{type:"markdown",value:"**Seat locking \u2014 the coordination primitive.** Two implementations are shown for progression: an in-memory version for a single JVM, and a Redis lease for a multi-instance deployment. The Redis version improves coordination but is not, by itself, the final correctness boundary; the production sections below add atomic database transitions, constraints, and fencing."},{type:"code",language:"java",filename:"SeatLockManager.java",code:`public interface SeatLockManager {
  /** Atomically locks the seat for userId if it is free; returns false if already held. */
  boolean tryLock(String showId, String seatId, String userId, Duration ttl);

  /** Releases the lock only if it is currently held by userId. */
  void release(String showId, String seatId, String userId);

  boolean extend(String showId, String seatId, String userId, Duration ttl);
}

/** Single-JVM implementation: one lock per (show, seat) via ConcurrentHashMap CAS. */
public class InMemorySeatLockManager implements SeatLockManager {
  private static class LockEntry {
    final String userId;
    final Instant expiresAt;
    LockEntry(String userId, Instant expiresAt) {
      this.userId = userId;
      this.expiresAt = expiresAt;
    }
  }

  private final ConcurrentHashMap<String, LockEntry> locks = new ConcurrentHashMap<>();

  private String key(String showId, String seatId) { return showId + ":" + seatId; }

  @Override
  public boolean tryLock(String showId, String seatId, String userId, Duration ttl) {
    String key = key(showId, seatId);
    Instant now = Instant.now();
    // Atomic compute: only succeeds if absent OR the existing lock has expired.
    LockEntry[] result = new LockEntry[1];
    locks.compute(key, (k, existing) -> {
      if (existing == null || now.isAfter(existing.expiresAt)) {
        result[0] = new LockEntry(userId, now.plus(ttl));
        return result[0];
      }
      result[0] = existing;
      return existing;
    });
    return result[0].userId.equals(userId) && result[0].expiresAt.isAfter(now.minusNanos(1));
  }

  @Override
  public void release(String showId, String seatId, String userId) {
    String key = key(showId, seatId);
    locks.computeIfPresent(key, (k, existing) -> existing.userId.equals(userId) ? null : existing);
  }

  @Override
  public boolean extend(String showId, String seatId, String userId, Duration ttl) {
    String key = key(showId, seatId);
    Instant now = Instant.now();
    LockEntry[] result = new LockEntry[1];
    locks.computeIfPresent(key, (k, existing) -> {
      if (existing.userId.equals(userId)) {
        result[0] = new LockEntry(userId, now.plus(ttl));
        return result[0];
      }
      result[0] = existing;
      return existing;
    });
    return result[0] != null && result[0].userId.equals(userId);
  }
}

/** Multi-instance implementation: Redis SET key value NX EX ttl gives an atomic distributed lock. */
public class RedisSeatLockManager implements SeatLockManager {
  private final RedisClient redis;

  public RedisSeatLockManager(RedisClient redis) {
    this.redis = redis;
  }

  private String key(String showId, String seatId) { return "seatlock:" + showId + ":" + seatId; }

  @Override
  public boolean tryLock(String showId, String seatId, String userId, Duration ttl) {
    // SET key userId NX EX ttlSeconds \u2014 atomic "set if not exists with expiry".
    String result = redis.set(key(showId, seatId), userId, "NX", "EX", ttl.getSeconds());
    return "OK".equals(result);
  }

  @Override
  public void release(String showId, String seatId, String userId) {
    // Lua script: only DEL if the value still matches userId (avoid releasing someone else's lock).
    redis.evalReleaseIfOwner(key(showId, seatId), userId);
  }

  @Override
  public boolean extend(String showId, String seatId, String userId, Duration ttl) {
    return redis.evalExtendIfOwner(key(showId, seatId), userId, ttl.getSeconds());
  }
}`},{type:"markdown",value:"**Pricing strategy** \u2014 price varies by seat type and show slot."},{type:"code",language:"java",filename:"PricingStrategy.java",code:`public interface PricingStrategy {
  Money price(Show show, Seat seat);
}

public class DefaultPricingStrategy implements PricingStrategy {
  private final Map<SeatType, Money> baseFare;

  public DefaultPricingStrategy(Map<SeatType, Money> baseFare) {
    this.baseFare = baseFare;
  }

  @Override
  public Money price(Show show, Seat seat) {
    Money base = baseFare.get(seat.getSeatType());
    boolean isPrimeTime = isPrimeTime(show.getStartTime());
    return isPrimeTime ? base.multiply(1.25) : base; // simple surge for evening/weekend shows
  }

  private boolean isPrimeTime(Instant startTime) {
    int hour = startTime.atZone(ZoneId.systemDefault()).getHour();
    return hour >= 18 && hour <= 22;
  }
}`},{type:"markdown",value:"**BookingService** \u2014 the orchestrator tying seat locking, pricing, and payment together."},{type:"code",language:"java",filename:"BookingService.java",code:`public class BookingService {
  private static final Duration HOLD_TTL = Duration.ofMinutes(8);

  private final SeatLockManager lockManager;
  private final PricingStrategy pricingStrategy;
  private final ShowSeatRepository showSeatRepository;
  private final BookingRepository bookingRepository;

  public BookingService(
      SeatLockManager lockManager,
      PricingStrategy pricingStrategy,
      ShowSeatRepository showSeatRepository,
      BookingRepository bookingRepository) {
    this.lockManager = lockManager;
    this.pricingStrategy = pricingStrategy;
    this.showSeatRepository = showSeatRepository;
    this.bookingRepository = bookingRepository;
  }

  /** Attempts to hold every requested seat; rolls back all locks if any seat is unavailable. */
  public Booking holdSeats(String showId, List<String> seatIds, String userId) {
    List<String> acquired = new ArrayList<>();
    try {
      for (String seatId : seatIds) {
        ShowSeat showSeat = showSeatRepository.find(showId, seatId);
        if (showSeat.getStatus() == SeatStatus.BOOKED) {
          throw new SeatUnavailableException(seatId);
        }
        boolean locked = lockManager.tryLock(showId, seatId, userId, HOLD_TTL);
        if (!locked) {
          throw new SeatUnavailableException(seatId); // someone else holds it right now
        }
        acquired.add(seatId);
        showSeat.markLocked(userId, Instant.now().plus(HOLD_TTL));
        showSeatRepository.save(showSeat);
      }

      Money total = seatIds.stream()
          .map(id -> showSeatRepository.find(showId, id).getPrice())
          .reduce(Money.ZERO, Money::add);

      Booking booking = new Booking(UUID.randomUUID().toString(), userId, showId, seatIds, total, BookingStatus.PENDING);
      bookingRepository.save(booking);
      return booking;
    } catch (SeatUnavailableException ex) {
      // All-or-nothing: release whatever we already grabbed so we do not strand partial holds.
      for (String seatId : acquired) {
        lockManager.release(showId, seatId, userId);
        ShowSeat showSeat = showSeatRepository.find(showId, seatId);
        showSeat.markAvailable();
        showSeatRepository.save(showSeat);
      }
      throw ex;
    }
  }

  /** Called after the payment gateway confirms success. */
  public Booking confirmBooking(String bookingId, PaymentResult paymentResult) {
    Booking booking = bookingRepository.find(bookingId);
    if (booking.getStatus() != BookingStatus.PENDING) {
      throw new IllegalStateException("booking is not pending: " + booking.getStatus());
    }
    if (!paymentResult.isSuccess()) {
      cancelBooking(booking);
      throw new PaymentFailedException(bookingId);
    }

    for (String seatId : booking.getSeatIds()) {
      ShowSeat showSeat = showSeatRepository.find(booking.getShowId(), seatId);
      showSeat.markBooked();
      showSeatRepository.save(showSeat);
      lockManager.release(booking.getShowId(), seatId, booking.getUserId());
    }
    booking.setStatus(BookingStatus.CONFIRMED);
    bookingRepository.save(booking);
    return booking;
  }

  private void cancelBooking(Booking booking) {
    for (String seatId : booking.getSeatIds()) {
      ShowSeat showSeat = showSeatRepository.find(booking.getShowId(), seatId);
      showSeat.markAvailable();
      showSeatRepository.save(showSeat);
      lockManager.release(booking.getShowId(), seatId, booking.getUserId());
    }
    booking.setStatus(BookingStatus.CANCELLED);
    bookingRepository.save(booking);
  }

  /** Scheduled sweep: expire PENDING bookings whose hold TTL has passed without payment. */
  public void releaseExpiredHolds() {
    Instant now = Instant.now();
    for (Booking booking : bookingRepository.findPendingOlderThan(now.minus(HOLD_TTL))) {
      cancelBooking(booking);
      booking.setStatus(BookingStatus.EXPIRED);
      bookingRepository.save(booking);
    }
  }
}`}]},{id:"last-ticket-race",title:"The Last-Ticket Race",blocks:[{type:"markdown",value:"Assume exactly one seat remains for a sold-out concert or movie. Alice and Bob click **Buy** at the same millisecond, and a load balancer sends them to different application servers. The dangerous implementation performs a read followed by a write: both requests read `AVAILABLE`, both make an irreversible payment call, and both later write `BOOKED`. Each individual request looks valid; the interleaving is invalid."},{type:"mermaid",caption:"A check-then-act race: two locally correct requests produce one globally incorrect result.",definition:`sequenceDiagram
  autonumber
  actor A as Alice
  actor B as Bob
  participant SA as Server A
  participant SB as Server B
  participant DB as Inventory DB
  participant PG as Payment Gateway

  par Alice checks
    A->>SA: Buy seat 45
    SA->>DB: SELECT status
    DB-->>SA: AVAILABLE
  and Bob checks
    B->>SB: Buy seat 45
    SB->>DB: SELECT status
    DB-->>SB: AVAILABLE
  end
  par
    SA->>PG: Charge Alice
    PG-->>SA: Success
  and
    SB->>PG: Charge Bob
    PG-->>SB: Success
  end
  SA->>DB: UPDATE status = BOOKED
  SB->>DB: UPDATE status = BOOKED
  Note over A,B: Two successful customers, one physical seat`},{type:"callout",variant:"danger",title:"The bug is check-then-act",body:"A transaction around only the final `UPDATE` does not fix this. The decision and state transition must be **one atomic operation**, or the relevant row must remain locked while that decision is made. Never charge merely because a stale read said inventory was available."},{type:"heading",level:3,text:"Define the invariant before choosing a lock"},{type:"markdown",value:"The hard business invariant is: **at most one confirmed booking may own a `(show_id, seat_id)` pair**. Availability is a projection of durable booking state, not a promise made by a cache. A robust design defends this invariant at the database boundary, even if Redis, the network, application processes, retries, and payment callbacks behave badly."},{type:"table",caption:"Concurrency mechanisms solve different parts of the problem.",headers:["Mechanism","What it protects","What it cannot guarantee alone"],rows:[["JVM mutex / `synchronized`","Threads inside one process","Requests handled by another process or region"],["Redis lease (`SET NX PX`)","Coordinates cooperating servers for a bounded time","Safety after lease expiry, Redis failover edge cases, or a stale owner"],["Fencing token","Lets storage reject an older lock holder","A business invariant unless every protected write validates the token"],["Atomic DB transition","Serializes the actual ownership change","A friendly multi-minute checkout experience by itself"],["Unique/check constraints","Last-line defense against invalid durable state","Temporary holds, expiry, and payment orchestration"]]}]},{id:"database-concurrency",title:"Database-First Correctness",blocks:[{type:"markdown",value:"For a single seat, the simplest production-safe primitive is often a **compare-and-set in SQL**. Do not first read the row and then decide. Ask the database to change the row only if its current state still permits the transition, then inspect the affected-row count."},{type:"code",language:"sql",filename:"atomic-seat-hold.sql",showLineNumbers:!0,highlightLines:[2,7,8],code:`UPDATE show_seat
SET status          = 'HELD',
    hold_id         = :hold_id,
    held_by_user_id = :user_id,
    hold_expires_at = :expires_at,
    version         = version + 1
WHERE show_id = :show_id
  AND seat_id = :seat_id
  AND (
    status = 'AVAILABLE'
    OR (status = 'HELD' AND hold_expires_at < CURRENT_TIMESTAMP)
  );

-- affected rows = 1: this request won
-- affected rows = 0: another request already owns or booked the seat`},{type:"callout",variant:"tip",title:"Why this closes the race",body:"The database evaluates the predicate and performs the update atomically under its concurrency-control rules. Alice and Bob can both send the statement, but only one can change the row from `AVAILABLE` to `HELD`; the other sees zero affected rows and must stop before payment."},{type:"heading",level:3,text:"Three valid database strategies"},{type:"table",headers:["Strategy","How it works","Best fit","Trade-off"],rows:[["Conditional update (recommended default)","`UPDATE ... WHERE status = AVAILABLE`; success iff row count is 1","Hot inventory and short transactions","Caller handles conflicts and retries explicitly"],["Pessimistic row lock","`SELECT ... FOR UPDATE`, validate, then update and commit","Several related rows must change together","Never hold the transaction open while the user pays; it causes blocking and deadlocks"],["Optimistic version","Read `version`, then `UPDATE ... WHERE version = :old_version`","Low/moderate contention and ORM-based systems","High contention produces retries; still needs a durable constraint"]]},{type:"code",language:"sql",filename:"booking-invariants.sql",showLineNumbers:!0,code:`-- One state row for every physical seat in every show.
ALTER TABLE show_seat
  ADD CONSTRAINT show_seat_pk PRIMARY KEY (show_id, seat_id),
  ADD CONSTRAINT valid_hold_state CHECK (
    (status = 'HELD' AND hold_id IS NOT NULL AND hold_expires_at IS NOT NULL)
    OR (status <> 'HELD' AND hold_id IS NULL AND hold_expires_at IS NULL)
  );

-- A seat can appear in at most one non-cancelled booking.
-- PostgreSQL partial unique index; model the equivalent explicitly in other databases.
CREATE UNIQUE INDEX one_active_booking_per_show_seat
  ON booking_seat(show_id, seat_id)
  WHERE booking_status IN ('PENDING_PAYMENT', 'CONFIRMED');`},{type:"heading",level:3,text:"Multiple seats: reserve all or none"},{type:"markdown",value:"For a group booking, sort seat IDs to acquire rows in a deterministic order, execute all conditional updates in one short database transaction, and verify that the number of updated rows equals the number requested. If any seat loses the race, roll back the transaction. This avoids exposing a partial hold and reduces deadlock risk. The transaction ends **before** calling the payment provider."}]},{id:"distributed-locks-production",title:"Distributed Locks, Leases, and Fencing Tokens",blocks:[{type:"heading",level:3,text:"The basic Redis lease"},{type:"code",language:"text",filename:"redis-command.txt",code:`SET seatlock:show_91:seat_45 "request_7f3a" NX PX 5000

NX      -> create only when the key does not exist
PX 5000 -> automatically expire after 5,000 milliseconds
OK      -> this request acquired the lease
(nil)   -> another request currently holds it`},{type:"markdown",value:"Use an unguessable **lock-owner value** such as a request UUID, not merely `server_A`. Release and renewal must be atomic compare-and-delete / compare-and-expire operations, usually implemented with a Lua script. Otherwise an old request can delete a newer request's lock after its own lease expires."},{type:"code",language:"lua",filename:"release-if-owner.lua",code:`if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0`},{type:"heading",level:3,text:"The zombie process"},{type:"mermaid",caption:"A lease can expire while its original holder is paused.",definition:`sequenceDiagram
  autonumber
  participant A as Server A
  participant L as Lock Service
  participant B as Server B
  participant DB as Database

  A->>L: acquire seat 45
  L-->>A: lease, token 33, expires in 5s
  Note over A: GC pause / CPU stall / network delay for 6s
  Note over L: lease 33 expires
  B->>L: acquire seat 45
  L-->>B: lease, token 34
  B->>DB: write with token 34
  DB-->>B: accepted
  Note over A: process resumes
  A->>DB: write with token 33
  DB-->>A: rejected as stale`},{type:"callout",variant:"warning",title:"A timeout is not revocation",body:"Redis expiring a key does not stop the old process. It may still be running, holding a database connection, or finishing an external call. This is the **zombie/stale-owner problem**: mutual exclusion in the lock service no longer implies mutual exclusion at the protected resource."},{type:"heading",level:3,text:"Add monotonic fencing tokens"},{type:"markdown",value:"Every successful lock acquisition receives a strictly increasing number: 33, 34, 35, and so on. The protected database stores the highest token it has accepted for that seat. Every state-changing request includes its token; a request carrying a lower token is rejected. Generate the token and acquire the lease as one lock-service operation\u2014typically one Redis Lua script using `INCR` plus `SET ... NX PX`, or a dedicated consensus-backed lock service."},{type:"code",language:"sql",filename:"fenced-booking-write.sql",showLineNumbers:!0,highlightLines:[7,8,9],code:`UPDATE show_seat
SET status             = 'BOOKED',
    booking_id         = :booking_id,
    last_fencing_token = :token,
    hold_id            = NULL,
    hold_expires_at    = NULL
WHERE show_id = :show_id
  AND seat_id = :seat_id
  AND status = 'HELD'
  AND hold_id = :hold_id
  AND last_fencing_token < :token;

-- Zero rows means: stale token, wrong owner, expired/replaced hold, or already booked.
-- Treat it as a lost race, never as success.`},{type:"callout",variant:"info",title:"Fencing is defense in depth, not magic",body:"Fencing works only when **every protected write** reaches a resource that validates the token. A payment provider will not understand your Redis token, and the database cannot reject a newer token it has not observed yet. Therefore the durable conditional transition and unique constraint remain the final authority. If a stale holder reaches the DB first, it may win the DB compare-and-set; the newer holder must then lose cleanly rather than overwrite it."},{type:"prosCons",title:"When to use Redis in this design",pros:["Fast rejection during flash-sale contention, reducing pressure on the primary database.","Natural TTL for temporary checkout holds and a responsive seat-map experience.","Can serialize expensive work before it reaches downstream services."],cons:["Adds another failure domain and consistency boundary.","Lease expiry, failover, clock/latency assumptions, and stale owners require careful handling.","Cannot replace database constraints or an idempotent payment workflow."]}]},{id:"payment-workflow",title:"Payment-Safe Booking Workflow",blocks:[{type:"markdown",value:"The system must coordinate two independent truths: the database owns the seat, while the payment provider owns the money. They cannot participate in one ACID transaction. Treat checkout as a state machine (or saga), make every step retryable, and prefer **authorize then capture** so a lost seat does not become a completed charge."},{type:"mermaid",caption:"Production flow: durable hold first, payment authorization second, atomic confirmation third.",definition:`sequenceDiagram
  autonumber
  actor U as User
  participant API as Booking API
  participant DB as Primary DB
  participant PG as Payment Gateway
  participant O as Outbox Relay

  U->>API: POST /holds (seat 45, idempotency key)
  API->>DB: atomic AVAILABLE -> HELD
  DB-->>API: hold_id, price snapshot, expires_at
  API-->>U: hold created
  U->>API: POST /payments/authorize
  API->>PG: authorize(amount, booking idempotency key)
  PG-->>API: authorization_id
  API->>DB: transaction: HELD -> CONFIRMED + outbox event
  alt confirmation committed
    DB-->>API: confirmed
    API->>PG: capture(authorization_id, idempotency key)
    API-->>U: ticket confirmed
    O->>O: publish BookingConfirmed
  else hold expired or ownership lost
    DB-->>API: conditional update affected 0 rows
    API->>PG: void authorization
    API-->>U: seat unavailable; no capture
  end`},{type:"table",caption:"Suggested booking state machine.",headers:["State","Meaning","Allowed next states"],rows:[["HOLD_CREATED","Seats are durably held until `expires_at`","PAYMENT_AUTHORIZED, EXPIRED, CANCELLED"],["PAYMENT_AUTHORIZED","Funds are reserved but not captured","CONFIRMED, PAYMENT_FAILED, EXPIRED"],["CONFIRMED","Seat ownership is final; capture can be retried","CANCELLED / REFUND_PENDING"],["EXPIRED","Hold deadline passed; seats may be reclaimed","Terminal"],["PAYMENT_FAILED","Authorization failed or was voided","Terminal or a new payment attempt"]]},{type:"heading",level:3,text:"Idempotency is mandatory"},{type:"markdown",value:"- Require an **idempotency key** on hold creation and payment commands. Persist `(operation, user_id, idempotency_key)` with the response so retries return the original result.\n- Store the provider's payment/authorization ID behind a unique constraint. Duplicate webhooks then update the same payment attempt instead of confirming twice.\n- Make state transitions conditional: `UPDATE booking SET status = CONFIRMED WHERE id = ? AND status = PAYMENT_AUTHORIZED`. A repeated callback affects zero rows and reads the already-final result.\n- Record the **price snapshot** on the hold. Never recalculate price after payment from a mutable pricing rule."},{type:"heading",level:3,text:"Crash windows and recovery"},{type:"table",headers:["Failure window","Safe recovery"],rows:[["Crash after hold commit, before response","Client retries with the same idempotency key and receives the existing hold."],["Payment authorized, confirmation loses seat","Void the authorization; if a capture already happened, enqueue a refund and alert on reconciliation lag."],["DB confirms booking, process crashes before capture","Retry capture with the same provider idempotency key from a recovery worker."],["Capture succeeds, response is lost","Retry returns the same provider result; webhook/reconciliation completes local state."],["Booking commits, event publish fails","Transactional outbox stores `BookingConfirmed` in the same DB transaction; relay retries publishing."],["Hold expires while payment is in flight","Use the DB deadline and conditional transition as authority; void/refund if confirmation no longer wins."]]}]},{id:"production-design",title:"Production Architecture and Operations",blocks:[{type:"mermaid",caption:"Keep correctness on the primary write path; scale browsing and notifications independently.",definition:`flowchart LR
  C[Web / Mobile Client] --> G[API Gateway]
  G --> B[Booking Service]
  G --> R[Seat Map Read Service]
  B --> L[(Redis hold cache / lock)]
  B --> P[(Primary relational DB)]
  B --> PG[Payment Provider]
  P --> O[(Transactional Outbox)]
  O --> K[Event Bus]
  K --> N[Email / SMS / Ticket Service]
  K --> R
  P -. replication .-> RR[(Read Replica)]
  RR --> R

  classDef authority fill:#fee2e2,stroke:#dc2626,color:#111;
  class P authority`},{type:"callout",variant:"summary",title:"Source-of-truth rule",body:"Redis may answer \u201Csomeone appears to hold this seat,\u201D but only the primary database may answer \u201Cthis booking owns this seat.\u201D Seat-map caches and read replicas are allowed to be briefly stale; the checkout write path is not."},{type:"heading",level:3,text:"Capacity and hot-key strategy"},{type:"markdown",value:"- Partition data by `show_id` (or venue/region) so unrelated shows do not contend.\n- Keep the lock key at `(show_id, seat_id)` granularity; one global \u201Cconcert lock\u201D destroys throughput.\n- Add randomized client backoff and return `409 Conflict` quickly. Do not spin/retry aggressively for a seat another user owns.\n- Queueing or a virtual waiting room is useful before blockbuster on-sales. It limits admission rate; it does **not** replace the booking invariant.\n- Cache seat maps for reads, then push invalidations/events after HELD, RELEASED, and BOOKED transitions. Always revalidate on checkout."},{type:"heading",level:3,text:"Expiry and cleanup"},{type:"markdown",value:"TTL is both a user-experience deadline and a resource-recovery tool. Persist `hold_expires_at` in the database; do not rely only on Redis expiry notifications, which may be delayed or lost. A periodic, idempotent sweeper should reclaim rows with `status = HELD AND hold_expires_at < now()`, using bounded batches and conditional updates so it cannot release a newly renewed or confirmed hold."},{type:"table",caption:"Signals that reveal correctness trouble before customers do.",headers:["Metric / alert","Why it matters"],rows:[["Conditional-hold conflict rate by show","Measures contention and identifies hot inventory."],["Unique-constraint violation count","Should be near zero; spikes indicate a bypassed state transition or retry bug."],["Stale fencing-token rejection count","Shows zombie workers or lease/latency problems."],["Hold age and expired-hold cleanup lag","Detects stuck inventory and a failing sweeper."],["Authorized-but-not-confirmed payments","Money is at risk; reconcile and void quickly."],["Confirmed-but-not-captured payments","Revenue is at risk; retry capture idempotently."],["Captured-but-no-ticket reconciliation count","Highest-severity customer-impact invariant."],["Outbox oldest-unpublished age","Detects delayed ticket/email/cache events."]]},{type:"heading",level:3,text:"Test the interleavings, not just the endpoints"},{type:"bestPractices",title:"Concurrency and failure test plan",practices:["Launch hundreds of simultaneous hold attempts for one seat; assert exactly one succeeds and exactly one active booking row exists.","Pause the winning worker beyond its lease, let another worker acquire a newer fencing token, then verify stale writes are rejected.","Kill the service after each durable step: hold commit, payment authorization, confirmation commit, capture, and outbox insert.","Replay the same API command and payment webhook many times; the final state and total captured amount must remain unchanged.","Inject Redis loss/failover. The system may reject bookings temporarily, but it must never double-sell.","Run reconciliation against provider settlements and assert every captured payment maps to exactly one confirmed ticket or refund."]},{type:"callout",variant:"info",title:"How to answer this in an interview",body:"Start with the invariant and the two-server race. Propose an atomic DB transition as the correctness boundary. Add a short-lived Redis lease for fast holds and reduced contention. Explain the zombie problem, owner-checked release, and fencing tokens. Finish with idempotent authorize/capture, durable expiry, unique constraints, outbox/reconciliation, and concurrency tests. That progression demonstrates both fundamentals and production judgment."}]},{id:"extensions",title:"Extensions & Follow-ups",blocks:[{type:"bestPractices",title:"Common follow-up directions",practices:['**Contiguous seat selection** \u2014 "find N adjacent available seats" needs a per-row scan of `ShowSeat` status, not just a count check.',"**Waitlist** \u2014 when a show sells out, queue users and notify on cancellation/expiry (Observer pattern over `Booking` state changes).","**Dynamic pricing** \u2014 swap `DefaultPricingStrategy` for a demand-based strategy (higher price as fewer seats remain) without touching `BookingService`.","**Idempotent payment confirmation** \u2014 payment gateway webhooks can be retried/duplicated; key `confirmBooking` off an idempotency key so double-confirmation is a no-op.","**Multi-region scale** \u2014 partition `SeatLockManager` by cinema/region so a Redis outage in one region does not affect bookings elsewhere.",'**Optimistic locking fallback** \u2014 instead of a separate lock store, add a `version` column to `ShowSeat` and use `UPDATE ... WHERE version = ? AND status = AVAILABLE` as a cheaper (but less UX-friendly, no explicit "hold") alternative.']},{type:"callout",variant:"warning",title:"Do not rely on application-level or distributed locks alone",body:"An `InMemorySeatLockManager` protects only one JVM. A Redis lease coordinates multiple servers but can expire while its owner is still running. Put the durable invariant in the database with a conditional transition and unique constraint; use owner-checked release and fencing tokens when a distributed lease also protects writes."}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Why model Seat and ShowSeat as two separate entities?",answer:"`Seat` (row, column, type) is a fixed property of the physical screen. `ShowSeat` is the mutable, per-show booking state (AVAILABLE/LOCKED/BOOKED). Merging them would mean re-creating seat metadata for every show, and would make it unclear which entity concurrency control should lock."},{question:"How do you prevent two users from booking the same seat at the same time?",answer:"Seat reservation must be a single **atomic** operation with an all-or-nothing outcome \u2014 e.g. Redis `SET key value NX EX ttl`, or a DB `UPDATE ... WHERE status = AVAILABLE` and checking the affected row count. Whichever thread's atomic operation wins gets the lock; the loser is told the seat just became unavailable."},{question:"Why can a seat hold not be released with a plain DEL in Redis?",answer:"A plain `DEL` would release the lock even if it is no longer owned by the caller (e.g. after TTL expiry, someone else may have acquired it). Release should be a **check-and-delete** \u2014 typically a Lua script that verifies the stored value equals the caller's user/session id before deleting."},{question:"What is the zombie process problem, and how do fencing tokens help?",answer:"A process can pause longer than its lease, resume after another process acquires the lock, and still attempt a write. Give each acquisition a strictly increasing fencing token and require the database to accept only a token newer than the last accepted token. This rejects a stale holder that arrives after a newer write. Fencing is defense in depth: every protected write must validate it, and the database must still enforce ownership with conditional updates and constraints."},{question:"What happens if a user holds seats and then closes the browser tab?",answer:"The hold has a TTL (e.g. 8 minutes). Redis expires the key automatically; a scheduled sweeper also marks the corresponding `Booking` as `EXPIRED` and flips `ShowSeat` back to `AVAILABLE` so it is not permanently stuck."},{question:"How would you support booking multiple seats atomically \u2014 what if seat 2 of 3 is unavailable?",answer:'Attempt to lock seats one by one, tracking which locks were acquired. If any `tryLock` fails, release every lock acquired so far (compensating rollback) and surface a "seat unavailable" error \u2014 an all-or-nothing hold, matching the `holdSeats` implementation shown.'},{question:"Why not just use a database transaction with SELECT ... FOR UPDATE instead of Redis?",answer:"That works and is simpler operationally (no extra infra) but holds a DB row lock for the *entire* checkout duration if used naively, and does not give you a clean TTL-based auto-expiry \u2014 you would need a separate expiry job. Redis-based locks are lighter-weight and TTL-native, which is why they are common for short-lived holds; DB `UPDATE ... WHERE status = AVAILABLE` (optimistic, no held lock) is the more common production compromise."},{question:"How do you price seats differently by type and time slot without an if/else explosion?",answer:"A `PricingStrategy` interface takes `(show, seat)` and returns a price; swapping `DefaultPricingStrategy` for a `SurgePricingStrategy` or `WeekendPricingStrategy` requires no change to `BookingService` \u2014 a direct application of the Strategy pattern for Open/Closed extensibility."},{question:"Where would Singleton fit in this design, and where would it be a mistake?",answer:"A single shared `BookingService`/`SeatLockManager` instance per application (DI singleton bean) is fine and typical. It would be a mistake to make `Booking` or `ShowSeat` singletons \u2014 those are per-request/per-seat domain objects, not shared coordinators."},{question:"How would you scale seat-map reads without hurting checkout writes?",answer:"Serve seat-map reads from a read replica or cache (invalidated on lock/booking events) so high read traffic (many users browsing) does not contend with the low-latency atomic lock operations needed at checkout. Only the lock acquisition path needs strict consistency."},{question:"What is the failure mode if the payment succeeds but confirmBooking() crashes before releasing the lock?",answer:"The seat stays LOCKED until the hold TTL expires, then the sweeper marks the booking EXPIRED and frees the seat \u2014 but the user paid and got nothing. This is why real systems make `confirmBooking` idempotent and retryable (driven by a payment webhook with an idempotency key) rather than a single unrecoverable call."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Split **Seat** (physical, static) from **ShowSeat** (per-show, mutable, concurrency-sensitive).
2. Define the invariant first: at most one active booking owns \`(show_id, seat_id)\`, enforced by an atomic DB transition and constraint.
3. A Redis \`SET NX PX\` lease improves coordination and TTL-based holds, but expiry can create a **zombie owner**; owner-checked release and fencing tokens add protection.
4. Multi-seat holds are all-or-nothing, and database transactions must end before waiting on payment.
5. Payment is a retryable state machine: authorize, conditionally confirm, capture, and recover with idempotency, outbox, and reconciliation.
6. Load tests must force the **two-users-one-seat** interleaving and assert exactly one winner.`}]}]},o=t;export{o as default};
