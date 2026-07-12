import{a as e}from"./chunk-2A5PXBWX.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"Design the software controlling a **bank of elevators** in a building: passengers press hall buttons (up/down) on a floor, or car buttons inside a cabin, and the system must decide which elevator answers each request, in what order, while staying safe (doors, direction, capacity) and efficient (minimizing wait time)."},{type:"callout",variant:"info",title:"Why interviewers ask this",body:"It combines **state machines** (an elevator car is never in two states at once), **request scheduling** (SCAN/LOOK vs naive FCFS), and **multi-instance coordination** (dispatch across several cars) \u2014 three distinct hard sub-problems in one bounded, well-known scenario."},{type:"table",caption:"What a strong answer demonstrates.",headers:["Evaluated skill","What to show"],rows:[["State modeling","A clean `Direction`/`State` enum-driven car that cannot enter invalid transitions"],["Scheduling algorithms",'SCAN/LOOK reasoning: why answering requests "along the way" beats FCFS'],["Design patterns","State (car lifecycle), Strategy (scheduling), Observer (button/display updates)"],["Multi-car dispatch","A controller assigning each hall call to the best car, not just car #1"],["Concurrency","Request queues shared between the controller thread and each car thread must be safe"],["Extensibility","Adding double-deck cars, VIP/express floors, or capacity limits without a rewrite"]]},{type:"callout",variant:"tip",title:"Framing your answer",body:`Open with: *"I will separate three concerns: (1) a single elevator car's state machine, (2) how a car decides the order to serve its own requests \u2014 a scheduling strategy, and (3) how a controller assigns a new hall call to the best of several cars."* This tells the interviewer you already see the layered structure before writing code.`}]},{id:"clarifying-questions",title:"Clarifying Questions",blocks:[{type:"markdown",value:"Elevator design has many hidden knobs. Surface them early."},{type:"table",caption:'Questions to ask, and reasonable assumptions if told "you decide".',headers:["Question","Sample answer / assumption"],rows:[["How many elevators and how many floors?","A bank of N elevators (configurable, e.g. 4) serving floors 1\u2013M (e.g. 1\u201320); design should not hardcode N or M."],["Two button types \u2014 hall calls and car calls?","Yes: **hall call** = floor + direction (UP/DOWN) pressed on a landing; **car call** = destination floor pressed inside a specific car. They are modeled as distinct request types."],["Is this destination-dispatch (pick your floor before boarding) or classic up/down hall buttons?","Classic hall buttons (up/down) for the core design \u2014 mention destination-dispatch as a follow-up/extension since it changes hall-call semantics significantly."],["How does the controller pick which car answers a hall call?",'A scoring function per idle/moving-compatible car \u2014 typically "which car can reach this floor soonest without reversing" \u2014 pluggable behind a Strategy.'],["Do we model door timing, capacity limits, or weight sensors?",'Model door state (`OPEN`/`CLOSED`) and a fixed dwell time; treat capacity/weight as a boolean "car full" flag that a hall call must skip. Skip physical weight-sensor detail.'],["Is this single-process control software, or must it survive a crash/restart?","Single-process in-memory for the LLD round; note that production controllers persist pending requests and recover car position from sensors on restart."],["Should any elevator be reserved (e.g. service/fire elevator)?","Out of core scope; mention it as an extension \u2014 a car flagged `SERVICE_ONLY` that the normal dispatcher skips."],["What about concurrent requests arriving while a car is mid-decision?",`Each car's request set is a thread-safe queue/sorted-set guarded by a lock; the controller's "assign hall call" step is also synchronized so two hall calls cannot be double-assigned or lost.`]]}]},{id:"requirements",title:"Requirements",blocks:[{type:"markdown",value:"### Functional requirements"},{type:"table",headers:["#","Requirement"],rows:[["F1","A passenger can press a hall button (floor + direction) from any landing"],["F2","A passenger inside a car can press a car button (destination floor)"],["F3","The controller assigns each hall call to exactly one elevator car"],["F4","Each car serves its pending requests in an efficient order (not necessarily arrival order)"],["F5","A car opens its doors at a floor when it has a pending stop there, then closes after a dwell time"],["F6","The system reports each car's current floor, direction, and door state (for displays)"],["F7","A car reverses direction only when it has no further requests ahead in its current direction"],["F8","Support marking a car out-of-service (maintenance) so the controller stops assigning it new hall calls"]]},{type:"markdown",value:"### Non-functional requirements"},{type:"table",headers:["#","Requirement"],rows:[["N1","Thread safety \u2014 concurrent button presses must never be lost or double-counted"],["N2","Fairness/efficiency \u2014 average wait time should beat naive first-come-first-served across floors"],["N3","Extensibility \u2014 new dispatch/scheduling strategies pluggable without touching the car state machine"],["N4","Consistency \u2014 a car is in exactly one `State` at any instant; no illegal transitions (e.g. moving with doors open)"],["N5","Responsiveness \u2014 deciding which car answers a hall call should be O(number of cars), not O(all historical requests)"]]},{type:"callout",variant:"warning",title:"Out of scope (state this explicitly)",body:"Physical safety systems (emergency brake, overload sensors), destination-dispatch kiosks, and cross-building elevator groups are out of scope for the core design \u2014 mention briefly as extensions."}]},{id:"entities",title:"Core Entities",blocks:[{type:"markdown",value:"Separate the **single-car** concerns (state machine, its own request queue) from the **multi-car** concern (which car gets a new hall call)."},{type:"table",caption:"Core classes and their responsibilities.",headers:["Entity","Responsibility"],rows:[["`ElevatorController`","Owns all `ElevatorCar`s; receives hall calls; dispatches each to the best car via a `DispatchStrategy`"],["`ElevatorCar`","One physical cabin: current floor, `Direction`, `ElevatorState`, `Door`, and its own pending-stops set"],["`Door`","Simple state holder: `OPEN` / `CLOSED`, with `open()`/`close()`"],["`ElevatorState`","Enum: `IDLE`, `MOVING_UP`, `MOVING_DOWN`, `DOOR_OPEN` (car-level state machine)"],["`Direction`","Enum: `UP`, `DOWN`, `NONE` (car's current or requested travel direction)"],["`Request`","Abstract base for a pending stop; subclasses `HallRequest` (floor + direction) and `CarRequest` (destination floor)"],["`SchedulingStrategy`","Interface: given a car's current state + pending requests, what is the next floor to serve? (SCAN/LOOK vs FCFS)"],["`DispatchStrategy`","Interface: given a new hall call + all cars, which car should take it?"],["`Display` / `ElevatorListener`","Observer notified on floor/direction/door changes to update panels"]]},{type:"table",caption:"Request types.",headers:["Request type","Origin","Fields"],rows:[["`HallRequest`","Landing button (outside any car)","floor, direction (UP/DOWN)"],["`CarRequest`","Cabin button (inside a specific car)","destinationFloor"]]},{type:"callout",variant:"tip",title:"Why split HallRequest and CarRequest",body:"A hall call has a **direction** but no fixed car yet \u2014 the controller must choose one. A car call has no direction choice (the car is already committed) but is always bound to one specific car. Keeping them as distinct types (sharing a common `Request` supertype for queue storage) avoids overloading one class with optional/nullable fields."}]},{id:"class-design",title:"Class Diagram",blocks:[{type:"mermaid",caption:"Core class relationships for the elevator system.",definition:`classDiagram
  class ElevatorController {
    -cars: List~ElevatorCar~
    -dispatchStrategy: DispatchStrategy
    +submitHallRequest(floor, direction) void
    +submitCarRequest(carId, floor) void
    +step() void
  }
  class ElevatorCar {
    -id: String
    -currentFloor: int
    -direction: Direction
    -state: ElevatorState
    -door: Door
    -upStops: TreeSet~Integer~
    -downStops: TreeSet~Integer~
    -arrivalOrder: Queue~Integer~
    -schedulingStrategy: SchedulingStrategy
    +addStop(floor) void
    +addHallStop(floor, direction) void
    +step() void
    +nextStopFloor() Integer
  }
  class Door {
    -isOpen: boolean
    +open() void
    +close() void
  }
  class ElevatorState {
    <<enumeration>>
    IDLE
    MOVING_UP
    MOVING_DOWN
    DOOR_OPEN
  }
  class Direction {
    <<enumeration>>
    UP
    DOWN
    NONE
  }
  class Request {
    <<abstract>>
    +floor: int
  }
  class HallRequest {
    +direction: Direction
  }
  class CarRequest
  class SchedulingStrategy {
    <<interface>>
    +nextStop(car) Integer
  }
  class LookSchedulingStrategy
  class FcfsSchedulingStrategy
  class DispatchStrategy {
    <<interface>>
    +selectCar(cars, hallRequest) ElevatorCar
  }
  class NearestCarDispatchStrategy

  ElevatorController "1" *-- "many" ElevatorCar
  ElevatorController --> DispatchStrategy
  ElevatorCar --> Door
  ElevatorCar --> ElevatorState
  ElevatorCar --> Direction
  ElevatorCar --> SchedulingStrategy
  ElevatorController ..> HallRequest : dispatch input
  ElevatorController ..> CarRequest : dispatch input
  Request <|-- HallRequest
  Request <|-- CarRequest
  SchedulingStrategy <|.. LookSchedulingStrategy
  SchedulingStrategy <|.. FcfsSchedulingStrategy
  DispatchStrategy <|.. NearestCarDispatchStrategy`}]},{id:"flows",title:"Key Flows",blocks:[{type:"markdown",value:"### Flow 1 \u2014 External hall call and multi-elevator dispatch"},{type:"mermaid",caption:'A passenger presses "UP" on floor 5; the controller picks the best car.',definition:`sequenceDiagram
  participant P as Passenger
  participant HB as HallButton (floor 5, UP)
  participant EC as ElevatorController
  participant DS as DispatchStrategy
  participant Car1 as ElevatorCar #1
  participant Car2 as ElevatorCar #2

  P->>HB: Press UP
  HB->>EC: submitHallRequest(floor=5, UP)
  EC->>EC: lock (per-controller dispatch lock)
  EC->>DS: selectCar(cars, request)
  DS->>Car1: currentFloor, direction, pendingStops
  DS->>Car2: currentFloor, direction, pendingStops
  DS-->>EC: Car1 (best ETA, moving UP, floor 2)
  EC->>Car1: addStop(5, UP)
  EC->>EC: unlock
  Car1->>Car1: pendingStops.add(5)
  Note over Car1: On future step(), stops at 5,\\nopens doors, then continues UP`},{type:"markdown",value:"### Flow 2 \u2014 Internal car call and per-car scheduling"},{type:"mermaid",caption:"Inside Car #1, a passenger presses floor 9; SCAN/LOOK decides serve order.",definition:`sequenceDiagram
  participant P as Passenger (inside Car 1)
  participant CB as CarButton (floor 9)
  participant Car1 as ElevatorCar #1
  participant SS as SchedulingStrategy (LOOK)

  P->>CB: Press 9
  CB->>Car1: addStop(9)
  Car1->>Car1: pendingStops.add(9)
  loop each controller tick
    Car1->>SS: nextStop(this)
    SS->>SS: pick closest pending stop in current\\ndirection; else reverse if none remain ahead
    SS-->>Car1: floor N
    alt currentFloor == N
      Car1->>Car1: state = DOOR_OPEN, door.open()
      Car1->>Car1: dwell, door.close(), pendingStops.remove(N)
    else
      Car1->>Car1: move one floor toward N, state = MOVING_UP/DOWN
    end
  end`},{type:"callout",variant:"info",title:"Why LOOK beats naive FCFS",body:"First-come-first-served would send the car to floor 9 immediately even if it passes floor 5 (another pending stop) on the way, then have to come back. **LOOK** always continues in the current direction, picking up every pending stop it passes, and only reverses when nothing remains ahead \u2014 fewer direction changes, lower average wait time. This is the same family of algorithm as disk-scheduling LOOK/SCAN."}]},{id:"patterns",title:"Design Patterns",blocks:[{type:"table",caption:"Where each pattern earns its place \u2014 and why.",headers:["Pattern","Applied to","Why it fits"],rows:[["State","`ElevatorState` (`IDLE`, `MOVING_UP`, `MOVING_DOWN`, `DOOR_OPEN`) driving `ElevatorCar.step()`","The car's legal next actions depend entirely on its current state \u2014 doors cannot open while moving, direction cannot flip while doors are open. Encoding this as explicit states (rather than boolean flags) prevents illegal combinations"],["Strategy","`SchedulingStrategy` (per-car serve order: LOOK/SCAN vs FCFS)",'The "what floor do I go to next" policy is independent of the state machine mechanics and is the natural axis of comparison in interviews'],["Strategy","`DispatchStrategy` (which car answers a new hall call: nearest-car, least-busy, zone-based)","Multi-car assignment policy changes independently of both the state machine and the per-car scheduler \u2014 keep it swappable"],["Observer","`ElevatorCar` notifies `Display`/`ElevatorListener`s on floor, direction, or door changes","Multiple UIs (hall panel, cabin display, monitoring dashboard) all react to the same events without `ElevatorCar` knowing about any of them"],["Command (extension)","Wrapping each button press as a `Request` object queued for later execution",'Decouples "a button was pressed" from "when/how it gets serviced" \u2014 useful for logging, undo (cancel a call), or replay/testing'],["Singleton (optional)","`ElevatorController` as the one process-wide coordinator for a bank of cars","One controller per building/bank avoids split-brain dispatch decisions; prefer a DI-scoped singleton over a static instance for testability"]]},{type:"callout",variant:"tip",title:"State vs Strategy, side by side",body:'**State** answers *"what can I legally do right now?"* (mechanical, safety-critical). **Strategy** answers *"given that I can move, where should I go next?"* (a policy/optimization choice). Keeping them as separate collaborators \u2014 `ElevatorCar` holds an `ElevatorState` and delegates "next floor" to a `SchedulingStrategy` \u2014 means you can A/B test scheduling algorithms without ever touching the safety-critical state transitions.'}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"### Enums and requests"},{type:"code",language:"java",filename:"Direction.java",code:`public enum Direction {
  UP, DOWN, NONE
}

