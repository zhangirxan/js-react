import { useSearchParams } from 'react-router-dom'
import useCars from '../hooks/useCars.js'
import SearchBar from '../components/SearchBar.jsx'
import Filters from '../components/Filters.jsx'
import SortSelect from '../components/SortSelect.jsx'
import CarCard from '../components/CarCard.jsx'
import Pagination from '../components/Pagination.jsx'
import { EmptyState, ErrorState, Loader } from '../components/StatusView.jsx'

export default function CarsPage() {
  // all filters live in the URL: /cars?make=BMW&sort=price-asc&page=2
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    search: searchParams.get('search') || '',
    make: searchParams.get('make') || '',
    body: searchParams.get('body') || '',
    fuel: searchParams.get('fuel') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    yearFrom: searchParams.get('yearFrom') || '',
  }
  const sort = searchParams.get('sort') || 'newest'

  const { data, status, error, reload } = useCars(searchParams.toString())

  function changeParam(name, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)

    // new filter -> start from the first page
    if (name !== 'page') next.delete('page')

    setSearchParams(next)
  }

  function changePage(page) {
    changeParam('page', page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetFilters() {
    setSearchParams({})
  }

  const loading = status === 'loading'

  let content
  if (status === 'error') {
    content = <ErrorState message={error} onRetry={reload} />
  } else if (!data) {
    content = <Loader text="Loading listings…" />
  } else if (data.total === 0) {
    content = (
      <EmptyState title="No cars found" text="Try another search or remove some filters.">
        <button type="button" className="btn primary" onClick={resetFilters}>Reset filters</button>
      </EmptyState>
    )
  } else {
    content = (
      <>
        <div className={loading ? 'grid is-loading' : 'grid'}>
          {data.items.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
        <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} disabled={loading} />
      </>
    )
  }

  let summary = ''
  if (data && data.total > 0 && status !== 'error') {
    const from = (data.page - 1) * data.pageSize + 1
    const to = from + data.items.length - 1
    summary = `Showing ${from}–${to} of ${data.total} cars`
  }

  return (
    <div className="catalog">
      <section className="hero">
        <h1>Find your next car</h1>
        <p>Used and new cars from private sellers across Kazakhstan.</p>
        {/* key: when the search in the URL changes (Back button, reset) the input gets the new value */}
        <SearchBar key={filters.search} value={filters.search} onSearch={(text) => changeParam('search', text)} />
      </section>

      <Filters values={filters} onChange={changeParam} onReset={resetFilters} />

      <div className="results-bar">
        <p className="muted">
          {summary}
          {loading && data && <span className="inline-spinner" />}
        </p>
        <SortSelect value={sort} onChange={(value) => changeParam('sort', value === 'newest' ? '' : value)} />
      </div>

      {content}
    </div>
  )
}
