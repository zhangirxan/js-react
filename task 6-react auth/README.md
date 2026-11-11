# Task 6 — Server Data, Caching & Firebase Authentication

AutoMarket from task 5 (React Router) with Firebase login and cached server data.

Live: https://zhangirxan.github.io/js-react/task6/

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the Firebase keys
npm run dev
```

`.env.local` is in `.gitignore`, only `.env.example` is committed.
Vite only exposes variables that start with `VITE_`, they are read in `src/services/firebase.js`.

In the Firebase console: **Authentication → Sign-in method** → enable *Email/Password* and *Google*,
and add `zhangirxan.github.io` in **Authentication → Settings → Authorized domains**.

Deploy: `npm run deploy` (builds with the keys from `.env.local` and publishes to the `task6/` folder of `gh-pages`).

## Authentication

| File | What it does |
|---|---|
| `services/firebase.js` | `initializeApp`, `getAuth`, Google provider, `browserLocalPersistence` |
| `services/authService.js` | `signUp`, `logIn`, `logInWithGoogle`, `logOut`, readable error messages |
| `context/AuthContext.jsx` | `AuthProvider` + `useAuth()`, listens to `onAuthStateChanged` |
| `components/ProtectedRoute.jsx` | waits for the session check, sends guests to `/login` |

- **Session after refresh.** Firebase keeps the session in the browser (`browserLocalPersistence`).
  On start `onAuthStateChanged` reads it; until then `loading` is `true`, so protected pages show
  "Checking your session…" instead of kicking the user out.
- **Protected routes:** `/profile` and `/cars/new`. A guest is redirected to `/login`, the wanted page is kept
  in `location.state.from` and the user is sent back there after logging in.
- **NavBar** shows *Log in / Sign up* for guests and *Profile / Log out* for logged in users.
- `/signup` checks the email format, password length (6+) and that both passwords match.
- `/profile` shows the email, UID, sign-in method, dates and the user's own listings.

## Caching strategy (TanStack Query)

All server data goes through hooks in `src/hooks/useCars.js`. Components never call the API or `localStorage`.

**Query keys**

| Key | Data |
|---|---|
| `['cars', 'list', { make: 'BMW', page: '2', ... }]` | one page of the catalog — every filter combination is cached separately |
| `['cars', 'detail', 5]` | one car |
| `['cars', 'everything']` | all cars for the dashboard |
| `['cars', 'list', { owner: uid }]` | "My listings" on the profile |

**When data is reused and when it is refreshed**

- `staleTime: 1 minute` — for one minute a cached result is "fresh": going back to a page you already saw shows it
  instantly and **no request is sent**.
- After a minute the data is "stale": it is still shown immediately, and React Query refetches it in the
  background the next time the page is opened.
- `gcTime: 5 minutes` — results that no page uses are deleted from the cache after 5 minutes.
- `placeholderData: keepPreviousData` — while the next catalog page loads, the previous one stays on screen.

**Invalidation**

- After **creating** a car (`useCreateCar`) → `invalidateQueries(['cars'])`: every list, the dashboard and
  "My listings" are marked stale and refetched, so the new car appears everywhere.
- After **deleting** a car (`useDeleteCar`) → the car's detail entry is removed from the cache and
  `invalidateQueries(['cars'])` refetches the lists and statistics.

**Outdated requests.** Each filter combination has its own key, so an old response can only fill its own cache
entry, never the page the user is looking at now. The `signal` from React Query is passed to the API, so the
previous request is cancelled when the filters change.

## Everything from task 5 still works

Routes, nested layout, filters in the URL, pagination, sorting, details with Back / All cars,
dashboard, lazy-loaded pages and the 404 page. Open with `?fail=1` to see the error states.
