import{a as e}from"./chunk-5PDMNUPC.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"Design a **multi-floor parking lot** that can park and unpark vehicles of different sizes, issue tickets, track spot availability in real time, and charge a fee on exit. This is one of the most common **object-oriented design (OOD)** interview questions because it is small enough to finish in 45 minutes but rich enough to touch class design, enums, composition, patterns, and concurrency."},{type:"callout",variant:"info",title:"Why interviewers ask this",body:"It is a **blank-canvas OOP test**. There is no single correct answer \u2014 the interviewer wants to see how you decompose a real-world system into classes, pick the right relationships (composition vs inheritance), and justify trade-offs out loud."},{type:"table",caption:"What a strong answer demonstrates.",headers:["Evaluated skill","What to show"],rows:[["Requirement gathering","Ask clarifying questions before writing any class"],["Entity modeling","Clean nouns \u2192 classes, verbs \u2192 methods, variability \u2192 enums/interfaces"],["Design patterns","Strategy for pricing, Factory for spot assignment, Singleton for the lot manager"],["Extensibility (OCP)","Adding a new spot type or pricing model needs no `if/else` surgery"],["Concurrency","Two cars cannot be assigned the same spot under load"],["API surface","A few clean public methods: `parkVehicle`, `unparkVehicle`, `getTicket`"]]},{type:"callout",variant:"tip",title:"Framing your answer",body:'Say this out loud early: *"I will gather requirements, define entities and their relationships, sketch the class diagram, then implement the core `park`/`unpark` flow with a pricing strategy, and finally discuss concurrency and extensions."* This signals structure before you write a single line of code.'}]},{id:"clarifying-questions",title:"Clarifying Questions",blocks:[{type:"markdown",value:'Never assume scope. Spend the first 3\u20135 minutes narrowing the problem \u2014 interviewers actively reward this and will often tell you to "just pick something reasonable," which you then state as an assumption.'},{type:"table",caption:'Questions to ask, and reasonable assumptions if the interviewer says "you decide".',headers:["Question","Sample answer / assumption"],rows:[["How many floors, and can floors differ in layout?","Multiple floors (configurable count); each floor has its own set of spots but shares the same spot-type taxonomy."],["What vehicle types and spot types exist?","Vehicles: motorcycle, car, bus/truck. Spots: compact, large, handicapped, EV (with charger). A motorcycle can fit anywhere; a bus needs a large spot (or several)."],["How is pricing determined?","Hourly rate by vehicle type, with a flat-rate/day-pass option. Pricing must be swappable without touching the parking logic \u2014 use Strategy."],["Do we support reservations or only walk-ins?","Walk-in only for the core design; call out reservations as an extension."],["How many entry/exit gates, and do they need independent hardware (ticket kiosk, gate arm)?","Multiple entry and exit panels feeding a shared `ParkingLot` \u2014 model as separate `EntrancePanel`/`ExitPanel` classes so gate hardware concerns stay out of core logic."],["Is this single-process or must it scale across machines?","Single JVM / in-memory for the LLD round; mention DB-backed spot state and distributed locks (or DB row locking) as a scaling follow-up."],["What happens when the lot is full?",'Reject entry (display "FULL" sign); optionally support a "leave and get notified" queue as a nice-to-have.'],["Do handicapped/EV spots need special permission checks?","Handicapped spots require a permit flag on the vehicle/driver; EV spots are open to any vehicle but ideally to EVs first."]]}]},{id:"requirements",title:"Requirements",blocks:[{type:"markdown",value:"### Functional requirements"},{type:"table",headers:["#","Requirement"],rows:[["F1","Park a vehicle by assigning it the best-fit available spot and issuing a ticket"],["F2","Unpark a vehicle: validate the ticket, compute the fee, free the spot, close the ticket"],["F3","Support multiple floors, each with a mix of spot types"],["F4","Support multiple vehicle types (motorcycle, car, bus) with size-based spot matching"],["F5","Display real-time available-spot counts per floor and per type"],["F6","Support pluggable pricing strategies (hourly vs flat/day-pass)"],["F7","Reject entry when the lot (or matching spot type) is full"],["F8","Support handicapped and EV spots with allocation preference/eligibility rules"]]},{type:"markdown",value:"### Non-functional requirements"},{type:"table",headers:["#","Requirement"],rows:[["N1","Thread safety \u2014 concurrent entries must never double-assign a spot"],["N2","Low latency for `parkVehicle`/`unparkVehicle` \u2014 O(1)\u2013O(floors) spot lookup, not a full scan"],["N3","Extensibility \u2014 new spot types, vehicle types, or pricing models should not require editing existing classes (Open/Closed Principle)"],["N4","Consistency \u2014 a spot is either FREE or OCCUPIED, never both views at once"],["N5","Auditable \u2014 every ticket records entry time, exit time, spot, and fee for reporting"]]},{type:"callout",variant:"warning",title:"Out of scope (state this explicitly)",body:"Payment gateway integration, license-plate recognition hardware, and multi-datacenter scaling are out of scope for the core design \u2014 mention them briefly as extensions rather than designing them in depth."}]},{id:"entities",title:"Core Entities",blocks:[{type:"markdown",value:"Translate nouns from the requirements into classes, and variability (spot type, vehicle type, pricing) into **enums or interfaces** rather than string flags or `if/else` chains."},{type:"table",caption:"Core classes and their responsibilities.",headers:["Entity","Responsibility"],rows:[["`ParkingLot`","Top-level aggregate; owns floors, entry/exit panels; orchestrates park/unpark (often a Singleton)"],["`ParkingFloor`","Owns a collection of `ParkingSpot`s for one level; tracks per-type free-spot counts"],["`ParkingSpot`","A single physical spot: id, `SpotType`, occupied flag, currently-parked `Vehicle`"],["`Vehicle`","Abstract base with `VehicleType`, license plate; subclasses `Motorcycle`, `Car`, `Bus`"],["`SpotType`","Enum: `COMPACT`, `LARGE`, `HANDICAPPED`, `EV`"],["`VehicleType`","Enum: `MOTORCYCLE`, `CAR`, `BUS`"],["`Ticket`","Immutable-ish record: id, vehicle, spot, entry time, exit time, fee, status"],["`SpotAssignmentStrategy` / `SpotFactory`","Decides which free spot a vehicle gets (best-fit policy)"],["`FeeStrategy`","Interface for fee calculation: `HourlyFeeStrategy`, `FlatRateFeeStrategy`"],["`EntrancePanel` / `ExitPanel`","Gate hardware boundary \u2014 calls into `ParkingLot` for park/unpark"],["`ParkingLotManager` (optional Singleton)","Process-wide access point to the one `ParkingLot` instance"]]},{type:"markdown",value:"**Spot-fit rule** (the crux of the matching logic): a motorcycle fits in a compact spot; a car needs compact-or-larger; a bus needs a large spot (in a real system, possibly several contiguous large spots \u2014 call this out as a simplification). Handicapped and EV spots are separate allocation pools with eligibility rules layered on top of size fit."},{type:"table",caption:"Vehicle-to-spot compatibility matrix.",headers:["Vehicle \\ Spot","COMPACT","LARGE","HANDICAPPED","EV"],rows:[["MOTORCYCLE","Yes","Yes","With permit","Yes (charging optional)"],["CAR","Yes","Yes","With permit","Yes (charging optional)"],["BUS","No","Yes","No","No"]]},{type:"callout",variant:"tip",title:"Composition over inheritance",body:'`ParkingLot` **has** `ParkingFloor`s, which **have** `ParkingSpot`s. Avoid inheriting `ParkingFloor` from `ParkingLot` \u2014 there is no "is-a" relationship, only "has-a". Reserve inheritance for the `Vehicle` hierarchy where subtype behavior genuinely differs (size, allowed spot types).'}]},{id:"class-design",title:"Class Diagram",blocks:[{type:"mermaid",caption:"Core class relationships for the parking lot.",definition:`classDiagram
  class ParkingLot {
    -id: String
    -floors: List~ParkingFloor~
    -feeStrategy: FeeStrategy
    -activeTickets: Map~String, Ticket~
    +parkVehicle(vehicle) Ticket
    +unparkVehicle(ticketId) double
    +getAvailableSpotCount(type) int
  }
  class ParkingFloor {
    -floorNumber: int
    -spots: List~ParkingSpot~
    +findAvailableSpot(vehicle) ParkingSpot
    +availableCount(type) int
  }
  class ParkingSpot {
    -id: String
    -type: SpotType
    -occupied: boolean
    -parkedVehicle: Vehicle
    +assign(vehicle) void
    +release() void
    +isAvailableFor(vehicle) boolean
  }
  class SpotType {
    <<enumeration>>
    COMPACT
    LARGE
    HANDICAPPED
    EV
  }
  class Vehicle {
    <<abstract>>
    -licensePlate: String
    -type: VehicleType
    +getType() VehicleType
  }
  class Motorcycle
  class Car
  class Bus
  class VehicleType {
    <<enumeration>>
    MOTORCYCLE
    CAR
    BUS
  }
  class Ticket {
    -id: String
    -vehicle: Vehicle
    -spot: ParkingSpot
    -entryTime: Instant
    -exitTime: Instant
    -fee: double
    -status: TicketStatus
  }
  class FeeStrategy {
    <<interface>>
    +calculateFee(ticket) double
  }
  class HourlyFeeStrategy
  class FlatRateFeeStrategy
  class SpotAssignmentStrategy {
    <<interface>>
    +findSpot(floors, vehicle) ParkingSpot
  }
  class BestFitSpotAssignmentStrategy

  ParkingLot "1" *-- "many" ParkingFloor
  ParkingFloor "1" *-- "many" ParkingSpot
  ParkingSpot --> SpotType
  ParkingSpot --> Vehicle
  Vehicle <|-- Motorcycle
  Vehicle <|-- Car
  Vehicle <|-- Bus
  Vehicle --> VehicleType
  ParkingLot --> FeeStrategy
  FeeStrategy <|.. HourlyFeeStrategy
  FeeStrategy <|.. FlatRateFeeStrategy
  ParkingLot --> SpotAssignmentStrategy
  SpotAssignmentStrategy <|.. BestFitSpotAssignmentStrategy
  ParkingLot "1" --> "many" Ticket`}]},{id:"flows",title:"Key Flows",blocks:[{type:"markdown",value:"### Flow 1 \u2014 Park a vehicle"},{type:"mermaid",caption:"Entry gate to ticket issuance.",definition:`sequenceDiagram
  participant D as Driver
  participant EP as EntrancePanel
  participant PL as ParkingLot
  participant SAS as SpotAssignmentStrategy
  participant PF as ParkingFloor
  participant PS as ParkingSpot

  D->>EP: Arrive at entrance
  EP->>PL: parkVehicle(vehicle)
  PL->>PL: lock (per-floor or per-type)
  PL->>SAS: findSpot(floors, vehicle)
  SAS->>PF: availableCount(compatibleType)
  PF-->>SAS: candidate spot / null
  SAS-->>PL: chosen ParkingSpot
  alt spot found
    PL->>PS: assign(vehicle)
    PL->>PL: create Ticket(entryTime=now)
    PL->>PL: unlock
    PL-->>EP: Ticket
    EP-->>D: Print ticket, open gate
  else lot full for this type
    PL->>PL: unlock
    PL-->>EP: LotFullException
    EP-->>D: Show "FULL" sign, deny entry
  end`},{type:"markdown",value:"### Flow 2 \u2014 Exit and fee calculation"},{type:"mermaid",caption:"Exit gate validates the ticket, prices the stay, and frees the spot.",definition:`sequenceDiagram
  participant D as Driver
  participant XP as ExitPanel
  participant PL as ParkingLot
  participant FS as FeeStrategy
  participant PS as ParkingSpot

  D->>XP: Present ticket
  XP->>PL: unparkVehicle(ticketId)
  PL->>PL: lookup Ticket by id
  alt ticket not found or already closed
    PL-->>XP: InvalidTicketException
    XP-->>D: Reject
  else valid ticket
    PL->>PL: ticket.exitTime = now
    PL->>FS: calculateFee(ticket)
    FS-->>PL: fee amount
    PL->>PS: release()
    PL->>PL: ticket.status = PAID, remove from activeTickets
    PL-->>XP: fee amount
    XP-->>D: Collect payment, open gate
  end`},{type:"callout",variant:"info",title:"Say this about concurrency",body:"Both flows above cross a **critical section** in `ParkingLot` \u2014 spot lookup-and-assign and ticket lookup-and-close must be atomic. See the *Patterns* and *Implementation* sections for how a lock (or DB-level `SELECT ... FOR UPDATE`) prevents two drivers from getting the same spot."}]},{id:"patterns",title:"Design Patterns",blocks:[{type:"table",caption:"Where each pattern earns its place \u2014 and why.",headers:["Pattern","Applied to","Why it fits"],rows:[["Strategy","`FeeStrategy` (hourly, flat-rate, weekday/weekend, membership discount)","Pricing rules change often and independently of parking logic \u2014 swap the algorithm without touching `ParkingLot`"],["Strategy","`SpotAssignmentStrategy` (best-fit vs nearest-to-entrance vs load-balanced across floors)",'The "which spot do we assign" policy is a separate axis of change from the core park/unpark workflow'],["Factory Method","`VehicleFactory.create(type, plate)` and spot-set generation when a floor is provisioned","Centralizes object creation so new vehicle/spot subtypes do not leak `new` calls across the codebase"],["Singleton","`ParkingLotManager` \u2014 the single process-wide access point to the one lot instance","There is exactly one physical lot to coordinate; avoid duplicate managers holding divergent spot state. Prefer DI-scoped singleton over a hand-rolled static instance (see the Singleton pattern page)"],["Observer","`ParkingLot` notifies a `DisplayBoard` (or pub/sub topic) when free-spot counts change",'Decouples the "spots changed" event from anyone who needs to react \u2014 signage, mobile app, analytics'],["Decorator (extension)","Wrapping a `FeeStrategy` with a surcharge (e.g. holiday pricing) without new subclasses per combination","Avoids a combinatorial explosion of strategy subclasses when discounts/surcharges stack"]]},{type:"callout",variant:"tip",title:"What to say about Strategy vs Factory here",body:'**Strategy** answers *"how do we compute something (fee, spot choice)?"* and is swapped per call or per lot config. **Factory** answers *"how do we construct an object (a `Vehicle` or a `ParkingSpot`)?"* Keep the distinction crisp \u2014 interviewers often probe it directly.'}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"### Enums and the vehicle hierarchy"},{type:"code",language:"java",filename:"SpotType.java",code:`public enum SpotType {
  COMPACT,
  LARGE,
  HANDICAPPED,
  EV
}`},{type:"code",language:"java",filename:"Vehicle.java",code:`public abstract class Vehicle {
  private final String licensePlate;

  protected Vehicle(String licensePlate) {
    this.licensePlate = licensePlate;
  }

  public String getLicensePlate() {
    return licensePlate;
  }

  public abstract VehicleType getType();

  /** Spot types this vehicle can legally occupy, in preference order. */
  public abstract List<SpotType> compatibleSpotTypes();
}

