import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import Routers from './Routers.jsx' // Ensure you are using the Routers component

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <Router>
      <Routers />
    </Router>
  </React.StrictMode>
)
