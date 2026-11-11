import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'
import Toast from '../components/Toast.jsx'
import { Loader } from '../components/StatusView.jsx'

export default function RootLayout() {
  const location = useLocation()
  const [notice, setNotice] = useState('')

  // new page -> scroll to the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  return (
    <>
      <NavBar />

      <main className="container">
        <Suspense fallback={<Loader text="Loading page…" />}>
          {/* pages can call showNotice('...') through useOutletContext() */}
          <Outlet context={{ showNotice: setNotice }} />
        </Suspense>
      </main>

      <footer className="footer">AutoMarket · React homework 6 · listings are stored in your browser</footer>

      {notice && <Toast text={notice} onClose={() => setNotice('')} />}
    </>
  )
}
