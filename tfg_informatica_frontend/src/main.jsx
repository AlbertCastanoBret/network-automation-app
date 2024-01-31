import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/app/App.jsx'
import './styles/styles.css'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <App></App>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
)
