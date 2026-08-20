import 'dotenv/config' 
import fs from 'node:fs'
import app from './app.js'
import { seedRoles, seedDefaultAdmin } from './config/seed.js'

const PORT = process.env.PORT || 4000

// Crea la carpeta "uploads" si todavía no existe.
fs.mkdirSync('uploads', { recursive: true })

// Ejecuta los seeds para inicializar la base de datos con datos por defecto
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