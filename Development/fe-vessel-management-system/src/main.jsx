import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { AuthProvider } from './providers/AuthProvider.jsx'
import { ToastProvider } from './components/feedback/ToastProvider.jsx'
import { ConfirmProvider } from './components/feedback/ConfirmProvider.jsx'
import { router } from './routes/index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>,
)
