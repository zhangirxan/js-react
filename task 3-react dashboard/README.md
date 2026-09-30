# Task 3 — Rendering and State

**Squad Board** — a football squad dashboard made with React + Vite.

Live: https://zhangirxan.github.io/js-react/task3/

## Run

```bash
npm install
npm run dev
```

Deploy: `npm run deploy` (goes to the `task3/` folder of the `gh-pages` branch, next to task 2).

## Components

| Component | State | What it does |
|---|---|---|
| `App` | `players`, filters, sort, `reversed`, `versions`, `useIndexKeys` | parent, owns the list and all handlers |
| `Header` | — | squad stats, derived from `players` |
| `AddPlayerForm` | `form`, `error` | form inputs, calls `onAdd` |
| `Toolbar` | — | filter chips, position filter, sort, reverse, reset all |
| `PlayerList` | — | renders cards with `.map()` and keys |
| `PlayerCard` | `goals`, `note`, `expanded` | one player, its own local state |
| `StatusBadge` | — | coloured status label |

## What the app can do

- **Add / remove** players — form on the left, `Remove` on a card.
- **Change status** — select on a card (Available / Injured / Suspended). This is parent state.
- **Local state** — training goals counter, coach note and Details toggle live inside each `PlayerCard`.
- **Filter** by status and position, **sort** by number / rating / name, **reverse** the list.
- **Reset** one card (`Reset card`) or all of them (`Reset all cards`).
- Every component logs `[render] ...` to the console.

## Keys, state preservation and reset

Each card gets `key={`${player.id}-${version}`}`.

- **Preservation.** The key is based on the player's id, not the position in the list. When the list
  is filtered or reversed, React matches cards by key, so Messi's goals and note stay with Messi.
- **Intentional reset.** `Reset card` bumps that player's `version`. The key changes, React sees
  it as a different component, unmounts the old card and mounts a new one with fresh `useState` values.
- **index as key** checkbox shows the bug: with `key={index}` React matches cards by position.
  Add goals to a card and reverse — the goals stay at the same position and now belong to another player.
  (Turning the checkbox on already remounts all cards, because every key changes.)

## Re-renders (check the console)

- Changing a card's local state (goals, note) → only **that** `PlayerCard` re-renders.
- Changing parent state (filter, status, add/remove) → `App` and all its children re-render.
- Typing in the form → only `AddPlayerForm` re-renders, because the input state lives there.

StrictMode is turned off in `main.jsx`, otherwise in dev every render is logged twice.

No Redux, Context or `useEffect`, only `useState` and props.
