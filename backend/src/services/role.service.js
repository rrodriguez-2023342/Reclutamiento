import prisma from '../config/prisma.js' 

class RoleService {
  // Devuelve todos los roles ordenados por id ascendente
  getAll() {
    return prisma.role.findMany({ orderBy: { id: 'asc' } })
  }

  // Devuelve un rol por su id. Si no existe, devuelve null
  getById(id) {
    return prisma.role.findUnique({ where: { id } })
  }

  // Crea un nuevo rol con los datos enviados.
  create(data) {
    return prisma.role.create({ data })
  }

  // Actualiza un rol existente con los datos enviados.
  update(id, data) {
    return prisma.role.update({ where: { id }, data })
  }

  // Elimina un rol por su id.
  delete(id) {
    return prisma.role.delete({ where: { id } })
  }
}

// Singleton
export const roleService = new RoleService()