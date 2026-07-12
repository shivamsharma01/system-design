import { DesignContent } from '../../../shared/models';
import { CHESS_GAME_META } from './chess-game.meta';

/**
 * Design a Chess Game — full LLD walkthrough: entities, class design, move
 * validation, check/checkmate/stalemate detection, patterns, and interview Q&A.
 */
const content: DesignContent = {
  meta: CHESS_GAME_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Designing a **Chess Game** is a classic Low-Level Design interview because it forces you to reason about a **rich class hierarchy** (six piece types, each with different movement rules), **stateful validation** (you cannot move into check), and a **turn-based engine** that must stay extensible (castling, en passant, promotion, undo, AI opponents). It rewards clean **polymorphism** over giant `switch` statements.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'What interviewers are really testing',
          body: 'Not chess rules trivia. They want to see whether you can (1) model an **is-a** hierarchy correctly with `Piece` as the abstract base, (2) keep `Board` and `Game` responsibilities separate, (3) validate moves **without duplicating logic** per piece, and (4) design so that new rules (castling, promotion) do not require rewriting the core loop.',
        },
        {
          type: 'table',
          caption: 'Chess LLD at a glance.',
          headers: ['Aspect', 'Decision'],
          rows: [
            ['Board representation', '8x8 grid of `Cell`, each optionally holding a `Piece`'],
            ['Piece movement', 'Abstract `Piece.canMove()` overridden per subclass (polymorphism)'],
            ['Shared movement logic', 'Strategy objects for sliding (linear/diagonal) vs fixed-shape moves'],
            ['Turn management', '`Game` alternates `currentTurn` between two `Player`s'],
            ['Check safety', 'Every candidate move is simulated; reject if it exposes own King'],
            ['Piece creation', '`PieceFactory` centralizes `new Piece(...)` for setup and promotion'],
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
            'Before writing a single class, an interview-strength candidate scopes the problem. Chess has enormous surface area (official FIDE rules run for pages) — asking questions signals maturity and prevents you from over- or under-building.',
        },
        {
          type: 'bestPractices',
          title: 'Questions worth asking',
          practices: [
            '**Is this two human players on one device, or do we need networked/online play?** Changes whether `Game` needs to expose an API vs. just an in-memory loop.',
            '**Do we need special moves** — castling, en passant, pawn promotion — or just basic legal moves for each piece type?',
            '**Do we need full draw detection** (threefold repetition, 50-move rule, insufficient material) or just checkmate/stalemate?',
            '**Is a move clock / timer required** (blitz-style games), or is time unbounded?',
            '**Do we need to support undo/redo** or move history export (PGN)?',
            '**Is an AI opponent in scope**, or is this purely a two-human-player engine?',
            '**Console/API-only, or do we also design the UI layer?** Most interviews want the domain model, not rendering.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Suggested scope for a 45-minute round',
          body: 'Agree on: two local players, all six piece types with **standard moves + captures**, check/checkmate/stalemate detection, and basic move history. Treat **castling, en passant, promotion, draw rules, timers, and AI** as extensions you *mention* and design for, but implement only if time allows.',
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
            ['FR1', 'Initialize an 8x8 board with standard starting positions for both colors'],
            ['FR2', 'Each piece type enforces its own legal-move rules (King, Queen, Rook, Bishop, Knight, Pawn)'],
            ['FR3', 'Players alternate turns; a player can only move their own pieces on their turn'],
            ['FR4', 'A move that captures an opponent piece removes it from the board'],
            ['FR5', 'A move that would leave the mover\u2019s own King in check is illegal and must be rejected'],
            ['FR6', 'Detect **check** (King attacked), **checkmate** (check + no legal escape), and **stalemate** (no check, no legal move)'],
            ['FR7', 'Maintain a move history sufficient to support undo and post-game review'],
            ['FR8', 'Support pawn promotion, castling, and en passant as extensions to the core move pipeline'],
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
            ['NFR1', 'Move validation should be fast: bounded by the number of pieces on the board, not brute-force board scans'],
            ['NFR2', 'Extensible: adding a new special rule should not require editing every `Piece` subclass'],
            ['NFR3', 'Testable: `Piece`, `Board`, and `Game` should be unit-testable in isolation (no static/global game state)'],
            ['NFR4', 'Thread-safe enough for a single game session; concurrent games should not share mutable state'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Out of scope (call this out explicitly)',
          body: 'Full FIDE tournament rules (touch-move, draw offers/adjudication), matchmaking, ELO rating, and rendering/animation are explicitly out of scope for the core LLD — mention them as future extensions instead of designing them live.',
        },
      ],
    },
    {
      id: 'entities',
      title: 'Core Entities',
      blocks: [
        {
          type: 'markdown',
          value:
            'Identify nouns from the requirements and turn each into a class or enum with a single, clear responsibility.',
        },
        {
          type: 'table',
          headers: ['Entity', 'Responsibility'],
          rows: [
            ['`Color`', 'Enum: `WHITE`, `BLACK`'],
            ['`Position` / `Cell`', '`Position` = (row, col) coordinate; `Cell` = a board square that optionally holds one `Piece`'],
            ['`Piece` (abstract)', 'Base type for all pieces; holds `color`, `captured` flag; declares `canMove()` / `getPossibleMoves()`'],
            ['`King`, `Queen`, `Rook`, `Bishop`, `Knight`, `Pawn`', 'Concrete pieces, each with its own movement rule'],
            ['`Board`', 'Owns the 8x8 grid of `Cell`s; knows how to place, move, and query pieces; checks path-clear for sliding pieces'],
            ['`Move`', 'Value object: `from`, `to`, `movedPiece`, `capturedPiece` (nullable), `MoveType` (NORMAL, CASTLE, EN_PASSANT, PROMOTION)'],
            ['`Player`', 'A participant: `name`, `color`'],
            ['`Game`', 'Orchestrator: owns `Board`, two `Player`s, `currentTurn`, `moveHistory`, and `GameStatus`'],
            ['`PieceFactory`', 'Centralizes piece construction for board setup and pawn promotion'],
            ['`GameStatus`', 'Enum: `IN_PROGRESS`, `CHECK`, `CHECKMATE`, `STALEMATE`, `DRAW`'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Cell vs. Position',
          body: 'Keep them distinct: `Position` is a **pure coordinate value object** (immutable, easy to pass around and compare). `Cell` is a **board slot** that holds a `Position` plus the current occupant, if any. Conflating the two makes the board grid harder to reason about.',
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
            '`Piece` is the abstract root of an **is-a** hierarchy. `Game` composes `Board` and `Player`s. `PieceFactory` decouples piece *construction* from `Board`/`Game` logic.',
        },
        {
          type: 'mermaid',
          caption: 'Chess domain model.',
          definition: `classDiagram
  class Color {
    <<enumeration>>
    WHITE
    BLACK
  }
  class Position {
    +int row
    +int col
    +equals(Position) boolean
  }
  class Cell {
    -Position position
    -Piece piece
    +isEmpty() boolean
    +setPiece(Piece) void
  }
  class Piece {
    <<abstract>>
    -Color color
    -boolean captured
    +canMove(Board, Position from, Position to) boolean
    +getPossibleMoves(Board, Position from) List~Position~
  }
  class King
  class Queen
  class Rook
  class Bishop
  class Knight
  class Pawn
  Piece <|-- King
  Piece <|-- Queen
  Piece <|-- Rook
  Piece <|-- Bishop
  Piece <|-- Knight
  Piece <|-- Pawn
  class MoveStrategy {
    <<interface>>
    +getReachableCells(Board, Position, Color) List~Position~
  }
  class LinearMoveStrategy
  class DiagonalMoveStrategy
  class LShapedMoveStrategy
  MoveStrategy <|.. LinearMoveStrategy
  MoveStrategy <|.. DiagonalMoveStrategy
  MoveStrategy <|.. LShapedMoveStrategy
  Piece o-- MoveStrategy
  class Board {
    -Cell[][] cells
    +getCell(Position) Cell
    +applyMove(Move) void
    +isPathClear(Position from, Position to) boolean
    +findKing(Color) Position
  }
  class MoveType {
    <<enumeration>>
    NORMAL
    CASTLE
    EN_PASSANT
    PROMOTION
  }
  class Move {
    -Position from
    -Position to
    -Piece movedPiece
    -Piece capturedPiece
    -MoveType type
  }
  class Player {
    -String name
    -Color color
  }
  class GameStatus {
    <<enumeration>>
    IN_PROGRESS
    CHECK
    CHECKMATE
    STALEMATE
    DRAW
  }
  class Game {
    -Board board
    -Player[2] players
    -Player currentTurn
    -List~Move~ moveHistory
    -GameStatus status
    +start() void
    +makeMove(Position from, Position to) boolean
    +isKingInCheck(Color) boolean
    +isCheckmate(Color) boolean
    +isStalemate(Color) boolean
  }
  class PieceFactory {
    +createPiece(PieceType, Color) Piece
  }
  Game "1" *-- "1" Board
  Game "1" *-- "2" Player
  Game "1" *-- "*" Move : history
  Board "1" *-- "64" Cell
  Cell "1" o-- "0..1" Piece
  PieceFactory ..> Piece : creates`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Composition over a deeper inheritance tree',
          body: 'Rook, Bishop, and Queen all "slide" until blocked. Rather than duplicating the sliding loop in three subclasses (or forcing an awkward `SlidingPiece` intermediate class), give each `Piece` a `MoveStrategy`. `Rook` composes `LinearMoveStrategy`, `Bishop` composes `DiagonalMoveStrategy`, and `Queen` composes **both**. This is the Strategy pattern doing the heavy lifting — see the Patterns section.',
        },
      ],
    },
    {
      id: 'flows',
      title: 'Key Flows',
      blocks: [
        {
          type: 'markdown',
          value:
            '`Game.makeMove(from, to)` is the single entry point that a UI/API layer calls. It must validate ownership, shape of the move, path-clearing, self-check safety, then apply the move and recompute game status.',
        },
        {
          type: 'mermaid',
          caption: 'Move validation and application pipeline.',
          definition: `flowchart TD
  A[Player calls makeMove(from, to)] --> B{Piece at 'from' belongs to currentTurn?}
  B -- No --> R1[Reject: not your piece / empty cell]
  B -- Yes --> C[piece.getPossibleMoves(board, from)]
  C --> D{'to' in possible moves AND path clear?}
  D -- No --> R2[Reject: illegal move for this piece]
  D -- Yes --> E[Clone board, simulate the move]
  E --> F{Does simulated move leave own King in check?}
  F -- Yes --> R3[Reject: exposes own King to check]
  F -- No --> G[Apply move on real board: relocate piece, capture target if any]
  G --> H[Record Move in moveHistory]
  H --> I{Opponent King in check now?}
  I -- Yes --> J{Opponent has any legal move that escapes check?}
  J -- No --> K[Status = CHECKMATE, current player wins]
  J -- Yes --> L[Status = CHECK, notify opponent]
  I -- No --> M{Opponent has any legal move at all?}
  M -- No --> N[Status = STALEMATE, draw]
  M -- Yes --> O[Status = IN_PROGRESS, switch currentTurn]`,
        },
        {
          type: 'markdown',
          value: '### Check, checkmate, and stalemate detection outline',
        },
        {
          type: 'table',
          headers: ['Status', 'Definition', 'How to detect'],
          rows: [
            ['Check', 'Opposing King is attacked by at least one piece', 'For each of the mover\u2019s pieces, check if the opponent King\u2019s position is a possible move target'],
            ['Checkmate', 'Check is true **and** the checked player has zero legal moves that escape check', 'For every piece of the checked color, simulate every possible move; if none results in `isKingInCheck == false`, it is checkmate'],
            ['Stalemate', 'Check is false but the player to move has zero legal moves', 'Same "simulate every candidate move" scan as checkmate, just entered when the King is not currently attacked'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'The expensive part',
          body: 'Checkmate/stalemate detection requires simulating **every legal move of every remaining piece** for that color and checking if any leaves the King safe. With at most 16 pieces per side and a handful of moves each, this is fast in practice — no need for deep search. Do not confuse this with a chess **engine\u2019s** move search (minimax); that is a different, much larger problem (see Extensions).',
        },
      ],
    },
    {
      id: 'patterns',
      title: 'Design Patterns Applied',
      blocks: [
        {
          type: 'markdown',
          value:
            'Chess is a great vehicle for demonstrating **polymorphism** plus two complementary creational/behavioral patterns.',
        },
        {
          type: 'table',
          caption: 'Where each pattern earns its place.',
          headers: ['Pattern', 'Where', 'Why'],
          rows: [
            ['Polymorphism (abstract method)', '`Piece.canMove()` overridden per subclass', 'Replaces a giant `switch(pieceType)` in `Board`/`Game` with dynamic dispatch — adding a piece type never touches existing code'],
            ['Strategy', '`MoveStrategy` (`LinearMoveStrategy`, `DiagonalMoveStrategy`, `LShapedMoveStrategy`) composed into pieces', 'Rook/Bishop/Queen share sliding logic without inheriting from each other; Queen simply composes two strategies'],
            ['Template Method (alternative)', '`Piece.canMove()` as a template calling `isValidShape()` (abstract) then shared `Board.isPathClear()`', 'A valid alternative to Strategy when you prefer inheritance-based reuse of the "check shape, then check path" skeleton'],
            ['Factory', '`PieceFactory.createPiece(type, color)`', 'Centralizes `new XPiece()` calls for initial board setup **and** pawn promotion — one place to change if piece construction gains dependencies later'],
            ['Command (extension)', '`Move` objects as undoable commands', 'Enables `undo()`/`redo()` by replaying/reversing recorded `Move`s instead of hand-rolling board diffs'],
            ['Observer (extension)', '`Game` notifies listeners on check/checkmate/move', 'Lets a UI, logger, or clock subscribe without `Game` knowing about them'],
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Strategy vs. Template Method for piece moves — pick one, defend it',
          body: '**Strategy** favors composition: a piece *has a* movement behavior object, easy to swap/test in isolation, and naturally supports pieces needing **multiple** behaviors (Queen = linear + diagonal). **Template Method** favors inheritance: `Piece` defines the validation skeleton (`canMove` = check shape \u2192 check path \u2192 check capture rules) and subclasses fill in `isValidShape()`. Either answer is acceptable — what matters is that you avoid duplicating the "is this move geometrically valid" logic six times.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Polymorphism for canMove — the core interview signal',
          body: 'Without polymorphism you get: `if (piece.getType() == KNIGHT) { ... } else if (piece.getType() == BISHOP) { ... }` scattered across `Board` and `Game` — a violation of **Open/Closed Principle**. With `piece.canMove(board, from, to)` as a virtual call, `Game` never needs to know piece-specific rules at all; it just asks the piece.',
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value: '### Enums and value objects',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Color.java',
          code: `public enum Color { WHITE, BLACK }

public enum PieceType { KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN }

public enum MoveType { NORMAL, CASTLE, EN_PASSANT, PROMOTION }

public enum GameStatus { IN_PROGRESS, CHECK, CHECKMATE, STALEMATE, DRAW }`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Position.java',
          code: `public final class Position {
  private final int row;
  private final int col;

  public Position(int row, int col) {
    this.row = row;
    this.col = col;
  }

  public boolean isOnBoard() {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  public int row() { return row; }
  public int col() { return col; }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Position p)) return false;
    return row == p.row && col == p.col;
  }

  @Override
  public int hashCode() { return row * 8 + col; }
}`,
        },
        {
          type: 'markdown',
          value: '### Piece hierarchy with the Strategy-based movement',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'MoveStrategy.java',
          code: `public interface MoveStrategy {
  /** Cells this piece could reach from 'from', ignoring turn/self-check rules. */
  List<Position> getReachableCells(Board board, Position from, Color color);
}

public class LinearMoveStrategy implements MoveStrategy {
  private static final int[][] DIRECTIONS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

  @Override
  public List<Position> getReachableCells(Board board, Position from, Color color) {
    return slideInDirections(board, from, color, DIRECTIONS);
  }

  protected List<Position> slideInDirections(Board board, Position from, Color color, int[][] dirs) {
    List<Position> result = new ArrayList<>();
    for (int[] d : dirs) {
      int r = from.row() + d[0], c = from.col() + d[1];
      while (new Position(r, c).isOnBoard()) {
        Position candidate = new Position(r, c);
        Piece occupant = board.getCell(candidate).getPiece();
        if (occupant == null) {
          result.add(candidate);
        } else {
          if (occupant.getColor() != color) result.add(candidate); // capture
          break; // blocked either way
        }
        r += d[0]; c += d[1];
      }
    }
    return result;
  }
}

public class DiagonalMoveStrategy extends LinearMoveStrategy {
  private static final int[][] DIAGONALS = {{1, 1}, {1, -1}, {-1, 1}, {-1, -1}};

  @Override
  public List<Position> getReachableCells(Board board, Position from, Color color) {
    return slideInDirections(board, from, color, DIAGONALS);
  }
}

public class CompositeMoveStrategy implements MoveStrategy {
  private final List<MoveStrategy> strategies;

  public CompositeMoveStrategy(MoveStrategy... strategies) {
    this.strategies = List.of(strategies);
  }

  @Override
  public List<Position> getReachableCells(Board board, Position from, Color color) {
    List<Position> merged = new ArrayList<>();
    for (MoveStrategy s : strategies) merged.addAll(s.getReachableCells(board, from, color));
    return merged;
  }
}

public class LShapedMoveStrategy implements MoveStrategy {
  private static final int[][] OFFSETS = {
    {2, 1}, {2, -1}, {-2, 1}, {-2, -1}, {1, 2}, {1, -2}, {-1, 2}, {-1, -2}
  };

  @Override
  public List<Position> getReachableCells(Board board, Position from, Color color) {
    List<Position> result = new ArrayList<>();
    for (int[] o : OFFSETS) {
      Position p = new Position(from.row() + o[0], from.col() + o[1]);
      if (!p.isOnBoard()) continue;
      Piece occupant = board.getCell(p).getPiece();
      if (occupant == null || occupant.getColor() != color) result.add(p);
    }
    return result;
  }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Piece.java',
          code: `public abstract class Piece {
  protected final Color color;
  protected boolean captured = false;

  protected Piece(Color color) {
    this.color = color;
  }

  public Color getColor() { return color; }
  public boolean isCaptured() { return captured; }
  public void markCaptured() { this.captured = true; }

  /** Clone for board simulation — never share Piece instances across boards. */
  public abstract Piece copy();

  /** Every piece supplies its own movement strategy (or overrides directly, e.g. Pawn). */
  protected abstract MoveStrategy moveStrategy();

  public List<Position> getPossibleMoves(Board board, Position from) {
    return moveStrategy().getReachableCells(board, from, color);
  }

  public boolean canMove(Board board, Position from, Position to) {
    return getPossibleMoves(board, from).contains(to);
  }
}

public class Rook extends Piece {
  public Rook(Color color) { super(color); }
  @Override protected MoveStrategy moveStrategy() { return new LinearMoveStrategy(); }
  @Override public Piece copy() { Rook r = new Rook(color); r.captured = captured; return r; }
}

public class Bishop extends Piece {
  public Bishop(Color color) { super(color); }
  @Override protected MoveStrategy moveStrategy() { return new DiagonalMoveStrategy(); }
  @Override public Piece copy() { Bishop b = new Bishop(color); b.captured = captured; return b; }
}

public class Queen extends Piece {
  public Queen(Color color) { super(color); }
  @Override protected MoveStrategy moveStrategy() {
    return new CompositeMoveStrategy(new LinearMoveStrategy(), new DiagonalMoveStrategy());
  }
  @Override public Piece copy() { Queen q = new Queen(color); q.captured = captured; return q; }
}

public class Knight extends Piece {
  public Knight(Color color) { super(color); }
  @Override protected MoveStrategy moveStrategy() { return new LShapedMoveStrategy(); }
  @Override public Piece copy() { Knight k = new Knight(color); k.captured = captured; return k; }
}

public class King extends Piece {
  public King(Color color) { super(color); }
  @Override public Piece copy() { King k = new King(color); k.captured = captured; return k; }

  @Override
  protected MoveStrategy moveStrategy() {
    return (board, from, c) -> {
      List<Position> result = new ArrayList<>();
      for (int dr = -1; dr <= 1; dr++) {
        for (int dc = -1; dc <= 1; dc++) {
          if (dr == 0 && dc == 0) continue;
          Position p = new Position(from.row() + dr, from.col() + dc);
          if (!p.isOnBoard()) continue;
          Piece occupant = board.getCell(p).getPiece();
          if (occupant == null || occupant.getColor() != c) result.add(p);
        }
      }
      return result;
      // Castling is layered on top in Board/Game — see Extensions.
    };
  }
}

public class Pawn extends Piece {
  public Pawn(Color color) { super(color); }
  @Override public Piece copy() { Pawn p = new Pawn(color); p.captured = captured; return p; }

  @Override
  protected MoveStrategy moveStrategy() {
    return (board, from, c) -> {
      int direction = (c == Color.WHITE) ? 1 : -1;
      int startRow = (c == Color.WHITE) ? 1 : 6;
      List<Position> result = new ArrayList<>();

      Position oneStep = new Position(from.row() + direction, from.col());
      if (oneStep.isOnBoard() && board.getCell(oneStep).isEmpty()) {
        result.add(oneStep);
        Position twoStep = new Position(from.row() + 2 * direction, from.col());
        if (from.row() == startRow && board.getCell(twoStep).isEmpty()) {
          result.add(twoStep);
        }
      }
      for (int dc : new int[] {-1, 1}) {
        Position diag = new Position(from.row() + direction, from.col() + dc);
        if (!diag.isOnBoard()) continue;
        Piece occupant = board.getCell(diag).getPiece();
        if (occupant != null && occupant.getColor() != c) result.add(diag);
        // En passant handled by Game as a special-case check — see Extensions.
      }
      return result;
    };
  }
}`,
        },
        {
          type: 'markdown',
          value: '### Board and Game orchestration',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Board.java',
          code: `public class Board {
  private final Cell[][] cells = new Cell[8][8];

  public Board() {
    for (int r = 0; r < 8; r++)
      for (int c = 0; c < 8; c++)
        cells[r][c] = new Cell(new Position(r, c));
  }

  public Cell getCell(Position p) { return cells[p.row()][p.col()]; }

  public void placePiece(Piece piece, Position p) { getCell(p).setPiece(piece); }

  public void applyMove(Move move) {
    Piece captured = getCell(move.to()).getPiece();
    if (captured != null) captured.markCaptured();
    getCell(move.to()).setPiece(move.movedPiece());
    getCell(move.from()).setPiece(null);
  }

  public Position findKing(Color color) {
    for (int r = 0; r < 8; r++) {
      for (int c = 0; c < 8; c++) {
        Piece p = cells[r][c].getPiece();
        if (p instanceof King && p.getColor() == color) return new Position(r, c);
      }
    }
    throw new IllegalStateException("King not found for " + color);
  }

  /** Deep copy used to simulate a move before committing it. */
  public Board copy() {
    Board clone = new Board();
    for (int r = 0; r < 8; r++)
      for (int c = 0; c < 8; c++) {
        Piece p = this.cells[r][c].getPiece();
        clone.cells[r][c].setPiece(p == null ? null : p.copy());
      }
    return clone;
  }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'Game.java',
          highlightLines: [17, 18, 19, 20, 21],
          code: `public class Game {
  private final Board board;
  private final Player[] players;
  private Player currentTurn;
  private final List<Move> moveHistory = new ArrayList<>();
  private GameStatus status = GameStatus.IN_PROGRESS;

  public Game(Player white, Player black) {
    this.players = new Player[] { white, black };
    this.board = new Board();
    this.currentTurn = white;
    BoardInitializer.setupStandardPosition(board);
  }

  public boolean makeMove(Position from, Position to) {
    Piece piece = board.getCell(from).getPiece();
    if (piece == null || piece.getColor() != currentTurn.getColor()) return false;
    if (!piece.canMove(board, from, to)) return false;

    Board simulated = board.copy();
    simulated.applyMove(new Move(from, to, piece, simulated.getCell(to).getPiece(), MoveType.NORMAL));
    if (isKingInCheck(simulated, currentTurn.getColor())) return false; // would expose own King

    Move move = new Move(from, to, piece, board.getCell(to).getPiece(), MoveType.NORMAL);
    board.applyMove(move);
    moveHistory.add(move);

    Color opponent = opponentColor();
    boolean opponentInCheck = isKingInCheck(board, opponent);
    boolean opponentHasMove = hasAnyLegalMove(opponent);
    status = !opponentHasMove
        ? (opponentInCheck ? GameStatus.CHECKMATE : GameStatus.STALEMATE)
        : (opponentInCheck ? GameStatus.CHECK : GameStatus.IN_PROGRESS);

    if (status == GameStatus.IN_PROGRESS || status == GameStatus.CHECK) {
      currentTurn = players[currentTurn == players[0] ? 1 : 0];
    }
    return true;
  }

  private boolean isKingInCheck(Board b, Color color) {
    Position kingPos = b.findKing(color);
    for (Position from : allPiecePositions(b, opposite(color))) {
      Piece attacker = b.getCell(from).getPiece();
      if (attacker.canMove(b, from, kingPos)) return true;
    }
    return false;
  }

  private boolean hasAnyLegalMove(Color color) {
    for (Position from : allPiecePositions(board, color)) {
      Piece piece = board.getCell(from).getPiece();
      for (Position to : piece.getPossibleMoves(board, from)) {
        Board simulated = board.copy();
        simulated.applyMove(new Move(from, to, piece, simulated.getCell(to).getPiece(), MoveType.NORMAL));
        if (!isKingInCheck(simulated, color)) return true;
      }
    }
    return false;
  }

  private Color opponentColor() { return opposite(currentTurn.getColor()); }
  private Color opposite(Color c) { return c == Color.WHITE ? Color.BLACK : Color.WHITE; }

  private List<Position> allPiecePositions(Board b, Color color) {
    List<Position> result = new ArrayList<>();
    for (int r = 0; r < 8; r++)
      for (int c = 0; c < 8; c++) {
        Piece p = b.getCell(new Position(r, c)).getPiece();
        if (p != null && !p.isCaptured() && p.getColor() == color) result.add(new Position(r, c));
      }
    return result;
  }

  public GameStatus getStatus() { return status; }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'PieceFactory.java',
          code: `public final class PieceFactory {
  private PieceFactory() {}

  public static Piece createPiece(PieceType type, Color color) {
    return switch (type) {
      case KING -> new King(color);
      case QUEEN -> new Queen(color);
      case ROOK -> new Rook(color);
      case BISHOP -> new Bishop(color);
      case KNIGHT -> new Knight(color);
      case PAWN -> new Pawn(color);
    };
  }
}`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'The `switch` in PieceFactory is fine',
          body: 'This is the **one** place a type-based switch belongs — inside a Factory whose entire job is "given a type, construct the right object." The anti-pattern is a switch on piece type scattered through `Board`/`Game` business logic; this single, centralized switch is exactly where that logic should live.',
        },
      ],
    },
    {
      id: 'extensions',
      title: 'Extensions and Follow-Ups',
      blocks: [
        {
          type: 'markdown',
          value: 'Interviewers love to layer these on once the core design is solid. Show that your design absorbs them without a rewrite.',
        },
        {
          type: 'table',
          headers: ['Extension', 'Design impact'],
          rows: [
            ['Castling', 'Special-cased in `Game`/`Board`: check King/Rook have not moved, squares between are empty and not attacked, then move both pieces atomically as one `Move` of `MoveType.CASTLE`'],
            ['En passant', 'Track the last move; if it was a pawn double-step, allow the adjacent enemy pawn to capture "through" it — encode as `MoveType.EN_PASSANT` with a custom captured-piece position'],
            ['Pawn promotion', 'When a pawn reaches the last rank, `Game` asks for a target `PieceType` and uses `PieceFactory.createPiece()` to replace it — no changes to `Pawn` itself'],
            ['Undo / redo', 'Apply the **Command pattern**: each `Move` knows how to `apply()` and `undo()` on a `Board`; `Game` keeps an undo stack'],
            ['Draw rules (50-move, threefold repetition, insufficient material)', 'Track a rolling hash of board state per move (Zobrist hashing) and a half-move counter since the last capture/pawn move'],
            ['Move/turn timers', 'Attach a `Clock` per `Player`, decremented on their turn; on expiry, `Game` ends with a timeout result — Observer pattern to notify UI'],
            ['AI opponent', 'A `MoveEvaluator` using minimax + alpha-beta pruning over `Board` states; kept as a separate module so human-vs-human logic is untouched'],
            ['Networked multiplayer', '`Game` exposes `makeMove()` behind an API/WebSocket layer; the domain model here does not need to change, only the transport'],
            ['Persistence / replay', 'Serialize `moveHistory` to PGN/FEN-like notation; replaying it reconstructs the board deterministically'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The through-line',
          body: 'Every extension above plugs into an existing seam: `MoveType` for special moves, `PieceFactory` for promotion, `Move` objects for undo/replay, and `Game` as the single orchestration point. That is the payoff of getting the class boundaries right up front.',
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
              question: 'Why use polymorphism for `canMove` instead of a `switch` on piece type?',
              answer:
                'A `switch` in `Board`/`Game` violates **Open/Closed Principle**: every new piece type or rule change means editing that switch. With `piece.canMove(board, from, to)` as a virtual call, `Game` stays ignorant of piece-specific rules — it just asks the piece, and adding a piece type never touches existing callers.',
            },
            {
              question: 'How do you avoid duplicating "slide until blocked" logic across Rook, Bishop, and Queen?',
              answer:
                'Extract it into a **Strategy** (`LinearMoveStrategy`, `DiagonalMoveStrategy`) that pieces compose rather than inherit. `Queen` combines both via a `CompositeMoveStrategy`. This also makes each sliding rule independently unit-testable.',
            },
            {
              question: 'How do you prevent a player from moving into (or leaving their King in) check?',
              answer:
                'After a candidate move passes shape/path validation, **simulate it on a cloned board** and check whether the mover\u2019s own King is attacked in that simulated state. Only commit the move to the real board if the King stays safe. This one simulation step is what most naive designs miss.',
            },
            {
              question: 'How do you detect checkmate efficiently, without a full game-tree search?',
              answer:
                'Checkmate is **not** deep search — it is: for every piece of the checked color, generate its possible moves, simulate each, and check if any results in the King no longer being in check. With at most 16 pieces and a handful of moves each, this is a small, bounded scan, distinct from a chess engine\u2019s minimax search for the *best* move.',
            },
            {
              question: 'What is the difference between check, checkmate, and stalemate in your model?',
              answer:
                '**Check**: King is currently attacked. **Checkmate**: check is true and the player has zero legal moves that escape it (loss). **Stalemate**: check is false but the player has zero legal moves (draw). Both checkmate and stalemate reuse the same "any legal move exists" scan — they differ only in whether `isKingInCheck` was already true.',
            },
            {
              question: 'How would you design castling cleanly without special-casing every piece?',
              answer:
                'Keep `King.canMove()` limited to the normal one-step rule. Handle castling as a **separate check in `Game`/`Board`**: verify King and Rook have not moved, squares between are empty and not attacked, then apply it as a single atomic `Move` with `MoveType.CASTLE` that relocates both pieces. This keeps `King` simple and isolates the special rule.',
            },
            {
              question: 'How would you add pawn promotion without changing the `Pawn` class?',
              answer:
                'Detect promotion in `Game` (pawn reaching the last rank), prompt for a target `PieceType`, and use `PieceFactory.createPiece()` to place the new piece on that cell, discarding the pawn. `Pawn.canMove()` never needs to know promotion exists — it is an orchestration concern.',
            },
            {
              question: 'How would you support undo/redo of moves?',
              answer:
                'Apply the **Command pattern**: each `Move` stores enough information (`from`, `to`, `movedPiece`, `capturedPiece`, `type`) to both `apply()` and `undo()` on a `Board`. `Game` keeps a stack of applied moves; undo pops and reverses the last one, redo re-applies it.',
            },
            {
              question: 'Board vs. Game — why split responsibilities there?',
              answer:
                '`Board` is a **pure data structure**: cells, pieces, path-clearing, King lookup — no notion of turns or players. `Game` is the **orchestrator**: whose turn it is, move history, status, and rule enforcement. This separation keeps `Board` reusable (e.g., for simulation/cloning) and `Game` testable independent of rendering.',
            },
            {
              question: 'How would this design change to support an AI opponent?',
              answer:
                'Add a `MoveEvaluator`/`Strategy` that, given a `Board` and `Color`, searches candidate moves via minimax with alpha-beta pruning and a heuristic evaluation function, then calls the same `Game.makeMove()` entry point a human would use. The human-vs-human core is untouched — the AI is just another caller.',
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
          body: '1. Model pieces as an **abstract `Piece` hierarchy**; let polymorphism replace type-switches.\n2. Use **Strategy** (or Template Method) to share sliding/shape movement logic without duplicating it per piece.\n3. Always **simulate a move before committing** it to catch self-check exposure — this is the crux of correct validation.\n4. Checkmate/stalemate = "does any legal move exist that escapes/avoids check", scanned across the player\u2019s remaining pieces — not a deep search.\n5. Keep `Board` (pure state) and `Game` (orchestration + rules) separate so special rules (castling, promotion, undo) plug in at the `Game`/`Move` seam without touching `Piece` classes.',
        },
      ],
    },
  ],
};

export default content;
