import { useEffect, useState } from 'react'
import { createItem, deleteItem, getItem, getItemsList, updateItem } from './api/fakeApi.js'
import { PAGE_SIZE } from './constants.js'
import Header from './components/Header.jsx'
import Toolbar from './components/Toolbar.jsx'
import CrewList from './components/CrewList.jsx'
import Pagination from './components/Pagination.jsx'
import DetailsPanel from './components/DetailsPanel.jsx'
import CrewForm from './components/CrewForm.jsx'
import Notice from './components/Notice.jsx'

export default function App() {
  const [query, setQuery] = useState({ search: '', sort: 'name', page: 1 })
  const [list, setList] = useState({ status: 'loading', items: [], total: 0, totalPages: 1, error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  const [selectedId, setSelectedId] = useState(null)
  const [details, setDetails] = useState({ id: null, status: 'idle', item: null, error: '' })
  const [detailsReloadKey, setDetailsReloadKey] = useState(0)

  // id -> action in progress
  const [pending, setPending] = useState({})
  const [form, setForm] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    let ignore = false
    setList((prev) => ({ ...prev, status: 'loading', error: '' }))

    const params = new URLSearchParams({
      search: query.search,
      sort: query.sort,
      page: query.page,
      limit: PAGE_SIZE,
    })

    getItemsList(`?${params}`)
      .then((res) => {
        if (ignore) return
        setList({ status: 'success', items: res.data, total: res.total, totalPages: res.totalPages, error: '' })
      })
      .catch((err) => {
        if (ignore) return
        setList((prev) => ({ ...prev, status: 'error', error: err.message }))
      })

    return () => {
      ignore = true
    }
  }, [query, reloadKey])

  useEffect(() => {
    if (selectedId === null) return
    let ignore = false
    setDetails({ id: selectedId, status: 'loading', item: null, error: '' })

    getItem(selectedId)
      .then((item) => {
        if (!ignore) setDetails({ id: selectedId, status: 'success', item, error: '' })
      })
      .catch((err) => {
        if (!ignore) setDetails({ id: selectedId, status: 'error', item: null, error: err.message })
      })

    return () => {
      ignore = true
    }
  }, [selectedId, detailsReloadKey])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  function showNotice(text, type = 'success') {
    setNotice({ id: Date.now(), text, type })
  }

  function startPending(id, label) {
    setPending((prev) => ({ ...prev, [id]: label }))
  }

  function stopPending(id) {
    setPending((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function applyUpdate(updated) {
    setList((prev) => ({ ...prev, items: prev.items.map((m) => (m.id === updated.id ? updated : m)) }))
    setDetails((prev) => (prev.item?.id === updated.id ? { ...prev, item: updated } : prev))
  }

  function changeQuery(changes) {
    setQuery((prev) => ({ ...prev, page: 1, ...changes }))
  }

  async function handleMission(member) {
    const id = member.id
    if (pending[id]) return

    const ACTIONS = {
      available: { changes: { status: 'on-mission' }, label: 'Launching…', done: 'went on a mission' },
      'on-mission': {
        changes: { status: 'available', missions: (member.missions ?? 0) + 1 },
        label: 'Returning…',
        done: 'is back from the mission',
      },
      injured: { changes: { status: 'available' }, label: 'Updating…', done: 'is back on duty' },
    }
    const action = ACTIONS[member.status] ?? ACTIONS.available

    startPending(id, action.label)
    try {
      const updated = await updateItem(id, action.changes)
      applyUpdate(updated)
      showNotice(`${updated.name} ${action.done}`)
    } catch (err) {
      showNotice(`${member.name}: ${err.message}`, 'error')
    } finally {
      stopPending(id)
    }
  }

  async function handleDelete(member) {
    const id = member.id
    if (pending[id]) return

    startPending(id, 'Removing…')
    try {
      await deleteItem(id)
      setSelectedId((current) => (current === id ? null : current))
      setReloadKey((k) => k + 1)
      showNotice(`${member.name} was removed from the crew`)
    } catch (err) {
      showNotice(`${member.name}: ${err.message}`, 'error')
    } finally {
      stopPending(id)
    }
  }

  async function handleSave(values) {
    if (form.mode === 'edit') {
      const id = form.member.id
      startPending(id, 'Saving…')
      try {
        const updated = await updateItem(id, values)
        applyUpdate(updated)
        setForm(null)
        showNotice(`${updated.name} was updated`)
      } finally {
        stopPending(id)
      }
      return
    }

    const { name, description, ...extra } = values
    const created = await createItem({ name, description })

    // createItem saves only name and description
    setForm(null)
    setReloadKey((k) => k + 1)
    setSelectedId(created.id)
    startPending(created.id, 'Saving…')
    try {
      const full = await updateItem(created.id, {
        ...extra,
        status: 'available',
        missions: 0,
        joined: new Date().toISOString().slice(0, 10),
      })
      applyUpdate(full)
      showNotice(`${full.name} joined the crew`)
    } catch {
      showNotice(`${name} was added, but some details were not saved. Use Edit to add them.`, 'error')
    } finally {
      stopPending(created.id)
    }
  }

  const formMember = form?.mode === 'edit' ? form.member : null

  return (
    <div className="app">
      <Header total={list.total} />

      <div className={`layout ${selectedId !== null ? 'has-selection' : ''}`}>
        <section className="list-column">
          <Toolbar
            search={query.search}
            sort={query.sort}
            onSearch={(search) => changeQuery({ search })}
            onSort={(sort) => changeQuery({ sort })}
            onReload={() => setReloadKey((k) => k + 1)}
            onCreate={() => setForm({ mode: 'create' })}
            loading={list.status === 'loading'}
          />

          <CrewList
            state={list}
            search={query.search}
            selectedId={selectedId}
            pending={pending}
            onSelect={setSelectedId}
            onRetry={() => setReloadKey((k) => k + 1)}
          />

          {list.status !== 'error' && (
            <Pagination
              page={query.page}
              totalPages={list.totalPages}
              disabled={list.status === 'loading'}
              onChange={(page) => setQuery((prev) => ({ ...prev, page }))}
            />
          )}
        </section>

        <DetailsPanel
          key={selectedId}
          selectedId={selectedId}
          state={details}
          pending={selectedId !== null ? pending[selectedId] : undefined}
          onClose={() => setSelectedId(null)}
          onRetry={() => setDetailsReloadKey((k) => k + 1)}
          onMission={handleMission}
          onEdit={(member) => setForm({ mode: 'edit', member })}
          onDelete={handleDelete}
        />
      </div>

      {form && (
        <CrewForm
          key={formMember ? formMember.id : 'new'}
          member={formMember}
          onSave={handleSave}
          onCancel={() => setForm(null)}
        />
      )}

      {notice && <Notice notice={notice} onClose={() => setNotice(null)} />}
    </div>
  )
}
