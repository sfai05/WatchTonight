import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log(
  '%c\uD83C\uDFAC WatchTonight',
  'font-size:15px;font-weight:700;color:#ffdca1;background:#0d1321;padding:4px 12px;border-radius:4px;',
  '\n\nFresh picks, every day. Built with taste.'
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
