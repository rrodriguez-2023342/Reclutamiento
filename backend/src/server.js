import 'dotenv/config' 
import fs from 'node:fs'
import app from './app.js'
import { seedRoles, seedDefaultAdmin } from './config/seed.js'

const PORT = process.env.PORT || 4000

// Crea las carpetas de uploads si todavía no existen.
fs.mkdirSync('uploads', { recursive: true })
fs.mkdirSync('uploads/postulantes', { recursive: true })

// Ejecuta solo los seeds necesarios para la app: roles y usuario administrador.
try {
  await seedRoles() // Asegura que existan los roles por defecto
  await seedDefaultAdmin() // Asegura que exista el usuario administrador por defecto
} catch (err) {
  console.error('Error ejecutando seeds:', err)
  process.exit(1)
}

// Inicia el servidor Express
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Status del servidor en  http://localhost:${PORT}/api/health`)
})