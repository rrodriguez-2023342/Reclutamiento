import api from './api.js'

// Obtener todos los patronos
export const getPatronos = async (params = {}) => {
    const { data } = await api.get('/patronos', { params })
    return data.data
}

// Obtener un patrono por su ID
export const getPatronoById = async (id) => {
    const { data } = await api.get(`/patronos/${id}`)
    return data.data
}

// Crear un nuevo patrono
export const createPatrono = async (patrono) => {
    const { data } = await api.post('/patronos', patrono)
    return data.data
}

// Actualizar un patrono existente
export const updatePatrono = async (id, patrono) => {
    const { data } = await api.put(`/patronos/${id}`, patrono)
    return data.data
}

// Desactivar un patrono
export const desactivarPatrono = async (id) => {
    const { data } = await api.patch(`/patronos/${id}/desactivar`)
    return data
}

// Activar un patrono
export const activarPatrono = async (id) => {
    const { data } = await api.patch(`/patronos/${id}/activar`)
    return data
}
