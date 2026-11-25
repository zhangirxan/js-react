# Task 8 — Redux Toolkit

AutoMarket (tasks 5–7) moved to **Redux Toolkit** for server data and global state.

Live: https://zhangirxan.github.io/js-react/task8/

Everything from the previous homeworks still works: routes, filters / sorting / pagination in the URL,
search (now with a 400 ms debounce), dashboard, lazy pages, Firebase login (email + Google), protected routes,
create / delete listings, PWA install, service worker caching and offline mode.

TanStack Query from task 6 was removed — Redux is now the only place where server data is stored, so the same
data is not kept twice.

## Run

```bash
npm install
cp .env.example .env.local   # Firebase keys
npm run dev
npm run build && npm run preview   # with the service worker
npm run deploy                     # publish to the task8/ folder of gh-pages
```

## Where things are

```
src/
├── store/
│   ├── index.js            configureStore
│   ├── catalogSlice.js     car lists (catalog, home, profile, "More BMW")
│   ├── carDetailsSlice.js  one car by id
│   ├── dashboardSlice.js   all cars + statistics selectors
│   ├── listingsSlice.js    create / delete (mutations)
│   ├── networkSlice.js     online / offline, new app version
│   └── shared.js           dataInvalidated action, "fresh" check, error helper
├── hooks/                  useCarList, useCar, useAllCars, useCreateCar, useDeleteCar, useNetworkWatcher, useDebounce
├── services/               API (service.js), Firebase, service worker registration
├── context/AuthContext.jsx login state (kept in Context, not Redux)
└── pages/, components/     UI — they use the hooks and useSelector / useDispatch
```

`<Provider store={store}>` wraps the app in `main.jsx`.

## Slices

| Slice | State | Why it is global |
|---|---|---|
| `catalog` | `lists[queryString] = { data, status, error, fetchedAt, stale, requestId }`, `version` | lists are shared by the catalog, home page, profile and similar cars |
| `carDetails` | `byId[id] = { data, status, error, ... }`, `version` | a car opened once is shown instantly next time |
| `dashboard` | `data` (all cars), `status`, `error`, ... | statistics are calculated from it with selectors |
| `listings` | `createStatus`, `createError`, `deletingId`, `deleteError` | status of the create / delete operations |
| `network` | `online`, `updateReady` | shown in the navbar and banner on every page |

**Kept outside Redux on purpose:** the logged in user (`AuthContext`, Firebase already keeps it), form inputs,
the delete confirmation, the toast message, the open phone menu — temporary UI state lives in its component.
Filters live in the URL (`useSearchParams`), not in Redux, so links can be shared.

## Thunks (`createAsyncThunk`)

| Thunk | What it does |
|---|---|
| `fetchCars({ queryString })` | list with search, filters, sorting, pagination |
| `fetchCarById({ id })` | details of one car |
| `fetchAllCars()` | all cars for the dashboard |
| `createCar(data)` | publish a car (mutation) |
| `deleteCar(id)` | remove a car (mutation) |

Every thunk is handled with `pending` / `fulfilled` / `rejected` in `extraReducers`.

- **No unnecessary requests.** `condition` skips the request if the same list / car was loaded less than a minute
  ago and nothing changed (`isFresh` in `shared.js`). Going back to a page shows it instantly.
- **Stale requests.** The hooks call `request.abort()` in the effect cleanup when the filters change or the page
  closes, and the `AbortSignal` cancels the fetch. On top of that the reducer saves the `requestId` in `pending`
  and ignores a `fulfilled` / `rejected` whose `requestId` is not the latest one.
- **Errors.** Errors are turned into plain objects with `rejectWithValue({ message, notFound, offline })`.
  Pages show "not found", the offline page, or an error with a **Try again** button (`refetch` dispatches the
  thunk with `force: true`).
- **Refresh after mutations.** `catalog`, `carDetails` and `dashboard` listen to `createCar.fulfilled` and
  `deleteCar.fulfilled`: they mark their data as stale and increase `version`. The hooks have `version` in their
  effect dependencies, so every visible list loads again. A deleted car is also removed from `carDetails`.
  The same happens with `dataInvalidated` when the connection comes back.
- `network` listens to all fetch thunks with `addMatcher`: an answer from the service worker cache
  (`fromCache`) or an offline error sets `online: false`, a real server answer sets `online: true`.

## Selectors

| Selector | Type |
|---|---|
| `selectCarList(state, queryString)` | plain |
| `selectCarEntry(state, id)` | plain |
| `selectIsOnline`, `selectUpdateReady`, `selectListingsState` | plain |
| `selectDashboardCars(state, make, city)` | **`createSelector`** — cars of the chosen make and city |
| `selectDashboardStats(state, make, city)` | **`createSelector`** — count, averages, cheapest, most expensive, breakdowns |
| `selectSimilarCars(state, queryString, currentId)` | **`createSelector`** — "More BMW" without the current car |

The memoized selectors return the same result while their inputs don't change, so the dashboard numbers are not
recalculated (and components are not re-rendered) on every Redux update. Changing the Make / City filter on the
dashboard recalculates the statistics without any new request.

## PWA and offline (from task 7)

Hand-written service worker in `sw/sw.js`: app shell precache, cache-first for images, network-first for
`api/*.json`, versioned caches, "Update now" banner, `/offline` page. Public data comes from static JSON files
in `public/api/` (generated by `npm run api`).