public enum ElevatorState {
  IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN
}`},{type:"code",language:"java",filename:"Request.java",code:`public abstract class Request {
  private final int floor;

  protected Request(int floor) {
    this.floor = floor;
  }

  public int getFloor() { return floor; }
}

public final class HallRequest extends Request {
  private final Direction direction;

  public HallRequest(int floor, Direction direction) {
    super(floor);
    this.direction = direction;
  }

  public Direction getDirection() { return direction; }
}

public final class CarRequest extends Request {
  public CarRequest(int destinationFloor) {
    super(destinationFloor);
  }
}`},{type:"markdown",value:"### `Door` and the `ElevatorCar` state machine"},{type:"code",language:"java",filename:"Door.java",code:`public final class Door {
  private volatile boolean open;

  public void open() { this.open = true; }
  public void close() { this.open = false; }
  public boolean isOpen() { return open; }
}`},{type:"code",language:"java",filename:"ElevatorCar.java",code:`public final class ElevatorCar {
  private final String id;
  private final int lowestFloor;
  private final int highestFloor;
  private final Door door = new Door();
  private final NavigableSet<Integer> upStops = new ConcurrentSkipListSet<>();
  private final NavigableSet<Integer> downStops = new ConcurrentSkipListSet<>();
  private final Queue<Integer> arrivalOrder = new ConcurrentLinkedQueue<>();
  private final SchedulingStrategy schedulingStrategy;
  private final List<ElevatorListener> listeners = new CopyOnWriteArrayList<>();

  private volatile int currentFloor;
  private volatile Direction direction = Direction.NONE;
  private volatile ElevatorState state = ElevatorState.IDLE;
  private volatile boolean outOfService = false;
  private int doorOpenTicksRemaining = 0;

  public ElevatorCar(String id, int lowestFloor, int highestFloor, SchedulingStrategy schedulingStrategy) {
    this.id = id;
    this.lowestFloor = lowestFloor;
    this.highestFloor = highestFloor;
    this.currentFloor = lowestFloor;
    this.schedulingStrategy = schedulingStrategy;
  }

  /** Car destination button \u2014 no hall direction; infer travel side from current floor. */
  public synchronized void addStop(int floor) {
    if (floor < lowestFloor || floor > highestFloor) {
      throw new IllegalArgumentException("Floor out of range: " + floor);
    }
    if (floor > currentFloor) { if (upStops.add(floor)) arrivalOrder.offer(floor); }
    else if (floor < currentFloor) { if (downStops.add(floor)) arrivalOrder.offer(floor); }
    // floor == currentFloor: open doors on next step via scheduling
    else { if (upStops.add(floor)) arrivalOrder.offer(floor); }
    if (state == ElevatorState.IDLE) {
      direction = floor > currentFloor ? Direction.UP : floor < currentFloor ? Direction.DOWN : Direction.NONE;
    }
  }

  /** Hall call \u2014 preserve requested travel direction so LOOK does not serve the wrong way. */
  public synchronized void addHallStop(int floor, Direction hallDirection) {
    if (floor < lowestFloor || floor > highestFloor) {
      throw new IllegalArgumentException("Floor out of range: " + floor);
    }
    if (hallDirection == Direction.UP) { if (upStops.add(floor)) arrivalOrder.offer(floor); }
    else if (hallDirection == Direction.DOWN) { if (downStops.add(floor)) arrivalOrder.offer(floor); }
    else throw new IllegalArgumentException("Hall call must be UP or DOWN");
    if (state == ElevatorState.IDLE) {
      direction = floor > currentFloor ? Direction.UP : floor < currentFloor ? Direction.DOWN : hallDirection;
    }
  }

  /** Advances the car by one simulation tick. Called by the controller's scheduler loop. */
  public synchronized void step() {
    if (outOfService) {
      return;
    }
    switch (state) {
      case DOOR_OPEN -> handleDoorOpenTick();
      case IDLE, MOVING_UP, MOVING_DOWN -> moveTowardNextStop();
    }
  }

  private void handleDoorOpenTick() {
    doorOpenTicksRemaining--;
    if (doorOpenTicksRemaining <= 0) {
      door.close();
      state = hasPendingStops() ? (direction == Direction.UP ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN) : ElevatorState.IDLE;
      notifyListeners();
    }
  }

  private void moveTowardNextStop() {
    Integer target = schedulingStrategy.nextStop(this);
    if (target == null) {
      state = ElevatorState.IDLE;
      direction = Direction.NONE;
      notifyListeners();
      return;
    }
    if (target == currentFloor) {
      arriveAndOpenDoors(target);
      return;
    }
    currentFloor += target > currentFloor ? 1 : -1;
    direction = target > currentFloor ? Direction.UP : Direction.DOWN;
    state = direction == Direction.UP ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN;
    notifyListeners();
  }

  private void arriveAndOpenDoors(int floor) {
    upStops.remove(floor);
    downStops.remove(floor);
    arrivalOrder.remove(floor);
    door.open();
    state = ElevatorState.DOOR_OPEN;
    doorOpenTicksRemaining = 3; // fixed dwell time, in simulation ticks
    notifyListeners();
  }

  private boolean hasPendingStops() {
    return !upStops.isEmpty() || !downStops.isEmpty();
  }

  public Integer peekOldestPendingStop() {
    while (!arrivalOrder.isEmpty()) {
      Integer floor = arrivalOrder.peek();
      if (upStops.contains(floor) || downStops.contains(floor)) return floor;
      arrivalOrder.poll(); // stale entry after cancel / already served
    }
    return null;
  }

  public NavigableSet<Integer> upStopsView() { return upStops; }
  public NavigableSet<Integer> downStopsView() { return downStops; }
  /** Union view for FCFS / diagnostics \u2014 prefer upStopsView/downStopsView for LOOK. */
  public NavigableSet<Integer> pendingStopsView() {
    NavigableSet<Integer> all = new TreeSet<>();
    all.addAll(upStops);
    all.addAll(downStops);
    return all;
  }
  public int getCurrentFloor() { return currentFloor; }
  public Direction getDirection() { return direction; }
  public ElevatorState getState() { return state; }
  public boolean isOutOfService() { return outOfService; }
  public void setOutOfService(boolean value) { this.outOfService = value; }
  public String getId() { return id; }
  public void addListener(ElevatorListener l) { listeners.add(l); }
  private void notifyListeners() { listeners.forEach(l -> l.onCarChanged(this)); }
}`},{type:"markdown",value:"### Scheduling strategy (LOOK) \u2014 decides the next stop for one car"},{type:"code",language:"java",filename:"LookSchedulingStrategy.java",code:`public interface SchedulingStrategy {
  /** Returns the next floor this car should head to/stop at, or null if idle with no work. */
  Integer nextStop(ElevatorCar car);
}

