import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client.ts'

// Guardamos el cliente de Prisma en globalThis para evitar múltiples instancias
const globalForPrisma = globalThis

// Crea el cliente si todavía no existe, o reutiliza el que ya está guardado.
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL),
  })

// Guardamos la instancia en globalThis para que se pueda reutilizar 
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma