import { DesignContent } from '../../../shared/models';
import { SNAKE_AND_LADDER_META } from './snake-and-ladder.meta';

/**
 * Design Snake and Ladder — full LLD walkthrough: entities, class design,
 * turn flow, dice-as-strategy, and interview Q&A.
 */
const content: DesignContent = {
  meta: SNAKE_AND_LADDER_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Snake and Ladder** is a favorite "easy-to-medium" Low-Level Design warm-up. The rules are simple, so the interview is really about **clean modeling**: representing snakes/ladders as a fast jump lookup, keeping the **dice swappable** (fair vs. loaded — a classic twist), and writing a turn loop that is easy to extend (more players, more dice, custom board sizes).',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'What interviewers are really testing',
          body: 'Whether you (1) avoid hard-coding snake/ladder positions into the game loop, (2) make the **dice** an interchangeable component rather than a hard-coded `random.nextInt(6)` call, and (3) handle edge cases — overshoot past the last cell, landing exactly on a snake head, chained snake-into-ladder positions — deliberately rather than by accident.',
        },
        {
          type: 'table',
          caption: 'Snake and Ladder LLD at a glance.',
          headers: ['Aspect', 'Decision'],
          rows: [
            ['Board representation', 'Linear sequence of cells 1..N (default 100), not a 2D grid'],
            ['Snakes/ladders lookup', 'A single `Map<Integer, Integer> jumpMap` merges both — O(1) lookup per landing cell'],
            ['Dice', '`Dice` interface with `FairDice` and `LoadedDice` implementations (Strategy pattern)'],
            ['Turn management', '`Game` cycles through a queue/list of `Player`s'],
            ['Overshoot rule', 'If `position + roll > boardSize`, the move is skipped (configurable)'],
            ['Win condition', 'First player to land exactly on the final cell wins'],
          ],
        },
      ],
    },
    {
      id: 'clarifying-questions',
      title: 'Clarifying Questions',
      blocks: [
        {
          type: 'markdown',
          value:
            'Even a "simple" board game has rule variants. A few quick questions prevent building the wrong thing.',
        },
        {
          type: 'bestPractices',
          title: 'Questions worth asking',
          practices: [
            '**What is the board size?** Standard is 100 cells (10x10), but should the design support arbitrary sizes?',
            '**How many players, and is 2 a hard minimum or could it be 1 (vs. computer) or more than 4?**',
            '**Single die or multiple dice?** Does a 6 grant an extra roll (a common house rule)?',
            '**What happens on overshoot** — e.g., player at 98 rolls a 5 (98+5=103 > 100)? Skip the turn, or move to 100 and bounce back?',
            '**Can snakes/ladders chain** (landing on a ladder top that is itself a snake head)? Usually no — apply at most one jump per turn.',
            '**Is this single in-memory game, or do we need to support many concurrent games** (e.g., a server hosting multiple rooms)?',
            '**Do we need a "loaded dice" or cheat-detection twist**, or is fair dice enough?',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Suggested scope for a 30\u201345 minute round',
          body: 'Agree on: a configurable board size (default 100), 2+ players, a single fair die by default with the design **open to a loaded/weighted die**, overshoot = skip turn, and no chaining of jumps. Mention multi-dice and concurrent-games support as extensions.',
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
            ['FR1', 'Initialize a board of configurable size with a set of non-overlapping snakes and ladders'],
            ['FR2', 'Support 2 or more players, each tracked by their current cell position'],
            ['FR3', 'On a player\u2019s turn, roll the dice and advance their position by the rolled value'],
            ['FR4', 'If the new position has a snake head, move the player down to the snake\u2019s tail'],
            ['FR5', 'If the new position has a ladder bottom, move the player up to the ladder\u2019s top'],
            ['FR6', 'If a move would overshoot the last cell, the player stays in place (forfeits the move)'],
            ['FR7', 'The first player to land exactly on the final cell wins and the game ends'],
            ['FR8', 'Turns rotate among all active players until someone wins'],
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
            ['NFR1', 'Snake/ladder lookup must be O(1) per move, not a linear scan over all snakes and ladders'],
            ['NFR2', 'Dice behavior must be swappable (fair vs. weighted) without changing `Game` or `Board` code'],
            ['NFR3', 'Board configuration should be validated: no snake head/ladder bottom on cell 1 or the last cell, no two entities sharing a start cell, no jump that leads nowhere'],
            ['NFR4', 'The design should support multiple independent, concurrently running games without shared mutable state'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Out of scope (call this out explicitly)',
          body: 'Animated UI/rendering, networked real-time play, matchmaking, and persistence/leaderboards are natural follow-ups but not part of the core domain model — mention them under Extensions instead of designing them live.',
        },
      ],
    },
    {
      id: 'entities',
      title: 'Core Entities',
      blocks: [
        {
          type: 'markdown',
          value: 'Translate the requirements\u2019 nouns into single-responsibility classes.',
        },
        {
          type: 'table',
          headers: ['Entity', 'Responsibility'],
          rows: [
            ['`Cell`', 'A numbered board square (1..N); mostly a value used for indexing, occasionally holds metadata'],
            ['`Snake`', 'Value object: `head` (higher number) and `tail` (lower number) — landing on `head` sends you to `tail`'],
            ['`Ladder`', 'Value object: `bottom` (lower number) and `top` (higher number) — landing on `bottom` sends you to `top`'],
            ['`Board`', 'Owns board `size` and a merged `jumpMap` built from all snakes and ladders; exposes `getDestination(position)`'],
            ['`Dice`', 'Interface: `roll()` returns an int; implementations decide the distribution'],
            ['`FairDice` / `LoadedDice`', 'Concrete strategies — uniform random vs. weighted/rigged outcomes'],
            ['`Player`', 'A participant: `id`, `name`, `currentPosition`'],
            ['`Game`', 'Orchestrator: owns `Board`, `Dice`, the player turn order, and `GameStatus`'],
            ['`GameStatus`', 'Enum: `NOT_STARTED`, `IN_PROGRESS`, `FINISHED`'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Why merge snakes and ladders into one `jumpMap`',
          body: 'At move time you only care about "does this landing cell send me somewhere else, and if so, where?" A single `Map<Integer, Integer>` built once at setup answers that in O(1), whether the effect came from a snake or a ladder. Keep the separate `Snake`/`Ladder` lists around for **setup, validation, and rendering** — but the hot path (every dice roll) should hit the merged map only.',
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
            '`Dice` is the interface you swap (Strategy). `Board` owns configuration plus the derived `jumpMap`. `Game` composes everything and drives the turn loop.',
        },
        {
          type: 'mermaid',
          caption: 'Snake and Ladder domain model.',
          definition: `classDiagram
  class Dice {
    <<interface>>
    +roll() int
  }
  class FairDice {
    -int faces
    +roll() int
  }
  class LoadedDice {
    -int[] weightedFaces
    +roll() int
  }
  Dice <|.. FairDice
  Dice <|.. LoadedDice
  class Snake {
    -int head
    -int tail
  }
  class Ladder {
    -int bottom
    -int top
  }
  class Board {
    -int size
    -List~Snake~ snakes
    -List~Ladder~ ladders
    -Map~Integer,Integer~ jumpMap
    +getDestination(int position) int
    +isFinalCell(int position) boolean
  }
  class Player {
    -String id
    -String name
    -int currentPosition
  }
  class GameStatus {
    <<enumeration>>
    NOT_STARTED
    IN_PROGRESS
    FINISHED
  }
  class Game {
    -Board board
    -Dice dice
    -Deque~Player~ turnQueue
    -GameStatus status
    +start() void
    +playTurn() MoveResult
    +getWinner() Player
  }
  class MoveResult {
    -Player player
    -int diceValue
    -int positionBefore
    -int positionAfter
    -boolean wonGame
  }
  Game "1" *-- "1" Board
  Game "1" *-- "1" Dice
  Game "1" *-- "2..*" Player
  Board "1" *-- "*" Snake
  Board "1" *-- "*" Ladder
  Game ..> MoveResult : produces`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Board is a linear track, not a grid',
          body: 'Even though the physical board is drawn as a 10x10 grid with a boustrophedon (zig-zag) path, the **domain model only needs positions 1..N**. Do not model rows/columns unless the task explicitly requires rendering — it only adds coordinate-conversion complexity with no behavioral benefit.',
        },
      ],
    },
    {
      id: 'flows',
      title: 'Key Flows',
      blocks: [
        {
          type: 'markdown',
          value: '`Game.playTurn()` is the single method that runs one player\u2019s turn: roll \u2192 move \u2192 resolve jump \u2192 check win \u2192 advance turn.',
        },
        {
          type: 'mermaid',
          caption: 'Take-turn flow.',
          definition: `flowchart TD
  A[Current player's turn] --> B[dice.roll()]
  B --> C[tentative = currentPosition + roll]
  C --> D{tentative > boardSize?}
  D -- Yes --> E[Overshoot: stay at currentPosition, forfeit move]
  D -- No --> F[position = tentative]
  F --> G{board.jumpMap contains position?}
  G -- Yes --> H[position = jumpMap.get(position)\n(snake bite or ladder climb)]
  G -- No --> I[No effect]
  H --> J
  I --> J{position == boardSize?}
  J -- Yes --> K[Declare current player winner, status = FINISHED]
  J -- No --> L[Rotate turnQueue to next player]
  E --> L`,
        },
        {
          type: 'markdown',
          value: '### Turn rotation',
        },
        {
          type: 'markdown',
          value:
            'Model the player order as a `Deque<Player>`: pop the front player, let them play, then push them to the back (unless the game just ended). This naturally supports **skipping a turn** (e.g., a house rule for landing on a snake) — simply do not re-enqueue, or enqueue after an extra step, without touching the rest of `Game`.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Edge cases to call out explicitly',
          body: '**Overshoot**: rolling past the last cell — default to forfeiting the move rather than crashing or wrapping. **Landing exactly on a ladder top that is also chained to a snake head elsewhere**: apply at most **one** jump lookup per turn (do not loop the jumpMap lookup) unless the rules explicitly ask for chaining. **Multiple players on the same cell**: allowed — this game has no "send back on collision" rule by default.',
        },
      ],
    },
    {
      id: 'patterns',
      title: 'Design Patterns Applied',
      blocks: [
        {
          type: 'markdown',
          value: 'This LLD is small enough that pattern usage should be deliberate and justified, not decorative.',
        },
        {
          type: 'table',
          caption: 'Where each pattern earns its place.',
          headers: ['Pattern', 'Where', 'Why'],
          rows: [
            ['Strategy', '`Dice` interface with `FairDice` / `LoadedDice`', 'The classic twist question is "what if the dice is loaded/cheats?" — swapping the strategy object answers it without touching `Game`'],
            ['Builder (optional)', '`BoardBuilder` to assemble snakes/ladders with validation before constructing an immutable `Board`', 'Board setup has several invariants to check (no overlaps, no head/tail on boundary cells) — a builder keeps `Board`\u2019s constructor simple and the validation in one place'],
            ['Singleton (optional, debated)', 'A single shared `Game` instance for a single-process, single-game demo', 'Only reach for this if the task is explicitly "one game per process." For anything realistic (a server hosting many games), Singleton is the **wrong** choice — see callout below'],
            ['State (optional)', '`GameStatus` transitions (`NOT_STARTED` \u2192 `IN_PROGRESS` \u2192 `FINISHED`)', 'Keeps status-dependent behavior (e.g., rejecting `playTurn()` after `FINISHED`) explicit rather than scattered `if` checks'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Dice as Strategy — the main interview beat',
          body: '`interface Dice { int roll(); }` with `FairDice` (uniform `1..faces`) and `LoadedDice` (weighted toward specific faces) lets `Game` stay completely unaware of which one it holds. This is the cleanest way to answer "how would you support a rigged/loaded die for a single-player practice mode or a cheat-detection feature?"',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Think twice before reaching for Singleton',
          body: 'A tempting shortcut is `Game.getInstance()`. Resist it: production Snake and Ladder (or any multiplayer game service) needs **many concurrent game instances** — one Singleton would force all players worldwide into one game. Only mention Singleton as "possible, but usually wrong here" — the same caution applies as in general Singleton usage.',
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value: '### Dice as a Strategy',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Dice.java',
          code: `public interface Dice {
  int roll();
}

public class FairDice implements Dice {
  private final int faces;
  private final Random random = new Random();

  public FairDice(int faces) {
    this.faces = faces;
  }

  @Override
  public int roll() {
    return random.nextInt(faces) + 1; // 1..faces, inclusive
  }
}

public class LoadedDice implements Dice {
  private final int[] weightedOutcomes; // e.g. {6, 6, 6, 1, 2, 3} skews toward 6
  private final Random random = new Random();

  public LoadedDice(int[] weightedOutcomes) {
    this.weightedOutcomes = weightedOutcomes;
  }

  @Override
  public int roll() {
    return weightedOutcomes[random.nextInt(weightedOutcomes.length)];
  }
}`,
        },
        {
          type: 'markdown',
          value: '### Snakes, ladders, and the board',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Board.java',
          code: `public record Snake(int head, int tail) {
  public Snake {
    if (tail >= head) throw new IllegalArgumentException("Snake tail must be below its head");
  }
}

public record Ladder(int bottom, int top) {
  public Ladder {
    if (top <= bottom) throw new IllegalArgumentException("Ladder top must be above its bottom");
  }
}

public class Board {
  private final int size;
  private final List<Snake> snakes;
  private final List<Ladder> ladders;
  private final Map<Integer, Integer> jumpMap = new HashMap<>();

  public Board(int size, List<Snake> snakes, List<Ladder> ladders) {
    this.size = size;
    this.snakes = List.copyOf(snakes);
    this.ladders = List.copyOf(ladders);
    validateAndBuildJumpMap();
  }

  private void validateAndBuildJumpMap() {
    for (Snake s : snakes) {
      requireInRange(s.head());
      requireInRange(s.tail());
      requireNoBoundaryEntity(s.head());
      requireUnique(s.head());
      jumpMap.put(s.head(), s.tail());
    }
    for (Ladder l : ladders) {
      requireInRange(l.bottom());
      requireInRange(l.top());
      requireNoBoundaryEntity(l.bottom());
      requireUnique(l.bottom());
      jumpMap.put(l.bottom(), l.top());
    }
  }

  private void requireInRange(int cell) {
    if (cell < 1 || cell > size) throw new IllegalArgumentException("Cell out of range: " + cell);
  }

  private void requireNoBoundaryEntity(int startCell) {
    if (startCell == 1 || startCell == size) {
      throw new IllegalArgumentException("Snake/ladder cannot start on cell 1 or the final cell");
    }
  }

  private void requireUnique(int startCell) {
    if (jumpMap.containsKey(startCell)) {
      throw new IllegalArgumentException("Cell " + startCell + " already has a snake or ladder");
    }
  }

  /** Resolves at most one jump; returns the same position if no snake/ladder applies. */
  public int getDestination(int position) {
    return jumpMap.getOrDefault(position, position);
  }

  public boolean isFinalCell(int position) { return position == size; }
  public int size() { return size; }
}`,
        },
        {
          type: 'markdown',
          value: '### Player and the turn loop',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Player.java',
          code: `public class Player {
  private final String id;
  private final String name;
  private int currentPosition = 0; // 0 = not yet on the board

  public Player(String id, String name) {
    this.id = id;
    this.name = name;
  }

  public int getCurrentPosition() { return currentPosition; }
  public void setCurrentPosition(int position) { this.currentPosition = position; }
  public String getName() { return name; }
  public String getId() { return id; }
}

public record MoveResult(
    Player player, int diceValue, int positionBefore, int positionAfter, boolean wonGame) {}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Game.java',
          highlightLines: [22, 23, 24, 25, 26, 27],
          code: `public class Game {
  private final Board board;
  private final Dice dice;
  private final Deque<Player> turnQueue = new ArrayDeque<>();
  private GameStatus status = GameStatus.NOT_STARTED;
  private Player winner;

  public Game(Board board, Dice dice, List<Player> players) {
    if (players.size() < 2) throw new IllegalArgumentException("Need at least 2 players");
    this.board = board;
    this.dice = dice;
    this.turnQueue.addAll(players);
  }

  public void start() {
    status = GameStatus.IN_PROGRESS;
  }

  public MoveResult playTurn() {
    if (status != GameStatus.IN_PROGRESS) {
      throw new IllegalStateException("Game is not in progress");
    }
    Player player = turnQueue.pollFirst();
    int positionBefore = player.getCurrentPosition();
    int roll = dice.roll();
    int tentative = positionBefore + roll;

    int positionAfter;
    if (tentative > board.size()) {
      positionAfter = positionBefore; // overshoot: forfeit the move
    } else {
      positionAfter = board.getDestination(tentative); // resolves snake/ladder in one step
    }
    player.setCurrentPosition(positionAfter);

    boolean wonGame = board.isFinalCell(positionAfter);
    if (wonGame) {
      status = GameStatus.FINISHED;
      winner = player;
    } else {
      turnQueue.addLast(player); // back of the queue for the next round
    }

    return new MoveResult(player, roll, positionBefore, positionAfter, wonGame);
  }

  public GameStatus getStatus() { return status; }
  public Player getWinner() { return winner; }
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Why `getDestination` is called at most once per turn',
          body: 'The turn loop calls `board.getDestination(tentative)` **exactly once** after moving. This is a deliberate design decision to avoid chained jumps (e.g., landing on a ladder top that happens to also be a snake head) unless the specific rule variant explicitly requires it. Calling it out shows you considered the edge case rather than stumbling into it.',
        },
      ],
    },
    {
      id: 'extensions',
      title: 'Extensions and Follow-Ups',
      blocks: [
        {
          type: 'markdown',
          value: 'Once the core loop works, interviewers often probe how far the design stretches.',
        },
        {
          type: 'table',
          headers: ['Extension', 'Design impact'],
          rows: [
            ['Multiple dice / extra roll on a 6', '`Game` calls `dice.roll()` N times per turn (or loops while the result is 6); `Dice` interface itself does not change'],
            ['Configurable board size and custom snake/ladder sets', 'Already supported via the `Board` constructor + `BoardBuilder` validation; just parameterize at setup time'],
            ['More than 2 players / spectators', 'The `Deque<Player>` turn queue already generalizes to N players; spectators are simply excluded from the queue'],
            ['Concurrent games (server hosting many rooms)', 'Each `Game` instance is independent and holds no static/shared state — instantiate one per room/session, keyed by a `gameId` in a `GameManager`'],
            ['Networked/turn-based online play', '`Game.playTurn()` sits behind an API/WebSocket handler; the domain model is unchanged, only the transport and per-request auth (whose turn is it, really?) are added'],
            ['Save / resume a game', 'Serialize `Board` config, `turnQueue` order, and each `Player.currentPosition` — deterministic enough to reconstruct exactly'],
            ['Leaderboard / stats', 'Layer an `Observer` that listens for `MoveResult`/game-end events and records wins, average rolls, etc., without touching `Game` internals'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The through-line',
          body: 'Every extension reuses an existing seam: `Dice` for roll behavior, `Board`/`BoardBuilder` for layout, the `Deque<Player>` for turn order, and `MoveResult` as an event other components can observe. That is what "designed for extension" looks like in practice, not just in theory.',
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
              question: 'How do you model snakes and ladders so that lookups are fast?',
              answer:
                'Merge both into a single `Map<Integer, Integer> jumpMap` at board setup: every snake head and ladder bottom is a key, its tail/top is the value. Movement then costs one `getOrDefault()` lookup — O(1) — instead of scanning two separate lists every turn.',
            },
            {
              question: 'How would you support a "loaded" or cheating dice without changing `Game`?',
              answer:
                'Make `Dice` an interface with a single `roll()` method. `FairDice` returns a uniform `1..faces` value; `LoadedDice` returns from a weighted outcome array. `Game` depends only on the `Dice` interface, so swapping implementations (even at runtime) requires zero changes to the turn loop — textbook Strategy pattern.',
            },
            {
              question: 'What validation should board setup perform, and why?',
              answer:
                'Reject snakes/ladders that: point outside the board range, start on cell 1 or the final cell (would trivialize or break the game), or share a start cell with another snake/ladder (ambiguous jump target). Doing this once at construction time (e.g., via a `BoardBuilder`) prevents subtle bugs from surfacing mid-game.',
            },
            {
              question: 'How do you handle a dice roll that would overshoot the last cell?',
              answer:
                'The common house rule — and the safest default absent other instructions — is to **forfeit the move**: if `position + roll > boardSize`, the player stays where they are and the turn passes on. State this assumption explicitly, since some rule variants instead "bounce back" from the final cell.',
            },
            {
              question: 'Should `Game` be a Singleton?',
              answer:
                'Usually **no**. A Singleton would mean only one game can ever run per process, which breaks the moment you need multiple concurrent games (e.g., a server hosting many rooms). Prefer a `GameManager` that holds a `Map<GameId, Game>`, each `Game` being an ordinary, independently constructed object.',
            },
            {
              question: 'Can a player land on a cell that is simultaneously a ladder top and another snake\u2019s head?',
              answer:
                'That depends on how you build the `jumpMap` and how many times you apply it per turn. The safe, most common design applies **at most one** jump per turn — call `getDestination()` once after the raw dice move, and do not loop it, unless the rules explicitly require chaining.',
            },
            {
              question: 'How would you extend this to more than one dice, or an "extra roll on 6" rule?',
              answer:
                'Keep `Dice.roll()` returning a single value, and let `Game.playTurn()` decide how many times to call it (e.g., sum two calls for two dice, or loop while the result is 6 for an extra-turn rule). The dice abstraction itself does not need to change — only the orchestration in `Game`.',
            },
            {
              question: 'How would you support many concurrent games on a server?',
              answer:
                'Each `Game` instance already encapsulates its own `Board`, `Dice`, and player turn queue with no static state. A `GameManager` (or a simple `Map<String, Game>` keyed by room/session id) can host arbitrarily many independent games; no changes are needed inside `Game` itself.',
            },
            {
              question: 'How would you unit test the turn loop deterministically, given dice are random?',
              answer:
                'Inject a **fake `Dice`** (e.g., one that returns a fixed sequence of values) via the constructor — this is exactly why `Dice` is an interface rather than a static `Random` call inside `Game`. Tests can then assert exact position transitions, snake bites, and win conditions without flakiness.',
            },
            {
              question: 'Why keep `Snake`/`Ladder` as separate types instead of just storing the merged jump map?',
              answer:
                'The merged `jumpMap` is an optimization for the **hot path** (every roll). Keeping `Snake` and `Ladder` as distinct value objects preserves semantic information needed for **setup validation, rendering, and analytics** (e.g., "how many times was this specific snake hit?") that would be lost if you only ever stored `Integer -> Integer` pairs.',
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
          body: '1. Model the board as a **linear track (1..N)**, not a grid — the grid is purely a rendering concern.\n2. Merge snakes and ladders into one **O(1) `jumpMap`** built and validated once at setup.\n3. Make **`Dice` a Strategy** so fair vs. loaded dice (or multi-dice rules) never touch `Game` logic.\n4. Handle **overshoot** and **single-jump-per-turn** as explicit, named decisions — not accidents.\n5. Avoid Singleton for `Game`; design each game as an independent instance so a server can host many concurrently.',
        },
      ],
    },
  ],
};

export default content;
