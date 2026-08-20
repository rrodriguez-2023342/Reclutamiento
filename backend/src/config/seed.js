import prisma from './prisma.js'
import { ADMIN_ROLE, ALLOWED_ROLES } from './roles.constant.js'
import { hashPassword } from '../utils/password.utils.js'

export const seedRoles = async () => {
  for (const nombre of ALLOWED_ROLES) {
    await prisma.role.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    })
  }
  console.log(`Roles asegurados: ${ALLOWED_ROLES.join(', ')}`)
}

export const seedDefaultAdmin = async () => {
  const adminRole = await prisma.role.findUnique({ where: { nombre: ADMIN_ROLE } })
  if (!adminRole) throw new Error(`Rol ${ADMIN_ROLE} no encontrado al crear admin`)

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminNombre = process.env.ADMIN_NOMBRE

  if (!adminEmail || !adminPassword || !adminNombre) {
    throw new Error('Faltan ADMIN_EMAIL, ADMIN_PASSWORD o ADMIN_NOMBRE en el .env')
  }

  const hashed = await hashPassword(adminPassword)

  await prisma.usuario.upsert({
    where: { correo: adminEmail },
    update: { rol_id: adminRole.id, activo: true },
    create: {
      nombre: adminNombre,
      correo: adminEmail,
      password: hashed,
      rol_id: adminRole.id,
      activo: true,
    },
  })

  console.log(`Admin por defecto asegurado: ${adminEmail}`)
}