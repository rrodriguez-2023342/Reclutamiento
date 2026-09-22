import api from "./api.js";

// Obtener historial de sueldo de un usuario
export const getHistorialSueldo = async (usuarioId, params = {}) => {
    const { data } = await api.get("/historial-sueldo", {
        params: { usuario_id: usuarioId, ...params },
    });
    return data.data;
};
