# Low Level Design Catalog

A backlog of classic LLD interview problems under the **Low Level Design** section (`section: 'low-level-design'`). Mark items `[x]` when a page is published.

## How to use this file

1. Pick a problem from the list.
2. Scaffold: `npm run new:design -- <slug> "Title"` from `frontend/`, then set **`section: 'low-level-design'`** in `*.meta.ts`.
3. Check off the problem here when published.

**Entry format:** title, one-line description, suggested `slug`.

---

## Classic Systems

- [x] **Parking Lot** — Multi-floor parking with spot types, tickets, and fee strategies. `slug: parking-lot`
- [x] **Elevator System** — Multi-elevator scheduling, requests, and door/state machines. `slug: elevator-system`
- [x] **ATM System** — Card auth, cash dispensing, PIN, and transaction flows. `slug: atm-system`
- [x] **Library Management** — Books, members, borrow/return, fines, and search. `slug: library-management`
- [x] **Cab Booking** — Riders, drivers, matching, trip lifecycle, and pricing. `slug: cab-booking`

## Games & Simulations

- [x] **Chess Game** — Board, pieces, moves, check/checkmate, and turn rules. `slug: chess-game`
- [x] **Snake and Ladder** — Board, dice, players, snakes/ladders, and win conditions. `slug: snake-and-ladder`

## Data Structures

- [x] **LRU Cache** — O(1) get/put with HashMap + doubly linked list. `slug: lru-cache-lld`

## Marketplace

- [x] **Movie Ticket Booking** — Shows, seats, locking, booking, and payments. `slug: movie-ticket-booking`
- [x] **Splitwise** — Groups, expenses, balances, and settle-up algorithms. `slug: splitwise`