public final class Motorcycle extends Vehicle {
  public Motorcycle(String licensePlate) { super(licensePlate); }
  public VehicleType getType() { return VehicleType.MOTORCYCLE; }
  public List<SpotType> compatibleSpotTypes() {
    return List.of(SpotType.COMPACT, SpotType.LARGE, SpotType.EV);
  }
}

public final class Car extends Vehicle {
  public Car(String licensePlate) { super(licensePlate); }
  public VehicleType getType() { return VehicleType.CAR; }
  public List<SpotType> compatibleSpotTypes() {
    return List.of(SpotType.COMPACT, SpotType.LARGE, SpotType.EV);
  }
}

public final class Bus extends Vehicle {
  public Bus(String licensePlate) { super(licensePlate); }
  public VehicleType getType() { return VehicleType.BUS; }
  public List<SpotType> compatibleSpotTypes() {
    return List.of(SpotType.LARGE);
  }
}`},{type:"markdown",value:"### `ParkingSpot` \u2014 small, defensive, and lock-friendly"},{type:"code",language:"java",filename:"ParkingSpot.java",code:`public final class ParkingSpot {
  private final String id;
  private final SpotType type;
  private volatile boolean occupied;
  private volatile Vehicle parkedVehicle;

  public ParkingSpot(String id, SpotType type) {
    this.id = id;
    this.type = type;
  }

  public synchronized boolean tryAssign(Vehicle vehicle) {
    if (occupied) {
      return false;
    }
    if (!vehicle.compatibleSpotTypes().contains(type)) {
      return false;
    }
    this.occupied = true;
    this.parkedVehicle = vehicle;
    return true;
  }

  public synchronized void release() {
    this.occupied = false;
    this.parkedVehicle = null;
  }

  public boolean isOccupied() { return occupied; }
  public SpotType getType() { return type; }
  public String getId() { return id; }
  public Vehicle getParkedVehicle() { return parkedVehicle; }
}`},{type:"markdown",value:"`tryAssign` is the **atomic unit** of the whole system: it checks-and-sets occupancy under a per-spot lock, so two threads racing for the same spot cannot both succeed. This pushes the concurrency concern down to the smallest possible scope instead of locking the entire `ParkingLot`."},{type:"markdown",value:"### `ParkingFloor` \u2014 owns spots, exposes fast queries"},{type:"code",language:"java",filename:"ParkingFloor.java",code:`public final class ParkingFloor {
  private final int floorNumber;
  private final Map<SpotType, List<ParkingSpot>> spotsByType = new EnumMap<>(SpotType.class);

  public ParkingFloor(int floorNumber, Map<SpotType, List<ParkingSpot>> spotsByType) {
    this.floorNumber = floorNumber;
    this.spotsByType.putAll(spotsByType);
  }

  public int getFloorNumber() { return floorNumber; }

  /** Attempts to claim any free, compatible spot on this floor. Returns null if none. */
  public ParkingSpot tryFindAndAssign(Vehicle vehicle) {
    for (SpotType type : vehicle.compatibleSpotTypes()) {
      for (ParkingSpot spot : spotsByType.getOrDefault(type, List.of())) {
        if (spot.tryAssign(vehicle)) {
          return spot;
        }
      }
    }
    return null;
  }

  public long availableCount(SpotType type) {
    return spotsByType.getOrDefault(type, List.of()).stream()
        .filter(s -> !s.isOccupied())
        .count();
  }
}`},{type:"markdown",value:"### Fee strategies (Strategy pattern)"},{type:"code",language:"java",filename:"FeeStrategy.java",code:`public interface FeeStrategy {
  double calculateFee(Ticket ticket);
}

