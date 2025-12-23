import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import './App.css'
import "/node_modules/bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
createRoot(document.getElementById('root')).render(
  <AuthProvider>
 <BrowserRouter>
    <App />
  </BrowserRouter>
  </AuthProvider>
)
