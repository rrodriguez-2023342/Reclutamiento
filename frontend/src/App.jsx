import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import AppRouter from './routes/AppRouter.jsx'
import ErrorBoundary from './components/layout/ErrorBoundary.jsx'

// Solo carga el estado de autenticación y el router.
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App