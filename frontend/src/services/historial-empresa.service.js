import api from "./api.js";

// Obtener historial de empresas de un usuario
export const getHistorialEmpresa = async (usuarioId, params = {}) => {
    const { data } = await api.get("/historial-empresa", {
        params: { usuario_id: usuarioId, ...params },
    });
    return data.data;
};