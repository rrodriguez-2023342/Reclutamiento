import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import roleRoutes from './routes/role.routes.js'
import authRoutes from './routes/auth.routes.js'
import postulantesRoutes from './routes/postulantes.route.js'
import dashboardRoutes from './routes/dashboard.route.js'

const app = express()

app.use(helmet())
// Permite que el frontend (en otro puerto) haga peticiones al backend.
app.use(cors({ origin: 'http://localhost:5173' }))
// Permite que Express entienda JSON en el body de las peticiones
app.use(express.json())

// RUTAS PÚBLICAS
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/roles', roleRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/postulantes', postulantesRoutes)
app.use('/api/dashboard', dashboardRoutes)

// MANEJO DE ERRORES
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' })
})

app.use((err, req, res, next) => {
  console.error(err)
  // Si el error trae un código (err.status) se usa; si no, 500.
  const status = Number.isInteger(err.status) ? err.status : 500
  res.status(status).json({
    status: 'error',
    message: status >= 500 ? 'Error interno del servidor' : err.message,
  })
})

export default app
