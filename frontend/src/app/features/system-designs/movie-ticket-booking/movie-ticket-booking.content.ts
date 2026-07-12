import { DesignContent } from '../../../shared/models';
import { MOVIE_TICKET_BOOKING_META } from './movie-ticket-booking.meta';

/**
 * Movie Ticket Booking (BookMyShow-style) — LLD covering seat locking,
 * pricing strategy, and race-free booking under concurrent demand.
 */
const content: DesignContent = {
  meta: MOVIE_TICKET_BOOKING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **movie ticket booking system** (BookMyShow, Fandango, PVR) lets a user browse cities → cinemas → shows, pick seats on a **live seat map**, and pay — all while guaranteeing that **no two users can buy the same seat for the same show**. The core LLD challenge is not the catalog browsing; it is the **seat-locking / concurrency** problem during checkout.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Why this is a top LLD question',
          body: 'It combines a rich **domain model** (City → Cinema → Screen → Show → Seat), a **pricing strategy** that varies by seat type/time/day, and a genuinely hard **concurrency** problem: seats must be temporarily reserved during payment without being sold twice, and released automatically if the user abandons checkout.',
        },
        {
          type: 'table',
          caption: 'Scope for this LLD.',
          headers: ['In scope', 'Out of scope'],
          rows: [
            ['Seat map, show scheduling, seat hold/lock, booking, payment', 'Search/recommendation ranking, CDN/poster delivery'],
            ['Pricing strategy per seat type', 'Dynamic/surge pricing algorithms'],
            ['Concurrency-safe seat reservation', 'Full payment gateway integration internals'],
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
              'How long should a seat stay held before payment must complete?',
              'Defines the TTL for the temporary lock (e.g. 5–10 minutes) — too short frustrates users, too long blocks inventory.',
            ],
            [
              'Can a user select seats across two different shows in one session?',
              'Determines whether locks are keyed per-show or globally per-user.',
            ],
            [
              'Is this single-cinema-chain (one process) or multi-tenant, geo-distributed (needs distributed locks)?',
              'A single-JVM lock (in-memory) is not enough once you have multiple app servers — you need Redis/DB-based locking.',
            ],
            [
              'Do we support partial refunds / cancellations after booking?',
              'Adds a `Booking` state machine (CONFIRMED → CANCELLED → REFUNDED).',
            ],
            [
              'Are seats individually priced by type (Recliner/Premium/Regular), or flat per show?',
              'Drives the pricing `Strategy` and the `SeatType` model.',
            ],
            [
              'What happens if payment fails after seats were held?',
              'Seats must be released back to AVAILABLE — either immediately on failure or on lock TTL expiry.',
            ],
            [
              'Do we need to support group bookings (e.g. 6 seats must be contiguous)?',
              'Adds a "find contiguous seats" constraint on top of plain availability.',
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
            '- Browse cinemas by city, and shows by cinema/movie/date.\n- View a live **seat map** for a show, showing AVAILABLE / LOCKED / BOOKED seats.\n- **Temporarily hold** a set of seats for a short window while the user pays.\n- **Confirm booking** and process payment; on success, mark seats BOOKED and release the hold.\n- **Release the hold** automatically if payment does not complete before the hold expires (or the user cancels).\n- Prevent **double booking**: two users must never both successfully book the same seat for the same show.',
        },
        {
          type: 'heading',
          level: 3,
          text: 'Non-functional requirements',
        },
        {
          type: 'markdown',
          value:
            '- **Correctness under concurrency** — no two confirmed bookings for the same `(show, seat)` pair, even with many app servers.\n- **Low checkout latency** — seat lock acquisition should be fast (single atomic operation, not a multi-step transaction with room for races).\n- **Availability** — seat-map reads should be fast and should not be blocked by other users\' in-progress checkouts.\n- **Resilience** — abandoned holds must self-expire; the system must not "leak" seats as permanently locked.',
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
            ['City', 'id, name', 'Top of the browse hierarchy.'],
            ['Cinema', 'id, name, city, address', 'A physical multiplex with one or more screens.'],
            ['Screen', 'id, cinema, name, layout (rows x cols)', 'A single auditorium; owns the physical seat layout.'],
            ['Seat', 'id, screen, row, col, seatType', 'A physical, reusable seat — its type/position never changes across shows.'],
            ['SeatType', 'enum: REGULAR, PREMIUM, RECLINER', 'Drives pricing via the pricing strategy.'],
            ['Movie', 'id, title, durationMin, language, genre', 'The film being screened.'],
            ['Show', 'id, movie, screen, startTime, endTime', 'One scheduled screening; the unit shows/seats are booked against.'],
            ['ShowSeat', 'show, seat, status, price, lockedBy, lockExpiresAt', 'Per-show state of a physical seat — AVAILABLE / LOCKED / BOOKED. This is what concurrency control operates on.'],
            ['User', 'id, name, email', 'The booking customer.'],
            ['Booking', 'id, user, show, seats, amount, status, createdAt', 'A confirmed (or in-progress) reservation of one or more `ShowSeat`s.'],
            ['Payment', 'id, booking, amount, status, method', 'Payment attempt tied 1:1 (or 1:many for retries) to a booking.'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Seat vs. ShowSeat — the key modeling decision',
          body: 'A physical **Seat** (row/column/type) is scheduling-independent — it exists whether or not a show is running. **ShowSeat** is the *per-show* mutable state (status, lock, price) that concurrency control actually touches. Conflating these two is the most common design mistake in this LLD.',
        },
      ],
    },
    {
      id: 'class-design',
      title: 'Class Design',
      blocks: [
        {
          type: 'mermaid',
          caption: 'City → Cinema → Screen → Show hierarchy, with ShowSeat as the concurrency-sensitive join entity.',
          definition: `classDiagram
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
  BookingService --> Booking`,
        },
        {
          type: 'markdown',
          value:
            '`BookingService` is the single orchestrator: it never touches lock or pricing internals directly, delegating to `SeatLockManager` (concurrency) and `PricingStrategy` (pricing) — two seams that can be swapped independently of booking logic.',
        },
      ],
    },
    {
      id: 'flows',
      title: 'Key Flows',
      blocks: [
        {
          type: 'markdown',
          value: '**Happy path** — hold seats, pay, confirm.',
        },
        {
          type: 'mermaid',
          caption: 'Seat hold -> payment -> confirmation.',
          definition: `sequenceDiagram
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
  BS-->>U: booking CONFIRMED`,
        },
        {
          type: 'markdown',
          value:
            '**Race condition: two users, same seat, same instant.** Only one `tryLock` may succeed; this is the crux of the interview question.',
        },
        {
          type: 'mermaid',
          caption: 'Concurrent hold attempts on the same ShowSeat.',
          definition: `sequenceDiagram
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
  U2->>U2: show "seat just taken, pick another"`,
        },
        {
          type: 'markdown',
          value: '**Hold expiry** — if the user abandons checkout, the lock TTL expires and the seat becomes AVAILABLE again without any explicit action.',
        },
        {
          type: 'mermaid',
          caption: 'Expired hold releases the seat.',
          definition: `sequenceDiagram
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
  Note over LM: seat B5 is AVAILABLE again for new holds`,
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
              '`PricingStrategy` computes seat price by `SeatType` + show time (matinee/prime-time) without `if/else` sprawl in `BookingService`.',
            ],
            [
              'Singleton (optional)',
              '`BookingService` / `SeatLockManager` are natural candidates for a single shared instance per app — but prefer DI-managed singleton beans over hand-rolled `getInstance()` (see the Singleton pattern page).',
            ],
            [
              'State',
              '`BookingStatus` (PENDING → CONFIRMED / CANCELLED / EXPIRED) and `SeatStatus` (AVAILABLE → LOCKED → BOOKED) are textbook state machines.',
            ],
            [
              'Observer',
              'On `Booking` confirmation/cancellation, notify listeners for email/SMS confirmation and analytics without coupling `BookingService` to notification code.',
            ],
            [
              'Facade',
              '`BookingService` presents a simple `holdSeats` / `confirmBooking` API over lock manager + pricing + payment gateway coordination.',
            ],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation (Java)',
      blocks: [
        {
          type: 'markdown',
          value: '**Domain enums and entities.**',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Domain.java',
          code: `public enum SeatType { REGULAR, PREMIUM, RECLINER }

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

/** Per-show, per-seat mutable state — the entity concurrency control operates on. */
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
}`,
        },
        {
          type: 'markdown',
          value:
            '**Seat locking — the core concurrency-safe primitive.** Two implementations: an in-memory version for a single JVM, and a Redis-based version for a multi-instance deployment.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SeatLockManager.java',
          code: `public interface SeatLockManager {
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
    // SET key userId NX EX ttlSeconds — atomic "set if not exists with expiry".
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
}`,
        },
        {
          type: 'markdown',
          value: '**Pricing strategy** — price varies by seat type and show slot.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'PricingStrategy.java',
          code: `public interface PricingStrategy {
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
}`,
        },
        {
          type: 'markdown',
          value: '**BookingService** — the orchestrator tying seat locking, pricing, and payment together.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'BookingService.java',
          code: `public class BookingService {
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
}`,
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
            '**Contiguous seat selection** — "find N adjacent available seats" needs a per-row scan of `ShowSeat` status, not just a count check.',
            '**Waitlist** — when a show sells out, queue users and notify on cancellation/expiry (Observer pattern over `Booking` state changes).',
            '**Dynamic pricing** — swap `DefaultPricingStrategy` for a demand-based strategy (higher price as fewer seats remain) without touching `BookingService`.',
            '**Idempotent payment confirmation** — payment gateway webhooks can be retried/duplicated; key `confirmBooking` off an idempotency key so double-confirmation is a no-op.',
            '**Multi-region scale** — partition `SeatLockManager` by cinema/region so a Redis outage in one region does not affect bookings elsewhere.',
            '**Optimistic locking fallback** — instead of a separate lock store, add a `version` column to `ShowSeat` and use `UPDATE ... WHERE version = ? AND status = AVAILABLE` as a cheaper (but less UX-friendly, no explicit "hold") alternative.',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Do not rely on application-level locks alone in a multi-instance deployment',
          body: 'An `InMemorySeatLockManager` (plain `ConcurrentHashMap`) only guarantees correctness **within one JVM**. The moment you run more than one app server behind a load balancer, you need a shared lock store — Redis `SET NX EX`, or a DB row with a unique constraint/optimistic version check.',
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
              question: 'Why model Seat and ShowSeat as two separate entities?',
              answer:
                '`Seat` (row, column, type) is a fixed property of the physical screen. `ShowSeat` is the mutable, per-show booking state (AVAILABLE/LOCKED/BOOKED). Merging them would mean re-creating seat metadata for every show, and would make it unclear which entity concurrency control should lock.',
            },
            {
              question: 'How do you prevent two users from booking the same seat at the same time?',
              answer:
                'Seat reservation must be a single **atomic** operation with an all-or-nothing outcome — e.g. Redis `SET key value NX EX ttl`, or a DB `UPDATE ... WHERE status = AVAILABLE` and checking the affected row count. Whichever thread\'s atomic operation wins gets the lock; the loser is told the seat just became unavailable.',
            },
            {
              question: 'Why can a seat hold not be released with a plain DEL in Redis?',
              answer:
                'A plain `DEL` would release the lock even if it is no longer owned by the caller (e.g. after TTL expiry, someone else may have acquired it). Release should be a **check-and-delete** — typically a Lua script that verifies the stored value equals the caller\'s user/session id before deleting.',
            },
            {
              question: 'What happens if a user holds seats and then closes the browser tab?',
              answer:
                'The hold has a TTL (e.g. 8 minutes). Redis expires the key automatically; a scheduled sweeper also marks the corresponding `Booking` as `EXPIRED` and flips `ShowSeat` back to `AVAILABLE` so it is not permanently stuck.',
            },
            {
              question: 'How would you support booking multiple seats atomically — what if seat 2 of 3 is unavailable?',
              answer:
                'Attempt to lock seats one by one, tracking which locks were acquired. If any `tryLock` fails, release every lock acquired so far (compensating rollback) and surface a "seat unavailable" error — an all-or-nothing hold, matching the `holdSeats` implementation shown.',
            },
            {
              question: 'Why not just use a database transaction with SELECT ... FOR UPDATE instead of Redis?',
              answer:
                'That works and is simpler operationally (no extra infra) but holds a DB row lock for the *entire* checkout duration if used naively, and does not give you a clean TTL-based auto-expiry — you would need a separate expiry job. Redis-based locks are lighter-weight and TTL-native, which is why they are common for short-lived holds; DB `UPDATE ... WHERE status = AVAILABLE` (optimistic, no held lock) is the more common production compromise.',
            },
            {
              question: 'How do you price seats differently by type and time slot without an if/else explosion?',
              answer:
                'A `PricingStrategy` interface takes `(show, seat)` and returns a price; swapping `DefaultPricingStrategy` for a `SurgePricingStrategy` or `WeekendPricingStrategy` requires no change to `BookingService` — a direct application of the Strategy pattern for Open/Closed extensibility.',
            },
            {
              question: 'Where would Singleton fit in this design, and where would it be a mistake?',
              answer:
                'A single shared `BookingService`/`SeatLockManager` instance per application (DI singleton bean) is fine and typical. It would be a mistake to make `Booking` or `ShowSeat` singletons — those are per-request/per-seat domain objects, not shared coordinators.',
            },
            {
              question: 'How would you scale seat-map reads without hurting checkout writes?',
              answer:
                'Serve seat-map reads from a read replica or cache (invalidated on lock/booking events) so high read traffic (many users browsing) does not contend with the low-latency atomic lock operations needed at checkout. Only the lock acquisition path needs strict consistency.',
            },
            {
              question: 'What is the failure mode if the payment succeeds but confirmBooking() crashes before releasing the lock?',
              answer:
                'The seat stays LOCKED until the hold TTL expires, then the sweeper marks the booking EXPIRED and frees the seat — but the user paid and got nothing. This is why real systems make `confirmBooking` idempotent and retryable (driven by a payment webhook with an idempotency key) rather than a single unrecoverable call.',
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
          body: '1. Split **Seat** (physical, static) from **ShowSeat** (per-show, mutable, concurrency-sensitive).\n2. Seat holds need an **atomic, TTL-based lock** (Redis `SET NX EX` or DB optimistic update) — not an in-process lock once you scale beyond one server.\n3. Multi-seat holds must be **all-or-nothing** with compensating rollback on partial failure.\n4. **Strategy** cleanly isolates pricing rules; **State** models `SeatStatus`/`BookingStatus` transitions.\n5. Always narrate the **two-users-one-seat** race explicitly — it is the crux of the question.',
        },
      ],
    },
  ],
};

export default content;
