import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import { updateAvailable } from './store/networkSlice.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { registerServiceWorker } from './services/pwa.js'
import App from './App.jsx'
import './styles/base.css'
import './styles/layout.css'
import './styles/pages.css'

registerServiceWorker({
  onUpdateReady: () => store.dispatch(updateAvailable()),
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </Provider>
  </StrictMode>
)
