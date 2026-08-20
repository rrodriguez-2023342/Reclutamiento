import 'dotenv/config'
import fs from 'node:fs'
import app from './app.js'
import { seedRoles, seedDefaultAdmin } from './config/seed.js'

const PORT = process.env.PORT || 4000

fs.mkdirSync('uploads', { recursive: true })

try {
  await seedRoles()
  await seedDefaultAdmin()
} catch (err) {
  console.error('Error ejecutando seeds:', err)
  process.exit(1)
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Status del servidor en  http://localhost:${PORT}/api/health`)
})