public final class LookSchedulingStrategy implements SchedulingStrategy {
  @Override
  public Integer nextStop(ElevatorCar car) {
    int current = car.getCurrentFloor();
    NavigableSet<Integer> up = car.upStopsView();
    NavigableSet<Integer> down = car.downStopsView();
    if (up.isEmpty() && down.isEmpty()) {
      return null;
    }
    if (car.getDirection() == Direction.UP) {
      Integer above = up.ceiling(current);
      if (above != null) return above;
      // nothing further UP: reverse and serve DOWN requests
      return down.isEmpty() ? null : down.floor(current) != null ? down.floor(current) : down.first();
    }
    if (car.getDirection() == Direction.DOWN) {
      Integer below = down.floor(current);
      if (below != null) return below;
      return up.isEmpty() ? null : up.ceiling(current) != null ? up.ceiling(current) : up.last();
    }
    // Idle: nearest pending stop on either side
    NavigableSet<Integer> all = car.pendingStopsView();
    Integer above = all.ceiling(current);
    Integer below = all.floor(current);
    if (above == null) return below;
    if (below == null) return above;
    return (above - current) <= (current - below) ? above : below;
  }
}

/** FCFS needs an arrival-ordered queue on the car \u2014 see ElevatorCar.arrivalOrder. */
public final class FcfsSchedulingStrategy implements SchedulingStrategy {
  @Override
  public Integer nextStop(ElevatorCar car) {
    return car.peekOldestPendingStop(); // null if no pending work
  }
}`},{type:"markdown",value:"### Dispatch strategy and the controller (multi-car coordination)"},{type:"code",language:"java",filename:"NearestCarDispatchStrategy.java",code:`public interface DispatchStrategy {
  ElevatorCar selectCar(List<ElevatorCar> cars, HallRequest request);
}

