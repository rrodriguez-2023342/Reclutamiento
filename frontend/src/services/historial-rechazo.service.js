import api from "./api.js";

// Obtener el historial de rechazos de un postulante
export const getHistorialRechazo = async (postulanteId, params = {}) => {
  const { data } = await api.get("/historial-rechazo", {
    params: { postulante_id: postulanteId, ...params },
  });
  return data.data;
};