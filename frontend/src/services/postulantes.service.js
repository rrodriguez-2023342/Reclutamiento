import api from "./api.js";

// Obtener lista de postulantes
export const getPostulantes = async (params) => {
  const { data } = await api.get("/postulantes", { params });
  return data.data;
};

// Crear un nuevo postulante
export const createPostulante = async (postulante) => {
  const { data } = await api.post("/postulantes", postulante);
  return data.data;
};

// Obtener postulante por ID
export const getPostulanteById = async (id) => {
  const { data } = await api.get(`/postulantes/${id}`);
  return data.data;
};

// Actualizar postulante por ID
export const updatePostulante = async (id, postulante) => {
  const { data } = await api.put(`/postulantes/${id}`, postulante);
  return data.data;
};

// Actualizar estado del postulante por ID
export const updateEstadoPostulante = async (id, estado) => {
  const { data } = await api.patch(`/postulantes/${id}/estado`, { estado });
  return data.data;
};
