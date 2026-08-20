import prisma from '../config/prisma.js'

class RoleService {
  getAll() {
    return prisma.role.findMany({ orderBy: { id: 'asc' } })
  }

  getById(id) {
    return prisma.role.findUnique({ where: { id } })
  }

  create(data) {
    return prisma.role.create({ data })
  }

  update(id, data) {
    return prisma.role.update({ where: { id }, data })
  }

  delete(id) {
    return prisma.role.delete({ where: { id } })
  }
}

export const roleService = new RoleService()