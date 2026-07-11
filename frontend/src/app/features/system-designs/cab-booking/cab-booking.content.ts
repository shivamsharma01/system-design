import { DesignContent } from '../../../shared/models';
import { CAB_BOOKING_META } from './cab-booking.meta';

/**
 * Cab Booking (Uber-like) — LLD focus on class design: rider/driver matching,
 * trip state machine, and pluggable pricing. Not a distributed-systems HLD.
 */
const content: DesignContent = {
  meta: CAB_BOOKING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Design the **object model** behind a ride-hailing app like Uber/Lyft: a `Rider` requests a trip, the system **matches** them with a nearby available `Driver`, the `Trip` moves through a well-defined **status lifecycle**, and the **fare** is computed by a pricing algorithm that can change (surge, promos) without touching the rest of the system.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Scope: LLD, not HLD',
          body: 'This is a **class-design** exercise — entities, interfaces, state machines, and pluggable algorithms in a single process. We are **not** designing sharded geo-indexes, Kafka pipelines, or multi-region failover here; those belong in the HLD version of this problem (see the "Design Uber" system-design article for that angle).',
        },
        {
          type: 'table',
          caption: 'System at a glance.',
          headers: ['Piece', 'Role'],
          rows: [
            ['`Rider`', 'Requests trips, rates drivers, has a payment method'],
            ['`Driver`', 'Accepts/rejects trip offers, owns a `Vehicle`, has a live `Location`'],
            ['`Vehicle`', 'Type (SEDAN/SUV/AUTO), capacity, plate number'],
            ['`Trip`', 'The aggregate root: rider, driver, pickup/drop locations, status, fare'],
            ['`MatchingStrategy`', 'Finds the best available driver for a trip request'],
            ['`PricingStrategy`', 'Computes the fare estimate/final fare for a trip'],
            ['`TripState`', 'State machine driving valid transitions of a `Trip`'],
            ['`NotificationService`', 'Observer subject that pushes trip-status events to rider/driver apps'],
          ],
        },
      ],
    },
    {
      id: 'clarifying-questions',
      title: 'Clarifying Questions',
      blocks: [
        {
          type: 'interviewQa',
          title: 'Questions to ask the interviewer',
          items: [
            {
              question: 'Are we designing the in-process class model, or the distributed system (geo-sharding, message queues, multi-region)?',
              answer:
                'Confirm **LLD**: classes, interfaces, and patterns for matching/pricing/trip lifecycle inside one service. We will treat driver locations as an in-memory index for the class design, and call out that a real system would shard this geospatially — but we will not design that sharding.',
            },
            {
              question: 'Do we need to support multiple vehicle types (auto, sedan, SUV, pool)?',
              answer: 'Yes — `Vehicle` has a `VehicleType`, and matching filters by the type the rider requested.',
            },
            {
              question: 'What is the matching strategy: nearest driver only, or does it factor in ratings/ETA?',
              answer: 'Start with **nearest available driver** by straight-line distance; mention it as a `MatchingStrategy` so ETA-aware or rating-weighted matching can be swapped in later.',
            },
            {
              question: 'How is pricing determined — flat rate, distance+time, surge?',
              answer: 'Base fare + per-km + per-minute, multiplied by a surge factor from current demand — modeled as a `PricingStrategy` so promo codes or flat night-rates can be added independently.',
            },
            {
              question: 'Can a rider or driver cancel mid-trip, and does that affect fare?',
              answer: 'Yes — cancellation is only valid in certain `TripStatus` values (e.g. not after `IN_PROGRESS`) and may incur a cancellation fee depending on how late it happens.',
            },
            {
              question: 'Do we need real-time location tracking during the ride?',
              answer: 'At the class-design level, note that `Driver.location` is updated periodically and the `Trip` can expose it to the rider — we will not design the streaming pipeline for that.',
            },
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
          value: '### Functional requirements',
        },
        {
          type: 'table',
          headers: ['#', 'Requirement'],
          rows: [
            ['1', 'Rider requests a trip with pickup/drop `Location` and desired `VehicleType`.'],
            ['2', 'System matches the request with the **nearest available** compatible `Driver`.'],
            ['3', 'Driver can **accept** or **reject** a trip offer within a timeout.'],
            ['4', 'Trip moves through a well-defined lifecycle: requested → driver assigned → arrived → in progress → completed.'],
            ['5', 'Fare is estimated at request time and finalized at completion via a pluggable pricing algorithm.'],
            ['6', 'Either party can cancel while the trip is in a cancellable state; a cancellation fee may apply.'],
            ['7', 'Both rider and driver receive real-time notifications of trip-status changes.'],
            ['8', 'Rider rates the driver (and vice versa) after trip completion.'],
          ],
        },
        {
          type: 'markdown',
          value: '### Non-functional requirements',
        },
        {
          type: 'table',
          headers: ['#', 'Requirement'],
          rows: [
            ['1', '**Extensibility**: new matching or pricing algorithms should not require changes to `Trip` or the booking flow (OCP).'],
            ['2', '**Correctness of state**: a `Trip` must never skip or reverse an invalid status transition.'],
            ['3', '**Decoupled notifications**: trip logic should not know how notifications are delivered (push/SMS).'],
            ['4', '**Testability**: matching and pricing must be unit-testable in isolation from the rest of the flow.'],
          ],
        },
      ],
    },
    {
      id: 'entities',
      title: 'Core Entities',
      blocks: [
        {
          type: 'table',
          caption: 'Entities and their responsibilities.',
          headers: ['Entity', 'Responsibility'],
          rows: [
            ['`Rider`', 'Id, name, payment method, current active trip (if any)'],
            ['`Driver`', 'Id, name, `Vehicle`, current `Location`, `DriverStatus` (AVAILABLE/ON_TRIP/OFFLINE)'],
            ['`Vehicle`', 'Plate number, `VehicleType` (AUTO/SEDAN/SUV), capacity'],
            ['`Location`', 'Latitude/longitude value object; supports distance calculation'],
            ['`Trip`', 'The aggregate root: rider, driver, pickup/drop `Location`, `TripStatus`, fare, timestamps'],
            ['`MatchingStrategy`', 'Interface: given a request and available drivers, returns the chosen driver'],
            ['`PricingStrategy`', 'Interface: given trip distance/duration/demand, returns a `Fare`'],
            ['`TripState`', 'Interface backing the state machine: `RequestedState`, `AssignedState`, `InProgressState`, `CompletedState`, `CancelledState`'],
            ['`NotificationService`', 'Observer subject publishing trip events to subscribed rider/driver observers'],
            ['`Rating`', 'Score + comment left by rider about driver or vice versa, linked to a `Trip`'],
          ],
        },
        {
          type: 'mermaid',
          caption: 'Enums driving the domain.',
          definition: `classDiagram
  class TripStatus {
    <<enumeration>>
    REQUESTED
    DRIVER_ASSIGNED
    ARRIVED
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }
  class DriverStatus {
    <<enumeration>>
    AVAILABLE
    ON_TRIP
    OFFLINE
  }
  class VehicleType {
    <<enumeration>>
    AUTO
    SEDAN
    SUV
  }`,
        },
      ],
    },
    {
      id: 'class-design',
      title: 'Class Design',
      blocks: [
        {
          type: 'markdown',
          value:
            '`Trip` is the aggregate root and the **State** context: it holds a `TripState` and delegates `accept`, `start`, `complete`, `cancel` to it. `RideBookingService` (a facade) owns the `MatchingStrategy` and `PricingStrategy`, keeping `Trip` itself free of algorithmic logic.',
        },
        {
          type: 'mermaid',
          caption: 'Static structure: rider/driver, trip aggregate, and pluggable strategies.',
          definition: `classDiagram
  class Location {
    -latitude: double
    -longitude: double
    +distanceTo(other) double
  }

  class Vehicle {
    -plateNumber: String
    -type: VehicleType
    -capacity: int
  }

  class Rider {
    -id: String
    -name: String
    -activeTripId: String
  }

  class Driver {
    -id: String
    -name: String
    -vehicle: Vehicle
    -location: Location
    -status: DriverStatus
  }
  Driver --> Vehicle
  Driver --> Location

  class Trip {
    -id: String
    -rider: Rider
    -driver: Driver
    -pickup: Location
    -drop: Location
    -status: TripStatus
    -fare: Fare
    -state: TripState
    +accept(driver) void
    +arrive() void
    +start() void
    +complete() void
    +cancel(actor) void
  }
  Trip --> Rider
  Trip --> Driver
  Trip --> Location : pickup/drop
  Trip --> TripState

  class TripState {
    <<interface>>
    +accept(trip, driver) void
    +arrive(trip) void
    +start(trip) void
    +complete(trip) void
    +cancel(trip, actor) void
  }
  class RequestedState
  class AssignedState
  class InProgressState
  class CompletedState
  class CancelledState
  TripState <|.. RequestedState
  TripState <|.. AssignedState
  TripState <|.. InProgressState
  TripState <|.. CompletedState
  TripState <|.. CancelledState

  class MatchingStrategy {
    <<interface>>
    +findDriver(request, candidates) Driver
  }
  class NearestDriverMatching
  MatchingStrategy <|.. NearestDriverMatching

  class PricingStrategy {
    <<interface>>
    +calculateFare(trip) Fare
  }
  class DistanceTimePricing
  class SurgePricing
  PricingStrategy <|.. DistanceTimePricing
  PricingStrategy <|.. SurgePricing

  class RideBookingService {
    -matching: MatchingStrategy
    -pricing: PricingStrategy
    -driverRegistry: DriverLocationIndex
    +requestTrip(rider, pickup, drop, vehicleType) Trip
    +acceptTrip(tripId, driverId) void
    +completeTrip(tripId) void
  }
  RideBookingService --> MatchingStrategy
  RideBookingService --> PricingStrategy
  RideBookingService ..> Trip : creates`,
        },
        {
          type: 'mermaid',
          caption: 'Observer pattern: rider and driver apps subscribe to trip-status events.',
          definition: `classDiagram
  class NotificationService {
    <<subject>>
    -subscribers: Map~String, List~TripObserver~~
    +subscribe(tripId, observer) void
    +publish(tripId, event) void
  }
  class TripObserver {
    <<interface>>
    +onTripEvent(event) void
  }
  class RiderAppNotifier
  class DriverAppNotifier
  TripObserver <|.. RiderAppNotifier
  TripObserver <|.. DriverAppNotifier
  NotificationService --> "many" TripObserver`,
        },
      ],
    },
    {
      id: 'flows',
      title: 'Key Flows',
      blocks: [
        {
          type: 'markdown',
          value: '### 1. Request → match → accept',
        },
        {
          type: 'mermaid',
          caption: 'Matching picks the nearest available driver; the driver still has to accept.',
          definition: `sequenceDiagram
  participant R as Rider
  participant Svc as RideBookingService
  participant Match as MatchingStrategy
  participant Idx as DriverLocationIndex
  participant D as Driver
  participant T as Trip

  R->>Svc: requestTrip(pickup, drop, vehicleType)
  Svc->>Idx: findNearby(pickup, vehicleType, radiusKm)
  Idx-->>Svc: candidateDrivers
  Svc->>Match: findDriver(request, candidateDrivers)
  Match-->>Svc: bestDriver
  Svc->>T: new Trip(rider, pickup, drop, status=REQUESTED)
  Svc->>D: offer(trip, timeoutSec=15)
  alt driver accepts
    D-->>Svc: accept
    Svc->>T: accept(driver)
    T->>T: setState(AssignedState); status=DRIVER_ASSIGNED
    Svc->>D: status = ON_TRIP
  else driver rejects or times out
    D-->>Svc: reject/timeout
    Svc->>Match: findDriver(request, remainingCandidates)
    Note over Svc: retry with next-nearest driver
  end`,
        },
        {
          type: 'markdown',
          value: '### 2. Trip lifecycle: arrive → start → complete',
        },
        {
          type: 'mermaid',
          caption: 'Each transition is only legal from the state that currently allows it; fare is finalized on completion.',
          definition: `sequenceDiagram
  participant D as Driver
  participant T as Trip
  participant Pricing as PricingStrategy
  participant Notif as NotificationService
  participant R as Rider

  D->>T: arrive()
  T->>T: state.arrive(trip)  note right of T: status -> ARRIVED
  T->>Notif: publish(tripId, DRIVER_ARRIVED)
  Notif->>R: onTripEvent(DRIVER_ARRIVED)

  D->>T: start()
  T->>T: state.start(trip)  note right of T: status -> IN_PROGRESS, startTime=now
  T->>Notif: publish(tripId, TRIP_STARTED)

  D->>T: complete()
  T->>Pricing: calculateFare(trip)
  Pricing-->>T: fare
  T->>T: state.complete(trip)  note right of T: status -> COMPLETED, endTime=now
  T->>Notif: publish(tripId, TRIP_COMPLETED, fare)
  Notif->>R: onTripEvent(TRIP_COMPLETED)
  Notif->>D: onTripEvent(TRIP_COMPLETED)`,
        },
        {
          type: 'markdown',
          value: '### 3. Cancellation',
        },
        {
          type: 'mermaid',
          caption: 'Cancellation is only valid before IN_PROGRESS, and may incur a fee based on elapsed time.',
          definition: `sequenceDiagram
  participant Actor as Rider or Driver
  participant T as Trip
  participant Pricing as PricingStrategy

  Actor->>T: cancel(actor)
  T->>T: state.cancel(trip, actor)
  alt status in {REQUESTED, DRIVER_ASSIGNED, ARRIVED}
    T->>Pricing: calculateCancellationFee(trip, actor)
    Pricing-->>T: fee (possibly zero)
    T->>T: status -> CANCELLED
  else status == IN_PROGRESS or COMPLETED
    T-->>Actor: IllegalStateException("Cannot cancel now")
  end`,
        },
      ],
    },
    {
      id: 'patterns',
      title: 'Design Patterns Used',
      blocks: [
        {
          type: 'table',
          caption: 'Where each pattern earns its place.',
          headers: ['Pattern', 'Applied to', 'Why'],
          rows: [
            ['State', '`Trip` + `TripState` hierarchy', 'A trip\'s valid operations depend entirely on its current status; each state class enforces its own legal transitions instead of a scattered set of status checks in `Trip`.'],
            ['Strategy', '`MatchingStrategy`, `PricingStrategy`', 'Matching (nearest vs ETA-aware vs rating-weighted) and pricing (flat vs surge vs promo) are independent algorithms that must evolve without touching `RideBookingService` or `Trip`.'],
            ['Observer', '`NotificationService` + `TripObserver`', 'Rider and driver apps need to react to trip events (assigned, arrived, started, completed, cancelled) without `Trip` knowing about push notification providers or app-specific delivery.'],
            ['Facade', '`RideBookingService`', 'Presents one entry point (`requestTrip`, `acceptTrip`, `completeTrip`) over matching, pricing, driver indexing, and trip creation.'],
            ['Factory Method', 'Fare object construction per pricing strategy', 'Different strategies build different `Fare` breakdowns (surge multiplier, promo discount) behind a common `Fare` value object.'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'State vs Strategy in this design',
          body: '`TripState` changes itself automatically as **events happen** to the trip (driver arrives, trip starts). `MatchingStrategy`/`PricingStrategy` are **chosen by the service** and do not self-transition — a great concrete example to contrast the two patterns in an interview.',
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation Sketch',
      blocks: [
        {
          type: 'markdown',
          value: '### Trip as a State-pattern context',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'TripState.java',
          code: `public interface TripState {
  default void accept(Trip trip, Driver driver) { throw new IllegalStateException("Cannot accept now"); }
  default void arrive(Trip trip) { throw new IllegalStateException("Cannot arrive now"); }
  default void start(Trip trip) { throw new IllegalStateException("Cannot start now"); }
  default void complete(Trip trip) { throw new IllegalStateException("Cannot complete now"); }
  default void cancel(Trip trip, Object actor) { throw new IllegalStateException("Cannot cancel now"); }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Trip.java',
          code: `public class Trip {
  private final String id = UUID.randomUUID().toString();
  private final Rider rider;
  private final Location pickup;
  private final Location drop;
  private final VehicleType requestedType;
  private final PricingStrategy pricing;

  private Driver driver;
  private TripStatus status = TripStatus.REQUESTED;
  private TripState state = new RequestedState();
  private Fare fare;
  private Instant startTime;
  private Instant endTime;

  public Trip(Rider rider, Location pickup, Location drop, VehicleType requestedType, PricingStrategy pricing) {
    this.rider = rider;
    this.pickup = pickup;
    this.drop = drop;
    this.requestedType = requestedType;
    this.pricing = pricing;
  }

  public void accept(Driver driver) { state.accept(this, driver); }
  public void arrive() { state.arrive(this); }
  public void start() { state.start(this); }
  public void complete() { state.complete(this); }
  public void cancel(Object actor) { state.cancel(this, actor); }

  void setState(TripState state) { this.state = state; }
  void setStatus(TripStatus status) { this.status = status; }
  void assignDriver(Driver driver) { this.driver = driver; }
  void setStartTime(Instant t) { this.startTime = t; }
  void setEndTime(Instant t) { this.endTime = t; }
  void setFare(Fare fare) { this.fare = fare; }

  public TripStatus getStatus() { return status; }
  public Driver getDriver() { return driver; }
  public Location getPickup() { return pickup; }
  public Location getDrop() { return drop; }
  public PricingStrategy getPricing() { return pricing; }
  public Instant getStartTime() { return startTime; }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'AssignedState.java',
          code: `public class RequestedState implements TripState {
  @Override
  public void accept(Trip trip, Driver driver) {
    driver.setStatus(DriverStatus.ON_TRIP);
    trip.assignDriver(driver);
    trip.setStatus(TripStatus.DRIVER_ASSIGNED);
    trip.setState(new AssignedState());
  }

  @Override
  public void cancel(Trip trip, Object actor) {
    trip.setStatus(TripStatus.CANCELLED);
    trip.setState(new CancelledState());
  }
}

public class AssignedState implements TripState {
  @Override
  public void arrive(Trip trip) {
    trip.setStatus(TripStatus.ARRIVED);
    // stays in an "assigned/arrived" state until start(); status enum carries the nuance
  }

  @Override
  public void start(Trip trip) {
    trip.setStartTime(Instant.now());
    trip.setStatus(TripStatus.IN_PROGRESS);
    trip.setState(new InProgressState());
  }

  @Override
  public void cancel(Trip trip, Object actor) {
    trip.getDriver().setStatus(DriverStatus.AVAILABLE);
    trip.setStatus(TripStatus.CANCELLED);
    trip.setState(new CancelledState());
  }
}

public class InProgressState implements TripState {
  @Override
  public void complete(Trip trip) {
    trip.setEndTime(Instant.now());
    Fare fare = trip.getPricing().calculateFare(trip);
    trip.setFare(fare);
    trip.getDriver().setStatus(DriverStatus.AVAILABLE);
    trip.setStatus(TripStatus.COMPLETED);
    trip.setState(new CompletedState());
  }
  // no accept/arrive/cancel overrides -> defaults throw, which is correct: cannot cancel mid-ride
}`,
        },
        {
          type: 'markdown',
          value: '### Strategy — nearest-driver matching',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'MatchingStrategy.java',
          code: `public interface MatchingStrategy {
  Optional<Driver> findDriver(TripRequest request, List<Driver> candidates);
}

public class NearestDriverMatching implements MatchingStrategy {
  @Override
  public Optional<Driver> findDriver(TripRequest request, List<Driver> candidates) {
    return candidates.stream()
        .filter(d -> d.getStatus() == DriverStatus.AVAILABLE)
        .filter(d -> d.getVehicle().getType() == request.getVehicleType())
        .min(Comparator.comparingDouble(d -> d.getLocation().distanceTo(request.getPickup())));
  }
}

// Alternative, same interface: factor in ETA using road-network distance instead of straight-line,
// or blend distance with driver rating -- swap the implementation, RideBookingService is untouched.
public class RatingWeightedMatching implements MatchingStrategy {
  @Override
  public Optional<Driver> findDriver(TripRequest request, List<Driver> candidates) {
    return candidates.stream()
        .filter(d -> d.getStatus() == DriverStatus.AVAILABLE)
        .filter(d -> d.getVehicle().getType() == request.getVehicleType())
        .min(Comparator.comparingDouble(d ->
            d.getLocation().distanceTo(request.getPickup()) - d.getRating() * 0.1));
  }
}`,
        },
        {
          type: 'markdown',
          value: '### Strategy — surge pricing',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'PricingStrategy.java',
          code: `public interface PricingStrategy {
  Fare calculateFare(Trip trip);
}

public class DistanceTimePricing implements PricingStrategy {
  private static final Money BASE_FARE = Money.of(50);
  private static final Money PER_KM = Money.of(12);
  private static final Money PER_MIN = Money.of(2);

  @Override
  public Fare calculateFare(Trip trip) {
    double km = trip.getPickup().distanceTo(trip.getDrop());
    long minutes = Duration.between(trip.getStartTime(), Instant.now()).toMinutes();
    Money amount = BASE_FARE.plus(PER_KM.multiply(km)).plus(PER_MIN.multiply(minutes));
    return new Fare(amount, /* surgeMultiplier */ 1.0);
  }
}

public class SurgePricing implements PricingStrategy {
  private final PricingStrategy base;
  private final DemandMonitor demandMonitor;

  public SurgePricing(PricingStrategy base, DemandMonitor demandMonitor) {
    this.base = base;
    this.demandMonitor = demandMonitor;
  }

  @Override
  public Fare calculateFare(Trip trip) {
    Fare baseFare = base.calculateFare(trip);
    double multiplier = demandMonitor.currentMultiplier(trip.getPickup()); // e.g. 1.0 - 3.0
    return baseFare.withSurge(multiplier);
  }
}`,
        },
        {
          type: 'markdown',
          value: '### Observer — trip notifications',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'NotificationService.java',
          code: `public interface TripObserver {
  void onTripEvent(TripEvent event);
}

public class NotificationService {
  private final Map<String, List<TripObserver>> subscribers = new HashMap<>();

  public void subscribe(String tripId, TripObserver observer) {
    subscribers.computeIfAbsent(tripId, k -> new ArrayList<>()).add(observer);
  }

  public void publish(String tripId, TripEvent event) {
    subscribers.getOrDefault(tripId, List.of())
        .forEach(observer -> observer.onTripEvent(event));
  }
}

public class RiderAppNotifier implements TripObserver {
  private final Rider rider;
  private final PushClient pushClient;

  public RiderAppNotifier(Rider rider, PushClient pushClient) {
    this.rider = rider;
    this.pushClient = pushClient;
  }

  @Override
  public void onTripEvent(TripEvent event) {
    pushClient.send(rider.getId(), event.describe());
  }
}`,
        },
      ],
    },
    {
      id: 'extensions',
      title: 'Extensions and Follow-ups',
      blocks: [
        {
          type: 'table',
          headers: ['Extension', 'Design change'],
          rows: [
            ['Ride pooling / shared rides', 'A `Trip` gains multiple `Rider` legs with independent pickup/drop and a fare-splitting `PricingStrategy` — the state machine gains a `WAITING_FOR_CO_RIDER` nuance.'],
            ['Scheduled rides', 'Add a `ScheduledTripRequest` that the matching engine picks up at `T-minus-N minutes`; reuses the same `Trip`/`MatchingStrategy` once activated.'],
            ['Multiple candidate offers in parallel', 'Instead of offering one driver at a time, `RideBookingService` broadcasts to top-K candidates and takes the first `accept` — matching becomes "first accept wins" with the others auto-declined.'],
            ['Driver-side trip requests queue', 'A `Driver` could see multiple pending offers; introduce a per-driver offer queue with expiry instead of a single blocking `offer()` call.'],
            ['Promo codes / loyalty pricing', 'Wrap any `PricingStrategy` with a `PromoDiscountPricing` decorator — composition over modifying `DistanceTimePricing` directly (Decorator pairs naturally with Strategy here).'],
            ['At-scale geo lookup (HLD boundary)', 'Swap the in-memory `DriverLocationIndex` for a geospatial index (e.g. geohash/quad-tree service, Redis geo) — the `MatchingStrategy` interface is unaffected, only the candidate-fetch step changes.'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Common pitfall to avoid',
          body: 'Don\'t let `RideBookingService` reach into `Trip`\'s private fields to force a status change. All status transitions must go through `Trip`\'s public methods (`accept`, `start`, `complete`, `cancel`), which delegate to `TripState` — this is what keeps invalid transitions impossible.',
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
              question: 'Walk me through your class design for a cab booking system.',
              answer:
                '`Trip` is the aggregate root and a **State** context (`TripState`: Requested → Assigned → InProgress → Completed/Cancelled). `RideBookingService` is a facade that owns a `MatchingStrategy` (nearest available driver) and a `PricingStrategy` (distance/time + surge), so `Trip` itself has no matching or pricing logic — just status and delegation.',
            },
            {
              question: 'Why model Trip status as a State pattern instead of an enum with a switch statement?',
              answer:
                'With a bare enum, every method (`start`, `cancel`, ...) needs a switch/if-chain checking "is this status allowed to do X", and it is easy to forget a case. Each `TripState` class only implements the transitions valid from that state; illegal calls fall through to a default that throws — invalid transitions become structurally hard to write.',
            },
            {
              question: 'Why is matching a Strategy instead of a method on RideBookingService?',
              answer:
                '"Best driver" can mean nearest, ETA-aware, or rating-weighted, and product will want to A/B test these. `MatchingStrategy` isolates the algorithm behind one method (`findDriver`), independently testable and swappable without touching booking orchestration.',
            },
            {
              question: 'How do you handle a driver rejecting or not responding to a trip offer?',
              answer:
                '`RideBookingService` offers to the top candidate with a timeout; on reject/timeout it re-runs `MatchingStrategy` against the remaining candidates (excluding the one that just declined). The `Trip` stays in `REQUESTED` until some driver actually accepts.',
            },
            {
              question: 'How does surge pricing fit into your PricingStrategy design without duplicating fare logic?',
              answer:
                '`SurgePricing` **wraps** a base `PricingStrategy` (e.g. `DistanceTimePricing`) and multiplies its result by a demand-based factor — composition over inheritance, so the base distance/time math is written once and surge is a decorator-flavored strategy on top.',
            },
            {
              question: 'Why Observer for trip notifications instead of Trip directly calling the rider/driver apps?',
              answer:
                '`Trip`/`TripState` should only know "an event happened" (arrived, started, completed) — not push-notification providers or delivery channels. `NotificationService` fans events out to whichever `TripObserver`s are subscribed, so adding SMS or in-app chat alerts needs no change to trip logic.',
            },
            {
              question: 'How would you prevent a rider or driver from cancelling after the trip has started?',
              answer:
                '`InProgressState` simply does not override `cancel()`, so it falls back to the `TripState` default that throws — cancellation is only reachable from `RequestedState`/`AssignedState`, enforced structurally rather than via an `if (status == IN_PROGRESS) throw` check scattered around.',
            },
            {
              question: 'What is the difference between the "nearest driver" MatchingStrategy and a State pattern — why isn\'t matching a State?',
              answer:
                'State describes how one object\'s **own** behavior changes across its lifecycle (a `Trip` transitioning through statuses). Matching is a **one-shot algorithmic decision** made by the service given a snapshot of candidates — it does not have its own lifecycle or self-transition. That is the Strategy/State distinction in concrete terms.',
            },
            {
              question: 'How would you extend this design to support ride pooling (multiple riders sharing one trip)?',
              answer:
                'Generalize `Trip` to hold a list of `TripLeg`s (one per rider, each with its own pickup/drop and status), and introduce a fare-splitting `PricingStrategy`. The driver-facing state machine (assigned → in progress → completed) stays largely the same; the rider-facing legs get their own sub-states for pickup/drop-off.',
            },
            {
              question: 'How do you keep RideBookingService from becoming a god class?',
              answer:
                'Push algorithmic decisions out into `MatchingStrategy` and `PricingStrategy`, push status logic into `TripState`, and push notification fan-out into `NotificationService`. `RideBookingService` is left as a thin **facade/orchestrator** that wires these together — each collaborator is independently testable.',
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
          body: '1. `Trip` is the aggregate root and a **State** machine (`Requested → Assigned → InProgress → Completed/Cancelled`).\n2. **Strategy** isolates matching (nearest/ETA/rating-weighted) and pricing (distance-time/surge/promo) from the booking flow.\n3. **Observer** decouples trip-status events from how rider/driver apps are notified.\n4. `RideBookingService` stays a thin **facade** — algorithms and state logic live in their own focused classes.\n5. This is deliberately an **in-process LLD**; geo-sharding and distributed matching belong to the HLD version.',
        },
      ],
    },
  ],
};

export default content;