public final class HourlyFeeStrategy implements FeeStrategy {
  private final Map<VehicleType, Double> ratePerHour;

  public HourlyFeeStrategy(Map<VehicleType, Double> ratePerHour) {
    this.ratePerHour = ratePerHour;
  }

  @Override
  public double calculateFee(Ticket ticket) {
    Duration parked = Duration.between(ticket.getEntryTime(), ticket.getExitTime());
    long billableHours = Math.max(1, (long) Math.ceil(parked.toMinutes() / 60.0));
    double rate = ratePerHour.getOrDefault(ticket.getVehicle().getType(), 2.0);
    return billableHours * rate;
  }
}

public final class FlatRateFeeStrategy implements FeeStrategy {
  private final double flatRate;

  public FlatRateFeeStrategy(double flatRate) {
    this.flatRate = flatRate;
  }

  @Override
  public double calculateFee(Ticket ticket) {
    return flatRate; // e.g. day-pass, regardless of duration
  }
}`},{type:"markdown",value:"### `Ticket` and the `ParkingLot` orchestrator"},{type:"code",language:"java",filename:"Ticket.java",code:`public final class Ticket {
  public enum Status { ACTIVE, PAID }

  private final String id;
  private final Vehicle vehicle;
  private final ParkingSpot spot;
  private final Instant entryTime;
  private Instant exitTime;
  private double fee;
  private Status status = Status.ACTIVE;

  public Ticket(String id, Vehicle vehicle, ParkingSpot spot, Instant entryTime) {
    this.id = id;
    this.vehicle = vehicle;
    this.spot = spot;
    this.entryTime = entryTime;
  }

  public void closeWith(Instant exitTime, double fee) {
    this.exitTime = exitTime;
    this.fee = fee;
    this.status = Status.PAID;
  }

  public String getId() { return id; }
  public Vehicle getVehicle() { return vehicle; }
  public ParkingSpot getSpot() { return spot; }
  public Instant getEntryTime() { return entryTime; }
  public Instant getExitTime() { return exitTime; }
  public double getFee() { return fee; }
  public Status getStatus() { return status; }
}`},{type:"code",language:"java",filename:"ParkingLot.java",code:`public final class ParkingLot {
  private final List<ParkingFloor> floors;
  private final FeeStrategy feeStrategy;
  private final Map<String, Ticket> activeTickets = new ConcurrentHashMap<>();
  private final AtomicLong ticketSequence = new AtomicLong();

  public ParkingLot(List<ParkingFloor> floors, FeeStrategy feeStrategy) {
    this.floors = floors;
    this.feeStrategy = feeStrategy;
  }

  public Ticket parkVehicle(Vehicle vehicle) {
    for (ParkingFloor floor : floors) {
      ParkingSpot spot = floor.tryFindAndAssign(vehicle);
      if (spot != null) {
        String ticketId = "T-" + ticketSequence.incrementAndGet();
        Ticket ticket = new Ticket(ticketId, vehicle, spot, Instant.now());
        activeTickets.put(ticketId, ticket);
        return ticket;
      }
    }
    throw new LotFullException("No compatible spot available for " + vehicle.getType());
  }

  public double unparkVehicle(String ticketId) {
    Ticket ticket = activeTickets.remove(ticketId);
    if (ticket == null || ticket.getStatus() == Ticket.Status.PAID) {
      throw new InvalidTicketException("Ticket not found or already closed: " + ticketId);
    }
    double fee = feeStrategy.calculateFee(withProvisionalExit(ticket));
    ticket.closeWith(Instant.now(), fee);
    ticket.getSpot().release();
    return fee;
  }

  private Ticket withProvisionalExit(Ticket ticket) {
    // FeeStrategy reads exitTime off the ticket; stamp it just-in-time
    // so calculateFee() sees a consistent snapshot without a second field.
    ticket.closeWith(Instant.now(), 0.0);
    return ticket;
  }

  public long availableSpotCount(SpotType type) {
    return floors.stream().mapToLong(f -> f.availableCount(type)).sum();
  }
}`},{type:"callout",variant:"warning",title:"Concurrency: the spot-allocation race",body:'Naively, "find a free spot" (read) and "mark it occupied" (write) as two separate steps lets two threads pick the **same** spot before either writes. This design closes that gap by making `ParkingSpot.tryAssign()` a single `synchronized` check-and-set \u2014 an atomic compare-and-swap on one spot\'s state, not a lock over the whole lot. `ParkingFloor.tryFindAndAssign` then just tries spots one by one; only one thread wins each `tryAssign` call. In a distributed/multi-node deployment, swap the in-memory lock for a DB row lock (`SELECT ... FOR UPDATE`) or a distributed lock (Redis `SETNX`) around the same claim step.'}]},{id:"extensions",title:"Extensions & Follow-ups",blocks:[{type:"markdown",value:'Interviewers almost always follow up with "how would you extend this for X?" Have quick, structured answers ready:'},{type:"table",headers:["Follow-up","Approach"],rows:[["Multiple entry/exit gates working concurrently","Each gate calls the same thread-safe `ParkingLot` API; per-spot locking (already in the design) makes this safe by construction. For multi-process deployments, back it with a shared DB/cache instead of in-memory state."],["EV charging spots with metered billing","Add `EVChargingSession` composed into the `Ticket`; extend `FeeStrategy` with a `ChargingFeeDecorator` that adds energy-usage cost on top of parking time."],["Dynamic/surge pricing","Swap in a `SurgePricingFeeStrategy` (or wrap `HourlyFeeStrategy` with a Decorator) driven by current occupancy percentage \u2014 no change to `ParkingLot`."],["Reservations booked in advance","Introduce a `Reservation` entity and a spot-hold state (`RESERVED`) distinct from `OCCUPIED`; `tryFindAndAssign` must also skip reserved-but-unclaimed spots."],["Buses needing multiple contiguous large spots","Model spots with a `position` (row/column) and add a `ContiguousBlockSpotAssignmentStrategy` that finds N adjacent free `LARGE` spots atomically (lock the whole block, not one spot)."],["Real-time display boards / mobile app showing free counts","Publish spot-state-changed events (Observer / message queue) so displays subscribe instead of polling `ParkingLot` directly."],["Horizontal scaling across many lots/cities","Move from in-memory `Map` to a database (spots table with optimistic/row locking) or a dedicated allocation service behind an API; `ParkingLot` becomes a client of that service rather than the source of truth."],["Lost ticket / damaged ticket handling",'Add a manual "lost ticket" flow charging a max-stay flat fee, looked up by license plate instead of ticket id.']]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:'How do you decide which class owns the "find a spot" logic \u2014 ParkingLot, ParkingFloor, or ParkingSpot?',answer:"Push the decision as close to the data as possible: `ParkingSpot` knows only how to atomically claim itself; `ParkingFloor` iterates its own spots to find a candidate; `ParkingLot` iterates floors and delegates. This keeps each class's responsibility tight (Single Responsibility) and keeps the lock scope minimal (per-spot, not per-lot), which is exactly the difference between a slow, single-threaded design and a scalable one."},{question:"Why use enums (SpotType, VehicleType) instead of subclassing spots or using strings?",answer:'Spot **type** is a closed, small set of categories with no distinct behavior per type \u2014 a perfect enum. Vehicle **type** does have distinct behavior (size, compatible spots), so it becomes a class hierarchy (`Vehicle` \u2192 `Car`/`Bus`/`Motorcycle`) instead. Strings would lose compile-time safety and invite typo bugs like `"compact "` vs `"COMPACT"`.'},{question:"Where exactly is the race condition, and how does your design prevent it?",answer:'The race is between "read: is this spot free?" and "write: mark it occupied" \u2014 if two threads both read `false` (not occupied) before either writes `true`, both think they got the spot. The fix is collapsing read+write into one atomic operation: `ParkingSpot.tryAssign()` is `synchronized` and does the occupancy check and the mutation inside the same critical section, so only one caller can ever transition a given spot from free to occupied.'},{question:"Why not just lock the entire ParkingLot for every park() call?",answer:"It would be correct but kills throughput \u2014 every entry gate serializes behind one global lock even though two drivers heading to different floors have nothing to contend over. Locking at the spot level lets unrelated assignments proceed in parallel; contention only happens when two threads truly compete for the same spot."},{question:"How would you calculate the fee if a vehicle stays 25 minutes vs 65 minutes, hourly billing?",answer:"Round up to the next billable hour with a 1-hour minimum: 25 minutes \u2192 1 hour charged, 65 minutes \u2192 2 hours charged. Implement with `Math.ceil(minutes / 60.0)` and a `Math.max(1, ...)` floor, exactly as in `HourlyFeeStrategy`. Always clarify rounding rules with the interviewer \u2014 it is an easy, concrete detail that shows precision."},{question:"How do Strategy and Factory patterns both show up here, and how do they differ?",answer:"`FeeStrategy` and `SpotAssignmentStrategy` are Strategy \u2014 pluggable *algorithms* selected at construction/config time and invoked repeatedly. A `VehicleFactory` (or spot-provisioning factory) is Factory \u2014 centralizes *object construction* so callers never say `new Car(...)` directly, making it easy to add new vehicle types without touching client code."},{question:'What happens if the process crashes mid-transaction \u2014 does a car get "stuck" with no ticket, or does a spot leak as occupied forever?',answer:"With pure in-memory state, yes \u2014 a crash loses all active tickets and spot state, which is unacceptable in production. Mitigate by persisting ticket creation and spot claim as a single transaction (or via an outbox/event log) to a database, and running a reconciliation job on restart that reconstructs occupied spots from open tickets."},{question:'How would you support a "find nearest available spot to the elevator" feature?',answer:"Give each `ParkingSpot` a `distanceFromEntrance` (or coordinates), and add a `NearestSpotAssignmentStrategy` implementing the same `SpotAssignmentStrategy` interface, sorting compatible free spots by distance before attempting `tryAssign`. Because assignment policy is already behind an interface, this is a pure addition \u2014 no existing class changes (Open/Closed Principle in action)."},{question:"Singleton for ParkingLotManager \u2014 is that a good idea?",answer:"It is defensible because there truly is one physical lot per process and duplicate managers would fragment spot state \u2014 but say explicitly that you would prefer a DI-scoped singleton bean (Spring-style) over a hand-rolled static `getInstance()`, for the same testability reasons discussed in the Singleton pattern (hidden dependencies, harder mocking)."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:"1. Model **variability as enums/interfaces** (`SpotType`, `FeeStrategy`), and **behavior differences as class hierarchies** (`Vehicle`).\n2. Use **Strategy** for pricing and spot-assignment policy so new rules are additive, not invasive.\n3. Push locking to the **smallest atomic unit** \u2014 `ParkingSpot.tryAssign()` \u2014 to prevent the classic double-assignment race without serializing the whole lot.\n4. `ParkingLot` is a thin **orchestrator**: floors find spots, spots claim themselves, strategies price the ticket.\n5. Always narrate assumptions (spot types, pricing model, single-node scope) before coding, and have 2\u20133 extension answers ready (EV charging, reservations, distributed scaling)."}]}]},a=t;export{a as default};
