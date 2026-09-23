import express from 'express'
import multer from 'multer'
import helmet from 'helmet'
import cors from 'cors'
import roleRoutes from './routes/role.routes.js'
import authRoutes from './routes/auth.routes.js'
import usuarioRoutes from './routes/usuario.routes.js'
import postulantesRoutes from './routes/postulantes.route.js'
import plazaRoutes from './routes/plaza.routes.js'
import empresaRoutes from './routes/empresa.routes.js'
import patronoRoutes from './routes/patrono.routes.js'
import dashboardRoutes from './routes/dashboard.route.js'
import documentosRoutes from './routes/documento.routes.js'
import historialSueldoRoutes from './routes/historial-sueldo.routes.js'
import historialEmpresaRoutes from './routes/historial-empresa.routes.js'
import historialRechazoRoutes from './routes/historial-rechazo.routes.js'

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
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/postulantes', postulantesRoutes)
app.use('/api/plazas', plazaRoutes)
app.use('/api/empresas', empresaRoutes)
app.use('/api/patronos', patronoRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/postulantes', documentosRoutes)
app.use('/api/historial-sueldo', historialSueldoRoutes)
app.use('/api/historial-empresa', historialEmpresaRoutes)
app.use('/api/historial-rechazo', historialRechazoRoutes)

// Middleware para errores de Multer (archivo muy grande)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        status: 'error',
        message: 'El archivo excede el límite máximo de 2MB',
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
  next(err);
});

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