public final class NearestCarDispatchStrategy implements DispatchStrategy {
  @Override
  public ElevatorCar selectCar(List<ElevatorCar> cars, HallRequest request) {
    return cars.stream()
        .filter(c -> !c.isOutOfService())
        .filter(c -> canServeWithoutReversing(c, request))
        .min(Comparator.comparingInt(c -> estimatedTicksToReach(c, request.getFloor())))
        .orElseGet(() -> cars.stream()
            .filter(c -> !c.isOutOfService())
            .min(Comparator.comparingInt(c -> estimatedTicksToReach(c, request.getFloor())))
            .orElseThrow(() -> new NoAvailableCarException("All cars out of service")));
  }

  /** A moving car can pick up this hall call en route only if the call is ahead, same direction. */
  private boolean canServeWithoutReversing(ElevatorCar car, HallRequest request) {
    if (car.getDirection() == Direction.NONE) {
      return true; // idle car can always accept
    }
    boolean sameDirection = car.getDirection() == Direction.UP
        ? request.getDirection() == Direction.UP
        : request.getDirection() == Direction.DOWN;
    boolean isAhead = car.getDirection() == Direction.UP
        ? request.getFloor() >= car.getCurrentFloor()
        : request.getFloor() <= car.getCurrentFloor();
    return sameDirection && isAhead;
  }

