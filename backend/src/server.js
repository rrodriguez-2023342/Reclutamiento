import 'dotenv/config'
import fs from 'node:fs'
import app from './app.js'

const PORT = process.env.PORT || 4000

fs.mkdirSync('uploads', { recursive: true })

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Status del servidor en  http://localhost:${PORT}/api/health`)
})
