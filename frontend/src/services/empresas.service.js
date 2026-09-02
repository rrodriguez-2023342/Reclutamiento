import api from './api.js'

// Obtener todas las empresas
export const getEmpresas = async (params = {}) => {
    const { data } = await api.get('/empresas', { params })
    return data.data
}

// Obtener una empresa por su ID
export const getEmpresaById = async (id) => {
    const { data } = await api.get(`/empresas/${id}`)
    return data.data
}

// Crear una nueva empresa
export const createEmpresa = async (empresa) => {
    const { data } = await api.post('/empresas', empresa)
    return data.data
}

// Actualizar una empresa existente
export const updateEmpresa = async (id, empresa) => {
    const { data } = await api.put(`/empresas/${id}`, empresa)
    return data.data
}

// Desactivar una empresa
export const desactivarEmpresa = async (id) => {
    const { data } = await api.patch(`/empresas/${id}/desactivar`)
    return data
}

// Activar una empresa
export const activarEmpresa = async (id) => {
    const { data } = await api.patch(`/empresas/${id}/activar`)
    return data
}
