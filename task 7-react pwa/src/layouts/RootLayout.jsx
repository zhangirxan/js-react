import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'
import Toast from '../components/Toast.jsx'
import UpdateBanner from '../components/UpdateBanner.jsx'
import PageErrorBoundary from '../components/PageErrorBoundary.jsx'
import { Loader } from '../components/StatusView.jsx'
import useOnlineStatus from '../hooks/useOnlineStatus.js'
import { useRefreshWhenOnline } from '../hooks/useCars.js'

export default function RootLayout() {
  const location = useLocation()
  const [notice, setNotice] = useState('')
  const online = useOnlineStatus()
  useRefreshWhenOnline(online)

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
      <UpdateBanner />

      <main className="container">
        {/* key: after moving to another page the error message is cleared */}
        <PageErrorBoundary key={location.pathname}>
          <Suspense fallback={<Loader text="Loading page…" />}>
            {/* pages can call showNotice('...') through useOutletContext() */}
            <Outlet context={{ showNotice: setNotice }} />
          </Suspense>
        </PageErrorBoundary>
      </main>

      <footer className="footer">AutoMarket · React homework 7 · works offline</footer>

      {notice && <Toast text={notice} onClose={() => setNotice('')} />}
    </>
  )
}
