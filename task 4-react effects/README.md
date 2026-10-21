# Task 4 — Effects & API

Crew Control: a list of spaceship crew members with details, create / edit / remove
and a "send on mission" action.

Live: https://zhangirxan.github.io/js-react/task4/

Uses the starter fake API from https://github.com/leravanna/fake-api (`src/api/fakeApi.js` is not changed).
Requests take 0.5–3 s and fail in about 5% of cases (`src/api/settings.js`), data is stored in `localStorage`.
Components never touch `localStorage` directly.

## What is where

- `App.jsx` — list query, list state, selected id, details state, pending actions, all API calls
- `components/Toolbar.jsx` — search, sort, Reload, New member
- `components/CrewList.jsx` — table + loading / error / empty states
- `components/DetailsPanel.jsx` — details of the selected member and actions
- `components/CrewForm.jsx` — controlled form for create and edit
- `components/Pagination.jsx`, `StatusBadge.jsx`, `StateMessage.jsx`, `Notice.jsx`

Each member has 12 fields: name, role, rank, callsign, home planet, age, ship, status,
missions, joined, skills, bio. The list shows 4 of them, the rest is loaded with `getItem(id)`
when a member is selected.

## Effects

| Effect | Dependencies | Cleanup |
|---|---|---|
| load list | `[query, reloadKey]` | `ignore = true` |
| load details | `[selectedId, detailsReloadKey]` | `ignore = true` |
| hide notice after 4 s | `[notice]` | `clearTimeout` |

`reloadKey` / `detailsReloadKey` are numbers. Reload and "Try again" just increase them, so the effect runs again.

## Race conditions

The fake API can't cancel requests, so every effect has a local `ignore` flag.
When the dependency changes, cleanup sets `ignore = true` for the old request and its result is thrown away.
Click several members quickly: only the last one is shown. Same for typing in the search box.

The details state also stores the `id` it belongs to, and the panel only shows data whose `id`
equals `selectedId`, so there is no frame with the previous member's details.

## Stale closures

`handleMission`, `handleDelete` and edit save the member id in a local `const id` before `await`.
After the response:

- the list and the details are updated with functional `setState` and matched by `id`,
  so the response goes to the right member even if another one is selected now;
- details are replaced only if the panel still shows that same member.

`pending` keeps `{ [id]: 'Launching…' }`. While a member has a pending action, all buttons for
that member are disabled, so two conflicting requests can't start.

## Run

```bash
npm install
npm run dev
```

Deploy: `npm run deploy` (goes to the `task4/` folder of the `gh-pages` branch).
