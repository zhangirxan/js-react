import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// no StrictMode on purpose: in dev it renders everything twice,
// which makes the console.log render tracking confusing
createRoot(document.getElementById('root')).render(<App />)