  private int estimatedTicksToReach(ElevatorCar car, int floor) {
    return Math.abs(car.getCurrentFloor() - floor);
  }
}`},{type:"code",language:"java",filename:"ElevatorController.java",code:`public final class ElevatorController {
  private final List<ElevatorCar> cars;
  private final DispatchStrategy dispatchStrategy;
  private final Object dispatchLock = new Object();

  public ElevatorController(List<ElevatorCar> cars, DispatchStrategy dispatchStrategy) {
    this.cars = cars;
    this.dispatchStrategy = dispatchStrategy;
  }

  /** Called when a passenger presses a hall button on some floor. */
  public void submitHallRequest(int floor, Direction direction) {
    HallRequest request = new HallRequest(floor, direction);
    synchronized (dispatchLock) {
      ElevatorCar chosen = dispatchStrategy.selectCar(cars, request);
      chosen.addHallStop(floor, direction);
    }
  }

  /** Called when a passenger inside a specific car presses a destination button. */
  public void submitCarRequest(String carId, int destinationFloor) {
    ElevatorCar car = cars.stream()
        .filter(c -> c.getId().equals(carId))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("Unknown car: " + carId));
    car.addStop(destinationFloor);
  }

  /** Advances every car by one simulation tick; call this from a fixed-rate scheduler. */
  public void step() {
    for (ElevatorCar car : cars) {
      car.step();
    }
  }
}`},{type:"callout",variant:"warning",title:"Thread safety: request queues and dispatch",body:'Two things need protection: (1) `ElevatorCar.pendingStops` is a `ConcurrentSkipListSet` so `addStop` (writer, from any thread) and `nextStop` (reader, from the scheduler thread) never corrupt each other; (2) hall-call **dispatch** is wrapped in `dispatchLock` because "pick the best car" (read all cars) and "commit the stop to that car" (write) must be atomic \u2014 otherwise two near-simultaneous hall calls could both read the same idle car as "best" before either commits, double-assigning it. `synchronized` methods on `ElevatorCar` similarly guard its own state transitions in `step()`/`addStop()` against concurrent access from the controller and a UI/testing thread.'}]},{id:"extensions",title:"Extensions & Follow-ups",blocks:[{type:"markdown",value:"Common follow-ups after the core design \u2014 have structured answers ready:"},{type:"table",headers:["Follow-up","Approach"],rows:[["Destination-dispatch (choose floor before boarding, like modern office towers)","Replace `HallRequest(floor, direction)` with `HallRequest(floor, destinationFloor)`; the `DispatchStrategy` now knows the full trip and can group passengers heading to similar floors into the same car \u2014 better throughput, same interfaces."],["Express/zone elevators (only stop on floors 1, 20\u201330)","Add an `allowedFloors: Set<Integer>` (or zone) to `ElevatorCar`; `DispatchStrategy` filters candidate cars by whether the requested floor is in their zone before scoring."],["Capacity/weight limits","Add a `currentLoad`/`maxCapacity` to `ElevatorCar`; `canServeWithoutReversing`-style filtering in `DispatchStrategy` also excludes full cars; a full car simply cannot accept new hall calls until it unloads."],['Peak-hour "lobby priority" scheduling (morning up-peak)',"Swap in a time-aware `DispatchStrategy` that biases idle cars to park near the lobby, or a `SchedulingStrategy` that favors picking up ground-floor UP calls first \u2014 no change to `ElevatorCar`."],["Fault tolerance: a car breaks down mid-trip","`setOutOfService(true)` immediately excludes it from `DispatchStrategy` selection; reassign its still-pending stops to other cars via the same `submitHallRequest`/`submitCarRequest` paths, and surface an alert."],["Very tall buildings \u2014 50+ floors, double-deck cars","Split into low-rise/high-rise zones each with their own `ElevatorController` (sharding by floor range); double-deck cars become two coupled `ElevatorCar` instances that always move together \u2014 a good discussion of composition over a single monolithic car model."],["Persisting state across a controller restart","Persist pending requests (hall + car) to a durable queue/DB and recover each car's `currentFloor` from a physical position sensor on boot, replaying unfinished requests into fresh in-memory queues."],["Testing the scheduling algorithm","Extract `SchedulingStrategy`/`DispatchStrategy` as pure functions over `(state, requests) -> decision`; unit test them directly against synthetic car states without spinning up threads or timers."]]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Walk through your elevator car's state machine \u2014 what states exist and what triggers each transition?",answer:"Four states: `IDLE` (no pending stops), `MOVING_UP`/`MOVING_DOWN` (heading toward the next scheduled stop), and `DOOR_OPEN` (stopped, dwelling). `IDLE` \u2192 `MOVING_*` when a stop is added; `MOVING_*` \u2192 `DOOR_OPEN` when `currentFloor` equals the scheduling strategy's chosen stop; `DOOR_OPEN` \u2192 `IDLE` or `MOVING_*` after the dwell timer expires, depending on whether more stops remain. Crucially, `addStop()` can never directly flip the door or force reverse mid-transit \u2014 only `step()` drives transitions, keeping the machine deterministic."},{question:"Why is LOOK better than pure FCFS, and are there cases FCFS still wins?",answer:'LOOK serves every pending stop it passes while continuing in one direction, minimizing direction reversals and average wait time under normal load. FCFS can "win" only in a fairness sense \u2014 the very first requester is guaranteed to be served first, which some safety-critical or SLA-bound systems might prefer over strict throughput optimization. In practice almost all real elevators use a SCAN/LOOK variant.'},{question:"How does the controller decide which of several cars answers a new hall call?",answer:"Score each in-service car by estimated ticks/time to reach the requested floor, but first filter out cars that would have to reverse direction to serve it (a car moving up on floor 2 should not be picked for a same-direction call the car has already passed). Pick the minimum-cost car among eligible ones; fall back to nearest-any-car if none qualify without reversing."},{question:"Where exactly could two hall-call requests interfere with each other, and how do you prevent it?",answer:'"Select best car" (read all cars\' state) and "commit the stop to that car" (write) must be atomic, or two near-simultaneous requests could both read the same idle car as best before either commits \u2014 double-assigning that car and starving another. Wrapping `selectCar` + `addStop` in one `synchronized(dispatchLock)` block in the controller closes that gap.'},{question:"Why model HallRequest and CarRequest as separate types instead of one Request class with nullable direction?",answer:"A hall call always has a direction (UP/DOWN) but no car yet; a car call always has a car but no direction choice (already committed). Separate subclasses of a common `Request` avoid nullable fields and let each type carry only meaningful data \u2014 cleaner than one bag-of-optional-fields class, and it is easy to add a third request type (e.g. a maintenance recall) later."},{question:"How would you unit test the scheduling and dispatch logic without spinning up real threads or timers?",answer:"Keep `SchedulingStrategy.nextStop(car)` and `DispatchStrategy.selectCar(cars, request)` as pure functions over the current observable state (floor, direction, pending stops) \u2014 no internal timers or side effects. Construct `ElevatorCar` instances in specific states/queues directly and assert on the returned floor/car, entirely decoupled from the `step()` simulation loop."},{question:"What is the difference between State and Strategy in this design, and could you have used just one?",answer:'State (`ElevatorState`) governs what is mechanically legal right now (can\'t open doors while moving). Strategy (`SchedulingStrategy`, `DispatchStrategy`) governs a policy choice among legal options (which legal next floor is "best"). You could technically fold scheduling logic into the state machine, but that couples safety-critical transitions to a frequently-changing optimization policy \u2014 separating them lets you swap LOOK for a smarter ML-based scheduler without touching state-transition code.'},{question:"How do you handle a car that needs to go out of service mid-shift?",answer:"`setOutOfService(true)` immediately removes it from `DispatchStrategy` candidate lists for new hall calls, but its currently pending stops should still be honored (passengers already inside deserve to be dropped off) \u2014 then the controller reassigns any *not-yet-picked-up* hall calls originally routed to it to other cars."},{question:"How would this design change for destination-dispatch elevators (choose your floor from a lobby kiosk)?",answer:"The hall request gains a destination floor upfront, so the controller can group multiple passengers heading to nearby floors into the same car before boarding \u2014 turning dispatch into a bin-packing-like optimization rather than a simple nearest-car lookup. The car-level state machine and `SchedulingStrategy` stay largely the same; only `HallRequest`'s shape and `DispatchStrategy`'s scoring function change, which is a good sign the abstraction boundaries were drawn correctly."},{question:"SCAN vs LOOK difference?",answer:"**SCAN** travels to the end of the shaft (top/bottom) before reversing, even with no pending stop there. **LOOK** reverses at the **last pending request** in the current direction \u2014 less wasted travel. Real elevators almost always use LOOK (or a variant), not pure SCAN."},{question:"Fire/service mode?",answer:"**Fire/emergency mode** recalls cars to a designated floor, ignores normal hall calls, and often restricts control to firefighter key switches. **Service/independent mode** takes a car out of group dispatch for maintenance or VIP use \u2014 `DispatchStrategy` must exclude it while the car still honors its own car calls safely."},{question:"Hall-call dedup when button pressed twice?",answer:"Treat `(floor, direction)` as a unique pending hall call: a second press is a **no-op** if that call is already queued or assigned. Use a set/map in the controller so duplicate button events do not double-assign cars or inflate stop lists."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:"1. Separate three layers: a car's **State** machine (legal transitions), a car's **SchedulingStrategy** (serve order, e.g. LOOK), and the controller's **DispatchStrategy** (which car gets a new hall call).\n2. **LOOK/SCAN** beats naive FCFS by serving every pending stop passed along the current direction, minimizing reversals.\n3. Model **HallRequest** and **CarRequest** as distinct types \u2014 direction belongs to hall calls, not car calls.\n4. Protect the **dispatch decision** (read-all-cars, then write-one-car) with a single lock to prevent double-assignment; protect each car's own request set with a concurrent collection.\n5. Keep `SchedulingStrategy`/`DispatchStrategy` as pure functions over observable state \u2014 it makes them trivially unit-testable and swappable for extensions (zones, capacity, destination-dispatch)."}]}]},r=t;export{r as default};
