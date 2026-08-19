import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor',
  })
})

export default app
