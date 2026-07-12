import{a as e}from"./chunk-GLKNOZF3.js";import"./chunk-IFGU66OU.js";var o={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"Design a **hotel reservation** system: guests search rooms by **date range**, place a **temporary hold**, then **confirm** (or expire). Inventory is measured in **room-nights** per room type \u2014 not a single seat at a single showtime."},{type:"callout",variant:"info",title:"Contrast: movie ticket booking",body:"**Movie tickets** lock discrete seats for one **showtime** (point-in-time inventory). **Hotels** reserve capacity across a **contiguous date range** (N nights \xD7 room type). Overlap logic, holds, and overbooking policies differ \u2014 reuse locking ideas, not the seat map."},{type:"table",caption:"Movie tickets vs hotel rooms.",headers:["Dimension","Movie ticket booking","Hotel reservation"],rows:[["Inventory unit","Seat @ showtime","Room type @ night (room-night)"],["Time model","Single slot","Inclusive date range / nights"],["Conflict","Same seat twice","Overlapping nights exceed allotment"],["Hold","Seat lock TTL (e.g. 10 min)","Booking hold TTL on room-nights"],["Overbooking","Rare / discouraged","Common revenue policy (no-shows)"]]}]},{id:"clarifying-questions",title:"Clarifying Questions",blocks:[{type:"table",headers:["Question","Sample assumption"],rows:[["Single hotel or chain?","One hotel, multiple room types for core LLD"],["Assign specific room at booking or at check-in?","Book by **type**; assign concrete room at check-in"],["Hold duration?","10\u201315 minutes pending payment"],["Overbooking allowed?","Discuss policy; implement optional % oversell"],["Partial stays / day-use?","Full nights only for core"],["Cancellations and refunds?","Cancel before cutoff; inventory returns to pool"]]}]},{id:"requirements",title:"Requirements",blocks:[{type:"markdown",value:"### Functional"},{type:"table",headers:["#","Requirement"],rows:[["F1","Search availability for room type(s) between check-in and check-out"],["F2","Create a HOLD reservation that expires if not confirmed"],["F3","Confirm hold after payment \u2192 CONFIRMED booking"],["F4","Cancel booking and release inventory per policy"],["F5","Prevent double-selling beyond allotment (or overbooking cap)"],["F6","Support multiple room types with different rates and capacity"]]},{type:"markdown",value:"### Non-functional"},{type:"table",headers:["#","Requirement"],rows:[["N1","Concurrency-safe inventory under concurrent bookers"],["N2","Holds expire reliably (scheduler or TTL job)"],["N3","Auditable booking history (guest, nights, amounts, status)"]]}]},{id:"availability-model",title:"Availability and Room-Nights",blocks:[{type:"markdown",value:"For each **room type** and **calendar night**, store `allotment`, `sold`, and `held`. A range `[checkIn, checkOut)` needs **every** night to have `sold + held < allotment` (or `\u2264 allotment + overbookLimit`). Availability search is: for each type, verify the min remaining across nights in range is \u2265 requested rooms."},{type:"mermaid",caption:"Hold then confirm flow.",definition:`sequenceDiagram
  participant G as Guest
  participant API as BookingService
  participant INV as RoomNightInventory
  participant Pay as Payment
  G->>API: search(type, dates)
  API->>INV: remaining per night
  API-->>G: available types
  G->>API: hold(type, dates)
  API->>INV: optimistic hold++
  API-->>G: HOLD id + TTL
  G->>Pay: pay
  Pay-->>API: success
  API->>INV: held-- , sold++
  API-->>G: CONFIRMED`},{type:"table",caption:"Booking statuses.",headers:["Status","Inventory effect"],rows:[["HOLD","Increments held for each night; TTL countdown"],["CONFIRMED","Moves held \u2192 sold (or increments sold, decrements held)"],["EXPIRED","Hold TTL elapsed; held released"],["CANCELLED","Sold (or held) released per cancel policy"]]}]},{id:"overbooking",title:"Overbooking Policy",blocks:[{type:"markdown",value:`Hotels often **oversell** a percentage of rooms expecting no-shows and last-minute cancels. In design interviews, call this out explicitly:

- **Cap**: e.g. allow \`sold + held \u2264 allotment \xD7 1.05\`.
- **Walk policy**: if everyone shows up, upgrade, relocate partner hotel, or compensate \u2014 ops process, not just a counter.
- **Risk**: higher overbook \u2192 higher revenue and higher walk risk.

Implement overbooking as a configurable limit on the inventory check, not as silent corruption of allotment.`},{type:"callout",variant:"warning",title:"Interview framing",body:"Say you would **default to no overbooking** for correctness in the LLD, then show where a `overbookLimit` parameter plugs into the same availability predicate \u2014 that signals product awareness without derailing the class design."},{type:"prosCons",title:"Allowing overbooking",pros:["Recovers revenue lost to no-shows.","Industry-standard lever for revenue management."],cons:["Guest experience risk when walks happen.","Needs ops playbooks and compensation logic.","Harder fairness under concurrent last-room races."]}]},{id:"concurrency",title:"Concurrency: Optimistic Locking",blocks:[{type:"markdown",value:"Two guests must not confirm the last room-night. Prefer **optimistic locking** on each `RoomNight` row: read `version`, compute new held/sold, `UPDATE \u2026 WHERE version = ?`. If zero rows updated, retry or fail the hold.\n\nAlternative: `SELECT FOR UPDATE` (pessimistic) on the night rows for the range \u2014 simpler under low contention, more lock wait under spikes."},{type:"code",language:"java",filename:"RoomNightInventory.java",code:`public class RoomNightInventory {
  private final JdbcTemplate jdbc;

  /** Returns true if hold acquired for all nights in [checkIn, checkOut). */
  public boolean tryHold(String roomTypeId, LocalDate checkIn, LocalDate checkOut,
                         int rooms, int overbookLimit) {
    List<LocalDate> nights = nightsBetween(checkIn, checkOut);
    for (int attempt = 0; attempt < 3; attempt++) {
      boolean ok = true;
      for (LocalDate night : nights) {
        var row = jdbc.queryForObject(
            "SELECT allotment, sold, held, version FROM room_night WHERE type_id=? AND night=?",
            (rs, i) -> new NightRow(rs.getInt(1), rs.getInt(2), rs.getInt(3), rs.getInt(4)),
            roomTypeId, night);
        int capacity = row.allotment() + overbookLimit;
        if (row.sold() + row.held() + rooms > capacity) {
          ok = false;
          break;
        }
        int updated = jdbc.update(
            "UPDATE room_night SET held = held + ?, version = version + 1 "
                + "WHERE type_id=? AND night=? AND version=? "
                + "AND sold + held + ? <= allotment + ?",
            rooms, roomTypeId, night, row.version(), rooms, overbookLimit);
        if (updated != 1) {
          ok = false;
          break;
        }
      }
      if (ok) return true;
      // conflict \u2014 retry whole range (production: compensate partial holds)
    }
    return false;
  }
}

record NightRow(int allotment, int sold, int held, int version) {}`},{type:"callout",variant:"tip",title:"Partial hold compensation",body:"If you update night 1\u20133 successfully and fail on night 4, **roll back** held increments on 1\u20133 in the same transaction, or use a single transaction spanning all nights so commit is atomic."}]},{id:"entities",title:"Class Design",blocks:[{type:"mermaid",caption:"Core classes.",definition:`classDiagram
  class Hotel {
    String id
    String name
  }
  class RoomType {
    String id
    String name
    int basePriceCents
    int totalRooms
  }
  class Room {
    String id
    String number
    RoomType type
  }
  class RoomNight {
    RoomType type
    LocalDate night
    int allotment
    int sold
    int held
    int version
  }
  class Reservation {
    String id
    Guest guest
    RoomType type
    LocalDate checkIn
    LocalDate checkOut
    Status status
    Instant holdExpiresAt
  }
  class Guest {
    String id
    String email
  }
  class BookingService {
    +search(...)
    +hold(...)
    +confirm(...)
    +cancel(...)
  }
  Hotel "1" --> "*" RoomType
  RoomType "1" --> "*" Room
  RoomType "1" --> "*" RoomNight
  Reservation --> RoomType
  Reservation --> Guest
  BookingService --> Reservation
  BookingService --> RoomNight`},{type:"code",language:"java",filename:"BookingService.java",code:`public class BookingService {
  private final RoomNightInventory inventory;
  private final ReservationRepository reservations;
  private final Clock clock;
  private final Duration holdTtl = Duration.ofMinutes(15);

  public Reservation hold(String typeId, LocalDate in, LocalDate out,
                          Guest guest, int rooms) {
    if (!inventory.tryHold(typeId, in, out, rooms, /*overbook*/ 0)) {
      throw new SoldOutException();
    }
    var r = new Reservation(
        Id.new(), guest, typeId, in, out,
        Status.HOLD, clock.instant().plus(holdTtl), rooms);
    reservations.save(r);
    return r;
  }

  public Reservation confirm(String reservationId, PaymentResult payment) {
    var r = reservations.require(reservationId);
    if (r.status() != Status.HOLD) throw new IllegalStateException();
    if (clock.instant().isAfter(r.holdExpiresAt())) {
      inventory.releaseHold(r);
      r.setStatus(Status.EXPIRED);
      throw new HoldExpiredException();
    }
    if (!payment.ok()) throw new PaymentFailedException();
    inventory.convertHoldToSold(r);
    r.setStatus(Status.CONFIRMED);
    reservations.save(r);
    return r;
  }
}`},{type:"code",language:"java",filename:"ReservationStatus.java",code:`public enum Status {
  HOLD,
  CONFIRMED,
  EXPIRED,
  CANCELLED
}

/** Expire holds \u2014 run every minute. */
public class HoldExpiryJob {
  public void run(ReservationRepository repo, RoomNightInventory inv, Clock clock) {
    for (var r : repo.findExpiredHolds(clock.instant())) {
      inv.releaseHold(r);
      r.setStatus(Status.EXPIRED);
      repo.save(r);
    }
  }
}`}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"How do you model hotel inventory differently from movie seats?",answer:"Movies: seat \xD7 showtime. Hotels: **room type \xD7 night** with a contiguous range. Availability requires capacity on **every** night in the stay, not a single slot."},{question:"Explain hold vs confirm.",answer:"**Hold** temporarily reserves room-nights with a TTL while the guest pays. **Confirm** converts hold to sold after payment. Expired holds release inventory automatically."},{question:"How do you prevent double booking under concurrency?",answer:"**Optimistic locking** on room-night rows (version column) or pessimistic locks for the date range in one transaction. Retry on conflict; never decrement below capacity."},{question:"What is overbooking and would you implement it?",answer:"Selling above physical allotment based on expected no-shows. Mention as a configurable cap and walk policy; default off in the core LLD for clarity."},{question:"When do you assign a physical room number?",answer:"Often at **check-in**, not at booking \u2014 booking sells a **type**. This maximizes flexibility for maintenance and upgrades. Early assignment is possible but reduces housekeeping flexibility."},{question:"How does search stay efficient for a year of nights?",answer:"Store denser room-night rows or aggregates; index `(type_id, night)`. For search, read the range and compute min remaining. Caches can hold hot near-term dates."},{question:"What happens when payment succeeds after hold expiry?",answer:"Treat as failure or attempt a **new hold**; do not confirm against released inventory. Idempotent payment webhooks must check reservation status."},{question:"Cancel a confirmed booking mid-stay?",answer:"Policy-driven: release remaining nights, keep consumed nights as sold, apply fees. Inventory release only for nights still unused."},{question:"Compare optimistic vs pessimistic locking here.",answer:"Optimistic: better under low conflict, needs retries. Pessimistic `FOR UPDATE` on the night range: simpler correctness, can serialize peak \u201Clast room\u201D traffic. Many systems use optimistic with short transactions."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Inventory = **room-nights** over a date range, not single-slot seats.
2. Flow: **search \u2192 HOLD (TTL) \u2192 CONFIRMED**; expire holds reliably.
3. Discuss **overbooking** as policy; gate it with an explicit cap.
4. Protect concurrency with **optimistic locking** (or range locks) on room-night rows.
5. Contrast with **movie-ticket-booking**: time slots vs date ranges.`}]}]},n=o;export{n as default};
