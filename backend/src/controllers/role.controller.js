import { roleService } from '../services/role.service.js'

export const getRoles = async (req, res) => {
  const roles = await roleService.getAll()
  res.json({ status: 'ok', data: roles })
}

export const getRoleById = async (req, res) => {
  const { id } = req.params
  const role = await roleService.getById(Number(id))
  if (!role) {
    return res.status(404).json({ status: 'error', message: 'Rol no encontrado' })
  }
  res.json({ status: 'ok', data: role })
}

export const createRole = async (req, res) => {
  const role = await roleService.create(req.body)
  res.status(201).json({ status: 'ok', data: role })
}

export const updateRole = async (req, res) => {
  const { id } = req.params
  const role = await roleService.update(Number(id), req.body)
  res.json({ status: 'ok', data: role })
}

export const deleteRole = async (req, res) => {
  const { id } = req.params
  await roleService.delete(Number(id))
  res.json({ status: 'ok', message: 'Rol eliminado' })
}