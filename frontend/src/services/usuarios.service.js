import api from './api.js'

// Obtener todos los usuarios
export const getUsuarios = async (params = {}) => {
    const { data } = await api.get('/usuarios', { params })
    return data.data
}

// Obtener un usuario por ID
export const getUsuarioById = async (id) => {
    const { data } = await api.get(`/usuarios/${id}`)
    return data.data
}

// Crear un nuevo usuario
export const createUsuario = async (usuario) => {
    const { data } = await api.post('/usuarios', usuario)
    return data.data
}

// Actulizar un usuario por su ID
export const updateUsuario = async (id, usuario) => {
    const { data } = await api.put(`/usuarios/${id}`, usuario)
    return data.data
}

// Desactivar un usuario
export const desactivarUsuario = async (id) => {
    const { data } = await api.patch(`/usuarios/${id}/desactivar`)
    return data
}

// Activar un usuario
export const activarUsuario = async (id) => {
    const { data } = await api.patch(`/usuarios/${id}/activar`)
    return data
}

// Resetear la contrasela de un usuario
export const resetPasswordUsuario = async (id) => {
    const { data } = await api.post(`/usuarios/${id}/reset-password`)
    return data
}

// Obtener todos los roles
export const getRoles = async () => {
    const { data } = await api.get('/roles')
    return data.data
}

// Obtener todas las empresas (para selects)
export const getEmpresas = async () => {
    const { data } = await api.get('/empresas', { params: { limit: 100 } })
    return data.data?.data || []
}

// Obtener todos los patronos (para selects)
export const getPatronos = async () => {
    const { data } = await api.get('/patronos', { params: { limit: 100 } })
    return data.data?.data || []
}
