import { roleService } from '../services/role.service.js'

// Devuelve todos los roles existentes
export const getRoles = async (req, res) => {
  const roles = await roleService.getAll()
  res.json({ status: 'ok', data: roles })
}

// Devuelve un rol por su id 
export const getRoleById = async (req, res) => {
  const { id } = req.params 
  const role = await roleService.getById(Number(id))

  // Comprobamos si el rol existe, si no existe devolvemos un 404 Not Found
  if (!role) {
    return res.status(404).json({ status: 'error', message: 'Rol no encontrado' })
  }
  res.json({ status: 'ok', data: role })
}

// Crea un nuevo rol
export const createRole = async (req, res) => {
  const role = await roleService.create(req.body)
  res.status(201).json({ status: 'ok', data: role })
}

// Edita un rol existente
export const updateRole = async (req, res) => {
  const { id } = req.params
  const role = await roleService.update(Number(id), req.body)
  res.json({ status: 'ok', data: role })
}

// Elimina un rol existente
export const deleteRole = async (req, res) => {
  const { id } = req.params
  await roleService.delete(Number(id))
  res.json({ status: 'ok', message: 'Rol eliminado' })
}