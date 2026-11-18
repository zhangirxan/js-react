import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext.jsx'
import { registerServiceWorker } from './services/pwa.js'
import App from './App.jsx'
import './styles/base.css'
import './styles/layout.css'
import './styles/pages.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // data is "fresh" for 1 minute, no new request in that time
      gcTime: 5 * 60 * 1000, // unused data is removed from the cache after 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => !error.offline && !error.notFound && failureCount < 1,
      // send the request even offline: the service worker may answer it from its cache
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'always',
    },
  },
})

registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
