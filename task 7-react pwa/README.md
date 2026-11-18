# Task 7 — Progressive Web App

AutoMarket (tasks 5–6) turned into an installable PWA that works offline and on phones.

Live: https://zhangirxan.github.io/js-react/task7/

Everything from the previous homeworks still works: routes, filters in the URL, pagination,
dashboard, lazy pages, Firebase login (email + Google), protected routes, TanStack Query cache.

## Run

```bash
npm install
cp .env.example .env.local   # Firebase keys, see task 6
npm run dev                  # development, no service worker here
npm run build && npm run preview   # production build with the service worker
npm run deploy               # publish to the task7/ folder of gh-pages
```

## 1. Manifest and installation

- `public/manifest.json`: name, short_name, start_url, scope, `display: "standalone"`, theme and background colors.
- Icons 192×192 and 512×512 (normal and maskable) in `public/icons/`, plus an Apple touch icon.
- Linked in `index.html` with `<link rel="manifest">`. With HTTPS + manifest + service worker the browser
  shows the "Install app" button.

## 2. Service worker (`sw/sw.js`, written by hand)

- **install** — saves the app shell into `automarket-shell-<version>`: `index.html`, `offline.html`,
  all built JS/CSS from `assets/`, icons and the manifest.
- **activate** — deletes every `automarket-*` cache that is not used by the current version, then takes control.
- **fetch** — chooses a strategy for each request (below).

The file list and the version are added during the build by a small plugin in `vite.config.js`:
it lists the files in `dist/` and makes the version from a hash of them. Every change in the app = new version =
new shell cache, the old one is removed on activation, so nobody has to clear the browser storage.

**Updates.** The new worker does not activate by itself. `src/services/pwa.js` notices it
(`updatefound` → state `installed`) and the app shows *"A new version of AutoMarket is available — Update now"*.
The button sends `SKIP_WAITING` to the worker, it activates, `controllerchange` fires and the page reloads once
with the new files. The app also checks for updates every 30 minutes.

## 3. Runtime caching

| What | Strategy | Cache | Limit |
|---|---|---|---|
| Pages (navigation) | network first → saved `index.html` → `offline.html` | shell | — |
| `api/cars.json`, `api/cars/<id>.json` | **network first** (4 s timeout) → saved answer | `automarket-api-v1` | 60 answers |
| Car photos, fonts | **cache first** → network | `automarket-images-v1` | 80 files |
| JS / CSS / icons | cache first (precached) | shell | — |

- Public data is real HTTP now: `scripts/build-api.mjs` writes the 120 cars to `public/api/` and GitHub Pages
  serves them. Cars you publish or remove are kept in your browser on top of that.
- When the API answer comes from the cache, the worker adds `X-From-Cache: 1` and the date it was saved.
  The page then shows *"Offline copy. You are viewing data saved on …"*.
- If a car page was never opened, offline it is taken from the saved list, so every car from a visited list works.
- Old entries are deleted when a cache gets over its limit.
- **Not cached:** anything that is not GET and every request to Firebase / Google login hosts
  (`identitytoolkit`, `securetoken`, `apis.google.com`, `accounts.google.com`). Tokens and user data never
  go to the shared caches.
- A failed request never crashes the app: the API returns a 503 answer, the pages show error / offline
  states, and an error boundary catches pages that can't be loaded.

## 4. Offline

- `#/offline` page with a message, **Retry connection** button and links to the saved catalog.
  Pages redirect there when they need data that was never saved.
- `public/offline.html` is precached and shown by the worker if even the app itself can't be opened.
- **Online / Offline** indicator in the navbar. It does not only trust `navigator.onLine`: every API request
  reports if it really reached the server (`services/connectivity.js`).
- When the connection is back, all car data is reloaded (`useRefreshWhenOnline`) and Retry returns to the page
  the user wanted.

## 5. Mobile

- Works from 320 px wide, portrait and landscape, no horizontal scroll.
- Navbar turns into a ☰ menu under 900 px, it closes after choosing a page.
- Buttons and inputs are at least 44 px high on touch screens, inputs use 16 px text (no zoom on iPhone).
- Cards, filters, forms, details, dashboard and the profile switch to one column on narrow screens.

## How to test

1. Open the live site, browse the catalog and a few cars.
2. DevTools → Application → Service workers / Cache storage — three `automarket-*` caches.
3. DevTools → Network → **Offline**, reload: the catalog, opened cars and dashboard still work and show the
   "Offline copy" note, the navbar says Offline. Data that was never loaded (for example the dashboard on a
   brand new visit) opens the `/offline` page.
4. Turn the network back on → Online, the data refreshes.
