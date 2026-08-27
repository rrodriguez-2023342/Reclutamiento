import api from "./api.js";

// Obtener lista de plazas
export const getPlazas = async (params) => {
  const { data } = await api.get("/plazas", { params });
  return data.data;
};

// Obtener plaza por ID
export const getPlazaById = async (id) => {
  const { data } = await api.get(`/plazas/${id}`);
  return data.data;
};

// Crear una nueva plaza
export const createPlaza = async (plaza) => {
  const { data } = await api.post("/plazas", plaza);
  return data.data;
};

// Actualizar plaza por ID
export const updatePlaza = async (id, plaza) => {
  const { data } = await api.put(`/plazas/${id}`, plaza);
  return data.data;
};

// Eliminar plaza por ID
export const deletePlaza = async (id) => {
  const { data } = await api.delete(`/plazas/${id}`);
  return data;
};
