# Task 5 — Routing & Application Architecture

My midterm project AutoMarket (car marketplace) moved to React Router.

Live: https://zhangirxan.github.io/js-react/task5/

## Routes

| Route | Page | Lazy |
|---|---|---|
| `/` | Home: intro, photo, links, latest cars from the API | |
| `/about` | About the project and me | ✔ |
| `/cars` | Cars list: search, 5 filters, sorting, pagination | |
| `/cars/:id` | Car details | ✔ |
| `/cars/new` | Sell a car (form from the midterm) | ✔ |
| `/dashboard` | Statistics and breakdowns | ✔ |
| `/login` | Login placeholder | ✔ |
| `*` | 404 page | ✔ |

All routes are nested inside `RootLayout` (NavBar + `<Outlet />` + footer).
`App.jsx` only describes the routes.

The app uses `HashRouter` (URLs look like `/#/cars/5`). GitHub Pages can't send every path to
`index.html`, so with normal URLs a refresh on `/cars/5` would give a GitHub 404. With the hash
direct links, refresh and Back / Forward all work.

## Folders

```
src/
├── App.jsx              routes only
├── main.jsx             HashRouter + styles
├── layouts/RootLayout.jsx
├── pages/               one file per route
├── components/          NavBar, CarCard, Filters, Pagination, StatCard, Breakdown, ...
├── hooks/               useCars (list), useCar (one car)
├── services/service.js  all API requests
├── services/seed.js     120 initial cars
├── utils/format.js
└── styles/              base.css, layout.css, pages.css
```

## Data

`services/service.js` works like a REST API: every function waits 350–1000 ms and returns a Promise,
data is kept in `localStorage`. Search, filters, sorting and pagination are done there.
Open the site with `?fail=1` (https://zhangirxan.github.io/js-react/task5/?fail=1#/cars) to see the error states.

## How the main parts work

- **Filters in the URL.** `CarsPage` reads everything from `useSearchParams` and writes changes back with
  `setSearchParams`. So `/cars?make=BMW&sort=price-asc&page=2` can be shared, refreshed, and Back / Forward
  goes through the filter history. A new filter resets the page to 1.
- **Stale requests.** `useCars` and `useCar` cancel the previous request with `AbortController` when the
  query or id changes, so an old answer never replaces a newer one.
- **Details.** `useParams` gives the id. `/cars/abc` shows "Invalid listing link" without calling the API,
  `/cars/9999` shows "Listing not found". The page is rendered with `key={id}`, so opening another car
  starts with a clean state. Back goes to the previous page, or to `/cars` if the page was opened by a direct link.
- **Dashboard.** Loads all cars and calculates 6 numbers (count, average price, mileage and year,
  cheapest and most expensive) and breakdowns by fuel, body type and make. The Make and City filters change all
  of them and are kept in the URL. Every row links to the matching cars.
- **Lazy loading.** 6 pages use `React.lazy`, `<Suspense>` in `RootLayout` shows a loader while a page loads.
- **Notifications.** `RootLayout` passes `showNotice` to pages with `<Outlet context>`, pages read it
  with `useOutletContext()`.

## Run

```bash
npm install
npm run dev
```

Deploy: `npm run deploy` (goes to the `task5/` folder of the `gh-pages` branch).
